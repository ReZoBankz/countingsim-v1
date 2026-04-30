/*
  CountingSim v1.04
  FILE: menu.js

  Two-layer arcade launcher:
  1. Choose game type/category: Blackjack, Slots, Baccarat, Poker
  2. Choose version/table inside that category

  This reads games from:
  window.GameRegistry

  Add new games by:
  1. Creating a file in registry/games/
  2. Adding that filename to registry/loadGames.js
*/

let selectedCategoryIndex = 0;
let selectedGameIndex = 0;
let currentScreen = "categories";

const gameList = document.getElementById("gameList");
const menuCrumb = document.getElementById("menuCrumb");
const listTitle = document.getElementById("listTitle");

const gameName = document.getElementById("gameName");
const gameDescription = document.getElementById("gameDescription");

const ruleType = document.getElementById("ruleType");
const ruleDecks = document.getElementById("ruleDecks");
const rulePayout = document.getElementById("rulePayout");
const ruleDealer = document.getElementById("ruleDealer");

const previewImage = document.getElementById("previewImage");
const previewPlaceholder = document.getElementById("previewPlaceholder");

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

function getCategories() {
  const games = getGames();
  const categoryMap = new Map();

  games.forEach((game) => {
    const categoryName = game.category || game.type || "Other";

    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        name: categoryName,
        games: []
      });
    }

    categoryMap.get(categoryName).games.push(game);
  });

  return Array.from(categoryMap.values());
}

function getCurrentCategory() {
  const categories = getCategories();
  return categories[selectedCategoryIndex] || null;
}

function getCurrentGame() {
  const category = getCurrentCategory();
  if (!category) return null;
  return category.games[selectedGameIndex] || null;
}

function renderMenu() {
  const games = getGames();

  if (games.length === 0) {
    renderEmptyMenu();
    return;
  }

  if (currentScreen === "categories") {
    renderCategoryScreen();
  } else {
    renderGameScreen();
  }
}

function renderEmptyMenu() {
  gameList.innerHTML = `
    <div class="empty-message">
      <strong>No games loaded.</strong><br>
      Check <code>registry/loadGames.js</code> and make sure your game files exist inside <code>registry/games/</code>.
    </div>
  `;

  menuCrumb.textContent = "Main Menu";
  listTitle.textContent = "No Games Found";

  gameName.textContent = "No Games Found";
  gameDescription.textContent =
    "The launcher opened, but no game files registered themselves.";

  ruleType.textContent = "---";
  ruleDecks.textContent = "---";
  rulePayout.textContent = "---";
  ruleDealer.textContent = "---";

  setPreview(null, "COUNTINGSIM");
}

function renderCategoryScreen() {
  const categories = getCategories();

  if (selectedCategoryIndex >= categories.length) {
    selectedCategoryIndex = 0;
  }

  menuCrumb.textContent = "Main Menu";
  listTitle.textContent = "Choose Game Type";
  gameList.innerHTML = "";

  categories.forEach((category, index) => {
    const option = document.createElement("div");
    option.className = "category-option";

    if (index === selectedCategoryIndex) {
      option.classList.add("active");
    }

    option.innerHTML = `
      <div class="selector-arrow">&gt;</div>
      <div>
        <div class="option-title">${category.name}</div>
        <div class="option-subtitle">
          ${category.games.length} version${category.games.length === 1 ? "" : "s"} available
        </div>
      </div>
      <div class="option-tag">${category.games.length}</div>
    `;

    option.onclick = () => {
      selectedCategoryIndex = index;
      updateCategoryInfo();
      renderCategoryScreen();
    };

    option.ondblclick = () => {
      openCategory();
    };

    gameList.appendChild(option);
  });

  updateCategoryInfo();
}

function updateCategoryInfo() {
  const category = getCurrentCategory();
  if (!category) return;

  gameName.textContent = category.name;

  gameDescription.textContent =
    categoryDescription(category.name, category.games.length);

  ruleType.textContent = "Category";
  ruleDecks.textContent = category.games.length;
  rulePayout.textContent = "Varies";
  ruleDealer.textContent = "Varies";

  setPreview(null, category.name);
}

