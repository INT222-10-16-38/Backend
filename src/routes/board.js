const router = require("express").Router()
const upload = require("../middlewares/uploadFile")
const { dataNotValid } = require("../helpers/file")
const boardController = require("../controllers/boardController")
const auth = require("../middlewares/auth")


router.get("/", async (req, res) => {
  let results
  try {
    results = await boardController.findAllBoard()
  } catch (error) {
    return res.send({ error: error.message })
  }
  return res.send({ data: results })
})

router.get("/page/:item/:page", async (req, res) => {
  let page = Number(req.params.page)
  let numberOfItem = Number(req.params.item)
  let results
  let totalPage
  try {
    let data = await boardController.getBoardByPage(page, numberOfItem)
    results = data.results
    totalPage = data.totalPage
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ data: results, page: page, totalPage: totalPage })
})

router.post('/add', auth, upload, async (req, res) => {
  let files = req.files
  let accountId = req.account["ac_id"]
  try {
    await boardController.addBoard(files, accountId)
  } catch (error) {
    await dataNotValid(files)
    return res.status(500).send({ error: error.message })
  }
  return res.send({ status: "Create Board Successfully" })
})

router.put("/edit/:id", auth, upload, async (req, res) => {
  let id = Number(req.params.id)
  let files = req.files
  let accountId = req.account["ac_id"]
  try {
    await boardController.editBoard(files, id, accountId)
  } catch (error) {
    await dataNotValid(files)
    return res.status(500).send({ error: error.message })
  }

  return res.send({ status: "Update Board Successfully", err: false })
})

router.delete("/delete/:id", auth, async (req, res) => {
  let id = Number(req.params.id)
  let accountId = req.account["ac_id"]
  try {
    await boardController.deleteBoard(id, accountId)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Delete board successfully" })
})

module.exports = router