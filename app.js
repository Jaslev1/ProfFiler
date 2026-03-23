/* Prof. Filer — app.js. Zero Python. window.CONFIG from index.html. */

var M = window.CONFIG.mascot;

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

window._QI = false;
var QP = 'intro', QC = 0, QA = {}, QR = '', DOCS = [];
var RPT = {}; // parsed report sections

var QS = [
  {id:1,t:'r',q:'When attending a social event, you prefer to:',
   os:['Engage with many people briefly','Focus on a few close friends','Observe quietly from the sidelines','Arrive late and leave early']},
  {id:2,t:'s',q:'How much do you rely on concrete facts versus abstract ideas when solving problems?',lo:'Concrete facts',hi:'Abstract ideas'},
  {id:3,t:'x',q:'Rate your comfort level with making decisions based on feelings rather than logic:'},
  {id:4,t:'r',q:'When organizing your day, you tend to:',
   os:['Plan everything in advance','Make a loose plan and adapt','Go with the flow without plans','Focus on urgent tasks only']},
  {id:5,t:'s',q:'How much do you enjoy spontaneous activities compared to scheduled ones?',lo:'Prefer scheduled',hi:'Love spontaneous'},
  {id:6,t:'x',q:'Rate how often you trust your intuition over practical experience:'},
  {id:7,t:'r',q:'In conversations, you usually:',
   os:['Speak more than listen','Listen more than speak','Balance speaking and listening','Prefer written communication']},
  {id:8,t:'s',q:'How important is emotional harmony in your relationships?',lo:'Not very important',hi:'Extremely important'},
  {id:9,t:'x',q:'Rate your preference for sticking to routines versus seeking new experiences:'},
  {id:10,t:'r',q:'When faced with a conflict, you tend to:',
   os:["Address it directly and logically","Try to understand everyone's feelings","Avoid confrontation whenever possible","Look for a compromise quickly"]},
];

function renderQuiz() {
  var root = document.getElementById('qroot');
  if (!root) return;
  if (QP === 'intro')        root.innerHTML = tmplIntro();
  else if (QP === 'quiz')    root.innerHTML = tmplQ();
  else if (QP === 'docs')    root.innerHTML = tmplDocs();
  else if (QP === 'loading') root.innerHTML = tmplLoad();
  else                       root.innerHTML = tmplReport();
}

function tmplIntro() {
  var h = '<div class="qic">';
  h += '<img src="'+M+'" height="76" alt="Prof. Filer" style="display:inline-block">';
  h += '<h2>Personality Assessment</h2>';
  h += '<p style="font-size:14px;color:#7C7E7D;line-height:1.65;margin-bottom:4px">10 questions &amp; 3 documents. Under 5 minutes.<br>A surprisingly accurate read on how you think, feel, and move through the world.</p>';
  h += '<div class="qdge">&#128274; Your answers are processed privately and never stored on our servers.</div>';
  h += '<button class="qbtn" onclick="QP=\'quiz\';QC=0;renderQuiz()" style="width:100%;font-size:15px;padding:14px;margin-top:4px">Begin Assessment &#8594;</button>';
  h += '</div>';
  return h;
}

function tmplQ() {
  var q=QS[QC], a=QA[q.id], pct=Math.round(QC/QS.length*100);
  var last=(QC===QS.length-1), hasA=(a!==undefined);
  if (q.t==='s' && a===undefined) { QA[q.id]=5; a=5; }
  var inp='';
  if (q.t==='r') {
    for (var i=0;i<q.os.length;i++) {
      var v=String.fromCharCode(65+i), sel=(a===v)?' on':'';
      inp+='<div class="qo'+sel+'" onclick="qsa('+q.id+',\''+v+'\')">';
      inp+='<div class="qrd"><div class="qdot"></div></div>'+q.os[i]+'</div>';
    }
  } else if (q.t==='s') {
    var v2=a||5;
    inp='<div style="padding:6px 0 2px"><input type="range" min="1" max="10" value="'+v2+'" step="1"';
    inp+=' oninput="qsa('+q.id+',+this.value);document.getElementById(\'sv'+q.id+'\').textContent=this.value+\'/10\'">';
    inp+='<div class="qsv"><span class="qsl">'+q.lo+'</span><span class="qsval" id="sv'+q.id+'">'+v2+'/10</span><span class="qsl">'+q.hi+'</span></div></div>';
  } else {
    var v3=a||0;
    inp='<div class="qstars">';
    for (var s=1;s<=5;s++) inp+='<button class="qstar'+(s<=v3?' on':'')+'" onclick="qsa('+q.id+','+s+')">&#9733;</button>';
    inp+='</div>';
  }
  var h='<div class="qcard">';
  h+='<div class="qpr"><div class="qpf" style="width:'+pct+'%"></div></div>';
  h+='<div class="qmeta"><span class="qlbl">Question '+(QC+1)+' of '+QS.length+'</span><span class="qlbl">'+pct+'% complete</span></div>';
  h+='<div class="qq">'+q.q+'</div>'+inp;
  h+='<div class="qbtns">';
  h+=(QC>0?'<button class="qbtn2" onclick="qprev()">&#8592; Back</button>':'<button class="qbtn2" onclick="QP=\'intro\';renderQuiz()">&#8592; Back</button>');
  h+='<button class="qbtn"'+(hasA?'':' disabled')+' onclick="qnext()">'+(last?'Upload Documents &#8594;':'Next &#8594;')+'</button></div></div>';
  return h;
}

