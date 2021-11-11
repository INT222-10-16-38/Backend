const router = require("express").Router()
const { board } = require("../models/model")
const { validateBoard } = require("../helpers/validation")
const upload = require("../middlewares/uploadFile")
const { readFile, deleteFile, dataNotValid } = require("../helpers/file")
const { calPage, calSkip } = require('../helpers/pagination');

router.get("/", async (req, res) => {
  let results
  try {
    results = await board.findMany({
      include: {
        account: true
      }
    })
  } catch (error) {
    return res.send({ status: "Can't get data", error: error })
  }
  return res.send({ data: results, totalPage: calPage(results.length) })
})

router.get("/page/:page", async (req, res) => {
  let page = Number(req.params.page)
  let numberOfItem = 6
  let results
  try {
    results = await board.findMany({
      orderBy: {
        b_id: "desc"
      },
      skip: calSkip(page, numberOfItem),
      take: numberOfItem,
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  const totalBoard = await board.count()
  if (!results) {
    return res.send({ data: results })
  }
  return res.send({ data: results, page: page, totalPage: calPage(totalBoard, numberOfItem) })
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
    return res.status(500).send({ msg: `Please send jsonData` })
  }
  let boardData
  try {
    boardData = await readFile(jsonFile)
    deleteFile(jsonFile.filename)
    for (const [index, img] of imgFile.entries()) {
      if (img.fieldname == "b_image") {
        boardData.b_image = await img.filename
      }
    }
    const { error } = validateBoard(boardData)
    if (error) {
      return res.status(500).send({ err: error.details[0].message })
    }
  } catch (error) {
    return res.status(500).send({ error: error })
  }

  try {
    await board.create({
      data: boardData
    })
  } catch (error) {
    if (error.code == 'P2003') {
      console.log(error.message)
      return res.status(500).send({ msg: "Foreign key constraint failed on the field: `account_ac_id`" })
    }
    return res.status(500).send({ error: error })
  }
  return res.send({ status: "Create Board Successfully", err: false })
})

router.put("/edit/:id", upload, async (req, res) => {
  let id = Number(req.params.id)

  let findedBoard
  try {
    findedBoard = await board.findFirst({
      where: {
        b_id: id
      },
      select: {
        b_image: true,
      }
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }

  if (!findedBoard) {
    return res.status(500).send({ msg: "Can't find board id" })
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
    return res.status(500).send({ msg: `Please send jsonData` })
  }
  let boardData
  try {
    boardData = await readFile(file)
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
    if (error) {
      return res.status(500).send({ err: error.details[0].message })
    }
  } catch (error) {

  }


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
      return res.status(500).send({ msg: "Foreign key constraint failed on the field: `account_ac_id`" })
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
    return res.status(500).send({ msg: err })
  }
  if (result.b_image) {
    deleteFile(result.b_image)
  }
  return res.send({ msg: "Delete board successfully" })
})

module.exports = router