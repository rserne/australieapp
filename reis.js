// AustralieApp — reisdata. Alleen inhoud; de code staat in app.js.
// Controleer na een wijziging met: node check.js

const START=new Date(2026,9,1);
// Wie eerder gaat of langer blijft: aantal dagen vóór 1 oktober en na 29 oktober waarvoor
// notities gemaakt kunnen worden (0 = uit). Wie er gaat, leest de app af uit de notities zelf.
const VOORREIS=13, NAREIS=0;
// Beeld en tint van de kop voor de voorreis en nareis (ook op het kaartje in de fotostrook en op de
// startpagina van wie eerder gaat of langer blijft). Nieuwe foto: 1200×500, ook toevoegen aan BEELD in sw.js.
const BUITEN={voorreis:{foto:"reg-voorreis.jpg",tone:"#014959"}, nareis:{foto:"reg-nareis.jpg",tone:"#640D49"}};
const TONE={reis:"#2C313A",nsw:"#124C6B",tas:"#1B4C39",sa:"#5A2440",
  vic:"#343A73",red:"#8E3B18",qld:"#0E5B5A",wa:"#8A5411"};
const HOTELGEO={
 "The Ultimo, Haymarket":[-33.8806794,151.2034411],
 "Hotel Grand Chancellor, Cameron Street":[-41.4344888,147.1405693],
 "Beachfront Bicheno, Tasman Highway":[-41.8743592,148.2998864],
 "Ibis Styles, Macquarie Street":[-42.8860825,147.3255957],
 "The Terrace Hotel, South Terrace":[-34.9351093,138.6042935],
 // Dag 13 en 14 hebben bewust geen h: Sawadee heeft nog niet vastgelegd of het het Blue Lake Motel
 // of het Mountain View Motor Inn wordt (de note op die dagen legt het uit). Zodra het bekend is:
 // h: toevoegen op beide dagen en hier de coördinaten.
 "Comfort Inn Western, Kepler Street":[-38.3845355,142.4797355],
 "Desert Palms Resort, Barrett Drive":[-23.7133953,133.8798204],
 "Cairns Plaza Hotel, Esplanade":[-16.9157099,145.7725368],
 "Ibis Perth, Murray Street":[-31.9516494,115.8557652],
 "Ibis Melbourne, Therry Street":[-37.8069565,144.9613627],
 "Outback Hotel & Lodge, Ayers Rock Resort":[-25.2430473,130.9896141]
 // Cradle Mountain staat niet in de accommodatielijst van Sawadee; de link zoekt daarom
 // op naam in plaats van op een aangenomen locatie.
};
const REGION={reis:"Onderweg",nsw:"New South Wales",tas:"Tasmanië",sa:"Zuid-Australië",
  vic:"Victoria",red:"Northern Territory",qld:"Queensland",wa:"West-Australië"};

