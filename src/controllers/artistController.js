const { artists } = require("../models/model")
const { validateArtist } = require("../helpers/validation")
const { readFile, dataNotValid, deleteFile, sortData } = require("../helpers/file")

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
    results = await artists.findFirst({
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
  let result
  let { imgFile, jsonFile } = await sortData(files)

  if (!jsonFile) {
    throw new Error("Please send jsonData")
  }

  try {
    let body = await readArtistData(jsonFile, imgFile, null)
    let checkArtistName = await alreadyArtistName(body["art_name"])
    if (checkArtistName) {
      throw new Error(`Artist ${checkArtistName.art_name} already exists`)
    }
    result = await artists.create({
      data: body
    })
  } catch (error) {
    throw new Error(error)
  }
  return result
}

let editArtist = async (id, files) => {
  let { imgFile, jsonFile } = await sortData(files)
  let findedArtist
  try {
    findedArtist = await artists.findFirst({
      where: {
        art_id: id
      },
      select: {
        art_id: true,
        art_image: true
      }
    })
  } catch (error) {
    throw new Error(error)
  }

  if (!findedArtist) {
    throw new Error(`Artist not founded`)
  }

  if (!jsonFile) {
    await dataNotValid(files)
    return res.status(500).send({ msg: `Please send jsonData` })
  }

  let result
  try {
    let body = await readArtistData(jsonFile, imgFile, findedArtist)
    let checkArtistName = await alreadyArtistName(body["art_name"])
    if (checkArtistName) {
      if (checkArtistName.art_id != findedArtist.art_id) {
        throw new Error(`Artist ${checkArtistName.art_name} already exists`)
      }
    }
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
    if (findedArtist["art_image"] != "default_image.png") {
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

let alreadyArtistName = async (artistName) => {
  let results
  try {
    results = await artists.findFirst({
      where: {
        art_name: {
          equals: artistName
        }
      },
      select: {
        art_id: true,
        art_name: true
      }
    })
  } catch (error) {
    throw new Error(error.message)
  }
  return results
}

module.exports = { findAllArtists, findArtistById, addArtist, editArtist, deleteArtist }