# AustralieApp

Reisapp voor de Sawadee-groepsrondreis Australië, 1 t/m 29 oktober 2026.
Online op https://rserne.github.io/australieapp/ (GitHub Pages). Notities en tickets staan bij Nhost (Frankfurt).

## Bestanden

| Bestand | Wat erin staat | Wanneer aanpassen |
|---|---|---|
| `reis.js` | Alle inhoud, dus dagen, hotels, restaurants, excursies, kofferlijst, noodnummers | Bij elke inhoudelijke wijziging |
| `voorreis.js` | Programma van de voorreis, in dezelfde vorm als de dagen in `reis.js`. Leeg als de voorreis alleen uit notities bestaat | Bij een wijziging in het voorreisprogramma |
| `dieren.js` | De dieren voor de waarnemingen, met naam, groep en synoniemen | Bij een nieuw dier of een andere naam |
| `dieren-iconen.js` | De iconen bij die dieren, per sleutel één svg als tekst | Bij een nieuw of ander icoon |
| `app.js` | De code | Alleen bij nieuwe functies of bugfixes |
| `app.css` | De opmaak | Zelden |
| `index.html` | Het skelet van de pagina | Zelden |
| `sw.js` | Service worker met offline-cache en updatemelding | `VERSION` ophogen en een nieuwe foto ook aan `BEELD` toevoegen |
| `check.js` | Controleert `reis.js`, `voorreis.js`, de beelden en de versienummers | Draaien vóór elke uitgave |
| `rooktest.js` | Start de app in een kale browser (jsdom) op een reeks datums en meldt elke JavaScript-fout | Draaien na een wijziging in `app.js` |

## Een nieuwe versie uitbrengen

1. Pas `reis.js` (of een ander bestand) aan.
2. `node check.js`, dat moet eindigen met "reis.js is in orde". Een waarschuwing dat de beelden niet in de map staan, mag je negeren als je alleen de codebestanden bij de hand hebt.
3. Na een wijziging in `app.js` draai je `node rooktest.js`, dat moet eindigen met "geen fouten". Hiervoor is jsdom nodig, eenmalig te installeren met `npm install -g jsdom`.
4. Hoog `APP_VERSIE` in `app.js` op (bijv. `2026-09-08-45`) en `VERSION` in `sw.js` (bijv. `v45`). De laatste cijfers horen gelijk te lopen. `check.js` waarschuwt als dat niet zo is.
5. Commit en push. Binnen een paar minuten ziet iedereen bij het openen van de app de balk "Er is een nieuwe versie". De service worker haalt eerst alle codebestanden vers op en meldt het dan pas, zodat een tik op Vernieuwen geen mengsel van oud en nieuw oplevert.

## Boekingscodes

De boekingscodes van de vluchten staan bewust **niet** in deze bestanden, want de repository is openbaar en met code plus achternaam kan iedereen een boeking wijzigen. De app leest ze uit een notitie achter de login.

Maak eenmalig in het tabblad Notities een notitie van het type **Ticket**, met per regel een maatschappij en de code:

```
Boekingscodes
SQ: ABC123
JQ: DEF456
QF: GHI789
TL: GHI789
Sawadee: 1234567
```

De sleutels (`SQ`, `JQ`, `QF`, `TL`) zijn de IATA-codes uit `CHECKIN` in `reis.js`. `Sawadee` komt uit `BOEKINGEN`. De codes verschijnen daarna bij de vluchten en in het tabblad Praktisch, ook offline.

## Voorreis en nareis

Wie eerder gaat of langer blijft, kan notities maken voor dagen buiten de groepsreis. In `reis.js` staat hoeveel dagen dat zijn, namelijk `VOORREIS=13` (18 t/m 30 september) en `NAREIS=0`. Die dagen verschijnen in de dagkiezer van Notities boven 'Algemeen'. Intern hebben ze de nummers -1 t/m -13, en de nareis 30 en hoger. Wie er gaat, staat nergens in de code, maar in de tabel `reizigers` bij Nhost (zie hieronder). De kaarten Voorreis en Nareis op de startpagina noemen de namen uit die tabel, en verschijnen alleen als iemand het deel doet.

