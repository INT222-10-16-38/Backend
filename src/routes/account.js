const router = require("express").Router()
const { account, blacklistToken } = require("../models/model")
const { validateRegister, validateLogin } = require("../helpers/validation")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const upload = require("../middlewares/uploadFile")
const { readFile, deleteFile, dataNotValid } = require("../helpers/file")
const auth = require("../middlewares/auth")
const checkAdmin = require("../middlewares/checkAdmin")
const { calPage, calSkip } = require('../helpers/pagination');

router.get("/", auth, checkAdmin, async (req, res) => {
  let results
  try {
    results = await account.findMany()
  } catch (error) {
    return res.send({ status: "Can't get data", error: error.meta })
  }
  return res.send({ data: results, loginAs: req.account })
})

router.get("/page/:page", async (req, res) => {
  let page = Number(req.params.page)
  let numberOfItem = 20
  let results
  try {
    results = await account.findMany({
      skip: calSkip(page, numberOfItem),
      select: numberOfItem
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  const totalAccount = await account.count()
  return res.send({ data: results, page: page, totalPage: calPage(totalAccount, numberOfItem) })
})

router.get("/:id", async (req, res) => {
  let id = Number(req.params.id)
  let results
  try {
    results = await account.findMany({
      where: {
        ac_id: id
      },
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  if (!results) {
    return res.send({ msg: "Can't find userId" })
  }
})

router.post("/register", upload, async (req, res) => {
  let files = req.files
  let imgFile = []
  let jsonFile = files.find((file) => {
    if (!file.mimetype != "application/json") {
      imgFile.push(file)
    }
    return file.mimetype == "application/json"
  })
  if (!jsonFile) {
    await dataNotValid(files)
    return res.status(500).send({ msg: `Please send jsonData` })
  }
  let accountData = await readFile(jsonFile)
  deleteFile(jsonFile.filename)
  for (const [index, img] of imgFile.entries()) {
    if (img.fieldname == "ac_image") {
      accountData.ac_image = await img.filename
    }
  }
  const { error } = validateRegister(accountData)
  if (error) return res.status(500).send({ err: error.details[0].message })

  // Find with email
  let userExists = await account.findFirst({
    where: {
      OR: [
        { ac_email: accountData.ac_email },
        { ac_username: accountData.ac_username }
      ]
    }
  })
  // Check email if exists throw error
  if (userExists) {
    return res.status(500).send({ msg: "User or email already exists" })
  }
  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(accountData.ac_password, salt)
  accountData.ac_password = hashedPassword

  let result
  try {
    result = await account.create({
      data: accountData
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  delete result.ac_password
  const token = jwt.sign(findedUser, process.env.TOKEN_SECRET)
  return res.send({ status: "Create Account Successfully", token: token, })
})

router.patch("/edit", upload, auth, async (req, res) => {
  let files = req.files
  let imgFile = []
  let jsonFile = files.find((file) => {
    if (!file.mimetype != "application/json") {
      imgFile.push(file)
    }
    return file.mimetype == "application/json"
  })
  if (!jsonFile) {
    await dataNotValid(files)
    return res.status(500).send({ msg: `Please send jsonData` })
  }
  let accountData = await readFile(jsonFile)
  deleteFile(jsonFile.filename)
  accountData.ac_image = req.account.ac_image
  for (const [index, img] of imgFile.entries()) {
    if (img.fieldname == "ac_image") {
      accountData.ac_image = await img.filename
    }
  }
  console.log(accountData)
  const { error } = validateRegister(accountData)
  if (error) return res.status(500).send({ err: error.details[0].message })

  let updateResult
  try {
    updateResult = await account.update({
      data: {
        ac_fname: accountData.ac_fname,
        ac_lname: accountData.ac_lname,
        ac_email: accountData.ac_email,
        ac_image: accountData.ac_image,
        ac_role: accountData.ac_role,
      },
      where: {
        ac_id: req.account.ac_id
      }
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }

  if (updateResult) {
    for (const [index, img] of imgFile.entries()) {
      if (req.account.ac_image != "default_ac_image.png") {
        console.log(index)
        await deleteFile(req.account.ac_image)
      }
    }
  }
  return res.send({ status: "Edit Account Successfully", err: false })
})

router.post("/login", async (req, res) => {
  let body = req.body
  const { error } = validateLogin(body)
  if (error) return res.status(500).send({ err: error.details[0].message })

  let findedUser
  try {
    findedUser = await account.findFirst({
      where: {
        ac_username: body.ac_username
      }
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  if (!findedUser) {
    return res.status(500).send({ msg: "Invalid Username" })
  }
  const validPassword = await bcrypt.compare(body.ac_password, findedUser.ac_password)
  if (!validPassword) {
    return res.status(500).send({ msg: "Invalid Password" })
  }

  delete findedUser.ac_password
  // Create TOKEN
  const token = jwt.sign(findedUser, process.env.TOKEN_SECRET)
  return res.send({ msg: "Login Successfully", token: token })
})

router.delete("/delete/:id", async (req, res) => {
  let id = Number(req.params.id)
  try {
    await account.delete({
      where: {
        ac_id: id
      }
    })
  } catch (err) {
    return res.status(500).send({ err: err.meta.cause })
  }
  return res.send({ msg: "Delete Successfully" })
})

router.post("/logout", auth, async (req, res) => {
  try {
    await blacklistToken.create({
      data: {
        token: req.token
      }
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  return res.send({ msg: "Logout Successfull" })
})

module.exports = router