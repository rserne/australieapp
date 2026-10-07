// AustralieApp, reisdata. Alleen inhoud. De code staat in app.js.
// Controleer na een wijziging met: node check.js

const START=new Date(2026,9,1);
// Wie eerder gaat of langer blijft: aantal dagen vóór 1 oktober en na 29 oktober waarvoor
// notities gemaakt kunnen worden (0 = uit). Wie er gaat, leest de app af uit de notities zelf.
const VOORREIS=13, NAREIS=0;
// Beeld en tint van de kop voor de voorreis en nareis (ook op het kaartje in de fotostrook en op de
// startpagina van wie eerder gaat of langer blijft). Nieuwe foto: 1200×500, ook toevoegen aan BEELD in sw.js.
const BUITEN={voorreis:{foto:"reg-voorreis.jpg",tone:"#025469"}, nareis:{foto:"reg-nareis.jpg",tone:"#590E49"}};
const TONE={reis:"#012E61",nsw:"#01327E",tas:"#014747",sa:"#03484B",
  vic:"#014152",red:"#590D49",qld:"#01617F",wa:"#8E0F45"};
// Dezelfde regio's, maar dan als kleur om tekst en kleine vlakken mee te maken: eerst voor het lichte
// thema, dan voor het donkere. TONE is diep en gedempt omdat die kleur onder een foto ligt; klein en
// opgelicht gebruikt wordt hij flets. Net als bij de dieren heeft elke regio daarom een eigen paar.
// De voorreis en nareis staan er ook in, onder dezelfde sleutel als in BUITEN.
const TONE_INK={reis:["#3F4653","#A8B0BE"],nsw:["#0E4FB0","#6FA8FF"],tas:["#2A3FB5","#8C9CFF"],
  sa:["#5F6C08","#C9DB3C"],vic:["#A8430D","#F97B45"],red:["#9A2472","#E86FBE"],
  qld:["#0B7480","#2FC8D8"],wa:["#B01050","#FF7096"],
  voorreis:["#0B6A80","#3FBBD0"],nareis:["#8E2B6E","#E081C4"]};
const HOTELGEO={
 // Voorreis. De kampen van de Kakadu-tour, coördinaten van de organisatie.
 "Privékamp bij Jabiru, Kakadu":[-12.660915,132.835829],
 "Privékamp bij Katherine":[-14.391381,132.392261],
 "The Ultimo, Haymarket":[-33.8806794,151.2034411],
 "Hotel Grand Chancellor, Cameron Street":[-41.4344888,147.1405693],
 "Wintersun Gardens Motel, Gordon Street":[-41.870431,148.2890347],
 "Ibis Styles, Macquarie Street":[-42.8860825,147.3255957],
 "The Terrace Hotel, South Terrace":[-34.9351093,138.6042935],
 // Dag 13 (Blue Lake Motel) en dag 14 (Mountain View Motor Inn) staan er nog niet in: de hotels zijn
 // bekend uit het programma van de reisbegeleider, de coördinaten nog niet. Tot dan zoekt de link op
 // naam en adres. Winkels bij die twee hotels ontbreken om dezelfde reden.
 "Comfort Inn Western, Kepler Street":[-38.3845355,142.4797355],
 "Desert Palms Resort, Barrett Drive":[-23.7133953,133.8798204],
 "Cairns Plaza Hotel, Esplanade":[-16.9157099,145.7725368],
 "Ibis Perth, Murray Street":[-31.9516494,115.8557652],
 "Ibis Melbourne, Therry Street":[-37.8069565,144.9613627],
 "Outback Hotel & Lodge, Ayers Rock Resort":[-25.2430473,130.9896141]
 // Cradle Mountain staat niet in de accommodatielijst van Sawadee. De link zoekt daarom
 // op naam in plaats van op een aangenomen locatie.
};
const REGION={reis:"Onderweg",nsw:"New South Wales",tas:"Tasmanië",sa:"Zuid-Australië",
  vic:"Victoria",red:"Northern Territory",qld:"Queensland",wa:"West-Australië"};

