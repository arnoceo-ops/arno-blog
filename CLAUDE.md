# Claude Code — project instructies

## Git
- Na elke commit direct pushen naar origin master: `git push origin master`
- Nooit alleen committen zonder te pushen — Vercel deployt alleen via GitHub

## UI-stijl — ALTIJD consistent toepassen

Bij elke nieuwe pagina of component: lees eerst een bestaande pagina (account of profiel) door en leg de stijl naast elkaar. Nooit afwijken zonder expliciete opdracht.

### Vaste normen
- **Body tekst**: Space Mono, fontWeight 400, fontSize 15px, lineHeight 1.9, kleur #9ca3af
- **Labels (amber)**: Space Mono, fontWeight 400, fontSize 13px, letterSpacing 4, kleur #f59e0b
- **H1**: Bebas Neue, fontSize 64, letterSpacing 3, kleur #f1f5f9
- **Primaire knop**: Bebas Neue 18px, letterSpacing 3, padding '12px 36px', borderRadius 999, background #f59e0b, **color #111827**
- **Secundaire knop**: Bebas Neue 18px, letterSpacing 3, padding '12px 32px', borderRadius 999, border '1px solid #374151', color #9ca3af
- **Input/textarea**: Space Mono 15px, fontWeight 400, padding 12px 16px, borderRadius 4, border 1.5px solid #374151, focus → border #f59e0b, placeholder kleur #4b5563
- **Container**: maxWidth 720, padding '120px 48px 80px'
- **Style-tag**: altijd bovenaan met font-import, `* { box-sizing: border-box; margin: 0; padding: 0; }`, body met font-weight 400
- **Achtergrond**: #111827 pagina, #1f2937 voor cards/inputs

## Gespreksstijl (ArnoBot + Bieb) — REFERENTIE is SparClient.tsx, nooit zelf afwijken
- **JIJ-label**: Bebas Neue 18px, letterSpacing 3, kleur **#6b7280**, whiteSpace nowrap, paddingTop 2px, minWidth 48px
- **ARNO-label**: Bebas Neue 18px, letterSpacing 3, kleur **#f59e0b**, whiteSpace nowrap, paddingTop 2px, minWidth 48px
- **JIJ-tekst (vraag)**: Bebas Neue, fontSize clamp(18px,3vw,26px), lineHeight 1.5, kleur #f1f5f9, letterSpacing 0.5px
- **ARNO-tekst (antwoord)**: Space Mono, fontSize 15px, lineHeight 1.9, kleur #9ca3af, fontWeight 400
- **JIJ-rij achtergrond**: geen (transparant = paginakleur #111827)
- **ARNO-rij achtergrond**: #1f2937 (elevated card, AI-content)
- **Padding beide rijen**: gelijk — clamp(20px,3vw,32px) horizontaal en verticaal
- **Gap label↔tekst**: clamp(16px,3vw,40px)
- **Container breedte gesprek**: maxWidth 812px, margin 0 auto
- **Designregel**: AI-gegenereerde content = #1f2937 card. Gebruikersinput = transparant op #111827.

## Foto (cyborg.jpg in arnobot/page.tsx)
- NOOIT meer aanpassen tenzij de gebruiker er expliciet om vraagt
- Correct formaat: `<img src="/cyborg.jpg" style={{display:'block', width:'380px', maxWidth:'100%', height:'auto'}} />` in een `subscribe-text-col` div
- Geen background-image, geen position:absolute, geen objectFit — gewoon de img tag
