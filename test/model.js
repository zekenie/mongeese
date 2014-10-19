var mongoose = require('mongoose')

require('../index')

var s = new mongoose.Schema({
  refArray: [{ type: mongoose.Schema.Types.ObjectId, ref: 's2' }]
})

var s2 = new mongoose.Schema({})


module.exports = {
  s: mongoose.model('s',s),
  s2: mongoose.model('s2',s2)
}