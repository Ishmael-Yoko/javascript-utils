// 实现一个localstorage 带有过期时间
const localStorage = (function () {
  // 利用闭包，store将会暂时存在内存中，即便代码执行结束，也会存在。
   let store = {}
   return {
   getItem (key) {
     if (store[key] && store[key + 'time']) {
     const date = new Date().valueOf()
     if (date > store[key + 'time']) { // 过期了
       this.removeItem(key)
       return '已经过期了'
     }
     }
     return store[key] || null
   },
   setItem (key, value, time) {
     store[key] = value.toString()
     if (time) {
     // time 必须为时间戳类型
     store[key + 'time'] = time // 设置过期时间
     }
   },
   removeItem (key) {
     delete store[key]
   },
   clear () {
     store = {}
   }
   }
 })()


 // 实现add函数使得实现add(1)(2)(3)()=6 add(1,2,3)(4)()=10
function add (...args) {
  return !args.length ? 0 : (...newArgs) => {
    const allArgs = [...args,...newArgs]
    return !newArgs.length ? allArgs.reduce((p, n) => p + n, 0) : add(...allArgs)
  }
}

// 实现compFunc函数。使得实现
// a = compFunc(1)(2)
// a.getValue() // 3
// b = compFunc(1, 2, 3)(4)
// b.getValue() // 10
function compFunc (...args) {
  const fn = (...newArgs) => compFunc(...[...args,...newArgs])
  fn.getValue = () => args.reduce((p, n) => p + n, 0)
  return fn
}

// 实现一个将dom转为json的函数
function dom2Json (domTree) {
  const obj = {}
  obj.name = domTree.tagName || domTree.nodeValue
  obj.children = []
  domTree.childNodes.filter(c => c.nodeType !== 8).forEach(child => {
    obj.children.push(dom2Json(child))
  })
  return obj
}


// 将异步请求按照顺序执行，如
// var timeout = (ms) => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve()
//     }, ms)
//   })
// }

// var ajax1 = () =>
//   timeout(2000).then(()=> {
//     console.log(1)
//     return 1
//   })

// var ajax2 = () =>
//   timeout(1000).then(()=> {
//     console.log(2)
//     return 2
//   })

// var ajax3 = () =>
//   timeout(2000).then(()=> {
//     console.log(3)
//     return 3
//   })

// 实现函数体mergePromise 使得返回如下
// mergePromise([ajax1, ajax2, ajax3]).then((res) => {
//   console.log('done')
//   console.log(res)
//   //先按照顺序打印1,2,3，然后done 和 [1, 2, 3]
// })

var mergePromise = arr => {
  return new Promise((resolve, reject) => {
    (async () => {
      var result = []
      for (let i = 0; i < arr.length; i++) {
        var s = await arr[i]()
        result.push(s)
        if (result.length === arr.length) {
          resolve(result)
        }
      }
    })()
  })
}

var mergePromise1 = arr => {
  var result = []
  return new Promise((resolve, reject) => {
    arr.reduce((p, next, i) => {
      return p.then((res) => {
        i > 0 && result.push(res)
        if (i === arr.length - 1) {
          next().then(res1 => {
            result.push(res1)
            resolve(result)
          })
        }
        return next()
      })
    }, Promise.resolve())
  })
}