function categoryDescription(categoryName, count) {
  const name = String(categoryName).toLowerCase();

  if (name.includes("blackjack")) {
    return `Train blackjack through ${count} table version${count === 1 ? "" : "s"}. Choose custom rules, classic casino rules, counting modes, and future side-bet tables.`;
  }

  if (name.includes("slot")) {
    return `Practice slot-style game modes, probability awareness, bankroll pacing, and future arcade-style casino simulations.`;
  }

  if (name.includes("baccarat")) {
    return `Learn baccarat table flow, betting options, banker/player outcomes, and rule awareness.`;
  }

  if (name.includes("poker")) {
    return `Train poker decisions, hand reading, position, odds, and future drill-based learning modes.`;
  }

  return `Choose from ${count} available mode${count === 1 ? "" : "s"} inside this category.`;
}

function renderGameScreen() {
  const category = getCurrentCategory();

  if (!category) {
    currentScreen = "categories";
    renderMenu();
    return;
  }

  if (selectedGameIndex >= category.games.length) {
    selectedGameIndex = 0;
  }

  menuCrumb.textContent = `Main Menu > ${category.name}`;
  listTitle.textContent = `Choose ${category.name} Version`;
  gameList.innerHTML = "";

  const backOption = document.createElement("div");
  backOption.className = "game-option";
  backOption.innerHTML = `
    <div class="selector-arrow">&larr;</div>
    <div>
      <div class="option-title">Back</div>
      <div class="option-subtitle">Return to game categories</div>
    </div>
    <div class="option-tag locked">ESC</div>
  `;

  backOption.onclick = () => {
    goBackToCategories();
  };

  gameList.appendChild(backOption);

  category.games.forEach((game, index) => {
    const option = document.createElement("div");
    option.className = "game-option";

    if (index === selectedGameIndex) {
      option.classList.add("active");
    }

    const tagText = getGameTag(game);
    const tagClass =
      tagText === "LOCKED" ? "locked" :
      tagText === "SOON" ? "soon" :
      "";

    option.innerHTML = `
      <div class="selector-arrow">&gt;</div>
      <div>
        <div class="option-title">${game.name}</div>
        <div class="option-subtitle">${game.subtitle || game.description || "Training mode"}</div>
      </div>
      <div class="option-tag ${tagClass}">${tagText}</div>
    `;

    option.onclick = () => {
      selectedGameIndex = index;
      updateGameInfo();
      renderGameScreen();
    };

    option.ondblclick = () => {
      playSelectedGame();
    };

    gameList.appendChild(option);
  });

  updateGameInfo();
}

function getGameTag(game) {
  if (!game.url || game.url === "#") return "SOON";
  if (game.config?.rulesLocked === false) return "CUSTOM";
  return "LOCKED";
}

function updateGameInfo() {
  const game = getCurrentGame();
  if (!game) return;

  gameName.textContent = game.name;
  gameDescription.textContent = game.description || "No description added yet.";

  ruleType.textContent = game.type || game.category || "---";

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
    dealerLabel(game.config?.dealerHitsSoft17);

  setPreview(game, game.name);
}

function setPreview(game, fallbackText) {
  const imagePath =
    game?.previewImage ||
    game?.theme?.previewImage ||
    game?.theme?.feltImage ||
    "";

  if (imagePath) {
    previewImage.src = imagePath;
    previewImage.alt = game?.name || fallbackText || "CountingSim Preview";
    previewImage.classList.remove("hidden");
    previewPlaceholder.classList.add("hidden");

    previewImage.onerror = () => {
      previewImage.classList.add("hidden");
      previewPlaceholder.textContent = fallbackText || "COUNTINGSIM";
      previewPlaceholder.classList.remove("hidden");
    };

    return;
  }

  previewImage.classList.add("hidden");
  previewPlaceholder.textContent = fallbackText || "COUNTINGSIM";
  previewPlaceholder.classList.remove("hidden");
}

function dealerLabel(value) {
  if (value === true) return "H17";
  if (value === false) return "S17";
  return "---";
}

function findPayoutLabel(value) {
  if (value === 1.5) return "3:2";
  if (value === 1.2) return "6:5";
  if (value === 2) return "2:1";
  if (value === 3) return "3:1";
  return null;
}

