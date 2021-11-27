const router = require("express").Router()
const upload = require("../middlewares/uploadFile")
const { dataNotValid } = require("../helpers/file")
const albumController = require("../controllers/albumController")
const { auth, checkAdmin } = require("../middlewares/auth")

router.get("/", async (req, res) => {
  let results
  try {
    results = await albumController.getAllAlbums()
  } catch (error) {
    return res.status(500).send({ status: "Can't get data", error: error.message })
  }
  return res.send({ data: results })
})

router.get("/page/:page", async (req, res) => {
  let page = Number(req.params.page)
  let numberOfItem = 20
  let results
  let totalPage
  try {
    let getByPage = await albumController.getAlbumByPage(page, numberOfItem)
    results = getByPage.results
    totalPage = getByPage.totalPage
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ data: results, page: page, totalPage: totalPage })
})

router.get("/:id", async (req, res) => {
  let id = Number(req.params.id)
  let result
  try {
    result = await albumController.getAlbumById(id)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ data: result })
})

// Add Albums
router.post("/add", auth, checkAdmin, upload, async (req, res) => {
  let files = req.files
  try {
    await albumController.addAlbum(files)
  } catch (error) {
    dataNotValid(files)
    return res.status(500).send({ error: error.message })
  }

  return res.send({ status: "Create Album Successfully", err: false })
})

router.put("/edit/:id", auth, checkAdmin, upload, async (req, res) => {
  let id = Number(req.params.id)
  let files = req.files
  try {
    await albumController.editAlbum(id, files)
  } catch (error) {
    await dataNotValid(req.files)
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Update Successfully" })
})

router.delete("/delete/:id", auth, checkAdmin, async (req, res) => {
  let id = Number(req.params.id)
  try {
    await albumController.deleteAlbum(id)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Delete Succesfully" })
})

module.exports = router