function tmplDocs() {
  var uploaded=DOCS.length, allDone=(uploaded>=3);
  var dropArea='';
  if (!allDone) {
    dropArea='<div class="doc-drop" onclick="document.getElementById(\'docInput\').click()">';
    dropArea+='<div style="font-size:36px;margin-bottom:10px">&#8679;</div>';
    dropArea+='<strong>'+(uploaded>0?uploaded+' of 3 uploaded \u2014 add '+(3-uploaded)+' more':'Click to upload your documents')+'</strong>';
    dropArea+='<p style="font-size:12px;color:#7C7E7D;margin-top:6px">PDF, Word, or text files that reflect your writing style</p>';
    dropArea+='<input type="file" id="docInput" accept=".pdf,.doc,.docx,.txt" multiple style="display:none" onchange="handleDocUpload(this)">';
    dropArea+='</div>';
  } else {
    dropArea='<div class="doc-drop doc-drop-done">';
    dropArea+='<div style="font-size:36px;margin-bottom:8px">&#10003;</div>';
    dropArea+='<strong style="color:#22a85a">All documents uploaded!</strong>';
    dropArea+='<p style="font-size:12px;color:#7C7E7D;margin-top:4px">3 of 3 documents uploaded</p>';
    dropArea+='</div>';
  }
  var docList='';
  for (var i=0;i<DOCS.length;i++) {
    docList+='<div class="doc-item"><div class="doc-icon">&#128196;</div><div class="doc-name">'+escHtml(DOCS[i])+'</div>';
    docList+='<button class="doc-remove" onclick="removeDoc('+i+')">&#215;</button></div>';
  }
  var h='<div class="qcard">';
  h+='<div style="text-align:center;margin-bottom:20px">';
  h+='<h2 style="font-family:SFOrsonCasual,sans-serif;font-size:22px;color:#2D4C68;text-transform:uppercase;letter-spacing:.05em">Upload Your Documents</h2>';
  h+='<p style="font-size:14px;color:#7C7E7D;margin-top:8px">Share 3 documents that reflect your writing style \u2014 reports, proposals, analyses, prose, etc.</p>';
  h+='</div>'+dropArea;
  if (docList) h+='<div class="doc-list">'+docList+'</div>';
  h+='<div style="font-size:12px;color:#9AAAB8;text-align:center;margin-top:14px;line-height:1.6">All documents remain entirely yours. Processed privately, never stored.</div>';
  h+='<div class="qbtns" style="margin-top:20px">';
  h+='<button class="qbtn2" onclick="QP=\'quiz\';QC=QS.length-1;renderQuiz()">&#8592; Back</button>';
  h+='<button class="qbtn" '+(allDone?'':'disabled')+' onclick="submitQuiz()">Get My Report &#8594;</button>';
  h+='</div></div>';
  return h;
}

function escHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function handleDocUpload(input){ var f=input.files; for(var i=0;i<f.length;i++) if(DOCS.length<3) DOCS.push(f[i].name); renderQuiz(); }
function removeDoc(idx){ DOCS.splice(idx,1); renderQuiz(); }

function tmplLoad() {
  var h='<div class="qcard" style="text-align:center;padding:38px 28px">';
  h+='<img src="'+M+'" height="58" style="display:inline-block;margin-bottom:12px" alt="">';
  h+='<div style="font-family:GilroyBold,sans-serif;font-size:18px;color:#2D4C68;margin-bottom:6px">Prof. Filer is running the numbers\u2026</div>';
  h+='<div style="font-size:13px;color:#7C7E7D;margin-bottom:2px">Analysing your responses across 40+ behavioural indicators.</div>';
  h+='<div class="qldots"><div class="qdot2" style="animation-delay:0s"></div><div class="qdot2" style="animation-delay:.2s"></div><div class="qdot2" style="animation-delay:.4s"></div></div>';
  h+='<div style="font-size:11px;color:#9AAAB8">Usually takes 10\u201320 seconds</div></div>';
  return h;
}

