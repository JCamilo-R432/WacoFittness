---
name: WacoCoach Voice Agent Architecture
description: Architecture decisions and file locations for the WacoCoach AI voice fitness agent
type: project
---

## WacoCoach Voice Agent — Key Implementation Facts

The project is a fitness app (WacoPro Fitness) built with Node.js + Express + TypeScript backend, HTML/CSS/JS vanilla frontend, Prisma ORM with PostgreSQL.

### Voice Architecture (CRITICAL CONSTRAINT)
- **NO external voice APIs**: No Whisper, ElevenLabs, Amazon Polly, Google TTS, Azure
- **STT**: Web Speech API (`SpeechRecognition`) — nativo del navegador, frontend-only
- **TTS**: Web Speech API (`speechSynthesis`) — nativo del navegador, frontend-only
- **LLM**: OpenAI GPT-4o-mini — ONLY for text generation, backend
- **Backend never receives or sends audio — text only**

### New Files Created (Voice Agent)
- `src/utils/calculators.ts` — Pure TS functions: calculateTMB, calculateTDEE, calculateMacros, estimate1RM, calorieTarget
- `src/utils/exerciseLibrary.ts` — Exercise JSON library + searchExercise() function (8 exercises)
- `src/services/routerService.ts` — Hybrid router: detects emergency/calculation/exercise/general intent BEFORE calling LLM
- `src/controllers/aiCoachController.ts` — voiceChat controller: POST /api/ai-coach/chat { text } → { success, text }
- `src/routes/aiCoach.routes.ts` — Route: POST /api/ai-coach/chat (uses authenticate + aiUsageLimit)
- `src/public/css/ai-coach.css` — Mic button states (idle/listening/thinking/speaking) with animations
- `src/public/js/ai-coach.js` — SpeechToText class, TextToSpeech class, VoiceCoach class

### Modified Files
- `src/app.ts` — Added aiCoachRoutes import + app.use('/api/ai-coach', aiCoachRoutes)
- `src/public/ai-coach.html` — Added: link to ai-coach.css, #micBtn, #voiceStatus, #voiceSupportNotice, #liveTranscript, script tag for ai-coach.js

### API Endpoints
- **Existing**: POST /api/ai/chat { message, sessionId, stream } → { response: "..." } (text chat)
- **New**: POST /api/ai-coach/chat { text } → { success: true, text: "...", type: "general|calculation|exercise|emergency" } (voice)

### Voice Session Management
- Voice chat uses sessionId = `voice_${userId}` (auto-generated, no client input needed)
- Max 6 history messages per voice session (3 turns) for speed
- Responses limited to 300 tokens for TTS friendliness

### Hybrid Router Logic (routerService.ts)
1. Emergency keywords → skipLLM=true, direct response
2. Calculation keywords → pre-compute TMB/TDEE/macros/1RM → inject into LLM context
3. Exercise keywords → search library → inject exact technique data into LLM context
4. General → LLM with user context only

**Why:** LLM gets EXACT calculated numbers, not hallucinated values. Router is the heart of the system.

### Dashboard FASE 6 + FASE 7 Hidden (2026-03-28)
Sidebar sections and dashboard banners for FASE 6 and FASE 7 are commented out in src/public/dashboard.html with "TEMPORALLY DISABLED" markers. Code is preserved, not deleted.
