const Joi = require("@hapi/joi")

const validateArtist = (data) => {
    const schema = Joi.object({
        art_name: Joi.string().min(1).required(),
        art_type: Joi.string().min(1).required()
    })
    return schema.validate(data)
}

const validateBoard = (data) => {
    const schema = Joi.object({
        b_title: Joi.string().min(1).required(),
        b_caption: Joi.string().min(1).required(),
        b_image: Joi.string().min(1),
        account_ac_id: Joi.number().min(1).required()
    })
    return schema.validate(data)
}

const validateAlbum = (data) => {
    const schema = Joi.object({
        a_name: Joi.string().min(1).required(),
        price: Joi.number().min(1).required(),
        description: Joi.string().min(1).required(),
        cover_image: Joi.string().min(1).required(),
        preview_image: Joi.string().min(1).required(),
        artists_art_id: Joi.number().min(1).required(),
    })
    return schema.validate(data)
}

const validateRegister = (data) => {
    const schema = Joi.object({
        ac_username: Joi.string().min(6).required(),
        ac_password: Joi.string().min(6).required(),
        ac_email: Joi.string().min(6).email().required(),
        ac_fname: Joi.string().min(3).required(),
        ac_lname: Joi.string().min(3).required(),
        ac_image: Joi.string().min(3).required(),
        ac_role: Joi.string().min(3),
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

const validateFavorite = (data) => {
    const schema = Joi.object({
        album_a_id: Joi.number().min(1).required(),
        account_ac_id: Joi.number().min(1).required(),
    })
    return schema.validate(data)
}

module.exports.validateArtist = validateArtist
module.exports.validateBoard = validateBoard
module.exports.validateAlbum = validateAlbum
module.exports.validateRegister = validateRegister
module.exports.validateLogin = validateLogin
module.exports.validateFavorite = validateFavorite