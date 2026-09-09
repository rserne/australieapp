// AustralieApp, dieren voor de waarnemingen. Alleen inhoud, de code staat in app.js.
// Controleer na een wijziging met  node check.js
//
// Groepen in de volgorde waarin ze op het scherm staan.
const DIER_GROEPEN=[
 ["zoogdier","Zoogdieren"],["vogel","Vogels"],["reptiel","Reptielen"],["slang","Slangen"],["spin","Spinnen"],
 ["insect","Insecten"],["zee","In zee"],["vis","Vissen"],["zeeoverig","Ander zeeleven"],["zoetwater","Zoetwater"]
];
// Per dier een sleutel (k, komt zo in de tabel waarnemingen), de naam op de knop (n) en de groep (g).
// Het icoon staat onder dezelfde sleutel in dieren-iconen.js. Met syn koppelt de app de namen uit de
// wild-blokken van de dagen aan een dier hier, zodat de teller op de dagpagina weet welk dier het is.
// Een dier zonder icoon krijgt de eerste letter. De knop Ander dier is vast en staat niet in deze lijst.
const DIEREN=[
 // Zoogdieren
 {k:"kangoeroe",n:"Kangoeroe",g:"zoogdier",syn:["Rode reuzenkangoeroe","Kangoeroe en wallaby","Rode reuzenkangoeroe en emoe","Westelijke grijze reuzenkangoeroe en emoe","Zwartvoetrotskangoeroe","Lumholtz-boomkangoeroe"]},
 {k:"wallaby",n:"Wallaby",g:"zoogdier",syn:["Bennettwallaby","Zandwallaby","Rotswallaby","Moeraswallaby","Pademelon en Bennettwallaby","Pademelon"]},
 {k:"koala",n:"Koala",g:"zoogdier"},
 {k:"wombat",n:"Wombat",g:"zoogdier"},
 {k:"echidna",n:"Echidna",g:"zoogdier",syn:["Mierenegel"]},
 {k:"vogelbekdier",n:"Vogelbekdier",g:"zoogdier"},
 {k:"dingo",n:"Dingo",g:"zoogdier"},
 {k:"quokka",n:"Quokka",g:"zoogdier"},
 {k:"tasmaanse-duivel",n:"Tasmaanse duivel",g:"zoogdier"},
 {k:"numbat",n:"Numbat",g:"zoogdier"},
 {k:"bilby",n:"Bilby",g:"zoogdier"},
 {k:"bandicoet",n:"Bandicoet",g:"zoogdier"},
 {k:"possum",n:"Possum",g:"zoogdier",syn:["Ringstaartpossum","Voskoesoe"]},
 {k:"suikereekhoorn",n:"Suikereekhoorn",g:"zoogdier",syn:["Vliegende buidelmuis","Sugar glider"]},
 {k:"vliegende-vos",n:"Vliegende vos",g:"zoogdier",syn:["Grijskopvleerhond","Brilvleerhond","Vleerhond","Zuidelijke langvleugelvleermuis"]},
 {k:"emoe",n:"Emoe",g:"zoogdier"},
 // Vogels
 {k:"kookaburra",n:"Kookaburra",g:"vogel",syn:["Blauwvleugelkookaburra","Lachvogel"]},
 {k:"kaketoe",n:"Kaketoe",g:"vogel",syn:["Raafkaketoe","Banks' raafkaketoe","Carnabys raafkaketoe","Geelstaartraafkaketoe","Witte kaketoe","Kaketoes en lori's","Zwarte kaketoe"]},
 {k:"galah",n:"Galah",g:"vogel",syn:["Rosékaketoe"]},
 {k:"regenbooglori",n:"Regenbooglori",g:"vogel"},
 {k:"ekster",n:"Ekster",g:"vogel",syn:["Australische ekster","Zwartrugfluitvogel","Magpie"]},
 {k:"currawong",n:"Currawong",g:"vogel",syn:["Kraaifluitvogel"]},
 {k:"kasuaris",n:"Kasuaris",g:"vogel",syn:["Helmkasuaris"]},
 {k:"pelikaan",n:"Pelikaan",g:"vogel",syn:["Pelikaan en steltlopers"]},
 {k:"ibis",n:"Ibis",g:"vogel",syn:["Australische witte ibis"]},
 {k:"brolga",n:"Brolga",g:"vogel"},
 {k:"dwergpinguin",n:"Dwergpinguïn",g:"vogel"},
 // Reptielen
 {k:"zoutwaterkrokodil",n:"Zoutwaterkrokodil",g:"reptiel"},
 {k:"zoetwaterkrokodil",n:"Zoetwaterkrokodil",g:"reptiel"},
 {k:"varaan",n:"Varaan (goanna)",g:"reptiel",syn:["Goanna","Perentie","Reuzenvaraan"]},
 {k:"kraaghagedis",n:"Kraaghagedis",g:"reptiel"},
 {k:"blauwtongskink",n:"Blauwtongskink",g:"reptiel",syn:["Bobtail"]},
 {k:"skink",n:"Skink",g:"reptiel"},
 // Slangen
 {k:"bruine-slang",n:"Bruine slang",g:"slang",syn:["Oostelijke bruine slang"]},
 {k:"roodbuikzwarte-slang",n:"Roodbuikslang",g:"slang",syn:["Roodbuikzwarte slang"]},
 {k:"tijgerslang",n:"Tijgerslang",g:"slang"},
 {k:"python",n:"Python",g:"slang",syn:["Tapijtpython","Waterpython"]},
 {k:"doodsadder",n:"Doodsadder",g:"slang"},
 {k:"taipan",n:"Taipan",g:"slang"},
 // Spinnen
 {k:"trechterspin",n:"Trechterspin",g:"spin"},
 {k:"roodrugspin",n:"Redback",g:"spin",syn:["Roodrugspin"]},
 {k:"witstaartspin",n:"Witstaartspin",g:"spin"},
 {k:"jachtkrabspin",n:"Huntsman-spin",g:"spin",syn:["Jachtkrabspin","Huntsman"]},
 {k:"wielwebspin",n:"Wielwebspin",g:"spin"},
 {k:"muisspin",n:"Muisspin",g:"spin"},
 // Insecten
 {k:"mier",n:"Mier",g:"insect"},
 {k:"termiet",n:"Termiet",g:"insect",syn:["Magnetische termiet"]},
 {k:"vlinder",n:"Vlinder",g:"insect",syn:["Ulysses-vlinder"]},
 {k:"libel",n:"Libel",g:"insect"},
 {k:"cicade",n:"Cicade",g:"insect"},
 {k:"wandelende-tak",n:"Wandelende tak",g:"insect"},
 // In zee
 {k:"bultrug",n:"Bultrug",g:"zee",syn:["Bultrug en zuidkaper","Walvis"]},
 {k:"dolfijn",n:"Dolfijn",g:"zee",syn:["Tuimelaar"]},
 {k:"haai",n:"Haai",g:"zee",syn:["Witpuntrifhaai","Rifhaai"]},
 {k:"doejong",n:"Dugong",g:"zee",syn:["Doejong"]},
 {k:"zeeschildpad",n:"Zeeschildpad",g:"zee",syn:["Groene zeeschildpad","Karetschildpad"]},
 {k:"manta",n:"Manta",g:"zee",syn:["Reuzenmanta"]},
 // Vissen
 {k:"barramundi",n:"Barramundi",g:"vis"},
 {k:"anemoonvis",n:"Clownvis",g:"vis",syn:["Anemoonvis","Anemoonvis en doopvontschelp","Anemoonvis en reuzendoopvont"]},
 {k:"papegaaivis",n:"Papegaaivis",g:"vis"},
 {k:"koraalbaars",n:"Koraalbaars",g:"vis",syn:["Coral trout"]},
 {k:"trevally",n:"Trevally",g:"vis"},
 {k:"makreel",n:"Makreel",g:"vis"},
 // Ander zeeleven
 {k:"zeeslang",n:"Zeeslang",g:"zeeoverig"},
 {k:"kwal",n:"Kwal",g:"zeeoverig",syn:["Dooskwal","Irukandji"]},
 {k:"octopus",n:"Octopus",g:"zeeoverig",syn:["Blauwringoctopus"]},
 {k:"inktvis",n:"Inktvis",g:"zeeoverig"},
 {k:"zeester",n:"Zeester",g:"zeeoverig"},
 // Zoetwater
 {k:"zoetwaterschildpad",n:"Zoetwaterschildpad",g:"zoetwater"},
 {k:"kikker",n:"Kikker",g:"zoetwater",syn:["Australische boomkikker","Boomkikker"]},
 {k:"reuzenpad",n:"Reuzenpad",g:"zoetwater",syn:["Agapad","Cane toad"]},
 {k:"yabby",n:"Yabby",g:"zoetwater",syn:["Zoetwaterkreeft"]},
 {k:"krab",n:"Krab",g:"zoetwater",syn:["Mud crab","Modderkrab"]},
 {k:"marron",n:"Marron",g:"zoetwater"}
];
