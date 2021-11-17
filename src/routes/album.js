const router = require("express").Router()
const upload = require("../middlewares/uploadFile")
const { album } = require("../models/model")
const { validateAlbum } = require("../helpers/validation")
const { readFile, deleteFile, dataNotValid } = require("../helpers/file")
const { calPage, calSkip } = require('../helpers/pagination');

router.get("/", async (req, res) => {
  let results
  try {
    results = await album.findMany({
      include: {
        artists: true
      }
    })
  } catch (error) {
    return res.status(500).send({ status: "Can't get data", error: error })
  }
  return res.send({ data: results })
})

router.get("/page/:page", async (req, res) => {
  let page = Number(req.params.page)
  let numberOfItem = 20
  let results
  try {
    results = await album.findMany({
      skip: calSkip(page, numberOfItem),
      take: numberOfItem
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  const totalAlbum = await album.count()
  return res.send({ data: results, page: page, totalPage: calPage(totalAlbum, numberOfItem) })
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
    return res.status(500).send({ msg: err.meta.cause })
  }
  if (!result) {
    return res.status(500).send({ msg: "Can't find this album id" })
  }
  return res.send({ data: result })
})

// Add Albums
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

  try {
    let albumData = await readFile(jsonFile)
    await deleteFile(jsonFile.filename)
    for (const [index, img] of imgFile.entries()) {
      if (img.fieldname == "cover_image") {
        albumData.cover_image = await img.filename
      }
      if (img.fieldname == "preview_image") {
        albumData.preview_image = await img.filename
      }
    }
    const { error } = validateAlbum(albumData)
    if (error) return res.status(500).send({ err: error.details[0].message })

    albumData.release_date = new Date(albumData.release_date)
    await album.create({
      data: albumData
    })
  } catch (error) {
    await dataNotValid(req.files)
    return res.status(500).send({ error: error })
  }
  return res.send({ status: "Create Album Successfully", err: false })
})

router.put("/edit/:id", upload, async (req, res) => {
  try {
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
      return res.status(500).send({ msg: "Can't find album" })
    }
    let files = req.files
    let imgFile = []
    if (!files) {
      return res.status(500).send({ msg: "Please send data with data-form" })
    }
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
    let albumData = await readFile(jsonFile)
    await deleteFile(jsonFile.filename)
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
    if (error) return res.status(500).send({ err: error.details[0].message })
    albumData.release_date = new Date(albumData.release_date)
    let updateResult = await album.update({
      where: {
        a_id: id
      },
      data: albumData
    })
    if (updateResult) {
      for (const [index, img] of imgFile.entries()) {
        if (findedAlbum.cover_image == "cover_image") {
          deleteFile(findedAlbum.cover_image)
        }
        if (findedAlbum.cover_image == "preview_image") {
          deleteFile(findedAlbum.preview_image)
        }
      }
    }
  } catch (error) {
    await dataNotValid(req.files)
    return res.status(500).send({ error: error })
  }
  return res.send({ msg: "Update Successfully" })
})

router.delete("/delete/:id", async (req, res) => {
  let id = Number(req.params.id)
  let result
  try {
    result = await album.delete({
      where: {
        a_id: id
      }
    })

  } catch (error) {
    return res.status(500).send({ msg: error })
  }
  try {
    if (result.cover_image != "default_cover_image.jpg") {
      deleteFile(result.cover_image)
    }
    if (result.cover_image != "default_preview_image.png") {
      deleteFile(result.preview_image)
    }
  } catch (error) {
    console.log(error)
  }
  return res.send({ msg: "Delete Succesfully" })
})

module.exports = router