/* Prof. Filer — app.js
   Pure JS. No build step. No template literals with interpolation.
   Config injected via window.CONFIG from index.html.
*/

var M = window.CONFIG.mascot;

// ── Routing ──────────────────────────────────────────────────────────────
function go(id) {
  var pages = document.querySelectorAll('.pg');
  for (var i = 0; i < pages.length; i++) pages[i].classList.remove('on');
  var navLinks = document.querySelectorAll('.nl a[id]');
  for (var i = 0; i < navLinks.length; i++) navLinks[i].classList.remove('on');
  var page = document.getElementById('pg-' + id);
  if (page) page.classList.add('on');
  var nav = document.getElementById('na-' + id);
  if (nav) nav.classList.add('on');
  window.scrollTo(0, 0);
  if (id === 'quiz' && !window._QI) { window._QI = true; renderQuiz(); }
}

// ── Quiz State ───────────────────────────────────────────────────────────
window._QI = false;
var QP = 'intro';
var QC = 0;
var QA = {};
var QR = '';

var QS = [
  {id:1, t:'r', q:'When attending a social event, you prefer to:',
   os:['Engage with many people briefly','Focus on a few close friends','Observe quietly from the sidelines','Arrive late and leave early']},
  {id:2, t:'s', q:'How much do you rely on concrete facts versus abstract ideas when solving problems?',
   lo:'Concrete facts', hi:'Abstract ideas'},
  {id:3, t:'x', q:'Rate your comfort level with making decisions based on feelings rather than logic:'},
  {id:4, t:'r', q:'When organizing your day, you tend to:',
   os:['Plan everything in advance','Make a loose plan and adapt','Go with the flow without plans','Focus on urgent tasks only']},
  {id:5, t:'s', q:'How much do you enjoy spontaneous activities compared to scheduled ones?',
   lo:'Prefer scheduled', hi:'Love spontaneous'},
  {id:6, t:'x', q:'Rate how often you trust your intuition over practical experience:'},
  {id:7, t:'r', q:'In conversations, you usually:',
   os:['Speak more than listen','Listen more than speak','Balance speaking and listening','Prefer written communication']},
  {id:8, t:'s', q:'How important is emotional harmony in your relationships?',
   lo:'Not very important', hi:'Extremely important'},
  {id:9, t:'x', q:'Rate your preference for sticking to routines versus seeking new experiences:'},
  {id:10, t:'r', q:'When faced with a conflict, you tend to:',
   os:['Address it directly and logically','Try to understand everyone\'s feelings','Avoid confrontation whenever possible','Look for a compromise quickly']},
];

// ── Quiz Render ──────────────────────────────────────────────────────────
function renderQuiz() {
  var root = document.getElementById('qroot');
  if (!root) return;
  if (QP === 'intro')        root.innerHTML = tmplIntro();
  else if (QP === 'quiz')    root.innerHTML = tmplQ();
  else if (QP === 'loading') root.innerHTML = tmplLoad();
  else                       root.innerHTML = tmplReport();
}

function tmplIntro() {
  var h = '';
  h += '<div class="qic">';
  h += '<img src="' + M + '" height="76" alt="Prof. Filer" style="display:inline-block">';
  h += '<h2>Personality Assessment</h2>';
  h += '<p style="font-size:14px;color:#7C7E7D;line-height:1.65;margin-bottom:4px">10 questions. About 3 minutes.<br>A surprisingly accurate read on how you think, feel, and move through the world.</p>';
  h += '<div class="qdge">&#128274; Your answers are processed privately and never stored on our servers.</div>';
  h += '<button class="qbtn" onclick="startQuiz()" style="width:100%;font-size:15px;padding:14px;margin-top:4px">Begin Assessment &#8594;</button>';
  h += '</div>';
  return h;
}

function startQuiz() { QP = 'quiz'; QC = 0; renderQuiz(); }

function tmplQ() {
  var q = QS[QC];
  var a = QA[q.id];
  var pct = Math.round(QC / QS.length * 100);
  var last = (QC === QS.length - 1);
  var hasA = (a !== undefined);

  if (q.t === 's' && a === undefined) { QA[q.id] = 5; a = 5; }

  var inp = '';

  if (q.t === 'r') {
    for (var i = 0; i < q.os.length; i++) {
      var v = String.fromCharCode(65 + i);
      var sel = (a === v) ? ' on' : '';
      inp += '<div class="qo' + sel + '" onclick="qsa(' + q.id + ',\'' + v + '\')">';
      inp += '<div class="qrd"><div class="qdot"></div></div>';
      inp += q.os[i];
      inp += '</div>';
    }
  } else if (q.t === 's') {
    var v2 = a || 5;
    inp += '<div style="padding:6px 0 2px">';
    inp += '<input type="range" min="1" max="10" value="' + v2 + '" step="1"';
    inp += ' oninput="qsa(' + q.id + ',+this.value);document.getElementById(\'sv' + q.id + '\').textContent=this.value+\'/10\'">';
    inp += '<div class="qsv">';
    inp += '<span class="qsl">' + q.lo + '</span>';
    inp += '<span class="qsval" id="sv' + q.id + '">' + v2 + '/10</span>';
    inp += '<span class="qsl">' + q.hi + '</span>';
    inp += '</div></div>';
  } else {
    var v3 = a || 0;
    inp += '<div class="qstars">';
    for (var s = 1; s <= 5; s++) {
      var lit = (s <= v3) ? ' on' : '';
      inp += '<button class="qstar' + lit + '" onclick="qsa(' + q.id + ',' + s + ')">&#9733;</button>';
    }
    inp += '</div>';
  }

  var h = '';
  h += '<div class="qcard">';
  h += '<div class="qpr"><div class="qpf" style="width:' + pct + '%"></div></div>';
  h += '<div class="qmeta"><span class="qlbl">Question ' + (QC + 1) + ' of ' + QS.length + '</span><span class="qlbl">' + pct + '% complete</span></div>';
  h += '<div class="qq">' + q.q + '</div>';
  h += inp;
  h += '<div class="qbtns">';
  if (QC > 0) h += '<button class="qbtn2" onclick="qprev()">&#8592; Back</button>';
  h += '<button class="qbtn"' + (hasA ? '' : ' disabled') + ' onclick="qnext()">';
  h += last ? 'Get My Report &#8594;' : 'Next &#8594;';
  h += '</button>';
  h += '</div></div>';
  return h;
}

