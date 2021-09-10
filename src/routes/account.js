const router = require("express").Router()
const { account } = require("../models/model")
const { validateRegister, validateLogin } = require("../helpers/validation")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const upload = require("../middlewares/uploadFile")
const { readFile, deleteFile } = require("../helpers/file")

router.get("/", async (req, res) => {
  await account.findMany().then((results) => {
    return res.send({ data: results })
  }).catch((err) => {
    console.log(err)
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

router.post("/register", async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ msg: err.message })
    }
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

        await account.create({
          data: accountData
        })
        return res.send({ status: "Create Account Successfully", err: false })
      }
    }
  })
  // let files = req.files

  /* 
  let body = req.body
  const { error } = validateRegister(body)
  if (error) return res.send({ err: error.details[0].message })
 
  // Find with email
  let userExists = await account.findFirst({
      where: {
          OR: [
              { ac_email: body.ac_email },
              { ac_username: body.ac_username }
          ]
      }
  })
 
  // Check email if exists throw error
  if (userExists) {
      return res.status(400).send({ msg: "User already exists" })
  }
 
  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(body.ac_password, salt)
  body.ac_password = hashedPassword
 
  // If Over all ok then create Account
  await account.create({
      data: body
  }).then(() => {
      return res.send({ status: "Create Account Successfully", err: false })
  }) 
  */

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
  if (!findedUser) {
    return res.status(400).send("Invalid Username")
  }
  const validPassword = await bcrypt.compare(body.ac_password, findedUser.ac_password)
  if (!validPassword) {
    return res.status(400).send("Invalid Password")
  }

  // Create TOKEN
  const token = jwt.sign({ id: findedUser.ac_id }, process.env.TOKEN_SECRET)


  // When HTTPS delete tokenJSON response
  return res.cookie("token", token).send({ msg: "Login Successfully", token: token })
})

router.delete("/delete/:id", async (req, res) => {
  let id = Number(req.params.id)
  await account.deleteMany({
    where: {
      ac_id: id
    }
  }).then(() => {
    return res.send({ msg: "Delete Successfully" })
  })
})

module.exports = router