const fs = require("fs");

function compress(wordlist) {
  // TODO
}

const wordlist = fs.readFileSync("wordlist.txt", "utf-8");
const result = compress(wordlist);

fs.writeFileSync("compressedWordlist.txt", result.compressedText);
fs.writeFileSync("keys.json", JSON.stringify(keys));
