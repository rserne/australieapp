# AustralieApp

Reisapp voor de Sawadee-groepsrondreis Australië, 1 t/m 29 oktober 2026.
Online op https://rserne.github.io/australieapp/ (GitHub Pages). Notities en tickets staan bij Nhost (Frankfurt).

## Bestanden

| Bestand | Wat erin staat | Wanneer aanpassen |
|---|---|---|
| `reis.js` | Alle inhoud, dus dagen, hotels, restaurants, winkels bij het hotel, excursies, kofferlijst, noodnummers, en de kleuren per regio (`TONE` en `TONE_INK`) | Bij elke inhoudelijke wijziging |
| `voorreis.js` | Programma van de voorreis, in dezelfde vorm als de dagen in `reis.js`. Leeg als de voorreis alleen uit notities bestaat | Bij een wijziging in het voorreisprogramma |
| `dieren.js` | De dieren voor de waarnemingen, met naam, groep en synoniemen, en de prijzen | Bij een nieuw dier, een andere naam of een andere prijs |
| `verhalen.js` | Het verhaal van de dag: per dag van de groepsreis een kort verhaal over de geschiedenis van de plek, met titel, alinea's en bron | Bij een nieuw of beter verhaal |
| `dieren-iconen.js` | De iconen bij die dieren, per sleutel één svg als tekst | Bij een nieuw of ander icoon |
| `app.js` | De code | Alleen bij nieuwe functies of bugfixes |
| `app.css` | De opmaak | Zelden |
| `index.html` | Het skelet van de pagina | Zelden |
| `sw.js` | Service worker met offline-cache en updatemelding | `VERSION` ophogen en een nieuwe foto ook aan `BEELD` toevoegen |
| `paklijst.html` | Losse paklijst naast de app, met eigen icoon (`icon-paklijst.png`). Alles staat op de telefoon, er gaat niets naar Nhost | Bij een andere startlijst. Staat in `CODE` en `BEELD` van `sw.js`, zodat hij ook na een update offline opent |
| `check.js` | Controleert `reis.js`, `voorreis.js`, de beelden (ook die van de paklijst) en de versienummers | Draaien vóór elke uitgave |
| `rooktest.js` | Start de app in een kale browser (jsdom) op een reeks datums, meldt elke JavaScript-fout en beproeft de wachtrij en de sessie met nagebootste Nhost-antwoorden | Draaien na een wijziging in `app.js` |
| `nhost/` | De projectconfiguratie van Nhost (`nhost.toml`), de tabellen (`schema.sql`) en de rechten in Hasura (`metadata.json`), zonder geheimen, met een eigen README over wat de app ervan verwacht | Als je in het dashboard van Nhost iets aan de instellingen verandert |

## Een nieuwe versie uitbrengen

1. Pas `reis.js` (of een ander bestand) aan.
2. `node check.js`, dat moet eindigen met "reis.js is in orde". Een waarschuwing dat de beelden niet in de map staan, mag je negeren als je alleen de codebestanden bij de hand hebt.
3. Na een wijziging in `app.js` draai je `node rooktest.js`, dat moet eindigen met "geen fouten". Hiervoor is jsdom nodig, eenmalig te installeren met `npm install -g jsdom` (of lokaal in een aparte map met `npm install jsdom` en die map in `NODE_PATH`). De app zelf gebruikt jsdom niet.
4. Hoog `APP_VERSIE` in `app.js` op (bijv. `2026-10-30-299`) en `VERSION` in `sw.js` (bijv. `v299`). De laatste cijfers horen gelijk te lopen. `check.js` waarschuwt als dat niet zo is.
5. Commit en push. Binnen een paar minuten ziet iedereen bij het openen van de app de balk "Er is een nieuwe versie" (zie Updates onderweg).

## Boekingscodes

De boekingscodes van de vluchten staan bewust **niet** in deze bestanden, want de repository is openbaar en met code plus achternaam kan iedereen een boeking wijzigen. De app leest ze uit een notitie achter de login.

Maak eenmalig in het tabblad Notities een notitie van het type **Ticket**, met per regel een maatschappij en de code:

```
Boekingscodes
SQ: ABC123
JQ: DEF456
QF: GHI789
TL: JKL012
```

De sleutels (`SQ`, `JQ`, `QF`, `TL`) zijn de IATA-codes uit `CHECKIN` in `reis.js`. De codes verschijnen daarna op de dagpagina bij elke vlucht van die maatschappij, met een knop om ze te kopiëren, ook offline. Een tik op Online inchecken kopieert de code ook.

Verschillen de codes per persoon, zet dan boven elk blokje een regel met alleen de naam, zoals die in de reizigerslijst staat (de voornaam is genoeg). Iedereen ziet dan zijn eigen codes. Een code die vóór de eerste naam staat, is van iedereen, en `Anna en Bram` boven een blokje geldt voor allebei. Een regel die geen naam en geen code is, zoals de titel hierboven, telt niet mee.

```
Boekingscodes
QF: GHI789
Anna
SQ: ABC123
JQ: DEF456
Bram
SQ: XYZ789
JQ: UVW012
```

Boekingscodes in voorreis- of nareisnotities tellen niet mee voor de groepsvluchten.

## Voorreis en nareis

Wie eerder gaat of langer blijft, kan notities maken voor dagen buiten de groepsreis. In `reis.js` staat hoeveel dagen dat zijn, namelijk `VOORREIS=13` (18 t/m 30 september) en `NAREIS=0`. Die dagen verschijnen in de dagkiezer van Notities boven 'Algemeen'. Intern hebben ze de nummers -1 t/m -13, en de nareis 30 en hoger. Wie er gaat, staat nergens in de code, maar in de tabel `reizigers` bij Nhost (zie Reizigers). De kaarten Voorreis en Nareis op de startpagina noemen de namen uit die tabel, en verschijnen alleen als iemand het deel doet.

Vóór 1 oktober toont het tabblad Vandaag een startpagina met het aftellen tot het vertrek en de reis in beeld, een raster met per regio de foto en de dagen. Wie is ingelogd, ziet in dat raster ook een kaart Voorreis (en Nareis, als die er is); een gast alleen als hij er zelf aan meedoet (zie Gasten). Tijdens de voorreis brengt die kaart je bij de notities van vandaag van wie onderweg is. Een voorreiziger telt op de startpagina af naar zijn eigen vertrek, en tijdens zijn voorreis toont Vandaag zijn dag zelf. Wie thuis nog wacht, blijft de startpagina zien.

Bovenaan Alle dagen staat een regel **Reisoverzicht**, die naar diezelfde pagina brengt. Vóór vertrek telt die af naar het vertrek; zodra jouw reis loopt, toont hij de voortgang en dooft in het raster elke regio die achter je ligt. De voortgang gaat over je eigen reis: een voorreiziger is op 25 september al acht dagen onderweg van zijn 42, iemand zonder voorreis ziet op 14 oktober 'Dag 14 van 29'. Zo blijft Vandaag altijd de dag zelf tonen en heeft het overzicht toch een vaste ingang. Terugbladeren vanaf dag 1 (of de eerste voorreisdag) komt er ook uit.

Is de hele reis voorbij, ook een eventuele nareis (`reisKlaar` in `app.js`), dan toont Vandaag weer het reisoverzicht. Er staat dan geen aftelling of voortgang meer, maar hoe lang je eigen reis duurde en van wanneer tot wanneer, zoals '29 dagen Australië, 1 t/m 29 oktober', of '18 september t/m 29 oktober' als de maanden verschillen. Geen enkele regio is meer gedempt. De afsluitpagina 'Reis voorbij' verschijnt alleen tijdens een nareis, voor wie er niet aan meedoet.

Elke voorreisdag is een pagina met alleen notities, in dezelfde vorm als een reisdag. Bladeren loopt door van de startpagina naar de voorreis en dan naar dag 1 tot en met 29. Alleen de pijl vanaf de startpagina slaat de voorreis over voor wie er niet bij hoort. Via de kaart Voorreis of terugbladeren vanaf dag 1 kom je er wel.

Testen op een andere datum kan door de app te openen met `?datum=2026-09-27` achter het adres.

### Programma van de voorreis

