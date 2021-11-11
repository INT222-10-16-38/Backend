const router = require("express").Router()
const { favorite } = require("../models/model")
const { validateFavorite } = require("../helpers/validation")

router.get("/", async (req, res) => {
  let results
  try {
    results = await favorite.findMany({
      include: {
        account: true,
        album: true
      }
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  return res.send({ data: results })
})

router.post("/add", async (req, res) => {
  let body = req.body
  const { error } = validateFavorite(body)
  if (error) return res.send({ err: error.details[0].message })

  try {
    await favorite.create({
      data: body
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  return res.send({ status: "Add favorite Successfully", err: false })
})

// When using authen delete userId
// This is unfavorite function
router.delete("/delete/:aid/:uid", async (req, res) => {
  let aid = Number(req.params.aid)
  let uid = Number(req.params.uid)

  if (!aid || !uid) {
    return res.status(500).send({ msg: "Please assign albumId and userId" })
  }

  try {
    await favorite.deleteMany({
      where: {
        account_id: uid,
        album_id: aid
      }
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  return res.send({ msg: "Delete Successfully" })
})


module.exports = router