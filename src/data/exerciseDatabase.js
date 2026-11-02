export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
  'Cardio'
];

export const POPULAR_EXERCISES = [
  // Chest
  { name: 'Barbell Bench Press', muscle: 'Chest', category: 'Barbell', defaultSets: 4, defaultReps: 8 },
  { name: 'Incline Dumbbell Press', muscle: 'Chest', category: 'Dumbbell', defaultSets: 3, defaultReps: 10 },
  { name: 'Cable Chest Flyes', muscle: 'Chest', category: 'Cable', defaultSets: 3, defaultReps: 12 },
  { name: 'Dips (Chest Focus)', muscle: 'Chest', category: 'Bodyweight', defaultSets: 3, defaultReps: 10 },
  { name: 'Push-Ups', muscle: 'Chest', category: 'Bodyweight', defaultSets: 3, defaultReps: 15 },

  // Back
  { name: 'Deadlift (Conventional)', muscle: 'Back', category: 'Barbell', defaultSets: 4, defaultReps: 5 },
  { name: 'Barbell Bent-Over Row', muscle: 'Back', category: 'Barbell', defaultSets: 4, defaultReps: 8 },
  { name: 'Lat Pulldown', muscle: 'Back', category: 'Machine', defaultSets: 4, defaultReps: 10 },
  { name: 'Pull-Ups', muscle: 'Back', category: 'Bodyweight', defaultSets: 3, defaultReps: 8 },
  { name: 'Seated Cable Row', muscle: 'Back', category: 'Cable', defaultSets: 3, defaultReps: 10 },
  { name: 'Single-Arm Dumbbell Row', muscle: 'Back', category: 'Dumbbell', defaultSets: 3, defaultReps: 10 },

  // Legs
  { name: 'Barbell Back Squat', muscle: 'Legs', category: 'Barbell', defaultSets: 4, defaultReps: 8 },
  { name: 'Romanian Deadlift (RDL)', muscle: 'Legs', category: 'Barbell', defaultSets: 3, defaultReps: 10 },
  { name: 'Leg Press', muscle: 'Legs', category: 'Machine', defaultSets: 4, defaultReps: 12 },
  { name: 'Bulgarian Split Squats', muscle: 'Legs', category: 'Dumbbell', defaultSets: 3, defaultReps: 10 },
  { name: 'Leg Extensions', muscle: 'Legs', category: 'Machine', defaultSets: 3, defaultReps: 12 },
  { name: 'Hamstring Curls', muscle: 'Legs', category: 'Machine', defaultSets: 3, defaultReps: 12 },
  { name: 'Standing Calf Raises', muscle: 'Legs', category: 'Machine', defaultSets: 4, defaultReps: 15 },

  // Shoulders
  { name: 'Overhead Barbell Press (OHP)', muscle: 'Shoulders', category: 'Barbell', defaultSets: 4, defaultReps: 8 },
  { name: 'Dumbbell Lateral Raises', muscle: 'Shoulders', category: 'Dumbbell', defaultSets: 4, defaultReps: 15 },
  { name: 'Dumbbell Shoulder Press', muscle: 'Shoulders', category: 'Dumbbell', defaultSets: 3, defaultReps: 10 },
  { name: 'Rear Delt Flyes', muscle: 'Shoulders', category: 'Dumbbell', defaultSets: 3, defaultReps: 12 },
  { name: 'Face Pulls', muscle: 'Shoulders', category: 'Cable', defaultSets: 3, defaultReps: 15 },

  // Arms
  { name: 'Barbell Bicep Curls', muscle: 'Arms', category: 'Barbell', defaultSets: 3, defaultReps: 10 },
  { name: 'Incline Dumbbell Curls', muscle: 'Arms', category: 'Dumbbell', defaultSets: 3, defaultReps: 12 },
  { name: 'Hammer Curls', muscle: 'Arms', category: 'Dumbbell', defaultSets: 3, defaultReps: 10 },
  { name: 'Tricep Rope Pushdowns', muscle: 'Arms', category: 'Cable', defaultSets: 3, defaultReps: 12 },
  { name: 'Skull Crushers', muscle: 'Arms', category: 'Barbell', defaultSets: 3, defaultReps: 10 },
  { name: 'Overhead Tricep Extension', muscle: 'Dumbbell', category: 'Dumbbell', defaultSets: 3, defaultReps: 12 },

  // Core
  { name: 'Hanging Leg Raises', muscle: 'Core', category: 'Bodyweight', defaultSets: 3, defaultReps: 12 },
  { name: 'Plank Hold', muscle: 'Core', category: 'Bodyweight', defaultSets: 3, defaultReps: 60 },
  { name: 'Cable Woodchoppers', muscle: 'Core', category: 'Cable', defaultSets: 3, defaultReps: 12 },
  { name: 'Ab Wheel Rollouts', muscle: 'Core', category: 'Bodyweight', defaultSets: 3, defaultReps: 10 }
];

export const WORKOUT_TEMPLATES = [
  {
    name: 'Push Day (Chest, Shoulders, Triceps)',
    exercises: [
      { name: 'Barbell Bench Press', muscle: 'Chest' },
      { name: 'Incline Dumbbell Press', muscle: 'Chest' },
      { name: 'Dumbbell Lateral Raises', muscle: 'Shoulders' },
      { name: 'Tricep Rope Pushdowns', muscle: 'Arms' }
    ]
  },
  {
    name: 'Pull Day (Back & Biceps)',
    exercises: [
      { name: 'Deadlift (Conventional)', muscle: 'Back' },
      { name: 'Lat Pulldown', muscle: 'Back' },
      { name: 'Barbell Bent-Over Row', muscle: 'Back' },
      { name: 'Incline Dumbbell Curls', muscle: 'Arms' }
    ]
  },
  {
    name: 'Leg Day (Quads & Hamstrings)',
    exercises: [
      { name: 'Barbell Back Squat', muscle: 'Legs' },
      { name: 'Romanian Deadlift (RDL)', muscle: 'Legs' },
      { name: 'Leg Press', muscle: 'Legs' },
      { name: 'Standing Calf Raises', muscle: 'Legs' }
    ]
  },
  {
    name: 'Upper Body Power',
    exercises: [
      { name: 'Barbell Bench Press', muscle: 'Chest' },
      { name: 'Pull-Ups', muscle: 'Back' },
      { name: 'Overhead Barbell Press (OHP)', muscle: 'Shoulders' },
      { name: 'Hammer Curls', muscle: 'Arms' }
    ]
  }
];

