const pointList = require('./point_list.json')
const nameList = require('./name_list.json')
const coordinates = require('./coordinate.json')
//
function id2name(id) {
  return Object.entries(nameList).find(i => i[1] === id)[0]
}

function name2id(name) {
  return nameList[name]
}
function getPositionFromId(id) {
  return coordinates[id]
}

function getPathPositions(id1, id2) {
  if (id1 === id2) return []
  return pointList[id1][id2].map(i => getPositionFromId(i))
}

module.exports = {
  getPositionFromId, getPathPositions, name2id
}