const DAYS=[
{n:1,r:"nsw",k:"vlucht",t:"Vlucht Amsterdam – Sydney",p:"Schiphol → Sydney",tz:null,
 fl:[["SQ 323","Amsterdam Schiphol","Singapore Changi","10.20","05.30 (2 okt, lokale tijd)","Singapore Airlines · 25 kg ruim, 7 kg cabine"]],
 body:[
  "Vertrek om 10.20 uur vanaf Schiphol met Singapore Airlines. Je vliegt in twee etappes met een overstap van 1 uur en 45 minuten in Singapore. Onderweg schuift de klok acht uur vooruit. Na het ingaan van de Australische zomertijd op dag 4 wordt dat negen."
 ],
 prac:["Vul de inreiskaart eerlijk in. Australië is streng op biosecurity. Ook een appel of zakje noten uit het vliegtuig moet je aangeven. Aangeven kost niets, niet-aangeven levert een boete op van honderden dollars.",
  "Hout, zaden, veren en ongewassen wandelschoenen met modder eraan vallen er ook onder. Borstel je schoenen thuis schoon.",
  "Pak op 20 kilo, niet op 25. Vier van je binnenlandse vluchten gaan met Jetstar, dat strikt weegt en fors bijrekent bij overschrijding. Cabinebagage maximaal 7 kg. De extra ruimte die Singapore Airlines je op de heenreis geeft, kun je in Australië niet gebruiken."]},

{n:2,r:"nsw",k:"vlucht",t:"Aankomst Sydney",p:"Sydney",h:"The Ultimo, Haymarket",tz:10,temp:"14–22°",
 fl:[["SQ 241","Singapore Changi, terminal 3","Sydney Kingsford Smith, terminal 1","07.15","16.45","Singapore Airlines · 25 kg"]],
 body:[
  "Het grote bijzondere Australië, met zijn unieke natuur en cultuur, ligt niet dichtbij. Na een lange vlucht land je om 16.45 uur in Sydney, de grootse stad van Australië. Met douane, bagage en de rit naar de stad ben je rond 18.30 uur bij het hotel. Vanavond wil je waarschijnlijk rustig aan doen en wennen aan het tijdverschil.",
  "Sydney geeft je zeker de goede energie om weer op te laden, we verblijven hier dan ook vier nachten. Je slaapt in The Ultimo in Haymarket, midden in Chinatown, drie minuten van de tramhalte en vijf van Central Station."
 ],
 prac:["In Sydney hoef je geen Opal-kaart te kopen. Je checkt in en uit met je bankpas of telefoon, op bus, trein, tram én veerboot.",
  "Kraanwater is overal drinkbaar en gratis bijvullen kan bij vrijwel elk café. Flesjes water zijn hier duur.",
  "Je bent rond 18.30 uur in het hotel, dus je hebt de avond nog. De meeste keukens sluiten om 21.00 uur. Ga niet te laat eten."],
 food:[["Sydney rock oysters","Kleiner en romiger dan de Europese oester."],["Barramundi","Stevige witvis, de nationale vis van Australië."],["Meat pie","Hartig gebakje met rundvlees, met tomatensaus."],["Lamington","Cakeblokje met chocolade en kokos."],["Pavlova","Meringuetaart met slagroom en fruit."],["Fairy bread","Witbrood met boter en gekleurde hagelslag. Kinderfeestjeskost, maar het staat serieus op de lijst van nationale gerechten."]],
 rest:[["Chef Chen Dumplings","Quay Street, Haymarket",4.6,2,3,"Letterlijk om de hoek. Dumplings, xiao long bao en gebraden gerechten, ruime porties, snelle bediening.","Niet nodig. Klein en druk, maar er komt snel een tafel vrij."],
   ["Ho Jiak","Hay Street, Haymarket",4.5,2,5,"Maleisisch, een van de bekendste van Sydney. Druk en levendig.","Online via de website van het restaurant. Zonder reservering reken je op wachten."]]},

{n:3,r:"nsw",k:"vrij",t:"Opera House en Harbour Bridge",p:"Sydney",h:"The Ultimo, Haymarket",tz:10,temp:"14–22°",
 wild:[["Bultrug","Vanaf de veerboot naar Manly en vanaf North Head. De walvissen trekken in oktober met hun kalveren zuidwaarts langs de kust. De ferry vaart door de havenmond.",2],
  ["Grijskopvleerhond","Bij zonsondergang boven de Royal Botanic Garden en de haven, honderden grote vleermuizen die naar hun voedselbomen vliegen. Kijk omhoog rond 18.00 uur.",3],
  ["Kaketoes en lori's","Geelkuifkaketoes en regenbooglori's zitten in elke boom van de Botanic Garden, luid en niet schuw.",3],
  ["Boskalkoen","In Manly stapt de Australische boskalkoen gewoon over straat en bouwt nesten in voortuinen.",2]],
 agenda:[
  ["08.15","Vertrek uit het hotel","Tram L2 of L3 vanaf halte Haymarket (Capitol Square, 3 minuten lopen) naar Circular Quay, ± 18 minuten. Vandaar 8 minuten lopen naar het Opera House. Lopen kan ook, maar reken op 43 minuten. De route gaat om Darling Harbour heen en door het centrum met veel verkeerslichten."],
  ["08.45","Melden bij het Opera House","Bij het Welcome Centre op de Lower Concourse, aan de havenkant onder de trappen. Een kwartier vóór aanvang is de norm."],
  ["09.00","Rondleiding Sydney Opera House","Geboekt, standaardrondleiding van ongeveer een uur. Staat er op je bevestiging iets anders, dan schuift de rest van de ochtend mee."],
  ["10.00","Vrij tot half vier","Een suggestie is de veerboot naar Manly vanaf Circular Quay, wharf 3. Een half uur varen, hetzelfde tarief als de tram. Lunch aan de boulevard van Manly en op tijd terug."],
  ["16.15","BridgeClimb gaat niet door","Afgelast wegens onweer en verzet naar morgen, 16.35 uur. Zie dag 4."]],
 body:[
  "Je hebt twee volle dagen om Sydney te verkennen. Met meer dan vier miljoen inwoners is Sydney een stad met ongekende mogelijkheden. Een stadswandeling waarbij je het wereldberoemde Opera House en de naastgelegen Harbour Bridge bezoekt, mag uiteraard niet overgeslagen worden.",
  "Bij jullie stonden die twee vandaag allebei vast, om 09.00 uur de rondleiding door het Opera House en om 16.15 uur de BridgeClimb. De klim ging niet door vanwege onweer en is verzet naar morgenmiddag. Zoek je iets meer rust, ga dan naar de botanische tuinen of pak de ferry naar het gezellige Manly, waar je mooie fietstochten kunt maken.",
  "Het Opera House ligt aan Circular Quay, en vandaar vertrekken ook de veerboten naar Manly."
 ],
 prac:["De veerboten vallen onder hetzelfde tarief als bus en trein. De overtocht naar Manly is daarmee de goedkoopste rondvaart van Sydney, een fractie van een georganiseerde harbour cruise, met hetzelfde uitzicht.",
  "Vannacht gaat de zomertijd in. De klok springt van 02.00 naar 03.00 uur. Controleer morgenochtend of je telefoon dat zelf heeft gedaan.",
  "Bij de Opera House kun je zonder ticket het buitenterras op en tot in de foyer lopen. Voor het uitzicht heb je geen rondleiding nodig."],
 rest:[["Mishy's","Reservoir Street, Surry Hills",4.9,2,16,"Klein, seizoensgebonden, gerund door de eigenaar. Uitzonderlijke waardering, maar over een klein aantal beoordelingen. Zaterdag tot 22.00 uur.","Online of telefonisch. Zeer klein, dus vooraf boeken."],
   ["NOMAD","Foster Street, Surry Hills",4.6,4,12,"Modern Australisch met houtvuur en inheemse ingrediënten. Een van de betere adressen van Sydney en toch te belopen. Duurder dan de rest.","Online via de website van het restaurant. Zaterdag vroeg vol. Reserveren."],
   ["Dae Jang Kum","Goulburn Street, Haymarket",4.7,2,7,"Koreaanse barbecue aan tafel. Levendig, zaterdag tot 02.00 uur open en dichtbij het hotel.","Niet nodig, gewoon binnenlopen."]]},

{n:4,r:"nsw",k:"vrij",t:"Kustwandeling Coogee – Bondi",p:"Coogee & Bondi",h:"The Ultimo, Haymarket",tz:11,temp:"14–22°",
 wild:[["Bultrug","De kliffen bij Marks Park en Waverley Cemetery zijn de beste walviskijkplekken van Sydney, en oktober is het seizoen. Zoek naar de spuit. Een verrekijker helpt.",2],
  ["Blauwe groper","In Gordons Bay en Clovelly, een grote felblauwe vis die vlak onder het wateroppervlak zwemt. Vanaf de rotsen te zien, met een snorkel nog beter.",2],
  ["Dolfijn","Voor de kust, vaak in de golven bij Bronte en Coogee. Geen garantie, maar kijk elke keer even als je stilstaat.",1],
  ["Grijskopvleerhond","Vanaf de brug bij zonsondergang, rond 19.00 uur. Honderden grote vleermuizen vliegen dan vanuit de Royal Botanic Garden over de haven naar hun voedselbomen.",3]],
 agenda:[
  ["Ochtend","Verzamelen in de lobby","Met de reisbegeleider naar de bushalte, en met de expressbus naar Coogee. De precieze tijd volgt nog, omdat de bustijden nog wel eens veranderen."],
  ["09.00","Start bij Coogee Pavilion","Vijf à zes kilometer langs de kust: Gordons Bay, Clovelly, de kliffen van Waverley Cemetery, Bronte en Tamarama. Zo'n tweeënhalf uur, met trappen op en af. Onderweg kun je zwemmen in de ocean pools."],
  ["12.00","Bondi Beach","Einde van de wandeling. Lunch aan het strand of in Bondi."],
  ["Middag","Vrij in Bondi","Lunch, strand of het zeebad van Bondi Icebergs. Drink geen alcohol bij de lunch, want vóór de klim volgt een blaastest."],
  ["15.15","Naar The Rocks","Bus 333 van Bondi Beach naar Circular Quay, ruim een halfuur, en dan tien minuten heuvelop naar BridgeClimb, 3 Cumberland Street. Wil je eerst langs het hotel, vertrek dan uiterlijk om 14.30 uur uit Bondi: bus naar Bondi Junction, trein T4 naar Central, en vanaf het hotel tram L2 of L3 naar Circular Quay."],
  ["16.20","Inchecken BridgeClimb","Een kwartier vóór de klim. Neem de boekingsbevestiging mee. Die staat als notitie bij dag 3."],
  ["16.35","BridgeClimb","Geboekt, verzet vanwege het onweer van gisteren. Ongeveer drie en een half uur. De zon gaat rond 18.55 uur onder, halverwege de klim."],
  ["20.05","Klaar, in The Rocks","De keukens in Surry Hills zijn dan dicht. Zie hieronder waar je nog terechtkunt."]],
 body:[
  "Vanochtend loop je met de reisbegeleider de bekendste kustwandeling van Sydney, van Coogee naar Bondi Beach. Het is zo'n zes kilometer over de kliffen en langs vijf stranden, in tweeënhalf uur te lopen. Onderweg kun je zwemmen in de ocean pools, zeebaden die in de rotsen zijn uitgehakt.",
  "Je komt langs verschillende uitzichtpunten, zwembaaien en gezellige tentjes voor een bakje koffie. Op zondag is het druk, dus vroeg beginnen loont. Rond het middaguur ben je in Bondi en de middag is vrij. Terug in Sydney is het gezellig eten bij de waterkant, waar je uitzicht op de skyline en haven hebt."
 ],
 prac:["Op zondag geldt in New South Wales een laag dagmaximum voor het openbaar vervoer. Je kunt vandaag dus onbeperkt reizen voor een paar dollar.",
  "Het zeebad van Bondi Icebergs ligt aan het eind van de wandeling en is open voor publiek, behalve op donderdag. De entree is zo'n tien dollar, en alleen al voor het uitzicht is dat het waard. Neem een legitimatiebewijs, zwemkleding en een kleine handdoek mee.",
  "De zomertijd is vannacht ingegaan. Controleer of je telefoon een uur is opgeschoven. Je horloge doet dat niet vanzelf.",
  "Neem mee: wandelschoenen, genoeg water, bescherming tegen de zon, je bankpas of creditcard om in en uit te checken, wat geld, en eventueel lunch en strandspullen.",
  "BridgeClimb heeft strenge regels: geen camera of telefoon mee (de gids fotografeert), geen losse spullen, dichte schoenen en vooraf een blaastest. Bij meer dan 0,5 promille mag je niet mee. Je wandelschoenen van vanochtend zijn goed.",
  "Neem een extra laag mee voor op de brug. Daar waait het, en na zonsondergang is het er fris."],
 rnote:"Na de klim ben je rond 20.05 uur klaar. NOUR en White Horse in Surry Hills sluiten op zondag om 21.00 uur, en die haal je dan niet meer. Deze twee liggen bij het hotel en zijn langer open. Vind je dat te laat, eet dan uitgebreid bij de lunch in Bondi.",
 rest:[["Spice World","Sussex Street, Haymarket",4.6,2,6,"Chinese hotpot, spectaculair ingericht, zeven dagen tot 23.00 uur.","Kan online, maar binnenlopen werkt meestal ook."],
   ["Dae Jang Kum","Goulburn Street, Haymarket",4.7,2,7,"Koreaanse barbecue aan tafel, levendig en tot laat open. Op zondag tot middernacht.","Niet nodig, gewoon binnenlopen."]]},

{n:5,r:"nsw",k:"excursie",t:"Bezoek Blue Mountains",p:"Blue Mountains",h:"The Ultimo, Haymarket",tz:11,temp:"tot 19°, bewolkt of zonnig",
 wild:[["Liervogel","Op de bospaden in de dalen, vooral rond de Katoomba-watervallen. Je hoort hem eerder dan je hem ziet. Hij imiteert alles, van andere vogels tot camerasluiters. Vroeg in de dag de meeste kans.",2],
  ["Pennantrosella en koningsparkiet","Karmozijnrode en groene papegaaien in de bomen bij Echo Point. Ze komen op picknicktafels af.",3],
  ["Geelstaartraafkaketoe","Grote zwarte kaketoes met gele staartveren, in groepjes met een klaaglijke roep. Kijk omhoog in de eucalyptussen.",2],
  ["Moeraswallaby","In de schemering aan bosranden. De groep is dan waarschijnlijk al weg, dus alleen met geluk.",1]],
 agenda:[
  ["07.50","Verzamelen bij de receptie","De bus vertrekt om 08.00 uur. Ben je er niet (op tijd), dan gaat de reisbegeleider ervan uit dat je andere plannen hebt, en vertrekt de bus zonder je."],
  ["10.15","Echo Point","Na twee tot tweeënhalf uur rijden. Toiletten en koffie. Bij het bezoekerscentrum krijg je informatie en kijk je uit op de Three Sisters: Meehni, Wimlah en Gunnedoo."],
  ["Overdag","Wandelen of Scenic World","Drie keuzes. Niet wandelen: met de bus meteen naar Scenic World, met de Scenic Railway, de Skyway, de Cableway, een makkelijke boardwalk en de museummijn, all-in A$64 (niet inbegrepen). Makkelijk wandelen: de Prince Henry Cliff Walk van Echo Point naar Scenic World, vlak, 75 minuten. Flink wandelen: de Giant Stairway af, 896 treden en 300 meter dalen, rechtsaf naar de Katoomba-watervallen en via de Furber Steps weer omhoog, twee uur. Wie liever niet terugklimt, neemt de Scenic Railway omhoog. Ook wie wandelt, kan alles van Scenic World gebruiken, met hetzelfde ticket van A$64."],
  ["14.30","Terug naar Sydney","De bus vertrekt vanaf de parkeerplaats van Scenic World. Rond 17.00 uur ben je terug, de avond is vrij."]],
 body:[
  "Vandaag brengen we een bezoek aan het Blue Mountains Nationaal Park. In twee tot tweeënhalf uur rijden we naar de groene en bergachtige omgeving van de Blue Mountains. Het Nationale Park heeft zijn naam te danken aan de blauwe nevel die boven de vele aanwezige eucalyptusbossen hangt. Die ontstaat doordat de bomen olie verdampen.",
  "Er zijn vanaf hier verschillende wandelingen te maken. Bijvoorbeeld naar de lager gelegen Jamison vallei, de Katoomba waterval of naar de legendarische rotsformatie de Three Sisters."
 ],
 prac:["Alles is cashless. Je betaalt alleen met een creditcard of met de nieuwe debitcard (Visa Debit of Debit Mastercard). Een oude Maestro- of V PAY-pas werkt hier niet.",
  "Het is hoogseizoen. Reken erop dat je bij Scenic World altijd de entree van A$64 betaalt, ook als je er alleen wilt lunchen of winkelen. Daar is ook een winkel voor de eerste souvenirs.",
  "Neem een lunch mee uit Sydney, of eet ter plekke. Verder: goede wandelschoenen, genoeg water, zonnebrand en iets te lezen of te luisteren voor in de bus.",
  "Ben je geen wandelaar, dan kun je ook een extra dag in Sydney blijven. Zonder wandelen zijn de mogelijkheden in de Blue Mountains beperkt. Laat het de reisbegeleider vanavond weten.",
  "Neem een kaart van het gebied mee, of een foto ervan. Bij het bezoekerscentrum op Echo Point is hij gratis.",
  "In de bergen is het vaak zes tot acht graden kouder dan in Sydney, en het weer slaat er snel om.",
  "Mobiel bereik valt in de dalen weg. Spreek een verzamelpunt af in plaats van te vertrouwen op appjes."],
 rnote:"Maandag 5 oktober is Labour Day, een feestdag in New South Wales. Veel restaurants rekenen dan een toeslag van zo'n tien tot vijftien procent, en een enkele zaak gaat eerder dicht. Deze drie zijn op maandag gewoon open, liggen vlak bij het hotel en zijn snel. Morgen sta je om 04.50 uur klaar, dus eet op tijd.",
 rest:[["Temu Kangen","Ultimo Road, Haymarket",4.8,2,1,"Indonesisch, twee deuren van het hotel. Gasten roemen de mie goreng en de saté, en het eten staat snel op tafel. Maandag tot 21.30 uur.","Niet nodig, gewoon binnenlopen."],
   ["Ho Jiak","Hay Street, Haymarket",4.5,2,5,"Maleisisch, een van de bekendste van Sydney. Maandag tot 22.00 uur.","Online via de website van het restaurant. Zonder reservering reken je op wachten, zeker op een feestdag."],
   ["Nanjing Dumpling","Little Hay Street, Haymarket",4.5,2,6,"Goedkoop, snel en goed. Xiao long bao met krab of truffel. Maandag tot 21.30 uur.","Niet nodig, gewoon binnenlopen."]]},

{n:6,r:"tas",k:"vlucht",t:"Vlucht naar Launceston",p:"Launceston",h:"Hotel Grand Chancellor, Cameron Street",tz:11,temp:"± 16°, droog",
 wild:[["Vogelbekdier","In het Tamar Island Wetlands-reservaat, tien minuten buiten de stad, bij zonsondergang langs de vlonderpaden. Zeldzaam en schuw. Stil zitten en wachten bij rustig water.",1],
  ["Bennettwallaby","Aan de randen van Cataract Gorge, een kwartier lopen van het hotel, in de late middag.",2],
  ["Pauw","Cataract Gorge heeft een verwilderde kolonie pauwen die vrij rondloopt. Geen inheems dier, wel een gek gezicht.",3]],
 fl:[["JQ 745","Sydney, terminal 2 (binnenlands)","Launceston","07.25","09.10","Jetstar · 20 kg ruim, 7 kg cabine"]],
 agenda:[
  ["04.50","Klaarstaan bij de receptie","Uitgecheckt en met je bagage. Om 05.00 uur vertrekt de bus naar het binnenlandse vliegveld, een klein halfuur rijden. Wees op tijd, want het vliegtuig wacht niet."],
  ["05.30","Inchecken bij Jetstar","Terminal 2. Houd je paspoort bij de hand. Daarna kun je ontbijten op het vliegveld."],
  ["07.25","Vlucht naar Launceston","Jetstar JQ 745, aankomst om 09.10 uur."],
  ["09.10","Transfer naar het hotel","De kamers zijn dan nog niet klaar. Je zet je bagage in de opslag en gaat meteen de stad in. Officieel check je om 14.00 uur in, maar het hotel probeert de kamers eerder klaar te hebben."],
  ["Overdag","Vrij in Launceston","Tips staan hieronder en in de hand-out van de reisbegeleider."]],
 body:[
  "Rond reizen door het onmetelijke Australië brengt vele kilometers met zich mee. Tijdens deze reis nemen we dan ook een paar keer tijdbesparende vluchten. Vandaag vliegen we naar het groene eiland Tasmanië, dit deel van Australië werd 35.000 jaar geleden al bewoond door de inheemse Palawa bevolking. In 1642 was de Nederlander Abel Tasman de eerste Europeaan die voet zette op dit eiland, wat later naar hem vernoemd werd. Tasmanië is net zo groot als Nederland en heeft slechts 500.000 inwoners, het is dus dunbevolkt. Dit zie je terug in de rust en de ongerepte natuur die het eiland te bieden heeft.",
  "Vandaag kom je aan in Launceston, de oudste stad van Tasmanië. Hoewel het een van de grotere steden van het eiland is, voelt Launceston nog steeds als een charmant dorpje. De stad staat bekend om haar rijke cultuur, prachtige natuur en heerlijke lokale gerechten. Het hotel staat midden in het centrum. Wandel door de historische straatjes, ontdek gezellige cafés en markten, en vergeet vooral niet het nabijgelegen wijngebied van de Tamar Valley te verkennen voor een echte proeverij van Tasmaanse wijnen."
 ],
 prac:["Ontbijten in het hotel lukt niet meer. Neem zelf iets mee, of ontbijt op het vliegveld van Sydney na het inchecken.",
  "Je mag één koffer van 20 kg inchecken. De handbagage, een grotere tas plus een handtas, weegt samen hoogstens 7 kg. Jetstar weegt streng, en wie te zwaar is, betaalt bij.",
  "Maak je handbagage vliegklaar: geen schaartjes of mesjes erin, je powerbank juist wel, want die mag niet in de koffer. Water mag je meenemen.",
  "Trek vanochtend al kleren aan voor het Tasmaanse klimaat. Dinsdag wordt het zo'n zestien graden en droog.",
  "Tasmanië heeft zijn eigen quarantaineregels, ook voor reizigers uit de rest van Australië. Vers fruit en verse groente mogen het eiland niet op. Voor andere levensmiddelen hangt het af van product en verpakking. Eet je appel vóór het inchecken op en geef bij twijfel aan.",
  "Het eiland ligt zuidelijker dan je denkt, op de breedte van Nieuw-Zeeland. Reken op zes tot achttien graden en veel wind, ook als het op het vasteland warm was.",
  "De uv-index is hier hoog ondanks de kou. Verbranden gebeurt op een bewolkte dag van vijftien graden.",
  "Het hotel ligt midden in het centrum. Het serveert vanaf 06.30 uur een uitgebreid ontbijt voor A$30. Je loopt gewoon binnen en rekent meteen af; op de kamerrekening zetten kan niet, en een goedkoper continentaal ontbijt is er niet. Morgen vertrek je om 07.30 uur, dus dat past.",
  "Het Queen Victoria Museum & Art Gallery is gratis en elke dag open van 10.00 tot 16.00 uur. Er is ook een planetarium, dat tien dollar kost. Over de geschiedenis en de dieren van Tasmanië."],
 note:"Koop vandaag een picknicklunch voor morgen, want je bent de hele dag in het park. Het kan ook morgenochtend vroeg, bij Banjo's in Brisbane Street. Die bakker opent om 05.00 uur en ligt op zeven minuten lopen van het hotel.",
 food:[["Scallop pie","Hartige taart met sint-jakobsschelpen in kerriesaus. Puur Tasmaans."],["Oesters","Vraag naar Bruny Island. Het koude water levert uitzonderlijke kwaliteit."],["Wallaby","Mager, donker wildvlees. Vaak als ravioli of steak."],["Leatherwood honey","Donkere, aromatische honing van een boom die alleen hier groeit."],["Pinot noir","Het koele klimaat maakt Tasmanië tot Australiës beste streek voor deze druif."],["Curried scallop pie","De kerrieversie van de scallop pie, en volgens Tasmaniërs de enige juiste."]],
 rest:[["Kawan Dining","Charles Street",5.0,2,12,"Aziatische fusion, kleine zaak, vrijwel perfecte score over ruim 500 beoordelingen.","Online of telefonisch. Klein en altijd vol. Boek nu al."],
   ["Tres","Charles Street",4.8,2,11,"Latijns-Amerikaans, bekend om de picanha en de tapas.","Online via de website van het restaurant."],
   ["Mudbar","Seaport Boulevard",4.4,3,15,"Aan het water, zeven dagen open. Verse oesters en vlees van eigen boerderij.","Online, maar zonder reservering kom je er meestal ook binnen."]]},

{n:7,r:"tas",k:"excursie",t:"Cradle Mountain-Lake St Clair",p:"Cradle Mountain",h:"Hotel Grand Chancellor, Cameron Street",tz:11,temp:"4–11°, zonnig",
 wild:[["Wombat","De vlonderpaden bij Ronny Creek, waar jullie rond half twee zijn. Ze grazen het liefst in de schemering, maar op koele dagen ook midden op de dag, in het open veld. Ze laten je tot een paar meter komen. De zekerste wombat van Australië.",3],
  ["Pademelon en Bennettwallaby","Rond het bezoekerscentrum en de parkeerplaatsen, ook overdag in de schaduw. Blijf zitten en ze komen dichterbij.",2],
  ["Echidna","In de lente actief langs de paden en wegen, overdag. Een stekelig bolletje dat traag oversteekt. Stop en wacht.",2],
  ["Tasmaanse duivel","In het wild alleen 's nachts en zeldzaam. Devils@Cradle, naast het bezoekerscentrum, heeft rondleidingen overdag waar je ze wel ziet.",1],
  ["Vogelbekdier","In de beekjes rond Dove Lake bij zonsopgang of zonsondergang. Geluk nodig, maar het gebeurt.",1]],
 agenda:[
  ["07.30","Vertrek bij de receptie","Ontbijt in het hotel kan vanaf 06.30 uur (A$30, ter plekke afrekenen). Met een lokale gids, die ook rijdt. Ongeveer twee uur naar Cradle Mountain. Neem je lunch mee. Ben je er om 07.30 uur niet, dan vertrekt de bus zonder je."],
  ["Ochtend","Wandeling rond Dove Lake","Met de pendelbus naar Dove Lake. Een rondwandeling van zo'n zes kilometer, twee tot drie uur, met steile stukken, trappen en ongelijke paden. Gemiddeld zwaar. Aan het eind eet je je picknicklunch."],
  ["13.00","Ronny Creek","Rond 13.00 of 13.30 uur met de pendelbus naar Ronny Creek. Hier zie je de wombats."],
  ["15.00","Terug naar Launceston","Met de pendelbus naar het bezoekerscentrum en vertrek. Rond 18.00 uur ben je terug, de avond is vrij."]],
 body:[
  "Tijd voor actie! Vandaag bezoeken we het oudste en bekendste nationale park van Tasmanië: Cradle Mountain-Lake St Clair National Park, dat niet voor niets op de UNESCO Werelderfgoedlijst staat. Het park staat bekend om zijn ruige landschappen met rivieren, watervallen, diepblauwe gletsjermeren en imposante bergen, zoals Barn Bluff (1559 m), Mount Ossa (1614 m, de hoogste berg van Tasmanië) en natuurlijk de iconische Cradle Mountain (1545 m).",
  "In dit park vind je talloze wandelroutes. Houd onderweg je ogen open, want de kans is groot dat je bijzondere dieren tegenkomt, zoals wombats, wallaby’s, Tasmaanse duivels of misschien zelfs een echidna. Dit indrukwekkende natuurgebied laat je het wilde Tasmanië op zijn best ervaren.",
  "Je slaapt vannacht opnieuw in Launceston, ruim twee uur rijden heen en weer, dus reken op een lange dag."
 ],
 prac:["Naar Dove Lake rijdt een verplichte pendelbus vanaf het bezoekerscentrum, om de tien à vijftien minuten. Mis de laatste terugrit niet, want daarna volgt nog twee uur rijden naar Launceston.",
  "Wombats zijn het actiefst tegen de avond, maar jullie zijn rond het middaguur bij Ronny Creek. Loop rustig over de vlonderpaden en kijk ook verder het veld in. Op een koele, bewolkte dag grazen ze ook overdag.",
  "Het wordt een zonnige dag, maar 's ochtends is het hier zo'n vier graden en later hoogstens elf. Kleed je in laagjes en neem een regenjas mee, want het weer slaat in de bergen snel om.",
  "Bij Cradle Mountain kun je verder geen eten kopen. Koop je lunch dus vandaag al in Launceston. Neem ook genoeg water mee, zeker als je gaat wandelen, en trek goede wandelschoenen aan.",
  "Er is vrijwel geen mobiel bereik in het park. Download je kaarten voordat je uit Launceston vertrekt."],
 rnote:"Je eet vanavond in Launceston, niet bij Cradle Mountain. Je bent rond 18.00 uur terug, dus reserveer vóór je vertrekt.",
 rest:[["Cataract on Paterson","Paterson Street, Launceston",4.6,2,20,"Zeevruchten en steak, 4,6 over ruim 3.000 beoordelingen, zeven dagen open tot 21.00 uur. Ruime kaart en snelle bediening, de beste keuze als je laat terug bent uit het park.","Online of telefonisch: +61 3 6331 4446. Werkt ook zonder reservering."],
   ["Kawan Dining","Charles Street, Launceston",5.0,2,12,"Kreeg je gisteren geen tafel? Woensdag open van 17.30 tot 21.00 uur. Vrijwel perfecte score over ruim 540 beoordelingen.","Telefonisch. Reserveer vóór je naar Cradle Mountain vertrekt. Vol is vol."],
   ["Mudbar","Seaport Boulevard, Launceston",4.4,3,15,"Aan het water, zeven dagen tot middernacht open. De veiligste optie als het later wordt dan gepland.","Online, maar zonder reservering kom je er meestal ook binnen."]]},

{n:8,r:"tas",k:"bus",t:"Via Bay of Fires naar Bicheno",p:"Bicheno",h:"Wintersun Gardens Motel, Gordon Street",tz:11,temp:"tot 16°, zonnig",
 wild:[["Dwergpinguïn","Met de pinguïntour van 19.15 uur naar een kolonie die na zonsondergang aan land komt. Oktober is broedseizoen, dus ze komen zeker.",3],
  ["Australische pelsrob","Op de rotsen bij de blowhole en op Governor Island, vlak voor de kust van Bicheno. Kijk vanaf de kustwandeling met een verrekijker.",2],
  ["Witbuikzeearend","Boven de baaien van Bay of Fires en Bicheno. Groot, wit met grijs, vaak op een dode boom bij het water.",2],
  ["Dolfijn","Voor de kust bij Bay of Fires. Vanaf de granietrotsen heb je een goed uitzicht over het water.",1]],
 agenda:[
  ["08.00","Vertrek uit Launceston","Uitgecheckt en met je bagage klaarstaan bij de receptie. Dan naar de oostkust."],
  ["10.30","Bay of Fires","Oranje granietrotsen, witte stranden en helderblauw water. Een makkelijke wandeling over de rotsen en het strand."],
  ["Middag","Lunch in St Helens","Het vissersstadje aan Georges Bay, aan de zuidkant van Bay of Fires."],
  ["15.30","Aankomst in Bicheno","Inchecken in het Wintersun Gardens Motel, aan de noordwestkant van het dorp."],
  ["Avond","Naar het centrum","De bus brengt je naar het centrum om op eigen gelegenheid te eten. Terug loop je zelf, ongeveer twintig minuten. Eet vroeg, want de keukens sluiten vroeg en om 19.15 uur begint de pinguïntour."],
  ["19.15","Pinguïntour","Geboekt via GetYourGuide. Het verzamelpunt staat op je voucher. Ongeveer een uur, en je bent pas na het donker klaar. Kijk op de voucher of je wordt teruggebracht; anders loop je zo'n twintig minuten terug naar het motel.","Eigen boeking"]],
 body:[
  "Vandaag verkennen we de Oostkust van Tasmanië. We rijden naar een van de meest fotogenieke plaatsen van het eiland, de Bay of Fires. Kenmerkend zijn de bijzondere oranje/rood gekleurde rotsen rond het witte strand en het azuurblauwe water. Die kleur komt van korstmossen op het graniet. Het is een van de meest ongerepte gebieden dat Tasmanië te bieden heeft. We nemen vanochtend de tijd om hier rond te kijken. Je kunt een mooie strandwandeling maken of je tijd besteden aan een van de pittoreske stranden met helder blauw water.",
  "We overnachten vandaag in Bicheno, een charmant vissersdorpje gelegen tussen het Douglas-Apsley National Park en het Freycinet National Park. Het dorp ligt aan de rand van een prachtig natuurgebied aan zee en staat bekend om zijn verse en smaakvolle seafood. Vanaf hier kun je ’s avonds genieten van de rustige kustsfeer en misschien zelfs een wandeling maken langs het strand. Bij jullie staat om 19.15 uur een pinguïntour op het programma, zelf geboekt via GetYourGuide."
 ],
 prac:["Je slaapt in het Wintersun Gardens Motel aan Gordon Street, een rustig motel met een verzorgde tuin aan de noordwestkant van het dorp. Het centrum en de restaurants liggen een kwartier tot twintig minuten lopen verderop. Een restaurant heeft het motel niet.",
  "Het wordt zonnig, met hoogstens zestien graden. Trek goede wandelschoenen aan voor de rotsen bij Bay of Fires.",
  "Bij de pinguïns is fotograferen met flits verboden en wit licht verstoort ze. Gebruik alleen een rode lamp, als de gids dat toestaat.",
  "De pinguïns komen pas twintig tot veertig minuten ná zonsondergang aan land, en de zon gaat rond 19.30 uur onder. Je staat dus een tijd te wachten in de kou aan zee. Neem een muts en een warme jas mee.",
  "In Bicheno ligt een blowhole aan de zuidkant van het dorp, een halfuur lopen van het motel. Bij aanlandige wind spuit die tot tien meter hoog. Dat kost niets, en met een verrekijker zie je soms pelsrobben op het eilandje voor de kust."],
 rnote:"In Bicheno sluiten de meeste keukens om 20.00 uur, Lobster Shack zelfs om 19.00 uur, en daarna is er weinig meer te doen. De bus zet je in het centrum af, terug loop je zo'n twintig minuten. Met de pinguïntour om 19.15 uur eet je dus vroeg: Lobster Shack voor een vroege hap, of Sealife zodra het om 17.00 uur opengaat. Na de tour is het donker langs de weg, dus neem een zaklamp of je telefoon mee. De reisbegeleider noemt ook The Gulch (fish and chips) en Food and Brew, allebei aan Burgess Street in het centrum.",
 rest:[["Sealife Restaurant","Tasman Highway",4.4,2,13,"Het dichtst bij het motel, aan het strand met uitzicht op zee. Donderdag 17.00–20.00 uur.","Telefonisch: +61 3 6375 1121. Vraag om een tafel bij het raam."],
   ["Lobster Shack","Waubs Esplanade",4.3,2,29,"Vroeg en informeel, bestellen aan de balie, eten met zicht op zee, om 19.00 uur dicht. Meer een late lunch dan een diner, maar dit ís de lobster roll van Tasmanië.","Niet nodig. Bestellen aan de balie."]]},

{n:9,r:"tas",k:"bus",t:"Naar Hobart via Freycinet",p:"Hobart",h:"Ibis Styles, Macquarie Street",tz:11,temp:"8–17°",
 wild:[["Bennettwallaby","Op de parkeerplaats van Wineglass Bay. Ze zijn er altijd en komen bedelen. Voeren is verboden en maakt ze ziek.",3],
  ["Witbuikzeearend","Boven Coles Bay en de Hazards. Kijk omhoog vanaf het uitzichtpunt.",2],
  ["Dolfijn en walvis","In Great Oyster Bay, vanaf het uitzichtpunt over Wineglass Bay. In oktober trekken bultruggen langs. Een spuit in de verte is goed mogelijk.",1]],
 agenda:[
  ["07.00","Ontbijt","Inbegrepen."],
  ["07.45","Bagage in de bus","Een kwartier voor vertrek."],
  ["08.00","Vertrek","Onderweg haal je sandwiches op voor de lunch."],
  ["09.30","Freycinet National Park","Drie keuzes. Naar het uitzichtpunt over Wineglass Bay, 3 km heen en terug, anderhalf tot twee uur. Door naar het witte strand en via dezelfde weg terug, 6 à 7 km, tweeënhalf tot drie uur. Of niet wandelen en uitrusten op het strandje bij Freycinet Lodge, waar je ook kunt lunchen."],
  ["16.30","Aankomst in Hobart","De avond is vrij."]],
 body:[
  "Vandaag brengen we een bezoek aan het Freycinet Nationaal Park. Dit nationale park is één van de oudste van Australië. Het park kenmerkt zich door de vele wandelpaden door bossen en langs prachtige stranden en baaien. Je hebt de mogelijkheid om hier een prachtige wandeling van ruim twee uur naar de schilderachtige Wineglass Bay te maken. Deze baai heeft een vorm van een wijnglas en is omringd door rode granieten pieken, eucalyptusbomen, wilde bloemen en ongerepte witte zandstranden. Naar het uitzichtpunt alleen ben je officieel een tot anderhalf uur kwijt. Sawadee rekent ruimer, met pauzes en foto’s.",
  "Aan het eind van de middag arriveren we in Hobart, de hoofdstad van Tasmanië. Het is leuk om een wandeling te maken door het oude centrum. Hier maak je kennis met veel cultureel erfgoed van Australië, je loopt langs mooie historische gebouwen en oude arbeidershuisjes. De komende twee nachten slapen we in een comfortabel hotel, vijf tot twaalf minuten van Salamanca Place. Let op, vandaag is er een maaltijd inbegrepen."
 ],
 prac:["Boek vandaag alvast je MONA-tickets voor morgen. Ze zijn geregeld vooraf uitverkocht en de ferry erheen reserveer je apart.",
  "In het Ibis Styles is het ontbijt niet inbegrepen. Het wordt doordeweeks van 06.30 tot 09.30 uur geserveerd en in het weekend van 07.00 tot 10.00 uur. Op elke kamer staan koffie en thee."],
 rnote:"De reisbegeleider noemt ook Fish Frenzy aan Elizabeth Street Pier (vis en oesters aan het water, vrijdag tot 20.30 uur), de Drunken Admiral aan Hunter Street (vis, 17.00–22.00 uur) en Jack Greene op Salamanca Place (pub, met een goede zalmburger).",
 rest:[["Syra","Salamanca Square",4.7,2,11,"Midden-Oosters, de hoogste waardering van Salamanca. Kies de 'feed me' en laat de keuken beslissen.","Online. Klein, dus vooraf boeken."],
   ["Peppina","Salamanca Place",4.6,3,6,"Het dichtstbij en uitstekend. Italiaans met Tasmaanse producten. Iets duurder.","Online via de website van het restaurant of de reserveerknop in Google Maps."],
   ["Ball & Chain Grill","Salamanca Place",4.4,2,12,"Klassieke grill in een historisch pakhuis, houtskoolvuur.","Online via de website van het restaurant."]]},

{n:10,r:"tas",k:"vrij",t:"Hobart",p:"Hobart",h:"Ibis Styles, Macquarie Street",tz:11,temp:"8–17°",
 wild:[["Pelsrob","Tijdens de boottocht bij Tasman Island, kolonies op de rotsen, tot vlak bij de boot. Als je die excursie kiest is dit zeker.",3],
  ["Albatros","Op open zee bij Cape Pillar, met de boottocht. Reuzenalbatrossen met een spanwijdte van drie meter scheren langs.",2],
  ["Bultrug en zuidkaper","Oktober is een goede maand bij Tasman Island. De schipper weet waar ze zitten. Ook vanaf MONA's veerboot heb je soms geluk op de Derwent.",2],
  ["Dolfijn","Bijna standaard bij de boottocht. Soms ook in de haven van Hobart.",2]],
 agenda:[
  ["07.15","Tasman Island Cruise","Alleen als je hem hebt geboekt. Inchecken bij de haven om 07.15 uur, vertrek om 07.30 uur, terug rond 18.00 uur."],
  ["08.30","Salamanca Market","Tot 15.00 uur, op tien minuten lopen van het hotel."]],
 body:[
  "Na Sydney is Hobart de oudste stad van Australië. Een leuk uitje is een bezoek aan het bijzondere Museum Old New Art (MONA). Van Hobart neem je de ferry naar het museum. Deze overtocht is op zichzelf al de moeite waard.",
  "De ruige kustlijn van het zuidoosten van Tasmanië is bekend vanwege de grilligheid en de hoge kliffen. Een echte aanrader is om deel te nemen aan de optionele excursie met een boottocht waarin je dit prachtige gebied verkent. Je vaart langs het geïsoleerde Tasman Island en Cape Pillar, waar we vaak dolfijnen, albatrossen en zelfs walvissen zien."
 ],
 prac:["Salamanca Market is vanochtend, op tien minuten lopen. Hij loopt tot ongeveer 15.00 uur en veel kramen breken eerder af. Ga vroeg.",
  "Op de markt is leatherwood honey de beste souvenir. Hij mag de EU in en je vindt hem nergens anders ter wereld.",
  "Mount Wellington ligt op twintig minuten rijden en steekt 1.270 meter omhoog. Boven waait het bijna altijd hard en is het tien graden kouder dan in de stad. Er is geen kiosk. Met de Mt Wellington Express ga je naar de top, en dan kun je in anderhalf uur 5 km teruglopen naar Huon Road. Bij de Fern Tree Tavern stap je op de bus naar het centrum.",
  "Ga je mee met de cruise? Dan check je in vóór het hotelontbijt begint, want dat begint op zaterdag om 07.00 uur. Aan boord krijg je koffie of thee met een muffin. Kleed je warm aan, want de boot is een overdekte speedboot en op het water is het koud.",
  "Bonorong Wildlife Sanctuary, een halfuur rijden van Hobart, vangt inheemse dieren op, waaronder de Tasmaanse duivel. Eerst krijg je een rondleiding van een halfuur, daarna kijk je zelf nog een uur rond. De entree is A$32,50 en het park is open van 9.00 tot 17.00 uur. Deel een taxi."],
 rest:[["Syra","Salamanca Square",4.7,2,11,"Zaterdag open vanaf 17.00 uur. Ook de reisbegeleider raadt hem aan.","Online. Zaterdag het snelst vol."],
   ["Peppina","Salamanca Place",4.6,3,6,"Zaterdag open vanaf 17.00 uur.","Online via de website van het restaurant."]]},

{n:11,r:"sa",k:"vlucht",t:"Vlucht naar Adelaide",p:"Adelaide",h:"The Terrace Hotel, South Terrace",tz:10.5,temp:"12–22°",
 wild:[["Grijskopvleerhond","Een kolonie van duizenden in de Adelaide Botanic Garden, aan de noordkant van het centrum. Bij zonsondergang vliegen ze uit over de stad.",3],
  ["Rosella's en kaketoes","In de South Parklands, recht voor je hotel. Roze galahs en witte kaketoes grazen er in groepen op het gras.",3]],
 fl:[["JQ 680","Hobart, terminal D","Adelaide, terminal 1","14.20","15.50 (lokale tijd, klok een half uur terug)","Jetstar · 20 kg"]],
 body:[
  "We vliegen van Tasmanië naar het drogere Zuid-Australië, naar Adelaide. Anders dan je misschien verwacht bij een stad met meer dan een miljoen inwoners, voelt Adelaide meer als een groot dorp dan een drukke stad. Aan het einde van de middag komen we aan bij ons goed gelegen en comfortabele hotel, waar we twee nachten verblijven. Het kijkt uit over de South Parklands. Hutt Street, de dichtstbijzijnde restaurantstraat, ligt op een kwartier lopen recht naar het noorden."
 ],
 prac:["De klok gaat vandaag een half uur terug. Zuid-Australië loopt dertig minuten achter op Tasmanië en Victoria, een van de weinige halve tijdzones ter wereld.",
  "De tram is gratis binnen het centrum, van South Terrace tot de Entertainment Centre. Jullie hotel ligt aan het beginpunt, dus je komt gratis de stad in en uit. Pas voorbij de stadsgrens richting Glenelg betaal je.",
  "Zuid-Australië heeft statiegeld op blikjes en flesjes. Tien cent per stuk, in te leveren bij automaten."],
 food:[["King George whiting","De fijnste witvis van Zuid-Australië, delicaat en licht zoet."],["Coonawarra Cabernet","Twee van Australiës beroemdste wijnstreken liggen om de hoek."],["Coopers Ale","Ongefilterd, met bezinksel. Even laten staan voor je schenkt."],["Haigh's","Chocolatier uit 1915, nog altijd familiebedrijf."],["Pie floater","Een meat pie omgekeerd in een bord erwtensoep. Meer folklore dan gastronomie, maar één keer moet je het gezien hebben."],["Frog cake","Groen marsepeinen kikkerkopje met slagroom, sinds 1922 het symbool van Adelaide."]],
 rnote:"Veel Adelaidse restaurants zijn zondag gesloten. Deze drie niet.",
 rest:[["Sofia","Hutt Street",4.8,2,27,"Grieks-mediterraan, de hoogste waardering in de buurt. Zeven dagen open. Let op, in maart 2026 was het tijdelijk gesloten na een brand, inmiddels weer open. Controleer kort vóór vertrek of dat zo blijft.","Online. Populair, dus vooraf boeken."],
   ["The Logical Indian","Hutt Street",4.7,2,17,"Zuid-Indiaas, al zeven jaar consistent goed, en dichter bij het hotel.","Online of telefonisch."],
   ["Latteria","Hutt Street",4.5,2,17,"Modern Italiaans met een Milanese sfeer. Gasten noemen vooral de tagliarini met kreeft en de octopus.","Online via de website van het restaurant."]]},

{n:12,r:"sa",k:"vrij",t:"Adelaide, vrije dag",p:"Adelaide",h:"The Terrace Hotel, South Terrace",tz:10.5,temp:"12–22°",
 wild:[["Dolfijn","Bij Glenelg vanaf de pier en het strand, vooral 's ochtends. De dolfijnen van de Port River komen regelmatig langs de kust.",2],
  ["Grijskopvleerhond","Zie gisteren. De kolonie in de Botanic Garden hangt overdag zichtbaar in de bomen bij het meer.",3]],
 body:[
  "Het groene Adelaide leent zich uitstekend voor wandel- en fietstochten langs de vele parken, tuinen en musea. Of pak de tram en rijd in korte tijd naar het mooiste strand van Adelaide, Glenelg. Voor een gezellige avond uit in Adelaide vind je op Hindley Street vele mogelijkheden. Het is heerlijk bijkomen in één van de gezellige restaurants of pubs in de buurt.",
  "Eén ding om rekening mee te houden. De Adelaide Central Market, een van de grootste overdekte markten van het zuidelijk halfrond, is van oudsher zondag en maandag gesloten, precies jullie twee dagen. Controleer het ter plaatse, maar reken er niet op."
 ],
 prac:["Rundle Mall en de zijstraten eromheen zijn het winkelhart. Haigh's Chocolates heeft er zijn oorspronkelijke winkel op Beehive Corner, uit 1915.",
  "Het South Australian Museum en het Migration Museum vragen geen entree. Het eerste heeft de grootste verzameling Aboriginal-voorwerpen ter wereld.",
  "De tram naar Glenelg valt buiten de gratis zone. Tik in en uit met je bankpas. Een aparte kaart heb je niet nodig.",
  "Gratis door het centrum en langs de oude huizen en kerken in het noorden: de City Loop-bus, lijnen 98A, 98C, 99A en 99C.",
  "Cleland Wildlife Park op Mount Lofty heeft koala's, kangoeroes en andere inheemse dieren. Het is elke dag open van 9.30 tot 17.00 uur, de entree is A$34,50. Met bus 864 of 823 vanaf King William Street ben je er in een uur."],
 rnote:"Latteria, van gisteravond, is maandag gesloten. Deze drie zijn wel open.",
 rest:[["Part Time Lover","Paul Kelly Lane",4.8,2,22,"Modern Australisch, deelgerechten, in een steegje in het centrum. Zondag gesloten, maandag open, vandaag dus.","Online. Klein en gewild."],
   ["Chianti","Hutt Street",4.5,3,19,"Adelaidse klassieker sinds 1985, Italiaans. Zondag gesloten, maandag open.","Online via de website van het restaurant."],
   ["Sofia","Hutt Street",4.8,2,27,"Ook maandag open.","Online."]]},

{n:13,r:"sa",k:"bus",t:"Mount Gambier en Naracoorte",p:"Mount Gambier",h:"Blue Lake Motel, Kennedy Avenue",
 emoe:[1,"Op de open velden rond Naracoorte, overdag vanuit de bus. Kijk naar rechts en links over de weilanden."],tz:10.5,temp:"8–19°",
 wild:[["Zuidelijke langvleugelvleermuis","Bij Naracoorte huist een kolonie van honderdduizenden in Bat Cave. Het Bat Observation Centre laat ze via infraroodcamera's zien. In oktober keren de vrouwtjes terug om te werpen.",3],
  ["Kangoeroe","In de wijngaarden van Coonawarra tegen de avond, vaak in groepen tussen de rijen.",2],
  ["Emoe","Op de open velden rond Naracoorte, overdag vanuit de bus.",1]],
 agenda:[
  ["Ochtend","Vertrek uit Adelaide","De vertrektijd volgt nog van de reisbegeleider."],
  ["13.00","Naracoorte Caves","Rondleiding door de grotten, inbegrepen."],
  ["15.00","DiGiorgio Family Wines","Wijnproeverij in Coonawarra, inbegrepen. De lunch betaal je zelf."],
  ["16.00","Naar het Blue Lake Motel","Inchecken in Mount Gambier."]],
 body:[
  "We vervolgen vandaag onze route richting Mount Gambier. Onderweg bezoeken we het Nationaal Park Naracoorte Caves. Deze grotten staan op de UNESCO Werelderfgoedlijst vanwege hun uitzonderlijke fossielen en de resten van uitgestorven megafauna. Daarna rijden we door de wijnregio Coonawarra, beroemd om haar Cabernet Sauvignon, die zijn faam dankt aan de rode terra rossa-grond. Bij DiGiorgio Family Wines proef je hem zelf.",
  "De dag eindigt in Mount Gambier. Bij de stad ligt een uitgedoofde vulkaan met daarin het prachtige kratermeer Blue Lake. Een bijzondere plek met helderblauw water en fraaie tuinen rondom."
 ],
 prac:["Blue Lake verschiet pas in november van staalgrijs naar kobaltblauw. In oktober zie je hem nog in zijn winterkleur, mooi maar niet de ansichtkaart.",
  "Vraag bij de proeverij in Coonawarra naar de munt- en eucalyptustoon in de cabernet. Dat is de handtekening van deze streek.",
  "In de Naracoorte-grotten is het constant zo'n zeventien graden en vochtig. Een extra laag in de bus laten liggen is hier zonde."],
 note:"Je slaapt in het Blue Lake Motel aan Kennedy Avenue, en het ontbijt is inbegrepen. Het motel ligt op een heuvel buiten het centrum en de twee restaurants hieronder liggen 3 en 8 km verderop, dus je hebt vervoer nodig. De reisbegeleider noemt ook The Gates aan Morris Street, met een westerse keuken. De hoogst gewaardeerde adressen van Mount Gambier, Elementary, Fat Frog en de Brewery, zijn op dinsdag gesloten.",
 rest:[["Thyme at the Lakes","Lake Terrace West, Mount Gambier",4.4,2,0,"Modern Australisch met uitzicht over de stad en de kratermeren, dinsdag 18.00–22.00 uur. Beoordelingen lopen uiteen, veel lof voor eten en uitzicht, kritiek op prijs en bediening. Zo'n 3 km van het motel.","Online of telefonisch. Reserveren aanbevolen."],
   ["The Barn Steakhouse","Glenelg River Road, Mount Gambier",4.4,3,0,"Klassiek steakhouse, zeven dagen open van 17.30 tot 22.00 uur. Grote porties, goede wijnkaart, prijzig. Ligt 8 km buiten de stad, dus zeker een taxi.","Online of telefonisch."]]},

{n:14,r:"vic",k:"bus",t:"Naar Grampians Nationaal Park",p:"Halls Gap",h:"Mountain View Motor Inn, Ararat-Halls Gap Road",
 emoe:[3,"Ze lopen door het dorp Halls Gap en over het sportveld, en langs de weg naar het motel. Dit wordt hem. Houd afstand. Ze zijn groter en brutaler dan je verwacht."],tz:11,temp:"8–20°",
 wild:[["Kangoeroe","Op het sportveld en de camping van Halls Gap, elke avond vanaf een uur voor zonsondergang. Tientallen, en volkomen gewend aan mensen. Ook op het terrein van je motel.",3],
  ["Emoe","Lopen door het dorp en langs de weg naar het motel. Houd afstand, want ze zijn groter en brutaler dan je verwacht.",3],
  ["Kookaburra","Op takken en hekken langs de weg, en 's ochtends vroeg met hun lachende roep.",3],
  ["Echidna","Langs de wandelpaden, overdag. Lente is de beste tijd.",2],
  ["Wedgestaartarend","Boven de rotswanden bij The Pinnacle en Boroka Lookout.",2]],
 agenda:[
  ["07.00","Vertrek uit Mount Gambier","Het ontbijt in het motel is inbegrepen."],
  ["10.30","Ngamadjidj Shelter","Aboriginal-rotskunst onder een overhangende rots."],
  ["Daarna","Boroka Lookout","Uitzicht over Halls Gap en de bergen eromheen."],
  ["Middag","Lunch in Halls Gap","Op eigen gelegenheid. Wie niet wil wandelen, blijft hier en wordt later opgehaald."],
  ["Daarna","Wonderland Car Park","Vier wandelingen om uit te kiezen. Naar The Pinnacle via de Grand Canyon en Silent Street, middelzwaar, 5,5 km, ongeveer tweeënhalf uur. Volg op de terugweg de bordjes Wonderland Car Park. Iets makkelijker is de Grand Canyon Loop, 1 km met 60 meter hoogteverschil. Makkelijk is het pad naar Splitters Falls en door naar Venus Baths. Ook makkelijk is het bospad naar Turret Falls, drie kwartier tot een uur heen en terug. Dat pad begint achter op de parkeerplaats, aan de linkerkant."],
  ["Avond","Barbecue bij de lodge","Vooraf besteld. De reisbegeleider betaalt hem uit de pot."]],
 body:[
  "Vandaag reizen we af naar het Grampians Nationaal Park, het grootste Nationale Park van de staat Victoria. Vanwege de unieke landschappen en rijke geschiedenis absoluut een bezoek waard. Sinds de jaren 80 is dit park beschermd als Nationaal Park. In het Djab Wurrung en Jardwadjali heet het gebied Gariwerd. Je vindt er belangrijke Aboriginal-rotskunst.",
  "In de omgeving zijn verschillende mooie wandelingen te maken. Vraag naar The Pinnacle of de Wonderland Loop. Het park is bedekt met bergbossen met verschillende Eucalyptus-soorten en je vindt er bijna 1000 plantensoorten. We verblijven in een wat verouderde maar charmante accommodatie, waar je soms kangoeroes ziet. 's Avonds eet je met de groep een barbecue bij de lodge."
 ],
 prac:["Bij de grens met Victoria gaat de klok een half uur vooruit. Vergeet dat niet bij het afspreken van vertrektijden met de groep.",
  "Kangoeroes en emoes lopen 's avonds gewoon door het dorp Halls Gap en over het sportveld. Je hoeft er het park niet voor in.",
  "De rotskunst is beschermd erfgoed van de Djab Wurrung en Jardwadjali. Aanraken is verboden, ook met een vinger langs de rand. De olie van je huid tast de pigmenten aan.",
  "Neem genoeg water mee en wandel liever niet alleen, maar met minstens één ander.",
  "In Halls Gap kun je een hoofdnet tegen de vliegen kopen. Dat heb je later in de reis nog nodig, in het Red Centre."],
 note:"Je slaapt in het Mountain View Motor Inn, 3,7 km buiten Halls Gap. Dat is te ver om 's avonds naar het dorp te lopen. Eten kan alleen bij de barbecue die de reisbegeleider vooraf bestelt. Reken je eten en drankjes dezelfde avond nog af. Er is een zwembad, en wifi alleen in de lobby. Ontbijt zit er niet bij: morgenochtend ga je naar de bakker.",
 food:[["Kangoeroe","Mager en ijzerrijk. Eet het rosé. Doorbakken wordt het taai."],["Great Western sparkling shiraz","Mousserende rode wijn uit de streek hiernaast."],["Chicken parmigiana","Het nationale pubgerecht van Victoria. Kortweg 'parma'."]]},

{n:15,r:"vic",k:"bus",t:"Warrnambool via Tower Hill",p:"Warrnambool",
 emoe:[3,"Bij Tower Hill scharrelen ze rond het bezoekerscentrum en komen tot bij de bus. Tweede zekere dag op rij."],h:"Comfort Inn Western, Kepler Street",tz:11,temp:"9–18°",
 wild:[["Koala","Tower Hill is een van de beste plekken van Victoria om ze in het wild te zien. Zoek hoog in de gaffelvork van de eucalyptussen langs de paden. Ze bewegen nauwelijks.",3],
  ["Emoe","Lopen los rond het bezoekerscentrum en de picknickplaats, soms tot bij de auto's.",3],
  ["Kangoeroe en wallaby","In het open grasland van de krater, vooral in de ochtend en late middag.",3],
  ["Echidna","Langs de wandelpaden, overdag.",2],
  ["Zuidkaper","Bij Logans Beach in Warrnambool, vanaf het uitkijkplatform. Het seizoen loopt eind oktober af. Dit is de laatste kans.",1]],
 agenda:[
  ["08.00","Vertrek","Eerst naar de bakker voor het ontbijt."],
  ["10.30","Tower Hill Wildlife Reserve","Wandelen in de krater. Kies uit de Lake Edge Walk (een uur), de Lava Tongue Boardwalk (2,6 km, een halfuur tot drie kwartier, makkelijk), de Wagon Bay Loop (een halfuur, makkelijker maar minder mooi), de Journey to the Last Volcano Loop (drie kwartier tot een uur) of de Peak Climb (een halfuur). In het park staat een informatiebord met de routes."],
  ["Middag","Lunch in Port Fairy","Daarna de wandeling naar de vuurtoren van Port Fairy."],
  ["Daarna","Naar Warrnambool","Inchecken in het Comfort Inn Western. De avond is vrij."]],
 body:[
  "Onze rondreis vervolgen we door vulkanisch gebied. We rijden naar het Tower Hill reservaat, dat wordt beheerd door de lokale bevolking daar. Hier vind je een vulkanische formatie die meer dan 30.000 jaar geleden is ontstaan. Tijdens een wandeling door dit natuurgebied spot je misschien wel emoes, koala’s, wallaby’s en kangoeroes in hun natuurlijke omgeving. Een prachtige kennismaking met de Australische dierenwereld.",
  "We overnachten in Warrnambool, in een typisch Australische accommodatie op de hoek van Timor en Kepler Street. Alle adressen hieronder liggen binnen zes minuten lopen."
 ],
 prac:["Bij Logans Beach staat een gratis uitkijkplatform voor zuidkapers. Het seizoen loopt tot ongeveer eind oktober, dus jullie zitten aan de staart ervan, maar het kost niets om te kijken.",
  "Zoek in Tower Hill omhoog, niet vooruit. Koala's zitten overdag hoog in de gaffelvork van een eucalyptus en bewegen nauwelijks.",
  "Doe vanavond je waszak vast klaar. Overmorgen in Melbourne kun je hem afgeven."],
 food:[["Southern rock lobster","Port Fairy en Portland zijn belangrijke aanvoerhavens."],["Zuivel","Deze streek is de melkschuur van Victoria. Kaas, boter en ijs zijn hier uitzonderlijk."]],
 rest:[["Lost Cat","Liebig Street",4.8,2,5,"Klein, houtvuur, wisselende kaart. Lamskoteletten en mosselen met nduja op toast.","Online. Zeer klein. Boek nu al voor donderdagavond."],
   ["Lot 17","Timor Street",4.8,2,5,"Het 'feed me'-menu rond de 60 dollar is uitstekende waar.","Online of telefonisch: +61 434 241 717."],
   ["Salt","Liebig Street",4.5,2,5,"De barramundi en de sticky date pudding krijgen de meeste lof.","Online via de website van het restaurant."]],
 rnote:"De reisbegeleider noemt ook de pub van Hotel Warrnambool, op de hoek van Koroit en Kepler Street, twee straten van het hotel, en Mexicaans bij Cactus Jam aan Liebig Street (17.30–21.00 uur)."},

{n:16,r:"vic",k:"bus",t:"Great Ocean Road naar Melbourne",p:"Great Ocean Road",h:"Ibis Melbourne, Therry Street",tz:11,temp:"9–20°",
 wild:[["Koala","Kennett River, tussen Apollo Bay en Lorne, ligt op de route. Langs Grey River Road zitten ze in bijna elke boom, laag en zichtbaar. Vraag of de bus er even stopt.",3],
  ["Koningsparkiet","Ook bij Kennett River. Ze landen op je arm als je stil blijft staan. Niet voeren.",3],
  ["Dwergpinguïn","Onder de kliffen bij de Twelve Apostles broedt een kolonie. Ze komen pas na zonsondergang aan land, als jullie waarschijnlijk al weg zijn.",1],
  ["Bultrug","Vanaf de uitzichtpunten bij de Twelve Apostles en Loch Ard Gorge. Kijk naar de horizon.",1]],
 agenda:[
  ["08.00","Vertrek uit Warrnambool","Neem iets te eten en te drinken mee voor onderweg."],
  ["10.00","Bay of Martyrs","De eerste stop aan de Great Ocean Road. Daarna volgen meer fotostops en korte wandelingen langs de kust, ook bij de Twelve Apostles."],
  ["Middag","Lunch in Apollo Bay","Daarna komt Kennett River, de beste plek om koala's te zien."],
  ["17.00","Aankomst in Melbourne","Twee nachten in het Ibis aan Therry Street."]],
 body:[
  "Vandaag staat één van de mooiste routes van Australië op het programma, the Great Ocean Road. De route van vandaag is ongeveer 350 km lang en we rijden inclusief stops ongeveer negen uur. We maken verschillende stops en je hebt geweldige uitzichten over de oceaan. Het bekendste punt zijn de Twelve Apostles bij Port Campbell, al staan er allang geen twaalf meer overeind. De Great Ocean Road eindigt bij Peterborough en daarmee ook het spectaculaire landschap van de westkust.",
  "Via de Great Ocean Road rijden we naar Melbourne. Qua inwoners is Melbourne heel divers. Er woont een mengelmoes van Australiërs en andere nationaliteiten, waaronder een grote populatie uit India en Azië. De combinatie van deze culturen maakt Melbourne tot een sfeervolle, culinaire en enerverende stad. Melbourne heeft verschillende leuke wijken, waar je de invloeden van de verschillende nationaliteiten terugziet. Je verblijft twee nachten in het Ibis aan Therry Street, aan de noordkant van het centrum bij de Queen Victoria Market."
 ],
 wash:"Leg je waszak vanavond klaar. Morgenochtend kun je hem afgeven en krijg je hem 's middags of 's avonds schoon terug. Zie dag 17 voor de adressen.",
 prac:["Stop bij Gibson Steps, net vóór het hoofdbezoekerscentrum van de Twelve Apostles. Daar loop je een trap af naar het strand en sta je aan de vóet van de kliffen. Vrijwel iedereen rijdt er voorbij naar het uitzichtplatform.",
  "De rotsen staan aan de zuidkant van de weg. In de middag heb je zon in je lens. Het licht is het beste als je met je rug naar het binnenland staat.",
  "Tussen de stops langs de Great Ocean Road zit soms een uur zonder winkel of café. Neem vanuit Warrnambool iets te eten en te drinken mee voor onderweg."],
 food:[["Koffie","Melbourne is de koffiehoofdstad van Australië. Ga naar een zijsteegje, niet naar een keten."],["Dim sim","Grove Chinees-Australische dumpling, uitvinding uit Melbourne."],["Souvlaki","Melbourne heeft een van de grootste Griekse gemeenschappen buiten Griekenland."],["Vegemite","Wordt hier gemaakt. Dun smeren op geboterde toast, niet als jam gebruiken."],["Chiko roll","Een dikke gefrituurde rol met schapenvlees en kool, in 1951 bedacht in Bendigo voor het voetbalstadion. Verkrijgbaar bij elke snackbar."],["Lamington","Cakeblokje met chocolade en kokos. Hier vaak met een laag jam ertussen."]],
 rest:[["Pastuso","AC/DC Lane",4.6,3,23,"Peruaans, ceviche en anticuchos, uitstekende pisco sour. Een klein half uur lopen, of vijf minuten met de gratis tram over Elizabeth Street.","Online via de website van het restaurant. Vrijdagavond vroeg vol."],
   ["MoVida Next Door","Flinders Street",4.6,2,22,"Spaanse tapas, kleiner en ontspannener dan het hoofdrestaurant ernaast. Binnen de gratis tramzone.","Online via de website van het restaurant."],
   ["MoVida","Hosier Lane",4.5,2,22,"In het steegje met de beroemde straatkunst. Bestel de bomba-rijst.","Online via de website van het restaurant. Reserveren aanbevolen."]],
 rnote:"Dichter bij het hotel, volgens de reisbegeleider: Captain Melville aan Franklin Street (pubmaaltijden, tot 22.00 uur) en de Griekse restaurants Stalactites en Tsindos aan Lonsdale Street. In Chinatown, aan Little Bourke Street, heb je volop keus."},

{n:17,r:"vic",k:"vrij",t:"Melbourne, vrije dag",p:"Melbourne",h:"Ibis Melbourne, Therry Street",tz:11,temp:"11–20°",
 wild:[["Dwergpinguïn","Bij de pier van St Kilda, twintig minuten met tram 96 vanaf de stad, komt bij zonsondergang een kolonie aan land op de golfbreker. Gratis, met vrijwilligers die je de weg wijzen. De verrassing van Melbourne.",3],
  ["Grijskopvleerhond","Bij Yarra Bend Park, langs de rivier, overdag zichtbaar in de bomen en bij schemering in de lucht.",2],
  ["Kusuwaaierstaartbuidelrat","In Fitzroy Gardens en Carlton Gardens na het donker, in de bomen en op de paden. Mensen voeren ze, wat niet mag.",2]],
 body:[
  "Vandaag heb je vrij te besteden in de één na grootste en misschien wel de meest karakteristieke stad van Australië. Wat direct opvalt wanneer je door Melbourne loopt, zijn de trammetjes, die je nergens anders in Australië ziet. Naast de gratis toeristenbus is dit een leuke manier om de stad mee te verkennen. De gratis City Circle-tram rijdt een rondje langs de randen van het centrum.",
  "Nog een leuke en sportieve manier om de stad te verkennen is per fiets. Tijdens een fietstour laat een gids je kennis maken met alle facetten van Melbourne en geeft je tips over leuke plekken en wat je echt niet mag missen in deze stad. Aanraders op eigen houtje: de Queen Victoria Market, de laneways rond Degraves Street, de National Gallery of Victoria en de straatkunst in Hosier Lane."
 ],
 wash:"Vandaag is dé wasdag van de reis. Geef je was 's ochtends af en je hebt hem vanavond schoon terug. Drie manieren, van duur naar goedkoop: (1) via de receptie van het hotel, het makkelijkst maar per stuk afgerekend en al gauw meer dan honderd dollar. (2) Your Serviced Laundrette in Southbank, 4,5 op Google. Haalt op en bezorgt op je hotelkamer, per lading. (3) The Lonely Sock aan Rose Lane, 4,4, bezorgt ook op hotels, gratis nummer 1800 940 602. Zelf doen kan ook. Vraag bij de receptie van het Ibis of er een gastenwasruimte is.",
 prac:["Binnen de Free Tram Zone reis je gratis en hoef je nergens in te checken. Ga je verder dan die zone, dan heb je een Myki-kaart nodig. Met alleen je bankpas kom je in de tram niet altijd weg.",
  "De Queen Victoria Market ligt op zeven minuten lopen van het hotel en is zaterdag open, het beste ontbijt van de stad.",
  "De koffie is het beste in de steegjes, niet aan de hoofdstraten. Vraag om een flat white.",
  "De National Gallery of Victoria is gratis voor de vaste collectie. Alleen voor de grote tentoonstellingen betaal je."],
 rest:[["Ca De Vin","Postal Lane, bij het oude GPO",4.5,2,14,"Italiaans-mediterraan, lichtjes in het steegje. Van de drie het dichtst bij het hotel.","Online, of gewoon binnenlopen."],
   ["MoVida Next Door","Flinders Street",4.6,2,22,"Zaterdag vanaf 12.00 uur.","Online via de website van het restaurant."],
   ["Pastuso","AC/DC Lane",4.6,3,23,"Zaterdag tot 22.30 uur.","Online via de website van het restaurant."]]},

{n:18,r:"red",k:"vlucht",t:"Vlucht Melbourne – Uluru",p:"Uluru / Yulara",h:"Outback Hotel & Lodge, Ayers Rock Resort",tz:9.5,temp:"18–32°",
 shuttle:"Gratis resortshuttle",   // extra badge bij restaurants waar je heen loopt: er rijdt een pendelbus
 wild:[["Doornduivel","De lente is het seizoen voor deze kleine, stekelige hagedis. Op zandpaden en wegranden rond het resort, langzaam bewegend. Kijk omlaag.",2],
  ["Rode reuzenkangoeroe","Langs de weg tussen het resort en Uluru, vooral in de schemering. Grote roodbruine mannetjes.",2],
  ["Zebravink en woestijnparkiet","Zwermen bij elk stukje water, ook de sproeiers van het resort. Woestijnparkieten alleen als het geregend heeft.",3],
  ["Dingo","Rond het resort en langs de wegen, vooral vroeg in de ochtend. Blijf op afstand en laat geen eten liggen.",1]],
 fl:[["JQ 664","Melbourne, terminal 4","Ayers Rock (Connellan)","08.50","10.30 (lokale tijd, klok anderhalf uur terug)","Jetstar · 20 kg"]],
 body:[
  "Door beperkte beschikbaarheid op de binnenlandse vluchten is dit deel van de route vanaf 1 oktober 2026 aangepast. Het traject van Alice Springs naar Uluru is omgedraaid. Je vliegt vanochtend van Melbourne naar Uluru, zodat je die middag voldoende tijd hebt om de omgeving te verkennen en de optionele helikoptervlucht kunt maken.",
  "Uluru, ook wel Ayers Rock genoemd, is het spirituele en geografische hart van Australië. Voor de Anangu, de traditionele bewoners, is dit een heilige plaats die met groot respect wordt beschermd. Samen met het omliggende land staat Uluru op de UNESCO Werelderfgoedlijst. Vandaag ervaar je de immense uitgestrektheid en verlatenheid van de Australische woestijn.",
  "Bij aankomst in Uluru heb je de mogelijkheid om in een helikopter te stappen en te vliegen boven deze indrukwekkende monoliet. Pas dan zie je echt hoe indrukwekkend deze rode reus is. De rots rijst 348 meter boven het landschap uit en heeft een omtrek van maar liefst 9,4 kilometer. Het grootste deel zit nog ónder de grond."
 ],
 prac:["De klok gaat vandaag anderhalf uur terug, van Victoria naar het Northern Territory, dat geen zomertijd kent.",
  "Sommige delen van Uluru mag je niet fotograferen. Het gaat om heilige plekken van de Anangu. Er staan borden bij. Dat verbod geldt ook voor foto's die je alleen thuis laat zien.",
  "Er rijdt een gratis pendelbus die elke twintig minuten alle hotels van het resort aandoet.",
  "Het resort is de enige plek om iets te kopen en de prijzen liggen hoog. Sla je snacks in Melbourne in. Water hoef je niet te kopen. Het kraanwater hier en in Alice Springs is grondwater, veilig maar mineraalrijk en wat zouterig van smaak. Wie het je afraadt, wil je een fles verkopen.",
  "Het is hier overdag ruim tien graden warmer dan in Melbourne. Pak je warme kleren onder in je koffer en leg je zomerkleren bovenop."],
 food:[["Kangoeroe","Mager en donker, als steak of in worst."],["Kameel","Australië heeft de grootste wilde kamelenpopulatie ter wereld. Mild en iets zoet."],["Quandong","Inheemse woestijnperzik, zurig, vaak in chutney of dessert."],["Wattleseed","Geroosterd acaciazaad, smaakt naar koffie en hazelnoot."],["Damper","Sodabrood dat oorspronkelijk in de as van het kampvuur werd gebakken. Vaak met golden syrup."],["Bush tomato","Kakadu-pruim en bushtomaat, kleine inheemse vruchten met een scherpe, bijna kaneelachtige smaak, meestal als chutney."]],
 rest:[["Arnguli Grill","Desert Gardens Hotel",4.5,2,8,"Het beste à-la-carterestaurant van het resort. 18.00–20.30 uur. Sounds of Silence staat apart, onder 'Optioneel vandaag'.","Online via de site van Ayers Rock Resort, of aan de receptie. Zonder reservering word je weggestuurd. Boek nu al."],
   ["Ilkari Restaurant","Sails in the Desert",4.3,2,13,"Uitgebreid buffet rond de A$105 p.p., met oesters, krab, kangoeroe en lamskoteletten. Reserve als Arnguli vol zit. Onder je norm van 4,4, maar de keus in Yulara is klein.","Via de site van Ayers Rock Resort of de receptie."],
   ["Outback BBQ & Bar","Outback Hotel & Lodge",4.0,2,-1,"Zelf grillen. Je koopt je vlees (kangoeroe, emoe, barramundi) en bakt het op de gemeenschappelijke bbq, met saladebuffet en live muziek. Informeel, in je eigen hotel. Onder je norm, maar het is een ervaring en geen restaurant.","Niet nodig."]]},

{n:19,r:"red",k:"bus",t:"Van Uluru naar Alice Springs",p:"Alice Springs",
 emoe:[2,"In het open land langs de Lasseter en Stuart Highway, vooral 's ochtends. Vanuit de bus, dus wie aan het raam zit, telt."],h:"Desert Palms Resort, Barrett Drive",tz:9.5,temp:"18–32°",
 wild:[["Wilde kameel","Langs de Lasseter en Stuart Highway, vooral rond Curtin Springs. Australië heeft de grootste wilde kamelenpopulatie ter wereld.",2],
  ["Wedgestaartarend","Op en boven de weg, bij aangereden dieren. De grootste roofvogel van Australië. Vanuit de bus goed te zien.",3],
  ["Rode reuzenkangoeroe en emoe","In het open land langs de weg, in de vroege ochtend en late middag.",2],
  ["Brumby","Verwilderde paarden in kleine groepen, soms vlak langs de weg.",1]],
 body:[
  "Vandaag reis je door naar Alice Springs, dwars door de outback. Ondanks dat dit de op twee na grootste stad van het Northern Territory is, wonen hier slechts zo’n 30.000 mensen. Alice Springs is de perfecte uitvalsbasis om de bezienswaardigheden in de omgeving te ontdekken en een bijzondere plek om te overnachten midden in de uitgestrekte outback.",
  "Het resort ligt bij de golfbaan en het casino, zo’n twintig minuten lopen ten zuiden van het centrum."
 ],
 prac:["Onderweg zie je Mount Conner, een enorme tafelberg die veel reizigers voor Uluru aanzien. De Australiërs noemen hem 'Fooluru'. Hij ligt op privéland.",
  "De weg terug naar het hotel over Barrett Drive en Gap Road is 's avonds slecht verlicht. Een taxi kost hier weinig en is onder reizigers gebruikelijk.",
  "Alice Springs heeft strenge regels rond alcoholverkoop. Slijterijen zijn maar een deel van de dag open en je moet je paspoort tonen. In restaurants merk je er niets van."],
 rest:[["Q Eats","Todd Street / Gap Road",4.7,2,22,"Thais, de hoogste waardering van Alice Springs en het dichtst bij het hotel. De rode eendencurry is het gerecht.","Telefonisch: +61 476 763 067, of binnenlopen."],
   ["Warung Makan","Hartley Street",4.8,2,24,"Indonesisch, buiten eten. Nasi goreng, rendang en beef rib.","Telefonisch: +61 418 391 119. Zonder reservering moet je meestal even wachten."]]},

{n:20,r:"red",k:"excursie",t:"West MacDonnell Ranges",p:"Alice Springs",h:"Desert Palms Resort, Barrett Drive",tz:9.5,temp:"18–33°",
 wild:[["Zwartvoetrotskangoeroe","Op de rotsen bij Ormiston Gorge en Standley Chasm, in de schaduw en vroeg of laat op de dag. Klein, behendig en perfect gecamoufleerd. Zoek naar beweging.",2],
  ["Zebravink en spinifexduif","Bij de waterpoelen van Ellery Creek en Ormiston Gorge, in zwermen.",3],
  ["Perentie","De grootste hagedis van Australië, tot twee meter, zonnend op rotsen langs de paden.",1],
  ["Dingo","Rond de picknickplaatsen. Op afstand blijven.",1]],
 body:[
  "We gaan vroeg uit de veren en vertrekken naar de West MacDonnell Ranges, in het Arrernte Tjoritja geheten, een prachtig nationaal park met spectaculaire bergruggen, droge valleien en kloven. Tijdens deze excursie bezoeken we onder andere Ormiston Gorge, een kloof die bekend staat om zijn outbacklandschap met hoge rode kliffen, ruige rotsformaties en een permanente waterpoel. Vanaf diverse uitkijkpunten heb je prachtig uitzicht op het omringende landschap.",
  "Voor het nemen van een verfrissende duik gaan we naar Ellery Creek Big Hole, waar je kunt zwemmen tussen twee hoge rotsen in. Vervolgens bezoeken we de Standley Chasm. Door eeuwen van erosie strekken de wanden van deze kloof zich bijna 100 meter omhoog. Aan het einde van de middag gaan we weer terug naar Alice Springs."
 ],
 prac:["Standley Chasm is in beheer van de Arrernte-gemeenschap en heeft een eigen entree, los van het nationale park. De wanden lichten alleen rond het middaguur oranje op. Een uur eerder of later sta je in de schaduw.",
  "Ellery Creek is dieper dan het lijkt en het water blijft het hele jaar rond de vijftien graden. Laat je er rustig in zakken en spring er niet in.",
  "Ormiston Gorge heeft als enige stop een bezoekerscentrum met toiletten en schaduw. Plan je pauze daar."],
 rest:[["Warung Makan","Hartley Street",4.8,2,24,"Ook dinsdag open. De beste keuken van de stad volgens de beoordelingen.","Telefonisch: +61 418 391 119."],
   ["Q Eats","Todd Street / Gap Road",4.7,2,22,"Ook dinsdag open, en het dichtst bij het hotel.","Telefonisch: +61 476 763 067."]]},

{n:21,r:"qld",k:"vlucht",t:"Vlucht Alice Springs – Cairns",p:"Cairns",h:"Cairns Plaza Hotel, Esplanade",tz:10,temp:"22–30°, vochtig",
 wild:[["Brilvleerhond","Een kolonie van duizenden hangt overdag in de bomen bij de bibliotheek aan Abbott Street, vijf minuten van de Esplanade, en vliegt bij zonsondergang uit.",3],
  ["Pelikaan en steltlopers","Op de wadplaten voor de Esplanade bij laag water, letterlijk voor het hotel. Met de informatieborden langs de boulevard herken je ze.",3],
  ["Bosgriel","Na het donker hoor je overal in Cairns een klaaglijke gil. Dat is de bosgriel, een grote vogel die roerloos op grasvelden en parkeerplaatsen staat.",3],
  ["Zoutwaterkrokodil","In Trinity Inlet, de mangroven achter de stad. Je gaat er niet naar op zoek, maar het is wel de reden dat je hier niet in zee zwemt.",1]],
 fl:[["TL 361","Alice Springs","Cairns, terminal 2","12.50","15.30 (lokale tijd, klok een half uur vooruit)","Airnorth · 20 kg"]],
 body:[
  "Vandaag vlieg je in de middag vanuit Alice Springs verder naar Cairns, in het tropische noorden van Queensland. Het klimaat verandert volledig, van droge woestijnlucht naar vochtige warmte. Het hotel staat aan het noordelijke deel van de Esplanade, met uitzicht op Trinity Bay. Vandaag is er een maaltijd inbegrepen.",
  "Je hebt ruim de tijd om de omgeving te ontdekken. Cairns leent zich uitstekend als uitvalsbasis voor enkele fantastische dagexcursies. Deze bieden wij ter plaatse optioneel aan. Ga bijvoorbeeld mee naar het Daintree Rainforest en ontdek alles wat het Daintree Rainforest en Cape Tribulation te bieden hebben.",
  "Speur naar krokodillen tijdens een cruise op de Daintree River. Leer meer over de flora, fauna en geschiedenis tijdens een boardwalk-tour met een ervaren gids. Maak een 4WD-tocht door het regenwoud, bezoek Cape Tribulation Beach en geniet van een huisgemaakt Daintree-ijsje op de terugreis."
 ],
 wash:"Tweede waskans, mocht je in Melbourne niet alles hebben meegegeven. Vraag bij de receptie of het hotel een wasservice heeft. Het is een kleiner, zelfstandig hotel, dus reken er niet op. Zelf doen kan bij Cairns Laundromat aan Sheridan Street (4,5 op Google), acht minuten lopen, open van 05.00 tot 23.00 uur, betalen met de pas. Gebruik de droger. Bij deze luchtvochtigheid droogt niets uit zichzelf.",
 prac:["De klok gaat een half uur vooruit, van het Northern Territory naar Queensland. Queensland kent geen zomertijd, de rest van de oostkust wel.",
  "Zwemmen in zee is hier niet vanzelfsprekend, ook niet op mooie stranden. Er is een gratis lagune aan de Esplanade waar je wel veilig het water in kunt.",
  "Tropische kwallen komen hier het hele jaar voor. Van november tot mei is het risico het grootst, maar in oktober is het niet nul. Volg de aanwijzingen van de bemanning en trek het beschermende pak aan dat je aan boord krijgt. Krokodillen zitten er altijd, dus blijf uit riviermondingen en mangroven."],
 food:[["Mud crab","Grote modderkrab met chili of zwarte bonensaus. Je krijgt er een slabbetje bij, en dat heb je nodig."],["Moreton Bay bugs","Platte kreeftachtigen met zoet, stevig vlees."],["Coral trout","De fijnste rifvis, delicaat en duur."],["Tropisch fruit","Mango, papaja, lychee, passievrucht. Op de markten ook durian."],["Bundaberg ginger beer","Alcoholvrij gemberbier uit Queensland, gebrouwen sinds 1968. Overal verkrijgbaar."],["Barramundi","Hier op zijn best, vaak met mango-salsa."]],
 rest:[["Little Sister","Esplanade",4.6,2,8,"Het dichtstbij en uitstekend. Aziatische fusion, verse zeevruchten, oesters en lobster roll.","Telefonisch: +61 7 4031 5400, of online."],
   ["Dundees on the Waterfront","Marlin Parade",4.6,2,18,"Aan de jachthaven, 4,6 over ruim 5.500 beoordelingen. Het Australische proefplankje met kangoeroe en krokodil is de klassieker.","Online via de website van het restaurant. Reserveren nodig."]]},

{n:22,r:"qld",k:"vrij",t:"Cairns, vrije dag",p:"Great Barrier Reef",h:"Cairns Plaza Hotel, Esplanade",tz:10,temp:"22–30°, vochtig",
 wild:[["Groene zeeschildpad","Bij het buitenrif zwemmen ze rustig langs de koraalranden. Bijna elke snorkelaar ziet er minstens een.",3],
  ["Witpuntrifhaai","Onder overhangende koraalblokken, een tot anderhalve meter, ongevaarlijk. Vraag de gids waar ze liggen.",2],
  ["Anemoonvis en reuzendoopvont","Clownvissen in hun anemoon en reuzenschelpen van een meter breed. Beide op ondiepe plekken bij het platform.",3],
  ["Napoleonvis","Een grote, nieuwsgierige lipvis die bij veel boten een vaste bezoeker is en dicht bij snorkelaars komt.",2],
  ["Rog","Op de zandvlaktes tussen het koraal, vaak half ingegraven.",2]],
 body:[
  "Kies er vandaag voor om mee te gaan naar het grootste koraalrif ter wereld, het populaire Great Barrier Reef, waar we gaan snorkelen. Keer in de avond terug naar de boulevard, want hier zijn genoeg mogelijkheden om heerlijk te eten.",
  "Met een catamaran ga je naar een uniek koraalrif, waar je kunt snorkelen tussen de schildpadden, kleurrijke vissen en verschillende soorten koraal. Om het kwetsbare koraal te beschermen werkt de organisatie samen met wetenschappers en het Coral Nurturing Program. Gezamenlijk hebben zij zes coral nurseries gebouwd. Dankzij nieuwe technologie worden kwetsbare stukjes koraal gered en krijgen ze een nieuw thuis, zodat het rif de ruimte krijgt om gezond uit te groeien. De reisbegeleider kan helpen met het boeken."
 ],
 prac:["Op rifexcursies komt vrijwel altijd een aparte rifheffing bovenop de prijs, zo'n acht dollar per persoon per dag. Die zit meestal níét in het geboekte bedrag. Houd contant of pas bij de hand.",
  "Draag het beschermende pak dat de boot aanbiedt, ook als het niet verplicht is. Het beschermt tegen kwallen én zon, en is beter voor het koraal dan zonnebrand.",
  "Het is anderhalf tot twee uur varen over open zee. Zeeziektepillen werken alleen als je ze een uur vóór vertrek neemt, niet aan boord."],
 rest:[["Little Sister","Esplanade",4.6,2,8,"Kort lopen na een lange dag op zee.","Telefonisch: +61 7 4031 5400."],
   ["Sails","Esplanade zuid",4.4,2,19,"Klein, Peruaans-Aziatisch, aan het water. Donderdag 16.00–21.00 uur.","Telefonisch: +61 403 441 669. Klein, dus vooraf bellen."]]},

{n:23,r:"qld",k:"vrij",t:"Cairns, vrije dag",p:"Daintree / Kuranda",
 emoe:[1,"Geen emoe maar een kasuaris, de derde grote loopvogel van Australië, met blauwe kop en rode lellen. In het regenwoud bij Cape Tribulation, zeldzaam maar oktober is een goede maand. Telt dubbel."],h:"Cairns Plaza Hotel, Esplanade",tz:10,temp:"22–30°, vochtig",
 wild:[["Zoutwaterkrokodil","Op de Daintree River-cruise, zonnend op de modderbanken bij laag water. Vroeg in de ochtend of laat in de middag de meeste kans. Midden op de dag liggen ze in het water.",3],
  ["Helmkasuaris","In het regenwoud rond Cape Tribulation, met name op de Marrdja- en Dubuji-boardwalks. Zeldzaam, maar oktober is een goede maand. Nooit benaderen.",1],
  ["Ulysses-vlinder","Elektrisch blauwe vlinder van tien centimeter, in de zon boven het bladerdak en bij bloeiende struiken. Bij Kuranda en in het Daintree.",2],
  ["Boydbosdraak","Een hagedis die roerloos verticaal tegen een boomstam hangt, op ooghoogte langs de boardwalks. Je loopt er zo voorbij.",2],
  ["Boomkangoeroe","In de kruinen van het Daintree, uiterst zeldzaam. Alleen met een gids en veel geluk.",1]],
 body:[
  "We verblijven nog een laatste dag in Cairns. Heb je gisteren gekozen voor een excursie naar het Great Barrier Reef, dan kun je vandaag wellicht een bezoek brengen aan het Daintree Nationaal Park en Cape Tribulation. Een derde mogelijkheid is de Kuranda Scenic Railway naar boven en de Skyrail kabelbaan terug over het regenwoud. Alle drie zijn dagvullend, dus het is het een of het ander.",
  "Of breng deze laatste dag in Cairns door op een van de vele terrassen en geniet van een typische flat white koffie. Morgen vliegen we alweer naar onze laatste bestemming van de reis, Perth."
 ],
 prac:["In het water bij Cape Tribulation kun je niet zwemmen, hoe uitnodigend het strand ook is. Er leven zoutwaterkrokodillen en de borden staan er niet voor niets.",
  "De Kuranda-trein rijdt maar twee keer per dag omhoog. Trein heen en Skyrail terug is de combinatie die de meeste mensen achteraf aanraden. Vooraf boeken als combinatieticket scheelt geld.",
  "De Daintree River-cruise op zoek naar krokodillen gaat het beste vroeg in de ochtend of laat in de middag. Midden op de dag liggen de dieren uit het zicht."],
 rest:[["Dundees on the Waterfront","Marlin Parade",4.6,2,18,"Laatste avond in de tropen. Vraag naar de coral trout of de mud crab.","Online via de website van het restaurant."],
   ["Little Sister","Esplanade",4.6,2,8,"Vrijdag tot 21.00 uur.","Telefonisch: +61 7 4031 5400."]]},

{n:24,r:"wa",k:"vlucht",t:"Vlucht naar Perth",p:"Perth",h:"Ibis Perth, Murray Street",tz:8,temp:"12–24°",
 wild:[["Carnabys raafkaketoe","Grote zwarte kaketoes met witte staartvlekken, bedreigd en alleen in het zuidwesten van Australië. In Kings Park, in groepen en luid.",2],
  ["Bobtail","Een dikke, korte skink met een blauwe tong, in de lente actief op paden in Kings Park. Ongevaarlijk.",2],
  ["Quenda","Een kleine buideldas die in de schemering door het struikgewas van Kings Park ritselt.",1]],
 fl:[["QF 1980","Cairns, terminal 2","Darwin","10.45","12.55 (Darwin-tijd)","Qantas, uitgevoerd door Alliance Airlines · 1 koffer"],
     ["QF 1741","Darwin","Perth, terminal 4","14.55","17.20 (Perth-tijd)","Qantas, uitgevoerd door Network Aviation · 1 koffer"]],
 body:[
  "Vandaag vliegen we naar Perth, de hoofdstad van West-Australië. Dit is de langste reisdag van de rondreis, dwars over het continent, met een overstap van twee uur in Darwin. Perth is een van de meest afgelegen grote steden ter wereld. Jakarta ligt er dichterbij dan Sydney. Deze levendige stad ligt ingeklemd tussen de Indische Oceaan en de uitgestrekte outback en staat bekend om haar prachtige stranden en relaxte sfeer.",
  "Afhankelijk van het vluchtschema heb je vandaag nog tijd om Perth te verkennen. Maak bijvoorbeeld een wandeling door Kings Park, de botanische tuin waar je een indrukwekkende verzameling inheemse plantensoorten vindt en geniet van het panoramische uitzicht over de stad. Liever naar de kust? Met het openbaar vervoer ben je zo op Scarborough Beach, een van de bekendste stranden van Perth. Hier kun je heerlijk ontspannen of juist de levendige sfeer opsnuiven tijdens de avondmarkt (op donderdag in de zomer en op zaterdag in de winter) met muziek, kraampjes en een prachtige zonsondergang boven de oceaan.",
  "Het hotel staat midden in het centrum. Alle adressen hieronder liggen binnen vijf minuten lopen."
 ],
 prac:["De klok gaat in twee stappen twee uur terug, een half uur bij aankomst in Darwin, nog anderhalf uur bij aankomst in Perth. De overstap in Darwin is twee uur. Je bagage gaat door, dus je hoeft alleen van gate te wisselen.",
  "West-Australië heeft eigen quarantaineregels. Vers fruit en groente, honing, ongebrande noten, zaden en planten zijn beperkt of verboden. Fabrieksmatig verpakt en bewerkt voedsel (geroosterde noten, chocola, koekjes) mag gewoon mee. Bij twijfel, aangeven of in de bak bij de aankomsthal.",
  "In het centrum rijden de gratis CAT-bussen, herkenbaar aan rood, blauw, geel en groen. Je kunt er zonder kaart of pas op.",
  "Het is hier tien graden koeler dan in Cairns en 's avonds fris aan zee. Je lange broek kun je weer bovenop leggen."],
 food:[["Western rock lobster","De belangrijkste visserij van de staat, en volgens velen de beste kreeft van Australië."],["Marron","Grote zoetwaterkreeft, alleen in het zuidwesten. Zoet en delicaat."],["Chilli mussels","Mosselen in pittige tomatensaus. Een Fremantle-uitvinding."],["Margaret River-wijn","Cabernet en Chardonnay van wereldklasse, drie uur naar het zuiden."],["Little Creatures Pale Ale","Uit de brouwerij aan de haven van Fremantle. Een van de bieren die de Australische ambachtelijke brouwerij op gang bracht."]],
 rest:[["KARLA","Wellington Street",4.9,2,5,"De hoogst gewaardeerde zaak van je hele reis. Moderne vuurkeuken met Aziatische invloeden en inheemse ingrediënten. 'karla' is Noongar voor vuur.","Online via de website van het restaurant. Boek vóór vertrek uit Nederland."],
   ["Ugly Baby","Wellington Street",4.7,2,7,"Mediterraan, deelgerechten, 'feed me'-menu.","Online. Zelfde eigenaar als KARLA."],
   ["The Standard","Roe Street, Northbridge",4.4,2,8,"Rooftop met mooie zonsondergang.","Online via de website van het restaurant."]]},

{n:25,r:"wa",k:"vrij",t:"Perth, vrije dag",p:"Fremantle",h:"Ibis Perth, Murray Street",tz:8,temp:"12–24°",
 wild:[["Tuimelaar","In de haven van Fremantle en op de Swan River bij de veerboten. Ze zwemmen mee met bootjes en jagen bij de kademuren.",2],
  ["Bultrug","Voor de kust van Cottesloe, in oktober met kalveren op weg naar het zuiden. Vanaf het strand met een verrekijker, of vanaf het terras bij zonsondergang.",1],
  ["Visarend","Nestelt op palen en masten in de haven van Fremantle. Kijk omhoog op de kades.",2],
  ["Pelikaan","Op de aanlegsteigers bij Fishing Boat Harbour, wachtend op wat overblijft.",3]],
 body:[
  "Vandaag heb je vrije tijd om Perth en omgeving te ontdekken. Een van de hoogtepunten is de havenstad Fremantle, door de locals vaak Freo genoemd. Vanuit het centrum van Perth reis je in een half uur met de trein naar deze bruisende plek. Onderweg kom je langs de mooiste stranden, waaronder het bekende Cottesloe Beach. Dit strand is ideaal voor een ontspannen dag aan zee, of om simpelweg te genieten van de zonsondergang die hier spectaculair is.",
  "In Fremantle zelf vind je prachtig bewaard gebleven Victoriaanse panden, variërend van kerken en huizen tot gezellige barretjes. Je kunt er een bezoek brengen aan het WA Shipwrecks Museum, met de resten van de Batavia, of aan de historische Fremantle Prison. Als je er in het weekend bent, is de Fremantle Market een aanrader om rond te struinen voor souvenirs en lekkere hapjes. Voor een verfrissende pauze is bierbrouwerij Little Creatures een fijne plek om lokaal bier te proeven. Of zoek de kust weer op bij Bathers Beach, een fijne plek om neer te strijken bij een strandtent voor een hapje of een drankje."
 ],
 prac:["Perth is de enige grote stad van Australië waar de zon ín zee zakt. Overal elders kijk je oostwaarts. Cottesloe Beach is daar de plek voor, op de terugweg uit Fremantle.",
  "In het Shipwrecks Museum staat het originele achterschip van de Batavia, plus de stenen poort die als ballast meevoer en nooit in Batavia is aangekomen. Voor Nederlanders het merkwaardigste museumstuk van de reis.",
  "De Fremantle Market is alleen vrijdag, zaterdag en zondag open. Vandaag treft het dus goed."],
 tip:"Bestel op de Cappuccino Strip de chilli mussels. Dit is waar het gerecht vandaan komt.",
 rest:[["KARLA","Wellington Street",4.9,2,5,"Zondag vanaf 11.00 uur. Kreeg je gisteren geen plek? Probeer het vandaag opnieuw.","Online via de website van het restaurant."],
   ["Ugly Baby","Wellington Street",4.7,2,7,"Zondag vanaf 12.00 uur.","Online."]]},

{n:26,r:"wa",k:"vrij",t:"Perth, vrije dag",p:"Rottnest Island",h:"Ibis Perth, Murray Street",tz:8,temp:"13–23°",
 wild:[["Quokka","Overal, vooral rond Thomson Bay en de nederzetting. Ze komen uit zichzelf op je af. Niet aanraken, niet voeren.",3],
  ["Nieuw-Zeelandse zeebeer","Bij Cathedral Rocks aan het westelijke uiteinde, op de rotsen en in het water. Het uitkijkplatform ligt aan de fietsroute.",3],
  ["Bultrug","Vanaf West End en Cape Vlamingh. Oktober is de beste maand voor walvissen bij Rottnest. Blijf even staan op het uitkijkpunt. Ze laten zich niet meteen zien.",2],
  ["Visarend","Nesten van takken op rotspunten langs de zuidkust, al tientallen jaren in gebruik.",3],
  ["Koningsskink en rifvissen","Skinks in het struikgewas langs de paden. Bij The Basin en Little Salmon Bay zwem je tussen felgekleurde rifvissen.",3]],
 body:[
  "Vandaag heb je de mogelijkheid om Rottnest Island te bezoeken, dat op slechts een half uur varen ligt vanaf de haven van Fremantle. Tickets kun je het beste vooraf reserveren. Vraag de reisbegeleider voor meer informatie. Het eiland is autovrij en de fiets is hier het populairste vervoermiddel. Bij aankomst kun je een fiets huren en het eiland verkennen langs felblauwe wateren, witte verlaten stranden, rotsachtige baaien en tropische planten. Vergeet je zwemspullen niet, want dit is ook de perfecte plek om te zwemmen, snorkelen en duiken.",
  "Naast de prachtige natuur staat Rottnest Island bekend om de beroemde quokka’s, kleine buideldiertjes die ook wel het gelukkigste dier ter wereld worden genoemd vanwege hun permanente ‘glimlach’ en het gebrek aan natuurlijke vijanden. Aan hen dankt het eiland zijn naam. Willem de Vlamingh zag ze in 1696 voor grote ratten aan en noemde het ’t Eylandt ’t Rottenest. Het is een unieke ervaring om deze vrolijke diertjes van dichtbij te zien terwijl je langs de idyllische kust fietst."
 ],
 prac:["Vaar vanuit Fremantle, niet vanuit Perth of Hillarys. De overtocht is korter en goedkoper. Vanuit de stad ben je bijna twee keer zo lang onderweg.",
  "Quokka's aanraken en voeren is verboden en er staat een boete op. Ze komen uit zichzelf dichtbij. Ga op je hurken zitten en wacht.",
  "Er is één winkel op het eiland, bij Thomson Bay, en die is duur. Neem je lunch mee vanaf het vasteland.",
  "Boek de veerboot vooraf bij Rottnest Express of SeaLink. Op mooie dagen zit hij vol."],
 rnote:"Ugly Baby en The Standard zijn maandag gesloten. Deze twee niet.",
 rest:[["KARLA","Wellington Street",4.9,2,5,"Maandag open vanaf 17.30 uur.","Online via de website van het restaurant."],
   ["Italian Street Kitchen","Raine Square, William Street",4.4,2,3,"Drie minuten lopen, zeven dagen open.","Online, of binnenlopen."]]},

{n:27,r:"wa",k:"excursie",t:"Naar de Pinnacles",p:"Nambung National Park",
 emoe:[1,"In Nambung National Park tussen de pilaren, vooral vroeg en laat op de dag. Laatste kans van de reis."],h:"Ibis Perth, Murray Street",tz:8,temp:"12–27° in de woestijn",
 wild:[["Westelijke grijze reuzenkangoeroe en emoe","In Nambung, vooral in de vroege ochtend en late middag tussen de pilaren. Midden op de dag zoeken ze schaduw.",1],
  ["Bobtail","De dikke blauwtongskink zont in de lente op de zandpaden van de Pinnacles.",2],
  ["Stromatolieten","Geen dier maar het oudste leven op aarde, levende kolonies bacteriën in Lake Thetis, vlak bij Cervantes, met een wandelpad eromheen. Vraag of de bus er langsgaat.",3],
  ["Wildflowers","Oktober is het hoogtepunt van de wildflowerbloei in West-Australië. Langs de Indian Ocean Drive kleurt de berm geel, roze en paars.",3]],
 body:[
  "Vandaag rijden we ten noorden van Perth naar Nambung National Park, waar we de beroemde Pinnacles Woestijn bezoeken. Deze bijzondere plek staat bekend om de duizenden kalkstenen pilaren die uit het gouden zand oprijzen en een surrealistisch landschap creëren. Ze zijn ontstaan uit fossiele schelpresten die tot kalksteen verhardden, waarna de wind het losse zand eromheen wegblies.",
  "Je kunt hier een korte wandeling maken tussen de Pinnacles door of gewoon genieten van het uitzicht vanaf de aangewezen paden. Vergeet je camera niet, want dit is een perfecte plek voor indrukwekkende foto’s en een unieke ervaring in de Australische natuur. De rit gaat langs de Indian Ocean Drive. Aan het einde van de dag rijden we weer terug naar Perth, waar je kunt ontspannen en de ervaringen van vandaag kunt laten bezinken."
 ],
 prac:["De Discovery Drive door de Pinnacles is eenrichtingsverkeer, maar te voet mag je overal tussen de pilaren door lopen. Dat levert veel betere foto's op dan vanuit de bus.",
  "Stopt de groep in Cervantes? Daar zit de Lobster Shack, een kreeftverwerkingsbedrijf met restaurant. De western rock lobster is er vers en relatief betaalbaar."],
 rest:[["KARLA","Wellington Street",4.9,2,5,"Dinsdag vanaf 17.30 uur. Een passende laatste avond, inheemse ingrediënten uit heel Australië op één kaart.","Online via de website van het restaurant."],
   ["Italian Street Kitchen","Raine Square",4.4,2,3,"Ook dinsdag open.","Online."]]},

{n:28,r:"reis",k:"vlucht",t:"Vlucht Perth – Amsterdam",p:"Perth → Schiphol",tz:8,
 fl:[["SQ 214","Perth, terminal 1","Singapore Changi","17.05","22.10 (Singapore-tijd)","Singapore Airlines · 25 kg"],
     ["SQ 324","Singapore Changi, terminal 3","Amsterdam Schiphol","23.55","06.55 (29 okt, Nederlandse tijd)","Singapore Airlines · 25 kg"]],
 body:[
  "De rondreis zit er alweer op en waarschijnlijk is de tijd voorbij gevlogen! We vertrekken met het vliegtuig naar Amsterdam, waar je afscheid neemt van de groep. Je vliegt pas om 17.05 uur, dus de ochtend in Perth is nog vrij. Overstap in Singapore van 1 uur en 45 minuten, aankomst op Schiphol de volgende ochtend om 06.55 uur."
 ],
 prac:["Je vertrekt pas om 17.05 uur. Vraag het hotel om een late uitcheck of laat je bagage achter, en gebruik de ochtend voor Kings Park of een laatste wandeling langs de Swan River. Op het vliegveld wil je rond 14.30 uur zijn.",
  "Vraag de GST terug via het Tourist Refund Scheme. Voorwaarden: minimaal A$300 inclusief GST bij één leverancier (zelfde ABN-nummer, mag over meerdere bonnen), gekocht binnen zestig dagen vóór vertrek, met een geldige tax invoice. Boven A$1.000 moet je naam op de bon staan. Het artikel moet je kunnen tonen. Dus in je handbagage.",
  "De TRS-balie zit ná de paspoortcontrole en er staat vaak een rij. Wees er ruim op tijd. Grote of ingecheckte artikelen moet je vóór het inchecken laten zien bij de balie van de Australian Border Force in de vertrekhal, anders vervalt de teruggave.",
  "Honing mag de EU in, vlees en zuivel van buiten de EU niet. Tim Tams, macadamianoten en een fles Margaret River-wijn zijn de veilige souvenirs."]},

{n:29,r:"reis",k:"vlucht",t:"Aankomst Amsterdam",p:"Thuis",tz:null,
 fl:[["SQ 324","Singapore Changi","Amsterdam Schiphol","23.55 (28 okt)","06.55","Singapore Airlines"]],
 body:[
  "Om 06.55 uur land je op Schiphol. Welkom thuis."
 ],
 prac:["De terugreis gaat naar het westen en valt meestal lichter dan de heenreis. Je dag wordt langer in plaats van korter. Blijf de eerste dag zoveel mogelijk buiten in het daglicht en ga niet vóór 22.00 uur naar bed, dan ben je er in twee dagen doorheen."]}
];

