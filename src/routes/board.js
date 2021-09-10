const router = require("express").Router()
const { board } = require("../models/model")
const { validateBoard } = require("../helpers/validation")
const upload = require("../middlewares/uploadFile")
const fs = require("fs/promises")
const { readFile, deleteFile } = require("../helpers/file")

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
    console.log(files)
    let imgFile = []
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
            console.log(boardData)
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

    let files = req.files
    console.log(files)
    let imgFile = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.fieldname == 'b_image') {
        imgFile.push(file)
        if(findedBoard){
          deleteFile(findedBoard.b_image)
        }
      }
      if (file.mimetype == "application/json") {
        let boardData = await readFile(file)
        deleteFile(file.filename)
        for (const [index, img] of imgFile.entries()) {
          if (img.fieldname == "b_image") {
            boardData.b_image = await img.filename
            console.log(boardData)
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