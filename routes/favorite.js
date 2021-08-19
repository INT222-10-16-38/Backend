const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { favorite } = new PrismaClient()

router.get("/favorites", async (req, res) => {
    await favorite.findMany({
        include: {
            account: true,
            album: true
        }
    }).then((results) => {
        return res.send({ data: results })
    }).catch((err) => {
        return res.send({ status: "Can't get data", error: err })
    })
})


module.exports = router