/**
 * @typedef {'daily' | 'weekly'} HabitFrequency
 * @typedef {'ink' | 'cloud' | 'pop'} ThemeId
 *
 * @typedef {Object} QuizAnswers
 * @property {string[]} improvementAreas
 * @property {string} whyHabits
 * @property {string} sleepNote
 * @property {number} motivationSlider
 * @property {string} idealDay
 * @property {string} overwhelm
 * @property {string} procrastinationReason
 * @property {string[]} pastBarriers
 * @property {string} confidenceTopics
 * @property {string} scheduleOutline
 * @property {'structure' | 'flexibility'} routineStyle
 * @property {'morning' | 'afternoon' | 'evening'} energyPeak
 * @property {'gentle' | 'strict'} accountability
 * @property {string[]} initialHabitIdeas
 * @property {number} dailyTimeCommitmentMinutes
 * @property {number} initialHabitCount
 *
 * @typedef {Object} UserProfile
 * @property {string} name
 * @property {string} email
 * @property {boolean} onboardingCompleted
 * @property {number} motivationLevel
 * @property {string} focusStyle
 * @property {'low' | 'medium' | 'high'} forgetfulnessLevel
 * @property {'structure' | 'flexibility'} routinePreference
 * @property {'low' | 'medium' | 'high'} taskInitiationDifficulty
 * @property {boolean} prefersSimpleView
 * @property {'minimal' | 'supportive' | 'direct'} encouragementPreference
 * @property {QuizAnswers | null} quizAnswers
 * @property {string} derivedProfileType
 * @property {string} derivedProfileBlurb
 * @property {string[]} [derivedChallenges]
 * @property {string[]} [derivedStrengths]
 * @property {string} memberSince
 * @property {number} [focusScore]
 *
 * @typedef {Object} Habit
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {HabitFrequency} frequency
 * @property {number} targetDays
 * @property {string} category
 * @property {string} preferredTime
 * @property {string} createdAt
 * @property {string[]} completedDates
 * @property {boolean} active
 * @property {string} suggestedMicroStep
 * @property {string[]} [subtasks]
 * @property {number} [progressTarget]
 * @property {number} [progressCurrent]
 * @property {string} [snoozeUntil]
 *
 * @typedef {Object} AppState
 * @property {UserProfile | null} profile
 * @property {Habit[]} habits
 * @property {ThemeId} theme
 * @property {boolean} morningNudges
 * @property {boolean} weeklyReports
 */

export {};
