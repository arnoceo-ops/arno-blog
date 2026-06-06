# Backlog

## Team Dashboard
**Status:** Gepland — grote klus, later oppakken

Manager is ook gewone ArnoBot-gebruiker (Clerk). Manager maakt een team aan en nodigt leden uit via een link. Teamleden joinen bewust (consent).

**Dashboard bevat:**
- Alle teamleden: naam, # gesprekken, laatste activiteit, coaching-status
- Vergelijk patronen: wie meest/minst actief
- Team-spotlight: Claude analyseert collectieve blinde vlekken over heel team
- Doorklik naar volledig overzicht per teamlid

**Technisch plan:**
- 2 nieuwe Supabase-tabellen: `arnobot_teams` + `arnobot_team_members`
- Pagina's: `/bot/team` (dashboard), `/bot/team/join?code=xxx` (lid accepteert uitnodiging)
- API: team aanmaken, joinen, overzicht ophalen, team-analyse genereren

**Open vragen:**
- Mag een teamlid meerdere teams hebben, of max één?
