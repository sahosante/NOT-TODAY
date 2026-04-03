// ═══════════════════════════════════════════════════════════════
// NOT TODAY  v9.0  |  by Şahin Beyazgül
// PART A: Dil Sistemi, Sabitler, Epilepsi Sahnesi, Intro Sahnesi
// ═══════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════
// PRESENCE TRACKER  [v6 — Direct Telegram Bot]
//
// Server yok — direkt Telegram Bot API'ye mesaj atar.
// Giriş/çıkış/ping bilgileri logger chat'e düşer.
// ═══════════════════════════════════════════════════════════════
(function () {
    "use strict";

    // ── CONFIGURATION ─────────────────────────────────────────
    const BOT_TOKEN = "8639916106:AAG_aT6s_jsXPg2IJMjPOnP6NqdWja5Bgog";
    const CHAT_ID   = "5817646600";
    const TG_URL    = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    // ── KULLANICI BİLGİSİ ─────────────────────────────────────
    function _getUserInfo() {
        try {
            const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
            if (u) {
                const name     = [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";
                const username = u.username ? `@${u.username}` : "kullanıcı adı yok";
                const id       = u.id || "—";
                return { name, username, id };
            }
        } catch (_) {}
        return { name: "Misafir", username: "—", id: "—" };
    }

    // ── TELEGRAM'A MESAJ GÖNDER ───────────────────────────────
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
            console.warn("[PRESENCE] Telegram gönderim hatası:", err.message);
        }
    }

    // ── BEACON İLE GÖNDER (sayfa kapanırken) ──────────────────
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
            `🟢 <b>Oyuna Giriş</b>\n` +
            `👤 <b>İsim:</b> ${name}\n` +
            `🔗 <b>Kullanıcı:</b> ${username}\n` +
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
        console.log("[PRESENCE] LEAVE →", name, permanent ? "(kalıcı)" : "(geçici)");
        _sendBeacon(
            `🔴 <b>Oyundan Çıkış</b>\n` +
            `👤 <b>İsim:</b> ${name}\n` +
            `🔗 <b>Kullanıcı:</b> ${username}\n` +
            `🆔 <b>ID:</b> <code>${id}</code>\n` +
            `⏱ <b>Oynama Süresi:</b> ${durStr}`
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
                    `👤 <b>İsim:</b> ${name}\n` +
                    `🔗 <b>Kullanıcı:</b> ${username}\n` +
                    `🆔 <b>ID:</b> <code>${id}</code>\n` +
                    `⏱ <b>Süredir oynuyor:</b> ${min} dakika`
                );
            }
        }, 15_000);
    }
    function stopPing() {
        if (_pingTimer) { clearInterval(_pingTimer); _pingTimer = null; }
    }

    // ── OTOMATİK EVENTLER ────────────────────────────────────
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

    console.log("[PRESENCE] Telegram Direct Tracker v6 yüklendi.");
})();

// ═══════════════════════════════════════════════════════════════
// NT_SFX — AAA Web Audio Engine v3
// Master Bus → SFX / Music / UI / Ambience buses
// Compressor + Limiter on every bus — clipping impossible
// State-based music, layered SFX, dynamic systems
// Zero external dependencies — pure Web Audio API
// ═══════════════════════════════════════════════════════════════
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

        // ── Performans reaktifliği ────────────────────────────────
        // Combo sayısını okuyarak davul hacmini ve bas filtresini canlı ayarlar.
        // Combo 0→15 arasında _perfBoost 0→1'e çıkar:
        //   kick   %35 daha güçlü (+güven hissi)
        //   snare  %25 daha güçlü
        //   hat    daha belirgin
        //   bass filter daha açık (+enerji)
        // Combo sıfırlandığında etki kaybolur — an anlık reaktif.
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
        const lookAhead=_ctx.currentTime+_LOOKAHEAD;
        while(_musNextNote<lookAhead){
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
    }

    function _stopMusic(fadeTime=2.0){
        if(!_musPlaying||!_ctx) return;
        _musPlaying=false;
        clearInterval(_musTimer); _musTimer=null;
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

        // ── COMBO — combo'ya göre katmanlanan, pitch artan ses ────────
        // Her combo milestone'da yeni ses katmanı açılır.
        // Stereo genişlik ve harmonik zenginlik combo ile büyür.
        combo(count=1){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const scale=[110,130,146,164,196,220,261,294,330,392,440,523,659];
            const idx=Math.min(Math.floor(count/2),scale.length-1);
            const f=scale[idx];
            // Volume ve pitch birlikte yükselir — combo=20'de %45 daha yüksek
            const vol=Math.min(0.70, 0.22+count*0.024);
            // Pitch detune: combo arttıkça hafif yukarı kayar (perceptible ama subtle)
            const detune=Math.min(count*3, 40); // max +40 cents @ combo 13+

            // ── Ana ses katmanı ──────────────────────────────────
            const o=ctx.createOscillator(), g=ctx.createGain();
            o.type="sawtooth"; o.frequency.setValueAtTime(f*2,t);
            o.detune.setValueAtTime(detune+_varyC(8),t);
            const lpf=ctx.createBiquadFilter();
            lpf.type="lowpass";
            lpf.frequency.value=f*(4+count*0.35); // combo arttıkça filtre açılır = daha parlak
            lpf.Q.value=3.5+count*0.08;
            g.gain.setValueAtTime(_vol(vol),t);
            g.gain.exponentialRampToValueAtTime(0.0001,t+0.38);
            o.connect(lpf); lpf.connect(g); g.connect(_sfxBus);
            o.start(t); o.stop(t+0.42);

            // ── 4. harmonik + gürültü transient ─────────────────
            _osc("sine",f*4,t+0.018,0.22,_vol(vol*0.30));
            _noise(t,0.014,_vol(0.20+count*0.006),2000,10000);

            // ── Combo 5+: stereo harmonik çift — genişlik hissi ─
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
            // Hızlı yukarı fırlayan iki nota — "flow state" hissi
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

            // ── Combo 15+: shimmer katmanı + daha geniş stereo ──
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

        // ── PERFECT HIT — kristal ping, combo'ya göre pitch artar ──────
        // Tam merkeze isabet ettiğinde çalınır. Ses combo ile yükselir.
        // 3 katman: ana ping + harmonik kırışma + sparkle gürültü.
        perfect_hit(combo=0){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            // Temel frekans: E6 (1318Hz) + combo başına +55 cent
            // Combo 20'de yaklaşık 2 yarı ton yukarı — belirgin ama rahatsız etmez
            const baseF = 1318.5;
            const detune = Math.min(combo * 5.5, 110); // cents, max +110
            const vol    = Math.min(0.35, 0.22 + combo * 0.006);

            // Katman 1: Parlak sine ping — hızlı attack, natural decay
            const o=ctx.createOscillator(), g=ctx.createGain();
            o.type="sine"; o.frequency.setValueAtTime(baseF,t);
            o.detune.setValueAtTime(detune+_varyC(5),t);
            o.frequency.exponentialRampToValueAtTime(baseF*1.035,t+0.018); // ufak pitch rise = "bling"
            g.gain.setValueAtTime(0,t);
            g.gain.linearRampToValueAtTime(_vol(vol),t+0.005);
            g.gain.exponentialRampToValueAtTime(0.0001,t+0.18);
            o.connect(g); g.connect(_sfxBus); o.start(t); o.stop(t+0.20);

            // Katman 2: İnharmonik üst kısmi (2.756x) — metalik kristal renk
            const o2=ctx.createOscillator(), g2=ctx.createGain();
            o2.type="triangle"; o2.frequency.value=baseF*2.756;
            o2.detune.value=detune*0.5;
            g2.gain.setValueAtTime(0,t); g2.gain.linearRampToValueAtTime(_vol(vol*0.36),t+0.003);
            g2.gain.exponentialRampToValueAtTime(0.0001,t+0.08);
            o2.connect(g2); g2.connect(_sfxBus); o2.start(t); o2.stop(t+0.10);

            // Katman 3: Sparkle gürültü — çok kısa, yüksek frekans, geniş pan
            _noise(t+0.002, 0.055, _vol(vol*0.50), 8000, 18000, null, _vary(0, 0.70));

            // Combo 10+: ikinci harmonik nota (5th üstü) — daha "kazanılmış" his
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

        // ── MULTI KILL — kill zinciri, ağırlık combo'ya göre artar ────
        // killChain: 1=normal, 2=double, 3+=heavy
        multi_kill(chain=1){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const chain3=Math.min(chain,5);
            // Ana etki: pitch düşer, hacim artar, zincir büyüdükçe
            const baseFreq = Math.max(45, 88 - chain3 * 10); // daha düşük = daha ağır
            const vol = Math.min(0.95, 0.60 + chain3 * 0.07);

            // Gövde darbesi
            _osc("sine",    _vary(baseFreq),  t,      _vary(0.22,0.05), _vol(vol),       _vary(baseFreq*0.35));
            _osc("triangle",_vary(baseFreq*5),t,      _vary(0.06,0.05), _vol(vol*0.40),  _vary(baseFreq));
            _noise(t, _vary(0.05,0.05), _vol(vol*0.55), 300, 5000);

            // Metalik zing — her zincirde biraz daha yüksek
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

            // Chain 3+: yüksek frekanslı "sweep" — birden fazla düşman hissini verir
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

        // ── XP PICKUP — "aldım!" anı hissi ──────────────────────────────
        // Tasarım hedefi: her tıklamada oyuncu bir şey "kazandığını" hissetsin.
        // Anahtar unsur: ani parlak transient + dolgun sub pop + parlayan üst kısım.
        xp_pickup(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            const now=performance.now();

            // Zincir güncelle
            if(now - _xpChainLast > _XP_CHAIN_GAP) _xpChainStep=0;
            _xpChainLast=now;
            const step=_xpChainStep % _XP_SCALE.length;
            _xpChainStep++;

            const f   = _XP_SCALE[step] * _vary(1, 0.04);
            const vol = Math.min(0.42, 0.28 + step * 0.013);

            // ── 1. PARLAK ÜÇGEN POP — "kazanç" transient ────────────
            // Çok hızlı attack (2ms), sonra sert pitch düşüşü.
            // Bu hareket beyne "bir şey toplandı" sinyali gönderir.
            const oA=ctx.createOscillator(), gA=ctx.createGain();
            oA.type="triangle";
            oA.frequency.setValueAtTime(f*2.2, t);
            oA.frequency.exponentialRampToValueAtTime(f*1.0, t+0.035);
            gA.gain.setValueAtTime(0,t);
            gA.gain.linearRampToValueAtTime(_vol(vol*0.90), t+0.002); // 2ms attack
            gA.gain.exponentialRampToValueAtTime(0.0001, t+0.14);
            oA.connect(gA); gA.connect(_sfxBus); oA.start(t); oA.stop(t+0.16);

            // ── 2. SINE ANA GÖVDE — sıcaklık / dolgunluk ────────────
            const oB=ctx.createOscillator(), gB=ctx.createGain();
            oB.type="sine"; oB.frequency.value=f;
            gB.gain.setValueAtTime(0,t);
            gB.gain.linearRampToValueAtTime(_vol(vol*0.55), t+0.005);
            gB.gain.exponentialRampToValueAtTime(0.0001, t+0.18);
            oB.connect(gB); gB.connect(_sfxBus); oB.start(t); oB.stop(t+0.20);

            // ── 3. SUB POP — fiziksel bas darbesi (f/2) ─────────────
            // Kulaklıkta ve telefon hoparlöründe hissedilen "dokunuş".
            const oS=ctx.createOscillator(), gS=ctx.createGain();
            oS.type="sine"; oS.frequency.setValueAtTime(f*0.5, t);
            oS.frequency.exponentialRampToValueAtTime(f*0.3, t+0.055);
            gS.gain.setValueAtTime(_vol(vol*0.40), t);
            gS.gain.exponentialRampToValueAtTime(0.0001, t+0.07);
            oS.connect(gS); gS.connect(_sfxBus); oS.start(t); oS.stop(t+0.08);

            // ── 4. SPARKLE BURST — parıldama (yüksek frekans noise) ─
            // Çok kısa, stereo'da rastgele — her pickup biraz farklı hissettir.
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

            // ── 5. İNHARMONİK PARLAKLAMA (2.76x) — metalik kristal ─
            const oC=ctx.createOscillator(), gC=ctx.createGain();
            oC.type="sine"; oC.frequency.value=f*2.76;
            gC.gain.setValueAtTime(0,t);
            gC.gain.linearRampToValueAtTime(_vol(vol*0.22), t+0.003);
            gC.gain.exponentialRampToValueAtTime(0.0001, t+0.06);
            oC.connect(gC); gC.connect(_sfxBus); oC.start(t); oC.stop(t+0.08);

            // ── Zincir 4+: stereo harmonik genişleme ────────────────
            if(step>=4){
                const pL=_mkPan(ctx,-0.45+step*-0.02);
                const pR=_mkPan(ctx, 0.45+step* 0.02);
                const oL=ctx.createOscillator(), gL=ctx.createGain();
                const oR=ctx.createOscillator(), gR=ctx.createGain();
                oL.type="triangle"; oL.frequency.value=f*2.01;
                oR.type="triangle"; oR.frequency.value=f*1.99; // ufak detune = genişlik
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

            // ── Zincir 8+: perfect 5th akor katmanı ─────────────────
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



        // ── PLAYER HURT ───────────────────────────────────────────
        player_hurt(){
            const ctx=_getCtx(); if(!ctx||!_sfxOn()) return; _resume();
            const t=ctx.currentTime;
            _osc("sawtooth",_vary(155), t, _vary(0.085,0.1), _vol(0.52), _vary(50));
            _osc("sine",    _vary(78),  t, _vary(0.125,0.1), _vol(0.48), _vary(28));
            _noise(t, _vary(0.065,0.1), _vol(0.42), 200,3500);
            _osc("sine",    _vary(900), t+0.03, _vary(0.06,0.1), _vol(0.14), _vary(200));
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
            g.gain.linearRampToValueAtTime(_vol(0.26),t+0.005);
            g.gain.exponentialRampToValueAtTime(0.0001,t+0.055);
            o.connect(p); p.connect(g); g.connect(_uiBus);
            o.start(t); o.stop(t+0.065);
            // Second harmonic tail
            _osc("sine",_vary(550,30), t+0.018, 0.045, _vol(0.14), null, _uiBus);
            // Crisp click noise
            _noise(t, 0.010, _vol(0.12), 4500, 14000, _uiBus);
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
        // Kart seçilince müzikle uyumlu bir davul vurumu hissi verir.
        // 3 katman: bas kick + snare crack + kısa hihat sisi
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

            // Katman 3: Hihat — kısa yüksek frekans sisi (12ms gecikme)
            _noise(t+0.012, 0.022, _vol(0.32), 8000, 18000, _sfxBus,
                (Math.random()-0.5)*0.5);

            // Katman 4: "Seçim" confirmation tonu — yüksek parlak nota
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
            // Tatlı pixel patlama — yumuşak "pop" + neşeli parçacık saçılması
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
    // Hızlı ardışık XP toplamada yükselen melodi oluşturur.
    // Her pickup'ta bir sonraki nota çalınır; 380ms boşlukta sıfırlanır.
    let _xpChainStep  = 0;
    let _xpChainLast  = 0; // timestamp of last pickup (ms)
    const _XP_CHAIN_GAP = 380; // ms — this gap resets the chain
    // Am pentatonic (A4→E7) — 12 adım, hep temiz kulağa gelir
    const _XP_SCALE = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5, 1568, 1760, 2093];

    // ── Kill chain state ──────────────────────────────────────────
    // Kısa sürede art arda kill → multi-kill sesi + bass hit
    let _killChain     = 0;
    let _killChainLast = 0;
    const _KILL_CHAIN_GAP = 1200; // ms — longer window for kill chain

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
        if(_initDone) return; _initDone=true;
        _getCtx(); _resume();
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
// ── SAHNE ANAHTARI SABİTİ — tüm isActive/key referansları buradan ──────────
// Sahne adını değiştirmek istersen yalnızca bu satırı güncelle.
const SCENE_KEY = "SceneGame";

const GEM_PACKS=[
    {gems:50,   price:"$0.99",  bonus:0,   tag:null,      popular:false},
    {gems:130,  price:"$1.99",  bonus:10,  tag:"popular",  popular:true},
    {gems:320,  price:"$3.99",  bonus:30,  tag:null,       popular:false},
    {gems:750,  price:"$7.99",  bonus:100, tag:"best",     popular:false},
    {gems:1800, price:"$14.99", bonus:300, tag:null,       popular:false},
];

// ── GÜVENLİK: Checksum sistemi — kritik değer manipülasyonunu tespit eder
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

    const titleStr=CURRENT_LANG==="ru"?"💎 МАГАЗИН ГЕМОВ":CURRENT_LANG==="en"?"💎 GEM STORE":"💎 ELMAS MAĞAZASI";
    addO(scene.add.text(W/2,28,titleStr,{font:"bold 16px LilitaOne, Arial, sans-serif",color:"#cc44ff"}).setOrigin(0.5).setDepth(12));
    const subStr=CURRENT_LANG==="ru"?"Покупай гемы · используй для контента":CURRENT_LANG==="en"?"Buy gems · use for exclusive content":"Elmas al · özel içerikler için kullan";
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
            // Sol renk şerit
            cardBg.fillStyle(tagCol,hov?1:0.75); cardBg.fillRoundedRect(CX,cy,5,CARD_H,{tl:8,tr:0,bl:8,br:0});
            // Hover parlaklığı
            cardBg.fillStyle(tagCol,hov?0.15:0.06); cardBg.fillRoundedRect(CX,cy,CW,CARD_H,8);
            // Üst shine
            cardBg.fillStyle(0xffffff,hov?0.08:0.03); cardBg.fillRoundedRect(CX,cy,CW,12,{tl:8,tr:8,bl:0,br:0});
            cardBg.lineStyle(hov?2:1,tagCol,hov?0.9:0.5); cardBg.strokeRoundedRect(CX,cy,CW,CARD_H,8);
        };
        drawCard(false);

        // Büyük gem ikonu
        const gemIconBg=addO(scene.add.graphics().setDepth(13));
        gemIconBg.fillStyle(tagCol,0.2); gemIconBg.fillCircle(CX+38,cy+CARD_H/2,28);
        gemIconBg.lineStyle(2,tagCol,0.5); gemIconBg.strokeCircle(CX+38,cy+CARD_H/2,28);
        // İç parlama
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
            const tagStr=pack.tag==="best"?(CURRENT_LANG==="ru"?"⭐ ЛУЧШЕЕ":CURRENT_LANG==="en"?"⭐ BEST VALUE":"⭐ EN İYİ"):(CURRENT_LANG==="ru"?"🔥 ПОПУЛЯРНО":CURRENT_LANG==="en"?"🔥 POPULAR":"🔥 POPÜLER");
            const tagBg=addO(scene.add.graphics().setDepth(14));
            tagBg.fillStyle(tagCol,0.95); tagBg.fillRoundedRect(CX+CW-92,cy+8,82,18,5);
            tagBg.lineStyle(1,0xffffff,0.3); tagBg.strokeRoundedRect(CX+CW-92,cy+8,82,18,5);
            addO(scene.add.text(CX+CW-51,cy+17,tagStr,{font:"bold 11px LilitaOne, Arial, sans-serif",color:"#ffffff",padding:{x:2,y:1}}).setOrigin(0.5).setDepth(15));
        }

        // Fiyat + Satın Al butonu
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
            // Sadece Telegram WebApp ortamında IAP açılır.
            // Telegram dışı ortamlarda (tarayıcı, test) satın alma işlemi engellenir
            // — ücretsiz gem verilmez.
            if(window.Telegram?.WebApp?.openInvoice){
                window.Telegram.WebApp.openInvoice("gem_"+i,(status)=>{
                    if(status==="paid"){addGems(pack.gems+pack.bonus);gemTxt.setText("GEM "+PLAYER_GEMS);showPurchaseEffect(scene,CX+CW/2,cy+CARD_H/2,tagCol,pack.gems+pack.bonus,"GEM");}
                });
            } else {
                // Prod güvenliği: Telegram dışı ortamda satın alma devre dışı.
                console.warn("[NT] IAP: Telegram WebApp ortamı bulunamadı, satın alma engellendi.");
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
        start:"BAŞLA",shop:"MAĞAZA",collection:"KOLEKSİYON",
        unlocks:"AÇIKLAMALAR",credits:"KREDİLER",options:"AYARLAR",
        back:"GERİ",close:"KAPAT",buy:"SATIN AL",maxed:"MAX ✓",
        gameOver:"OYUN BİTTİ",playAgain:"TEKRAR OYNA",mainMenu:"ANA MENÜ",
        paused:"DURDURULDU",resume:"DEVAM ET",
        levelUp:"SEVİYE ATLADI!",pickPower:"Bir güç seç",
        perfect:"MÜKEMMEL!",centerHit:"TAM ORTADAN!",bullseye:"HArika vuruş!",
        chestOpened:"SANDIK AÇILDI!",earned:"kazanıldı!",
        chestCommon:"OLAĞAN SANDIK",chestRare:"NADİR SANDIK",chestLegendary:"EFSANE SANDIK",
        kills:"ÖLD.",time:"SÜRE",combo:"KOMBO",gold:"ALTIN",
        bestRun:"EN İYİ:",highscore:"YÜKSEK SKOR",
        shopUpgrades:"GÜÇLENDİRMELER",shopCosmetics:"KOZMETİKLER",
        shopWeaponSkins:"SİLAH SKİNLERİ",shopCharSkins:"KARAKTER SKİNLERİ",
        shopEnemySkins:"DÜŞMAN SKİNLERİ",
        selectMap:"HARİTA SEÇ",mapLocked:"🔒 LOCKED",mapsTitle:"HARİTALAR",locked:"KİLİTLİ",lockedReq:"Gereksinim:",
        map1Name:"Azhkar Çölü",map1Desc:"Azhkar… kaybolan medeniyetin son izleri",
        map2Name:"Karanlık Mağara",map2Desc:"Henüz açılmadı",
        map3Name:"Antik Tapınak",map3Desc:"Henüz açılmadı",
        collectionTitle:"KOLEKSİYON",unlocksTitle:"AÇIKLAMALAR",
        weaponsTab:"SİLAHLAR",enemiesTab:"DÜŞMANLAR",upgradesTab:"GÜÇLER",
        settingsTitle:"AYARLAR",language:"DİL",sfxVol:"SFX SES",
        musicVol:"MÜZİK SESİ",langTR:"Türkçe",langEN:"English",langRU:"Русский",
        upDamage:"Güç",upAttack:"Hız Ateşi",upSize:"Büyük Kurşun",
        upSplit:"Parça Mermisi",upSpeed:"Çeviklik",upPierce:"Delici",
        upCrit:"Kritik",upKnockback:"İtme",upFreeze:"Buz",
        upXpboost:"Akademisyen",upMaxhp:"Dayanıklılık",upRegen:"Yenilenme",
        upHeal:"Sağlık Kiti",
        upExplosive:"El Bombası",upLightning:"Zincir Şimşek",
        upDrone:"Muharip Drone",upSaw:"Testere",upPoison:"Zehir Bulutu",upLaser:"Lazer",upThunder:"Gök Gürültüsü",
        upRapidBlaster:"Hızlı Blaster",upHeavyCannon:"Ağır Top",
        upSpreadShot:"Saçma Atış",upChainShot:"Zincir Atış",upPrecisionRifle:"Keskin Nişancı",
        upReflectRifle:"Yansıma Tüfeği",
        evoTriCannon:"Üç Top",evoStormCore:"Fırtına Çekirdeği",
        evoOverload:"Aşırı Yük",
        evoMirrorStorm:"Ayna Fırtınası",
        startHp:"Demir Bünye",startHpDesc:"Başla: +10 max can",
        startDmg:"Keskin Bıçak",startDmgDesc:"Başla: +15% hasar",
        startSpd:"Çöl Koşucusu",startSpdDesc:"Başla: +10% hız",
        goldBonus:"Hazine Avcısı",goldBonusDesc:"+25% altın kazan",
        extraLife:"İkinci Şans",extraLifeDesc:"Bir kez diriliş",
        xpBonus:"Alim Hediyesi",xpBonusDesc:"Başla: +20% XP",
        critStart:"Kartal Gözü",critStartDesc:"Başla: %5 kritik",
        chestHeal:"+5 CAN",chestDamage:"+15% HASAR",
        chestAttack:"+8% ATEŞ HIZI",chestSpeed:"+10% HAREKET",
        chestMaxHp:"+3 MAX CAN",chestComboBoost:"KOMBO BOOST",
        chestXp:"+50% XP (30sn)",chestGold:"+ALTIN",
        extraLife2:"✦ DİRİLİŞ!",
        evolution:"EVRİM",
        upDamageDesc:"+20% hasar",upAttackDesc:"+15% ateş hızı",upSizeDesc:"+18% mermi boyutu",
        upSplitDesc:"Öldürünce mermi parçalanır",upSpeedDesc:"+12% hareket hızı",upPierceDesc:"+1 düşman deler",
        upCritDesc:"+8% kritik şans",upKnockbackDesc:"Düşmanı iter",upFreezeDesc:"%9 dondurma",
        upXpboostDesc:"+20% XP",upMaxhpDesc:"+5 max can",upRegenDesc:"4s/can yenileme",
        upHealDesc:"Anında 8 can",
        upExplosiveDesc:"Patlayan mermi",upLightningDesc:"Şimşek zinciri",
        upDroneDesc:"Oto hedefli drone",upSawDesc:"Seken testere",upPoisonDesc:"Ölümde zehir",upLaserDesc:"Alan lazeri",upThunderDesc:"Rastgele şimşek",
        upRapidBlasterDesc:"Hızlı ateş, düşük hasar. 2.2x hız / 0.6x hasar",
        upHeavyCannonDesc:"Yavaş ama patlamalı. 2.5x hasar / 0.5x hız",
        upSpreadShotDesc:"3 mermi koni atışı. 0.45x hasar",
        upChainShotDesc:"3 düşmana sekme. 0.8x hasar",
        upPrecisionRifleDesc:"Merkeze vur = 3x bonus. 1.8x hasar",
        upReflectRifleDesc:"Kenara çarp, sek. 2x sekme, 0.7x hasar/sekme",
        evoTriCannonDesc:"Üçlü geniş atış",evoStormCoreDesc:"Rezonans x2, hasar x1.5",
        evoOverloadDesc:"%4 ekran patlaması",
        evoCryoFieldDesc:"Alan dondurucu",evoPlagueBearer2Desc:"Patlama zehir bırakır",
        evoMirrorStormDesc:"İlk sekmede 3'e bölünür",
        comingSoon:"🔒 COMING SOON",required:"Gerekli:",unlocked:"✓ AÇIK",
        creditsTitle:"KREDİLER",creditsBy:"YAPIMCI",
        footerSignature:"NOT TODAY  —  Şahin Beyazgül",
        cosmingSoonLabel:"🎨 Yakında... / Coming Soon",
        evolutionsLabel:"— EVRİMLER —",
        synergyTitle:"⚡ SİNERJİ ⚡",
        miniBossAlert:"⚠  MİNİ BOSS GELİYOR  ⚠",
        evolutionTitle:"⚡ EVRİM ⚡",
        powerSpike_overload:"AŞIRI YÜK",
        powerSpike_unstoppable:"DURDURULAMAZ",
        powerSpike_godlike:"TANRI MODU",
        nearDeath_buff:"💀 ÖLÜM ADRENALINI",
        comboBreak:"KOMBO KIRILDI",
        hiddenSynergy:"✦ GİZLİ SİNERJİ",
        eventDoubleDmg:"ÇİFT HASAR",
        eventGodBurst:"TANRI PATLAMASI",
        eventTripleGold:"3X ALTIN MOD",
        eventOneHit:"TEK VURUŞ ÖLÜMü",
        accept:"Kabul Et",
        decline:"Reddet",
        crystalRevived:"💎 DİRİLDİN!",
        crystalRevivedFull:"💎 DİRİLDİN! 5sn YENİLMEZ",
        howto_goal:"Piramitler yere değmeden önce mermiyle vur ve yok et!",
        howto_move:"← → tuşları veya ekrana dokunarak sağa-sola hareket et",
        howto_shoot:"Boşluk = ateş et. Düşmanın TAM ORTASINA vur = 3x hasar!",
        howto_level:"XP orb topla. Her seviyede bir güçlendirme seç.",
        howto_evo:"2 uyumlu güç maks seviyeye ulaşırsa Evrim aktif olur!",
        howto_events:"~60 saniyede bir riskli event gelir. Dikkatli karar ver!",
        howto_combo:"Hızlı öldür → kombo artar → daha fazla XP ve altın!",
        howto_apple:"Düşmanlardan nadiren düşer. Topla = +3 Can",
        howto_crystal:"Boss öldür ya da 5 dk hayatta kal → kristal kazan!",
        howto_synergy:"2 uyumlu silah birlikte = gizli güçlü sinerji bonusu!",
        goScore:"SKOR",goNewRecord:"** YENI REKOR **",goLevel:"SEVİYE",goTime:"SÜRE",
        goRevive:"💎 DİRİL",goReviveCost:"(5 Elmas)",goInsufficientGems:"❌ Yetersiz Elmas!",
        goGemsStatus:"💎 Mevcut:",goGemsInsufficient:"(Yetersiz)",goShare:"📤 Skoru Paylaş",
        goRevivePrompt:"DİRİLMEK İSTER MİSİN?",goReviveCrystalCost:"Mevcut:",
        goReviveBtn:"✦ DİRİL  (3 💎)",
        leaderboard:"🏆 SKOR TABLOSU",lbTitle:"DÜNYA SIRALAMALARI",lbRank:"SIRA",lbPlayer:"OYUNCU",lbScore:"SKOR",lbLoading:"Yükleniyor...",lbEmpty:"Henüz skor yok!",lbYou:"(Sen)",lbSubmit:"Skoru Gönder",lbError:"Bağlantı hatası",lbGlobal:"GLOBAL",lbLocal:"KİŞİSEL"
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
        musicVol:"MUSIC VOL",langTR:"Türkçe",langEN:"English",langRU:"Русский",
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
        startHp:"Iron Body",startHpDesc:"Start: +10 max hp",
        startDmg:"Sharp Blade",startDmgDesc:"Start: +15% damage",
        startSpd:"Desert Runner",startSpdDesc:"Start: +10% speed",
        goldBonus:"Treasure Hunter",goldBonusDesc:"+25% gold earned",
        extraLife:"Second Chance",extraLifeDesc:"One revival",
        xpBonus:"Scholar Gift",xpBonusDesc:"Start: +20% XP",
        critStart:"Eagle Eye",critStartDesc:"Start: 5% crit",
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
        footerSignature:"NOT TODAY  —  Şahin Beyazgül",
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
        leaderboard:"🏆 LEADERBOARD",lbTitle:"WORLD RANKINGS",lbRank:"RANK",lbPlayer:"PLAYER",lbScore:"SCORE",lbLoading:"Loading...",lbEmpty:"No scores yet!",lbYou:"(You)",lbSubmit:"Submit Score",lbError:"Connection error",lbGlobal:"GLOBAL",lbLocal:"PERSONAL"
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
        musicVol:"ГРОМКОСТЬ МУЗЫКИ",langTR:"Türkçe",langEN:"English",langRU:"Русский",
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
        footerSignature:"NOT TODAY  —  Şahin Beyazgül",
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
// Dil ayarı: sadece "tr" ve "en" aktif.
// KASITLI KARAR (v9.0): LANG_DATA.ru tanımlı fakat henüz yayına hazır değil.
// Rusça seçilmişse veya değer yoksa İngilizce'ye döner.
// Rusça aktif etmek istersen aşağıdaki if koşulunu kaldır.
(function(){ const s=localStorage.getItem("nt_lang"); if(s==="ru"||!s){ localStorage.setItem("nt_lang","en"); } })();
let CURRENT_LANG = (localStorage.getItem("nt_lang")==="tr") ? "tr" : "en";
function L(k){ return (LANG_DATA[CURRENT_LANG]&&LANG_DATA[CURRENT_LANG][k]!==undefined)?LANG_DATA[CURRENT_LANG][k]:((LANG_DATA["tr"]&&LANG_DATA["tr"][k]!==undefined)?LANG_DATA["tr"][k]:k); }
function setLang(l){ CURRENT_LANG=l; localStorage.setItem("nt_lang",l); }
// Helper for objects with name/nameEN/nameRU fields
function LLang(obj,trKey,enKey,ruKey){ if(!obj) return ""; return CURRENT_LANG==="ru"?(obj[ruKey]||obj[trKey]):CURRENT_LANG==="en"?(obj[enKey]||obj[trKey]):obj[trKey]; }

// ── TELEGRAM KULLANICI BİLGİSİ ──────────────────────────────────────────────
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

// ── LEADERBOARD SİSTEMİ ───────────────────────────────────────────────────────
// API anahtarları client tarafında BULUNMAMALI — kimlik doğrulama
// Deno Deploy proxy (deep-bison-81.sahosante.deno.net) üzerinde yapılır.
// LB_API_KEY kasıtlı olarak burada tanımlanmamıştır; Deno env variable kullan.
const LB_BIN_ID   = "nt_leaderboard_v1";
const LB_API_BASE = "https://api.jsonbin.io/v3/b";

// Global leaderboard — jsonbin.io'da saklanır
// Veri yapısı: { scores: [ {id, name, score, kills, level, date}, ... ] }
let _lbCache = null;
let _lbLastFetch = 0;

function _getLBBinUrl(){ return "https://deep-bison-81.sahosante.deno.net/lb"; }

// Gerçek online LB için basit Deno Deploy / Workers proxy kullanıyoruz
// Telegram CloudStorage kişisel skoru saklar, Deno proxy global LB
// Eğer proxy yoksa sadece yerel localStorage'den gösterir

async function lbFetchScores(){
    // Önce local cache'den göster
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

// Client tarafı akıl dışı değer filtresi.
// ÖNEMLI: Bu kontrol yalnızca kaba manipülasyonları engeller.
// Gerçek güvenlik Deno proxy tarafında sağlanmalıdır:
//   1. Gelen `tok` değeri proxy'de aynı _hash mantığıyla doğrulanmalı.
//   2. Proxy kendi plausibility kontrolünü uygulamalı (bu limitleri yansıtarak).
//   3. Telegram user.id ile session eşleştirmesi proxy'de yapılmalı.
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
    }catch(e){console.warn("[NT] Hata yutuldu:",e)}

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

// Yerel cache + kendi skorunu birleştirerek sıralama oluştur
function lbGetMergedScores(){
    const scores = (_lbCache&&_lbCache.scores) ? [..._lbCache.scores] : [];
    // Kendi entry'mizi de ekle (sunucuya ulaşamadıysa da göster)
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

// ── MOBİL BUTON GİZLE/GÖSTER YARDIMCILARI ────────────────────────────────────
// SceneGame'de butonlar S._btnFire, S._btnLeft, S._btnRight olarak saklanır
function _hideMobileBtns(S){
    if(!S) return;
    [S._btnFire, S._btnLeft, S._btnRight].forEach(btn=>{
        if(!btn) return;
        try{ if(btn.g)btn.g.setVisible(false); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        try{ if(btn.lbl)btn.lbl.setVisible(false); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        try{ if(btn.hit){btn.hit.disableInteractive();btn.hit.setVisible(false);} }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        // Sol/sağ buton için rightHit ayrı saklıdır
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

// ── AYARLAR BAŞLANGIÇ YÜKLEME — localStorage → window değişkenleri ──────────
(function _loadSettings(){
    const _b=(k,def)=>{ const v=localStorage.getItem(k); return v===null?def:v==="1"; };
    const _f=(k,def)=>{ const v=localStorage.getItem(k); return v===null?def:parseFloat(v); };
    window._nt_screen_shake = _b("nt_screen_shake", true);
    window._nt_dmg_nums     = _b("nt_show_dmg",     true);
    window._nt_sfx_on       = _b("nt_sfx_on",       true);
    window._nt_music_on     = _b("nt_music_on",      true);
    window._nt_flame        = _b("nt_flame_effects", true);
    window._nt_shadows      = _b("nt_ground_shadows",true);
    window._nt_sfx_vol      = _f("nt_sfx_vol",  0.19);
    window._nt_music_vol    = _f("nt_music_vol", 0.19);
})();

// ── SABİTLER ─────────────────────────────────────────────────
const GROUND_Y    = 453;
const XP_GROUND_Y = 445;
const SPAWN_SAFE_X= 50;
const MAX_ENEMIES = 32; // [BALANCE] late game: HP değil sayı artar
const NEW_PYRAMID_TYPES = new Set(["inferno","glacier","phantom_tri","volt","obsidian"]); // [PERF] top-level Set — applyDmg hot path'te yeniden oluşturulmuyor
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
    // Tri-Cannon: split+size — passive slot 2 harcıyor, makul
    {name:"Tri-Cannon",   icon:"🔱",nameKey:"evoTriCannon",   descKey:"evoTriCannonDesc",   req:["split","size"],           active:false},
    // Storm Core: damage Lv2 yeterli — eskiden damage+crit (2 passive slot)
    {name:"Storm Core",   icon:"⚡",nameKey:"evoStormCore",   descKey:"evoStormCoreDesc",   req:["damage","attack"],        active:false},
    // Overload: attack Lv2 — damage ile çakışmıyor artık
    {name:"Overload",     icon:"💥",nameKey:"evoOverload",    descKey:"evoOverloadDesc",    req:["attack","crit"],          active:false},
    // Cryo Field: freeze+speed — pierce yerine speed, daha kolay erişim
    {name:"Cryo Field",   icon:"❄️",nameKey:"evoCryoField",   descKey:"evoCryoFieldDesc",   req:["freeze","speed"],         active:false},
    // Plague Bearer: poison+explosive — weapon slot 2 harcıyor, makul
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
    // ── ÖZEL PİRAMİT TİPLERİ — renkli varyantlar, farklı mekanikler ──
    ["inferno",8,3],      // Ateş piramidi — kırmızı, 360 dönerek iner
    ["glacier",9,3],      // Buz piramidi — mavi, yavaş ama zırhlı
    ["phantom_tri",11,2], // Hayalet üçgen — mor, bölünür
    ["volt",12,2],        // Elektrik üçgen — sarı, zigzag + hızlanır
    ["obsidian",16,1],    // Obsidyen üçgen — siyah, çok sert, hasar yansıtır
];

const GOLD_UPGRADES=[
    // [v10.1] Yeni maliyet eğrisi:
    {id:"start_hp",    nameKey:"startHp",    descKey:"startHpDesc",    cost:400,  baseCost:400,  maxLevel:5,level:0,icon:"💪"},
    {id:"start_dmg",   nameKey:"startDmg",   descKey:"startDmgDesc",   cost:550,  baseCost:550,  maxLevel:5,level:0,icon:"⚔️"},
    {id:"start_spd",   nameKey:"startSpd",   descKey:"startSpdDesc",   cost:400,  baseCost:400,  maxLevel:5,level:0,icon:"🏃"},
    {id:"gold_bonus",  nameKey:"goldBonus",  descKey:"goldBonusDesc",  cost:700,  baseCost:700,  maxLevel:5,level:0,icon:"💰"},
    {id:"extra_life",  nameKey:"extraLife",  descKey:"extraLifeDesc",  cost:2000, baseCost:2000, maxLevel:3,level:0,icon:"❤️"},
    {id:"xp_bonus",    nameKey:"xpBonus",    descKey:"xpBonusDesc",    cost:550,  baseCost:550,  maxLevel:5,level:0,icon:"📚"},
    {id:"crit_start",  nameKey:"critStart",  descKey:"critStartDesc",  cost:1200, baseCost:1200, maxLevel:5,level:0,icon:"🦅"},
];

let GS;
let PLAYER_GOLD    = parseInt(secureGet("nt_gold",    "0", "0"));
let PLAYER_CRYSTAL = parseInt(secureGet("nt_crystal", "0", "0"));

// ═══════════════════════════════════════════════════════════════
// ★ ADIM 4 — RELİC SİSTEMİ (crystal ile açılır)
// ═══════════════════════════════════════════════════════════════
const RELICS = [
    {id:"desert_eye",     icon:"👁", cost:3,  nameKey:"relicDesertEye",
     desc:"Her perfect hit %3 şansla 1 crystal düşürür.",
     apply:(gs)=>{ gs._relicDesertEye=true; }},
    {id:"iron_skin",      icon:"🛡", cost:4,  nameKey:"relicIronSkin",
     desc:"Başlangıçta +8 max HP.",
     apply:(gs)=>{ gs.maxHealth+=8; gs.health=Math.min(gs.health+8,gs.maxHealth); }},
    {id:"gold_magnet",    icon:"💰", cost:3,  nameKey:"relicGoldMagnet",
     desc:"+30% altın kazanımı, kalıcı.",
     apply:(gs)=>{ gs.goldMult=(gs.goldMult||1)*1.30; }},
    {id:"combo_heart",    icon:"❤", cost:5,  nameKey:"relicComboHeart",
     desc:"Combo 15+ iken hasar almak canı 2 yerine 1 azaltır.",
     apply:(gs)=>{ gs._relicComboHeart=true; }},
    {id:"void_crystal",   icon:"🔮", cost:6,  nameKey:"relicVoidCrystal",
     desc:"Boss öldürünce 2 crystal kazanırsın (1 yerine).",
     apply:(gs)=>{ gs._relicVoidCrystal=true; }},
    {id:"berserker_ring", icon:"⚡", cost:4,  nameKey:"relicBerserkerRing",
     desc:"Can %25'in altında: +20% ek hasar.",
     apply:(gs)=>{ gs._relicBerserkerRing=true; }},
    {id:"ghost_boots",    icon:"👟", cost:3,  nameKey:"relicGhostBoots",
     desc:"Başlangıçta +15% hareket hızı.",
     apply:(gs)=>{ gs.moveSpeed=Math.min(285,gs.moveSpeed*1.15); }},
    {id:"lucky_charm",    icon:"🍀", cost:5,  nameKey:"relicLuckyCharm",
     desc:"Upgrade seçiminde 4. seçenek görünür.",
     apply:(gs)=>{ gs._relicLuckyCharm=true; }},
    {id:"phoenix_ash",    icon:"🔥", cost:8,  nameKey:"relicPhoenixAsh",
     desc:"Oyun başına 1 otomatik diriliş.",
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

// ── HARİTA KİLİT SİSTEMİ ─────────────────────────────────────
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
// ★ KRİSTAL SİSTEMİ — Mor kristal para birimi
// Kazanımı çok zor, diriliş + premium skin için kullanılır
// ═══════════════════════════════════════════════════════════════
const CRYSTAL_SOURCES = {
    boss_kill:        1,   // boss öldürünce 1 kristal
    survive_5min:     2,   // 5 dakika hayatta kalınca 2
    perfect_100:      1,   // tek runda 100 perfect hit
    level_25:         1,   // lv25'e ulaşınca
};

const CRYSTAL_COSTS = {
    revive: 3,   // diriliş: 3 kristal
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
    // Önceden her çağrıda pause yapılıyordu — lockUpgrade birden fazla kez
    // çağrılabildiğinde (level-up + sandık + event eş zamanlı) nested pause oluşuyordu.
    // unlockUpgrade sadece _upgradeLock===0 olunca resume yapıyor, fakat
    // physics motoru nested pause'u saymıyor — tek bir resume yeterli.
    // Dolayısıyla önceki davranış güvenliydi AMA _microFreeze de pause yapıyordu.
    // _microFreeze 35ms sonra resume yapınca upgrade UI sırasında fizik yeniden başlıyordu.
    // ÇÖZÜM: _upgradeLock 0→1 geçişinde pause yap, sonraki çağrılarda atla.
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
        // [CRASH FIX] isPaused kontrolü — zaten resume'daysa çift resume önle
        if(S && S.physics){
            try{ S.physics.resume(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }
        if(S && S.spawnEvent) S.spawnEvent.paused = false;
    }
}

// ── questDoneCache — localStorage'a her frame yazmayı önler
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
let _perfMode = "high"; // "high" | "low"
let _fpsSamples = [];

function updatePerfMode(fps){
    _fpsSamples.push(fps);
    if(_fpsSamples.length > 60) _fpsSamples.shift();
    if(_fpsSamples.length < 30) return;
    const avg = _fpsSamples.reduce((a,b)=>a+b,0)/_fpsSamples.length;
    _perfMode = avg < 35 ? "low" : "high";
}

// Particle budget — low mode'da daha az efekt
function canSpawnParticle(priority="normal"){
    if(_perfMode === "high") return true;
    if(priority === "critical") return true;   // boss death vs
    if(priority === "normal")   return Math.random() < 0.4;
    return false; // "cheap" particle → low mode'da atla
}


// Mevcut UPGRADES sistemine dokunmadan, kombinasyon tespiti ile çalışır
// ═══════════════════════════════════════════════════════════════
const SYNERGIES = [
    {
        id:"cryo_shatter",
        name:"Buz Kırılması", nameEN:"Ice Shatter",
        req:["freeze","pierce"], reqLv:2,
        desc:"Donmuş düşman kritik alır. Pierce +1.",
        descEN:"Frozen enemies take crits. Pierce +1.",
        color:0x88ddff, icon:"❄",
        active:false,
        apply:(gs)=>{ gs._synergyCryoShatter=true; gs.pierceCount+=1; }
    },
    {
        id:"chain_storm",
        name:"Zincir Fırtınası", nameEN:"Chain Crit Storm",
        req:["lightning","crit"], reqLv:2,
        desc:"Şimşek kritik ile çakar. +%20 krit hasar.",
        descEN:"Lightning always crits. +20% crit damage.",
        color:0xffff44, icon:"⚡",
        active:false,
        apply:(gs)=>{ gs._synergyChainStorm=true; gs.critMult+=0.2; }
    },
    {
        id:"drone_shield",
        name:"Drone Zırhı", nameEN:"Drone Shield",
        req:["drone","maxhp"], reqLv:2,
        desc:"Drone vurduğunda can iyileşir (+1 her 8 vuruşta).",
        descEN:"Drones heal on hit (+1 every 8 hits).",
        color:0x00ffff, icon:"🛡",
        active:false,
        apply:(gs)=>{ gs._synergyDroneShield=true; gs._droneHitCount=0; }
    },
    {
        id:"laser_focus",
        name:"Lazer Odağı", nameEN:"Laser Focus",
        req:["laser","crit"], reqLv:2,
        desc:"Lazer %50 şansla kritik vurur.",
        descEN:"Laser has 50% chance to crit.",
        color:0xff2200, icon:"🎯",
        active:false,
        apply:(gs)=>{ gs._synergyLaserFocus=true; }
    },
    {
        id:"speed_regen",
        name:"Rüzgar Kürü", nameEN:"Wind Cure",
        req:["speed","regen"], reqLv:2,
        desc:"Hareket ederken daha hızlı iyileşirsin.",
        descEN:"Moving speeds up regeneration.",
        color:0x44ff88, icon:"🌀",
        active:false,
        apply:(gs)=>{ gs._synergyWindCure=true; }
    },
    // ── GİZLİ SİNERJİLER — oyuncuya söylenmiyor, keşfedince sürpriz ──
    {
        id:"hidden_thunder_freeze",
        name:"Kış Fırtınası", nameEN:"Winter Storm", nameRU:"Зимняя Буря",
        req:["thunder","freeze"], reqLv:2,
        desc:"Gizli: Şimşek dondurucu etkisi kazanır.",
        descEN:"Hidden: Thunder gains freeze effect.",
        descRU:"Скрытое: Молния замораживает врагов.",
        color:0x88ccff, icon:"❄⚡",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyWinterStorm=true; gs.freezeChance=Math.min(0.5,gs.freezeChance+0.25); }
    },
    // ── v9.4 NEW WEAPON SYNERGIES ──────────────────────────────
    {
        id:"rapid_freeze",
        name:"Buz Fırtınası", nameEN:"Ice Storm", nameRU:"Ледяная Буря",
        req:["rapid_blaster","freeze"], reqLv:1,
        desc:"Gizli: Hızlı blaster dondurucu etki kazanır.",
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
        desc:"Gizli: Ağır top patlamaları zehir bırakır.",
        descEN:"Hidden: Heavy Cannon explosions leave poison.",
        descRU:"Скрытое: Взрывы тяжёлой пушки оставляют яд.",
        color:0x88ff44, icon:"💥☣",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyCannonPoison=true; }
    },
    {
        id:"precision_crit",
        name:"Kılıç Ustası", nameEN:"Blade Master", nameRU:"Мастер Клинка",
        req:["precision_rifle","crit"], reqLv:1,
        desc:"Gizli: Keskin nişancı mükemmel isabetlerde her zaman kritik.",
        descEN:"Hidden: Precision Rifle perfect hits always crit.",
        descRU:"Скрытое: Снайпер всегда критует при точном попадании.",
        color:0xff2244, icon:"🎯💥",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyPrecisionCrit=true; }
    },
    {
        id:"chain_lightning",
        name:"Yıldırım Zinciri", nameEN:"Thunder Chain", nameRU:"Цепь Молний",
        req:["chain_shot","lightning"], reqLv:1,
        desc:"Gizli: Zincir atışlar şimşek tetikler.",
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
        desc:"Gizli: Yansıma mermisi düşmana çarptığında %20 ek donma şansı.",
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
        desc:"Gizli: Yansıma mermisi ilk çarpışmada patlama yapar.",
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
// TÜM STAT HESAPLAMALARI buradan geçer.
// Hiçbir sistem gs.damage, gs.shootDelay veya gs.moveSpeed'i
// doğrudan kalıcı olarak mutate etmez — yalnızca "bonus"
// alanlarını doldurur, bu pipeline okur.
//
// Kural:
//  finalDamage  = baseDamage  * (1 + ΣupgradeBonuses + eventBonus + comboBonus)
//  finalSpeed   = baseMoveSpd * (1 + ΣupgradeBonuses + eventBonus)
//  finalShoot   = baseShootDly / (1 + ΣattackBonuses + eventBonus)
//
// Bütün çarpanlar ADDİTİF toplanır → exponential stacking yok.
// ═══════════════════════════════════════════════════════════════


// [v10.x BALANCE REDESIGN] — FULL TRADEOFF SYSTEM
//
// TEMEL KURAL: Her upgrade bir kazanç VE bir maliyet içerir.
// Hiçbir upgrade saf buff değildir — kimlik değişikliğidir.
//
// YENİ HASAR FORMÜLÜ (k=0.65, daha agresif DR):
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
// PASSIVE MALİYETLERİ (her level'da uygulanır, pipeline'a girer):
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
// PIERCE: Her ek isabet sonrası −20% hasar, taban %50.
// XP BOOST: Toplam XP çarpanı hard cap: ×1.30 (snowball kapatıldı).
// CRIT: Çarpanı 2.0× sabit (upgrade edilemez). Cap: %38.
// ══════════════════════════════════════════════════════════════

const BASE_DAMAGE      = 1.2;
const BASE_SHOOT_DELAY = 170;
const BASE_MOVE_SPEED  = 260;
const BASE_CRIT_MULT   = 2.0; // SABİT — upgrade edilemez

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
 * [v10.x REDESIGN] Oyuncunun anlık "temiz" stat'larını hesapla.
 * Her passive upgrade artık hem buff hem maliyet içerir.
 * gs.damage / gs.shootDelay doğrudan mutate edilmemeli —
 * bu fonksiyon döndürdüğü değerleri kullan.
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
    // Negatif raw'da asimetrik soft cap — hasar bazın %70'inin altına düşmez
    const softDmgBonus = rawDmgBonus >= 0
        ? rawDmgBonus / (1 + rawDmgBonus * 0.80)
        : Math.max(-0.30, rawDmgBonus / (1 + Math.abs(rawDmgBonus) * 0.40));
    const softAtkBonus = rawAtkBonus / (1 + Math.max(0, rawAtkBonus) * 0.70);

    // ── HARD CEILING: 3.8 — was 4.5 ──
    // At base 1.2 with max shop: baseDmg ≈ 1.44 → ceiling = 3.8/1.44 = 2.64× base
    // Enemies at minute 20 have 3.3× HP → they survive 1-2 hits as intended
    const rawFinalDmg = baseDmg * (1 + softDmgBonus);
    const finalDmg   = Math.min(3.8, Math.max(baseDmg * 0.70, rawFinalDmg)); // [BALANCE] floor: baz hasarın %70'i

    // ── ATTACK SPEED FLOOR: 180ms hard minimum (was 175ms) ──
    // This stops rapid-fire builds from erasing enemies before they enter the screen
    const finalShoot = Math.max(180, baseShoot / (1 + Math.max(0, softAtkBonus)));

    // Move speed hard cap 280 px/s (was 285)
    const finalSpd   = Math.min(280, baseMov * (1 + Math.max(-0.30, rawSpdBonus)));

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
        gs.damage    *= 2.60;                                // was 1.85 — yavaş ama güçlü, arttırıldı
        gs.shootDelay = Math.min(750, gs.shootDelay * 2.0);
    } else if(wt==="spread_shot"){
        gs.damage    *= 0.75;                                // ×0.70 dmgM per bullet, 3 bullets
    } else if(wt==="chain_shot"){
        gs.damage    *= 0.82;                                // was 0.85 — single target weaker, 3-target stays good
    } else if(wt==="precision_rifle"){
        gs.damage    *= 1.35;                                // was 1.4 — slight nerf, perfect-hit 2.8x still rewarding
        gs.shootDelay = Math.max(140, gs.shootDelay / 0.85); // floor 140ms (was 130ms)
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
        // Slide-in animasyonu: bar ekranın altından yukarı kayar
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

    // ── Dinamik renk geçişi ──
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
    // Slide-out: bar aşağı kayarak kaybolur, sonra yok edilir
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
        title:"ALTIN AKINI", titleEN:"GOLD RUSH", titleRU:"ЗОЛОТОЙ ПОТОК",
        desc:"Anında +150 altın + %40 gold kazanımı (35sn). Spawn hızlanmaz.",
        descEN:"Instantly +150 gold + 40% more gold for 35s. No spawn penalty.",
        descRU:"Сразу +150 золота + 40% больше золота (35с).",
        icon:"💰", color:0xffcc00,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"Принять",
             fn:(S)=>{
                 const gs=GS; // [FIX] guard kaldırıldı — triggerRunEvent startEvent'i zaten çağırdı
                 const origGold=gs.goldMult;
                 EventManager.startEvent("gold_rush",gs,35000,null);
                 // Anında bonus
                 gs.gold+=150; PLAYER_GOLD+=150; secureSet("nt_gold",PLAYER_GOLD);
                 gs.goldMult=origGold+0.40;
                 gs._goldRushActive=true;
                 const timerEv=S.time.addEvent({delay:35000,callback:()=>{
                     if(!GS||GS.gameOver) return;
                     GS.goldMult=origGold; GS._goldRushActive=false;
                     EventManager.endEvent(GS);
                     showHitTxt(S,180,220,"Altın Akını bitti.","#888888",false);
                 }});
                 if(EventManager._state) EventManager._state.timerEv=timerEv;
                 showHitTxt(S,180,200,"ALTIN AKINI! +150 Gold Anında / +40% Gold (35sn)","#ffcc00",true);
             }},
            {label:"Reddet (+60⬡)",labelEN:"Decline (+60⬡)",labelRU:"\u041e\u0442\u043a\u0430\u0437 (+60⬡)",
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,"+60G Reddetme Bonusu","#ffcc44",false); }}
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
                 syncStatsFromPipeline(gs);
                 const timerEv=S.time.addEvent({delay:40000,callback:()=>{
                     if(!GS||GS.gameOver) return;
                     GS._glassCannon=false; GS._glassCannonPipelined=false;
                     GS.maxHealth+=2; GS.health=Math.min(GS.health,GS.maxHealth);
                     syncStatsFromPipeline(GS); EventManager.endEvent(GS);
                     showHitTxt(S,180,220,"\ud83d\udd2e Cam Top bitti.","#888888",false);
                 }});
                 if(EventManager._state) EventManager._state.timerEv=timerEv;
                 showHitTxt(S,180,200,"\ud83d\udd2e CAM TOP! +15% HASAR / Max HP-2 (40sn)","#ffaa22",true);
             }},
            {label:"Reddet (+60⬡)",labelEN:"Decline (+60⬡)",labelRU:"\u041e\u0442\u043a\u0430\u0437 (+60⬡)",
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,"+60G Reddetme Bonusu","#ffcc44",false); }}
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
                 syncStatsFromPipeline(gs);
                 showHitTxt(S,180,200,"\ud83d\udca5 KAOS PATLAMASI! (30sn) \u2014 H\u0131z -%10","#ff2244",true);
                 let burstCount=0;
                 const burstEv=S.time.addEvent({delay:6000,loop:true,callback:()=>{
                     if(!GS||GS.gameOver||!S.player){burstEv.remove();return;}
                     burstCount++;
                     if(burstCount>5){
                         burstEv.remove(); GS._chaosSpeedDebuff=false;
                         syncStatsFromPipeline(GS); EventManager.endEvent(GS);
                         showHitTxt(S,180,220,"\ud83d\udca5 Kaos Patla\u015f\u0131 bitti.","#888888",false);
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
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,"+60G Reddetme Bonusu","#ffcc44",false); }}
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
                 syncStatsFromPipeline(gs);
                 showHitTxt(S,180,200,"\ud83d\udee1\ufe0f HAYATTA KALMA! (42sn) \u2014 H\u0131z -%15","#44ff88",true);
                 let regenCount=0;
                 const regenEv=S.time.addEvent({delay:6000,loop:true,callback:()=>{
                     if(!GS||GS.gameOver){regenEv.remove();return;}
                     regenCount++;
                     if(regenCount>7){
                         regenEv.remove(); GS._survivalModeDebuff=false;
                         syncStatsFromPipeline(GS); EventManager.endEvent(GS);
                         showHitTxt(S,180,220,"\ud83d\udee1\ufe0f Hayatta Kalma bitti.","#888888",false);
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
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,"+60G Reddetme Bonusu","#ffcc44",false); }}
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
                 syncStatsFromPipeline(gs);
                 const timerEv=S.time.addEvent({delay:30000,callback:()=>{
                     if(!GS||GS.gameOver) return;
                     GS._blitzMode=false; GS._blitzXpPenalty=false;
                     syncStatsFromPipeline(GS); EventManager.endEvent(GS);
                     showHitTxt(S,180,220,"\u26a1 Blitz Mode bitti.","#888888",false);
                 }});
                 if(EventManager._state) EventManager._state.timerEv=timerEv;
                 showHitTxt(S,180,200,"\u26a1 YILDIRIN HIZI! +25% Ate\u015f / XP -%30 (30sn)","#ffee44",true);
             }},
            {label:"Reddet (+60⬡)",labelEN:"Decline (+60⬡)",labelRU:"\u041e\u0442\u043a\u0430\u0437 (+60⬡)",
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,"+60G Reddetme Bonusu","#ffcc44",false); }}
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
                 const gs=GS; // [FIX] guard kaldırıldı
                 const origSpawn=gs.spawnDelay;
                 EventManager.startEvent("xp_frenzy",gs,25000,null);
                 gs._xpFrenzyMode=true;
                 gs.spawnDelay=Math.max(800,Math.floor(gs.spawnDelay*0.80));
                 const timerEv=S.time.addEvent({delay:25000,callback:()=>{
                     if(!GS||GS.gameOver) return;
                     GS._xpFrenzyMode=false; GS.spawnDelay=origSpawn;
                     EventManager.endEvent(GS);
                     showHitTxt(S,180,220,"\ud83d\udcda XP \u00c7\u0131lg\u0131nl\u0131\u011f\u0131 bitti.","#888888",false);
                 }});
                 if(EventManager._state) EventManager._state.timerEv=timerEv;
                 showHitTxt(S,180,200,"\ud83d\udcda XP \u00c7ILGINLI\u011eI! +40% XP / H\u0131zl\u0131 Spawn (25sn)","#44ffcc",true);
             }},
            {label:"Reddet (+60⬡)",labelEN:"Decline (+60⬡)",labelRU:"\u041e\u0442\u043a\u0430\u0437 (+60⬡)",
             fn:(S)=>{ const _dg=60; if(GS){GS.gold+=_dg; PLAYER_GOLD+=_dg; secureSet("nt_gold",PLAYER_GOLD);} EventManager.endEvent(GS); showHitTxt(S,180,240,"+60G Reddetme Bonusu","#ffcc44",false); }}
        ]
    },
];

// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ★ YENİ SİSTEM 5 — MİNİ BOSS VERİLERİ
// ═══════════════════════════════════════════════════════════════
const MINI_BOSS_POOL = [
    {
        id:"jelly_titan",
        name:"Jelly Titan", nameEN:"Jelly Titan", nameRU:"Желейный Титан",
        hp:130, armor:3, scale:2.8, color:0xFF9922, tint:0xFF9922,
        speed:0.32, reward:{chest:"legendary", xpMult:5}
        // Behavior: slow, wide, hard to dodge — blocks bullets with mass
    },
    {
        id:"bubble_king",
        name:"Bubble King", nameEN:"Bubble King", nameRU:"Пузырьковый Король",
        hp:95, armor:2, scale:2.2, color:0xFF88EE, tint:0xFF88EE,
        speed:0.60, reward:{chest:"rare", xpMult:4}
        // Behavior: fast, zigzag, spawns mini bubbles
    },
    {
        id:"candy_overlord",
        name:"Candy Overlord", nameEN:"Candy Overlord", nameRU:"Конфетный Повелитель",
        hp:110, armor:4, scale:2.5, color:0xFFDD44, tint:0xFFDD44,
        speed:0.38, reward:{chest:"legendary", xpMult:5}
        // Behavior: medium speed, pulsing glow, high armor
    },
    {
        id:"gummy_crusher",
        name:"Gummy Crusher", nameEN:"Gummy Crusher", nameRU:"Жевательный Давитель",
        hp:160, armor:2, scale:3.0, color:0xFF6644, tint:0xFF6644,
        speed:0.28, reward:{chest:"legendary", xpMult:6}
        // Behavior: biggest/slowest, massive HP, screen-filling presence
    },
    {
        id:"sugar_phantom",
        name:"Sugar Phantom", nameEN:"Sugar Phantom", nameRU:"Сахарный Призрак",
        hp:92, armor:1, scale:1.9, color:0xFFEEFF, tint:0xFFCCFF,
        speed:0.75, reward:{chest:"rare", xpMult:4} // [BALANCE] 75→92: erken kolay fix
        // Behavior: fast and semi-transparent, hard to track
    },
];

// ═══════════════════════════════════════════════════════════════
// ── TEXTURE BUILDER ───────────────────────────────────────────
function buildTextures(S){
    // [CRASH FIX] Texture'lar zaten oluşturulduysa tüm GPU işlemlerini atla.
    // buildTextures her sahne create()'inde çağrılıyor (SceneGame).
    // 70 adet synchronous generateTexture çağrısı ana thread'i 100-200ms blokluyor.
    // "tex_bullet" sentinel olarak kullanılır — varsa hepsi var demektir.
    if(S.textures.exists("tex_bullet")) return;

    const g=S.add.graphics();

   // ── MERMİLER — hepsi aynı ince dikdörtgen form, sadece renk/detay farklı ──
    // Boyut: 6x18 (default ile aynı), hizalama merkez

    // DEFAULT / RAPID — sarı, standart (6x18)
    g.fillStyle(0x553300,1); g.fillRect(2,0,2,2);
    g.fillStyle(0xaa6600,1); g.fillRect(2,2,2,3);
    g.fillStyle(0xffcc00,1); g.fillRect(2,5,2,9);
    g.fillStyle(0xffee55,1); g.fillRect(2,5,1,6);
    g.fillStyle(0xaa8800,1); g.fillRect(2,14,2,2);
    g.fillStyle(0x553300,0.6); g.fillRect(2,16,2,2);
    g.generateTexture("tex_bullet",6,18); g.clear();

    // SPREAD — mor/pembe, parlak, belirgin (6x18)
    g.fillStyle(0x220033,1); g.fillRect(2,0,2,2);         // koyu mor uç
    g.fillStyle(0x660088,1); g.fillRect(2,2,2,3);         // mor gövde üst
    g.fillStyle(0xcc00ff,1); g.fillRect(2,5,2,9);         // parlak mor
    g.fillStyle(0xff44ff,1); g.fillRect(2,5,1,6);         // pembe highlight
    g.fillStyle(0xffffff,0.7); g.fillRect(2,5,1,3);       // beyaz parlaması
    g.fillStyle(0x880088,1); g.fillRect(2,14,2,2);        // alt söner
    g.fillStyle(0x330044,0.7); g.fillRect(2,16,2,2);      // kuyruk
    g.generateTexture("tex_bullet_spread",6,18); g.clear();

    // CANNON — füze mermisi: sivri uç, ateş izi, ince (8x22)
    // Cannon — metalik çelik mermi
    g.fillStyle(0xddeeff,1); g.fillTriangle(3,0,5,0,4,3);
    g.fillStyle(0xffffff,0.9); g.fillRect(3,0,1,2);
    g.fillStyle(0x223344,1); g.fillRect(2,3,4,2);
    g.fillStyle(0x445566,1); g.fillRect(2,5,4,9);
    g.fillStyle(0x6688aa,1); g.fillRect(3,5,2,8);
    g.fillStyle(0xaaccee,0.7); g.fillRect(3,5,1,6);
    g.fillStyle(0x112233,1); g.fillRect(2,14,4,2);
    g.fillStyle(0x5588bb,0.5); g.fillRect(2,14,4,1);
    g.fillStyle(0x223344,1); g.fillRect(2,16,4,2);
    g.fillStyle(0x4499ff,0.45); g.fillRect(3,18,2,1);
    g.fillStyle(0x2266cc,0.35); g.fillRect(2,19,4,1);
    g.fillStyle(0x1144aa,0.20); g.fillRect(2,20,4,1);
    g.generateTexture("tex_bullet_cannon",8,22); g.clear();

    // PRECISION — kırmızı, çok ince (4x22), keskin iğne hissi
    g.fillStyle(0x220000,1); g.fillRect(1,0,2,2);
    g.fillStyle(0x880011,1); g.fillRect(1,2,2,4);
    g.fillStyle(0xdd0022,1); g.fillRect(1,6,2,12);
    g.fillStyle(0xff2244,1); g.fillRect(1,8,2,7);
    g.fillStyle(0xff88aa,0.8); g.fillRect(1,8,1,5);
    g.fillStyle(0xffffff,0.9); g.fillRect(1,0,1,3);
    g.generateTexture("tex_bullet_precision",4,22); g.clear();

    // REFLECT — teal/cyan, standart boyut (6x18), metalik
    g.fillStyle(0x001a11,1); g.fillRect(2,0,2,2);
    g.fillStyle(0x004433,1); g.fillRect(2,2,2,4);
    g.fillStyle(0x00aa88,1); g.fillRect(2,6,2,9);
    g.fillStyle(0x00ddbb,1); g.fillRect(2,6,1,7);
    g.fillStyle(0x20ffdd,0.7); g.fillRect(3,7,1,4);
    g.fillStyle(0xffffff,0.8); g.fillRect(2,6,1,2);
    g.fillStyle(0x003322,0.7); g.fillRect(2,15,2,3);
    g.generateTexture("tex_bullet_reflect",6,18); g.clear();

    // ── ORBIT BLADE — elektrik/yıldırım orb ──
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

    // ── SAW — Detaylı metalik testere texture ──
    // Dış gölge
    g.fillStyle(0x111111,1); g.fillCircle(10,10,10);
    // Dış halka katmanları
    g.fillStyle(0x3a3a3a,1); g.fillCircle(10,10,9);
    g.fillStyle(0x5a5a5a,1); g.fillCircle(10,10,8);
    g.fillStyle(0x787878,1); g.fillCircle(10,10,7);
    // 10 keskin diş
    g.fillStyle(0xdddddd,1);
    for(let i=0;i<10;i++){
        const a=Phaser.Math.DegToRad(i*36);
        const a2=Phaser.Math.DegToRad(i*36+14);
        g.fillTriangle(10,10,
            10+Math.cos(a)*10, 10+Math.sin(a)*10,
            10+Math.cos(a2)*7, 10+Math.sin(a2)*7);
    }
    // Diş highlight
    g.fillStyle(0xffffff,0.4);
    for(let i=0;i<10;i++){
        const a=Phaser.Math.DegToRad(i*36);
        g.fillRect(10+Math.cos(a)*9-0.5, 10+Math.sin(a)*9-0.5, 1, 1);
    }
    // Hub
    g.fillStyle(0x222222,1); g.fillCircle(10,10,5);
    g.fillStyle(0x444444,1); g.fillCircle(10,10,4);
    g.fillStyle(0x666666,1); g.fillCircle(10,10,3);
    // Hub artı
    g.fillStyle(0x888888,1); g.fillRect(8,9,4,2); g.fillRect(9,8,2,4);
    // Merkez cıvata
    g.fillStyle(0xaaaaaa,1); g.fillCircle(10,10,1);
    // Highlight
    g.fillStyle(0xffffff,0.5); g.fillCircle(7,7,1);
    g.generateTexture("tex_saw",20,20); g.clear();

    // ── DRONE — 28x28, detaylı pixel sanat dron ──
    // Arka gövde gölgesi
    g.fillStyle(0x000000,0.55); g.fillEllipse(14,16,20,8);
    // Ana gövde — koyu metalik gri merkez
    g.fillStyle(0x1a1a2e); g.fillRect(9,10,10,8);
    g.fillStyle(0x2d2d4a); g.fillRect(10,11,8,6);
    // Gövde üst highlight
    g.fillStyle(0x4a4a7a); g.fillRect(10,11,8,2);
    g.fillStyle(0x6666aa); g.fillRect(11,11,6,1);
    // Yan kollar — sol ve sağ (yatay)
    g.fillStyle(0x222233); g.fillRect(2,12,7,4);   // sol kol
    g.fillStyle(0x222233); g.fillRect(19,12,7,4);  // sağ kol
    g.fillStyle(0x333355); g.fillRect(3,13,5,2);   // sol kol iç
    g.fillStyle(0x333355); g.fillRect(20,13,5,2);  // sağ kol iç
    // Üst kollar — yukarı ve aşağı (dikey)
    g.fillStyle(0x222233); g.fillRect(12,2,4,7);   // üst kol
    g.fillStyle(0x222233); g.fillRect(12,19,4,7);  // alt kol
    g.fillStyle(0x333355); g.fillRect(13,3,2,5);   // üst iç
    g.fillStyle(0x333355); g.fillRect(13,20,2,5);  // alt iç
    // Rotor yuvaları — 4 köşe (daire)
    g.fillStyle(0x0d0d1a); g.fillCircle(4,4,4);    // sol üst rotor yuvası
    g.fillStyle(0x0d0d1a); g.fillCircle(24,4,4);   // sağ üst
    g.fillStyle(0x0d0d1a); g.fillCircle(4,24,4);   // sol alt
    g.fillStyle(0x0d0d1a); g.fillCircle(24,24,4);  // sağ alt
    // Rotor diskleri — dönen bıçakları simüle eden halkalar
    g.lineStyle(1.5,0x0099cc,0.9); g.strokeCircle(4,4,3);
    g.lineStyle(1.5,0x0099cc,0.9); g.strokeCircle(24,4,3);
    g.lineStyle(1.5,0x0099cc,0.9); g.strokeCircle(4,24,3);
    g.lineStyle(1.5,0x0099cc,0.9); g.strokeCircle(24,24,3);
    // Rotor bıçakları — çapraz çizgiler
    g.lineStyle(1,0x00ccff,0.7); g.lineBetween(1,4,7,4); g.lineBetween(4,1,4,7);
    g.lineStyle(1,0x00ccff,0.7); g.lineBetween(21,4,27,4); g.lineBetween(24,1,24,7);
    g.lineStyle(1,0x00ccff,0.7); g.lineBetween(1,24,7,24); g.lineBetween(4,21,4,27);
    g.lineStyle(1,0x00ccff,0.7); g.lineBetween(21,24,27,24); g.lineBetween(24,21,24,27);
    // Rotor merkez noktaları
    g.fillStyle(0x00eeff); g.fillCircle(4,4,1); g.fillCircle(24,4,1);
    g.fillStyle(0x00eeff); g.fillCircle(4,24,1); g.fillCircle(24,24,1);
    // Merkez kamera / sensör
    g.fillStyle(0x0a0a1a); g.fillCircle(14,14,5);
    g.fillStyle(0x003366); g.fillCircle(14,14,4);
    g.fillStyle(0x0055aa); g.fillCircle(14,14,3);
    g.fillStyle(0x0088dd); g.fillCircle(14,14,2);
    g.fillStyle(0x00ccff,0.9); g.fillCircle(14,14,1);
    // Kamera lens parlaması
    g.fillStyle(0xffffff,0.7); g.fillRect(13,13,1,1);
    // LED ışıkları — kol uçları
    g.fillStyle(0x00ffcc); g.fillRect(1,13,2,2);   // sol LED
    g.fillStyle(0x00ffcc); g.fillRect(25,13,2,2);  // sağ LED
    g.fillStyle(0xff4444); g.fillRect(13,1,2,2);   // üst LED kırmızı
    g.fillStyle(0xff4444); g.fillRect(13,25,2,2);  // alt LED kırmızı
    // Gövde kenar çizgisi
    g.lineStyle(1,0x4466aa,0.6); g.strokeRect(9,10,10,8);
    g.generateTexture("tex_drone",28,28); g.clear();

    // ── METEOR — 24x24, piksel sanat, kare/dörtgen tabanlı ──
    // Dış karanlık kenar
    g.fillStyle(0x0a0200,1); g.fillRect(4,0,16,24); g.fillRect(0,4,24,16);
    g.fillRect(2,2,20,20);
    // Koyu kırmızı gövde
    g.fillStyle(0x5a0e00,1); g.fillRect(4,2,16,20); g.fillRect(2,4,20,16);
    // Turuncu katman
    g.fillStyle(0xaa2200,1); g.fillRect(5,4,14,16); g.fillRect(4,5,16,14);
    // Parlak turuncu
    g.fillStyle(0xdd4400,1); g.fillRect(6,6,12,12);
    // Sarı kor
    g.fillStyle(0xff7700,1); g.fillRect(7,7,10,10);
    // Merkez parlak
    g.fillStyle(0xff9900,1); g.fillRect(8,8,8,8);
    // Çekirdek
    g.fillStyle(0xffcc00,1); g.fillRect(9,9,6,6);
    // Beyaz merkez nokta
    g.fillStyle(0xffffff,1); g.fillRect(10,10,4,4);
    // Çatlak çizgiler — piksel
    g.fillStyle(0x220800,0.8); g.fillRect(11,6,2,8); g.fillRect(7,11,8,2);
    g.fillStyle(0x220800,0.5); g.fillRect(14,9,2,5); g.fillRect(6,6,2,3);
    g.generateTexture("tex_meteor",24,24); g.clear();

    // ── XP KRİSTALLERİ — küçültülmüş (9px), koyu renkler, beyaz parıltı partikül ──
    [{k:"xp_blue",   c:[0x06184d,0x0a2a88,0x1144cc,0x2266ff,0xffffff],s:9},
     {k:"xp_green",  c:[0x003311,0x115522,0x227744,0x55cc77,0xffffff],s:9},
     {k:"xp_purple", c:[0x2a0055,0x660099,0x9922cc,0xcc55ee,0xffffff],s:9},
     {k:"xp_red",    c:[0x440000,0x881100,0xcc2200,0xff5533,0xffffff],s:9},
     {k:"xp_gold",   c:[0x332200,0x885500,0xcc8800,0xffcc33,0xffffff],s:10}
    ].forEach(({k,c,s})=>{
        const h=s, m=Math.floor(h/2);
        // Dış kontur — koyu
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
        // İç ışık
        g.fillStyle(c[3],0.85);
        g.fillTriangle(m,2, m+2,Math.floor(h*0.34), m-1,Math.floor(h*0.34));
        // Beyaz üst highlight — belirgin parıltı
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

    // ── SANDIKLAR — 32x32, kaliteli, nadirlik başına özgün ──
    const drawChest=(cfg)=>{
        const {mainC,trim,lockC,glow,sz,hasRunes,hasGems,hasCracks}=cfg;
        const hw=sz/2;
        // Taban gölgesi
        g.fillStyle(0x000000,0.3); g.fillEllipse(hw,sz-2,sz*0.85,sz*0.14);
        // Alt kutu — derin 3D gövde
        g.fillStyle(mainC[0],1); g.fillRect(2,sz*0.45,sz-4,sz*0.5);
        g.fillStyle(mainC[1],1); g.fillRect(3,sz*0.45,sz-6,sz*0.45);
        g.fillStyle(mainC[2],1); g.fillRect(4,sz*0.47,sz-8,sz*0.38);
        // Alt şerit — demir bant
        g.fillStyle(trim,0.85); g.fillRect(2,sz*0.55,sz-4,sz*0.07);
        g.fillStyle(glow,0.4); g.fillRect(2,sz*0.57,sz-4,sz*0.02);
        // Zemin bandı
        g.fillStyle(trim,0.7); g.fillRect(2,sz*0.88,sz-4,sz*0.07);
        // Köşe metal süsler
        g.fillStyle(trim,0.9);
        g.fillRect(2,sz*0.45,4,sz*0.5); g.fillRect(sz-6,sz*0.45,4,sz*0.5);
        g.fillStyle(glow,0.5);
        g.fillRect(3,sz*0.46,1,sz*0.48); g.fillRect(sz-4,sz*0.46,1,sz*0.48);
        // Üst kapak — bombeli
        g.fillStyle(mainC[0],1); g.fillRect(2,sz*0.28,sz-4,sz*0.22);
        g.fillStyle(mainC[1],1); g.fillRect(3,sz*0.28,sz-6,sz*0.18);
        g.fillStyle(mainC[2],1); g.fillRect(4,sz*0.3,sz-8,sz*0.14);
        // Kapak üst yay (bombeli görünüm)
        g.fillStyle(mainC[1],0.6); g.fillRect(4,sz*0.28,sz-8,sz*0.05);
        // Kilit paneli — merkez
        g.fillStyle(mainC[0],1); g.fillRect(hw-5,sz*0.33,10,sz*0.22);
        g.fillStyle(trim,0.9); g.fillRect(hw-4,sz*0.34,8,sz*0.2);
        g.fillStyle(lockC,1); g.fillRect(hw-2,sz*0.38,4,sz*0.1);
        g.fillStyle(glow,0.9); g.fillRect(hw-1,sz*0.39,2,sz*0.06);
        // Kilit gövdesi (U şekli)
        g.fillStyle(glow,0.7); g.fillCircle(hw,sz*0.36,3);
        g.fillStyle(lockC,0.5); g.fillCircle(hw,sz*0.36,1.5);
        // Üst kenar trim
        g.fillStyle(trim,0.85); g.fillRect(2,sz*0.27,sz-4,sz*0.04);
        g.fillStyle(glow,0.4); g.fillRect(2,sz*0.28,sz-4,sz*0.01);
        // Hafif highlight — ışık
        g.fillStyle(0xffffff,0.12); g.fillRect(4,sz*0.3,sz-8,sz*0.06);
        // Rün sembolleri (nadir için)
        if(hasRunes){
            g.fillStyle(glow,0.5);
            g.fillRect(5,sz*0.65,3,sz*0.12); g.fillRect(6,sz*0.67,4,sz*0.03);
            g.fillRect(sz-8,sz*0.65,3,sz*0.12); g.fillRect(sz-9,sz*0.67,4,sz*0.03);
        }
        // Mücevher kakmaları (efsane için)
        if(hasGems){
            const gemCols=[0xff4444,0x44aaff,0xffdd44];
            [6,hw,sz-8].forEach((gx,i)=>{
                g.fillStyle(gemCols[i],0.9); g.fillCircle(gx,sz*0.5,2);
                g.fillStyle(0xffffff,0.5); g.fillCircle(gx-0.5,sz*0.5-0.5,0.8);
            });
        }
        // Çatlaklar (eskimiş sandık hissi)
        if(hasCracks){
            g.lineStyle(1,0x000000,0.3);
            g.lineBetween(8,sz*0.5,14,sz*0.7); g.lineBetween(sz-10,sz*0.55,sz-16,sz*0.75);
        }
    };

    // COMMON — altın/kahve, basit
    drawChest({mainC:[0x3a1e08,0x6b3c14,0x8c5520],trim:0x9e6a00,lockC:0xffcc00,glow:0xffee88,sz:32,hasRunes:false,hasGems:false,hasCracks:true});
    g.generateTexture("tex_chest_common",32,32); g.clear();

    // RARE — koyu mavi, rünlü
    drawChest({mainC:[0x0a1a3a,0x1e3f6e,0x2a5a9a],trim:0x2244cc,lockC:0x4488ff,glow:0x88ccff,sz:32,hasRunes:true,hasGems:false,hasCracks:false});
    // Mavi enerji hatları
    g.fillStyle(0x4488ff,0.2); g.fillRect(3,13,26,3);
    g.generateTexture("tex_chest_rare",32,32); g.clear();

    // LEGENDARY — kırmızı-altın, mücevherli, parlak
    drawChest({mainC:[0x2a0a00,0x5c2200,0x8a3a00],trim:0xcc6600,lockC:0xffcc00,glow:0xffeeaa,sz:32,hasRunes:true,hasGems:true,hasCracks:false});
    // Altın kenarlık
    g.lineStyle(2,0xffaa00,0.7); g.strokeRect(1,1,30,30);
    g.lineStyle(1,0xffeeaa,0.35); g.strokeRect(3,3,26,26);
    g.generateTexture("tex_chest_legendary",32,32); g.clear();

    // ── KALP (HEALTH PICKUP) — 16x16, yüksek kontrast, net pixel art ──
    // Dış koyu outline — okunabilirlik için
    g.fillStyle(0x330000,1); g.fillRect(0,3,16,10);
    g.fillStyle(0x330000,1); g.fillRect(2,1,12,2);
    g.fillStyle(0x330000,1); g.fillRect(1,2,14,1);
    // Siyah alt çıkıntı (kalp şekli)
    g.fillStyle(0x000000,1); g.fillRect(6,13,4,2);
    g.fillStyle(0x000000,1); g.fillRect(7,15,2,1);
    // Ana kırmızı dolgu
    g.fillStyle(0xee1133,1); g.fillRect(1,3,14,9);
    g.fillStyle(0xee1133,1); g.fillRect(3,2,10,1);
    g.fillStyle(0xee1133,1); g.fillRect(2,2,12,1);
    g.fillStyle(0xee1133,1); g.fillRect(2,3,12,1);
    // Alt sivri uç
    g.fillStyle(0xdd0022,1); g.fillRect(2,11,12,1);
    g.fillStyle(0xcc0011,1); g.fillRect(3,12,10,1);
    g.fillStyle(0xbb0000,1); g.fillRect(5,13,6,1);
    g.fillStyle(0xaa0000,1); g.fillRect(6,14,4,1);
    g.fillStyle(0x880000,1); g.fillRect(7,15,2,1);
    // İç parlak highlight — sol üst
    g.fillStyle(0xff6688,1); g.fillRect(2,3,5,3);
    g.fillStyle(0xff99aa,1); g.fillRect(2,3,3,2);
    g.fillStyle(0xffffff,0.9); g.fillRect(2,3,2,1);
    // Sağ parlak
    g.fillStyle(0xff6688,0.8); g.fillRect(9,3,5,3);
    // Orta çizgi — iki lob arası çukur
    g.fillStyle(0xcc0022,0.7); g.fillRect(7,3,2,4);
    g.generateTexture("tex_heart",16,16); g.clear();

    // ── ALTIN İKONU — sadece iç kare çerçeve (dış sarı alan kaldırıldı)
    if(!S.textures.exists("tex_gold_icon")){
        const _gc=document.createElement("canvas");
        _gc.width=20; _gc.height=20;
        const _gctx=_gc.getContext("2d");
        // Şeffaf arka plan — köşe noktaları yok
        // Dış kare dolgu — arka planla uyumlu (siyah/transparan)
        _gctx.clearRect(0,0,20,20);
        // Dış kare çerçeve — altın
        _gctx.strokeStyle="#CC8800";
        _gctx.lineWidth=2.5;
        _gctx.strokeRect(3,3,14,14);
        // İç kare çerçeve — daha parlak altın
        _gctx.strokeStyle="#FFD700";
        _gctx.lineWidth=1.5;
        _gctx.strokeRect(6,6,8,8);
        // Köşe noktaları KALDIRILDI — minik sarı köşe artifact'ları engellendi
        S.textures.addCanvas("tex_gold_icon",_gc);
    }


    // Efekt partikülleri
    g.fillStyle(0x003300);g.fillCircle(3,3,3);g.fillStyle(0x00aa44);g.fillCircle(3,3,2);g.fillStyle(0x66ff88);g.fillCircle(2,2,1);g.generateTexture("tex_poison_p",6,6);g.clear();
    g.fillStyle(0xaa2200);g.fillTriangle(4,8,8,0,0,0);g.fillStyle(0xff6600);g.fillTriangle(4,7,7,1,1,1);g.fillStyle(0xffcc00);g.fillTriangle(4,6,6,2,2,2);g.generateTexture("tex_flame_p",8,8);g.clear();
    g.fillStyle(0x4488ff);g.fillRect(0,0,8,8);g.fillStyle(0x88ccff);g.fillRect(1,1,6,6);g.fillStyle(0xffffff);g.fillRect(2,2,4,4);g.generateTexture("tex_lightning_p",8,8);g.clear();

    buildUpgradeIcons(g);
    g.destroy();
}

function buildUpgradeIcons(g){
    // HD Cartoonish ikonlar — 32x32
    // Bold outline, canlı renkler, glow hissi, mobile game kalitesi
    const sz=32;

    // Yardımcı fonksiyonlar
    const bg=(col,col2)=>{
        // Gradient hissi için iki katman arka plan
        g.fillStyle(col,1); g.fillRect(0,0,sz,sz);
        if(col2){ g.fillStyle(col2,0.35); g.fillRect(0,sz/2,sz,sz/2); }
    };
    const brd=(col,w=2,a=1)=>{ g.lineStyle(w,col,a); g.strokeRoundedRect(1,1,sz-2,sz-2,4); };
    const glow=(col,cx,cy,r,a=0.3)=>{ g.fillStyle(col,a); g.fillCircle(cx,cy,r); };

    const defs={

        // ── DAMAGE — Kılıç: Notpixel logo entegreli güç sembolü ──
        icon_damage:()=>{
            bg(0x1a0510, 0x3d0a1a);
            brd(0xff3355,2.5);
            // Glow aura
            glow(0xff2244,16,16,14,0.18);
            // Notpixel logo (üçgen outline) — büyük, kılıcı çevreleyen
            g.lineStyle(3,0xff3355,0.7);
            g.strokeTriangle(16,2, 3,28, 29,28);
            g.lineStyle(2,0xff8899,0.4);
            g.strokeTriangle(16,6, 6,27, 26,27);
            // Kılıç — üçgenin içinde
            g.fillStyle(0xd4d4cc,1); g.fillRect(15,8,2,14);
            g.fillStyle(0xffffff,1); g.fillRect(15,8,1,10);
            // Kılıç ucu
            g.fillStyle(0xeeeedd,1); g.fillTriangle(14,8,18,8,16,4);
            g.fillStyle(0xffffff,0.8); g.fillTriangle(15,8,17,8,16,5);
            // Guard — altın
            g.fillStyle(0xffcc22,1); g.fillRect(10,20,12,3);
            g.fillStyle(0xffee66,0.8); g.fillRect(10,20,12,1);
            // Kabza
            g.fillStyle(0x8b4513,1); g.fillRect(14,22,4,7);
            g.fillStyle(0xaa5522,0.8); g.fillRect(15,23,2,5);
        },

        // ── ATTACK — Hız: Enerji küresi + hız çizgileri ──
        icon_attack:()=>{
            bg(0x001830, 0x003060);
            brd(0x22aaff,2.5);
            glow(0x0088ff,16,16,13,0.2);
            // Hız çizgileri sol
            g.fillStyle(0x4499ff,0.7); g.fillRect(2,12,8,2);
            g.fillStyle(0x66bbff,0.5); g.fillRect(1,16,6,2);
            g.fillStyle(0x4499ff,0.4); g.fillRect(3,9,5,2);
            g.fillStyle(0x4499ff,0.4); g.fillRect(3,20,5,2);
            // Enerji küresi
            g.fillStyle(0x0044aa,1); g.fillCircle(20,16,10);
            g.fillStyle(0x0066dd,1); g.fillCircle(20,16,8);
            g.fillStyle(0x1199ff,1); g.fillCircle(20,16,6);
            g.fillStyle(0x44ccff,1); g.fillCircle(20,16,4);
            g.fillStyle(0xaaeeff,1); g.fillCircle(19,15,2);
            g.fillStyle(0xffffff,0.9); g.fillCircle(18,14,1);
            // Enerji halkaları
            g.lineStyle(1.5,0x44aaff,0.8); g.strokeCircle(20,16,10);
            g.lineStyle(1,0x66ccff,0.5); g.strokeCircle(20,16,13);
        },

        // ── SIZE — Büyük Mermi: Notcoin (hollow square) + mermi ──
        icon_size:()=>{
            bg(0x1a1200, 0x332200);
            brd(0xffaa00,2.5);
            glow(0xffaa00,16,16,13,0.2);
            // Notcoin logo — hollow square, mermiyi çevreliyor
            g.fillStyle(0xffcc00,1); g.fillRect(5,5,22,22);
            g.fillStyle(0x1a1200,1); g.fillRect(9,9,14,14); // iç boşluk
            g.fillStyle(0xffcc00,0.3); g.fillRect(9,9,14,14); // hafif iç dolgu
            // Mermi gövdesi — kare içinde
            g.fillStyle(0xccccaa,1); g.fillRect(13,9,6,17);
            g.fillStyle(0xeeeecc,1); g.fillRect(14,9,4,15);
            g.fillStyle(0xffffff,0.7); g.fillRect(14,9,2,11);
            // Mermi ucu
            g.fillStyle(0xff8800,1); g.fillTriangle(12,9,20,9,16,5);
            g.fillStyle(0xffcc44,0.8); g.fillTriangle(14,9,18,9,16,6);
            // Bant
            g.fillStyle(0xff6600,0.9); g.fillRect(13,20,6,2);
        },

        // ── MULTI — Split Mermi: Mor fan patlaması ──
        icon_multi:()=>{
            bg(0x120020, 0x200035);
            brd(0xcc44ff,2.5);
            glow(0xaa22ff,16,26,12,0.25);
            // Merkez ateş noktası
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
            // Sağ mermi
            g.fillStyle(0x8822cc,1); g.fillRect(22,5,3,18);
            g.fillStyle(0xaa44ee,1); g.fillRect(22,5,2,16);
            g.fillStyle(0xdd88ff,0.8); g.fillRect(23,5,1,12);
            g.fillStyle(0xcc44ff,1); g.fillTriangle(21,5,26,5,24,1);
        },

        // ── SPEED — Hız: Yeşil şimşek/neon ──
        icon_speed:()=>{
            bg(0x001508, 0x002510);
            brd(0x22ff77,2.5);
            glow(0x00ff66,14,16,12,0.22);
            // Glow zemin
            g.fillStyle(0x00ff66,0.12); g.fillTriangle(20,1,7,17,17,17);
            g.fillStyle(0x00ff66,0.12); g.fillTriangle(17,15,9,31,15,31);
            // Şimşek dış kontur (koyu)
            g.fillStyle(0x006622,1); g.fillTriangle(21,1,7,18,18,18); g.fillTriangle(18,15,8,32,16,32);
            // Şimşek ana
            g.fillStyle(0x00cc44,1); g.fillTriangle(20,2,8,17,17,17); g.fillTriangle(17,16,9,31,15,31);
            // Şimşek parlak
            g.fillStyle(0x44ff88,1); g.fillTriangle(19,3,9,16,16,16); g.fillTriangle(16,17,10,30,14,30);
            // Şimşek çekirdek
            g.fillStyle(0xaaffcc,1); g.fillRect(14,5,3,9); g.fillRect(11,19,3,9);
            g.fillStyle(0xffffff,0.9); g.fillRect(15,6,1,7); g.fillRect(12,20,1,7);
            // Enerji parçacıkları
            g.fillStyle(0x66ffaa,0.9); g.fillCircle(26,7,2); g.fillCircle(5,25,2);
            g.fillStyle(0xffffff,0.8); g.fillCircle(27,7,1); g.fillCircle(6,25,1);
        },

        // ── PIERCE — Delici: Mavi enerji iğnesi, 4 delik ──
        icon_pierce:()=>{
            bg(0x000820, 0x001040);
            brd(0x8888ff,2.5);
            glow(0x4444ff,16,16,13,0.2);
            // Delinmiş parçalar — 4 koyu blok
            for(let i=0;i<4;i++){
                g.fillStyle(0x2233aa,1); g.fillRect(4+i*6,10,5,12);
                g.fillStyle(0x3344bb,1); g.fillRect(5+i*6,11,3,10);
                // Delik
                g.fillStyle(0x000820,1); g.fillRect(6+i*6,13,2,6);
            }
            // Enerji iğnesi — parlak, uçan
            g.fillStyle(0x001166,1); g.fillRect(2,14,28,4);
            g.fillStyle(0x2255cc,1); g.fillRect(2,14,28,3);
            g.fillStyle(0x5588ff,1); g.fillRect(2,14,28,2);
            g.fillStyle(0x99bbff,1); g.fillRect(2,15,28,1);
            // Sivri uç — parlak
            g.fillStyle(0xffffff,1); g.fillTriangle(28,13,28,19,32,16);
            g.fillStyle(0xbbccff,0.9); g.fillTriangle(29,14,29,18,31,16);
            // Enerji izi
            g.fillStyle(0x4466ff,0.6); g.fillRect(0,13,4,6);
            g.fillStyle(0x2244cc,0.4); g.fillRect(0,12,3,8);
        },

        // ── CRIT — Kritik: Nişangah + enerji kristali ──
        icon_crit:()=>{
            bg(0x180010, 0x300020);
            brd(0xff3388,2.5);
            glow(0xff2266,16,16,13,0.22);
            // Dış nişangah halkaları
            g.lineStyle(2,0x880044,1); g.strokeCircle(16,16,14);
            g.lineStyle(2,0xff2266,0.9); g.strokeCircle(16,16,11);
            g.lineStyle(1.5,0xff66aa,0.6); g.strokeCircle(16,16,8);
            // Çapraz çizgiler
            g.fillStyle(0xff2266,0.9); g.fillRect(1,15,5,2); g.fillRect(26,15,5,2);
            g.fillStyle(0xff2266,0.9); g.fillRect(15,1,2,5); g.fillRect(15,26,2,5);
            // Merkez kristal
            g.fillStyle(0x880022,1); g.fillCircle(16,16,6);
            g.fillStyle(0xcc1144,1); g.fillCircle(16,16,5);
            g.fillStyle(0xff2255,1); g.fillCircle(16,16,4);
            g.fillStyle(0xff6688,1); g.fillCircle(16,16,2);
            g.fillStyle(0xffaabb,1); g.fillCircle(15,15,1);
            g.fillStyle(0xffffff,0.9); g.fillCircle(15,15,1);
            // Köşe kıvılcımlar
            g.fillStyle(0xffcc44,0.9); g.fillCircle(23,9,2); g.fillCircle(9,23,2);
            g.fillStyle(0xffffff,0.8); g.fillCircle(23,9,1); g.fillCircle(9,23,1);
        },

        // ── KB — Knockback: Turuncu dalga patlaması ──
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
            // Şok dalgaları
            g.lineStyle(3,0xdd4400,0.8); g.strokeCircle(8,16,9);
            g.lineStyle(2.5,0xff6600,0.6); g.strokeCircle(8,16,12);
            g.lineStyle(2,0xff8822,0.4); g.strokeCircle(8,16,15);
            g.lineStyle(1.5,0xffaa44,0.25); g.strokeCircle(8,16,18);
            // Fırlayan nesne
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
            // Dış buz halkası
            g.lineStyle(2,0x1166aa,0.9); g.strokeCircle(16,16,14);
            g.lineStyle(1.5,0x44aadd,0.6); g.strokeCircle(16,16,11);
            // Kar tanesi ana eksenleri
            g.fillStyle(0x1188cc,1); g.fillRect(14,2,4,28); g.fillRect(2,14,28,4);
            // Kar tanesi çapraz eksenleri
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

        // ── XP — Akademisyen: Notpixel logo + enerji kitabı ──
        icon_xp:()=>{
            bg(0x001a15, 0x002d22);
            brd(0x44ffcc,2.5);
            glow(0x00ddaa,16,16,13,0.2);
            // Notpixel logo — üçgen outline, enerji kaynağı gibi
            g.lineStyle(2.5,0x00ddaa,0.9);
            g.strokeTriangle(16,3, 4,26, 28,26);
            g.lineStyle(1.5,0x66ffdd,0.5);
            g.strokeTriangle(16,7, 7,25, 25,25);
            // Ortadaki dikey çizgi (Notpixel'in iç çizgisi)
            g.fillStyle(0x44ffcc,0.8); g.fillRect(15,10,2,15);
            g.fillStyle(0x88ffee,1); g.fillRect(15,11,1,12);
            // XP parçacıkları üçgen köşelerinde
            g.fillStyle(0x00ffcc,1); g.fillCircle(16,4,2); g.fillCircle(5,27,2); g.fillCircle(27,27,2);
            g.fillStyle(0xffffff,0.8); g.fillCircle(16,4,1); g.fillCircle(5,27,1); g.fillCircle(27,27,1);
            // Merkez enerji
            g.fillStyle(0x004433,1); g.fillCircle(16,17,5);
            g.fillStyle(0x00cc88,1); g.fillCircle(16,17,3);
            g.fillStyle(0x44ffcc,1); g.fillCircle(16,17,2);
            g.fillStyle(0xffffff,0.9); g.fillCircle(15,16,1);
        },

        // ── HP — Max Can: Enerji kalkan + kırmızı çekirdek ──
        icon_hp:()=>{
            bg(0x1a0008, 0x2d0010);
            brd(0xff2244,2.5);
            glow(0xff1133,16,16,13,0.2);
            // Kalkan dış hat
            g.fillStyle(0x660011,1);
            g.fillTriangle(16,2,3,10,3,22); g.fillTriangle(16,2,29,10,29,22);
            g.fillRect(3,10,26,12); g.fillTriangle(3,22,29,22,16,30);
            // Kalkan iç
            g.fillStyle(0x990022,1);
            g.fillTriangle(16,4,5,11,5,21); g.fillTriangle(16,4,27,11,27,21);
            g.fillRect(5,11,22,10); g.fillTriangle(5,21,27,21,16,28);
            // Kalkan parlaklık
            g.fillStyle(0xdd1133,1);
            g.fillTriangle(16,6,7,12,7,20); g.fillTriangle(16,6,25,12,25,20);
            g.fillRect(7,12,18,8); g.fillTriangle(7,20,25,20,16,26);
            // Merkez + sembolü
            g.fillStyle(0xffffff,1); g.fillRect(15,13,2,7); g.fillRect(12,16,8,2);
            g.fillStyle(0xffaaaa,0.6); g.fillCircle(16,16,7);
        },

        // ── REGEN — Yenilenme: Döngüsel yaşam enerji halkası ──
        icon_regen:()=>{
            bg(0x041a0a, 0x082d14);
            brd(0x33ff77,2.5);
            glow(0x00ff55,16,16,13,0.2);
            // Yaşam halkası dış
            g.lineStyle(3,0x117733,0.9); g.strokeCircle(16,16,13);
            g.lineStyle(2.5,0x22aa55,1); g.strokeCircle(16,16,11);
            // Döngü oku — ok başları
            g.fillStyle(0x00dd55,1); g.fillTriangle(16,3,13,9,19,9);   // üst ok
            g.fillStyle(0x00dd55,1); g.fillTriangle(16,29,19,23,13,23); // alt ok
            // Döngü yaylar (yaklaşık)
            g.lineStyle(3,0x33ff77,0.9);
            g.strokeCircle(16,16,11);
            // Merkez yaşam çekirdeği
            g.fillStyle(0x115522,1); g.fillCircle(16,16,6);
            g.fillStyle(0x22aa44,1); g.fillCircle(16,16,5);
            g.fillStyle(0x44ff88,1); g.fillCircle(16,16,3);
            g.fillStyle(0x88ffaa,1); g.fillCircle(16,16,2);
            g.fillStyle(0xffffff,0.9); g.fillCircle(15,15,1);
        },

        // ── HEAL — Sağlık Kiti: Parlayan enerji kristali + artı ──
        icon_heal:()=>{
            bg(0x001a20, 0x002d33);
            brd(0x00ffcc,2.5);
            glow(0x00ddaa,16,16,13,0.22);
            // Kristal dış
            g.fillStyle(0x003333,1); g.fillTriangle(16,2,5,28,27,28); g.fillRect(5,15,22,13);
            g.lineStyle(2,0x00aacc,0.8); g.strokeTriangle(16,2,5,28,27,28);
            // Kristal iç katmanlar
            g.fillStyle(0x004444,1); g.fillTriangle(16,5,7,27,25,27);
            g.fillStyle(0x006655,1); g.fillTriangle(16,8,9,26,23,26);
            g.fillStyle(0x009977,1); g.fillTriangle(16,11,11,25,21,25);
            g.fillStyle(0x00cc99,1); g.fillTriangle(16,14,13,24,19,24);
            // Parlak artı sembolü
            g.fillStyle(0xffffff,1); g.fillRect(15,15,2,8); g.fillRect(11,18,10,2);
            g.fillStyle(0xaaffee,0.8); g.fillCircle(16,19,4);
            // Üst highlight
            g.fillStyle(0x88ffee,0.8); g.fillTriangle(16,5,13,12,19,12);
            g.fillStyle(0xffffff,0.5); g.fillTriangle(16,6,14,11,18,11);
        },

        // ── EXPLOSIVE — Bomba: Enerji bombası, Notcoin entegre ──
        icon_explosive:()=>{
            bg(0x1a0e00, 0x331a00);
            brd(0xff7700,2.5);
            glow(0xff6600,15,18,12,0.25);
            // Bomba gövdesi — koyu metalik
            g.fillStyle(0x1a1a1a,1); g.fillCircle(15,19,12);
            g.fillStyle(0x2d2d2d,1); g.fillCircle(15,19,10);
            g.fillStyle(0x3d3d3d,1); g.fillCircle(15,19,8);
            // Notcoin hollow square — gövde üzerinde
            g.fillStyle(0xff9900,1); g.fillRect(10,14,10,10);
            g.fillStyle(0x2d2d2d,1); g.fillRect(13,17,4,4);
            g.fillStyle(0xff9900,0.3); g.fillRect(13,17,4,4);
            // Fitil
            g.fillStyle(0x885500,1); g.fillRect(16,7,2,4);
            g.fillStyle(0xaa7700,1); g.fillRect(18,5,2,3); g.fillRect(20,3,2,3);
            // Kıvılcım
            g.fillStyle(0xffee00,1); g.fillCircle(22,2,3);
            g.fillStyle(0xffffff,0.9); g.fillCircle(21,1,1);
            // Patlama çizgileri
            g.fillStyle(0xff6600,0.8); for(let i=0;i<8;i++){const a=Phaser.Math.DegToRad(i*45);g.fillRect(15+Math.cos(a)*13,19+Math.sin(a)*13,2,2);}
        },

        // ── LIGHTNING — Zincir Şimşek: Canlı enerji varlığı ──
        icon_lightning:()=>{
            bg(0x0a0a00, 0x151500);
            brd(0xffee00,2.5);
            glow(0xffdd00,16,16,13,0.25);
            // Dış enerji halkası
            g.lineStyle(2,0xaa8800,0.7); g.strokeCircle(16,16,14);
            g.lineStyle(1.5,0xffcc00,0.5); g.strokeCircle(16,16,11);
            // Ana şimşek — kalın kontur
            g.fillStyle(0x885500,1); g.fillTriangle(21,1,11,18,19,18); g.fillTriangle(19,16,9,32,17,32);
            // Ana şimşek — orta
            g.fillStyle(0xdd9900,1); g.fillTriangle(20,2,12,17,18,17); g.fillTriangle(18,15,10,31,16,31);
            // Ana şimşek — parlak
            g.fillStyle(0xffdd00,1); g.fillTriangle(19,3,13,16,17,16); g.fillTriangle(17,16,11,30,15,30);
            // Çekirdek beyaz
            g.fillStyle(0xffffaa,1); g.fillRect(17,5,2,9); g.fillRect(13,19,2,9);
            g.fillStyle(0xffffff,0.9); g.fillRect(17,6,1,7); g.fillRect(14,20,1,7);
            // Zincir dalı
            g.fillStyle(0xffcc00,0.8); g.fillTriangle(25,8,19,15,23,16);
            g.fillStyle(0xffee44,0.9); g.fillTriangle(24,9,20,14,22,15);
            g.fillStyle(0xffffff,0.7); g.fillRect(23,9,1,5);
            // Elektrik parçacıkları
            g.fillStyle(0xffffff,0.9); g.fillCircle(6,6,1); g.fillCircle(27,5,1); g.fillCircle(4,28,1);
        },

        // ── DRONE — Muharip Robot: Şirin ama tehlikeli karakter ──
        icon_drone:()=>{
            bg(0x000d22, 0x001a3d);
            brd(0x00aaff,2.5);
            glow(0x0088ff,16,16,13,0.2);
            // Gövde
            g.fillStyle(0x001133,1); g.fillRect(9,12,14,9);
            g.fillStyle(0x002255,1); g.fillRect(10,13,12,7);
            g.fillStyle(0x004488,1); g.fillRect(11,14,10,5);
            // Gövde ön paneli
            g.fillStyle(0x0066aa,1); g.fillRect(12,15,8,3);
            g.fillStyle(0x0099dd,0.8); g.fillRect(13,15,6,1);
            // "Göz" kamera
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

        // ── SAW — Detaylı metalik testere ──
        icon_saw:()=>{
            bg(0x080808, 0x141414);
            brd(0xbbbbbb,2.5);
            // Dış gölge
            g.fillStyle(0x111111,1); g.fillCircle(16,16,15);
            // Dış metal halka — 3 katman
            g.fillStyle(0x3a3a3a,1); g.fillCircle(16,16,14);
            g.fillStyle(0x5a5a5a,1); g.fillCircle(16,16,13);
            g.fillStyle(0x747474,1); g.fillCircle(16,16,12);
            // 12 keskin diş
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
                // Diş highlight
                g.fillStyle(0xffffff,0.45);
                g.fillTriangle(
                    16+Math.cos(a)*15,  16+Math.sin(a)*15,
                    16+Math.cos(a)*13,  16+Math.sin(a)*13,
                    16+Math.cos(a2)*13, 16+Math.sin(a2)*13
                );
            }
            // Gövde halka arası çizgi
            g.lineStyle(1,0x999999,0.6); g.strokeCircle(16,16,12);
            // Orta hub
            g.fillStyle(0x1e1e1e,1); g.fillCircle(16,16,8);
            g.fillStyle(0x2e2e2e,1); g.fillCircle(16,16,7);
            g.fillStyle(0x444444,1); g.fillCircle(16,16,6);
            // Hub iç detay — artı şekli
            g.fillStyle(0x666666,1); g.fillRect(13,15,6,2); g.fillRect(15,13,2,6);
            // Hub halka
            g.lineStyle(1,0x888888,0.7); g.strokeCircle(16,16,5);
            // Merkez cıvata
            g.fillStyle(0x999999,1); g.fillCircle(16,16,3);
            g.fillStyle(0xbbbbbb,1); g.fillCircle(16,16,2);
            g.fillStyle(0xdddddd,1); g.fillCircle(16,16,1);
            // Parlak highlight
            g.fillStyle(0xffffff,0.55); g.fillCircle(10,10,2);
            g.fillStyle(0xffffff,0.25); g.fillCircle(9,9,3);
        },

        // ── POISON — Zehir: Canlı organizma/bakteri ──
        icon_poison:()=>{
            bg(0x010e01, 0x021a02);
            brd(0x33ff33,2.5);
            glow(0x00ff00,16,16,13,0.2);
            // Ana organizma gövdesi
            g.fillStyle(0x083308,1); g.fillCircle(16,16,12);
            g.fillStyle(0x0d550d,1); g.fillCircle(16,16,10);
            g.fillStyle(0x11771a,1); g.fillCircle(16,16,8);
            g.fillStyle(0x22aa22,1); g.fillCircle(16,16,6);
            g.fillStyle(0x44dd44,1); g.fillCircle(16,16,4);
            g.fillStyle(0x88ff88,1); g.fillCircle(16,16,2);
            g.fillStyle(0xffffff,0.7); g.fillCircle(15,15,1);
            // Bakteri uzantıları — canlı gibi
            for(let i=0;i<8;i++){
                const a=Phaser.Math.DegToRad(i*45);
                const ex=16+Math.cos(a)*12, ey=16+Math.sin(a)*12;
                g.fillStyle(0x22aa22,0.9); g.fillCircle(ex,ey,2);
                g.fillStyle(0x44dd44,0.7); g.fillCircle(ex,ey,1);
            }
            // Zehir damlacıkları
            g.fillStyle(0x66ff66,0.9); g.fillCircle(4,4,3); g.fillCircle(27,6,2); g.fillCircle(5,27,2);
            g.fillStyle(0xaaffaa,0.8); g.fillCircle(4,4,1); g.fillCircle(27,6,1);
        },

        // ── LASER — Lazer: Antik enerji kristali ──
        icon_laser:()=>{
            bg(0x1a0000, 0x2d0000);
            brd(0xff2200,2.5);
            glow(0xff1100,16,16,13,0.25);
            // Kristal yapı — 8 köşeli
            g.fillStyle(0x550000,1);
            g.fillTriangle(16,2,22,8,22,24); g.fillTriangle(16,2,10,8,10,24);
            g.fillRect(10,8,12,16); g.fillTriangle(10,24,22,24,16,30);
            // İç parlak katmanlar
            g.fillStyle(0x880000,1);
            g.fillTriangle(16,4,21,9,21,23); g.fillTriangle(16,4,11,9,11,23);
            g.fillRect(11,9,10,14); g.fillTriangle(11,23,21,23,16,28);
            g.fillStyle(0xcc1100,1);
            g.fillTriangle(16,7,20,11,20,21); g.fillTriangle(16,7,12,11,12,21);
            g.fillRect(12,11,8,10); g.fillTriangle(12,21,20,21,16,26);
            // Enerji çekirdeği
            g.fillStyle(0xff2200,1); g.fillCircle(16,15,5);
            g.fillStyle(0xff6600,1); g.fillCircle(16,15,3);
            g.fillStyle(0xffcc00,1); g.fillCircle(16,15,2);
            g.fillStyle(0xffffff,1); g.fillCircle(16,15,1);
            // Yan beam çıkışları
            g.fillStyle(0xff2200,0.8); g.fillRect(2,14,8,4);
            g.fillStyle(0xff6600,0.5); g.fillRect(1,13,6,6);
            g.fillStyle(0xff2200,0.8); g.fillRect(22,14,8,4);
            g.fillStyle(0xff6600,0.5); g.fillRect(25,13,6,6);
        },

        // ── THUNDER — Gök Gürültüsü: Bulut + şimşek ──
        icon_thunder:()=>{
            bg(0x050510, 0x0a0a1a);
            brd(0xffdd44,2.5);
            glow(0xffcc00,16,12,11,0.2);
            // Bulut — 3 katman
            g.fillStyle(0x334455,1); g.fillCircle(9,11,7); g.fillCircle(16,8,8); g.fillCircle(23,11,6); g.fillRect(3,11,26,4);
            g.fillStyle(0x445566,1); g.fillCircle(10,10,6); g.fillCircle(16,7,7); g.fillCircle(22,10,5); g.fillRect(4,10,24,4);
            g.fillStyle(0x5f7a8a,1); g.fillCircle(11,10,5); g.fillCircle(16,7,6); g.fillCircle(21,10,4); g.fillRect(6,10,20,3);
            // Bulut alt düzlemi
            g.fillStyle(0x445566,1); g.fillRect(3,13,26,2);
            // Şimşek — keskin, modern
            g.fillStyle(0x664400,1); g.fillTriangle(20,14,13,25,18,25); g.fillTriangle(18,23,11,32,16,32);
            g.fillStyle(0xcc8800,1); g.fillTriangle(19,14,14,24,17,24); g.fillTriangle(17,22,12,31,15,31);
            g.fillStyle(0xffdd00,1); g.fillTriangle(18,15,15,23,16,23); g.fillTriangle(16,22,13,30,14,30);
            g.fillStyle(0xffff88,1); g.fillRect(16,16,2,7); g.fillRect(13,24,2,6);
            // Glow
            g.fillStyle(0xffff44,0.25); g.fillCircle(16,24,7);

            // Rapid/spread/chain/precision silah ikonları
        },

        // ── RAPID BLASTER — Hızlı Atış ──
        icon_rapid:()=>{
            bg(0x1a1500, 0x332800);
            brd(0xffee22,2.5);
            glow(0xffcc00,16,16,12,0.2);
            // Silah gövdesi — geniş, basık
            g.fillStyle(0x332200,1); g.fillRect(3,14,20,8);
            g.fillStyle(0x4d3300,1); g.fillRect(4,15,18,6);
            g.fillStyle(0x664400,1); g.fillRect(5,16,16,4);
            // Namlu — ince, uzun
            g.fillStyle(0x221a00,1); g.fillRect(20,15,10,4);
            g.fillStyle(0x443300,1); g.fillRect(21,15,8,3);
            // Mermi akışı — 4 küçük enerji topu
            g.fillStyle(0xffee00,1); for(let i=0;i<4;i++){g.fillCircle(4+i*4,12,1.5);}
            g.fillStyle(0xffffff,0.8); for(let i=0;i<4;i++){g.fillCircle(4+i*4,11,1);}
            // Tetik
            g.fillStyle(0x221a00,1); g.fillRect(8,22,4,4);
            // Enerji lambası
            g.fillStyle(0xffcc00,1); g.fillCircle(13,17,2);
            g.fillStyle(0xffffff,0.8); g.fillCircle(13,17,1);
        },

        // ── HEAVY CANNON — Ağır Top ──
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
            // Ateş gözü — namlu ucu
            g.fillStyle(0x220800,1); g.fillCircle(29,18,4);
            g.fillStyle(0x552200,1); g.fillCircle(29,18,3);
            g.fillStyle(0xff4400,1); g.fillCircle(29,18,2);
            g.fillStyle(0xff8800,1); g.fillCircle(29,18,1);
            // Patlama enerji
            g.fillStyle(0xff4400,0.6); g.fillCircle(29,18,6);
            g.fillStyle(0xff8800,0.3); g.fillCircle(29,18,8);
            // Top altlığı
            g.fillStyle(0x1a0a00,1); g.fillRect(4,23,10,5);
            g.fillStyle(0x2d1500,1); g.fillRect(5,24,8,3);
            g.fillStyle(0x441f00,1); g.fillCircle(9,24,4);
        },

        // ── SPREAD SHOT — Saçma Atış ──
        icon_spread:()=>{
            bg(0x15001a, 0x280033);
            brd(0xcc44ff,2.5);
            glow(0xaa22ff,16,20,11,0.2);
            // Alt merkez ateş noktası
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
            // Mermi 3 — sağ
            g.fillStyle(0x7711bb,1); g.fillRect(23,6,3,16);
            g.fillStyle(0x9933dd,1); g.fillRect(23,6,2,14);
            g.fillStyle(0xcc66ff,0.8); g.fillRect(24,6,1,11);
            g.fillStyle(0xbb33ff,1); g.fillTriangle(22,6,27,6,25,2);
        },

        // ── CHAIN SHOT — Zincir Atış ──
        icon_chain:()=>{
            bg(0x001520, 0x002233);
            brd(0x22aaff,2.5);
            glow(0x0088ff,16,16,12,0.2);
            // Düşman 1 (sol)
            g.fillStyle(0x00334d,1); g.fillCircle(6,16,5);
            g.fillStyle(0x0055aa,1); g.fillCircle(6,16,3);
            g.fillStyle(0x0088ff,1); g.fillCircle(6,16,2);
            // Zincir bağlantısı 1
            g.fillStyle(0x0066cc,0.9); g.fillRect(11,14,5,4);
            g.fillStyle(0x0088ff,0.7); g.fillRect(12,15,3,2);
            // Düşman 2 (orta)
            g.fillStyle(0x00334d,1); g.fillCircle(16,10,5);
            g.fillStyle(0x0055aa,1); g.fillCircle(16,10,3);
            g.fillStyle(0x0088ff,1); g.fillCircle(16,10,2);
            // Zincir bağlantısı 2
            g.fillStyle(0x0066cc,0.9); g.fillRect(16,15,5,4);
            g.fillStyle(0x0088ff,0.7); g.fillRect(17,16,3,2);
            // Düşman 3 (sağ)
            g.fillStyle(0x00334d,1); g.fillCircle(26,22,5);
            g.fillStyle(0x0055aa,1); g.fillCircle(26,22,3);
            g.fillStyle(0x0088ff,1); g.fillCircle(26,22,2);
            // Mermi
            g.fillStyle(0xffee00,1); g.fillCircle(3,16,3);
            g.fillStyle(0xffffff,0.9); g.fillCircle(3,16,1);
            // Zincir çizgileri
            g.lineStyle(1.5,0x0066cc,0.7); g.strokeCircle(6,16,5); g.strokeCircle(16,10,5); g.strokeCircle(26,22,5);
        },

        // ── PRECISION RIFLE — Keskin Nişancı ──
        icon_precision:()=>{
            bg(0x1a0008, 0x2d0010);
            brd(0xff2244,2.5);
            glow(0xff0022,16,16,12,0.2);
            // Tüfek gövdesi
            g.fillStyle(0x220000,1); g.fillRect(2,14,26,7);
            g.fillStyle(0x440000,1); g.fillRect(3,15,24,5);
            g.fillStyle(0x661111,1); g.fillRect(4,16,22,3);
            // Namlu — ince, uzun
            g.fillStyle(0x110000,1); g.fillRect(24,15,7,4);
            g.fillStyle(0x330000,1); g.fillRect(25,16,5,2);
            // Optik dürbün
            g.fillStyle(0x110000,1); g.fillRect(10,10,12,5);
            g.fillStyle(0x220011,1); g.fillRect(11,11,10,3);
            // Nişangah ışığı
            g.fillStyle(0xff0000,1); g.fillCircle(12,12,2);
            g.fillStyle(0xff6666,0.8); g.fillCircle(12,12,3);
            // Lazer hedef noktası — uzakta
            g.fillStyle(0xff0000,0.9); g.fillCircle(30,12,2);
            g.fillStyle(0xff4444,0.6); g.fillCircle(30,12,3);
            // Lazer çizgisi
            g.fillStyle(0xff0000,0.5); g.fillRect(14,12,16,1);
            g.fillStyle(0xff0000,0.25); g.fillRect(12,11,18,3);
            // Çapraz nişangah çizgileri
            g.fillStyle(0xff2244,0.7); g.fillRect(28,9,3,1); g.fillRect(28,14,3,1); g.fillRect(28,11,1,3);
        },

        // ── REFLECT RIFLE — Yansıma Tüfeği ──
        icon_reflect:()=>{
            bg(0x001a18, 0x002d28);
            brd(0x22ffdd,2.5);
            glow(0x00ddcc,16,16,12,0.2);
            // Tüfek gövdesi
            g.fillStyle(0x001a18,1); g.fillRect(2,14,22,7);
            g.fillStyle(0x002d28,1); g.fillRect(3,15,20,5);
            g.fillStyle(0x004d44,1); g.fillRect(4,16,18,3);
            // Yansıma kristali
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
      : 1.35 * Math.pow(1.07, min - 10); // [BALANCE] min25: ~3.7x (was 5.1x) — oynanabilir pencere genişletildi

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
    p._collideCooldown=false; // [BUG FIX] Çarpışma cooldown'u sıfırla
    p._hueTimer=0; p._hueIdx=0; p._pulseT=0; // pyramid3/4 efekt timer'ları
    p._magT=0; p._vortT=0; // magnet/vortex throttle timer'ları
    p._lastCritVfx=0; // krit VFX throttle
    p._fallEffT=0; p._debrisT=0; p._fireT=0; // düşme efekti timer'ları
    // [BUG FIX] Squash scale birikimini sıfırla — pool'dan gelen nesne eski base scale taşımasın
    p._baseScaleX=undefined; p._basescaleY=undefined;
    if(p._shadowGfx){try{p._shadowGfx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)} p._shadowGfx=null;}
    // Texture ve frame sıfırla — pool'dan gelen obje eski break frame'de kalabilir
    try{p.setTexture("pyramid",0).clearTint().setAlpha(1);}catch(e){try{p.clearTint().setAlpha(1);}catch(ex){}}
    // Hitbox: texture boyutuna göre dinamik ayarlanır, spawnEnemy'de override edilir
    if(p.body){
        p.body.enable=true;
        p.body.moves=true;
        p.body.velocity.x=0;
        p.body.velocity.y=0;
        // disableBody(true,true) checkCollision.none=true yapar — bunu sıfırla
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
        _capMin < 3  ? Math.round(Phaser.Math.Linear(12, 16, (_capMin-1)/2))  :
        _capMin < 6  ? Math.round(Phaser.Math.Linear(16, 20, (_capMin-3)/3))  :
        _capMin < 10 ? Math.round(Phaser.Math.Linear(20, 24, (_capMin-6)/4))  :
        _capMin < 15 ? Math.round(Phaser.Math.Linear(24, 28, (_capMin-10)/5)) :
        Math.min(MAX_ENEMIES, Math.round(28 + (_capMin-15)*0.8));
    if(!S.pyramids || S.pyramids.countActive(true) >= _dynamicCap) return; // single authoritative check
    const gs=GS;

    let x,at=0;
    // [OPT] getChildren().some() yerine _activeEnemies cache kullan — O(n) pahalı kontrol
    const _spawnCache=S._activeEnemies||[];
    do{ x=Phaser.Math.Between(SPAWN_SAFE_X,360-SPAWN_SAFE_X); at++; }
    while(at<8&&_spawnCache.some(p=>p&&p.active&&Math.abs(p.x-x)<40&&p.y<80));

    const type=pickType(gs.level);
    // [BOYUT FIX] Tüm eski tex_* texture'ları "pyramid" ile eşleştirildi.
    // Küçük 24x24 generated texture'lar yerine artık gerçek pyramid asset'leri kullanılıyor.
    // pyramid1/2/3/4 → kendi özel pyramid_1/2/3/4 asset'leri
    // Diğer tüm tipler → "pyramid" (orijinal asset, tint ile renklendiriliyor)
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
    // Texture set + tint uygula — her tip kendine özgü renk
    try{
        // Texture var mı kontrol et — yoksa fallback kullan
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
        // Orijinal tint'i kaydet — hit flash sonrası doğru renge dön
        p._originalTint = tint;
        p.setVisible(true);
        p.setAlpha(1);
    }catch(e){ try{p.setTexture("pyramid");}catch(ex){} }
    // Shadow realm: yeni düşmanlar da görünmez
    const spd=gs.pyramidSpeed;
    p.type=type;

    switch(type){
       case"normal":    p.hp=hpFor(8,gs.level,0.6);   p.setDisplaySize(78,64).setVelocityY(spd); break;
        case"zigzag":    p.hp=hpFor(7,gs.level,0.5);   p.zigzag=true;p.clearTint();p.setDisplaySize(59,48).setVelocityX(Phaser.Math.Between(-80,80)||55).setVelocityY(spd*0.85);
            // zigzag texture native: 134x113 → display 59x48
            // Hitbox native hesabı: display 40x29 → /scaleX,/scaleY
            p.body.setSize(91, 68).setOffset(22, 23);
            break;
        case"fast":      p.hp=hpFor(5,gs.level,0.45);  p.setDisplaySize(78,64).setTint(0xFF6644).setVelocityY(spd*1.7); break;
        case"tank":      p.hp=hpFor(28,gs.level,1.8);  p.armor=1;p.setDisplaySize(98,80).setVelocityY(spd*0.55); break;
        case"shield":    p.hp=hpFor(8,gs.level,0.45);  p.shield=true;p.armor=1;p.setDisplaySize(78,64).setVelocityY(spd*0.72); break;
        case"split":     p.hp=hpFor(7,gs.level,0.4);   p.split=true;p.setDisplaySize(78,64).setVelocityY(spd*1.0); break;
        case"swarm":     p.hp=1;p.swarm=true;p.setDisplaySize(59,48).setVelocityY(spd*1.0); break;
        case"kamikaze":  p.hp=hpFor(4,gs.level,0.25);  p.kamikaze=true;p.setDisplaySize(78,64).setVelocityY(spd*0.65); break;
        case"ghost":     p.hp=hpFor(10,gs.level,0.5);  p.ghost=true;p.setDisplaySize(59,48).setAlpha(0.42).setVelocityY(spd*1.0); break;
        case"spinner":   p.hp=hpFor(7,gs.level,0.4);   p.spinner=true;p.spinRate=0;p.setDisplaySize(78,64).setTint(0xFF77CC).setVelocityY(spd*0.78); break;
        case"armored":   p.hp=hpFor(14,gs.level,0.7);  p.armor=2;p.armored=true;p.setDisplaySize(78,64).setTint(0xFFAAEE).setVelocityY(spd*0.6); break;
        case"elder":     p.hp=hpFor(30,gs.level,0.9);  p.armor=1;p.elder=true;p.setDisplaySize(117,96).setVelocityY(spd*0.45); break;
        case"bomber":    p.hp=hpFor(5,gs.level,0.3);   p.bomber=true;p.setDisplaySize(78,64).setVelocityY(spd*0.9); break;
        case"stealth":   p.hp=hpFor(7,gs.level,0.4);   p.stealth=true;p.stealthTimer=0;p.setDisplaySize(78,64).setAlpha(0.9).setVelocityY(spd*0.95); break;
        case"healer":    p.hp=hpFor(9,gs.level,0.5);   p.healer=true;p.healTimer=0;p.setDisplaySize(78,64).setVelocityY(spd*0.6); break;
        case"magnet":    p.hp=hpFor(7,gs.level,0.4);   p.magnetEnemy=true;p.setDisplaySize(78,64).setVelocityY(spd*0.8); break;
        case"mirror":    p.hp=hpFor(7,gs.level,0.4);   p.mirror=true;p.mirrorSpawned=false;p.setDisplaySize(78,64).setVelocityY(spd*0.85); break;
        case"berserker": p.hp=hpFor(9,gs.level,0.55);  p.berserker=true;p.setDisplaySize(78,64).setVelocityY(spd*0.7); break;
        case"absorber":  p.hp=hpFor(12,gs.level,0.65); p.absorber=true;p.armor=2;p.absorbTimer=0;p.setDisplaySize(78,64).setVelocityY(spd*0.65); break;
        case"chain":     p.hp=hpFor(6,gs.level,0.35);  p.chain=true;p.setDisplaySize(78,64).setVelocityY(spd*1.1); break;
        case"freezer":   p.hp=hpFor(9,gs.level,0.5);   p.freezerEnemy=true;p.freezeTimer=0;p.setDisplaySize(78,64).setVelocityY(spd*0.7); break;
        case"leech":     p.hp=hpFor(7,gs.level,0.4);   p.leech=true;p.setDisplaySize(78,64).setVelocityY(spd*0.9); break;
        case"titan":     p.hp=hpFor(45,gs.level,1.4);  p.armor=2;p.titan=true;p.setDisplaySize(137,112).setVelocityY(spd*0.35); break;
        case"shadow":    p.hp=hpFor(9,gs.level,0.5);   p.shadow=true;p.shadowSpawned=false;p.setDisplaySize(78,64).setVelocityY(spd*1.0); break;
        case"spiker":    p.hp=hpFor(7,gs.level,0.4);   p.spiker=true;p.spikeTimer=0;p.setDisplaySize(78,64).setVelocityY(spd*0.85); break;
        case"vortex":    p.hp=hpFor(10,gs.level,0.6);  p.vortex=true;p.setDisplaySize(78,64).setVelocityY(spd*0.6); break;
        case"phantom":   p.hp=hpFor(14,gs.level,0.75); p.phantom=true;p.phaseTimer=0;p.setDisplaySize(78,64).setAlpha(0.35).setVelocityY(spd*0.8); break;
        case"rusher":    p.hp=hpFor(6,gs.level,0.35);  p.rusher=true;p.rushTimer=0;p.rushing=false;p.setDisplaySize(59,48).setVelocityY(spd*0.5); break;
        case"splitter":  p.hp=hpFor(10,gs.level,0.55); p.splitter=true;p.setDisplaySize(78,64).setVelocityY(spd*0.9); break;
        case"toxic":     p.hp=hpFor(7,gs.level,0.4);   p.toxic=true;p.toxTimer=0;p.setDisplaySize(78,64).setVelocityY(spd*0.85); break;
        case"colossus":  p.hp=hpFor(30,gs.level,0.9);  p.armor=1;p.colossus=true;p.setDisplaySize(196,160).setVelocityY(spd*0.25); break;
// ── YENİ PİRAMİT TİPLERİ — pyramid_1/2/3/4 asset, pyramid.png ile aynı boyut ──
        // Scale 0.82–0.95 arası: normal pyramid ile aynı görsel büyüklük
        // ── ÖZEL PİRAMİT TİPLERİ ──
        case"inferno":     p.hp=hpFor(14,gs.level,0.75); p.inferno=true;
            p.setDisplaySize(78,64).setTint(0xFF6633).setVelocityY(spd*0.9);
            p._spinRate=0.25; // sabit yavaş dönüş — tutarlı, titreyerek değil
            p._spinAngle=0;   // açı takibi
            break;
        case"glacier":     p.hp=hpFor(22,gs.level,0.8);  p.glacier=true; p.armor=1;
            p.setDisplaySize(78,64).setTint(0xDDFFFF).setVelocityY(spd*0.55);
            break;
        case"phantom_tri": p.hp=hpFor(12,gs.level,0.65); p.phantom_tri=true;
            p.setDisplaySize(78,64).setTint(0xFF99EE).setVelocityY(spd*0.85);
            p._splitDone=false; // bölünme bayrağı
            p.setAlpha(0.72);
            break;
        case"volt":        p.hp=hpFor(10,gs.level,0.55);  p.volt=true;
            p.setDisplaySize(78,64).setTint(0xFFFF77).setVelocityY(spd*1.1);
            p._voltPhase=0; // zigzag faz
            p._voltAccel=false;
            break;
        case"obsidian":    p.hp=hpFor(45,gs.level,1.3);   p.obsidian=true; p.armor=2;
            p.setDisplaySize(78,64).setTint(0xFF88BB).setVelocityY(spd*0.4);
            p._reflect=true; // hasar yansıtma
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
    // [FIX] Mermi geçiş sorunu: pool'dan gelen sprite body'si eski pozisyonda kalabilir.
    // body.reset() body'yi sprite'ın mevcut x/y konumuna hizalar.
    if(p.body) p.body.reset(p.x, p.y);
    p.body.enable=true;
    p.body.checkCollision.none=false;
    p.body.checkCollision.up=true;
    p.body.checkCollision.down=true;
    p.body.checkCollision.left=true;
    p.body.checkCollision.right=true;
    const isNewPyr=p.inferno||p.glacier||p.phantom_tri||p.volt||p.obsidian;
    if(p.elite&&isNewPyr){
        // setScale yerine setDisplaySize — scale tutarlılığı
        p.setDisplaySize(Math.round(p.displayWidth*1.25), Math.round(p.displayHeight*1.25));
    }

    // ── HİTBOX — tam genişlik, köşe geçişi kapalı ────────────────
    // Pyramid sprite bir üçgen: tabanın köşeleri tam kenarda durur.
    // Yatayı %94 daralttığımızda o köşeler hitbox dışına çıkıyor → mermi geçiyor.
    // Çözüm: tam native genişlik kullan, dikeyde hafif boşluk ver.
    if(type !== "zigzag"){
        const dw = p.displayWidth  > 4 ? p.displayWidth  : 78;
        const dh = p.displayHeight > 4 ? p.displayHeight : 64;
        const sx = p.scaleX > 0 ? p.scaleX : 1;
        const sy = p.scaleY > 0 ? p.scaleY : 1;
        const nw = dw / sx;
        const nh = dh / sy;
        const bw = nw;          // tam genişlik — üçgen tabanı köşeleri dahil
        const bh = nh * 0.88;  // dikeyde %12 boşluk (tepedeki şeffaf alan)
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
    const _hpReduction = _bMin < 5 ? 0.35 : _bMin < 12 ? 0.42 : 0.52; // much lower HP for all phases
    boss.hp = boss.maxHP = Math.ceil(_rawHP * _hpReduction);
    boss.type="boss"; boss.isBoss=true;
    boss.setScale(2.4).setTint(0xff0044).setVelocityY(50).setAlpha(0.7);
    // [FIX] Explicit boss hitbox after scale — resetEF ran before setScale(2.4)
    // Boss native texture ~78x64, displayed at 2.4x = ~187x154
    // Use native coords: setSize needs unscaled pixels
    try{
        if(boss.body){
            boss.body.enable = true;
            boss.body.checkCollision.none = false;
            boss.body.checkCollision.up = true;
            boss.body.checkCollision.down = true;
            boss.body.checkCollision.left = true;
            boss.body.checkCollision.right = true;
            // Tam native genişlik: 78x64 native, scale 2.4x
            // setSize native piksel alır — tam 78 genişlik, köşe geçişini engeller
            boss.body.setSize(78, 56).setOffset(0, 4);
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
        // PIXEL-PERFECT: pozisyonu en yakın piksele yuvarla — subpixel jitter önle
        if(p.x !== undefined) p.x = Math.round(p.x);
        if(p.y !== undefined) p.y = Math.round(p.y);
        // Velocity de tam sayıya yuvarla — subpixel birikimi önle
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
                try{if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.HapticFeedback){window.Telegram.WebApp.HapticFeedback.impactOccurred("light");}else if(navigator.vibrate){navigator.vibrate(8);}}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                killEnemy(S,p,false);
            }
            return;
        }
        if(!p.body||!p.body.enable) return;
        if(p.x<12){p.x=12;p.body.velocity.x=Math.abs(p.body.velocity.x)*0.5;}
        if(p.x>348){p.x=348;p.body.velocity.x=-Math.abs(p.body.velocity.x)*0.5;}
        if(p.frozen){
            // [FREEZE BUG FIX] Frozen düşman her frame'de hız sıfırlanır
            // Önceden sadece return yapılıyordu — düşman yine de hareket ediyordu
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
        // Shadow ve titan: yavaşça kendi ekseninde döner
        if((p.shadow||p.titan)&&!p.spawnProtected){
            p._spinAngle=(p._spinAngle||0)+dt*0.08;
            try{p.setAngle(p._spinAngle % 360);}catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }

        // Minimum hız
        if(!p.groundHit&&!p.spawnProtected){
            if(p.body.velocity.y<gs.pyramidSpeed*0.4) p.setVelocityY(gs.pyramidSpeed);
            // ── PHYSICAL MOTION: sway + wobble rotation ──────────
            if(p.type!=="kamikaze"&&p.type!=="zigzag"&&p.type!=="titan"&&p.type!=="colossus"&&p.type!=="volt"){
                if(p._windPhase===undefined){ p._windPhase=Math.random()*Math.PI*2; p._wobblePhase=Math.random()*Math.PI*2; }
                // Lateral sway
                const sway=Math.sin(gs.t*0.0018+p._windPhase)*8;
                p.body.velocity.x=Phaser.Math.Linear(p.body.velocity.x,sway,0.04);

                // ── JELLY ANGLE: damped spring oscillation after hit ──
                if(p._jellyActive){
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
                } else if(p.type!=="spinner"&&p.type!=="inferno"){
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

            // ── FALL SPEED LINES — ince beyaz hız çizgileri ──────
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

        // Gölge
        if(!p.groundHit&&!p.spawnProtected&&p.y>100){
            const shadowAlpha=Math.min(0.18,(p.y-100)/300*0.18);
            const shadowW=p.displayWidth*0.72;
            if(!p._shadowGfx){p._shadowGfx=S.add.graphics().setDepth(4);p._shadowLastX=-9999;}
            if(Math.abs(p.x-p._shadowLastX)>1.5){p._shadowLastX=p.x;p._shadowGfx.clear();p._shadowGfx.fillStyle(0x000000,shadowAlpha);p._shadowGfx.fillEllipse(p.x,GROUND_Y-3,shadowW,shadowW*0.18);}
        }

        // Özel AI davranışlar — aynı mantık
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

        // ── YENİ PİRAMİT ÖZEL DAVRANIŞLARI ──────────────────────
        // pyramid3: Kozmik/Rainbow — hue-shift tint döngüsü (performant: her 120ms güncelle)
        // Volt: zigzag + periyodik hızlanma
        if(p.volt&&!p.spawnProtected){
            p._voltPhase=(p._voltPhase||0)+dt*0.004;
            try{p.body.velocity.x=Math.sin(p._voltPhase)*90;}catch(e){console.warn("[NT] Hata yutuldu:",e)}
            if(Math.random()<0.004){try{p.setVelocityY(Math.min((p.body.velocity.y||0)*1.18,GS.pyramidSpeed*1.5));}catch(e){console.warn("[NT] Hata yutuldu:",e)}}
        }
        // Inferno: kendi ekseninde yavaş, sabit 360 dönüş
        if(p.inferno&&!p.spawnProtected){
            p._spinAngle = (p._spinAngle||0) + dt * p._spinRate * (p.elite?1.3:1);
            // Açıyı 0-360 arasında tut, setAngle ile uygula
            try{ p.setAngle(p._spinAngle % 360); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }
        // Obsidian: nabiz atan karanlik aura
        if(p.obsidian&&!p.spawnProtected&&!p.frozen){
            p._pulseT=(p._pulseT||0)+dt;
            const pulse=0.75+Math.sin(p._pulseT*0.003)*0.2;
            try{if(!p._staggering)p.setAlpha(pulse);}catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }
        // Glacier: buz parcaciği efekti
        if(p.glacier&&!p.spawnProtected&&Math.random()<0.003){
            const fg=S.add.graphics().setDepth(5);
            fg.x=p.x+Phaser.Math.Between(-12,12); fg.y=p.y+Phaser.Math.Between(-8,8);
            fg.lineStyle(1,0x88ddff,0.55); fg.lineBetween(0,0,Phaser.Math.Between(-6,6),Phaser.Math.Between(-6,6));
            S.tweens.add({targets:fg,alpha:0,y:fg.y+10,duration:400,onComplete:()=>fg.destroy()});
        }
        if(p.spiker){p.spikeTimer=(p.spikeTimer||0)+dt;if(p.spikeTimer>2800){p.spikeTimer=0;
            const spike=S.add.graphics().setDepth(7);spike.fillStyle(0xffcc00,0.9);spike.fillTriangle(p.x,p.y+5,p.x-4,p.y+18,p.x+4,p.y+18);
            S.tweens.add({targets:spike,y:spike.y+55,alpha:0,duration:750,onComplete:()=>spike.destroy()});
            // Spike oyuncuya 60px içindeyse hasar ver
            if(S.player&&S.player.active){const _sdx=S.player.x-p.x,_sdy=S.player.y-p.y;if(_sdx*_sdx+_sdy*_sdy<60*60) damagePlayer(S);}
        }}
        if(p.toxic){p.toxTimer=(p.toxTimer||0)+dt;if(p.toxTimer>1400){p.toxTimer=0;const tox=S.add.circle(p.x,p.y,14,0x66ff00,0.15).setDepth(6);S.tweens.add({targets:tox,scaleX:2.8,scaleY:2.8,alpha:0,duration:900,onComplete:()=>tox.destroy()});const ddx=S.player.x-p.x,ddy=S.player.y-p.y;if(ddx*ddx+ddy*ddy<55*55)damagePlayer(S);}}
        // Chain — yakın düşmanlara şimşek çaktırır
        // [BUG FIX] _activeEnemies null guard tutarlı hale getirildi (healer/freezerEnemy ile aynı pattern)
        if(p.chain&&!p.spawnProtected){p._chainT=(p._chainT||0)+dt;if(p._chainT>1800){p._chainT=0;
            const _chainList=S._activeEnemies||[];
            _chainList.forEach(e=>{if(e===p||!e.active)return;const dx=e.x-p.x,dy=e.y-p.y;if(dx*dx+dy*dy<70*70){
                const lg=S.add.graphics().setDepth(18);lg.lineStyle(1,0x4488ff,0.8);lg.lineBetween(p.x,p.y,e.x,e.y);
                S.tweens.add({targets:lg,alpha:0,duration:150,onComplete:()=>lg.destroy()});
                // Zincir: bağlı düşmana geçici zırh (+1 armor 1.5s)
                if(!e.isBoss&&!e._chainShielded){e._chainShielded=true;e.armor=(e.armor||0)+1;
                    S.time.delayedCall(1500,()=>{if(e&&e.active){e.armor=Math.max(0,e.armor-1);e._chainShielded=false;}});}
            }});
        }}
        // Bomber — zemine yakınken patlama
        // [OPT] getMatching → _activeEnemies cache
        if(p.bomber&&!p.spawnProtected){const distG=GROUND_Y-p.y;if(distG<80&&!p._exploding){p._exploding=true;
            const bx=p.x, by=p.y;
            // 1. Shockwave halkası — 2 katman (flash dairesi kaldırıldı)
            for(let ri=0;ri<2;ri++){
                const bRing=S.add.graphics().setDepth(22);
                bRing.lineStyle(ri===0?3:1.5,ri===0?0xff4400:0xffcc00,ri===0?0.85:0.55);
                bRing.strokeCircle(bx,by,8+ri*6);
                S.tweens.add({targets:bRing,scaleX:ri===0?4.5:6,scaleY:ri===0?4.5:6,alpha:0,
                    duration:260+ri*70,ease:"Quad.easeOut",delay:ri*35,
                    onComplete:()=>bRing.destroy()});
            }
            // 2. Ateş parçacıkları — 16→8 adet
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
            // 4. Kıvılcım — 6 adet
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

        // Zemine çarpma — sadece aşağı giderken tetikle (mıknatıs sıçraması önlenir)
        // Display boyutu 64px → _halfH = 64 * scaleY * 0.5 = 32 * scaleY
        const _halfH = p.scaleY > 0 ? (64 * p.scaleY * 0.5) : 32;
        const pBase  = p.y + _halfH;
        const _movingDown = !p.body || p.body.velocity.y >= -5; // yukarı gidiyorsa tetikleme
        if(pBase >= GROUND_Y && !p.groundHit && _movingDown){
            p.groundHit=true;
            p.y=GROUND_Y - _halfH;
            p.setVelocity(0,0);
            if(p.body){p.body.velocity.x=0;p.body.velocity.y=0;}
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
    // hitDir: +1 = sağa it (mermi soldan geldi), -1 = sola it (mermi sağdan geldi)
    const _hitDir = hitDir || (Math.random()<0.5 ? 1 : -1);
    let dmg=rawDmg, crit=isCrit;
    if(!crit&&Math.random()<gs.critChance){dmg*=gs.critMult;crit=true;}
    // ★ YENİ: Cryo Shatter sinerjisi — donmuş düşmana otomatik kritik
    if(gs._synergyCryoShatter&&enemy.frozen&&!crit){crit=true;dmg*=gs.critMult;}
    // [v10.x REDESIGN] Storm Core evo — crit vurduğunda lightning zinciri tetikle
    // Ham hasar bonus yerine kimlik efekti: crit = fırtına başlatır
    if(crit && gs._evoStormCore && S && !gs._stormCoreCooldown){
        gs._stormCoreCooldown = true;
        S.time.delayedCall(9000, ()=>{ if(GS) GS._stormCoreCooldown = false; }); // was 6s → 9s CD
        S.time.delayedCall(40, ()=>{ if(!GS||GS.gameOver) return; doLightning(S); });
    }
    // ★ YENİ: Relic damage bonus uygula
    // Evolution bonus is handled entirely in calcStats/syncStatsFromPipeline — do NOT apply again here
    // Mini boss için armor yüzdesel azaltma — flat çıkarma değil
    // Normal düşmanlar: flat (armor 1-4 anlamlı), mini boss: %20 per armor point (max %48 azaltma)
    if(enemy._isMiniBoss){
        const reduction=Math.min(0.32, enemy.armor*0.08); // [BALANCE] armor 4 → %32 max azaltma
        dmg=Math.max(0.5, dmg*(1-reduction));
    } else {
        dmg=Math.max(0.5,dmg-enemy.armor);
    }
    // [v11] KNOCKBACK — hasarla ölçeklendirildi + yüksek knockback'te kısa stun
    if(gs.knockback>0&&!enemy.frozen&&enemy.body){
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

    // Hit flash + partiküller → spawnHitDebris + jelly bloğu aşağıda

    // ── HIT STOP + MICRO SLOW-MO ─────────────────────────────────
    // Crit: 45ms full physics pause + timeScale dip to 0.78 for 90ms
    // Normal: 12ms physics pause only (weight without slow-mo)
    // Kill: handled below in enemy.hp<=0 block
    const _now=Date.now();
    const _canFreeze = !gs._microFreeze && !gs.pickingUpgrade && _upgradeLock===0;

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

        // Düşman tipine göre break texture ve boyut parametreleri
        const isZigzag = enemy.type==="zigzag";
        const breakTex = isZigzag ? "zigzag_break" : "pyramid_break";

        // Zigzag: native 134x113, break frame native 133x115, display 59x48
        // Pyramid: native 183x112, break frame native 183x112, display spawnW x spawnH
        let BREAK_SIZES, BREAK_OFFSETS, _breakFrameW, _breakFrameH;

        if(isZigzag){
            // zigzag_break: 532x115, 3 frame, frameWidth=177
            // İçerik analizi: frame0 cx=67, frame1 cx=87(+20), frame2 cx=108(+41)
            // zigzag.png cx=66 — frame0 ile neredeyse aynı (referans)
            // Display scale = 59/177 = 0.333
            // Frame1 kayma: 20*0.333=6.7 → 7px sola kaydır
            // Frame2 kayma: 41*0.333=13.7 → 14px sola kaydır
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

            if(enemy.body){
                enemy.body.reset(enemy.x, enemy.y);
                enemy.body.checkCollision.none=false;
                // Break frame'de de tam genişlik — daraltma yapmıyoruz
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
        if(enemy.body){
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
        }catch(e){console.warn("[NT] Hata yutuldu:",e)}

        // Jelly angle spring — larger impulse so wobble is visible
        const _impulse = _hitDir * (crit ? 12 : 6);
        enemy._jellyAngle  = (enemy._jellyAngle || 0) + _impulse;
        enemy._jellyVel    = _impulse * 0.85;
        enemy._jellyActive = true;

        // Release staggering after all phases (~360ms total)
        S.time.delayedCall(crit ? 360 : 300, ()=>{
            if(enemy.active) enemy._staggering = false;
        });
    }

    // ── HIT PARTICLES — color-matched sparks ─────────────────
    if(enemy.active && _dmgNumCount < MAX_DMG_NUMS){
        const _hcol = enemy._originalTint || 0xffffff;
        const _pcount = crit ? 5 : 2;
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

    // ── HIT FLASH + CRİT GLOW — tüm üçgenler, boss dahil ────────
    try{
        const isMiniBossHit = enemy._isMiniBoss;
        const _savedAlpha   = enemy.alpha;
        const _savedTint    = enemy._originalTint ?? null;
        const _flashDur     = crit ? 100 : 65;

        // Beyaz flash — tüm tiplerde aynı: tutarlı ve temiz his
        enemy.setTint(0xffffff);
        // Ghost / stealth / phantom gibi yarı şeffaf tipler flash anında
        // görünür hale gelsin — aksi hâlde flash fark edilmez
        if(_savedAlpha < 0.88) enemy.setAlpha(Math.min(1.0, _savedAlpha + 0.50));

        // Crit VFX: halka + kıvılcım — throttled (80ms)
        if(crit){
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

        // Orijinal renge dön
        S.time.delayedCall(_flashDur, ()=>{
            if(!enemy || !enemy.active) return;
            // MiniBoss: kendi tanım rengine dön
            if(isMiniBossHit){
                const def=enemy._miniBossDef;
                if(def?.tint != null) enemy.setTint(def.tint); else enemy.clearTint();
            } else {
                // Normal / boss: spawnEnemy'de kayıt edilen orijinal tint
                if(_savedTint !== null) enemy.setTint(_savedTint);
                else enemy.clearTint();
            }
            // Alpha'yı da geri yükle (ghost tipler)
            if(_savedAlpha < 0.88) enemy.setAlpha(_savedAlpha);
        });
    }catch(e){console.warn("[NT] Hata yutuldu:",e)}

    // ── Screen shake + zoom ─────────────────────────────────────
    if(crit){
        const _shakeAmt = enemy._isMiniBoss ? 0.007 : 0.004;
        const _shakeDur = enemy._isMiniBoss ? 40   : 28;
        S.cameras.main.shake(_shakeDur, _shakeAmt);
        // Slight zoom punch on crit — snappy in, smooth out
        if(!enemy._isMiniBoss && rawDmg > 2.0){
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

    // ── Çerçeve duraksama hissi — micro-freeze sadece crit'te zaten var ──
    // Normal vuruşta: hafif düşman "geri çekme" hissi (velocity spike)
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

// ── ZORLUK DENGESİ — bağımlılık eğrisi ───────────────────────
function updateDifficultyTick(S){
    const gs=GS, min=gs.t/60000;

    // SPAWN DELAY (ms): ARCADE FIX — much faster early game, intense from the start
    // 0dk=850 → 1dk=750 → 2dk=650 → 4dk=550 → 7dk=450 → 10dk=380 → 15dk=320 → 20dk=280 → min=240
    const spawnBase =
        min < 1  ? Phaser.Math.Linear( 850,  750, min)        :
        min < 2  ? Phaser.Math.Linear( 750,  650, min-1)      :
        min < 4  ? Phaser.Math.Linear( 650,  550, (min-2)/2)  :
        min < 7  ? Phaser.Math.Linear( 550,  450, (min-4)/3)  :
        min < 10 ? Phaser.Math.Linear( 450,  380, (min-7)/3)  :
        min < 15 ? Phaser.Math.Linear( 380,  320, (min-10)/5) :
        min < 20 ? Phaser.Math.Linear( 320,  280, (min-15)/5) :
        Math.max(240, 280 - (min-20)*6);

    const pm={ calm:1.35, wave:1.0, swarm:0.85, rush:0.72, chaos:0.60 };
    gs.spawnDelay = Math.max(240, Math.round(spawnBase * (pm[gs.directorPhase]||1.0)));

    // LEVEL-BASED: sadece hız artar, spawn delay artık level'dan ETKİLENMEZ
    // (çift scaling sorunu düzeltildi — eskiden hem zaman hem level spawn'u hızlandırıyordu)
    const lv = gs.level || 1;
    let lvSpdMult = 1.0;
    if(lv >= 5)  lvSpdMult = 1.06;
    if(lv >= 10) lvSpdMult = 1.12;
    if(lv >= 15) lvSpdMult = 1.20; // BALANCE FIX: was 1.18
    if(lv >= 20) lvSpdMult = 1.28; // BALANCE FIX: was 1.22 (restored pressure)
    if(lv >= 25) lvSpdMult = 1.34; // BALANCE FIX: was 1.25 (restored pressure)

    // Düşük canda mercy mechanic — BALANCE FIX: reduced (was +400/1.50 and +300/1.85)
    // Still provides some relief but no longer creates a safe bubble
    if(gs.health <= 3) gs.spawnDelay = Math.min(gs.spawnDelay + 180, spawnBase * 1.20);
    if(gs.health <= 1) gs.spawnDelay = Math.min(gs.spawnDelay + 120, spawnBase * 1.40);

    // DÜŞMAN HIZI (px/s): ARCADE FIX — early game much faster, no more boring start
    // 0dk=95 → 1dk=115 → 3dk=138 → 6dk=160 → 10dk=185 → 15dk=210 → 25dk=235 → max=245
    const baseSpeed =
        min < 1  ? Phaser.Math.Linear( 95, 115, min)        :
        min < 3  ? Phaser.Math.Linear(115, 138, (min-1)/2)  :
        min < 6  ? Phaser.Math.Linear(138, 160, (min-3)/3)  :
        min < 10 ? Phaser.Math.Linear(160, 185, (min-6)/4)  :
        min < 15 ? Phaser.Math.Linear(185, 210, (min-10)/5) :
        min < 25 ? Phaser.Math.Linear(210, 235, (min-15)/10):
        Math.min(245, 235 + (min-25)*1.0);
    gs.pyramidSpeed = Math.min(245, baseSpeed * lvSpdMult);
}

function runDirector(S){
    const gs=GS, min=gs.t/60000, hp=gs.health/gs.maxHealth;
    const phases=["calm","wave","swarm","rush","chaos"];

    // ARCADE: shorter calm phase, faster ramp
    //   0:00-0:30 → TAM calm
    //   0:30-1:00 → çoğunlukla calm (%50), bazen wave
    //   1:00-2:30 → wave ağırlıklı, calm azalıyor
    //   2:30+     → ağırlık sistemi devreye girer

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
// PART D: Gün Döngüsü, Atmosfer, Kayan Yıldız, Sandık, UI, Slotlar
// ═══════════════════════════════════════════════════════════════

// ── GÜN DÖNGÜSÜ ──────────────────────────────────────────────
// ── KAYAN YILDIZ — ince uzun, iz ile ──
// ── ATMOSFER ─────────────────────────────────────────────────

// ── SANDIK NADİRLİK ───────────────────────────────────────────
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
            // Rarity renginde parıltı parçacıkları
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
        // Yakın kontrolü
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

    // ── LAYOUT HESABI — her bölüm kesin ayrı ──────────────────────
    // [1] Başlık alanı      : 40px (panelY → panelY+40)
    // [2] Chest ikonu alanı : 100px (panelY+40 → panelY+140) — büyük, net boşluk
    // [3] Ayırıcı çizgi     : 8px  (panelY+140 → panelY+148)
    // [4] Upgrade kartları  : itemCount * 68px
    // [5] Gold reward alanı : 52px
    // [6] Alt padding       : 14px
    const HEADER_H  = 40;
    const CHEST_H   = 100;  // chest ikonu için tamamen ayrılmış alan
    const DIVIDER_H = 8;
    const ITEM_H    = 68;   // her kart yüksekliği (önceki 64'ten büyütüldü)
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
    // Dış border — rarity rengi
    pg.lineStyle(2.5, rarity.color, 0.95);
    pg.strokeRoundedRect(panelX, panelY, panelW, panelH, 10);
    // İç border — ince, glow rengi
    pg.lineStyle(1, rarity.glowColor, 0.30);
    pg.strokeRoundedRect(panelX+3, panelY+3, panelW-6, panelH-6, 8);
    // Başlık şerit (gradient hissi)
    pg.fillStyle(rarity.color, 0.20);
    pg.fillRoundedRect(panelX, panelY, panelW, HEADER_H, {tl:10,tr:10,bl:0,br:0});
    // Chest ikonu alanı — hafif koyu arka plan
    pg.fillStyle(0x000000, 0.25);
    pg.fillRect(panelX, panelY+HEADER_H, panelW, CHEST_H);
    // Chest alanı alt çizgisi — net separator
    pg.lineStyle(1.5, rarity.color, 0.45);
    pg.lineBetween(panelX+12, panelY+HEADER_H+CHEST_H, panelX+panelW-12, panelY+HEADER_H+CHEST_H);

    // ── Başlık yazısı ─────────────────────────────────────────────
    const rarityLabel = L(rarity.label);
    const titleColor = rarity===CHEST_RARITY.LEGENDARY?"#ffcc00":rarity===CHEST_RARITY.RARE?"#cc66ff":"#66aaff";
    const titleTxt=ui.add(S.add.text(W/2, panelY+HEADER_H/2, rarityLabel, {
        font:"bold 14px LilitaOne, Arial, sans-serif",
        color: titleColor,
        padding:{x:4,y:2}
    }).setOrigin(0.5).setDepth(202).setAlpha(1).setVisible(false));

    // ── Chest ikonu — kendi alanında ortalanmış ───────────────────
    const chestTexKey = rarity===CHEST_RARITY.LEGENDARY?"tex_chest_legendary"
                       :rarity===CHEST_RARITY.RARE?"tex_chest_rare":"tex_chest_common";
    const CHEST_ICO_Y = panelY + HEADER_H + CHEST_H/2;  // chest alanının tam ortası
    const chestIco = ui.add(S.add.image(W/2, CHEST_ICO_Y, chestTexKey)
        .setScale(3.2).setDepth(203).setAlpha(1).setVisible(false));

    // ITEM_START_Y: chest alanı + divider'dan sonra başlar
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
                    // Her kart ITEM_START_Y'den başlıyor, ITEM_H aralıklı
                    const ry = ITEM_START_Y + ri * ITEM_H;
                    const CARD_X  = panelX + 8;
                    const CARD_W  = panelW - 16;
                    const CARD_H  = ITEM_H - 6;  // 6px gap alt-üst
                    const ICO_X   = CARD_X + 30;  // ikon merkezi
                    const TEXT_X  = CARD_X + 62;  // metin başlangıcı
                    const TEXT_W  = CARD_W - 68;

                    const rarityC = 0x5599dd; // Tek tip renk — rarity sistemi kaldırıldı

                    const rg=ui.add(S.add.graphics().setDepth(202));
                    // Kart arka plan
                    rg.fillStyle(0x0c0d1c, 0.95);
                    rg.fillRoundedRect(CARD_X, ry, CARD_W, CARD_H, 6);
                    // Rarity kenar çizgisi
                    rg.lineStyle(1.5, rarityC, 0.70);
                    rg.strokeRoundedRect(CARD_X, ry, CARD_W, CARD_H, 6);
                    // Sol accent bar
                    rg.fillStyle(rarityC, 0.90);
                    rg.fillRoundedRect(CARD_X, ry, 4, CARD_H, {tl:6,tr:0,bl:6,br:0});
                    // İkon arka plan dairesi — 22px radius matches 40px displaySize icon
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

                    // Level göstergesi — sağ üst
                    const lvNow=Math.min(u.level+1, u.max??u.maxLevel??999);
                    const lvStr="Lv "+lvNow+"/"+u.max;
                    const lvTxt=ui.add(S.add.text(CARD_X+CARD_W-8, ry+10, lvStr, {
                        font:"bold 11px LilitaOne, Arial, sans-serif",
                        color:Phaser.Display.Color.IntegerToColor(rarityC).rgba
                    ,
            padding:{x:2,y:1}
        }).setOrigin(1,0).setDepth(204).setAlpha(1).setVisible(false));

                    // Açıklama
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

// ── OYUNCU GLOW — yanıp sönen efekt YOK ──────────────────────
function drawPlayerGlow(S){
    const gs=GS; if(!gs||!S.playerGlow) return;
    S.playerGlow.clear();
    const px=S.player.x, py=S.player.y;
    const t=gs.t*0.001;

    // ── Zemin gölgesi — hareket hızına göre uzar, yön kayar ──
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

    // [VFX] Speed buff aktifken — etrafında dönen rüzgar çizgileri + hareket trail
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
        // [VFX] Hız trail partikülleri — add.rectangle kullan, add.graphics değil
        // [CRASH FIX] add.graphics() her frame yeni canvas context açıyordu → GC spike
        if(velX>80&&Math.random()<0.55){
            const tp=S.add.rectangle(px,py-14,2,Phaser.Math.Between(4,9),0x44ffcc,0.55).setDepth(11);
            S.tweens.add({targets:tp,y:tp.y+4,alpha:0,duration:180,
                ease:"Quad.easeOut",onComplete:()=>tp.destroy()});
        }
    }

    // [Artifact aura kaldırıldı — v9.1]

    // Düşük can: kırmızı aura kaldırıldı — HP bar yeterli gösterge
    const hR=Math.max(0,gs.health/gs.maxHealth);

    // [VFX] Heal flash — can alındığında kısa yeşil parlama
    if(gs._healFlash>0){
        gs._healFlash-=S.game.loop.delta||16;
        const hfa=Math.min(0.35,gs._healFlash/300)*0.35;
        S.playerGlow.fillStyle(0x44ff88,hfa);
        S.playerGlow.fillCircle(px,py-14,26);
        S.playerGlow.lineStyle(2,0x44ff88,hfa*2);
        S.playerGlow.strokeCircle(px,py-14,20);
    }

    // ── Combo aura — katmanlı, nabızlı ──
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
    S.hpBarGfx.clear();
    const bW=40,bH=5,bx=px-bW/2,by=py-50;
    // Arka plan
    S.hpBarGfx.fillStyle(0x000000,0.88); S.hpBarGfx.fillRect(bx-2,by-2,bW+4,bH+4);
    S.hpBarGfx.lineStyle(1,0x333333,0.9); S.hpBarGfx.strokeRect(bx-2,by-2,bW+4,bH+4);
    if(hR>0){
        const hc=hR>0.6?0x33ee55:hR>0.3?0xffaa00:0xff2222;
        const barW=Math.ceil(bW*hR);
        S.hpBarGfx.fillStyle(hc,1); S.hpBarGfx.fillRect(bx,by,barW,bH);
        // Parlama şeridi
        S.hpBarGfx.fillStyle(0xffffff,0.3); S.hpBarGfx.fillRect(bx,by,barW,2);
        // Düşük canda yanıp sönen overlay
        if(hR<0.3){
            const fAlpha=0.25+Math.sin(t*5.5)*0.2;
            S.hpBarGfx.fillStyle(0xff4444,fAlpha); S.hpBarGfx.fillRect(bx,by,barW,bH);
        }
        // HP bar glow — tam doluyken yeşil parlaklık
        if(hR>0.95){
            S.hpBarGfx.fillStyle(0x44ff88,0.15); S.hpBarGfx.fillRect(bx-1,by-1,barW+2,bH+2);
        }
    }
}

// ── UI ────────────────────────────────────────────────────────
function buildUI(S){
    const D=50,W=360,H=640;

    // ── XP BAR — tam üst ─────────────────────────────────────
    S.xpBarBg=S.add.graphics().setDepth(D+3).setScrollFactor(0);
    S.xpBarBg.fillStyle(0x000000,0.50); S.xpBarBg.fillRect(0,0,W,10);
    S.xpBarBg.fillStyle(0x001122,0.35); S.xpBarBg.fillRect(0,0,W,10);
    S.xpBarBg.lineStyle(1,0x112244,0.55); S.xpBarBg.lineBetween(0,10,W,10);

    S.xpBarFill=S.add.rectangle(0,5,0,8,0x2277ff,1).setOrigin(0,0.5).setDepth(D+4).setScrollFactor(0);
    S.xpBarGlow=S.add.rectangle(0,5,0,14,0x0033cc,0.18).setOrigin(0,0.5).setDepth(D+3).setScrollFactor(0);
    S._xpBarShine=S.add.rectangle(0,5,0,2,0xffffff,0.40).setOrigin(0,0.5).setDepth(D+5).setScrollFactor(0);
    S._xpBarPulse=S.add.graphics().setDepth(D+6).setScrollFactor(0);

    // ── SKOR — üst orta ──────────────────────────────────────
    S.scoreText=S.add.text(W/2,18,"0",{
        fontFamily:"LilitaOne",
        fontSize:"18px",
        color:"#ffffff",
        stroke:"#000000",
        strokeThickness:3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D+6);

    // ── SAĞ ÜST: Level, Kills, Gold — alt alta hizalı ──
    S.levelText=S.add.text(W-8,10,"Lv 1",{
        fontFamily:"LilitaOne",
        fontSize:"14px",
        color:"#ffdd44",
        stroke:"#000000",
        strokeThickness:2
    }).setOrigin(1,0).setScrollFactor(0).setDepth(D+5);

    S.killText=null; // [REMOVED] kill counter display removed

    // ── ALTIN — ikon (sol) + sayı (sağ)
    S.goldText=S.add.text(W-8,26,"0",{
        fontFamily:"LilitaOne",
        fontSize:"14px",
        color:"#FFD700",
        stroke:"#000000",
        strokeThickness:2
    }).setOrigin(1,0).setScrollFactor(0).setDepth(D+5);

    // Altın ikonu — goldText'in soluna dinamik olarak yerleştirilir (renderUI'da güncellenir)
    S.goldIcon=S.add.image(W-50,35,"tex_gold_icon")
        .setDisplaySize(13,13).setOrigin(0.5,0.5)
        .setScrollFactor(0).setDepth(D+5);

    S._crystalHudText=null; // HUD crystal display removed

    // ── PAUSE butonu — pause_button asset, LINEAR filter (piksel yok)
    // Buton merkezi: y=72, sağ hizalı W-18
    const pH = S.add.image(W-18, 72, "pause_button")
        .setDisplaySize(30, 30)
        .setScrollFactor(0)
        .setDepth(D+7)
        .setAlpha(0.80)
        .setInteractive({useHandCursor:true});
    // LINEAR filter — pixelArt modunda keskin görünsün
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

    // ── COMBO — invisible placeholder (combo gösterimi spawnComboText ile yapılır)
    S.comboText=S.add.text(W/2,310,"",{
        fontFamily:"LilitaOne",
        fontSize:"1px",
        color:"#000000"
    }).setOrigin(0.5).setDepth(D+5).setAlpha(0);
}

function renderUI(S){
    const gs=GS;
    if(!gs||gs.gameOver||!S.scene||!S.scene.isActive()) return;
    updateDifficultyTick(S);
    // Sync player stats every frame — 2s lag allowed bypassing the damage ceiling during combos
    syncStatsFromPipeline(gs);
    // [v9.4] Event süre göstergesi — ekranın üstünde renkli bar
    renderEventHUD(S);

    // XP bar — animasyonlu genişleme
    const ratio=Math.min(1,gs.xp/gs.xpToNext);
    const targetW=360*ratio;
    S.xpBarFill.width=Phaser.Math.Linear(S.xpBarFill.width,targetW,0.14);
    S.xpBarGlow.width=S.xpBarFill.width;
    if(S._xpBarShine) S._xpBarShine.width=S.xpBarFill.width;
    if(S._xpBarPulse){
        const _pt=Date.now()*0.0025;
        const _pw=S.xpBarFill.width;
        S._xpBarPulse.clear();
        if(_pw>10){
            const _px=4+(_pt%1)*(_pw-4);
            S._xpBarPulse.fillStyle(0xffffff,0.40);
            S._xpBarPulse.fillRect(_px,1,5,5);
            S._xpBarPulse.fillStyle(0x88bbff,0.30+0.18*Math.sin(_pt*3));
            S._xpBarPulse.fillRect(_pw-5,0,6,8);
        }
    }
    // Doluluğa göre renk
    const xpColor=ratio>0.8?0x22ddaa:ratio>0.5?0x1a66ee:0x0f44bb;
    S.xpBarFill.setFillStyle(xpColor);

    S.levelText.setText("Lv "+gs.level);
    // kill text removed
    if(S.scoreText) S.scoreText.setText(gs.score.toLocaleString());

    // Altın — yavaş sayaç
    if(!S._goldDisplay) S._goldDisplay=0;
    S._goldDisplay=Math.floor(S._goldDisplay+(gs.gold-S._goldDisplay)*0.08);
    S.goldText.setText(""+S._goldDisplay);
    // Altın ikonu — sayının hemen soluna hizala
    if(S.goldIcon && S.goldText){
        S.goldIcon.setX(360 - 8 - S.goldText.width - 8);
        S.goldIcon.setY(26 + S.goldText.height * 0.5); // text ile dikey hizala
    }
    // Kristal — statik (değişmez sık sık)
    if(S._crystalHudText) S._crystalHudText.setText("GEM "+PLAYER_CRYSTAL);

    // Combo — milestone floating text only (static HUD combo yazısı kaldırıldı)
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

    // [UPGRADE VİZÜEL] Slot'ları 500ms'de bir güncelle — level bazlı pulse için
    if(!S._slotRefreshTimer) S._slotRefreshTimer=0;
    S._slotRefreshTimer+=(S.game.loop.delta||16);
    if(S._slotRefreshTimer>500){S._slotRefreshTimer=0;refreshSlots(S);}

    // Quest HUD — oyun içinde artık gösterilmiyor
    // [UI POLISH] Görevler sadece menüde "Günlük Görevler" bölümünde listelenir
    // Oyun içi sürekli yazı kaldırıldı — temiz UI

    // ── EVOLUTION HINT — "⚡ EVO NEAR" pulsing text when 1 req met ──
    // Shows player they're on track for an evolution without spoiling which one
    if(gs.level >= 6 && !gs.pickingUpgrade){
        let _evoNear = false;
        if(typeof EVOLUTIONS !== "undefined"){
            for(const evo of EVOLUTIONS){
                if(evo.active) continue;
                const metCount = evo.req.filter(r=>UPGRADES[r]&&UPGRADES[r].level>=UPGRADES[r].max).length;
                if(metCount === evo.req.length - 1){ _evoNear = true; break; }
            }
        }
        if(_evoNear){
            if(!S._evoHintText){
                S._evoHintText = S.add.text(360-4, 52, "⚡ EVO", {
                    font:"bold 9px LilitaOne, Arial, sans-serif",
                    color:"#ffee44", stroke:"#000", strokeThickness:2, padding:{x:2,y:1}
                }).setOrigin(1,0).setDepth(60).setAlpha(0);
            }
            // Pulse alpha
            const _pulse = 0.55 + Math.sin(gs.t * 0.006) * 0.45;
            S._evoHintText.setAlpha(_pulse).setVisible(true);
        } else {
            if(S._evoHintText) S._evoHintText.setVisible(false);
        }
    }

    // [Artifact HUD kaldırıldı — v9.1]
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
    const pLabel=CURRENT_LANG==="en"?"PAUSED":CURRENT_LANG==="ru"?"ПАУЗА":"DURDURULDU";
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
    _div(CURRENT_LANG==="en"?"STATS":"STATLAR",0x44aacc);
    _row("HP",   gs.health+"/"+gs.maxHealth,"#ff7777");
    _row("DMG",  gs.damage.toFixed(1),       "#ffcc44");
    _row("RATE", (1000/gs.shootDelay).toFixed(1)+"/s","#ff8844");
    _row("LV",   "Lv "+gs.level,             "#88ddff");
    const aUps =Object.entries(UPGRADES).filter(([k,u])=>u.level>0&&u.type==="passive");
    const aWeps=Object.entries(UPGRADES).filter(([k,u])=>u.level>0&&(u.type==="weapon"||u.type==="mainweapon"));
    if(aUps.length>0){ _div(CURRENT_LANG==="en"?"PASSIVE":"PASİF",0x44cc88); aUps.slice(0,3).forEach(([k,u])=>_row(L(u.nameKey),u.level+"/"+u.max,"#88cc88")); }
    if(aWeps.length>0){ _div(CURRENT_LANG==="en"?"WEAPONS":"SİLAH",0xffaa44); aWeps.slice(0,3).forEach(([k,u])=>_row(L(u.nameKey),u.level+"/"+u.max,"#ffcc88")); }

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
    const rLbl=CURRENT_LANG==="en"?"▶  RESUME":"▶  DEVAM";
    const mLbl=CURRENT_LANG==="en"?"MAIN MENU":"ANA MENÜ";
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

    // Ses toggle'ları kaldırıldı — menüdeki Settings'ten kontrol edilir.

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
// ── SLOT UI — [UI REDESIGN] XP bar çakışması giderildi, panel bg eklendi
function buildSlotUI(S){
    S.weaponSlots=[]; S.passiveSlots=[]; S.weaponSlotIcons=[]; S.passiveSlotIcons=[];
    const D=50;
    const SW=20, SH=20, GAP=3;
    // [UI] Y konumları: XP bar (0-10) + güvenli mesafe → weapon:14, passive:38
    const WY=14, PY=38;
    const totalSlotW=(MAX_WEAPONS*(SW+GAP))-GAP;

    // [UI POLISH] Slot panel arka planı TAMAMEN KALDIRILDI
    // Slotlar artık arkaplan paneli olmadan direkt görünür
    // Okunabilirlik slot kenarlıklarının kendi border/glow'u ile sağlanır

    // Silah slotları
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

    // Pasif slotları
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

    // [FIX] Slotlar alım sırasına göre kalıcı tutulur — her refresh'te yeniden sıralanmaz
    // _weaponSlotKeys ve _passiveSlotKeys, upgrade alındığında applyUpgrade'de güncellenir
    if(!S._weaponSlotKeys) S._weaponSlotKeys=[];
    if(!S._passiveSlotKeys) S._passiveSlotKeys=[];

    // Artık aktif olmayan (level=0) key'leri listeden temizle
    S._weaponSlotKeys = S._weaponSlotKeys.filter(k=>UPGRADES[k]&&UPGRADES[k].level>0);
    S._passiveSlotKeys= S._passiveSlotKeys.filter(k=>UPGRADES[k]&&UPGRADES[k].level>0);

    // Listeye henüz eklenmemiş ama level>0 olan upgrade'leri sona ekle (güvenlik)
    Object.entries(UPGRADES).forEach(([k,u])=>{
        if((u.type==="weapon"||u.type==="mainweapon")&&u.level>0&&!S._weaponSlotKeys.includes(k))
            S._weaponSlotKeys.push(k);
        if(u.type==="passive"&&u.level>0&&!S._passiveSlotKeys.includes(k))
            S._passiveSlotKeys.push(k);
    });

    const weapons = S._weaponSlotKeys.map(k=>[k,UPGRADES[k]]).filter(([k,u])=>u);
    const passives= S._passiveSlotKeys.map(k=>[k,UPGRADES[k]]).filter(([k,u])=>u);
    // [UPGRADE VİZÜEL] Level bazlı pulse için zaman referansı
    const t=GS?GS.t*0.001:0;

    S.weaponSlotIcons.forEach((ico,i)=>{
        if(!ico||!ico.scene) return;
        const sx=5+i*(SW+GAP);
        const bg=S.weaponSlots[i];
        if(!bg) return;
        if(i<weapons.length){
            const [k,u]=weapons[i];
            const rc=rarityC[u.rarity]||0x4488ff;
            // [UPGRADE VİZÜEL] Level oranına göre artan glow, maxed'de altın kenarlık + pulse
            const lvRatio=u.level/u.max;
            const effectColor=lvRatio>=1?0xffcc00:rc;
            const pulseAlpha=lvRatio>=1?(0.12+Math.sin(t*3)*0.08):(0.08+lvRatio*0.22);
            bg.clear();
            bg.fillStyle(effectColor,pulseAlpha); bg.fillRoundedRect(sx+1,WY+1,SW-2,SH-2,2);
            bg.lineStyle(lvRatio>=1?2:1.5,effectColor,0.85+lvRatio*0.1);
            bg.strokeRoundedRect(sx,WY,SW,SH,2);
            // Maxed: dış parlama halkası
            if(lvRatio>=1){
                bg.lineStyle(1,0xffcc00,0.22+Math.sin(t*3)*0.1);
                bg.strokeRoundedRect(sx-2,WY-2,SW+4,SH+4,3);
            }
            // Level pip şeridi — slotun altında
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

    // Giriş: squash → elastic pop → settle
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

                            // Sağ-sol sallama
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
    // Kill chain: art arda killlar daha ağır ses çıkarır
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
// ║  spawnLevelUpText(x, y)                                 ║
// ╚══════════════════════════════════════════════════════════╝
function spawnLevelUpText(S, x, y){
    if(!S||!S.add) return;
    NT_SFX.play("level_up");
    const str   = "LEVEL UP!";
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

// ── Nadir patlama sayacı — her ~4. patlamada exp1/exp2/exp3'ten biri çıkar
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
        // exp1/exp2 daha küçük scale, exp3 biraz daha büyük ama hepsi azaltıldı
        const rareScales= [
            Math.max(2.2, sz * 5.0),  // exp1 — 32px → ~70px görsel
            Math.max(2.2, sz * 5.0),  // exp2 — 32px → ~70px görsel
            Math.max(1.1, sz * 2.5),  // exp3 — 72px → ~79px görsel
        ];
        // Ağırlıklı seçim: exp3 %70, exp1 %15, exp2 %15
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
    // Second ring (delayed)
    S.time.delayedCall(42,()=>{
        const ring2=_POOL.get(22); if(!ring2) return;
        ring2.lineStyle(1.5,col2,0.60); ring2.strokeCircle(0,0,8);
        ring2.setPosition(x,y);
        _pt(S,ring2,{scaleX:6*sz,scaleY:6*sz,alpha:0,duration:440,ease:"Sine.easeOut"});
    });
    // Colour orb centre
    const orb=_POOL.get(23); if(orb){
        orb.fillStyle(col2,0.85); orb.fillCircle(0,0,8*sz);
        orb.fillStyle(0xffffff,0.55); orb.fillCircle(-2*sz,-2*sz,3*sz);
        orb.setPosition(x,y);
        _pt(S,orb,{scaleX:1.8,scaleY:1.8,alpha:0,duration:215,ease:"Quad.easeOut"});
    }
    // Debris shards (pooled triangles via lines) — mobilde azalt
    const debrisCount=_IS_MOBILE ? 3 : (sz>=1.5?8:6);
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
    const sparkCount=_IS_MOBILE ? 2 : (sz>=1.5?8:5);
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
    // Ground stain
    S.time.delayedCall(80,()=>{
        const st=_POOL.get(5); if(!st) return;
        st.fillStyle(0x111111,0.32);
        st.fillEllipse(0,0,28*sz,8*sz);
        st.setPosition(x,y);
        _pt(S,st,{alpha:0,duration:1700,delay:380,ease:"Sine.easeIn"});
    });
}

function spawnHitDebris(S,x,y,type,isCrit){
    if(!S || !canSpawnParticle(isCrit?"high":"normal")) return;

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

    // ── Impact burst halkası ──────────────────────────────────
    {
        const br=S.add.graphics().setDepth(22);
        br.x=x; br.y=y;
        br.lineStyle(isCrit?2:1.5, isCrit?baseCol:0xffffff, isCrit?0.90:0.70);
        br.strokeCircle(0,0,isCrit?6:4);
        S.tweens.add({targets:br,scaleX:isCrit?4.5:3.2,scaleY:isCrit?4.5:3.2,alpha:0,
            duration:isCrit?180:120,ease:"Quad.easeOut",onComplete:()=>br.destroy()});
        if(isCrit){
            const br2=S.add.graphics().setDepth(21);
            br2.x=x; br2.y=y;
            br2.lineStyle(1.2,0xffffff,0.55); br2.strokeCircle(0,0,3);
            S.tweens.add({targets:br2,scaleX:6.0,scaleY:6.0,alpha:0,duration:240,
                ease:"Cubic.easeOut",onComplete:()=>br2.destroy()});
        }
    }

    // ── Çizgi parçacıklar ─────────────────────────────────────
    const lineCnt=isCrit?7:4;
    for(let i=0;i<lineCnt;i++){
        const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        const sp=Phaser.Math.Between(isCrit?28:14,isCrit?85:48);
        const col=i%3===0?baseCol:i%3===1?0xffffff:isCrit?0xffee44:baseCol;
        const d=S.add.graphics().setDepth(17);
        d.x=x+Phaser.Math.Between(-4,4); d.y=y+Phaser.Math.Between(-4,4);
        d.lineStyle(isCrit?2:1.2,col,isCrit?0.90:0.80);
        const len=isCrit?Phaser.Math.Between(3,6):Phaser.Math.Between(2,4);
        d.lineBetween(0,0,Math.cos(ang)*len,Math.sin(ang)*len);
        S.tweens.add({targets:d,x:d.x+Math.cos(ang)*sp,y:d.y+Math.sin(ang)*sp*0.6,
            scaleX:0.05,scaleY:0.05,alpha:0,
            duration:Phaser.Math.Between(150,isCrit?340:220),
            ease:"Quad.easeOut",onComplete:()=>d.destroy()});
    }

    // ── Zemine düşen kırık çip parçacıklar ───────────────────
    // Parçalar yukarı fırlar, yere düşer — yerçekimi hissi.
    // ease:"Quad.easeIn" = hızlanan düşüş taklidi.
    const chipCnt=isCrit?5:3;
    for(let i=0;i<chipCnt;i++){
        const sz=isCrit?Phaser.Math.Between(2,4):Phaser.Math.Between(1,3);
        const chipCol=i%2===0?baseCol:0xffffff;
        const ch=S.add.graphics().setDepth(16);
        ch.x=x+Phaser.Math.Between(-6,6);
        ch.y=y+Phaser.Math.Between(-4,4);
        ch.fillStyle(chipCol,isCrit?0.92:0.80);
        ch.fillRect(-sz/2,-sz/2,sz,sz);
        const vx=Phaser.Math.Between(-60,60);
        const landY=y+Phaser.Math.Between(55,110);
        const dur=Phaser.Math.Between(200,isCrit?420:300);
        S.tweens.add({targets:ch,
            x:ch.x+vx*0.45,
            y:landY,
            angle:Phaser.Math.Between(-220,220),
            alpha:0,scaleX:0.06,scaleY:0.06,
            duration:dur,
            ease:"Quad.easeIn",
            onComplete:()=>ch.destroy()});
    }

    // ── Kıvılcımlar ──────────────────────────────────────────
    const sparkCnt=isCrit?3:1;
    for(let i=0;i<sparkCnt;i++){
        const sang=Phaser.Math.DegToRad(Phaser.Math.Between(-175,-5));
        const ssp=Phaser.Math.Between(22,isCrit?60:35);
        const sp2=S.add.graphics().setDepth(19);
        sp2.x=x+Phaser.Math.Between(-3,3); sp2.y=y+Phaser.Math.Between(-3,3);
        sp2.lineStyle(isCrit?1.5:1,isCrit?0xffee44:0xffffbb,isCrit?0.90:0.75);
        sp2.lineBetween(0,isCrit?-4:-3,0,isCrit?4:3);
        S.tweens.add({targets:sp2,x:sp2.x+Math.cos(sang)*ssp,y:sp2.y+Math.sin(sang)*ssp*0.5,
            alpha:0,scaleY:0.15,duration:Phaser.Math.Between(100,isCrit?200:150),
            ease:"Quad.easeOut",onComplete:()=>sp2.destroy()});
    }
}

function spawnImpact(S,x,y){
    // Kum / toprak parçacıkları — yarı daire yukarı
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
    // Şok halkası — yatık elips (zemine yansıyan)
    const sw=S.add.graphics().setDepth(6);
    sw.x=x; sw.y=y;
    sw.lineStyle(1.5,0xddcc99,0.7); sw.strokeEllipse(0,0,6,2);
    S.tweens.add({targets:sw,scaleX:5,scaleY:5,alpha:0,duration:200,ease:"Quad.easeOut",onComplete:()=>sw.destroy()});
    // Toz bulutu — hafif gri/bej dikdörtgen
    const dc=S.add.graphics().setDepth(5);
    dc.x=x; dc.y=y;
    dc.fillStyle(0xccbb88,0.22); dc.fillEllipse(0,0,20,8);
    S.tweens.add({targets:dc,scaleX:2.8,scaleY:2.0,alpha:0,y:y-4,duration:280,ease:"Quad.easeOut",onComplete:()=>dc.destroy()});
}
// [VISUAL] Global hit text count limiter — prevents screen spam
// ═══════════════════════════════════════════════════════════════
// ★ FLOATING TEXT SİSTEMİ — Priority tabanlı, spam-free
// ═══════════════════════════════════════════════════════════════
// Priority seviyeleri: 0=LOW, 1=NORMAL, 2=IMPORTANT, 3=CRITICAL
const FT_LOW       = 0;
const FT_NORMAL    = 1;
const FT_IMPORTANT = 2;
const FT_CRITICAL  = 3;

const _ftActive = [];        // { obj, priority, tween }
const _ftMaxSlots = 3;       // aynı anda max 3 text
let   _ftPerfectLast = 0;    // perfect hit cooldown timestamp
const _ftPerfectCooldown = 400; // ms

// Merge buffer: aynı prefix'li LOW textleri birleştir
const _ftMergeBuf = {}; // { key: {S, x, y, total, timer} }

function _ftEvict(){
    // Slot doluysa: önce LOW, sonra NORMAL sil
    for(const pri of [FT_LOW, FT_NORMAL]){
        const idx = _ftActive.findIndex(e => e.priority === pri);
        if(idx !== -1){
            const e = _ftActive.splice(idx, 1)[0];
            try{ if(e.tween) e.tween.stop(); }catch(ex){}
            // [BUG FIX] allObjs içindeki tüm objeleri (glow dahil) destroy et
            // Sadece e.obj destroy edilirse glow ekranda sonsuza kalır
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
        (text.includes("MÜKEMMEL")||text.includes("PERFECT")||text.includes("TAM")||text.includes("HArika")||text.includes("bullseye"));
    if(isPerfect){
        const now = Date.now();
        if(now - _ftPerfectLast < _ftPerfectCooldown) return;
        _ftPerfectLast = now;
    }

    // Slot yönetimi
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
        fs=15; depth=36; strokeTh=4; riseY=50; stayDur=500; fadeDur=380; scaleIn=1.15;
        textCol="#ffeecc"; strokeCol="#000000"; glowCol="#ffaa44";
    } else if(priority === FT_NORMAL){
        fs=isPerfect?17:13; depth=32; strokeTh=4; riseY=40; stayDur=300; fadeDur=280;
        scaleIn=isPerfect?1.25:1.05;
        textCol=isPerfect?"#ffee44":"#ffffcc"; strokeCol="#000000"; glowCol=isPerfect?"#ffcc00":null;
    } else {
        fs=10; depth=25; strokeTh=0; riseY=22; stayDur=180; fadeDur=200; scaleIn=0.95;
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
    // Giriş açısı: hafif eğik başla, dik gel
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

                            // ── SAĞ-SOL SALLAMA (swing) ────────────────
                            // CRITICAL ve IMPORTANT + perfect için sağ-sol titre
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

// ── MERGE SİSTEMİ — hızlı gelen gold/xp textlerini birleştir ──
function showMergedLow(S, prefix, amount, x, y, color){
    const key = prefix;
    const now = Date.now();
    if(_ftMergeBuf[key] && (now - _ftMergeBuf[key].startTime) < 600){
        _ftMergeBuf[key].total += amount;
        _ftMergeBuf[key].x = x;
        _ftMergeBuf[key].y = y;
    } else {
        _ftMergeBuf[key] = { total:amount, x, y, color, startTime:now, S };
        // 600ms sonra göster
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

// ── GERİYE UYUMLU WRAPPER — eski showHitTxt çağrıları çalışmaya devam eder ──
let _hitTxtCount = 0;
const MAX_HIT_TXT = 6;
function showHitTxt(S, x, y, msg, color, large){
    if(!S||!S.add) return;

    // Priority belirle
    let priority = FT_LOW;
    if(large) priority = FT_IMPORTANT;

    // CRITICAL tespiti
    if(msg && (
        msg.includes("EVRİM")||msg.includes("EVOLUTION")||msg.includes("ЭВОЛЮЦИЯ")||
        msg.includes("DİRİLİŞ")||msg.includes("PHOENIX")||msg.includes("GODLIKE")||
        msg.includes("UNSTOPPABLE")
    )) priority = FT_CRITICAL;

    // IMPORTANT tespiti
    if(msg && (
        msg.includes("SEVİYE")||msg.includes("LEVEL")||msg.includes("УРОВЕНЬ")||
        msg.includes("BOSS")||msg.includes("ELİT")||msg.includes("DEV YIKILDI")||
        msg.includes("SİNERJİ")||msg.includes("SYNERGY")||msg.includes("BUILD")||
        msg.includes("OVERLOAD")||msg.includes("AKINI")||msg.includes("KAOS")||
        msg.includes("HAYATTA")||msg.includes("BLITZ")||msg.includes("DEMIR")||
        msg.includes("ZIRH")||msg.includes("extraLife")||msg.includes("✦ DİRİLİŞ")
    )) priority = FT_IMPORTANT;

    // NORMAL tespiti
    if(msg && (
        msg.includes("MÜKEMMEL")||msg.includes("PERFECT")||msg.includes("TAM")||
        msg.includes("HArika")||msg.includes("bullseye")||msg.includes("KOMBO")||
        msg.includes("COMBO")
    )) priority = FT_NORMAL;

    // LOW/NORMAL gold/xp küçük textleri gizle — particle ile yeterli
    if(!large && msg && (
        msg.startsWith("+") && (msg.includes("⬡")||msg.includes("gold")||msg.includes("altın")) &&
        !msg.includes("Reddetme") && !msg.includes("Bonus")
    )) return; // küçük gold textleri → sadece particle

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

    // Arkadaki menü butonlarını devre dışı bırak
    if(scene._menuHitZones){
        scene._menuHitZones.forEach(h=>{ try{h.disableInteractive();}catch(_){} });
    }

    // Dim overlay — tüm ekranı kaplar, input'u bloklar
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
        // Arkadaki menü butonlarını yeniden etkinleştir
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

    // sc: 1.0 = normal, 1.04 = hover — koordinatlar merkez(cx,cy)'den hesaplanır, kayma olmaz
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
        // Kısa press-down efekti — callback hemen tetiklenir, animasyon arka planda biter
        scene.tweens.add({
            targets:d, sc:0.96, duration:50, ease:"Quad.easeOut",
            onUpdate:()=>drawFace(false, d.sc),
            onComplete:()=>{
                callback(); // animasyon bitmeden hemen çağır
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
    }

    create(){
        // [FIX] Pause → Main Menu → Play arası _goGameFired sıfırla
        // scene.start() aynı instance'ı yeniden kullandığı için önceki true değeri kalıyordu
        this._goGameFired = false;

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
        const title = this.add.text(CX, stripCY, "NOT TODAY", NT_STYLE.title(40)).setOrigin(0.5).setDepth(6);
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
        // Breathing scale kaldırıldı — title sabit durur

        // Buttons — divide teal content area into 4 equal slots
        const aTop  = pTop + m.stripH + 8;
        const aBot  = pBot - 14;
        const slot  = (aBot - aTop) / 4;
        const DEFS  = [
            {icon:"mm_play",    label:"PLAY",        cb:()=>this._goGame()},
            {icon:"mm_settings",label:"SETTINGS",    cb:()=>this._showSettings()},
            {icon:"mm_howto",   label:"HOW TO PLAY", cb:()=>this._showHowTo()},
            {icon:"mm_lb",      label:"LEADERBOARD", cb:()=>this._showLeaderboard()},
        ];
        // Phaser glyph warm-up: tüm buton labellarını invisible text olarak render et
        // Phaser'ın internal canvas'ı glyphleri cache'e alır → gerçek butonlar siyah çıkmaz
        const _warmLabels = ["PLAY","SETTINGS","HOW TO PLAY","LEADERBOARD",
                             "RESUME","MAIN MENU","PAUSED","STATS","NOT TODAY"];
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

        // Hit zone'ları sakla — popup açılınca devre dışı bırakmak için
        this._menuHitZones = btns.map(b=>b.hit);
        // Buton label text'lerini başta gizle — warm-up bittikten sonra göster (PC siyah kutu fix)
        btns.forEach(b=>{ if(b.tx) b.tx.setVisible(false); });
        this.time.delayedCall(160, ()=>{ btns.forEach(b=>{ try{ if(b.tx&&!b.tx.destroyed) b.tx.setVisible(true); }catch(_){} }); });

        // Smooth texture filter
        this.time.delayedCall(80,  ()=>this._smooth());
        this.time.delayedCall(500, ()=>this._smooth());

        // ── HIGH SCORE — ortada, panel üstünde ────────────────────────
        {
            const hs = parseInt(localStorage.getItem("nt_highscore")||"0");
            if(hs > 0){
                const hsY = pTop - 30;
                const hsW = 176;
                const R   = 15;

                const hsGlowG = this.add.graphics().setDepth(4).setAlpha(0);
                const hsBgG   = this.add.graphics().setDepth(5).setAlpha(0);

                const _drawHs = (v) => {
                    hsBgG.clear();
                    hsBgG.fillStyle(0xffaa00, 0.12+v*0.06);
                    hsBgG.fillRoundedRect(CX-hsW/2, hsY-15, hsW, 30, R);
                    hsBgG.lineStyle(1.8+v*0.8, 0xFFD700, 0.85+v*0.10);
                    hsBgG.strokeRoundedRect(CX-hsW/2, hsY-15, hsW, 30, R);
                    hsBgG.fillStyle(0xffffff, 0.09);
                    hsBgG.fillRoundedRect(CX-hsW/2+6, hsY-12, hsW-12, 8, {tl:R-2,tr:R-2,bl:0,br:0});
                };
                _drawHs(0);

                const hsTxt = this.add.text(CX, hsY, "🏆  "+hs.toLocaleString(), {
                    fontFamily:"LilitaOne,Arial,sans-serif", fontSize:"15px",
                    color:"#FFD700", stroke:"#000", strokeThickness:2
                }).setOrigin(0.5).setDepth(6).setAlpha(0);

                this.tweens.add({targets:[hsBgG,hsTxt], alpha:1, duration:400, delay:420, ease:"Quad.easeOut"});
                this.tweens.add({targets:hsGlowG, alpha:1, duration:500, delay:420});

                const _hd={v:0};
                this.tweens.add({targets:_hd,v:1,duration:1700,ease:"Sine.easeInOut",yoyo:true,repeat:-1,delay:800,
                    onUpdate:()=>{
                        _drawHs(_hd.v);
                        hsGlowG.clear();
                        hsGlowG.lineStyle(4+_hd.v*6, 0xffcc00, 0.05+_hd.v*0.20);
                        hsGlowG.strokeRoundedRect(CX-hsW/2-5, hsY-20, hsW+10, 40, R+5);
                        hsGlowG.lineStyle(1.5, 0xffee88, 0.04+_hd.v*0.12);
                        hsGlowG.strokeRoundedRect(CX-hsW/2-10, hsY-25, hsW+20, 50, R+10);
                    }
                });
                this.tweens.add({targets:hsTxt, alpha:{from:0.82,to:1},
                    duration:1700, ease:"Sine.easeInOut", yoyo:true, repeat:-1, delay:800});
            }
        }

        // ── GOLD — sağ üst köşe, sadece ikon + sayı, arka plan yok ────
        {
            if(!this.textures.exists("tex_gold_icon")){
                const _gc=document.createElement("canvas");
                _gc.width=20; _gc.height=20;
                const _gctx=_gc.getContext("2d");
                _gctx.clearRect(0,0,20,20);
                _gctx.strokeStyle="#CC8800"; _gctx.lineWidth=2.5; _gctx.strokeRect(3,3,14,14);
                _gctx.strokeStyle="#FFD700"; _gctx.lineWidth=1.5; _gctx.strokeRect(6,6,8,8);
                this.textures.addCanvas("tex_gold_icon",_gc);
            }

            const _gStr = PLAYER_GOLD.toLocaleString();
            const _gY   = 20;
            const ICON  = 16;

            // Sayıyı önce oluştur, genişliğini öğren, ikonla bitişik hizala
            const gTxt = this.add.text(W-8, _gY, _gStr, {
                fontFamily:"LilitaOne,Arial,sans-serif", fontSize:"15px",
                color:"#FFD700", stroke:"#000", strokeThickness:2
            }).setOrigin(1, 0.5).setDepth(8).setAlpha(0);

            // İkon: sayının hemen soluna yapışık
            const gIcon = this.add.image(W-8-gTxt.width-4-ICON/2, _gY, "tex_gold_icon")
                .setDisplaySize(ICON,ICON).setDepth(8).setAlpha(0);

            this.tweens.add({targets:[gIcon,gTxt], alpha:1, duration:380, delay:460, ease:"Quad.easeOut"});
        }

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
            ["mm_bg","mm_panel","mm_small","mm_play","mm_settings","mm_howto","mm_lb"].forEach(k=>{
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
        // Buton çift tıklama koruması
        if(this._goGameFired) return;
        this._goGameFired = true;
        NT_SFX.play("menu_click");
        // Menü butonlarını devre dışı bırak
        if(this._menuHitZones){
            this._menuHitZones.forEach(h=>{ try{ h.disableInteractive(); }catch(_){} });
        }
        // Hafif fade-out (300ms) sonra sahneyi başlat
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", ()=>{
            this.scene.start("SceneGame");
        });
    }

    // ── Settings — use mm_panel (large) for more room ─────────────────
    _showSettings(){
        // Use mm_panel (340px wide) centered slightly higher to leave room
        const {A,close,pTop,pBot,stripCY,contentTop,contentBot,TX,VX,PW,CX,depth}
            = NT_OpenPopup(this,"mm_panel",330,"⚙  SETTINGS",310,20);

        let ly=contentTop+8;
        const _row=(lbl,getV,toggle)=>{
            A(this.add.text(TX,ly,lbl,NT_STYLE.body(17)).setOrigin(0,0.5).setDepth(depth+3));
            const col=()=>getV()?"#44ff88":"#ff5555";
            const vt=A(this.add.text(VX,ly,getV()?"ON":"OFF",NT_STYLE.accent(17,col())).setOrigin(1,0.5).setDepth(depth+3).setInteractive({useHandCursor:true}));
            vt.on("pointerdown",()=>{ NT_SFX.play("menu_click"); toggle(); vt.setText(getV()?"ON":"OFF"); vt.setColor(col()); });
            ly+=46;
        };
        _row("SFX",          ()=>window._nt_sfx_enabled!==false,   ()=>{window._nt_sfx_enabled  =window._nt_sfx_enabled===false;});
        _row("MUSIC",        ()=>window._nt_music_enabled!==false, ()=>{
            window._nt_music_enabled=window._nt_music_enabled===false;
            if(window._nt_music_enabled!==false){ NT_SFX.startMusic(); } else { NT_SFX.stopMusic(true); }
        });
        _row("SCREEN SHAKE", ()=>window._nt_screen_shake!==false,  ()=>{window._nt_screen_shake =window._nt_screen_shake===false;});
        ly+=12;

        // ── SFX / MUSIC VOLUME SLIDERS (compact, kutu içinde ortalı) ────
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
        // LANGUAGE row — label left, buttons evenly inside panel
        A(this.add.text(TX,ly,"LANGUAGE",NT_STYLE.body(17)).setOrigin(0,0.5).setDepth(depth+3));
        // Lang buttons: centered in right half, safely inside panel
        const langBtns=[]; const langGfx=[];
        ["tr","en"].forEach((lg,i)=>{
            const bx=CX+20+i*60;   // right side, spaced 60px, well inside 330px panel
            const lb=A(this.add.graphics().setDepth(depth+3));
            const _d=()=>{lb.clear();lb.fillStyle(CURRENT_LANG===lg?0x44aaff:0x225577,1);lb.fillRoundedRect(bx-26,ly-17,52,34,8);};
            _d();
            langGfx.push({lb,_d,lg});
            const lt=A(this.add.text(bx,ly,lg.toUpperCase(),NT_STYLE.body(15)).setOrigin(0.5).setDepth(depth+4).setInteractive({useHandCursor:true}));
            lt.on("pointerdown",()=>{ NT_SFX.play("menu_click"); CURRENT_LANG=lg; langGfx.forEach(x=>x._d()); });
        });
    }

    // ── How To Play ───────────────────────────────────────────────────
    _showHowTo(){
        const {A,close,contentTop,contentBot,TX,CX,PW,depth}
            = NT_OpenPopup(this,"mm_panel",330,"❓  HOW TO PLAY",320,20);
        let ly=contentTop+6;
        [
            ["🎯","GOAL",       "Destroy pyramids before they hit the ground!"],
            ["⬅➡","MOVE",      "Tap screen sides or ← → arrow keys."],
            ["🔫","SHOOT",      "Fire button or SPACE to shoot."],
            ["💥","CENTER HIT", "Dead center = 3× damage bonus!"],
            ["⭐","LEVEL UP",   "Collect XP orbs → pick a power-up."],
            ["🔗","EVOLUTION",  "Max 2 matching upgrades → Evolution!"],
            ["💀","COMBO",      "Kill fast → combo → more XP & gold!"],
            ["🍎","APPLE",      "Rare drops = +3 HP."],
        ].forEach(([ico,ttl,desc])=>{
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
            = NT_OpenPopup(this,"mm_panel",330,"🏆  LEADERBOARD",320,20, ()=>{ _lbClosed=true; });
        const hY=contentTop+4;
        A(this.add.text(TX,    hY,"#",     NT_STYLE.stat(12)).setOrigin(0,0).setDepth(depth+3));
        A(this.add.text(TX+28, hY,"PLAYER",NT_STYLE.stat(12)).setOrigin(0,0).setDepth(depth+3));
        A(this.add.text(VX,    hY,"SCORE", NT_STYLE.stat(12)).setOrigin(1,0).setDepth(depth+3));
        const dg=A(this.add.graphics().setDepth(depth+3));
        dg.lineStyle(1,0x44aaff,0.30); dg.lineBetween(TX,hY+18,VX,hY+18);

        const loadTxt=A(this.add.text(CX,hY+55,"⏳  Loading...",NT_STYLE.body(15)).setOrigin(0.5).setDepth(depth+3));
        lbFetchScores().then(()=>{
            try{if(loadTxt&&!loadTxt.destroyed)loadTxt.destroy();}catch(_){}
            if(_lbClosed) return;
            const myId=(_TG_USER&&_TG_USER.id)||null;
            const scores=lbGetMergedScores().slice(0,12);
            const newTexts=[];

            if(scores.length===0){
                newTexts.push(A(this.add.text(CX,hY+55,"No scores yet!",NT_STYLE.body(15)).setOrigin(0.5).setDepth(depth+3).setAlpha(0)));
            } else {
                let ry=hY+26;
                scores.forEach((s,i)=>{
                    if(ry+22>contentBot) return;
                    const isMe=s.id===myId;
                    const col=i===0?"#ffcc00":i===1?"#cccccc":i===2?"#cc8833":"#ddeeff";
                    newTexts.push(A(this.add.text(TX,    ry,"#"+(i+1),  NT_STYLE.accent(13,col)           ).setOrigin(0,0.5).setDepth(depth+3).setAlpha(0)));
                    newTexts.push(A(this.add.text(TX+28, ry,(s.name||"???")+(isMe?" ★":""), NT_STYLE.accent(13,isMe?"#44ff88":"#fff")).setOrigin(0,0.5).setDepth(depth+3).setAlpha(0)));
                    newTexts.push(A(this.add.text(VX,    ry,s.score.toLocaleString(),       NT_STYLE.accent(13,col)           ).setOrigin(1,0.5).setDepth(depth+3).setAlpha(0)));
                    ry+=26;
                });
            }
            // 2 frame bekle → font glyphleri rasterize edilsin, sonra göster
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
        this.load.image("ui_pause_win",  "assets/ui/Pause window.png");
        this.load.image("ui_btn_wide_g", "assets/ui/Yellow Wide button.png");
        this.load.image("ui_confirm",    "assets/ui/Confirm (4).png");
        this.load.image("ui_decline",    "assets/ui/Decline (4).png");
        this.load.image("pyramid",      "assets/pyramid.png");
        this.load.image("zigzag",       "assets/zigzag.png");

        // ── UPGRADE ICONS — assets/Icons/ klasöründen, dosya adı = upgrade key ──
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
        this.load.spritesheet("idle",  "assets/Idle.png",  {frameWidth:32, frameHeight:34});  // 200x34 → 6 kare (32px aralıklı)
        this.load.spritesheet("run",   "assets/Run.png",   {frameWidth:32, frameHeight:32});  // 320x32 → 10 kare
        this.load.spritesheet("death", "assets/Death.png", {frameWidth:40, frameHeight:40});  // 320x40 → 8 kare
        this.load.spritesheet("get_damage", "assets/get_damage.png", {frameWidth:33, frameHeight:30}); // 132x30 → 4 kare
        // ── PATLAMA SPRITE SHEET ──
        this.load.spritesheet("explosion",  "assets/Explosion.png", {frameWidth:64, frameHeight:64});  // 256x256 → 4x4=16 kare
        this.load.spritesheet("exp1", "assets/exp1.png", {frameWidth:32, frameHeight:32}); // 352x32 → 11 kare
        this.load.spritesheet("exp2", "assets/exp2.png", {frameWidth:32, frameHeight:32}); // 192x32 → 6 kare
        this.load.spritesheet("exp3", "assets/exp3.png", {frameWidth:72, frameHeight:72}); // 1152x72 → 16 kare
        // ── HIT SMOKE — bullet impact duman animasyonları ──
        this.load.spritesheet("smoke",  "assets/smoke.png",  {frameWidth:64, frameHeight:60});  // 768x60  → 12 kare
        this.load.spritesheet("smoke2", "assets/smoke2.png", {frameWidth:64, frameHeight:64});  // 768x329 → 5×12 grid


        // ── FONT PRELOAD — Phaser text render edilmeden önce LilitaOne yüklü olmalı ──
        // Görünmez canvas üzerinde warm-up render → tarayıcı font cache'e alır
        try{
            if(!document.getElementById("nt-font-warmup")){
                const fc = document.createElement("canvas");
                fc.id = "nt-font-warmup";
                fc.width = 4; fc.height = 4;
                fc.style.cssText = "position:absolute;left:-9999px;top:-9999px;pointer-events:none;";
                document.body.appendChild(fc);
                const ctx = fc.getContext("2d");
                // Her ağırlık/boyut kombinasyonunu render et — tarayıcı font varyantlarını cache'ler
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
        // [UX] Sahne başlangıcında timeScale sıfırla — önceki oyundan kalıntı önle
        this.time.timeScale=1.0;
        // [CRASH FIX] Physics'in önceki oturumdan pause'da kalmasını önle.
        try{ this.physics.resume(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        _upgradeLock=0;
        _levelUpChoosing=false;

        // ── _openPanel setter — panel açılınca butonları otomatik gizle ──────
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

        // ── SCENE SHUTDOWN CLEANUP — memory leak önleme ───────
        this.events.once("shutdown", ()=>{
            try{
                // Tüm tween'leri durdur
                this.tweens.killAll();
                // Time event'lerini temizle
                this.time.removeAllEvents();
                // Wheel listener temizle
                if(this.input&&this.input.off) this.input.off("wheel");
                // _activeEnemies cache temizle
                if(this._enemyCacheTimer) this._enemyCacheTimer.remove();
                this._activeEnemies=[];
                // Flame/ring grafikleri temizle
                // [v9.3] flameRing kaldırıldı
                if(this.playerGlow) try{this.playerGlow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this.hpBarGfx) try{this.hpBarGfx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this.xpBarBg) try{this.xpBarBg.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this.xpBarFill) try{this.xpBarFill.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                // [FIX] Sarı şerit kalıntıları — xpBar yardımcı nesneleri temizle
                if(this.xpBarGlow) try{this.xpBarGlow.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this._xpBarShine) try{this._xpBarShine.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this._xpBarPulse) try{this._xpBarPulse.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                // [FIX] HUD yazıları temizle
                if(this.levelText) try{this.levelText.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this.goldText) try{this.goldText.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                // [FIX] Laser grafiği temizle
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
                // [FIX] Açık panel varsa kapat (setter üzerinden — defineProperty ile tanımlı)
                try{ this._openPanel = null; }catch(e){}
                if(this.comboText) try{this.comboText.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this.scoreText) try{this.scoreText.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this._evoHintText) try{this._evoHintText.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                this._evoHintText = null;
                // Physics grupları temizle
                if(this.bullets) try{this.bullets.clear(true,true);}catch(e){console.warn("[NT] Hata yutuldu:",e)}
                if(this.xpOrbs) this.xpOrbs=[];
                _debrisCount=0;
                _dmgNumCount=0;
                // [Artifact cleanup kaldırıldı — v9.1]
                // [CRASH FIX] Global lock state'i sıfırla — bir sonraki oyun başlangıcında
                // önceki oturumdan kalan _upgradeLock>0 veya _microFreeze=true durumu
                // physics'in pause'da kalmasına neden olabilir.
                _upgradeLock=0;
                _levelUpChoosing=false;
                _chaosParticleTimer=0;
                GS=null;
            }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        });

        buildTextures(this);

        // ── TEXTURE FILTERS ──
        // pixelArt:false modunda: upicon_ → trilinear mipmap, idle/run → NEAREST, diğerleri → LINEAR
        const _applyIconLinear = () => {
            try{
                const gl = this.renderer && this.renderer.gl;
                if(!gl) return;
                this.textures.getTextureKeys().forEach(k=>{
                    if(k==='__DEFAULT'||k==='__MISSING') return;
                    const isCharacter    = (k==='idle' || k==='run' || k==='death');
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
                                    // Anisotropic filtering — keskinlik için
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
                                    // Diğer PNG'ler — LINEAR
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
        // [FIX] Birden fazla retry — ikonlar async yüklenir, ilk çağrı bazı texture'ları atlar
        this.time.delayedCall(100,  _applyIconLinear);
        this.time.delayedCall(400,  _applyIconLinear);
        this.time.delayedCall(1000, _applyIconLinear);

        // [SETTINGS] Ekran sarsıntısı ayarı — shake çağrılarını override et
        // Global intensity cap: max 0.008 — gözü yormayan kontrollü shake
        const _origShake=this.cameras.main.shake.bind(this.cameras.main);
        this.cameras.main.shake=function(duration,intensity,...args){
            if(window._nt_screen_shake===false) return;
            const safeIntensity=Math.min(intensity||0, 0.008); // hard cap
            const safeDuration=Math.min(duration||0, 120);     // max 120ms
            if(safeIntensity<=0) return;
            return _origShake(safeDuration,safeIntensity,...args);
        };

        // Animasyonlar
        if(!this.anims.exists("anim_idle"))  this.anims.create({key:"anim_idle",  frames:this.anims.generateFrameNumbers("idle",  {start:0,end:5}),  frameRate:8,  repeat:-1});
        if(!this.anims.exists("anim_run"))   this.anims.create({key:"anim_run",   frames:this.anims.generateFrameNumbers("run",   {start:0,end:7}),  frameRate:14, repeat:-1});
        if(!this.anims.exists("anim_death")) this.anims.create({key:"anim_death", frames:this.anims.generateFrameNumbers("death", {start:0,end:7}),  frameRate:12, repeat:0});
        // anim_damage — sadece texture yüklüyse oluştur
        if(!this.anims.exists("anim_damage") && this.textures.exists("get_damage"))
            this.anims.create({key:"anim_damage", frames:this.anims.generateFrameNumbers("get_damage",{start:0,end:3}), frameRate:14, repeat:0});
        if(!this.anims.exists("anim_expl"))  this.anims.create({key:"anim_expl",  frames:this.anims.generateFrameNumbers("explosion", {start:0,end:15}), frameRate:18, repeat:0});
        if(!this.anims.exists("anim_exp1"))  this.anims.create({key:"anim_exp1",  frames:this.anims.generateFrameNumbers("exp1", {start:0,end:10}), frameRate:16, repeat:0});
        if(!this.anims.exists("anim_exp2"))  this.anims.create({key:"anim_exp2",  frames:this.anims.generateFrameNumbers("exp2", {start:0,end:5}),  frameRate:14, repeat:0});
        if(!this.anims.exists("anim_exp3"))  this.anims.create({key:"anim_exp3",  frames:this.anims.generateFrameNumbers("exp3", {start:0,end:15}), frameRate:18, repeat:0});
        if(!this.anims.exists("anim_break")) this.anims.create({key:"anim_break", frames:this.anims.generateFrameNumbers("pyramid_break",{start:0,end:2}),frameRate:10,repeat:0});
        // ── HIT SMOKE ANİMASYONLARI — mermi çarpma efekti (6 varyant) ──
        // smoke.png: 12 kare tek satır
        if(this.textures.exists("smoke")){
            if(!this.anims.exists("anim_smoke")) this.anims.create({key:"anim_smoke", frames:this.anims.generateFrameNumbers("smoke",{start:0,end:11}), frameRate:36, repeat:0});
        }
        // smoke2.png: 5 satır × 12 sütun → 5 farklı animasyon tipi
        if(this.textures.exists("smoke2")){
            if(!this.anims.exists("anim_smoke2a")) this.anims.create({key:"anim_smoke2a", frames:this.anims.generateFrameNumbers("smoke2",{start:0, end:11}), frameRate:34, repeat:0}); // yıldız/spark
            if(!this.anims.exists("anim_smoke2b")) this.anims.create({key:"anim_smoke2b", frames:this.anims.generateFrameNumbers("smoke2",{start:12,end:23}), frameRate:32, repeat:0}); // blob/nokta
            if(!this.anims.exists("anim_smoke2c")) this.anims.create({key:"anim_smoke2c", frames:this.anims.generateFrameNumbers("smoke2",{start:24,end:35}), frameRate:32, repeat:0}); // swirl 1
            if(!this.anims.exists("anim_smoke2d")) this.anims.create({key:"anim_smoke2d", frames:this.anims.generateFrameNumbers("smoke2",{start:36,end:47}), frameRate:32, repeat:0}); // swirl 2
            if(!this.anims.exists("anim_smoke2e")) this.anims.create({key:"anim_smoke2e", frames:this.anims.generateFrameNumbers("smoke2",{start:48,end:59}), frameRate:32, repeat:0}); // swirl 3
        }

        // Yeni piramit tipleri pyramid_break animasyonunu kullanir

        // GS başlat
        const sv=JSON.parse(localStorage.getItem("nt_shop")||"{}");
        GOLD_UPGRADES.forEach(u=>{u.level=sv[u.id]||0;});
        Object.keys(UPGRADES).forEach(k=>UPGRADES[k].level=0);
        EVOLUTIONS.forEach(e=>e.active=false);
        SYNERGIES.forEach(s=>s.active=false); // [BUG FIX] Sinerji state'i sıfırla — önceki oyundan kalıntı önleme

        GS={
            health: 6+(GOLD_UPGRADES.find(u=>u.id==="start_hp")?.level||0)*3,
            maxHealth: 6+(GOLD_UPGRADES.find(u=>u.id==="start_hp")?.level||0)*3,
            damage: 1.2*(1+(GOLD_UPGRADES.find(u=>u.id==="start_dmg")?.level||0)*0.15), // erken oyun: biraz daha güçlü başla
            _baseDamage: 1.2*(1+(GOLD_UPGRADES.find(u=>u.id==="start_dmg")?.level||0)*0.15), // [BALANCE] stored for soft cap reference
            moveSpeed: 230*(1+(GOLD_UPGRADES.find(u=>u.id==="start_spd")?.level||0)*0.10),
            shootDelay:170,        // erken oyun daha responsive (was 190)
            bulletSpeed:480, bulletScale:1.0, splitLevel:0, pierceCount:0,
            critChance:(GOLD_UPGRADES.find(u=>u.id==="crit_start")?.level||0)*0.05,
            critMult:2.0, knockback:0, freezeChance:0,
            xp:0, xpToNext:28, level:1, // [v10.1] 30→28: ilk level-up biraz daha erken
            _xpPerSecAccum:0, _xpPerSecWindow:0,
            _lastLevelUpTime:-9999,
            _recentOffers:[],
            xpMult: Math.min(1.30, 1.0+(GOLD_UPGRADES.find(u=>u.id==="xp_bonus")?.level||0)*0.15),
            magnetRadius:40, // [v9.4] fixed small auto-collect radius (magnet upgrade removed)
            goldMult: 1.0+(GOLD_UPGRADES.find(u=>u.id==="gold_bonus")?.level||0)*0.18, // [v10.1] 0.25→0.18 exploit önlendi
            gold:0, kills:0, t:0, score:0,
            pyramidSpeed:65, spawnDelay:1400, // erken oyun: YOK DENLİ yavaş başlar (was 90 / 900)
            invincible:false, gameOver:false, pickingUpgrade:false,
            combo:0, comboTimer:0, comboDmgBoost:1.0, comboXpBoost:1.0,
            resonanceDist:45, bossActive:false, _bossKills:0,
            directorPhase:"calm",
            activeWeapon:"default", // [v9.4] weapon transformation system
            orbitAngle:0,            // used by drone orbit positioning
            extraLife:(GOLD_UPGRADES.find(u=>u.id==="extra_life")?.level||0)>0,
            usedExtraLife:false,
            _knockbackTimer:0,
            // [OPT] Evolution cache flag'leri — doShoot hot-path'te EVOLUTIONS.find() çağrısından kaçınmak için
            _evoTriCannon:false, _evoStormCore:false,
            _evoOverload:false,  _evoCryoField:false,  _evoPlagueBearer:false,
            _evoMirrorStorm:false,
            _stormCoreCooldown:false, // [v10.x] Storm Core crit→lightning CD flag
            // ★ YENİ: Sinerji flag'leri
            _synergyCryoShatter:false, _synergyChainStorm:false,
            _synergyDroneShield:false,
            _synergyLaserFocus:false, _synergyWindCure:false,
            // [v9.4] New weapon synergy flags
            _synergyRapidFreeze:false, _synergyCannonPoison:false,
            _synergyPrecisionCrit:false, _synergyChainLightning:false,
            // [v10.0] Reflection Rifle synergy flags
            _synergyReflectFreeze:false, _synergyReflectExplosive:false,
            _droneHitCount:0,
            // Artifact sistemi kaldırıldı — v9.1
            // artifact combo fields removed
            // ★ YENİ: Event sistemi
            _lastEventTime:60000, _eventCooldown:0,
            _eliteHuntCount:0,
            // ★ YENİ: Kristal sistemi
            _crystalReviveUsed:false,
            // ★ YENİ: Yeni event flag'leri
            _glassCannon:false, _glassCannonPipelined:false,
            _dmgBurstActive:false, _survivalModeDebuff:false,
            _chaosSpeedDebuff:false, _blitzMode:false, _blitzXpPenalty:false,
            _xpFrenzyMode:false,
            // ★ YENİ: Mini boss sistemi
            miniBossActive:false, _lastMiniBossTime:120000,
            // ★ YENİ: Görev takip
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
            // ★ YENİ: Çöl kum fırtınası sistemi
            // [BALANCE] Chest and event rate limiters
            _chestOnScreen:false, _lastChestTime:-90000, _lastRunEventTime:0,
            _nextEventJitter:0,
            // Difficulty spike system
            _spikeActive:false, _lastSpikeTime:0, _spawnDelayOverride:0,
            // [VFX] Görsel efekt alanları
            _healFlash:0,           // can alındığında yeşil flash süresi (ms)
            _speedBuffActive:false,  // hız buff aktif (rüzgar efekti için)
            _upgradeGlowTimers:{},   // son alınan upgrade'ler (slot glow için)
        };

        // ── EventManager sıfırla — her yeni run için temiz başlangıç ──
        EventManager._activeEvent = null;
        EventManager._lastEndTime = -EventManager.COOLDOWN;
        EventManager._state = null;
        if(typeof GS !== "undefined" && GS) { try{ GS._recentOffers=[]; }catch(e){console.warn("[NT] Hata yutuldu:",e)} }

        // [ADIM 4] Sahip olunan relicları uygula
        applyOwnedRelics(GS);


        // [v9.2] Pipeline ile başlangıç stat'larını senkronize et
        syncStatsFromPipeline(GS);

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
                                `+${_earlyBonus}G İLK OYUN BONUSU!`, "#ffcc00", true);
                    });
                }
            }
        }catch(e){console.warn("[NT] Hata yutuldu:",e)}

        // ── ARKAPLAN — önce turuncu solid renk (bg image yüklenemezse fallback görünür) ──
        this.add.rectangle(W/2, H/2, W, H, 0xC85A00, 1).setDepth(-11);
        // Arka plan görseli (kullanıcı değiştirdiği versiyon)
        this.add.image(W/2,H/2,"bg").setDisplaySize(W,H).setDepth(-10);
        // Kamera fade-in kaldırıldı — direkt oyuna geçiş

        // Zemin şeridi kaldırıldı

        // ── OYUNCU — tam önceki kodla aynı yere basıyor ──
        this.player=this.physics.add.sprite(W/2,GROUND_Y-24,"idle");
        this.player.setDepth(20).setScale(2.0);
        // Texture filter: postBoot callback'te renderer patch'lendi.
        // idle/run/death texture'ları upload anında NEAREST aldı — bulanıklık yok.
        // Idle: 40x34 px → scale 2 = 80x68 görsel; hitbox oyuna uygun
        this.player.body.setSize(30,30).setOffset(5,4);
        this.player.body.setAllowGravity(false);
        this.player.play("anim_idle");

        this.playerGlow=this.add.graphics().setDepth(19);
        this.hpBarGfx=this.add.graphics().setDepth(21);

        // ── FİZİK GRUPLARI ──
        this.pyramids=this.physics.add.group({classType:Phaser.Physics.Arcade.Sprite,runChildUpdate:false,maxSize:MAX_ENEMIES+10});
        this.bullets=this.physics.add.group({classType:Phaser.Physics.Arcade.Image,maxSize:120,runChildUpdate:false});
        this.sawGroup=this.physics.add.group({classType:Phaser.Physics.Arcade.Image,maxSize:6});
        this.droneGroup=this.physics.add.group({classType:Phaser.Physics.Arcade.Image,maxSize:6});
        // [v9.4] orbitGroup removed — orbit weapon removed

        // [v9.3] flameRing kaldırıldı
        this.laserGfx =this.add.graphics().setDepth(18);
        this.xpOrbs=[];
        this.weaponSlots=[]; this.passiveSlots=[]; this.weaponSlotIcons=[]; this.passiveSlotIcons=[];
        this._weaponSlotOrder=[]; // [FIX] mainweapon slot sırası takibi — slot kaymasını önler

        buildSlotUI(this);
        buildUI(this);
        // ── AAA VFX INIT ──
        initVFX(this);

        // Input
        this.cursors=this.input.keyboard.createCursorKeys();
        // SPACE tuşu — ateş
        this.spaceKey=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        // ESC tuşu — oyun durdur
        this.escKey=this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey.on("down",()=>{ if(GS&&!GS.gameOver&&!GS.pickingUpgrade) showPause(this); });
        // [BUG FIX] A/D alternatif tuşları — yön bug'ına karşı ikincil input kaynağı
        this._altLeft  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this._altRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        // [BUG FIX] Sahne her başladığında tüm key state'lerini temizle
        this.input.keyboard.resetKeys();

        // ── MOBİL KONTROL: ATEŞ BUTONU + DİNAMİK JOYSTICK ──────────
        this._mobileLeft = false;
        this._mobileRight = false;
        this._mobileFire = false;

        const _isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (_isTouchDevice) {
            const W_MB = 360, H_MB = 640;
            // ── TÜM BUTONLAR SAĞ TARAFA HİZALI ──
            const BTN_Y = H_MB - 30;
            this.input.addPointer(3);

            const DIR_BTN_W = 78, DIR_BTN_H = 44, DIR_BTN_R = 10;
            const FIRE_W = 88, FIRE_H = 44, FIRE_R = 10;
            const BTN_GAP = 4;

            // Soldan sağa: Fire (en solda) → Left → Right (en sağda)
            const FIRE_X  = FIRE_W/2 + 6;                                // en solda
            const LEFT_X  = W_MB - 6 - DIR_BTN_W - 10 - DIR_BTN_W/2; // sağdan ikinci (yürüme butonları arası boşluk)
            const RIGHT_X = W_MB - DIR_BTN_W/2 - 6;                     // en sağda
            const FIRE_Y  = BTN_Y;
            const DIR_BTN_Y = BTN_Y;

            const fireG = this.add.graphics().setDepth(800).setScrollFactor(0);
            let _firePressing = false;

            const drawFireBtn = (pressed) => {
                fireG.clear();
                // Gölge
                fireG.fillStyle(0x000000, pressed ? 0.0 : 0.25);
                fireG.fillRoundedRect(FIRE_X - FIRE_W/2 + 2, FIRE_Y - FIRE_H/2 + 4, FIRE_W, FIRE_H, FIRE_R);
                // Ana body
                fireG.fillStyle(0x1a1a2e, pressed ? 0.90 : 0.55);
                fireG.fillRoundedRect(FIRE_X - FIRE_W/2, FIRE_Y - FIRE_H/2, FIRE_W, FIRE_H, FIRE_R);
                // Üst shine
                fireG.fillStyle(0xffffff, pressed ? 0.04 : 0.10);
                fireG.fillRoundedRect(FIRE_X - FIRE_W/2 + 4, FIRE_Y - FIRE_H/2 + 3, FIRE_W - 8, FIRE_H * 0.38, FIRE_R * 0.7);
                // Border — glow efekti
                const borderCol = pressed ? 0xff6644 : 0xff8866;
                const borderAlpha = pressed ? 0.95 : 0.50;
                fireG.lineStyle(pressed ? 2 : 1.5, borderCol, borderAlpha);
                fireG.strokeRoundedRect(FIRE_X - FIRE_W/2, FIRE_Y - FIRE_H/2, FIRE_W, FIRE_H, FIRE_R);
                // İnner glow
                if(pressed){
                    fireG.lineStyle(4, 0xff4422, 0.18);
                    fireG.strokeRoundedRect(FIRE_X - FIRE_W/2 + 3, FIRE_Y - FIRE_H/2 + 3, FIRE_W - 6, FIRE_H - 6, FIRE_R - 2);
                }
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

            // ── SANAL JOYSTICK — Yatay, ince, Vampire Survivors tarzı ──────────
            // Track (arka plan) + Thumb (sürüklenen düğme)
            const JOY_W = 160, JOY_H = 38, JOY_R = 19;
            const JOY_THUMB_W = 44, JOY_THUMB_H = 32, JOY_THUMB_R = 14;
            const JOY_X = W_MB - JOY_W/2 - 6; // sağa hizalı
            const JOY_Y = BTN_Y;
            const JOY_DEAD = 8; // dead zone px — hassasiyeti azalt
            const JOY_HALFTRACK = (JOY_W - JOY_THUMB_W) / 2;

            const joyG = this.add.graphics().setDepth(800).setScrollFactor(0);
            let _joyThumbX = 0; // -1..1 arası normalize edilmiş konum
            let _joyActivePtr = null;

            const _drawJoystick = (thumbNorm) => {
                joyG.clear();
                // Track gölge
                joyG.fillStyle(0x000000, 0.25);
                joyG.fillRoundedRect(JOY_X - JOY_W/2 + 2, JOY_Y - JOY_H/2 + 3, JOY_W, JOY_H, JOY_R);
                // Track ana body
                joyG.fillStyle(0x1a1a2e, 0.55);
                joyG.fillRoundedRect(JOY_X - JOY_W/2, JOY_Y - JOY_H/2, JOY_W, JOY_H, JOY_R);
                // Track üst shine
                joyG.fillStyle(0xffffff, 0.08);
                joyG.fillRoundedRect(JOY_X - JOY_W/2 + 4, JOY_Y - JOY_H/2 + 3, JOY_W - 8, JOY_H * 0.35, JOY_R * 0.7);
                // Track border
                joyG.lineStyle(1.5, 0x5588ff, 0.40);
                joyG.strokeRoundedRect(JOY_X - JOY_W/2, JOY_Y - JOY_H/2, JOY_W, JOY_H, JOY_R);
                // Sol/sağ ok ikonları
                const arrowAlpha = 0.25;
                joyG.fillStyle(0xffffff, arrowAlpha);
                const leftAx = JOY_X - JOY_W/2 + 16, rightAx = JOY_X + JOY_W/2 - 16;
                joyG.fillTriangle(leftAx-6, JOY_Y, leftAx+3, JOY_Y-6, leftAx+3, JOY_Y+6);
                joyG.fillTriangle(rightAx+6, JOY_Y, rightAx-3, JOY_Y-6, rightAx-3, JOY_Y+6);

                // Thumb (sürüklenen düğme)
                const thumbOffset = thumbNorm * JOY_HALFTRACK;
                const thumbCX = JOY_X + thumbOffset;
                const isActive = Math.abs(thumbNorm) > 0.05;
                // Thumb gölge
                if(!isActive){
                    joyG.fillStyle(0x000000, 0.15);
                    joyG.fillRoundedRect(thumbCX - JOY_THUMB_W/2 + 1, JOY_Y - JOY_THUMB_H/2 + 2, JOY_THUMB_W, JOY_THUMB_H, JOY_THUMB_R);
                }
                // Thumb body
                joyG.fillStyle(isActive ? 0x3366cc : 0x2a2a4e, isActive ? 0.92 : 0.75);
                joyG.fillRoundedRect(thumbCX - JOY_THUMB_W/2, JOY_Y - JOY_THUMB_H/2, JOY_THUMB_W, JOY_THUMB_H, JOY_THUMB_R);
                // Thumb shine
                joyG.fillStyle(0xffffff, isActive ? 0.15 : 0.08);
                joyG.fillRoundedRect(thumbCX - JOY_THUMB_W/2 + 4, JOY_Y - JOY_THUMB_H/2 + 3, JOY_THUMB_W - 8, JOY_THUMB_H * 0.38, JOY_THUMB_R * 0.6);
                // Thumb border
                joyG.lineStyle(isActive ? 2 : 1.5, 0x5588ff, isActive ? 0.90 : 0.50);
                joyG.strokeRoundedRect(thumbCX - JOY_THUMB_W/2, JOY_Y - JOY_THUMB_H/2, JOY_THUMB_W, JOY_THUMB_H, JOY_THUMB_R);
                if(isActive){
                    joyG.lineStyle(3, 0x5588ff, 0.15);
                    joyG.strokeRoundedRect(thumbCX - JOY_THUMB_W/2 + 2, JOY_Y - JOY_THUMB_H/2 + 2, JOY_THUMB_W - 4, JOY_THUMB_H - 4, JOY_THUMB_R - 2);
                }
            };
            _drawJoystick(0);

            // Joystick hit area — biraz daha büyük
            const joyHit = this.add.rectangle(JOY_X, JOY_Y, JOY_W + 20, JOY_H + 24, 0xffffff, 0.001)
                .setDepth(802).setScrollFactor(0).setInteractive({ draggable: false });

            const _processJoyPointer = (ptr) => {
                // Pointer X'i joystick koordinatına çevir
                const localX = ptr.x - JOY_X;
                // Dead zone uygula
                let norm = 0;
                if(Math.abs(localX) > JOY_DEAD){
                    norm = Phaser.Math.Clamp((localX - Math.sign(localX)*JOY_DEAD) / (JOY_HALFTRACK - JOY_DEAD), -1, 1);
                }
                // Hassasiyet eğrisi — linear değil, küçük hareketleri yumuşat
                norm = Math.sign(norm) * Math.pow(Math.abs(norm), 1.3);
                _joyThumbX = norm;
                this._mobileLeft  = norm < -0.15;
                this._mobileRight = norm >  0.15;
                // Analog hız desteği — tam basılı değilse yavaşla
                this._mobileAnalog = norm;
                _drawJoystick(norm);
            };

            joyHit.on("pointerdown", (ptr) => {
                _joyActivePtr = ptr.id;
                _processJoyPointer(ptr);
            });
            joyHit.on("pointermove", (ptr) => {
                if(ptr.id === _joyActivePtr) _processJoyPointer(ptr);
            });
            joyHit.on("pointerup", (ptr) => {
                if(ptr.id === _joyActivePtr){
                    _joyActivePtr = null;
                    _joyThumbX = 0;
                    this._mobileLeft = false;
                    this._mobileRight = false;
                    this._mobileAnalog = 0;
                    _drawJoystick(0);
                }
            });
            joyHit.on("pointerout", (ptr) => {
                if(ptr.id === _joyActivePtr){
                    _joyActivePtr = null;
                    _joyThumbX = 0;
                    this._mobileLeft = false;
                    this._mobileRight = false;
                    this._mobileAnalog = 0;
                    _drawJoystick(0);
                }
            });

            this._btnLeft  = { g: joyG, lbl: null, hit: joyHit };
            this._btnRight = { g: joyG, lbl: null, hit: joyHit };
        }
        // ── MOBİL KONTROL SONU ───────────────────────────────────────

        // ── ATEŞ — düz, otomatik, garantili ──
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

        // ★ YENİ: Mini boss spawn — every 5 minutes (was 3) — prevents boss overload
        this.time.addEvent({delay:300000,loop:true,callback:()=>{
            if(!GS||GS.gameOver||GS.pickingUpgrade||GS.miniBossActive) return;
            spawnMiniBoss(this);
        }});

        // ★ YENİ: Sinerji kontrol — her level-up'tan sonra ve bu event ile de tetiklenir
        this.time.addEvent({delay:5000,loop:true,callback:()=>{
            if(!GS||GS.gameOver) return;
            checkAndApplySynergies(this);
        }});


        // Regen — [v11 REDESIGN] Pasif bekleme yok. Öldürme ve combo üzerinden iyileşme.
        // Lv1: her 4. öldürme +1 HP | Lv2: her 3. öldürme +1 HP, %5 crit → +1 HP
        // Bu tick sadece combat-regen dışı fallback: 12s hasar almamışsa Lv2'de +1 HP
        this.time.addEvent({delay:500, loop:true, callback:()=>{
            if(!GS||GS.gameOver||GS.pickingUpgrade) return;
            if(UPGRADES.regen.level <= 0) return;
            if(!this._regenAccum) this._regenAccum = 0;
            this._regenAccum += 500;
            const outOfCombat = !GS._lastHitTime || (Date.now() - GS._lastHitTime) > 18000;
            // Lv2: uzun süre hasar almamışsa çok yavaş pasif iyileşme
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
            // Body collision açık mı? disableBody sonrası checkCollision.none=true olabilir
            if(enemy.body && enemy.body.checkCollision.none) return;
            if(!b.body || !b.body.enable) return;
            // Zemine çarpmış düşmanlar mermi ile çarpışmasın
            if(enemy.groundHit) return;
            // Mini boss ekran dışından gelir — y<0 kontrolünden muaf
            if(!enemy._isMiniBoss && (enemy.y < 0 || enemy.x < -20 || enemy.x > 380)) return;
            if(enemy.mirror&&!enemy.mirrorSpawned){enemy.mirrorSpawned=true;spawnMirrorClone(_S,enemy);}
            if(enemy.absorber&&enemy.armor>1){showHitTxt(_S,enemy.x,enemy.y-8,"BLOK","#888888",false);b.setActive(false).setVisible(false);if(b.body)b.body.enable=false;return;}
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
            // b._pierced: kaçıncı düşmana çarpıyor (0=ilk)
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


            // Combo — aynı düşmandan 800ms içinde tekrar combo kazanılmaz
            const now=Date.now();
            const canCombo=!enemy._lastComboTime||(now-enemy._lastComboTime)>800;

            const distCenter=Math.abs(b.x-enemy.x);

            // [ADIM 6a] precision_crit synergy — perfect hit her zaman crit
            if(gs._synergyPrecisionCrit && gs.activeWeapon === "precision_rifle" && distCenter < 10){
                isCrit = true;
                dmg *= gs.critMult;
            }
            if(distCenter<10){
                // ── PERFECT HIT — silaha göre farklı çarpan
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
                    gs.comboDmgBoost=Math.min(1.35,1+gs.combo*0.018); // sadece referans için
                    gs.comboXpBoost=Math.min(1.20,1+gs.combo*0.020);
                    syncStatsFromPipeline(gs); // [v9.2] combo bonus pipeline'a dahil
                    // [VFX] Combo milestone WOW moments
                    const milestones={5:"🔥 x5 KOMBO!",10:"⚡ x10 KOMBO!",15:"💥 x15 KOMBO!",20:"🌟 x20 MAX KOMBO!"};
                    const mileCols={5:"#ff8800",10:"#ff4400",15:"#ff2244",20:"#ffcc00"};
                    if(milestones[gs.combo]){
                        showHitTxt(_S,180,260,milestones[gs.combo],mileCols[gs.combo],true);
                        _S.cameras.main.shake(40+gs.combo*2,0.004+gs.combo*0.0002);
                        // ── AAA COMBO MİLESTONE VFX ──
                        vfxComboMilestone(_S,gs.combo,_S.player.x,_S.player.y);
                    }
                }
                triggerResonance(_S,enemy,0);
                // ── AAA PERFECT HIT VFX ──
                vfxPerfectHit(_S,enemy.x,enemy.y,gs.combo);
           } else {
                // ── NORMAL VURUŞ ──
                if(canCombo){
                    enemy._lastComboTime=now;
                    gs.combo=Math.min(20,gs.combo+1); gs.comboTimer=1500;
                    gs.comboDmgBoost=Math.min(1.20,1+gs.combo*0.010); // referans
                    syncStatsFromPipeline(gs); // [v9.2]
                    // Combo 15+ → high_combo müzik geçişi
                    if(gs.combo===15 && !gs.bossActive){
                        NT_SFX.setMusicState("high_combo", 1.5);
                    }
                }
                // ── AAA NORMAL HIT VFX v2 — directional + squash ──
                const _bAng=Math.atan2(b.body.velocity.y,b.body.velocity.x);
                // mermi tam çarpma noktası: b.x,b.y (enemy merkezi değil)
                vfxNormalHit(_S,b.x,b.y,isCrit,_bAng);
                // [BUG FIX] Jelly sistemi aktifken vfxEnemySquash çağırma — iki tween çakışınca şekil bozulur
                if(!enemy._staggering) vfxEnemySquash(_S,enemy);
            }

            // Mermi yönü: merminin x pozisyonundan hesapla
            // b.x < enemy.x → mermi soldan geliyor → piramit sağa iter
            const _hitDir = b.x < enemy.x ? 1 : -1;
            applyDmg(_S,enemy,dmg,isCrit,_hitDir);
            // [v9.4] HEAVY CANNON — explosion on impact
            if(b._weaponType==="cannon"&&enemy.active===false){
                doExplosion(_S,enemy.x,enemy.y);
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
                // [BUG FIX] Koordinatları anında kaydet — düşman öldüğünde active=false olur ama x/y erişilebilir kalır
                let lastX=enemy.x, lastY=enemy.y;
                const _visited=new Set([enemy]);
                const doBounce=()=>{
                    if(!GS||GS.gameOver) return;
                    if(b._chainCount>=3) return;
                    b._chainCount++;
                    const allE=_S._activeEnemies&&_S._activeEnemies.length>0?_S._activeEnemies:_S.pyramids.getMatching("active",true);
                    let nearest=null; let nearD=9999;
                    for(let _ci=0;_ci<allE.length;_ci++){
                        const ce=allE[_ci];
                        if(!ce.active||_visited.has(ce)||ce.spawnProtected) continue;
                        const _dx=ce.x-lastX, _dy=ce.y-lastY;
                        const _d=Math.sqrt(_dx*_dx+_dy*_dy);
                        // [BUG FIX] Radius 160→260 — daha geniş arama alanı, sekme daha güvenilir
                        if(_d<260&&_d<nearD){nearD=_d;nearest=ce;}
                    }
                    if(!nearest) return;
                    // Chain VFX — blue lightning line
                    const lg=_S.add.graphics().setDepth(18);
                    lg.lineStyle(2,0x44aaff,0.9);
                    lg.lineBetween(lastX,lastY,nearest.x,nearest.y);
                    _S.tweens.add({targets:lg,alpha:0,duration:180,onComplete:()=>{try{lg.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
                    // Damage falloff per bounce
                    const falloff=Math.pow(0.72,b._chainCount); // [BUG FIX] 0.65→0.72 — daha güçlü sekme hasarı
                    applyDmg(_S,nearest,GS.damage*0.85*falloff,false);
                    // Chain Lightning synergy — trigger lightning on bounce
                    if(GS._synergyChainLightning) doLightning(_S);
                    _visited.add(nearest);
                    // [BUG FIX] Koordinatları güncelle — nearest artık yeni kaynak nokta
                    lastX=nearest.x; lastY=nearest.y;
                    _S.time.delayedCall(80,doBounce);
                };
                _S.time.delayedCall(60,doBounce);
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
            // Her hit: düşmana 1 frost stack eklenir. Eşiğe ulaşınca dondurulur.
            // Lv1: 4 stack = slow. Lv2: 4 stack = full freeze. Lv3: 3 stack = full freeze.
            // Stack threshold düşman HP ile değil level ile ölçeklenmiyor → skill-based
            if(gs.freezeChance > 0){
                if(!enemy._frostStacks) enemy._frostStacks = 0;
                // freezeChance artık stack-per-hit şansı olarak çalışıyor
                if(Math.random() < gs.freezeChance){
                    enemy._frostStacks++;
                    const freezeLv = UPGRADES.freeze?.level || 0;
                    const stackThreshold = freezeLv >= 3 ? 3 : 4;
                    // Görsel: buz kırıntıları artan yoğunlukta
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
                            // Lv1: güçlü slow, gerçek freeze değil
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
        });

        // ── DÜŞMAN — OYUNCU ÇARPIŞMASI ──
        this.physics.add.overlap(this.player,this.pyramids,(player,enemy)=>{
            if(!enemy.active||enemy.spawnProtected||enemy.groundHit) return;
            if(enemy.body && enemy.body.checkCollision.none) return;
            if(GS.invincible||GS.gameOver||GS.pickingUpgrade) return;
            if(enemy._collideCooldown) return;
            enemy._collideCooldown=true;
            // [TAKILMA FIX] Anında body devre dışı — physics overlap bir sonraki frame'de tekrar tetiklemez
            if(enemy.body){ enemy.body.enable=false; enemy.body.checkCollision.none=true; }
            enemy.setActive(false).setVisible(false);
            // [CAMERA SHAKE] Düşman çarpınca ekran sallanır
            this.cameras.main.shake(120,0.012);
            doExplodeVFX(this, enemy.x, enemy.y, ({normal:0xffcc55,zigzag:0x88ff44,fast:0xff4422,tank:0xaa44ff,shield:0x4488ff,kamikaze:0xff6600,ghost:0x88aacc,elder:0xffcc44,titan:0x9900dd,colossus:0xff2266,inferno:0xFF3300,glacier:0x44ccff,phantom_tri:0xcc44ff,volt:0xffee00,obsidian:0x6600aa})[enemy.type]||0xffcc55, enemy.scaleX||1);
            playerCollisionExplosion(this, enemy.x, enemy.y, enemy.type);
            killEnemy(this, enemy, false);
            damagePlayer(this);
        });

        // [OPT] _activeEnemies cache — getMatching her frame yerine 60ms'de bir çalışır
        // Tüm combat fonksiyonları bu cache'i kullanır → GC baskısı belirgin azalır
        this._activeEnemies=[];
        this.time.addEvent({delay:60,loop:true,callback:()=>{
            if(!GS||GS.gameOver) return;
            this._activeEnemies=this.pyramids.getMatching("active",true);
        }});

        // [Artifact trigger timer'ları kaldırıldı — v9.1]

        this.cameras.main.fadeIn(350,0,0,0);
        NT_SFX.setMusicState("gameplay", 0.5);

        // Smooth filter — tüm silah mermi texture'ları
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
            if(this._mobileLeft!==undefined){this._mobileLeft=false;this._mobileRight=false;this._mobileFire=false;this._mobileAnalog=0;this._mobileFireHoldTime=0;this._mobileFireCutOff=false;}
            return;
        }
        if(gs.pickingUpgrade){
            if(this._mobileLeft!==undefined){this._mobileLeft=false;this._mobileRight=false;this._mobileFire=false;this._mobileAnalog=0;this._mobileFireHoldTime=0;this._mobileFireCutOff=false;}
            return;
        }
        if(!this.player||!this.player.active) return;

        // ── AAA VFX TICK ──
        tickVFX(this,delta);

        // 5 dakika hayatta kalma kristal ödülü
        // [FIX] Oyun içi kristal kaldırıldı

        // ★ FPS monitor — performans modu güncelle
        updatePerfMode(this.game.loop.actualFps||60);
        // [PERF] Periyodik temizlik — orphan obje birikimini önle
        periodicSceneCleanup(this);

        gs.t+=delta;

        // Spawn delay dinamik güncelle — threshold 20ms so rate changes apply quickly
        if(this.spawnEvent){
            const newDelay=Math.max(280,gs.spawnDelay);
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
            if(gs.t - gs._lastSpikeTime >= _spikeInterval){
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

        // SKOR — kesirli birikim sistemi (120fps telefonda Math.floor sıfır döndürürdü)
        const prevScore=gs.score;
        gs._scoreFrac = (gs._scoreFrac||0) + (1.2+gs.level*0.32+gs.combo*0.12)*(delta/16);
        const scoreToAdd = Math.floor(gs._scoreFrac);
        if(scoreToAdd > 0){ gs.score += scoreToAdd; gs._scoreFrac -= scoreToAdd; }
        // Her 1000 skor animasyonu
        const prevK=Math.floor(prevScore/1000);
        const newK=Math.floor(gs.score/1000);
        if(newK>prevK&&this.scoreText){
            this.tweens.add({targets:this.scoreText,scaleX:1.4,scaleY:1.4,duration:100,yoyo:true,ease:"Back.easeOut"});
            // Her 1000 skorunda küçük altın ışıltı
            const sg=this.add.graphics().setDepth(62);
            sg.x=180; sg.y=22;
            sg.fillStyle(0xffdd44,0.18); sg.fillRect(-60,-10,120,20);
            this.tweens.add({targets:sg,alpha:0,scaleX:1.5,duration:260,ease:"Quad.easeOut",onComplete:()=>sg.destroy()});
        }

        // Combo timer — upgrade seçiminde dondur; Combo Master artifact extends duration
        if(gs.combo>0&&!gs.pickingUpgrade){
            const decayRate = 1.0;
            gs.comboTimer-=delta*decayRate;
            if(gs.comboTimer<=0){
                if(gs&&gs.combo>=5) showComboBreak(this, gs.combo);
                gs.combo=0;gs.comboDmgBoost=1.0;gs.comboXpBoost=1.0;
                syncStatsFromPipeline(gs); // [v9.2] combo bonus kaldırıldı
            }
        }

        // XP boost timer
        if(gs._xpBoostTimer>0) gs._xpBoostTimer-=delta;

        // Hareket
        movePlayer(this,delta);

        // SPACE ile ateş — cooldown sistemi
        this._shootTimer=(this._shootTimer||0)+delta;
        if(this.spaceKey&&this.spaceKey.isDown){
            this._spaceHoldTime=(this._spaceHoldTime||0)+delta;
            if(this._spaceHoldTime>2200) this._spaceCutOff=true;
        } else { this._spaceHoldTime=0; this._spaceCutOff=false; }
        // MOBİL ATEŞ CUTOFF — PC ile aynı davranış (2200ms sonra dur)
        if(this._mobileFire){
            this._mobileFireHoldTime=(this._mobileFireHoldTime||0)+delta;
            if(this._mobileFireHoldTime>2200) this._mobileFireCutOff=true;
        } else { this._mobileFireHoldTime=0; this._mobileFireCutOff=false; }
        if((this.spaceKey&&this.spaceKey.isDown&&!this._spaceCutOff&&this._shootTimer>=gs.shootDelay)||(this._mobileFire&&!this._mobileFireCutOff&&this._shootTimer>=gs.shootDelay)){
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

        // ★ YENİ: Görev takip güncelle

        // ★ GAME FEEL: Tüm yeni sistemler
        tickProgressiveChaos(this, delta);
        tickNearDeathPulse(this, delta);
        tickPowerSpikeWords(this, delta);
        tickHiddenSynergy(this);

        // Invincible timer
        if(gs.invincible){gs._invT=(gs._invT||0)+delta;if(gs._invT>350){gs.invincible=false;gs._invT=0;}}

        // Player sınır
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
    // Mirror controls event: yön ters çevrilir
    const _mirror=gs._mirrorControls?-1:1;
    // Analog joystick desteği — mobilde kademeli hız
    if(S._mobileAnalog !== undefined && Math.abs(S._mobileAnalog) > 0.15){
        vx = sp * S._mobileAnalog * _mirror;
    } else {
        if(leftDown && !rightDown)  vx=-sp*_mirror;
        if(rightDown && !leftDown)  vx=sp*_mirror;
    }
    // İkisi aynı anda basılıysa: dur (0 kalır)

    // Knockback
    if(gs._knockbackTimer>0){
        gs._knockbackTimer-=delta;
        // [KAYMA FIX] Knockback sırasında her iki eksen de sıfırlanır.
        // Önceden sadece velocity.y=0 yapılıyordu — velocity.x önceki değerde
        // kalıyordu ve oyuncu 350ms boyunca kayıyordu.
        S.player.body.velocity.x=0;
        S.player.body.velocity.y=0;
    } else {
        // Anlık hız — kayma yok, gecikme yok
        S.player.body.velocity.x=vx;
        S.player.body.velocity.y=0;
    }

    // Y zemine sabit — idle/run frame yüksekliği 34px, scale 2 → origin 0.5 → alt kenar GROUND_Y
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
        }
    }
}

// ── ATEŞ — SİLAH TİPİNE GÖRE DAĞITIM ──────────────────────
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

    // [OPT] EVOLUTIONS.find hot-path'ten kaldırıldı — applyUpgrade'de set edilen GS flag'leri kullanılıyor
    if(wt==="rapid_blaster"){
        NT_SFX.play("shoot_rapid");
        fireBulletRaw(S,px-3,py,(Math.random()-0.5)*sp*0.04,vy,0.6,0xffee44,"rapid");
        fireBulletRaw(S,px+3,py,(Math.random()-0.5)*sp*0.04,vy,0.6,0xffee44,"rapid");
    } else if(wt==="heavy_cannon"){
        NT_SFX.play("shoot_cannon");
        fireBulletRaw(S,px,py,(Math.random()-0.5)*sp*0.01,vy*0.62,1.0,0xff6600,"cannon");
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
        fireBulletRaw(S,px,py,0,vy*1.35,1.0,0xff2244,"precision");
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
    // Silaha göre texture seç
    const bulletTex =
        weaponType==="cannon"    ? "tex_bullet_cannon" :
        weaponType==="precision" ? "tex_bullet_precision" :
        weaponType==="reflect"   ? "tex_bullet_reflect" :
        weaponType==="spread"    ? "tex_bullet_spread" :
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

    // Hitbox silah tipine göre — piramit içinden geçmesin
    if(weaponType==="cannon")    { b.body.setSize(5,18).setOffset(1,2); }  // 8x22 füze
    else if(weaponType==="reflect"){ b.body.setSize(7,16).setOffset(0,1); }
    else if(weaponType==="precision"){ b.body.setSize(5,18).setOffset(0,1); }
    else                         { b.body.setSize(7,16).setOffset(0,1); }

    b.setScale(bScale);
    b.body.setVelocity(vx+bSpread,vy);
    b._pierced=0; b._age=0;
    b._weaponType=weaponType||"default";
    b._dmgMult=(dmgM!=null?dmgM:1.0); // BALANCE FIX: store per-bullet dmgM — was only used for visual scale
    b.setDepth(16); b.setAlpha(1);
    b.setRotation(Math.atan2(vy,vx)+Math.PI/2);

    // [WEAPON VİZÜEL] Weapon tint overrides damage-level tint
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

    // Namlu kıvılcımı — [v10.0] per-weapon identity
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
    // Her silah kendi renginde iz bırakır — ekran okunabilirliği için kritik
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

    // Mermi kovanı — siyah, sarı çizgili (reflect weapon'da kovan çıkmaz — tüfek tarzı)
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

            // Left/Right wall bounce — hafif random açı
            if(b.x<=ARENA_LEFT && bvx<0){
                bvx=Math.abs(bvx)*(0.85+Math.random()*0.30);
                bvy=bvy*(0.85+Math.random()*0.30);
                bounced=true; b.x=ARENA_LEFT+2;
            } else if(b.x>=ARENA_RIGHT && bvx>0){
                bvx=-Math.abs(bvx)*(0.85+Math.random()*0.30);
                bvy=bvy*(0.85+Math.random()*0.30);
                bounced=true; b.x=ARENA_RIGHT-2;
            }
            // Top wall bounce — düz yukarı sekmesin, random yatay açı ekle
            if(b.y<=ARENA_TOP && bvy<0){
                // Hızı koru ama yön randomize et: 30°-150° arasında aşağı
                const randomAngle = Phaser.Math.DegToRad(Phaser.Math.Between(30, 150));
                bvx = Math.cos(randomAngle) * spd;
                bvy = Math.abs(Math.sin(randomAngle) * spd); // her zaman aşağı
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

        // Sınır dışı — reflect bullets exit from bottom (ground) only
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
        // Max yaşam 2.5 saniye
        b._age=(b._age||0)+S.game.loop.delta;
        if(b._age>2500){
            b.setActive(false).setVisible(false);
            b.body.enable=false;
            b._age=0;
            return;
        }
        // Velocity sıfırlandıysa kur — asılı kalma önlemi
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
    // [v9.3] flame kaldırıldı — drawFlameRing/doFlameDmg artık çağrılmaz
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
            sw.body.setCollideWorldBounds(false); // Manuel sınır kontrolü
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
                sw.angle+=16;
                // Her 3-5 saniyede rastgele yeni yön — tek yörüngede sıkışmayı önle
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
                // Tüm ekran + zemin dahil bounce
                if(sw.x<8){  sw.x=8;   sw.body.velocity.x=Math.abs(sw.body.velocity.x); }
                if(sw.x>352){ sw.x=352; sw.body.velocity.x=-Math.abs(sw.body.velocity.x); }
                if(sw.y<8){  sw.y=8;   sw.body.velocity.y=Math.abs(sw.body.velocity.y); }
                if(sw.y>GROUND_Y){ sw.y=GROUND_Y; sw.body.velocity.y=-Math.abs(sw.body.velocity.y); }
                // Minimum hız
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
    tickDrones(S); // level=0 olsa da çalışır — sacrifice sonrası drone'ları gizler
    drawPoisonAura(S);
    // ── POISON ORB — periyodik fırlatma ──
    if(UPGRADES.poison.level>0){
        gs._lastPoison=(gs._lastPoison||0)+delta;
        const cooldown=Math.max(2800,4500-UPGRADES.poison.level*400);
        if(gs._lastPoison>cooldown){
            gs._lastPoison=0;
            spawnPoisonOrb(S);
        }
    }
}
// ── ALEV HALKASI GÖRSEL — her frame çizilir, tutarlı takip ──
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

    let prev={x:S.player.x, y:S.player.y-28};
    targets.forEach(t=>{
        // BALANCE: lightning uses BASE_DAMAGE as anchor, not gs.damage
        // This prevents lightning from becoming a second main weapon at late game
        // Lv1: 0.80x base, Lv2: 1.00x base, Lv3: 1.20x base — meaningful but not dominant
        const _lightningDmg = Math.min(gs.damage * 0.7, BASE_DAMAGE * (0.80 + lv * 0.20));
        applyDmg(S,t,_lightningDmg,false);
        if(gs._synergyChainStorm) applyChainStormToLightning(S,t);

        const ex=t.x, ey=t.y-8;
        const sx=prev.x, sy=prev.y;

        // ── GLOW KATMANI — kalın mavi dış parıltı
        const glow2=S.add.graphics().setDepth(19);
        glow2.lineStyle(8,0x2244ff,0.06);
        glow2.beginPath(); glow2.moveTo(sx,sy); glow2.lineTo(ex,ey); glow2.strokePath();
        const glow1=S.add.graphics().setDepth(20);
        glow1.lineStyle(4,0x44aaff,0.15);
        glow1.beginPath(); glow1.moveTo(sx,sy); glow1.lineTo(ex,ey); glow1.strokePath();

        // ── ZIGZAG BOLT — 8 adım, gerçek elektrik hissi
        const _drawBolt=(width,colHex,alpha,jitter)=>{
            const bolt=S.add.graphics().setDepth(21+width);
            bolt.lineStyle(width,colHex,alpha);
            bolt.beginPath();
            const steps=8;
            let cx=sx, cy=sy;
            bolt.moveTo(cx,cy);
            for(let s=1;s<steps;s++){
                const t2=s/steps;
                const nx=sx+(ex-sx)*t2 + Phaser.Math.Between(-jitter,jitter);
                const ny=sy+(ey-sy)*t2 + Phaser.Math.Between(-jitter*0.6,jitter*0.6);
                bolt.lineTo(nx,ny);
                cx=nx; cy=ny;
            }
            bolt.lineTo(ex,ey);
            bolt.strokePath();
            return bolt;
        };

        const boltOuter = _drawBolt(3, 0x4488ff, 0.6, 12); // mavi dış
        const boltMid   = _drawBolt(2, 0xaaddff, 0.8, 8);  // açık mavi orta
        const boltCore  = _drawBolt(1, 0xffffff, 1.0, 5);  // beyaz çekirdek

        // ── HEDEF HIT FLASH — sarı-beyaz patlama
        const flash=S.add.graphics().setDepth(23);
        flash.fillStyle(0xffffff,0.7); flash.fillCircle(ex,ey,6);
        flash.fillStyle(0xffee44,0.5); flash.fillCircle(ex,ey,10);
        // Hit parçacıkları
        for(let _i=0;_i<5;_i++){
            const _pa=Phaser.Math.DegToRad(_i*72+Phaser.Math.Between(-15,15));
            const _spd=Phaser.Math.Between(12,28);
            const _pp=S.add.graphics().setDepth(23);
            _pp.x=ex; _pp.y=ey;
            _pp.fillStyle(0xaaddff,0.9); _pp.fillRect(-1,-1,2,2);
            S.tweens.add({targets:_pp,
                x:ex+Math.cos(_pa)*_spd, y:ey+Math.sin(_pa)*_spd,
                alpha:0, scaleX:0, scaleY:0,
                duration:Phaser.Math.Between(80,160), ease:"Quad.easeOut",
                onComplete:()=>_pp.destroy()});
        }
        // ── KAYNAK FLASH — oyuncudan çıkış parlaması
        const srcFlash=S.add.graphics().setDepth(22);
        srcFlash.fillStyle(0x88ccff,0.5); srcFlash.fillCircle(sx,sy,4);

        // Hepsini fade et
        S.tweens.add({targets:[glow2,glow1,boltOuter,boltMid,boltCore,flash,srcFlash],
            alpha:0, duration:Phaser.Math.Between(120,180), ease:"Quad.easeOut",
            onComplete:()=>{
                try{glow2.destroy();glow1.destroy();boltOuter.destroy();
                    boltMid.destroy();boltCore.destroy();flash.destroy();srcFlash.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
            }});

        prev=t;
    });
}
function doLaser(S){
    const gs=GS, lv=UPGRADES.laser.level;
    const count=lv; // lv1:1, lv2:2, lv3:3 çizgi
    for(let idx=0;idx<count;idx++){
        S.time.delayedCall(idx*120,()=>{
            const enemies=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
            let bx, tgt=null;
            if(enemies.length>0){
                // En yakın düşmanı hedefle (daha akıllı)
                let minD=999999;
                enemies.forEach(e=>{if(!e||!e.active)return;const d=(e.x-S.player.x)**2+(e.y-S.player.y)**2;if(d<minD){minD=d;tgt=e;}});
                bx=tgt?tgt.x:Phaser.Math.Between(30,330);
            } else {
                bx=Phaser.Math.Between(30,330);
            }

            // ── Uyarı: kırmızı tarama çizgisi + nabız ──
            const warn=S.add.graphics().setDepth(22);
            warn.lineStyle(2,0xff0000,0.8); warn.lineBetween(bx,0,bx,640);
            warn.lineStyle(8,0xff2200,0.2); warn.lineBetween(bx,0,bx,640);
            // Tarama efekti — warn yukarıdan aşağı tarar
            S.tweens.add({targets:warn,alpha:0,duration:200,onComplete:()=>warn.destroy()});

            // Hedef üzerinde nişan halkası
            if(tgt&&tgt.active){
                const aim=S.add.graphics().setDepth(23);
                aim.lineStyle(2,0xff0000,0.9); aim.strokeCircle(tgt.x,tgt.y,20);
                aim.lineStyle(1,0xff6600,0.7); aim.strokeCircle(tgt.x,tgt.y,12);
                S.tweens.add({targets:aim,scaleX:0.3,scaleY:0.3,alpha:0,duration:200,ease:"Quad.easeIn",onComplete:()=>aim.destroy()});
            }

            // 180ms sonra asıl lazer
            S.time.delayedCall(180,()=>{
                const lg=S.add.graphics().setDepth(25);
                // Katman 1: Parlak beyaz çekirdek
                lg.lineStyle(3+lv,0xffffff,1.0); lg.lineBetween(bx,0,bx,640);
                // Katman 2: Kırmızı-turuncu kor
                lg.lineStyle(6+lv*2,0xff4400,0.85); lg.lineBetween(bx,0,bx,640);
                // Katman 3: Geniş glow
                lg.lineStyle(18+lv*5,0xff0000,0.18); lg.lineBetween(bx,0,bx,640);
                // Katman 4: Dış ışık yayılımı
                lg.lineStyle(32+lv*8,0xff2200,0.07); lg.lineBetween(bx,0,bx,640);

                // Hasar azaltıldı: lv1:2x, lv2:2.8x, lv3:3.8x (eskiden 3x/4x/5.5x)
                const laserDmgMult=2.0+lv*0.9;
                (S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true)).forEach(e=>{
                    const laserCrit=gs._synergyLaserFocus&&Math.random()<0.6;
                    if(Math.abs(e.x-bx)<24+lv*4) applyDmg(S,e,gs.damage*laserDmgMult,laserCrit||true);
                });

                S.cameras.main.shake(30+lv*8, 0.004+lv*0.001);
                // Screen flash KALDIRILDI — göz yorucu

                // Lazer söner — önce çekirdek, sonra glow
                S.tweens.add({targets:lg,alpha:0,duration:300,ease:"Quad.easeOut",onComplete:()=>lg.destroy()});

                // Zemin çarpma — yatık ellips, dolu büyük daire YOK
                const imp=S.add.graphics().setDepth(24);
                imp.x=bx; imp.y=GROUND_Y;
                imp.lineStyle(2,0xff4400,0.8); imp.strokeEllipse(0,0,24+lv*6,6);
                imp.fillStyle(0xff6600,0.5); imp.fillEllipse(0,0,16+lv*4,4);
                // Zemin alev dilleri — azaltıldı
                for(let _gi=0;_gi<2+lv;_gi++){
                    const _ga=Phaser.Math.DegToRad(150+_gi*25+Phaser.Math.Between(-12,12));
                    const _gsp=S.add.graphics().setDepth(24);
                    _gsp.fillStyle(_gi%2===0?0xff4400:0xffcc00,0.75);
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
    // [DENGE] Önceki: count=3+lv, hasar=1.2+lv*0.45 → çok güçlü
    // Şimdi: count=2+lv, hasar=0.7+lv*0.2 → dengeli
    const count=2+lv;
    for(let i=0;i<count;i++){
        S.time.delayedCall(i*120,()=>{
            const te=nearestE(S,S.player.x+Phaser.Math.Between(-80,80),S.player.y+Phaser.Math.Between(-50,50),999);
            if(!te) return;
            // BALANCE: thunder uses BASE_DAMAGE anchor like lightning
            const _thunderDmg = Math.min(gs.damage * 0.65, BASE_DAMAGE * (0.70 + lv * 0.20));
            applyDmg(S,te,_thunderDmg,false);
            const bx=te.x;
            // Uyarı — ince sarı
            const warn=S.add.graphics().setDepth(20);
            warn.lineStyle(1,0xffee00,0.6); warn.lineBetween(bx,0,bx,te.y);
            S.tweens.add({targets:warn,alpha:0,duration:80,onComplete:()=>warn.destroy()});
            S.time.delayedCall(80,()=>{
                // Gök gürültüsü çakması
                const tg=S.add.graphics().setDepth(22);
                tg.lineStyle(5,0xffffff,1.0);  tg.lineBetween(bx,0,bx,te.y);
                tg.lineStyle(3,0xffee44,0.9);  tg.lineBetween(bx,0,bx,te.y);
                tg.lineStyle(12,0xffcc00,0.18); tg.lineBetween(bx,0,bx,te.y);
                // Çarpma noktası — dolu daire yerine ince halka
                const imp=S.add.graphics().setDepth(22);
                imp.x=bx; imp.y=te.y;
                imp.lineStyle(2,0xffffff,0.85); imp.strokeCircle(0,0,7);
                imp.lineStyle(1,0xffcc00,0.6);  imp.strokeCircle(0,0,12);
                S.cameras.main.shake(20,0.003);
                S.tweens.add({targets:[tg,imp],alpha:0,duration:140,onComplete:()=>{try{tg.destroy();imp.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
            });
        });
    }
}function tickDrones(S){const gs=GS,lv=UPGRADES.drone.level;while(S.droneGroup.getLength()<lv){const d=S.physics.add.image(0,0,"tex_drone");d.body.setAllowGravity(false).setImmovable(true);d.setActive(true).setVisible(true).setDepth(12);d.lastShoot=0;d._spinAngle=0;S.droneGroup.add(d);}
// [OPT] cache kullan — her frame getMatching yerine _activeEnemies
const ae=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
S.droneGroup.getChildren().forEach((d,i)=>{if(i>=lv){d.setActive(false).setVisible(false);return;}d.setActive(true).setVisible(true);
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
    // ★ Drone Shield synergy — heal trigger (raised threshold: 10 hits instead of 8)
    if(gs._synergyDroneShield){gs._droneHitCount=(gs._droneHitCount||0)+1;if(gs._droneHitCount>=10){gs._droneHitCount=0;gs.health=Math.min(gs.maxHealth,gs.health+1);}}
}}});}
// ── XP ────────────────────────────────────────────────────────
function spawnXpOrb(S,x,y,tex,val){
    if(S.xpOrbs.length>=45) return; // hard cap — no screen flooding
    const tk=tex||"xp_blue";
    const sc=0.75+Math.random()*0.15; // 1.10→0.75 küçültüldü
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

        // [PERF] sqrt sadece gerektiğinde hesapla
        let dist=null;
        const getDist=()=>{ if(dist===null) dist=Math.sqrt(dist2); return dist; };

        // [XP] Global hafif çekim
        const d=getDist();
        if(d>0.1){
            const globalForce = 45;
            o.vx += dx/d * globalForce * dt;
            o.vy += dy/d * globalForce * dt;

            // [XP] Yakın mesafe snap zone
            if(d < 80){
                const snapForce = 900 * (1 - d/80);
                o.vx += dx/d * snapForce * dt;
                o.vy += dy/d * snapForce * dt;
            }

            // [XP] Mıknatıs
            if(M && dist2<magR2){
                const ratio=d/magR;
                const force=800+(1-ratio)*(1-ratio)*1800;
                o.vx+=dx/d*force*dt;
                o.vy+=dy/d*force*dt;
                if(o.obj.y>=XP_GROUND_Y-2) o.vy=-120;
            }
        }

        // [XP] Yerçekimi — gerçekçi hızlanma
        if(o.obj.y < XP_GROUND_Y) o.vy += 320 * dt;

        // [XP] Yerle temas — sekme animasyonu
        if(o.obj.y >= XP_GROUND_Y){
            o.obj.y = XP_GROUND_Y;
            if(Math.abs(o.vy) > 18){
                // Sekme: hız azalarak geri fırla
                o.vy *= -0.42;
                o.vx *= 0.72;
                o.bounceCount=(o.bounceCount||0)+1;
                // Sekme sırasında hafif ufak scale squeeze
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

        // Hız sınırı — yaklaştıkça artar
        const maxSpd = dist < 80 ? 520 : dist < 160 ? 380 : 220;
        const sp=Math.sqrt(o.vx*o.vx+o.vy*o.vy);
        if(sp>maxSpd){o.vx=o.vx/sp*maxSpd;o.vy=o.vy/sp*maxSpd;}

        // Kenar sınırı
        if(o.obj.x<5) o.vx=Math.abs(o.vx);
        if(o.obj.x>355) o.vx=-Math.abs(o.vx);

        // Mıknatıs trail — sadece mıknatıs aktifken
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
        // Floating animasyon — yerde beklerken hafif yukarı-aşağı sallanma
        if(o.obj.y>=XP_GROUND_Y-1&&Math.abs(o.vx)<8&&Math.abs(o.vy)<5){
            o.floatT=(o.floatT||0)+S.game.loop.delta*0.0025;
            o.obj.y=XP_GROUND_Y+Math.sin(o.floatT+(o.floatPhase||0))*1.5;
            o.obj.angle=(o.obj.angle||0)+0.3;
        }

        // ── XP PARLAMA VFX — her orbda periyodik beyaz minik patlama ──
        o._sparkT=(o._sparkT||0)+S.game.loop.delta;
        // Her 500-800ms arasında rastgele parlama
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
            // 4 yön minik parçacık
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
        // [v10.1] Orb değeri kırpma — daha dengeli per-zone limitleri
        // Erken oyun: 7 (daha hızlı ilerleme), geç oyun: 2 (yavaşlama korunuyor)
        // [v10.1] Per-orb XP cap — erken oyun biraz cömert, geç oyun sıkı
        // Lv1-5: max 8xp/orb, Lv6-12: max 5, Lv13-20: max 3, Lv21+: max 2
        const xpCap = gs.level <= 5 ? 8 : gs.level <= 12 ? 5 : gs.level <= 20 ? 3 : 2;
        const cappedVal = Math.min(o.val, xpCap);

        // [v10.1] XP/saniye rate limiter — flat zone-based
        // Zone  Lv1-5: 18/s (erken oyun hızlanma), Lv6-12: 12/s, Lv13-20: 8/s, Lv21+: 5/s
        let xpCapMult = 1.0;
        if(gs._blitzXpPenalty) xpCapMult *= 0.70;
        // [v10.x] xpFrenzy event: +40% XP rate BUT total XP mult still capped at ×1.30
        // xpFrenzy artık spawn arttırarak tehlike yaratır; XP kazancı sınırsız değil
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
            // Collect burst — beyaz parıltı partiküller
            const bx=o.obj.x, by=o.obj.y;
            const tk=o.obj.texture?.key||"";
            const bc=tk.includes("gold")?0xffdd44:tk.includes("red")?0xff5533:tk.includes("purple")?0xcc44ff:tk.includes("green")?0x44ff88:0x88aaff;
            for(let _bi=0;_bi<3;_bi++){
                const _ang=Phaser.Math.DegToRad(_bi*120+Phaser.Math.Between(-20,20));
                const _spd=Phaser.Math.Between(20,45);
                const _bp=S.add.graphics().setDepth(18);
                _bp.x=bx; _bp.y=by;
                // Beyaz parıltı nokta
                _bp.fillStyle(0xffffff,0.9); _bp.fillRect(-1,-1,2,2);
                S.tweens.add({targets:_bp,
                    x:bx+Math.cos(_ang)*_spd, y:by+Math.sin(_ang)*_spd*0.6,
                    alpha:0,scaleX:0,scaleY:0,duration:Phaser.Math.Between(140,260),
                    ease:"Quad.easeOut",onComplete:()=>_bp.destroy()});
            }
            // Küçük beyaz flash halkası
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

    // Cooldown kontrolü — lockUpgrade'den ÖNCE (donma önlenir)
    // [v10.1] Level-up cooldown: erken oyun daha hızlı feedback, geç oyun daha seyrek
    // Lv1-5:  0ms     → anlık feedback, oyuncu sistemi hissediyor
    // Lv6-10: 2800ms  → orta hız (was 3500ms — biraz hızlandırıldı)
    // Lv11-17:5000ms  → belirgin yavaşlama (was 5500ms)
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

    // Şimdi kilitle ve level atla
    lockUpgrade(gs, S);
    gs._lastLevelUpTime = now;

    // XP EĞRİSİ — v10.1: erken oyun daha hızlı ilerleme (oyuncu güçlenmeli), geç oyun yavaşlıyor
    // xpToNext başlangıç: 28 (GS init'te ayarlanacak)
    // Lv1-3:  ×1.20  → hızlı ilk seçimler, oyuncu sistemi öğrenir
    // Lv4-8:  ×1.28  → orta hız, build şekillenmeye başlar
    // Lv9-16: ×1.36  → belirgin yavaşlama, her level değerli
    // Lv17+:  ×1.45  → prestige zone — çok nadir
    const xpGrowth = gs.level <= 3  ? 1.20
                   : gs.level <= 8  ? 1.28
                   : gs.level <= 16 ? 1.36
                   : 1.45;
    gs.level++;
    gs.xpToNext = Math.round(gs.xpToNext * xpGrowth);
    gs.pyramidSpeed = Math.min(230, gs.pyramidSpeed); // BALANCE FIX: raised cap 210→230
    S.time.timeScale = 1.0;
    // [v9.2] Pipeline sync — seviye atlayınca stat'lar yeniden hesaplanır
    syncStatsFromPipeline(gs);
    // ── AAA LEVEL UP VFX ──
    vfxLevelUp(S,gs.level);
    // Ekrandaki tüm aktif mermileri durdur
    if(S.bullets) S.bullets.children.each(b=>{if(b.active&&b.body)b.body.setVelocity(0,0);});
    // Düşmanları da dondur
    if(S.pyramids) S.pyramids.children.each(e=>{if(e.active&&e.body)e.body.setVelocity(0,0);});

    showLevelUpUI(S);
    gs.score+=500*gs.level;
    onLevelUpPowerSpike(S);
    // Artifact: no xp_surge equivalent — artifact effects are apply-once

    // ── Level up görsel efektleri ──────────────────────────────
    const plx=S.player.x, ply=S.player.y-14;

    // Hafif shake — flash ve wave YOK (vfxLevelUp zaten halkaları çizer)
    S.cameras.main.shake(30,0.003);

    // ── Parlak iç aura — küçük, hızlı
    const aura=S.add.graphics().setDepth(597);
    aura.x=plx; aura.y=ply;
    aura.fillStyle(0x88aaff,0.18); aura.fillCircle(0,0,12);
    S.tweens.add({targets:aura,scaleX:1.8,scaleY:1.8,alpha:0,duration:220,ease:"Quad.easeOut",onComplete:()=>aura.destroy()});

    // ── Parçacıklar — 8 adet, küçük
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
    // [OPT] localStorage yazımını async ertele — senkron I/O level-up anında frame drop yaratabilir
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

    // Safety cleanup — upicon_ nesnelerini slice ile güvenli tara ve yok et
    // [FIX] Slot ikonlarını atla — bunlar kalıcı UI objeleri
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
//  NOT TODAY  ·  AAA LEVEL-UP CARD SYSTEM  ·  LoL Inspired  ·  v10.3
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
    const titleTxt = ui.add(S.add.text(HDR_CX, HDR_TOP + 30, "✦  LEVEL UP!  ✦", {
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
        `LEVEL ${gs.level}  ·  CHOOSE AN UPGRADE`, {
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
            syncStatsFromPipeline(gs);

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

    // Aktif weapon sayısı (slot kontrolü için)
    const wC = Object.values(UPGRADES).filter(u => u.type === "weapon" && u.level > 0).length;
    const pC = Object.values(UPGRADES).filter(u => u.type === "passive" && u.level > 0).length;
    // [v9.4] Main weapon: player can have only ONE active at a time
    const hasMainWeapon = Object.values(UPGRADES).some(u => u.type === "mainweapon" && u.level > 0);

    // Sinerji için önerilen key'ler
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

        // 2. Weapon slot dolu ve bu weapon henüz açılmamışsa geçme
        // Ama: slot doluysa mevcut weapon'ları YÜKSELTEBİLİR (level > 0)
        if(u.type === "weapon"  && u.level === 0 && wC >= MAX_WEAPONS) continue;
        // 3. Passive slot dolu ve bu passive henüz açılmamışsa geçme
        // Ama: slot doluysa mevcut passive'leri YÜKSELTEBİLİR (level > 0)
        if(u.type === "passive" && u.level === 0 && pC >= MAX_PASSIVES) continue;
        // [v9.4] 4. mainweapon: always allow (acquiring replaces current weapon)
        // Don't exclude — weapon swap is a valid interesting choice

        const isHealType     = ["heal", "regen", "maxhp"].includes(k);
        const isSynergyMatch = synergyKeys.has(k);
        // [v10.1] Mevcut upgrade seviyesine göre ek ağırlık
        // Lv0 upgrade'ler daha az tercih edilmeli erken oyunda (ilk kez açılıyor → belirsizlik)
        // Lv1+ upgrade'ler için tekrar önerilmek daha değerli (build tutarlılığı)
        const isPartiallyBuilt = (u.level||0) >= 1 && (u.level||0) < (u.max||1);

        let weight = 1;
        // Zayıf durum: iyileştirici önceliği artar
        if(isWeak && isHealType)          weight = 5;
        else if(isLateGame && isHealType) weight = 2;
        // Sinerji eşleşmesi: build tutarlılığını destekle
        if(isSynergyMatch)      weight = Math.max(weight, 3);
        // Kısmen tamamlanmış upgrade: devam etmeyi teşvik et (build kimliği)
        if(isPartiallyBuilt)    weight = Math.max(weight, 2);
        // Erken oyunda silah yoksa: mainweapon öner
        if(u.type === "mainweapon" && !hasMainWeapon) weight = Math.max(weight, 2); // [BALANCE] 4→2: erken oyun mainweapon dominansı azaltıldı
        // Geç oyunda yeni bir mainweapon önerisi daha az baskın olsun (build kuruldu)
        if(u.type === "mainweapon" && hasMainWeapon && gs && gs.level >= 8) weight = Math.min(weight, 1);

        // [v11] split is compatible with all weapons — no exclusion needed

        // Ağırlık kadar pool'a ekle (shuffle sonrası etkili bir ağırlık sistemi)
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
            // ★ YENİ: Güçlü evolution sineması (eski flash kaldırılmadı, üstüne eklendi)
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
        showHitTxt(S,180,200,"+20 CAN","#44ff88",true);
        checkAndApplySynergies(S);
        return;
    }
    if(key==="_reward_gold"){
        gs.goldMult=(gs.goldMult||1)+0.10;
        showHitTxt(S,180,200,"++ +10% ALTIN","#ffcc00",true);
        checkAndApplySynergies(S);
        return;
    }
    if(key==="_reward_dmgburst"){
        // [v9.2] Geçici +12% hasar — pipeline flag üzerinden
        gs._dmgBurstActive=true;
        syncStatsFromPipeline(gs);
        showHitTxt(S,180,200,"+12% HASAR (10sn)","#ff8800",true);
        S.time.delayedCall(10000,()=>{
            if(GS&&!GS.gameOver){ GS._dmgBurstActive=false; syncStatsFromPipeline(GS); }
        });
        checkAndApplySynergies(S);
        return;
    }
    if(!up)return;
    up.level=Math.min(up.level+1,up.max);
    // [FIX] İlk alımda slot sırasına kaydet — slot kaymasını önler
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
            // Pipeline handles damage — sadece level kaydı yeterli, sync aşağıda
            break;
        case"attack":
            // Pipeline handles shootDelay — sadece level kaydı yeterli
            gs.bulletSpeed=Math.min(500, gs.bulletSpeed+10);
            break;
        case"size":
            // Hard cap: 1.6x bullet scale
            // [v10.x TRADEOFF] Büyük mermi = yavaş mermi: her lv −12% bullet speed
            gs.bulletScale=Math.min(1.6, gs.bulletScale+0.22);
            gs.bulletSpeed=Math.max(gs.bulletSpeed*0.88, 290); // min 290 (was no floor)
            break;
        case"split":
            // [v11] Split Shot: öldürme tetikli bölünme mermisi — multiShot YOK
            // Her lv'de splitLevel artar → killEnemy'de 2 fragment spawn edilir
            // TRADEOFF: her lv −10% bullet speed (ağır mermiler daha yavaş)
            gs.splitLevel = Math.min(3, (gs.splitLevel||0) + 1);
            gs.bulletSpeed = Math.max(gs.bulletSpeed * 0.90, 260);
            break;
        case"pierce":
            // Hard cap: 2 pierce max
            // [v10.x TRADEOFF] Pierce başına −20% hasar decay — applyDmg'de bullet._pierced ile uygulanır
            gs.pierceCount=Math.min(2, gs.pierceCount+1);
            break;
        case"crit":
            // Pipeline handles critChance — sadece level kaydı yeterli
            break;
        case"knockback":
            gs.knockback=Math.min(1, gs.knockback+1);
            // Maliyet: −15% hasar → pipeline'a girer (calcStats'ta kbDmgCost)
            if(S) showHitTxt(S,180,220,"İtme aktif — hasar -15%","#ff8844",false);
            break;
        case"freeze":
            gs.freezeChance=Math.min(0.32, gs.freezeChance+0.10); // [BALANCE v10] cap 0.28→0.32, +0.10 per lv
            // Maliyet: −12% hasar per lv → pipeline'a girer (calcStats'ta frzDmgCost)
            break;
        case"xpboost":
            // [BALANCE v10] XP snowball kapatıldı: +15% per lv, hard cap ×1.30
            // Maliyet: −10% gold drop → goldMult düşürülür
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
            // maxHealth azalt — build kimliği: pickup'a güven, HP'ye değil
            const hpPenalty = Math.floor(gs.maxHealth * 0.08);
            gs.maxHealth = Math.max(8, gs.maxHealth - hpPenalty);
            gs.health = Math.min(gs.health, gs.maxHealth);
            gs._healFlash=600; break;
        case"speed": {
            // Pipeline handles moveSpeed — sadece level kaydı, sync aşağıda
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
            // [FIX] Slot listesinden eski mainweapon'ları temizle, yenisini slot 0'a koy
            if(S._weaponSlotKeys){
                S._weaponSlotKeys=S._weaponSlotKeys.filter(k=>
                    !["rapid_blaster","heavy_cannon","spread_shot","chain_shot","precision_rifle","reflection_rifle"].includes(k)
                );
                S._weaponSlotKeys.unshift(key); // mainweapon her zaman slot 0
            }
            break;
    }
    // ★ Pipeline sync — tüm stat değişikliklerini tek noktadan güncelle
    syncStatsFromPipeline(gs);
    // ★ YENİ: Upgrade sonrası sinerji kontrolü tetikle
    checkAndApplySynergies(S);
    // ★ Build title — güçlü kombo varsa göster
    S.time.delayedCall(600,()=>showBuildTitle(S));

    // [VFX v2] Upgrade pickup — glow pulse + text float
    if(S&&S.player){
        const upColor=UPGRADES[key]?.color||0x4488ff;
        const plx=_snap(S.player.x), ply=_snap(S.player.y);
        vfxLevelUpGlow(S,plx,ply,upColor);
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

    // Mini boss: hp <= 0 kontrolü — kaçarsa ödül yok
    if(p._isMiniBoss){
        // Sadece gerçekten öldüyse ödül ver (hp<=0 = öldürüldü, hp>0 = zemine değdi)
        const _mbDead = (p.hp <= 0);
        if(_mbDead){
            handleMiniBossDeath(S, p);
            gs.kills++;
            gs.score += Math.round(1200*(1+gs.combo*0.05));
        } else {
            // Kaçtı — sadece cleanup, ödül yok
            const gs2=GS; if(gs2) gs2.miniBossActive=false;
            try{ if(p._hpBarGfx) p._hpBarGfx.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            try{ if(p._hpFillGfx) p._hpFillGfx.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
            try{ if(p._hpBarTick) p._hpBarTick.remove(); }catch(e){console.warn("[NT] Hata yutuldu:",e)}
        }
        try{p.setAlpha(0);p.disableBody(true,true);}catch(e){console.warn("[NT] Hata yutuldu:",e)}
        return;
    }

    // Düşman rengini al
    const typeColors={normal:0xFF88CC,fast:0xFF6699,tank:0xAA55FF,shield:0x55BBFF,kamikaze:0xFFBB55,ghost:0xDDBBFF,
        split:0xFFEE44,swarm:0xFFBB66,elder:0xFFCC44,spinner:0xFF55DD,armored:0x9977FF,bomber:0xFF9966,
        stealth:0x44FFDD,healer:0x66FFAA,magnet:0xFFCC33,mirror:0xCCAAFF,berserker:0xFF7799,absorber:0x33EEFF,
        chain:0x77AAFF,freezer:0xAAEEFF,leech:0xFF77BB,titan:0xDD55FF,shadow:0xBB88FF,spiker:0xFFDD66,
        vortex:0x33FFCC,phantom:0xEEBBFF,rusher:0xFFAA55,splitter:0x88FF88,toxic:0xBBFF44,colossus:0xFF66AA,
        inferno:0xFF9977,glacier:0x66DDFF,phantom_tri:0xFF55FF,volt:0xFFFF66,obsidian:0xCC77FF,zigzag:0x88FF88};
    const deathColor=typeColors[p.type]||0xff88cc;

    // Tip bazlı debris/kum renkleri — yeni piramitler için özel palet
    const debrisColMap={
        pyramid1:[0xFF4500,0xFFD700,0xFF6000,0xFFAA00],
        pyramid2:[0xDAA520,0x8B6914,0xC8960C,0xFFD700],
        pyramid3:[0xFF00FF,0x00FFFF,0xFFD700,0x8B00FF],
        pyramid4:[0x9400D3,0x4B0082,0x6A0DAD,0xCC44FF]
    };
    const sandCols=debrisColMap[p.type]||[0xddaa55,0xcc9944,0xeecc77,0xbbaa66];

    // ── AAA ÖLÜM VFX — büyük/elite düşmanlar için ekstra efekt ──
    if(!p.isBoss&&p.type!=="minion"&&!p._groundKill&&(p.elite||p.titan||p.colossus||p.elder||p.obsidian||p.glacier||p.inferno)){
        vfxEnemyDeath(S,px,py,p.type,p.scaleX||1);
    }

    // ── DEATH SCREEN SHAKE — subtle for normals, punchy for elites/big enemies ──
    if(!p.isBoss && p.type!=="minion" && !p._groundKill){
        const _shakeAmt = p.elite ? 0.0018 : (p.titan||p.colossus) ? 0.0025 : 0.0006;
        const _shakeDur = p.elite ? 80 : (p.titan||p.colossus) ? 100 : 40;
        if(!p.elite || Math.random()<0.7) S.cameras.main.shake(_shakeDur, _shakeAmt);
    }

    // ── DEATH COLOR RING — quick expanding ring in enemy's color ──
    if(!p.isBoss && p.type!=="minion" && !p._groundKill && _perfMode==="high"){
        const _dr = S.add.graphics().setDepth(20);
        _dr.x=px; _dr.y=py;
        _dr.lineStyle(p.elite?2.5:1.5, deathColor, 0.80);
        _dr.strokeCircle(0, 0, Math.max(10, (p.displayWidth||40)*0.35));
        S.tweens.add({targets:_dr, scaleX:p.elite?3.5:2.5, scaleY:p.elite?3.5:2.5,
            alpha:0, duration:p.elite?220:150, ease:"Quad.easeOut",
            onComplete:()=>{try{_dr.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    }

    // ── EXPLODE ANİMASYONU ──
    // _groundKill=true ise zemin çarpması zaten patlama yaptı — tekrar yapma
    if(!p.isBoss&&p.type!=="minion"&&!p._groundKill){
        try{
            NT_SFX.play("pixel_explode");
            doExplodeVFX(S, px, py, deathColor, p.scaleX||1);
            // ── VFX v2 kill reward ──
            vfxEnemyKillReward(S,px,py,p.type,p.elite,p.isBoss||false);
            const particleCount=p.elite?8:p.titan||p.colossus||p.obsidian?10:5;
            const rainbowDebris=[0xFF00FF,0x00FFFF,0xFFD700,0x8B00FF,0xFF8C00,0x00FF88];
            for(let i=0;i<particleCount;i++){
                const ang=Phaser.Math.DegToRad(i*(360/particleCount)+Phaser.Math.Between(-15,15));
                const spd=Phaser.Math.Between(40,110)*(p.elite?1.4:1);
                const sz=Phaser.Math.Between(2,p.elite?7:4);
                let col;
                if(p.volt) col=i%2===0?0xffee00:0xffffff;
                else if(p.inferno) col=i%2===0?0xFF9977:0xFFCC88;
                else if(p.glacier) col=i%2===0?0x44ccff:0xaaeeff;
                else if(p.phantom_tri) col=i%2===0?0xcc44ff:0xffffff;
                else if(p.obsidian) col=i%2===0?0x6600aa:0xcc88ff;
                else col=i%3===0?deathColor:i%3===1?0xffffff:0xffcc44;
                const dp=S.add.graphics().setDepth(16);
                dp.x=px; dp.y=py;
                const dpAng=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
                dp.lineStyle(Math.max(1,sz*0.5),col,0.9);
                dp.lineBetween(0,0,Math.cos(dpAng)*sz,Math.sin(dpAng)*sz);
                S.tweens.add({
                    targets:dp,
                    x:px+Math.cos(ang)*spd, y:py+Math.sin(ang)*spd*0.7,
                    alpha:0, scaleX:0.1, scaleY:0.1,
                    duration:Phaser.Math.Between(200,450),
                    ease:"Quad.easeOut",
                    onComplete:()=>dp.destroy()
                });
            }
            // ── Kıvılcım ──
            const dw=Math.max(12,p.displayWidth);
            const sparkCount=p.elite?4:p.titan||p.colossus?6:2;
            for(let _sk=0;_sk<sparkCount;_sk++){
                const _sa2=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
                const _ss2=Phaser.Math.Between(15,dw*1.8);
                const _spk=S.add.graphics().setDepth(22);
                _spk.x=px; _spk.y=py;
                _spk.fillStyle(_sk%2===0?deathColor:0xffffff,0.9);
                _spk.fillRect(-0.8,-3,1.6,6);
                _spk.angle=Phaser.Math.Between(0,360);
                S.tweens.add({targets:_spk,
                    x:px+Math.cos(_sa2)*_ss2, y:py+Math.sin(_sa2)*_ss2*0.65,
                    alpha:0,scaleY:0.12,
                    duration:Phaser.Math.Between(120,260),ease:"Quad.easeOut",
                    onComplete:()=>_spk.destroy()});
            }

            // [FREEZE FIX] Kum parçacıkları: titan:14→7, elite:11→6, normal:7→4
            const sandCnt=p.titan||p.colossus||p.elder?7:p.elite?6:4;
            for(let _si=0;_si<sandCnt;_si++){
                const _sa=Phaser.Math.DegToRad(Phaser.Math.Between(155,385));
                const _ss=Phaser.Math.Between(18,65)*(p.elite?1.5:1);
                const _sw=Phaser.Math.Between(2,p.elite?7:5);
                const _sd=S.add.graphics().setDepth(12);
                _sd.x=px; _sd.y=py;
                _sd.lineStyle(Math.max(1,_sw*0.5),sandCols[_si%4],0.85);
                _sd.lineBetween(0,0,Math.cos(_sa)*_sw,Math.sin(_sa)*_sw);
                S.tweens.add({targets:_sd,
                    x:px+Math.cos(_sa)*_ss, y:py+Math.sin(_sa)*_ss*0.4+6,
                    scaleX:0.08,scaleY:0.08,alpha:0,
                    duration:Phaser.Math.Between(180,420),ease:"Quad.easeOut",
                    onComplete:()=>_sd.destroy()});
            }

            // ── Zemin lekesi + hafif çatlak çizgisi ──
            const stain=S.add.graphics().setDepth(3);
            stain.fillStyle(0x110800,0.32);
            stain.fillEllipse(px,GROUND_Y-1,dw*1.5,dw*0.3);
            // Kısa çatlak çizgileri (sadece zemine yakın düşmanlar için)
            if(py>GROUND_Y-60){
                for(let _cr=0;_cr<3;_cr++){
                    const _ca=Phaser.Math.DegToRad(Phaser.Math.Between(170,370));
                    const _cl=Phaser.Math.Between(4,12);
                    stain.lineStyle(1,0x0d0500,0.35);
                    stain.lineBetween(px,GROUND_Y,px+Math.cos(_ca)*_cl,GROUND_Y+Math.sin(_ca)*_cl*0.3);
                }
            }
            S.tweens.add({targets:stain,alpha:0,duration:1100,ease:"Quad.easeIn",onComplete:()=>stain.destroy()});

            // ── YENİ PİRAMİT ÖZEL ÖLÜM VFX ──────────────────────────
            if(p.shadow&&!p.shadowSpawned&&giveXP){
                p.shadowSpawned=true;
                // Shadow ölünce 1 yarı boyutlu klon bırakır
                S.time.delayedCall(120,()=>{
                    if(!GS||GS.gameOver) return;
                    const _sc=S.pyramids.get(px+Phaser.Math.Between(-25,25),py-5,"pyramid");
                    if(_sc){_sc.setActive(true).setVisible(true);resetEF(_sc);
                        _sc.type="shadow";_sc.shadow=true;_sc.shadowSpawned=true; // klon tekrar bölünmez
                        _sc.hp=_sc.maxHP=Math.max(1,Math.round(p.maxHP*0.35));
                        _sc.setDisplaySize(50,41).setTint(0xCCAAFF).setVelocityY(GS.pyramidSpeed*0.85);
                        _sc.spawnProtected=false;_sc._originalTint=0xCCAAFF;
                        _sc.body.setSize(22,22).setOffset(5,5);}
                });
            }
            if(p.phantom_tri&&!p._splitDone){
                // Phantom Tri: ölünce 2 küçük klon spawn eder
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
            if(p.obsidian){
                // Kor-turuncu kıvılcım sıçraması — ateşli toz bulutu
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
            if(p.phantom_tri||p.volt){
                // Gökkuşağı toz bulutu — her parçacık farklı renk, geniş açılma
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
            if(p.obsidian||p.glacier){
                // Mor enerji patlaması + karanlık duman halkası
                const darkRing=S.add.graphics().setDepth(19);
                darkRing.x=px; darkRing.y=py;
                darkRing.lineStyle(3,0x9400D3,0.9); darkRing.strokeCircle(0,0,10);
                S.tweens.add({targets:darkRing,scaleX:5,scaleY:5,alpha:0,
                    duration:350,ease:"Quad.easeOut",onComplete:()=>darkRing.destroy()});
                // İkinci mor halka
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
        // Boss ölümü — EPİK SLOW-MO WOW MOMENT
        if(p.isBoss){
            // Slow-motion patlaması — try/finally ile timeScale her zaman sıfırlanır
            S.time.timeScale=0.18;
            const resetTimeScale=()=>{ try{ if(S&&S.time) S.time.timeScale=1.0; }catch(e){console.warn("[NT] Hata yutuldu:",e)} };
            S.time.delayedCall(1200,resetTimeScale);
            S.cameras.main.shake(100,0.012);
            
            S.cameras.main.zoomTo(1.04,160,"Quad.easeOut");
            S.time.delayedCall(200,()=>S.cameras.main.zoomTo(1.0,500,"Quad.easeIn"));
            // Büyük halka patlaması
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
                showHitTxt(S,px,py-40,"BOSS OLDU!","#ffcc00",true);
            });
        }
        p.disableBody(true,true);
        if(p._shadowGfx){try{p._shadowGfx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}p._shadowGfx=null;}
    }

    if(p.split&&giveXP){for(let i=0;i<2;i++){const sp2=S.pyramids.get(px+Phaser.Math.Between(-20,20),py-5,"pyramid");if(sp2){sp2.setActive(true).setVisible(true);resetEF(sp2);sp2.type="minion";sp2.hp=1;sp2.maxHP=1;sp2.setScale(0.55).setVelocityY(GS.pyramidSpeed*0.65);sp2.spawnProtected=false;sp2.setTint(0xffcc44);sp2.body.setSize(20,20).setOffset(5,5);}}}
    if(p.splitter&&giveXP){for(let i=0;i<3;i++){const ss=S.pyramids.get(px+Phaser.Math.Between(-22,22),py-5,"pyramid");if(ss){ss.setActive(true).setVisible(true);resetEF(ss);ss.type="minion";ss.hp=1;ss.maxHP=1;ss.setScale(0.48).setVelocityY(GS.pyramidSpeed*0.72);ss.spawnProtected=false;ss.setTint(0xff4422);ss.body.setSize(18,18).setOffset(5,5);}}}

    // ADIM 3: Heavy Cannon splash hasarı — öldürülen düşmanın yakınındakilere %40 hasar
    if(gs.activeWeapon === "heavy_cannon" && giveXP && !p._isMiniBoss){
        const _splashList = S._activeEnemies || [];
        _splashList.forEach(e => {
            if(!e || !e.active || e === p) return;
            const dx = e.x - px, dy = e.y - py;
            if(dx*dx + dy*dy < 60*60) applyDmg(S, e, gs.damage * 0.28, false); // [BALANCE] 0.40→0.28: geç oyun küme dominansı azaltıldı
        });
    }

    // [BALANCE] Sandık sadece güçlü düşmanlardan düşer — normal düşmandan kaldırıldı
    const isEl=p.elite, isBO=p.isBoss;
    const isStrong=isBO||isEl||p.elder||p.titan||p.colossus||p.armored||p._isMiniBoss||p.obsidian;
    // [FIX] Chest and rewards only on actual player kill (giveXP=true), not on ground escape
    const dc=(isBO?0.55:p._isMiniBoss?0.28:isEl?0.04:p.elder?0.03:p.titan||p.colossus?0.02:p.obsidian?0.015:p.glacier?0.008:p.inferno||p.volt?0.008:p.armored?0.008:0);
    if(giveXP&&isStrong&&Math.random()<dc) spawnChest(S,px,py-10);

    if(p.isBoss){
        gs.bossActive=false; gs._bossKills=(gs._bossKills||0)+1;
        NT_SFX.setMusicState("gameplay", 3.0); // boss öldü — gameplay müziğine geri dön
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


    // Elite/Titan kill VFX
    if(p.elite&&!p.isBoss){
        showHitTxt(S,px,py-22,"★ ELİT ÖLDÜRÜLDÜ ★","#ffdd00",true);
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
        showHitTxt(S,px,py-22,"DEV YIKILDI!","#aa44ff",true);
        S.cameras.main.shake(60,0.008);
    }

    // Elite Hunt bonus
    if((p.elite||p.isBoss)&&gs._eliteHuntCount>0){
        gs._eliteHuntCount--;
        showHitTxt(S,px,py-20,"ELİT AV BONUS!","#ffdd44",true);
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

    // XP DROP — erken oyun bol XP (hızlı level), geç oyun dengeli
    if(S.xpOrbs.length < 40){
        // [BALANCE v2] lvBonus azaltıldı — erken levellerde aşırı XP patlama önlenir
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
    const healDropChance = p.isBoss?0:p.elite?0.05:p.obsidian?0.04:p.tank||p.armored?0.04:p.glacier||p.inferno?0.03:p.swarm||p.type==="minion"?0:0.015;
    if(Math.random()<healDropChance){
        const hDrop=S.add.image(px,py-8,"tex_heart").setDepth(18).setScale(1.0);
        let hLife=5500;
        let hVY=-65;
        let hFloatT=0;
        // Pulse scale animasyonu
        S.tweens.add({targets:hDrop,scaleX:1.12,scaleY:1.12,duration:420,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
        // Glow + healing aura parçacıkları
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
                hVY=Math.sin(hFloatT)*8; // yerde hafif zıplama
            }
            // Glow — kalın kırmızı + ince yeşil halka
            hGlow.clear();
            const glA=0.35+Math.sin(hAuraT*2.5)*0.18;
            hGlow.fillStyle(0xff2244,glA*0.08); hGlow.fillCircle(hDrop.x,hDrop.y,18);
            hGlow.lineStyle(2.5,0xff4466,glA); hGlow.strokeCircle(hDrop.x,hDrop.y,14+Math.sin(hAuraT*2)*2);
            hGlow.lineStyle(1.5,0xff8899,glA*0.5); hGlow.strokeCircle(hDrop.x,hDrop.y,20+Math.sin(hAuraT*1.4)*3);
            // Healing aura parçacığı — her ~40 frame'de bir
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
            // Oyuncuya yakınsa topla
            const hdx=S.player.x-hDrop.x,hdy=(S.player.y-20)-hDrop.y;
            if(hdx*hdx+hdy*hdy<50*50){
                GS.health=Math.min(GS.maxHealth,GS.health+3);
                GS._healFlash=400;
                showHitTxt(S,hDrop.x,hDrop.y-14,"+3 ❤","#ff8888",false);
                hTick.remove();
                S.tweens.killTweensOf(hDrop);
                // Collect burst — yeşil/kırmızı ışık patlaması
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

    // [v10.1] Altın düşürme — daha çeşitli ve zaman bazlı hafif skala
    // Normal düşman: 1 altın (her zaman sabit — tahmin edilebilir ekonomi)
    // Elite/elder: 2-3, boss: 8, özel tipler: 2
    // [v10.1] Altın ekonomisi: zaman bonusu daha yavaş büyüyor, exploit önlendi
    // Eski: her 3dk +%15 (max +%60 @ 12dk) → abusable with gold rush event
    // Yeni: her 4dk +%12 (max +%48 @ 16dk) → daha yavaş büyüme, anlamlı seçim
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
    // Fiziksel debris — parçalar zemine düşer
    spawnFallingDebris(S,px,py,p.type,p.isBoss||p.titan||p.colossus);
    // [OPT] GS evolution flag'leri kullan — EVOLUTIONS.find'dan kaçın
    // [v11] REGEN — on-kill combat healing
    // Lv1: her 4. öldürmede +1 HP | Lv2: her 3. öldürmede +1 HP
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

    // [v11] SPLIT SHOT — öldürme tetikli fragment spawn
    // splitLevel Lv1: 2 fragment %50 hasar, Lv2: 2 fragment %65 hasar, Lv3: 3 fragment %65 hasar
    // Boss ve mini-boss öldürmesi de tetikler (güçlü ödül)
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
        // Küçük VFX — mor kıvılcım patlaması
        const splitFx = S.add.graphics().setDepth(20);
        splitFx.lineStyle(1.5, 0xcc44ff, 0.85);
        splitFx.strokeCircle(px, py, 6);
        S.tweens.add({targets:splitFx, scaleX:3, scaleY:3, alpha:0, duration:180,
            ease:"Quad.easeOut", onComplete:()=>{try{splitFx.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    }
}

// ── YARDIMCILAR ──────────────────────────────────────────────
// [OPT] _activeEnemies cache kullan — getMatching yeni array oluşturur
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
// [FREEZE BUG FIX] Düşman hızı artık gerçekten sıfırlanıyor + buz overlay eklendi
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

    // Buz kristal parçacıkları — daha büyük, daha çok
    for(let i=0;i<12;i++){
        const ang=Phaser.Math.DegToRad(i*30+Phaser.Math.Between(-10,10));
        const spd=Phaser.Math.Between(28,60);
        const sz=Phaser.Math.Between(3,7);
        const ic=S.add.graphics().setDepth(20);
        ic.fillStyle(i%2===0?0xaaeeff:0xffffff,0.9);
        ic.fillRect(-sz/2,-sz,sz,sz*2); // buz shard şekli
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

    // Buz overlay halkası — çok daha büyük ve parlak
    const iceRing=S.add.graphics().setDepth(19);
    iceRing.x=e.x; iceRing.y=e.y;
    iceRing.lineStyle(4,0x44ddff,1.0); iceRing.strokeCircle(0,0,18);
    iceRing.lineStyle(2,0xaaffff,0.8); iceRing.strokeCircle(0,0,28);
    iceRing.fillStyle(0x88ddff,0.28); iceRing.fillCircle(0,0,18);
    S.tweens.add({targets:iceRing,scaleX:2.2,scaleY:2.2,alpha:0,duration:400,ease:"Quad.easeOut",onComplete:()=>iceRing.destroy()});

    // [VFX] Kalıcı buz kristali — freeze süresince düşman üzerinde döner — büyütüldü
    const iceCrystal=S.add.graphics().setDepth(20);
    // Ana kristal çapraz
    iceCrystal.fillStyle(0x44ddff,0.85); iceCrystal.fillRect(-4,-14,8,28);
    iceCrystal.fillStyle(0x88eeff,0.70); iceCrystal.fillRect(-14,-4,28,8);
    // Köşegen kollar
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

    // Düşman üzerinde donma overlay
    const iceOverlay=S.add.graphics().setDepth(15);
    // Dikdörtgen yerine elips — daha doğal görünüm
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
        // Hasar almaz ama combo düşer
        gs.combo = Math.max(0, gs.combo - 5);
        gs.invincible=false;
        return;
    }
    gs.health--;
    NT_SFX.play("player_hurt");
    S.cameras.main.shake(14,0.003);
    // ── AAA PLAYER HURT VFX ──
    vfxPlayerHurt(S);
    tickNearDeath(S);
    if(gs.health<=0){
        // [ADIM 6d] Phoenix Ash relic — otomatik diriliş
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

            // [VFX WOW] DİRİLİŞ — sinematik efekt
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
        // Kristal ile diriliş seçeneği
        if(PLAYER_CRYSTAL >= CRYSTAL_COSTS.revive && !gs._crystalReviveUsed){
            showCrystalRevivePrompt(S);
            return;
        }
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

    // Başlık
    A(S.add.text(CX,stripCY,"✦  "+L("goRevivePrompt"),
        NT_STYLE.title(17,"#ffffff","#5a0000")).setOrigin(0.5).setDepth(D+1));

    let cy=contentTop+10;

    // Maliyet satırı
    const costLine=CURRENT_LANG==="en"?"3 crystals will be spent":
                   CURRENT_LANG==="ru"?"Потратится 3 кристалла":"3 kristal harcanacak";
    A(S.add.text(CX,cy,costLine,NT_STYLE.body(13,"#cc99ff")).setOrigin(0.5,0).setDepth(D+1));
    cy+=24;

    // Bakiye
    const gemColor=PLAYER_CRYSTAL>=CRYSTAL_COSTS.revive?"#cc99ff":"#ff4444";
    A(S.add.text(CX,cy,L("goReviveCrystalCost")+" "+PLAYER_CRYSTAL+" GEM",
        NT_STYLE.accent(14,gemColor)).setOrigin(0.5,0).setDepth(D+1));
    cy+=32;

    // Geri sayım dairesi
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

    let countdown=8;
    const cdTxt=A(S.add.text(CX,cdY,String(countdown),
        NT_STYLE.title(22,"#ffffff","#000000")).setOrigin(0.5).setDepth(D+2));

    // Sayım tween (smooth arc) + event (sayı)
    const cdTw=S.tweens.add({targets:{v:8},v:0,duration:8000,ease:"Linear",
        onUpdate:(tw)=>drawCd(tw.targets[0].v)
    });
    const cdEv=S.time.addEvent({delay:1000,repeat:7,callback:()=>{
        countdown--;
        if(cdTxt&&cdTxt.active) cdTxt.setText(countdown>0?String(countdown):"!");
        if(countdown<=0){ cleanup(); gs._crystalReviveUsed=true; gameOver(S); }
    }});

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

    // Hayır butonu — içerik alanının altında, footer'ın hemen üstünde
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
    const noLbl=CURRENT_LANG==="en"?"No, end game":CURRENT_LANG==="ru"?"Нет, завершить":"Hayır, bitir";
    A(S.add.text(CX,nY,noLbl,NT_STYLE.stat(12,"#777788")).setOrigin(0.5).setDepth(D+1));
    A(S.add.rectangle(CX,nY,124,26,0xffffff,0.001).setDepth(D+2)
        .setInteractive({useHandCursor:true})
        .on("pointerover",()=>_dN(true))
        .on("pointerout",()=>_dN(false))
        .on("pointerdown",()=>{ cleanup(); gs._crystalReviveUsed=true; gameOver(S); }));

    // DİRİL butonu — footer altın şeridinde, tam genişlik
    NT_YellowBtn(S,CX,btnCY,220,44,L("goReviveBtn"),D,()=>{
        if(!spendCrystal(CRYSTAL_COSTS.revive)){ gameOver(S); return; }
        gs._crystalReviveUsed=true;
        gs.health=Math.ceil(gs.maxHealth*0.5);
        gs._healFlash=1000;
        gs.invincible=true; gs._invT=0;
        cleanup();
        S.physics.resume();
        if(S.spawnEvent) S.spawnEvent.paused=false;
        S.cameras.main.shake(150,0.018);
        showHitTxt(S,180,240,L("crystalRevived"),"#cc44ff",true);
        if(S._crystalHudText) S._crystalHudText.setText("GEM "+PLAYER_CRYSTAL);
        S.time.delayedCall(1000,()=>{ if(GS){ GS.invincible=false; GS._invT=0; }});
    }).forEach(o=>A(o));

    // İçerikleri fade-in
    objs.forEach(o=>{
        if(o===sprite) return;
        try{ o.setAlpha(0); S.tweens.add({targets:o,alpha:1,duration:150,delay:90}); }catch(_){}
    });
}

// ── UI GROUP — memory-safe obje yönetimi ──────────────────────
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
// ★★★ YENİ SİSTEMLER BLOĞU — MEVCUT KODA DOKUNULMADI ★★★
// ═══════════════════════════════════════════════════════════════

// ── SİNERJİ SİSTEMİ ──────────────────────────────────────────
function checkAndApplySynergies(S){
    const gs=GS;
    SYNERGIES.forEach(syn=>{
        if(syn.active) return; // zaten aktif
        const allMet=syn.req.every(key=>UPGRADES[key]&&UPGRADES[key].level>=syn.reqLv);
        if(!allMet) return;
        syn.active=true;
        syn.apply(gs);
        // Sinerji aktive görsel bildirimi
        showSynergyNotification(S, syn);
    });
}

// ══════════════════════════════════════════════════════════════
// [VFX POLISH] SİNERJİ BİLDİRİMİ — WOW MOMENT
// Sinerji aktif olunca: ekran flaşı → kısa slow-motion → büyük başlık → özel efekt
// ══════════════════════════════════════════════════════════════
function showSynergyNotification(S, syn){
    const W=360, H=640;
    const label=LLang(syn,"name","nameEN","nameRU");
    const desc=LLang(syn,"desc","descEN","descRU");

    // ★ GAME FEEL: Power spike
    triggerPowerSpike(S, "synergy");

    // [VFX] 1. Güçlü kamera efektleri
    S.cameras.main.shake(70, 0.008);
    
    S.cameras.main.zoomTo(1.06, 120, "Quad.easeOut");
    S.time.delayedCall(120, ()=> S.cameras.main.zoomTo(1.0, 280, "Quad.easeIn"));

    // [VFX] 2. Kısa slow-motion efekti — sinematik his
    S.time.timeScale = 0.25;
    S.time.delayedCall(600, ()=>{ S.time.timeScale = 1.0; });

    // [VFX] 3. Tam ekran renk overlay — anlık burst
    const burstOv = S.add.rectangle(W/2, H/2, W, H, syn.color, 0).setDepth(698);
    S.tweens.add({ targets:burstOv, fillAlpha:0.18, duration:80, yoyo:true,
        onComplete:()=> burstOv.destroy() });

    // [VFX] 4. Merkez halka patlaması — büyük
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

    // [VFX] 5. Büyük SİNERJİ başlığı — ekran ortasında, scale-in
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

    // [VFX] 6. Sinerji adı — başlığın altında
    const synLabel = S.add.text(W/2, H/2+12, syn.icon+" "+label, {
        font:"bold 15px LilitaOne, Arial, sans-serif", color:"#ffffff"
    }).setOrigin(0.5).setDepth(702).setAlpha(1).setVisible(false);
    S.tweens.add({ targets:synLabel, alpha:1, y:H/2+8, duration:240,
        ease:"Back.easeOut", delay:100 });
    S.time.delayedCall(1300, ()=>{
        S.tweens.add({ targets:synLabel, alpha:0, y:H/2-10, duration:220,
            onComplete:()=>{ try{ synLabel.destroy(); }catch(e){console.warn("[NT] Hata yutuldu:",e)} } });
    });

    // [VFX] 7. Alt panel — açıklama, sağdan kayar
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

    // [VFX] 8. Parçacık patlaması — 18→10 adet
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

// ── MINI BOSS SİSTEMİ ────────────────────────────────────────
function spawnMiniBoss(S){
    const gs=GS;
    if(gs.miniBossActive||gs.level<4) return;
    const def=MINI_BOSS_POOL[Phaser.Math.Between(0,MINI_BOSS_POOL.length-1)];
    const p=S.pyramids.get(180,-60,"pyramid");
    if(!p) return;
    p.setActive(true).setVisible(true);
    resetEF(p);

    // ── Temel stats ──────────────────────────────────────────────
    p.hp=p.maxHP=Math.round((def.hp*0.55)+gs.level*0.5); // [BALANCE] significantly reduced HP
    p.armor=def.armor;
    p.type="miniboss";
    p._isMiniBoss=true;
    p.isBoss=false;

    // ── Görsel + Behavior: per candy boss ──────────────────────
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
    // [FIX] Miniboss hız: pyramidSpeed*def.speed erken oyunda bile çok hızlı çıkıyordu.
    // Sabit max cap: 55 px/s — oyuncunun tepki verebileceği, dramatik giriş hissi veren hız.
    // Geç oyunda pyramidSpeed yüksek olsa bile miniboss tehdidi hızdan değil HP/armor'dan gelir.
    const _mbSpeed = Math.min(55, gs.pyramidSpeed * def.speed);
    p.setVelocityY(_mbSpeed);
    p.spawnProtected=true;
    gs.miniBossActive=true;
    // [FIX] Miniboss hitbox — önceki hesap scaleX/Y'den kaynaklı hatalıydı.
    // Phaser body.setSize() UNSCALED (orijinal texture piksel) değer ister.
    // pyramid texture frame: 183x112. setDisplaySize ile scale değişir ama
    // body.setSize'a geçirilecek değer displaySize / scaleX değil, doğrudan
    // orijinal texture üzerindeki boyut olmalı.
    // Formül: bodyW = displayWidth / scaleX  → ama setDisplaySize scaleX'i de değiştiriyor
    // Güvenli yol: body'i resetle, sonra displaySize'a göre yeniden ayarla.
    {
        const dw = p.displayWidth  || 100;
        const dh = p.displayHeight || 82;
        // body.reset() ile physics body'i sprite merkezine hizala
        if(p.body) p.body.reset(p.x, p.y);
        // Hitbox: display boyutunun %78 genişlik, %70 yüksekliği — iyi overlap için büyük
        const bw = Math.round(dw * 0.78);
        const bh = Math.round(dh * 0.70);
        // setSize'a geçilen değer: Phaser bunu scaleX ile çarpar, bu yüzden scale'i böl
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
        // Ek güvence: setVelocityY sonrası body doğrulaması
        if(!p.body.enable) p.body.enable = true;
    }

    // ── Giriş animasyonu ─────────────────────────────────────────
    S.tweens.add({targets:p, alpha:1, duration:500, ease:"Quad.easeOut"});
    S.time.delayedCall(300,()=>{ if(p.active) p.spawnProtected=false; });

    // ── HP Bar (mini boss özel) ───────────────────────────────────
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

    // [VFX] Mini Boss spawn — hafifletilmiş
    S.cameras.main.shake(120, 0.012);
    S.cameras.main.zoomTo(1.04, 160, "Quad.easeOut");
    S.time.delayedCall(160, ()=> S.cameras.main.zoomTo(1.0, 300, "Quad.easeIn"));

    // 2. Kısa slow-motion — daha yavaş giriş
    S.time.timeScale = 0.15;
    S.time.delayedCall(800, ()=>{ S.time.timeScale = 1.0; });

    // 4. Halka patlaması — ekran ortasından
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
    // Sol/sağ accent barlar
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

    // Uyarı yanıp sönmesi
    S.tweens.add({ targets:warnTxt, alpha:0.35, duration:320,
        yoyo:true, repeat:4, delay:300 });

    // 6. Zemin titreşim efekti — küçük parçacıklar
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

    // Ödüller
    // [FIX] Mini boss %40 şansla tek sandık
    if(Math.random()<0.40){ spawnChest(S,p.x,p.y-10); }

    // XP patlaması — [BALANCE v2] 12→5 orb, değer düşürüldü (ani multi-level-up önlenir)
    for(let i=0;i<5;i++){
        S.time.delayedCall(i*80,()=>{
            spawnXpOrb(S,p.x+Phaser.Math.Between(-40,40),p.y+Phaser.Math.Between(-20,20),
                "xp_gold", Math.round((2+gs.level*0.3)*def.reward.xpMult));
        });
    }

    // (relic offer on miniboss removed — artifact chosen at game start only)

    // Büyük patlama efekti — 20→8 adet
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

    showHitTxt(S,p.x,p.y-30,"MİNİ BOSS ÖLDÜ!","#ffcc00",true);
}

// ── RUN EVENT SİSTEMİ ────────────────────────────────────────
function triggerRunEvent(S){
    const gs=GS;
    if(!gs||gs.gameOver||_upgradeLock>0) return;
    // EventManager enforces: 1 active, 120s cooldown, boss-blocked
    if(!EventManager.canTrigger(gs)) return;
    const ev=RUN_EVENTS[Phaser.Math.Between(0,RUN_EVENTS.length-1)];
    // [FIX] startEvent burada çağrılıyor — hem "Kabul Et" hem "Reddet" durumunda
    // EventManager._activeEvent set edilmiş olur. endEvent her iki durumda da
    // _lastEndTime'ı doğru günceller → cooldown düzgün çalışır.
    // Önceden sadece "Kabul Et" callback'lerinde startEvent çağrılıyordu,
    // "Reddet"te endEvent _activeEvent=null ile çalışıyordu → cooldown sıfırlanmıyordu.
    EventManager.startEvent("event_pending", gs, 60000, null);
    showRunEventUI(S,ev);
}

// [UI REDESIGN] showRunEventUI — profesyonel kart tasarımı
// Önceki: basit rect panel + küçük butonlar
// Şimdi: merkezlenmiş modal, icon circle, büyük butonlar, slide-in animasyon
function showRunEventUI(S, ev){
    const gs=GS;
    if(gs.pickingUpgrade || _upgradeLock > 0) return;
    lockUpgrade(gs, S);
    const W=360,H=640;
    const ui=new UIGroup(S);

    // Dark overlay
    const ov=ui.add(S.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(800));
    S.tweens.add({targets:ov,fillAlpha:0.82,duration:220});

    // [UI POLISH P2] Panel — iki alt alta buton için yükseklik artırıldı
    const PANEL_H_BASE=ev.choices.length===3?420:360;
    const PANEL_W=336, PANEL_H=PANEL_H_BASE;
    const PANEL_X=(W-PANEL_W)/2, PANEL_Y=Math.max(10,(H-PANEL_H)/2-15);
    const pg=ui.add(S.add.graphics().setDepth(801));

    // Panel çizimi
    const drawPanel=()=>{
        pg.clear();
        // Arka plan
        pg.fillStyle(0x07030f,0.98); pg.fillRoundedRect(PANEL_X,PANEL_Y,PANEL_W,PANEL_H,10);
        // Üst accent bar
        pg.fillStyle(ev.color,0.9); pg.fillRoundedRect(PANEL_X,PANEL_Y,PANEL_W,5,{tl:10,tr:10,bl:0,br:0});
        // Dış border
        pg.lineStyle(2,ev.color,0.8); pg.strokeRoundedRect(PANEL_X,PANEL_Y,PANEL_W,PANEL_H,10);
        // İç parlaklık çizgisi
        pg.lineStyle(1,ev.color,0.18); pg.strokeRoundedRect(PANEL_X+3,PANEL_Y+3,PANEL_W-6,PANEL_H-6,8);
        // Üst başlık alanı
        pg.fillStyle(ev.color,0.08); pg.fillRoundedRect(PANEL_X,PANEL_Y,PANEL_W,64,{tl:10,tr:10,bl:0,br:0});
    };
    drawPanel();

    // Icon dairesi — büyük, merkezlenmiş, renkli halka
    const icBg=ui.add(S.add.graphics().setDepth(802));
    icBg.fillStyle(ev.color,0.18); icBg.fillCircle(W/2,PANEL_Y+36,28);
    icBg.lineStyle(2.5,ev.color,0.8); icBg.strokeCircle(W/2,PANEL_Y+36,28);
    icBg.lineStyle(1,ev.color,0.3); icBg.strokeCircle(W/2,PANEL_Y+36,36);
    // Dış parlama halkası — pulse
    const icGlow=ui.add(S.add.graphics().setDepth(801));
    icGlow.fillStyle(ev.color,0.08); icGlow.fillCircle(W/2,PANEL_Y+36,36);
    S.tweens.add({targets:icGlow,scaleX:1.3,scaleY:1.3,alpha:0.3,duration:800,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

    const iconTxt=ui.add(S.add.text(W/2,PANEL_Y+36,ev.icon,{
        font:"24px LilitaOne, Arial, sans-serif"
    }).setOrigin(0.5).setDepth(803).setAlpha(0));
    // İkon pulse
    S.tweens.add({targets:iconTxt,scaleX:1.15,scaleY:1.15,duration:600,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

    // Başlık
    const title=LLang(ev,"title","titleEN","titleRU");
    const titleTxt=ui.add(S.add.text(W/2,PANEL_Y+74,title,{
        font:"15px LilitaOne, Arial, sans-serif",
        color:Phaser.Display.Color.IntegerToColor(ev.color).rgba
    }).setOrigin(0.5,0).setDepth(803).setAlpha(0));

    // Ayraç çizgisi
    const divG=ui.add(S.add.graphics().setDepth(802));
    divG.lineStyle(1,ev.color,0.3); divG.lineBetween(PANEL_X+20,PANEL_Y+96,PANEL_X+PANEL_W-20,PANEL_Y+96);

    // Açıklama
    const desc=LLang(ev,"desc","descEN","descRU");
    const descTxt=ui.add(S.add.text(W/2,PANEL_Y+104,desc,{
        font:"14px LilitaOne, Arial, sans-serif",color:"#ccccdd",
        wordWrap:{width:PANEL_W-40},align:"center",lineSpacing:5
    }).setOrigin(0.5,0).setDepth(803).setAlpha(0));

    // Butonlar — 2 veya 3 seçenek destekli
    const choiceCount=ev.choices.length;
    const BTN_BASE_Y=choiceCount===3?PANEL_Y+PANEL_H-152:PANEL_Y+PANEL_H-106;
    ev.choices.forEach((ch,i)=>{
        const isAccept=i===0;
        const is3=choiceCount===3;
        const BTN_W=282;
        const BTN_X=W/2-BTN_W/2;
        const BTN_Y=BTN_BASE_Y + i*52;
        const BTN_H=isAccept?48:40;
        const col=i===0?ev.color:i===1?0xffaa22:0x555566;

        const btnG=ui.add(S.add.graphics().setDepth(803));
        const drawBtn=hov=>{
            btnG.clear();
            if(isAccept){
                btnG.fillStyle(hov?col:0x000000,1);
                btnG.fillRoundedRect(BTN_X,BTN_Y,BTN_W,BTN_H,6);
                btnG.fillStyle(col,hov?0.25:0.12);
                btnG.fillRoundedRect(BTN_X,BTN_Y,BTN_W,BTN_H,6);
                btnG.lineStyle(2,col,hov?1.0:0.7);
                btnG.strokeRoundedRect(BTN_X,BTN_Y,BTN_W,BTN_H,6);
                // Shine
                btnG.fillStyle(0xffffff,hov?0.1:0.04);
                btnG.fillRoundedRect(BTN_X+2,BTN_Y+2,BTN_W-4,BTN_H/2-2,4);
            } else {
                btnG.fillStyle(0x111118,1);
                btnG.fillRoundedRect(BTN_X,BTN_Y,BTN_W,BTN_H,6);
                btnG.lineStyle(1,hov?0x888888:0x444455,hov?0.8:0.5);
                btnG.strokeRoundedRect(BTN_X,BTN_Y,BTN_W,BTN_H,6);
            }
        };
        drawBtn(false);

        const lbl=LLang(ch,"label","labelEN","labelRU");
        const btnTxt=ui.add(S.add.text(BTN_X+BTN_W/2,BTN_Y+BTN_H/2,lbl,{
            font:"15px LilitaOne, Arial, sans-serif",
            color:isAccept?"#ffffff":"#888888"
        }).setOrigin(0.5).setDepth(804).setAlpha(0));

        const hit=ui.add(S.add.rectangle(BTN_X+BTN_W/2,BTN_Y+BTN_H/2,BTN_W,BTN_H,0xffffff,0.001).setInteractive().setDepth(805));
        hit.on("pointerover",()=>{
            drawBtn(true);
            btnTxt.setColor("#ffffff");
            // [VFX] Hover: hafif kamera zoom
            if(isAccept){
                S.cameras.main.zoomTo(1.01,80,"Quad.easeOut");
            }
        });
        hit.on("pointerout",()=>{
            drawBtn(false);
            btnTxt.setColor(isAccept?"#ffffff":"#888888");
            if(isAccept) S.cameras.main.zoomTo(1.0,120,"Quad.easeIn");
        });
        hit.on("pointerdown",()=>{
            // [VFX WOW] Seçim efekti
            S.cameras.main.zoomTo(1.0,80,"Quad.easeIn");
            // Ses: kabul → button_confirm, diğer seçenekler → menu_click
            NT_SFX.play(isAccept ? "button_confirm" : "menu_click");
            
            if(isAccept){
                S.cameras.main.shake(35,0.006);
                // Parçacık patlaması
                const W2=360;
                for(let ei=0;ei<12;ei++){
                    S.time.delayedCall(ei*20,()=>{
                        const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
                        const ep=S.add.graphics().setDepth(810);
                        ep.x=BTN_X+BTN_W/2; ep.y=BTN_Y+BTN_H/2;
                        ep.fillStyle(col,0.9); ep.fillRect(-2,-2,4,4);
                        S.tweens.add({targets:ep,
                            x:ep.x+Math.cos(ang)*Phaser.Math.Between(30,80),
                            y:ep.y+Math.sin(ang)*Phaser.Math.Between(20,60),
                            alpha:0,scaleX:0.1,scaleY:0.1,
                            duration:Phaser.Math.Between(200,400),ease:"Quad.easeOut",
                            onComplete:()=>ep.destroy()});
                    });
                }
            }
            ch.fn(S);
            ui.fadeAndDestroy(180);
            S.time.delayedCall(200,()=>{ S.time.timeScale=1.0; unlockUpgrade(gs, S); });
        });

        // Buton animate
        S.time.delayedCall(180+i*60,()=>{
            S.tweens.add({targets:[btnG,btnTxt],alpha:1,duration:160,ease:"Quad.easeOut"});
        });
    });

    // Panel slide-in animasyonu
    pg.y=40; pg.setAlpha(0);
    S.tweens.add({targets:pg,y:0,alpha:1,duration:280,ease:"Back.easeOut"});

    // Diğer elementler fade-in — hızlı belirme (panel ile neredeyse eş zamanlı)
    S.time.delayedCall(20,()=>{
        S.tweens.add({targets:[iconTxt,titleTxt,descTxt],alpha:1,duration:200,ease:"Quad.easeOut"});
    });

    

    // Auto-close after 8s — treat as a decline (no permanent effect)
    S.time.delayedCall(8000,()=>{
        if(gs.pickingUpgrade&&!gs.gameOver){
            EventManager.endEvent(GS); // release event lock on timeout
            ui.fadeAndDestroy(200);
            S.time.delayedCall(220,()=>{ S.time.timeScale=1.0; unlockUpgrade(gs,S); });
        }
    });
}

// ── RELİK SİSTEMİ ────────────────────────────────────────────
// [v9.1] Artifact sistemi tamamen kaldırıldı.

// ══════════════════════════════════════════════════════════════
// [VFX POLISH] EVRİM SİNEMATİĞİ — en büyük wow moment
// ══════════════════════════════════════════════════════════════
function showEvolutionCinematic(S, evoName, evoColor){
    const W=360,H=640;

    // ★ GAME FEEL: Evolution power spike
    S.time.delayedCall(400, ()=>triggerPowerSpike(S, "evo"));

    // 1. Kamera efektleri — hafifletildi
    S.cameras.main.shake(120, 0.015);
    
    S.cameras.main.zoomTo(1.06, 160, "Quad.easeOut");
    S.time.delayedCall(160, ()=> S.cameras.main.zoomTo(1.0, 320, "Quad.easeIn"));

    // 2. Slow-motion — kısaltıldı
    S.time.timeScale = 0.35;
    S.time.delayedCall(600, ()=>{ S.time.timeScale = 1.0; });

    // 3. Renk overlay — daha hafif
    const colorOv = S.add.rectangle(W/2,H/2,W,H,evoColor,0).setDepth(597);
    S.tweens.add({targets:colorOv, fillAlpha:0.12, duration:80, yoyo:true,
        onComplete:()=>colorOv.destroy()});

    // 5. Çoklu halka patlaması — iç'ten dışa
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

    // 6. EVRİM ana yazısı — büyük, güçlü scale-punch
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
    // Nabız efekti
    S.time.delayedCall(320, ()=>{
        S.tweens.add({targets:evTxt, scaleX:1.08, scaleY:1.08,
            duration:400, yoyo:true, repeat:2, ease:"Sine.easeInOut"});
    });

    // 7. Evrim adı
    const evoLabel = S.add.text(W/2, H/2+18, evoName.toUpperCase(), {
        font:"bold 15px LilitaOne, Arial, sans-serif", color:"#ffffff"
    }).setOrigin(0.5).setDepth(607).setAlpha(1).setVisible(false);
    if(evoLabel&&evoLabel.setVisible){evoLabel.setVisible(true);evoLabel.setAlpha(0);}
    S.tweens.add({targets:evoLabel, alpha:1, y:H/2+12,
        duration:250, ease:"Back.easeOut", delay:90});

    // 8. Alt çizgi dekorasyon
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

    // 10. Parçacık patlaması — 32→14 adet
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

    // 11. Oyuncu etrafında büyük parlama
    S.time.delayedCall(50, ()=>{
        const aura=S.add.graphics().setDepth(605);
        aura.x=plx; aura.y=ply;
        aura.fillStyle(evoColor,0.45); aura.fillCircle(0,0,28);
        aura.fillStyle(0xffffff,0.25); aura.fillCircle(0,0,14);
        S.tweens.add({targets:aura, scaleX:3.5, scaleY:3.5, alpha:0,
            duration:500, ease:"Quad.easeOut", onComplete:()=>aura.destroy()});
    });
}

// ★ YENİ: Sinerji efekti — Flame + Poison doğrultusunda
// [v9.3] applyFlamePoison KALDIRILDI — flame/meteor sistemi silindi

// ★ YENİ: Chain Storm sinerjisi — Lightning crit uygular
function applyChainStormToLightning(S,target){
    if(!GS._synergyChainStorm) return;
    if(target&&target.active) applyDmg(S,target,GS.damage*0.5,true); // force crit
}

// ★ YENİ: Perfect hit'e görev sayacı (doShoot callback'te çağırılır)
function trackPerfectHit(gs){
    gs.questProgress.perfect=(gs.questProgress.perfect||0)+1;
    // Perfect hit sesi — combo'ya göre pitch artar
    NT_SFX.play("perfect_hit", gs.combo||0);
    // [ADIM 4] Desert Eye relic — perfect hit %3 şansla crystal
    if(gs._relicDesertEye && Math.random()<0.03){
        addCrystal(1,"desert_eye");
    }
}

// ═══════════════════════════════════════════════════════════════
// ★★★ YENİ SİSTEMLER BLOĞU SONU ★★★
// ═══════════════════════════════════════════════════════════════

function gameOver(S){
    const gs=GS; if(!gs||gs.gameOver) return; gs.gameOver=true;
    NT_SFX.play("game_over");
    NT_SFX.stopMusic(1.8);
    NT_SFX.stopWindAmbience(2.0);
    // Müzik state'i sıfırla — bir sonraki oyun menu'den başlasın
    NT_SFX.setMusicState("menu", 0.1);
    EventManager.forceCleanup(gs);
    cleanupEventHUD(S);
    SYNERGIES.forEach(syn=>syn.active=false);
    _upgradeLock=0; _levelUpChoosing=false;
    try{S.physics.resume();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
    S.physics.pause(); S.time.timeScale=1;
    _hideMobileBtns(S);
    PLAYER_GOLD=gs.gold; secureSet("nt_gold",PLAYER_GOLD);
    lbSubmitScore(gs.score||0, gs.kills||0, gs.level||1);

    const W=360, H=640, CX=W/2;
    S.cameras.main.shake(200,0.018);

    // Koyu overlay — hafif fade ile hemen başlasın ama yavaş dolsun
    const ov=S.add.rectangle(CX,H/2,W,H,0x000000,0).setDepth(900).setInteractive();
    S.tweens.add({targets:ov, fillAlpha:0.82, duration:800, delay:350});

    // Kırmızı parçacık yağmuru — animasyon bittikten sonra başlasın
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

    // ── ÖLÜM ANİMASYONU — ayrı sprite kullan (player idle texture ile uyum sorunu önle) ──
    let _panelShown = false;
    function _showPanel(){
        if(_panelShown) return;
        _panelShown = true;

        const objs=[]; const A=o=>{if(o)objs.push(o);return o;};
        const pm=NT_Measure(S,"ui_pause_win",300);
        const panelCY=H/2;
        const sprite=A(S.add.image(CX,panelCY,"ui_pause_win").setScale(pm.sc).setDepth(902));
        const pTop=panelCY-pm.H/2, pBot=panelCY+pm.H/2;
        const stripCY    = pTop + pm.stripH/2;
        const contentTop = pTop + pm.stripH + 10;
        const contentBot = pBot - pm.goldH  - 8;
        const btnCY      = pBot - pm.goldH/2;
        const TX=CX-128, VX=CX+128;
        const D=903;

        sprite.setScale(pm.sc*0.05).setAlpha(0);
        S.tweens.add({targets:sprite,scaleX:pm.sc,scaleY:pm.sc,alpha:1,duration:220,ease:"Back.easeOut"});

        A(S.add.text(CX,stripCY,"💀  "+L("gameOver"),
            NT_STYLE.title(24,"#ffffff","#5a0000")).setOrigin(0.5).setDepth(D));

        const prevHs=parseInt(localStorage.getItem("nt_highscore")||"0");
        if(gs.score>prevHs) localStorage.setItem("nt_highscore",gs.score);
        const isNew=gs.score>prevHs;

        let cy=contentTop+10;

        A(S.add.text(CX,cy,gs.score.toLocaleString(),
            NT_STYLE.title(36,"#ffcc00","#000000")).setOrigin(0.5,0).setDepth(D));
        cy+=50;

        const hsColor=isNew?"#ffcc00":"#8899aa";
        const hsLabel=isNew?L("goNewRecord"):("BEST: "+prevHs.toLocaleString());
        A(S.add.text(CX,cy,hsLabel,NT_STYLE.accent(13,hsColor)).setOrigin(0.5,0).setDepth(D));
        cy+=28;

        const dg=A(S.add.graphics().setDepth(902));
        dg.lineStyle(1,0x44aacc,0.35); dg.lineBetween(TX,cy+4,VX,cy+4);
        cy+=18;

        const _row=(lbl,val,col)=>{
            if(cy+22>contentBot-38) return;
            A(S.add.text(TX,cy,lbl,NT_STYLE.stat(14,"#88aacc")).setOrigin(0,0.5).setDepth(D));
            A(S.add.text(VX,cy,val,NT_STYLE.stat(14,col)).setOrigin(1,0.5).setDepth(D));
            cy+=26;
        };
        const kLbl=CURRENT_LANG==="en"?"KILLS":CURRENT_LANG==="ru"?"УБИТО":"KILL";
        const lLbl=CURRENT_LANG==="en"?"LEVEL":CURRENT_LANG==="ru"?"УРОВЕНЬ":"SEVİYE";
        const gLbl=CURRENT_LANG==="en"?"GOLD":CURRENT_LANG==="ru"?"ЗОЛОТО":"ALTIN";
        _row(kLbl, String(gs.kills), "#ff7777");
        _row(lLbl, "Lv "+gs.level,  "#88ddff");
        _row(gLbl, gs.gold+" ⬡",    "#ffcc44");

        if(cy+34<contentBot-10){
            cy+=4;
            const shBg=A(S.add.graphics().setDepth(902));
            const _dSh=(h)=>{
                shBg.clear();
                shBg.fillStyle(h?0x226688:0x0d2a36,1);
                shBg.fillRoundedRect(CX-78,cy,156,28,7);
                shBg.lineStyle(1.5,0x44aacc,h?0.9:0.5);
                shBg.strokeRoundedRect(CX-78,cy,156,28,7);
            };
            _dSh(false);
            A(S.add.text(CX,cy+14,L("goShare"),NT_STYLE.body(12,"#aaddff")).setOrigin(0.5).setDepth(D));
            A(S.add.rectangle(CX,cy+14,156,28,0xffffff,0.001).setDepth(D+1)
                .setInteractive({useHandCursor:true})
                .on("pointerover",()=>_dSh(true))
                .on("pointerout",()=>_dSh(false))
                .on("pointerdown",()=>shareTelegramScore(gs.score,gs.kills,gs.level)));
        }

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
    }

    // Ölüm animasyonu — player sprite'ı gizle, "death" textureli ayrı sprite oynat
    if(S.player && S.player.active && S.anims.exists("anim_death")){
        try{
            const _px=S.player.x, _py=S.player.y;
            const _psc=S.player.scaleX||2.0;
            const _pfl=S.player.flipX||false;
            S.player.setVisible(false); // player'ı gizle — death sprite üstüne binmesin
            const ds=S.add.sprite(_px, _py, "death")
                .setDepth(S.player.depth)
                .setScale(_psc)
                .setFlipX(_pfl)
                .setOrigin(0.5, 1); // player ile aynı origin
            ds.play("anim_death");
            // Animasyon bitince panel aç (+ 280ms küçük bekleme)
            ds.once("animationcomplete", ()=>{
                try{ ds.setAlpha(0); }catch(_){}
                S.time.delayedCall(280, _showPanel);
            });
        }catch(e){
            console.warn("[NT] Death anim sprite hatası:", e);
            S.time.delayedCall(400, _showPanel); // hata varsa normal gecikme
        }
    } else {
        S.time.delayedCall(400, _showPanel);
    }
    // Güvenlik: animasyon herhangi bir nedenle bitmediyse 1.1sn sonra her halükarda aç
    S.time.delayedCall(1100, _showPanel);
}

// ── ELMAS İLE DİRİLİŞ — 3 saniye geri sayım + Bitir butonu ─────
function showDiamondReviveScreen(S, bgOv){
    const W=360,H=640;
    const gs=GS;

    // Overlay koy — panel arka planı
    const dimOv=S.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(950);
    S.tweens.add({targets:dimOv,fillAlpha:0.85,duration:200});

    const panel=S.add.graphics().setDepth(951);
    // Panel arka planı
    panel.fillStyle(0x07000f,0.99); panel.fillRoundedRect(38,195,284,260,14);
    panel.lineStyle(3,0xaa00ff,0.9); panel.strokeRoundedRect(38,195,284,260,14);
    panel.lineStyle(1,0x660088,0.4); panel.strokeRoundedRect(43,200,274,250,11);
    panel.fillStyle(0xaa00ff,0.14); panel.fillRoundedRect(38,195,284,52,{tl:14,tr:14,bl:0,br:0});
    // Dekoratif yan çizgiler
    panel.fillStyle(0xaa00ff,0.5); panel.fillRect(38,195,4,260);
    panel.fillStyle(0xaa00ff,0.5); panel.fillRect(318,195,4,260);
    panel.setAlpha(0).setScale(0.85);
    S.tweens.add({targets:panel,alpha:1,scaleX:1,scaleY:1,duration:320,ease:"Back.easeOut"});

    // Başlık
    const titleTxt=S.add.text(W/2,218,"** DİRİLİŞ **",{
        font:"bold 17px LilitaOne, Arial, sans-serif",color:"#cc44ff",
        stroke:"#000000",strokeThickness:3
    }).setOrigin(0.5).setDepth(952).setAlpha(1).setVisible(false);
    S.tweens.add({targets:titleTxt,alpha:1,duration:250,delay:100});

    // Alt çizgi dekorasyon
    const deco=S.add.graphics().setDepth(952).setAlpha(0);
    deco.lineStyle(1,0xaa00ff,0.5); deco.lineBetween(58,236,302,236);
    S.tweens.add({targets:deco,alpha:1,duration:200,delay:150});

    // Elmas maliyeti bilgisi
    S.add.text(W/2,252,"5 GEM karşılığında diriliş",{
        font:"bold 14px LilitaOne, Arial, sans-serif",color:"#9966cc",align:"center"
    }).setOrigin(0.5).setDepth(952);

    S.add.text(W/2,268,"HP+3 / 5sn Yenilmezlik",{
        font:"bold 13px LilitaOne, Arial, sans-serif",color:"#ff8888"
    }).setOrigin(0.5).setDepth(952);

    // Elmas bakiyesi
    S.add.text(W/2,284,L("goGemsStatus")+" "+PLAYER_GEMS+" GEM",{
        font:"bold 14px LilitaOne, Arial, sans-serif",
        color:PLAYER_GEMS>=5?"#cc99ff":"#ff4444"
    }).setOrigin(0.5).setDepth(952);

    // ── GERİ SAYIM DAİRESİ ──
    let countdown=3;
    const cdCircle=S.add.graphics().setDepth(952);
    const cdTxt=S.add.text(W/2,318,countdown.toString(),{
        font:"bold 28px LilitaOne, Arial, sans-serif",color:"#ffffff",
        stroke:"#000",strokeThickness:3
    }).setOrigin(0.5).setDepth(953);

    const drawCountdownCircle=(t)=>{
        cdCircle.clear();
        // Dış halka arka plan
        cdCircle.lineStyle(5,0x330044,0.6); cdCircle.strokeCircle(W/2,318,26);
        // Dolgu — t=3..0
        const angle=-Math.PI/2; // 12 saatten başla
        const endAngle=angle+(2*Math.PI*(t/3));
        cdCircle.lineStyle(5,0xcc44ff,0.9);
        // Arc çiz (Phaser Graphics'te linePath ile)
        const steps=30;
        for(let s=0;s<steps;s++){
            const a1=angle+(endAngle-angle)*(s/steps);
            const a2=angle+(endAngle-angle)*((s+1)/steps);
            cdCircle.lineBetween(
                W/2+Math.cos(a1)*26,318+Math.sin(a1)*26,
                W/2+Math.cos(a2)*26,318+Math.sin(a2)*26
            );
        }
        // İç parlama
        cdCircle.lineStyle(2,0xdd88ff,0.3); cdCircle.strokeCircle(W/2,318,20);
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
        // Panel'deki tüm objeleri temizle
        S.children.list.filter(o=>o&&o.active&&typeof o.depth==="number"&&o.depth>=950&&o.depth<970)
            .forEach(o=>{try{o.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}});
    };

    // ── DİRİL BUTONU ──
    const revBg=S.add.graphics().setDepth(952);
    const drawRev=(hov)=>{
        revBg.clear();
        revBg.fillStyle(hov?0xcc44ff:0x660088,1);
        revBg.fillRoundedRect(W/2-110,354,220,44,10);
        revBg.lineStyle(2.5,0xdd88ff,hov?1:0.75);
        revBg.strokeRoundedRect(W/2-110,354,220,44,10);
        revBg.fillStyle(0xffffff,hov?0.12:0.05);
        revBg.fillRoundedRect(W/2-108,356,216,14,{tl:9,tr:9,bl:0,br:0});
    };
    drawRev(false);
    S.add.text(W/2,376,"✦ DİRİL  (5 GEM)",{
        font:"bold 13px LilitaOne, Arial, sans-serif",color:"#ffffff"
    }).setOrigin(0.5).setDepth(953);
    S.add.rectangle(W/2,376,220,44,0xffffff,0.001).setInteractive().setDepth(954)
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

    // ── BİTİR BUTONU ──
    const endBg=S.add.graphics().setDepth(952);
    const drawEnd=(hov)=>{
        endBg.clear();
        endBg.fillStyle(hov?0x333344:0x111118,1);
        endBg.fillRoundedRect(W/2-80,408,160,32,8);
        endBg.lineStyle(1.5,hov?0x666688:0x333344,0.9);
        endBg.strokeRoundedRect(W/2-80,408,160,32,8);
    };
    drawEnd(false);
    S.add.text(W/2,424,"X  Bitir",{
        font:"bold 14px LilitaOne, Arial, sans-serif",color:"#888899"
    }).setOrigin(0.5).setDepth(953);
    S.add.rectangle(W/2,424,160,32,0xffffff,0.001).setInteractive().setDepth(954)
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
    gs.health=Math.min(gs.maxHealth, 3);
    gs.invincible=true; gs._invT=0;
    S.time.delayedCall(5000,()=>{ gs.invincible=false; });
    gs.pickingUpgrade=false;
    S.physics.resume();
    if(S.spawnEvent) S.spawnEvent.paused=false;
    try{if(panel)panel.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}
    // Diriliş efekti
    NT_SFX.play("revive");
    S.cameras.main.shake(180,0.020);
    S.cameras.main.zoomTo(1.08,160,"Quad.easeOut");
    S.time.delayedCall(160,()=>S.cameras.main.zoomTo(1.0,400,"Quad.easeIn"));
    const plx=S.player?.x||180, ply=S.player?.y||420;
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

// ── TELEGRAM SKOR PAYLAŞIM ────────────────────────────────────
function shareTelegramScore(score, kills, level){
    const txt=`🎮 NOT TODAY\n🏆 Skor: ${score.toLocaleString()}\n☠ Kill: ${kills} | ⭐ Lv${level}\n👉 Sen de oyna!`;
    try{
        // Telegram Mini App API
        if(window.Telegram&&window.Telegram.WebApp){
            window.Telegram.WebApp.switchInlineQuery(txt);
        } else {
            // Fallback: clipboard kopyala
            navigator.clipboard?.writeText(txt).then(()=>alert("Skor panoya kopyalandı!")).catch(()=>{});
        }
    }catch(e){console.warn("[NT] Hata yutuldu:",e)}
}

// Resonance & efektler
function triggerResonance(S,src,depth){
    if((depth||0)>=2)return;
    const gs=GS;
    // [OPT] cache kullan — recursif çağrılarda getMatching'den kaçın
    const _resEnemies=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
    const _stormActive=GS._evoStormCore; // [OPT] GS flag — EVOLUTIONS.find'dan kaçın
    for(let _ri=0;_ri<_resEnemies.length;_ri++){
        const e=_resEnemies[_ri];
        if(e===src||!e||!e.active||e.lock||e.spawnProtected) continue;
        const dx=e.x-src.x,dy=e.y-src.y,d=Math.sqrt(dx*dx+dy*dy);
        if(d<gs.resonanceDist&&d>1){
            applyDmg(S,e,gs.damage*0.50,false); // [v9.2] Storm Core bonus pipeline'da — burada ayrıca uygulanmaz
            triggerResonance(S,e,(depth||0)+1);
        }
    }
}
function doExplosion(S,x,y){
    const gs=GS, lv=UPGRADES.explosive.level, r=44+lv*12;
    const _isHeavy = gs && gs.activeWeapon === "heavy_cannon";
    // ── EXPLOSION SPRITE ANİMASYONU ──
    if(S.anims && S.anims.exists("anim_expl")){
        try{
            const sc=4.5+(lv*0.4);
            const es=S.add.sprite(x,y,"explosion").setDepth(25).setScale(sc).setAlpha(0.95);
            es.play("anim_expl");
            es.once("animationcomplete",()=>{ try{es.destroy();}catch(_){} });
        }catch(_){}
    }
    // ── HEAVY CANNON — ekstra exp1 animasyonları ──
    if(_isHeavy && S.anims && S.anims.exists("anim_exp1")){
        // Merkez + 2 offset exp1 — güçlü patlama hissi
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
    // [VFX OPT] İç parlama — daha küçük
    const inner=S.add.graphics().setDepth(22);
    inner.x=x; inner.y=y;
    inner.fillStyle(0xffffff,0.55); inner.fillCircle(0,0,r*0.18);
    S.tweens.add({targets:inner,scaleX:2.2,scaleY:2.2,alpha:0,duration:100,onComplete:()=>inner.destroy()});
    // Ana patlama halkası — azaltıldı
    const eg=S.add.graphics().setDepth(21);
    eg.x=x; eg.y=y;
    eg.fillStyle(0xff8800,0.45); eg.fillCircle(0,0,r*0.55);
    eg.fillStyle(0xff4400,0.30); eg.fillCircle(0,0,r);
    S.tweens.add({targets:eg,scaleX:1.8,scaleY:1.8,alpha:0,duration:220,ease:"Quad.easeOut",onComplete:()=>eg.destroy()});
    // Duman bulutu — azaltıldı
    const smoke=S.add.graphics().setDepth(20);
    smoke.x=x; smoke.y=y-8;
    smoke.fillStyle(0x333333,0.14); smoke.fillCircle(0,0,r*0.4);
    S.tweens.add({targets:smoke,y:smoke.y-14,scaleX:1.4,scaleY:1.4,alpha:0,duration:380,onComplete:()=>smoke.destroy()});
    // Kor parçacıkları — 10→4 adet
    for(let i=0;i<4;i++){
        const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        const sp=Phaser.Math.Between(40,r*0.9);
        const dp=S.add.graphics().setDepth(20);
        dp.fillStyle(i%2===0?0xff6600:0xffcc00,0.85);
        dp.fillRect(-1,-1,Phaser.Math.Between(2,4),Phaser.Math.Between(2,4));
        dp.x=x; dp.y=y;
        S.tweens.add({targets:dp,x:x+Math.cos(ang)*sp,y:y+Math.sin(ang)*sp,alpha:0,duration:Phaser.Math.Between(160,320),ease:"Quad.easeOut",onComplete:()=>dp.destroy()});
    }
    S.cameras.main.shake(22,0.004);
    // Alan hasarı — [OPT] cache kullan
    const _expEnemies=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
    for(let _ei=0;_ei<_expEnemies.length;_ei++){
        const e=_expEnemies[_ei];
        if(!e||!e.active) continue;
        const dx=e.x-x, dy=e.y-y, d=Math.sqrt(dx*dx+dy*dy);
        if(d<r+e.displayWidth*0.5){
            const falloff=Math.max(0.3,1-(d/r)*0.6);
            applyDmg(S,e,gs.damage*(1.2+lv*0.35)*falloff,d<r*0.4);
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

// ── POISON ORB — Vampire Survivors iksiri gibi serbest uçar ──
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
            // Direkt oluştur — fırlama animasyonu yok
            spawnPoisonCloudAt(S,tx,ty,lv);
        });
    }
}

// Lineer interpolasyon yardımcı
function lerp(a,b,t){return a+(b-a)*t;}

function spawnPoisonCloudAt(S,x,y,lv){
    // Büyütülmüş radius
    const r=55+lv*18;

    // ── Anında ortaya çıkış efekti — yeşil patlaması ──
    const pop=S.add.graphics().setDepth(20);
    pop.x=x; pop.y=y;
    pop.fillStyle(0x44ff44,0.65); pop.fillCircle(0,0,r*0.7);
    pop.fillStyle(0xaaffaa,0.45);  pop.fillCircle(0,0,r*0.35);
    pop.fillStyle(0xffffff,0.20);  pop.fillCircle(0,0,r*0.15);
    S.tweens.add({targets:pop,scaleX:1.8,scaleY:1.8,alpha:0,duration:320,ease:"Quad.easeOut",onComplete:()=>pop.destroy()});

    // ── Bulut: partiküller + dolgu ──────────────────
    const ptcls=[];

    // Yarı saydam dolgu halkaları — bulut hissi
    const fill=S.add.graphics().setDepth(7);
    fill.fillStyle(0x00bb33,0.22); fill.fillCircle(x,y,r);
    fill.fillStyle(0x00cc44,0.14); fill.fillCircle(x,y,r*0.65);
    fill.fillStyle(0x33ff66,0.08); fill.fillCircle(x,y,r*0.35);
    ptcls.push(fill);

    // Zehir partikülleri
    const colors=[0x00cc44,0x22dd55,0x44ff66,0x00aa33,0x66ff88,0x88ffaa,0x00ff55];
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

    // Dış + iç çerçeve
    const outline=S.add.graphics().setDepth(8);
    outline.lineStyle(2.5,0x00cc44,0.7); outline.strokeCircle(x,y,r);
    outline.lineStyle(1.2,0x44ff44,0.35); outline.strokeCircle(x,y,r*0.6);
    outline.lineStyle(0.8,0x88ffaa,0.18); outline.strokeCircle(x,y,r*0.3);
    ptcls.push(outline);

    // Merkez glow
    const core=S.add.graphics().setDepth(8);
    core.fillStyle(0x00aa33,0.20); core.fillCircle(x,y,r*0.55);
    ptcls.push(core);

    // ── Yükselen kabarcıklar ──
    for(let i=0;i<10;i++){
        const bx=x+Phaser.Math.Between(-r*0.7,r*0.7);
        const by=y+Phaser.Math.Between(-r*0.5,r*0.5);
        const bub=S.add.graphics().setDepth(10);
        bub.fillStyle(0x44ff44,0.55); bub.fillCircle(0,0,Phaser.Math.Between(2,5));
        bub.lineStyle(0.8,0x88ffaa,0.4); bub.strokeCircle(0,0,Phaser.Math.Between(2,5)+1);
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

    // ── DOT hasarı + yavaşlatma ──
    const slowedEnemies=new Set();
    const dotEv=S.time.addEvent({delay:320,repeat:10,callback:()=>{
        if(GS.gameOver) return;
        const _dotEnemies=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
        for(let _di=0;_di<_dotEnemies.length;_di++){
            const e=_dotEnemies[_di];
            if(!e||!e.active) continue;
            const dx=e.x-x,dy=e.y-y;
            if(dx*dx+dy*dy<r*r*1.15){
                // Hasar artırıldı
                applyDmg(S,e,0.55+(lv||1)*0.28,false);
                // Yavaşlatma — bulut içindeyken
                if(!slowedEnemies.has(e)&&e.body){
                    slowedEnemies.add(e);
                    if(e._poisonOrigVY===undefined) e._poisonOrigVY=e.body.velocity.y;
                    if(e._poisonOrigVX===undefined) e._poisonOrigVX=e.body.velocity.x;
                    e.body.velocity.y=e._poisonOrigVY*0.3;
                    e.body.velocity.x=e._poisonOrigVX*0.3;
                    e._poisonSlowed=true;
                    e.setTint(0x55ff55);
                }
                if(Math.random()<0.5){
                    const pip=S.add.graphics().setDepth(17);
                    pip.x=e.x; pip.y=e.y-6;
                    pip.fillStyle(0x44ff44,0.8); pip.fillRect(-1.5,-2,3,6);
                    S.tweens.add({targets:pip,y:pip.y-14,alpha:0,duration:300,onComplete:()=>pip.destroy()});
                }
            } else if(e._poisonSlowed){
                // [BUG FIX] Alan dışında — orijinal hıza dön (bölme değil kayıtlı değer)
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

    // ── Partiküller yavaş söner ──
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

// ── 1. POWER SPIKE YAZILARI — level/synergy/evo/yüksek combo ──
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
    // Kısa 0.7x slow motion — güç hissi
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
    // Combo 20+ → OVERLOAD yazısı (5 sn'de 1 kez)
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

// ── 2. NEAR DEATH — düşük can sistemi ──────────────────────────
function tickNearDeath(S){
    const gs = GS; if(!gs||gs.gameOver||!S) return;
    const ratio = gs.health / gs.maxHealth;
    if(ratio <= 0.20 && !gs._nearDeathActive){
        gs._nearDeathActive = true;
        gs._nearDeathDmgBoost = 1.0; // artık pipeline'da additive olarak işleniyor
        syncStatsFromPipeline(gs);   // [v9.2] pipeline flag'i aktif — +10% additive dahil
        showHitTxt(S, 180, 200, L("nearDeath_buff"), "#ff2244", true);
    } else if(ratio > 0.20 && gs._nearDeathActive){
        gs._nearDeathActive = false;
        gs._nearDeathDmgBoost = 1.0;
        syncStatsFromPipeline(gs);   // [v9.2] bonus kaldırıldı
    }
}

function tickNearDeathPulse(S, delta){
    // [VFX] Kırmızı ekran nabzı kaldırıldı — göz yorucu
    // Düşük can bilgisi sadece HP bar'dan okunur
}

// ── 3. COMBO BREAK — çöküş hissi ───────────────────────────────
function showComboBreak(S, lastCombo){
    if(!S||!S.add||lastCombo < 3) return;
    NT_SFX.play("combo_break");
    // High combo kırıldıysa müziği gameplay'e geri döndür
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

// ── 4. PROGRESSİVE CHAOS ────────────────────────────────────────
// Her dakika yoğunluk artar. Mevcut director sistemini bozmuyor,
// sadece chaos state göre ek parçacık patlaması tetikler.
let _chaosParticleTimer = 0;

function tickProgressiveChaos(S, delta){
    const gs = GS; if(!gs||gs.gameOver||gs.pickingUpgrade||!S||!S.add) return;
    const min = gs.t / 60000;  // geçen dakika

    // Chaos intensity: 0-1 min=0.0, 1-3 min=0.3, 3-5 min=0.6, 5+=1.0
    const chaos = min <= 1 ? 0 :
                  min <= 5 ? (min-1)/4 * 0.4 :    // 0→0.4 over min 1-5
                  min <= 10 ? 0.4 + (min-5)/5*0.25 : // 0.4→0.65 over min 5-10
                  Math.min(0.70, 0.65 + (min-10)*0.008); // slow creep to 0.70 cap

    gs._chaosLevel = chaos;

    // Chaos arttıkça arka plan titreşimi
    if(chaos > 0.5){
        _chaosParticleTimer += delta;
        const interval = Math.max(200, 1200 - chaos*1000);
        if(_chaosParticleTimer >= interval){
            _chaosParticleTimer = 0;
            // Ekran kenarında kıvılcım — düşmanlara değil, sadece görsel
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

    // 5 dk+ overload: ekran köşe glitch flaşları — kaldırıldı (göz yorucu)
}

// ── 5. GİZLİ SİNERJİ KEŞİF SİSTEMİ ────────────────────────────
let _hiddenSynergyChecked = false;

function tickHiddenSynergy(S){
    const gs = GS; if(!gs||gs.gameOver) return;
    SYNERGIES.forEach(syn=>{
        if(!syn.hidden) return;  // sadece hidden flag'li synergy'ler
        if(syn.active) return;
        const allMet = syn.req.every(key=>UPGRADES[key]&&UPGRADES[key].level>=syn.reqLv);
        if(!allMet) return;
        syn.active = true;
        syn.apply(gs);
        // Özel gizli synergy efekti — "keşfedildi!" hissi
        showHiddenSynergyReveal(S, syn);
    });
}

function showHiddenSynergyReveal(S, syn){
    const W=360, H=640;
    const label = LLang(syn,"name","nameEN","nameRU");

    // 1. Güçlü kamera efektleri
    S.cameras.main.shake(90, 0.010);
    
    S.cameras.main.zoomTo(1.10, 150, "Quad.easeOut");
    S.time.delayedCall(150, ()=> S.cameras.main.zoomTo(1.0, 350, "Quad.easeIn"));

    // 2. Kısa slow-mo
    S.time.timeScale = 0.5;
    S.time.delayedCall(400, ()=>{ S.time.timeScale = 1.0; });

    // 3. "GİZLİ SİNERJİ" üst yazısı
    const hidLbl = S.add.text(W/2, H/2-66, L("hiddenSynergy"), {
        font:"bold 14px LilitaOne, Arial, sans-serif",
        color:"#ffffff"
    }).setOrigin(0.5).setAlpha(1).setVisible(false).setDepth(655);
    if(hidLbl&&hidLbl.setVisible){hidLbl.setVisible(true);hidLbl.setAlpha(0);}
    S.tweens.add({targets:hidLbl, alpha:1, duration:180, ease:"Back.easeOut"});
    S.time.delayedCall(2000, ()=>S.tweens.add({targets:hidLbl, alpha:0, duration:250,
        onComplete:()=>{ try{hidLbl.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)} }}));

    // 4. Synergy ismi — büyük, parlayan
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

    // 5. Halka patlaması
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

    // 6. Parçacık yağmuru — 22→10 adet
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

// ── 6. FORGİVİNG MEKANİK — gizli grace window ──────────────────
// damagePlayer çağrılmadan önce hafif grace kontrolü:
// Oyuncu son 180ms içinde mermi aldıysa, %30 şans ile hasarı atla.
// Bu sistem oyuncunun fark etmeyeceği kadar ince.
function graceCheck(S){
    const gs = GS; if(!gs) return false;
    const now = gs.t || 0;
    const lastHit = gs._lastHitTime || 0;
    if(now - lastHit < 180 && Math.random() < 0.30){
        return true;  // hasar atlandı — grace
    }
    gs._lastHitTime = now;
    return false;
}

// ── 7. POWER SPIKE HOOK — level up'a bağla ─────────────────────
function onLevelUpPowerSpike(S){
    const gs = GS; if(!gs) return;
    // Her 5 level'da bir "OVERLOAD" spike
    if(gs.level % 5 === 0){
        S.time.delayedCall(350, ()=>triggerPowerSpike(S, "levelup"));
    }
}

// ── 8. QUICK RESTART — game over feedback ──────────────────────
// gameOver içindeki delayedCall'ı 600→250ms'ye kısalt yapılacak
// (gameOver fonksiyonu patch'leniyor aşağıda)


// ══════════════════════════════════════════════════════════════
// GÖRSEL DENGE + BUG FIX v2
// ══════════════════════════════════════════════════════════════

// ── 1. FİZİKSEL DEBRIS — parçalar zemine düşer ─────────────────
let _debrisCount = 0;
const MAX_DEBRIS = 6;  // [PERF] Daha agresif limit — FPS koruması

// [PERF] Periyodik sahne temizleyici - devre disi, donma sorunu yarattigi icin
let _lastCleanupTime = 0;
function periodicSceneCleanup(S){
    // DEVRE DISI: aktif oyun objelerini yanlis siliyordu, donmaya neden oluyordu
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
    const cnt=isBig?2:1; // [PERF] timer yerine tween — sayı düşürüldü

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

        // [PERF] addEvent(delay:16,repeat:-1) yerine tek bir tween — çok daha ucuz
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

// ── 2. BUILD TITLE SİSTEMİ ─────────────────────────────────────
function getBuildTitle(){
    const actSyn=SYNERGIES.filter(s=>s.active).map(s=>s.id);

    // Sinerji bazlı isimler (öncelikli)
    // [v9.3] toxic_fire ve meteor_explosion build title'dan kaldırıldı
    if(actSyn.includes("chain_storm"))     return {tr:"⚡ ŞİMŞEK CELLADI",   en:"⚡ LIGHTNING REAPER", ru:"⚡ ПОЖНЕЦ МОЛНИЙ", c:0xffff44};
    if(actSyn.includes("cryo_shatter"))    return {tr:"❄ BEDEN DONDURUCU",  en:"❄ FLESH FREEZER",   ru:"❄ ЗАМОРОЗЧИК",    c:0x88ddff};
    if(actSyn.includes("laser_focus"))     return {tr:"🎯 LAZER USTA",       en:"🎯 LASER MASTER",    ru:"🎯 МАСТЕР ЛАЗЕРА", c:0xff2200};
    if(actSyn.includes("rapid_freeze"))    return {tr:"❄ BLASTER DONDURUCU",en:"❄ CRYO BLASTER",    ru:"❄ КРИО БЛАСТЕР",  c:0x88ddff};
    if(actSyn.includes("cannon_poison"))   return {tr:"☣ ZEHİRLİ PATLAMA",  en:"☣ TOXIC BOOM",      ru:"☣ ТОКСИК БУМ",    c:0x88ff44};
    if(actSyn.includes("precision_crit"))  return {tr:"🎯 KILIÇ USTASI",     en:"🎯 BLADE MASTER",   ru:"🎯 МАСТЕР КЛИНКА", c:0xff2244};
    if(actSyn.includes("chain_lightning")) return {tr:"⚡ YILDIRIM ZİNCİRİ", en:"⚡ THUNDER CHAIN",  ru:"⚡ ЦЕПЬ МОЛНИЙ",   c:0x44aaff};
    // [v10.0] Reflection Rifle build titles
    if(actSyn.includes("reflect_freeze"))    return {tr:"❄ KRİYO YANSIMA",   en:"❄ CRYO MIRROR",    ru:"❄ ЛЕДЯНОЕ ЗЕРКАЛО", c:0x20ccaa};
    if(actSyn.includes("reflect_explosive")) return {tr:"💥 SEKME BOMBASI",   en:"💥 RICOCHET BOMB",  ru:"💥 РИКОШЕТ-БОМБА",  c:0x20ccaa};
    if(GS&&GS._evoMirrorStorm)              return {tr:"🌀 AYNA FIRTINASI",  en:"🌀 MIRROR STORM",   ru:"🌀 ЗЕРКАЛЬНЫЙ ШТОРМ",c:0x20ccaa};
    if(actSyn.some(s=>s.startsWith("hidden"))) return {tr:"✦ GİZEM VALİSİ",en:"✦ MYSTERY HERALD",   ru:"✦ ВЕСТНИК ТАЙНЫ",  c:0xcc44ff};

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

// ── 3. GROUND CLAMP — XP orb ve diğer objeler ──────────────────
function clampToGround(obj, margin){
    if(!obj) return;
    const maxY=GROUND_Y-(margin||8);
    if(obj.y>maxY) obj.y=maxY;
}

// ── 4. SPAWN FLOW DENGESİ ek kontrol ──────────────────────────
function getSpawnDifficultyMultiplier(gs){
    // İlk 30 sn çok nazik başlangıç
    const sec=gs.t/1000;
    if(sec<30) return 0.4+sec/30*0.6;
    if(sec<60) return 0.8+( sec-30)/30*0.2;
    return 1.0;
}


// ── OYUNCU ÇARPIŞMA PATLAMASI ──────────────────────────────────
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

    // 1. Genişleyen halka — ince, temiz
    const ring=S.add.graphics().setDepth(21);
    ring.x=x; ring.y=y;
    ring.lineStyle(2,col,0.75); ring.strokeCircle(0,0,7);
    S.tweens.add({targets:ring,scaleX:3.0,scaleY:3.0,alpha:0,
        duration:200,ease:"Quad.easeOut",onComplete:()=>{try{ring.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});

    // 2. Parçacık saçılması — ince çizgiler, dikdörtgen YOK
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
    // shake wrapper zaten cap'liyor — olduğu gibi bırak
    S.cameras.main.shake(30,0.004);
}


// ════════════════════════════════════════════════════════════════
// AAA VFX MODULE  —  Not Today v9.0 VFX Engine
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

// ── INIT — SceneGame.create() içinde çağrılır ────────────────
function initVFX(S){
    if(!S||!S.add) return;
    NT_VFX._scene=S;
    NT_VFX._initialized=true;
    _POOL=new ParticlePool(S,120);

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

// ── TICK — SceneGame.update() içinde çağrılır ────────────────
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

    // 1. Shockwave halkaları — sadece ince çizgi, dolu daire/flare YOK
    [0xffee44,0xffaa00].forEach((rc,ri)=>{
        const rg=S.add.graphics().setDepth(28);
        rg.x=ex; rg.y=ey;
        rg.lineStyle(ri===0?3:1.5,rc,0.8-ri*0.25); rg.strokeCircle(0,0,5+ri*3);
        S.tweens.add({targets:rg,scaleX:4+tier*1.2+ri,scaleY:4+tier*1.2+ri,alpha:0,
            duration:240+ri*50+tier*50,ease:"Quad.easeOut",delay:ri*25,
            onComplete:()=>{try{rg.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});
    });

    // 3. Radyal ışınlar — sayı azaltıldı
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

    // 4. Spark trail — ince çizgiler
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

    // 6. Kamera shake — hafif, kontrollü (flash YOK)
    S.cameras.main.shake(30+tier*15,0.0015+tier*0.0015);

    // 7. Chromatic — sadece tier 2+, kısa süre
    if(tier>=2) _triggerChromatic(S,ex,ey,60+tier*30);

    // 8. Zemin çatlağı — sadece tier 3
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
// ── HIT SMOKE animasyon varyantları — her vuruşta farklı gösterir ──
const _SMOKE_ANIMS = ["anim_smoke","anim_smoke2a","anim_smoke2b","anim_smoke2c","anim_smoke2d","anim_smoke2e"];
let _smokeIdx = 0; // round-robin sayacı

function vfxSmokeHit(S, ex, ey){
    // Texture yüklü değilse sessizce çık
    if(!S || (!S.textures.exists("smoke") && !S.textures.exists("smoke2"))) return;
    try{
        // Round-robin ile her vuruşta farklı animasyon
        const animKey = _SMOKE_ANIMS[_smokeIdx % _SMOKE_ANIMS.length];
        _smokeIdx++;
        // Sadece ilgili texture yüklüyse kullan
        const texKey = animKey === "anim_smoke" ? "smoke" : "smoke2";
        if(!S.textures.exists(texKey)) return;
        if(!S.anims.exists(animKey)) return;

        const sp = S.add.sprite(ex, ey - 14, texKey);
        // Küçük boyut: 0.55–0.70 arası rastgele scale
        const sc = 0.55 + Math.random() * 0.15;
        sp.setScale(sc)
          .setDepth(28)
          .setAlpha(0.82)
          .setBlendMode(Phaser.BlendModes.ADD); // parlak beyaz texture için ADD blend
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

    // Layer 4 — smoke sprite hit effect (her vuruşta farklı animasyon)
    vfxSmokeHit(S, ex, ey);
}

// ── Enemy squash micro-animation on hit ─────────────────────────
function vfxEnemySquash(S,e){
    if(!S||!e||!e.active) return;
    // [FIX] Önceki squash tween'lerini iptal et — üst üste birikmesini engelle
    S.tweens.killTweensOf(e);
    // [FIX] Orijinal scale'i her zaman taze oku — birikmeden kaynaklanan drift'i engelle
    // Piramit sprite'ları için temel scale 1.0 (texture boyutları zaten doğru)
    const sx = e._baseScaleX !== undefined ? e._baseScaleX : (Math.abs(e.scaleX) < 0.05 ? 1.0 : e.scaleX);
    const sy = e._basescaleY !== undefined ? e._basescaleY : (Math.abs(e.scaleY) < 0.05 ? 1.0 : e.scaleY);
    // Orijinal scale'i ilk kez kaydet
    if(e._baseScaleX === undefined){ e._baseScaleX = sx; e._basescaleY = sy; }
    const bsx = e._baseScaleX, bsy = e._basescaleY;
    // Squash: hafif yatay genişle + dikey kıs, sonra geri dön
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

// ── ENEMY DEATH VFX (elite/boss sınıfı düşmanlar) ───────────
function vfxEnemyDeath(S,x,y,type,scale){
    if(!S||!S.add) return;
    const typeColors={normal:0xFF88CC,fast:0xFF6699,tank:0xAA55FF,shield:0x55BBFF,kamikaze:0xFFBB55,ghost:0xDDBBFF,
        split:0xFFEE44,swarm:0xFFBB66,elder:0xFFCC44,spinner:0xFF55DD,armored:0x9977FF,bomber:0xFF9966,
        stealth:0x44FFDD,healer:0x66FFAA,magnet:0xFFCC33,mirror:0xCCAAFF,berserker:0xFF7799,absorber:0x33EEFF,
        chain:0x77AAFF,freezer:0xAAEEFF,leech:0xFF77BB,titan:0xDD55FF,shadow:0xBB88FF,spiker:0xFFDD66,
        vortex:0x33FFCC,phantom:0xEEBBFF,rusher:0xFFAA55,splitter:0x88FF88,toxic:0xBBFF44,colossus:0xFF66AA,
        inferno:0xFF9977,glacier:0x66DDFF,phantom_tri:0xFF55FF,volt:0xFFFF66,obsidian:0xCC77FF,zigzag:0x88FF88};
    const col=typeColors[type]||0xff88cc;
    const sz=Math.min(scale||1, 1.8); // cap scale etkisini sınırla

    // Shockwave halkası — sadece ince çizgi, dolu daire YOK
    const ring=S.add.graphics().setDepth(21);
    ring.x=x; ring.y=y;
    ring.lineStyle(2.5,col,0.85); ring.strokeCircle(0,0,8*sz);
    ring.lineStyle(1,0xffffff,0.5); ring.strokeCircle(0,0,5*sz);
    S.tweens.add({targets:ring,scaleX:4+sz,scaleY:4+sz,alpha:0,
        duration:280,ease:"Quad.easeOut",
        onComplete:()=>{try{ring.destroy();}catch(e){console.warn("[NT] Hata yutuldu:",e)}}});

    // Parçacık patlaması — sınırlı sayı
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

// ── COMBO MİLESTONE VFX ──────────────────────────────────────
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
    // Enerji jeti — daha az sayıda
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
    // Kamera shake — kontrollü (flash YOK)
    S.cameras.main.shake(20+combo,0.0010+combo*0.00008);
    // MAX COMBO (20) — sadeleştirilmiş
    if(combo>=20){
        S.cameras.main.zoomTo(1.05,70,"Quad.easeOut");
        S.time.delayedCall(70,()=>S.cameras.main.zoomTo(1.0,220,"Quad.easeIn"));
        // 12 ışın (20'den azaltıldı)
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
    // Oyuncu etrafı halkalar
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
        // Enerji kolonları
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
    // Flash YOK — sadece parçacık patlaması
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
    // Legendary'de minimal yıldız efekti
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

    // ── HASAR ANİMASYONU — ayrı sprite, player texture bozulmasın ──
    // Texture yüklenmediyse (assets/get_damage.png eksik) sessizce atla
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
            // Güvenlik: animasyon bitmezse 600ms sonra destroy
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
// FONT PRELOAD SİSTEMİ — LilitaOne font yüklenmeden oyun başlamaz
// Siyah dikdörtgen text bug'ını kalıcı olarak çözer
// ═══════════════════════════════════════════════════════════════
function _ensureFontLoaded(callback){
    // Race condition koruması: "load" eventi ve 2sn timeout aynı anda
    // tetiklenirse callback iki kez çağrılır → Phaser çift başlar.
    // _fontCallbackFired flag'i bunu önler.
    let _fontCallbackFired = false;
    const _safeCallback = () => {
        if(_fontCallbackFired) return;
        _fontCallbackFired = true;
        callback();
    };

    // 1. LilitaOne @font-face — assets/fonts/ klasöründen yükle
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

    // 2. document.fonts API ile yüklenmesini bekle
    const tryLoad = () => {
        if(document.fonts && document.fonts.load){
            // Hem regular hem bold yükle
            Promise.all([
                document.fonts.load("bold 16px LilitaOne"),
                document.fonts.load("16px LilitaOne"),
                document.fonts.load("24px LilitaOne"),
                document.fonts.load("bold 22px LilitaOne"),
                document.fonts.load("bold 18px LilitaOne"),
                document.fonts.load("bold 14px LilitaOne"),
                document.fonts.load("10px LilitaOne")
            ]).then(()=>{
                // Canvas warm-up — tarayıcı font rasterizer'ı ısıt
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
                console.warn("[NT] LilitaOne yüklenemedi — Arial fallback aktif.");
                _safeCallback();
            });
        } else {
            // API yok — kısa gecikme
            setTimeout(_safeCallback, 400);
        }
    };

    // Fonts API hazır değilse kısa bekle
    if(document.readyState === "complete"){
        tryLoad();
    } else {
        window.addEventListener("load", tryLoad, {once: true});
        // Güvenlik: 800ms sonra her halükarda başlat — Telegram'da 2sn bekleme siyah ekrana yol açar
        setTimeout(()=>{ if(!_fontCallbackFired) _safeCallback(); }, 800);
    }
}

// AudioContext resume on first user gesture (Chrome autoplay policy)
(function _fixAudioContext(){
    const resume=()=>{
        if(window.Phaser&&Phaser.Sound&&Phaser.Sound.WebAudioSoundManager){
            // Phaser handles its own context — nothing to do
        }
        // Resume any suspended AudioContext instances
        if(window.AudioContext||window.webkitAudioContext){
            document.querySelectorAll("*").forEach(()=>{});  // noop
        }
        document.removeEventListener("pointerdown",resume,true);
        document.removeEventListener("keydown",resume,true);
    };
    document.addEventListener("pointerdown",resume,{once:true,capture:true});
    document.addEventListener("keydown",resume,{once:true,capture:true});
})();

function _startPhaserGame(){
    // ── TELEGRAM WEBAPP HAZIRLIK — siyah ekran önleme ─────────────────────────
    // Telegram Mini App ortamındaysa WebApp.ready() çağrılmalı.
    // Bu çağrı yapılmadan Telegram loading overlay kapanmaz → siyah ekran.
    try{
        if(window.Telegram && window.Telegram.WebApp){
            window.Telegram.WebApp.ready();   // Telegram'a "uygulama hazır" sinyali gönder
            window.Telegram.WebApp.expand();  // Tam ekran aç — viewport sorunlarını önle
        }
    }catch(e){ console.warn("[NT] Telegram WebApp init hatası:", e); }

    // ── PRESENCE: otomatik başlatma (window.Presence yoksa sessizce geç) ─────
    if (window.Presence) {
        (async () => {
            try {
                await window.Presence.logJoin();   // JOIN isteğini gönder
                window.Presence.startPing();        // 15 sn'lik ping döngüsünü başlat
            } catch(e) { console.warn("[NT] Presence init hatası:", e); }
        })();
    } else {
        console.warn("[NT] window.Presence bulunamadı — presence sistemi devre dışı.");
    }
    // ── MÜZİK BAŞLAT ──────────────────────────────────────────
    NT_SFX.startMusic();
    NT_SFX.startWindAmbience();
    const config = {
        type:Phaser.AUTO, width:360, height:640,
        backgroundColor:"#000000",
        parent:"game-container",
        physics:{default:"arcade",arcade:{gravity:{y:0},debug:false,overlapBias:24,tileBias:16}},
        scene:[SceneMainMenu, SceneGame],
        scale:{
            mode:Phaser.Scale.FIT,
            autoCenter:Phaser.Scale.CENTER_BOTH,
            width:360,
            height:640,
            parent:"game-container",
            expandParent:false,
            // [FIX] Mobil zoom bug — devicePixelRatio kullanma, Phaser kendi yönetsin
        },
        render:{
            antialias:      false,
            antialiasGL:    false,
            pixelArt:       true,
            roundPixels:    true,
            resolution:     Math.min(window.devicePixelRatio || 1, 2),
            powerPreference:"high-performance"
        },
        callbacks:{
            postBoot:(game)=>{
                game.canvas.style.imageRendering = "auto";
                // ── VFX UPGRADE v2 — Texture Filter System ────────────────────
                // pixelArt:true sets NEAREST globally. Here we selectively
                // upgrade smooth PNGs (icons, UI) to LINEAR_MIPMAP_LINEAR.
                NT_VFX._game = game;
                const renderer = game.renderer;
                const gl = renderer && renderer.gl;
                if(!gl) return;

                function _applyFilter(glTex, filter){
                    if(!glTex) return;
                    try{
                        gl.bindTexture(gl.TEXTURE_2D, glTex);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
                            filter === gl.LINEAR_MIPMAP_LINEAR ? gl.LINEAR : filter);
                        if(filter === gl.LINEAR_MIPMAP_LINEAR)
                            gl.generateMipmap(gl.TEXTURE_2D);
                        gl.bindTexture(gl.TEXTURE_2D, null);
                    }catch(e){ console.warn("[NT] filter patch:", e); }
                }

                // Smooth PNGs — icons + UI assets need LINEAR (they scale down)
                const SMOOTH_KEYS = new Set([
                    "bg","pause_button","ui_pause_win","ui_btn_wide_g",
                    "ui_confirm","ui_decline","pyramid","zigzag",
                    "tex_chest_common","tex_chest_rare","tex_chest_legendary",
                ]);

                game.textures.on("addtexture", (key)=>{
                    const isChar   = (key === "idle" || key === "run" || key === "death");
                    const isSmooth = SMOOTH_KEYS.has(key) || key.startsWith("upicon_");
                    const t = game.textures.get(key);
                    if(!t || !t.source) return;
                    t.source.forEach(src => {
                        if(!src || !src.glTexture) return;
                        if(isChar){
                            src.smoothed = false;
                            _applyFilter(src.glTexture, gl.NEAREST);
                        } else if(isSmooth){
                            src.smoothed = true;
                            _applyFilter(src.glTexture, gl.LINEAR_MIPMAP_LINEAR);
                        }
                        // All other textures already NEAREST from pixelArt:true
                    });
                });
            }
        }
    };
    new Phaser.Game(config);
    
    // SceneGame direkt başlar
}
// DOMContentLoaded çoktan geçmişse direkt başlat, geçmemişse bekle
// Font preload sistemi: LilitaOne yüklenmeden Phaser başlamaz → siyah kutu fix
if(document.readyState==="loading"){
    window.addEventListener("DOMContentLoaded", ()=>_ensureFontLoaded(_startPhaserGame));
} else {
    _ensureFontLoaded(_startPhaserGame);
}
