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
  // TODO: return letter probabilities
  console.log("board:");
  console.log(board);
  console.log("unused:");
  console.log(unused);
  return { a: 0.5, e: 0.5 };
}
