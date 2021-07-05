// 解析url的query参数为对象
// 'http://url.com/page?name=Adam&surname=Smith' => {name: 'Adam', surname: 'Smith'}
function getURLParameters(url) {
  if (!url || typeof url !== 'string') return {}
  const reg = /([^?=&]+)(=([^&]*))/g
  return (url.match(reg) || []).reduce((pre, next) => {
    const fIndex = next.indexOf('=');
    return (pre[next.slice(0, fIndex)] = next.slice(fIndex + 1), pre);
  }, {});
}


// 获取url的baseUrl
// 'http://url.com/page?name=Adam&surname=Smith' => http://url.com/page
function  getBaseURL (url) {
  return url.replace(/[?#].*&/, '')
}


// 怎样使用JavaScript修改浏览器URL，并且不重新刷新页面
// 1. 使用History API
window.history.pushState(state, title, url)
window.history.replaceState(state, title, url)
// 2. 使用location API 会刷新页面
window.location.href = 'https://my-website.com/page_b'
window.location.assign('https://my-website.com/page_b')
window.location.replace('https://my-website.com/page_b')

// 怎样使用JavaScript复制文本
// 1. 使用textarea dom的select方法，使用execCommand('copy')复制到文本，删除dom
function copyToClipboard (str, callback) {
  if (!str || typeof str !== 'string') return
  const el = document.createElement('textarea')
  el.value = str
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
  callback()
}
// 2. 使用 HTML5 API Clipboard 实现复制
function copyToClipboard (str, callback) {
  if (!str || typeof str !== 'string') return
  navigator.clipboard.writeText(str).then(_ => {
    callback()
  })
  navigator.clipboard.write(str).then(_ => {
    callback()
  })
}


// 解析cookie字符为对象
function parseCookie (cookie) {
  if (!cookie || typeof cookie !== 'string') return {}
  return cookie.split(';').map(c => c.split('=')).reduce((pre, next) => {
    const key = decodeURIComponent(next[0].trim())
    const value = decodeURIComponent(next[1].trim())
    pre[key] = value
    return pre
  }, {})
}


// 使用webworker 在单独的线程中运行一个函数，允许长时间运行，且不会阻止ui, 后台运行的代码
function runAsync (fn) {
  // 形成自执行函数字符串，使用blobURL形成worker的url
  const blobURL = URL.createObjectURL(new Blob([`postMessage((${fn})());`]), {type: 'application/javascript; charset=utf-8'})
  const worker = new Worker(blobURL)

  return new Promise((resolve, reject) => {
    worker.onmessage = ({data}) => {
      resolve(data)
      worker.terminate()
    }
    worker.onerror = (err) => {
      reject(err)
      worker.terminate()
    }
  })
}


// 将定义的虚拟DOM结构渲染为真实的dom,且含有属性和事件
function renderElement ({ type, props = {}}, container) {
  const isTextElement = !type;
  const element = isTextElement
    ? document.createTextNode('')
    : document.createElement(type);

  const isListener = p => p.startsWith('on');
  const isAttribute = p => !isListener(p) && p !== 'children';

  Object.keys(props).forEach(p => {
    if (isAttribute(p)) element[p] = props[p];
    if (!isTextElement && isListener(p))
      element.addEventListener(p.toLowerCase().slice(2), props[p]);
  });

  if (!isTextElement && props.children && props.children.length)
    props.children.forEach(childElement =>
      renderElement(childElement, element)
    );

  container.appendChild(element);
}
// examples
const myElement = {
  type: 'button',
  props: {
    type: 'button',
    className: 'btn',
    onClick: () => alert('Clicked'),
    children: [{ props: { nodeValue: 'Click me' } }]
  }
};
renderElement(myElement, document.body);


// 将formData中的数据序列化
function serializeForm (formDOM) {
  return Array.from(new FormData(formDOM), field => {
    field.map(encodeURIComponent).join('=')
  }).join('&')
}
serializeForm(document.querySelector('#form'));
// email=test%40email.com&name=Test%20Name


// 判断一个输入框输入的值是否是数字时，可以使用inputEl.valueAsNumber
const quantityInput = document.getElementById('quantity-input');
let quantity;
// 判断quantity是否时NaN即可
quantity = quantityInput.valueAsNumber;


// 给一个DOM注册多个事件，使用forEach循环，然后使用el.addEventListener即可


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
// example
const eventBus = new EventHub()
eventBus.on('mes', (data) => {
  console.log(data)
})
eventBus.emit('mes', 'hello eventBus')

// 转义HTML代码
function escapeHTML (str) {
  return str.replace(/[&<>'"]/g, tag => {
    const maps = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }
    return maps[tag] || tag
  })
}
escapeHTML('<a href="#">Me & you</a>'); 
// '&lt;a href=&quot;#&quot;&gt;Me &amp; you&lt;/a&gt;'

// 解析html代码
function unescapeHTML (str) {
  return str.replace(/&amp;|&lt;|&gt;|&#39;|&quot;/g, tag => {
    const maps = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&#39;': "'",
      '&quot;': '"'
    }
    return maps[tag] || tag
  });
}
unescapeHTML('&lt;a href=&quot;#&quot;&gt;Me &amp; you&lt;/a&gt;');
// '<a href="#">Me & you</a>'


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


