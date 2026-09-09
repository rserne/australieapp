// AustralieApp, dieren voor de waarnemingen. Alleen inhoud, de code staat in app.js.
// Controleer na een wijziging met  node check.js
//
// Groepen in de volgorde waarin ze op het scherm staan.
const DIER_GROEPEN=[
 ["zoogdier","Zoogdieren"],["vogel","Vogels"],["reptiel","Reptielen"],["slang","Slangen"],["klein","Spinnen en insecten"],
 ["zee","In zee"],["rif","Op het rif"],["zoetwater","Zoetwater"]
];
// Per dier een sleutel (k, komt zo in de tabel waarnemingen), de naam op de knop (n) en de groep (g).
// Het icoon staat onder dezelfde sleutel in dieren-iconen.js. Met syn koppelt check.js de namen uit de
// wild-blokken van de dagen aan een dier hier, om te melden welke dieren geen eigen knop hebben.
// Een dier zonder icoon krijgt de eerste letter. De knop Iets anders gezien is vast en staat niet in deze lijst.
// In lange namen staat \u00AD, een zacht afbreekstreepje. Dat is onzichtbaar, tot de naam niet op de
// knop past. Dan breekt hij daar af met een streepje. Overal elders haalt de app het weg.
const DIEREN=[
// Zoogdieren
 {k:"kangoeroe",n:"Kangoeroe",g:"zoogdier",syn:["Rode reuzenkangoeroe","Kangoeroe en wallaby","Rode reuzenkangoeroe en emoe","Westelijke grijze reuzenkangoeroe en emoe","Zwartvoetrotskangoeroe","Lumholtz-boomkangoeroe"]},
 {k:"wallaby",n:"Wallaby",g:"zoogdier",syn:["Bennettwallaby","Zandwallaby","Rotswallaby","Moeraswallaby","Pademelon en Bennettwallaby","Pademelon"]},
 {k:"koala",n:"Koala",g:"zoogdier"},
 {k:"wombat",n:"Wombat",g:"zoogdier"},
 {k:"echidna",n:"Echidna",g:"zoogdier",syn:["Mierenegel"]},
 {k:"vogelbekdier",n:"Vogel\u00ADbekdier",g:"zoogdier"},
 {k:"dingo",n:"Dingo",g:"zoogdier"},
 {k:"quokka",n:"Quokka",g:"zoogdier"},
 {k:"tasmaanse-duivel",n:"Tasmaanse duivel",g:"zoogdier"},
 {k:"bandicoet",n:"Bandicoet",g:"zoogdier"},
 {k:"possum",n:"Possum",g:"zoogdier",syn:["Ringstaartpossum","Voskoesoe"]},
 {k:"suikereekhoorn",n:"Suiker\u00ADeekhoorn",g:"zoogdier",syn:["Vliegende buidelmuis","Sugar glider"]},
 {k:"vliegende-vos",n:"Vliegende vos",g:"zoogdier",syn:["Grijskopvleerhond","Brilvleerhond","Vleerhond","Zuidelijke langvleugelvleermuis"]},
// Vogels. De emoe staat voorop en wordt in de app geel getekend, als lopende grap van de reis.
 {k:"emoe",n:"Emoe",g:"vogel"},
 {k:"kasuaris",n:"Kasuaris",g:"vogel",syn:["Helmkasuaris"]},
 {k:"kookaburra",n:"Kookaburra",g:"vogel",syn:["Blauwvleugelkookaburra","Lachvogel"]},
 {k:"kaketoe",n:"Kaketoe",g:"vogel",syn:["Raafkaketoe","Banks' raafkaketoe","Carnabys raafkaketoe","Geelstaartraafkaketoe","Witte kaketoe","Kaketoes en lori's","Zwarte kaketoe"]},
 {k:"galah",n:"Galah",g:"vogel",syn:["Rosékaketoe"]},
 {k:"regenbooglori",n:"Regenboog\u00ADlori",g:"vogel"},
 {k:"ekster",n:"Ekster",g:"vogel",syn:["Australische ekster","Zwartrugfluitvogel","Magpie"]},
 {k:"currawong",n:"Currawong",g:"vogel",syn:["Kraaifluitvogel"]},
 {k:"pelikaan",n:"Pelikaan",g:"vogel",syn:["Pelikaan en steltlopers"]},
 {k:"ibis",n:"Ibis",g:"vogel",syn:["Australische witte ibis"]},
 {k:"brolga",n:"Brolga",g:"vogel"},
 {k:"dwergpinguin",n:"Dwerg\u00ADpinguïn",g:"vogel"},
// Reptielen
 {k:"zoutwaterkrokodil",n:"Zoutwater\u00ADkrokodil",g:"reptiel"},
 {k:"zoetwaterkrokodil",n:"Zoetwater\u00ADkrokodil",g:"reptiel"},
 {k:"varaan",n:"Varaan (goanna)",g:"reptiel",syn:["Goanna","Perentie","Reuzenvaraan"]},
 {k:"kraaghagedis",n:"Kraag\u00ADhagedis",g:"reptiel"},
 {k:"blauwtongskink",n:"Blauwtong\u00ADskink",g:"reptiel",syn:["Bobtail"]},
 {k:"skink",n:"Skink",g:"reptiel"},
// Slangen
 {k:"bruine-slang",n:"Bruine slang",g:"slang",syn:["Oostelijke bruine slang"]},
 {k:"roodbuikzwarte-slang",n:"Roodbuik\u00ADslang",g:"slang",syn:["Roodbuikzwarte slang"]},
 {k:"tijgerslang",n:"Tijgerslang",g:"slang"},
 {k:"python",n:"Python",g:"slang",syn:["Tapijtpython","Waterpython"]},
// Spinnen en insecten
 {k:"trechterspin",n:"Trechter\u00ADspin",g:"klein"},
 {k:"roodrugspin",n:"Redback",g:"klein",syn:["Roodrugspin"]},
 {k:"jachtkrabspin",n:"Huntsman-spin",g:"klein",syn:["Jachtkrabspin","Huntsman"]},
 {k:"wielwebspin",n:"Wielweb\u00ADspin",g:"klein"},
 {k:"termiet",n:"Termiet",g:"klein",syn:["Magnetische termiet"]},
 {k:"vlinder",n:"Vlinder",g:"klein",syn:["Ulysses-vlinder"]},
 {k:"cicade",n:"Cicade",g:"klein"},
// In zee. Wat je vanaf de kust, de boot of het strand ziet.
 {k:"bultrug",n:"Bultrug",g:"zee",syn:["Bultrug en zuidkaper","Walvis"]},
 {k:"dolfijn",n:"Dolfijn",g:"zee",syn:["Tuimelaar"]},
 {k:"doejong",n:"Dugong",g:"zee",syn:["Doejong"]},
 {k:"zeeschildpad",n:"Zee\u00ADschildpad",g:"zee",syn:["Groene zeeschildpad","Karetschildpad"]},
 {k:"zeeslang",n:"Zeeslang",g:"zee"},
 {k:"haai",n:"Haai",g:"zee",syn:["Witpuntrifhaai","Rifhaai"]},
 {k:"manta",n:"Manta",g:"zee",syn:["Reuzenmanta"]},
 {k:"kwal",n:"Kwal",g:"zee",syn:["Dooskwal","Irukandji"]},
 {k:"krab",n:"Krab",g:"zee",syn:["Mud crab","Modderkrab"]},
// Op het rif. Wat je ziet als je snorkelt.
 {k:"anemoonvis",n:"Clownvis",g:"rif",syn:["Anemoonvis","Anemoonvis en doopvontschelp","Anemoonvis en reuzendoopvont"]},
 {k:"papegaaivis",n:"Papegaai\u00ADvis",g:"rif"},
 {k:"koraalbaars",n:"Koraal\u00ADbaars",g:"rif",syn:["Coral trout"]},
 {k:"trevally",n:"Trevally",g:"rif"},
 {k:"octopus",n:"Octopus",g:"rif",syn:["Blauwringoctopus"]},
 {k:"zeester",n:"Zeester",g:"rif"},
// Zoetwater. Rivieren, billabongs en zwemgaten. De barramundi hoort hier, niet in zee.
 {k:"barramundi",n:"Barramundi",g:"zoetwater"},
 {k:"zoetwaterschildpad",n:"Zoetwater\u00ADschildpad",g:"zoetwater"},
 {k:"kikker",n:"Kikker",g:"zoetwater",syn:["Australische boomkikker","Boomkikker"]},
 {k:"reuzenpad",n:"Reuzenpad",g:"zoetwater",syn:["Agapad","Cane toad"]}
];