Vóór 1 oktober toont het tabblad Vandaag een startpagina met het aftellen tot het vertrek en de reis in beeld, een raster met per regio de foto en de dagen. Wie is ingelogd, ziet in dat raster ook een kaart Voorreis (en Nareis, als die er is). Tijdens de voorreis brengt die kaart je bij de notities van vandaag van wie onderweg is. Een voorreiziger telt op de startpagina af naar zijn eigen vertrek, en tijdens zijn voorreis toont Vandaag zijn dag zelf. Wie thuis nog wacht, blijft de startpagina zien. Inchecklinks, boekingscodes en bagage staan in het tabblad Praktisch.

Elke voorreisdag is een pagina met alleen notities, in dezelfde vorm als een reisdag. Bladeren loopt door van de startpagina naar de voorreis en dan naar dag 1 tot en met 29. Alleen de pijl vanaf de startpagina slaat de voorreis over voor wie er niet bij hoort. Via de kaart Voorreis of terugbladeren vanaf dag 1 kom je er wel.

Boekingscodes in voorreis- of nareisnotities tellen niet mee voor de groepsvluchten. Testen op een andere datum kan door de app te openen met `?datum=2026-09-27` achter het adres.

### Programma van de voorreis

Standaard bestaat een voorreisdag alleen uit notities. Wie een programma heeft, zet dat in `voorreis.js`, een lijst `VOORDAGEN` met per dag hetzelfde object als een dag in `reis.js`. Twee dingen wijken af. In plaats van `n:` gebruik je `datum:"2026-09-20"`, zodat er niets verschuift als `VOORREIS` verandert, en `r:` laat je weg, want de voorreis heeft één vaste foto en kleur (`BUITEN` in `reis.js`). Alleen `t`, `p` en `body` zijn verplicht. De rest werkt zoals in de groepsreis, dus `k` (vlucht, bus, auto, excursie, vrij), `tz`, `h`, `temp`, `fl`, `agenda`, `note`, `tip`, `prac`, `wild` en `emoe`, `food` en `rest`. Hotels komen uit `HOTELGEO`, restaurants uit `RDATA`. Een excursie of koffer-item voor zo'n dag zet je in `EXC` of `PACK` met de datum in plaats van het dagnummer.

Een dag met programma ziet er in de app uit als een gewone reisdag, met dezelfde blokken en de notities ertussen. Een datum die niet in `VOORDAGEN` staat, blijft een dag met alleen notities. Een lege lijst is de voorreis zoals hij was. Zodra er programma is, toont het tabblad Alle dagen de voorreis per dag, vindt zoeken het programma en gebruikt de klok in Praktisch de plaats en tijdzone van de voorreisdag. Het programma is alleen zichtbaar voor wie is ingelogd, net als de voorreisdagen zelf. `check.js` controleert `voorreis.js` mee. Het bestand moet er altijd zijn, ook als de lijst leeg is. Een nareis met programma kan later op dezelfde manier via `NADAGEN` in `nareis.js`, want de code kent het al.

Alle dertien dagen hebben een programma, van de vlucht vanaf Schiphol via Sydney, Cairns en Nhulunbuy naar Darwin, en daarna de vijfdaagse kampeertour door Kakadu, Nitmiluk en Litchfield. Nog openstaand:

- **Slaapplekken.** Voor de kampeertour staan de twee privékampen met coördinaten in `HOTELGEO`. De hotels in Sydney, Cairns, Nhulunbuy en Darwin zijn onbekend. Daarom hebben de restaurants geen looptijd, maar `null` in plaats van het aantal minuten. Zodra de adressen er zijn, kun je `h` toevoegen, de coördinaten in `HOTELGEO` zetten en de looptijden invullen.
- **1 en 2 oktober vallen buiten de voorreis**, want dat zijn groepsdag 1 en 2. De vlucht van Darwin naar Sydney (QF 841, 13.05 tot 17.55) hoort dus in een Ticket-notitie op dag 1 en niet in `voorreis.js`.
- Wie een voorreis heeft, staat met `voorreis = true` in de tabel `reizigers`. Daarna telt Vandaag af naar het eigen vertrek.

## Reizigers

De tabel `reizigers` bij Nhost bepaalt twee dingen: wie de notities en waarnemingen van de groep mag zien, en wie aan welk deel van de reis meedoet. Eén rij per account, met het `user_id` uit `auth.users`, de naam en drie ja/nee-kolommen. De reisdatums zelf staan niet in de tabel; die komen uit `reis.js`.

