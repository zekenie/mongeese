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

  mongoose.Types.Array.prototype.__invoke = function() {
    var mapType = _.first(arguments)
    var realArgs = _.rest(arguments)
    var callback = _.last(realArgs)
    var method = _.first(realArgs)
    var args = middleArguments(realArgs);
    var iterator = function(doc,done) {
      args.push(done);
      doc[method].apply(doc,args)
    }
    this[mapType](iterator,callback)
  }

  mongoose.Types.Array.prototype._invoke = function() {
    var fn = this.__invoke.bind(this,'_map');
    fn(arguments);
  }

  mongoose.Types.Array.prototype.invoke = function() {
    var fn = this.__invoke.bind(this,'map');
    fn(arguments);
  }




