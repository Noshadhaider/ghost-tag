# GHOST TAG
Multiplayer hide-and-seek (Node.js + Socket.IO + Phaser 3). 2-8 players, mobile-first.

## Run
    npm install
    npm start        # http://localhost:3000   (phone: http://<PC-IP>:3000)

## Deploy (Render / Railway / any Node host)
Build: `npm install`  Start: `npm start`  (PORT env is respected).

## Maps (lobby: host picks; menu: pick for practice / create)
- **Haunted House** 2700x1800 indoor, 9 rooms  - **Abandoned School** 2800x1700 corridor + lockers
- **Dark Woods** 2880x1980 outdoor  - **Graveyard** 2600x1800 grave maze + crypts
Add a map in `public/map.js` (see `wood()` / HOUSE / SCHOOL) and register it in `MAPS`; `node test/maps.js` checks spawns, hide spots and connectivity.

## Hiding & crouch
- Tall cover (wardrobe, locker, clock, tomb, tent, haystack, barrel, curtain) hides you while you stand in it.
- Low cover (bush, grass, log, plant, sheet, boxes) only hides you while **crouching**. Crouch = button / `C` (toggle), speed 70px/s, no running.
- A crouching human is invisible to ghosts beyond ~280px even in the open.

## Tasks & escape (humans)
- Every human gets **3 personal tasks** (`TASKS_PER` in `server.js`): glowing **cyan lights** spread over the map. Stand inside each one for **4 seconds** to complete it (a ghost hit resets the current task's progress). Tasks are done one after another.
- After **all** your tasks are done, the **green EXIT** doors (one on each side of the map) unlock. Reach one to **escape** - you are safe and out of the game.
- Humans win if **at least one** human escapes. Ghosts win if every human is caught, or if time runs out with nobody escaped.
- Maps are 1.6x bigger than before (outdoor maps get extra trees and bushes). Shared logic is in `public/map.js` (`SCALE`, `TASK_N`, `placeExtras`); server rules in `server.js` (`TASK_T`, `TASK_R`, `EXIT_R`).
- Task and exit markers are drawn in 3D mode only (`public/view3d.js`, `updMarkers`). The 2D mode does not show tasks yet, so escaping is only possible in 3D.

## Lives (3 hits)
- Humans have **3 lives** (hearts in the HUD). Each ghost touch = -1 life, knockback, 2.6 s safety time, and the ghost recoils for a moment.
- On a hit your screen shakes hard, flashes red and a ghost face jump-scares you (camera + CSS shake, scream sound, vibration). Last life = screen stays red & pulsing.
- The **3rd hit** turns you into a ghost.

## Graphics
`public/props3d.js` builds all furniture / hiding spots / trees / cart / cabin / graves as shaped, textured models (no plain boxes) with contact shadows,
grass tufts and glowing mushrooms outdoors, skirting + creepy portraits indoors. `PROPS.bake()` merges everything that shares a material into a few meshes (fast on phones).
Tests without a browser: `node test/props_dry.js` (THREE mock) and `node test/view_smoke.js` (View3D on all 4 maps).

## Structure
- `server.js`      authoritative server: rooms, movement, tagging, whistle, grenades, bots
- `public/map.js`  shared maps + collision (add a map = add an object + register in MAPS)
- `public/art.js`  all graphics drawn in code (maps, characters, effects)
- `public/props3d.js` detailed 3D props + world baking
- `public/index.html` + `client3d.js` + `view3d.js`  3D first-person mode (three.js r128, default)
- `public/2d.html` + `client.js`  2D top-down mode (Phaser) - fallback if 3D is slow
- `test/sim.js`    headless server test: `node test/sim.js`

## Credits
- Ghost model `public/models/ghost.glb` - "Creepy monster" by neluratatouille (https://sketchfab.com/neluratatouille), CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/). Source: https://sketchfab.com/3d-models/creepy-monster-9168e0d83a6c4cc1bfbb67a80e82eeca
  If the model is missing, the game falls back to the built-in code-drawn ghost.
