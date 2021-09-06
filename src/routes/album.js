const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { album } = new PrismaClient()
const { validateAlbum } = require("../helpers/validation")

router.get("/", async (req, res) => {
    await album.findMany({
        include: {
            artists: true
        }
    }).then((results) => {
        return res.send({ data: results })
    }).catch((err) => {
        return res.status(400).send({ status: "Can't get data", error: err })
    })
})

router.get("/:id", async (req, res) => {
    let id = Number(req.params.id)
    let result = await album.findFirst({
        where: {
            a_id: id
        }
    })
    if (!result) {
        return res.status(400).send({ msg: `Cant't find album from albumId : ${id}` })
    }
    return res.send({ data: result })
})

router.post("/add", async (req, res) => {
    let body = req.body
    const { error } = validateAlbum(body)
    if (error) return res.status(400).send({ err: error.details[0].message })

    body.release_date = new Date(body.release_date)
    await album.create({
        data: body
    })
    return res.send({ status: "Create Album Successfully", err: false })
})

router.delete("/delete/:id", async (req, res) => {
    let id = Number(req.params.id)

    let result = await album.deleteMany({
        where: {
            a_id: id
        }
    })
    if (result.count <= 0) {
        return res.status(400).send({ msg: "Album doesn't exists" })
    }
    return res.send({ msg: "Delete Succesfully" })
})

module.exports = router