const PACK=[
 ["Warme laag en windjack","Vandaag is het aanzienlijk kouder dan waar je vandaan komt.",[5,7]],
 ["Zwemkleding","Vandaag kun je het water in.",[4,20,22,26]],
 ["Schoongeborstelde wandelschoenen","Modder aan je zolen is een quarantaine-item bij aankomst.",[1]],
 ["Muggenspul","Onder het bladerdak zijn ze er de hele dag. Zonnebrand heb je er juist niet nodig.",[23]],
 ["Medicijnen in originele verpakking","Met bijsluiter en zo nodig een Engelse doktersverklaring.",[1]],
 ["Reisstekker type I","Platte schuine pennen, dezelfde in heel Australie.",[1]],
 ["Handdoek en droge kleren in je dagtas","Omkleden kan onderweg alleen bij de kloof zelf.",[20]],
 ["Verrekijker, als je er een hebt","Walvissen voor de kust zie je zonder kijker alleen als spuit. Oktober is trekseizoen aan beide kusten.",[4,10,15,25,26]],
 ["Bonnen boven A$300 bij de hand","Voor de btw-teruggave op het vliegveld.",[27,28]],
 ["Muts en warme jas","Voor de pinguïntour: je staat na zonsondergang een tijd stil aan zee.",[8]],
 ["Legitimatiebewijs","Voor het zeebad van Bondi Icebergs, aan het eind van de wandeling.",[4]],
 ["Picknicklunch","Op dag 6 gekocht in Launceston, of vanochtend vroeg bij Banjo's.",[7]],
 ["Lunchpakket","Of je luncht in de bergen. Betalen kan daar alleen met een kaart.",[5]]
];

