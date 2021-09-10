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

module.exports.deleteFile = deleteFile
module.exports.readFile = readFile