// 事件冒泡，事件捕获，事件代理
// 1. 事件冒泡：事件目标接收到事件时，会把接收到的对象逐级向上传播，直至window对象。
// 2. 事件捕获：事件window对象接收到对象，然后向下，直至事件目标
// 3. 事件代理：利用事件冒泡的原理，将事件绑定目标对象的父级。优点： 性能提升、动态元素事件无需再次添加


// MutationObserver
// 提供了对DOM树的变化进行监听的能力
function observerMutation (element, callback, options) {
  const observer = new MutationObserver(callback)
  observer.observe(element, Object.assign({
    childList: true, // 监视目标节点添加或删除子节
    attributes: true, // 监视属性值变化
    attributeOldValue: true, //属性变化的前一个值
    characterData: true, // 目标节点子节点字符数据变化
    characterDataOldValue: true, // 目标节点子节点字符数据变化的前一个值
    subtree: true, // 监视子孙节点变化
  }, options))
  // observer.disconnect 阻止observer继续接收通知，直至再次调用observe方法
  return observer
}


// 从DOM中获取所有图片
function getImages (el, duplicates = false) {
  const images = [...el.getElementsByTagName('img')].map(image => image.getAttribute('src'))
  return duplicates ? images : [...new Set(images)]
}

// 当滚动停止时执行的回调，添加了防抖操作
function onScrollStop (callback) {
  let isScrollTimer
  window.addEventListener('scroll', (e) => {
    clearTimeout(isScrollTimer)
    isScrollTimer = setTimeout(() => {
      callback()
    }, 150)
  }, false)
}


// 使外链更加安全 a标签加上ref='noopener noreferrer'
// <a
//   href="https://externalresource.com/some-page"
//   target="_blank"
//   rel="noopener noreferrer"
// >
//   External resource
// </a>


// 判断是否是浏览器环境
function isBrowser () {
  return ![typeof window, typeof document].includes('undefined')
}

// 判断是否是node环境
function isNode () {
  return typeof process !== 'undefined' && !!process.versions && !!process.versions.node
}

// 判断是否是合法URL
function isAbsolute (str) {
  return /^[a-z][a-z0-9+.-]*:/.test(str)
}

// 返回页面顶部, 缓慢，利用requestAnimationFrame
function backTop () {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  if (scrollTop > 0) {
    window.requestAnimationFrame(backTop)
    window.scrollTo(0, scrollTop - scrollTop / 8)
  }
}

// 使用锚点使页面滚动 scrollIntoView
function scrollView (element) {
  document.querySelector(element).scrollIntoView({
    behavior: 'smooth'
  })
}


// addClass 添加class
function addClass (el, className) {
  el.classList.add(className)
} 
// removeClass 删除class
function removeClass (el, className) {
  el.classList.remove(className)
}

// 检测设备类型
function detectDeviceType () {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
}

// 检测用户是否在dark（黑暗）模式
function isDarkSchema () {
  return window && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}
// 检测用户是否在light（浅色）模式
function isLightSchema () {
  return window && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
}


// 获取滚动条的位置
function getScollPosition(el = window) {
  return {
    x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
    y: el.pageYOffset !== undefined ? el.pageYOffset : el.scrollTop
  }
}


// 全屏和退出全屏
function fullscreen (mode = true, el = 'body') {
  mode ? document.querySelector(el).requestFullscreen() : document.exitFullscreen()
}


