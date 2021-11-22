const router = require("express").Router()
const upload = require("../middlewares/uploadFile")
const { dataNotValid } = require("../helpers/file")
const auth = require("../middlewares/auth")
const checkAdmin = require("../middlewares/checkAdmin")
const accountController = require("../controllers/accountController")

router.get("/", auth, checkAdmin, async (req, res) => {
  let results
  try {
    results = await accountController.getAllAccount()
  } catch (error) {
    return res.send({ status: "Can't get data", error: error.message })
  }
  return res.send({ data: results })
})

router.get("/page/:page", async (req, res) => {
  let page = Number(req.params.page)
  let numberOfItem = 20
  let results
  let totalPage
  try {
    let getByPage = await accountController.getAccountByPage(page, numberOfItem)
    results = getByPage.results
    totalPage = getByPage.totalPage
  } catch (error) {
    return res.status(500).send({ error: error })
  }
  return res.send({ data: results, page: page, totalPage: totalPage })
})

router.get("/:id", async (req, res) => {
  let id = Number(req.params.id)
  let results
  try {
    results = await accountController.getAccountById(id)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  if (!results) {
    return res.status(500).send({ msg: "Can't find userId" })
  }
  return res.send({ data: results })
})

router.post("/register", upload, async (req, res) => {
  let files = req.files
  let token
  try {
    token = await accountController.registerAccount(files)
  } catch (error) {
    dataNotValid(files)
    return res.status(500).send({ error: error.message })
  }
  return res.send({ status: "Create Account Successfully", token: token, })
})

router.patch("/edit/profile", upload, auth, async (req, res) => {
  let files = req.files
  let token
  try {
    token = await accountController.editAccount(files, req)
  } catch (error) {
    dataNotValid(files)
    return res.status(500).send({ error: error.message })
  }
  return res.send({ status: "Edit Account Successfully", token: token })
})

router.post("/login", async (req, res) => {
  let body = req.body
  let token
  try {
    token = await accountController.loginAccount(body)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Login Successfully", token: token })
})

router.patch("/edit/password", auth, async (req, res) => {
  try {
    await accountController.changePassword(req)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Change Password Successfully" })
})

router.delete("/delete", auth, async (req, res) => {
  try {
    await accountController.deleteAccount(req)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Delete Successfully" })
})

router.post("/logout", auth, async (req, res) => {
  try {
    await accountController.logoutAccount(req)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Logout Successfull" })
})

router.patch("/grant/:uid", auth, checkAdmin, async (req, res) => {
  let id = Number(req.params.uid)
  try {
    await accountController.grantAdmin(id)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Grant Admin Successfully" })
})

router.delete("/delete/byadmin/:uid", auth, checkAdmin, async (req, res) => {
  let id = Number(req.params.uid)
  try {
    await accountController.deleteAccountByAdmin(id)
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
  return res.send({ msg: "Delete Account Successfully" })
})

module.exports = router