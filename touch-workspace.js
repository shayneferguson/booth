document.body.classList.add("booth-touch-layout");
// Browser magnification is separate from the arrangement's Zoom control.
for (const type of ['gesturestart', 'gesturechange', 'dblclick']) {
  document.addEventListener(type, event => {
    if (document.body.classList.contains('booth-touch-layout')) event.preventDefault();
  }, {passive: false});
}

// Delegation survives the first tap opening FX and rebuilding the header.
export function bindTrackDoubleTap(container, onDoubleTap) {
  let press = null, last = null, ignoreClick = null;
  const header = event => event.target.closest('.booth-track-header[data-track]');
  const key = button => button?.closest('[data-track]')?.dataset.track;
  container.addEventListener('pointerdown', event => {
    const button = header(event);
    if (press || event.isPrimary === false) { press = null; last = null; return; }
    if (!button || event.button !== 0) { last = null; return; }
    press = {id: event.pointerId, key: key(button), x: event.clientX, y: event.clientY, at: event.timeStamp};
  });
  container.addEventListener('pointermove', event => {
    if (press?.id === event.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 9) {
      press = null; last = null;
    }
  });
  container.addEventListener('pointercancel', () => { press = null; last = null; });
  container.addEventListener('pointerup', event => {
    if (!press || press.id !== event.pointerId) return;
    const tap = press; press = null;
    if (key(header(event)) !== tap.key || event.timeStamp - tap.at > 350 || Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > 9) {
      last = null; return;
    }
    if (last && last.key === tap.key && event.timeStamp - last.at <= 350 && Math.hypot(tap.x - last.x, tap.y - last.y) <= 28) {
      event.preventDefault();
      ignoreClick = {key: tap.key, until: event.timeStamp + 500};
      last = null;
      onDoubleTap(tap.key);
    } else last = {...tap, at: event.timeStamp};
  });
  container.addEventListener('click', event => {
    if (event.detail > 0 && ignoreClick?.key === key(header(event)) && event.timeStamp <= ignoreClick.until) {
      event.preventDefault(); event.stopPropagation(); ignoreClick = null;
    }
  }, true);
  container.addEventListener('dblclick', event => {
    if (header(event)) { event.preventDefault(); event.stopPropagation(); }
  });
}

