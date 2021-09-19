const router = require("express").Router()
const { account } = require("../models/model")
const { validateRegister, validateLogin } = require("../helpers/validation")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const upload = require("../middlewares/uploadFile")
const { readFile, deleteFile, dataNotValid } = require("../helpers/file")
const auth = require("../middlewares/auth")

router.get("/", async (req, res) => {
  await account.findMany().then((results) => {
    return res.send({ data: results })
  }).catch((err) => {
    return res.send({ status: "Can't get data", error: err })
  })
})

router.get("/:id", async (req, res) => {
  let id = Number(req.params.id)
  let results = await account.findMany({
    where: {
      ac_id: id
    },
  })
  if (!results) {
    return res.send({ msg: "Can't find userId" })
  }
})

router.put("/edit", upload, auth, async (req, res) => {
  let files = req.files
  let imgFile = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.fieldname == 'ac_image') {
      if (req.account.ac_image != "cover_image.jpg") {
        await deleteFile(req.account.ac_image)
      }
      imgFile.push(file)
    }
    if (file.mimetype == "application/json") {
      let accountData = await readFile(file)
      deleteFile(file.filename)
      accountData.ac_image = req.account.ac_image
      for (const [index, img] of imgFile.entries()) {
        if (img.fieldname == "ac_image") {
          if (req.account.ac_image != "default_ac_image.png") {
            await deleteFile(req.account.ac_image)
          }
          accountData.ac_image = await img.filename
        }
      }
      const { error } = validateRegister(accountData)
      if (error) return res.status(400).send({ err: error.details[0].message })

      await account.update({
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
      return res.send({ status: "Edit Account Successfully", err: false })
    }
  }
  await dataNotValid(files)
  return res.status(400).send({ msg: "Please send data" })
})

router.post("/register", upload, async (req, res) => {
  let files = req.files
  let imgFile = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.fieldname == 'ac_image') {
      imgFile.push(file)
    }
    if (file.mimetype == "application/json") {
      let accountData = await readFile(file)
      deleteFile(file.filename)
      for (const [index, img] of imgFile.entries()) {
        if (img.fieldname == "ac_image") {
          accountData.ac_image = await img.filename
        }
      }
      const { error } = validateRegister(accountData)
      if (error) return res.status(400).send({ err: error.details[0].message })

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
        return res.status(400).send({ msg: "User or email already exists" })
      }
      // Generate salt and hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(accountData.ac_password, salt)
      accountData.ac_password = hashedPassword

      await account.create({
        data: accountData
      })
      return res.send({ status: "Create Account Successfully", err: false })
    }
  }
  await dataNotValid(files)
  return res.status(400).send({ msg: "Please send data" })
})

router.post("/login", async (req, res) => {
  let body = req.body
  const { error } = validateLogin(body)
  if (error) return res.send({ err: error.details[0].message })

  const findedUser = await account.findFirst({
    where: {
      ac_username: body.ac_username
    }
  })
  console.log(body.ac_password)
  console.log(findedUser.ac_password)
  if (!findedUser) {
    return res.status(400).send({ msg: "Invalid Username" })
  }
  const validPassword = await bcrypt.compare(body.ac_password, findedUser.ac_password)
  if (!validPassword) {
    return res.status(400).send({ msg: "Invalid Password" })
  }

  // Create TOKEN
  const token = jwt.sign({ id: findedUser.ac_id }, process.env.TOKEN_SECRET)


  // When HTTPS delete tokenJSON response
  return res.cookie("token", token, { sameSite: "none", secure: true }).send({ msg: "Login Successfully", token: token })
})

router.delete("/delete/:id", async (req, res) => {
  let id = Number(req.params.id)
  let result
  try {
    await account.delete({
      where: {
        ac_id: id
      }
    })
  } catch (err) {
    return res.status(400).send({ err: err.meta.cause })
  }
  console.log(result)
  return res.send({ msg: "Delete Successfully" })
})

module.exports = router