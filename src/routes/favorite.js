const router = require("express").Router()
const favoriteController = require("../controllers/favoriteController")

router.get("/", async (req, res) => {
  let results
  try {
    results = await favoriteController.getAllFavorite()
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ data: results })
})

router.get("/:ac_id", async (req, res) => {
  let accountId = Number(req.params.ac_id)
  let results
  try {
    results = await favoriteController.getByUserId(accountId)
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  return res.send({ data: results })
})

router.post("/like/:aid/:uid", async (req, res) => {
  let aid = Number(req.params.aid)
  let uid = Number(req.params.uid)
  if (!aid || !uid) {
    return res.status(500).send({ msg: "Please assign albumId and userId" })
  }

  try {
    await favoriteController.favoriteAlbum(aid, uid)
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  return res.send({ status: "Add favorite Successfully" })
})

router.delete("/unlike/:aid/:uid", async (req, res) => {
  let aid = Number(req.params.aid)
  let uid = Number(req.params.uid)
  if (!aid || !uid) {
    return res.status(500).send({ msg: "Please assign albumId and userId" })
  }

  try {
    favoriteController.unFavoriteAlbum(aid, uid)
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  return res.send({ msg: "Unlike Successfully" })
})

module.exports = router