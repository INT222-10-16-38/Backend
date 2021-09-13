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

router.post('/add', async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ msg: err.message })
    }
    let files = req.files
    let imgFile = []
    if (!files) {
      return res.status(400).send({ msg: "Please send data with data-form" })
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.fieldname == 'b_image') {
        imgFile.push(file)
      }
      if (file.mimetype == "application/json") {
        let boardData = await readFile(file)
        deleteFile(file.filename)
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
            return res.status(400).send({ msg: "Foreign key constraint failed on the field: `account_ac_id`" })
          }
        }
        return res.send({ status: "Create Board Successfully", err: false })
      }
    }
    await dataNotValid(files)
    return res.status(400).send({ msg: "Please send data" })
  })
  /* let body = req.body
  // Delete when using authen
  body.account_ac_id = Number(body.account_ac_id)
  const { error } = validateBoard(body)
  if (error) return res.send({ err: error.details[0].message })
  await board.create({
      data: body
  }).then(() => {
      return res.send({ status: "Add board Successfully", err: false })
  }) */
})

router.put("/edit/:id", async (req, res) => {
  let id = Number(req.params.id)
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ msg: err.message })
    }

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
    if (!files) {
      return res.status(400).send({ msg: "Please send data with data-form" })
    }
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.fieldname == 'b_image') {
        imgFile.push(file)
        if (findedBoard) {
          deleteFile(findedBoard.b_image)
        }
      }
      if (file.mimetype == "application/json") {
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

        try {
          await board.update({
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
        return res.send({ status: "Update Board Successfully", err: false })
      }
    }
    await dataNotValid(files)
    return res.status(400).send({ msg: "Please send data" })
  })
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