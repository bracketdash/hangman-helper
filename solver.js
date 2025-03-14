function getTrie(compressed) {
  let decompressed = compressed;
  decompressed = decompressed.replace(/([a-z])/g, '"$1":{');
  const getEndBrackets = (c) => "}".repeat(parseInt(c, 10));
  decompressed = decompressed.replace(/([0-9]+)/g, getEndBrackets);
  decompressed = decompressed.replaceAll("$", '"$":1');
  return JSON.parse(decompressed);
}

const trie = getTrie(compressedTrie);

function getWordsThatFit(wordWithBlanks, unusedLetters) {
  // TODO: return all possible words that fit from the trie
  return ["todotodo", "todotodo"];
}

function solve(board, unused) {
  const tallies = {};
  board.forEach((word) => {
    const possibilities = getWordsThatFit(word, unused);
    const blankIndexes = [];
    let index = word.indexOf("?");
    while (index !== -1) {
      blankIndexes.push(index);
      index = word.indexOf("?", index + 1);
    }
    for (let p = 0; p < possibilities.length; p++) {
      const possibility = possibilities[p];
      for (let b = 0; b < blankIndexes.length; b++) {
        const letter = possibility[blankIndexes[b]];
        if (tallies[letter]) {
          tallies[letter]++;
        } else {
          tallies[letter] = 1;
        }
      }
    }
  });
  const probabilities = {};
  const reduceSum = (sum, current) => sum + current;
  const grandTotal = Object.values(tallies).reduce(reduceSum, 0);
  Object.entries(tallies).forEach(([letter, tally]) => {
    probabilities[letter] = tally / grandTotal;
  });
  return probabilities;
}