Standaard bestaat een voorreisdag alleen uit notities. Wie een programma heeft, zet dat in `voorreis.js`, een lijst `VOORDAGEN` met per dag hetzelfde object als een dag in `reis.js`. Twee dingen wijken af. In plaats van `n:` gebruik je `datum:"2026-09-20"`, zodat er niets verschuift als `VOORREIS` verandert, en `r:` laat je weg, want de voorreis heeft één vaste foto en kleur (`BUITEN` in `reis.js`). Alleen `t`, `p` en `body` zijn verplicht. De rest werkt zoals in de groepsreis, dus `k` (vlucht, bus, auto, excursie, vrij), `tz`, `h`, `temp`, `fl`, `agenda`, `note`, `tip`, `prac`, `wild` en `emoe`, `food` en `rest`. Hotels komen uit `HOTELGEO`, restaurants uit `RDATA`. Een excursie of koffer-item voor zo'n dag zet je in `EXC` of `PACK` met de datum in plaats van het dagnummer.

Een dag met programma ziet er in de app uit als een gewone reisdag, met dezelfde blokken en de notities ertussen. Een datum die niet in `VOORDAGEN` staat, blijft een dag met alleen notities. Zodra er programma is, toont het tabblad Alle dagen de voorreis per dag, vindt zoeken het programma en gebruikt de klok in Praktisch de plaats en tijdzone van de voorreisdag. Het programma is alleen zichtbaar voor wie is ingelogd, net als de voorreisdagen zelf. `check.js` controleert `voorreis.js` mee. Het bestand moet er altijd zijn, ook als de lijst leeg is. Een nareis met programma kan op dezelfde manier via `NADAGEN` in `nareis.js`, want de code kent het al.

Alle dertien voorreisdagen hebben een programma, van de vlucht vanaf Schiphol via Sydney, Cairns en Nhulunbuy naar Darwin, en daarna de vijfdaagse kampeertour door Kakadu, Nitmiluk en Litchfield. Alleen de twee kampen van die tour hebben coördinaten in `HOTELGEO`; de hotels in de steden waren niet bekend, en daarom hebben de restaurants daar geen looptijd (`null`).

## Reizigers

De tabel `reizigers` bij Nhost bepaalt drie dingen: wie de notities en waarnemingen van de groep mag zien, wie aan welk deel van de reis meedoet, en wie gast is (wel de reis en de waarnemingen, geen notities). Eén rij per account, met het `user_id` uit `auth.users`, de naam en de ja/nee-kolommen `voorreis`, `reis`, `nareis`, `beheer` en `gast`. De reisdatums zelf staan niet in de tabel; die komen uit `reis.js`. De tabel staat in `nhost/schema.sql`, de rechten in `nhost/metadata.json`, met een overzicht in `nhost/README.md`.

De rechten werken allemaal met dezelfde controle in Hasura: staat de gebruiker zelf in `reizigers`? Waarnemingen mag iedereen in de lijst lezen en schrijven, gasten ook. Voor de notities en bijlagen komt daar `gast = false` bij. Wijzigen en verwijderen mag alleen bij je eigen rijen. Zo hoeft er in geen enkele permissie een gebruikers-id te staan: een nieuwe reiziger is één rij in de tabel, en een gast is één vinkje in die rij.

De app haalt de lijst bij elke synchronisatie op en bewaart een kopie op de telefoon (`aus_cache_reizigers`), zodat hij ook offline weet wie je bent. Het inlogblok in Praktisch noemt je deelname. Sta je wel in `auth.users` maar niet in `reizigers`, dan meldt het blok dat, want dan houdt Hasura ook de notities voor je dicht.

### Beheer vanuit de app

Wie `beheer = true` heeft, ziet in Praktisch onder het inlogblok de knop **Reizigers beheren**. Die opent een eigen scherm met de reizigerslijst: per persoon de delen van de reis, Gast en Beheer als chips (een tik zet er een aan of uit) en een kruisje om iemand uit de lijst te halen. Zo kan de lijst onderweg vanaf de telefoon worden bijgehouden; de Nhost-console is daar niet voor nodig. Jezelf verwijderen of je eigen beheer uitzetten kan niet in de app. Het scherm gebruikt de foto van New South Wales (`reg-nsw.jpg`) als banner.

De knop Reiziger toevoegen opent een schuifpaneel met naam, e-mailadres, wachtwoord, de delen en de chip Gast, die standaard aanstaat (`DELEN_AAN`). Het wachtwoord maakt de app zelf: bij het openen staat er al een, drie dierennamen uit `dieren.js` en een getal, zoals `wombat-galah-koala-4821`. Het staat leesbaar in een gewoon tekstveld; de dobbelsteen ernaast maakt een nieuwe, de kopieerknop zet het op het klembord en toont dan even een vinkje, en zelf iets typen kan ook. Lukt kopiëren niet, dan staat het geselecteerd in het veld en zegt de statusregel dat. (Een melding onderin zou hier niet werken: het paneel ligt eroverheen.) Drie uit 45 woorden en een getal van vier cijfers is zo'n dertig bits aan willekeur: ruim genoeg tegen raden bij Nhost, dat herhaalde pogingen afremt.

Het is bewust geen wachtwoordveld. Zodra iOS er een ziet, stelt Safari zelf een sterk wachtwoord voor en zet dat op hetzelfde moment in de sleutelhanger van de beheerder, onder het adres van de reiziger. Dat is vanuit een webpagina niet meer weg te halen, en bij het inloggen bood iOS daarna ook het account van de reiziger aan. Zonder wachtwoordveld herkent iOS het paneel niet als aanmeldformulier, dus ook het e-mailveld hoeft niet op `username` te staan en biedt iOS er niet het adres van de beheerder bij aan.

Na het toevoegen blijft het paneel open met een welkomstbericht voor de reiziger: het adres van de app, zijn e-mailadres en wachtwoord, hoe hij inlogt, wat er in de tabbladen zit (een gast krijgt geen regel over Notities, wie de voorreis of nareis doet een zin extra) en helemaal onderaan hoe je de app op het startscherm zet, voor iPhone en Android. De tekst is nog aan te passen, en gaat dan met Delen via het deelmenu van de telefoon (WhatsApp, Berichten, Mail) of met Kopiëren naar het klembord. De tekst zelf staat in `welkomTekst` in `app.js`.

De app maakt eerst het account aan via het gewone aanmeldpunt van Nhost Auth (`/signup/email-password`, met de naam als display name) en schrijft daarna de rij in `reizigers`. De beheerder blijft zelf ingelogd. Daarvoor moet in Nhost aanmelden aanstaan en **e-mailbevestiging uit**: met bevestiging aan geeft het aanmeldpunt geen `user_id` terug voordat de reiziger op een mail heeft geklikt, en kan de app de rij niet schrijven. Er is bewust geen trigger die elk nieuw account automatisch in `reizigers` zet. Met aanmelden aan kan iedereen die het adres kent een account maken; zonder rij in `reizigers` ziet zo iemand niets. De rij die de beheerder schrijft, is het slot.

Een wachtwoord wijzigen of herstellen zit niet in de app: er is geen 'Wachtwoord vergeten', en de link uit een herstelmail van Nhost zou de app ook niet opvangen. Bewaar het wachtwoord dat je doorstuurt dus ook zelf. Raakt een reiziger het toch kwijt, dan is de enige uitweg het account in de Nhost-console weggooien en opnieuw aanmaken, en door de `on delete cascade` gaan zijn notities en waarnemingen dan mee. Uit de lijst halen ontneemt iemand de toegang; het account bij Nhost blijft bestaan.

Onderaan het scherm staat wanneer de lijst voor het laatst is opgehaald, of waarom dat mislukte. Die melding staat dan ook in het inlogblok. Mislukt het ophalen, dan is de kolomlijst van de select-permissie de eerste verdachte: Hasura neemt een later toegevoegde kolom niet vanzelf op, ook niet als "alle kolommen" aanstond, en de app kan de kolom dan niet opvragen. Dat geldt voor elke tabel en elke actie.

#### Laatst actief

Onder elke naam staat wanneer die persoon voor het laatst actief was, zoals "Laatst actief vandaag 07:12" of "Laatst actief gisteren 21:40". Wie nog nooit is ingelogd, krijgt "Nog niet actief geweest". De tijd komt uit `last_seen` in `auth.users`. Nhost zet die bij inloggen en bij elk verversen van de sessie, en de app ververst de sessie zodra hij data ophaalt met een token van meer dan een kwartier oud. Het is dus het laatste moment dat iemand de app met verbinding gebruikte. Wie de app offline opent, telt niet mee. De app haalt de tijden op zodra je het scherm opent, hoogstens eens per minuut, en bewaart een kopie voor offline (`aus_cache_actief`).

