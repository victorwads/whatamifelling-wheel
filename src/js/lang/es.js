// Español
export default {
  name: "Español",
  ui: {
    sidebarTitle: "Emociones Seleccionadas",
    emptySelection: "Ninguna emoción seleccionada",
    btnClear: "Limpiar",
    btnCopy: "Copiar",
    btnCopyText: "Copiar texto",
    btnCopyLink: "Copiar enlace",
    btnExportPng: "Exportar PNG",
    btnExportPdf: "Exportar PDF",
    toastCopied: "¡Lista copiada!",
    shareIntro: "Mira mis sentimientos",
    pdfTitle: "Rueda de Emociones – PDF",
    pdfListTitle: "Emociones Seleccionadas",
    appTitle: "Rueda de Emociones",
    appDescription: "Selecciona las emociones que estás sintiendo haciendo clic en ellas. Exporta o comparte para registrar cómo te sientes.",
    exportDateLabel: "Fecha y hora",
    btnShare: "🔗 Compartir"
  },
  sectors: [
    {
      name: "Miedo",
      baseColor: [120, 0, 180],
      rings: [
        ["Aprensivo","Inseguro","Preocupado","Tenso","Temeroso","Inquieto","Nervioso","Cauteloso","Vulnerable","Alerta"],
        ["Ansioso","Asustado","Amenazado","Incómodo","Presionado","Alarmado","Perturbado","Desprotegido","En riesgo","Vacilante"],
        ["Aterrorizado","Despavorido","Horrorizado","Paralizado","En pánico","Desesperado","Fóbico","En shock","Pavor","Descontrolado"],
        ["Terror","Pavor extremo","Histeria","Pánico total","Colapso","Desesperación","Sin suelo","Huida","Aniquilación","Miedo absoluto"],
      ],
    },
    {
      name: "Ira",
      baseColor: [220, 40, 40],
      rings: [
        ["Irritado","Molesto","Contrariado","Impaciente","Disgustado","Agitado","Frustrado","Resentido","Escéptico","Desconfiado"],
        ["Enojado","Furioso","Ofendido","Hostil","Indignado","Ultrajado","Provocado","Rencoroso","Celoso","Agresivo"],
        ["Furioso","Enfurecido","Sublevado","Colérico","Explosivo","Amargado","Odioso","Vengativo","Desprecio","Intolerante"],
        ["Furia","Odio","Fuera de sí","Iracundo","Violento","Implacable","Rabioso","Descontrolado","Poseído","Incendiado"],
      ],
    },
    {
      name: "Tristeza",
      baseColor: [50, 100, 200],
      rings: [
        ["Desanimado","Abatido","Disgustado","Solitario","Nostálgico","Cansado","Vacío","Melancólico","Desmotivado","Carente"],
        ["Triste","Herido","Decepcionado","Desilusionado","Pesaroso","Impotente","Culpable","Arrepentido","Avergonzado","Desamparado"],
        ["Deprimido","Devastado","Inconsolable","Humillado","Afligido","Desesperanzado","Duelo","Atribulado","Angustiado","Oprimido"],
        ["Desesperación","Desolado","Destrozado","Sin sentido","Dolor profundo","Abismo","Derrumbado","Aniquilado","Tragado","Deshecho"],
      ],
    },
    {
      name: "Sorpresa",
      baseColor: [255, 180, 0],
      rings: [
        ["Curioso","Intrigado","Atento","Desconfiado","Distraído","Incierto","Suspenso","Cuestionador","Inesperado","Despierto"],
        ["Sorprendido","Asombrado","Perplejo","Confuso","Impresionado","Sin palabras","Tocado","Estupefacto","Chocado","Atónito"],
        ["Pasmado","Boquiabierto","Alarmado","Aterrado","Aterrorizado","Desorientado","Incrédulo","Paralizado","Espanto","Perturbado"],
        ["Sacudido","En shock","Aturdido","Descompensado","Sobresalto","Colapso","Vértigo","Pánico súbito","Explotado","Increíble"],
      ],
    },
    {
      name: "Alegría",
      baseColor: [60, 180, 75],
      rings: [
        ["Sereno","Aliviado","Cómodo","Tranquilo","Relajado","Ligero","Agradecido","Satisfecho","Bien","Ok"],
        ["Feliz","Alegre","Animado","Divertido","Esperanzado","Optimista","Entusiasmado","Interesado","Motivado","Emocionado"],
        ["Radiante","Encantado","Inspirado","Vibrante","Energizado","Maravillado","Triunfante","Orgulloso","Eufórico","Apasionado"],
        ["Éxtasis","Júbilo","Exaltación","Arrebatado","Extasiado","Plenitud","Desbordante","Increíble","Glorioso","Cima"],
      ],
    },
    {
      name: "Amor",
      baseColor: [230, 80, 150],
      rings: [
        ["Cariño","Afecto","Ternura","Acogido","Cuidado","Compasión","Amistad","Respeto","Gentileza","Conexión"],
        ["Amoroso","Apreciado","Valorado","Confiado","Íntimo","Solidario","Protector","Dedicado","Gratitud","Pertenencia"],
        ["Apasionado","Devoto","Admiración","Encantamiento","Deseo","Comprometido","Añoranza","Reverencia","Fascinación","Unión"],
        ["Adoración","Veneración","Entrega","Amor profundo","Fusión","Plenamente amado","Amor incondicional","Entereza","Sagrado","Completud"],
      ],
    },
  ]
};