const EXC=[
 ["BridgeClimb",4,"Geboekt · 16.35 uur","Verzet van dag 3 vanwege onweer. Klimmen over de boog van de Harbour Bridge tot 134 meter boven de haven, vastgeklikt aan een rail, met zonsondergang onderweg. Ongeveer drie en een half uur. Fototoestellen mogen niet mee. De gids maakt de foto's."],
 ["Rondleiding Sydney Opera House",3,"Geboekt · 09.00 uur","Rondleiding van een uur door de zalen en foyers. Melden bij het Welcome Centre op de Lower Concourse, een kwartier vooraf."],
 ["Scenic World Blue Mountains",5,"A$64, niet inbegrepen","In het hoogseizoen verplicht bij Scenic World, ook als je er alleen wilt lunchen of winkelen. Alleen met een creditcard of een Visa Debit- of Debit Mastercard-pas. Combikaart voor drie ritten, de steilste passagiersspoorlijn ter wereld met een helling van 52 graden, een kabelbaan over het Jamison-dal, en een boardwalk door het regenwoud beneden. Onbeperkt op en neer, reken op twee uur."],
 ["Pingu\u00efntour Bicheno",8,"Geboekt \u00b7 19.15 uur","Zelf geboekt via GetYourGuide; het verzamelpunt staat op de voucher. Avondwandeling met een gids naar een pingu\u00efnkolonie aan de oostkust van Tasmani\u00eb. De kleine pingu\u00efns komen na zonsondergang aan land. Ongeveer een uur. Flitsen mag niet."],
 ["MONA inclusief ferry",10,"\u00b1 A$65","Veerboot over de Derwent naar het grotendeels ondergrondse museum van David Walsh. Moderne kunst die bewust schuurt, uitgehakt in de zandsteen. Reken op een halve dag. De overtocht duurt een half uur."],
 ["Pennicott Tasman Island, hele dag",10,"\u20ac 210 via Sawadee","Van 07.30 tot 18.00 uur: naar het Tasman National Park en drie uur in een open boot langs de hoogste zeekliffen van het zuidelijk halfrond, met watervallen, rotsbogen en zeegrotten, zeehonden, dolfijnen, zeevogels en in het seizoen walvissen. Inchecken om 07.15 uur bij de haven. Koffie of thee met een muffin en de lunch zijn inbegrepen. Kleed je warm aan. De zee staat er vaak ruw, dus niet doen als je snel zeeziek wordt. Niet te combineren met MONA."],
 ["Fietstour Melbourne",17,"\u20ac 100 via Sawadee","Ongeveer vier uur fietsen met een lokale gids langs de Yarra River, de Shrine of Remembrance, de Melbourne Cricket Ground, Parliament House en de straatkunst van Hosier Lane, met verhalen over de stad onderweg. Sawadee biedt hem vooraf aan."],
 ["Helikoptervlucht Uluru",18,"A$180\u2013250, zelf boeken","Boven Uluru en Kata Tjuta; alleen vanuit de lucht zie je hoe de rots in het vlakke land ligt. Zelf te boeken via flyuluru.com.au, en door het programma past alleen de sunset flight. Kies je die, dan mis je de zonsondergang bij het uitzichtpunt met de groep."],
 ["Sounds of Silence-diner",18,"\u00b1 A$285","Diner in de openlucht in de duinen. Champagne bij zonsondergang met zicht op Uluru, buffet met inheemse ingredi\u00ebnten, en na het eten gaan de lampen uit voor een sterrenkijksessie met een gids. Ongeveer vier uur."],
 ["Daintree en Cape Tribulation",23,"\u20ac 75 via Sawadee","Hele dag met gids: cruise op de Daintree River op zoek naar krokodillen, boardwalk door het oudste regenwoud ter wereld, een 4WD-tocht door het bos en het strand van Cape Tribulation waar het bos de zee raakt, met een Daintree-ijsje op de terugweg. Zwemmen kan er niet."],
 ["Great Barrier Reef Cruise",22,"\u20ac 230 via Sawadee","Van 08.15 tot 17.00 uur: in anderhalf uur vanuit Cairns naar een ponton op Moore Reef, en dan vijf uur op het rif. Snorkelen, een glasbodemboot en het onderwaterobservatorium zijn inbegrepen, net als een buffetlunch. Tegen bijbetaling een snorkeltour met een marien bioloog, een introductieduik of een helikoptervlucht boven het rif. Reken op een aparte rifheffing."],
 ["Kuranda-trein en Skyrail",23,"\u00b1 A$140","Historische trein uit 1891 omhoog door vijftien tunnels en langs de Barron-watervallen naar het bergdorp Kuranda, en met de kabelbaan over het bladerdak terug. Als combinatieticket goedkoper dan los."],
 ["Fremantle Prison",25,"\u00b1 A$25","Rondleiding door de gevangenis die dwangarbeiders in de negentiende eeuw voor zichzelf bouwden en die tot 1991 in gebruik bleef. UNESCO-werelderfgoed. Anderhalf uur. Er is ook een tunneltour door de watergangen eronder."],
 ["Rottnest met veerboot en fiets",26,"\u00b1 A$110","Overtocht vanuit Fremantle plus een huurfiets voor de dag. Het rondje over het eiland is ongeveer 22 kilometer langs baaien en zoutmeren, met genoeg afslagen om het korter te maken."]
];

