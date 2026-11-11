import {beginDrag} from './touch-workspace.js?v=2.5';
// Layout preferences are local to this device; audio and session data are untouched.
const $ = id => document.getElementById(id);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const PANELS = [
  ['arrange', 'Timeline', 320, 420],
  ['mixer', 'Mixer', 280, 340],
  ['effects', 'Vocal FX', 260, 360],
  ['lyrics', 'Lyrics', 180, 300]
];
export class WorkspaceScroll {
  constructor(layout) {
    this.layout = layout;
    layout.scrollWorkspace = this;
    document.documentElement.classList.add('booth-scroll-layout');
    document.body.classList.add('scrollable-workspace');
    this.workspace = document.querySelector('.workspace');
    this.nav = document.querySelector('.dock-tabs');
    
    const pane = document.createElement('div'); pane.className = 'workspace-pane';
    this.workspace.before(pane);
    this.scroller = document.createElement('div');
    this.scroller.id = 'workspace-scroll';
    this.scroller.setAttribute('aria-label', 'Scrollable Booth workspace');
    pane.append(this.scroller); this.scroller.append(this.workspace); pane.append(this.nav);
    this.collapsed = new Set();
    try { this.collapsed = new Set(JSON.parse(localStorage.getItem("booth-collapsed-panels") || "[]").filter(x=>["mixer","effects","lyrics"].includes(x))); } catch {}
    this.rail = document.createElement('div'); this.rail.id = 'workspace-scrollbar';
    this.rail.tabIndex = 0;
    for (const [key,value] of Object.entries({role:'scrollbar','aria-controls':'workspace-scroll','aria-orientation':'vertical','aria-label':'Workspace vertical scroll','aria-valuemin':'0'})) this.rail.setAttribute(key,value);
    this.rail.title = 'Drag to scroll the whole workspace';
    this.thumb = document.createElement('div'); this.thumb.className = 'workspace-scroll-thumb';
    this.thumb.append(document.createElement('span')); this.rail.append(this.thumb); pane.append(this.rail);
    this.grips = [];
    for (const [name,label,min,initial] of PANELS) {
      const target = $(name+'-panel');
      let saved = initial;
      try { const value = Number(localStorage.getItem('booth-panel-height:'+name)); if (value >= min && value <= 1400) saved = value; } catch {}
      document.body.style.setProperty('--booth-'+name+'-height',saved+'px');
      const grip = document.createElement('div'); grip.className = 'pane-resizer'; grip.id = name+'-resizer'; grip.tabIndex = 0;
      for (const [key,value] of Object.entries({role:'separator','aria-orientation':'horizontal','aria-controls':target.id,'aria-label':'Resize '+label,'aria-valuemin':String(min),'aria-valuemax':'1400'})) grip.setAttribute(key,value);
      grip.title = 'Drag down to make '+label.toLowerCase()+' taller. Arrow keys resize; double-tap resets.';
      const dots=document.createElement('span'); dots.className='resize-dots';dots.textContent='•••';dots.setAttribute('aria-hidden','true');
      const title=document.createElement('span');title.className='resize-label';title.textContent=label+' height';
      const value=document.createElement('span');value.className='resize-value';
      grip.append(dots,title,value);target.after(grip);this.grips.push({grip,target,name,value});
      if(name!=="arrange"){const close=document.createElement("button");close.type="button";close.className="panel-collapse";close.textContent="⌄";close.setAttribute("aria-label","Collapse "+label);close.title="Collapse "+label+" to bottom bar";close.onclick=()=>this.setCollapsed(name,true);close.onpointerdown=e=>e.stopPropagation();(target.querySelector('.panel-bar,.lyrics-heading')||target).append(close);}
      const set=(height,save=false)=>{if(name==='arrange')this.layout.focusTimeline(false,false);height=Math.round(clamp(height,min,1400));document.body.style.setProperty('--booth-'+name+'-height',height+'px');if(save)try{localStorage.setItem('booth-panel-height:'+name,String(height));}catch{}this.queue();};
      grip.addEventListener('pointerdown',event=>{
        const original=target.getBoundingClientRect().height,y=event.clientY,scroll=this.scroller.scrollTop;let height=original;
        const started=beginDrag(grip,event,e=>{height=original+e.clientY-y+this.scroller.scrollTop-scroll;set(height);},()=>{grip.classList.remove('resizing');set(height,true);});
        if(started)grip.classList.add('resizing');
      });
      grip.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();set(e.key==='Home'?min:e.key==='End'?1400:target.getBoundingClientRect().height+(e.key==='ArrowDown'?1:-1)*(e.shiftKey?10:40),true);});
      grip.addEventListener('dblclick',()=>set(initial,true));
    }
    this.scroller.addEventListener('scroll',()=>this.queue(),{passive:true});
    this.rail.addEventListener('pointerdown',event=>{
      if(event.button!==0||event.isPrimary===false||!this.range)return;
      if(!this.thumb.contains(event.target)){event.preventDefault();const box=this.rail.getBoundingClientRect();this.scroller.scrollTop=clamp((event.clientY-box.top-this.thumbHeight/2)/Math.max(1,this.travel),0,1)*this.range;this.queue();return;}
      const y=event.clientY,start=this.scroller.scrollTop,ratio=this.range/Math.max(1,this.travel);
      beginDrag(this.rail,event,e=>{this.scroller.scrollTop=start+(e.clientY-y)*ratio;this.queue();});
    });
    this.rail.addEventListener('keydown',e=>{const moves={ArrowDown:60,ArrowUp:-60,PageDown:this.scroller.clientHeight*.8,PageUp:-this.scroller.clientHeight*.8};if(e.key in moves){e.preventDefault();this.scroller.scrollTop+=moves[e.key];}else if(e.key==='Home'||e.key==='End'){e.preventDefault();this.scroller.scrollTop=e.key==='Home'?0:this.range;}this.queue();});
    this.observer=new ResizeObserver(()=>this.queue());this.observer.observe(this.scroller);this.observer.observe(this.workspace);
    this.layout.tabs.forEach(tab=>{tab.onclick=()=>{const name=tab.dataset.dock;this.setCollapsed(name,!this.collapsed.has(name));if(!this.collapsed.has(name))this.reveal(name);};});
    $('timeline-focus').onclick=()=>{const collapse=this.collapsed.size!==3;for(const name of ['mixer','effects','lyrics'])this.setCollapsed(name,collapse);this.scroller.scrollTop=0;};
    this.applyCollapsed();
    window.addEventListener('resize',()=>this.queue());window.visualViewport?.addEventListener('resize',()=>this.queue());this.queue();
  }
  setCollapsed(name,collapse){
    if(!['mixer','effects','lyrics'].includes(name))return;
    if(collapse)this.collapsed.add(name);else this.collapsed.delete(name);
    try{localStorage.setItem('booth-collapsed-panels',JSON.stringify([...this.collapsed]));}catch{}
    this.applyCollapsed();
  }
  applyCollapsed(){
    for(const name of ['mixer','effects','lyrics']){
      const collapsed=this.collapsed.has(name);document.body.classList.toggle('collapsed-'+name,collapsed);
      const tab=this.layout.tabs.find(t=>t.dataset.dock===name);tab.setAttribute('aria-expanded',String(!collapsed));tab.title=(collapsed?'Open ':'Collapse ')+(name==='effects'?'Vocal FX':name);
    }
    document.body.classList.toggle('dock-collapsed',this.collapsed.size===3);
    document.body.classList.remove('timeline-focused');
    $('timeline-focus').setAttribute('aria-pressed',String(this.collapsed.size===3));
    $('timeline-focus').setAttribute('aria-label',this.collapsed.size===3?'Restore mixer and effects':'Collapse all panels');
    $('timeline-focus').textContent=this.collapsed.size===3?'↑ Panels':'↓ Hide panels';
    this.queue();
  }
  reveal(name) {
    if(this.collapsed.has(name))this.setCollapsed(name,false);
    const target=$(name+'-panel');if(!target)return;
    this.scroller.scrollTop+=target.getBoundingClientRect().top-this.scroller.getBoundingClientRect().top;
    this.queue();
  }
  queue(){if(this.frame)return;this.frame=requestAnimationFrame(()=>{this.frame=0;this.update();});}
  update(){
    const s=this.scroller,r=this.rail;
    const focus=Math.max(320,s.clientHeight);
    if(this.focusHeight!==focus){this.focusHeight=focus;document.body.style.setProperty('--booth-focus-height',focus+'px');}
    this.range=Math.max(0,s.scrollHeight-s.clientHeight);
    this.thumbHeight=Math.min(r.clientHeight,Math.max(64,r.clientHeight*s.clientHeight/Math.max(1,s.scrollHeight)));
    this.travel=Math.max(0,r.clientHeight-this.thumbHeight);
    this.thumb.style.height=this.thumbHeight+'px';this.thumb.style.transform=`translateY(${this.range?s.scrollTop/this.range*this.travel:0}px)`;
    r.setAttribute('aria-valuemax',String(Math.round(this.range)));r.setAttribute('aria-valuenow',String(Math.round(s.scrollTop)));r.setAttribute('aria-valuetext',this.range?Math.round(s.scrollTop/this.range*100)+'% through workspace':'Whole workspace visible');r.classList.toggle('no-overflow',this.range===0);
    for(const {grip,target,value} of this.grips){const height=Math.round(target.getBoundingClientRect().height);grip.setAttribute('aria-valuenow',String(height));value.textContent=height+' px';}
    const line=s.getBoundingClientRect().top+20;
    let current='arrange';
    for(const {target,name} of this.grips)if(!this.collapsed.has(name)&&target.getBoundingClientRect().top<=line)current=name;
    
    this.layout.tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.dock===current)));
  }
}
