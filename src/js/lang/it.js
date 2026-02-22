// Italiano (Italian)
export default {
  name: "Italiano",
  ui: {
    sidebarTitle: "Emozioni selezionate",
    emptySelection: "Nessuna emozione selezionata",
    btnClear: "🗑 Cancella",
    btnCopy: "📋 Copia",
    btnExportPng: "⬇ Esporta PNG",
    btnExportPdf: "📄 Esporta PDF",
    toastCopied: "Lista copiata!",
    pdfTitle: "Ruota delle Emozioni – PDF",
    pdfListTitle: "Emozioni selezionate",
    appTitle: "Ruota delle Emozioni",
    appDescription: "Seleziona le emozioni che stai provando cliccandoci sopra. Esporta o condividi per registrare come ti senti.",
    exportDateLabel: "Data e ora",
    btnShare: "🔗 Condividi"
  },
  sectors: [
    {
      name: "Paura",
      baseColor: [120, 0, 180],
      rings: [
        ["preoccupato","insicuro","turbato","teso","spaventato","inquieto","nervoso","vigile","vulnerabile","cauto"],
        ["ansioso","intimidito","minacciato","a disagio","sotto pressione","attento","confuso","indifeso","in pericolo","esitante"],
        ["terrorizzato","in panico","scioccato","sconvolto","angosciato","disperato","tremante","traumatizzato","solo","fuori controllo"],
        ["panico","terrore puro","delirio","totale panico","crollo","disperazione","abisso","fuga","distruzione","paura assoluta"],
      ],
    },
    {
      name: "Rabbia",
      baseColor: [220, 40, 40],
      rings: [
        ["irritato","infastidito","seccato","impaziente","scontroso","agitato","frustrato","contrariato","sospettoso","diffidente"],
        ["arrabbiato","furioso","umiliato","ostile","indignato","violento","esasperato","invidioso","rancoroso","aggressivo"],
        ["furibondo","irato","ribelle","esplosivo","amaro","acido","pieno d'odio","vendicativo","sprezzante","fanatico"],
        ["furia","odio","fuori di sé","furente","violento","crudele","infiammato","ossessionato","forsennato","ardente"],
      ],
    },
    {
      name: "Tristezza",
      baseColor: [50, 100, 200],
      rings: [
        ["scoraggiato","malinconico","infelice","solo","nostalgico","stanco","vuoto","melanconico","apatico","bisognoso"],
        ["triste","ferito","deluso","disilluso","afflitto","impotente","colpevole","pentito","vergognoso","abbandonato"],
        ["depresso","distrutto","inconsolabile","umiliato","in lutto","pessimista","in perdita","sofferente","angosciato","represso"],
        ["disperazione","desolazione","frantumato","senza senso","dolore profondo","abisso","crollato","annientato","inghiottito","spezzato"],
      ],
    },
    {
      name: "Sorpresa",
      baseColor: [255, 180, 0],
      rings: [
        ["curioso","interessato","pensieroso","scettico","distratto","incerto","misterioso","interrogativo","inaspettato","risvegliato"],
        ["sorpreso","stupito","perplesso","confuso","colpito","senza parole","affascinato","sconvolto","sopraffatto","colto alla sprovvista"],
        ["sbalordito","a bocca aperta","sconcertato","pietrificato","reverente","smarrito","incredibile","paralizzato","meravigliato","turbato"],
        ["sconvolto","sotto shock","svenuto","dissolto","shock","crollo","vertigine","paura improvvisa","esplosione","inconcepibile"],
      ],
    },
    {
      name: "Gioia",
      baseColor: [60, 180, 75],
      rings: [
        ["calmo","sollevato","a proprio agio","stabile","spensierato","leggero","grato","soddisfatto","bene","ok"],
        ["felice","allegro","eccitato","divertito","speranzoso","ottimista","entusiasta","interessato","ispirato","elettrizzato"],
        ["radiante","incantato","motivato","vivo","energico","stupefatto","trionfante","orgoglioso","esultante","appassionato"],
        ["estasi","giubilo","beatitudine","incantato","felicità infinita","pienezza","traboccante","meraviglioso","glorioso","apice"],
      ],
    },
    {
      name: "Amore",
      baseColor: [230, 80, 150],
      rings: [
        ["affetto","attaccamento","tenerezza","accoglienza","cura","compassione","amicizia","rispetto","gentilezza","legame"],
        ["amato","apprezzato","prezioso","fiducioso","intimo","empatico","protettivo","devoto","riconoscente","appartenenza"],
        ["passionale","dedicato","ammirato","ammaliato","desiderio","impegnato","nostalgia","venerazione","fascino","ricongiungimento"],
        ["adorazione","culto","devozione","amore profondo","fusione","unità","amore incondizionato","perfezione","sacralità","completezza"],
      ],
    },
  ]
};
