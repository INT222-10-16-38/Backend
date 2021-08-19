const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { artists } = new PrismaClient()

router.get("/artists", async (req, res) => {
    await artists.findMany().then((results) => {
        return res.send({ data: results })
    }).catch((err) => {
        return res.send({ status: "Can't get data", error: err })
    })
})

router.get("/artist/:id", async (req, res) => {
    let id = req.params.id
    let results = await artists.findMany({
        where: {
            art_id: id
        }
    })

    if (results) {
        return res.send({ data: results })
    }
})

module.exports = router