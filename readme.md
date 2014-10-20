[ ![Codeship Status for zekenie/mongeese](https://www.codeship.io/projects/74397470-39c8-0132-7358-4e57ec3927cd/status)](https://www.codeship.io/projects/42254)

![Dependencies](https://david-dm.org/zekenie/mongeese.png)

# Mongeese

This library supercharges the [mongoose Array class](http://mongoosejs.com/docs/api.html#types-array-js) by adding some [async functional methods](https://github.com/caolan/async), and some extra goodies.

## Installation

```bash
$ npm install mongeese-array --save
```

Before you define your models, `require` mongeese. It will modify the prototypes of several mongoose classes, so you can't require it after you make your models.

## Async methods

Imagine you had a user class with an array of objectId references to kittens. With mongeese, you can do this

```javascript
var iterator = function(oneKitten,done) {
  done(null,oneKitten.name)
}

someUser.kittens.asyncMap(iterator,function(err,kittenNames) {
  // kitten names -> ['fluffy', 'cuddles', ...]
})
```

Mongeese will ensure that the path has been [populated](http://mongoosejs.com/docs/populate.html), but will not populate an already populated path.

Functions available directly from the async library:

- asyncEach
- asyncEachLimit
- asyncMap
- asyncMapLimit
- asyncReduce
- asyncReduceRight
- asyncSortBy
- asyncConcat

## Invoke

I've added an additional method that async hasn't implemented: invoke. Let's say you wanted to invoke the `meow` method on all the kittens in a user's kittens array.

```javascript
someUser.kittens.invoke('meow',arg1,arg2,callback)
```

After ensuring that the kittens array has been populated, Mongeese will asynchronously call the meow method on each kitten. `invoke` is really a front for async map, so it is assumes that the function you invoke will act sort of like an iterator.

## Development & Contribution

If you see anything wrong or want a feature, pull requests are welcome. To run the test suite

```bash
$ npm test
```