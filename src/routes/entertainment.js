const router = require("express").Router()
const { entertainment } = require("../models/model")
const upload = require("../middlewares/uploadFile")
const { dataNotValid, deleteFile, readFile } = require("../helpers/file")
const { validateEntertainment } = require("../helpers/validation")

router.get("/", async (req, res) => {
  let result
  try {
    console.log("Let try")
    result = await entertainment.findMany()
    return res.send({ data: result })
  } catch (err) {
    return res.status(400).send({ msg: err.message })
  }
})

router.get("/:id", async (req, res) => {
  let result
  let id = Number(req.params.id)
  try {
    result = await entertainment.findFirst({
      include: {
        artists: {
          where: {
            entertainment_id: id
          }
        }
      }
    })
    return res.send({ data: result })
  } catch (err) {
    return res.status(400).send(err.message)
  }
})

router.post("/add", upload, async (req, res) => {
  let files = req.files
  let imgFile = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.fieldname == 'e_logo') {
      imgFile.push(file)
    }
    if (file.mimetype == "application/json") {
      let body = await readFile(file)
      console.log(body)
      await deleteFile(file.filename)
      for (const [index, img] of imgFile.entries()) {
        if (img.fieldname == "e_logo") {
          body.e_logo = await img.filename
        }
      }
      const { error } = validateEntertainment(body)
      if (error) return res.status(400).send({ err: error.details[0].message })

      body.e_foundingdate = new Date(body.e_foundingdate)
      let result
      try {
        result = await entertainment.create({
          data: body
        })
        return res.send({ msg: "Create Successfully", data: result })
      } catch (error) {
        return res.status(400).send(error.message)
      }
    }
  }
})

router.put("/edit/:id", upload, async (req, res) => {
  let id = Number(req.params.id)
  let files = req.files
  let imgFile = []
  let findedEntertainment = await entertainment.findFirst({
    where: {
      e_id: id
    },
    select: {
      e_logo: true
    }
  })
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.fieldname == 'e_logo') {
      imgFile.push(file)
    }
    if (file.mimetype == "application/json") {
      let body = await readFile(file)
      body.e_logo = findedEntertainment.e_logo
      await deleteFile(file.filename)
      for (const [index, img] of imgFile.entries()) {
        if (img.fieldname == "e_logo") {
          body.e_logo = await img.filename
        }
      }
      const { error } = validateEntertainment(body)
      if (error) return res.status(400).send({ err: error.details[0].message })

      body.e_foundingdate = new Date(body.e_foundingdate)
      let result
      try {
        result = await entertainment.update({
          data: body,
          where: {
            e_id: id
          }
        })
        return res.send({ msg: "Update Successfully", data: result })
      } catch (error) {
        return res.status(400).send(error.message)
      }
    }
  }
})

module.exports = router