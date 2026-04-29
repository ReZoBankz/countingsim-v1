/*
  CountingSim v1.02
  Casino-style Blackjack Table Engine

  Updates in this version:
  - Dealer checks blackjack immediately when showing Ace or 10-value card
  - Player blackjack auto-resolves correctly
  - Blackjack hands display gold result text
  - Wins/losses/pushes display per hand
  - Even money / insurance structure prepared
  - Dealer hole card still does NOT count until revealed
*/

const SPEEDS = {
  slow: 700,
  normal: 450,
  fast: 220
};

const state = {
  bankroll: 1000,

  runningCount: 0,
  trueCount: 0,

  shoe: [],
  shoeInitialCount: 0,
  numDecks: 6,

  blackjackPayout: 1.5,
  dealerHitsSoft17: true,
  surrenderAllowed: true,
  insuranceAllowed: true,
  doubleAfterSplitAllowed: true,

  burnCardsOnNewShoe: 3,
  penetrationFraction: 0.20,
  maxSplitHandsPerSeat: 4,

  selectedChip: 1,
  betHistory: [],
  lastRoundBets: [10, 0, 0, 0, 0],
  seatBets: [10, 0, 0, 0, 0],
  seatModes: ["player", "empty", "empty", "empty", "empty"],

  seats: [],
  dealerHand: [],

  activeSeatIndex: -1,
  dealerRevealed: false,
  inRound: false,
  isAnimating: false,

  countedIds: new Set(),
  cardId: 0,

  speed: "normal"
};

const $ = (id) => document.getElementById(id);

const ui = {
  tableSubtitle: $("tableSubtitle"),

  startBtn: $("startShoeBtn"),
  dealBtn: $("dealBtn"),
  newRoundBtn: $("newRoundBtn"),
  stopBtn: $("stopBtn"),

  rulesBtn: $("rulesBtn"),
  helpBtn: $("helpBtn"),
  settingsBtn: $("settingsBtn"),

  addMoneyBtn: $("addMoneyBtn"),
  addMoneyModal: $("addMoneyModal"),
  closeAddMoneyBtn: $("closeAddMoneyBtn"),

  settingsModal: $("settingsModal"),
  closeSettingsBtn: $("closeSettingsBtn"),

  rulesModal: $("rulesModal"),
  closeRulesBtn: $("closeRulesBtn"),
  rulesBody: $("rulesBody"),

  helpModal: $("helpModal"),
  helpTitle: $("helpTitle"),
  helpBody: $("helpBody"),
  helpPrev: $("helpPrevBtn"),
  helpNext: $("helpNextBtn"),
  helpDots: $("helpPageDots"),
  helpClose: $("closeHelpBtn"),

  speedSlowBtn: $("speedSlowBtn"),
  speedNormalBtn: $("speedNormalBtn"),
  speedFastBtn: $("speedFastBtn"),

  numDecks: $("numDecks"),
  payoutSelect: $("blackjackPayoutSelect"),
  soft17Select: $("soft17Select"),
  surrenderToggle: $("surrenderAllowedToggle"),
  insuranceToggle: $("insuranceAllowedToggle"),
  doubleAfterSplitToggle: $("doubleAfterSplitToggle"),

  showCount: $("showCount"),
  showCardCountOverlay: $("showCardCountOverlay"),

  bankroll: $("bankrollDisplay"),
  shoeLeft: $("shoeLeftDisplay"),
  shoeOnShoe: $("shoeCountOnShoe"),
  running: $("runningCountDisplay"),
  trueCount: $("trueCountDisplay"),

  dealerTitle: $("dealerTitle"),
  dealerCards: $("dealerCards"),

  tableMessage: $("tableMessage"),
  banner: $("resultBanner"),
  log: $("log"),

  feltPayout: $("feltPayout"),
  feltDealerRule: $("feltDealerRule"),
  feltInsurance: $("feltInsurance"),

  undoBetBtn: $("undoBetBtn"),
  clearBetsBtn: $("clearBetsBtn"),
  repeatBetBtn: $("repeatBetBtn"),
  doubleBetsBtn: $("doubleBetsBtn"),

  seatStacks: [
    $("seatStack0"),
    $("seatStack1"),
    $("seatStack2"),
    $("seatStack3"),
    $("seatStack4")
  ],

  seatBetDisplays: [
    $("seatBet0"),
    $("seatBet1"),
    $("seatBet2"),
    $("seatBet3"),
    $("seatBet4")
  ],

  actions: [
    $("actions-0"),
    $("actions-1"),
    $("actions-2"),
    $("actions-3"),
    $("actions-4")
  ]
};

let helpPage = 0;
let bannerTimer = null;

