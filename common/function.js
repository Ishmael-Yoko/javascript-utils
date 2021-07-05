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