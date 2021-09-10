const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")
const { account } = new PrismaClient()

module.exports = async (req, res, next) => {
  const token = req.cookies.token || req.body.authToken
  if (!token) {
    return res.status(401).send({ msg: "Please send token" })
  }

  const decode = jwt.verify(token, process.env.TOKEN_SECRET)
  if (!decode) {
    return res.status(401).send({ msg: "Invalid token" })
  }

  const findedUser = await account.findFirst({
    where: {
      ac_id: decode.id
    },
  })
  if (!findedUser) {
    return res.status(401).send({ msg: "Please Login again" })
  }
  if (findedUser.ac_role != "admin") {
    return res.status(401).send({ msg: "User not allowed" })
  }
  req.account = findedUser
  next()
}