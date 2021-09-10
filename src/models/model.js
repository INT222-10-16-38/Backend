const { PrismaClient } = require("@prisma/client")
const { account, album, artists, board, favorite } = new PrismaClient()

module.exports.account = account
module.exports.album = album
module.exports.artists = artists
module.exports.board = board
module.exports.favorite = favorite