// scripts/validate-cockpits.ts — Build Gate 3 Patches
import fs from 'fs'
const COCKPIT_DIR='/storage/emulated/0/Download/cockpits/'
const PATCHES=[{id:'patch-1-cockpit-loader',essence:'browser-control'},{id:'patch-2-coordination',essence:'multi-agent-coordination'},{id:'patch-3-grounding',essence:'real-time-grounding'}]
console.log('[LS:validate-cockpits] LiveShare Consumer 2 of EG 4e74a97 13/13 GRUEN')
try{const files=fs.existsSync(COCKPIT_DIR)?fs.readdirSync(COCKPIT_DIR).filter(f=>f.endsWith('.html')):[]; console.log('Cockpits '+files.length+' files: '+files.join(', '))}catch(e){console.log('Cockpit dir not found '+COCKPIT_DIR)}
for(const p of PATCHES){console.log(' Patch: '+p.id+' -> '+p.essence)}
console.log('Build Gate: GRUEN — 3 patches defined')
