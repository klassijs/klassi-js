// /**
//  * Generates 6 unique random numbers within a specified range
//  * @param {number} min Minimum value (inclusive)
//  * @param {number} max Maximum value (inclusive)
//  * @returns {number[]}
//  */
// function uniqueLotteryNum(min = 1, max = 59) {
//   if (max - min + 1 < 6) {
//     throw new Error("Range is too small to generate 6 unique numbers");
//   }
//
//   const uniqueNumbers = new Set();
//   while (uniqueNumbers.size < 6) {
//     const number = Math.floor(Math.random() * (max - min + 1)) + min;
//     uniqueNumbers.add(number);
//   }
//
//   return Array.from(uniqueNumbers);
// }
//
// console.log('This is the lottery number: ', uniqueLotteryNum());
//
// uniqueLotteryNum();
//
//
// function uniqueEuroNum(min = 1) {
//   let max = 50;
//   if (max - min + 1 < 5) {
//     throw new Error("Range is too small to generate 6 unique numbers");
//   }
//
//   const uniqueNumbers = new Set();
//   while (uniqueNumbers.size < 5) {
//     const number = Math.floor(Math.random() * (max - min + 1)) + min;
//     uniqueNumbers.add(number);
//   }
//
//   max = 12;
//   if (max - min + 1 < 2) {
//     throw new Error("Range is too small to generate 2 unique numbers");
//   }
//
//   const uniqueNumber = new Set();
//   while (uniqueNumber.size < 2) {
//     const number = Math.floor(Math.random() * (max - min + 1)) + min;
//     uniqueNumber.add(number);
//   }
//
//   return Array.from(uniqueNumbers) + ' - ' + Array.from(uniqueNumber);
// }
//
// console.log('This is the Euro numbers: ', uniqueEuroNum());
// // console.log('This is the Euro lucky stars numbers: ', uniqueNumber());
//
// uniqueEuroNum();


/**
 * Generates unique random numbers within a specified range
 * @param {number} count Number of unique numbers to generate
 * @param {number} min Minimum value (inclusive)
 * @param {number} max Maximum value (inclusive)
 * @returns {number[]}
 */
function generateUniqueNumbers(count, min, max) {
  if (max - min + 1 < count) {
    throw new Error('Range is too small to generate the required unique numbers');
  }
  const uniqueNumbers = new Set();
  while (uniqueNumbers.size < count) {
    const number = Math.floor(Math.random() * (max - min + 1)) + min;
    uniqueNumbers.add(number);
  }
  return Array.from(uniqueNumbers).sort((a, b) => a - b);
}

/**
 * Generates 6 unique lottery numbers within the range 1-59
 * @returns {number[]}
 */
function generateLotteryNumbers() {
  return generateUniqueNumbers(6, 1, 59);
}

/**
 * Generates Euro numbers (5 main numbers and 2 lucky stars)
 * @returns {string}
 */
function generateEuroNumbers() {
  const mainNumbers = generateUniqueNumbers(5, 1, 50);
  const luckyStars = generateUniqueNumbers(2, 1, 12);
  return `${mainNumbers.join(', ')} - Lucky Stars: ${luckyStars.join(', ')}`;
}

/**
 * Generates Set 4 Life numbers (5 main numbers and 1 life Ball)
 * @returns {string}
 */
function generateSet4LifeNumbers() {
  const mainNumbers = generateUniqueNumbers(5, 1, 47);
  const lifeBall = generateUniqueNumbers(1, 1, 10);
  return `${mainNumbers.join(', ')} - Life Ball: ${lifeBall.join(', ')}`;
}

// Display the results
console.log('Lottery Numbers:', generateLotteryNumbers().join(', '));
console.log('Euro Numbers:', generateEuroNumbers());
console.log('Set 4 Life Numbers:', generateSet4LifeNumbers());
