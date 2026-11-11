import * as store from './storage.js';
const $=id=>document.getElementById(id);
export class ArtistPlaylist{
 constructor(c){this.c=c;this.data=null;this.counts={};$('song-select').onchange=()=>this.choose($('song-select').value);$('song-previous').onclick=()=>this.move(-1);$('song-next').onclick=()=>this.move(1);}
 set(data){this.data=data;document.body.classList.toggle('has-playlist',!!data);$('song-switcher').hidden=!data;if(data){$('playlist-title').textContent=data.name;$('playlist-artist').textContent=data.artist;}this.sync();this.refreshCounts();}
 sync(){if(!this.data)return;const songs=this.data.songs,index=songs.findIndex(s=>s.id===this.c.song()),select=$('song-select'),blocked=this.c.blocked();select.replaceChildren(...songs.map((s,i)=>{const count=this.counts[s.id]||0;return new Option(`${i+1}. ${s.name} · ${s.bpm} BPM${count?' · '+count+(count===1?' take':' takes'):''}`,s.id);}));select.value=this.c.song();select.disabled=blocked;$('song-previous').disabled=blocked||index<=0;$('song-next').disabled=blocked||index<0||index>=songs.length-1;$('song-position').textContent=index>=0?`${index+1} / ${songs.length}`:`${songs.length} songs`;}
 async refreshCounts(){if(!this.data)return;try{const takes=await store.all();this.counts={};for(const t of takes)if(t.blob)this.counts[t.session]=(this.counts[t.session]||0)+1;this.sync();}catch{}}
 async choose(id){if(this.c.blocked())return this.sync();try{await this.c.open(id);}catch(e){this.c.message(e.message);}finally{this.sync();}}
 move(step){const i=this.data?.songs.findIndex(s=>s.id===this.c.song()),next=this.data?.songs[i+step];if(next)this.choose(next.id);}
}
