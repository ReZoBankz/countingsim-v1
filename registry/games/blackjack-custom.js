/*
  CountingSim v1.02
  FILE: registry/games/blackjack-custom.js

  PURPOSE:
  This is a customizable blackjack table preset.

  This table is different from locked casino presets.
  Players can adjust rules like:
  - number of decks
  - blackjack payout
  - dealer hits or stands on soft 17
  - surrender
  - insurance
  - max splits
  - training assists

  This is meant to help players mimic tables they see near home.
*/

window.GameRegistry.push({
  id: "blackjack-custom",

  name: "Custom Blackjack Table",

  subtitle: "Build rules close to your local casino",

  type: "Blackjack",

  description:
    "A flexible blackjack training table where players can change key rules to mimic real casino tables near them. Best for learning how different rule sets affect strategy, pacing, and bankroll pressure.",

  /*
    These preview values show on the arcade menu.
    Since this is a custom table, these are shown as adjustable.
  */
  preview: {
    decks: "Custom",
    payout: "Custom",
    dealer: "Custom",
    surrender: "Custom"
  },

  /*
    Rules shown when the player clicks the Rules button on the menu.
    This is NOT game logic. This is player-facing explanation text.
  */
  rules: `
    <h3>Custom Blackjack Table</h3>

    <p>
      This mode lets you build a blackjack table close to what you might see at a real casino.
    </p>

    <h3>Adjustable Rules</h3>
    <ul>
      <li>Choose the number of decks in the shoe.</li>
      <li>Choose blackjack payout, such as 3:2, 6:5, 2:1, or 3:1.</li>
      <li>Choose whether the dealer hits or stands on soft 17.</li>
      <li>Turn surrender on or off.</li>
      <li>Turn insurance on or off.</li>
      <li>Adjust split limits.</li>
      <li>Turn count assistance on or off.</li>
    </ul>

    <h3>Training Purpose</h3>
    <p>
      Use this table to practice under rules that match the casinos near you.
      Different rules can change the player edge, the correct strategy, and how aggressive you should be with bankroll decisions.
    </p>

    <div class="tip-box">
      Tip: If you are preparing for a real casino, always check the table rules before sitting down.
      Blackjack payout and dealer soft 17 rules matter a lot.
    </div>
  `,

  /*
    CONFIG:
    This object is what the blackjack engine will read later.

    rulesLocked: false means the player can change these settings in-game.

    Locked presets like Classic 3:2 or Vegas 6:5 would use:
    rulesLocked: true
  */
  config: {
    rulesLocked: false,

    feltColor: "green",

    startingBankroll: 1000,

    defaultDecks: 6,

    allowedDecks: [1, 2, 4, 6, 8],

    blackjackPayout: 1.5,

    allowedPayouts: [
      {
        label: "3:2",
        value: 1.5
      },
      {
        label: "6:5",
        value: 1.2
      },
      {
        label: "2:1",
        value: 2
      },
      {
        label: "3:1",
        value: 3
      }
    ],

    dealerHitsSoft17: true,

    surrenderAllowed: true,

    insuranceAllowed: true,

    doubleAllowed: true,

    splitAllowed: true,

    maxSplitHandsPerSeat: 4,

    doubleAfterSplitAllowed: true,

    burnCardsOnNewShoe: 3,

    penetrationFraction: 0.20,

    showCountDefault: true,

    cardCountOverlayDefault: true,

    speedDefault: "normal"
  },

  /*
    Later, this URL will open the reusable blackjack engine.
    The table ID in the URL tells the engine which config to load.
  */
  url: "games/blackjack/table.html?table=blackjack-custom"
});