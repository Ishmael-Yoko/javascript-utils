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

// 将formData中的数据序列化
function serializeForm (formDOM) {
  return Array.from(new FormData(formDOM), field => {
    field.map(encodeURIComponent).join('=')
  }).join('&')
}
serializeForm(document.querySelector('#form'));
// email=test%40email.com&name=Test%20Name

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

// 浏览器当前tab是否是可视状态
function isBrowserTabFocused () {
  return !document.hidden
}