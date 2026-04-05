// Türkçe (Turkish)
export default {
  name: "Türkçe",
  ui: {
    sidebarTitle: "Seçilen Duygular",
    emptySelection: "Henüz duygu seçilmedi",
    btnClear: "Temizle",
    btnClearAll: "Tümünü Temizle",
    btnShareFeelings: "Duyguları Paylaş",
    btnSearch: "Duyguları ara",
    searchPlaceholder: "Duygu ara...",
    btnCopy: "Kopyala",
    btnCopyText: "Metni kopyala",
    btnCopyLink: "Bağlantıyı kopyala",
    btnExportPng: "PNG İndir",
    btnExportPdf: "PDF İndir",
    toastCopied: "Liste kopyalandı!",
    shareIntro: "Duygularıma bak",
    pdfTitle: "Duygu Çarkı – PDF",
    pdfListTitle: "Seçilen Duygular",
    appTitle: "Duygu Çarkı",
    appDescription: "Hissettiklerinizi üzerlerine tıklayarak seçin. Nasıl hissettiğinizi kaydetmek için dışa aktarın veya paylaşın.",
    uppercaseToggle: "Her şeyi büyük harflerle göster",
    exportDateLabel: "Tarih ve saat",
    btnShare: "🔗 Paylaş",
    pdfInteractiveLink: "Etkileşimli modda raporu açmak için buraya tıklayın"
  },
  sectors: [
    {
      name: "Korku",
      baseColor: [120, 0, 180],
      rings: [
        ["endişeli","güvensiz","tedirgin","gergin","korkmuş","huzursuz","sinirli","tetikte","savunmasız","ihtiyatlı"],
        ["kaygılı","korkutulmuş","tehdit altında","rahatsız","baskı altında","uyanık","şaşkın","korumasız","tehlikede","kararsız"],
        ["dehşete düşmüş","panikli","şok olmuş","yıkılmış","çılgın","umutsuz","titreyen","travmalı","yapayalnız","kontrolsüz"],
        ["panik","saf dehşet","hezeyan","tam panik","çöküş","umutsuzluk","uçurum","kaçış","yıkım","mutlak korku"],
      ],
    },
    {
      name: "Öfke",
      baseColor: [220, 40, 40],
      rings: [
        ["sinirli","rahatsız","kızgın","sabırsız","somurtkan","heyecanlı","hayal kırıklığı","bıkkın","kuşkucu","güvensiz"],
        ["kızgın","öfkeli","aşağılanmış","düşmanca","öfkeli","saldırgan","çileden çıkmış","kıskanç","kinci","saldırgan"],
        ["kudurmuş","çılgına dönmüş","isyankâr","patlayıcı","acı","kindar","nefret dolu","intikamcı","aşağılayan","fanatik"],
        ["hiddet","nefret","kendinden geçmiş","çılgın","şiddetli","acımasız","alevlenmiş","saplantılı","delirmiş","kızışmış"],
      ],
    },
    {
      name: "Üzüntü",
      baseColor: [50, 100, 200],
      rings: [
        ["cesaretsiz","karamsar","mutsuz","yalnız","özlem dolu","yorgun","boş","hüzünlü","kayıtsız","muhtaç"],
        ["üzgün","incinmiş","hayal kırıklığına uğramış","hayal kırıklığı","yaslı","çaresiz","suçlu","pişman","utanmış","terk edilmiş"],
        ["depresif","perişan","teselli edilemez","küçük düşürülmüş","matem","karamsar","kayıp","acı çeken","azap","bastırılmış"],
        ["çaresizlik","ıssızlık","paramparça","anlamsız","derin acı","uçurum","çökmüş","yok edilmiş","yutulmuş","kırılmış"],
      ],
    },
    {
      name: "Şaşkınlık",
      baseColor: [255, 180, 0],
      rings: [
        ["meraklı","ilgili","düşünceli","şüpheci","dalgın","emin değil","gizemli","sorgulayan","beklenmedik","uyanmış"],
        ["şaşırmış","hayret","şaşkın","kafası karışık","etkilenmiş","sözsüz","büyülenmiş","sarsılmış","bunalmış","hazırlıksız yakalanmış"],
        ["afallamış","ağzı açık","apışmış","donmuş","huşu içinde","kaybolmuş","inanılmaz","felç olmuş","hayranlık","çalkantılı"],
        ["sarsıntı","şok","bayılma","dağılma","şok","çöküş","baş dönmesi","ani korku","patlama","aklın almaz"],
      ],
    },
    {
      name: "Neşe",
      baseColor: [60, 180, 75],
      rings: [
        ["sakin","rahatlamış","rahat","dengeli","tasasız","hafif","minnettar","memnun","iyi","tamam"],
        ["mutlu","sevinçli","heyecanlı","eğlenceli","umutlu","iyimser","coşkulu","ilgili","ilham almış","heyecan dolu"],
        ["ışıldayan","büyülenmiş","motive","canlı","enerjik","hayret","muzaffer","gururlu","coşkun","tutkulu"],
        ["vecit","sevinç","mutluluk","büyülenmiş","sonsuz mutluluk","doluluk","taşan","muhteşem","görkemli","doruk"],
      ],
    },
    {
      name: "Sevgi",
      baseColor: [230, 80, 150],
      rings: [
        ["şefkat","bağlılık","şefkat","hoş karşılama","ilgi","merhamet","dostluk","saygı","nezaket","bağ"],
        ["sevilen","değer verilen","kıymetli","güvenen","samimi","empatik","koruyucu","adanmış","müteşekkir","aidiyet"],
        ["tutkulu","kendini adamış","hayran","büyülenmiş","arzu","sadık","özlem","saygı","cazibe","kavuşma"],
        ["tapınma","ibadet","adanmışlık","derin sevgi","kaynaşma","birlik","koşulsuz sevgi","mükemmellik","kutsallık","bütünlük"],
      ],
    },
  ]
};
