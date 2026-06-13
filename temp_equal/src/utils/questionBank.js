// ──────────────────────────────────────────────────
// Question Bank — Equal Groups (100 Questions, 10 Types)
// Singapore MOE Primary 1 Aligned
// ──────────────────────────────────────────────────

const sgNames = ['Wei Ming','Priya','Raju','Ahmad','Mia','Jun','Siti','Ryan','Xiao Ling','Aisha'];
const femaleNames = ['Priya','Mia','Siti','Xiao Ling','Aisha'];
const objects = ['cupcakes','balloons','stickers','marbles','apples','cookies','mangoes','erasers','books','sweets'];
const containers = ['plate','bag','box','basket','table','tray'];
const emojis = ['🍓','⭐','🍪','🐟','🎈','🍎','📚','🧁','🥭','✏️'];

export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pronoun(name) { return femaleNames.includes(name) ? 'She' : 'He'; }
function pronounLower(name) { return femaleNames.includes(name) ? 'she' : 'he'; }

export function generateDistractors(correct, min = 0, max = 40, count = 3) {
  const distractors = new Set();
  const offsets = [-3, -2, -1, 1, 2, 3];
  shuffleArray(offsets).forEach(offset => {
    const d = correct + offset;
    if (d >= min && d <= max && d !== correct && distractors.size < count) distractors.add(d);
  });
  while (distractors.size < count) {
    const d = correct + (distractors.size + 1);
    if (d <= max && d !== correct) distractors.add(d);
    else {
      const d2 = correct - (distractors.size + 1);
      if (d2 >= min && d2 !== correct) distractors.add(d2);
    }
  }
  return shuffleArray([correct, ...distractors]);
}

function genNums(diff) {
  let numGroups, groupSize;
  if (diff === 1) { numGroups = pick([2,3,4,5]); groupSize = pick([2,3,4,5]); while (numGroups * groupSize > 20) { groupSize = pick([2,3,4]); } }
  else if (diff === 2) { numGroups = pick([2,3,4,5,6]); groupSize = pick([2,3,4,5,6]); while (numGroups * groupSize > 30) { groupSize = pick([2,3,4,5]); } }
  else { numGroups = pick([2,3,4,5,6,7,8,9]); groupSize = pick([2,3,4,5,6,7,8,9]); while (numGroups * groupSize > 40) { groupSize = pick([2,3,4,5]); } }
  return { numGroups, groupSize, total: numGroups * groupSize };
}

// Q1: Count equal groups — find total
function genQ1(id, diff) {
  const { numGroups, groupSize, total } = genNums(diff);
  const emoji = pick(emojis);
  return {
    id, type: 'count_groups', difficulty: diff, world: 0,
    numGroups, groupSize, total, missingSlot: 'total',
    questionText: `There are ${numGroups} groups. Each group has ${groupSize} ${emoji}. How many ${emoji} altogether?`,
    visual: 'groupDiagram', objectEmoji: emoji,
    hint1: `Count the ${emoji} in each group: ${groupSize}. Now count all ${numGroups} groups.`,
    hint2: `Say it with me: ${Array(numGroups).fill(groupSize).join(', ')}. Count them all up!`,
    explanation: `${numGroups} groups of ${groupSize} equals ${total}. We can count: ${Array.from({length:numGroups},(_, i)=>groupSize*(i+1)).join(', ')}!`,
    options: generateDistractors(total),
    correctAnswer: total,
  };
}

// Q2: Equal group picture — tap correct arrangement
function genQ2(id, diff) {
  const { numGroups, groupSize, total } = genNums(diff);
  const emoji = pick(emojis);
  const correctLabel = `${numGroups} groups of ${groupSize}`;
  const wrongOptions = [
    `${numGroups + 1} groups of ${groupSize}`,
    `${numGroups} groups of ${groupSize + 1}`,
    `${groupSize} groups of ${numGroups !== groupSize ? numGroups : numGroups + 2}`,
  ];
  return {
    id, type: 'picture_group', difficulty: diff, world: 0,
    numGroups, groupSize, total, missingSlot: 'total',
    questionText: `Which shows ${numGroups} groups of ${groupSize}?`,
    visual: 'picture', objectEmoji: emoji,
    hint1: `Look for exactly ${numGroups} circles with ${groupSize} items each.`,
    hint2: `Count the groups first, then count the items inside each group.`,
    explanation: `${numGroups} groups of ${groupSize} means ${numGroups} circles each with ${groupSize} ${emoji}.`,
    options: shuffleArray([correctLabel, ...wrongOptions.slice(0, 3)]),
    correctAnswer: correctLabel,
  };
}

