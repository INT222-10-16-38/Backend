const { artists } = require("../models/model")
const { validateArtist } = require("../helpers/validation")
const { readFile, dataNotValid, deleteFile } = require("../helpers/file")

let findAllArtists = async () => {
  let results
  try {
    results = await artists.findMany({
      include: {
        entertainment: true
      }
    })
  } catch (error) {
    throw new Error(error)
  }
  return results
}

let findArtistById = async (id) => {
  let results
  try {
    results = await artists.findMany({
      where: {
        art_id: id
      },
      include: {
        entertainment: true
      }
    })
  } catch (error) {
    throw new Error(error)
  }
  return results
}

let addArtist = async (files) => {
  let imgFile = []
  let result

  let jsonFile = files.find((file) => {
    if (file.mimetype != "application/json") {
      imgFile.push(file)
    }
    return file.mimetype == "application/json"
  })
  if (!jsonFile) {
    throw new Error("Please send jsonData")
  }

  try {
    let body = await readArtistData(jsonFile, imgFile, null)
    result = await artists.create({
      data: body
    })
  } catch (error) {
    throw new Error(error)
  }
  return result
}

let editArtist = async (id, files) => {
  let imgFile = []
  let findedArtist
  try {
    findedArtist = await artists.findFirst({
      where: {
        art_id: id
      },
      select: {
        art_image: true
      }
    })
  } catch (error) {
    throw new Error(error)
  }

  let jsonFile = files.find((file) => {
    if (file.mimetype != "application/json") {
      imgFile.push(file)
    }
    return file.mimetype == "application/json"
  })
  if (!jsonFile) {
    await dataNotValid(files)
    return res.status(500).send({ msg: `Please send jsonData` })
  }

  let result
  try {
    let body = await readArtistData(jsonFile, imgFile, findedArtist)
    result = await artists.update({
      data: body,
      where: {
        art_id: id
      }
    })
  } catch (error) {
    throw new Error(error)
  }

  for (const [index, img] of imgFile.entries()) {
    if (findedArtist["art_image"] != "default_art.png") {
      await deleteFile(findedArtist["art_image"])
    }
  }
  return result
}

let readArtistData = async (jsonFile, imgFile, findedArtist) => {
  let body
  try {
    body = await readFile(jsonFile)
    await deleteFile(jsonFile.filename)
    if (findedArtist) {
      body["art_image"] = findedArtist["art_image"]
    }
    for (const [index, img] of imgFile.entries()) {
      if (img.fieldname == "art_image") {
        body["art_image"] = await img.filename
      }
    }
    const { error } = validateArtist(body)
    if (error) throw new Error(error.details[0].message)
  } catch (error) {
    throw new Error(error)
  }
  return body
}

let deleteArtist = async (id) => {
  let result
  try {
    result = await artists.delete({
      where: {
        art_id: id
      }
    })
    await deleteFile(result["art_image"])
  } catch (error) {
    throw new Error(error.message)
  }
  return result
}

module.exports = { findAllArtists, findArtistById, addArtist, editArtist, deleteArtist }