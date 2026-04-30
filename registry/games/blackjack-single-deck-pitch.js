window.GameRegistry.push({
  id: "blackjack-single-deck-pitch",
  category: "Blackjack",
  name: "Single Deck Pitch",
  subtitle: "Classic hand-held single deck blackjack",
  type: "Blackjack",
  description: "A fast-moving single deck game for practicing pitch-style blackjack and sharper running-count swings.",
  previewImage: "games/blackjack/assets/previews/blackjack-single-deck-pitch.png",
  preview: { decks: "1", payout: "3:2", dealer: "S17" },
  config: { rulesLocked: true, defaultDecks: 1, blackjackPayout: 1.5, dealerHitsSoft17: false },
  rules: "<h3>Single Deck Pitch</h3><p>One deck, blackjack pays 3:2, dealer stands on soft 17, no surrender, and double after split is off.</p>",
  url: "games/blackjack/table.html?table=blackjack-single-deck-pitch"
});
