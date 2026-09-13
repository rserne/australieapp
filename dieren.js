// AustralieApp, dieren voor de waarnemingen. Alleen inhoud, de code staat in app.js.
// Controleer na een wijziging met  node check.js
//
// Groepen in de volgorde waarin ze op het scherm staan, elk met twee kleuren: een voor het lichte thema
// en een voor het donkere. Dit is een eigen palet, niet dat van de regio's: die kleuren zijn diep en
// gedempt omdat ze onder een foto liggen, en worden flets zodra je ze klein en opgelicht gebruikt.
const DIER_GROEPEN=[
 ["zoogdier","Zoogdieren","#A8380A","#FB923C"],
 ["vogel","Vogels","#116B33","#4ADE80"],
 ["reptiel","Reptielen","#A21C64","#F472B6"],
 ["klein","Spinnen en insecten","#6D28D9","#B18CFF"],
 ["zee","In zee","#0369A1","#38BDF8"],
 ["zoetwater","Zoetwater","#0C6058","#2DD4BF"],
 // Overig heeft geen vaste dieren. Hieronder valt wat via 'Iets anders gezien' is ingevoerd, met het
 // pootje als icoon. De app vult die groep zelf en toont hem alleen als er iets in staat.
 ["overig","Overig","#4B5563","#9CA3AF"]
];
// Per dier een sleutel (k, komt zo in de tabel waarnemingen), de naam op de knop (n) en de groep (g).
// Het icoon staat onder dezelfde sleutel in dieren-iconen.js. Met syn koppelt check.js de namen uit de
// wild-blokken van de dagen aan een dier hier, om te melden welke dieren geen eigen knop hebben.
// Dieren die je in Australië ook op je bord kunt krijgen, hebben eet:true. Die krijgen in de app een
// bestekknopje naast de teller, zodat de groep ook kan noteren dat ze het hebben gegeten.
// Een dier zonder icoon krijgt de eerste letter. De knop Iets anders gezien is vast en staat niet in deze lijst.
// In lange namen staat \u00AD, een zacht afbreekstreepje. Dat is onzichtbaar, tot de naam niet op de
// knop past. Dan breekt hij daar af met een streepje. Overal elders haalt de app het weg.
const DIEREN=[
// Zoogdieren
 {k:"kangoeroe",n:"Kangoeroe",g:"zoogdier",syn:["Rode reuzenkangoeroe","Kangoeroe en wallaby","Rode reuzenkangoeroe en emoe","Westelijke grijze reuzenkangoeroe en emoe","Zwartvoetrotskangoeroe"],eet:true},
 {k:"boomkangoeroe",n:"Boom\u00ADkangoeroe",g:"zoogdier",syn:["Boomkangoeroe","Lumholtz-boomkangoeroe"]},
 {k:"wallaby",n:"Wallaby",g:"zoogdier",syn:["Bennettwallaby","Zandwallaby","Rotswallaby","Moeraswallaby","Pademelon en Bennettwallaby","Pademelon","Zwarte bergkangoeroe"],eet:true},
 {k:"koala",n:"Koala",g:"zoogdier"},
 {k:"wombat",n:"Wombat",g:"zoogdier"},
 {k:"echidna",n:"Echidna",g:"zoogdier",syn:["Mierenegel"]},
 {k:"vogelbekdier",n:"Vogel\u00ADbekdier",g:"zoogdier"},
 {k:"dingo",n:"Dingo",g:"zoogdier"},
 {k:"quokka",n:"Quokka",g:"zoogdier"},
 {k:"tasmaanse-duivel",n:"Tasmaanse duivel",g:"zoogdier"},
 {k:"quoll",n:"Quoll",g:"zoogdier",syn:["Buidelmarter","Oostelijke buidelmarter","Gevlekte buidelmarter"]},
 {k:"bandicoet",n:"Bandicoet",g:"zoogdier",syn:["Quenda"]},
 {k:"possum",n:"Possum",g:"zoogdier",syn:["Ringstaartpossum","Voskoesoe","Kusuwaaierstaartbuidelrat"]},
 {k:"suikereekhoorn",n:"Suiker\u00ADeekhoorn",g:"zoogdier",syn:["Vliegende buidelmuis","Sugar glider"]},
 {k:"vliegende-vos",n:"Vliegende vos",g:"zoogdier",syn:["Grijskopvleerhond","Brilvleerhond","Vleerhond","Zuidelijke langvleugelvleermuis"]},
// Vogels. De emoe staat voorop, als lopende grap van de reis.
 {k:"emoe",n:"Emoe",g:"vogel",eet:true},
 {k:"kasuaris",n:"Kasuaris",g:"vogel",syn:["Helmkasuaris"]},
 {k:"kookaburra",n:"Kookaburra",g:"vogel",syn:["Blauwvleugelkookaburra","Lachvogel"]},
 {k:"kaketoe",n:"Kaketoe",g:"vogel",syn:["Raafkaketoe","Banks' raafkaketoe","Carnabys raafkaketoe","Geelstaartraafkaketoe","Witte kaketoe","Kaketoes en lori's","Zwarte kaketoe","Rosella's en kaketoes"]},
 {k:"galah",n:"Galah",g:"vogel",syn:["Rosékaketoe"]},
 {k:"regenbooglori",n:"Regenboog\u00ADlori",g:"vogel"},
 {k:"ekster",n:"Ekster",g:"vogel",syn:["Australische ekster","Zwartrugfluitvogel","Magpie"]},
 {k:"currawong",n:"Currawong",g:"vogel",syn:["Kraaifluitvogel"]},
 {k:"pelikaan",n:"Pelikaan",g:"vogel",syn:["Pelikaan en steltlopers"]},
 {k:"ibis",n:"Ibis",g:"vogel",syn:["Australische witte ibis"]},
 {k:"brolga",n:"Brolga",g:"vogel"},
 {k:"arend",n:"Arend",g:"vogel",syn:["Witbuikzeearend","Visarend","Wedgestaartarend","Zeearend"]},
 {k:"rosella",n:"Rosella",g:"vogel",syn:["Koningsparkiet","Pennantrosella en koningsparkiet","Rosella's en kaketoes","Parkiet"]},
 {k:"zebravink",n:"Zebravink",g:"vogel",syn:["Zebravink en spinifexduif","Zebravink en woestijnparkiet","Vink"]},
 {k:"dwergpinguin",n:"Dwerg\u00ADpinguïn",g:"vogel"},
// Reptielen. Eerst de krokodillen, dan de hagedissen, dan de slangen.
 {k:"zoutwaterkrokodil",n:"Zoutwater\u00ADkrokodil",g:"reptiel",eet:true},
 {k:"zoetwaterkrokodil",n:"Zoetwater\u00ADkrokodil",g:"reptiel"},
 {k:"varaan",n:"Varaan (goanna)",g:"reptiel",syn:["Goanna","Perentie","Reuzenvaraan"]},
 {k:"kraaghagedis",n:"Kraag\u00ADhagedis",g:"reptiel"},
 {k:"blauwtongskink",n:"Blauwtong\u00ADskink",g:"reptiel",syn:["Bobtail"]},
 {k:"skink",n:"Skink",g:"reptiel",syn:["Koningsskink en rifvissen"]},
 {k:"bruine-slang",n:"Bruine slang",g:"reptiel",syn:["Oostelijke bruine slang"]},
 {k:"roodbuikzwarte-slang",n:"Roodbuik\u00ADslang",g:"reptiel",syn:["Roodbuikzwarte slang"]},
 {k:"tijgerslang",n:"Tijgerslang",g:"reptiel"},
 {k:"python",n:"Python",g:"reptiel",syn:["Tapijtpython","Waterpython"]},
// Spinnen en insecten
 {k:"trechterspin",n:"Trechter\u00ADspin",g:"klein"},
 {k:"roodrugspin",n:"Redback",g:"klein",syn:["Roodrugspin"]},
 {k:"jachtkrabspin",n:"Huntsman-spin",g:"klein",syn:["Jachtkrabspin","Huntsman"]},
 {k:"wielwebspin",n:"Wielweb\u00ADspin",g:"klein"},
 {k:"termiet",n:"Termiet",g:"klein",syn:["Magnetische termiet"]},
 {k:"vlinder",n:"Vlinder",g:"klein",syn:["Ulysses-vlinder"]},
 {k:"cicade",n:"Cicade",g:"klein"},
 {k:"cicade-swift",n:"Swifty",g:"klein",syn:["Taylor Swift-cicade","Swift-cicade"]},
// In zee. Vanaf de kust of de boot, en onder water op het rif.
 {k:"bultrug",n:"Bultrug",g:"zee",syn:["Bultrug en zuidkaper","Walvis","Zuidkaper"]},
 {k:"zeehond",n:"Zeehond",g:"zee",syn:["Australische pelsrob","Pelsrob","Nieuw-Zeelandse zeebeer","Zeeleeuw"]},
 {k:"dolfijn",n:"Dolfijn",g:"zee",syn:["Tuimelaar","Dolfijn en walvis"]},
 {k:"doejong",n:"Dugong",g:"zee",syn:["Doejong"]},
 {k:"zeeschildpad",n:"Zee\u00ADschildpad",g:"zee",syn:["Groene zeeschildpad","Karetschildpad"]},
 {k:"zeeslang",n:"Zeeslang",g:"zee"},
 {k:"haai",n:"Haai",g:"zee",syn:["Witpuntrifhaai","Rifhaai"]},
 {k:"manta",n:"Manta",g:"zee",syn:["Reuzenmanta","Rog"]},
 {k:"kwal",n:"Kwal",g:"zee",syn:["Dooskwal","Irukandji"]},
 {k:"krab",n:"Krab",g:"zee",syn:["Mud crab","Modderkrab"],eet:true},
 {k:"anemoonvis",n:"Clownvis",g:"zee",syn:["Anemoonvis","Anemoonvis en doopvontschelp","Anemoonvis en reuzendoopvont"]},
 {k:"papegaaivis",n:"Papegaai\u00ADvis",g:"zee"},
 {k:"koraalbaars",n:"Koraal\u00ADbaars",g:"zee",syn:["Coral trout"],eet:true},
 {k:"trevally",n:"Trevally",g:"zee",eet:true},
 {k:"octopus",n:"Octopus",g:"zee",syn:["Blauwringoctopus"],eet:true},
 {k:"zeester",n:"Zeester",g:"zee"},
// Zoetwater. Rivieren, billabongs en zwemgaten. De barramundi hoort hier, niet in zee.
 {k:"barramundi",n:"Barramundi",g:"zoetwater",eet:true},
 {k:"zoetwaterschildpad",n:"Zoetwater\u00ADschildpad",g:"zoetwater"},
 {k:"kikker",n:"Kikker",g:"zoetwater",syn:["Australische boomkikker","Boomkikker"]},
 {k:"reuzenpad",n:"Reuzenpad",g:"zoetwater",syn:["Agapad","Cane toad"]}
];

