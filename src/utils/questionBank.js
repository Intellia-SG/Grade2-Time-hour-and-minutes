// ──────────────────────────────────────────────────
// Question Bank — Telling Time: Hours & Minutes
// Grade 2 Singapore Math & Common Core Aligned
// 100 Questions across 10 distinct Worlds
// ──────────────────────────────────────────────────

export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Formats a time object { hour, minute } into digital string "HH:MM"
export function formatDigital(h, m) {
  const padH = String(h);
  const padM = String(m).padStart(2, '0');
  return `${padH}:${padM}`;
}

export function formatSpeechTime(h, m) {
  if (m === 0) return `${h} o'clock`;
  if (m === 30) return `half past ${h}`;
  if (m === 15) return `quarter past ${h}`;
  if (m === 45) return `quarter to ${h === 12 ? 1 : h + 1}`;
  return `${m} minutes past ${h}`;
}

// Generate time distractors for matching
export function generateTimeDistractors(correctHour, correctMinute, count = 3) {
  const distractors = new Set();
  const times = [
    { h: correctHour, m: (correctMinute + 30) % 60 },
    { h: correctHour === 12 ? 1 : correctHour + 1, m: correctMinute },
    { h: correctHour === 1 ? 12 : correctHour - 1, m: correctMinute },
    { h: correctHour, m: (correctMinute + 15) % 60 },
    { h: correctHour, m: (correctMinute + 45) % 60 },
    { h: correctHour === 12 ? 11 : correctHour === 11 ? 12 : (correctHour + 2) % 12 || 12, m: correctMinute }
  ];

  shuffleArray(times).forEach(t => {
    const str = formatDigital(t.h, t.m);
    const correctStr = formatDigital(correctHour, correctMinute);
    if (str !== correctStr && distractors.size < count) {
      distractors.add(str);
    }
  });

  while (distractors.size < count) {
    const h = Math.floor(Math.random() * 12) + 1;
    const m = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
    const str = formatDigital(h, m);
    const correctStr = formatDigital(correctHour, correctMinute);
    if (str !== correctStr) distractors.add(str);
  }

  const correctStr = formatDigital(correctHour, correctMinute);
  return shuffleArray([correctStr, ...distractors]);
}

// Generate verbal expression distractors (e.g. "half past 4")
export function generateVerbalDistractors(h, m, count = 3) {
  const correct = formatSpeechTime(h, m);
  const distractors = new Set();
  
  const alternatives = [
    formatSpeechTime(h === 12 ? 1 : h + 1, m),
    formatSpeechTime(h === 1 ? 12 : h - 1, m),
    formatSpeechTime(h, (m + 30) % 60),
    formatSpeechTime(h, m === 0 ? 30 : 0)
  ];

  shuffleArray(alternatives).forEach(alt => {
    if (alt !== correct && distractors.size < count) distractors.add(alt);
  });

  while (distractors.size < count) {
    const rh = Math.floor(Math.random() * 12) + 1;
    const rm = pick([0, 15, 30, 45]);
    const alt = formatSpeechTime(rh, rm);
    if (alt !== correct) distractors.add(alt);
  }

  return shuffleArray([correct, ...distractors]);
}

// ═══════════════════════════════════════════════════
// GENERATORS FOR THE 10 WORLDS
// ═══════════════════════════════════════════════════

// World 0: Hour Castle (O'clock times)
function genWorld0(id, idx) {
  const hour = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const isDigital = idx % 2 === 0;

  if (isDigital) {
    const correct = formatDigital(hour, 0);
    return {
      id, world: 0, difficulty: 1, type: 'match_time',
      clockTime: { hour, minute: 0 },
      questionText: `What time does this analog clock show?`,
      visual: 'clock',
      hint1: `The short blue hand points directly to the hour.`,
      hint2: `The long red hand is pointing at 12. That means it is an o'clock time.`,
      explanation: `Since the short hand points to ${hour} and the long hand points to 12, the time is exactly ${hour} o'clock, written as ${correct}.`,
      options: generateTimeDistractors(hour, 0),
      correctAnswer: correct
    };
  } else {
    const correct = formatSpeechTime(hour, 0);
    return {
      id, world: 0, difficulty: 1, type: 'verbal_match',
      clockTime: { hour, minute: 0 },
      questionText: `Choose the correct words for this clock's time.`,
      visual: 'clock',
      hint1: `Where is the short hand pointing? It is pointing at the hour.`,
      hint2: `When the minute hand points to 12, it is always called 'o'clock'.`,
      explanation: `The clock shows ${hour} o'clock because the hour hand is at ${hour} and the minute hand is at 12.`,
      options: generateVerbalDistractors(hour, 0),
      correctAnswer: correct
    };
  }
}

