const router = require("express").Router()
const { PrismaClient } = require("@prisma/client")
const { board } = new PrismaClient()
const { validateBoard } = require("../helpers/validation")

router.get("/", async (req, res) => {
    await board.findMany({
        include: {
            account: true
        }
    }).then((results) => {
        return res.send({ data: results })
    }).catch((err) => {
        return res.send({ status: "Can't get data", error: err })
    })
})

router.post('/add', async (req, res) => {
    let body = req.body

    // Delete when using authen
    body.account_ac_id = Number(body.account_ac_id)
    const { error } = validateBoard(body)
    if (error) return res.send({ err: error.details[0].message })
    await board.create({
        data: body
    }).then(() => {
        return res.send({ status: "Add board Successfully", err: false })
    })
})

router.delete("/delete/:id", async (req, res) => {
    let id = Number(req.params.id)
    let result = await board.deleteMany({
        where: {
            b_id: id
        }
    })
    if (result.count <= 0) {
        return res.send({ msg: "Board Doesn't exists" })
    }
    return res.send({ msg: "Delete board successfully" })
})

module.exports = router