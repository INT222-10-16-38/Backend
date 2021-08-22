const express = require("express")
const cors = require("cors")
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

let port = 9000
app.listen(port, () => {
    console.log(`The server is running at port : ${port}`)
})

app.use("/", require("./routes/backendCheck"))

app.use("/api/artists", require("./routes/artist"))

app.use("/api/albums", require("./routes/album"))

app.use("/api/boards", require("./routes/board"))

app.use("/api/favorites", require("./routes/favorite"))

app.use("/api/accounts", require("./routes/account"))