// ============================================================
//  RESTAURANTGEGEVENS. Één blok, los van de rest van de app
//  c   = aantal Google-beoordelingen
//  tel = telefoonnummer (null = onbekend)
//  sluit = sluitingstijd volgens Google op de avond dat je er bent.
//          Keukens stoppen vaak 30 minuten eerder met bestellen
//  Bron: Google Maps, opgehaald op 5 september 2026.
// ============================================================
const CHECKED='5 sep 2026';
// Inchecklinks per maatschappij. De boekingscodes staan NIET in dit bestand, want het is openbaar.
// De app leest ze uit een notitie van het type Ticket, één regel per maatschappij, zoals "SQ: ABC123".
const CHECKIN={
"SQ":["Singapore Airlines","https://www.singaporeair.com/en_UK/plan-and-book/check-in-online/","vanaf 48 uur vooraf"],
"JQ":["Jetstar","https://www.jetstar.com/au/en/help/checking-in","vanaf 48 uur vooraf, sluit 1 uur voor vertrek"],
"QF":["Qantas","https://www.qantas.com/au/en/travel-info/check-in.html","vanaf 24 uur vooraf"],
"VA":["Virgin Australia","https://www.virginaustralia.com/","vanaf 24 uur vooraf"],
"TL":["Airnorth","https://www.airnorth.com.au/","vanaf 24 uur vooraf"]};
// Overige partijen in het blok Vluchten en boekingen (naam, omschrijving, sleutel in de codenotitie)
const BOEKINGEN=[["Sawadee","Reisbureau, +31 20 420 2220","Sawadee"]];
const SRC='Google';
const RDATA={
// Voorreis (Nhulunbuy en Darwin). Geen looptijd: er is nog geen hotel bekend.
"Latitude 12":{k:"Australisch · bij het zwembad van de lodge",c:20,tel:"+61 8 8939 2000"},
"The Waterfront Kitchen":{k:"Clubkeuken · aan het water",c:5,tel:"+61 400 338 127",sluit:"20.00"},
"MERAKI Greek Taverna":{k:"Grieks",c:735,tel:"+61 486 030 985",sluit:"21.00"},
"Beef & Bar Restaurant":{k:"Steakhouse · zeevruchten",c:483,tel:"+61 8 8941 6178",sluit:"21.30"},
"Snapper Rocks":{k:"Zeevruchten",c:768,tel:"+61 8 8900 6928",sluit:"21.00"},
"Chef Chen Dumplings":{wv:1,k:"Chinees",c:521,tel:"+61 412 740 664",sluit:"21.30"},
"Ho Jiak":{wv:1,k:"Maleisisch",c:5884,tel:"+61 2 8040 0252",sluit:"23.00"},
"Temu Kangen":{k:"Indonesisch",c:716,tel:"+61 432 520 588",sluit:"21.30"},
"NOMAD":{wv:1,k:"Modern Australisch",c:2847,tel:"+61 2 9280 3395",sluit:"21.30"},
"Mishy's":{wv:1,k:"Modern Australisch",c:450,tel:"+61 2 5657 2925",sluit:"22.00"},
"Dae Jang Kum":{wv:1,k:"Koreaanse barbecue",c:6329,tel:"+61 2 9211 0890",sluit:"02.00"},
"Spice World":{wv:1,k:"Chinese hotpot",c:1189,tel:"+61 406 697 900",sluit:"23.00"},
"Nanjing Dumpling":{wv:1,k:"Chinees",c:1685,tel:"+61 499 333 808",sluit:"21.30"},
"Kawan Dining":{wv:1,k:"Aziatische fusion",c:540,tel:"+61 402 097 388",sluit:"21.00"},
"Tres":{wv:1,k:"Latijns-Amerikaans",c:352,tel:"+61 3 6351 7536",sluit:"22.00"},
"Mudbar":{wv:1,k:"Modern Australisch",c:2182,tel:"+61 3 6334 5066",sluit:"00.00"},
"Cataract on Paterson":{wv:1,k:"Steakhouse · zeevruchten",c:3040,tel:"+61 3 6331 4446",sluit:"21.00"},
"Sealife Restaurant":{k:"Zeevruchten en vlees",c:561,tel:"+61 3 6375 1121",sluit:"20.00"},
"Lobster Shack":{k:"Zeevruchten",c:3384,tel:"+61 3 6375 1588",sluit:"19.00"},
"Peppina":{wv:1,k:"Italiaans",c:842,tel:"+61 3 6240 6000",sluit:"20.30"},
"Syra":{wv:1,k:"Midden-Oosters",c:450,tel:"+61 3 6287 6286",sluit:"21.00"},
"Ball & Chain Grill":{wv:1,k:"Grill en steak",c:2209,tel:"+61 3 6223 2655",sluit:"21.30"},
"Latteria":{wv:1,k:"Italiaans",c:230,tel:"+61 8 8102 3775",sluit:"00.00"},
"The Logical Indian":{wv:1,k:"Zuid-Indiaas",c:594,tel:"+61 8 7133 5856",sluit:"21.30"},
"Sofia":{wv:1,k:"Grieks-mediterraan",c:686,tel:"+61 400 400 343",sluit:"22.30"},
"Chianti":{wv:1,k:"Italiaans",c:1119,tel:"+61 8 8232 7955",sluit:"22.00"},
"Part Time Lover":{wv:1,k:"Modern Australisch · deelgerechten",c:1999,tel:"+61 488 448 807",sluit:"22.00"},
"Thyme at the Lakes":{k:"Modern Australisch",c:268,tel:"+61 8 8723 9754",sluit:"22.00"},
"The Barn Steakhouse":{k:"Steakhouse",c:1231,tel:"+61 8 8726 9999",sluit:"22.00"},
"Lost Cat":{wv:1,k:"Mediterraan · houtvuur",c:142,tel:"+61 3 5561 1952",sluit:"20.30"},
"Lot 17":{wv:1,k:"Mediterraan · deelgerechten",c:55,tel:"+61 434 241 717",sluit:"20.30"},
"Salt":{wv:1,k:"Modern Australisch · Franse invloeden",c:134,tel:"+61 3 5562 7728",sluit:"21.00"},
"Pastuso":{wv:1,k:"Peruaans",c:4053,tel:"+61 3 9662 4556",sluit:"22.30"},
"MoVida Next Door":{wv:1,k:"Spaans",c:749,tel:"+61 3 9663 3038",sluit:"22.00"},
"MoVida":{wv:1,k:"Spaans",c:2370,tel:"+61 3 9663 3038",sluit:"22.30"},
"Ca De Vin":{wv:1,k:"Mediterraan · Italiaans",c:2459,tel:"+61 3 9654 3639",sluit:"21.30"},
"Arnguli Grill":{wv:1,k:"Grill · modern Australisch",c:224,tel:null,sluit:"20.30"},
"Ilkari Restaurant":{wv:1,k:"Buffet",c:337,tel:null,sluit:"21.30"},
"Outback BBQ & Bar":{wv:1,k:"Barbecue",c:181,tel:null,sluit:"21.00"},
"Q Eats":{wv:1,k:"Thais",c:164,tel:"+61 476 763 067",sluit:"20.30"},
"Warung Makan":{wv:1,k:"Indonesisch",c:412,tel:"+61 418 391 119",sluit:"20.00"},
"Little Sister":{wv:1,k:"Aziatische fusion · zeevruchten",c:1034,tel:"+61 7 4031 5400",sluit:"21.00"},
"Dundees on the Waterfront":{wv:1,k:"Zeevruchten · Australisch",c:5564,tel:"+61 7 4051 0399",sluit:"21.30"},
"Sails":{wv:1,k:"Peruaans-Aziatisch",c:103,tel:"+61 403 441 669",sluit:"21.00"},
"KARLA":{wv:1,k:"Moderne vuurkeuken · Aziatisch",c:3775,tel:"+61 8 6275 8888",sluit:"22.30"},
"Ugly Baby":{wv:1,k:"Mediterraan",c:1159,tel:"+61 8 6275 8888",sluit:"22.15"},
"The Standard":{wv:1,k:"Mediterraan · deelgerechten · rooftop",c:1109,tel:"+61 8 6285 7068",sluit:"00.00"},
"Italian Street Kitchen":{wv:1,k:"Italiaans",c:1051,tel:"+61 8 6163 8808",sluit:"22.00"}
};
// Prijsindicatie afgeleid van de Google-prijsklasse, een schatting en geen menuprijs
const PRICE={
 1:["Hoofdgerecht tot AUD 20","Diner ± AUD 30–40 p.p. excl. drank"],
 2:["Hoofdgerecht AUD 30–45","Diner ± AUD 55–75 p.p. excl. drank"],
 3:["Hoofdgerecht AUD 45–65","Diner ± AUD 90–120 p.p. excl. drank"],
 4:["Menu vanaf ± AUD 130","Diner ± AUD 150+ p.p. excl. drank"]};