// World 1: Half-Past Meadow (Half-past times)
function genWorld1(id, idx) {
  const hour = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const isTextQuestion = idx % 2 === 0;

  if (isTextQuestion) {
    const correct = formatDigital(hour, 30);
    return {
      id, world: 1, difficulty: 1, type: 'match_time',
      clockTime: { hour, minute: 30 },
      questionText: `Look at the clock hands. What digital time does it show?`,
      visual: 'clock',
      hint1: `The hour hand is halfway between ${hour} and ${hour === 12 ? 1 : hour + 1}.`,
      hint2: `The long minute hand points straight down at 6, which stands for 30 minutes.`,
      explanation: `When the minute hand points to 6, it is half past. Thirty minutes have passed, so the time is ${correct}.`,
      options: generateTimeDistractors(hour, 30),
      correctAnswer: correct
    };
  } else {
    const correct = formatSpeechTime(hour, 30);
    return {
      id, world: 1, difficulty: 1, type: 'verbal_match',
      clockTime: { hour, minute: 30 },
      questionText: `Which words describe this clock's time?`,
      visual: 'clock',
      hint1: `Look at the minute hand pointing to 6. This is called 'half past'.`,
      hint2: `The hour hand has just passed ${hour}, heading towards the next number.`,
      explanation: `The clock shows half past ${hour} because the hour hand is between ${hour} and the next hour, and the minute hand is at 6.`,
      options: generateVerbalDistractors(hour, 30),
      correctAnswer: correct
    };
  }
}

// World 2: Quarter Forest (Quarter past & Quarter to)
function genWorld2(id, idx) {
  const hour = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const minute = pick([15, 45]);
  const isDigital = idx % 2 === 0;

  const correct = isDigital ? formatDigital(hour, minute) : formatSpeechTime(hour, minute);
  return {
    id, world: 2, difficulty: 2, type: isDigital ? 'match_time' : 'verbal_match',
    clockTime: { hour, minute },
    questionText: isDigital ? `What is the digital time shown here?` : `Choose the verbal expression for this clock.`,
    visual: 'clock',
    hint1: minute === 15 ? `The long minute hand is pointing at 3, which is 15 minutes.` : `The long minute hand is pointing at 9, which is 45 minutes (or quarter to the next hour).`,
    hint2: minute === 15 ? `This is 'quarter past' the hour.` : `This is 'quarter to' the next hour.`,
    explanation: minute === 15 
      ? `The minute hand is at 3 (15 minutes), so it is quarter past ${hour}. Written digitally: ${formatDigital(hour, 15)}.`
      : `The minute hand is at 9 (45 minutes), so it is quarter to ${hour === 12 ? 1 : hour + 1} (or 45 minutes past ${hour}). Written digitally: ${formatDigital(hour, 45)}.`,
    options: isDigital ? generateTimeDistractors(hour, minute) : generateVerbalDistractors(hour, minute),
    correctAnswer: correct
  };
}

// World 3: Minute Maze (Counting minutes by 5s)
function genWorld3(id, idx) {
  const hour = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const minute = pick([5, 10, 20, 25, 35, 40, 50, 55]);
  const correct = formatDigital(hour, minute);

  return {
    id, world: 3, difficulty: 2, type: 'match_time',
    clockTime: { hour, minute },
    questionText: `Count by 5s from the top of the clock. What is the time?`,
    visual: 'clock',
    hint1: `Each number on the clock face represents 5 minutes. 1 is 5 mins, 2 is 10 mins...`,
    hint2: `Multiply the number the minute hand is pointing to by 5.`,
    explanation: `The hour hand is past ${hour}, and the minute hand points to ${minute / 5}. Counting: ${Array.from({length: minute/5}, (_, i) => (i+1)*5).join(', ')} minutes. So the time is ${correct}.`,
    options: generateTimeDistractors(hour, minute),
    correctAnswer: correct
  };
}

// World 4: Digital Dunes (Digital reading and matching)
function genWorld4(id, idx) {
  const hour = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const minute = pick([0, 15, 30, 45]);
  const digitalStr = formatDigital(hour, minute);
  const correctSpeech = formatSpeechTime(hour, minute);

  return {
    id, world: 4, difficulty: 2, type: 'text_mcq',
    questionText: `If a digital watch says "${digitalStr}", how do we say this time?`,
    visual: 'none',
    hint1: `Look at the minutes: ${minute === 0 ? "00 means o'clock" : minute === 15 ? "15 means quarter past" : minute === 30 ? "30 means half past" : "45 means quarter to the next hour"}.`,
    hint2: `Translate the hours and minutes directly.`,
    explanation: `Digital ${digitalStr} represents ${hour} hours and ${minute} minutes. That is expressed as ${correctSpeech}.`,
    options: generateVerbalDistractors(hour, minute),
    correctAnswer: correctSpeech
  };
}

