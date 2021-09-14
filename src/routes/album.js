const router = require("express").Router()
const upload = require("../middlewares/uploadFile")
const { album } = require("../models/model")
const { validateAlbum } = require("../helpers/validation")
const { readFile, deleteFile, dataNotValid } = require("../helpers/file")

router.get("/", async (req, res) => {
  let results
  try {
    results = await album.findMany({
      include: {
        artists: true
      }
    })
  } catch (error) {
    return res.status(400).send({ msg: err.meta.cause })
  }
  return res.send({ data: results })
})

router.get("/:id", async (req, res) => {
  let id = Number(req.params.id)
  let result
  try {
    result = await album.findFirst({
      include: {
        artists: true
      },
      where: {
        a_id: id
      }
    })
  } catch (error) {
    return res.status(400).send({ msg: err.meta.cause })
  }
  if (!result) {
    return res.status(400).send({ msg: "Can't find this album id" })
  }
  return res.send({ data: result })
})

router.post("/add", upload, async (req, res) => {
  let files = req.files
  let imgFile = []

  // Loop files and check files[i] is image or file
  // If image push to array imgFile
  // If JSON Data read and write to database
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.fieldname == 'cover_image' || file.fieldname == 'preview_image') {
      imgFile.push(file)
    }
    if (file.mimetype == "application/json") {
      let albumData = await readFile(file)
      await deleteFile(file.filename)
      for (const [index, img] of imgFile.entries()) {
        if (img.fieldname == "cover_image") {
          albumData.cover_image = await img.filename
        }
        if (img.fieldname == "preview_image") {
          albumData.preview_image = await img.filename
        }
      }
      const { error } = validateAlbum(albumData)
      if (error) return res.status(400).send({ err: error.details[0].message })

      albumData.release_date = new Date(albumData.release_date)
      await album.create({
        data: albumData
      })
      return res.send({ status: "Create Album Successfully", err: false })
    }
  }
  await dataNotValid(files)
  return res.status(400).send({ msg: "Please send JSON data" })
})

router.put("/edit/:id", upload, async (req, res) => {
  let id = Number(req.params.id)
  let findedAlbum = await album.findFirst({
    where: {
      a_id: id
    },
    select: {
      cover_image: true,
      preview_image: true
    }
  })
  if (!findedAlbum) {
    return res.status(400).send({ msg: "Can't find album" })
  }
  let files = req.files
  let imgFile = []
  if (!files) {
    return res.status(400).send({ msg: "Please send data with data-form" })
  }
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.fieldname == 'cover_image') {
      if (findedAlbum.cover_image != "cover_image.jpg") {
        await deleteFile(findedAlbum.cover_image)
      }
      imgFile.push(file)
    }
    if (file.fieldname == 'preview_image') {
      if (findedAlbum.preview_image != "preview_image.png") {
        await deleteFile(findedAlbum.preview_image)
      }
      imgFile.push(file)
    }
    if (file.mimetype == "application/json") {
      let albumData = await readFile(file)
      await deleteFile(file.filename)
      albumData.cover_image = findedAlbum.cover_image
      albumData.preview_image = findedAlbum.preview_image
      for (const [index, img] of imgFile.entries()) {
        if (img.fieldname == "cover_image") {
          albumData.cover_image = await img.filename
        }
        if (img.fieldname == "preview_image") {
          albumData.preview_image = await img.filename
        }
      }
      const { error } = validateAlbum(albumData)
      if (error) return res.status(400).send({ err: error.details[0].message })

      albumData.release_date = new Date(albumData.release_date)
      console.log(albumData)
      await album.update({
        where: {
          a_id: id
        },
        data: albumData
      })
      return res.send({ msg: "Update Successfully" })
    }
  }
  await dataNotValid(files)
  return res.status(400).send({ msg: "Please send JSON data" })
})

router.delete("/delete/:id", async (req, res) => {
  let id = Number(req.params.id)
  try {
    await album.delete({
      where: {
        a_id: id
      }
    })
  } catch (err) {
    return res.status(400).send({ msg: err.meta.cause })
  }
  // Wait for server on production
  /* if (result.cover_image != "default_cover_image.jpg") {
      deleteFile(result.cover_image)
  }
  if (result.cover_image != "default_preview_image.png") {
      deleteFile(result.preview_image)
  } */
  return res.send({ msg: "Delete Succesfully" })
})

module.exports = router