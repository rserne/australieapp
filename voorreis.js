// AustralieApp, programma van de voorreis. Alleen inhoud, de code staat in app.js.
// Controleer na een wijziging met  node check.js
//
// Elke dag is hetzelfde dagobject als in DAYS (reis.js), met drie verschillen.
//  - datum:"2026-09-20" in plaats van n:. Zo verschuift het programma niet als VOORREIS in reis.js verandert.
//  - Geen r, want de voorreis heeft één vaste foto en kleur (BUITEN in reis.js).
//  - Alleen t (titel), p (plaats) en body (alinea's) zijn verplicht. Optioneel, net als bij de groepsreis,
//    zijn k (vlucht, bus, auto, excursie, vrij), tz (8 t/m 11, null op een vliegdag), h (hotel uit HOTELGEO),
//    temp, fl (vluchten), agenda, note, tip, prac, wild en emoe, food, rest en rnote (restaurants uit RDATA).
// Een datum die hier niet staat, blijft een dag met alleen notities. Een lege lijst is de voorreis zoals hij was.
// Een excursie of koffer-item voor een voorreisdag zet je in EXC of PACK (reis.js) met de datum in plaats van
// het dagnummer, dus ["Snorkelen op het rif", "2026-09-20", "AUD 250", "…"].
// Boekingscodes en polisnummers horen hier niet, want de repository is openbaar. Die gaan in een Ticket-notitie.
//
// 26 tot en met 30 september staan er bewust nog niet in, want het Kakadu-programma is nog niet bekend. Die
// dagen blijven tot dan notitiedagen. Hotels zijn onbekend, dus er staat nergens een h en de restaurants
// hebben geen looptijd (null). Zodra de adressen er zijn, kan dat erbij.
const VOORDAGEN=[

{datum:"2026-09-18",k:"vlucht",t:"Vlucht Amsterdam – Singapore",p:"Schiphol → Singapore",tz:null,
 fl:[["SQ 323","Amsterdam Schiphol","Singapore Changi","10.20","05.30 (19 sep, lokale tijd)","Singapore Airlines · 25 kg ruim, 7 kg cabine"]],
 body:[
  "Vertrek om 10.20 uur vanaf Schiphol. In ruim twaalf uur vlieg je naar Singapore, waar je morgenochtend om 05.30 uur lokale tijd landt. De klok gaat zes uur vooruit. In Changi heb je vier uur voor je doorvliegt naar Sydney, ruim genoeg om te douchen in de transitzone en ergens rustig te ontbijten.",
  "Je bent bijna twee weken eerder in Australië dan de groep, die pas op 1 oktober vertrekt. De reis loopt via Sydney en Cairns naar Arnhemland en Kakadu, en eindigt op 1 oktober weer in Sydney."
 ],
 prac:["Vul de inreiskaart eerlijk in. Australië is streng op biosecurity. Ook een appel of zakje noten uit het vliegtuig moet je aangeven. Aangeven kost niets, niet-aangeven levert een boete op van honderden dollars.",
  "Hout, zaden, veren en ongewassen wandelschoenen met modder eraan vallen er ook onder. Borstel je schoenen thuis schoon.",
  "De ruime bagagegrens van Singapore Airlines geldt niet op je binnenlandse vluchten met Virgin Australia en Airnorth. Kijk vóór vertrek op je ticket hoeveel je daar mee mag. Bijbetalen op de luchthaven is duur."]},

{datum:"2026-09-19",k:"vlucht",t:"Aankomst Sydney",p:"Singapore → Sydney",tz:10,temp:"11–20°",
 fl:[["SQ 211","Singapore Changi, terminal 3","Sydney Kingsford Smith, terminal 1","09.35","19.30","Singapore Airlines · 25 kg"]],
 body:[
  "Om 19.30 uur land je in Sydney, na een tweede etappe van ruim zeven uur. Met douane en bagage ben je rond 20.30 uur buiten. Het is hier nog winter en 's avonds fris, dus houd een trui of jack bovenin je handbagage.",
  "Lang uitslapen zit er niet in, want morgenochtend vlieg je alweer om 06.50 uur door naar Cairns. Slaap dus dicht bij het vliegveld en houd het vanavond kort."
 ],
 note:"Je vertrekt morgen vanaf terminal 2, de binnenlandse terminal, en niet vanaf de terminal waar je nu aankomt. Tussen T1 en T2 rijdt de treinshuttle van twee minuten en de gratis T-Bus. Reken erop dat je om 05.15 uur bij de bagagebalie moet staan.",
 prac:["Je hebt geen Opal-kaart nodig. In Sydney check je in en uit met je bankpas of telefoon, op bus, trein, tram én veerboot.",
  "Kraanwater is overal drinkbaar en gratis bijvullen kan bij vrijwel elk café. Vul je fles pas na de securitycontrole."]},

{datum:"2026-09-20",k:"vlucht",t:"Naar Cairns en het rif",p:"Cairns",tz:10,temp:"20–29°",
 fl:[["VA 1409","Sydney, terminal 2","Cairns, terminal 2","06.50","10.02","Virgin Australia · binnenlandse vlucht"]],
 agenda:[["06.50","Vlucht naar Cairns","Virgin Australia VA 1409, drie uur en een kwartier, aankomst 10.02 uur."],
  ["12.30","Snorkelexcursie naar het Great Barrier Reef","De boten vertrekken vanaf de Reef Fleet Terminal aan de Marlin Marina, tien minuten van de Esplanade."]],
 body:[
  "Van winter naar de tropen in drie uur. In Cairns is het rond de dertig graden en vochtig. Je landt om 10.02 uur en om 12.30 uur vaar je al uit naar het grootste koraalrif ter wereld.",
  "Onder water zie je koraaltuinen, schildpadden en honderden soorten vis. September valt nog vóór het echte kwallenseizoen, maar het pak dat de boot aanbiedt draag je toch. Het beschermt tegen de zon en is beter voor het koraal dan zonnebrand."
 ],
 tip:"Tussen landen en uitvaren zitten tweeënhalf uur, inclusief bagage en de rit naar de haven. Houd je snorkelspullen en zonnebrand bovenin je koffer, dan hoef je niet te zoeken.",
 prac:["Op rifexcursies komt vrijwel altijd een aparte rifheffing bovenop de prijs, zo'n acht dollar per persoon per dag. Die zit meestal níét in het geboekte bedrag, dus houd contant of pas bij de hand.",
  "Het is anderhalf tot twee uur varen over open zee. Zeeziektepillen werken alleen als je ze een uur vóór vertrek neemt, niet aan boord.",
  "Neem een lange broek of pareo mee voor aan dek. De weerkaatsing op zee verbrandt je in een half uur, ook met bewolking."],
 wild:[["Groene zeeschildpad","Bij het buitenrif zwemmen ze rustig langs de koraalranden. Bijna elke snorkelaar ziet er minstens een.",3],
  ["Anemoonvis en doopvontschelp","Clownvissen in hun anemoon en schelpen van wel een meter breed, allebei op ondiepe plekken bij het platform.",3],
  ["Napoleonvis","Een grote, nieuwsgierige lipvis die bij veel boten een vaste bezoeker is en dicht bij snorkelaars komt.",2],
  ["Witpuntrifhaai","Onder overhangende koraalblokken, een tot anderhalve meter, ongevaarlijk. Vraag de gids waar ze liggen.",2]],
 food:[["Coral trout","Koraalbaars met stevig, zoet wit vlees. De vis die hier op elke goede kaart staat."],
  ["Mud crab","Modderkrab uit de mangroves, meestal met chili of zwarte bonen. Vies eten, veel servetten."],
  ["Mango","Queensland-mango's komen in september net op gang. De eerste zijn de duurste en de lekkerste."]],
 rest:[["Little Sister","Esplanade",4.6,2,null,"Aziatisch met veel vis, klein en informeel. Precies goed na een dag op zee.","Telefonisch, +61 7 4031 5400."],
  ["Dundees on the Waterfront","Marlin Parade",4.6,2,null,"Aan het water bij de jachthaven. Vraag naar de coral trout of de mud crab.","Online via de website van het restaurant."]],
 rnote:"In Cairns sluiten de meeste keukens rond 21.00 uur. Kom je laat terug van het rif, reserveer dan onderweg alvast."},

{datum:"2026-09-21",k:"excursie",t:"Atherton Tablelands",p:"Atherton Tablelands",tz:10,temp:"15–27°, 's avonds koel",
 agenda:[["Ochtend","Vrij in Cairns","Wandel over de Esplanade, zwem in de lagune of drink een flat white op een terras aan de boulevard."],
  ["13.30","Excursie Atherton Tablelands","Watervallen, regenwoud en dieren spotten in het donker. Terug rond 22.00 uur."]],
 body:[
  "De Atherton Tablelands liggen op zo'n zevenhonderd meter hoogte, een uur landinwaarts. Het is er groener, koeler en stiller dan aan de kust, met melkveegrond, kratermeren en resten regenwoud. De watervallen liggen zo dicht langs de weg dat je er bijna in valt. De Millaa Millaa Falls is de bekendste, de Curtain Fig een wurgvijg waarvan de luchtwortels als een gordijn van vijftien meter naar beneden hangen.",
  "Het mooiste komt na zonsondergang. De Tablelands zijn een van de beste plekken van Australië om in het donker dieren te zien. Het bekendst is de kreek bij Yungaburra, waar vogelbekdieren leven. Neem iets warms mee, want het scheelt hier 's avonds zomaar tien graden met Cairns."
 ],
 wild:[["Vogelbekdier","In de Peterson Creek bij Yungaburra, in de laatste twee uur voor het donker. Kijk naar kringen op het water en een bruin rugje dat even bovenkomt. Doodstil zijn helpt meer dan dichterbij komen.",2],
  ["Ringstaartpossum","Met de zaklamp van de gids in de bomen langs de weg. Hun ogen lichten oranje op en ze zitten er bijna altijd.",3],
  ["Lumholtz-boomkangoeroe","Een kangoeroe die in bomen leeft, alleen op de Tablelands en in het Daintree. Zeldzaam en lastig te zien, maar dit is de streek ervoor.",1],
  ["Pademelon","Kleine, gedrongen kangoeroes die in de schemering aan de bosrand grazen.",3]],
 prac:["Neem een trui of vest mee en lange mouwen tegen de muggen. In het donker bij het water heb je allebei nodig.",
  "Je bent tot een uur of tien onderweg en de keukens in Cairns zijn dan dicht. Eet onderweg mee als dat kan, of leg wat achter de hand voor als je terug bent.",
  "Gebruik je eigen zaklamp niet op dieren. De gidsen werken met gedempt rood licht, dat hun nachtzicht niet verstoort."],
 tip:"De watervallen zijn het mooist met wat regen in de dagen ervoor. Voel je je stoer, dan ga je erin. Het water in de Millaa Millaa Falls is ijskoud en glashelder."},

{datum:"2026-09-22",k:"vlucht",t:"Naar Arnhemland",p:"Cairns → Nhulunbuy",tz:9.5,temp:"21–30°",
 fl:[["TL 161","Cairns, terminal 2","Nhulunbuy (Gove)","13.30","14.55","Airnorth · Embraer 190, doorgaand naar Darwin"]],
 agenda:[["Ochtend","Vrij in Cairns","Uitchecken en rustig naar het vliegveld, want de vlucht vertrekt pas half twee."],
  ["13.30","Vlucht naar Nhulunbuy","Airnorth TL 161, aankomst 14.55 uur plaatselijke tijd. De klok gaat een half uur terug."]],
 body:[
  "Vandaag vlieg je naar een deel van Australië waar bijna geen toerist komt. Nhulunbuy ligt op het Gove-schiereiland in Oost-Arnhemland, ruim duizend kilometer van Darwin en alleen bereikbaar door de lucht of over een stoffige onverharde weg van elf uur. Het stadje is in de jaren zestig gebouwd voor de bauxietmijn en telt een paar duizend inwoners. Het land eromheen is van de Yolŋu, die hier al tienduizenden jaren wonen.",
  "De klok gaat een half uur terug, want het noorden loopt op UTC+9.30 en kent geen zomertijd. Verwacht warme, droge dagen rond de dertig graden en een zee die er heerlijk uitziet maar waar je niet in gaat."
 ],
 prac:["Voor Nhulunbuy zelf heb je geen vergunning nodig, maar zodra je het stadje verlaat wel. Voor de stranden, Yirrkala en de baaien heb je een toegangsvergunning van Dhimurru of de Northern Land Council nodig. Gaat je excursie erheen, dan regelt de organisatie dat. Ga er zelf niet zonder op uit, want dan sta je op privéland.",
  "Oost-Arnhemland heeft een streng alcoholstelsel. Drinken mag in een vergunde gelegenheid zoals de boat club of het hotel. Drank meenemen of kopen om elders te drinken mag alleen met een persoonlijke vergunning, die bezoekers vrijwel nooit krijgen.",
  "Zwem niet in zee of in kreken. Overal in het noorden leven zoutwaterkrokodillen, ook op plekken waar geen bord staat. Zwemmen doe je in het zwembad.",
  "Neem muggenspul mee tegen de zandvliegjes, vooral rond zonsondergang aan het water."],
 wild:[["Zoutwaterkrokodil","In de riviermondingen en langs de stranden van het schiereiland. Je ziet ze vooral níét, dus houd afstand van de waterkant, ook bij het vissen.",2],
  ["Witbuikzeearend","Boven de baaien en de mijnhaven, een grote roofvogel met witte onderkant. Bijna elke dag te zien.",3],
  ["Zandwallaby","In de schemering op de grasvelden aan de rand van het stadje.",3]],
 rest:[["Latitude 12","Westal Street, in Walkabout Lodge",4.1,2,null,"Het restaurant van het lodgecomplex, met terras bij het zwembad. Vanavond de zekerste keus in het stadje.","Telefonisch, +61 8 8939 2000."]],
 rnote:"De Gove Boat Club, de plek waar iedereen eet, is maandag en dinsdag dicht. Vanavond is dat dus geen optie, morgen wel."},

{datum:"2026-09-23",k:"excursie",t:"Yolŋu-kunst in Yirrkala",p:"Yirrkala",tz:9.5,temp:"21–30°",
 agenda:[["Ochtend","Vrij in Nhulunbuy","Rijd naar het Roy Marika Lookout op Mount Nhulun voor het uitzicht over het schiereiland, of neem het rustig aan bij het zwembad."],
  ["12.30","Excursie Aboriginal art","Naar Yirrkala, twintig minuten ten zuiden van Nhulunbuy."]],
 body:[
  "Yirrkala is een van de belangrijkste kunstplaatsen van Australië. In het Buku-Larrŋgay Mulka Centre werken Yolŋu-kunstenaars aan schilderingen op boombast en aan larrakitj, holle boomstammen die vroeger als grafpaal dienden. De patronen zijn geen versiering. Elk clanontwerp vertelt wie je bent en welk land bij je hoort, en wie het mag schilderen ligt vast.",
  "In het museum achter de galerie hangen de kerkpanelen uit 1962, waarop kunstenaars uit de twee helften waarin de Yolŋu-samenleving verdeeld is hun ontwerpen naast elkaar zetten. Een jaar later gingen vanuit dit dorp de bark petitions naar het parlement in Canberra, een protest tegen de mijnbouw dat op boombast was geschilderd. Het werd het begin van de Australische landrechtenbeweging. Zonder Yirrkala geen Mabo-arrest."
 ],
 prac:["Voor Yirrkala heb je een vergunning van de Northern Land Council nodig. Ga alleen mee met de excursie of met een gids die dat geregeld heeft.",
  "Fotograferen mag in de galerie meestal niet en van mensen alleen als je het vraagt. Sommige overleden kunstenaars worden niet bij naam genoemd, dus volg daarin de medewerkers.",
  "Het kunstcentrum sluit om 16.30 uur en op zondag helemaal. Koop je iets, dan verzorgen ze de verzending naar Nederland."],
 wild:[["Blauwvleugelkookaburra","Luidruchtiger en schriller dan zijn bekende neef uit het zuiden. In de bomen rond het dorp.",2],
  ["Raafkaketoe","Grote, trage zwarte kaketoes, in groepjes boven de eucalyptus.",2],
  ["Zeeschildpad","Vanaf de kust bij helder water. De stranden hier zijn belangrijke nestplaatsen.",1]],
 rest:[["The Waterfront Kitchen","Gove Boat Club, Drimmie Head Road",5,2,null,"De keuken van de boat club, aan het water met uitzicht op de zonsondergang. Bestellen aan de balie, aanschuiven aan lange tafels. Hier zit het hele stadje.","Niet mogelijk. Kom vroeg, want de rij bij de balie hoort erbij."]],
 rnote:"De boat club serveert eten van 17.30 tot 20.00 uur. Neem muggenspul mee voor op het terras."},

{datum:"2026-09-24",k:"vlucht",t:"Dreamtime hike en door naar Darwin",p:"Nhulunbuy → Darwin",tz:9.5,temp:"24–33°",
 fl:[["TL 161","Nhulunbuy (Gove)","Darwin","15.25","16.35","Airnorth · hetzelfde vluchtnummer als op de heenweg"]],
 agenda:[["08.00","Dreamtime hike","Wandeling met een Yolŋu-gids door het land rond het schiereiland."],
  ["15.25","Vlucht naar Darwin","Airnorth TL 161, ruim een uur, aankomst 16.35 uur."],
  ["17.00","Mindil Beach Sunset Market","Donderdagavond, 16.00 tot 21.00 uur. Twintig minuten van het centrum."]],
 body:[
  "De ochtend loop je met een gids het land in. Een dreamtime hike gaat niet over afstand maar over wat je onderweg te horen krijgt. Welke plant waarvoor dient, welk verhaal bij welke plek hoort en waarom bepaalde plekken niet betreden worden. Neem water mee en een hoed, want de zon staat hier ook vroeg al hoog.",
  "Om half vier vlieg je door naar Darwin, de tropische hoofdstad van het Noordelijk Territorium. Je landt om 16.35 uur en dat treft, want donderdag is de grote marktavond op Mindil Beach. Ruim tweehonderd kramen, eten uit half Azië en de zonsondergang boven de Timorzee rond half zeven."
 ],
 tip:"Neem op Mindil Beach een handdoek of kleedje mee en koop je eten vóór zonsondergang. Rond kwart over zes verplaatst iedereen zich naar het strand en zijn de rijen bij de kramen het langst.",
 prac:["De markt is er alleen op donderdag en zondag, van eind april tot eind oktober. Donderdag is de avond dat alle kramen open zijn.",
  "Betalen kan bij de meeste kramen met kaart, maar niet bij alle. Neem wat contant geld mee.",
  "Zwem niet in zee bij Darwin. Behalve krokodillen zitten er in het warme seizoen kwallen. Het strand is om naar te kijken, niet om in te gaan."],
 food:[["Laksa","Darwin is de laksastad van Australië. Kokos, noedels, garnalen of kip, en flink pittig."],
  ["Krokodil","Wit vlees, iets tussen kip en vis in. Op de markt in een broodje of als saté."],
  ["Barramundi","De grote witvis van het noorden, hier zo vers als het maar kan."]]},

{datum:"2026-09-25",k:"excursie",t:"West-Arnhemland",p:"Gunbalanya en de East Alligator",tz:9.5,temp:"24–33°",
 agenda:[["05.30","Vertrek excursie West-Arnhemland","Een lange dag. Drie uur rijden naar de grens van Arnhemland en 's avonds terug in Darwin."]],
 body:[
  "Vroeg op voor de langste dag van je voorreis. De weg gaat oostwaarts door Kakadu naar Cahills Crossing, de doorwaadbare plek in de East Alligator River waar je Arnhemland binnenrijdt. Bij vloed staat het water over de weg en verzamelen zich krokodillen om vis te vangen die over de drempel spoelt. Er is geen plek in Australië waar je ze zo zeker en zo dichtbij ziet.",
  "Aan de overkant ligt Gunbalanya (Oenpelli), aan de voet van Injalak Hill. Op de rots zitten schilderingen van duizenden jaren oud, laag over laag. Vissen in röntgenstijl, jachttaferelen, en op sommige plekken zeilschepen van de Makassaren die hier lang vóór de Britten kwamen handelen. Vanaf de top kijk je over de overstromingsvlakte, die in september droogvalt tot een lappendeken van waterkuilen vol vogels."
 ],
 prac:["Voor Arnhemland is een vergunning nodig en de rivier is alleen bij laag water te passeren. Beide regelt de excursie, want alleen gaan kan niet.",
  "Neem contant geld mee voor het kunstcentrum in Gunbalanya. Je koopt daar rechtstreeks bij de kunstenaars en de verbinding voor pinnen valt geregeld uit.",
  "Blijf bij Cahills Crossing achter de afzetting en ga nooit het water in of op de oever staan om te fotograferen. Hier zijn mensen omgekomen.",
  "Drie liter water per persoon, een hoed en stevige schoenen. De klim op Injalak Hill is kort maar over losse rots, en er is geen schaduw."],
 wild:[["Zoutwaterkrokodil","Bij Cahills Crossing, rond de wisseling van het tij. Vaak tien of meer tegelijk, tot vijf meter lang.",3],
  ["Jabiru","De zwarthalsooievaar, de enige ooievaar van Australië, op de drooggevallen vlakten. Bijna twee meter spanwijdte.",2],
  ["Fluiteend","In september staan er duizenden bij de laatste waterkuilen. Ze fluiten echt in plaats van te kwaken.",3],
  ["Zwarte bergkangoeroe","Een gedrongen, donkere wallaroe die alleen op het zandsteenplateau van Arnhemland leeft. Vroeg in de ochtend tussen de rotsen.",1]],
 rest:[["MERAKI Greek Taverna","Smith Street, Darwin City",4.8,2,null,"Grieks, druk en vrolijk, met deelgerechten en een grill. De best beoordeelde tafel van de stad.","Online of telefonisch, +61 486 030 985. Vrijdagavond zit het vol."],
  ["Beef & Bar Restaurant","Kitchener Drive, aan de Waterfront",4.6,2,null,"Steaks en zeevruchten aan de waterkant, tien minuten van het centrum.","Telefonisch, +61 8 8941 6178."],
  ["Snapper Rocks","Kitchener Drive, aan de Waterfront",4.3,2,null,"Vis en kleine gerechten met uitzicht over de haven. Ook laat op de avond krijg je er nog een tafel.","Telefonisch, +61 8 8900 6928."]],
 rnote:"Je bent pas aan het eind van de dag terug in Darwin. De keukens sluiten hier rond 21.00 uur, dus bel onderweg even als je zeker wilt zijn van een tafel.",
 note:"Pak vanavond je kampeerspullen. Morgenochtend om half zeven word je opgehaald voor vijf dagen Kakadu, Katherine en Litchfield, met een overnachtingstas van hoogstens vijftien kilo. De rest van je bagage laat je in Darwin achter."},

{datum:"2026-09-26",k:"bus",t:"Darwin naar Kakadu",p:"Kakadu, Ubirr en Jabiru",h:"Privékamp bij Jabiru, Kakadu",tz:9.5,temp:"22–35°",
 agenda:[["06.30","Ophalen in Darwin","De bus haalt je op bij een van de vaste opstappunten in de stad. Sta er tien minuten eerder."],
  ["Ochtend","Door de wetlands naar Kakadu","Onderweg veel vogels en de eerste krokodillen. Bij het Bowali Visitor Centre krijg je de inleiding op het park."],
  ["Middag","Kamp bij Jabiru","Inchecken op het privékamp, waar je twee nachten blijft."],
  ["Namiddag","Cahills Crossing","De doorwaadbare plek in de East Alligator River, aan de grens met Arnhemland."],
  ["Avond","Ubirr","Rotskunst en de klim naar het uitzicht over de Nadab-vlakte."]],
 body:[
  "De eerste dag van vijf. Je rijdt in een terreinbus door het wetlandgebied ten oosten van Darwin naar Kakadu, ruim vierhonderd kilometer. Kakadu staat op de werelderfgoedlijst voor twee dingen tegelijk, de natuur en de cultuur. Het park is zo groot als half Nederland en wordt beheerd door de Bininj en Mungguy samen met de parkdienst.",
  "Aan het eind van de middag kom je opnieuw bij Cahills Crossing, waar je gisteren ook al was. Daarna is Ubirr aan de beurt. De rotsen zitten vol schilderingen, van vissen in röntgenstijl tot de Regenboogslang, en vanaf de top kijk je bij zonsondergang uit over de Nadab-vlakte. Terug op het kamp kook je met de groep mee."
 ],
 prac:["Je slaapt in een vaste tent of in een swag, een canvas bedrol onder de blote hemel. Slaap je in een swag, dan heb je je eigen slaapzak nodig. Handdoeken zitten er niet bij.",
  "Douches en toiletten staan een paar minuten van het kamp. Neem een zaklamp of hoofdlamp mee voor 's nachts.",
  "Stroom is er nauwelijks. Er staan wat zonnepanelen, maar in de tenten zit geen stopcontact, dus neem een powerbank mee.",
  "Buiten Jabiru heb je vrijwel geen bereik. Zeg thuis dat je vijf dagen slecht bereikbaar bent en zet vooraf offline klaar wat je nodig hebt."],
 wild:[["Zoutwaterkrokodil","Bij Cahills Crossing rond de wisseling van het tij, en onderweg in elke rivier en billabong.",3],
  ["Brolga","Een grijze kraanvogel van meer dan een meter, in paren op de vlakten. Ze dansen, ook buiten het broedseizoen.",2],
  ["Zandwallaby","In de schemering rond het kamp en langs de weg. Rustige dieren, gewend aan mensen.",3]],
 tip:"De klim naar het uitzicht op Ubirr is kort maar steil, over kale rotsen. Ga vroeg genoeg omhoog, want iedereen wil er op hetzelfde moment zitten.",
 note:"Maaltijden zitten bij de tour in, maar je kookt en ruimt samen met de groep op. Vandaag lunch en avondeten, morgen ook ontbijt."},

{datum:"2026-09-27",k:"excursie",t:"Wandelen en zwemmen in Kakadu",p:"Zuid-Kakadu",h:"Privékamp bij Jabiru, Kakadu",tz:9.5,temp:"22–35°",
 agenda:[["Vroeg","Naar het zuiden van het park","Een deel van de rit gaat over onverharde tracks."],
  ["Overdag","Watervallen en zwemgaten","Welke het worden, hangt af van de toegang en van de groep. Jim Jim Falls, Gunlom Falls, Motor Car Falls of Moline Rockhole."],
  ["Eind","Warradjan Cultural Centre","Als de tijd het toelaat. Over de cultuur van de traditionele eigenaren, in hun eigen woorden."]],
 body:[
  "De dag waarvoor je de wandelschoenen hebt meegenomen. Je loopt door moessonbos en over rotsige rivierbeddingen naar zwemgaten onder watervallen, met steile zandsteenwanden eromheen. Je loopt anderhalf tot vier kilometer, deels over lastig terrein.",
  "Eind september is het einde van het droge seizoen. Sommige watervallen staan dan laag en een enkele is dicht, terwijl de tracks naar Jim Jim en Gunlom juist wel open zijn. De gids bepaalt ter plekke wat het beste uitpakt."
 ],
 prac:["Zwem alleen waar de gids het zegt. De rangers geven een zwemgat pas vrij nadat ze het op krokodillen hebben gecontroleerd, en dat gebeurt lang niet overal.",
  "Drie liter water per persoon per dag, en drink ook als je geen dorst hebt. Bij vijfendertig graden en een hoge luchtvochtigheid raak je sneller uitgedroogd dan je merkt.",
  "Dichte wandelschoenen zijn geen aanbeveling maar een eis. De rotsen zijn scherp en nat glad.",
  "Vandaag kun je een rondvlucht boven Kakadu maken. Wie dat doet, mist een deel van het programma en betaalt het los."],
 wild:[["Zoetwaterkrokodil","In de bovenloop bij de zwemgaten, kleiner dan de zoutwaterkrokodil en met een smalle snuit. Ze gaan zelf op de vlucht.",2],
  ["Regenboogbijeneter","Felgroen met een blauwe stuit, boven het water op jacht naar insecten. Overal in het park.",3],
  ["Rotswallaby","Op de rotsblokken bij de watervallen, vroeg in de ochtend en tegen de avond.",2]],
 tip:"Trek je zwemkleding 's ochtends al aan onder je wandelkleren. Bij de zwemgaten is geen kleedhokje, alleen een rotsblok om achter te gaan staan."},

{datum:"2026-09-28",k:"bus",t:"Kakadu naar Katherine",p:"Burrungkuy en Maguk",h:"Privékamp bij Katherine",tz:9.5,temp:"19–35°",
 agenda:[["Ochtend","Burrungkuy (Nourlangie)","Rotskunst en het Kunwarddewardde Lookout, met kans op Nawurlandja en de Anbangbang-billabong."],
  ["Middag","Maguk (Barramundi Gorge)","Twee kilometer lopen door moessonbos naar het zwemgat, met picknicklunch."],
  ["Avond","Kamp bij Katherine","Twee nachten op een privékamp, met een vuur en een open sterrenhemel."]],
 body:[
  "Je begint bij Burrungkuy, dat lang Nourlangie heette. Onder de overhangende rots staan Namarrgon de bliksemman en Nabulwinjbulwinj geschilderd, figuren uit de verhalen van de Bininj. De schilderingen zijn niet alleen oud maar ook onderhouden, want tot ver in de twintigste eeuw werden ze door de eigenaren opnieuw aangebracht.",
  "Daarna rijd je zuidwaarts het park uit, met onderweg de wandeling naar Maguk. Het pad steekt een paar keer de kreek over en eindigt bij een diep zwemgat onder een waterval. Aan het eind van de middag kom je aan bij Katherine, ruim vierhonderd kilometer verder."
 ],
 prac:["De wandeling naar Maguk gaat over losse keien en door ondiep water. Trek schoenen aan die nat mogen worden.",
  "Katherine ligt hoger en droger dan Kakadu. 's Nachts koelt het af tot een graad of twintig, wat na vier warme dagen prettig is, al heb je er wel een extra laag voor nodig.",
  "Bij het kamp brandt een vuur. Muggenspul helpt beter dan dicht bij het vuur gaan zitten."],
 wild:[["Banks' raafkaketoe","Grote zwarte kaketoes met rode staartvlekken, in luidruchtige groepen boven de eucalyptus.",2],
  ["Waterpython","Een glanzende, ongevaarlijke python rond de billabongs. Meestal in de schemering.",1],
  ["Waterbuffel","Verwilderde buffels in de vlakten van Kakadu, nakomelingen van dieren die in de negentiende eeuw zijn ingevoerd. Blijf op afstand.",2]],
 tip:"Vraag de gids naar Namarrgon. Het verhaal van de bliksemman verklaart precies wat er in november boven deze vlakten losbarst."},

{datum:"2026-09-29",k:"excursie",t:"Katherine Gorge en Edith Falls",p:"Nitmiluk National Park",h:"Privékamp bij Katherine",tz:9.5,temp:"19–35°",
 agenda:[["Vroeg","Naar Nitmiluk National Park","Vroeg vertrek om de eerste boot te halen."],
  ["Ochtend","Cruise door de Katherine Gorge","Twee uur varen tussen wanden van zeventig meter hoog."],
  ["Middag","Edith Falls","Picknicklunch en zwemmen in het grote bassin onder de waterval."],
  ["Avond","Sterrenkijken bij het kamp","Zonder stadslicht is de Melkweg hier van horizon tot horizon te zien."]],
 body:[
  "Nitmiluk is dertien kloven achter elkaar, uitgesleten door de Katherine River door zandsteen van 1,6 miljard jaar oud. De naam komt van de Jawoyn en betekent de plek van de cicadedroom. Het park is in 1989 aan hen teruggegeven en zij beheren het samen met de parkdienst.",
  "De cruise van twee uur brengt je door de eerste kloven. Staat het water laag, dan loop je halverwege een stukje over de rotsen naar de volgende boot. Daarna is Edith Falls aan de beurt, aan de noordkant van het park. Daar ligt een groot bassin waar je zonder haast in kunt liggen."
 ],
 prac:["Neem in de boot een hoed en zonnebrand mee. Er is geen schaduw en het water weerkaatst de zon.",
  "De zoetwaterkrokodillen in de kloof zijn ongevaarlijk voor mensen. De rangers sluiten de kloof pas als er na de eerste regens een zoutwaterkrokodil naar boven is gezwommen.",
  "Na de cruise kun je een rondvlucht met de helikopter boeken boven de kloven. Die valt buiten de tour en betaal je ter plekke.",
  "Naar het bovenste bassin bij Edith Falls is het steil klimmen. Het onderste is groter en ligt naast de parkeerplaats."],
 wild:[["Zoetwaterkrokodil","Op de zandbanken in de kloof, tot ongeveer twee meter. Ze liggen er bijna altijd.",3],
  ["Vliegende vos","Een kolonie in de bomen bij de aanlegsteiger, luidruchtig en zichtbaar. Tegen de avond vliegen ze uit.",3],
  ["Rotswallaby","Tussen de rotsblokken langs de kloofwanden, vroeg en laat op de dag.",2]],
 tip:"Het licht in de kloof is het mooist op de vroege boot, als de zon nog laag staat en de wand aan één kant oplicht."},

{datum:"2026-09-30",k:"bus",t:"Litchfield en terug naar Darwin",p:"Litchfield National Park",tz:9.5,temp:"22–35°",
 agenda:[["Ochtend","Naar het noorden","Van Katherine naar Litchfield, door regenwoud en over de Stuart Highway."],
  ["Overdag","Termietenheuvels en watervallen","De magnetische termietenheuvels, en zwemmen bij Buley Rockholes of Wangi Falls. Daarna Florence Falls of Tolmer Falls."],
  ["18.30","Terug in Darwin","Afzetten bij de opstappunten in de stad."]],
 body:[
  "De laatste dag van de tour, en de natste. Litchfield is kleiner dan Kakadu maar zit vol watervallen en zwemgaten, met stukken tropisch regenwoud die koelte geven. De magnetische termietenheuvels staan als grafstenen op een veld, allemaal noord-zuid gericht zodat de platte kant de middagzon ontloopt. De oudste zijn rond de honderd jaar.",
  "Bij Buley Rockholes stroomt de kreek van kom naar kom, zodat iedereen zijn eigen badje heeft. Wangi Falls is groter en drukker. Rond half zeven ben je terug in Darwin, aan het eind van vijf dagen kamperen."
 ],
 prac:["Houd droge kleren apart voor de rit terug, want alles wat je vandaag aanhebt wordt nat.",
  "Morgen vlieg je om 13.05 uur naar Sydney. Zorg dat je vanavond een slaapplek in Darwin hebt, en houd er rekening mee dat de bus pas om half zeven terug is.",
  "Wangi Falls sluit soms voor zwemmers wanneer er een krokodil is gesignaleerd. Ga af op de borden ter plekke en niet op de reisgids."],
 wild:[["Magnetische termiet","Geen dier om te spotten maar om te bekijken. Duizenden heuvels van twee meter hoog, allemaal in dezelfde richting.",3],
  ["Vliegende vos","Een grote kolonie boven het bassin van Wangi Falls, de hele dag hoorbaar.",3],
  ["Australische boomkikker","Groen, handpalmgroot en verrassend tam. In de toiletgebouwen bij de watervallen, waar het vochtig blijft.",2]],
 note:"Hier eindigt de voorreis. Morgen vlieg je met QF 841 naar Sydney, waar de groep uit Amsterdam aankomt. Die vlucht staat als notitie bij dag 1."}

];
