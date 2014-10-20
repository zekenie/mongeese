var async = require('async');
var mongoose = require('mongoose');
var _ = require('lodash');
var middleArguments = function(a) {
  return _.initial(_.rest(a))
}

var capitalize = function(s) {
  return s[0].toUpperCase() + s.slice(1);
}

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


copyFromAsync.forEach(function(method) {

  var capitalMethod = capitalize(method)

  mongoose.Types.Array.prototype['_async'+ capitalMethod] = function() {
    var args = [this]
    for(var i = 0; i < arguments.length; i++) {
      args.push(arguments[i])
    }
    async[method].apply(async,args)
  }

  mongoose.Types.Array.prototype['async' + capitalMethod] = function() {
    var a = arguments
    this.ensurePopulated(function(err,self) {
      self['_async'+ capitalMethod].apply(self,a)
    })
  }
})


mongoose.Types.Array.prototype.__invoke = function() {
  var mapType = _.first(arguments)
  var realArgs = _.rest(arguments)
  var callback = _.last(realArgs)
  var method = _.first(realArgs)
  var args = middleArguments(realArgs);
  var iterator = function(doc,done) {
    args.unshift(doc);
    var fn = doc[method].bind.apply(doc[method],args)
    args.shift();
    fn(function() {
      done.apply(undefined,arguments)
    })
  }
  this[mapType](iterator,callback)
}

mongoose.Types.Array.prototype._invoke = function() {
  var fn = this.__invoke.bind(this,'_asyncMap');
  fn(arguments);
}

mongoose.Types.Array.prototype.invoke = function() {
  var fn = this.__invoke.bind(this,'asyncMap');
  fn.apply(undefined,arguments);
}