const path = require('path')
const multer = require('multer')
const randomString = require("randomstring")

//set strorage
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, changeNameOfFile(file))
  }
});

// If want more image you can adding another if field
let changeNameOfFile = (file) => {
  const newFileName = `${randomString.generate(10)}_${Date.now()}${path.extname(file.originalname)}`
  return newFileName
}

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif|json/;
  const mimetype = filetypes.test(file.mimetype)

  if (mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('Only images allowed'))
  }
}
//init upload
const upload = multer({
  storage: storage,
  limits: { fieldSize: 100000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  },
}).any()

module.exports = async (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).send({ errror: err.message })
    }
    if (!req.files) {
      return res.status(500).send({ error: "Please send data with data-form" })
    }
    next()
  })
}