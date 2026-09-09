# AustralieApp

Reisapp voor de Sawadee-groepsrondreis Australië, 1 t/m 29 oktober 2026.
Online op https://rserne.github.io/australieapp/ (GitHub Pages). Notities en tickets staan bij Nhost (Frankfurt).

## Bestanden

| Bestand | Wat erin staat | Wanneer aanpassen |
|---|---|---|
| `reis.js` | Alle inhoud: dagen, hotels, restaurants, excursies, kofferlijst, noodnummers | Bij elke inhoudelijke wijziging |
| `voorreis.js` | Programma van de voorreis, in dezelfde vorm als de dagen in `reis.js`; leeg als de voorreis alleen uit notities bestaat | Bij een wijziging in het voorreisprogramma |
| `app.js` | De code | Alleen bij nieuwe functies of bugfixes |
| `app.css` | De opmaak | Zelden |
| `index.html` | Het skelet van de pagina | Zelden |
| `sw.js` | Service worker: offline-cache en updatemelding | `VERSION` ophogen; een nieuwe foto ook aan `BEELD` toevoegen |
| `check.js` | Controleert `reis.js`, `voorreis.js`, de beelden en de versienummers | Draaien vóór elke uitgave |
| `rooktest.js` | Start de app in een kale browser (jsdom) op een reeks datums en meldt elke JavaScript-fout | Draaien na een wijziging in `app.js` |

## Een nieuwe versie uitbrengen

1. Pas `reis.js` (of een ander bestand) aan.
2. `node check.js` — moet eindigen met "reis.js is in orde". Een waarschuwing dat de beelden niet in de map staan, mag je negeren als je alleen de codebestanden bij de hand hebt.
3. Na een wijziging in `app.js`: `node rooktest.js` — moet eindigen met "geen fouten". Hiervoor is jsdom nodig: eenmalig `npm install -g jsdom`.
4. Hoog `APP_VERSIE` in `app.js` op (bijv. `2026-09-08-45`) en `VERSION` in `sw.js` (bijv. `v45`). De laatste cijfers horen gelijk te lopen; `check.js` waarschuwt als dat niet zo is.
5. Commit en push. Binnen een paar minuten ziet iedereen bij het openen van de app de balk "Er is een nieuwe versie". De service worker haalt eerst alle codebestanden vers op en meldt het dan pas, zodat een tik op Vernieuwen geen mengsel van oud en nieuw oplevert.

## Boekingscodes

De boekingscodes van de vluchten staan bewust **niet** in deze bestanden: de repository is openbaar en met code plus achternaam kan iedereen een boeking wijzigen. De app leest ze uit een notitie achter de login.

Maak eenmalig in het tabblad Notities een notitie van het type **Ticket**, met per regel een maatschappij en de code:

```
Boekingscodes
SQ: ABC123
JQ: DEF456
QF: GHI789
TL: GHI789
Sawadee: 1234567
```

De sleutels (`SQ`, `JQ`, `QF`, `TL`) zijn de IATA-codes uit `CHECKIN` in `reis.js`; `Sawadee` komt uit `BOEKINGEN`. De codes verschijnen daarna bij de vluchten en in het tabblad Praktisch, ook offline.

## Voorreis en nareis

Wie eerder gaat of langer blijft, kan notities maken voor dagen buiten de groepsreis. In `reis.js` staat hoeveel dagen dat zijn: `VOORREIS=13` (18 t/m 30 september) en `NAREIS=0`. Die dagen verschijnen in de dagkiezer van Notities boven 'Algemeen'; intern hebben ze de nummers -1 t/m -13 (nareis: 30 en hoger). Wie er gaat, staat nergens in de code: wie een voorreis-notitie schrijft, is voor de app een voorreiziger.

Vóór 1 oktober toont het tabblad Vandaag een startpagina: het aftellen tot het vertrek en de reis in beeld, een raster met per regio de foto en de dagen. Wie is ingelogd, ziet in dat raster ook een kaart Voorreis (en Nareis, als die er is); tijdens de voorreis brengt die kaart je bij de notities van vandaag van wie onderweg is. Een voorreiziger telt op de startpagina af naar zijn eigen vertrek, en tijdens zijn voorreis toont Vandaag zijn dag zelf. Wie thuis nog wacht, blijft de startpagina zien. Inchecklinks, boekingscodes en bagage staan in het tabblad Praktisch.

Elke voorreisdag is een pagina met alleen notities, in dezelfde vorm als een reisdag. Bladeren loopt door: startpagina → voorreis → dag 1 t/m 29. Alleen de pijl vanaf de startpagina slaat de voorreis over voor wie er niet bij hoort; via de kaart Voorreis of terugbladeren vanaf dag 1 kom je er wel.

Boekingscodes in voorreis- of nareisnotities tellen niet mee voor de groepsvluchten. Testen op een andere datum: open de app met `?datum=2026-09-27` achter het adres.