// 是否支持localStorage
function isLocalStorage () {
  try {
    const key = '__STORAGE__'
    window.localStorage.setItem(key, null)
    window.localStorage.removeItem(key)
    return true
  } catch (e) {
    return false
  }
}
// 是否支持sessionStorage
function isSessionStorage () {
  try {
    const key = '__STORAGE__'
    window.sessionStorage.setItem(key, null)
    window.sessionStorage.removeItem(key)
    return true
  } catch (e) {
    return false
  }
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

// elementFocus获取focus元素或者判断是否focus
function elementFocus (element) {
  if (element) {
    return element === document.activeElement
  } else {
    return document.activeElement
  }
}

// 浏览器当前tab是否是可视状态
function isBrowserTabFocused () {
  return !document.hidden
}

// sleep方法
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// useAsync hooks
const useAsync = fn => {
  const initialState = { loading: false, error: null, value: null };
  const stateReducer = (_, action) => {
    switch (action.type) {
      case 'start':
        return { loading: true, error: null, value: null };
      case 'finish':
        return { loading: false, error: null, value: action.value };
      case 'error':
        return { loading: false, error: action.error, value: null };
    }
  };

  const [state, dispatch] = React.useReducer(stateReducer, initialState);

  const run = async (args = null) => {
    try {
      dispatch({ type: 'start' });
      const value = await fn(args);
      dispatch({ type: 'finish', value });
    } catch (error) {
      dispatch({ type: 'error', error });
    }
  };

  return { ...state, run };
};


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

// 排序算法
// 1. 冒泡
// 2. 快排
// 3. 堆排
// 4. 桶排
// 5. 归并排序
// 6. 选择排序
// 7. 插入排序


// 1. 第一部分：数组
// 1. `all`：布尔全等判断
const all = (arr, fn = Boolean) => arr.every(fn);
all([4, 2, 3], (x) => x > 1); // true
all([1, 2, 3]); // true

// 2. `allEqual`：检查数组各项相等
const allEqual = (arr) => arr.every((val) => val === arr[0]);
allEqual([1, 2, 3, 4, 5, 6]); // false
allEqual([1, 1, 1, 1]); // true

// 3.`approximatelyEqual`：约等于
const approximatelyEqual = (v1, v2, epsilon = 0.001) =>
  Math.abs(v1 - v2) < epsilon;
approximatelyEqual(Math.PI / 2.0, 1.5708); // true

// 4.`arrayToCSV`：数组转`CSV`格式（带空格的字符串）
const arrayToCSV = (arr, delimiter = ',') =>
  arr.map((v) => v.map((x) => `"${x}"`).join(delimiter)).join('\n');
arrayToCSV([
  ['a', 'b'],
  ['c', 'd'],
]); // '"a","b"\n"c","d"'
arrayToCSV(
  [
    ['a', 'b'],
    ['c', 'd'],
  ],
  ';'
); // '"a";"b"\n"c";"d"'

// 5.`arrayToHtmlList`：数组转`li`列表
// 此代码段将数组的元素转换为<li>标签，并将其附加到给定ID的列表中。
const arrayToHtmlList = (arr, listID) =>
  ((el) => (
    (el = document.querySelector('#' + listID)),
    (el.innerHTML += arr.map((item) => `<li>${item}</li>`).join(''))
  ))();

arrayToHtmlList(['item 1', 'item 2'], 'myListID');

// 6. `average`：平均数
const average = (...nums) =>
  nums.reduce((acc, val) => acc + val, 0) / nums.length;
average(...[1, 2, 3]); // 2
average(1, 2, 3); // 2

// 7. `averageBy`：数组对象属性平均数
// 此代码段将获取数组对象属性的平均值

const averageBy = (arr, fn) =>
  arr
    .map(typeof fn === 'function' ? fn : (val) => val[fn])
    .reduce((acc, val) => acc + val, 0) / arr.length;
averageBy([{ n: 4 }, { n: 2 }, { n: 8 }, { n: 6 }], (o) => o.n); // 5
averageBy([{ n: 4 }, { n: 2 }, { n: 8 }, { n: 6 }], 'n'); // 5

// 8.`bifurcate`：拆分断言后的数组
// 可以根据每个元素返回的值，使用reduce()和push() 将元素添加到第二次参数fn中 。
const bifurcate = (arr, filter) =>
  arr.reduce((acc, val, i) => (acc[filter[i] ? 0 : 1].push(val), acc), [
    [],
    [],
  ]);
bifurcate(['beep', 'boop', 'foo', 'bar'], [true, true, false, true]);
// [ ['beep', 'boop', 'bar'], ['foo'] ]

// 9. `castArray`：其它类型转数组
const castArray = (val) => (Array.isArray(val) ? val : [val]);
castArray('foo'); // ['foo']
castArray([1]); // [1]
castArray(1); // [1]

// 10. `compact`：去除数组中的无效/无用值
const compact = (arr) => arr.filter(Boolean);
compact([0, 1, false, 2, '', 3, 'a', 'e' * 23, NaN, 's', 34]);
// [ 1, 2, 3, 'a', 's', 34 ]

// 11. `countOccurrences`：检测数值出现次数
const countOccurrences = (arr, val) =>
  arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
countOccurrences([1, 1, 2, 1, 2, 3], 1); // 3

// 12. `deepFlatten`：递归扁平化数组
const deepFlatten = (arr) =>
  [].concat(...arr.map((v) => (Array.isArray(v) ? deepFlatten(v) : v)));
deepFlatten([1, [2], [[3], 4], 5]); // [1,2,3,4,5]

// 13. `difference`：寻找差异
// 此代码段查找两个数组之间的差异。
const difference = (a, b) => {
  const s = new Set(b);
  return a.filter((x) => !s.has(x));
};
difference([1, 2, 3], [1, 2, 4]); // [3]

// 14. `differenceBy`：先执行再寻找差异
// 在将给定函数应用于两个列表的每个元素之后，此方法返回两个数组之间的差异。
const differenceBy = (a, b, fn) => {
  const s = new Set(b.map(fn));
  return a.filter((x) => !s.has(fn(x)));
};
differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor); // [1.2]
differenceBy([{ x: 2 }, { x: 1 }], [{ x: 1 }], (v) => v.x); // [ { x: 2 } ]

// 15. `dropWhile`：删除不符合条件的值
// 此代码段从数组顶部开始删除元素，直到传递的函数返回为true。
const dropWhile = (arr, func) => {
  while (arr.length > 0 && !func(arr[0])) arr = arr.slice(1);
  return arr;
};
dropWhile([1, 2, 3, 4], (n) => n >= 3); // [3,4]