// Q3: Fill blank — find total
function genQ3(id, diff) {
  const { numGroups, groupSize, total } = genNums(diff);
  return {
    id, type: 'fill_total', difficulty: diff, world: 0,
    numGroups, groupSize, total, missingSlot: 'total',
    questionText: `${numGroups} groups of ${groupSize} = ___`,
    visual: 'sentence', objectEmoji: pick(emojis),
    hint1: `Add ${groupSize} together ${numGroups} times.`,
    hint2: `${Array(numGroups).fill(groupSize).join(' + ')} = ?`,
    explanation: `${numGroups} groups of ${groupSize} = ${total}.`,
    options: generateDistractors(total),
    correctAnswer: total,
  };
}

// Q4: Fill blank — find group size
function genQ4(id, diff) {
  const { numGroups, groupSize, total } = genNums(diff);
  return {
    id, type: 'fill_group_size', difficulty: diff, world: 0,
    numGroups, groupSize, total, missingSlot: 'groupSize',
    questionText: `${numGroups} groups of ___ = ${total}`,
    visual: 'sentence', objectEmoji: pick(emojis),
    hint1: `Share ${total} equally into ${numGroups} groups.`,
    hint2: `If ${numGroups} groups make ${total}, how many in each group?`,
    explanation: `${total} shared into ${numGroups} groups gives ${groupSize} in each group.`,
    options: generateDistractors(groupSize),
    correctAnswer: groupSize,
  };
}

// Q5: Fill blank — find number of groups
function genQ5(id, diff) {
  const { numGroups, groupSize, total } = genNums(diff);
  return {
    id, type: 'fill_num_groups', difficulty: diff, world: 0,
    numGroups, groupSize, total, missingSlot: 'numGroups',
    questionText: `___ groups of ${groupSize} = ${total}`,
    visual: 'sentence', objectEmoji: pick(emojis),
    hint1: `How many times does ${groupSize} fit into ${total}?`,
    hint2: `Count by ${groupSize}s until you reach ${total}.`,
    explanation: `${total} divided into groups of ${groupSize} gives ${numGroups} groups.`,
    options: generateDistractors(numGroups),
    correctAnswer: numGroups,
  };
}

// Q6: Singapore word problem (multiplication sense)
function genQ6(id, diff) {
  const { numGroups, groupSize, total } = genNums(diff);
  const name = pick(sgNames);
  const obj = pick(objects);
  const container = pick(containers);
  const emoji = pick(emojis);
  return {
    id, type: 'word_problem_mult', difficulty: diff, world: 0,
    numGroups, groupSize, total, missingSlot: 'total',
    questionText: `${name} puts ${groupSize} ${obj} on each ${container}. ${pronoun(name)} has ${numGroups} ${container}s. How many ${obj} altogether?`,
    visual: 'groupDiagram', objectEmoji: emoji,
    characterName: name, containerName: container, objectName: obj,
    hint1: `Draw ${numGroups} circles. Put ${groupSize} ${obj} in each one.`,
    hint2: `${Array(numGroups).fill(groupSize).join(' + ')} = ?`,
    explanation: `${numGroups} groups of ${groupSize} is ${total}. ${name} has ${total} ${obj} altogether.`,
    options: generateDistractors(total),
    correctAnswer: total,
  };
}

// Q7: Singapore word problem (fair sharing / division sense)
function genQ7(id, diff) {
  const { numGroups, groupSize, total } = genNums(diff);
  const name = pick(sgNames);
  const obj = pick(objects);
  const container = pick(containers);
  const emoji = pick(emojis);
  return {
    id, type: 'word_problem_div', difficulty: diff, world: 0,
    numGroups, groupSize, total, missingSlot: 'groupSize',
    questionText: `${name} has ${total} ${obj}. ${pronoun(name)} shares them equally into ${numGroups} ${container}s. How many ${obj} does each ${container} get?`,
    visual: 'groupDiagram', objectEmoji: emoji,
    characterName: name, containerName: container, objectName: obj,
    hint1: `Draw ${numGroups} ${container}s. Share ${total} ${obj} equally.`,
    hint2: `${total} shared into ${numGroups} equal groups. Count: ${groupSize} in each!`,
    explanation: `${total} shared equally into ${numGroups} groups gives ${groupSize} in each group.`,
    options: generateDistractors(groupSize),
    correctAnswer: groupSize,
  };
}

