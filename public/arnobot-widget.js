(function () {
  'use strict';

  var API_URL = 'https://royaldutchsales.com/api/chat';

  var DEFAULT_OPENERS = [
    'Hoe bouw ik een salesteam dat zichzelf verkoopt?',
    'Wat is het verschil tussen een goede en een geweldige verkoper?',
    'Hoe kom ik aan nieuwe klanten zonder cold calling?',
    'Wat doe ik als mijn pipeline opdroogt?',
    'Hoe zorg ik dat klanten bij me blijven?',
    'Wanneer stop ik met een klant die nooit koopt?',
  ];

  var CSS = [
    '@import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Barlow:wght@400;700&display=swap");',
    '#arnobot-widget*{box-sizing:border-box;margin:0;padding:0}',
    '#arnobot-widget{',
    '  font-family:"Space Mono",monospace;',
    '  background:#0a0a0a;color:#f0ede6;',
    '  max-width:760px;width:100%;',
    '  border:1px solid #1e1e1e;',
    '  display:flex;flex-direction:column;',
    '  min-height:480px;max-height:680px;',
    '}',
    '#arnobot-header{',
    '  background:#111;border-bottom:2px solid #EE7700;',
    '  padding:20px 28px;',
    '  display:flex;align-items:center;gap:16px;',
    '  flex-shrink:0;',
    '}',
    '#arnobot-avatar{',
    '  width:40px;height:40px;background:#EE7700;',
    '  display:flex;align-items:center;justify-content:center;',
    '  font-family:"Bebas Neue",sans-serif;font-size:14px;letter-spacing:1px;color:#0a0a0a;',
    '  flex-shrink:0;',
    '}',
    '#arnobot-header-text{}',
    '#arnobot-name{font-family:"Bebas Neue",sans-serif;font-size:20px;letter-spacing:3px;color:#f0ede6;line-height:1;}',
    '#arnobot-status{font-size:10px;letter-spacing:2px;color:#555;margin-top:2px;}',
    '#arnobot-messages{',
    '  flex:1;overflow-y:auto;padding:0;',
    '  display:flex;flex-direction:column;',
    '  scrollbar-width:thin;scrollbar-color:#1e1e1e #0a0a0a;',
    '}',
    '#arnobot-messages::-webkit-scrollbar{width:4px}',
    '#arnobot-messages::-webkit-scrollbar-track{background:#0a0a0a}',
    '#arnobot-messages::-webkit-scrollbar-thumb{background:#1e1e1e}',
    '.ab-msg{padding:24px 28px;border-bottom:1px solid #111;display:flex;gap:20px;align-items:flex-start;}',
    '.ab-msg-label{font-family:"Bebas Neue",sans-serif;font-size:11px;letter-spacing:3px;white-space:nowrap;padding-top:3px;min-width:56px;}',
    '.ab-msg-label.user{color:#333}',
    '.ab-msg-label.arno{color:#EE7700}',
    '.ab-msg-text.user{font-size:17px;line-height:1.4;color:#f0ede6;font-family:"Bebas Neue",sans-serif;letter-spacing:0.5px;}',
    '.ab-msg-text.arno{font-size:13px;line-height:1.9;color:#aaa;white-space:pre-wrap;max-width:560px;}',
    '.ab-loading{padding:24px 28px 24px 104px;display:flex;align-items:center;gap:12px;}',
    '.ab-dots{display:flex;gap:5px;}',
    '.ab-dot{width:7px;height:7px;background:#EE7700;border-radius:50%;animation:abpulse 1.2s ease-in-out infinite;}',
    '.ab-dot:nth-child(2){animation-delay:.2s}',
    '.ab-dot:nth-child(3){animation-delay:.4s}',
    '@keyframes abpulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}',
    '.ab-loading-text{font-size:10px;letter-spacing:2px;color:#333;text-transform:uppercase;}',
    '#arnobot-openers{padding:20px 28px 0;border-bottom:1px solid #111;}',
    '.ab-openers-label{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#2a2a2a;display:block;margin-bottom:12px;}',
    '.ab-openers-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:2px;margin-bottom:2px;}',
    '@media(max-width:480px){.ab-openers-grid{grid-template-columns:1fr}}',
    '.ab-opener{',
    '  background:#111;border:none;color:#666;',
    '  font-family:"Bebas Neue",sans-serif;font-size:13px;letter-spacing:1px;',
    '  padding:16px 18px;cursor:pointer;text-align:left;line-height:1.3;',
    '  transition:all .15s;',
    '}',
    '.ab-opener:hover{background:#EE7700;color:#0a0a0a;}',
    '#arnobot-input-area{',
    '  padding:16px 20px;background:#0a0a0a;border-top:1px solid #1a1a1a;',
    '  flex-shrink:0;',
    '}',
    '#arnobot-input-row{',
    '  display:flex;gap:0;border:1.5px solid #1e1e1e;transition:border-color .2s;',
    '}',
    '#arnobot-input-row.active{border-color:#EE7700;box-shadow:0 0 0 2px rgba(238,119,0,.15);}',
    '#arnobot-textarea{',
    '  flex:1;background:#111;border:none;color:#f0ede6;',
    '  font-family:"Space Mono",monospace;font-size:12px;',
    '  padding:12px 16px;outline:none;resize:none;',
    '  min-height:44px;max-height:44px;line-height:1.5;',
    '}',
    '#arnobot-textarea::placeholder{color:#333;font-size:11px;}',
    '#arnobot-textarea:focus{background:#161616;}',
    '#arnobot-send{',
    '  background:#EE7700;color:#0a0a0a;',
    '  font-family:"Bebas Neue",sans-serif;font-size:17px;letter-spacing:2px;',
    '  padding:0 24px;border:none;cursor:pointer;',
    '  transition:background .15s;white-space:nowrap;min-width:100px;',
    '}',
    '#arnobot-send:hover{background:#ff8800;}',
    '#arnobot-send:disabled{background:#111;color:#222;cursor:not-allowed;}',
    '#arnobot-hint{font-size:9px;letter-spacing:2px;color:#1e1e1e;text-transform:uppercase;margin-top:6px;text-align:center;}',
    '#arnobot-actions{padding:16px 28px;display:flex;gap:10px;border-top:1px solid #111;}',
    '.ab-action{',
    '  background:none;font-family:"Bebas Neue",sans-serif;font-size:13px;letter-spacing:2px;',
    '  padding:8px 16px;cursor:pointer;border:1px solid;transition:all .15s;',
    '}',
    '.ab-action.primary{color:#EE7700;border-color:#EE7700;}',
    '.ab-action.primary:hover{background:#EE7700;color:#0a0a0a;}',
    '.ab-action.secondary{color:#333;border-color:#1e1e1e;}',
    '.ab-action.secondary:hover{color:#666;border-color:#333;}',
  ].join('\n');

  function injectStyles() {
    if (document.getElementById('arnobot-styles')) return;
    var el = document.createElement('style');
    el.id = 'arnobot-styles';
    el.textContent = CSS;
    document.head.appendChild(el);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ArnoBot(container, opts) {
    opts = opts || {};
    this.container = container;
    this.history = [];
    this.loading = false;
    this.started = false;
    this.openers = opts.openers || DEFAULT_OPENERS;
    this._build();
  }

  ArnoBot.prototype._build = function () {
    var self = this;
    this.container.id = 'arnobot-widget';
    this.container.innerHTML = [
      '<div id="arnobot-header">',
      '  <div id="arnobot-avatar">AB</div>',
      '  <div id="arnobot-header-text">',
      '    <div id="arnobot-name">ARNOBOT</div>',
      '    <div id="arnobot-status">ONLINE &middot; 20 JAAR CHIEF SALES UPDATES</div>',
      '  </div>',
      '</div>',
      '<div id="arnobot-messages"></div>',
      '<div id="arnobot-openers">',
      '  <span class="ab-openers-label">Kies een vraag of typ zelf</span>',
      '  <div class="ab-openers-grid">' + this.openers.map(function (q) {
        return '<button class="ab-opener">' + escapeHtml(q) + '</button>';
      }).join('') + '</div>',
      '</div>',
      '<div id="arnobot-input-area">',
      '  <div id="arnobot-input-row">',
      '    <textarea id="arnobot-textarea" rows="1" placeholder="Stel je vraag aan Arno..."></textarea>',
      '    <button id="arnobot-send" disabled>SPAR &rarr;</button>',
      '  </div>',
      '  <p id="arnobot-hint">Enter = sturen &nbsp;&middot;&nbsp; Shift+Enter = nieuwe regel</p>',
      '</div>',
    ].join('');

    this.$messages = this.container.querySelector('#arnobot-messages');
    this.$openers  = this.container.querySelector('#arnobot-openers');
    this.$inputRow = this.container.querySelector('#arnobot-input-row');
    this.$textarea = this.container.querySelector('#arnobot-textarea');
    this.$send     = this.container.querySelector('#arnobot-send');

    // Opener clicks
    var openerBtns = this.container.querySelectorAll('.ab-opener');
    for (var i = 0; i < openerBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          self.ask(btn.textContent);
        });
      })(openerBtns[i]);
    }

    // Textarea input
    this.$textarea.addEventListener('input', function () {
      self.$send.disabled = !self.$textarea.value.trim() || self.loading;
    });

    // Enter to send
    this.$textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!self.$send.disabled) self.ask(self.$textarea.value);
      }
    });

    // Send button
    this.$send.addEventListener('click', function () {
      self.ask(self.$textarea.value);
    });
  };

  ArnoBot.prototype.ask = function (question) {
    question = question.trim();
    if (!question || this.loading) return;

    if (!this.started) {
      this.started = true;
      this.$openers.style.display = 'none';
    }

    this._addUserMsg(question);
    this.$textarea.value = '';
    this.$send.disabled = true;
    this._setLoading(true);

    var self = this;
    var historySnapshot = this.history.slice();

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question, history: historySnapshot }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        self._setLoading(false);
        var answer = data.answer || 'Er ging iets mis. Probeer opnieuw.';
        self._addArnoMsg(answer);
        self.history.push({ role: 'user', content: question });
        self.history.push({ role: 'assistant', content: answer });
        self._showActions();
      })
      .catch(function () {
        self._setLoading(false);
        self._addArnoMsg('Verbindingsfout. Probeer het opnieuw.');
      });
  };

  ArnoBot.prototype._addUserMsg = function (text) {
    var el = document.createElement('div');
    el.className = 'ab-msg';
    el.innerHTML = '<span class="ab-msg-label user">JIJ</span><span class="ab-msg-text user">' + escapeHtml(text) + '</span>';
    this.$messages.appendChild(el);
    this._scrollBottom();
  };

  ArnoBot.prototype._addArnoMsg = function (text) {
    var el = document.createElement('div');
    el.className = 'ab-msg';
    el.innerHTML = '<span class="ab-msg-label arno">ARNO</span><span class="ab-msg-text arno">' + escapeHtml(text) + '</span>';
    this.$messages.appendChild(el);
    this._scrollBottom();
  };

  ArnoBot.prototype._setLoading = function (on) {
    this.loading = on;
    this.$send.disabled = on || !this.$textarea.value.trim();

    var existing = this.container.querySelector('.ab-loading');
    if (existing) existing.remove();

    if (on) {
      var el = document.createElement('div');
      el.className = 'ab-loading';
      el.innerHTML = '<div class="ab-dots"><div class="ab-dot"></div><div class="ab-dot"></div><div class="ab-dot"></div></div><span class="ab-loading-text">Arno denkt na</span>';
      this.$messages.appendChild(el);
      this._scrollBottom();
    }
  };

  ArnoBot.prototype._showActions = function () {
    var self = this;
    var existing = this.container.querySelector('#arnobot-actions');
    if (existing) existing.remove();

    var el = document.createElement('div');
    el.id = 'arnobot-actions';
    el.innerHTML = [
      '<button class="ab-action primary">&#8593; Vervolgvraag stellen</button>',
      '<button class="ab-action secondary">&#8592; Nieuwe sessie</button>',
    ].join('');

    el.querySelector('.ab-action.primary').addEventListener('click', function () {
      el.remove();
      self.$textarea.focus();
    });
    el.querySelector('.ab-action.secondary').addEventListener('click', function () {
      self._reset();
    });

    this.container.insertBefore(el, this.container.querySelector('#arnobot-input-area'));
    this._scrollBottom();
  };

  ArnoBot.prototype._reset = function () {
    this.history = [];
    this.started = false;
    this.loading = false;
    this.$messages.innerHTML = '';
    this.$textarea.value = '';
    this.$send.disabled = true;
    this.$openers.style.display = '';
    var existing = this.container.querySelector('#arnobot-actions');
    if (existing) existing.remove();
  };

  ArnoBot.prototype._scrollBottom = function () {
    this.$messages.scrollTop = this.$messages.scrollHeight;
  };

  // ── Init ──────────────────────────────────────────────────────────────────────
  function init() {
    injectStyles();

    // Zoek bestaand target element of maak er een aan
    var target = document.getElementById('arnobot') || document.getElementById('arnobot-widget');
    if (!target) {
      target = document.createElement('div');
      // Voeg toe na het script-tag zelf
      var scripts = document.querySelectorAll('script[src*="arnobot-widget"]');
      var lastScript = scripts[scripts.length - 1];
      if (lastScript && lastScript.parentNode) {
        lastScript.parentNode.insertBefore(target, lastScript.nextSibling);
      } else {
        document.body.appendChild(target);
      }
    }

    new ArnoBot(target);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