// 16. `flatten`：指定深度扁平化数组
// 此代码段第二参数可指定深度。
const flatten = (arr, depth = 1) =>
  arr.reduce(
    (a, v) =>
      a.concat(depth > 1 && Array.isArray(v) ? flatten(v, depth - 1) : v),
    []
  );
flatten([1, [2], 3, 4]); // [1, 2, 3, 4]
flatten([1, [2, [3, [4, 5], 6], 7], 8], 2); // [1, 2, 3, [4, 5], 6, 7, 8]

// 17. `indexOfAll`：返回数组中某值的所有索引
// 此代码段可用于获取数组中某个值的所有索引，如果此值中未包含该值，则返回一个空数组。
const indexOfAll = (arr, val) =>
  arr.reduce((acc, el, i) => (el === val ? [...acc, i] : acc), []);
indexOfAll([1, 2, 3, 1, 2, 3], 1); // [0,3]
indexOfAll([1, 2, 3], 4); // []

// 18. `intersection`：两数组的交集
const intersection = (a, b) => {
  const s = new Set(b);
  return a.filter((x) => s.has(x));
};
intersection([1, 2, 3], [4, 3, 2]); // [2, 3]

// 19. `intersectionWith`：两数组都符合条件的交集
// 此片段可用于在对两个数组的每个元素执行了函数之后，返回两个数组中存在的元素列表。
const intersectionBy = (a, b, fn) => {
  const s = new Set(b.map(fn));
  return a.filter((x) => s.has(fn(x)));
};
intersectionBy([2.1, 1.2], [2.3, 3.4], Math.floor); // [2.1]

// 20. `intersectionWith`：先比较后返回交集
const intersectionWith = (a, b, comp) =>
  a.filter((x) => b.findIndex((y) => comp(x, y)) !== -1);
intersectionWith(
  [1, 1.2, 1.5, 3, 0],
  [1.9, 3, 0, 3.9],
  (a, b) => Math.round(a) === Math.round(b)
); // [1.5, 3, 0]

// 21. `minN`：返回指定长度的升序数组
const minN = (arr, n = 1) => [...arr].sort((a, b) => a - b).slice(0, n);
minN([1, 2, 3]); // [1]
minN([1, 2, 3], 2); // [1,2]

// 22. `negate`：根据条件反向筛选
const negate = (func) => (...args) => !func(...args);
[1, 2, 3, 4, 5, 6].filter(negate((n) => n % 2 === 0)); // [ 1, 3, 5 ]

// 23. `randomIntArrayInRange`：生成两数之间指定长度的随机数组
const randomIntArrayInRange = (min, max, n = 1) =>
  Array.from(
    { length: n },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );
randomIntArrayInRange(12, 35, 10); // [ 34, 14, 27, 17, 30, 27, 20, 26, 21, 14 ]

// 24. `sample`：在指定数组中获取随机数
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
sample([3, 7, 9, 11]); // 9

// 25. `sampleSize`：在指定数组中获取指定长度的随机数
// 此代码段可用于从数组中获取指定长度的随机数，直至穷尽数组。
// 使用Fisher-Yates算法对数组中的元素进行随机选择。
const sampleSize = ([...arr], n = 1) => {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr.slice(0, n);
};
sampleSize([1, 2, 3], 2); // [3,1]
sampleSize([1, 2, 3], 4); // [2,3,1]

// 26. `shuffle`：“洗牌” 数组
// 此代码段使用Fisher-Yates算法随机排序数组的元素。
const shuffle = ([...arr]) => {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
};
shuffle([1, 2, 3]); // [2, 3, 1]

// 27. `nest`：根据`parent_id`生成树结构（阿里一面真题）
// 根据每项的parent_id，生成具体树形结构的对象。
const nest = (items, id = null, link = 'parent_id') =>
  items
    .filter((item) => item[link] === id)
    .map((item) => ({ ...item, children: nest(items, item.id) }));
// 用法：
const comments = [
  { id: 1, parent_id: null },
  { id: 2, parent_id: 1 },
  { id: 3, parent_id: 1 },
  { id: 4, parent_id: 2 },
  { id: 5, parent_id: 4 },
];
const nestedComments = nest(comments); // [{ id: 1, parent_id: null, children: [...] }]

// 2. 第二部分：函数
// 1.`attempt`：捕获函数运行异常
// 该代码段执行一个函数，返回结果或捕获的错误对象。
const attempt = (fn, ...args) => {
  try {
    return fn(...args);
  } catch (e) {
    return e instanceof Error ? e : new Error(e);
  }
};
var elements = attempt(function (selector) {
  return document.querySelectorAll(selector);
}, '>_>');
if (elements instanceof Error) elements = []; // elements = []

// 2. `defer`：推迟执行
// 此代码段延迟了函数的执行，直到清除了当前调用堆栈。
const defer = (fn, ...args) => setTimeout(fn, 1, ...args);
defer(console.log, 'a'), console.log('b'); // logs 'b' then 'a'

// 3. `runPromisesInSeries`：运行多个`Promises`
const runPromisesInSeries = (ps) =>
  ps.reduce((p, next) => p.then(next), Promise.resolve());
