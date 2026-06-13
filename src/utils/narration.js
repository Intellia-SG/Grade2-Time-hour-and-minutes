import { say, ask, cheer, emphasize, think, celebrate, instruct, pause } from './audio';

// ─── INTRO SCREEN ────────────────────────────────
export function introNarration() {
  return [
    cheer("Welcome to Tick Tock Academy!"),
    say("Today, we are going to learn how to tell time using hours and minutes."),
    ask("Have you ever wondered how the hands on a clock move to show us the time?"),
    cheer("Let us start our journey to unlock the secrets of the clock!"),
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
  return [
    cheer("Fantastic! Let us discover how clocks help us plan our day!"),
  ];
}

// ─── STORY PHASE ─────────────────────────────────
export function getStoryNarration(slideIndex) {
  switch (slideIndex) {
    case 0:
      return [
        say("Meet Pip the Robot! Pip has a clock on his chest, but the hands are missing!"),
        say("Without the hands, Clocktown is frozen. Pip needs your help to restore the clock hands and start time again!"),
      ];
    case 1:
      return [
        say("Look at the short, blue hand. That is the hour hand!"),
        emphasize("The hour hand is short and chubby. It points directly to the hours: one, two, three, all the way to twelve!"),
      ];
    case 2:
      return [
        say("Now meet the tall, red hand. That is the minute hand!"),
        emphasize("The minute hand is tall and thin. It counts the minutes as they tick by. It moves faster than the hour hand!"),
      ];
    case 3:
      return [
        say("When the minute hand points straight up at twelve, it is an o'clock time. It shows a brand new hour!"),
        say("But when it points straight down at six, it is half past the hour! That means thirty minutes have passed."),
      ];
    case 4:
      return [
        say("We can also say quarter past when the minute hand points to three, which is fifteen minutes."),
        say("And when it points to nine, it is quarter to the next hour, which is forty-five minutes!"),
      ];
    case 5:
      return [
        cheer("You are ready to help Pip restore Clocktown!"),
        say("Let us start by simulating and building times ourselves. Here we go!"),
      ];
    default:
      return [];
  }
}

// ─── SIMULATE PHASE ──────────────────────────────
export function simulateStation1Intro() {
  return [
    instruct("Set the clock to the target time. Use the buttons to rotate the hour and minute hands!"),
  ];
}

export function simulateStation2Intro() {
  return [
    instruct("Look at the analog clock. Which digital clock shows the same time? Tap to select!"),
  ];
}

export function simulateStation3Intro() {
  return [
    ask("Look at the clock face. Type the digital time in the boxes using the number pad!"),
  ];
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
  if (streak >= 5) {
    return [cheer("Incredible streak! You are a time hero!")];
  }
  return [cheer("That is correct!")];
}

export function playWrongNarration() {
  return [say("Not quite. Let us try another one!")];
}

export function playWorldComplete(worldName, score, total) {
  return [
    celebrate(`${worldName} Completed!`),
    say(`You scored ${score} out of ${total} questions. Good job!`),
  ];
}

// ─── REFLECT PHASE ───────────────────────────────
export function reflectIntroNarration() {
  return [
    ask("Let us reflect on what we learned today! Help me answer these questions!"),
  ];
}

export function reflectCorrectNarration() {
  return [cheer("Excellent teaching!")];
}

export function reflectWrongNarration() {
  return [say("Ah, I see. Let us review that again!")];
}

export function reflectConfidenceNarration() {
  return [
    ask("How confident do you feel about telling time now?"),
  ];
}

export function reflectCertificateNarration(pct) {
  return [
    celebrate(`Congratulations! You completed the telling time challenge! You scored ${Math.round(pct)} percent.`),
  ];
}
