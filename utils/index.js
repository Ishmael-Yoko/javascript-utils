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