const delay = (d) => new Promise((r) => setTimeout(r, d));
runPromisesInSeries([() => delay(1000), () => delay(2000)]);
//依次执行每个Promises ，总共需要3秒钟才能完成

// 4. `timeTaken`：计算函数执行时间
const timeTaken = (callback) => {
  console.time('timeTaken');
  const r = callback();
  console.timeEnd('timeTaken');
  return r;
};
timeTaken(() => Math.pow(2, 10)); // 1024, (logged): timeTaken: 0.02099609375ms

// 5. `createEventHub`：简单的发布/订阅模式
// 创建一个发布/订阅（发布-订阅）事件集线，有emit，on和off方法。

// 使用Object.create(null)创建一个空的hub对象。
// emit，根据event参数解析处理程序数组，然后.forEach()通过传入数据作为参数来运行每个处理程序。
// on，为事件创建一个数组（若不存在则为空数组），然后.push()将处理程序添加到该数组。
// off，用.findIndex()在事件数组中查找处理程序的索引，并使用.splice()删除。

const createEventHub = () => ({
  hub: Object.create(null),
  emit(event, data) {
    (this.hub[event] || []).forEach((handler) => handler(data));
  },
  on(event, handler) {
    if (!this.hub[event]) this.hub[event] = [];
    this.hub[event].push(handler);
  },
  off(event, handler) {
    const i = (this.hub[event] || []).findIndex((h) => h === handler);
    if (i > -1) this.hub[event].splice(i, 1);
    if (this.hub[event].length === 0) delete this.hub[event];
  },
});
// 用法：
const handler = (data) => console.log(data);
const hub = createEventHub();
let increment = 0;
// 订阅，监听不同事件
hub.on('message', handler);
hub.on('message', () => console.log('Message event fired'));
hub.on('increment', () => increment++);
// 发布：发出事件以调用所有订阅给它们的处理程序，并将数据作为参数传递给它们
hub.emit('message', 'hello world'); // 打印 'hello world' 和 'Message event fired'
hub.emit('message', { hello: 'world' }); // 打印 对象 和 'Message event fired'
hub.emit('increment'); // increment = 1
// 停止订阅
hub.off('message', handler);

// 6.`memoize`：缓存函数
// 通过实例化一个Map对象来创建一个空的缓存。
// 通过检查输入值的函数输出是否已缓存，返回存储一个参数的函数，该参数将被提供给已记忆的函数；如果没有，则存储并返回它。

const memoize = (fn) => {
  const cache = new Map();
  const cached = function (val) {
    return cache.has(val)
      ? cache.get(val)
      : cache.set(val, fn.call(this, val)) && cache.get(val);
  };
  cached.cache = cache;
  return cached;
};
// Ps: 这个版本可能不是很清晰，还有Vue源码版的：

/**
 * Create a cached version of a pure function.
 */
export function cached(fn) {
  const cache = Object.create(null);
  return function cachedFn(str) {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}

// 7. `once`：只调用一次的函数
const once = (fn) => {
  let called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  };
};

// 8.`flattenObject`：以键的路径扁平化对象
// 使用递归。
// 利用Object.keys(obj)联合Array.prototype.reduce()，以每片叶子节点转换为扁平的路径节点。
// 如果键的值是一个对象，则函数使用调用适当的自身prefix以创建路径Object.assign()。
// 否则，它将适当的前缀键值对添加到累加器对象。
// prefix除非您希望每个键都有一个前缀，否则应始终省略第二个参数。
const flattenObject = (obj, prefix = '') =>
  Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (typeof obj[k] === 'object')
      Object.assign(acc, flattenObject(obj[k], pre + k));
    else acc[pre + k] = obj[k];
    return acc;
  }, {});

flattenObject({ a: { b: { c: 1 } }, d: 1 }); // { 'a.b.c': 1, d: 1 }

// 9. `unflattenObject`：以键的路径展开对象
// 与上面的相反，展开对象。
const unflattenObject = (obj) =>
  Object.keys(obj).reduce((acc, k) => {
    if (k.indexOf('.') !== -1) {
      const keys = k.split('.');
      Object.assign(
        acc,
        JSON.parse(
          '{' +
            keys
              .map((v, i) => (i !== keys.length - 1 ? `"${v}":{` : `"${v}":`))
              .join('') +
            obj[k] +
            '}'.repeat(keys.length)
        )
      );
    } else acc[k] = obj[k];
    return acc;
  }, {});
unflattenObject({ 'a.b.c': 1, d: 1 }); // { a: { b: { c: 1 } }, d: 1 }
// 这个的用途，在做Tree组件或复杂表单时取值非常舒服。

// 3. 第三部分：字符串
// 1.`byteSize`：返回字符串的字节长度
const byteSize = (str) => new Blob([str]).size;
byteSize('😀'); // 4
byteSize('Hello World'); // 11

// 2. `capitalize`：首字母大写
const capitalize = ([first, ...rest]) => first.toUpperCase() + rest.join('');
// capitalize('fooBar'); // 'FooBar'
// capitalize('fooBar', true); // 'Foobar'

// 3. `capitalizeEveryWord`：每个单词首字母大写
const capitalizeEveryWord = (str) =>
  str.replace(/\b[a-z]/g, (char) => char.toUpperCase());
