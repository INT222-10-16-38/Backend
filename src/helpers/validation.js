const Joi = require("joi")

const validateArtist = (data) => {
  const schema = Joi.object({
    art_name: Joi.string().min(1).required(),
    art_description: Joi.string().min(1).required(),
    art_image: Joi.string().required(),
    entertainment_id: Joi.number().required()
  })
  return schema.validate(data)
}

const validateBoard = (data) => {
  const schema = Joi.object({
    b_title: Joi.string().min(1).required(),
    b_caption: Joi.string().min(1).required(),
    b_image: Joi.string().allow(null, ''),
    account_id: Joi.number().min(1).required()
  })
  return schema.validate(data)
}

const validateAlbum = (data) => {
  const schema = Joi.object({
    a_name: Joi.string().min(1).required(),
    price: Joi.number().min(1).required(),
    release_date: Joi.date().required(),
    description: Joi.string().min(1).required(),
    cover_image: Joi.string().min(1).allow(null, '').required(),
    preview_image: Joi.string().min(1).allow(null, '').required(),
    artists_id: Joi.number().min(1).required(),
  })
  return schema.validate(data)
}

const validateRegister = (data) => {
  const schema = Joi.object({
    ac_username: Joi.string().min(6).lowercase().required(),
    ac_password: Joi.string().min(6).required(),
    ac_email: Joi.string().min(6).email().lowercase().required(),
    ac_fname: Joi.string().min(3).required(),
    ac_lname: Joi.string().min(3).required(),
    ac_image: Joi.string().min(3),
    role_id: Joi.number().required(),
  })
  return schema.validate(data)
}

const validateEditProfile = (data) => {
  const schema = Joi.object({
    ac_username: Joi.string().min(6).lowercase().required(),
    ac_email: Joi.string().min(6).email().lowercase().required(),
    ac_fname: Joi.string().min(3).required(),
    ac_lname: Joi.string().min(3).required(),
    ac_image: Joi.string().min(3),
  })
  return schema.validate(data)
}

const validateLogin = (data) => {
  const schema = Joi.object({
    ac_username: Joi.string().min(6).required(),
    ac_password: Joi.string().min(6).required(),
  })
  return schema.validate(data)
}

const validateEntertainment = (data) => {
  const schema = Joi.object({
    e_name: Joi.string().required(),
    e_description: Joi.string().required(),
    e_foundingdate: Joi.date().required(),
    e_logo: Joi.string().required()
  })
  return schema.validate(data)
}

const validateRole = (data) => {
  const schema = Joi.object({
    role_name: Joi.string().required()
  })
  return schema.validate(data)
}

module.exports.validateArtist = validateArtist
module.exports.validateBoard = validateBoard
module.exports.validateAlbum = validateAlbum
module.exports.validateRegister = validateRegister
module.exports.validateLogin = validateLogin
module.exports.validateEditProfile = validateEditProfile
module.exports.validateEntertainment = validateEntertainment
module.exports.validateRole = validateRole