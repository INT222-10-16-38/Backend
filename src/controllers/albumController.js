let { album } = require("../models/model")
const { calPage, calSkip } = require('../helpers/pagination');
const { validateAlbum } = require("../helpers/validation")
const { readFile, deleteFile, sortData } = require("../helpers/file")

let getAllAlbums = async () => {
  let results
  try {
    results = await album.findMany({
      include: {
        artists: true
      }
    })
  } catch (error) {
    throw new Error(error)
  }
  return results
}

let getAlbumByPage = async (page, numberOfItem) => {
  let results
  let totalPage
  try {
    results = await album.findMany({
      skip: calSkip(page, numberOfItem),
      take: numberOfItem
    })
    let totalAlbum = await album.count()
    totalPage = calPage(totalAlbum, numberOfItem)
  } catch (error) {
    throw new Error
  }
  return { results, totalPage }
}

let getAlbumById = async (id) => {
  let results
  try {
    results = await album.findFirst({
      where: {
        a_id: id
      },
      include: {
        artists: true
      }
    })
  } catch (error) {
    throw new Error(error)
  }
  return results
}

let addAlbum = async (files) => {
  let { imgFile, jsonFile } = await sortData(files)

  if (!jsonFile) {
    throw new Error("Please Send Json File!")
  }

  try {
    let albumData = await readData(jsonFile, null, imgFile)
    await album.create({
      data: albumData
    })
  } catch (error) {
    throw new Error(error)
  }
}

let editAlbum = async (id, files) => {
  let findedAlbum = await album.findFirst({
    where: {
      a_id: id
    },
    select: {
      cover_image: true,
      preview_image: true
    }
  })
  if (!findedAlbum) {
    throw new Error("Can't find Album")
  }

  let { imgFile, jsonFile } = await sortData(files)
  if (!jsonFile) {
    throw new Error("Please Send Json File!")
  }
  let albumData = await readData(jsonFile, findedAlbum, imgFile)
  let updateResult = await album.update({
    where: {
      a_id: id
    },
    data: albumData
  })
  if (updateResult) {
    for (const [index, img] of imgFile.entries()) {
      if (findedAlbum.cover_image == "cover_image") {
        deleteFile(findedAlbum.cover_image)
      }
      if (findedAlbum.cover_image == "preview_image") {
        deleteFile(findedAlbum.preview_image)
      }
    }
  }
}

let deleteAlbum = async (id) => {
  try {
    let results = await album.delete({
      where: {
        a_id: id
      }
    })
    if (results.cover_image != "default_cover_image.jpg") {
      deleteFile(results.cover_image)
    }
    if (results.cover_image != "default_preview_image.png") {
      deleteFile(results.preview_image)
    }
  } catch (error) {
    throw new Error(error)
  }
}

let readData = async (jsonFile, findedAlbum, imgFile) => {
  let albumData = await readFile(jsonFile)
  await deleteFile(jsonFile.filename)
  if (findedAlbum) {
    albumData.cover_image = findedAlbum.cover_image
    albumData.preview_image = findedAlbum.preview_image
  }
  for (const [index, img] of imgFile.entries()) {
    if (img.fieldname == "cover_image") {
      albumData.cover_image = await img.filename
    }
    if (img.fieldname == "preview_image") {
      albumData.preview_image = await img.filename
    }
  }
  const { error } = validateAlbum(albumData)
  if (error) throw new Error(error.details[0].message)
  albumData.release_date = new Date(albumData.release_date)
  return albumData
}

module.exports.getAllAlbums = getAllAlbums
module.exports.getAlbumByPage = getAlbumByPage
module.exports.getAlbumById = getAlbumById
module.exports.addAlbum = addAlbum
module.exports.editAlbum = editAlbum
module.exports.deleteAlbum = deleteAlbum