// Only a completed tap can seek. Touch scrolling, cancelled and secondary pointers cannot.
export function bindTimelineTap(element, tap) {
 let press=null,suppress=0;
 element.addEventListener('pointerdown',e=>{if(e.button!==0||e.isPrimary===false){press=null;return;}press={id:e.pointerId,x:e.clientX,y:e.clientY};});
 element.addEventListener('pointermove',e=>{if(press?.id===e.pointerId&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>9){press=null;suppress=performance.now()+700;}});
 element.addEventListener('pointercancel',()=>{press=null;suppress=performance.now()+700;});
 element.addEventListener('pointerup',e=>{if(press?.id!==e.pointerId)return;press=null;suppress=performance.now()+700;tap(e);});
 element.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(e.detail===0&&performance.now()>suppress)tap(e);});
}
const drags=new WeakMap();
export function beginDrag(element,event,move,finish=()=>{}){
 if(event.button!==0||event.isPrimary===false||drags.has(element))return false;
 event.preventDefault();event.stopPropagation();const id=event.pointerId;drags.set(element,id);element.setPointerCapture(id);
 const step=e=>{if(e.pointerId!==id)return;e.preventDefault();e.stopPropagation();move(e);};
 const end=e=>{if(e.pointerId!==id||!drags.has(element))return;e.stopPropagation();drags.delete(element);element.removeEventListener('pointermove',step);for(const type of ['pointerup','pointercancel','lostpointercapture'])element.removeEventListener(type,end);if(element.hasPointerCapture(id))element.releasePointerCapture(id);finish(e);};
 element.addEventListener('pointermove',step);for(const type of ['pointerup','pointercancel','lostpointercapture'])element.addEventListener(type,end);return true;
}
export class TrackHeaders {
 constructor(workspace){
  this.workspace=workspace;this.drawerOpen=false;this.expanded=new Map();this.scroll=document.getElementById('timeline-scroll');
  const area=document.createElement('div');area.className='booth-timeline-area';this.scroll.before(area);area.append(this.scroll);
  this.rail=document.createElement('div');this.rail.className='booth-track-headers';this.rail.setAttribute('aria-label','Timeline track headers');area.append(this.rail);
  this.scroll.addEventListener('scroll',()=>{if(this.rail.scrollTop!==this.scroll.scrollTop)this.rail.scrollTop=this.scroll.scrollTop;},{passive:true});
  this.rail.addEventListener('scroll',()=>{if(this.scroll.scrollTop!==this.rail.scrollTop)this.scroll.scrollTop=this.rail.scrollTop;},{passive:true});
  bindTrackDoubleTap(this.rail,key=>this.expand(key,!this.expanded.get(key)));
 }
 expand(key,open){this.expanded.set(key,open);this.refreshHeights();}
 refreshHeights(){
  const rows=[...document.querySelectorAll('#timeline-lanes .timeline-lane')];
  for(const row of rows){const key=row.dataset.laneKey,open=!!this.expanded.get(key);row.style.height=open?'148px':'';const button=[...this.rail.querySelectorAll('.booth-track-header')].find(b=>b.dataset.track===key);if(!button)continue;button.style.height=row.getBoundingClientRect().height+'px';button.setAttribute('aria-expanded',String(open));button.querySelector('.track-height-indicator').textContent=open?'⌄':'›';}
 }
 render(){
  const top=this.rail.scrollTop;this.rail.replaceChildren();const spacer=document.createElement('div');spacer.className='booth-header-spacer';const toggle=document.createElement('button');toggle.type='button';toggle.textContent=this.drawerOpen?'›':'‹';toggle.setAttribute('aria-label',this.drawerOpen?'Close track controls':'Open track controls');toggle.setAttribute('aria-expanded',String(this.drawerOpen));toggle.onclick=()=>{this.drawerOpen=!this.drawerOpen;this.render();};spacer.append(toggle);this.rail.classList.toggle('drawer-open',this.drawerOpen);this.rail.append(spacer);
  for(const row of document.querySelectorAll('#timeline-lanes .timeline-lane')){
   const key=row.dataset.laneKey,button=document.createElement('button');button.type='button';button.className='booth-track-header';button.dataset.track=key;button.classList.toggle('vocal',key.startsWith('vocal:'));button.classList.toggle('selected',row.classList.contains('layer-selected'));button.classList.toggle('recording',row.classList.contains('active-record'));
   const name=document.createElement('span');name.textContent=row.querySelector('.lane-title').textContent;const icon=document.createElement('span');icon.className='track-height-indicator';button.append(name,icon);button.title='Double-tap to expand or collapse track. Arrow Right/Left also resize.';button.setAttribute('aria-label',name.textContent+' track height');
   button.onclick=()=>{this.drawerOpen=true;this.rail.classList.add('drawer-open');const c=this.workspace.c;if(key.startsWith('vocal:')&&!c.recording()&&!c.publishing()&&c.layer()?.id!==key.slice(6))c.selectLayer(key.slice(6));this.render();};
   button.onkeydown=e=>{if(!['ArrowRight','ArrowLeft'].includes(e.key))return;e.preventDefault();this.expand(key,e.key==='ArrowRight');};const wrap=document.createElement('div');wrap.className='booth-track-drawer-row';wrap.append(button);button.dataset.short=key.startsWith('vocal:')?String([...document.querySelectorAll('#timeline-lanes .timeline-lane')].filter(r=>r.dataset.laneKey.startsWith('vocal:')).indexOf(row)+1):'B';if(key.startsWith('vocal:')){const layer=this.workspace.c.layers().find(l=>l.id===key.slice(6));const controls=document.createElement('div');controls.className='booth-drawer-controls';for(const [field,label] of [['mute','Mute'],['solo','Solo']]){const control=document.createElement('button');control.type='button';control.textContent=label;control.setAttribute('aria-label',label+' '+name.textContent);control.setAttribute('aria-pressed',String(!!layer?.[field]));control.onclick=()=>{this.workspace.c.toggleLayer(key.slice(6),field);this.render();};controls.append(control);}wrap.append(controls);}this.rail.append(wrap);
  }
  const foot=document.createElement('div');foot.style.height='20px';this.rail.append(foot);this.refreshHeights();this.rail.scrollTop=top;
 }
}