const DAYS=[
{n:1,r:"nsw",k:"vlucht",t:"Vlucht Amsterdam – Sydney",p:"Schiphol → Sydney",tz:null,
 fl:[["SQ 323","Amsterdam Schiphol","Singapore Changi","10.20","05.30 (2 okt, lokale tijd)","Singapore Airlines · 25 kg ruim, 7 kg cabine"]],
 body:[
  "Vertrek om 10.20 uur vanaf Schiphol met Singapore Airlines. Je vliegt in twee etappes met een overstap van 1 uur en 45 minuten in Singapore. Onderweg schuift de klok acht uur vooruit; na het ingaan van de Australische zomertijd op dag 4 wordt dat negen."
 ],
 prac:["Vul de inreiskaart eerlijk in. Australië is streng op biosecurity: ook een appel of zakje noten uit het vliegtuig moet je aangeven. Aangeven kost niets, niet-aangeven levert een boete op van honderden dollars.",
  "Hout, zaden, veren en ongewassen wandelschoenen met modder eraan vallen er ook onder. Borstel je schoenen thuis schoon.",
  "Pak op 20 kilo, niet op 25. Vier van je binnenlandse vluchten gaan met Jetstar, dat strikt weegt en fors bijrekent bij overschrijding; cabinebagage maximaal 7 kg. De extra ruimte die Singapore Airlines je op de heenreis geeft, kun je in Australië niet gebruiken."]},

{n:2,r:"nsw",k:"vlucht",t:"Aankomst Sydney",p:"Sydney",h:"The Ultimo, Haymarket",tz:10,temp:"14–22°",
 fl:[["SQ 241","Singapore Changi, terminal 3","Sydney Kingsford Smith, terminal 1","07.15","16.45","Singapore Airlines · 25 kg"]],
 body:[
  "Het grote bijzondere Australië, met zijn unieke natuur en cultuur, ligt niet dichtbij. Na een lange vlucht land je om 16.45 uur in Sydney, de grootse stad van Australië. Met douane, bagage en de rit naar de stad ben je rond 18.30 uur bij het hotel. Vanavond wil je waarschijnlijk rustig aan doen en wennen aan het tijdverschil.",
  "Sydney geeft je zeker de goede energie om weer op te laden, we verblijven hier dan ook vier nachten. Je slaapt in The Ultimo in Haymarket, midden in Chinatown, drie minuten van de tramhalte en vijf van Central Station."
 ],
 prac:["In Sydney hoef je geen Opal-kaart te kopen. Je checkt in en uit met je bankpas of telefoon, op bus, trein, tram én veerboot.",
  "Kraanwater is overal drinkbaar en gratis bijvullen kan bij vrijwel elk café. Flesjes water zijn hier duur.",
  "Je bent rond 18.30 uur in het hotel, dus je hebt de avond nog. De meeste keukens sluiten om 21.00 uur; ga niet te laat eten."],
 food:[["Sydney rock oysters","Kleiner en romiger dan de Europese oester."],["Barramundi","Stevige witvis, de nationale vis van Australië."],["Meat pie","Hartig gebakje met rundvlees, met tomatensaus."],["Lamington","Cakeblokje met chocolade en kokos."],["Pavlova","Meringuetaart met slagroom en fruit."],["Fairy bread","Witbrood met boter en gekleurde hagelslag. Kinderfeestjeskost, maar het staat serieus op de lijst van nationale gerechten."]],
 rest:[["Chef Chen Dumplings","Quay Street, Haymarket",4.6,2,3,"Letterlijk om de hoek. Dumplings, xiao long bao en gebraden gerechten, ruime porties, snelle bediening.","Niet nodig. Klein en druk, maar er komt snel een tafel vrij."],
   ["Ho Jiak","Hay Street, Haymarket",4.5,2,5,"Maleisisch, een van de bekendste van Sydney. Druk en levendig.","Online via de website van het restaurant. Zonder reservering reken je op wachten."]]},

{n:3,r:"nsw",k:"vrij",t:"Sydney: Opera House en Harbour Bridge",p:"Sydney",h:"The Ultimo, Haymarket",tz:10,temp:"14–22°",
 wild:[["Bultrug","Vanaf de veerboot naar Manly en vanaf North Head. De walvissen trekken in oktober met hun kalveren zuidwaarts langs de kust; de ferry vaart door de havenmond.",2],
  ["Grijskopvleerhond","Bij zonsondergang boven de Royal Botanic Garden en de haven: honderden grote vleermuizen die naar hun voedselbomen vliegen. Kijk omhoog rond 18.00 uur, precies tijdens de klim.",3],
  ["Kaketoes en lori's","Geelkuifkaketoes en regenbooglori's zitten in elke boom van de Botanic Garden, luid en niet schuw.",3],
  ["Boskalkoen","In Manly stapt de Australische boskalkoen gewoon over straat en bouwt nesten in voortuinen.",2]],
 agenda:[
  ["08.15","Vertrek uit het hotel","Tram L2 of L3 vanaf halte Haymarket (Capitol Square, 3 minuten lopen) naar Circular Quay, ± 18 minuten. Vandaar 8 minuten lopen naar het Opera House. Lopen kan ook, maar reken op 43 minuten: de route gaat om Darling Harbour heen en door het centrum met veel verkeerslichten."],
  ["08.45","Melden bij het Opera House","Bij het Welcome Centre op de Lower Concourse, aan de havenkant onder de trappen. Een kwartier vóór aanvang is de norm."],
  ["09.00","Rondleiding Sydney Opera House","Geboekt, standaardrondleiding van ongeveer een uur. Staat er op je bevestiging iets anders, dan schuift de rest van de ochtend mee; alleen de klim om 16.15 uur ligt vast."],
  ["10.00","Vrij tot half vier","Suggestie: de veerboot naar Manly vanaf Circular Quay, wharf 3. Een half uur varen, hetzelfde tarief als de tram. Lunch aan de boulevard van Manly en op tijd terug."],
  ["15.15","Terug bij Circular Quay","Loop naar BridgeClimb, 3 Cumberland Street, The Rocks: ± 10 minuten heuvelop."],
  ["16.00","Inchecken BridgeClimb","Een kwartier vóór de klim. Neem de boekingsbevestiging mee; die staat als notitie bij deze dag."],
  ["16.15","BridgeClimb Summit Twilight","Geboekt. Ongeveer drie en een half uur. De zon gaat rond 17.50 uur onder, midden in de klim."],
  ["19.45","Klaar, in The Rocks","Reserveer niet vóór 20.30 uur. Dae Jang Kum is tot 02.00 uur open en het dichtst bij het hotel; Mishy's en NOMAD sluiten om 22.00 uur."]],
 body:[
  "Je hebt twee volle dagen om Sydney te verkennen. Met meer dan vier miljoen inwoners is Sydney een stad met ongekende mogelijkheden. Een stadswandeling waarbij je het wereldberoemde Opera House en de naastgelegen Harbour Bridge bezoekt, mag uiteraard niet overgeslagen worden.",
  "Bij jullie staan die twee vandaag allebei vast: om 09.00 uur de rondleiding door het Opera House en om 16.15 uur de BridgeClimb, allebei geboekt. Daartussen zit ruim vijf uur. Zoek je iets meer rust, ga dan naar de botanische tuinen of pak de ferry naar het gezellige Manly, waar je mooie fietstochten kunt maken.",
  "Beide afspraken zijn bij Circular Quay, dus je hoeft tussendoor niet terug naar het hotel. Neem wel een extra laag mee: op de brug waait het, en na zonsondergang is het er fris."
 ],
 prac:["BridgeClimb heeft strenge regels: geen camera of telefoon mee (de gids fotografeert), geen losse spullen, dichte schoenen, en een blaastest vooraf — meer dan 0,05 promille en je mag niet mee. Drink dus geen wijn bij de lunch in Manly.",
  "De veerboten vallen onder hetzelfde tarief als bus en trein. De overtocht naar Manly is daarmee de goedkoopste rondvaart van Sydney — een fractie van een georganiseerde harbour cruise, met hetzelfde uitzicht.",
  "Vannacht gaat de zomertijd in: de klok springt van 02.00 naar 03.00 uur. Controleer morgenochtend of je telefoon dat zelf heeft gedaan.",
  "Bij de Opera House kun je zonder ticket het buitenterras op en tot in de foyer lopen. Voor het uitzicht heb je geen rondleiding nodig."],
 rest:[["Mishy's","Reservoir Street, Surry Hills",4.9,2,16,"Klein, seizoensgebonden, gerund door de eigenaar. Uitzonderlijke waardering, maar over een klein aantal beoordelingen — controleer kort voor vertrek. Zaterdag tot 22.00 uur; na de klim is 20.30 uur het vroegste dat haalbaar is.","Online of telefonisch, voor 20.30 uur of later. Zeer klein — boek nu al."],
   ["NOMAD","Foster Street, Surry Hills",4.6,4,12,"Modern Australisch met houtvuur en inheemse ingrediënten. Een van de betere adressen van Sydney en toch te belopen. Duurder dan de rest.","Online via de website van het restaurant. Zaterdag vroeg vol; reserveren."],
   ["Dae Jang Kum","Goulburn Street, Haymarket",4.7,2,7,"Koreaanse barbecue aan tafel. Levendig, zaterdag tot 02.00 uur open en dichtbij het hotel. De veiligste keuze na een klim die tot kwart voor acht duurt.","Niet nodig, gewoon binnenlopen."]]},

{n:4,r:"nsw",k:"vrij",t:"Sydney: kustwandeling Bondi – Coogee",p:"Bondi & Coogee",h:"The Ultimo, Haymarket",tz:11,temp:"14–22°",
 wild:[["Bultrug","De kliffen bij Marks Park en Waverley Cemetery zijn de beste walviskijkplekken van Sydney, en oktober is het seizoen. Zoek naar de spuit; een verrekijker helpt.",2],
  ["Blauwe groper","In Gordons Bay en Clovelly, een grote felblauwe vis die vlak onder het wateroppervlak zwemt. Vanaf de rotsen te zien, met een snorkel nog beter.",2],
  ["Dolfijn","Voor de kust, vaak in de golven bij Bronte en Coogee. Geen garantie, maar kijk elke keer even als je stilstaat.",1]],
 agenda:[
  ["09.30","Vertrek uit het hotel","Loop naar Central Station (5 min) en neem de trein T4 naar Bondi Junction (± 10 min). Daar bus 333, 380 of 381 naar Bondi Beach (± 12 min). In totaal ruim een half uur. Tik in en uit met je bankpas; het zondagse dagmaximum geldt voor alles."],
  ["10.15","Bondi Beach","Begin aan de zuidkant, bij Bondi Icebergs. Het zeebad is zondag open, dus wil je zwemmen, doe het voordat je gaat lopen. Later op de dag kom je hier niet meer terug."],
  ["10.45","Start van de wandeling","6 km langs de kust: Tamarama, Bronte, de kliffen van Waverley Cemetery, Clovelly, Gordons Bay, Coogee. Twee tot drie uur, met trappen op en af. Bronte is halverwege en heeft de beste koffie."],
  ["13.30","Coogee","Lunch aan Coogee Bay Road of op het strand. Het water bij Coogee is rustiger dan bij Bondi."],
  ["15.00","Terug naar de stad","Bus 373 of 374 vanaf Arden Street in Coogee rijdt rechtstreeks naar Central en Circular Quay, ± 35 tot 40 minuten. Geen overstap nodig."],
  ["16.00","Terug in het hotel","Rusten, en op tijd eten: veel zaken in Surry Hills zijn zondag dicht, maar de drie hieronder niet."]],
 body:[
  "Vanuit de stad neem je eenvoudig de bus naar het bekende Bondi Beach. Maak zeker tijd vrij om de kustwandeling vanaf Bondi naar het Coogee strand te maken: zes kilometer over de kliffen en langs vijf stranden, in zo’n drie uur te lopen. Plan wel een extra uur in, want het zou zonde zijn om nergens te stoppen.",
  "Onderweg heb je verschillende uitzichtpunten, zwembaaien en gezellige tentjes voor een bakje koffie. Het is de bekendste wandeling van Sydney en op zondag druk, dus vroeg beginnen loont. Terug in Sydney is het gezellig eten bij de waterkant, waar je uitzicht op de skyline en haven hebt."
 ],
 prac:["Op zondag geldt in New South Wales een laag dagmaximum voor het openbaar vervoer. Je kunt vandaag dus onbeperkt reizen voor een paar dollar.",
  "Het zeebad van Bondi Icebergs is open voor publiek, behalve op donderdag. Zwemmen kost een paar dollar; alleen al voor het uitzicht is dat het waard. Neem zwemkleding en een kleine handdoek mee.",
  "De zomertijd is vannacht ingegaan. Controleer of je telefoon een uur is opgeschoven; je horloge doet dat niet vanzelf.",
  "Loop van Bondi naar Coogee, niet andersom. Dan heb je de zon in de rug en eindig je bij een rustiger strand in plaats van in de drukte. En van Coogee rijdt de bus zonder overstap terug naar Central."],
 rnote:"Zondag zijn veel zaken in Surry Hills gesloten. Deze drie niet.",
 rest:[["NOUR","Crown Street, Surry Hills",4.8,3,22,"Modern Libanees, ruim 3.000 beoordelingen en nog steeds 4,8. Het banketmenu is de manier om het te doen.","Online via de website van het restaurant. Weken vooruit vol; boek nu."],
   ["White Horse","Crown Street, Surry Hills",4.7,3,20,"Verfijnde deelgerechten in een oud hotelpand. Zondag tot 21.00 uur.","Online, of via de reserveerknop in Google Maps."],
   ["Spice World","Sussex Street, Haymarket",4.6,2,6,"Chinese hotpot, spectaculair ingericht, zeven dagen tot 23.00 uur.","Kan online, maar binnenlopen werkt meestal ook."]]},

{n:5,r:"nsw",k:"excursie",t:"Bezoek Blue Mountains",p:"Blue Mountains",h:"The Ultimo, Haymarket",tz:11,temp:"7–17° in de bergen",
 wild:[["Liervogel","Op de bospaden in de dalen, vooral rond de Katoomba-watervallen. Je hoort hem eerder dan je hem ziet: hij imiteert alles, van andere vogels tot camerasluiters. Vroeg in de dag de meeste kans.",2],
  ["Pennantrosella en koningsparkiet","Karmozijnrode en groene papegaaien in de bomen bij Echo Point; ze komen op picknicktafels af.",3],
  ["Geelstaartraafkaketoe","Grote zwarte kaketoes met gele staartveren, in groepjes met een klaaglijke roep. Kijk omhoog in de eucalyptussen.",2],
  ["Moeraswallaby","In de schemering aan bosranden. De groep is dan waarschijnlijk al weg, dus alleen met geluk.",1]],
 body:[
  "Vandaag brengen we een bezoek aan het Blue Mountains Nationaal Park. In ongeveer drie uur rijden we naar de groene en bergachtige omgeving van de Blue Mountains. Het Nationale Park heeft zijn naam te danken aan de blauwe nevel die boven de vele aanwezige eucalyptusbossen hangt; die ontstaat doordat de bomen olie verdampen.",
  "Er zijn vanaf hier verschillende wandelingen te maken. Bijvoorbeeld naar de lager gelegen Jamison vallei, de Katoomba waterval of naar de legendarische rotsformatie de Three Sisters."
 ],
 prac:["De Three Sisters staan vanaf Echo Point 's ochtends in tegenlicht. In de loop van de middag draait de zon eromheen en maak je veel betere foto's; jullie komen dus op het goede moment aan.",
  "In de bergen is het vaak zes tot acht graden kouder dan in Sydney, en het weer slaat er snel om.",
  "Mobiel bereik valt in de dalen weg. Spreek een verzamelpunt af in plaats van te vertrouwen op appjes."],
 rnote:"Mishy's en White Horse, van de afgelopen twee avonden, zijn maandag gesloten. Deze drie zijn wel open.",
 rest:[["Porkfat","Ultimo Road, Haymarket",4.6,2,1,"Thais met een chef's hat, letterlijk om de hoek van het hotel. Prijziger dan een gewone Thai, maar gasten komen terug voor de gefrituurde hele vis en de larb. Maandag 17.00–22.00 uur.","Online of telefonisch. Reserveren nodig; klein."],
   ["NOMAD","Foster Street, Surry Hills",4.6,4,12,"Modern Australisch met houtvuur en inheemse ingrediënten. De bijzondere keuze, iets verder en duurder.","Online via de website van het restaurant. Reserveren noodzakelijk."],
   ["Nanjing Dumpling","Little Hay Street, Haymarket",4.5,2,6,"Goedkoop, snel en goed. Xiao long bao met krab of truffel.","Niet nodig, gewoon binnenlopen."]]},

{n:6,r:"tas",k:"vlucht",t:"Vlucht naar Launceston",p:"Launceston",h:"Hotel Grand Chancellor, Cameron Street",tz:11,temp:"6–18°",
 wild:[["Vogelbekdier","In het Tamar Island Wetlands-reservaat, tien minuten buiten de stad, bij zonsondergang langs de vlonderpaden. Zeldzaam en schuw; stil zitten en wachten bij rustig water.",1],
  ["Bennettwallaby","Aan de randen van Cataract Gorge, een kwartier lopen van het hotel, in de late middag.",2],
  ["Pauw","Cataract Gorge heeft een verwilderde kolonie pauwen die vrij rondloopt. Geen inheems dier, wel een gek gezicht.",3]],
 fl:[["JQ 745","Sydney, terminal 2 (binnenlands)","Launceston","07.25","09.10","Jetstar · 20 kg ruim, 7 kg cabine"]],
 body:[
  "Rond reizen door het onmetelijke Australië brengt vele kilometers met zich mee. Tijdens deze reis nemen we dan ook een paar keer tijdbesparende vluchten. Vandaag vliegen we naar het groene eiland Tasmanië, dit deel van Australië werd 35.000 jaar geleden al bewoond door de inheemse Palawa bevolking. In 1642 was de Nederlander Abel Tasman de eerste Europeaan die voet zette op dit eiland, wat later naar hem vernoemd werd. Tasmanië is net zo groot als Nederland en heeft slechts 500.000 inwoners, het is dus dunbevolkt. Dit zie je terug in de rust en de ongerepte natuur die het eiland te bieden heeft.",
  "Vandaag kom je aan in Launceston, de oudste stad van Tasmanië. Hoewel het een van de grotere steden van het eiland is, voelt Launceston nog steeds als een charmant dorpje. De stad staat bekend om haar rijke cultuur, prachtige natuur en heerlijke lokale gerechten. Het hotel staat midden in het centrum. Wandel door de historische straatjes, ontdek gezellige cafés en markten, en vergeet vooral niet het nabijgelegen wijngebied van de Tamar Valley te verkennen voor een echte proeverij van Tasmaanse wijnen."
 ],
 prac:["Vroege vlucht: om 07.25 uur vanaf terminal 2. Je vertrekt dus rond 05.15 uur uit het hotel; vraag de reisbegeleider naar het groepsvervoer. Ontbijten in het hotel lukt waarschijnlijk niet meer.",
  "Tasmanië heeft zijn eigen quarantaineregels, ook voor reizigers uit de rest van Australië. Vers fruit en verse groente mogen het eiland niet op; voor andere levensmiddelen hangt het af van product en verpakking. Eet je appel vóór het inchecken op en geef bij twijfel aan.",
  "Het eiland ligt zuidelijker dan je denkt, op de breedte van Nieuw-Zeeland. Reken op zes tot achttien graden en veel wind, ook als het op het vasteland warm was.",
  "De uv-index is hier hoog ondanks de kou. Verbranden gebeurt op een bewolkte dag van vijftien graden."],
 food:[["Scallop pie","Hartige taart met sint-jakobsschelpen in kerriesaus. Puur Tasmaans."],["Oesters","Vraag naar Bruny Island. Het koude water levert uitzonderlijke kwaliteit."],["Wallaby","Mager, donker wildvlees. Vaak als ravioli of steak."],["Leatherwood honey","Donkere, aromatische honing van een boom die alleen hier groeit."],["Pinot noir","Het koele klimaat maakt Tasmanië tot Australiës beste streek voor deze druif."],["Curried scallop pie","De kerrieversie van de scallop pie, en volgens Tasmaniërs de enige juiste."]],
 rest:[["Kawan Dining","Charles Street",5.0,2,12,"Aziatische fusion, kleine zaak, vrijwel perfecte score over ruim 500 beoordelingen.","Online of telefonisch. Klein en altijd vol — boek nu al."],
   ["Tres","Charles Street",4.8,2,11,"Latijns-Amerikaans, bekend om de picanha en de tapas.","Online via de website van het restaurant."],
   ["Mudbar","Seaport Boulevard",4.4,3,15,"Aan het water, zeven dagen open. Verse oesters en vlees van eigen boerderij.","Online, maar zonder reservering kom je er meestal ook binnen."]]},

{n:7,r:"tas",k:"excursie",t:"Cradle Mountain-Lake St Clair",p:"Cradle Mountain",h:"Hotel Grand Chancellor, Cameron Street",tz:11,temp:"1–11°",
 wild:[["Wombat","De vlonderpaden bij Ronny Creek, vlak bij het bezoekerscentrum, in het laatste uur voor zonsondergang. Ze grazen dan in het open veld en laten je tot een paar meter komen. De zekerste wombat van Australië.",3],
  ["Pademelon en Bennettwallaby","Rond het bezoekerscentrum en de parkeerplaatsen, ook overdag in de schaduw. Blijf zitten en ze komen dichterbij.",2],
  ["Echidna","In de lente actief langs de paden en wegen, overdag. Een stekelig bolletje dat traag oversteekt; stop en wacht.",2],
  ["Tasmaanse duivel","In het wild alleen 's nachts en zeldzaam. Devils@Cradle, naast het bezoekerscentrum, heeft rondleidingen overdag waar je ze wel ziet.",1],
  ["Vogelbekdier","In de beekjes rond Dove Lake bij zonsopgang of zonsondergang. Geluk nodig, maar het gebeurt.",1]],
 body:[
  "Tijd voor actie! Vandaag bezoeken we het oudste en bekendste nationale park van Tasmanië: Cradle Mountain-Lake St Clair National Park, dat niet voor niets op de UNESCO Werelderfgoedlijst staat. Het park staat bekend om zijn ruige landschappen met rivieren, watervallen, diepblauwe gletsjermeren en imposante bergen, zoals Barn Bluff (1559 m), Mount Ossa (1614 m, de hoogste berg van Tasmanië) en natuurlijk de iconische Cradle Mountain (1545 m).",
  "In dit park vind je talloze wandelroutes. Houd onderweg je ogen open, want de kans is groot dat je bijzondere dieren tegenkomt, zoals wombats, wallaby’s, Tasmaanse duivels of misschien zelfs een echidna. Dit indrukwekkende natuurgebied laat je het wilde Tasmanië op zijn best ervaren.",
  "Je slaapt vannacht opnieuw in Launceston: ruim twee uur rijden heen en weer, dus reken op een lange dag."
 ],
 prac:["Naar Dove Lake rijdt een verplichte pendelbus vanaf het bezoekerscentrum, om de tien à vijftien minuten. Mis de laatste terugrit niet, want daarna volgt nog twee uur rijden naar Launceston.",
  "Wombats zijn het actiefst tegen de avond, maar omdat je terugrijdt naar Launceston is de late middag je kans. De vlonderpaden bij Ronny Creek liggen vlak bij het bezoekerscentrum.",
  "Met 1 tot 11 graden is dit de koudste plek van de reis; in oktober kan het hier nog sneeuwen. Neem je warme laag mee in de bus, want je bent de hele dag onderweg.",
  "Er is vrijwel geen mobiel bereik in het park. Download je kaarten voordat je uit Launceston vertrekt."],
 rnote:"Je eet vanavond in Launceston, niet bij Cradle Mountain. Reserveer vóór je vertrekt, want je bent pas laat terug.",
 rest:[["Cataract on Paterson","Paterson Street, Launceston",4.6,2,20,"Zeevruchten en steak, 4,6 over ruim 3.000 beoordelingen, zeven dagen open tot 21.00 uur. Ruime kaart en snelle bediening — de beste keuze als je laat terug bent uit het park.","Online of telefonisch: +61 3 6331 4446. Werkt ook zonder reservering."],
   ["Kawan Dining","Charles Street, Launceston",5.0,2,12,"Als je gisteren geen tafel kreeg: woensdag open van 17.30 tot 21.00 uur. Vrijwel perfecte score over ruim 540 beoordelingen.","Telefonisch. Reserveer vóór je naar Cradle Mountain vertrekt; vol is vol."],
   ["Mudbar","Seaport Boulevard, Launceston",4.4,3,15,"Aan het water, zeven dagen tot middernacht open. De veiligste optie als het later wordt dan gepland.","Online, maar zonder reservering kom je er meestal ook binnen."]]},

{n:8,r:"tas",k:"bus",t:"Via Bicheno naar Bay of Fires",p:"Bicheno",h:"Beachfront Bicheno, Tasman Highway",tz:11,temp:"8–17°",
 wild:[["Dwergpinguïn","De avondexcursie brengt je naar een kolonie die na zonsondergang aan land komt. Oktober is broedseizoen, dus ze komen zeker.",3],
  ["Australische pelsrob","Op de rotsen bij de blowhole en op Governor Island, vlak voor de kust van Bicheno. Kijk vanaf de kustwandeling met een verrekijker.",2],
  ["Witbuikzeearend","Boven de baaien van Bay of Fires en Bicheno. Groot, wit met grijs, vaak op een dode boom bij het water.",2],
  ["Dolfijn","Voor de kust bij Bay of Fires; vanaf de granietrotsen heb je een goed uitzicht over het water.",1]],
 body:[
  "Vandaag verkennen we de Oostkust van Tasmanië. We rijden naar een van de meest fotogenieke plaatsen van het eiland, de Bay of Fires. Kenmerkend zijn de bijzondere oranje/rood gekleurde rotsen rond het witte strand en het azuurblauwe water; die kleur komt van korstmossen op het graniet. Het is een van de meest ongerepte gebieden dat Tasmanië te bieden heeft. We nemen vanmiddag de tijd om hier rond te kijken. Je kunt een mooie strandwandeling maken of je tijd besteden aan een van de pittoreske stranden met helder blauw water.",
  "We overnachten vandaag in Bicheno, een charmant vissersdorpje gelegen tussen het Douglas-Apsley National Park en het Freycinet National Park. Het dorp ligt aan de rand van een prachtig natuurgebied aan zee en staat bekend om zijn verse en smaakvolle seafood. Vanaf hier kun je ’s avonds genieten van de rustige kustsfeer en misschien zelfs een wandeling maken langs het strand. Of je kunt meegaan op een optionele excursie, waarbij je een bezoek brengt aan een pinguïnkolonie."
 ],
 prac:["Bij de pinguïns is fotograferen met flits verboden en wit licht verstoort ze.",
  "De pinguïns komen pas twintig tot veertig minuten ná zonsondergang aan land. Je staat dus te wachten in de kou aan zee; neem een muts mee.",
  "In Bicheno ligt een blowhole op loopafstand van het hotel, aan de kant van Waub's Bay. Bij aanlandige wind spuit die tot tien meter hoog — gratis, en de meeste mensen lopen eraan voorbij."],
 rest:[["Sealife Restaurant","Tasman Highway",4.4,2,6,"Praktisch naast het hotel, uitzicht op zee. Donderdag 17.00–20.00 uur.","Telefonisch: +61 3 6375 1121. Vraag om een tafel bij het raam."],
   ["Lobster Shack","Waubs Esplanade",4.3,2,15,"Vroeg en informeel: bestellen aan de balie, eten met zicht op zee, om 19.00 uur dicht. Meer een late lunch dan een diner, maar dit ís de lobster roll van Tasmanië.","Niet nodig — bestellen aan de balie."]]},

{n:9,r:"tas",k:"bus",t:"Naar Hobart via Freycinet",p:"Hobart",h:"Ibis Styles, Macquarie Street",tz:11,temp:"8–17°",
 wild:[["Bennettwallaby","Op de parkeerplaats van Wineglass Bay. Ze zijn er altijd en komen bedelen; voeren is verboden en maakt ze ziek.",3],
  ["Witbuikzeearend","Boven Coles Bay en de Hazards. Kijk omhoog vanaf het uitzichtpunt.",2],
  ["Dolfijn en walvis","In Great Oyster Bay, vanaf het uitzichtpunt over Wineglass Bay. In oktober trekken bultruggen langs; een spuit in de verte is goed mogelijk.",1]],
 body:[
  "Vandaag brengen we een bezoek aan het Freycinet Nationaal Park. Dit nationale park is één van de oudste van Australië. Het park kenmerkt zich door de vele wandelpaden door bossen en langs prachtige stranden en baaien. Je hebt de mogelijkheid om hier een prachtige wandeling van ruim twee uur naar de schilderachtige Wineglass Bay te maken. Deze baai heeft een vorm van een wijnglas en is omringd door rode granieten pieken, eucalyptusbomen, wilde bloemen en ongerepte witte zandstranden. Naar het uitzichtpunt alleen ben je officieel een tot anderhalf uur kwijt; Sawadee rekent ruimer, met pauzes en foto’s.",
  "Aan het eind van de middag arriveren we in Hobart, de hoofdstad van Tasmanië. Het is leuk om een wandeling te maken door het oude centrum. Hier maak je kennis met veel cultureel erfgoed van Australië, je loopt langs mooie historische gebouwen en oude arbeidershuisjes. De komende twee nachten slapen we in een comfortabel hotel, vijf tot twaalf minuten van Salamanca Place. Let op: vandaag is er een maaltijd inbegrepen."
 ],
 prac:["Boek vandaag alvast je MONA-tickets voor morgen. Ze zijn geregeld vooraf uitverkocht en de ferry erheen reserveer je apart."],
 rest:[["Syra","Salamanca Square",4.7,2,11,"Midden-Oosters, de hoogste waardering van Salamanca. Kies de 'feed me' en laat de keuken beslissen.","Online. Klein, dus vooraf boeken."],
   ["Peppina","Salamanca Place",4.6,3,6,"Het dichtstbij en uitstekend. Italiaans met Tasmaanse producten; iets duurder.","Online via de website van het restaurant of de reserveerknop in Google Maps."],
   ["Ball & Chain Grill","Salamanca Place",4.4,2,12,"Klassieke grill in een historisch pakhuis, houtskoolvuur.","Online via de website van het restaurant."]]},

{n:10,r:"tas",k:"vrij",t:"Hobart",p:"Hobart",h:"Ibis Styles, Macquarie Street",tz:11,temp:"8–17°",
 wild:[["Pelsrob","Tijdens de boottocht bij Tasman Island: kolonies op de rotsen, tot vlak bij de boot. Als je die excursie kiest is dit zeker.",3],
  ["Albatros","Op open zee bij Cape Pillar, met de boottocht. Reuzenalbatrossen met een spanwijdte van drie meter scheren langs.",2],
  ["Bultrug en zuidkaper","Oktober is een goede maand bij Tasman Island; de schipper weet waar ze zitten. Ook vanaf MONA's veerboot heb je soms geluk op de Derwent.",2],
  ["Dolfijn","Bijna standaard bij de boottocht; soms ook in de haven van Hobart.",2]],
 body:[
  "Na Sydney is Hobart de oudste stad van Australië. Een leuk uitje is een bezoek aan het bijzondere Museum Old New Art (MONA). Van Hobart neem je de ferry naar het museum. Deze overtocht is op zichzelf al de moeite waard.",
  "De ruige kustlijn van het zuidoosten van Tasmanië is bekend vanwege de grilligheid en de hoge kliffen. Een echte aanrader is om deel te nemen aan de optionele excursie met een boottocht waarin je dit prachtige gebied verkent. Je vaart langs het geïsoleerde Tasman Island en Cape Pillar, waar we vaak dolfijnen, albatrossen en zelfs walvissen zien."
 ],
 prac:["Salamanca Market is vanochtend, op tien minuten lopen. Hij loopt tot ongeveer 15.00 uur en veel kramen breken eerder af — ga vroeg.",
  "Op de markt is leatherwood honey de beste souvenir: hij mag de EU in en je vindt hem nergens anders ter wereld.",
  "Mount Wellington ligt op twintig minuten rijden en steekt 1.270 meter omhoog. Boven waait het bijna altijd hard en is het tien graden kouder dan in de stad."],
 rest:[["Syra","Salamanca Square",4.7,2,11,"Zaterdag open vanaf 17.00 uur.","Online. Zaterdag het snelst vol."],
   ["Peppina","Salamanca Place",4.6,3,6,"Zaterdag open vanaf 17.00 uur.","Online via de website van het restaurant."]]},

{n:11,r:"sa",k:"vlucht",t:"Vlucht naar Adelaide",p:"Adelaide",h:"The Terrace Hotel, South Terrace",tz:10.5,temp:"12–22°",
 wild:[["Grijskopvleerhond","Een kolonie van duizenden in de Adelaide Botanic Garden, aan de noordkant van het centrum. Bij zonsondergang vliegen ze uit over de stad.",3],
  ["Rosella's en kaketoes","In de South Parklands, recht voor je hotel. Roze galahs en witte kaketoes grazen er in groepen op het gras.",3]],
 fl:[["JQ 680","Hobart, terminal D","Adelaide, terminal 1","14.20","15.50 (lokale tijd, klok een half uur terug)","Jetstar · 20 kg"]],
 body:[
  "We vliegen van Tasmanië naar het drogere Zuid-Australië, naar Adelaide. Anders dan je misschien verwacht bij een stad met meer dan een miljoen inwoners, voelt Adelaide meer als een groot dorp dan een drukke stad. Aan het einde van de middag komen we aan bij ons goed gelegen en comfortabele hotel, waar we twee nachten verblijven. Het kijkt uit over de South Parklands; Hutt Street, de dichtstbijzijnde restaurantstraat, ligt op een kwartier lopen recht naar het noorden."
 ],
 prac:["De klok gaat vandaag een half uur terug. Zuid-Australië loopt dertig minuten achter op Tasmanië en Victoria — een van de weinige halve tijdzones ter wereld.",
  "De tram is gratis binnen het centrum, van South Terrace tot de Entertainment Centre. Jullie hotel ligt aan het beginpunt, dus je komt gratis de stad in en uit. Pas voorbij de stadsgrens richting Glenelg betaal je.",
  "Zuid-Australië heeft statiegeld op blikjes en flesjes. Tien cent per stuk, in te leveren bij automaten."],
 food:[["King George whiting","De fijnste witvis van Zuid-Australië, delicaat en licht zoet."],["Coonawarra Cabernet","Twee van Australiës beroemdste wijnstreken liggen om de hoek."],["Coopers Ale","Ongefilterd, met bezinksel. Even laten staan voor je schenkt."],["Haigh's","Chocolatier uit 1915, nog altijd familiebedrijf."],["Pie floater","Een meat pie omgekeerd in een bord erwtensoep. Meer folklore dan gastronomie, maar één keer moet je het gezien hebben."],["Frog cake","Groen marsepeinen kikkerkopje met slagroom, sinds 1922 het symbool van Adelaide."]],
 rnote:"Veel Adelaidse restaurants zijn zondag gesloten. Deze drie niet.",
 rest:[["Sofia","Hutt Street",4.8,2,27,"Grieks-mediterraan, de hoogste waardering in de buurt. Zeven dagen open. Let op: in maart 2026 tijdelijk gesloten na een brand, inmiddels weer open — controleer kort vóór vertrek of dat zo blijft.","Online. Populair, dus vooraf boeken."],
   ["The Logical Indian","Hutt Street",4.7,2,17,"Zuid-Indiaas, al zeven jaar consistent goed, en dichter bij het hotel.","Online of telefonisch."],
   ["Latteria","Hutt Street",4.5,2,17,"Modern Italiaans met een Milanese sfeer. Gasten noemen vooral de tagliarini met kreeft en de octopus.","Online via de website van het restaurant."]]},

{n:12,r:"sa",k:"vrij",t:"Adelaide, vrije dag",p:"Adelaide",h:"The Terrace Hotel, South Terrace",tz:10.5,temp:"12–22°",
 wild:[["Dolfijn","Bij Glenelg vanaf de pier en het strand, vooral 's ochtends. De dolfijnen van de Port River komen regelmatig langs de kust.",2],
  ["Grijskopvleerhond","Zie gisteren: de kolonie in de Botanic Garden hangt overdag zichtbaar in de bomen bij het meer.",3]],
 body:[
  "Het groene Adelaide leent zich uitstekend voor wandel- en fietstochten langs de vele parken, tuinen en musea. Of pak de tram en rijd in korte tijd naar het mooiste strand van Adelaide, Glenelg. Voor een gezellige avond uit in Adelaide vind je op Hindley Street vele mogelijkheden. Het is heerlijk bijkomen in één van de gezellige restaurants of pubs in de buurt.",
  "Eén ding om rekening mee te houden: de Adelaide Central Market, een van de grootste overdekte markten van het zuidelijk halfrond, is van oudsher zondag en maandag gesloten — precies jullie twee dagen. Controleer het ter plaatse, maar reken er niet op."
 ],
 prac:["Rundle Mall en de zijstraten eromheen zijn het winkelhart; Haigh's Chocolates heeft er zijn oorspronkelijke winkel op Beehive Corner, uit 1915.",
  "Het South Australian Museum en het Migration Museum vragen geen entree. Het eerste heeft de grootste verzameling Aboriginal-voorwerpen ter wereld.",
  "De tram naar Glenelg valt buiten de gratis zone. Tik in en uit met je bankpas; een aparte kaart heb je niet nodig."],
 rnote:"Latteria, van gisteravond, is maandag gesloten. Deze drie zijn wel open.",
 rest:[["Part Time Lover","Paul Kelly Lane",4.8,2,22,"Modern Australisch, deelgerechten, in een steegje in het centrum. Zondag gesloten, maandag open — vandaag dus.","Online. Klein en gewild."],
   ["Chianti","Hutt Street",4.5,3,19,"Adelaidse klassieker sinds 1985, Italiaans. Zondag gesloten, maandag open.","Online via de website van het restaurant."],
   ["Sofia","Hutt Street",4.8,2,27,"Ook maandag open.","Online."]]},

{n:13,r:"sa",k:"bus",t:"Mount Gambier en Naracoorte",p:"Mount Gambier",
 emoe:[1,"Op de open velden rond Naracoorte, overdag vanuit de bus. Kijk naar rechts en links over de weilanden."],tz:10.5,temp:"8–19°",
 wild:[["Zuidelijke langvleugelvleermuis","Bij Naracoorte huist een kolonie van honderdduizenden in Bat Cave. Het Bat Observation Centre laat ze via infraroodcamera's zien; in oktober keren de vrouwtjes terug om te werpen.",3],
  ["Kangoeroe","In de wijngaarden van Coonawarra tegen de avond, vaak in groepen tussen de rijen.",2],
  ["Emoe","Op de open velden rond Naracoorte, overdag vanuit de bus.",1]],
 body:[
  "We vervolgen vandaag onze route richting Mount Gambier. In de buurt van Mount Gambier ligt een uitgedoofde vulkaan met daarin het prachtige kratermeer Blue Lake. Een bijzondere plek met helderblauw water en fraaie tuinen rondom. Daarna vervolgen we onze weg door de wijnregio Coonawarra, beroemd om haar Cabernet Sauvignon, die zijn faam dankt aan de rode terra rossa-grond. We rijden langs uitgestrekte wijnvelden met prachtige wijnhuizen. De dag eindigt met een bezoek aan het Nationaal Park Naracoorte Caves. Deze grotten staan op de UNESCO Werelderfgoedlijst vanwege hun uitzonderlijke fossielen en de resten van uitgestorven megafauna."
 ],
 prac:["Blue Lake verschiet pas in november van staalgrijs naar kobaltblauw. In oktober zie je hem nog in zijn winterkleur — mooi, maar niet de ansichtkaart.",
  "Vraag bij de proeverij in Coonawarra naar de munt- en eucalyptustoon in de cabernet. Dat is de handtekening van deze streek.",
  "In de Naracoorte-grotten is het constant zo'n zeventien graden en vochtig. Een extra laag in de bus laten liggen is hier zonde."],
 note:"Twee onzekerheden vanavond. Ten eerste het hotel: Sawadee heeft voor dag 13 en 14 nog niet vastgelegd of je in het Blue Lake Motel of het Mountain View Motor Inn slaapt; kijk in je reisbescheiden. Ten tweede het eten: het Blue Lake Motel ligt op een heuvel buiten het centrum en de twee zaken hieronder liggen 3 en 8 km verderop, dus je hebt vervoer nodig. De hoogst gewaardeerde adressen van Mount Gambier — Elementary, Fat Frog, de Brewery — zijn dinsdag gesloten.",
 rest:[["Thyme at the Lakes","Lake Terrace West, Mount Gambier",4.4,2,0,"Modern Australisch met uitzicht over de stad en de kratermeren, dinsdag 18.00–22.00 uur. Beoordelingen lopen uiteen: veel lof voor eten en uitzicht, kritiek op prijs en bediening. Zo'n 3 km van het motel.","Online of telefonisch. Reserveren aanbevolen."],
   ["The Barn Steakhouse","Glenelg River Road, Mount Gambier",4.4,3,0,"Klassiek steakhouse, zeven dagen open van 17.30 tot 22.00 uur. Grote porties, goede wijnkaart, prijzig. Ligt 8 km buiten de stad, dus zeker een taxi.","Online of telefonisch."]]},

{n:14,r:"vic",k:"bus",t:"Naar Grampians Nationaal Park",p:"Halls Gap",
 emoe:[3,"Ze lopen door het dorp Halls Gap en over het sportveld, en langs de weg naar het motel. Dit wordt hem. Houd afstand: ze zijn groter en brutaler dan je verwacht."],tz:11,temp:"8–20°",
 wild:[["Kangoeroe","Op het sportveld en de camping van Halls Gap, elke avond vanaf een uur voor zonsondergang. Tientallen, en volkomen gewend aan mensen. Ook op het terrein van je motel.",3],
  ["Emoe","Lopen door het dorp en langs de weg naar het motel. Houd afstand, want ze zijn groter en brutaler dan je verwacht.",3],
  ["Kookaburra","Op takken en hekken langs de weg, en 's ochtends vroeg met hun lachende roep.",3],
  ["Echidna","Langs de wandelpaden, overdag. Lente is de beste tijd.",2],
  ["Wedgestaartarend","Boven de rotswanden bij The Pinnacle en Boroka Lookout.",2]],
 body:[
  "Vandaag reizen we af naar het Grampians Nationaal Park: het grootste Nationale Park van de staat Victoria. Vanwege de unieke landschappen en rijke geschiedenis absoluut een bezoek waard. Sinds de jaren 80 is dit park beschermd als Nationaal Park. In het Djab Wurrung en Jardwadjali heet het gebied Gariwerd; je vindt er belangrijke Aboriginal-rotskunst.",
  "In de omgeving zijn verschillende mooie wandelingen te maken; vraag naar The Pinnacle of de Wonderland Loop. Het park is bedekt met bergbossen met verschillende Eucalyptus-soorten en je vindt er bijna 1000 plantensoorten. We verblijven in een wat verouderde maar charmante accommodatie. Vandaag is er een maaltijd inbegrepen."
 ],
 prac:["Bij de grens met Victoria gaat de klok een half uur vooruit. Vergeet dat niet bij het afspreken van vertrektijden met de groep.",
  "Kangoeroes en emoes lopen 's avonds gewoon door het dorp Halls Gap en over het sportveld. Je hoeft er het park niet voor in.",
  "De rotskunst is beschermd erfgoed van de Djab Wurrung en Jardwadjali. Aanraken is verboden, ook met een vinger langs de rand — de olie van je huid tast de pigmenten aan."],
 note:"Ook vanavond staat het hotel nog niet vast: Blue Lake Motel of Mountain View Motor Inn. Slaap je in het Mountain View, dan lig je 3,7 km buiten Halls Gap, bijna drie kwartier lopen langs een donkere landweg. Te ver om te lopen; stem met de groep of reisbegeleider af of de bus jullie het dorp in brengt.",
 food:[["Kangoeroe","Mager en ijzerrijk. Eet het rosé; doorbakken wordt het taai."],["Great Western sparkling shiraz","Mousserende rode wijn uit de streek hiernaast."],["Chicken parmigiana","Het nationale pubgerecht van Victoria. Kortweg 'parma'."]],
 rest:[["Paper Scissors Rock Brew Co","Grampians Road, Halls Gap",4.5,2,null,"10 minuten rijden. Eigen brouwerij, zeven dagen tot 20.00 uur, uitzicht op de bergen.","Niet nodig, maar bel even of ze een grote groep aankunnen."],
   ["Barney's Bar & Bistro","Pomonal, 12 km",4.6,2,null,"15 minuten rijden. Kangoeroeburger op de kaart, en je zit er tussen de dorpelingen in plaats van tussen de toeristen.","Telefonisch: +61 419 505 025. Woensdag vaak vol."]]},

{n:15,r:"vic",k:"bus",t:"Warrnambool via Tower Hill",p:"Warrnambool",
 emoe:[3,"Bij Tower Hill scharrelen ze rond het bezoekerscentrum en komen tot bij de bus. Tweede zekere dag op rij."],h:"Comfort Inn Western, Kepler Street",tz:11,temp:"9–18°",
 wild:[["Koala","Tower Hill is een van de beste plekken van Victoria om ze in het wild te zien. Zoek hoog in de gaffelvork van de eucalyptussen langs de paden; ze bewegen nauwelijks.",3],
  ["Emoe","Lopen los rond het bezoekerscentrum en de picknickplaats, soms tot bij de auto's.",3],
  ["Kangoeroe en wallaby","In het open grasland van de krater, vooral in de ochtend en late middag.",3],
  ["Echidna","Langs de wandelpaden, overdag.",2],
  ["Zuidkaper","Bij Logans Beach in Warrnambool, vanaf het uitkijkplatform. Het seizoen loopt eind oktober af; dit is de laatste kans.",1]],
 body:[
  "Onze rondreis vervolgen we door vulkanisch gebied. We rijden naar het Tower Hill reservaat, dat wordt beheerd door de lokale bevolking daar. Hier vind je een vulkanische formatie die meer dan 30.000 jaar geleden is ontstaan. Tijdens een wandeling door dit natuurgebied spot je misschien wel emoes, koala’s, wallaby’s en kangoeroes in hun natuurlijke omgeving. Een prachtige kennismaking met de Australische dierenwereld.",
  "We overnachten in Warrnambool, in een typisch Australische accommodatie op de hoek van Timor en Kepler Street. Alle adressen hieronder liggen binnen zes minuten lopen."
 ],
 prac:["Bij Logans Beach staat een gratis uitkijkplatform voor zuidkapers. Het seizoen loopt tot ongeveer eind oktober, dus jullie zitten aan de staart ervan — maar het kost niets om te kijken.",
  "Zoek in Tower Hill omhoog, niet vooruit. Koala's zitten overdag hoog in de gaffelvork van een eucalyptus en bewegen nauwelijks.",
  "Doe vanavond je waszak vast klaar. Overmorgen in Melbourne kun je hem afgeven."],
 food:[["Southern rock lobster","Port Fairy en Portland zijn belangrijke aanvoerhavens."],["Zuivel","Deze streek is de melkschuur van Victoria. Kaas, boter en ijs zijn hier uitzonderlijk."]],
 rest:[["Lost Cat","Liebig Street",4.8,2,5,"Klein, houtvuur, wisselende kaart. Lamskoteletten en mosselen met nduja op toast.","Online. Zeer klein — boek nu al voor donderdagavond."],
   ["Lot 17","Timor Street",4.8,2,5,"Het 'feed me'-menu rond de 60 dollar is uitstekende waar.","Online of telefonisch: +61 434 241 717."],
   ["Salt","Liebig Street",4.5,2,5,"De barramundi en de sticky date pudding krijgen de meeste lof.","Online via de website van het restaurant."]]},

{n:16,r:"vic",k:"bus",t:"Great Ocean Road naar Melbourne",p:"Great Ocean Road",h:"Ibis Melbourne, Therry Street",tz:11,temp:"9–20°",
 wild:[["Koala","Kennett River, tussen Apollo Bay en Lorne, ligt op de route. Langs Grey River Road zitten ze in bijna elke boom, laag en zichtbaar. Vraag of de bus er even stopt.",3],
  ["Koningsparkiet","Ook bij Kennett River: ze landen op je arm als je stil blijft staan. Niet voeren.",3],
  ["Dwergpinguïn","Onder de kliffen bij de Twelve Apostles broedt een kolonie; ze komen pas na zonsondergang aan land, als jullie waarschijnlijk al weg zijn.",1],
  ["Bultrug","Vanaf de uitzichtpunten bij de Twelve Apostles en Loch Ard Gorge. Kijk naar de horizon.",1]],
 body:[
  "Vandaag staat één van de mooiste routes van Australië op het programma, the Great Ocean Road. De route van vandaag is ongeveer 350 km lang en we rijden inclusief stops ongeveer negen uur. We maken verschillende stops en je hebt geweldige uitzichten over de oceaan. Het bekendste punt zijn de Twelve Apostles bij Port Campbell, al staan er allang geen twaalf meer overeind. De Great Ocean Road eindigt bij Peterborough en daarmee ook het spectaculaire landschap van de westkust.",
  "Via de Great Ocean Road rijden we naar Melbourne. Qua inwoners is Melbourne heel divers. Er woont een mengelmoes van Australiërs en andere nationaliteiten, waaronder een grote populatie uit India en Azië. De combinatie van deze culturen maakt Melbourne tot een sfeervolle, culinaire en enerverende stad. Melbourne heeft verschillende leuke wijken, waar je de invloeden van de verschillende nationaliteiten terugziet. Je verblijft twee nachten in het Ibis aan Therry Street, aan de noordkant van het centrum bij de Queen Victoria Market."
 ],
 wash:"Leg je waszak vanavond klaar. Morgenochtend kun je hem afgeven en krijg je hem 's middags of 's avonds schoon terug — zie dag 17 voor de adressen.",
 prac:["Stop bij Gibson Steps, net vóór het hoofdbezoekerscentrum van de Twelve Apostles. Daar loop je een trap af naar het strand en sta je aan de vóet van de kliffen. Vrijwel iedereen rijdt er voorbij naar het uitzichtplatform.",
  "De rotsen staan aan de zuidkant van de weg. In de middag heb je zon in je lens; het licht is het beste als je met je rug naar het binnenland staat.",
  "Tussen de stops langs de Great Ocean Road zit soms een uur zonder winkel of café. Neem vanuit Warrnambool iets te eten en te drinken mee voor onderweg."],
 food:[["Koffie","Melbourne is de koffiehoofdstad van Australië. Ga naar een zijsteegje, niet naar een keten."],["Dim sim","Grove Chinees-Australische dumpling, uitvinding uit Melbourne."],["Souvlaki","Melbourne heeft een van de grootste Griekse gemeenschappen buiten Griekenland."],["Vegemite","Wordt hier gemaakt. Dun smeren op geboterde toast, niet als jam gebruiken."],["Chiko roll","Een dikke gefrituurde rol met schapenvlees en kool, in 1951 bedacht in Bendigo voor het voetbalstadion. Verkrijgbaar bij elke snackbar."],["Lamington","Cakeblokje met chocolade en kokos; hier vaak met een laag jam ertussen."]],
 rest:[["Pastuso","AC/DC Lane",4.6,3,23,"Peruaans, ceviche en anticuchos, uitstekende pisco sour. Een klein half uur lopen, of vijf minuten met de gratis tram over Elizabeth Street.","Online via de website van het restaurant. Vrijdagavond vroeg vol."],
   ["MoVida Next Door","Flinders Street",4.6,2,22,"Spaanse tapas, kleiner en ontspannener dan het hoofdrestaurant ernaast. Binnen de gratis tramzone.","Online via de website van het restaurant."],
   ["MoVida","Hosier Lane",4.5,2,22,"In het steegje met de beroemde straatkunst. Bestel de bomba-rijst.","Online via de website van het restaurant. Reserveren aanbevolen."]]},

{n:17,r:"vic",k:"vrij",t:"Melbourne, vrije dag",p:"Melbourne",h:"Ibis Melbourne, Therry Street",tz:11,temp:"11–20°",
 wild:[["Dwergpinguïn","Bij de pier van St Kilda, twintig minuten met tram 96 vanaf de stad, komt bij zonsondergang een kolonie aan land op de golfbreker. Gratis, met vrijwilligers die je de weg wijzen. De verrassing van Melbourne.",3],
  ["Grijskopvleerhond","Bij Yarra Bend Park, langs de rivier, overdag zichtbaar in de bomen en bij schemering in de lucht.",2],
  ["Kusuwaaierstaartbuidelrat","In Fitzroy Gardens en Carlton Gardens na het donker, in de bomen en op de paden. Mensen voeren ze, wat niet mag.",2]],
 body:[
  "Vandaag heb je vrij te besteden in de één na grootste en misschien wel de meest karakteristieke stad van Australië. Wat direct opvalt wanneer je door Melbourne loopt, zijn de trammetjes, die je nergens anders in Australië ziet. Naast de gratis toeristenbus is dit een leuke manier om de stad mee te verkennen; de gratis City Circle-tram rijdt een rondje langs de randen van het centrum.",
  "Nog een leuke en sportieve manier om de stad te verkennen is per fiets. Tijdens een fietstour laat een gids je kennis maken met alle facetten van Melbourne en geeft je tips over leuke plekken en wat je echt niet mag missen in deze stad. Aanraders op eigen houtje: de Queen Victoria Market, de laneways rond Degraves Street, de National Gallery of Victoria en de straatkunst in Hosier Lane."
 ],
 wash:"Vandaag is dé wasdag van de reis. Geef je was 's ochtends af en je hebt hem vanavond schoon terug. Drie manieren, van duur naar goedkoop: (1) via de receptie van het hotel — makkelijkst, maar per stuk afgerekend en al gauw meer dan honderd dollar; (2) Your Serviced Laundrette in Southbank, 4,5 op Google — haalt op en bezorgt op je hotelkamer, per lading; (3) The Lonely Sock aan Rose Lane, 4,4, bezorgt ook op hotels, gratis nummer 1800 940 602. Zelf doen kan ook: vraag bij de receptie van het Ibis of er een gastenwasruimte is.",
 prac:["Binnen de Free Tram Zone reis je gratis en hoef je nergens in te checken. Ga je verder dan die zone, dan heb je een Myki-kaart nodig; met alleen je bankpas kom je in de tram niet altijd weg.",
  "De Queen Victoria Market ligt op zeven minuten lopen van het hotel en is zaterdag open — het beste ontbijt van de stad.",
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
  "Door beperkte beschikbaarheid op de binnenlandse vluchten is dit deel van de route vanaf 1 oktober 2026 aangepast: het traject van Alice Springs naar Uluru is omgedraaid. Je vliegt vanochtend van Melbourne naar Uluru, zodat je die middag voldoende tijd hebt om de omgeving te verkennen en de optionele helikoptervlucht kunt maken.",
  "Uluru, ook wel Ayers Rock genoemd, is het spirituele en geografische hart van Australië. Voor de Anangu, de traditionele bewoners, is dit een heilige plaats die met groot respect wordt beschermd. Samen met het omliggende land staat Uluru op de UNESCO Werelderfgoedlijst. Vandaag ervaar je de immense uitgestrektheid en verlatenheid van de Australische woestijn.",
  "Bij aankomst in Uluru heb je de mogelijkheid om in een helikopter te stappen en te vliegen boven deze indrukwekkende monoliet. Pas dan zie je echt hoe indrukwekkend deze rode reus is. De rots rijst 348 meter boven het landschap uit en heeft een omtrek van maar liefst 9,4 kilometer; het grootste deel zit nog ónder de grond."
 ],
 prac:["De klok gaat vandaag anderhalf uur terug: van Victoria naar het Northern Territory, dat geen zomertijd kent.",
  "Sommige delen van Uluru mag je niet fotograferen. Het gaat om heilige plekken van de Anangu; er staan borden bij. Dat verbod geldt ook voor foto's die je alleen thuis laat zien.",
  "Er rijdt een gratis pendelbus die elke twintig minuten alle hotels van het resort aandoet.",
  "Het resort is de enige plek om iets te kopen en de prijzen liggen hoog. Sla je snacks in Melbourne in. Water hoef je niet te kopen: het kraanwater hier en in Alice Springs is grondwater, veilig maar mineraalrijk en wat zouterig van smaak. Wie het je afraadt, wil je een fles verkopen.",
  "Het is hier overdag ruim tien graden warmer dan in Melbourne. Pak je warme kleren onder in je koffer en leg je zomerkleren bovenop."],
 food:[["Kangoeroe","Mager en donker, als steak of in worst."],["Kameel","Australië heeft de grootste wilde kamelenpopulatie ter wereld. Mild en iets zoet."],["Quandong","Inheemse woestijnperzik, zurig, vaak in chutney of dessert."],["Wattleseed","Geroosterd acaciazaad, smaakt naar koffie en hazelnoot."],["Damper","Sodabrood dat oorspronkelijk in de as van het kampvuur werd gebakken. Vaak met golden syrup."],["Bush tomato","Kakadu-pruim en bushtomaat: kleine inheemse vruchten met een scherpe, bijna kaneelachtige smaak, meestal als chutney."]],
 rest:[["Arnguli Grill","Desert Gardens Hotel",4.5,2,8,"Het beste à-la-carterestaurant van het resort. 18.00–20.30 uur. Sounds of Silence staat apart, onder 'Optioneel vandaag'.","Online via de site van Ayers Rock Resort, of aan de receptie. Zonder reservering word je weggestuurd — boek nu al."],
   ["Ilkari Restaurant","Sails in the Desert",4.3,2,13,"Uitgebreid buffet rond de A$105 p.p., met oesters, krab, kangoeroe en lamskoteletten. Reserve als Arnguli vol zit; onder je norm van 4,4, maar de keus in Yulara is klein.","Via de site van Ayers Rock Resort of de receptie."],
   ["Outback BBQ & Bar","Outback Hotel & Lodge",4.0,2,-1,"Zelf grillen: je koopt je vlees — kangoeroe, emoe, barramundi — en bakt het op de gemeenschappelijke bbq, met saladebuffet en live muziek. Informeel, in je eigen hotel. Onder je norm, maar het is een ervaring en geen restaurant.","Niet nodig."]]},

{n:19,r:"red",k:"bus",t:"Van Uluru naar Alice Springs",p:"Alice Springs",
 emoe:[2,"In het open land langs de Lasseter en Stuart Highway, vooral 's ochtends. Vanuit de bus, dus wie aan het raam zit, telt."],h:"Desert Palms Resort, Barrett Drive",tz:9.5,temp:"18–32°",
 wild:[["Wilde kameel","Langs de Lasseter en Stuart Highway, vooral rond Curtin Springs. Australië heeft de grootste wilde kamelenpopulatie ter wereld.",2],
  ["Wedgestaartarend","Op en boven de weg, bij aangereden dieren. De grootste roofvogel van Australië; vanuit de bus goed te zien.",3],
  ["Rode reuzenkangoeroe en emoe","In het open land langs de weg, in de vroege ochtend en late middag.",2],
  ["Brumby","Verwilderde paarden in kleine groepen, soms vlak langs de weg.",1]],
 body:[
  "Vandaag reis je door naar Alice Springs, dwars door de outback. Ondanks dat dit de op twee na grootste stad van het Northern Territory is, wonen hier slechts zo’n 30.000 mensen. Alice Springs is de perfecte uitvalsbasis om de bezienswaardigheden in de omgeving te ontdekken en een bijzondere plek om te overnachten midden in de uitgestrekte outback.",
  "Het resort ligt bij de golfbaan en het casino, zo’n twintig minuten lopen ten zuiden van het centrum."
 ],
 prac:["Onderweg zie je Mount Conner, een enorme tafelberg die veel reizigers voor Uluru aanzien. De Australiërs noemen hem 'Fooluru'. Hij ligt op privéland.",
  "De weg terug naar het hotel over Barrett Drive en Gap Road is 's avonds slecht verlicht. Een taxi kost hier weinig en is onder reizigers gebruikelijk.",
  "Alice Springs heeft strenge regels rond alcoholverkoop; slijterijen zijn maar een deel van de dag open en je moet je paspoort tonen. In restaurants merk je er niets van."],
 rest:[["Q Eats","Todd Street / Gap Road",4.7,2,22,"Thais, de hoogste waardering van Alice Springs en het dichtst bij het hotel. De rode eendencurry is het gerecht.","Telefonisch: +61 476 763 067, of binnenlopen."],
   ["Warung Makan","Hartley Street",4.8,2,24,"Indonesisch, buiten eten. Nasi goreng, rendang en beef rib.","Telefonisch: +61 418 391 119. Zonder reservering moet je meestal even wachten."]]},

{n:20,r:"red",k:"excursie",t:"West MacDonnell Ranges",p:"Alice Springs",h:"Desert Palms Resort, Barrett Drive",tz:9.5,temp:"18–33°",
 wild:[["Zwartvoetrotskangoeroe","Op de rotsen bij Ormiston Gorge en Standley Chasm, in de schaduw en vroeg of laat op de dag. Klein, behendig en perfect gecamoufleerd; zoek naar beweging.",2],
  ["Zebravink en spinifexduif","Bij de waterpoelen van Ellery Creek en Ormiston Gorge, in zwermen.",3],
  ["Perentie","De grootste hagedis van Australië, tot twee meter, zonnend op rotsen langs de paden.",1],
  ["Dingo","Rond de picknickplaatsen. Op afstand blijven.",1]],
 body:[
  "We gaan vroeg uit de veren en vertrekken naar de West MacDonnell Ranges, in het Arrernte Tjoritja geheten: een prachtig nationaal park met spectaculaire bergruggen, droge valleien en kloven. Tijdens deze excursie bezoeken we onder andere Ormiston Gorge, een kloof die bekend staat om zijn outbacklandschap met hoge rode kliffen, ruige rotsformaties en een permanente waterpoel. Vanaf diverse uitkijkpunten heb je prachtig uitzicht op het omringende landschap.",
  "Voor het nemen van een verfrissende duik gaan we naar Ellery Creek Big Hole, waar je kunt zwemmen tussen twee hoge rotsen in. Vervolgens bezoeken we de Standley Chasm; door eeuwen van erosie strekken de wanden van deze kloof zich bijna 100 meter omhoog. Aan het einde van de middag gaan we weer terug naar Alice Springs."
 ],
 prac:["Standley Chasm is in beheer van de Arrernte-gemeenschap en heeft een eigen entree, los van het nationale park. De wanden lichten alleen rond het middaguur oranje op; een uur eerder of later sta je in de schaduw.",
  "Ellery Creek is dieper dan het lijkt en het water blijft het hele jaar rond de vijftien graden. Laat je er rustig in zakken en spring er niet in.",
  "Ormiston Gorge heeft als enige stop een bezoekerscentrum met toiletten en schaduw. Plan je pauze daar."],
 rest:[["Warung Makan","Hartley Street",4.8,2,24,"Ook dinsdag open. De beste keuken van de stad volgens de beoordelingen.","Telefonisch: +61 418 391 119."],
   ["Q Eats","Todd Street / Gap Road",4.7,2,22,"Ook dinsdag open, en het dichtst bij het hotel.","Telefonisch: +61 476 763 067."]]},

{n:21,r:"qld",k:"vlucht",t:"Vlucht Alice Springs – Cairns",p:"Cairns",h:"Cairns Plaza Hotel, Esplanade",tz:10,temp:"22–30°, vochtig",
 wild:[["Brilvleerhond","Een kolonie van duizenden hangt overdag in de bomen bij de bibliotheek aan Abbott Street, vijf minuten van de Esplanade, en vliegt bij zonsondergang uit.",3],
  ["Pelikaan en steltlopers","Op de wadplaten voor de Esplanade bij laag water, letterlijk voor het hotel. Met de informatieborden langs de boulevard herken je ze.",3],
  ["Bosgriel","Na het donker hoor je overal in Cairns een klaaglijke gil: dat is de bosgriel, een grote vogel die roerloos op grasvelden en parkeerplaatsen staat.",3],
  ["Zoutwaterkrokodil","In Trinity Inlet, de mangroven achter de stad. Je gaat er niet naar op zoek, maar het is wel de reden dat je hier niet in zee zwemt.",1]],
 fl:[["TL 361","Alice Springs","Cairns, terminal 2","12.50","15.30 (lokale tijd, klok een half uur vooruit)","Airnorth · 20 kg"]],
 body:[
  "Vandaag vlieg je in de middag vanuit Alice Springs verder naar Cairns, in het tropische noorden van Queensland. Het klimaat verandert volledig: van droge woestijnlucht naar vochtige warmte. Het hotel staat aan het noordelijke deel van de Esplanade, met uitzicht op Trinity Bay. Vandaag is er een maaltijd inbegrepen.",
  "Je hebt ruim de tijd om de omgeving te ontdekken. Cairns leent zich uitstekend als uitvalsbasis voor enkele fantastische dagexcursies. Deze bieden wij ter plaatse optioneel aan. Ga bijvoorbeeld mee naar het Daintree Rainforest en ontdek alles wat het Daintree Rainforest en Cape Tribulation te bieden hebben.",
  "Speur naar krokodillen tijdens een cruise op de Daintree River. Leer meer over de flora, fauna en geschiedenis tijdens een boardwalk-tour met een ervaren gids. Maak een 4WD-tocht door het regenwoud, bezoek Cape Tribulation Beach en geniet van een huisgemaakt Daintree-ijsje op de terugreis."
 ],
 wash:"Tweede waskans, mocht je in Melbourne niet alles hebben meegegeven. Vraag bij de receptie of het hotel een wasservice heeft — het is een kleiner, zelfstandig hotel, dus reken er niet op. Zelf doen kan bij Cairns Laundromat aan Sheridan Street (4,5 op Google), acht minuten lopen, open van 05.00 tot 23.00 uur, betalen met de pas. Gebruik de droger: bij deze luchtvochtigheid droogt niets uit zichzelf.",
 prac:["De klok gaat een half uur vooruit: van het Northern Territory naar Queensland. Queensland kent geen zomertijd, de rest van de oostkust wel.",
  "Zwemmen in zee is hier niet vanzelfsprekend, ook niet op mooie stranden. Er is een gratis lagune aan de Esplanade waar je wel veilig het water in kunt.",
  "Tropische kwallen komen hier het hele jaar voor. Van november tot mei is het risico het grootst, maar in oktober is het niet nul. Volg de aanwijzingen van de bemanning en trek het beschermende pak aan dat je aan boord krijgt. Krokodillen zitten er altijd, dus blijf uit riviermondingen en mangroven."],
 food:[["Mud crab","Grote modderkrab met chili of zwarte bonensaus. Je krijgt er een slabbetje bij, en dat heb je nodig."],["Moreton Bay bugs","Platte kreeftachtigen met zoet, stevig vlees."],["Coral trout","De fijnste rifvis, delicaat en duur."],["Tropisch fruit","Mango, papaja, lychee, passievrucht — en durian op de markten."],["Bundaberg ginger beer","Alcoholvrij gemberbier uit Queensland, gebrouwen sinds 1968. Overal verkrijgbaar."],["Barramundi","Hier op zijn best, vaak met mango-salsa."]],
 rest:[["Little Sister","Esplanade",4.6,2,8,"Het dichtstbij en uitstekend. Aziatische fusion, verse zeevruchten, oesters en lobster roll.","Telefonisch: +61 7 4031 5400, of online."],
   ["Dundees on the Waterfront","Marlin Parade",4.6,2,18,"Aan de jachthaven, 4,6 over ruim 5.500 beoordelingen. Het Australische proefplankje met kangoeroe en krokodil is de klassieker.","Online via de website van het restaurant. Reserveren nodig."]]},

{n:22,r:"qld",k:"vrij",t:"Cairns, vrije dag",p:"Great Barrier Reef",h:"Cairns Plaza Hotel, Esplanade",tz:10,temp:"22–30°, vochtig",
 wild:[["Groene zeeschildpad","Bij het buitenrif zwemmen ze rustig langs de koraalranden. Bijna elke snorkelaar ziet er minstens een.",3],
  ["Witpuntrifhaai","Onder overhangende koraalblokken, een tot anderhalve meter, ongevaarlijk. Vraag de gids waar ze liggen.",2],
  ["Anemoonvis en reuzendoopvont","Clownvissen in hun anemoon en reuzenschelpen van een meter breed; beide op ondiepe plekken bij het platform.",3],
  ["Napoleonvis","Een grote, nieuwsgierige lipvis die bij veel boten een vaste bezoeker is en dicht bij snorkelaars komt.",2],
  ["Rog","Op de zandvlaktes tussen het koraal, vaak half ingegraven.",2]],
 body:[
  "Kies er vandaag voor om mee te gaan naar het grootste koraalrif ter wereld: het populaire Great Barrier Reef, waar we gaan snorkelen. Keer in de avond terug naar de boulevard, want hier zijn genoeg mogelijkheden om heerlijk te eten.",
  "Met een catamaran ga je naar een uniek koraalrif, waar je kunt snorkelen tussen de schildpadden, kleurrijke vissen en verschillende soorten koraal. Om het kwetsbare koraal te beschermen werkt de organisatie samen met wetenschappers en het Coral Nurturing Program. Gezamenlijk hebben zij zes coral nurseries gebouwd; dankzij nieuwe technologie worden kwetsbare stukjes koraal gered en krijgen ze een nieuw thuis, zodat het rif de ruimte krijgt om gezond uit te groeien. De reisbegeleider kan helpen met het boeken."
 ],
 prac:["Op rifexcursies komt vrijwel altijd een aparte rifheffing bovenop de prijs, zo'n acht dollar per persoon per dag. Die zit meestal níét in het geboekte bedrag; houd contant of pas bij de hand.",
  "Draag het beschermende pak dat de boot aanbiedt, ook als het niet verplicht is. Het beschermt tegen kwallen én zon, en is beter voor het koraal dan zonnebrand.",
  "Het is anderhalf tot twee uur varen over open zee. Zeeziektepillen werken alleen als je ze een uur vóór vertrek neemt, niet aan boord."],
 rest:[["Little Sister","Esplanade",4.6,2,8,"Kort lopen na een lange dag op zee.","Telefonisch: +61 7 4031 5400."],
   ["Sails","Esplanade zuid",4.4,2,19,"Klein, Peruaans-Aziatisch, aan het water. Donderdag 16.00–21.00 uur.","Telefonisch: +61 403 441 669. Klein, dus vooraf bellen."]]},

{n:23,r:"qld",k:"vrij",t:"Cairns, vrije dag",p:"Daintree / Kuranda",
 emoe:[1,"Geen emoe maar een kasuaris: de derde grote loopvogel van Australië, met blauwe kop en rode lellen. In het regenwoud bij Cape Tribulation, zeldzaam maar oktober is een goede maand. Telt dubbel."],h:"Cairns Plaza Hotel, Esplanade",tz:10,temp:"22–30°, vochtig",
 wild:[["Zoutwaterkrokodil","Op de Daintree River-cruise, zonnend op de modderbanken bij laag water. Vroeg in de ochtend of laat in de middag de meeste kans; midden op de dag liggen ze in het water.",3],
  ["Helmkasuaris","In het regenwoud rond Cape Tribulation, met name op de Marrdja- en Dubuji-boardwalks. Zeldzaam, maar oktober is een goede maand. Nooit benaderen.",1],
  ["Ulysses-vlinder","Elektrisch blauwe vlinder van tien centimeter, in de zon boven het bladerdak en bij bloeiende struiken. Bij Kuranda en in het Daintree.",2],
  ["Boydbosdraak","Een hagedis die roerloos verticaal tegen een boomstam hangt, op ooghoogte langs de boardwalks. Je loopt er zo voorbij.",2],
  ["Boomkangoeroe","In de kruinen van het Daintree, uiterst zeldzaam. Alleen met een gids en veel geluk.",1]],
 body:[
  "We verblijven nog een laatste dag in Cairns. Heb je gisteren gekozen voor een excursie naar het Great Barrier Reef, dan kun je vandaag wellicht een bezoek brengen aan het Daintree Nationaal Park en Cape Tribulation. Een derde mogelijkheid is de Kuranda Scenic Railway naar boven en de Skyrail kabelbaan terug over het regenwoud; alle drie zijn dagvullend, dus het is het een of het ander.",
  "Of breng deze laatste dag in Cairns door op een van de vele terrassen en geniet van een typische flat white koffie. Morgen vliegen we alweer naar onze laatste bestemming van de reis: Perth."
 ],
 prac:["In het water bij Cape Tribulation kun je niet zwemmen, hoe uitnodigend het strand ook is. Er leven zoutwaterkrokodillen en de borden staan er niet voor niets.",
  "De Kuranda-trein rijdt maar twee keer per dag omhoog. Trein heen en Skyrail terug is de combinatie die de meeste mensen achteraf aanraden — vooraf boeken als combinatieticket scheelt geld.",
  "De Daintree River-cruise op zoek naar krokodillen gaat het beste vroeg in de ochtend of laat in de middag; midden op de dag liggen de dieren uit het zicht."],
 rest:[["Dundees on the Waterfront","Marlin Parade",4.6,2,18,"Laatste avond in de tropen. Vraag naar de coral trout of de mud crab.","Online via de website van het restaurant."],
   ["Little Sister","Esplanade",4.6,2,8,"Vrijdag tot 21.00 uur.","Telefonisch: +61 7 4031 5400."]]},

{n:24,r:"wa",k:"vlucht",t:"Vlucht naar Perth",p:"Perth",h:"Ibis Perth, Murray Street",tz:8,temp:"12–24°",
 wild:[["Carnabys raafkaketoe","Grote zwarte kaketoes met witte staartvlekken, bedreigd en alleen in het zuidwesten van Australië. In Kings Park, in groepen en luid.",2],
  ["Bobtail","Een dikke, korte skink met een blauwe tong, in de lente actief op paden in Kings Park. Ongevaarlijk.",2],
  ["Quenda","Een kleine buideldas die in de schemering door het struikgewas van Kings Park ritselt.",1]],
 fl:[["QF 1980","Cairns, terminal 2","Darwin","10.45","12.55 (Darwin-tijd)","Qantas, uitgevoerd door Alliance Airlines · 1 koffer"],
     ["QF 1741","Darwin","Perth, terminal 4","14.55","17.20 (Perth-tijd)","Qantas, uitgevoerd door Network Aviation · 1 koffer"]],
 body:[
  "Vandaag vliegen we naar Perth, de hoofdstad van West-Australië. Dit is de langste reisdag van de rondreis: dwars over het continent, met een overstap van twee uur in Darwin. Perth is een van de meest afgelegen grote steden ter wereld; Jakarta ligt er dichterbij dan Sydney. Deze levendige stad ligt ingeklemd tussen de Indische Oceaan en de uitgestrekte outback en staat bekend om haar prachtige stranden en relaxte sfeer.",
  "Afhankelijk van het vluchtschema heb je vandaag nog tijd om Perth te verkennen. Maak bijvoorbeeld een wandeling door Kings Park, de botanische tuin waar je een indrukwekkende verzameling inheemse plantensoorten vindt en geniet van het panoramische uitzicht over de stad. Liever naar de kust? Met het openbaar vervoer ben je zo op Scarborough Beach, een van de bekendste stranden van Perth. Hier kun je heerlijk ontspannen of juist de levendige sfeer opsnuiven tijdens de avondmarkt — op donderdag in de zomer en op zaterdag in de winter — met muziek, kraampjes en een prachtige zonsondergang boven de oceaan.",
  "Het hotel staat midden in het centrum; alle adressen hieronder liggen binnen vijf minuten lopen."
 ],
 prac:["De klok gaat in twee stappen twee uur terug: een half uur bij aankomst in Darwin, nog anderhalf uur bij aankomst in Perth. De overstap in Darwin is twee uur; je bagage gaat door, dus je hoeft alleen van gate te wisselen.",
  "West-Australië heeft eigen quarantaineregels. Vers fruit en groente, honing, ongebrande noten, zaden en planten zijn beperkt of verboden; fabrieksmatig verpakt en bewerkt voedsel — geroosterde noten, chocola, koekjes — mag gewoon mee. Bij twijfel: aangeven of in de bak bij de aankomsthal.",
  "In het centrum rijden de gratis CAT-bussen, herkenbaar aan rood, blauw, geel en groen. Je kunt er zonder kaart of pas op.",
  "Het is hier tien graden koeler dan in Cairns en 's avonds fris aan zee. Je lange broek kun je weer bovenop leggen."],
 food:[["Western rock lobster","De belangrijkste visserij van de staat, en volgens velen de beste kreeft van Australië."],["Marron","Grote zoetwaterkreeft, alleen in het zuidwesten. Zoet en delicaat."],["Chilli mussels","Mosselen in pittige tomatensaus. Een Fremantle-uitvinding."],["Margaret River-wijn","Cabernet en Chardonnay van wereldklasse, drie uur naar het zuiden."],["Little Creatures Pale Ale","Uit de brouwerij aan de haven van Fremantle; een van de bieren die de Australische ambachtelijke brouwerij op gang bracht."]],
 rest:[["KARLA","Wellington Street",4.9,2,5,"De hoogst gewaardeerde zaak van je hele reis. Moderne vuurkeuken met Aziatische invloeden en inheemse ingrediënten; 'karla' is Noongar voor vuur.","Online via de website van het restaurant. Boek vóór vertrek uit Nederland."],
   ["Ugly Baby","Wellington Street",4.7,2,7,"Mediterraan, deelgerechten, 'feed me'-menu.","Online. Zelfde eigenaar als KARLA."],
   ["The Standard","Roe Street, Northbridge",4.4,2,8,"Rooftop met mooie zonsondergang.","Online via de website van het restaurant."]]},

{n:25,r:"wa",k:"vrij",t:"Perth, vrije dag",p:"Fremantle",h:"Ibis Perth, Murray Street",tz:8,temp:"12–24°",
 wild:[["Tuimelaar","In de haven van Fremantle en op de Swan River bij de veerboten. Ze zwemmen mee met bootjes en jagen bij de kademuren.",2],
  ["Bultrug","Voor de kust van Cottesloe, in oktober met kalveren op weg naar het zuiden. Vanaf het strand met een verrekijker, of vanaf het terras bij zonsondergang.",1],
  ["Visarend","Nestelt op palen en masten in de haven van Fremantle; kijk omhoog op de kades.",2],
  ["Pelikaan","Op de aanlegsteigers bij Fishing Boat Harbour, wachtend op wat overblijft.",3]],
 body:[
  "Vandaag heb je vrije tijd om Perth en omgeving te ontdekken. Een van de hoogtepunten is de havenstad Fremantle, door de locals vaak Freo genoemd. Vanuit het centrum van Perth reis je in een half uur met de trein naar deze bruisende plek. Onderweg kom je langs de mooiste stranden, waaronder het bekende Cottesloe Beach. Dit strand is ideaal voor een ontspannen dag aan zee, of om simpelweg te genieten van de zonsondergang die hier spectaculair is.",
  "In Fremantle zelf vind je prachtig bewaard gebleven Victoriaanse panden, variërend van kerken en huizen tot gezellige barretjes. Je kunt er een bezoek brengen aan het WA Shipwrecks Museum, met de resten van de Batavia, of aan de historische Fremantle Prison. Als je er in het weekend bent, is de Fremantle Market een aanrader om rond te struinen voor souvenirs en lekkere hapjes. Voor een verfrissende pauze is bierbrouwerij Little Creatures een fijne plek om lokaal bier te proeven. Of zoek de kust weer op bij Bathers Beach, een fijne plek om neer te strijken bij een strandtent voor een hapje of een drankje."
 ],
 prac:["Perth is de enige grote stad van Australië waar de zon ín zee zakt. Overal elders kijk je oostwaarts. Cottesloe Beach is daar de plek voor, op de terugweg uit Fremantle.",
  "In het Shipwrecks Museum staat het originele achterschip van de Batavia, plus de stenen poort die als ballast meevoer en nooit in Batavia is aangekomen. Voor Nederlanders het merkwaardigste museumstuk van de reis.",
  "De Fremantle Market is alleen vrijdag, zaterdag en zondag open — vandaag treft het dus goed."],
 tip:"Bestel op de Cappuccino Strip de chilli mussels; dit is waar het gerecht vandaan komt.",
 rest:[["KARLA","Wellington Street",4.9,2,5,"Zondag vanaf 11.00 uur. Als je gisteren geen plek kreeg: probeer het vandaag opnieuw.","Online via de website van het restaurant."],
   ["Ugly Baby","Wellington Street",4.7,2,7,"Zondag vanaf 12.00 uur.","Online."]]},

{n:26,r:"wa",k:"vrij",t:"Perth, vrije dag",p:"Rottnest Island",h:"Ibis Perth, Murray Street",tz:8,temp:"13–23°",
 wild:[["Quokka","Overal, vooral rond Thomson Bay en de nederzetting. Ze komen uit zichzelf op je af. Niet aanraken, niet voeren.",3],
  ["Nieuw-Zeelandse zeebeer","Bij Cathedral Rocks aan het westelijke uiteinde, op de rotsen en in het water. Het uitkijkplatform ligt aan de fietsroute.",3],
  ["Bultrug","Vanaf West End en Cape Vlamingh: oktober is de beste maand voor walvissen bij Rottnest. Blijf even staan op het uitkijkpunt; ze laten zich niet meteen zien.",2],
  ["Visarend","Nesten van takken op rotspunten langs de zuidkust, al tientallen jaren in gebruik.",3],
  ["Koningsskink en rifvissen","Skinks in het struikgewas langs de paden; bij The Basin en Little Salmon Bay zwem je tussen felgekleurde rifvissen.",3]],
 body:[
  "Vandaag heb je de mogelijkheid om Rottnest Island te bezoeken, dat op slechts een half uur varen ligt vanaf de haven van Fremantle. Tickets kun je het beste vooraf reserveren; vraag de reisbegeleider voor meer informatie. Het eiland is autovrij en de fiets is hier het populairste vervoermiddel. Bij aankomst kun je een fiets huren en het eiland verkennen langs felblauwe wateren, witte verlaten stranden, rotsachtige baaien en tropische planten. Vergeet je zwemspullen niet, want dit is ook de perfecte plek om te zwemmen, snorkelen en duiken.",
  "Naast de prachtige natuur staat Rottnest Island bekend om de beroemde quokka’s, kleine buideldiertjes die ook wel het gelukkigste dier ter wereld worden genoemd vanwege hun permanente ‘glimlach’ en het gebrek aan natuurlijke vijanden. Aan hen dankt het eiland zijn naam: Willem de Vlamingh zag ze in 1696 voor grote ratten aan en noemde het ’t Eylandt ’t Rottenest. Het is een unieke ervaring om deze vrolijke diertjes van dichtbij te zien terwijl je langs de idyllische kust fietst."
 ],
 prac:["Vaar vanuit Fremantle, niet vanuit Perth of Hillarys. De overtocht is korter en goedkoper; vanuit de stad ben je bijna twee keer zo lang onderweg.",
  "Quokka's aanraken en voeren is verboden en er staat een boete op. Ze komen uit zichzelf dichtbij; ga op je hurken zitten en wacht.",
  "Er is één winkel op het eiland, bij Thomson Bay, en die is duur. Neem je lunch mee vanaf het vasteland.",
  "Boek de veerboot vooraf bij Rottnest Express of SeaLink. Op mooie dagen zit hij vol."],
 rnote:"Ugly Baby en The Standard zijn maandag gesloten. Deze twee niet.",
 rest:[["KARLA","Wellington Street",4.9,2,5,"Maandag open vanaf 17.30 uur.","Online via de website van het restaurant."],
   ["Italian Street Kitchen","Raine Square, William Street",4.4,2,3,"Drie minuten lopen, zeven dagen open.","Online, of binnenlopen."]]},

{n:27,r:"wa",k:"excursie",t:"Naar de Pinnacles",p:"Nambung National Park",
 emoe:[1,"In Nambung National Park tussen de pilaren, vooral vroeg en laat op de dag. Laatste kans van de reis."],h:"Ibis Perth, Murray Street",tz:8,temp:"12–27° in de woestijn",
 wild:[["Westelijke grijze reuzenkangoeroe en emoe","In Nambung, vooral in de vroege ochtend en late middag tussen de pilaren. Midden op de dag zoeken ze schaduw.",1],
  ["Bobtail","De dikke blauwtongskink zont in de lente op de zandpaden van de Pinnacles.",2],
  ["Stromatolieten","Geen dier maar het oudste leven op aarde: levende kolonies bacteriën in Lake Thetis, vlak bij Cervantes, met een wandelpad eromheen. Vraag of de bus er langsgaat.",3],
  ["Wildflowers","Oktober is het hoogtepunt van de wildflowerbloei in West-Australië. Langs de Indian Ocean Drive kleurt de berm geel, roze en paars.",3]],
 body:[
  "Vandaag rijden we ten noorden van Perth naar Nambung National Park, waar we de beroemde Pinnacles Woestijn bezoeken. Deze bijzondere plek staat bekend om de duizenden kalkstenen pilaren die uit het gouden zand oprijzen en een surrealistisch landschap creëren. Ze zijn ontstaan uit fossiele schelpresten die tot kalksteen verhardden, waarna de wind het losse zand eromheen wegblies.",
  "Je kunt hier een korte wandeling maken tussen de Pinnacles door of gewoon genieten van het uitzicht vanaf de aangewezen paden. Vergeet je camera niet, want dit is een perfecte plek voor indrukwekkende foto’s en een unieke ervaring in de Australische natuur. De rit gaat langs de Indian Ocean Drive; aan het einde van de dag rijden we weer terug naar Perth, waar je kunt ontspannen en de ervaringen van vandaag kunt laten bezinken."
 ],
 prac:["De Discovery Drive door de Pinnacles is eenrichtingsverkeer, maar te voet mag je overal tussen de pilaren door lopen. Dat levert veel betere foto's op dan vanuit de bus.",
  "Stopt de groep in Cervantes? Daar zit de Lobster Shack, een kreeftverwerkingsbedrijf met restaurant. De western rock lobster is er vers en relatief betaalbaar."],
 rest:[["KARLA","Wellington Street",4.9,2,5,"Dinsdag vanaf 17.30 uur. Een passende laatste avond: inheemse ingrediënten uit heel Australië op één kaart.","Online via de website van het restaurant."],
   ["Italian Street Kitchen","Raine Square",4.4,2,3,"Ook dinsdag open.","Online."]]},

{n:28,r:"reis",k:"vlucht",t:"Vlucht Perth – Amsterdam",p:"Perth → Schiphol",tz:8,
 fl:[["SQ 214","Perth, terminal 1","Singapore Changi","17.05","22.10 (Singapore-tijd)","Singapore Airlines · 25 kg"],
     ["SQ 324","Singapore Changi, terminal 3","Amsterdam Schiphol","23.55","06.55 (29 okt, Nederlandse tijd)","Singapore Airlines · 25 kg"]],
 body:[
  "De rondreis zit er alweer op en waarschijnlijk is de tijd voorbij gevlogen! We vertrekken met het vliegtuig naar Amsterdam, waar je afscheid neemt van de groep. Je vliegt pas om 17.05 uur, dus de ochtend in Perth is nog vrij. Overstap in Singapore van 1 uur en 45 minuten, aankomst op Schiphol de volgende ochtend om 06.55 uur."
 ],
 prac:["Je vertrekt pas om 17.05 uur. Vraag het hotel om een late uitcheck of laat je bagage achter, en gebruik de ochtend voor Kings Park of een laatste wandeling langs de Swan River. Op het vliegveld wil je rond 14.30 uur zijn.",
  "Vraag de GST terug via het Tourist Refund Scheme. Voorwaarden: minimaal A$300 inclusief GST bij één leverancier (zelfde ABN-nummer, mag over meerdere bonnen), gekocht binnen zestig dagen vóór vertrek, met een geldige tax invoice. Boven A$1.000 moet je naam op de bon staan. Het artikel moet je kunnen tonen — dus in je handbagage.",
  "De TRS-balie zit ná de paspoortcontrole en er staat vaak een rij; wees er ruim op tijd. Grote of ingecheckte artikelen moet je vóór het inchecken laten zien bij de balie van de Australian Border Force in de vertrekhal — anders vervalt de teruggave.",
  "Honing mag de EU in, vlees en zuivel van buiten de EU niet. Tim Tams, macadamianoten en een fles Margaret River-wijn zijn de veilige souvenirs."]},

{n:29,r:"reis",k:"vlucht",t:"Aankomst Amsterdam",p:"Thuis",tz:null,
 fl:[["SQ 324","Singapore Changi","Amsterdam Schiphol","23.55 (28 okt)","06.55","Singapore Airlines"]],
 body:[
  "Om 06.55 uur land je op Schiphol. Welkom thuis."
 ],
 prac:["De terugreis gaat naar het westen en valt meestal lichter dan de heenreis: je dag wordt langer in plaats van korter. Blijf de eerste dag zoveel mogelijk buiten in het daglicht en ga niet vóór 22.00 uur naar bed, dan ben je er in twee dagen doorheen."]}
];

