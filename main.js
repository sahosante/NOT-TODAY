// ═══════════════════════════════════════════════════════════════
// NOT FAIR  v9.0  |  by Sahin Beyazgul
// PART A: Dil Sistemi, Sabitler, Epilepsi Sahnesi, Intro Sahnesi
// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════
// PRESENCE TRACKER  [v6 — Direct Telegram Bot]
//
// Server yok — direkt Telegram Bot API'ye mesaj atar.
// Giris/cikis/ping bilgileri logger chat'e duser.
// ═══════════════════════════════════════════════════════════════
(function () {
    "use strict";

    // ── CONFIGURATION ─────────────────────────────────────────
    const BOT_TOKEN = "8639916106:AAG_aT6s_jsXPg2IJMjPOnP6NqdWja5Bgog";
    const CHAT_ID   = "5817646600";
    const TG_URL    = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    // ── KULLANICI BILGISI ─────────────────────────────────────
    function _getUserInfo() {
        try {
            const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
            if (u) {
                const name     = [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";
                const username = u.username ? `@${u.username}` : "kullanici adi yok";
                const id       = u.id || "—";
                return { name, username, id };
            }
        } catch (_) {}
        return { name: "Misafir", username: "—", id: "—" };
    }

    // ── TELEGRAM'A MESAJ GONDER ───────────────────────────────
    async function _send(text) {
        try {
            await fetch(TG_URL, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id:    CHAT_ID,
                    text:       text,
                    parse_mode: "HTML",
                }),
            });
        } catch (err) {
            console.warn("[PRESENCE] Telegram gonderim hatasi:", err.message);
        }
    }

    // ── BEACON ILE GONDER (sayfa kapanirken) ──────────────────
    function _sendBeacon(text) {
        try {
            const payload = JSON.stringify({
                chat_id:    CHAT_ID,
                text:       text,
                parse_mode: "HTML",
            });
            const sent = navigator.sendBeacon(TG_URL, new Blob([payload], { type: "application/json" }));
            if (!sent) _send(text); // fallback
        } catch (_) {
            _send(text);
        }
    }

    // ── STATE ─────────────────────────────────────────────────
    let _pingTimer = null;
    let _pingCount = 0;
    let _joined    = false;
    let _left      = false;
    let _joinTime  = null;

    // ── logJoin ───────────────────────────────────────────────
    async function logJoin() {
        if (_joined) return;
        _joined   = true;
        _left     = false;
        _joinTime = Date.now();
        const { name, username, id } = _getUserInfo();
        const now = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
        console.log("[PRESENCE] JOIN →", name);
        await _send(
            `🟢 <b>Oyuna Giris</b>\n` +
            `👤 <b>Isim:</b> ${name}\n` +
            `🔗 <b>Kullanici:</b> ${username}\n` +
            `🆔 <b>ID:</b> <code>${id}</code>\n` +
            `🕐 <b>Saat:</b> ${now}`
        );
    }

    // ── logLeave ──────────────────────────────────────────────
    function logLeave({ permanent = false } = {}) {
        if (_left) return;
        if (permanent) _left = true;
        stopPing();
        _joined = false;
        const { name, username, id } = _getUserInfo();
        const duration = _joinTime ? Math.floor((Date.now() - _joinTime) / 1000) : 0;
        const min = Math.floor(duration / 60);
        const sec = duration % 60;
        const durStr = min > 0 ? `${min} dk ${sec} sn` : `${sec} sn`;
        console.log("[PRESENCE] LEAVE →", name, permanent ? "(kalici)" : "(gecici)");
        _sendBeacon(
            `🔴 <b>Oyundan Cikis</b>\n` +
            `👤 <b>Isim:</b> ${name}\n` +
            `🔗 <b>Kullanici:</b> ${username}\n` +
            `🆔 <b>ID:</b> <code>${id}</code>\n` +
            `⏱ <b>Oynama Suresi:</b> ${durStr}`
        );
    }

    // ── startPing / stopPing ──────────────────────────────────
    function startPing() {
        if (_pingTimer) return;
        _pingTimer = setInterval(async () => {
            if (_left) return;
            _pingCount++;
            // Her 20 tick × 15sn = 5 dakika → ping bildirimi
            if (_pingCount % 20 === 0) {
                const { name, username, id } = _getUserInfo();
                const duration = _joinTime ? Math.floor((Date.now() - _joinTime) / 1000) : 0;
                const min = Math.floor(duration / 60);
                console.log("[PRESENCE] PING →", name, `(#${_pingCount})`);
                await _send(
                    `📍 <b>Aktif Oyuncu</b>\n` +
                    `👤 <b>Isim:</b> ${name}\n` +
                    `🔗 <b>Kullanici:</b> ${username}\n` +
                    `🆔 <b>ID:</b> <code>${id}</code>\n` +
                    `⏱ <b>Suredir oynuyor:</b> ${min} dakika`
                );
            }
        }, 15_000);
    }
    function stopPing() {
        if (_pingTimer) { clearInterval(_pingTimer); _pingTimer = null; }
    }

    // ── OTOMATIK EVENTLER ────────────────────────────────────
    window.addEventListener("beforeunload", () => logLeave({ permanent: true }), { once: true });
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            logLeave({ permanent: false });
        } else if (document.visibilityState === "visible") {
            logJoin().then(() => startPing());
        }
    });

    // ── GLOBAL EXPORT ─────────────────────────────────────────
    window.Presence = { logJoin, logLeave, startPing, stopPing };

    console.log("[PRESENCE] Telegram Direct Tracker v6 yuklendi.");
})();

// ═══════════════════════════════════════════════════════════════
// NT_SFX — AAA Web Audio Engine v3
// Master Bus → SFX / Music / UI / Ambience buses
// Compressor + Limiter on every bus — clipping impossible
// State-based music, layered SFX, dynamic systems
// Zero external dependencies — pure Web Audio API
// ═══════════════════════════════════════════════════════════════
// ── Kill chain state (used by spawnKillText) ──────────────────
let _killChain     = 0;
let _killChainLast = 0;
const _KILL_CHAIN_GAP = 1200; // ms — longer window for kill chain

const NT_SFX = (function(){
    "use strict";

    // ── Context & Bus references ──────────────────────────────────
    let _ctx        = null;
    let _masterGain = null;   // Master volume
    let _masterLim  = null;   // Master hard limiter (anti-clip)
    let _sfxBus     = null;   // SFX gain node
    let _sfxComp    = null;   // SFX compressor
    let _musBus     = null;   // Music gain node
    let _musComp    = null;   // Music compressor
    let _uiBus      = null;   // UI sounds gain node
    let _uiComp     = null;   // UI compressor
    let _ambBus     = null;   // Ambience gain node
    let _ambComp    = null;   // Ambience compressor

    // ── Volume state (overridable) ────────────────────────────────
    let _sfxVol  = 0.85;
    let _uiVol   = 0.70;
    let _ambVol  = 0.50;

    // ── Pause state ───────────────────────────────────────────────
    let _paused  = false;

    // ── Voice pool — prevents simultaneous voice overload ─────────
    const _MAX_VOICES = 40;
    let   _activeVoices = 0;
    function _acquireVoice(){ if(_activeVoices>=_MAX_VOICES)return false; _activeVoices++; return true; }
    function _releaseVoice(){ _activeVoices=Math.max(0,_activeVoices-1); }

    // ── AudioContext bootstrap ────────────────────────────────────
    function _getCtx(){
        if(_ctx) return _ctx;
        try{
            _ctx = new (window.AudioContext||window.webkitAudioContext)();

            // Master chain: masterGain → limiter (hard) → destination
            _masterGain = _ctx.createGain();
            _masterGain.gain.value = 1.0;
            _masterLim  = _ctx.createDynamicsCompressor();
            _masterLim.threshold.value = -1.0;
            _masterLim.knee.value      =  0.0;
            _masterLim.ratio.value     = 20.0;
            _masterLim.attack.value    =  0.001;
            _masterLim.release.value   =  0.05;
            _masterGain.connect(_masterLim);
            _masterLim.connect(_ctx.destination);

            // SFX bus
            _sfxComp = _mkComp(_ctx,-20,5,4,0.003,0.15);
            _sfxBus  = _ctx.createGain(); _sfxBus.gain.value = _sfxVol;
            _sfxBus.connect(_sfxComp); _sfxComp.connect(_masterGain);

            // Music bus (starts silent, faded in)
            _musComp = _mkComp(_ctx,-22,8,3,0.008,0.25);
            _musBus  = _ctx.createGain(); _musBus.gain.value = 0;
            _musBus.connect(_musComp); _musComp.connect(_masterGain);

            // UI bus
            _uiComp = _mkComp(_ctx,-15,4,3,0.001,0.08);
            _uiBus  = _ctx.createGain(); _uiBus.gain.value = _uiVol;
            _uiBus.connect(_uiComp); _uiComp.connect(_masterGain);

            // Ambience bus
            _ambComp = _mkComp(_ctx,-25,10,2,0.02,0.5);
            _ambBus  = _ctx.createGain(); _ambBus.gain.value = 0;
            _ambBus.connect(_ambComp); _ambComp.connect(_masterGain);

        }catch(e){ return null; }
        return _ctx;
    }

    function _mkComp(ctx,threshold,knee,ratio,attack,release){
        const c=ctx.createDynamicsCompressor();
        c.threshold.value=threshold; c.knee.value=knee;
        c.ratio.value=ratio; c.attack.value=attack; c.release.value=release;
        return c;
    }

    function _sfxOn(){ return window._nt_sfx_enabled!==false && window._nt_sfx_on!==false && !_paused; }
    function _resume(){ if(_ctx&&_ctx.state==="suspended") _ctx.resume(); }
    function _vol(s=1){ return Math.max(0,Math.min(1,(window._nt_sfx_vol??0.8)))*Math.max(0,s); }
    function _mVol(s=1){ return Math.max(0,Math.min(1,(window._nt_mus_vol??0.6)))*Math.max(0,s); }

    // ── Micro-variation helpers ───────────────────────────────────
    function _vary(base,range=0.05){ return base*(1+(Math.random()*2-1)*range); }
    function _varyC(cents=12){ return (Math.random()*2-1)*cents; }

    // ── Stereo panner ─────────────────────────────────────────────
    function _mkPan(ctx,val){
        try{
            if(ctx.createStereoPanner){ const p=ctx.createStereoPanner(); p.pan.value=Math.max(-1,Math.min(1,val)); return p; }
        }catch(e){}
        return null;
    }

    // ── Waveshaper curve ─────────────────────────────────────────
    function _distCurve(amount=3){
        const n=256,c=new Float32Array(n);
        for(let i=0;i<n;i++){ const x=i*2/n-1; c[i]=Math.tanh(x*amount); }
        return c;
    }

    // ── Core OSC primitive ────────────────────────────────────────
    function _osc(type,freq,t0,dur,gain,freqEnd=null,bus=null,panVal=0,detuneC=0){
        const ctx=_getCtx(); if(!ctx) return null;
        if(!_acquireVoice()) return null;
        const dest=bus||_sfxBus;
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.type=type;
        o.frequency.setValueAtTime(Math.max(freq,1),t0);
        if(detuneC) o.detune.setValueAtTime(detuneC,t0);
        if(freqEnd!=null) o.frequency.exponentialRampToValueAtTime(Math.max(freqEnd,1),t0+dur);
        g.gain.setValueAtTime(gain,t0);
        g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
        if(panVal!==0){ const p=_mkPan(ctx,panVal); if(p){ o.connect(g); g.connect(p); p.connect(dest); o.start(t0); o.stop(t0+dur+0.02); try{o.onended=()=>_releaseVoice();}catch(e){setTimeout(()=>_releaseVoice(),(dur+0.1)*1000);} return o; } }
        o.connect(g); g.connect(dest);
        o.start(t0); o.stop(t0+dur+0.02);
        try{o.onended=()=>_releaseVoice();}catch(e){setTimeout(()=>_releaseVoice(),(dur+0.1)*1000);}
        return o;
    }

    // ── Core NOISE primitive ──────────────────────────────────────
    function _noise(t0,dur,gain,lo=300,hi=6000,bus=null,panVal=0){
        const ctx=_getCtx(); if(!ctx) return;
        if(!_acquireVoice()) return;
        const dest=bus||_sfxBus;
        const sr=ctx.sampleRate, len=Math.ceil(sr*(dur+0.05));
        const buf=ctx.createBuffer(1,len,sr);
        const d=buf.getChannelData(0);
        for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
        const src=ctx.createBufferSource(); src.buffer=buf;
        const bpf=ctx.createBiquadFilter(); bpf.type="bandpass";
        bpf.frequency.value=(lo+hi)/2; bpf.Q.value=0.8;
        const g=ctx.createGain();
        g.gain.setValueAtTime(gain,t0);
        g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
        src.connect(bpf); bpf.connect(g);
        if(panVal!==0){ const p=_mkPan(ctx,panVal); if(p){ g.connect(p); p.connect(dest); src.start(t0); src.stop(t0+dur+0.05); try{src.onended=()=>_releaseVoice();}catch(e){setTimeout(()=>_releaseVoice(),(dur+0.1)*1000);} return; } }
        g.connect(dest);
        src.start(t0); src.stop(t0+dur+0.05);
        try{src.onended=()=>_releaseVoice();}catch(e){setTimeout(()=>_releaseVoice(),(dur+0.1)*1000);}
    }

    // ══════════════════════════════════════════════════════════════
    // MUSIC ENGINE — State-based Multi-layer Step Sequencer
    // ══════════════════════════════════════════════════════════════
    const _BPM      = 138;
    const _STEP     = 60/_BPM/4;       // 16th note duration (seconds)
    const _BAR      = 16;              // steps per bar
    const _LOOKAHEAD= 0.10;
    const _SCHED_INT= 0.040;           // 40ms scheduler interval

    let _musPlaying  = false;
    let _musTimer    = null;
    let _musStep     = 0;
    let _musNextNote = 0;
    let _musBar      = 0;
    let _musState    = "menu";         // menu | gameplay | high_combo | boss | outro

    // ── Crossfade intensity: 0.0 = pure menu, 1.0 = pure gameplay ─
    // Every drum vol, bass filter, pad level is lerped on this value.
    // Ramped per-step inside _scheduleStep so transitions are smooth
    // without any separate timer — the sequencer IS the transition engine.
    let _musIntensity       = 0.0;
    let _musIntensityTarget = 0.0;
    let _musIntensityStep   = 0.0;  // added to _musIntensity each sequencer step

    // Linear interpolate — clamped to [0,1]
    function _lerp(a,b,t){ return a+(b-a)*Math.max(0,Math.min(1,t)); }

    // ── Drum patterns ─────────────────────────────────────────────
    const _PAT_KICK = {
        // MENU (ix=0): 4-on-the-floor — energetic, driving, relentless
        menu:       [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
        // GAMEPLAY (ix=1): heavy half-time stomp + anticipation hit on 15
        //   Wide spacing = oppressive weight, not busy excitement
        gameplay:   [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,1,0],
        high_combo: [1,0,1,0, 1,0,0,0, 1,0,1,0, 1,0,0,1],
        boss:       [1,0,1,0, 1,0,0,1, 1,0,1,0, 1,1,0,1],
    };
    const _PAT_SNARE = {
        // MENU: crisp crack on 2+4 with ghost anticipation — classic groove
        menu:       [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
        // GAMEPLAY: 2+4 only — heavier, longer decay, no ghost (weight > busy)
        gameplay:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        high_combo: [0,0,0,0, 1,0,0,1, 0,0,1,0, 1,0,0,1],
        boss:       [0,0,1,0, 1,0,1,0, 0,0,1,0, 1,0,1,1],
    };
    const _PAT_OHAT = {
        // MENU: every-other-beat open hat — standard energetic groove
        menu:       [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
        // GAMEPLAY: off-beat 16th notes — creates rhythmic tension and anxiety
        gameplay:   [0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1],
        high_combo: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
        boss:       [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
    };

    // ── Bass patterns ─────────────────────────────────────────────
    // Menu (bright/energetic): melodic Am bass lines
    const _BASS_A    = [110,0,0,110, 0,0,130,0, 146,0,0,0, 110,0,164,0];
    const _BASS_B    = [110,0,0,0,   130,0,0,0, 110,0,146,0, 164,0,0,0];
    const _BASS_BOSS = [55, 0,0,55,  0, 0,82, 0, 73, 0,0,0, 55, 0,82, 55];

    // Gameplay (dark): chromatic descent — A2→Ab2→G2, oppressive downward pull
    // 110=A2  104=Ab2  98=G2  116.5=Bb2 (half-step up = neighbour tension)
    const _BASS_DARK_A = [110,0,0,0, 0,0,0,0, 104,0,0,0, 0,0,98, 0]; // chromatic fall
    const _BASS_DARK_B = [110,0,0,110,0,0,0,0, 0, 0,0,0, 82.4,0,0,0]; // A2 root + tritone

    // Dark ostinato: replaces bright lead in gameplay —
    // syncopated low sawtooth stabs with chromatic neighbour notes.
    // A2↔Bb2 oscillation = maximum semitone dissonance = anxiety.
    const _OSTINATO_DARK_A = [0,0,110,0, 0,0,0,116.5, 0,110,0,0, 0,0,116.5,0];
    const _OSTINATO_DARK_B = [0,0,0,104, 0,0,110,0,   0,0,104,0, 0,0,0,110];

    // ── Lead melody (menu/high_combo only) ───────────────────────
    const _LEAD_A  = [0,0,0,0,  220,0,0,0,  0,0,261,0,  0,246,0,0];
    const _LEAD_B  = [0,0,330,0, 0,0,0,0, 294,0,0,261,  0,0,0,0];
    const _LEAD_HC = [440,0,0,330, 0,392,0,0, 330,0,0,294, 0,0,440,0];

    // ── Pad chord progressions ────────────────────────────────────
    // BRIGHT (menu): standard Am palette — energetic and clear
    const _PAD_BRIGHT = [
        [110,164,220],  // Am
        [130,164,196],  // C
        [146,196,220],  // Dm
        [164,220,261],  // Em
        [110,146,220],  // Am7
    ];

    // DARK (gameplay): low-register minor voicings with tritone tensions.
    // Very wide intervals = spacious but oppressive.
    // 55=A1  73.4=D2  98=G2  87.3=F2  58.3=Bb1  49=G1  41.2=E1  77.8=Eb2
    const _PAD_DARK = [
        [55, 73.4,  98.0],   // Am7 open  — A1,D2,G2  (wide, dark, spacious)
        [49, 58.3,  87.3],   // Gm7 low   — G1,Bb1,F2 (heavy, tense resolution)
        [43.65, 55, 82.4],   // Fm low    — F1,A1,E2  (modal darkness)
        [41.2, 55,  77.8],   // Em/Eb     — E1,A1,Eb2 (tritone = maximum tension)
        [46.2, 58.3, 73.4],  // Bbm low   — Bb1,B1,D2 (chromatic cluster, dread)
    ];

    // ── Sidechain gain node (kick pump effect) ────────────────────
    let _sidechainG = null;

    function _scheduleStep(t,step){
        const ctx=_ctx; if(!ctx||!_musBus) return;
        const st  = _musState;
        const v   = _mVol(0.45);
        const bar = _musBar;

        // Advance crossfade intensity one step toward target
        if(_musIntensity !== _musIntensityTarget && _musIntensityStep > 0){
            const diff  = _musIntensityTarget - _musIntensity;
            const delta = Math.sign(diff) * Math.min(Math.abs(diff), _musIntensityStep);
            _musIntensity = Math.max(0, Math.min(1, _musIntensity + delta));
        }
        // ix=0 → MENU (energetic, bright, 4-on-the-floor)
        // ix=1 → GAMEPLAY (dark, heavy, oppressive, tense)
        const ix = _musIntensity;

        // ── Performans reaktifligi ────────────────────────────────
        // Combo sayisini okuyarak davul hacmini ve bas filtresini canli ayarlar.
        // Combo 0→15 arasinda _perfBoost 0→1'e cikar:
        //   kick   %35 daha guclu (+guven hissi)
        //   snare  %25 daha guclu
        //   hat    daha belirgin
        //   bass filter daha acik (+enerji)
        // Combo sifirlandiginda etki kaybolur — an anlik reaktif.
        const _pb = Math.min(1.0, ((typeof GS!=="undefined"&&GS?.combo)||0) / 15.0);

        const kickPat  = _PAT_KICK[st]  || _PAT_KICK.gameplay;
        const snarePat = _PAT_SNARE[st] || _PAT_SNARE.gameplay;
        const ohatPat  = _PAT_OHAT[st]  || _PAT_OHAT.gameplay;

        // ── KICK ─────────────────────────────────────────────
        // MENU:     crisp 4-on-the-floor — clean transient, standard punch
        // GAMEPLAY: earth-shaking half-time stomp — deeper body, longer sub,
        //           heavier distortion. Hits less often but feels physical.
        if(kickPat[step]){
            const kv       = _lerp(v*2.4,  v*3.2,  ix) * (1 + _pb * 0.35);
            const distAmt  = _lerp(0.70,   2.50,   ix);
            const kickFreq = _lerp(132,    108,    ix);
            const kickEnd  = _lerp(30,     22,     ix);
            const kickDur  = _lerp(0.19,   0.28,   ix);
            const o=ctx.createOscillator(), g=ctx.createGain();
            const wave=ctx.createWaveShaper(); wave.curve=_distCurve(distAmt);
            o.type="sine";
            o.frequency.setValueAtTime(st==="boss"?165:kickFreq, t);
            o.frequency.exponentialRampToValueAtTime(kickEnd, t+kickDur);
            g.gain.setValueAtTime(kv, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t+kickDur+0.04);
            o.connect(wave); wave.connect(g); g.connect(_musBus);
            o.start(t); o.stop(t+kickDur+0.08);
            // Transient: crisp hi-freq in menu, dull low thud in gameplay
            _noise(t,0.010,v*_lerp(0.65,0.18,ix),_lerp(700,120,ix),_lerp(10000,3200,ix),_musBus);
            // Sub thump: standard in menu, enormous in gameplay
            const sub=ctx.createOscillator(), subG=ctx.createGain();
            sub.type="sine"; sub.frequency.value=_lerp(58, 36, ix);
            subG.gain.setValueAtTime(v*_lerp(1.0, 2.2, ix), t);
            subG.gain.exponentialRampToValueAtTime(0.0001, t+_lerp(0.09,0.22,ix));
            sub.connect(subG); subG.connect(_musBus);
            sub.start(t); sub.stop(t+_lerp(0.14,0.28,ix));
            // Sidechain pump
            if(_sidechainG){
                _sidechainG.gain.cancelScheduledValues(t);
                _sidechainG.gain.setValueAtTime(_lerp(0.50,0.28,ix), t);
                _sidechainG.gain.linearRampToValueAtTime(1.0, t+_lerp(0.13,0.26,ix));
            }
        }

        // ── SNARE ─────────────────────────────────────────────
        // MENU:     crisp crack on 2+4 — backbone of energetic groove
        // GAMEPLAY: deep heavy thud — more body, longer decay, low noise layer
        if(snarePat[step]){
            const sv     = _lerp(v*1.05, v*1.40, ix) * (1 + _pb * 0.25);
            const snFreq = _lerp(224,    148,    ix);
            const snDur  = _lerp(0.18,   0.34,   ix);
            const o=ctx.createOscillator(), g=ctx.createGain();
            o.type="triangle";
            o.frequency.setValueAtTime(st==="boss"?265:snFreq, t);
            o.frequency.exponentialRampToValueAtTime(70, t+snDur);
            g.gain.setValueAtTime(sv, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t+snDur+0.06);
            o.connect(g); g.connect(_musBus);
            o.start(t); o.stop(t+snDur+0.10);
            _noise(t,_lerp(0.17,0.30,ix),v*_lerp(0.78,1.10,ix),
                   _lerp(1500,300,ix),_lerp(13000,5000,ix),_musBus);
            // Gameplay: extra sub body — the "thoom" sensation
            if(ix>0.35) _noise(t,0.12*ix,v*0.40*ix,50,380,_musBus);
            if(st==="boss") _noise(t,0.05,v*0.42,4000,18000,_musBus);
        }

        // ── CLOSED HIHAT ─────────────────────────────────────
        // MENU:     on-beat accent dominant — clean groove
        // GAMEPLAY: off-beat accent dominant — inverted = anxious, unsettled
        {
            const onBeat  = step%2===0;
            const chatVel = (onBeat ? _lerp(0.34,0.12,ix) : _lerp(0.15,0.32,ix)) * (1 + _pb * 0.20);
            _noise(t,0.018,v*chatVel,_lerp(9500,6800,ix),20000,_musBus,(Math.random()-0.5)*0.45);
        }

        // ── OPEN HIHAT ────────────────────────────────────────
        if(ohatPat[step]){
            _noise(t,_lerp(0.16,0.26,ix),v*_lerp(0.28,0.14,ix),
                   _lerp(6500,3500,ix),_lerp(15000,9000,ix),_musBus,(Math.random()-0.5)*0.38);
        }

        // ── RIMSHOT FILLS ─────────────────────────────────────
        if((st==="high_combo"||st==="boss")&&step===14){
            _noise(t,0.04,v*0.32,3000,11000,_musBus);
            const rim=ctx.createOscillator(),rimG=ctx.createGain();
            rim.type="triangle"; rim.frequency.value=420;
            rimG.gain.setValueAtTime(v*0.30,t);
            rimG.gain.exponentialRampToValueAtTime(0.0001,t+0.055);
            rim.connect(rimG); rimG.connect(_musBus);
            rim.start(t); rim.stop(t+0.07);
        }

        // ── BASS LINE ─────────────────────────────────────────
        // MENU:     melodic Am bass — clear sawtooth, open filter, rhythmic
        // GAMEPLAY: chromatic descent — very dark filter (180Hz), heavy
        //           distortion, longer sustain — physically oppressive
        const bassPat = st==="boss"  ? _BASS_BOSS
                      : ix>0.50     ? (bar%2===0 ? _BASS_DARK_A : _BASS_DARK_B)
                      :               (bar%2===0 ? _BASS_A      : _BASS_B);
        if(bassPat[step]){
            const f          = bassPat[step];
            const bassFilter = _lerp(680, 170, ix) * (1 + _pb * 0.45);
            const bassVol    = _lerp(v*0.68, v*0.95, ix);
            const bassQ      = _lerp(2.8, 5.2, ix);
            const bassNoteDur= _lerp(_STEP*2.3, _STEP*3.8, ix);
            const o=ctx.createOscillator(), g=ctx.createGain();
            o.type="sawtooth"; o.frequency.setValueAtTime(f,t);
            const lpf=ctx.createBiquadFilter();
            lpf.type="lowpass"; lpf.frequency.value=bassFilter; lpf.Q.value=bassQ;
            g.gain.setValueAtTime(bassVol,t);
            g.gain.setValueAtTime(bassVol,t+0.04);
            g.gain.exponentialRampToValueAtTime(0.0001,t+bassNoteDur);
            if(ix>0.42){
                const dist=ctx.createWaveShaper();
                dist.curve=_distCurve((ix-0.42)/0.58*4.0);
                o.connect(dist); dist.connect(lpf);
            } else { o.connect(lpf); }
            lpf.connect(g); g.connect(_musBus);
            o.start(t); o.stop(t+bassNoteDur+0.05);
            // Sub octave — massive in gameplay
            const sub2=ctx.createOscillator(), sub2G=ctx.createGain();
            sub2.type="sine"; sub2.frequency.value=f/2;
            sub2G.gain.setValueAtTime(v*_lerp(0.58,1.10,ix),t);
            sub2G.gain.exponentialRampToValueAtTime(0.0001,t+_lerp(_STEP*4.2,_STEP*7.0,ix));
            sub2.connect(sub2G); sub2G.connect(_musBus);
            sub2.start(t); sub2.stop(t+_lerp(_STEP*4.5,_STEP*7.5,ix));
        }

        // ── BRIGHT LEAD SYNTH (MENU) ──────────────────────────
        // Square-wave melodic lead — the driving voice of menu energy.
        // Fades completely before dark gameplay takes over (ix>0.75).
        if(ix<0.75){
            const leadFade=1.0-Math.min(1,ix/0.75);
            const leadPat =st==="high_combo"?_LEAD_HC:(bar%2===0?_LEAD_A:_LEAD_B);
            if(leadPat[step]){
                const f=leadPat[step];
                const leadVol=v*(st==="boss"?0.30:0.22)*leadFade;
                if(leadVol>0.002){
                    const o=ctx.createOscillator(), g=ctx.createGain();
                    o.type="square"; o.frequency.setValueAtTime(f,t);
                    o.detune.setValueAtTime(_varyC(8),t);
                    const bpf=ctx.createBiquadFilter();
                    bpf.type="bandpass"; bpf.frequency.value=f*2; bpf.Q.value=2.0;
                    g.gain.setValueAtTime(0,t);
                    g.gain.linearRampToValueAtTime(leadVol,t+0.016);
                    g.gain.exponentialRampToValueAtTime(0.0001,t+_STEP*3.8);
                    o.connect(bpf); bpf.connect(g); g.connect(_musBus);
                    o.start(t); o.stop(t+_STEP*4.1);
                    const shimG=ctx.createGain();
                    shimG.gain.setValueAtTime(v*0.08*leadFade,t+0.02);
                    shimG.gain.exponentialRampToValueAtTime(0.0001,t+_STEP*2.5);
                    const shimO=ctx.createOscillator(); shimO.type="sine";
                    shimO.frequency.value=f*2;
                    const shimP=_mkPan(ctx,(Math.random()-0.5)*0.5);
                    shimO.connect(shimG);
                    if(shimP){shimG.connect(shimP);shimP.connect(_musBus);}else{shimG.connect(_musBus);}
                    shimO.start(t+0.02); shimO.stop(t+_STEP*2.8);
                }
            }
        }

        // ── DARK OSTINATO (GAMEPLAY) ──────────────────────────
        // Syncopated low sawtooth stabs — replaces bright lead in gameplay.
        // A2 (110Hz) ↔ Bb2 (116.5Hz): semitone dissonance = anxiety.
        // Heavily filtered (<320Hz) and distorted — grinding, oppressive.
        if(ix>0.25){
            const darkFade=Math.min(1,(ix-0.25)/0.55);
            const ostPat  =bar%2===0?_OSTINATO_DARK_A:_OSTINATO_DARK_B;
            if(ostPat[step]){
                const f=ostPat[step];
                const o=ctx.createOscillator(), g=ctx.createGain();
                const dist=ctx.createWaveShaper(); dist.curve=_distCurve(4.5);
                o.type="sawtooth"; o.frequency.setValueAtTime(f,t);
                o.detune.setValueAtTime(_varyC(6),t);
                const lpf=ctx.createBiquadFilter();
                lpf.type="lowpass"; lpf.frequency.value=310; lpf.Q.value=4.2;
                g.gain.setValueAtTime(0,t);
                g.gain.linearRampToValueAtTime(v*0.40*darkFade,t+0.008);
                g.gain.exponentialRampToValueAtTime(0.0001,t+_STEP*1.5);
                o.connect(dist); dist.connect(lpf); lpf.connect(g); g.connect(_musBus);
                o.start(t); o.stop(t+_STEP*1.8);
            }
        }

        // ── PAD LAYER ─────────────────────────────────────────
        // MENU:     bright Am chords, medium attack — supporting cast
        // GAMEPLAY: dark low-register minor voicings, very slow attack (0.9s),
        //           heavy low-pass, louder — the oppressive harmonic blanket
        if(step===0||step===8){
            const useDark  =ix>0.45;
            const padChord =useDark?_PAD_DARK[bar%_PAD_DARK.length]:_PAD_BRIGHT[bar%_PAD_BRIGHT.length];
            const padVol   =st==="boss"?v*0.16:_lerp(v*0.22,v*0.52,ix);
            const padFilter=_lerp(900,340,ix);
            const padAttack=_lerp(0.45,0.95,ix);
            padChord.forEach((f,i)=>{
                const o=ctx.createOscillator(), g=ctx.createGain();
                o.type="sine"; o.frequency.setValueAtTime(f,t);
                o.detune.setValueAtTime(_varyC(5),t);
                const o2=ctx.createOscillator(), g2=ctx.createGain();
                o2.type="sine"; o2.frequency.setValueAtTime(f,t);
                o2.detune.setValueAtTime(_varyC(5)+8,t);
                const lpf=ctx.createBiquadFilter();
                lpf.type="lowpass"; lpf.frequency.value=padFilter; lpf.Q.value=0.5;
                const pv=padVol*(1-i*0.09);
                g.gain.setValueAtTime(0,t);
                g.gain.linearRampToValueAtTime(pv,t+padAttack);
                g.gain.setValueAtTime(pv,t+_STEP*7.0);
                g.gain.exponentialRampToValueAtTime(0.0001,t+_STEP*8.2);
                g2.gain.setValueAtTime(0,t);
                g2.gain.linearRampToValueAtTime(pv*0.38,t+padAttack+0.15);
                g2.gain.setValueAtTime(pv*0.38,t+_STEP*7.0);
                g2.gain.exponentialRampToValueAtTime(0.0001,t+_STEP*8.2);
                o.connect(lpf); o2.connect(lpf); lpf.connect(g);
                g.connect(_musBus); g2.connect(_musBus);
                o.start(t); o.stop(t+_STEP*8.5);
                o2.start(t+0.08); o2.stop(t+_STEP*8.5);
            });
        }

        // ── ATMOSPHERE ────────────────────────────────────────
        // MENU:     high shimmer — energy, sparkle, air
        // GAMEPLAY: sub-bass rumble + mid grinding texture — dread, oppression
        if(step===0){
            if(st==="boss"){
                _noise(t,_STEP*8,v*0.16,70,550,_musBus);
            } else {
                if(ix<0.80) _noise(t,_STEP*4,v*0.04*(1-ix/0.80),4500,14000,_musBus);
                if(ix>0.20){
                    const dv=v*0.18*Math.min(1,(ix-0.20)/0.65);
                    _noise(t,_STEP*8,dv,25,180,_musBus); // sub rumble
                    if(ix>0.55) _noise(t,_STEP*4,v*0.06*(ix-0.55)/0.45,150,550,_musBus);
                }
            }
        }

        // ── TENSION SWELL (GAMEPLAY EXCLUSIVE) ───────────────
        // Every 4 bars: rising noise builds to peak just before bar 1.
        // Creates a 4-bar horror dread cycle unique to dark gameplay.
        if(ix>0.55&&step===0&&bar%4===3){
            const sw=v*0.08*Math.min(1,(ix-0.55)/0.45);
            _noise(t,_STEP*_BAR,sw,80,900,_musBus);
            _noise(t+_STEP*12,_STEP*4,sw*2.0,3000,11000,_musBus);
        }

        // ── BOSS DISTORTED LAYER ──────────────────────────────
        if(st==="boss"&&(step===0||step===8)){
            const bf=[55,82,110][bar%3];
            const o=ctx.createOscillator(), g=ctx.createGain();
            const dist=ctx.createWaveShaper(); dist.curve=_distCurve(7);
            o.type="sawtooth"; o.frequency.setValueAtTime(bf,t);
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(v*0.24,t+0.06);
            g.gain.setValueAtTime(v*0.24,t+_STEP*3.5);
            g.gain.exponentialRampToValueAtTime(0.0001,t+_STEP*4.2);
            o.connect(dist); dist.connect(g); g.connect(_musBus);
            o.start(t); o.stop(t+_STEP*4.5);
        }

        // ── HIGH COMBO ARPEGGIO ───────────────────────────────
        if(st==="high_combo"&&step%4===2){
            const arpFreqs=[440,523,659,784];
            const arpF=arpFreqs[Math.floor(step/4)%arpFreqs.length];
            const o=ctx.createOscillator(), g=ctx.createGain();
            o.type="triangle"; o.frequency.setValueAtTime(arpF,t);
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(v*0.14,t+0.012);
            g.gain.exponentialRampToValueAtTime(0.0001,t+_STEP*1.8);
            o.connect(g); g.connect(_musBus);
            o.start(t); o.stop(t+_STEP*2.1);
        }

        // ── Bar counter ───────────────────────────────────────
        if(step===_BAR-1) _musBar++;
    }

    function _musScheduler(){
        if(!_musPlaying||!_ctx) return;
        // [FIX-SES] Context suspend kontrolü — sekme arka plana alınınca veya
        // mobil ekran kapanınca context suspended olur. Resume etmeden devam edersek
        // _musNextNote geride kalır; dönerken while döngüsü yüzlerce step'i
        // aynı anda schedule eder → ses distort/kesilir. Önce resume et, bu tick'i atla.
        if(_ctx.state === "suspended"){
            _ctx.resume().catch(()=>{});
            return;
        }
        const now = _ctx.currentTime;
        // [FIX-SES] Flood koruması — _musNextNote çok geride kalmışsa (context
        // suspend sonrası > 500ms) sıfırla. Aksi hâlde while döngüsü onlarca
        // oscillator aynı anda yaratır → ses bozulur/kesilir.
        if(_musNextNote < now - 0.5){
            _musNextNote = now + 0.05;
        }
        const lookAhead = now + _LOOKAHEAD;
        while(_musNextNote < lookAhead){
            _scheduleStep(_musNextNote,_musStep);
            _musStep=(_musStep+1)%_BAR;
            _musNextNote+=_STEP;
        }
    }

    function _startMusic(){
        const ctx=_getCtx(); if(!ctx||_musPlaying) return;
        _resume();
        _musPlaying  =true;
        _musStep     =0;
        _musBar      =0;
        _musNextNote =ctx.currentTime+0.10;
        _sidechainG  =ctx.createGain(); _sidechainG.gain.value=1.0;
        _musBus.gain.cancelScheduledValues(ctx.currentTime);
        _musBus.gain.setValueAtTime(0,ctx.currentTime);
        _musBus.gain.linearRampToValueAtTime(_mVol(0.88),ctx.currentTime+0.6);
        _musTimer=setInterval(_musScheduler,_SCHED_INT*1000);
        // [FIX-SES] Periyodik context sağlık kontrolü — mobil arka plandan
        // dönüldüğünde context suspended kalabilir. Her 8 saniyede bir kontrol et.
        if(_ctxHealthTimer) clearInterval(_ctxHealthTimer);
        _ctxHealthTimer=setInterval(()=>{
            if(_ctx && _ctx.state==="suspended") _ctx.resume().catch(()=>{});
        },8000);
    }

    function _stopMusic(fadeTime=2.0){
        if(!_musPlaying||!_ctx) return;
        _musPlaying=false;
        clearInterval(_musTimer); _musTimer=null;
        if(_ctxHealthTimer){ clearInterval(_ctxHealthTimer); _ctxHealthTimer=null; } // [FIX-SES]
        _musBus.gain.cancelScheduledValues(_ctx.currentTime);
        _musBus.gain.setValueAtTime(_musBus.gain.value,_ctx.currentTime);
        _musBus.gain.linearRampToValueAtTime(0,_ctx.currentTime+fadeTime);
    }

    function _setMusicState(state, xfade=2.0){
        if(!_ctx||state===_musState) return;
        _musState=state;

        // Set intensity target based on state identity:
        //   menu/outro → calm (0.0), all action states → energetic (1.0)
        const intensityMap = { menu:0.0, outro:0.2, gameplay:1.0, high_combo:1.0, boss:1.0 };
        _musIntensityTarget = intensityMap[state] ?? 1.0;

        // Per-step increment: reach target in xfade seconds.
        // _STEP = one 16th note in seconds. Dividing gives steps-per-second,
        // then we need (1/total_steps) change per step = _STEP/xfade.
        _musIntensityStep = _STEP / Math.max(0.1, xfade);

        // Volume envelope: brief dip signals the transition, then recovers.
        // Dip is deeper when leaving gameplay (more dramatic contrast).
        if(_musBus && _musPlaying){
            const now     = _ctx.currentTime;
            const dipTo   = _lerp(0.62, 0.38, _musIntensity); // deeper from gameplay
            _musBus.gain.cancelScheduledValues(now);
            _musBus.gain.setValueAtTime(_musBus.gain.value, now);
            _musBus.gain.linearRampToValueAtTime(_mVol(dipTo),   now + xfade*0.22);
            _musBus.gain.linearRampToValueAtTime(_mVol(0.88),    now + xfade);
        }
    }

    // ── Low HP heartbeat ambience ─────────────────────────────────
    let _heartbeatTimer=null;
    let _ctxHealthTimer=null; // [FIX-SES] Periyodik AudioContext sağlık kontrolü
    function _startHeartbeat(){
        if(_heartbeatTimer) return;
        _heartbeatTimer=setInterval(()=>{
            const ctx=_getCtx(); if(!ctx||!_ambBus) return;
            const t=ctx.currentTime;
            const o1=ctx.createOscillator(), g1=ctx.createGain();
            o1.type="sine"; o1.frequency.setValueAtTime(62,t);
            o1.frequency.exponentialRampToValueAtTime(46,t+0.09);
            g1.gain.setValueAtTime(_mVol(0.75),t);
            g1.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
            o1.connect(g1); g1.connect(_ambBus); o1.start(t); o1.stop(t+0.14);
            const o2=ctx.createOscillator(), g2=ctx.createGain();
            o2.type="sine"; o2.frequency.setValueAtTime(56,t+0.13);
            o2.frequency.exponentialRampToValueAtTime(42,t+0.22);
            g2.gain.setValueAtTime(_mVol(0.48),t+0.13);
            g2.gain.exponentialRampToValueAtTime(0.0001,t+0.25);
            o2.connect(g2); g2.connect(_ambBus); o2.start(t+0.13); o2.stop(t+0.27);
        },880);
        if(_ctx&&_ambBus){
            const now=_ctx.currentTime;
            _ambBus.gain.cancelScheduledValues(now);
            _ambBus.gain.linearRampToValueAtTime(0.65,now+1.5);
        }
    }
    function _stopHeartbeat(){
        if(_heartbeatTimer){clearInterval(_heartbeatTimer);_heartbeatTimer=null;}
        if(_ctx&&_ambBus){
            const now=_ctx.currentTime;
            _ambBus.gain.cancelScheduledValues(now);
            _ambBus.gain.linearRampToValueAtTime(0,now+1.5);
        }
    }

    // ══════════════════════════════════════════════════════════════
    // SFX LIBRARY — AAA Quality, 3-Layer per sound
    // ══════════════════════════════════════════════════════════════
    const SFX = {

        // ── SHOOT DEFAULT (punch + click + air-tail) ─────────────
        shoot_default(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime, pan=_vary(0,0.28);
            _osc("sine",  _vary(74),  t, _vary(0.07,0.1), _vol(0.38), _vary(27), null, pan);
            _osc("square",_vary(265), t, _vary(0.036,0.1),_vol(0.44), _vary(74), null, pan);
            _noise(t,  _vary(0.008,0.1), _vol(0.32), 2000,10000, null, pan);
            _noise(t+0.024, _vary(0.06,0.1), _vol(0.12), 600,5000, null, pan);
        },

        shoot_rapid(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime, pan=_vary(0,0.22);
            _osc("square",_vary(385), t, _vary(0.022,0.1), _vol(0.30),_vary(112), null, pan);
            _noise(t, _vary(0.018,0.1), _vol(0.22), 2800,12000, null, pan);
            _osc("sine",  _vary(88),  t, _vary(0.015,0.1), _vol(0.15), null,     null, pan);
        },

        shoot_cannon(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",  _vary(60),  t, _vary(0.22,0.05), _vol(0.72), _vary(22));
            _osc("square",_vary(140), t, _vary(0.12,0.05), _vol(0.40), _vary(40));
            _noise(t, _vary(0.09,0.05), _vol(0.48), 200,4500);
            _noise(t+0.08, _vary(0.22,0.05), _vol(0.12), 80,1000);
            _osc("sine",  _vary(34),  t, _vary(0.18,0.05), _vol(0.38), _vary(18));
        },

        shoot_spread(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sawtooth",_vary(240), t,       _vary(0.035,0.1), _vol(0.36), _vary(70));
            _noise(t, _vary(0.05,0.1), _vol(0.25), 2200,9000);
            _osc("square",  _vary(180), t+0.008, _vary(0.030,0.1), _vol(0.19), _vary(60));
            _noise(t+0.012, 0.03, _vol(0.12), 4000,14000);
        },

        shoot_precision(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",    _vary(1100), t, _vary(0.006,0.1), _vol(0.52), _vary(180));
            _osc("sine",    _vary(650),  t, _vary(0.055,0.1), _vol(0.35), _vary(110));
            _noise(t, _vary(0.018,0.1), _vol(0.20), 5000,18000);
            _osc("triangle",_vary(2200), t+0.005, _vary(0.04,0.1), _vol(0.10));
        },

        shoot_chain(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("triangle",_vary(320), t, _vary(0.045,0.1), _vol(0.38), _vary(90));
            _osc("sine",    _vary(480), t, _vary(0.030,0.1), _vol(0.20), _vary(160));
            _noise(t, _vary(0.04,0.1), _vol(0.16), 2500,9000);
            _osc("sine",    _vary(880), t+0.015, _vary(0.025,0.1), _vol(0.09));
        },

        shoot_reflect(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",    _vary(520), t, _vary(0.050,0.1), _vol(0.32), _vary(260));
            _osc("triangle",_vary(780), t, _vary(0.040,0.1), _vol(0.18), _vary(390));
            _noise(t, _vary(0.035,0.1), _vol(0.14), 4000,12000);
            _osc("sine",   _vary(1400), t+0.02, _vary(0.06,0.1), _vol(0.08), _vary(700));
        },

        bullet_bounce(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime, pan=_vary(0,0.55);
            _osc("sine",    _vary(700),  t, _vary(0.065,0.1), _vol(0.32), _vary(350), null, pan);
            _noise(t, _vary(0.028,0.1), _vol(0.16), 3000,9000, null, pan);
            _osc("triangle",_vary(1200), t+0.01, _vary(0.04,0.1), _vol(0.09), null, null, pan);
        },

        // ── HIT NORMAL (impact + bass + crunch) ──────────────────
        hit_normal(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",    _vary(90),  t, _vary(0.042,0.1), _vol(0.72), _vary(28));
            _noise(t, _vary(0.028,0.1), _vol(0.52), 300,4000);
            _osc("triangle",_vary(180), t, _vary(0.015,0.1), _vol(0.30), _vary(60));
            _noise(t+0.008, _vary(0.02,0.1), _vol(0.18), 1500,8000);
        },

        // ── HIT CRIT (heavy THUD + crunch + shimmer) ─────────────
        hit_crit(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",   _vary(52),  t, _vary(0.18,0.05), _vol(1.0),  _vary(14));
            _osc("sine",   _vary(100), t, _vary(0.10,0.05), _vol(0.62), _vary(26));
            _noise(t, _vary(0.06,0.05), _vol(0.70), 200,5000);
            _noise(t+0.03, _vary(0.18,0.05), _vol(0.22), 50,450);
            _osc("sine",   _vary(880), t+0.04, _vary(0.12,0.05), _vol(0.18), _vary(440));
            _noise(t+0.05, 0.08, _vol(0.14), 4000,16000);
        },

        // ── COMBO — combo'ya gore katmanlanan, pitch artan ses ────────
        // Her combo milestone'da yeni ses katmani acilir.
        // Stereo genislik ve harmonik zenginlik combo ile buyur.
        combo(count=1){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const scale=[110,130,146,164,196,220,261,294,330,392,440,523,659];
            const idx=Math.min(Math.floor(count/2),scale.length-1);
            const f=scale[idx];
            // Volume ve pitch birlikte yukselir — combo=20'de %45 daha yuksek
            const vol=Math.min(0.70, 0.22+count*0.024);
            // Pitch detune: combo arttikca hafif yukari kayar (perceptible ama subtle)
            const detune=Math.min(count*3, 40); // max +40 cents @ combo 13+

            // ── Ana ses katmani ──────────────────────────────────
            const o=ctx.createOscillator(), g=ctx.createGain();
            o.type="sawtooth"; o.frequency.setValueAtTime(f*2,t);
            o.detune.setValueAtTime(detune+_varyC(8),t);
            const lpf=ctx.createBiquadFilter();
            lpf.type="lowpass";
            lpf.frequency.value=f*(4+count*0.35); // combo arttikca filtre acilir = daha parlak
            lpf.Q.value=3.5+count*0.08;
            g.gain.setValueAtTime(_vol(vol),t);
            g.gain.exponentialRampToValueAtTime(0.0001,t+0.38);
            o.connect(lpf); lpf.connect(g); g.connect(_sfxBus);
            o.start(t); o.stop(t+0.42);

            // ── 4. harmonik + gurultu transient ─────────────────
            _osc("sine",f*4,t+0.018,0.22,_vol(vol*0.30));
            _noise(t,0.014,_vol(0.20+count*0.006),2000,10000);

            // ── Combo 5+: stereo harmonik cift — genislik hissi ─
            if(count>=5){
                const panL=_mkPan(ctx,-0.3-Math.min(count*0.03,0.6));
                const panR=_mkPan(ctx, 0.3+Math.min(count*0.03,0.6));
                const h1=ctx.createOscillator(), h1g=ctx.createGain();
                const h2=ctx.createOscillator(), h2g=ctx.createGain();
                h1.type="triangle"; h1.frequency.value=f*3; h1.detune.value=detune*0.5+8;
                h2.type="triangle"; h2.frequency.value=f*3; h2.detune.value=detune*0.5-8;
                const hv=_vol(vol*0.18+count*0.006);
                h1g.gain.setValueAtTime(0,t); h1g.gain.linearRampToValueAtTime(hv,t+0.02);
                h1g.gain.exponentialRampToValueAtTime(0.0001,t+0.28);
                h2g.gain.setValueAtTime(0,t); h2g.gain.linearRampToValueAtTime(hv,t+0.02);
                h2g.gain.exponentialRampToValueAtTime(0.0001,t+0.28);
                if(panL){h1.connect(h1g);h1g.connect(panL);panL.connect(_sfxBus);}else{h1.connect(h1g);h1g.connect(_sfxBus);}
                if(panR){h2.connect(h2g);h2g.connect(panR);panR.connect(_sfxBus);}else{h2.connect(h2g);h2g.connect(_sfxBus);}
                h1.start(t); h1.stop(t+0.30);
                h2.start(t); h2.stop(t+0.30);
            }

            // ── Combo 10+: mini 2-nota arpeggio ─────────────────
            // Hizli yukari firlayan iki nota — "flow state" hissi
            if(count>=10){
                const arp=[f*3, f*4];
                arp.forEach((af,i)=>{
                    const ao=ctx.createOscillator(), ag=ctx.createGain();
                    const ap=_mkPan(ctx,(i===0?-0.45:0.45));
                    ao.type="square"; ao.frequency.value=af;
                    ao.detune.value=detune;
                    ag.gain.setValueAtTime(0,t+i*0.048);
                    ag.gain.linearRampToValueAtTime(_vol(0.16+count*0.004),t+i*0.048+0.01);
                    ag.gain.exponentialRampToValueAtTime(0.0001,t+i*0.048+0.14);
                    if(ap){ao.connect(ag);ag.connect(ap);ap.connect(_sfxBus);}else{ao.connect(ag);ag.connect(_sfxBus);}
                    ao.start(t+i*0.048); ao.stop(t+i*0.048+0.16);
                });
                _noise(t,0.030,_vol(0.26+count*0.006),4000,16000);
            }

            // ── Combo 15+: shimmer katmani + daha genis stereo ──
            // Oyuncu "max flow"da hisseder
            if(count>=15){
                const shimFreqs=[f*5, f*6, f*7.5];
                shimFreqs.forEach((sf,i)=>{
                    const so=ctx.createOscillator(), sg=ctx.createGain();
                    const sp=_mkPan(ctx,Math.cos(i*2.1)*0.8);
                    so.type="sine"; so.frequency.value=sf;
                    so.detune.value=_varyC(15);
                    sg.gain.setValueAtTime(0,t+i*0.022);
                    sg.gain.linearRampToValueAtTime(_vol(0.08+count*0.003),t+i*0.022+0.015);
                    sg.gain.exponentialRampToValueAtTime(0.0001,t+i*0.022+0.20);
                    if(sp){so.connect(sg);sg.connect(sp);sp.connect(_sfxBus);}else{so.connect(sg);sg.connect(_sfxBus);}
                    so.start(t+i*0.022); so.stop(t+i*0.022+0.22);
                });
            }
        },

        // ── COMBO BREAK (distorted downward sweep) ───────────────
        combo_break(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const o=ctx.createOscillator(), dist=ctx.createWaveShaper(), g=ctx.createGain();
            dist.curve=_distCurve(4);
            const lfo=ctx.createOscillator(), lfoG=ctx.createGain();
            lfo.frequency.value=25; lfoG.gain.value=52;
            lfo.connect(lfoG); lfoG.connect(o.frequency);
            o.type="sawtooth";
            o.frequency.setValueAtTime(510,t);
            o.frequency.exponentialRampToValueAtTime(70,t+0.52);
            g.gain.setValueAtTime(_vol(0.58),t);
            g.gain.exponentialRampToValueAtTime(0.0001,t+0.58);
            o.connect(dist); dist.connect(g); g.connect(_sfxBus);
            lfo.start(t); lfo.stop(t+0.58);
            o.start(t); o.stop(t+0.58);
            _osc("sine",_vary(50),t,0.16,_vol(0.58),_vary(24));
            _noise(t,0.08,_vol(0.36),400,8000);
        },

        // ── KILL (deep impact + metallic + satisfaction zing) ─────
        kill(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",    _vary(80),  t,       _vary(0.22,0.05), _vol(0.78), _vary(28));
            _osc("triangle",_vary(400), t,       _vary(0.06,0.05), _vol(0.38), _vary(100));
            _noise(t, _vary(0.05,0.05), _vol(0.48), 500,6000);
            _osc("sine",   _vary(660),  t+0.025, _vary(0.10,0.05), _vol(0.22), _vary(1000));
            _noise(t+0.03, 0.08, _vol(0.14), 4000,16000);
        },

        // ── PYRAMID BREAK ─────────────────────────────────────────
        pyramid_break(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",    _vary(120), t, _vary(0.026,0.1), _vol(0.66), _vary(38));
            _noise(t, _vary(0.032,0.1), _vol(0.52), 400,4000);
            _noise(t, _vary(0.014,0.1), _vol(0.25), 5000,14000);
            _osc("triangle",_vary(78),  t+0.01, _vary(0.04,0.1), _vol(0.28), _vary(30));
        },

        // ── LEVEL UP (rising arp + final chord + sparkle) ─────────
        level_up(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const arp=[220,277,330,440,554,660,880];
            arp.forEach((f,i)=>{
                const st=t+i*0.082;
                _osc("sawtooth",f,st,0.30,_vol(0.40),f*0.98);
                _osc("sine",f*2,st,0.22,_vol(0.16));
            });
            [440,554,660,880,1100].forEach(f=>{ _osc("sine",f,t+0.60,0.65,_vol(0.22)); });
            _noise(t+0.58,0.10,_vol(0.22),3000,14000);
            _osc("sine",55,t+0.56,0.45,_vol(0.44),28);
        },

        // ── GOLD PICKUP ───────────────────────────────────────────
        gold(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            [1318,1568,2093].forEach((f,i)=>{
                _osc("sine",    f,   t+i*0.024, _vary(0.09,0.1), _vol(0.24), null, null, _vary(0,0.45));
                _osc("triangle",f*2, t+i*0.024, _vary(0.06,0.1), _vol(0.08));
            });
            _noise(t,0.022,_vol(0.13),5000,16000);
        },

        // ── PERFECT HIT — kristal ping, combo'ya gore pitch artar ──────
        // Tam merkeze isabet ettiginde calinir. Ses combo ile yukselir.
        // 3 katman: ana ping + harmonik kirisma + sparkle gurultu.
        perfect_hit(combo=0){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Temel frekans: E6 (1318Hz) + combo basina +55 cent
            // Combo 20'de yaklasik 2 yari ton yukari — belirgin ama rahatsiz etmez
            const baseF = 1318.5;
            const detune = Math.min(combo * 5.5, 110); // cents, max +110
            const vol    = Math.min(0.35, 0.22 + combo * 0.006);

            // Katman 1: Parlak sine ping — hizli attack, natural decay
            const o=ctx.createOscillator(), g=ctx.createGain();
            o.type="sine"; o.frequency.setValueAtTime(baseF,t);
            o.detune.setValueAtTime(detune+_varyC(5),t);
            o.frequency.exponentialRampToValueAtTime(baseF*1.035,t+0.018); // ufak pitch rise = "bling"
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(_vol(vol),t+0.005);
            g.gain.exponentialRampToValueAtTime(0.0001,t+0.18);
            o.connect(g); g.connect(_sfxBus); o.start(t); o.stop(t+0.20);

            // Katman 2: Inharmonik ust kismi (2.756x) — metalik kristal renk
            const o2=ctx.createOscillator(), g2=ctx.createGain();
            o2.type="triangle"; o2.frequency.value=baseF*2.756;
            o2.detune.value=detune*0.5;
            g2.gain.setValueAtTime(0,t); g2.gain.linearRampToValueAtTime(_vol(vol*0.36),t+0.003);
            g2.gain.exponentialRampToValueAtTime(0.0001,t+0.08);
            o2.connect(g2); g2.connect(_sfxBus); o2.start(t); o2.stop(t+0.10);

            // Katman 3: Sparkle gurultu — cok kisa, yuksek frekans, genis pan
            _noise(t+0.002, 0.055, _vol(vol*0.50), 8000, 18000, null, _vary(0, 0.70));

            // Combo 10+: ikinci harmonik nota (5th ustu) — daha "kazanilmis" his
            if(combo >= 10){
                const o3=ctx.createOscillator(), g3=ctx.createGain();
                const p3=_mkPan(ctx, _vary(0,0.5));
                o3.type="sine"; o3.frequency.value=baseF*1.5; // perfect 5th
                o3.detune.value=detune;
                g3.gain.setValueAtTime(0,t+0.025); g3.gain.linearRampToValueAtTime(_vol(vol*0.22),t+0.035);
                g3.gain.exponentialRampToValueAtTime(0.0001,t+0.15);
                if(p3){o3.connect(g3);g3.connect(p3);p3.connect(_sfxBus);}else{o3.connect(g3);g3.connect(_sfxBus);}
                o3.start(t+0.025); o3.stop(t+0.18);
            }
        },

        // ── MULTI KILL — kill zinciri, agirlik combo'ya gore artar ────
        // killChain: 1=normal, 2=double, 3+=heavy
        multi_kill(chain=1){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const chain3=Math.min(chain,5);
            // Ana etki: pitch duser, hacim artar, zincir buyudukce
            const baseFreq = Math.max(45, 88 - chain3 * 10); // daha dusuk = daha agir
            const vol = Math.min(0.95, 0.60 + chain3 * 0.07);

            // Govde darbesi
            _osc("sine",    _vary(baseFreq),  t,      _vary(0.22,0.05), _vol(vol),       _vary(baseFreq*0.35));
            _osc("triangle",_vary(baseFreq*5),t,      _vary(0.06,0.05), _vol(vol*0.40),  _vary(baseFreq));
            _noise(t, _vary(0.05,0.05), _vol(vol*0.55), 300, 5000);

            // Metalik zing — her zincirde biraz daha yuksek
            const zingF = 550 + chain3 * 85;
            _osc("sine", _vary(zingF), t+0.028, _vary(0.12,0.05), _vol(vol*0.28), _vary(zingF*0.6));

            // Chain 2+: ekstra bass thud
            if(chain >= 2){
                const sub=ctx.createOscillator(), subG=ctx.createGain();
                sub.type="sine"; sub.frequency.setValueAtTime(_vary(36,0.08),t);
                sub.frequency.exponentialRampToValueAtTime(22,t+0.18);
                subG.gain.setValueAtTime(_vol(vol*0.80),t);
                subG.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
                sub.connect(subG); subG.connect(_sfxBus); sub.start(t); sub.stop(t+0.26);
            }

            // Chain 3+: yuksek frekansli "sweep" — birden fazla dusman hissini verir
            if(chain >= 3){
                _noise(t+0.04, 0.12, _vol(vol*0.30), 2000, 14000);
                const so=ctx.createOscillator(), sg=ctx.createGain();
                so.type="sawtooth"; so.frequency.setValueAtTime(_vary(320,0.08),t+0.05);
                so.frequency.exponentialRampToValueAtTime(_vary(85,0.06),t+0.22);
                sg.gain.setValueAtTime(_vol(vol*0.22),t+0.05);
                sg.gain.exponentialRampToValueAtTime(0.0001,t+0.26);
                so.connect(sg); sg.connect(_sfxBus); so.start(t+0.05); so.stop(t+0.28);
            }
        },

        // ── XP PICKUP — "aldim!" ani hissi ──────────────────────────────
        // Tasarim hedefi: her tiklamada oyuncu bir sey "kazandigini" hissetsin.
        // Anahtar unsur: ani parlak transient + dolgun sub pop + parlayan ust kisim.
        xp_pickup(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const now=performance.now();

            // Zincir guncelle
            if(now - _xpChainLast > _XP_CHAIN_GAP) _xpChainStep=0;
            _xpChainLast=now;
            const step=_xpChainStep % _XP_SCALE.length;
            _xpChainStep++;

            const f   = _XP_SCALE[step] * _vary(1, 0.04);
            const vol = Math.min(0.42, 0.28 + step * 0.013);

            // ── 1. PARLAK UCGEN POP — "kazanc" transient ────────────
            // Cok hizli attack (2ms), sonra sert pitch dususu.
            // Bu hareket beyne "bir sey toplandi" sinyali gonderir.
            const oA=ctx.createOscillator(), gA=ctx.createGain();
            oA.type="triangle";
            oA.frequency.setValueAtTime(f*2.2, t);
            oA.frequency.exponentialRampToValueAtTime(f*1.0, t+0.035);
            gA.gain.setValueAtTime(0,t);
            gA.gain.linearRampToValueAtTime(_vol(vol*0.90), t+0.002); // 2ms attack
            gA.gain.exponentialRampToValueAtTime(0.0001, t+0.14);
            oA.connect(gA); gA.connect(_sfxBus); oA.start(t); oA.stop(t+0.16);

            // ── 2. SINE ANA GOVDE — sicaklik / dolgunluk ────────────
            const oB=ctx.createOscillator(), gB=ctx.createGain();
            oB.type="sine"; oB.frequency.value=f;
            gB.gain.setValueAtTime(0,t);
            gB.gain.linearRampToValueAtTime(_vol(vol*0.55), t+0.005);
            gB.gain.exponentialRampToValueAtTime(0.0001, t+0.18);
            oB.connect(gB); gB.connect(_sfxBus); oB.start(t); oB.stop(t+0.20);

            // ── 3. SUB POP — fiziksel bas darbesi (f/2) ─────────────
            // Kulaklikta ve telefon hoparlorunde hissedilen "dokunus".
            const oS=ctx.createOscillator(), gS=ctx.createGain();
            oS.type="sine"; oS.frequency.setValueAtTime(f*0.5, t);
            oS.frequency.exponentialRampToValueAtTime(f*0.3, t+0.055);
            gS.gain.setValueAtTime(_vol(vol*0.40), t);
            gS.gain.exponentialRampToValueAtTime(0.0001, t+0.07);
            oS.connect(gS); gS.connect(_sfxBus); oS.start(t); oS.stop(t+0.08);

            // ── 4. SPARKLE BURST — parildama (yuksek frekans noise) ─
            // Cok kisa, stereo'da rastgele — her pickup biraz farkli hissettir.
            const panSpark=_mkPan(ctx, (Math.random()-0.5)*0.9);
            const sparkG=ctx.createGain();
            const sr=ctx.sampleRate, sparkLen=Math.ceil(sr*0.04);
            const sparkBuf=ctx.createBuffer(1,sparkLen,sr);
            const sparkD=sparkBuf.getChannelData(0);
            for(let i=0;i<sparkLen;i++) sparkD[i]=Math.random()*2-1;
            const sparkSrc=ctx.createBufferSource(); sparkSrc.buffer=sparkBuf;
            const sparkHPF=ctx.createBiquadFilter();
            sparkHPF.type="highpass"; sparkHPF.frequency.value=9000+step*300;
            sparkG.gain.setValueAtTime(_vol(vol*0.55), t+0.001);
            sparkG.gain.exponentialRampToValueAtTime(0.0001, t+0.04);
            sparkSrc.connect(sparkHPF); sparkHPF.connect(sparkG);
            if(panSpark){sparkG.connect(panSpark);panSpark.connect(_sfxBus);}
            else{sparkG.connect(_sfxBus);}
            sparkSrc.start(t+0.001); sparkSrc.stop(t+0.045);

            // ── 5. INHARMONIK PARLAKLAMA (2.76x) — metalik kristal ─
            const oC=ctx.createOscillator(), gC=ctx.createGain();
            oC.type="sine"; oC.frequency.value=f*2.76;
            gC.gain.setValueAtTime(0,t);
            gC.gain.linearRampToValueAtTime(_vol(vol*0.22), t+0.003);
            gC.gain.exponentialRampToValueAtTime(0.0001, t+0.06);
            oC.connect(gC); gC.connect(_sfxBus); oC.start(t); oC.stop(t+0.08);

            // ── Zincir 4+: stereo harmonik genisleme ────────────────
            if(step>=4){
                const pL=_mkPan(ctx,-0.45+step*-0.02);
                const pR=_mkPan(ctx, 0.45+step* 0.02);
                const oL=ctx.createOscillator(), gL=ctx.createGain();
                const oR=ctx.createOscillator(), gR=ctx.createGain();
                oL.type="triangle"; oL.frequency.value=f*2.01;
                oR.type="triangle"; oR.frequency.value=f*1.99; // ufak detune = genislik
                const hv=_vol(vol*0.22+step*0.008);
                [gL,gR].forEach(g2=>{
                    g2.gain.setValueAtTime(0,t+0.003);
                    g2.gain.linearRampToValueAtTime(hv,t+0.010);
                    g2.gain.exponentialRampToValueAtTime(0.0001,t+0.10);
                });
                if(pL){oL.connect(gL);gL.connect(pL);pL.connect(_sfxBus);}else{oL.connect(gL);gL.connect(_sfxBus);}
                if(pR){oR.connect(gR);gR.connect(pR);pR.connect(_sfxBus);}else{oR.connect(gR);gR.connect(_sfxBus);}
                oL.start(t+0.003); oL.stop(t+0.12);
                oR.start(t+0.003); oR.stop(t+0.12);
            }

            // ── Zincir 8+: perfect 5th akor katmani ─────────────────
            if(step>=8){
                const f5=f*1.498;
                const pL=_mkPan(ctx,-0.65), pR=_mkPan(ctx,0.65);
                [f5, f5*1.003].forEach((freq,i)=>{
                    const oo=ctx.createOscillator(), gg=ctx.createGain();
                    const pp=i===0?pL:pR;
                    oo.type="sine"; oo.frequency.value=freq;
                    gg.gain.setValueAtTime(0,t+0.006);
                    gg.gain.linearRampToValueAtTime(_vol(vol*0.35),t+0.014);
                    gg.gain.exponentialRampToValueAtTime(0.0001,t+0.12);
                    if(pp){oo.connect(gg);gg.connect(pp);pp.connect(_sfxBus);}
                    else{oo.connect(gg);gg.connect(_sfxBus);}
                    oo.start(t+0.006); oo.stop(t+0.14);
                });
            }
        },

        // ── XP GAIN (legacy alias — crystal rising arpeggio) ─────────
        xp_gain(){
            // Crystal sparkle XP — rising bell arpeggio + shimmer burst
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const root=_vary(880,40);
            [1, 1.2599, 1.4983, 2.0].forEach((ratio,i)=>{
                const st=t+i*0.038;
                const o=ctx.createOscillator(), g=ctx.createGain(), pan=_mkPan(ctx,_vary(0,0.5));
                o.type="sine"; o.frequency.value=root*ratio;
                g.gain.setValueAtTime(0,st);
                g.gain.linearRampToValueAtTime(_vol(0.22-i*0.025),st+0.008);
                g.gain.exponentialRampToValueAtTime(0.0001,st+0.20-i*0.02);
                o.connect(pan); pan.connect(g); g.connect(_sfxBus);
                o.start(st); o.stop(st+0.24);
            });
            _noise(t+0.04, 0.085, _vol(0.14), 7000, 18000);
            _osc("sine", root*0.5, t, 0.055, _vol(0.12), root*0.25);
            _osc("sine", root*3.96, t+0.10, 0.09, _vol(0.07), null, null, _vary(0,0.6));
        },



        // ── PLAYER HURT — metallic impact + bass thud ────────────
        player_hurt(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Metallic clang (high pitch, fast decay)
            _osc("square",  _vary(680), t, _vary(0.035,0.05), _vol(0.35), _vary(280));
            // Mid crunch impact
            _osc("sawtooth",_vary(180), t, _vary(0.07,0.08),  _vol(0.45), _vary(80));
            // Bass body hit
            _osc("sine",    _vary(60),  t, _vary(0.12,0.08),  _vol(0.40), _vary(30));
            // Sharp noise burst
            _noise(t, _vary(0.04,0.05), _vol(0.35), 300,4500);
            // Resonant ping
            _osc("sine",    _vary(1200),t+0.02, _vary(0.04,0.05), _vol(0.12), _vary(400));
        },

        // ── ENEMY GROUND — heavy thud when triangle hits ground ─────
        enemy_ground(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Deep bass thump
            _osc("sine", _vary(55), t, _vary(0.15,0.08), _vol(0.38), _vary(35));
            // Mid crunch
            _noise(t, _vary(0.06,0.05), _vol(0.22), 80, 600);
            // Short sharp attack
            _osc("triangle", _vary(120), t, _vary(0.04,0.05), _vol(0.18), _vary(60));
        },

        // ── GAME OVER (cinematic — NEVER abrupt) ─────────────────
        game_over(){
            const ctx=_getCtx(); if(!ctx) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",440, t,       0.70, _vol(0.38), 52);
            _osc("sine",370, t+0.35,  0.80, _vol(0.32), 44);
            _osc("sine",220, t+0.75,  0.90, _vol(0.38), 26);
            const o=ctx.createOscillator(), g=ctx.createGain();
            o.type="sawtooth";
            o.frequency.setValueAtTime(180,t+0.82);
            o.frequency.exponentialRampToValueAtTime(26,t+1.90);
            g.gain.setValueAtTime(_vol(0.35),t+0.82);
            g.gain.exponentialRampToValueAtTime(0.0001,t+2.30);
            o.connect(g); g.connect(_sfxBus);
            o.start(t+0.82); o.stop(t+2.40);
            _noise(t+0.72,1.5,_vol(0.16),40,650);
            _osc("sine",32,t+0.55,1.9,_vol(0.32),18);
        },

        // ── MENU CLICK ────────────────────────────────────────────
        menu_click(){
            // Crisp menu click — two-tone sine blip + sharp noise
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const o=ctx.createOscillator(), g=ctx.createGain(), p=_mkPan(ctx,_vary(0,0.15));
            o.type="sine"; o.frequency.setValueAtTime(_vary(1100,60),t);
            o.frequency.exponentialRampToValueAtTime(_vary(780,40),t+0.040);
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(_vol(0.72),t+0.005);
            g.gain.exponentialRampToValueAtTime(0.0001,t+0.055);
            o.connect(p); p.connect(g); g.connect(_uiBus);
            o.start(t); o.stop(t+0.065);
            // Second harmonic tail
            _osc("sine",_vary(550,30), t+0.018, 0.045, _vol(0.42), null, _uiBus);
            // Crisp click noise
            _noise(t, 0.010, _vol(0.38), 4500, 14000, _uiBus);
        },

        // ── MENU HOVER ────────────────────────────────────────────
        menu_hover(){
            // Dry, precise UI tick — subtle stereo whisper
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const pan=_vary(0,0.25);
            const o=ctx.createOscillator(), g=ctx.createGain(), p=_mkPan(ctx,pan);
            o.type="sine"; o.frequency.setValueAtTime(_vary(1400,80),t);
            o.frequency.exponentialRampToValueAtTime(_vary(880,40),t+0.018);
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(_vol(0.15),t+0.003);
            g.gain.exponentialRampToValueAtTime(0.0001,t+0.030);
            o.connect(p); p.connect(g); g.connect(_uiBus);
            o.start(t); o.stop(t+0.038);
            _noise(t, 0.008, _vol(0.07), 6500, 16000, _uiBus);
        },

        // ── BUTTON CONFIRM ────────────────────────────────────────
        button_confirm(){
            // Punchy confirm — tri-chord stab + snappy noise + low thud
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Chord stab: minor third stack — dark but satisfying
            [[392,0],[494,0.028],[587,0.052]].forEach(([f,dt])=>{
                const o=ctx.createOscillator(), g=ctx.createGain(), p=_mkPan(ctx,_vary(0,0.2));
                o.type="square"; o.frequency.value=f;
                g.gain.setValueAtTime(0,t+dt);
                g.gain.linearRampToValueAtTime(_vol(0.20),t+dt+0.006);
                g.gain.exponentialRampToValueAtTime(0.0001,t+dt+0.13);
                o.connect(p); p.connect(g); g.connect(_uiBus);
                o.start(t+dt); o.stop(t+dt+0.16);
            });
            // Snappy transient crack
            _noise(t, 0.012, _vol(0.18), 2500, 11000, _uiBus);
            // Low thud for weight
            _osc("sine",_vary(160), t, 0.06, _vol(0.28), _vary(60), _uiBus);
        },

        // ── UPGRADE SELECT — kick + snare + hihat darbesi ────────────
        // Kart secilince muzikle uyumlu bir davul vurumu hissi verir.
        // 3 katman: bas kick + snare crack + kisa hihat sisi
        upgrade_select(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;

            // Katman 1: Kick — bas sweep (132Hz→30Hz)
            const ok=ctx.createOscillator(), gk=ctx.createGain();
            const wk=ctx.createWaveShaper(); wk.curve=_distCurve(1.2);
            ok.type="sine"; ok.frequency.setValueAtTime(148,t);
            ok.frequency.exponentialRampToValueAtTime(30,t+0.18);
            gk.gain.setValueAtTime(_vol(1.10),t);
            gk.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
            ok.connect(wk); wk.connect(gk); gk.connect(_sfxBus);
            ok.start(t); ok.stop(t+0.25);
            // Kick sub
            const sk=ctx.createOscillator(), sgk=ctx.createGain();
            sk.type="sine"; sk.frequency.value=52;
            sgk.gain.setValueAtTime(_vol(0.65),t); sgk.gain.exponentialRampToValueAtTime(0.0001,t+0.10);
            sk.connect(sgk); sgk.connect(_sfxBus); sk.start(t); sk.stop(t+0.13);

            // Katman 2: Snare — triangle + noise (8ms gecikme)
            const os=ctx.createOscillator(), gs_=ctx.createGain();
            os.type="triangle"; os.frequency.setValueAtTime(240,t+0.008);
            os.frequency.exponentialRampToValueAtTime(100,t+0.12);
            gs_.gain.setValueAtTime(_vol(0.72),t+0.008);
            gs_.gain.exponentialRampToValueAtTime(0.0001,t+0.16);
            os.connect(gs_); gs_.connect(_sfxBus); os.start(t+0.008); os.stop(t+0.18);
            _noise(t+0.008, 0.14, _vol(0.55), 1200, 12000, _sfxBus);

            // Katman 3: Hihat — kisa yuksek frekans sisi (12ms gecikme)
            _noise(t+0.012, 0.022, _vol(0.32), 8000, 18000, _sfxBus,
                (Math.random()-0.5)*0.5);

            // Katman 4: "Secim" confirmation tonu — yuksek parlak nota
            _osc("sine", _vary(880, 0.05), t+0.04, 0.12, _vol(0.28), _vary(1320, 0.05));
        },

        // ── LEVEL UP SCREEN OPEN ──────────────────────────────────
        levelup_open(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",_vary(440), t,      _vary(0.12,0.05), _vol(0.32), _vary(880), _uiBus);
            _osc("sine",_vary(660), t+0.06, _vary(0.10,0.05), _vol(0.25), null, _uiBus);
            _noise(t,0.025,_vol(0.16),2500,12000,_uiBus);
        },

        // ── LEVEL UP SCREEN CLOSE ─────────────────────────────────
        levelup_close(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",_vary(880), t, _vary(0.08,0.05), _vol(0.18), _vary(440), _uiBus);
            _noise(t,0.014,_vol(0.08),3000,10000,_uiBus);
        },

        // ── UPGRADE PICKUP SOUNDS — category-based ──────────────────
        upgrade_weapon(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Metalik silah sesi — kisa, guclu
            _osc("sawtooth",_vary(220), t, 0.12, _vol(0.28), _vary(440));
            _osc("square",  _vary(330), t+0.04, 0.10, _vol(0.20), _vary(165));
            _osc("sine",    _vary(660), t+0.08, 0.14, _vol(0.22), _vary(880));
            _noise(t, 0.06, _vol(0.18), 1200, 8000);
        },
        upgrade_passive(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Yumusak guclenme — sicak, tatli
            _osc("sine",    _vary(440), t, 0.18, _vol(0.26), _vary(660));
            _osc("triangle",_vary(554), t+0.06, 0.14, _vol(0.18), _vary(880));
            _osc("sine",    _vary(880), t+0.12, 0.12, _vol(0.14));
            _noise(t+0.05, 0.04, _vol(0.10), 4000, 14000);
        },
        upgrade_heal(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Iyilesme — yukari dogru kristal arpej
            [523, 659, 784, 1047].forEach((f,i)=>{
                _osc("sine", f, t+i*0.055, 0.12, _vol(0.22));
            });
            _noise(t+0.15, 0.06, _vol(0.08), 6000, 16000);
        },
        upgrade_defensive(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Kalkan / savunma — derin bass + zirh sesi
            _osc("sine",    _vary(110), t, 0.20, _vol(0.30), _vary(55));
            _osc("triangle",_vary(220), t+0.03, 0.15, _vol(0.20), _vary(330));
            _noise(t, 0.08, _vol(0.16), 800, 4000);
            _osc("sine",    _vary(440), t+0.10, 0.10, _vol(0.14));
        },
        upgrade_utility(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Hiz/XP gibi utility — kisa bip bip
            _osc("sine",    _vary(660), t, 0.06, _vol(0.22), _vary(880));
            _osc("triangle",_vary(880), t+0.07, 0.06, _vol(0.18));
            _noise(t, 0.03, _vol(0.08), 5000, 12000);
        },

        // ── COUNTDOWN SOUNDS — 3, 2, 1, GO! ──────────────────────
        countdown_tick(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",    _vary(440), t, 0.08, _vol(0.35));
            _osc("triangle",_vary(440), t, 0.06, _vol(0.18), _vary(220));
            _noise(t, 0.02, _vol(0.10), 3000, 8000);
        },
        countdown_go(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Yukselen arpej — heyecan veren baslangic
            [440, 554, 660, 880, 1100].forEach((f,i)=>{
                _osc("sawtooth", f, t+i*0.04, 0.10, _vol(0.32), f*1.5);
                _osc("sine",     f, t+i*0.04, 0.12, _vol(0.20));
            });
            _noise(t+0.15, 0.08, _vol(0.20), 4000, 16000);
            _osc("sine", 55, t+0.18, 0.25, _vol(0.40), 28);
        },

        // ── COMBO MILESTONE — 5x, 10x, 15x, 20x+ ───────────────
        combo_milestone(tier=1){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const baseF = 330 + tier * 80;
            // Yukselen kristal akor
            [0, 4, 7].forEach((semi,i)=>{
                const f = baseF * Math.pow(2, semi/12);
                _osc("sine",     f, t+i*0.035, 0.12, _vol(0.22 + tier*0.03));
                _osc("triangle", f*2, t+i*0.035, 0.08, _vol(0.10));
            });
            if(tier >= 3) _osc("sine", baseF*2, t+0.15, 0.20, _vol(0.18), baseF*3);
            _noise(t+0.08, 0.04, _vol(0.08 + tier*0.02), 5000, 14000);
        },

        // ── PLAYER DASH — hizli hareket sesi ─────────────────────
        player_dash(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _noise(t, 0.06, _vol(0.12), 2000, 8000);
            _osc("sine", _vary(200), t, 0.04, _vol(0.10), _vary(80));
        },

        // ── FIRST BLOOD — ilk oldurme ────────────────────────────
        first_blood(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",     _vary(440), t, 0.15, _vol(0.28), _vary(660));
            _osc("sawtooth", _vary(330), t+0.05, 0.12, _vol(0.22), _vary(660));
            _osc("sine",     _vary(880), t+0.12, 0.18, _vol(0.18));
            _noise(t+0.08, 0.06, _vol(0.14), 3000, 12000);
        },

        // ── BOSS SPAWN (dramatic, alarming) ──────────────────────
        boss_spawn(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",35, t, 0.80, _vol(0.92), 18);
            _osc("sine",70, t, 0.50, _vol(0.68), 30);
            const o=ctx.createOscillator(), g=ctx.createGain(), d=ctx.createWaveShaper();
            d.curve=_distCurve(8);
            o.type="sawtooth"; o.frequency.setValueAtTime(180,t);
            o.frequency.exponentialRampToValueAtTime(42,t+1.3);
            g.gain.setValueAtTime(_vol(0.56),t);
            g.gain.exponentialRampToValueAtTime(0.0001,t+1.6);
            o.connect(d); d.connect(g); g.connect(_sfxBus);
            o.start(t); o.stop(t+1.7);
            _noise(t,0.85,_vol(0.40),80,2800);
            _osc("square",440,t,      0.30,_vol(0.26),880);
            _osc("square",880,t+0.30, 0.30,_vol(0.22),440);
        },

        // ── BOSS HIT ──────────────────────────────────────────────
        boss_hit(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",  _vary(44),  t, _vary(0.18,0.05), _vol(0.88), _vary(18));
            _osc("square",_vary(200), t, _vary(0.08,0.05), _vol(0.44), _vary(60));
            _noise(t, _vary(0.07,0.05), _vol(0.60), 150,3200);
            _noise(t+0.04, 0.12, _vol(0.24), 3000,13000);
        },

        // ── BOSS DEATH (massive cinematic) ────────────────────────
        boss_death(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",40, t, 1.20, _vol(1.0),  18);
            _osc("sine",80, t, 0.80, _vol(0.78), 26);
            _noise(t,0.55,_vol(0.72),100,7000);
            _noise(t+0.30,0.85,_vol(0.32),28,400);
            _osc("sawtooth",300, t+0.50, 1.10, _vol(0.40), 28);
            [880,1100,1320].forEach((f,i)=>{ _osc("sine",f,t+1.05+i*0.08,0.55,_vol(0.22)); });
        },

        // ── CHEST OPEN (rarity-aware layering) ───────────────────
        chest_open(rarity="common"){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const tiers={
                legendary:{notes:[196,247,330,440,554,659,880,1100], vol:0.42, spd:0.054},
                rare:     {notes:[196,247,330,440,659],              vol:0.33, spd:0.068},
                common:   {notes:[196,247,330,440],                  vol:0.27, spd:0.080},
            };
            const tier=tiers[rarity]||tiers.common;
            tier.notes.forEach((f,i)=>{
                const st=t+i*tier.spd;
                _osc("sine",    f,   st, 0.35, _vol(tier.vol),        null, null, _vary(0,0.35));
                _osc("triangle",f*2, st, 0.25, _vol(tier.vol*0.35),   null, null, _vary(0,0.35));
            });
            _noise(t,0.07,_vol(0.17),3000,12000);
            if(rarity==="legendary"){
                _osc("sine",40,t,0.58,_vol(0.58),22);
                _noise(t+0.40,0.22,_vol(0.30),1500,11000);
                [1320,1568,1760].forEach((f,i)=>{ _osc("sine",f,t+0.36+i*0.055,0.28,_vol(0.20)); });
            }else if(rarity==="rare"){
                _osc("sine",55,t,0.36,_vol(0.40),28);
                _noise(t+0.26,0.13,_vol(0.20),2000,9500);
            }
        },

        // ── REVIVE ────────────────────────────────────────────────
        revive(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine",220, t,       0.52, _vol(0.56), 880);
            _osc("sine",440, t+0.15,  0.42, _vol(0.42), 1320);
            _osc("sine",660, t+0.30,  0.36, _vol(0.34), 1760);
            [880,1100,1320].forEach((f,i)=>{ _osc("sine",f,t+0.52+i*0.04,0.58,_vol(0.22)); });
            _noise(t+0.50,0.20,_vol(0.30),3000,16000);
            _osc("sine",55,t+0.46,0.44,_vol(0.50),28);
        },

        // ── FOOTSTEP (natural, random pitch/vol/pan) ──────────────
        // ── PIXEL / ENEMY EXPLODE ────────────────────────────────────
        pixel_explode(){
            // Tatli pixel patlama — yumusak "pop" + neseli parcacik sacilmasi
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sine", _vary(320,15), t, _vary(0.09,0.04), _vol(0.58), _vary(80));
            _osc("triangle", _vary(480,20), t, _vary(0.07,0.04), _vol(0.38), _vary(120));
            const bo=ctx.createOscillator(), bg=ctx.createGain();
            bo.type="sine";
            bo.frequency.setValueAtTime(_vary(260,20),t);
            bo.frequency.exponentialRampToValueAtTime(_vary(680,30),t+0.055);
            bo.frequency.exponentialRampToValueAtTime(_vary(180,15),t+0.13);
            bg.gain.setValueAtTime(0,t);
            bg.gain.linearRampToValueAtTime(_vol(0.42),t+0.008);
            bg.gain.exponentialRampToValueAtTime(0.0001,t+0.16);
            bo.connect(bg); bg.connect(_sfxBus);
            bo.start(t); bo.stop(t+0.18);
            const sparkFreqs=[900,1200,1600,2100,1800,2500];
            sparkFreqs.forEach((f,i)=>{
                const dt=i*0.014+Math.random()*0.010;
                const pan=_vary(0,0.75);
                _osc("sine", _vary(f,0.12), t+dt, _vary(0.038,0.08), _vol(0.10+Math.random()*0.06), null, null, pan);
            });
            _noise(t, _vary(0.048,0.06), _vol(0.28), 800, 6000);
            _noise(t+0.04, _vary(0.055,0.06), _vol(0.14), 3000, 11000);
            [[1047,0.06],[1319,0.09],[1568,0.12]].forEach(([f,dt])=>{
                _osc("sine",_vary(f,0.05), t+dt, 0.065, _vol(0.09), null, null, _vary(0,0.6));
            });
        },

        footstep(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const pV=_vary(1.0,0.16), vV=_vary(1.0,0.20), pan=_vary(0,0.40);
            _osc("sine",90*pV, t, _vary(0.040,0.12), _vol(0.28*vV), 33, null, pan);
            _noise(t, _vary(0.028,0.15), _vol(0.20*vV), 110,850, null, pan);
            if(Math.random()<0.42) _noise(t,0.008,_vol(0.07*vV),2000,6000, null, pan);
        },

        // ── WEAPON SFX — Lightning, Thunder, Saw, Poison, Laser, Drone ──
        // All volumes kept low-to-mid so they never overpower the music.

        sfx_lightning(){
            // Crackling electric snap — short, sharp, high-frequency
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime, pan=_vary(0,0.55);
            // Main snap — fast rising then falling freq
            const o=ctx.createOscillator(), g=ctx.createGain();
            o.type="square";
            o.frequency.setValueAtTime(_vary(880,0.12),t);
            o.frequency.exponentialRampToValueAtTime(_vary(3400,0.10),t+0.018);
            o.frequency.exponentialRampToValueAtTime(_vary(220,0.08),t+0.065);
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(_vol(0.28),t+0.006);
            g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);
            o.connect(g); g.connect(_sfxBus);
            o.start(t); o.stop(t+0.10);
            try{o.onended=()=>_releaseVoice();}catch(e){setTimeout(()=>_releaseVoice(),150);}
            if(!_acquireVoice()) return;
            // Static crackle layer
            _noise(t,       _vary(0.022,0.1), _vol(0.22), 3500, 16000, null, pan);
            _noise(t+0.012, _vary(0.038,0.1), _vol(0.14), 1200,  7000, null, pan);
            // Sub-tick aftermath
            _osc("sine", _vary(140,0.08), t+0.04, 0.055, _vol(0.10), _vary(55,0.1), null, pan);
        },

        sfx_thunder(){
            // Deep resonant thunderclap — low boom + rumble tail
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Core boom — low sine impact
            _osc("sine",   _vary(52,0.08),  t,        _vary(0.22,0.06), _vol(0.38), _vary(28,0.1));
            _osc("sine",   _vary(36,0.08),  t+0.04,   _vary(0.30,0.06), _vol(0.30), _vary(18,0.1));
            // Mid crack
            _osc("sawtooth",_vary(180,0.1), t,        _vary(0.055,0.08),_vol(0.22), _vary(60,0.1));
            // Rumble noise tail
            _noise(t,       _vary(0.08,0.06),_vol(0.28), 40,  500);
            _noise(t+0.06,  _vary(0.22,0.06),_vol(0.14), 30,  280);
            // High crack transient
            _noise(t,       _vary(0.012,0.1),_vol(0.20), 900, 5000);
        },

        sfx_saw_hit(){
            // Metallic screech & grind — brief, industrial
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime, pan=_vary(0,0.5);
            // Metal grind — sawtooth sweep up
            _osc("sawtooth", _vary(320,0.12), t, _vary(0.040,0.1), _vol(0.26), _vary(1100,0.08), null, pan);
            // Impact click
            _noise(t,  _vary(0.010,0.1), _vol(0.30), 2200, 12000, null, pan);
            // Resonant ring-out
            _osc("sine", _vary(2200,0.06), t+0.008, _vary(0.055,0.08), _vol(0.12), _vary(800,0.1), null, pan);
        },

        sfx_poison(){
            // Wet bubbling + toxic hiss — organic, disgusting in the best way
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Bubble blurp — triangle with fast pitch drop
            _osc("triangle", _vary(520,0.12), t,       _vary(0.065,0.08), _vol(0.22), _vary(90,0.1));
            _osc("triangle", _vary(390,0.10), t+0.03,  _vary(0.055,0.08), _vol(0.18), _vary(70,0.1));
            _osc("triangle", _vary(640,0.10), t+0.055, _vary(0.045,0.08), _vol(0.14), _vary(110,0.1));
            // Hiss layer — mid filtered noise
            _noise(t,      _vary(0.095,0.08), _vol(0.18), 600,  4500);
            _noise(t+0.04, _vary(0.10, 0.08), _vol(0.10), 300,  1800);
        },

        sfx_laser(){
            // Charged beam fire — rising whine + hard impact buzz
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime, pan=_vary(0,0.2);
            // Rising whine — sine sweep
            const o=ctx.createOscillator(), g=ctx.createGain();
            o.type="sine";
            o.frequency.setValueAtTime(_vary(380,0.08),t);
            o.frequency.exponentialRampToValueAtTime(_vary(2800,0.06),t+0.12);
            o.frequency.exponentialRampToValueAtTime(_vary(620,0.08),t+0.22);
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(_vol(0.30),t+0.04);
            g.gain.exponentialRampToValueAtTime(0.0001,t+0.24);
            const p=_mkPan(ctx,pan);
            if(p){o.connect(g);g.connect(p);p.connect(_sfxBus);}else{o.connect(g);g.connect(_sfxBus);}
            o.start(t); o.stop(t+0.26);
            try{o.onended=()=>_releaseVoice();}catch(e){setTimeout(()=>_releaseVoice(),300);}
            if(!_acquireVoice()) return;
            // Beam buzz
            _osc("sawtooth", _vary(1400,0.08), t+0.08, _vary(0.10,0.06), _vol(0.14), _vary(420,0.1), null, pan);
            // Crisp impact noise
            _noise(t+0.10, _vary(0.060,0.08), _vol(0.18), 2000, 10000, null, pan);
        },

        sfx_drone(){
            // Quick mechanical blaster pew — tight, punchy, robotic
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime, pan=_vary(0,0.60);
            // Main pew — descending square
            _osc("square", _vary(640,0.10), t, _vary(0.028,0.08), _vol(0.22), _vary(180,0.1), null, pan);
            // Harmonic layer
            _osc("sine",   _vary(1280,0.08),t, _vary(0.020,0.08), _vol(0.12), _vary(360,0.1), null, pan);
            // Click transient
            _noise(t, _vary(0.008,0.1), _vol(0.18), 3000, 12000, null, pan);
        },

        // ── PYRAMID SWOOP — enemy descend air-rush ────────────────
        // Very subtle whoosh — felt rather than heard. Bandpass noise
        // that sweeps downward, panned randomly for spatial presence.
        // Volume is intentionally low: this runs on every enemy spawn.
        pyramid_swoop(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const pan=_vary(0,0.65);
            // Main swoop: bandpass noise with falling filter sweep
            const sr=ctx.sampleRate, len=Math.ceil(sr*0.22);
            const buf=ctx.createBuffer(1,len,sr);
            const d=buf.getChannelData(0);
            for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
            const src=ctx.createBufferSource(); src.buffer=buf;
            const bpf=ctx.createBiquadFilter();
            bpf.type="bandpass";
            // Filter sweeps: 1800Hz → 480Hz — the "falling through air" sensation
            bpf.frequency.setValueAtTime(1800,t);
            bpf.frequency.exponentialRampToValueAtTime(480,t+0.18);
            bpf.Q.value=2.2;
            const g=ctx.createGain();
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(_vol(0.055),t+0.022); // very quiet
            g.gain.exponentialRampToValueAtTime(0.0001,t+0.20);
            const p=_mkPan(ctx,pan);
            src.connect(bpf); bpf.connect(g);
            if(p){g.connect(p);p.connect(_sfxBus);}else{g.connect(_sfxBus);}
            src.start(t); src.stop(t+0.23);
        },
    };

    // ── Footstep timer state ──────────────────────────────────────
    let _lastStepTime    = 0;
    const _STEP_INTERVAL = 268; // ms between footsteps

    // ── XP pickup variant tracker (avoids exact repeat) ──────────
    let _xpLastVariant = -1;

    // ── XP chain melody state ─────────────────────────────────────
    // Hizli ardisik XP toplamada yukselen melodi olusturur.
    // Her pickup'ta bir sonraki nota calinir; 380ms boslukta sifirlanir.
    let _xpChainStep  = 0;
    let _xpChainLast  = 0; // timestamp of last pickup (ms)
    const _XP_CHAIN_GAP = 380; // ms — this gap resets the chain
    // Am pentatonic (A4→E7) — 12 adim, hep temiz kulaga gelir
    const _XP_SCALE = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5, 1568, 1760, 2093];

    // ── Kill chain state (managed at top level by spawnKillText) ─

    // ── Triangle Wind Ambience ────────────────────────────────────
    let _windNode   = null;
    let _windGain   = null;
    let _windActive = false;

    function _startWindAmbience(){
        if(_windActive) return;
        const ctx=_getCtx(); if(!ctx) return;
        _windActive=true;
        // Pink noise source via AudioWorklet fallback: chained biquad-filtered white noise
        const bufSec=2, sr=ctx.sampleRate;
        const buf=ctx.createBuffer(1,Math.floor(sr*bufSec),sr);
        const data=buf.getChannelData(0);
        // Pink-ish noise: sum of 3 octave-spaced white noise streams
        let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0;
        for(let i=0;i<data.length;i++){
            const white=(Math.random()*2-1);
            b0=0.99886*b0+white*0.0555179; b1=0.99332*b1+white*0.0750759;
            b2=0.96900*b2+white*0.1538520; b3=0.86650*b3+white*0.3104856;
            b4=0.55000*b4+white*0.5329522; b5=-0.7616*b5-white*0.0168980;
            data[i]=(b0+b1+b2+b3+b4+b5+white*0.5362)*0.11;
        }
        _windNode=ctx.createBufferSource();
        _windNode.buffer=buf; _windNode.loop=true;

        // Band-pass around 200–900 Hz — classic wind rush
        const lpf=ctx.createBiquadFilter(); lpf.type="lowpass";  lpf.frequency.value=900; lpf.Q.value=0.6;
        const hpf=ctx.createBiquadFilter(); hpf.type="highpass"; hpf.frequency.value=180; hpf.Q.value=0.5;

        // Slow LFO tremolo (0.12 Hz) — wind gusts
        const lfoSrc=ctx.createOscillator(); lfoSrc.frequency.value=0.12;
        const lfoGain=ctx.createGain(); lfoGain.gain.value=0.18;
        lfoSrc.connect(lfoGain);

        _windGain=ctx.createGain(); _windGain.gain.value=0;
        lfoGain.connect(_windGain.gain); // AM modulation
        _windNode.connect(hpf); hpf.connect(lpf); lpf.connect(_windGain);
        _windGain.connect(_ambBus);
        _windNode.start();
        lfoSrc.start();
        // Fade in over 1.8 s
        const now=ctx.currentTime;
        _windGain.gain.setValueAtTime(0,now);
        _windGain.gain.linearRampToValueAtTime(0.28,now+1.8);
    }

    function _stopWindAmbience(fadeTime=1.5){
        if(!_windActive||!_windGain||!_ctx) return;
        _windActive=false;
        const now=_ctx.currentTime;
        _windGain.gain.cancelScheduledValues(now);
        _windGain.gain.linearRampToValueAtTime(0,now+fadeTime);
        const node=_windNode; _windNode=null;
        setTimeout(()=>{ try{ node.stop(); }catch(_){} }, (fadeTime+0.1)*1000 );
    }


    // ── Public API ────────────────────────────────────────────────
    function play(name, ...args){
        if(!_sfxOn()) return;
        try{ if(SFX[name]) SFX[name](...args); }
        catch(e){ console.warn("[NT_SFX]",name,e); }
    }

    function footstepTick(isMoving){
        if(!_sfxOn()||!isMoving) return;
        const now=performance.now();
        if(now-_lastStepTime<_STEP_INTERVAL) return;
        _lastStepTime=now;
        play("footstep");
    }

    function startMusic(){ _startMusic(); }
    function stopMusic(fade){ _stopMusic(fade); }

    // State-based music transitions: "menu"|"gameplay"|"high_combo"|"boss"|"outro"
    function setMusicState(state, xfadeTime=2.0){ _setMusicState(state, xfadeTime); }

    function setMasterVolume(v){
        if(!_ctx||!_masterGain) return;
        const val=Math.max(0,Math.min(1,v));
        _masterGain.gain.cancelScheduledValues(_ctx.currentTime);
        _masterGain.gain.linearRampToValueAtTime(val,_ctx.currentTime+0.06);
    }

    function setSFXVolume(v){
        _sfxVol=Math.max(0,Math.min(1,v));
        if(_sfxBus&&_ctx) _sfxBus.gain.setValueAtTime(_sfxVol,_ctx.currentTime);
    }

    function setMusicVolume(v){
        const val=Math.max(0,Math.min(1,v));
        window._nt_mus_vol=val;
        if(!_ctx||!_musBus) return;
        _musBus.gain.cancelScheduledValues(_ctx.currentTime);
        _musBus.gain.linearRampToValueAtTime(val*0.88, _ctx.currentTime+0.12);
    }

    // Smooth pause — fades music+SFX down, SFX stops scheduling
    function pauseAudio(fadeTime=0.28){
        if(_paused||!_ctx) return;
        _paused=true;
        const now=_ctx.currentTime;
        if(_musBus){ _musBus.gain.cancelScheduledValues(now); _musBus.gain.linearRampToValueAtTime(0,now+fadeTime); }
        if(_sfxBus){ _sfxBus.gain.cancelScheduledValues(now); _sfxBus.gain.linearRampToValueAtTime(0,now+fadeTime); }
    }

    // Resume from pause
    function resumeAudio(fadeTime=0.28){
        if(!_paused||!_ctx) return;
        _paused=false;
        const now=_ctx.currentTime;
        if(_musBus){ _musBus.gain.cancelScheduledValues(now); _musBus.gain.linearRampToValueAtTime(_mVol(0.88),now+fadeTime); }
        if(_sfxBus){ _sfxBus.gain.cancelScheduledValues(now); _sfxBus.gain.linearRampToValueAtTime(_sfxVol,now+fadeTime); }
    }

    // Low HP heartbeat mode
    function setLowHPMode(active){ if(active) _startHeartbeat(); else _stopHeartbeat(); }

    // ── Init on first user gesture ────────────────────────────────
    let _initDone=false;
    function _initOnGesture(){
        // [FIX-SES] Her gesture'da _resume() çağır — context suspended kalırsa
        // ilk gesture'dan sonra bir daha resume edilmiyordu. Şimdi her dokunuşta
        // context zaten running ise resume() hızla döner (no-op), suspended ise kurtarır.
        if(!_initDone){ _initDone=true; _getCtx(); }
        _resume();
    }
    ["pointerdown","keydown","touchstart"].forEach(ev=>{
        document.addEventListener(ev,_initOnGesture,{once:false,capture:true,passive:true});
    });

    return {
        play, footstepTick,
        startMusic, stopMusic, setMusicState,
        setMasterVolume, setSFXVolume, setMusicVolume,
        pauseAudio, resumeAudio, setLowHPMode,
        startWindAmbience: _startWindAmbience,
        stopWindAmbience:  _stopWindAmbience,
    };
})();

// ─── IAP / GEM STORE ─────────────────────────────────────────
// ── SAHNE ANAHTARI SABITI — tum isActive/key referanslari buradan ──────────
// Sahne adini degistirmek istersen yalnizca bu satiri guncelle.
const SCENE_KEY = "SceneGame";

const GEM_PACKS=[
    {gems:50,   price:"$0.99",  bonus:0,   tag:null,      popular:false},
    {gems:130,  price:"$1.99",  bonus:10,  tag:"popular",  popular:true},
    {gems:320,  price:"$3.99",  bonus:30,  tag:null,       popular:false},
    {gems:750,  price:"$7.99",  bonus:100, tag:"best",     popular:false},
    {gems:1800, price:"$14.99", bonus:300, tag:null,       popular:false},
];

// ── GUVENLIK: Checksum sistemi — kritik deger manipulasyonunu tespit eder
const _STORAGE_SALT = "nt_v9_" + (navigator.userAgent.slice(0,8)||"xx");
function _hash(val){
    let h = 5381;
    const s = String(val) + _STORAGE_SALT;
    for(let i = 0; i < s.length; i++){
        h = ((h << 5) + h) + s.charCodeAt(i);
        h = h & 0xffffffff;
    }
    return (h >>> 0).toString(36);
}
function secureSet(key, val){
    const v = String(val);
    localStorage.setItem(key, v);
    localStorage.setItem(key+"_chk", _hash(v));
}
function secureGet(key, defaultVal, resetVal){
    const v = localStorage.getItem(key);
    const chk = localStorage.getItem(key+"_chk");
    if(v === null) return defaultVal;
    if(_hash(v) !== chk){
        console.warn("[NT] Integrity check failed:", key);
        secureSet(key, resetVal !== undefined ? resetVal : defaultVal);
        return defaultVal;
    }
    return v;
}
let PLAYER_GEMS=parseInt(secureGet("nt_gems","0","0"));
function addGems(n){PLAYER_GEMS=Math.max(0,PLAYER_GEMS+n);secureSet("nt_gems",PLAYER_GEMS);}
function spendGems(n){if(PLAYER_GEMS<n)return false;PLAYER_GEMS-=n;secureSet("nt_gems",PLAYER_GEMS);return true;}

// ═══════════════════════════════════════════════════════════════
// PLAYER LEVEL SYSTEM — persistent level, prestige, gold rewards
// ═══════════════════════════════════════════════════════════════
let PLAYER_LEVEL    = parseInt(secureGet("nt_plv",   "1", "1"));
let PLAYER_LEVEL_XP = parseInt(secureGet("nt_plvxp", "0", "0"));
let PLAYER_PRESTIGE = parseInt(secureGet("nt_prestige","0","0"));

function _plvXpNeeded(lv){
    // XP needed to go from level lv to lv+1
    // Lv1-10:  base growth ×1.38
    // Lv11-25: moderate growth ×1.48
    // Lv26-40: steep growth ×1.58
    // Lv41+:   very steep ×1.70
    let xp = 1200;
    for(let i = 1; i < lv; i++){
        const mult = i <= 10 ? 1.38
                   : i <= 25 ? 1.48
                   : i <= 40 ? 1.58
                   : 1.70;
        xp = Math.round(xp * mult);
    }
    return xp;
}
function _plvGoldReward(lv){
    // Gold reward when reaching level lv
    return 150 + lv * 50;
}
function _plvPrestigeMultiplier(){
    // Permanent gold multiplier from prestige
    return 1.0 + PLAYER_PRESTIGE * 0.10;
}
function _plvSave(){
    secureSet("nt_plv",    PLAYER_LEVEL);
    secureSet("nt_plvxp",  PLAYER_LEVEL_XP);
    secureSet("nt_prestige", PLAYER_PRESTIGE);
}

// Calculate XP earned from a game session
// XP SADECE oldurdugun ucgenlerden gelir — diger kaynaklar kaldirildi
function _plvCalcSessionXP(gs){
    if(!gs) return 0;
    // Normal ucgen: 6 XP, Elite/Elder/Titan: 18 XP, Boss: 50 XP
    const kills      = gs.kills      || 0;
    const bossKills  = gs._bossKills  || 0;
    const eliteKills = gs._eliteKills || 0;
    const normalKills = Math.max(0, kills - bossKills - eliteKills);
    let total = normalKills * 6 + eliteKills * 18 + bossKills * 50;
    if(total === 0 && kills > 0) total = kills * 6; // fallback
    // 2X XP boost
    if(typeof NT_Monetization !== "undefined" && NT_Monetization.getXPMultiplier){
        total = Math.round(total * NT_Monetization.getXPMultiplier());
    }
    return Math.max(1, total);
}

// Process XP gain — returns {levelsGained, goldEarned, newLevel, xpEarned}
function _plvAddXP(amount){
    let levelsGained = 0;
    let goldEarned = 0;
    PLAYER_LEVEL_XP += amount;
    
    let needed = _plvXpNeeded(PLAYER_LEVEL);
    while(PLAYER_LEVEL_XP >= needed){
        PLAYER_LEVEL_XP -= needed;
        PLAYER_LEVEL++;
        levelsGained++;
        const reward = Math.round(_plvGoldReward(PLAYER_LEVEL) * _plvPrestigeMultiplier());
        goldEarned += reward;
        PLAYER_GOLD += reward;
        secureSet("nt_gold", PLAYER_GOLD);
        needed = _plvXpNeeded(PLAYER_LEVEL);
    }
    _plvSave();
    return { levelsGained, goldEarned, newLevel: PLAYER_LEVEL, xpEarned: amount };
}

// Prestige — resets level to 1, increments prestige counter
function _plvPrestige(){
    if(PLAYER_LEVEL < 50) return false;
    PLAYER_PRESTIGE++;
    PLAYER_LEVEL = 1;
    PLAYER_LEVEL_XP = 0;
    _plvSave();
    return true;
}


// ═══════════════════════════════════════════════════════════════════════════
// NOT FAIR — AAA MONETIZATION ENGINE v4.0
// Professional redesign: unified rewards, animations, consistent UI
// ═══════════════════════════════════════════════════════════════════════════

const NT_Monetization = (function(){
"use strict";

const _F = "LilitaOne, Arial, sans-serif";
const W=360, H=640, CX=180;

// ═══════════════════════════════════════════════════════════════
// §1  UNIFIED REWARD ANIMATION SYSTEM
//     Every reward in the game flows through here
// ═══════════════════════════════════════════════════════════════

function showBigReward(scene, x, y, type, amount, depth){
    const D = depth || 800;
    const isGem   = type==="gem";
    const isChest = type==="chest";
    const icon    = isGem ? "GEM" : isChest ? "CHEST" : "GOLD";
    const col     = isGem ? 0xcc44ff : isChest ? 0xffaa00 : 0xffcc00;
    const colStr  = isGem ? "#dd88ff" : isChest ? "#ffcc44" : "#ffdd44";

    // 1) Screen flash
    const flash = scene.add.graphics().setDepth(D+30);
    flash.fillStyle(col, 0.22); flash.fillRect(0,0,W,H);
    scene.tweens.add({targets:flash, alpha:0, duration:350, onComplete:()=>flash.destroy()});

    // 2) Camera shake
    scene.cameras.main.shake(50, 0.010);

    // 3) Radial particle burst (24 particles)
    for(let i=0; i<24; i++){
        const ang = (Math.PI*2/24)*i;
        const spd = Phaser.Math.Between(45, 130);
        const sz  = Phaser.Math.Between(2, 5);
        const p = scene.add.graphics().setDepth(D+31);
        p.fillStyle(col, 0.9); p.fillCircle(0, 0, sz);
        p.x = x; p.y = y;
        scene.tweens.add({
            targets: p,
            x: x + Math.cos(ang) * spd,
            y: y + Math.sin(ang) * spd * 0.7,
            alpha: 0, scaleX: 0.05, scaleY: 0.05,
            duration: Phaser.Math.Between(300, 600),
            ease: "Quad.easeOut",
            onComplete: () => p.destroy()
        });
    }

    // 4) Ring expansion (2 rings)
    for(let r=0; r<2; r++){
        scene.time.delayedCall(r*80, ()=>{
            const ring = scene.add.graphics().setDepth(D+30);
            ring.x = x; ring.y = y;
            ring.lineStyle(3, col, 0.8);
            ring.strokeCircle(0, 0, 8 + r*10);
            scene.tweens.add({
                targets: ring, scaleX: 4+r, scaleY: 4+r, alpha: 0,
                duration: 450, ease:"Quad.easeOut", onComplete:()=>ring.destroy()
            });
        });
    }

    // 5) BIG reward text — scale bounce + float up
    const txt = scene.add.text(x, y-10, "+"+amount+" "+icon, {
        fontFamily: _F, fontSize: "28px", color: colStr,
        stroke: "#000000", strokeThickness: 4
    }).setOrigin(0.5).setDepth(D+32).setAlpha(0).setScale(0.3);

    scene.tweens.add({
        targets: txt, alpha: 1, scaleX: 1.15, scaleY: 1.15, y: y-55,
        duration: 400, ease: "Back.easeOut",
        onComplete: ()=>{
            // Settle to 1.0
            scene.tweens.add({targets:txt, scaleX:1, scaleY:1, duration:150, ease:"Quad.easeOut"});
            // Hold, then fade
            scene.time.delayedCall(1400, ()=>{
                scene.tweens.add({targets:txt, alpha:0, y:y-80, duration:350, ease:"Quad.easeIn", onComplete:()=>txt.destroy()});
            });
        }
    });

    // 6) Secondary label
    const label = isGem ? "GEMS" : "GOLD";
    const sub = scene.add.text(x, y-10, label, {
        fontFamily: _F, fontSize: "11px", color: colStr,
        stroke: "#000000", strokeThickness: 2
    }).setOrigin(0.5).setDepth(D+32).setAlpha(0);
    scene.tweens.add({
        targets: sub, alpha: 0.7, y: y-30, duration: 500, delay: 200, ease: "Quad.easeOut",
        onComplete: ()=>{
            scene.time.delayedCall(1200, ()=>{
                scene.tweens.add({targets:sub, alpha:0, duration:300, onComplete:()=>sub.destroy()});
            });
        }
    });

    // 7) Actually give the reward
    if(isGem) addGems(amount);
    else if(isChest){ PLAYER_GOLD += 500; secureSet("nt_gold", PLAYER_GOLD); addGems(10); }
    else { PLAYER_GOLD += amount; secureSet("nt_gold", PLAYER_GOLD); }
}

// Skin reward animation for chest drops
function showSkinReward(scene, x, y, skin, depth){
    const D = depth || 800;
    const col = skin.col;
    const colStr = "#"+col.toString(16).padStart(6,"0");
    const rarCols = {COMMON:"#999999",RARE:"#4488ff",EXOTIC:"#bb44ff",LEGENDARY:"#ffaa00"};
    const rarCol = rarCols[skin.rar]||"#ffffff";

    // 1) Screen flash
    const flash = scene.add.graphics().setDepth(D+30);
    flash.fillStyle(col, 0.30); flash.fillRect(0,0,W,H);
    scene.tweens.add({targets:flash, alpha:0, duration:500, onComplete:()=>flash.destroy()});

    // 2) Camera shake (bigger for rarer)
    const shakeAmt = skin.tier===4?0.025:skin.tier===3?0.018:skin.tier===2?0.012:0.008;
    scene.cameras.main.shake(80, shakeAmt);

    // 3) Radial particle burst
    const pCount = 12 + skin.tier*8;
    for(let i=0; i<pCount; i++){
        const ang = (Math.PI*2/pCount)*i;
        const spd = Phaser.Math.Between(50, 150);
        const sz  = Phaser.Math.Between(2, 5+skin.tier);
        const p = scene.add.graphics().setDepth(D+31);
        p.fillStyle(col, 0.9); p.fillCircle(0, 0, sz);
        p.x = x; p.y = y;
        scene.tweens.add({targets:p,x:x+Math.cos(ang)*spd,y:y+Math.sin(ang)*spd*0.7,alpha:0,scaleX:0.05,scaleY:0.05,duration:Phaser.Math.Between(350,700),ease:"Quad.easeOut",onComplete:()=>p.destroy()});
    }

    // 4) Ring expansion
    for(let r=0; r<3; r++){
        scene.time.delayedCall(r*100, ()=>{
            const ring = scene.add.graphics().setDepth(D+30);
            ring.x = x; ring.y = y;
            ring.lineStyle(3+skin.tier, col, 0.8);
            ring.strokeCircle(0, 0, 8+r*12);
            scene.tweens.add({targets:ring,scaleX:4+r,scaleY:4+r,alpha:0,duration:500,ease:"Quad.easeOut",onComplete:()=>ring.destroy()});
        });
    }

    // 5) Skin name text
    const catIcon = skin.cat==="weapon"?"⚔️":"🛡️";
    const txt = scene.add.text(x, y-10, catIcon+" "+skin.name, {
        fontFamily:_F, fontSize:"22px", color:colStr,
        stroke:"#000000", strokeThickness:5
    }).setOrigin(0.5).setDepth(D+32).setAlpha(0).setScale(0.3);

    scene.tweens.add({targets:txt,alpha:1,scaleX:1.15,scaleY:1.15,y:y-55,duration:450,ease:"Back.easeOut",
        onComplete:()=>{
            scene.tweens.add({targets:txt,scaleX:1,scaleY:1,duration:150,ease:"Quad.easeOut"});
            scene.time.delayedCall(2000,()=>{
                scene.tweens.add({targets:txt,alpha:0,y:y-80,duration:350,ease:"Quad.easeIn",onComplete:()=>txt.destroy()});
            });
        }
    });

    // 6) Rarity label
    const sub = scene.add.text(x, y-10, (CURRENT_LANG==="tr"?({COMMON:"SIRADAN",RARE:"NADIR",EXOTIC:"EGZOTIK",LEGENDARY:"EFSANE"}[skin.rar]||skin.rar):skin.rar)+" "+(CURRENT_LANG==="tr"?({weapon:"SILAH",char:"KARAKTER"}[skin.cat]||skin.cat.toUpperCase())+" KOSTUMU":skin.cat.toUpperCase()+" SKIN"), {
        fontFamily:_F, fontSize:"11px", color:rarCol,
        stroke:"#000000", strokeThickness:2
    }).setOrigin(0.5).setDepth(D+32).setAlpha(0);
    scene.tweens.add({targets:sub,alpha:0.85,y:y-28,duration:500,delay:200,ease:"Quad.easeOut",
        onComplete:()=>{scene.time.delayedCall(1600,()=>scene.tweens.add({targets:sub,alpha:0,duration:300,onComplete:()=>sub.destroy()}));}
    });

    // 7) Unlock the skin
    _unlockSkin(skin.id);
}

// Small utility for booster reward (no currency)
function showBoosterReward(scene, x, y, name, depth){
    const D = depth||800;
    scene.cameras.main.shake(40, 0.008);
    const txt = scene.add.text(x, y-15, "🔥 "+name+" ACTIVATED", {
        fontFamily:_F, fontSize:"18px", color:"#ff8844", stroke:"#000", strokeThickness:3
    }).setOrigin(0.5).setDepth(D+32).setAlpha(0).setScale(0.4);
    scene.tweens.add({targets:txt, alpha:1, scaleX:1, scaleY:1, y:y-50, duration:400, ease:"Back.easeOut"});
    scene.time.delayedCall(1800, ()=> scene.tweens.add({targets:txt, alpha:0, duration:300, onComplete:()=>txt.destroy()}));
}


// ═══════════════════════════════════════════════════════════════
// §2  DATA DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const DAILY = [
    { day:1, type:"gold", amount:200  },
    { day:2, type:"gold", amount:350  },
    { day:3, type:"gold", amount:550  },
    { day:4, type:"gold", amount:800  },
    { day:5, type:"gold", amount:1200 },
    { day:6, type:"gold", amount:1800 },
    { day:7, type:"gem",  amount:10   },
];

const WHEEL = [
    { type:"gold",  amount:200,   w:30, color:0xffcc00, label:"200" },
    { type:"gold",  amount:400,   w:28, color:0xffdd22, label:"400" },
    { type:"gold",  amount:800,   w:18, color:0xffaa00, label:"800" },
    { type:"gold",  amount:2000,  w:8,  color:0xff8800, label:"2000" },
    { type:"gold",  amount:5000,  w:3,  color:0xff6600, label:"5000" },
    { type:"gem",   amount:1,     w:2,  color:0xcc44ff, label:"1" },
    { type:"gem",   amount:3,     w:0.5,color:0xdd66ff, label:"3" },
    { type:"gem",   amount:5,     w:0.1,color:0xee88ff, label:"5" },
    { type:"gold",  amount:600,   w:20, color:0xeebb00, label:"600" },
    { type:"gold",  amount:1200,  w:12, color:0xddaa00, label:"1200" },
];
const WHEEL_FREE_CD = 24*3600000;
const WHEEL_COST = 10;

const CHEST_SKINS = [
    // COMMON drops
    { id:"rusty_blade",    name:"Rusty Blade",      cat:"weapon", rar:"COMMON",    col:0x888888, tier:1 },
    { id:"wooden_shield",  name:"Wooden Shield",    cat:"weapon", rar:"COMMON",    col:0x996633, tier:1 },
    { id:"basic_armor",    name:"Basic Armor",      cat:"char",   rar:"COMMON",    col:0x777777, tier:1 },
    { id:"desert_cloak",   name:"Desert Cloak",     cat:"char",   rar:"COMMON",    col:0xccaa66, tier:1 },
    // RARE drops
    { id:"shadow_blade",   name:"Shadow Blade",     cat:"weapon", rar:"RARE",      col:0x2266ee, tier:2 },
    { id:"frost_bow",      name:"Frost Bow",        cat:"weapon", rar:"RARE",      col:0x88ddff, tier:2 },
    { id:"shadow_walk",    name:"Shadow Walker",    cat:"char",   rar:"RARE",      col:0x4444cc, tier:2 },
    { id:"crimson_guard",  name:"Crimson Guard",    cat:"char",   rar:"RARE",      col:0xcc2222, tier:2 },
    // EXOTIC drops
    { id:"flame_sword",    name:"Flame Sword",      cat:"weapon", rar:"EXOTIC",    col:0xff4400, tier:3 },
    { id:"thunder_axe",    name:"Thunder Axe",      cat:"weapon", rar:"EXOTIC",    col:0xffdd00, tier:3 },
    { id:"chrome_knight",  name:"Chrome Knight",    cat:"char",   rar:"EXOTIC",    col:0xbbbbbb, tier:3 },
    { id:"void_assassin",  name:"Void Assassin",    cat:"char",   rar:"EXOTIC",    col:0x6600cc, tier:3 },
    // LEGENDARY drops
    { id:"divine_sword",   name:"Divine Sword",     cat:"weapon", rar:"LEGENDARY", col:0xffaa00, tier:4 },
    { id:"galaxy_blade",   name:"Galaxy Blade",     cat:"weapon", rar:"LEGENDARY", col:0x44aaff, tier:4 },
    { id:"gold_warrior",   name:"Golden Warrior",   cat:"char",   rar:"LEGENDARY", col:0xffaa00, tier:4 },
    { id:"phoenix_lord",   name:"Phoenix Lord",     cat:"char",   rar:"LEGENDARY", col:0xff4400, tier:4 },
];

// Chest tiers: higher cost = higher chance of rare/legendary
const CHESTS = [
    { name:"COMMON",    nameTR:"SIRADAN",  cost:10,  col:0x888888, tierWeights:[60,30,8,2],  tag:null },
    { name:"RARE",      nameTR:"NADIR",    cost:30,  col:0x3388ee, tierWeights:[25,45,22,8], tag:null },
    { name:"EXOTIC",    nameTR:"EGZOTIK",  cost:80,  col:0xaa44ff, tierWeights:[8,25,45,22], tag:null },
    { name:"LEGENDARY", nameTR:"EFSANE",   cost:200, col:0xffaa00, tierWeights:[2,10,30,58], tag:"BEST" },
];

function _rollChestSkin(chestIdx){
    const ch = CHESTS[chestIdx];
    const tw = ch.tierWeights;
    // Pick a tier based on weights
    const total = tw.reduce((a,b)=>a+b,0);
    let rn = Math.random()*total, tier=1;
    for(let i=0;i<tw.length;i++){rn-=tw[i];if(rn<=0){tier=i+1;break;}}
    // Filter skins by tier
    const pool = CHEST_SKINS.filter(s=>s.tier===tier);
    if(!pool.length) return CHEST_SKINS[0]; // fallback
    return pool[Math.floor(Math.random()*pool.length)];
}

function _unlockSkin(skinId){
    const owned = JSON.parse(localStorage.getItem("nt_skins")||"[]");
    if(!owned.includes(skinId)){owned.push(skinId);localStorage.setItem("nt_skins",JSON.stringify(owned));}
}
function _hasSkin(skinId){
    const owned = JSON.parse(localStorage.getItem("nt_skins")||"[]");
    return owned.includes(skinId);
}

const BOOSTS = [
    { id:"gold2x",    name:"MONEY MACHINE 🖨️",        nameTR:"PARA BASAN MAKINE 🖨️",   desc:"2x gold for 2 hours",       descTR:"2 saat 2x altin",             icon:"🔥", dur:7200000, cost:20, col:0xff8800 },
    { id:"xp2x",      name:"BRAIN FUEL 🧠",             nameTR:"KAFA GUBRESI 🧠",          desc:"2x XP for 2 hours",         descTR:"2 saat 2x XP",                icon:"📚", dur:7200000, cost:20, col:0x44aaff },
    { id:"shield",     name:"SHIELD UP 🛡️",              nameTR:"SARILSANA BARI 🛡️",       desc:"Start with +1 HP",          descTR:"Baslangicta +1 HP",           icon:"🛡️", dur:0,       cost:15, col:0x44ddaa },
    { id:"autorevive", name:"NOT TODAY 💖",               nameTR:"OLMEYECEGIM DEDIM 💖",     desc:"Auto revive once on death", descTR:"Olunce bir kez otomatik diril",icon:"💖", dur:0,       cost:25, col:0xff4466 },
    { id:"luckcharm",  name:"DRIP ALARM 🍀",             nameTR:"DRIP ALARM 🍀",            desc:"+50% rare skin drop (2 hours)", descTR:"+50% nadir kostum sans (2 saat)", icon:"🍀", dur:7200000, cost:30, col:0x44ff44 },
];

// ═══════════════════════════════════════════════════════════════
// DAILY QUESTS — varied objectives, balanced rewards
// Difficulty curve: easy ≈1-2 min, medium ≈3-5 min, hard ≈7-10 min
// Rewards tuned to replace old BP drip: ~1.2-1.8k gold/day + occasional gems
// ═══════════════════════════════════════════════════════════════
const QUEST_POOL = [
    // ─── EASY (fast, single game) ───────────────────────────────
    { id:"e_kill30",   diff:"easy",    type:"kills",   target:30,     name:"First Blood",      nameTR:"Ilk Kan",         icon:"🎯", desc:"Kill 30 triangles (any games today)",     descTR:"Bugun toplam 30 ucgen oldur",              reward:{gold:120,  xp:25}  },
    { id:"e_kill60",   diff:"easy",    type:"kills",   target:60,     name:"Warming Up",       nameTR:"Isiniyor",        icon:"🔥", desc:"Kill 60 triangles (any games today)",     descTR:"Bugun toplam 60 ucgen oldur",              reward:{gold:150,  xp:30}  },
    { id:"e_lv5",      diff:"easy",    type:"level",   target:5,      name:"Quick Climb",      nameTR:"Hizli Tirmanis",  icon:"⬆️", desc:"Reach in-game level 5 in a single run",   descTR:"Tek oyunda seviye 5'e ulas",                reward:{gold:130,  xp:25}  },
    { id:"e_score5k",  diff:"easy",    type:"score",   target:5000,   name:"Point Hunter",     nameTR:"Puan Avcisi",     icon:"💯", desc:"Score 5,000 points in a single run",      descTR:"Tek oyunda 5.000 puan topla",              reward:{gold:100,  xp:20}  },
    { id:"e_play1",    diff:"easy",    type:"games",   target:1,      name:"Daily Warrior",    nameTR:"Gunluk Savas",    icon:"⚔️", desc:"Play at least 1 game today",              descTR:"Bugun en az 1 oyun oyna",                   reward:{gold:100,  xp:20}  },
    { id:"e_combo10",  diff:"easy",    type:"combo",   target:10,     name:"On Fire!",         nameTR:"Alevlendi!",      icon:"✨", desc:"Reach a 10-combo in a single run",        descTR:"Tek oyunda 10'luk kombo yap",              reward:{gold:120,  xp:25}  },
    { id:"e_elite2",   diff:"easy",    type:"elites",  target:2,      name:"Elite Spotter",    nameTR:"Elit Gozcusu",    icon:"★", desc:"Kill 2 elite enemies (any games today)",   descTR:"Bugun 2 elit dusman oldur",                reward:{gold:140,  xp:28}  },

    // ─── MEDIUM (balanced session) ──────────────────────────────
    { id:"m_kill150",  diff:"medium",  type:"kills",   target:150,    name:"Triangle Slayer",  nameTR:"Ucgen Kiyan",     icon:"⚡", desc:"Kill 150 triangles (any games today)",    descTR:"Bugun toplam 150 ucgen oldur",             reward:{gold:350,  xp:70}  },
    { id:"m_lv10",     diff:"medium",  type:"level",   target:10,     name:"Veteran",          nameTR:"Veteran",          icon:"🎖️", desc:"Reach in-game level 10 in one run",       descTR:"Tek oyunda seviye 10'a ulas",               reward:{gold:380,  xp:80}  },
    { id:"m_elite8",   diff:"medium",  type:"elites",  target:8,      name:"Elite Hunter",     nameTR:"Elit Avcisi",     icon:"👑", desc:"Kill 8 elite enemies today",              descTR:"Bugun 8 elit dusman oldur",                 reward:{gold:400,  xp:85}  },
    { id:"m_boss1",    diff:"medium",  type:"bosses",  target:1,      name:"Giant Slayer",     nameTR:"Dev Yikici",      icon:"💀", desc:"Defeat 1 boss today",                     descTR:"Bugun 1 boss yen",                          reward:{gold:350,  xp:75}  },
    { id:"m_score30k", diff:"medium",  type:"score",   target:30000,  name:"Scorer",           nameTR:"Skorcu",           icon:"🏆", desc:"Score 30,000 points in a single run",     descTR:"Tek oyunda 30.000 puan topla",             reward:{gold:320,  xp:65}  },
    { id:"m_combo18",  diff:"medium",  type:"combo",   target:18,     name:"Combo Master",     nameTR:"Kombo Ustasi",    icon:"💥", desc:"Reach an 18-combo in a single run",       descTR:"Tek oyunda 18'lik kombo yap",              reward:{gold:380,  xp:75}  },
    { id:"m_play3",    diff:"medium",  type:"games",   target:3,      name:"Triple Threat",    nameTR:"Uclu Tehdit",     icon:"🎮", desc:"Play 3 games today",                      descTR:"Bugun 3 oyun oyna",                         reward:{gold:330,  xp:65}  },

    // ─── HARD (long or multiple sessions) ───────────────────────
    { id:"h_kill400",  diff:"hard",    type:"kills",   target:400,    name:"Massacre",         nameTR:"Katliam",          icon:"☠️", desc:"Kill 400 triangles today",                descTR:"Bugun toplam 400 ucgen oldur",             reward:{gold:850,  xp:180} },
    { id:"h_lv15",     diff:"hard",    type:"level",   target:15,     name:"Master",           nameTR:"Usta",             icon:"🌟", desc:"Reach in-game level 15 in one run",       descTR:"Tek oyunda seviye 15'e ulas",               reward:{gold:950,  xp:200} },
    { id:"h_elite20",  diff:"hard",    type:"elites",  target:20,     name:"Elite Sweep",      nameTR:"Elit Temizlik",   icon:"⚜️", desc:"Kill 20 elite enemies today",             descTR:"Bugun 20 elit dusman oldur",                reward:{gold:900,  xp:190} },
    { id:"h_boss3",    diff:"hard",    type:"bosses",  target:3,      name:"Boss Hunter",      nameTR:"Boss Avcisi",     icon:"👹", desc:"Defeat 3 bosses today",                   descTR:"Bugun 3 boss yen",                          reward:{gold:1000, xp:210} },
    { id:"h_score100k",diff:"hard",    type:"score",   target:100000, name:"High Scorer",      nameTR:"Yuksek Skor",     icon:"🥇", desc:"Score 100,000 points in a single run",    descTR:"Tek oyunda 100.000 puan topla",            reward:{gold:800,  xp:170} },
    { id:"h_combo20",  diff:"hard",    type:"combo",   target:20,     name:"Perfect Streak",   nameTR:"Kusursuz Seri",   icon:"🌀", desc:"Reach max combo (20) in a single run",    descTR:"Tek oyunda max kombo (20) yap",            reward:{gold:900,  xp:190} },

    // ─── SPECIAL (very hard, rare, small GEM reward) ────────────
    { id:"s_kill1000", diff:"special", type:"kills",   target:1000,   name:"Legendary Purge",  nameTR:"Efsanevi Temizlik",icon:"🔮", desc:"Kill 1,000 triangles today",              descTR:"Bugun toplam 1.000 ucgen oldur",           reward:{gold:1500, xp:400, gem:3} },
    { id:"s_lv22",     diff:"special", type:"level",   target:22,     name:"Godlike Ascent",   nameTR:"Tanri Tirmanisi", icon:"⚡", desc:"Reach in-game level 22 in one run",       descTR:"Tek oyunda seviye 22'ye ulas",              reward:{gold:1800, xp:450, gem:5} },
    { id:"s_boss5",    diff:"special", type:"bosses",  target:5,      name:"Boss Nemesis",     nameTR:"Boss Kabusu",     icon:"🐉", desc:"Defeat 5 bosses today",                   descTR:"Bugun 5 boss yen",                          reward:{gold:1600, xp:400, gem:4} },
    { id:"s_score300k",diff:"special", type:"score",   target:300000, name:"Score Legend",     nameTR:"Skor Efsanesi",   icon:"💎", desc:"Score 300,000 points in a single run",    descTR:"Tek oyunda 300.000 puan topla",            reward:{gold:1500, xp:400, gem:3} },

    // ─── SOCIAL (one-click, opens external link) ────────────────
    { id:"x_notcoin",  diff:"special", type:"social",  target:1,      name:"Follow Notcoin!",  nameTR:"Notcoin Takip Et!", icon:"𝕏",  desc:"Follow @notcoin on X to earn 5 gems", descTR:"X'ten @notcoin'i takip et, 5 elmas kazan", reward:{gold:0, xp:50, gem:5}, socialURL:"https://x.com/notcoin" },
    { id:"x_notpixel", diff:"special", type:"social",  target:1,      name:"Follow NotPixel!", nameTR:"NotPixel Takip Et!",icon:"𝕏",  desc:"Follow @notpixelx on X to earn 5 gems", descTR:"X'ten @notpixelx'i takip et, 5 elmas kazan", reward:{gold:0, xp:50, gem:5}, socialURL:"https://x.com/notpixelx" },
];

// Difficulty presentation data
const QUEST_DIFF = {
    easy:    { col:0x44cc66, colStr:"#66dd88", label:"EASY",    labelTR:"KOLAY" },
    medium:  { col:0x44aaff, colStr:"#66bbff", label:"MEDIUM",  labelTR:"ORTA"  },
    hard:    { col:0xff8844, colStr:"#ffaa66", label:"HARD",    labelTR:"ZOR"   },
    special: { col:0xcc44ff, colStr:"#dd88ff", label:"SPECIAL", labelTR:"OZEL"  },
};

const SKINS = [
    { id:"shadow_blade",  name:"Shadow Blade ✦",      nameTR:"Karanlik Kasik ✦",    nameRU:"Клинок Тени ✦",   cat:"weapon", col:0x2266ee, rar:"RARE"      },
    { id:"flame_sword",   name:"Blazing Bin 🔥",       nameTR:"Atesli Cop Kutusu 🔥", nameRU:"Горящий Ящик 🔥", cat:"weapon", col:0xff4400, rar:"EXOTIC"    },
    { id:"frost_bow",     name:"Frostrod ❄️",          nameTR:"Dondurucu Sopa ❄️",   nameRU:"Морозный Жезл ❄️",cat:"weapon", col:0x88ddff, rar:"RARE"      },
    { id:"shadow_walk",   name:"Not Stealthy At All",  nameTR:"Gizli Degil Aslinda", nameRU:"Совсем Не Скрытно",cat:"char",   col:0x4444cc, rar:"RARE"      },
    { id:"chrome_knight", name:"Tin Hero",             nameTR:"Teneke Kahraman",     nameRU:"Жестяной Герой",  cat:"char",   col:0xbbbbbb, rar:"EXOTIC"    },
    { id:"gold_warrior",  name:"Got Money, Got Moves", nameTR:"Param Var Ben Varim", nameRU:"Деньги Есть",     cat:"char",   col:0xffaa00, rar:"LEGENDARY" },
];

const STARTER = { gems:150, gold:2000, stars:100, disc:80 };
const DEATH_OFFERS = [
    { gems:30,  gold:500,  stars:30  },
    { gems:80,  gold:1500, stars:60,  tag:"POPULAR" },
    { gems:200, gold:5000, stars:120, tag:"BEST VALUE" },
];


// ═══════════════════════════════════════════════════════════════
// §3  PERSISTENT STATE
// ═══════════════════════════════════════════════════════════════

function _ld(){ try{return JSON.parse(secureGet("nt_mn","{}","{}"));}catch(e){return {};} }
function _sv(s){ secureSet("nt_mn",JSON.stringify(s)); }
function _s(){
    const s=_ld();
    s.dd=s.dd||0; s.dl=s.dl||0; s.wl=s.wl||0; s.fl=s.fl||0;
    s.bo=s.bo||{}; s.bx=s.bx||0; s.bp=s.bp||false; s.bc=s.bc||{};
    s.sp=s.sp||false; s.gm=s.gm||0;
    s._socialDone=s._socialDone||{};
    return s;
}

// Booster helpers
function _isB(id){ const s=_s(),b=s.bo[id]; if(!b) return false; const d=BOOSTS.find(x=>x.id===id); if(!d) return false; return d.dur===0?(b.u||0)>0:(Date.now()-b.a)<d.dur; }
function _actB(id){ const s=_s(),d=BOOSTS.find(x=>x.id===id); if(!d) return; if(d.dur===0){if(!s.bo[id])s.bo[id]={u:0};s.bo[id].u=(s.bo[id].u||0)+1;}else{s.bo[id]={a:Date.now()};} _sv(s); }
function _useB(id){ const s=_s(); if(s.bo[id]&&(s.bo[id].u||0)>0){s.bo[id].u--;_sv(s);return true;} return false; }
function _gMult(){ return _isB("gold2x")?2.0:1.0; }
function _xMult(){ return _isB("xp2x")?2.0:1.0; }

// Time helpers
function _sameDay(a,b){ return new Date(a).toDateString()===new Date(b).toDateString(); }
function _nextDay(a,b){ const d1=new Date(a);d1.setHours(0,0,0,0);const d2=new Date(b);d2.setHours(0,0,0,0);const x=d2-d1;return x>=864e5&&x<1728e5; }
function _fmt(ms){ const h=Math.floor(ms/36e5),m=Math.floor((ms%36e5)/6e4),s=Math.floor((ms%6e4)/1e3); return (h?h+"h ":"")+m+"m "+s+"s"; }
function _rlbl(r){ return r.type==="gold"?r.n+(CURRENT_LANG==="tr"?" ALTIN":" GOLD"):r.n+(CURRENT_LANG==="tr"?" ELMAS":" GEM"); }


// ═══════════════════════════════════════════════════════════════
// §4  DAILY REWARDS  (only CLAIM, no close, auto-dismiss)
// ═══════════════════════════════════════════════════════════════

function _dailyOK(){ const s=_s(); if(!s.dl) return true; if(s.dd>=7&&_sameDay(s.dl,Date.now())) return false; return !_sameDay(s.dl,Date.now()); }
function checkDaily(sc){ if(_dailyOK()) sc.time.delayedCall(600,()=>showDaily(sc)); }

function showDaily(scene){
    const {A,close,contentTop,contentBot,CX:cx,depth:D,objs}
        = NT_OpenPopup(scene,"mm_panel",300,CURRENT_LANG==="tr"?"GUNLUK ODUL":"DAILY REWARD",320,20,null);

    // Remove the default close button (last 3 objects added by NT_OpenPopup: graphics, text, hitRect)
    // Pop them from objs and destroy
    for(let i=0;i<3;i++){
        const o = objs.pop();
        try{ if(o.disableInteractive) o.disableInteractive(); o.destroy(); }catch(_){}
    }

    const s=_s();
    let cur=s.dd||0;
    if(s.dl>0&&!_nextDay(s.dl,Date.now())&&!_sameDay(s.dl,Date.now())) cur=0;
    if(cur>=7) cur=0;

    // Streak text
    A(scene.add.text(cx,contentTop+8,(CURRENT_LANG==="tr"?"GUN ":"DAY ")+(cur+1)+(CURRENT_LANG==="tr"?" / 7":" OF 7"),{fontFamily:_F,fontSize:"12px",color:"#ffdd44",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(D+3));

    // 7 reward cards: 4 top + 3 bottom
    const CW=60, CH=62, G=5;
    const rows=[[0,1,2,3],[4,5,6]];
    const bY=contentTop+30;

    rows.forEach((row,ri)=>{
        const rw=row.length*CW+(row.length-1)*G;
        const sx=cx-rw/2+CW/2;
        row.forEach((idx,ci)=>{
            const cardX=sx+ci*(CW+G), cardY=bY+ri*(CH+G)+CH/2;
            const reward=DAILY[idx];
            const claimed=idx<cur, current=idx===cur, locked=idx>cur;
            const isGem=reward.type==="gem";

            // Card background
            const cg=A(scene.add.graphics().setDepth(D+2));
            const borderCol = claimed?0x338844 : current?0xffaa00 : 0x334466;
            const bgCol     = claimed?0x122818 : current?0x1a1000 : 0x0d1420;
            cg.fillStyle(bgCol,0.95); cg.fillRoundedRect(cardX-CW/2,cardY-CH/2,CW,CH,8);
            cg.lineStyle(current?2.5:1.5, borderCol, current?0.95:0.5);
            cg.strokeRoundedRect(cardX-CW/2,cardY-CH/2,CW,CH,8);

            // Day label at top
            A(scene.add.text(cardX,cardY-CH/2+10,(CURRENT_LANG==="tr"?"GUN ":"DAY ")+(idx+1),{
                fontFamily:_F,fontSize:"7px",color:claimed?"#44aa44":(current?"#ffdd44":"#556688"),
                stroke:"#000",strokeThickness:1
            }).setOrigin(0.5).setDepth(D+3));

            if(claimed){
                // Checkmark
                A(scene.add.text(cardX,cardY+4,"✓",{fontFamily:_F,fontSize:"18px",color:"#44aa44",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(D+3));
            } else {
                // Amount + icon
                const amtStr = "+"+ reward.amount;
                const iconStr = isGem?(CURRENT_LANG==="tr"?"ELMAS":"GEM"):(CURRENT_LANG==="tr"?"ALTIN":"GOLD");
                A(scene.add.text(cardX,cardY-2,amtStr,{fontFamily:_F,fontSize:"13px",color:current?"#ffffff":"#889999",stroke:"#000",strokeThickness:1}).setOrigin(0.5).setDepth(D+3));
                A(scene.add.text(cardX,cardY+14,iconStr,{fontFamily:_F,fontSize:isGem?"11px":"14px",color:isGem?"#cc88ff":"#ffcc00"}).setOrigin(0.5).setDepth(D+3));
            }

            // Lock overlay
            if(locked){
                cg.fillStyle(0x000000,0.4); cg.fillRoundedRect(cardX-CW/2,cardY-CH/2,CW,CH,8);
            }

            // Current day glow pulse
            if(current){
                const gl=A(scene.add.graphics().setDepth(D+1));
                const gv={v:0};
                scene.tweens.add({targets:gv,v:1,duration:900,yoyo:true,repeat:-1,ease:"Sine.easeInOut",
                    onUpdate:()=>{
                        if(!gl.scene) return; gl.clear();
                        gl.lineStyle(3+gv.v*5,0xffaa00,0.06+gv.v*0.20);
                        gl.strokeRoundedRect(cardX-CW/2-3,cardY-CH/2-3,CW+6,CH+6,11);
                    }
                });
            }

            // Stagger fade-in
            cg.setAlpha(0);
            scene.tweens.add({targets:cg,alpha:1,duration:200,delay:80+idx*50,ease:"Quad.easeOut"});
        });
    });

    // ── CLAIM BUTTON ──
    const claimY = contentBot - 20;
    const reward = DAILY[cur];
    const [cbg,cbt,cbh] = NT_YellowBtn(scene,cx,claimY,200,44,(CURRENT_LANG==="tr"?"AL  ✦":"CLAIM  ✦"),D+3,()=>{
        // Save state
        const st=_s();
        if(st.dl>0&&!_nextDay(st.dl,Date.now())&&!_sameDay(st.dl,Date.now())) st.dd=0;
        st.dd=cur+1; st.dl=Date.now(); if(st.dd>=7) st.dd=7; _sv(st);

        // Give reward + BIG animation
        NT_SFX.play("chest_open","common");
        showBigReward(scene, cx, claimY-30, reward.type, reward.amount, D+10);

        // Auto-dismiss after animation
        scene.time.delayedCall(350, close);
    });
    A(cbg);A(cbt);A(cbh);
}


// ═══════════════════════════════════════════════════════════════
// §5  FORTUNE WHEEL  (smooth spin, exact rewards, big popup)
// ═══════════════════════════════════════════════════════════════

function _canFree(){ return (Date.now()-_s().wl)>=WHEEL_FREE_CD; }
function _freeT(){ const e=Date.now()-_s().wl; return e>=WHEEL_FREE_CD?0:WHEEL_FREE_CD-e; }

function showWheel(scene){
    const D=500;
    const objs=[],A=o=>{objs.push(o);return o;};
    const _close=()=>{if(_wheelListener)scene.input.off("wheel",_wheelListener);objs.forEach(o=>{try{o.destroy();}catch(_){}});};
    let spinning=false;
    let _wheelListener=null;

    // Overlay
    A(scene.add.rectangle(CX,H/2,W,H,0x000000,0.88).setDepth(D).setInteractive());

    // Title with glow
    const titleGlow=A(scene.add.text(CX,20,CURRENT_LANG==="tr"?"SANS CARKI":"FORTUNE WHEEL",{fontFamily:_F,fontSize:"26px",color:"#ffdd44",stroke:"#000",strokeThickness:5}).setOrigin(0.5).setDepth(D+2));
    const tgv={v:0};
    A({destroy:()=>{},scene:scene});
    scene.tweens.add({targets:tgv,v:1,duration:1500,yoyo:true,repeat:-1,ease:"Sine.easeInOut",
        onUpdate:()=>{if(!titleGlow.scene)return;titleGlow.setAlpha(0.85+tgv.v*0.15);}});

    // ── WHEEL CONFIG ──
    const R=140, WY=235, SC=WHEEL.length, SA=Math.PI*2/SC;
    let wAngle=0;

    // ── Draw custom wheel graphic ──
    const wheelGfx=A(scene.add.graphics().setDepth(D+2));
    wheelGfx.x=CX; wheelGfx.y=WY;

    // Sector colors (alternating rich tones)
    const sectorColors=[
        0xd4a017, 0x1a5276, 0xc0392b, 0x1e8449,
        0x8e44ad, 0xd35400, 0x2471a3, 0xb7950b,
        0x6c3483, 0x148f77
    ];

    function _drawWheel(angle){
        wheelGfx.clear();
        wheelGfx.setRotation(angle);

        // Outer ring shadow
        wheelGfx.fillStyle(0x000000, 0.4);
        wheelGfx.fillCircle(3, 3, R+8);

        // Outer ring
        wheelGfx.lineStyle(6, 0xffcc00, 1);
        wheelGfx.strokeCircle(0, 0, R+4);
        wheelGfx.lineStyle(2, 0xffffff, 0.3);
        wheelGfx.strokeCircle(0, 0, R+7);

        // Draw sectors
        for(let i=0;i<SC;i++){
            const startA = i*SA - Math.PI/2;
            const endA = startA + SA;
            const col = sectorColors[i % sectorColors.length];

            // Filled sector
            wheelGfx.fillStyle(col, 1);
            wheelGfx.beginPath();
            wheelGfx.moveTo(0, 0);
            wheelGfx.arc(0, 0, R, startA, endA, false);
            wheelGfx.closePath();
            wheelGfx.fillPath();

            // Sector border
            wheelGfx.lineStyle(2, 0xffffff, 0.25);
            wheelGfx.beginPath();
            wheelGfx.moveTo(0, 0);
            wheelGfx.lineTo(Math.cos(startA)*R, Math.sin(startA)*R);
            wheelGfx.strokePath();

            // Inner highlight (lighter gradient effect)
            wheelGfx.fillStyle(0xffffff, 0.08);
            wheelGfx.beginPath();
            wheelGfx.moveTo(0, 0);
            wheelGfx.arc(0, 0, R*0.55, startA, endA, false);
            wheelGfx.closePath();
            wheelGfx.fillPath();
        }

        // Center hub shadow
        wheelGfx.fillStyle(0x000000, 0.5);
        wheelGfx.fillCircle(2, 2, 22);
        // Center hub
        wheelGfx.fillStyle(0x222222, 1);
        wheelGfx.fillCircle(0, 0, 20);
        wheelGfx.lineStyle(3, 0xffcc00, 0.9);
        wheelGfx.strokeCircle(0, 0, 20);
        wheelGfx.fillStyle(0x333333, 1);
        wheelGfx.fillCircle(0, 0, 12);
        wheelGfx.fillStyle(0xffcc00, 0.6);
        wheelGfx.fillCircle(0, 0, 5);

        // Dot decorations on outer ring
        for(let i=0;i<SC*2;i++){
            const da = (Math.PI*2/(SC*2))*i - Math.PI/2;
            const dx = Math.cos(da)*(R+4);
            const dy = Math.sin(da)*(R+4);
            wheelGfx.fillStyle(i%2===0?0xffee88:0xffffff, 0.9);
            wheelGfx.fillCircle(dx, dy, 3);
        }
    }
    _drawWheel(0);

    // ── Slice labels (rotate with wheel) ──
    // Layout: icon at R*0.76 (outer), number at R*0.46 (inner) — clear separation
    const lbls=[];
    const sliceIcons=[];
    const _LBL_R  = R * 0.46;  // number label radius (inner zone)
    const _ICO_R  = R * 0.76;  // icon radius (near rim)
    const _ICO_SZ = 38;        // icon display size — large & crisp
    for(let i=0;i<SC;i++){
        const mid=i*SA+SA/2-Math.PI/2;
        const sl=WHEEL[i];
        const isGld=sl.type==="gold";
        const lbl=String(sl.amount);
        const col=isGld?"#ffe066":"#ffccff";
        // Number label — positioned in inner zone
        const t=A(scene.add.text(
            CX+Math.cos(mid)*_LBL_R,
            WY+Math.sin(mid)*_LBL_R,
            lbl,
            {fontFamily:_F,fontSize:"11px",color:col,stroke:"#000",strokeThickness:4,align:"center"}
        ).setOrigin(0.5).setDepth(D+3).setRotation(mid+Math.PI/2));
        lbls.push(t);
        // Icon — positioned near outer rim
        const icKey=isGld?"icon_gold":"icon_gem";
        const icArr=[];
        if(scene.textures.exists(icKey)){
            const ic=A(scene.add.image(
                CX+Math.cos(mid)*_ICO_R,
                WY+Math.sin(mid)*_ICO_R,
                icKey
            ).setDisplaySize(_ICO_SZ,_ICO_SZ).setDepth(D+4).setRotation(mid+Math.PI/2));
            icArr.push({img:ic,offsetAngle:0});
        }
        sliceIcons.push(icArr);
    }
    function _uL(a){
        for(let i=0;i<SC;i++){
            const mid=a+i*SA+SA/2-Math.PI/2;
            lbls[i].setPosition(CX+Math.cos(mid)*_LBL_R,WY+Math.sin(mid)*_LBL_R).setRotation(mid+Math.PI/2);
            const icons=sliceIcons[i];
            for(let j=0;j<icons.length;j++){
                const ic=icons[j];
                const icAngle=mid+ic.offsetAngle;
                ic.img.setPosition(CX+Math.cos(icAngle)*_ICO_R,WY+Math.sin(icAngle)*_ICO_R).setRotation(icAngle+Math.PI/2);
            }
        }
    }

    // ── Arrow pointer — premium 3D look ──
    const ar=A(scene.add.graphics().setDepth(D+6));
    // Shadow
    ar.fillStyle(0x000000,0.4);
    ar.fillTriangle(CX+2,WY-R+4, CX-14,WY-R-28, CX+18,WY-R-28);
    // Main arrow
    ar.fillStyle(0xff1133,1);
    ar.fillTriangle(CX,WY-R+2, CX-16,WY-R-30, CX+16,WY-R-30);
    // Highlight
    ar.fillStyle(0xff6677,0.6);
    ar.fillTriangle(CX-2,WY-R-4, CX-10,WY-R-26, CX+8,WY-R-26);
    // Border
    ar.lineStyle(2.5,0xffffff,0.8);
    ar.lineBetween(CX,WY-R+2,CX-16,WY-R-30);
    ar.lineBetween(CX,WY-R+2,CX+16,WY-R-30);
    ar.lineBetween(CX-16,WY-R-30,CX+16,WY-R-30);
    // Dot
    ar.fillStyle(0xffffff,0.9);
    ar.fillCircle(CX,WY-R-18,4);

    // ── Outer glow ring animation ──
    const glowRing=A(scene.add.graphics().setDepth(D+1));
    const grv={v:0};
    scene.tweens.add({targets:grv,v:1,duration:2000,yoyo:true,repeat:-1,ease:"Sine.easeInOut",
        onUpdate:()=>{
            if(!glowRing.scene)return;
            glowRing.clear();
            glowRing.lineStyle(4+grv.v*6,0xffcc00,0.05+grv.v*0.12);
            glowRing.strokeCircle(CX,WY,R+14+grv.v*8);
        }
    });

    // Timer display
    const cf=_canFree();
    if(!cf){
        const tt=A(scene.add.text(CX,WY+R+26,"",{fontFamily:_F,fontSize:"12px",color:"#ff8844",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(D+3));
        const te=scene.time.addEvent({delay:500,loop:true,callback:()=>{
            if(!tt.scene){te.remove();return;}
            const r=_freeT(); if(r<=0){tt.setText(CURRENT_LANG==="tr"?"UCRETSIZ CEVIRME HAZIR!":"FREE SPIN READY!").setColor("#44ff66");te.remove();return;}
            tt.setText((CURRENT_LANG==="tr"?"Sonraki ucretsiz: ":"Next free: ")+_fmt(r));
        }});
        te.callback();
        objs.push({destroy:()=>te.remove(),scene:scene});
    }

    // ── FREE SPIN button ──
    const fY=WY+R+52;
    const fBg=A(scene.add.graphics().setDepth(D+3));
    const _dF=h=>{fBg.clear();const c=cf?(h?0x228840:0x116630):0x333333;fBg.fillStyle(0x000000,0.35);fBg.fillRoundedRect(CX-108+2,fY-16+2,216,34,10);fBg.fillStyle(c,1);fBg.fillRoundedRect(CX-108,fY-16,216,34,10);fBg.lineStyle(2,cf?0x44ff66:0x555555,0.8);fBg.strokeRoundedRect(CX-108,fY-16,216,34,10);if(cf&&h){fBg.fillStyle(0xffffff,0.08);fBg.fillRoundedRect(CX-106,fY-14,212,12,{tl:8,tr:8,bl:0,br:0});}};
    _dF(false);
    // [FIX] Free spin text ref sakla — spin başlayınca WAITING'e çevirmek için
    const fTxt=A(scene.add.text(CX,fY,cf?(CURRENT_LANG==="tr"?"✦  UCRETSIZ CEVIR  ✦":"✦  FREE SPIN  ✦"):(CURRENT_LANG==="tr"?"BEKLENIYOR...":"WAITING..."),{fontFamily:_F,fontSize:"16px",color:cf?"#ffffff":"#777777",stroke:"#000",strokeThickness:3}).setOrigin(0.5).setDepth(D+4));
    A(scene.add.rectangle(CX,fY,216,34,0xffffff,0.001).setDepth(D+5).setInteractive({useHandCursor:cf}))
    .on("pointerover",()=>{if(cf&&!spinning)_dF(true);}).on("pointerout",()=>_dF(false))
    .on("pointerdown",()=>{
        if(!_canFree()||spinning)return;
        // [FIX] Anında WAITING durumuna geç — spin başladı
        if(fTxt&&fTxt.active) fTxt.setText(CURRENT_LANG==="tr"?"BEKLENIYOR...":"WAITING...").setColor("#777777");
        _dF(false);
        _spin(true);
    });

    // ── GEM SPIN button ──
    const gY=fY+44;
    const gBg=A(scene.add.graphics().setDepth(D+3));
    const _dG=h=>{gBg.clear();gBg.fillStyle(0x000000,0.35);gBg.fillRoundedRect(CX-108+2,gY-16+2,216,34,10);gBg.fillStyle(h?0x5020aa:0x380068,1);gBg.fillRoundedRect(CX-108,gY-16,216,34,10);gBg.lineStyle(2,0xbb44ff,0.8);gBg.strokeRoundedRect(CX-108,gY-16,216,34,10);if(h){gBg.fillStyle(0xffffff,0.08);gBg.fillRoundedRect(CX-106,gY-14,212,12,{tl:8,tr:8,bl:0,br:0});}};
    _dG(false);
    const gemCostTxt=A(scene.add.text(CX+10,gY,WHEEL_COST+"  "+(CURRENT_LANG==="tr"?"ELMAS CEVIR":"GEM SPIN"),{fontFamily:_F,fontSize:"15px",color:"#dd88ff",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(D+4));
    if(scene.textures.exists("icon_gem")){A(scene.add.image(CX-52,gY,"icon_gem").setDisplaySize(22,22).setDepth(D+4));}
    A(scene.add.rectangle(CX,gY,216,34,0xffffff,0.001).setDepth(D+5).setInteractive({useHandCursor:true}))
    .on("pointerover",()=>_dG(true)).on("pointerout",()=>_dG(false))
    .on("pointerdown",()=>{if(spinning)return;if(PLAYER_GEMS<WHEEL_COST){scene.cameras.main.shake(30,0.006);return;}spendGems(WHEEL_COST);_spin(false);});

    // Close
    const [xb,xt,xh]=NT_YellowBtn(scene,CX,H-32,150,36,CURRENT_LANG==="tr"?"KAPAT":"CLOSE",D+3,_close);
    A(xb);A(xt);A(xh);

    // ── TICK SOUND simulation — arrow bounce ──
    let _lastTickIdx=-1;
    const _arOrigY = 0; // ar is a graphics object at y=0

    // ── SPIN LOGIC — slow, dramatic, satisfying ──
    function _spin(isFree){
        if(spinning) return; spinning=true; NT_SFX.play("menu_click");
        _lastTickIdx=-1;
        // Reset arrow position in case previous bounce left it offset
        ar.y = _arOrigY;
        // Weighted random
        const tw=WHEEL.reduce((s,x)=>s+x.w,0); let rn=Math.random()*tw, wi=0;
        for(let i=0;i<SC;i++){rn-=WHEEL[i].w;if(rn<=0){wi=i;break;}}
        // Target angle: must land sector wi under the arrow (top)
        // Sector wi center in local coords = wi*SA + SA/2 - PI/2
        // After rotation by finalAngle, it should point at -PI/2 (top)
        // So: finalAngle = -(wi*SA + SA/2) + 2*PI*n
        const extraSpins = 8 + Math.random()*4;
        const landAngle = -(wi*SA + SA/2);
        const randomWithinSector = Math.random()*SA*0.3 - SA*0.15; // small offset within sector
        const finalTarget = landAngle + Math.PI*2*Math.ceil(extraSpins) + randomWithinSector;
        const sp={a:wAngle};
        const spinDuration = 6000 + Math.random()*2000; // 6-8 seconds
        scene.tweens.add({
            targets:sp, a:finalTarget, duration:spinDuration, ease:"Cubic.easeOut",
            onUpdate:()=>{
                _drawWheel(sp.a);
                _uL(sp.a);
                // Tick detection: which sector is at the top?
                const normA = ((sp.a % (Math.PI*2)) + Math.PI*2) % (Math.PI*2);
                const tickIdx = Math.floor(((Math.PI*2 - normA + Math.PI/2) % (Math.PI*2)) / SA) % SC;
                if(tickIdx !== _lastTickIdx){
                    _lastTickIdx = tickIdx;
                    NT_SFX.play("menu_click");
                    // Arrow bounce — always from original position
                    if(ar.scene){
                        ar.y = _arOrigY;
                        scene.tweens.add({targets:ar, y:_arOrigY-5, duration:50, yoyo:true, ease:"Quad.easeOut",
                            onComplete:()=>{ if(ar.scene) ar.y = _arOrigY; }
                        });
                    }
                }
            },
            onComplete:()=>{
                wAngle=sp.a%(Math.PI*2); spinning=false;
                ar.y = _arOrigY; // ensure arrow is reset
                const prize=WHEEL[wi];
                if(isFree){const st=_s();st.wl=Date.now();_sv(st);}
                // Big flash on win
                const winFlash=scene.add.graphics().setDepth(D+20);
                winFlash.fillStyle(prize.color||0xffcc00, 0.35);
                winFlash.fillRect(0,0,W,H);
                scene.tweens.add({targets:winFlash,alpha:0,duration:600,onComplete:()=>winFlash.destroy()});
                showBigReward(scene, CX, WY, prize.type, prize.amount, D+10);
            }
        });
    }
}


// ═══════════════════════════════════════════════════════════════
// §6  SHOP — 5 tabs, scrollable, fully functional
// ═══════════════════════════════════════════════════════════════

function showShop(scene){
    let _cleanupSc=()=>{};
    const {A,close,contentTop,contentBot,CX:cx,depth:D,PW}
        =NT_OpenPopup(scene,"mm_panel",330,CURRENT_LANG==="tr"?"MAGAZA":"SHOP",312,20,()=>_cleanupSc());

    // ── TAB BAR ────────────────────────────────────────────────
    let _tab="power";
    const TH=30, TY=contentTop+18;
    const tabs=CURRENT_LANG==="tr"
        ?[{k:"power",l:"GUC"},{k:"chest",l:"SANDIK"},{k:"boost",l:"TAKVIYE"},{k:"skins",l:"KOSTUM"},{k:"gems",l:"MARKET"}]
        :[{k:"power",l:"POWER"},{k:"chest",l:"CHEST"},{k:"boost",l:"BOOST"},{k:"skins",l:"SKINS"},{k:"gems",l:"MARKET"}];
    const TC=tabs.length, TWid=Math.floor((PW-16)/TC)-2;
    const TX0=cx-(TC*TWid+(TC-1)*4)/2;
    const tG={},tT={};

    tabs.forEach((td,i)=>{
        const tx=TX0+i*(TWid+4);
        tG[td.k]=A(scene.add.graphics().setDepth(D+3));
        tT[td.k]=A(scene.add.text(tx+TWid/2,TY,td.l,{fontFamily:_F,fontSize:"11px",color:"#fff",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(D+5));
        A(scene.add.rectangle(tx+TWid/2,TY,TWid,TH,0xffffff,0.001).setDepth(D+6).setInteractive({useHandCursor:true}))
            .on("pointerdown",()=>{if(_tab===td.k)return;NT_SFX.play("menu_click");_tab=td.k;_rT();_sh();});
    });

    function _rT(){
        tabs.forEach((td,i)=>{
            const on=(_tab===td.k), tx=TX0+i*(TWid+4), g=tG[td.k];
            g.clear();
            g.fillStyle(on?0xcc7700:0x0c1c2e,1);
            g.fillRoundedRect(tx,TY-TH/2,TWid,TH,{tl:8,tr:8,bl:0,br:0});
            if(on){g.fillStyle(0xffffff,0.12);g.fillRoundedRect(tx+2,TY-TH/2+3,TWid-4,TH/2-4,4);}
            g.lineStyle(on?2:1,on?0xffe066:0x1e4060,on?0.95:0.50);
            g.strokeRoundedRect(tx,TY-TH/2,TWid,TH,{tl:8,tr:8,bl:0,br:0});
            tT[td.k].setColor(on?"#ffe066":"#4a7aaa").setFontSize(on?"11px":"10px");
        });
    }
    _rT();

    // ── SCROLL AREA SETUP ────────────────────────────────────
    const SY0=TY+TH/2+4;
    const VIEW_H=contentBot-SY0-4;
    const VPORT_X=cx-PW/2+10, VPORT_W=PW-20;

    const maskGfx=scene.add.graphics().setDepth(D+1);
    maskGfx.fillStyle(0xffffff,1);
    maskGfx.fillRect(VPORT_X,SY0,VPORT_W,VIEW_H);
    const geomMask=maskGfx.createGeometryMask();

    let _scrollCont=null;
    let _scrollItems=[];
    let _scrollY=0, _scrollMax=0;
    let _dragStartY=0, _dragStartSY=0, _isDragging=false;

    function _destroyScroll(){
        if(_scrollCont){try{_scrollCont.destroy();}catch(_){}}
        _scrollCont=null;
        _scrollItems=[];
        _scrollY=0;
    }

    function _mkScrollCont(){
        _destroyScroll();
        _scrollCont=scene.add.container(0,0).setDepth(D+4);
        _scrollCont.setMask(geomMask);
        A(_scrollCont);
        return _scrollCont;
    }

    function _scrollTo(y){
        _scrollY=Math.max(0,Math.min(_scrollMax,y));
        if(_scrollCont) _scrollCont.y=-_scrollY;
    }

    // Drag-to-scroll on the scroll zone hit area
    const scrollHit=A(scene.add.rectangle(cx,SY0+VIEW_H/2,VPORT_W,VIEW_H,0xffffff,0.001).setDepth(D+7).setInteractive({draggable:false}));
    scrollHit.on("pointerdown",(p)=>{_isDragging=false;_dragStartY=p.y;_dragStartSY=_scrollY;});
    scrollHit.on("pointermove",(p)=>{if(!p.isDown)return;if(Math.abs(p.y-_dragStartY)>6)_isDragging=true;if(_isDragging)_scrollTo(_dragStartSY-(p.y-_dragStartY));});
    scrollHit.on("pointerup",(p)=>{
        if(!_isDragging){
            const worldY=p.y+_scrollY-SY0;
            for(const z of _scrollItems){
                if(p.x>=z.x1&&p.x<=z.x2&&worldY>=z.y1&&worldY<=z.y2){z.fn();break;}
            }
        }
        _isDragging=false;
    });

    // Mouse wheel scroll support
    const _shopWheelHandler=(pointer,gameObjects,dx,dy)=>{
        _scrollTo(_scrollY+dy*0.5);
    };
    scene.input.on("wheel",_shopWheelHandler);

    // ── TAB CONTENT BUILDERS ────────────────────────────────

    function _zone(x1,y1,x2,y2,fn){
        _scrollItems.push({x1:cx-PW/2+x1,x2:cx-PW/2+x2,y1,y2,fn});
    }

    function _sh(){
        _scrollItems=[];
        _destroyScroll();
        const cont=_mkScrollCont();
        let totalH=0;

        function _add(o){cont.add(o);return o;}
        function G(){return scene.add.graphics();}
        function T(x,y,txt,style){return scene.add.text(x,y,txt,style);}

        function _btn(x,y,bw,bh,label,col,borderCol,fn){
            const bg=G();
            bg.fillStyle(0x000000,0.35);
            bg.fillRoundedRect(x-bw/2+2,y-bh/2+3,bw,bh,8);
            bg.fillStyle(col,1);
            bg.fillRoundedRect(x-bw/2,y-bh/2,bw,bh,8);
            bg.fillStyle(0xffffff,0.14);
            bg.fillRoundedRect(x-bw/2+4,y-bh/2+3,bw-8,bh*0.4,{tl:6,tr:6,bl:0,br:0});
            bg.lineStyle(2,borderCol,0.85);
            bg.strokeRoundedRect(x-bw/2,y-bh/2,bw,bh,8);
            const txt=T(x,y,label,{fontFamily:_F,fontSize:"13px",color:"#fff",stroke:"#000",strokeThickness:2}).setOrigin(0.5);
            _add(bg); _add(txt);
        }

        // Helper to add gold/gem icon in scroll container
        function _addCurrIcon(x,y,type,sz){
            if(scene.textures.exists(type==="gold"?"icon_gold":"icon_gem")){
                const ic=scene.add.image(x,y,type==="gold"?"icon_gold":"icon_gem").setDisplaySize(sz,sz);
                _add(ic);
            }
        }

        switch(_tab){
            // ───────────────── POWER ──────────────────────
            case "power":{
                let y=8;
                // Gold header with icon
                const goldHdr=G();
                goldHdr.fillStyle(0x0a1828,0.98);goldHdr.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,30,6);
                goldHdr.lineStyle(1.5,0xffcc00,0.4);goldHdr.strokeRoundedRect(cx-PW/2+10,SY0+y,PW-20,30,6);
                _add(goldHdr);
                _addCurrIcon(cx-8,SY0+y+15,"gold",22);
                _add(T(cx+16,SY0+y+15,PLAYER_GOLD.toLocaleString(),{fontFamily:_F,fontSize:"17px",color:"#ffcc00",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5));
                y+=38;
                GOLD_UPGRADES.forEach((u)=>{
                    const mx=u.level>=u.maxLevel;
                    const cost=Math.floor(u.baseCost*Math.pow(1.6,u.level));
                    const can=!mx&&PLAYER_GOLD>=cost;
                    const rowH=66, ry=SY0+y;
                    const fill=u.level/u.maxLevel;
                    const bg2=G();
                    bg2.fillStyle(mx?0x0a1e0f:can?0x0a1828:0x0c1522,0.97);
                    bg2.fillRoundedRect(cx-PW/2+10,ry,PW-20,rowH,8);
                    bg2.lineStyle(1.5,mx?0x44aa44:can?0x44aacc:0x1e3a50,0.65);
                    bg2.strokeRoundedRect(cx-PW/2+10,ry,PW-20,rowH,8);
                    // Level progress bar left edge
                    bg2.fillStyle(0x111e2e,1);bg2.fillRoundedRect(cx-PW/2+12,ry+8,5,rowH-16,2);
                    bg2.fillStyle(mx?0x44cc44:0x44aacc,0.9);bg2.fillRoundedRect(cx-PW/2+12,ry+8+(rowH-16)*(1-fill),5,(rowH-16)*fill,2);
                    _add(bg2);
                    _add(T(cx-PW/2+22,ry+14,L(u.nameKey),{fontFamily:_F,fontSize:"14px",color:"#ffffff",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5));
                    // Description text
                    _add(T(cx-PW/2+22,ry+32,(CURRENT_LANG==="tr"?u.descTxtTR:u.descTxt)||"",{fontFamily:_F,fontSize:"9px",color:"#6699aa",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                    _add(T(cx-PW/2+22,ry+48,mx?(CURRENT_LANG==="tr"?"MAX SEVIYE ✓":"MAX LEVEL ✓"):"Lv "+u.level+" / "+u.maxLevel,{fontFamily:_F,fontSize:"12px",color:mx?"#55dd55":"#5588aa",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                    if(!mx){
                        const bx=cx+PW/2-52, bw=72, bh=28;
                        _btn(bx,ry+rowH/2,bw,bh,cost.toLocaleString(),can?0x1a6640:0x2a1a1a,can?0x44dd66:0x553333,null);
                        _addCurrIcon(bx-28,ry+rowH/2,"gold",18);
                        _zone(PW-20-bw,y,PW-10,y+rowH,()=>{
                            const c2=Math.floor(u.baseCost*Math.pow(1.6,u.level));
                            if(u.level>=u.maxLevel||PLAYER_GOLD<c2){scene.cameras.main.shake(30,0.006);return;}
                            PLAYER_GOLD-=c2;secureSet("nt_gold",PLAYER_GOLD);u.level++;
                            const sv=JSON.parse(localStorage.getItem("nt_shop")||"{}");sv[u.id]=u.level;localStorage.setItem("nt_shop",JSON.stringify(sv));
                            NT_SFX.play("upgrade_select");
                            scene.cameras.main.shake(40,0.008);
                            for(let pi=0;pi<10;pi++){const ang=(Math.PI*2/10)*pi;const p2=scene.add.graphics().setDepth(D+25);p2.fillStyle(0x44ff66,0.9);p2.fillCircle(0,0,3);p2.x=bx;p2.y=SY0+y+rowH/2;scene.tweens.add({targets:p2,x:bx+Math.cos(ang)*44,y:SY0+y+rowH/2+Math.sin(ang)*28,alpha:0,duration:380,ease:"Quad.easeOut",onComplete:()=>p2.destroy()});}
                            const upTxt=scene.add.text(bx,SY0+y+rowH/2-10,CURRENT_LANG==="tr"?"GELISTIRILDI!":"UPGRADED!",{fontFamily:_F,fontSize:"14px",color:"#44ff66",stroke:"#000",strokeThickness:3}).setOrigin(0.5).setDepth(D+26).setAlpha(0);
                            scene.tweens.add({targets:upTxt,alpha:1,y:SY0+y+rowH/2-32,duration:350,ease:"Back.easeOut"});
                            scene.time.delayedCall(1000,()=>scene.tweens.add({targets:upTxt,alpha:0,duration:250,onComplete:()=>upTxt.destroy()}));
                            _sh();
                        });
                    }
                    y+=rowH+6;
                });
                totalH=y+10;
                break;
            }
            // ───────────────── CHEST ──────────────────────
            case "chest":{
                let y=6;
                // Title
                _add(T(cx,SY0+y+10,CURRENT_LANG==="tr"?"KOSTUM SANDIKLARI":"SKIN CHESTS",{fontFamily:_F,fontSize:"14px",color:"#ffdd44",stroke:"#000",strokeThickness:2}).setOrigin(0.5));
                _add(T(cx,SY0+y+28,CURRENT_LANG==="tr"?"SILAH VE KARAKTER KOSTUMLERINI ACMAK ICIN SANDIK AC!":"Open chests to unlock weapon & character skins!",{fontFamily:_F,fontSize:"9px",color:"#6699aa",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
                y+=42;
                CHESTS.forEach((ch,ci)=>{
                    const rowH=72, canB=PLAYER_GEMS>=ch.cost;
                    const cg=G();
                    cg.fillStyle(0x0c1520,0.97);cg.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,8);
                    cg.lineStyle(1.5,ch.col,canB?0.55:0.25);cg.strokeRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,8);
                    cg.fillStyle(ch.col,0.30);cg.fillRoundedRect(cx-PW/2+10,SY0+y,5,rowH,{tl:8,bl:8,tr:0,br:0});
                    if(ch.tag){cg.fillStyle(0xffaa00,1);cg.fillRoundedRect(cx+PW/2-88,SY0+y,68,14,{tl:0,tr:8,bl:4,br:0});}
                    _add(cg);
                    if(ch.tag) _add(T(cx+PW/2-54,SY0+y+7,ch.tag,{fontFamily:_F,fontSize:"9px",color:"#fff",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
                    _add(T(cx-PW/2+24,SY0+y+18,(CURRENT_LANG==="tr"&&ch.nameTR?(ch.nameTR+" SANDIK"):ch.name+" CHEST"),{fontFamily:_F,fontSize:"15px",color:"#ddd",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5));
                    // Drop rate info
                    const tierNames=CURRENT_LANG==="tr"?["SIRADAN","NADIR","EGZOTIK","EFSANE"]:["Common","Rare","Exotic","Legendary"];
                    const tierCols=["#999","#4488ff","#bb44ff","#ffaa00"];
                    let infoStr="";
                    ch.tierWeights.forEach((tw,ti)=>{if(tw>0)infoStr+=(infoStr?" • ":"")+tierNames[ti]+" "+tw+"%";});
                    _add(T(cx-PW/2+24,SY0+y+36,infoStr,{fontFamily:_F,fontSize:"8px",color:"#5588aa",stroke:"#000",strokeThickness:1,wordWrap:{width:PW-80}}).setOrigin(0,0.5));
                    _add(T(cx-PW/2+24,SY0+y+52,CURRENT_LANG==="tr"?"⚔️🛡️ SILAH & KARAKTER KOSTUMLERI":"⚔️🛡️ Weapon & Character Skins",{fontFamily:_F,fontSize:"9px",color:"#88aacc",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                    const bx=cx+PW/2-52,bw=68,bh=30;
                    _btn(bx,SY0+y+rowH/2,bw,bh,CURRENT_LANG==="tr"?"YAKINDA":"SOON",0x1e1e28,0x443355,null);
                    y+=rowH+6;
                });
                totalH=y+10;
                break;
            }
            // ───────────────── BOOST ──────────────────────
            case "boost":{
                let y=6;
                const actB=BOOSTS.filter(b=>_isB(b.id));
                if(actB.length>0){
                    const abH=22+actB.length*20+6;
                    const abg=G();
                    abg.fillStyle(0x0a1e10,0.97);abg.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,abH,7);
                    abg.lineStyle(1,0x44aa44,0.4);abg.strokeRoundedRect(cx-PW/2+10,SY0+y,PW-20,abH,7);
                    _add(abg);
                    _add(T(cx,SY0+y+11,CURRENT_LANG==="tr"?"AKTIF TAKVIYELER":"ACTIVE BOOSTS",{fontFamily:_F,fontSize:"12px",color:"#44ff66",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
                    actB.forEach((b,i)=>{
                        const bi=_s().bo[b.id];let info="";
                        if(b.dur>0&&bi){const r=b.dur-(Date.now()-bi.a);if(r>0)info=" ("+_fmt(r)+")";}
                        else if(bi&&(bi.u||0)>0)info=" ("+bi.u+(CURRENT_LANG==="tr"?"x kullanim)":" x uses)");
                        _add(T(cx,SY0+y+24+i*20,(CURRENT_LANG==="tr"&&b.nameTR?b.nameTR:b.name)+info,{fontFamily:_F,fontSize:"12px",color:"#88ffaa",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
                    });
                    y+=abH+8;
                }
                BOOSTS.forEach((b)=>{
                    const isAct=_isB(b.id),canB=PLAYER_GEMS>=b.cost;
                    const rowH=62;
                    const bg2=G();
                    bg2.fillStyle(0x0c1520,0.97);bg2.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,8);
                    bg2.lineStyle(1.5,b.col,0.4);bg2.strokeRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,8);
                    bg2.fillStyle(b.col,0.15);bg2.fillRoundedRect(cx-PW/2+10,SY0+y,5,rowH,{tl:8,bl:8,tr:0,br:0});
                    _add(bg2);
                    _add(T(cx-PW/2+24,SY0+y+18,(CURRENT_LANG==="tr"&&b.nameTR?b.nameTR:b.name),{fontFamily:_F,fontSize:"15px",color:"#ffffff",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5));
                    _add(T(cx-PW/2+24,SY0+y+38,(CURRENT_LANG==="tr"&&b.descTR?b.descTR:b.desc),{fontFamily:_F,fontSize:"11px",color:"#7799bb",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                    const bx=cx+PW/2-52,bw=68,bh=30;
                    if(isAct){
                        const ab=G();ab.fillStyle(0x163318,1);ab.fillRoundedRect(bx-bw/2,SY0+y+rowH/2-bh/2,bw,bh,8);ab.lineStyle(1.5,0x44aa44,0.7);ab.strokeRoundedRect(bx-bw/2,SY0+y+rowH/2-bh/2,bw,bh,8);_add(ab);
                        _add(T(bx,SY0+y+rowH/2,CURRENT_LANG==="tr"?"AKTIF":"ACTIVE",{fontFamily:_F,fontSize:"13px",color:"#44ff66",stroke:"#000",strokeThickness:2}).setOrigin(0.5));
                    } else {
                        _btn(bx,SY0+y+rowH/2,bw,bh,b.cost.toString(),canB?0x3a0068:0x1e1e28,canB?0xcc44ff:0x443355,null);
                        _addCurrIcon(bx-26,SY0+y+rowH/2,"gem",18);
                        _zone(PW-20-bw,y,PW-10,y+rowH,()=>{
                            if(PLAYER_GEMS<b.cost){scene.cameras.main.shake(30,0.006);return;}
                            spendGems(b.cost);_actB(b.id);NT_SFX.play("upgrade_select");
                            showBoosterReward(scene,cx,SY0+y,""+b.name,D+10);
                            scene.time.delayedCall(600,()=>_sh());
                        });
                    }
                    y+=rowH+6;
                });

                // ── LEVEL XP PAKETLERI — gem ile direkt level XP satin al ──
                const _xpPacks = CURRENT_LANG==="tr" ? [
                    { xp: 200,  cost: 5,  label: "+200 Level XP",  desc: "Hizli baslangic" },
                    { xp: 500,  cost: 10, label: "+500 Level XP",  desc: "Yavash ama saglam" },
                    { xp: 1200, cost: 20, label: "+1200 Level XP", desc: "Populer secim" },
                    { xp: 3000, cost: 45, label: "+3000 Level XP", desc: "Super boost" },
                ] : [
                    { xp: 200,  cost: 5,  label: "+200 Level XP",  desc: "Quick start" },
                    { xp: 500,  cost: 10, label: "+500 Level XP",  desc: "Slow but steady" },
                    { xp: 1200, cost: 20, label: "+1200 Level XP", desc: "Popular choice" },
                    { xp: 3000, cost: 45, label: "+3000 Level XP", desc: "Super boost" },
                ];
                const _lvXpNow = _plvXpNeeded(PLAYER_LEVEL);
                _add(T(cx,SY0+y+4,CURRENT_LANG==="tr"?"— LEVEL XP PAKETLERi —":"— LEVEL XP PACKS —",{fontFamily:_F,fontSize:"11px",color:"#ffcc44",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
                _add(T(cx,SY0+y+18,CURRENT_LANG==="tr"?"Gem harcayarak Level XP kazan!":"Spend Gems to earn Level XP directly!",{fontFamily:_F,fontSize:"9px",color:"#aa8833",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
                y+=28;
                _xpPacks.forEach((pk)=>{
                    const rowH=56; const canB=PLAYER_GEMS>=pk.cost;
                    const xpFrac=Math.min(1,pk.xp/_lvXpNow);
                    const pg=G();
                    pg.fillStyle(0x0e1600,0.97);pg.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,8);
                    pg.lineStyle(1.5,canB?0xffcc00:0x443300,canB?0.65:0.30);pg.strokeRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,8);
                    pg.fillStyle(0xffaa00,0.12);pg.fillRoundedRect(cx-PW/2+10,SY0+y,5,rowH,{tl:8,bl:8,tr:0,br:0});
                    // mini XP bar — ne kadar ilerleme saglar gosterir
                    pg.fillStyle(0x1a1000,1);pg.fillRoundedRect(cx-PW/2+22,SY0+y+rowH-14,PW-80,6,3);
                    pg.fillStyle(0xff9900,0.85);pg.fillRoundedRect(cx-PW/2+22,SY0+y+rowH-14,(PW-80)*xpFrac,6,3);
                    _add(pg);
                    _add(T(cx-PW/2+24,SY0+y+16,pk.label,{fontFamily:_F,fontSize:"14px",color:"#ffdd44",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5));
                    _add(T(cx-PW/2+24,SY0+y+34,pk.desc,{fontFamily:_F,fontSize:"9px",color:"#997722",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                    const bx=cx+PW/2-52,bw=68,bh=28;
                    _btn(bx,SY0+y+rowH/2,bw,bh,pk.cost.toString(),canB?0x3a2800:0x1e1a0a,canB?0xffcc00:0x554400,null);
                    _addCurrIcon(bx-26,SY0+y+rowH/2,"gem",18);
                    _zone(PW-20-bw,y,PW-10,y+rowH,()=>{
                        if(PLAYER_GEMS<pk.cost){scene.cameras.main.shake(30,0.006);return;}
                        spendGems(pk.cost);
                        _plvAddXP(pk.xp);
                        NT_SFX.play("level_up");
                        scene.cameras.main.flash(200,255,200,0,false);
                        const popTxt=scene.add.text(cx,SY0+y,"+"+pk.xp+" XP!",{fontFamily:_F,fontSize:"18px",color:"#ffee44",stroke:"#000",strokeThickness:4}).setOrigin(0.5,0).setDepth(D+30).setAlpha(0);
                        scene.tweens.add({targets:popTxt,alpha:1,y:SY0+y-24,duration:300,ease:"Back.easeOut"});
                        scene.time.delayedCall(900,()=>scene.tweens.add({targets:popTxt,alpha:0,duration:250,onComplete:()=>popTxt.destroy()}));
                        scene.time.delayedCall(600,()=>_sh());
                    });
                    y+=rowH+6;
                });
                totalH=y+10;
                break;
            }
            case "skins":{
                let y=6;
                [{k:"weapon",l:CURRENT_LANG==="tr"?"SiLAH SKiNLERi":"WEAPON SKINS"},{k:"char",l:CURRENT_LANG==="tr"?"KARAKTER KOSTUMLERI":"CHARACTER SKINS"}].forEach(cat=>{
                    const skins=SKINS.filter(s=>s.cat===cat.k);
                    if(!skins.length)return;
                    _add(T(cx-PW/2+16,SY0+y+10,cat.l,{fontFamily:_F,fontSize:"14px",color:"#ffdd44",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5));
                    y+=26;
                    skins.forEach(sk=>{
                        const rowH=48;
                        const sg=G();
                        sg.fillStyle(0x0c1520,0.97);sg.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,7);
                        sg.lineStyle(1.5,sk.col,0.40);sg.strokeRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,7);
                        sg.fillStyle(sk.col,0.28);sg.fillRoundedRect(cx-PW/2+10,SY0+y,5,rowH,{tl:7,bl:7,tr:0,br:0});
                        _add(sg);
                        _add(T(cx-PW/2+24,SY0+y+16,(CURRENT_LANG==="tr"&&sk.nameTR?sk.nameTR:CURRENT_LANG==="ru"&&sk.nameRU?sk.nameRU:sk.name),{fontFamily:_F,fontSize:"14px",color:"#ddd",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                        _add(T(cx-PW/2+24,SY0+y+34,(CURRENT_LANG==="tr"?({COMMON:"SIRADAN",RARE:"NADIR",EXOTIC:"EGZOTIK",LEGENDARY:"EFSANE"}[sk.rar]||sk.rar):sk.rar),{fontFamily:_F,fontSize:"12px",color:({COMMON:"#aaaaaa",RARE:"#4499ff",EXOTIC:"#cc55ff",LEGENDARY:"#ffaa00"}[sk.rar]||"#ffffff"),stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                        const sbg=G();sbg.fillStyle(0x0d0d16,0.92);sbg.fillRoundedRect(cx+PW/2-66,SY0+y+rowH/2-12,52,24,5);sbg.lineStyle(1.5,sk.col,0.5);sbg.strokeRoundedRect(cx+PW/2-66,SY0+y+rowH/2-12,52,24,5);_add(sbg);
                        _add(T(cx+PW/2-40,SY0+y+rowH/2,CURRENT_LANG==="tr"?"YAKINDA":"SOON",{fontFamily:_F,fontSize:"13px",color:"#778899",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
                        y+=rowH+5;
                    });
                    y+=8;
                });
                totalH=y+10;
                break;
            }
            // ───────────────── GEMS ──────────────────────
            case "gems":{
                let y=6;
                const gemHdr=G();gemHdr.fillStyle(0x100020,0.97);gemHdr.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,36,7);gemHdr.lineStyle(1.5,0xcc44ff,0.45);gemHdr.strokeRoundedRect(cx-PW/2+10,SY0+y,PW-20,36,7);_add(gemHdr);
                _addCurrIcon(cx-24,SY0+y+18,"gem",24);
                _add(T(cx+8,SY0+y+18,PLAYER_GEMS.toLocaleString(),{fontFamily:_F,fontSize:"18px",color:"#cc44ff",stroke:"#000",strokeThickness:2}).setOrigin(0.5));
                y+=44;
                const s=_s();
                if(!s.sp){
                    const spH=62;
                    const sg=G();sg.fillStyle(0x180828,0.97);sg.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,spH,9);sg.lineStyle(2.5,0xff4488,0.9);sg.strokeRoundedRect(cx-PW/2+10,SY0+y,PW-20,spH,9);sg.fillStyle(0xff4488,0.06);sg.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,spH,9);_add(sg);
                    _add(T(cx-PW/2+18,SY0+y+16,(CURRENT_LANG==="tr"?"BASLANGIC PAKETI  -":"STARTER PACK  -")+STARTER.disc+"%",{fontFamily:_F,fontSize:"14px",color:"#ff88aa",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5));
                    _add(T(cx-PW/2+18,SY0+y+38,STARTER.gems+(CURRENT_LANG==="tr"?" ELMAS + ":" GEM + ")+STARTER.gold+(CURRENT_LANG==="tr"?" ALTIN + 2X ALTIN":" GOLD + 2X GOLD"),{fontFamily:_F,fontSize:"12px",color:"#cc99bb",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                    const bx=cx+PW/2-52,bw=72,bh=30;
                    _btn(bx,SY0+y+spH/2,bw,bh,"⭐ "+STARTER.stars,0x88002a,0xff4488,null);
                    _zone(10,y,PW-10,y+spH,()=>{
                        const _buy=()=>{
                            showBigReward(scene,cx,SY0+y+spH/2,"gem",STARTER.gems,D+10);
                            PLAYER_GOLD+=STARTER.gold;secureSet("nt_gold",PLAYER_GOLD);_actB("gold2x");
                            const st=_s();st.sp=true;_sv(st);
                            scene.time.delayedCall(700,()=>_sh());
                        };
                        if(window.Telegram?.WebApp?.openInvoice){window.Telegram.WebApp.openInvoice("starter_pack",(st)=>{if(st==="paid")_buy();});}else _buy();
                    });
                    y+=spH+8;
                }
                _add(T(cx,SY0+y+4,CURRENT_LANG==="tr"?"ELMAS PAKETLERi":"GEM PACKS",{fontFamily:_F,fontSize:"13px",color:"#5588aa",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
                y+=18;
                GEM_PACKS.forEach((pk,i)=>{
                    const tot=pk.gems+pk.bonus, rowH=58;
                    const pg=G();
                    pg.fillStyle(0x0e0820,0.97);pg.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,7);
                    pg.lineStyle(1.5,pk.popular?0x44aaff:0x221840,pk.popular?0.6:0.35);pg.strokeRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,7);
                    if(pk.tag){const tc=pk.tag==="popular"?0x44aaff:0xffaa00;pg.fillStyle(tc,1);pg.fillRoundedRect(cx+PW/2-88,SY0+y,68,14,{tl:0,tr:7,bl:4,br:0});}
                    _add(pg);
                    if(pk.tag) _add(T(cx+PW/2-54,SY0+y+7,pk.tag==="popular"?(CURRENT_LANG==="tr"?"POPULER":"POPULAR"):(CURRENT_LANG==="tr"?"EN iYi DEGER":"BEST VALUE"),{fontFamily:_F,fontSize:"9px",color:"#fff",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
                    _addCurrIcon(cx-PW/2+20,SY0+y+20,"gem",22);
                    _add(T(cx-PW/2+40,SY0+y+20,tot+(pk.bonus>0?"  (+"+pk.bonus+(CURRENT_LANG==="tr"?" bonus)":"  bonus)"):""),{fontFamily:_F,fontSize:"15px",color:"#cc88ff",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5));
                    _add(T(cx-PW/2+20,SY0+y+42,pk.price,{fontFamily:_F,fontSize:"12px",color:"#7766aa",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                    const bx=cx+PW/2-52,bw=68,bh=30;
                    _btn(bx,SY0+y+rowH/2,bw,bh,CURRENT_LANG==="tr"?"AL":"BUY",0x300058,0xcc44ff,null);
                    _zone(PW-20-bw,y,PW-10,y+rowH,()=>{
                        if(window.Telegram?.WebApp?.openInvoice){
                            window.Telegram.WebApp.openInvoice("gem_"+i,(st)=>{
                                if(st==="paid"){showBigReward(scene,cx,SY0+y+rowH/2,"gem",tot,D+10);scene.time.delayedCall(700,()=>_sh());}
                            });
                        }
                    });
                    y+=rowH+6;
                });

                // ── GOLD PACKS SECTION ──────────────────────────────────
                y+=8;
                const goldSecHdr=G();
                goldSecHdr.fillStyle(0x120e00,0.97);
                goldSecHdr.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,30,6);
                goldSecHdr.lineStyle(1.5,0xffcc00,0.5);
                goldSecHdr.strokeRoundedRect(cx-PW/2+10,SY0+y,PW-20,30,6);
                _add(goldSecHdr);
                _addCurrIcon(cx-50,SY0+y+15,"gold",22);
                _add(T(cx-28,SY0+y+15,PLAYER_GOLD.toLocaleString(),{fontFamily:_F,fontSize:"17px",color:"#ffcc00",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5));
                _add(T(cx+PW/2-24,SY0+y+15,CURRENT_LANG==="tr"?"ALTIN":"GOLD",{fontFamily:_F,fontSize:"11px",color:"#aa8800",stroke:"#000",strokeThickness:1}).setOrigin(1,0.5));
                y+=38;
                _add(T(cx,SY0+y+4,CURRENT_LANG==="tr"?"ALTIN PAKETLERi":"GOLD PACKS",{fontFamily:_F,fontSize:"13px",color:"#aa7700",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
                y+=18;
                const GOLD_PACKS=[
                    {gold:5000,   price:"$0.99",  bonus:0,     tag:null,     popular:false},
                    {gold:12000,  price:"$1.99",  bonus:2000,  tag:"popular",popular:true},
                    {gold:30000,  price:"$3.99",  bonus:8000,  tag:null,     popular:false},
                    {gold:80000,  price:"$7.99",  bonus:25000, tag:"best",   popular:false},
                ];
                GOLD_PACKS.forEach((gp,i)=>{
                    const rowH=58;
                    const gg=G();
                    gg.fillStyle(0x120a00,0.97);gg.fillRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,7);
                    gg.lineStyle(1.5,gp.popular?0xffcc00:0x443300,gp.popular?0.6:0.35);gg.strokeRoundedRect(cx-PW/2+10,SY0+y,PW-20,rowH,7);
                    if(gp.tag){const tc=gp.tag==="popular"?0xffcc00:0xff8800;gg.fillStyle(tc,1);gg.fillRoundedRect(cx+PW/2-88,SY0+y,68,14,{tl:0,tr:7,bl:4,br:0});}
                    _add(gg);
                    if(gp.tag) _add(T(cx+PW/2-54,SY0+y+7,gp.tag==="popular"?(CURRENT_LANG==="tr"?"POPULER":"POPULAR"):(CURRENT_LANG==="tr"?"EN iYi DEGER":"BEST VALUE"),{fontFamily:_F,fontSize:"9px",color:"#fff",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
                    _addCurrIcon(cx-PW/2+20,SY0+y+20,"gold",22);
                    const tot=gp.gold+(gp.bonus||0);
                    _add(T(cx-PW/2+44,SY0+y+20,tot.toLocaleString()+(gp.bonus>0?" (+"+gp.bonus.toLocaleString()+(CURRENT_LANG==="tr"?" bonus)":"  bonus)"):""),{fontFamily:_F,fontSize:"15px",color:"#ffcc44",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5));
                    _add(T(cx-PW/2+20,SY0+y+42,gp.price,{fontFamily:_F,fontSize:"12px",color:"#7766aa",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                    const bx=cx+PW/2-52,bw=68,bh=30;
                    _btn(bx,SY0+y+rowH/2,bw,bh,CURRENT_LANG==="tr"?"AL":"BUY",0x584200,0xffcc00,null);
                    _zone(PW-20-bw,y,PW-10,y+rowH,()=>{
                        if(window.Telegram?.WebApp?.openInvoice){
                            window.Telegram.WebApp.openInvoice("gold_"+i,(st)=>{
                                if(st==="paid"){PLAYER_GOLD+=tot;secureSet("nt_gold",PLAYER_GOLD);showBigReward(scene,cx,SY0+y+rowH/2,"gold",tot,D+10);scene.time.delayedCall(700,()=>_sh());}
                            });
                        }
                    });
                    y+=rowH+6;
                });

                totalH=y+10;
                break;
            }
        }

        // Update scroll max
        _scrollMax=Math.max(0,totalH-VIEW_H);
        _scrollTo(0);
    }

    _cleanupSc=()=>{
        try{scene.input.off("wheel",_shopWheelHandler);}catch(_){}
        try{maskGfx.destroy();}catch(_){}
        _destroyScroll();
    };

    _sh();
}


// ═══════════════════════════════════════════════════════════════
// §7  POST-DEATH OFFER
// ═══════════════════════════════════════════════════════════════

function showDeathOffer(scene){
    // Removed — replaced by gem revive prompt shown before game over panel
    return;
    const s=_s();s.gm=(s.gm||0)+1;_sv(s);
    if(s.gm%3!==0)return;
    const D=920;
    const objs=[],A=o=>{objs.push(o);return o;};
    const _cl=()=>objs.forEach(o=>{try{o.destroy();}catch(_){}});
    scene.time.delayedCall(900,()=>{
        A(scene.add.rectangle(CX,H/2,W,H,0x000000,0.72).setDepth(D).setInteractive());
        const PW=270,PH=230,PY=H/2-PH/2;
        const pg=A(scene.add.graphics().setDepth(D+1));
        pg.fillStyle(0x080c16,0.98);pg.fillRoundedRect(CX-PW/2,PY,PW,PH,14);
        pg.lineStyle(3,0xff4488,0.9);pg.strokeRoundedRect(CX-PW/2,PY,PW,PH,14);
        pg.setScale(0.8).setAlpha(0);
        scene.tweens.add({targets:pg,scaleX:1,scaleY:1,alpha:1,duration:280,ease:"Back.easeOut"});
        A(scene.add.text(CX,PY+24,"POWER UP!",{fontFamily:_F,fontSize:"15px",color:"#ff88aa",stroke:"#000",strokeThickness:3}).setOrigin(0.5).setDepth(D+2));
        DEATH_OFFERS.forEach((of,i)=>{
            const cy=PY+52+i*50;
            const tc=of.tag?0xffaa00:0x4a3070;
            const og=A(scene.add.graphics().setDepth(D+2));
            og.fillStyle(0x0d1420,0.95);og.fillRoundedRect(CX-PW/2+8,cy-16,PW-16,38,6);
            og.lineStyle(1.5,tc,0.4);og.strokeRoundedRect(CX-PW/2+8,cy-16,PW-16,38,6);
            if(of.tag){og.fillStyle(tc,1);og.fillRoundedRect(CX+PW/2-68,cy-16,50,11,{tl:0,tr:6,bl:3,br:0});
                A(scene.add.text(CX+PW/2-43,cy-11,of.tag,{fontFamily:_F,fontSize:"5px",color:"#fff"}).setOrigin(0.5).setDepth(D+4));}
            A(scene.add.text(CX-PW/2+16,cy+2,of.gems+" GEM + "+of.gold+" GOLD",{fontFamily:_F,fontSize:"11px",color:"#ddaacc",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5).setDepth(D+3));
            const bx=CX+PW/2-32;
            const bb=A(scene.add.graphics().setDepth(D+3));
            bb.fillStyle(0x550028,1);bb.fillRoundedRect(bx-20,cy-8,40,18,4);bb.lineStyle(1,0xff4488,0.8);bb.strokeRoundedRect(bx-20,cy-8,40,18,4);
            A(scene.add.text(bx,cy+1,"⭐"+of.stars,{fontFamily:_F,fontSize:"8px",color:"#fff",stroke:"#000",strokeThickness:1}).setOrigin(0.5).setDepth(D+4));
            A(scene.add.rectangle(bx,cy+1,40,18,0xffffff,0.001).setDepth(D+5).setInteractive({useHandCursor:true}))
            .on("pointerdown",()=>{
                if(window.Telegram?.WebApp?.openInvoice){window.Telegram.WebApp.openInvoice("death_"+i,(st)=>{
                    if(st==="paid"){showBigReward(scene,CX,cy,"gem",of.gems,D+10);PLAYER_GOLD+=of.gold;secureSet("nt_gold",PLAYER_GOLD);scene.time.delayedCall(800,_cl);}
                });}
            });
        });
        A(scene.add.text(CX,PY+PH-14,"No thanks",{fontFamily:_F,fontSize:"9px",color:"#556677",stroke:"#000",strokeThickness:1}).setOrigin(0.5).setDepth(D+3).setInteractive({useHandCursor:true})).on("pointerdown",_cl);
    });
}


// ═══════════════════════════════════════════════════════════════
// §8  DAILY MISSIONS — animated, balanced, professional
// Replaces old battle-pass; no paywall, all progression through play
// ═══════════════════════════════════════════════════════════════

// ── Date helpers (local date string used as daily key) ─────────
function _qDateStr(){ const d=new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function _qDayNum(){ return Math.floor((Date.now()-(new Date().getTimezoneOffset()*60000))/86400000); }
function _qMsToMidnight(){
    const d=new Date(); const nx=new Date(d); nx.setHours(24,0,0,0); return nx-d;
}

// ── Deterministic seeded RNG (so same day gives same quests) ──
function _qSeedRand(seed){
    let h = 2166136261 >>> 0;
    const s = String(seed);
    for(let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return function(){
        h += 0x6d2b79f5; h = Math.imul(h ^ (h>>>15), 1 | h);
        h ^= h + Math.imul(h ^ (h>>>7), 61 | h);
        return ((h ^ (h>>>14)) >>> 0) / 4294967296;
    };
}

// ── Daily quest generation ─────────────────────────────────────
// 5 standard game quests (social quests are in "Follow Us" tab separately)
function _qGenDaily(){
    const today = _qDateStr();
    const rnd = _qSeedRand("nt_quest_"+today);
    const poolE = QUEST_POOL.filter(q=>q.diff==="easy");
    const poolM = QUEST_POOL.filter(q=>q.diff==="medium");
    const poolH = QUEST_POOL.filter(q=>q.diff==="hard");
    const poolS = QUEST_POOL.filter(q=>q.diff==="special" && q.type!=="social");
    const pick = (arr)=>arr[Math.floor(rnd()*arr.length)];
    const e1 = pick(poolE);
    const m1 = pick(poolM);
    const out = [e1, m1, pick(poolH)];
    // 4th: second easy (different)
    const poolE2 = poolE.filter(q=>q.id !== e1.id);
    out.push(pick(poolE2.length ? poolE2 : poolE));
    // 5th: special every 3 days, otherwise second medium
    if(_qDayNum()%3===0 && poolS.length){
        out.push(pick(poolS));
    } else {
        const poolM2 = poolM.filter(q=>q.id !== m1.id);
        out.push(pick(poolM2.length ? poolM2 : poolM));
    }
    return out.map(q=>({ id:q.id, prog:0, claimed:false }));
}

function _qEnsureToday(){
    const s = _s();
    const today = _qDateStr();
    if(s.qd !== today || !Array.isArray(s.ql) || s.ql.length===0){
        s.qd = today;
        s.ql = _qGenDaily();
        _sv(s);
    }
    return s;
}

function _qDef(id){ return QUEST_POOL.find(x=>x.id===id); }
function _qIsDone(q){ const d=_qDef(q.id); return d && q.prog>=d.target; }

// ── Check if any quest is completed but not yet claimed ──────
// Used for the red "!" notification dot on the MISSIONS button
function _qHasUnclaimed(){
    const s = _qEnsureToday();
    return s.ql.some(q=> _qIsDone(q) && !q.claimed);
}
function _qHasPending(){
    const s = _qEnsureToday();
    return s.ql.some(q=> !_qIsDone(q));
}

// ── Progress tracking — called at game over ──────────────────
// kills/bosses/elites/games are CUMULATIVE across games today
// level/score/combo are BEST-OF-ANY-GAME today
function _qTrackGame(gs){
    if(!gs) return { completedNew: [] };
    const s = _qEnsureToday();
    const completedNew = [];
    s.ql.forEach(q=>{
        const d = _qDef(q.id); if(!d) return;
        const wasDone = q.prog >= d.target;
        if(wasDone) return;
        const kills  = gs.kills       || 0;
        const boss   = gs._bossKills  || 0;
        const elite  = gs._eliteKills || 0;
        const lvl    = gs.level       || 0;
        const scr    = gs.score       || 0;
        const cmb    = (gs.maxCombo!=null) ? gs.maxCombo : (gs.combo||0);
        switch(d.type){
            case "kills":  q.prog = Math.min(d.target, (q.prog||0) + kills);  break;
            case "bosses": q.prog = Math.min(d.target, (q.prog||0) + boss);   break;
            case "elites": q.prog = Math.min(d.target, (q.prog||0) + elite);  break;
            case "games":  q.prog = Math.min(d.target, (q.prog||0) + 1);      break;
            case "level":  q.prog = Math.min(d.target, Math.max(q.prog||0, lvl)); break;
            case "score":  q.prog = Math.min(d.target, Math.max(q.prog||0, scr)); break;
            case "combo":  q.prog = Math.min(d.target, Math.max(q.prog||0, cmb)); break;
        }
        if(q.prog >= d.target && !wasDone) completedNew.push(d);
    });
    _sv(s);
    return { completedNew };
}

// ── Claim reward: gold + player-XP + (rare) gems ──────────────
function _qClaim(scene, q, xIcon, yIcon, depth){
    const d = _qDef(q.id); if(!d) return false;
    if(!_qIsDone(q) || q.claimed) return false;
    const s = _s();
    const qRef = s.ql.find(x=>x.id===q.id); if(!qRef) return false;
    qRef.claimed = true; _sv(s);

    const r = d.reward || {};
    let anims = 0;
    if(r.gold){
        PLAYER_GOLD += r.gold; secureSet("nt_gold", PLAYER_GOLD);
        scene.time.delayedCall(anims*180, ()=> showBigReward(scene, xIcon, yIcon, "gold", r.gold, depth+10));
        anims++;
    }
    if(r.gem){
        addGems(r.gem);
        scene.time.delayedCall(anims*220, ()=> showBigReward(scene, xIcon, yIcon-18, "gem", r.gem, depth+10));
        anims++;
    }
    if(r.xp && typeof _plvAddXP==="function"){
        try{ _plvAddXP(r.xp); }catch(e){ console.warn("[NT] xp err", e); }
    }
    NT_SFX.play("upgrade_select");
    return true;
}

function showMissions(scene){
    let _cleanupMQ=()=>{};
    const {A,close,contentTop,contentBot,CX:cx,depth:D,PW}
        =NT_OpenPopup(scene,"mm_panel",330,CURRENT_LANG==="tr"?"GUNLUK GOREVLER":"DAILY MISSIONS",312,20,()=>_cleanupMQ());

    // ── TAB BAR ──────────────────────────────────────────────────────
    let _activeTab="missions"; // "missions" | "follow"
    const tabY=contentTop+18;
    const tabW=(PW-28)/2;
    const tab1X=cx-tabW-2, tab2X=cx+2;
    const tabH=28;

    const tabBg1=A(scene.add.graphics().setDepth(D+3));
    const tabBg2=A(scene.add.graphics().setDepth(D+3));
    const tabTxt1=A(scene.add.text(tab1X+tabW/2,tabY,
        CURRENT_LANG==="tr"?"📋 GÖREVLER":"📋 MISSIONS",
        {fontFamily:_F,fontSize:"10px",color:"#ffe066",stroke:"#000",strokeThickness:2}
    ).setOrigin(0.5).setDepth(D+5));
    const tabTxt2=A(scene.add.text(tab2X+tabW/2,tabY,
        CURRENT_LANG==="tr"?"✦ BİZİ TAKİP ET":"✦ FOLLOW US",
        {fontFamily:_F,fontSize:"10px",color:"#aaaaaa",stroke:"#000",strokeThickness:2}
    ).setOrigin(0.5).setDepth(D+5));

    function _drawTabs(){
        tabBg1.clear(); tabBg2.clear();
        const on1=(_activeTab==="missions");
        tabBg1.fillStyle(on1?0xcc7700:0x0c1c2e,1);
        tabBg1.fillRoundedRect(tab1X,tabY-tabH/2,tabW,tabH,{tl:8,tr:0,bl:0,br:0});
        if(on1){tabBg1.fillStyle(0xffffff,0.10);tabBg1.fillRoundedRect(tab1X+2,tabY-tabH/2+3,tabW-4,tabH/2-4,4);}
        tabBg1.lineStyle(on1?2:1,on1?0xffe066:0x1e4060,on1?0.95:0.50);
        tabBg1.strokeRoundedRect(tab1X,tabY-tabH/2,tabW,tabH,{tl:8,tr:0,bl:0,br:0});
        tabTxt1.setColor(on1?"#ffe066":"#4a7aaa");
        tabBg2.fillStyle(!on1?0x1a0050:0x0c1c2e,1);
        tabBg2.fillRoundedRect(tab2X,tabY-tabH/2,tabW,tabH,{tl:0,tr:8,bl:0,br:0});
        if(!on1){tabBg2.fillStyle(0xffffff,0.10);tabBg2.fillRoundedRect(tab2X+2,tabY-tabH/2+3,tabW-4,tabH/2-4,4);}
        tabBg2.lineStyle(!on1?2:1,!on1?0xcc88ff:0x1e4060,!on1?0.95:0.50);
        tabBg2.strokeRoundedRect(tab2X,tabY-tabH/2,tabW,tabH,{tl:0,tr:8,bl:0,br:0});
        tabTxt2.setColor(!on1?"#cc88ff":"#4a7aaa");
    }
    _drawTabs();
    A(scene.add.rectangle(tab1X+tabW/2,tabY,tabW,tabH,0xffffff,0.001).setDepth(D+6).setInteractive({useHandCursor:true}))
        .on("pointerdown",()=>{if(_activeTab==="missions")return;NT_SFX.play("menu_click");_activeTab="missions";_drawTabs();_showContent();});
    A(scene.add.rectangle(tab2X+tabW/2,tabY,tabW,tabH,0xffffff,0.001).setDepth(D+6).setInteractive({useHandCursor:true}))
        .on("pointerdown",()=>{if(_activeTab==="follow")return;NT_SFX.play("menu_click");_activeTab="follow";_drawTabs();_showContent();});

    // ── SHARED SCROLL/MASK SETUP ──────────────────────────────────────
    const contentAreaY=tabY+tabH/2+2;
    const VIEW_H=contentBot-contentAreaY-4;
    const VPORT_X=cx-PW/2+10, VPORT_W=PW-20;

    const maskGfx=scene.add.graphics().setDepth(D+1);
    maskGfx.fillStyle(0xffffff,1);
    maskGfx.fillRect(VPORT_X,contentAreaY,VPORT_W,VIEW_H);
    const geomMask=maskGfx.createGeometryMask();

    let _scrollCont=null, _scrollY=0, _scrollMax=0;
    let _dragStartY=0, _dragStartSY=0, _isDragging=false;
    let _scrollHit=null, _clockEvt=null;
    // Extra scene-level objects that aren't in the container
    let _extraObjs=[];
    const _zones=[];

    function _scrollTo(y){
        _scrollY=Math.max(0,Math.min(_scrollMax,y));
        if(_scrollCont) _scrollCont.y=-_scrollY;
    }
    const _wheelHandler=(pointer,gameObjects,dx,dy)=>{_scrollTo(_scrollY+dy*0.5);};
    scene.input.on("wheel",_wheelHandler);

    function _destroyContent(){
        // Destroy container and all children
        if(_scrollCont){try{_scrollCont.destroy();}catch(_){}_scrollCont=null;}
        // Destroy scroll hit zone
        if(_scrollHit){try{_scrollHit.destroy();}catch(_){}_scrollHit=null;}
        // Destroy orphaned scene-level objects (headers etc.)
        _extraObjs.forEach(o=>{try{o.destroy();}catch(_){}});
        _extraObjs=[];
        // Destroy clock
        if(_clockEvt){try{_clockEvt.remove(false);}catch(_){}_clockEvt=null;}
        _zones.length=0; _scrollY=0; _scrollMax=0;
    }

    function _showContent(){
        _destroyContent();
        if(_activeTab==="missions") _buildMissionsTab();
        else _buildFollowTab();
    }

    // ── TAB 1: MISSIONS ──────────────────────────────────────────────
    function _buildMissionsTab(){
        const SY0=contentAreaY;
        const s=_qEnsureToday();
        const quests=s.ql.slice();

        // Header bar — stored in _extraObjs for cleanup
        const hdrH=38;
        const hdrG=scene.add.graphics().setDepth(D+3);
        hdrG.fillStyle(0x080e1e,0.98);hdrG.fillRoundedRect(cx-PW/2+10,SY0+2,PW-20,hdrH,6);
        hdrG.lineStyle(1.5,0x44aaff,0.35);hdrG.strokeRoundedRect(cx-PW/2+10,SY0+2,PW-20,hdrH,6);
        _extraObjs.push(hdrG);

        const doneCount=quests.filter(q=>_qIsDone(q)).length;
        const totalCount=quests.length;
        const cmpTxt=scene.add.text(cx-PW/2+18,SY0+2+12,
            (CURRENT_LANG==="tr"?"TAMAMLANAN: ":"COMPLETED: ")+doneCount+" / "+totalCount,
            {fontFamily:_F,fontSize:"11px",color:"#66ddff",stroke:"#000",strokeThickness:2}
        ).setOrigin(0,0.5).setDepth(D+4);
        _extraObjs.push(cmpTxt);

        const clockTxt=scene.add.text(cx+PW/2-18,SY0+2+12,"",
            {fontFamily:_F,fontSize:"10px",color:"#88aacc",stroke:"#000",strokeThickness:1}
        ).setOrigin(1,0.5).setDepth(D+4);
        _extraObjs.push(clockTxt);
        const _updClock=()=>{
            const ms=_qMsToMidnight();
            const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000);
            if(clockTxt.scene) clockTxt.setText((CURRENT_LANG==="tr"?"YEN: ":"RST: ")+h+"h "+m+"m");
        };
        _updClock();
        _clockEvt=scene.time.addEvent({delay:30000,loop:true,callback:_updClock});

        // Progress bar
        const pbX=cx-PW/2+18,pbW=PW-36,pbY=SY0+2+26,pbH=5;
        const pbBg=scene.add.graphics().setDepth(D+3);
        pbBg.fillStyle(0x111e30,1);pbBg.fillRoundedRect(pbX,pbY,pbW,pbH,2);
        pbBg.lineStyle(1,0x2a4060,0.5);pbBg.strokeRoundedRect(pbX,pbY,pbW,pbH,2);
        _extraObjs.push(pbBg);
        const pbFill=scene.add.graphics().setDepth(D+4);
        _extraObjs.push(pbFill);
        const progRatio=totalCount>0?doneCount/totalCount:0;
        const _pb={v:0};
        scene.tweens.add({targets:_pb,v:progRatio,duration:600,delay:150,ease:"Quad.easeOut",
            onUpdate:()=>{
                if(!pbFill.scene)return;
                pbFill.clear();if(_pb.v<=0)return;
                pbFill.fillStyle(_pb.v>=1?0x44dd66:0x44aaff,0.95);
                pbFill.fillRoundedRect(pbX,pbY,Math.max(pbH,pbW*_pb.v),pbH,2);
            }
        });

        const listSY0=SY0+hdrH+6;
        _scrollCont=A(scene.add.container(0,0).setDepth(D+4));
        _scrollCont.setMask(geomMask);

        const ROW_H=96,ROW_GAP=8,rowStart=listSY0+4;

        quests.forEach((q,i)=>{
            const d=_qDef(q.id);if(!d)return;
            const diffInfo=QUEST_DIFF[d.diff]||QUEST_DIFF.easy;
            const ry=rowStart+i*(ROW_H+ROW_GAP);
            const done=_qIsDone(q),claimed=q.claimed,avail=done&&!claimed;
            const pFrac=Math.min(1,(q.prog||0)/d.target);

            // Row background
            const rg=scene.add.graphics();
            rg.fillStyle(claimed?0x0a1d10:avail?0x0d1f28:0x090e1c,0.96);
            rg.fillRoundedRect(cx-PW/2+12,ry,PW-24,ROW_H,8);
            rg.lineStyle(avail?2:1.5,claimed?0x44aa66:avail?diffInfo.col:0x1a2a3a,claimed?0.55:avail?0.75:0.25);
            rg.strokeRoundedRect(cx-PW/2+12,ry,PW-24,ROW_H,8);
            _scrollCont.add(rg);

            // Difficulty ribbon
            const rib=scene.add.graphics();
            rib.fillStyle(diffInfo.col,0.92);rib.fillRoundedRect(cx-PW/2+12,ry,52,14,4);
            _scrollCont.add(rib);
            _scrollCont.add(scene.add.text(cx-PW/2+38,ry+7,CURRENT_LANG==="tr"?diffInfo.labelTR:diffInfo.label,
                {fontFamily:_F,fontSize:"8px",color:"#ffffff",stroke:"#000",strokeThickness:1.5}).setOrigin(0.5));

            // Left badge (! or ✓)
            const exX=cx-PW/2+18,exY=ry+ROW_H/2+6;
            if(!claimed){
                const exG=scene.add.graphics();
                exG.fillStyle(avail?0x22cc66:diffInfo.col,0.85);
                exG.fillCircle(exX,exY,9);
                exG.lineStyle(1.5,0xffffff,0.5);exG.strokeCircle(exX,exY,9);
                _scrollCont.add(exG);
                const exT=scene.add.text(exX,exY,avail?"✓":"!",
                    {fontFamily:_F,fontSize:"13px",color:"#ffffff",stroke:"#000",strokeThickness:2,fontStyle:"bold"}).setOrigin(0.5);
                _scrollCont.add(exT);
                if(!avail) scene.tweens.add({targets:[exG,exT],alpha:{from:1,to:0.5},yoyo:true,repeat:-1,duration:750,ease:"Sine.easeInOut"});
            }

            // Quest icon
            _scrollCont.add(scene.add.text(cx-PW/2+42,ry+ROW_H/2+6,d.icon,{fontFamily:_F,fontSize:"22px"}).setOrigin(0.5));

            // Name, desc, progress
            const txtX=cx-PW/2+62;
            _scrollCont.add(scene.add.text(txtX,ry+18,CURRENT_LANG==="tr"?d.nameTR:d.name,
                {fontFamily:_F,fontSize:"12px",color:claimed?"#66aa88":"#ffffff",stroke:"#000",strokeThickness:2}).setOrigin(0,0));
            const descStr=CURRENT_LANG==="tr"?(d.descTR||""):(d.desc||"");
            if(descStr) _scrollCont.add(scene.add.text(txtX,ry+33,descStr,
                {fontFamily:_F,fontSize:"9px",color:claimed?"#557766":"#8aa7bf",stroke:"#000",strokeThickness:1,wordWrap:{width:156}}).setOrigin(0,0));
            _scrollCont.add(scene.add.text(txtX,ry+52,Math.min(q.prog,d.target).toLocaleString()+" / "+d.target.toLocaleString(),
                {fontFamily:_F,fontSize:"10px",color:claimed?"#5a8a6a":avail?diffInfo.colStr:"#7a8a9a",stroke:"#000",strokeThickness:1}).setOrigin(0,0));

            // Progress bar
            const barX=txtX,barY=ry+66,barW=148,barH=6;
            const bbG=scene.add.graphics();
            bbG.fillStyle(0x111e30,1);bbG.fillRoundedRect(barX,barY,barW,barH,2);
            bbG.lineStyle(1,0x2a4060,0.5);bbG.strokeRoundedRect(barX,barY,barW,barH,2);
            _scrollCont.add(bbG);
            if(pFrac>0){
                const bfG=scene.add.graphics();
                bfG.fillStyle(claimed?0x44aa66:diffInfo.col,0.92);
                bfG.fillRoundedRect(barX,barY,Math.max(barH,barW*pFrac),barH,2);
                _scrollCont.add(bfG);
            }

            // Reward pills (right side)
            const rewX=cx+PW/2-14;
            let rewY=ry+14;
            const r=d.reward;
            if(r.gold&&r.gold>0){
                const pg=scene.add.graphics();
                pg.fillStyle(0x0a1420,0.92);pg.fillRoundedRect(rewX-54,rewY,54,16,4);
                pg.lineStyle(1,0xffcc00,0.45);pg.strokeRoundedRect(rewX-54,rewY,54,16,4);
                _scrollCont.add(pg);
                _scrollCont.add(scene.add.text(rewX-54+7,rewY+8,"+"+r.gold,
                    {fontFamily:_F,fontSize:"9px",color:"#ffdd44",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                if(scene.textures.exists("icon_gold"))
                    _scrollCont.add(scene.add.image(rewX-9,rewY+8,"icon_gold").setDisplaySize(13,13).setOrigin(0.5));
                rewY+=18;
            }
            if(r.xp){
                const pg=scene.add.graphics();
                pg.fillStyle(0x0a1420,0.92);pg.fillRoundedRect(rewX-54,rewY,54,16,4);
                pg.lineStyle(1,0x44aaff,0.45);pg.strokeRoundedRect(rewX-54,rewY,54,16,4);
                _scrollCont.add(pg);
                _scrollCont.add(scene.add.text(rewX-27,rewY+8,"+"+r.xp+" XP",
                    {fontFamily:_F,fontSize:"9px",color:"#66ccff",stroke:"#000",strokeThickness:1}).setOrigin(0.5,0.5));
                rewY+=18;
            }
            if(r.gem&&r.gem>0){
                const pg=scene.add.graphics();
                pg.fillStyle(0x0a1420,0.92);pg.fillRoundedRect(rewX-54,rewY,54,16,4);
                pg.lineStyle(1,0xcc44ff,0.45);pg.strokeRoundedRect(rewX-54,rewY,54,16,4);
                _scrollCont.add(pg);
                _scrollCont.add(scene.add.text(rewX-54+7,rewY+8,"+"+r.gem,
                    {fontFamily:_F,fontSize:"9px",color:"#dd88ff",stroke:"#000",strokeThickness:1}).setOrigin(0,0.5));
                if(scene.textures.exists("icon_gem"))
                    _scrollCont.add(scene.add.image(rewX-9,rewY+8,"icon_gem").setDisplaySize(13,13).setOrigin(0.5));
                rewY+=18;
            }

            // Right side action
            const btnW=70,btnH=22;
            const btnX=cx+PW/2-14-btnW,btnY=ry+ROW_H-btnH-5;
            if(avail){
                const cbg=scene.add.graphics();
                cbg.fillStyle(diffInfo.col,0.92);cbg.fillRoundedRect(btnX,btnY,btnW,btnH,6);
                cbg.lineStyle(1.5,0xffffff,0.35);cbg.strokeRoundedRect(btnX,btnY,btnW,btnH,6);
                _scrollCont.add(cbg);
                const cTxt=scene.add.text(btnX+btnW/2,btnY+btnH/2,CURRENT_LANG==="tr"?"ODUL AL":"CLAIM",
                    {fontFamily:_F,fontSize:"11px",color:"#ffffff",stroke:"#000",strokeThickness:2}).setOrigin(0.5);
                _scrollCont.add(cTxt);
                scene.tweens.add({targets:[cbg,cTxt],alpha:{from:1,to:0.72},yoyo:true,repeat:-1,duration:650,ease:"Sine.easeInOut"});
                _zones.push({
                    x1:btnX,x2:btnX+btnW,y1:btnY-SY0,y2:btnY-SY0+btnH,
                    fn:()=>{
                        _qClaim(scene,q,btnX+btnW/2,SY0+btnY+btnH/2-_scrollY+10,D);
                        scene.time.delayedCall(300,()=>{close();showMissions(scene);});
                    }
                });
            } else if(claimed){
                const bgG=scene.add.graphics();
                bgG.fillStyle(0x0a2214,0.92);bgG.fillRoundedRect(btnX,btnY,btnW,btnH,6);
                bgG.lineStyle(1.5,0x44dd66,0.55);bgG.strokeRoundedRect(btnX,btnY,btnW,btnH,6);
                _scrollCont.add(bgG);
                _scrollCont.add(scene.add.text(btnX+btnW/2,btnY+btnH/2,"✓ "+(CURRENT_LANG==="tr"?"ALINDI":"CLAIMED"),
                    {fontFamily:_F,fontSize:"10px",color:"#44dd66",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
            } else {
                _scrollCont.add(scene.add.text(cx+PW/2-22-36,ry+ROW_H-16,Math.floor(pFrac*100)+"%",
                    {fontFamily:_F,fontSize:"10px",color:"#6a7a8a",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
            }

            rg.setAlpha(0);
            scene.tweens.add({targets:rg,alpha:1,duration:200,delay:60+i*70,ease:"Quad.easeOut"});
        });

        // Footer note
        const hasSpecial=quests.some(q=>{const d=_qDef(q.id);return d&&d.diff==="special";});
        if(!hasSpecial){
            const fY=rowStart+quests.length*(ROW_H+ROW_GAP)+4;
            _scrollCont.add(scene.add.text(cx,fY+10,
                CURRENT_LANG==="tr"?"💎 OZEL GOREV HER 3 GUNDE BIR GELIR":"💎 SPECIAL MISSION EVERY 3 DAYS",
                {fontFamily:_F,fontSize:"10px",color:"#6688aa",stroke:"#000",strokeThickness:1}).setOrigin(0.5).setAlpha(0.75));
        }

        const totalH=8+quests.length*(ROW_H+ROW_GAP)+30;
        _scrollMax=Math.max(0,totalH-(VIEW_H-(hdrH+6)));
        _scrollTo(0);

        _scrollHit=A(scene.add.rectangle(cx,contentAreaY+VIEW_H/2,VPORT_W,VIEW_H,0xffffff,0.001).setDepth(D+7).setInteractive({draggable:false}));
        _scrollHit.on("pointerdown",(p)=>{_isDragging=false;_dragStartY=p.y;_dragStartSY=_scrollY;});
        _scrollHit.on("pointermove",(p)=>{
            if(!p.isDown)return;
            if(Math.abs(p.y-_dragStartY)>6)_isDragging=true;
            if(_isDragging)_scrollTo(_dragStartSY-(p.y-_dragStartY));
        });
        _scrollHit.on("pointerup",(p)=>{
            if(!_isDragging){
                const lx=p.x,ly=p.y-SY0+_scrollY;
                for(const z of _zones){if(lx>=z.x1&&lx<=z.x2&&ly>=z.y1&&ly<=z.y2){z.fn();break;}}
            }
            _isDragging=false;
        });
    }

    // ── TAB 2: FOLLOW US ─────────────────────────────────────────────
    function _buildFollowTab(){
        const SY0=contentAreaY;
        const socialQuests=QUEST_POOL.filter(q=>q.type==="social");
        const s2=_s();

        _scrollCont=A(scene.add.container(0,0).setDepth(D+4));
        _scrollCont.setMask(geomMask);

        // Header
        const hdrG=scene.add.graphics();
        hdrG.fillStyle(0x080818,0.98);hdrG.fillRoundedRect(cx-PW/2+10,SY0+4,PW-20,44,6);
        hdrG.lineStyle(1.5,0xaa44ff,0.5);hdrG.strokeRoundedRect(cx-PW/2+10,SY0+4,PW-20,44,6);
        _scrollCont.add(hdrG);
        _scrollCont.add(scene.add.text(cx,SY0+18,
            CURRENT_LANG==="tr"?"𝕏  X'TEN TAKİP ET — ELMAS KAZAN!":"𝕏  FOLLOW ON X — EARN GEMS!",
            {fontFamily:_F,fontSize:"11px",color:"#cc88ff",stroke:"#000",strokeThickness:2}).setOrigin(0.5));
        _scrollCont.add(scene.add.text(cx,SY0+34,
            CURRENT_LANG==="tr"?"Her hesap kalıcı olarak 1 kez tamamlanır":"Each account completes permanently once",
            {fontFamily:_F,fontSize:"9px",color:"#7766aa",stroke:"#000",strokeThickness:1}).setOrigin(0.5));

        const ROW_H=92,ROW_GAP=10,rowStart=SY0+58;

        socialQuests.forEach((d,i)=>{
            const isDone=s2._socialDone&&s2._socialDone[d.id];
            const ry=rowStart+i*(ROW_H+ROW_GAP);

            // Row bg
            const rg=scene.add.graphics();
            rg.fillStyle(isDone?0x0a1d10:0x0d0820,0.97);
            rg.fillRoundedRect(cx-PW/2+12,ry,PW-24,ROW_H,8);
            rg.lineStyle(2,isDone?0x44dd66:0xaa44ff,isDone?0.55:0.7);
            rg.strokeRoundedRect(cx-PW/2+12,ry,PW-24,ROW_H,8);
            _scrollCont.add(rg);

            // 𝕏 glow circle on left
            const gX=cx-PW/2+36,gY=ry+ROW_H/2;
            const gCirc=scene.add.graphics();
            gCirc.fillStyle(isDone?0x224422:0x330055,0.92);
            gCirc.fillCircle(gX,gY,23);
            gCirc.lineStyle(2.5,isDone?0x44dd66:0xcc66ff,0.8);
            gCirc.strokeCircle(gX,gY,23);
            _scrollCont.add(gCirc);
            _scrollCont.add(scene.add.text(gX,gY,isDone?"✓":"𝕏",
                {fontFamily:_F,fontSize:"18px",color:isDone?"#44dd66":"#ffffff",stroke:"#000",strokeThickness:3}).setOrigin(0.5));
            if(!isDone) scene.tweens.add({targets:gCirc,alpha:{from:0.75,to:1},yoyo:true,repeat:-1,duration:900,ease:"Sine.easeInOut"});

            // Text info
            const txX=cx-PW/2+66;
            _scrollCont.add(scene.add.text(txX,ry+14,CURRENT_LANG==="tr"?d.nameTR:d.name,
                {fontFamily:_F,fontSize:"13px",color:isDone?"#66dd88":"#ffffff",stroke:"#000",strokeThickness:2}).setOrigin(0,0));
            _scrollCont.add(scene.add.text(txX,ry+30,CURRENT_LANG==="tr"?(d.descTR||""):(d.desc||""),
                {fontFamily:_F,fontSize:"9px",color:isDone?"#447755":"#9977cc",stroke:"#000",strokeThickness:1,wordWrap:{width:152}}).setOrigin(0,0));

            // Gem reward pill
            const rewX=cx+PW/2-14;
            if(d.reward&&d.reward.gem){
                const pg=scene.add.graphics();
                pg.fillStyle(0x0a1420,0.92);pg.fillRoundedRect(rewX-58,ry+12,58,20,5);
                pg.lineStyle(1.5,isDone?0x44dd66:0xcc44ff,0.7);pg.strokeRoundedRect(rewX-58,ry+12,58,20,5);
                _scrollCont.add(pg);
                _scrollCont.add(scene.add.text(rewX-58+9,ry+22,"+"+d.reward.gem,
                    {fontFamily:_F,fontSize:"12px",color:isDone?"#66dd88":"#dd88ff",stroke:"#000",strokeThickness:1.5}).setOrigin(0,0.5));
                if(scene.textures.exists("icon_gem"))
                    _scrollCont.add(scene.add.image(rewX-10,ry+22,"icon_gem").setDisplaySize(16,16).setOrigin(0.5));
            }

            // Follow button OR done badge
            const btnW=86,btnH=26;
            const btnX=cx+PW/2-14-btnW,btnY=ry+ROW_H-btnH-6;
            if(!isDone){
                // Follow button
                const fbX=btnX,fbW=btnW;
                const sbg=scene.add.graphics();
                sbg.fillStyle(0x1a0050,0.95);sbg.fillRoundedRect(fbX,btnY,fbW,btnH,7);
                sbg.lineStyle(2,0xcc66ff,0.9);sbg.strokeRoundedRect(fbX,btnY,fbW,btnH,7);
                sbg.fillStyle(0xffffff,0.10);sbg.fillRoundedRect(fbX+2,btnY+2,fbW-4,btnH*0.4,4);
                _scrollCont.add(sbg);
                const sTxt=scene.add.text(fbX+fbW/2,btnY+btnH/2,
                    CURRENT_LANG==="tr"?"TAKİP ET":"FOLLOW",
                    {fontFamily:_F,fontSize:"11px",color:"#dd88ff",stroke:"#000",strokeThickness:2,fontStyle:"bold"}).setOrigin(0.5);
                _scrollCont.add(sTxt);
                scene.tweens.add({targets:[sbg,sTxt],alpha:{from:1,to:0.65},yoyo:true,repeat:-1,duration:700,ease:"Sine.easeInOut"});

                _zones.push({
                    x1:btnX,x2:btnX+btnW,y1:btnY-SY0,y2:btnY-SY0+btnH,
                    fn:()=>{
                        try{window.open(d.socialURL||"https://x.com","_blank");}catch(_){}
                        const sv=_s();
                        if(!sv._socialDone)sv._socialDone={};
                        sv._socialDone[d.id]=true;
                        if(d.reward&&d.reward.gem)addGems(d.reward.gem);
                        _sv(sv);
                        NT_SFX.play("menu_click");
                        showBigReward(scene,cx,contentAreaY+120,"gem",d.reward?d.reward.gem:5,D+10);
                        scene.time.delayedCall(300,()=>{close();showMissions(scene);});
                    }
                });
            } else {
                const bgG=scene.add.graphics();
                bgG.fillStyle(0x0a2214,0.95);bgG.fillRoundedRect(btnX,btnY,btnW,btnH,7);
                bgG.lineStyle(1.5,0x44dd66,0.7);bgG.strokeRoundedRect(btnX,btnY,btnW,btnH,7);
                _scrollCont.add(bgG);
                _scrollCont.add(scene.add.text(btnX+btnW/2,btnY+btnH/2,"✓ "+(CURRENT_LANG==="tr"?"TAMAM":"DONE"),
                    {fontFamily:_F,fontSize:"11px",color:"#44dd88",stroke:"#000",strokeThickness:1}).setOrigin(0.5));
            }

            rg.setAlpha(0);
            scene.tweens.add({targets:rg,alpha:1,duration:220,delay:80+i*100,ease:"Quad.easeOut"});
        });

        const totalH=8+socialQuests.length*(ROW_H+ROW_GAP)+20;
        _scrollMax=Math.max(0,totalH-VIEW_H);
        _scrollTo(0);

        _scrollHit=A(scene.add.rectangle(cx,contentAreaY+VIEW_H/2,VPORT_W,VIEW_H,0xffffff,0.001).setDepth(D+7).setInteractive({draggable:false}));
        _scrollHit.on("pointerdown",(p)=>{_isDragging=false;_dragStartY=p.y;_dragStartSY=_scrollY;});
        _scrollHit.on("pointermove",(p)=>{
            if(!p.isDown)return;
            if(Math.abs(p.y-_dragStartY)>6)_isDragging=true;
            if(_isDragging)_scrollTo(_dragStartSY-(p.y-_dragStartY));
        });
        _scrollHit.on("pointerup",(p)=>{
            if(!_isDragging){
                const lx=p.x,ly=p.y-SY0+_scrollY;
                for(const z of _zones){if(lx>=z.x1&&lx<=z.x2&&ly>=z.y1&&ly<=z.y2){z.fn();break;}}
            }
            _isDragging=false;
        });
    }

    _showContent();

    _cleanupMQ=()=>{
        try{scene.input.off("wheel",_wheelHandler);}catch(_){}
        try{if(_clockEvt)_clockEvt.remove(false);}catch(_){}
        try{maskGfx.destroy();}catch(_){}
        _extraObjs.forEach(o=>{try{o.destroy();}catch(_){}});
        _extraObjs=[];
        if(_scrollCont){try{_scrollCont.destroy();}catch(_){}}
        if(_scrollHit){try{_scrollHit.destroy();}catch(_){}}
    };
}

// Legacy shims — kept so any lingering external call is safe
function showBP(scene){ return showMissions(scene); }
function addBPXP(n){ /* battle-pass removed — progression now via missions */ }


// ═══════════════════════════════════════════════════════════════
// §9  PUBLIC API
// ═══════════════════════════════════════════════════════════════

return {
    // Systems
    checkDailyReward: checkDaily,
    showFortuneWheel: showWheel,
    showShop: showShop,
    showMissions: showMissions,
    showPostDeathOffer: showDeathOffer,
    // Quest API — called from game code
    trackQuests: _qTrackGame,
    hasUnclaimedQuests: _qHasUnclaimed,
    hasPendingQuests: _qHasPending,
    hasWheelReady: _canFree,
    // Legacy aliases (safe no-ops / redirects) so older call-sites keep working
    showBattlePass: showMissions,
    addBattlePassXP: addBPXP,

    // Booster queries
    isBoosterActive: _isB,
    consumeBooster: _useB,
    getGoldMultiplier: _gMult,
    getXPMultiplier: _xMult,
    activateBooster: _actB,

    // Reward animation (for external use)
    showBigReward: showBigReward,
    showSkinReward: showSkinReward,
};
})();
// ═══════════════════════════════════════════════════════════════
// AAA MONETIZATION ENGINE v4 END
// ═══════════════════════════════════════════════════════════════


function showIAPStore(scene){
    // Close any currently open panel before opening this one
    // (_closePanel was never implemented on the scene — inline it here)
    try{
        if(scene._openPanel && Array.isArray(scene._openPanel)){
            scene._openPanel.forEach(o=>{try{if(o.removeAllListeners)o.removeAllListeners();if(o.destroy)o.destroy();}catch(e){}});
        }
        scene._openPanel=null;
    }catch(e){console.warn("[NT] Hata yutuldu:",e)}

    const W=360,H=640,objs=[],addO=o=>{objs.push(o);return o;};
    const close=()=>{
        objs.forEach(o=>{try{if(o.removeAllListeners)o.removeAllListeners();if(o.destroy)o.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}});
        scene._openPanel=null;
    };

    addO(scene.add.rectangle(W/2,H/2,W,H,0x000000,0.92).setInteractive().setDepth(10)); // input blocker
    const pg=addO(scene.add.graphics().setDepth(11));
    pg.fillStyle(0x04000a,0.99); pg.fillRoundedRect(6,6,348,628,12);
    pg.lineStyle(2.5,0xcc44ff,0.9); pg.strokeRoundedRect(6,6,348,628,12);
    pg.fillStyle(0xcc44ff,0.09); pg.fillRoundedRect(6,6,348,54,{tl:12,tr:12,bl:0,br:0});
    pg.lineStyle(1,0x440066,0.3); pg.strokeRoundedRect(10,10,340,620,10);

    const titleStr=CURRENT_LANG==="ru"?"💎 МАГАЗИН ГЕМОВ":CURRENT_LANG==="en"?"💎 GEM STORE":"💎 ELMAS MAGAZASI";
    addO(scene.add.text(W/2,28,titleStr,{font:"bold 16px LilitaOne, Arial, sans-serif",color:"#cc44ff"}).setOrigin(0.5).setDepth(12));
    const subStr=CURRENT_LANG==="ru"?"Покупай гемы · используй для контента":CURRENT_LANG==="en"?"Buy gems · use for exclusive content":"Elmas al · ozel icerikler icin kullan";
    addO(scene.add.text(W/2,46,subStr,{font:"bold 14px LilitaOne, Arial, sans-serif",color:"#9966cc"}).setOrigin(0.5).setDepth(12));

    // Mevcut bakiye
    const gemTxt=addO(scene.add.text(80,65,"GEM "+PLAYER_GEMS,{font:"bold 15px LilitaOne, Arial, sans-serif",color:"#cc44ff"}).setOrigin(0,0.5).setDepth(12));


    // Gem paketleri
    const CARD_H=76,CARD_GAP=3,START_Y=82;
    GEM_PACKS.forEach((pack,i)=>{
        const cy=START_Y+i*(CARD_H+CARD_GAP);
        const CX=12,CW=336;
        const tagCol=pack.tag==="best"?0xffcc00:pack.tag==="popular"?0xff8800:0xcc44ff;
        const cardBg=addO(scene.add.graphics().setDepth(12));
        // Parlak gradient efekti
        const drawCard=(hov)=>{
            cardBg.clear();
            // Ana arka plan
            cardBg.fillStyle(0x0a0414,1); cardBg.fillRoundedRect(CX,cy,CW,CARD_H,8);
            // Sol renk serit
            cardBg.fillStyle(tagCol,hov?1:0.75); cardBg.fillRoundedRect(CX,cy,5,CARD_H,{tl:8,tr:0,bl:8,br:0});
            // Hover parlakligi
            cardBg.fillStyle(tagCol,hov?0.15:0.06); cardBg.fillRoundedRect(CX,cy,CW,CARD_H,8);
            // Ust shine
            cardBg.fillStyle(0xffffff,hov?0.08:0.03); cardBg.fillRoundedRect(CX,cy,CW,12,{tl:8,tr:8,bl:0,br:0});
            cardBg.lineStyle(hov?2:1,tagCol,hov?0.9:0.5); cardBg.strokeRoundedRect(CX,cy,CW,CARD_H,8);
        };
        drawCard(false);

        // Buyuk gem ikonu
        const gemIconBg=addO(scene.add.graphics().setDepth(13));
        gemIconBg.fillStyle(tagCol,0.2); gemIconBg.fillCircle(CX+38,cy+CARD_H/2,28);
        gemIconBg.lineStyle(2,tagCol,0.5); gemIconBg.strokeCircle(CX+38,cy+CARD_H/2,28);
        // Ic parlama
        gemIconBg.fillStyle(0xffffff,0.12); gemIconBg.fillCircle(CX+34,cy+CARD_H/2-8,8);
        addO(scene.add.text(CX+38,cy+CARD_H/2,"<>",{font:"26px LilitaOne, Arial, sans-serif"}).setOrigin(0.5).setDepth(14));

        // Miktar
        const totalGems=pack.gems+pack.bonus;
        const gemAmtStr=totalGems.toString();
        addO(scene.add.text(CX+74,cy+12,gemAmtStr,{font:"bold 24px LilitaOne, Arial, sans-serif",color:"#cc44ff",stroke:"#000",strokeThickness:3}).setDepth(14));
        const gemWordStr=CURRENT_LANG==="ru"?"ГЕМОВ":CURRENT_LANG==="en"?"GEMS":"ELMAS";
        addO(scene.add.text(CX+74+gemAmtStr.length*14+4,cy+18,gemWordStr,{font:"bold 14px LilitaOne, Arial, sans-serif",color:"#aa66cc",padding:{x:2,y:1}}).setDepth(14));


        // Bonus badge
        if(pack.bonus>0){
            const bonusBg=addO(scene.add.graphics().setDepth(14));
            bonusBg.fillStyle(0x00aa44,0.9); bonusBg.fillRoundedRect(CX+74,cy+54,70,16,4);
            const bStr=CURRENT_LANG==="ru"?"+"+pack.bonus+" БОНУС":CURRENT_LANG==="en"?"+"+pack.bonus+" BONUS":"+"+pack.bonus+" BONUS";
            addO(scene.add.text(CX+109,cy+62,bStr,{font:"bold 12px LilitaOne, Arial, sans-serif",color:"#ffffff",padding:{x:2,y:1}}).setOrigin(0.5).setDepth(15));
        }

        // Tag rozeti
        if(pack.tag){
            const tagStr=pack.tag==="best"?(CURRENT_LANG==="ru"?"⭐ ЛУЧШЕЕ":CURRENT_LANG==="en"?"⭐ BEST VALUE":"⭐ EN IYI"):(CURRENT_LANG==="ru"?"🔥 ПОПУЛЯРНО":CURRENT_LANG==="en"?"🔥 POPULAR":"🔥 POPULER");
            const tagBg=addO(scene.add.graphics().setDepth(14));
            tagBg.fillStyle(tagCol,0.95); tagBg.fillRoundedRect(CX+CW-92,cy+8,82,18,5);
            tagBg.lineStyle(1,0xffffff,0.3); tagBg.strokeRoundedRect(CX+CW-92,cy+8,82,18,5);
            addO(scene.add.text(CX+CW-51,cy+17,tagStr,{font:"bold 11px LilitaOne, Arial, sans-serif",color:"#ffffff",padding:{x:2,y:1}}).setOrigin(0.5).setDepth(15));
        }

        // Fiyat + Satin Al butonu
        const BW=82,BH=34,BX=CX+CW-BW-8,BY=cy+CARD_H-BH-8;
        const buyBg=addO(scene.add.graphics().setDepth(13));
        const drawBuy=(hov)=>{
            buyBg.clear();
            buyBg.fillStyle(hov?tagCol:0x0d0020,1); buyBg.fillRoundedRect(BX,BY,BW,BH,7);
            buyBg.fillStyle(0xffffff,hov?0.12:0.05); buyBg.fillRoundedRect(BX,BY,BW,8,{tl:7,tr:7,bl:0,br:0});
            buyBg.lineStyle(2,tagCol,hov?1:0.7); buyBg.strokeRoundedRect(BX,BY,BW,BH,7);
        };
        drawBuy(false);
        addO(scene.add.text(BX+BW/2,BY+10,pack.price,{font:"bold 12px LilitaOne, Arial, sans-serif",color:"#ffffff",
            padding:{x:2,y:1}
        }).setOrigin(0.5).setDepth(14));
        const buyStr=CURRENT_LANG==="ru"?"КУПИТЬ":CURRENT_LANG==="en"?"BUY":"SATIN AL";
        addO(scene.add.text(BX+BW/2,BY+25,buyStr,{font:"bold 12px LilitaOne, Arial, sans-serif",color:"#cc88ff",padding:{x:2,y:1}}).setOrigin(0.5).setDepth(14));

        const hitArea=addO(scene.add.rectangle(CX+CW/2,cy+CARD_H/2,CW,CARD_H,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(16));
        hitArea.on("pointerover",()=>{drawCard(true);drawBuy(true);});
        hitArea.on("pointerout",()=>{drawCard(false);drawBuy(false);});
        hitArea.on("pointerdown",()=>{
            // Sadece Telegram WebApp ortaminda IAP acilir.
            // Telegram disi ortamlarda (tarayici, test) satin alma islemi engellenir
            // — ucretsiz gem verilmez.
            if(window.Telegram?.WebApp?.openInvoice){
                window.Telegram.WebApp.openInvoice("gem_"+i,(status)=>{
                    if(status==="paid"){addGems(pack.gems+pack.bonus);gemTxt.setText("GEM "+PLAYER_GEMS);showPurchaseEffect(scene,CX+CW/2,cy+CARD_H/2,tagCol,pack.gems+pack.bonus,"GEM");}
                });
            } else {
                // Prod guvenligi: Telegram disi ortamda satin alma devre disi.
                console.warn("[NT] IAP: Telegram WebApp ortami bulunamadi, satin alma engellendi.");
            }
        });
    });

    // _closeBtn was never implemented on the scene — use NT_YellowBtn directly
    objs.push(...NT_YellowBtn(scene,W/2,H-16,190,42,"✕  CLOSE",12,()=>close()));
    scene._openPanel=objs;
}

function showPurchaseEffect(scene,x,y,col,amount,icon){
    scene.cameras.main.shake(40,0.008);
    const fl=scene.add.graphics().setDepth(30);fl.fillStyle(col,0.25);fl.fillRect(0,0,360,640);
    scene.tweens.add({targets:fl,alpha:0,duration:300,onComplete:()=>fl.destroy()});
    for(let i=0;i<24;i++){
        const ang=Phaser.Math.DegToRad(i*15);const spd=Phaser.Math.Between(50,140);
        const p=scene.add.text(x+Math.cos(ang)*15,y+Math.sin(ang)*15,icon,{font:"14px LilitaOne, Arial, sans-serif"}).setDepth(31).setAlpha(0.9);
        scene.tweens.add({targets:p,x:x+Math.cos(ang)*spd,y:y+Math.sin(ang)*spd*0.7,alpha:0,scaleX:0.1,scaleY:0.1,duration:Phaser.Math.Between(300,600),ease:"Quad.easeOut",onComplete:()=>p.destroy()});
    }
    const gt=scene.add.text(x,y-20,"✦ +"+amount+" "+icon,{font:"bold 20px LilitaOne, Arial, sans-serif",color:Phaser.Display.Color.IntegerToColor(col).rgba,stroke:"#000",strokeThickness:3}).setOrigin(0.5).setDepth(32).setAlpha(0);
    scene.tweens.add({targets:gt,alpha:1,y:y-60,duration:600,ease:"Back.easeOut"});
    scene.time.delayedCall(1600,()=>scene.tweens.add({targets:gt,alpha:0,duration:300,onComplete:()=>gt.destroy()}));
}

const LANG_DATA = {
    tr:{
        start:"BASLA",shop:"MAGAZA",collection:"KOLEKSIYON",
        unlocks:"ACIKLAMALAR",credits:"KREDILER",options:"AYARLAR",
        back:"GERI",close:"KAPAT",buy:"SATIN AL",maxed:"MAX ✓",
        gameOver:"OYUN BITTI",playAgain:"TEKRAR OYNA",mainMenu:"ANA MENU",
        paused:"DURDURULDU",resume:"DEVAM ET",
        levelUp:"SEVIYE ATLADI!",pickPower:"GUC SEC",
        perfect:"MUKEMMEL!",centerHit:"TAM ORTADAN!",bullseye:"HARIKA VURUS!",
        chestOpened:"SANDIK ACILDI!",earned:"KAZANILDI!",
        chestCommon:"OLAGAN SANDIK",chestRare:"NADIR SANDIK",chestLegendary:"EFSANE SANDIK",
        kills:"OLDURME",time:"SURE",combo:"KOMBO",gold:"ALTIN",
        bestRun:"EN IYI:",highscore:"YUKSEK SKOR",
        shopUpgrades:"GUCLENDIRMELER",shopCosmetics:"KOZMETIKLER",
        shopWeaponSkins:"SILAH SKINLERI",shopCharSkins:"KARAKTER SKINLERI",
        shopEnemySkins:"DUSMAN SKINLERI",
        selectMap:"HARITA SEC",mapLocked:"🔒 KILITLI",mapsTitle:"HARITALAR",locked:"KILITLI",lockedReq:"GEREKSINIM:",
        map1Name:"Azhkar Colu",map1Desc:"Azhkar… kaybolan medeniyetin son izleri",
        map2Name:"Karanlik Magara",map2Desc:"Henuz acilmadi",
        map3Name:"Antik Tapinak",map3Desc:"Henuz acilmadi",
        collectionTitle:"KOLEKSIYON",unlocksTitle:"ACIKLAMALAR",
        weaponsTab:"SILAHLAR",enemiesTab:"DUSMANLAR",upgradesTab:"GUCLER",
        settingsTitle:"AYARLAR",language:"DIL",sfxVol:"SFX SES",
        musicVol:"MUZIK SESI",langTR:"Turkce",langEN:"English",langRU:"Русский",
        upDamage:"Guc",upAttack:"Hiz Atesi",upSize:"Buyuk Kursun",
        upSplit:"Parca Mermisi",upSpeed:"Ceviklik",upPierce:"Delici",
        upCrit:"Kritik",upKnockback:"Itme",upFreeze:"Buz",
        upXpboost:"Akademisyen",upMaxhp:"Dayaniklilik",upRegen:"Yenilenme",
        upHeal:"Saglik Kiti",
        upExplosive:"El Bombasi",upLightning:"Zincir Simsek",
        upDrone:"Muharip Drone",upSaw:"Testere",upPoison:"Zehir Bulutu",upLaser:"Lazer",upThunder:"Gok Gurultusu",
        upRapidBlaster:"Hizli Blaster",upHeavyCannon:"Agir Top",
        upSpreadShot:"Sacma Atis",upChainShot:"Zincir Atis",upPrecisionRifle:"Keskin Nisanci",
        upReflectRifle:"Yansima Tufegi",
        evoTriCannon:"Uc Top",evoStormCore:"Firtina Cekirdegi",
        evoOverload:"Asiri Yuk",
        evoMirrorStorm:"Ayna Firtinasi",
        startHp:"Kofte Abisi 💪",startHpDesc:"Basla: +10 max can",
        startDmg:"Cok Kizginum",startDmgDesc:"Basla: +15% hasar",
        startSpd:"Ust Kosucusu 🏃",startSpdDesc:"Basla: +10% hiz",
        goldBonus:"Para Para Para 🤑",goldBonusDesc:"+25% altin kazan",
        extraLife:"Yine mi Oldun 💀",extraLifeDesc:"Bir kez dirilis",
        xpBonus:"Okullu Cocuk 📚",xpBonusDesc:"Basla: +20% XP",
        critStart:"Sallama Vuruyor 🦅",critStartDesc:"Basla: %5 kritik",
        chestHeal:"+5 HP",chestDamage:"+15% DMG",
        chestAttack:"+8% ATES HIZI",chestSpeed:"+10% HAREKET",
        chestMaxHp:"+3 MAX HP",chestComboBoost:"COMBO BOOST",
        chestXp:"+50% XP (30s)",chestGold:"+GOLD",
        extraLife2:"✦ DIRILIS!",
        evolution:"EVRIM",
        upDamageDesc:"+20% hasar",upAttackDesc:"+15% ates hizi",upSizeDesc:"+18% mermi boyutu",
        upSplitDesc:"Oldurunce mermi parcalanir",upSpeedDesc:"+12% hareket hizi",upPierceDesc:"+1 dusman deler",
        upCritDesc:"+8% kritik sans",upKnockbackDesc:"Dusmani iter",upFreezeDesc:"%9 dondurma",
        upXpboostDesc:"+20% XP",upMaxhpDesc:"+5 max can",upRegenDesc:"4s/can yenileme",
        upHealDesc:"Aninda 8 can",
        upExplosiveDesc:"Patlayan mermi",upLightningDesc:"Simsek zinciri",
        upDroneDesc:"Oto hedefli drone",upSawDesc:"Seken testere",upPoisonDesc:"Olumde zehir",upLaserDesc:"Alan lazeri",upThunderDesc:"Rastgele simsek",
        upRapidBlasterDesc:"Hizli ates, dusuk hasar. 2.2x hiz / 0.6x hasar",
        upHeavyCannonDesc:"Yavas ama patlamali. 2.5x hasar / 0.5x hiz",
        upSpreadShotDesc:"3 mermi koni atisi. 0.45x hasar",
        upChainShotDesc:"3 dusmana sekme. 0.8x hasar",
        upPrecisionRifleDesc:"Merkeze vur = 3x bonus. 1.8x hasar",
        upReflectRifleDesc:"Kenara carp, sek. 2x sekme, 0.7x hasar/sekme",
        evoTriCannonDesc:"Uclu genis atis",evoStormCoreDesc:"Rezonans x2, hasar x1.5",
        evoOverloadDesc:"%4 ekran patlamasi",
        evoCryoFieldDesc:"Alan dondurucu",evoPlagueBearer2Desc:"Patlama zehir birakir",
        evoMirrorStormDesc:"Ilk sekmede 3'e bolunur",
        comingSoon:"🔒 YAKINDA",required:"Gerekli:",unlocked:"✓ ACIK",
        creditsTitle:"KREDILER",creditsBy:"YAPIMCI",
        footerSignature:"NOT FAIR  —  Sahin Beyazgul",
        cosmingSoonLabel:"🎨 Yakinda... / Coming Soon",
        evolutionsLabel:"— EVRIMLER —",
        synergyTitle:"⚡ SINERJI ⚡",
        miniBossAlert:"⚠  MINI BOSS GELIYOR  ⚠",
        evolutionTitle:"⚡ EVRIM ⚡",
        powerSpike_overload:"ASIRI YUK",
        powerSpike_unstoppable:"DURDURULAMAZ",
        powerSpike_godlike:"TANRI MODU",
        nearDeath_buff:"💀 OLUM ADRENALINI",
        comboBreak:"KOMBO KIRILDI",
        hiddenSynergy:"✦ GIZLI SINERJI",
        eventDoubleDmg:"CIFT HASAR",
        eventGodBurst:"TANRI PATLAMASI",
        eventTripleGold:"3X ALTIN MODU",
        eventOneHit:"TEK VURUS OLUMu",
        accept:"KABUL ET",
        decline:"REDDET",
        crystalRevived:"💎 DIRILDIN!",
        crystalRevivedFull:"💎 DIRILDIN! 5SN YENILMEZ",
        reviveTitle:"** DIRILIS **",
        reviveCostInfo:"5 ELMAS KARSILIGINDA DIRILIS",
        reviveHpInfo:"HP+3 / 5SN YENILMEZLIK",
        reviveBtnGem:"✦ DIRIL  (5 💎)",
        reviveEndBtn:"OYUNU BITIR",
        howto_goal:"Piramitler yere degmeden once mermiyle vur ve yok et!",
        howto_move:"← → tuslari veya ekrana dokunarak saga-sola hareket et",
        howto_shoot:"Bosluk = ates et. Dusmanin TAM ORTASINA vur = 3x hasar!",
        howto_level:"XP orb topla. Her seviyede bir guclendirme sec.",
        howto_evo:"2 uyumlu guc maks seviyeye ulasirsa Evrim aktif olur!",
        howto_events:"~60 saniyede bir riskli event gelir. Dikkatli karar ver!",
        howto_combo:"Hizli oldur → kombo artar → daha fazla XP ve altin!",
        howto_apple:"Dusmanlardan nadiren duser. Topla = +3 Can",
        howto_crystal:"Boss oldur ya da 5 dk hayatta kal → kristal kazan!",
        howto_synergy:"2 uyumlu silah birlikte = gizli guclu sinerji bonusu!",
        goRevive:"💎 DIRIL",goReviveCost:"(5 Elmas)",goInsufficientGems:"❌ Yetersiz Elmas!",
        goGemsStatus:"💎 Mevcut:",goGemsInsufficient:"(Yetersiz)",goShare:"📤 Skoru Paylas",
        goRevivePrompt:"DIRILMEK ISTER MISIN?",goReviveCrystalCost:"Mevcut:",
        goReviveBtn:"✦ DIRIL  (3 💎)",
        leaderboard:"🏆 SKOR TABLOSU",lbTitle:"DUNYA SIRALAMALARI",lbRank:"SIRA",lbPlayer:"OYUNCU",lbScore:"SKOR",lbLoading:"Yukleniyor...",lbEmpty:"Henuz skor yok!",lbYou:"(Sen)",lbSubmit:"Skoru Gonder",lbError:"Baglanti hatasi",lbGlobal:"GLOBAL",lbLocal:"KISISEL",
        menuPlay:"OYNA",menuShop:"MAGAZA",menuSettings:"AYARLAR",menuLeaderboard:"SKOR TABLOSU",
        playAgain:"TEKRAR OYNA",mainMenu:"ANA MENU",gameOver:"OYUN BITTI",
        eventGoldRush:"ALTIN AKINI",eventGoldRushMsg:"ALTIN AKINI! +150 Altin Aninda / +40% Altin (35sn)",
        eventGoldRushEnd:"Altin Akini bitti.",
        eventGlassCannon:"CAM TOP",eventGlassCannonMsg:"CAM TOP! +15% HASAR / Max HP-2 (40sn)",eventGlassCannonEnd:"Cam Top bitti.",
        eventChaosBurst:"KAOS PATLAMASI",eventChaosBurstMsg:"KAOS PATLAMASI! (30sn) — Hiz -%10",eventChaosBurstEnd:"Kaos Patlamasi bitti.",
        eventSurvival:"HAYATTA KALMA",eventSurvivalMsg:"HAYATTA KALMA! (42sn) — Hiz -%15",eventSurvivalEnd:"Hayatta Kalma bitti.",
        eventBlitz:"YILDIRIN HIZI",eventBlitzMsg:"YILDIRIN HIZI! +25% Ates / XP -%30 (30sn)",eventBlitzEnd:"Blitz Mode bitti.",
        eventXpFrenzy:"XP CILGINLIGI",eventXpFrenzyMsg:"XP CILGINLIGI! +40% XP / Hizli Spawn (25sn)",eventXpFrenzyEnd:"XP Cilginligi bitti.",
        rejectionBonus:"+60G Reddetme Bonusu",
        bossSpawned:"BOSS GELIYOR!",eliteKilled:"★ ELIT OLDURULDU ★",titanDown:"DEV YIKILDI!",eliteHuntBonus:"ELIT AV BONUS!",
        blocked:"BLOK",hpPickup:"+20 CAN",goldBonus10:"+10% ALTIN BONUSU",dmgBuff:"+12% HASAR (10sn)",knockbackActive:"Itme aktif — hasar -15%",
        revivePrompt:"DIRILMEK ISTER MISIN?",reviveBtn:"✦ DIRIL",reviveNo:"HAYIR",notEnoughGems:"YETERSIZ ELMAS!",revived:"✦ DIRILDIN!",
        goScore:"SKOR",goNewRecord:"** YENI REKOR **",goLevel:"SEVIYE",goTime:"SURE",
        levelXpPacks:"— LEVEL XP PAKETLERI —",levelXpPacksDesc:"Gem harcayarak dogrudan Level XP kazan!"
    },
    en:{
        start:"START",shop:"SHOP",collection:"COLLECTION",
        unlocks:"UNLOCKS",credits:"CREDITS",options:"OPTIONS",
        back:"BACK",close:"CLOSE",buy:"BUY",maxed:"MAX ✓",
        gameOver:"GAME OVER",playAgain:"PLAY AGAIN",mainMenu:"MAIN MENU",
        paused:"PAUSED",resume:"RESUME",
        levelUp:"LEVEL UP!",pickPower:"Pick a power",
        perfect:"PERFECT!",centerHit:"DEAD CENTER!",bullseye:"BULLSEYE!",
        chestOpened:"CHEST OPENED!",earned:"earned!",
        chestCommon:"COMMON CHEST",chestRare:"RARE CHEST",chestLegendary:"LEGENDARY CHEST",
        kills:"KILLS",time:"TIME",combo:"COMBO",gold:"GOLD",
        bestRun:"BEST:",highscore:"HIGH SCORE",
        shopUpgrades:"UPGRADES",shopCosmetics:"COSMETICS",
        shopWeaponSkins:"WEAPON SKINS",shopCharSkins:"CHAR SKINS",
        shopEnemySkins:"ENEMY SKINS",
        selectMap:"SELECT MAP",mapLocked:"🔒 LOCKED",mapsTitle:"MAPS",locked:"LOCKED",lockedReq:"Requires:",
        map1Name:"Azhkar Desert",map1Desc:"Azhkar… the last traces of a lost civilization",
        map2Name:"Dark Cave",map2Desc:"Not yet unlocked",
        map3Name:"Ancient Temple",map3Desc:"Not yet unlocked",
        collectionTitle:"COLLECTION",unlocksTitle:"UNLOCKS",
        weaponsTab:"WEAPONS",enemiesTab:"ENEMIES",upgradesTab:"UPGRADES",
        settingsTitle:"SETTINGS",language:"LANGUAGE",sfxVol:"SFX VOL",
        musicVol:"MUSIC VOL",langTR:"Turkce",langEN:"English",langRU:"Русский",
        upDamage:"Power",upAttack:"Rapid Fire",upSize:"Big Bullet",
        upSplit:"Split Shot",upSpeed:"Agility",upPierce:"Piercing",
        upCrit:"Critical",upKnockback:"Knockback",upFreeze:"Ice",
        upXpboost:"Scholar",upMaxhp:"Endurance",upRegen:"Regeneration",
        upHeal:"Health Kit",
        upExplosive:"Grenade",upLightning:"Chain Lightning",
        upDrone:"Combat Drone",upSaw:"Saw",upPoison:"Poison Cloud",upLaser:"Laser",upThunder:"Thunder",
        upRapidBlaster:"Rapid Blaster",upHeavyCannon:"Heavy Cannon",
        upSpreadShot:"Spread Shot",upChainShot:"Chain Shot",upPrecisionRifle:"Precision Rifle",
        upReflectRifle:"Reflection Rifle",
        evoTriCannon:"Tri-Cannon",evoStormCore:"Storm Core",
        evoOverload:"Overload",
        evoMirrorStorm:"Mirror Storm",
        evoCryoField:"Cryo Field",evoPlagueBearer:"Plague Bearer",
        startHp:"Gym Bro Mode",startHpDesc:"Start: +10 max hp",
        startDmg:"Anger Issues",startDmgDesc:"Start: +15% damage",
        startSpd:"Leg Day Legend",startSpdDesc:"Start: +10% speed",
        goldBonus:"Gold Digger Pro",goldBonusDesc:"+25% gold earned",
        extraLife:"Oops, Did It Again",extraLifeDesc:"One revival",
        xpBonus:"Nerd Pack 🤓",xpBonusDesc:"Start: +20% XP",
        critStart:"Lucky Clicker",critStartDesc:"Start: 5% crit",
        chestHeal:"+5 HP",chestDamage:"+15% DAMAGE",
        chestAttack:"+8% FIRE RATE",chestSpeed:"+10% MOVEMENT",
        chestMaxHp:"+3 MAX HP",chestComboBoost:"COMBO BOOST",
        chestXp:"+50% XP (30s)",chestGold:"+GOLD",
        extraLife2:"✦ REVIVAL!",
        evolution:"EVOLUTION",
        upDamageDesc:"+20% damage",upAttackDesc:"+15% fire rate",upSizeDesc:"+18% bullet size",
        upSplitDesc:"On kill: bullet splits into 2 fragments",upSpeedDesc:"+12% move speed",upPierceDesc:"+1 pierce",
        upCritDesc:"+8% crit chance",upKnockbackDesc:"Knocks back enemies",upFreezeDesc:"9% freeze chance",
        upXpboostDesc:"+20% XP",upMaxhpDesc:"+5 max HP",upRegenDesc:"Heal 1 HP every 4s",
        upHealDesc:"Instant +8 HP",
        upExplosiveDesc:"Explosive bullets",upLightningDesc:"Chain lightning",
        upDroneDesc:"Auto-targeting drone",upSawDesc:"Bouncing saw",upPoisonDesc:"Poison on kill",upLaserDesc:"Area laser",upThunderDesc:"Random lightning",
        upRapidBlasterDesc:"Fast fire, low damage. 2.2x speed / 0.6x dmg",
        upHeavyCannonDesc:"Slow but explosive. 2.5x dmg / 0.5x speed",
        upSpreadShotDesc:"3-bullet cone. 0.45x dmg each",
        upChainShotDesc:"Bullet jumps 3 targets. 0.8x dmg falloff",
        upPrecisionRifleDesc:"Center hit = 3x bonus. 1.8x dmg",
        upReflectRifleDesc:"Ricochets off walls. 2 bounces, 0.7x dmg each",
        evoTriCannonDesc:"Triple wide shot",evoStormCoreDesc:"Resonance x2, damage x1.5",
        evoOverloadDesc:"4% screen explosion",
        evoCryoFieldDesc:"Area freeze",evoPlagueBearer2Desc:"Explosions leave poison",
        evoMirrorStormDesc:"First bounce splits into 3",
        comingSoon:"🔒  COMING SOON",required:"Required:",unlocked:"✓ UNLOCKED",
        creditsTitle:"CREDITS",creditsBy:"DEVELOPER",
        footerSignature:"NOT FAIR  —  Sahin Beyazgul",
        cosmingSoonLabel:"🎨 Coming Soon...",
        evolutionsLabel:"— EVOLUTIONS —",
        synergyTitle:"⚡ SYNERGY ⚡",
        miniBossAlert:"⚠  MINI BOSS INCOMING  ⚠",
        evolutionTitle:"⚡ EVOLUTION ⚡",
        powerSpike_overload:"OVERLOAD",
        powerSpike_unstoppable:"UNSTOPPABLE",
        powerSpike_godlike:"GODLIKE",
        nearDeath_buff:"💀 DEATH ADRENALINE",
        comboBreak:"COMBO BROKEN",
        hiddenSynergy:"✦ HIDDEN SYNERGY",
        eventDoubleDmg:"DOUBLE DAMAGE",
        eventGodBurst:"GOD BURST",
        eventTripleGold:"3X GOLD MODE",
        eventOneHit:"ONE-HIT DEATH",
        accept:"Accept",
        decline:"Decline",
        crystalRevived:"💎 REVIVED!",
        crystalRevivedFull:"💎 REVIVED! 5s INVINCIBLE",
        reviveTitle:"** REVIVE **",
        reviveCostInfo:"REVIVE FOR 5 GEMS",
        reviveHpInfo:"HP+3 / 5s INVINCIBLE",
        reviveBtnGem:"✦ REVIVE  (5 💎)",
        reviveEndBtn:"END GAME",
        howto_goal:"Destroy pyramids before they reach the ground!",
        howto_move:"Press ← → or tap the screen to move left/right",
        howto_shoot:"Space = shoot. Hit the DEAD CENTER of enemies = 3x damage!",
        howto_level:"Collect XP orbs. Choose an upgrade at each level.",
        howto_evo:"Max out 2 compatible powers — Evolution activates!",
        howto_events:"A risky event appears every ~60s. Choose carefully!",
        howto_combo:"Kill fast → combo grows → more XP and gold!",
        howto_apple:"Rarely drops from enemies. Collect = +3 HP",
        howto_crystal:"Kill a boss or survive 5 mins → earn a crystal!",
        howto_synergy:"2 compatible weapons together = hidden powerful synergy!",
        goScore:"SCORE",goNewRecord:"** NEW RECORD **",goLevel:"LEVEL",goTime:"TIME",
        goRevive:"💎 REVIVE",goReviveCost:"(5 Gems)",goInsufficientGems:"❌ Not enough gems!",
        goGemsStatus:"💎 Gems:",goGemsInsufficient:"(Insufficient)",goShare:"📤 Share Score",
        goRevivePrompt:"WANT TO REVIVE?",goReviveCrystalCost:"Current:",
        goReviveBtn:"✦ REVIVE  (3 💎)",
        leaderboard:"🏆 LEADERBOARD",lbTitle:"WORLD RANKINGS",lbRank:"RANK",lbPlayer:"PLAYER",lbScore:"SCORE",lbLoading:"Loading...",lbEmpty:"No scores yet!",lbYou:"(You)",lbSubmit:"Submit Score",lbError:"Connection error",lbGlobal:"GLOBAL",lbLocal:"PERSONAL",
        menuPlay:"PLAY",menuShop:"SHOP",menuSettings:"SETTINGS",menuLeaderboard:"LEADERBOARD",
        playAgain:"PLAY AGAIN",mainMenu:"MAIN MENU",gameOver:"GAME OVER",
        revivePrompt:"CONTINUE?",reviveBtn:"✦ REVIVE",reviveNo:"No thanks",notEnoughGems:"Not enough gems!",revived:"✦ REVIVED!",
        levelXpPacks:"— LEVEL XP PACKS —",levelXpPacksDesc:"Spend Gems to earn Level XP directly!"
    },
    ru:{
        start:"НАЧАТЬ",shop:"МАГАЗИН",collection:"КОЛЛЕКЦИЯ",
        unlocks:"ОТКРЫТИЯ",credits:"ТИТРЫ",options:"НАСТРОЙКИ",
        back:"НАЗАД",close:"ЗАКРЫТЬ",buy:"КУПИТЬ",maxed:"МАКС ✓",
        gameOver:"ИГРА ОКОНЧЕНА",playAgain:"ИГРАТЬ СНОВА",mainMenu:"ГЛАВНОЕ МЕНЮ",
        paused:"ПАУЗА",resume:"ПРОДОЛЖИТЬ",
        levelUp:"УРОВЕНЬ ВЫРОС!",pickPower:"Выбери способность",
        perfect:"ОТЛИЧНО!",centerHit:"В ЯБЛОЧКО!",bullseye:"ТОЧНЫЙ ВЫСТРЕЛ!",
        chestOpened:"СУНДУК ОТКРЫТ!",earned:"получено!",
        chestCommon:"ОБЫЧНЫЙ СУНДУК",chestRare:"РЕДКИЙ СУНДУК",chestLegendary:"ЛЕГЕНДАРНЫЙ СУНДУК",
        kills:"УБИЙСТВ",time:"ВРЕМЯ",combo:"КОМБО",gold:"ЗОЛОТО",
        bestRun:"РЕКОРД:",highscore:"РЕКОРД",
        shopUpgrades:"УЛУЧШЕНИЯ",shopCosmetics:"КОСМЕТИКА",
        shopWeaponSkins:"СКИНЫ ОРУЖИЯ",shopCharSkins:"СКИНЫ ПЕРСОНАЖА",
        shopEnemySkins:"СКИНЫ ВРАГОВ",
        selectMap:"ВЫБРАТЬ КАРТУ",mapLocked:"🔒 ЗАБЛОКИРОВАНО",mapsTitle:"КАРТЫ",locked:"ЗАБЛОКИРОВАНО",lockedReq:"Требуется:",
        map1Name:"Пустыня Ажкар",map1Desc:"Ажкар… последние следы утраченной цивилизации",
        map2Name:"Тёмная Пещера",map2Desc:"Ещё не разблокировано",
        map3Name:"Древний Храм",map3Desc:"Ещё не разблокировано",
        collectionTitle:"КОЛЛЕКЦИЯ",unlocksTitle:"ОТКРЫТИЯ",
        weaponsTab:"ОРУЖИЕ",enemiesTab:"ВРАГИ",upgradesTab:"СПОСОБНОСТИ",
        settingsTitle:"НАСТРОЙКИ",language:"ЯЗЫК",sfxVol:"ГРОМКОСТЬ SFX",
        musicVol:"ГРОМКОСТЬ МУЗЫКИ",langTR:"Turkce",langEN:"English",langRU:"Русский",
        upDamage:"Сила",upAttack:"Скорострельность",upSize:"Большая Пуля",
        upSplit:"Разделение",upSpeed:"Ловкость",upPierce:"Пробивание",
        upCrit:"Критический удар",upKnockback:"Отброс",upFreeze:"Лёд",
        upXpboost:"Учёный",upMaxhp:"Выносливость",upRegen:"Регенерация",
        upHeal:"Аптечка",
        upExplosive:"Граната",upLightning:"Цепная Молния",
        upDrone:"Боевой Дрон",upSaw:"Пила",upPoison:"Ядовитое Облако",upLaser:"Лазер",upThunder:"Гром",
        upRapidBlaster:"Скорострел",upHeavyCannon:"Тяжёлая Пушка",
        upSpreadShot:"Шрапнель",upChainShot:"Цепной Выстрел",upPrecisionRifle:"Снайпер",
        upReflectRifle:"Рикошет Винтовка",
        evoTriCannon:"Тройная Пушка",evoStormCore:"Ядро Бури",
        evoOverload:"Перегрузка",
        evoMirrorStorm:"Зеркальный Шторм",
        evoCryoField:"Криополе",evoPlagueBearer:"Носитель Чумы",
        startHp:"Железное Тело",startHpDesc:"Старт: +10 макс. здоровья",
        startDmg:"Острый Клинок",startDmgDesc:"Старт: +15% урона",
        startSpd:"Пустынный Бегун",startSpdDesc:"Старт: +10% скорости",
        goldBonus:"Охотник за Сокровищами",goldBonusDesc:"+25% золота",
        extraLife:"Второй Шанс",extraLifeDesc:"Одно воскрешение",
        xpBonus:"Дар Учёного",xpBonusDesc:"Старт: +20% опыта",
        critStart:"Орлиный Глаз",critStartDesc:"Старт: 5% крит",
        chestHeal:"+5 ХП",chestDamage:"+15% УРОНА",
        chestAttack:"+8% СКОРОСТРЕЛЬНОСТЬ",chestSpeed:"+10% ДВИЖЕНИЕ",
        chestMaxHp:"+3 МАКС ХП",chestComboBoost:"БОНУС КОМБО",
        chestXp:"+50% ОПЫТА (30с)",chestGold:"+ЗОЛОТО",
        extraLife2:"✦ ВОСКРЕШЕНИЕ!",
        evolution:"ЭВОЛЮЦИЯ",
        upDamageDesc:"+20% урона",upAttackDesc:"+15% скорострельность",upSizeDesc:"+18% размер пули",
        upSplitDesc:"При убийстве: пуля разделяется на 2",upSpeedDesc:"+12% скорость",upPierceDesc:"+1 пробивание",
        upCritDesc:"+8% крит. шанс",upKnockbackDesc:"Отбрасывает врагов",upFreezeDesc:"9% заморозка",
        upXpboostDesc:"+20% опыта",upMaxhpDesc:"+5 макс. ХП",upRegenDesc:"1 ХП каждые 4с",
        upHealDesc:"Мгновенно +8 ХП",
        upExplosiveDesc:"Взрывные пули",upLightningDesc:"Цепная молния",
        upDroneDesc:"Дрон-автонаводка",upSawDesc:"Рикошетная пила",upPoisonDesc:"Яд при смерти",upLaserDesc:"Лазер по области",upThunderDesc:"Случайная молния",
        upRapidBlasterDesc:"Быстрый огонь, низкий урон. 2.2x скорость / 0.6x урон",
        upHeavyCannonDesc:"Медленно, но мощно. 2.5x урон / 0.5x скорость",
        upSpreadShotDesc:"Конус из 3 пуль. 0.45x урон каждая",
        upChainShotDesc:"Пуля прыгает по 3 целям. 0.8x урон",
        upPrecisionRifleDesc:"Центр = 3x бонус. 1.8x урон",
        upReflectRifleDesc:"Рикошет от стен. 2 отскока, 0.7x урон каждый",
        evoTriCannonDesc:"Тройной широкий выстрел",evoStormCoreDesc:"Резонанс x2, урон x1.5",
        evoOverloadDesc:"Взрыв 4% экрана",
        evoCryoFieldDesc:"Заморозка по области",evoPlagueBearer2Desc:"Взрывы оставляют яд",
        evoMirrorStormDesc:"Первый рикошет разделяется на 3",
        comingSoon:"🔒  СКОРО",required:"Требуется:",unlocked:"✓ ОТКРЫТО",
        creditsTitle:"ТИТРЫ",creditsBy:"РАЗРАБОТЧИК",
        footerSignature:"NOT FAIR  —  Sahin Beyazgul",
        cosmingSoonLabel:"🎨 Скоро...",
        evolutionsLabel:"— ЭВОЛЮЦИИ —",
        synergyTitle:"⚡ СИНЕРГИЯ ⚡",
        miniBossAlert:"⚠  ИДЁТ МИНИ-БОСС  ⚠",
        evolutionTitle:"⚡ ЭВОЛЮЦИЯ ⚡",
        powerSpike_overload:"ПЕРЕГРУЗКА",
        powerSpike_unstoppable:"НЕУДЕРЖИМЫЙ",
        powerSpike_godlike:"БОГОПОДОБНЫЙ",
        nearDeath_buff:"💀 АДРЕНАЛИН СМЕРТИ",
        comboBreak:"КОМБО СБРОШЕНО",
        hiddenSynergy:"✦ СКРЫТАЯ СИНЕРГИЯ",
        eventDoubleDmg:"ДВОЙНОЙ УРОН",
        eventGodBurst:"ВЗРЫВ БОГА",
        eventTripleGold:"РЕЖИМ 3X ЗОЛОТО",
        eventOneHit:"МГНОВЕННАЯ СМЕРТЬ",
        accept:"Принять",
        decline:"Отказать",
        crystalRevived:"💎 ВОСКРЕШЁН!",
        crystalRevivedFull:"💎 ВОСКРЕШЁН! 5с НЕУЯЗВИМОСТЬ",
        howto_goal:"Уничтожай пирамиды до того, как они достигнут земли!",
        howto_move:"Нажми ← → или коснись экрана для перемещения",
        howto_shoot:"Пробел = выстрел. Попади в ЦЕНТР врага = 3x урон!",
        howto_level:"Собирай XP-шары. При новом уровне выбирай усиление.",
        howto_evo:"Прокачай 2 навыка до макс — Эволюция активируется!",
        howto_events:"Каждые ~60с появляется рискованное событие. Осторожно!",
        howto_combo:"Быстро убивай → больше комбо → больше XP и золота!",
        howto_apple:"Редко выпадает из врагов. Подбери = +3 HP",
        howto_crystal:"Убей босса или продержись 5 минут → кристалл!",
        howto_synergy:"2 совместимых оружия = скрытый мощный бонус!",
        goScore:"СЧЁТ",goNewRecord:"** НОВЫЙ РЕКОРД **",goLevel:"УРОВЕНЬ",goTime:"ВРЕМЯ",
        goRevive:"💎 ВОСКРЕСИТЬ",goReviveCost:"(5 Гемов)",goInsufficientGems:"❌ Недостаточно гемов!",
        goGemsStatus:"💎 Гемы:",goGemsInsufficient:"(Недостаточно)",goShare:"📤 Поделиться",
        goRevivePrompt:"ХОЧЕШЬ ВОСКРЕСНУТЬ?",goReviveCrystalCost:"Текущий:",
        goReviveBtn:"✦ ВОСКРЕСИТЬ  (3 💎)",
        leaderboard:"🏆 ТАБЛИЦА РЕКОРДОВ",lbTitle:"МИРОВОЙ РЕЙТИНГ",lbRank:"МЕСТО",lbPlayer:"ИГРОК",lbScore:"СЧЁТ",lbLoading:"Загрузка...",lbEmpty:"Очков пока нет!",lbYou:"(Вы)",lbSubmit:"Отправить счёт",lbError:"Ошибка соединения",lbGlobal:"ГЛОБАЛЬНЫЙ",lbLocal:"ЛИЧНЫЙ"
    }
};
// Dil ayari: "tr" ve "en" aktif, dil ayarlardan secilebilir.
(function(){
    const s = localStorage.getItem("nt_lang");
    if(s === "tr" || s === "en"){ /* gecerli */ } else { localStorage.setItem("nt_lang", "en"); }
})();
let CURRENT_LANG = localStorage.getItem("nt_lang") || "en";
function L(k){ return (LANG_DATA[CURRENT_LANG]&&LANG_DATA[CURRENT_LANG][k]!==undefined)?LANG_DATA[CURRENT_LANG][k]:((LANG_DATA["en"]&&LANG_DATA["en"][k]!==undefined)?LANG_DATA["en"][k]:k); }
function setLang(l){
    CURRENT_LANG = (l==="tr") ? "tr" : "en";
    localStorage.setItem("nt_lang", CURRENT_LANG);
}
// Helper for objects with name/nameEN/nameRU fields
function LLang(obj,trKey,enKey,ruKey){ if(!obj) return ""; return CURRENT_LANG==="ru"?(obj[ruKey]||obj[trKey]):CURRENT_LANG==="en"?(obj[enKey]||obj[trKey]):obj[trKey]; }

// ── TELEGRAM KULLANICI BILGISI ──────────────────────────────────────────────
const _TG_USER = (function(){
    try{
        const tg=window.Telegram&&window.Telegram.WebApp;
        if(tg&&tg.initDataUnsafe&&tg.initDataUnsafe.user){
            const u=tg.initDataUnsafe.user;
            return {
                id: u.id||0,
                name: u.username ? "@"+u.username : (u.first_name||"Player")+(u.last_name?" "+u.last_name:""),
                raw: u
            };
        }
    }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    const saved=localStorage.getItem("nt_player_name");
    return {id:0, name:saved||"Player", raw:null};
})();

// ── LEADERBOARD SISTEMI ───────────────────────────────────────────────────────
// API anahtarlari client tarafinda BULUNMAMALI — kimlik dogrulama
// Deno Deploy proxy (deep-bison-81.sahosante.deno.net) uzerinde yapilir.
// LB_API_KEY kasitli olarak burada tanimlanmamistir; Deno env variable kullan.
const LB_BIN_ID   = "nt_leaderboard_v1";
const LB_API_BASE = "https://api.jsonbin.io/v3/b";

// Global leaderboard — jsonbin.io'da saklanir
// Veri yapisi: { scores: [ {id, name, score, kills, level, date}, ... ] }
let _lbCache = null;
let _lbLastFetch = 0;

function _getLBBinUrl(){ return "https://deep-bison-81.sahosante.deno.net/lb"; }

// Gercek online LB icin basit Deno Deploy / Workers proxy kullaniyoruz
// Telegram CloudStorage kisisel skoru saklar, Deno proxy global LB
// Eger proxy yoksa sadece yerel localStorage'den gosterir

async function lbFetchScores(){
    // Once local cache'den goster
    const localRaw = localStorage.getItem("nt_lb_cache");
    if(localRaw){ try{ _lbCache=JSON.parse(localRaw); }catch(e){console.warn("[NT] Hata yutuldu:",e)} }

    try{
        const res = await fetch(_getLBBinUrl()+"/scores", {
            method:"GET", headers:{"Content-Type":"application/json"},
            signal: AbortSignal.timeout(5000)
        });
        if(res.ok){
            const data = await res.json();
            if(data&&data.scores){
                _lbCache = data;
                localStorage.setItem("nt_lb_cache", JSON.stringify(data));
                _lbLastFetch = Date.now();
            }
        }
    }catch(e){
        // Sunucu yoksa local cache kullan
    }
    return _lbCache||{scores:[]};
}

// Client tarafi akil disi deger filtresi.
// ONEMLI: Bu kontrol yalnizca kaba manipulasyonlari engeller.
// Gercek guvenlik Deno proxy tarafinda saglanmalidir:
//   1. Gelen `tok` degeri proxy'de ayni _hash mantigiyla dogrulanmali.
//   2. Proxy kendi plausibility kontrolunu uygulamali (bu limitleri yansitarak).
//   3. Telegram user.id ile session eslestirmesi proxy'de yapilmali.
function _isScorePlausible(score, kills, level){
    if(score  > 500000) return false;
    if(kills  > 1000)   return false;
    if(level  > 50)     return false;
    if(kills > 0 && (score / kills) > 5000) return false;
    return true;
}

async function lbSubmitScore(score, kills, level){
    if(!_isScorePlausible(score, kills, level)){
        console.warn("[NT] Score rejected — implausible values", {score, kills, level});
        return;
    }
    try{
        if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.CloudStorage){
            const personal={score,kills,level,date:Date.now(),name:_TG_USER.name};
            window.Telegram.WebApp.CloudStorage.setItem("nt_best", JSON.stringify(personal));
        }
    }catch(e){if(!String(e&&e.message).includes("WebAppMethodUnsupported"))console.warn("[NT] Hata yutuldu:",e)}

    const prevBest = parseInt(secureGet("nt_lb_personal_best","0","0"));
    if(score > prevBest){
        secureSet("nt_lb_personal_best", String(score));
        const entry={
            id:   _TG_USER.id||Date.now(),
            name: _TG_USER.name,
            score, kills, level,
            date: Date.now(),
            tok:  _hash(String(score)+String(kills)+String(level))
        };
        secureSet("nt_lb_my_entry", JSON.stringify(entry));
        try{
            fetch(_getLBBinUrl()+"/submit", {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(entry),
                signal: AbortSignal.timeout(6000)
            }).catch(()=>{});
        }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    }
}

// Yerel cache + kendi skorunu birlestirerek siralama olustur
function lbGetMergedScores(){
    const scores = (_lbCache&&_lbCache.scores) ? [..._lbCache.scores] : [];
    // Kendi entry'mizi de ekle (sunucuya ulasamadiysa da goster)
    const myRaw = secureGet("nt_lb_my_entry","","");
    if(myRaw){
        try{
            const me = JSON.parse(myRaw);
            const already = scores.find(s=>s.id===me.id);
            if(!already) scores.push(me);
            else if(me.score > already.score){ already.score=me.score; already.kills=me.kills; already.level=me.level; }
        }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    }
    scores.sort((a,b)=>b.score-a.score);
    return scores.slice(0,100);
}

// ── MOBIL BUTON GIZLE/GOSTER YARDIMCILARI ────────────────────────────────────
// SceneGame'de butonlar S._btnFire, S._btnLeft, S._btnRight olarak saklanir
function _hideMobileBtns(S){
    if(!S) return;
    [S._btnFire, S._btnLeft, S._btnRight].forEach(btn=>{
        if(!btn) return;
        try{ if(btn.g)btn.g.setVisible(false); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        try{ if(btn.lbl)btn.lbl.setVisible(false); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        try{ if(btn.hit){btn.hit.disableInteractive();btn.hit.setVisible(false);} }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        // Sol/sag buton icin rightHit ayri saklidir
        try{ if(btn.hitR){btn.hitR.disableInteractive();btn.hitR.setVisible(false);} }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    });
}
function _showMobileBtns(S){
    if(!S) return;
    [S._btnFire, S._btnLeft, S._btnRight].forEach(btn=>{
        if(!btn) return;
        try{ if(btn.g)btn.g.setVisible(true); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        try{ if(btn.lbl)btn.lbl.setVisible(true); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        try{ if(btn.hit){btn.hit.setInteractive();btn.hit.setVisible(true);} }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        try{ if(btn.hitR){btn.hitR.setInteractive();btn.hitR.setVisible(true);} }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    });
}

// ── AYARLAR BASLANGIC YUKLEME — localStorage → window degiskenleri ──────────
(function _loadSettings(){
    const _b=(k,def)=>{ const v=localStorage.getItem(k); return v===null?def:v==="1"; };
    const _f=(k,def)=>{ const v=localStorage.getItem(k); return v===null?def:parseFloat(v); };
    window._nt_dmg_nums     = _b("nt_show_dmg",     true);
    window._nt_sfx_on       = _b("nt_sfx_on",       true);
    window._nt_music_on     = _b("nt_music_on",      true);
    window._nt_flame        = _b("nt_flame_effects", true);
    window._nt_shadows      = _b("nt_ground_shadows",true);
    window._nt_sfx_vol      = _f("nt_sfx_vol",  0.19);
    window._nt_music_vol    = _f("nt_music_vol", 0.19);
})();

// ── SABITLER ─────────────────────────────────────────────────
const GROUND_Y    = 453;
const XP_GROUND_Y = 445;

// ── KOMIK YERDEN CARPMASI MESAJLARI ──────────────────────────
const _GROUND_MSGS_TR = [
    "Acitti!","Kacardin!","Enayi!","Nasil kactirirsin?!",
    "Rezalet!","Yere battim!","Hayir hayir hayir!",
    "Bu sefer tamam!","Gozun nerede?!","Ah be!",
    "Boyle oyun olmaz!","Korktun mu?","Kabul edemiyorum!",
    "Bundan utanmalisin!","Git evine!","Hay aksi!",
    "El salladim gitti!","Soguk mu dusunuyordun?","Piramit 1 - Sen 0"
];
const _GROUND_MSGS_EN = [
    "It got away!","Really?!","Missed it!","How did you miss that?!",
    "Oops!","Slipped through!","Come ON!",
    "That one's on you!","Wake up!","Nooo!",
    "Unacceptable!","Were you scared?","I can't watch!",
    "Pyramid wins this round!","Just go home!","Oh come on!",
    "You were RIGHT THERE!","Were you asleep?!","Pyramid 1 - You 0"
];
let _groundMsgIdx = Math.floor(Math.random()*_GROUND_MSGS_TR.length);
function _nextGroundMsg(){
    const msgs = CURRENT_LANG==="tr"?_GROUND_MSGS_TR:_GROUND_MSGS_EN;
    const m = msgs[_groundMsgIdx % msgs.length];
    _groundMsgIdx = (_groundMsgIdx + 1) % msgs.length;
    return m;
}

// ── KOMIK OYUNCUYA CARPMASI MESAJLARI ────────────────────────
const _HIT_MSGS_TR = [
    "Ow!!","Aman Allah'im!","Yapma bunu!","Dokununca acidiyor!",
    "Dur dur dur!","Hey!","Ayyyy!","Acimadi mi?!",
    "Keske blok yapsaydim!","Dikkat edin!","Patladim!",
    "Neden ben?!","Tam isabetli!","Beni mi vurdu?!"
];
const _HIT_MSGS_EN = [
    "Ow!!","Oh come on!","That HURT!","Personal space please!",
    "Stop stop stop!","HEY!","Ouch!","Did that really just happen?!",
    "Should've dodged!","WATCH OUT!","Right in the face!",
    "Why me?!","Bullseye... on me!","Did it just blink?"
];
let _hitMsgIdx = Math.floor(Math.random()*_HIT_MSGS_TR.length);
function _nextHitMsg(){
    const msgs = CURRENT_LANG==="tr"?_HIT_MSGS_TR:_HIT_MSGS_EN;
    const m = msgs[_hitMsgIdx % msgs.length];
    _hitMsgIdx = (_hitMsgIdx + 1) % msgs.length;
    return m;
}

const SPAWN_SAFE_X= 50;
const MAX_ENEMIES = 32; // [BALANCE] late game: HP degil sayi artar
const NEW_PYRAMID_TYPES = new Set(["inferno","glacier","phantom_tri","volt","obsidian"]); // [PERF] top-level Set — applyDmg hot path'te yeniden olusturulmuyor
const MAX_WEAPONS = 4;
const MAX_PASSIVES= 4;
const CHEST_RARITY = {
    COMMON:    {name:"common",   color:0x4488ff,glowColor:0x2255cc,shakeAmp:0.006,rewards:1,label:"chestCommon"},
    RARE:      {name:"rare",     color:0xaa44ff,glowColor:0x7700bb,shakeAmp:0.012,rewards:1,label:"chestRare"},   // [BALANCE] was 2
    LEGENDARY: {name:"legendary",color:0xffcc00,glowColor:0xff8800,shakeAmp:0.022,rewards:2,label:"chestLegendary"} // [BALANCE] was 3
};

const UPGRADES = {
    // ─── PASSIVES (max 4 slots) ──────────────────────────────────
    // All stat caps are enforced in applyUpgrade — not just here
    damage:    {type:"passive",nameKey:"upDamage",   descKey:"upDamageDesc",   max:4,rarity:"common",color:0xff4455,icon:"upicon_damage",   level:0},
    attack:    {type:"passive",nameKey:"upAttack",   descKey:"upAttackDesc",   max:4,rarity:"common",color:0x44aaff,icon:"upicon_attack",   level:0},
    crit:      {type:"passive",nameKey:"upCrit",     descKey:"upCritDesc",     max:3,rarity:"common",  color:0xff66aa,icon:"upicon_crit",     level:0},
    maxhp:     {type:"passive",nameKey:"upMaxhp",    descKey:"upMaxhpDesc",    max:3,rarity:"common",  color:0xff6666,icon:"upicon_maxhp",       level:0},
    speed:     {type:"passive",nameKey:"upSpeed",    descKey:"upSpeedDesc",    max:3,rarity:"common",color:0x44ff88,icon:"upicon_speed",    level:0},
    pierce:    {type:"passive",nameKey:"upPierce",   descKey:"upPierceDesc",   max:2,rarity:"common",  color:0xaaaaff,icon:"upicon_pierce",   level:0},
    freeze:    {type:"passive",nameKey:"upFreeze",   descKey:"upFreezeDesc",   max:3,rarity:"common",  color:0x88ddff,icon:"upicon_freeze",   level:0},
    xpboost:   {type:"passive",nameKey:"upXpboost",  descKey:"upXpboostDesc",  max:2,rarity:"common",  color:0x66ffcc,icon:"upicon_xpboost",       level:0},
    regen:     {type:"passive",nameKey:"upRegen",    descKey:"upRegenDesc",    max:2,rarity:"common",  color:0x44ff88,icon:"upicon_regen",    level:0},
    heal:      {type:"passive",nameKey:"upHeal",     descKey:"upHealDesc",     max:2,rarity:"common",  color:0x00ffaa,icon:"upicon_heal",     level:0},
    knockback: {type:"passive",nameKey:"upKnockback",descKey:"upKnockbackDesc",max:1,rarity:"common",color:0xff8844,icon:"upicon_knockback",       level:0},
    // Tradeoff passives — offer real choice (kept as passives, cap reduced)
    size:      {type:"passive",nameKey:"upSize",     descKey:"upSizeDesc",     max:2,rarity:"common",color:0xffaa00,icon:"upicon_size",     level:0},
    split:     {type:"passive",nameKey:"upSplit",    descKey:"upSplitDesc",    max:3,rarity:"common",  color:0xcc44ff,icon:"upicon_split",    level:0},
    // ─── WEAPONS (max 4 slots) ───────────────────────────────────
    explosive: {type:"weapon", nameKey:"upExplosive",descKey:"upExplosiveDesc",max:2,rarity:"common",  color:0xff8800,icon:"upicon_explosive",level:0},
    lightning: {type:"weapon", nameKey:"upLightning",descKey:"upLightningDesc",max:3,rarity:"common",  color:0xffff55,icon:"upicon_lightning",level:0},
    drone:     {type:"weapon", nameKey:"upDrone",    descKey:"upDroneDesc",    max:2,rarity:"common",  color:0x00ffff,icon:"upicon_drone",    level:0},
    saw:       {type:"weapon", nameKey:"upSaw",      descKey:"upSawDesc",      max:2,rarity:"common",  color:0xcccccc,icon:"upicon_saw",      level:0},
    poison:    {type:"weapon", nameKey:"upPoison",   descKey:"upPoisonDesc",   max:2,rarity:"common",  color:0x55ff55,icon:"upicon_poison",   level:0},
    laser:     {type:"weapon", nameKey:"upLaser",    descKey:"upLaserDesc",    max:2,rarity:"common",  color:0xff2200,icon:"upicon_laser",    level:0},
    thunder:   {type:"weapon", nameKey:"upThunder",  descKey:"upThunderDesc",  max:2,rarity:"common",  color:0x88ccff,icon:"upicon_thunder",  level:0},
    // ─── v9.4 WEAPON TRANSFORMATION SYSTEM ─────────────────────
    // Player can have ONLY ONE main weapon type active.
    // Acquiring a new weapon type replaces the current main weapon.
    rapid_blaster:    {type:"mainweapon",nameKey:"upRapidBlaster",   descKey:"upRapidBlasterDesc",   max:1,rarity:"common",  color:0xffee44,icon:"upicon_rapid_blaster",     level:0},
    heavy_cannon:     {type:"mainweapon",nameKey:"upHeavyCannon",    descKey:"upHeavyCannonDesc",    max:1,rarity:"common",  color:0xff6600,icon:"upicon_heavy_cannon",    level:0},
    spread_shot:      {type:"mainweapon",nameKey:"upSpreadShot",     descKey:"upSpreadShotDesc",     max:1,rarity:"common",  color:0xcc44ff,icon:"upicon_spread_shot",    level:0},
    chain_shot:        {type:"mainweapon",nameKey:"upChainShot",       descKey:"upChainShotDesc",       max:1,rarity:"common",  color:0x44aaff,icon:"upicon_chain_shot",     level:0},
    precision_rifle:   {type:"mainweapon",nameKey:"upPrecisionRifle",  descKey:"upPrecisionRifleDesc",  max:1,rarity:"common",  color:0xff2244,icon:"upicon_precision_rifle", level:0},
    // [v10.0] Reflection Rifle — arena-aware ricochet weapon
    reflection_rifle:  {type:"mainweapon",nameKey:"upReflectRifle",    descKey:"upReflectRifleDesc",    max:1,rarity:"common",  color:0x20ccaa,icon:"upicon_reflection_rifle",   level:0}
};

const EVOLUTIONS = [
    // Tri-Cannon: split+size — passive slot 2 harciyor, makul
    {name:"Tri-Cannon",   icon:"🔱",nameKey:"evoTriCannon",   descKey:"evoTriCannonDesc",   req:["split","size"],           active:false},
    // Storm Core: damage Lv2 yeterli — eskiden damage+crit (2 passive slot)
    {name:"Storm Core",   icon:"⚡",nameKey:"evoStormCore",   descKey:"evoStormCoreDesc",   req:["damage","attack"],        active:false},
    // Overload: attack Lv2 — damage ile cakismiyor artik
    {name:"Overload",     icon:"💥",nameKey:"evoOverload",    descKey:"evoOverloadDesc",    req:["attack","crit"],          active:false},
    // Cryo Field: freeze+speed — pierce yerine speed, daha kolay erisim
    {name:"Cryo Field",   icon:"❄️",nameKey:"evoCryoField",   descKey:"evoCryoFieldDesc",   req:["freeze","speed"],         active:false},
    // Plague Bearer: poison+explosive — weapon slot 2 harciyor, makul
    {name:"Plague Bearer",icon:"☣️",nameKey:"evoPlagueBearer",descKey:"evoPlagueBearer2Desc",req:["poison","explosive"],    active:false},
    // Mirror Storm: reflection_rifle+freeze — bir weapon + bir passive
    {name:"Mirror Storm", icon:"🌀",nameKey:"evoMirrorStorm", descKey:"evoMirrorStormDesc", req:["reflection_rifle","freeze"], active:false},
];

const ENEMY_POOL=[
    ["normal",1,8],["zigzag",3,6],["fast",5,5],["spinner",2,5],["swarm",4,4],
    ["tank",7,3],["shield",9,3],["kamikaze",6,3],["split",11,3],["ghost",13,2],
    ["armored",8,2],["elder",15,1],
    ["bomber",6,3],["stealth",10,2],["healer",12,2],["magnet",8,2],
    ["mirror",14,2],["berserker",9,2],["absorber",11,2],["chain",7,3],
    ["freezer",10,2],["leech",9,2],["titan",18,1],["shadow",12,2],
    ["spiker",8,3],["vortex",13,2],["phantom",16,1],["rusher",7,3],
    ["splitter",10,2],["toxic",8,2],["colossus",20,1],
    // ── OZEL PIRAMIT TIPLERI — renkli varyantlar, farkli mekanikler ──
    ["inferno",8,3],      // Ates piramidi — kirmizi, 360 donerek iner
    ["glacier",9,3],      // Buz piramidi — mavi, yavas ama zirhli
    ["phantom_tri",11,2], // Hayalet ucgen — mor, bolunur
    ["volt",12,2],        // Elektrik ucgen — sari, zigzag + hizlanir
    ["obsidian",16,1],    // Obsidyen ucgen — siyah, cok sert, hasar yansitir
];

const GOLD_UPGRADES=[
    // [v10.2] Yuksek maliyet egrisi:
    {id:"start_hp",    nameKey:"startHp",    descKey:"startHpDesc",    cost:15000,  baseCost:15000,  maxLevel:5,level:0,icon:"💪",  descTxt:"Increases starting HP by +3 per level",     descTxtTR:"Her seviye baslangic HP'yi +3 arttirir"},
    {id:"start_dmg",   nameKey:"startDmg",   descKey:"startDmgDesc",   cost:21000,  baseCost:21000,  maxLevel:5,level:0,icon:"⚔️", descTxt:"Boosts starting damage by +12% per level",  descTxtTR:"Her seviye baslangic hasari +%12 arttirir"},
    {id:"start_spd",   nameKey:"startSpd",   descKey:"startSpdDesc",   cost:15000,  baseCost:15000,  maxLevel:5,level:0,icon:"🏃", descTxt:"Increases movement speed by +10% per level", descTxtTR:"Her seviye hareket hizini +%10 arttirir"},
    {id:"gold_bonus",  nameKey:"goldBonus",  descKey:"goldBonusDesc",  cost:24000,  baseCost:24000,  maxLevel:5,level:0,icon:"💰", descTxt:"Earn +18% more gold per level",              descTxtTR:"Her seviye +%18 daha fazla altin kazan"},
    {id:"extra_life",  nameKey:"extraLife",  descKey:"extraLifeDesc",  cost:75000, baseCost:75000, maxLevel:3,level:0,icon:"❤️", descTxt:"Grants an extra life on death",               descTxtTR:"Olunce ekstra bir can kazanirsin"},
    {id:"xp_bonus",    nameKey:"xpBonus",    descKey:"xpBonusDesc",    cost:18000,  baseCost:18000,  maxLevel:5,level:0,icon:"📚", descTxt:"Gain +15% more XP per level",                descTxtTR:"Her seviye +%15 daha fazla XP kazan"},
    {id:"crit_start",  nameKey:"critStart",  descKey:"critStartDesc",  cost:45000, baseCost:45000, maxLevel:5,level:0,icon:"🦅", descTxt:"Increases base crit chance by +4% per level", descTxtTR:"Her seviye kritik sans +%4 arttirir"},
];

let GS;
let PLAYER_GOLD    = parseInt(secureGet("nt_gold",    "0", "0"));
let PLAYER_CRYSTAL = parseInt(secureGet("nt_crystal", "0", "0"));

// ═══════════════════════════════════════════════════════════════
// ★ ADIM 4 — RELIC SISTEMI (crystal ile acilir)
// ═══════════════════════════════════════════════════════════════
const RELICS = [
    {id:"desert_eye",     icon:"👁", cost:3,  nameKey:"relicDesertEye",
     desc:"Her perfect hit %3 sansla 1 crystal dusurur.",
     apply:(gs)=>{ gs._relicDesertEye=true; }},
    {id:"iron_skin",      icon:"🛡", cost:4,  nameKey:"relicIronSkin",
     desc:"Baslangicta +8 max HP.",
     apply:(gs)=>{ gs.maxHealth+=8; gs.health=Math.min(gs.health+8,gs.maxHealth); }},
    {id:"gold_magnet",    icon:"💰", cost:3,  nameKey:"relicGoldMagnet",
     desc:"+30% altin kazanimi, kalici.",
     apply:(gs)=>{ gs.goldMult=(gs.goldMult||1)*1.30; }},
    {id:"combo_heart",    icon:"❤", cost:5,  nameKey:"relicComboHeart",
     desc:"Combo 15+ iken hasar almak cani 2 yerine 1 azaltir.",
     apply:(gs)=>{ gs._relicComboHeart=true; }},
    {id:"void_crystal",   icon:"🔮", cost:6,  nameKey:"relicVoidCrystal",
     desc:"Boss oldurunce 2 crystal kazanirsin (1 yerine).",
     apply:(gs)=>{ gs._relicVoidCrystal=true; }},
    {id:"berserker_ring", icon:"⚡", cost:4,  nameKey:"relicBerserkerRing",
     desc:"Can %25'in altinda: +20% ek hasar.",
     apply:(gs)=>{ gs._relicBerserkerRing=true; }},
    {id:"ghost_boots",    icon:"👟", cost:3,  nameKey:"relicGhostBoots",
     desc:"Baslangicta +15% hareket hizi.",
     apply:(gs)=>{ gs.moveSpeed=Math.min(285,gs.moveSpeed*1.15); }},
    {id:"lucky_charm",    icon:"🍀", cost:5,  nameKey:"relicLuckyCharm",
     desc:"Upgrade seciminde 4. secenek gorunur.",
     apply:(gs)=>{ gs._relicLuckyCharm=true; }},
    {id:"phoenix_ash",    icon:"🔥", cost:8,  nameKey:"relicPhoenixAsh",
     desc:"Oyun basina 1 otomatik dirilis.",
     apply:(gs)=>{ gs._relicPhoenixAsh=true; gs._phoenixUsed=false; }},
    {id:"storm_seed",     icon:"⛈", cost:5,  nameKey:"relicStormSeed",
     desc:"Lightning her 3s tetiklenir (4s yerine).",
     apply:(gs)=>{ gs._relicStormSeed=true; }},
];

function loadRelics(){
    try{ return JSON.parse(localStorage.getItem("nt_relics")||"[]"); }
    catch(e){ return []; }
}
function saveRelics(ids){ localStorage.setItem("nt_relics", JSON.stringify(ids)); }
function buyRelic(id){
    const r=RELICS.find(r=>r.id===id); if(!r) return false;
    const owned=loadRelics();
    if(owned.includes(id)) return false;
    if(!spendCrystal(r.cost)) return false;
    owned.push(id); saveRelics(owned); return true;
}
function applyOwnedRelics(gs){
    const owned=loadRelics();
    owned.forEach(id=>{ const r=RELICS.find(r=>r.id===id); if(r) r.apply(gs); });
}

// ── HARITA KILIT SISTEMI ─────────────────────────────────────
const MAP_UNLOCK = {
    map2: { cost_crystal:15 },
    map3: { cost_crystal:30 }
};
function isMapUnlocked(mapId){
    return mapId==="map1" || localStorage.getItem("nt_map_"+mapId)==="1";
}
function unlockMap(mapId){
    const req=MAP_UNLOCK[mapId]; if(!req) return false;
    if(isMapUnlocked(mapId)) return false;
    if(!spendCrystal(req.cost_crystal)) return false;
    localStorage.setItem("nt_map_"+mapId,"1"); return true;
}

// ═══════════════════════════════════════════════════════════════
// ★ KRISTAL SISTEMI — Mor kristal para birimi
// Kazanimi cok zor, dirilis + premium skin icin kullanilir
// ═══════════════════════════════════════════════════════════════
const CRYSTAL_SOURCES = {
    boss_kill:        1,   // boss oldurunce 1 kristal
    survive_5min:     2,   // 5 dakika hayatta kalinca 2
    perfect_100:      1,   // tek runda 100 perfect hit
    level_25:         1,   // lv25'e ulasinca
};

const CRYSTAL_COSTS = {
    revive: 3,   // dirilis: 3 kristal
};

function addCrystal(amount, source){
    PLAYER_CRYSTAL = Math.max(0, PLAYER_CRYSTAL + amount);
    secureSet("nt_crystal", PLAYER_CRYSTAL);
    return PLAYER_CRYSTAL;
}

function spendCrystal(amount){
    if(PLAYER_CRYSTAL < amount) return false;
    PLAYER_CRYSTAL -= amount;
    secureSet("nt_crystal", PLAYER_CRYSTAL);
    return true;
}

// ── pickingUpgrade mutex (boolean → stack counter)
let _upgradeLock = 0;
// ── Level-up double-click guard — set true while panel is open, cleared on close
let _levelUpChoosing = false;
function lockUpgrade(gs, S){
    // [CRASH FIX] Sadece ilk lock'ta (0→1) physics.pause yap.
    // Onceden her cagrida pause yapiliyordu — lockUpgrade birden fazla kez
    // cagrilabildiginde (level-up + sandik + event es zamanli) nested pause olusuyordu.
    // unlockUpgrade sadece _upgradeLock===0 olunca resume yapiyor, fakat
    // physics motoru nested pause'u saymiyor — tek bir resume yeterli.
    // Dolayisiyla onceki davranis guvenliydi AMA _microFreeze de pause yapiyordu.
    // _microFreeze 35ms sonra resume yapinca upgrade UI sirasinda fizik yeniden basliyordu.
    // COZUM: _upgradeLock 0→1 gecisinde pause yap, sonraki cagrilarda atla.
    const wasZero = (_upgradeLock === 0);
    _upgradeLock++;
    if(gs){ gs.pickingUpgrade = true; }
    if(wasZero && S && S.physics) S.physics.pause();
    if(S && S.spawnEvent) S.spawnEvent.paused = true;
    if(S) S.time.timeScale = 1.0;
}
function unlockUpgrade(gs, S){
    _upgradeLock = Math.max(0, _upgradeLock - 1);
    if(_upgradeLock === 0){
        if(gs){ gs.pickingUpgrade = false; }
        // [CRASH FIX] isPaused kontrolu — zaten resume'daysa cift resume onle
        if(S && S.physics){
            try{ S.physics.resume(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }
        if(S && S.spawnEvent) S.spawnEvent.paused = false;
    }
}

// ── questDoneCache — localStorage'a her frame yazmayi onler
function applyTimedBuff(gs, key, multiplier, duration, S){
    const old = gs[key];
    gs[key] = gs[key] * multiplier;
    if(S) S.time.delayedCall(duration, ()=>{ if(GS) GS[key] = old; });
}

// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ★ PERFORMANS — Global FPS Monitor + Particle Budget
// ═══════════════════════════════════════════════════════════════
const _IS_MOBILE_EARLY = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
let _perfMode = _IS_MOBILE_EARLY ? "low" : "high"; // "high" | "low" — mobile starts low

// [PERF-FIX] Dairesel buffer — Array.shift() O(n) kopyalamasini onler, reduce() her frame yok
const _FPS_BUF_SIZE = 60;
const _fpsBuf = new Float32Array(_FPS_BUF_SIZE); // pre-allocated, GC baskisi yok
let _fpsBufIdx = 0, _fpsBufCount = 0, _fpsBufSum = 0;
let _perfModeFrame = 0; // throttle sayaci

function updatePerfMode(fps){
    // [PERF-FIX] Dairesel buffer ile O(1) ekleme/cikartma — push/shift/reduce yok
    if(_fpsBufCount >= _FPS_BUF_SIZE){
        _fpsBufSum -= _fpsBuf[_fpsBufIdx];
    } else {
        _fpsBufCount++;
    }
    _fpsBuf[_fpsBufIdx] = fps;
    _fpsBufSum += fps;
    _fpsBufIdx = (_fpsBufIdx + 1) % _FPS_BUF_SIZE;
    // [PERF-FIX] Her frame degil, her 30 frame'de bir (~500ms) guncelle
    _perfModeFrame++;
    if(_perfModeFrame < 30) return;
    _perfModeFrame = 0;
    if(_fpsBufCount < 20) return;
    const avg = _fpsBufSum / _fpsBufCount;
    const threshold = _IS_MOBILE_EARLY ? 50 : 35;
    _perfMode = avg < threshold ? "low" : "high";
}

// Particle budget — low mode'da daha az efekt
function canSpawnParticle(priority="normal"){
    if(_perfMode === "high") return true;
    if(priority === "critical") return true;   // boss death vs
    if(priority === "normal")   return Math.random() < 0.4;
    return false; // "cheap" particle → low mode'da atla
}


// Mevcut UPGRADES sistemine dokunmadan, kombinasyon tespiti ile calisir
// ═══════════════════════════════════════════════════════════════
const SYNERGIES = [
    {
        id:"cryo_shatter",
        name:"Buz Kirilmasi", nameEN:"Ice Shatter",
        req:["freeze","pierce"], reqLv:2,
        desc:"Donmus dusman kritik alir. Pierce +1.",
        descEN:"Frozen enemies take crits. Pierce +1.",
        color:0x88ddff, icon:"❄",
        active:false,
        apply:(gs)=>{ gs._synergyCryoShatter=true; gs.pierceCount+=1; }
    },
    {
        id:"chain_storm",
        name:"Zincir Firtinasi", nameEN:"Chain Crit Storm",
        req:["lightning","crit"], reqLv:2,
        desc:"Simsek kritik ile cakar. +%20 krit hasar.",
        descEN:"Lightning always crits. +20% crit damage.",
        color:0xffff44, icon:"⚡",
        active:false,
        apply:(gs)=>{ gs._synergyChainStorm=true; gs.critMult+=0.2; }
    },
    {
        id:"drone_shield",
        name:"Drone Zirhi", nameEN:"Drone Shield",
        req:["drone","maxhp"], reqLv:2,
        desc:"Drone vurdugunda can iyilesir (+1 her 8 vurusta).",
        descEN:"Drones heal on hit (+1 every 8 hits).",
        color:0x00ffff, icon:"🛡",
        active:false,
        apply:(gs)=>{ gs._synergyDroneShield=true; gs._droneHitCount=0; }
    },
    {
        id:"laser_focus",
        name:"Lazer Odagi", nameEN:"Laser Focus",
        req:["laser","crit"], reqLv:2,
        desc:"Lazer %50 sansla kritik vurur.",
        descEN:"Laser has 50% chance to crit.",
        color:0xff2200, icon:"🎯",
        active:false,
        apply:(gs)=>{ gs._synergyLaserFocus=true; }
    },
    {
        id:"speed_regen",
        name:"Ruzgar Kuru", nameEN:"Wind Cure",
        req:["speed","regen"], reqLv:2,
        desc:"Hareket ederken daha hizli iyilesirsin.",
        descEN:"Moving speeds up regeneration.",
        color:0x44ff88, icon:"🌀",
        active:false,
        apply:(gs)=>{ gs._synergyWindCure=true; }
    },
    // ── GIZLI SINERJILER — oyuncuya soylenmiyor, kesfedince surpriz ──
    {
        id:"hidden_thunder_freeze",
        name:"Kis Firtinasi", nameEN:"Winter Storm", nameRU:"Зимняя Буря",
        req:["thunder","freeze"], reqLv:2,
        desc:"Gizli: Simsek dondurucu etkisi kazanir.",
        descEN:"Hidden: Thunder gains freeze effect.",
        descRU:"Скрытое: Молния замораживает врагов.",
        color:0x88ccff, icon:"❄⚡",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyWinterStorm=true; gs.freezeChance=Math.min(0.5,gs.freezeChance+0.25); }
    },
    // ── v9.4 NEW WEAPON SYNERGIES ──────────────────────────────
    {
        id:"rapid_freeze",
        name:"Buz Firtinasi", nameEN:"Ice Storm", nameRU:"Ледяная Буря",
        req:["rapid_blaster","freeze"], reqLv:1,
        desc:"Gizli: Hizli blaster dondurucu etki kazanir.",
        descEN:"Hidden: Rapid Blaster gains freeze on hit.",
        descRU:"Скрытое: Скорострел замораживает врагов.",
        color:0x88ddff, icon:"❄⚡",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyRapidFreeze=true; gs.freezeChance=Math.min(0.4, gs.freezeChance+0.20); }
    },
    {
        id:"cannon_poison",
        name:"Zehirli Patlama", nameEN:"Toxic Boom", nameRU:"Токсичный Взрыв",
        req:["heavy_cannon","poison"], reqLv:1,
        desc:"Gizli: Agir top patlamalari zehir birakir.",
        descEN:"Hidden: Heavy Cannon explosions leave poison.",
        descRU:"Скрытое: Взрывы тяжёлой пушки оставляют яд.",
        color:0x88ff44, icon:"💥☣",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyCannonPoison=true; }
    },
    {
        id:"precision_crit",
        name:"Kilic Ustasi", nameEN:"Blade Master", nameRU:"Мастер Клинка",
        req:["precision_rifle","crit"], reqLv:1,
        desc:"Gizli: Keskin nisanci mukemmel isabetlerde her zaman kritik.",
        descEN:"Hidden: Precision Rifle perfect hits always crit.",
        descRU:"Скрытое: Снайпер всегда критует при точном попадании.",
        color:0xff2244, icon:"🎯💥",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyPrecisionCrit=true; }
    },
    {
        id:"chain_lightning",
        name:"Yildirim Zinciri", nameEN:"Thunder Chain", nameRU:"Цепь Молний",
        req:["chain_shot","lightning"], reqLv:1,
        desc:"Gizli: Zincir atislar simsek tetikler.",
        descEN:"Hidden: Chain Shot triggers lightning on bounce.",
        descRU:"Скрытое: Цепной выстрел запускает молнию при рикошете.",
        color:0x44aaff, icon:"⚡🔗",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyChainLightning=true; }
    },
    // ── v10.0 NEW SYNERGIES — Reflection Rifle combinations ──
    {
        id:"reflect_freeze",
        name:"Buz Sekme", nameEN:"Cryo Ricochet", nameRU:"Ледяной Рикошет",
        req:["reflection_rifle","freeze"], reqLv:1,
        desc:"Gizli: Yansima mermisi dusmana carptiginda %20 ek donma sansi.",
        descEN:"Hidden: Reflection Rifle gains +20% freeze chance on hit.",
        descRU:"Скрытое: Рикошетная пуля замораживает при попадании.",
        color:0x44ffdd, icon:"❄🔀",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyReflectFreeze=true; gs.freezeChance=Math.min(0.28,gs.freezeChance+0.20); }
    },
    {
        id:"reflect_explosive",
        name:"Patlayan Sekme", nameEN:"Explosive Ricochet", nameRU:"Взрывной Рикошет",
        req:["reflection_rifle","explosive"], reqLv:1,
        desc:"Gizli: Yansima mermisi ilk carpismada patlama yapar.",
        descEN:"Hidden: Reflection Rifle triggers explosion on first hit.",
        descRU:"Скрытое: Первое попадание рикошетной пули вызывает взрыв.",
        color:0x20ccaa, icon:"💥🔀",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyReflectExplosive=true; }
    },
];

// ═══════════════════════════════════════════════════════════════
// ★ UNIFIED STAT PIPELINE — v9.2
// ─────────────────────────────────────────────────────────────
// TUM STAT HESAPLAMALARI buradan gecer.
// Hicbir sistem gs.damage, gs.shootDelay veya gs.moveSpeed'i
// dogrudan kalici olarak mutate etmez — yalnizca "bonus"
// alanlarini doldurur, bu pipeline okur.
//
// Kural:
//  finalDamage  = baseDamage  * (1 + ΣupgradeBonuses + eventBonus + comboBonus)
//  finalSpeed   = baseMoveSpd * (1 + ΣupgradeBonuses + eventBonus)
//  finalShoot   = baseShootDly / (1 + ΣattackBonuses + eventBonus)
//
// Butun carpanlar ADDITIF toplanir → exponential stacking yok.
// ═══════════════════════════════════════════════════════════════


// [v10.x BALANCE REDESIGN] — FULL TRADEOFF SYSTEM
//
// TEMEL KURAL: Her upgrade bir kazanc VE bir maliyet icerir.
// Hicbir upgrade saf buff degildir — kimlik degisikligidir.
//
// YENI HASAR FORMULU (k=0.65, daha agresif DR):
//   rawBonus    = Σ(upgDmg - damagePenalty + event + combo + synergy)  [additive]
//   softBonus   = rawBonus / (1 + rawBonus * 0.65)
//   finalDamage = baseDmg × (1 + softBonus)
//
//   • rawBonus=0.50 → softBonus=0.43  (+43% effective)
//   • rawBonus=1.00 → softBonus=0.61  (+61% effective)
//   • rawBonus=2.00 → softBonus=0.75  (+75% effective)
//   • rawBonus=5.00 → softBonus=0.88  (+88% hard ceiling)
//
// Attack Speed: hard floor 160ms (was 190ms — speed builds get slight reward)
//   finalShoot = max(160, baseShoot / (1 + atkBonus × 0.50))
//
// PASSIVE MALIYETLERI (her level'da uygulanir, pipeline'a girer):
//   damage   → her lv: −6% move speed
//   attack   → her lv: −10% per-shot damage
//   crit     → her lv: −5% base (non-crit) damage
//   speed    → her lv: −8% damage output
//   freeze   → her lv: −12% damage
//   maxhp    → her lv: −8% attack speed
//   regen    → her lv: −10% attack speed
//   knockback→ tek lv: −15% damage
//   xpboost  → her lv: −10% gold drop rate (gs.goldMult)
//   heal     → her lv: −8% max HP (min 8)
//
// MULTI-SHOT: Ekstra mermiler 0.45× hasar yapar (spread shot balanced).
// PIERCE: Her ek isabet sonrasi −20% hasar, taban %50.
// XP BOOST: Toplam XP carpani hard cap: ×1.30 (snowball kapatildi).
// CRIT: Carpani 2.0× sabit (upgrade edilemez). Cap: %38.
// ══════════════════════════════════════════════════════════════

const BASE_DAMAGE      = 1.2;
const BASE_SHOOT_DELAY = 170;
const BASE_MOVE_SPEED  = 310; // was 265 — increased for faster movement
const BASE_CRIT_MULT   = 2.0; // SABIT — upgrade edilemez

// ── Upgrade buff tables — steeper per-level diminishing returns ──────────
// Damage: each level gives less than the last, total raw max = +28% (was +35%)
// Attack: similarly tapered — total raw max = +24% (was +34%)
// Crit:   only 3 levels, each smaller — total raw max = +16%
// The REAL tradeoff is in costs: taking damage SLOWS you, taking attack HURTS damage, etc.
const UPGRADE_BONUSES = {
    damage: [0.12, 0.08, 0.05, 0.03],   // was [0.14,0.10,0.07,0.04] — tighter
    attack: [0.11, 0.07, 0.04, 0.02],   // was [0.13,0.10,0.07,0.04] — tighter
    speed:  [0.08, 0.06, 0.04],          // was [0.09,0.07,0.05]
    crit:   [0.08, 0.05, 0.03]           // was [0.08,0.06,0.05] — last level halved
};

/**
 * [v10.x REDESIGN] Oyuncunun anlik "temiz" stat'larini hesapla.
 * Her passive upgrade artik hem buff hem maliyet icerir.
 * gs.damage / gs.shootDelay dogrudan mutate edilmemeli —
 * bu fonksiyon dondurdugu degerleri kullan.
 *
 * @returns {{ damage, shootDelay, moveSpeed, critChance }}
 */
function calcStats(gs){
    if(!gs) return {damage:BASE_DAMAGE, shootDelay:BASE_SHOOT_DELAY, moveSpeed:BASE_MOVE_SPEED, critChance:0};

    const shopDmgBonus  = (GOLD_UPGRADES.find(u=>u.id==="start_dmg")?.level||0)*0.12; // was 0.15 — shop bonus reduced
    const shopSpdBonus  = (GOLD_UPGRADES.find(u=>u.id==="start_spd")?.level||0)*0.10;
    const shopCritBonus = (GOLD_UPGRADES.find(u=>u.id==="crit_start")?.level||0)*0.04; // was 0.05 per level

    const baseDmg  = BASE_DAMAGE * (1 + shopDmgBonus);
    const baseMov  = BASE_MOVE_SPEED * (1 + shopSpdBonus);
    const baseShoot= BASE_SHOOT_DELAY;

    const dmgLv  = UPGRADES.damage?.level || 0;
    const atkLv  = UPGRADES.attack?.level || 0;
    const spdLv  = UPGRADES.speed?.level  || 0;
    const critLv = UPGRADES.crit?.level   || 0;
    const freezeLv    = UPGRADES.freeze?.level    || 0;
    const maxhpLv     = UPGRADES.maxhp?.level     || 0;
    const regenLv     = UPGRADES.regen?.level     || 0;
    const knockbackLv = UPGRADES.knockback?.level || 0;

    let upgDmg = 0, upgAtk = 0, upgSpd = 0, upgCrit = shopCritBonus;
    for(let i=0;i<dmgLv; i++) upgDmg  += (UPGRADE_BONUSES.damage[i]||0.02);
    for(let i=0;i<atkLv; i++) upgAtk  += (UPGRADE_BONUSES.attack[i]||0.02);
    for(let i=0;i<spdLv; i++) upgSpd  += (UPGRADE_BONUSES.speed[i] ||0.04);
    for(let i=0;i<critLv;i++) upgCrit += (UPGRADE_BONUSES.crit[i]  ||0.03);

    // ── TRADE-OFF COSTS — taking one stat meaningfully costs another ──
    // Damage → speed tradeoff: more damage = less mobility (harder to dodge)
    const dmgSpdCost   = dmgLv   * 0.06;   // −6% move speed per damage level
    // Attack → damage tradeoff: rapid fire = shallower hits
    const atkDmgCost   = atkLv   * 0.09;   // −9% damage per attack level (was 0.07)
    // Crit → base damage tradeoff: gambling consistency costs output floor
    const critDmgCost  = critLv  * 0.06;   // −6% damage per crit level (was 0.04)
    // Speed → damage tradeoff: agility costs hitting power
    const spdDmgCost   = spdLv   * 0.06;   // −6% damage per speed level (was 0.05)
    // Freeze → damage tradeoff: utility costs offense
    const frzDmgCost   = freezeLv * 0.10;  // −10% damage per freeze level (was 0.09)
    // MaxHP → attack speed tradeoff: tankiness costs tempo
    const maxhpAtkCost = maxhpLv  * 0.07;  // −7% attack per maxhp level (was 0.06)
    // Regen → attack speed tradeoff: healing costs tempo
    const regenAtkCost = regenLv  * 0.09;  // −9% attack per regen level (was 0.08)
    // Knockback → damage tradeoff: pushing enemies costs killing them
    const kbDmgCost    = knockbackLv * 0.13; // −13% damage (was 0.11)

    let evDmg = 0, evAtk = 0, evSpd = 0;
    if(gs._survivalModeDebuff) evSpd -= 0.15;
    if(gs._chaosSpeedDebuff)   evSpd -= 0.10;
    if(gs._blitzMode)          evAtk += 0.22; // was 0.25

    // Combo bonus: capped lower — combo is rewarding but not game-breaking
    const cmbDmg = Math.min(0.14, gs.combo * 0.007); // max +14% at combo 20 (was +18%)
    const cmbCrit= Math.min(0.04, gs.combo * 0.002); // max +4% crit (was +6%)

    const ndDmg = gs._nearDeathActive ? 0.10 : 0; // was 0.12 — near-death bonus reduced
    const relicBerserkerBonus = (gs._relicBerserkerRing && gs._nearDeathActive) ? 0.15 : 0; // was 0.20

    // Evolution bonus: 0.04 per active evo (was 0.05) — meaningful but not dominant
    const evoCount = (typeof EVOLUTIONS !== "undefined") ? EVOLUTIONS.filter(e=>e.active).length : 0;
    const evoDmg   = evoCount * 0.04;

    const gcDmg = (gs._glassCannon) ? 0.12 : 0; // was 0.14
    const synDmg = (gs._dmgBurstActive ? 0.08 : 0);

    const totalDmgCost = atkDmgCost + critDmgCost + spdDmgCost + frzDmgCost + kbDmgCost;
    const rawDmgBonus  = upgDmg + evDmg + cmbDmg + ndDmg + relicBerserkerBonus
                       + evoDmg + gcDmg + synDmg - totalDmgCost;

    const totalAtkCost = maxhpAtkCost + regenAtkCost;
    const rawAtkBonus  = upgAtk + evAtk - totalAtkCost;
    const rawSpdBonus  = Math.min(0.24, upgSpd + evSpd - dmgSpdCost); // was 0.28 — speed cap tighter

    // ── CRIT CAP: hard 35% — was 38%, reduced to limit multiplicative bonus ──
    const totalCrit = Math.min(0.35, upgCrit + cmbCrit);

    // ── SOFT CAPS: k=0.80 for damage (steeper DR), k=0.70 for attack speed ──
    // At rawBonus=0.28 (max upgrades): softBonus = 0.28/(1+0.28*0.80) = +0.224 effective (+22%)
    // At rawBonus=0.50 (upgrades+evo+combo): softBonus = 0.50/(1+0.50*0.80) = +0.357 effective (+36%)
    // Compare to old k=0.75: at 0.50 raw → +36% (barely different), but at 1.0 raw → +56% vs +57%
    // The real difference is the LOWER raw inputs feeding into this — fewer stacking bonuses
    // Negatif raw'da asimetrik soft cap — hasar bazin %70'inin altina dusmez
    const softDmgBonus = rawDmgBonus >= 0
        ? rawDmgBonus / (1 + rawDmgBonus * 0.80)
        : Math.max(-0.30, rawDmgBonus / (1 + Math.abs(rawDmgBonus) * 0.40));
    const softAtkBonus = rawAtkBonus / (1 + Math.max(0, rawAtkBonus) * 0.70);

    // ── HARD CEILING: 3.8 — was 4.5 ──
    // At base 1.2 with max shop: baseDmg ≈ 1.44 → ceiling = 3.8/1.44 = 2.64× base
    // Enemies at minute 20 have 3.3× HP → they survive 1-2 hits as intended
    const rawFinalDmg = baseDmg * (1 + softDmgBonus);
    // BUILD BALANCE: minimum damage floor scales with level — weak builds catch up
    const levelMinDmg = baseDmg * (0.70 + Math.min(0.50, (gs.level||1) * 0.03)); // lv1=0.73x, lv10=1.0x, lv15=1.15x
    const finalDmg   = Math.min(3.8, Math.max(levelMinDmg, rawFinalDmg));

    // ── ATTACK SPEED FLOOR: 180ms hard minimum (was 175ms) ──
    // This stops rapid-fire builds from erasing enemies before they enter the screen
    const finalShoot = Math.max(180, baseShoot / (1 + Math.max(0, softAtkBonus)));

    // Move speed hard cap 295 px/s (was 280)
    const finalSpd   = Math.min(295, baseMov * (1 + Math.max(-0.30, rawSpdBonus)));

    return { damage:finalDmg, shootDelay:finalShoot, moveSpeed:finalSpd, critChance:totalCrit };
}
function syncStatsFromPipeline(gs){
    if(!gs) return;
    const s = calcStats(gs);
    gs.damage     = s.damage;
    gs.shootDelay = s.shootDelay;
    gs.moveSpeed  = s.moveSpeed;
    gs.critChance = s.critChance;
    // Weapon multipliers applied AFTER pipeline — floors respect the 180ms global minimum
    const wt=gs.activeWeapon||"default";
    if(wt==="rapid_blaster"){
        gs.damage    *= 0.65;                                // ×0.60 dmgM per bullet, 2 bullets, floor 120ms
        gs.shootDelay = Math.max(120, gs.shootDelay / 1.7); // was /1.8 floor 110 — slightly slower
    } else if(wt==="heavy_cannon"){
        gs.damage    *= 2.60;                                // was 1.85 — yavas ama guclu, arttirildi
        gs.shootDelay = Math.min(750, gs.shootDelay * 2.0);
    } else if(wt==="spread_shot"){
        gs.damage    *= 0.75;                                // ×0.70 dmgM per bullet, 3 bullets
    } else if(wt==="chain_shot"){
        gs.damage    *= 0.92;                                // BALANCE: was 0.82, buffed for reliable chain build
    } else if(wt==="precision_rifle"){
        gs.damage    *= 2.20;                                // [BUFF] was 1.35 — sniper needs to punch hard, 1-shot satisfying
        gs.shootDelay = Math.max(160, gs.shootDelay / 1.1); // [BUFF] slightly faster fire than before
    } else if(wt==="reflection_rifle"){
        gs.damage    *= 1.2;
        gs.shootDelay = Math.max(140, gs.shootDelay / 1.2); // floor 140ms (was 130ms)
    }
}

// ═══════════════════════════════════════════════════════════════
// ★ EVENT MANAGER — Centralised, one-active-at-a-time system
//   Rules enforced here (not scattered across the codebase):
//   • Only ONE event active at any time
//   • 120 s minimum cooldown between events
//   • Events are BLOCKED during boss / miniboss fights
//   • Every event has a duration and auto-cleanup callback
//   • Stat changes use SEPARATE flags — gs.damage is NEVER mutated
//     permanently by an event (prevents exponential stacking)
// ═══════════════════════════════════════════════════════════════
const EventManager = {
    _activeEvent:   null,
    _lastEndTime:  -55000,
    COOLDOWN:       55000,  // base cooldown — shrinks over time (see canTrigger)
    _state: null,

    isBusy(gs){
        if(!gs) return true;
        return gs.bossActive || gs.miniBossActive || gs.pickingUpgrade || _upgradeLock > 0;
    },

    // Dynamic cooldown: starts at 55s, shrinks to 35s by minute 10
    _effectiveCooldown(gs){
        const min = gs ? (gs.t||0)/60000 : 0;
        return Math.max(35000, 55000 - min * 2000); // -2s per minute, floor 35s
    },

    canTrigger(gs){
        if(!gs || gs.gameOver || gs.level < 3) return false;
        if(this.isBusy(gs)) return false;
        if(this._activeEvent !== null) return false;
        return (gs.t || 0) - this._lastEndTime >= this._effectiveCooldown(gs);
    },

    startEvent(id, gs, duration, timerEv){
        this._activeEvent = id;
        // Duration also scales with time: events last 20% longer past minute 8
        const min = gs ? (gs.t||0)/60000 : 0;
        const durScale = min > 8 ? 1.0 + (min-8)*0.025 : 1.0; // +2.5%/min after min 8
        const scaledDuration = Math.min((duration||30000) * durScale, (duration||30000) * 1.5); // cap at +50%
        this._state = {
            id, duration: scaledDuration,
            startTime: gs ? (gs.t || 0) : 0,
            timerEv: timerEv || null, hudObjs: []
        };
    },

    endEvent(gs){
        if(this._state && this._state.timerEv){
            try{ this._state.timerEv.remove(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }
        if(this._state && this._state.hudObjs){
            this._state.hudObjs.forEach(o=>{ try{ o.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}});
        }
        this._activeEvent = null;
        this._lastEndTime = gs ? (gs.t || 0) : 0;
        this._state = null;
    },

    forceCleanup(gs){
        if(!this._activeEvent) return;
        if(gs){
            gs._goldRushActive=false;
            gs._glassCannon=false; gs._glassCannonPipelined=false;
            gs._survivalModeDebuff=false; gs._chaosSpeedDebuff=false;
            gs._blitzMode=false; gs._blitzXpPenalty=false;
            gs._xpFrenzyMode=false;
        }
        this.endEvent(gs);
    },

    getProgress(gs){
        if(!this._state || !gs) return 0;
        const elapsed = (gs.t || 0) - this._state.startTime;
        return Math.max(0, 1 - elapsed / this._state.duration);
    }
};

function renderEventHUD(S){
    if(!EventManager._activeEvent || !EventManager._state) return;
    const gs = GS; if(!gs) return;
    const progress = EventManager.getProgress(gs);
    if(progress <= 0) return;

    const W=360, BAR_Y=550, BAR_H=3;

    if(!S._evHudBar){
        S._evHudBar = S.add.graphics().setDepth(70);
        S._evHudBg  = S.add.graphics().setDepth(69);
        // Slide-in animasyonu: bar ekranin altindan yukari kayar
        S._evHudBar.y = 60;
        S._evHudBg.y  = 60;
        S._evHudBar.alpha = 0;
        S._evHudBg.alpha  = 0;
        // Phaser tween ile slide-in
        try{
            S.tweens.add({targets:[S._evHudBar, S._evHudBg],
                y: 0, alpha: 1, duration: 320, ease: "Back.easeOut"});
        }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    }

    // ── Dinamik renk gecisi ──
    let r, g, b;
    if(progress >= 0.6){
        const t = (progress - 0.6) / 0.4;
        r = 0xff; g = Math.round(0x77 + (0xcc - 0x77) * t); b = 0x00;
    } else if(progress >= 0.3){
        const t = (progress - 0.3) / 0.3;
        r = 0xff; g = Math.round(0x22 + (0x77 - 0x22) * t); b = 0x00;
    } else if(progress >= 0.1){
        const t = (progress - 0.1) / 0.2;
        r = Math.round(0xcc + (0xff - 0xcc) * t); g = Math.round(0x00 + (0x22 - 0x00) * t); b = 0x00;
    } else {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.018);
        r = Math.round(0xaa + 0x44 * pulse); g = 0x00; b = 0x00;
    }
    const dynCol = (r << 16) | (g << 8) | b;
    const barAlpha = progress < 0.1 ? 0.7 + 0.3 * Math.sin(Date.now() * 0.018) : 0.92;
    const fillW = Math.round(W * progress);

    S._evHudBg.clear();
    S._evHudBg.fillStyle(0x000000, 0.40);
    S._evHudBg.fillRoundedRect(6, BAR_Y, W-12, BAR_H, 1);

    S._evHudBar.clear();
    if(fillW > 3){
        const ew = Math.max(4, (fillW/W)*(W-12));
        S._evHudBar.fillStyle(dynCol, barAlpha);
        S._evHudBar.fillRoundedRect(6, BAR_Y, ew, BAR_H, 1);
        S._evHudBar.fillStyle(0xffffff, 0.35);
        S._evHudBar.fillRoundedRect(6, BAR_Y, ew, 1, 1);
        if(ew > 12){
            S._evHudBar.fillStyle(0xffffff, 0.80);
            S._evHudBar.fillRoundedRect(6+ew-5, BAR_Y, 4, BAR_H, 1);
        }
    }
}

function cleanupEventHUD(S){
    // Slide-out: bar asagi kayarak kaybolur, sonra yok edilir
    const _bar = S._evHudBar;
    const _bg  = S._evHudBg;
    S._evHudBar = null;
    S._evHudBg  = null;
    if(_bar || _bg){
        const targets = [_bar, _bg].filter(Boolean);
        try{
            S.tweens.add({targets, y:"+=50", alpha:0, duration:250, ease:"Quad.easeIn",
                onComplete:()=>{ targets.forEach(o=>{try{o.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}});}});
        }catch(e){
            targets.forEach(o=>{try{o.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}});
        }
    }
}

const RUN_EVENTS = [
    // 1. GOLD RUSH
    {
        id:"gold_rush",
        title:"GOLD RUSH", titleEN:"GOLD RUSH", titleRU:"ЗОЛОТОЙ ПОТОК",
        desc:"Instantly +150 gold + 40% gold gain (35s). Spawn unchanged.",
        descEN:"Instantly +150 gold + 40% more gold for 35s. No spawn penalty.",
        descRU:"Сразу +150 золота + 40% больше золота (35с).",
        icon:"💰", color:0xffcc00,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"Принять",
             fn:(S)=>{
                 const gs=GS; // [FIX] guard kaldirildi — triggerRunEvent startEvent'i zaten cagirdi
                 const origGold=gs.goldMult;
                 EventManager.startEvent("gold_rush",gs,35000,null);
                 // Aninda bonus
                 gs.gold+=150; PLAYER_GOLD+=150; secureSet("nt_gold",PLAYER_GOLD);
                 gs.goldMult=origGold+0.40;
                 gs._goldRushActive=true;
                 const timerEv=S.time.addEvent({delay:35000,callback:()=>{
                     if(!GS||GS.gameOver) return;
                     GS.goldMult=origGold; GS._goldRushActive=false;
                     EventManager.endEvent(GS);
                     showHitTxt(S,180,220,CURRENT_LANG==="tr"?"Altin Akini bitti.":"Gold Rush ended.","#888888",false);
                 }});
                 if(EventManager._state) EventManager._state.timerEv=timerEv;
                 showHitTxt(S,180,200,CURRENT_LANG==="tr"?"ALTIN AKINI! +150 Altin Aninda / +40% Altin (35sn)":"GOLD RUSH! +150 Gold Instantly / +40% Gold (35s)","#ffcc00",true);
             }},
            {label:"Reddet (+60⬡)",labelEN:"Decline (+60⬡)",labelRU:"\u041e\u0442\u043a\u0430\u0437 (+60⬡)",
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,CURRENT_LANG==="tr"?"+60G Reddetme Bonusu":"+60G Rejection Bonus","#ffcc44",false); }}
        ]
    },
    // 3. GLASS CANNON
    {
        id:"glass_cannon",
        title:"CAM TOP", titleEN:"GLASS CANNON", titleRU:"\u0421\u0422\u0415\u041a\u041b\u042f\u041d\u041d\u0410\u042f \u041f\u0423\u0428\u041a\u0410",
        desc:"+%15 hasar (40sn) \u2014 ama max can\u0131n 2 azal\u0131r.",
        descEN:"+15% damage (40s) \u2014 max HP drops by 2.",
        descRU:"+15% \u0443\u0440\u043e\u043d (40\u0441) \u2014 \u043c\u0430\u043a\u0441. HP -2.",
        icon:"\ud83d\udd2e", color:0x44aaff,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"\u041f\u0440\u0438\u043d\u044f\u0442\u044c",
             fn:(S)=>{
                 const gs=GS; EventManager.startEvent("glass_cannon",gs,40000,null);
                 gs._glassCannon=true; gs._glassCannonPipelined=true;
                 gs.maxHealth=Math.max(2,gs.maxHealth-2);
                 gs.health=Math.min(gs.health,gs.maxHealth);
                 if(gs) gs._statsDirty=true;
                 const timerEv=S.time.addEvent({delay:40000,callback:()=>{
                     if(!GS||GS.gameOver) return;
                     GS._glassCannon=false; GS._glassCannonPipelined=false;
                     GS.maxHealth+=2; GS.health=Math.min(GS.health,GS.maxHealth);
                     if(GS) GS._statsDirty=true; EventManager.endEvent(GS);
                     showHitTxt(S,180,220,CURRENT_LANG==="tr"?"🔮 Cam Top bitti.":"🔮 Glass Cannon ended.","#888888",false);
                 }});
                 if(EventManager._state) EventManager._state.timerEv=timerEv;
                 showHitTxt(S,180,200,CURRENT_LANG==="tr"?"🔮 CAM TOP! +15% HASAR / Max HP-2 (40sn)":"🔮 GLASS CANNON! +15% DMG / Max HP-2 (40s)","#ffaa22",true);
             }},
            {label:"Reddet (+60⬡)",labelEN:"Decline (+60⬡)",labelRU:"\u041e\u0442\u043a\u0430\u0437 (+60⬡)",
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,CURRENT_LANG==="tr"?"+60G Reddetme Bonusu":"+60G Rejection Bonus","#ffcc44",false); }}
        ]
    },
    // 4. CHAOS BURST
    {
        id:"chaos_burst",
        title:"KAOS PATLAMASI", titleEN:"CHAOS BURST", titleRU:"\u0425\u0410\u041e\u0422\u0418\u0427\u0415\u0421\u041a\u0418\u0419 \u0412\u0417\u0420\u042b\u0412",
        desc:"Her 6sn patlama (30sn) \u2014 ama hareket h\u0131z\u0131n -%10 azal\u0131r.",
        descEN:"AoE burst every 6s (30s) \u2014 movement speed -10%.",
        descRU:"\u0412\u0437\u0440\u044b\u0432 \u043a\u0430\u0436\u0434\u044b\u0435 6\u0441 (30\u0441) \u2014 \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u044c -10%.",
        icon:"\ud83d\udca5", color:0xff2244,
        choices:[
            {label:"Aktive Et",labelEN:"Activate",labelRU:"\u0410\u043a\u0442\u0438\u0432\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
             fn:(S)=>{
                 const gs=GS; EventManager.startEvent("chaos_burst",gs,30000,null);
                 gs._chaosSpeedDebuff=true;
                 if(gs) gs._statsDirty=true;
                 showHitTxt(S,180,200,CURRENT_LANG==="tr"?"💥 KAOS PATLAMASI! (30sn) — Hiz -%10":"💥 CHAOS BURST! (30s) — Speed -10%","#ff2244",true);
                 let burstCount=0;
                 const burstEv=S.time.addEvent({delay:6000,loop:true,callback:()=>{
                     if(!GS||GS.gameOver||!S.player){burstEv.remove();return;}
                     burstCount++;
                     if(burstCount>5){
                         burstEv.remove(); GS._chaosSpeedDebuff=false;
                         if(GS) GS._statsDirty=true; EventManager.endEvent(GS);
                         showHitTxt(S,180,220,CURRENT_LANG==="tr"?"💥 Kaos Patlamasi bitti.":"💥 Chaos Burst ended.","#888888",false);
                         return;
                     }
                     const bx=S.player.x,by=S.player.y;
                     const ring=S.add.graphics().setDepth(22);
                     ring.lineStyle(3,0xff4400,0.9); ring.strokeCircle(bx,by,8);
                     S.tweens.add({targets:ring,scaleX:5,scaleY:5,alpha:0,duration:400,
                         ease:"Quad.easeOut",onComplete:()=>{try{ring.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
                     const ae=S._activeEnemies||S.pyramids.getMatching("active",true);
                     ae.forEach(e=>{
                         if(!e||!e.active) return;
                         const dx=e.x-bx,dy=e.y-by;
                         if(dx*dx+dy*dy<80*80) applyDmg(S,e,GS.damage*0.60,false);
                     });
                     S.cameras.main.shake(50,0.005);
                 }});
                 if(EventManager._state) EventManager._state.timerEv=burstEv;
             }},
            {label:"Reddet (+60⬡)",labelEN:"Decline (+60⬡)",labelRU:"\u041e\u0442\u043a\u0430\u0437 (+60⬡)",
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,CURRENT_LANG==="tr"?"+60G Reddetme Bonusu":"+60G Rejection Bonus","#ffcc44",false); }}
        ]
    },
    // 5. SURVIVAL MODE
    {
        id:"survival_mode",
        title:"HAYATTA KALMA", titleEN:"SURVIVAL MODE", titleRU:"\u0420\u0415\u0416\u0418\u041c \u0412\u042b\u0416\u0418\u0412\u0410\u041d\u0418\u042f",
        desc:"Her 6sn +1 can (42sn) \u2014 hareket h\u0131z\u0131 -%15.",
        descEN:"+1 HP every 6s (42s) \u2014 movement speed -15%.",
        descRU:"+1 HP \u043a\u0430\u0436\u0434\u044b\u0435 6\u0441 (42\u0441) \u2014 \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u044c -15%.",
        icon:"\ud83d\udee1\ufe0f", color:0x44ff88,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"\u041f\u0440\u0438\u043d\u044f\u0442\u044c",
             fn:(S)=>{
                 const gs=GS; EventManager.startEvent("survival_mode",gs,42000,null);
                 gs._survivalModeDebuff=true;
                 if(gs) gs._statsDirty=true;
                 showHitTxt(S,180,200,CURRENT_LANG==="tr"?"🛡️ HAYATTA KALMA! (42sn) — Hiz -%15":"🛡️ SURVIVAL MODE! (42s) — Speed -15%","#44ff88",true);
                 let regenCount=0;
                 const regenEv=S.time.addEvent({delay:6000,loop:true,callback:()=>{
                     if(!GS||GS.gameOver){regenEv.remove();return;}
                     regenCount++;
                     if(regenCount>7){
                         regenEv.remove(); GS._survivalModeDebuff=false;
                         if(GS) GS._statsDirty=true; EventManager.endEvent(GS);
                         showHitTxt(S,180,220,CURRENT_LANG==="tr"?"🛡️ Hayatta Kalma bitti.":"🛡️ Survival Mode ended.","#888888",false);
                         return;
                     }
                     if(GS.health<GS.maxHealth){
                         GS.health=Math.min(GS.health+1,GS.maxHealth);
                         showHitTxt(S,180,280,"+1 \u2764\ufe0f","#44ff88",false);
                     }
                 }});
                 if(EventManager._state) EventManager._state.timerEv=regenEv;
             }},
            {label:"Reddet (+60⬡)",labelEN:"Decline (+60⬡)",labelRU:"\u041e\u0442\u043a\u0430\u0437 (+60⬡)",
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,CURRENT_LANG==="tr"?"+60G Reddetme Bonusu":"+60G Rejection Bonus","#ffcc44",false); }}
        ]
    },
    // 6. BLITZ MODE
    {
        id:"blitz_mode",
        title:"YILDIRIN HIZI", titleEN:"BLITZ MODE", titleRU:"\u0420\u0415\u0416\u0418\u041c \u041c\u041e\u041b\u041d\u0418\u0418",
        desc:"+%25 ate\u015f h\u0131z\u0131 (30sn) \u2014 XP kazan\u0131m\u0131 -%30.",
        descEN:"+25% attack speed (30s) \u2014 XP gain -30%.",
        descRU:"+25% \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u0430\u0442\u0430\u043a\u0438 (30\u0441) \u2014 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u0435 XP -30%.",
        icon:"\u26a1", color:0xffee44,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"\u041f\u0440\u0438\u043d\u044f\u0442\u044c",
             fn:(S)=>{
                 const gs=GS; EventManager.startEvent("blitz_mode",gs,30000,null);
                 gs._blitzMode=true; gs._blitzXpPenalty=true;
                 if(gs) gs._statsDirty=true;
                 const timerEv=S.time.addEvent({delay:30000,callback:()=>{
                     if(!GS||GS.gameOver) return;
                     GS._blitzMode=false; GS._blitzXpPenalty=false;
                     if(GS) GS._statsDirty=true; EventManager.endEvent(GS);
                     showHitTxt(S,180,220,"⚡ Blitz Mode ended.","#888888",false);
                 }});
                 if(EventManager._state) EventManager._state.timerEv=timerEv;
                 showHitTxt(S,180,200,CURRENT_LANG==="tr"?"⚡ YILDIRIN HIZI! +25% Ates / XP -%30 (30sn)":"⚡ LIGHTNING SPEED! +25% Fire Rate / XP -30% (30s)","#ffee44",true);
             }},
            {label:"Reddet (+60⬡)",labelEN:"Decline (+60⬡)",labelRU:"\u041e\u0442\u043a\u0430\u0437 (+60⬡)",
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,CURRENT_LANG==="tr"?"+60G Reddetme Bonusu":"+60G Rejection Bonus","#ffcc44",false); }}
        ]
    },
    // 7. XP FRENZY
    {
        id:"xp_frenzy",
        title:"XP \u00c7ILGINLI\u011eI", titleEN:"XP FRENZY", titleRU:"XP \u0411\u0415\u0417\u0423\u041c\u0418\u0415",
        desc:"+%40 XP kazan\u0131m\u0131 (25sn) \u2014 d\u00fc\u015fmanlar %20 daha h\u0131zl\u0131 \u00e7\u0131kar.",
        descEN:"+40% XP gain (25s) \u2014 enemies spawn 20% faster.",
        descRU:"+40% XP (25\u0441) \u2014 \u0432\u0440\u0430\u0433\u0438 +20% \u0447\u0430\u0449\u0435.",
        icon:"\ud83d\udcda", color:0x44ffcc,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"\u041f\u0440\u0438\u043d\u044f\u0442\u044c",
             fn:(S)=>{
                 const gs=GS; // [FIX] guard kaldirildi
                 const origSpawn=gs.spawnDelay;
                 EventManager.startEvent("xp_frenzy",gs,25000,null);
                 gs._xpFrenzyMode=true;
                 gs.spawnDelay=Math.max(800,Math.floor(gs.spawnDelay*0.80));
                 const timerEv=S.time.addEvent({delay:25000,callback:()=>{
                     if(!GS||GS.gameOver) return;
                     GS._xpFrenzyMode=false; GS.spawnDelay=origSpawn;
                     EventManager.endEvent(GS);
                     showHitTxt(S,180,220,CURRENT_LANG==="tr"?"📚 XP Cilginligi bitti.":"📚 XP Frenzy ended.","#888888",false);
                 }});
                 if(EventManager._state) EventManager._state.timerEv=timerEv;
                 showHitTxt(S,180,200,CURRENT_LANG==="tr"?"📚 XP CILGINLIGI! +40% XP / Hizli Spawn (25sn)":"📚 XP FRENZY! +40% XP / Fast Spawn (25s)","#44ffcc",true);
             }},
            {label:"Reddet (+60⬡)",labelEN:"Decline (+60⬡)",labelRU:"\u041e\u0442\u043a\u0430\u0437 (+60⬡)",
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,CURRENT_LANG==="tr"?"+60G Reddetme Bonusu":"+60G Rejection Bonus","#ffcc44",false); }}
        ]
    },
];

// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ★ YENI SISTEM 5 — MINI BOSS VERILERI
// ═══════════════════════════════════════════════════════════════
const MINI_BOSS_POOL = [
    {
        id:"jelly_titan",
        name:"Jelly Titan", nameEN:"Jelly Titan", nameRU:"Желейный Титан",
        hp:80, armor:2, scale:2.8, color:0xFF9922, tint:0xFF9922, // [NERF] 130→80 HP, 3→2 armor
        speed:0.28, reward:{chest:"legendary", xpMult:5}
        // Behavior: slow, wide, hard to dodge — blocks bullets with mass
    },
    {
        id:"bubble_king",
        name:"Bubble King", nameEN:"Bubble King", nameRU:"Пузырьковый Король",
        hp:60, armor:1, scale:2.2, color:0xFF88EE, tint:0xFF88EE, // [NERF] 95→60 HP, 2→1 armor
        speed:0.50, reward:{chest:"rare", xpMult:4}
        // Behavior: fast, zigzag, spawns mini bubbles
    },
    {
        id:"candy_overlord",
        name:"Candy Overlord", nameEN:"Candy Overlord", nameRU:"Конфетный Повелитель",
        hp:70, armor:2, scale:2.5, color:0xFFDD44, tint:0xFFDD44, // [NERF] 110→70 HP, 4→2 armor
        speed:0.32, reward:{chest:"legendary", xpMult:5}
        // Behavior: medium speed, pulsing glow, high armor
    },
    {
        id:"gummy_crusher",
        name:"Gummy Crusher", nameEN:"Gummy Crusher", nameRU:"Жевательный Давитель",
        hp:95, armor:1, scale:3.0, color:0xFF6644, tint:0xFF6644, // [NERF] 160→95 HP, 2→1 armor
        speed:0.24, reward:{chest:"legendary", xpMult:6}
        // Behavior: biggest/slowest, massive HP, screen-filling presence
    },
    {
        id:"sugar_phantom",
        name:"Sugar Phantom", nameEN:"Sugar Phantom", nameRU:"Сахарный Призрак",
        hp:55, armor:0, scale:1.9, color:0xFFEEFF, tint:0xFFCCFF, // [NERF] 92→55 HP, 1→0 armor
        speed:0.60, reward:{chest:"rare", xpMult:4}
        // Behavior: fast and semi-transparent, hard to track
    },
];

// ═══════════════════════════════════════════════════════════════
// ── TEXTURE BUILDER ───────────────────────────────────────────
function buildTextures(S){
    // [CRASH FIX] Texture'lar zaten olusturulduysa tum GPU islemlerini atla.
    // buildTextures her sahne create()'inde cagriliyor (SceneGame).
    // 70 adet synchronous generateTexture cagrisi ana thread'i 100-200ms blokluyor.
    // "tex_bullet" sentinel olarak kullanilir — varsa hepsi var demektir.
    if(S.textures.exists("tex_bullet")) return;

    const g=S.add.graphics();

   // ── MERMILER v11 — profesyonel, enerji topları + ışıltılı ──────────────
    // Her mermi: parlak çekirdek + yumuşak glow dış halkası + keskin trail

    // ── DEFAULT / RAPID — altın enerji küresi (10x22)
    // Dış glow halkası
    g.fillStyle(0xcc8800,0.18); g.fillCircle(5,4,5);
    g.fillStyle(0xffcc00,0.35); g.fillCircle(5,4,4);
    // Mermi govdesi — sicak sari gradient
    g.fillStyle(0x664400,1); g.fillRect(3,0,4,2);
    g.fillStyle(0xaa6600,1); g.fillRect(3,2,4,2);
    g.fillStyle(0xffaa00,1); g.fillRect(3,4,4,3);
    g.fillStyle(0xffcc22,1); g.fillRect(3,7,4,6);
    g.fillStyle(0xffee88,1); g.fillRect(4,7,2,5);     // ic parlama
    g.fillStyle(0xffffff,0.85); g.fillRect(4,8,1,3);  // beyaz cekirdek
    g.fillStyle(0xdd9900,1); g.fillRect(3,13,4,3);
    g.fillStyle(0x885500,0.9); g.fillRect(3,16,4,2);
    g.fillStyle(0x442200,0.5); g.fillRect(3,18,4,2);
    g.fillStyle(0x220e00,0.25); g.fillRect(3,20,4,2);
    // Sivri uc
    g.fillStyle(0xffffff,0.95); g.fillTriangle(4,0,6,0,5,3);
    g.generateTexture("tex_bullet",10,22); g.clear();

    // ── SPREAD — mor enerji küresi, parlak (10x22)
    g.fillStyle(0x6600aa,0.2); g.fillCircle(5,4,5);
    g.fillStyle(0xcc44ff,0.40); g.fillCircle(5,4,4);
    g.fillStyle(0x2a0044,1); g.fillRect(3,0,4,2);
    g.fillStyle(0x7700bb,1); g.fillRect(3,2,4,3);
    g.fillStyle(0xcc00ff,1); g.fillRect(3,5,4,8);
    g.fillStyle(0xff55ff,1); g.fillRect(4,5,2,6);
    g.fillStyle(0xffffff,0.9); g.fillRect(4,5,1,4);
    g.fillStyle(0xaa00dd,1); g.fillRect(3,13,4,3);
    g.fillStyle(0x550077,0.8); g.fillRect(3,16,4,2);
    g.fillStyle(0x220033,0.4); g.fillRect(3,18,4,2);
    g.fillStyle(0xffffff,0.9); g.fillTriangle(4,0,6,0,5,3);
    g.generateTexture("tex_bullet_spread",10,22); g.clear();

    // ── CHAIN — elektrik mavisi küre (10x22)
    g.fillStyle(0x0044aa,0.2); g.fillCircle(5,4,5);
    g.fillStyle(0x44aaff,0.40); g.fillCircle(5,4,4);
    g.fillStyle(0x001133,1); g.fillRect(3,0,4,2);
    g.fillStyle(0x003399,1); g.fillRect(3,2,4,3);
    g.fillStyle(0x2288ff,1); g.fillRect(3,5,4,8);
    g.fillStyle(0x66ccff,1); g.fillRect(4,5,2,6);
    g.fillStyle(0xffffff,0.9); g.fillRect(4,5,1,4);
    g.fillStyle(0x1166cc,1); g.fillRect(3,13,4,3);
    g.fillStyle(0x003388,0.8); g.fillRect(3,16,4,2);
    g.fillStyle(0x001155,0.4); g.fillRect(3,18,4,2);
    // Elektrik detay çizgiler
    g.fillStyle(0xaaddff,0.7); g.fillRect(3,6,1,2);
    g.fillStyle(0xaaddff,0.7); g.fillRect(6,8,1,3);
    g.fillStyle(0xffffff,0.9); g.fillTriangle(4,0,6,0,5,3);
    g.generateTexture("tex_bullet_chain",10,22); g.clear();

    // ── CANNON — ağır top mermisi (12x28) çelik gövde + ateş kuyruğu
    // Dış metal parıltısı
    g.fillStyle(0x88bbee,0.15); g.fillCircle(6,4,6);
    // Sivri koni uç
    g.fillStyle(0xeeffff,1); g.fillTriangle(3,0,9,0,6,4);
    g.fillStyle(0xffffff,0.9); g.fillTriangle(5,0,7,0,6,3);
    // Govde
    g.fillStyle(0x1a2a3a,1); g.fillRect(3,4,6,3);
    g.fillStyle(0x3a6080,1); g.fillRect(3,7,6,12);
    g.fillStyle(0x5599cc,1); g.fillRect(4,7,4,10);
    g.fillStyle(0x88bbee,0.8); g.fillRect(5,7,2,8);
    g.fillStyle(0xffffff,0.5); g.fillRect(5,8,1,5);
    // Alt bant
    g.fillStyle(0x0f1a28,1); g.fillRect(3,19,6,3);
    g.fillStyle(0x3388aa,0.5); g.fillRect(3,19,6,1);
    // Motor / itici
    g.fillStyle(0x1a2838,1); g.fillRect(3,22,6,2);
    // Ateş izi — parlak turuncu→kızıl→saydam
    g.fillStyle(0xffcc44,0.8); g.fillRect(4,24,4,1);
    g.fillStyle(0xff8800,0.6); g.fillRect(3,25,6,1);
    g.fillStyle(0xff4400,0.4); g.fillRect(3,26,6,1);
    g.fillStyle(0xff2200,0.2); g.fillRect(3,27,6,1);
    g.generateTexture("tex_bullet_cannon",12,28); g.clear();

    // ── PRECISION — lazer iğnesi (6x28), keskin, kırmızı–beyaz
    // Çekirdek
    g.fillStyle(0x1a0000,1); g.fillRect(2,0,2,2);
    g.fillStyle(0x550011,1); g.fillRect(2,2,2,3);
    g.fillStyle(0xff0033,1); g.fillRect(2,5,2,14);
    g.fillStyle(0xff5577,1); g.fillRect(2,7,2,9);
    g.fillStyle(0xff99aa,0.9); g.fillRect(3,8,1,7);
    g.fillStyle(0xffffff,1.0); g.fillRect(3,9,1,4);
    // İnce glow
    g.fillStyle(0xff0033,0.25); g.fillRect(1,5,4,14);
    g.fillStyle(0xff2244,0.40); g.fillRect(2,6,2,12);
    // Sivri uç
    g.fillStyle(0xffffff,1); g.fillTriangle(2,0,4,0,3,4);
    // Kuyruk sönümü
    g.fillStyle(0xcc0022,0.7); g.fillRect(2,19,2,3);
    g.fillStyle(0x880011,0.4); g.fillRect(2,22,2,3);
    g.fillStyle(0x440008,0.2); g.fillRect(2,25,2,3);
    g.generateTexture("tex_bullet_precision",6,28); g.clear();

    // ── REFLECT — teal/zümrüt, sekme efektli (10x22)
    g.fillStyle(0x006644,0.2); g.fillCircle(5,4,5);
    g.fillStyle(0x00ddaa,0.35); g.fillCircle(5,4,4);
    g.fillStyle(0x001a11,1); g.fillRect(3,0,4,2);
    g.fillStyle(0x004433,1); g.fillRect(3,2,4,3);
    g.fillStyle(0x00bb88,1); g.fillRect(3,5,4,8);
    g.fillStyle(0x00ffcc,1); g.fillRect(4,5,2,6);
    g.fillStyle(0xaaffee,0.9); g.fillRect(4,5,1,4);
    g.fillStyle(0xffffff,0.9); g.fillRect(4,6,1,2);
    g.fillStyle(0x009966,1); g.fillRect(3,13,4,3);
    g.fillStyle(0x003322,0.7); g.fillRect(3,16,4,3);
    g.fillStyle(0x001a11,0.4); g.fillRect(3,19,4,3);
    // Sekme kıvılcımı detayı
    g.fillStyle(0x44ffee,0.6); g.fillRect(3,8,1,2);
    g.fillStyle(0x44ffee,0.6); g.fillRect(6,10,1,2);
    g.fillStyle(0xffffff,0.95); g.fillTriangle(4,0,6,0,5,3);
    g.generateTexture("tex_bullet_reflect",10,22); g.clear();

    // ── ORBIT BLADE — elektrik/yildirim orb ──
    g.lineStyle(1,0x88aaff,0.9); g.strokeCircle(6,6,5);
    g.fillStyle(0xffffff,1); g.fillCircle(6,6,2);
    g.fillStyle(0xaaddff,1); g.fillCircle(6,6,3);
    g.fillStyle(0x4488ff,0.85); g.fillCircle(6,6,4);
    g.lineStyle(1,0xffffff,0.95);
    g.lineBetween(6,6,6,1); g.lineBetween(6,6,11,6);
    g.lineBetween(6,6,6,11); g.lineBetween(6,6,1,6);
    g.lineStyle(1,0xccddff,0.7);
    g.lineBetween(6,6,9,2); g.lineBetween(6,6,10,9);
    g.lineBetween(6,6,3,10); g.lineBetween(6,6,2,3);
    g.fillStyle(0xffffff,0.9); g.fillRect(5,0,2,1); g.fillRect(10,5,1,2); g.fillRect(5,11,2,1); g.fillRect(0,5,1,2);
    g.generateTexture("tex_blade",12,12); g.clear();

    // ── SAW — Detayli metalik testere texture v2 ──
    // Dis golge
    g.fillStyle(0x080808,1); g.fillCircle(10,10,10);
    // Dis halka katmanlari — daha puruzsuz gradient
    g.fillStyle(0x2a2a2a,1); g.fillCircle(10,10,9.5);
    g.fillStyle(0x484848,1); g.fillCircle(10,10,9);
    g.fillStyle(0x5e5e5e,1); g.fillCircle(10,10,8);
    g.fillStyle(0x707070,1); g.fillCircle(10,10,7);
    // 10 keskin dis — cift katmanli (golge + parlak)
    for(let i=0;i<10;i++){
        const a=Phaser.Math.DegToRad(i*36);
        const a2=Phaser.Math.DegToRad(i*36+14);
        // Dis golgesi
        g.fillStyle(0x999999,1);
        g.fillTriangle(10,10,
            10+Math.cos(a)*10, 10+Math.sin(a)*10,
            10+Math.cos(a2)*7, 10+Math.sin(a2)*7);
        // Dis parlak kenari
        g.fillStyle(0xdddddd,1);
        g.fillTriangle(10,10,
            10+Math.cos(a)*9.5, 10+Math.sin(a)*9.5,
            10+Math.cos(a2)*6.8, 10+Math.sin(a2)*6.8);
    }
    // Dis ucu highlight — isik yansimasi
    g.fillStyle(0xffffff,0.55);
    for(let i=0;i<10;i++){
        const a=Phaser.Math.DegToRad(i*36);
        g.fillRect(10+Math.cos(a)*9-0.5, 10+Math.sin(a)*9-0.5, 1.5, 1.5);
    }
    // Hub — celik merkez
    g.fillStyle(0x181818,1); g.fillCircle(10,10,5);
    g.fillStyle(0x333333,1); g.fillCircle(10,10,4);
    g.fillStyle(0x555555,1); g.fillCircle(10,10,3);
    g.fillStyle(0x777777,1); g.fillCircle(10,10,2.5);
    // Hub arti — vida izi
    g.fillStyle(0x999999,1); g.fillRect(8,9.5,4,1); g.fillRect(9.5,8,1,4);
    // Merkez civata
    g.fillStyle(0xbbbbbb,1); g.fillCircle(10,10,1);
    // Highlight — lens flare efekti
    g.fillStyle(0xffffff,0.7); g.fillCircle(7,7,1.2);
    g.fillStyle(0xffffff,0.3); g.fillCircle(8,8,0.7);
    g.generateTexture("tex_saw",20,20); g.clear();

    // ── DRONE — 28x28, detayli pixel sanat dron ──
    // Arka govde golgesi
    g.fillStyle(0x000000,0.55); g.fillEllipse(14,16,20,8);
    // Ana govde — koyu metalik gri merkez
    g.fillStyle(0x1a1a2e); g.fillRect(9,10,10,8);
    g.fillStyle(0x2d2d4a); g.fillRect(10,11,8,6);
    // Govde ust highlight
    g.fillStyle(0x4a4a7a); g.fillRect(10,11,8,2);
    g.fillStyle(0x6666aa); g.fillRect(11,11,6,1);
    // Yan kollar — sol ve sag (yatay)
    g.fillStyle(0x222233); g.fillRect(2,12,7,4);   // sol kol
    g.fillStyle(0x222233); g.fillRect(19,12,7,4);  // sag kol
    g.fillStyle(0x333355); g.fillRect(3,13,5,2);   // sol kol ic
    g.fillStyle(0x333355); g.fillRect(20,13,5,2);  // sag kol ic
    // Ust kollar — yukari ve asagi (dikey)
    g.fillStyle(0x222233); g.fillRect(12,2,4,7);   // ust kol
    g.fillStyle(0x222233); g.fillRect(12,19,4,7);  // alt kol
    g.fillStyle(0x333355); g.fillRect(13,3,2,5);   // ust ic
    g.fillStyle(0x333355); g.fillRect(13,20,2,5);  // alt ic
    // Rotor yuvalari — 4 kose (daire)
    g.fillStyle(0x0d0d1a); g.fillCircle(4,4,4);    // sol ust rotor yuvasi
    g.fillStyle(0x0d0d1a); g.fillCircle(24,4,4);   // sag ust
    g.fillStyle(0x0d0d1a); g.fillCircle(4,24,4);   // sol alt
    g.fillStyle(0x0d0d1a); g.fillCircle(24,24,4);  // sag alt
    // Rotor diskleri — donen bicaklari simule eden halkalar
    g.lineStyle(1.5,0x0099cc,0.9); g.strokeCircle(4,4,3);
    g.lineStyle(1.5,0x0099cc,0.9); g.strokeCircle(24,4,3);
    g.lineStyle(1.5,0x0099cc,0.9); g.strokeCircle(4,24,3);
    g.lineStyle(1.5,0x0099cc,0.9); g.strokeCircle(24,24,3);
    // Rotor bicaklari — capraz cizgiler
    g.lineStyle(1,0x00ccff,0.7); g.lineBetween(1,4,7,4); g.lineBetween(4,1,4,7);
    g.lineStyle(1,0x00ccff,0.7); g.lineBetween(21,4,27,4); g.lineBetween(24,1,24,7);
    g.lineStyle(1,0x00ccff,0.7); g.lineBetween(1,24,7,24); g.lineBetween(4,21,4,27);
    g.lineStyle(1,0x00ccff,0.7); g.lineBetween(21,24,27,24); g.lineBetween(24,21,24,27);
    // Rotor merkez noktalari
    g.fillStyle(0x00eeff); g.fillCircle(4,4,1); g.fillCircle(24,4,1);
    g.fillStyle(0x00eeff); g.fillCircle(4,24,1); g.fillCircle(24,24,1);
    // Merkez kamera / sensor
    g.fillStyle(0x0a0a1a); g.fillCircle(14,14,5);
    g.fillStyle(0x003366); g.fillCircle(14,14,4);
    g.fillStyle(0x0055aa); g.fillCircle(14,14,3);
    g.fillStyle(0x0088dd); g.fillCircle(14,14,2);
    g.fillStyle(0x00ccff,0.9); g.fillCircle(14,14,1);
    // Kamera lens parlamasi
    g.fillStyle(0xffffff,0.7); g.fillRect(13,13,1,1);
    // LED isiklari — kol uclari
    g.fillStyle(0x00ffcc); g.fillRect(1,13,2,2);   // sol LED
    g.fillStyle(0x00ffcc); g.fillRect(25,13,2,2);  // sag LED
    g.fillStyle(0xff4444); g.fillRect(13,1,2,2);   // ust LED kirmizi
    g.fillStyle(0xff4444); g.fillRect(13,25,2,2);  // alt LED kirmizi
    // Govde kenar cizgisi
    g.lineStyle(1,0x4466aa,0.6); g.strokeRect(9,10,10,8);
    g.generateTexture("tex_drone",28,28); g.clear();

    // ── METEOR — 24x24, piksel sanat, kare/dortgen tabanli ──
    // Dis karanlik kenar
    g.fillStyle(0x0a0200,1); g.fillRect(4,0,16,24); g.fillRect(0,4,24,16);
    g.fillRect(2,2,20,20);
    // Koyu kirmizi govde
    g.fillStyle(0x5a0e00,1); g.fillRect(4,2,16,20); g.fillRect(2,4,20,16);
    // Turuncu katman
    g.fillStyle(0xaa2200,1); g.fillRect(5,4,14,16); g.fillRect(4,5,16,14);
    // Parlak turuncu
    g.fillStyle(0xdd4400,1); g.fillRect(6,6,12,12);
    // Sari kor
    g.fillStyle(0xff7700,1); g.fillRect(7,7,10,10);
    // Merkez parlak
    g.fillStyle(0xff9900,1); g.fillRect(8,8,8,8);
    // Cekirdek
    g.fillStyle(0xffcc00,1); g.fillRect(9,9,6,6);
    // Beyaz merkez nokta
    g.fillStyle(0xffffff,1); g.fillRect(10,10,4,4);
    // Catlak cizgiler — piksel
    g.fillStyle(0x220800,0.8); g.fillRect(11,6,2,8); g.fillRect(7,11,8,2);
    g.fillStyle(0x220800,0.5); g.fillRect(14,9,2,5); g.fillRect(6,6,2,3);
    g.generateTexture("tex_meteor",24,24); g.clear();

    // ── XP KRISTALLERI — kucultulmus (9px), koyu renkler, beyaz parilti partikul ──
    [{k:"xp_blue",   c:[0x06184d,0x0a2a88,0x1144cc,0x2266ff,0xffffff],s:9},
     {k:"xp_green",  c:[0x003311,0x115522,0x227744,0x55cc77,0xffffff],s:9},
     {k:"xp_purple", c:[0x2a0055,0x660099,0x9922cc,0xcc55ee,0xffffff],s:9},
     {k:"xp_red",    c:[0x440000,0x881100,0xcc2200,0xff5533,0xffffff],s:9},
     {k:"xp_gold",   c:[0x332200,0x885500,0xcc8800,0xffcc33,0xffffff],s:10}
    ].forEach(({k,c,s})=>{
        const h=s, m=Math.floor(h/2);
        // Dis kontur — koyu
        g.fillStyle(c[0],1);
        g.fillTriangle(m,0, h,Math.floor(h*0.38), m,h);
        g.fillTriangle(m,0, 0,Math.floor(h*0.38), m,h);
        // Orta ton
        g.fillStyle(c[1],1);
        g.fillTriangle(m,1, h-1,Math.floor(h*0.40), m,h-1);
        g.fillTriangle(m,1, 1,Math.floor(h*0.40), m,h-1);
        // Ana parlak
        g.fillStyle(c[2],1);
        g.fillTriangle(m,2, h-2,Math.floor(h*0.42), m,h-2);
        g.fillTriangle(m,2, 2,Math.floor(h*0.42), m,h-2);
        // Ic isik
        g.fillStyle(c[3],0.85);
        g.fillTriangle(m,2, m+2,Math.floor(h*0.34), m-1,Math.floor(h*0.34));
        // Beyaz ust highlight — belirgin parilti
        g.fillStyle(c[4],1.0);
        g.fillRect(m-1,0,2,1);
        g.fillRect(m,1,1,1);
        g.generateTexture(k,h,h); g.clear();
    });

    // ── ALTIN PARA ──
    g.fillStyle(0x332200);g.fillCircle(7,7,7);g.fillStyle(0x885500);g.fillCircle(7,7,6);
    g.fillStyle(0xcc8800);g.fillCircle(7,7,5);g.fillStyle(0xffaa00);g.fillCircle(7,7,4);
    g.fillStyle(0xffdd44);g.fillCircle(6,6,2);g.fillStyle(0xffffff,0.7);g.fillRect(5,4,2,2);
    g.generateTexture("xp_coin",14,14); g.clear();

    // ── SANDIKLAR — 32x32, kaliteli, nadirlik basina ozgun ──
    const drawChest=(cfg)=>{
        const {mainC,trim,lockC,glow,sz,hasRunes,hasGems,hasCracks}=cfg;
        const hw=sz/2;
        // ── Zemin golgesi (yumusak elips) ──
        g.fillStyle(0x000000,0.35); g.fillEllipse(hw,sz-1,sz*0.9,sz*0.13);

        // ── ANA GOVDE (alt kutu) ──
        // Dis golge/kontur
        g.fillStyle(0x000000,0.55); g.fillRoundedRect(3,sz*0.46+1,sz-6,sz*0.49,3);
        // Arka yuz (en koyu)
        g.fillStyle(mainC[0],1); g.fillRoundedRect(2,sz*0.46,sz-4,sz*0.48,3);
        // Orta ton (hacim)
        g.fillStyle(mainC[1],1); g.fillRoundedRect(3,sz*0.46,sz-7,sz*0.44,2);
        // On yuz (en aydinlik)
        g.fillStyle(mainC[2],1); g.fillRoundedRect(4,sz*0.48,sz-9,sz*0.38,2);
        // Ic highlight (isik yansimasi ustte)
        g.fillStyle(0xffffff,0.10); g.fillRoundedRect(5,sz*0.48,sz-11,sz*0.10,2);

        // ── YATAY BANTLAR (metal cerceve) ──
        // Orta bant (sandik ortasindaki ana bant)
        g.fillStyle(mainC[0],1);    g.fillRect(2,sz*0.545,sz-4,sz*0.085);
        g.fillStyle(trim,0.92);     g.fillRect(2,sz*0.547,sz-4,sz*0.07);
        g.fillStyle(glow,0.35);     g.fillRect(3,sz*0.549,sz-6,sz*0.022);
        g.fillStyle(0x000000,0.28); g.fillRect(2,sz*0.610,sz-4,sz*0.012);
        // Alt bant
        g.fillStyle(trim,0.75);     g.fillRect(2,sz*0.875,sz-4,sz*0.065);
        g.fillStyle(glow,0.25);     g.fillRect(3,sz*0.877,sz-6,sz*0.020);

        // ── DIKEY KOSE PERVAZLARI ──
        // Sol pervaz
        g.fillStyle(mainC[0],1);    g.fillRect(2,sz*0.46,5,sz*0.49);
        g.fillStyle(trim,0.90);     g.fillRect(2,sz*0.46,4,sz*0.49);
        g.fillStyle(glow,0.45);     g.fillRect(3,sz*0.47,1,sz*0.47);
        // Sag pervaz
        g.fillStyle(mainC[0],1);    g.fillRect(sz-7,sz*0.46,5,sz*0.49);
        g.fillStyle(trim,0.90);     g.fillRect(sz-6,sz*0.46,4,sz*0.49);
        g.fillStyle(glow,0.45);     g.fillRect(sz-4,sz*0.47,1,sz*0.47);

        // ── UST KAPAK ──
        // Kapak kontur/golge
        g.fillStyle(0x000000,0.45); g.fillRoundedRect(2,sz*0.27+1,sz-4,sz*0.22,{tl:4,tr:4,bl:0,br:0});
        // Kapak arka ton
        g.fillStyle(mainC[0],1);    g.fillRoundedRect(2,sz*0.27,sz-4,sz*0.21,{tl:4,tr:4,bl:0,br:0});
        // Kapak orta ton
        g.fillStyle(mainC[1],1);    g.fillRoundedRect(3,sz*0.27,sz-7,sz*0.17,{tl:3,tr:3,bl:0,br:0});
        // Kapak on aydinlik
        g.fillStyle(mainC[2],1);    g.fillRoundedRect(4,sz*0.29,sz-9,sz*0.13,{tl:2,tr:2,bl:0,br:0});
        // Kapak ust highlight (bombeli isik)
        g.fillStyle(0xffffff,0.18); g.fillRoundedRect(5,sz*0.30,sz-11,sz*0.055,{tl:2,tr:2,bl:0,br:0});
        // Kapak alt kenar trim seridi
        g.fillStyle(trim,0.88);     g.fillRect(2,sz*0.455,sz-4,sz*0.038);
        g.fillStyle(glow,0.38);     g.fillRect(3,sz*0.458,sz-6,sz*0.014);

        // ── KILIT MEKANIZMASI ──
        // Kilit plakasi (dikdortgen panel)
        g.fillStyle(mainC[0],1);    g.fillRoundedRect(hw-6,sz*0.335,12,sz*0.21,3);
        g.fillStyle(trim,0.92);     g.fillRoundedRect(hw-5,sz*0.342,10,sz*0.185,2);
        // Kilit plakasi parlamasi
        g.fillStyle(glow,0.30);     g.fillRoundedRect(hw-4,sz*0.348,5,sz*0.05,1);
        // Kilit govdesi (U bicimi — ust yay + dikdortgen kutu)
        g.fillStyle(lockC,1);       g.fillCircle(hw,sz*0.365,3.2);
        g.fillStyle(mainC[0],0.95); g.fillCircle(hw,sz*0.365,1.6);
        g.fillStyle(lockC,1);       g.fillRoundedRect(hw-3.5,sz*0.375,7,sz*0.11,2);
        // Kilit deligi
        g.fillStyle(mainC[0],0.90); g.fillCircle(hw,sz*0.405,2.0);
        g.fillStyle(0x000000,0.55); g.fillRect(hw-0.8,sz*0.41,1.6,sz*0.055);
        // Kilit parlamasi
        g.fillStyle(glow,0.80);     g.fillCircle(hw-1,sz*0.355,1.0);

        // ── RUN SEMBOLLERI (nadir sandiklar) ──
        if(hasRunes){
            // Sol run
            g.fillStyle(glow,0.55);
            g.fillRect(5,sz*0.64,3,sz*0.13); g.fillRect(4,sz*0.66,5,sz*0.028);
            g.fillRect(4,sz*0.74,5,sz*0.028);
            g.fillStyle(glow,0.30); g.fillRect(6,sz*0.675,1,sz*0.055);
            // Sag run
            g.fillStyle(glow,0.55);
            g.fillRect(sz-8,sz*0.64,3,sz*0.13); g.fillRect(sz-9,sz*0.66,5,sz*0.028);
            g.fillRect(sz-9,sz*0.74,5,sz*0.028);
            g.fillStyle(glow,0.30); g.fillRect(sz-7,sz*0.675,1,sz*0.055);
        }

        // ── MUCEVHER KAKMALARI (efsane sandik) ──
        if(hasGems){
            const gemCols=[0xff4444,0x44aaff,0xffdd44];
            [5,hw,sz-7].forEach((gx,gi)=>{
                // Mucevher dis hale
                g.fillStyle(gemCols[gi],0.35); g.fillCircle(gx,sz*0.515,3.5);
                // Mucevher govdesi
                g.fillStyle(gemCols[gi],1);    g.fillCircle(gx,sz*0.515,2.5);
                // Mucevher parlamasi
                g.fillStyle(0xffffff,0.65);    g.fillCircle(gx-0.8,sz*0.505,0.9);
            });
        }

        // ── CATLAKLAR (yipranmis common sandik) ──
        if(hasCracks){
            g.lineStyle(1,0x000000,0.32);
            g.lineBetween(7,sz*0.50,12,sz*0.68);
            g.lineBetween(10,sz*0.54,8,sz*0.62);
            g.lineBetween(sz-9,sz*0.52,sz-15,sz*0.72);
        }

        // ── GENEL DIS KONTUR ──
        g.lineStyle(1,0x000000,0.45);
        g.strokeRoundedRect(2,sz*0.27,sz-4,sz*0.68,{tl:4,tr:4,bl:3,br:3});
    };

    // COMMON — altin/kahve, basit
    drawChest({mainC:[0x3a1e08,0x6b3c14,0x8c5520],trim:0x9e6a00,lockC:0xffcc00,glow:0xffee88,sz:32,hasRunes:false,hasGems:false,hasCracks:true});
    g.generateTexture("tex_chest_common",32,32); g.clear();

    // RARE — koyu mavi, runlu
    drawChest({mainC:[0x0a1a3a,0x1e3f6e,0x2a5a9a],trim:0x2244cc,lockC:0x4488ff,glow:0x88ccff,sz:32,hasRunes:true,hasGems:false,hasCracks:false});
    // Mavi enerji hatlari
    g.fillStyle(0x4488ff,0.2); g.fillRect(3,13,26,3);
    g.generateTexture("tex_chest_rare",32,32); g.clear();

    // LEGENDARY — kirmizi-altin, mucevherli, parlak
    drawChest({mainC:[0x2a0a00,0x5c2200,0x8a3a00],trim:0xcc6600,lockC:0xffcc00,glow:0xffeeaa,sz:32,hasRunes:true,hasGems:true,hasCracks:false});
    // Altin kenarlik
    g.lineStyle(2,0xffaa00,0.7); g.strokeRect(1,1,30,30);
    g.lineStyle(1,0xffeeaa,0.35); g.strokeRect(3,3,26,26);
    g.generateTexture("tex_chest_legendary",32,32); g.clear();

    // ── KALP (HEALTH PICKUP) — 16x16, yuksek kontrast, net pixel art ──
    // Dis koyu outline — okunabilirlik icin
    g.fillStyle(0x330000,1); g.fillRect(0,3,16,10);
    g.fillStyle(0x330000,1); g.fillRect(2,1,12,2);
    g.fillStyle(0x330000,1); g.fillRect(1,2,14,1);
    // Siyah alt cikinti (kalp sekli)
    g.fillStyle(0x000000,1); g.fillRect(6,13,4,2);
    g.fillStyle(0x000000,1); g.fillRect(7,15,2,1);
    // Ana kirmizi dolgu
    g.fillStyle(0xee1133,1); g.fillRect(1,3,14,9);
    g.fillStyle(0xee1133,1); g.fillRect(3,2,10,1);
    g.fillStyle(0xee1133,1); g.fillRect(2,2,12,1);
    g.fillStyle(0xee1133,1); g.fillRect(2,3,12,1);
    // Alt sivri uc
    g.fillStyle(0xdd0022,1); g.fillRect(2,11,12,1);
    g.fillStyle(0xcc0011,1); g.fillRect(3,12,10,1);
    g.fillStyle(0xbb0000,1); g.fillRect(5,13,6,1);
    g.fillStyle(0xaa0000,1); g.fillRect(6,14,4,1);
    g.fillStyle(0x880000,1); g.fillRect(7,15,2,1);
    // Ic parlak highlight — sol ust
    g.fillStyle(0xff6688,1); g.fillRect(2,3,5,3);
    g.fillStyle(0xff99aa,1); g.fillRect(2,3,3,2);
    g.fillStyle(0xffffff,0.9); g.fillRect(2,3,2,1);
    // Sag parlak
    g.fillStyle(0xff6688,0.8); g.fillRect(9,3,5,3);
    // Orta cizgi — iki lob arasi cukur
    g.fillStyle(0xcc0022,0.7); g.fillRect(7,3,2,4);
    g.generateTexture("tex_heart",16,16); g.clear();

    // ── ALTIN IKONU — sadece ic kare cerceve (dis sari alan kaldirildi)
    if(!S.textures.exists("tex_gold_icon")){
        const _gc=document.createElement("canvas");
        _gc.width=20; _gc.height=20;
        const _gctx=_gc.getContext("2d");
        // Seffaf arka plan — kose noktalari yok
        // Dis kare dolgu — arka planla uyumlu (siyah/transparan)
        _gctx.clearRect(0,0,20,20);
        // Dis kare cerceve — altin
        _gctx.strokeStyle="#CC8800";
        _gctx.lineWidth=2.5;
        _gctx.strokeRect(3,3,14,14);
        // Ic kare cerceve — daha parlak altin
        _gctx.strokeStyle="#FFD700";
        _gctx.lineWidth=1.5;
        _gctx.strokeRect(6,6,8,8);
        // Kose noktalari KALDIRILDI — minik sari kose artifact'lari engellendi
        S.textures.addCanvas("tex_gold_icon",_gc);
    }


    // Efekt partikulleri
    g.fillStyle(0x003300);g.fillCircle(3,3,3);g.fillStyle(0x00aa44);g.fillCircle(3,3,2);g.fillStyle(0x66ff88);g.fillCircle(2,2,1);g.generateTexture("tex_poison_p",6,6);g.clear();
    g.fillStyle(0xaa2200);g.fillTriangle(4,8,8,0,0,0);g.fillStyle(0xff6600);g.fillTriangle(4,7,7,1,1,1);g.fillStyle(0xffcc00);g.fillTriangle(4,6,6,2,2,2);g.generateTexture("tex_flame_p",8,8);g.clear();
    g.fillStyle(0x4488ff);g.fillRect(0,0,8,8);g.fillStyle(0x88ccff);g.fillRect(1,1,6,6);g.fillStyle(0xffffff);g.fillRect(2,2,4,4);g.generateTexture("tex_lightning_p",8,8);g.clear();

    buildUpgradeIcons(g);
    g.destroy();
}

function buildUpgradeIcons(g){
    // HD Cartoonish ikonlar — 32x32
    // Bold outline, canli renkler, glow hissi, mobile game kalitesi
    const sz=32;

    // Yardimci fonksiyonlar
    const bg=(col,col2)=>{
        // Gradient hissi icin iki katman arka plan
        g.fillStyle(col,1); g.fillRect(0,0,sz,sz);
        if(col2){ g.fillStyle(col2,0.35); g.fillRect(0,sz/2,sz,sz/2); }
    };
    const brd=(col,w=2,a=1)=>{ g.lineStyle(w,col,a); g.strokeRoundedRect(1,1,sz-2,sz-2,4); };
    const glow=(col,cx,cy,r,a=0.3)=>{ g.fillStyle(col,a); g.fillCircle(cx,cy,r); };

    const defs={

        // ── DAMAGE — Kilic: Notpixel logo entegreli guc sembolu ──
        icon_damage:()=>{
            bg(0x1a0510, 0x3d0a1a);
            brd(0xff3355,2.5);
            // Glow aura
            glow(0xff2244,16,16,14,0.18);
            // Notpixel logo (ucgen outline) — buyuk, kilici cevreleyen
            g.lineStyle(3,0xff3355,0.7);
            g.strokeTriangle(16,2, 3,28, 29,28);
            g.lineStyle(2,0xff8899,0.4);
            g.strokeTriangle(16,6, 6,27, 26,27);
            // Kilic — ucgenin icinde
            g.fillStyle(0xd4d4cc,1); g.fillRect(15,8,2,14);
            g.fillStyle(0xffffff,1); g.fillRect(15,8,1,10);
            // Kilic ucu
            g.fillStyle(0xeeeedd,1); g.fillTriangle(14,8,18,8,16,4);
            g.fillStyle(0xffffff,0.8); g.fillTriangle(15,8,17,8,16,5);
            // Guard — altin
            g.fillStyle(0xffcc22,1); g.fillRect(10,20,12,3);
            g.fillStyle(0xffee66,0.8); g.fillRect(10,20,12,1);
            // Kabza
            g.fillStyle(0x8b4513,1); g.fillRect(14,22,4,7);
            g.fillStyle(0xaa5522,0.8); g.fillRect(15,23,2,5);
        },

        // ── ATTACK — Hiz: Enerji kuresi + hiz cizgileri ──
        icon_attack:()=>{
            bg(0x001830, 0x003060);
            brd(0x22aaff,2.5);
            glow(0x0088ff,16,16,13,0.2);
            // Hiz cizgileri sol
            g.fillStyle(0x4499ff,0.7); g.fillRect(2,12,8,2);
            g.fillStyle(0x66bbff,0.5); g.fillRect(1,16,6,2);
            g.fillStyle(0x4499ff,0.4); g.fillRect(3,9,5,2);
            g.fillStyle(0x4499ff,0.4); g.fillRect(3,20,5,2);
            // Enerji kuresi
            g.fillStyle(0x0044aa,1); g.fillCircle(20,16,10);
            g.fillStyle(0x0066dd,1); g.fillCircle(20,16,8);
            g.fillStyle(0x1199ff,1); g.fillCircle(20,16,6);
            g.fillStyle(0x44ccff,1); g.fillCircle(20,16,4);
            g.fillStyle(0xaaeeff,1); g.fillCircle(19,15,2);
            g.fillStyle(0xffffff,0.9); g.fillCircle(18,14,1);
            // Enerji halkalari
            g.lineStyle(1.5,0x44aaff,0.8); g.strokeCircle(20,16,10);
            g.lineStyle(1,0x66ccff,0.5); g.strokeCircle(20,16,13);
        },

        // ── SIZE — Buyuk Mermi: Notcoin (hollow square) + mermi ──
        icon_size:()=>{
            bg(0x1a1200, 0x332200);
            brd(0xffaa00,2.5);
            glow(0xffaa00,16,16,13,0.2);
            // Notcoin logo — hollow square, mermiyi cevreliyor
            g.fillStyle(0xffcc00,1); g.fillRect(5,5,22,22);
            g.fillStyle(0x1a1200,1); g.fillRect(9,9,14,14); // ic bosluk
            g.fillStyle(0xffcc00,0.3); g.fillRect(9,9,14,14); // hafif ic dolgu
            // Mermi govdesi — kare icinde
            g.fillStyle(0xccccaa,1); g.fillRect(13,9,6,17);
            g.fillStyle(0xeeeecc,1); g.fillRect(14,9,4,15);
            g.fillStyle(0xffffff,0.7); g.fillRect(14,9,2,11);
            // Mermi ucu
            g.fillStyle(0xff8800,1); g.fillTriangle(12,9,20,9,16,5);
            g.fillStyle(0xffcc44,0.8); g.fillTriangle(14,9,18,9,16,6);
            // Bant
            g.fillStyle(0xff6600,0.9); g.fillRect(13,20,6,2);
        },

        // ── MULTI — Split Mermi: Mor fan patlamasi ──
        icon_multi:()=>{
            bg(0x120020, 0x200035);
            brd(0xcc44ff,2.5);
            glow(0xaa22ff,16,26,12,0.25);
            // Merkez ates noktasi
            g.fillStyle(0x6600aa,1); g.fillCircle(16,26,5);
            g.fillStyle(0xaa33ff,1); g.fillCircle(16,26,3);
            g.fillStyle(0xcc88ff,1); g.fillCircle(16,26,2);
            g.fillStyle(0xffffff,0.9); g.fillCircle(16,26,1);
            // Sol mermi
            g.fillStyle(0x8822cc,1); g.fillRect(7,5,3,18);
            g.fillStyle(0xaa44ee,1); g.fillRect(8,5,2,16);
            g.fillStyle(0xdd88ff,0.8); g.fillRect(8,5,1,12);
            g.fillStyle(0xcc44ff,1); g.fillTriangle(6,5,11,5,8,1);
            // Orta mermi
            g.fillStyle(0x9933dd,1); g.fillRect(14,3,4,20);
            g.fillStyle(0xcc55ff,1); g.fillRect(15,3,2,18);
            g.fillStyle(0xffffff,0.8); g.fillRect(15,3,1,14);
            g.fillStyle(0xdd66ff,1); g.fillTriangle(13,3,19,3,16,0);
            // Sag mermi
            g.fillStyle(0x8822cc,1); g.fillRect(22,5,3,18);
            g.fillStyle(0xaa44ee,1); g.fillRect(22,5,2,16);
            g.fillStyle(0xdd88ff,0.8); g.fillRect(23,5,1,12);
            g.fillStyle(0xcc44ff,1); g.fillTriangle(21,5,26,5,24,1);
        },

        // ── SPEED — Hiz: Yesil simsek/neon ──
        icon_speed:()=>{
            bg(0x001508, 0x002510);
            brd(0x22ff77,2.5);
            glow(0x00ff66,14,16,12,0.22);
            // Glow zemin
            g.fillStyle(0x00ff66,0.12); g.fillTriangle(20,1,7,17,17,17);
            g.fillStyle(0x00ff66,0.12); g.fillTriangle(17,15,9,31,15,31);
            // Simsek dis kontur (koyu)
            g.fillStyle(0x006622,1); g.fillTriangle(21,1,7,18,18,18); g.fillTriangle(18,15,8,32,16,32);
            // Simsek ana
            g.fillStyle(0x00cc44,1); g.fillTriangle(20,2,8,17,17,17); g.fillTriangle(17,16,9,31,15,31);
            // Simsek parlak
            g.fillStyle(0x44ff88,1); g.fillTriangle(19,3,9,16,16,16); g.fillTriangle(16,17,10,30,14,30);
            // Simsek cekirdek
            g.fillStyle(0xaaffcc,1); g.fillRect(14,5,3,9); g.fillRect(11,19,3,9);
            g.fillStyle(0xffffff,0.9); g.fillRect(15,6,1,7); g.fillRect(12,20,1,7);
            // Enerji parcaciklari
            g.fillStyle(0x66ffaa,0.9); g.fillCircle(26,7,2); g.fillCircle(5,25,2);
            g.fillStyle(0xffffff,0.8); g.fillCircle(27,7,1); g.fillCircle(6,25,1);
        },

        // ── PIERCE — Delici: Mavi enerji ignesi, 4 delik ──
        icon_pierce:()=>{
            bg(0x000820, 0x001040);
            brd(0x8888ff,2.5);
            glow(0x4444ff,16,16,13,0.2);
            // Delinmis parcalar — 4 koyu blok
            for(let i=0;i<4;i++){
                g.fillStyle(0x2233aa,1); g.fillRect(4+i*6,10,5,12);
                g.fillStyle(0x3344bb,1); g.fillRect(5+i*6,11,3,10);
                // Delik
                g.fillStyle(0x000820,1); g.fillRect(6+i*6,13,2,6);
            }
            // Enerji ignesi — parlak, ucan
            g.fillStyle(0x001166,1); g.fillRect(2,14,28,4);
            g.fillStyle(0x2255cc,1); g.fillRect(2,14,28,3);
            g.fillStyle(0x5588ff,1); g.fillRect(2,14,28,2);
            g.fillStyle(0x99bbff,1); g.fillRect(2,15,28,1);
            // Sivri uc — parlak
            g.fillStyle(0xffffff,1); g.fillTriangle(28,13,28,19,32,16);
            g.fillStyle(0xbbccff,0.9); g.fillTriangle(29,14,29,18,31,16);
            // Enerji izi
            g.fillStyle(0x4466ff,0.6); g.fillRect(0,13,4,6);
            g.fillStyle(0x2244cc,0.4); g.fillRect(0,12,3,8);
        },

        // ── CRIT — Kritik: Nisangah + enerji kristali ──
        icon_crit:()=>{
            bg(0x180010, 0x300020);
            brd(0xff3388,2.5);
            glow(0xff2266,16,16,13,0.22);
            // Dis nisangah halkalari
            g.lineStyle(2,0x880044,1); g.strokeCircle(16,16,14);
            g.lineStyle(2,0xff2266,0.9); g.strokeCircle(16,16,11);
            g.lineStyle(1.5,0xff66aa,0.6); g.strokeCircle(16,16,8);
            // Capraz cizgiler
            g.fillStyle(0xff2266,0.9); g.fillRect(1,15,5,2); g.fillRect(26,15,5,2);
            g.fillStyle(0xff2266,0.9); g.fillRect(15,1,2,5); g.fillRect(15,26,2,5);
            // Merkez kristal
            g.fillStyle(0x880022,1); g.fillCircle(16,16,6);
            g.fillStyle(0xcc1144,1); g.fillCircle(16,16,5);
            g.fillStyle(0xff2255,1); g.fillCircle(16,16,4);
            g.fillStyle(0xff6688,1); g.fillCircle(16,16,2);
            g.fillStyle(0xffaabb,1); g.fillCircle(15,15,1);
            g.fillStyle(0xffffff,0.9); g.fillCircle(15,15,1);
            // Kose kivilcimlar
            g.fillStyle(0xffcc44,0.9); g.fillCircle(23,9,2); g.fillCircle(9,23,2);
            g.fillStyle(0xffffff,0.8); g.fillCircle(23,9,1); g.fillCircle(9,23,1);
        },

        // ── KB — Knockback: Turuncu dalga patlamasi ──
        icon_kb:()=>{
            bg(0x1a0800, 0x2d1000);
            brd(0xff6622,2.5);
            glow(0xff6600,22,16,11,0.25);
            // Etki merkezi — patlayan enerji topu
            g.fillStyle(0xaa3300,1); g.fillCircle(8,16,7);
            g.fillStyle(0xdd5500,1); g.fillCircle(8,16,5);
            g.fillStyle(0xff8800,1); g.fillCircle(8,16,4);
            g.fillStyle(0xffcc44,1); g.fillCircle(8,16,2);
            g.fillStyle(0xffffff,0.9); g.fillCircle(8,16,1);
            // Sok dalgalari
            g.lineStyle(3,0xdd4400,0.8); g.strokeCircle(8,16,9);
            g.lineStyle(2.5,0xff6600,0.6); g.strokeCircle(8,16,12);
            g.lineStyle(2,0xff8822,0.4); g.strokeCircle(8,16,15);
            g.lineStyle(1.5,0xffaa44,0.25); g.strokeCircle(8,16,18);
            // Firlayan nesne
            g.fillStyle(0x663300,1); g.fillCircle(26,10,4);
            g.fillStyle(0x884400,1); g.fillCircle(26,10,3);
            g.fillStyle(0xcc6600,1); g.fillCircle(26,10,2);
            // Hareket izi
            g.fillStyle(0xff6600,0.5); g.fillRect(17,9,7,2);
            g.fillStyle(0xff8800,0.35); g.fillRect(15,8,10,2);
        },

        // ── FREEZE — Buz: Buz kristali + kar tanesi ──
        icon_freeze:()=>{
            bg(0x001020, 0x002040);
            brd(0x55ddff,2.5);
            glow(0x22ccff,16,16,13,0.22);
            // Dis buz halkasi
            g.lineStyle(2,0x1166aa,0.9); g.strokeCircle(16,16,14);
            g.lineStyle(1.5,0x44aadd,0.6); g.strokeCircle(16,16,11);
            // Kar tanesi ana eksenleri
            g.fillStyle(0x1188cc,1); g.fillRect(14,2,4,28); g.fillRect(2,14,28,4);
            // Kar tanesi capraz eksenleri
            const arms=[[0.785],[2.356],[3.927],[5.497]];
            arms.forEach(([a])=>{
                const dx=Math.cos(a)*10, dy=Math.sin(a)*10;
                g.fillStyle(0x2299cc,0.7);
                g.fillRect(16+dx-1,16+dy-1,3,3);
                g.fillRect(16-dx-1,16-dy-1,3,3);
            });
            // Parlak merkez kristal
            g.fillStyle(0x55ddff,1); g.fillRect(15,2,2,28); g.fillRect(2,15,28,2);
            g.fillStyle(0x88eeff,1); g.fillCircle(16,16,5);
            g.fillStyle(0xaaffff,1); g.fillCircle(16,16,3);
            g.fillStyle(0xffffff,1); g.fillCircle(16,16,2);
            g.fillStyle(0xffffff,0.9); g.fillCircle(15,15,1);
        },

        // ── XP — Akademisyen: Notpixel logo + enerji kitabi ──
        icon_xp:()=>{
            bg(0x001a15, 0x002d22);
            brd(0x44ffcc,2.5);
            glow(0x00ddaa,16,16,13,0.2);
            // Notpixel logo — ucgen outline, enerji kaynagi gibi
            g.lineStyle(2.5,0x00ddaa,0.9);
            g.strokeTriangle(16,3, 4,26, 28,26);
            g.lineStyle(1.5,0x66ffdd,0.5);
            g.strokeTriangle(16,7, 7,25, 25,25);
            // Ortadaki dikey cizgi (Notpixel'in ic cizgisi)
            g.fillStyle(0x44ffcc,0.8); g.fillRect(15,10,2,15);
            g.fillStyle(0x88ffee,1); g.fillRect(15,11,1,12);
            // XP parcaciklari ucgen koselerinde
            g.fillStyle(0x00ffcc,1); g.fillCircle(16,4,2); g.fillCircle(5,27,2); g.fillCircle(27,27,2);
            g.fillStyle(0xffffff,0.8); g.fillCircle(16,4,1); g.fillCircle(5,27,1); g.fillCircle(27,27,1);
            // Merkez enerji
            g.fillStyle(0x004433,1); g.fillCircle(16,17,5);
            g.fillStyle(0x00cc88,1); g.fillCircle(16,17,3);
            g.fillStyle(0x44ffcc,1); g.fillCircle(16,17,2);
            g.fillStyle(0xffffff,0.9); g.fillCircle(15,16,1);
        },

        // ── HP — Max Can: Enerji kalkan + kirmizi cekirdek ──
        icon_hp:()=>{
            bg(0x1a0008, 0x2d0010);
            brd(0xff2244,2.5);
            glow(0xff1133,16,16,13,0.2);
            // Kalkan dis hat
            g.fillStyle(0x660011,1);
            g.fillTriangle(16,2,3,10,3,22); g.fillTriangle(16,2,29,10,29,22);
            g.fillRect(3,10,26,12); g.fillTriangle(3,22,29,22,16,30);
            // Kalkan ic
            g.fillStyle(0x990022,1);
            g.fillTriangle(16,4,5,11,5,21); g.fillTriangle(16,4,27,11,27,21);
            g.fillRect(5,11,22,10); g.fillTriangle(5,21,27,21,16,28);
            // Kalkan parlaklik
            g.fillStyle(0xdd1133,1);
            g.fillTriangle(16,6,7,12,7,20); g.fillTriangle(16,6,25,12,25,20);
            g.fillRect(7,12,18,8); g.fillTriangle(7,20,25,20,16,26);
            // Merkez + sembolu
            g.fillStyle(0xffffff,1); g.fillRect(15,13,2,7); g.fillRect(12,16,8,2);
            g.fillStyle(0xffaaaa,0.6); g.fillCircle(16,16,7);
        },

        // ── REGEN — Yenilenme: Dongusel yasam enerji halkasi ──
        icon_regen:()=>{
            bg(0x041a0a, 0x082d14);
            brd(0x33ff77,2.5);
            glow(0x00ff55,16,16,13,0.2);
            // Yasam halkasi dis
            g.lineStyle(3,0x117733,0.9); g.strokeCircle(16,16,13);
            g.lineStyle(2.5,0x22aa55,1); g.strokeCircle(16,16,11);
            // Dongu oku — ok baslari
            g.fillStyle(0x00dd55,1); g.fillTriangle(16,3,13,9,19,9);   // ust ok
            g.fillStyle(0x00dd55,1); g.fillTriangle(16,29,19,23,13,23); // alt ok
            // Dongu yaylar (yaklasik)
            g.lineStyle(3,0x33ff77,0.9);
            g.strokeCircle(16,16,11);
            // Merkez yasam cekirdegi
            g.fillStyle(0x115522,1); g.fillCircle(16,16,6);
            g.fillStyle(0x22aa44,1); g.fillCircle(16,16,5);
            g.fillStyle(0x44ff88,1); g.fillCircle(16,16,3);
            g.fillStyle(0x88ffaa,1); g.fillCircle(16,16,2);
            g.fillStyle(0xffffff,0.9); g.fillCircle(15,15,1);
        },

        // ── HEAL — Saglik Kiti: Parlayan enerji kristali + arti ──
        icon_heal:()=>{
            bg(0x001a20, 0x002d33);
            brd(0x00ffcc,2.5);
            glow(0x00ddaa,16,16,13,0.22);
            // Kristal dis
            g.fillStyle(0x003333,1); g.fillTriangle(16,2,5,28,27,28); g.fillRect(5,15,22,13);
            g.lineStyle(2,0x00aacc,0.8); g.strokeTriangle(16,2,5,28,27,28);
            // Kristal ic katmanlar
            g.fillStyle(0x004444,1); g.fillTriangle(16,5,7,27,25,27);
            g.fillStyle(0x006655,1); g.fillTriangle(16,8,9,26,23,26);
            g.fillStyle(0x009977,1); g.fillTriangle(16,11,11,25,21,25);
            g.fillStyle(0x00cc99,1); g.fillTriangle(16,14,13,24,19,24);
            // Parlak arti sembolu
            g.fillStyle(0xffffff,1); g.fillRect(15,15,2,8); g.fillRect(11,18,10,2);
            g.fillStyle(0xaaffee,0.8); g.fillCircle(16,19,4);
            // Ust highlight
            g.fillStyle(0x88ffee,0.8); g.fillTriangle(16,5,13,12,19,12);
            g.fillStyle(0xffffff,0.5); g.fillTriangle(16,6,14,11,18,11);
        },

        // ── EXPLOSIVE — Bomba: Enerji bombasi, Notcoin entegre ──
        icon_explosive:()=>{
            bg(0x1a0e00, 0x331a00);
            brd(0xff7700,2.5);
            glow(0xff6600,15,18,12,0.25);
            // Bomba govdesi — koyu metalik
            g.fillStyle(0x1a1a1a,1); g.fillCircle(15,19,12);
            g.fillStyle(0x2d2d2d,1); g.fillCircle(15,19,10);
            g.fillStyle(0x3d3d3d,1); g.fillCircle(15,19,8);
            // Notcoin hollow square — govde uzerinde
            g.fillStyle(0xff9900,1); g.fillRect(10,14,10,10);
            g.fillStyle(0x2d2d2d,1); g.fillRect(13,17,4,4);
            g.fillStyle(0xff9900,0.3); g.fillRect(13,17,4,4);
            // Fitil
            g.fillStyle(0x885500,1); g.fillRect(16,7,2,4);
            g.fillStyle(0xaa7700,1); g.fillRect(18,5,2,3); g.fillRect(20,3,2,3);
            // Kivilcim
            g.fillStyle(0xffee00,1); g.fillCircle(22,2,3);
            g.fillStyle(0xffffff,0.9); g.fillCircle(21,1,1);
            // Patlama cizgileri
            g.fillStyle(0xff6600,0.8); for(let i=0;i<8;i++){const a=Phaser.Math.DegToRad(i*45);g.fillRect(15+Math.cos(a)*13,19+Math.sin(a)*13,2,2);}
        },

        // ── LIGHTNING — Zincir Simsek: Canli enerji varligi ──
        icon_lightning:()=>{
            bg(0x0a0a00, 0x151500);
            brd(0xffee00,2.5);
            glow(0xffdd00,16,16,13,0.25);
            // Dis enerji halkasi
            g.lineStyle(2,0xaa8800,0.7); g.strokeCircle(16,16,14);
            g.lineStyle(1.5,0xffcc00,0.5); g.strokeCircle(16,16,11);
            // Ana simsek — kalin kontur
            g.fillStyle(0x885500,1); g.fillTriangle(21,1,11,18,19,18); g.fillTriangle(19,16,9,32,17,32);
            // Ana simsek — orta
            g.fillStyle(0xdd9900,1); g.fillTriangle(20,2,12,17,18,17); g.fillTriangle(18,15,10,31,16,31);
            // Ana simsek — parlak
            g.fillStyle(0xffdd00,1); g.fillTriangle(19,3,13,16,17,16); g.fillTriangle(17,16,11,30,15,30);
            // Cekirdek beyaz
            g.fillStyle(0xffffaa,1); g.fillRect(17,5,2,9); g.fillRect(13,19,2,9);
            g.fillStyle(0xffffff,0.9); g.fillRect(17,6,1,7); g.fillRect(14,20,1,7);
            // Zincir dali
            g.fillStyle(0xffcc00,0.8); g.fillTriangle(25,8,19,15,23,16);
            g.fillStyle(0xffee44,0.9); g.fillTriangle(24,9,20,14,22,15);
            g.fillStyle(0xffffff,0.7); g.fillRect(23,9,1,5);
            // Elektrik parcaciklari
            g.fillStyle(0xffffff,0.9); g.fillCircle(6,6,1); g.fillCircle(27,5,1); g.fillCircle(4,28,1);
        },

        // ── DRONE — Muharip Robot: Sirin ama tehlikeli karakter ──
        icon_drone:()=>{
            bg(0x000d22, 0x001a3d);
            brd(0x00aaff,2.5);
            glow(0x0088ff,16,16,13,0.2);
            // Govde
            g.fillStyle(0x001133,1); g.fillRect(9,12,14,9);
            g.fillStyle(0x002255,1); g.fillRect(10,13,12,7);
            g.fillStyle(0x004488,1); g.fillRect(11,14,10,5);
            // Govde on paneli
            g.fillStyle(0x0066aa,1); g.fillRect(12,15,8,3);
            g.fillStyle(0x0099dd,0.8); g.fillRect(13,15,6,1);
            // "Goz" kamera
            g.fillStyle(0x000022,1); g.fillCircle(16,10,4);
            g.fillStyle(0x002244,1); g.fillCircle(16,10,3);
            g.fillStyle(0x0066cc,1); g.fillCircle(16,10,2);
            g.fillStyle(0x00aaff,1); g.fillCircle(16,10,1);
            g.fillStyle(0xffffff,0.9); g.fillCircle(15,9,1);
            // Kanatlar
            g.fillStyle(0x001a33,1); g.fillRect(1,13,8,5);
            g.fillStyle(0x001a33,1); g.fillRect(23,13,8,5);
            g.fillStyle(0x002244,0.9); g.fillRect(2,14,6,3);
            g.fillStyle(0x002244,0.9); g.fillRect(24,14,6,3);
            // Rotor halkalar
            g.lineStyle(2,0x00aaff,0.9); g.strokeCircle(4,12,4);
            g.lineStyle(2,0x00aaff,0.9); g.strokeCircle(28,12,4);
            g.fillStyle(0x00ddff,0.8); g.fillCircle(4,12,1); g.fillCircle(28,12,1);
            // Lazer namlu
            g.fillStyle(0xff4400,0.9); g.fillRect(14,21,4,4);
            g.fillStyle(0xff8800,0.8); g.fillRect(15,25,2,5);
            g.fillStyle(0xffcc00,0.7); g.fillCircle(16,24,1);
        },

        // ── SAW — Detayli metalik testere ──
        icon_saw:()=>{
            bg(0x080808, 0x141414);
            brd(0xbbbbbb,2.5);
            // Dis golge
            g.fillStyle(0x111111,1); g.fillCircle(16,16,15);
            // Dis metal halka — 3 katman
            g.fillStyle(0x3a3a3a,1); g.fillCircle(16,16,14);
            g.fillStyle(0x5a5a5a,1); g.fillCircle(16,16,13);
            g.fillStyle(0x747474,1); g.fillCircle(16,16,12);
            // 12 keskin dis
            for(let i=0;i<12;i++){
                const a=Phaser.Math.DegToRad(i*30);
                const a2=Phaser.Math.DegToRad(i*30+11);
                const a3=Phaser.Math.DegToRad(i*30-9);
                g.fillStyle(0xdddddd,1);
                g.fillTriangle(
                    16+Math.cos(a)*15,  16+Math.sin(a)*15,
                    16+Math.cos(a2)*12, 16+Math.sin(a2)*12,
                    16+Math.cos(a3)*12, 16+Math.sin(a3)*12
                );
                // Dis highlight
                g.fillStyle(0xffffff,0.45);
                g.fillTriangle(
                    16+Math.cos(a)*15,  16+Math.sin(a)*15,
                    16+Math.cos(a)*13,  16+Math.sin(a)*13,
                    16+Math.cos(a2)*13, 16+Math.sin(a2)*13
                );
            }
            // Govde halka arasi cizgi
            g.lineStyle(1,0x999999,0.6); g.strokeCircle(16,16,12);
            // Orta hub
            g.fillStyle(0x1e1e1e,1); g.fillCircle(16,16,8);
            g.fillStyle(0x2e2e2e,1); g.fillCircle(16,16,7);
            g.fillStyle(0x444444,1); g.fillCircle(16,16,6);
            // Hub ic detay — arti sekli
            g.fillStyle(0x666666,1); g.fillRect(13,15,6,2); g.fillRect(15,13,2,6);
            // Hub halka
            g.lineStyle(1,0x888888,0.7); g.strokeCircle(16,16,5);
            // Merkez civata
            g.fillStyle(0x999999,1); g.fillCircle(16,16,3);
            g.fillStyle(0xbbbbbb,1); g.fillCircle(16,16,2);
            g.fillStyle(0xdddddd,1); g.fillCircle(16,16,1);
            // Parlak highlight
            g.fillStyle(0xffffff,0.55); g.fillCircle(10,10,2);
            g.fillStyle(0xffffff,0.25); g.fillCircle(9,9,3);
        },

        // ── POISON — Zehir: Canli organizma/bakteri ──
        icon_poison:()=>{
            bg(0x010e01, 0x021a02);
            brd(0x33ff33,2.5);
            glow(0x00ff00,16,16,13,0.2);
            // Ana organizma govdesi
            g.fillStyle(0x083308,1); g.fillCircle(16,16,12);
            g.fillStyle(0x0d550d,1); g.fillCircle(16,16,10);
            g.fillStyle(0x11771a,1); g.fillCircle(16,16,8);
            g.fillStyle(0x22aa22,1); g.fillCircle(16,16,6);
            g.fillStyle(0x44dd44,1); g.fillCircle(16,16,4);
            g.fillStyle(0x88ff88,1); g.fillCircle(16,16,2);
            g.fillStyle(0xffffff,0.7); g.fillCircle(15,15,1);
            // Bakteri uzantilari — canli gibi
            for(let i=0;i<8;i++){
                const a=Phaser.Math.DegToRad(i*45);
                const ex=16+Math.cos(a)*12, ey=16+Math.sin(a)*12;
                g.fillStyle(0x22aa22,0.9); g.fillCircle(ex,ey,2);
                g.fillStyle(0x44dd44,0.7); g.fillCircle(ex,ey,1);
            }
            // Zehir damlaciklari
            g.fillStyle(0x66ff66,0.9); g.fillCircle(4,4,3); g.fillCircle(27,6,2); g.fillCircle(5,27,2);
            g.fillStyle(0xaaffaa,0.8); g.fillCircle(4,4,1); g.fillCircle(27,6,1);
        },

        // ── LASER — Lazer: Antik enerji kristali ──
        icon_laser:()=>{
            bg(0x1a0000, 0x2d0000);
            brd(0xff2200,2.5);
            glow(0xff1100,16,16,13,0.25);
            // Kristal yapi — 8 koseli
            g.fillStyle(0x550000,1);
            g.fillTriangle(16,2,22,8,22,24); g.fillTriangle(16,2,10,8,10,24);
            g.fillRect(10,8,12,16); g.fillTriangle(10,24,22,24,16,30);
            // Ic parlak katmanlar
            g.fillStyle(0x880000,1);
            g.fillTriangle(16,4,21,9,21,23); g.fillTriangle(16,4,11,9,11,23);
            g.fillRect(11,9,10,14); g.fillTriangle(11,23,21,23,16,28);
            g.fillStyle(0xcc1100,1);
            g.fillTriangle(16,7,20,11,20,21); g.fillTriangle(16,7,12,11,12,21);
            g.fillRect(12,11,8,10); g.fillTriangle(12,21,20,21,16,26);
            // Enerji cekirdegi
            g.fillStyle(0xff2200,1); g.fillCircle(16,15,5);
            g.fillStyle(0xff6600,1); g.fillCircle(16,15,3);
            g.fillStyle(0xffcc00,1); g.fillCircle(16,15,2);
            g.fillStyle(0xffffff,1); g.fillCircle(16,15,1);
            // Yan beam cikislari
            g.fillStyle(0xff2200,0.8); g.fillRect(2,14,8,4);
            g.fillStyle(0xff6600,0.5); g.fillRect(1,13,6,6);
            g.fillStyle(0xff2200,0.8); g.fillRect(22,14,8,4);
            g.fillStyle(0xff6600,0.5); g.fillRect(25,13,6,6);
        },

        // ── THUNDER — Gok Gurultusu: Bulut + simsek ──
        icon_thunder:()=>{
            bg(0x050510, 0x0a0a1a);
            brd(0xffdd44,2.5);
            glow(0xffcc00,16,12,11,0.2);
            // Bulut — 3 katman
            g.fillStyle(0x334455,1); g.fillCircle(9,11,7); g.fillCircle(16,8,8); g.fillCircle(23,11,6); g.fillRect(3,11,26,4);
            g.fillStyle(0x445566,1); g.fillCircle(10,10,6); g.fillCircle(16,7,7); g.fillCircle(22,10,5); g.fillRect(4,10,24,4);
            g.fillStyle(0x5f7a8a,1); g.fillCircle(11,10,5); g.fillCircle(16,7,6); g.fillCircle(21,10,4); g.fillRect(6,10,20,3);
            // Bulut alt duzlemi
            g.fillStyle(0x445566,1); g.fillRect(3,13,26,2);
            // Simsek — keskin, modern
            g.fillStyle(0x664400,1); g.fillTriangle(20,14,13,25,18,25); g.fillTriangle(18,23,11,32,16,32);
            g.fillStyle(0xcc8800,1); g.fillTriangle(19,14,14,24,17,24); g.fillTriangle(17,22,12,31,15,31);
            g.fillStyle(0xffdd00,1); g.fillTriangle(18,15,15,23,16,23); g.fillTriangle(16,22,13,30,14,30);
            g.fillStyle(0xffff88,1); g.fillRect(16,16,2,7); g.fillRect(13,24,2,6);
            // Glow
            g.fillStyle(0xffff44,0.25); g.fillCircle(16,24,7);

            // Rapid/spread/chain/precision silah ikonlari
        },

        // ── RAPID BLASTER — Hizli Atis ──
        icon_rapid:()=>{
            bg(0x1a1500, 0x332800);
            brd(0xffee22,2.5);
            glow(0xffcc00,16,16,12,0.2);
            // Silah govdesi — genis, basik
            g.fillStyle(0x332200,1); g.fillRect(3,14,20,8);
            g.fillStyle(0x4d3300,1); g.fillRect(4,15,18,6);
            g.fillStyle(0x664400,1); g.fillRect(5,16,16,4);
            // Namlu — ince, uzun
            g.fillStyle(0x221a00,1); g.fillRect(20,15,10,4);
            g.fillStyle(0x443300,1); g.fillRect(21,15,8,3);
            // Mermi akisi — 4 kucuk enerji topu
            g.fillStyle(0xffee00,1); for(let i=0;i<4;i++){g.fillCircle(4+i*4,12,1.5);}
            g.fillStyle(0xffffff,0.8); for(let i=0;i<4;i++){g.fillCircle(4+i*4,11,1);}
            // Tetik
            g.fillStyle(0x221a00,1); g.fillRect(8,22,4,4);
            // Enerji lambasi
            g.fillStyle(0xffcc00,1); g.fillCircle(13,17,2);
            g.fillStyle(0xffffff,0.8); g.fillCircle(13,17,1);
        },

        // ── HEAVY CANNON — Agir Top ──
        icon_cannon:()=>{
            bg(0x110800, 0x221000);
            brd(0xff6600,2.5);
            glow(0xff4400,16,17,12,0.22);
            // Top namlusu — uzun silindir
            g.fillStyle(0x1a0a00,1); g.fillRect(5,13,24,10);
            g.fillStyle(0x2d1500,1); g.fillRect(6,14,22,8);
            g.fillStyle(0x441f00,1); g.fillRect(7,15,20,6);
            // Namlu ringler
            for(let i=0;i<3;i++){
                g.fillStyle(0x663300,1); g.fillRect(6+i*6,13,4,10);
                g.fillStyle(0x884400,0.6); g.fillRect(7+i*6,14,2,8);
            }
            // Ates gozu — namlu ucu
            g.fillStyle(0x220800,1); g.fillCircle(29,18,4);
            g.fillStyle(0x552200,1); g.fillCircle(29,18,3);
            g.fillStyle(0xff4400,1); g.fillCircle(29,18,2);
            g.fillStyle(0xff8800,1); g.fillCircle(29,18,1);
            // Patlama enerji
            g.fillStyle(0xff4400,0.6); g.fillCircle(29,18,6);
            g.fillStyle(0xff8800,0.3); g.fillCircle(29,18,8);
            // Top altligi
            g.fillStyle(0x1a0a00,1); g.fillRect(4,23,10,5);
            g.fillStyle(0x2d1500,1); g.fillRect(5,24,8,3);
            g.fillStyle(0x441f00,1); g.fillCircle(9,24,4);
        },

        // ── SPREAD SHOT — Sacma Atis ──
        icon_spread:()=>{
            bg(0x15001a, 0x280033);
            brd(0xcc44ff,2.5);
            glow(0xaa22ff,16,20,11,0.2);
            // Alt merkez ates noktasi
            g.fillStyle(0x6600aa,1); g.fillCircle(16,24,4);
            g.fillStyle(0xaa33ff,1); g.fillCircle(16,24,3);
            g.fillStyle(0xcc88ff,1); g.fillCircle(16,24,1);
            // Mermi 1 — sol
            g.fillStyle(0x7711bb,1); g.fillRect(6,6,3,16);
            g.fillStyle(0x9933dd,1); g.fillRect(7,6,2,14);
            g.fillStyle(0xcc66ff,0.8); g.fillRect(7,6,1,11);
            g.fillStyle(0xbb33ff,1); g.fillTriangle(5,6,10,6,7,2);
            // Mermi 2 — orta
            g.fillStyle(0x8822cc,1); g.fillRect(14,4,4,18);
            g.fillStyle(0xbb44ff,1); g.fillRect(15,4,2,16);
            g.fillStyle(0xffffff,0.7); g.fillRect(15,4,1,13);
            g.fillStyle(0xdd55ff,1); g.fillTriangle(13,4,19,4,16,0);
            // Mermi 3 — sag
            g.fillStyle(0x7711bb,1); g.fillRect(23,6,3,16);
            g.fillStyle(0x9933dd,1); g.fillRect(23,6,2,14);
            g.fillStyle(0xcc66ff,0.8); g.fillRect(24,6,1,11);
            g.fillStyle(0xbb33ff,1); g.fillTriangle(22,6,27,6,25,2);
        },

        // ── CHAIN SHOT — Zincir Atis ──
        icon_chain:()=>{
            bg(0x001520, 0x002233);
            brd(0x22aaff,2.5);
            glow(0x0088ff,16,16,12,0.2);
            // Dusman 1 (sol)
            g.fillStyle(0x00334d,1); g.fillCircle(6,16,5);
            g.fillStyle(0x0055aa,1); g.fillCircle(6,16,3);
            g.fillStyle(0x0088ff,1); g.fillCircle(6,16,2);
            // Zincir baglantisi 1
            g.fillStyle(0x0066cc,0.9); g.fillRect(11,14,5,4);
            g.fillStyle(0x0088ff,0.7); g.fillRect(12,15,3,2);
            // Dusman 2 (orta)
            g.fillStyle(0x00334d,1); g.fillCircle(16,10,5);
            g.fillStyle(0x0055aa,1); g.fillCircle(16,10,3);
            g.fillStyle(0x0088ff,1); g.fillCircle(16,10,2);
            // Zincir baglantisi 2
            g.fillStyle(0x0066cc,0.9); g.fillRect(16,15,5,4);
            g.fillStyle(0x0088ff,0.7); g.fillRect(17,16,3,2);
            // Dusman 3 (sag)
            g.fillStyle(0x00334d,1); g.fillCircle(26,22,5);
            g.fillStyle(0x0055aa,1); g.fillCircle(26,22,3);
            g.fillStyle(0x0088ff,1); g.fillCircle(26,22,2);
            // Mermi
            g.fillStyle(0xffee00,1); g.fillCircle(3,16,3);
            g.fillStyle(0xffffff,0.9); g.fillCircle(3,16,1);
            // Zincir cizgileri
            g.lineStyle(1.5,0x0066cc,0.7); g.strokeCircle(6,16,5); g.strokeCircle(16,10,5); g.strokeCircle(26,22,5);
        },

        // ── PRECISION RIFLE — Keskin Nisanci ──
        icon_precision:()=>{
            bg(0x1a0008, 0x2d0010);
            brd(0xff2244,2.5);
            glow(0xff0022,16,16,12,0.2);
            // Tufek govdesi
            g.fillStyle(0x220000,1); g.fillRect(2,14,26,7);
            g.fillStyle(0x440000,1); g.fillRect(3,15,24,5);
            g.fillStyle(0x661111,1); g.fillRect(4,16,22,3);
            // Namlu — ince, uzun
            g.fillStyle(0x110000,1); g.fillRect(24,15,7,4);
            g.fillStyle(0x330000,1); g.fillRect(25,16,5,2);
            // Optik durbun
            g.fillStyle(0x110000,1); g.fillRect(10,10,12,5);
            g.fillStyle(0x220011,1); g.fillRect(11,11,10,3);
            // Nisangah isigi
            g.fillStyle(0xff0000,1); g.fillCircle(12,12,2);
            g.fillStyle(0xff6666,0.8); g.fillCircle(12,12,3);
            // Lazer hedef noktasi — uzakta
            g.fillStyle(0xff0000,0.9); g.fillCircle(30,12,2);
            g.fillStyle(0xff4444,0.6); g.fillCircle(30,12,3);
            // Lazer cizgisi
            g.fillStyle(0xff0000,0.5); g.fillRect(14,12,16,1);
            g.fillStyle(0xff0000,0.25); g.fillRect(12,11,18,3);
            // Capraz nisangah cizgileri
            g.fillStyle(0xff2244,0.7); g.fillRect(28,9,3,1); g.fillRect(28,14,3,1); g.fillRect(28,11,1,3);
        },

        // ── REFLECT RIFLE — Yansima Tufegi ──
        icon_reflect:()=>{
            bg(0x001a18, 0x002d28);
            brd(0x22ffdd,2.5);
            glow(0x00ddcc,16,16,12,0.2);
            // Tufek govdesi
            g.fillStyle(0x001a18,1); g.fillRect(2,14,22,7);
            g.fillStyle(0x002d28,1); g.fillRect(3,15,20,5);
            g.fillStyle(0x004d44,1); g.fillRect(4,16,18,3);
            // Yansima kristali
            g.fillStyle(0x005544,1); g.fillTriangle(12,8,20,8,16,3);
            g.fillStyle(0x007766,1); g.fillTriangle(13,8,19,8,16,5);
            g.fillStyle(0x00aaaa,1); g.fillTriangle(14,8,18,8,16,6);
            g.fillStyle(0x22dddd,1); g.fillTriangle(15,8,17,8,16,7);
            // Sekme oku 1
            g.fillStyle(0x00ffdd,0.9);
            g.fillRect(23,8,5,2); g.fillTriangle(27,6,32,10,27,12);
            // Sekme oku 2
            g.fillRect(23,20,5,2); g.fillTriangle(27,18,32,22,27,24);
            // Mermi
            g.fillStyle(0x00ffcc,1); g.fillCircle(4,17,3);
            g.fillStyle(0xaaffee,0.8); g.fillCircle(4,17,1);
        }
    };

    const _sc = g.scene;
    for(const [key,fn] of Object.entries(defs)){
        if(_sc && _sc.textures && _sc.textures.exists(key)) continue;
        g.clear(); fn(); g.generateTexture(key,sz,sz);
    }
    g.clear();
}

// ── ENEMY HELPERS ─────────────────────────────────────────────
// Enemy HP: level-based linear zone + exponential time multiplier
function hpFor(base,level,scale){
    // Level-based linear zones (unchanged — keeps early feel)
    const lv = Math.max(0, level - 1);
    const lvFactor =
        lv <=  5 ? lv * 0.55
      : lv <= 15 ? 2.75 + (lv -  5) * 0.90
      :            11.75 + (lv - 15) * 0.70;
    const baseHp = Math.ceil(base + lvFactor * scale);

    // Time-based multiplier — EXPONENTIAL past minute 10
    // 0-5min  : 1.0x   (early game untouched)
    // 5-10min : linear 1.0→1.4x  (+8%/min — mid pressure builds)
    // 10min+  : exponential: 1.4 * 1.09^(min-10)  (~+9%/min compounding)
    // e.g. min15=2.15x, min20=3.32x, min25=5.12x — always outpaces player soft-cap
    const min = GS ? (GS.t / 60000) : 0;
    const timeMult =
        min < 5  ? 1.0
      : min < 10 ? 1.0 + (min - 5) * 0.08
      : 1.35 * Math.pow(1.07, min - 10); // [BALANCE] min25: ~3.7x (was 5.1x) — oynanabilir pencere genisletildi

    return Math.ceil(baseHp * timeMult);
}

function resetEF(p){
    p.zigzag=p.kamikaze=p.shield=p.swarm=p.split=p.frozen=false;
    p.elite=p.isBoss=p.ghost=p.groundHit=p.lock=p.spawnProtected=false;
    p.hitByOrbit=false; p.armor=0; p.hitCount=0; p.zigTimer=0; p.type="normal";
    p._breakFrame=-1; p._staggering=false; p._breakOffset=0;
    p._jellyAngle=0; p._jellyVel=0; p._jellyActive=false; // jelly spring reset
    p._wobblePhase=undefined; p._windPhase=undefined; p._entryDone=false;
    p.spinner=false; p.spinRate=0; p.armored=p.elder=false;
    p.bomber=p.stealth=false; p.stealthTimer=0; p.healer=false; p.healTimer=0;
    p.magnetEnemy=p.mirror=false; p.mirrorSpawned=false; p.berserker=false;
    p.absorber=false; p.absorbTimer=0; p.chain=false; p.freezerEnemy=false; p.freezeTimer=0;
    p.leech=p.titan=p.shadow=false; p.shadowSpawned=false;
    p.spiker=false; p.spikeTimer=0; p.vortex=p.phantom=false; p.phaseTimer=0;
    p.rusher=false; p.rushTimer=0; p.rushing=false;
    p.splitter=p.toxic=false; p.toxTimer=0; p.colossus=false;
    p._lastComboTime=0;
    p.inferno=p.glacier=p.phantom_tri=p.volt=p.obsidian=false;
    p._collideCooldown=false; // [BUG FIX] Carpisma cooldown'u sifirla
    p._hueTimer=0; p._hueIdx=0; p._pulseT=0; // pyramid3/4 efekt timer'lari
    p._magT=0; p._vortT=0; // magnet/vortex throttle timer'lari
    p._lastCritVfx=0; // krit VFX throttle
    p._fallEffT=0; p._debrisT=0; p._fireT=0; // dusme efekti timer'lari
    // [BUG FIX] Squash scale birikimini sifirla — pool'dan gelen nesne eski base scale tasimasin
    p._baseScaleX=undefined; p._basescaleY=undefined;
    if(p._shadowGfx){try{p._shadowGfx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)} p._shadowGfx=null;}
    // Texture ve frame sifirla — pool'dan gelen obje eski break frame'de kalabilir
    try{p.setTexture("pyramid",0).clearTint().setAlpha(1);}catch(e){try{p.clearTint().setAlpha(1);}catch(ex){}}
    // Hitbox: texture boyutuna gore dinamik ayarlanir, spawnEnemy'de override edilir
    if(p.body){
        p.body.enable=true;
        p.body.moves=true;
        p.body.velocity.x=0;
        p.body.velocity.y=0;
        // disableBody(true,true) checkCollision.none=true yapar — bunu sifirla
        p.body.checkCollision.none=false;
        p.body.checkCollision.up=true;
        p.body.checkCollision.down=true;
        p.body.checkCollision.left=true;
        p.body.checkCollision.right=true;
        p.body.setSize(20,18).setOffset(0,0);
    }
    p.setAngle(0); p.setFlipX(false);
}

function pickType(level){
    const dynPool=ENEMY_POOL.map(e=>{
        if(e[0]==="volt"||e[0]==="phantom_tri"){
            // Level 18'de 2, level 25'te max 5
            const w=Math.min(5, Math.max(0, (level-18)*0.6));
            return [e[0],e[1],w>0?w:e[2]];
        }
        if(e[0]==="obsidian"){
            // Level 22'de 1, level 28+'da max 3
            const w=Math.min(3, Math.max(0, (level-22)*0.5));
            return [e[0],e[1],w>0?w:e[2]];
        }
        return e;
    });
    const valid=dynPool.filter(e=>level>=e[1]);
    const total=valid.reduce((s,e)=>s+e[2],0);
    let r=Math.random()*total;
    for(const e of valid){r-=e[2];if(r<=0)return e[0];}
    return "normal";
}

function spawnEnemy(S){
    // Dynamic enemy cap — ARCADE: higher caps early for constant pressure
    // 0-1min: 12, 1-3min: 16, 3-6min: 20, 6-10min: 24, 10-15min: 28, 15min+: 32 (MAX_ENEMIES)
    const _capMin = GS ? GS.t / 60000 : 0;
    const _dynamicCap =
        _capMin < 1  ? 12 :
        _capMin < 2  ? Math.round(Phaser.Math.Linear(12, 13, (_capMin-1)/1))  : // [LEVEL 2 ONLY] Cap reduced: 12→13 during min1→2. Fewer simultaneous triangles. Rejoins original ramp at min=2.
        _capMin < 3  ? Math.round(Phaser.Math.Linear(13, 16, (_capMin-2)/1))  :
        _capMin < 6  ? Math.round(Phaser.Math.Linear(16, 20, (_capMin-3)/3))  :
        _capMin < 10 ? Math.round(Phaser.Math.Linear(20, 24, (_capMin-6)/4))  :
        _capMin < 15 ? Math.round(Phaser.Math.Linear(24, 28, (_capMin-10)/5)) :
        Math.min(MAX_ENEMIES, Math.round(28 + (_capMin-15)*0.8));
    if(!S.pyramids || S.pyramids.countActive(true) >= _dynamicCap) return; // single authoritative check
    const gs=GS;

    // ── WAVE PACING — breathing windows between spawn bursts ────────
    // After a wave of N enemies, insert a short pause (skip ticks).
    // Keeps spawning intentional and rhythmic instead of constant spam.
    gs._waveCount = (gs._waveCount || 0);
    gs._wavePause = (gs._wavePause || 0);
    if(gs._wavePause > 0){
        gs._wavePause--;
        return; // breathing gap — no spawn this tick
    }
    gs._waveCount++;
    // Wave size and gap length per director phase
    const _waveSize =
        gs.directorPhase==="calm"  ? 3 :
        gs.directorPhase==="wave"  ? 4 :
        gs.directorPhase==="swarm" ? 5 :
        gs.directorPhase==="rush"  ? 6 : 7; // chaos
    const _gapTicks =
        gs.directorPhase==="calm"  ? 3 :
        gs.directorPhase==="wave"  ? 2 :
        gs.directorPhase==="swarm" ? 2 :
        gs.directorPhase==="rush"  ? 1 : 1; // chaos — minimal gap
    // Early levels get one extra gap tick for softer pressure
    const _earlyBonus = (gs.level <= 2) ? 1 : 0;
    if(gs._waveCount >= _waveSize){
        gs._waveCount = 0;
        gs._wavePause = _gapTicks + _earlyBonus;
    }
    // ── END WAVE PACING ─────────────────────────────────────────────

    let x,at=0;
    // [OPT] getChildren().some() yerine _activeEnemies cache kullan — O(n) pahali kontrol
    const _spawnCache=S._activeEnemies||[];
    do{ x=Phaser.Math.Between(SPAWN_SAFE_X,360-SPAWN_SAFE_X); at++; }
    while(at<8&&_spawnCache.some(p=>p&&p.active&&Math.abs(p.x-x)<40&&p.y<80));

    const type=pickType(gs.level);
    // [BOYUT FIX] Tum eski tex_* texture'lari "pyramid" ile eslestirildi.
    // Kucuk 24x24 generated texture'lar yerine artik gercek pyramid asset'leri kullaniliyor.
    // pyramid1/2/3/4 → kendi ozel pyramid_1/2/3/4 asset'leri
    // Diger tum tipler → "pyramid" (orijinal asset, tint ile renklendiriliyor)
    const texMap={
        normal:"pyramid",zigzag:"zigzag",fast:"pyramid",tank:"pyramid",
        shield:"pyramid",kamikaze:"pyramid",ghost:"pyramid",split:"pyramid",
        swarm:"pyramid",elder:"pyramid",spinner:"pyramid",armored:"pyramid",
        bomber:"pyramid",stealth:"pyramid",healer:"pyramid",magnet:"pyramid",
        mirror:"pyramid",berserker:"pyramid",absorber:"pyramid",chain:"pyramid",
        freezer:"pyramid",leech:"pyramid",titan:"pyramid",shadow:"pyramid",
        spiker:"pyramid",vortex:"pyramid",phantom:"pyramid",rusher:"pyramid",
        splitter:"pyramid",toxic:"pyramid",colossus:"pyramid",
        inferno:"pyramid",glacier:"pyramid",phantom_tri:"pyramid",volt:"pyramid",obsidian:"pyramid"};
    const useTex=texMap[type]||"pyramid";

    const p=S.pyramids.get(x,-80,useTex);
    if(!p) return;
    p.setActive(true).setVisible(true);
    resetEF(p);
    // Soft swoop on spawn — random 40% chance, max 1 per 400ms to avoid spam
    const _now=Date.now();
    if(Math.random()<0.40 && (!spawnEnemy._lastSwoop || _now-spawnEnemy._lastSwoop>400)){
        spawnEnemy._lastSwoop=_now;
        NT_SFX.play("pyramid_swoop");
    }
    // Texture set + tint uygula — her tip kendine ozgu renk
    try{
        // Texture var mi kontrol et — yoksa fallback kullan
        const _safeTexture = S.textures.exists(useTex) ? useTex : "pyramid";
        p.setTexture(_safeTexture);
        p.clearTint();
        // WARM CANDY PALETTE — designed to blend with the yellow/gold pyramid base texture
        // All tints shift hue while preserving the warm, golden luminosity of the base sprite
        // Rule: nothing below 0xCC in the red channel, no cold hues (blue/teal/green)
        const typeTints={
            normal:      null,        // keep original gold/yellow base — reference look
            zigzag:      null,        // own texture — keep original
            fast:        0xFF6644,    // hot coral — base gold + red push
            tank:        0xEE88FF,    // soft candy violet — warm purple, not cold
            shield:      0xFFBBDD,    // rose quartz — pink-white, not cold blue
            kamikaze:    0xFF9922,    // deep candy orange — close to base, vivid
            ghost:       0xFFDDEE,    // pearl pink — pale, matches ghost feel
            split:       0xFFFF88,    // bright lemon — yellow pushed to lime-warm
            swarm:       0xFFCC77,    // honey amber — base hue shifted warmer
            elder:       0xFFAA00,    // deep gold — darker than base, regal
            spinner:     0xFF77CC,    // candy magenta — warm pink-purple
            armored:     0xFFAAEE,    // soft rose — light warm pink
            bomber:      0xFF7733,    // fire orange — vivid, hot
            stealth:     0xFFEECC,    // cream — very light warm tone, stealthy
            healer:      0xAAFF88,    // warm lime — slight warm tint on green
            magnet:      0xFFEE44,    // electric yellow — stays in warm family
            mirror:      0xFFCCFF,    // lavender candy — warm pink-purple
            berserker:   0xFF4455,    // bright cherry red — hot, angry
            absorber:    0xFFBBFF,    // cotton candy — pale warm violet
            chain:       0xFFAACC,    // pink peach — warm, chained feel
            freezer:     0xDDEEFF,    // ice pearl — barely cold, mostly white
            leech:       0xFF8899,    // pastel rose — warm pinkish
            titan:       0xFF88EE,    // vivid bubblegum — large + distinctive
            shadow:      0xCCAAFF,    // warm lavender — not gray, warm purple
            spiker:      0xFFDD55,    // warm gold-yellow — spiky energy
            vortex:      0xFFCC88,    // peach swirl — warm orange-cream
            phantom:     0xFFEEFF,    // ghost white-pink — almost clear
            rusher:      0xFF8844,    // deep peach orange — rushing energy
            splitter:    0xFFDD99,    // pale gold — splits off the base
            toxic:       0xDDFF66,    // warm acid — yellow-lime, not cold green
            colossus:    0xFF5588,    // hot pink-red — massive, powerful
            inferno:     0xFF6633,    // deep fire — darkest of the warm reds
            glacier:     0xDDFFFF,    // ice white — cold but near-white, not dark
            phantom_tri: 0xFF99EE,    // candy pink — warm fuchsia
            volt:        0xFFFF77,    // pale electric yellow — warm
            obsidian:    0xFF88BB,    // warm mauve — not dark purple
        };
        const tint=typeTints[type];
        if(tint!=null) p.setTint(tint);
        // Orijinal tint'i kaydet — hit flash sonrasi dogru renge don
        p._originalTint = tint;
        p.setVisible(true);
        p.setAlpha(1);
    }catch(e){ try{p.setTexture("pyramid");}catch(ex){} }
    // Shadow realm: yeni dusmanlar da gorunmez
    const spd=gs.pyramidSpeed;
    p.type=type;

    switch(type){
       case"normal":    p.hp=hpFor(8,gs.level,0.6);   p.setDisplaySize(78,64).setVelocityY(spd); break;
        case"zigzag":    p.hp=hpFor(7,gs.level,0.5);   p.zigzag=true;p.clearTint();p.setDisplaySize(59,48).setVelocityX(Phaser.Math.Between(-80,80)||55).setVelocityY(spd*0.85);
            // zigzag texture native: 134x113 → display 59x48
            // Hitbox native hesabi: display 40x29 → /scaleX,/scaleY
            p.body.setSize(91, 68).setOffset(22, 23);
            break;
        case"fast":      p.hp=hpFor(5,gs.level,0.45);  p.setDisplaySize(78,64).setTint(0xFF6644).setVelocityY(spd*1.7); break;
        case"tank":      p.hp=hpFor(20,gs.level,1.2);  p.armor=1;p.setDisplaySize(98,80).setVelocityY(spd*0.55); break;
        case"shield":    p.hp=hpFor(8,gs.level,0.45);  p.shield=true;p.armor=1;p.setDisplaySize(78,64).setVelocityY(spd*0.72); break;
        case"split":     p.hp=hpFor(7,gs.level,0.4);   p.split=true;p.setDisplaySize(78,64).setVelocityY(spd*1.0); break;
        case"swarm":     p.hp=1;p.swarm=true;p.setDisplaySize(59,48).setVelocityY(spd*1.0); break;
        case"kamikaze":  p.hp=hpFor(4,gs.level,0.25);  p.kamikaze=true;p.setDisplaySize(78,64).setVelocityY(spd*0.65); break;
        case"ghost":     p.hp=hpFor(10,gs.level,0.5);  p.ghost=true;p.setDisplaySize(59,48).setAlpha(0.42).setVelocityY(spd*1.0); break;
        case"spinner":   p.hp=hpFor(7,gs.level,0.4);   p.spinner=true;p.spinRate=0;p.setDisplaySize(78,64).setTint(0xFF77CC).setVelocityY(spd*0.78); break;
        case"armored":   p.hp=hpFor(9,gs.level,0.40);  p.armor=1;p.armored=true;p.setDisplaySize(78,64).setTint(0xFFAAEE).setVelocityY(spd*0.6); break; // [NERF] base 14→9, scale 0.7→0.40, armor 2→1
        case"elder":     p.hp=hpFor(20,gs.level,0.6);  p.armor=1;p.elder=true;p.setDisplaySize(117,96).setVelocityY(spd*0.45); break; // [NERF] base 30→20, scale 0.9→0.6
        case"bomber":    p.hp=hpFor(5,gs.level,0.3);   p.bomber=true;p.setDisplaySize(78,64).setVelocityY(spd*0.9); break;
        case"stealth":   p.hp=hpFor(7,gs.level,0.4);   p.stealth=true;p.stealthTimer=0;p.setDisplaySize(78,64).setAlpha(0.9).setVelocityY(spd*0.95); break;
        case"healer":    p.hp=hpFor(9,gs.level,0.5);   p.healer=true;p.healTimer=0;p.setDisplaySize(78,64).setVelocityY(spd*0.6); break;
        case"magnet":    p.hp=hpFor(7,gs.level,0.4);   p.magnetEnemy=true;p.setDisplaySize(78,64).setVelocityY(spd*0.8); break;
        case"mirror":    p.hp=hpFor(7,gs.level,0.4);   p.mirror=true;p.mirrorSpawned=false;p.setDisplaySize(78,64).setVelocityY(spd*0.85); break;
        case"berserker": p.hp=hpFor(9,gs.level,0.55);  p.berserker=true;p.setDisplaySize(78,64).setVelocityY(spd*0.7); break;
        case"absorber":  p.hp=hpFor(9,gs.level,0.45);  p.absorber=true;p.armor=1;p.absorbTimer=0;p.setDisplaySize(78,64).setVelocityY(spd*0.65); break; // [NERF] base 12→9, scale 0.65→0.45, armor 2→1
        case"chain":     p.hp=hpFor(6,gs.level,0.35);  p.chain=true;p.setDisplaySize(78,64).setVelocityY(spd*1.1); break;
        case"freezer":   p.hp=hpFor(9,gs.level,0.5);   p.freezerEnemy=true;p.freezeTimer=0;p.setDisplaySize(78,64).setVelocityY(spd*0.7); break;
        case"leech":     p.hp=hpFor(7,gs.level,0.4);   p.leech=true;p.setDisplaySize(78,64).setVelocityY(spd*0.9); break;
        case"titan":     p.hp=hpFor(30,gs.level,0.9);  p.armor=1;p.titan=true;p.setDisplaySize(137,112).setVelocityY(spd*0.35); break; // [NERF] base 45→30, scale 1.4→0.9, armor 2→1
        case"shadow":    p.hp=hpFor(9,gs.level,0.5);   p.shadow=true;p.shadowSpawned=false;p.setDisplaySize(78,64).setVelocityY(spd*1.0); break;
        case"spiker":    p.hp=hpFor(7,gs.level,0.4);   p.spiker=true;p.spikeTimer=0;p.setDisplaySize(78,64).setVelocityY(spd*0.85); break;
        case"vortex":    p.hp=hpFor(10,gs.level,0.6);  p.vortex=true;p.setDisplaySize(78,64).setVelocityY(spd*0.6); break;
        case"phantom":   p.hp=hpFor(14,gs.level,0.75); p.phantom=true;p.phaseTimer=0;p.setDisplaySize(78,64).setAlpha(0.35).setVelocityY(spd*0.8); break;
        case"rusher":    p.hp=hpFor(6,gs.level,0.35);  p.rusher=true;p.rushTimer=0;p.rushing=false;p.setDisplaySize(59,48).setVelocityY(spd*0.5); break;
        case"splitter":  p.hp=hpFor(10,gs.level,0.55); p.splitter=true;p.setDisplaySize(78,64).setVelocityY(spd*0.9); break;
        case"toxic":     p.hp=hpFor(7,gs.level,0.4);   p.toxic=true;p.toxTimer=0;p.setDisplaySize(78,64).setVelocityY(spd*0.85); break;
        case"colossus":  p.hp=hpFor(20,gs.level,0.6);  p.armor=1;p.colossus=true;p.setDisplaySize(196,160).setVelocityY(spd*0.25); break; // [NERF] base 30→20, scale 0.9→0.6
// ── YENI PIRAMIT TIPLERI — pyramid_1/2/3/4 asset, pyramid.png ile ayni boyut ──
        // Scale 0.82–0.95 arasi: normal pyramid ile ayni gorsel buyukluk
        // ── OZEL PIRAMIT TIPLERI ──
        case"inferno":     p.hp=hpFor(14,gs.level,0.75); p.inferno=true;
            p.setDisplaySize(78,64).setTint(0xFF6633).setVelocityY(spd*0.9);
            p._spinRate=0.25; // sabit yavas donus — tutarli, titreyerek degil
            p._spinAngle=0;   // aci takibi
            break;
        case"glacier":     p.hp=hpFor(22,gs.level,0.8);  p.glacier=true; p.armor=1;
            p.setDisplaySize(78,64).setTint(0xDDFFFF).setVelocityY(spd*0.55);
            break;
        case"phantom_tri": p.hp=hpFor(12,gs.level,0.65); p.phantom_tri=true;
            p.setDisplaySize(78,64).setTint(0xFF99EE).setVelocityY(spd*0.85);
            p._splitDone=false; // bolunme bayragi
            p.setAlpha(0.72);
            break;
        case"volt":        p.hp=hpFor(10,gs.level,0.55);  p.volt=true;
            p.setDisplaySize(78,64).setTint(0xFFFF77).setVelocityY(spd*1.1);
            p._voltPhase=0; // zigzag faz
            p._voltAccel=false;
            break;
        case"obsidian":    p.hp=hpFor(26,gs.level,0.75);  p.obsidian=true; p.armor=1; // [NERF] base 45→26, scale 1.3→0.75, armor 2→1
            p.setDisplaySize(78,64).setTint(0xFF88BB).setVelocityY(spd*0.4);
            p._reflect=true; // hasar yansitma
            break;
        default:         p.hp=hpFor(6,gs.level,0.35);  p.setDisplaySize(78,64).setVelocityY(spd); break;
    }

    if(gs.directorPhase==="chaos"&&Math.random()<0.18){p.hp=Math.ceil(p.hp*1.4);p.elite=true;p.setTint(0xffdd00);p._originalTint=0xffdd00;p.setDisplaySize(Math.round(p.displayWidth*1.1),Math.round(p.displayHeight*1.1));}

    // ── DIFFICULTY PHASES: EARLY / MID / LATE ──────────────────
    // Each phase increases elite spawn chance and HP multiplier independently of director phase
    const _diffMin = gs.t / 60000;
    const _diffPhase = _diffMin < 5 ? "early" : _diffMin < 12 ? "mid" : "late";
    gs._diffPhase = _diffPhase; // store for other systems

    // Time-based elite chance: 0% early, up to 25% mid, up to 50% late
    const _eliteChance =
        _diffPhase === "early" ? 0 :
        _diffPhase === "mid"   ? Math.min(0.25, (_diffMin - 5) * 0.036) :
        Math.min(0.50, 0.25 + (_diffMin - 12) * 0.030);

    if(!p.elite && !p.isBoss && !p._isMiniBoss && Math.random() < _eliteChance){
        p.elite = true;
        // Late phase elites are "forged" — 2x HP, red-gold tint, visibly larger
        const _hpMult = _diffPhase === "late" ? 2.0 : 1.5;
        p.hp = Math.ceil(p.hp * _hpMult);
        const _eliteTint = _diffPhase === "late" ? 0xFF9977 : 0xFFEE66; // bright candy elite tints
        p.setTint(_eliteTint);
        p._originalTint = _eliteTint;
        const _sizeScale = _diffPhase === "late" ? 1.20 : 1.10;
        p.setDisplaySize(Math.round(p.displayWidth*_sizeScale), Math.round(p.displayHeight*_sizeScale));
    }

    p.maxHP=p.hp;
    p.spawnProtected=true;
    p.setAlpha(0);
    S.tweens.add({targets:p,alpha:p.ghost?0.42:p.phantom?0.35:p.stealth?0.9:1,duration:320,ease:"Quad.easeOut"});
    S.time.delayedCall(380,()=>{ if(p.active){p.spawnProtected=false;} });
    // [FIX] Mermi gecis sorunu: pool'dan gelen sprite body'si eski pozisyonda kalabilir.
    // body.reset() body'yi sprite'in mevcut x/y konumuna hizalar.
    if(p.body) p.body.reset(p.x, p.y);
    p.body.enable=true;
    p.body.checkCollision.none=false;
    p.body.checkCollision.up=true;
    p.body.checkCollision.down=true;
    p.body.checkCollision.left=true;
    p.body.checkCollision.right=true;
    const isNewPyr=p.inferno||p.glacier||p.phantom_tri||p.volt||p.obsidian;
    if(p.elite&&isNewPyr){
        // setScale yerine setDisplaySize — scale tutarliligi
        p.setDisplaySize(Math.round(p.displayWidth*1.25), Math.round(p.displayHeight*1.25));
    }

    // ── HITBOX — tam genislik, kose gecisi kapali ────────────────
    // Pyramid sprite bir ucgen: tabanin koseleri tam kenarda durur.
    // Yatayi %94 daralttigimizda o koseler hitbox disina cikiyor → mermi geciyor.
    // Cozum: tam native genislik kullan, dikeyde hafif bosluk ver.
    if(type !== "zigzag"){
        const dw = p.displayWidth  > 4 ? p.displayWidth  : 78;
        const dh = p.displayHeight > 4 ? p.displayHeight : 64;
        const sx = p.scaleX > 0 ? p.scaleX : 1;
        const sy = p.scaleY > 0 ? p.scaleY : 1;
        const nw = dw / sx;
        const nh = dh / sy;
        const bw = nw;          // tam genislik — ucgen tabani koseleri dahil
        const bh = nh * 0.88;  // dikeyde %12 bosluk (tepedeki seffaf alan)
        p.body.setSize(bw, bh).setOffset(0, (nh - bh) * 0.5);
    }
    p.setCollideWorldBounds(false);
    // Spawn display boyutunu kaydet — break frame'de korunacak
    p._spawnDisplayW = p.displayWidth  > 4 ? p.displayWidth  : 78;
    p._spawnDisplayH = p.displayHeight > 4 ? p.displayHeight : 64;
    p._breakOffset = 0;
}

function spawnBoss(S){
    const gs=GS; if(gs.bossActive) return;
    const boss=S.pyramids.get(180,-80,"pyramid"); if(!boss) return;
    resetEF(boss);
    // [BALANCE FIX] Boss HP: reduced for better game feel
    // Early (<5min): -40%, Mid (<12min): -30%, Late: -20%
    const _bMin = gs.t / 60000;
    const _bTimeMult = _bMin < 5  ? 1.0
                     : _bMin < 10 ? 1.0 + (_bMin-5)*0.06
                     : 1.25 * Math.pow(1.05, _bMin-10);
    const _bBase = 55 + gs.level*3;
    const _rawHP = Math.ceil(Math.max(_bBase, _bBase * _bTimeMult * 0.60));
    const _hpReduction = _bMin < 5 ? 0.26 : _bMin < 12 ? 0.32 : 0.40; // [NERF] further reduced HP — was 0.35/0.42/0.52
    boss.hp = boss.maxHP = Math.ceil(_rawHP * _hpReduction);
    boss.type="boss"; boss.isBoss=true;
    boss.setScale(2.4).setTint(0xff0044).setVelocityY(50).setAlpha(0.7);
    // [FIX] Boss hitbox — scale 2.4x ile buyuk hitbox gerekir
    // Body boyutunu buyuk tutup offset ile ortaliyoruz
    try{
        if(boss.body){
            boss.body.enable = true;
            boss.body.checkCollision.none = false;
            boss.body.checkCollision.up = true;
            boss.body.checkCollision.down = true;
            boss.body.checkCollision.left = true;
            boss.body.checkCollision.right = true;
            // Texture ~78x64, scale 2.4x → Phaser auto-scales body
            // setSize uses source frame coords, Phaser multiplies by scale
            boss.body.setSize(76, 60).setOffset(1, 2);
        }
    }catch(e){console.warn("[NT] Boss hitbox fix:",e)}
    boss.spawnProtected=true; gs.bossActive=true;
    NT_SFX.setMusicState("boss", 2.5);
    S.time.delayedCall(1400,()=>{if(boss.active){boss.spawnProtected=false;boss.setAlpha(1);}});
}

// ── TICK ENEMIES ─────────────────────────────────────────────
function tickEnemies(S){
    const gs=GS; if(!gs||gs.gameOver) return;
    const dt=S.game.loop.delta;
    S.pyramids.children.iterate(p=>{
        if(!p||!p.active) return;
        // PIXEL-PERFECT: pozisyonu en yakin piksele yuvarla — subpixel jitter onle
        if(p.x !== undefined) p.x = Math.round(p.x);
        if(p.y !== undefined) p.y = Math.round(p.y);
        // Velocity de tam sayiya yuvarla — subpixel birikimi onle
        if(p.body){
            p.body.velocity.x = Math.round(p.body.velocity.x * 10) / 10;
            p.body.velocity.y = Math.round(p.body.velocity.y * 10) / 10;
        }
        if(p.type==="minion"){
            if(!p.body||!p.body.enable) return;
            p.setVelocityY(gs.pyramidSpeed*0.58);
            if(p.x<20||p.x>340) p.body.velocity.x*=-1;
            const pb=p.y+(p.displayHeight||40)*0.5;
            if(pb>=GROUND_Y&&!p.groundHit){
                p.groundHit=true;p.setVelocity(0,0);
                if(p._shadowGfx){try{p._shadowGfx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}p._shadowGfx=null;}
                NT_SFX.play("enemy_ground");
                try{if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.HapticFeedback){window.Telegram.WebApp.HapticFeedback.impactOccurred("light");}else if(navigator.vibrate){navigator.vibrate(8);}}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                killEnemy(S,p,false);
            }
            return;
        }
        if(!p.body||!p.body.enable) return;
        if(p.x<12){p.x=12;p.body.velocity.x=Math.abs(p.body.velocity.x)*0.5;}
        if(p.x>348){p.x=348;p.body.velocity.x=-Math.abs(p.body.velocity.x)*0.5;}
        if(p.frozen){
            // [FREEZE BUG FIX] Frozen dusman her frame'de hiz sifirlanir
            // Onceden sadece return yapiliyordu — dusman yine de hareket ediyordu
            if(p.body){p.body.velocity.set(0,0);}
            return;
        }

        if(p.spinner){
            // Slow irregular wobble — alive, not glitchy fast spin
            if(p._spinPhase===undefined){ p._spinPhase=Math.random()*Math.PI*2; p._spinFreq=0.0018+Math.random()*0.0008; }
            p._spinPhase=(p._spinPhase||0)+dt*p._spinFreq;
            const _swobble=Math.sin(p._spinPhase)*25 + Math.sin(p._spinPhase*2.3)*8;
            try{p.setAngle(_swobble);}catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }
        // Shadow ve titan: yavasca kendi ekseninde doner
        if((p.shadow||p.titan)&&!p.spawnProtected){
            p._spinAngle=(p._spinAngle||0)+dt*0.08;
            try{p.setAngle(p._spinAngle % 360);}catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }

        // Minimum hiz
        if(!p.groundHit&&!p.spawnProtected){
            if(p.isBoss){
                // Boss: [NERF] yavas ve gorkemli dussun — max 42px/s (was 65)
                const bossMaxSpeed = Math.min(gs.pyramidSpeed * 0.25, 42);
                if(p.body.velocity.y > bossMaxSpeed) p.setVelocityY(bossMaxSpeed);
                else if(p.body.velocity.y < bossMaxSpeed * 0.5) p.setVelocityY(bossMaxSpeed);
            } else if(p.body.velocity.y<gs.pyramidSpeed*0.4) p.setVelocityY(gs.pyramidSpeed);
            // ── PHYSICAL MOTION: sway + wobble rotation ──────────
            if(p.type!=="kamikaze"&&p.type!=="zigzag"&&p.type!=="titan"&&p.type!=="colossus"&&p.type!=="volt"){
                if(p._windPhase===undefined){ p._windPhase=Math.random()*Math.PI*2; p._wobblePhase=Math.random()*Math.PI*2; }
                // [MOBILE PERF] Lateral sway mobilede skip — Math.sin + Linear her frame pahali
                if(!_IS_MOBILE_EARLY){
                    const sway=Math.sin(gs.t*0.0018+p._windPhase)*8;
                    p.body.velocity.x=Phaser.Math.Linear(p.body.velocity.x,sway,0.04);
                }

                // ── JELLY ANGLE: damped spring oscillation after hit ──
                // [MOBILE PERF] mobilede jelly spring ve wobble devre disi — her frame setAngle pahali
                if(!_IS_MOBILE_EARLY && p._jellyActive){
                    // Spring physics: vel += -stiffness*angle; angle += vel; vel *= damping
                    // At 60fps, damping=0.88 means ~50% energy after 5 frames (~83ms) — visible oscillation
                    // stiffness=0.12 gives ~3 oscillations before dying out (~400ms total)
                    const _stiffness = 0.12;
                    const _damping   = 0.88; // was 0.72 — much slower decay

                    p._jellyVel   = (p._jellyVel   || 0);
                    p._jellyAngle = (p._jellyAngle  || 0);
                    p._jellyVel  += -_stiffness * p._jellyAngle;
                    p._jellyAngle += p._jellyVel;
                    p._jellyVel  *= _damping;

                    // Stop when motion is imperceptible
                    if(Math.abs(p._jellyAngle) < 0.15 && Math.abs(p._jellyVel) < 0.10){
                        p._jellyActive = false;
                        p._jellyAngle  = 0;
                        p._jellyVel    = 0;
                    }

                    if(p.type!=="spinner"&&p.type!=="inferno"){
                        try{ p.setAngle(p._jellyAngle); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
                    }
                } else if(!_IS_MOBILE_EARLY && p.type!=="spinner"&&p.type!=="inferno"){
                    // Normal wobble when not in jelly spring
                    p._wobblePhase=(p._wobblePhase||0)+dt*0.0022;
                    const wobbleAng=Math.sin(p._wobblePhase)*3.5;
                    if(!p._staggering) try{ p.setAngle(wobbleAng); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
                }
            }

            // ── ENTRY SQUASH — newly spawned enemies squash-stretch into view ──
            if(!p._entryDone && p.y > 20 && p.y < 120){
                p._entryDone = true;
                try{
                    S.tweens.add({targets:p, scaleX:p.scaleX*1.15, scaleY:p.scaleY*0.88,
                        duration:80, yoyo:true, ease:"Quad.easeOut"});
                }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            }

            // ── FALL SPEED LINES — ince beyaz hiz cizgileri ──────
            p._fallEffT=(p._fallEffT||0)+dt;
            const fallSpd=p.body.velocity.y;
            if(fallSpd>100&&p._fallEffT>0.09&&!p.spawnProtected){
                p._fallEffT=0;
                const streakCount=fallSpd>180?2:1;
                for(let _si=0;_si<streakCount;_si++){
                    const _sx=p.x+Phaser.Math.Between(-Math.floor((p.displayWidth||30)*0.3),Math.floor((p.displayWidth||30)*0.3));
                    const _sy=p.y-(p.displayHeight||36)*0.25;
                    const _slen=Phaser.Math.Between(6,12+Math.floor(fallSpd*0.04));
                    const _sg=S.add.graphics().setDepth(11);
                    _sg.lineStyle(1,0xffffff,0.18+Math.random()*0.12);
                    _sg.lineBetween(_sx,_sy,_sx,_sy-_slen);
                    S.tweens.add({targets:_sg,alpha:0,duration:Phaser.Math.Between(60,110),
                        ease:"Quad.easeOut",onComplete:()=>{try{_sg.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
                }
            } else if(fallSpd<=100){
                p._fallEffT=0;
            }
        }

        if(p.zigzag){p.zigTimer=(p.zigTimer||0)+dt;if(p.zigTimer>500){p.body.velocity.x*=-1;p.zigTimer=0;}p.body.velocity.x=Phaser.Math.Clamp(p.body.velocity.x,-90,90);}
        if(p.kamikaze){const dx=S.player.x-p.x;p.setVelocityX(Phaser.Math.Clamp(dx*0.5,-170,170));}

        // Golge
        if(!p.groundHit&&!p.spawnProtected&&p.y>100){
            const shadowAlpha=Math.min(0.18,(p.y-100)/300*0.18);
            const shadowW=p.displayWidth*0.72;
            if(!p._shadowGfx){p._shadowGfx=S.add.graphics().setDepth(4);p._shadowLastX=-9999;}
            if(Math.abs(p.x-p._shadowLastX)>1.5){p._shadowLastX=p.x;p._shadowGfx.clear();p._shadowGfx.fillStyle(0x000000,shadowAlpha);p._shadowGfx.fillEllipse(p.x,GROUND_Y-3,shadowW,shadowW*0.18);}
        }

        // Ozel AI davranislar — ayni mantik
        if(p.stealth&&!p.spawnProtected){p.stealthTimer=(p.stealthTimer||0)+dt;if(p.stealthTimer>2200){p.stealthTimer=0;p.setAlpha(p.alpha>0.3?0.08:0.9);}}
        if(p.healer){p.healTimer=(p.healTimer||0)+dt;if(p.healTimer>1800){p.healTimer=0;S._activeEnemies&&S._activeEnemies.forEach(e=>{if(e!==p&&e.active&&e.hp<e.maxHP){const dx=p.x-e.x,dy=p.y-e.y;if(dx*dx+dy*dy<80*80)e.hp=Math.min(e.maxHP,e.hp+1);}});}}
        if(p.magnetEnemy&&!p.spawnProtected){p._magT=(p._magT||0)+dt;if(p._magT>50){p._magT=0;S.bullets.children.each(b=>{if(!b.active)return;const dx=p.x-b.x,dy=p.y-b.y,d=Math.sqrt(dx*dx+dy*dy);if(d<55&&d>2){b.body.velocity.x+=dx/d*15;b.body.velocity.y+=dy/d*15;}});}}
        if(p.berserker&&p.hp<p.maxHP){const rage=1+(1-p.hp/p.maxHP)*1.5;if(p.body.velocity.y<gs.pyramidSpeed*rage)p.setVelocityY(gs.pyramidSpeed*rage);}
        if(p.absorber){p.absorbTimer=(p.absorbTimer||0)+dt;p.armor=(p.absorbTimer%2200)<900?3:0;}
        if(p.freezerEnemy){p.freezeTimer=(p.freezeTimer||0)+dt;if(p.freezeTimer>2400){p.freezeTimer=0;S._activeEnemies&&S._activeEnemies.forEach(e=>{if(e!==p&&e.active&&!e.frozen){const dx=p.x-e.x,dy=p.y-e.y;if(dx*dx+dy*dy<70*70&&Math.random()<0.25)freezeEnemy(S,e);}});}}
        if(p.leech){const dx2=S.player.x-p.x;p.body.velocity.x=Phaser.Math.Linear(p.body.velocity.x,dx2*0.28,-0.04);}
        if(p.phantom){p.phaseTimer=(p.phaseTimer||0)+dt;if(p.phaseTimer>3000){p.phaseTimer=0;p.setAlpha(0.05);p.body.enable=false;S.time.delayedCall(500,()=>{if(p.active){p.body.enable=true;p.body.checkCollision.none=false;p.x=Phaser.Math.Between(30,330);p.setAlpha(0.35);}});}}
        if(p.rusher&&!p.rushing){p.rushTimer=(p.rushTimer||0)+dt;if(p.rushTimer>2000){p.rushing=true;p.rushTimer=0;p.setVelocityY(gs.pyramidSpeed*3.2);S.time.delayedCall(380,()=>{if(p.active){p.rushing=false;p.setVelocityY(gs.pyramidSpeed*0.5);}});}}
        if(p.vortex&&!p.spawnProtected){p._vortT=(p._vortT||0)+dt;if(p._vortT>50){p._vortT=0;S.bullets.children.each(b=>{if(!b.active)return;const dx=p.x-b.x,dy=p.y-b.y,d=Math.sqrt(dx*dx+dy*dy);if(d<65&&d>2){b.body.velocity.x+=dx/d*22;b.body.velocity.y+=dy/d*22;}});}}

        // ── YENI PIRAMIT OZEL DAVRANISLARI ──────────────────────
        // pyramid3: Kozmik/Rainbow — hue-shift tint dongusu (performant: her 120ms guncelle)
        // Volt: zigzag + periyodik hizlanma
        if(p.volt&&!p.spawnProtected){
            p._voltPhase=(p._voltPhase||0)+dt*0.004;
            // [MOBILE PERF] mobilede her 2 frame'de bir guncelle
            if(!_IS_MOBILE_EARLY||!(p._voltSkip=!p._voltSkip)){
                try{p.body.velocity.x=Math.sin(p._voltPhase)*90;}catch(e){console.warn("[NT] Hata yutuldu:",e)}
            }
            if(Math.random()<0.004){try{p.setVelocityY(Math.min((p.body.velocity.y||0)*1.18,GS.pyramidSpeed*1.5));}catch(e){console.warn("[NT] Hata yutuldu:",e)}}
        }
        // Inferno: kendi ekseninde yavas, sabit 360 donus
        if(p.inferno&&!p.spawnProtected){
            p._spinAngle = (p._spinAngle||0) + dt * p._spinRate * (p.elite?1.3:1);
            // Aciyi 0-360 arasinda tut, setAngle ile uygula
            try{ p.setAngle(p._spinAngle % 360); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }
        // Obsidian: nabiz atan karanlik aura
        if(p.obsidian&&!p.spawnProtected&&!p.frozen){
            p._pulseT=(p._pulseT||0)+dt;
            const pulse=0.75+Math.sin(p._pulseT*0.003)*0.2;
            try{if(!p._staggering)p.setAlpha(pulse);}catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }
        // Glacier: buz parcacigi efekti
        if(p.glacier&&!p.spawnProtected&&!_IS_MOBILE_EARLY&&Math.random()<0.003){
            const fg=S.add.graphics().setDepth(5);
            fg.x=p.x+Phaser.Math.Between(-12,12); fg.y=p.y+Phaser.Math.Between(-8,8);
            fg.lineStyle(1,0x88ddff,0.55); fg.lineBetween(0,0,Phaser.Math.Between(-6,6),Phaser.Math.Between(-6,6));
            S.tweens.add({targets:fg,alpha:0,y:fg.y+10,duration:400,onComplete:()=>fg.destroy()});
        }
        if(p.spiker){p.spikeTimer=(p.spikeTimer||0)+dt;if(p.spikeTimer>2800){p.spikeTimer=0;
            const spike=S.add.graphics().setDepth(7);spike.fillStyle(0xffcc00,0.9);spike.fillTriangle(p.x,p.y+5,p.x-4,p.y+18,p.x+4,p.y+18);
            S.tweens.add({targets:spike,y:spike.y+55,alpha:0,duration:750,onComplete:()=>spike.destroy()});
            // Spike oyuncuya 60px icindeyse hasar ver
            if(S.player&&S.player.active){const _sdx=S.player.x-p.x,_sdy=S.player.y-p.y;if(_sdx*_sdx+_sdy*_sdy<60*60) damagePlayer(S);}
        }}
        if(p.toxic){p.toxTimer=(p.toxTimer||0)+dt;if(p.toxTimer>1400){p.toxTimer=0;const tox=S.add.circle(p.x,p.y,14,0x66ff00,0.15).setDepth(6);S.tweens.add({targets:tox,scaleX:2.8,scaleY:2.8,alpha:0,duration:900,onComplete:()=>tox.destroy()});const ddx=S.player.x-p.x,ddy=S.player.y-p.y;if(ddx*ddx+ddy*ddy<55*55)damagePlayer(S);}}
        // Chain — yakin dusmanlara simsek caktirir
        // [BUG FIX] _activeEnemies null guard tutarli hale getirildi (healer/freezerEnemy ile ayni pattern)
        if(p.chain&&!p.spawnProtected){p._chainT=(p._chainT||0)+dt;if(p._chainT>1800){p._chainT=0;
            const _chainList=S._activeEnemies||[];
            _chainList.forEach(e=>{if(e===p||!e.active)return;const dx=e.x-p.x,dy=e.y-p.y;if(dx*dx+dy*dy<70*70){
                const lg=S.add.graphics().setDepth(18);lg.lineStyle(1,0x4488ff,0.8);lg.lineBetween(p.x,p.y,e.x,e.y);
                S.tweens.add({targets:lg,alpha:0,duration:150,onComplete:()=>lg.destroy()});
                // Zincir: bagli dusmana gecici zirh (+1 armor 1.5s)
                if(!e.isBoss&&!e._chainShielded){e._chainShielded=true;e.armor=(e.armor||0)+1;
                    S.time.delayedCall(1500,()=>{if(e&&e.active){e.armor=Math.max(0,e.armor-1);e._chainShielded=false;}});}
            }});
        }}
        // Bomber — zemine yakinken patlama
        // [OPT] getMatching → _activeEnemies cache
        if(p.bomber&&!p.spawnProtected){const distG=GROUND_Y-p.y;if(distG<80&&!p._exploding){p._exploding=true;
            const bx=p.x, by=p.y;
            // 1. Shockwave halkasi — 2 katman (flash dairesi kaldirildi)
            for(let ri=0;ri<2;ri++){
                const bRing=S.add.graphics().setDepth(22);
                bRing.lineStyle(ri===0?3:1.5,ri===0?0xff4400:0xffcc00,ri===0?0.85:0.55);
                bRing.strokeCircle(bx,by,8+ri*6);
                S.tweens.add({targets:bRing,scaleX:ri===0?4.5:6,scaleY:ri===0?4.5:6,alpha:0,
                    duration:260+ri*70,ease:"Quad.easeOut",delay:ri*35,
                    onComplete:()=>bRing.destroy()});
            }
            // 2. Ates parcaciklari — 16→8 adet
            for(let i=0;i<8;i++){
                const ang=Phaser.Math.DegToRad(i*45+Phaser.Math.Between(-10,10));
                const spd=Phaser.Math.Between(40,100);
                const sz=Phaser.Math.Between(2,5);
                const col=[0xff3300,0xff6600,0xff9900,0xffcc00][Math.floor(Math.random()*4)];
                const bp=S.add.graphics().setDepth(21);
                bp.fillStyle(col,0.85); bp.fillRect(-sz/2,-sz/2,sz,sz);
                bp.x=bx; bp.y=by;
                S.tweens.add({targets:bp,
                    x:bx+Math.cos(ang)*spd,y:by+Math.sin(ang)*spd*0.65,
                    alpha:0,scaleX:0.15,scaleY:0.15,
                    duration:Phaser.Math.Between(250,420),ease:"Quad.easeOut",
                    onComplete:()=>bp.destroy()});
            }
            // 3. Duman — 3 adet
            for(let i=0;i<3;i++){
                const sang=Phaser.Math.DegToRad(i*120+Phaser.Math.Between(-20,20));
                const sm=S.add.graphics().setDepth(19);
                sm.fillStyle(0x442211,0.30+Math.random()*0.15);
                sm.fillCircle(0,0,Phaser.Math.Between(6,12));
                sm.x=bx+Math.cos(sang)*Phaser.Math.Between(6,18);
                sm.y=by+Math.sin(sang)*Phaser.Math.Between(6,18);
                S.tweens.add({targets:sm,y:sm.y-Phaser.Math.Between(15,32),
                    scaleX:1.8,scaleY:1.8,alpha:0,
                    duration:Phaser.Math.Between(420,700),ease:"Quad.easeOut",
                    delay:i*25,onComplete:()=>sm.destroy()});
            }
            // 4. Kivilcim — 6 adet
            for(let i=0;i<6;i++){
                S.time.delayedCall(i*20,()=>{
                    const sp=S.add.graphics().setDepth(22);
                    sp.fillStyle(0xffee44,0.9); sp.fillRect(-1,-1,2,3+Math.random()*3);
                    sp.x=bx+Phaser.Math.Between(-16,16); sp.y=by+Phaser.Math.Between(-16,16);
                    const sang2=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
                    S.tweens.add({targets:sp,
                        x:sp.x+Math.cos(sang2)*Phaser.Math.Between(20,55),
                        y:sp.y+Math.sin(sang2)*Phaser.Math.Between(16,45),
                        alpha:0,duration:Phaser.Math.Between(280,480),
                        ease:"Quad.easeOut",onComplete:()=>sp.destroy()});
                });
            }
            // Hasar + kamera (shake wrapper cap'liyor)
            const _bombList=S._activeEnemies||[];_bombList.forEach(e=>{const dx=e.x-bx,dy=e.y-by;if(dx*dx+dy*dy<75*75&&e!==p)applyDmg(S,e,GS.damage*1.4,false);});
            const dx2=S.player.x-bx,dy2=S.player.y-by;if(dx2*dx2+dy2*dy2<70*70)damagePlayer(S);
            S.cameras.main.shake(60,0.008);}}

        // Zemine carpma — sadece asagi giderken tetikle (miknatis sicramasi onlenir)
        // Display boyutu 64px → _halfH = 64 * scaleY * 0.5 = 32 * scaleY
        const _halfH = p.scaleY > 0 ? (64 * p.scaleY * 0.5) : 32;
        const pBase  = p.y + _halfH;
        const _movingDown = !p.body || p.body.velocity.y >= -5; // yukari gidiyorsa tetikleme
        if(pBase >= GROUND_Y && !p.groundHit && _movingDown){
            p.groundHit=true;
            p.y=GROUND_Y - _halfH;
            p.setVelocity(0,0);
            if(p.body){p.body.velocity.x=0;p.body.velocity.y=0;}
            NT_SFX.play("enemy_ground");
            // GROUND IMPACT SQUASH — flatten on Y, expand on X, then snap
            try{
                const _gsx = p.scaleX||1, _gsy = p.scaleY||1;
                S.tweens.add({targets:p, scaleX:_gsx*1.30, scaleY:_gsy*0.60,
                    duration:55, ease:"Quad.easeOut",
                    onComplete:()=>{ if(p.active) S.tweens.add({targets:p, scaleX:_gsx, scaleY:_gsy, duration:80, ease:"Back.easeOut"}); }
                });
            }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            const _typeCol={normal:0xFF88CC,fast:0xFF6699,tank:0xAA55FF,shield:0x55BBFF,
                kamikaze:0xFFBB55,ghost:0xDDBBFF,elder:0xFFCC44,titan:0xDD55FF,
                colossus:0xFF66AA,inferno:0xFF9977,glacier:0x66DDFF,
                phantom_tri:0xFF55FF,volt:0xFFFF66,obsidian:0xCC77FF};
            doExplodeVFX(S, p.x, GROUND_Y-8, _typeCol[p.type]||0xffcc55, p.scaleX||1);
            playerCollisionExplosion(S, p.x, GROUND_Y-8, p.type);
        NT_SFX.play("pixel_explode");
            // Komik mesaj — showHitTxt gibi animasyonlu
            try{
                const _gm=_nextGroundMsg();
                const _gx=Phaser.Math.Clamp(p.x,40,320);
                showHitTxt(S,_gx,GROUND_Y-55,_gm,"#ff4466",true);
            }catch(_){}
            try{
                if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.HapticFeedback){
                    window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
                } else if(navigator.vibrate){
                    navigator.vibrate(p.obsidian||p.titan||p.colossus?18:p.elder||p.tank?12:8);
                }
            }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            const _shakeStr=p.obsidian?0.018:p.volt?0.010:p.glacier?0.012:p.inferno?0.013:p.phantom_tri?0.008:p.titan||p.colossus?0.022:p.elder||p.tank?0.012:0.007;
            S.cameras.main.shake(150,_shakeStr);
            const _preMF=gs._microFreeze; gs._microFreeze=true;
            damagePlayer(S);
            gs._microFreeze=_preMF;
            p._groundKill=true;
            killEnemy(S,p,false);
        }
    });
}

// ── HASAR + BREAK ─────────────────────────────────────────────
function applyDmg(S,enemy,rawDmg,isCrit,hitDir){
    if(!enemy||!enemy.active||!S) return;
    const gs=GS; if(!gs||gs.gameOver) return;
    if(!enemy.active||enemy.lock) return;
    // hitDir: +1 = saga it (mermi soldan geldi), -1 = sola it (mermi sagdan geldi)
    const _hitDir = hitDir || (Math.random()<0.5 ? 1 : -1);
    let dmg=rawDmg, crit=isCrit;
    if(!crit&&Math.random()<gs.critChance){dmg*=gs.critMult;crit=true;}
    // ★ YENI: Cryo Shatter sinerjisi — donmus dusmana otomatik kritik
    if(gs._synergyCryoShatter&&enemy.frozen&&!crit){crit=true;dmg*=gs.critMult;}
    // [v10.x REDESIGN] Storm Core evo — crit vurdugunda lightning zinciri tetikle
    // Ham hasar bonus yerine kimlik efekti: crit = firtina baslatir
    if(crit && gs._evoStormCore && S && !gs._stormCoreCooldown){
        gs._stormCoreCooldown = true;
        S.time.delayedCall(9000, ()=>{ if(GS) GS._stormCoreCooldown = false; }); // was 6s → 9s CD
        S.time.delayedCall(40, ()=>{ if(!GS||GS.gameOver) return; doLightning(S); });
    }
    // ★ YENI: Relic damage bonus uygula
    // Evolution bonus is handled entirely in calcStats/syncStatsFromPipeline — do NOT apply again here
    // Mini boss icin armor yuzdesel azaltma — flat cikarma degil
    // Normal dusmanlar: flat (armor 1-4 anlamli), mini boss: %20 per armor point (max %48 azaltma)
    if(enemy._isMiniBoss){
        const reduction=Math.min(0.32, enemy.armor*0.08); // [BALANCE] armor 4 → %32 max azaltma
        dmg=Math.max(0.5, dmg*(1-reduction));
    } else {
        dmg=Math.max(0.5,dmg-enemy.armor);
    }
    // [v11] KNOCKBACK — hasarla olceklendirildi + yuksek knockback'te kisa stun
    if(gs.knockback>0&&!enemy.frozen&&enemy.body&&enemy.body.enable){ // [CRASH FIX] body.enable kontrolu
        const kbF = gs.knockback * 80 + dmg * 18;
        enemy.body.velocity.y=Math.max(-kbF, enemy.body.velocity.y - kbF);
        enemy.body.velocity.x = Phaser.Math.Linear(enemy.body.velocity.x, _hitDir * kbF * 0.4, 0.5);
        if(dmg > gs.damage * 1.5 && !enemy._stunned){
            enemy._stunned = true;
            const _sv = {x: enemy.body.velocity.x, y: enemy.body.velocity.y};
            enemy.body.velocity.set(0, 0);
            S.time.delayedCall(200, ()=>{
                if(enemy && enemy.active && enemy._stunned){
                    enemy._stunned = false;
                    if(enemy.body) enemy.body.velocity.set(_sv.x, _sv.y);
                }
            });
        }
    }
    enemy.hp-=dmg;
    showDmgNum(S,enemy.x,enemy.y-10,Math.round(dmg*10)/10,crit);

    // Hit flash + partikuller → spawnHitDebris + jelly blogu asagida

    // ── HIT STOP + MICRO SLOW-MO ─────────────────────────────────
    // Crit: 45ms full physics pause + timeScale dip to 0.78 for 90ms
    // Normal: 12ms physics pause only (weight without slow-mo)
    // Kill: handled below in enemy.hp<=0 block
    const _now=Date.now();
    const _canFreeze = !_IS_MOBILE_EARLY && !gs._microFreeze && !gs.pickingUpgrade && _upgradeLock===0; // [MOBILE PERF] mobilede physics.pause devre disi

    if(crit && _canFreeze && (!gs._lastMicroFreeze || _now-gs._lastMicroFreeze > 500)){
        gs._microFreeze=true;
        gs._lastMicroFreeze=_now;
        S.physics.pause();
        try{ S.time.timeScale = 0.78; }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        // Physics resumes after 45ms — enemies frozen for that window
        S.time.delayedCall(45,()=>{
            if(!gs.gameOver&&!gs.pickingUpgrade&&_upgradeLock===0) S.physics.resume();
            gs._microFreeze=false;
        });
        // timeScale ramps back to 1.0 after 90ms (real time via setTimeout to avoid timeScale scaling)
        setTimeout(()=>{ if(!gs?.gameOver&&!gs?.pickingUpgrade) try{ S.time.timeScale=1.0; }catch(e){console.warn("[NT] Hata yutuldu:",e)} }, 90);
    } else if(!crit && _canFreeze && enemy.active && (!gs._lastNormalFreeze || _now-gs._lastNormalFreeze > 80)){
        // Normal hit: tiny 12ms physics micro-pause — adds weight without slow-mo
        gs._lastNormalFreeze = _now;
        gs._microFreeze = true;
        S.physics.pause();
        setTimeout(()=>{
            if(!gs?.gameOver&&!gs?.pickingUpgrade&&_upgradeLock===0) try{ S.physics.resume(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            if(gs) gs._microFreeze = false;
        }, 12);
    }

    // ── BREAK FRAME ──
    if(enemy.type!=="minion"&&!enemy._isMiniBoss&&enemy.active){ // miniboss kendi hasar efektine sahip
        const r=enemy.hp/enemy.maxHP;

        // Dusman tipine gore break texture ve boyut parametreleri
        const isZigzag = enemy.type==="zigzag";
        const breakTex = isZigzag ? "zigzag_break" : "pyramid_break";

        // Zigzag: native 134x113, break frame native 133x115, display 59x48
        // Pyramid: native 183x112, break frame native 183x112, display spawnW x spawnH
        let BREAK_SIZES, BREAK_OFFSETS, _breakFrameW, _breakFrameH;

        if(isZigzag){
            // zigzag_break: 532x115, 3 frame, frameWidth=177
            // Icerik analizi: frame0 cx=67, frame1 cx=87(+20), frame2 cx=108(+41)
            // zigzag.png cx=66 — frame0 ile neredeyse ayni (referans)
            // Display scale = 59/177 = 0.333
            // Frame1 kayma: 20*0.333=6.7 → 7px sola kaydir
            // Frame2 kayma: 41*0.333=13.7 → 14px sola kaydir
            BREAK_SIZES   = [[59,48],[59,48],[59,48]];
            BREAK_OFFSETS = [0, -7, -14];
            _breakFrameW  = 177;
            _breakFrameH  = 115;
        } else {
            const _spawnW = enemy._spawnDisplayW || 78;
            const _spawnH = enemy._spawnDisplayH || 64;
            const _scaleF = _spawnW / 78;
            BREAK_SIZES   = [
                [Math.round(106*_scaleF), Math.round(65*_scaleF)],
                [Math.round(105*_scaleF), Math.round(64*_scaleF)],
                [Math.round(105*_scaleF), Math.round(64*_scaleF)]
            ];
            BREAK_OFFSETS = [6.35*_scaleF, 0.85*_scaleF, -6.60*_scaleF];
            _breakFrameW  = 183;
            _breakFrameH  = 112;
        }

        const _applyBreakDisplay=(frameIdx)=>{
            const _px = enemy.x, _py = enemy.y;
            const prevOffset = enemy._breakOffset || 0;
            const newOffset  = BREAK_OFFSETS[frameIdx];
            const cleanX = _px - prevOffset;
            enemy._breakOffset = newOffset;

            const [dw, dh] = BREAK_SIZES[frameIdx];
            enemy.setDisplaySize(dw, dh);
            enemy.x = Math.round(cleanX + newOffset);
            enemy.y = Math.round(_py);

            if(enemy.body&&enemy.body.enable&&enemy.active){ // [CRASH FIX] body devre disiysa reset yapma
                enemy.body.reset(enemy.x, enemy.y);
                enemy.body.checkCollision.none=false;
                // Break frame'de de tam genislik — daraltma yapmiyoruz
                const _bw = _breakFrameW;
                const _bh = _breakFrameH * 0.88;
                const _ox = 0;
                const _oy = (_breakFrameH - _bh) * 0.5;
                enemy.body.setSize(_bw, _bh).setOffset(_ox, _oy);
            }
        };

        try{
            if(r<=0.75&&r>0.50&&enemy._breakFrame!==0){
                enemy._breakFrame=0;
                if(S.textures.exists(breakTex)){
                    enemy.setTexture(breakTex,0);
                    _applyBreakDisplay(0);
                    if(S._applyIconLinear) S._applyIconLinear();
                }
            } else if(r<=0.50&&r>0.25&&enemy._breakFrame!==1){
                enemy._breakFrame=1;
                if(S.textures.exists(breakTex)){
                    enemy.setTexture(breakTex,1);
                    _applyBreakDisplay(1);
                    if(S._applyIconLinear) S._applyIconLinear();
                }
                S.cameras.main.shake(10,0.0015);
            } else if(r<=0.25&&r>0&&enemy._breakFrame!==2){
                enemy._breakFrame=2;
                if(S.textures.exists(breakTex)){
                    enemy.setTexture(breakTex,2);
                    _applyBreakDisplay(2);
                    if(S._applyIconLinear) S._applyIconLinear();
                }
                S.cameras.main.shake(14,0.002);
            }
        }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    }
    spawnHitDebris(S,enemy.x,enemy.y-enemy.displayHeight*0.4,enemy.type,crit);

    // ── JELLY HIT FEEL — visible elastic squash/stretch + damped spring ──
    if(enemy.active && enemy.body && !enemy.frozen && !enemy._staggering){
        enemy._staggering = true;

        // Small elastic pushback in hit direction
        const _pushX = _hitDir * (crit ? 22 : 12);
        const _pushY = crit ? -8 : -3;
        if(enemy.body && enemy.body.enable){
            enemy.body.velocity.x = Phaser.Math.Linear(enemy.body.velocity.x, _pushX, 0.35);
            enemy.body.velocity.y = Math.min(enemy.body.velocity.y, _pushY);
        }

        // Capture rest scale and position
        const _rx = enemy.scaleX || 1;
        const _ry = enemy.scaleY || 1;
        const _origX = enemy.x;

        // Helper: recalculate body size to match current visual scale
        // Arcade body size is in UNSCALED pixels — must divide by current scale
        // Without this, bullet collision shrinks while the enemy visually grows during squash
        const _resyncBody = (e) => {
            if(!e.active||!e.body) return;
            const _sx = e.scaleX||1, _sy = e.scaleY||1;
            const _dw = e._spawnDisplayW || 78;
            const _dh = e._spawnDisplayH || 64;
            const _nw = _dw / _sx;
            const _nh = _dh / _sy;
            const _bw = _nw * 0.85;
            const _bh = _nh * 0.78;
            try{ e.body.setSize(_bw, _bh).setOffset((_nw-_bw)*0.5, (_nh-_bh)*0.5); }catch(err){}
        };

        // Squash amounts — bigger so they're actually readable
        // Normal: 18% wider, 18% shorter. Crit: 26% wider, 26% shorter.
        const _sqX = crit ? 1.26 : 1.18;
        const _sqY = crit ? 0.74 : 0.82;
        // Overshoot in opposite direction
        const _osX = crit ? 0.88 : 0.92;
        const _osY = crit ? 1.14 : 1.09;

        try{
            if(_IS_MOBILE_EARLY){
                // [MOBILE PERF] Mobilede 3 phase yerine tek hizli squash+settle — 3 tween → 1 tween
                S.tweens.add({
                    targets: enemy,
                    scaleX: _rx * _sqX, scaleY: _ry * _sqY,
                    duration: 55, ease: "Quad.easeOut",
                    yoyo: true, hold: 18,
                    onComplete: ()=>{
                        if(enemy.active){ enemy.scaleX=_rx; enemy.scaleY=_ry; }
                        enemy._staggering = false;
                    }
                });
            } else {
            // Phase 1 — IMPACT SQUASH: fast flatten (55ms)
            S.tweens.add({
                targets: enemy,
                scaleX: _rx * _sqX,
                scaleY: _ry * _sqY,
                duration: 55,
                ease: "Quad.easeOut",
                onComplete: ()=>{
                    if(!enemy.active) return;
                    _resyncBody(enemy); // keep hitbox aligned during squash
                    // Hold at peak squash 18ms — let it register
                    S.time.delayedCall(18, ()=>{
                        if(!enemy.active) return;
                        // Phase 2 — OVERSHOOT STRETCH (90ms)
                        S.tweens.add({
                            targets: enemy,
                            scaleX: _rx * _osX,
                            scaleY: _ry * _osY,
                            duration: 90,
                            ease: "Sine.easeOut",
                            onComplete: ()=>{
                                if(!enemy.active) return;
                                _resyncBody(enemy); // keep hitbox aligned during stretch
                                // Phase 3 — ELASTIC SETTLE (200ms, Back.easeOut strength 2.5 for visible overshoot)
                                S.tweens.add({
                                    targets: enemy,
                                    scaleX: _rx,
                                    scaleY: _ry,
                                    duration: 200,
                                    ease: "Back.easeOut",
                                    easeParams: [2.5],
                                    onComplete: ()=>{
                                        if(enemy.active){
                                            enemy.scaleX=_rx; enemy.scaleY=_ry;
                                            _resyncBody(enemy); // restore original body
                                        }
                                    }
                                });
                            }
                        });
                    });
                }
            });

            // Position micro-wobble — repeat:1 so it ends exactly at _origX (not +offset)
            const _wDist = crit ? 3 : 1.5;
            S.tweens.add({
                targets: enemy,
                x: _origX + _hitDir * _wDist,
                duration: 35,
                ease: "Quad.easeOut",
                yoyo: true,
                repeat: 1,
                onComplete: ()=>{ if(enemy.active) enemy.x = _origX; }
            });
            } // end desktop jelly
        }catch(e){console.warn("[NT] Hata yutuldu:",e)}

        // Jelly angle spring — larger impulse so wobble is visible
        if(!_IS_MOBILE_EARLY){ // [MOBILE PERF] jelly angle spring desktop only
        const _impulse = _hitDir * (crit ? 12 : 6);
        enemy._jellyAngle  = (enemy._jellyAngle || 0) + _impulse;
        enemy._jellyVel    = _impulse * 0.85;
        enemy._jellyActive = true;
        }

        // Release staggering after all phases (~360ms total)
        // [MOBILE PERF] mobilede tween onComplete icinde yapiliyor, burasi sadece desktop icin
        if(!_IS_MOBILE_EARLY){
        S.time.delayedCall(crit ? 360 : 300, ()=>{
            if(enemy.active) enemy._staggering = false;
        });
        }
    }

    // ── HIT PARTICLES — color-matched sparks ─────────────────
    if(enemy.active && _dmgNumCount < MAX_DMG_NUMS){
        const _hcol = enemy._originalTint || 0xffffff;
        const _pcount = _IS_MOBILE_EARLY ? (crit ? 2 : 0) : (crit ? 5 : 2); // [MOBILE PERF] mobilede cok az parcacik
        for(let _pi=0;_pi<_pcount;_pi++){
            const _pa = Phaser.Math.DegToRad(Phaser.Math.Between(200,340));
            const _ps = Phaser.Math.Between(crit?30:15, crit?65:35);
            const _pg = S.add.graphics().setDepth(23);
            _pg.x = enemy.x + Phaser.Math.Between(-6,6);
            _pg.y = enemy.y + Phaser.Math.Between(-6,6);
            _pg.fillStyle(_pi===0?0xffffff:_hcol, 0.85);
            _pg.fillRect(-1,-2,2, Phaser.Math.Between(3,6));
            S.tweens.add({targets:_pg,
                x: _pg.x + Math.cos(_pa)*_ps,
                y: _pg.y + Math.sin(_pa)*_ps*0.7,
                angle: Phaser.Math.Between(-120,120),
                alpha:0, scaleY:0.1,
                duration: Phaser.Math.Between(120,220),
                ease:"Quad.easeOut",
                onComplete:()=>{try{_pg.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}
            });
        }
    }

    // ── HIT FLASH + CRIT GLOW — tum ucgenler, boss dahil ────────
    try{
        const isMiniBossHit = enemy._isMiniBoss;
        const _savedAlpha   = enemy.alpha;
        const _savedTint    = enemy._originalTint ?? null;
        const _flashDur     = crit ? 100 : 65;

        // Beyaz flash — tum tiplerde ayni: tutarli ve temiz his
        enemy.setTint(0xffffff);
        // Ghost / stealth / phantom gibi yari seffaf tipler flash aninda
        // gorunur hale gelsin — aksi hâlde flash fark edilmez
        if(_savedAlpha < 0.88) enemy.setAlpha(Math.min(1.0, _savedAlpha + 0.50));

        // Crit VFX: halka + kivilcim — throttled (80ms), [MOBILE PERF] mobilede skip
        if(crit && !_IS_MOBILE_EARLY){
            const now2=Date.now();
            const lastCritVfx=enemy._lastCritVfx||0;
            if(now2-lastCritVfx>80){
                enemy._lastCritVfx=now2;
                const gr=isMiniBossHit?Math.max(22,enemy.displayWidth*0.25):Math.max(6,Math.min(12,enemy.displayWidth*0.35));
                const ring=S.add.graphics().setDepth(22);
                ring.x=enemy.x; ring.y=enemy.y;
                ring.lineStyle(isMiniBossHit?3:1.5, isMiniBossHit?0xffffff:0xffee00, 0.85);
                ring.strokeCircle(0,0,gr);
                S.tweens.add({targets:ring,scaleX:2.0,scaleY:2.0,alpha:0,duration:160,ease:"Quad.easeOut",onComplete:()=>ring.destroy()});
                for(let _ci=0;_ci<4;_ci++){
                    const _ca=Phaser.Math.DegToRad(_ci*90+45);
                    const _sp2=S.add.graphics().setDepth(23);
                    _sp2.x=enemy.x+Math.cos(_ca)*gr*0.25;
                    _sp2.y=enemy.y+Math.sin(_ca)*gr*0.25;
                    _sp2.fillStyle(0xffee44,0.85); _sp2.fillRect(-0.6,-2.5,1.2,5);
                    _sp2.angle=_ci*90+45;
                    S.tweens.add({targets:_sp2,
                        x:_sp2.x+Math.cos(_ca)*14,y:_sp2.y+Math.sin(_ca)*14,
                        alpha:0,scaleY:0.1,duration:120,ease:"Quad.easeOut",
                        onComplete:()=>_sp2.destroy()});
                }
            }
        }

        // Orijinal renge don
        S.time.delayedCall(_flashDur, ()=>{
            if(!enemy || !enemy.active) return;
            // MiniBoss: kendi tanim rengine don
            if(isMiniBossHit){
                const def=enemy._miniBossDef;
                if(def?.tint != null) enemy.setTint(def.tint); else enemy.clearTint();
            } else {
                // Normal / boss: spawnEnemy'de kayit edilen orijinal tint
                if(_savedTint !== null) enemy.setTint(_savedTint);
                else enemy.clearTint();
            }
            // Alpha'yi da geri yukle (ghost tipler)
            if(_savedAlpha < 0.88) enemy.setAlpha(_savedAlpha);
        });
    }catch(e){console.warn("[NT] Hata yutuldu:",e)}

    // ── Screen shake + zoom ─────────────────────────────────────
    if(crit){
        const _shakeAmt = enemy._isMiniBoss ? 0.007 : 0.004;
        const _shakeDur = enemy._isMiniBoss ? 40   : 28;
        S.cameras.main.shake(_shakeDur, _shakeAmt);
        // Slight zoom punch on crit — snappy in, smooth out — [MOBILE PERF] mobilede yok
        if(!enemy._isMiniBoss && rawDmg > 2.0 && !_IS_MOBILE_EARLY){
            try{
                S.cameras.main.zoomTo(1.04, 40, "Quad.easeOut");
                setTimeout(()=>{ try{ S.cameras.main.zoomTo(1.0, 100, "Quad.easeIn"); }catch(e){console.warn("[NT] Hata yutuldu:",e)} }, 40);
            }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }
    } else if(enemy._isMiniBoss){
        S.cameras.main.shake(14, 0.0025);
    } else {
        // Normal hit: always shake (was 20% chance) — subtle but consistent weight
        S.cameras.main.shake(12, 0.0012);
    }

    // ── Cerceve duraksama hissi — micro-freeze sadece crit'te zaten var ──
    // Normal vurusta: hafif dusman "geri cekme" hissi (velocity spike)
    if(!crit && enemy.active && enemy.body && !enemy.frozen){
        const pullDir = (enemy.x > S.player.x) ? 1 : -1;
        enemy.body.velocity.x += pullDir * 8;
    }

    if(enemy.hp<=0) {
        // KILL HIT STOP: physics pause 55ms + slow-mo 0.70x for 110ms real time
        if(S && !GS?.pickingUpgrade && _upgradeLock===0){
            const _gsRef = gs;
            // Only pause if not already frozen from crit
            if(!_gsRef._microFreeze){
                _gsRef._microFreeze = true;
                S.physics.pause();
                setTimeout(()=>{
                    if(!_gsRef?.gameOver&&!_gsRef?.pickingUpgrade&&_upgradeLock===0)
                        try{ S.physics.resume(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
                    if(_gsRef) _gsRef._microFreeze = false;
                }, 55);
            }
            try{ S.time.timeScale = 0.70; }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            setTimeout(()=>{ if(!_gsRef?.gameOver&&!_gsRef?.pickingUpgrade) try{ S.time.timeScale=1.0; }catch(e){console.warn("[NT] Hata yutuldu:",e)} }, 110);
        }
        killEnemy(S,enemy,true);
    }
}

// ── ZORLUK DENGESI — bagimlilik egrisi ───────────────────────
function updateDifficultyTick(S){
    const gs=GS, min=gs.t/60000;

    // SPAWN DELAY (ms): ARCADE FIX — much faster early game, intense from the start
    // 0dk=850 → 1dk=750 → 2dk=650 → 4dk=550 → 7dk=450 → 10dk=380 → 15dk=320 → 20dk=280 → min=240
    // [LEVEL 1 EASE] First minute spawn delay slightly increased: 850→950 start, 750→850 end
    //                Gives new players a smoother onboarding window. All other values unchanged.
    const spawnBase =
        min < 1  ? Phaser.Math.Linear(1050,  920, min)        : // [LEVEL 1 EASE v2] 950→1050 start, 850→920 end — more breathing room in first minute
        min < 2  ? Phaser.Math.Linear( 880,  740, min-1)      : // [LEVEL 2 EASE v2] 820→880 start, 700→740 end — gentler ramp in second minute
        min < 4  ? Phaser.Math.Linear( 650,  550, (min-2)/2)  :
        min < 7  ? Phaser.Math.Linear( 550,  450, (min-4)/3)  :
        min < 10 ? Phaser.Math.Linear( 450,  380, (min-7)/3)  :
        min < 15 ? Phaser.Math.Linear( 380,  320, (min-10)/5) :
        min < 20 ? Phaser.Math.Linear( 320,  280, (min-15)/5) :
        Math.max(240, 280 - (min-20)*6);

    const pm={ calm:1.35, wave:1.0, swarm:0.85, rush:0.72, chaos:0.60 };
    gs.spawnDelay = Math.max(240, Math.round(spawnBase * (pm[gs.directorPhase]||1.0)));

    // LEVEL-BASED: sadece hiz artar, spawn delay artik level'dan ETKILENMEZ
    // (cift scaling sorunu duzeltildi — eskiden hem zaman hem level spawn'u hizlandiriyordu)
    const lv = gs.level || 1;
    let lvSpdMult = 1.0;
    if(lv >= 5)  lvSpdMult = 1.06;
    if(lv >= 10) lvSpdMult = 1.12;
    if(lv >= 15) lvSpdMult = 1.20; // BALANCE FIX: was 1.18
    if(lv >= 20) lvSpdMult = 1.28; // BALANCE FIX: was 1.22 (restored pressure)
    if(lv >= 25) lvSpdMult = 1.34; // BALANCE FIX: was 1.25 (restored pressure)

    // Dusuk canda mercy mechanic — BALANCE FIX: reduced (was +400/1.50 and +300/1.85)
    // Still provides some relief but no longer creates a safe bubble
    if(gs.health <= 3) gs.spawnDelay = Math.min(gs.spawnDelay + 180, spawnBase * 1.20);
    if(gs.health <= 1) gs.spawnDelay = Math.min(gs.spawnDelay + 120, spawnBase * 1.40);

    // DUSMAN HIZI (px/s): ARCADE — slightly toned down for comfort
    // 0dk=88 → 1dk=108 → 3dk=132 → 6dk=155 → 10dk=180 → 15dk=205 → 25dk=230 → max=240
    // [LEVEL 1 EASE] First minute speed slightly reduced: 88→76 start, 108→96 end.
    //                Eases early pressure without disrupting mid/late game feel.
    const baseSpeed =
        min < 1  ? Phaser.Math.Linear( 68,  88, min)        : // [LEVEL 1 EASE v2] 76→68 start, 96→88 end — slightly slower first minute
        min < 3  ? Phaser.Math.Linear( 98, 132, (min-1)/2)  : // [LEVEL 2 EASE v2] 108→98 start — gentler pickup into min2
        min < 6  ? Phaser.Math.Linear(132, 155, (min-3)/3)  :
        min < 10 ? Phaser.Math.Linear(155, 180, (min-6)/4)  :
        min < 15 ? Phaser.Math.Linear(180, 205, (min-10)/5) :
        min < 25 ? Phaser.Math.Linear(205, 230, (min-15)/10):
        Math.min(240, 230 + (min-25)*1.0);
    gs.pyramidSpeed = Math.min(240, baseSpeed * lvSpdMult);
}

function runDirector(S){
    const gs=GS, min=gs.t/60000, hp=gs.health/gs.maxHealth;
    const phases=["calm","wave","swarm","rush","chaos"];

    // ARCADE: shorter calm phase, faster ramp
    //   0:00-0:30 → TAM calm
    //   0:30-1:00 → cogunlukla calm (%50), bazen wave
    //   1:00-2:30 → wave agirlikli, calm azaliyor
    //   2:30+     → agirlik sistemi devreye girer

    if(min < 0.50){ gs.directorPhase="calm"; return; }
    if(min < 1.0)  { gs.directorPhase=Math.random()<0.50?"calm":"wave"; return; }
    if(min < 2.5)  { gs.directorPhase=Math.random()<0.25?"calm":"wave"; return; }

    // 2.5min+: weighted system — phases ramp up faster, arcade pressure
    const calmW  = hp < 0.30 ? 5.0 : Math.max(0.3, 2.0 - min*0.12);
    const waveW  = 3.0;
    const swarmW = min > 3.0  ? Math.min(2.5, (min-3.0)  * 0.50) : 0;
    const rushW  = min > 5.0  ? Math.min(2.2, (min-5.0)  * 0.40) : 0;
    const chaosW = min > 8.0  ? Math.min(2.5, (min-8.0)  * 0.25) : 0;

    const wts=[calmW, waveW, swarmW, rushW, chaosW];
    const tot=wts.reduce((a,b)=>a+b,0);
    let r=Math.random()*tot;
    for(let i=0;i<wts.length;i++){r-=wts[i];if(r<=0){gs.directorPhase=phases[i];return;}}
    gs.directorPhase="wave";
}
// ═══════════════════════════════════════════════════════════════
// PART D: Gun Dongusu, Atmosfer, Kayan Yildiz, Sandik, UI, Slotlar
// ═══════════════════════════════════════════════════════════════

// ── GUN DONGUSU ──────────────────────────────────────────────
// ── KAYAN YILDIZ — ince uzun, iz ile ──
// ── ATMOSFER ─────────────────────────────────────────────────

// ── SANDIK NADIRLIK ───────────────────────────────────────────
function getChestRarity(gs){
    const time=gs.t/60000, roll=Math.random();
    // [BALANCE] Chest rarity — slower scaling, lower caps
    const legendChance=Math.min(0.02,0.003+gs.level*0.0007+time*0.001); // [BALANCE] was min(0.03, ...level*0.001+time*0.002)
    const rareChance=Math.min(0.10,0.02+gs.level*0.003+time*0.003);   // [BALANCE] was min(0.15, ...level*0.004+time*0.004)
    if(roll<legendChance) return CHEST_RARITY.LEGENDARY;
    if(roll<rareChance)   return CHEST_RARITY.RARE;
    return CHEST_RARITY.COMMON;
}

function spawnChest(S,x,y){
    const gs=GS;
    // [BALANCE] Only ONE chest on screen at a time + 30s cooldown
    if(gs._chestOnScreen) return;
    const now=gs.t||0;
    if(!gs._lastChestTime) gs._lastChestTime=0;
    if(now - gs._lastChestTime < 120000) return; // [BALANCE] 120 second cooldown (was 90s)
    gs._chestOnScreen=true;
    gs._lastChestTime=now;
    const rarity=getChestRarity(gs);
    const texKey=rarity===CHEST_RARITY.LEGENDARY?"tex_chest_legendary":rarity===CHEST_RARITY.RARE?"tex_chest_rare":"tex_chest_common";
    const chest=S.add.image(x,y,texKey).setDepth(7).setScale(1.3);
    chest._rarity=rarity;

    let vy=-48,vx=Phaser.Math.Between(-20,20),landed=false;
    const arrow=S.add.graphics().setDepth(8);
    const glow=S.add.graphics().setDepth(6);
    const arrowBob={t:0};

    const tick=S.time.addEvent({delay:16,loop:true,callback:()=>{
        if(!chest.scene){tick.remove();try{arrow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}try{glow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}return;}
        arrowBob.t+=0.08;
        if(!landed){
            vy+=2.5;chest.x+=vx*0.016;chest.y+=vy*0.016;
            if(chest.y>=GROUND_Y-14){
                chest.y=GROUND_Y-14; vy*=-0.22; vx*=0.4;
                if(Math.abs(vy)<3) landed=true;
                spawnImpact(S,chest.x,chest.y);
            }
        } else {
            chest.angle=Math.sin(arrowBob.t*0.7)*1.5;
            // Rarity renginde parilti parcaciklari
            if(Math.random()<(rarity===CHEST_RARITY.LEGENDARY?0.06:rarity===CHEST_RARITY.RARE?0.035:0.015)){
                const sp=S.add.graphics().setDepth(9);
                const sc=rarity.color;
                sp.fillStyle(sc,0.85);
                sp.fillRect(chest.x+Phaser.Math.Between(-14,14),chest.y+Phaser.Math.Between(-10,10),Phaser.Math.Between(2,4),Phaser.Math.Between(2,4));
                S.tweens.add({targets:sp,y:sp.y-Phaser.Math.Between(12,28),alpha:0,duration:Phaser.Math.Between(300,550),onComplete:()=>sp.destroy()});
            }
            // Glow efekti
            glow.clear();
            const ga=0.05+Math.sin(arrowBob.t*2)*0.03;
            if(rarity===CHEST_RARITY.LEGENDARY){
                glow.fillStyle(rarity.glowColor,ga*2.2);glow.fillCircle(chest.x,chest.y,30+Math.sin(arrowBob.t)*5);
                if(Math.random()<0.035){const sp=S.add.rectangle(chest.x+Phaser.Math.Between(-12,12),chest.y,2,2,0xffcc00,0.8).setDepth(8);S.tweens.add({targets:sp,y:sp.y-22,alpha:0,duration:400,onComplete:()=>sp.destroy()});}
            } else if(rarity===CHEST_RARITY.RARE){
                glow.fillStyle(rarity.glowColor,ga*1.6);glow.fillCircle(chest.x,chest.y,22+Math.sin(arrowBob.t)*3);
            } else {
                glow.fillStyle(rarity.glowColor,ga);glow.fillCircle(chest.x,chest.y,16);
            }
        }
        // Ok
        arrow.clear();
        const ay=chest.y-24+Math.sin(arrowBob.t)*5;
        arrow.fillStyle(rarity.color,0.95);
        arrow.fillRect(chest.x-3,ay-8,6,6);
        arrow.fillRect(chest.x-6,ay-3,12,4);
        arrow.fillTriangle(chest.x-8,ay+1,chest.x+8,ay+1,chest.x,ay+10);
        // Yakin kontrolu
        const dx=S.player.x-chest.x, dy=(S.player.y-3)-chest.y;
        if(dx*dx+dy*dy<34*34){
            tick.remove();try{arrow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}try{glow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
            openChestScreen(S,chest,rarity);
        }
    }});
    S.time.delayedCall(22000,()=>{if(chest&&chest.scene){tick.remove();try{arrow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}try{glow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}try{chest.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)} if(GS) GS._chestOnScreen=false;}});
}

function openChestScreen(S,chest,rarity){
    NT_SFX.play("chest_open", rarity?.name||"common");
    const cx=chest.x||180;
    try{chest.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
    const gs=GS;
    if(GS) GS._chestOnScreen=false;
    if(gs.pickingUpgrade || _upgradeLock > 0) return;
    S.cameras.main.shake(rarity.shakeAmp*80, rarity.shakeAmp*0.4);
    lockUpgrade(gs, S);

    // Build upgrade pool exactly like level-up system
    const upgradableAll = Object.entries(UPGRADES).filter(([k,u])=>{
        const maxLv = u.max ?? u.maxLevel ?? 999;
        return (u.level||0) < maxLv;
    });

    const rewardCount = rarity.rewards || 1;
    let selected = [];
    if(upgradableAll.length > 0){
        const shuffled=[...upgradableAll].sort(()=>Math.random()-0.5);
        selected = shuffled.slice(0, Math.min(rewardCount, shuffled.length));
    }
    const fullMaxHeal = upgradableAll.length === 0;

    const W=360, H=640;

    // ── LAYOUT HESABI — her bolum kesin ayri ──────────────────────
    // [1] Baslik alani      : 40px (panelY → panelY+40)
    // [2] Chest ikonu alani : 100px (panelY+40 → panelY+140) — buyuk, net bosluk
    // [3] Ayirici cizgi     : 8px  (panelY+140 → panelY+148)
    // [4] Upgrade kartlari  : itemCount * 68px
    // [5] Gold reward alani : 52px
    // [6] Alt padding       : 14px
    const HEADER_H  = 40;
    const CHEST_H   = 100;  // chest ikonu icin tamamen ayrilmis alan
    const DIVIDER_H = 8;
    const ITEM_H    = 68;   // her kart yuksekligi (onceki 64'ten buyutuldu)
    const GOLD_H    = 52;
    const PADDING_B = 14;

    const itemCount = fullMaxHeal ? 1 : selected.length;
    const panelH = Math.min(580, HEADER_H + CHEST_H + DIVIDER_H + itemCount * ITEM_H + GOLD_H + PADDING_B);
    const panelY = Math.max(14, Math.floor(H/2 - panelH/2));
    const panelX = 24;
    const panelW = W - panelX*2;  // 312px

    const ui = new UIGroup(S);

    // ── Overlay ───────────────────────────────────────────────────
    const ov=ui.add(S.add.rectangle(W/2,H/2,W,H,0x000000,0.80).setDepth(200));

    // ── Panel arka plan ───────────────────────────────────────────
    const pg=ui.add(S.add.graphics().setDepth(201));
    pg.fillStyle(0x07080f,0.99);
    pg.fillRoundedRect(panelX, panelY, panelW, panelH, 10);
    // Dis border — rarity rengi
    pg.lineStyle(2.5, rarity.color, 0.95);
    pg.strokeRoundedRect(panelX, panelY, panelW, panelH, 10);
    // Ic border — ince, glow rengi
    pg.lineStyle(1, rarity.glowColor, 0.30);
    pg.strokeRoundedRect(panelX+3, panelY+3, panelW-6, panelH-6, 8);
    // Baslik serit (gradient hissi)
    pg.fillStyle(rarity.color, 0.20);
    pg.fillRoundedRect(panelX, panelY, panelW, HEADER_H, {tl:10,tr:10,bl:0,br:0});
    // Chest ikonu alani — hafif koyu arka plan
    pg.fillStyle(0x000000, 0.25);
    pg.fillRect(panelX, panelY+HEADER_H, panelW, CHEST_H);
    // Chest alani alt cizgisi — net separator
    pg.lineStyle(1.5, rarity.color, 0.45);
    pg.lineBetween(panelX+12, panelY+HEADER_H+CHEST_H, panelX+panelW-12, panelY+HEADER_H+CHEST_H);

    // ── Baslik yazisi ─────────────────────────────────────────────
    const rarityLabel = L(rarity.label);
    const titleColor = rarity===CHEST_RARITY.LEGENDARY?"#ffcc00":rarity===CHEST_RARITY.RARE?"#cc66ff":"#66aaff";
    const titleTxt=ui.add(S.add.text(W/2, panelY+HEADER_H/2, rarityLabel, {
        font:"bold 14px LilitaOne, Arial, sans-serif",
        color: titleColor,
        padding:{x:4,y:2}
    }).setOrigin(0.5).setDepth(202).setAlpha(1).setVisible(false));

    // ── Chest ikonu — kendi alaninda ortalanmis ───────────────────
    const chestTexKey = rarity===CHEST_RARITY.LEGENDARY?"tex_chest_legendary"
                       :rarity===CHEST_RARITY.RARE?"tex_chest_rare":"tex_chest_common";
    const CHEST_ICO_Y = panelY + HEADER_H + CHEST_H/2;  // chest alaninin tam ortasi
    const chestIco = ui.add(S.add.image(W/2, CHEST_ICO_Y, chestTexKey)
        .setScale(3.2).setDepth(203).setAlpha(1).setVisible(false));

    // ITEM_START_Y: chest alani + divider'dan sonra baslar
    const ITEM_START_Y = panelY + HEADER_H + CHEST_H + DIVIDER_H;

    [titleTxt,chestIco].forEach(el=>{if(el&&el.setVisible)el.setVisible(true);el&&el.setAlpha&&el.setAlpha(0);});
    S.tweens.add({targets:[ov,pg,titleTxt], alpha:1, duration:180});
    S.tweens.add({targets:chestIco, alpha:1, duration:200, onComplete:()=>{
        const rep   = rarity===CHEST_RARITY.LEGENDARY?16:rarity===CHEST_RARITY.RARE?11:7;
        const shAng = rarity===CHEST_RARITY.LEGENDARY?22:13;
        S.tweens.add({targets:chestIco, angle:shAng, duration:50, yoyo:true, repeat:rep, ease:"Sine.easeInOut",
        onComplete:()=>{
            vfxChestOpen(S, W/2, CHEST_ICO_Y, rarity);

            if(fullMaxHeal){
                const healAmt = rarity===CHEST_RARITY.LEGENDARY?25:rarity===CHEST_RARITY.RARE?15:10;
                gs.health=Math.min(gs.maxHealth, gs.health+healAmt);
                gs._healFlash=800;
                const ht=ui.add(S.add.text(W/2, ITEM_START_Y+34, "+"+healAmt+" MAX CAN", {
                    font:"bold 15px LilitaOne, Arial, sans-serif",
                    color:"#44ff88", padding:{x:4,y:2}
                }).setOrigin(0.5).setDepth(204).setAlpha(1).setVisible(false));
                if(ht&&ht.setVisible){ht.setVisible(true);ht.setAlpha(0);}
                S.tweens.add({targets:ht, alpha:1, duration:220});
            } else {
                selected.forEach(([k,u], ri)=>{
                    // Her kart ITEM_START_Y'den basliyor, ITEM_H aralikli
                    const ry = ITEM_START_Y + ri * ITEM_H;
                    const CARD_X  = panelX + 8;
                    const CARD_W  = panelW - 16;
                    const CARD_H  = ITEM_H - 6;  // 6px gap alt-ust
                    const ICO_X   = CARD_X + 30;  // ikon merkezi
                    const TEXT_X  = CARD_X + 62;  // metin baslangici
                    const TEXT_W  = CARD_W - 68;

                    const rarityC = 0x5599dd; // Tek tip renk — rarity sistemi kaldirildi

                    const rg=ui.add(S.add.graphics().setDepth(202));
                    // Kart arka plan
                    rg.fillStyle(0x0c0d1c, 0.95);
                    rg.fillRoundedRect(CARD_X, ry, CARD_W, CARD_H, 6);
                    // Rarity kenar cizgisi
                    rg.lineStyle(1.5, rarityC, 0.70);
                    rg.strokeRoundedRect(CARD_X, ry, CARD_W, CARD_H, 6);
                    // Sol accent bar
                    rg.fillStyle(rarityC, 0.90);
                    rg.fillRoundedRect(CARD_X, ry, 4, CARD_H, {tl:6,tr:0,bl:6,br:0});
                    // Ikon arka plan dairesi — 22px radius matches 40px displaySize icon
                    rg.fillStyle(rarityC, 0.15);
                    rg.fillCircle(ICO_X, ry+CARD_H/2, 22);
                    rg.lineStyle(1, rarityC, 0.40);
                    rg.strokeCircle(ICO_X, ry+CARD_H/2, 22);

                    let ico=null;
                    try{
                        // [FIX] Icon size capped at 40px to prevent overflow
                        ico=ui.add(S.add.image(ICO_X, ry+CARD_H/2, u.icon||"custom_icon_damage")
                            .setDisplaySize(40, 40).setDepth(204).setAlpha(1).setVisible(false));
                    }catch(e){console.warn("[NT] Hata yutuldu:",e)}

                    // Upgrade ismi
                    const rl=ui.add(S.add.text(TEXT_X, ry+10, L(u.nameKey), {
                        font:"bold 12px LilitaOne, Arial, sans-serif",
                        color:"#ffffff", padding:{x:2,y:1}
                    }).setDepth(204).setAlpha(1).setVisible(false));

                    // Level gostergesi — sag ust
                    const lvNow=Math.min(u.level+1, u.max??u.maxLevel??999);
                    const lvStr="Lv "+lvNow+"/"+u.max;
                    const lvTxt=ui.add(S.add.text(CARD_X+CARD_W-8, ry+10, lvStr, {
                        font:"bold 11px LilitaOne, Arial, sans-serif",
                        color:Phaser.Display.Color.IntegerToColor(rarityC).rgba
                    ,
            padding:{x:2,y:1}
        }).setOrigin(1,0).setDepth(204).setAlpha(1).setVisible(false));

                    // Aciklama
                    const ds=ui.add(S.add.text(TEXT_X, ry+30, L(u.descKey), {
                        font:"11px LilitaOne, Arial, sans-serif",
                        color:"#8899bb",
                        wordWrap:{width: TEXT_W, useAdvancedWrap:false},
                        padding:{x:2,y:1}
                    }).setDepth(204).setAlpha(1).setVisible(false));

                    S.time.delayedCall(ri*120, ()=>{
                        [ico,rl,lvTxt,ds].filter(Boolean).forEach(el=>{if(el.setVisible)el.setVisible(true);el.setAlpha&&el.setAlpha(0);});
                        S.tweens.add({
                            targets:[ico,rl,lvTxt,ds].filter(Boolean),
                            alpha:1, duration:200, ease:"Back.easeOut"
                        });
                        if(ico){
                            // [FIX] Use displayWidth/Height instead of scale for bounded bounce
                            S.tweens.add({targets:ico, displayWidth:52, displayHeight:52,
                                duration:120, yoyo:true, ease:"Back.easeOut"});
                        }
                        applyUpgrade(S, k, false);
                        refreshSlots(S);
                    });
                });
            }

            // Gold reward
            const minG=40+Math.floor(gs.t/60000)*10;
            const maxG=100+Math.floor(gs.t/60000)*22;
            const gBase=Phaser.Math.Between(minG,maxG);
            const gEarned=rarity===CHEST_RARITY.LEGENDARY?Math.round(gBase*2):rarity===CHEST_RARITY.RARE?Math.round(gBase*1.35):gBase;
            const GOLD_Y = panelY + panelH - GOLD_H/2 - PADDING_B/2;

            const itemRows=(fullMaxHeal?1:selected.length);
            S.time.delayedCall(itemRows*120+220, ()=>{
                const gl=ui.add(S.add.text(W/2, GOLD_Y, "", {
                    font:"bold 17px LilitaOne, Arial, sans-serif",
                    color:"#ffcc00", padding:{x:4,y:2}
                }).setOrigin(0.5).setDepth(204).setAlpha(1).setVisible(false));
                if(gl&&gl.setVisible){gl.setVisible(true);gl.setAlpha(0);}
                S.tweens.add({targets:gl, alpha:1, duration:130});

                let rainRunning=true;
                const rainInterval=S.time.addEvent({delay:130, loop:true, callback:()=>{
                    if(!rainRunning||!GS||GS.gameOver) return;
                    const rx=Phaser.Math.Between(panelX+8, panelX+panelW-8);
                    const gem=S.add.image(rx, panelY+HEADER_H+4, "xp_blue")
                        .setDepth(206).setScale(0.9).setAlpha(0.80);
                    S.tweens.add({targets:gem,
                        y: GOLD_Y-10,
                        duration:Phaser.Math.Between(550,950),
                        ease:"Cubic.easeIn", alpha:0.4,
                        onComplete:()=>{try{gem.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
                }});
                ui.add({destroy:()=>{rainRunning=false;rainInterval.remove();}});

                let cur=0;
                const step=Math.max(1,Math.ceil(gEarned/18));
                const ticker=S.time.addEvent({delay:30, loop:true, callback:()=>{
                    cur=Math.min(gEarned, cur+step);
                    gl.setText("G +"+Math.round(cur));
                    if(cur>=gEarned){
                        ticker.remove();
                        gs.gold+=Math.round(gEarned);
                        PLAYER_GOLD=gs.gold;
                    }
                }});
                ui.add({destroy:()=>ticker.remove()});

                S.time.delayedCall(3400, ()=>{
                    rainRunning=false;
                    ui.fadeAndDestroy(230);
                    S.time.delayedCall(280, ()=>{
                        S.time.timeScale=1.0;
                        unlockUpgrade(gs,S);
                        refreshSlots(S);
                    });
                });

                const _skipKey=S.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
                const _skipFn=()=>{
                    rainRunning=false;
                    _skipKey.off("down",_skipFn);
                    ui.fadeAndDestroy(120);
                    S.time.delayedCall(140, ()=>{
                        S.time.timeScale=1.0;
                        unlockUpgrade(gs,S);
                        refreshSlots(S);
                    });
                };
                _skipKey.once("down",_skipFn);
            });
        }});
    }});
}

// ── OYUNCU GLOW — yanip sonen efekt YOK ──────────────────────
function drawPlayerGlow(S){
    const gs=GS; if(!gs||!S.playerGlow) return;
    S.playerGlow.clear();
    const px=S.player.x, py=S.player.y;
    const t=gs.t*0.001;

    // ── Zemin golgesi — hareket hizina gore uzar, yon kayar ──
    const velX=Math.abs(S.player.body?.velocity?.x||0);
    const vDirX=(S.player.body?.velocity?.x||0);
    const shadowW=24+velX*0.07;
    const shadowOX=vDirX*0.04;
    S.playerGlow.fillStyle(0x000000,0.20);
    S.playerGlow.fillEllipse(px+shadowOX,GROUND_Y-1,shadowW,4.5);
    if(velX>100){
        S.playerGlow.fillStyle(0x000000,0.07);
        S.playerGlow.fillEllipse(px-vDirX*0.08,GROUND_Y-1,shadowW*0.7,3);
    }

    // [VFX] Speed buff aktifken — etrafinda donen ruzgar cizgileri + hareket trail
    if(gs._speedBuffActive){
        const windT=t*4.5;
        for(let wi=0;wi<4;wi++){
            const wa=windT+wi*(Math.PI/2);
            const wr=22+Math.sin(windT*1.3+wi)*5;
            const wx1=px+Math.cos(wa)*wr;
            const wy1=py-14+Math.sin(wa)*wr*0.55;
            const wx2=px+Math.cos(wa+0.6)*(wr-6);
            const wy2=py-14+Math.sin(wa+0.6)*(wr-6)*0.55;
            S.playerGlow.lineStyle(1.5,0x44ffcc,0.5+Math.sin(windT+wi)*0.25);
            S.playerGlow.lineBetween(wx1,wy1,wx2,wy2);
        }
        S.playerGlow.lineStyle(1,0x44ffcc,0.18+Math.sin(windT)*0.08);
        S.playerGlow.strokeCircle(px,py-14,28);
        // [VFX] Hiz trail partikulleri — add.rectangle kullan, add.graphics degil
        // [CRASH FIX] add.graphics() her frame yeni canvas context aciyordu → GC spike
        if(velX>80&&Math.random()<0.55){
            const tp=S.add.rectangle(px,py-14,2,Phaser.Math.Between(4,9),0x44ffcc,0.55).setDepth(11);
            S.tweens.add({targets:tp,y:tp.y+4,alpha:0,duration:180,
                ease:"Quad.easeOut",onComplete:()=>tp.destroy()});
        }
    }

    // [Artifact aura kaldirildi — v9.1]

    // Dusuk can: kirmizi aura kaldirildi — HP bar yeterli gosterge
    const hR=Math.max(0,gs.health/gs.maxHealth);

    // [VFX] Heal flash — can alindiginda kisa yesil parlama
    if(gs._healFlash>0){
        gs._healFlash-=S.game.loop.delta||16;
        const hfa=Math.min(0.35,gs._healFlash/300)*0.35;
        S.playerGlow.fillStyle(0x44ff88,hfa);
        S.playerGlow.fillCircle(px,py-14,26);
        S.playerGlow.lineStyle(2,0x44ff88,hfa*2);
        S.playerGlow.strokeCircle(px,py-14,20);
    }

    // ── Combo aura — katmanli, nabizli ──
    if(gs.combo>3){
        const cc=gs.combo>=15?0xff0022:gs.combo>=10?0xff4400:gs.combo>=5?0xffaa00:0xffdd44;
        const bR=18+gs.combo*1.1;
        const pls=Math.sin(t*(2.8+gs.combo*0.08))*0.5+0.5;
        S.playerGlow.lineStyle(1,cc,0.12+gs.combo*0.005);
        S.playerGlow.strokeCircle(px,py-14,(bR+pls*6)*1.5);
        S.playerGlow.fillStyle(cc,0.04+gs.combo*0.006);
        S.playerGlow.fillCircle(px,py-14,bR+pls*5);
        S.playerGlow.fillStyle(cc,0.09+gs.combo*0.01);
        S.playerGlow.fillCircle(px,py-14,bR*0.58+pls*2);
        if(gs.combo>=10){
            S.playerGlow.fillStyle(0xffffff,0.05+pls*0.05);
            S.playerGlow.fillCircle(px,py-14,8+pls*2);
        }
        if(gs.combo>=15){
            for(let _di=0;_di<3;_di++){
                const _da=t*2.5+_di*(Math.PI*2/3);
                const _dr=bR*0.75;
                S.playerGlow.fillStyle(cc,0.5);
                S.playerGlow.fillCircle(px+Math.cos(_da)*_dr,py-14+Math.sin(_da)*_dr,2.5);
            }
        }
    }

    // ── HP BAR ────────────────────────────────────────────────
    // [PERF-FIX] Sadece HP veya pozisyon degisince yeniden ciz
    const _hpKey = Math.round(px) + "_" + gs.health + "_" + gs.maxHealth + "_" + (hR<0.3 ? Math.round(gs.t*0.3) : 0);
    if(S._hpBarLastKey !== _hpKey){
        S._hpBarLastKey = _hpKey;
        S.hpBarGfx.clear();
        const bW=40,bH=5,bx=px-bW/2,by=py-50;
        S.hpBarGfx.fillStyle(0x000000,0.88); S.hpBarGfx.fillRect(bx-2,by-2,bW+4,bH+4);
        S.hpBarGfx.lineStyle(1,0x333333,0.9); S.hpBarGfx.strokeRect(bx-2,by-2,bW+4,bH+4);
        if(hR>0){
            const hc=hR>0.6?0x33ee55:hR>0.3?0xffaa00:0xff2222;
            const barW=Math.ceil(bW*hR);
            S.hpBarGfx.fillStyle(hc,1); S.hpBarGfx.fillRect(bx,by,barW,bH);
            S.hpBarGfx.fillStyle(0xffffff,0.3); S.hpBarGfx.fillRect(bx,by,barW,2);
            if(hR<0.3){
                const fAlpha=0.25+Math.sin(t*5.5)*0.2;
                S.hpBarGfx.fillStyle(0xff4444,fAlpha); S.hpBarGfx.fillRect(bx,by,barW,bH);
            }
            if(hR>0.95){
                S.hpBarGfx.fillStyle(0x44ff88,0.15); S.hpBarGfx.fillRect(bx-1,by-1,barW+2,bH+2);
            }
        }
    }
} // end drawPlayerGlow

// ── UI ────────────────────────────────────────────────────────
function buildUI(S){
    const D=50,W=360,H=640;

    // ── XP BAR — tam ust, ince, sade ────────────────────────
    S.xpBarBg=S.add.graphics().setDepth(D+3).setScrollFactor(0);
    S.xpBarBg.fillStyle(0x000000,0.55); S.xpBarBg.fillRect(0,0,W,6);
    S.xpBarBg.lineStyle(1,0x112244,0.40); S.xpBarBg.lineBetween(0,6,W,6);

    S.xpBarFill=S.add.rectangle(0,3,0,5,0x2277ff,1).setOrigin(0,0.5).setDepth(D+4).setScrollFactor(0);
    S.xpBarGlow=S.add.rectangle(0,3,0,9,0x0033cc,0.15).setOrigin(0,0.5).setDepth(D+3).setScrollFactor(0);
    S._xpBarShine=S.add.rectangle(0,3,0,2,0xffffff,0.35).setOrigin(0,0.5).setDepth(D+5).setScrollFactor(0);
    S._xpBarPulse=S.add.graphics().setDepth(D+6).setScrollFactor(0);

    // ── SKOR — ust orta, XP barinin hemen alti ───────────────
    S.scoreText=S.add.text(W/2,16,"0",{
        fontFamily:"LilitaOne",
        fontSize:"18px",
        color:"#ffffff",
        stroke:"#000000",
        strokeThickness:3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D+6);

    // ── SOL UST: LEVEL BADGE — KALDIRILDI (sadece menude gorunur) ───
    S._lvBadgeGfx = S.add.graphics().setDepth(D+8).setScrollFactor(0).setVisible(false);
    S._lvNum = S.add.text(24, 25, "1", {
        fontFamily:"LilitaOne", fontSize:"18px",
        color:"#ffffff", stroke:"#000000", strokeThickness:4
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(D+9).setVisible(false);

    S.levelText = null;
    S.killText  = null;

    // ── SAG UST: GEM + GOLD — oyun icinde GIZLI (menude gosteriliyor) ──────
    // Oyun icinde gereksiz karmasa yaratir — sadece menude gorunsun
    S._gemPillGfx = S.add.graphics().setDepth(D+4).setScrollFactor(0).setVisible(false);
    S.gemText = S.add.text(W-10, 12, "0", {
        fontFamily:"LilitaOne", fontSize:"12px",
        color:"#dd66ff", stroke:"#000", strokeThickness:2
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(D+5).setVisible(false);
    S.gemIcon = S.add.image(W-82, 12, "icon_gem")
        .setDisplaySize(13, 13).setOrigin(0.5, 0.5)
        .setScrollFactor(0).setDepth(D+5).setVisible(false);

    S._goldPillGfx = S.add.graphics().setDepth(D+4).setScrollFactor(0).setVisible(false);
    S.goldText = S.add.text(W-10, 34, "0", {
        fontFamily:"LilitaOne", fontSize:"12px",
        color:"#FFD700", stroke:"#000", strokeThickness:2
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(D+5).setVisible(false);
    S.goldIcon = S.add.image(W-82, 34, "icon_gold")
        .setDisplaySize(13, 13).setOrigin(0.5, 0.5)
        .setScrollFactor(0).setDepth(D+5).setVisible(false);

    S._crystalHudText = null;

    // ── PAUSE butonu — XP barinin hemen altinda, sag ust kose ──────
    // XP bar y=0-10; pause ikonu tam altina: merkez y=22
    const pH = S.add.image(W-18, 22, "pause_button")
        .setDisplaySize(30, 30)
        .setScrollFactor(0)
        .setDepth(D+7)
        .setAlpha(0.80)
        .setInteractive({useHandCursor:true});
    // LINEAR filter — pixelArt modunda keskin gorunsun
    S.time.delayedCall(50, ()=>{
        try{
            const gl=S.renderer&&S.renderer.gl;
            const src=(S.textures.get("pause_button")||{}).source;
            if(gl&&src) src.forEach(s=>{ if(s&&s.glTexture){
                gl.bindTexture(gl.TEXTURE_2D,s.glTexture);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                gl.bindTexture(gl.TEXTURE_2D,null);
            }});
        }catch(_){}
    });
    pH.on("pointerover",  ()=> pH.setAlpha(1.0));
    pH.on("pointerout",   ()=> pH.setAlpha(0.80));
    pH.on("pointerdown",  ()=>{
        NT_SFX.play("menu_click");
        pH.setAlpha(0.5);
        window.setTimeout(()=>{ pH.setAlpha(0.80); showPause(S); }, 60);
    });

    // ── COMBO — invisible placeholder (combo gosterimi spawnComboText ile yapilir)
    S.comboText=S.add.text(W/2,310,"",{
        fontFamily:"LilitaOne",
        fontSize:"1px",
        color:"#000000"
    }).setOrigin(0.5).setDepth(D+5).setAlpha(0);
}

function renderUI(S){
    const gs=GS;
    if(!gs||gs.gameOver||!S.scene||!S.scene.isActive()) return;
    // [PERF-FIX] updateDifficultyTick her frame degil, 500ms'de bir — spawn/speed hesabi gereksiz yere tekrarlaniyordu
    if(!S._diffTickTimer) S._diffTickTimer=0;
    S._diffTickTimer+=(S.game.loop.delta||16);
    if(S._diffTickTimer>=500){ S._diffTickTimer=0; updateDifficultyTick(S); }
    // [PERF-FIX] syncStatsFromPipeline sadece _statsDirty flag'i set olunca cagrilir.
    // Onceden her frame calcStats() yapiliyordu — upgrade secilmediginde gercekten degismiyor.
    if(gs._statsDirty){ gs._statsDirty=false; syncStatsFromPipeline(gs); }
    // [v9.4] Event sure gostergesi — ekranin ustunde renkli bar
    renderEventHUD(S);

    // XP bar — animasyonlu genisleme (tam genislik 360)
    const ratio=Math.min(1,gs.xp/gs.xpToNext);
    const targetW=360*ratio;
    S.xpBarFill.width=Phaser.Math.Linear(S.xpBarFill.width,targetW,0.14);
    S.xpBarGlow.width=S.xpBarFill.width;
    if(S._xpBarShine) S._xpBarShine.width=S.xpBarFill.width;
    if(S._xpBarPulse){
        const _pt=(gs.t*0.0025)%1000; // [PERF-FIX] Date.now() yerine gs.t — syscall yok
        const _pw=S.xpBarFill.width;
        S._xpBarPulse.clear();
        if(_pw>10){
            const _px=4+(_pt%1)*(_pw-4);
            S._xpBarPulse.fillStyle(0xffffff,0.40);
            S._xpBarPulse.fillRect(_px,1,4,3);
            S._xpBarPulse.fillStyle(0x88bbff,0.30+0.18*Math.sin(_pt*3));
            S._xpBarPulse.fillRect(_pw-4,0,5,5);
        }
    }
    // Doluluga gore renk
    const xpColor=ratio>0.8?0x22ddaa:ratio>0.5?0x1a66ee:0x0f44bb;
    S.xpBarFill.setFillStyle(xpColor);

    // Level badge sayisi guncelle
    if(S._lvNum) S._lvNum.setText(""+gs.level);
    // kill text removed
    if(S.scoreText) S.scoreText.setText(gs.score.toLocaleString());

    // Altin — yavas sayac
    if(!S._goldDisplay) S._goldDisplay=0;
    S._goldDisplay=Math.floor(S._goldDisplay+(gs.gold-S._goldDisplay)*0.08);
    if(S.goldText) S.goldText.setText(""+S._goldDisplay);

    // Gem
    if(S.gemText) S.gemText.setText(""+PLAYER_GEMS);

    // Combo — milestone floating text only (static HUD combo yazisi kaldirildi)
    if(gs.combo>1){
        // Milestone text pop via spawnComboText — HUD text invisible
        if(!S._lastComboMilestone) S._lastComboMilestone=0;
        const bScale=1.0+Math.sin(gs.t*0.055)*(0.04+gs.combo*0.004);
        const mile=gs.combo>=20?20:gs.combo>=15?15:gs.combo>=10?10:gs.combo>=5?5:0;
        if(mile>0&&mile!==S._lastComboMilestone){
            S._lastComboMilestone=mile;
            // ── Juicy floating combo milestone text
            spawnComboText(S, 180, 285, gs.combo);
        }
    } else {
        S._lastComboMilestone=0;
    }

    // [UPGRADE VIZUEL] Slot'lari 500ms'de bir guncelle — level bazli pulse icin
    if(!S._slotRefreshTimer) S._slotRefreshTimer=0;
    S._slotRefreshTimer+=(S.game.loop.delta||16);
    if(S._slotRefreshTimer>500){S._slotRefreshTimer=0;refreshSlots(S);}

    // Quest HUD — oyun icinde artik gosterilmiyor
    // [UI POLISH] Gorevler sadece menude "Gunluk Gorevler" bolumunde listelenir
    // Oyun ici surekli yazi kaldirildi — temiz UI

    // ── EVOLUTION HINT — "⚡ EVO NEAR" pulsing text when 1 req met ──
    // Shows player they're on track for an evolution without spoiling which one
    if(gs.level >= 6 && !gs.pickingUpgrade){
        // [PERF-FIX] Level degismedikce EVOLUTIONS taramasini tekrar yapma
        if(S._evoNearCachedLevel !== gs.level){
            S._evoNearCachedLevel = gs.level;
            S._evoNearCached = false;
            if(typeof EVOLUTIONS !== "undefined"){
                for(const evo of EVOLUTIONS){
                    if(evo.active) continue;
                    const metCount = evo.req.filter(r=>UPGRADES[r]&&UPGRADES[r].level>=UPGRADES[r].max).length;
                    if(metCount === evo.req.length - 1){ S._evoNearCached = true; break; }
                }
            }
        }
        if(S._evoNearCached){
            if(!S._evoHintText){
                S._evoHintText = S.add.text(360-4, 52, "⚡ EVO", {
                    font:"bold 9px LilitaOne, Arial, sans-serif",
                    color:"#ffee44", stroke:"#000", strokeThickness:2, padding:{x:2,y:1}
                }).setOrigin(1,0).setDepth(60).setScrollFactor(0).setAlpha(0);
            }
            // Pulse alpha
            const _pulse = 0.55 + Math.sin(gs.t * 0.006) * 0.45;
            S._evoHintText.setAlpha(_pulse).setVisible(true);
        } else {
            if(S._evoHintText) S._evoHintText.setVisible(false);
        }
    }

    // [Artifact HUD kaldirildi — v9.1]
}

function showPause(S){
    const gs=GS; if(!gs||gs.pickingUpgrade||gs.gameOver) return;
    gs.pickingUpgrade=true; gs._pausedByMenu=true;
    S.physics.pause(); S.time.timeScale=0;
    if(S.spawnEvent) S.spawnEvent.paused=true;
    try{ (S._activeEnemies||[]).forEach(e=>{
        if(e&&e.active&&e.body){ e._pausedVx=e.body.velocity.x; e._pausedVy=e.body.velocity.y; e.body.setVelocity(0,0); }
    }); }catch(_){}
    _hideMobileBtns(S);

    const W=360,H=640,CX=W/2,CY=H/2;
    const objs=[]; const A=o=>{objs.push(o);return o;};

    // Overlay
    A(S.add.rectangle(CX,CY,W,H,0x000000,0.55).setDepth(500).setInteractive());

    // Panel measurements — runtime pixel sampling
    const pm = NT_Measure(S,"ui_pause_win",300);
    const panelCY = CY + 28;
    const sprite  = A(S.add.image(CX,panelCY,"ui_pause_win").setScale(pm.sc).setDepth(501));
    const pTop=panelCY-pm.H/2, pBot=panelCY+pm.H/2;
    const stripCY    = pTop + pm.stripH/2;
    const contentTop = pTop + pm.stripH + 10;
    const contentBot = pBot - pm.goldH  - 8;
    const btnCY      = pBot - pm.goldH/2;
    const TX=CX-140, VX=CX+140;

    // Title in orange strip
    const pLabel=CURRENT_LANG==="en"?"PAUSED":CURRENT_LANG==="ru"?"ПАУЗА":"DURAKLANDI";
    A(S.add.text(CX,stripCY,"⏸  "+pLabel,{
        fontFamily:"LilitaOne, Arial, sans-serif",
        fontSize:"28px",color:"#ffffff",stroke:"#5a0000",strokeThickness:5
    }).setOrigin(0.5).setDepth(503));

    // Stats rows
    let cy=contentTop+4;
    const ROW=24;
    const FS={fontFamily:"LilitaOne, Arial, sans-serif",fontSize:"14px"};

    const _div=(lbl,hex)=>{
        if(cy+ROW>contentBot-4) return;
        const dg=A(S.add.graphics().setDepth(502));
        dg.lineStyle(1,hex,0.28); dg.lineBetween(TX,cy+10,VX,cy+10);
        A(S.add.text(CX,cy+2,lbl,{...FS,color:"#"+hex.toString(16).padStart(6,"0")}).setOrigin(0.5,0).setDepth(503));
        cy+=ROW;
    };
    const _row=(lbl,val,col)=>{
        if(cy+ROW>contentBot-4) return;
        A(S.add.text(TX,cy,lbl,{...FS,color:"#88aacc"}).setOrigin(0,0.5).setDepth(503));
        A(S.add.text(VX,cy,val,{...FS,color:col}).setOrigin(1,0.5).setDepth(503));
        cy+=ROW;
    };
    _div(CURRENT_LANG==="en"?"STATS":"ISTATISTIKLER",0x44aacc);
    _row("HP",   gs.health+"/"+gs.maxHealth,"#ff7777");
    _row("DMG",  gs.damage.toFixed(1),       "#ffcc44");
    _row("RATE", (1000/gs.shootDelay).toFixed(1)+"/s","#ff8844");
    _row("LV",   "Lv "+gs.level,             "#88ddff");
    const aUps =Object.entries(UPGRADES).filter(([k,u])=>u.level>0&&u.type==="passive");
    const aWeps=Object.entries(UPGRADES).filter(([k,u])=>u.level>0&&(u.type==="weapon"||u.type==="mainweapon"));
    if(aUps.length>0){ _div(CURRENT_LANG==="en"?"PASSIVE":"PASIF GUCLER",0x44cc88); aUps.slice(0,3).forEach(([k,u])=>_row(L(u.nameKey),u.level+"/"+u.max,"#88cc88")); }
    if(aWeps.length>0){ _div(CURRENT_LANG==="en"?"WEAPONS":"SILAHLAR",0xffaa44); aWeps.slice(0,3).forEach(([k,u])=>_row(L(u.nameKey),u.level+"/"+u.max,"#ffcc88")); }

    // Buttons — in gold area
    const BW=130,BH=44,BR=10,BGAP=12;
    const BLX=CX-BW/2-BGAP/2, BRX=CX+BW/2+BGAP/2;
    const _btn=(bx,lbl,fn)=>{
        const g=A(S.add.graphics().setDepth(503));
        const d=(h)=>{
            g.clear();
            g.fillStyle(0xaa6600,1); g.fillRoundedRect(bx-BW/2+2,btnCY-BH/2+4,BW,BH,{bl:BR,br:BR,tl:2,tr:2});
            g.fillStyle(h?0xffe84d:0xffdd00,1); g.fillRoundedRect(bx-BW/2,btnCY-BH/2,BW,BH,BR);
            g.fillStyle(0xffffff,h?0.22:0.10); g.fillRoundedRect(bx-BW/2+6,btnCY-BH/2+5,BW-12,BH/2-6,6);
            g.lineStyle(2,0xcc8800,0.8); g.strokeRoundedRect(bx-BW/2,btnCY-BH/2,BW,BH,BR);
        };
        d(false);
        A(S.add.text(bx,btnCY,lbl,{fontFamily:"LilitaOne, Arial, sans-serif",fontSize:"15px",color:"#3d1a00"}).setOrigin(0.5).setDepth(504));
        const h=A(S.add.rectangle(bx,btnCY,BW,BH,0xffffff,0.001).setDepth(505).setInteractive({useHandCursor:true}));
        h.on("pointerover",()=>d(true)).on("pointerout",()=>d(false));
        h.on("pointerdown",()=>fn());
    };
    const rLbl=CURRENT_LANG==="en"?"▶  RESUME":"▶  DEVAM ET";
    const mLbl=CURRENT_LANG==="en"?"MAIN MENU":"ANA MENU";
    _btn(BLX,rLbl,closeAll);
    _btn(BRX,mLbl,()=>{
        closeAll();
        Object.keys(UPGRADES).forEach(k=>UPGRADES[k].level=0);
        EVOLUTIONS.forEach(e=>e.active=false);
        // Crossfade music back to calm menu state (2.5s transition)
        NT_SFX.setMusicState("menu", 2.5);
        if(S.scene.manager.keys["SceneMainMenu"]){
            S.scene.start("SceneMainMenu");
        } else {
            S.scene.restart();
        }
    });

    // Ses toggle'lari kaldirildi — menudeki Settings'ten kontrol edilir.

    // Animate in — sprite only; content visible immediately
    sprite.setScale(pm.sc*0.04).setAlpha(0);
    S.tweens.add({targets:sprite,scaleX:pm.sc,scaleY:pm.sc,alpha:1,duration:180,ease:"Back.easeOut"});

    function closeAll(){
        objs.forEach(o=>{try{if(o.disableInteractive)o.disableInteractive();o.destroy();}catch(_){}});
        gs._pausedByMenu=false; S.time.timeScale=1.0;
        _upgradeLock=0; _levelUpChoosing=false; gs.pickingUpgrade=false;
        S.physics.resume(); if(S.spawnEvent)S.spawnEvent.paused=false;
        try{ (S._activeEnemies||[]).forEach(e=>{if(e&&e.active&&e.body&&e._pausedVx!==undefined){ e.body.setVelocity(e._pausedVx,e._pausedVy); delete e._pausedVx; delete e._pausedVy; }}); }catch(_){}
        S._openPanel=null;
    }
}
// ── SLOT UI — [UI REDESIGN] XP bar cakismasi giderildi, panel bg eklendi
function buildSlotUI(S){
    S.weaponSlots=[]; S.passiveSlots=[]; S.weaponSlotIcons=[]; S.passiveSlotIcons=[];
    const D=50;
    const SW=20, SH=20, GAP=3;
    // [UI] Y konumlari: XP bar (0-10) + guvenli mesafe → weapon:14, passive:38
    const WY=14, PY=38;
    const totalSlotW=(MAX_WEAPONS*(SW+GAP))-GAP;

    // [UI POLISH] Slot panel arka plani TAMAMEN KALDIRILDI
    // Slotlar artik arkaplan paneli olmadan direkt gorunur
    // Okunabilirlik slot kenarliklarinin kendi border/glow'u ile saglanir

    // Silah slotlari
    for(let i=0;i<MAX_WEAPONS;i++){
        const sx=4+i*(SW+GAP);
        const bg=S.add.graphics().setDepth(D).setScrollFactor(0);
        bg.fillStyle(0x1a2840,0.28); bg.fillRoundedRect(sx,WY,SW,SH,2);
        bg.lineStyle(1,0x3a5880,0.60); bg.strokeRoundedRect(sx,WY,SW,SH,2);
        S.weaponSlots.push(bg);
        const ico=S.add.image(sx+SW/2,WY+SH/2,"upicon_damage")
            .setDisplaySize(SW-2,SH-2).setDepth(D+1).setAlpha(0).setScrollFactor(0);
        S.weaponSlotIcons.push(ico);
    }

    // Pasif slotlari
    for(let i=0;i<MAX_PASSIVES;i++){
        const sx=4+i*(SW+GAP);
        const bg=S.add.graphics().setDepth(D).setScrollFactor(0);
        bg.fillStyle(0x1a3020,0.28); bg.fillRoundedRect(sx,PY,SW,SH,2);
        bg.lineStyle(1,0x2a5030,0.60); bg.strokeRoundedRect(sx,PY,SW,SH,2);
        S.passiveSlots.push(bg);
        const ico=S.add.image(sx+SW/2,PY+SH/2,"upicon_maxhp")
            .setDisplaySize(SW-2,SH-2).setDepth(D+1).setAlpha(0).setScrollFactor(0);
        S.passiveSlotIcons.push(ico);
    }
}

function refreshSlots(S){
    const SW=20, SH=20, GAP=3;
    const WY=14, PY=38;
    const rarityC={common:0x4488ff,rare:0xaa44ff,epic:0xff8800,legendary:0xffcc00};

    // [FIX] Slotlar alim sirasina gore kalici tutulur — her refresh'te yeniden siralanmaz
    // _weaponSlotKeys ve _passiveSlotKeys, upgrade alindiginda applyUpgrade'de guncellenir
    if(!S._weaponSlotKeys) S._weaponSlotKeys=[];
    if(!S._passiveSlotKeys) S._passiveSlotKeys=[];

    // Artik aktif olmayan (level=0) key'leri listeden temizle
    S._weaponSlotKeys = S._weaponSlotKeys.filter(k=>UPGRADES[k]&&UPGRADES[k].level>0);
    S._passiveSlotKeys= S._passiveSlotKeys.filter(k=>UPGRADES[k]&&UPGRADES[k].level>0);

    // Listeye henuz eklenmemis ama level>0 olan upgrade'leri sona ekle (guvenlik)
    Object.entries(UPGRADES).forEach(([k,u])=>{
        if((u.type==="weapon"||u.type==="mainweapon")&&u.level>0&&!S._weaponSlotKeys.includes(k))
            S._weaponSlotKeys.push(k);
        if(u.type==="passive"&&u.level>0&&!S._passiveSlotKeys.includes(k))
            S._passiveSlotKeys.push(k);
    });

    const weapons = S._weaponSlotKeys.map(k=>[k,UPGRADES[k]]).filter(([k,u])=>u);
    const passives= S._passiveSlotKeys.map(k=>[k,UPGRADES[k]]).filter(([k,u])=>u);
    // [UPGRADE VIZUEL] Level bazli pulse icin zaman referansi
    const t=GS?GS.t*0.001:0;

    S.weaponSlotIcons.forEach((ico,i)=>{
        if(!ico||!ico.scene) return;
        const sx=5+i*(SW+GAP);
        const bg=S.weaponSlots[i];
        if(!bg) return;
        if(i<weapons.length){
            const [k,u]=weapons[i];
            const rc=rarityC[u.rarity]||0x4488ff;
            // [UPGRADE VIZUEL] Level oranina gore artan glow, maxed'de altin kenarlik + pulse
            const lvRatio=u.level/u.max;
            const effectColor=lvRatio>=1?0xffcc00:rc;
            const pulseAlpha=lvRatio>=1?(0.12+Math.sin(t*3)*0.08):(0.08+lvRatio*0.22);
            bg.clear();
            bg.fillStyle(effectColor,pulseAlpha); bg.fillRoundedRect(sx+1,WY+1,SW-2,SH-2,2);
            bg.lineStyle(lvRatio>=1?2:1.5,effectColor,0.85+lvRatio*0.1);
            bg.strokeRoundedRect(sx,WY,SW,SH,2);
            // Maxed: dis parlama halkasi
            if(lvRatio>=1){
                bg.lineStyle(1,0xffcc00,0.22+Math.sin(t*3)*0.1);
                bg.strokeRoundedRect(sx-2,WY-2,SW+4,SH+4,3);
            }
            // Level pip seridi — slotun altinda
            for(let lv=0;lv<u.max;lv++){
                const pip_w=Math.floor((SW-2)/u.max);
                bg.fillStyle(lv<u.level?effectColor:0x1a1a2e,lv<u.level?0.85:0.3);
                bg.fillRect(sx+1+lv*pip_w,WY+SH-2,pip_w-0.5,2);
            }
            try{
                const texKey = (S.textures.exists(u.icon)) ? u.icon : "upicon_damage";
                ico.setTexture(texKey).setPosition(sx+SW/2,WY+SH/2-1)
                   .setDisplaySize(SW-2,SH-2).setAlpha(1).setVisible(true)
                   .setScrollFactor(0).clearTint();
                ico.setTint(lvRatio>=1?0xffee88:0xffffff);
            }catch(e){console.warn("[NT] weapon slot icon error:",e);}
        }
    });

    S.passiveSlotIcons.forEach((ico,i)=>{
        if(!ico||!ico.scene) return;
        const sx=5+i*(SW+GAP);
        const bg=S.passiveSlots[i];
        if(!bg) return;
        if(i<passives.length){
            const [k,u]=passives[i];
            const rc=rarityC[u.rarity]||0x44aa44;
            const lvRatio=u.level/u.max;
            const effectColor=lvRatio>=1?0xffcc00:rc;
            const pulseAlpha=lvRatio>=1?(0.12+Math.sin(t*3+1)*0.08):(0.08+lvRatio*0.22);
            bg.clear();
            bg.fillStyle(effectColor,pulseAlpha); bg.fillRoundedRect(sx+1,PY+1,SW-2,SH-2,2);
            bg.lineStyle(lvRatio>=1?2:1.5,effectColor,0.85+lvRatio*0.1);
            bg.strokeRoundedRect(sx,PY,SW,SH,2);
            if(lvRatio>=1){
                bg.lineStyle(1,0xffcc00,0.22+Math.sin(t*3+1)*0.1);
                bg.strokeRoundedRect(sx-2,PY-2,SW+4,SH+4,3);
            }
            for(let lv=0;lv<u.max;lv++){
                const pip_w=Math.floor((SW-2)/u.max);
                bg.fillStyle(lv<u.level?effectColor:0x1a1a2e,lv<u.level?0.85:0.3);
                bg.fillRect(sx+1+lv*pip_w,PY+SH-2,pip_w-0.5,2);
            }
            try{
                const texKey = (S.textures.exists(u.icon)) ? u.icon : "upicon_maxhp";
                ico.setTexture(texKey).setPosition(sx+SW/2,PY+SH/2-1)
                   .setDisplaySize(SW-2,SH-2).setAlpha(1).setVisible(true)
                   .setScrollFactor(0).clearTint();
                ico.setTint(lvRatio>=1?0xffee88:0xffffff);
            }catch(e){console.warn("[NT] passive slot icon error:",e);}
        } else {
            bg.clear();
            bg.fillStyle(0x1a3020,0.25); bg.fillRoundedRect(sx,PY,SW,SH,2);
            bg.lineStyle(1,0x2a5030,0.55); bg.strokeRoundedRect(sx,PY,SW,SH,2);
            ico.setAlpha(0);
        }
    });
}

// ── HASAR / COMBAT YARDIMCILARI ───────────────────────────────
// ═══════════════════════════════════════════════════════════════════════
// ★ JUICY TEXT VFX SYSTEM v3 — Professional combat text with full VFX
//   LilitaOne font · glow layers · particle bursts · smooth easing
//   Functions: spawnDamageText · spawnComboText · spawnGoldText
//              spawnKillText · spawnLevelUpText
//   + upgraded showDmgNum (drop-in compatible)
// ═══════════════════════════════════════════════════════════════════════

// ── Internal helpers ────────────────────────────────────────────────

// Soft glow: duplicate text drawn behind the main text for bloom effect
function _jtGlow(S, x, y, str, fontSize, hexCol, glowCol, depth, alpha){
    try{
        const g = S.add.text(x, y, str, {
            fontFamily:"LilitaOne",
            fontSize: fontSize+"px",
            color: glowCol || hexCol,
            stroke: glowCol || hexCol,
            strokeThickness: Math.round(fontSize * 0.7),
            padding:{x:4,y:4}
        }).setOrigin(0.5).setDepth(depth-1).setAlpha((alpha||0.22)).setScale(1.08);
        return g;
    }catch(e){ return null; }
}

// Spawn small particle burst around text spawn point
function _jtBurst(S, x, y, col, count, depth){
    if(!S||!_POOL) return;
    const n = Math.min(count||5, 8);
    for(let i=0;i<n;i++){
        const p = _POOL.get(depth||44); if(!p) continue;
        const ang = Phaser.Math.DegToRad((i/n)*360 + Phaser.Math.Between(-20,20));
        const spd = Phaser.Math.Between(12, 32);
        const len = Phaser.Math.Between(2, 5);
        p.lineStyle(1.5, col, 0.85);
        p.lineBetween(0, 0, Math.cos(ang)*len, Math.sin(ang)*len);
        p.setPosition(x, y);
        _pt(S, p, {
            x: x + Math.cos(ang)*spd,
            y: y + Math.sin(ang)*spd*0.65,
            alpha:0, scaleY:0.1,
            duration: Phaser.Math.Between(120, 260),
            ease:"Quad.easeOut"
        });
    }
}

// Ghost trail: faint copies that fade right after spawn
function _jtTrail(S, x, y, str, fontSize, hexCol, depth){
    if(_perfMode==="low") return;
    try{
        for(let i=0;i<2;i++){
            const ghost = S.add.text(
                x + Phaser.Math.Between(-3,3),
                y + Phaser.Math.Between(-2,2),
                str, {
                    fontFamily:"LilitaOne",
                    fontSize: (fontSize*(0.9-i*0.1))+"px",
                    color: hexCol,
                    padding:{x:2,y:2}
                }
            ).setOrigin(0.5).setDepth(depth-2).setAlpha(0.25-i*0.08);
            S.tweens.add({targets:ghost, alpha:0, y:ghost.y-10,
                duration:180+i*60, ease:"Quad.easeOut",
                onComplete:()=>{ try{ghost.destroy();}catch(e){} }
            });
        }
    }catch(e){}
}

// Safe destroy helper
function _jtDestroy(objs){
    objs.forEach(o=>{ try{ if(o&&o.destroy) o.destroy(); }catch(e){} });
}

// ── DAMAGE NUMBER POOL ──────────────────────────────────────────────
let _dmgNumCount=0;
const MAX_DMG_NUMS=12;

// ╔══════════════════════════════════════════════════════════╗
// ║  spawnDamageText(x, y, value, isCrit)                   ║
// ║  Replaces showDmgNum — drop-in compatible               ║
// ╚══════════════════════════════════════════════════════════╝
function spawnDamageText(S, x, y, value, isCrit){
    if(!S||!S.add) return;
    if(window._nt_dmg_nums===false) return;
    if(_dmgNumCount>=MAX_DMG_NUMS) return;
    // [MOBILE PERF] mobilede normal hit hasar sayisi gosterilmez; sadece crit
    if(_IS_MOBILE_EARLY && !isCrit) return;
    _dmgNumCount++;

    const ox = Phaser.Math.Between(-10,10);
    const oy = Phaser.Math.Between(-4,2);
    const tx = x + ox, ty = y + oy;

    const str = ""+Math.round(value);

    if(isCrit){
        NT_SFX.play("hit_crit");
        // ── CRIT: bright red/orange, large, glow, burst
        const isBig = value >= 8;
        const col   = isBig ? "#ff2200" : "#ff7700";
        const gcol  = isBig ? "#ff4400" : "#ff9900";
        const fs    = isBig ? 22 : 18;
        const depth = 43;

        // Glow layer
        const glow = _jtGlow(S, tx, ty, str, fs, col, gcol, depth, 0.28);

        // Main text
        const t = S.add.text(tx, ty, str, {
            fontFamily:"LilitaOne",
            fontSize: fs+"px",
            color: col,
            stroke:"#1a0000",
            strokeThickness: 4,
            padding:{x:2,y:1}
        }).setOrigin(0.5).setDepth(depth).setScale(0.1);

        // Particle burst
        _jtBurst(S, tx, ty, isBig?0xff2200:0xff8800, 6, 44);

        // Ghost trails
        _jtTrail(S, tx, ty, str, fs, col, depth);

        // Animation: 0.1 → 1.35 → 1.0 → float+fade
        S.tweens.add({targets:[t, glow].filter(Boolean),
            scaleX:1.35, scaleY:1.35, duration:90, ease:"Back.easeOut",
            onComplete:()=>{
                S.tweens.add({targets:[t, glow].filter(Boolean),
                    scaleX:1.0, scaleY:1.0, duration:55, ease:"Quad.easeOut",
                    onComplete:()=>{
                        S.tweens.add({targets:[t, glow].filter(Boolean),
                            y: ty-60, alpha:0, duration:680, ease:"Quad.easeOut",
                            onComplete:()=>{
                                _dmgNumCount=Math.max(0,_dmgNumCount-1);
                                _jtDestroy([t, glow]);
                            }
                        });
                    }
                });
            }
        });

        // Crit ring
        const cr = S.add.graphics().setDepth(42);
        cr.x=tx; cr.y=ty;
        cr.lineStyle(2.5, isBig?0xff2200:0xff7700, 1.0); cr.strokeCircle(0,0,10);
        cr.lineStyle(1.2, 0xffffff, 0.5); cr.strokeCircle(0,0,5);
        S.tweens.add({targets:cr, scaleX:3.2, scaleY:3.2, alpha:0,
            duration:260, ease:"Quad.easeOut",
            onComplete:()=>cr.destroy()
        });

    } else {
        NT_SFX.play("hit_normal");
        // ── NORMAL: white→yellow gradient feel, size by value
        const big   = value >= 10;
        const med   = value >= 4;
        const tiny  = value < 2;
        const col   = big?"#ffffff": med?"#ffe599": tiny?"#aaaaaa":"#ffdd88";
        const fs    = big?14: med?12: 9;
        const depth = 40;

        const t = S.add.text(tx, ty, str, {
            fontFamily:"LilitaOne",
            fontSize: fs+"px",
            color: col,
            stroke:"#000000",
            strokeThickness:2,
            padding:{x:1,y:0}
        }).setOrigin(0.5).setDepth(depth)
          .setAlpha(big?1.0: tiny?0.55: 0.88);

        const rise = big?42: med?30: 18;
        const dur  = big?420: med?320: 220;

        // Scale pop for big hits
        if(big){
            t.setScale(0.5);
            S.tweens.add({targets:t, scaleX:1.0, scaleY:1.0,
                duration:80, ease:"Back.easeOut",
                onComplete:()=>{
                    S.tweens.add({targets:t, y:ty-rise, alpha:0,
                        duration:dur, ease:"Quad.easeOut",
                        onComplete:()=>{
                            _dmgNumCount=Math.max(0,_dmgNumCount-1);
                            try{t.destroy();}catch(e){}
                        }
                    });
                }
            });
        } else {
            S.tweens.add({targets:t, y:ty-rise, alpha:0,
                duration:dur, ease:"Quad.easeOut",
                onComplete:()=>{
                    _dmgNumCount=Math.max(0,_dmgNumCount-1);
                    try{t.destroy();}catch(e){}
                }
            });
        }
    }
}

// Backward-compatible alias (all existing showDmgNum calls still work)
function showDmgNum(S,x,y,val,isCrit){ spawnDamageText(S,x,y,val,isCrit); }

// ╔══════════════════════════════════════════════════════════╗
// ║  spawnComboText(x, y, combo)                            ║
// ║  Called from renderUI when combo milestone hits         ║
// ╚══════════════════════════════════════════════════════════╝
function spawnComboText(S, x, y, combo){
    if(!S||!S.add) return;
    NT_SFX.play("combo", combo);

    // Color progression: low=cyan, mid=purple, high=orange/red
    const col = combo>=20?"#ff2244": combo>=15?"#ff6600": combo>=10?"#cc44ff":
                combo>=5 ?"#8844ff": "#44ccff";
    const gcol= combo>=20?"#ff4466": combo>=15?"#ff8800": combo>=10?"#dd66ff":
                combo>=5 ?"#aa66ff": "#66ddff";

    // Scale grows with combo: base 1.0 → max 1.5
    const baseScale = Math.min(1.5, 1.0 + combo * 0.025);
    const fs = Math.round(Math.min(28, 16 + combo * 0.5));
    const str = "×"+combo+" COMBO";
    const depth = 55;

    // Rotation jitter ±5 deg
    const rot = Phaser.Math.Between(-5, 5);

    // Glow layer
    const glow = _jtGlow(S, x, y, str, fs, col, gcol, depth, 0.22);

    // Main text
    const t = S.add.text(x, y, str, {
        fontFamily:"LilitaOne",
        fontSize: fs+"px",
        color: col,
        stroke:"#000000",
        strokeThickness: 4,
        padding:{x:3,y:2}
    }).setOrigin(0.5).setDepth(depth).setScale(0.3).setAngle(rot);

    // Burst particles
    const burstCol = combo>=20?0xff2244: combo>=10?0xff6600: combo>=5?0xaa44ff: 0x44ccff;
    _jtBurst(S, x, y, burstCol, Math.min(8, 3+Math.floor(combo/4)), depth+1);

    const allC = [t, glow].filter(Boolean);

    // Giris: squash → elastic pop → settle
    S.tweens.add({
        targets: allC,
        scaleX: baseScale * 0.6,
        scaleY: baseScale * 1.4,
        angle: 0,
        duration: 80,
        ease: "Quad.easeOut",
        onComplete: ()=>{
            S.tweens.add({
                targets: allC,
                scaleX: baseScale * 1.22,
                scaleY: baseScale * 0.88,
                duration: 180,
                ease: "Back.easeOut",
                onComplete: ()=>{
                    S.tweens.add({
                        targets: allC,
                        scaleX: baseScale,
                        scaleY: baseScale,
                        duration: 100,
                        ease: "Quad.easeOut",
                        onComplete: ()=>{

                            // Nefes alma
                            const breath = S.tweens.add({
                                targets: allC,
                                scaleX: { from: baseScale, to: baseScale * 1.09 },
                                scaleY: { from: baseScale, to: baseScale * 1.09 },
                                duration: 300,
                                ease: "Sine.easeInOut",
                                yoyo: true,
                                repeat: -1
                            });

                            // Sag-sol sallama
                            const swing = S.tweens.add({
                                targets: allC,
                                angle: { from: -4, to: 4 },
                                duration: 220,
                                ease: "Sine.easeInOut",
                                yoyo: true,
                                repeat: -1
                            });

                            // Fade out
                            S.tweens.add({
                                targets: allC,
                                alpha: 0,
                                y: y - 38,
                                scaleX: 0.5,
                                scaleY: 0.5,
                                angle: 0,
                                duration: 380,
                                delay: 520,
                                ease: "Quad.easeIn",
                                onStart: ()=>{
                                    breath.stop();
                                    swing.stop();
                                },
                                onComplete: ()=>{ _jtDestroy([t, glow]); }
                            });
                        }
                    });
                }
            });
        }
    });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  spawnGoldText(x, y, amount)                            ║
// ╚══════════════════════════════════════════════════════════╝
function spawnGoldText(S, x, y, amount){
    if(!S||!S.add) return;
    NT_SFX.play("gold");
    const str  = "+"+amount+"G";
    const fs   = amount>=5 ? 16 : 13;
    const depth= 38;

    // Shine flicker via glow
    const glow = _jtGlow(S, x, y, str, fs, "#FFD700", "#FFB800", depth, 0.30);

    const t = S.add.text(x, y, str, {
        fontFamily:"LilitaOne",
        fontSize: fs+"px",
        color:"#FFD700",
        stroke:"#7a4400",
        strokeThickness:3,
        padding:{x:2,y:1}
    }).setOrigin(0.5).setDepth(depth).setAlpha(0).setScale(0.6);

    // Horizontal drift offset
    const driftX = Phaser.Math.Between(-18, 18);

    // Pop in + float up + drift + fade
    S.tweens.add({targets:[t, glow].filter(Boolean),
        alpha:1, scaleX:1.0, scaleY:1.0,
        duration:90, ease:"Back.easeOut",
        onComplete:()=>{
            // Shine flicker on glow
            if(glow && _perfMode!=="low"){
                S.tweens.add({targets:glow,
                    alpha:{from:0.30, to:0.08},
                    duration:180, yoyo:true, repeat:1, ease:"Sine.easeInOut"
                });
            }
            S.tweens.add({targets:[t, glow].filter(Boolean),
                y: y-38, x: x+driftX, alpha:0,
                duration:580, delay:160, ease:"Quad.easeOut",
                onComplete:()=>{ _jtDestroy([t, glow]); }
            });
        }
    });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  spawnKillText(x, y)                                    ║
// ╚══════════════════════════════════════════════════════════╝
function spawnKillText(S, x, y){
    if(!S||!S.add) return;
    // Kill chain: art arda killlar daha agir ses cikarir
    const now=performance.now();
    if(now - _killChainLast > _KILL_CHAIN_GAP) _killChain=0;
    _killChain=Math.min(_killChain+1, 5);
    _killChainLast=now;
    NT_SFX.play("multi_kill", _killChain);
    const str   = "KILL!";
    const fs    = 18;
    const depth = 46;

    // Glow layer
    const glow = _jtGlow(S, x, y, str, fs, "#ff3300", "#ff6600", depth, 0.30);

    const t = S.add.text(x, y, str, {
        fontFamily:"LilitaOne",
        fontSize: fs+"px",
        color:"#ff3300",
        stroke:"#220000",
        strokeThickness:5,
        padding:{x:3,y:2}
    }).setOrigin(0.5).setDepth(depth).setScale(0.1);

    // Burst behind text
    _jtBurst(S, x, y, 0xff3300, 7, depth-1);
    _jtBurst(S, x, y, 0xff8800, 4, depth-1);

    // Text-only shake (translate oscillation — no camera)
    const startX = x;
    let shakePhase = 0;
    const shakeTick = S.time.addEvent({delay:16, repeat:5, callback:()=>{
        shakePhase++;
        t.x = startX + Math.sin(shakePhase*2.8)*3;
        if(glow) glow.x = t.x;
    }});

    // Pop in → shake → float fade
    S.tweens.add({targets:[t, glow].filter(Boolean),
        scaleX:1.3, scaleY:1.3, duration:80, ease:"Back.easeOut",
        onComplete:()=>{
            S.tweens.add({targets:[t, glow].filter(Boolean),
                scaleX:1.0, scaleY:1.0, duration:60, ease:"Quad.easeOut",
                onComplete:()=>{
                    S.tweens.add({targets:[t, glow].filter(Boolean),
                        y:y-50, alpha:0, duration:500, delay:200, ease:"Quad.easeOut",
                        onComplete:()=>{ _jtDestroy([t, glow]); }
                    });
                }
            });
        }
    });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  spawnTriangleQuip(S, px, py)                           ║
// ║  Üçgen vurulduğunda karakterden komik sohbet balonu     ║
// ╚══════════════════════════════════════════════════════════╝
const _QUIP_TR = [
    "Bak nasıl geçtim!",
    "Hadi oradan üçgen!",
    "Geometri bitti!",
    "Bu mu en iyisiydi?",
    "Açıların acıtmıyor!",
    "Üçgen misin sen?",
    "Matematiği geçtim!",
    "Güle güle piramit!",
    "Köşeli misin canım!",
    "Bir daha gel bakalım!",
    "Keskin mi sandın?",
    "İşte bu kadar...",
    "Fena değildim ha?",
    "Sıradaki!",
    "Geçmiş olsun!",
    "Piramit sandın mı?",
    "Aman yarabbi!",
    "Yetersiz açı!",
    "Tam üstüne!",
    "Ben buyum!",
    "Ne zamandır bekliyordum!",
    "Dur bakalım!",
    "Şimdiye kadar neredeydin?",
    "Eyw!",
    "Oh be!",
    "Teker teker geliyin!",
    "Hepsini temizlerim!",
    "Git şimdi!",
    "Hoşça kal eşkenar!",
    "Kalmamış mı?",
    "Seni çoktan bekliyordum!",
    "Bu mudur saldırı!",
    "Harikayım ben ya!",
    "Açı mı verirsin?",
    "Yan mı baktın bana?",
    "Kolay gelsin!",
    "Deli miyim ben?",
    "Şampiyonum ben!",
    "Bok ettin!",
    "Bana göre değilsin!",
    "Allah'ım bak!",
    "Silindir mi sandın?",
    "Dur diyorum!",
    "İşte kral budur!",
    "Süper süper!",
    "İlk değil son değil!",
    "Kahraman bu tarafta!",
    "Evet evet evet!",
    "Çığır açtım!",
];
const _QUIP_EN = [
    "Get rekt, triangle!",
    "Geometry solved!",
    "Too easy!",
    "Who's next?!",
    "Sharp? I'm sharper!",
    "Math just died!",
    "Pyramid? More like bye-mid!",
    "Angles can't save you!",
    "See ya, pointy!",
    "Three sides? Zero chance!",
    "I'm on fire!",
    "Is that all?!",
    "Come on then!",
    "Oops, you slipped!",
    "Smashed it!",
    "Not today!",
    "Triangles fear me!",
    "Next please!",
    "Easy peasy!",
    "Nailed it!",
    "Booom!",
    "Like butter!",
    "Can't touch this!",
    "Another one bites dust!",
    "I'm unstoppable!",
    "Welp, goodbye!",
    "Oh yeah!",
    "Piece of cake!",
    "Ha! Too slow!",
    "Don't mess with me!",
    "That tickled!",
    "Catch me if you can!",
    "Obliterated!",
    "KAPOW!",
    "You had ONE job!",
    "Yeeted into oblivion!",
    "Pathetic!",
    "I could do this forever!",
    "RIP triangle!",
    "Gone in 0.1 seconds!",
    "Was that a triangle?!",
    "I sneezed harder!",
    "You call that an attack?",
    "My grandma's scarier!",
    "Touch me not!",
    "Skedaddle!",
    "Bye bye!",
    "King stuff!",
    "Legendary!",
    "That's how it's done!",
];

// Kill sayacına göre özel mesajlar
const _QUIP_MILESTONE_TR = {
    10:  "10 UCGEN! Isınıyorum!",
    25:  "25! Ben bir makine miyim?!",
    50:  "50 Kill! Gerçek miyim ben?",
    100: "100 UCGEN! Efsaneyim!",
    200: "200?! Durun biraz...",
    500: "500 KILL! Tanrı mıyım ben?!",
};
const _QUIP_MILESTONE_EN = {
    10:  "10 kills! Just warming up!",
    25:  "25! Am I a machine?!",
    50:  "50 kills! Is this real?!",
    100: "100 TRIANGLES! I'm legendary!",
    200: "200?! Hold on a sec...",
    500: "500 KILLS! Am I a god?!",
};

let _quipLastTime = 0;
const _QUIP_COOLDOWN = 1800; // ms — aynı anda çok sık görünmesin
let _quipIdx = -1; // son kullanılan index (tekrar olmasın)

function spawnTriangleQuip(S, killCount){
    if(!S||!S.add||!S.player||!S.player.active) return;
    const now = performance.now();
    if(now - _quipLastTime < _QUIP_COOLDOWN) return;
    _quipLastTime = now;

    const isTR = (typeof CURRENT_LANG !== "undefined" && CURRENT_LANG === "tr");
    const milestones = isTR ? _QUIP_MILESTONE_TR : _QUIP_MILESTONE_EN;
    const quips      = isTR ? _QUIP_TR : _QUIP_EN;

    // Milestone mesajı varsa onu göster
    let msg = milestones[killCount] || null;
    if(!msg){
        // Rasgele ama son kullanılanı tekrarlama
        let idx;
        do { idx = Math.floor(Math.random() * quips.length); } while(idx === _quipIdx && quips.length > 1);
        _quipIdx = idx;
        msg = quips[idx];
    }

    // Karakterin üstünde konumlandır
    const px = S.player.x;
    const py = S.player.y - 52;
    const depth = 55;

    // Sadece yazı — balon yok, karakter rengine uygun stil
    const txt = S.add.text(px, py, msg, {
        fontFamily:      "LilitaOne, Arial, sans-serif",
        fontSize:        "11px",
        color:           "#ffffff",
        stroke:          "#222222",
        strokeThickness: 3,
        padding:         {x:2, y:2}
    }).setOrigin(0.5, 1).setDepth(depth+1).setAlpha(0);

    // Tracker hemen başlar — pop-in + float boyunca karakteri takip eder
    const _quipOffsetY = -52; // karakterin üstündeki sabit mesafe
    let _quipFloatOffset = 0; // float animasyonu sırasında yukarı kayma miktarı
    const _quipTotalDuration = 140 + 900 + 420; // pop-in + bekleme + fade
    const tracker = S.time.addEvent({
        delay:    16,
        repeat:   Math.ceil(_quipTotalDuration / 16) + 5,
        callback: () => {
            if(txt.active && S.player && S.player.active){
                txt.x = S.player.x;
                txt.y = S.player.y + _quipOffsetY - _quipFloatOffset;
            }
        }
    });

    // Pop-in
    S.tweens.add({
        targets:  txt,
        alpha:    1,
        scaleX:   { from: 0.5, to: 1 },
        scaleY:   { from: 0.5, to: 1 },
        duration: 140,
        ease:     "Back.easeOut",
        onComplete: () => {
            // Float yukarı + soluklaş; tracker zaten çalışıyor
            S.tweens.add({
                targets:  { val: 0 },
                val:      30,
                duration: 420,
                delay:    900,
                ease:     "Quad.easeIn",
                onUpdate: (tween, target) => {
                    _quipFloatOffset = target.val;
                },
                onComplete: () => {
                    tracker.remove(false);
                    try { txt.destroy(); } catch(e){}
                }
            });
            // Alpha fade ayrıca
            S.tweens.add({
                targets:  txt,
                alpha:    0,
                duration: 420,
                delay:    900,
                ease:     "Quad.easeIn"
            });
        }
    });
}

// ╔══════════════════════════════════════════════════════════╗
// ║  spawnLevelUpText(x, y)                                 ║
// ╚══════════════════════════════════════════════════════════╝
function spawnLevelUpText(S, x, y){
    if(!S||!S.add) return;
    NT_SFX.play("level_up");
    const str   = L("levelUp");
    const fs    = 24;
    const depth = 600;

    // Expanding energy ring behind text
    const ring = S.add.graphics().setDepth(depth-2);
    ring.x = x; ring.y = y;
    ring.lineStyle(3, 0xaa44ff, 0.90); ring.strokeCircle(0,0,14);
    ring.lineStyle(1.5, 0xffffff, 0.4); ring.strokeCircle(0,0,8);
    S.tweens.add({targets:ring, scaleX:9, scaleY:9, alpha:0,
        duration:700, ease:"Quad.easeOut",
        onComplete:()=>ring.destroy()
    });
    // Second ring delayed
    S.time.delayedCall(80, ()=>{
        if(!S||!S.add) return;
        const ring2 = S.add.graphics().setDepth(depth-2);
        ring2.x=x; ring2.y=y;
        ring2.lineStyle(2, 0xcc66ff, 0.7); ring2.strokeCircle(0,0,10);
        S.tweens.add({targets:ring2, scaleX:14, scaleY:14, alpha:0,
            duration:800, ease:"Quad.easeOut",
            onComplete:()=>ring2.destroy()
        });
    });

    // Glow layer
    const glow = _jtGlow(S, x, y, str, fs, "#cc44ff", "#aa00ff", depth, 0.30);

    // Main text
    const t = S.add.text(x, y, str, {
        fontFamily:"LilitaOne",
        fontSize: fs+"px",
        color:"#dd88ff",
        stroke:"#220044",
        strokeThickness:5,
        padding:{x:4,y:2}
    }).setOrigin(0.5).setDepth(depth).setScale(0.0).setAlpha(0);

    // Burst
    _jtBurst(S, x, y, 0xaa44ff, 8, depth+1);
    _jtBurst(S, x, y, 0xffffff, 4, depth+1);

    // Scale 0 → 1.5 → 1.0 with glow pulse
    S.tweens.add({targets:[t, glow].filter(Boolean),
        scaleX:1.5, scaleY:1.5, alpha:1,
        duration:260, ease:"Back.easeOut",
        onComplete:()=>{
            S.tweens.add({targets:[t, glow].filter(Boolean),
                scaleX:1.0, scaleY:1.0,
                duration:160, ease:"Quad.easeOut",
                onComplete:()=>{
                    // Glow pulse (alpha oscillation)
                    if(glow){
                        S.tweens.add({targets:glow,
                            alpha:{from:0.30, to:0.08},
                            duration:200, yoyo:true, repeat:2, ease:"Sine.easeInOut"
                        });
                    }
                    // Float up and out
                    S.tweens.add({targets:[t, glow].filter(Boolean),
                        y:y-55, alpha:0,
                        duration:600, delay:500, ease:"Quad.easeIn",
                        onComplete:()=>{ _jtDestroy([t, glow]); }
                    });
                }
            });
        }
    });
}
// ── Global mobil tespiti — patlama/VFX performans optimizasyonu
const _IS_MOBILE = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

// ── Nadir patlama sayaci — her ~4. patlamada exp1/exp2/exp3'ten biri cikar
let _rareExplCounter = 0;
function doExplodeVFX(S,x,y,col,sizeScale){
    if(!S||!_POOL) return;
    x=_snap(x); y=_snap(y);
    const sz=Math.min(sizeScale||1,1.8), col2=col||0xffcc55;

    // ── EXPLOSION SPRITE — Explosion2 genel, exp1/2/3 her ~4.'de nadir ──
    _rareExplCounter++;
    // Mobilde nadir efektler daha seyrek — FPS koruma
    const _rareInterval = _IS_MOBILE ? 8 : 6;
    const useRare = (_rareExplCounter % _rareInterval === 0);
    if(useRare){
        const rareKeys  = ["anim_exp1","anim_exp2","anim_exp3"];
        const texKeys   = ["exp1","exp2","exp3"];
        // exp1/exp2 daha kucuk scale, exp3 biraz daha buyuk ama hepsi azaltildi
        const rareScales= [
            Math.max(2.2, sz * 5.0),  // exp1 — 32px → ~70px gorsel
            Math.max(2.2, sz * 5.0),  // exp2 — 32px → ~70px gorsel
            Math.max(1.1, sz * 2.5),  // exp3 — 72px → ~79px gorsel
        ];
        // Agirlikli secim: exp3 %70, exp1 %15, exp2 %15
        const rnd = Math.random();
        const ri = rnd < 0.15 ? 0 : rnd < 0.30 ? 1 : 2;
        if(S.anims && S.anims.exists(rareKeys[ri])){
            try{
                const es=S.add.sprite(x,y,texKeys[ri]).setDepth(26).setScale(rareScales[ri]).setAlpha(0.97);
                es.play(rareKeys[ri]);
                es.once("animationcomplete",()=>{ try{es.destroy();}catch(_){} });
            }catch(_){}
        }
    } else {
        // Normal Explosion 2 sprite (ana patlama)
        if(S.anims && S.anims.exists("anim_expl")){
            try{
                const expScale = Math.max(2.8, Math.min(sz * 4.0, 6.0));
                const es=S.add.sprite(x,y,"explosion").setDepth(24).setScale(expScale).setAlpha(0.95);
                es.play("anim_expl");
                es.once("animationcomplete",()=>{ try{es.destroy();}catch(_){} });
            }catch(_){}
        }
    }

    // Inner flash burst
    const inner=_POOL.get(23); if(inner){
        inner.fillStyle(0xffffff,0.52); inner.fillCircle(0,0,6*sz);
        inner.setPosition(x,y);
        _pt(S,inner,{scaleX:2.5,scaleY:2.5,alpha:0,duration:100,ease:"Quad.easeIn"});
    }
    // Main colour ring
    const ring1=_POOL.get(23); if(ring1){
        ring1.lineStyle(3.5*sz,col2,1.0); ring1.strokeCircle(0,0,6);
        ring1.setPosition(x,y);
        _pt(S,ring1,{scaleX:4.5*sz,scaleY:4.5*sz,alpha:0,duration:340,ease:"Quad.easeOut"});
    }
    // Second ring (delayed) — SKIP on mobile
    if(!_IS_MOBILE_EARLY){
    S.time.delayedCall(42,()=>{
        const ring2=_POOL.get(22); if(!ring2) return;
        ring2.lineStyle(1.5,col2,0.60); ring2.strokeCircle(0,0,8);
        ring2.setPosition(x,y);
        _pt(S,ring2,{scaleX:6*sz,scaleY:6*sz,alpha:0,duration:440,ease:"Sine.easeOut"});
    });
    }
    // Colour orb centre — SKIP on mobile
    if(!_IS_MOBILE_EARLY){
    const orb=_POOL.get(23); if(orb){
        orb.fillStyle(col2,0.85); orb.fillCircle(0,0,8*sz);
        orb.fillStyle(0xffffff,0.55); orb.fillCircle(-2*sz,-2*sz,3*sz);
        orb.setPosition(x,y);
        _pt(S,orb,{scaleX:1.8,scaleY:1.8,alpha:0,duration:215,ease:"Quad.easeOut"});
    }
    }
    // Debris shards (pooled triangles via lines) — mobilde azalt
    const debrisCount=_IS_MOBILE ? 1 : (sz>=1.5?8:6);
    for(let i=0;i<debrisCount;i++){
        const dp=_POOL.get(22); if(!dp) break;
        const ang=(i/debrisCount)*Math.PI*2+Phaser.Math.FloatBetween(-0.3,0.3);
        const dist=Phaser.Math.Between(28,55)*sz;
        const len=Phaser.Math.Between(3,sz>=1.5?8:5);
        const dCol=i%2===0?0xffffff:col2;
        dp.lineStyle(1.5,dCol,0.92);
        dp.lineBetween(0,-len,len*0.8,len*0.6);
        dp.lineBetween(len*0.8,len*0.6,-len*0.8,len*0.6);
        dp.lineBetween(-len*0.8,len*0.6,0,-len);
        dp.setPosition(x,y);
        _pt(S,dp,{x:x+Math.cos(ang)*dist,y:y+Math.sin(ang)*dist+Phaser.Math.Between(8,25),
            angle:Phaser.Math.Between(-200,200),scaleX:0.1,scaleY:0.1,alpha:0,
            duration:Phaser.Math.Between(340,580),delay:i*14,ease:"Quad.easeOut"});
    }
    // Sparks (pooled) — mobilde azalt
    const sparkCount=_IS_MOBILE ? 0 : (sz>=1.5?8:5);
    for(let i=0;i<sparkCount;i++){
        S.time.delayedCall(i*16,()=>{
            const sp=_POOL.get(23); if(!sp) return;
            sp.fillStyle(i%2===0?0xffffff:col2,0.90);
            sp.fillRect(-1,-1,2,Phaser.Math.Between(4,8));
            sp.setPosition(x+Phaser.Math.Between(-10,10)*sz,y+Phaser.Math.Between(-10,10)*sz);
            const sa=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
            const sd=Phaser.Math.Between(18,42)*sz;
            _pt(S,sp,{x:sp.x+Math.cos(sa)*sd,y:sp.y+Math.sin(sa)*sd,
                angle:Phaser.Math.Between(-90,90),alpha:0,
                duration:Phaser.Math.Between(175,310),ease:"Quad.easeOut"});
        });
    }
    // Ground stain — SKIP on mobile
    if(!_IS_MOBILE_EARLY){
    S.time.delayedCall(80,()=>{
        const st=_POOL.get(5); if(!st) return;
        st.fillStyle(0x111111,0.32);
        st.fillEllipse(0,0,28*sz,8*sz);
        st.setPosition(x,y);
        _pt(S,st,{alpha:0,duration:1700,delay:380,ease:"Sine.easeIn"});
    });
    } // end mobile skip ground stain
}

function spawnHitDebris(S,x,y,type,isCrit){
    if(!S || !_POOL) return;
    // [PERF] Normal vuruslari throttle et — her carpismada degil
    if(!isCrit && !canSpawnParticle("normal")) return;
    // Mobilde normal debris tamamen yok, crit'te sadece halka
    if(_IS_MOBILE_EARLY && !isCrit) return;

    const typeC={normal:0xFF88CC,fast:0xFF6699,tank:0xAA55FF,shield:0x55BBFF,kamikaze:0xFFBB55,ghost:0xDDBBFF,
        split:0xFFEE44,swarm:0xFFBB66,elder:0xFFCC44,spinner:0xFF55DD,armored:0x9977FF,bomber:0xFF9966,
        stealth:0x44FFDD,healer:0x66FFAA,magnet:0xFFCC33,mirror:0xCCAAFF,berserker:0xFF7799,absorber:0x33EEFF,
        chain:0x77AAFF,freezer:0xAAEEFF,leech:0xFF77BB,titan:0xDD55FF,shadow:0xBB88FF,spiker:0xFFDD66,
        vortex:0x33FFCC,phantom:0xEEBBFF,rusher:0xFFAA55,splitter:0x88FF88,toxic:0xBBFF44,colossus:0xFF66AA,
        inferno:0xFF9977,glacier:0x66DDFF,phantom_tri:0xFF55FF,volt:0xFFFF66,obsidian:0xCC77FF,zigzag:0x88FF88};
    const baseCol=type==="volt"
        ?[0xffee00,0xffffff,0xffcc00][Math.floor(Math.random()*3)]
        :type==="inferno"?[0xFF9977,0xFFBB88,0xFFDD99][Math.floor(Math.random()*3)]
        :(typeC[type]||0xddbb88);

    // ── Impact burst halkasi — pool tabanli ──────────────────
    if(_POOL){
        const br=_POOL.get(22); if(br){
            br.lineStyle(isCrit?2:1.5,isCrit?baseCol:0xffffff,isCrit?0.90:0.70);
            br.strokeCircle(0,0,isCrit?6:4);
            br.setPosition(x,y);
            _pt(S,br,{scaleX:isCrit?4.5:3.2,scaleY:isCrit?4.5:3.2,alpha:0,
                duration:isCrit?180:120,ease:"Quad.easeOut"});
        }
    }

    // [MOBILE PERF] Cizgi parcaciklar ve chip parcaciklar mobilede yok
    if(_IS_MOBILE_EARLY) return;
    if(!_POOL) return;

    // ── Cizgi parcaciklar — pool, azaltilmis sayi ────────────
    const lineCnt=isCrit?4:2;
    for(let i=0;i<lineCnt;i++){
        const d=_POOL.get(17); if(!d) break;
        const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        const sp=Phaser.Math.Between(isCrit?22:10,isCrit?65:38);
        const col=i%2===0?baseCol:0xffffff;
        const len=isCrit?Phaser.Math.Between(3,5):Phaser.Math.Between(2,3);
        d.lineStyle(isCrit?1.8:1.2,col,isCrit?0.88:0.78);
        d.lineBetween(0,0,Math.cos(ang)*len,Math.sin(ang)*len);
        d.setPosition(x+Phaser.Math.Between(-4,4),y+Phaser.Math.Between(-4,4));
        _pt(S,d,{x:x+Math.cos(ang)*sp,y:y+Math.sin(ang)*sp*0.6,
            scaleX:0.05,scaleY:0.05,alpha:0,
            duration:Phaser.Math.Between(130,isCrit?280:180),ease:"Quad.easeOut"});
    }

    // ── Chip parcaciklari — pool, azaltilmis sayi ────────────
    const chipCnt=isCrit?3:1;
    for(let i=0;i<chipCnt;i++){
        const ch=_POOL.get(16); if(!ch) break;
        const sz=isCrit?Phaser.Math.Between(2,3):2;
        ch.fillStyle(i%2===0?baseCol:0xffffff,isCrit?0.90:0.78);
        ch.fillRect(-sz/2,-sz/2,sz,sz);
        ch.setPosition(x+Phaser.Math.Between(-5,5),y+Phaser.Math.Between(-3,3));
        const vx=Phaser.Math.Between(-50,50);
        _pt(S,ch,{x:ch.x+vx*0.4,y:y+Phaser.Math.Between(45,90),
            angle:Phaser.Math.Between(-180,180),alpha:0,scaleX:0.06,scaleY:0.06,
            duration:Phaser.Math.Between(180,isCrit?360:260),ease:"Quad.easeIn"});
    }

    // ── Kivilcim — pool, max 2 ────────────────────────────────
    if(isCrit){
        const sp2=_POOL.get(19); if(sp2){
            const sang=Phaser.Math.DegToRad(Phaser.Math.Between(-175,-5));
            const ssp=Phaser.Math.Between(18,50);
            sp2.lineStyle(1.5,0xffee44,0.88);
            sp2.lineBetween(0,-4,0,4);
            sp2.setPosition(x+Phaser.Math.Between(-3,3),y+Phaser.Math.Between(-3,3));
            _pt(S,sp2,{x:sp2.x+Math.cos(sang)*ssp,y:sp2.y+Math.sin(sang)*ssp*0.5,
                alpha:0,scaleY:0.15,duration:Phaser.Math.Between(90,180),ease:"Quad.easeOut"});
        }
    }
}

function spawnImpact(S,x,y){
    // Kum / toprak parcaciklari — yari daire yukari
    const sandC=[0xddbb77,0xccaa55,0xeecc88,0xbbaa44,0xffffff];
    for(let i=0;i<10;i++){
        const ang=Phaser.Math.DegToRad(Phaser.Math.Between(170,370));
        const sp=Phaser.Math.Between(12,45);
        const sz=Phaser.Math.Between(2,5);
        const p=S.add.graphics().setDepth(7);
        p.x=x+Phaser.Math.Between(-4,4); p.y=y;
        const impAng=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        p.lineStyle(Math.max(1,sz*0.5),sandC[i%5],0.8);
        p.lineBetween(0,0,Math.cos(impAng)*sz,Math.sin(impAng)*sz);
        S.tweens.add({targets:p,
            x:p.x+Math.cos(ang)*sp,y:y+Math.sin(ang)*sp*0.35,
            alpha:0,scaleX:0.15,scaleY:0.15,
            angle:Phaser.Math.Between(-120,120),
            duration:Phaser.Math.Between(160,300),ease:"Quad.easeOut",
            onComplete:()=>p.destroy()});
    }
    // Sok halkasi — yatik elips (zemine yansiyan)
    const sw=S.add.graphics().setDepth(6);
    sw.x=x; sw.y=y;
    sw.lineStyle(1.5,0xddcc99,0.7); sw.strokeEllipse(0,0,6,2);
    S.tweens.add({targets:sw,scaleX:5,scaleY:5,alpha:0,duration:200,ease:"Quad.easeOut",onComplete:()=>sw.destroy()});
    // Toz bulutu — hafif gri/bej dikdortgen
    const dc=S.add.graphics().setDepth(5);
    dc.x=x; dc.y=y;
    dc.fillStyle(0xccbb88,0.22); dc.fillEllipse(0,0,20,8);
    S.tweens.add({targets:dc,scaleX:2.8,scaleY:2.0,alpha:0,y:y-4,duration:280,ease:"Quad.easeOut",onComplete:()=>dc.destroy()});
}
// [VISUAL] Global hit text count limiter — prevents screen spam
// ═══════════════════════════════════════════════════════════════
// ★ FLOATING TEXT SISTEMI — Priority tabanli, spam-free
// ═══════════════════════════════════════════════════════════════
// Priority seviyeleri: 0=LOW, 1=NORMAL, 2=IMPORTANT, 3=CRITICAL
const FT_LOW       = 0;
const FT_NORMAL    = 1;
const FT_IMPORTANT = 2;
const FT_CRITICAL  = 3;

const _ftActive = [];        // { obj, priority, tween }
const _ftMaxSlots = 3;       // ayni anda max 3 text
let   _ftPerfectLast = 0;    // perfect hit cooldown timestamp
const _ftPerfectCooldown = 400; // ms

// Merge buffer: ayni prefix'li LOW textleri birlestir
const _ftMergeBuf = {}; // { key: {S, x, y, total, timer} }

function _ftEvict(){
    // Slot doluysa: once LOW, sonra NORMAL sil
    for(const pri of [FT_LOW, FT_NORMAL]){
        const idx = _ftActive.findIndex(e => e.priority === pri);
        if(idx !== -1){
            const e = _ftActive.splice(idx, 1)[0];
            try{ if(e.tween) e.tween.stop(); }catch(ex){}
            // [BUG FIX] allObjs icindeki tum objeleri (glow dahil) destroy et
            // Sadece e.obj destroy edilirse glow ekranda sonsuza kalir
            if(e.allObjs && e.allObjs.length > 0){
                _jtDestroy(e.allObjs);
            } else {
                try{ e.obj.destroy(); }catch(ex){}
            }
            return true;
        }
    }
    return false;
}

function showFloatingText(S, priority, text, x, y){
    if(!S||!S.add) return;
    const gs = GS;

    // Late-game filtresi
    const lv = gs ? (gs.level||1) : 1;
    if(lv >= 20 && priority === FT_LOW)    return;
    if(lv >= 20 && priority === FT_NORMAL && Math.random() < 0.50) return;

    // Perfect hit cooldown
    const isPerfect = priority === FT_NORMAL && text &&
        (text.includes("MUKEMMEL")||text.includes("PERFECT")||text.includes("TAM")||text.includes("HArika")||text.includes("bullseye"));
    if(isPerfect){
        const now = Date.now();
        if(now - _ftPerfectLast < _ftPerfectCooldown) return;
        _ftPerfectLast = now;
    }

    // Slot yonetimi
    if(_ftActive.length >= _ftMaxSlots){
        if(priority === FT_CRITICAL){
            _ftEvict();
        } else if(priority === FT_IMPORTANT){
            if(!_ftEvict()) return;
        } else {
            return;
        }
    }

    // ── Per-priority visual params ──────────────────────────────
    let fs, depth, strokeTh, riseY, stayDur, fadeDur, scaleIn, textCol, strokeCol, glowCol;
    if(priority === FT_CRITICAL){
        fs=20; depth=42; strokeTh=6; riseY=65; stayDur=800; fadeDur=500; scaleIn=1.4;
        textCol="#ffffff"; strokeCol="#330000"; glowCol="#ff4400";
    } else if(priority === FT_IMPORTANT){
        fs=15; depth=36; strokeTh=4; riseY=50; stayDur=700; fadeDur=500; scaleIn=1.15;
        textCol="#ffffff"; strokeCol="#000000"; glowCol="#ffcc44";
    } else if(priority === FT_NORMAL){
        fs=isPerfect?17:13; depth=32; strokeTh=4; riseY=40; stayDur=300; fadeDur=280;
        scaleIn=isPerfect?1.25:1.05;
        textCol=isPerfect?"#ffee44":"#ffffcc"; strokeCol="#000000"; glowCol=isPerfect?"#ffcc00":null;
    } else {
        fs=10; depth=25; strokeTh=0; riseY=22; stayDur=260; fadeDur=240; scaleIn=0.95;
        textCol="#cccccc"; strokeCol=null; glowCol=null;
    }

    // CRITICAL: screen centre
    const tx = (priority === FT_CRITICAL) ? 180 : x;
    const ty = (priority === FT_CRITICAL) ? 220 : y;

    // ── Glow layer (IMPORTANT+) ─────────────────────────────────
    let glow = null;
    if(glowCol && _perfMode!=="low" && (priority===FT_CRITICAL||priority===FT_IMPORTANT||isPerfect)){
        glow = _jtGlow(S, tx, ty, text, fs, textCol, glowCol, depth, 0.22);
        if(glow) glow.setScale(0.3).setAlpha(0);
    }

    // ── Main text ────────────────────────────────────────────────
    const styleObj = {
        fontFamily:"LilitaOne",
        fontSize: fs+"px",
        color: textCol,
        padding:{x:3,y:2}
    };
    if(strokeTh>0){ styleObj.stroke=strokeCol||"#000000"; styleObj.strokeThickness=strokeTh; }

    const t = S.add.text(tx, ty, text, styleObj)
        .setOrigin(0.5).setDepth(depth).setAlpha(0).setScale(0.3);

    const allObjs = [t, glow].filter(Boolean);
    // [BUG FIX] allObjs'u entry'de sakla — _ftEvict glow dahil hepsini destroy edebilsin
    const entry = { obj: t, priority, tween: null, allObjs };
    _ftActive.push(entry);

    // ── Ghost trail (CRITICAL/IMPORTANT) ───────────────────────
    if((priority===FT_CRITICAL||isPerfect) && _perfMode!=="low"){
        _jtTrail(S, tx, ty, text, fs, textCol, depth);
    }

    // ── Particle burst (CRITICAL/IMPORTANT) ────────────────────
    if(priority===FT_CRITICAL){
        _jtBurst(S, tx, ty, 0xff6600, 6, depth+1);
        _jtBurst(S, tx, ty, 0xffffff, 3, depth+1);
    } else if(priority===FT_IMPORTANT || isPerfect){
        _jtBurst(S, tx, ty, 0xffdd44, 4, depth+1);
    }

    // ── Entry animation ─────────────────────────────────────────
    // Giris acisi: hafif egik basla, dik gel
    const entryAngle = Phaser.Math.Between(-8, 8);
    allObjs.forEach(o=>{ if(o) o.setAngle(entryAngle); });

    S.tweens.add({
        targets: allObjs,
        alpha: 1,
        scaleX: scaleIn * 1.18,
        scaleY: scaleIn * 1.18,
        angle: 0,
        y: ty - riseY * 0.3,
        duration: priority === FT_CRITICAL ? 140 : 85,
        ease: "Back.easeOut",
        onComplete: () => {
            // Settle: hafif squash
            S.tweens.add({
                targets: allObjs,
                scaleX: scaleIn * 0.92,
                scaleY: scaleIn * 1.06,
                duration: 70,
                ease: "Quad.easeOut",
                onComplete: () => {
                    S.tweens.add({
                        targets: allObjs,
                        scaleX: scaleIn,
                        scaleY: scaleIn,
                        duration: 55,
                        ease: "Quad.easeOut",
                        onComplete: () => {

                            // ── NEFES ALMA (breathing) ─────────────────
                            // Sadece CRITICAL ve IMPORTANT metinlerde + isPerfect
                            let breathTween = null;
                            if((priority === FT_CRITICAL || priority === FT_IMPORTANT || isPerfect) && _perfMode !== "low"){
                                breathTween = S.tweens.add({
                                    targets: allObjs,
                                    scaleX: { from: scaleIn, to: scaleIn * 1.08 },
                                    scaleY: { from: scaleIn, to: scaleIn * 1.08 },
                                    duration: 260,
                                    ease: "Sine.easeInOut",
                                    yoyo: true,
                                    repeat: -1
                                });
                            }

                            // ── SAG-SOL SALLAMA (swing) ────────────────
                            // CRITICAL ve IMPORTANT + perfect icin sag-sol titre
                            let swingTween = null;
                            if((priority === FT_CRITICAL || isPerfect) && _perfMode !== "low"){
                                const swingAmp = priority === FT_CRITICAL ? 5 : 3;
                                swingTween = S.tweens.add({
                                    targets: allObjs,
                                    angle: { from: -swingAmp, to: swingAmp },
                                    duration: 180,
                                    ease: "Sine.easeInOut",
                                    yoyo: true,
                                    repeat: -1
                                });
                            } else if(priority === FT_IMPORTANT && _perfMode !== "low"){
                                swingTween = S.tweens.add({
                                    targets: allObjs,
                                    x: { from: tx - 2, to: tx + 2 },
                                    duration: 200,
                                    ease: "Sine.easeInOut",
                                    yoyo: true,
                                    repeat: -1
                                });
                            }

                            // ── FADE OUT ───────────────────────────────
                            const tw = S.tweens.add({
                                targets: allObjs,
                                alpha: 0,
                                y: ty - riseY,
                                scaleX: 0.6,
                                scaleY: 0.6,
                                angle: 0,
                                duration: fadeDur,
                                ease: "Quad.easeIn",
                                delay: stayDur,
                                onStart: () => {
                                    if(breathTween) breathTween.stop();
                                    if(swingTween)  swingTween.stop();
                                },
                                onComplete: () => {
                                    const idx = _ftActive.indexOf(entry);
                                    if(idx !== -1) _ftActive.splice(idx, 1);
                                    _jtDestroy(allObjs);
                                }
                            });
                            entry.tween = tw;
                        }
                    });
                }
            });
        }
    });

    // ── Perfect sparkler ────────────────────────────────────────
    if(isPerfect){
        for(let i=0;i<5;i++){
            const ca=Phaser.Math.DegToRad(i*72+36);
            const sp=S.add.graphics().setDepth(depth+1);
            sp.lineStyle(1.5,0xffee00,0.9);
            sp.lineBetween(0,0,Math.cos(ca)*5,Math.sin(ca)*5);
            sp.x=tx+Math.cos(ca)*22; sp.y=ty+Math.sin(ca)*11;
            S.tweens.add({targets:sp,
                x:sp.x+Math.cos(ca)*16, y:sp.y+Math.sin(ca)*9,
                alpha:0, scaleY:0.1, duration:180, ease:"Quad.easeOut",
                onComplete:()=>{try{sp.destroy();}catch(e){}}});
        }
    }

    // ── CRITICAL shake ───────────────────────────────────────────
    if(priority === FT_CRITICAL && S.cameras?.main){
        S.cameras.main.shake(40, 0.004);
    }
}

// ── MERGE SISTEMI — hizli gelen gold/xp textlerini birlestir ──
function showMergedLow(S, prefix, amount, x, y, color){
    const key = prefix;
    const now = Date.now();
    if(_ftMergeBuf[key] && (now - _ftMergeBuf[key].startTime) < 600){
        _ftMergeBuf[key].total += amount;
        _ftMergeBuf[key].x = x;
        _ftMergeBuf[key].y = y;
    } else {
        _ftMergeBuf[key] = { total:amount, x, y, color, startTime:now, S };
        // 600ms sonra goster
        S.time.delayedCall(600, ()=>{
            const buf = _ftMergeBuf[key];
            if(!buf) return;
            delete _ftMergeBuf[key];
            if(buf.total > 0){
                showFloatingText(buf.S, FT_LOW, prefix+buf.total, buf.x, buf.y);
            }
        });
    }
}

// ── GERIYE UYUMLU WRAPPER — eski showHitTxt cagrilari calismaya devam eder ──
let _hitTxtCount = 0;
const MAX_HIT_TXT = 6;
function showHitTxt(S, x, y, msg, color, large){
    if(!S||!S.add) return;

    // Priority belirle
    let priority = FT_LOW;
    if(large) priority = FT_IMPORTANT;

    // CRITICAL tespiti
    if(msg && (
        msg.includes("EVRIM")||msg.includes("EVOLUTION")||msg.includes("ЭВОЛЮЦИЯ")||
        msg.includes("DIRILIS")||msg.includes("PHOENIX")||msg.includes("GODLIKE")||
        msg.includes("UNSTOPPABLE")
    )) priority = FT_CRITICAL;

    // IMPORTANT tespiti
    if(msg && (
        msg.includes("SEVIYE")||msg.includes("LEVEL")||msg.includes("УРОВЕНЬ")||
        msg.includes("BOSS")||msg.includes("ELITE")||msg.includes("TITAN DOWN")||
        msg.includes("SINERJI")||msg.includes("SYNERGY")||msg.includes("BUILD")||
        msg.includes("OVERLOAD")||msg.includes("GOLD RUSH")||msg.includes("CHAOS")||
        msg.includes("SURVIVAL")||msg.includes("BLITZ")||msg.includes("DEMIR")||
        msg.includes("ZIRH")||msg.includes("extraLife")||msg.includes("✦ DIRILIS")
    )) priority = FT_IMPORTANT;

    // NORMAL tespiti
    if(msg && (
        msg.includes("MUKEMMEL")||msg.includes("PERFECT")||msg.includes("TAM")||
        msg.includes("HArika")||msg.includes("bullseye")||msg.includes("COMBO")||
        msg.includes("COMBO")
    )) priority = FT_NORMAL;

    // LOW/NORMAL gold/xp kucuk textleri gizle — particle ile yeterli
    if(!large && msg && (
        msg.startsWith("+") && (msg.includes("⬡")||msg.includes("gold")||msg.includes("altin")) &&
        !msg.includes("Reddetme") && !msg.includes("Bonus")
    )) return; // kucuk gold textleri → sadece particle

    showFloatingText(S, priority, msg, x, y);
}
// ═══════════════════════════════════════════════════════════════════
// NT_UI — Unified UI System  v9
// Runtime pixel-sampled window measurements + world-coordinate layout
// No Containers for content — all positions in world space.
// ═══════════════════════════════════════════════════════════════════

// ── NT_STYLE ─────────────────────────────────────────────────────────
const NT_STYLE = {
    FONT: "LilitaOne, Arial, sans-serif",
    title:  (sz=22,col="#ffffff",stroke="#5a0000")=>({ fontFamily:"LilitaOne, Arial, sans-serif",fontSize:sz+"px",color:col,stroke:stroke,strokeThickness:Math.max(3,Math.round(sz*0.12)) }),
    label:  (sz=22,col="#3d1a00")=>({ fontFamily:"LilitaOne, Arial, sans-serif",fontSize:sz+"px",color:col,backgroundColor:"rgba(0,0,0,0)",padding:{x:4,y:2} }),
    body:   (sz=15,col="#ffffff")=>({ fontFamily:"LilitaOne, Arial, sans-serif",fontSize:sz+"px",color:col }),
    stat:   (sz=14,col="#88aacc")=>({ fontFamily:"LilitaOne, Arial, sans-serif",fontSize:sz+"px",color:col }),
    accent: (sz=14,col="#ffdd44")=>({ fontFamily:"LilitaOne, Arial, sans-serif",fontSize:sz+"px",color:col }),
};

// ── NT_Measure — runtime pixel sampling ─────────────────────────────
// Returns {W,H,sc,stripH,goldH} in screen pixels at targetW
// stripH = height of orange/red header strip
// goldH  = height of gold/yellow footer strip (0 if none)
function NT_Measure(scene, texKey, targetW){
    const FALLBACK = { W:targetW, H:targetW*1.42, sc:1, stripH:targetW*0.20, goldH:0 };
    try{
        const tex=scene.textures.get(texKey);
        const src=tex&&tex.source&&tex.source[0];
        const IW=src&&(src.width||src.realWidth)||0;
        const IH=src&&(src.height||src.realHeight)||0;
        if(!IW||!IH) return FALLBACK;
        const sc=targetW/IW;
        const H=IH*sc;

        // Pixel-sample the center column
        const img=src.image||src.HTMLImageElement||null;
        if(!img){ return {W:targetW,H,sc,stripH:H*0.20,goldH:H*0.00}; }
        const cv=document.createElement("canvas");
        cv.width=IW; cv.height=IH;
        const ctx=cv.getContext("2d",{willReadFrequently:true});
        ctx.drawImage(img,0,0);
        const CX=Math.floor(IW/2);

        // Scan top-down: find last row that is orange/red
        let lastOrange=-1;
        for(let y=0;y<IH*0.48;y++){
            const d=ctx.getImageData(CX,y,1,1).data;
            // Orange: R>150, G<130, B<110, A>160
            if(d[3]>160&&d[0]>150&&d[1]<130&&d[2]<110) lastOrange=y;
        }

        // Scan bottom-up: find first row that is gold/yellow
        let firstGold=-1;
        for(let y=IH-1;y>IH*0.56;y--){
            const d=ctx.getImageData(CX,y,1,1).data;
            // Gold: R>180, G>140, B<90, A>160
            if(d[3]>160&&d[0]>180&&d[1]>140&&d[2]<90){ if(firstGold<0)firstGold=y; }
        }

        const stripH = lastOrange>0 ? (lastOrange+3)*sc : H*0.20;
        const goldH  = firstGold>0  ? (IH-firstGold+3)*sc : 0;
        return {W:targetW,H,sc,stripH,goldH};
    }catch(e){
        console.warn("[NT_UI] NT_Measure failed:",e);
        return FALLBACK;
    }
}

// ── NT_YellowBtn — Graphics yellow button at world position ──────────
// Returns array of display objects [graphics, text, hitRect]
function NT_YellowBtn(scene, cx, cy, bw, bh, label, depth, fn){
    const BR=10;
    const g=scene.add.graphics().setDepth(depth);
    const draw=(h)=>{
        g.clear();
        g.fillStyle(0xaa6600,1); g.fillRoundedRect(cx-bw/2+2,cy-bh/2+4,bw,bh,{bl:BR,br:BR,tl:2,tr:2});
        g.fillStyle(h?0xffe84d:0xffdd00,1); g.fillRoundedRect(cx-bw/2,cy-bh/2,bw,bh,BR);
        g.fillStyle(0xffffff,h?0.22:0.10); g.fillRoundedRect(cx-bw/2+6,cy-bh/2+5,bw-12,bh/2-6,6);
        g.lineStyle(2,0xcc8800,0.85); g.strokeRoundedRect(cx-bw/2,cy-bh/2,bw,bh,BR);
    };
    draw(false);
    const t=scene.add.text(cx,cy,label,NT_STYLE.label(17)).setOrigin(0.5).setDepth(depth+1);
    const h=scene.add.rectangle(cx,cy,bw,bh,0xffffff,0.001).setDepth(depth+2).setInteractive({useHandCursor:true});
    h.on("pointerover",()=>draw(true)).on("pointerout",()=>draw(false));
    h.on("pointerdown",()=>{ NT_SFX.play("menu_click"); scene.tweens.add({targets:[g,t],alpha:0.6,duration:50,yoyo:true,onComplete:fn}); });
    return [g,t,h];
}

// ── NT_OpenPopup — sprite window + title + content ────────────────────
// panelCY: world y center of panel (default = 320)
// Returns {A,close,objs,pTop,pBot,stripCY,contentTop,contentBot,TX,VX,PW}
function NT_OpenPopup(scene, texKey, targetW, titleStr, panelCY, depth, onClose){
    const W=360,H=640,CX=180;
    panelCY = panelCY||H/2;
    depth   = depth||20;
    const objs=[]; const A=o=>{objs.push(o);return o;};

    // Arkadaki menu butonlarini devre disi birak
    if(scene._menuHitZones){
        scene._menuHitZones.forEach(h=>{ try{h.disableInteractive();}catch(_){} });
    }

    // Dim overlay — tum ekrani kaplar, input'u bloklar
    A(scene.add.rectangle(CX,H/2,W,H,0x000000,0.60).setDepth(depth).setInteractive());

    // Measure + place sprite
    const m=NT_Measure(scene,texKey,targetW);
    const sp=A(scene.add.image(CX,panelCY,texKey).setScale(m.sc).setDepth(depth+1));
    const pTop=panelCY-m.H/2, pBot=panelCY+m.H/2;
    const stripCY    = pTop + m.stripH/2;
    const contentTop = pTop + m.stripH+10;
    const contentBot = pBot - Math.max(m.goldH,52) - 6;
    const TX=CX-targetW/2+22, VX=CX+targetW/2-22;

    // Title — centered in orange strip
    A(scene.add.text(CX,stripCY,titleStr,NT_STYLE.title(22)).setOrigin(0.5).setDepth(depth+3));

    // Close button — always at bottom of panel, 30px from edge
    const closeY=pBot-32;
    const [cb,ct,ch]=NT_YellowBtn(scene,CX,closeY,190,42,"✕  CLOSE",depth+3,()=>close());
    A(cb);A(ct);A(ch);

    // Animate: sprite pops in; content already visible
    sp.setScale(m.sc*0.04).setAlpha(0);
    scene.tweens.add({targets:sp,scaleX:m.sc,scaleY:m.sc,alpha:1,duration:160,ease:"Back.easeOut"});

    function close(cb2){
        if(onClose) try{ onClose(); }catch(_){}
        objs.forEach(o=>{try{if(o.disableInteractive)o.disableInteractive();o.destroy();}catch(_){}});
        // Arkadaki menu butonlarini yeniden etkinlestir
        if(scene._menuHitZones){
            scene._menuHitZones.forEach(h=>{ try{h.setInteractive({useHandCursor:true});}catch(_){} });
        }
        if(cb2)cb2();
    }
    return {A,close,objs,pTop,pBot,stripCY,contentTop,contentBot,TX,VX,PW:targetW,CX,depth};
}

// ── Menu button (Graphics, world coords) — PREMIUM v2 ────────────────
function NT_MenuBtn(scene,cx,cy,iconKey,label,callback){
    const BW=268,BH=70,BR=16;

    // ── Shadow layer (depth 4) — subtle drop shadow for depth
    const shadow=scene.add.graphics().setDepth(4);
    shadow.fillStyle(0x000000,0.28);
    shadow.fillRoundedRect(cx-BW/2+4,cy-BH/2+6,BW,BH,BR);

    // ── Main button graphics (depth 5)
    const g=scene.add.graphics().setDepth(5);

    // sc: 1.0 = normal, 1.04 = hover — koordinatlar merkez(cx,cy)'den hesaplanir, kayma olmaz
    const drawFace=(hov, sc=1.0)=>{
        g.clear();
        const bw=BW*sc, bh=BH*sc;
        // Bottom edge — 3D depth illusion
        g.fillStyle(0x8a4e00,1);
        g.fillRoundedRect(cx-bw/2+2,cy+bh/2-8*sc,bw,10*sc,{bl:BR,br:BR,tl:2,tr:2});
        // Main body top band
        g.fillStyle(hov?0xffe060:0xffd84a,1);
        g.fillRoundedRect(cx-bw/2,cy-bh/2,bw,bh*0.52,{tl:BR,tr:BR,bl:0,br:0});
        // Main body bottom band
        g.fillStyle(hov?0xf5b800:0xe8a800,1);
        g.fillRoundedRect(cx-bw/2,cy,bw,bh*0.50,{tl:0,tr:0,bl:BR,br:BR});
        // Border
        g.lineStyle(hov?2.5:1.8,hov?0xffe080:0xd4900a,hov?0.95:0.75);
        g.strokeRoundedRect(cx-bw/2,cy-bh/2,bw,bh,BR);
        // Top shine highlight
        g.fillStyle(0xffffff,hov?0.28:0.16);
        g.fillRoundedRect(cx-bw/2+8*sc,cy-bh/2+5*sc,bw-16*sc,bh*0.32,{tl:BR*0.6,tr:BR*0.6,bl:0,br:0});
        // Inner border glow (hov only)
        if(hov){
            g.lineStyle(1,0xffffff,0.18);
            g.strokeRoundedRect(cx-bw/2+2,cy-bh/2+2,bw-4,bh-4,BR-1);
        }
    };
    drawFace(false, 1.0);

    // ── Icon + label
    const ic=scene.add.image(cx-BW/2+38,cy,iconKey).setDepth(6);
    ic.setScale(54/Math.max(ic.width,ic.height,1));
    const tx=scene.add.text(cx+16,cy,label,NT_STYLE.label(24)).setOrigin(0.5).setDepth(6);

    // ── Shine sweep graphics (depth 8) — light stripe crosses button
    const shineG=scene.add.graphics().setDepth(8);

    // ── Shine sweep animation — runs every ~4s per button
    let _shineRunning=false;
    function _runShine(){
        if(_shineRunning) return;
        _shineRunning=true;
        const dummy={x:cx-BW/2-30};
        scene.tweens.add({
            targets:dummy, x:cx+BW/2+30,
            duration:540, ease:"Quad.easeInOut",
            onUpdate:()=>{
                shineG.clear();
                const sw=32, sx=dummy.x;
                // Clamp to button bounds using fillRect inside rounded area
                // We fake it with alpha: draw a slanted gradient stripe
                shineG.fillStyle(0xffffff,0.18);
                shineG.fillRect(sx-sw*0.5,cy-BH/2+4,sw*0.7,BH-8);
                shineG.fillStyle(0xffffff,0.10);
                shineG.fillRect(sx-sw*0.8,cy-BH/2+4,sw*0.5,BH-8);
            },
            onComplete:()=>{
                shineG.clear();
                _shineRunning=false;
            }
        });
    }
    // Staggered first delay per button so they don't all fire together
    const _shineDelay=3500+Math.random()*2000;
    scene.time.delayedCall(_shineDelay,function _schedShine(){
        _runShine();
        scene.time.delayedCall(4000+Math.random()*1500,_schedShine);
    });

    // ── Hit zone
    const hit=scene.add.rectangle(cx,cy,BW,BH,0xffffff,0.001).setDepth(9).setInteractive({useHandCursor:true});
    let hov=false;

    hit.on("pointerover", ()=>{
        hov=true;
        const d={sc:1.0};
        scene.tweens.add({targets:d, sc:1.04, duration:130, ease:"Sine.easeOut",
            onUpdate:()=>drawFace(true, d.sc)});
    });
    hit.on("pointerout", ()=>{
        hov=false;
        const d={sc:1.04};
        scene.tweens.add({targets:d, sc:1.0, duration:160, ease:"Sine.easeOut",
            onUpdate:()=>drawFace(false, d.sc)});
    });
    hit.on("pointerdown", ()=>{
        NT_SFX.play("menu_click");
        const d={sc:1.0};
        // Kisa press-down efekti — callback hemen tetiklenir, animasyon arka planda biter
        scene.tweens.add({
            targets:d, sc:0.96, duration:50, ease:"Quad.easeOut",
            onUpdate:()=>drawFace(false, d.sc),
            onComplete:()=>{
                callback(); // animasyon bitmeden hemen cagir
                scene.tweens.add({
                    targets:d, sc:1.0, duration:120, ease:"Back.easeOut",
                    onUpdate:()=>drawFace(false, d.sc)
                });
            }
        });
    });

    return {g,ic,tx,hit,shadow,shineG};
}

// ── SceneMainMenu ─────────────────────────────────────────────────────
class SceneMainMenu extends Phaser.Scene {
    constructor(){ super({key:"SceneMainMenu"}); }

    preload(){
        this.load.on("loaderror",f=>console.error("[MENU] 404→",f.src));
        this.load.image("mm_bg",       "assets/blue_background.png");
        this.load.image("mm_panel",    "assets/ui/Main Window.png");
        this.load.image("mm_small",    "assets/ui/Small window.png");
        this.load.image("mm_play",     "assets/ui/Start (4).png");
        this.load.image("mm_settings", "assets/ui/Settings (4).png");
        this.load.image("mm_howto",    "assets/ui/Question mark (4).png");
        this.load.image("mm_lb",       "assets/ui/Leaderboard (4).png");
        this.load.image("mm_shop",     "assets/ui/Shop (4).png");
        this.load.image("icon_gold",   "assets/gold.png");
        this.load.image("icon_gem",    "assets/gem.png");
        // icon_wheel removed — wheel is now drawn with graphics
    }

    create(){
        // [FIX] Pause → Main Menu → Play arasi _goGameFired sifirla
        // scene.start() ayni instance'i yeniden kullandigi icin onceki true degeri kaliyordu
        this._goGameFired = false;

        // [SOUND FIX] Main menu'ye donunce muzik ve ambiyans her zaman aktif olsun
        try{
            NT_SFX.startMusic();
            NT_SFX.setMusicState("menu", 1.0);
            NT_SFX.startWindAmbience();
        }catch(e){ console.warn("[NT] Menu muzik init hatasi:", e); }

        const W=360,H=640,CX=180;

        // ── LAYER 0: Deep background gradient (animated, very slow) ────────
        const bgGrad=this.add.graphics().setDepth(-2);
        const _bgDummy={v:0};
        const _drawBgGrad=(v)=>{
            bgGrad.clear();
            // Slow oscillating gradient — two bands blending
            const t1=Phaser.Math.Linear(0x0a1a3a,0x0d2248,v);
            const t2=Phaser.Math.Linear(0x1a0e2e,0x240c44,v);
            bgGrad.fillStyle(0x0d1f3a,1); bgGrad.fillRect(0,0,W,H);
            // Warm accent glow at bottom (very faint)
            bgGrad.fillStyle(0x3a1400, 0.25+v*0.12); bgGrad.fillRect(0,H*0.6,W,H*0.4);
            // Top cool accent
            bgGrad.fillStyle(0x001440, 0.18+v*0.08); bgGrad.fillRect(0,0,W,H*0.35);
        };
        _drawBgGrad(0);
        this.tweens.add({targets:_bgDummy,v:1,duration:6000,ease:"Sine.easeInOut",yoyo:true,repeat:-1,
            onUpdate:()=>_drawBgGrad(_bgDummy.v)});

        // ── LAYER 0.5: Static background image (original) ──────────────────
        this.add.rectangle(CX,H/2,W,H,0xC85A00,1).setDepth(-1);
        const bgImg=this.add.image(CX,H/2,"mm_bg").setDepth(0).setAlpha(0.85);

        // ── LAYER 1: Parallax ambient glow orbs (behind panel) ─────────────
        const paralaxG=this.add.graphics().setDepth(1);
        const _orbDummy={t:0};
        const ORBS=[
            {x:60,  y:160, r:80, col:0x3355ff, a:0.07},
            {x:300, y:420, r:70, col:0xff6600, a:0.08},
            {x:180, y:300, r:110,col:0x8822ff, a:0.05},
            {x:40,  y:520, r:55, col:0x00aaff, a:0.06},
            {x:330, y:100, r:65, col:0xffaa00, a:0.06},
        ];
        this.tweens.add({targets:_orbDummy,t:Math.PI*2,duration:12000,ease:"Linear",repeat:-1,
            onUpdate:()=>{
                paralaxG.clear();
                ORBS.forEach((o,i)=>{
                    const px=o.x+Math.sin(_orbDummy.t*0.4+i*1.3)*12;
                    const py=o.y+Math.cos(_orbDummy.t*0.3+i*0.9)*9;
                    paralaxG.fillStyle(o.col,o.a);
                    paralaxG.fillCircle(px,py,o.r);
                });
            }
        });

        // ── LAYER 1.5: Floating dust particles (very subtle) ───────────────
        const PARTICLE_COUNT=18;
        const particles=[];
        const particleG=this.add.graphics().setDepth(1);
        for(let i=0;i<PARTICLE_COUNT;i++){
            particles.push({
                x:Math.random()*W,
                y:Math.random()*H,
                vy:-0.18-Math.random()*0.25,
                vx:(Math.random()-0.5)*0.12,
                r:1+Math.random()*2,
                a:0.04+Math.random()*0.12,
                col:Math.random()<0.5?0xffd080:0x88ccff,
                phase:Math.random()*Math.PI*2,
                speed:0.4+Math.random()*0.6
            });
        }
        this.time.addEvent({delay:33,loop:true,callback:()=>{
            particleG.clear();
            particles.forEach(p=>{
                p.y+=p.vy;
                p.x+=p.vx+Math.sin(p.phase)*0.08;
                p.phase+=0.025;
                if(p.y<-10){ p.y=H+5; p.x=Math.random()*W; }
                particleG.fillStyle(p.col, p.a);
                particleG.fillCircle(p.x,p.y,p.r);
            });
        }});

        // Panel sprite — measure EXACT dimensions at runtime
        const m = NT_Measure(this,"mm_panel",340);
        // Center panel so its vertical center = H/2+20 (slight downward offset)
        const panelCY = H/2 + 20;
        const panel   = this.add.image(CX,panelCY,"mm_panel").setScale(m.sc).setDepth(2);
        const pTop    = panelCY - m.H/2;
        const pBot    = panelCY + m.H/2;
        const stripCY = pTop + m.stripH/2;   // center of orange strip (world y)

        // ── TITLE with glow pulse + breathing effect ───────────────────────
        const title = this.add.text(CX, stripCY, "NOT FAIR", NT_STYLE.title(40)).setOrigin(0.5).setDepth(6);
        // Outer glow halo behind title
        const titleGlow=this.add.graphics().setDepth(5);
        const _titleGlowDummy={v:0};
        this.tweens.add({targets:_titleGlowDummy,v:1,duration:1800,ease:"Sine.easeInOut",yoyo:true,repeat:-1,
            onUpdate:()=>{
                const v=_titleGlowDummy.v;
                titleGlow.clear();
                titleGlow.fillStyle(0xff8800, 0.06+v*0.10);
                titleGlow.fillEllipse(CX,stripCY,260,55);
                titleGlow.fillStyle(0xffdd00, 0.04+v*0.07);
                titleGlow.fillEllipse(CX,stripCY,200,38);
            }
        });
        // Breathing scale kaldirildi — title sabit durur

        // Buttons — divide teal content area into 4 equal slots
        const aTop  = pTop + m.stripH + 8;
        const aBot  = pBot - 14;
        const slot  = (aBot - aTop) / 4;
        const DEFS  = [
            {icon:"mm_play",     label:L("menuPlay"),        cb:()=>this._goGame()},
            {icon:"mm_shop",     label:L("menuShop"),        cb:()=>this._showShop()},
            {icon:"mm_settings", label:L("menuSettings"),    cb:()=>this._showSettings()},
            {icon:"mm_lb",       label:L("menuLeaderboard"), cb:()=>this._showLeaderboard()},
        ];
        // Phaser glyph warm-up: tum buton labellarini invisible text olarak render et
        // Phaser'in internal canvas'i glyphleri cache'e alir → gercek butonlar siyah cikmaz
        const _warmLabels = ["PLAY","SETTINGS","SHOP","HOW TO PLAY","LEADERBOARD",
                             "RESUME","MAIN MENU","PAUSED","STATS","NOT FAIR"];
        const _warmObjs = _warmLabels.map(lbl=>{
            const t = this.add.text(CX, H/2, lbl, NT_STYLE.label(24));
            t.setVisible(false).setDepth(0);
            return t;
        });
        // 3 frame sonra warm-up text'lerini temizle
        this.time.delayedCall(150,()=>{ _warmObjs.forEach(o=>{try{o.destroy();}catch(_){}}) });

        const btns=DEFS.map((d,i)=>NT_MenuBtn(this,CX,aTop+slot*i+slot/2,d.icon,d.label,d.cb));

        // ── IDLE BUTTON AMBIENT GLOW — per-button pulsing outline ─────────
        const _BW=268,_BH=70,_BR=16;
        DEFS.forEach((_d,i)=>{
            const bcy=aTop+slot*i+slot/2;
            const glowG=this.add.graphics().setDepth(4);
            const dummy={v:0};
            this.tweens.add({
                targets:dummy, v:1,
                duration:1800+i*220,
                delay:i*350,
                ease:"Sine.easeInOut",
                yoyo:true, repeat:-1,
                onUpdate:()=>{
                    const v=dummy.v;
                    glowG.clear();
                    // Outer aura
                    glowG.lineStyle(4+v*5, 0xffcc00, 0.06+v*0.18);
                    glowG.strokeRoundedRect(CX-_BW/2-5,bcy-_BH/2-5,_BW+10,_BH+10,_BR+5);
                    // Softer second ring
                    glowG.lineStyle(2, 0xffee88, 0.03+v*0.08);
                    glowG.strokeRoundedRect(CX-_BW/2-10,bcy-_BH/2-10,_BW+20,_BH+20,_BR+10);
                }
            });
        });

        // Hit zone'lari sakla — popup acilinca devre disi birakmak icin
        this._menuHitZones = btns.map(b=>b.hit);
        // Buton label text'lerini basta gizle — warm-up bittikten sonra goster (PC siyah kutu fix)
        btns.forEach(b=>{ if(b.tx) b.tx.setVisible(false); });
        this.time.delayedCall(160, ()=>{ btns.forEach(b=>{ try{ if(b.tx&&!b.tx.destroyed) b.tx.setVisible(true); }catch(_){} }); });

        // Smooth texture filter
        this.time.delayedCall(80,  ()=>this._smooth());
        this.time.delayedCall(500, ()=>this._smooth());

        // ── TOP BAR: gem + gold — yanyana tek satir, sicak tema, panelin ustunde ──
        {
            const _self = this;
            const ICON_SZ = 28, GAP = 4;
            const PILL_W  = 90, PILL_H = 28;
            const PILL_R  = PILL_H / 2;
            const TOP_Y   = 8;
            const GEM_X   = W - 8 - PILL_W;
            const GOLD_X  = GEM_X - PILL_W - 6;
            const CY      = TOP_Y + PILL_H/2;

            // [QUALITY] Apply LINEAR filter to icon textures
            this.time.delayedCall(50, () => {
                try {
                    const gl = this.renderer && this.renderer.gl;
                    if (!gl) return;
                    ["icon_gold", "icon_gem"].forEach(key => {
                        const src = (this.textures.get(key) || {}).source;
                        if (src) src.forEach(s => {
                            if (s && s.glTexture) {
                                gl.bindTexture(gl.TEXTURE_2D, s.glTexture);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                gl.generateMipmap(gl.TEXTURE_2D);
                                gl.bindTexture(gl.TEXTURE_2D, null);
                            }
                        });
                    });
                } catch (_) {}
            });

            // ── Pill cizim — sicak/amber tonu, oyun temasiyla uyumlu ──
            const _drawPill = (g, x, y, w, h, accentCol, fillCol) => {
                g.clear();
                g.fillStyle(0x000000, 0.30);
                g.fillRoundedRect(x+1, y+1, w, h, PILL_R);
                g.fillStyle(fillCol, 0.94);
                g.fillRoundedRect(x, y, w, h, PILL_R);
                g.fillStyle(0xffffff, 0.08);
                g.fillRoundedRect(x+2, y+1, w-4, h*0.42, PILL_R);
                g.lineStyle(1.5, accentCol, 0.85);
                g.strokeRoundedRect(x, y, w, h, PILL_R);
            };

            // ── GOLD pill (sol) ─────────────────────────
            const goldBg = this.add.graphics().setDepth(7).setAlpha(0);
            _drawPill(goldBg, GOLD_X, TOP_Y, PILL_W, PILL_H, 0xddaa22, 0x2a1800);
            const goldIc = this.add.image(GOLD_X + ICON_SZ/2 + 3, CY, "icon_gold")
                .setDisplaySize(ICON_SZ, ICON_SZ).setDepth(9).setAlpha(0);
            const goldTxt = this.add.text(GOLD_X + PILL_W - 5, CY, PLAYER_GOLD.toLocaleString(), {
                fontFamily: 'LilitaOne, Arial, sans-serif', fontSize: '13px',
                color: '#ffdd44', stroke: '#1a0800', strokeThickness: 3
            }).setOrigin(1, 0.5).setDepth(9).setAlpha(0);

            // ── GEM pill (sag) ──────────────────────────
            const gemBg = this.add.graphics().setDepth(7).setAlpha(0);
            _drawPill(gemBg, GEM_X, TOP_Y, PILL_W, PILL_H, 0xaa44dd, 0x1a0828);
            const gemIc = this.add.image(GEM_X + ICON_SZ/2 + 3, CY, "icon_gem")
                .setDisplaySize(ICON_SZ, ICON_SZ).setDepth(9).setAlpha(0);
            const gemTxt = this.add.text(GEM_X + PILL_W - 6, CY, PLAYER_GEMS.toLocaleString(), {
                fontFamily: 'LilitaOne, Arial, sans-serif', fontSize: '13px',
                color: '#dd99ff', stroke: '#0a0018', strokeThickness: 3
            }).setOrigin(1, 0.5).setDepth(9).setAlpha(0);

            this.tweens.add({targets:[goldBg,goldTxt,goldIc,gemBg,gemTxt,gemIc], alpha:1, duration:380, delay:460, ease:'Quad.easeOut'});

            // ── HUD REFRESH ─────────────────────────────────────────
            _self._mmGoldTxt = goldTxt;
            _self._mmGemTxt  = gemTxt;
            _self._mmGoldBg  = goldBg;
            _self._mmGoldIc  = goldIc;
            _self._mmGemBg   = gemBg;
            _self._mmGemIc   = gemIc;
            _self._hudRefreshTimer = this.time.addEvent({delay:300, loop:true, callback:()=>{
                if(!goldTxt.scene) return;
                const gStr   = PLAYER_GOLD.toLocaleString();
                const gemStr = PLAYER_GEMS.toLocaleString();
                if(goldTxt.text !== gStr) goldTxt.setText(gStr);
                if(gemTxt.text !== gemStr) gemTxt.setText(gemStr);
            }});
        }

        // ── PLAYER LEVEL — sol ust, dairesel XP dolum halkasi ──
        {
            const CIR_R   = 22;
            const CIR_CX  = 14 + CIR_R;
            const CIR_CY  = 12 + CIR_R;
            const RING_W  = 4;

            const xpNeeded = _plvXpNeeded(PLAYER_LEVEL);
            const xpRatio  = Math.min(1, PLAYER_LEVEL_XP / xpNeeded);

            const lvG = this.add.graphics().setDepth(9).setAlpha(0);

            const BG_DARK     = 0x1a0e04;
            const RING_EMPTY  = 0x2a1808;
            const RING_FILL   = 0xffaa00;
            const RING_HI     = 0xffdd44;
            const BORDER_COL  = 0xcc8822;

            const _drawCircle = (ratio, glowV) => {
                lvG.clear();
                lvG.fillStyle(RING_FILL, 0.03 + glowV * 0.05);
                lvG.fillCircle(CIR_CX, CIR_CY, CIR_R + 5);
                lvG.fillStyle(0x000000, 0.35);
                lvG.fillCircle(CIR_CX+1, CIR_CY+2, CIR_R + 2);
                lvG.fillStyle(RING_EMPTY, 1);
                lvG.fillCircle(CIR_CX, CIR_CY, CIR_R + 1);
                if(ratio > 0.01){
                    const startAngle = -Math.PI/2;
                    const endAngle   = startAngle + Math.PI*2*ratio;
                    lvG.lineStyle(RING_W + 2, RING_FILL, 0.95);
                    lvG.beginPath();
                    lvG.arc(CIR_CX, CIR_CY, CIR_R - RING_W/2, startAngle, endAngle, false);
                    lvG.strokePath();
                    lvG.lineStyle(RING_W - 1, RING_HI, 0.45);
                    lvG.beginPath();
                    lvG.arc(CIR_CX, CIR_CY, CIR_R - RING_W/2 + 1, startAngle, endAngle, false);
                    lvG.strokePath();
                    const ex = CIR_CX + Math.cos(endAngle) * (CIR_R - RING_W/2);
                    const ey = CIR_CY + Math.sin(endAngle) * (CIR_R - RING_W/2);
                    lvG.fillStyle(0xffffff, 0.65 + glowV*0.35);
                    lvG.fillCircle(ex, ey, 3);
                    lvG.fillStyle(RING_FILL, 0.35);
                    lvG.fillCircle(ex, ey, 5);
                }
                lvG.fillStyle(BG_DARK, 0.98);
                lvG.fillCircle(CIR_CX, CIR_CY, CIR_R - RING_W - 2);
                lvG.lineStyle(1.2, BORDER_COL, 0.5);
                lvG.strokeCircle(CIR_CX, CIR_CY, CIR_R - RING_W - 2);
                lvG.lineStyle(1.5, BORDER_COL, 0.7 + glowV*0.2);
                lvG.strokeCircle(CIR_CX, CIR_CY, CIR_R + 1);
                lvG.lineStyle(1.5, 0xffffff, 0.06 + glowV*0.04);
                lvG.beginPath();
                lvG.arc(CIR_CX, CIR_CY, CIR_R, -Math.PI*0.8, -Math.PI*0.2, false);
                lvG.strokePath();
            };

            const _lvFS = PLAYER_LEVEL >= 100 ? '11px' : PLAYER_LEVEL >= 10 ? '15px' : '18px';
            const lvNumTxt = this.add.text(CIR_CX, CIR_CY - 2, String(PLAYER_LEVEL), {
                fontFamily: 'LilitaOne, Arial, sans-serif', fontSize: _lvFS,
                color: '#ffdd44', stroke: '#1a0800', strokeThickness: 3
            }).setOrigin(0.5, 0.5).setDepth(10).setAlpha(0);

            const lvLabelTxt = this.add.text(CIR_CX, CIR_CY + 10, "LV", {
                fontFamily: 'LilitaOne, Arial, sans-serif', fontSize: '7px',
                color: '#aa8844', stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5, 0.5).setDepth(10).setAlpha(0);

            let lvPrestigeTxt = null;
            if(PLAYER_PRESTIGE > 0){
                lvPrestigeTxt = this.add.text(CIR_CX, CIR_CY + CIR_R + 6,
                    "⭐".repeat(Math.min(PLAYER_PRESTIGE, 5)), { fontSize: '6px' })
                    .setOrigin(0.5, 0).setDepth(10).setAlpha(0);
            }

            const _anim = { ratio: xpRatio, glow: 0 };
            this.tweens.add({ targets: _anim, glow: 1, duration: 2200,
                yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
            this.time.addEvent({ delay: 33, loop: true, callback: () => {
                if (!lvG.scene) return;
                _drawCircle(_anim.ratio, _anim.glow);
            }});

            const _lvItems = [lvG, lvNumTxt, lvLabelTxt];
            if(lvPrestigeTxt) _lvItems.push(lvPrestigeTxt);
            this.tweens.add({ targets: _lvItems, alpha: 1, duration: 420, delay: 520, ease: 'Quad.easeOut' });
            // ── LEVEL UP MENU BILDIRIMI ─────────────────────────────────
            const _pendingLvUp = parseInt(secureGet("nt_lvup_pending", "0", "0"));
            if(_pendingLvUp > 0){
                secureSet("nt_lvup_pending", 0);
                this.time.delayedCall(750, () => {
                    if(!lvG.scene) return;
                    this.cameras.main.flash(500, 255, 140, 0, false);
                    NT_SFX.play("level_up");
                    // LEVEL UP banner
                    const lvUpStr = _pendingLvUp > 1
                        ? (L("levelUp").replace("!","") + " ×" + _pendingLvUp + "!")
                        : L("levelUp");
                    const lvUpBg = this.add.graphics().setDepth(14).setAlpha(0);
                    lvUpBg.fillStyle(0x2a1000, 0.92);
                    lvUpBg.fillRoundedRect(CIR_CX - CIR_R, CIR_CY + CIR_R + 8, 120, 22, 7);
                    lvUpBg.lineStyle(2, 0xffcc00, 0.90);
                    lvUpBg.strokeRoundedRect(CIR_CX - CIR_R, CIR_CY + CIR_R + 8, 120, 22, 7);
                    const lvUpTxt = this.add.text(CIR_CX - CIR_R + 60, CIR_CY + CIR_R + 19, lvUpStr, {
                        fontFamily: 'LilitaOne, Arial, sans-serif', fontSize: '12px',
                        color: '#ffee44', stroke: '#3d1400', strokeThickness: 4
                    }).setOrigin(0.5, 0.5).setDepth(15).setAlpha(0);
                    this.tweens.add({ targets: [lvUpBg, lvUpTxt], alpha: 1, duration: 280, ease: 'Back.easeOut',
                        onComplete: () => {
                            this.tweens.add({ targets: [lvUpBg, lvUpTxt], alpha: 0,
                                duration: 700, delay: 2000, ease: 'Quad.easeIn',
                                onComplete: () => { try{lvUpBg.destroy();lvUpTxt.destroy();}catch(_){} }
                            });
                        }
                    });
                    // Badge ziplama
                    this.tweens.add({ targets: [lvG, lvNumTxt],
                        scaleX: 1.3, scaleY: 1.3, duration: 200, ease: 'Back.easeOut', yoyo: true, hold: 100 });
                    // Parcacik patlamasi
                    const lvFxG = this.add.graphics().setDepth(13);
                    let _fxT = 0;
                    this.time.addEvent({ delay: 33, repeat: 55, callback: () => {
                        if(!lvFxG.scene) return;
                        _fxT++;
                        lvFxG.clear();
                        const prog = _fxT / 55;
                        for(let i = 0; i < 12; i++){
                            const angle = (i/12)*Math.PI*2 + _fxT*0.07;
                            const r2 = CIR_R + 5 + prog * 28;
                            lvFxG.fillStyle(i%3===0?0xffee44:i%3===1?0xff8800:0xd4874a, Math.max(0, 1-prog*1.1));
                            lvFxG.fillCircle(CIR_CX+Math.cos(angle)*r2, CIR_CY+Math.sin(angle)*r2, Math.max(0.5, 3.5-prog*3));
                        }
                        if(_fxT>=55){ try{lvFxG.destroy();}catch(_){} }
                    }});
                });
            }

            // ── Prestige button (level >= 50) ───────────────────────────
            if(PLAYER_LEVEL >= 50){
                const prBtnY = CIR_CY + CIR_R + 8;
                const prG = this.add.graphics().setDepth(8).setAlpha(0);
                const _dPr = (h) => {
                    prG.clear();
                    prG.fillStyle(h ? 0x3a2800 : 0x1a1200, 1);
                    prG.fillRoundedRect(CIR_CX - CIR_R, prBtnY - 10, 110, 22, 7);
                    prG.lineStyle(1.5, 0xffaa00, h ? 0.9 : 0.6);
                    prG.strokeRoundedRect(CIR_CX - CIR_R, prBtnY - 10, 110, 22, 7);
                };
                _dPr(false);
                const prTxt = this.add.text(CIR_CX - CIR_R + 55, prBtnY + 1, "⭐ PRESTIGE", {
                    fontFamily: 'LilitaOne, Arial, sans-serif', fontSize: '11px',
                    color: '#ffcc44', stroke: '#000', strokeThickness: 2
                }).setOrigin(0.5).setDepth(9).setAlpha(0);
                this.add.rectangle(CIR_CX - CIR_R + 55, prBtnY + 1, 110, 22, 0xffffff, 0.001).setDepth(10)
                    .setInteractive({useHandCursor: true})
                    .on("pointerover", () => _dPr(true))
                    .on("pointerout",  () => _dPr(false))
                    .on("pointerdown", () => {
                        if(_plvPrestige()){
                            NT_SFX.play("chest_open", "legendary");
                            this.cameras.main.flash(300, 255, 200, 50);
                            this.scene.restart();
                        }
                    });
                this.tweens.add({targets:[prG, prTxt], alpha:1, duration:380, delay:700, ease:'Quad.easeOut'});
            }

            // ── LEVEL DAİRESİNE TIKLAMA → XP PANEL ─────────────────────
            const _lvHitZone = this.add.circle(CIR_CX, CIR_CY, CIR_R + 10, 0xffffff, 0.001)
                .setDepth(11).setInteractive({useHandCursor: true});
            _lvHitZone.on("pointerdown", () => {
                const xpNeeded  = _plvXpNeeded(PLAYER_LEVEL);
                const xpCurrent = PLAYER_LEVEL_XP;
                const xpLeft    = xpNeeded - xpCurrent;
                const ratio     = Math.min(1, xpCurrent / xpNeeded);
                const PW = 230, PH = 178;
                const PX = 10,  PY = CIR_CY * 2 + 14;
                const DP = 210;
                const objs = [];
                const _A  = o => { objs.push(o); return o; };
                const _cl = () => { objs.forEach(o => { try{ o.destroy(); }catch(_){} }); };
                const CX2 = PX + PW / 2;
                const isTR = CURRENT_LANG === "tr";

                // Overlay — tıklayınca kapansın
                _A(this.add.rectangle(180, 320, 360, 640, 0x000000, 0.60)
                    .setDepth(DP).setInteractive()).on("pointerdown", _cl);

                // Panel arkaplanı
                const pg = _A(this.add.graphics().setDepth(DP+1));
                pg.fillStyle(0x0d0800, 0.97);
                pg.fillRoundedRect(PX, PY, PW, PH, 13);
                pg.lineStyle(2, 0xffaa00, 0.85);
                pg.strokeRoundedRect(PX, PY, PW, PH, 13);
                // İç parlama — üst kenar
                pg.lineStyle(1, 0xffdd44, 0.18);
                pg.beginPath(); pg.moveTo(PX+13, PY+1); pg.lineTo(PX+PW-13, PY+1); pg.strokePath();
                pg.setAlpha(0);
                this.tweens.add({ targets: pg, alpha: 1, duration: 220, ease: 'Back.easeOut' });

                // Başlık
                const titleTxt = _A(this.add.text(CX2, PY + 20,
                    "⭐  LEVEL " + PLAYER_LEVEL + (PLAYER_PRESTIGE > 0 ? "  ✦"+PLAYER_PRESTIGE : ""),
                    { fontFamily:'LilitaOne, Arial, sans-serif', fontSize:'17px',
                      color:'#ffdd44', stroke:'#000', strokeThickness:3 }
                ).setOrigin(0.5).setDepth(DP+2).setAlpha(0));

                // Ayırıcı çizgi
                const divG = _A(this.add.graphics().setDepth(DP+2).setAlpha(0));
                divG.lineStyle(1, 0x443300, 0.7);
                divG.beginPath(); divG.moveTo(PX+16, PY+33); divG.lineTo(PX+PW-16, PY+33); divG.strokePath();

                // Satır yardımcısı
                const _row = (label, val, rowY, valColor) => {
                    _A(this.add.text(PX+16, PY+rowY, label, {
                        fontFamily:'LilitaOne, Arial, sans-serif', fontSize:'11px',
                        color:'#aa8844', stroke:'#000', strokeThickness:1
                    }).setOrigin(0, 0.5).setDepth(DP+2).setAlpha(0));
                    _A(this.add.text(PX+PW-16, PY+rowY, val, {
                        fontFamily:'LilitaOne, Arial, sans-serif', fontSize:'11px',
                        color: valColor || '#ffcc44', stroke:'#000', strokeThickness:1
                    }).setOrigin(1, 0.5).setDepth(DP+2).setAlpha(0));
                };

                _row(isTR?"Mevcut XP:"       :"Current XP:",     xpCurrent.toLocaleString()+" XP",  50, "#ffcc44");
                _row(isTR?"Sonraki seviye:"  :"Next level at:",  xpNeeded.toLocaleString()+" XP",   68, "#ffcc44");
                _row(isTR?"Kalan XP:"        :"XP remaining:",   xpLeft.toLocaleString()+" XP",     86, "#ff9944");
                _row(isTR?"Toplam XP (kümül)":"Total XP earned",
                    (function(){ let t=0; for(let i=1;i<PLAYER_LEVEL;i++) t+=_plvXpNeeded(i); return (t+xpCurrent).toLocaleString(); })()+" XP",
                    104, "#cc88ff");

                // XP bar arka plan + dolum
                const barX=PX+16, barY=PY+118, barW=PW-32, barH=13;
                const barG = _A(this.add.graphics().setDepth(DP+2).setAlpha(0));
                barG.fillStyle(0x2a1400, 1);
                barG.fillRoundedRect(barX, barY, barW, barH, 5);
                if(ratio > 0.015){
                    barG.fillStyle(0xff8800, 1);
                    barG.fillRoundedRect(barX, barY, Math.max(6, barW*ratio), barH, 5);
                    barG.fillStyle(0xffdd44, 0.35);
                    barG.fillRoundedRect(barX, barY+1, Math.max(6, barW*ratio), barH/2-1, {tl:5,tr:3,bl:0,br:0});
                }
                barG.lineStyle(1, 0x664400, 0.7);
                barG.strokeRoundedRect(barX, barY, barW, barH, 5);
                _A(this.add.text(PX+PW/2+16, PY+124, Math.round(ratio*100)+"%", {
                    fontFamily:'LilitaOne, Arial, sans-serif', fontSize:'9px',
                    color:'#fff', stroke:'#000', strokeThickness:2
                }).setOrigin(0.5).setDepth(DP+3).setAlpha(0));

                // Sonraki level altın ödülü
                const nextGold = Math.round(_plvGoldReward(PLAYER_LEVEL+1) * _plvPrestigeMultiplier());
                _A(this.add.text(CX2, PY+139,
                    (isTR?"Seviye atladığında: ":"On level up: ")+"+"+nextGold.toLocaleString()+" 🪙",
                    { fontFamily:'LilitaOne, Arial, sans-serif', fontSize:'10px',
                      color:'#ccaa44', stroke:'#000', strokeThickness:1 }
                ).setOrigin(0.5).setDepth(DP+2).setAlpha(0));

                // Kapat
                const closeZone = _A(this.add.text(CX2, PY+PH-14,
                    isTR?"KAPAT  ✕":"CLOSE  ✕",
                    { fontFamily:'LilitaOne, Arial, sans-serif', fontSize:'10px',
                      color:'#665533', stroke:'#000', strokeThickness:1 }
                ).setOrigin(0.5).setDepth(DP+2).setInteractive({useHandCursor:true}).setAlpha(0));
                closeZone.on("pointerdown", _cl);

                // Hepsini fade in
                objs.filter(o => o && o.setAlpha && o.alpha === 0).forEach(o =>
                    this.tweens.add({ targets:o, alpha:1, duration:180, ease:'Quad.easeOut' }));

                try{ NT_SFX.playUI("click"); }catch(_){}
            });
        }

                // ── WHEEL + MISSIONS mini buttons ──
        {
            const miniY=H-26;
            const miniBtns=[
                {label:(CURRENT_LANG==='tr'?'CARK':'WHEEL'), icon:'🎡', cb:()=>NT_Monetization.showFortuneWheel(this), badge:'wheel'},
                {label:(CURRENT_LANG==='tr'?'GOREV':'QUESTS'), icon:'📋', cb:()=>NT_Monetization.showMissions(this), badge:'quests'}
            ];
            miniBtns.forEach((md,i)=>{
                const mx=CX-65+i*130;
                const mg=this.add.graphics().setDepth(8).setAlpha(0);
                const _dm=h=>{mg.clear();mg.fillStyle(h?0x1a2a3c:0x0e1828,1);mg.fillRoundedRect(mx-48,miniY-13,96,26,7);mg.lineStyle(1.5,h?0xffdd44:0x3a5a7a,h?0.9:0.5);mg.strokeRoundedRect(mx-48,miniY-13,96,26,7);};
                _dm(false);
                const mt=this.add.text(mx,miniY,md.icon+' '+md.label,{fontFamily:'LilitaOne,Arial,sans-serif',fontSize:'11px',color:'#ccddee',stroke:'#000',strokeThickness:2}).setOrigin(0.5).setDepth(9).setAlpha(0);
                const hitBox=this.add.rectangle(mx,miniY,96,26,0xffffff,0.001).setDepth(10).setInteractive({useHandCursor:true});
                this.tweens.add({targets:[mg,mt],alpha:1,duration:380,delay:650,ease:'Quad.easeOut'});

                // ── Notification badge — sarı(pending)/kırmızı(claimable)/yok(alındı) ──
                let badgeG=null, badgeTxt=null, badgeTween=null;
                const _refreshBadge=()=>{
                    const isQ=md.badge==='quests', isW=md.badge==='wheel';
                    const unclaimed=isQ&&NT_Monetization.hasUnclaimedQuests&&NT_Monetization.hasUnclaimedQuests();
                    const pending  =isQ&&!unclaimed&&NT_Monetization.hasPendingQuests&&NT_Monetization.hasPendingQuests();
                    const wheelRdy =isW&&NT_Monetization.hasWheelReady&&NT_Monetization.hasWheelReady();
                    const show=unclaimed||pending||wheelRdy;
                    const badgeCol=(unclaimed||wheelRdy)?0xff2244:0xffcc00;
                    const glowCol =(unclaimed||wheelRdy)?0xff3344:0xffdd44;
                    if(show && !badgeG){
                        const bx = mx+40, by = miniY-11;
                        badgeG = this.add.graphics().setDepth(11);
                        const _drawBadge=(scale)=>{
                            badgeG.clear();
                            badgeG.fillStyle(glowCol, 0.35);
                            badgeG.fillCircle(bx, by, 10*scale);
                            badgeG.fillStyle(badgeCol, 1);
                            badgeG.fillCircle(bx, by, 7*scale);
                            badgeG.lineStyle(1.2, 0xffffff, 0.9);
                            badgeG.strokeCircle(bx, by, 7*scale);
                        };
                        _drawBadge(1);
                        badgeTxt = this.add.text(bx, by, "!", {
                            fontFamily:'LilitaOne,Arial,sans-serif', fontSize:'12px',
                            color:'#ffffff', stroke:'#000', strokeThickness:2, fontStyle:'bold'
                        }).setOrigin(0.5).setDepth(12);
                        // Pulsing scale tween
                        const _sc={v:1};
                        badgeTween = this.tweens.add({
                            targets:_sc, v:1.22, duration:620,
                            yoyo:true, repeat:-1, ease:'Sine.easeInOut',
                            onUpdate:()=>{
                                _drawBadge(_sc.v);
                                if(badgeTxt && !badgeTxt.destroyed) badgeTxt.setScale(_sc.v);
                            }
                        });
                    } else if(!show && badgeG){
                        try{ badgeTween && badgeTween.remove(); }catch(_){}
                        try{ badgeG.destroy(); }catch(_){}
                        try{ badgeTxt && badgeTxt.destroy(); }catch(_){}
                        badgeG=null; badgeTxt=null; badgeTween=null;
                    }
                };
                // Initial check (slight delay so monetization module is fully ready)
                this.time.delayedCall(800, _refreshBadge);
                // Periodic re-check (for wheel countdown expiry)
                this.time.addEvent({delay:60000, loop:true, callback:_refreshBadge});
                // Re-check after popup closes
                hitBox.on('pointerover',()=>_dm(true))
                      .on('pointerout',()=>_dm(false))
                      .on('pointerdown',()=>{
                          NT_SFX.play('menu_click');
                          md.cb();
                          this.time.delayedCall(300, _refreshBadge);
                          this.time.delayedCall(1500, _refreshBadge);
                          this.time.delayedCall(5000, _refreshBadge);
                      });
            });
        }
        // ── DAILY REWARD CHECK ──
        NT_Monetization.checkDailyReward(this);

        // ── ENTRANCE: camera fade + panel pop-in + staggered button drop-in ─
        this.cameras.main.setAlpha(0);
        this.tweens.add({targets:this.cameras.main,alpha:1,duration:280,ease:"Quad.easeOut"});
        panel.setScale(m.sc*0.04).setAlpha(0);
        title.setAlpha(0);
        titleGlow.setAlpha(0);
        // Also hide btn parts for stagger entrance
        btns.forEach(b=>{
            [b.g,b.shadow,b.ic,b.shineG].forEach(o=>{ if(o) o.setAlpha(0); });
        });
        this.tweens.add({
            targets:panel, scaleX:m.sc, scaleY:m.sc, alpha:1,
            duration:220, ease:"Back.easeOut",
            onComplete:()=>{
                this.tweens.add({targets:title,alpha:1,duration:180,ease:"Quad.easeOut"});
                this.tweens.add({targets:titleGlow,alpha:1,duration:280,ease:"Quad.easeOut"});
                // Stagger each button in — sadece alpha, scale yok
                btns.forEach((b,i)=>{
                    const parts=[b.g,b.shadow,b.ic,b.shineG].filter(Boolean);
                    this.time.delayedCall(80+i*65,()=>{
                        parts.forEach(o=>{ if(o&&!o.destroyed) o.setAlpha(0); });
                        this.tweens.add({targets:parts,alpha:1,duration:200,ease:"Quad.easeOut"});
                    });
                });
            }
        });
    }

    _smooth(){
        try{
            const gl=this.renderer&&this.renderer.gl; if(!gl) return;
            ["mm_bg","mm_panel","mm_small","mm_play","mm_settings","mm_shop","mm_howto","mm_lb"].forEach(k=>{
                try{
                    const s=(this.textures.get(k)||{}).source; if(!s) return;
                    s.forEach(src=>{ if(src&&src.glTexture){
                        gl.bindTexture(gl.TEXTURE_2D,src.glTexture);
                        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
                    }});
                }catch(_){}
            });
            gl.bindTexture(gl.TEXTURE_2D,null);
        }catch(_){}
    }

    _goGame(){
        // Buton cift tiklama korumasi
        if(this._goGameFired) return;
        this._goGameFired = true;
        NT_SFX.play("menu_click");
        // Menu butonlarini devre disi birak
        if(this._menuHitZones){
            this._menuHitZones.forEach(h=>{ try{ h.disableInteractive(); }catch(_){} });
        }
        // Hafif fade-out (300ms) sonra sahneyi baslat
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", ()=>{
            this.scene.start("SceneGame");
        });
    }

    // ── Shop ─────────────────────────────────────────────────────────
    _showShop() { NT_Monetization.showShop(this); }
    _showSettings(){
        // Use mm_panel (340px wide) centered slightly higher to leave room
        const {A,close,pTop,pBot,stripCY,contentTop,contentBot,TX,VX,PW,CX,depth}
            = NT_OpenPopup(this,"mm_panel",330,CURRENT_LANG==="tr"?"⚙  AYARLAR":"⚙  SETTINGS",310,20);

        let ly=contentTop+8;
        const _row=(lbl,getV,toggle)=>{
            A(this.add.text(TX,ly,lbl,NT_STYLE.body(17)).setOrigin(0,0.5).setDepth(depth+3));
            const col=()=>getV()?"#44ff88":"#ff5555";
            const vt=A(this.add.text(VX,ly,getV()?(CURRENT_LANG==="tr"?"ACIK":"ON"):(CURRENT_LANG==="tr"?"KAPALI":"OFF"),NT_STYLE.accent(17,col())).setOrigin(1,0.5).setDepth(depth+3).setInteractive({useHandCursor:true}));
            vt.on("pointerdown",()=>{ NT_SFX.play("menu_click"); toggle(); vt.setText(getV()?(CURRENT_LANG==="tr"?"ACIK":"ON"):(CURRENT_LANG==="tr"?"KAPALI":"OFF")); vt.setColor(col()); });
            ly+=46;
        };
        _row(CURRENT_LANG==="tr"?"SFX SES":"SFX",          ()=>window._nt_sfx_enabled!==false,   ()=>{window._nt_sfx_enabled  =window._nt_sfx_enabled===false;});
        _row(CURRENT_LANG==="tr"?"MUZIK":"MUSIC",        ()=>window._nt_music_enabled!==false, ()=>{
            window._nt_music_enabled=window._nt_music_enabled===false;
            if(window._nt_music_enabled!==false){ NT_SFX.startMusic(); } else { NT_SFX.stopMusic(true); }
        });

        // ── DIL / LANGUAGE TOGGLE ───────────────────────────
        {
            A(this.add.text(TX, ly, CURRENT_LANG==="tr"?"DiL":"LANGUAGE", NT_STYLE.body(17)).setOrigin(0,0.5).setDepth(depth+3));
            const _langBtn = (lang, bx) => {
                const active = () => CURRENT_LANG === lang;
                const bg = A(this.add.graphics().setDepth(depth+3));
                const txt = A(this.add.text(bx, ly, lang.toUpperCase(), {
                    fontFamily:"LilitaOne,Arial,sans-serif", fontSize:"15px",
                    color: active()?"#ffffff":"#aaddff",
                    stroke:"#000", strokeThickness:2
                }).setOrigin(0.5,0.5).setDepth(depth+4).setInteractive({useHandCursor:true}));
                const _draw = () => {
                    bg.clear();
                    bg.fillStyle(active()?0x1a6ecc:0x112233, active()?0.85:0.6);
                    bg.fillRoundedRect(bx-22, ly-12, 44, 24, 6);
                    if(active()){
                        // Secili panel: ic highlight + parlak kenar
                        bg.fillStyle(0xffffff, 0.18);
                        bg.fillRoundedRect(bx-20, ly-10, 40, 9, {tl:5,tr:5,bl:0,br:0});
                        bg.lineStyle(2.5, 0x88ddff, 1);
                        bg.strokeRoundedRect(bx-22, ly-12, 44, 24, 6);
                        // Dis glow halkasi
                        bg.lineStyle(4, 0x44aaff, 0.3);
                        bg.strokeRoundedRect(bx-25, ly-15, 50, 30, 8);
                    } else {
                        bg.lineStyle(1.5, 0x334455, 1);
                        bg.strokeRoundedRect(bx-22, ly-12, 44, 24, 6);
                    }
                    txt.setColor(active()?"#ffffff":"#aaddff");
                };
                _draw();
                txt.on("pointerdown", () => {
                    if(active()) return; // zaten secili, tekrar basma
                    NT_SFX.play("menu_click");
                    setLang(lang);
                    // Tum menu butonlarinin dili aninda guncellensin diye sahneyi yeniden baslat
                    this.time.delayedCall(150, () => { this.scene.restart(); });
                });
                return { bg, txt, _draw };
            };
            const enBtn = _langBtn("en", VX - 50);
            const trBtn = _langBtn("tr", VX - 2);
            ly += 46;
        }
        ly+=12;

        // ── SFX / MUSIC VOLUME SLIDERS (compact, kutu icinde ortali) ────
        const _mkSlider=(lbl, getVal, setVal, onChange)=>{
            A(this.add.text(TX,ly,lbl,NT_STYLE.body(13)).setOrigin(0,0.5).setDepth(depth+3));
            const pct=()=>Math.round(getVal()*100);
            const pctT=A(this.add.text(VX,ly,pct()+"%",NT_STYLE.accent(13,"#aaddff")).setOrigin(1,0.5).setDepth(depth+3));
            const trackPad=4;
            const trackW=VX-TX-trackPad*2;
            const trackX=TX+trackPad;
            const trackY=ly+18, trackH=6;
            const trackBg=A(this.add.graphics().setDepth(depth+3));
            trackBg.fillStyle(0x223344,1); trackBg.fillRoundedRect(trackX,trackY-trackH/2,trackW,trackH,3);
            const fillGfx=A(this.add.graphics().setDepth(depth+4));
            const _drawFill=()=>{
                fillGfx.clear();
                const fw=Math.max(3,trackW*getVal());
                fillGfx.fillStyle(0x44aaff,1); fillGfx.fillRoundedRect(trackX,trackY-trackH/2,fw,trackH,3);
            };
            _drawFill();
            const thumbR=8;
            const thumbGfx=A(this.add.graphics().setDepth(depth+5));
            const _drawThumb=()=>{
                thumbGfx.clear();
                const tx2=trackX+trackW*getVal();
                thumbGfx.fillStyle(0xffffff,1); thumbGfx.fillCircle(tx2,trackY,thumbR);
                thumbGfx.lineStyle(2,0x44aaff,1); thumbGfx.strokeCircle(tx2,trackY,thumbR);
            };
            _drawThumb();
            const hitZone=A(this.add.rectangle(trackX+trackW/2,trackY,trackW+24,thumbR*2+8).setDepth(depth+6).setInteractive({useHandCursor:true}).setAlpha(0.001));
            const _onDrag=(ptr)=>{
                const rx=Phaser.Math.Clamp(ptr.x-this.cameras.main.worldView.x-trackX,0,trackW);
                const v=rx/trackW;
                setVal(v); onChange(v); pctT.setText(pct()+"%"); _drawFill(); _drawThumb();
            };
            hitZone.on("pointerdown",_onDrag).on("pointermove",(p)=>{ if(p.isDown) _onDrag(p); });
            ly+=38;
        };

        _mkSlider("SFX VOL",
            ()=>window._nt_sfx_vol??0.8,
            v=>{ window._nt_sfx_vol=v; localStorage.setItem("nt_sfx_vol",v); },
            v=>NT_SFX.setSFXVolume(v)
        );
        _mkSlider("MUSIC VOL",
            ()=>window._nt_mus_vol??0.6,
            v=>{ window._nt_mus_vol=v; localStorage.setItem("nt_mus_vol",v); },
            v=>NT_SFX.setMusicVolume(v)
        );
        ly+=4;
    }

    // ── How To Play ───────────────────────────────────────────────────
    _showHowTo(){
        const {A,close,contentTop,contentBot,TX,CX,PW,depth}
            = NT_OpenPopup(this,"mm_panel",330,CURRENT_LANG==="tr"?"❓  NASIL OYNANIR":"❓  HOW TO PLAY",320,20);
        let ly=contentTop+6;
        (CURRENT_LANG==="tr" ? [
            ["🎯","HEDEF",        "Piramitleri yere dusmeden once yok et!"],
            ["⬅➡","HAREKET",     "Ekran kenarlarina bas veya ← → tuslari."],
            ["🔫","ATES ET",      "Ates butonu veya BOSLUK tusu."],
            ["💥","TAM ORTA",     "Tam merkeze vur = 3× hasar bonusu!"],
            ["⭐","SEViYE ATLA",  "XP topla → guc sec."],
            ["🔗","EVRiM",        "2 eslesme → Evrim!"],
            ["💀","COMBO",        "Hizli oldur → combo → daha fazla XP & altin!"],
            ["🍎","ELMA",         "Nadir dusme = +3 Can."],
        ] : [
            ["🎯","GOAL",       "Destroy pyramids before they hit the ground!"],
            ["⬅➡","MOVE",      "Tap screen sides or ← → arrow keys."],
            ["🔫","SHOOT",      "Fire button or SPACE to shoot."],
            ["💥","CENTER HIT", "Dead center = 3× damage bonus!"],
            ["⭐","LEVEL UP",   "Collect XP orbs → pick a power-up."],
            ["🔗","EVOLUTION",  "Max 2 matching upgrades → Evolution!"],
            ["💀","COMBO",      "Kill fast → combo → more XP & gold!"],
            ["🍎","APPLE",      "Rare drops = +3 HP."],
        ]).forEach(([ico,ttl,desc])=>{
            if(ly+46>contentBot) return;
            A(this.add.text(TX,ly,ico+" "+ttl,NT_STYLE.accent(13,"#ffdd44")).setOrigin(0,0).setDepth(depth+3));
            A(this.add.text(TX,ly+17,desc,Object.assign({},NT_STYLE.body(11),{wordWrap:{width:PW-36}})).setOrigin(0,0).setDepth(depth+3));
            ly+=48;
        });
    }

    // ── Leaderboard ───────────────────────────────────────────────────
    _showLeaderboard(){
        let _lbClosed = false;
        const {A,close,contentTop,contentBot,TX,VX,CX,PW,depth}
            = NT_OpenPopup(this,"mm_panel",330,CURRENT_LANG==="tr"?"🏆  SKOR TABLOSU":"🏆  LEADERBOARD",320,20, ()=>{ _lbClosed=true; });

        // ── Personal highscore at top ──
        const hs = parseInt(localStorage.getItem("nt_highscore")||"0");
        const hsBg = A(this.add.graphics().setDepth(depth+2));
        hsBg.fillStyle(0x1a1000, 0.85);
        hsBg.fillRoundedRect(TX, contentTop+2, VX-TX, 28, 8);
        hsBg.lineStyle(1.5, 0xFFD700, 0.5);
        hsBg.strokeRoundedRect(TX, contentTop+2, VX-TX, 28, 8);
        A(this.add.text(TX+8, contentTop+16, CURRENT_LANG==="tr"?"EN iYi SKORUN":"YOUR BEST", {
            fontFamily:"LilitaOne,Arial,sans-serif", fontSize:"11px",
            color:"#FFD700", stroke:"#000", strokeThickness:2
        }).setOrigin(0, 0.5).setDepth(depth+3));
        A(this.add.text(VX-8, contentTop+16, "🏆 "+hs.toLocaleString(), {
            fontFamily:"LilitaOne,Arial,sans-serif", fontSize:"14px",
            color:"#FFD700", stroke:"#000", strokeThickness:3
        }).setOrigin(1, 0.5).setDepth(depth+3));

        const hY=contentTop+36;
        A(this.add.text(TX,    hY,"#",     NT_STYLE.stat(12)).setOrigin(0,0).setDepth(depth+3));
        A(this.add.text(TX+28, hY,CURRENT_LANG==="tr"?"OYUNCU":"PLAYER",NT_STYLE.stat(12)).setOrigin(0,0).setDepth(depth+3));
        A(this.add.text(CX+30, hY,CURRENT_LANG==="tr"?"LV":"LV",  NT_STYLE.stat(11,"#88aacc")).setOrigin(0.5,0).setDepth(depth+3));
        A(this.add.text(VX,    hY,CURRENT_LANG==="tr"?"SKOR":"SCORE", NT_STYLE.stat(12)).setOrigin(1,0).setDepth(depth+3));
        const dg=A(this.add.graphics().setDepth(depth+3));
        dg.lineStyle(1,0x44aaff,0.30); dg.lineBetween(TX,hY+18,VX,hY+18);

        const loadTxt=A(this.add.text(CX,hY+55,CURRENT_LANG==="tr"?"⏳  Yukleniyor...":"⏳  Loading...",NT_STYLE.body(15)).setOrigin(0.5).setDepth(depth+3));
        lbFetchScores().then(()=>{
            try{if(loadTxt&&!loadTxt.destroyed)loadTxt.destroy();}catch(_){}
            if(_lbClosed) return;
            const myId=(_TG_USER&&_TG_USER.id)||null;
            const scores=lbGetMergedScores().slice(0,12);
            const newTexts=[];

            if(scores.length===0){
                newTexts.push(A(this.add.text(CX,hY+55,CURRENT_LANG==="tr"?"Henuz skor yok!":"No scores yet!",NT_STYLE.body(15)).setOrigin(0.5).setDepth(depth+3).setAlpha(0)));
            } else {
                let ry=hY+26;
                scores.forEach((s,i)=>{
                    if(ry+22>contentBot) return;
                    const isMe=s.id===myId;
                    const col=i===0?"#ffcc00":i===1?"#cccccc":i===2?"#cc8833":"#ddeeff";
                    newTexts.push(A(this.add.text(TX,    ry,"#"+(i+1),  NT_STYLE.accent(13,col)           ).setOrigin(0,0.5).setDepth(depth+3).setAlpha(0)));
                    newTexts.push(A(this.add.text(TX+28, ry,(s.name||"???")+(isMe?" ★":""), NT_STYLE.accent(13,isMe?"#44ff88":"#fff")).setOrigin(0,0.5).setDepth(depth+3).setAlpha(0)));
                    const lvStr=s.level?"Lv"+s.level:"-";
                    newTexts.push(A(this.add.text(CX+30, ry,lvStr, NT_STYLE.accent(11,"#88aacc")).setOrigin(0.5,0.5).setDepth(depth+3).setAlpha(0)));
                    newTexts.push(A(this.add.text(VX,    ry,s.score.toLocaleString(),       NT_STYLE.accent(13,col)           ).setOrigin(1,0.5).setDepth(depth+3).setAlpha(0)));
                    ry+=26;
                });
            }
            // 2 frame bekle → font glyphleri rasterize edilsin, sonra goster
            requestAnimationFrame(()=>requestAnimationFrame(()=>{
                if(_lbClosed){
                    newTexts.forEach(t=>{ try{if(t&&!t.destroyed){t.setAlpha(0);t.destroy();}}catch(_){} });
                    return;
                }
                newTexts.forEach(t=>{ try{if(t&&!t.destroyed)t.setAlpha(1);}catch(_){} });
            }));
        }).catch(()=>{ try{if(loadTxt&&!loadTxt.destroyed)loadTxt.setText("❌ Connection error");}catch(_){} });
    }
}

// ═══════════════════════════════════════════════════════════════
// PART E: SceneGame (tam oyun), Combat, Weapons, XP,
//          LevelUp, GameOver, Phaser Boot
// ═══════════════════════════════════════════════════════════════

class SceneGame extends Phaser.Scene {
    constructor(){ super({key:SCENE_KEY}); }

    preload(){
        this.load.image("bg",           "assets/blue_background.png");
        this.load.image("pause_button",  "assets/pause_button.png");
        this.load.image("icon_gold",     "assets/gold.png");
        this.load.image("icon_gem",      "assets/gem.png");
        // icon_wheel removed — wheel is drawn with graphics
        this.load.image("ui_pause_win",  "assets/ui/Pause window.png");
        this.load.image("ui_btn_wide_g", "assets/ui/Yellow Wide button.png");
        this.load.image("ui_confirm",    "assets/ui/Confirm (4).png");
        this.load.image("ui_decline",    "assets/ui/Decline (4).png");
        this.load.image("pyramid",      "assets/pyramid.png");
        this.load.image("zigzag",       "assets/zigzag.png");

        // ── UPGRADE ICONS — assets/Icons/ klasorunden, dosya adi = upgrade key ──
        const _iconKeys = [
            "attack","chain_shot","crit","damage","drone","explosive",
            "freeze","heal","heavy_cannon","knockback","laser","lightning",
            "maxhp","pierce","poison","precision_rifle","rapid_blaster",
            "reflection_rifle","regen","saw","size","speed","split",
            "spread_shot","thunder","xpboost"
        ];
        _iconKeys.forEach(k => {
            this.load.image("upicon_"+k, "assets/Icons/"+k+".png");
        });
        this.load.spritesheet("pyramid_break", "assets/pyramid_break.png", {frameWidth:183, frameHeight:112});
        this.load.spritesheet("zigzag_break",  "assets/zigzag_break.png",  {frameWidth:177, frameHeight:115});
        // ── OYUNCU SPRITE SHEETS ──
        this.load.spritesheet("idle",  "assets/Idle.png",  {frameWidth:32, frameHeight:34});  // 200x34 → 6 kare (32px aralikli)
        this.load.spritesheet("run",   "assets/Run.png",   {frameWidth:32, frameHeight:32});  // 320x32 → 10 kare
        this.load.spritesheet("death", "assets/Death.png", {frameWidth:40, frameHeight:40});  // 320x40 → 8 kare
        this.load.spritesheet("get_damage", "assets/get_damage.png", {frameWidth:33, frameHeight:30}); // 132x30 → 4 kare
        // ── PATLAMA SPRITE SHEET ──
        this.load.spritesheet("explosion",  "assets/Explosion.png", {frameWidth:64, frameHeight:64});  // 256x256 → 4x4=16 kare
        this.load.spritesheet("exp1", "assets/exp1.png", {frameWidth:32, frameHeight:32}); // 352x32 → 11 kare
        this.load.spritesheet("exp2", "assets/exp2.png", {frameWidth:32, frameHeight:32}); // 192x32 → 6 kare
        this.load.spritesheet("exp3", "assets/exp3.png", {frameWidth:72, frameHeight:72}); // 1152x72 → 16 kare
        // ── HIT SMOKE — bullet impact duman animasyonlari ──
        this.load.spritesheet("smoke",  "assets/smoke.png",  {frameWidth:64, frameHeight:60});  // 768x60  → 12 kare
        this.load.spritesheet("smoke2", "assets/smoke2.png", {frameWidth:64, frameHeight:64});  // 768x329 → 5×12 grid


        // ── FONT PRELOAD — Phaser text render edilmeden once LilitaOne yuklu olmali ──
        // Gorunmez canvas uzerinde warm-up render → tarayici font cache'e alir
        try{
            if(!document.getElementById("nt-font-warmup")){
                const fc = document.createElement("canvas");
                fc.id = "nt-font-warmup";
                fc.width = 4; fc.height = 4;
                fc.style.cssText = "position:absolute;left:-9999px;top:-9999px;pointer-events:none;";
                document.body.appendChild(fc);
                const ctx = fc.getContext("2d");
                // Her agirlik/boyut kombinasyonunu render et — tarayici font varyantlarini cache'ler
                ["bold 32px","bold 20px","bold 16px","bold 14px","bold 13px","bold 12px","bold 11px","11px","bold 10px"].forEach(w=>{
                    ctx.font = w+" LilitaOne, Arial, sans-serif";
                    ctx.fillText("Ag0", 0, 3);
                });
            }
        }catch(e){console.warn("[NT] Hata yutuldu:",e)}

        // Icon smooth filtering is applied in create() after WebGL textures are uploaded to GPU
    }

    create(){
        const W=360,H=640;
        // [CRASH FIX] Kill any lingering tweens/timers from previous run
        try{ if(this.tweens) this.tweens.killAll(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        // [UX] Sahne baslangicinda timeScale sifirla — onceki oyundan kalinti onle
        this.time.timeScale=1.0;
        // [CRASH FIX] Physics'in onceki oturumdan pause'da kalmasini onle.
        try{ this.physics.resume(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        _upgradeLock=0;
        _levelUpChoosing=false;

        // ── _openPanel setter — panel acilinca butonlari otomatik gizle ──────
        let _panelValue=null;
        Object.defineProperty(this,"_openPanel",{
            get:()=>_panelValue,
            set:(v)=>{
                _panelValue=v;
                if(v){ _hideMobileBtns(this); }
                else { if(GS&&!GS.gameOver&&!GS.pickingUpgrade) _showMobileBtns(this); }
            },
            configurable:true
        });

        // ── SCENE SHUTDOWN CLEANUP — memory leak onleme ───────
        this.events.once("shutdown", ()=>{
            try{
                // Tum tween'leri durdur
                this.tweens.killAll();
                // Time event'lerini temizle
                this.time.removeAllEvents();
                // Wheel listener temizle
                if(this.input&&this.input.off) this.input.off("wheel");
                // _activeEnemies cache temizle
                if(this._enemyCacheTimer) this._enemyCacheTimer.remove();
                this._activeEnemies=[];
                // Flame/ring grafikleri temizle
                // [v9.3] flameRing kaldirildi
                if(this.playerGlow) try{this.playerGlow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this.hpBarGfx) try{this.hpBarGfx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this.xpBarBg) try{this.xpBarBg.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this.xpBarFill) try{this.xpBarFill.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                // [FIX] Sari serit kalintilari — xpBar yardimci nesneleri temizle
                if(this.xpBarGlow) try{this.xpBarGlow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this._xpBarShine) try{this._xpBarShine.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this._xpBarPulse) try{this._xpBarPulse.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                // [FIX] HUD yazilari temizle
                if(this._lvBadgeGfx) try{this._lvBadgeGfx.destroy();}catch(e){}
                if(this._lvNum) try{this._lvNum.destroy();}catch(e){}
                if(this._gemPillGfx) try{this._gemPillGfx.destroy();}catch(e){}
                if(this._goldPillGfx) try{this._goldPillGfx.destroy();}catch(e){}
                if(this.gemText) try{this.gemText.destroy();}catch(e){}
                if(this.gemIcon) try{this.gemIcon.destroy();}catch(e){}
                if(this.goldText) try{this.goldText.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                // [FIX] Laser grafigi temizle
                if(this.laserGfx) try{this.laserGfx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                // [FIX] Event HUD bar temizle
                if(this._evHudBar) try{this._evHudBar.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this._evHudBg) try{this._evHudBg.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                this._evHudBar = null; this._evHudBg = null;
                // [FIX] Slot UI grafikleri temizle
                if(this.weaponSlots) this.weaponSlots.forEach(o=>{try{o.destroy();}catch(e){}});
                if(this.passiveSlots) this.passiveSlots.forEach(o=>{try{o.destroy();}catch(e){}});
                if(this.weaponSlotIcons) this.weaponSlotIcons.forEach(o=>{try{o.destroy();}catch(e){}});
                if(this.passiveSlotIcons) this.passiveSlotIcons.forEach(o=>{try{o.destroy();}catch(e){}});
                // [FIX] Acik panel varsa kapat (setter uzerinden — defineProperty ile tanimli)
                try{ this._openPanel = null; }catch(e){}
                if(this.comboText) try{this.comboText.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this.scoreText) try{this.scoreText.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this._evoHintText) try{this._evoHintText.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                this._evoHintText = null;
                // Physics gruplari temizle
                if(this.bullets) try{this.bullets.clear(true,true);}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this.xpOrbs) this.xpOrbs=[];
                _debrisCount=0;
                _dmgNumCount=0;
                // [PERF-FIX] FPS buffer ve cleanup sayaclarini sifirla — onceki oturumdan kalma birikim
                _fpsBufIdx=0; _fpsBufCount=0; _fpsBufSum=0; _perfModeFrame=0; _cleanupFrame=0;
                // [Artifact cleanup kaldirildi — v9.1]
                // [CRASH FIX] Global lock state'i sifirla — bir sonraki oyun baslangicinda
                // onceki oturumdan kalan _upgradeLock>0 veya _microFreeze=true durumu
                // physics'in pause'da kalmasina neden olabilir.
                _upgradeLock=0;
                _levelUpChoosing=false;
                _chaosParticleTimer=0;
                GS=null;
            }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        });

        buildTextures(this);

        // ── TEXTURE FILTERS ──
        // pixelArt:false modunda: upicon_ → trilinear mipmap, idle/run → NEAREST, digerleri → LINEAR
        const _applyIconLinear = () => {
            try{
                const gl = this.renderer && this.renderer.gl;
                if(!gl) return;
                this.textures.getTextureKeys().forEach(k=>{
                    if(k==='__DEFAULT'||k==='__MISSING') return;
                    const isCharacter    = (k==='idle' || k==='run' || k==='death' || k==='get_damage');
                    const isUpicon       = k.startsWith('upicon_');
                    try{
                        const t = this.textures.get(k);
                        if(!t||!t.source) return;
                        t.source.forEach(src=>{
                            const _validTex = src && src.glTexture &&
                                typeof src.glTexture === 'object' &&
                                (typeof WebGLTexture === 'undefined' || src.glTexture instanceof WebGLTexture);
                            if(_validTex){
                                gl.bindTexture(gl.TEXTURE_2D, src.glTexture);
                                if(isCharacter){
                                    // Pixel art karakter — NEAREST: asla bulanmaz
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                                    try{ if(src.smoothed !== undefined) src.smoothed = false; }catch(_){}
                                } else if(isUpicon){
                                    // 128x128 POT upgrade ikonlar — trilinear mipmap + anisotropic
                                    gl.generateMipmap(gl.TEXTURE_2D);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                    // Anisotropic filtering — keskinlik icin
                                    try{
                                        const aniso = gl.getExtension('EXT_texture_filter_anisotropic') ||
                                                      gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                                                      gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
                                        if(aniso){
                                            const maxAniso = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                                            gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, maxAniso));
                                        }
                                    }catch(_){}
                                    try{ if(src.smoothed !== undefined) src.smoothed = true; }catch(_){}
                                } else {
                                    // Diger PNG'ler — LINEAR
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                    try{ if(src.smoothed !== undefined) src.smoothed = true; }catch(_){}
                                }
                            }
                        });
                    }catch(e){console.warn("[NT] Hata yutuldu:",e)}
                });
                gl.bindTexture(gl.TEXTURE_2D, null);
            }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        };
        _applyIconLinear();
        this._applyIconLinear = _applyIconLinear;
        // [FIX] Birden fazla retry — ikonlar async yuklenir, ilk cagri bazi texture'lari atlar
        this.time.delayedCall(100,  _applyIconLinear);
        this.time.delayedCall(400,  _applyIconLinear);
        this.time.delayedCall(1000, _applyIconLinear);

        // [MOBILE PERF] mobilede shake yariya indirildi — GPU/CPU yuk azaltma
        const _origShake=this.cameras.main.shake.bind(this.cameras.main);
        this.cameras.main.shake=function(duration,intensity,...args){
            const _mobMult = _IS_MOBILE_EARLY ? 0.4 : 1.0;
            const safeIntensity=Math.min((intensity||0)*_mobMult, 0.008); // hard cap
            const safeDuration=Math.min((duration||0)*_mobMult, _IS_MOBILE_EARLY?60:120);
            if(safeIntensity<=0) return;
            return _origShake(safeDuration,safeIntensity,...args);
        };

        // Animasyonlar
        if(!this.anims.exists("anim_idle"))  this.anims.create({key:"anim_idle",  frames:this.anims.generateFrameNumbers("idle",  {start:0,end:5}),  frameRate:8,  repeat:-1});
        if(!this.anims.exists("anim_run"))   this.anims.create({key:"anim_run",   frames:this.anims.generateFrameNumbers("run",   {start:0,end:7}),  frameRate:14, repeat:-1});
        if(!this.anims.exists("anim_death")) this.anims.create({key:"anim_death", frames:this.anims.generateFrameNumbers("death", {start:0,end:7}),  frameRate:12, repeat:0});
        // anim_damage — sadece texture yukluyse olustur
        if(!this.anims.exists("anim_damage") && this.textures.exists("get_damage"))
            this.anims.create({key:"anim_damage", frames:this.anims.generateFrameNumbers("get_damage",{start:0,end:3}), frameRate:14, repeat:0});
        if(!this.anims.exists("anim_expl"))  this.anims.create({key:"anim_expl",  frames:this.anims.generateFrameNumbers("explosion", {start:0,end:15}), frameRate:18, repeat:0});
        if(!this.anims.exists("anim_exp1"))  this.anims.create({key:"anim_exp1",  frames:this.anims.generateFrameNumbers("exp1", {start:0,end:10}), frameRate:16, repeat:0});
        if(!this.anims.exists("anim_exp2"))  this.anims.create({key:"anim_exp2",  frames:this.anims.generateFrameNumbers("exp2", {start:0,end:5}),  frameRate:14, repeat:0});
        if(!this.anims.exists("anim_exp3"))  this.anims.create({key:"anim_exp3",  frames:this.anims.generateFrameNumbers("exp3", {start:0,end:15}), frameRate:18, repeat:0});
        if(!this.anims.exists("anim_break")) this.anims.create({key:"anim_break", frames:this.anims.generateFrameNumbers("pyramid_break",{start:0,end:2}),frameRate:10,repeat:0});
        // ── HIT SMOKE ANIMASYONLARI — mermi carpma efekti (6 varyant) ──
        // smoke.png: 12 kare tek satir
        if(this.textures.exists("smoke")){
            if(!this.anims.exists("anim_smoke")) this.anims.create({key:"anim_smoke", frames:this.anims.generateFrameNumbers("smoke",{start:0,end:11}), frameRate:36, repeat:0});
        }
        // smoke2.png: 5 satir × 12 sutun → 5 farkli animasyon tipi
        if(this.textures.exists("smoke2")){
            if(!this.anims.exists("anim_smoke2a")) this.anims.create({key:"anim_smoke2a", frames:this.anims.generateFrameNumbers("smoke2",{start:0, end:11}), frameRate:34, repeat:0}); // yildiz/spark
            if(!this.anims.exists("anim_smoke2b")) this.anims.create({key:"anim_smoke2b", frames:this.anims.generateFrameNumbers("smoke2",{start:12,end:23}), frameRate:32, repeat:0}); // blob/nokta
            if(!this.anims.exists("anim_smoke2c")) this.anims.create({key:"anim_smoke2c", frames:this.anims.generateFrameNumbers("smoke2",{start:24,end:35}), frameRate:32, repeat:0}); // swirl 1
            if(!this.anims.exists("anim_smoke2d")) this.anims.create({key:"anim_smoke2d", frames:this.anims.generateFrameNumbers("smoke2",{start:36,end:47}), frameRate:32, repeat:0}); // swirl 2
            if(!this.anims.exists("anim_smoke2e")) this.anims.create({key:"anim_smoke2e", frames:this.anims.generateFrameNumbers("smoke2",{start:48,end:59}), frameRate:32, repeat:0}); // swirl 3
        }

        // Yeni piramit tipleri pyramid_break animasyonunu kullanir

        // GS baslat
        const sv=JSON.parse(localStorage.getItem("nt_shop")||"{}");
        GOLD_UPGRADES.forEach(u=>{u.level=sv[u.id]||0;});
        Object.keys(UPGRADES).forEach(k=>UPGRADES[k].level=0);
        EVOLUTIONS.forEach(e=>e.active=false);
        SYNERGIES.forEach(s=>s.active=false); // [BUG FIX] Sinerji state'i sifirla — onceki oyundan kalinti onleme

        GS={
            health: 6+(GOLD_UPGRADES.find(u=>u.id==="start_hp")?.level||0)*3,
            maxHealth: 6+(GOLD_UPGRADES.find(u=>u.id==="start_hp")?.level||0)*3,
            damage: 1.2*(1+(GOLD_UPGRADES.find(u=>u.id==="start_dmg")?.level||0)*0.15), // erken oyun: biraz daha guclu basla
            _baseDamage: 1.2*(1+(GOLD_UPGRADES.find(u=>u.id==="start_dmg")?.level||0)*0.15), // [BALANCE] stored for soft cap reference
            moveSpeed: 248*(1+(GOLD_UPGRADES.find(u=>u.id==="start_spd")?.level||0)*0.10),
            shootDelay:170,        // erken oyun daha responsive (was 190)
            bulletSpeed:480, bulletScale:1.0, splitLevel:0, pierceCount:0,
            critChance:(GOLD_UPGRADES.find(u=>u.id==="crit_start")?.level||0)*0.05,
            critMult:2.0, knockback:0, freezeChance:0,
            xp:0, xpToNext:28, level:1, // [v10.1] 30→28: ilk level-up biraz daha erken
            _xpPerSecAccum:0, _xpPerSecWindow:0,
            _lastLevelUpTime:-9999,
            _recentOffers:[],
            xpMult: Math.min(2.0, (1.0+(GOLD_UPGRADES.find(u=>u.id==="xp_bonus")?.level||0)*0.15) * NT_Monetization.getXPMultiplier()),
            magnetRadius:40, // [v9.4] fixed small auto-collect radius (magnet upgrade removed)
            goldMult: (1.0+(GOLD_UPGRADES.find(u=>u.id==="gold_bonus")?.level||0)*0.18) * NT_Monetization.getGoldMultiplier(),
            gold:0, kills:0, t:0, score:0,
            pyramidSpeed:65, spawnDelay:1400, // erken oyun: YOK DENLI yavas baslar (was 90 / 900)
            invincible:false, gameOver:false, pickingUpgrade:false,
            combo:0, maxCombo:0, comboTimer:0, comboDmgBoost:1.0, comboXpBoost:1.0,
            resonanceDist:45, bossActive:false, _bossKills:0,
            directorPhase:"calm",
            activeWeapon:"default", // [v9.4] weapon transformation system
            orbitAngle:0,            // used by drone orbit positioning
            extraLife:(GOLD_UPGRADES.find(u=>u.id==="extra_life")?.level||0)>0,
            usedExtraLife:false,
            _knockbackTimer:0,
            // [OPT] Evolution cache flag'leri — doShoot hot-path'te EVOLUTIONS.find() cagrisindan kacinmak icin
            _evoTriCannon:false, _evoStormCore:false,
            _evoOverload:false,  _evoCryoField:false,  _evoPlagueBearer:false,
            _evoMirrorStorm:false,
            _stormCoreCooldown:false, // [v10.x] Storm Core crit→lightning CD flag
            // ★ YENI: Sinerji flag'leri
            _synergyCryoShatter:false, _synergyChainStorm:false,
            _synergyDroneShield:false,
            _synergyLaserFocus:false, _synergyWindCure:false,
            // [v9.4] New weapon synergy flags
            _synergyRapidFreeze:false, _synergyCannonPoison:false,
            _synergyPrecisionCrit:false, _synergyChainLightning:false,
            // [v10.0] Reflection Rifle synergy flags
            _synergyReflectFreeze:false, _synergyReflectExplosive:false,
            _droneHitCount:0,
            // Artifact sistemi kaldirildi — v9.1
            // artifact combo fields removed
            // ★ YENI: Event sistemi
            _lastEventTime:60000, _eventCooldown:0,
            _eliteHuntCount:0,
            // ★ YENI: Kristal sistemi
            _crystalReviveUsed:false,
            _gemReviveUsed:false,    // gem/diamond revive kullanildi mi — ikincisinde direkt gameover
            _statsDirty:true,  // [PERF-FIX] ilk frame'de syncStatsFromPipeline calissin
            // ★ YENI: Yeni event flag'leri
            _glassCannon:false, _glassCannonPipelined:false,
            _dmgBurstActive:false, _survivalModeDebuff:false,
            _chaosSpeedDebuff:false, _blitzMode:false, _blitzXpPenalty:false,
            _xpFrenzyMode:false,
            // ★ YENI: Mini boss sistemi
            miniBossActive:false, _lastMiniBossTime:120000,
            // ★ YENI: Gorev takip
            questProgress:{kills:0,combo:0,time:0,perfect:0,goldcol:0,level:0,boss:0},
            // ★ ADIM 4: Relic flag'leri
            _relicDesertEye:false,
            _relicComboHeart:false, _relicVoidCrystal:false, _relicBerserkerRing:false,
            _relicLuckyCharm:false, _relicPhoenixAsh:false,
            _relicStormSeed:false, _phoenixUsed:false,
            // ★ ADIM 4 SONU
            // ★ GAME FEEL state
            _nearDeathActive:false, _nearDeathDmgBoost:1.0, _nearDeathPulseT:0,
            _lastHitTime:0, _chaosLevel:0, _lastPowerSpikeCombo:0,
            _lastNormalFreeze:0,
            // ★ YENI: Col kum firtinasi sistemi
            // [BALANCE] Chest and event rate limiters
            _chestOnScreen:false, _lastChestTime:-90000, _lastRunEventTime:0,
            _nextEventJitter:0,
            // Difficulty spike system
            _spikeActive:false, _lastSpikeTime:0, _spawnDelayOverride:0,
            // [VFX] Gorsel efekt alanlari
            _healFlash:0,           // can alindiginda yesil flash suresi (ms)
            _speedBuffActive:false,  // hiz buff aktif (ruzgar efekti icin)
            _upgradeGlowTimers:{},   // son alinan upgrade'ler (slot glow icin)
        };

        // ── EventManager sifirla — her yeni run icin temiz baslangic ──
        EventManager._activeEvent = null;
        EventManager._lastEndTime = -EventManager.COOLDOWN;
        EventManager._state = null;
        if(typeof GS !== "undefined" && GS) { try{ GS._recentOffers=[]; }catch(e){console.warn("[NT] Hata yutuldu:",e)} }

        // [ADIM 4] Sahip olunan reliclari uygula
        applyOwnedRelics(GS);
        if(NT_Monetization.isBoosterActive("shield")){GS.maxHealth+=1;GS.health+=1;NT_Monetization.consumeBooster("shield");}


        // [v9.2] Pipeline ile baslangic stat'larini senkronize et
        if(GS) GS._statsDirty=true;

        // ── EARLY-RUN GOLD BOOST ─────────────────────────────────────
        // New players need at least one shop upgrade quickly.
        // First 3 runs give bonus starting gold: run1=150, run2=100, run3=60
        // Tracked in localStorage. No effect after run 3.
        try{
            let _runCount = parseInt(localStorage.getItem("nt_run_count")||"0");
            _runCount++;
            localStorage.setItem("nt_run_count", _runCount);
            const _earlyBonus = _runCount===1 ? 150 : _runCount===2 ? 100 : _runCount===3 ? 60 : 0;
            if(_earlyBonus > 0){
                GS.gold += _earlyBonus;
                PLAYER_GOLD += _earlyBonus; secureSet("nt_gold",PLAYER_GOLD);
                // Show hint on first run, silent on 2/3
                if(_runCount === 1){
                    this.time.delayedCall(2200, ()=>{
                        if(GS && !GS.gameOver)
                            showHitTxt(this, 180, 220,
                                CURRENT_LANG==="en" ? `+${_earlyBonus}G FIRST RUN BONUS!` :
                                CURRENT_LANG==="ru" ? `+${_earlyBonus}G БОНУС НОВИЧКА!` :
                                `+${_earlyBonus}G ILK OYUN BONUSU!`, "#ffcc00", true);
                    });
                }
            }
        }catch(e){console.warn("[NT] Hata yutuldu:",e)}

        // ── ARKAPLAN — fallback renk ──
        this.add.rectangle(W/2, H/2, W, H, 0x111111, 1).setDepth(-13);
        // ── PARALLAX — tek tileSprite, GPU UV-repeat ile seamless (cizgi yok) ──
        this.bgTile = this.add.tileSprite(W/2, H/2, W, H, "bg")
            .setDepth(-10).setScrollFactor(0);
        // [QUALITY] bg texture'a LINEAR dogrudan uygula — tileSprite postBoot callback'ini atlar
        try{
            const _gl2 = this.renderer && this.renderer.gl;
            if(_gl2){
                const _bt = this.textures.get("bg");
                if(_bt && _bt.source && _bt.source[0] && _bt.source[0].glTexture){
                    _gl2.bindTexture(_gl2.TEXTURE_2D, _bt.source[0].glTexture);
                    _gl2.texParameteri(_gl2.TEXTURE_2D, _gl2.TEXTURE_MIN_FILTER, _gl2.LINEAR);
                    _gl2.texParameteri(_gl2.TEXTURE_2D, _gl2.TEXTURE_MAG_FILTER, _gl2.LINEAR);
                    _gl2.texParameteri(_gl2.TEXTURE_2D, _gl2.TEXTURE_WRAP_S, _gl2.CLAMP_TO_EDGE);
                    _gl2.texParameteri(_gl2.TEXTURE_2D, _gl2.TEXTURE_WRAP_T, _gl2.CLAMP_TO_EDGE);
                    _gl2.bindTexture(_gl2.TEXTURE_2D, null);
                }
            }
        }catch(_){}
        // Kamera fade-in kaldirildi — direkt oyuna gecis

        // Zemin seridi kaldirildi

        // ── OYUNCU — tam onceki kodla ayni yere basiyor ──
        this.player=this.physics.add.sprite(W/2,GROUND_Y-24,"idle");
        this.player.setDepth(20).setScale(2.0);
        // Texture filter: postBoot callback'te renderer patch'lendi.
        // idle/run/death texture'lari upload aninda NEAREST aldi — bulaniklik yok.
        // Idle: 40x34 px → scale 2 = 80x68 gorsel; hitbox oyuna uygun
        this.player.body.setSize(30,30).setOffset(5,4);
        this.player.body.setAllowGravity(false);
        this.player.play("anim_idle");

        this.playerGlow=this.add.graphics().setDepth(19);
        this.hpBarGfx=this.add.graphics().setDepth(21).setScrollFactor(0);

        // ── FIZIK GRUPLARI ──
        this.pyramids=this.physics.add.group({classType:Phaser.Physics.Arcade.Sprite,runChildUpdate:false,maxSize:MAX_ENEMIES+10});
        this.bullets=this.physics.add.group({classType:Phaser.Physics.Arcade.Image,maxSize:120,runChildUpdate:false});
        this.sawGroup=this.physics.add.group({classType:Phaser.Physics.Arcade.Image,maxSize:6});
        this.droneGroup=this.physics.add.group({classType:Phaser.Physics.Arcade.Image,maxSize:6});
        // [v9.4] orbitGroup removed — orbit weapon removed

        // [v9.3] flameRing kaldirildi
        this.laserGfx =this.add.graphics().setDepth(18);
        this.xpOrbs=[];
        this.weaponSlots=[]; this.passiveSlots=[]; this.weaponSlotIcons=[]; this.passiveSlotIcons=[];
        this._weaponSlotOrder=[]; // [FIX] mainweapon slot sirasi takibi — slot kaymasini onler

        buildSlotUI(this);
        buildUI(this);
        // ── AAA VFX INIT ──
        initVFX(this);

        // Input
        this.cursors=this.input.keyboard.createCursorKeys();
        // SPACE tusu — ates
        this.spaceKey=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // ESC tusu — oyun durdur
        this.escKey=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on("down",()=>{ if(GS&&!GS.gameOver&&!GS.pickingUpgrade) showPause(this); });
        // [BUG FIX] A/D alternatif tuslari — yon bug'ina karsi ikincil input kaynagi
        this._altLeft  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this._altRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        // [BUG FIX] Sahne her basladiginda tum key state'lerini temizle
        this.input.keyboard.resetKeys();

        // ── MOBIL KONTROL: ATES BUTONU + DINAMIK JOYSTICK ──────────
        this._mobileLeft = false;
        this._mobileRight = false;
        this._mobileFire = false;

        const _isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (_isTouchDevice) {
            const W_MB = 360, H_MB = 640;
            // ── TUM BUTONLAR SAG TARAFA HIZALI — yukari alindi, biraz buyutuldu ──
            const BTN_Y = H_MB - 52;
            this.input.addPointer(3);

            const DIR_BTN_W = 84, DIR_BTN_H = 50, DIR_BTN_R = 12;
            const FIRE_W = 94, FIRE_H = 50, FIRE_R = 12;
            const BTN_GAP = 4;

            // Soldan saga: Fire (en solda) → Left → Right (en sagda)
            const FIRE_X  = FIRE_W/2 + 8;
            const LEFT_X  = W_MB - 8 - DIR_BTN_W - 10 - DIR_BTN_W/2;
            const RIGHT_X = W_MB - DIR_BTN_W/2 - 8;
            const FIRE_Y  = BTN_Y;
            const DIR_BTN_Y = BTN_Y;

            const fireG = this.add.graphics().setDepth(800).setScrollFactor(0);
            let _firePressing = false;

            const drawFireBtn = (pressed) => {
                fireG.clear();
                // Golge
                fireG.fillStyle(0x000000, pressed ? 0.0 : 0.25);
                fireG.fillRoundedRect(FIRE_X - FIRE_W/2 + 2, FIRE_Y - FIRE_H/2 + 4, FIRE_W, FIRE_H, FIRE_R);
                // Ana body
                fireG.fillStyle(0x1a1a2e, pressed ? 0.90 : 0.55);
                fireG.fillRoundedRect(FIRE_X - FIRE_W/2, FIRE_Y - FIRE_H/2, FIRE_W, FIRE_H, FIRE_R);
                // Ust shine
                fireG.fillStyle(0xffffff, pressed ? 0.04 : 0.10);
                fireG.fillRoundedRect(FIRE_X - FIRE_W/2 + 4, FIRE_Y - FIRE_H/2 + 3, FIRE_W - 8, FIRE_H * 0.38, FIRE_R * 0.7);
                // Border — glow efekti
                const borderCol = pressed ? 0xff6644 : 0xff8866;
                const borderAlpha = pressed ? 0.95 : 0.50;
                fireG.lineStyle(pressed ? 2 : 1.5, borderCol, borderAlpha);
                fireG.strokeRoundedRect(FIRE_X - FIRE_W/2, FIRE_Y - FIRE_H/2, FIRE_W, FIRE_H, FIRE_R);
                // Inner glow
                if(pressed){
                    fireG.lineStyle(4, 0xff4422, 0.18);
                    fireG.strokeRoundedRect(FIRE_X - FIRE_W/2 + 3, FIRE_Y - FIRE_H/2 + 3, FIRE_W - 6, FIRE_H - 6, FIRE_R - 2);
                }
                // ── MERMI IKONU — yatay, saga dogru ──
                const bAlpha = pressed ? 1.0 : 0.82;
                const bx = FIRE_X, by = FIRE_Y;
                const trailAlpha = pressed ? 0.55 : 0.38;
                fireG.lineStyle(2, 0xff8844, trailAlpha);
                fireG.lineBetween(bx - 20, by - 5, bx - 8, by - 5);
                fireG.lineStyle(2.5, 0xff6622, trailAlpha + 0.1);
                fireG.lineBetween(bx - 22, by,     bx - 8, by);
                fireG.lineStyle(2, 0xff8844, trailAlpha);
                fireG.lineBetween(bx - 20, by + 5, bx - 8, by + 5);
                fireG.fillStyle(0xffdd88, bAlpha);
                fireG.fillRoundedRect(bx - 7, by - 5, 18, 10, 4);
                fireG.fillStyle(0xffbb44, bAlpha);
                fireG.fillTriangle(bx + 11, by - 5, bx + 11, by + 5, bx + 19, by);
                fireG.fillStyle(0xffffff, pressed ? 0.20 : 0.35);
                fireG.fillRoundedRect(bx - 5, by - 3, 10, 3, 2);
            };
            drawFireBtn(false);

            let _fireActivePtr = null;
            const fireHit = this.add.rectangle(FIRE_X, FIRE_Y, FIRE_W, FIRE_H, 0xffffff, 0.001)
                .setDepth(802).setScrollFactor(0).setInteractive();
            fireHit.on("pointerdown", (ptr) => {
                _fireActivePtr = ptr.id; _firePressing = true;
                drawFireBtn(true); this._mobileFire = true;
            });
            fireHit.on("pointerup",  (ptr) => {
                if(ptr.id === _fireActivePtr){ _fireActivePtr = null; _firePressing = false;
                    drawFireBtn(false); this._mobileFire = false; }
            });
            fireHit.on("pointerout", (ptr) => {
                if(ptr.id === _fireActivePtr){ _fireActivePtr = null; _firePressing = false;
                    drawFireBtn(false); this._mobileFire = false; }
            });

            this._btnFire = { g: fireG, lbl: null, hit: fireHit };

            // ── SOL / SAG BUTONLAR — saga hizali, ates butonu solunda ──────────
            const leftG  = this.add.graphics().setDepth(800).setScrollFactor(0);
            const rightG = this.add.graphics().setDepth(800).setScrollFactor(0);

            const _drawDirBtn = (gfx, cx, label, pressed, borderCol) => {
                gfx.clear();
                // Golge
                gfx.fillStyle(0x000000, pressed ? 0.0 : 0.25);
                gfx.fillRoundedRect(cx - DIR_BTN_W/2 + 2, DIR_BTN_Y - DIR_BTN_H/2 + 4, DIR_BTN_W, DIR_BTN_H, DIR_BTN_R);
                // Ana body
                gfx.fillStyle(0x1a1a2e, pressed ? 0.90 : 0.55);
                gfx.fillRoundedRect(cx - DIR_BTN_W/2, DIR_BTN_Y - DIR_BTN_H/2, DIR_BTN_W, DIR_BTN_H, DIR_BTN_R);
                // Ust shine
                gfx.fillStyle(0xffffff, pressed ? 0.04 : 0.10);
                gfx.fillRoundedRect(cx - DIR_BTN_W/2 + 4, DIR_BTN_Y - DIR_BTN_H/2 + 3, DIR_BTN_W - 8, DIR_BTN_H * 0.38, DIR_BTN_R * 0.7);
                // Border
                gfx.lineStyle(pressed ? 2 : 1.5, borderCol, pressed ? 0.95 : 0.50);
                gfx.strokeRoundedRect(cx - DIR_BTN_W/2, DIR_BTN_Y - DIR_BTN_H/2, DIR_BTN_W, DIR_BTN_H, DIR_BTN_R);
                // Inner glow
                if(pressed){
                    gfx.lineStyle(4, borderCol, 0.18);
                    gfx.strokeRoundedRect(cx - DIR_BTN_W/2 + 3, DIR_BTN_Y - DIR_BTN_H/2 + 3, DIR_BTN_W - 6, DIR_BTN_H - 6, DIR_BTN_R - 2);
                }
                // Ok ikonu — biraz daha buyuk
                gfx.fillStyle(0xffffff, pressed ? 0.95 : 0.60);
                const ax = cx, ay = DIR_BTN_Y;
                if(label === "left"){
                    gfx.fillTriangle(ax-14, ay, ax+7, ay-10, ax+7, ay+10);
                } else {
                    gfx.fillTriangle(ax+14, ay, ax-7, ay-10, ax-7, ay+10);
                }
            };
            _drawDirBtn(leftG,  LEFT_X,  "left",  false, 0x5588ff);
            _drawDirBtn(rightG, RIGHT_X, "right", false, 0x5588ff);

            let _leftActivePtr = null, _rightActivePtr = null;

            const leftHit = this.add.rectangle(LEFT_X,  DIR_BTN_Y, DIR_BTN_W, DIR_BTN_H, 0xffffff, 0.001)
                .setDepth(802).setScrollFactor(0).setInteractive();
            const rightHit = this.add.rectangle(RIGHT_X, DIR_BTN_Y, DIR_BTN_W, DIR_BTN_H, 0xffffff, 0.001)
                .setDepth(802).setScrollFactor(0).setInteractive();

            leftHit.on("pointerdown",  (ptr) => { _leftActivePtr = ptr.id; this._mobileLeft = true;  _drawDirBtn(leftG,  LEFT_X,  "left",  true,  0x5588ff); });
            leftHit.on("pointerup",    (ptr) => { if(ptr.id===_leftActivePtr){ _leftActivePtr=null; this._mobileLeft = false; _drawDirBtn(leftG,  LEFT_X,  "left",  false, 0x5588ff); } });
            leftHit.on("pointerout",   (ptr) => { if(ptr.id===_leftActivePtr){ _leftActivePtr=null; this._mobileLeft = false; _drawDirBtn(leftG,  LEFT_X,  "left",  false, 0x5588ff); } });

            rightHit.on("pointerdown", (ptr) => { _rightActivePtr = ptr.id; this._mobileRight = true; _drawDirBtn(rightG, RIGHT_X, "right", true,  0x5588ff); });
            rightHit.on("pointerup",   (ptr) => { if(ptr.id===_rightActivePtr){ _rightActivePtr=null; this._mobileRight = false; _drawDirBtn(rightG, RIGHT_X, "right", false, 0x5588ff); } });
            rightHit.on("pointerout",  (ptr) => { if(ptr.id===_rightActivePtr){ _rightActivePtr=null; this._mobileRight = false; _drawDirBtn(rightG, RIGHT_X, "right", false, 0x5588ff); } });

            this._btnLeft  = { g: leftG,  lbl: null, hit: leftHit  };
            this._btnRight = { g: rightG, lbl: null, hit: rightHit };
        }
        // ── MOBIL KONTROL SONU ───────────────────────────────────────

        // ── ATES — duz, otomatik, garantili ──
        this._shootTimer=0;

        // SPAWN
        this.spawnEvent=this.time.addEvent({delay:GS.spawnDelay,loop:true,callback:()=>{
            if(!GS.gameOver&&!GS.pickingUpgrade){runDirector(this);spawnEnemy(this);}
        }});

        // EVENT SYSTEM — EventManager enforces all rules centrally:
        // • Only ONE active event at a time
        // • 120 s minimum cooldown between events
        // • Blocked during boss / miniboss / upgrade UI
        this.time.addEvent({delay:10000, loop:true, callback:()=>{
            if(!GS||GS.gameOver||GS.pickingUpgrade) return;
            if(_upgradeLock>0) return;
            if(EventManager.isBusy(GS)) return; // hard block during boss/miniboss
            if(!EventManager.canTrigger(GS)) return;
            triggerRunEvent(this);
        }});

        // ★ YENI: Mini boss spawn — every 5 minutes (was 3) — prevents boss overload
        this.time.addEvent({delay:300000,loop:true,callback:()=>{
            if(!GS||GS.gameOver||GS.pickingUpgrade||GS.miniBossActive) return;
            spawnMiniBoss(this);
        }});

        // ★ YENI: Sinerji kontrol — her level-up'tan sonra ve bu event ile de tetiklenir
        this.time.addEvent({delay:5000,loop:true,callback:()=>{
            if(!GS||GS.gameOver) return;
            checkAndApplySynergies(this);
        }});


        // Regen — [v11 REDESIGN] Pasif bekleme yok. Oldurme ve combo uzerinden iyilesme.
        // Lv1: her 4. oldurme +1 HP | Lv2: her 3. oldurme +1 HP, %5 crit → +1 HP
        // Bu tick sadece combat-regen disi fallback: 12s hasar almamissa Lv2'de +1 HP
        this.time.addEvent({delay:500, loop:true, callback:()=>{
            if(!GS||GS.gameOver||GS.pickingUpgrade) return;
            if(UPGRADES.regen.level <= 0) return;
            if(!this._regenAccum) this._regenAccum = 0;
            this._regenAccum += 500;
            const outOfCombat = !GS._lastHitTime || (Date.now() - GS._lastHitTime) > 18000;
            // Lv2: uzun sure hasar almamissa cok yavas pasif iyilesme
            if(UPGRADES.regen.level >= 2 && this._regenAccum >= 20000 && GS.health < GS.maxHealth && outOfCombat){
                GS.health = Math.min(GS.maxHealth, GS.health + 1);
                this._regenAccum = 0;
            }
            // Wind Cure sinerjisi
            if(GS._synergyWindCure && UPGRADES.regen.level >= 2 && GS.health < GS.maxHealth){
                const moving = Math.abs(this.player?.body?.velocity?.x||0) > 30;
                if(moving && outOfCombat) GS.health = Math.min(GS.maxHealth, GS.health + 1);
            }
        }});

        // Thunder & Meteor
        // [BALANCE] Thunder delay: storm_seed relic ile 3s, normal 5s
        this.time.addEvent({delay:100, loop:true, callback:()=>{
            if(!GS||GS.gameOver||GS.pickingUpgrade) return;
            if(UPGRADES.thunder.level<=0) return;
            const thunderDelay = GS._relicStormSeed ? 3500 : 5500;
            GS._thunderAccum = (GS._thunderAccum||0) + 100;
            if(GS._thunderAccum >= thunderDelay){ GS._thunderAccum=0; doThunderStrike(this); }
        }});

        // ── BULLET ↔ ENEMY ──
      {const _S=this; _S.physics.add.overlap(_S.bullets,_S.pyramids,(b,enemy)=>{
            if(!b.active||!enemy.active||enemy.spawnProtected) return;
            if(!GS||GS.pickingUpgrade||GS.gameOver) return;
            // Body collision acik mi? disableBody sonrasi checkCollision.none=true olabilir
            if(enemy.body && enemy.body.checkCollision.none) return;
            if(!b.body || !b.body.enable) return;
            // Zemine carpmis dusmanlar mermi ile carpismasin
            if(enemy.groundHit) return;
            // Mini boss ve boss ekran disindan gelir — y<0 kontrolunden muaf
            if(!enemy._isMiniBoss && !enemy.isBoss && (enemy.y < 0 || enemy.x < -20 || enemy.x > 380)) return;
            if(enemy.mirror&&!enemy.mirrorSpawned){enemy.mirrorSpawned=true;spawnMirrorClone(_S,enemy);}
            if(enemy.absorber&&enemy.armor>1){showHitTxt(_S,enemy.x,enemy.y-8,CURRENT_LANG==="tr"?"BLOK":"BLOCK","#888888",false);b.setActive(false).setVisible(false);if(b.body)b.body.enable=false;return;}
            const gs=GS;
            // Base damage — pipeline'dan
            let dmg=gs.damage;
            // DRONE NERF: drone bullets use BASE_DAMAGE * dmgMult, not gs.damage
            // This caps drone at ~0.78-0.93 damage regardless of player upgrades
            if(b._droneShot) dmg = BASE_DAMAGE * (b._dmgMult || 0.55);
            // Per-bullet weapon damage multiplier
            else if(b._dmgMult!=null && b._dmgMult !== 1.0) dmg *= b._dmgMult;
            // BALANCE FIX: removed inline combo multiplier — pipeline already handles combo via cmbDmg
            // The old code applied combo bonus TWICE (once in calcStats, once here)
            if(b._isReflect && b._reflectDmgMult!=null) dmg*=b._reflectDmgMult; // decay 0.85x per bounce (ADIM 3)
            // [v10.x TRADEOFF] Pierce damage decay: her ek isabet −20%, taban %50
            // b._pierced: kacinci dusmana carpiyor (0=ilk)
            if((b._pierced||0) > 0 && gs.pierceCount > 0){
                const pierceDecay = Math.max(0.50, 1 - (b._pierced * 0.20));
                dmg *= pierceDecay;
            }
            if(gs._glassCannon && !gs._glassCannonPipelined) dmg*=1.0; // pipeline zaten dahil etti
            let isCrit=false;
            if(Math.random()<gs.critChance){
                // [v10.0] Rapid Blaster: crit capped at 1.5× (not 2×) — high fire rate compensates
                const _critM = (b._weaponType==="rapid") ? Math.min(gs.critMult, 1.5) : gs.critMult;
                dmg*=_critM; isCrit=true;
            }


            // Combo — ayni dusmandan 800ms icinde tekrar combo kazanilmaz
            const now=Date.now();
            const canCombo=!enemy._lastComboTime||(now-enemy._lastComboTime)>800;

            const distCenter=Math.abs(b.x-enemy.x);

            // [ADIM 6a] precision_crit synergy — perfect hit her zaman crit
            if(gs._synergyPrecisionCrit && gs.activeWeapon === "precision_rifle" && distCenter < 10){
                isCrit = true;
                dmg *= gs.critMult;
            }
            if(distCenter<10){
                // ── PERFECT HIT — silaha gore farkli carpan
                const _perfectMult =
                    gs.activeWeapon === "precision_rifle" ? 2.2 :  // was 2.0 — slight buff for skill reward
                    gs.activeWeapon === "heavy_cannon"    ? 1.5 :
                    3.0;
                dmg *= _perfectMult;
                const perfectMsgs=[L("perfect"),L("centerHit"),L("bullseye"),L("perfect")];
                showHitTxt(_S,enemy.x,enemy.y-18,perfectMsgs[Math.floor(Math.random()*perfectMsgs.length)],"#ff4400",true);
                trackPerfectHit(gs);
                // PRECISION RIFLE ZOOM — hafif feedback, fazla titreme yok
                if(gs.activeWeapon === "precision_rifle" && _S.cameras && _S.cameras.main){
                    try{
                        _S.cameras.main.shake(12, 0.002);          // BEFORE: 30, 0.005
                        _S.cameras.main.zoomTo(1.03, 60, "Quad.easeOut");  // BEFORE: 1.06
                        _S.time.delayedCall(60, ()=>{ if(_S.cameras?.main) _S.cameras.main.zoomTo(1.0, 120, "Quad.easeIn"); });
                    }catch(e){console.warn("[NT] Hata yutuldu:",e)}
                }
                if(canCombo){
                    enemy._lastComboTime=now;
                    gs.combo=Math.min(20,gs.combo+2); gs.comboTimer=2200;
                    if(gs.combo>gs.maxCombo) gs.maxCombo=gs.combo;
                    gs.comboDmgBoost=Math.min(1.35,1+gs.combo*0.018); // sadece referans icin
                    gs.comboXpBoost=Math.min(1.20,1+gs.combo*0.020);
                    if(gs) gs._statsDirty=true; // [v9.2] combo bonus pipeline'a dahil
                    // [VFX] Combo milestone WOW moments
                    const milestones={5:"🔥 x5 COMBO!",10:"⚡ x10 COMBO!",15:"💥 x15 COMBO!",20:"🌟 x20 MAX COMBO!"};
                    const mileCols={5:"#ff8800",10:"#ff4400",15:"#ff2244",20:"#ffcc00"};
                    if(milestones[gs.combo]){
                        showHitTxt(_S,180,260,milestones[gs.combo],mileCols[gs.combo],true);
                        _S.cameras.main.shake(40+gs.combo*2,0.004+gs.combo*0.0002);
                        // ── AAA COMBO MILESTONE VFX ──
                        vfxComboMilestone(_S,gs.combo,_S.player.x,_S.player.y);
                    }
                }
                triggerResonance(_S,enemy,0);
                // ── AAA PERFECT HIT VFX ──
                vfxPerfectHit(_S,enemy.x,enemy.y,gs.combo);
           } else {
                // ── NORMAL VURUS ──
                if(canCombo){
                    enemy._lastComboTime=now;
                    gs.combo=Math.min(20,gs.combo+1); gs.comboTimer=1500;
                    if(gs.combo>gs.maxCombo) gs.maxCombo=gs.combo;
                    gs.comboDmgBoost=Math.min(1.20,1+gs.combo*0.010); // referans
                    if(gs) gs._statsDirty=true; // [v9.2]
                    // ── COMBO MILESTONE VFX + SFX ──
                    if(gs.combo===5 || gs.combo===10 || gs.combo===15 || gs.combo===20){
                        const _cmTier = gs.combo===5?1:gs.combo===10?2:gs.combo===15?3:4;
                        NT_SFX.play("combo_milestone",_cmTier);
                        // Milestone — kucuk renkli halka
                        if(!_IS_MOBILE_EARLY){
                            const _cmColors = [0x44ddff, 0xaaff44, 0xff8844, 0xff44aa]; // cyan, lime, orange, pink
                            const _cmCol = _cmColors[_cmTier-1] || 0xffdd44;
                            const cr=_S.add.graphics().setDepth(28);
                            cr.x=_S.player.x; cr.y=_S.player.y;
                            cr.lineStyle(2, _cmCol, 0.85);
                            cr.strokeCircle(0,0,10);
                            _S.tweens.add({targets:cr, scaleX:2.2+_cmTier*0.3, scaleY:2.2+_cmTier*0.3, alpha:0,
                                duration:300, ease:"Quad.easeOut",
                                onComplete:()=>{try{cr.destroy();}catch(e){}}});
                        }
                        // Milestone text — kucuk ve temiz
                        const _cmLbl = gs.combo+"x";
                        const _cmTxtCols = ["#44ddff","#aaff44","#ff8844","#ff44aa"];
                        const _cmTxt = _S.add.text(_S.player.x, _S.player.y-40, _cmLbl, {
                            fontFamily:"LilitaOne",
                            fontSize:(13+_cmTier)+"px",
                            color: _cmTxtCols[_cmTier-1] || "#ffdd44",
                            stroke:"#000000", strokeThickness:2
                        }).setOrigin(0.5).setDepth(30).setAlpha(0).setScale(0.6);
                        _S.tweens.add({targets:_cmTxt, alpha:1, scaleX:1, scaleY:1, duration:180, ease:"Back.easeOut"});
                        _S.tweens.add({targets:_cmTxt, alpha:0, y:_cmTxt.y-25, duration:450, delay:400, ease:"Quad.easeIn",
                            onComplete:()=>{try{_cmTxt.destroy();}catch(e){}}});
                    }
                    // ── FIRST BLOOD ──
                    if(gs.kills===1 && gs.combo===1){
                        NT_SFX.play("first_blood");
                        const fbLang = CURRENT_LANG==="en"?"FIRST BLOOD!":CURRENT_LANG==="ru"?"ПЕРВАЯ КРОВЬ!":"ILK KAN!";
                        const fbTxt = _S.add.text(180, 200, fbLang, {
                            fontFamily:"LilitaOne",
                            fontSize:"22px",
                            color:"#ff4444", stroke:"#000000", strokeThickness:4
                        }).setOrigin(0.5).setDepth(30).setAlpha(0).setScale(0.3);
                        _S.tweens.add({targets:fbTxt, alpha:1, scaleX:1.2, scaleY:1.2, duration:300, ease:"Back.easeOut"});
                        _S.tweens.add({targets:fbTxt, alpha:0, y:160, scaleX:1.5, scaleY:1.5, duration:800, delay:600, ease:"Quad.easeIn",
                            onComplete:()=>{try{fbTxt.destroy();}catch(e){}}});
                    }
                    // Combo 15+ → high_combo muzik gecisi
                    if(gs.combo===15 && !gs.bossActive){
                        NT_SFX.setMusicState("high_combo", 1.5);
                    }
                }
                // ── AAA NORMAL HIT VFX v2 — directional + squash ──
                const _bAng=Math.atan2(b.body.velocity.y,b.body.velocity.x);
                // mermi tam carpma noktasi: b.x,b.y (enemy merkezi degil)
                vfxNormalHit(_S,b.x,b.y,isCrit,_bAng);
                // [BUG FIX] Jelly sistemi aktifken vfxEnemySquash cagirma — iki tween cakisinca sekil bozulur
                if(!enemy._staggering) vfxEnemySquash(_S,enemy);
            }

            // Mermi yonu: merminin x pozisyonundan hesapla
            // b.x < enemy.x → mermi soldan geliyor → piramit saga iter
            const _hitDir = b.x < enemy.x ? 1 : -1;
            applyDmg(_S,enemy,dmg,isCrit,_hitDir);
            // HEAVY CANNON — [FIX] Patlama animasyonu SADECE öldürünce — normal isabette sade (diğer mermiler gibi)
            if(b._weaponType==="cannon"){
                if(!enemy.active){ // [FIX] Sadece öldüren isabette patlama efekti
                    doExplosion(_S,enemy.x,enemy.y, true);
                }
                // enemy.active (sağ kaldı) → sade isabet, patlama yok — diğer mermiler gibi
            } else if(UPGRADES.explosive.level>0&&!enemy.active){
                doExplosion(_S,enemy.x,enemy.y);
            }
            // [v9.4] CANNON POISON synergy — explosion leaves poison cloud
            if(b._weaponType==="cannon"&&GS._synergyCannonPoison&&!enemy.active){
                spawnPoisonCloud(_S,enemy.x,enemy.y);
            }
            // [v9.4] CHAIN SHOT — bounce to nearby enemies
            if(b._weaponType==="chain"&&!b._chainBounced){
                b._chainBounced=true;
                b._chainCount=0;
                let lastX=enemy.x, lastY=enemy.y;
                const _visited=new Set([enemy]);
                const doBounce=()=>{
                    if(!GS||GS.gameOver) return;
                    if(b._chainCount>=6) return;  // BUFF: 3→6 sekme
                    b._chainCount++;
                    const allE=_S._activeEnemies&&_S._activeEnemies.length>0?_S._activeEnemies:_S.pyramids.getMatching("active",true);
                    let nearest=null; let nearD=9999;
                    for(let _ci=0;_ci<allE.length;_ci++){
                        const ce=allE[_ci];
                        if(!ce.active||_visited.has(ce)||ce.spawnProtected) continue;
                        const _dx=ce.x-lastX, _dy=ce.y-lastY;
                        const _d=Math.sqrt(_dx*_dx+_dy*_dy);
                        if(_d<420&&_d<nearD){nearD=_d;nearest=ce;}  // BUFF: 280→420 menzil
                    }
                    if(!nearest) return;
                    // Chain VFX — segmented electric lightning arc
                    const lg=_S.add.graphics().setDepth(18);
                    const dx=nearest.x-lastX, dy=nearest.y-lastY;
                    const dist=Math.sqrt(dx*dx+dy*dy);
                    const segments=Math.max(4,Math.floor(dist/14));
                    // Dis kalin turuncu glow
                    lg.lineStyle(6,0xff6600,0.25);
                    lg.beginPath(); lg.moveTo(lastX,lastY);
                    for(let si=1;si<segments;si++){
                        const t=si/segments;
                        const mx=lastX+dx*t+(Math.random()-0.5)*18;
                        const my=lastY+dy*t+(Math.random()-0.5)*18;
                        lg.lineTo(mx,my);
                    }
                    lg.lineTo(nearest.x,nearest.y); lg.strokePath();
                    // Ana mavi simsek
                    lg.lineStyle(3,0x44aaff,0.95);
                    lg.beginPath(); lg.moveTo(lastX,lastY);
                    for(let si=1;si<segments;si++){
                        const t=si/segments;
                        const mx=lastX+dx*t+(Math.random()-0.5)*14;
                        const my=lastY+dy*t+(Math.random()-0.5)*14;
                        lg.lineTo(mx,my);
                    }
                    lg.lineTo(nearest.x,nearest.y); lg.strokePath();
                    // Parlak beyaz ic cekirdek
                    lg.lineStyle(1.5,0xeeffff,0.90);
                    lg.beginPath(); lg.moveTo(lastX,lastY);
                    for(let si=1;si<segments;si++){
                        const t=si/segments;
                        const mx=lastX+dx*t+(Math.random()-0.5)*6;
                        const my=lastY+dy*t+(Math.random()-0.5)*6;
                        lg.lineTo(mx,my);
                    }
                    lg.lineTo(nearest.x,nearest.y); lg.strokePath();
                    // Impact flash at target — buyuk elektrik patlamasi
                    const flash=_S.add.graphics().setDepth(19);
                    flash.fillStyle(0x88ddff,0.9); flash.fillCircle(nearest.x,nearest.y,14);
                    flash.fillStyle(0xffffff,0.6); flash.fillCircle(nearest.x,nearest.y,6);
                    _S.tweens.add({targets:flash,alpha:0,scaleX:2.5,scaleY:2.5,duration:150,onComplete:()=>{try{flash.destroy();}catch(e){}}});
                    _S.tweens.add({targets:lg,alpha:0,duration:280,onComplete:()=>{try{lg.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
                    // BUFF: hasar artirildi — falloff azaltildi
                    const falloff=Math.pow(0.92,b._chainCount); // BUFF: 0.88→0.92 daha az falloff
                    applyDmg(_S,nearest,GS.damage*1.15*falloff,false); // BUFF: 0.95→1.15 daha guclu
                    NT_SFX.play("shoot_chain");
                    if(GS._synergyChainLightning) doLightning(_S);
                    _visited.add(nearest);
                    lastX=nearest.x; lastY=nearest.y;
                    _S.time.delayedCall(70,doBounce); // BUFF: 80→70ms daha hizli sekme
                };
                _S.time.delayedCall(50,doBounce); // BUFF: 60→50ms
            }
            // [v9.4] PRECISION RIFLE — perfect hit always crits (synergy)
            if(b._weaponType==="precision"&&GS._synergyPrecisionCrit&&distCenter<10){
                isCrit=true;
                dmg=Math.max(dmg, GS.damage*1.8*GS.critMult);
            }
            // [v10.0] REFLECTION RIFLE synergies ─────────────────────────
            if(b._weaponType==="reflect"){
                // Cryo Ricochet: freeze on hit (bonus 20% chance added via apply())
                if(GS._synergyReflectFreeze && gs.freezeChance>0 && Math.random()<(gs.freezeChance*0.6)){
                    freezeEnemy(_S,enemy);
                }
                // Explosive Ricochet: explosion on first hit only (b._reflectBounces===0)
                if(GS._synergyReflectExplosive && (b._reflectBounces||0)===0 && enemy.active===false){
                    doExplosion(_S,enemy.x,enemy.y);
                }
            }
            // ─────────────────────────────────────────────────────────────
            // [v11] FREEZE — Stack-based sistem
            // Her hit: dusmana 1 frost stack eklenir. Esige ulasinca dondurulur.
            // Lv1: 4 stack = slow. Lv2: 4 stack = full freeze. Lv3: 3 stack = full freeze.
            // Stack threshold dusman HP ile degil level ile olceklenmiyor → skill-based
            if(gs.freezeChance > 0){
                if(!enemy._frostStacks) enemy._frostStacks = 0;
                // freezeChance artik stack-per-hit sansi olarak calisiyor
                if(Math.random() < gs.freezeChance){
                    enemy._frostStacks++;
                    const freezeLv = UPGRADES.freeze?.level || 0;
                    const stackThreshold = freezeLv >= 3 ? 3 : 4;
                    // Gorsel: buz kirintilari artan yogunlukta
                    if(enemy._frostStacks < stackThreshold){
                        enemy.setTint(Phaser.Display.Color.Interpolate.RGBWithRGB(
                            {r:255,g:255,b:255}, {r:136,g:221,b:255},
                            stackThreshold, enemy._frostStacks
                        ).color || 0xaaddff);
                    }
                    if(enemy._frostStacks >= stackThreshold){
                        enemy._frostStacks = 0;
                        if(freezeLv >= 2){
                            freezeEnemy(_S, enemy); // tam dondurma
                        } else {
                            // Lv1: guclu slow, gercek freeze degil
                            if(enemy.body && !enemy.frozen && !enemy._slowed){
                                enemy._slowed = true;
                                const origVX=enemy.body.velocity.x, origVY=enemy.body.velocity.y;
                                enemy.body.velocity.set(origVX*0.25, origVY*0.25);
                                enemy.setTint(0x88ddff);
                                _S.time.delayedCall(1500,()=>{
                                    if(enemy&&enemy.active&&enemy._slowed){
                                        enemy._slowed=false;
                                        if(enemy.body) enemy.body.velocity.set(origVX, origVY);
                                        if(!enemy.frozen) enemy.clearTint();
                                    }
                                });
                            }
                        }
                    }
                }
            }
            b._pierced=(b._pierced||0)+1;
            // [v10.0] Anti-stack: reflect bullets CANNOT pierce — ricochet and pierce are mutually exclusive
            const effectivePierce = b._isReflect ? 0 : gs.pierceCount;
            if(b._pierced>effectivePierce){
                b.setActive(false).setVisible(false);
                if(b.body) b.body.enable=false;
            }
        });} // end _S block

        // [v9.4] orbit overlap removed — orbit weapon removed
        // Saw ↔ Enemy
        this.physics.add.overlap(this.sawGroup,this.pyramids,(saw,enemy)=>{
            if(!saw.active||!enemy.active||enemy.spawnProtected||enemy.hitByOrbit) return;
            if(enemy.body && enemy.body.checkCollision.none) return;
            if(!GS||GS.pickingUpgrade||GS.gameOver) return;
            enemy.hitByOrbit=true;
            this.time.delayedCall(180,()=>{if(enemy.active)enemy.hitByOrbit=false;});
            const sawLv=UPGRADES.saw?.level||1;
            applyDmg(this,enemy,GS.damage*(1.8+sawLv*0.3),false);
            NT_SFX.play("sfx_saw_hit");
        });

        // ── DUSMAN — OYUNCU CARPISMASI ──
        this.physics.add.overlap(this.player,this.pyramids,(player,enemy)=>{
            if(!enemy.active||enemy.spawnProtected||enemy.groundHit) return;
            if(enemy.body && enemy.body.checkCollision.none) return;
            if(GS.invincible||GS.gameOver||GS.pickingUpgrade) return;
            if(enemy._collideCooldown) return;
            enemy._collideCooldown=true;
            // [TAKILMA FIX] Aninda body devre disi — physics overlap bir sonraki frame'de tekrar tetiklemez
            if(enemy.body){ enemy.body.enable=false; enemy.body.checkCollision.none=true; }
            enemy.setActive(false).setVisible(false);
            // [CAMERA SHAKE] Dusman carpinca ekran sallanir
            this.cameras.main.shake(120,0.012);
            doExplodeVFX(this, enemy.x, enemy.y, ({normal:0xffcc55,zigzag:0x88ff44,fast:0xff4422,tank:0xaa44ff,shield:0x4488ff,kamikaze:0xff6600,ghost:0x88aacc,elder:0xffcc44,titan:0x9900dd,colossus:0xff2266,inferno:0xFF3300,glacier:0x44ccff,phantom_tri:0xcc44ff,volt:0xffee00,obsidian:0x6600aa})[enemy.type]||0xffcc55, enemy.scaleX||1);
            playerCollisionExplosion(this, enemy.x, enemy.y, enemy.type);
            killEnemy(this, enemy, false);
            damagePlayer(this);
        });

        // [OPT] _activeEnemies cache — getMatching her frame yerine 60ms'de bir calisir
        // Tum combat fonksiyonlari bu cache'i kullanir → GC baskisi belirgin azalir
        // [PERF-FIX] scene.restart() yapilinca addEvent tekrar cagrilir — duplike timer onle
        this._activeEnemies=[];
        if(this._enemyCacheEvent){ try{ this._enemyCacheEvent.remove(); }catch(_){} }
        const _cacheDelay = _IS_MOBILE_EARLY ? 120 : 60; // [MOBILE PERF] mobilede daha seyrek cache guncelleme
        this._enemyCacheEvent = this.time.addEvent({delay:_cacheDelay,loop:true,callback:()=>{
            if(!GS||GS.gameOver) return;
            this._activeEnemies=this.pyramids.getMatching("active",true);
        }});

        // [Artifact trigger timer'lari kaldirildi — v9.1]

        this.cameras.main.fadeIn(350,0,0,0);
        NT_SFX.setMusicState("gameplay", 0.5);

        // ── 3-2-1 COUNTDOWN + TUTORIAL TIP ───────────────────────
        // Oyun baslamadan once geri sayim goster, spawn'lari duraklat
        GS._countdownActive = true;
        if(this.spawnEvent) this.spawnEvent.paused = true;
        this.physics.pause();

        // [FIX] Gold icon pozisyonunu countdown oncesi dogru ayarla
        renderUI(this);

        const _cdDepth = 850;
        const CX_CD = 180, CY_CD = 280;

        // Arka plan overlay (yari saydam)
        const cdOverlay = this.add.rectangle(180, 320, 360, 640, 0x000000, 0.45).setDepth(_cdDepth-1);

        // Tutorial tip — ortadan vurma ipucu
        const tipLang = CURRENT_LANG === "en" ? "🎯 Hit enemies at the CENTER for 2x DAMAGE!" :
                        CURRENT_LANG === "ru" ? "🎯 Бейте врагов в ЦЕНТР для 2x УРОНА!" :
                        "🎯 Dusmanlari ORTADAN vur = 2x HASAR!";
        const tipTxt = this.add.text(CX_CD, CY_CD + 90, tipLang, {
            fontFamily: "LilitaOne",
            fontSize: "15px",
            color: "#ffdd44",
            stroke: "#000000", strokeThickness: 3,
            align: "center", wordWrap: { width: 300 }
        }).setOrigin(0.5).setDepth(_cdDepth+1).setAlpha(0);
        this.tweens.add({targets:tipTxt, alpha:1, duration:400, delay:200});

        // Countdown sayilari
        const countdownSequence = (step) => {
            if(!this.scene.isActive()) return;
            if(step > 0){
                // 3, 2, 1 goster
                NT_SFX.play("countdown_tick");
                const numTxt = this.add.text(CX_CD, CY_CD, step.toString(), {
                    fontFamily: "LilitaOne",
                    fontSize: "72px",
                    color: step===3 ? "#ff6644" : step===2 ? "#ffaa22" : "#44ff88",
                    stroke: "#000000", strokeThickness: 6
                }).setOrigin(0.5).setDepth(_cdDepth+2).setAlpha(0).setScale(0.3);
                this.tweens.add({targets:numTxt, alpha:1, scaleX:1, scaleY:1, duration:250, ease:"Back.easeOut"});
                this.tweens.add({targets:numTxt, alpha:0, scaleX:2.5, scaleY:2.5, duration:350, delay:400, ease:"Quad.easeIn",
                    onComplete:()=>{ try{numTxt.destroy();}catch(e){} }});
                this.time.delayedCall(750, ()=>countdownSequence(step-1));
            } else {
                // GO!
                NT_SFX.play("countdown_go");
                const goLang = CURRENT_LANG === "en" ? "GO!" :
                               CURRENT_LANG === "ru" ? "ВПЕРЁД!" : "BASLA!";
                const goTxt = this.add.text(CX_CD, CY_CD, goLang, {
                    fontFamily: "LilitaOne",
                    fontSize: "64px",
                    color: "#44ffaa",
                    stroke: "#000000", strokeThickness: 5
                }).setOrigin(0.5).setDepth(_cdDepth+2).setAlpha(0).setScale(0.4);
                this.tweens.add({targets:goTxt, alpha:1, scaleX:1.2, scaleY:1.2, duration:200, ease:"Back.easeOut"});
                this.tweens.add({targets:goTxt, alpha:0, scaleX:3, scaleY:3, duration:400, delay:350, ease:"Quad.easeIn",
                    onComplete:()=>{ try{goTxt.destroy();}catch(e){} }});
                // Tip fade out
                this.tweens.add({targets:tipTxt, alpha:0, duration:400, delay:200, onComplete:()=>{try{tipTxt.destroy();}catch(e){}}});
                // Overlay fade
                this.tweens.add({targets:cdOverlay, alpha:0, duration:500, delay:100, onComplete:()=>{try{cdOverlay.destroy();}catch(e){}}});
                // Oyunu baslat!
                this.time.delayedCall(300, ()=>{
                    GS._countdownActive = false;
                    this.physics.resume();
                    if(this.spawnEvent) this.spawnEvent.paused = false;
                });
            }
        };
        this.time.delayedCall(400, ()=>countdownSequence(3));

        // Smooth filter — tum silah mermi texture'lari
        this.time.delayedCall(150,()=>{
            ["pyramid","pyramid_break","pause_button",
             "tex_bullet_cannon","tex_bullet_precision","tex_bullet_reflect"]
            .forEach(key=>{
                try{ this.textures.get(key).source[0].smoothed=true; }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            });
        });

    }

    update(time,delta){
        const gs=GS;
        if(!gs||gs.gameOver){
            if(this._mobileLeft!==undefined){this._mobileLeft=false;this._mobileRight=false;this._mobileFire=false;this._mobileFireHoldTime=0;this._mobileFireCutOff=false;}
            return;
        }
        if(gs.pickingUpgrade){
            if(this._mobileLeft!==undefined){this._mobileLeft=false;this._mobileRight=false;this._mobileFire=false;this._mobileFireHoldTime=0;this._mobileFireCutOff=false;}
            return;
        }
        if(!this.player||!this.player.active) return;
        // Countdown sirasinda hareket/ates engelle
        if(gs._countdownActive) return;

        // ── AAA VFX TICK ──
        tickVFX(this,delta);

        // 5 dakika hayatta kalma kristal odulu
        // [FIX] Oyun ici kristal kaldirildi

        // ★ FPS monitor — performans modu guncelle
        updatePerfMode(this.game.loop.actualFps||60);
        // [PERF] Periyodik temizlik — orphan obje birikimini onle
        periodicSceneCleanup(this);

        gs.t+=delta;
        // [PERF-FIX] Cok uzun oyunlarda gs.t float precision kaybi yasar.
        // Oyun mantigi icin yalnizca goreli sure onemli, 1 saatlik periyotta sifirla.
        // _lastSpikeTime ve benzeri timerlar gs.t bazlidir — farksal olarak kullanilir, guvenli.
        if(gs.t > 3_600_000){ const _wrap=3_600_000; gs.t-=_wrap; if(gs._lastSpikeTime>_wrap) gs._lastSpikeTime-=_wrap; if(gs._lastMiniBossTime>_wrap) gs._lastMiniBossTime-=_wrap; if(gs._lastEventTime>_wrap) gs._lastEventTime-=_wrap; if(gs._lastRunEventTime>_wrap) gs._lastRunEventTime-=_wrap; }

        // Spawn delay dinamik guncelle — threshold 20ms so rate changes apply quickly
        if(this.spawnEvent){
            const newDelay=Math.max(240,gs.spawnDelay);
            if(Math.abs(this.spawnEvent.delay-newDelay)>20){
                this.spawnEvent.reset({delay:newDelay,loop:true,callback:()=>{if(!GS.gameOver&&!GS.pickingUpgrade){runDirector(this);spawnEnemy(this);}}});
            }
        }

        // Boss
        if(!gs.bossActive&&gs.level>=8&&gs.t>90000&&Math.random()<0.004) spawnBoss(this);

        // ── 60-SECOND DIFFICULTY SPIKE ──────────────────────────────
        // Every ~60s: 8-second burst where spawnDelay is halved and phase pushes to rush/chaos
        // Gives players a periodic pressure test — keeps late game tense
        if(!gs._spikeActive && !gs.bossActive && !gs.miniBossActive && gs.t > 60000){
            const _spikeInterval = 60000; // every 60 seconds
            if(!gs._lastSpikeTime) gs._lastSpikeTime = 0;
            if(gs.t - gs._lastSpikeTime >= _spikeInterval && gs.t >= 120000){ // [LEVEL 2 MID-SPIKE FIX] Suppress SURGE during Level 2 (min1→2). Fires normally from min2+ onward.
                gs._lastSpikeTime = gs.t;
                gs._spikeActive = true;
                // Force rush/chaos phase during spike
                const _prevPhase = gs.directorPhase;
                gs.directorPhase = gs.t > 300000 ? "chaos" : "rush"; // 5min+ = chaos spike
                gs._spawnDelayOverride = Math.round(gs.spawnDelay * 0.55); // spawn 45% faster
                // Brief warning text
                showHitTxt(this, 180, 200,
                    CURRENT_LANG==="en" ? "⚠ SURGE!" : CURRENT_LANG==="ru" ? "⚠ ВОЛНА!" : "⚠ DALGA!",
                    "#ff4400", true);
                // End spike after 8 seconds
                this.time.delayedCall(8000, ()=>{
                    if(!GS) return;
                    GS._spikeActive = false;
                    GS._spawnDelayOverride = 0;
                });
            }
        }
        // Apply spike override to spawn delay
        if(gs._spikeActive && gs._spawnDelayOverride > 0){
            gs.spawnDelay = gs._spawnDelayOverride;
        }

        // SKOR — kesirli birikim sistemi (120fps telefonda Math.floor sifir dondururdu)
        const prevScore=gs.score;
        gs._scoreFrac = (gs._scoreFrac||0) + (1.2+gs.level*0.32+gs.combo*0.12)*(delta/16);
        const scoreToAdd = Math.floor(gs._scoreFrac);
        if(scoreToAdd > 0){ gs.score += scoreToAdd; gs._scoreFrac -= scoreToAdd; }
        // Her 1000 skor animasyonu
        const prevK=Math.floor(prevScore/1000);
        const newK=Math.floor(gs.score/1000);
        if(newK>prevK&&this.scoreText){
            this.tweens.add({targets:this.scoreText,scaleX:1.4,scaleY:1.4,duration:100,yoyo:true,ease:"Back.easeOut"});
            // Her 1000 skorunda kucuk altin isilti
            const sg=this.add.graphics().setDepth(62);
            sg.x=180; sg.y=22;
            sg.fillStyle(0xffdd44,0.18); sg.fillRect(-60,-10,120,20);
            this.tweens.add({targets:sg,alpha:0,scaleX:1.5,duration:260,ease:"Quad.easeOut",onComplete:()=>sg.destroy()});
        }

        // Combo timer — upgrade seciminde dondur; Combo Master artifact extends duration
        if(gs.combo>0&&!gs.pickingUpgrade){
            const decayRate = 1.0;
            gs.comboTimer-=delta*decayRate;
            if(gs.comboTimer<=0){
                if(gs&&gs.combo>=5) showComboBreak(this, gs.combo);
                gs.combo=0;gs.comboDmgBoost=1.0;gs.comboXpBoost=1.0;
                if(gs) gs._statsDirty=true; // [v9.2] combo bonus kaldirildi
            }
        }

        // XP boost timer
        if(gs._xpBoostTimer>0) gs._xpBoostTimer-=delta;

        // Hareket
        movePlayer(this,delta);

        // SPACE ile ates — cooldown sistemi
        this._shootTimer=(this._shootTimer||0)+delta;
        // Basili tutuldugu surece ates etmeye devam et (cutoff yok)
        if((this.spaceKey&&this.spaceKey.isDown&&this._shootTimer>=gs.shootDelay)||(this._mobileFire&&this._shootTimer>=gs.shootDelay)){
            this._shootTimer=0;
            doShoot(this);
        }

        // Sistemler
        tickEnemies(this);
        tickBullets(this);
        tickXP(this);
        tickWeapons(this,delta);
        drawPlayerGlow(this);
        renderUI(this);

        // ★ YENI: Gorev takip guncelle

        // ★ GAME FEEL: Tum yeni sistemler
        tickProgressiveChaos(this, delta);
        tickNearDeathPulse(this, delta);
        tickPowerSpikeWords(this, delta);
        tickHiddenSynergy(this);

        // Invincible timer
        if(gs.invincible){gs._invT=(gs._invT||0)+delta;if(gs._invT>350){gs.invincible=false;gs._invT=0;}}

        // Player sinir
        this.player.x=_snap(Phaser.Math.Clamp(this.player.x,14,346));
        this.player.y=_snap(Phaser.Math.Clamp(this.player.y,60,GROUND_Y-24));
    }
}

// ── HAREKET ──────────────────────────────────────────────────
function movePlayer(S,delta){
    const gs=GS; if(!gs||gs.gameOver) return;
    if(!S.cursors||!S.player) return;

    const leftDown  = S.cursors.left.isDown  || (S._altLeft  && S._altLeft.isDown) || !!S._mobileLeft;
    const rightDown = S.cursors.right.isDown || (S._altRight && S._altRight.isDown) || !!S._mobileRight;

    let vx=0;
    const sp=gs.moveSpeed||200;
    // Mirror controls event: yon ters cevrilir
    const _mirror=gs._mirrorControls?-1:1;
    if(leftDown && !rightDown)  vx=-sp*_mirror;
    if(rightDown && !leftDown)  vx=sp*_mirror;
    // Ikisi ayni anda basiliysa: dur (0 kalir)

    // Knockback
    if(gs._knockbackTimer>0){
        gs._knockbackTimer-=delta;
        // [KAYMA FIX] Knockback sirasinda her iki eksen de sifirlanir.
        // Onceden sadece velocity.y=0 yapiliyordu — velocity.x onceki degerde
        // kaliyordu ve oyuncu 350ms boyunca kayiyordu.
        S.player.body.velocity.x=0;
        S.player.body.velocity.y=0;
    } else {
        // Anlik hiz — kayma yok, gecikme yok
        S.player.body.velocity.x=vx;
        S.player.body.velocity.y=0;
    }

    // Y zemine sabit — idle/run frame yuksekligi 34px, scale 2 → origin 0.5 → alt kenar GROUND_Y
    S.player.y=GROUND_Y-24;
    S.player.body.velocity.y=0;

    // Animasyon — death oynuyorsa kesme
    const _curAnim = S.player.anims.currentAnim?.key;
    if(_curAnim !== "anim_death"){
        if(vx!==0){
            if(_curAnim !== "anim_run") S.player.play("anim_run",true);
            S.player.setFlipX(vx<0);
            NT_SFX.footstepTick(true);
        } else {
            if(_curAnim !== "anim_idle") S.player.play("anim_idle",true);
            S._trailTimer = 0;
        }
    }

    // ── PARALLAX — tek tileSprite, GPU seamless scroll ──
    if(S.bgTile && S.bgTile.active){
        S.bgTile.tilePositionX += vx * 0.15 * (delta / 1000);
    }
}

// ── ATES — SILAH TIPINE GORE DAGITIM ──────────────────────
// ── MUZZLE FLASH v2 — per-weapon, pool-based ─────────────────
function vfxMuzzleFlash(S,x,y,weaponType){
    if(!S||!_POOL) return;
    const CFG={
        rapid:    {col:0xffee44,glow:0xffcc00,sparks:3,sz:3, glowR:6 },
        cannon:   {col:0xff6600,glow:0xff8800,sparks:5,sz:7, glowR:14},
        spread:   {col:0xcc44ff,glow:0xaa22dd,sparks:4,sz:4, glowR:8 },
        chain:    {col:0x44aaff,glow:0x2288cc,sparks:3,sz:4, glowR:7 },
        precision:{col:0xff2244,glow:0xff5566,sparks:2,sz:2, glowR:5 },
        reflect:  {col:0x20ccaa,glow:0x44ffdd,sparks:3,sz:3, glowR:7 },
        default:  {col:0xffffaa,glow:0xffee66,sparks:3,sz:3, glowR:6 },
    };
    const c=CFG[weaponType]||CFG.default;
    // Glow burst
    const glow=_POOL.get(18); if(glow){
        glow.fillStyle(c.glow,0.52); glow.fillCircle(0,0,c.glowR);
        glow.fillStyle(0xffffff,0.42); glow.fillCircle(0,0,c.glowR*0.38);
        glow.setPosition(_snap(x),_snap(y));
        _pt(S,glow,{scaleX:2.6,scaleY:2.6,alpha:0,duration:75,ease:"Quad.easeOut"});
    }
    // Spark jets
    for(let i=0;i<c.sparks;i++){
        const sp=_POOL.get(19); if(!sp) continue;
        const isUp=(weaponType!=="cannon");
        const ang=isUp
            ?Phaser.Math.DegToRad(Phaser.Math.Between(250,290))
            :Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        const len=Phaser.Math.Between(c.sz,c.sz*2.4);
        sp.lineStyle(1.5,i%2===0?c.col:0xffffff,0.90);
        sp.lineBetween(0,0,Math.cos(ang)*len,Math.sin(ang)*len);
        sp.setPosition(_snap(x),_snap(y));
        _pt(S,sp,{x:_snap(x)+Math.cos(ang)*Phaser.Math.Between(7,18),
            y:_snap(y)+Math.sin(ang)*Phaser.Math.Between(7,18),
            alpha:0,scaleY:0.1,
            duration:Phaser.Math.Between(42,88),ease:"Quad.easeOut"});
    }
}

// ── RECOIL ANIMATION ─────────────────────────────────────────
function vfxRecoil(S,weaponType){
    if(!S||!S.player||!S.tweens) return;
    const KICK={cannon:5,rapid:2,spread:3,precision:4,reflect:2,default:2};
    const kick=KICK[weaponType]||KICK.default;
    const baseY=S.player.y;
    S.tweens.add({targets:S.player,y:baseY+kick,duration:36,ease:"Quad.easeOut",
        onComplete:()=>S.tweens.add({targets:S.player,y:baseY,duration:90,ease:"Back.easeOut"})});
}

function doShoot(S){
    const gs=GS;
    const sp=gs.bulletSpeed||380;
    const vy=-sp;
    const px=S.player.x, py=S.player.y-42;
    const wt=gs.activeWeapon||"default";

    // [OPT] EVOLUTIONS.find hot-path'ten kaldirildi — applyUpgrade'de set edilen GS flag'leri kullaniliyor
    if(wt==="rapid_blaster"){
        NT_SFX.play("shoot_rapid");
        fireBulletRaw(S,px-3,py,(Math.random()-0.5)*sp*0.04,vy,0.6,0xffee44,"rapid");
        fireBulletRaw(S,px+3,py,(Math.random()-0.5)*sp*0.04,vy,0.6,0xffee44,"rapid");
    } else if(wt==="heavy_cannon"){
        NT_SFX.play("shoot_cannon");
        fireBulletRaw(S,px,py,0,vy*0.52,1.0,0xff6600,"cannon"); // mermi biraz daha yavaş — heavy hissettirsin
    } else if(wt==="spread_shot"){
        NT_SFX.play("shoot_spread");
        const ang=sp*0.52; // BALANCE: wider angle so not all 3 hit reliably
        fireBulletRaw(S,px,py,0,vy,0.45,0xcc44ff,"spread"); // BALANCE: 0.7→0.45 per bullet (total 1.35x vs old 2.1x)
        fireBulletRaw(S,px,py,-ang,vy*0.88,0.45,0xcc44ff,"spread");
        fireBulletRaw(S,px,py, ang,vy*0.88,0.45,0xcc44ff,"spread");
    } else if(wt==="chain_shot"){
        NT_SFX.play("shoot_chain");
        fireBulletRaw(S,px,py,(Math.random()-0.5)*sp*0.02,vy,0.8,0x44aaff,"chain");
    } else if(wt==="precision_rifle"){
        NT_SFX.play("shoot_precision");
        fireBulletRaw(S,px,py,0,vy*1.45,1.0,0xff2244,"precision"); // [BUFF] faster projectile = easier to land
    } else if(wt==="reflection_rifle"){
        NT_SFX.play("shoot_reflect");
        const reflAngle=(Math.random()-0.5)*sp*0.08;
        const b=fireBulletRaw(S,px,py,reflAngle,vy*1.05,1.0,0x20ccaa,"reflect");
        if(b){
            b._reflectBounces=0;          // track bounces (max 2)
            b._reflectDmgMult=1.0;        // decays 0.70x per bounce
            b._isReflect=true;
        }
    } else if(gs._evoTriCannon){
        NT_SFX.play("shoot_spread");
        fireBulletRaw(S,px,py,-sp*0.4,vy,0.50);
        fireBulletRaw(S,px,py,0,vy,0.50);
        fireBulletRaw(S,px,py,sp*0.4,vy,0.50);
    } else {
        NT_SFX.play("shoot_default");
        fireBulletRaw(S,px,py,(Math.random()-0.5)*sp*0.03,vy,1.0);
    }

    // ── VFX v2 — muzzle flash + recoil ──
    vfxMuzzleFlash(S,px,py+10,wt);
    vfxRecoil(S,wt);

    // BALANCE: Overload proc rate reduced (1% per shot, 15% per enemy, 0.35x damage)
    if(gs._evoOverload&&Math.random()<0.01){
        const _ovList=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
        for(let _oi=0;_oi<_ovList.length;_oi++){if(Math.random()<0.15)applyDmg(S,_ovList[_oi],GS.damage*0.35,false);}
    }
}

function fireBulletRaw(S,x,y,vx,vy,dmgM,weaponTint,weaponType){
    if(!S||!S.bullets||!S.player) return;
    // [PERF] Hard cap on active bullets
    if(S.bullets.countActive(true)>=80) return;
    const gs=GS;
    const b=S.bullets.get();
    if(!b) return;
    // Silaha gore texture sec
    const bulletTex =
        weaponType==="cannon"    ? "tex_bullet_cannon" :
        weaponType==="precision" ? "tex_bullet_precision" :
        weaponType==="reflect"   ? "tex_bullet_reflect" :
        weaponType==="spread"    ? "tex_bullet_spread" :
        weaponType==="chain"     ? "tex_bullet_chain" :
        "tex_bullet";
    b.setTexture(bulletTex);
    b.setPosition(x,y);
    b.setActive(true).setVisible(true);
    if(!b.body){ S.bullets.remove(b,true,true); return; }
    b.body.enable=true;
    b.body.reset(x,y);
    b.body.setAllowGravity(false);
    b.body.setBounce(0,0);
    b.body.setMaxVelocity(900,900);
    const spread=(Math.random()-0.5)*18;
    const sizeVar=0.9+Math.random()*0.2;

    // [v9.4] Weapon-type visual overrides — scale is now independent of dmgM (dmgM is damage only)
    let bScale=gs.bulletScale*sizeVar*(dmgM>0.9?1:0.72);
    let bSpread=spread;
    if(weaponType==="rapid")    { bScale*=0.70; bSpread*=0.3; }
    if(weaponType==="cannon")   { bScale*=1.10; bSpread*=0.1; }
    if(weaponType==="spread")   { bScale*=0.75; }
    if(weaponType==="chain")    { bScale*=0.90; }
    if(weaponType==="precision"){ bScale*=1.80; bSpread=0; }   // BALANCE FIX: explicit scale (was inherited from dmgM=1.8)
    if(weaponType==="reflect")  { bScale*=0.85; bSpread=0; }

    // Hitbox silah tipine gore — piramit icinden gecmesin
    if(weaponType==="cannon")    { b.body.setSize(8,20).setOffset(0,1); }  // [BUFF] 5x18→8x20 — wider hitbox, more reliable contact
    else if(weaponType==="reflect"){ b.body.setSize(7,16).setOffset(0,1); }
    else if(weaponType==="precision"){ b.body.setSize(5,18).setOffset(0,1); }
    else                         { b.body.setSize(7,16).setOffset(0,1); }

    b.setScale(bScale);
    b.body.setVelocity(vx+bSpread,vy);
    b._pierced=0; b._age=0; b._chainBounced=false; b._chainCount=0; // [FIX] Reset chain state on bullet reuse
    b._weaponType=weaponType||"default";
    b._dmgMult=(dmgM!=null?dmgM:1.0); // BALANCE FIX: store per-bullet dmgM — was only used for visual scale
    b.setDepth(16); b.setAlpha(1);
    b.setRotation(Math.atan2(vy,vx)+Math.PI/2);

    // [WEAPON VIZUEL] Weapon tint overrides damage-level tint
    if(weaponTint){
        b.setTint(weaponTint);
    } else {
        const dmgLv=UPGRADES.damage?.level||0;
        const atkLv=UPGRADES.attack?.level||0;
        const totalLv=dmgLv+atkLv;
        if(totalLv>=8)      b.setTint(0xff2200);
        else if(totalLv>=5) b.setTint(0xff8800);
        else if(totalLv>=3) b.setTint(0xffcc44);
        else                b.clearTint();
    }

    // Namlu kivilcimi — [v10.0] per-weapon identity
    const _dmgLv2=UPGRADES.damage?.level||0, _atkLv2=UPGRADES.attack?.level||0;
    const totalLv2=_dmgLv2+_atkLv2;
    const MUZZLE_CFG={
        rapid:    {col:0xffee44,count:2,sz:[2,4]},   // twin amber sparks
        cannon:   {col:0xff6600,count:4,sz:[4,9]},   // large orange burst
        spread:   {col:0xcc44ff,count:3,sz:[2,5]},   // purple fan
        chain:    {col:0x44aaff,count:2,sz:[2,5]},   // blue electric
        precision:{col:0xff2244,count:1,sz:[1,3]},   // minimal red dot
        reflect:  {col:0x20ccaa,count:2,sz:[2,4]},   // teal pulse
    };
    const mCfg=MUZZLE_CFG[weaponType]||{col:weaponTint||(totalLv2>=4?0xffaa44:0xffffaa),count:(weaponType==="cannon")?3:(totalLv2>=4?2:1),sz:[2,5]};
    for(let i=0;i<mCfg.count;i++){
        const sp=S.add.rectangle(x+Phaser.Math.Between(-3,3),y,mCfg.sz[0],Phaser.Math.Between(mCfg.sz[0],mCfg.sz[1]),mCfg.col,0.85).setDepth(17);
        S.tweens.add({targets:sp,y:y-Phaser.Math.Between(4,10),alpha:0,duration:55,onComplete:()=>sp.destroy()});
    }

    // ── Mermi trail — [v10.0] per-weapon identity colours ────
    // Her silah kendi renginde iz birakir — ekran okunabilirligi icin kritik
    const WEAPON_TRAIL={
        rapid:    {col:0xffee44,glow:0xffcc00,w:1.5,repeat:3,dur:45},  // amber twin-stream
        cannon:   {col:0xff6600,glow:0xff8800,w:4.5,repeat:6,dur:70},  // wide orange cone
        spread:   {col:0xcc44ff,glow:0xaa22dd,w:2.0,repeat:4,dur:55},  // purple fan
        chain:    {col:0x44aaff,glow:0x2288cc,w:2.5,repeat:5,dur:60},  // electric blue
        precision:{col:0xff2244,glow:0xff5566,w:0.8,repeat:7,dur:80},  // thin red beam (long)
        reflect:  {col:0x20ccaa,glow:0x44ffdd,w:2.0,repeat:5,dur:65},  // teal ricochet
    };
    const wvt=WEAPON_TRAIL[weaponType]||{col:weaponTint||(totalLv2>=8?0xff4400:totalLv2>=5?0xff8800:totalLv2>=3?0xffcc44:0xffffff),glow:weaponTint||0xfff5aa,w:1.5,repeat:4,dur:55};
    const trailW=wvt.w;
    const trailRepeat=wvt.repeat;
    S.time.addEvent({delay:18,repeat:trailRepeat,callback:()=>{
        if(!b.active) return;
        const tr=S.add.rectangle(b.x,b.y,trailW,Phaser.Math.Between(9,18),wvt.col,0.65).setDepth(15);
        tr.setRotation(b.rotation);
        S.tweens.add({targets:tr,alpha:0,scaleX:0.12,scaleY:0.08,duration:wvt.dur,ease:"Quad.easeIn",onComplete:()=>tr.destroy()});
        // White core spine — makes every bullet feel crisp
        if(Math.random()<0.55){
            const tr2=S.add.rectangle(b.x,b.y,0.8,Phaser.Math.Between(6,12),0xffffff,0.45).setDepth(16);
            tr2.setRotation(b.rotation);
            S.tweens.add({targets:tr2,alpha:0,scaleY:0.06,duration:40,onComplete:()=>tr2.destroy()});
        }
        // Weapon-colour glow halo
        if(Math.random()<0.30){
            const trG=S.add.rectangle(b.x,b.y,trailW*2.5,Phaser.Math.Between(12,20),wvt.glow,0.12).setDepth(13);
            trG.setRotation(b.rotation);
            S.tweens.add({targets:trG,alpha:0,scaleX:0.1,scaleY:0.07,duration:80,ease:"Sine.easeIn",onComplete:()=>trG.destroy()});
        }
        // Reflect: extra teal sparkle on ricochet path
        if(weaponType==="reflect"&&Math.random()<0.20){
            const sp=S.add.rectangle(b.x,b.y,1.5,3,0x44ffdd,0.70).setDepth(14);
            const sa=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
            S.tweens.add({targets:sp,x:b.x+Math.cos(sa)*Phaser.Math.Between(3,7),y:b.y+Math.sin(sa)*Phaser.Math.Between(3,7),alpha:0,duration:50,onComplete:()=>sp.destroy()});
        }
    }});

    // Mermi kovani — siyah, sari cizgili (reflect weapon'da kovan cikmaz — tufek tarzi)
    if(weaponType!=="reflect"){
        const kx=x+Phaser.Math.Between(-4,4);
        const shell=S.add.graphics().setDepth(14).setPosition(kx,y+4);
        shell.fillStyle(0x222222,1); shell.fillRect(-1,-3,3,7);
        shell.fillStyle(0xffcc00,1); shell.fillRect(0,-2,1,5);
        const svx=(Math.random()-0.5)*55;
        S.tweens.add({targets:shell,x:kx+svx,y:y+Phaser.Math.Between(18,32),
            angle:Phaser.Math.Between(-180,180),alpha:0,duration:380,
            ease:"Quad.easeIn",onComplete:()=>shell.destroy()});
    }
    return b; // [v10.0] Return bullet ref so callers (reflection_rifle) can set flags
}

// ── BULLETS TICK ─────────────────────────────────────────────
function tickBullets(S){
    S.bullets.children.iterate(b=>{
        if(!b||!b.active||!b.body) return;

        // [v10.0] REFLECTION RIFLE — ricochet physics ──────────
        // [FIX] Silah degisince havadaki eski reflect mermileri artik sekmez
        if(b._isReflect && b.body && GS && GS.activeWeapon==="reflection_rifle"){
            const ARENA_LEFT=10, ARENA_RIGHT=350, ARENA_TOP=15;
            let bounced=false;
            let bvx=b.body.velocity.x, bvy=b.body.velocity.y;
            const spd=Math.sqrt(bvx*bvx+bvy*bvy);

            // Left/Right wall bounce — hafif random aci
            if(b.x<=ARENA_LEFT && bvx<0){
                bvx=Math.abs(bvx)*(0.85+Math.random()*0.30);
                bvy=bvy*(0.85+Math.random()*0.30);
                bounced=true; b.x=ARENA_LEFT+2;
            } else if(b.x>=ARENA_RIGHT && bvx>0){
                bvx=-Math.abs(bvx)*(0.85+Math.random()*0.30);
                bvy=bvy*(0.85+Math.random()*0.30);
                bounced=true; b.x=ARENA_RIGHT-2;
            }
            // Top wall bounce — duz yukari sekmesin, random yatay aci ekle
            if(b.y<=ARENA_TOP && bvy<0){
                // Hizi koru ama yon randomize et: 30°-150° arasinda asagi
                const randomAngle = Phaser.Math.DegToRad(Phaser.Math.Between(30, 150));
                bvx = Math.cos(randomAngle) * spd;
                bvy = Math.abs(Math.sin(randomAngle) * spd); // her zaman asagi
                bounced=true; b.y=ARENA_TOP+2;
            }

            if(bounced){
                NT_SFX.play("bullet_bounce");
                b._reflectBounces=(b._reflectBounces||0)+1;
                if(b._reflectBounces>2){
                    // Max 2 bounces — destroy after
                    b.setActive(false).setVisible(false);
                    b.body.enable=false;
                    return;
                }
                // Decay damage 0.70x per bounce
                b._reflectDmgMult=(b._reflectDmgMult||1.0)*0.85; // ADIM 3: 0.70→0.85
                b.body.setVelocity(bvx,bvy);
                b.setRotation(Math.atan2(bvy,bvx)+Math.PI/2);

                // [v10.0] Mirror Storm evolution: first bounce splits into 2 extra bullets
                if(GS&&GS._evoMirrorStorm && b._reflectBounces===1 && !b._mirrored){
                    b._mirrored=true; // only split once
                    const spd2=Math.sqrt(bvx*bvx+bvy*bvy);
                    const baseAngle=Math.atan2(bvy,bvx);
                    [-0.28,0.28].forEach(da=>{
                        const nb=fireBulletRaw(S,b.x,b.y,
                            Math.cos(baseAngle+da)*spd2,
                            Math.sin(baseAngle+da)*spd2,
                            b._reflectDmgMult*0.75,0x44ffdd,"reflect"); // ADIM 3: 0.65→0.75
                        if(nb){
                            nb._isReflect=true;
                            nb._reflectBounces=2;
                            nb._reflectDmgMult=b._reflectDmgMult*0.75; // ADIM 3: 0.65→0.75
                            nb._mirrored=true;
                        }
                    });
                }

                // [VFX] Teal X flash at bounce point
                if(S && S.add){
                    const bfx=S.add.graphics().setDepth(22);
                    bfx.x=b.x; bfx.y=b.y;
                    bfx.lineStyle(2.5,0x20ccaa,1.0);
                    bfx.lineBetween(-6,-6,6,6);
                    bfx.lineBetween(6,-6,-6,6);
                    S.tweens.add({targets:bfx,scaleX:2.2,scaleY:2.2,alpha:0,
                        duration:100,ease:"Quad.easeOut",
                        onComplete:()=>{try{bfx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
                    // Tiny teal ring
                    const ring=S.add.graphics().setDepth(21);
                    ring.x=b.x; ring.y=b.y;
                    ring.lineStyle(1.5,0x44ffdd,0.85); ring.strokeCircle(0,0,5);
                    S.tweens.add({targets:ring,scaleX:3,scaleY:3,alpha:0,
                        duration:120,ease:"Quad.easeOut",
                        onComplete:()=>{try{ring.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
                }
            }
        }
        // ── end ricochet ─────────────────────────────────────────

        // Sinir disi — reflect bullets exit from bottom (ground) only
        if(b._isReflect){
            if(b.y>720||b.y<-80){
                b.setActive(false).setVisible(false);
                b.body.enable=false;
                return;
            }
        } else {
            if(b.x<-80||b.x>440||b.y<-80||b.y>720){
                b.setActive(false).setVisible(false);
                b.body.enable=false;
                return;
            }
        }
        // Max yasam 2.5 saniye
        b._age=(b._age||0)+S.game.loop.delta;
        if(b._age>2500){
            b.setActive(false).setVisible(false);
            b.body.enable=false;
            b._age=0;
            return;
        }
        // Velocity sifirlandiysa kur — asili kalma onlemi
        const spd=Math.abs(b.body.velocity.x)+Math.abs(b.body.velocity.y);
        if(b.active && spd<5){
            b.setActive(false).setVisible(false);
            b.body.enable=false;
        }
    });
}

// ── WEAPONS ──────────────────────────────────────────────────
function tickWeapons(S,delta){
    const gs=GS; if(!gs||gs.gameOver) return;
    gs.orbitAngle=(gs.orbitAngle||0)+0.04; // used by drone positioning
    // [v9.4] orbit removed — no orbit blade tick
    // [v9.3] flame kaldirildi — drawFlameRing/doFlameDmg artik cagrilmaz
    if(UPGRADES.lightning.level>0){gs._lastLightning=(gs._lastLightning||0)+delta;if(gs._lastLightning>2200){gs._lastLightning=0;doLightning(S);}}
    if(UPGRADES.laser.level>0){gs._lastLaser=(gs._lastLaser||0)+delta;if(gs._lastLaser>2500){gs._lastLaser=0;doLaser(S);}}
   {
        const slv=UPGRADES.saw.level;
        if(slv>0){
        while(S.sawGroup.getLength()<slv){
            const sw=S.physics.add.image(
                Phaser.Math.Between(40,320),
                Phaser.Math.Between(80,380),
                "tex_saw"
            );
            sw.body.setAllowGravity(false).setImmovable(false).setCircle(9);
            sw.body.setBounce(1,1);
            sw.body.setCollideWorldBounds(false); // Manuel sinir kontrolu
            const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
            const spd=160+slv*35;
            sw.body.setVelocity(Math.cos(ang)*spd, Math.sin(ang)*spd);
            sw.setActive(true).setVisible(true).setDepth(12);
            sw._sawInit=true;
            S.sawGroup.add(sw);
        }
        }
        S.sawGroup.getChildren().forEach((sw,i)=>{
            if(i<slv){
                sw.setActive(true).setVisible(true);
                // ── LEVEL-BASED RENK — Saw ──
                const _sawTints = [0xaaddff, 0xff8844, 0xff44aa];
                sw.setTint(_sawTints[Math.min(slv-1, _sawTints.length-1)]);
                sw.angle+=16;
                // Her 3-5 saniyede rastgele yeni yon — tek yorungede sikismayi onle
                sw._sawDirTimer=(sw._sawDirTimer||0)+delta;
                const dirInterval=Phaser.Math.Between(3000,5000);
                if(!sw._sawDirMax) sw._sawDirMax=dirInterval;
                if(sw._sawDirTimer>sw._sawDirMax){
                    sw._sawDirTimer=0;
                    sw._sawDirMax=Phaser.Math.Between(3000,5000);
                    const newAng=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
                    const spd2=180+slv*40;
                    sw.body.setVelocity(Math.cos(newAng)*spd2,Math.sin(newAng)*spd2);
                }
                // Tum ekran + zemin dahil bounce
                if(sw.x<8){  sw.x=8;   sw.body.velocity.x=Math.abs(sw.body.velocity.x); }
                if(sw.x>352){ sw.x=352; sw.body.velocity.x=-Math.abs(sw.body.velocity.x); }
                if(sw.y<8){  sw.y=8;   sw.body.velocity.y=Math.abs(sw.body.velocity.y); }
                if(sw.y>GROUND_Y){ sw.y=GROUND_Y; sw.body.velocity.y=-Math.abs(sw.body.velocity.y); }
                // Minimum hiz
                const sv=Math.sqrt(sw.body.velocity.x**2+sw.body.velocity.y**2);
                const minSpd=160+slv*35;
                if(sv<minSpd){
                    const na=Math.atan2(sw.body.velocity.y,sw.body.velocity.x);
                    sw.body.setVelocity(Math.cos(na)*minSpd,Math.sin(na)*minSpd);
                }
            } else {
                sw.setActive(false).setVisible(false);
            }
        });
    } // saw block end
    tickDrones(S); // level=0 olsa da calisir — sacrifice sonrasi drone'lari gizler
    drawPoisonAura(S);
    // ── POISON ORB — periyodik firlatma ──
    if(UPGRADES.poison.level>0){
        gs._lastPoison=(gs._lastPoison||0)+delta;
        const cooldown=Math.max(2800,4500-UPGRADES.poison.level*400);
        if(gs._lastPoison>cooldown){
            gs._lastPoison=0;
            spawnPoisonOrb(S);
            NT_SFX.play("sfx_poison");
        }
    }
}
// ── ALEV HALKASI GORSEL — her frame cizilir, tutarli takip ──
// [v9.3] drawFlameRing KALDIRILDI — flame/meteor sistemi silindi
// [v9.3] doFlameDmg KALDIRILDI — flame/meteor sistemi silindi
// [v9.3] doFlame KALDIRILDI
function doLightning(S){
    const gs=GS; if(!gs||!S) return;
    const lv=UPGRADES.lightning.level;
    const activeList=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
    const px2=S.player.x, py2=S.player.y;
    const targets=activeList
        .filter(e=>e&&e.active)
        .sort((a,b)=>{
            const da=(a.x-px2)**2+(a.y-py2)**2;
            const db=(b.x-px2)**2+(b.y-py2)**2;
            return da-db;
        }).slice(0,1+lv);
    if(!targets.length) return;

    // Her hedef bağımsız olarak YUKARIDAN çarpar — karakter değil gök!
    targets.forEach((t,idx)=>{
        S.time.delayedCall(idx*55,()=>{
            if(!t||!t.active||!S||GS.gameOver) return;

            // BUFF: biraz daha güçlü
            const _lightningDmg = Math.min(gs.damage * 0.88, BASE_DAMAGE * (1.05 + lv * 0.28));
            applyDmg(S,t,_lightningDmg,false);
            NT_SFX.play("sfx_lightning");
            if(gs._synergyChainStorm) applyChainStormToLightning(S,t);

            const ex=t.x, ey=t.y-8;
            // ORIGIN: ekranın üstü, hedefe yakın rasgele kayma
            const sx=ex + Phaser.Math.Between(-18,18), sy=-12;

            const _ltColors=[
                {glow2:0x1133cc,glow1:0x3399ff,outer:0x4488ff,mid:0xaaddff,core:0xffffff,
                 flash1:0xeef8ff,flash2:0xffee44,hit:0x88ccff,charge:0x66aaff,branch:0x88bbff,afterglow:0x2266cc},
                {glow2:0x005577,glow1:0x11ccdd,outer:0x22ccdd,mid:0x88ffff,core:0xffffff,
                 flash1:0xeeffff,flash2:0x44ffee,hit:0x44eeff,charge:0x22ddee,branch:0x66eeff,afterglow:0x009988},
                {glow2:0x664400,glow1:0xffaa22,outer:0xffcc44,mid:0xffee99,core:0xffffff,
                 flash1:0xfffff0,flash2:0xffff88,hit:0xffee88,charge:0xffcc44,branch:0xffeebb,afterglow:0xcc8811},
            ];
            const _lc=_ltColors[Math.min(lv-1,_ltColors.length-1)];

            // ── AŞAMA 1: Yükleme parıltısı (0ms) — hedefteki elektrik yığılımı
            const chargeG=S.add.graphics().setDepth(24);
            chargeG.fillStyle(_lc.charge,0.35); chargeG.fillCircle(ex,ey,28);
            chargeG.fillStyle(_lc.charge,0.6);  chargeG.fillCircle(ex,ey,14);
            // Gök çıkış noktası
            chargeG.fillStyle(_lc.charge,0.7);  chargeG.fillCircle(sx,sy+12,5);
            chargeG.lineStyle(1.5,_lc.charge,0.8);
            for(let ci=0;ci<5;ci++){
                const ca=Phaser.Math.DegToRad(ci*72+Phaser.Math.Between(-18,18));
                const cl=Phaser.Math.Between(7,18);
                chargeG.lineBetween(sx,sy+12, sx+Math.cos(ca)*cl, sy+12+Math.sin(ca)*cl);
            }
            S.tweens.add({targets:chargeG,alpha:0,duration:65,onComplete:()=>chargeG.destroy()});

            // ── AŞAMA 2: Şimşek darbesi (35ms sonra)
            S.time.delayedCall(35,()=>{
                if(!S||GS.gameOver) return;

                // Yardımcı fonksiyon: kırık çizgili şimşek segmenti
                const _drawBolt=(width,col,alpha,steps,jitter,depth)=>{
                    const bolt=S.add.graphics().setDepth(depth||22);
                    bolt.lineStyle(width,col,alpha);
                    bolt.beginPath(); bolt.moveTo(sx,sy);
                    let cx=sx, cy=sy;
                    for(let s=1;s<steps;s++){
                        const t2=s/steps;
                        cx=sx+(ex-sx)*t2 + Phaser.Math.Between(-jitter,jitter);
                        cy=sy+(ey-sy)*t2 + Phaser.Math.Between(-jitter*0.35,jitter*0.35);
                        bolt.lineTo(cx,cy);
                    }
                    bolt.lineTo(ex,ey); bolt.strokePath();
                    return bolt;
                };

                // Dal şimşek — ana gövdeden ayrılan kısa yan kol
                const _drawBranch=()=>{
                    const bg=S.add.graphics().setDepth(21);
                    bg.lineStyle(1.2,_lc.branch,0.55);
                    bg.beginPath();
                    const bt=0.25+Math.random()*0.45;
                    const bpx=sx+(ex-sx)*bt + Phaser.Math.Between(-8,8);
                    const bpy=sy+(ey-sy)*bt;
                    bg.moveTo(bpx,bpy);
                    const bDir=Math.random()<0.5?1:-1;
                    const bex=bpx+bDir*Phaser.Math.Between(12,38);
                    const bey=bpy+Phaser.Math.Between(14,36);
                    // Kırık dal
                    const bm1x=bpx+(bex-bpx)*0.5+Phaser.Math.Between(-8,8);
                    bg.lineTo(bm1x,bpy+(bey-bpy)*0.5);
                    bg.lineTo(bex,bey); bg.strokePath();
                    return bg;
                };

                // Geniş arka ışıma
                const glowWide=S.add.graphics().setDepth(19);
                glowWide.lineStyle(18,_lc.glow2,0.07); glowWide.lineBetween(sx,sy,ex,ey);
                glowWide.lineStyle(9, _lc.glow1,0.16); glowWide.lineBetween(sx,sy,ex,ey);

                // Ana şimşek katmanları
                const boltOuter=_drawBolt(4.5,_lc.outer,0.80,13,15,22);
                const boltMid  =_drawBolt(2.8,_lc.mid,  0.92,15,10,23);
                const boltCore =_drawBolt(1.4,_lc.core, 1.0, 18,5, 24);

                // Dal şimşekler
                const br1=_drawBranch(), br2=_drawBranch();

                // Gök kaynağı parlaması
                const skyFlash=S.add.graphics().setDepth(25);
                skyFlash.fillStyle(_lc.flash1,0.9); skyFlash.fillCircle(sx,sy,8);
                skyFlash.fillStyle(_lc.glow1,0.5);  skyFlash.fillCircle(sx,sy,16);
                skyFlash.lineStyle(1.5,_lc.charge,0.7); skyFlash.strokeCircle(sx,sy,12);

                // Hedef çarpma patlaması
                const flash=S.add.graphics().setDepth(26);
                flash.fillStyle(_lc.flash1,0.95); flash.fillCircle(ex,ey,10);
                flash.fillStyle(_lc.flash2,0.7);  flash.fillCircle(ex,ey,18);
                flash.fillStyle(_lc.flash1,0.25); flash.fillCircle(ex,ey,30);
                flash.lineStyle(1.5,_lc.mid,0.6); flash.strokeCircle(ex,ey,22);

                // Çarpma kıvılcımları (8 yön)
                for(let _i=0;_i<8;_i++){
                    const _pa=Phaser.Math.DegToRad(_i*45+Phaser.Math.Between(-10,10));
                    const _spd=Phaser.Math.Between(20,48);
                    const _pp=S.add.graphics().setDepth(26);
                    _pp.x=ex; _pp.y=ey;
                    _pp.fillStyle(_lc.hit,0.95); _pp.fillRect(-2,-2,4,4);
                    S.tweens.add({targets:_pp,
                        x:ex+Math.cos(_pa)*_spd, y:ey+Math.sin(_pa)*_spd,
                        alpha:0,scaleX:0,scaleY:0,
                        duration:Phaser.Math.Between(90,200),ease:"Quad.easeOut",
                        onComplete:()=>_pp.destroy()});
                }

                // Artık ışıma (daha yavaş solar)
                const afterG=S.add.graphics().setDepth(18);
                afterG.lineStyle(3,_lc.afterglow,0.18); afterG.lineBetween(sx,sy,ex,ey);

                // Hızlı söndür
                S.tweens.add({targets:[glowWide,boltOuter,boltMid,boltCore,br1,br2,skyFlash,flash],
                    alpha:0,duration:Phaser.Math.Between(100,155),ease:"Quad.easeOut",
                    onComplete:()=>{try{glowWide.destroy();boltOuter.destroy();boltMid.destroy();
                        boltCore.destroy();br1.destroy();br2.destroy();skyFlash.destroy();flash.destroy();}catch(e){}}});
                // Artık ışıma yavaş söner
                S.tweens.add({targets:afterG,alpha:0,duration:320,delay:60,ease:"Sine.easeOut",
                    onComplete:()=>{try{afterG.destroy();}catch(e){}}});
            });
        });
    });
}
function doLaser(S){
    const gs=GS, lv=UPGRADES.laser.level;
    const count=lv; // lv1:1, lv2:2, lv3:3 cizgi
    for(let idx=0;idx<count;idx++){
        S.time.delayedCall(idx*120,()=>{
            const enemies=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
            let bx, tgt=null;
            if(enemies.length>0){
                // En yakin dusmani hedefle (daha akilli)
                let minD=999999;
                enemies.forEach(e=>{if(!e||!e.active)return;const d=(e.x-S.player.x)**2+(e.y-S.player.y)**2;if(d<minD){minD=d;tgt=e;}});
                bx=tgt?tgt.x:Phaser.Math.Between(30,330);
            } else {
                bx=Phaser.Math.Between(30,330);
            }

            // ── LEVEL-BASED RENK — Laser ──
            const _laserColors = [
                {warn1:0xff0000,warn2:0xff2200,aim1:0xff0000,aim2:0xff6600,
                 core:0xffffff,kor:0xff4400,glow:0xff0000,outer:0xff2200,
                 impLine:0xff4400,impFill:0xff6600,flame1:0xff4400,flame2:0xffcc00},
                {warn1:0xff6600,warn2:0xff8800,aim1:0xff6600,aim2:0xffaa00,
                 core:0xffffff,kor:0xff8800,glow:0xff4400,outer:0xff6600,
                 impLine:0xff8800,impFill:0xffaa00,flame1:0xff8800,flame2:0xffee44},
                {warn1:0x4488ff,warn2:0x2266dd,aim1:0x4488ff,aim2:0x88ccff,
                 core:0xffffff,kor:0x88ccff,glow:0x2266dd,outer:0x4488ff,
                 impLine:0x88ccff,impFill:0xaaddff,flame1:0x4488ff,flame2:0xeeffff},
            ];
            const _lsC = _laserColors[Math.min(lv-1, _laserColors.length-1)];

            // Uyari: tarama cizgisi + nabiz
            const warn=S.add.graphics().setDepth(22);
            warn.lineStyle(2,_lsC.warn1,0.8); warn.lineBetween(bx,0,bx,640);
            warn.lineStyle(8,_lsC.warn2,0.2); warn.lineBetween(bx,0,bx,640);
            // Tarama efekti — warn yukaridan asagi tarar
            S.tweens.add({targets:warn,alpha:0,duration:200,onComplete:()=>warn.destroy()});

            // Hedef uzerinde nisan halkasi
            if(tgt&&tgt.active){
                const aim=S.add.graphics().setDepth(23);
                aim.lineStyle(2,_lsC.aim1,0.9); aim.strokeCircle(tgt.x,tgt.y,20);
                aim.lineStyle(1,_lsC.aim2,0.7); aim.strokeCircle(tgt.x,tgt.y,12);
                S.tweens.add({targets:aim,scaleX:0.3,scaleY:0.3,alpha:0,duration:200,ease:"Quad.easeIn",onComplete:()=>aim.destroy()});
            }

            // 180ms sonra asil lazer
            S.time.delayedCall(180,()=>{
                const lg=S.add.graphics().setDepth(25);
                // Katman 1: Parlak cekirdek
                lg.lineStyle(3+lv,_lsC.core,1.0); lg.lineBetween(bx,0,bx,640);
                // Katman 2: Kor
                lg.lineStyle(6+lv*2,_lsC.kor,0.85); lg.lineBetween(bx,0,bx,640);
                // Katman 3: Genis glow
                lg.lineStyle(18+lv*5,_lsC.glow,0.18); lg.lineBetween(bx,0,bx,640);
                // Katman 4: Dis isik yayilimi
                lg.lineStyle(32+lv*8,_lsC.outer,0.07); lg.lineBetween(bx,0,bx,640);

                // Hasar azaltildi: lv1:2x, lv2:2.8x, lv3:3.8x (eskiden 3x/4x/5.5x)
                const laserDmgMult=2.0+lv*0.9;
                (S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true)).forEach(e=>{
                    const laserCrit=gs._synergyLaserFocus&&Math.random()<0.6;
                    if(Math.abs(e.x-bx)<24+lv*4) applyDmg(S,e,gs.damage*laserDmgMult,laserCrit||true);
                });

                S.cameras.main.shake(30+lv*8, 0.004+lv*0.001);
                NT_SFX.play("sfx_laser");
                // Screen flash KALDIRILDI — goz yorucu

                // Lazer soner — once cekirdek, sonra glow
                S.tweens.add({targets:lg,alpha:0,duration:300,ease:"Quad.easeOut",onComplete:()=>lg.destroy()});

                // Zemin carpma — yatik ellips, dolu buyuk daire YOK
                const imp=S.add.graphics().setDepth(24);
                imp.x=bx; imp.y=GROUND_Y;
                imp.lineStyle(2,_lsC.impLine,0.8); imp.strokeEllipse(0,0,24+lv*6,6);
                imp.fillStyle(_lsC.impFill,0.5); imp.fillEllipse(0,0,16+lv*4,4);
                // Zemin alev dilleri — azaltildi
                for(let _gi=0;_gi<2+lv;_gi++){
                    const _ga=Phaser.Math.DegToRad(150+_gi*25+Phaser.Math.Between(-12,12));
                    const _gsp=S.add.graphics().setDepth(24);
                    _gsp.fillStyle(_gi%2===0?_lsC.flame1:_lsC.flame2,0.75);
                    _gsp.fillTriangle(-2,0,2,0,0,-Phaser.Math.Between(10,20+lv*4));
                    _gsp.x=bx+Math.cos(_ga)*(8+_gi*6); _gsp.y=GROUND_Y+Math.sin(_ga)*3;
                    S.tweens.add({targets:_gsp,y:_gsp.y-Phaser.Math.Between(15,30),alpha:0,scaleX:0.1,duration:220,ease:"Quad.easeOut",onComplete:()=>_gsp.destroy()});
                }
                S.tweens.add({targets:imp,scaleX:3.0,scaleY:0.2,alpha:0,duration:240,ease:"Quad.easeOut",onComplete:()=>imp.destroy()});
            });
        });
    }
}
function doThunderStrike(S){
    const gs=GS, lv=UPGRADES.thunder.level;
    const count=2+lv;
    for(let i=0;i<count;i++){
        S.time.delayedCall(i*95,()=>{
            const te=nearestE(S,S.player.x+Phaser.Math.Between(-80,80),S.player.y+Phaser.Math.Between(-50,50),999);
            if(!te||!te.active) return;
            const _thunderDmg=Math.min(gs.damage*0.65, BASE_DAMAGE*(0.70+lv*0.20));
            applyDmg(S,te,_thunderDmg,false);
            NT_SFX.play("sfx_thunder");
            const bx=te.x, by=te.y-4;

            const _thColors=[
                {warn:0xffee00,bolt1:0xffffff,bolt2:0xffee66,bolt3:0xffcc00,
                 imp1:0xffffff,imp2:0xffcc00,glow:0xffdd00,branch:0xffee88,
                 sky:0xffffaa,shockwave:0xffcc44},
                {warn:0x44aaff,bolt1:0xffffff,bolt2:0x55ccff,bolt3:0x2299ee,
                 imp1:0xffffff,imp2:0x44ccff,glow:0x2299ee,branch:0x88ddff,
                 sky:0xaaddff,shockwave:0x44aaff},
                {warn:0xcc44ff,bolt1:0xffffff,bolt2:0xcc55ff,bolt3:0x9922cc,
                 imp1:0xffffff,imp2:0xcc55ff,glow:0xaa33ee,branch:0xddaaff,
                 sky:0xeeccff,shockwave:0xcc44ff},
            ];
            const _thC=_thColors[Math.min(lv-1,_thColors.length-1)];

            // ── AŞAMA 1: Uyarı — nişan (0ms)
            const warn=S.add.graphics().setDepth(20);
            // İnce pilot ışın yukarıdan
            warn.lineStyle(1.5,_thC.warn,0.65); warn.lineBetween(bx,0,bx,by);
            // Gök şarj noktası
            warn.fillStyle(_thC.warn,0.8); warn.fillCircle(bx,4,6);
            warn.lineStyle(1.5,_thC.warn,0.5); warn.strokeCircle(bx,4,10);
            // Hedef nişan halkası — büyüyerek kapanır
            warn.lineStyle(2,_thC.warn,0.9); warn.strokeCircle(bx,by,22);
            warn.lineStyle(1,_thC.warn,0.5);  warn.strokeCircle(bx,by,36);
            // Çarpı nişan
            warn.lineStyle(1.5,_thC.warn,0.7);
            warn.lineBetween(bx-16,by,bx-6,by); warn.lineBetween(bx+6,by,bx+16,by);
            warn.lineBetween(bx,by-16,bx,by-6); warn.lineBetween(bx,by+6,bx,by+16);
            S.tweens.add({targets:warn,alpha:0,duration:95,onComplete:()=>warn.destroy()});

            // ── AŞAMA 2: Darbe (85ms sonra)
            S.time.delayedCall(85,()=>{
                if(!S||GS.gameOver) return;

                // Kırık çizgili şimşek çizer
                const _thBolt=(w,col,a,steps,jit,depth)=>{
                    const bg=S.add.graphics().setDepth(depth||23);
                    bg.lineStyle(w,col,a); bg.beginPath();
                    let cx2=bx,cy2=0; bg.moveTo(cx2,cy2);
                    for(let s=1;s<steps;s++){
                        const t2=s/steps;
                        cx2=bx+Phaser.Math.Between(-jit,jit);
                        cy2=by*t2;
                        bg.lineTo(cx2,cy2);
                    }
                    bg.lineTo(bx,by); bg.strokePath();
                    return bg;
                };

                // Dal şimşek
                const _thBranch=()=>{
                    const bg=S.add.graphics().setDepth(22);
                    bg.lineStyle(1.5,_thC.branch,0.6);
                    const bt=0.2+Math.random()*0.5;
                    const bpy2=by*bt;
                    const bDir=Math.random()<0.5?1:-1;
                    const bLen=Phaser.Math.Between(16,45);
                    bg.beginPath(); bg.moveTo(bx,bpy2);
                    // İki parçalı kırık dal
                    const mid1=bx+bDir*Phaser.Math.Between(6,22);
                    const midy=bpy2+Phaser.Math.Between(8,20);
                    bg.lineTo(mid1,midy);
                    bg.lineTo(bx+bDir*bLen, bpy2+Phaser.Math.Between(20,50));
                    bg.strokePath();
                    return bg;
                };

                // Geniş glow ışıması
                const gBeam=S.add.graphics().setDepth(19);
                gBeam.lineStyle(22,_thC.glow,0.09); gBeam.lineBetween(bx,0,bx,by);
                gBeam.lineStyle(10,_thC.glow,0.20); gBeam.lineBetween(bx,0,bx,by);

                // Şimşek katmanları
                const bolt1=_thBolt(5.5,_thC.bolt1,1.0,15,8, 25);  // parlak beyaz çekirdek
                const bolt2=_thBolt(3.5,_thC.bolt2,0.9,13,12,24);  // renkli orta
                const bolt3=_thBolt(10, _thC.bolt3,0.22,10,6,22);  // yumuşak dış
                const br1=_thBranch(), br2=_thBranch();

                // Gök kaynağı patlaması
                const skyG=S.add.graphics().setDepth(26);
                skyG.fillStyle(_thC.bolt1,0.95); skyG.fillCircle(bx,0,9);
                skyG.fillStyle(_thC.sky,0.6);    skyG.fillCircle(bx,0,18);
                skyG.lineStyle(2,_thC.glow,0.7); skyG.strokeCircle(bx,0,14);

                // Çarpma patlaması
                const imp=S.add.graphics().setDepth(26);
                imp.x=bx; imp.y=by;
                imp.fillStyle(_thC.imp1,0.95); imp.fillCircle(0,0,9);
                imp.fillStyle(_thC.imp2,0.7);  imp.fillCircle(0,0,18);
                imp.fillStyle(_thC.glow,0.3);  imp.fillCircle(0,0,30);
                imp.lineStyle(2.5,_thC.imp1,0.9); imp.strokeCircle(0,0,12);
                imp.lineStyle(1.5,_thC.imp2,0.6); imp.strokeCircle(0,0,22);

                // Şok dalgası halkası
                const shock=S.add.graphics().setDepth(25);
                shock.lineStyle(3,_thC.shockwave,0.8); shock.strokeCircle(bx,by,5);
                S.tweens.add({targets:shock,
                    scaleX:{from:1,to:4},scaleY:{from:1,to:4},alpha:{from:0.8,to:0},
                    duration:260,ease:"Quad.easeOut",onComplete:()=>shock.destroy()});

                // Kıvılcımlar (6 yön)
                for(let _i=0;_i<6;_i++){
                    const _pa=Phaser.Math.DegToRad(_i*60+Phaser.Math.Between(-15,15));
                    const _spd=Phaser.Math.Between(22,52);
                    const _sp=S.add.graphics().setDepth(26);
                    _sp.x=bx; _sp.y=by;
                    _sp.fillStyle(_thC.bolt2,0.95); _sp.fillRect(-2,-2,4,4);
                    S.tweens.add({targets:_sp,
                        x:bx+Math.cos(_pa)*_spd, y:by+Math.sin(_pa)*_spd,
                        alpha:0,scaleX:0,scaleY:0,
                        duration:Phaser.Math.Between(130,250),ease:"Quad.easeOut",
                        onComplete:()=>_sp.destroy()});
                }

                S.cameras.main.shake(28,0.005);

                // Söndür
                S.tweens.add({targets:[gBeam,bolt1,bolt2,bolt3,br1,br2,skyG],
                    alpha:0,duration:135,ease:"Quad.easeOut",
                    onComplete:()=>{try{gBeam.destroy();bolt1.destroy();bolt2.destroy();bolt3.destroy();br1.destroy();br2.destroy();skyG.destroy();}catch(e){}}});
                S.tweens.add({targets:imp,scaleX:2.5,scaleY:2.5,alpha:0,
                    duration:280,ease:"Quad.easeOut",onComplete:()=>{try{imp.destroy();}catch(e){}}});
            });
        });
    }
}function tickDrones(S){const gs=GS,lv=UPGRADES.drone.level;while(S.droneGroup.getLength()<lv){const d=S.physics.add.image(0,0,"tex_drone");d.body.setAllowGravity(false).setImmovable(true);d.setActive(true).setVisible(true).setDepth(12);d.lastShoot=0;d._spinAngle=0;S.droneGroup.add(d);}
// [OPT] cache kullan — her frame getMatching yerine _activeEnemies
const ae=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
S.droneGroup.getChildren().forEach((d,i)=>{if(i>=lv){d.setActive(false).setVisible(false);return;}d.setActive(true).setVisible(true);
    // ── LEVEL-BASED RENK — Drone ──
    const _droneTints = [0x66bbff, 0x44ff88, 0xff66aa];
    d.setTint(_droneTints[Math.min(lv-1, _droneTints.length-1)]);
    const angle=gs.orbitAngle*0.55+i*(Math.PI*2/lv);
    d.setPosition(S.player.x+Math.cos(angle)*90,S.player.y-22+Math.sin(angle)*45);
    d._spinAngle=(d._spinAngle||0)+1.8;
    if(ae.length>0){
        const t=ae[0];
        const targetDeg=Phaser.Math.RadToDeg(Math.atan2(t.y-d.y,t.x-d.x))+90;
        const diff=Phaser.Math.Angle.ShortestBetween(d.angle,targetDeg);
        // NERF: reduced tracking speed 0.07→0.04 — drone takes longer to aim
        d.angle+=diff*0.04;
    } else { d.angle=d._spinAngle; }
    // NERF: fire rate 680ms→1100ms — drone fires ~55% less often
    d.lastShoot=(d.lastShoot||0)+S.game.loop.delta;if(d.lastShoot>1100){d.lastShoot=0;if(ae.length>0){
        const t=ae[Math.floor(Math.random()*ae.length)];const dspd=(GS.bulletSpeed||380)/200;
        // NERF: drone uses fixed BASE_DAMAGE fraction, NOT gs.damage
        // This prevents drone from inheriting the full player damage ceiling
        // Drone Lv1: 0.55x base, Lv2: 0.65x base — useful supplement, not a second main weapon
        const _droneDmgMult = lv >= 2 ? 0.65 : 0.55;
        const _droneDmg = _droneDmgMult; // passed as dmgM to fireBulletRaw which multiplies gs.damage
        // Override: pass the ratio to make effective dmg = BASE_DAMAGE * _droneDmgMult regardless of upgrades
        // We store it as a fixed value on the bullet so applyDmg uses it directly
        const _db = fireBulletRaw(S,d.x,d.y,(t.x-d.x)*dspd,(t.y-d.y)*dspd,_droneDmgMult);
        if(_db) _db._droneShot = true; // flag — applyDmg will use BASE_DAMAGE not gs.damage
        NT_SFX.play("sfx_drone");
    // ★ Drone Shield synergy — heal trigger (raised threshold: 10 hits instead of 8)
    if(gs._synergyDroneShield){gs._droneHitCount=(gs._droneHitCount||0)+1;if(gs._droneHitCount>=10){gs._droneHitCount=0;gs.health=Math.min(gs.maxHealth,gs.health+1);}}
}}});}
// ── XP ────────────────────────────────────────────────────────
function spawnXpOrb(S,x,y,tex,val){
    if(S.xpOrbs.length>=45) return; // hard cap — no screen flooding
    const tk=tex||"xp_blue";
    const sc=0.75+Math.random()*0.15; // 1.10→0.75 kucultuldu
    const obj=S.add.image(x,y,tk).setDepth(17).setScale(sc);
    S.xpOrbs.push({
        obj, val,
        vx:Phaser.Math.FloatBetween(-45,45),
        vy:Phaser.Math.FloatBetween(-110,-60),
        life:8000, dead:false, // shorter life — less ground clutter
        baseScale:sc, bounceCount:0, floatT:0,
        floatPhase:Math.random()*Math.PI*2
    });
}
function tickXP(S){
    const gs=GS; if(!gs||gs.gameOver) return;
    const _magnetFromUpgrade = 0; // [v9.4] magnet upgrade removed — fixed auto-collect radius only
    const _totalMagnetR = gs.magnetRadius; // fixed 40px base from GS init
    const M=_totalMagnetR>0;
    const magR=Math.max(gs.magnetRadius, _totalMagnetR);
    const magR2=magR*magR;
    const px=S.player.x, py=S.player.y-15;
    const dt=Math.min(S.game.loop.delta,50)/1000;
    let hasDead=false;

    for(let i=0;i<S.xpOrbs.length;i++){
        const o=S.xpOrbs[i];
        if(o.dead) continue;
        if(!o.obj||!o.obj.scene){
            o.dead=true;hasDead=true;continue;
        }
        o.life-=S.game.loop.delta;

        const dx=px-o.obj.x, dy=py-o.obj.y;
        const dist2=dx*dx+dy*dy;

        // [PERF] sqrt sadece gerektiginde hesapla
        let dist=null;
        const getDist=()=>{ if(dist===null) dist=Math.sqrt(dist2); return dist; };

        // [XP] Global hafif cekim
        const d=getDist();
        if(d>0.1){
            const globalForce = 45;
            o.vx += dx/d * globalForce * dt;
            o.vy += dy/d * globalForce * dt;

            // [XP] Yakin mesafe snap zone
            if(d < 80){
                const snapForce = 900 * (1 - d/80);
                o.vx += dx/d * snapForce * dt;
                o.vy += dy/d * snapForce * dt;
            }

            // [XP] Miknatis
            if(M && dist2<magR2){
                const ratio=d/magR;
                const force=800+(1-ratio)*(1-ratio)*1800;
                o.vx+=dx/d*force*dt;
                o.vy+=dy/d*force*dt;
                if(o.obj.y>=XP_GROUND_Y-2) o.vy=-120;
            }
        }

        // [XP] Yercekimi — gercekci hizlanma
        if(o.obj.y < XP_GROUND_Y) o.vy += 320 * dt;

        // [XP] Yerle temas — sekme animasyonu
        if(o.obj.y >= XP_GROUND_Y){
            o.obj.y = XP_GROUND_Y;
            if(Math.abs(o.vy) > 18){
                // Sekme: hiz azalarak geri firla
                o.vy *= -0.42;
                o.vx *= 0.72;
                o.bounceCount=(o.bounceCount||0)+1;
                // Sekme sirasinda hafif ufak scale squeeze
                if(o.bounceCount<=3){
                    S.tweens.add({targets:o.obj,
                        scaleX:o.baseScale*1.3,scaleY:o.baseScale*0.7,
                        duration:55,ease:"Quad.easeOut",yoyo:true,
                        onComplete:()=>{ if(o.obj&&o.obj.scene) o.obj.setScale(o.baseScale); }
                    });
                }
            } else {
                o.vy=0;
                o.vx*=0.85;
            }
        }

        // Hiz siniri — yaklastikca artar
        const maxSpd = dist < 80 ? 520 : dist < 160 ? 380 : 220;
        const sp=Math.sqrt(o.vx*o.vx+o.vy*o.vy);
        if(sp>maxSpd){o.vx=o.vx/sp*maxSpd;o.vy=o.vy/sp*maxSpd;}

        // Kenar siniri
        if(o.obj.x<5) o.vx=Math.abs(o.vx);
        if(o.obj.x>355) o.vx=-Math.abs(o.vx);

        // Miknatis trail — sadece miknatis aktifken
        if(M && dist2<magR2){
            const d2=getDist();
            const tk=o.obj.texture?.key||"";
            const tc=tk.includes("gold")?0xffdd44:tk.includes("red")?0xff4422:tk.includes("purple")?0xcc44ff:tk.includes("green")?0x44ff88:0x88aaff;
            const trailChance=d2<magR*0.3?0.45:d2<magR*0.6?0.2:0.07;
            if(Math.random()<trailChance){
                const mt=S.add.graphics().setDepth(16);
                mt.x=o.obj.x; mt.y=o.obj.y;
                const tsz=d2<magR*0.3?3:2;
                mt.fillStyle(tc,0.5); mt.fillRect(-tsz/2,-tsz/2,tsz,tsz);
                S.tweens.add({targets:mt,alpha:0,scaleX:2,scaleY:2,
                    duration:80, ease:"Quad.easeOut",onComplete:()=>mt.destroy()});
            }
        }

        o.obj.x+=o.vx*S.game.loop.delta/1000;
        o.obj.y+=o.vy*S.game.loop.delta/1000;
        // Floating animasyon — yerde beklerken hafif yukari-asagi sallanma
        if(o.obj.y>=XP_GROUND_Y-1&&Math.abs(o.vx)<8&&Math.abs(o.vy)<5){
            o.floatT=(o.floatT||0)+S.game.loop.delta*0.0025;
            o.obj.y=XP_GROUND_Y+Math.sin(o.floatT+(o.floatPhase||0))*1.5;
            o.obj.angle=(o.obj.angle||0)+0.3;
        }

        // ── XP PARLAMA VFX — her orbda periyodik beyaz minik patlama ──
        o._sparkT=(o._sparkT||0)+S.game.loop.delta;
        // Her 500-800ms arasinda rastgele parlama
        const _sparkInterval = 500 + ((o.floatPhase||0)*300)%300;
        if(o._sparkT > _sparkInterval){
            o._sparkT=0;
            const _ox=o.obj.x, _oy=o.obj.y;
            // Merkez flash
            const _fc=S.add.graphics().setDepth(19);
            _fc.x=_ox; _fc.y=_oy;
            _fc.fillStyle(0xffffff,0.95); _fc.fillCircle(0,0,2);
            S.tweens.add({targets:_fc,scaleX:3.5,scaleY:3.5,alpha:0,duration:200,
                ease:"Quad.easeOut",onComplete:()=>_fc.destroy()});
            // 4 yon minik parcacik
            for(let _pi=0;_pi<4;_pi++){
                const _pa=Phaser.Math.DegToRad(_pi*90+(Math.random()*40-20));
                const _ps=Phaser.Math.Between(6,16);
                const _pp=S.add.graphics().setDepth(18);
                _pp.x=_ox; _pp.y=_oy;
                _pp.fillStyle(0xffffff,0.9); _pp.fillRect(-1,-1,2,2);
                S.tweens.add({targets:_pp,
                    x:_ox+Math.cos(_pa)*_ps, y:_oy+Math.sin(_pa)*_ps,
                    alpha:0,scaleX:0,scaleY:0,
                    duration:Phaser.Math.Between(100,200),ease:"Quad.easeOut",
                    onComplete:()=>_pp.destroy()});
            }
        }

        // [XP] Absorb — dist2 < 60*60 = 3600
        if(dist2<3600){
        // [v10.1] Orb degeri kirpma — daha dengeli per-zone limitleri
        // Erken oyun: 7 (daha hizli ilerleme), gec oyun: 2 (yavaslama korunuyor)
        // [v10.1] Per-orb XP cap — erken oyun biraz comert, gec oyun siki
        // Lv1-5: max 8xp/orb, Lv6-12: max 5, Lv13-20: max 3, Lv21+: max 2
        const xpCap = gs.level <= 5 ? 8 : gs.level <= 12 ? 5 : gs.level <= 20 ? 3 : 2;
        const cappedVal = Math.min(o.val, xpCap);

        // [v10.1] XP/saniye rate limiter — flat zone-based
        // Zone  Lv1-5: 18/s (erken oyun hizlanma), Lv6-12: 12/s, Lv13-20: 8/s, Lv21+: 5/s
        let xpCapMult = 1.0;
        if(gs._blitzXpPenalty) xpCapMult *= 0.70;
        // [v10.x] xpFrenzy event: +40% XP rate BUT total XP mult still capped at ×1.30
        // xpFrenzy artik spawn arttirarak tehlike yaratir; XP kazanci sinirsiz degil
        if(gs._xpFrenzyMode)   xpCapMult = Math.min(xpCapMult * 1.40, 1.30 / Math.max(0.01, gs.xpMult));
        const xpZone = gs.level <= 5 ? 18 : gs.level <= 12 ? 12 : gs.level <= 20 ? 8 : 5;
        const XPS_CAP = xpZone * xpCapMult;
        const now_ms  = Date.now();
        if(!gs._xpRateWindow) gs._xpRateWindow = now_ms;
        if(now_ms - gs._xpRateWindow > 1000){
            gs._xpRateWindow   = now_ms;
            gs._xpPerSecAccum  = 0;
        }
        if(gs._xpPerSecAccum >= XPS_CAP){
            try{o.obj.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
            o.dead=true; hasDead=true;
            continue;
        }
        gs._xpPerSecAccum = (gs._xpPerSecAccum||0) + cappedVal;
        gs.xp += cappedVal;
            // ── XP PICKUP SOUND ─────────────────────────────────────
            // Triggered exactly once per orb collected. xp_pickup() is
            // safe for rapid calls — low volume, micro pitch variation,
            // no voice stealing. Uses sfxBus so it respects SFX volume.
            NT_SFX.play("xp_pickup");
            // Collect burst — beyaz parilti partikuller
            const bx=o.obj.x, by=o.obj.y;
            const tk=o.obj.texture?.key||"";
            const bc=tk.includes("gold")?0xffdd44:tk.includes("red")?0xff5533:tk.includes("purple")?0xcc44ff:tk.includes("green")?0x44ff88:0x88aaff;
            for(let _bi=0;_bi<3;_bi++){
                const _ang=Phaser.Math.DegToRad(_bi*120+Phaser.Math.Between(-20,20));
                const _spd=Phaser.Math.Between(20,45);
                const _bp=S.add.graphics().setDepth(18);
                _bp.x=bx; _bp.y=by;
                // Beyaz parilti nokta
                _bp.fillStyle(0xffffff,0.9); _bp.fillRect(-1,-1,2,2);
                S.tweens.add({targets:_bp,
                    x:bx+Math.cos(_ang)*_spd, y:by+Math.sin(_ang)*_spd*0.6,
                    alpha:0,scaleX:0,scaleY:0,duration:Phaser.Math.Between(140,260),
                    ease:"Quad.easeOut",onComplete:()=>_bp.destroy()});
            }
            // Kucuk beyaz flash halkasi
            const _fl=S.add.graphics().setDepth(18);
            _fl.x=bx; _fl.y=by;
            _fl.lineStyle(1,0xffffff,0.9); _fl.strokeCircle(0,0,3);
            S.tweens.add({targets:_fl,alpha:0,scaleX:2.5,scaleY:2.5,duration:100,onComplete:()=>_fl.destroy()});
            try{o.obj.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
            o.dead=true; hasDead=true;
            // [BALANCE] Only ONE level-up per orb collect — no chain leveling
            if(gs.xp>=gs.xpToNext&&!gs.pickingUpgrade&&_upgradeLock===0){
                gs.xp-=gs.xpToNext; levelUp(S);
            }
            continue;
        }

        if(o.life<1200){o.obj.setAlpha(o.life/1200);}
        if(o.life<=0){try{o.obj.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}o.dead=true;hasDead=true;}
    }
    // [PERF] Tek seferde temizle — per-iter splice yerine
    if(hasDead) S.xpOrbs=S.xpOrbs.filter(o=>!o.dead);}

// ── LEVEL UP ─────────────────────────────────────────────────
function levelUp(S){
    const gs=GS;
    if(!gs||!S||!S.player) return;
    if(gs.pickingUpgrade || _upgradeLock > 0) return;
    if(gs.level>=999) return;

    // Cooldown kontrolu — lockUpgrade'den ONCE (donma onlenir)
    // [v10.1] Level-up cooldown: erken oyun daha hizli feedback, gec oyun daha seyrek
    // Lv1-5:  0ms     → anlik feedback, oyuncu sistemi hissediyor
    // Lv6-10: 2800ms  → orta hiz (was 3500ms — biraz hizlandirildi)
    // Lv11-17:5000ms  → belirgin yavaslama (was 5500ms)
    // Lv18+:  7500ms  → prestige zone (was 8000ms)
    const now = gs.t || 0;
    const last = gs._lastLevelUpTime || -9999;
    const cooldown = gs.level <= 5  ? 0
                   : gs.level <= 10 ? 2800
                   : gs.level <= 17 ? 5000
                   : 7500;
    if(cooldown > 0 && (now - last) < cooldown){
        gs.xp = Math.min(gs.xp, gs.xpToNext - 1);
        return;
    }

    // Simdi kilitle ve level atla
    lockUpgrade(gs, S);
    gs._lastLevelUpTime = now;

    // XP EGRISI — v10.1: erken oyun daha hizli ilerleme (oyuncu guclenmeli), gec oyun yavasliyor
    // xpToNext baslangic: 28 (GS init'te ayarlanacak)
    // Lv1-3:  ×1.20  → hizli ilk secimler, oyuncu sistemi ogrenir
    // Lv4-8:  ×1.28  → orta hiz, build sekillenmeye baslar
    // Lv9-16: ×1.36  → belirgin yavaslama, her level degerli
    // Lv17+:  ×1.45  → prestige zone — cok nadir
    const xpGrowth = gs.level <= 3  ? 1.20
                   : gs.level <= 8  ? 1.28
                   : gs.level <= 16 ? 1.36
                   : 1.45;
    gs.level++;
    gs.xpToNext = Math.round(gs.xpToNext * xpGrowth);
    gs.pyramidSpeed = Math.min(240, gs.pyramidSpeed);
    S.time.timeScale = 1.0;
    // [v9.2] Pipeline sync — seviye atlayinca stat'lar yeniden hesaplanir
    if(gs) gs._statsDirty=true;
    // ── AAA LEVEL UP VFX ──
    vfxLevelUp(S,gs.level);
    // Ekrandaki tum aktif mermileri durdur
    if(S.bullets) S.bullets.children.each(b=>{if(b.active&&b.body)b.body.setVelocity(0,0);});
    // Dusmanlari da dondur
    if(S.pyramids) S.pyramids.children.each(e=>{if(e.active&&e.body)e.body.setVelocity(0,0);});

    showLevelUpUI(S);
    gs.score+=500*gs.level;
    onLevelUpPowerSpike(S);
    // Artifact: no xp_surge equivalent — artifact effects are apply-once

    // ── Level up gorsel efektleri ──────────────────────────────
    const plx=S.player.x, ply=S.player.y-14;

    // Hafif shake — flash ve wave YOK (vfxLevelUp zaten halkalari cizer)
    S.cameras.main.shake(30,0.003);

    // ── Parlak ic aura — kucuk, hizli
    const aura=S.add.graphics().setDepth(597);
    aura.x=plx; aura.y=ply;
    aura.fillStyle(0x88aaff,0.18); aura.fillCircle(0,0,12);
    S.tweens.add({targets:aura,scaleX:1.8,scaleY:1.8,alpha:0,duration:220,ease:"Quad.easeOut",onComplete:()=>aura.destroy()});

    // ── Parcaciklar — 8 adet, kucuk
    const colors=[0xffdd44,0x88aaff,0x44ff88,0xffffff];
    for(let i=0;i<8;i++){
        const ang=Phaser.Math.DegToRad(i*(360/8)+Phaser.Math.Between(-12,12));
        const spd=Phaser.Math.Between(28,55);
        const col=colors[i%4];
        const sp2=S.add.graphics().setDepth(599);
        sp2.fillStyle(col,0.8);
        sp2.fillRect(-1,-1,i%3===0?3:2,i%3===0?3:2);
        sp2.x=plx; sp2.y=ply;
        S.tweens.add({targets:sp2,
            x:plx+Math.cos(ang)*spd, y:ply+Math.sin(ang)*spd*0.8,
            alpha:0, scaleX:0.08, scaleY:0.08,
            duration:Phaser.Math.Between(220,380), ease:"Quad.easeOut",
            onComplete:()=>sp2.destroy()});
    }
    // [OPT] localStorage yazimini async ertele — senkron I/O level-up aninda frame drop yaratabilir
    const _saveStats=()=>{
        const hs=parseInt(localStorage.getItem("nt_highscore")||"0");
        if(gs.score>hs) localStorage.setItem("nt_highscore",""+gs.score);
        localStorage.setItem("nt_bestkills",""+Math.max(gs.kills,parseInt(localStorage.getItem("nt_bestkills")||"0")));
        localStorage.setItem("nt_bestlv",""+Math.max(gs.level,parseInt(localStorage.getItem("nt_bestlv")||"0")));
    };
    if(typeof requestIdleCallback==="function"){
        requestIdleCallback(_saveStats,{timeout:2000});
    } else {
        setTimeout(_saveStats,0);
    }
}
function closeLevelUpPanel(scene, ui){
    console.log("[LevelUp] Closing panel — destroying all UI objects");
    _levelUpChoosing = false;

    // [FIX] Kill all tweens on tracked objects BEFORE destroyAll.
    // This stops any in-flight tweens that might set alpha/scale on objects
    // after they are destroyed, which in Phaser 3 can cause them to reappear.
    try{
        if(scene && scene.tweens){
            ui.items.forEach(o=>{ try{ scene.tweens.killTweensOf(o); }catch(e){console.warn("[NT] Hata yutuldu:",e)} });
        }
    }catch(e){console.warn("[NT] Hata yutuldu:",e)}

    // Destroy all tracked UI objects (including the icon, which IS registered via ui.add)
    // and cancel all registered delayedCall tokens (entryEvent etc.)
    try{ ui.destroyAll(); }catch(e){ console.warn("[LevelUp] ui.destroyAll error:", e); }

    // Safety cleanup — upicon_ nesnelerini slice ile guvenli tara ve yok et
    // [FIX] Slot ikonlarini atla — bunlar kalici UI objeleri
    const _slotIconSet = new Set([
        ...(scene.weaponSlotIcons||[]),
        ...(scene.passiveSlotIcons||[])
    ]);
    try{
        scene.children.list.slice().forEach(obj=>{
            if(_slotIconSet.has(obj)) return; // slot ikonu — dokunma
            if(obj && obj.texture && obj.texture.key && obj.texture.key.startsWith("upicon_")){
                try{ scene.tweens.killTweensOf(obj); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
                try{ obj.setVisible(false); obj.setAlpha(0); obj.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            }
        });
    }catch(e){console.warn("[NT] Hata yutuldu:",e)}

    // Clear _openPanel so the setter fires _showMobileBtns
    try{ scene._openPanel = null; }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    try{ _showMobileBtns(scene); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    console.log("[LevelUp] Panel closed — resuming game");
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NOT FAIR  ·  AAA LEVEL-UP CARD SYSTEM  ·  LoL Inspired  ·  v10.3
//  ─────────────────────────────────────────────────────────────────────────────
//  CHANGES vs v10.2:
//    ✦ Layout:     ALL positions calculated from canvas center (CX=180, CY=320)
//                  Cards sit 28px BELOW center for modern UI balance
//                  Header sits above with dynamic gap — never hardcoded
//    ✦ Header:     Full redesign — animated outer glow (3-layer), glass highlight,
//                  radial light rays, glow ellipse behind text, animated scan
//                  shimmer, corner accents, side decorative lines, level strip
//    ✦ Title:      28px LilitaOne + canvas text shadow (blue glow), scale-bounce entry
//    ✦ VFX:        Pulse rings + radial glow NOW centered on card group (not H*0.38)
//    ✦ Cards:      CARD_H 200→210 for better proportions; GAP 8→9
//                  Deeper icon zone gradient (3 alpha layers)
//                  Per-icon WebGL mipmap patch applied on creation
//    ✦ Icons:      Secondary GL filter patch at card creation time (belt + suspenders)
//    ✦ Particles:  Spawn area matches actual UI region (not full screen)
// ═══════════════════════════════════════════════════════════════════════════════
function showLevelUpUI(S) {

    // ── Guard ────────────────────────────────────────────────────────────────
    if (_levelUpChoosing) {
        console.warn("[LevelUp] showLevelUpUI called while already open — ignored");
        return;
    }
    _levelUpChoosing = true;
    console.log("[LevelUp] Opening panel (v10.3 centered layout)");

    const gs = GS, W = 360, H = 640;
    const CX = W / 2;   // 180 — horizontal center
    const CY = H / 2;   // 320 — vertical center

    // ── Build upgrade pool (identical logic to original) ─────────────────────
    const evo      = checkEvolution();
    const rawPool  = evo ? [...evo] : [...getUpgradePool()];
    const validPool = rawPool.filter(k => {
        if (k.startsWith("evo_") || k.startsWith("_reward_")) return true;
        const u = UPGRADES[k];
        if (!u) return false;
        return (u.level || 0) < (u.max ?? u.maxLevel ?? 999);
    });
    const useRewards = gs.level < 10;
    const pool = validPool.length > 0 ? validPool
        : useRewards ? ["_reward_heal", "_reward_gold", "_reward_dmgburst"] : ["_reward_heal"];
    const shuffled   = Phaser.Utils.Array.Shuffle([...new Set(pool)]);
    const offerCount = GS?._relicLuckyCharm ? 4 : 3;
    const picks = [];
    for (const key of shuffled) {
        if (picks.length >= offerCount) break;
        if (picks.includes(key)) continue;
        if (!key.startsWith("evo_") && !key.startsWith("_reward_")) {
            const _u = UPGRADES[key];
            if (!_u || (_u.level || 0) >= (_u.max ?? _u.maxLevel ?? 999)) continue;
        }
        picks.push(key);
    }
    while (picks.length < 1) picks.push("_reward_heal");
    if (!GS._recentOffers) GS._recentOffers = [];
    const freshPicks = picks.filter(k => !GS._recentOffers.includes(k));
    const finalPicksUsed = (freshPicks.length >= offerCount - 1
        ? [...freshPicks, ...picks.filter(k => !freshPicks.includes(k))]
        : picks).slice(0, offerCount);
    GS._recentOffers = [...finalPicksUsed].slice(0, 4);

    // ── UIGroup + shared refs ─────────────────────────────────────────────────
    const ui           = new UIGroup(S);
    const _allIcos     = [];
    const _allIcoTOs   = [];
    const _allCardObjs = [];
    const _allHitAreas = [];
    let   _selectionMade = false;
    let   _partsOn       = true;

    try { _hideMobileBtns(S); } catch (e) { console.warn("[NT] Hata yutuldu:", e); }
    try { if (S._applyIconLinear) S._applyIconLinear(); } catch (e) { console.warn("[NT] Hata yutuldu:", e); }
    S.time.delayedCall(20, () => { try { if (S._applyIconLinear) S._applyIconLinear(); } catch (e) {} });

    // ════════════════════════════════════════════════════════════════════════════
    //  DYNAMIC LAYOUT  — every position is derived from CX / CY
    // ════════════════════════════════════════════════════════════════════════════

    const cardCount    = finalPicksUsed.length;
    const CARD_W       = cardCount >= 4 ? 79  : 107;
    const CARD_H       = 210;
    const CARD_GAP     = cardCount >= 4 ? 6   : 9;
    const TOTAL_CARD_W = cardCount * CARD_W + (cardCount - 1) * CARD_GAP;

    // Card group: slightly below canvas center (modern UI feel)
    const CARDS_CY     = Math.round(CY + 28);                   // card-group center Y
    const CARDS_TOP    = CARDS_CY - Math.round(CARD_H / 2);     // top edge of cards
    const CARDS_LEFT   = Math.round(CX - TOTAL_CARD_W / 2);     // left edge of first card

    // Header: above cards with a fixed gap
    const HDR_H        = 68;
    const HDR_W        = W - 18;   // 342px wide
    const HDR_X        = Math.round((W - HDR_W) / 2);           // = 9
    const PANEL_GAP    = 13;
    const HDR_TOP      = CARDS_TOP - PANEL_GAP - HDR_H;
    const HDR_CX       = CX;                                     // 180
    const HDR_CY_mid   = HDR_TOP + HDR_H / 2;

    // Bottom caption
    const CAP_Y        = CARDS_TOP + CARD_H + 14;

    // Card-internal geometry
    const ICO_H        = 91;
    const EVO_BAN_H    = 14;
    const DIVIDER_Y_ABS = CARDS_TOP + ICO_H;
    const TZ_Y_BASE    = DIVIDER_Y_ABS + 6;
    const fSzN         = CARD_W >= 100 ? 10 : 8;
    const fSzS         = CARD_W >= 100 ? 8  : 7;

    // VFX center — aligned with card group
    const VFX_CX       = CX;
    const VFX_CY       = CARDS_CY;

    // ════════════════════════════════════════════════════════════════════════════
    //  LAYER 1 — OVERLAY
    // ════════════════════════════════════════════════════════════════════════════
    const ov = ui.add(S.add.rectangle(CX, CY, W, H, 0x000000, 0).setDepth(300));
    S.tweens.add({ targets: ov, fillAlpha: 0.88, duration: 280, ease: "Quad.easeOut" });

    // ════════════════════════════════════════════════════════════════════════════
    //  LAYER 2 — RADIAL GLOW  (centered on card group)
    // ════════════════════════════════════════════════════════════════════════════
    const radGlow = ui.add(S.add.graphics().setDepth(301).setAlpha(0));
    radGlow.fillStyle(0xdd8800, 0.16); radGlow.fillEllipse(VFX_CX, VFX_CY, 330, 295);
    radGlow.fillStyle(0xdd8800, 0.06); radGlow.fillEllipse(VFX_CX, VFX_CY, 360, 360);
    S.tweens.add({ targets: radGlow, alpha: 1, duration: 420, delay: 70 });

    // ════════════════════════════════════════════════════════════════════════════
    //  LAYER 3 — ANIMATED PULSE RINGS  (centered on card group)
    // ════════════════════════════════════════════════════════════════════════════
    const bgFx = ui.add(S.add.graphics().setDepth(301));
    let _bgT = 0;
    const bgTick = S.time.addEvent({
        delay: 16, loop: true, callback: () => {
            _bgT += 0.016;
            bgFx.clear();
            for (let r = 0; r < 3; r++) {
                const rad   = 82 + r * 92 + Math.sin(_bgT * 0.52 + r * 1.3) * 22;
                const alpha = 0.030 + 0.016 * Math.sin(_bgT * 0.78 + r * 0.9);
                bgFx.lineStyle(1.5, 0xffaa22, alpha);
                bgFx.strokeCircle(VFX_CX, VFX_CY, rad);
            }
        }
    });
    ui.add({ destroy: () => bgTick.remove() });

    // ════════════════════════════════════════════════════════════════════════════
    //  LAYER 4 — INTRO FLASH + CAMERA SHAKE
    // ════════════════════════════════════════════════════════════════════════════
    try { S.cameras.main.shake(220, 0.006); } catch (e) { console.warn("[NT] Hata yutuldu:", e); }
    const flashRect = ui.add(S.add.rectangle(CX, CY, W, H, 0xffaa00, 0).setDepth(302));
    S.tweens.add({ targets: flashRect, fillAlpha: 0.22, duration: 75, yoyo: true });

    // ════════════════════════════════════════════════════════════════════════════
    //  LAYER 5 — HEADER  (FULL REDESIGN)
    // ════════════════════════════════════════════════════════════════════════════

    // 5-A  Animated outer glow border (3 rings, pulsing alpha)
    const hdrGlowGfx = ui.add(S.add.graphics().setDepth(303).setAlpha(0));
    let _hdrT = 0;
    const hdrGlowTick = S.time.addEvent({
        delay: 16, loop: true, callback: () => {
            _hdrT += 0.016;
            hdrGlowGfx.clear();
            const gA = 0.09 + 0.055 * Math.sin(_hdrT * 1.55);
            hdrGlowGfx.lineStyle(10, 0xffaa22, gA * 0.38);
            hdrGlowGfx.strokeRoundedRect(HDR_X - 5, HDR_TOP - 5, HDR_W + 10, HDR_H + 10, 16);
            hdrGlowGfx.lineStyle(5,  0xffcc44, gA * 0.65);
            hdrGlowGfx.strokeRoundedRect(HDR_X - 2, HDR_TOP - 2, HDR_W + 4,  HDR_H + 4,  14);
            hdrGlowGfx.lineStyle(2,  0xffdd88, gA);
            hdrGlowGfx.strokeRoundedRect(HDR_X - 1, HDR_TOP - 1, HDR_W + 2,  HDR_H + 2,  13);
        }
    });
    ui.add({ destroy: () => hdrGlowTick.remove() });
    S.tweens.add({ targets: hdrGlowGfx, alpha: 1, duration: 320, delay: 90 });

    // 5-B  Main header body  (static, drawn once)
    const headerBg = ui.add(S.add.graphics().setDepth(304).setAlpha(0));

    // Drop shadow
    headerBg.fillStyle(0x000000, 0.50);
    headerBg.fillRoundedRect(HDR_X + 4, HDR_TOP + 5, HDR_W, HDR_H, 12);

    // Dark glass body
    headerBg.fillStyle(0x0c0501, 0.98);
    headerBg.fillRoundedRect(HDR_X, HDR_TOP, HDR_W, HDR_H, 12);

    // Frosted-glass top highlight (simulates glass material)
    headerBg.fillStyle(0xffffff, 0.032);
    headerBg.fillRoundedRect(HDR_X, HDR_TOP, HDR_W, HDR_H * 0.42, { tl: 12, tr: 12, bl: 0, br: 0 });

    // Glow halo behind title text (elliptical light source)
    headerBg.fillStyle(0xdd8800, 0.13);
    headerBg.fillEllipse(HDR_CX, HDR_CY_mid - 5, 230, 38);
    headerBg.fillStyle(0xffaa00, 0.07);
    headerBg.fillEllipse(HDR_CX, HDR_CY_mid - 5, 300, 55);

    // Radial light rays from title center (subtle, 6 rays)
    const RX = HDR_CX, RY = HDR_CY_mid - 4;
    for (let r = 0; r < 6; r++) {
        const ang = r * (Math.PI / 3);
        const len = 52 + (r % 2) * 28;
        headerBg.fillStyle(0xffaa00, 0.020);
        headerBg.fillTriangle(
            RX, RY,
            RX + Math.cos(ang - 0.13) * len, RY + Math.sin(ang - 0.13) * len * 0.55,
            RX + Math.cos(ang + 0.13) * len, RY + Math.sin(ang + 0.13) * len * 0.55
        );
    }

    // Side decorative lines + endpoint dots
    headerBg.lineStyle(1, 0xffaa00, 0.24);
    headerBg.lineBetween(HDR_X + 12,       HDR_CY_mid, HDR_X + 44,       HDR_CY_mid);
    headerBg.lineBetween(HDR_X + HDR_W - 44, HDR_CY_mid, HDR_X + HDR_W - 12, HDR_CY_mid);
    [[HDR_X + 12, HDR_CY_mid], [HDR_X + HDR_W - 12, HDR_CY_mid]].forEach(([dx, dy]) => {
        headerBg.fillStyle(0xffaa00, 0.60); headerBg.fillCircle(dx, dy, 1.5);
    });

    // Bottom level-indicator strip
    headerBg.fillStyle(0x1a0800, 0.90);
    headerBg.fillRoundedRect(HDR_X, HDR_TOP + HDR_H - 22, HDR_W, 22, { tl: 0, tr: 0, bl: 12, br: 12 });
    headerBg.lineStyle(0.8, 0x3d2000, 0.55);
    headerBg.lineBetween(HDR_X + 14, HDR_TOP + HDR_H - 22, HDR_X + HDR_W - 14, HDR_TOP + HDR_H - 22);

    // Inner border (subtle)
    headerBg.lineStyle(0.8, 0xffaa00, 0.20);
    headerBg.strokeRoundedRect(HDR_X + 2, HDR_TOP + 2, HDR_W - 4, HDR_H - 4, 10);

    // Main border
    headerBg.lineStyle(1.8, 0xffaa22, 0.72);
    headerBg.strokeRoundedRect(HDR_X, HDR_TOP, HDR_W, HDR_H, 12);

    // Top accent stripe — bright center, dimmer ends
    headerBg.fillStyle(0xffaa22, 1.0);
    headerBg.fillRoundedRect(HDR_X + 18, HDR_TOP + 0.5, HDR_W - 36, 2.5, 1);
    headerBg.fillStyle(0xffe8a0, 1.0);
    headerBg.fillRoundedRect(HDR_CX - 45, HDR_TOP + 0.5, 90, 2.5, 1);

    // Corner accent circles
    [[HDR_X + 9, HDR_TOP + 9], [HDR_X + HDR_W - 9, HDR_TOP + 9]].forEach(([dx, dy]) => {
        headerBg.fillStyle(0xffaa22, 0.55);   headerBg.fillCircle(dx, dy, 3);
        headerBg.lineStyle(0.8, 0xffd080, 0.45); headerBg.strokeCircle(dx, dy, 5);
    });

    // Fade in
    S.tweens.add({ targets: headerBg, alpha: 1, duration: 280, delay: 50 });

    // 5-C  Animated horizontal scan shimmer across header
    const scanGfx = ui.add(S.add.graphics().setDepth(305).setAlpha(0));
    let _scanPos = -0.15;
    const scanTick = S.time.addEvent({
        delay: 16, loop: true, callback: () => {
            scanGfx.clear();
            _scanPos += 0.0048;
            if (_scanPos > 1.08) _scanPos = -0.12;
            const sp = Math.max(0.02, Math.min(0.98, _scanPos));
            const sx = HDR_X + HDR_W * sp;
            const a  = 0.048 * Math.sin(_scanPos * Math.PI);
            if (a > 0.002) {
                scanGfx.fillStyle(0xffffff, a);
                scanGfx.fillTriangle(sx - 22, HDR_TOP + 3, sx + 22, HDR_TOP + 3, sx, HDR_TOP + HDR_H - 22);
                scanGfx.fillStyle(0xffee88, a * 0.6);
                scanGfx.fillTriangle(sx - 8, HDR_TOP + 3, sx + 8, HDR_TOP + 3, sx, HDR_TOP + HDR_H * 0.5);
            }
        }
    });
    ui.add({ destroy: () => scanTick.remove() });
    S.tweens.add({ targets: scanGfx, alpha: 1, duration: 260, delay: 200 });

    // 5-D  Title text (large, with canvas text-shadow glow)
    const titleTxt = ui.add(S.add.text(HDR_CX, HDR_TOP + 30, "✦  " + L("levelUp") + "  ✦", {
        font:            "28px LilitaOne, Arial, sans-serif",
        color:           "#ffffff",
        stroke:          "#331100",
        strokeThickness: 6,
        shadow:          { offsetX: 0, offsetY: 0, color: "#cc7700", blur: 10, fill: true },
        padding:         { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(306).setAlpha(0).setScale(0.30));
    S.tweens.add({
        targets: titleTxt, alpha: 1, scaleX: 1, scaleY: 1,
        duration: 400, delay: 100, ease: "Back.easeOut", easeParams: [2.8]
    });

    // 5-E  Subtitle text
    const subTxt = ui.add(S.add.text(HDR_CX, HDR_TOP + HDR_H - 12,
        (CURRENT_LANG==="tr"?`SEVIYE ${gs.level}  ·  ${L("pickPower").toUpperCase()}`:`LEVEL ${gs.level}  ·  CHOOSE AN UPGRADE`), {
            font:    "10px LilitaOne, Arial, sans-serif",
            color:   "#7a5020",
            padding: { x: 2, y: 1 }
        }).setOrigin(0.5).setDepth(306).setAlpha(0));
    S.tweens.add({ targets: subTxt, alpha: 1, duration: 220, delay: 250 });

    // ════════════════════════════════════════════════════════════════════════════
    //  LAYER 6 — FLOATING PARTICLES  (spawn in UI region only)
    // ════════════════════════════════════════════════════════════════════════════
    const _pCols = [0xffaa22, 0xffcc44, 0xffffff, 0xff8800, 0xffee66, 0xffdd00];
    const partTick = S.time.addEvent({
        delay: 78, loop: true, callback: () => {
            if (!_partsOn) return;
            const p = S.add.graphics().setDepth(301);
            p.fillStyle(_pCols[Math.floor(Math.random() * _pCols.length)],
                        0.15 + Math.random() * 0.24);
            p.fillCircle(0, 0, Math.random() < 0.35 ? 1.5 : 1);
            p.x = Phaser.Math.Between(8, W - 8);
            p.y = Phaser.Math.Between(HDR_TOP - 10, CARDS_TOP + CARD_H + 20);
            S.tweens.add({
                targets: p,
                y: p.y - Phaser.Math.Between(22, 55), alpha: 0,
                duration:   Phaser.Math.Between(900, 2100),
                ease:       "Quad.easeOut",
                onComplete: () => p.destroy()
            });
        }
    });
    ui.add({ destroy: () => { _partsOn = false; partTick.remove(); } });

    // ════════════════════════════════════════════════════════════════════════════
    //  LAYER 7 — CARDS  (horizontal, LoL-inspired, fully centered)
    // ════════════════════════════════════════════════════════════════════════════

    const TYPE_COLORS = {
        passive: 0xffaa22, weapon: 0xff7722,
        mainweapon: 0xcc44ff, evo: 0x44ff88, reward: 0xffcc22
    };
    const rewardMeta = {
        "_reward_heal":     { icon: "upicon_heal",    name: "Healing",      desc: "Restore 20 HP"   },
        "_reward_gold":     { icon: "upicon_xpboost", name: "Gold Boost",   desc: "+10% gold"       },
        "_reward_dmgburst": { icon: "upicon_damage",  name: "Damage Burst", desc: "+15% dmg 10s"    },
    };

    finalPicksUsed.forEach((upKey, i) => {

        const isEvo    = upKey.startsWith("evo_");
        const isReward = upKey.startsWith("_reward_");
        const up       = isEvo || isReward ? null : UPGRADES[upKey];
        const rMeta    = isReward ? (rewardMeta[upKey] || { icon: "upicon_damage", name: upKey, desc: "" }) : null;
        const evoObj   = isEvo ? EVOLUTIONS.find(e => e.nameKey === upKey.replace("evo_", "")) : null;
        const uType    = isEvo ? "evo" : isReward ? "reward" : (up?.type || "passive");
        const ACC      = TYPE_COLORS[uType] || 0xffaa22;

        // ── Card position (all derived from CARDS_LEFT / CARDS_TOP) ───────────
        const cx   = CARDS_LEFT + i * (CARD_W + CARD_GAP);  // left edge
        const cy   = CARDS_TOP;                               // top edge
        const ccx  = cx + CARD_W / 2;                        // center x
        const ccy  = cy + CARD_H / 2;                        // center y

        // Icon placement — lower when EVO banner is present
        const icoTopY    = isEvo ? cy + EVO_BAN_H : cy;
        const icoZoneH   = ICO_H - (isEvo ? EVO_BAN_H : 0);
        const icoY_scene = icoTopY + icoZoneH / 2;

        // Upgrade metadata
        const iconKey = isEvo    ? (UPGRADES[evoObj?.req?.[0]]?.icon || "upicon_damage")
                      : isReward ? rMeta.icon
                      : (up?.icon || "upicon_damage");
        const nameStr = isReward ? rMeta.name
                      : isEvo    ? (evoObj?.icon || "⚡") + " " + (evoObj?.name || "")
                      : L(up?.nameKey) || "";
        const lvStr   = isEvo    ? "★ EVO"
                      : isReward ? ""
                      : ("Lv " + ((up?.level || 0) + 1) + " / " + (up?.max || 1));
        const descStr = isReward ? rMeta.desc
                      : isEvo    ? (L(evoObj?.descKey) || "")
                      : (L(up?.descKey) || "");

        // Elements to fade when ANOTHER card is selected
        const fadeEls = [];

        // ── Card Background ──────────────────────────────────────────────────
        const card = ui.add(S.add.graphics().setDepth(307).setAlpha(0));

        const drawCard = (hov) => {
            card.clear();

            // Drop shadow (offset +3px right, +4px down)
            card.fillStyle(0x000000, 0.32);
            card.fillRoundedRect(cx + 3, cy + 4, CARD_W, CARD_H, 11);

            // Card body
            card.fillStyle(0x060912, 1.0);
            card.fillRoundedRect(cx, cy, CARD_W, CARD_H, 11);

            // Icon zone — 3 alpha layers to simulate radial gradient
            card.fillStyle(ACC, hov ? 0.28 : 0.14);
            card.fillRoundedRect(cx, cy, CARD_W, ICO_H, { tl: 11, tr: 11, bl: 0, br: 0 });
            card.fillStyle(ACC, hov ? 0.09 : 0.03);
            card.fillRoundedRect(cx, cy + ICO_H * 0.50, CARD_W, ICO_H * 0.50, 0);
            card.fillStyle(0x000000, 0.10);
            card.fillRoundedRect(cx, cy + ICO_H * 0.72, CARD_W, ICO_H * 0.28, 0);

            // Diagonal shine in icon zone (top-left catch-light)
            card.fillStyle(0xffffff, hov ? 0.068 : 0.030);
            card.fillTriangle(cx, cy, cx + CARD_W * 0.78, cy, cx, cy + ICO_H * 0.68);

            // Top accent shine stripe (bright center, dim edges)
            card.fillStyle(ACC, hov ? 0.75 : 0.24);
            card.fillRoundedRect(cx + CARD_W * 0.08, cy + 0.5, CARD_W * 0.84, 2.0, 1);
            if (hov) {
                card.fillStyle(0xffffff, 0.50);
                card.fillRoundedRect(cx + CARD_W * 0.25, cy + 0.5, CARD_W * 0.50, 2.0, 1);
            }

            // Horizontal divider
            card.lineStyle(1, ACC, hov ? 0.32 : 0.14);
            card.lineBetween(cx + 5, cy + ICO_H, cx + CARD_W - 5, cy + ICO_H);

            // Text zone subtle tint
            card.fillStyle(ACC, hov ? 0.065 : 0.018);
            card.fillRoundedRect(cx, cy + ICO_H, CARD_W, CARD_H - ICO_H, { tl: 0, tr: 0, bl: 11, br: 11 });

            // Main border
            card.lineStyle(hov ? 2.5 : 1.5, ACC, hov ? 1.0 : 0.46);
            card.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 11);

            // Hover extras
            if (hov) {
                card.lineStyle(1, ACC, 0.22);
                card.strokeRoundedRect(cx + 2, cy + 2, CARD_W - 4, CARD_H - 4, 9);
                card.fillStyle(ACC, 0.22);
                card.fillRoundedRect(cx + CARD_W - 7, cy + 4, 5, CARD_H - 8, { tl: 0, tr: 9, bl: 0, br: 9 });
            }
        };
        drawCard(false);

        // ── EVO Banner ───────────────────────────────────────────────────────
        if (isEvo) {
            const evoBg = ui.add(S.add.graphics().setDepth(309).setAlpha(0));
            evoBg.fillStyle(0x33ff77, 0.94);
            evoBg.fillRoundedRect(cx, cy, CARD_W, EVO_BAN_H, { tl: 11, tr: 11, bl: 0, br: 0 });
            fadeEls.push(evoBg);
            const evoTxt = ui.add(S.add.text(ccx, cy + EVO_BAN_H / 2,
                "⚡ EVOLUTION", {
                    font:  `bold ${CARD_W >= 100 ? 7 : 6}px LilitaOne, Arial, sans-serif`,
                    color: "#002211"
                }).setOrigin(0.5).setDepth(310).setAlpha(0));
            fadeEls.push(evoTxt);
        }

        // ── Icon Ring ────────────────────────────────────────────────────────
        const RING_R  = Math.round(CARD_W * 0.248);
        const icoRing = ui.add(S.add.graphics().setDepth(308).setAlpha(0));
        icoRing.x = ccx; icoRing.y = icoY_scene;
        icoRing.lineStyle(1.5, ACC, 0.44); icoRing.strokeCircle(0, 0, RING_R);
        icoRing.lineStyle(1,   ACC, 0.14); icoRing.strokeCircle(0, 0, RING_R * 1.30);
        fadeEls.push(icoRing);

        // ── Icon Image  (with secondary GL mipmap patch for crispness) ───────
        // 256×256 PNGs are downscaled to ~64px — always downscaling, never upscaling.
        // Primary patch: postBoot createTextureFromSource hook (applied at load time).
        // Secondary patch: re-applied here at render time as belt-and-suspenders.
        const ICON_SIZE = Math.round(CARD_W * 0.595);
        let ico = null;
        try {
            ico = S.add.image(ccx, icoY_scene, iconKey)
                .setDisplaySize(ICON_SIZE, ICON_SIZE)
                .setScrollFactor(0)
                .setDepth(309)
                .setAlpha(0);
            ui.add(ico);
            _allIcos.push(ico);

            // Secondary GL filter patch (trilinear mipmap)
            try {
                const rend = S.sys.game.renderer;
                if (rend && rend.gl) {
                    const gl  = rend.gl;
                    const tex = S.sys.game.textures.get(iconKey);
                    if (tex && tex.source && tex.source[0] && tex.source[0].glTexture) {
                        gl.bindTexture(gl.TEXTURE_2D, tex.source[0].glTexture);
                        gl.generateMipmap(gl.TEXTURE_2D);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        try{
                            const aniso = gl.getExtension('EXT_texture_filter_anisotropic') ||
                                          gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                                          gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
                            if(aniso){
                                const maxAniso = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                                gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, maxAniso));
                            }
                        }catch(_){}
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    }
                }
            } catch (glE) { /* silently ignore — postBoot patch is primary */ }

        } catch (e) { console.warn("[NT] Hata yutuldu:", e); }

        // ── Name Text ────────────────────────────────────────────────────────
        const nameTxt = ui.add(S.add.text(ccx, TZ_Y_BASE, nameStr, {
            font:            `${fSzN}px LilitaOne, Arial, sans-serif`,
            color:           "#ffffff",
            stroke:          "#00001a",
            strokeThickness: 2,
            wordWrap:        { width: CARD_W - 8, useAdvancedWrap: false },
            align:           "center",
            padding:         { x: 1, y: 0 }
        }).setOrigin(0.5, 0).setDepth(310).setAlpha(0));
        fadeEls.push(nameTxt);

        // ── Level Badge ──────────────────────────────────────────────────────
        const _lvY    = TZ_Y_BASE + fSzN + 6;
        const lvBgGfx = ui.add(S.add.graphics().setDepth(310).setAlpha(0));
        fadeEls.push(lvBgGfx);
        if (lvStr) {
            const bw = Math.max(lvStr.length * 6 + 14, 38);
            lvBgGfx.fillStyle(ACC, 0.22);
            lvBgGfx.fillRoundedRect(ccx - bw / 2, _lvY, bw, fSzS + 7, 3);
            lvBgGfx.lineStyle(0.8, ACC, 0.58);
            lvBgGfx.strokeRoundedRect(ccx - bw / 2, _lvY, bw, fSzS + 7, 3);
        }
        const lvBadgeTxt = ui.add(S.add.text(ccx, _lvY + 2, lvStr, {
            font:    `${fSzS}px LilitaOne, Arial, sans-serif`,
            color:   isEvo ? "#44ff88" : "#ffdd88",
            padding: { x: 2, y: 1 }
        }).setOrigin(0.5, 0).setDepth(311).setAlpha(0));
        fadeEls.push(lvBadgeTxt);

        // ── Description Text ─────────────────────────────────────────────────
        const _descY  = _lvY + fSzS + 12;
        const descTxt = ui.add(S.add.text(ccx, _descY, descStr, {
            font:    `${fSzS}px LilitaOne, Arial, sans-serif`,
            color:   "#cc9944",
            wordWrap: { width: CARD_W - 8, useAdvancedWrap: true },
            align:   "center"
        }).setOrigin(0.5, 0).setDepth(310).setAlpha(0));
        fadeEls.push(descTxt);

        // ── Pip Bar ──────────────────────────────────────────────────────────
        const _pipY = cy + CARD_H - 13;
        if (up && !isReward && up.max > 1) {
            const totalPips  = Math.min(up.max, 5);
            const pipW       = Math.floor((CARD_W - 16) / totalPips) - 2;
            const pipsTotalW = totalPips * pipW + (totalPips - 1) * 2;
            const pipsStartX = cx + (CARD_W - pipsTotalW) / 2;
            for (let lv2 = 0; lv2 < totalPips; lv2++) {
                const filled = lv2 < up.level;
                const isNext = lv2 === up.level;
                const px     = pipsStartX + lv2 * (pipW + 2);
                const pg     = ui.add(S.add.graphics().setDepth(310).setAlpha(0));
                pg.fillStyle(filled ? ACC : (isNext ? ACC : 0x1e0800),
                             filled ? 0.94 : (isNext ? 0.48 : 0.18));
                pg.fillRoundedRect(px, _pipY, pipW, 4, 2);
                if (filled) { pg.fillStyle(0xffffff, 0.28); pg.fillRoundedRect(px, _pipY, pipW, 2, 1); }
                if (isNext) { pg.lineStyle(0.8, ACC, 0.74); pg.strokeRoundedRect(px, _pipY, pipW, 4, 2); }
                fadeEls.push(pg);
            }
        }

        // Register for cross-card fade
        _allCardObjs.push({ card, fadeEls: [...fadeEls] });

        // ── Shimmer Effect ───────────────────────────────────────────────────
        const shimGfx = ui.add(S.add.graphics().setDepth(311).setAlpha(0));
        let _shimPos  = -0.35 - i * 0.30;
        let _shimT    = i * 0.85;
        const shimTick = S.time.addEvent({
            delay: 16, loop: true, callback: () => {
                shimGfx.clear();
                _shimT   += 0.016;
                _shimPos += 0.0090;
                if (_shimPos > 1.32) _shimPos = -0.35;
                const sx = cx + CARD_W * _shimPos;
                shimGfx.fillStyle(0xffffff, 0.048 + 0.026 * Math.sin(_shimT * 1.85));
                shimGfx.fillTriangle(sx - 5, cy, sx + 18, cy, sx + 12, cy + CARD_H);
                shimGfx.fillStyle(0xffffff, 0.020);
                shimGfx.fillTriangle(sx + 18, cy, sx + 28, cy, sx + 22, cy + CARD_H);
                for (let gl = 0; gl < 2; gl++) {
                    const glx = cx + ((_shimT * 41 + gl * 127) % CARD_W);
                    const gly = cy + ((_shimT * 31 + gl * 83)  % CARD_H);
                    shimGfx.fillStyle(ACC, (Math.sin(_shimT * 4.1 + gl * 1.9) * 0.5 + 0.5) * 0.18);
                    shimGfx.fillCircle(glx, gly, 1.2);
                }
            }
        });
        ui.add({ destroy: () => shimTick.remove() });

        // ── Entry Animation  (setTimeout — immune to timeScale = 0) ──────────
        const _entryTO = setTimeout(() => {
            if (!_levelUpChoosing || _selectionMade) return;

            // Card: slide up 20px + fade in
            card.y = 20;
            S.tweens.add({ targets: card, alpha: 1, y: 0, duration: 280, ease: "Back.easeOut", easeParams: [1.3] });

            // Icon: fade in
            if (ico && ico.scene && !_selectionMade) {
                S.tweens.add({ targets: ico, alpha: 1, duration: 210, delay: 55 });
            }

            // Ring: fade in
            S.tweens.add({ targets: icoRing, alpha: 0.55, duration: 220, delay: 65 });

            // Text: slide up 10px + fade in (staggered)
            [[nameTxt, 0], [lvBadgeTxt, 20], [descTxt, 38]].forEach(([el, dl]) => {
                if (el && el.scene) {
                    el.y += 10;
                    S.tweens.add({ targets: el, alpha: 1, y: el.y - 10, duration: 220, delay: 68 + dl, ease: "Quad.easeOut" });
                }
            });

            // Level badge bg
            S.tweens.add({ targets: lvBgGfx, alpha: lvStr ? 1 : 0, duration: 220, delay: 88 });

            // All remaining (evo banner, pips, etc.)
            const _handled = new Set([nameTxt, lvBadgeTxt, lvBgGfx, descTxt, icoRing]);
            fadeEls.forEach(el => {
                if (_handled.has(el)) return;
                if (el && el.scene) S.tweens.add({ targets: el, alpha: 1, duration: 200, delay: 105 });
            });

            // Shimmer
            S.tweens.add({ targets: shimGfx, alpha: 0.58, duration: 300, delay: 115 });

        }, 205 + i * 115);

        _allIcoTOs.push(_entryTO);
        ui.add({ destroy() { clearTimeout(_entryTO); } });

        // ── Hit Area ─────────────────────────────────────────────────────────
        const hit = ui.add(
            S.add.rectangle(ccx, ccy, CARD_W, CARD_H, 0xffffff, 0.001)
                .setInteractive().setDepth(312)
        );
        _allHitAreas.push(hit);
        let _flt = null;

        // ── Hover ────────────────────────────────────────────────────────────
        hit.on("pointerover", () => {
            drawCard(true);
            if (ico) S.tweens.add({
                targets: ico, displayWidth: ICON_SIZE * 1.09, displayHeight: ICON_SIZE * 1.09,
                duration: 120, ease: "Back.easeOut", easeParams: [2.0]
            });
            icoRing.setAlpha(0.90);
            S.tweens.add({ targets: shimGfx, alpha: 1.0, duration: 80 });
            if (_flt) _flt.stop();
            _flt = S.tweens.add({
                targets: [ico, icoRing].filter(Boolean),
                y: "+=4", duration: 720, yoyo: true, repeat: -1, ease: "Sine.easeInOut"
            });
        });

        hit.on("pointerout", () => {
            drawCard(false);
            if (ico) S.tweens.add({
                targets: ico, displayWidth: ICON_SIZE, displayHeight: ICON_SIZE,
                duration: 90, ease: "Quad.easeOut"
            });
            icoRing.setAlpha(0.55);
            S.tweens.add({ targets: shimGfx, alpha: 0.58, duration: 120 });
            if (_flt) { _flt.stop(); _flt = null; }
            if (ico)     ico.y     = icoY_scene;
            if (icoRing) icoRing.y = icoY_scene;
        });

        // ── Selection ────────────────────────────────────────────────────────
        hit.on("pointerdown", () => {
            if (_selectionMade || !_levelUpChoosing) return;
            _selectionMade = true;
            NT_SFX.play("upgrade_select");
            console.log("[LevelUp] Upgrade selected:", upKey);

            // Disable all hit areas
            _allHitAreas.forEach(h => { try { h.disableInteractive(); } catch (e) { console.warn("[NT] Hata yutuldu:", e); } });

            // Kill entry timeouts + destroy all icons
            _allIcoTOs.forEach(t => clearTimeout(t));
            _allIcoTOs.length = 0;
            _allIcos.forEach(ic => {
                if (!ic) return;
                try { S.tweens.killTweensOf(ic); ic.setVisible(false).setAlpha(0).destroy(); }
                catch (e) { console.warn("[NT] Hata yutuldu:", e); }
            });
            _allIcos.length = 0;
            ico = null;
            if (_flt) { try { _flt.stop(); } catch (e) {} _flt = null; }
            if (icoRing) { try { S.tweens.killTweensOf(icoRing); icoRing.setVisible(false).setAlpha(0); } catch (e) {} }

            // Double screen flash
            const _doFlash = (col, a, ms) => {
                setTimeout(() => {
                    if (!S || !S.add) return;
                    const sf = S.add.rectangle(CX, CY, W, H, col, 0).setDepth(320);
                    S.tweens.add({ targets: sf, fillAlpha: a, duration: 55, yoyo: true,
                        onComplete: () => { try { sf.destroy(); } catch (e) { console.warn("[NT] Hata yutuldu:", e); } } });
                }, ms);
            };
            _doFlash(ACC,      0.26, 0);
            _doFlash(0xffffff, 0.11, 130);

            // Fade out non-selected cards
            _allCardObjs.forEach(entry => {
                if (entry.card === card) return;
                try { S.tweens.add({ targets: entry.card, alpha: 0.09, duration: 260, ease: "Quad.easeOut" }); } catch (e) {}
                entry.fadeEls.forEach(el => {
                    if (el && el.scene) { try { S.tweens.add({ targets: el, alpha: 0, duration: 220 }); } catch (e) {} }
                });
            });

            // Selected card: fly up + dissolve
            S.tweens.add({
                targets: card, alpha: 0, y: card.y - 58,
                duration: 310, delay: 75, ease: "Quad.easeIn",
                onComplete: () => { try { card.destroy(); } catch (e) { console.warn("[NT] Hata yutuldu:", e); } }
            });
            fadeEls.forEach(el => {
                if (el && el.scene) { try { S.tweens.add({ targets: el, alpha: 0, duration: 200 }); } catch (e) {} }
            });

            // Particle burst at icon center
            const _burstParts = [];
            for (let p = 0; p < 22; p++) {
                const pa = Phaser.Math.DegToRad(p * (360 / 22));
                const pd = Phaser.Math.Between(26, 85);
                const pt = S.add.graphics().setDepth(320);
                pt.fillStyle(p % 3 === 0 ? 0xffffff : p % 3 === 1 ? ACC : 0xaaffff, 0.9);
                pt.fillRect(-1.5, -1.5, 3, 3);
                pt.x = ccx; pt.y = icoY_scene;
                _burstParts.push(pt);
                S.tweens.add({
                    targets:  pt,
                    x:        ccx + Math.cos(pa) * pd,
                    y:        icoY_scene + Math.sin(pa) * pd,
                    alpha: 0, scaleX: 0.1, scaleY: 0.1,
                    duration: Phaser.Math.Between(270, 450), ease: "Quad.easeOut",
                    onComplete: () => { try { pt.destroy(); } catch (e) { console.warn("[NT] Hata yutuldu:", e); } }
                });
            }
            try { S.cameras.main.shake(100, 0.003); } catch (e) { console.warn("[NT] Hata yutuldu:", e); }

            // Apply upgrade (unchanged from original)
            _partsOn = false;
            if (isReward) {
                if (upKey === "_reward_heal") {
                    gs.health = Math.min(gs.maxHealth, gs.health + 20); gs._healFlash = 600;
                } else if (upKey === "_reward_gold") {
                    gs.goldMult = (gs.goldMult || 1) + 0.10;
                } else if (upKey === "_reward_dmgburst") {
                    gs._dmgBurstActive = true;
                    S.time.delayedCall(10000, () => { if (GS) GS._dmgBurstActive = false; });
                }
            } else if (isEvo) {
                const ek  = upKey.replace("evo_", "");
                const ev2 = EVOLUTIONS.find(e => e.nameKey === ek);
                if (ev2) { applyUpgrade(S, "evo_" + ek, true); }
            } else {
                applyUpgrade(S, upKey, false);
            }
            if(gs) gs._statsDirty=true;

            // Close panel + resume game
            setTimeout(() => {
                try {
                    console.log("[LevelUp] Destroying panel after selection");
                    _burstParts.forEach(pt => {
                        try { if (pt && pt.scene) { S.tweens.killTweensOf(pt); pt.destroy(); } }
                        catch (e) { console.warn("[NT] Hata yutuldu:", e); }
                    });
                    const slotIconSet = new Set([...(S.weaponSlotIcons || []), ...(S.passiveSlotIcons || [])]);
                    try {
                        S.children.list.slice().forEach(obj => {
                            if (slotIconSet.has(obj)) return;
                            if (obj && obj.texture && obj.texture.key && obj.texture.key.startsWith("upicon_")) {
                                try { S.tweens.killTweensOf(obj); obj.setVisible(false); obj.destroy(); }
                                catch (e) { console.warn("[NT] Hata yutuldu:", e); }
                            }
                        });
                    } catch (e) { console.warn("[NT] Hata yutuldu:", e); }

                    closeLevelUpPanel(S, ui);
                    if (S && S.time)    S.time.timeScale = 1.0;
                    if (S && S.tweens)  { try { S.tweens.resumeAll();  } catch (e) { console.warn("[NT] Hata yutuldu:", e); } }
                    if (S && S.physics) { try { S.physics.resume();    } catch (e) { console.warn("[NT] Hata yutuldu:", e); } }
                    if (S && S.spawnEvent) S.spawnEvent.paused = false;
                    unlockUpgrade(gs, S);
                    refreshSlots(S);

                } catch (err) {
                    console.error("[LevelUp] Error during panel close:", err);
                    _levelUpChoosing = false;
                    try { if (S && S.time)    S.time.timeScale = 1.0; }  catch (e) { console.warn("[NT] Hata yutuldu:", e); }
                    try { if (S && S.tweens)  S.tweens.resumeAll(); }     catch (e) { console.warn("[NT] Hata yutuldu:", e); }
                    try { if (S && S.physics) S.physics.resume(); }       catch (e) { console.warn("[NT] Hata yutuldu:", e); }
                    try { if (S && S.spawnEvent) S.spawnEvent.paused = false; } catch (e) { console.warn("[NT] Hata yutuldu:", e); }
                    try { if (gs) gs.pickingUpgrade = false; }            catch (e) { console.warn("[NT] Hata yutuldu:", e); }
                    try { unlockUpgrade(gs, S); }                         catch (e) { console.warn("[NT] Hata yutuldu:", e); }
                }
            }, 510);
        });

    }); // ─── end per-card forEach ─────────────────────────────────────────────

    // ════════════════════════════════════════════════════════════════════════════
    //  LAYER 8 — BOTTOM CAPTION
    // ════════════════════════════════════════════════════════════════════════════
    const capTxt = ui.add(S.add.text(CX, CAP_Y,
        "CLICK A CARD  ·  HOVER TO PREVIEW", {
            font:  "bold 7px LilitaOne, Arial, sans-serif",
            color: "#283850"
        }).setOrigin(0.5).setDepth(306).setAlpha(0));
    S.tweens.add({ targets: capTxt, alpha: 1, duration: 220, delay: 660 });

    // ─── Register open panel ──────────────────────────────────────────────────
    try { S._openPanel = ui.items; } catch (e) { console.warn("[NT] Hata yutuldu:", e); }
}
function checkEvolution(){
    const gs=GS;
    // HARD GATE: evolutions never appear before level 10
    if(!gs||gs.level<10) return null;
    for(const evo of EVOLUTIONS){
        if(evo.active) continue;
        // All req upgrades must be at their personal max
        if(evo.req.every(r=>UPGRADES[r]&&UPGRADES[r].level>=UPGRADES[r].max)){
            // 45% chance per level-up check — not guaranteed every time
            if(Math.random()<0.45) return["evo_"+evo.nameKey];
        }
    }
    return null;
}
function getUpgradePool(){
    const gs = GS;
    const hpRatio = gs ? (gs.health / gs.maxHealth) : 1;
    const isWeak  = hpRatio < 0.40;
    const isLateGame = gs && gs.level >= 12;

    // Aktif weapon sayisi (slot kontrolu icin)
    const wC = Object.values(UPGRADES).filter(u => u.type === "weapon" && u.level > 0).length;
    const pC = Object.values(UPGRADES).filter(u => u.type === "passive" && u.level > 0).length;
    // [v9.4] Main weapon: player can have only ONE active at a time
    const hasMainWeapon = Object.values(UPGRADES).some(u => u.type === "mainweapon" && u.level > 0);

    // Sinerji icin onerilen key'ler
    const activeWeapons = Object.entries(UPGRADES)
        .filter(([k,u]) => (u.type === "weapon" || u.type === "mainweapon") && u.level > 0)
        .map(([k]) => k);
    const synergyKeys = new Set();
    SYNERGIES.forEach(syn => {
        if(syn.active) return;
        const matches = syn.req.filter(r => activeWeapons.includes(r));
        if(matches.length > 0) syn.req.forEach(r => synergyKeys.add(r));
    });

    const pool = [];

    for(const [k, u] of Object.entries(UPGRADES)){
        // ── STRICT MAX ENFORCEMENT ──────────────────────────────
        const maxLv = u.max ?? u.maxLevel ?? 999;
        if((u.level || 0) >= maxLv) continue;

        // 2. Weapon slot dolu ve bu weapon henuz acilmamissa gecme
        // Ama: slot doluysa mevcut weapon'lari YUKSELTEBILIR (level > 0)
        if(u.type === "weapon"  && u.level === 0 && wC >= MAX_WEAPONS) continue;
        // 3. Passive slot dolu ve bu passive henuz acilmamissa gecme
        // Ama: slot doluysa mevcut passive'leri YUKSELTEBILIR (level > 0)
        if(u.type === "passive" && u.level === 0 && pC >= MAX_PASSIVES) continue;
        // [v9.4] 4. mainweapon: always allow (acquiring replaces current weapon)
        // Don't exclude — weapon swap is a valid interesting choice

        const isHealType     = ["heal", "regen", "maxhp"].includes(k);
        const isSynergyMatch = synergyKeys.has(k);
        // [v10.1] Mevcut upgrade seviyesine gore ek agirlik
        // Lv0 upgrade'ler daha az tercih edilmeli erken oyunda (ilk kez aciliyor → belirsizlik)
        // Lv1+ upgrade'ler icin tekrar onerilmek daha degerli (build tutarliligi)
        const isPartiallyBuilt = (u.level||0) >= 1 && (u.level||0) < (u.max||1);

        let weight = 1;
        // Zayif durum: iyilestirici onceligi artar
        if(isWeak && isHealType)          weight = 5;
        else if(isLateGame && isHealType) weight = 2;
        // Sinerji eslesmesi: build tutarliligini destekle
        if(isSynergyMatch)      weight = Math.max(weight, 3);
        // Kismen tamamlanmis upgrade: devam etmeyi tesvik et (build kimligi)
        if(isPartiallyBuilt)    weight = Math.max(weight, 2);
        // Erken oyunda silah yoksa: mainweapon oner
        if(u.type === "mainweapon" && !hasMainWeapon) weight = Math.max(weight, 2);
        // Gec oyunda yeni bir mainweapon onerisi daha az baskin olsun (build kuruldu)
        if(u.type === "mainweapon" && hasMainWeapon && gs && gs.level >= 8) weight = Math.min(weight, 1);

        // ── BUILD BALANCE: Hasarin cok dusuk kalmasini engelle ──
        const _isDefKey = ["knockback","freeze"].includes(k);
        // Damage upgrade'i 0 ise ve oyuncu zayif hasar yapiyorsa, hasar upgrade'ini oner
        const _dmgLevel = UPGRADES.damage?.level || 0;
        const _atkLevel = UPGRADES.attack?.level || 0;
        const _hasNoDmg = _dmgLevel === 0 && _atkLevel === 0;
        if(_hasNoDmg && gs && gs.level >= 3 && (k === "damage" || k === "attack")){
            weight = Math.max(weight, 3); // hasar 0 ise oncelik ver
        }
        // Savunma upgrade'i hic yoksa ve can dusukse
        const _hasNoDef = (UPGRADES.freeze?.level||0)===0 && (UPGRADES.knockback?.level||0)===0;
        if(_hasNoDef && isWeak && _isDefKey) weight = Math.max(weight, 2);

        // [v11] split is compatible with all weapons — no exclusion needed

        // Agirlik kadar pool'a ekle (shuffle sonrasi etkili bir agirlik sistemi)
        for(let _w=0;_w<weight;_w++) pool.push(k);
    }

    if(pool.length > 0) return pool;

    return ["_reward_heal", "_reward_gold", "_reward_dmgburst"];
}
function applyUpgrade(S,key,isEvo){
    const gs=GS;
    if(isEvo){
        const en=key.replace("evo_","");
        const evo=EVOLUTIONS.find(e=>e.nameKey===en);
        if(evo){
            evo.active=true;
            // [OPT] GS'e evolution cache flag'ini set et
            const flagMap={
                "evoTriCannon":"_evoTriCannon","evoStormCore":"_evoStormCore",
                "evoOverload":"_evoOverload",
                "evoCryoField":"_evoCryoField","evoPlagueBearer":"_evoPlagueBearer",
                "evoMirrorStorm":"_evoMirrorStorm"  // [v10.0]
            };
            if(flagMap[en]) GS[flagMap[en]]=true;
            // ★ YENI: Guclu evolution sinemasi (eski flash kaldirilmadi, ustune eklendi)
            const evoColorMap={
                evoTriCannon:0xff8800,evoStormCore:0xffff44,
                evoOverload:0xff44aa,evoCryoField:0x88ddff,evoPlagueBearer:0x44ff44,
                evoMirrorStorm:0x20ccaa  // [v10.0] teal
            };
            const ec=evoColorMap[en]||0xffffff;
            
            S.time.delayedCall(80,()=>showEvolutionCinematic(S,L(evo.nameKey)||evo.name,ec));
        }
        return;
    }
    const up=UPGRADES[key];
    // ── FULL-MAX REWARDS (when all upgrades are maxed) ──────────
    if(key==="_reward_heal"){
        gs.health=Math.min(gs.maxHealth,gs.health+20);
        gs._healFlash=700;
        showHitTxt(S,180,200,CURRENT_LANG==="tr"?"+20 CAN":"+20 HP","#44ff88",true);
        checkAndApplySynergies(S);
        return;
    }
    if(key==="_reward_gold"){
        gs.goldMult=(gs.goldMult||1)+0.10;
        showHitTxt(S,180,200,CURRENT_LANG==="tr"?"+10% ALTIN BONUSU":"+10% GOLD BONUS","#ffcc00",true);
        checkAndApplySynergies(S);
        return;
    }
    if(key==="_reward_dmgburst"){
        // [v9.2] Gecici +12% hasar — pipeline flag uzerinden
        gs._dmgBurstActive=true;
        if(gs) gs._statsDirty=true;
        showHitTxt(S,180,200,CURRENT_LANG==="tr"?"+12% HASAR (10sn)":"+12% DMG (10s)","#ff8800",true);
        S.time.delayedCall(10000,()=>{
            if(GS&&!GS.gameOver){ GS._dmgBurstActive=false; if(GS) GS._statsDirty=true; }
        });
        checkAndApplySynergies(S);
        return;
    }
    if(!up)return;
    up.level=Math.min(up.level+1,up.max);
    // [FIX] Ilk alimda slot sirasina kaydet — slot kaymasini onler
    if(up.level===1 && S){
        if(!S._weaponSlotKeys) S._weaponSlotKeys=[];
        if(!S._passiveSlotKeys) S._passiveSlotKeys=[];
        if((up.type==="weapon"||up.type==="mainweapon")&&!S._weaponSlotKeys.includes(key))
            S._weaponSlotKeys.push(key);
        if(up.type==="passive"&&!S._passiveSlotKeys.includes(key))
            S._passiveSlotKeys.push(key);
    }
    switch(key){
        case"damage":
            // Pipeline handles damage — sadece level kaydi yeterli, sync asagida
            break;
        case"attack":
            // Pipeline handles shootDelay — sadece level kaydi yeterli
            gs.bulletSpeed=Math.min(500, gs.bulletSpeed+10);
            break;
        case"size":
            // Hard cap: 1.6x bullet scale
            // [v10.x TRADEOFF] Buyuk mermi = yavas mermi: her lv −12% bullet speed
            gs.bulletScale=Math.min(1.6, gs.bulletScale+0.22);
            gs.bulletSpeed=Math.max(gs.bulletSpeed*0.88, 290); // min 290 (was no floor)
            break;
        case"split":
            // [v11] Split Shot: oldurme tetikli bolunme mermisi — multiShot YOK
            // Her lv'de splitLevel artar → killEnemy'de 2 fragment spawn edilir
            // TRADEOFF: her lv −10% bullet speed (agir mermiler daha yavas)
            gs.splitLevel = Math.min(3, (gs.splitLevel||0) + 1);
            gs.bulletSpeed = Math.max(gs.bulletSpeed * 0.90, 260);
            break;
        case"pierce":
            // Hard cap: 2 pierce max
            // [v10.x TRADEOFF] Pierce basina −20% hasar decay — applyDmg'de bullet._pierced ile uygulanir
            gs.pierceCount=Math.min(2, gs.pierceCount+1);
            break;
        case"crit":
            // Pipeline handles critChance — sadece level kaydi yeterli
            break;
        case"knockback":
            gs.knockback=Math.min(1, gs.knockback+1);
            // Maliyet: −15% hasar → pipeline'a girer (calcStats'ta kbDmgCost)
            if(S) showHitTxt(S,180,220,CURRENT_LANG==="tr"?"Itme aktif — hasar -%15":"Knockback active — DMG -15%","#ff8844",false);
            break;
        case"freeze":
            gs.freezeChance=Math.min(0.32, gs.freezeChance+0.10); // [BALANCE v10] cap 0.28→0.32, +0.10 per lv
            // Maliyet: −12% hasar per lv → pipeline'a girer (calcStats'ta frzDmgCost)
            break;
        case"xpboost":
            // [BALANCE v10] XP snowball kapatildi: +15% per lv, hard cap ×1.30
            // Maliyet: −10% gold drop → goldMult dusurulur
            gs.xpMult=Math.min(1.30, gs.xpMult+0.15);
            gs.goldMult=Math.max(0.60, gs.goldMult - 0.10);
            break;
        case"maxhp":
            // [v10.x] +5/+4/+3 HP per level (azalan iade)
            // Maliyet: −8% attack speed per lv → pipeline'a girer (calcStats'ta maxhpAtkCost)
            const maxHpGain = [6,5,4][Math.max(0, UPGRADES.maxhp.level-1)] || 4;
            gs.maxHealth+=maxHpGain; gs.health=Math.min(gs.health+maxHpGain,gs.maxHealth);
            gs._healFlash=500; break;
        case"regen": 
            // Maliyet: −10% attack speed per lv → pipeline'a girer (calcStats'ta regenAtkCost)
            gs._healFlash=300; break;
        case"heal":
            // [v10.x] +6/+9 HP on pickup (lv1/lv2)
            // Maliyet: −8% maxHP per lv (min 8)
            const healAmt2 = UPGRADES.heal.level===1 ? 6 : 9;
            gs.health=Math.min(gs.maxHealth,gs.health+healAmt2);
            // maxHealth azalt — build kimligi: pickup'a guven, HP'ye degil
            const hpPenalty = Math.floor(gs.maxHealth * 0.08);
            gs.maxHealth = Math.max(8, gs.maxHealth - hpPenalty);
            gs.health = Math.min(gs.health, gs.maxHealth);
            gs._healFlash=600; break;
        case"speed": {
            // Pipeline handles moveSpeed — sadece level kaydi, sync asagida
            gs._speedBuffActive=true;
            if(S) S.time.delayedCall(3000,()=>{ gs._speedBuffActive=false; });
            break;
        }
        case"explosive": case"lightning":
        case"drone": case"saw": case"poison": case"laser": case"thunder":
            // tickWeapons halleder, burada ek logic yok
            break;
        // ── v9.4 MAIN WEAPON TRANSFORMATION ─────────────────────
        case"rapid_blaster": case"heavy_cannon": case"spread_shot":
        case"chain_shot":    case"precision_rifle": case"reflection_rifle":
            // Enforce single main weapon — deactivate all other main weapons
            ["rapid_blaster","heavy_cannon","spread_shot","chain_shot","precision_rifle","reflection_rifle"].forEach(wk=>{
                if(wk!==key && UPGRADES[wk]) UPGRADES[wk].level=0;
            });
            gs.activeWeapon=key;
            // [FIX] Slot listesinden eski mainweapon'lari temizle, yenisini slot 0'a koy
            if(S._weaponSlotKeys){
                S._weaponSlotKeys=S._weaponSlotKeys.filter(k=>
                    !["rapid_blaster","heavy_cannon","spread_shot","chain_shot","precision_rifle","reflection_rifle"].includes(k)
                );
                S._weaponSlotKeys.unshift(key); // mainweapon her zaman slot 0
            }
            break;
    }
    // ★ Pipeline sync — tum stat degisikliklerini tek noktadan guncelle
    if(gs) gs._statsDirty=true;
    // ★ YENI: Upgrade sonrasi sinerji kontrolu tetikle
    checkAndApplySynergies(S);
    // ★ Build title — guclu kombo varsa goster
    S.time.delayedCall(600,()=>showBuildTitle(S));

    // [VFX v2] Upgrade pickup — glow pulse + text float
    if(S&&S.player){
        // ── UPGRADE PICKUP SOUND — category-based ──
        const _upCat = UPGRADES[key]?.type || "";
        const _isHealKey = ["heal","regen","maxhp"].includes(key);
        const _isDefKey = ["knockback","freeze","shield"].includes(key);
        const _isUtilKey = ["speed","xpboost","size"].includes(key);
        if(_isHealKey) NT_SFX.play("upgrade_heal");
        else if(_isDefKey) NT_SFX.play("upgrade_defensive");
        else if(_isUtilKey) NT_SFX.play("upgrade_utility");
        else if(_upCat==="weapon" || _upCat==="mainweapon") NT_SFX.play("upgrade_weapon");
        else NT_SFX.play("upgrade_passive");
        const upColor=UPGRADES[key]?.color||0x4488ff;
        const plx=_snap(S.player.x), ply=_snap(S.player.y);
        vfxLevelUpGlow(S,plx,ply,upColor);

        // ── MAINWEAPON ACQUISITION — ekstra flash ve halka ──
        if(_upCat === "mainweapon" && !_IS_MOBILE_EARLY){
            // Beyaz ekran flash
            const wFlash = S.add.rectangle(180, 320, 360, 640, 0xffffff, 0).setDepth(750);
            S.tweens.add({targets:wFlash, fillAlpha:0.35, duration:80, yoyo:true, hold:40,
                onComplete:()=>{try{wFlash.destroy();}catch(e){}}});
            // Silah rengi halka patlamasi
            for(let wr=0;wr<3;wr++){
                S.time.delayedCall(wr*70,()=>{
                    const wRing = S.add.graphics().setDepth(28);
                    wRing.x=plx; wRing.y=ply;
                    wRing.lineStyle(3-wr, upColor, 0.9-wr*0.2);
                    wRing.strokeCircle(0, 0, 10+wr*6);
                    S.tweens.add({targets:wRing, scaleX:5+wr, scaleY:5+wr, alpha:0,
                        duration:400+wr*80, ease:"Quad.easeOut",
                        onComplete:()=>{try{wRing.destroy();}catch(e){}}});
                });
            }
            S.cameras.main.shake(50, 0.004);
        }
        const ut=S.add.text(plx,ply-30,">> "+L(UPGRADES[key]?.nameKey||key),{
            font:"bold 12px LilitaOne, Arial, sans-serif",
            color:Phaser.Display.Color.IntegerToColor(upColor).rgba,
            padding:{x:2,y:1}
        }).setOrigin(0.5).setDepth(25).setAlpha(0.9);
        S.tweens.add({targets:ut,y:ply-52,alpha:0,duration:680,ease:"Quad.easeOut",
            onComplete:()=>{ try{ut.destroy();}catch(e){} }});
    }
}

// ── KILL + XP ────────────────────────────────────────────────
function spawnMirrorClone(S,src){const p=S.pyramids.get(src.x+Phaser.Math.Between(-30,30),src.y-10,"pyramid");if(!p)return;p.setActive(true).setVisible(true);resetEF(p);p.type="minion";p.hp=1;p.maxHP=1;p.setScale(0.5).setVelocityY(GS.pyramidSpeed*0.6);p.spawnProtected=false;p.body.setSize(20,20).setOffset(5,5);p.setAlpha(0.6).setTint(0xaaaaff);}

function killEnemy(S,p,giveXP){
    if(!p||!p.active) return;
    const px=p.x,py=p.y,gs=GS;
    if(!gs) return;

    // Mini boss: hp <= 0 kontrolu — kacarsa odul yok
    if(p._isMiniBoss){
        // Sadece gercekten olduyse odul ver (hp<=0 = olduruldu, hp>0 = zemine degdi)
        const _mbDead = (p.hp <= 0);
        if(_mbDead){
            handleMiniBossDeath(S, p);
            gs.kills++;
            gs.score += Math.round(1200*(1+gs.combo*0.05));
        } else {
            // Kacti — sadece cleanup, odul yok
            const gs2=GS; if(gs2) gs2.miniBossActive=false;
            try{ if(p._hpBarGfx) p._hpBarGfx.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            try{ if(p._hpFillGfx) p._hpFillGfx.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            try{ if(p._hpBarTick) p._hpBarTick.remove(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }
        try{p.setAlpha(0);p.disableBody(true,true);}catch(e){console.warn("[NT] Hata yutuldu:",e)}
        return;
    }

    // Dusman rengini al
    const typeColors={normal:0xFF88CC,fast:0xFF6699,tank:0xAA55FF,shield:0x55BBFF,kamikaze:0xFFBB55,ghost:0xDDBBFF,
        split:0xFFEE44,swarm:0xFFBB66,elder:0xFFCC44,spinner:0xFF55DD,armored:0x9977FF,bomber:0xFF9966,
        stealth:0x44FFDD,healer:0x66FFAA,magnet:0xFFCC33,mirror:0xCCAAFF,berserker:0xFF7799,absorber:0x33EEFF,
        chain:0x77AAFF,freezer:0xAAEEFF,leech:0xFF77BB,titan:0xDD55FF,shadow:0xBB88FF,spiker:0xFFDD66,
        vortex:0x33FFCC,phantom:0xEEBBFF,rusher:0xFFAA55,splitter:0x88FF88,toxic:0xBBFF44,colossus:0xFF66AA,
        inferno:0xFF9977,glacier:0x66DDFF,phantom_tri:0xFF55FF,volt:0xFFFF66,obsidian:0xCC77FF,zigzag:0x88FF88};
    const deathColor=typeColors[p.type]||0xff88cc;

    // Tip bazli debris/kum renkleri — yeni piramitler icin ozel palet
    const debrisColMap={
        pyramid1:[0xFF4500,0xFFD700,0xFF6000,0xFFAA00],
        pyramid2:[0xDAA520,0x8B6914,0xC8960C,0xFFD700],
        pyramid3:[0xFF00FF,0x00FFFF,0xFFD700,0x8B00FF],
        pyramid4:[0x9400D3,0x4B0082,0x6A0DAD,0xCC44FF]
    };
    const sandCols=debrisColMap[p.type]||[0xddaa55,0xcc9944,0xeecc77,0xbbaa66];

    // ── AAA OLUM VFX — buyuk/elite dusmanlar icin ekstra efekt ──
    if(!p.isBoss&&p.type!=="minion"&&!p._groundKill&&_perfMode==="high"&&(p.elite||p.titan||p.colossus||p.elder||p.obsidian||p.glacier||p.inferno)){
        vfxEnemyDeath(S,px,py,p.type,p.scaleX||1);
    }

    // ── DEATH SCREEN SHAKE — subtle for normals, punchy for elites/big enemies ──
    if(!p.isBoss && p.type!=="minion" && !p._groundKill){
        const _shakeAmt = p.elite ? 0.0018 : (p.titan||p.colossus) ? 0.0025 : 0.0006;
        const _shakeDur = p.elite ? 80 : (p.titan||p.colossus) ? 100 : 40;
        if(!p.elite || Math.random()<0.7) S.cameras.main.shake(_shakeDur, _shakeAmt);
    }

    // ── DEATH COLOR RING — skip on mobile/low perf ──
    if(!p.isBoss && p.type!=="minion" && !p._groundKill && _perfMode==="high" && !_IS_MOBILE_EARLY){
        const _dr = S.add.graphics().setDepth(20);
        _dr.x=px; _dr.y=py;
        _dr.lineStyle(p.elite?2.5:1.5, deathColor, 0.80);
        _dr.strokeCircle(0, 0, Math.max(10, (p.displayWidth||40)*0.35));
        S.tweens.add({targets:_dr, scaleX:p.elite?3.5:2.5, scaleY:p.elite?3.5:2.5,
            alpha:0, duration:p.elite?220:150, ease:"Quad.easeOut",
            onComplete:()=>{try{_dr.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    }

    // ── EXPLODE ANIMASYONU ──
    // _groundKill=true ise zemin carpmasi zaten patlama yapti — tekrar yapma
    if(!p.isBoss&&p.type!=="minion"&&!p._groundKill){
        try{
            NT_SFX.play("pixel_explode");
            // [PERF REWRITE] Olum VFX tamamen pool tabanliya cevrildi.
            // Onceki kod her olumde 10-18 S.add.graphics() + tween yaratiyordu → frame drop.
            // Simdi: _POOL.get() → _pt() (otomatik release). Mobilde sadece sprite.
            doExplodeVFX(S, px, py, deathColor, p.scaleX||1);
            if(!_IS_MOBILE_EARLY && _POOL){
                const dw=Math.max(12,p.displayWidth||40);
                // ── Debris parcaciklari — pool, azaltilmis sayi ──
                const particleCount=p.elite?5:(p.titan||p.colossus||p.obsidian)?5:3;
                for(let i=0;i<particleCount;i++){
                    const dp=_POOL.get(16); if(!dp) break;
                    const ang=Phaser.Math.DegToRad(i*(360/particleCount)+Phaser.Math.Between(-15,15));
                    const spd=Phaser.Math.Between(30,75)*(p.elite?1.3:1);
                    let col;
                    if(p.volt) col=i%2===0?0xffee00:0xffffff;
                    else if(p.inferno) col=i%2===0?0xFF9977:0xFFCC88;
                    else if(p.glacier) col=i%2===0?0x44ccff:0xaaeeff;
                    else if(p.phantom_tri) col=i%2===0?0xcc44ff:0xffffff;
                    else if(p.obsidian) col=i%2===0?0x6600aa:0xcc88ff;
                    else col=i%2===0?deathColor:0xffffff;
                    const dpAng=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
                    dp.lineStyle(1.5,col,0.88);
                    dp.lineBetween(0,0,Math.cos(dpAng)*Phaser.Math.Between(2,p.elite?5:3),Math.sin(dpAng)*Phaser.Math.Between(2,3));
                    dp.setPosition(px,py);
                    _pt(S,dp,{x:px+Math.cos(ang)*spd,y:py+Math.sin(ang)*spd*0.7,
                        alpha:0,scaleX:0.1,scaleY:0.1,duration:Phaser.Math.Between(160,320),ease:"Quad.easeOut"});
                }
                // ── Kivilcim — pool, max 3 ──
                const sparkCount=p.elite?3:(p.titan||p.colossus)?3:2;
                for(let _sk=0;_sk<sparkCount;_sk++){
                    const _spk=_POOL.get(22); if(!_spk) break;
                    const _sa2=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
                    _spk.fillStyle(_sk%2===0?deathColor:0xffffff,0.9);
                    _spk.fillRect(-0.8,-3,1.6,6);
                    _spk.setPosition(px,py);
                    _spk.angle=Phaser.Math.Between(0,360);
                    _pt(S,_spk,{x:px+Math.cos(_sa2)*Phaser.Math.Between(10,dw*1.4),
                        y:py+Math.sin(_sa2)*Phaser.Math.Between(8,dw*0.9),
                        alpha:0,scaleY:0.12,duration:Phaser.Math.Between(100,200),ease:"Quad.easeOut"});
                }
                // ── Kum parcaciklari — pool, max 3 ──
                const sandCnt=p.elite?3:2;
                for(let _si=0;_si<sandCnt;_si++){
                    const _sd=_POOL.get(12); if(!_sd) break;
                    const _sa=Phaser.Math.DegToRad(Phaser.Math.Between(155,385));
                    const _ss=Phaser.Math.Between(12,45)*(p.elite?1.3:1);
                    const _sw=Phaser.Math.Between(2,p.elite?4:3);
                    _sd.lineStyle(Math.max(1,_sw*0.5),sandCols[_si%4],0.80);
                    _sd.lineBetween(0,0,Math.cos(_sa)*_sw,Math.sin(_sa)*_sw);
                    _sd.setPosition(px,py);
                    _pt(S,_sd,{x:px+Math.cos(_sa)*_ss,y:py+Math.sin(_sa)*_ss*0.4+4,
                        scaleX:0.08,scaleY:0.08,alpha:0,duration:Phaser.Math.Between(140,300),ease:"Quad.easeOut"});
                }
                // ── Zemin lekesi — TEK pool nesnesi ──
                const stain=_POOL.get(3); if(stain){
                    stain.fillStyle(0x110800,0.26);
                    stain.fillEllipse(0,0,dw*1.3,dw*0.25);
                    stain.setPosition(px,GROUND_Y-1);
                    _pt(S,stain,{alpha:0,duration:800,delay:200,ease:"Quad.easeIn"});
                }
                // ── vfxEnemyKillReward — sadece elite/boss ──
                if(p.elite||p.isBoss) vfxEnemyKillReward(S,px,py,p.type,p.elite,p.isBoss||false);
            }

            // ── YENI PIRAMIT OZEL OLUM VFX ──────────────────────────
            if(p.shadow&&!p.shadowSpawned&&giveXP){
                p.shadowSpawned=true;
                // Shadow olunce 1 yari boyutlu klon birakir
                S.time.delayedCall(120,()=>{
                    if(!GS||GS.gameOver) return;
                    const _sc=S.pyramids.get(px+Phaser.Math.Between(-25,25),py-5,"pyramid");
                    if(_sc){_sc.setActive(true).setVisible(true);resetEF(_sc);
                        _sc.type="shadow";_sc.shadow=true;_sc.shadowSpawned=true; // klon tekrar bolunmez
                        _sc.hp=_sc.maxHP=Math.max(1,Math.round(p.maxHP*0.35));
                        _sc.setDisplaySize(50,41).setTint(0xCCAAFF).setVelocityY(GS.pyramidSpeed*0.85);
                        _sc.spawnProtected=false;_sc._originalTint=0xCCAAFF;
                        _sc.body.setSize(22,22).setOffset(5,5);}
                });
            }
            if(p.phantom_tri&&!p._splitDone){
                // Phantom Tri: olunce 2 kucuk klon spawn eder
                p._splitDone=true;
                for(let si=0;si<2;si++){
                    const clone=S.pyramids.get(p.x+(si===0?-22:22),p.y,"pyramid");
                    if(clone){
                        clone.setActive(true).setVisible(true);
                        resetEF(clone);
                        clone.hp=clone.maxHP=Math.max(1,Math.floor((p.maxHP||4)/3));
                        clone.type="phantom_tri_shard";
                        clone.setDisplaySize(42,34).setTint(0xcc44ff).setAlpha(0.65);
                        clone.setVelocityY(GS.pyramidSpeed*0.9);
                        clone._isShard=true;
                        clone.body.enable=true;
                        S.time.delayedCall(350,()=>{if(clone&&clone.active)clone.spawnProtected=false;});
                    }
                }
            }
            if(p.obsidian && !_IS_MOBILE_EARLY){
                // Kor-turuncu kivilcim sicramasi — atesli toz bulutu
                for(let _f=0;_f<6;_f++){
                    const _fa=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
                    const _fs=Phaser.Math.Between(30,80);
                    const _fg=S.add.graphics().setDepth(20);
                    _fg.x=px; _fg.y=py;
                    _fg.fillStyle(_f%2===0?0xFF4500:0xFFD700,0.9);
                    _fg.fillTriangle(-1,-4,1,-4,0,4);
                    S.tweens.add({targets:_fg,
                        x:px+Math.cos(_fa)*_fs, y:py+Math.sin(_fa)*_fs*0.6,
                        angle:Phaser.Math.Between(-180,180),alpha:0,scaleX:0.1,scaleY:0.1,
                        duration:Phaser.Math.Between(220,380),ease:"Quad.easeOut",
                        onComplete:()=>_fg.destroy()});
                }
            }
            if((p.phantom_tri||p.volt) && !_IS_MOBILE_EARLY){
                // Gokkusagi toz bulutu — her parcacik farkli renk, genis acilma
                const rbCols=[0xFF00FF,0x00FFFF,0xFFD700,0x8B00FF,0xFF8C00];
                for(let _r=0;_r<8;_r++){
                    const _ra=Phaser.Math.DegToRad(_r*45+Phaser.Math.Between(-10,10));
                    const _rs=Phaser.Math.Between(25,90);
                    const _rc=S.add.circle(px,py,Phaser.Math.Between(3,7),rbCols[_r%rbCols.length],0.85).setDepth(20);
                    S.tweens.add({targets:_rc,
                        x:px+Math.cos(_ra)*_rs, y:py+Math.sin(_ra)*_rs*0.6,
                        alpha:0,scaleX:0.05,scaleY:0.05,
                        duration:Phaser.Math.Between(280,500),ease:"Quad.easeOut",
                        onComplete:()=>_rc.destroy()});
                }
            }
            if((p.obsidian||p.glacier) && !_IS_MOBILE_EARLY){
                // Mor enerji patlamasi + karanlik duman halkasi
                const darkRing=S.add.graphics().setDepth(19);
                darkRing.x=px; darkRing.y=py;
                darkRing.lineStyle(3,0x9400D3,0.9); darkRing.strokeCircle(0,0,10);
                S.tweens.add({targets:darkRing,scaleX:5,scaleY:5,alpha:0,
                    duration:350,ease:"Quad.easeOut",onComplete:()=>darkRing.destroy()});
                // Ikinci mor halka
                const darkRing2=S.add.graphics().setDepth(18);
                darkRing2.x=px; darkRing2.y=py;
                darkRing2.lineStyle(2,0x4B0082,0.7); darkRing2.strokeCircle(0,0,18);
                S.tweens.add({targets:darkRing2,scaleX:4,scaleY:4,alpha:0,
                    duration:500,ease:"Quad.easeOut",onComplete:()=>darkRing2.destroy()});
            }

            doExplodeVFX(S, px, py, deathColor, p.scaleX||1);
            p.setAlpha(0);
            p.disableBody(true,true);
            if(p._shadowGfx){try{p._shadowGfx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}p._shadowGfx=null;}
        }catch(e){p.disableBody(true,true);}
    } else {
        // Boss olumu — EPIK SLOW-MO WOW MOMENT
        if(p.isBoss){
            // Slow-motion patlamasi — try/finally ile timeScale her zaman sifirlanir
            S.time.timeScale=0.18;
            const resetTimeScale=()=>{ try{ if(S&&S.time) S.time.timeScale=1.0; }catch(e){console.warn("[NT] Hata yutuldu:",e)} };
            S.time.delayedCall(1200,resetTimeScale);
            S.cameras.main.shake(100,0.012);
            
            S.cameras.main.zoomTo(1.04,160,"Quad.easeOut");
            S.time.delayedCall(200,()=>S.cameras.main.zoomTo(1.0,500,"Quad.easeIn"));
            // Buyuk halka patlamasi
            for(let ri=0;ri<5;ri++){
                S.time.delayedCall(ri*60,()=>{
                    const br=S.add.graphics().setDepth(25);
                    br.x=px; br.y=py;
                    br.lineStyle(Math.max(1,4-ri), 0xffcc00, 1.0);
                    br.strokeCircle(0,0,15+ri*18);
                    S.tweens.add({targets:br,scaleX:16,scaleY:16,alpha:0,
                        duration:800,ease:"Quad.easeOut",onComplete:()=>br.destroy()});
                });
            }
            for(let i=0;i<18;i++){
                S.time.delayedCall(i*35,()=>{
                    const bx=px+Phaser.Math.Between(-50,50),by=py+Phaser.Math.Between(-40,40);
                    const bf=S.add.graphics().setDepth(22);
                    bf.x=bx; bf.y=by;
                    bf.fillStyle(i%3===0?0xffcc00:i%3===1?0xff4400:0xffffff,0.75);
                    bf.fillCircle(0,0,Phaser.Math.Between(3,10));
                    S.tweens.add({targets:bf,scaleX:2.5,scaleY:2.5,alpha:0,
                        duration:280,ease:"Quad.easeOut",onComplete:()=>bf.destroy()});
                });
            }
            const bsw=S.add.graphics().setDepth(21);
            bsw.x=px; bsw.y=py;
            bsw.lineStyle(5,0xffcc00,1.0); bsw.strokeCircle(0,0,12);
            S.tweens.add({targets:bsw,scaleX:22,scaleY:22,alpha:0,
                duration:800,ease:"Quad.easeOut",onComplete:()=>bsw.destroy()});
            S.time.delayedCall(200,()=>{
                showHitTxt(S,px,py-40,CURRENT_LANG==="tr"?"BOSS GELIYOR!":"BOSS SPAWNED!","#ffcc00",true);
            });
        }
        p.disableBody(true,true);
        if(p._shadowGfx){try{p._shadowGfx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}p._shadowGfx=null;}
    }

    if(p.split&&giveXP){for(let i=0;i<2;i++){const sp2=S.pyramids.get(px+Phaser.Math.Between(-20,20),py-5,"pyramid");if(sp2){sp2.setActive(true).setVisible(true);resetEF(sp2);sp2.type="minion";sp2.hp=1;sp2.maxHP=1;sp2.setScale(0.55).setVelocityY(GS.pyramidSpeed*0.65);sp2.spawnProtected=false;sp2.setTint(0xffcc44);sp2.body.setSize(20,20).setOffset(5,5);}}}
    if(p.splitter&&giveXP){for(let i=0;i<3;i++){const ss=S.pyramids.get(px+Phaser.Math.Between(-22,22),py-5,"pyramid");if(ss){ss.setActive(true).setVisible(true);resetEF(ss);ss.type="minion";ss.hp=1;ss.maxHP=1;ss.setScale(0.48).setVelocityY(GS.pyramidSpeed*0.72);ss.spawnProtected=false;ss.setTint(0xff4422);ss.body.setSize(18,18).setOffset(5,5);}}}

    // ADIM 3: Heavy Cannon splash hasari — oldurulen dusmanin yakinindakilere %40 hasar
    if(gs.activeWeapon === "heavy_cannon" && giveXP && !p._isMiniBoss){
        const _splashList = S._activeEnemies || [];
        _splashList.forEach(e => {
            if(!e || !e.active || e === p) return;
            const dx = e.x - px, dy = e.y - py;
            if(dx*dx + dy*dy < 60*60) applyDmg(S, e, gs.damage * 0.28, false); // [BALANCE] 0.40→0.28: gec oyun kume dominansi azaltildi
        });
    }

    // [BALANCE] Sandik sadece guclu dusmanlardan duser — normal dusmandan kaldirildi
    const isEl=p.elite, isBO=p.isBoss;
    const isStrong=isBO||isEl||p.elder||p.titan||p.colossus||p.armored||p._isMiniBoss||p.obsidian;
    // [FIX] Chest and rewards only on actual player kill (giveXP=true), not on ground escape
    const dc=(isBO?0.55:p._isMiniBoss?0.28:isEl?0.04:p.elder?0.03:p.titan||p.colossus?0.02:p.obsidian?0.015:p.glacier?0.008:p.inferno||p.volt?0.008:p.armored?0.008:0);
    if(giveXP&&isStrong&&Math.random()<dc) spawnChest(S,px,py-10);

    if(p.isBoss){
        gs.bossActive=false; gs._bossKills=(gs._bossKills||0)+1;
        NT_SFX.setMusicState("gameplay", 3.0); // boss oldu — gameplay muzigine geri don
        if(giveXP){
            const crystalAmt = gs._relicVoidCrystal ? 2 : 1;
            addCrystal(crystalAmt, "boss_kill");
            // [BALANCE v2] Boss XP: max 3 orbs, delayed, value capped
            const bossOrbCount = Math.min(3, 1 + Math.floor(gs.level/20));
            for(let i=0;i<bossOrbCount;i++)S.time.delayedCall(i*200,()=>{spawnXpOrb(S,px+Phaser.Math.Between(-30,30),py+Phaser.Math.Between(-20,20),"xp_gold",Math.round(3+gs.level*0.25));});
        }
    }
    if(!giveXP) return;
    gs.kills++;
    // Komik quip balonu — her öldürmede karakterden sohbet balonu çıkar
    spawnTriangleQuip(S, gs.kills);
    // Elite/boss kill sayaci — XP hesaplamasinda kullanilir
    if(p.elite||p.elder||p.titan||p.colossus||p.obsidian||p.glacier||p.inferno||p.volt)
        gs._eliteKills = (gs._eliteKills||0) + 1;

    // Elite/Titan kill VFX
    if(p.elite&&!p.isBoss){
        showHitTxt(S,px,py-22,CURRENT_LANG==="tr"?"★ ELIT OLDURULDU ★":"★ ELITE KILLED ★","#ffdd00",true);
        spawnKillText(S, px, py-44);
        S.cameras.main.shake(45,0.007);
        for(let ei=0;ei<10;ei++){
            const eang=Phaser.Math.DegToRad(ei*36);
            const esp=S.add.graphics().setDepth(24);
            esp.x=px; esp.y=py;
            esp.fillStyle(0xffdd00,0.95); esp.fillRect(-2,-2,4,4);
            S.tweens.add({targets:esp,
                x:px+Math.cos(eang)*Phaser.Math.Between(30,80),
                y:py+Math.sin(eang)*Phaser.Math.Between(20,60),
                alpha:0,scaleX:0.1,scaleY:0.1,
                duration:Phaser.Math.Between(250,480),ease:"Quad.easeOut",
                onComplete:()=>esp.destroy()});
        }
    } else if(p.titan||p.colossus||p.elder){
        showHitTxt(S,px,py-22,CURRENT_LANG==="tr"?"DEV YIKILDI!":"TITAN DOWN!","#aa44ff",true);
        S.cameras.main.shake(60,0.008);
    }

    // Elite Hunt bonus
    if((p.elite||p.isBoss)&&gs._eliteHuntCount>0){
        gs._eliteHuntCount--;
        showHitTxt(S,px,py-20,CURRENT_LANG==="tr"?"ELIT AV BONUS!":"ELITE HUNT BONUS!","#ffdd44",true);
        const gvBonus=Math.round((p.isBoss?6:p.elite?3:1)*gs.goldMult*2);
        gs.gold+=gvBonus; PLAYER_GOLD+=gvBonus; secureSet("nt_gold",PLAYER_GOLD);
    }
    // Score
    const killScore=p.isBoss?2000:p.elite?300:p.elder||p.titan||p.colossus?200:p.obsidian?180:p.glacier?110:p.inferno?100:p.volt?90:p.phantom_tri?85:p.tank||p.armored?80:50;
    if(GS&&GS._soulHarvest>0){GS._soulHarvest--;GS.health=Math.min(GS.health+1,GS.maxHealth);}
    gs.score+=Math.round(killScore*(1+gs.combo*0.05));
    const milestoneKills=[25,50,100,200,500,1000];
    if(milestoneKills.includes(gs.kills)){
        const col=gs.kills>=200?"#ffcc00":gs.kills>=100?"#ff8800":"#44ff88";
        showHitTxt(S,180,240,"KILLS: "+gs.kills+"!",col,true);
        S.cameras.main.shake(60,0.010);
    }

    // XP DROP — erken oyun bol XP (hizli level), gec oyun dengeli
    if(S.xpOrbs.length < 40){
        // [BALANCE v2] lvBonus azaltildi — erken levellerde asiri XP patlama onlenir
        const lvBonus = gs.level <= 8 ? gs.level * 0.08
                      : gs.level <= 15 ? 0.65 + (gs.level-8) * 0.04
                      : Math.min(1.2, 0.93 + (gs.level-15) * 0.02);
        const baseXP =
            p.swarm||p.type==="minion" ? 0.5 :
            p.isBoss   ? 10 :
            p.titan||p.colossus ? 5 :
            p.elite||p.elder    ? 3 :
            p.obsidian||p.glacier||p.inferno||p.volt||p.phantom_tri ? 2 :
            p.tank||p.armored   ? 1.5 : 1.2;

        const xpVal = Math.max(1, Math.round((baseXP + lvBonus) * Math.min(gs.xpMult, 1.30) * (gs.comboXpBoost||1.0) * 10)/10); // [v10.x] xpMult cap raised 1.04→1.30 (xpboost redesigned)

        const xpT = p.isBoss ? "xp_gold"
                  : p.titan||p.colossus ? "xp_red"
                  : p.elite||p.elder    ? "xp_red"
                  : xpVal >= 3          ? "xp_purple"
                  : xpVal >= 2          ? "xp_green"
                  : "xp_blue";

        const orbCount = p.isBoss ? 2
                       : p.titan||p.colossus||p.elite||p.elder ? 1
                       : 1;
        const perOrb = Math.ceil(xpVal / orbCount);
        for(let i=0;i<orbCount;i++){
            if(S.xpOrbs.length >= 40) break;
            const _x=px+Phaser.Math.Between(-14,14);
            const _y=Math.min(py,430)+Phaser.Math.Between(-10,10);
            S.time.delayedCall(i*90, ()=>spawnXpOrb(S,_x,_y,xpT,perOrb));
        }
    }

    // Health drop — rare, only from elites/tanks
    const healDropChance = p.isBoss?0:p.elite?0.07:p.obsidian?0.06:p.tank||p.armored?0.06:p.glacier||p.inferno?0.05:p.swarm||p.type==="minion"?0:0.025;
    if(Math.random()<healDropChance){
        const hDrop=S.add.image(px,py-8,"tex_heart").setDepth(18).setScale(1.0);
        let hLife=5500;
        let hVY=-65;
        let hFloatT=0;
        // Pulse scale animasyonu
        S.tweens.add({targets:hDrop,scaleX:1.12,scaleY:1.12,duration:420,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
        // Glow + healing aura parcaciklari
        const hGlow=S.add.graphics().setDepth(17);
        let hAuraT=0;
        const hTick=S.time.addEvent({delay:16,loop:true,callback:()=>{
            hLife-=16; hFloatT+=0.1; hAuraT+=0.07;
            if(!hDrop.scene||hLife<=0||!GS||GS.gameOver){
                hTick.remove();
                try{hDrop.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                try{hGlow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                return;
            }
            if(!S.player||!S.player.active) return;
            // Gravity + floating
            hVY+=7;
            hDrop.y+=hVY*0.016;
            if(hDrop.y>=GROUND_Y-12){
                hDrop.y=GROUND_Y-12;
                hVY=Math.sin(hFloatT)*8; // yerde hafif ziplama
            }
            // Glow — kalin kirmizi + ince yesil halka
            hGlow.clear();
            const glA=0.35+Math.sin(hAuraT*2.5)*0.18;
            hGlow.fillStyle(0xff2244,glA*0.08); hGlow.fillCircle(hDrop.x,hDrop.y,18);
            hGlow.lineStyle(2.5,0xff4466,glA); hGlow.strokeCircle(hDrop.x,hDrop.y,14+Math.sin(hAuraT*2)*2);
            hGlow.lineStyle(1.5,0xff8899,glA*0.5); hGlow.strokeCircle(hDrop.x,hDrop.y,20+Math.sin(hAuraT*1.4)*3);
            // Healing aura parcacigi — her ~40 frame'de bir
            if(Math.random()<0.08){
                const _ang=Math.random()*Math.PI*2;
                const _r=12+Math.random()*8;
                const _ap=S.add.graphics().setDepth(17);
                _ap.x=hDrop.x+Math.cos(_ang)*_r; _ap.y=hDrop.y+Math.sin(_ang)*_r;
                _ap.lineStyle(1.5,Math.random()<0.5?0xff4466:0xff8899,0.85);
                _ap.lineBetween(0,0,1,2);
                S.tweens.add({targets:_ap,y:_ap.y-Phaser.Math.Between(8,20),alpha:0,
                    duration:Phaser.Math.Between(300,550),ease:"Quad.easeOut",onComplete:()=>_ap.destroy()});
            }
            // Oyuncuya yakinsa topla
            const hdx=S.player.x-hDrop.x,hdy=(S.player.y-20)-hDrop.y;
            if(hdx*hdx+hdy*hdy<50*50){
                GS.health=Math.min(GS.maxHealth,GS.health+3);
                GS._healFlash=400;
                try{ NT_SFX.play("upgrade_heal"); }catch(_){} // [FIX] kalp sesi — +3 can alirken
                showHitTxt(S,hDrop.x,hDrop.y-14,"+3 ❤","#ff8888",false);
                hTick.remove();
                S.tweens.killTweensOf(hDrop);
                // Collect burst — yesil/kirmizi isik patlamasi
                for(let _hi=0;_hi<6;_hi++){
                    const _ha=Phaser.Math.DegToRad(_hi*60+Phaser.Math.Between(-15,15));
                    const _hs=Phaser.Math.Between(20,45);
                    const _hc=_hi%2===0?0xff4466:0xff8899;
                    const _hp=S.add.graphics().setDepth(19);
                    _hp.x=hDrop.x; _hp.y=hDrop.y;
                    _hp.lineStyle(1.5,_hc,0.9); _hp.lineBetween(-1,-1,1,1);
                    S.tweens.add({targets:_hp,x:hDrop.x+Math.cos(_ha)*_hs,y:hDrop.y+Math.sin(_ha)*_hs*0.6,
                        alpha:0,scaleX:0,scaleY:0,duration:Phaser.Math.Between(180,320),ease:"Quad.easeOut",onComplete:()=>_hp.destroy()});
                }
                // Flash ring
                const _hfl=S.add.graphics().setDepth(19);
                _hfl.lineStyle(3,0xff4466,0.9); _hfl.strokeCircle(hDrop.x,hDrop.y,8);
                S.tweens.add({targets:_hfl,scaleX:4,scaleY:4,alpha:0,duration:250,onComplete:()=>_hfl.destroy()});
                S.tweens.add({targets:hDrop,scaleX:2.5,scaleY:2.5,alpha:0,duration:180,ease:"Back.easeIn",onComplete:()=>{try{hDrop.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
                try{hGlow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                return;
            }
            if(hLife<1200){const fa=hLife/1200;hDrop.setAlpha(fa);hGlow.setAlpha(fa);}
        }});
    }

    // [v10.1] Altin dusurme — daha cesitli ve zaman bazli hafif skala
    // Normal dusman: 1 altin (her zaman sabit — tahmin edilebilir ekonomi)
    // Elite/elder: 2-3, boss: 8, ozel tipler: 2
    // [v10.1] Altin ekonomisi: zaman bonusu daha yavas buyuyor, exploit onlendi
    // Eski: her 3dk +%15 (max +%60 @ 12dk) → abusable with gold rush event
    // Yeni: her 4dk +%12 (max +%48 @ 16dk) → daha yavas buyume, anlamli secim
    const timeMult = 1.0 + Math.min(0.48, Math.floor(gs.t / 240000) * 0.12);
    const gV=Math.max(1,Math.round(
        (p.isBoss?10 : p.elite?5 : p.elder||p.titan||p.colossus?3
          : p.obsidian?2 : p.glacier||p.inferno||p.volt?2 : 2)
        * gs.goldMult * timeMult
    ));
    gs.gold+=gV; PLAYER_GOLD+=gV; secureSet("nt_gold",PLAYER_GOLD);
    if(gV>0) NT_SFX.play("gold");
    if(gV>0){
        const c=S.add.image(px+Phaser.Math.Between(-15,15),py-5,"xp_coin").setDepth(18);
        S.tweens.add({targets:c,y:c.y-18,alpha:0,duration:520,onComplete:()=>c.destroy()});
        // ── Gold floating text — only for notable amounts
        if(gV>=3){ spawnGoldText(S, px+Phaser.Math.Between(-8,8), py-18, gV); }
    }
    spawnHitDebris(S,px,py-10,p.type,false);
    // Fiziksel debris — parcalar zemine duser
    spawnFallingDebris(S,px,py,p.type,p.isBoss||p.titan||p.colossus);
    // [OPT] GS evolution flag'leri kullan — EVOLUTIONS.find'dan kacin
    // [v11] REGEN — on-kill combat healing
    // Lv1: her 4. oldurmede +1 HP | Lv2: her 3. oldurmede +1 HP
    if((UPGRADES.regen?.level||0) > 0 && gs.health < gs.maxHealth){
        if(!gs._regenKillCount) gs._regenKillCount = 0;
        gs._regenKillCount++;
        // REGEN BUFF: threshold scales down with level — more useful late game
        // Lv1: kills needed = max(3, 7 - floor(level/4))  e.g. lv1=7, lv8=5, lv16=3
        // Lv2: kills needed = max(2, 5 - floor(level/5))  e.g. lv1=5, lv10=3, lv20=2
        const _lvBonus = Math.floor((gs.level||1) / (UPGRADES.regen.level >= 2 ? 5 : 4));
        const threshold = UPGRADES.regen.level >= 2
            ? Math.max(2, 5 - _lvBonus)
            : Math.max(3, 7 - _lvBonus);
        if(gs._regenKillCount >= threshold){
            gs._regenKillCount = 0;
            gs.health = Math.min(gs.maxHealth, gs.health + 1);
            gs._healFlash = 200;
        }
    }

    if(gs._evoCryoField&&!p.frozen){
        const _cryoList=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
        for(let _ci=0;_ci<_cryoList.length;_ci++){
            const e=_cryoList[_ci];if(e===p||!e||!e.active)continue;
            const dx=e.x-px,dy=e.y-py;if(dx*dx+dy*dy<80*80)freezeEnemy(S,e);
        }
    }
    if(gs._evoPlagueBearer&&p.toxic) spawnPoisonCloud(S,px,py);

    // [v11] SPLIT SHOT — oldurme tetikli fragment spawn
    // splitLevel Lv1: 2 fragment %50 hasar, Lv2: 2 fragment %65 hasar, Lv3: 3 fragment %65 hasar
    // Boss ve mini-boss oldurmesi de tetikler (guclu odul)
    if((gs.splitLevel||0) > 0 && p.type !== "minion"){
        const fragCount = gs.splitLevel >= 3 ? 3 : 2;
        const fragDmgMult = gs.splitLevel >= 2 ? 0.65 : 0.50;
        const bspd = gs.bulletSpeed || 480;
        for(let _fi=0; _fi<fragCount; _fi++){
            const spreadAngle = (_fi - (fragCount-1)/2) * 0.45; // fan spread
            const fvx = Math.sin(spreadAngle) * bspd * 0.6;
            const fvy = -bspd * 0.85;
            const fb = fireBulletRaw(S, px, py, fvx, fvy, fragDmgMult, 0xcc44ff, "default");
            if(fb){
                fb._isSplitFragment = true;
                fb._pierced = 0; // fragments can pierce normally
            }
        }
        // Kucuk VFX — mor kivilcim patlamasi
        const splitFx = S.add.graphics().setDepth(20);
        splitFx.lineStyle(1.5, 0xcc44ff, 0.85);
        splitFx.strokeCircle(px, py, 6);
        S.tweens.add({targets:splitFx, scaleX:3, scaleY:3, alpha:0, duration:180,
            ease:"Quad.easeOut", onComplete:()=>{try{splitFx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    }
}

// ── YARDIMCILAR ──────────────────────────────────────────────
// [OPT] _activeEnemies cache kullan — getMatching yeni array olusturur
function nearestE(S,x,y,maxR=999){
    let best=null,bd=Infinity;
    const _ne=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
    for(let _ni=0;_ni<_ne.length;_ni++){
        const p=_ne[_ni];
        if(!p||!p.active||p.lock||p.spawnProtected) continue;
        const dx=p.x-x,dy=p.y-y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<maxR&&d<bd){bd=d;best=p;}
    }
    return best;
}
// [FREEZE BUG FIX] Dusman hizi artik gercekten sifirlaniyor + buz overlay eklendi
function freezeEnemy(S,e){
    if(!e||!e.active||e.frozen)return;
    e.frozen=true;
    e.setTint(0x88ddff);
    if(e.body){
        e._frozenVelX=e.body.velocity.x;
        e._frozenVelY=e.body.velocity.y;
        e.body.velocity.set(0,0);
    }
    const freezeDur=1500+UPGRADES.freeze.level*200;

    // ── BUZ PATLAMA efekti ──
    const iceFlash=S.add.graphics().setDepth(22);
    iceFlash.x=e.x; iceFlash.y=e.y;
    iceFlash.lineStyle(2,0xffffff,0.85); iceFlash.strokeCircle(0,0,14);
    iceFlash.lineStyle(1.5,0x88eeff,0.7); iceFlash.strokeCircle(0,0,8);
    S.tweens.add({targets:iceFlash,scaleX:2.8,scaleY:2.8,alpha:0,duration:200,ease:"Quad.easeOut",onComplete:()=>iceFlash.destroy()});

    // Buz kristal parcaciklari — daha buyuk, daha cok
    for(let i=0;i<12;i++){
        const ang=Phaser.Math.DegToRad(i*30+Phaser.Math.Between(-10,10));
        const spd=Phaser.Math.Between(28,60);
        const sz=Phaser.Math.Between(3,7);
        const ic=S.add.graphics().setDepth(20);
        ic.fillStyle(i%2===0?0xaaeeff:0xffffff,0.9);
        ic.fillRect(-sz/2,-sz,sz,sz*2); // buz shard sekli
        ic.x=e.x+Phaser.Math.Between(-8,8);
        ic.y=e.y+Phaser.Math.Between(-8,8);
        S.tweens.add({targets:ic,
            x:ic.x+Math.cos(ang)*spd,
            y:ic.y+Math.sin(ang)*spd*0.65,
            alpha:0,scaleY:0.1,angle:Phaser.Math.Between(-90,90),
            duration:Phaser.Math.Between(280,500),
            ease:"Quad.easeOut",
            onComplete:()=>ic.destroy()});
    }

    // Buz overlay halkasi — cok daha buyuk ve parlak
    const iceRing=S.add.graphics().setDepth(19);
    iceRing.x=e.x; iceRing.y=e.y;
    iceRing.lineStyle(4,0x44ddff,1.0); iceRing.strokeCircle(0,0,18);
    iceRing.lineStyle(2,0xaaffff,0.8); iceRing.strokeCircle(0,0,28);
    iceRing.fillStyle(0x88ddff,0.28); iceRing.fillCircle(0,0,18);
    S.tweens.add({targets:iceRing,scaleX:2.2,scaleY:2.2,alpha:0,duration:400,ease:"Quad.easeOut",onComplete:()=>iceRing.destroy()});

    // [VFX] Kalici buz kristali — freeze suresince dusman uzerinde doner — buyutuldu
    const iceCrystal=S.add.graphics().setDepth(20);
    // Ana kristal capraz
    iceCrystal.fillStyle(0x44ddff,0.85); iceCrystal.fillRect(-4,-14,8,28);
    iceCrystal.fillStyle(0x88eeff,0.70); iceCrystal.fillRect(-14,-4,28,8);
    // Kosegen kollar
    iceCrystal.fillStyle(0xaaffff,0.55); iceCrystal.fillRect(-10,-10,6,6);
    iceCrystal.fillStyle(0xaaffff,0.55); iceCrystal.fillRect(4,-10,6,6);
    iceCrystal.fillStyle(0xaaffff,0.55); iceCrystal.fillRect(-10,4,6,6);
    iceCrystal.fillStyle(0xaaffff,0.55); iceCrystal.fillRect(4,4,6,6);
    // Merkez parlama
    iceCrystal.fillStyle(0xffffff,0.9); iceCrystal.fillCircle(0,0,4);
    iceCrystal.x=e.x; iceCrystal.y=e.y-16;
    S.tweens.add({targets:iceCrystal,angle:360,duration:900,repeat:-1,ease:"Linear"});
    S.tweens.add({targets:iceCrystal,scaleX:0.75,scaleY:0.75,duration:350,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
    // Pulse alpha
    S.tweens.add({targets:iceCrystal,alpha:0.6,duration:500,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

    // Dusman uzerinde donma overlay
    const iceOverlay=S.add.graphics().setDepth(15);
    // Dikdortgen yerine elips — daha dogal gorunum
    iceOverlay.fillStyle(0x88ddff,0.22); iceOverlay.fillEllipse(e.x,e.y,32,26);
    iceOverlay.lineStyle(1.5,0x44ddff,0.65); iceOverlay.strokeEllipse(e.x,e.y,32,26);
    S.tweens.add({targets:iceOverlay,alpha:0.08,duration:700,yoyo:true,repeat:-1});

    S.time.delayedCall(freezeDur,()=>{
        if(e.active){
            e.frozen=false;
            e.clearTint();
            if(e.body&&e._frozenVelX!==undefined){
                e.body.velocity.set(e._frozenVelX||0, e._frozenVelY||80);
            }
        }
        try{iceCrystal.destroy();}catch(ex){}
        try{iceOverlay.destroy();}catch(ex){}
    });
}
function damagePlayer(S){
    const gs=GS;if(!gs||gs.invincible||gs.gameOver)return;
    if(graceCheck(S)) return;
    gs.invincible=true;gs._invT=0;gs._knockbackTimer=350;
    // [ADIM 4] Combo Heart relic — combo 15+ iken hasar 1 yerine 0.5 (min 1 kesilir)
    if(gs._relicComboHeart && gs.combo >= 15){
        // Hasar almaz ama combo duser
        gs.combo = Math.max(0, gs.combo - 5);
        gs.invincible=false;
        return;
    }
    gs.health--;
    NT_SFX.play("player_hurt");
    S.cameras.main.shake(14,0.003);
    // Komik vurus mesaji
    try{
        const _hm=_nextHitMsg();
        const _px=S.player?S.player.x:180;
        showHitTxt(S,_px,GROUND_Y-80,_hm,"#ffaa22",true);
    }catch(_){}
    // ── AAA PLAYER HURT VFX ──
    vfxPlayerHurt(S);
    tickNearDeath(S);
    if(gs.health<=0){
        // [ADIM 6d] Phoenix Ash relic — otomatik dirilis
        if(gs._relicPhoenixAsh && !gs._phoenixUsed){
            gs._phoenixUsed = true;
            gs.health = Math.ceil(gs.maxHealth * 0.30);
            gs._healFlash = 800;
            gs.invincible = true; gs._invT = 0;
            S.cameras.main.shake(200, 0.025);
            S.cameras.main.zoomTo(1.08, 150, "Quad.easeOut");
            S.time.delayedCall(150, ()=>S.cameras.main.zoomTo(1.0, 400, "Quad.easeIn"));
            showHitTxt(S, 180, 200, "PHOENIX!", "#ff8800", true);
            const plx=S.player.x, ply=S.player.y;
            for(let ri=0;ri<12;ri++){
                S.time.delayedCall(ri*30,()=>{
                    const ang=Phaser.Math.DegToRad(ri*30);
                    const rp=S.add.graphics().setDepth(25);
                    rp.x=plx; rp.y=ply;
                    rp.fillStyle(0xff8800,0.95); rp.fillRect(-2,-2,4,4);
                    S.tweens.add({targets:rp,
                        x:plx+Math.cos(ang)*Phaser.Math.Between(40,80),
                        y:ply+Math.sin(ang)*Phaser.Math.Between(30,60),
                        alpha:0,scaleX:0.1,scaleY:0.1,
                        duration:Phaser.Math.Between(300,550),ease:"Quad.easeOut",
                        onComplete:()=>rp.destroy()});
                });
            }
            S.time.delayedCall(2000, ()=>{ if(GS){ GS.invincible=false; GS._invT=0; }});
            return;
        }
        if(gs.extraLife&&!gs.usedExtraLife){
            gs.usedExtraLife=true;
            gs.health=Math.ceil(gs.maxHealth*0.3);
            gs._healFlash=800;

            // [VFX WOW] DIRILIS — sinematik efekt
            S.cameras.main.shake(200,0.025);
            S.cameras.main.zoomTo(1.10,150,"Quad.easeOut");
            S.time.delayedCall(150,()=>S.cameras.main.zoomTo(1.0,400,"Quad.easeIn"));
            const plx=S.player.x, ply=S.player.y;
            for(let rv=0;rv<3;rv++){
                S.time.delayedCall(rv*80,()=>{
                    const rr=S.add.graphics().setDepth(25);
                    rr.x=plx; rr.y=ply;
                    rr.lineStyle(3,0xffdd00,1.0); rr.strokeCircle(0,0,10+rv*12);
                    S.tweens.add({targets:rr,scaleX:5,scaleY:5,alpha:0,
                        duration:500,ease:"Quad.easeOut",onComplete:()=>rr.destroy()});
                });
            }
            for(let ri=0;ri<16;ri++){
                S.time.delayedCall(ri*25,()=>{
                    const ang=Phaser.Math.DegToRad(ri*(360/16));
                    const rp=S.add.graphics().setDepth(25);
                    rp.x=plx; rp.y=ply;
                    rp.fillStyle(0xffdd00,0.95); rp.fillRect(-2,-2,4,4);
                    S.tweens.add({targets:rp,
                        x:plx+Math.cos(ang)*Phaser.Math.Between(40,90),
                        y:ply+Math.sin(ang)*Phaser.Math.Between(30,70),
                        alpha:0,scaleX:0.1,scaleY:0.1,
                        duration:Phaser.Math.Between(350,600),ease:"Quad.easeOut",
                        onComplete:()=>rp.destroy()});
                });
            }
            S.time.timeScale=0.3;
            S.time.delayedCall(800,()=>{ S.time.timeScale=1.0; });
            showHitTxt(S,180,200,L("extraLife2"),"#ffdd00",true);
            return;
        }
        // Kristal ile dirilis secenegi
        if(PLAYER_CRYSTAL >= CRYSTAL_COSTS.revive && !gs._crystalReviveUsed){
            showCrystalRevivePrompt(S);
            return;
        }
        if(NT_Monetization.isBoosterActive("autorevive")){NT_Monetization.consumeBooster("autorevive");gs.health=Math.min(gs.maxHealth,3);gs.invincible=true;gs._invT=0;S.time.delayedCall(5000,()=>{gs.invincible=false;});S.cameras.main.shake(180,0.020);showHitTxt(S,180,200,"AUTO-REVIVE!","#ff4466",true);return;}
        gameOver(S);
    }
}

function showCrystalRevivePrompt(S){
    const gs=GS; if(gs.gameOver) return;
    S.physics.pause();
    if(S.spawnEvent) S.spawnEvent.paused=true;
    const W=360, H=640, CX=W/2;
    const objs=[]; const A=o=>{if(o)objs.push(o);return o;};

    // Overlay
    A(S.add.rectangle(CX,H/2,W,H,0x000000,0.85).setDepth(900).setInteractive());

    // Panel sprite
    const pm=NT_Measure(S,"ui_pause_win",280);
    const panelCY=H/2-8;
    const sprite=A(S.add.image(CX,panelCY,"ui_pause_win").setScale(pm.sc).setDepth(901));
    const pTop=panelCY-pm.H/2, pBot=panelCY+pm.H/2;
    const stripCY    = pTop + pm.stripH/2;
    const contentTop = pTop + pm.stripH + 10;
    const contentBot = pBot - pm.goldH  - 8;
    const btnCY      = pBot - pm.goldH/2;
    const D=902;

    // Panel pop-in
    sprite.setScale(pm.sc*0.05).setAlpha(0);
    S.tweens.add({targets:sprite,scaleX:pm.sc,scaleY:pm.sc,alpha:1,duration:200,ease:"Back.easeOut"});

    // Baslik
    A(S.add.text(CX,stripCY,"✦  "+L("goRevivePrompt"),
        NT_STYLE.title(17,"#ffffff","#5a0000")).setOrigin(0.5).setDepth(D+1));

    let cy=contentTop+10;

    // Maliyet satiri
    const costLine=CURRENT_LANG==="en"?"3 crystals will be spent":
                   CURRENT_LANG==="ru"?"Потратится 3 кристалла":"3 kristal harcanacak";
    A(S.add.text(CX,cy,costLine,NT_STYLE.body(13,"#cc99ff")).setOrigin(0.5,0).setDepth(D+1));
    cy+=24;

    // Bakiye
    const gemColor=PLAYER_CRYSTAL>=CRYSTAL_COSTS.revive?"#cc99ff":"#ff4444";
    A(S.add.text(CX,cy,L("goReviveCrystalCost")+" "+PLAYER_CRYSTAL+" 💎",
        NT_STYLE.accent(14,gemColor)).setOrigin(0.5,0).setDepth(D+1));
    cy+=32;

    // Geri sayim dairesi
    const cdCircle=A(S.add.graphics().setDepth(D+1));
    const cdY=cy+28;
    const drawCd=(t)=>{
        cdCircle.clear();
        cdCircle.lineStyle(5,0x330044,0.55); cdCircle.strokeCircle(CX,cdY,26);
        const ang=-Math.PI/2, endAng=ang+(2*Math.PI*(t/8));
        const steps=32;
        cdCircle.lineStyle(5,0xcc44ff,0.88);
        for(let s=0;s<steps;s++){
            const a1=ang+(endAng-ang)*(s/steps), a2=ang+(endAng-ang)*((s+1)/steps);
            cdCircle.lineBetween(CX+Math.cos(a1)*26,cdY+Math.sin(a1)*26,
                                 CX+Math.cos(a2)*26,cdY+Math.sin(a2)*26);
        }
        cdCircle.lineStyle(2,0xdd88ff,0.22); cdCircle.strokeCircle(CX,cdY,20);
    };
    drawCd(8);

    let countdown=5;
    const cdTxt=A(S.add.text(CX,cdY,String(countdown),
        NT_STYLE.title(22,"#ffffff","#000000")).setOrigin(0.5).setDepth(D+2));

    // Sayim tween (smooth arc) + event (sayi)
    const cdTw=S.tweens.add({targets:{v:5},v:0,duration:5000,ease:"Linear",
        onUpdate:(tw)=>drawCd(tw.targets[0].v)
    });
    let _cdLastSec=5;
    const cdEv=S.time.addEvent({delay:1000,repeat:4,callback:()=>{
        countdown--;
        if(cdTxt&&cdTxt.active) cdTxt.setText(countdown>0?String(countdown):"!");
        _cdLastSec=countdown;
        try{ NT_SFX.play(countdown<=1?"countdown_go":"countdown_tick"); }catch(_){}
        if(countdown<=0){ cleanup(); gs._crystalReviveUsed=true; gameOver(S); }
    }});
    // Ilk tik — panel acilinca hemen cal
    try{ NT_SFX.play("countdown_tick"); }catch(_){}

    const cleanup=()=>{
        try{ cdTw.stop(); }catch(_){}
        try{ cdEv.remove(); }catch(_){}
        objs.forEach(o=>{
            try{
                if(o&&o.active){
                    if(typeof o.disableInteractive==="function"&&o.scene&&o.scene.sys) o.disableInteractive();
                    o.destroy();
                }
            }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        });
    };

    // Hayir butonu — icerik alaninin altinda, footer'in hemen ustunde
    const nY=contentBot-16;
    const nBg=A(S.add.graphics().setDepth(D));
    const _dN=(h)=>{
        nBg.clear();
        nBg.fillStyle(h?0x333344:0x111118,1);
        nBg.fillRoundedRect(CX-62,nY-12,124,26,7);
        nBg.lineStyle(1,h?0x666688:0x333344,0.8);
        nBg.strokeRoundedRect(CX-62,nY-12,124,26,7);
    };
    _dN(false);
    const noLbl=CURRENT_LANG==="en"?"No, end game":CURRENT_LANG==="ru"?"Нет, завершить":"Hayir, bitir";
    A(S.add.text(CX,nY,noLbl,NT_STYLE.stat(12,"#777788")).setOrigin(0.5).setDepth(D+1));
    A(S.add.rectangle(CX,nY,124,26,0xffffff,0.001).setDepth(D+2)
        .setInteractive({useHandCursor:true})
        .on("pointerover",()=>_dN(true))
        .on("pointerout",()=>_dN(false))
        .on("pointerdown",()=>{ cleanup(); gs._crystalReviveUsed=true; gameOver(S); }));

    // DIRIL butonu — footer altin seridinde, tam genislik
    NT_YellowBtn(S,CX,btnCY,220,44,L("goReviveBtn"),D,()=>{
        if(!spendCrystal(CRYSTAL_COSTS.revive)){ gameOver(S); return; }
        gs._crystalReviveUsed=true;
        gs.health=Math.ceil(gs.maxHealth*0.5);
        gs._healFlash=1000;
        gs.invincible=true; gs._invT=0;
        gs.pickingUpgrade=false;
        cleanup();
        S.physics.resume();
        if(S.spawnEvent) S.spawnEvent.paused=false;
        // [FIX-REVIVE] Kamerayı karanlıktan kurtarmak için fadeIn
        S.cameras.main.fadeIn(350,0,0,0);
        S.cameras.main.shake(150,0.018);
        // [FIX-REVIVE] Müziği yeniden başlat
        NT_SFX.startMusic();
        NT_SFX.setMusicState("gameplay", 0.5);
        NT_SFX.startWindAmbience();
        // [FIX-MOBİL] Mobil butonları göster
        try{ _showMobileBtns(S); }catch(_){}
        showHitTxt(S,180,240,L("crystalRevived"),"#cc44ff",true);
        if(S._crystalHudText) S._crystalHudText.setText("GEM "+PLAYER_CRYSTAL);
        S.time.delayedCall(1000,()=>{ if(GS){ GS.invincible=false; GS._invT=0; }});
    }).forEach(o=>A(o));

    // Icerikleri fade-in
    objs.forEach(o=>{
        if(o===sprite) return;
        try{ o.setAlpha(0); S.tweens.add({targets:o,alpha:1,duration:150,delay:90}); }catch(_){}
    });
}

// ── UI GROUP — memory-safe obje yonetimi ──────────────────────
class UIGroup {
    constructor(scene){ 
        this.scene = scene; 
        this.items = []; 
    }
    add(obj){ 
        if(obj) this.items.push(obj); 
        return obj; 
    }
    destroyAll(){
        const items = this.items.slice();
        this.items = [];
        items.forEach(o=>{
            if(!o) return;
            try{
                // Guard: Phaser reads o.scene.sys internally; skip if scene is already torn down
                if(typeof o.disableInteractive === "function" && o.scene && o.scene.sys) o.disableInteractive();
                if(typeof o.removeAllListeners === "function") o.removeAllListeners();
                if(o.scene && this.scene?.tweens){
                    this.scene.tweens.killTweensOf(o);
                }
                if(typeof o.destroy === "function") o.destroy();
            }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        });
    }
    // Alias — callers may use either name
    destroy(){ this.destroyAll(); }
    fadeAndDestroy(duration=130){
        const items = this.items.slice();
        this.items = [];
        items.forEach(o=>{
            if(!o) return;
            try{
                // Guard: Phaser reads o.scene.sys internally; skip if scene is already torn down
                if(typeof o.disableInteractive === "function" && o.scene && o.scene.sys) o.disableInteractive();
                if(typeof o.removeAllListeners === "function") o.removeAllListeners();
                if(o.scene && typeof o.setAlpha === "function"){
                    this.scene.tweens.killTweensOf(o);
                    this.scene.tweens.add({
                        targets: o, alpha: 0, duration,
                        onComplete: ()=>{ try{ o.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)} }
                    });
                } else if(typeof o.destroy === "function"){
                    o.destroy();
                }
            }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        });
    }
}
// ═══════════════════════════════════════════════════════════════
// ★★★ YENI SISTEMLER BLOGU — MEVCUT KODA DOKUNULMADI ★★★
// ═══════════════════════════════════════════════════════════════

// ── SINERJI SISTEMI ──────────────────────────────────────────
function checkAndApplySynergies(S){
    const gs=GS;
    SYNERGIES.forEach(syn=>{
        if(syn.active) return; // zaten aktif
        const allMet=syn.req.every(key=>UPGRADES[key]&&UPGRADES[key].level>=syn.reqLv);
        if(!allMet) return;
        syn.active=true;
        syn.apply(gs);
        // Sinerji aktive gorsel bildirimi
        showSynergyNotification(S, syn);
    });
}

// ══════════════════════════════════════════════════════════════
// [VFX POLISH] SINERJI BILDIRIMI — WOW MOMENT
// Sinerji aktif olunca: ekran flasi → kisa slow-motion → buyuk baslik → ozel efekt
// ══════════════════════════════════════════════════════════════
function showSynergyNotification(S, syn){
    const W=360, H=640;
    const label=LLang(syn,"name","nameEN","nameRU");
    const desc=LLang(syn,"desc","descEN","descRU");

    // ★ GAME FEEL: Power spike
    triggerPowerSpike(S, "synergy");

    // [VFX] 1. Guclu kamera efektleri
    S.cameras.main.shake(70, 0.008);
    
    S.cameras.main.zoomTo(1.06, 120, "Quad.easeOut");
    S.time.delayedCall(120, ()=> S.cameras.main.zoomTo(1.0, 280, "Quad.easeIn"));

    // [VFX] 2. Kisa slow-motion efekti — sinematik his
    S.time.timeScale = 0.25;
    S.time.delayedCall(600, ()=>{ S.time.timeScale = 1.0; });

    // [VFX] 3. Tam ekran renk overlay — anlik burst
    const burstOv = S.add.rectangle(W/2, H/2, W, H, syn.color, 0).setDepth(698);
    S.tweens.add({ targets:burstOv, fillAlpha:0.18, duration:80, yoyo:true,
        onComplete:()=> burstOv.destroy() });

    // [VFX] 4. Merkez halka patlamasi — buyuk
    for(let i=0;i<3;i++){
        S.time.delayedCall(i*70, ()=>{
            const ring = S.add.graphics().setDepth(699);
            ring.x = W/2; ring.y = H/2;
            ring.lineStyle(3-i, syn.color, 1.0);
            ring.strokeCircle(0, 0, 15+i*10);
            S.tweens.add({ targets:ring, scaleX:12, scaleY:12, alpha:0,
                duration:500, ease:"Quad.easeOut", onComplete:()=>ring.destroy() });
        });
    }

    // [VFX] 5. Buyuk SINERJI basligi — ekran ortasinda, scale-in
    const bigTitle = S.add.text(W/2, H/2-30, L("synergyTitle"), {
        font:"bold 30px LilitaOne, Arial, sans-serif",
        color: Phaser.Display.Color.IntegerToColor(syn.color).rgba,
        stroke:"#000000", strokeThickness:3
    }).setOrigin(0.5).setDepth(702).setAlpha(1).setVisible(false).setScale(0.2);
    S.tweens.add({ targets:bigTitle, alpha:1, scaleX:1.05, scaleY:1.05,
        duration:200, ease:"Back.easeOut" });
    S.tweens.add({ targets:bigTitle, alpha:0, scaleX:1.4, scaleY:1.4,
        duration:300, ease:"Quad.easeIn", delay:1100,
        onComplete:()=> { try{ bigTitle.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)} } });

    // [VFX] 6. Sinerji adi — basligin altinda
    const synLabel = S.add.text(W/2, H/2+12, syn.icon+" "+label, {
        font:"bold 15px LilitaOne, Arial, sans-serif", color:"#ffffff"
    }).setOrigin(0.5).setDepth(702).setAlpha(1).setVisible(false);
    S.tweens.add({ targets:synLabel, alpha:1, y:H/2+8, duration:240,
        ease:"Back.easeOut", delay:100 });
    S.time.delayedCall(1300, ()=>{
        S.tweens.add({ targets:synLabel, alpha:0, y:H/2-10, duration:220,
            onComplete:()=>{ try{ synLabel.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)} } });
    });

    // [VFX] 7. Alt panel — aciklama, sagdan kayar
    const panel = S.add.graphics().setDepth(700);
    panel.fillStyle(0x060010, 0.88); panel.fillRoundedRect(36, 66, 288, 56, 6);
    panel.fillStyle(syn.color, 0.85); panel.fillRoundedRect(36, 66, 3, 56, {tl:6,tr:0,bl:6,br:0});
    panel.lineStyle(1.5, syn.color, 0.75); panel.strokeRoundedRect(36, 66, 288, 56, 6);
    panel.fillStyle(syn.color, 0.10); panel.fillRoundedRect(36, 66, 288, 18, {tl:6,tr:6,bl:0,br:0});

    const descTxt = S.add.text(182, 87, desc, {
        font:"bold 13px LilitaOne, Arial, sans-serif",
        color: Phaser.Display.Color.IntegerToColor(syn.color).rgba, wordWrap:{width:270}, align:"center"
    }).setOrigin(0.5, 0).setDepth(701);

    [panel, descTxt].forEach(o=>{ o.x += W; o.setAlpha(0); });
    S.time.delayedCall(250, ()=>{
        S.tweens.add({ targets:[panel, descTxt], x:"-="+W, alpha:1,
            duration:300, ease:"Back.easeOut" });
    });

    // [VFX] 8. Parcacik patlamasi — 18→10 adet
    const plx = S.player?.x||W/2, ply = S.player?.y||H/2;
    for(let i=0;i<10;i++){
        S.time.delayedCall(i*22, ()=>{
            const ang = Phaser.Math.DegToRad(i*(360/10));
            const spd = Phaser.Math.Between(35,80);
            const sp = S.add.graphics().setDepth(700);
            sp.x = plx; sp.y = ply;
            sp.fillStyle(syn.color, 0.85);
            sp.fillRect(-1, -2, 3, 5);
            S.tweens.add({ targets:sp,
                x: plx+Math.cos(ang)*spd, y: ply+Math.sin(ang)*spd*0.7,
                alpha:0, scaleX:0.1, scaleY:0.1,
                duration: Phaser.Math.Between(220,420), ease:"Quad.easeOut",
                onComplete:()=> sp.destroy() });
        });
    }

    S.time.delayedCall(3200, ()=>{
        S.tweens.add({ targets:[panel, descTxt], x:"+=30", alpha:0, duration:220,
            ease:"Quad.easeIn", onComplete:()=>{
                try{ panel.destroy(); descTxt.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            }});
    });
}

// ── MINI BOSS SISTEMI ────────────────────────────────────────
function spawnMiniBoss(S){
    const gs=GS;
    if(gs.miniBossActive||gs.level<4) return;
    const def=MINI_BOSS_POOL[Phaser.Math.Between(0,MINI_BOSS_POOL.length-1)];
    const p=S.pyramids.get(180,-60,"pyramid");
    if(!p) return;
    p.setActive(true).setVisible(true);
    resetEF(p);

    // ── Temel stats ──────────────────────────────────────────────
    p.hp=p.maxHP=Math.round((def.hp*0.38)+gs.level*0.4); // [NERF] further reduced HP — was *0.55 too tanky
    p.armor=def.armor;
    p.type="miniboss";
    p._isMiniBoss=true;
    p.isBoss=false;

    // ── Gorsel + Behavior: per candy boss ──────────────────────
    if(def.id==="jelly_titan"){
        p.setDisplaySize(130,106).setTint(0xFF9922).setAngle(0);
        // Slow wobble — heavy jelly mass
        S.tweens.add({targets:p, angle:10, duration:700, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
    } else if(def.id==="bubble_king"){
        p.setDisplaySize(100,82).setTint(0xFF88EE).setAngle(0);
        // Fast side-to-side — bubbly and erratic
        S.tweens.add({targets:p, angle:0, duration:1, onComplete:()=>{
            // Zigzag AI: reverse x velocity every 600ms
            if(p.body) p.body.velocity.x = 55;
            S.time.addEvent({delay:600, loop:true, callback:()=>{
                if(!p||!p.active) return;
                if(p.body) p.body.velocity.x *= -1;
            }});
        }});
        // Spawns 2 mini bubbles (swarm minions) every 4 seconds
        S.time.addEvent({delay:4000, loop:true, callback:()=>{
            if(!p||!p.active||!GS||GS.gameOver) return;
            for(let _bi=0;_bi<2;_bi++){
                const _bm=S.pyramids.get(p.x+Phaser.Math.Between(-30,30), p.y+10, "pyramid");
                if(_bm){ _bm.setActive(true).setVisible(true); resetEF(_bm);
                    _bm.type="minion"; _bm.hp=_bm.maxHP=2; _bm.setScale(0.45).setVelocityY(GS.pyramidSpeed*0.9);
                    _bm.spawnProtected=false; _bm.setTint(0xFF88EE); _bm.body.setSize(18,18).setOffset(5,5); }
            }
        }});
    } else if(def.id==="candy_overlord"){
        p.setDisplaySize(116,95).setTint(0xFFDD44).setAngle(0);
        // Slow pulsing glow — authoritative
        S.tweens.add({targets:p, alpha:0.75, duration:420, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
        S.tweens.add({targets:p, angle:6, duration:900, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
    } else if(def.id==="gummy_crusher"){
        p.setDisplaySize(156,128).setTint(0xFF6644).setAngle(0);
        // Very slow side drift — massive presence
        S.tweens.add({targets:p, angle:5, duration:1200, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
    } else if(def.id==="sugar_phantom"){
        p.setDisplaySize(88,72).setTint(0xFFCCFF).setAngle(0);
        // Rapid flicker — hard to track
        S.tweens.add({targets:p, alpha:0.35, duration:220, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
        S.tweens.add({targets:p, angle:15, duration:250, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
    }

    p.setAlpha(0);
    // [FIX] Miniboss hiz: pyramidSpeed*def.speed erken oyunda bile cok hizli cikiyordu.
    // Sabit max cap: 55 px/s — oyuncunun tepki verebilecegi, dramatik giris hissi veren hiz.
    // Gec oyunda pyramidSpeed yuksek olsa bile miniboss tehdidi hizdan degil HP/armor'dan gelir.
    const _mbSpeed = Math.min(38, gs.pyramidSpeed * def.speed * 0.72); // [NERF] speed cap 55→38, mult 0.72
    p.setVelocityY(_mbSpeed);
    p.spawnProtected=true;
    gs.miniBossActive=true;
    // [FIX] Miniboss hitbox — onceki hesap scaleX/Y'den kaynakli hataliydi.
    // Phaser body.setSize() UNSCALED (orijinal texture piksel) deger ister.
    // pyramid texture frame: 183x112. setDisplaySize ile scale degisir ama
    // body.setSize'a gecirilecek deger displaySize / scaleX degil, dogrudan
    // orijinal texture uzerindeki boyut olmali.
    // Formul: bodyW = displayWidth / scaleX  → ama setDisplaySize scaleX'i de degistiriyor
    // Guvenli yol: body'i resetle, sonra displaySize'a gore yeniden ayarla.
    {
        const dw = p.displayWidth  || 100;
        const dh = p.displayHeight || 82;
        // body.reset() ile physics body'i sprite merkezine hizala
        if(p.body) p.body.reset(p.x, p.y);
        // Hitbox: display boyutunun %78 genislik, %70 yuksekligi — iyi overlap icin buyuk
        const bw = Math.round(dw * 0.78);
        const bh = Math.round(dh * 0.70);
        // setSize'a gecilen deger: Phaser bunu scaleX ile carpar, bu yuzden scale'i bol
        const sx = Math.abs(p.scaleX) || 1;
        const sy = Math.abs(p.scaleY) || 1;
        const ox = Math.round((dw - bw) * 0.5 / sx);
        const oy = Math.round((dh - bh) * 0.5 / sy);
        p.body.enable = true;
        p.body.setSize(bw / sx, bh / sy);
        p.body.setOffset(ox, oy);
        p.body.checkCollision.none  = false;
        p.body.checkCollision.up    = true;
        p.body.checkCollision.down  = true;
        p.body.checkCollision.left  = true;
        p.body.checkCollision.right = true;
        p.body.moves = true;
        // Ek guvence: setVelocityY sonrasi body dogrulamasi
        if(!p.body.enable) p.body.enable = true;
    }

    // ── Giris animasyonu ─────────────────────────────────────────
    S.tweens.add({targets:p, alpha:1, duration:500, ease:"Quad.easeOut"});
    S.time.delayedCall(300,()=>{ if(p.active) p.spawnProtected=false; });

    // ── HP Bar (mini boss ozel) ───────────────────────────────────
    const hpBar=S.add.graphics().setDepth(35);
    const hpFill=S.add.graphics().setDepth(36);
    const hpTick=S.time.addEvent({delay:16,loop:true,callback:()=>{
        if(!p||!p.active||!GS||GS.gameOver){
            hpBar.destroy(); hpFill.destroy(); hpTick.remove(); return;
        }
        const ratio=Math.max(0,p.hp/p.maxHP);
        const bx=p.x-55, by=p.y-(p.displayHeight||70)*0.5-14;
        hpBar.clear();
        hpBar.fillStyle(0x000000,0.80); hpBar.fillRoundedRect(bx-2,by-2,114,12,4);
        hpBar.lineStyle(1,def.color,0.8); hpBar.strokeRoundedRect(bx-2,by-2,114,12,4);
        hpFill.clear();
        if(ratio>0){
            const fc=ratio>0.5?def.color:ratio>0.25?0xffaa00:0xff2222;
            hpFill.fillStyle(fc,1); hpFill.fillRoundedRect(bx,by,Math.ceil(110*ratio),8,3);
            hpFill.fillStyle(0xffffff,0.25); hpFill.fillRoundedRect(bx,by,Math.ceil(110*ratio),3,{tl:3,tr:3,bl:0,br:0});
        }
    }});
    p._hpBarGfx=hpBar; p._hpFillGfx=hpFill; p._hpBarTick=hpTick;

    // Banner
    showMiniBossBanner(S, def);
    p._miniBossDef=def;
}

function showMiniBossBanner(S, def){
    const name=LLang(def,"name","nameEN","nameRU");
    const W=360, H=640;

    // [VFX] Mini Boss spawn — hafifletilmis
    S.cameras.main.shake(120, 0.012);
    S.cameras.main.zoomTo(1.04, 160, "Quad.easeOut");
    S.time.delayedCall(160, ()=> S.cameras.main.zoomTo(1.0, 300, "Quad.easeIn"));

    // 2. Kisa slow-motion — daha yavas giris
    S.time.timeScale = 0.15;
    S.time.delayedCall(800, ()=>{ S.time.timeScale = 1.0; });

    // 4. Halka patlamasi — ekran ortasindan
    for(let i=0;i<4;i++){
        S.time.delayedCall(i*60, ()=>{
            const ring = S.add.graphics().setDepth(596);
            ring.x = W/2; ring.y = H/2;
            ring.lineStyle(4-i, def.color, 1.0);
            ring.strokeCircle(0, 0, 10+i*12);
            S.tweens.add({ targets:ring, scaleX:15, scaleY:15, alpha:0,
                duration:600, ease:"Quad.easeOut", onComplete:()=>ring.destroy() });
        });
    }

    // 5. Ana banner — tam orta, scale punch ile girer
    const bg = S.add.graphics().setDepth(600);
    bg.fillStyle(0x000000, 0.82); bg.fillRoundedRect(0, 264, W, 64, 0);
    bg.lineStyle(3, def.color, 1.0); bg.lineBetween(0, 264, W, 264);
    bg.lineStyle(3, def.color, 1.0); bg.lineBetween(0, 328, W, 328);
    bg.fillStyle(def.color, 0.10); bg.fillRect(0, 264, W, 64);
    // Sol/sag accent barlar
    bg.fillStyle(def.color, 0.6); bg.fillRect(0, 264, 5, 64);
    bg.fillStyle(def.color, 0.6); bg.fillRect(W-5, 264, 5, 64);

    const warnTxt = S.add.text(W/2, 272, L("miniBossAlert"), {
        font:"14px LilitaOne, Arial, sans-serif", color:"#ff6655"
    }).setOrigin(0.5, 0).setDepth(601).setAlpha(0);

    const nameTxt = S.add.text(W/2, 290, name.toUpperCase(), {
        font:"20px LilitaOne, Arial, sans-serif",
        color: Phaser.Display.Color.IntegerToColor(def.color).rgba,
        stroke:"#000000", strokeThickness:3
    }).setOrigin(0.5, 0).setDepth(601).setAlpha(0);

    // Scale-in + fade-in animasyonu
    bg.setScale(0.7); bg.setAlpha(0);
    S.tweens.add({ targets:bg, scaleX:1, scaleY:1, alpha:1, duration:220, ease:"Back.easeOut" });
    S.time.delayedCall(30, ()=>{
        S.tweens.add({ targets:[warnTxt, nameTxt], alpha:1, y:"-=4",
            duration:200, ease:"Back.easeOut" });
    });

    // Uyari yanip sonmesi
    S.tweens.add({ targets:warnTxt, alpha:0.35, duration:320,
        yoyo:true, repeat:4, delay:300 });

    // 6. Zemin titresim efekti — kucuk parcaciklar
    for(let i=0;i<12;i++){
        S.time.delayedCall(i*40, ()=>{
            const sp = S.add.graphics().setDepth(597);
            sp.fillStyle(def.color, 0.8);
            sp.fillRect(Phaser.Math.Between(0,W), GROUND_Y-3,
                Phaser.Math.Between(3,8), 4);
            S.tweens.add({ targets:sp, y:sp.y-Phaser.Math.Between(20,50),
                alpha:0, duration:400, ease:"Quad.easeOut", onComplete:()=>sp.destroy() });
        });
    }

    S.time.delayedCall(5000, ()=>{
        S.tweens.add({ targets:[bg, warnTxt, nameTxt], alpha:0, y:"+=12", duration:280,
            onComplete:()=>{
                try{ bg.destroy(); warnTxt.destroy(); nameTxt.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            }});
    });
}

function handleMiniBossDeath(S, p){
    if(!p._isMiniBoss||!p._miniBossDef) return;
    const gs=GS;
    gs.miniBossActive=false;
    const def=p._miniBossDef;

    // HP bar temizle
    try{ if(p._hpBarGfx) p._hpBarGfx.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    try{ if(p._hpFillGfx) p._hpFillGfx.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    try{ if(p._hpBarTick) p._hpBarTick.remove(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}

    // Oduller
    // [FIX] Mini boss %40 sansla tek sandik
    if(Math.random()<0.40){ spawnChest(S,p.x,p.y-10); }

    // XP patlamasi — [BALANCE v2] 12→5 orb, deger dusuruldu (ani multi-level-up onlenir)
    for(let i=0;i<5;i++){
        S.time.delayedCall(i*80,()=>{
            spawnXpOrb(S,p.x+Phaser.Math.Between(-40,40),p.y+Phaser.Math.Between(-20,20),
                "xp_gold", Math.round((2+gs.level*0.3)*def.reward.xpMult));
        });
    }

    // (relic offer on miniboss removed — artifact chosen at game start only)

    // Buyuk patlama efekti — 20→8 adet
    S.cameras.main.shake(80, 0.010);
    
    for(let i=0;i<8;i++){
        S.time.delayedCall(i*55,()=>{
            const bx=p.x+Phaser.Math.Between(-50,50),by=p.y+Phaser.Math.Between(-40,40);
            const bf=S.add.graphics().setDepth(22);
            bf.x=bx;bf.y=by;
            bf.fillStyle([def.color,0xffffff,0xffcc00][i%3],0.70);
            bf.fillCircle(0,0,Phaser.Math.Between(4,14));
            S.tweens.add({targets:bf,scaleX:2.2,scaleY:2.2,alpha:0,duration:240,
                ease:"Quad.easeOut",onComplete:()=>bf.destroy()});
        });
    }

    showHitTxt(S,p.x,p.y-30,"MINI BOSS OLDU!","#ffcc00",true);
}

// ── RUN EVENT SISTEMI ────────────────────────────────────────
function triggerRunEvent(S){
    const gs=GS;
    if(!gs||gs.gameOver||_upgradeLock>0) return;
    // EventManager enforces: 1 active, 120s cooldown, boss-blocked
    if(!EventManager.canTrigger(gs)) return;
    const ev=RUN_EVENTS[Phaser.Math.Between(0,RUN_EVENTS.length-1)];
    // [FIX] startEvent burada cagriliyor — hem "Kabul Et" hem "Reddet" durumunda
    // EventManager._activeEvent set edilmis olur. endEvent her iki durumda da
    // _lastEndTime'i dogru gunceller → cooldown duzgun calisir.
    // Onceden sadece "Kabul Et" callback'lerinde startEvent cagriliyordu,
    // "Reddet"te endEvent _activeEvent=null ile calisiyordu → cooldown sifirlanmiyordu.
    EventManager.startEvent("event_pending", gs, 60000, null);
    showRunEventUI(S,ev);
}

// showRunEventUI — Temiz tasarim: baslik + aciklama + iki sari buton yan yana
function showRunEventUI(S, ev){
    const gs=GS;
    if(gs.pickingUpgrade || _upgradeLock > 0) return;
    lockUpgrade(gs, S);
    const W=360, H=640, CX=W/2;
    const ui=new UIGroup(S);

    // ── TIK-TAK ZAMANLAYICI ───────────────────────────────────────
    let _tickTimer=null;
    function _doTick(){ try{ NT_SFX.play("countdown_tick"); }catch(_){} }
    _doTick();
    _tickTimer=setInterval(_doTick, 700);
    function _stopTick(){ if(_tickTimer){ clearInterval(_tickTimer); _tickTimer=null; } }

    // Karanlik overlay
    const ov=ui.add(S.add.rectangle(CX,H/2,W,H,0x000000,0).setDepth(800));
    S.tweens.add({targets:ov,fillAlpha:0.80,duration:220});

    // Panel — ui_pause_win sprite
    const pm=NT_Measure(S,"ui_pause_win",310);
    const panelCY=H/2 - 8;
    const sprite=ui.add(S.add.image(CX,panelCY,"ui_pause_win").setScale(pm.sc*0.05).setAlpha(0).setDepth(801));
    const pTop=panelCY-pm.H/2, pBot=panelCY+pm.H/2;
    const stripCY    = pTop + pm.stripH/2;
    const contentTop = pTop + pm.stripH + 20;
    const D=802;

    S.tweens.add({targets:sprite, scaleX:pm.sc, scaleY:pm.sc, alpha:1, duration:240, ease:"Back.easeOut"});

    // ── BASLIK — LilitaOne-Regular, ortalı, serit içinde ─────────
    const title=LLang(ev,"title","titleEN","titleRU");
    const titleTxt=ui.add(S.add.text(CX, stripCY, title,{
        fontFamily:"LilitaOne, Arial, sans-serif",
        fontSize:"20px",
        color:"#ffffff",
        stroke:"#00000088",
        strokeThickness:3,
        fixedWidth: pm.W - 24,
        wordWrap:{width: pm.W - 24},
        align:"center"
    }).setOrigin(0.5, 0.5).setDepth(D+3).setAlpha(0));

    // ── ACIKLAMA — LilitaOne-Regular, ortalı ─────────────────────
    const desc=LLang(ev,"desc","descEN","descRU");
    const descTxt=ui.add(S.add.text(CX, contentTop+14, desc,{
        fontFamily:"LilitaOne, Arial, sans-serif",
        fontSize:"14px",
        color:"#ddeeff",
        wordWrap:{width: pm.W - 44},
        align:"center",
        lineSpacing:5
    }).setOrigin(0.5, 0).setDepth(D+2).setAlpha(0));

    // ── IKI SARI BUTON YAN YANA ──────────────────────────────────
    const BTN_W  = (pm.W - 36) / 2;   // her buton eşit genişlik, aralarında 12px boşluk
    const BTN_H  = 46;
    const BTN_Y  = pBot - 30;
    const BTN_L  = CX - BTN_W/2 - 6;  // sol buton merkezi
    const BTN_R  = CX + BTN_W/2 + 6;  // sağ buton merkezi

    // --- KABUL ET (sol sarı buton) ---
    const ch0   = ev.choices[0];
    const lbl0  = CURRENT_LANG==="ru" ? ch0.labelRU : CURRENT_LANG==="en" ? ch0.labelEN : ch0.label;

    const aG=ui.add(S.add.graphics().setDepth(D+2).setAlpha(0));
    const _drawAcc=(h)=>{
        aG.clear();
        aG.fillStyle(h?0xffdd00:0xffcc00,1);
        aG.fillRoundedRect(BTN_L-BTN_W/2, BTN_Y-BTN_H/2, BTN_W, BTN_H, 10);
        aG.fillStyle(0xffffff, h?0.22:0.12);
        aG.fillRoundedRect(BTN_L-BTN_W/2+6, BTN_Y-BTN_H/2+5, BTN_W-12, BTN_H/2-8, 7);
        aG.lineStyle(2, h?0xffffff:0xffdd44, h?0.7:0.45);
        aG.strokeRoundedRect(BTN_L-BTN_W/2, BTN_Y-BTN_H/2, BTN_W, BTN_H, 10);
    };
    _drawAcc(false);
    const aTxt=ui.add(S.add.text(BTN_L, BTN_Y, lbl0.toUpperCase(),{
        fontFamily:"LilitaOne, Arial, sans-serif", fontSize:"15px",
        color:"#1a1200", stroke:"#ffee8800", strokeThickness:0
    }).setOrigin(0.5).setDepth(D+3).setAlpha(0));
    const aHit=ui.add(S.add.rectangle(BTN_L, BTN_Y, BTN_W, BTN_H, 0xffffff, 0.001)
        .setDepth(D+4).setInteractive({useHandCursor:true}));
    aHit.on("pointerover",()=>_drawAcc(true));
    aHit.on("pointerout", ()=>_drawAcc(false));
    aHit.on("pointerdown",()=>{
        _stopTick();
        S.cameras.main.shake(30,0.005);
        NT_SFX.play("button_confirm");
        ch0.fn(S);
        ui.fadeAndDestroy(180);
        S.time.delayedCall(200,()=>{ S.time.timeScale=1.0; unlockUpgrade(gs,S); });
    });

    // --- REDDET (sağ sarı buton) ---
    if(ev.choices.length > 1){
        const chi = ev.choices[1];
        const isTR=CURRENT_LANG==="tr", isRU=CURRENT_LANG==="ru";
        const dLabel=isTR?"REDDET":isRU?"ОТКАЗАТЬ":"DECLINE";

        const dG=ui.add(S.add.graphics().setDepth(D+2).setAlpha(0));
        const _drawDec=(h)=>{
            dG.clear();
            dG.fillStyle(h?0xffdd00:0xffcc00,1);
            dG.fillRoundedRect(BTN_R-BTN_W/2, BTN_Y-BTN_H/2, BTN_W, BTN_H, 10);
            dG.fillStyle(0xffffff, h?0.22:0.12);
            dG.fillRoundedRect(BTN_R-BTN_W/2+6, BTN_Y-BTN_H/2+5, BTN_W-12, BTN_H/2-8, 7);
            dG.lineStyle(2, h?0xffffff:0xffdd44, h?0.7:0.45);
            dG.strokeRoundedRect(BTN_R-BTN_W/2, BTN_Y-BTN_H/2, BTN_W, BTN_H, 10);
        };
        _drawDec(false);
        const dTxt=ui.add(S.add.text(BTN_R, BTN_Y, dLabel,{
            fontFamily:"LilitaOne, Arial, sans-serif", fontSize:"15px",
            color:"#1a1200"
        }).setOrigin(0.5).setDepth(D+3).setAlpha(0));
        const dHit=ui.add(S.add.rectangle(BTN_R, BTN_Y, BTN_W, BTN_H, 0xffffff, 0.001)
            .setDepth(D+4).setInteractive({useHandCursor:true}));
        dHit.on("pointerover", ()=>_drawDec(true));
        dHit.on("pointerout",  ()=>_drawDec(false));
        dHit.on("pointerdown", ()=>{
            _stopTick();
            NT_SFX.play("menu_click");
            chi.fn(S);
            ui.fadeAndDestroy(180);
            S.time.delayedCall(200,()=>{ S.time.timeScale=1.0; unlockUpgrade(gs,S); });
        });

        S.time.delayedCall(160,()=>{
            S.tweens.add({targets:[dG,dTxt],alpha:1,duration:180,ease:"Quad.easeOut"});
        });
    }

    // Fade-in
    S.time.delayedCall(80,()=>{
        S.tweens.add({targets:[titleTxt,descTxt],alpha:1,duration:220,ease:"Quad.easeOut"});
    });
    S.time.delayedCall(160,()=>{
        S.tweens.add({targets:[aG,aTxt],alpha:1,duration:200,ease:"Back.easeOut"});
    });

    // Otomatik kapanma (8 saniye)
    S.time.delayedCall(8000,()=>{
        if(gs.pickingUpgrade&&!gs.gameOver){
            _stopTick();
            EventManager.endEvent(GS);
            ui.fadeAndDestroy(200);
            S.time.delayedCall(220,()=>{ S.time.timeScale=1.0; unlockUpgrade(gs,S); });
        }
    });
}
// ── RELIK SISTEMI ────────────────────────────────────────────
// [v9.1] Artifact sistemi tamamen kaldirildi.

// ══════════════════════════════════════════════════════════════
// [VFX POLISH] EVRIM SINEMATIGI — en buyuk wow moment
// ══════════════════════════════════════════════════════════════
function showEvolutionCinematic(S, evoName, evoColor){
    const W=360,H=640;

    // ★ GAME FEEL: Evolution power spike
    S.time.delayedCall(400, ()=>triggerPowerSpike(S, "evo"));

    // 1. Kamera efektleri — hafifletildi
    S.cameras.main.shake(120, 0.015);
    
    S.cameras.main.zoomTo(1.06, 160, "Quad.easeOut");
    S.time.delayedCall(160, ()=> S.cameras.main.zoomTo(1.0, 320, "Quad.easeIn"));

    // 2. Slow-motion — kisaltildi
    S.time.timeScale = 0.35;
    S.time.delayedCall(600, ()=>{ S.time.timeScale = 1.0; });

    // 3. Renk overlay — daha hafif
    const colorOv = S.add.rectangle(W/2,H/2,W,H,evoColor,0).setDepth(597);
    S.tweens.add({targets:colorOv, fillAlpha:0.12, duration:80, yoyo:true,
        onComplete:()=>colorOv.destroy()});

    // 5. Coklu halka patlamasi — ic'ten disa
    for(let i=0;i<5;i++){
        S.time.delayedCall(i*55, ()=>{
            const er=S.add.graphics().setDepth(602);
            er.x=W/2; er.y=H/2;
            er.lineStyle(4-Math.min(i,3), evoColor, 1.0);
            er.strokeCircle(0,0, 10+i*15);
            S.tweens.add({targets:er, scaleX:20, scaleY:20, alpha:0,
                duration:700, ease:"Quad.easeOut", onComplete:()=>er.destroy()});
        });
    }

    // 6. EVRIM ana yazisi — buyuk, guclu scale-punch
    const evTxt = S.add.text(W/2, H/2-28, L("evolutionTitle"), {
        font:"bold 32px LilitaOne, Arial, sans-serif",
        color: Phaser.Display.Color.IntegerToColor(evoColor).rgba,
        stroke:"#000000", strokeThickness:3
    }).setOrigin(0.5).setDepth(607).setAlpha(1).setVisible(false).setScale(0.1);

    if(evTxt&&evTxt.setVisible){evTxt.setVisible(true);evTxt.setAlpha(0);}
    S.tweens.add({targets:evTxt, alpha:1, scaleX:1.1, scaleY:1.1,
        duration:200, ease:"Back.easeOut"});
    S.tweens.add({targets:evTxt, scaleX:1.0, scaleY:1.0,
        duration:120, ease:"Quad.easeOut", delay:200});
    // Nabiz efekti
    S.time.delayedCall(320, ()=>{
        S.tweens.add({targets:evTxt, scaleX:1.08, scaleY:1.08,
            duration:400, yoyo:true, repeat:2, ease:"Sine.easeInOut"});
    });

    // 7. Evrim adi
    const evoLabel = S.add.text(W/2, H/2+18, evoName.toUpperCase(), {
        font:"bold 15px LilitaOne, Arial, sans-serif", color:"#ffffff"
    }).setOrigin(0.5).setDepth(607).setAlpha(1).setVisible(false);
    if(evoLabel&&evoLabel.setVisible){evoLabel.setVisible(true);evoLabel.setAlpha(0);}
    S.tweens.add({targets:evoLabel, alpha:1, y:H/2+12,
        duration:250, ease:"Back.easeOut", delay:90});

    // 8. Alt cizgi dekorasyon
    S.time.delayedCall(200, ()=>{
        const deco=S.add.graphics().setDepth(606);
        deco.lineStyle(2, evoColor, 0.7);
        deco.lineBetween(W/2-80, H/2+10, W/2+80, H/2+10);
        deco.lineStyle(1, evoColor, 0.3);
        deco.lineBetween(W/2-55, H/2+38, W/2+55, H/2+38);
        S.tweens.add({targets:deco, alpha:0, duration:400, delay:1200,
            onComplete:()=>deco.destroy()});
    });

    // 9. Fade out
    S.time.delayedCall(1500, ()=>{
        S.tweens.add({targets:[evTxt,evoLabel], alpha:0, scaleX:1.5, scaleY:1.5,
            duration:320, ease:"Quad.easeIn",
            onComplete:()=>{
                try{evTxt.destroy();evoLabel.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
            }});
    });

    // 10. Parcacik patlamasi — 32→14 adet
    const plx=S.player?.x||W/2, ply=S.player?.y||H/2;
    const colors=[evoColor,0xffffff,0xffcc00];
    for(let i=0;i<14;i++){
        S.time.delayedCall(i*28, ()=>{
            const ang=Phaser.Math.DegToRad(i*(360/14)+Phaser.Math.Between(-8,8));
            const spd=Phaser.Math.Between(40,100);
            const sp=S.add.graphics().setDepth(606);
            sp.x=plx; sp.y=ply;
            sp.fillStyle(colors[i%3],0.85);
            sp.fillRect(-1,-1,Phaser.Math.Between(2,5),Phaser.Math.Between(2,5));
            S.tweens.add({targets:sp,
                x:plx+Math.cos(ang)*spd, y:ply+Math.sin(ang)*spd*0.75,
                alpha:0, scaleX:0.08, scaleY:0.08,
                duration:Phaser.Math.Between(300,560), ease:"Quad.easeOut",
                onComplete:()=>sp.destroy()});
        });
    }

    // 11. Oyuncu etrafinda buyuk parlama
    S.time.delayedCall(50, ()=>{
        const aura=S.add.graphics().setDepth(605);
        aura.x=plx; aura.y=ply;
        aura.fillStyle(evoColor,0.45); aura.fillCircle(0,0,28);
        aura.fillStyle(0xffffff,0.25); aura.fillCircle(0,0,14);
        S.tweens.add({targets:aura, scaleX:3.5, scaleY:3.5, alpha:0,
            duration:500, ease:"Quad.easeOut", onComplete:()=>aura.destroy()});
    });
}

// ★ YENI: Sinerji efekti — Flame + Poison dogrultusunda
// [v9.3] applyFlamePoison KALDIRILDI — flame/meteor sistemi silindi

// ★ YENI: Chain Storm sinerjisi — Lightning crit uygular
function applyChainStormToLightning(S,target){
    if(!GS._synergyChainStorm) return;
    if(target&&target.active) applyDmg(S,target,GS.damage*0.5,true); // force crit
}

// ★ YENI: Perfect hit'e gorev sayaci (doShoot callback'te cagirilir)
function trackPerfectHit(gs){
    gs.questProgress.perfect=(gs.questProgress.perfect||0)+1;
    // Perfect hit sesi — combo'ya gore pitch artar
    NT_SFX.play("perfect_hit", gs.combo||0);
    // [ADIM 4] Desert Eye relic — perfect hit %3 sansla crystal
    if(gs._relicDesertEye && Math.random()<0.03){
        addCrystal(1,"desert_eye");
    }
}

// ═══════════════════════════════════════════════════════════════
// ★★★ YENI SISTEMLER BLOGU SONU ★★★
// ═══════════════════════════════════════════════════════════════

function gameOver(S){
    const gs=GS; if(!gs||gs.gameOver) return; gs.gameOver=true;
    NT_SFX.play("game_over");
    NT_SFX.stopMusic(1.8);
    NT_SFX.stopWindAmbience(2.0);
    // Muzik state'i sifirla — bir sonraki oyun menu'den baslasin
    NT_SFX.setMusicState("menu", 0.1);
    EventManager.forceCleanup(gs);
    cleanupEventHUD(S);
    SYNERGIES.forEach(syn=>syn.active=false);
    _upgradeLock=0; _levelUpChoosing=false;
    try{S.physics.resume();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
    S.physics.pause(); S.time.timeScale=1;
    _hideMobileBtns(S);
    PLAYER_GOLD=gs.gold; secureSet("nt_gold",PLAYER_GOLD);
    NT_Monetization.trackQuests(gs);
    lbSubmitScore(gs.score||0, gs.kills||0, gs.level||1);

    const W=360, H=640, CX=W/2;
    S.cameras.main.shake(200,0.018);

    // Koyu overlay — hafif fade ile hemen baslasin ama yavas dolsun
    const ov=S.add.rectangle(CX,H/2,W,H,0x000000,0).setDepth(900).setInteractive();
    S.tweens.add({targets:ov, fillAlpha:0.82, duration:800, delay:350});

    // Kirmizi parcacik yagmuru — animasyon bittikten sonra baslasin
    S.time.delayedCall(680,()=>{
        for(let i=0;i<20;i++){
            S.time.delayedCall(i*50,()=>{
                const rx=Phaser.Math.Between(20,340);
                const rp=S.add.graphics().setDepth(901);
                rp.fillStyle(i%2===0?0xff2244:0xff6600,0.6);
                rp.fillRect(rx,0,Phaser.Math.Between(1,3),Phaser.Math.Between(3,7));
                S.tweens.add({targets:rp,y:H,alpha:0,duration:Phaser.Math.Between(600,1100),
                    ease:"Quad.easeIn",onComplete:()=>rp.destroy()});
            });
        }
    });

    // ── OLUM ANIMASYONU — ayri sprite kullan (player idle texture ile uyum sorunu onle) ──
    let _panelShown = false;
    function _showPanel(){
        if(_panelShown) return;
        _panelShown = true;

        const objs=[]; const A=o=>{if(o)objs.push(o);return o;};

        // ── BÜYÜK PANEL — ui_pause_win, 350px genişlik ──────────────
        const pm=NT_Measure(S,"ui_pause_win",350);
        // Paneli ekranın tam ortasına yerleştir, yeterli dikey alan bırak
        const panelCY = Math.min(H/2, H - pm.H/2 - 10);
        const sprite=A(S.add.image(CX,panelCY,"ui_pause_win").setScale(pm.sc).setDepth(902));
        const pTop=panelCY-pm.H/2, pBot=panelCY+pm.H/2;
        const stripCY    = pTop + pm.stripH/2;
        const contentTop = pTop + pm.stripH + 8;
        const contentBot = pBot - pm.goldH  - 6;
        const btnCY      = pBot - pm.goldH/2;
        const TX=CX-155, VX=CX+155;
        const D=903;

        sprite.setScale(pm.sc*0.05).setAlpha(0);
        S.tweens.add({targets:sprite,scaleX:pm.sc,scaleY:pm.sc,alpha:1,duration:220,ease:"Back.easeOut"});

        // ── BAŞLIK ────────────────────────────────────────────────────
        A(S.add.text(CX,stripCY,"💀  "+L("gameOver"),
            NT_STYLE.title(22,"#ffffff","#5a0000")).setOrigin(0.5).setDepth(D));
        // [FIX] Komik "Not Fair" temalı alt başlık
        const _goFunnyEN = [
            "Totally fair. We promise. 🤞",
            "The RNG gods send their regards.",
            "Skill issue? Nope — it's rigged.",
            "Not Fair™ — working as intended.",
            "The pyramids win again. Shocking.",
            "You were so close. (You weren't.)",
            "Our algorithm: 100% certified evil.",
            "At least you have your dignity. (Gone.)"
        ];
        const _goFunnyTR = [
            "Tamamen adil. Söz veriyoruz. 🤞",
            "Kader böyle istedi. Biz değil.",
            "Sistem seni sevmiyordu zaten.",
            "Not Fair™ — tasarım böyle.",
            "Piramitler kazandı. Sürpriz değil.",
            "Neredeydin! (Uzaktaydın aslında.)",
            "Bir daha dene. Yine aynı olacak.",
            "Bu oyunun adı zaten Not Fair."
        ];
        const _goFunnyRU = [
            "Честно? Нет. Именно так задумано.",
            "RNG говорит: 'Не сегодня'.",
            "Пирамиды снова победили. Сюрприз.",
            "Not Fair™ — так и должно быть.",
            "Ты почти... (Нет, не почти.)",
            "Попробуй снова. Снова проиграешь.",
            "Система тебя не любит. Пока.",
        ];
        const _goArr = CURRENT_LANG==="tr"?_goFunnyTR:CURRENT_LANG==="ru"?_goFunnyRU:_goFunnyEN;
        const _goMsg = _goArr[Math.floor(Math.random()*_goArr.length)];
        // [FIX] Mizah yazisi content alaninin icine alindi — title strip ile cakismiyor
        const _funnyTxt = A(S.add.text(CX, contentTop+4, _goMsg, {
            fontFamily:"LilitaOne,Arial,sans-serif", fontSize:"9px",
            color:"#ffaa66", stroke:"#000", strokeThickness:2,
            wordWrap:{width:pm.W-30, useAdvancedWrap:true},
            align:"center"
        }).setOrigin(0.5,0).setDepth(D).setAlpha(0));
        S.time.delayedCall(600, ()=>{
            if(_funnyTxt && _funnyTxt.scene)
                S.tweens.add({targets:_funnyTxt, alpha:1, duration:400, ease:"Quad.easeOut"});
        });

        const prevHs=parseInt(localStorage.getItem("nt_highscore")||"0");
        if(gs.score>prevHs) localStorage.setItem("nt_highscore",gs.score);
        const isNew=gs.score>prevHs;

        let cy=contentTop+22;

        // ── SKOR ─────────────────────────────────────────────────────
        A(S.add.text(CX,cy,gs.score.toLocaleString(),
            NT_STYLE.title(32,"#ffcc00","#000000")).setOrigin(0.5,0).setDepth(D));
        cy+=42;

        // [FIX] Ayırıcı çizgi kaldırıldı
        cy+=6;

        // ── STATS SATIRLARI ──────────────────────────────────────────
        const _row=(lbl,val,col)=>{
            if(cy+20>contentBot-96) return;
            A(S.add.text(TX,cy,lbl,NT_STYLE.stat(13,"#88aacc")).setOrigin(0,0.5).setDepth(D));
            A(S.add.text(VX,cy,val,NT_STYLE.stat(13,col)).setOrigin(1,0.5).setDepth(D));
            cy+=22;
        };
        const kLbl=CURRENT_LANG==="en"?"KILLS":CURRENT_LANG==="ru"?"УБИТО":"KILL";
        const lLbl=CURRENT_LANG==="en"?"LEVEL":CURRENT_LANG==="ru"?"УРОВЕНЬ":"SEVIYE";
        _row(kLbl, String(gs.kills), "#ff7777");
        _row(lLbl, "Lv "+gs.level,  "#88ddff");

        // ── KAZANIMLAR (XP + GOLD, sade, net) ─────────────────────────
        cy = Math.min(cy, contentBot - 96);
        {
            const sessionXP   = _plvCalcSessionXP(gs);
            const result      = _plvAddXP(sessionXP);
            const goldEarned  = Math.max(0, gs.gold || 0);
            const BD = 910;

            // [FIX] Ayırıcı çizgi kaldırıldı
            cy += 6;

            // ── XP KAZANILDI satırı — açık renkli, net ──
            const xpLblKey = CURRENT_LANG==="tr" ? "KAZANILAN XP" : CURRENT_LANG==="ru" ? "ПОЛУЧЕНО XP" : "XP EARNED";
            A(S.add.text(TX, cy+10, xpLblKey,
                {fontFamily:"LilitaOne,Arial,sans-serif", fontSize:"13px",
                 color:"#ffffff", stroke:"#000", strokeThickness:3}
            ).setOrigin(0, 0.5).setDepth(BD+1));

            const xpValTxt = A(S.add.text(VX, cy+10, "+0 XP",
                {fontFamily:"LilitaOne,Arial,sans-serif", fontSize:"18px",
                 color:"#66ddff", stroke:"#001833", strokeThickness:4}
            ).setOrigin(1, 0.5).setDepth(BD+1));

            const _xpC={v:0};
            S.tweens.add({
                targets:_xpC, v:sessionXP,
                duration:1000, delay:280, ease:"Quad.easeOut",
                onUpdate:()=>xpValTxt.setText("+"+Math.round(_xpC.v).toLocaleString()+" XP"),
                onComplete:()=>{
                    xpValTxt.setText("+"+sessionXP.toLocaleString()+" XP");
                    NT_SFX.play("xp_pickup");
                    S.tweens.add({targets:xpValTxt, scaleX:1.25, scaleY:1.25, duration:120, yoyo:true, ease:"Back.easeOut"});
                }
            });
            cy += 26;

            // ── GOLD KAZANILDI satırı — her zaman göster, 0 bile olsa ──
            const goldLblKey = CURRENT_LANG==="tr" ? "KAZANILAN ALTIN" : CURRENT_LANG==="ru" ? "ПОЛУЧЕНО ЗОЛОТА" : "GOLD EARNED";
            A(S.add.text(TX, cy+10, goldLblKey,
                {fontFamily:"LilitaOne,Arial,sans-serif", fontSize:"13px",
                 color:"#ffffff", stroke:"#000", strokeThickness:3}
            ).setOrigin(0, 0.5).setDepth(BD+1));

            // Value + icon on the right
            const goldValTxt = A(S.add.text(VX-34, cy+10, "+0",
                {fontFamily:"LilitaOne,Arial,sans-serif", fontSize:"18px",
                 color: goldEarned>0 ? "#ffdd44" : "#888a8a",
                 stroke:"#1a0c00", strokeThickness:4}
            ).setOrigin(1, 0.5).setDepth(BD+1)); // [FIX] icon büyüdüğü için X kaydırıldı
            if(S.textures.exists("icon_gold")){
                const gIc = A(S.add.image(VX-14, cy+10, "icon_gold").setDisplaySize(34,34).setDepth(BD+2)); // [FIX] büyütüldü
                if(goldEarned<=0) gIc.setAlpha(0.45);
            }

            if(goldEarned > 0){
                const _gC = {v:0};
                let _lastTick = 0;
                S.tweens.add({
                    targets:_gC, v:goldEarned,
                    duration:1000, delay:280, ease:"Quad.easeOut",
                    onUpdate:()=>{
                        const cur = Math.round(_gC.v);
                        goldValTxt.setText("+"+cur.toLocaleString());
                        if(cur-_lastTick >= Math.max(1, Math.floor(goldEarned/22))){
                            _lastTick = cur; NT_SFX.play("gold");
                        }
                    },
                    onComplete:()=>{
                        goldValTxt.setText("+"+goldEarned.toLocaleString());
                        S.tweens.add({targets:goldValTxt, scaleX:1.25, scaleY:1.25, duration:120, yoyo:true, ease:"Back.easeOut"});
                    }
                });
            } else {
                // Keep "+0" but subdued — player sees they earned nothing
                goldValTxt.setText("+0");
            }
            cy += 24;

            // Level up bildirimi
            if(result.levelsGained>0){
                secureSet("nt_lvup_pending",result.levelsGained);
                const lvUpStr=result.levelsGained>1
                    ?L("levelUp").replace("!","")+" ×"+result.levelsGained+"  →  Lv "+result.newLevel
                    :L("levelUp")+"  →  Lv "+result.newLevel;
                if(cy+24<=contentBot-4){
                    const lvUpG=A(S.add.graphics().setDepth(BD));
                    lvUpG.fillStyle(0x060e02,0.97); lvUpG.fillRoundedRect(TX,cy,VX-TX,22,6);
                    lvUpG.lineStyle(2,0x88ff44,0.90); lvUpG.strokeRoundedRect(TX,cy,VX-TX,22,6);
                    const lvUpTxt=A(S.add.text(TX+6,cy+11,lvUpStr,
                        {fontFamily:"LilitaOne,Arial,sans-serif",fontSize:"10px",color:"#88ff44",stroke:"#000",strokeThickness:3}
                    ).setOrigin(0,0.5).setDepth(BD+1));
                    if(result.goldEarned>0){
                        const goldEarnedTxt = A(S.add.text(VX-26,cy+11,"+"+result.goldEarned.toLocaleString(),
                            {fontFamily:"LilitaOne,Arial,sans-serif",fontSize:"10px",color:"#ffdd44",stroke:"#000",strokeThickness:2}
                        ).setOrigin(1,0.5).setDepth(BD+1));
                        if(S.textures.exists("icon_gold")){
                            A(S.add.image(VX-14,cy+11,"icon_gold").setDisplaySize(28,28).setDepth(BD+2)); // [FIX]
                        }
                    }
                    lvUpG.setAlpha(0); lvUpTxt.setAlpha(0);
                    S.tweens.add({targets:[lvUpG,lvUpTxt],alpha:1,duration:300,delay:1300,ease:"Quad.easeOut"});
                    S.time.delayedCall(1300,()=>{
                        S.cameras.main.flash(180,68,255,68,false);
                        NT_SFX.play("level_up");
                    });
                    cy+=26;
                }
            }

            if(PLAYER_LEVEL>=50&&result.levelsGained>0&&cy+16<=contentBot-4){
                A(S.add.text(CX,cy+3,"⭐ PRESTIGE AVAILABLE!",
                    {fontFamily:"LilitaOne,Arial,sans-serif",fontSize:"9px",color:"#ffaa44",stroke:"#000",strokeThickness:2}
                ).setOrigin(0.5).setDepth(BD));
                cy+=16;
            }
        }

        // (Share button removed — earnings display replaces it)

        // ── BUTONLAR ─────────────────────────────────────────────────
        const resetFn=()=>{
            Object.keys(UPGRADES).forEach(k=>UPGRADES[k].level=0);
            EVOLUTIONS.forEach(e=>e.active=false);
            SYNERGIES.forEach(s=>s.active=false);
            _debrisCount=0;
        };
        const BW=130, BH=44, BGAP=12;
        const BLX=CX-BW/2-BGAP/2, BRX=CX+BW/2+BGAP/2;
        NT_YellowBtn(S,BLX,btnCY,BW,BH,L("playAgain"),D,
            ()=>{ resetFn(); S.scene.restart(); }).forEach(o=>A(o));
        NT_YellowBtn(S,BRX,btnCY,BW,BH,L("mainMenu"),D,
            ()=>{ resetFn(); S.scene.manager.keys["SceneMainMenu"]?S.scene.start("SceneMainMenu"):S.scene.restart(); }).forEach(o=>A(o));

        objs.forEach(o=>{
            if(o===sprite) return;
            try{ o.setAlpha(0); S.tweens.add({targets:o,alpha:1,duration:200,delay:130}); }catch(_){}
        });

        // Post-death offer handled before panel (gem revive)
    }

    // ── GEM REVIVE PROMPT (Jetpack Joyride style) ─────────────
    // İkinci ölümde (gs._gemReviveUsed=true) direkt panel göster, revive şansı yok
    const GEM_REVIVE_COST = 10;
    const _canRevive = !gs._gemReviveUsed && !gs._crystalReviveUsed;
    let _reviveShown = false;
    let _reviveUsed  = false;

    // Tick-tock ses fonksiyonu — Web Audio API ile saat sesi
    function _playTickTock(isLast){
        try{ NT_SFX.play(isLast ? "countdown_go" : "countdown_tick"); }catch(_){}
    }

    function _showRevivePrompt(onDecline){
        if(_reviveShown) return;
        _reviveShown = true;
        const W2=360, H2=640, CX2=W2/2;
        const D2=960;
        const objs2=[]; const A2=o=>{objs2.push(o);return o;};
        const _cleanup=()=>objs2.forEach(o=>{try{o.destroy();}catch(_){}});

        const canAfford = PLAYER_GEMS >= GEM_REVIVE_COST;

        // ── Arka plan — yari saydam sicak overlay ──────────────
        A2(S.add.rectangle(CX2,H2/2,W2,H2,0x1a0800,0.78).setDepth(D2).setInteractive());

        // ── Panel — turuncu/amber ates temasi ───────────────────
        const PW=260, PH=264, PX=CX2-PW/2, PY=H2/2-PH/2-15; // [FIX] daha yuksek panel
        const panelG=A2(S.add.graphics().setDepth(D2+1));
        // Dis glow
        panelG.fillStyle(0xff6600,0.12); panelG.fillRoundedRect(PX-6,PY-6,PW+12,PH+12,20);
        // Ana panel — koyu amber zemin
        panelG.fillStyle(0x1a0a00,0.97); panelG.fillRoundedRect(PX,PY,PW,PH,14);
        // Ust serit — sicak turuncu
        panelG.fillStyle(canAfford?0xdd5500:0x442211,1);
        panelG.fillRoundedRect(PX,PY,PW,42,{tl:14,tr:14,bl:0,br:0});
        // Ust serit highlight
        panelG.fillStyle(0xffffff,0.12); panelG.fillRoundedRect(PX+4,PY+3,PW-8,10,{tl:11,tr:11,bl:0,br:0});
        // Kenar cizgisi
        panelG.lineStyle(2.5,canAfford?0xff8833:0x774422,0.9);
        panelG.strokeRoundedRect(PX,PY,PW,PH,14);
        // Ic kenar
        panelG.lineStyle(1,canAfford?0xff6600:0x553322,0.35);
        panelG.strokeRoundedRect(PX+3,PY+3,PW-6,PH-6,12);
        panelG.setAlpha(0).setScale(0.82);
        S.tweens.add({targets:panelG,alpha:1,scaleX:1,scaleY:1,duration:320,ease:"Back.easeOut"});

        // ── Baslik ───────────────────────────────────────────────
        const titleStr = L("revivePrompt");
        const titleT=A2(S.add.text(CX2,PY+21,titleStr,{
            fontFamily:"LilitaOne,Arial,sans-serif",fontSize:"17px",
            color:"#ffffff",stroke:"#5a1500",strokeThickness:4
        }).setOrigin(0.5).setDepth(D2+2).setAlpha(0));
        S.tweens.add({targets:titleT,alpha:1,duration:220,delay:120});

        // ── Gem cost — buyuk, parlak ─────────────────────────────
        const costStr = GEM_REVIVE_COST+" 💎";
        const costT=A2(S.add.text(CX2,PY+72,costStr,{
            fontFamily:"LilitaOne,Arial,sans-serif",fontSize:"30px",
            color:canAfford?"#ffcc44":"#886644",stroke:"#1a0800",strokeThickness:5
        }).setOrigin(0.5).setDepth(D2+2).setAlpha(0));
        S.tweens.add({targets:costT,alpha:1,duration:220,delay:160});

        // Mevcut gem sayisi
        const gemBalStr = (CURRENT_LANG==="tr"?"MEVCUT: ":"HAVE: ")+PLAYER_GEMS+" 💎";
        A2(S.add.text(CX2,PY+98,gemBalStr,{
            fontFamily:"LilitaOne,Arial,sans-serif",fontSize:"11px",
            color:canAfford?"#cc9944":"#885533",stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(D2+2).setAlpha(0));

        if(!canAfford){
            A2(S.add.text(CX2,PY+114,L("notEnoughGems"),{
                fontFamily:"LilitaOne,Arial,sans-serif",fontSize:"11px",
                color:"#ff6644",stroke:"#000",strokeThickness:2
            }).setOrigin(0.5).setDepth(D2+2));
        }

        // ── Geri sayim cemberi — altta ortada ────────────────────
        const TOTAL_TIME = 5000;
        // [FIX] Timer YES butonuyla cakisiyordu — asagi tasinip kucultuldu
        const TIMER_CX = CX2, TIMER_CY = PY+192, TIMER_R = 16; // [FIX] mutlak Y, PH değişiminden etkilenmiyor
        const timerG=A2(S.add.graphics().setDepth(D2+3));
        const timerTxt=A2(S.add.text(TIMER_CX,TIMER_CY,"5",{
            fontFamily:"LilitaOne,Arial,sans-serif",fontSize:"14px",
            color:"#ffdd44",stroke:"#1a0800",strokeThickness:3
        }).setOrigin(0.5).setDepth(D2+4).setAlpha(0));
        S.tweens.add({targets:timerTxt,alpha:1,duration:180,delay:200});

        let _elapsed=0, _done=false, _lastSec=5;
        const _drawTimer=(ratio)=>{
            timerG.clear();
            const col = ratio>0.6?0xff8800:ratio>0.35?0xffdd44:0xff3300;
            // Track (koyu)
            timerG.lineStyle(3,0x2a1000,1); timerG.strokeCircle(TIMER_CX,TIMER_CY,TIMER_R);
            // Fill arc
            if(ratio>0){
                timerG.lineStyle(3,col,1);
                timerG.beginPath();
                timerG.arc(TIMER_CX,TIMER_CY,TIMER_R,-Math.PI/2,-Math.PI/2+Math.PI*2*ratio,false);
                timerG.strokePath();
                // Tip glow
                const tipA = -Math.PI/2+Math.PI*2*ratio;
                timerG.fillStyle(0xffffff,0.7);
                timerG.fillCircle(TIMER_CX+Math.cos(tipA)*TIMER_R, TIMER_CY+Math.sin(tipA)*TIMER_R, 3);
            }
        };
        _drawTimer(1);

        // Tick sound her saniye
        _playTickTock(false);
        const _timerEv=S.time.addEvent({delay:33,loop:true,callback:()=>{
            if(_done) return;
            _elapsed+=33;
            const ratio=Math.max(0,1-_elapsed/TOTAL_TIME);
            const secs=Math.max(0,Math.ceil((TOTAL_TIME-_elapsed)/1000));
            _drawTimer(ratio);
            if(timerTxt.scene) timerTxt.setText(String(secs));
            // Tick sound her saniye degisiminde
            if(secs < _lastSec){ _lastSec=secs; _playTickTock(secs<=1); }
            if(_elapsed>=TOTAL_TIME){ _done=true; _timerEv.remove(); _cleanup(); onDecline(); }
        }});

        // ── YES butonu — her zaman göster, gem yoksa tıklayınca uyar ──
        {
            const yesStr = L("reviveBtn");
            const yBtnG=A2(S.add.graphics().setDepth(D2+2).setAlpha(0));
            const _drawYes=(h)=>{
                yBtnG.clear();
                // Gem varsa turuncu, yoksa gri
                const colMain = canAfford ? (h?0xdd6600:0xaa4400) : (h?0x555555:0x333333);
                yBtnG.fillStyle(colMain,1);
                yBtnG.fillRoundedRect(CX2-68,PY+130,136,36,11); // [FIX] mutlak Y
                yBtnG.fillStyle(0xffffff,h?0.20:0.12);
                yBtnG.fillRoundedRect(CX2-66,PY+131,132,13,{tl:10,tr:10,bl:0,br:0});
                yBtnG.lineStyle(2,canAfford?(h?0xffcc44:0xff8833):0x666666,0.9);
                yBtnG.strokeRoundedRect(CX2-68,PY+130,136,36,11);
            };
            _drawYes(false);
            const yesTxt=A2(S.add.text(CX2,PY+148,yesStr,{ // [FIX]
                fontFamily:"LilitaOne,Arial,sans-serif",fontSize:"17px",
                color:canAfford?"#ffee88":"#888888",stroke:"#1a1000",strokeThickness:4
            }).setOrigin(0.5).setDepth(D2+3).setAlpha(0));
            S.tweens.add({targets:[yBtnG,yesTxt],alpha:1,duration:250,delay:220});
            const yHit=A2(S.add.rectangle(CX2,PY+148,136,36,0xffffff,0.001) // [FIX]
                .setDepth(D2+4).setInteractive({useHandCursor:true}));
            yHit.on("pointerover",()=>_drawYes(true));
            yHit.on("pointerout",()=>_drawYes(false));
            yHit.on("pointerdown",()=>{
                if(_done||_reviveUsed) return;
                if(!canAfford){
                    // Gem yok — salla ve uyar
                    S.cameras.main.shake(30,0.006);
                    showHitTxt(S,180,280,L("notEnoughGems"),"#ff4444",false);
                    return;
                }
                _done=true; _reviveUsed=true;
                _timerEv.remove();
                NT_SFX.play("revive");
                spendGems(GEM_REVIVE_COST);
                _cleanup();
                // Overlay temizle
                try{ ov.destroy(); }catch(_){}
                try{
                    S.children.list
                        .filter(o=>o&&o.active&&typeof o.depth==="number"&&o.depth>=900&&o.depth<960)
                        .forEach(o=>{try{o.destroy();}catch(_){}});
                }catch(_){}
                gs.gameOver=false;
                gs._gemReviveUsed=true;
                gs.health=Math.min(gs.maxHealth,4);
                gs.invincible=true; gs._invT=0;
                gs.pickingUpgrade=false;
                gs._statsDirty=true;
                S.physics.resume();
                if(S.spawnEvent) S.spawnEvent.paused=false;
                try{ if(S.player) S.player.setVisible(true); }catch(_){}
                S.time.delayedCall(4000,()=>{ if(gs) gs.invincible=false; });
                S.cameras.main.fadeIn(350,0,0,0);
                S.cameras.main.flash(400,255,180,50,false);
                S.cameras.main.shake(180,0.018);
                NT_SFX.startMusic();
                NT_SFX.setMusicState("gameplay", 0.5);
                NT_SFX.startWindAmbience();
                try{ _showMobileBtns(S); }catch(_){}
                showHitTxt(S,180,220,L("revived"),"#ffcc44",true);
            });
        }

        // ── NO butonu ────────────────────────────────────────────
        // NO butonu arka plani
        const noBg2=A2(S.add.graphics().setDepth(D2+2).setAlpha(0));
        const _drawNo2=(h)=>{
            noBg2.clear();
            noBg2.fillStyle(h?0x442222:0x221111,0.95);
            noBg2.fillRoundedRect(CX2-70,PY+214,140,34,9); // [FIX] panel içinde
            noBg2.lineStyle(1.5,h?0xff6644:0x883333,0.8);
            noBg2.strokeRoundedRect(CX2-70,PY+214,140,34,9);
        };
        _drawNo2(false);
        S.tweens.add({targets:noBg2,alpha:1,duration:200,delay:320});
        const noT=A2(S.add.text(CX2,PY+231,L("reviveNo"),{ // [FIX]
            fontFamily:"LilitaOne,Arial,sans-serif",fontSize:"14px",
            color:"#cc8877",stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(D2+3).setAlpha(0).setInteractive({useHandCursor:true}));
        S.tweens.add({targets:noT,alpha:1,duration:200,delay:320});
        const noHit2=A2(S.add.rectangle(CX2,PY+231,140,34,0xffffff,0.001).setDepth(D2+4).setInteractive({useHandCursor:true})); // [FIX]
        noHit2.on("pointerover",()=>_drawNo2(true));
        noHit2.on("pointerout",()=>_drawNo2(false));
        noHit2.on("pointerdown",()=>{
            if(_done) return;
            _done=true; _timerEv.remove(); _cleanup(); onDecline();
        });
        noT.on("pointerdown",()=>{
            if(_done) return;
            _done=true; _timerEv.remove(); _cleanup(); onDecline();
        });

        // ── Nabiz animasyonu ─────────────────────────────────────
        if(canAfford) S.tweens.add({targets:costT,scaleX:1.07,scaleY:1.07,
            duration:600,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
    }

    // ── ÖLÜM ANIMASYONU — ayri sprite kullan ────────────────────
    let _reviveOrPanel = (delay) => {
        S.time.delayedCall(delay, ()=>{
            if(_canRevive){
                _showRevivePrompt(()=> S.time.delayedCall(50, _showPanel));
            } else {
                // İkinci ölüm: revive hakkı yok, direkt game over paneli
                _showPanel();
            }
        });
    };

    if(S.player && S.player.active && S.anims.exists("anim_death")){
        try{
            const _px = S.player.x;
            const _py = S.player.y;
            const _psc= S.player.scaleX || 2.0;
            const _pfl= S.player.flipX  || false;
            S.player.setVisible(false);
            const ds = S.add.sprite(_px, _py, "death")
                .setDepth(S.player.depth)
                .setScale(_psc)
                .setFlipX(_pfl)
                .setOrigin(0.5, 0.5); // merkez-merkez — origin(0.5,1) altta kaliyordu, frameler kayiyordu
            // Animasyon: 8 kare × 40x40, frameRate=10 → daha okunabilir
            if(!S.anims.exists("anim_death_fixed")){
                S.anims.create({
                    key:"anim_death_fixed",
                    frames: S.anims.generateFrameNumbers("death",{start:0,end:7}),
                    frameRate: 10,
                    repeat: 0
                });
            }
            ds.play("anim_death_fixed");
            ds.once("animationcomplete",()=>{
                // Son kare 0.3sn görünsün sonra sil
                S.time.delayedCall(300,()=>{
                    try{ ds.destroy(); }catch(_){}
                    _reviveOrPanel(80);
                });
            });
            // Güvenlik: animasyon olayı tetiklenmezse 1.5sn sonra devam et
            S.time.delayedCall(1500,()=>{
                if(ds && ds.active){ try{ds.destroy();}catch(_){} }
                _reviveOrPanel(80);
            });
            return; // aşağıdaki else'e düşme
        }catch(e){
            console.warn("[NT] Death anim sprite hatasi:", e);
        }
    }
    _reviveOrPanel(400);
    // Guvenlik: 6sn sonra panel acilmadiysa zorla ac
    S.time.delayedCall(6000, ()=>{ if(!_panelShown && !_reviveUsed && _reviveShown) _showPanel(); });
    // İkinci ölüm güvenliği: revive prompt hiç açılmayacaksa yine de panel aç
    if(!_canRevive){
        S.time.delayedCall(100, ()=>{ if(!_panelShown) _showPanel(); });
    }
}

// ── ELMAS ILE DIRILIS — 3 saniye geri sayim + Bitir butonu ─────
function showDiamondReviveScreen(S, bgOv){
    const W=360,H=640;
    const gs=GS;

    // Overlay koy — panel arka plani
    const dimOv=S.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(950);
    S.tweens.add({targets:dimOv,fillAlpha:0.85,duration:200});

    const panel=S.add.graphics().setDepth(951);
    // Panel arka plani
    panel.fillStyle(0x07000f,0.99); panel.fillRoundedRect(38,195,284,260,14);
    panel.lineStyle(3,0xaa00ff,0.9); panel.strokeRoundedRect(38,195,284,260,14);
    panel.lineStyle(1,0x660088,0.4); panel.strokeRoundedRect(43,200,274,250,11);
    panel.fillStyle(0xaa00ff,0.14); panel.fillRoundedRect(38,195,284,52,{tl:14,tr:14,bl:0,br:0});
    // Dekoratif yan cizgiler
    panel.fillStyle(0xaa00ff,0.5); panel.fillRect(38,195,4,260);
    panel.fillStyle(0xaa00ff,0.5); panel.fillRect(318,195,4,260);
    panel.setAlpha(0).setScale(0.85);
    S.tweens.add({targets:panel,alpha:1,scaleX:1,scaleY:1,duration:320,ease:"Back.easeOut"});

    // Baslik
    const titleTxt=S.add.text(W/2,218,L("reviveTitle"),{
        font:"bold 17px LilitaOne, Arial, sans-serif",color:"#cc44ff",
        stroke:"#000000",strokeThickness:3
    }).setOrigin(0.5).setDepth(952).setAlpha(0);
    S.tweens.add({targets:titleTxt,alpha:1,duration:250,delay:100});

    // Alt cizgi dekorasyon
    const deco=S.add.graphics().setDepth(952).setAlpha(0);
    deco.lineStyle(1,0xaa00ff,0.5); deco.lineBetween(58,236,302,236);
    S.tweens.add({targets:deco,alpha:1,duration:200,delay:150});

    // Elmas maliyeti bilgisi
    S.add.text(W/2,258,L("reviveCostInfo"),{
        font:"bold 14px LilitaOne, Arial, sans-serif",color:"#9966cc",align:"center"
    }).setOrigin(0.5).setDepth(952);

    S.add.text(W/2,278,L("reviveHpInfo"),{
        font:"bold 13px LilitaOne, Arial, sans-serif",color:"#ff8888"
    }).setOrigin(0.5).setDepth(952);

    // Elmas bakiyesi
    S.add.text(W/2,298,L("goGemsStatus")+" "+PLAYER_GEMS+" 💎",{
        font:"bold 14px LilitaOne, Arial, sans-serif",
        color:PLAYER_GEMS>=5?"#cc99ff":"#ff4444"
    }).setOrigin(0.5).setDepth(952);

    // ── GERI SAYIM DAIRESI ──
    let countdown=3;
    const cdCircle=S.add.graphics().setDepth(952);
    const cdTxt=S.add.text(W/2,334,countdown.toString(),{
        font:"bold 28px LilitaOne, Arial, sans-serif",color:"#ffffff",
        stroke:"#000",strokeThickness:3
    }).setOrigin(0.5).setDepth(953);

    const drawCountdownCircle=(t)=>{
        cdCircle.clear();
        // Dis halka arka plan
        cdCircle.lineStyle(5,0x330044,0.6); cdCircle.strokeCircle(W/2,334,26);
        // Dolgu — t=3..0
        const angle=-Math.PI/2; // 12 saatten basla
        const endAngle=angle+(2*Math.PI*(t/3));
        cdCircle.lineStyle(5,0xcc44ff,0.9);
        // Arc ciz (Phaser Graphics'te linePath ile)
        const steps=30;
        for(let s=0;s<steps;s++){
            const a1=angle+(endAngle-angle)*(s/steps);
            const a2=angle+(endAngle-angle)*((s+1)/steps);
            cdCircle.lineBetween(
                W/2+Math.cos(a1)*26,334+Math.sin(a1)*26,
                W/2+Math.cos(a2)*26,334+Math.sin(a2)*26
            );
        }
        // Ic parlama
        cdCircle.lineStyle(2,0xdd88ff,0.3); cdCircle.strokeCircle(W/2,334,20);
    };

    // Animated countdown
    let cdFrac=3;
    const cdTween=S.tweens.add({
        targets:{v:3},v:0,duration:3000,ease:"Linear",
        onUpdate:(tw)=>{
            cdFrac=tw.targets[0].v;
            drawCountdownCircle(cdFrac);
        },
        onComplete:()=>{
            cleanup();
            gameOver(S);
        }
    });
    drawCountdownCircle(3);

    const cdEvt=S.time.addEvent({delay:1000,repeat:2,callback:()=>{
        countdown--;
        if(cdTxt&&cdTxt.active){
            cdTxt.setText(countdown>0?countdown.toString():"OK");
            S.tweens.add({targets:cdTxt,scaleX:1.4,scaleY:1.4,duration:100,yoyo:true,ease:"Back.easeOut"});
        }
    }});

    const cleanup=()=>{
        cdTween.stop();
        cdEvt.remove();
        try{panel.destroy();dimOv.destroy();titleTxt.destroy();deco.destroy();cdCircle.destroy();cdTxt.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
        // [FIX-REVIVE] bgOv (dışarıdan geçirilen overlay) ve depth 900-969 arası kalan objeleri temizle
        try{ if(bgOv && bgOv.destroy) bgOv.destroy(); }catch(_){}
        S.children.list.filter(o=>o&&o.active&&typeof o.depth==="number"&&o.depth>=900&&o.depth<970)
            .forEach(o=>{try{o.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}});
    };

    // ── DIRIL BUTONU ──
    const revBg=S.add.graphics().setDepth(952);
    const drawRev=(hov)=>{
        revBg.clear();
        revBg.fillStyle(hov?0xcc44ff:0x660088,1);
        revBg.fillRoundedRect(W/2-110,370,220,44,10);
        revBg.lineStyle(2.5,0xdd88ff,hov?1:0.75);
        revBg.strokeRoundedRect(W/2-110,370,220,44,10);
        revBg.fillStyle(0xffffff,hov?0.12:0.05);
        revBg.fillRoundedRect(W/2-108,372,216,14,{tl:9,tr:9,bl:0,br:0});
    };
    drawRev(false);
    S.add.text(W/2,392,L("reviveBtnGem"),{
        font:"bold 13px LilitaOne, Arial, sans-serif",color:"#ffffff"
    }).setOrigin(0.5).setDepth(953);
    S.add.rectangle(W/2,392,220,44,0xffffff,0.001).setInteractive().setDepth(954)
        .on("pointerover",()=>drawRev(true))
        .on("pointerout",()=>drawRev(false))
        .on("pointerdown",()=>{
            if(PLAYER_GEMS<5){
                S.cameras.main.shake(30,0.006);
                return;
            }
            spendGems(5);
            cleanup();
            doRevive(S,null);
        });

    // ── BITIR BUTONU ──
    const endBg=S.add.graphics().setDepth(952);
    const drawEnd=(hov)=>{
        endBg.clear();
        endBg.fillStyle(hov?0x333344:0x111118,1);
        endBg.fillRoundedRect(W/2-80,422,160,32,8);
        endBg.lineStyle(1.5,hov?0x666688:0x333344,0.9);
        endBg.strokeRoundedRect(W/2-80,422,160,32,8);
    };
    drawEnd(false);
    S.add.text(W/2,438,L("reviveEndBtn"),{
        font:"bold 14px LilitaOne, Arial, sans-serif",color:"#888899"
    }).setOrigin(0.5).setDepth(953);
    S.add.rectangle(W/2,438,160,32,0xffffff,0.001).setInteractive().setDepth(954)
        .on("pointerover",()=>drawEnd(true))
        .on("pointerout",()=>drawEnd(false))
        .on("pointerdown",()=>{
            cleanup();
            gameOver(S);
        });
}

function doRevive(S, panel){
    const gs=GS;
    gs.gameOver=false;
    gs.usedExtraLife=true;
    gs._gemReviveUsed=true;   // ikinci ölümde direkt game over
    gs.health=Math.min(gs.maxHealth, 3);
    gs.invincible=true; gs._invT=0;
    gs.pickingUpgrade=false;
    gs._statsDirty=true;
    S.time.delayedCall(5000,()=>{ gs.invincible=false; });
    S.physics.resume();
    if(S.spawnEvent) S.spawnEvent.paused=false;
    try{if(panel)panel.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
    // [FIX-REVIVE] Karanlık overlay'i ve depth 900-959 arası tüm objeleri temizle.
    // gameOver() tarafından oluşturulan 'ov' (depth:900, setInteractive) ekranda
    // kalmaya devam ediyordu — tüm girişleri engelliyor ve ekranı karartıyordu.
    try{
        S.children.list
            .filter(o=>o&&o.active&&typeof o.depth==="number"&&o.depth>=900&&o.depth<960)
            .forEach(o=>{try{o.destroy();}catch(_){}});
    }catch(_){}
    // [FIX-REVIVE] Kamerayı karanlıktan kurtarmak için fadeIn
    try{ S.cameras.main.fadeIn(350,0,0,0); }catch(_){}
    // [FIX-REVIVE] Müziği yeniden başlat — gameOver() stopMusic() yapmıştı
    NT_SFX.startMusic();
    NT_SFX.setMusicState("gameplay", 0.5);
    NT_SFX.startWindAmbience();
    // [FIX-MOBİL] Revive sonrası mobil butonları göster
    try{ _showMobileBtns(S); }catch(_){}
    // Dirilis efekti
    NT_SFX.play("revive");
    S.cameras.main.shake(180,0.020);
    S.cameras.main.zoomTo(1.08,160,"Quad.easeOut");
    S.time.delayedCall(160,()=>S.cameras.main.zoomTo(1.0,400,"Quad.easeIn"));
    const plx=S.player?.x||180, ply=S.player?.y||420;
    try{ if(S.player) S.player.setVisible(true); }catch(_){}
    for(let rv=0;rv<4;rv++){
        S.time.delayedCall(rv*60,()=>{
            const rr=S.add.graphics().setDepth(30);
            rr.x=plx; rr.y=ply;
            rr.lineStyle(3-Math.min(rv,2),0xcc44ff,1.0); rr.strokeCircle(0,0,14+rv*14);
            S.tweens.add({targets:rr,scaleX:6,scaleY:6,alpha:0,duration:600,ease:"Quad.easeOut",onComplete:()=>rr.destroy()});
        });
    }
    showHitTxt(S,180,280,L("crystalRevivedFull"),"#cc44ff",true);
}

// ── TELEGRAM SKOR PAYLASIM ────────────────────────────────────
function shareTelegramScore(score, kills, level){
    const txt=`🎮 NOT FAIR\n🏆 Skor: ${score.toLocaleString()}\n☠ Kill: ${kills} | ⭐ Lv${level}\n👉 Sen de oyna!`;
    try{
        // Telegram Mini App API
        if(window.Telegram&&window.Telegram.WebApp){
            window.Telegram.WebApp.switchInlineQuery(txt);
        } else {
            // Fallback: clipboard kopyala
            navigator.clipboard?.writeText(txt).then(()=>alert("Skor panoya kopyalandi!")).catch(()=>{});
        }
    }catch(e){console.warn("[NT] Hata yutuldu:",e)}
}

// Resonance & efektler
function triggerResonance(S,src,depth){
    if((depth||0)>=2)return;
    const gs=GS;
    // [OPT] cache kullan — recursif cagrilarda getMatching'den kacin
    const _resEnemies=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
    const _stormActive=GS._evoStormCore; // [OPT] GS flag — EVOLUTIONS.find'dan kacin
    for(let _ri=0;_ri<_resEnemies.length;_ri++){
        const e=_resEnemies[_ri];
        if(e===src||!e||!e.active||e.lock||e.spawnProtected) continue;
        const dx=e.x-src.x,dy=e.y-src.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<gs.resonanceDist&&d>1){
            applyDmg(S,e,gs.damage*0.50,false); // [v9.2] Storm Core bonus pipeline'da — burada ayrica uygulanmaz
            triggerResonance(S,e,(depth||0)+1);
        }
    }
}
function doExplosion(S,x,y,showAnim=true){
    const gs=GS, lv=UPGRADES.explosive.level;
    // [BUFF] Heavy cannon always gets +40% explosion radius — satisfying splash, not dependent on Explosive upgrade
    const r=(44+lv*12) * (gs.activeWeapon==="heavy_cannon" ? 1.40 : 1.0);
    const _isHeavy = gs && gs.activeWeapon === "heavy_cannon";

    // ── LEVEL-BASED RENK — Explosive ──
    const _expColors = [
        {ring1:0xff8800,ring2:0xff4400,ember1:0xff6600,ember2:0xffcc00,smoke:0x333333},
        {ring1:0xff2244,ring2:0xcc0022,ember1:0xff4455,ember2:0xff8866,smoke:0x442222},
    ];
    const _exC = _expColors[Math.min(Math.max(lv-1, 0), _expColors.length-1)];

    // ── EXPLOSION SPRITE ANIMASYONU — sadece showAnim=true (öldürünce) ──
    if(showAnim && S.anims && S.anims.exists("anim_expl")){
        try{
            const sc=4.5+(lv*0.4);
            const es=S.add.sprite(x,y,"explosion").setDepth(25).setScale(sc).setAlpha(0.95);
            es.play("anim_expl");
            es.once("animationcomplete",()=>{ try{es.destroy();}catch(_){} });
        }catch(_){}
    }
    // ── HEAVY CANNON — ekstra exp1 animasyonlari (SKIP on mobile) ──
    if(_isHeavy && !_IS_MOBILE_EARLY && S.anims && S.anims.exists("anim_exp1")){
        const _exp1Configs = [
            {ox:0,  oy:0,  sc:5.5, delay:0},
            {ox:-18,oy:-8, sc:3.8, delay:55},
            {ox:20, oy:-5, sc:3.5, delay:90},
        ];
        _exp1Configs.forEach(cfg=>{
            S.time.delayedCall(cfg.delay, ()=>{
                if(!S||!S.add) return;
                try{
                    const es=S.add.sprite(x+cfg.ox, y+cfg.oy, "exp1")
                        .setDepth(27).setScale(cfg.sc).setAlpha(0.92);
                    es.play("anim_exp1");
                    es.once("animationcomplete",()=>{ try{es.destroy();}catch(_){} });
                }catch(_){}
            });
        });
    }
    // MOBILE PERF: skip inner glow, smoke, ember particles
    if(!_IS_MOBILE_EARLY){
    // [VFX OPT] Ic parlama — daha kucuk
    const inner=S.add.graphics().setDepth(22);
    inner.x=x; inner.y=y;
    inner.fillStyle(0xffffff,0.55); inner.fillCircle(0,0,r*0.18);
    S.tweens.add({targets:inner,scaleX:2.2,scaleY:2.2,alpha:0,duration:100,onComplete:()=>inner.destroy()});
    }
    // Ana patlama halkasi — azaltildi
    const eg=S.add.graphics().setDepth(21);
    eg.x=x; eg.y=y;
    eg.fillStyle(_exC.ring1,0.45); eg.fillCircle(0,0,r*0.55);
    if(!_IS_MOBILE_EARLY){ eg.fillStyle(_exC.ring2,0.30); eg.fillCircle(0,0,r); }
    S.tweens.add({targets:eg,scaleX:1.8,scaleY:1.8,alpha:0,duration:220,ease:"Quad.easeOut",onComplete:()=>eg.destroy()});
    // Duman bulutu — SKIP on mobile
    if(!_IS_MOBILE_EARLY){
    const smoke=S.add.graphics().setDepth(20);
    smoke.x=x; smoke.y=y-8;
    smoke.fillStyle(_exC.smoke,0.14); smoke.fillCircle(0,0,r*0.4);
    S.tweens.add({targets:smoke,y:smoke.y-14,scaleX:1.4,scaleY:1.4,alpha:0,duration:380,onComplete:()=>smoke.destroy()});
    }
    // Kor parcaciklari — SKIP on mobile
    if(!_IS_MOBILE_EARLY){
    for(let i=0;i<4;i++){
        const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        const sp=Phaser.Math.Between(40,r*0.9);
        const dp=S.add.graphics().setDepth(20);
        dp.fillStyle(i%2===0?_exC.ember1:_exC.ember2,0.85);
        dp.fillRect(-1,-1,Phaser.Math.Between(2,4),Phaser.Math.Between(2,4));
        dp.x=x; dp.y=y;
        S.tweens.add({targets:dp,x:x+Math.cos(ang)*sp,y:y+Math.sin(ang)*sp,alpha:0,duration:Phaser.Math.Between(160,320),ease:"Quad.easeOut",onComplete:()=>dp.destroy()});
    }
    }
    // [BUFF] Heavy cannon: stronger shake for satisfying feedback
    const _shakeAmt = gs.activeWeapon==="heavy_cannon" ? 0.0065 : 0.004;
    const _shakeDur = gs.activeWeapon==="heavy_cannon" ? 30      : 22;
    S.cameras.main.shake(_shakeDur,_shakeAmt);
    // Alan hasari — [CRASH FIX] cache degil fresh list: heavy_cannon+ucgen crash'ini onler
    // Cache 60ms gecikmeli → az once oldurulen dusman hâlâ active gorunebilir → body null → crash
    const _expEnemies=S.pyramids.getMatching("active",true);
    for(let _ei=0;_ei<_expEnemies.length;_ei++){
        const e=_expEnemies[_ei];
        // [CRASH FIX] body.enable + checkCollision.none kontrolu — devre disi body'ye erisim onlenir
        if(!e||!e.active||!e.body||!e.body.enable||e.body.checkCollision.none) continue;
        if(e.spawnProtected) continue;
        const dx=e.x-x, dy=e.y-y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<r+e.displayWidth*0.5){
            const falloff=Math.max(0.3,1-(d/r)*0.6);
            // [BUFF] Heavy cannon splash hits harder — 1.2→1.55 base multiplier
            const _splashMult = gs.activeWeapon==="heavy_cannon" ? 1.1+lv*0.20 : 1.2+lv*0.30;
            applyDmg(S,e,gs.damage*_splashMult*falloff,d<r*0.4);
        }
    }
    if(GS._evoPlagueBearer) spawnPoisonCloud(S,x,y); // [OPT] GS flag kullan
}
// ── KILL REWARD VFX v2 ────────────────────────────────────────
function vfxEnemyKillReward(S,px,py,enemyType,isElite,isBoss){
    if(!S||!_POOL) return;
    px=_snap(px); py=_snap(py);
    const typeColors={
        normal:0xFF88CC,fast:0xFF6699,tank:0xAA55FF,shield:0x55BBFF,
        kamikaze:0xFFBB55,ghost:0xDDBBFF,split:0xFFEE44,swarm:0xFFBB66,
        elder:0xFFCC44,spinner:0xFF55DD,armored:0x9977FF,bomber:0xFF9966,
        stealth:0x44FFDD,healer:0x66FFAA,magnet:0xFFCC33,mirror:0xCCAAFF,
        berserker:0xFF7799,absorber:0x33EEFF,chain:0x77AAFF,freezer:0xAAEEFF,
        leech:0xFF77BB,titan:0xDD55FF,shadow:0xBB88FF,spiker:0xFFDD66,
        vortex:0x33FFCC,phantom:0xEEBBFF,rusher:0xFFAA55,splitter:0x88FF88,
        toxic:0xBBFF44,colossus:0xFF66AA,inferno:0xFF9977,glacier:0x66DDFF,
        phantom_tri:0xFF55FF,volt:0xFFFF66,obsidian:0xCC77FF,zigzag:0x88FF88,
    };
    const col=typeColors[enemyType]||0xff88cc;
    const tier=isBoss?3:isElite?2:1;

    // Subtle slow-motion for elite/boss kills only
    if((isElite||isBoss)&&S.time){
        const prevTS=S.time.timeScale;
        S.time.timeScale=isBoss?0.22:0.62;
        S.time.delayedCall(isBoss?110:65,()=>{ if(S.time) S.time.timeScale=prevTS; });
    }

    // Score popup
    const scoreVal=isBoss?2000:isElite?300:50;
    if(GS&&GS.combo>1) vfxScorePopup(S,px,py-14,scoreVal,col);
}

// ── POISON ORB — Vampire Survivors iksiri gibi serbest ucar ──
function spawnPoisonOrb(S){
    const gs=GS, lv=UPGRADES.poison.level;
    const count=1+Math.floor(lv/2);
    for(let ci=0;ci<count;ci++){
        S.time.delayedCall(ci*400,()=>{
            if(GS.gameOver) return;
            // [OPT] cache kullan
            const enemies=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
            let tx,ty;
            if(enemies.length>0&&Math.random()<0.65){
                const e=enemies[Phaser.Math.Between(0,enemies.length-1)];
                tx=Phaser.Math.Clamp(e.x+Phaser.Math.Between(-40,40),30,330);
                ty=Phaser.Math.Clamp(e.y+Phaser.Math.Between(-20,20),60,GROUND_Y-40);
            } else {
                tx=Phaser.Math.Between(50,310);
                ty=Phaser.Math.Between(100,GROUND_Y-50);
            }
            // Direkt olustur — firlama animasyonu yok
            spawnPoisonCloudAt(S,tx,ty,lv);
        });
    }
}

// Lineer interpolasyon yardimci
function lerp(a,b,t){return a+(b-a)*t;}

function spawnPoisonCloudAt(S,x,y,lv){
    // Buyutulmus radius
    const r=55+lv*18;

    // ── LEVEL-BASED RENK SISTEMI ──
    const POISON_COLORS = [
        // Level 1: Yesil (klasik zehir)
        {main:0x44ff44, fill1:0x00bb33, fill2:0x00cc44, fill3:0x33ff66,
         particles:[0x00cc44,0x22dd55,0x44ff66,0x00aa33,0x66ff88,0x88ffaa,0x00ff55],
         outline:0x00cc44, outlineIn:0x44ff44, outlineDeep:0x88ffaa,
         core:0x00aa33, bubble:0x44ff44, bubbleStroke:0x88ffaa,
         popMain:0x44ff44, popMid:0xaaffaa, tint:0x55ff55, pip:0x44ff44},
        // Level 2: Mor-Toxic (gelismis zehir)
        {main:0xcc44ff, fill1:0x7700bb, fill2:0x8822cc, fill3:0xaa44ee,
         particles:[0x9933dd,0xaa44ee,0xbb55ff,0x7722cc,0xcc66ff,0xdd88ff,0x8833ee],
         outline:0x9933dd, outlineIn:0xbb55ff, outlineDeep:0xdd88ff,
         core:0x7700bb, bubble:0xbb55ff, bubbleStroke:0xdd88ff,
         popMain:0xcc44ff, popMid:0xddaaff, tint:0xaa66ff, pip:0xbb55ff},
    ];
    const ci = Math.min(lv, POISON_COLORS.length) - 1;
    const C = POISON_COLORS[Math.max(0, ci)];

    // ── Aninda ortaya cikis efekti ──
    const pop=S.add.graphics().setDepth(20);
    pop.x=x; pop.y=y;
    pop.fillStyle(C.popMain,0.65); pop.fillCircle(0,0,r*0.7);
    pop.fillStyle(C.popMid,0.45);  pop.fillCircle(0,0,r*0.35);
    pop.fillStyle(0xffffff,0.20);  pop.fillCircle(0,0,r*0.15);
    S.tweens.add({targets:pop,scaleX:1.8,scaleY:1.8,alpha:0,duration:320,ease:"Quad.easeOut",onComplete:()=>pop.destroy()});

    // ── Bulut: partikuller + dolgu ──────────────────
    const ptcls=[];

    // Yari saydam dolgu halkalari — bulut hissi
    const fill=S.add.graphics().setDepth(7);
    fill.fillStyle(C.fill1,0.22); fill.fillCircle(x,y,r);
    fill.fillStyle(C.fill2,0.14); fill.fillCircle(x,y,r*0.65);
    fill.fillStyle(C.fill3,0.08); fill.fillCircle(x,y,r*0.35);
    ptcls.push(fill);

    // Zehir partikulleri
    const colors=C.particles;
    for(let i=0;i<38;i++){
        const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        const dist=Phaser.Math.Between(4,r*0.92);
        const sz=Phaser.Math.Between(2,6);
        const col=colors[i%colors.length];
        const pt=S.add.graphics().setDepth(9);
        pt.x=x+Math.cos(ang)*dist;
        pt.y=y+Math.sin(ang)*dist;
        pt.fillStyle(col,0.60+Math.random()*0.35);
        if(i%3===0){ pt.fillCircle(0,0,sz); }
        else { pt.fillRect(-sz/2,-sz/2,sz,sz); }
        ptcls.push(pt);
        S.tweens.add({
            targets:pt,
            y:pt.y-Phaser.Math.Between(4,14),
            x:pt.x+Phaser.Math.Between(-6,6),
            duration:Phaser.Math.Between(700,1400),
            ease:"Sine.easeInOut",yoyo:true,repeat:1
        });
    }

    // Dis + ic cerceve
    const outline=S.add.graphics().setDepth(8);
    outline.lineStyle(2.5,C.outline,0.7); outline.strokeCircle(x,y,r);
    outline.lineStyle(1.2,C.outlineIn,0.35); outline.strokeCircle(x,y,r*0.6);
    outline.lineStyle(0.8,C.outlineDeep,0.18); outline.strokeCircle(x,y,r*0.3);
    ptcls.push(outline);

    // Merkez glow
    const core=S.add.graphics().setDepth(8);
    core.fillStyle(C.core,0.20); core.fillCircle(x,y,r*0.55);
    ptcls.push(core);

    // ── Yukselen kabarciklar ──
    for(let i=0;i<10;i++){
        const bx=x+Phaser.Math.Between(-r*0.7,r*0.7);
        const by=y+Phaser.Math.Between(-r*0.5,r*0.5);
        const bub=S.add.graphics().setDepth(10);
        bub.fillStyle(C.bubble,0.55); bub.fillCircle(0,0,Phaser.Math.Between(2,5));
        bub.lineStyle(0.8,C.bubbleStroke,0.4); bub.strokeCircle(0,0,Phaser.Math.Between(2,5)+1);
        bub.x=bx; bub.y=by;
        ptcls.push(bub);
        S.tweens.add({
            targets:bub,
            y:by-Phaser.Math.Between(12,28),
            alpha:0,
            duration:Phaser.Math.Between(800,1500),
            ease:"Quad.easeOut",
            delay:Phaser.Math.Between(0,800),
            onComplete:()=>{try{bub.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}
        });
    }

    // ── DOT hasari + yavaslatma ──
    const slowedEnemies=new Set();
    const _poisonTint = C.tint;
    const _poisonPip = C.pip;
    const dotEv=S.time.addEvent({delay:320,repeat:10,callback:()=>{
        if(GS.gameOver) return;
        const _dotEnemies=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
        for(let _di=0;_di<_dotEnemies.length;_di++){
            const e=_dotEnemies[_di];
            if(!e||!e.active) continue;
            const dx=e.x-x,dy=e.y-y;
            if(dx*dx+dy*dy<r*r*1.15){
                // Hasar artirildi
                applyDmg(S,e,0.55+(lv||1)*0.28,false);
                // Yavaslatma — bulut icindeyken
                if(!slowedEnemies.has(e)&&e.body){
                    slowedEnemies.add(e);
                    if(e._poisonOrigVY===undefined) e._poisonOrigVY=e.body.velocity.y;
                    if(e._poisonOrigVX===undefined) e._poisonOrigVX=e.body.velocity.x;
                    e.body.velocity.y=e._poisonOrigVY*0.3;
                    e.body.velocity.x=e._poisonOrigVX*0.3;
                    e._poisonSlowed=true;
                    e.setTint(_poisonTint);
                }
                if(Math.random()<0.5){
                    const pip=S.add.graphics().setDepth(17);
                    pip.x=e.x; pip.y=e.y-6;
                    pip.fillStyle(_poisonPip,0.8); pip.fillRect(-1.5,-2,3,6);
                    S.tweens.add({targets:pip,y:pip.y-14,alpha:0,duration:300,onComplete:()=>pip.destroy()});
                }
            } else if(e._poisonSlowed){
                // [BUG FIX] Alan disinda — orijinal hiza don (bolme degil kayitli deger)
                if(e.body && e._poisonOrigVY !== undefined){
                    e.body.velocity.y = e._poisonOrigVY;
                    e.body.velocity.x = e._poisonOrigVX || 0;
                }
                e._poisonSlowed=false;
                e._poisonOrigVY=undefined; e._poisonOrigVX=undefined;
                if(e.active&&!e.frozen) e.clearTint();
                slowedEnemies.delete(e);
            }
        }
    }});

    // ── Partikuller yavas soner ──
    const life=3200+lv*400;
    S.tweens.add({
        targets:ptcls,alpha:0,duration:life,ease:"Quad.easeIn",
        onComplete:()=>{
            dotEv.remove();
            ptcls.forEach(o=>{try{o.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}});
        }
    });
    S.tweens.add({targets:ptcls,scaleX:1.15,scaleY:1.15,duration:600,ease:"Sine.easeOut",yoyo:true});
}

function spawnPoisonCloud(S,x,y){
    spawnPoisonCloudAt(S,x,y,UPGRADES.poison.level);
}

function drawPoisonAura(S){}
// [v9.3] spawnMeteor KALDIRILDI — flame/meteor sistemi silindi

// [v9.3] doMeteorImpact KALDIRILDI — flame/meteor sistemi silindi
// ══════════════════════════════════════════════════════════════
// GAME FEEL v2 — Power Spikes, Near Death, Combo Break,
//               Hidden Synergy, Progressive Chaos, Forgiving
// ══════════════════════════════════════════════════════════════

// ── 1. POWER SPIKE YAZILARI — level/synergy/evo/yuksek combo ──
let _powerSpikeQ = [];   // {text, color, timer, txt, S}

function triggerPowerSpike(S, type){
    if(!S||!S.add) return;
    const msgs = {
        levelup:  { text: L("powerSpike_overload"),    color:"#88bbff", duration:1600 },
        synergy:  { text: L("powerSpike_unstoppable"), color:"#ff8800", duration:1800 },
        evo:      { text: L("powerSpike_godlike"),     color:"#44ff88", duration:2000 },
        combo20:  { text: L("powerSpike_overload"),    color:"#ffcc00", duration:1400 }
    };
    const m = msgs[type]; if(!m) return;
    const W=360, H=640;
    const txt = S.add.text(W/2, H/2-80, m.text, {
        font:"bold 28px LilitaOne, Arial, sans-serif",
        color:m.color, stroke:"#000000",
        strokeThickness:3
    }).setOrigin(0.5).setAlpha(0).setDepth(650).setScale(0.4);
    S.tweens.add({targets:txt, alpha:1, scaleX:1.1, scaleY:1.1,
        duration:160, ease:"Back.easeOut",
        onComplete:()=>{
            S.tweens.add({targets:txt, scaleX:1.0, scaleY:1.0, duration:80});
            S.time.delayedCall(m.duration-320, ()=>{
                S.tweens.add({targets:txt, alpha:0, y:txt.y-24,
                    duration:280, ease:"Quad.easeIn",
                    onComplete:()=>{ try{txt.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)} }});
            });
        }
    });
    // Kisa 0.7x slow motion — guc hissi
    if(type==="evo"||type==="synergy"){
        S.time.timeScale = 0.72;
        S.time.delayedCall(280, ()=>{ S.time.timeScale = 1.0; });
    }
    // Kamera hafif zoom punch
    S.cameras.main.zoomTo(1.06, 100, "Quad.easeOut");
    S.time.delayedCall(100, ()=> S.cameras.main.zoomTo(1.0, 250, "Quad.easeIn"));
}

function tickPowerSpikeWords(S, delta){
    const gs = GS; if(!gs||gs.gameOver) return;
    // Combo 20+ → OVERLOAD yazisi (5 sn'de 1 kez)
    if(gs.combo >= 20){
        gs._lastPowerSpikeCombo = (gs._lastPowerSpikeCombo||0) - delta;
        if(gs._lastPowerSpikeCombo <= 0){
            gs._lastPowerSpikeCombo = 5000;
            triggerPowerSpike(S, "combo20");
        }
    } else {
        gs._lastPowerSpikeCombo = 0;
    }
}

// ── 2. NEAR DEATH — dusuk can sistemi ──────────────────────────
function tickNearDeath(S){
    const gs = GS; if(!gs||gs.gameOver||!S) return;
    const ratio = gs.health / gs.maxHealth;
    if(ratio <= 0.20 && !gs._nearDeathActive){
        gs._nearDeathActive = true;
        gs._nearDeathDmgBoost = 1.0; // artik pipeline'da additive olarak isleniyor
        if(gs) gs._statsDirty=true;   // [v9.2] pipeline flag'i aktif — +10% additive dahil
        showHitTxt(S, 180, 200, L("nearDeath_buff"), "#ff2244", true);
    } else if(ratio > 0.20 && gs._nearDeathActive){
        gs._nearDeathActive = false;
        gs._nearDeathDmgBoost = 1.0;
        if(gs) gs._statsDirty=true;   // [v9.2] bonus kaldirildi
    }
}

function tickNearDeathPulse(S, delta){
    const gs = GS; if(!gs || gs.gameOver || !S || !S.add) return;
    const hpRatio = gs.health / gs.maxHealth;

    // ── DANGER VIGNETTE — kirmizi kenar efekti dusuk canda ──
    if(hpRatio <= 0.35){
        if(!S._dangerVignette){
            S._dangerVignette = S.add.graphics().setDepth(700).setScrollFactor(0);
            S._dangerVigLastAlpha = -1; // zorla ilk cizimi tetikle
        }
        const dv = S._dangerVignette;
        const intensity = Math.max(0, 1 - hpRatio / 0.35);
        const pulse = Math.sin(gs.t * 0.004) * 0.3 + 0.7;
        const alpha = intensity * 0.22 * pulse;
        // [PERF-FIX] Alpha 0.015'ten fazla degismemisse yeniden cizme — 10 fillRect/frame tasarrufu
        if(Math.abs(alpha - (S._dangerVigLastAlpha||0)) < 0.015) return;
        S._dangerVigLastAlpha = alpha;
        dv.clear();
        // Kenar golgeleri — gradient etkisi
        dv.fillStyle(0xff0000, alpha * 0.8);
        dv.fillRect(0, 0, 360, 25);
        dv.fillStyle(0xff0000, alpha * 0.4);
        dv.fillRect(0, 25, 360, 20);
        dv.fillStyle(0xff0000, alpha * 0.8);
        dv.fillRect(0, 615, 360, 25);
        dv.fillStyle(0xff0000, alpha * 0.4);
        dv.fillRect(0, 595, 360, 20);
        dv.fillStyle(0xff0000, alpha * 0.6);
        dv.fillRect(0, 0, 12, 640);
        dv.fillStyle(0xff0000, alpha * 0.3);
        dv.fillRect(12, 0, 10, 640);
        dv.fillStyle(0xff0000, alpha * 0.6);
        dv.fillRect(348, 0, 12, 640);
        dv.fillStyle(0xff0000, alpha * 0.3);
        dv.fillRect(338, 0, 10, 640);
    } else if(S._dangerVignette){
        if(S._dangerVigLastAlpha !== 0){ S._dangerVignette.clear(); S._dangerVigLastAlpha=0; }
    }
}

// ── 3. COMBO BREAK — cokus hissi ───────────────────────────────
function showComboBreak(S, lastCombo){
    if(!S||!S.add||lastCombo < 3) return;
    NT_SFX.play("combo_break");
    // High combo kirildiysa muzigi gameplay'e geri dondur
    if(lastCombo >= 15 && !GS?.bossActive){
        NT_SFX.setMusicState("gameplay", 2.0);
    }
    const W=360;
    const intensity = Math.min(lastCombo, 30);
    const str = L("comboBreak");
    const depth = 60;

    // Glow layer
    const glow = _jtGlow(S, W/2, 300, str, 17, "#ff4444", "#ff0000", depth, 0.28);
    if(glow){ glow.setAlpha(0).setScale(1.2); }

    const txt = S.add.text(W/2, 300, str, {
        fontFamily:"LilitaOne",
        fontSize:"17px",
        color:"#ff4444",
        stroke:"#220000",
        strokeThickness:4,
        padding:{x:3,y:2}
    }).setOrigin(0.5).setAlpha(0).setDepth(depth).setScale(1.2);

    const allObjs = [txt, glow].filter(Boolean);

    // Burst
    _jtBurst(S, W/2, 300, 0xff2200, 5, depth+1);

    S.tweens.add({targets:allObjs, alpha:0.95, scaleX:1.0, scaleY:1.0,
        duration:120, ease:"Quad.easeOut"});
    S.tweens.add({targets:allObjs, alpha:0, y:318, scaleX:0.7, scaleY:0.7,
        duration:500, delay:350, ease:"Quad.easeIn",
        onComplete:()=>{ _jtDestroy(allObjs); }});

    // Shake — combo breakage feel
    S.cameras.main.shake(60 + intensity*2, 0.006 + intensity*0.0003);
}

// ── 4. PROGRESSIVE CHAOS ────────────────────────────────────────
// Her dakika yogunluk artar. Mevcut director sistemini bozmuyor,
// sadece chaos state gore ek parcacik patlamasi tetikler.
let _chaosParticleTimer = 0;

function tickProgressiveChaos(S, delta){
    const gs = GS; if(!gs||gs.gameOver||gs.pickingUpgrade||!S||!S.add) return;
    const min = gs.t / 60000;  // gecen dakika

    // Chaos intensity: 0-1 min=0.0, 1-3 min=0.3, 3-5 min=0.6, 5+=1.0
    const chaos = min <= 1 ? 0 :
                  min <= 5 ? (min-1)/4 * 0.4 :    // 0→0.4 over min 1-5
                  min <= 10 ? 0.4 + (min-5)/5*0.25 : // 0.4→0.65 over min 5-10
                  Math.min(0.70, 0.65 + (min-10)*0.008); // slow creep to 0.70 cap

    gs._chaosLevel = chaos;

    // Chaos arttikca arka plan titresimi
    if(chaos > 0.5){
        _chaosParticleTimer += delta;
        const interval = Math.max(200, 1200 - chaos*1000);
        if(_chaosParticleTimer >= interval){
            _chaosParticleTimer = 0;
            // Ekran kenarinda kivilcim — dusmanlara degil, sadece gorsel
            if(!gs.pickingUpgrade){
                const W=360;
                const side = Math.random()<0.5 ? Phaser.Math.Between(0,20) : Phaser.Math.Between(W-20,W);
                const yp = Phaser.Math.Between(80, 400);
                const sp = S.add.graphics().setDepth(8);
                sp.fillStyle(chaos>0.75?0xff2244:0xff8800, 0.7);
                sp.fillRect(side, yp, Phaser.Math.Between(2,5), Phaser.Math.Between(2,5));
                S.tweens.add({targets:sp, y:sp.y-Phaser.Math.Between(30,70),
                    alpha:0, duration:Phaser.Math.Between(300,600),
                    ease:"Quad.easeOut", onComplete:()=>{ try{sp.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)} }});
            }
        }
    }

    // 5 dk+ overload: ekran kose glitch flaslari — kaldirildi (goz yorucu)
}

// ── 5. GIZLI SINERJI KESIF SISTEMI ────────────────────────────
let _hiddenSynergyChecked = false;
let _hiddenSynergyFrame = 0; // [PERF-FIX] throttle sayaci

function tickHiddenSynergy(S){
    const gs = GS; if(!gs||gs.gameOver) return;
    // [PERF-FIX] Her frame degil — sadece _statsDirty set olduysa veya 120 frame'de bir kontrol
    // (upgrade secimleri zaten _statsDirty=true yapiyor, hidden synergy de o sirada tetiklenir)
    _hiddenSynergyFrame++;
    if(!gs._statsDirty && _hiddenSynergyFrame < 120) return;
    _hiddenSynergyFrame = 0;
    SYNERGIES.forEach(syn=>{
        if(!syn.hidden) return;  // sadece hidden flag'li synergy'ler
        if(syn.active) return;
        const allMet = syn.req.every(key=>UPGRADES[key]&&UPGRADES[key].level>=syn.reqLv);
        if(!allMet) return;
        syn.active = true;
        syn.apply(gs);
        // Ozel gizli synergy efekti — "kesfedildi!" hissi
        showHiddenSynergyReveal(S, syn);
    });
}

function showHiddenSynergyReveal(S, syn){
    const W=360, H=640;
    const label = LLang(syn,"name","nameEN","nameRU");

    // 1. Guclu kamera efektleri
    S.cameras.main.shake(90, 0.010);
    
    S.cameras.main.zoomTo(1.10, 150, "Quad.easeOut");
    S.time.delayedCall(150, ()=> S.cameras.main.zoomTo(1.0, 350, "Quad.easeIn"));

    // 2. Kisa slow-mo
    S.time.timeScale = 0.5;
    S.time.delayedCall(400, ()=>{ S.time.timeScale = 1.0; });

    // 3. "GIZLI SINERJI" ust yazisi
    const hidLbl = S.add.text(W/2, H/2-66, L("hiddenSynergy"), {
        font:"bold 14px LilitaOne, Arial, sans-serif",
        color:"#ffffff"
    }).setOrigin(0.5).setAlpha(1).setVisible(false).setDepth(655);
    if(hidLbl&&hidLbl.setVisible){hidLbl.setVisible(true);hidLbl.setAlpha(0);}
    S.tweens.add({targets:hidLbl, alpha:1, duration:180, ease:"Back.easeOut"});
    S.time.delayedCall(2000, ()=>S.tweens.add({targets:hidLbl, alpha:0, duration:250,
        onComplete:()=>{ try{hidLbl.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)} }}));

    // 4. Synergy ismi — buyuk, parlayan
    const nameTxt = S.add.text(W/2, H/2-36, label, {
        font:"bold 22px LilitaOne, Arial, sans-serif",
        color: "#"+syn.color.toString(16).padStart(6,"0"),
        stroke:"#000000", strokeThickness:3
    }).setOrigin(0.5).setAlpha(0).setDepth(656).setScale(0.3);
    if(nameTxt&&nameTxt.setVisible){nameTxt.setVisible(true);nameTxt.setAlpha(0);}
    S.tweens.add({targets:nameTxt, alpha:1, scaleX:1.08, scaleY:1.08,
        duration:200, ease:"Back.easeOut",
        onComplete:()=>S.tweens.add({targets:nameTxt,scaleX:1,scaleY:1,duration:100})});
    S.time.delayedCall(2200, ()=>S.tweens.add({targets:nameTxt, alpha:0, y:nameTxt.y-20,
        duration:300, onComplete:()=>{ try{nameTxt.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)} }}));

    // 5. Halka patlamasi
    for(let i=0;i<4;i++){
        S.time.delayedCall(i*60, ()=>{
            const r=S.add.graphics().setDepth(654);
            r.x=W/2; r.y=H/2;
            r.lineStyle(3-Math.min(i,2), syn.color, 1.0);
            r.strokeCircle(0, 0, 10+i*18);
            S.tweens.add({targets:r, scaleX:14, scaleY:14, alpha:0,
                duration:550, ease:"Quad.easeOut",
                onComplete:()=>{ try{r.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)} }});
        });
    }

    // 6. Parcacik yagmuru — 22→10 adet
    for(let i=0;i<10;i++){
        S.time.delayedCall(i*28, ()=>{
            const ang = Phaser.Math.DegToRad(i*(360/10));
            const spd = Phaser.Math.Between(40,90);
            const sp  = S.add.graphics().setDepth(653);
            sp.x=W/2; sp.y=H/2;
            sp.fillStyle(syn.color, 0.8);
            sp.fillRect(-1,-2,3,5);
            S.tweens.add({targets:sp,
                x:sp.x+Math.cos(ang)*spd, y:sp.y+Math.sin(ang)*spd*0.75,
                alpha:0, scaleX:0.1, scaleY:0.1,
                duration:Phaser.Math.Between(300,540), ease:"Quad.easeOut",
                onComplete:()=>{ try{sp.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)} }});
        });
    }
}

// ── 6. FORGIVING MEKANIK — gizli grace window ──────────────────
// damagePlayer cagrilmadan once hafif grace kontrolu:
// Oyuncu son 180ms icinde mermi aldiysa, %30 sans ile hasari atla.
// Bu sistem oyuncunun fark etmeyecegi kadar ince.
function graceCheck(S){
    const gs = GS; if(!gs) return false;
    const now = gs.t || 0;
    const lastHit = gs._lastHitTime || 0;
    if(now - lastHit < 180 && Math.random() < 0.30){
        return true;  // hasar atlandi — grace
    }
    gs._lastHitTime = now;
    return false;
}

// ── 7. POWER SPIKE HOOK — level up'a bagla ─────────────────────
function onLevelUpPowerSpike(S){
    const gs = GS; if(!gs) return;
    // Her 5 level'da bir "OVERLOAD" spike
    if(gs.level % 5 === 0){
        S.time.delayedCall(350, ()=>triggerPowerSpike(S, "levelup"));
    }
}

// ── 8. QUICK RESTART — game over feedback ──────────────────────
// gameOver icindeki delayedCall'i 600→250ms'ye kisalt yapilacak
// (gameOver fonksiyonu patch'leniyor asagida)


// ══════════════════════════════════════════════════════════════
// GORSEL DENGE + BUG FIX v2
// ══════════════════════════════════════════════════════════════

// ── 1. FIZIKSEL DEBRIS — parcalar zemine duser ─────────────────
let _debrisCount = 0;
const MAX_DEBRIS = 6;  // [PERF] Daha agresif limit — FPS korumasi

// [PERF] Periyodik sahne temizleyici - devre disi, donma sorunu yarattigi icin
let _lastCleanupTime = 0;
// [PERF-FIX] Guvenli orphan temizleme — sadece alpha=0 + active=false + depth>200 objeleri siler.
// Oyun objelerini (dusman, mermi, xp) ASLA silmez; sadece tamamlanmis VFX artiklari temizler.
let _cleanupFrame = 0;
function periodicSceneCleanup(S){
    // Her 600 frame'de bir calistir (~10 saniye 60fps'te) — hic kasma yaratmaz
    _cleanupFrame++;
    if(_cleanupFrame < 600) return;
    _cleanupFrame = 0;
    if(!S || !S.children || !S.children.list) return;
    const list = S.children.list;
    const toDestroy = [];
    for(let i = 0; i < list.length; i++){
        const o = list[i];
        if(!o) continue;
        // Guvende olmak icin cok katli kontrol:
        // 1) active=false (devre disi)
        // 2) alpha=0 veya neredeyse 0 (gorunmez)
        // 3) depth > 200 (oyun objeleri degil — VFX/UI artigi)
        // 4) fizik body yok (oyuncu/mermi/dusman degil)
        // 5) texture key yok ya da "missing" (pool'dan kacan orphan grafik)
        try{
            if(!o.active && typeof o.alpha === "number" && o.alpha < 0.01
               && typeof o.depth === "number" && o.depth > 200
               && !o.body){
                toDestroy.push(o);
            }
        }catch(_){}
    }
    // Bir defada max 30 obje sil — spike onleme
    const limit = Math.min(toDestroy.length, 30);
    for(let i = 0; i < limit; i++){
        try{ toDestroy[i].destroy(); }catch(_){}
    }
}

function spawnFallingDebris(S, x, y, type, isBig){
    if(!S||!S.add) return;
    if(_debrisCount >= MAX_DEBRIS) return;
    if(!canSpawnParticle(isBig?"normal":"cheap")) return;
    const typeC={normal:0xFF88CC,fast:0xFF6699,tank:0xAA55FF,shield:0x55BBFF,kamikaze:0xFFBB55,ghost:0xDDBBFF,
        split:0xFFEE44,swarm:0xFFBB66,elder:0xFFCC44,spinner:0xFF55DD,armored:0x9977FF,bomber:0xFF9966,
        stealth:0x44FFDD,healer:0x66FFAA,magnet:0xFFCC33,mirror:0xCCAAFF,berserker:0xFF7799,absorber:0x33EEFF,
        chain:0x77AAFF,freezer:0xAAEEFF,leech:0xFF77BB,titan:0xDD55FF,shadow:0xBB88FF,spiker:0xFFDD66,
        vortex:0x33FFCC,phantom:0xEEBBFF,rusher:0xFFAA55,splitter:0x88FF88,toxic:0xBBFF44,colossus:0xFF66AA,
        inferno:0xFF9977,glacier:0x66DDFF,phantom_tri:0xFF55FF,volt:0xFFFF66,obsidian:0xCC77FF,zigzag:0x88FF88};
    const voltCols=[0xFFFF66,0xFFFFAA,0xFFEE44]; // candy electric yellows
    const col=type==="volt"?voltCols[Math.floor(Math.random()*3)]:type==="inferno"?[0xFF9977,0xFFBB88][Math.floor(Math.random()*2)]:(typeC[type]||0xddbb88);
    const cnt=isBig?2:1; // [PERF] timer yerine tween — sayi dusuruldu

    for(let i=0;i<cnt;i++){
        if(_debrisCount >= MAX_DEBRIS) break;
        _debrisCount++;
        const sz=isBig?Phaser.Math.Between(2,4):Phaser.Math.Between(1,3);
        const ang=Phaser.Math.DegToRad(Phaser.Math.Between(200,340));
        const spd=Phaser.Math.Between(40,isBig?120:80);
        const db=S.add.graphics().setDepth(14);
        db.x=x+Phaser.Math.Between(-10,10);
        db.y=y+Phaser.Math.Between(-5,5);
        const dbAng=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        db.lineStyle(Math.max(1,sz*0.6),col,0.9);
        db.lineBetween(0,0,Math.cos(dbAng)*sz,Math.sin(dbAng)*sz);

        // [PERF] addEvent(delay:16,repeat:-1) yerine tek bir tween — cok daha ucuz
        const dur=Phaser.Math.Between(500,900);
        S.tweens.add({
            targets:db,
            x: db.x + Math.cos(ang)*spd,
            y: Math.min(db.y + Math.sin(ang)*spd + 40, GROUND_Y-sz/2),
            angle: db.angle + Phaser.Math.Between(-180,180),
            alpha: 0,
            duration: dur,
            ease:"Quad.easeOut",
            onComplete:()=>{
                try{db.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                _debrisCount=Math.max(0,_debrisCount-1);
            }
        });
    }
}

// ── 2. BUILD TITLE SISTEMI ─────────────────────────────────────
function getBuildTitle(){
    const actSyn=SYNERGIES.filter(s=>s.active).map(s=>s.id);

    // Sinerji bazli isimler (oncelikli)
    // [v9.3] toxic_fire ve meteor_explosion build title'dan kaldirildi
    if(actSyn.includes("chain_storm"))     return {tr:"⚡ SIMSEK CELLADI",   en:"⚡ LIGHTNING REAPER", ru:"⚡ ПОЖНЕЦ МОЛНИЙ", c:0xffff44};
    if(actSyn.includes("cryo_shatter"))    return {tr:"❄ BEDEN DONDURUCU",  en:"❄ FLESH FREEZER",   ru:"❄ ЗАМОРОЗЧИК",    c:0x88ddff};
    if(actSyn.includes("laser_focus"))     return {tr:"🎯 LAZER USTA",       en:"🎯 LASER MASTER",    ru:"🎯 МАСТЕР ЛАЗЕРА", c:0xff2200};
    if(actSyn.includes("rapid_freeze"))    return {tr:"❄ BLASTER DONDURUCU",en:"❄ CRYO BLASTER",    ru:"❄ КРИО БЛАСТЕР",  c:0x88ddff};
    if(actSyn.includes("cannon_poison"))   return {tr:"☣ ZEHIRLI PATLAMA",  en:"☣ TOXIC BOOM",      ru:"☣ ТОКСИК БУМ",    c:0x88ff44};
    if(actSyn.includes("precision_crit"))  return {tr:"🎯 KILIC USTASI",     en:"🎯 BLADE MASTER",   ru:"🎯 МАСТЕР КЛИНКА", c:0xff2244};
    if(actSyn.includes("chain_lightning")) return {tr:"⚡ YILDIRIM ZINCIRI", en:"⚡ THUNDER CHAIN",  ru:"⚡ ЦЕПЬ МОЛНИЙ",   c:0x44aaff};
    // [v10.0] Reflection Rifle build titles
    if(actSyn.includes("reflect_freeze"))    return {tr:"❄ KRIYO YANSIMA",   en:"❄ CRYO MIRROR",    ru:"❄ ЛЕДЯНОЕ ЗЕРКАЛО", c:0x20ccaa};
    if(actSyn.includes("reflect_explosive")) return {tr:"💥 SEKME BOMBASI",   en:"💥 RICOCHET BOMB",  ru:"💥 РИКОШЕТ-БОМБА",  c:0x20ccaa};
    if(GS&&GS._evoMirrorStorm)              return {tr:"🌀 AYNA FIRTINASI",  en:"🌀 MIRROR STORM",   ru:"🌀 ЗЕРКАЛЬНЫЙ ШТОРМ",c:0x20ccaa};
    if(actSyn.some(s=>s.startsWith("hidden"))) return {tr:"✦ GIZEM VALISI",en:"✦ MYSTERY HERALD",   ru:"✦ ВЕСТНИК ТАЙНЫ",  c:0xcc44ff};

    return null;
}

function showBuildTitle(S){
    const info=getBuildTitle();
    if(!info||!S||!S.add) return;
    const txt=CURRENT_LANG==="ru"?info.ru:CURRENT_LANG==="en"?info.en:info.tr;
    const W=360,H=640;

    const bg=S.add.graphics().setDepth(620);
    bg.fillStyle(0x000000,0.72); bg.fillRoundedRect(W/2-120,H/2-28,240,48,8);
    bg.lineStyle(2,info.c,0.9); bg.strokeRoundedRect(W/2-120,H/2-28,240,48,8);
    bg.setAlpha(0);

    const lbl=S.add.text(W/2,H/2-4,txt,{
        font:"bold 15px LilitaOne, Arial, sans-serif",
        color:"#"+info.c.toString(16).padStart(6,"0"),
        wordWrap:{width:220},align:"center"
    }).setOrigin(0.5).setDepth(621).setAlpha(1).setVisible(false);

    S.tweens.add({targets:[bg,lbl],alpha:1,duration:280,ease:"Back.easeOut"});
    
    S.cameras.main.zoomTo(1.06,120,"Quad.easeOut");
    S.time.delayedCall(120,()=>S.cameras.main.zoomTo(1.0,300,"Quad.easeIn"));

    S.time.delayedCall(2800,()=>{
        S.tweens.add({targets:[bg,lbl],alpha:0,duration:320,ease:"Quad.easeIn",
            onComplete:()=>{try{bg.destroy();lbl.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    });
}

// ── 3. GROUND CLAMP — XP orb ve diger objeler ──────────────────
function clampToGround(obj, margin){
    if(!obj) return;
    const maxY=GROUND_Y-(margin||8);
    if(obj.y>maxY) obj.y=maxY;
}

// ── 4. SPAWN FLOW DENGESI ek kontrol ──────────────────────────
function getSpawnDifficultyMultiplier(gs){
    // Ilk 30 sn cok nazik baslangic
    const sec=gs.t/1000;
    if(sec<30) return 0.4+sec/30*0.6;
    if(sec<60) return 0.8+( sec-30)/30*0.2;
    return 1.0;
}


// ── OYUNCU CARPISMA PATLAMASI ──────────────────────────────────
function playerCollisionExplosion(S, x, y, type){
    if(!S||!S.add) return;
    // u2500u2500 EXPLOSION SPRITE (du00fcu015fman zemine u00e7arptu0131u011fu0131nda) u2500u2500
    if(S.anims && S.anims.exists("anim_expl")){
        try{
            const es=S.add.sprite(x,y,"explosion").setDepth(23).setScale(3.2).setAlpha(0.92);
            es.play("anim_expl");
            es.once("animationcomplete",()=>{ try{es.destroy();}catch(_){} });
        }catch(_){}
    }
    const typeC={normal:0xFF88CC,fast:0xFF6699,tank:0xAA55FF,shield:0x55BBFF,kamikaze:0xFFBB55,ghost:0xDDBBFF,
        split:0xFFEE44,swarm:0xFFBB66,elder:0xFFCC44,spinner:0xFF55DD,armored:0x9977FF,bomber:0xFF9966,
        stealth:0x44FFDD,healer:0x66FFAA,magnet:0xFFCC33,mirror:0xCCAAFF,berserker:0xFF7799,absorber:0x33EEFF,
        chain:0x77AAFF,freezer:0xAAEEFF,leech:0xFF77BB,titan:0xDD55FF,shadow:0xBB88FF,spiker:0xFFDD66,
        vortex:0x33FFCC,phantom:0xEEBBFF,rusher:0xFFAA55,splitter:0x88FF88,toxic:0xBBFF44,colossus:0xFF66AA,
        inferno:0xFF9977,glacier:0x66DDFF,phantom_tri:0xFF55FF,volt:0xFFFF66,obsidian:0xCC77FF,zigzag:0x88FF88};
    const col=typeC[type]||0xffaa44;

    // 1. Genisleyen halka — ince, temiz
    const ring=S.add.graphics().setDepth(21);
    ring.x=x; ring.y=y;
    ring.lineStyle(2,col,0.75); ring.strokeCircle(0,0,7);
    S.tweens.add({targets:ring,scaleX:3.0,scaleY:3.0,alpha:0,
        duration:200,ease:"Quad.easeOut",onComplete:()=>{try{ring.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});

    // 2. Parcacik sacilmasi — ince cizgiler, dikdortgen YOK
    for(let i=0;i<4;i++){
        const ang=Phaser.Math.DegToRad(i*90+Phaser.Math.Between(-18,18));
        const spd=Phaser.Math.Between(30,70);
        const pc=S.add.graphics().setDepth(20);
        pc.x=x; pc.y=y;
        pc.lineStyle(1.5,i%2===0?col:0xffffff,0.85);
        pc.lineBetween(0,0,Math.cos(ang)*3,Math.sin(ang)*3);
        S.tweens.add({targets:pc,
            x:x+Math.cos(ang)*spd, y:y+Math.sin(ang)*spd*0.6,
            alpha:0,scaleX:0.1,scaleY:0.1,
            duration:Phaser.Math.Between(110,190),ease:"Quad.easeOut",
            onComplete:()=>{try{pc.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    }
    // shake wrapper zaten cap'liyor — oldugu gibi birak
    S.cameras.main.shake(30,0.004);
}


// ════════════════════════════════════════════════════════════════
// AAA VFX MODULE  —  Not Fair v9.0 VFX Engine
// ════════════════════════════════════════════════════════════════

// ── GLOBAL VFX STATE ─────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
// NT_VFX SYSTEM v2 — Object Pool + Juicy VFX Engine
// ════════════════════════════════════════════════════════════════
const NT_VFX = {
    _game:null, _scene:null,
    vignette:null, comboAura:null, comboRing:null,
    _glowPulseT:0, _idleT:0, _ambientT:0,
    _hurtFlashTimer:0, _comboRingAngle:0,
    _initialized:false,
};

// Keep legacy _VFX alias so any remaining references still work
const _VFX = NT_VFX;

// ── Object Pool ─────────────────────────────────────────────────
class ParticlePool {
    constructor(scene, maxSize=120){
        this._scene=scene; this._pool=[]; this._maxSize=maxSize; this._active=0;
    }
    get(depth=20){
        let g;
        if(this._pool.length>0){
            g=this._pool.pop();
            try{ g.clear().setDepth(depth).setAlpha(1).setScale(1)
                  .setPosition(0,0).setAngle(0).setVisible(true).setActive(true); }catch(e){}
        } else {
            if(this._active>=this._maxSize) return null;
            g=this._scene.add.graphics().setDepth(depth);
        }
        this._active++;
        return g;
    }
    release(g){
        if(!g) return;
        try{ g.clear().setAlpha(0).setVisible(false).setActive(false); }catch(e){}
        this._active=Math.max(0,this._active-1);
        if(this._pool.length<this._maxSize){ this._pool.push(g); }
        else{ try{g.destroy();}catch(e){} }
    }
}
let _POOL=null;

// ── Pool tween helper (auto-release on complete) ─────────────────
function _pt(S,g,cfg){
    S.tweens.add({targets:g,...cfg,
        onComplete:()=>{ if(_POOL)_POOL.release(g); else{try{g.destroy();}catch(e){}} }
    });
}
// Integer-snap helper — prevents sub-pixel jitter
function _snap(v){ return Math.round(v); }

// ── INIT — SceneGame.create() icinde cagrilir ────────────────
function initVFX(S){
    if(!S||!S.add) return;
    NT_VFX._scene=S;
    NT_VFX._initialized=true;
    _POOL=new ParticlePool(S,160);

    // Vignette (static, drawn once)
    NT_VFX.vignette=S.add.graphics().setDepth(199).setAlpha(0.30);
    _drawVignette();

    // Combo aura (persistent, redrawn each frame)
    NT_VFX.comboAura=S.add.graphics().setDepth(14).setAlpha(0);
    NT_VFX.comboRing=S.add.graphics().setDepth(14).setAlpha(0);

    // ── Ambient environment layers ──────────────────────────────
    // Warm ground glow
    const warmGlow=S.add.graphics().setDepth(1).setAlpha(0.040);
    warmGlow.fillGradientStyle(0xff5500,0xff5500,0x000000,0x000000,1,1,0,0);
    warmGlow.fillRect(0,GROUND_Y-50,360,70);
    S.tweens.add({targets:warmGlow,alpha:0.075,duration:3400,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

    // Cool sky glow
    const coolGlow=S.add.graphics().setDepth(1).setAlpha(0.025);
    coolGlow.fillGradientStyle(0x000000,0x000000,0x003366,0x003366,0,0,1,1);
    coolGlow.fillRect(0,0,360,130);
    S.tweens.add({targets:coolGlow,alpha:0.050,duration:5200,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

    // Subtle mid-field depth line
    const depthLine=S.add.graphics().setDepth(2).setAlpha(0.06);
    depthLine.fillStyle(0x000000,1);
    depthLine.fillRect(0,GROUND_Y-2,360,3);
}

function _drawVignette(){
    const g=NT_VFX.vignette; if(!g) return;
    g.clear();
    const W=360,H=640,d=82;
    g.fillGradientStyle(0x000000,0x000000,0x000000,0x000000,0.65,0.65,0,0); g.fillRect(0,0,W,d);
    g.fillGradientStyle(0x000000,0x000000,0x000000,0x000000,0,0,0.65,0.65); g.fillRect(0,H-d,W,d);
    g.fillGradientStyle(0x000000,0x000000,0x000000,0x000000,0.52,0,0.52,0); g.fillRect(0,0,d,H);
    g.fillGradientStyle(0x000000,0x000000,0x000000,0x000000,0,0.52,0,0.52); g.fillRect(W-d,0,d,H);
}

// ── TICK — SceneGame.update() icinde cagrilir ────────────────
function tickVFX(S,delta){
    if(!NT_VFX._initialized||!GS) return;
    const dt=delta/1000;
    NT_VFX._glowPulseT+=dt; NT_VFX._idleT+=dt; NT_VFX._ambientT+=dt;

    // Hurt vignette flash decay
    if(NT_VFX._hurtFlashTimer>0){
        NT_VFX._hurtFlashTimer-=delta;
        const p=Math.max(0,NT_VFX._hurtFlashTimer/380);
        if(NT_VFX.vignette) NT_VFX.vignette.setAlpha(0.30+p*0.62);
    } else {
        if(NT_VFX.vignette) NT_VFX.vignette.setAlpha(0.30);
    }

    // [MOBILE PERF] Combo aura ve ambient dust mobilede devre disi — her frame Graphics.clear+draw cok pahali
    if(_IS_MOBILE_EARLY) return;

    // Combo aura
    const combo=GS.combo||0;
    if(combo>=3&&S.player&&S.player.active){
        _tickComboAura(S,combo,dt);
    } else {
        if(NT_VFX.comboAura) NT_VFX.comboAura.setAlpha(Math.max(0,(NT_VFX.comboAura.alpha||0)-dt*4));
        if(NT_VFX.comboRing) NT_VFX.comboRing.setAlpha(Math.max(0,(NT_VFX.comboRing.alpha||0)-dt*4));
    }

    // Ambient dust — rate-limited, performance-gated
    if(_perfMode!=="low"&&NT_VFX._ambientT>0.32&&!GS.pickingUpgrade){
        NT_VFX._ambientT=0;
        _spawnAmbientDust(S);
    }
}

function _spawnAmbientDust(S){
    if(!_POOL||!S||!S.add) return;
    const g=_POOL.get(2); if(!g) return;
    const x=_snap(Phaser.Math.Between(10,350));
    const y=_snap(Phaser.Math.Between(GROUND_Y-130,GROUND_Y-8));
    g.fillStyle(0xffffff,0.055);
    g.fillRect(0,0,Phaser.Math.Between(1,3),Phaser.Math.Between(1,2));
    g.setPosition(x,y);
    _pt(S,g,{y:y-Phaser.Math.Between(20,55),alpha:0,
        duration:Phaser.Math.Between(1000,2000),ease:"Sine.easeOut"});
}

function _tickComboAura(S,combo,dt){
    if(!S.player||!NT_VFX.comboAura) return;
    const px=_snap(S.player.x),py=_snap(S.player.y);
    const t=NT_VFX._glowPulseT;
    const intensity=Math.min(1,combo/15);
    const col=combo>=15?0xffcc00:combo>=9?0xff2244:0xff8800;
    const col2=combo>=15?0xffee88:combo>=9?0xff4466:0xffaa44;
    const aura=NT_VFX.comboAura;
    aura.clear();
    const r1=26+Math.sin(t*3.2)*4+combo*0.8;
    aura.fillStyle(col,0.05+intensity*0.07); aura.fillCircle(px,py,r1*1.8);
    aura.fillStyle(col2,0.10+intensity*0.07); aura.fillCircle(px,py,r1);
    if(combo>=5){
        const dotCount=Math.min(8,Math.floor(combo/2));
        for(let i=0;i<dotCount;i++){
            const a=t*2.1+i*(Math.PI*2/dotCount);
            const r=r1*(0.6+Math.sin(t*1.8+i)*0.2);
            aura.fillStyle(0xffffff,0.50+Math.sin(t*4+i)*0.28);
            aura.fillRect(_snap(px+Math.cos(a)*r)-1,_snap(py+Math.sin(a)*r*0.55)-1,2,2);
        }
    }
    aura.setAlpha(Math.min(1,aura.alpha+dt*5));
    NT_VFX._comboRingAngle+=dt*(1.5+intensity*2.5);
    const ring=NT_VFX.comboRing; ring.clear();
    if(combo>=7){
        const segs=Math.min(6,2+Math.floor(combo/4));
        for(let i=0;i<segs;i++){
            const a=NT_VFX._comboRingAngle+i*(Math.PI*2/segs);
            ring.fillStyle(col,0.85);
            ring.fillRect(_snap(px+Math.cos(a)*(r1+6))-1,_snap(py+Math.sin(a)*(r1+6)*0.55)-1,3,3);
        }
        ring.lineStyle(1.5,col,0.28+intensity*0.40);
        ring.strokeEllipse(px,py,(r1+6)*2,(r1+6)*1.1);
    }
    ring.setAlpha(Math.min(1,ring.alpha+dt*5));
}

function _triggerChromatic(S,x,y,duration){ /* disabled — eye-strain */ }

// ── PERFECT HIT VFX ──────────────────────────────────────────
function vfxPerfectHit(S,ex,ey,combo){
    if(!S||!S.add) return;
    const tier=combo>=15?3:combo>=8?2:combo>=3?1:0;

    // 1. Shockwave halkalari — sadece ince cizgi, dolu daire/flare YOK
    [0xffee44,0xffaa00].forEach((rc,ri)=>{
        const rg=S.add.graphics().setDepth(28);
        rg.x=ex; rg.y=ey;
        rg.lineStyle(ri===0?3:1.5,rc,0.8-ri*0.25); rg.strokeCircle(0,0,5+ri*3);
        S.tweens.add({targets:rg,scaleX:4+tier*1.2+ri,scaleY:4+tier*1.2+ri,alpha:0,
            duration:240+ri*50+tier*50,ease:"Quad.easeOut",delay:ri*25,
            onComplete:()=>{try{rg.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    });

    // 3. Radyal isinlar — sayi azaltildi
    const rayCount=6+tier*2;
    for(let i=0;i<rayCount;i++){
        const ang=Phaser.Math.DegToRad(i*(360/rayCount)+Phaser.Math.Between(-10,10));
        const len=Phaser.Math.Between(14+tier*6,38+tier*14);
        const ray=S.add.graphics().setDepth(29);
        ray.x=ex; ray.y=ey;
        ray.lineStyle(1+tier*0.3,i%2===0?0xffee44:0xffffff,0.8);
        ray.lineBetween(0,0,Math.cos(ang)*len,Math.sin(ang)*len*0.6);
        S.tweens.add({targets:ray,scaleX:0,scaleY:0,alpha:0,
            duration:160+tier*30,ease:"Quad.easeOut",onComplete:()=>{try{ray.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    }

    // 4. Spark trail — ince cizgiler
    const sparkCount=3+tier*2;
    for(let i=0;i<sparkCount;i++){
        S.time.delayedCall(i*22,()=>{
            const sang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
            const sp=S.add.graphics().setDepth(30);
            sp.x=ex+Phaser.Math.Between(-8,8); sp.y=ey+Phaser.Math.Between(-6,6);
            sp.lineStyle(1.2,0xffffff,0.85);
            sp.lineBetween(0,0,Math.cos(sang)*(4+tier*2),Math.sin(sang)*(4+tier*2));
            S.tweens.add({targets:sp,
                x:sp.x+Math.cos(sang)*(16+tier*8),y:sp.y+Math.sin(sang)*(12+tier*6),
                alpha:0,scaleY:0.1,duration:Phaser.Math.Between(110,200),ease:"Quad.easeOut",
                onComplete:()=>{try{sp.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
        });
    }

    // 6. Kamera shake — hafif, kontrollu (flash YOK)
    S.cameras.main.shake(30+tier*15,0.0015+tier*0.0015);

    // 7. Chromatic — sadece tier 2+, kisa sure
    if(tier>=2) _triggerChromatic(S,ex,ey,60+tier*30);

    // 8. Zemin catlagi — sadece tier 3
    if(tier>=3){
        const crack=S.add.graphics().setDepth(6);
        crack.lineStyle(1.5,0xffcc00,0.65);
        crack.lineBetween(ex,GROUND_Y,ex-28,GROUND_Y+6);
        crack.lineBetween(ex,GROUND_Y,ex+22,GROUND_Y+5);
        crack.lineStyle(1,0xff8800,0.4);
        crack.lineBetween(ex-4,GROUND_Y+2,ex-40,GROUND_Y+3);
        S.tweens.add({targets:crack,alpha:0,duration:500,ease:"Quad.easeIn",
            onComplete:()=>{try{crack.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});

        // Tier 3: "✦ PERFECT" with glow
        const pfStr="✦ PERFECT";
        const pfGlow = _jtGlow(S, ex, ey-8, pfStr, 15, "#ffee00", "#ffaa00", 31, 0.25);
        if(pfGlow){ pfGlow.setAlpha(0).setScale(0.5); }
        const gText=S.add.text(ex,ey-8,pfStr,{
            fontFamily:"LilitaOne",
            fontSize:"15px",
            color:"#ffee00",
            stroke:"#440000",
            strokeThickness:3,
            padding:{x:2,y:1}
        }).setOrigin(0.5).setDepth(32).setAlpha(0).setScale(0.5);
        const pfAll=[gText, pfGlow].filter(Boolean);
        S.tweens.add({targets:pfAll,alpha:1,scaleX:1.1,scaleY:1.1,y:ey-30,
            duration:200,ease:"Back.easeOut",
            onComplete:()=>{
                S.tweens.add({targets:pfAll,alpha:0,y:ey-52,duration:300,delay:400,ease:"Quad.easeIn",
                    onComplete:()=>{ _jtDestroy(pfAll); }});
            }});
    }
}

// ── NORMAL HIT VFX v2 — layered impact + directional sparks ──
// ── HIT SMOKE animasyon varyantlari — her vurusta farkli gosterir ──
const _SMOKE_ANIMS = ["anim_smoke","anim_smoke2a","anim_smoke2b","anim_smoke2c","anim_smoke2d","anim_smoke2e"];
let _smokeIdx = 0; // round-robin sayaci

function vfxSmokeHit(S, ex, ey){
    // Texture yuklu degilse sessizce cik
    if(!S || (!S.textures.exists("smoke") && !S.textures.exists("smoke2"))) return;
    try{
        // Round-robin ile her vurusta farkli animasyon
        const animKey = _SMOKE_ANIMS[_smokeIdx % _SMOKE_ANIMS.length];
        _smokeIdx++;
        // Sadece ilgili texture yukluyse kullan
        const texKey = animKey === "anim_smoke" ? "smoke" : "smoke2";
        if(!S.textures.exists(texKey)) return;
        if(!S.anims.exists(animKey)) return;

        const sp = S.add.sprite(ex, ey - 14, texKey);
        // Kucuk boyut: 0.55–0.70 arasi rastgele scale
        const sc = 0.55 + Math.random() * 0.15;
        sp.setScale(sc)
          .setDepth(28)
          .setAlpha(0.82)
          .setBlendMode(Phaser.BlendModes.ADD); // parlak beyaz texture icin ADD blend
        sp.play(animKey);
        sp.on("animationcomplete", () => {
            S.tweens.add({
                targets: sp, alpha: 0, duration: 80,
                onComplete: () => { try{ sp.destroy(); }catch(_){} }
            });
        });
    }catch(e){ console.warn("[NT] vfxSmokeHit hata:", e); }
}

function vfxNormalHit(S,ex,ey,isCrit,bulletAngle){
    if(!S||!_POOL) return;
    ex=_snap(ex); ey=_snap(ey);
    // [MOBILE PERF] mobilede sadece tek ring — 3 layer + smoke tamamen skip
    if(_IS_MOBILE_EARLY){
        if(!isCrit) return; // normal hit mobilede hic VFX yok
        const ring=_POOL.get(23); if(ring){
            ring.lineStyle(1.8,0xffee00,0.80);
            ring.strokeCircle(0,0,4);
            ring.setPosition(ex,ey);
            _pt(S,ring,{scaleX:2.8,scaleY:2.8,alpha:0,duration:130,ease:"Quad.easeOut"});
        }
        return;
    }
    // Directional bias — sparks fly away from bullet origin
    const hitDir=(bulletAngle!==undefined)?bulletAngle:Math.PI*1.5;
    const sparkCount=isCrit?8:5;
    const sparkCol  =isCrit?0xffee44:0xddbb88;

    // Layer 1 — directional spark burst
    for(let i=0;i<sparkCount;i++){
        const sp=_POOL.get(24); if(!sp) break;
        const spread=isCrit?Math.PI*2:Math.PI*0.85;
        const baseAng=hitDir+Math.PI;
        const ang=baseAng+(Math.random()-0.5)*spread;
        const spd=Phaser.Math.Between(isCrit?16:8, isCrit?40:24);
        const len=Phaser.Math.Between(2,isCrit?6:4);
        sp.lineStyle(isCrit?1.6:1.2,i%2===0?sparkCol:0xffffff,0.90);
        sp.lineBetween(0,0,Math.cos(ang)*len,Math.sin(ang)*len);
        sp.setPosition(ex,ey);
        _pt(S,sp,{x:ex+Math.cos(ang)*spd,y:ey+Math.sin(ang)*spd*0.52,
            alpha:0,scaleY:0.08,
            duration:Phaser.Math.Between(85,isCrit?185:155),ease:"Quad.easeOut"});
    }

    // Layer 2 — radial energy ring
    const ring=_POOL.get(23); if(ring){
        ring.lineStyle(isCrit?2.0:1.4,isCrit?0xffee00:0xddbb66,0.80);
        ring.strokeCircle(0,0,isCrit?5:3);
        ring.setPosition(ex,ey);
        _pt(S,ring,{scaleX:isCrit?3.2:2.0,scaleY:isCrit?3.2:2.0,alpha:0,
            duration:isCrit?175:120,ease:"Quad.easeOut"});
    }

    // Layer 3 — glow halo (always for crit, 50% chance normal)
    if(isCrit||Math.random()<0.50){
        const glow=_POOL.get(22); if(glow){
            glow.fillStyle(isCrit?0xffee44:0xffcc88,0.22);
            glow.fillCircle(0,0,isCrit?8:5);
            glow.setPosition(ex,ey);
            _pt(S,glow,{scaleX:isCrit?4:2.6,scaleY:isCrit?4:2.6,alpha:0,
                duration:210,ease:"Quad.easeOut"});
        }
    }

    // Layer 4 — smoke sprite hit effect (her vurusta farkli animasyon)
    vfxSmokeHit(S, ex, ey);
}

// ── Enemy squash micro-animation on hit ─────────────────────────
function vfxEnemySquash(S,e){
    if(!S||!e||!e.active) return;
    if(_IS_MOBILE_EARLY) return; // [MOBILE PERF] squash tween mobilede yok — killTweensOf+3 tween pahali
    // [FIX] Onceki squash tween'lerini iptal et — ust uste birikmesini engelle
    S.tweens.killTweensOf(e);
    // [FIX] Orijinal scale'i her zaman taze oku — birikmeden kaynaklanan drift'i engelle
    // Piramit sprite'lari icin temel scale 1.0 (texture boyutlari zaten dogru)
    const sx = e._baseScaleX !== undefined ? e._baseScaleX : (Math.abs(e.scaleX) < 0.05 ? 1.0 : e.scaleX);
    const sy = e._basescaleY !== undefined ? e._basescaleY : (Math.abs(e.scaleY) < 0.05 ? 1.0 : e.scaleY);
    // Orijinal scale'i ilk kez kaydet
    if(e._baseScaleX === undefined){ e._baseScaleX = sx; e._basescaleY = sy; }
    const bsx = e._baseScaleX, bsy = e._basescaleY;
    // Squash: hafif yatay genisle + dikey kis, sonra geri don
    S.tweens.add({targets:e,
        scaleX: bsx * 0.90, scaleY: bsy * 1.08,
        duration: 38, ease:"Quad.easeOut",
        onComplete:()=>{
            if(!e||!e.active||!S||!S.tweens) return;
            S.tweens.add({targets:e,
                scaleX: bsx * 1.05, scaleY: bsy * 0.96,
                duration: 48, ease:"Quad.easeOut",
                onComplete:()=>{
                    if(!e||!e.active||!S||!S.tweens) return;
                    S.tweens.add({targets:e,
                        scaleX: bsx, scaleY: bsy,
                        duration: 70, ease:"Quad.easeOut"
                    });
                }
            });
        }
    });
}

// ── Score popup — float + fade ──────────────────────────────────
function vfxScorePopup(S,x,y,value,col){
    if(!S||!S.add) return;
    const hexCol="#"+(col||0xffcc44).toString(16).padStart(6,"0");
    const prefix=value>=2000?"★ ":value>=300?"✦ ":"";
    const fs=value>=300?15:12;
    const str = prefix+"+"+value;
    const depth = 32;

    const glow = _jtGlow(S, _snap(x), _snap(y), str, fs, hexCol, hexCol, depth, 0.20);
    if(glow){ glow.setScale(0.4).setAlpha(0); }

    const t=S.add.text(_snap(x),_snap(y), str,{
        fontFamily:"LilitaOne",
        fontSize:fs+"px",
        color:hexCol,
        stroke:"#000000",
        strokeThickness:3,
        padding:{x:2,y:1}
    }).setOrigin(0.5).setDepth(depth).setAlpha(0).setScale(0.4);

    const allObjs = [t, glow].filter(Boolean);
    S.tweens.add({targets:allObjs,alpha:1,scaleX:1.1,scaleY:1.1,y:y-8,duration:140,ease:"Back.easeOut",
        onComplete:()=>S.tweens.add({targets:allObjs,alpha:0,y:y-36,scaleX:0.75,scaleY:0.75,
            duration:420,delay:280,ease:"Quad.easeIn",
            onComplete:()=>{ _jtDestroy(allObjs); }})});
}

// ── Level-up glow pulse (no flash) ─────────────────────────────
function vfxLevelUpGlow(S,px,py,upgradeColor){
    if(!S||!_POOL) return;
    px=_snap(px); py=_snap(py);
    const col=upgradeColor||0x4488ff;
    for(let i=0;i<3;i++){
        S.time.delayedCall(i*65,()=>{
            const r=_POOL.get(26); if(!r) return;
            r.lineStyle(3-i*0.7,col,0.90-i*0.12);
            r.strokeCircle(0,0,14+i*10);
            r.fillStyle(col,0.04);
            r.fillCircle(0,0,14+i*10);
            r.setPosition(px,py);
            _pt(S,r,{scaleX:4+i,scaleY:4+i,alpha:0,duration:340+i*55,ease:"Quad.easeOut"});
        });
    }
    // Rising energy sparks
    for(let j=0;j<6;j++){
        const ep=_POOL.get(25); if(!ep) continue;
        const ang=Phaser.Math.DegToRad(j*60+Phaser.Math.Between(-10,10));
        const spd=Phaser.Math.Between(20,52);
        ep.fillStyle(col,0.80); ep.fillRect(-1,-2,3,5);
        ep.setPosition(px,py);
        _pt(S,ep,{x:px+Math.cos(ang)*spd,y:py+Math.sin(ang)*spd*0.52,
            alpha:0,scaleX:0.1,scaleY:0.1,
            duration:Phaser.Math.Between(230,410),ease:"Quad.easeOut"});
    }
}

// ── ENEMY DEATH VFX (elite/boss sinifi dusmanlar) ───────────
function vfxEnemyDeath(S,x,y,type,scale){
    if(!S||!S.add) return;
    const typeColors={normal:0xFF88CC,fast:0xFF6699,tank:0xAA55FF,shield:0x55BBFF,kamikaze:0xFFBB55,ghost:0xDDBBFF,
        split:0xFFEE44,swarm:0xFFBB66,elder:0xFFCC44,spinner:0xFF55DD,armored:0x9977FF,bomber:0xFF9966,
        stealth:0x44FFDD,healer:0x66FFAA,magnet:0xFFCC33,mirror:0xCCAAFF,berserker:0xFF7799,absorber:0x33EEFF,
        chain:0x77AAFF,freezer:0xAAEEFF,leech:0xFF77BB,titan:0xDD55FF,shadow:0xBB88FF,spiker:0xFFDD66,
        vortex:0x33FFCC,phantom:0xEEBBFF,rusher:0xFFAA55,splitter:0x88FF88,toxic:0xBBFF44,colossus:0xFF66AA,
        inferno:0xFF9977,glacier:0x66DDFF,phantom_tri:0xFF55FF,volt:0xFFFF66,obsidian:0xCC77FF,zigzag:0x88FF88};
    const col=typeColors[type]||0xff88cc;
    const sz=Math.min(scale||1, 1.8); // cap scale etkisini sinirla

    // Shockwave halkasi — sadece ince cizgi, dolu daire YOK
    const ring=S.add.graphics().setDepth(21);
    ring.x=x; ring.y=y;
    ring.lineStyle(2.5,col,0.85); ring.strokeCircle(0,0,8*sz);
    ring.lineStyle(1,0xffffff,0.5); ring.strokeCircle(0,0,5*sz);
    S.tweens.add({targets:ring,scaleX:4+sz,scaleY:4+sz,alpha:0,
        duration:280,ease:"Quad.easeOut",
        onComplete:()=>{try{ring.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});

    // Parcacik patlamasi — sinirli sayi
    const pCount=Math.min(12, Math.round(7+sz*2));
    for(let i=0;i<pCount;i++){
        const ang=Phaser.Math.DegToRad(i*(360/pCount)+Phaser.Math.Between(-15,15));
        const spd=Phaser.Math.Between(30,70)*Math.min(sz,1.4);
        const pc=S.add.graphics().setDepth(20);
        pc.x=x; pc.y=y;
        const pcAng2=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        pc.lineStyle(1.5,i%3===0?0xffffff:col,0.85);
        pc.lineBetween(0,0,Math.cos(pcAng2)*3,Math.sin(pcAng2)*3);
        S.tweens.add({targets:pc,
            x:x+Math.cos(ang)*spd,y:y+Math.sin(ang)*spd*0.6,
            alpha:0,scaleX:0.1,scaleY:0.1,
            duration:Phaser.Math.Between(180,340),ease:"Quad.easeOut",
            onComplete:()=>{try{pc.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    }

    // Duman — sadece 2-3 adet, hafif
    const smokeCount=Math.min(3,Math.round(2+sz*0.5));
    for(let i=0;i<smokeCount;i++){
        const sm=S.add.graphics().setDepth(15);
        sm.fillStyle(0x332211,0.22+Math.random()*0.12);
        sm.fillCircle(0,0,Phaser.Math.Between(4,9));
        sm.x=x+Phaser.Math.Between(-10,10); sm.y=y;
        S.tweens.add({targets:sm,y:y-Phaser.Math.Between(18,40),
            scaleX:1.8,scaleY:1.8,alpha:0,
            duration:Phaser.Math.Between(380,600),delay:i*35,ease:"Quad.easeOut",
            onComplete:()=>{try{sm.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    }
    // Shake wrapper zaten cap'liyor
    S.cameras.main.shake(35+sz*10,0.005);
}

// ── COMBO MILESTONE VFX ──────────────────────────────────────
function vfxComboMilestone(S,combo,px,py){
    if(!S||!S.add) return;
    const mileCols={5:0xff8800,10:0xff4400,15:0xff2244,20:0xffcc00};
    const mc=mileCols[combo]||0xff8800;
    const ringCount=combo>=20?4:combo>=15?3:2;
    for(let ri=0;ri<ringCount;ri++){
        S.time.delayedCall(ri*50,()=>{
            const mr=S.add.graphics().setDepth(25);
            mr.x=px; mr.y=py;
            mr.lineStyle(2.5-ri*0.3,mc,0.9); mr.strokeCircle(0,0,12+ri*3);
            S.tweens.add({targets:mr,scaleX:4+ri,scaleY:4+ri,alpha:0,
                duration:380+ri*45,ease:"Quad.easeOut",onComplete:()=>{try{mr.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
        });
    }
    // Enerji jeti — daha az sayida
    const jetCount=Math.min(8,3+Math.floor(combo/4));
    for(let j=0;j<jetCount;j++){
        S.time.delayedCall(j*22,()=>{
            const jx=px+Phaser.Math.Between(-18,18);
            const jet=S.add.graphics().setDepth(24);
            jet.fillStyle(mc,0.75); jet.fillRect(jx-1,py,2,3);
            S.tweens.add({targets:jet,y:jet.y-Phaser.Math.Between(30,60),
                alpha:0,scaleX:0.3,duration:Phaser.Math.Between(220,360),ease:"Quad.easeOut",
                onComplete:()=>{try{jet.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
        });
    }
    // Kamera shake — kontrollu (flash YOK)
    S.cameras.main.shake(20+combo,0.0010+combo*0.00008);
    // MAX COMBO (20) — sadelestirilmis
    if(combo>=20){
        S.cameras.main.zoomTo(1.05,70,"Quad.easeOut");
        S.time.delayedCall(70,()=>S.cameras.main.zoomTo(1.0,220,"Quad.easeIn"));
        // 12 isin (20'den azaltildi)
        for(let i=0;i<12;i++){
            const a=Phaser.Math.DegToRad(i*30);
            const ray=S.add.graphics().setDepth(26);
            ray.x=px; ray.y=py;
            ray.lineStyle(1.5,i%2?0xffcc00:0xffffff,0.8);
            ray.lineBetween(0,0,Math.cos(a)*40,Math.sin(a)*40*0.6);
            S.tweens.add({targets:ray,scaleX:0,scaleY:0,alpha:0,duration:350,ease:"Quad.easeOut",
                onComplete:()=>{try{ray.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
        }
        const mcStr="MAX KOMBO!";
        const mcGlow = _jtGlow(S, px, py-16, mcStr, 14, "#ffcc00", "#ff8800", 35, 0.28);
        if(mcGlow){ mcGlow.setAlpha(0).setScale(0.6); }
        const mcTxt=S.add.text(px,py-16,mcStr,{
            fontFamily:"LilitaOne",
            fontSize:"14px",
            color:"#ffcc00",
            stroke:"#330000",
            strokeThickness:3,
            padding:{x:2,y:1}
        }).setOrigin(0.5).setDepth(36).setAlpha(0).setScale(0.6);
        const mcAll=[mcTxt, mcGlow].filter(Boolean);
        S.tweens.add({targets:mcAll,alpha:1,scaleX:1.0,scaleY:1.0,y:py-44,
            duration:260,ease:"Back.easeOut",
            onComplete:()=>{
                S.tweens.add({targets:mcAll,alpha:0,y:py-68,duration:380,delay:700,ease:"Quad.easeIn",
                    onComplete:()=>{ _jtDestroy(mcAll); }});
            }});
    }
}

// ── LEVEL UP VFX ─────────────────────────────────────────────
function vfxLevelUp(S,level){
    if(!S||!S.add) return;
    // Hafif zoom pulse (flash YOK)
    S.cameras.main.zoomTo(1.04,90,"Quad.easeOut");
    S.time.delayedCall(90,()=>S.cameras.main.zoomTo(1.0,300,"Back.easeOut"));
    S.cameras.main.shake(35,0.004);
    // ── LEVEL UP floating text — centred above player
    if(S.player){
        spawnLevelUpText(S, S.player.x, S.player.y - 55);
    }
    // Oyuncu etrafi halkalar
    if(S.player){
        const plx=S.player.x,ply=S.player.y;
        for(let ri=0;ri<3;ri++){
            S.time.delayedCall(ri*60,()=>{
                const rg=S.add.graphics().setDepth(598);
                rg.x=plx; rg.y=ply;
                rg.lineStyle(3-ri,0x88ddff,0.7-ri*0.1); rg.strokeCircle(0,0,10+ri*3);
                S.tweens.add({targets:rg,scaleX:8+ri*2,scaleY:8+ri*2,alpha:0,
                    duration:450+ri*70,ease:"Quad.easeOut",onComplete:()=>{try{rg.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
            });
        }
        // Enerji kolonlari
        for(let ci=0;ci<8;ci++){
            S.time.delayedCall(ci*30,()=>{
                const col=S.add.graphics().setDepth(594);
                const cx=plx+Phaser.Math.Between(-35,35);
                col.lineStyle(1,0x88ddff,0.7);
                col.lineBetween(cx,ply,cx+Phaser.Math.Between(-2,2),ply-Phaser.Math.Between(20,50));
                S.tweens.add({targets:col,y:col.y-25,alpha:0,duration:360,ease:"Quad.easeOut",
                    onComplete:()=>{try{col.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
            });
        }
    }
}

// ── CHEST OPEN VFX ───────────────────────────────────────────
function vfxChestOpen(S,x,y,rarity){
    if(!S||!S.add) return;
    const col=rarity.color||0x4488ff;
    const isLeg=rarity===CHEST_RARITY.LEGENDARY;
    const isRare=rarity===CHEST_RARITY.RARE;
    // Flash YOK — sadece parcacik patlamasi
    const burst=S.add.graphics().setDepth(210);
    burst.x=x; burst.y=y;
    burst.fillStyle(0xffffff,0.6); burst.fillCircle(0,0,6);
    burst.fillStyle(col,0.5); burst.fillCircle(0,0,14);
    S.tweens.add({targets:burst,scaleX:isLeg?4:2.5,scaleY:isLeg?4:2.5,alpha:0,duration:300,ease:"Quad.easeOut",
        onComplete:()=>{try{burst.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    const pCount=isLeg?20:isRare?13:8;
    for(let i=0;i<pCount;i++){
        const ang=Phaser.Math.DegToRad(i*(360/pCount)+Phaser.Math.Between(-12,12));
        const spd=Phaser.Math.Between(25,isLeg?75:50);
        const pc=S.add.graphics().setDepth(211);
        pc.x=x; pc.y=y;
        const pcAng3=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        pc.lineStyle(1.5,i%3===0?0xffffff:col,0.85);
        pc.lineBetween(0,0,Math.cos(pcAng3)*2,Math.sin(pcAng3)*2);
        S.tweens.add({targets:pc,
            x:x+Math.cos(ang)*spd,y:y+Math.sin(ang)*spd*0.7,
            alpha:0,scaleX:0.1,scaleY:0.1,duration:Phaser.Math.Between(240,400),ease:"Quad.easeOut",
            onComplete:()=>{try{pc.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    }
    // Kamera shake — hafif
    S.cameras.main.shake(isLeg?60:isRare?40:25, isLeg?0.008:isRare?0.005:0.003);
    // Legendary'de minimal yildiz efekti
    if(isLeg){
        for(let i=0;i<6;i++){
            S.time.delayedCall(i*70,()=>{
                const st=S.add.text(
                    Phaser.Math.Between(60,300),
                    Phaser.Math.Between(100,200),
                    "✦",{font:"14px LilitaOne, Arial, sans-serif",color:"#ffcc00"}
                ).setDepth(212).setAlpha(1).setVisible(false).setScale(0.6);
                S.tweens.add({targets:st,alpha:0.9,scaleX:1.2,scaleY:1.2,
                    y:st.y+Phaser.Math.Between(40,80),duration:Phaser.Math.Between(400,700),ease:"Quad.easeIn",
                    onComplete:()=>{
                        S.tweens.add({targets:st,alpha:0,duration:150,
                            onComplete:()=>{try{st.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
                    }});
            });
        }
    }
}

// ── PLAYER HURT VFX v2 ────────────────────────────────────────
function vfxPlayerHurt(S){
    if(!S||!S.add) return;
    NT_VFX._hurtFlashTimer=360;
    if(!S.player||!_POOL) return;
    const px=_snap(S.player.x),py=_snap(S.player.y);

    // ── HASAR ANIMASYONU — ayri sprite, player texture bozulmasin ──
    // Texture yuklenmediyse (assets/get_damage.png eksik) sessizce atla
    if(S.textures.exists("get_damage") && S.anims.exists("anim_damage")){
        try{
            const sc = Math.max(S.player.scaleX||2.0, 1.5);
            const ds = S.add.sprite(px, py, "get_damage", 0)
                .setDepth(S.player.depth + 2)
                .setScale(sc)
                .setFlipX(S.player.flipX || false)
                .setOrigin(0.5, 0.5)
                .setAlpha(0.95);
            ds.play("anim_damage");
            ds.once("animationcomplete", ()=>{ try{ds.destroy();}catch(_){} });
            // Guvenlik: animasyon bitmezse 600ms sonra destroy
            S.time.delayedCall(600, ()=>{ try{ if(ds && ds.active) ds.destroy(); }catch(_){} });
        }catch(e){ console.warn("[NT] Damage anim:", e); }
    }

    // Red expanding ring
    const ring=_POOL.get(25); if(ring){
        ring.lineStyle(3,0xff2222,0.92); ring.strokeCircle(0,0,16);
        ring.setPosition(px,py);
        _pt(S,ring,{scaleX:3.2,scaleY:3.2,alpha:0,duration:250,ease:"Quad.easeOut"});
    }

    // Small red dust particles
    for(let i=0;i<5;i++){
        const dp=_POOL.get(24); if(!dp) continue;
        const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        const spd=Phaser.Math.Between(10,28);
        dp.lineStyle(1.4,i%2===0?0xff2244:0xff8888,0.88);
        dp.lineBetween(0,0,Math.cos(ang)*3,Math.sin(ang)*3);
        dp.setPosition(px,py);
        _pt(S,dp,{x:px+Math.cos(ang)*spd,y:py+Math.sin(ang)*spd*0.52,
            alpha:0,scaleY:0.1,duration:Phaser.Math.Between(95,170),ease:"Quad.easeOut"});
    }
}

// ── BUTTON JUICE v2 — hover glow expand + click spring ───────
function addButtonJuice(S,btn,cb){
    if(!btn||!btn.on) return;
    const oSX=btn.scaleX||1, oSY=btn.scaleY||1;
    let _glowRing=null;

    btn.on("pointerover",()=>{
        if(!S||!S.tweens) return;
        S.tweens.killTweensOf(btn);
        S.tweens.add({targets:btn,scaleX:oSX*1.09,scaleY:oSY*1.09,duration:90,ease:"Back.easeOut"});
        // Glow ring
        try{
            if(!_glowRing&&btn.x&&btn.y){
                _glowRing=S.add.graphics().setDepth((btn.depth||50)+1);
                const hw=(btn.displayWidth||60)*0.5+4, hh=(btn.displayHeight||30)*0.5+4;
                _glowRing.lineStyle(2.5,0xffdd44,0.50);
                _glowRing.strokeRoundedRect(btn.x-hw,btn.y-hh,hw*2,hh*2,8);
                S.tweens.add({targets:_glowRing,alpha:0.70,duration:80});
            }
        }catch(e){}
    });

    btn.on("pointerout",()=>{
        if(!S||!S.tweens) return;
        S.tweens.killTweensOf(btn);
        S.tweens.add({targets:btn,scaleX:oSX,scaleY:oSY,duration:130,ease:"Quad.easeOut"});
        if(_glowRing){
            const gr=_glowRing; _glowRing=null;
            S.tweens.add({targets:gr,alpha:0,duration:100,
                onComplete:()=>{try{gr.destroy();}catch(e){}}});
        }
    });

    btn.on("pointerdown",()=>{
        if(!S||!S.tweens) return;
        if(_glowRing){try{_glowRing.destroy();}catch(e){} _glowRing=null;}
        S.tweens.killTweensOf(btn);
        S.tweens.add({targets:btn,scaleX:oSX*0.87,scaleY:oSY*0.87,duration:50,ease:"Quad.easeOut",
            onComplete:()=>{
                if(!S.tweens) return;
                S.tweens.add({targets:btn,scaleX:oSX*1.13,scaleY:oSY*1.13,duration:92,ease:"Back.easeOut",
                    onComplete:()=>{
                        if(!S.tweens) return;
                        S.tweens.add({targets:btn,scaleX:oSX,scaleY:oSY,duration:80,ease:"Quad.easeOut"});
                        if(cb) cb();
                    }});
            }});
        // Click burst — pooled
        const bx=btn.x||180,by=btn.y||300;
        for(let i=0;i<7;i++){
            const sp=_POOL?_POOL.get(55):null;
            if(!sp) break;
            const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
            sp.fillStyle(0xffffff,0.80); sp.fillRect(-1,-1,2,4);
            sp.setPosition(_snap(bx+Phaser.Math.Between(-22,22)),_snap(by+Phaser.Math.Between(-9,9)));
            _pt(S,sp,{x:sp.x+Math.cos(ang)*Phaser.Math.Between(14,28),
                y:sp.y+Math.sin(ang)*Phaser.Math.Between(10,20),
                alpha:0,duration:Phaser.Math.Between(130,210),ease:"Quad.easeOut"});
        }
    });
}

// ════════════════════════════════════════════════════════════════
// PHASER CONFIG + BOOT
// ════════════════════════════════════════════════════════════════

// [PERF FIX] Safe delayedCall — skips callback if scene was restarted
function safeDelay(S, ms, cb){
    if(!S||!S.time) return;
    S.time.delayedCall(ms, ()=>{
        try{
            if(!S||!S.scene||!S.scene.isActive(SCENE_KEY)) return;
            cb();
        }catch(e){console.warn("[NT] Hata yutuldu:",e)}
    });
}
// ═══════════════════════════════════════════════════════════════
// FONT PRELOAD SISTEMI — LilitaOne font yuklenmeden oyun baslamaz
// Siyah dikdortgen text bug'ini kalici olarak cozer
// ═══════════════════════════════════════════════════════════════
function _ensureFontLoaded(callback){
    // Race condition korumasi: "load" eventi ve 2sn timeout ayni anda
    // tetiklenirse callback iki kez cagrilir → Phaser cift baslar.
    // _fontCallbackFired flag'i bunu onler.
    let _fontCallbackFired = false;
    const _safeCallback = () => {
        if(_fontCallbackFired) return;
        _fontCallbackFired = true;
        callback();
    };

    // 1. LilitaOne @font-face — assets/fonts/ klasorunden yukle
    if(!document.getElementById("nt-lilitaone-font")){
        const style = document.createElement("style");
        style.id = "nt-lilitaone-font";
        style.textContent =
            "@font-face{" +
            "font-family:'LilitaOne';" +
            "src:url('assets/fonts/LilitaOne-Regular.ttf') format('truetype');" +
            "font-weight:400 700;" +
            "font-style:normal;" +
            "font-display:block;" +
            "}";
        document.head.appendChild(style);
    }

    // 2. document.fonts API ile yuklenmesini bekle
    const tryLoad = () => {
        if(document.fonts && document.fonts.load){
            // Hem regular hem bold yukle
            Promise.all([
                document.fonts.load("bold 16px LilitaOne"),
                document.fonts.load("16px LilitaOne"),
                document.fonts.load("24px LilitaOne"),
                document.fonts.load("bold 22px LilitaOne"),
                document.fonts.load("bold 18px LilitaOne"),
                document.fonts.load("bold 14px LilitaOne"),
                document.fonts.load("10px LilitaOne")
            ]).then(()=>{
                // Canvas warm-up — tarayici font rasterizer'i isit
                try{
                    const tc = document.createElement("canvas");
                    tc.width=200; tc.height=40;
                    const ctx = tc.getContext("2d");
                    const variants = [
                        "bold 32px LilitaOne, Arial, sans-serif",
                        "bold 24px LilitaOne, Arial, sans-serif",
                        "bold 22px LilitaOne, Arial, sans-serif",
                        "bold 20px LilitaOne, Arial, sans-serif",
                        "bold 18px LilitaOne, Arial, sans-serif",
                        "bold 17px LilitaOne, Arial, sans-serif",
                        "bold 16px LilitaOne, Arial, sans-serif",
                        "bold 15px LilitaOne, Arial, sans-serif",
                        "bold 14px LilitaOne, Arial, sans-serif",
                        "bold 13px LilitaOne, Arial, sans-serif",
                        "bold 12px LilitaOne, Arial, sans-serif",
                        "bold 11px LilitaOne, Arial, sans-serif",
                        "11px LilitaOne, Arial, sans-serif",
                        "bold 10px LilitaOne, Arial, sans-serif",
                        "28px LilitaOne",
                        "24px LilitaOne",
                        "22px LilitaOne",
                        "20px LilitaOne",
                        "18px LilitaOne",
                        "17px LilitaOne",
                        "16px LilitaOne",
                        "15px LilitaOne",
                        "14px LilitaOne",
                        "13px LilitaOne",
                        "12px LilitaOne",
                        "10px LilitaOne",
                        "9px LilitaOne"
                    ];
                    const warmupTexts = [
                        "PLAY SETTINGS HOW TO PLAY LEADERBOARD",
                        "RESUME MAIN MENU PAUSED STATS PASSIVE",
                        "ABCabc123 0123456789 !?.,:/s"
                    ];
                    variants.forEach(v => {
                        ctx.font = v;
                        warmupTexts.forEach(t => ctx.fillText(t, 0, 30));
                    });
                }catch(e){console.warn("[NT] Hata yutuldu:",e)}
                _safeCallback();
            }).catch(()=>{
                console.warn("[NT] LilitaOne yuklenemedi — Arial fallback aktif.");
                _safeCallback();
            });
        } else {
            // API yok — kisa gecikme
            setTimeout(_safeCallback, 400);
        }
    };

    // Fonts API hazir degilse kisa bekle
    if(document.readyState === "complete"){
        tryLoad();
    } else {
        window.addEventListener("load", tryLoad, {once: true});
        // Guvenlik: 800ms sonra her halukarda baslat — Telegram'da 2sn bekleme siyah ekrana yol acar
        setTimeout(()=>{ if(!_fontCallbackFired) _safeCallback(); }, 800);
    }
}

// [PERF-FIX] AudioContext resume on first user gesture (Chrome autoplay policy)
// Onceki versiyon tamamen no-op'tu — hicbir sey yapmiyordu.
(function _fixAudioContext(){
    const resume=()=>{
        // NT_SFX zaten kendi context'ini yonetiyor; ancak herhangi bir
        // suspended AudioContext instance'i varsa burada da resume et.
        try{
            if(NT_SFX && typeof NT_SFX.resumeAudio === "function") NT_SFX.resumeAudio(0.05);
        }catch(_){}
    };
    document.addEventListener("pointerdown", resume, {once:true, capture:true});
    document.addEventListener("keydown",     resume, {once:true, capture:true});
})();

function _startPhaserGame(){
    // ── TELEGRAM WEBAPP HAZIRLIK — siyah ekran onleme ─────────────────────────
    // Telegram Mini App ortamindaysa WebApp.ready() cagrilmali.
    // Bu cagri yapilmadan Telegram loading overlay kapanmaz → siyah ekran.
    try{
        if(window.Telegram && window.Telegram.WebApp){
            window.Telegram.WebApp.ready();   // Telegram'a "uygulama hazir" sinyali gonder
            window.Telegram.WebApp.expand();  // Tam ekran ac — viewport sorunlarini onle
        }
    }catch(e){ console.warn("[NT] Telegram WebApp init hatasi:", e); }

    // ── PRESENCE: otomatik baslatma (window.Presence yoksa sessizce gec) ─────
    if (window.Presence) {
        (async () => {
            try {
                await window.Presence.logJoin();   // JOIN istegini gonder
                window.Presence.startPing();        // 15 sn'lik ping dongusunu baslat
            } catch(e) { console.warn("[NT] Presence init hatasi:", e); }
        })();
    } else {
        console.warn("[NT] window.Presence bulunamadi — presence sistemi devre disi.");
    }
    // ── MUZIK BASLAT ──────────────────────────────────────────
    NT_SFX.startMusic();
    NT_SFX.startWindAmbience();
    const config = {
        type:Phaser.AUTO, width:360, height:640,
        backgroundColor:"#000000",
        parent:"game-container",
        physics:{default:"arcade",arcade:{gravity:{y:0},debug:false,overlapBias:_IS_MOBILE_EARLY?12:24,tileBias:_IS_MOBILE_EARLY?8:16}}, // [MOBILE PERF]
        scene:[SceneMainMenu, SceneGame],
        scale:{
            mode:Phaser.Scale.FIT,
            autoCenter:Phaser.Scale.CENTER_BOTH,
            width:360,
            height:640,
            parent:"game-container",
            expandParent:false,
            // [FIX] Mobil zoom bug — devicePixelRatio kullanma, Phaser kendi yonetsin
        },
        render:{
            antialias:      true,                                        // [QUALITY] WebGL MSAA ac
            antialiasGL:    true,                                        // [QUALITY] GL antialiasing ac
            pixelArt:       false,                                       // [QUALITY] CSS pixelated KAPALI — scale manager eziyor
            roundPixels:    false,                                       // [QUALITY] sub-pixel smooth scroll
            resolution:     Math.min(window.devicePixelRatio || 1, 2),  // HiDPI destek
            powerPreference:"high-performance"
        },
        callbacks:{
            postBoot:(game)=>{
                // [QUALITY] image-rendering: auto — pixelArt:false olsa da scale manager
                // bazi Phaser surumlerinde canvas CSS'ini ezebilir; her resize'da tekrar uygula
                const _fixCanvas = () => {
                    game.canvas.style.imageRendering = "auto";
                    game.canvas.style.imageRendering = "-webkit-optimize-contrast"; // Safari
                    game.canvas.style.imageRendering = "auto"; // son deger kazanir
                };
                _fixCanvas();
                try{ game.scale.on("resize", _fixCanvas); }catch(_){}

                NT_VFX._game = game;
                const renderer = game.renderer;
                const gl = renderer && renderer.gl;
                if(!gl) return;

                function _applyFilter(glTex, minF, magF){
                    if(!glTex) return;
                    try{
                        gl.bindTexture(gl.TEXTURE_2D, glTex);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minF);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magF);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    }catch(e){ console.warn("[NT] filter patch:", e); }
                }

                // Pixel-art karakter sprite'lari — NEAREST (piksel keskin kalsin)
                const PIXELART_KEYS = new Set(["idle","run","death","get_damage"]);
                // Mipmap ikonlar — 128px POT, kuculebilir
                const MIPMAP_KEYS   = new Set(["icon_gold","icon_gem"]);

                game.textures.on("addtexture", (key)=>{
                    const t = game.textures.get(key);
                    if(!t || !t.source) return;
                    t.source.forEach(src => {
                        if(!src || !src.glTexture) return;
                        if(PIXELART_KEYS.has(key)){
                            // Pixel art — NEAREST: yumusama olmadan keskin
                            src.smoothed = false;
                            _applyFilter(src.glTexture, gl.NEAREST, gl.NEAREST);
                        } else if(MIPMAP_KEYS.has(key) || key.startsWith("upicon_")){
                            // Kucuk ikonlar — mipmap + anisotropic
                            try{
                                gl.bindTexture(gl.TEXTURE_2D, src.glTexture);
                                gl.generateMipmap(gl.TEXTURE_2D);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                                const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
                                if(aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT,
                                    Math.min(4, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
                                gl.bindTexture(gl.TEXTURE_2D, null);
                            }catch(_){}
                            src.smoothed = true;
                        } else {
                            // Tum diger texture'lar (bg, UI, dusman vb.) — LINEAR
                            src.smoothed = true;
                            _applyFilter(src.glTexture, gl.LINEAR, gl.LINEAR);
                        }
                    });
                });
            }
        }
    };
    new Phaser.Game(config);
    
    // SceneGame direkt baslar
}
// DOMContentLoaded coktan gecmisse direkt baslat, gecmemisse bekle
// Font preload sistemi: LilitaOne yuklenmeden Phaser baslamaz → siyah kutu fix
if(document.readyState==="loading"){
    window.addEventListener("DOMContentLoaded", ()=>_ensureFontLoaded(_startPhaserGame));
} else {
    _ensureFontLoaded(_startPhaserGame);
}
