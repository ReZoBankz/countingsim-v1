window.GameRegistry.push({
  id: "blackjack-four-deck",
  category: "Blackjack",
  name: "Four Deck Shoe",
  subtitle: "Balanced shoe game for count practice",
  type: "Blackjack",
  description: "A four-deck shoe with 3:2 blackjack, S17, surrender, insurance, and double after split.",
  previewImage: "games/blackjack/assets/previews/blackjack-four-deck.png",
  preview: { decks: "4", payout: "3:2", dealer: "S17" },
  config: { rulesLocked: true, defaultDecks: 4, blackjackPayout: 1.5, dealerHitsSoft17: false },
  rules: "<h3>Four Deck Shoe</h3><p>Four decks, blackjack pays 3:2, dealer stands on soft 17, surrender is allowed, and double after split is allowed.</p>",
  url: "games/blackjack/table.html?table=blackjack-four-deck"
});
