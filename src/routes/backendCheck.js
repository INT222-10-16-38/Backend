const router = require("express").Router()

router.get("/health", (req, res) => {
    return res.send({ status: "The server is healthy" })
})

router.get("/", (req, res) => {
    return res.send({ msg: "The backend API server", develop_by: "Taninchot" })
})

module.exports = router