Een gewone gebruiker mag `auth.users` niet lezen. Daarom zet de view `reizigers_actief` alleen het tijdstip naast de reizigerslijst, en mag alleen een beheerder die view opvragen. Ontbreekt de view of de permissie, dan werkt het scherm gewoon, maar zonder de regels Laatst actief, en noemt de statusregel de fout van Hasura.

### Gasten

Wie `gast = true` heeft, reist mee zonder de notities van de groep te zien. Dat is bedoeld voor iemand die wel meedoet met de waarnemingen, maar niets te maken heeft met tickets, reserveringen, boekingscodes en verzekeringen. Een gast ziet de hele groepsreis en het tabblad Dieren, en kan daar net als iedereen waarnemingen noteren. Wat hij niet ziet: het tabblad Notities, de notities en de blokken 'Vandaag nodig' en 'Nodig op deze dag' op de dagpagina's, de knop Notitie toevoegen, de boekingscodes bij de vluchten, en het blok Verzekeringen. In het inlogblok staat 'als gast' achter zijn deelname, en de kop erboven heet Account in plaats van Notities.

Hasura houdt de notities en bijlagen voor een gast dicht. De app vraagt ze dan ook niet op: bij het synchroniseren haalt hij eerst de reizigerslijst, slaat voor een gast de notities over en haalt een oude kopie van de telefoon, voor wie eerder gewoon reiziger was. Bij het inloggen haalt de app de lijst op voordat hij de tabbladen tekent, zodat een gast het tabblad Notities niet eerst even ziet.

De voorreis en nareis volgen de bestaande vlaggen. Iedereen die is ingelogd, mag meekijken met de voorreis zodra iemand die doet; een gast niet, want die dagen bestaan grotendeels uit notities. Een gast ziet zo'n deel alleen als zijn eigen `voorreis` of `nareis` op `true` staat, en dan zonder notities: een voorreisdag zonder programma is voor hem leeg, en het Morgen-blok en Alle dagen zeggen 'Geen programma' waar anders het aantal notities staat.

## Alle dagen

Het tabblad Alle dagen groepeert de groepsreis per regio, in dezelfde indeling als het raster op de startpagina: een kop met de naam van de regio en het datumbereik, en daaronder de dagen. Een vliegdag telt mee bij de regio waar je heen gaat, dus dag 1 staat bij New South Wales. Voorreis en nareis staan als eigen blok, met een kop Groepsreis ertussen zodat duidelijk is waar de reis zelf begint.

Het dagnummer draagt de kleur van de regio, uit `TONE_INK` in `reis.js`: per regio een kleur voor het lichte en een voor het donkere thema, net als bij de dierengroepen. De diepe kleuren uit `TONE` liggen onder een foto en worden flets zodra je ze klein en opgelicht gebruikt, dus daar staat een eigen palet naast. Voorreis en nareis hebben ook een eigen paar. `check.js` controleert of elke regio zijn paar heeft. De dag van vandaag krijgt een getinte rij, een gevuld nummer en 'vandaag' in plaats van de datum.

Elk blok klapt in en uit met een tik op de kop, met een klein pijltje naast het datumbereik. Tijdens de reis staat een blok waarvan de laatste dag voorbij is dicht, met een gedempte kop (`.idxsec.voorbij`), zodat de dagen die nog komen bovenaan staan. Klap je zo'n blok open, dan krijgt de kop zijn eigen kleur terug. Na de reis staan alle blokken open en is geen kop gedempt, zodat je de hele reis kunt terugkijken. Wat je zelf open- of dichttikt, blijft zo tot de app opnieuw start (`window._idxOpen` in `drawResults`). De regel Reisoverzicht staat los en klapt niet in. Bij zoeken spelen de blokken geen rol, want dan staan er alleen treffers.

## Dieren en waarnemingen

Het tabblad Dieren (het pootje onderin, alleen voor wie is ingelogd, gasten ook) begint met Kans vandaag, de dieren uit het blok Dieren spotten van de dag, met de kans erbij. Daaronder staan alle 68 dieren uit `dieren.js` als lijst per groep, met een zoekveld en een chip per groep die op die groep filtert. Het zijn de dieren die je op deze route in het wild kunt tegenkomen. Wat je alleen op je bord ziet of vrijwel nooit in het wild, staat er bewust niet in.

Elke groep heeft een eigen kleur, met een variant voor het lichte en een voor het donkere thema. Het pootje volgt de kleur van de groep waarin het staat, en een dier dat de groep al zag krijgt die tint als achtergrond, met een gele teller erachter; is het ook gegeten, dan kleurt het bestekje ernaast oranje. Wie het zag of at, maakt voor de kleur niet uit.

**Filters.** Met de chip Gespot houd je alleen de dieren over die de groep al heeft gezien, en met Gegeten alleen wat op het bord kwam. Beide chips verschijnen pas zodra er iets te filteren valt. Er staat er één tegelijk aan, en de twee tellingen blijven gescheiden. Zoeken en de chips werken samen, en er kan één groep tegelijk aanstaan. De aangezette groep schuift naar voren in de rij, vlak na Gespot en Gegeten: de rij scrolt zijwaarts, en een chip buiten beeld die de lijst leegfiltert, zie je anders niet. Blijft er niets over, dan noemt de melding de filters die aanstaan, met een knop Filters wissen. Gespot is geel, Gegeten oranje (dezelfde kleur als het bestekje), een aangezette groep heeft zijn eigen kleur.

**Namen.** Staat Gespot of Gegeten aan, dan verschijnt onder de chips een rij namen: Ik, dan de reizigers en daarna de gasten, elk op alfabet, van iedereen die iets heeft gespot of gegeten, met per naam het aantal soorten van dat filter. Een aangevinkte naam krijgt een rand in de kleur van het filter dat aanstaat. Elk getal in een chip houdt rekening met de andere filters, net als in Notities: 'Bram 0' naast een aangezette groep Vogels betekent dat Bram geen vogel at. Vink je er een of meer aan, dan is dat 'wij': alleen hun waarnemingen tellen nog mee, in de tellers per dier, de chips, Kans vandaag, de lijst onderaan en Tot nu toe, dat dan bijvoorbeeld zegt "Jij en Anna hebben samen 12 dieren gespot". De keuze blijft op de telefoon staan (`aus_dwie`) tot je hem weghaalt of uitlogt; zet je het filter uit, dan telt weer de hele groep, en zet je het weer aan, dan staan dezelfde namen nog aangevinkt. Noteren gebeurt altijd onder je eigen naam, wat er ook aanstaat.

**Noteren.** Eén tik op een dier is een waarneming, ook in Kans vandaag. De app noteert het dier, wie het zag, de dag en de plaatselijke tijd, en de hele groep ziet het. Een tik reageert meteen, ook bij slecht bereik: de waarneming gaat eerst in de wachtrij op de telefoon (in Gespot staat dan 'wordt zo verstuurd') en pas na de tijd voor Ongedaan maken (`STRAKS_MS`, 6,5 seconde) naar Nhost. Ongedaan maken haalt hem in die tijd gewoon uit de wachtrij, zonder netwerk. Zo hoeft een tik in de bush niet te wachten op een nieuwe sessie en het versturen. Zonder verbinding wacht de waarneming op bereik.

Een dier dat niet in het raster staat, gaat via de knop Iets anders gezien, met een naam erbij. Staat een dier uit de dagtekst niet in de lijst, dan krijgt het het pootje als icoon en noteert een tik het onder zijn eigen naam als ander dier. Alles wat zo is ingevoerd, komt onderaan samen in de groep Overig, met één regel per naam. Een tik daarop noteert hetzelfde dier nog een keer, dus wie na de eerste persoon dezelfde vogel ziet, hoeft de naam niet opnieuw te typen. Die groep staat er alleen als er iets in zit, en wordt gevuld uit de waarnemingen zelf, niet uit `dieren.js`.

Onder het raster staat de lijst Gespot: alle waarnemingen, nieuwste bovenaan, met een tussenkop per dag. Die lijst volgt dezelfde filters als het raster: de aangevinkte namen, Gespot of Gegeten (dan heet hij Gegeten) en de groep. Op de dagpagina staat bij elk dier uit het blok Dieren spotten hoe vaak de groep het al zag.

