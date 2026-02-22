// Deutsch (German)
export default {
  name: "Deutsch",
  ui: {
    sidebarTitle: "Ausgewählte Emotionen",
    emptySelection: "Keine Emotionen ausgewählt",
    btnClear: "Löschen",
    btnCopy: "Kopieren",
    btnCopyText: "Text kopieren",
    btnCopyLink: "Link kopieren",
    btnExportPng: "PNG exportieren",
    btnExportPdf: "PDF exportieren",
    toastCopied: "Liste kopiert!",
    shareIntro: "Schau dir meine Gefühle an",
    pdfTitle: "Gefühlsrad – PDF",
    pdfListTitle: "Ausgewählte Emotionen",
    appTitle: "Gefühlsrad",
    appDescription: "Wählen Sie die Emotionen aus, die Sie fühlen, indem Sie darauf klicken. Exportieren oder teilen Sie, um festzuhalten, wie Sie sich fühlen.",
    exportDateLabel: "Datum und Uhrzeit",
    btnShare: "🔗 Teilen",
    pdfInteractiveLink: "Klicken Sie hier, um diesen Bericht im interaktiven Modus zu öffnen"
  },
  sectors: [
    {
      name: "Angst",
      rings: [
        ["Ängstlich", "Unsicher", "Bedroht"],
        ["Besorgt", "Beunruhigt", "Vorsichtig", "Furchtsam", "Unwohl", "Verletzlich"],
        ["Angespannt", "Nervös", "Unruhig", "Wachsam", "Zögerlich", "Erschrocken", "Alarmiert", "Schutzlos", "Unwohl", "Unter Druck"],
        ["Verängstigt", "Entsetzt", "Gelähmt", "Im Schock", "Verstört", "In Panik", "Grauen", "Verzweifelt", "Phobisch", "Hilflos",
        "Terror", "Hysterie", "Totale Panik", "Boden los", "Flucht", "Zusammenbruch", "Außer Kontrolle", "Absolute Angst"]
      ],
    },
    {
      name: "Wut",
      rings: [
        ["Gereizt", "Beleidigt", "Frustriert"],
        ["Genervt", "Verstimmt", "Ungeduldig", "Empört", "Verdrossen", "Provoziert"],
        ["Aufgebracht", "Erregt", "Skeptisch", "Misstrauisch", "Böse", "Zornig", "Wütend", "Feindselig", "Eifersüchtig", "Aggressiv"],
        ["Rasend", "Empört", "Cholerisch", "Explosiv", "Hasserfüllt", "Rachsüchtig", "Verachtung", "Intolerant", "Verbittert", "Voller Groll",
        "Furie", "Hass", "Außer sich", "Tobsüchtig", "Unnachgiebig", "Besessen", "Fanatisch", "Unkontrolliert"]
      ],
    },
    {
      name: "Trauer",
      rings: [
        ["Entmutigt", "Einsam", "Verletzt"],
        ["Müde", "Leer", "Sehnsüchtig", "Bedürftig", "Enttäuscht", "Hilflos"],
        ["Niedergeschlagen", "Melancholisch", "Unmotiviert", "Traurig", "Desillusioniert", "Betrübt", "Ohnmächtig", "Schuldig", "Reuevoll", "Beschämt"],
        ["Gequält", "Bedrückt", "In Trauer", "Unterdrückt", "Untröstlich", "Zerstört", "Hoffnungslos", "Tiefer Schmerz", "Sinnlos", "Öde",
        "Zerbrochen", "Verzweiflung", "Abgrund", "Eingestürzt", "Vernichtet", "Aufgelöst"]
      ],
    },
    {
      name: "Überraschung",
      rings: [
        ["Neugierig", "Verblüfft", "Schockiert"],
        ["Fasziniert", "Aufmerksam", "Unsicher", "Verwirrt", "Beeindruckt", "Fragend"],
        ["Überrascht", "Erstaunt", "Fassungslos", "Sprachlos", "Perplex", "Ungläubig", "Aufgewühlt", "Skeptisch", "Desorientiert", "Gelähmt"],
        ["Mund offen", "Bestürzt", "Fassungslos", "Alarmiert", "Aufgewühlt", "Im Schock", "Erschüttert", "Zusammengezuckt", "Plötzliche Angst", "Zusammenbruch",
        "Explodiert", "Unvorstellbar", "Schwindelig", "Überwältigt", "Aus dem Gleichgewicht", "Starr"]
      ],
    },
    {
      name: "Freude",
      rings: [
        ["Ruhig", "Froh", "Begeistert"],
        ["Erleichtert", "Entspannt", "Zufrieden", "Dankbar", "Heiter", "Optimistisch"],
        ["Behaglich", "Locker", "Leicht", "Gut", "Lebhaft", "Amüsiert", "Interessiert", "Motiviert", "Aufgeregt", "Energiegeladen", "Lebendig"],
        ["Strahlend", "Bezaubert", "Inspiriert", "Begeistert", "Triumphierend", "Stolz", "Euphorisch", "Leidenschaftlich", "Verzückt", "Beseelt",
        "Ekstase", "Jubel", "Exaltation", "Fülle", "Überfließend", "Glorreich", "Gipfel"]
      ],
    },
    {
      name: "Liebe",
      rings: [
        ["Herzlich", "Sehnsucht", "Verbunden"],
        ["Zuneigung", "Zärtlichkeit", "Anziehung", "Bewunderung", "Nostalgie", "Zugehörigkeit"],
        ["Güte", "Freundlichkeit", "Respekt", "Willkommen", "Engagiert", "Hingegeben", "Vertrauen", "Intimität", "Dankbarkeit", "Unterstützend", "Mitgefühl"],
        ["Faszination", "Ehrerbietung", "Bezauberung", "Hingabe", "Verehrung", "Anbetung", "Tiefe Liebe", "Bedingungslose Liebe", "Ganzheit", "Heilig",
        "Vollständig geliebt", "Vereinigung", "Verschmelzung", "Schutz", "Ergeben", "Romantisch"]
      ],
    },
  ]
};
