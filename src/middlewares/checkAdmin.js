module.exports = async (req, res, next) => {
  if (req.account.role["role_name"] != "admin") {
    return res.status(401).send({ msg: "User can't access" })
  }
  next()
}