// ── Parse the AI report into named sections ───────────────────────────────
function parseReport(raw) {
  var r = { raw:raw, type:'', typeName:'', typeDesc:'', overview:'', strengths:[], watchFor:[], verdict:'' };
  var typeMatch = raw.match(/\*\*Your Personality Type\*\*\s*\n([^\n]+)/);
  if (typeMatch) {
    var parts = typeMatch[1].trim().split(/\s*[\u2014\-]{1,2}\s*/);
    r.type     = parts[0] ? parts[0].trim() : '';
    r.typeName = parts[1] ? parts[1].trim() : '';
    r.typeDesc = parts[2] ? parts[2].trim() : '';
  }
  var readMatch = raw.match(/\*\*The Prof\.[\u2019']?s Reading\*\*\s*\n([\s\S]*?)(?=\*\*Your Superpowers|\*\*Watch Out|\*\*Prof\.|$)/);
  r.overview = readMatch ? readMatch[1].trim() : '';
  var spMatch = raw.match(/\*\*Your Superpowers\*\*\s*\n([\s\S]*?)(?=\*\*Watch Out|\*\*Prof\.|$)/);
  if (spMatch) r.strengths = spMatch[1].trim().split('\n').filter(function(l){return l.trim();}).map(function(l){return l.replace(/^[•\-\*\u2022]\s*/,'').trim();});
  var woMatch = raw.match(/\*\*Watch Out For\*\*\s*\n([\s\S]*?)(?=\*\*Prof\.|$)/);
  if (woMatch) r.watchFor = woMatch[1].trim().split('\n').filter(function(l){return l.trim();}).map(function(l){return l.replace(/^[•\-\*\u2022]\s*/,'').trim();});
  var vMatch = raw.match(/\*\*Prof\. Filer[''\u2019]?s Verdict\*\*\s*\n([\s\S]*?)$/);
  r.verdict = vMatch ? vMatch[1].trim() : '';
  return r;
}

// ── On-screen report — full free content, no paywall ─────────────────────
function tmplReport() {
  var isErr = !QR || QR.indexOf('API error')===0 || QR.indexOf('Connection error')===0;
  if (isErr) {
    var h='<div class="qcard"><div style="text-align:center;padding:20px 0">';
    h+='<div style="font-size:36px;margin-bottom:12px">&#128561;</div>';
    h+='<div style="font-family:GilroyBold,sans-serif;font-size:17px;color:#D12019;margin-bottom:10px">Could not generate report</div>';
    h+='<div style="font-size:13px;color:#7C7E7D;line-height:1.6;margin-bottom:8px">'+escHtml(QR)+'</div>';
    h+='<div style="font-size:12px;color:#9AAAB8;line-height:1.6">Make sure <strong>OPENAI_API_KEY</strong> is set in Vercel environment variables, then redeploy.</div>';
    h+='</div><div class="qbtns" style="margin-top:20px"><button class="qbtn" onclick="QP=\'docs\';renderQuiz()">Try Again</button></div></div>';
    return h;
  }

  RPT = parseReport(QR);
  var overviewHtml = RPT.overview.split('\n').map(function(l){return l.trim()?'<p style="margin-bottom:10px">'+l+'</p>':'';}).join('');

  var h='<div class="qcard">';

  // Header
  h+='<div class="qrh"><img src="'+M+'" height="48" alt="Prof. Filer">';
  h+='<div><div style="font-size:10px;color:#7C7E7D;letter-spacing:.1em;text-transform:uppercase">Your AI Analysis Complete</div>';
  h+='<div style="font-family:SFOrsonCasual,sans-serif;font-size:26px;color:#2D4C68;text-transform:uppercase;letter-spacing:.05em">'+escHtml(RPT.type)+'</div>';
  if (RPT.typeName) h+='<div style="font-family:GilroyBold,sans-serif;font-size:15px;color:#5086AD">'+escHtml(RPT.typeName)+'</div>';
  if (RPT.typeDesc) h+='<div style="font-size:13px;color:#7C7E7D">'+escHtml(RPT.typeDesc)+'</div>';
  h+='</div></div>';

  // Prof's Reading
  h+='<div style="margin-bottom:20px">';
  h+='<div style="font-size:11px;font-family:GilroyBold,sans-serif;color:#D12019;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px">The Prof\'s Reading</div>';
  h+='<div class="qrb">'+overviewHtml+'</div>';
  h+='</div>';

  // Superpowers
  if (RPT.strengths.length) {
    h+='<div style="margin-bottom:20px">';
    h+='<div style="font-size:11px;font-family:GilroyBold,sans-serif;color:#D12019;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px">Your Superpowers</div>';
    for (var i=0;i<RPT.strengths.length;i++) {
      h+='<div style="display:flex;align-items:flex-start;gap:10px;padding:11px 14px;background:#FFF4EC;border-radius:8px;margin-bottom:8px;border-left:3px solid #FFC499">';
      h+='<span style="color:#D12019;margin-top:1px;flex-shrink:0">&#9733;</span>';
      h+='<span style="font-size:14px;color:#2D4C68;line-height:1.5">'+escHtml(RPT.strengths[i])+'</span></div>';
    }
    h+='</div>';
  }

  // Watch Out For
  if (RPT.watchFor.length) {
    h+='<div style="margin-bottom:20px">';
    h+='<div style="font-size:11px;font-family:GilroyBold,sans-serif;color:#5086AD;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px">Watch Out For</div>';
    for (var j=0;j<RPT.watchFor.length;j++) {
      h+='<div style="display:flex;align-items:flex-start;gap:10px;padding:11px 14px;background:#F0F5F9;border-radius:8px;margin-bottom:8px;border-left:3px solid #5086AD">';
      h+='<span style="color:#5086AD;margin-top:1px;flex-shrink:0">&#8594;</span>';
      h+='<span style="font-size:14px;color:#2D4C68;line-height:1.5">'+escHtml(RPT.watchFor[j])+'</span></div>';
    }
    h+='</div>';
  }

  // Verdict
  if (RPT.verdict) {
    h+='<div style="background:#2D4C68;border-radius:10px;padding:18px 22px;margin-bottom:20px">';
    h+='<div style="font-size:10px;color:rgba(255,255,255,.45);letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px">Prof. Filer\'s Verdict</div>';
    h+='<div style="font-size:15px;color:#FFC499;font-family:GilroyMedium,sans-serif;font-style:italic;line-height:1.6">\u201c'+escHtml(RPT.verdict)+'\u201d</div>';
    h+='</div>';
  }

  // Download full PDF button
  h+='<div style="background:linear-gradient(135deg,#FFF4EC,#FFE8D4);border-radius:12px;padding:22px;margin-bottom:20px;border:1px solid #FFD4B8;text-align:center">';
  h+='<div style="font-family:GilroyBold,sans-serif;font-size:15px;color:#2D4C68;margin-bottom:6px">Want the full picture?</div>';
  h+='<div style="font-size:13px;color:#7C7E7D;margin-bottom:14px">Download your complete 7-page personality report \u2014 cognitive functions, career paths, relationships, leadership style, stress response &amp; more.</div>';
  h+='<button class="qbtn" style="background:#D12019;width:auto;padding:12px 28px" onclick="downloadFullPDF()">&#8681; Download Full Report PDF</button>';
  h+='<div style="font-size:11px;color:#9AAAB8;margin-top:8px">Free for now \u2022 PDF \u2022 7 pages</div>';
  h+='</div>';

  h+='<div class="qdisc">Prof. Filer is an independent AI-based personality assessment tool and is not affiliated with or endorsed by the Myers-Briggs Type Indicator&#174; or The Myers-Briggs Company. For informational purposes only.</div>';
  h+='<div class="qbtns" style="margin-top:18px"><button class="qbtn2" onclick="retakeQuiz()">Retake Assessment</button><button class="qbtn2" onclick="copyReport()">Copy Text</button></div>';
  h+='</div>';
  return h;
}

// ── PDF Generation (jsPDF, loaded on demand) ──────────────────────────────
function downloadFullPDF() {
  var btn = document.querySelector('.qbtn[onclick*="downloadFullPDF"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Generating PDF\u2026'; }
  if (window.jspdf && window.jspdf.jsPDF) { _buildPDF(); return; }
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  s.onload = function(){ _buildPDF(); };
  s.onerror = function(){ alert('Could not load PDF library. Please check your connection and try again.'); };
  document.head.appendChild(s);
}

function _buildPDF() {
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF({orientation:'portrait', unit:'mm', format:'a4'});
  var PW = 210, PH = 297, M = 20, CW = 170;

  // Colours
  var NAVY=[45,76,104], RED=[209,32,25], BLUE=[80,134,173];
  var PEACH=[255,196,153], GREY=[124,126,125], LIGHT=[240,245,249];
  var WHITE=[255,255,255], DARK=[30,52,72], PINK=[255,244,236];

  var y = 0;

  function setFill(c){ doc.setFillColor(c[0],c[1],c[2]); }
  function setDraw(c){ doc.setDrawColor(c[0],c[1],c[2]); }
  function setTxt(c){ doc.setTextColor(c[0],c[1],c[2]); }

  function newPage() {
    doc.addPage();
    y = 18;
    // thin top strip
    setFill(NAVY); doc.rect(0,0,PW,5,'F');
  }

  function needSpace(n) { if (y+n > PH-20) newPage(); }

  function secBar(title, col) {
    col = col || NAVY;
    needSpace(12);
    setFill(col);
    doc.roundedRect(M, y, CW, 9, 2, 2, 'F');
    setTxt(WHITE);
    doc.setFont('helvetica','bold');
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), M+4, y+6);
    y += 13;
  }

  function subHead(title, col) {
    col = col || RED;
    needSpace(10);
    doc.setFont('helvetica','bold');
    doc.setFontSize(10.5);
    setTxt(col);
    doc.text(title, M, y);
    y += 6;
  }

  function bodyPara(text) {
    needSpace(8);
    doc.setFont('helvetica','normal');
    doc.setFontSize(9.5);
    setTxt([50,70,90]);
    var lines = doc.splitTextToSize(text, CW);
    needSpace(lines.length*5+2);
    doc.text(lines, M, y);
    y += lines.length*5+4;
  }

  function bullet(text, dotCol) {
    dotCol = dotCol || RED;
    needSpace(10);
    setFill(LIGHT);
    doc.roundedRect(M, y, CW, 8, 2, 2, 'F');
    setFill(dotCol);
    doc.circle(M+5, y+4, 1.5, 'F');
    doc.setFont('helvetica','normal');
    doc.setFontSize(9.5);
    setTxt(NAVY);
    var lines = doc.splitTextToSize(text, CW-11);
    doc.text(lines, M+9, y+4.5);
    y += lines.length*5+2;
  }

  function numberedItem(n, text) {
    needSpace(8);
    doc.setFont('helvetica','bold');
    doc.setFontSize(9.5);
    setTxt(RED);
    doc.text(n+'.', M, y+4);
    doc.setFont('helvetica','normal');
    setTxt([50,70,90]);
    var lines = doc.splitTextToSize(text, CW-7);
    doc.text(lines, M+6, y+4);
    y += lines.length*5+2;
  }

  // ── TYPE LOOKUP DATA ──────────────────────────────────────────────────
  var TYPE = RPT.type || 'XXXX';
  var typeData = getTypeData(TYPE);

  // ══ PAGE 1: COVER ════════════════════════════════════════════════════
  // Navy header block
  setFill(NAVY); doc.rect(0,0,PW,68,'F');

  // PF red circle badge
  setFill(RED); doc.circle(PW/2, 18, 9, 'F');
  setTxt(WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(11);
  doc.text('PF', PW/2, 21.5, {align:'center'});

  // "Full Personality Report" pill
  setFill([255,240,235]);
  doc.roundedRect(PW/2-28, 29, 56, 7, 3, 3, 'F');
  setTxt(RED); doc.setFont('helvetica','bold'); doc.setFontSize(7.5);
  doc.text('Full Personality Report', PW/2, 34.2, {align:'center'});

  // Big type code
  setTxt(WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(44);
  doc.text(TYPE, PW/2, 60, {align:'center'});

  // White section below header
  doc.setFillColor(255,255,255); doc.rect(0,67,PW,22,'F');
  setTxt(NAVY); doc.setFont('helvetica','bold'); doc.setFontSize(17);
  doc.text(RPT.typeName||'', PW/2, 79, {align:'center'});

  // Population blurb
  setTxt(GREY); doc.setFont('helvetica','normal'); doc.setFontSize(9);
  var blurb = typeData.blurb || ('Your '+TYPE+' personality profile has been prepared by Prof. Filer, an AI-powered personality assessment tool.');
  var bLines = doc.splitTextToSize(blurb, 150);
  doc.text(bLines, PW/2, 87, {align:'center'});

  y = 99;

  // Overview
  secBar('Overview');
  for (var i=0; i<typeData.overview.length; i++) bodyPara(typeData.overview[i]);
  y += 2;

  // Core Characteristics
  secBar('Core Characteristics');
  for (var i=0; i<typeData.characteristics.length; i++) bullet(typeData.characteristics[i], NAVY);
  y += 2;

  // ══ PAGE 2: AI READING + STRENGTHS + WATCH ═══════════════════════════
  newPage();

  // Prof's Reading (AI-generated, personalised)
  secBar("The Prof's Reading", RED);
  var overParts = (RPT.overview||'').split('\n').filter(function(l){return l.trim();});
  for (var i=0; i<overParts.length; i++) bodyPara(overParts[i]);
  y += 4;

  // Strengths
  secBar('Your Superpowers');
  for (var i=0; i<RPT.strengths.length; i++) bullet(RPT.strengths[i], RED);
  y += 4;

  // Watch Out For
  secBar('Areas to Watch', BLUE);
  for (var i=0; i<RPT.watchFor.length; i++) bullet(RPT.watchFor[i], BLUE);
  y += 4;

  // Verdict callout box
  if (RPT.verdict) {
    needSpace(26);
    setFill(NAVY);
    doc.roundedRect(M, y, CW, 22, 3, 3, 'F');
    setTxt([255,196,153]);
    doc.setFont('helvetica','bolditalic'); doc.setFontSize(9.5);
    var vLines = doc.splitTextToSize('\u201c'+RPT.verdict+'\u201d', CW-10);
    doc.text(vLines, PW/2, y+9, {align:'center'});
    setTxt(WHITE); doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
    doc.text("Prof. Filer's Verdict", PW/2, y+19, {align:'center'});
    y += 28;
  }

  // ══ PAGE 3: COGNITIVE FUNCTIONS + FAMOUS + CAREERS ═══════════════════
  newPage();

  secBar('Cognitive Functions');
  var funcs = typeData.cognitiveFunctions;
  var fColors = [RED, BLUE, [80,134,173], GREY];
  for (var i=0; i<funcs.length; i++) {
    needSpace(20);
    doc.setFont('helvetica','bold'); doc.setFontSize(10);
    setTxt(fColors[i]||NAVY);
    doc.text(funcs[i].label+': '+funcs[i].name, M, y);
    y += 5;
    bodyPara(funcs[i].desc);
  }
  y += 4;

  secBar('Famous People with This Type');
  for (var i=0; i<typeData.famous.length; i++) bullet(typeData.famous[i], RED);
  y += 4;

  secBar('Ideal Career Paths');
  // 2-column
  var careers = typeData.careers;
  var half = Math.ceil(careers.length/2);
  var startY = y;
  for (var i=0; i<careers.length; i++) {
    var cx = (i < half) ? M : M+CW/2+2;
    var cy = startY + (i < half ? i : i-half)*9;
    setFill(LIGHT); doc.roundedRect(cx, cy, CW/2-3, 7, 2, 2, 'F');
    setFill(RED); doc.circle(cx+5, cy+3.5, 1.5, 'F');
    doc.setFont('helvetica','normal'); doc.setFontSize(9); setTxt(NAVY);
    doc.text(careers[i], cx+9, cy+4.5);
  }
  y = startY + half*9 + 8;

  // ══ PAGE 4: RELATIONSHIPS ════════════════════════════════════════════
  newPage();

  secBar('Relationships', NAVY);
  subHead('Overview', BLUE);
  bodyPara(typeData.relationships.overview);
  subHead('Friendships', BLUE);
  bodyPara(typeData.relationships.friendships);
  subHead('Romantic Relationships', BLUE);
  bodyPara(typeData.relationships.romantic);
  subHead('Parenting', BLUE);
  bodyPara(typeData.relationships.parenting);

  y += 4;
  secBar('Compatible Types');
  for (var i=0; i<typeData.compatible.length; i++) bullet(typeData.compatible[i], BLUE);
  y += 4;

  secBar('Decision Making');
  bodyPara(typeData.decisionMaking);
  y += 4;

  secBar('Learning Style');
  bodyPara(typeData.learningStyle);

  // ══ PAGE 5: LEADERSHIP + STRESS + ENVIRONMENT + GROWTH ═══════════════
  newPage();

  secBar('Leadership Style');
  bodyPara(typeData.leadership);
  y += 4;

  secBar('Stress Response');
  bodyPara(typeData.stress);
  y += 4;

  secBar('Ideal Environment');
  bodyPara(typeData.environment);
  y += 4;

  secBar('Growth Opportunities');
  for (var i=0; i<typeData.growth.length; i++) bullet(typeData.growth[i], NAVY);
  y += 4;

  secBar('Work-Life Balance Tips');
  for (var i=0; i<typeData.workLife.length; i++) bullet(typeData.workLife[i], BLUE);

  // ══ PAGE 6: HABITS + MOTIVATIONS + FEARS + DISCLAIMER ════════════════
  newPage();

  secBar('Recommended Daily Habits');
  for (var i=0; i<typeData.habits.length; i++) bullet(typeData.habits[i], NAVY);
  y += 4;

  secBar('Core Motivations');
  for (var i=0; i<typeData.motivations.length; i++) bullet(typeData.motivations[i], PEACH);
  y += 4;

  secBar('Core Fears', RED);
  for (var i=0; i<typeData.fears.length; i++) numberedItem(i+1, typeData.fears[i]);
  y += 8;

  // Disclaimer box
  needSpace(28);
  setFill([245,245,245]);
  setDraw([200,200,200]);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, 22, 3, 3, 'FD');
  doc.setFont('helvetica','bold'); doc.setFontSize(8.5); setTxt([80,80,80]);
  doc.text('Disclaimer:', M+4, y+7);
  doc.setFont('helvetica','normal'); doc.setFontSize(8); setTxt([120,120,120]);
  var disc = 'Insights provided are for informational purposes only and we make no warranties, express or implied. By using this site, you agree to hold the site owners and distributors harmless from any loss or liability arising from its use. Prof. Filer is not affiliated with The Myers-Briggs Company.';
  var dLines = doc.splitTextToSize(disc, CW-8);
  doc.text(dLines, M+4, y+13);
  y += 26;

  // Footer on every page
  var pageCount = doc.getNumberOfPages();
  for (var p=1; p<=pageCount; p++) {
    doc.setPage(p);
    setFill(DARK); doc.rect(0,PH-11,PW,11,'F');
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); setTxt([150,170,185]);
    doc.text('Prof. Filer \u2014 Full Personality Report \u2014 '+TYPE+(RPT.typeName?' \u2014 '+RPT.typeName:''), M, PH-4.5);
    doc.text('Page '+p+' of '+pageCount, PW-M, PH-4.5, {align:'right'});
  }

  doc.save('Prof_Filer_'+TYPE+'_Full_Report.pdf');

  // Re-enable button
  var btn = document.querySelector('button[disabled]');
  if (btn) { btn.disabled=false; btn.innerHTML='&#8681; Download Full Report PDF'; }
}