const HELP = [
  {
    title: "Welcome to CountingSim",
    body: `
      <p>CountingSim is a blackjack training simulator built to feel closer to a real table.</p>
      <p>Select a chip at the bottom, click a betting circle, then deal.</p>
      <div class="tip-box"><strong>Goal:</strong> Practice decisions, count tracking, table flow, and bankroll pressure before sitting at a real casino table.</div>
    `
  },
  {
    title: "Dealer Blackjack",
    body: `
      <p>If the dealer shows an Ace or 10-value card, the dealer checks the hole card.</p>
      <p>If the dealer has blackjack, the round ends immediately unless player blackjack hands push.</p>
      <p>If the dealer shows an Ace and you have blackjack, casinos may offer even money, which is a 1:1 guaranteed payout.</p>
    `
  },
  {
    title: "Hi-Lo Count",
    body: `
      <p><strong>2, 3, 4, 5, 6 = +1</strong></p>
      <p><strong>7, 8, 9 = 0</strong></p>
      <p><strong>10, J, Q, K, A = -1</strong></p>
      <p>The dealer hole card does not count until it is revealed.</p>
    `
  }
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSpeedMs() {
  return SPEEDS[state.speed];
}

function setSpeed(speedName) {
  state.speed = speedName;

  ui.speedSlowBtn.classList.remove("active-speed");
  ui.speedNormalBtn.classList.remove("active-speed");
  ui.speedFastBtn.classList.remove("active-speed");

  if (speedName === "slow") ui.speedSlowBtn.classList.add("active-speed");
  if (speedName === "normal") ui.speedNormalBtn.classList.add("active-speed");
  if (speedName === "fast") ui.speedFastBtn.classList.add("active-speed");
}

function nextId() {
  state.cardId++;
  return "c" + state.cardId;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function buildShoe(decks) {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const shoe = [];

  for (let d = 0; d < decks; d++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        shoe.push({
          id: nextId(),
          suit,
          rank
        });
      }
    }
  }

  shuffle(shoe);
  return shoe;
}

function startShoe() {
  applySettings();

  state.shoe = buildShoe(state.numDecks);
  state.shoeInitialCount = state.shoe.length;
  state.runningCount = 0;
  state.trueCount = 0;
  state.countedIds = new Set();

  for (let i = 0; i < state.burnCardsOnNewShoe; i++) {
    state.shoe.pop();
  }

  resetRoundOnly();
  setMessage("New shoe started. Place your bets.");
  render();
}

function resetRoundOnly() {
  state.seats = [];
  state.dealerHand = [];
  state.activeSeatIndex = -1;
  state.dealerRevealed = false;
  state.inRound = false;
  state.isAnimating = false;

  clearAllActions();
  render();
}

function draw() {
  return state.shoe.pop();
}

function cardValue(card) {
  if (!card) return 0;
  if (card.rank === "A") return 11;
  if (["J", "Q", "K"].includes(card.rank)) return 10;
  return Number(card.rank);
}

function isTenValue(card) {
  return card && cardValue(card) === 10;
}

function hiLo(card) {
  if (["2", "3", "4", "5", "6"].includes(card.rank)) return 1;
  if (["7", "8", "9"].includes(card.rank)) return 0;
  return -1;
}

function countVisible(card) {
  if (!card) return;
  if (state.countedIds.has(card.id)) return;

  state.countedIds.add(card.id);
  state.runningCount += hiLo(card);
}

