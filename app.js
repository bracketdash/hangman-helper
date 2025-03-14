const boardTextarea = document.querySelector("textarea");
const lettersBox = document.querySelector(".letters");

function getAlphabet() {
  const letters = [];
  for (let i = 0; i < 26; i++) {
    letters.push(String.fromCharCode(97 + i));
  }
  return letters;
}

const alphabet = getAlphabet();

function checkBoard() {
  const letterBoxes = Array.from(lettersBox.children);
  const used = [];
  letterBoxes.forEach((letterbox) => {
    if (letterbox.classList.contains("suggested")) {
      letterbox.classList.remove("suggested");
    }
    if (
      letterbox.classList.contains("crossed-off") ||
      letterbox.classList.contains("on-board")
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
      letterBoxes[index].classList.add("suggested");
    }
  });
}

function handleClickLetter({ target }) {
  let letterbox = target;
  if (!target.classList.contains("letterbox")) {
    letterbox = target.closest(".letterbox");
  }
  const crossedOffClass = "crossed-off";
  if (letterbox.classList.contains(crossedOffClass)) {
    letterbox.classList.remove(crossedOffClass);
  } else if (!letterbox.classList.contains("on-board")) {
    letterbox.classList.add(crossedOffClass);
    letterbox.classList.remove("suggested");
  }
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

renderLetters();

function handleKeyup() {
  const uppercased = boardTextarea.value.toUpperCase();
  boardTextarea.value = uppercased;
  const letterBoxes = Array.from(lettersBox.children);
  alphabet.forEach((letter, index) => {
    if (uppercased.includes(letter.toUpperCase())) {
      letterBoxes[index].classList.add("on-board");
      letterBoxes[index].classList.remove("crossed-off");
    } else {
      letterBoxes[index].classList.remove("on-board");
    }
  });
  checkBoard();
}

boardTextarea.addEventListener("keyup", handleKeyup);
