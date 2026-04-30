window.GameRegistry.push({
  id: "blackjack-custom",
  category: "Blackjack",
  name: "Custom Blackjack",
  subtitle: "Build rules close to your local casino",
  type: "Blackjack",

  description:
    "A fully customizable blackjack training table. Change the rules, practice counting, add bot seats, control speed, and mimic the table conditions you actually want to train for.",

  previewImage: "games/blackjack/assets/previews/blackjack-custom.png",

  preview: {
    decks: "Custom",
    payout: "Custom",
    dealer: "Custom"
  },

  theme: {
    felt: "green",
    tableName: "Custom Blackjack",
    previewImage: "games/blackjack/assets/previews/blackjack-custom.png",
    feltImage: "games/blackjack/assets/felts/custom-blackjack-felt.png"
  },

  config: {
    rulesLocked: false,

    startingBankroll: 1000,

    defaultDecks: 6,
    allowedDecks: [1, 2, 4, 6, 8],

    blackjackPayout: 1.5,
    allowedPayouts: [
      { label: "3:2", value: 1.5 },
      { label: "6:5", value: 1.2 },
      { label: "2:1", value: 2 },
      { label: "3:1", value: 3 }
    ],

    dealerHitsSoft17: true,
    surrenderAllowed: true,
    insuranceAllowed: true,

    doubleAllowed: true,
    splitAllowed: true,
    doubleAfterSplitAllowed: true,
    maxSplitHandsPerSeat: 4,

    maxSeats: 5,
    defaultPlayerSeats: [0],
    defaultBotSeats: [],

    burnCardsOnNewShoe: 3,
    penetrationFraction: 0.20,

    showCountDefault: true,
    cardCountOverlayDefault: true,
    speedDefault: "normal"
  },

  rules: `
    <h3>Custom Blackjack</h3>

    <p>
      Custom Blackjack is the flexible training table. This mode lets you change the rules
      so you can practice closer to the casino tables you actually see.
    </p>

    <h3>What You Can Change</h3>
    <ul>
      <li>Number of decks in the shoe</li>
      <li>Blackjack payout</li>
      <li>Dealer hits or stands on soft 17</li>
      <li>Surrender on or off</li>
      <li>Insurance on or off</li>
      <li>Number of active seats</li>
      <li>Player seats and bot seats</li>
      <li>Counting help and card count overlay</li>
      <li>Deal speed</li>
    </ul>

    <h3>Training Purpose</h3>
    <p>
      Use this mode to recreate the kind of table you frequent, then practice decisions,
      counting, bet sizing, and table flow before playing in person.
    </p>

    <div class="tip-box">
      Tip: The most important real table rules to check are blackjack payout, deck count,
      and whether the dealer hits soft 17.
    </div>
  `,

  url: "games/blackjack/table.html?table=blackjack-custom"
});