// World 5: AM/PM Skyway (Morning, Afternoon, Night)
function genWorld5(id, idx) {
  const scenarios = [
    { q: "Wei Ming eats breakfast at 7:30 ___.", a: "a.m.", exp: "Breakfast is eaten in the morning, which is a.m." },
    { q: "Wei Ming plays soccer after school at 4:15 ___.", a: "p.m.", exp: "Afternoon activities happen in the p.m. hours." },
    { q: "Wei Ming goes to sleep at night at 9:00 ___.", a: "p.m.", exp: "Nighttime before midnight is p.m." },
    { q: "Wei Ming watches the sunrise at 6:00 ___.", a: "a.m.", exp: "Sunrise happens early in the morning, which is a.m." },
    { q: "The sun is high in the sky at 12:00 noon. This is 12:00 ___.", a: "p.m.", exp: "Noon is exactly 12:00 p.m. Midnight is 12:00 a.m." },
    { q: "Wei Ming wakes up for school at 6:45 ___.", a: "a.m.", exp: "Waking up for school in the morning is in the a.m." },
    { q: "Wei Ming eats dinner at 7:00 ___.", a: "p.m.", exp: "Dinner is in the evening, which is p.m." }
  ];

  const sc = scenarios[idx % scenarios.length];
  return {
    id, world: 5, difficulty: 2, type: 'am_pm',
    questionText: `Fill in the blank: ${sc.q}`,
    visual: 'none',
    hint1: `a.m. is from midnight to noon (morning).`,
    hint2: `p.m. is from noon to midnight (afternoon and evening).`,
    explanation: sc.exp,
    options: ['a.m.', 'p.m.'],
    correctAnswer: sc.a
  };
}

// World 6: Time Flow (Elapsed time)
function genWorld6(id, idx) {
  const startHour = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const isLater = idx % 2 === 0;

  if (isLater) {
    const offset = pick([1, 2]);
    const correct = formatDigital(startHour + offset, 0);
    return {
      id, world: 6, difficulty: 3, type: 'match_time',
      clockTime: { hour: startHour, minute: 0 },
      questionText: `The clock shows ${startHour}:00. What time will it be ${offset} hour${offset > 1 ? 's' : ''} later?`,
      visual: 'clock',
      hint1: `Move the hour hand forward by ${offset} numbers.`,
      hint2: `The minutes will stay at 00 because only the hour is changing.`,
      explanation: `${offset} hour${offset > 1 ? 's' : ''} after ${startHour}:00 is ${startHour + offset}:00.`,
      options: generateTimeDistractors(startHour + offset, 0),
      correctAnswer: correct
    };
  } else {
    const offset = 30; // 30 minutes
    const correct = formatDigital(startHour, 30);
    return {
      id, world: 6, difficulty: 3, type: 'match_time',
      clockTime: { hour: startHour, minute: 0 },
      questionText: `The clock shows ${startHour}:00. What time was it 30 minutes ago?`,
      visual: 'clock',
      hint1: `30 minutes ago means going backwards in time.`,
      hint2: `The hour hand will go back to the previous hour, pointing between ${startHour - 1 || 12} and ${startHour}.`,
      explanation: `30 minutes before ${startHour}:00 is half past the previous hour, which is ${startHour - 1 || 12}:30.`,
      options: generateTimeDistractors(startHour - 1 || 12, 30),
      correctAnswer: formatDigital(startHour - 1 || 12, 30)
    };
  }
}