### Programma van de voorreis

Standaard bestaat een voorreisdag alleen uit notities. Wie een programma heeft, zet dat in `voorreis.js`: een lijst `VOORDAGEN` met per dag hetzelfde object als een dag in `reis.js`, maar met `datum:"2026-09-20"` in plaats van `n:` (zo verschuift niets als `VOORREIS` verandert) en zonder `r:` (de voorreis heeft één vaste foto en kleur, `BUITEN` in `reis.js`). Alleen `t`, `p` en `body` zijn verplicht; `k` (vlucht, bus, auto, excursie, vrij), `tz`, `h`, `temp`, `fl`, `agenda`, `note`, `tip`, `prac`, `wild` en `emoe`, `food` en `rest` werken zoals in de groepsreis. Hotels komen uit `HOTELGEO`, restaurants uit `RDATA`. Een excursie of koffer-item voor zo'n dag zet je in `EXC` of `PACK` met de datum in plaats van het dagnummer.

Een dag met programma ziet er in de app uit als een gewone reisdag, met dezelfde blokken en de notities ertussen. Een datum die niet in `VOORDAGEN` staat, blijft een dag met alleen notities; een lege lijst is de voorreis zoals hij was. Zodra er programma is, toont het tabblad Alle dagen de voorreis per dag, vindt zoeken het programma en gebruikt de klok in Praktisch de plaats en tijdzone van de voorreisdag. Het programma is alleen zichtbaar voor wie is ingelogd, net als de voorreisdagen zelf. `check.js` controleert `voorreis.js` mee; het bestand moet er altijd zijn, ook als de lijst leeg is. Een nareis met programma kan later op dezelfde manier (`NADAGEN` in `nareis.js`); de code kent het al.

Wat er nu in staat: 18 t/m 25 september, van de vlucht vanaf Schiphol via Sydney, Cairns en Nhulunbuy naar Darwin. Nog openstaand:

- **26 t/m 30 september (Kakadu)** zijn nog notitiedagen; het programma is nog niet bekend.
- **Hotels ontbreken.** Daarom staat er nergens een `h:` en hebben de restaurants geen looptijd (`null` in plaats van het aantal minuten). Zodra de adressen er zijn: `h:` toevoegen, de coördinaten in `HOTELGEO` zetten en de looptijden invullen.
- **1 en 2 oktober vallen buiten de voorreis**, want dat zijn groepsdag 1 en 2. De vlucht van Darwin naar Sydney (QF 841, 13.05–17.55) hoort dus in een Ticket-notitie op dag 1, niet in `voorreis.js`.
- Wie een voorreis heeft, wordt pas voorreiziger zodra hij één voorreisnotitie heeft geschreven. Eén Ticket-notitie op de eerste dag is genoeg; daarna telt Vandaag af naar het eigen vertrek.

## Verzekeringen

In het tabblad Praktisch staat onder Noodgevallen het blok **Verzekeringen**. Iedereen die is ingelogd zet daar met "Verzekering toevoegen" één notitie neer, per persoon of per huishouden: verzekeraar, polisnummer en het nummer van de alarmcentrale. Telefoonnummers in de tekst zijn aanklikbaar. De notities krijgen het type Verzekering, zijn zichtbaar voor de hele groep en offline beschikbaar; alleen de schrijver kan ze wijzigen of verwijderen, net als bij alle andere notities. Zonder login staat het blok er niet.

Ze staan ook in het tabblad Notities, helemaal onderaan onder een eigen kop, omdat je ze normaal gesproken niet nodig hoopt te hebben. Het label op de kaart brengt je naar het blok in Praktisch, en een zoektreffer ook. Het type Verzekering is ook te kiezen in het gewone notitieformulier; vanuit Praktisch staat het vast, zodat een notitie niet per ongeluk uit dat blok verdwijnt.

De polisnummers staan bewust niet in `reis.js`: de repository is openbaar.

## Notities zonder verbinding

Een notitie die je zonder verbinding schrijft, blijft op de telefoon staan en wordt verstuurd zodra er weer verbinding is. Dat geldt ook als de server even niet antwoordt. Weigert Nhost de notitie om een andere reden (rechten, ongeldige invoer), dan blijft hij ook staan, maar met de reden erbij, zodat je hem kunt aanpassen of weggooien. De statusregel in Notities telt beide soorten apart.

Bij het openen herstelt de app de sessie eerst uit de kopie op de telefoon, zodat de notities er direct staan, en vernieuwt hij pas daarna bij Nhost. Alleen een afwijzing van de server (401) logt uit; geen verbinding doet dat nooit.

## Hotel dag 13 en 14

Sawadee heeft nog niet vastgelegd welk hotel het wordt. Zodra dat bekend is: `h:"…"` toevoegen op dag 13 en 14 in `reis.js`, de coördinaten in `HOTELGEO` zetten en de `note` op beide dagen aanpassen.