function evaluate(cards) {
  let total = 0;
  let aces = 0;

  cards.forEach((card) => {
    total += cardValue(card);
    if (card.rank === "A") aces++;
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function isSoft(cards) {
  let total = 0;
  let aces = 0;

  cards.forEach((card) => {
    total += cardValue(card);
    if (card.rank === "A") aces++;
  });

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return aces > 0 && total <= 21;
}

function blackjack(cards) {
  return cards.length === 2 && evaluate(cards) === 21;
}

function payoutLabel(value) {
  if (value === 1.5) return "3 TO 2";
  if (value === 1.2) return "6 TO 5";
  if (value === 2) return "2 TO 1";
  if (value === 3) return "3 TO 1";
  return `${value} TO 1`;
}

function applySettings() {
  state.numDecks = Number(ui.numDecks.value);
  state.blackjackPayout = Number(ui.payoutSelect.value);
  state.dealerHitsSoft17 = ui.soft17Select.value === "hit";
  state.surrenderAllowed = ui.surrenderToggle.checked;
  state.insuranceAllowed = ui.insuranceToggle.checked;
  state.doubleAfterSplitAllowed = ui.doubleAfterSplitToggle.checked;

  ui.feltPayout.textContent = `BLACKJACK PAYS ${payoutLabel(state.blackjackPayout)}`;
  ui.feltDealerRule.textContent = state.dealerHitsSoft17
    ? "DEALER HITS SOFT 17"
    : "DEALER STANDS ON 17";
  ui.feltInsurance.textContent = state.insuranceAllowed
    ? "INSURANCE PAYS 2 TO 1"
    : "NO INSURANCE";
}

function getActivePreRoundSeats() {
  return state.seatBets
    .map((bet, seatIndex) => ({
      bet,
      seatIndex,
      mode: state.seatModes[seatIndex]
    }))
    .filter((item) => item.bet > 0 && item.mode !== "empty");
}

function makeHand(bet) {
  return {
    cards: [],
    bet,
    done: false,
    bust: false,
    surrender: false,
    fromSplit: false,
    resultText: "",
    resultType: ""
  };
}

async function initialDeal() {
  if (state.inRound || state.isAnimating) return;

  applySettings();

  const activeSeats = getActivePreRoundSeats();
  const totalBet = activeSeats.reduce((sum, item) => sum + item.bet, 0);

  if (activeSeats.length === 0) {
    popup("Place a bet first", "lose");
    return;
  }

  if (state.bankroll < totalBet) {
    popup("Not enough bankroll", "lose");
    return;
  }

  if (
    state.shoe.length < 15 ||
    state.shoe.length < state.shoeInitialCount * state.penetrationFraction
  ) {
    startShoe();
  }

  state.lastRoundBets = [...state.seatBets];
  state.bankroll -= totalBet;

  state.seats = [];
  state.dealerHand = [];
  state.activeSeatIndex = -1;
  state.dealerRevealed = false;
  state.inRound = true;
  state.isAnimating = true;

  activeSeats.forEach((item) => {
    state.seats.push({
      seatIndex: item.seatIndex,
      mode: item.mode,
      activeHandIndex: 0,
      hands: [makeHand(item.bet)]
    });
  });

  setMessage("Dealing...");
  render();

  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < state.seats.length; i++) {
      const card = draw();
      state.seats[i].hands[0].cards.push(card);
      countVisible(card);
      render();
      await sleep(getSpeedMs());
    }

    const dealerCard = draw();
    state.dealerHand.push(dealerCard);

    if (round === 0) {
      countVisible(dealerCard);
    }

    render();
    await sleep(getSpeedMs());
  }

  state.isAnimating = false;
  render();

  await checkDealerBlackjackOrContinue();
}

async function checkDealerBlackjackOrContinue() {
  const dealerUpCard = state.dealerHand[0];

  if (dealerUpCard?.rank === "A") {
    setMessage("Dealer shows Ace. Checking for blackjack...");
    await sleep(getSpeedMs());
  }

  if (isTenValue(dealerUpCard)) {
    setMessage("Dealer shows 10-value. Checking for blackjack...");
    await sleep(getSpeedMs());
  }

  if (dealerUpCard?.rank === "A" || isTenValue(dealerUpCard)) {
    if (blackjack(state.dealerHand)) {
      state.dealerRevealed = true;
      countVisible(state.dealerHand[1]);
      settleDealerBlackjack();
      return;
    }
  }

  await handlePlayerBlackjacksThenContinue();
}

function settleDealerBlackjack() {
  let net = 0;

  state.seats.forEach((seat) => {
    seat.hands.forEach((hand) => {
      hand.done = true;

      if (blackjack(hand.cards) && !hand.fromSplit) {
        state.bankroll += hand.bet;
        hand.resultText = "PUSH";
        hand.resultType = "push";
      } else {
        net -= hand.bet;
        hand.resultText = `-$${hand.bet}`;
        hand.resultType = "lose";
      }
    });
  });

  state.inRound = false;
  state.isAnimating = false;
  state.activeSeatIndex = -1;

  clearAllActions();
  setMessage("Dealer Blackjack. Round over.");

  if (net < 0) popup(`Dealer Blackjack • Lose $${Math.abs(net).toFixed(0)}`, "lose");
  else popup("Dealer Blackjack • Push", "push");

  render();
}

async function handlePlayerBlackjacksThenContinue() {
  let paidBlackjacks = false;

  for (const seat of state.seats) {
    const hand = seat.hands[0];

    if (blackjack(hand.cards) && !hand.fromSplit) {
      const profit = hand.bet * state.blackjackPayout;
      state.bankroll += hand.bet + profit;
      hand.done = true;
      hand.resultText = `BLACKJACK +$${profit.toFixed(0)}`;
      hand.resultType = "blackjack";
      paidBlackjacks = true;
    }
  }

  if (paidBlackjacks) {
    popup("Blackjack paid", "win");
    render();
    await sleep(getSpeedMs());
  }

  const anyPlayable = state.seats.some((seat) =>
    seat.hands.some((hand) => !hand.done)
  );

  if (!anyPlayable) {
    state.inRound = false;
    state.isAnimating = false;
    state.activeSeatIndex = -1;
    setMessage("Round complete. Blackjack paid.");
    render();
    return;
  }

  state.activeSeatIndex = findNextSeatWithPlayableHand(-1);
  await continueTurnFlow();
}

function findNextSeatWithPlayableHand(fromSeatIndex) {
  for (let i = fromSeatIndex + 1; i < state.seats.length; i++) {
    const seat = state.seats[i];
    const playableIndex = seat.hands.findIndex((hand) => !hand.done);

    if (playableIndex !== -1) {
      seat.activeHandIndex = playableIndex;
      return i;
    }
  }

  return -1;
}

function findNextPlayableHandInSameSeat(seat) {
  for (let i = seat.activeHandIndex + 1; i < seat.hands.length; i++) {
    if (!seat.hands[i].done) return i;
  }

  return -1;
}

function getCurrentSeat() {
  return state.seats[state.activeSeatIndex] || null;
}

function getCurrentHand() {
  const seat = getCurrentSeat();
  if (!seat) return null;
  return seat.hands[seat.activeHandIndex] || null;
}

async function prepareActiveHandIfNeeded() {
  const hand = getCurrentHand();
  if (!hand) return;

  if (hand.cards.length === 1) {
    state.isAnimating = true;

    const card = draw();
    hand.cards.push(card);
    countVisible(card);

    render();
    await sleep(getSpeedMs());

    state.isAnimating = false;
    render();
  }
}

async function continueTurnFlow() {
  const seat = getCurrentSeat();

  if (!seat) {
    await dealerTurn();
    return;
  }

  await prepareActiveHandIfNeeded();

  if (seat.mode === "bot") {
    await botPlaySeat(seat);
    return;
  }

  setMessage(`Seat ${seat.seatIndex + 1}: choose an action`);
  render();
}

async function advanceTurn() {
  const seat = getCurrentSeat();

  if (!seat) {
    await dealerTurn();
    return;
  }

  const nextSubHand = findNextPlayableHandInSameSeat(seat);

  if (nextSubHand !== -1) {
    seat.activeHandIndex = nextSubHand;
    render();
    await continueTurnFlow();
    return;
  }

  const nextSeat = findNextSeatWithPlayableHand(state.activeSeatIndex);

  if (nextSeat !== -1) {
    state.activeSeatIndex = nextSeat;
    render();
    await continueTurnFlow();
    return;
  }

  await dealerTurn();
}

async function botPlaySeat(seat) {
  state.isAnimating = true;
  setMessage(`Seat ${seat.seatIndex + 1} bot is playing...`);

  let hand = seat.hands[seat.activeHandIndex];

  await sleep(getSpeedMs());

  while (!hand.done) {
    const total = evaluate(hand.cards);

    if (total < 17) {
      const card = draw();
      hand.cards.push(card);
      countVisible(card);

      if (evaluate(hand.cards) > 21) {
        hand.bust = true;
        hand.done = true;
      }

      render();
      await sleep(getSpeedMs());
    } else {
      hand.done = true;
    }
  }

  state.isAnimating = false;
  render();
  await advanceTurn();
}

async function playerHit() {
  const hand = getCurrentHand();
  if (!hand || state.isAnimating) return;

  state.isAnimating = true;

  const card = draw();
  hand.cards.push(card);
  countVisible(card);

  render();
  await sleep(getSpeedMs());

  if (evaluate(hand.cards) > 21) {
    hand.bust = true;
    hand.done = true;
    hand.resultText = `-$${hand.bet}`;
    hand.resultType = "lose";
    popup("Bust", "lose");
    state.isAnimating = false;
    render();
    await advanceTurn();
    return;
  }

  state.isAnimating = false;
  render();
}

async function playerStand() {
  const hand = getCurrentHand();
  if (!hand || state.isAnimating) return;

  hand.done = true;
  render();
  await advanceTurn();
}

async function playerDouble() {
  const hand = getCurrentHand();
  if (!hand || state.isAnimating) return;

  if (state.bankroll < hand.bet) {
    popup("Not enough bankroll to double", "lose");
    return;
  }

  state.bankroll -= hand.bet;
  hand.bet *= 2;

  state.isAnimating = true;

  const card = draw();
  hand.cards.push(card);
  countVisible(card);

  render();
  await sleep(getSpeedMs());

  if (evaluate(hand.cards) > 21) {
    hand.bust = true;
    hand.resultText = `-$${hand.bet}`;
    hand.resultType = "lose";
  }

  hand.done = true;
  state.isAnimating = false;
  render();

  await advanceTurn();
}

async function playerSplit() {
  const seat = getCurrentSeat();
  const hand = getCurrentHand();

  if (!seat || !hand || state.isAnimating) return;

  if (state.bankroll < hand.bet) {
    popup("Not enough bankroll to split", "lose");
    return;
  }

  if (seat.hands.length >= state.maxSplitHandsPerSeat) {
    popup("Split limit reached", "lose");
    return;
  }

  state.bankroll -= hand.bet;

  const secondCard = hand.cards.pop();

  const newHand = makeHand(hand.bet);
  newHand.cards = [secondCard];
  newHand.fromSplit = true;

  hand.fromSplit = true;
  seat.hands.splice(seat.activeHandIndex + 1, 0, newHand);

  state.isAnimating = true;

  const currentCard = draw();
  hand.cards.push(currentCard);
  countVisible(currentCard);

  render();
  await sleep(getSpeedMs());

  state.isAnimating = false;
  render();
}

async function playerSurrender() {
  const hand = getCurrentHand();
  if (!hand || state.isAnimating) return;

  hand.surrender = true;
  hand.done = true;

  state.bankroll += hand.bet / 2;
  hand.resultText = `-$${(hand.bet / 2).toFixed(0)}`;
  hand.resultType = "lose";

  popup("Surrender", "push");
  render();

  await advanceTurn();
}

async function dealerTurn() {
  state.isAnimating = true;
  state.dealerRevealed = true;

  if (state.dealerHand[1]) {
    countVisible(state.dealerHand[1]);
  }

  setMessage("Dealer turn");
  render();

  await sleep(getSpeedMs());

  while (true) {
    const total = evaluate(state.dealerHand);
    const soft = isSoft(state.dealerHand);

    if (total < 17 || (state.dealerHitsSoft17 && total === 17 && soft)) {
      const card = draw();
      state.dealerHand.push(card);
      countVisible(card);
      render();
      await sleep(getSpeedMs());
      continue;
    }

    break;
  }

  settle();
}

function settle() {
  const dealerTotal = evaluate(state.dealerHand);
  const dealerBJ = blackjack(state.dealerHand);
  let net = 0;

  state.seats.forEach((seat) => {
    seat.hands.forEach((hand) => {
      if (hand.surrender) return;

      const total = evaluate(hand.cards);

      if (hand.bust) {
        net -= hand.bet;
        if (!hand.resultText) {
          hand.resultText = `-$${hand.bet}`;
          hand.resultType = "lose";
        }
        return;
      }

      if (blackjack(hand.cards) && !dealerBJ && !hand.fromSplit) {
        const profit = hand.bet * state.blackjackPayout;
        state.bankroll += hand.bet + profit;
        net += profit;
        hand.resultText = `BLACKJACK +$${profit.toFixed(0)}`;
        hand.resultType = "blackjack";
        return;
      }

      if (blackjack(hand.cards) && dealerBJ && !hand.fromSplit) {
        state.bankroll += hand.bet;
        hand.resultText = "PUSH";
        hand.resultType = "push";
        return;
      }

      if (dealerTotal > 21) {
        state.bankroll += hand.bet * 2;
        net += hand.bet;
        hand.resultText = `+$${hand.bet}`;
        hand.resultType = "win";
        return;
      }

      if (total > dealerTotal) {
        state.bankroll += hand.bet * 2;
        net += hand.bet;
        hand.resultText = `+$${hand.bet}`;
        hand.resultType = "win";
        return;
      }

      if (total === dealerTotal) {
        state.bankroll += hand.bet;
        hand.resultText = "PUSH";
        hand.resultType = "push";
        return;
      }

      net -= hand.bet;
      hand.resultText = `-$${hand.bet}`;
      hand.resultType = "lose";
    });
  });

  if (net > 0) popup(`Win $${net.toFixed(0)}`, "win");
  else if (net < 0) popup(`Lose $${Math.abs(net).toFixed(0)}`, "lose");
  else popup("Push", "push");

  state.inRound = false;
  state.isAnimating = false;
  state.activeSeatIndex = -1;

  clearAllActions();
  setMessage("Round complete. Place bets or repeat your last bet.");
  render();
}

function cardHTML(card, hidden = false) {
  if (hidden) {
    return `<div class="card-render back"></div>`;
  }

  const red = ["♥", "♦"].includes(card.suit) ? " red" : "";
  const countValue = hiLo(card);
  let badge = "";

  if (ui.showCardCountOverlay.checked) {
    const badgeText = countValue > 0 ? "+1" : countValue === 0 ? "0" : "-1";
    const badgeClass =
      countValue > 0 ? "count-plus" :
      countValue === 0 ? "count-zero" :
      "count-minus";

    badge = `<div class="count-badge ${badgeClass}">${badgeText}</div>`;
  }

  return `
    <div class="card-render${red}">
      ${badge}
      <div class="rank-top">${card.rank}</div>
      <div class="center-suit">${card.suit}</div>
      <div class="rank-bottom">${card.rank}</div>
    </div>
  `;
}

function subhandClass(offset) {
  if (offset === 0) return "active";
  if (offset === -1) return "left";
  if (offset === 1) return "right";
  if (offset < -1) return "far-left";
  return "far-right";
}

function renderDealer() {
  ui.dealerCards.innerHTML = "";

  if (state.dealerHand.length === 0) {
    ui.dealerTitle.textContent = "Dealer";
    return;
  }

  ui.dealerTitle.textContent = state.dealerRevealed
    ? `Dealer (${evaluate(state.dealerHand)})`
    : "Dealer";

  if (!state.dealerRevealed && state.dealerHand.length >= 2) {
    const upWrap = document.createElement("div");
    upWrap.innerHTML = cardHTML(state.dealerHand[0], false);
    const up = upWrap.firstElementChild;
    up.style.position = "relative";
    up.style.zIndex = "2";
    ui.dealerCards.appendChild(up);

    const holeWrap = document.createElement("div");
    holeWrap.innerHTML = cardHTML(state.dealerHand[1], true);
    const hole = holeWrap.firstElementChild;
    hole.style.position = "relative";
    hole.style.zIndex = "1";
    ui.dealerCards.appendChild(hole);

    return;
  }

  state.dealerHand.forEach((card, index) => {
    const wrap = document.createElement("div");
    wrap.innerHTML = cardHTML(card, false);
    const el = wrap.firstElementChild;
    el.style.position = "relative";
    el.style.zIndex = String(index + 1);
    ui.dealerCards.appendChild(el);
  });
}

function renderSeatByOriginalSeatIndex(originalSeatIndex) {
  const stack = ui.seatStacks[originalSeatIndex];
  const actions = ui.actions[originalSeatIndex];

  stack.innerHTML = "";
  actions.innerHTML = "";

  const seat = state.seats.find((item) => item.seatIndex === originalSeatIndex);

  document
    .querySelector(`.player-seat[data-seat="${originalSeatIndex}"]`)
    ?.classList.toggle(
      "active-seat",
      state.inRound &&
      state.seats[state.activeSeatIndex]?.seatIndex === originalSeatIndex
    );

  if (!seat) return;

  seat.hands.forEach((hand, handIndex) => {
    const offset = handIndex - seat.activeHandIndex;
    const wrapper = document.createElement("div");
    wrapper.className = `subhand ${subhandClass(offset)}`;

    const total = evaluate(hand.cards);

    let status = "";
    if (hand.surrender) status = " • Surrender";
    else if (hand.bust) status = " • Bust";
    else if (hand.done) status = " • Done";
    else if (blackjack(hand.cards) && !hand.fromSplit) status = " • Blackjack";

    if (hand.resultText) {
      const result = document.createElement("div");
      result.className = `hand-result ${hand.resultType}`;
      result.textContent = hand.resultText;
      wrapper.appendChild(result);
    }

    const meta = document.createElement("div");
    meta.className = "subhand-meta";
    meta.textContent = `Bet $${hand.bet} | ${total}${status}`;
    wrapper.appendChild(meta);

    const cards = document.createElement("div");
    cards.className = "cards stagger";

    hand.cards.forEach((card) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = cardHTML(card, false);
      cards.appendChild(wrap.firstElementChild);
    });

    wrapper.appendChild(cards);
    stack.appendChild(wrapper);
  });

  const isActiveSeat = state.seats[state.activeSeatIndex] === seat;

  if (state.inRound && isActiveSeat && !state.isAnimating && seat.mode === "player") {
    const hand = seat.hands[seat.activeHandIndex];

    if (hand && !hand.done) {
      addActionButton(actions, "Hit", playerHit);
      addActionButton(actions, "Stand", playerStand);

      if (hand.cards.length === 2) {
        addActionButton(actions, "Double", playerDouble);

        if (
          hand.cards[0].rank === hand.cards[1].rank &&
          seat.hands.length < state.maxSplitHandsPerSeat
        ) {
          addActionButton(actions, "Split", playerSplit);
        }

        if (state.surrenderAllowed) {
          addActionButton(actions, "Surrender", playerSurrender);
        }
      }
    }
  }
}

