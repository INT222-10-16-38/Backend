const router = require("express").Router()
const { entertainment } = require("../models/model")

router.get("/", async (req, res) => {
  let result
  try {
    console.log("Let try")
    result = await entertainment.findMany()
    console.log(result)
    return res.send({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(400).send({ msg: err.message })
  }
})

router.get("/:id", async (req, res) => {
  let result
  let id = Number(req.params.id)
  // let id = req.params.id
  try {
    result = await entertainment.findFirst({
      include: {
        artists: {
          where: {
            entertainment_id: id
          }
        }
      }
    })
    return res.send({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(400).send(err.message)
  }
})

module.exports = router