function tmplLoad() {
  var h = '';
  h += '<div class="qcard" style="text-align:center;padding:38px 28px">';
  h += '<img src="' + M + '" height="58" style="display:inline-block;margin-bottom:12px" alt="">';
  h += '<div style="font-family:GilroyBold,sans-serif;font-size:18px;color:#2D4C68;margin-bottom:6px">Prof. Filer is running the numbers&#8230;</div>';
  h += '<div style="font-size:13px;color:#7C7E7D;margin-bottom:2px">Analysing your responses across 40+ behavioural indicators.</div>';
  h += '<div class="qldots">';
  h += '<div class="qdot2" style="animation-delay:0s"></div>';
  h += '<div class="qdot2" style="animation-delay:.2s"></div>';
  h += '<div class="qdot2" style="animation-delay:.4s"></div>';
  h += '</div>';
  h += '<div style="font-size:11px;color:#9AAAB8">Usually takes 10&#8211;20 seconds</div>';
  h += '</div>';
  return h;
}

function tmplReport() {
  var body = QR
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[^<]*<\/li>)+/g, function(m) { return '<ul>' + m + '</ul>'; })
    .split('\n')
    .map(function(l) { return l.trim() ? '<p>' + l + '</p>' : ''; })
    .join('');

  var h = '';
  h += '<div class="qcard">';
  h += '<div class="qrh">';
  h += '<img src="' + M + '" height="48" alt="Prof. Filer">';
  h += '<div>';
  h += '<div style="font-size:10px;color:#7C7E7D;letter-spacing:.1em;text-transform:uppercase">Your report from</div>';
  h += '<div style="font-family:SFOrsonCasual,sans-serif;font-size:19px;color:#2D4C68">Prof. Filer</div>';
  h += '</div></div>';
  h += '<div class="qrb">' + body + '</div>';
  h += '<div class="qdisc">Prof. Filer is an independent AI-based personality assessment tool and is not affiliated with or endorsed by the Myers-Briggs Type Indicator&#174; or The Myers-Briggs Company. For informational purposes only.</div>';
  h += '<div class="qbtns" style="margin-top:18px">';
  h += '<button class="qbtn" onclick="retakeQuiz()">Retake Assessment</button>';
  h += '<button class="qbtn2" onclick="copyReport()">Copy Report</button>';
  h += '</div></div>';
  return h;
}

function retakeQuiz() { QP = 'intro'; QC = 0; QA = {}; QR = ''; renderQuiz(); }
function copyReport() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(QR).then(function() { alert('Copied!'); });
  }
}

function qsa(id, v) { QA[id] = v; renderQuiz(); }
function qprev() { if (QC > 0) { QC--; renderQuiz(); } }
function qnext() {
  var q = QS[QC];
  if (QA[q.id] === undefined) return;
  if (QC < QS.length - 1) { QC++; renderQuiz(); }
  else submitQuiz();
}

// ── API Call ─────────────────────────────────────────────────────────────
function submitQuiz() {
  QP = 'loading';
  renderQuiz();

  var lines = [];
  for (var i = 0; i < QS.length; i++) {
    var q = QS[i];
    var a = QA[q.id];
    var at = '';
    if (q.t === 'r') {
      var idx = ['A','B','C','D'].indexOf(a);
      at = (idx >= 0) ? q.os[idx] : String(a);
    } else if (q.t === 's') {
      at = a + '/10 (' + q.lo + ' to ' + q.hi + ')';
    } else {
      at = a + '/5 stars';
    }
    lines.push('Q' + q.id + ': ' + q.q + '\nAnswer: ' + at);
  }

  var prompt = [
    'You are Prof. Filer, a warm, witty, and incisive personality analyst.',
    'Based on these quiz answers, write a personality assessment report.',
    '',
    lines.join('\n\n'),
    '',
    'Structure your report exactly like this:',
    '',
    '**Your Personality Type**',
    '[A 2-4 word evocative title] — [one-line MBTI-adjacent descriptor]',
    '',
    '**The Prof.\'s Reading**',
    '[2-3 paragraphs of warm, intelligent, specific insight based on their actual answers.]',
    '',
    '**Your Superpowers**',
    '• [Genuine strength 1]',
    '• [Genuine strength 2]',
    '• [Genuine strength 3]',
    '',
    '**Watch Out For**',
    '• [Blind spot 1, warmly delivered]',
    '• [Blind spot 2, warmly delivered]',
    '',
    '**Prof. Filer\'s Verdict**',
    '[One memorable closing sentence capturing this person\'s essence.]',
    '',
    'Tone: smart, warm, slightly witty. Like a brilliant friend who also happens to be a psychologist.',
  ].join('\n');

  fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  .then(function(res) { return res.json(); })
  .then(function(d) {
    var blk = d.content && d.content.find(function(b) { return b.type === 'text'; });
    QR = blk ? blk.text : 'Unable to generate report. Please try again.';
    QP = 'report';
    renderQuiz();
  })
  .catch(function() {
    QR = 'Something went wrong connecting to the server. Please try again.';
    QP = 'report';
    renderQuiz();
  });
}