capitalizeEveryWord('hello world!'); // 'Hello World!'

// 4. `decapitalize`：首字母小写
const decapitalize = ([first, ...rest]) => first.toLowerCase() + rest.join('');
decapitalize('FooBar'); // 'fooBar'
decapitalize('FooBar'); // 'fooBar'

// 5. `luhnCheck`：银行卡号码校验（`luhn`算法）
// Luhn算法的实现，用于验证各种标识号，例如信用卡号，IMEI号，国家提供商标识号等。
// 与String.prototype.split('')结合使用，以获取数字数组。获得最后一个数字。实施luhn算法。如果被整除，则返回，否则返回。
const luhnCheck = (num) => {
  let arr = (num + '')
    .split('')
    .reverse()
    .map((x) => parseInt(x));
  let lastDigit = arr.splice(0, 1)[0];
  let sum = arr.reduce(
    (acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9),
    0
  );
  sum += lastDigit;
  return sum % 10 === 0;
};
// 用例:

luhnCheck('4485275742308327'); // true
luhnCheck(6011329933655299); //  false
luhnCheck(123456789); // false
// 补充：银行卡号码的校验规则：
// 关于luhn算法，可以参考以下文章：
// 银行卡号码校验算法（Luhn算法，又叫模10算法）
// 银行卡号码的校验采用Luhn算法，校验过程大致如下：
// 从右到左给卡号字符串编号，最右边第一位是1，最右边第二位是2，最右边第三位是3….
// 从右向左遍历，对每一位字符t执行第三个步骤，并将每一位的计算结果相加得到一个数s。
// 对每一位的计算规则：如果这一位是奇数位，则返回t本身，如果是偶数位，则先将t乘以2得到一个数n，如果n是一位数（小于10），直接返回n，否则将n的个位数和十位数相加返回。
// 如果s能够整除10，则此号码有效，否则号码无效。
// 因为最终的结果会对10取余来判断是否能够整除10，所以又叫做模10算法。
// 当然，还是库比较香: bankcardinfo

// 6. `splitLines`：将多行字符串拆分为行数组。
// 使用String.prototype.split()和正则表达式匹配换行符并创建一个数组。
// const splitLines = str => str.split(/\r?\n/);
// splitLines('This\nis a\nmultiline\nstring.\n'); // ['This', 'is a', 'multiline', 'string.' , '']

// 7. `stripHTMLTags`：删除字符串中的`HTMl`标签
// 从字符串中删除HTML / XML标签。
// 使用正则表达式从字符串中删除HTML / XML 标记。
const stripHTMLTags = (str) => str.replace(/<[^>]*>/g, '');
stripHTMLTags('<p><em>lorem</em> <strong>ipsum</strong></p>'); // 'lorem ipsum'

// 4. 第四部分：对象
// 1. `dayOfYear`：当前日期天数
const dayOfYear = (date) =>
  Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
dayOfYear(new Date()); // 285

// 2. `forOwn`：迭代属性并执行回调
const forOwn = (obj, fn) =>
  Object.keys(obj).forEach((key) => fn(obj[key], key, obj));
forOwn({ foo: 'bar', a: 1 }, (v) => console.log(v)); // 'bar', 1

// 3. `Get Time From Date`：返回当前24小时制时间的字符串
const getColonTimeFromDate = (date) => date.toTimeString().slice(0, 8);
getColonTimeFromDate(new Date()); // "08:38:00"

// 4. `Get Days Between Dates`：返回日期间的天数
const getDaysDiffBetweenDates = (dateInitial, dateFinal) =>
  (dateFinal - dateInitial) / (1000 * 3600 * 24);
getDaysDiffBetweenDates(new Date('2019-01-01'), new Date('2019-10-14')); // 286

// 5. `is`：检查值是否为特定类型。
const is = (type, val) => ![, null].includes(val) && val.constructor === type;
is(Array, [1]); // true
is(ArrayBuffer, new ArrayBuffer()); // true
is(Map, new Map()); // true
is(RegExp, /./g); // true
is(Set, new Set()); // true
is(WeakMap, new WeakMap()); // true
is(WeakSet, new WeakSet()); // true
is(String, ''); // true
is(String, new String('')); // true
is(Number, 1); // true
is(Number, new Number(1)); // true
is(Boolean, true); // true
is(Boolean, new Boolean(true)); // true

// 6. `isAfterDate`：检查是否在某日期后
const isAfterDate = (dateA, dateB) => dateA > dateB;
isAfterDate(new Date(2010, 10, 21), new Date(2010, 10, 20)); // true

// 7. `isBeforeDate`：检查是否在某日期前
const isBeforeDate = (dateA, dateB) => dateA < dateB;
isBeforeDate(new Date(2010, 10, 20), new Date(2010, 10, 21)); // true

// 8 `tomorrow`：获取明天的字符串格式时间
const tomorrow = () => {
  let t = new Date();
  t.setDate(t.getDate() + 1);
  return t.toISOString().split('T')[0];
};
tomorrow(); // 2019-10-15 (如果明天是2019-10-15)

