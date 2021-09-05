const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { artists } = new PrismaClient()
const { validateArtist } = require("../helpers/validation")

router.get("/", async (req, res) => {
    await artists.findMany().then((results) => {
        return res.send({ data: results })
    })
})

router.get("/:id", async (req, res) => {
    let id = Number(req.params.id)
    await artists.findMany({
        where: {
            art_id: id
        }
    }).then((result) => {
        return res.send({ data: result })
    })
})

router.post("/add", async (req, res) => {
    let body = req.body
    const { error } = validateArtist(body)
    if (error) return res.send({ err: error.details[0].message })

    await artists.create({
        data: body
    }).then((result) => {
        return res.send(result)
    })
})

router.delete("/delete/:id", async (req, res) => {
    let id = Number(req.params.id)

    let result = await artists.deleteMany({
        where: {
            art_id: id
        }
    })
    if (result.count <= 0) {
        return res.send({ msg: "Artist doesn't exists" })
    }

    return res.send({ msg: "Delete Album Successfully" })
})

module.exports = router