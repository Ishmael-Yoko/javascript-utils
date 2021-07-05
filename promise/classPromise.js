const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";
function _isPromise (parmas) {
  return parmas !== undefined && parmas !== null && typeof parmas.then === 'function' && typeof parmas.catch === 'function'
}

function _isIterator (parmas) {
  return Symbol.iterator in parmas
}

class MyPromise {
  
  constructor(fn) {
    this.status = PENDING
    this.value = null
    this.error = null
    this.resolveCallbacks = []
    this.rejectCallbacks = []

    this._resolve = this._resolve.bind(this)
    this._reject = this._reject.bind(this)
    try {
      // resolve执行的时候需要绑定this
      fn(this._resolve, this._reject)
    } catch (e) {
      this._reject(e)
    }
  }

  _resolve (value) {
    if (value instanceof MyPromise) {
      return value.then(this._resolve, this._reject)
    }
    if (this.status === PENDING) {
      setTimeout(() => {
        this.status = FULFILLED
        this.value = value
        this.resolveCallbacks.forEach(callback => callback(this.value))
      })
    }
  }

  _reject (error) {
    if (this.status === PENDING) {
      setTimeout(() => {
        this.status = REJECTED
        this.error = error
        this.rejectCallbacks.forEach(callback => callback(this.error))
      })
    }
  }

  _resolvePromise(nextPromise, x, resolve, reject) {
    //2.3.1规范，避免循环引用
    if (nextPromise === x) {
        return reject(new TypeError('Circular reference'));
    }
    let called = false;
    if (x != null && ((typeof x === 'object') || (typeof x === 'function'))) {
      try {
        let then = x.then;
        if (typeof then === 'function') {
            then.call(x, y => {
              if (called) return;
              called = true;
              this._resolvePromise(nextPromise, y, resolve, reject);
            }, error => {
              if (called) return;
              called = true;
              reject(error);
            })
        } else {
          resolve(x);
        }
      } catch (e) {
        if (called) return;
        called = true;
        reject(e);
      }
    } else {
      resolve(x);
    }
  }

  then (onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : error => error
    let nextPromise
    if (this.status === FULFILLED) {
      return nextPromise = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            this._resolvePromise(nextPromise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
    }

    if (this.status === REJECTED) {
      return nextPromise = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            let x = onRejected(this.error)
            this._resolvePromise(nextPromise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
    }

    if (this.status === PENDING) {
      return nextPromise = new MyPromise((resolve, reject) => {
        this.resolveCallbacks.push((value) => {
          try {
            let x = onFulfilled(this.value)
            this._resolvePromise(nextPromise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })

        this.rejectCallbacks.push((error) => {
          try {
            let x = onRejected(error)
            this._resolvePromise(nextPromise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      })
    }
  }

  catch (onRejected) {
    return this.then(null, onRejected)
  }


  static resolve (anyParams) {
    return new MyPromise((resolve, reject) => {
      if (_isPromise(anyParams)) {
        return anyParams.then(resolve, reject)
      } else {
        resolve(anyParams)
      }
    })
  }

  static reject (errorParams) {
    return new MyPromise((resolve, reject) => {
      reject(errorParams)
    })
  }

  static finally (callback) {
    if (typeof callback !== 'function') {
      return
    }

    this.then(value => {
      return MyPromise.resolve(callback()).then(() => {
        return value
      })
    }, error => {
      return MyPromise.resolve(callback()).then(() => {
        throw error
      })
    })
  }

  static all (promises) {
    if (!_isIterator(promises)) {
      return
    }

    return MyPromise((resolve, reject) => {
      let result = []
      let index = 0
      let len = promises.len || promises.size
      if (len === 0) {
        resolve(result)
        return
      }

      for (let i = 0; i < len; i++) {
        MyPromise.resolve(promises[i]).then(res => {
          result[i] = res
          index++
          if (index === len) {
            resolve(result)
          }
        }).catch(e => {
          reject(e)
        })
      }
    })
  }

  static race (promises) {
    if (!_isIterator(promises)) {
      return
    }

    return MyPromise((resolve, reject) => {
      let len = promises.length || promises.size
      if (len === 0) {
        return
      }

      for (let i = 0; i < len; i++) {
        MyPromise.resolve(promises[i]).then(res => {
          resolve(res)
          return
        }).catch(e => {
          reject(e)
          return
        })
      }
    })
  }
}

module.exports = MyPromise


// let fs = require('fs');

// let readFilePromise = (filename) => {
//   return new MyPromise((resolve, reject) => {
//     fs.readFile(filename, (err, data) => {
//       if(!err){
//         resolve(data);
//       }else {
//         reject(err);
//       }
//     })
//   })
// }
// readFilePromise('./text1.txt').then(data => {
//   console.log(data.toString());

//   return readFilePromise('./text2.txt');
// }).then(data => {
//   console.log(data.toString());
// })


MyPromise.resolve().then(() => {
  console.log(0);
  return MyPromise.resolve(4);
}).then((res) => {
  console.log(res)
  return MyPromise.resolve(8);
}).then(res => {
  console.log(res)
  return new MyPromise((res, rej) => {
    res(11)
  }).then(res => {
    console.log(res)
  })
})

MyPromise.resolve().then(() => {
  console.log(1);
}).then(() => {
  console.log(2);
}).then(() => {
  console.log(3);
}).then(() => {
  console.log(5);
}).then(() =>{
  console.log(6);
}).then(() =>{
  console.log(7);
}).then(() =>{
  console.log(9);
}).then(() =>{
  console.log(10);
})


async function async1() {
  console.log("async1 start");
  await  async2();
  console.log("async1 end");
}

async function async2() {
  console.log('async2');
}

console.log("script start");

setTimeout(function () {
  console.log("settimeout");
},0);

async1();

new MyPromise(function (resolve) {
  console.log("promise1");
  resolve();
}).then(function () {
  console.log("promise2");
});
console.log('script end'); 

// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// settimeout