const PACK=[
 ["Warme laag en windjack","Vandaag is het aanzienlijk kouder dan waar je vandaan komt.",[5,7]],
 ["Zwemkleding","Vandaag kun je het water in.",[4,20,22,26]],
 ["Schoongeborstelde wandelschoenen","Modder aan je zolen is een quarantaine-item bij aankomst.",[1]],
 ["Muggenspul","Onder het bladerdak zijn ze er de hele dag. Zonnebrand heb je er juist niet nodig.",[23]],
 ["Zaklamp of telefoon met rode nachtmodus","Wit licht verstoort de pinguïns; flitsen mag niet.",[8]],
 ["Medicijnen in originele verpakking","Met bijsluiter en zo nodig een Engelse doktersverklaring.",[1]],
 ["Reisstekker type I","Platte schuine pennen, dezelfde in heel Australie.",[1]],
 ["Handdoek en droge kleren in je dagtas","Omkleden kan onderweg alleen bij de kloof zelf.",[20]],
 ["Verrekijker, als je er een hebt","Walvissen voor de kust zie je zonder kijker alleen als spuit. Oktober is trekseizoen aan beide kusten.",[4,10,15,25,26]],
 ["Bonnen boven A$300 bij de hand","Voor de btw-teruggave op het vliegveld.",[27,28]]
];

