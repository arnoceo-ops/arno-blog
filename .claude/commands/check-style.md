Voer een volledige stijlaudit uit op alle TSX-bestanden in het project. Controleer elk bestand tegen de normen in CLAUDE.md.

## Wat te controleren

Lees eerst CLAUDE.md volledig. Scan daarna alle `.tsx` bestanden in `app/` op de volgende afwijkingen:

### Kleuren
- Body tekst moet `#9ca3af` zijn — niet `#888`, `#aaa`, `#666` of andere grijstinten
- Gedempte tekst (artikelnummers, voetnoten, meta) moet `#6b7280` zijn
- Placeholder kleur in inputs moet `#4b5563` zijn — `#4b5563` NOOIT gebruiken voor zichtbare tekst buiten placeholders
- Links moeten `#f59e0b` zijn of `#9ca3af` als subtiele tertiaire link — nooit custom grijstinten zoals `#6b7280` of `#4b5563` voor links
- Amber labels: `#f59e0b`
- H1/H2 koppen: `#f1f5f9` (wit) — nooit amber voor koppen
- Achtergrond pagina: `#111827`, cards/inputs: `#1f2937`
- Borders: `#374151`

### Typografie
- Body tekst: Space Mono, fontWeight 400, fontSize 15px, lineHeight 1.9
- Labels (amber): Space Mono, fontWeight 700, fontSize 13px, letterSpacing 4
- H1: Bebas Neue, fontSize 64, letterSpacing 3
- H2: Bebas Neue, fontSize 32, letterSpacing 2
- Knoppen: Bebas Neue 18px, letterSpacing 3

### Knoppen
- Primair: background `#f59e0b`, color `#111827`, borderRadius 999, padding '12px 36px'
- Secundair: border `1px solid #374151`, color `#9ca3af`, borderRadius 999
- Destructief: border + color `#cc2200`
- Nooit `#f0ede6` of `#EE7700` als knopkleur — verouderde waarden

### Layout
- Container: maxWidth 812, padding `clamp(80px,12vw,120px) clamp(16px,4vw,20px) 80px`
- Nooit maxWidth op body-tekst paragrafen (maxWidth alleen op de container)

### Em dashes
- Nooit `—` (em dash) in vraagteksten of UI-copy

### Stijlreferentie
- /bot-pagina's: vergelijk met `app/bot/account/page.tsx`
- Publieke pagina's: vergelijk met `app/privacy/page.tsx`

## Aanpak

1. Gebruik Glob om alle `app/**/*.tsx` bestanden te vinden
2. Lees elk bestand en zoek naar de bovenstaande afwijkingen
3. Rapporteer per bestand: welke regel afwijkt, wat de huidige waarde is, en wat het moet zijn
4. Sla kleine bestanden (types, layouts zonder stijl) over
5. Geef aan het einde een samenvatting: hoeveel bestanden gescand, hoeveel afwijkingen gevonden, gesorteerd op prioriteit

Wees grondig — check ook kleine elementen zoals links, voetnoten, arrow-kleuren en placeholder-tekst.