**Opslag.** Waarnemingen staan bij Nhost in een eigen tabel `waarnemingen`, los van de notities (zie `nhost/schema.sql`). Zonder verbinding gaan ze in dezelfde wachtrij als notities; elk item weet zelf naar welke tabel het moet. Het tijdstip komt uit de kolom `gezien_op` en niet uit `created_at`, want die laatste is het moment van versturen, dat in Kakadu uren later kan zijn. Nhost bewaart dat tijdstip zonder de tijdzone waarin het is genoteerd en geeft het terug in UTC. De app rekent het daarom om naar de tijdzone van de dag van de waarneming (`tz` in `reis.js` of `voorreis.js`; op een vliegdag de tijdzone van de telefoon), en vergelijkt tijdstippen als moment en niet als tekst. Anders staat een waarneming van 12.15 uur in Sydney als 02.15 uur in de lijst, en kan een middagwaarneming de prijs Nachtwacht opleveren. Ontbreken de tabel of de rechten, dan blijft de rest van de app werken; het tabblad Dieren meldt dan dat waarnemingen nog niet verstuurd kunnen worden en bewaart ze op de telefoon.

**`dieren.js`.** Elke groep heeft een sleutel, een naam en twee kleuren als `#rrggbb`, eerst die voor het lichte thema en dan die voor het donkere. Dat is een eigen palet en niet dat van de regio's, om dezelfde reden als bij Alle dagen. Elk dier heeft een sleutel `k` (die komt in de tabel), een naam `n` en een groep `g`, en eventueel `eet:true`. Het icoon staat onder dezelfde sleutel in `dieren-iconen.js`, een svg als tekst met `fill="currentColor"`, zodat het de tekstkleur van het thema volgt. Met `syn` koppel je de namen uit de `wild`-blokken van de dagen aan een dier, zodat de teller op de dagpagina klopt. `check.js` meldt hoeveel dieren uit de dagen geen eigen knop hebben. Het tabblad heeft een eigen banner, `banner-dieren.jpg`, die net als de andere banners in de map en in `BEELD` moet staan.

### Gespot en gegeten

Sommige dieren kun je in Australië ook op je bord krijgen, en dat is even leuk om bij te houden. Die dieren hebben in `dieren.js` de vlag `eet:true` (negen: kangoeroe, wallaby, emoe, zoutwaterkrokodil, barramundi, krab, koraalbaars, octopus en trevally) en krijgen in de lijst een bestekknopje naast de teller. Haai staat er bewust niet bij: eten mag, maar wat als *flake* wordt verkocht, is lang niet altijd een soort waarvan de stand dat toelaat. Beschermde dieren als de koala, de wombat, de zeeschildpad en de dugong krijgen ook geen knopje. Een tik op de regel noteert 'gezien', een tik op het bestek 'gegeten'. Zolang niemand het at, is het knopje leeg en gedempt; daarna kleurt het oranje met het aantal erin. Onder 'Tot nu toe' staat hoeveel er is gegeten en van hoeveel soorten de groep ze zowel in het wild zag als op het bord kreeg. Welke van de twee het is, staat in de kolom `hoe` van `waarnemingen` ('gezien' of 'gegeten').

### Prijzen

Bij de waarnemingen horen prijzen, zoals de badges van een stappenteller: een kaart in een eigen kleur met een ronde munt met een tekening erop, een korte tekst, de datum en een knop Delen. Ze gaan over je eigen waarnemingen (ook die in de wachtrij), niet over die van de groep en niet over de aangevinkte namen. En ze blijven verborgen tot je ze hebt: nergens staat een grijze medaille of "nog 2 soorten", zodat elke prijs een verrassing is. De eerste, G'day!, verdien je met je eerste tik; de kaart vertelt dan alleen hoeveel er nog te winnen zijn.

Verdien je met een tik een prijs, dan schuift de kaart omhoog zodra de waarneming is genoteerd; levert één tik er twee op, dan komen ze na elkaar. Daarna staat de medaille in Mijn kast op het scherm Stand (zie hieronder), de nieuwste voorop, en een tik erop opent de kaart opnieuw. Medailles tellen per reisdeel: wie de voorreis deed, heeft daar een eigen kast en begint op dag 1 net als de rest leeg. Delen geeft naam, aantal, tekst en datum als tekst aan het deelmenu van de telefoon. Haal je de waarneming weg die de prijs compleet maakte, dan verdwijnt de prijs weer uit de kast.

De zestien prijzen staan in `dieren.js` (`PRIJZEN`), met per prijs de sleutel, de naam, de kleur van de kaart, de tekening op de munt (een sleutel uit `dieren-iconen.js` of een uit `PRIJS_ICONEN` in hetzelfde bestand: het pootje, het bestek, turfstreepjes, een ster, een zeven en de omtrek van Australië), de regel en de tekst. Regels: `eerste` (je eerste waarneming), `set` (al deze dieren, gezien of gegeten), `keuze` (n uit een lijst), `groep` (n soorten uit één groep), `soorten` (n soorten), `keer` (één dier n keer), `reeks` (n dagen achter elkaar iets gespot, op de kalenderdag van de waarneming), `tijd` (iets gespot tussen twee tijdstippen, over middernacht mag) en `regios` (iets gespot in n van de zeven streken van de groepsreis, via dezelfde indeling als de startpagina; de voorreis telt daar niet in mee). De datum op de kaart is die van de waarneming die de prijs compleet maakte. `check.js` controleert dat elk genoemd dier, elke groep en elke tekening bestaat en dat de regel de juiste velden heeft. De rekenregels zelf staan in `app.js` (`beoordeelPrijs`).

De zestien: G'day! (je eerste waarneming), Nachtwacht (een avond- of nachtdier gespot tussen 19.00 en 05.30 uur), Streepjes zetten (15 soorten), Emoe! (een emoe), Tassie (duivel, wombat en wallaby), Kop boven water (twee van bultrug, dolfijn en zeehond), Herrie in de boom (drie van galah, kaketoe, regenbooglori en rosella), Zonnekloppers (vier reptielen), Loopclubje (emoe en kasuaris), Bushtucker (kangoeroe, emoe of krokodil gegeten), Gevaarlijk gezelschap (drie van tien beruchte dieren), Week zonder missers (zeven dagen op rij), Kriskras (zes van de zeven streken), Dertig op zak (30 soorten), Geluksvogel (boomkangoeroe of quoll) en De grote vijf (kangoeroe, koala, wombat, echidna en vogelbekdier). Wie de broncode leest, kan spieken, maar daar kijkt onderweg niemand.

### Reisdelen en het scherm Stand

Dieren rekent per **reisdeel**: de voorreis (dag onder 0), de groepsreis (dag 0 tot en met 29) en de nareis (dag boven 29). Het reisdeel volgt uit het dagnummer dat al bij elke waarneming staat. Het tabblad Dieren telt alleen het reisdeel van vandaag: de chip Gespot, de groepstellers, de gekleurde dierregels, de namenrij en de lijst Gespot. Zo begint iedereen op dag 1 bij nul en neemt wie de voorreis deed geen voorsprong mee. Wat er eerder is gespot, blijft bewaard en staat in Stand. Gasten tellen op Dieren gewoon mee: zij horen bij het gezelschap. De lijst Gespot toont de laatste tien waarnemingen binnen de filters die aanstaan, met een knop *Alles tonen* voor de rest; het tabblad opnieuw openen begint weer bij tien. De chip Gespot en de namenrij tellen soorten, de lijst toont waarnemingen. De app haalt wel altijd alle waarnemingen op, want de tellers, de stand en de medailles rekenen met de volledige lijst.

**Stand** is het tweede scherm van het tabblad Dieren, achter de beker rechtsboven in de kop; `‹ Dieren` in de kop brengt je terug, en wie het tabblad opnieuw opent, begint weer op het noteerscherm. Stand is puur kijken: noteren en weghalen blijven op Dieren. Van boven naar beneden:

