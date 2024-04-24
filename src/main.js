import { dialogueText, scaleFactor } from "./constants";
import { k } from "./kaboomContext";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./map.png");

k.setBackground(k.Color.fromHex("#3498db"));

k.scene("main", async () => {
  displayDialogue(dialogueText.intro, () => {});
  
  // write logic for the game here
  const mapData = await (await fetch("./map.json")).json();

  const layers = mapData.layers;

  // console.log(layers)

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 1), 8, 8), // the hitbox is 3 pixels from the player's x position
    }),
    k.body(), // response to physics
    k.anchor("center"),
    k.pos(), // position of the player
    k.scale(scaleFactor),
    {
      speed: 300,
      direction: "down",
      isInDialogue: false,
    },
    "player", // a tag to identify the player for collision detection etc.
  ]);

  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }), // make the boundary static so it doesn't move. That's how you do walls in Kaboom.js
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        // add collision event for the player and other objects in game
        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;

            displayDialogue(
              dialogueText[boundary.name],
              () => (player.isInDialogue = false)
            );
          });
        }
      }
      continue; // skip the rest of the loop
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );

          k.add(player);
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.worldPos().x, player.worldPos().y - 100); // make the camera follow the player
  });

  k.onMouseDown((mouseBtn) => {
    if (player.isInDialogue || mouseBtn !== "left") return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    // angle bounds for the up and down animations
    const lowerBound = 60;
    const upperBound = 120;

    // go up animation
    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    // go down animation
    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    // go side animation
    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "side";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "side";
      return;
    }
  });

  function stopAnimation() {
    player.play(`idle-${player.direction}`);
  }

  k.onMouseRelease(() => {
    stopAnimation();
    return;
  });

  k.onKeyRelease(() => {
    stopAnimation();
    return;
  });

  k.onKeyDown((key) => {
    const keyMap = [
      k.isKeyDown("up"),
      k.isKeyDown("right"),
      k.isKeyDown("down"),
      k.isKeyDown("left"),
    ];

    if (player.isInDialogue) return;

    // when user presses more than 1 key, stop the animation
    if (keyMap.filter((key) => key).length > 1) {
      stopAnimation();
      return;
    }

    if (keyMap[0]) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);

      return;
    }

    if (keyMap[1]) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "side";
      player.move(player.speed, 0);

      return;
    }

    if (keyMap[2]) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);

      return;
    }

    if (keyMap[3]) {
      player.flipX = true;

      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "side";
      player.move(-player.speed, 0);

      return;
    }
  });
});

k.go("main");
