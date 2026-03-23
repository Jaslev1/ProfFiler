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
// Fix 5: flow is now intro → quiz (10 Qs) → docs (upload 3) → loading → report
var QP = 'intro';
var QC = 0;
var QA = {};
var QR = '';
var DOCS = [];

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
  else if (QP === 'docs')    root.innerHTML = tmplDocs();  // Fix 5: docs AFTER questions
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
    for (var i=0; i<q.os.length; i++) {
      var v=String.fromCharCode(65+i), sel=(a===v)?' on':'';
      inp += '<div class="qo'+sel+'" onclick="qsa('+q.id+',\''+v+'\')">';
      inp += '<div class="qrd"><div class="qdot"></div></div>'+q.os[i]+'</div>';
    }
  } else if (q.t==='s') {
    var v2=a||5;
    inp  = '<div style="padding:6px 0 2px"><input type="range" min="1" max="10" value="'+v2+'" step="1"';
    inp += ' oninput="qsa('+q.id+',+this.value);document.getElementById(\'sv'+q.id+'\').textContent=this.value+\'/10\'">';
    inp += '<div class="qsv"><span class="qsl">'+q.lo+'</span><span class="qsval" id="sv'+q.id+'">'+v2+'/10</span><span class="qsl">'+q.hi+'</span></div></div>';
  } else {
    var v3=a||0;
    inp='<div class="qstars">';
    for (var s=1; s<=5; s++) inp += '<button class="qstar'+(s<=v3?' on':'')+'" onclick="qsa('+q.id+','+s+')">&#9733;</button>';
    inp += '</div>';
  }
  var h='<div class="qcard">';
  h += '<div class="qpr"><div class="qpf" style="width:'+pct+'%"></div></div>';
  h += '<div class="qmeta"><span class="qlbl">Question '+(QC+1)+' of '+QS.length+'</span><span class="qlbl">'+pct+'% complete</span></div>';
  h += '<div class="qq">'+q.q+'</div>'+inp;
  h += '<div class="qbtns">';
  if (QC > 0) {
    h += '<button class="qbtn2" onclick="qprev()">&#8592; Back</button>';
  } else {
    h += '<button class="qbtn2" onclick="QP=\'intro\';renderQuiz()">&#8592; Back</button>';
  }
  // Fix 5: last question goes to docs upload, not directly to submit
  h += '<button class="qbtn"'+(hasA?'':' disabled')+' onclick="qnext()">';
  h += last ? 'Upload Documents &#8594;' : 'Next &#8594;';
  h += '</button></div></div>';
  return h;
}

