const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { account } = new PrismaClient()
const { validateRegister, validateLogin } = require("../../helpers/validation")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

router.get("/", async (req, res) => {
    await account.findMany().then((results) => {
        return res.send({ data: results })
    }).catch((err) => {
        return res.send({ status: "Can't get data", error: err })
    })
})

router.get("/:id", async (req, res) => {
    let id = req.params.id
    let results = await account.findMany({
        where: {
            ac_id: id
        }
    })
    if (results) {
        return res.send({ data: results })
    }
})

router.post("/register", async (req, res) => {
    let body = req.body
    const { error } = validateRegister(body)
    if (error) return res.send({ err: error.details[0].message })

    // Find with email
    let emailExists = await account.findFirst({
        where: {
            ac_email: body.ac_email
        }
    })

    // Check email if exists throw error
    console.log(emailExists)
    if (emailExists) {
        return res.status(400).send({ msg: "Email already exists" })
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(3)
    const hashedPassword = await bcrypt.hash(body.ac_password, salt)
    body.ac_password = hashedPassword

    // If Over all ok then create Account
    await account.create({
        data: body
    }).then(() => {
        return res.send({ status: "Create Account Successfully", err: false })
    })

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
    return res.cookie("token", token).send({ msg: "Login Successfully", sessionId: req.sessionID, token: token })
})

router.delete("/:id", async (req, res) => {
    let id = req.params.id
    id = parseInt(id)
    await account.delete({
        where: {
            ac_id: id
        }
    }).then(() => {
        return res.send({ msg: "Delete Successfully" })
    })
})

module.exports = router