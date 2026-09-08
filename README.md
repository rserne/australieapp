# AustralieApp

Reisapp voor de Sawadee-groepsrondreis Australië, 1 t/m 29 oktober 2026.
Online op https://rserne.github.io/australieapp/ (GitHub Pages). Notities en tickets staan bij Nhost (Frankfurt).

## Bestanden

| Bestand | Wat erin staat | Wanneer aanpassen |
|---|---|---|
| `reis.js` | Alle inhoud: dagen, hotels, restaurants, excursies, kofferlijst, noodnummers | Bij elke inhoudelijke wijziging |
| `app.js` | De code | Alleen bij nieuwe functies of bugfixes |
| `app.css` | De opmaak | Zelden |
| `index.html` | Het skelet van de pagina | Zelden |
| `sw.js` | Service worker: offline-cache en updatemelding | Alleen `VERSION` ophogen |
| `check.js` | Controleert `reis.js` op fouten | Draaien vóór elke uitgave |

## Een nieuwe versie uitbrengen

1. Pas `reis.js` (of een ander bestand) aan.
2. `node check.js` — moet eindigen met "reis.js is in orde".
3. Hoog `APP_VERSIE` in `app.js` op (bijv. `2026-09-08-45`) en `VERSION` in `sw.js` (bijv. `v45`). De laatste cijfers horen gelijk te lopen; `check.js` waarschuwt als dat niet zo is.
4. Commit en push. Binnen een paar minuten ziet iedereen bij het openen van de app de balk "Er is een nieuwe versie".

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

Vóór 1 oktober toont het tabblad Vandaag een startpagina: aftellen, de reis in beeld (foto per regio), inchecken, boekingscodes, bagage en kofferlijst. Wie is ingelogd en zelf niet eerder gaat, ziet daar het blok Voorreis met het aftellen tot het vertrek van de voorreiziger(s) en, tijdens de voorreis, hun notities van vandaag. Een voorreiziger ziet op de startpagina zijn eigen vertrekdatum en een blok over het vertrek van de groep; tijdens de voorreis toont Vandaag zijn dag zelf.

Elke voorreisdag is een pagina met alleen notities, in dezelfde vorm als een reisdag. Bladeren loopt door: startpagina → voorreis → dag 1 t/m 29. Alleen de pijl vanaf de startpagina slaat de voorreis over voor wie er niet bij hoort; via 'Bekijk de voorreis' of terugbladeren vanaf dag 1 kom je er wel.

Boekingscodes in voorreis- of nareisnotities tellen niet mee voor de groepsvluchten. Testen op een andere datum: open de app met `?datum=2026-09-27` achter het adres.

## Hotel dag 13 en 14

Sawadee heeft nog niet vastgelegd welk hotel het wordt. Zodra dat bekend is: `h:"…"` toevoegen op dag 13 en 14 in `reis.js`, de coördinaten in `HOTELGEO` zetten en de `note` op beide dagen aanpassen.
