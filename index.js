var async = require('async');
var mongoose = require('mongoose');
var _ = require('lodash');
var middleArguments = function(a) {
  return _.initial(_.rest(a))
}

// module.exports = function(mongoose) {
  mongoose.Document.prototype.ensurePopulated = function(path,cb) {
    var self = this;
    if(this.populated(path)) {
      process.nextTick(function() {
        cb(null,self)
      })
    } else {
      self.populate(path,cb);
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
    mongoose.Types.Array.prototype['_'+method] = function() {
      var args = [this].concat(arguments)
      async[method].apply(async,args)
    }

    mongoose.Types.Array.prototype[method] = function() {
      var a = arguments
      this.ensurePopulated(function(err,self) {
        self['_'+method].apply(self,a)
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
    arr.map(iterator,callback)
  }
