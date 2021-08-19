const express = require("express")
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

let port = 9000
app.listen(port, () => {
    console.log(`The server is running at port : ${port}`)
})

app.use("/", require("./routes/backendCheck"))

app.use("/api/", require("./routes/artist"))

app.use("/api/", require("./routes/album"))

app.use("/api/", require("./routes/comment"))

app.use("/api/", require("./routes/favorite"))

app.use("/api/", require("./routes/account"))