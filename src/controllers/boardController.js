const { board } = require("../models/model")
const { validateBoard } = require("../helpers/validation")
const { readFile, deleteFile, sortData } = require("../helpers/file")
const { calPage, calSkip } = require('../helpers/pagination');

let findAllBoard = async () => {
  let result
  try {
    result = await board.findMany({
      select: {
        b_id: true,
        b_title: true,
        b_caption: true,
        b_image: true,
        account: {
          select: {
            ac_id: true,
            ac_username: true,
            ac_fname: true,
            ac_lname: true,
            ac_image: true
          }
        }
      }
    })
  } catch (error) {
    throw new Error(error.message)
  }
  return result
}

let getBoardByPage = async (page, numberOfItem) => {
  let results
  let totalPage
  try {
    results = await board.findMany({
      select: {
        b_id: true,
        b_title: true,
        b_caption: true,
        b_image: true,
        account: {
          select: {
            ac_id: true,
            ac_username: true,
            ac_fname: true,
            ac_lname: true,
            ac_image: true
          }
        }
      },
      orderBy: {
        b_id: "desc"
      },
      skip: calSkip(page, numberOfItem),
      take: numberOfItem,
    })
  } catch (error) {
    throw new Error(error)
  }
  const totalBoard = await board.count()
  totalPage = calPage(totalBoard, numberOfItem)
  return { results, totalPage }
}

let addBoard = async (files, accountId) => {
  let { imgFile, jsonFile } = await sortData(files)

  if (!jsonFile) {
    throw new Error("Please send jsonData")
  }
  let boardData
  try {
    boardData = await readBoardData(jsonFile, imgFile, null, accountId)
  } catch (error) {
    throw new Error(error)
  }

  try {
    await board.create({
      data: boardData
    })
  } catch (error) {
    throw new Error(error.message)
  }
}

let editBoard = async (files, id, accountId) => {
  let findedBoard
  try {
    findedBoard = await board.findFirst({
      where: {
        b_id: id
      },
      select: {
        b_image: true,
        account_id: true
      }
    })
  } catch (error) {
    throw new Error(error.message)
  }

  if (!findedBoard) {
    throw new Error("Can't find board ID")
  }

  if (findedBoard.account_id != accountId) {
    throw new Error("Can't edit another board not own")
  }

  let { imgFile, jsonFile } = await sortData(files)

  if (!jsonFile) {
    throw new Error("Please send jsonData")
  }

  let boardData
  try {
    boardData = await readBoardData(jsonFile, imgFile, null, accountId)
  } catch (error) {
    throw new Error(error)
  }

  try {
    await board.update({
      where: {
        b_id: id
      },
      data: boardData
    })
  } catch (error) {
    throw new Error(error)
  }

  if (findedBoard.b_image != "") {
    await deleteFile(findedBoard.b_image)
  }
}

let readBoardData = async (jsonFile, imgFile, findedBoard, accountId) => {
  let boardData = await readFile(jsonFile)
  deleteFile(jsonFile.filename)
  if (findedBoard) {
    if (!findedBoard["b_image"]) {
      findedBoard["b_image"] = ""
    }
    boardData["b_image"] = findedBoard["b_image"]
  }
  for (const [index, img] of imgFile.entries()) {
    if (img.fieldname == "b_image") {
      boardData["b_image"] = await img.filename
    }
  }
  boardData["account_id"] = accountId
  const { error } = validateBoard(boardData)
  if (error) {
    throw new Error(error.details[0].message)
  }
  return boardData
}

let deleteBoard = async (id, accountId) => {
  let result
  try {
    result = await board.deleteMany({
      where: {
        AND: {
          b_id: id,
          account_id: accountId
        }
      }
    })
    if (result.count <= 0) {
      throw new Error("Can't delete another board not own")
    }
  } catch (error) {
    throw new Error(error)
  }
  if (result["b_image"]) {
    await deleteFile(result["b_image"])
  }
}

let deleteBoardByAdmin = async (id) => {
  let result
  try {
    result = await board.deleteMany({
      where: {
        b_id: id,
      }
    })
    if (result.count <= 0) {
      throw new Error("Can't delete")
    }
  } catch (error) {
    throw new Error(error)
  }
  if (result["b_image"]) {
    await deleteFile(result["b_image"])
  }
}
module.exports = { findAllBoard, getBoardByPage, addBoard, editBoard, deleteBoard, deleteBoardByAdmin }