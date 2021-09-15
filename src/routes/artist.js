const router = require("express").Router()
const { artists } = require("../models/model")
const { validateArtist } = require("../helpers/validation")
const { readFile, dataNotValid, deleteFile } = require("../helpers/file")
const upload = require("../middlewares/uploadFile")

router.get("/", async (req, res) => {
  await artists.findMany().then((results) => {
    return res.send({ data: results })
  })
})

router.get("/:id", async (req, res) => {
  let id = Number(req.params.id)
  await artists.findMany({
    where: {
      art_id: id
    }
  }).then((result) => {
    return res.send({ data: result })
  })
})

router.post("/add", upload, async (req, res) => {
  let files = req.files
  let imgFile = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.fieldname == 'art_image') {
      imgFile.push(file)
    }
    if (file.mimetype == "application/json") {
      let body = await readFile(file)
      await deleteFile(file.filename)
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
    }
  }
})

router.put("/edit/:id", async (req, res) => {
  let id = Number(req.params.id)
  let body = req.body
  const { error } = validateArtist(body)
  if (error) return res.send({ err: error.details[0].message })

  let result = await artists.update({
    data: body,
    where: {
      art_id: id
    }
  })
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