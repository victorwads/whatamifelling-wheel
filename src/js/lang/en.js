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
    btnShare: "🔗 Share",
    pdfInteractiveLink: "Click here to open this report in interactive mode"
  },
  sectors: [
    {
      name: "Fear",
      rings: [
        ["Anxious", "Insecure", "Threatened"],
        ["Apprehensive", "Worried", "Cautious", "Fearful", "Uneasy", "Vulnerable"],
        ["Tense", "Nervous", "Restless", "Alert", "Hesitant", "Scared", "Alarmed", "Unprotected", "Uncomfortable", "Pressured"],
        ["Terrified", "Horrified", "Paralyzed", "In shock", "Disturbed", "Panicked", "Dread", "Desperate", "Phobic", "Helpless",
        "Terror", "Hysteria", "Total panic", "Groundless", "Fleeing", "Collapse", "Uncontrolled", "Absolute fear"]
      ],
    },
    {
      name: "Anger",
      rings: [
        ["Irritated", "Offended", "Frustrated"],
        ["Bothered", "Contrary", "Impatient", "Indignant", "Resentful", "Provoked"],
        ["Upset", "Agitated", "Skeptical", "Distrustful", "Mad", "Angry", "Outraged", "Hostile", "Jealous", "Aggressive"],
        ["Enraged", "Revolted", "Choleric", "Explosive", "Hateful", "Vengeful", "Contemptuous", "Intolerant", "Bitter", "Rancorous",
        "Fury", "Hatred", "Beside oneself", "Irate", "Implacable", "Possessed", "Wrathful", "Uncontrolled"]
      ],
    },
    {
      name: "Sadness",
      rings: [
        ["Discouraged", "Lonely", "Hurt"],
        ["Tired", "Empty", "Nostalgic", "Needy", "Disappointed", "Helpless"],
        ["Dejected", "Melancholic", "Unmotivated", "Sad", "Disillusioned", "Sorrowful", "Powerless", "Guilty", "Regretful", "Ashamed"],
        ["Anguished", "Afflicted", "Grieving", "Oppressed", "Inconsolable", "Devastated", "Hopeless", "Deep pain", "Meaningless", "Desolate",
        "Shattered", "Despair", "Abyss", "Crumbled", "Annihilated", "Undone"]
      ],
    },
    {
      name: "Surprise",
      rings: [
        ["Curious", "Perplexed", "Shocked"],
        ["Intrigued", "Attentive", "Uncertain", "Confused", "Impressed", "Questioning"],
        ["Surprised", "Astonished", "Stunned", "Speechless", "Stupefied", "Incredulous", "Suspended", "Suspicious", "Disoriented", "Paralyzed"],
        ["Jaw-dropped", "Aghast", "Astounded", "Alarmed", "Disturbed", "In shock", "Shaken", "Startled", "Sudden panic", "Collapsed",
        "Exploded", "Unbelievable", "Vertigo", "Overwhelmed", "Off-balance", "Dumbfounded"]
      ],
    },
    {
      name: "Joy",
      rings: [
        ["Serene", "Happy", "Enthusiastic"],
        ["Relieved", "Calm", "Content", "Grateful", "Cheerful", "Optimistic"],
        ["Comfortable", "Relaxed", "Light", "Well", "Animated", "Amused", "Interested", "Motivated", "Excited", "Energized", "Vibrant"],
        ["Radiant", "Enchanted", "Inspired", "Marveled", "Triumphant", "Proud", "Euphoric", "Passionate", "Rapturous", "Ecstatic",
        "Ecstasy", "Jubilation", "Exaltation", "Fullness", "Overflowing", "Glorious", "Peak"]
      ],
    },
    {
      name: "Love",
      rings: [
        ["Affectionate", "Longing", "Connected"],
        ["Caring", "Tenderness", "Attraction", "Admiration", "Nostalgia", "Belonging"],
        ["Gentle", "Kind", "Respectful", "Welcomed", "Committed", "Dedicated", "Trusting", "Intimate", "Grateful", "Supportive", "Compassionate"],
        ["Fascination", "Reverence", "Enchantment", "Surrender", "Adoration", "Veneration", "Deep love", "Unconditional love", "Wholeness", "Sacred",
        "Fully loved", "Union", "Fusion", "Protection", "Devoted", "Romantic"]
      ],
    },
  ]
};