function addActionButton(container, text, fn) {
  const button = document.createElement("button");
  button.textContent = text;
  button.onclick = fn;

  if (text === "Stand") button.className = "secondary";
  if (text === "Double" || text === "Split") button.className = "info";
  if (text === "Surrender") button.className = "danger";

  container.appendChild(button);
}

function clearAllActions() {
  ui.actions.forEach((action) => {
    action.innerHTML = "";
  });
}

function renderBets() {
  state.seatBets.forEach((bet, index) => {
    ui.seatBetDisplays[index].textContent = bet;

    const spot = document.querySelector(`.bet-spot[data-seat="${index}"]`);
    if (spot) {
      spot.disabled = state.inRound;
      spot.classList.toggle("active-bet-spot", state.seatModes[index] !== "empty" && bet > 0);
    }
  });
}

function render() {
  renderDealer();

  for (let i = 0; i < 5; i++) {
    renderSeatByOriginalSeatIndex(i);
  }

  renderBets();

  ui.bankroll.textContent = state.bankroll.toFixed(2);
  ui.shoeLeft.textContent = state.shoe.length;
  ui.shoeOnShoe.textContent = state.shoe.length;

  const decksRemaining = Math.max(state.shoe.length / 52, 0.25);
  state.trueCount = state.runningCount / decksRemaining;

  ui.running.textContent = state.runningCount;
  ui.trueCount.textContent = state.trueCount.toFixed(1);

  if (!ui.showCount.checked) {
    ui.running.classList.add("count-hidden");
    ui.trueCount.classList.add("count-hidden");
  } else {
    ui.running.classList.remove("count-hidden");
    ui.trueCount.classList.remove("count-hidden");
  }

  ui.dealBtn.disabled = state.inRound || state.shoe.length < 10 || state.isAnimating;
  ui.newRoundBtn.disabled = state.inRound || state.isAnimating;
}

