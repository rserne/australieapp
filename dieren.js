// AustralieApp, dieren voor de waarnemingen. Alleen inhoud, de code staat in app.js.
// Controleer na een wijziging met  node check.js
//
// Groepen in de volgorde waarin ze op het scherm staan, elk met twee kleuren: een voor het lichte thema
// en een voor het donkere. Dit is een eigen palet, niet dat van de regio's: die kleuren zijn diep en
// gedempt omdat ze onder een foto liggen, en worden flets zodra je ze klein en opgelicht gebruikt.
const DIER_GROEPEN=[
 ["zoogdier","Zoogdieren","#C2410C","#FB923C"],
 ["vogel","Vogels","#15803D","#4ADE80"],
 ["reptiel","Reptielen","#A21C64","#F472B6"],
 ["klein","Spinnen en insecten","#B45309","#FBBF24"],
 ["zee","In zee","#0369A1","#38BDF8"],
 ["zoetwater","Zoetwater","#0F766E","#2DD4BF"],
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
