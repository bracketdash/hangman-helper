function getTrie(compressed) {
  let decompressed = compressed;
  decompressed = decompressed.replace(/([a-z])/g, '"$1":{');
  const getEndBrackets = (c) => "}".repeat(parseInt(c, 10));
  decompressed = decompressed.replace(/([0-9]+)/g, getEndBrackets);
  decompressed = decompressed.replaceAll("$", '"$":1');
  return JSON.parse(decompressed);
}

const trie = getTrie(compressedTrie);

function solve(board, unused) {
  console.log(`board: ${board.join(", ")}`);
  console.log(`unused: ${unused.join("")}`);
  const tallies = {};
  // TODO: count up how many times each letter shows up in the "?" spots for word completions
  board.forEach((word) => {
    // TODO: get all possible words that fit from the trie
    // TODO: for each "?", count up letter frequency in possible words and add to the total in tallies[letter]
  });
  const probabilities = {};
  const reduceSum = (sum, current) => sum + current;
  const grandTotal = Object.values(tallies).reduce(reduceSum, 0);
  Object.entries(tallies).forEach((letter, tally) => {
    probabilities[letter] = tally / grandTotal;
  });
  return probabilities;
}
