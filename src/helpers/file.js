const fs = require("fs/promises")
const path = require("path")

const deleteFile = async (fileName) => {
  // path.join(__dirname, "..")
  try {
    let pathDelete = path.join(__dirname, `../../uploads/${fileName}`)
    await fs.unlink(pathDelete)
  } catch (error) {
    console.log(error)
  }
}

const readFile = async (file) => {
  let fileData = await fs.readFile(file.path, { encoding: "utf8" })
  fileData = await JSON.parse(fileData)
  return fileData
}

const dataNotValid = async (files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    console.log(file)
    await deleteFile(file.filename)
  }
}

const sendImage = async (req, res, next) => {
  let imageFile = req.params.image
  let pathFile = path.join(__dirname, `../../uploads/${imageFile}`)
  return res.sendFile(pathFile)
}

module.exports.deleteFile = deleteFile
module.exports.readFile = readFile
module.exports.dataNotValid = dataNotValid
module.exports.sendImage = sendImage