const EXC=[
 ["BridgeClimb Summit Twilight",3,"Geboekt · 16.15 uur","Klimmen over de boog van de Harbour Bridge tot 134 meter boven de haven, vastgeklikt aan een rail, met zonsondergang onderweg. Ongeveer drie en een half uur. Fototoestellen mogen niet mee; de gids maakt de foto's."],
 ["Rondleiding Sydney Opera House",3,"Geboekt · 09.00 uur","Rondleiding van een uur door de zalen en foyers. Melden bij het Welcome Centre op de Lower Concourse, een kwartier vooraf."],
 ["Scenic World Blue Mountains",5,"\u00b1 A$60","Combikaart voor drie ritten: de steilste passagiersspoorlijn ter wereld met een helling van 52 graden, een kabelbaan over het Jamison-dal, en een boardwalk door het regenwoud beneden. Onbeperkt op en neer, reken op twee uur."],
 ["Pingu\u00efnkolonie Bicheno",8,"\u00b1 A$40","Avondwandeling met een gids langs de kust naar een kolonie kleine pingu\u00efns. Ongeveer een uur, startend rond zonsondergang."],
 ["MONA inclusief ferry",10,"\u00b1 A$65","Veerboot over de Derwent naar het grotendeels ondergrondse museum van David Walsh. Moderne kunst die bewust schuurt, uitgehakt in de zandsteen. Reken op een halve dag; de overtocht duurt een half uur."],
 ["Boottocht Tasman Island",10,"\u00b1 A$180","Drie uur in een open boot langs de hoogste zeekliffen van het zuidelijk halfrond, met zeehonden, albatrossen en in het seizoen walvissen. De zee staat er vaak ruw, dus niet doen als je snel zeeziek wordt."],
 ["Helikoptervlucht Uluru",18,"A$180\u2013250","Vijftien tot dertig minuten boven Uluru en Kata Tjuta. De langere vlucht neemt beide mee; alleen vanuit de lucht zie je hoe de rots in het vlakke land ligt."],
 ["Sounds of Silence-diner",18,"\u00b1 A$285","Diner in de openlucht in de duinen. Champagne bij zonsondergang met zicht op Uluru, buffet met inheemse ingredi\u00ebnten, en na het eten gaan de lampen uit voor een sterrenkijksessie met een gids. Ongeveer vier uur."],
 ["Great Barrier Reef, snorkelen",22,"A$230\u2013280 + rifheffing","Dagtocht per catamaran naar het buitenrif, anderhalf tot twee uur varen. Snorkelen op twee plekken, meestal met een biologiepraatje aan boord en lunch inbegrepen. Duiken kan tegen bijbetaling."],
 ["Daintree en Cape Tribulation",23,"\u00b1 A$200","Dagtocht met gids: cruise op de Daintree River op zoek naar krokodillen, boardwalk door het oudste regenwoud ter wereld, en het strand van Cape Tribulation waar het bos de zee raakt. Zwemmen kan er niet."],
 ["Kuranda-trein en Skyrail",23,"\u00b1 A$140","Historische trein uit 1891 omhoog door vijftien tunnels en langs de Barron-watervallen naar het bergdorp Kuranda, en met de kabelbaan over het bladerdak terug. Als combinatieticket goedkoper dan los."],
 ["Fremantle Prison",25,"\u00b1 A$25","Rondleiding door de gevangenis die dwangarbeiders in de negentiende eeuw voor zichzelf bouwden en die tot 1991 in gebruik bleef. UNESCO-werelderfgoed. Anderhalf uur; er is ook een tunneltour door de watergangen eronder."],
 ["Rottnest: veerboot en fiets",26,"\u00b1 A$110","Overtocht vanuit Fremantle plus een huurfiets voor de dag. Het rondje over het eiland is ongeveer 22 kilometer langs baaien en zoutmeren, met genoeg afslagen om het korter te maken."]
];

