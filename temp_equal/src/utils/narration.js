// ──────────────────────────────────────────────────
// Narration Scripts — Equal Groups (Exact Screen Text Match)
// ──────────────────────────────────────────────────

import { say, ask, cheer, emphasize, think, celebrate, instruct, pause } from './audio';

// ─── INTRO SCREEN ────────────────────────────────
export function introNarration() {
  return [
    cheer("Welcome to Equal Groups!"),
    say("Today, we are going to learn about equal groups for multiplication and division."),
    ask("What happens when we put the same number of things into every group? Can we find how many there are altogether?"),
    cheer("Are you ready to explore equal groups and solve some fun challenges? Let us get started on our learning journey!"),
  ];
}

// ─── WONDER PHASE ────────────────────────────────
export function wonderNarration(questionText, subtext) {
  return [
    ask(questionText),
    say(subtext),
  ];
}

export function wonderDiscoverNarration() {
  return [];
}

// ─── STORY PHASE ─────────────────────────────────
export function getStoryNarration(slideIndex) {
  switch (slideIndex) {
    case 0:
      return [
        say("Mia has twelve strawberries. She wants to put the same number on every plate."),
        ask("Can she do it? How many strawberries will go on each plate?"),
        say("Let us find out what equal groups really means!"),
      ];
    case 1:
      return [
        say("Wei Ming visits the hawker centre with his family."),
        say("There are three tables. Each table has four bowls of noodles."),
        emphasize("Every table gets the same number of bowls. That is what we call equal groups!"),
      ];
    case 2:
      return [
        say("Three groups of four. Count with me: four, eight, twelve. Altogether equals twelve!"),
        emphasize("When every group has the same number, we call them equal groups."),
      ];
    case 3:
      return [
        say("Now Wei Ming's family shares ten apples equally into five bags."),
        emphasize("Each bag gets two apples. Fair sharing means equal groups!"),
      ];
    case 4:
      return [
        say("Equal groups help us multiply. Three groups of four means four plus four plus four."),
        emphasize("That is called repeated addition!"),
        say("And when we share equally, that is the start of division!"),
      ];
    case 5:
      return [
        cheer("Now you know what equal groups are!"),
        say("Let us practice making equal groups ourselves!"),
      ];
    default:
      return [];
  }
}

// ─── SIMULATE PHASE ──────────────────────────────
export function simulateStation1Intro() {
  return [
    instruct("Drag the objects into the circles. Put the same number in each group!"),
    ask("Make sure every group has the same number. Can you do it?"),
  ];
}

export function simulateStation2Intro() {
  return [
    instruct("Look at these arrangements. Which ones show equal groups? Tap to choose!"),
  ];
}

export function simulateStation3Intro() {
  return [
    ask("Now fill in the missing number. Use the number pad!"),
  ];
}

export function simulateAllComplete() {
  return [];
}

// ─── PLAY PHASE ──────────────────────────────────
export function playWorldIntro(worldName) {
  return [
    celebrate(`Welcome to ${worldName}!`),
  ];
}

export function playReadQuestion(questionText) {
  return [
    say(questionText),
  ];
}

export function playCorrectNarration(streak = 0) {
  return [];
}

export function playWrongNarration() {
  return [];
}

export function playWorldComplete(worldName, score, total) {
  return [
    say(`${worldName} Complete!`),
    say(`Score: ${score} out of ${total}`),
  ];
}

// ─── REFLECT PHASE ───────────────────────────────
export function reflectIntroNarration() {
  return [
    ask("What did you learn about equal groups?"),
  ];
}

export function reflectCorrectNarration() {
  return [];
}

export function reflectWrongNarration() {
  return [];
}

export function reflectConfidenceNarration() {
  return [
    ask("How confident do you feel about equal groups?"),
  ];
}

export function reflectCertificateNarration(pct) {
  return [
    say(`You scored ${Math.round(pct)}%`),
  ];
}