- **Mijn kast**: mijn aantal dieren, soorten (met het totaal aantal soorten in de app ernaast) en medailles, daaronder mijn medailles. Doe ik aan meer dan één reisdeel mee (volgens de reizigerslijst, of omdat ik ergens toch iets noteerde), dan staan er bovenin chips om van reisdeel te wisselen; die keuze stuurt het hele scherm. Standaard staat het reisdeel van vandaag.
- **Stand**: een podium met de eerste drie, nummer 1 in het midden, met de naam en het aantal dieren erboven en het aantal soorten groot in het blok. Reisgenoten en gasten doen allebei mee. Sta ik er niet op, dan volgt mijn eigen trede eronder met mijn plek. Ben ik in dit reisdeel de enige met waarnemingen, dan is er geen blok Stand.
- **Mijn waarnemingen**: alleen de mijne in het gekozen reisdeel, nieuwste bovenaan, met een tussenkop per dag; na tien een knop *Alles tonen*.

De rekenregel van de stand: rangschikken op het aantal **soorten**, bij gelijke stand op het aantal dieren, en daarna op wie het eerst zo ver was. Alleen *gezien* telt, *gegeten* niet. *Iets anders gezien* telt per verschillende naam (hoofdletters genegeerd). Medailles tellen niet mee: die komen grotendeels uit dezelfde waarnemingen voort en zijn de beloning, niet de score.

## Verzekeringen

In het tabblad Praktisch staat onder Noodgevallen het blok **Verzekeringen**. Iedereen die is ingelogd zet daar met "Verzekering toevoegen" één notitie neer, per persoon of per huishouden, met de verzekeraar, het polisnummer en het nummer van de alarmcentrale. Telefoonnummers in de tekst zijn aanklikbaar. De notities krijgen het type Verzekering, zijn zichtbaar voor de hele groep en offline beschikbaar. Alleen de schrijver kan ze wijzigen of verwijderen, net als bij alle andere notities. Zonder login staat het blok er niet.

Ze staan ook in het tabblad Notities, helemaal onderaan onder een eigen kop, omdat je ze normaal gesproken niet nodig hoopt te hebben. Het label op de kaart brengt je naar het blok in Praktisch, en een zoektreffer ook. Het type Verzekering is ook te kiezen in het gewone notitieformulier. Vanuit Praktisch staat het vast, zodat een notitie niet per ongeluk uit dat blok verdwijnt.

De polisnummers staan bewust niet in `reis.js`: de repository is openbaar.

## De dagpagina

Het programma in `reis.js` komt uit twee bronnen: de reisbeschrijving van Sawadee en het programma van de reisbegeleider, met tijdschema's, de volgorde van de dag, wat je mee moet nemen en eettips. Bij een verschil gaat de reisbegeleider voor. De hand-outs staan als pdf in een notitie, achter de login, en niet in deze openbare repository. Onderweg kwamen er dagelijks updates bij, die in `reis.js` zijn verwerkt.

**Goed om te weten** staat direct onder het programma, vóór het verhaal van de dag, als één paneel. Bovenaan staan gekleurde regels, in deze volgorde: de klok, Let op (`note`), Was afgeven (`wash`) en Tip (`tip`); daaronder de gewone regels uit `prac`. Een regel in `prac` met het woord klok of zomertijd gaat naar boven, met de sprong in het label (Klok vandaag een half uur vooruit, of Klok vannacht een uur vooruit voor de avond vóór de zomertijd). De sprong rekent `klokSprong` in `app.js` uit het verschil in `tz` met de dag ervoor, zodat hij altijd klopt met de klok op Praktisch. Verspringt de klok zonder eigen regel, dan maakt de app er zelf een. Het blok Morgen noemt de sprong ook. De vertrekdag en de dag naar huis hebben geen `tz` en dus geen klokregel. De plek voor de stip of het icoon (`.prac .b`) is altijd even breed als een icoon, zodat alle regels even ver inspringen. Links, e-mailadressen en telefoonnummers in Goed om te weten en bij de optionele excursies zijn aanklikbaar, net als in de notities.

**Eten vanavond** is ook één paneel (`.rpanel` met `.rrij`): eerst de eettips van de reisbegeleider, dan elk restaurant en de link Meer restaurants in de buurt, met een dun lijntje ertussen. Elke regel klapt apart open. De tips staan als lijst `tips` bij de dag, per adres `[naam, wat, waar, openingstijden]`, en verschijnen als "Tips van" met de naam uit `REISBEGELEIDER` in `reis.js`; uitgeklapt staat elk adres als link naar de kaart. Voor steden waar je meer nachten blijft, staat de lijst één keer bovenin `reis.js` (`TIPS_HOBART`, `TIPS_ADELAIDE`, `TIPS_MELBOURNE`, `TIPS_ALICE`, `TIPS_CAIRNS`, `TIPS_PERTH`) en hangt hij aan elke dag in die stad. Een korte opmerking over openingstijden staat in `rnote` en verschijnt als callout boven het paneel. `check.js` controleert de vorm van de tips en zoeken in Alle dagen vindt ze ook.

**Vluchten** van een dag staan ook in één paneel (`.flights`), met een lijntje tussen de vluchten van een overstapdag. Bij elke vlucht staat de link Online inchecken uit `CHECKIN` en, na inloggen, je boekingscode. Dat is de enige plek: Praktisch heeft geen eigen overzicht van vluchten en boekingen meer, want onderweg keek iedereen bij de dag zelf. Bij Noodgevallen in Praktisch is 000 de bovenste regel, rood getint (`li.sos`), met daaronder `NOOD` uit `reis.js`, Sawadee voorop.

**Dieren spotten** begint met de emoe-alert (`emoe` bij de dag), in de accentkleur. Heeft een dag een emoe-alert, dan laat de app een regel met precies de naam Emoe uit `wild` weg (`wildRijen` in `app.js`), op de dagpagina, bij zoeken en bij Kans vandaag. Regels als Rode reuzenkangoeroe en emoe blijven staan. Een dag met alleen een emoe-alert en geen `wild` krijgt ook het blok Dieren spotten.

**Notities** bij de dag (Vandaag nodig en Notities) staan, net als in het tabblad Notities en bij Verzekeringen, als regels in één paneel. Onder het kopje Notities bij de dag laat de app het label Notitie weg, want dat zegt het kopje al. Andere soorten houden hun label. Heeft een regel geen label en geen knoppen (een notitie van een ander), dan valt de lege kopregel weg.

De scheidingslijnen tussen regels hebben een eigen kleur, `--lijn` in `app.css`: in het lichte thema een zacht grijs, in het donkere iets lichter dan de rand. De rand van een glaspaneel (`--rim`) is in het lichte thema wit, en een witte lijn op een bijna wit paneel is nauwelijks te zien.

### Winkels bij het hotel

Niet elk hotel serveert ontbijt, en soms vertrekt de groep ervoor. Daarom staat op elke dag met een hotel, onder Eten vanavond, het blok Winkels: de dichtstbijzijnde supermarkt en, als die vroeg open is, een bakker, als dichtgeklapte regels in één paneel (`.rpanel.wpanel`), met looptijd, openingstijden, Route en Op de kaart. De lijst staat in `reis.js` als `WINKELS`, per hotel (dezelfde naam als in `h:` en `HOTELGEO`), zodat drie nachten Sydney één lijst delen. Per winkel: naam, soort (`supermarkt` of `bakker`), straat, looptijd in hele minuten, openingstijden en een opmerking. De looptijd is geschat zoals bij de restaurants zonder `wv`; de route vertrekt op de coördinaten uit `HOTELGEO`. De opmerking zegt niets over ontbijt in het hotel, want dat is niet bekend; wel over openingstijden tegenover een vaste vertrektijd, zoals de vlucht van 07.25 uur uit Sydney. `check.js` controleert dat elk hotel bestaat en de velden compleet zijn, en waarschuwt bij een hotel zonder winkels of coördinaten. Bij de motels van dag 13 en 14 ontbreken winkels, en bij dag 14 ook de coördinaten; de hotellink zoekt daar op naam en adres.

### Verhaal van de dag

Elke dag van de groepsreis heeft een verhaal over de geschiedenis van de plek waar je die dag bent, in `verhalen.js`. Achter elkaar gelezen vormen ze één lijn, van tienduizenden jaren Aboriginal-geschiedenis tot de excuses van 2008 en het referendum van 2023, met een Nederlandse draad erdoorheen: Tasman, de Duyfken, De Vlamingh, de Batavia en de emigranten van na de oorlog. Per verhaal staan er een titel (`t`), de alinea's (`tekst`, samen zo'n 200 tot 300 woorden) en een bron (`bron`). De sleutel is het dagnummer; een voorreis- of nareisdag kan met zijn datum als sleutel, zoals `"2026-09-20"`.

