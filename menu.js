/*
  CountingSim v1.02
  FILE: menu.js

  This reads window.GameRegistry and builds the arcade menu.
*/

let selectedIndex = 0;

const gameList = document.getElementById("gameList");
const gameName = document.getElementById("gameName");
const gameDescription = document.getElementById("gameDescription");

const ruleType = document.getElementById("ruleType");
const ruleDecks = document.getElementById("ruleDecks");
const rulePayout = document.getElementById("rulePayout");
const ruleDealer = document.getElementById("ruleDealer");

const playBtn = document.getElementById("playBtn");
const rulesBtn = document.getElementById("rulesBtn");

const rulesModal = document.getElementById("rulesModal");
const rulesTitle = document.getElementById("rulesTitle");
const rulesContent = document.getElementById("rulesContent");
const closeRulesBtn = document.getElementById("closeRulesBtn");

const loginBtn = document.getElementById("loginBtn");
const createAccountBtn = document.getElementById("createAccountBtn");
const accountModal = document.getElementById("accountModal");
const closeAccountBtn = document.getElementById("closeAccountBtn");

const playerLevel = document.getElementById("playerLevel");
const playerXpText = document.getElementById("playerXpText");
const xpFill = document.getElementById("xpFill");

function getGames() {
  return window.GameRegistry || [];
}

function renderMenu() {
  const games = getGames();

  gameList.innerHTML = "";

  if (games.length === 0) {
    gameList.innerHTML = `
      <div class="game-option active">
        <div class="selector-arrow">!</div>
        <div>
          <div class="option-title">No games loaded</div>
          <div class="option-subtitle">Check registry/loadGames.js and registry/games/</div>
        </div>
      </div>
    `;

    gameName.textContent = "No Games Found";
    gameDescription.textContent = "The menu loaded, but no game files registered themselves.";
    ruleType.textContent = "---";
    ruleDecks.textContent = "---";
    rulePayout.textContent = "---";
    ruleDealer.textContent = "---";
    return;
  }

  if (selectedIndex >= games.length) {
    selectedIndex = 0;
  }

  games.forEach((game, index) => {
    const option = document.createElement("div");
    option.className = "game-option";

    if (index === selectedIndex) {
      option.classList.add("active");
    }

    option.innerHTML = `
      <div class="selector-arrow">▶</div>
      <div>
        <div class="option-title">${game.name}</div>
        <div class="option-subtitle">${game.subtitle || game.type || "Training Mode"}</div>
      </div>
    `;

    option.onclick = () => {
      selectedIndex = index;
      renderMenu();
    };

    option.ondblclick = () => {
      playSelectedGame();
    };

    gameList.appendChild(option);
  });

  updateInfoPanel();
}

function updateInfoPanel() {
  const games = getGames();
  const game = games[selectedIndex];

  if (!game) return;

  gameName.textContent = game.name;
  gameDescription.textContent = game.description || "No description added yet.";

  ruleType.textContent = game.type || "---";

  ruleDecks.textContent =
    game.preview?.decks ??
    game.config?.defaultDecks ??
    game.config?.decks ??
    "---";

  rulePayout.textContent =
    game.preview?.payout ??
    findPayoutLabel(game.config?.blackjackPayout) ??
    "---";

  ruleDealer.textContent =
    game.preview?.dealer ??
    (game.config?.dealerHitsSoft17 ? "H17" : "S17");
}

function findPayoutLabel(value) {
  if (value === 1.5) return "3:2";
  if (value === 1.2) return "6:5";
  if (value === 2) return "2:1";
  if (value === 3) return "3:1";
  return null;
}

function moveSelection(direction) {
  const games = getGames();
  if (games.length === 0) return;

  selectedIndex += direction;

  if (selectedIndex < 0) {
    selectedIndex = games.length - 1;
  }

  if (selectedIndex >= games.length) {
    selectedIndex = 0;
  }

  renderMenu();
}

function playSelectedGame() {
  const games = getGames();
  const game = games[selectedIndex];

  if (!game) return;

  if (!game.url || game.url === "#") {
    alert("This game is coming soon.");
    return;
  }

  window.location.href = game.url;
}

function openRules() {
  const games = getGames();
  const game = games[selectedIndex];

  if (!game) return;

  rulesTitle.textContent = `${game.name} Rules`;
  rulesContent.innerHTML = game.rules || "<p>No rules added for this game yet.</p>";
  rulesModal.classList.add("show");
}

function closeRules() {
  rulesModal.classList.remove("show");
}

function openAccountModal() {
  accountModal.classList.add("show");
}

function closeAccountModal() {
  accountModal.classList.remove("show");
}

function renderLocalXpDemo() {
  const progress = JSON.parse(localStorage.getItem("countingSimProgress") || "{}");

  const level = progress.level || 1;
  const xp = progress.xp || 0;
  const xpNeeded = progress.xpNeeded || 100;

  playerLevel.textContent = level;
  playerXpText.textContent = `${xp} / ${xpNeeded}`;

  const percent = Math.min(100, (xp / xpNeeded) * 100);
  xpFill.style.width = `${percent}%`;
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowdown" || key === "s") {
    event.preventDefault();
    moveSelection(1);
  }

  if (key === "arrowup" || key === "w") {
    event.preventDefault();
    moveSelection(-1);
  }

  if (key === "enter") {
    event.preventDefault();
    playSelectedGame();
  }

  if (key === "r") {
    event.preventDefault();
    openRules();
  }

  if (key === "escape") {
    closeRules();
    closeAccountModal();
  }
});

playBtn.onclick = playSelectedGame;
rulesBtn.onclick = openRules;
closeRulesBtn.onclick = closeRules;

loginBtn.onclick = openAccountModal;
createAccountBtn.onclick = openAccountModal;
closeAccountBtn.onclick = closeAccountModal;

rulesModal.onclick = (event) => {
  if (event.target === rulesModal) closeRules();
};

accountModal.onclick = (event) => {
  if (event.target === accountModal) closeAccountModal();
};

/*
  IMPORTANT:
  Game files are loaded dynamically by registry/loadGames.js.
  We wait briefly so those files have time to register themselves.
*/
setTimeout(() => {
  renderMenu();
  renderLocalXpDemo();
}, 150);