const ROLE=["Eerste keuze","Alternatief","Reserve"];
const MIN_SCORE=4.4;

// ============================================================
//  WINKELS BIJ HET HOTEL. Niet elk hotel serveert ontbijt, en soms vertrekken we ervoor. Per hotel
//  de dichtstbijzijnde supermarkt en, als die vroeg open is, een bakker. Het blok staat op elke dag
//  met dat hotel, onder Eten vanavond. Per winkel: naam, soort, straat, looptijd in minuten vanaf het
//  hotel (geschat zoals bij de restaurants, hemelsbreed plus een kwart), openingstijden op de dagen dat
//  we er zijn, en een opmerking. De opmerking zegt niets over ontbijt in het hotel (dat weten we niet),
//  wel over openingstijden tegenover een vaste vertrektijd uit het programma.
//  Bron: Google Maps, opgehaald op 14 september 2026.
// ============================================================
const WINKELS={
"The Ultimo, Haymarket":[
 ["Woolworths Metro","supermarkt","Quay Street",1,"7.00–23.00","Vlak naast het hotel: brood, fruit, yoghurt en broodjes uit het koelvak. Op de vertrekdag naar Launceston (dinsdag, vertrek 05.00 uur) is hij nog dicht als je weggaat, dus maandag inslaan. Dat is Labour Day, en op een feestdag kan hij korter open zijn: ga meteen als je om 17.00 uur terug bent uit de Blue Mountains. De bakkers in Haymarket openen pas om 9.00 of 10.00 uur."]],
"Hotel Grand Chancellor, Cameron Street":[
 ["Bread + Butter Bakeshop","bakker","Cimitiere Street",3,"7.00–14.00","Om de hoek. Croissants, focaccia en broodjes. Op zondag dicht, maar jullie zijn er woensdag en donderdag."],
 ["Woolworths","supermarkt","West Tamar Highway",11,"7.00–23.00","De grote supermarkt van het centrum, met eigen bakkerij."],
 ["Banjo's Bakehouse","bakker","Brisbane Street",7,"vanaf 5.00","Volgens de reisbegeleider de plek voor de picknicklunch van dag 7, als je die op dag 6 nog niet hebt gekocht. Om 05.00 uur al open, ruim voor het vertrek van 07.30 uur."]],
"Wintersun Gardens Motel, Gordon Street":[
 ["Blue Edge Bakery","bakker","Burgess Street",22,"5.00–15.00","Het ontbijtadres van Bicheno: pies, broodjes, koffie en een echt ontbijt, al vanaf vijf uur. Ook een goede scallop pie. Het ligt in het centrum, ruim twintig minuten lopen van het motel."],
 ["IGA","supermarkt","Foster Street",21,"8.00–18.00","Supermarkt in het centrum, met brood van de bakker, fruit en zuivel. Sluit om zes uur, dus inslaan voor het avondeten of het ontbijt doe je meteen na aankomst."]],
"Ibis Styles, Macquarie Street":[
 ["Daci & Daci","bakker","Murray Street",7,"7.00–17.00","Bakker met ontbijt, vlak bij de haven. Croissants, danish en broodjes om mee te nemen."],
 ["Woolworths","supermarkt","Argyle Street",10,"7.00–22.00","Grote supermarkt in het centrum, elke dag dezelfde tijden."]],
"The Terrace Hotel, South Terrace":[
 ["IGA","supermarkt","Gilbert Street",7,"7.00–21.30","Buurtsupermarkt, ook op zondagavond open tot half tien."],
 ["The Old Croissant Factory","bakker","Hutt Street",12,"8.00–14.00","Kleine bakker met croissants en danish. Op maandag dicht, en dag 12 is een maandag; dinsdag wel open."]],
"Comfort Inn Western, Kepler Street":[
 ["IGA","supermarkt","Timor Street",1,"7.30–21.00","Om de hoek. Goed gesorteerd, met kant-en-klare maaltijden."],
 ["Coles","supermarkt","Lava Street",9,"6.00–21.00","Voor wie vroeg weg wil: al open om zes uur."],
 ["Browns Depot Bakery","bakker","Koroit Street",8,"7.00–15.00","Pies, broodjes en gebak. Vrijdag gewoon open."]],
"Ibis Melbourne, Therry Street":[
 ["Woolworths Metro","supermarkt","Elizabeth Street",5,"6.00–23.00, weekend vanaf 7.00","Op de vertrekdag naar Uluru (zondag, vlucht 08.50 uur) opent hij pas om zeven uur; met een vertrek rond half zeven is dat te krap, dus zaterdagavond inslaan."],
 ["Queen Victoria Market","bakker","Queen Street, Dairy Produce Hall",3,"6.00–15.00","Woodfrog Bakery en M&G Caiafa in de markthal: croissants en brood. De markt is dicht op maandag en woensdag; jullie zijn er vrijdag en zaterdag."]],
"Outback Hotel & Lodge, Ayers Rock Resort":[
 ["IGA","supermarkt","Town Square, Yulara",10,"9.00–20.00, vr–zo vanaf 8.00","Te voet of met de gratis resortshuttle. Op maandag gaat hij pas om negen uur open, dus voor de busreis naar Alice Springs zondagavond inslaan."],
 ["Kulata Academy Cafe","bakker","Town Square, Yulara",10,"7.00–14.00","Broodjes, pies en gebak om mee te nemen, naast de IGA."]],
"Desert Palms Resort, Barrett Drive":[
 ["Coles","supermarkt","Bath Street",23,"7.00–19.00","In het centrum, dus overdag lopen of een taxi. Sluit al om zeven uur: koop vóór het avondeten."],
 ["Woolworths","supermarkt","Bath Street",25,"7.00–19.00","Even verderop dan Coles, dezelfde tijden. Geen bakker in de buurt van het hotel."]],
"Cairns Plaza Hotel, Esplanade":[
 ["Woolworths","supermarkt","Abbott Street",14,"6.00–22.00, weekend vanaf 7.00","Grote supermarkt met bakkerij. Op de vertrekdag naar Perth (zaterdag) vanaf zeven uur open, ruim voor de vlucht van 10.45 uur."],
 ["Palms Supermarket","supermarkt","Aplin Street",8,"6.00–24.00","Dichterbij en lang open, maar fors duurder dan Woolworths."]],
"Ibis Perth, Murray Street":[
 ["Coles","supermarkt","Raine Square",3,"8.00–21.00, za tot 17.00, zo 11.00–17.00","Om de hoek, maar Perth houdt korte winkeltijden: bij aankomst op zaterdagavond is hij al dicht, en zondag gaat hij pas om elf uur open."],
 ["CBD Supermarket","supermarkt","Hay Street",11,"za 10.00–21.00, zo 10.00–20.00, ma–do 7.00–20.00","De winkel voor de zaterdagavond na aankomst en de zondagochtend."],
 ["City Convenience Store","supermarkt","Murray Street",5,"6.30–24.00","Buurtwinkel voor het hoognodige, elke dag vroeg open."],
 ["Croff Bakehouse","bakker","Raine Square",2,"7.00–14.30, weekend dicht","Croissants en broodjes, alleen op werkdagen: maandag, dinsdag en woensdag."]]
};
const WINKELS_CHECKED='14 sep 2026';

