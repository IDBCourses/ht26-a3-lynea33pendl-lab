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
const note = "C"; // the note played when the pointer goes down
const melody1 = ["E4", "G4", "A#4"]; //array
const numberofPoints = 8; // we want to divide the circle to 8 points
//saves infomration that could change later
let previousPoint = null;
let steps = 0; // counting the steps in one direction
let direction = 0; // zero means no direction detected yet
let octave = 3;
let previousX = null; // only X cause we move only on x scale with pointer
let melodyStarted = false; //melody only starts once when you move pointer in the left corner
let shape2; //is changing size
let isPlaying = false; //is pointermover changing the reverb
// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth); // can play several notes at once
const reverb = new Tone.Freeverb().toDestination(); //first destination is the reverb so syth- reverb - speaker
reverb.wet.value = 0.1; //level of effect, how much effect you want
synth.connect(reverb);
// ---------- Update ----------

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something
  synth.triggerAttack(note + octave); //plays note until you release pointer
  isPlaying = true;
  console.log("Pointer down at", event.clientX, event.clientY);
  console.log(note + octave);
  // synth.triggerAttackRelease("C" + octave, "8n");
} // play the note for an eighth note

function pointerEnter() {
  //plays C note, when pointer enters the shape
  synth.triggerAttackRelease("E" + octave, "8n");
}

function pointerLeave() {
  //plays G Note when pointer leaves the shape
  synth.triggerAttackRelease("G" + octave, "8n");
}
function pointerUp() {
  synth.releaseAll();
  isPlaying = false; //tells  cahnge reverb, no note is being played so it stops
}

function changeReverb(event) {
  if (!isPlaying) {
    previousX = event.clientX;
    return;
  }
  if (previousX !== null) {
    // need to calculate the movement, starting from one position, position cannot be null
    const movement = event.clientX - previousX; //how much did pointer move event.clientX is the current position of the pointer

    reverb.wet.value = Math.max(
      0.1,
      Math.min(reverb.wet.value + movement * 0.002, 0.8),
    );
  }

  previousX = event.clientX; // der neue Punkt ist jetzt previous Punkt für die nächste Bewegung, always needs tu update position of the pointer
  const size = 50 + (reverb.wet.value - 0.1) * 700; //100 px /0.4
  shape2.setSize(size);
}

function pointerMove(event) {
  changeReverb(event);
  //
  if (
    event.clientX < window.innerWidth * 0.2 && // left corner for meldoy
    event.clientY > window.innerHeight * 0.8 &&
    !melodyStarted //melody has not been started yet
  ) {
    playmelody1(); // wird einmal abgespielt
    melodyStarted = true; //() Klammern prüfen ob es gestartet werden soll, {} was gestartet werden soll
  }
  if (
    event.clientX >= window.innerWidth * 0.2 || //if pointer leaves the left corner, melody is not playing
    event.clientY <= window.innerHeight * 0.8
  ) {
    melodyStarted = false; //not playing outside of left corner
  }

  //
  const centerX = window.innerWidth / 2 + 50; //+50px cause the circle is not in the center, the position start at the left corner and +50 brings it to the center
  const centerY = window.innerHeight / 2 + 50; // divided by 2 to find the center
  const distanceX = event.clientX - centerX; //distance of the pointer to the center left, right
  const distanceY = event.clientY - centerY; //up and down
  const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2); //Pythagoras, calculates the distance, die Lange Seite c

  const angle = Math.atan2(distanceY, distanceX); //makes an angle using the x and y position, could you use distance y and x the const?

  const point =
    Math.floor(
      ((angle + 2 * Math.PI) % (2 * Math.PI)) / //2*pi is one full rotation, 360°, +angle cause we want a positive angle, %: want to know where we are in the circle
        ((2 * Math.PI) / numberofPoints), //divide angle to 8 different points
    ) + 1; // to get numbers from 1-8, not from 0-7
  if (distance < 50 || distance > 150) {
    // only when pointer is in the distance of 50-150 of the circle
    return;
  }
  if (point !== previousPoint) {
    //Position of pointer changed, is the pointer in a new block
    if (previousPoint !== null) {
      const difference = point - previousPoint; //checks, if you go forward or backwards
      let newDirection = 0;

      if (difference === 1 || (previousPoint === 8 && point === 1)) {
        //difference is one, like 3-4 or it is the special case of 8-1
        newDirection = 1;
      } else if (difference === -1 || (previousPoint === 1 && point === 8)) {
        //difference -1, going backwards
        //knows when you do a step back or forward
        newDirection = -1;
      }
      if (newDirection === 0) {
        //no direction detected, no steps
        steps = 0;
      } else {
        if (newDirection !== direction) {
          // detects when you change direction and starts counting steps again, first step in new direction already counts
          steps = 1;
        } else {
          //when you dont change direction, each step will be added
          steps++; //adds 1 step
        }
        direction = newDirection; //current direction
        if (steps === 8) {
          //when you have 8 steps
          octave += direction; //forward, direction is +1, octave is 1 higher, and backwards octave is -1 so 1 lower
          steps = 0; //starts at 0 again, sets back for a new round
          console.log(octave);
        }
      }
    }

    previousPoint = point; // updates position of pointer
  }
}
//console.log(angle, point);
// console.log(distance);
//);
function playmelody1() {
  isPlaying = true;
  let now = Tone.now();
  for (let i = 0; i < melody1.length; i++) {
    synth.triggerAttackRelease(
      melody1[i].replace("4", octave), //replaces 4 octave to the octave decided by the circle, can match the circle movement
      "16n",
      now + i * 0.4,
    );
  }
}
// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  // Example: a shape near the middle of the window. Replace it with your own. what does that mean?
  const shape = createShape("shape");
  shape.setPosition(0.5, 0.5);

  shape2 = createShape("shape"); // no const, cause we need to change the size of circle
  shape2.setPosition(0.8, 0.2);
  shape2.setColour(200, 50, 50, 1);

  const shape3 = createShape("shape"); // green, same spot as melody
  shape3.setPosition(0, 0.8);
  shape3.setColour(100, 50, 50, 1);
  shape3.setSize(window.innerWidth * 0.2, window.innerHeight * 0.2);
  shape3.setRoundedness(0);

  // Put your event listener code here
  window.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove); //Browser is registering if pointer is moving, use/call the pointermove function
  shape.element.addEventListener("pointerenter", pointerEnter);
  shape.element.addEventListener("pointerleave", pointerLeave);
  window.addEventListener("pointerup", pointerUp); // connects all the pointer events witht the function
}

setup(); // Always remember to call setup()!
