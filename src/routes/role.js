const router = require("express").Router()
const { role } = require("../models/model")
const { validateRole } = require("../helpers/validation")

router.get("/", async (req, res) => {
  let result = role.findMany()
  return res.send({ data: result })
})

router.post("/add", async (req, res) => {
  let existsRole = await role.findFirst({
    where: {
      role_name: req.body.role_name
    }
  })
  const { error } = validateRole(req.body)
  if (error) return res.status(400).send({ err: error.details[0].message })

  console.log(existsRole)
  if (existsRole) {
    return res.status(400).send({ msg: "Role is exists" })
  }
  let addRole = await role.create({
    data: {
      role_name: req.body.role_name
    }
  })
  return res.send({ msg: "Create Successfully", data: addRole })
})

router.put("/edit/:id", async (req, res) => {
  let id = req.params.id
  let existsRole = await role.findFirst({
    where: {
      role_id: id
    }
  })
  if (!existsRole) {
    return res.status(400).send({ msg: "Role doesn't exists" })
  }

  const { error } = validateRole(body)
  if (error) return res.status(400).send({ err: error.details[0].message })

  let updatedRole = await role.update({
    data: {
      role_name: req.body.role_name
    }
  })

  return res.send({ msg: "Update Successfully", data: updatedRole })
})

module.exports = router