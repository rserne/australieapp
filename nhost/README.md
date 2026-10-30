# Nhost-configuratie

`nhost.toml` is de projectconfiguratie van Nhost (project AustralieApp, Frankfurt), op 30 oktober 2026 overgenomen uit Settings, Configuration Editor in het dashboard. Het is hetzelfde bestand dat `nhost config pull` met de Nhost CLI ophaalt. Geheimen staan er alleen als verwijzing in (`{{ secrets.… }}`), de waarden zelf staan bij Nhost onder Settings, Secrets en horen nooit in deze openbare repository.

## Wat de app ervan verwacht

- **Aanmelden aan, e-mailbevestiging uit** (`auth.signUp.enabled = true`, `emailVerificationRequired = false`). Een beheerder maakt in de app accounts aan voor reisgenoten; met bevestiging aan zou het aanmeldpunt geen `user_id` teruggeven (zie Beheer vanuit de app in de hoofd-README).
- **Wachtwoorden van minstens 9 tekens** (`passwordMinLength = 9`). De wachtwoorden die de app maakt, zoals `wombat-galah-koala-4821`, zijn veel langer.
- **Toegangssleutel een kwartier, refresh token dertig dagen** (`expiresIn = 900` en `2_592_000`). De app vernieuwt de toegangssleutel een minuut voordat hij verloopt, en houdt een sessie op de telefoon hoogstens dertig dagen vast (`herstelUitKopie`). Wie de app langer dan dertig dagen niet opent, moet opnieuw inloggen.
- **Rol `user` als standaard.** Alle rechten in Hasura zijn voor die rol ingesteld.

## Wat hier nog niet in staat

- **De tabellen.** `dagitems` (de notities), `waarnemingen`, `reizigers` en de view `reizigers_actief`. Voor de laatste drie staat de SQL in de hoofd-README; voor `dagitems` nergens.
- **De rechten in Hasura** per tabel en rol. Die staan in de Hasura-metadata, niet in deze configuratie. De hoofd-README beschrijft ze in woorden.
- **De maximale bestandsgrootte** van de bucket `default` (20 MB). Die staat in de database zelf (`storage.buckets`), niet in deze configuratie.

## Om naar te kijken bij een volgend project

- `hasura.settings.devMode = true` geeft bij een fout de interne details van Hasura terug. Handig tijdens het bouwen, maar in gebruik liever `false`.
- `corsDomain = [ "*" ]` staat verzoeken vanaf elke website toe. Strikter is alleen het adres van de app, `https://rserne.github.io`.