function setMessage(text) {
  ui.tableMessage.textContent = text;
}

function popup(text, type) {
  clearTimeout(bannerTimer);

  ui.banner.textContent = text;
  ui.banner.className = "result-banner visible " + type;

  bannerTimer = setTimeout(() => {
    ui.banner.className = "result-banner";
  }, 2200);
}

function addSeatBet(seatIndex, amount) {
  if (state.inRound) return;

  if (state.seatModes[seatIndex] === "empty") {
    state.seatModes[seatIndex] = "player";
    const select = document.querySelector(`.seat-mode[data-seat="${seatIndex}"]`);
    if (select) select.value = "player";
  }

  state.seatBets[seatIndex] += amount;
  state.betHistory.push({ seatIndex, amount });
  render();
}

function undoBet() {
  if (state.inRound) return;

  const last = state.betHistory.pop();
  if (!last) return;

  state.seatBets[last.seatIndex] = Math.max(0, state.seatBets[last.seatIndex] - last.amount);
  render();
}

function clearBets() {
  if (state.inRound) return;

  state.seatBets = [0, 0, 0, 0, 0];
  state.betHistory = [];
  render();
}

function repeatBet() {
  if (state.inRound) return;

  state.seatBets = [...state.lastRoundBets];

  state.seatBets.forEach((bet, index) => {
    if (bet > 0 && state.seatModes[index] === "empty") {
      state.seatModes[index] = "player";
      const select = document.querySelector(`.seat-mode[data-seat="${index}"]`);
      if (select) select.value = "player";
    }
  });

  render();
}

