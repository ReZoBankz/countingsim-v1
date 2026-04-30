window.GameRegistry.push({
  id: "blackjack-free-bet",
  category: "Blackjack",
  name: "Free Bet Blackjack",
  subtitle: "Free doubles, free splits, Push 22, Pot of Gold",
  type: "Blackjack Variant",
  description: "A locked Free Bet Blackjack table with free doubles on hard 9-11, free splits on pairs except 10-value cards, dealer Push 22, and Pot of Gold coin tracking.",
  previewImage: "games/blackjack/assets/previews/blackjack-free-bet.png",
  preview: { decks: "6", payout: "3:2", dealer: "H17 / Push 22" },
  config: { rulesLocked: true, defaultDecks: 6, blackjackPayout: 1.5, dealerHitsSoft17: true },
  rules: "<h3>Free Bet Blackjack</h3><p>Six decks, blackjack pays 3:2, dealer hits soft 17, no surrender. Free doubles are available on two-card hard 9, 10, or 11. Free splits are available on pairs except 10-value cards. If the dealer finishes with 22, unresolved player hands push.</p><p>Pot of Gold uses the golden Free Bet coins collected from free doubles and free splits.</p>",
  url: "games/blackjack/table.html?table=blackjack-free-bet"
});
