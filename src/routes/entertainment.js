const router = require("express").Router()
const { entertainment } = require("../models/model")
const upload = require("../middlewares/uploadFile")
const { dataNotValid } = require("../helpers/file")
const entertainmentController = require("../controllers/entertainmentController")
const { auth, checkAdmin } = require("../middlewares/auth")

router.get("/", async (req, res) => {
  let result
  try {
    result = await entertainment.findMany()
  } catch (err) {
    return res.status(500).send({ error: err.message })
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
    return res.status(500).send({ error: err.message })
  }
  return res.send({ data: result })
})

router.post("/add", auth, checkAdmin, upload, async (req, res) => {
  let files = req.files
  let results
  try {
    results = await entertainmentController.addEntertainment(files)
  } catch (error) {
    await dataNotValid(files)
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Add Entertainment Successfully", data: results })
})

router.put("/edit/:id", auth, checkAdmin, upload, async (req, res) => {
  let id = Number(req.params.id)
  let files = req.files
  let result
  try {
    result = await entertainmentController.editEntertainment(files, id)
  } catch (error) {
    await dataNotValid(files)
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Update Successfully", data: result })
})

router.delete("/delete/:id", auth, checkAdmin, auth, async (req, res) => {
  let id = Number(req.params.id)
  let results
  try {
    results = await entertainmentController.deleteEntertainment(id)
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  return res.send({ msg: `Delete ${results.e_name} Successfully` })
})

module.exports = router