function doubleBets() {
  if (state.inRound) return;

  state.seatBets = state.seatBets.map((bet) => bet * 2);
  render();
}

function setSelectedChip(amount) {
  state.selectedChip = amount;

  document.querySelectorAll(".rack-chip").forEach((chip) => {
    chip.classList.toggle("selected-chip", Number(chip.dataset.chip) === amount);
  });
}

function renderHelp() {
  ui.helpTitle.innerHTML = HELP[helpPage].title;
  ui.helpBody.innerHTML = HELP[helpPage].body;
  ui.helpDots.textContent = `Page ${helpPage + 1} of ${HELP.length}`;
  ui.helpPrev.disabled = helpPage === 0;
  ui.helpNext.disabled = helpPage === HELP.length - 1;
}

function openHelp() {
  helpPage = 0;
  renderHelp();
  ui.helpModal.style.display = "flex";
}

function closeHelp() {
  ui.helpModal.style.display = "none";
}

function openRules() {
  applySettings();

  ui.rulesBody.innerHTML = `
    <h3>Current Table Rules</h3>
    <p><strong>Decks:</strong> ${state.numDecks}</p>
    <p><strong>Blackjack pays:</strong> ${payoutLabel(state.blackjackPayout)}</p>
    <p><strong>Dealer soft 17:</strong> ${state.dealerHitsSoft17 ? "Hits Soft 17" : "Stands Soft 17"}</p>
    <p><strong>Surrender:</strong> ${state.surrenderAllowed ? "Allowed" : "Not allowed"}</p>
    <p><strong>Insurance:</strong> ${state.insuranceAllowed ? "Allowed" : "Not allowed"}</p>
    <p><strong>Double after split:</strong> ${state.doubleAfterSplitAllowed ? "Allowed" : "Not allowed"}</p>
    <div class="tip-box">Dealer blackjack is checked immediately when the dealer shows an Ace or 10-value card.</div>
  `;

  ui.rulesModal.style.display = "flex";
}

