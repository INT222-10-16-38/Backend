const fs = require("fs/promises")
const path = require("path")

const deleteFile = async (fileName) => {
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
    await deleteFile(file.filename)
  }
}

const sendImage = async (req, res, next) => {
  let imageFile = req.params.image
  let pathFile = path.join(__dirname, `../../uploads/${imageFile}`)
  try {
    await fs.readFile(pathFile)
    return res.sendFile(pathFile)
  } catch (error) {
    return res.status(500).send({ msg: error.message })
  }
}

const sortData = async (files) => {
  let imgFile = []
  let jsonFile = files.find((file) => {
    if (file.mimetype != "application/json") {
      imgFile.push(file)
    }
    return file.mimetype == "application/json"
  })
  return { imgFile, jsonFile }
}

module.exports = { deleteFile, readFile, dataNotValid, sendImage, sortData }
module.exports.deleteFile = deleteFile
module.exports.readFile = readFile
module.exports.dataNotValid = dataNotValid
module.exports.sendImage = sendImage