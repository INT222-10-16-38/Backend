const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { album } = new PrismaClient()

router.get("/albums", async (req, res) => {
    await album.findMany({
        include: {
            artists: true
        }
    }).then((results) => {
        return res.send({ data: results })
    }).catch((err) => {
        return res.send({ status: "Can't get data", error: err })
    })
})

module.exports = router