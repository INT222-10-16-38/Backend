const router = require("express").Router()
const { entertainment } = require("../models/model")
const upload = require("../middlewares/uploadFile")
const { dataNotValid, deleteFile, readFile } = require("../helpers/file")
const { validateEntertainment } = require("../helpers/validation")

router.get("/", async (req, res) => {
  let result
  try {
    result = await entertainment.findMany()
  } catch (err) {
    return res.status(500).send({ msg: err.message })
  }
  return res.send({ data: result })
})

router.get("/:id", async (req, res) => {
  let result
  let id = Number(req.params.id)
  try {
    result = await entertainment.findFirst({
      where: {
        e_id: id
      },
      include: {
        artists: true
      }
    })
  } catch (err) {
    return res.status(500).send(err.message)
  }
  return res.send({ data: result })
})

router.post("/add", upload, async (req, res) => {
  let files = req.files
  let imgFile = []
  let jsonFile = files.find((file) => {
    if (file.mimetype != "application/json") {
      imgFile.push(file)
    }
    return file.mimetype == "application/json"
  })
  if (!jsonFile) {
    await dataNotValid(files)
    return res.status(500).send({ msg: `Please send jsonData` })
  }
  let body
  try {
    body = await readFile(jsonFile)
    await deleteFile(jsonFile.filename)
    for (const [index, img] of imgFile.entries()) {
      if (img.fieldname == "e_image") {
        body.e_logo = await img.filename
      }
    }
    const { error } = validateEntertainment(body)
    if (error) return res.status(500).send({ err: error.details[0].message })
    body.e_foundingdate = new Date(body.e_foundingdate)
  } catch (error) {
    return res.status(500).send({ error: error })
  }

  let result
  try {
    result = await entertainment.create({
      data: body
    })
  } catch (error) {
    return res.status(500).send(error.message)
  }
  return res.send({ msg: "Create Successfully", data: result })
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
  let jsonFile = files.find((file) => {
    if (file.mimetype != "application/json") {
      imgFile.push(file)
    }
    return file.mimetype == "application/json"
  })
  if (!jsonFile) {
    await dataNotValid(files)
    return res.status(500).send({ msg: `Please send jsonData` })
  }
  let body
  try {
    body = await readFile(jsonFile)
    await deleteFile(jsonFile.filename)
    body.e_logo = findedEntertainment.e_logo
    for (const [index, img] of imgFile.entries()) {
      if (img.fieldname == "e_logo") {
        body.e_logo = await img.filename
      }
    }
    const { error } = validateEntertainment(body)
    if (error) return res.status(500).send({ err: error.details[0].message })

    body.e_foundingdate = new Date(body.e_foundingdate)
  } catch (error) {
    return res.status(500).send({ error: error })
  }

  let result
  try {
    result = await entertainment.update({
      data: body,
      where: {
        e_id: id
      }
    })
  } catch (error) {
    return res.status(500).send(error.message)
  }
  if (result) {
    for (const [index, img] of imgFile.entries()) {
      if (findedEntertainment.e_logo != "preview_logo.png") {
        await deleteFile(findedEntertainment.e_logo)
      }
    }
  }
  return res.send({ msg: "Update Successfully", data: result })
})

router.delete("/delete/:id", async (req, res) => {
  let id = Number(req.params.id)
  let results
  try {
    results = await entertainment.delete({
      where: {
        e_id: id
      }
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  if (results.e_logo) {
    deleteFile(results.e_logo)
  }
  return res.send({ msg: `Delete ${results.e_name} Successfully` })
})

module.exports = router