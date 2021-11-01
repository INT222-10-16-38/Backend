module.exports = async (req, res, next) => {
  if (req.account.role != "Admin") {
    return res.status(401).send({ msg: "User can't access" })
  }
  next()
}