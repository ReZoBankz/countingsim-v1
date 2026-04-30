window.GameRegistry.push({
  id: "blackjack-six-deck",
  category: "Blackjack",
  name: "Six Deck Shoe",
  subtitle: "Common casino shoe game",
  type: "Blackjack",
  description: "A common six-deck casino shoe with 3:2 blackjack, H17, surrender, insurance, and double after split.",
  previewImage: "games/blackjack/assets/previews/blackjack-six-deck.png",
  preview: { decks: "6", payout: "3:2", dealer: "H17" },
  config: { rulesLocked: true, defaultDecks: 6, blackjackPayout: 1.5, dealerHitsSoft17: true },
  rules: "<h3>Six Deck Shoe</h3><p>Six decks, blackjack pays 3:2, dealer hits soft 17, surrender is allowed, and double after split is allowed.</p>",
  url: "games/blackjack/table.html?table=blackjack-six-deck"
});