// ── Type-specific content database ───────────────────────────────────────
function getTypeData(type) {
  var db = {
    ENTJ: {
      blurb: 'ENTJs make up approximately 2-5% of the population and are more commonly found among men than women. They are often found in leadership roles across business, politics, and entrepreneurship.',
      overview: [
        'ENTJs are natural-born leaders known for their strategic mindset, assertiveness, and ability to organize complex projects. They see the world as a landscape of opportunities to be shaped and optimized. Driven by a desire to achieve and lead, ENTJs thrive on challenges that require quick thinking and decisive action.',
        'ENTJs are energized by external interaction and tend to approach problems with a logical, analytical lens. They value competence and efficiency, often pushing themselves and those around them to higher standards. While their confidence and decisiveness can sometimes come across as domineering, their intent is usually to improve systems and outcomes.'
      ],
      characteristics: [
        'You are a strategic thinker who excels at long-term planning and envisioning future possibilities.',
        'You naturally take charge in group settings and are comfortable leading teams toward goals.',
        'You rely on objective logic and rational analysis to make decisions.',
        'You prefer structured environments and like to have clear plans and deadlines.',
        'You are highly confident and assertive, often inspiring others with your conviction.',
        'You can be impatient with inefficiency or indecisiveness in others.',
        'You seek continual growth and mastery in your professional and personal life.',
        'You value competence and expect high performance from yourself and those around you.'
      ],
      cognitiveFunctions: [
        {label:'Dominant', name:'Extraverted Thinking (Te)', desc:'You organize the external world logically and efficiently, setting goals and implementing plans to achieve measurable results. This function manifests in your natural leadership and decisive action.'},
        {label:'Auxiliary', name:'Introverted Intuition (Ni)', desc:'Your auxiliary function helps you perceive underlying patterns and future possibilities. It supports your strategic vision by allowing you to integrate insights and foresee long-term outcomes.'},
        {label:'Tertiary', name:'Extraverted Sensing (Se)', desc:'Extraverted Sensing provides awareness of your immediate environment and the ability to respond to sensory details. While less developed, it helps you stay grounded and notice practical realities.'},
        {label:'Inferior', name:'Introverted Feeling (Fi)', desc:'Your inferior function governs your internal value system and emotional depth. Under stress, you may suppress feelings. Developing this function can enhance your empathy and personal authenticity.'},
      ],
      famous: ['Margaret Thatcher','Steve Jobs','Franklin D. Roosevelt','Gordon Ramsay','Harrison Ford','Napoleon Bonaparte'],
      careers: ['Executive Manager','Entrepreneur','Management Consultant','Corporate Strategist','Lawyer','Politician','Project Manager','Financial Analyst','Military Officer','Business Development Director'],
      relationships: {
        overview: 'In relationships, you seek partners who are confident, intelligent, and independent. You value mutual respect and shared ambition, often taking a leadership role in the partnership. You appreciate clear communication and practical support, and you expect loyalty and competence from your loved ones.',
        friendships: 'You tend to form friendships with like-minded individuals who share your drive and intellectual curiosity. You prefer quality over quantity, valuing friends who challenge you and contribute to your growth. Your directness can sometimes intimidate more sensitive friends, so you benefit from cultivating patience and empathy.',
        romantic: 'In romantic relationships, you seek a partner who complements your ambition and can engage with you intellectually and emotionally. You value honesty and directness, and you are most satisfied when your partner supports your goals while maintaining their own identity. Emotional vulnerability may be challenging but is essential for deeper intimacy.',
        parenting: 'As a parent, you encourage independence, responsibility, and high achievement in your children. You set clear expectations and model strong leadership. While you may struggle with emotional expression, you deeply care about your children\'s success and well-being.'
      },
      compatible: ['INFP \u2014 Complements your logic with emotional depth and values-driven perspective.','ISFP \u2014 Offers warmth and groundedness to balance your strategic focus.','ENFP \u2014 Brings enthusiasm and creativity that energize your plans.','INTP \u2014 Shares your love for ideas and independent thinking.'],
      decisionMaking: 'You approach decisions with a focus on objective logic and efficiency, prioritizing what will yield the best results. You gather information strategically and are comfortable making quick decisions, especially under pressure. While you value data, you also rely on your intuition to foresee long-term consequences. You tend to avoid decisions driven solely by emotion, preferring clear rationale and measurable outcomes.',
      learningStyle: 'You learn best through conceptual frameworks and strategic overviews rather than rote memorization. You enjoy exploring theories, patterns, and future possibilities, often integrating new knowledge into your existing mental models. Hands-on application and real-world problem solving enhance your retention and engagement.',
      leadership: 'Your leadership style is visionary, assertive, and results-oriented. You set high standards, create clear plans, and motivate teams through your confidence and strategic insight. You naturally take charge and expect competence and accountability from your team members. You excel at managing complex projects and navigating change, often pushing organizations toward innovation and growth.',
      stress: 'Under stress, you may become overly critical, impatient, or domineering, pushing harder to control outcomes. You might suppress emotions, leading to unexpected emotional reactions or withdrawal. To recover, you benefit from stepping back to reflect quietly, engaging in physical activity, and seeking trusted confidants.',
      environment: 'You thrive in fast-paced, challenging environments where you can lead, strategize, and implement change. Structured workplaces with clear goals and opportunities for advancement suit you best. You prefer roles that allow autonomy and decision-making authority.',
      growth: ['Practice active empathy by consciously tuning into others\u2019 emotions and perspectives.','Delegate interpersonal and emotional tasks to develop team cohesion and trust.','Incorporate flexibility into your plans to better adapt to unexpected changes.','Set boundaries to prevent overcommitment and prioritize self-care.','Develop your inferior Introverted Feeling to enhance emotional awareness.','Foster patience in conversations to encourage diverse viewpoints.'],
      workLife: ['Schedule regular downtime to recharge and prevent burnout.','Set clear boundaries between work and personal life to maintain relationships.','Delegate tasks to reduce overload and empower others.','Incorporate physical exercise to manage stress and maintain energy.','Practice mindfulness or reflective journaling to enhance emotional awareness.','Prioritize sleep and nutrition to support sustained performance.'],
      habits: ['Start your day by reviewing goals and prioritizing tasks.','Engage in focused work blocks with minimal distractions.','Schedule brief breaks to maintain mental clarity and energy.','Reflect on interpersonal interactions to improve communication.','Allocate time for physical activity or movement.','End your day by planning for tomorrow and acknowledging achievements.'],
      motivations: ['Achieving ambitious goals and measurable success.','Leading and influencing others to realize a vision.','Creating efficient systems and optimizing processes.','Mastering complex challenges and continuous growth.','Gaining respect and recognition for competence.','Building a legacy through impactful contributions.'],
      fears: ['Loss of control or authority in important matters.','Being perceived as incompetent or ineffective.','Failure to achieve goals or fulfill potential.','Emotional vulnerability or loss of rationality.','Dependence on others who lack competence.','Stagnation or lack of progress in personal or professional life.'],
    },
    ESTJ: {
      blurb: 'ESTJs make up approximately 8-12% of the general population and are more commonly found among men. They often gravitate toward roles that require leadership and organization, reflecting their natural talents.',
      overview: [
        'The ESTJ personality type, often known as the Executive, is characterized by a strong sense of duty, practicality, and leadership. You see the world as a place that requires order and structure, and you naturally step into roles where you can organize, manage, and lead others.',
        'Your approach to life is grounded in facts and experience, and you value traditions, rules, and systems that have proven effective. You are driven by a desire to achieve tangible results and to uphold standards, making you a dependable and respected figure in both your professional and personal circles.'
      ],
      characteristics: [
        'You are highly practical and grounded, focusing on what is tangible and real.',
        'You have a strong preference for structure, order, and clear rules.',
        'You naturally take on leadership roles and enjoy organizing people and projects.',
        'You make decisions based on logic and objective analysis rather than emotions.',
        'You have a strong work ethic and are reliable in fulfilling your commitments.',
        'You communicate in a clear, direct, and assertive manner.',
        'You value tradition and proven methods, often respecting established systems.',
        'You prefer to plan and make decisions promptly to maintain control and order.'
      ],
      cognitiveFunctions: [
        {label:'Dominant', name:'Extraverted Thinking (Te)', desc:'Your dominant function drives you to organize your external world efficiently. You prioritize objective data, logical systems, and measurable results. This manifests as your ability to lead teams, create order, and implement practical solutions swiftly.'},
        {label:'Auxiliary', name:'Introverted Sensing (Si)', desc:'Introverted Sensing grounds your decisions in past experiences and established facts. It helps you maintain traditions and rely on proven methods, providing a stable framework for your practical approach.'},
        {label:'Tertiary', name:'Extraverted Intuition (Ne)', desc:'Your tertiary function occasionally allows you to consider possibilities and alternative perspectives. While less dominant, it helps you explore new ideas or adapt when circumstances require innovation.'},
        {label:'Inferior', name:'Introverted Feeling (Fi)', desc:'Your inferior function governs your internal value system and emotional depth. Under stress, you might struggle to understand or express feelings. Developing this function helps you connect more authentically with yourself and others.'},
      ],
      famous: ['Margaret Thatcher','John D. Rockefeller','Judge Judy Sheindlin','George W. Bush','Sonia Sotomayor','Franklin D. Roosevelt'],
      careers: ['Project Manager','Military Officer','Judge','Police Officer','Business Executive','Accountant','Civil Engineer','Operations Manager','Administrator','Financial Analyst'],
      relationships: {
        overview: 'You approach relationships with a strong sense of commitment and responsibility. You seek partners who value stability, loyalty, and shared practical goals. You tend to be dependable and expect the same reliability from your loved ones.',
        friendships: 'In friendships, you are loyal and supportive but prefer clear boundaries and mutual respect. You enjoy socializing in structured settings and often take the lead in organizing group activities.',
        romantic: 'Romantically, you are straightforward and prefer to express love through actions rather than words. You value honesty and consistency and may sometimes struggle with emotional vulnerability.',
        parenting: 'As a parent, you emphasize discipline, routine, and teaching practical life skills. You strive to instill values of responsibility and hard work, often setting clear expectations for behavior.'
      },
      compatible: ['ISFP \u2014 Complements your structure with warmth and flexibility.','INFP \u2014 Offers emotional depth that balances your practicality.','ISTP \u2014 Shares your preference for action and logical problem-solving.','ESFJ \u2014 Matches your sociability and respect for traditions.'],
      decisionMaking: 'You make decisions by gathering concrete data and evaluating options logically. You prioritize efficiency and effectiveness, aiming for solutions that produce measurable results. You tend to decide quickly once you have sufficient information, preferring closure to ambiguity. Your approach is pragmatic, often focusing on what has worked in the past.',
      learningStyle: 'You learn best through hands-on experience and practical application. You prefer structured learning environments with clear objectives and measurable progress. Repetition and real-world examples help you internalize information effectively.',
      leadership: 'Your leadership style is assertive, organized, and results-driven. You naturally take charge, set clear expectations, and hold others accountable. Your strength lies in creating efficient systems and guiding teams toward common goals. You lead by example, demonstrating reliability and discipline.',
      stress: 'When stressed, you may become overly controlling, rigid, or critical, especially if things feel chaotic or inefficient. You might suppress emotions, leading to internal tension. To recover, you benefit from structured downtime, physical activity, and opportunities to express feelings in safe environments.',
      environment: 'You thrive in environments that are organized, goal-oriented, and where roles and expectations are clearly defined. Settings that reward efficiency, responsibility, and leadership are ideal. You perform best when you have autonomy to implement practical solutions.',
      growth: ['Practice flexibility by exploring alternative viewpoints before making decisions.','Develop emotional awareness to better understand and express your feelings.','Cultivate patience by recognizing that others may work at different paces.','Encourage collaborative leadership by inviting input rather than directing unilaterally.','Explore abstract ideas to expand your strategic thinking beyond immediate facts.','Balance work and relaxation to prevent burnout and sustain long-term effectiveness.'],
      workLife: ['Set clear boundaries between work and personal time to prevent burnout.','Schedule regular downtime and leisure activities to recharge energy.','Delegate tasks to avoid overloading yourself with responsibility.','Practice mindfulness or relaxation techniques to manage stress.','Prioritize relationships and social connections outside of work.','Reflect periodically on your goals to ensure alignment with personal well-being.'],
      habits: ['Plan your day with prioritized to-do lists to maintain focus.','Engage in physical activity to release stress and boost energy.','Set aside time for reflection to connect with your emotions.','Practice clear and direct communication in all interactions.','Review progress regularly to adjust strategies as needed.','Schedule breaks throughout the day to sustain productivity.'],
      motivations: ['Desire for order and structure in life and work.','Commitment to fulfilling responsibilities reliably.','Drive to lead and organize teams effectively.','Need to see tangible results from efforts.','Respect for tradition and proven methods.','Aspiration to be recognized as competent and dependable.'],
      fears: ['Fear of losing control or chaos disrupting plans.','Fear of being seen as incompetent or unreliable.','Fear of inefficiency and wasted effort.','Fear of emotional vulnerability or appearing weak.','Fear of failure to meet obligations or expectations.','Fear of change that threatens established order.'],
    },
  };

  // Default for any type not in db
  var defaults = {
    blurb: 'Your '+type+' personality profile has been prepared by Prof. Filer using AI-powered analysis of your quiz answers and writing style.',
    overview: ['You have a distinctive personality shaped by how you process information, make decisions, and engage with the world around you. Prof. Filer has analyzed your responses to build a comprehensive picture of your unique strengths and growth areas.'],
    characteristics: ['You have a clear and consistent way of engaging with the world.','Your decision-making style reflects your core personality preferences.','You bring unique strengths to both professional and personal relationships.','You have areas of natural comfort and areas where growth awaits.'],
    cognitiveFunctions: [
      {label:'Dominant', name:'Primary Function', desc:'Your dominant cognitive function is the primary lens through which you experience and process the world. It represents your most natural and effortless mode of operating.'},
      {label:'Auxiliary', name:'Supporting Function', desc:'Your auxiliary function provides balance and depth to your personality. It supports your dominant function and helps you interact effectively with others.'},
      {label:'Tertiary', name:'Developing Function', desc:'Your tertiary function is less developed but emerges throughout your life. It adds nuance and flexibility to your personality.'},
      {label:'Inferior', name:'Shadow Function', desc:'Your inferior function often emerges under stress. Developing awareness of it can deepen self-understanding and emotional resilience.'},
    ],
    famous: ['Various world leaders, innovators, and creatives share your personality type.'],
    careers: ['Leadership roles','Strategic management','Consulting','Analysis','Creative work','People-focused professions'],
    relationships: {
      overview: 'In relationships, you bring your unique personality strengths: consistency in your values, genuine care for those close to you, and a distinctive way of showing up for the people who matter.',
      friendships: 'You form meaningful connections with those who appreciate your authentic self. You value quality in friendships and invest deeply in the relationships that matter most to you.',
      romantic: 'In romantic relationships, you seek a partner who understands and complements your personality. You have a distinctive way of expressing love and a clear sense of what you need to feel fulfilled.',
      parenting: 'As a parent, you bring your core personality strengths to raising your children, instilling values that reflect what matters most to you.'
    },
    compatible: ['Types that complement your strengths and balance your growth areas tend to make the best partners.'],
    decisionMaking: 'You make decisions in a way that reflects your core personality type, drawing on your natural strengths while navigating the areas where you continue to grow.',
    learningStyle: 'You learn in ways that align with your personality preferences, gravitating toward approaches that feel natural and effective for how your mind works.',
    leadership: 'Your leadership style reflects your personality type: you lead with your natural strengths while developing the areas that round out your effectiveness as a leader.',
    stress: 'Under stress, your personality type tends toward specific patterns. Recognizing these patterns is the first step to building healthier coping strategies and greater resilience.',
    environment: 'You thrive in environments that align with your natural preferences and allow you to operate from your strengths.',
    growth: ['Develop awareness of your natural blind spots.','Seek feedback from those whose strengths complement yours.','Practice the skills that come less naturally to your type.','Build flexibility into your routines and decision-making.'],
    workLife: ['Set boundaries that protect your energy and relationships.','Schedule time for activities that recharge you.','Delegate tasks that drain you to those better suited for them.','Prioritize both productivity and genuine rest.'],
    habits: ['Start each day with intention and a clear priority.','Build in time for reflection alongside action.','Connect regularly with people who energize you.','End each day acknowledging progress, however small.'],
    motivations: ['Authentic expression of your core values.','Meaningful contribution to your work and relationships.','Continuous growth and self-understanding.','Connection with others on a genuine level.'],
    fears: ['Being misunderstood or not seen for who you truly are.','Losing the things and people that matter most to you.','Stagnation or lack of meaningful progress.','Conflict that threatens your core relationships.'],
  };

  return db[type] || defaults;
}

