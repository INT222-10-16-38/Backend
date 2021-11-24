const { favorite } = require("../models/model")

let getByUserId = async (id) => {
  let results
  try {
    results = await favorite.findMany({
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

let getAllFavorite = async () => {
  let result
  try {
    result = await favorite.findMany({
      select: {
        fav_id: true,
        account_id: true,
        album_id: true
      }
    })
  } catch (error) {
    throw new Error(error)
  }
  return result
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

module.exports = { getAllFavorite, getByUserId, favoriteAlbum, unFavoriteAlbum }