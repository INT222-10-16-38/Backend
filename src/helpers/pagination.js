const calSkip = (page, numberOfItem) => {
  return (page - 1) * numberOfItem
}

const calPage = (items, numberOfItem) => {
  return Math.ceil(items / numberOfItem)
}

module.exports.calSkip = calSkip
module.exports.calPage = calPage