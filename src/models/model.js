const { PrismaClient } = require("@prisma/client")
const { account, album, artists, board, favorite, role, entertainment, token } = new PrismaClient()

module.exports.account = account
module.exports.album = album
module.exports.artists = artists
module.exports.board = board
module.exports.favorite = favorite
module.exports.role = role
module.exports.entertainment = entertainment
module.exports.token = token