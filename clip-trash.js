// Remove arrangement clips, never source recordings. Short taps still select.
export class ClipTrash {
 constructor(c){
  this.c=c;this.state=null;this.suppressUntil=0;
  this.bin=document.createElement('div');this.bin.id='clip-trash';this.bin.hidden=true;this.bin.setAttribute('role','status');
  const icon=document.createElement('img');icon.src='/icons/sound/trash.svg';icon.alt='';this.label=document.createElement('span');this.bin.append(icon,this.label);
  this.ghost=document.createElement('div');this.ghost.id='clip-ghost';this.ghost.hidden=true;this.ghost.setAttribute('aria-hidden','true');
  this.undo=document.createElement('div');this.undo.id='clip-undo';this.undo.hidden=true;this.undo.setAttribute('role','status');
  this.undoText=document.createElement('span');this.undoText.textContent='Clip removed · original kept';
  const undo=document.createElement('button');undo.textContent='Undo';undo.onclick=async()=>{if(!this.last)return;try{if(await c.undoClip(this.last.layer,this.last.revision))this.undo.hidden=true;}catch(e){c.message(e.message);}};
  const dismiss=document.createElement('button');dismiss.textContent='×';dismiss.setAttribute('aria-label','Dismiss clip undo');dismiss.onclick=()=>{this.undo.hidden=true;};this.undo.append(this.undoText,undo,dismiss);
  document.body.append(this.bin,this.ghost,this.undo);
  document.addEventListener('pointerdown',e=>{if(this.state&&e.pointerId!==this.state.id)this.cancel();},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')this.cancel();});
  window.addEventListener('blur',()=>this.cancel());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.cancel();});
 }
 bind(clip,layer,id,name,locked){
  if(locked)return;
  clip.title='Hold, then drag up to the bin to remove this clip. Original take is kept. Keyboard: Delete.';
  clip.addEventListener('contextmenu',e=>e.preventDefault());
  clip.addEventListener('click',e=>{if(performance.now()<this.suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
  clip.addEventListener('keydown',e=>{if(['Delete','Backspace'].includes(e.key)){e.preventDefault();e.stopPropagation();this.remove(layer,id);}});
  clip.addEventListener('pointerdown',e=>{
   if(this.state||e.button!==0||e.isPrimary===false||this.c.editBlocked())return;
   const scroll=document.getElementById('timeline-scroll'), workspace=document.getElementById('workspace-scroll');
   const s={clip,layer,clipId:id,name,id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,active:false,scrolling:false};this.state=s;
   s.move=e=>{if(e.pointerId!==s.id)return;if(!s.active){if(Math.hypot(e.clientX-s.x,e.clientY-s.y)>10){clearTimeout(s.timer);s.scrolling=true;}if(s.scrolling){e.preventDefault();scroll.scrollLeft+=s.lastX-e.clientX;const target=scroll.scrollHeight>scroll.clientHeight+1?scroll:workspace;target.scrollTop+=s.lastY-e.clientY;s.lastX=e.clientX;s.lastY=e.clientY;}return;}e.preventDefault();e.stopPropagation();this.position(e.clientX,e.clientY);};
   s.end=e=>{if(e.pointerId!==s.id)return;const drop=s.active&&e.type==='pointerup'&&this.inside(e.clientX,e.clientY);const active=s.active||s.scrolling;this.cancel();if(active){e.preventDefault();e.stopPropagation();}if(drop)this.remove(layer,id);};
   clip.setPointerCapture(e.pointerId);
   clip.addEventListener('pointermove',s.move);for(const type of ['pointerup','pointercancel','lostpointercapture'])clip.addEventListener(type,s.end);
   s.timer=setTimeout(()=>{if(this.state!==s||this.c.editBlocked()||!clip.isConnected){this.cancel();return;}s.active=true;this.suppressUntil=performance.now()+1000;clip.classList.add('clip-lifted');this.bin.hidden=false;this.ghost.hidden=false;this.ghost.textContent=name;this.position(s.x,s.y);},420);
  });
 }
 inside(x,y){const r=this.bin.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
 position(x,y){this.ghost.style.left=x+'px';this.ghost.style.top=y+'px';const ready=this.inside(x,y);this.bin.classList.toggle('drop-ready',ready);this.label.textContent=ready?'Release to remove clip':'Drag here to remove clip';}
 cancel(){const s=this.state;if(!s)return;this.state=null;clearTimeout(s.timer);if(s.active||s.scrolling)this.suppressUntil=performance.now()+700;s.clip.classList.remove('clip-lifted');s.clip.removeEventListener('pointermove',s.move);for(const type of ['pointerup','pointercancel','lostpointercapture'])s.clip.removeEventListener(type,s.end);if(s.clip.hasPointerCapture(s.id))s.clip.releasePointerCapture(s.id);this.bin.hidden=true;this.ghost.hidden=true;}
 async remove(layer,id){if(this.c.editBlocked())return;try{const l=await this.c.removeClip(layer,id);if(!l)return;this.last={layer:l.id,revision:l.revision};this.undo.hidden=false;}catch(e){this.c.message('Could not remove clip: '+e.message);}}
}
