const router = require("express").Router()

router.get("/health", (req, res) => {
    return res.send({ status: "The server is healthy" })
})

module.exports = router