// World 7: Clock Master (Word problems)
function genWorld7(id, idx) {
  const problems = [
    {
      q: "A movie starts at 2:00 p.m. and lasts for 2 hours. What time does the movie end?",
      a: "4:00 p.m.",
      opts: ["3:00 p.m.", "4:00 p.m.", "5:00 p.m.", "6:00 p.m."],
      exp: "Adding 2 hours to 2:00 p.m. gives 4:00 p.m."
    },
    {
      q: "Class starts at 8:30 a.m. Wei Ming arrives 15 minutes early. What time does he arrive?",
      a: "8:15 a.m.",
      opts: ["8:00 a.m.", "8:15 a.m.", "8:45 a.m.", "9:00 a.m."],
      exp: "Subtracting 15 minutes from 8:30 a.m. is 8:15 a.m."
    },
    {
      q: "Wei Ming's music lesson ends at 5:45 p.m. It is a 45-minute lesson. What time did it start?",
      a: "5:00 p.m.",
      opts: ["4:30 p.m.", "5:00 p.m.", "5:15 p.m.", "6:30 p.m."],
      exp: "45 minutes before 5:45 p.m. is exactly 5:00 p.m."
    },
    {
      q: "A train leaves at 11:30 a.m. and arrives at 1:30 p.m. How long was the trip?",
      a: "2 hours",
      opts: ["1 hour", "2 hours", "3 hours", "30 minutes"],
      exp: "From 11:30 a.m. to 12:30 p.m. is 1 hour, and to 1:30 p.m. is 2 hours."
    }
  ];

  const pr = problems[idx % problems.length];
  return {
    id, world: 7, difficulty: 3, type: 'text_mcq',
    questionText: pr.q,
    visual: 'none',
    hint1: `Read the start time and the duration carefully.`,
    hint2: `Count forward or backward step-by-step.`,
    explanation: pr.exp,
    options: shuffleArray(pr.opts),
    correctAnswer: pr.a
  };
}

// World 8: Tick Tock Challenge (Mixed difficult questions)
function genWorld8(id, idx) {
  // Generate random advanced times
  const hour = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  const minute = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  const correct = formatDigital(hour, minute);

  return {
    id, world: 8, difficulty: 3, type: 'match_time',
    clockTime: { hour, minute },
    questionText: `Identify this exact time on the clock face.`,
    visual: 'clock',
    hint1: `Check the minute hand: count by 5s to find the minutes.`,
    hint2: `Look at the hour hand: it has passed the hour number.`,
    explanation: `The hour is ${hour} and the minute hand points to ${minute / 5}, which is ${minute} minutes. The time is ${correct}.`,
    options: generateTimeDistractors(hour, minute),
    correctAnswer: correct
  };
}

// World 9: Chrono Palace (Final mixed challenge)
function genWorld9(id, idx) {
  // Let's mix am/pm, analog reading, and verbal descriptions
  const randType = idx % 3;
  if (randType === 0) {
    const hour = pick([6, 7, 8]);
    const isMorning = Math.random() > 0.5;
    const correct = isMorning ? "a.m." : "p.m.";
    const phrase = isMorning ? "waking up for sunrise" : "eating dinner at sunset";
    return {
      id, world: 9, difficulty: 3, type: 'am_pm',
      questionText: `A clock shows ${hour}:00. If you are ${phrase}, is it ${hour}:00 a.m. or p.m.?`,
      visual: 'none',
      hint1: `a.m. represents morning hours.`,
      hint2: `p.m. represents afternoon and night.`,
      explanation: `Since you are ${phrase}, this occurs in the ${isMorning ? 'morning' : 'evening'}, which is ${correct}.`,
      options: ['a.m.', 'p.m.'],
      correctAnswer: correct
    };
  } else if (randType === 1) {
    const hour = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const minute = pick([15, 45]);
    const correct = formatSpeechTime(hour, minute);
    return {
      id, world: 9, difficulty: 3, type: 'verbal_match',
      clockTime: { hour, minute },
      questionText: `What verbal time name corresponds to this clock?`,
      visual: 'clock',
      hint1: `A minute hand at 3 is quarter past. A minute hand at 9 is quarter to the next hour.`,
      hint2: `Watch the hour hand position relative to the numbers.`,
      explanation: `The clock shows ${correct}.`,
      options: generateVerbalDistractors(hour, minute),
      correctAnswer: correct
    };
  } else {
    const hour = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const minute = pick([10, 20, 40, 50]);
    const correct = formatDigital(hour, minute);
    return {
      id, world: 9, difficulty: 3, type: 'match_time',
      clockTime: { hour, minute },
      questionText: `Find the matching digital clock for this analog clock.`,
      visual: 'clock',
      hint1: `Calculate the minutes by multiplying the minute hand's number by 5.`,
      hint2: `The hour hand shows which hour we are in.`,
      explanation: `The hour hand is past ${hour} and the minute hand points to ${minute / 5} (${minute} minutes), so it is ${correct}.`,
      options: generateTimeDistractors(hour, minute),
      correctAnswer: correct
    };
  }
}

const worldGenerators = [
  genWorld0, genWorld1, genWorld2, genWorld3, genWorld4,
  genWorld5, genWorld6, genWorld7, genWorld8, genWorld9
];

export function generateSessionQuestions() {
  const bank = [];
  let qid = 1;

  // Generate 10 questions per world
  for (let w = 0; w < 10; w++) {
    const generator = worldGenerators[w];
    for (let q = 0; q < 10; q++) {
      const question = generator(`Q_${w}_${q}`, q);
      bank.push(question);
      qid++;
    }
  }

  return bank;
}
