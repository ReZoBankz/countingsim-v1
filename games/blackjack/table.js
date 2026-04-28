/*
  CountingSim v1.02
  FILE: table.js

  First playable blackjack engine.

  Supports:
  - reads selected preset from URL
  - back to menu already handled in HTML
  - betting
  - hit / stand
  - dealer hole card hidden
  - blackjack instant payout
  - running count shown after exposed cards only
  - new shoe
  - rules popup
*/

const params = new URLSearchParams(window.location.search);
const selectedTableId = params.get("table") || "blackjack-custom";

/* ---------- DEFAULT CONFIG ----------
   Later this can pull directly from registry files.
*/
const TABLE_PRESETS = {
  "blackjack-custom": {
    title: "Custom Blackjack Table",
    rules: `
      <h3>Custom Blackjack Table</h3>
      <p>Use this table to mimic nearby casino rules.</p>
      <ul>
        <li>Blackjack pays 3:2</li>
        <li>Dealer hits soft 17</li>
        <li>Surrender allowed</li>
        <li>Insurance allowed</li>
      </ul>
    `,
    felt: "felt-green",
    decks: 6,
    payout: 1.5,
    dealerHitsSoft17: true
  }
};

const config = TABLE_PRESETS[selectedTableId] || TABLE_PRESETS["blackjack-custom"];

/* ---------- DOM ---------- */
const tableTitle = document.getElementById("tableTitle");
const feltTable = document.getElementById("feltTable");

const bankrollText = document.getElementById("bankrollText");
const betText = document.getElementById("betText");
const countText = document.getElementById("countText");
const trueCountText = document.getElementById("trueCountText");
const decksLeftText = document.getElementById("decksLeftText");

const dealerCardsEl = document.getElementById("dealerCards");
const dealerTotalEl = document.getElementById("dealerTotal");

const playerCardsEl = document.getElementById("playerCards");
const playerTotalEl = document.getElementById("playerTotal");

const roundMessage = document.getElementById("roundMessage");
const toastPopup = document.getElementById("toastPopup");

const dealBtn = document.getElementById("dealBtn");
const clearBetBtn = document.getElementById("clearBetBtn");

const hitBtn = document.getElementById("hitBtn");
const standBtn = document.getElementById("standBtn");
const doubleBtn = document.getElementById("doubleBtn");
const splitBtn = document.getElementById("splitBtn");
const surrenderBtn = document.getElementById("surrenderBtn");
const insuranceBtn = document.getElementById("insuranceBtn");

const helpBtn = document.getElementById("helpBtn");
const newShoeBtn = document.getElementById("newShoeBtn");

const rulesModal = document.getElementById("rulesModal");
const rulesTitle = document.getElementById("rulesTitle");
const rulesBody = document.getElementById("rulesBody");
const closeRulesBtn = document.getElementById("closeRulesBtn");

/* ---------- STATE ---------- */
let bankroll = 1000;
let bet = 25;

let shoe = [];
let runningCount = 0;

let playerHand = [];
let dealerHand = [];

let roundActive = false;
let dealerHoleRevealed = false;

/* ---------- INIT ---------- */
function init() {
  tableTitle.textContent = config.title;
  feltTable.classList.add(config.felt);

  createNewShoe();
  updateUI();
  setRoundMessage("Place your bet and press Deal");
  setActionButtons(false);
}

init();

/* ---------- SHOE ---------- */
function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

  const deck = [];

  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({ rank, suit });
    });
  });

  return deck;
}