// Praktisch: noodgevallen en bagage. Wordt in het tabblad Praktisch getoond én doorzocht.
const SOS=["000","Politie, brandweer en ambulance in heel Australië. Vanaf een mobiel werkt 112 ook."];
const NOOD=[
 ["Consulaat-generaal Sydney","+61 2 8305 6800. Je aanspreekpunt bij verlies van je paspoort. Level 23, Westfield Tower 2, 101 Grafton Street, Bondi Junction."],
 ["Ambassade Canberra","+61 2 6220 9400. Geen consulaire balie, maar wel bereikbaar."],
 ["Buitenlandse Zaken, 24/7","+31 247 247 247, of WhatsApp +31 857 737 400. Werkt dag en nacht, ook met tijdverschil."],
 ["Bij verlies van je paspoort","Eerst aangifte bij de lokale politie, dán bellen. Zonder proces-verbaal krijg je geen noodpaspoort."],
 ["Zelf invullen vóór vertrek","Nummer van je reisverzekering, alarmcentrale en je reisbegeleider. Schrijf ze op papier en stop dat in je koffer. Niet alleen in je telefoon."]
];
const BAGAGE="Singapore Airlines: 25 kg. Jetstar en Airnorth: 20 kg. Qantas: 1 koffer. Cabinebagage overal maximaal 7 kg. Pak dus op 20 kilo. Online inchecken doe je met de boekingscode plus je achternaam. Tik op de naam van de maatschappij. Bij Jetstar sluit het inchecken een uur voor vertrek, dus doe het de avond ervoor.";