function retakeQuiz(){ QP='intro';QC=0;QA={};QR='';DOCS=[];RPT={};renderQuiz(); }
function copyReport(){ if(navigator.clipboard) navigator.clipboard.writeText(QR).then(function(){alert('Copied!');}); }
function qsa(id,v){ QA[id]=v; renderQuiz(); }
function qprev(){ if(QC>0){ QC--;renderQuiz(); } }
function qnext(){
  var q=QS[QC];
  if(QA[q.id]===undefined) return;
  if(QC<QS.length-1){ QC++;renderQuiz(); }
  else { QP='docs'; renderQuiz(); }
}

function submitQuiz(){
  QP='loading'; renderQuiz();
  var lines=[];
  for(var i=0;i<QS.length;i++){
    var q=QS[i],a=QA[q.id],at='';
    if(q.t==='r'){ var idx=['A','B','C','D'].indexOf(a); at=idx>=0?q.os[idx]:String(a); }
    else if(q.t==='s'){ at=a+'/10 ('+q.lo+' to '+q.hi+')'; }
    else{ at=a+'/5 stars'; }
    lines.push('Q'+q.id+': '+q.q+'\nAnswer: '+at);
  }
  var docNote = DOCS.length>0?'\n\nDocuments uploaded for writing style analysis: '+DOCS.join(', '):'';
  var prompt = [
    'You are Prof. Filer, a warm, witty, and incisive personality analyst.',
    'Based on these quiz answers, write a personality assessment report.',
    '',
    lines.join('\n\n')+docNote,
    '',
    'Use these EXACT headings verbatim:',
    '',
    '**Your Personality Type**',
    '[4-letter MBTI type e.g. ENTJ] \u2014 [Profile name e.g. The Commander] \u2014 [3-word descriptor e.g. Bold and Strategic]',
    '',
    "**The Prof.'s Reading**",
    '[Write 3 substantial paragraphs. Be specific to THEIR answers, not generic. First paragraph: their energy and social orientation based on Q1, Q7. Second paragraph: how they process information and make decisions based on Q2, Q3, Q6, Q8. Third paragraph: their approach to structure and conflict based on Q4, Q5, Q9, Q10. Be warm, perceptive, occasionally witty.]',
    '',
    '**Your Superpowers**',
    '\u2022 [Name the strength]: [1-2 sentence explanation tied to their specific answers]',
    '\u2022 [Name the strength]: [1-2 sentence explanation tied to their specific answers]',
    '\u2022 [Name the strength]: [1-2 sentence explanation tied to their specific answers]',
    '',
    '**Watch Out For**',
    '\u2022 [Name the blind spot]: [1-2 sentence warm, constructive explanation]',
    '\u2022 [Name the blind spot]: [1-2 sentence warm, constructive explanation]',
    '',
    "**Prof. Filer's Verdict**",
    '[One memorable, quotable sentence that captures this person\'s essence. Make it feel personal and distinctive, not generic.]',
    '',
    'Tone: smart, warm, slightly witty, deeply perceptive. Like a brilliant friend who also happens to be a psychologist. Never generic.',
  ].join('\n');

  fetch('/api/analyze',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'gpt-4o',max_tokens:1400,messages:[{role:'user',content:prompt}]})
  })
  .then(function(res){ return res.json(); })
  .then(function(d){
    if(d.error){ QR='API error: '+(typeof d.error==='string'?d.error:JSON.stringify(d.error)); }
    else{ var blk=d.content&&d.content.find(function(b){return b.type==='text';}); QR=blk?blk.text:'Unable to generate report.'; }
    QP='report'; renderQuiz();
  })
  .catch(function(e){ QR='Connection error: '+e.toString(); QP='report'; renderQuiz(); });
}
