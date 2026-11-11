class BoothCapture extends AudioWorkletProcessor {
 constructor(){super();this.recording=false;this.chunk=new Float32Array(8192);this.used=0;this.count=0;this.port.onmessage=e=>{const m=e.data;if(m.type==='start'){this.begin=m.frame;this.end=m.end;this.count=0;this.used=0;this.recording=true;}if(m.type==='stop'&&this.recording)this.finish();};}
 flush(){if(this.used){const a=this.chunk.slice(0,this.used);this.port.postMessage({type:'chunk',data:a,count:this.count},[a.buffer]);this.used=0;}}
 finish(){this.flush();this.recording=false;this.port.postMessage({type:'done',frames:this.count});}
 process(inputs,outputs){const a=inputs[0]?.[0];if(a&&this.recording){for(let i=0;i<a.length;i++){const f=currentFrame+i;if(f<this.begin)continue;if(f>=this.end){this.finish();break;}this.chunk[this.used++]=a[i];this.count++;if(this.used===this.chunk.length)this.flush();}}return true;}
}
registerProcessor('booth-capture',BoothCapture);
