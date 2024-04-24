import kaboom from "kaboom";

export const k = kaboom({
  global: false, // import all kaboom functions to global namespace
  touchToMouse: true,
  canvas: document.getElementById("game"),
  debug: true // false for production
})