Op de dagpagina staat het verhaal als dichtgeklapte kaart onder Goed om te weten, met de titel en de leestijd. Een tik klapt hem open. De bron staat alleen in `verhalen.js` en niet op het scherm. Zoeken in Alle dagen vindt ook de verhalen.

De feiten zijn bij het schrijven gecontroleerd tegen bronnen als de Australian Dictionary of Biography, het National Museum of Australia, museumsites en UNESCO. Overleden Aboriginal-mensen worden alleen bij naam genoemd waar dat in Australië zelf gebruikelijk is. `check.js` controleert of elke dag een verhaal heeft, of titel, tekst en bron er zijn, en waarschuwt bij een verhaal dat veel korter of langer is dan de bedoeling. `verhalen.js` staat in `CODE` van `sw.js`, dus de verhalen zijn ook offline te lezen.

## Het tabblad Notities

Het tabblad Notities is niet per soort (Ticket, Notitie, enzovoort) ingedeeld: welk soort je destijds koos, weet je bij het zoeken meestal niet meer. Het soort staat als label naast de dag op de kaart. Het daglabel is kort ('Dag 17 · Za 17 okt'), zodat dag en soort ook op een smal scherm op één regel passen. Zoeken op de volle datum, zoals 'zaterdag', werkt nog. Elke kaart toont één moment, het meest recente: bij een gewijzigde notitie de wijziging, met 'bewerkt' ervoor ('Anna · bewerkt do 29 okt 14.02'), anders het aanmaken. Een verschil van minder dan een minuut met het aanmaken telt niet als wijziging.

De blokken, van boven naar beneden:

- **Laatste wijzigingen**: de vijf notities die het laatst zijn gemaakt of gewijzigd (`RECENT_N`), ongeacht dag of soort. Een notitie die nog op verbinding wacht, staat bovenaan. Het blok verschijnt alleen bij meer dan vijf notities, en niet tijdens zoeken of met Vandaag aan. Het heette eerst Recent, maar dat werd gelezen als 'wat nu speelt'.
- **Algemeen**: de notities die niet aan een dag hangen, nieuwste eerst. Die staan nergens anders in de app, dus ze krijgen een vast blok.
- **Bij een dag**: de rest, op datum, de voorreis en nareis inbegrepen. De dagnummers lopen met de tijd mee (voorreis negatief, groepsreis 1 tot 29, nareis vanaf 30), dus 18 september staat vóór 1 oktober. Omdat je deze notities ook op de dagpagina vindt, staat dit blok dicht zodra er een blok Laatste wijzigingen is. Bij weinig notities staat het open.
- Tijdens de reis, ook tijdens een voorreis of nareis, splitst dat blok in **Vanaf vandaag** (open) en **Eerder** (dicht). Wat voorbij is, de voorreis inbegrepen, staat dan niet meer bovenaan. Zo werkt Alle dagen ook. Tijdens het zoeken of met de chip Vandaag aan is het weer één blok.
- **Verzekeringen** onderaan.

Elk blok klapt in en uit met een tik op de kop, met het aantal notities ernaast. Wat je open- of dichttikt, blijft zo tot de app opnieuw start (`window._notOpen`). Tijdens het zoeken staat alles open en zijn de koppen gewone koppen, zodat een treffer niet achter een dichte kop verdwijnt.

Notities van de voorreis of nareis zie je in Notities en bij zoeken in Alle dagen alleen als je dat deel zelf doet (`zieNotitie`). De teller in de banner volgt dezelfde regel. De voorreisdagen zelf blijven, zoals bij Gasten beschreven, voor iedereen te bekijken, met hun notities erop.

Onder de chips voor dag en soort staat een rij met namen, in dezelfde opmaak als bij Dieren (gedempt als hij uitstaat, een gele rand als hij aanstaat), zodat de namen niet op de soorten lijken: Ik voorop, dan de anderen op alfabet, met per naam het aantal notities binnen de andere filters. Je kunt meer namen tegelijk aanvinken. Met namen aangevinkt staan Bij een dag en Eerder open. De keuze geldt voor de sessie, net als de andere filters in dit tabblad. Chips voor Voorreis en Nareis zijn er niet: die notities staan op datum in Bij een dag of Eerder, de chip Vandaag dekt de dag zelf, en zoeken op 'voorreis' vindt ze ook, want dat woord staat in hun daglabel.

Wie een notitie toevoegt vanuit dit tabblad, ziet hem daarna even oplichten bovenaan Laatste wijzigingen (`flitsNieuwe`). Een filter op soort toont één platte lijst, op dag en binnen een dag op aanmaakmoment. De app sorteert die zelf, en in `Q_ALL` staat `order_by` als lijst (`[{dag:asc},{created_at:asc}]`): als één object garandeert Hasura de volgorde van de velden niet.

## Notities zonder verbinding

Een notitie die je zonder verbinding schrijft, blijft op de telefoon staan en wordt verstuurd zodra er weer verbinding is. Dat geldt ook als de server even niet antwoordt. Weigert Nhost de notitie om een andere reden (rechten, ongeldige invoer), dan blijft hij ook staan, maar met de reden erbij, zodat je hem kunt aanpassen of weggooien. De statusregel in Notities telt beide soorten apart.

### De sessie

Bij het openen herstelt de app de sessie eerst uit de kopie op de telefoon, zodat de notities er direct staan, en vernieuwt hij pas daarna bij Nhost. Alleen een afwijzing van de server (401) logt uit. Geen verbinding doet dat nooit.

Bij elke vernieuwing geeft Nhost een nieuwe refresh token uit en vervalt de oude. Wordt zo'n vernieuwing onderbroken, bijvoorbeeld door direct na het openen op Vernieuwen in de updatebalk te tikken, dan gaat de nieuwe token verloren en geeft de oude een 401. Tijdens de reis moest je daardoor af en toe opnieuw inloggen, ook met goed bereik. Daarom:

- bewaart de app ook de toegangssleutel en tot wanneer die geldt (`aus_sess`). Wie de app binnen een kwartier opnieuw opent, hoeft niets in te wisselen (`sessieKlaar`), en dan kan er ook niets misgaan;
- gebruikt hij bij het vernieuwen altijd de token van de telefoon en niet die in het geheugen, zodat een tweede venster van de app geen verouderde token inwisselt;
- kijkt hij na een 401 eerst of er intussen een andere token op de telefoon staat, van een ander venster. Die neemt hij over in plaats van uit te loggen;
- wacht de knop Vernieuwen tot een lopende vernieuwing klaar is, hoogstens vijf seconden (`vernieuwingKlaar`).

Helemaal uitsluiten kan het niet: valt de verbinding weg precies nadat Nhost de nieuwe token heeft uitgegeven en voordat het antwoord binnen is, dan is die token weg.

Uitloggen wist alle gegevens van de app op de telefoon (`wisPriveGegevens`), de wachtrij en de bijlagen inbegrepen; alleen het thema en de wisselkoers blijven. Een volgende gebruiker op dezelfde telefoon begint dus schoon.

### Notities meteen uit de kopie

Het tabblad Notities tekent eerst de kopie van de telefoon, met de wachtende notities erbij, en haalt daarna pas Nhost erbij. Bij slecht bereik kan dat antwoord lang uitblijven; lezen en zoeken werken ondertussen gewoon. Zodra de synchronisatie klaar is, worden alleen de lijst, de tellers en de statusregel bijgewerkt: het zoekveld, de chips en de scrollpositie blijven zoals je ze had. Mislukt het ophalen, dan blijft de kopie staan met de status 'Kon niet bijwerken, laatst opgeslagen versie'; 'Bijgewerkt' staat er alleen na een geslaagd antwoord. Het tellen van de bijlagen op de telefoon houdt de lijst niet op, en de waarnemingen worden bij het synchroniseren vóór de bijlagen opgehaald, zodat een trage pdf-download het scherm Dieren niet ophoudt.

### Wachtrij

Alles wat zonder verbinding is vastgelegd, notities én waarnemingen, staat in één wachtrij op de telefoon (`aus_pending`). Elk item daarin heeft een vaste, lokale `uid`. Die is de sleutel voor bewerken, weggooien, foutmeldingen en het opruimen na versturen; hij gaat niet naar Hasura.

