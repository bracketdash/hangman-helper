// TODO: update compressTrie.js to include single letter words, conjunctions, etc.

function getTrie() {
  const replaced = compressedTrie
    .replace(/([a-z])/g, '"$1":{')
    .replace(/([0-9]+)/g, (num) => "}".repeat(parseInt(num)))
    .replace(/_/g, '"_":1');
  return JSON.parse("{" + replaced);
}

const trie = getTrie();

function solve(board, unused) {
  // TODO: return letter probabilities
  console.log("board:");
  console.log(board);
  console.log("unused:");
  console.log(unused);
  return { a: 0.5, e: 0.5 };
}