// Fix 5: Document upload comes AFTER the 10 questions
function tmplDocs() {
  var uploaded = DOCS.length;
  var allDone = (uploaded >= 3);

  var dropArea = '';
  if (!allDone) {
    dropArea  = '<div class="doc-drop" onclick="document.getElementById(\'docInput\').click()">';
    dropArea += '<div style="font-size:36px;margin-bottom:10px">&#8679;</div>';
    dropArea += '<strong>'+(uploaded > 0 ? uploaded+' of 3 uploaded \u2014 add '+(3-uploaded)+' more' : 'Click to upload your documents')+'</strong>';
    dropArea += '<p style="font-size:12px;color:#7C7E7D;margin-top:6px">PDF, Word, or text files that reflect your writing style</p>';
    dropArea += '<input type="file" id="docInput" accept=".pdf,.doc,.docx,.txt" multiple style="display:none" onchange="handleDocUpload(this)">';
    dropArea += '</div>';
  } else {
    dropArea  = '<div class="doc-drop doc-drop-done">';
    dropArea += '<div style="font-size:36px;margin-bottom:8px">&#10003;</div>';
    dropArea += '<strong style="color:#22a85a">All documents uploaded!</strong>';
    dropArea += '<p style="font-size:12px;color:#7C7E7D;margin-top:4px">3 of 3 documents uploaded</p>';
    dropArea += '</div>';
  }

  var docList = '';
  for (var i = 0; i < DOCS.length; i++) {
    docList += '<div class="doc-item">';
    docList += '<div class="doc-icon">&#128196;</div>';
    docList += '<div class="doc-name">'+escHtml(DOCS[i])+'</div>';
    docList += '<button class="doc-remove" onclick="removeDoc('+i+')">&#215;</button>';
    docList += '</div>';
  }

  var h = '<div class="qcard">';
  h += '<div style="text-align:center;margin-bottom:20px">';
  h += '<h2 style="font-family:SFOrsonCasual,sans-serif;font-size:22px;color:#2D4C68;text-transform:uppercase;letter-spacing:.05em">Upload Your Documents</h2>';
  h += '<p style="font-size:14px;color:#7C7E7D;margin-top:8px">Share 3 documents that reflect your writing style &mdash; reports, proposals, analyses, prose, etc.</p>';
  h += '</div>';
  h += dropArea;
  if (docList) h += '<div class="doc-list">'+docList+'</div>';
  h += '<div style="font-size:12px;color:#9AAAB8;text-align:center;margin-top:14px;line-height:1.6">All documents remain entirely yours. Processed privately, never stored.</div>';
  h += '<div class="qbtns" style="margin-top:20px">';
  h += '<button class="qbtn2" onclick="QP=\'quiz\';QC=QS.length-1;renderQuiz()">&#8592; Back to Questions</button>';
  h += '<button class="qbtn" '+(allDone?'':'disabled')+' onclick="submitQuiz()">Get My Report &#8594;</button>';
  h += '</div></div>';
  return h;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function handleDocUpload(input) {
  var files = input.files;
  for (var i = 0; i < files.length; i++) {
    if (DOCS.length < 3) DOCS.push(files[i].name);
  }
  renderQuiz();
}
function removeDoc(idx) { DOCS.splice(idx, 1); renderQuiz(); }

function tmplLoad() {
  var h='<div class="qcard" style="text-align:center;padding:38px 28px">';
  h += '<img src="'+M+'" height="58" style="display:inline-block;margin-bottom:12px" alt="">';
  h += '<div style="font-family:GilroyBold,sans-serif;font-size:18px;color:#2D4C68;margin-bottom:6px">Prof. Filer is running the numbers&#8230;</div>';
  h += '<div style="font-size:13px;color:#7C7E7D;margin-bottom:2px">Analysing your responses across 40+ behavioural indicators.</div>';
  h += '<div class="qldots"><div class="qdot2" style="animation-delay:0s"></div><div class="qdot2" style="animation-delay:.2s"></div><div class="qdot2" style="animation-delay:.4s"></div></div>';
  h += '<div style="font-size:11px;color:#9AAAB8">Usually takes 10&#8211;20 seconds</div></div>';
  return h;
}

function tmplReport() {
  // Fix 1: handle API errors with clear message
  var isErr = !QR || QR.indexOf('API error') === 0 || QR.indexOf('Connection error') === 0 || QR.indexOf('error') === 0;
  if (isErr) {
    var h = '<div class="qcard"><div style="text-align:center;padding:20px 0">';
    h += '<div style="font-size:36px;margin-bottom:12px">&#128561;</div>';
    h += '<div style="font-family:GilroyBold,sans-serif;font-size:17px;color:#D12019;margin-bottom:10px">Could not generate report</div>';
    h += '<div style="font-size:13px;color:#7C7E7D;line-height:1.6;margin-bottom:8px">'+escHtml(QR)+'</div>';
    h += '<div style="font-size:12px;color:#9AAAB8;line-height:1.6">Make sure <strong>ANTHROPIC_API_KEY</strong> is set in your Vercel environment variables, then redeploy.</div>';
    h += '</div><div class="qbtns" style="margin-top:20px"><button class="qbtn" onclick="QP=\'docs\';renderQuiz()">Try Again</button></div></div>';
    return h;
  }

  // Parse type line
  var typeMatch = QR.match(/\*\*Your Personality Type\*\*\s*\n([^\n]+)/);
  var typeStr = typeMatch ? typeMatch[1].trim() : '';
  var typeParts = typeStr.split(/\s*[\u2014\-]{1,2}\s*/);
  var typeTitle = typeParts[0] ? typeParts[0].trim() : 'Your Type';
  var typeDesc  = typeParts.slice(1).join(' \u2014 ');

  // Extract free reading section
  var readingMatch = QR.match(/\*\*The Prof\.[\u2019']?s Reading\*\*\s*\n([\s\S]*?)(?=\*\*Your Superpowers|\*\*Watch Out|$)/);
  var freeText = readingMatch ? readingMatch[1].trim() : QR.substring(0, 600);
  var freeHtml = freeText.split('\n').map(function(l){ return l.trim()?'<p>'+l+'</p>':''; }).join('');

  var paywallPreview = '<p><strong>Your Superpowers</strong></p>'
    +'<p>&#8226; Deep analytical thinking and strategic vision</p>'
    +'<p>&#8226; Ability to see patterns others miss</p>'
    +'<p>&#8226; Composed and clear-headed under pressure</p>'
    +'<p><strong>Watch Out For</strong></p>'
    +'<p>&#8226; Tendency to overthink before acting</p>'
    +'<p>&#8226; Can appear detached in emotional situations</p>'
    +'<p><strong>Prof. Filer\'s Verdict</strong></p>'
    +'<p>A rare combination of depth and drive that the world needs more of.</p>';

  var h='<div class="qcard">';
  h += '<div class="qrh"><img src="'+M+'" height="48" alt="Prof. Filer">';
  h += '<div><div style="font-size:10px;color:#7C7E7D;letter-spacing:.1em;text-transform:uppercase">Your AI Analysis Complete</div>';
  h += '<div style="font-family:SFOrsonCasual,sans-serif;font-size:24px;color:#2D4C68;text-transform:uppercase;letter-spacing:.05em">'+typeTitle+'</div>';
  if (typeDesc) h += '<div style="font-size:13px;color:#7C7E7D">'+typeDesc+'</div>';
  h += '</div></div>';
  h += '<div class="rpt-free"><h3>&#10024; Free Personality Snapshot</h3><div class="qrb">'+freeHtml+'</div></div>';
  h += '<div class="rpt-pay"><div class="rpt-pay-blur qrb">'+paywallPreview+'</div>';
  h += '<div class="rpt-pay-overlay"><h3>Unlock Your Full Report</h3>';
  h += '<p>Natural strengths, blind spots, growth zones &amp; Prof. Filer\'s verdict</p>';
  h += '<button class="qbtn" style="width:auto;padding:11px 28px;background:#D12019" onclick="alert(\'Full report purchase coming soon.\')">Download Full Report &#8594;</button>';
  h += '</div></div>';
  h += '<div class="qdisc">Prof. Filer is an independent AI-based personality assessment tool and is not affiliated with or endorsed by the Myers-Briggs Type Indicator&#174; or The Myers-Briggs Company. For informational purposes only.</div>';
  h += '<div class="qbtns" style="margin-top:18px"><button class="qbtn2" onclick="retakeQuiz()">Retake Assessment</button><button class="qbtn2" onclick="copyReport()">Copy Report</button></div>';
  h += '</div>';
  return h;
}

function retakeQuiz() { QP='intro'; QC=0; QA={}; QR=''; DOCS=[]; renderQuiz(); }
function copyReport() { if (navigator.clipboard) navigator.clipboard.writeText(QR).then(function(){ alert('Copied!'); }); }
function qsa(id,v) { QA[id]=v; renderQuiz(); }
function qprev() { if (QC>0) { QC--; renderQuiz(); } }
function qnext() {
  var q=QS[QC];
  if (QA[q.id]===undefined) return;
  if (QC<QS.length-1) { QC++; renderQuiz(); }
  else { QP='docs'; renderQuiz(); }  // Fix 5: go to doc upload after last question
}

function submitQuiz() {
  QP='loading'; renderQuiz();
  var lines=[];
  for (var i=0; i<QS.length; i++) {
    var q=QS[i], a=QA[q.id], at='';
    if (q.t==='r') { var idx=['A','B','C','D'].indexOf(a); at=idx>=0?q.os[idx]:String(a); }
    else if (q.t==='s') { at=a+'/10 ('+q.lo+' to '+q.hi+')'; }
    else { at=a+'/5 stars'; }
    lines.push('Q'+q.id+': '+q.q+'\nAnswer: '+at);
  }
  var docNote = DOCS.length > 0 ? '\n\nDocuments uploaded for analysis: '+DOCS.join(', ') : '';
  var prompt = [
    'You are Prof. Filer, a warm, witty, and incisive personality analyst.',
    'Based on these quiz answers, write a personality assessment report.',
    '',
    lines.join('\n\n') + docNote,
    '',
    'Structure your report using these exact headings:',
    '',
    '**Your Personality Type**',
    '[4-letter MBTI type] \u2014 [Profile name e.g. The Thinker] \u2014 [3-word descriptor]',
    '',
    "**The Prof.'s Reading**",
    '[2-3 paragraphs of warm, intelligent, specific insight. This is the free section shown to the user.]',
    '',
    '**Your Superpowers**',
    '\u2022 [Genuine strength 1]',
    '\u2022 [Genuine strength 2]',
    '\u2022 [Genuine strength 3]',
    '',
    '**Watch Out For**',
    '\u2022 [Blind spot 1, warmly delivered]',
    '\u2022 [Blind spot 2, warmly delivered]',
    '',
    "**Prof. Filer's Verdict**",
    '[One memorable closing sentence.]',
    '',
    'Tone: smart, warm, slightly witty. Like a brilliant friend who also happens to be a psychologist.',
  ].join('\n');

  fetch('/api/analyze', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,messages:[{role:'user',content:prompt}]})
  })
  .then(function(res){ return res.json(); })
  .then(function(d){
    if (d.error) {
      QR = 'API error: ' + (typeof d.error === 'string' ? d.error : JSON.stringify(d.error));
    } else {
      var blk = d.content && d.content.find(function(b){ return b.type==='text'; });
      QR = blk ? blk.text : 'Unable to generate report.';
    }
    QP='report'; renderQuiz();
  })
  .catch(function(e){
    QR = 'Connection error: ' + e.toString();
    QP='report'; renderQuiz();
  });
}
