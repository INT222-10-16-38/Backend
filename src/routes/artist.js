const router = require("express").Router()
const { artists } = require("../models/model")
const { validateArtist } = require("../helpers/validation")
const { readFile, dataNotValid, deleteFile } = require("../helpers/file")
const upload = require("../middlewares/uploadFile")

router.get("/", async (req, res) => {
  let results
  try {
    results = await artists.findMany({
      include: {
        entertainment: true
      }
    })
  } catch (error) {
    return res.status(401).send({ msg: error.message })
  }
  return res.send({ data: results })
})

router.get("/:id", async (req, res) => {
  let id = Number(req.params.id)
  let results
  try {
    results = await artists.findMany({
      where: {
        art_id: id
      },
      include: {
        entertainment: true
      }
    })
  } catch (error) {
    return res.status(401).send({ msg: error.message })
  }
  return res.send({ data: results })
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
    return res.status(400).send({ msg: `Please send jsonData` })
  }
  let body = await readFile(jsonFile)
  await deleteFile(jsonFile.filename)
  // Insert image to JSON data
  for (const [index, img] of imgFile.entries()) {
    if (img.fieldname == "art_image") {
      body.art_image = await img.filename
    }
  }
  const { error } = validateArtist(body)
  console.log(error)
  if (error) return res.send({ err: error.details[0].message })
  let result = await artists.create({
    data: body
  })
  return res.send({ msg: "Create Successfully", result: result })
})

router.put("/edit/:id", upload, async (req, res) => {
  let id = Number(req.params.id)
  let files = req.files
  let imgFile = []
  let findedArtist = await artists.findFirst({
    where: {
      art_id: id
    },
    select: {
      art_image: true
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
    return res.status(400).send({ msg: `Please send jsonData` })
  }
  let body = await readFile(jsonFile)
  await deleteFile(jsonFile.filename)
  body.art_image = findedArtist.art_image
  for (const [index, img] of imgFile.entries()) {
    if (img.fieldname == "art_image") {
      body.art_image = await img.filename
    }
  }
  const { error } = validateArtist(body)
  if (error) return res.send({ err: error.details[0].message })
  let result = await artists.update({
    data: body,
    where: {
      art_id: id
    }
  })
  if (result) {
    for (const [index, img] of imgFile.entries()) {
      if (findedArtist.art_image != "default_art.png") {
        await deleteFile(findedArtist.art_image)
      }
    }
  }
  return res.send({ msg: "Update Successfully", data: result })
})

router.delete("/delete/:id", async (req, res) => {
  let id = Number(req.params.id)

  let result = await artists.deleteMany({
    where: {
      art_id: id
    }
  })
  if (result.count <= 0) {
    return res.send({ msg: "Artist doesn't exists" })
  }

  return res.send({ msg: "Delete Album Successfully" })
})

module.exports = router