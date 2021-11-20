const { account, blacklistToken } = require("../models/model")
const { calPage, calSkip } = require('../helpers/pagination');
const { readFile, deleteFile, dataNotValid } = require("../helpers/file")
const { validateRegister, validateLogin, validateEditProfile } = require("../helpers/validation")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

let getAllAccount = async () => {
  let results
  try {
    results = await account.findMany({
      select: {
        ac_id: true,
        ac_username: true,
        ac_image: true,
        role: true
      }
    })
  } catch (error) {
    throw new Error(error)
  }
  return results
}

let getAccountByPage = async (page, numberOfItem) => {
  let results
  let totalPage
  try {
    results = await account.findMany({
      skip: calSkip(page, numberOfItem),
      take: numberOfItem,
      select: {
        ac_id: true,
        ac_username: true,
        ac_image: true,
        role: true
      }
    })
    let totalAccount = await account.count()
    totalPage = calPage(totalAccount, numberOfItem)
  } catch (error) {
    throw new Error(error)
  }
  return { results, totalPage }
}

let getAccountById = async (id) => {
  let results
  try {
    results = await account.findFirst({
      where: {
        ac_id: id
      },
      select: {
        ac_id: true,
        ac_username: true,
        ac_fname: true,
        ac_lname: true,
        ac_email: true,
        ac_image: true,
        role: true
      }
    })
  } catch (error) {
    throw new Error(error)
  }

  delete results["ac_password"]
  return results
}

let registerAccount = async (files) => {
  if (!files) {
    throw new Error("Please send files")
  }
  let imgFile = []
  let jsonFile = files.find((file) => {
    if (!file.mimetype != "application/json") {
      imgFile.push(file)
    }
    return file.mimetype == "application/json"
  })
  if (!jsonFile) {
    throw new Error("Please send jsonFile")
  }

  let accountData
  try {
    accountData = await readAccountData(jsonFile, imgFile, null)
    const { error } = validateRegister(accountData)
    if (error) {
      throw new Error(error.details[0].message)
    }

    // Find with email
    let userExists = await account.findFirst({
      where: {
        OR: [
          { ac_email: accountData["ac_email"] },
          { ac_username: accountData["ac_username"] }
        ]
      },
      select: {
        ac_id: true
      }
    })
    // Check email if exists throw error
    if (userExists) {
      throw new Error("User or email already exists")
    }
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(accountData["ac_password"], salt)
    accountData["ac_password"] = hashedPassword
  } catch (error) {
    throw new Error(error)
  }

  accountData["role_id"] = 2 // Make all user regis to role user

  let token
  try {
    let result = await account.create({
      data: accountData,
      select: {
        ac_id: true,
        ac_username: true,
        ac_image: true,
        role: true
      }
    })
    token = jwt.sign(result, process.env.TOKEN_SECRET)
  } catch (error) {
    throw new Error(error)
  }
  return token
}

let loginAccount = async (bodyData) => {
  if (!bodyData) {
    throw new Error("Please send data")
  }
  bodyData["ac_username"] = bodyData["ac_username"].toLowerCase()
  const { error } = validateLogin(bodyData)
  if (error) throw new Error(error.details[0].message)

  let findedUser
  try {
    findedUser = await account.findFirst({
      where: {
        ac_username: bodyData["ac_username"]
      },
      select: {
        ac_id: true,
        ac_username: true,
        ac_image: true,
        ac_password: true,
        role: true
      }
    })
  } catch (error) {
    throw new Error(error)
  }
  if (!findedUser) {
    throw new Error("Invalid Username")
  }
  const validPassword = await bcrypt.compare(bodyData["ac_password"], findedUser["ac_password"])
  delete findedUser["ac_password"]
  if (!validPassword) {
    throw new Error("Invalid Password")
  }

  // Create TOKEN
  const token = jwt.sign(findedUser, process.env.TOKEN_SECRET)
  return token
}

