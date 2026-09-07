AI_COLLABORATION.md - IrsanAI-LiveShare-3-Patches-2 - Single Source of Truth for AI Handoff
Kein lokales IS_INITIAL mehr noetig. Diese Datei + docs/METHODIC.md sind das Handoff. Online im Repo.
Session Start Routine: git log --oneline -10, head -n 40 packages/is-core/src/index.ts 2>/dev/null, npx tsx scripts/validate-registry.ts --verbose 2>/dev/null, npx tsx scripts/validate-cockpits.ts --verbose, cat docs/METHODIC.md, cat docs/AI_COLLABORATION.md, ls -lh docs/, ls -lh /storage/emulated/0/Download/cockpits/
Produkt = 8 Klassen aus IS 0ce8220: ModelRegistry, EssenceLibrary, LoadoutManager, TaskClassifier, LoadoutRouter, PerformanceTracker, SelfAnalyzer, SelfOptimizer
Fuer LiveShare: Essenzen multi-agent-coordination + browser-control + real-time-grounding, Cockpits 2 HTMLs, Patches 3
OODA + DAD: Observe head 40 + validate EG 13/13 + validate cockpits 2 + 3 patches, Orient 8-Klassen Check, Decide TaskClassifier -> gatekeep vs EG 13 -> >=0.8 Match else Elicitor, Act RouteResult + 3 patches
Regel: LS baut nie direkt Essences. LS ruft immer EG gatekeep(essenceGuess)
