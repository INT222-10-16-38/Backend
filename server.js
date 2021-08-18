const express = require("express")
const app = express()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
let port = 9000
app.listen(port, () => {
    console.log(`The server is running at port : ${port}`)
})

app.get("/health", (req, res) => {
    return res.send({ status: "The server is healthy" })
})

app.get("/albums", async (req, res) => {
    let results = await prisma.album.findMany({
        include: {
            artists: true
        }
    })

    if (results) {
        return res.send({ data: results })
    }
})

app.get("/comments", async (req, res) => {
    let results = await prisma.comment.findMany({
        include: {
            account: true
        }
    })

    if (results) {
        return res.send({ data: results })
    }
})


app.get("/favorites", async (req, res) => {
    let results = await prisma.favorite.findMany({
        include: {
            account: true,
            album: true
        }
    })

    if (results) {
        return res.send({ data: results })
    }
})