const { favorite } = require("../models/model")

let getByUserId = (id) => {
  let results
  try {
    results = favorite.findMany({
      where: {
        account_id: id
      },
      include: {
        album: {
          include: {
            artists: true
          }
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
  return results
}

let favoriteAlbum = async (aid, uid) => {
  try {
    await favorite.create({
      data: {
        album_id: aid,
        account_id: uid
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

let unFavoriteAlbum = async (aid, uid) => {
  try {
    await favorite.deleteMany({
      where: {
        account_id: uid,
        album_id: aid
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

module.exports.getByUserId = getByUserId
module.exports.favoriteAlbum = favoriteAlbum
module.exports.unFavoriteAlbum = unFavoriteAlbum