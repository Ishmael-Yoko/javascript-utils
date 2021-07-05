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