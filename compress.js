const fs = require("fs");

function compress(words) {
  const trie = {};
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex];
    let currentNode = trie;
    for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
      const char = word[letterIndex];
      if (!currentNode[char]) {
        currentNode[char] = {};
      }
      currentNode = currentNode[char];
    }
    currentNode.$ = 1;
  }
  let compressed = JSON.stringify(trie);
  compressed = compressed.replace(/"([a-z])":{/g, "$1");
  compressed = compressed.replace(/(\}{2,})/g, (c) => c.length);
  compressed = compressed.replaceAll('"$":1', "$");
  return compressed;
}

function decompress(compressed) {
  let decompressed = compressed;
  decompressed = decompressed.replace(/([a-z])/g, '"$1":{');
  const getEndBrackets = (c) => "}".repeat(parseInt(c, 10));
  decompressed = decompressed.replace(/([0-9]+)/g, getEndBrackets);
  decompressed = decompressed.replaceAll("$", '"$":1');
  const trie = JSON.parse(decompressed);
  const words = [];
  const stack = [[trie, ""]];
  while (stack.length > 0) {
    const [currentNode, prefix] = stack.pop();
    if (currentNode.$) {
      words.push(prefix);
    }
    const chars = Object.keys(currentNode).filter((key) => key !== "$");
    for (let i = chars.length - 1; i >= 0; i--) {
      const char = chars[i];
      stack.push([currentNode[char], prefix + char]);
    }
  }
  words.sort();
  return words.join(",");
}

const wordlist = fs.readFileSync("wordlist.txt", "utf-8");
const compressed = compress(wordlist.split(","));
const decompressed = decompress(compressed);
if (decompressed === wordlist) {
  fs.writeFileSync(
    "compressedTrie.js",
    `const compressedTrie = "${compressed}";`
  );
  console.log("Success! Saved compressed.txt");
} else {
  console.log("Failed.");
}