// Prijzen. Te winnen met je eigen waarnemingen, persoonlijk. Ze blijven verborgen tot je ze hebt: de app
// laat geen grijze medailles of voortgang zien, alleen de kaart op het moment dat je hem verdient, en daarna
// de medaille in de Prijzenkast. De regels rekent app.js uit (verdiendePrijzen). Per prijs:
//   k      sleutel
//   n      naam op de kaart
//   kleur  de kleur van de kaart en de medaille (wit erop moet leesbaar blijven, dus donker genoeg)
//   ic     de tekening op de munt: een sleutel uit dieren-iconen.js, of een uit PRIJS_ICONEN hieronder
//   regel  wat je ervoor moet doen:
//            {soort:"eerste"}                         je allereerste waarneming
//            {soort:"set",dieren:[…],hoe}             al deze dieren (hoe: "gezien" of "gegeten", standaard gezien)
//            {soort:"keuze",dieren:[…],n}             n verschillende uit deze lijst
//            {soort:"groep",g,n}                      n verschillende soorten uit één groep
//            {soort:"soorten",n}                      n verschillende soorten, welke dan ook
//            {soort:"keer",dier,n}                    één dier n keer genoteerd
//            {soort:"reeks",n}                        n dagen achter elkaar iets gespot
//            {soort:"tijd",van,tot}                   iets gespot tussen twee tijdstippen (over middernacht mag)
//            {soort:"regios",n}                       iets gespot in n van de streken van de groepsreis
//   t      de tekst op de kaart. {rest} wordt het aantal andere prijzen.
// Volgorde is de volgorde waarin kaarten verschijnen als je er meerdere tegelijk verdient.
// Controleer na een wijziging met  node check.js  (bestaan de dieren, de groep, de tekening en de kleur).
const PRIJZEN=[
 {k:"eerste",n:"Eerste dier",kleur:"#0F6E56",ic:"poot",regel:{soort:"eerste"},
  t:"Je eerste waarneming staat erin. Er zijn nog {rest} prijzen te verdienen. Welke? Dat merk je vanzelf."},
 {k:"nachtwacht",n:"Nachtwacht",kleur:"#3B2E7E",ic:"possum",regel:{soort:"tijd",van:"19:00",tot:"05:30"},
  t:"Australië gaat na zonsondergang pas echt open: possums, suikereekhoorns en de vleerhonden die boven de stad uitvliegen. Jij was erbij."},
 {k:"lijstenmaker",n:"Turver",kleur:"#0369A1",ic:"turf",regel:{soort:"soorten",n:15},
  t:"Vijftien verschillende soorten geturfd. De lijst telt er 68, dus er is nog ruimte."},
 {k:"emoe",n:"Emoe!",kleur:"#A8380A",ic:"emoe",regel:{soort:"keer",dier:"emoe",n:1},
  t:"Een emoe. Hij rent harder dan jij, kijkt je aan alsof jij de vreemde bent, en jij zag hem het eerst."},
 {k:"tassie",n:"Tassie",kleur:"#014747",ic:"tasmaanse-duivel",regel:{soort:"set",dieren:["tasmaanse-duivel","wombat","wallaby"]},
  t:"Duivel, wombat en wallaby: de drie van Tasmanië, en jij hebt ze alle drie gezien."},
 {k:"walvis",n:"Walvisseizoen",kleur:"#0C4A6E",ic:"bultrug",regel:{soort:"set",dieren:["bultrug","dolfijn","zeehond"]},
  t:"Bultrug, dolfijn en zeehond. Oktober is trektijd langs de kust, en jij keek op het goede moment de goede kant op."},
 {k:"papegaaien",n:"Papegaaien",kleur:"#116B33",ic:"regenbooglori",regel:{soort:"keuze",dieren:["galah","kaketoe","regenbooglori","rosella"],n:3},
  t:"Drie soorten papegaaien, en dat zonder dierentuin. In Australië zijn ze gewoon de duiven."},
 {k:"koudbloedig",n:"Koudbloedig",kleur:"#7A1B4E",ic:"varaan",regel:{soort:"groep",g:"reptiel",n:4},
  t:"Vier verschillende reptielen. Skinks tellen mee, krokodillen ook, en jij hebt ze allemaal met rust gelaten."},
 {k:"loopvogels",n:"Loopvogels",kleur:"#5B3A0C",ic:"kasuaris",regel:{soort:"set",dieren:["emoe","kasuaris"]},
  t:"Emoe én kasuaris: de twee vogels van Australië die het vliegen hebben opgegeven. De kasuaris laat zich zelden zien, dus dit is er een om te onthouden."},
 {k:"bushtucker",n:"Bushtucker",kleur:"#B4410E",ic:"bestek",regel:{soort:"set",dieren:["kangoeroe","emoe","zoutwaterkrokodil"],hoe:"gegeten"},
  t:"Kangoeroe, emoe en krokodil, alle drie van het bord. De twee van het wapenschild, met de krokodil als toegift."},
 {k:"levend",n:"Gevaarlijk gezelschap",kleur:"#8A1C1C",ic:"roodrugspin",regel:{soort:"keuze",dieren:["zoutwaterkrokodil","bruine-slang","tijgerslang","roodbuikzwarte-slang","roodrugspin","trechterspin","haai","kwal","kasuaris","dingo"],n:3},
  t:"Drie van de dieren waar Australië berucht om is, gezien en niet aangeraakt. Precies zoals het hoort."},
 {k:"reeks",n:"Zeven op een rij",kleur:"#6D28D9",ic:"zeven",regel:{soort:"reeks",n:7},
  t:"Zeven dagen achter elkaar iets gespot. Dat is geen geluk meer, dat is opletten."},
 {k:"australie",n:"Heel Australië",kleur:"#A21C64",ic:"australie",regel:{soort:"regios",n:6},
  t:"In zes van de zeven streken van de reis iets gespot. Van de kust tot het Rode Centrum, en overal keek je om je heen."},
 {k:"grote-lijst",n:"Grote lijst",kleur:"#0C6058",ic:"ster",regel:{soort:"soorten",n:30},
  t:"Dertig verschillende soorten. Bijna de helft van de lijst, in één reis. Dit is de prijs voor de echte spotter."},
 {k:"zeldzaam",n:"Zeldzaam",kleur:"#365314",ic:"boomkangoeroe",regel:{soort:"keuze",dieren:["boomkangoeroe","quoll"],n:1},
  t:"Boomkangoeroe of quoll: twee dieren die bijna niemand te zien krijgt. Jij wel."},
 {k:"grote-vijf",n:"De grote vijf",kleur:"#8A5A00",ic:"koala",regel:{soort:"set",dieren:["kangoeroe","koala","wombat","echidna","vogelbekdier"]},
  t:"Kangoeroe, koala, wombat, echidna en vogelbekdier: de vijf waar iedereen voor komt. Jij hebt ze alle vijf gezien."}
];
// Tekeningen voor prijzen zonder dier, in dezelfde stijl als dieren-iconen.js: één kleur, fill="currentColor".
// Vak van 100 bij 100. Het pootje en het bestek staan hier los van de kleine varianten in app.js, zodat ze
// op de munt even zwaar ogen als de dieren. De turfstreepjes zijn als lijnen getekend (stroke), de rest gevuld.
const PRIJS_ICONEN={
 poot:'<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><ellipse cx="27" cy="34" rx="9" ry="12"/><ellipse cx="73" cy="34" rx="9" ry="12"/><ellipse cx="40" cy="18" rx="8" ry="11"/><ellipse cx="60" cy="18" rx="8" ry="11"/><path d="M50 43c-15 0-28 12-28 24 0 8 6 13 14 13 5 0 9-2 14-2s9 2 14 2c8 0 14-5 14-13C78 55 65 43 50 43Z"/></svg>',
 bestek:'<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="M16 10h6v22a3 3 0 0 0 6 0V10h6v22a3 3 0 0 0 6 0V10h6v24c0 7-4 12-11 14v42h-8V48c-7-2-11-7-11-14Z"/><path d="M60 10c11 3 20 13 20 26 0 9-5 15-12 18v36h-8V10Z"/></svg>',
 turf:'<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" aria-hidden="true"><path d="M22 19v62M40 19v62M58 19v62M76 19v62"/><path d="M10 72 90 27"/></svg>',
 ster:'<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="M50 8l12.4 27.4L92 39l-22 20.3L75.7 89 50 74.2 24.3 89 30 59.3 8 39l29.6-3.6Z"/></svg>',
 zeven:'<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="M20 14h60v13L47 88H31l30-61H20Z"/></svg>',
 australie:'<svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="M35.5 10.9L29.8 14.7L25.9 18.8L24.3 23.5L15.7 30.3L5.0 34.7L3.3 46.7L6.2 55.3L9.0 64.7L7.4 71.7L14.0 73.5L23.6 70.3L38.1 64.7L45.2 63.2L51.6 65.0L56.2 73.5L63.1 73.2L67.8 82.3L75.0 85.0L78.3 81.7L81.9 85.6L90.4 80.8L93.3 70.3L99.0 54.7L97.6 51.4L91.6 39.4L88.5 32.6L82.8 27.3L80.4 20.3L79.0 16.2L75.0 8.8L72.6 2.1L70.2 10.3L69.0 19.1L65.5 22.6L60.7 17.6L57.1 14.7L58.8 6.5L54.7 5.9L48.8 3.5L44.7 7.1L41.6 13.2L38.6 14.4Z"/><path d="M77.6 90.0L86.4 90.8L85.7 97.6L80.9 98.8L77.8 94.1Z"/></svg>'
};
