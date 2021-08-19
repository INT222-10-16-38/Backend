const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { comment } = new PrismaClient()

router.get("/comments", async (req, res) => {
    await comment.findMany({
        include: {
            account: true
        }
    }).then((results) => {
        return res.send({ data: results })
    }).catch((err) => {
        return res.send({ status: "Can't get data", error: err })
    })
})

module.exports = router