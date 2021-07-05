// 创建一个发布订阅者模式
function EventHub () {
  this.hub = Object.create(null)
  this.emit = function (event, data) {
    (this.hub[event] || []).forEach(handler => handler(data))
  }
  this.on = function (event, handler) {
    if (!this.hub[event]) this.hub[event] = []
    this.hub[event].push(handler)
  }
  this.off = function (event, handler) {
    const i = (this.hub[event] || []).findIndex(h => h === handler)
    if (i > -1) this.hub[event].splice(i, 1)
    if (this.hub[event].length === 0) delete this.hub[event]
  }
}

// 执行一次的事件监听
// 1. 利用闭包
function listenOnce (el, eventName, fn) {
  // 利用闭包
  let flag = false
  el.addEventListener(eventName, (e) => {
    if (!flag) fn(e)
    flag = true
  })
}
// 2. 利用addEventListener参数
function listenOnce1 (el, eventName, fn) {
  // element.addEventListener(event, function, useCapture/options)
  // useCapture 指定事件是否在捕获或冒泡阶段执行。true：捕获阶段。false: 冒泡阶段（默认）
  // options: {capture: 同上, once: 是否执行一次，调用后自动移除, passive: 是否调用e.preventDefault()，true为不调用，false调用(默认)，主要是触摸事件阻止浏览器主线程，可能会造成卡顿}
  return el.addEventListener(eventName, fn, { once: true })
}

// 是否是合法正则
function isRegExp (regexp) {
  try {
    const reg = new RegExp(regexp)
    reg.test()
    return true
  } catch (e) {
    return false
  }
}

// sleep方法
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 超出js精度的加法计算
function add (a, b) {
  if (typeof a !== 'string' && typeof a !== 'number' && typeof b !== 'string' && typeof b !== 'number') {
    return
  }
  if (!a && !b) return
  if (a && !b) return a
  if (!a && b) return b
  const len = a.length - b.length >= 0 ? a.length : b.length
  let res = []
  for (let i = len - 1; i >= 0; i--) {
    res[i] = (res[i] || 0) + (a.charAt(i) !== undefined ? (Number(a.charAt(i)) || 0) : 0) + (b.charAt(i) !== undefined ? (Number(b.charAt(i)) || 0) : 0)
    if (res[i] > 10) {
      if (i !== 0) {
        res[i] = res[i].toString().charAt(1)
      }
      res[i - 1] = 1
    }
  }
  return res.join('')
}


// 五舍六入计算，给定一个数和小数位数，使得数采用五舍六入的方式按照小数位数保留
function getNumber (num, dot) {
  if (typeof dot !== 'number' || typeof num !== 'number') return
  if (num === parseInt(num)) return num.toString() + (dot ? ('.' + repeatZero(dot)) : '')
  const DELIMITER = 5
  const repeatZero = count => '0'.repeat(count)
  const string = (string, start, end) => string.substring(start, end)
  const numberArr = num.toString().split('.')
  const integerNumber = numberArr[0]
  const decimalNumber = numberArr[1]
  const len = integerNumber.length
  const len1 = decimalNumber.length
  if (dot === 0) {
    if ([...decimalNumber][0] <= DELIMITER) return integerNumber
    return (+integerNumber + 1).toString()
  }
  if (len1 === 0) return integerNumber + '.' + repeatZero(dot)
  if (len1 === dot) {
    return num.toString()
  } else if (len1 < dot) {
    return integerNumber + '.' + decimalNumber + repeatZero(dot - len1)
  }
  const currentN = decimalNumber.charAt(dot)
  if (currentN <= DELIMITER) return integerNumber + '.' + string(decimalNumber, 0, dot)
  const newNum = +(integerNumber + string(decimalNumber, 0, dot)) + 1
  const newNumStr = newNum.toString()
  if (newNumStr.length > (len + dot)) return string(newNumStr, 0, len + 1) + '.' + string(newNumStr, len + 1, len + 1 + dot)
  return string(newNumStr, 0, len) + '.' + string(newNumStr, len, len + dot)
}

// 缓存函数
function memoize (fundamental, cache) {
  cache = cache || {}
  return function (arg) {
    if (!cache.hasOwnProperty(arg)) {
      cache[arg] = fundamental(arg)
    }
    return cache[arg]
  }
}

// 简易红包算法
function getLuckyMoney (money = 0.01, count = 1) {
  const getRandom = (min, max) => {
    const multi = (val) => val * 100
    const value = Math.random() * (multi(max) - multi(min) + 1) + multi(min)
    return Math.floor(value) / 100
  }
  const BASE_LOW = 0.01
  const RADIX = 2
  let restMoney = money
  let restCount = count
  return function () {
    if (restCount === 0) return
    if (restCount === 1) {
      restCount = 0
      return restMoney
    }
    const randomMoney = getRandom(BASE_LOW, (restMoney / restCount) * RADIX)
    restMoney = +(restMoney - randomMoney).toFixed(2)
    restCount = restCount - 1
    return randomMoney
  }
}

// 基于callback超时
function timeoutFn (fn, time, successCb, failedCb) {
  var result
  Promise.resolve(fn()).then(res => {
    result = res
  }).catch(e => {
    console.log('请求错误！')
  })
  setTimeout(() => {
    if (result) {
      successCb(res)
    } else {
      console.log('请求超时！')
      failedCb()
    }
  }, time)
}

// 基于promise超时
function timeoutFn2 (fn, time, successCb, failedCb) {
  const timeoutPromise = () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject()
      }, time)
    })
  }
  return Promise.race([
    Promise.resolve(fn()),
    timeoutPromise()
  ]).then(res => {
    successCb(res)
  }).catch(e => {
    console.log('请求超时！')
    failedCb(e)
  })
}