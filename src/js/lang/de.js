// Deutsch (German)
export default {
  name: "Deutsch",
  ui: {
    sidebarTitle: "Ausgewählte Emotionen",
    emptySelection: "Keine Emotionen ausgewählt",
    btnClear: "🗑 Löschen",
    btnCopy: "📋 Kopieren",
    btnExportPng: "⬇ PNG exportieren",
    btnExportPdf: "📄 PDF exportieren",
    toastCopied: "Liste kopiert!",
    pdfTitle: "Gefühlsrad – PDF",
    pdfListTitle: "Ausgewählte Emotionen",
    appTitle: "Gefühlsrad",
    appDescription: "Wählen Sie die Emotionen aus, die Sie fühlen, indem Sie darauf klicken. Exportieren oder teilen Sie, um festzuhalten, wie Sie sich fühlen.",
    exportDateLabel: "Datum und Uhrzeit",
    btnShare: "🔗 Teilen"
  },
  sectors: [
    {
      name: "Angst",
      baseColor: [120, 0, 180],
      rings: [
        ["besorgt","unsicher","beunruhigt","angespannt","ängstlich","unruhig","nervös","wachsam","verletzlich","vorsichtig"],
        ["ängstlich","eingeschüchtert","bedroht","unwohl","unter Druck","aufmerksam","verwirrt","schutzlos","gefährdet","zögerlich"],
        ["verängstigt","panisch","erschrocken","gebrochen","verstört","verzweifelt","zitternd","geschockt","einsam","unkontrolliert"],
        ["Panik","purer Horror","Delirium","Totalpanik","Zusammenbruch","Hoffnungslosigkeit","Abgrund","Flucht","Vernichtung","absolute Angst"],
      ],
    },
    {
      name: "Wut",
      baseColor: [220, 40, 40],
      rings: [
        ["gereizt","genervt","verärgert","ungeduldig","mürrisch","erregt","frustriert","Verdruss","argwöhnisch","misstrauisch"],
        ["wütend","erzürnt","gedemütigt","feindselig","empört","aggressiv","aufgebracht","neidisch","rachsüchtig","angriffslustig"],
        ["rasend","tobend","rebellisch","explosiv","gekränkt","verbittert","hasserfüllt","vergeltend","verächtlich","fanatisch"],
        ["Raserei","Hass","außer sich","tobsüchtig","gewalttätig","grausam","entflammt","besessen","wahnsinnig","tobend"],
      ],
    },
    {
      name: "Trauer",
      baseColor: [50, 100, 200],
      rings: [
        ["entmutigt","bedrückt","unglücklich","einsam","sehnend","müde","leer","wehmütig","gleichgültig","bedürftig"],
        ["traurig","verletzt","enttäuscht","desillusioniert","trauernd","hilflos","schuldig","reuevoll","beschämt","verlassen"],
        ["deprimiert","zerstört","untröstlich","erniedrigt","in Trauer","pessimistisch","trauernd","leidend","gequält","unterdrückt"],
        ["Verzweiflung","Öde","zertrümmert","sinnlos","tiefer Schmerz","Abgrund","eingestürzt","vernichtet","verschlungen","zerbrochen"],
      ],
    },
    {
      name: "Überraschung",
      baseColor: [255, 180, 0],
      rings: [
        ["neugierig","interessiert","nachdenklich","skeptisch","abgelenkt","unsicher","rätselhaft","fragend","unerwartet","wachgeworden"],
        ["überrascht","erstaunt","verwirrt","ratlos","beeindruckt","sprachlos","fasziniert","erschüttert","überwältigt","überrumpelt"],
        ["verblüfft","Mund offen","bestürzt","versteinert","ehrfürchtig","verloren","unglaublich","gelähmt","staunend","aufgewühlt"],
        ["erschüttert","im Schock","ohnmächtig","aufgelöst","Schock","Einsturz","Schwindel","plötzliche Angst","Explosion","unfassbar"],
      ],
    },
    {
      name: "Freude",
      baseColor: [60, 180, 75],
      rings: [
        ["ruhig","erleichtert","behaglich","stabil","sorglos","leicht","dankbar","zufrieden","gut","okay"],
        ["glücklich","froh","begeistert","fröhlich","hoffnungsvoll","optimistisch","enthusiastisch","interessiert","inspiriert","aufgeregt"],
        ["strahlend","bezaubert","angetrieben","lebendig","energiegeladen","begeistert","triumphierend","stolz","jubelnd","leidenschaftlich"],
        ["Ekstase","Jubel","Glückseligkeit","verzaubert","grenzenloses Glück","Vollkommenheit","überfließend","wunderbar","glorreich","Gipfel"],
      ],
    },
    {
      name: "Liebe",
      baseColor: [230, 80, 150],
      rings: [
        ["Zuneigung","Verbundenheit","Zärtlichkeit","Willkommen","Fürsorge","Mitgefühl","Freundschaft","Respekt","Güte","Bindung"],
        ["geliebt","geschätzt","wertvoll","vertrauend","intim","mitfühlend","beschützend","hingebungsvoll","dankbar","Zugehörigkeit"],
        ["leidenschaftlich","ergeben","bewundernd","bezaubert","Verlangen","verpflichtet","Sehnsucht","Verehrung","Faszination","Wiedersehen"],
        ["Anbetung","Verehrung","Hingabe","tiefe Liebe","Verschmelzen","Einheit","bedingungslose Liebe","Vollkommenheit","Heiligkeit","Ganzheit"],
      ],
    },
  ]
};
