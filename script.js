/*
 * IDB Programming: A3 — a musical instrument
 *
 * All of the code for your instrument goes in this file. It's split into sections:
 *   settings — the "fixed" parts of your program
 *   state    — the parts of your program that change over time
 *   sound    — the Tone.js instruments and effects
 *   update   — updates the state every 100ms, if necessary
 *   use      — uses the state to make sound and shapes every 100ms, if necessary
 *   controls — what happens when the player uses the pointer
 *   setup    — starts everything
 *
 * The pointer events change the state. update() and use() each run every
 * 100ms, in a loop:
 *   1. update: change the state, e.g. based on time or on the pointer's movement
 *   2. use:    make sound and move shapes, based on the state
 *
 * Shapes come from shape.js: createShape() makes one, and its methods
 * (setPosition, setSize, setColour ...) change it.
 *
 * Tone.js documentation: https://tonejs.github.io/docs/15.1.22/
 */

import { createShape } from "./shape.js";

// ---------- Settings ----------
// Settings variables should contain all of the "fixed" parts of your programs
// For example: which notes you can play, how fast things move, the tempo.
const note = "C4"; // the note played when the pointer goes down
const melody1 = ["C4", "E4", "G4"];
const numberofPoints = 8;
const points = ["1", "2", "3", "4", "5", "6", "7", "8"];

let previousPoint = null;
let currentPoint = 1;
let steps = 0; // counting the steps
//let diff = currentPoint - previousPoint;
let direction = 0; // zero means no direction detected yet
let octave = 3;

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  setTimeout(update, 100); // call update() again in 100 milliseconds
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something

  console.log("Pointer down at", event.clientX, event.clientY);
  console.log("C" + octave);
  synth.triggerAttackRelease("C" + octave, "8n"); // play the note for an eighth note
}
function startSound(event) {
  Tone.start(); // sound is allowed after a click
}

function pointerEnter(event) {
  synth.triggerAttackRelease("C" + octave, "8n");
  //shape.setColour(100, 80, 0.5); (error message)
}

function pointerLeave(event) {
  synth.triggerAttackRelease("G" + octave, "8n");
  // shape.setColour(200, 80, 0.3); (error message)
}

function fullRotation() {
  if (direction === 1) {
    direction = 1;
  } else if (direction === points.length - 1) {
    direction = -1;
  } else {
    direction = 0;
  }
  return direction;

  //diff % length(setup)
}

function pointerMove(event) {
  const centerX = window.innerWidth / 2 + 50; //+50 cause the circle is not in the center, the position start at the left corner and +50 brings it to the center
  const centerY = window.innerHeight / 2 + 50;
  const distanceX = event.clientX - centerX;
  const distanceY = event.clientY - centerY;
  const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

  const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);

  const point =
    Math.floor(
      ((angle + 2 * Math.PI) % (2 * Math.PI)) /
        ((2 * Math.PI) / numberofPoints),
    ) + 1;
  if (distance < 50 || distance > 150) {
    return;
  }
  if (point !== previousPoint) {
    if (previousPoint !== null) {
      const difference = point - previousPoint;
      let newDirection = 0;

      if (difference === 1 || (previousPoint === 8 && point === 1)) {
        newDirection = 1;
      } else if (difference === -1 || (previousPoint === 1 && point === 8)) {
        //knows when you do a step back or forward
        newDirection = -1;
      }
      if (newDirection === 0) {
        steps = 0;
      } else {
        if (newDirection !== direction) {
          steps = 1;
        } else {
          steps++; //adds 1 step
        }
        direction = newDirection;
        if (steps === 8) {
          octave += direction;
          steps = 0;
          console.log(octave);
        }
      }
    }

    previousPoint = point;
  }
}
//console.log(angle, point);
// console.log(distance);

//);
function playmelody1() {
  let now = Tone.now();
  for (let i = 0; i < melody1.length; i++) {
    synth.triggerAttackRelease(melody1[i], "8n", now + i * 0.4);
  }
}

// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update(); // start the update loop
  use(); // start the use loop

  // Example: a shape near the middle of the window. Replace it with your own.
  const shape = createShape("shape");
  shape.setPosition(0.5, 0.5);

  // Put your event listener code here
  window.addEventListener("pointerdown", startSound);
  window.addEventListener("pointermove", pointerMove);
  shape.element.addEventListener("pointerenter", pointerEnter);
  shape.element.addEventListener("pointerleave", pointerLeave);
}

setup(); // Always remember to call setup()!