Er loopt maar één verzendronde tegelijk; een tweede aanroep (inloggen en tegelijk weer online) sluit aan op de lopende. Vlak vóór het versturen leest de app elk item opnieuw: een intussen weggegooid item wordt overgeslagen, een intussen bewerkt item gaat met de nieuwe tekst. Zolang een item echt onderweg is, kun je het niet bewerken of weggooien, ook niet vanuit een bewerkvenster dat al openstond; de app zegt dan dat het wordt verstuurd en je tekst blijft staan. Na een bevestiging haalt de app alleen dat ene item uit de actuele rij, zodat wat er ondertussen bij kwam, blijft. Wat tijdens een ronde bij komt, gaat in een vervolgronde mee (hoogstens drie per keer) of wacht op de volgende gelegenheid.

Schrijven naar de wachtrij wordt gecontroleerd. 'Bewaard op de telefoon' verschijnt alleen als dat is gelukt; anders blijft de notitie in het formulier staan met de reden, en een waarneming die niet bewaard kon worden, wordt als 'niet genoteerd' gemeld, zonder prijs en zonder Ongedaan maken. Wordt een item wel verstuurd maar kan het niet uit de rij worden gehaald, dan zegt de melding dat de wachtrij niet is bijgewerkt en wordt het in deze sessie niet nog eens verstuurd. Zo'n item is ook op slot: een bewerking zou bij het opruimen verdwijnen terwijl Nhost de oude tekst houdt, en weghalen zou de notitie niet weghalen. De kaart zegt dan 'verstuurd, wachtrij nog niet bijgewerkt'; zodra het opruimen lukt, staat het item in de gewone lijst en kun je het daar aanpassen of weghalen.

**Restrisico.** Valt de verbinding weg tussen het moment dat Nhost de rij opslaat en het moment dat het antwoord de telefoon bereikt, dan weet de app niet dat het gelukt is en probeert hij het later opnieuw. Datzelfde geldt na een herstart voor een item dat wel verstuurd maar niet opgeruimd kon worden. In beide gevallen kan een notitie of waarneming dubbel bij Nhost komen; de app garandeert geen eenmalige serververwerking. Een dubbele rij haal je in de app weg met het kruisje.

### Updates onderweg

Een update komt in twee stappen binnen. Eerst haalt de service worker alle codebestanden (`CODE`) volledig binnen, zonder iets in de cache te zetten. Alleen als ze er allemaal zijn en er echt iets anders is, gaat de hele set in één keer de cache in en volgt de melding. Mislukt er één, dan blijft alles zoals het was en probeert hij het bij de volgende keer openen opnieuw. Zo komt er bij slecht bereik nooit een nieuwe `app.js` naast een oude `reis.js` te staan, waardoor een tabblad of dagpagina niet zou tekenen. Een losse pagina naast de app die niet in `CODE` staat, zoals `prijzen.html`, wordt meteen bijgewerkt en geeft geen melding. Daarnaast zet de worker nooit een `app.js` met een lager nummer achter `APP_VERSIE` terug. Dat beschermt tegen de tussencache van GitHub Pages, die vlak na een push nog een oude kopie kan leveren.

Wat nog kan: in die eerste minuten na een push levert de tussencache een oud inhoudsbestand, zoals `reis.js`, dat wel compleet binnenkomt. De volgende controle trekt dat recht. Houd uitgaven onderweg daarom klein, en zorg dat nieuwe code ook werkt met de vorige versie van de inhoudsbestanden.

### Controle vóór vertrek, per telefoon

1. Via wifi de app openen en onderin Praktisch controleren dat de versie klopt. Inloggen en in Notities wachten tot de status 'Bijgewerkt' zegt en het aantal bijlagen offline gelijk is aan het aantal bijlagen. Staat dat niet gelijk, dan Bijlagen opnieuw ophalen.
2. Controleren dat alle benodigde pdf's onder 10 MB blijven: bijlagen boven die grens (`IDB_MAX` in `app.js`) worden niet duurzaam op de telefoon bewaard en tellen niet mee als offline beschikbaar. Zo'n bestand verkleinen of opsplitsen vóór vertrek.
3. De app volledig afsluiten, vliegtuigmodus aan, de app opnieuw openen.
4. Alle belangrijke tickets en reisprogramma's daadwerkelijk openen vanuit Notities of de dagpagina.
5. In Dieren één waarneming vastleggen, de app afsluiten en opnieuw openen; de waarneming moet er staan met 'wacht op verbinding'.
6. Vliegtuigmodus uit en wachten op de melding dat de waarneming is verstuurd. In de lijst Gespot hoort hij dan één keer te staan, zonder 'wacht op verbinding'.

## Bijlagen

Foto's en pdf's bij een notitie gaan naar Nhost Storage (bucket `default`). De notitie zelf onthoudt alleen het `file_id`, de naam, het type en de grootte. Storage controleert elke upload, download en verwijdering via de rechten op de tabel `storage.files` in Hasura (zie `nhost/README.md`). Uploaden en downloaden mag alleen wie in `reizigers` staat en geen gast is; verwijderen alleen wie het bestand uploadde. Die controle hoort hier net zo goed als bij de notities: aanmelden staat open, dus zonder controle kan een account van iemand die het adres kent bestanden uploaden. En gasten vallen erbuiten, want bijlagen zijn notities.

De bucket heeft een maximale bestandsgrootte van 20 MB; de grens in `app.js` (`MAX_UPLOAD`) is alleen een controle in de browser. Bijlagen tot 10 MB (`IDB_MAX`) gaan bij het synchroniseren automatisch mee naar de telefoon; een grotere pdf is alleen met verbinding te openen en telt in Notities niet mee als offline beschikbaar.

De app haalt bijlagen op met de token in de header en niet via een deelbare link, en verwijdert ze altijd via Storage (`DELETE /files/{id}`), zodat het bestand zelf ook weggaat en niet alleen de rij. Bijlagen gaan niet in de wachtrij: zonder verbinding staat de knop Foto of pdf in het formulier uit, en een tik erop zegt dat uploaden verbinding nodig heeft. Een notitie zonder bijlage kan wel offline.

## Een volgende reis

Deze app is gemaakt voor één reis. Voor een volgende reis is het advies geen nieuwe app te bouwen, maar ook geen app voor meerdere reizen tegelijk: één herbruikbare basis, met per reis een eigen kopie. Het waardevolste is niet het Australische programma, maar wat eronder zit: werken zonder verbinding, de wachtrij, bijlagen op de telefoon, veilig updaten, de sessie en de tests. Dat is in bijna driehonderd uitgaven gegroeid.

### Aanpak

1. **Australië bevriezen.** Deze repo, het adres en het Nhost-project blijven zoals ze zijn, als herinnering. De stand na de reis is vastgelegd als release `australie-2026` (uitgave 299).
2. **De basis loskoppelen van Australië.** Wat hieronder staat, gaat naar instellingen in `reis.js` (of een nieuw instellingenbestand), of wordt een onderdeel dat je per reis aan- of uitzet.
3. **Per reis een kopie.** Deze repo staat in GitHub als sjabloon. Maak per reis een nieuwe repo met Use this template, met een eigen GitHub Pages-adres, eigen inhoud en beelden, en een eigen Nhost-project. Een apart project is het eenvoudigst: notities van verschillende reizen lopen nooit door elkaar, en het gratis abonnement volstaat. De database bouw je op met `nhost/`.
4. **De tests meenemen.** `check.js` en `rooktest.js` horen in de basis met een kleine, verzonnen testreis te werken, zodat elke nieuwe reis meteen beschermd is.

Begin daar pas aan als de volgende reis bekend is. Het loskoppelen kost een paar sessies; het meeste werk blijft de inhoud (programma, restaurants, verhalen, dieren).

### Wat nog aan Australië vastzit

Staat al netjes in `reis.js` en hoeft alleen opnieuw gevuld te worden: `START`, `VOORREIS` en `NAREIS`, de dagen (`DAYS`), regio's met naam en kleuren (`REGION`, `TONE`, `TONE_INK`), hotels (`HOTELGEO`), restaurants (`RDATA`), winkels, excursies, de kofferlijst, noodnummers met de reisorganisatie (`NOOD`), inchecklinks (`CHECKIN`) en de reisbegeleider.

Moet nog los van de code gemaakt worden:

