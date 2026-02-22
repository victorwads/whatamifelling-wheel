// English
export default {
  name: "English",
  ui: {
    sidebarTitle: "Selected Emotions",
    emptySelection: "No emotion selected",
    btnClear: "Clear",
    btnCopy: "Copy",
    btnCopyText: "Copy text",
    btnCopyLink: "Copy link",
    btnExportPng: "Export PNG",
    btnExportPdf: "Export PDF",
    toastCopied: "List copied!",
    shareIntro: "Check out my feelings",
    pdfTitle: "Emotion Wheel – PDF",
    pdfListTitle: "Selected Emotions",
    appTitle: "Emotion Wheel",
    appDescription: "Select the emotions you are feeling by clicking on them. Export or share to record how you feel.",
    exportDateLabel: "Date and time",
    btnShare: "🔗 Share"
  },
  sectors: [
    {
      name: "Fear",
      baseColor: [120, 0, 180],
      rings: [
        ["Apprehensive","Insecure","Worried","Tense","Fearful","Restless","Nervous","Cautious","Vulnerable","Alert"],
        ["Anxious","Scared","Threatened","Uncomfortable","Pressured","Alarmed","Disturbed","Unprotected","At risk","Hesitant"],
        ["Terrified","Petrified","Horrified","Paralyzed","Panicked","Desperate","Phobic","In shock","Dread","Out of control"],
        ["Terror","Extreme dread","Hysteria","Total panic","Collapse","Despair","Groundless","Flight","Annihilation","Absolute fear"],
      ],
    },
    {
      name: "Anger",
      baseColor: [220, 40, 40],
      rings: [
        ["Irritated","Annoyed","Upset","Impatient","Bothered","Agitated","Frustrated","Resentful","Skeptical","Suspicious"],
        ["Angry","Mad","Offended","Hostile","Indignant","Outraged","Provoked","Rancorous","Jealous","Aggressive"],
        ["Furious","Enraged","Revolted","Choleric","Explosive","Bitter","Hateful","Vengeful","Contempt","Intolerant"],
        ["Fury","Hatred","Beside oneself","Irate","Violent","Implacable","Wrathful","Uncontrolled","Possessed","Ignited"],
      ],
    },
    {
      name: "Sadness",
      baseColor: [50, 100, 200],
      rings: [
        ["Discouraged","Dejected","Upset","Lonely","Nostalgic","Tired","Empty","Melancholy","Demotivated","Needy"],
        ["Sad","Hurt","Disappointed","Disillusioned","Sorrowful","Helpless","Guilty","Regretful","Ashamed","Abandoned"],
        ["Depressed","Devastated","Inconsolable","Humiliated","Mournful","Hopeless","Grieving","Afflicted","Anguished","Oppressed"],
        ["Despair","Desolate","Shattered","Meaningless","Deep pain","Abyss","Crumbled","Annihilated","Consumed","Undone"],
      ],
    },
    {
      name: "Surprise",
      baseColor: [255, 180, 0],
      rings: [
        ["Curious","Intrigued","Attentive","Suspicious","Distracted","Uncertain","Suspended","Questioning","Unexpected","Awake"],
        ["Surprised","Amazed","Perplexed","Confused","Impressed","Speechless","Touched","Stupefied","Shocked","Astonished"],
        ["Astounded","Jaw-dropped","Alarmed","Aghast","Terrified","Bewildered","Incredulous","Paralyzed","Amazement","Disturbed"],
        ["Shaken","In shock","Stunned","Overwhelmed","Startled","Collapsed","Vertigo","Sudden panic","Exploded","Unbelievable"],
      ],
    },
    {
      name: "Joy",
      baseColor: [60, 180, 75],
      rings: [
        ["Serene","Relieved","Comfortable","Tranquil","Relaxed","Light","Grateful","Satisfied","Well","Ok"],
        ["Happy","Joyful","Excited","Amused","Hopeful","Optimistic","Enthusiastic","Interested","Motivated","Thrilled"],
        ["Radiant","Enchanted","Inspired","Vibrant","Energized","Marveled","Triumphant","Proud","Euphoric","Passionate"],
        ["Ecstasy","Jubilation","Exaltation","Rapturous","Ecstatic","Fullness","Overflowing","Incredible","Glorious","Peak"],
      ],
    },
    {
      name: "Love",
      baseColor: [230, 80, 150],
      rings: [
        ["Affection","Fondness","Tenderness","Welcomed","Cared for","Compassion","Friendship","Respect","Kindness","Connection"],
        ["Loving","Appreciated","Valued","Confident","Intimate","Supportive","Protective","Dedicated","Gratitude","Belonging"],
        ["Passionate","Devoted","Admiration","Enchantment","Desire","Committed","Longing","Reverence","Fascination","Union"],
        ["Adoration","Veneration","Surrender","Deep love","Fusion","Fully loved","Unconditional","Wholeness","Sacred","Completeness"],
      ],
    },
  ]
};
