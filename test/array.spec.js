var expect = require('expect.js');
var sinon = require('sinon')
var model = require('./model')
var async = require('async');
var doc = new model.s({refArray:[]})

var capitalize = function(s) {
  return s[0].toUpperCase() + s.slice(1);
}

describe('Array',function() {
  describe('Array#ensurePopulated',function() {
    it('should have method',function() {
      expect(doc.refArray.ensurePopulated).to.be.a(Function)
    })

    it('should call the _parent #ensurePopulated method', function() {
      var mock = sinon.mock(doc)
      mock.expects('ensurePopulated').once()
      doc.refArray.ensurePopulated();
    })
  })

  describe('Array#[async methods]', function() {
    it('should have all of them in the prototype', function() {
      var methods = ['each',
                     'eachLimit',
                     'map',
                     'mapLimit',
                     'reduce',
                     'reduceRight',
                     'sortBy',
                     'concat']
      methods.forEach(function(method) {
        expect(doc.refArray['_async'+capitalize(method)]).to.be.a(Function);
      })
    })

    it('should call the raw async method with the proper args', function() {
      var spy = sinon.spy(async, 'each')
      var iterator = function() {}
      var cb = function() {}
      spy.calledWithExactly(doc.refArray,iterator,cb)
      doc.refArray._asyncEach(iterator,cb)
    })

    it('should call raw async methods from cooked ones', function() {
      sinon.stub(doc.refArray, 'ensurePopulated', function(cb) {
        cb(null,this);
      })

      var mock = sinon.mock(doc.refArray)
      mock.expects('_asyncEach').once()

      doc.refArray.asyncEach()
    })

  })

  describe('Array#invoke',function() {

    describe('#_invoke',function() {
      it('should call #_asyncMap', function() {
        var mock = sinon.mock(doc.refArray)
        mock.expects('_asyncMap').once()
        doc.refArray._invoke()
      })
    })

    describe('#invoke', function() {
      it('should call #map',function() {
        var mock = sinon.mock(doc.refArray)
        mock.expects('asyncMap').once()
        doc.refArray.invoke()
        doc.refArray.asyncMap.restore()
      })
    })

    describe('#__invoke',function() {
      it('should call param one',function() {
        var mock = sinon.mock(doc.refArray)
        mock.expects('map').once()
        doc.refArray.__invoke('map')
      })
    });
  })
});








