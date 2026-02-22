// Français
export default {
  name: "Français",
  ui: {
    sidebarTitle: "Émotions Sélectionnées",
    emptySelection: "Aucune émotion sélectionnée",
    btnClear: "🗑 Effacer",
    btnCopy: "📋 Copier",
    btnExportPng: "⬇ Exporter PNG",
    btnExportPdf: "📄 Exporter PDF",
    toastCopied: "Liste copiée !",
    pdfTitle: "Roue des Émotions – PDF",
    pdfListTitle: "Émotions Sélectionnées",
    appTitle: "Roue des Émotions",
    appDescription: "Sélectionnez les émotions que vous ressentez en cliquant dessus. Exportez ou partagez pour enregistrer ce que vous ressentez.",
    exportDateLabel: "Date et heure",
    btnShare: "🔗 Partager"
  },
  sectors: [
    {
      name: "Peur",
      baseColor: [120, 0, 180],
      rings: [
        ["Appréhensif","Insécure","Inquiet","Tendu","Craintif","Agité","Nerveux","Prudent","Vulnérable","Alerte"],
        ["Anxieux","Effrayé","Menacé","Inconfortable","Sous pression","Alarmé","Perturbé","Non protégé","En danger","Hésitant"],
        ["Terrorisé","Épouvanté","Horrifié","Paralysé","Paniqué","Désespéré","Phobique","En état de choc","Effroi","Incontrôlable"],
        ["Terreur","Effroi extrême","Hystérie","Panique totale","Effondrement","Désespoir","Sans repère","Fuite","Anéantissement","Peur absolue"],
      ],
    },
    {
      name: "Colère",
      baseColor: [220, 40, 40],
      rings: [
        ["Irrité","Gêné","Contrarié","Impatient","Fâché","Agité","Frustré","Rancunier","Sceptique","Méfiant"],
        ["En colère","Furieux","Offensé","Hostile","Indigné","Outré","Provoqué","Rancunier","Jaloux","Agressif"],
        ["Furieux","Enragé","Révolté","Colérique","Explosif","Amer","Haineux","Vengeur","Mépris","Intolérant"],
        ["Furie","Haine","Hors de soi","Iracible","Violent","Implacable","Rageur","Incontrôlé","Possédé","Embrasé"],
      ],
    },
    {
      name: "Tristesse",
      baseColor: [50, 100, 200],
      rings: [
        ["Découragé","Abattu","Contrarié","Solitaire","Nostalgique","Fatigué","Vide","Mélancolique","Démotivé","En manque"],
        ["Triste","Blessé","Déçu","Désillusion","Chagriné","Impuissant","Coupable","Regrettant","Honteux","Abandonné"],
        ["Déprimé","Dévasté","Inconsolable","Humilié","Affligé","Désespéré","En deuil","Tourmenté","Angoissé","Opprimé"],
        ["Désespoir","Désolé","Anéanti","Sans sens","Douleur profonde","Abîme","Écroulé","Annihilé","Englouti","Défait"],
      ],
    },
    {
      name: "Surprise",
      baseColor: [255, 180, 0],
      rings: [
        ["Curieux","Intrigué","Attentif","Méfiant","Distrait","Incertain","En suspens","Interrogatif","Inattendu","Éveillé"],
        ["Surpris","Étonné","Perplexe","Confus","Impressionné","Sans voix","Touché","Stupéfait","Choqué","Médusé"],
        ["Ébahi","Bouche bée","Alarmé","Abasourdi","Terrorisé","Désorienté","Incrédule","Paralysé","Stupeur","Perturbé"],
        ["Ébranlé","En état de choc","Assommé","Décompensé","Sursaut","Effondrement","Vertige","Panique soudaine","Explosé","Incroyable"],
      ],
    },
    {
      name: "Joie",
      baseColor: [60, 180, 75],
      rings: [
        ["Serein","Soulagé","Confortable","Tranquille","Détendu","Léger","Reconnaissant","Satisfait","Bien","Ok"],
        ["Heureux","Joyeux","Animé","Amusé","Plein d'espoir","Optimiste","Enthousiaste","Intéressé","Motivé","Emballé"],
        ["Radieux","Enchanté","Inspiré","Vibrant","Énergisé","Émerveillé","Triomphant","Fier","Euphorique","Passionné"],
        ["Extase","Jubilation","Exaltation","Ravi","Extatique","Plénitude","Débordant","Incroyable","Glorieux","Sommet"],
      ],
    },
    {
      name: "Amour",
      baseColor: [230, 80, 150],
      rings: [
        ["Tendresse","Affection","Douceur","Accueilli","Soigné","Compassion","Amitié","Respect","Gentillesse","Connexion"],
        ["Aimant","Apprécié","Valorisé","Confiant","Intime","Solidaire","Protecteur","Dévoué","Gratitude","Appartenance"],
        ["Passionné","Dévoué","Admiration","Enchantement","Désir","Engagé","Nostalgie","Révérence","Fascination","Union"],
        ["Adoration","Vénération","Abandon","Amour profond","Fusion","Pleinement aimé","Amour inconditionnel","Plénitude","Sacré","Complétude"],
      ],
    },
  ]
};
