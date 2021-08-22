const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { favorite } = new PrismaClient()
const { validateFavorite } = require("../../helpers/validation")

router.get("/", async (req, res) => {
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

router.post("/add", async (req, res) => {
    let body = req.body
    const { error } = validateFavorite(body)
    if (error) return res.send({ err: error.details[0].message })

    await favorite.create({
        data: body
    }).then(() => {
        return res.send({ status: "Add favorite Successfully", err: false })
    })
})


module.exports = router