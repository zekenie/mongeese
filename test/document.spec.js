var expect = require('expect.js');
var sinon = require('sinon')
var model = require('./model')

describe('Document#ensurePopulated',function() {
  it('should have method',function() {
    var doc = new model.s()
    expect(doc.ensurePopulated).to.be.a(Function)
  })

  it('should call populate if its not already ensurePopulated', function() {
    var doc = new model.s()
    var populatedStub = sinon.stub(doc,'populated')
    populatedStub.returns(false)

    var populateMock = sinon.mock(doc)
    populateMock.expects('populate').once()

    doc.ensurePopulated()
  })

  it('should not call populate if it is already populated',function(done) {
    var doc = new model.s()
    var populatedStub = sinon.stub(doc,'populated')
    populatedStub.returns(true)

    var populateMock = sinon.mock(doc)
    populateMock.expects('populate').never()

    doc.ensurePopulated('refArray',done)
  })
})