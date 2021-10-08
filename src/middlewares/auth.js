const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")
const { token } = new PrismaClient()

module.exports = async (req, res, next) => {
  const receiveToken = req.cookies.token || req.body.authToken
  const isExpired = await token.findFirst({
    where: {
      token: receiveToken
    }
  })

  if (!token) {
    return res.status(401).send({ msg: "Please send token" })
  }

  if (isExpired) {
    return res.status(401).send({ msg: "Please login again" })
  }

  /*  const decode = jwt.verify(token, process.env.TOKEN_SECRET)
   if (!decode) {
     return res.status(401).send({ msg: "Invalid token" })
   }
   
   const findedUser = await account.findFirst({
     where: {
       ac_id: decode.id
     },
   }) */

  const findedUser = jwt.verify(receiveToken, process.env.TOKEN_SECRET)
  if (!findedUser) {
    return res.status(401).send({ msg: "Please Login again" })
  }
  /*   if (findedUser.ac_role != "admin") {
      return res.status(401).send({ msg: "User not allowed" })
    } */
  delete findedUser.ac_password
  req.account = findedUser
  req.token = receiveToken
  next()
}