```sql
create table public.reizigers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  naam text not null,
  voorreis boolean not null default false,
  reis boolean not null default true,
  nareis boolean not null default false,
  beheer boolean not null default false,
  created_at timestamptz not null default now()
);
-- op een bestaande tabel: alter table public.reizigers add column beheer boolean not null default false;
```

Vullen vanuit de bestaande accounts (de naam komt uit `display_name`; het statement is herhaalbaar voor nieuwe accounts):

```sql
insert into public.reizigers (user_id, naam)
select id, coalesce(display_name, email)
from auth.users
where id not in (select user_id from public.reizigers);

update public.reizigers set voorreis = true
where user_id in (select id from auth.users where email in ('rob@voorbeeld.nl'));
```

Rechten in Hasura, voor de rol `user`: alleen select, alle kolommen, met als row-check dat de gebruiker zelf in de tabel staat:

```json
{ "_exists": { "_table": { "schema": "public", "name": "reizigers" },
               "_where": { "user_id": { "_eq": "X-Hasura-User-Id" } } } }
```

Dezelfde check staat als row-permission op select én insert van `dagitems` en `waarnemingen`. Update en delete blijven `user_id` gelijk aan `X-Hasura-User-Id`. Zo hoeft er in geen enkele permissie een gebruikers-id te staan: een nieuwe reiziger is één rij in de tabel.

### Beheer vanuit de app

Wie `beheer = true` heeft, ziet in Praktisch onder het inlogblok de knop **Reizigers beheren**. Die opent een eigen scherm met de reizigerslijst: per persoon de delen van de reis als chips (een tik zet een deel aan of uit) en een kruisje om iemand uit de lijst te halen. De knop Reiziger toevoegen opent een schuifpaneel met naam, e-mailadres, wachtwoord en de delen. Het wachtwoordveld staat op `new-password`, zodat iOS zelf een sterk wachtwoord voorstelt en in de sleutelhanger bewaart; de knop ernaast zet het wachtwoord op het klembord, zodat je het meteen kunt doorsturen. Lukt kopiëren niet, dan komt het als leesregel onder het veld te staan; in het veld zelf houdt Safari een door hemzelf ingevuld wachtwoord gemaskeerd, ook als de app het op tekst zet. Het e-mailveld staat op `username`, wat nodig is om dat voorstel op te roepen, maar waardoor iOS er ook het adres van de beheerder zelf bij aanbiedt; de tekst in het veld herinnert eraan dat het om de reiziger gaat. Het scherm gebruikt de foto van New South Wales (`reg-nsw.jpg`) als banner. De app maakt dan eerst het account aan via het gewone aanmeldpunt van Nhost Auth (`/signup/email-password`, met de naam als display name) en schrijft daarna de rij in `reizigers`. De beheerder blijft zelf ingelogd. Zo kan de lijst onderweg vanaf de telefoon worden bijgehouden; de Nhost-console is daar niet meer voor nodig. Jezelf verwijderen of je eigen beheer uitzetten kan niet in de app.

Onderaan het scherm staat wanneer de lijst voor het laatst is opgehaald, of waarom dat mislukte. Die melding staat dan ook in het inlogblok. Mislukt het ophalen, dan is de kolomlijst van de select-permissie de eerste verdachte: Hasura neemt een later toegevoegde kolom (zoals `beheer`) niet vanzelf op, ook niet als "alle kolommen" aanstond, en de app kan de kolom dan niet opvragen.

Daarvoor is nodig:

- Op `reizigers` voor de rol `user` ook **insert**, **update** en **delete**, alle kolommen behalve `created_at`, met als check dat de gebruiker zelf beheerder is:

```json
{ "_exists": { "_table": { "schema": "public", "name": "reizigers" },
               "_where": { "user_id": { "_eq": "X-Hasura-User-Id" }, "beheer": { "_eq": true } } } }
```

- In de Nhost-console onder Auth: aanmelden (sign-up) aan, en **e-mailbevestiging uit**. Met bevestiging aan geeft het aanmeldpunt geen `user_id` terug voordat de reiziger op een mail heeft geklikt, en kan de app de rij niet schrijven. Het account bestaat dan al wel; de app meldt dat en dan moet de rij alsnog via de console.
- Geen trigger die elk nieuw account automatisch in `reizigers` zet. Met aanmelden aan kan iedereen die het adres kent een account maken; zonder rij in `reizigers` ziet zo iemand niets. De rij die de beheerder schrijft, is het slot.

