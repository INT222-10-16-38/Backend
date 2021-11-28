const express = require("express")
const cors = require("cors")
const app = express()

app.use(cors())
app.options('*', cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let port = process.env.PORT || 9000
app.listen(port, () => {
  console.log(`The server is running at port : ${port}`)
})

app.use("/", require("./routes/backendCheck"))

app.use("/api/artists", require("./routes/artist"))

app.use("/api/albums", require("./routes/album"))

app.use("/api/boards", require("./routes/board"))

app.use("/api/favorites", require("./routes/favorite"))

app.use("/api/accounts", require("./routes/account"))

app.use("/api/entertainments", require("./routes/entertainment"))

let { sendImage } = require("./helpers/file")

app.use("/api/get-image/:image", sendImage)