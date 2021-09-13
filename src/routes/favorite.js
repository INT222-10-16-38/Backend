const router = require("express").Router()
const { favorite } = require("../models/model")
const { validateFavorite } = require("../helpers/validation")

router.get("/", async (req, res) => {
  await favorite.findMany({
    include: {
      account: true,
      album: true
    }
  }).then((results) => {
    return res.send({ data: results })
  }).catch((err) => {
    return res.send({ status: "Can't get data", error: err })
  })
})

router.post("/add", async (req, res) => {
  let body = req.body
  const { error } = validateFavorite(body)
  if (error) return res.send({ err: error.details[0].message })

  await favorite.create({
    data: body
  })
  return res.send({ status: "Add favorite Successfully", err: false })
})

// When using authen delete userId
router.delete("/delete/:aid/:uid", async (req, res) => {
  let aid = Number(req.params.aid)
  let uid = Number(req.params.uid)

  if (!aid || !uid) {
    return res.status(400).send({ msg: "Please assign albumId and userId" })
  }

  let results = await favorite.deleteMany({
    where: {
      account_ac_id: uid,
      album_a_id: aid
    }
  })
  if (results.count <= 0) {
    return res.status(400).send({ msg: "Can't find Favorite" })
  }
  return res.send({ msg: "Delete Successfully" })
})


module.exports = router