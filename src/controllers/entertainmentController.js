const { entertainment } = require("../models/model")
const { deleteFile, readFile, sortData } = require("../helpers/file")
const { validateEntertainment } = require("../helpers/validation")

let getAllEntertainment = async () => {
  let result
  try {
    result = await entertainment.findMany()
  } catch (error) {
    throw new Error(error.message)
  }
  return result
}

let getEntertainmentById = async (id) => {
  let result
  try {
    result = await entertainment.findFirst({
      where: {
        e_id: id
      },
      select: {
        artists: {
          select: {
            art_id: true,
            art_name: true,
            art_image: true
          }
        }
      }
    })
  } catch (error) {
    throw new Error(error.message)
  }
  return result
}

let addEntertainment = async (files) => {
  let { imgFile, jsonFile } = await sortData(files)
  if (!jsonFile) {
    throw new Error(`Please send jsonData`)
  }
  let body
  try {
    body = await readData(jsonFile, imgFile, null)
    let checkEntertainmentName = await alreadyEntertainmentName(body["e_name"])
    if (checkEntertainmentName) {
      throw new Error(`Entertainment ${checkEntertainmentName.e_name} already exists`)
    }
  }
  catch (error) {
    throw new Error(error)
  }
  let result
  try {
    result = await entertainment.create({
      data: body
    })
  } catch (error) {
    throw new Error(error)
  }
  return result
}

let editEntertainment = async (files, id) => {
  let { imgFile, jsonFile } = await sortData(files)
  if (!jsonFile) {
    throw new Error(`Please send jsonData`)
  }
  let findedEntertainment = await entertainment.findFirst({
    where: {
      e_id: id
    },
    select: {
      e_id: true,
      e_logo: true
    }
  })

  if (!findedEntertainment) {
    throw new Error("Entertainment not founded")
  }

  let body
  try {
    body = await readData(jsonFile, imgFile, findedEntertainment)
    let checkEntertainmentName = await alreadyEntertainmentName(body["e_name"])
    if (checkEntertainmentName.e_id != findedEntertainment.e_id) {
      throw new Error(`Entertainment ${checkEntertainmentName.e_name} already exists`)
    }
  }
  catch (error) {
    throw new Error(error)
  }
  let result
  try {
    result = await entertainment.update({
      data: body,
      where: {
        e_id: id
      }
    })
  } catch (error) {
    throw new Error(error)
  }

  if (findedEntertainment.e_logo != "") {
    deleteFile(findedEntertainment.e_logo)
  }
  return result
}

let deleteEntertainment = async (eid) => {
  let results
  try {
    results = await entertainment.delete({
      where: {
        e_id: eid
      }
    })
  } catch (error) {
    throw new Error(error)
  }
  await deleteFile(results.e_logo)
  return results
}

let readData = async (jsonFile, imgFile, findedEntertainment) => {
  let body = await readFile(jsonFile)
  await deleteFile(jsonFile.filename)
  if (findedEntertainment) {
    body["e_logo"] = findedEntertainment["e_logo"]
  }
  for (const [index, img] of imgFile.entries()) {
    if (img.fieldname == "e_logo") {
      body["e_logo"] = await img.filename
    }
  }
  const { error } = validateEntertainment(body)
  if (error) throw new Error(error.details[0].message)

  body["e_foundingdate"] = new Date(body["e_foundingdate"])
  return body
}

let alreadyEntertainmentName = async (entertainmentName) => {
  let results
  try {
    results = await entertainment.findFirst({
      where: {
        e_name: {
          equals: entertainmentName
        }
      },
      select: {
        e_id: true,
        e_name: true
      }
    })
  } catch (error) {
    throw new Error(error.message)
  }
  return results
}

module.exports = { getAllEntertainment, getEntertainmentById, addEntertainment, editEntertainment, deleteEntertainment }