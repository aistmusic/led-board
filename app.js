const FONT = {
  " ":[0,0,0],"!":[0,23,0],".":[0,16,0],",":[0,16,8],":":[0,10,0],"-":[4,4,4],"+":[4,14,4],"*":[10,4,10],"/":[16,8,4,2,1],"•":[0,4,0],
  "0":[14,17,17,17,14],"1":[0,9,31,1,0],"2":[9,21,21,21,9],"3":[17,21,21,21,10],"4":[4,12,4,31,4],"5":[29,21,21,21,18],"6":[14,21,21,21,2],"7":[16,16,19,20,24],"8":[10,21,21,21,10],"9":[8,21,21,21,14],
  A:[15,20,20,20,15],B:[31,21,21,21,10],C:[14,17,17,17,10],D:[31,17,17,17,14],E:[31,21,21,21,17],F:[31,20,20,20,16],G:[14,17,17,21,6],H:[31,4,4,4,31],I:[17,17,31,17,17],J:[2,1,1,1,30],K:[31,4,10,17,0],L:[31,1,1,1,1],M:[31,8,4,8,31],N:[31,8,4,2,31],O:[14,17,17,17,14],P:[31,20,20,20,8],Q:[14,17,19,18,13],R:[31,20,22,21,8],S:[9,21,21,21,18],T:[16,16,31,16,16],U:[30,1,1,1,30],V:[28,2,1,2,28],W:[31,2,4,2,31],X:[17,10,4,10,17],Y:[16,8,7,8,16],Z:[17,19,21,25,17],
  "Ą":[15,20,20,21,14],"Ć":[14,17,21,17,10],"Ę":[31,21,21,21,18],"Ł":[31,3,5,1,1],"Ń":[31,8,5,2,31],"Ó":[14,17,21,17,14],"Ś":[9,21,23,21,18],"Ź":[17,19,23,25,17],"Ż":[17,19,21,25,17]
};
const canvas=document.getElementById("led");const ctx=canvas.getContext("2d");const msgEl=document.getElementById("msg");const speedEl=document.getElementById("speed");const colorEl=document.getElementById("color");
let offset=0,last=0,text=msgEl.value,running=true;
function glyph(ch){const u=ch.toUpperCase();return FONT[u]||FONT[ch]||[31,17,17,17,31];}
function textWidth(str){let w=0;for(const ch of str)w+=glyph(ch).length+1;return w+8;}
function resize(){const wrap=canvas.parentElement;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.floor(wrap.clientWidth*dpr);canvas.height=Math.floor(Math.max(140,wrap.clientHeight)*dpr);}
function draw(){const w=canvas.width,h=canvas.height;ctx.fillStyle="#000";ctx.fillRect(0,0,w,h);const rows=7,gap=2,cell=Math.max(4,Math.floor((h-16)/(rows+1))),cols=Math.floor((w-8)/cell),ox=Math.floor((w-cols*cell)/2),oy=Math.floor((h-rows*cell)/2),color=colorEl.value||"#ff2a2a";ctx.fillStyle="#1a0707";for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){ctx.beginPath();ctx.arc(ox+x*cell+cell/2,oy+y*cell+cell/2,cell/2-gap,0,Math.PI*2);ctx.fill();}ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=cell;let col=0;const doubled=text+"   "+text;for(const ch of doubled){const g=glyph(ch);for(let gx=0;gx<g.length;gx++){const boardX=col+gx-Math.floor(offset);if(boardX<0||boardX>=cols)continue;const bits=g[gx];for(let gy=0;gy<rows;gy++){if(bits&(1<<(rows-1-gy))){ctx.beginPath();ctx.arc(ox+boardX*cell+cell/2,oy+gy*cell+cell/2,cell/2-gap,0,Math.PI*2);ctx.fill();}}}col+=g.length+1;}ctx.shadowBlur=0;return textWidth(text);}
function tick(t){requestAnimationFrame(tick);if(!running){draw();return;}const dt=Math.min(40,t-last);last=t;offset+=(Number(speedEl.value)*dt)/1000;const loopW=Math.max(1,textWidth(text)+3);if(offset>loopW)offset-=loopW;draw();}
document.getElementById("form").addEventListener("submit",e=>{e.preventDefault();text=(msgEl.value||" ").toUpperCase();offset=0;running=true;try{localStorage.setItem("led-text",msgEl.value);}catch{}});
document.getElementById("fs").addEventListener("click",async()=>{const el=document.documentElement;if(!document.fullscreenElement)await el.requestFullscreen?.();else await document.exitFullscreen?.();});
try{const saved=localStorage.getItem("led-text");if(saved){msgEl.value=saved;text=saved.toUpperCase();}}catch{}
window.addEventListener("resize",resize);resize();requestAnimationFrame(tick);
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
