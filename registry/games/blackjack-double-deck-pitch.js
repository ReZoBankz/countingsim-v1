window.GameRegistry.push({
  id: "blackjack-double-deck-pitch",
  category: "Blackjack",
  name: "Double Deck Pitch",
  subtitle: "Two-deck pitch table with faster count swings",
  type: "Blackjack",
  description: "A two-deck pitch-style game with 3:2 blackjack, H17, no surrender, and double after split enabled.",
  previewImage: "games/blackjack/assets/previews/blackjack-double-deck-pitch.png",
  preview: { decks: "2", payout: "3:2", dealer: "H17" },
  config: { rulesLocked: true, defaultDecks: 2, blackjackPayout: 1.5, dealerHitsSoft17: true },
  rules: "<h3>Double Deck Pitch</h3><p>Two decks, blackjack pays 3:2, dealer hits soft 17, no surrender, and double after split is allowed.</p>",
  url: "games/blackjack/table.html?table=blackjack-double-deck-pitch"
});