// Q8: True or False — is this equal?
function genQ8(id, diff) {
  const { numGroups, groupSize, total } = genNums(diff);
  const isTrue = Math.random() > 0.5;
  const shownTotal = isTrue ? total : total + pick([-2, -1, 1, 2]);
  return {
    id, type: 'true_false_group', difficulty: diff, world: 0,
    numGroups, groupSize, total, missingSlot: 'none', isTrue,
    questionText: `"${numGroups} groups of ${groupSize} = ${shownTotal}" — True or False?`,
    visual: 'sentence', objectEmoji: pick(emojis),
    hint1: `Check the math: what is ${numGroups} groups of ${groupSize}?`,
    hint2: `Count: ${Array(numGroups).fill(groupSize).join(' + ')} = ?`,
    explanation: `${numGroups} groups of ${groupSize} is ${total}. So the statement is ${isTrue ? 'True' : 'False'}.`,
    options: ['True', 'False'],
    correctAnswer: isTrue ? 'True' : 'False',
  };
}

// Q9: Spot the equal group arrangement (pictorial MCQ)
function genQ9(id, diff) {
  const { numGroups, groupSize, total } = genNums(diff);
  const emoji = pick(emojis);
  const correctLabel = `All groups have ${groupSize}`;
  const wrong1 = `Groups have ${groupSize} and ${groupSize + 1}`;
  const wrong2 = `Groups have ${groupSize - 1} and ${groupSize}`;
  const wrong3 = `Groups have different amounts`;
  return {
    id, type: 'spot_group_mcq', difficulty: diff, world: 0,
    numGroups, groupSize, total, missingSlot: 'none',
    questionText: `Which picture shows equal groups?`,
    visual: 'picture', objectEmoji: emoji,
    hint1: `Equal groups means every group has the same number.`,
    hint2: `Count each group carefully. Which has the same in every group?`,
    explanation: `Equal groups means all groups have the same number: ${groupSize} each.`,
    options: shuffleArray([correctLabel, wrong1, wrong2, wrong3]),
    correctAnswer: correctLabel,
  };
}

// Q10: Repeated addition link
function genQ10(id, diff) {
  const { numGroups, groupSize, total } = genNums(diff);
  const repeatedAdd = Array(numGroups).fill(groupSize).join(' + ');
  return {
    id, type: 'repeated_addition', difficulty: diff, world: 0,
    numGroups, groupSize, total, missingSlot: 'numGroups',
    questionText: `${repeatedAdd} = ___ groups of ${groupSize}`,
    visual: 'sentence', objectEmoji: pick(emojis),
    hint1: `Count how many times you see the number ${groupSize}.`,
    hint2: `${groupSize} appears ${numGroups} times! That means there are ${numGroups} groups of ${groupSize}.`,
    explanation: `${repeatedAdd} has ${numGroups} ${groupSize}s. So it is ${numGroups} groups of ${groupSize}.`,
    options: generateDistractors(numGroups),
    correctAnswer: numGroups,
  };
}

const generators = [genQ1, genQ2, genQ3, genQ4, genQ5, genQ6, genQ7, genQ8, genQ9, genQ10];

// PRD difficulty distribution per type
const diffDist = {
  q1:  [1,1,1,1,1,2,2,2,3,3],
  q2:  [1,1,1,1,1,2,2,2,3,3],
  q3:  [1,1,1,1,2,2,2,2,3,3],
  q4:  [1,1,1,2,2,2,2,3,3,3],
  q5:  [1,1,1,2,2,2,2,3,3,3],
  q6:  [1,1,1,2,2,2,2,3,3,3],
  q7:  [1,1,1,2,2,2,2,3,3,3],
  q8:  [1,1,1,1,1,2,2,2,3,3],
  q9:  [1,1,1,1,2,2,2,2,3,3],
  q10: [1,1,1,2,2,2,2,3,3,3],
};

export function generateSessionQuestions() {
  const bank = [];
  let qid = 1;
  const qKeys = ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'];

  generators.forEach((gen, gi) => {
    const diffs = diffDist[qKeys[gi]];
    diffs.forEach(diff => {
      bank.push(gen(`Q${gi + 1}_${String(qid).padStart(3, '0')}`, diff));
      qid++;
    });
  });

  const selected = shuffleArray(bank);
  selected.forEach((q, index) => {
    q.world = Math.floor(index / 10);
  });

  return selected;
}

export { sgNames };