// 9. `equals`：全等判断
// 在两个变量之间进行深度比较以确定它们是否全等。
// 此代码段精简的核心在于Array.prototype.every()的使用。

const equals = (a, b) => {
  if (a === b) return true;
  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();
  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object'))
    return a === b;
  if (a.prototype !== b.prototype) return false;
  let keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every((k) => equals(a[k], b[k]));
};
// 用法：
equals(
  { a: [2, { e: 3 }], b: [4], c: 'foo' },
  { a: [2, { e: 3 }], b: [4], c: 'foo' }
); // true

// 5. 第五部分：数字
// 1. `randomIntegerInRange`：生成指定范围的随机整数
const randomIntegerInRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
randomIntegerInRange(0, 5); // 3

// 2. `randomNumberInRange`：生成指定范围的随机小数
const randomNumberInRange = (min, max) => Math.random() * (max - min) + min;
randomNumberInRange(2, 10); // 6.0211363285087005

// 3. `round`：四舍五入到指定位数
const round = (n, decimals = 0) =>
  Number(`${Math.round(`${n}e${decimals}`)}e-${decimals}`);
round(1.005, 2); // 1.01

// 4. `sum`：计算数组或多个数字的总和
const sum = (...arr) => [...arr].reduce((acc, val) => acc + val, 0);
sum(1, 2, 3, 4); // 10
sum(...[1, 2, 3, 4]); // 10

// 5. `toCurrency`：简单的货币单位转换
const toCurrency = (n, curr, LanguageFormat = undefined) =>
  Intl.NumberFormat(LanguageFormat, {
    style: 'currency',
    currency: curr,
  }).format(n);

toCurrency(123456.789, 'EUR'); // €123,456.79
toCurrency(123456.789, 'USD', 'en-us'); // $123,456.79
toCurrency(123456.789, 'USD', 'fa'); // ۱۲۳٬۴۵۶٫۷۹
toCurrency(322342436423.2435, 'JPY'); // ¥322,342,436,423

// 6. 第六部分：浏览器操作及其它
// 1. `bottomVisible`：检查页面底部是否可见
const bottomVisible = () =>
  document.documentElement.clientHeight + window.scrollY >=
  (document.documentElement.scrollHeight ||
    document.documentElement.clientHeight);
bottomVisible(); // true

// 2. `Create Directory`：检查创建目录
// 此代码段调用fs模块的existsSync()检查目录是否存在，如果不存在，则mkdirSync()创建该目录。
const fs = require('fs');
const createDirIfNotExists = (dir) =>
  !fs.existsSync(dir) ? fs.mkdirSync(dir) : undefined;
createDirIfNotExists('test');

// 3. `currentURL`：返回当前链接`url`
const currentURL = () => window.location.href;
currentURL(); // 'https://juejin.im'

// 4. `distance`：返回两点间的距离
// 该代码段通过计算欧几里得距离来返回两点之间的距离。
const distance = (x0, y0, x1, y1) => Math.hypot(x1 - x0, y1 - y0);
distance(1, 1, 2, 3); // 2.23606797749979

// 5. `elementContains`：检查是否包含子元素
// 此代码段检查父元素是否包含子元素。
const elementContains = (parent, child) =>
  parent !== child && parent.contains(child);
elementContains(
  document.querySelector('head'),
  document.querySelector('title')
); // true
elementContains(document.querySelector('body'), document.querySelector('body')); // false

// 6. `getStyle`：返回指定元素的生效样式
const getStyle = (el, ruleName) => getComputedStyle(el)[ruleName];
getStyle(document.querySelector('p'), 'font-size'); // '16px'

// 7. `getType`：返回值或变量的类型名
const getType = (v) =>
  v === undefined
    ? 'undefined'
    : v === null
    ? 'null'
    : v.constructor.name.toLowerCase();
getType(new Set([1, 2, 3])); // 'set'
getType([1, 2, 3]); // 'array'

// 8. `hasClass`：校验指定元素的类名
const hasClass = (el, className) => el.classList.contains(className);
hasClass(document.querySelector('p.special'), 'special'); // true

// 9. `hide`：隐藏所有的指定标签
const hide = (...el) => [...el].forEach((e) => (e.style.display = 'none'));
hide(document.querySelectorAll('img')); // 隐藏所有<img>标签

// 10. `httpsRedirect`：`HTTP` 跳转 `HTTPS`
const httpsRedireoct = () => {
  if (location.prtocol !== 'https:')
    location.replace('https://' + location.href.split('//')[1]);
};
httpsRedirect(); // 若在`http://www.baidu.com`, 则跳转到`https://www.baidu.com`

// 11.`insertAfter`：在指定元素之后插入新元素
const insertAfter = (el, htmlString) =>
  el.insertAdjacentHTML('afterend', htmlString);
// <div id="myId">...</div> <p>after</p>
insertAfter(document.getElementById('myId'), '<p>after</p>');

// 12.`insertBefore`：在指定元素之前插入新元素
const insertBefore = (el, htmlString) =>
  el.insertAdjacentHTML('beforebegin', htmlString);
insertBefore(document.getElementById('myId'), '<p>before</p>'); // <p>before</p> <div id="myId">...</div>

