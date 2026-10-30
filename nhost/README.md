# Nhost-configuratie

`nhost.toml` is de projectconfiguratie van Nhost (project AustralieApp, Frankfurt), op 30 oktober 2026 overgenomen uit Settings, Configuration Editor in het dashboard. Het is hetzelfde bestand dat `nhost config pull` met de Nhost CLI ophaalt. Geheimen staan er alleen als verwijzing in (`{{ secrets.… }}`), de waarden zelf staan bij Nhost onder Settings, Secrets en horen nooit in deze openbare repository.

## Wat de app ervan verwacht

- **Aanmelden aan, e-mailbevestiging uit** (`auth.signUp.enabled = true`, `emailVerificationRequired = false`). Een beheerder maakt in de app accounts aan voor reisgenoten; met bevestiging aan zou het aanmeldpunt geen `user_id` teruggeven (zie Beheer vanuit de app in de hoofd-README).
- **Wachtwoorden van minstens 9 tekens** (`passwordMinLength = 9`). De wachtwoorden die de app maakt, zoals `wombat-galah-koala-4821`, zijn veel langer.
- **Toegangssleutel een kwartier, refresh token dertig dagen** (`expiresIn = 900` en `2_592_000`). De app vernieuwt de toegangssleutel een minuut voordat hij verloopt, en houdt een sessie op de telefoon hoogstens dertig dagen vast (`herstelUitKopie`). Wie de app langer dan dertig dagen niet opent, moet opnieuw inloggen.
- **Rol `user` als standaard.** Alle rechten in Hasura zijn voor die rol ingesteld.

## De rechten in Hasura

`metadata.json` is de Hasura-metadata, op 30 oktober 2026 geëxporteerd via de Hasura-console (Settings, Metadata Actions, Export metadata). Daarin staan per tabel de rechten voor de rol `user`. Geheimen staan er niet in; de databaseverbinding is een verwijzing naar `HASURA_GRAPHQL_DATABASE_URL`. Terugzetten kan op dezelfde plek met Import metadata, nadat de tabellen bestaan.

Kort samengevat, voor de rol `user`:

| Tabel | Lezen | Toevoegen | Wijzigen | Verwijderen |
|---|---|---|---|---|
| `dagitems` (notities) | reiziger, geen gast | reiziger, geen gast; `user_id` vult Hasura in | eigen notitie, alleen `tekst`, `type`, `dag`; `updated_at` vult Hasura in | eigen notitie |
| `waarnemingen` | reiziger, ook gast | reiziger, ook gast; `user_id` vult Hasura in | eigen waarneming | eigen waarneming |
| `reizigers` | reiziger | beheerder | beheerder, kolommen `naam`, `voorreis`, `reis`, `nareis`, `beheer` | beheerder, niet zichzelf |
| `reizigers_actief` (view) | beheerder | | | |
| `storage.files` (bijlagen) | reiziger, geen gast | reiziger, geen gast; `uploaded_by_user_id` vult Hasura in | | eigen bestand |

'Reiziger' is de `_exists`-controle op een rij in `reizigers` met het eigen `user_id`, 'geen gast' komt daar `gast = false` bij.

**Fout gevonden bij het exporteren.** Bij Wijzigen op `reizigers` ontbreekt de kolom `gast`. De chip Gast in Reizigers beheren wijzigt precies die kolom, en Hasura weigert dat. Iemand gast maken of weer gewone reiziger kan zo alleen bij het aanmaken van het account. Herstellen kan in de Hasura-console bij `reizigers`, Permissions, rol `user`, update: vink `gast` aan bij de kolommen. Exporteer daarna de metadata opnieuw naar dit bestand.

## Wat hier nog niet in staat

- **De tabellen zelf.** `dagitems` (de notities), `waarnemingen`, `reizigers` en de view `reizigers_actief`. Voor de laatste drie staat de SQL in de hoofd-README; voor `dagitems` nergens. De metadata beschrijft wel de rechten, niet de kolommen en hun types.
- **De maximale bestandsgrootte** van de bucket `default` (20 MB). Die staat in de database zelf (`storage.buckets`), niet in deze configuratie.

## Om naar te kijken bij een volgend project

- `hasura.settings.devMode = true` geeft bij een fout de interne details van Hasura terug. Handig tijdens het bouwen, maar in gebruik liever `false`.
- `corsDomain = [ "*" ]` staat verzoeken vanaf elke website toe. Strikter is alleen het adres van de app, `https://rserne.github.io`.