Een reiziger die zijn wachtwoord vergeet, gebruikt de gewone herstelmail van Nhost; dat zit niet in de app. Uit de lijst halen ontneemt iemand de toegang, het account bij Nhost blijft bestaan.

De app haalt de lijst bij elke synchronisatie op en bewaart een kopie op de telefoon (`aus_cache_reizigers`), zodat hij ook offline weet wie je bent. Het inlogblok in Praktisch noemt je deelname. Sta je wel in `auth.users` maar niet in `reizigers`, dan meldt het blok dat, want dan houdt Hasura ook de notities voor je dicht. Zolang de tabel bij Nhost nog niet bestaat, valt de app terug op de oude regel: wie een voorreisnotitie schreef, is voorreiziger.

## Dieren en waarnemingen

Het tabblad Dieren (het pootje onderin, alleen voor wie is ingelogd) begint met Kans vandaag, de dieren uit het blok Dieren spotten van de dag, met de kans erbij. Daaronder staan alle 61 dieren uit `dieren.js` als lijst per groep, met een zoekveld en een chip per groep die op die groep filtert. Elke groep heeft een eigen kleur, met een variant voor het lichte en een voor het donkere thema. Het pootje volgt de kleur van de groep waarin het staat, en een dier dat de groep al zag krijgt die tint als achtergrond. Met de chip Gespot houd je alleen de dieren over die de groep al heeft gezien, en met Gegeten (die er alleen staat als er iets gegeten is) alleen wat op het bord kwam. Er staat er één tegelijk aan, en de twee tellingen blijven gescheiden. Zoeken en de chips werken samen, en er kan één groep tegelijk aanstaan. Het zijn de dieren die je op deze route in het wild kunt tegenkomen. Wat je alleen op je bord ziet of vrijwel nooit in het wild, staat er bewust niet in. Eén tik op een dier is een waarneming, ook in Kans vandaag. Staat een dier uit de dagtekst niet in de lijst, dan krijgt het het pootje als icoon en noteert een tik het onder zijn eigen naam als ander dier. Alles wat zo is ingevoerd komt onderaan samen in de groep Overig, met het pootje als icoon en één regel per naam. Een tik daarop noteert hetzelfde dier nog een keer, dus wie na de eerste persoon dezelfde vogel ziet, hoeft de naam niet opnieuw te typen. Die groep staat er alleen als er iets in zit, en wordt gevuld uit de waarnemingen zelf, niet uit `dieren.js`. De app noteert het dier, wie het zag, de dag en de plaatselijke tijd, en de hele groep ziet het. Onder het raster staat wat er die dag is gezien, en op de dagpagina staat bij elk dier uit het blok Dieren spotten hoe vaak de groep het al zag. Wie mis tikt, gebruikt Ongedaan maken in de melding. Een dier dat niet in het raster staat, gaat via de knop Iets anders gezien, met een naam erbij.

### Gespot en gegeten

Sommige dieren kun je in Australië ook op je bord krijgen, en dat is even leuk om bij te houden. Die dieren hebben in `dieren.js` de vlag `eet:true` (nu tien: kangoeroe, wallaby, emoe, zoutwaterkrokodil, barramundi, krab, koraalbaars, haai, octopus en trevally) en krijgen in de lijst een bestekknopje naast de teller. Een tik op de regel noteert 'gezien', een tik op het bestek 'gegeten'. Zolang niemand het at, is het knopje leeg en gedempt; daarna kleurt het op met het aantal erin. Beschermde dieren als de koala, de wombat, de zeeschildpad en de dugong krijgen bewust geen knopje. Onder 'Tot nu toe' staat hoeveel er is gegeten en van hoeveel soorten de groep ze zowel in het wild zag als op het bord kreeg.

Welke van de twee het is, staat in de kolom `hoe` van `waarnemingen` ('gezien' of 'gegeten'). Rijen van vóór deze versie hebben die kolom niet en tellen als gezien. Voeg de kolom toe **voordat** je de nieuwe versie uitbrengt, anders kan de app geen waarnemingen meer ophalen of versturen:

```sql
alter table public.waarnemingen add column hoe text not null default 'gezien';
```

Zet daarna in Hasura bij `waarnemingen` voor de rol `user` de kolom `hoe` aan bij zowel select als insert. Een nieuwe kolom doet niet vanzelf mee, ook niet als "alle kolommen" aanstond.

