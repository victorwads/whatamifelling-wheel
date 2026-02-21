/**
 * Emotion Wheel Data & Constants
 */

export const SECTORS = [
  {
    name: "Medo",
    baseColor: [120, 0, 180],
    rings: [
      ["Apreensivo","Inseguro","Preocupado","Tenso","Receoso","Inquieto","Nervoso","Cauteloso","Vulnerável","Alerta"],
      ["Ansioso","Assustado","Ameaçado","Desconfortável","Pressionado","Alarmado","Perturbado","Desprotegido","Em risco","Hesitante"],
      ["Aterrorizado","Apavorado","Horrorizado","Paralisado","Em pânico","Desesperado","Fóbico","Em choque","Pavor","Descontrolado"],
      ["Terror","Pavor extremo","Histeria","Pânico total","Colapso","Desesperado","Sem chão","Fuga","Aniquilação","Medo absoluto"],
    ],
  },
  {
    name: "Raiva",
    baseColor: [220, 40, 40],
    rings: [
      ["Irritado","Incomodado","Contrariado","Impaciente","Chateado","Agitado","Frustrado","Ressentido","Cético","Desconfiado"],
      ["Bravo","Zangado","Ofendido","Hostil","Indignado","Ultrajado","Provocado","Rancoroso","Ciumento","Agressivo"],
      ["Furioso","Enraivecido","Revoltado","Colérico","Explosivo","Amargo","Odioso","Vingativo","Desprezo","Intolerante"],
      ["Fúria","Ódio","Fora de si","Irado","Violento","Implacável","Raivoso","Descontrolado","Possesso","Incendiado"],
    ],
  },
  {
    name: "Tristeza",
    baseColor: [50, 100, 200],
    rings: [
      ["Desanimado","Abatido","Chateado","Solitário","Saudoso","Cansado","Vazio","Melancólico","Desmotivado","Carente"],
      ["Triste","Magoado","Desapontado","Desiludido","Pesaroso","Impotente","Culpado","Arrependido","Envergonhado","Desamparado"],
      ["Deprimido","Devastado","Inconsolável","Humilhado","Lamentoso","Desesperançoso","Luto","Aflito","Angustiado","Oprimido"],
      ["Desespero","Desolado","Arrasado","Sem sentido","Profunda dor","Abismo","Desmoronado","Aniquilado","Trágado","Desfeito"],
    ],
  },
  {
    name: "Surpresa",
    baseColor: [255, 180, 0],
    rings: [
      ["Curioso","Intrigado","Atento","Desconfiado","Distraído","Incerto","Suspenso","Questionador","Inesperado","Desperto"],
      ["Surpreso","Espantado","Perplexo","Confuso","Impressionado","Sem palavras","Tocado","Estupefato","Chocado","Atônito"],
      ["Assombrado","Aboquiaberto","Alarmado","Estarrecido","Aterrorizado","Desnorteado","Incrédulo","Paralisado","Espanto","Perturbado"],
      ["Abalado","Em choque","Estatelado","Descompensado","Sobressalto","Colapso","Vértigo","Pânico súbito","Explodido","Inacreditável"],
    ],
  },
  {
    name: "Alegria",
    baseColor: [60, 180, 75],
    rings: [
      ["Sereno","Aliviado","Confortável","Tranquilo","Relaxado","Leve","Grato","Satisfeito","Bem","Ok"],
      ["Feliz","Alegre","Animado","Divertido","Esperançoso","Otimista","Entusiasmado","Interessado","Motivado","Empolgado"],
      ["Radiante","Encantado","Inspirado","Vibrante","Energizado","Maravilhado","Triunfante","Orgulhoso","Eufórico","Apaixonado"],
      ["Êxtase","Júbilo","Exaltação","Arrebatado","Extasiado","Plenitude","Transbordando","Incrível","Glorioso","Pico"],
    ],
  },
  {
    name: "Amor",
    baseColor: [230, 80, 150],
    rings: [
      ["Carinho","Afeto","Ternura","Acolhido","Cuidado","Compaixão","Amizade","Respeito","Gentileza","Conexão"],
      ["Amoroso","Apreciado","Valorizado","Confiante","Íntimo","Solidário","Protetor","Dedicado","Gratidão","Pertencimento"],
      ["Apaixonado","Devoto","Admiração","Encantamento","Desejo","Comprometido","Saudade","Reverência","Fascínio","União"],
      ["Adoração","Veneração","Entrega","Amor profundo","Fusão","Plenamente amado","Amor incondicional","Inteireza","Sagrado","Completude"],
    ],
  },
];

export const CONFIG = {
  NUM_RINGS: 4,
  CENTER_RATIO: 0.18,
  RING_GAP: 0,
  DIVIDER_WIDTH: 0.5,
  HIGHLIGHT_WIDTH: 3
};