function createNewShoe() {
  shoe = [];

  for (let i = 0; i < config.decks; i++) {
    shoe.push(...createDeck());
  }

  shuffle(shoe);

  // burn 3 cards
  shoe.splice(0, 3);

  runningCount = 0;
  updateCounts();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function drawCard() {
  if (shoe.length < Math.floor(config.decks * 52 * 0.20)) {
    createNewShoe();
  }

  return shoe.shift();
}

/* ---------- CARD VALUES ---------- */
function getCardValue(card) {
  if (card.rank === "A") return 11;
  if (["K", "Q", "J"].includes(card.rank)) return 10;
  return Number(card.rank);
}

function handTotal(hand) {
  let total = 0;
  let aces = 0;

  hand.forEach(card => {
    total += getCardValue(card);
    if (card.rank === "A") aces++;
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

/* ---------- COUNT ---------- */
function countValue(card) {
  if (["2", "3", "4", "5", "6"].includes(card.rank)) return 1;
  if (["10", "J", "Q", "K", "A"].includes(card.rank)) return -1;
  return 0;
}

function exposeCard(card) {
  runningCount += countValue(card);
  updateCounts();
}

function updateCounts() {
  countText.textContent = runningCount;

  const decksLeft = Math.max(0.25, shoe.length / 52);
  decksLeftText.textContent = decksLeft.toFixed(1);

  trueCountText.textContent = (runningCount / decksLeft).toFixed(1);
}

/* ---------- ROUND ---------- */
function startRound() {
  if (roundActive) return;
  if (bet > bankroll) return;

  bankroll -= bet;

  playerHand = [];
  dealerHand = [];
  dealerHoleRevealed = false;
  roundActive = true;

  playerHand.push(drawCard());
  exposeCard(playerHand[0]);

  dealerHand.push(drawCard());
  exposeCard(dealerHand[0]); // exposed upcard

  playerHand.push(drawCard());
  exposeCard(playerHand[1]);

  dealerHand.push(drawCard()); // hole card NOT counted yet

  renderHands();
  updateUI();

  const playerTotal = handTotal(playerHand);

  if (playerTotal === 21) {
    revealHoleCard();
    bankroll += bet + bet * config.payout;
    roundActive = false;
    showToast("Blackjack!", "win");
    setRoundMessage("Player Blackjack");
    updateUI();
    setActionButtons(false);
    return;
  }

  setRoundMessage("Your move");
  setActionButtons(true);
}

function playerHit() {
  if (!roundActive) return;

  const card = drawCard();
  playerHand.push(card);
  exposeCard(card);

  renderHands();

  const total = handTotal(playerHand);

  if (total > 21) {
    roundActive = false;
    showToast("Bust", "lose");
    setRoundMessage("Player Busts");
    setActionButtons(false);
  }
}

function playerStand() {
  if (!roundActive) return;

  revealHoleCard();
  dealerTurn();
}

function playerDouble() {
  if (!roundActive) return;
  if (bankroll < bet) return;

  bankroll -= bet;
  bet *= 2;

  playerHit();

  if (roundActive) {
    playerStand();
  }

  updateUI();
}

function playerSurrender() {
  if (!roundActive) return;

  bankroll += bet / 2;
  roundActive = false;

  showToast("Surrender", "push");
  setRoundMessage("Half bet returned");
  setActionButtons(false);
  updateUI();
}

/* ---------- DEALER ---------- */
function revealHoleCard() {
  if (dealerHoleRevealed) return;

  dealerHoleRevealed = true;
  exposeCard(dealerHand[1]);
  renderHands();
}

function dealerTurn() {
  let total = handTotal(dealerHand);

  while (total < 17) {
    const card = drawCard();
    dealerHand.push(card);
    exposeCard(card);
    total = handTotal(dealerHand);
  }

  if (total === 17 && config.dealerHitsSoft17 && hasSoft17(dealerHand)) {
    const card = drawCard();
    dealerHand.push(card);
    exposeCard(card);
  }

  settleRound();
}

function hasSoft17(hand) {
  let total = 0;
  let aces = 0;

  hand.forEach(card => {
    total += getCardValue(card);
    if (card.rank === "A") aces++;
  });

  return total === 17 && aces > 0;
}

function settleRound() {
  const p = handTotal(playerHand);
  const d = handTotal(dealerHand);

  roundActive = false;

  if (d > 21 || p > d) {
    bankroll += bet * 2;
    showToast("Win", "win");
    setRoundMessage("Player Wins");
  } else if (p === d) {
    bankroll += bet;
    showToast("Push", "push");
    setRoundMessage("Push");
  } else {
    showToast("Lose", "lose");
    setRoundMessage("Dealer Wins");
  }

  setActionButtons(false);
  updateUI();
}

/* ---------- UI ---------- */
function renderHands() {
  dealerCardsEl.innerHTML = "";
  playerCardsEl.innerHTML = "";

  dealerHand.forEach((card, index) => {
    const hidden = index === 1 && !dealerHoleRevealed;
    dealerCardsEl.appendChild(makeCard(card, hidden));
  });

  playerHand.forEach(card => {
    playerCardsEl.appendChild(makeCard(card, false));
  });

  const dealerShownTotal = dealerHoleRevealed
    ? handTotal(dealerHand)
    : getCardValue(dealerHand[0]);

  dealerTotalEl.textContent = "Total: " + dealerShownTotal;
  playerTotalEl.textContent = "Total: " + handTotal(playerHand);
}

function makeCard(card, hidden) {
  const div = document.createElement("div");

  if (hidden) {
    div.className = "card back";
    return div;
  }

  const isRed = card.suit === "♥" || card.suit === "♦";
  const cv = countValue(card);

  div.className = "card " + (isRed ? "red" : "");

  div.innerHTML = `
    <div class="card-rank">${card.rank}</div>
    <div class="card-suit">${card.suit}</div>
    <div class="card-rank bottom">${card.rank}</div>
  `;

  const badge = document.createElement("div");
  badge.className =
    "count-badge " +
    (cv > 0 ? "count-plus" : cv < 0 ? "count-minus" : "count-zero");

  badge.textContent = cv > 0 ? "+1" : cv < 0 ? "-1" : "0";

  div.appendChild(badge);

  return div;
}

function updateUI() {
  bankrollText.textContent = "$" + bankroll.toFixed(0);
  betText.textContent = "$" + bet.toFixed(0);
}

function setRoundMessage(text) {
  roundMessage.textContent = text;
}

function setActionButtons(enabled) {
  hitBtn.disabled = !enabled;
  standBtn.disabled = !enabled;
  doubleBtn.disabled = !enabled;
  splitBtn.disabled = true; // added later
  surrenderBtn.disabled = !enabled;
  insuranceBtn.disabled = true; // added later
}

function showToast(text, type) {
  toastPopup.textContent = text;
  toastPopup.className = "toast-popup show " + type;

  setTimeout(() => {
    toastPopup.className = "toast-popup";
  }, 1800);
}

/* ---------- MODAL ---------- */
function openRules() {
  rulesTitle.textContent = config.title;
  rulesBody.innerHTML = config.rules;
  rulesModal.classList.add("show");
}

function closeRules() {
  rulesModal.classList.remove("show");
}

/* ---------- EVENTS ---------- */
document.querySelectorAll(".chip-btn").forEach(btn => {
  btn.onclick = () => {
    if (roundActive) return;

    bet += Number(btn.dataset.chip);
    updateUI();
  };
});

clearBetBtn.onclick = () => {
  if (roundActive) return;
  bet = 0;
  updateUI();
};

dealBtn.onclick = startRound;

hitBtn.onclick = playerHit;
standBtn.onclick = playerStand;
doubleBtn.onclick = playerDouble;
surrenderBtn.onclick = playerSurrender;

helpBtn.onclick = openRules;
closeRulesBtn.onclick = closeRules;

rulesModal.onclick = e => {
  if (e.target === rulesModal) closeRules();
};

newShoeBtn.onclick = () => {
  if (roundActive) return;

  createNewShoe();
  showToast("New Shoe", "push");
};

document.addEventListener("keydown", e => {
  const k = e.key.toLowerCase();

  if (k === "h") playerHit();
  if (k === "s") playerStand();
  if (k === "d") playerDouble();
  if (k === "r") openRules();
  if (k === " ") {
    e.preventDefault();
    startRound();
  }
});