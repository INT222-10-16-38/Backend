const router = require("express").Router()
const { dataNotValid } = require("../helpers/file")
const upload = require("../middlewares/uploadFile")
const artistController = require("../controllers/artistController")
const auth = require("../middlewares/auth")
const checkAdmin = require("../middlewares/checkAdmin")

router.get("/", async (req, res) => {
  let results
  try {
    results = await artistController.findAllArtists()
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ data: results })
})

router.get("/:id", async (req, res) => {
  let id = Number(req.params.id)
  let results
  try {
    results = await artistController.findArtistById(id)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ data: results })
})

router.post("/add", auth, checkAdmin, upload, async (req, res) => {
  let files = req.files
  let result
  try {
    result = await artistController.addArtist(files)
  } catch (error) {
    await dataNotValid(files)
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Create Successfully", result: result })
})

router.put("/edit/:id", auth, checkAdmin, upload, async (req, res) => {
  let id = Number(req.params.id)
  let files = req.files
  let result
  try {
    result = await artistController.editArtist(id, files)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Update Successfully", data: result })
})

router.delete("/delete/:id", auth, checkAdmin, async (req, res) => {
  let id = Number(req.params.id)
  let result
  try {
    result = await artistController.deleteArtist(id)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }

  if (!result) {
    return res.status(500).send({ msg: "Artist doesn't exists" })
  }

  return res.send({ msg: "Delete Artist Successfully" })
})

module.exports = router