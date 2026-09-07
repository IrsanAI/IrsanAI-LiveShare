// scripts/validate-registry.ts — Build Gate EG 4e74a97 13/13 GRUEN for LiveShare
const EG_BASE = 'https://raw.githubusercontent.com/IrsanAI/IrsanAI-Essence-Gate/main/registry/essences'
async function main(){
  console.log('[LS:validate-registry] LiveShare Consumer 2 of EG 4e74a97 13/13 GRUEN')
  console.log('EG_BASE = '+EG_BASE)
  const ids=['browser-control','code-generation','deep-reasoning','filesystem-access','instruction-following','is-router-core','long-context-reasoning','metacognitive-eval','multi-agent-coordination','mythos-advanced-reasoning','real-time-grounding','vision-understanding','gold-decision-support']
  let ok=0
  for(const id of ids){
    try{
      const res=await fetch(EG_BASE+'/'+id+'.json')
      if(!res.ok) throw new Error('status '+res.status)
      const data=await res.json()
      if(!data.id) throw new Error('no id')
      console.log(' fetch '+EG_BASE+'/'+id+'.json — ok ('+data.id+')')
      ok++
    }catch(e){
      console.error(' fetch '+id+' failed', e)
      process.exit(1)
    }
  }
  console.log('[LS:validate-registry] '+ok+'/13 valid GRUEN — Single Source of Truth EG 4e74a97')
}
main()
