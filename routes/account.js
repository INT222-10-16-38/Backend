const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { account } = new PrismaClient()

router.get("/accounts", async (req, res) => {
    await account.findMany().then((results) => {
        return res.send({ data: results })
    }).catch((err) => {
        return res.send({ status: "Can't get data", error: err })
    })
})

router.get("/accounts/:id", async (req, res) => {
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

module.exports = router