// 13. `isBrowser`：检查是否为浏览器环境
// 此代码段可用于确定当前运行时环境是否为浏览器。这有助于避免在服务器（节点）上运行前端模块时出错。
const isBrowser = () => ![typeof window, typeof document].includes('undefined');
isBrowser(); // true (browser)
isBrowser(); // false (Node)

// 14. ` isBrowserTab`：检查当前标签页是否活动
const isBrowserTabFocused = () => !document.hidden;
isBrowserTabFocused(); // true

// 15. `nodeListToArray`：转换`nodeList`为数组
const nodeListToArray = (nodeList) => [...nodeList];
nodeListToArray(document.childNodes); // [ <!DOCTYPE html>, html ]

// 16. `Random Hexadecimal Color Code`：随机十六进制颜色
const randomHexColorCode = () => {
  let n = (Math.random() * 0xfffff * 1000000).toString(16);
  return '#' + n.slice(0, 6);
};
randomHexColorCode(); // "#e34155"

// 17. `scrollToTop`：平滑滚动至顶部
// 该代码段可用于平滑滚动到当前页面的顶部。
const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
};
scrollToTop();

// 18. `smoothScroll`：滚动到指定元素区域
// 该代码段可将指定元素平滑滚动到浏览器窗口的可见区域。
const smoothScroll = (element) =>
  document.querySelector(element).scrollIntoView({
    behavior: 'smooth',
  });
smoothScroll('#fooBar');
smoothScroll('.fooBar');

// 19. `detectDeviceType`：检测移动/PC设备
const detectDeviceType = () =>
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
    ? 'Mobile'
    : 'Desktop';

// 20. `getScrollPosition`：返回当前的滚动位置
// 默认参数为window ，pageXOffset(pageYOffset)为第一选择，没有则用scrollLeft(scrollTop)
const getScrollPosition = (el = window) => ({
  x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
  y: el.pageYOffset !== undefined ? el.pageYOffset : el.scrollTop,
});
getScrollPosition(); // {x: 0, y: 200}

// 21. `size`：获取不同类型变量的长度
// 这个的实现非常巧妙，利用Blob类文件对象的特性，获取对象的长度。
// 另外，多重三元运算符，是真香。

const size = (val) =>
  Array.isArray(val)
    ? val.length
    : val && typeof val === 'object'
    ? val.size || val.length || Object.keys(val).length
    : typeof val === 'string'
    ? new Blob([val]).size
    : 0;
size([1, 2, 3, 4, 5]); // 5
size('size'); // 4
size({ one: 1, two: 2, three: 3 }); // 3

// 22. `escapeHTML`：转义`HTML`
// 当然是用来防XSS攻击啦。
const escapeHTML = (str) =>
  str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }[tag] || tag)
  );

escapeHTML('<a href="#">Me & you</a>'); // '&lt;a href=&quot;#&quot;&gt;Me &amp; you&lt;/a&gt;'

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


//  图片下载器，模拟浏览器请求
// const fs = require('fs')
// const http = require('https')
// const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
// /**
//  * @param {string} url - 图片的网络地址
//  * @param {string} dest - 保存图片的地址
//  * @param {number} timeout - 超时时间，默认 3 分钟
//  * @param {number} retries - 重试次数，默认重试 2 次
//  */
// module.exports = function pictureDownloader(filename, url, dest, timeout = 3 * 60 * 1000, retries = 2) {
//   let isRetry = false
//   let req = http.request(url, res => {
//     res.pipe(fs.createWriteStream(dest))
//     console.log(filename + '下载成功！' + new Date().getTime())
//   })
//   req.setTimeout(timeout, () => {
//     req.abort()
//     isRetry = true
//   })
//   req.setHeader('User-Agent', userAgent)
//   req.on('error', (err) => {
//     console.log(err)
//     isRetry = true
//   })
//   req.on('close', () => {
//     // 重试时，将超时时间递增 1 分钟
//     if (isRetry && retries > 0) pictureDownloader(url, dest, timeout + 60 * 1000, retries - 1)
//   })
//   req.end()
// }


// eventSource服务消息推送
// index.html
// <!DOCTYPE html>
// <html>
//   <head> </head>
//   <body>
//     <div>
//       hello world
//     </div>
//     <p id="info"></p>
//     <script>
//       var infoShow = document.querySelector('#info');
//       const es = new EventSource('/message'); // /message是服务端支持EventSource的接口
//       es.onmessage = function(e) {
//         console.log(e.data); // 打印服务器推送的信息
//         infoShow.innerText += e.data
//       };
//     </script>
//   </body>
// </html>

// main.js
// var http = require('http');
// http.createServer(function(req, res){
//   if(req.url === '/message'){
//     res.writeHead(200, {
//       'Content-Type': 'text/event-stream',
//       'Cache-Control': 'no-cache',
//       'Connection': 'keep-alive'
//     });
//     setInterval(function(){
//       res.write('data: ' + +new Date() + '\n\n');
//     }, 1000);
//   }
// }).listen(9111);
// 使用：main.js 和index.html放在一个服务下。执行node main.js 浏览器访问 127.0.0.1：9111/message 间隔1s返回当前日期，在页面上