const express = require("express")
const cors = require("cors")
const app = express()

// app.use(cors({ credentials: true, origin: true }))
var whitelist = ['https://www.kworld.studio']; //white list consumers
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true, //Credentials are cookies, authorization headers or TLS client certificates.
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'device-remember-token', 'Access-Control-Allow-Origin', 'Origin', 'Accept']
};

app.use(cors(corsOptions)); //adding cors middleware to the express with above configurations
// app.options('*', cors())

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