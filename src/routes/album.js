const router = require("express").Router()
const upload = require("../middlewares/uploadFile")
const { album } = require("../models/model")
const { validateAlbum } = require("../helpers/validation")
const fs = require("fs/promises")
const { readFile, deleteFile } = require("../helpers/file")

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

router.post("/add", async (req, res, err) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ msg: err.message })
    }
    let files = req.files
    let imgFile = []
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
        console.log(albumData)
        const { error } = validateAlbum(albumData)
        if (error) return res.status(400).send({ err: error.details[0].message })

        albumData.release_date = new Date(albumData.release_date)
        await album.create({
          data: albumData
        })
        return res.send({ status: "Create Album Successfully", err: false })
      }
    }
  })
  // Wait for frontend prac upload without image successfull


  // let body = req.body
  // const { error } = validateAlbum(body)
  // if (error) return res.status(400).send({ err: error.details[0].message })

  // body.release_date = new Date(body.release_date)
  // await album.create({
  //     data: body
  // })
  // return res.send({ status: "Create Album Successfully", err: false })
})

router.put("/edit/:id", async (req, res) => {
  let id = Number(req.params.id)
  /* upload(req, res, async(err) => {
    if (err) {
      return res.status(400).send({ msg: err.message })
    }
  }) */
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send({ msg: err.message })
    }

    let findedAlbum = await album.findFirst({
      where: {
        a_id: id
      },
      select: {
        cover_image: true,
        preview_image: true
      }
    })

    let files = req.files
    let imgFile = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.fieldname == 'cover_image' || file.fieldname == 'preview_image') {
        imgFile.push(file)
        if (findedAlbum.cover_image != "cover_image.jpg") {
          deleteFile(findedAlbum.cover_image)
        }
        if (findedAlbum.cover_image != "preview_image.png") {
          deleteFile(findedAlbum.preview_image)
        }
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
        console.log(albumData)
        const { error } = validateAlbum(albumData)
        if (error) return res.status(400).send({ err: error.details[0].message })

        albumData.release_date = new Date(albumData.release_date)
        await album.update({
          where: {
            a_id: id
          },
          data: albumData
        })
        return res.send({ msg: "Update Successfully" })
      }
    }
  })
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
  } catch (err) {
    return res.status(400).send({ msg: err.meta.cause })
  }
  console.log(result)

  // Wait for frontend prac upload without image successfull
  /* if (result.cover_image != "default_cover_image.jpg") {
      deleteFile(result.cover_image)
  }
  if (result.cover_image != "default_preview_image.png") {
      deleteFile(result.preview_image)
  } */

  return res.send({ msg: "Delete Succesfully" })
})

module.exports = router