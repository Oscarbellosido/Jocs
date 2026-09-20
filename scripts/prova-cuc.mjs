// Comprova que els laberints del Nibbler siguin justos.
//
//   node scripts/prova-cuc.mjs
//
// Dues coses:
//  1. cap racó tancat: si et plantes davant d'una paret, has de poder girar
//  2. quantes caselles pots recórrer, com a molt, sense poder girar enlloc:
//     com més llarg sigui això, més t'has d'avançar a pensar
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const h=readFileSync(resolve(dirname(fileURLToPath(import.meta.url)),'..','nibbler.html'),'utf8');
const m=h.match(/const LABERINTS=\[([\s\S]*?)\n\];/)[1];
const labs=[...m.matchAll(/`([^`]+)`/g)].map(x=>x[1].trim().split('\n'));
const DIRS=[[0,-1],[0,1],[-1,0],[1,0]];
let mal=0;
labs.forEach((L,i)=>{
  const lliure=(f,c)=>L[f]!==undefined&&L[f][c]!==undefined&&L[f][c]!=='#';
  const tancats=[];let lliures=0,punts=0;
  // quantes caselles seguides pots avançar SENSE cap sortida pels costats
  let passadísMésCec=0, onEstà='';
  for(let f=0;f<L.length;f++)for(let c=0;c<L[f].length;c++){
    if(!lliure(f,c))continue;
    lliures++;if(L[f][c]==='.')punts++;
    for(const [dc,df] of DIRS){
      if(!lliure(f+df,c+dc))continue;       // no pots ni arrencar cap allà
      let x=c,y=f,cec=0;
      for(let n=0;n<30;n++){
        const nx=x+dc,ny=y+df;
        const potGirar=DIRS.some(([qc,qf])=>(qc!==dc||qf!==df)&&(qc!==-dc||qf!==-df)&&lliure(y+qf,x+qc));
        if(potGirar)cec=0; else cec++;
        if(!lliure(ny,nx)){                  // paret al davant
          if(!potGirar)tancats.push(`(${c},${f})→${dc},${df}`);
          break;
        }
        if(cec>passadísMésCec){passadísMésCec=cec;onEstà=`(${x},${y})`}
        x=nx;y=ny;
      }
    }
  }
  let start=null;
  for(let f=0;f<L.length&&!start;f++)for(let c=0;c<L[f].length;c++)if(lliure(f,c)){start=[f,c];break}
  const vist=new Set([start.join(',')]),cua=[start];
  while(cua.length){const [f,c]=cua.pop();
    for(const [dc,df] of DIRS){const nf=f+df,nc=c+dc,k=nf+','+nc;
      if(lliure(nf,nc)&&!vist.has(k)){vist.add(k);cua.push([nf,nc])}}}
  const ok=tancats.length===0&&vist.size===lliures&&passadísMésCec<=2;
  if(!ok)mal++;
  console.log(`${ok?'✓':'✗'} laberint ${i+1}: ${lliures} caselles, ${punts} punts, `+
    (vist.size===lliures?'tot connectat':'AMB ZONES TANCADES')+
    `, racons tancats: ${tancats.length}`+
    `, com a molt ${passadísMésCec} caselles seguides sense poder girar ${passadísMésCec?onEstà:''}`);
});
console.log(mal?`\n${mal} laberints per revisar`:`\nels ${labs.length} laberints, justos`);
process.exit(mal?1:0);