Waarnemingen staan bij Nhost in een eigen tabel `waarnemingen`, los van de notities. Zonder verbinding gaan ze in dezelfde wachtrij als notities, elk item weet zelf naar welke tabel het moet. Het tijdstip komt uit de kolom `gezien_op` en niet uit `created_at`, want die laatste is het moment van versturen, dat in Kakadu uren later kan zijn.

De tabel maak je eenmalig aan in de Nhost-console (Database, SQL):

```sql
create table public.waarnemingen (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  wie text,
  dier text not null,
  dag integer not null,
  gezien_op timestamptz not null,
  opmerking text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index waarnemingen_dag_idx on public.waarnemingen (dag);
```

Zet daarna bij Hasura (Permissions) voor de rol `user` dezelfde rechten als op `dagitems`. Select op alle kolommen zonder filter. Insert op de kolommen `wie`, `dier`, `dag`, `gezien_op` en `opmerking`, met als column preset `user_id` gelijk aan `X-Hasura-User-Id`. Update en delete alleen waar `user_id` gelijk is aan `X-Hasura-User-Id`. Zolang de tabel of de rechten ontbreken, blijft de rest van de app werken. Het tabblad Dieren meldt dan dat waarnemingen nog niet verstuurd kunnen worden en bewaart ze op de telefoon.

In `dieren.js` heeft elke groep een sleutel, een naam en twee kleuren als `#rrggbb`, eerst die voor het lichte thema en dan die voor het donkere. Dat is een eigen palet en niet dat van de regio's, want die kleuren liggen onder een foto en worden flets zodra je ze klein gebruikt. Elk dier heeft een sleutel `k` (die komt in de tabel), een naam `n` en een groep `g`, en eventueel `eet:true`. Het icoon staat onder dezelfde sleutel in `dieren-iconen.js`, een svg als tekst met `fill="currentColor"`, zodat het de tekstkleur van het thema volgt. Met `syn` koppel je de namen uit de `wild`-blokken van de dagen aan een dier, zodat de teller op de dagpagina klopt. `check.js` meldt hoeveel dieren uit de dagen geen eigen knop hebben. Het tabblad heeft een eigen banner, `banner-dieren.jpg`, die net als de andere banners in de map en in `BEELD` moet staan.

## Verzekeringen

In het tabblad Praktisch staat onder Noodgevallen het blok **Verzekeringen**. Iedereen die is ingelogd zet daar met "Verzekering toevoegen" één notitie neer, per persoon of per huishouden, met de verzekeraar, het polisnummer en het nummer van de alarmcentrale. Telefoonnummers in de tekst zijn aanklikbaar. De notities krijgen het type Verzekering, zijn zichtbaar voor de hele groep en offline beschikbaar. Alleen de schrijver kan ze wijzigen of verwijderen, net als bij alle andere notities. Zonder login staat het blok er niet.

Ze staan ook in het tabblad Notities, helemaal onderaan onder een eigen kop, omdat je ze normaal gesproken niet nodig hoopt te hebben. Het label op de kaart brengt je naar het blok in Praktisch, en een zoektreffer ook. Het type Verzekering is ook te kiezen in het gewone notitieformulier. Vanuit Praktisch staat het vast, zodat een notitie niet per ongeluk uit dat blok verdwijnt.

De polisnummers staan bewust niet in `reis.js`: de repository is openbaar.

## Notities zonder verbinding

Een notitie die je zonder verbinding schrijft, blijft op de telefoon staan en wordt verstuurd zodra er weer verbinding is. Dat geldt ook als de server even niet antwoordt. Weigert Nhost de notitie om een andere reden (rechten, ongeldige invoer), dan blijft hij ook staan, maar met de reden erbij, zodat je hem kunt aanpassen of weggooien. De statusregel in Notities telt beide soorten apart.

Bij het openen herstelt de app de sessie eerst uit de kopie op de telefoon, zodat de notities er direct staan, en vernieuwt hij pas daarna bij Nhost. Alleen een afwijzing van de server (401) logt uit. Geen verbinding doet dat nooit.

## Hotel dag 13 en 14

Sawadee heeft nog niet vastgelegd welk hotel het wordt. Zodra dat bekend is, voeg je `h:"…"` toe op dag 13 en 14 in `reis.js`, de coördinaten in `HOTELGEO` zetten en de `note` op beide dagen aanpassen.
