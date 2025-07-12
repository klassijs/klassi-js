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


/**
 * Generates 3 sets of lottery numbers
 * @returns {string[]}
 */
function generateMultipleLotteryNumbers() {
  const sets = [];
  for (let i = 0; i < 3; i++) {
    sets.push(generateLotteryNumbers().join(', '));
  }
  return sets;
}

/**
 * Generates 3 sets of Euro numbers
 * @returns {string[]}
 */
function generateMultipleEuroNumbers() {
  const sets = [];
  for (let i = 0; i < 3; i++) {
    sets.push(generateEuroNumbers());
  }
  return sets;
}

/**
 * Generates 3 sets of Set 4 Life numbers
 * @returns {string[]}
 */
function generateMultipleSet4LifeNumbers() {
  const sets = [];
  for (let i = 0; i < 3; i++) {
    sets.push(generateSet4LifeNumbers());
  }
  return sets;
}

console.log('Lottery Numbers:', generateMultipleLotteryNumbers());
console.log('Euro Numbers:', generateMultipleEuroNumbers());
console.log('Set 4 Life Numbers:', generateMultipleSet4LifeNumbers());
// console.log('Lottery Numbers:', generateLotteryNumbers().join(', '));
// console.log('Euro Numbers:', generateEuroNumbers());
// console.log('Set 4 Life Numbers:', generateSet4LifeNumbers());
