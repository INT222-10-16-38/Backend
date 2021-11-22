module.exports = async (req, res, next) => {
  if (req.account.role["role_name"] != "admin" && req.account.role["role_id"] != 1) {
    return res.status(401).send({ error: "User can't access" })
  }
  next()
}