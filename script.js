const decks = {
  "Mand001": [
    { front: "What is 5 + 7?", back: "12" },
    { front: "Capital of Japan?", back: "Tokyo" }
  ],
  "Mand002": [
    { front: "Largest ocean?", back: "Pacific Ocean" },
    { front: "Square root of 81?", back: "9" }
  ],
  "Mand003": [
    { front: "Who wrote Hamlet?", back: "William Shakespeare" },
    { front: "Speed of light?", back: "299,792 km/s" }
  ]
};

let currentDeck = [];
let currentIndex = 0;
let flipped = false;

function loadDeck() {
  const userId = document.getElementById('userId').value;
  if (decks[userId]) {
    currentDeck = decks[userId];
    currentIndex = 0;
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    showCard();
  } else {
    alert("Invalid ID");
  }
}

function showCard() {
  flipped = false;
  document.getElementById('card').innerText = currentDeck[currentIndex].front;
}

function flipCard() {
  flipped = !flipped;
  document.getElementById('card').innerText = flipped
    ? currentDeck[currentIndex].back
    : currentDeck[currentIndex].front;
}

function nextCard() {
  currentIndex = (currentIndex + 1) % currentDeck.length;
  showCard();
}

function prevCard() {
  currentIndex = (currentIndex - 1 + currentDeck.length) % currentDeck.length;
  showCard();
}