let editAccount = async (files, req) => {
  let imgFile = []
  let jsonFile = files.find((file) => {
    if (file.mimetype != "application/json") {
      imgFile.push(file)
    }
    return file.mimetype == "application/json"
  })
  if (!jsonFile) {
    await dataNotValid(files)
    throw new Error(`Please send jsonData`)
  }
  let accountData = await readAccountData(jsonFile, imgFile, req)
  let isUsernameAndEmailUnique = await account.findFirst({
    where: {
      OR: [
        { ac_username: accountData["ac_username"] },
        { ac_email: accountData["ac_email"] }
      ]
    },
    select: {
      ac_id: true
    }
  })
  if (isUsernameAndEmailUnique) {
    if (isUsernameAndEmailUnique.ac_id != req.account["ac_id"]) {
      throw new Error("Username or Email exists")
    }
  }
  const { error } = validateEditProfile(accountData)
  if (error) {
    throw new Error(error.details[0].message)
  }

  let updateResult
  try {
    updateResult = await account.update({
      data: {
        ac_username: accountData["ac_username"],
        ac_fname: accountData["ac_fname"],
        ac_lname: accountData["ac_lname"],
        ac_email: accountData["ac_email"],
        ac_image: accountData["ac_image"]
      },
      where: {
        ac_id: req.account["ac_id"]
      },
      select: {
        ac_id: true,
        ac_username: true,
        ac_image: true,
        role: true
      }
    })
  } catch (error) {
    return res.status(500).send({ error: error })
  }

  if (updateResult) {
    for (const [index, img] of imgFile.entries()) {
      if (req.account.ac_image != "default_ac_image.png") {
        await deleteFile(req.account.ac_image)
      }
    }
  }
  const token = jwt.sign(updateResult, process.env.TOKEN_SECRET)
  return token
}

let changePassword = async (req) => {
  let { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new Error("Please fill old Password and new Password")
  }
  let findedUser = await account.findFirst({
    where: {
      ac_id: req.account["ac_id"]
    },
    select: {
      ac_password: true
    }
  })
  const validPassword = await bcrypt.compare(oldPassword, findedUser["ac_password"])
  if (!validPassword) {
    throw new Error("Invalid Old Password")
  }
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(newPassword, salt)
  await account.update({
    data: {
      ac_password: hashedPassword
    },
    where: {
      ac_id: req.account["ac_id"]
    }
  })
}

let deleteAccount = async (req) => {
  let id = req.account["ac_id"]
  try {
    await account.delete({
      where: {
        ac_id: id
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

let readAccountData = async (jsonFile, imgFile, req) => {
  let accountData = await readFile(jsonFile)
  deleteFile(jsonFile.filename)
  accountData["ac_username"] = accountData["ac_username"].toLowerCase()
  accountData["ac_email"] = accountData["ac_email"].toLowerCase()
  if (req) {
    if (req.account["ac_image"]) {
      accountData["ac_image"] = req.account["ac_image"]
    }
  }
  for (const [index, img] of imgFile.entries()) {
    if (img.fieldname == "ac_image") {
      accountData["ac_image"] = await img.filename
    }
  }
  return accountData
}

let logoutAccount = async (req) => {
  try {
    await blacklistToken.create({
      data: {
        token: req.token
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

let grantAdmin = async (id) => {
  try {
    await account.update({
      data: {
        role_id: 1
      },
      where: {
        ac_id: id
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

module.exports.getAllAccount = getAllAccount
module.exports.getAccountByPage = getAccountByPage
module.exports.getAccountById = getAccountById
module.exports.registerAccount = registerAccount
module.exports.loginAccount = loginAccount
module.exports.editAccount = editAccount
module.exports.changePassword = changePassword
module.exports.deleteAccount = deleteAccount
module.exports.logoutAccount = logoutAccount
module.exports.grantAdmin = grantAdmin