function openCategory() {
  const category = getCurrentCategory();

  if (!category || category.games.length === 0) return;

  currentScreen = "games";
  selectedGameIndex = 0;
  renderMenu();
}

function goBackToCategories() {
  currentScreen = "categories";
  selectedGameIndex = 0;
  renderMenu();
}

function moveSelection(direction) {
  if (currentScreen === "categories") {
    const categories = getCategories();
    if (categories.length === 0) return;

    selectedCategoryIndex += direction;

    if (selectedCategoryIndex < 0) {
      selectedCategoryIndex = categories.length - 1;
    }

    if (selectedCategoryIndex >= categories.length) {
      selectedCategoryIndex = 0;
    }

    renderCategoryScreen();
    return;
  }

  const category = getCurrentCategory();
  if (!category || category.games.length === 0) return;

  selectedGameIndex += direction;

  if (selectedGameIndex < 0) {
    selectedGameIndex = category.games.length - 1;
  }

  if (selectedGameIndex >= category.games.length) {
    selectedGameIndex = 0;
  }

  renderGameScreen();
}

function confirmSelection() {
  if (currentScreen === "categories") {
    openCategory();
    return;
  }

  playSelectedGame();
}

function playSelectedGame() {
  const game = getCurrentGame();

  if (!game) return;

  if (!game.url || game.url === "#") {
    alert("This mode is coming soon.");
    return;
  }

  addLocalXp(10);

  window.location.href = game.url;
}

function openRules() {
  if (currentScreen === "categories") {
    const category = getCurrentCategory();

    rulesTitle.textContent = `${category?.name || "Category"} Info`;

    rulesContent.innerHTML = `
      <p>
        Select this category to view all available ${category?.name || "game"} versions.
      </p>

      <p>
        Each version can have its own rules, table art, help pages, locked settings,
        and training style.
      </p>

      <div class="tip-box">
        Press Enter to open this category, or double click the highlighted option.
      </div>
    `;

    rulesModal.classList.add("show");
    return;
  }

  const game = getCurrentGame();

  if (!game) return;

  rulesTitle.textContent = `${game.name} Rules`;
  rulesContent.innerHTML = game.rules || "<p>No rules added for this mode yet.</p>";
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

/*
  LOCAL XP DEMO

  This saves only on the player's current browser/device.

  Later:
  replace localStorage with Wix Members, Firebase, Supabase,
  or your own backend.
*/
function loadProgress() {
  return JSON.parse(localStorage.getItem("countingSimProgress") || "{}");
}

function saveProgress(progress) {
  localStorage.setItem("countingSimProgress", JSON.stringify(progress));
}

function addLocalXp(amount) {
  const progress = loadProgress();

  progress.level = progress.level || 1;
  progress.xp = progress.xp || 0;
  progress.xpNeeded = progress.xpNeeded || 100;

  progress.xp += amount;

  while (progress.xp >= progress.xpNeeded) {
    progress.xp -= progress.xpNeeded;
    progress.level += 1;
    progress.xpNeeded = Math.floor(progress.xpNeeded * 1.25);
  }

  saveProgress(progress);
  renderLocalXpDemo();
}

function renderLocalXpDemo() {
  const progress = loadProgress();

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
    confirmSelection();
  }

  if (key === "r") {
    event.preventDefault();
    openRules();
  }

  if (key === "escape" || key === "backspace") {
    if (rulesModal.classList.contains("show")) {
      closeRules();
      return;
    }

    if (accountModal.classList.contains("show")) {
      closeAccountModal();
      return;
    }

    if (currentScreen === "games") {
      goBackToCategories();
    }
  }
});

playBtn.onclick = confirmSelection;
rulesBtn.onclick = openRules;

closeRulesBtn.onclick = closeRules;

rulesModal.onclick = (event) => {
  if (event.target === rulesModal) closeRules();
};

loginBtn.onclick = openAccountModal;
createAccountBtn.onclick = openAccountModal;
closeAccountBtn.onclick = closeAccountModal;

accountModal.onclick = (event) => {
  if (event.target === accountModal) closeAccountModal();
};

/*
  Wait for dynamically loaded registry files.

  loadGames.js creates script tags.
  Those files need a moment to push themselves into GameRegistry.
*/
setTimeout(() => {
  renderMenu();
  renderLocalXpDemo();
}, 250);
