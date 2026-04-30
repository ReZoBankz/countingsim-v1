window.GameRegistry.push({
  id: "blackjack-vegas-strip",
  category: "Blackjack",
  name: "Vegas Strip Rules",
  subtitle: "Stand-soft-17 Strip-style rules",
  type: "Blackjack",
  description: "A Strip-style ruleset with 3:2 blackjack, dealer stands on soft 17, no surrender, insurance, and double after split.",
  previewImage: "games/blackjack/assets/previews/blackjack-vegas-strip.png",
  preview: { decks: "6", payout: "3:2", dealer: "S17" },
  config: { rulesLocked: true, defaultDecks: 6, blackjackPayout: 1.5, dealerHitsSoft17: false },
  rules: "<h3>Vegas Strip Rules</h3><p>Six decks, blackjack pays 3:2, dealer stands on soft 17, no surrender, and double after split is allowed.</p>",
  url: "games/blackjack/table.html?table=blackjack-vegas-strip"
});
