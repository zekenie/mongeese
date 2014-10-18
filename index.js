var mongoose = require('mongoose');

var async = require('async');

var middleArguments = function(a) {
  return _.initial(_.rest(a))
}


mongoose.Document.prototype.ensurePopulated = function(path,cb) {
  var self = this;
  if(this.populated(path)) {
    process.nextTick(function() {
      cb(null,self)
    })
  } else {

  }
}

mongoose.Types.Array.prototype.ensurePopulated = function(cb) {
  var self = this;
  this._parent.ensurePopulated(self._path,function(err,doc) {
    cb(err,doc[self._path])
  })
}

var copyFromAsync = ['each',
                     'eachLimit',
                     'map',
                     'mapLimit',
                     'reduce',
                     'reduceRight',
                     'sortBy',
                     'concat'];

/*
  someCohort.workshops.map(iterator,callback)
 */

copyFromAsync.forEach(function(method) {
  mongoose.Types.Array.prototype[method] = function() {
    var a = arguments
    this.ensurePopulated(function(err,arr) {
      var args = [arr].concat(a)
      async[method].apply(async,args)
    })
  }
})

/*
  aCohort.students.invoke('ioEmit','fooMsg',{a:'b'},function(err,results) {

  })
 */

mongoose.Types.Array.prototype.invoke = function() {
  var callback = _.last(arguments)
  var method = _.first(arguments)
  var args = middleArguments(arguments);
  var iterator = function(doc,done) {
    args.push(done);
    doc[method].apply(doc,args)
  }
  this.ensurePopulated(function(err,arr) {
    arr.map(iterator,callback)
  })
}

// MongooseArray.prototype.each = function(iterator,cb) {
//   this.ensurePopulated(function(err,arr) {
//     async.each(arr,iterator,cb)
//   })
// }

// MongooseArray.prototype.map = function(iterator,cb) {
//   this.ensurePopulated(function(err,arr) {
//     async.map(arr,iterator,cb);
//   })
// }