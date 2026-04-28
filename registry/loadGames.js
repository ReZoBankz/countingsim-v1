/*
  CountingSim v1.02
  FILE: registry/loadGames.js

  This file is the "loader" for all games/tables.

  IMPORTANT:
  - This creates a global registry (GameRegistry)
  - Every game file will "register itself" into this array
  - The menu reads from this registry and builds the UI

  HOW TO ADD NEW GAMES LATER:

  1. Create a new file inside:
     registry/games/

     Example:
     blackjack-speed-drill.js

  2. Add the file name to the list below

  3. Done — the menu will automatically show it

  You do NOT rewrite menu.js or index.html
*/

window.GameRegistry = [];

/*
  LIST OF GAME FILES

  Add new game files here.

  Keep the order you want them to appear in the menu.
*/
const gameFiles = [
  "blackjack-beginner.js",
  "blackjack-classic.js",
  "blackjack-vegas65.js",
  "blackjack-custom.js"
];

/*
  LOAD EACH FILE

  This dynamically creates <script> tags
  so each file runs and registers itself
*/
gameFiles.forEach(file => {
  const script = document.createElement("script");

  script.src = "registry/games/" + file;

  // Helps debugging if something fails to load
  script.onerror = () => {
    console.warn("Failed to load game file:", file);
  };

  document.body.appendChild(script);
});

/*
  NOTE:

  Each file inside registry/games/ should contain:

  window.GameRegistry.push({
    id: "...",
    name: "...",
    description: "...",
    rules: "...",
    config: { ... },
    url: "..."
  });

  That’s what the menu will read.
*/
