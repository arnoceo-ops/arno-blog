# Claude Code — project instructies

## Git
- Na elke commit direct pushen naar origin master: `git push origin master`
- Nooit alleen committen zonder te pushen — Vercel deployt alleen via GitHub

## UI-stijl — ALTIJD consistent toepassen

Bij elke nieuwe pagina of component: lees eerst een bestaande pagina (account of profiel) door en leg de stijl naast elkaar. Nooit afwijken zonder expliciete opdracht.

### Vaste normen
- **Body tekst**: Space Mono, fontWeight 400, fontSize 15px, lineHeight 1.9, kleur #888
- **Labels (oranje)**: Space Mono, fontWeight 400, fontSize 13px, letterSpacing 4, kleur #EE7700
- **H1**: Bebas Neue, fontSize 64, letterSpacing 3, kleur #f0ede6
- **Primaire knop**: Bebas Neue 18px, letterSpacing 3, padding '12px 36px', borderRadius 999, background #EE7700, **color #f0ede6**
- **Secundaire knop**: Bebas Neue 18px, letterSpacing 3, padding '12px 32px', borderRadius 999, border '1px solid #555', color #888
- **Input/textarea**: Space Mono 15px, fontWeight 400, padding 12px 16px, borderRadius 4, border 1.5px solid #333, focus → border #EE7700, placeholder kleur #444
- **Container**: maxWidth 720, padding '120px 48px 80px'
- **Style-tag**: altijd bovenaan met font-import, `* { box-sizing: border-box; margin: 0; padding: 0; }`, body met font-weight 400
- **Achtergrond**: #0a0a0a pagina, #111 voor cards/inputs

## Foto (cyborg.jpg in arnobot/page.tsx)
- NOOIT meer aanpassen tenzij de gebruiker er expliciet om vraagt
- Correct formaat: `<img src="/cyborg.jpg" style={{display:'block', width:'380px', maxWidth:'100%', height:'auto'}} />` in een `subscribe-text-col` div
- Geen background-image, geen position:absolute, geen objectFit — gewoon de img tag