// ============================================================
//  RESTAURANTGEGEVENS — één blok, los van de rest van de app
//  c   = aantal Google-beoordelingen
//  tel = telefoonnummer (null = onbekend)
//  sluit = sluitingstijd volgens Google op de avond dat je er bent;
//          keukens stoppen vaak 30 minuten eerder met bestellen
//  Bron: Google Maps, opgehaald op 5 september 2026.
// ============================================================
const CHECKED='5 sep 2026';
// Inchecklinks per maatschappij. De boekingscodes staan NIET in dit bestand (het is openbaar);
// de app leest ze uit een notitie van het type Ticket, één regel per maatschappij: "SQ: ABC123".
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
"Porkfat":{wv:1,k:"Thais",c:987,tel:"+61 478 565 691",sluit:"22.00"},
"NOMAD":{wv:1,k:"Modern Australisch",c:2847,tel:"+61 2 9280 3395",sluit:"21.30"},
"Mishy's":{wv:1,k:"Modern Australisch",c:450,tel:"+61 2 5657 2925",sluit:"22.00"},
"Dae Jang Kum":{wv:1,k:"Koreaanse barbecue",c:6329,tel:"+61 2 9211 0890",sluit:"02.00"},
"NOUR":{wv:1,k:"Libanees",c:3388,tel:"+61 2 9331 3413",sluit:"21.00"},
"White Horse":{wv:1,k:"Modern Australisch · deelgerechten",c:393,tel:"+61 456 910 417",sluit:"21.00"},
"Spice World":{wv:1,k:"Chinese hotpot",c:1189,tel:"+61 406 697 900",sluit:"23.00"},
"Nanjing Dumpling":{wv:1,k:"Chinees",c:1685,tel:"+61 499 333 808",sluit:"21.30"},
"Kawan Dining":{wv:1,k:"Aziatische fusion",c:540,tel:"+61 402 097 388",sluit:"21.00"},
"Tres":{wv:1,k:"Latijns-Amerikaans",c:352,tel:"+61 3 6351 7536",sluit:"22.00"},
"Mudbar":{wv:1,k:"Modern Australisch",c:2182,tel:"+61 3 6334 5066",sluit:"00.00"},
"Cataract on Paterson":{wv:1,k:"Steakhouse · zeevruchten",c:3040,tel:"+61 3 6331 4446",sluit:"21.00"},
"Sealife Restaurant":{wv:1,k:"Zeevruchten en vlees",c:561,tel:"+61 3 6375 1121",sluit:"20.00"},
"Lobster Shack":{wv:1,k:"Zeevruchten",c:3384,tel:"+61 3 6375 1588",sluit:"19.00"},
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
"Paper Scissors Rock Brew Co":{k:"Brouwerijcafé",c:1241,tel:"+61 3 5311 3709",sluit:"20.00"},
"Barney's Bar & Bistro":{k:"Bistro · Australisch wild",c:718,tel:"+61 419 505 025",sluit:"22.00"},
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
// Prijsindicatie afgeleid van de Google-prijsklasse — schatting, geen menuprijs
const PRICE={
 1:["Hoofdgerecht tot AUD 20","Diner ± AUD 30–40 p.p. excl. drank"],
 2:["Hoofdgerecht AUD 30–45","Diner ± AUD 55–75 p.p. excl. drank"],
 3:["Hoofdgerecht AUD 45–65","Diner ± AUD 90–120 p.p. excl. drank"],
 4:["Menu vanaf ± AUD 130","Diner ± AUD 150+ p.p. excl. drank"]};
