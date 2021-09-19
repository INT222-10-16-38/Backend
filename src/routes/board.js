const router = require("express").Router()
const { board } = require("../models/model")
const { validateBoard } = require("../helpers/validation")
const upload = require("../middlewares/uploadFile")
const { readFile, deleteFile, dataNotValid } = require("../helpers/file")

router.get("/", async (req, res) => {
  await board.findMany({
    include: {
      account: true
    }
  }).then((results) => {
    return res.send({ data: results })
  }).catch((err) => {
    return res.send({ status: "Can't get data", error: err })
  })
})

router.post('/add', upload, async (req, res) => {
  let files = req.files
  let imgFile = []
  let jsonFile = files.find((file) => {
    if (!file.mimetype != "application/json") {
      imgFile.push(file)
    }
    return file.mimetype == "application/json"
  })
  if (!jsonFile) {
    await dataNotValid(files)
    return res.status(400).send({ msg: `Please send jsonData` })
  }
  let boardData = await readFile(jsonFile)
  deleteFile(jsonFile.filename)
  for (const [index, img] of imgFile.entries()) {
    if (img.fieldname == "b_image") {
      boardData.b_image = await img.filename
    }
  }
  const { error } = validateBoard(boardData)
  if (error) return res.status(400).send({ err: error.details[0].message })

  try {
    await board.create({
      data: boardData
    })
  } catch (error) {
    if (error.code == 'P2003') {
      console.log(error.message)
      return res.status(400).send({ msg: "Foreign key constraint failed on the field: `account_ac_id`" })
    }
  }
  return res.send({ status: "Create Board Successfully", err: false })
})

router.put("/edit/:id", upload, async (req, res) => {
  let id = Number(req.params.id)
  let findedBoard = await board.findFirst({
    where: {
      b_id: id
    },
    select: {
      b_image: true,
    }
  })

  if (!findedBoard) {
    return res.status(400).send({ msg: "Can't find board id" })
  }

  let files = req.files
  let imgFile = []
  let jsonFile = files.find((file) => {
    if (!file.mimetype != "application/json") {
      imgFile.push(file)
    }
    return file.mimetype == "application/json"
  })
  if (!jsonFile) {
    await dataNotValid(files)
    return res.status(400).send({ msg: `Please send jsonData` })
  }
  let boardData = await readFile(file)
  deleteFile(file.filename)
  if (!findedBoard.b_image) {
    findedBoard.b_image = ""
  }
  boardData.b_image = findedBoard.b_image
  for (const [index, img] of imgFile.entries()) {
    if (img.fieldname == "b_image") {
      boardData.b_image = await img.filename
    }
  }
  const { error } = validateBoard(boardData)
  if (error) return res.status(400).send({ err: error.details[0].message })

  let updateResult
  try {
    updateResult = await board.update({
      where: {
        b_id: id
      },
      data: boardData
    })
  } catch (error) {
    if (error.code == 'P2003') {
      return res.status(400).send({ msg: "Foreign key constraint failed on the field: `account_ac_id`" })
    }
  }
  if (updateResult) {
    for (const [index, img] of imgFile.entries()) {
      if (findedBoard.b_image != "") {
        await deleteFile(findedBoard.b_image)
      }
    }
  }
  return res.send({ status: "Update Board Successfully", err: false })
})

router.delete("/delete/:id", async (req, res) => {
  let id = Number(req.params.id)
  let result
  try {
    result = await board.delete({
      where: {
        b_id: id
      }
    })
  } catch (err) {
    return res.status(400).send({ msg: err.meta.cause })
  }
  if (result.b_image) {
    deleteFile(result.b_image)
  }
  return res.send({ msg: "Delete board successfully" })
})

module.exports = router