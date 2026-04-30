/*
  CountingSim v1.04
  FILE: registry/loadGames.js

  This file controls which game/mode files the arcade menu loads.

  HOW TO ADD A NEW MODE LATER:
  1. Create the mode file inside registry/games/
     Example: blackjack-six-deck.js

  2. Make sure its filename is listed below in gameFiles.

  3. The menu will automatically show it once the file exists and registers itself.

  IMPORTANT:
  If a file is listed here but does not exist yet, the menu will still work.
  The browser will just warn that the missing file could not be loaded.
*/

window.GameRegistry = [];

const gameFiles = [
  /*
    BLACKJACK CUSTOM MODE
    This is the only blackjack mode where players can change core table rules.
  */
  "blackjack-custom.js",

  /*
    CLASSIC BLACKJACK MODES
  */
  "blackjack-single-deck-pitch.js",
  "blackjack-double-deck-pitch.js",
  "blackjack-four-deck.js",
  "blackjack-six-deck.js",
  "blackjack-eight-deck.js",

  /*
    CASINO RULESET MODES
  */
  "blackjack-vegas-strip.js",

  /*
    SPECIALTY BLACKJACK MODES
  */
  "blackjack-free-bet.js",
  "blackjack-double-up.js",
  "blackjack-double-up-madness.js",
  "blackjack-trilux.js",

  /*
    FUTURE NON-BLACKJACK MODES
    Keep these here if you want the main menu to show coming-soon categories.
    Remove them if you only want Blackjack visible for now.
  */
  "slots-coming-soon.js",
  "baccarat-coming-soon.js",
  "poker-coming-soon.js"
];

gameFiles.forEach((file) => {
  const script = document.createElement("script");
  script.src = "registry/games/" + file;

  script.onerror = () => {
    console.warn("CountingSim could not load:", file);
  };

  document.body.appendChild(script);
});
