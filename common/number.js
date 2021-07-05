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