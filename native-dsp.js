// SoundCraft v0.12.1 DSP, compiled from the unmodified MIT/Apache source.
// See /soundcraft-dsp-LICENSE.txt and Native/ for source and reproducible build.
const IDS=['eq_1band','eq_7band','compressor','expander_gate','de_esser','maximizer','channel_strip','room_reverb','plate_reverb','mod_delay','chorus','flanger','phaser','saturator','lofi','rectifier','pitch_shifter','gain','trim','invert','dc_offset_removal'];
export class NativeDSP {
 static async load(catalog){const r=await fetch('/soundcraft-dsp.wasm?v=2.3');if(!r.ok)throw Error('Could not load the live audio engine. Reload Studio.');const {instance}=await WebAssembly.instantiate(await r.arrayBuffer(),{});return new NativeDSP(instance.exports,catalog);}
 constructor(api,catalog){this.api=api;this.catalog=catalog;this.params=new Map(catalog.map(p=>[p.id,{index:IDS.indexOf(p.id),params:p.params}]));}
 create(plugin,channels=2){const meta=this.params.get(plugin);if(!meta||meta.index<0)throw Error('Live processor unavailable: '+plugin);const handle=this.api.sc_create(meta.index,this.rate,channels);if(!handle)throw Error('The live effects rack is full. Remove an effect and retry.');return {handle,plugin,values:{},meta};}
 update(instance,params){for(const [index,p] of instance.meta.params.entries()){const v=params[p.id]??p.default;if(instance.values[p.id]!==v){this.api.sc_set(instance.handle,index,v);instance.values[p.id]=v;}}}
 process(instance,left,right,n){const a=this.api,lp=a.sc_buffer(instance.handle,0),rp=a.sc_buffer(instance.handle,1),l=new Float32Array(a.memory.buffer,lp,n),r=new Float32Array(a.memory.buffer,rp,n);l.set(left.subarray(0,n));r.set(right.subarray(0,n));a.sc_process(instance.handle,n);left.set(l,0);right.set(r,0);}
 free(instance){this.api.sc_free(instance.handle);}
}
export const toneParams=eq=>({input_gain:0,hpf_on:Number((eq.hp>20||eq._auto_hp)),hpf_freq:eq.hp||20,hpf_slope:1,low_shelf_freq:120,low_shelf_gain:eq.low||0,low_shelf_q:.707,low_mid_freq:250,low_mid_gain:0,low_mid_q:1,mid_freq:1200,mid_gain:eq.mid||0,mid_q:.8,high_mid_freq:4000,high_mid_gain:0,high_mid_q:1,high_shelf_freq:6000,high_shelf_gain:eq.high||0,high_shelf_q:.707,lpf_on:Number(((eq.lp??20000)<20000||eq._auto_lp)),lpf_freq:eq.lp??20000,lpf_slope:1,output_gain:0});
export class NativeRack {
 constructor(dsp,channels=2){this.dsp=dsp;this.channels=channels;this.instances=new Map();this.chain=[];this.latency=0;}
 set(settings){const eq=settings.eq||{},list=[];if(eq._auto_tone||eq.low||eq.mid||eq.high||(eq.hp>20||eq._auto_hp)||((eq.lp??20000)<20000||eq._auto_lp))list.push({id:'__tone',plugin:'eq_7band',params:toneParams(eq),bypass:false});list.push(...(settings.effects||[]));const keep=new Set(list.map(f=>f.id));for(const [id,instance] of this.instances)if(!keep.has(id)){this.dsp.free(instance);this.instances.delete(id);}this.chain=[];this.latency=0;for(const fx of list){let instance=this.instances.get(fx.id);if(instance&&instance.plugin!==fx.plugin){this.dsp.free(instance);this.instances.delete(fx.id);instance=null;}if(!instance){instance=this.dsp.create(fx.plugin,this.channels);this.instances.set(fx.id,instance);}this.dsp.update(instance,fx.params);if(!fx.bypass){this.chain.push(instance);this.latency+=this.dsp.api.sc_latency(instance.handle);}}}
 process(left,right,n){for(const instance of this.chain)this.dsp.process(instance,left,right,n);}
 reset(){for(const instance of this.instances.values())this.dsp.api.sc_reset(instance.handle);}
 dispose(){for(const instance of this.instances.values())this.dsp.free(instance);this.instances.clear();this.chain=[];}
}
export class AlignmentDelay {
 constructor(rate){this.size=Math.ceil(rate*.5)+2048;this.left=new Float32Array(this.size);this.right=new Float32Array(this.size);this.cursor=0;this.delay=0;this.old=0;this.fade=0;this.fadeLength=Math.ceil(rate*.01);}
 set(delay){delay=Math.max(0,Math.min(this.size-1,delay));if(delay!==this.delay){this.old=this.delay;this.delay=delay;this.fade=this.fadeLength;}}
 process(left,right,n){const size=this.size;for(let i=0;i<n;i++){const at=this.cursor;this.left[at]=left[i];this.right[at]=right[i];const read=(at-this.delay+size)%size;let l=this.left[read],r=this.right[read];if(this.fade){const old=(at-this.old+size)%size,t=1-this.fade/this.fadeLength;l=this.left[old]*(1-t)+l*t;r=this.right[old]*(1-t)+r*t;this.fade--;}left[i]=l;right[i]=r;this.cursor=(at+1)%size;}}
 reset(){this.left.fill(0);this.right.fill(0);this.cursor=0;this.old=this.delay;this.fade=0;}
}
