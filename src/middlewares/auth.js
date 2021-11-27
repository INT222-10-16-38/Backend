const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")
const { blacklistToken } = new PrismaClient()

let auth = async (req, res, next) => {
  const receiveToken = req.headers['authorization']
  if (!receiveToken) {
    return res.status(401).send({ msg: "Please send token" })
  }
  const splitBearer = receiveToken.split(' ')
  const useToken = splitBearer[1]

  const blackListToken = await blacklistToken.findFirst({
    where: {
      token: receiveToken
    }
  })

  if (!useToken) {
    return res.status(401).send({ error: "Please send the correct token" })
  }

  if (blackListToken) {
    return res.status(401).send({ error: "Please login again" })
  }

  let findedUser;
  try {
    findedUser = jwt.verify(useToken, process.env.TOKEN_SECRET)
  } catch (error) {
    return res.status(401).send({ error: error.message })
  }

  if (!findedUser) {
    return res.status(401).send({ error: "Please Login again" })
  }

  delete findedUser.ac_password
  req.account = findedUser
  switch (req.account.role_id) {
    case 1:
      req.account.role = "Admin"
      break
    case 2:
      req.account.role = "User"
      break
  }
  delete req.account.role_id
  req.token = receiveToken
  next()
}

let checkAdmin = (req, res, next) => {
  if (req.account.role["role_name"] != "admin" && req.account.role["role_id"] != 1) {
    return res.status(401).send({ error: "User can't access" })
  }
  next()
}

module.exports = { auth, checkAdmin }