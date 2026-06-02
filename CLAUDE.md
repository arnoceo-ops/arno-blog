# Claude Code — project instructies

## Git
- Na elke commit direct pushen naar origin master: `git push origin master`
- Nooit alleen committen zonder te pushen — Vercel deployt alleen via GitHub

## Foto (cyborg.jpg in arnobot/page.tsx)
- NOOIT meer aanpassen tenzij de gebruiker er expliciet om vraagt
- Correct formaat: `<img src="/cyborg.jpg" style={{display:'block', width:'380px', maxWidth:'100%', height:'auto'}} />` in een `subscribe-text-col` div
- Geen background-image, geen position:absolute, geen objectFit — gewoon de img tag
