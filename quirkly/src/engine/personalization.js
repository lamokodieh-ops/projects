/**
 * Explainable rules from quiz → UX flags and copy.
 * Not diagnostic; productivity-style preferences only.
 * @param {import('../types.js').QuizAnswers} q
 */
export function derivePersonalization(q) {
  const motivationLevel = clamp(q.motivationSlider ?? 5, 1, 10);
  const barriers = q.pastBarriers || [];
  const forgetHigh =
    barriers.includes('No clear plan') ||
    barriers.includes('Life got too busy') ||
    /forget|distract|remember/i.test(q.confidenceTopics || '');

  const forgetfulnessLevel = forgetHigh ? 'high' : q.overwhelm === 'Too many small tasks' ? 'medium' : 'low';

  const taskInitiationDifficulty =
    q.procrastinationReason === 'Fear of failure' || q.motivationSlider <= 4
      ? 'high'
      : q.motivationSlider <= 6
        ? 'medium'
        : 'low';

  const prefersSimpleView =
    forgetfulnessLevel === 'high' || taskInitiationDifficulty === 'high' || motivationLevel <= 5;

  const encouragementPreference =
    motivationLevel <= 4 ? 'supportive' : q.accountability === 'strict' ? 'direct' : 'minimal';

  const routinePreference = q.routineStyle || 'structure';

  const { type, blurb, focusStyle } = archetypeFromQuiz(q, motivationLevel, routinePreference);
  const { challenges, strengths } = challengesAndStrengths(q, {
    forgetfulnessLevel,
    taskInitiationDifficulty,
    motivationLevel,
    encouragementPreference,
  });

  return {
    motivationLevel,
    focusStyle,
    forgetfulnessLevel,
    routinePreference,
    taskInitiationDifficulty,
    prefersSimpleView,
    encouragementPreference,
    derivedProfileType: type,
    derivedProfileBlurb: blurb,
    derivedChallenges: challenges,
    derivedStrengths: strengths,
    focusScore: scoreFocus(q),
  };
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function scoreFocus(q) {
  let s = 55;
  const str = JSON.stringify(q);
  for (let i = 0; i < str.length; i++) s = (s + str.charCodeAt(i) * (i + 1)) % 37;
  const jitter = s % 28;
  let base = 58;
  if (q.energyPeak === 'morning') base += 6;
  if (q.routineStyle === 'structure') base += 5;
  if ((q.motivationSlider ?? 5) >= 7) base += 8;
  if (q.accountability === 'strict') base += 4;
  return clamp(base + jitter, 62, 91);
}

/**
 * @param {import('../types.js').QuizAnswers} q
 */
function archetypeFromQuiz(q, motivation, routine) {
  const areas = q.improvementAreas || [];
  if (routine === 'structure' && areas.includes('Studying')) {
    return {
      type: 'The Steady Planner',
      blurb:
        'You like visible progress and clear checkboxes. Structured check-ins and streak visibility keep you grounded.',
      focusStyle: 'analytical',
    };
  }
  if (areas.includes('Mental Wellness') || q.energyPeak === 'evening') {
    return {
      type: 'The Deep Diver',
      blurb:
        'You protect focus with systems—and feel the cost of context-switching. Shorter starter steps and one-habit mode help.',
      focusStyle: 'deep_work',
    };
  }
  if (motivation <= 5) {
    return {
      type: 'The Soft Starter',
      blurb:
        'Steady beats intense. Softer nudges, tinier first steps, and celebrating quiet consistency will feel kinder.',
      focusStyle: 'supportive',
    };
  }
  return {
    type: 'The Flexible Finder',
    blurb:
      'You balance flexibility with intention. Adaptive pacing—neither rigid nor vague—keeps habits aligned with real life.',
    focusStyle: 'balanced',
  };
}

function challengesAndStrengths(q, flags) {
  const challenges = [];
  const strengths = [];

  if (flags.taskInitiationDifficulty === 'high' || q.procrastinationReason === 'Fear of failure') {
    challenges.push('Getting started feels heavier than the task itself.');
  }
  if (q.procrastinationReason === 'Perfectionism') {
    challenges.push('Waiting for the “perfect” moment can delay tiny wins.');
  }
  if (q.procrastinationReason === 'Distraction' || flags.forgetfulnessLevel === 'high') {
    challenges.push('Distractions and forgotten cues can break your rhythm mid-day.');
  }
  if (q.overwhelm === 'Too many small tasks') {
    challenges.push('Lots of tiny tasks can crowd out the one that matters today.');
  }
  if (q.overwhelm === 'Big ambiguous projects') {
    challenges.push('Ambiguous projects stall without a clear first move.');
  }
  if (flags.motivationLevel <= 4) {
    challenges.push('Low-energy days need softer targets, not harder ones.');
  }
  if ((q.pastBarriers || []).includes('Set the bar too high')) {
    challenges.push('Ambitious bars can make consistency feel out of reach.');
  }
  if (!challenges.length) {
    challenges.push('Keeping momentum when the schedule gets messy.');
  }

  if (q.routineStyle === 'structure') {
    strengths.push('You respond well to clear structure and visible streaks.');
  } else {
    strengths.push('You adapt when life bends the plan—flexibility is a strength.');
  }
  if ((q.motivationSlider ?? 5) >= 7) {
    strengths.push('Motivation is already on your side—channel it into small repeats.');
  }
  if (q.accountability === 'gentle') {
    strengths.push('You prefer kind accountability, which supports long-term consistency.');
  } else {
    strengths.push('You like clear accountability—Quirkly can keep expectations crisp.');
  }
  if ((q.improvementAreas || []).length) {
    strengths.push(`You’re intentional about growth in ${q.improvementAreas.slice(0, 2).join(' & ')}.`);
  }
  if (!strengths.length) {
    strengths.push('You’re willing to examine how you work—that already puts you ahead.');
  }

  return {
    challenges: challenges.slice(0, 3),
    strengths: strengths.slice(0, 3),
  };
}

/**
 * @param {import('../types.js').UserProfile} profile
 */
export function dashboardHeadline(profile) {
  if (!profile) return 'Pick one small habit and make it yours.';
  if (profile.encouragementPreference === 'supportive') {
    return 'No rush—your next tiny step is enough for today.';
  }
  if (profile.routinePreference === 'structure') {
    return 'Consistency beats intensity. Keep the streak honest.';
  }
  return 'One quirky habit at a time—that’s the whole game.';
}

/**
 * @param {import('../types.js').UserProfile} profile
 */
export function supportCopy(profile) {
  if (!profile) return '';
  if (profile.encouragementPreference === 'supportive') {
    return 'Missed a day? Quirkly doesn’t spiral—just return with a smaller step and keep going.';
  }
  if (profile.routinePreference === 'structure') {
    return 'Small repeats beat perfect plans. Check the box, then move on with your day.';
  }
  return 'Stay with the next doable step—momentum returns in layers.';
}

/**
 * @param {import('../types.js').UserProfile} profile
 */
export function microStepForDifficulty(profile, baseStep) {
  if (!profile || profile.taskInitiationDifficulty !== 'high') return baseStep;
  const short = baseStep.length > 60 ? baseStep.slice(0, 57) + '…' : baseStep;
  return `Starter (2 min): ${short}`;
}

/**
 * @param {import('../types.js').UserProfile} profile
 */
export function showOneHabitFocus(profile) {
  return profile?.taskInitiationDifficulty === 'high' || profile?.prefersSimpleView === true;
}

/** Best weekday label from last 7 days of completion */
export function bestDayInsight(weekSeries) {
  if (!weekSeries?.length) return null;
  let best = weekSeries[0];
  for (const cell of weekSeries) {
    if (cell.pct > best.pct) best = cell;
  }
  if (best.pct <= 0) return 'This week is still warming up—one completion starts the curve.';
  return `Your strongest recent day is ${best.label} (${best.pct}% completion). Schedule harder habits then when you can.`;
}