const ROLE=["Eerste keuze","Alternatief","Reserve"];
const MIN_SCORE=4.4;

// Praktisch: noodgevallen en bagage. Wordt in het tabblad Praktisch getoond én doorzocht.
const SOS=["000","Politie, brandweer en ambulance in heel Australië. Vanaf een mobiel werkt 112 ook."];
const NOOD=[
 ["Consulaat-generaal Sydney","+61 2 8305 6800 — je aanspreekpunt bij verlies van je paspoort. Level 23, Westfield Tower 2, 101 Grafton Street, Bondi Junction."],
 ["Ambassade Canberra","+61 2 6220 9400 — geen consulaire balie, maar wel bereikbaar."],
 ["Buitenlandse Zaken, 24/7","+31 247 247 247, of WhatsApp +31 857 737 400. Werkt dag en nacht, ook met tijdverschil."],
 ["Bij verlies van je paspoort","Eerst aangifte bij de lokale politie, dán bellen. Zonder proces-verbaal krijg je geen noodpaspoort."],
 ["Zelf invullen vóór vertrek","Nummer van je reisverzekering, alarmcentrale en je reisbegeleider. Schrijf ze op papier en stop dat in je koffer — niet alleen in je telefoon."]
];
const BAGAGE="Singapore Airlines: 25 kg. Jetstar en Airnorth: 20 kg. Qantas: 1 koffer. Cabinebagage overal maximaal 7 kg. Pak dus op 20 kilo. Online inchecken doe je met de boekingscode plus je achternaam; tik op de naam van de maatschappij. Bij Jetstar sluit het inchecken een uur voor vertrek, dus doe het de avond ervoor.";
