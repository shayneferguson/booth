/* The Record Room · original coolicons Line/Regular SVGs from sound-icons2.
 * Presentation only: original controls, text nodes, handlers and state stay intact.
 */
(() => {
  'use strict';
  const app = document.documentElement.dataset.recordRoom;
  const ids = {
    'undo':'undo','redo':'redo','export-open':'download','commit-open':'save',
    'open-projects':'folder-open','empty-open':'folder-open','mobile-projects':'folder-open',
    'help':'circle-help','use-remote':'folder-open','keep-local':'save','apply-effects':'repeat',
    'reference-toggle':'headphones','clear-solos':'headphones','reset-mix':'rotate-left',
    'master-mute':'volume-off','master-fx':'sparkles','sampler-open':'grid','studio-tools':'settings',
    'audio-import':'upload','track-manage':'playlist','automation-record':'keyframes',
    'arrangement-open':'chapters','automation-toggle':'keyframes','locate-playhead':'pin',
    'clip-split':'scissors','clip-duplicate':'copy','clip-properties':'circle-info',
    'clip-zoom':'zoom-in','clip-warp':'move-horizontal','clip-mute':'volume-off',
    'clip-delete':'trash','clip-reset':'rotate-left','multi-select':'list-checklist',
    'group-clips':'link','ungroup-clips':'link-break','clear-selection':'close',
    'group-move':'move','crossfade-apply':'waveform','automation-add':'list-plus',
    'automation-add-point':'plus','automation-delete-point':'minus','save-version':'save',
    'rewind':'skip-back','play':'play','stop':'stop','loop':'loop','timeline-loop-toggle':'loop','loop-section':'chapters',
    'catalog-clear':'close','rescan':'repeat','arrangement-close':'close',
    'arrangement-intro':'plus','arrangement-outro':'move-horizontal',
    'library-toggle':'menu','song-previous':'skip-back','song-next':'skip-forward',
    'preview':'play','record':'circle','mic-panel-toggle':'microphone',
    'mic-panel-close':'close','connect':'microphone','take-browser-close':'close',
    'add-vocal':'microphone','add-adlibs':'note-plus-corner','quick-adlibs':'note-plus-corner',
    'add-double':'copy','add-harmony':'music-note','publish-layer':'upload',
    'undo-punch':'undo','new-take':'circle','zoom-out':'zoom-out','zoom-in':'zoom-in',
    'zoom-fit':'expand','context-toggle':'playlist','tab-mixer':'equalizer',
    'tab-effects':'sparkles','tab-lyrics':'note-edit','timeline-focus':'waveform',
    'fx-ab':'headphones','floating-stop':'stop','close':'close',
    'tools-button':'settings','clear-search':'close','player-favorite':'heart',
    'player-studio':'equalizer','player-notes':'note-edit','close-player':'close',
    'previous':'skip-back','play-pause':'play','next':'skip-forward',
    'mode-sampler':'play','mode-full':'waveform','close-detail':'close','close-tools':'close',
    'export-notes':'download','export-backup':'save','close-new-list':'close','retry':'repeat',
    'sampler-close':'close','sampler-source-open':'folder-open','sampler-selected-clip':'waveform',
    'sampler-import':'upload','sampler-load':'check','sampler-manual':'scissors',
    'sampler-auto':'sparkles','sampler-split':'scissors','sampler-copy-pad':'copy',
    'sampler-clear-pad':'trash','sampler-play':'play','sampler-record':'circle',
    'sampler-panic':'stop','sampler-undo':'undo','sampler-redo':'redo'
  };
  // Names are deliberately exact or anchored. User song/track/sample names are never inferred.
  const names = new Map();
  const add = (icon, labels) => labels.split('|').forEach(s=>names.set(s.toLowerCase(),icon));
  add('play','Play|Play song|Play / pause mix|With beat|Play previews|Play picks|Play shortlist|Play queue|Sampler|Preview|Hear section');
  add('pause','Pause|Pause song'); add('stop','Stop|Stop pads|Stop recording|Stop take');
  add('circle','Record|Record take|New take on this track');
  add('save','Save|Save to SoundCraft|Save version|Save a version|Create SoundCraft version|Keep this draft');
  add('download','Export|Export audio|Render export|Export playlist|Export notes|Export all notes TXT|Back up curation JSON');
  add('upload','Import audio|Import from Files / LaCie|Publish|Publish take|Publish vocal track|Prepare invitation|Create artist playlist|Create playlist');
  add('folder-open','Open|Open session|Open a session|Resume mix|Load mix|Load saved mix|Load sample|Browse LaCie|Load this window');
  add('equalizer','Mixer|Master|Open in reFIX|reFIX');
  add('waveform','Studio|Arrangement|Timeline|Full beat|Crossfade selection|Use selected clip|Sample tools|Select vocal / FX|Consolidate track clips');
  add('sparkles','FX|Vocal FX|Channel & FX|Add effect|Shared reverb');
  add('settings','Studio tools|Clip|Clip details|Input / Count-in|Manage tracks|Tracks');
  add('grid','Touch sampler / chopper');
  add('keyframes','Automation|Record moves|Record automation|Add lane|Read');
  add('note-edit','Notes|Lyrics|Export notes|Curate current beat');
  add('note-plus-corner','Add note at playhead|Ad-libs');
  add('history','Versions'); add('scissors','Split|Split at cursor|Split at playhead|Manual|Add warp marker');
  add('move-horizontal','Warp|Warp / stretch|Extend outro'); add('move','Move clip|Move selection');
  add('copy','Copy|Duplicate|Copy invitation|Copy playlist link|Copy to empty pad|Double');
  add('link','Link clips|Group selected tracks|Groups & shared effects'); add('link-break','Unlink');
  add('playlist','Project lanes|Tracks|Artist playlist · choose several beats|Queue full pack');
  add('list-plus','Queue|New shortlist|Create shortlist|Create a shortlist|Create a new shortlist|Add current session');
  add('headphones','Listen & mix check|Original mix|Vocal only|Clear solos|Solo|A/B · Hear dry|A/B · Hear FX|A · Current mix|B · Original reference');
  add('volume-off','Mute|Mute clip'); add('volume-high','Unmute|Unmute clip');
  add('rotate-left','Reset|Reset mix|Reset tone|Reset master tone|Reset timing|Reset held meter|Restore channel audio|Original colour');
  add('repeat','Try again|Retry now|Refresh library|Retry live audio');
  add('undo','Undo|Undo last edit'); add('redo','Redo'); add('expand','Fit|Focus timeline');
  add('check','Apply|Apply clip changes|Apply warp|Use take on this track|Keep');
  add('close','Close|Cancel|Clear|Clear selection|Pass'); add('circle','No decision'); add('circle-help','Maybe');
  add('trash','Remove|Delete|Delete point|Clear pad|Clear queue');
  add('chevron-left','All packs|All shortlists|Previous files'); add('chevron-up','Parent folder');
  add('chevron-down','More files|More results|Load more sessions');
  add('plus','Add|Audio track|Vocal|Add blank intro|Point at playhead');
  add('power','On|Off|Enable|Bypass'); add('microphone','Enable microphone|Booth'); add('microphone-off','Turn mic off');
  add('music-note','Harmony'); add('heart','Favorite');
  add('waveform','Sample tools · reverse / pitch / consolidate');
  add('palette','Track colour');
  const friendly = {'▶':'Play','▷':'Play','Ⅱ':'Pause','❚❚':'Pause','⏸':'Pause','■':'Stop','×':'Close','✕':'Close','+':'Add','＋':'Add','−':'Decrease','-':'Decrease','↑':'Move up','↓':'Move down','←':'Move left','→':'Move right','↶':'Undo','↷':'Redo','↺':'Reset','⌄':'Collapse panel','☰':'Menu','•••':'More options','♡':'Favorite','♥':'Favorite','☆':'Star take','★':'Star take','✓':'Mark complete','○':'Mark incomplete','M':'Mute','S':'Solo'};
  const glyph = {'▶':'play','▷':'play','Ⅱ':'pause','❚❚':'pause','⏸':'pause','■':'stop','×':'close','✕':'close','+':'plus','＋':'plus','−':'minus','-':'minus','↑':'chevron-up','↓':'chevron-down','←':'chevron-left','→':'chevron-right','↶':'undo','↷':'redo','↺':'rotate-left','⌄':'chevron-down','☰':'menu','•••':'more-horizontal','♡':'heart','♥':'heart','☆':'star','★':'star','✓':'check','○':'circle','M':'volume-off','S':'headphones'};
  const excluded = '.project-item,.channel-title,.lane-label,.clip-adjust-handle,.sampler-pad,.sampler-trim,.track-pick,.booth-track-header,.cover,.card-name,.beat-name,.list-card,.current-title,.note-time,.library-shade,#take-backdrop,#master-details';
  const state = new WeakMap();
  const clean = text => text.replace(/^[\s▶▷●＋+↶↷↺←→↑↓♡♥★☆]+/u,'').replace(/\s*[↗⌄]$/u,'').replace(/\s+/g,' ').trim();
  function identify(b, text) {
    if(b.matches(excluded)||b.closest('.ruler,.beat-ruler,.section-band,.sections-band,.section-ruler,.timeline-lane'))return null;
    let icon=ids[b.id], value='';
    if(b.matches('.library-toggle'))icon='menu';
    if(b.matches('.transport-options'))icon='headphones';
    if(b.matches('.focus-arrangement'))icon='expand';
    if(b.matches('.dock-collapse'))icon='chevron-down';
    if(b.matches('.nav-item'))icon={library:'grid',picks:'heart',lists:'playlist',queue:'list-plus'}[b.dataset.view];
    if(b.dataset.tab)icon={mixer:'equalizer',arrange:'waveform',notes:'note-edit',versions:'history'}[b.dataset.tab];
    if(b.dataset.dock)icon={clip:'waveform',fx:'sparkles',automation:'keyframes'}[b.dataset.dock]||icon;
    if(b.matches('.studio-open'))icon='equalizer';
    if(b.matches('.note-check'))icon=text==='✓'?'check':'circle';
    if(b.matches('.note-delete,.fx-close'))icon='close';
    if(b.id?.endsWith('-reset'))icon='rotate-left';
    if(b.id?.startsWith('sampler-equal-')){icon='scissors';value=b.id.split('-').pop();}
    if(b.matches('.rating-buttons button:not(.clear-rating),.star'))icon='star';
    if(!icon)icon=glyph[text]||names.get(clean(text).toLowerCase());
    if(!icon && /^(mono|metronome|follow):?\s*[·:]?\s*(on|off)$/i.test(clean(text)))icon=/metronome/i.test(text)?'music-note':/follow/i.test(text)?'move':'headphones';
    if(!icon && /^(MP3|WAV)\s*·/.test(text))icon='download';
    if(!icon && /^(Reverse clip|Pitch-shift clip|Consolidate)/i.test(text))icon=/reverse/i.test(text)?'flip-horizontal':/pitch/i.test(text)?'music-note':'link';
    if(!icon && /^Render, analyze/.test(text))icon='equalizer';
    if(!icon && /^(\d+\/\d+|\d+\s*bars?) sync$/i.test(text))return null; // Keep musical values readable.
    if(!icon)icon=state.get(b)?.icon; // Busy text keeps the action's identity.
    if(!icon)return null;
    if(['play','play-pause','preview','sampler-play'].includes(b.id))icon=/pause|Ⅱ|ⅱ|❚❚|⏸/i.test(text)?'pause':'play';
    if(b.id==='connect')icon=/off/i.test(text)?'microphone-off':'microphone';
    if(/^(stop|finish)/i.test(clean(text))&&['record','sampler-record','automation-record'].includes(b.id))icon='stop';
    if(icon==='heart' && (b.getAttribute('aria-pressed')==='true'||/^♥/.test(text)))icon='heart-filled';
    return {icon,value};
  }
  const faces=new WeakMap();
  const appClasses=value=>(value||'').split(/\s+/).filter(c=>c&&!c.startsWith('rr-')).sort().join(' ');
  function compact(b,value) {
    const key=[appClasses(b.className),b.getAttribute('aria-pressed'),b.getAttribute('aria-selected'),b.disabled].join('|');
    if(faces.get(b)!==key){
      b.classList.remove('rr-compact');
      const c=getComputedStyle(b);
      b.style.setProperty('--rr-face-fill',c.backgroundColor);
      b.style.setProperty('--rr-face-border',c.borderTopWidth+' '+c.borderTopStyle+' '+c.borderTopColor);
      b.style.setProperty('--rr-face-radius',c.borderTopLeftRadius);
      b.classList.add('rr-compact');faces.set(b,key);
    }
    const space=value?value.length*7+5:0;
    if(b.style.getPropertyValue('--rr-badge-space')!==space+'px')b.style.setProperty('--rr-badge-space',space+'px');
    let badge=b.querySelector('.rr-icon-value');
    if(value){if(!badge){badge=document.createElement('span');badge.className='rr-icon-value';badge.setAttribute('aria-hidden','true');b.append(badge);}if(badge.dataset.value!==value)badge.dataset.value=value;}
    else if(badge)badge.remove();
  }
  function decorate(b) {
    const text=b.textContent.trim(), found=identify(b,text);if(!found)return;
    const old=state.get(b), aria=b.getAttribute('aria-label'), title=b.getAttribute('title');
    const explicitAria=aria && (!old?.managedAria || aria!==old.label);
    const explicitTitle=title && (!old?.managedTitle || title!==old.label);
    let label=(explicitAria?aria:explicitTitle?title:friendly[text]||text).replace(/\s+/g,' ').trim();
    if(b.matches('.nav-item'))label=({library:'Library',picks:'Picks',lists:'Shortlists',queue:'Queue'}[b.dataset.view]||label)+' · '+(b.querySelector('.nav-count')?.textContent||'0');
    if(!label)return;
    b.classList.add('rr-icon-button');
    if(b.dataset.rrIcon!==found.icon){b.dataset.rrIcon=found.icon;b.style.setProperty('--rr-icon',`url("/icons/sound/${found.icon}.svg")`);}
    if(b.dataset.rrLabel!==label)b.dataset.rrLabel=label;
    if(b.dataset.rrValue!==found.value)b.dataset.rrValue=found.value;
    if(aria!==label)b.setAttribute('aria-label',label);
    if(title!==label)b.title=label;
    state.set(b,{...found,label,managedAria:!explicitAria,managedTitle:!explicitTitle});
    compact(b,found.value);
  }
  const pending=new Set();let queued=false;
  function queue(node) {
    if(node.nodeType===3)node=node.parentElement;
    if(!node?.closest)return;
    const b=node.closest('button');if(b)pending.add(b);
    node.querySelectorAll?.('button').forEach(x=>pending.add(x));
    if(!queued&&pending.size){queued=true;queueMicrotask(()=>{queued=false;for(const b of pending)if(b.isConnected)decorate(b);pending.clear();});}
  }
  function init() {
    document.body.classList.add('rr-icon-ui');
    document.querySelectorAll('button').forEach(decorate);
    new MutationObserver(records=>{for(const r of records){if(r.type==='attributes'&&r.attributeName==='class'&&appClasses(r.oldValue)===appClasses(r.target.className))continue;if(r.type==='childList'){if(r.target.closest?.('button'))queue(r.target);r.addedNodes.forEach(queue);}else queue(r.target);}})
      .observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeOldValue:true,attributeFilter:['class','disabled','aria-selected','aria-label','aria-pressed','title','data-tab','data-dock','data-view']});
    const tip=document.createElement('div');tip.id='rr-icon-tooltip';tip.role='tooltip';tip.hidden=true;document.body.append(tip);
    let owner=null,timer=0,press=null,suppress=null;
    const hide=()=>{tip.hidden=true;owner=null;};
    const show=b=>{if(!b?.isConnected)return;const host=b.closest('dialog[open]')||document.body;if(tip.parentElement!==host)host.append(tip);tip.textContent=b.dataset.rrLabel;tip.hidden=false;owner=b;const r=b.getBoundingClientRect(),v=window.visualViewport,top=v?.offsetTop||0,w=v?.width||innerWidth,h=v?.height||innerHeight;const t=tip.getBoundingClientRect();tip.style.left=Math.max(8,Math.min(w-t.width-8,r.left+r.width/2-t.width/2))+'px';tip.style.top=Math.max(top+8,Math.min(top+h-t.height-8,r.top-t.height-18))+'px';};
    const target=e=>e.target.closest?.('button.rr-icon-button');
    document.addEventListener('pointerover',e=>{if(e.pointerType==='mouse')show(target(e));});
    document.addEventListener('pointerout',e=>{if(owner&&!owner.contains(e.relatedTarget))hide();});
    document.addEventListener('focusin',e=>{const b=target(e);if(b?.matches(':focus-visible'))show(b);});
    document.addEventListener('focusout',hide);
    document.addEventListener('pointerdown',e=>{clearTimeout(timer);hide();const b=target(e);if(!b||e.pointerType==='mouse'||e.isPrimary===false)return;press={b,id:e.pointerId,x:e.clientX,y:e.clientY,shown:false};timer=setTimeout(()=>{if(press){press.shown=true;show(b);}},500);},{passive:true});
    document.addEventListener('pointermove',e=>{if(press&&e.pointerId===press.id&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>10){clearTimeout(timer);press=null;hide();}},{passive:true});
    document.addEventListener('pointerup',e=>{if(!press||press.id!==e.pointerId)return;clearTimeout(timer);if(press.shown){suppress={b:press.b,until:performance.now()+900};e.preventDefault();setTimeout(hide,1800);}press=null;},true);
    document.addEventListener('pointercancel',()=>{clearTimeout(timer);press=null;hide();},{passive:true});
    document.addEventListener('click',e=>{if(suppress&&performance.now()<suppress.until&&target(e)===suppress.b){e.preventDefault();e.stopImmediatePropagation();suppress=null;}else hide();},true);
    document.addEventListener('contextmenu',e=>{if(target(e)){e.preventDefault();show(target(e));}});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
    document.addEventListener('scroll',hide,true);window.addEventListener('resize',hide);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