- **Het aantal dagen.** De groepsreis is vast 29 dagen. In `app.js` staat het getal 29 tientallen keren, onder meer in de datumrekening (`todayInfo`, `isBuiten`, `reisKlaar`), het bladeren (`volgende`, `vorige`), de kop van een dag ('van 29') en de voortgangsbalk. In `check.js` (`dagRef`) en in de tests ook. Dat wordt één constante in `reis.js`, af te leiden uit de lengte van `DAYS`.
- **Het land in zoekopdrachten.** Links naar Google Maps voor hotels, restaurants, winkels en routes plakken ', Australia' achter de plaats (`app.js`, zes plekken). Dat wordt een instelling.
- **Namen en teksten.** 'Rondreis Australië' en 'dagen Australië' op het reisoverzicht, 'Reis voorbij · 29 dagen Australië' op de afsluitpagina, 'AustralieApp' in de voettekst, het welkomstbericht voor nieuwe reizigers (`welkomTekst`) en de deeltekst van een prijs. Verder de titel en de naam in `index.html`, `manifest.webmanifest` (ook 'Dag voor dag door Australië, 1 t/m 29 oktober 2026') en `prijzen.html`.
- **De wisselkoers.** Praktisch rekent vast van Australische dollar naar euro (`base=AUD` bij frankfurter.dev, en de labels AUD en EUR). De valuta wordt een instelling.
- **Tijdzones.** `check.js` keurt alleen Australische tijdzones goed (UTC+8 tot +11, in halve uren). Dat wordt een bereik per reis.
- **Dieren en prijzen.** `dieren.js` (68 dieren, de groepen en de prijzen) en `dieren-iconen.js` zijn helemaal Australisch, net als de prijsteksten in `prijzen.html`. De prijs Kriskras telt 'streken' via de regio's en werkt dus met elke reis met regio's. Het hele tabblad Dieren is per reis een keuze: opnieuw vullen of uitzetten.
- **De emoe-alert.** Een vast onderdeel van de dagpagina (`emoe` bij een dag, met eigen icoon en kleur). Dat wordt een algemene 'uitgelicht dier'-regel, of verdwijnt.
- **Het verhaal van de dag.** `verhalen.js` hoort bij Australië; `check.js` eist een verhaal voor elke dag. Per reis opnieuw schrijven, of de eis laten vallen.
- **De beelden.** De regiobanners (`reg-nsw.jpg` en de rest), de banners per tabblad, de app-iconen en de dierenicoontjes. De namen staan ook in `BEELD` in `sw.js`. Zie Nieuwe beelden hieronder.
- **De paklijst.** `paklijst.html` heeft een Australische startlijst (ETA-visum, stekker type I, het weer in oktober).
- **Nhost.** Het adres van het project staat in `app.js` (`NHOST_SUB`, `NHOST_REG`). Een nieuw project krijgt een nieuw adres.
- **Boekingscodes.** De herkenning van regels als 'SQ: ABC123' gaat uit van de sleutels in `CHECKIN` en werkt dus mee met andere maatschappijen. `check.js` zoekt daarnaast naar een nummer achter 'Sawadee'; bij een andere reisorganisatie pas je die naam aan.

### Nieuwe beelden

De beelden zijn met ChatGPT gemaakt, in één stijl: vlakke illustraties met grote kleurvlakken en schuine lichtbundels, het onderwerp in het midden of rechts daarvan, en links een rustig vlak. Er staat geen tekst, logo of herkenbaar persoon in. Maak de beelden van een nieuwe reis in één gesprek en beschrijf de stijl bij elk beeld opnieuw, dan blijven ze bij elkaar passen.

**Banners**, jpg in de verhouding 12:5:

- Minstens 1200 × 500 pixels, liefst rond 1800 × 750. ChatGPT levert liggend meestal 1536 × 1024; snijd dat bij tot 1536 × 640, met het onderwerp in beeld.
- Progressieve jpg, kwaliteit rond 75, zo'n 40 tot 110 KB per stuk. Ze gaan bij de eerste keer openen allemaal naar de telefoon.
- Per regio `reg-<sleutel>.jpg`, met de sleutel uit `TONE` (zoals `reg-nsw.jpg`), en verder `reg-reis.jpg` voor de startpagina, `reg-voorreis.jpg` en `reg-nareis.jpg` (via `BUITEN`). Per tabblad `banner-dagen.jpg`, `banner-notities.jpg`, `banner-praktisch.jpg` en `banner-dieren.jpg` (via `BANNERS` in `app.js`). Reizigers beheren gebruikt vast `reg-nsw.jpg`; pas dat bij een nieuwe reis aan in `BANNERS`.
- In de kop van een dag of tabblad staat linksonder de titel in wit, linksboven de datumknop en rechtsboven soms een knop. Houd de linkeronderhoek dus rustig en niet te licht.
- Op de startpagina is een regio een tegel van ongeveer 175 × 124 pixels. Daarin blijft alleen het middelste deel van de banner over, zo'n zestig procent van de breedte, met onderaan een donker verloop voor de naam. Het onderwerp moet ook in dat middendeel herkenbaar zijn.
- Bij elke banner hoort een toon in `TONE` (of in `BANNERS` en `BUITEN`): een diepe kleur uit het beeld zelf, die eronder ligt zolang de foto laadt. Het lichtere paar in `TONE_INK` is voor kleine tekst en mag afwijken.

**App-iconen**, png van 512 × 512 pixels, zonder transparantie:

- `icon-512.png`, het gewone icoon. Mag tot de rand gevuld zijn.
- `icon-maskable-512.png`, dezelfde tekening voor Android en het beginscherm van de iPhone (`apple-touch-icon`). Android snijdt er een cirkel of druppel uit, dus alles wat ertoe doet, staat binnen de middelste cirkel van 80 procent (zo'n 410 pixels doorsnede), en de achtergrondkleur loopt door tot in de hoeken.
- `icon-paklijst.png`, het icoon van de losse paklijst, met dezelfde eisen als het maskable icoon.

**Dierenicoontjes en prijzen**, svg: één kleur, zonder achtergrond, het dier van opzij en zo veel mogelijk met dezelfde lijndikte. ChatGPT maakt een png; die moet eerst naar svg worden omgezet. Daarna komt hij in `dieren-iconen.js` met `fill="currentColor"` en een viewBox die is bijgesneden tot de tekening met vier procent rand. Een icoon met een dunnere pen krijgt een `stroke-width` die hem even zwaar laat ogen als de rest. `check.js` controleert of die er nog staat. De tekeningen op de munten van de prijzen (`PRIJS_ICONEN` in `dieren.js`) volgen dezelfde regels.

Zet elk nieuw beeld ook in `BEELD` in `sw.js`. `check.js` meldt een beeld dat de app gebruikt maar dat daar ontbreekt.

### Opschonen in de basis

Twee refactors maken de basis makkelijker te onderhouden. Ze zijn niet nodig voor Australië, wel voor een volgende reis:

- **`app.js` splitsen.** Eén bestand van ruim 3000 regels, al ingedeeld met kopjes (buiten de groepsreis, bijlagen, wisselkoers, dieren, prijzen, stand, versie). Langs die lijnen wordt het een stuk of zes bestanden, zonder bouwstap. `CODE` in `sw.js`, `check.js` en `rooktest.js` gaan dan mee.
- **Eén toestandsobject.** De filters en open blokken staan nu in elf losse vensterwaarden (`window._notOpen`, `window._idxOpen` en verder), die `wisPriveGegevens` bij het uitloggen één voor één leegmaakt. Een nieuwe die daar ontbreekt, laat de filters van de vorige gebruiker staan. Eén object dat in zijn geheel wordt gewist, sluit dat uit.

Volgorde: eerst het aantal dagen en de andere instellingen hierboven, dan het splitsen, dan de toestand, met na elke stap de rooktest. Begin pas als de volgende reis bekend is, zodat je niets refactort wat je daarna weggooit. De opbouw met HTML in tekstsjablonen blijft: herschrijven naar een framework kost veel en voegt voor een app van deze omvang weinig toe.

### Nog open in de basis

Punten uit een eerdere codereview die niet zijn aangepakt, en die bij het loskoppelen aandacht verdienen:

- Overlappende synchronisatierondes worden niet samengevoegd.
- De foutafhandeling van IndexedDB is niet overal even zorgvuldig.
- Verwijderde bestanden worden niet betrouwbaar opgeruimd bij Nhost Storage.
- `doetMee` in `app.js` valt, als de reizigerslijst ontbreekt, terug op een oude regel: wie een voorreisnotitie schreef, is voorreiziger. Met de tabel `reizigers` op zijn plek kan die terugval weg.