function closeRules() {
  ui.rulesModal.style.display = "none";
}

function openSettings() {
  ui.settingsModal.style.display = "flex";
}

function closeSettings() {
  ui.settingsModal.style.display = "none";
}

function setSeatMode(seatIndex, mode) {
  state.seatModes[seatIndex] = mode;

  if (mode === "empty") {
    state.seatBets[seatIndex] = 0;
  }

  if (mode === "bot" && state.seatBets[seatIndex] === 0) {
    state.seatBets[seatIndex] = 10;
  }

  render();
}

function autoFillBots(count) {
  if (state.inRound) return;

  for (let i = 1; i < 5; i++) {
    if (count > 0) {
      state.seatModes[i] = "bot";
      state.seatBets[i] = state.seatBets[i] || 10;
      count--;
    } else {
      state.seatModes[i] = "empty";
      state.seatBets[i] = 0;
    }

    const select = document.querySelector(`.seat-mode[data-seat="${i}"]`);
    if (select) select.value = state.seatModes[i];
  }

  render();
}

/* Events */

ui.startBtn.onclick = startShoe;
ui.dealBtn.onclick = initialDeal;

ui.newRoundBtn.onclick = () => {
  if (state.inRound) return;
  resetRoundOnly();
};

ui.stopBtn.onclick = () => {
  state.bankroll = 1000;
  state.shoe = [];
  state.runningCount = 0;
  state.trueCount = 0;
  state.countedIds = new Set();
  resetRoundOnly();
  setMessage("Simulator stopped. Start a new shoe.");
};

