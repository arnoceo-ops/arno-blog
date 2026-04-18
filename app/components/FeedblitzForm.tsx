'use client'
import { useEffect } from 'react'

export default function FeedblitzForm() {
  useEffect(() => {
    const scripts: HTMLScriptElement[] = []
    const links: HTMLLinkElement[] = []

    const addScript = (src: string) => {
      const s = document.createElement('script')
      s.src = src
      s.async = true
      document.body.appendChild(s)
      scripts.push(s)
    }

    const addLink = (href: string) => {
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = href
      document.head.appendChild(l)
      links.push(l)
    }

    const addInlineScript = (text: string) => {
      const s = document.createElement('script')
      s.text = text
      document.body.appendChild(s)
      scripts.push(s)
    }

    addLink('https://assets.feedblitz.com/fbz_smartform_mini.css')
    addScript('https://assets.feedblitz.com/js/fbz_smartform.js')
    addScript('https://app.feedblitz.com/f/?p13n=194479')

    addInlineScript(`
      var F19888_sb_requiredFields = [];
      var F19888_sb_validateFields = [];
      F19888_sb_validateFields.push('F19888_sb_PT');
      F19888_sb_requiredFields.push('F19888_sb_Naam');
      F19888_sb_requiredFields.push('F19888_sb_email');
      F19888_sb_requiredFields.push('F19888_sb_feedid');
      F19888_sb_requiredFields.push('F19888_sb_publisherid');
      F19888_sb_requiredFields.push('F19888_sb_cids');
      var F19888_sb_fieldcol = '#000000';
      var fbz_F19888_sb_logged = false;
      function F19888_sb_wait_fn() {
        try {
          if (!fbz_F19888_sb_logged) {
            fbz_SmartForm('F19888_sb', feedblitz_full_form);
            try { s('F19888_sb'); } catch(e) {}
            fbz_FitForm('F19888_sb');
            var img = fbz_formMetrics(19888, 1);
            fbz$('F19888_sb_wait_img').innerHTML = img;
            clearInterval(F19888_sb_wait);
            fbz_F19888_sb_logged = true;
          }
        } catch(e) {}
      }
      var F19888_sb_wait = setInterval(F19888_sb_wait_fn, 100);
    `)

    return () => {
      scripts.forEach(s => s.parentNode?.removeChild(s))
      links.forEach(l => l.parentNode?.removeChild(l))
    }
  }, [])

  const formHtml = `
    <div id="F19888_sb_container" align="center" class="F19888_sb_fbz_page" style="padding:0.5em;clear:both;">
      <form method="POST" name="F19888" id="F19888_sb" style="display:block;margin:auto;max-width:380px;" action="https://app.feedblitz.com/f/f.fbz?Join">
        <div name="F19888__hh" style="display:none">
          <input type="email" name="email_" value="" aria-hidden="true">
          <input type="email" name="email_address" value="" aria-hidden="true">
          <input type="email" name="_email" value="" aria-hidden="true">
          <input type="hidden" name="subcf" value="1">
          <input type="hidden" name="formid" value="F19888">
        </div>
        <table cellpadding="0" cellspacing="0" border="0" class="F19888_sb_fbz_table" style="table-layout:fixed;max-width:100%;width:100%;">
          <tr><td class="F19888_sb_fbz_form" style="background:transparent!important;">
            <table border="0" cellpadding="6" cellspacing="0" align="center" width="100%" class="F19888_sb_fbz_table">
              <tr class="F19888_sb_fbz_row">
                <td style="padding:4px 0;width:100%">
                  <input class="F19888_sb_fbz_input" type="text" name="Naam" id="F19888_sb_Naam" value="" placeholder="Naam" style="width:100%;background:rgba(255,255,255,0.06)!important;border:1px solid rgba(255,255,255,0.12)!important;color:#f0ede6!important;font-family:'Space Mono',monospace;font-size:13px;padding:14px 18px;border-radius:0;">
                </td>
              </tr>
              <tr class="F19888_sb_fbz_row">
                <td style="padding:4px 0;width:100%">
                  <input class="F19888_sb_fbz_input" type="text" name="email" id="F19888_sb_email" value="" placeholder="Email" style="width:100%;background:rgba(255,255,255,0.06)!important;border:1px solid rgba(255,255,255,0.12)!important;color:#f0ede6!important;font-family:'Space Mono',monospace;font-size:13px;padding:14px 18px;border-radius:0;">
                </td>
              </tr>
              <input type="hidden" name="feedid" id="F19888_sb_feedid" value="194479">
              <input type="hidden" name="publisherid" id="F19888_sb_publisherid" value="2886141">
              <input type="hidden" name="cids" id="F19888_sb_cids" value="1">
              <tr class="F19888_sb_fbz_row_nohover F19888_sb_fbz_smartform">
                <td style="padding:4px 0;">
                  <input class="F19888_sb_fbz_button" type="button"
                    onclick="try{fbzClearChangedBorders();}catch(e){};req=fbz_v('F19888_sb',F19888_sb_requiredFields);val=fbz_v('F19888_sb',F19888_sb_validateFields,1);if(req && val){smartFormSubmit(this);};"
                    name="fbzsubscribe" id="F19888_sb_subscribe" value="SUBSCRIBE"
                    style="width:100%;background:#EE7700!important;color:#0a0a0a!important;font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:3px;padding:14px 18px;border:none;cursor:pointer;border-radius:0;">
                  <img id="F19888_sb_fbz_wait" alt="Please wait..." style="display:none;width:48px;opacity:0.5;" src="https://assets.feedblitz.com/images/spinner.gif">
                </td>
              </tr>
              <tr class="F19888_sb_fbz_row_nohover">
                <td colspan="2" style="padding:0;border:0">
                  <div id="F19888_sb_fbz_err" class="F19888_sb_fbz_err" style="position:relative;display:none;">Vul alle verplichte velden in.</div>
                  <div id="F19888_sb_fbz_invalid" class="F19888_sb_fbz_invalid" style="position:relative;display:none;">Controleer de invoer.</div>
                  <div id="F19888_sb_fbz_status" class="F19888_sb_fbz_err"></div>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </form>
    </div>
    <div id="F19888_sb_wait_img" style="width:0;height:0;overflow:hidden;line-height:0;display:inline-block;position:fixed;"></div>
  `

  return (
    <div dangerouslySetInnerHTML={{ __html: formHtml }} />
  )
}
