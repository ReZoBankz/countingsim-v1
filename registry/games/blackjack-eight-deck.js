window.GameRegistry.push({
  id: "blackjack-eight-deck",
  category: "Blackjack",
  name: "Eight Deck Shoe",
  subtitle: "Large shoe with smoother true count movement",
  type: "Blackjack",
  description: "An eight-deck shoe for practicing longer shoes, slower true-count movement, and casino pacing.",
  previewImage: "games/blackjack/assets/previews/blackjack-eight-deck.png",
  preview: { decks: "8", payout: "3:2", dealer: "H17" },
  config: { rulesLocked: true, defaultDecks: 8, blackjackPayout: 1.5, dealerHitsSoft17: true },
  rules: "<h3>Eight Deck Shoe</h3><p>Eight decks, blackjack pays 3:2, dealer hits soft 17, surrender is allowed, and double after split is allowed.</p>",
  url: "games/blackjack/table.html?table=blackjack-eight-deck"
});