ui.rulesBtn.onclick = openRules;
ui.closeRulesBtn.onclick = closeRules;

ui.helpBtn.onclick = openHelp;
ui.helpClose.onclick = closeHelp;

ui.helpPrev.onclick = () => {
  if (helpPage > 0) {
    helpPage--;
    renderHelp();
  }
};

ui.helpNext.onclick = () => {
  if (helpPage < HELP.length - 1) {
    helpPage++;
    renderHelp();
  }
};

ui.settingsBtn.onclick = openSettings;
ui.closeSettingsBtn.onclick = closeSettings;

ui.settingsModal.onclick = (event) => {
  if (event.target === ui.settingsModal) closeSettings();
};

ui.rulesModal.onclick = (event) => {
  if (event.target === ui.rulesModal) closeRules();
};

ui.helpModal.onclick = (event) => {
  if (event.target === ui.helpModal) closeHelp();
};

ui.addMoneyBtn.onclick = () => {
  ui.addMoneyModal.style.display = "flex";
};

ui.closeAddMoneyBtn.onclick = () => {
  ui.addMoneyModal.style.display = "none";
};

ui.addMoneyModal.onclick = (event) => {
  if (event.target === ui.addMoneyModal) {
    ui.addMoneyModal.style.display = "none";
  }
};

document.querySelectorAll("[data-add-money]").forEach((button) => {
  button.onclick = () => {
    const amount = Number(button.dataset.addMoney);
    state.bankroll += amount;
    popup(`Added $${amount.toLocaleString()}`, "win");
    ui.addMoneyModal.style.display = "none";
    render();
  };
});

document.querySelectorAll(".rack-chip").forEach((chip) => {
  chip.onclick = () => {
    setSelectedChip(Number(chip.dataset.chip));
  };
});

document.querySelectorAll(".bet-spot").forEach((spot) => {
  spot.onclick = () => {
    addSeatBet(Number(spot.dataset.seat), state.selectedChip);
  };
});

document.querySelectorAll(".seat-mode").forEach((select) => {
  select.onchange = () => {
    setSeatMode(Number(select.dataset.seat), select.value);
  };
});

document.querySelectorAll(".bot-fill-btn").forEach((button) => {
  button.onclick = () => {
    autoFillBots(Number(button.dataset.bots));
  };
});

ui.undoBetBtn.onclick = undoBet;
ui.clearBetsBtn.onclick = clearBets;
ui.repeatBetBtn.onclick = repeatBet;
ui.doubleBetsBtn.onclick = doubleBets;

ui.showCount.onchange = render;
ui.showCardCountOverlay.onchange = render;

ui.numDecks.onchange = () => {
  if (!state.inRound) startShoe();
};

ui.payoutSelect.onchange = applySettings;
ui.soft17Select.onchange = applySettings;
ui.surrenderToggle.onchange = applySettings;
ui.insuranceToggle.onchange = applySettings;
ui.doubleAfterSplitToggle.onchange = applySettings;

ui.speedSlowBtn.onclick = () => setSpeed("slow");
ui.speedNormalBtn.onclick = () => setSpeed("normal");
ui.speedFastBtn.onclick = () => setSpeed("fast");

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "d") initialDeal();
  if (key === "h") playerHit();
  if (key === "s") playerStand();
  if (key === "x") playerDouble();
  if (key === "r") openRules();
  if (key === "escape") {
    closeHelp();
    closeRules();
    closeSettings();
  }
});

/* Boot */

applySettings();
setSpeed("normal");
startShoe();
setSelectedChip(1);
setMessage("Select a chip, place your bets, then deal.");
render();