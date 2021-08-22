const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { account } = new PrismaClient()
const { validateAccount } = require("../../helpers/validation")

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

router.post("/add", async (req, res) => {
    let body = req.body
    const { error } = validateAccount(body)
    if (error) return res.send({ err: error.details[0].message })

    await account.create({
        data: body
    }).then(() => {
        return res.send({ status: "Create Account Successfully", err: false })
    })
})

module.exports = router