const boardTextarea = document.querySelector("textarea");
const lettersBox = document.querySelector(".letters");

const alphabet = getAlphabet();

const CROSSED = "crossed-off";
const ONBOARD = "on-board";
const SUGGESTED = "suggested";

let trie = {};

renderLetters();

boardTextarea.addEventListener("keyup", handleKeyup);

setTimeout(() => {
  trie = getTrie(compressedTrie);
}, 5);

function checkBoard() {
  const letterBoxes = Array.from(lettersBox.children);
  const used = [];
  letterBoxes.forEach((letterbox) => {
    if (letterbox.classList.contains(SUGGESTED)) {
      letterbox.classList.remove(SUGGESTED);
    }
    if (
      letterbox.classList.contains(CROSSED) ||
      letterbox.classList.contains(ONBOARD)
    ) {
      used.push(letterbox.querySelector(".letter").innerHTML);
    }
    letterbox.querySelector(".probability").innerHTML = "-";
  });
  const board = boardTextarea.value
    .toLowerCase()
    .replace(/[^a-z ?-]/g, "")
    .replace(/[\s-]+/g, " ")
    .split(" ");
  if (
    !boardTextarea.value.includes("?") ||
    used.length === 26 ||
    (board.length < 2 && !board[0].length)
  ) {
    return;
  }
  const probabilities = solve(
    board.filter((word) => word.includes("?")),
    alphabet.filter((letter) => !used.includes(letter))
  );
  const probsOnly = Object.values(probabilities).sort((a, b) => b - a);
  const highestProbabilty = probsOnly[0];
  let suggestionMade = false;
  alphabet.forEach((letter, index) => {
    const probability = probabilities[letter];
    if (!probability) {
      return;
    }
    const prettyProb = (probability * 100).toFixed(1) + "%";
    letterBoxes[index].querySelector(".probability").innerHTML = prettyProb;
    if (probability === highestProbabilty && !suggestionMade) {
      suggestionMade = true;
      letterBoxes[index].classList.add(SUGGESTED);
    }
  });
}

function getAlphabet() {
  const letters = [];
  for (let i = 0; i < 26; i++) {
    letters.push(String.fromCharCode(97 + i));
  }
  return letters;
}

function getTrie(compressed) {
  let decompressed = compressed;
  decompressed = decompressed.replace(/([A-Z])/g, (c) => c.toLowerCase() + "$");
  decompressed = decompressed.replace(/([a-z])/g, '"$1":{');
  decompressed = decompressed.replace(/([0-9]+)/g, "$1,").slice(0, -1);
  decompressed = decompressed.replace(/\$([^0-9])/g, "$,$1");
  const getEndBrackets = (c) => "}".repeat(parseInt(c, 10));
  decompressed = decompressed.replace(/([0-9]+)/g, getEndBrackets);
  decompressed = decompressed.replaceAll("$", '"$":1');
  return JSON.parse(decompressed);
}

function getWordsThatFit(wordWithBlanks, unusedLetters) {
  const words = [];
  const stack = [[trie, ""]];
  const pattern = wordWithBlanks;
  while (stack.length > 0) {
    const [currentNode, prefix] = stack.pop();
    if (currentNode.$ && prefix.length === pattern.length) {
      let isMatch = true;
      for (let i = 0; i < prefix.length; i++) {
        if (pattern[i] !== "?" && pattern[i] !== prefix[i]) {
          isMatch = false;
          break;
        }
        if (pattern[i] === "?" && !unusedLetters.includes(prefix[i])) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        words.push(prefix);
      }
    }
    if (prefix.length < pattern.length) {
      const nextPosition = prefix.length;
      const chars = Object.keys(currentNode).filter((key) => key !== "$");
      for (let i = chars.length - 1; i >= 0; i--) {
        const char = chars[i];
        if (pattern[nextPosition] !== "?" && pattern[nextPosition] !== char) {
          continue;
        }
        if (pattern[nextPosition] === "?" && !unusedLetters.includes(char)) {
          continue;
        }
        stack.push([currentNode[char], prefix + char]);
      }
    }
  }
  return words;
}

function handleClickLetter({ target }) {
  let letterbox = target;
  if (!target.classList.contains("letterbox")) {
    letterbox = target.closest(".letterbox");
  }
  if (letterbox.classList.contains(ONBOARD)) {
    return;
  }
  if (letterbox.classList.contains(CROSSED)) {
    letterbox.classList.remove(CROSSED);
  } else if (!letterbox.classList.contains(ONBOARD)) {
    letterbox.classList.add(CROSSED);
    letterbox.classList.remove(SUGGESTED);
  }
  checkBoard();
}

function handleKeyup() {
  const uppercased = boardTextarea.value.toUpperCase();
  boardTextarea.value = uppercased;
  const letterBoxes = Array.from(lettersBox.children);
  alphabet.forEach((letter, index) => {
    if (uppercased.includes(letter.toUpperCase())) {
      letterBoxes[index].classList.add(ONBOARD);
      letterBoxes[index].classList.remove(CROSSED);
    } else {
      letterBoxes[index].classList.remove(ONBOARD);
    }
  });
  checkBoard();
}

function renderLetters() {
  let markup = "";
  alphabet.forEach((letter) => {
    markup += `<div class="letterbox"><div class="letter">${letter}</div><div class="probability">-</div></div>`;
  });
  lettersBox.innerHTML = markup;
  Array.from(lettersBox.children).forEach((letterbox) => {
    letterbox.addEventListener("click", handleClickLetter);
  });
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
