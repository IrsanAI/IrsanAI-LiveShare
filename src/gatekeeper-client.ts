// src/gatekeeper-client.ts — LiveShare Consumer 2 of EG 4e74a97 13/13 GRUEN
const EG_BASE = 'https://raw.githubusercontent.com/IrsanAI/IrsanAI-Essence-Gate/main/registry/essences'
export async function fetchEGRegistry(){
  const ids=['browser-control','code-generation','deep-reasoning','filesystem-access','instruction-following','is-router-core','long-context-reasoning','metacognitive-eval','multi-agent-coordination','mythos-advanced-reasoning','real-time-grounding','vision-understanding','gold-decision-support']
  const results=await Promise.all(ids.map(async id=>{const res=await fetch(EG_BASE+'/'+id+'.json'); if(!res.ok) throw new Error('Failed fetch '+id); return res.json()}))
  return results
}
export async function gatekeep(essenceGuess){
  const registry=await fetchEGRegistry()
  let best=null; let bestScore=0
  for(const e of registry){
    let s=0; const g=essenceGuess.toLowerCase(); const id=e.id.toLowerCase()
    if(g.includes(id)||id.includes(g)) s+=0.5
    if((e.tags||[]).join(' ').toLowerCase().includes(g)) s+=0.2
    if(['multi-agent-coordination','browser-control','real-time-grounding'].includes(id)) if(g.includes('cockpit')||g.includes('coord')) s+=0.15
    if(s>bestScore){bestScore=s; best=e}
  }
  if(best&&bestScore>=0.8) return {guess:essenceGuess,matched:best,similarity:bestScore,gate:'4e74a97 13/13 GRUEN',action:'MATCH'}
  return {guess:essenceGuess,matched:best,similarity:bestScore,gate:'4e74a97 13/13 GRUEN',action:'ELICIT',elicitorPrompt:'Was ist Essence deines Ziels?'}
}
const guess=process.argv[2]?.replace('--guess','')||process.argv[3]||'coordinate cockpit'
gatekeep(guess).then(r=>{console.log('EG Gate: '+r.gate); console.log('Guess: '+r.guess); console.log('Best: '+(r.matched?.id||'none')+' '+r.similarity.toFixed(2)); console.log('Action: '+r.action); console.log('Registry: 13 fetched')})
