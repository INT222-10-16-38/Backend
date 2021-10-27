const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")
const { token } = new PrismaClient()

module.exports = async (req, res, next) => {
  const receiveToken = req.headers['authorization']
  const splitBearer = receiveToken.split(' ')
  const useToken = splitBearer[1]

  const isExpired = await token.findFirst({
    where: {
      token: useToken
    }
  })

  if (!useToken) {
    return res.status(401).send({ msg: "Please send token" })
  }

  if (isExpired) {
    return res.status(401).send({ msg: "Please login again" })
  }

  let findedUser;
  try {
    findedUser = jwt.verify(useToken, process.env.TOKEN_SECRET)
  } catch (error) {
    return res.status(401).send({ msg: error.message })
  }

  if (!findedUser) {
    return res.status(401).send({ msg: "Please Login again" })
  }

  delete findedUser.ac_password
  req.account = findedUser
  req.token = receiveToken
  next()
}