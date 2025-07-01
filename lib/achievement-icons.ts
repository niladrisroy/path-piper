
// Default achievement icons mapping
export const ACHIEVEMENT_TYPE_ICONS: { [key: number]: string } = {
  // Academic (Category 1)
  1: "🏆", // Honor Roll
  2: "🎓", // Dean's List
  3: "💰", // Academic Scholarship
  4: "📅", // Perfect Attendance
  5: "🥇", // Subject Topper
  6: "📄", // Research Publication
  7: "🏅", // Academic Award
  8: "📜", // Merit Certificate
  
  // Sports (Category 2)
  9: "🏆", // Championship Winner
  10: "🏃", // Tournament Participation
  11: "💰", // Sports Scholarship
  12: "👨‍💼", // Team Captain
  13: "📈", // Personal Best Record
  14: "🏅", // Sports Award
  15: "⚽", // Athletic Achievement
  16: "💪", // Fitness Milestone
  
  // Arts & Creativity (Category 3)
  17: "🎨", // Art Competition Winner
  18: "🖼️", // Creative Project
  19: "🎭", // Performance Award
  20: "🖼️", // Art Exhibition
  21: "🎵", // Music Competition
  22: "💃", // Dance Performance
  23: "✍️", // Creative Writing
  24: "📸", // Photography Award
  
  // Leadership (Category 4)
  25: "🏛️", // Student Council
  26: "👑", // Club President
  27: "🤝", // Volunteer Service
  28: "👥", // Community Leader
  29: "🎯", // Mentorship Award
  30: "⏰", // Service Hours
  31: "📋", // Leadership Certificate
  32: "💡", // Social Initiative
  
  // Professional Skills (Category 5)
  33: "📊", // Professional Certification
  34: "📝", // Skill Assessment
  35: "✅", // Course Completion
  36: "📚", // Training Certificate
  37: "🆔", // License Achievement
  38: "🔖", // Competency Badge
  39: "🛠️", // Workshop Completion
  40: "👍", // Skill Endorsement
  
  // Competitions (Category 6)
  41: "❓", // Quiz Competition
  42: "🗣️", // Debate Winner
  43: "🔬", // Science Fair
  44: "💻", // Hackathon Winner
  45: "🥇", // Olympiad Medal
  46: "🎪", // Contest Participation
  47: "🏆", // Competition Award
  48: "🎯", // Challenge Winner
  
  // Personal Development (Category 7)
  49: "🎯", // Goal Achievement
  50: "📍", // Personal Milestone
  51: "🔄", // Habit Formation
  52: "📈", // Self Improvement
  53: "🎓", // Learning Goal
  54: "💪", // Personal Challenge
  55: "🌱", // Growth Milestone
  56: "🔓", // Achievement Unlocked
  
  // Technology & Innovation (Category 8)
  57: "💻", // Coding Project
  58: "📱", // App Development
  59: "💡", // Innovation Award
  60: "🖥️", // Tech Competition
  61: "📄", // Patent Filed
  62: "📊", // Technical Presentation
  63: "⌨️", // Programming Achievement
  64: "🎨", // Digital Creation
  
  // Social Impact (Category 9)
  65: "🤝", // Social Project
  66: "❤️", // Community Service
  67: "💰", // Fundraising Success
  68: "📢", // Awareness Campaign
  69: "🌱", // Environmental Initiative
  70: "🌟", // Social Impact Award
  71: "💝", // Charity Work
  72: "🏆", // Community Recognition
  
  // Cultural & Language (Category 10)
  73: "🗣️", // Language Proficiency
  74: "🎭", // Cultural Performance
  75: "🗣️", // Language Competition
  76: "🏆", // Cultural Award
  77: "📖", // Translation Work
  78: "🌍", // Cultural Exchange
  79: "🏛️", // Heritage Project
  80: "🌐", // Multilingual Achievement
}

// Function to get default icon for achievement type
export function getDefaultIcon(achievementTypeId: number): string {
  return ACHIEVEMENT_TYPE_ICONS[achievementTypeId] || "🏆"
}

// Function to convert emoji to SVG data URL for consistent display
export function emojiToDataUrl(emoji: string): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = 64
  canvas.height = 64
  
  if (ctx) {
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(emoji, 32, 32)
  }
  
  return canvas.toDataURL()
}
