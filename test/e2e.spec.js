var expect = require('expect.js');
var model = require('./model')
var mongoose = require('mongoose')

var s = new model.s()
var s2_1 = new model.s2({num: 1})
var s2_2 = new model.s2({num: 2})

describe('e2e',function() {
  before(function(done) {
    mongoose.connect('mongodb://localhost/mongeese-test',done)
  })

  before(function(done) {
    s.refArray.push(s2_1)
    s.refArray.push(s2_2)

    s.save(done)
  })

  before(function(done) {
    s2_1.save(done)
  })

  before(function(done) {
    s2_2.save(done)
  })

  it('should be able to ensure populated on the document', function(done) {
    s.ensurePopulated('refArray',function(err,doc) {
      expect(!!doc.populated('refArray')).to.be(true);
      done();
    })
  })

  it('should be able to ensure populated on the array', function(done) {
    s.refArray.ensurePopulated(function(err,refArray) {
      expect(typeof refArray[0].id).to.be("string")
      done();
    })
  })

  it('should be able to map', function(done) {
    var iterator = function(thing,cb) {
      cb(null,thing.num);
    }

    var callback = function(err,results) {
      expect(results).to.contain(1)
      expect(results).to.contain(2)
      done();
    }

    s.refArray.asyncMap(iterator,callback)
  })

  it('should have proper invoke feedback',function(done) {
    s.refArray.invoke('asyncAction', 2, function(err,results) {
      expect(results.length).to.be(2);
      expect(results).to.contain(2)
      expect(results).to.contain(4)
      done()
    });
  })
})