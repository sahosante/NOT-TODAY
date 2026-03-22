// ═══════════════════════════════════════════════════════════════
// NOT TODAY  v9.0  |  by Şahin Beyazgül
// PART A: Dil Sistemi, Sabitler, Epilepsi Sahnesi, Intro Sahnesi
// ═══════════════════════════════════════════════════════════════


// ─── IAP / GEM STORE ─────────────────────────────────────────
const GEM_PACKS=[
    {gems:50,   price:"$0.99",  bonus:0,   tag:null,      popular:false},
    {gems:130,  price:"$1.99",  bonus:10,  tag:"popular",  popular:true},
    {gems:320,  price:"$3.99",  bonus:30,  tag:null,       popular:false},
    {gems:750,  price:"$7.99",  bonus:100, tag:"best",     popular:false},
    {gems:1800, price:"$14.99", bonus:300, tag:null,       popular:false},
];
const GOLD_FROM_GEM=8; // 1 gem = 8 altın
let PLAYER_GEMS=parseInt(localStorage.getItem("nt_gems")||"0");
function addGems(n){PLAYER_GEMS=Math.max(0,PLAYER_GEMS+n);localStorage.setItem("nt_gems",PLAYER_GEMS);}
function spendGems(n){if(PLAYER_GEMS<n)return false;PLAYER_GEMS-=n;localStorage.setItem("nt_gems",PLAYER_GEMS);return true;}

function showIAPStore(scene){
    scene._closePanel();
    const W=360,H=640,objs=[],addO=o=>{objs.push(o);return o;};
    const close=()=>{
        this_input_off(scene);
        objs.forEach(o=>{try{if(o.removeAllListeners)o.removeAllListeners();if(o.destroy)o.destroy();}catch(e){}});
        scene._openPanel=null;
    };
    function this_input_off(sc){}

    addO(scene.add.rectangle(W/2,H/2,W,H,0x000000,0.92).setInteractive().setDepth(10)); // input blocker
    const pg=addO(scene.add.graphics().setDepth(11));
    pg.fillStyle(0x04000a,0.99); pg.fillRoundedRect(6,6,348,628,12);
    pg.lineStyle(2.5,0xcc44ff,0.9); pg.strokeRoundedRect(6,6,348,628,12);
    pg.fillStyle(0xcc44ff,0.09); pg.fillRoundedRect(6,6,348,54,{tl:12,tr:12,bl:0,br:0});
    pg.lineStyle(1,0x440066,0.3); pg.strokeRoundedRect(10,10,340,620,10);

    const titleStr=CURRENT_LANG==="ru"?"💎 МАГАЗИН ГЕМОВ":CURRENT_LANG==="en"?"💎 GEM STORE":"💎 ELMAS MAĞAZASI";
    addO(scene.add.text(W/2,28,titleStr,{font:"bold 16px 'Courier New'",color:"#cc44ff",stroke:"#000",strokeThickness:5,letterSpacing:4}).setOrigin(0.5).setDepth(12));
    const subStr=CURRENT_LANG==="ru"?"Покупай гемы · меняй на золото":CURRENT_LANG==="en"?"Buy gems · convert to gold":"Elmas al · altına çevir";
    addO(scene.add.text(W/2,46,subStr,{font:"bold 10px 'Courier New'",color:"#9966cc",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(12));

    // Mevcut bakiye
    const gemTxt=addO(scene.add.text(80,65,"💎 "+PLAYER_GEMS,{font:"bold 11px 'Courier New'",color:"#cc44ff",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5).setDepth(12));
    const goldTxt=addO(scene.add.text(W-80,65,"💰 "+PLAYER_GOLD,{font:"bold 11px 'Courier New'",color:"#ffdd44",stroke:"#000",strokeThickness:2}).setOrigin(1,0.5).setDepth(12));

    // Gem → Altın çevir butonu
    const convBg=addO(scene.add.graphics().setDepth(12));
    const drawConv=(hov)=>{convBg.clear();convBg.fillStyle(hov?0x334400:0x1a2200,1);convBg.fillRoundedRect(W/2-60,58,120,22,5);convBg.lineStyle(1.5,hov?0xaaff44:0x558822,0.8);convBg.strokeRoundedRect(W/2-60,58,120,22,5);};
    drawConv(false);
    const convLbl=addO(scene.add.text(W/2,69,CURRENT_LANG==="ru"?"💎→💰 КОНВЕРТИРОВАТЬ":CURRENT_LANG==="en"?"💎→💰 CONVERT":"💎→💰 ÇEVIR",{font:"bold 8px 'Courier New'",color:"#aaff44",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(13));
    const convHit=addO(scene.add.rectangle(W/2,69,120,22,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(14));
    convHit.on("pointerover",()=>drawConv(true)).on("pointerout",()=>drawConv(false));
    convHit.on("pointerdown",()=>{
        if(PLAYER_GEMS<1){scene.cameras.main.shake(20,0.005);return;}
        const g=PLAYER_GEMS*GOLD_FROM_GEM;
        PLAYER_GOLD+=g;localStorage.setItem("nt_gold",PLAYER_GOLD);
        addGems(-PLAYER_GEMS);
        gemTxt.setText("💎 "+PLAYER_GEMS);
        goldTxt.setText("💰 "+PLAYER_GOLD);
        const fl=scene.add.text(W/2,60,"💰 +"+g,{font:"bold 14px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:4}).setOrigin(0.5).setDepth(20).setAlpha(0);
        scene.tweens.add({targets:fl,alpha:1,y:40,duration:600,ease:"Back.easeOut"});
        scene.time.delayedCall(1400,()=>scene.tweens.add({targets:fl,alpha:0,duration:300,onComplete:()=>fl.destroy()}));
    });

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
        addO(scene.add.text(CX+38,cy+CARD_H/2,"💎",{font:"26px 'Courier New'"}).setOrigin(0.5).setDepth(14));

        // Miktar
        const totalGems=pack.gems+pack.bonus;
        const gemAmtStr=totalGems.toString();
        addO(scene.add.text(CX+74,cy+12,gemAmtStr,{font:"bold 24px 'Courier New'",color:"#cc44ff",stroke:"#000",strokeThickness:4}).setDepth(14));
        const gemWordStr=CURRENT_LANG==="ru"?"ГЕМОВ":CURRENT_LANG==="en"?"GEMS":"ELMAS";
        addO(scene.add.text(CX+74+gemAmtStr.length*14+4,cy+18,gemWordStr,{font:"bold 11px 'Courier New'",color:"#aa66cc",stroke:"#000",strokeThickness:2}).setDepth(14));

        // Altın karşılığı
        const goldEquiv=(pack.gems+pack.bonus)*GOLD_FROM_GEM;
        addO(scene.add.text(CX+74,cy+40,"= "+goldEquiv.toLocaleString()+" 💰 "+( CURRENT_LANG==="ru"?"ЗОЛОТА":CURRENT_LANG==="en"?"GOLD":"ALTIN"),{font:"bold 9px 'Courier New'",color:"#ffcc44",stroke:"#000",strokeThickness:2}).setDepth(14));

        // Bonus badge
        if(pack.bonus>0){
            const bonusBg=addO(scene.add.graphics().setDepth(14));
            bonusBg.fillStyle(0x00aa44,0.9); bonusBg.fillRoundedRect(CX+74,cy+54,70,16,4);
            const bStr=CURRENT_LANG==="ru"?"+"+pack.bonus+" БОНУС":CURRENT_LANG==="en"?"+"+pack.bonus+" BONUS":"+"+pack.bonus+" BONUS";
            addO(scene.add.text(CX+109,cy+62,bStr,{font:"bold 8px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:1}).setOrigin(0.5).setDepth(15));
        }

        // Tag rozeti
        if(pack.tag){
            const tagStr=pack.tag==="best"?(CURRENT_LANG==="ru"?"⭐ ЛУЧШЕЕ":CURRENT_LANG==="en"?"⭐ BEST VALUE":"⭐ EN İYİ"):(CURRENT_LANG==="ru"?"🔥 ПОПУЛЯРНО":CURRENT_LANG==="en"?"🔥 POPULAR":"🔥 POPÜLER");
            const tagBg=addO(scene.add.graphics().setDepth(14));
            tagBg.fillStyle(tagCol,0.95); tagBg.fillRoundedRect(CX+CW-92,cy+8,82,18,5);
            tagBg.lineStyle(1,0xffffff,0.3); tagBg.strokeRoundedRect(CX+CW-92,cy+8,82,18,5);
            addO(scene.add.text(CX+CW-51,cy+17,tagStr,{font:"bold 8px 'Courier New'",color:"#000"}).setOrigin(0.5).setDepth(15));
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
        addO(scene.add.text(BX+BW/2,BY+10,pack.price,{font:"bold 12px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:3}).setOrigin(0.5).setDepth(14));
        const buyStr=CURRENT_LANG==="ru"?"КУПИТЬ":CURRENT_LANG==="en"?"BUY":"SATIN AL";
        addO(scene.add.text(BX+BW/2,BY+25,buyStr,{font:"bold 8px 'Courier New'",color:"#cc88ff",stroke:"#000",strokeThickness:1}).setOrigin(0.5).setDepth(14));

        const hitArea=addO(scene.add.rectangle(CX+CW/2,cy+CARD_H/2,CW,CARD_H,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(16));
        hitArea.on("pointerover",()=>{drawCard(true);drawBuy(true);});
        hitArea.on("pointerout",()=>{drawCard(false);drawBuy(false);});
        hitArea.on("pointerdown",()=>{
            // Telegram IAP veya simülasyon
            if(window.Telegram?.WebApp?.openInvoice){
                window.Telegram.WebApp.openInvoice("gem_"+i,(status)=>{
                    if(status==="paid"){addGems(pack.gems+pack.bonus);gemTxt.setText("💎 "+PLAYER_GEMS);showPurchaseEffect(scene,cx+CW/2,cy+CARD_H/2,tagCol,pack.gems+pack.bonus,"💎");}
                });
            } else {
                addGems(pack.gems+pack.bonus);
                gemTxt.setText("💎 "+PLAYER_GEMS);
                showPurchaseEffect(scene,CX+CW/2,cy+CARD_H/2,tagCol,pack.gems+pack.bonus,"💎");
            }
        });
    });

    objs.push(...scene._closeBtn(W/2,H-16,null,()=>{
        objs.forEach(o=>{try{if(o.removeAllListeners)o.removeAllListeners();if(o.destroy)o.destroy();}catch(e){}});
        scene._openPanel=null;
    }));
    scene._openPanel=objs;
}

function showPurchaseEffect(scene,x,y,col,amount,icon){
    scene.cameras.main.shake(40,0.008);
    const fl=scene.add.graphics().setDepth(30);fl.fillStyle(col,0.25);fl.fillRect(0,0,360,640);
    scene.tweens.add({targets:fl,alpha:0,duration:300,onComplete:()=>fl.destroy()});
    for(let i=0;i<24;i++){
        const ang=Phaser.Math.DegToRad(i*15);const spd=Phaser.Math.Between(50,140);
        const p=scene.add.text(x+Math.cos(ang)*15,y+Math.sin(ang)*15,icon,{font:"14px 'Courier New'"}).setDepth(31).setAlpha(0.9);
        scene.tweens.add({targets:p,x:x+Math.cos(ang)*spd,y:y+Math.sin(ang)*spd*0.7,alpha:0,scaleX:0.1,scaleY:0.1,duration:Phaser.Math.Between(300,600),ease:"Quad.easeOut",onComplete:()=>p.destroy()});
    }
    const gt=scene.add.text(x,y-20,"✦ +"+amount+" "+icon,{font:"bold 20px 'Courier New'",color:Phaser.Display.Color.IntegerToColor(col).rgba,stroke:"#000",strokeThickness:6}).setOrigin(0.5).setDepth(32).setAlpha(0);
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
        upMulti:"Çoklu Atış",upSpeed:"Çeviklik",upPierce:"Delici",
        upCrit:"Kritik",upKnockback:"İtme",upFreeze:"Buz",
        upXpboost:"Akademisyen",upMaxhp:"Dayanıklılık",upRegen:"Yenilenme",
        upMagnet:"Mıknatıs",upHeal:"Sağlık Kiti",upOrbit:"Yörünge Bıçak",
        upExplosive:"El Bombası",upFlame:"Alev Aurası",upLightning:"Zincir Şimşek",
        upDrone:"Muharip Drone",upSaw:"Testere",upPoison:"Zehir Bulutu",
        upMeteor:"Meteor Yağmuru",upLaser:"Lazer",upThunder:"Gök Gürültüsü",
        evoTriCannon:"Üç Top",evoStormCore:"Fırtına Çekirdeği",
        evoGravityWell:"Yerçekimi Kuyusu",evoOverload:"Aşırı Yük",
        evoCryoField:"Kryo Alanı",evoPlagueBearer:"Veba Taşıyıcı",
        epilepsyTitle:"EPİLEPSİ UYARISI",
        epilepsyText:"Bu oyun parlak ışıklar ve hızlı görsel değişimler içermektedir. Işığa duyarlı epilepsi hastalarının dikkatli olması önerilir.",
        epilepsyBtn:"Anladım — Devam Et",
        continueBtn:"► DEVAM ET",
        startHp:"Demir Bünye",startHpDesc:"Başla: +10 max can",
        startDmg:"Keskin Bıçak",startDmgDesc:"Başla: +15% hasar",
        startSpd:"Çöl Koşucusu",startSpdDesc:"Başla: +10% hız",
        goldBonus:"Hazine Avcısı",goldBonusDesc:"+25% altın kazan",
        extraLife:"İkinci Şans",extraLifeDesc:"Bir kez diriliş",
        xpBonus:"Alim Hediyesi",xpBonusDesc:"Başla: +20% XP",
        critStart:"Kartal Gözü",critStartDesc:"Başla: %5 kritik",
        magnetStart:"Mıknatıs Taşı",magnetStartDesc:"Başla: mıknatıs",
        chestHeal:"+5 CAN",chestDamage:"+15% HASAR",
        chestAttack:"+8% ATEŞ HIZI",chestSpeed:"+10% HAREKET",
        chestMaxHp:"+3 MAX CAN",chestComboBoost:"KOMBO BOOST",
        chestXp:"+50% XP (30sn)",chestGold:"+ALTIN",
        extraLife2:"✦ DİRİLİŞ!",
        evolution:"EVRİM",
        // Görev UI
        dailyQuests:"📋 GÜNLÜK GÖREVLER",
        questCompleted:"✦ GÖREV TAMAMLANDI ✦",
        questClaim:"✦ ÖDÜLÜ AL",
        questClaimed:"✓ Ödül Alındı",
        questDone:"✓ TAMAMLANDI",
        questInProgress:"Oyunda ilerler",
        questResetIn:"Yenileme:",
        questStreak:"GÜN STREAK",
        questStreakBonus:"BONUS",
        questEasy:"KOLAY",questMedium:"ORTA",questHard:"ZOR",
        questGold:"Altın",questXpBoost:"XP Boost",
        // Upgrade açıklamaları
        upDamageDesc:"+20% hasar",upAttackDesc:"+15% ateş hızı",upSizeDesc:"+18% mermi boyutu",
        upMultiDesc:"+1 mermi (max 3)",upSpeedDesc:"+12% hareket hızı",upPierceDesc:"+1 düşman deler",
        upCritDesc:"+8% kritik şans",upKnockbackDesc:"Düşmanı iter",upFreezeDesc:"%9 dondurma",
        upXpboostDesc:"+20% XP",upMaxhpDesc:"+5 max can",upRegenDesc:"4s/can yenileme",
        upMagnetDesc:"XP mıknatısı",upHealDesc:"Anında 8 can",upOrbitDesc:"Dönen bıçaklar",
        upExplosiveDesc:"Patlayan mermi",upFlameDesc:"Yakın düşman yakar",upLightningDesc:"Şimşek zinciri",
        upDroneDesc:"Oto hedefli drone",upSawDesc:"Seken testere",upPoisonDesc:"Ölümde zehir",
        upMeteorDesc:"Meteor düşer",upLaserDesc:"Alan lazeri",upThunderDesc:"Rastgele şimşek",
        evoTriCannonDesc:"Üçlü geniş atış",evoStormCoreDesc:"Rezonans x2, hasar x1.5",
        evoGravityWellDesc:"Tam ekran XP mıknatısı",evoOverloadDesc:"%4 ekran patlaması",
        evoCryoFieldDesc:"Alan dondurucu",evoPlagueBearer2Desc:"Patlama zehir bırakır",
        comingSoon:"🔒 COMING SOON",required:"Gerekli:",unlocked:"✓ AÇIK",
        creditsTitle:"KREDİLER",creditsBy:"YAPIMCI",
        tutorialTitle:"⚡ PERFECT HIT",tutorialSubtitle:"Düşmanın tam ortasından vur!",
        tutorialNormal:"NORMAL",tutorialNormalDmg:"1x hasar",
        tutorialPerfectZone:"✦ PERFECT ZONE ✦",tutorialPerfectDmg:"3x HASAR!",
        tutorialInfo1:"Mermiyi düşmanın tam ortasından geçir",
        tutorialInfo2:"Daha fazla hasar, daha hızlı kombo!",
        tutorialInfo3:"Kenara vurursan normal hasar alırsın.",
        tutorialOk:"► TAMAM, ANLADIM",
        tutorialEnemies:"⚠ ÖZEL DÜŞMANLAR",
        tutorialInferno:"🔥 Ateş: 360° döner",
        tutorialGlacier:"❄️ Buz: Çift zırhlı",
        tutorialPhantomTri:"👻 Hayalet: Ölünce ikiye bölünür",
        tutorialVolt:"⚡ Volt: Zigzag + hızlanır",
        tutorialObsidian:"🌑 Obsidyen: Hasar yansıtır",
        tutorialLabel:"Perfect Hit Tutorialı:",tutorialOn:"AÇIK",tutorialOff:"KAPALI",
        footerSignature:"NOT TODAY  —  Şahin Beyazgül",
        questHard2:"ÇOK ZOR",questHard3:"AŞIRI ZOR",
        // Intro lore - Part 1
        lore1_1:"Yüzyıllar önce onlar gökten düştü.",
        lore1_2:"Altın piramitler…",
        lore1_3:"Ama içleri boş değildi.",
        lore1_4:"Her biri hapsolmuş bir gücü taşıyordu.",
        lore1_5:"Kontrol edilemeyen.",
        lore1_6:"Yok edilemeyen.",
        lore1_7:"Bu yüzden onları yok edemedik.",
        lore1_8:"Onları mühürledik.",
        // Intro lore - Part 2
        lore2_1:"Çölün derinliklerine gömdük.",
        lore2_2:"Üzerlerine kutsal işaretler kazıdık.",
        lore2_3:"Bir daha uyanmasınlar diye.",
        lore2_4:"Uzun süre sessiz kaldılar.",
        lore2_5:"Ama artık mühürler kırılıyor.",
        lore2_6:"Piramitler yeniden yükseliyor.",
        lore2_7:"Yayılmak için geliyorlar.",
        lore2_8:"O mühür onların tek zayıf noktası.",
        lore2_9:"Sen seçildin.",
        lore2_10:"Mühürleri parçala. İstilayı durdur.",
        // Intro buton yazıları
        loreContinue:"► DEVAM ET",
        loreEnter:"► OYUNA GİR",
        loreSkip:"[ ATLA ]",
        loreTagline:"— Mühürleri kır. İstilayı durdur. —",
        relicTitle:"ARTİFAKT SEÇ",
        relicSubtitle:"Kalıcı bir güç seç — run boyunca aktif kalır",
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
        goScore:"SKOR",goNewRecord:"🏆 YENİ REKOR!",goLevel:"SEVİYE",goTime:"SÜRE",
        goRevive:"💎 DİRİL",goReviveCost:"(5 Elmas)",goInsufficientGems:"❌ Yetersiz Elmas!",
        goGemsStatus:"💎 Mevcut:",goGemsInsufficient:"(Yetersiz)",goShare:"📤 Skoru Paylaş",
        goRevivePrompt:"DİRİLMEK İSTER MİSİN?",goReviveCrystalCost:"Mevcut:",
        goReviveBtn:"✦ DİRİL  (3 💎)",
        leaderboard:"🏆 LIDERBOARD",lbTitle:"DÜNYA SIRALAMALARI",lbRank:"SIRA",lbPlayer:"OYUNCU",lbScore:"SKOR",lbLoading:"Yükleniyor...",lbEmpty:"Henüz skor yok!",lbYou:"(Sen)",lbSubmit:"Skoru Gönder",lbError:"Bağlantı hatası",lbGlobal:"GLOBAL",lbLocal:"KİŞİSEL",
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
        upMulti:"Multi Shot",upSpeed:"Agility",upPierce:"Piercing",
        upCrit:"Critical",upKnockback:"Knockback",upFreeze:"Ice",
        upXpboost:"Scholar",upMaxhp:"Endurance",upRegen:"Regeneration",
        upMagnet:"Magnet",upHeal:"Health Kit",upOrbit:"Orbit Blade",
        upExplosive:"Grenade",upFlame:"Flame Aura",upLightning:"Chain Lightning",
        upDrone:"Combat Drone",upSaw:"Saw",upPoison:"Poison Cloud",
        upMeteor:"Meteor Rain",upLaser:"Laser",upThunder:"Thunder",
        evoTriCannon:"Tri-Cannon",evoStormCore:"Storm Core",
        evoGravityWell:"Gravity Well",evoOverload:"Overload",
        evoCryoField:"Cryo Field",evoPlagueBearer:"Plague Bearer",
        epilepsyTitle:"EPILEPSY WARNING",
        epilepsyText:"This game contains flashing lights and rapid visual changes. People with photosensitive epilepsy should exercise caution.",
        epilepsyBtn:"I Understand — Continue",
        continueBtn:"► CONTINUE",
        startHp:"Iron Body",startHpDesc:"Start: +10 max hp",
        startDmg:"Sharp Blade",startDmgDesc:"Start: +15% damage",
        startSpd:"Desert Runner",startSpdDesc:"Start: +10% speed",
        goldBonus:"Treasure Hunter",goldBonusDesc:"+25% gold earned",
        extraLife:"Second Chance",extraLifeDesc:"One revival",
        xpBonus:"Scholar Gift",xpBonusDesc:"Start: +20% XP",
        critStart:"Eagle Eye",critStartDesc:"Start: 5% crit",
        magnetStart:"Magnet Stone",magnetStartDesc:"Start: magnet",
        chestHeal:"+5 HP",chestDamage:"+15% DAMAGE",
        chestAttack:"+8% FIRE RATE",chestSpeed:"+10% MOVEMENT",
        chestMaxHp:"+3 MAX HP",chestComboBoost:"COMBO BOOST",
        chestXp:"+50% XP (30s)",chestGold:"+GOLD",
        extraLife2:"✦ REVIVAL!",
        evolution:"EVOLUTION",
        // Quest UI
        dailyQuests:"📋 DAILY QUESTS",
        questCompleted:"✦ QUEST COMPLETE ✦",
        questClaim:"✦ CLAIM REWARD",
        questClaimed:"✓ Claimed",
        questDone:"✓ COMPLETE",
        questInProgress:"Keep playing to progress",
        questResetIn:"Resets in:",
        questStreak:"DAY STREAK",
        questStreakBonus:"BONUS",
        questEasy:"EASY",questMedium:"MEDIUM",questHard:"HARD",
        questGold:"Gold",questXpBoost:"XP Boost",
        // Upgrade descriptions
        upDamageDesc:"+20% damage",upAttackDesc:"+15% fire rate",upSizeDesc:"+18% bullet size",
        upMultiDesc:"+1 bullet (max 3)",upSpeedDesc:"+12% move speed",upPierceDesc:"+1 pierce",
        upCritDesc:"+8% crit chance",upKnockbackDesc:"Knocks back enemies",upFreezeDesc:"9% freeze chance",
        upXpboostDesc:"+20% XP",upMaxhpDesc:"+5 max HP",upRegenDesc:"Heal 1 HP every 4s",
        upMagnetDesc:"XP magnet",upHealDesc:"Instant +8 HP",upOrbitDesc:"Orbiting blades",
        upExplosiveDesc:"Explosive bullets",upFlameDesc:"Burns nearby enemies",upLightningDesc:"Chain lightning",
        upDroneDesc:"Auto-targeting drone",upSawDesc:"Bouncing saw",upPoisonDesc:"Poison on kill",
        upMeteorDesc:"Meteor strike",upLaserDesc:"Area laser",upThunderDesc:"Random lightning",
        evoTriCannonDesc:"Triple wide shot",evoStormCoreDesc:"Resonance x2, damage x1.5",
        evoGravityWellDesc:"Full screen XP magnet",evoOverloadDesc:"4% screen explosion",
        evoCryoFieldDesc:"Area freeze",evoPlagueBearer2Desc:"Explosions leave poison",
        comingSoon:"🔒  COMING SOON",required:"Required:",unlocked:"✓ UNLOCKED",
        creditsTitle:"CREDITS",creditsBy:"DEVELOPER",
        tutorialTitle:"⚡ PERFECT HIT",tutorialSubtitle:"Hit the enemy dead center!",
        tutorialNormal:"NORMAL",tutorialNormalDmg:"1x damage",
        tutorialPerfectZone:"✦ PERFECT ZONE ✦",tutorialPerfectDmg:"3x DAMAGE!",
        tutorialInfo1:"Pass the bullet through the enemy's center",
        tutorialInfo2:"More damage and faster combo!",
        tutorialInfo3:"Hit the edge and you deal normal damage.",
        tutorialOk:"► GOT IT",
        tutorialEnemies:"⚠ SPECIAL ENEMIES",
        tutorialInferno:"🔥 Inferno: Spins 360°",
        tutorialGlacier:"❄️ Glacier: Double armor",
        tutorialPhantomTri:"👻 Phantom: Splits on death",
        tutorialVolt:"⚡ Volt: Zigzag + surges",
        tutorialObsidian:"🌑 Obsidian: Reflects damage",
        tutorialLabel:"Perfect Hit Tutorial:",tutorialOn:"ON",tutorialOff:"OFF",
        footerSignature:"NOT TODAY  —  Şahin Beyazgül",
        questHard2:"VERY HARD",questHard3:"EXTREME",
        lore1_1:"Centuries ago, they fell from the sky.",
        lore1_2:"Golden pyramids…",
        lore1_3:"But they were not empty inside.",
        lore1_4:"Each carried a power trapped within.",
        lore1_5:"Uncontrollable.",
        lore1_6:"Indestructible.",
        lore1_7:"So we couldn't destroy them.",
        lore1_8:"We sealed them.",
        lore2_1:"We buried them deep in the desert.",
        lore2_2:"We carved sacred markings upon them.",
        lore2_3:"So they would never awaken again.",
        lore2_4:"For a long time, they were silent.",
        lore2_5:"But now the seals are breaking.",
        lore2_6:"The pyramids are rising again.",
        lore2_7:"They are coming to spread.",
        lore2_8:"That seal is their only weakness.",
        lore2_9:"You were chosen.",
        lore2_10:"Break the seals. Stop the invasion.",
        loreContinue:"► CONTINUE",
        loreEnter:"► ENTER",
        loreSkip:"[ SKIP ]",
        loreTagline:"— Break the seals. Stop the invasion. —",
        relicTitle:"SELECT ARTIFACT",
        relicSubtitle:"Pick a permanent power — active for the entire run",
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
        goScore:"SCORE",goNewRecord:"🏆 NEW RECORD!",goLevel:"LEVEL",goTime:"TIME",
        goRevive:"💎 REVIVE",goReviveCost:"(5 Gems)",goInsufficientGems:"❌ Not enough gems!",
        goGemsStatus:"💎 Gems:",goGemsInsufficient:"(Insufficient)",goShare:"📤 Share Score",
        goRevivePrompt:"WANT TO REVIVE?",goReviveCrystalCost:"Current:",
        goReviveBtn:"✦ REVIVE  (3 💎)",
        leaderboard:"🏆 LEADERBOARD",lbTitle:"WORLD RANKINGS",lbRank:"RANK",lbPlayer:"PLAYER",lbScore:"SCORE",lbLoading:"Loading...",lbEmpty:"No scores yet!",lbYou:"(You)",lbSubmit:"Submit Score",lbError:"Connection error",lbGlobal:"GLOBAL",lbLocal:"PERSONAL",
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
        upMulti:"Мультивыстрел",upSpeed:"Ловкость",upPierce:"Пробивание",
        upCrit:"Критический удар",upKnockback:"Отброс",upFreeze:"Лёд",
        upXpboost:"Учёный",upMaxhp:"Выносливость",upRegen:"Регенерация",
        upMagnet:"Магнит",upHeal:"Аптечка",upOrbit:"Орбитальный Клинок",
        upExplosive:"Граната",upFlame:"Огненная Аура",upLightning:"Цепная Молния",
        upDrone:"Боевой Дрон",upSaw:"Пила",upPoison:"Ядовитое Облако",
        upMeteor:"Метеоритный Дождь",upLaser:"Лазер",upThunder:"Гром",
        evoTriCannon:"Тройная Пушка",evoStormCore:"Ядро Бури",
        evoGravityWell:"Гравитационный Колодец",evoOverload:"Перегрузка",
        evoCryoField:"Криополе",evoPlagueBearer:"Носитель Чумы",
        epilepsyTitle:"ПРЕДУПРЕЖДЕНИЕ ОБ ЭПИЛЕПСИИ",
        epilepsyText:"В этой игре есть мигающий свет и быстрые визуальные изменения. Людям с фоточувствительной эпилепсией следует соблюдать осторожность.",
        epilepsyBtn:"Понял — Продолжить",
        continueBtn:"► ПРОДОЛЖИТЬ",
        startHp:"Железное Тело",startHpDesc:"Старт: +10 макс. здоровья",
        startDmg:"Острый Клинок",startDmgDesc:"Старт: +15% урона",
        startSpd:"Пустынный Бегун",startSpdDesc:"Старт: +10% скорости",
        goldBonus:"Охотник за Сокровищами",goldBonusDesc:"+25% золота",
        extraLife:"Второй Шанс",extraLifeDesc:"Одно воскрешение",
        xpBonus:"Дар Учёного",xpBonusDesc:"Старт: +20% опыта",
        critStart:"Орлиный Глаз",critStartDesc:"Старт: 5% крит",
        magnetStart:"Магнитный Камень",magnetStartDesc:"Старт: магнит",
        chestHeal:"+5 ХП",chestDamage:"+15% УРОНА",
        chestAttack:"+8% СКОРОСТРЕЛЬНОСТЬ",chestSpeed:"+10% ДВИЖЕНИЕ",
        chestMaxHp:"+3 МАКС ХП",chestComboBoost:"БОНУС КОМБО",
        chestXp:"+50% ОПЫТА (30с)",chestGold:"+ЗОЛОТО",
        extraLife2:"✦ ВОСКРЕШЕНИЕ!",
        evolution:"ЭВОЛЮЦИЯ",
        // Квесты UI
        dailyQuests:"📋 ЕЖЕДНЕВНЫЕ ЗАДАНИЯ",
        questCompleted:"✦ ЗАДАНИЕ ВЫПОЛНЕНО ✦",
        questClaim:"✦ ЗАБРАТЬ НАГРАДУ",
        questClaimed:"✓ Получено",
        questDone:"✓ ВЫПОЛНЕНО",
        questInProgress:"Продолжай играть",
        questResetIn:"Сброс через:",
        questStreak:"ДЕНЬ ПОДРЯД",
        questStreakBonus:"БОНУС",
        questEasy:"ЛЕГКО",questMedium:"СРЕДНЕ",questHard:"СЛОЖНО",
        questGold:"Золото",questXpBoost:"Бонус опыта",
        // Описания улучшений
        upDamageDesc:"+20% урона",upAttackDesc:"+15% скорострельность",upSizeDesc:"+18% размер пули",
        upMultiDesc:"+1 пуля (макс 3)",upSpeedDesc:"+12% скорость",upPierceDesc:"+1 пробивание",
        upCritDesc:"+8% крит. шанс",upKnockbackDesc:"Отбрасывает врагов",upFreezeDesc:"9% заморозка",
        upXpboostDesc:"+20% опыта",upMaxhpDesc:"+5 макс. ХП",upRegenDesc:"1 ХП каждые 4с",
        upMagnetDesc:"Магнит опыта",upHealDesc:"Мгновенно +8 ХП",upOrbitDesc:"Вращающиеся клинки",
        upExplosiveDesc:"Взрывные пули",upFlameDesc:"Поджигает врагов",upLightningDesc:"Цепная молния",
        upDroneDesc:"Дрон-автонаводка",upSawDesc:"Рикошетная пила",upPoisonDesc:"Яд при смерти",
        upMeteorDesc:"Удар метеора",upLaserDesc:"Лазер по области",upThunderDesc:"Случайная молния",
        evoTriCannonDesc:"Тройной широкий выстрел",evoStormCoreDesc:"Резонанс x2, урон x1.5",
        evoGravityWellDesc:"Магнит опыта на весь экран",evoOverloadDesc:"Взрыв 4% экрана",
        evoCryoFieldDesc:"Заморозка по области",evoPlagueBearer2Desc:"Взрывы оставляют яд",
        comingSoon:"🔒  СКОРО",required:"Требуется:",unlocked:"✓ ОТКРЫТО",
        creditsTitle:"ТИТРЫ",creditsBy:"РАЗРАБОТЧИК",
        tutorialTitle:"⚡ ТОЧНЫЙ УДАР",tutorialSubtitle:"Попади прямо в центр врага!",
        tutorialNormal:"ОБЫЧНЫЙ",tutorialNormalDmg:"1x урон",
        tutorialPerfectZone:"✦ ЗОНА ТОЧНОСТИ ✦",tutorialPerfectDmg:"3x УРОН!",
        tutorialInfo1:"Проведи пулю сквозь центр врага",
        tutorialInfo2:"Больше урона и быстрее комбо!",
        tutorialInfo3:"Попадёшь по краю — обычный урон.",
        tutorialOk:"► ПОНЯЛ",
        tutorialEnemies:"⚠ ОСОБЫЕ ВРАГИ",
        tutorialInferno:"🔥 Инферно: Вращается 360°",
        tutorialGlacier:"❄️ Ледник: Двойная броня",
        tutorialPhantomTri:"👻 Призрак: Делится при смерти",
        tutorialVolt:"⚡ Вольт: Зигзаг + ускорение",
        tutorialObsidian:"🌑 Обсидиан: Отражает урон",
        tutorialLabel:"Туториал Точного Удара:",tutorialOn:"ВКЛ",tutorialOff:"ВЫКЛ",
        footerSignature:"NOT TODAY  —  Şahin Beyazgül",
        questHard2:"ОЧЕНЬ СЛОЖНО",questHard3:"ЭКСТРЕМАЛЬНО",
        lore1_1:"Века назад они упали с неба.",
        lore1_2:"Золотые пирамиды…",
        lore1_3:"Но внутри они не были пусты.",
        lore1_4:"Каждая несла заточённую силу.",
        lore1_5:"Неуправляемую.",
        lore1_6:"Неуничтожимую.",
        lore1_7:"Мы не могли их уничтожить.",
        lore1_8:"Мы их запечатали.",
        lore2_1:"Мы закопали их глубоко в пустыне.",
        lore2_2:"Мы вырезали на них священные знаки.",
        lore2_3:"Чтобы они больше не пробудились.",
        lore2_4:"Долгое время они молчали.",
        lore2_5:"Но теперь печати ломаются.",
        lore2_6:"Пирамиды снова поднимаются.",
        lore2_7:"Они идут, чтобы распространиться.",
        lore2_8:"Та печать — их единственная слабость.",
        lore2_9:"Ты был избран.",
        lore2_10:"Сломай печати. Останови вторжение.",
        loreContinue:"► ПРОДОЛЖИТЬ",
        loreEnter:"► ВОЙТИ",
        loreSkip:"[ ПРОПУСТИТЬ ]",
        loreTagline:"— Сломай печати. Останови вторжение. —",
        relicTitle:"ВЫБОР АРТЕФАКТА",
        relicSubtitle:"Выбери постоянную силу — активна весь забег",
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
        goScore:"СЧЁТ",goNewRecord:"🏆 НОВЫЙ РЕКОРД!",goLevel:"УРОВЕНЬ",goTime:"ВРЕМЯ",
        goRevive:"💎 ВОСКРЕСИТЬ",goReviveCost:"(5 Гемов)",goInsufficientGems:"❌ Недостаточно гемов!",
        goGemsStatus:"💎 Гемы:",goGemsInsufficient:"(Недостаточно)",goShare:"📤 Поделиться",
        goRevivePrompt:"ХОЧЕШЬ ВОСКРЕСНУТЬ?",goReviveCrystalCost:"Текущий:",
        goReviveBtn:"✦ ВОСКРЕСИТЬ  (3 💎)",
        leaderboard:"🏆 ТАБЛИЦА РЕКОРДОВ",lbTitle:"МИРОВОЙ РЕЙТИНГ",lbRank:"МЕСТО",lbPlayer:"ИГРОК",lbScore:"СЧЁТ",lbLoading:"Загрузка...",lbEmpty:"Очков пока нет!",lbYou:"(Вы)",lbSubmit:"Отправить счёт",lbError:"Ошибка соединения",lbGlobal:"ГЛОБАЛЬНЫЙ",lbLocal:"ЛИЧНЫЙ",
    }
};
// DEFAULT LANGUAGE IS ALWAYS ENGLISH — localStorage must NOT override startup language.
// The player may change language manually during a session; that choice is saved to
// localStorage so the settings UI reflects the last-used value, but the game ALWAYS
// boots in English regardless of what is stored.
let CURRENT_LANG = "en";
function L(k){ return (LANG_DATA[CURRENT_LANG]&&LANG_DATA[CURRENT_LANG][k]!==undefined)?LANG_DATA[CURRENT_LANG][k]:((LANG_DATA["en"]&&LANG_DATA["en"][k]!==undefined)?LANG_DATA["en"][k]:k); }
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
    }catch(e){}
    const saved=localStorage.getItem("nt_player_name");
    return {id:0, name:saved||"Player", raw:null};
})();

// ── LEADERBOARD SİSTEMİ (JSONBin.io ücretsiz REST API) ───────────────────────
// jsonbin.io ücretsiz, auth gerekmez (master key ile), veya Telegram CloudStorage
const LB_BIN_ID   = "nt_leaderboard_v1";
const LB_API_BASE = "https://api.jsonbin.io/v3/b";
const LB_API_KEY  = "$2a$10$nottoday_placeholder_key"; // Kullanıcı kendi key'ini koyar
// NOT: Gerçek deployment için jsonbin.io'dan ücretsiz key alınmalı.
// Alternatif: Telegram CloudStorage (sadece kişisel, global değil)

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
    if(localRaw){ try{ _lbCache=JSON.parse(localRaw); }catch(e){} }

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

async function lbSubmitScore(score, kills, level){
    // Telegram CloudStorage'a kişisel rekor yaz
    try{
        if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.CloudStorage){
            const personal={score,kills,level,date:Date.now(),name:_TG_USER.name};
            window.Telegram.WebApp.CloudStorage.setItem("nt_best", JSON.stringify(personal));
        }
    }catch(e){}

    // Local high score güncelle
    const prevBest = parseInt(localStorage.getItem("nt_lb_personal_best")||"0");
    if(score > prevBest){
        localStorage.setItem("nt_lb_personal_best", ""+score);
        const entry={id:_TG_USER.id||Date.now(), name:_TG_USER.name, score, kills, level, date:Date.now()};
        localStorage.setItem("nt_lb_my_entry", JSON.stringify(entry));

        // Online proxy'e gönder
        try{
            fetch(_getLBBinUrl()+"/submit", {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(entry),
                signal: AbortSignal.timeout(6000)
            }).catch(()=>{});
        }catch(e){}
    }
}

// Yerel cache + kendi skorunu birleştirerek sıralama oluştur
function lbGetMergedScores(){
    const scores = (_lbCache&&_lbCache.scores) ? [..._lbCache.scores] : [];
    // Kendi entry'mizi de ekle (sunucuya ulaşamadıysa da göster)
    const myRaw = localStorage.getItem("nt_lb_my_entry");
    if(myRaw){
        try{
            const me = JSON.parse(myRaw);
            const already = scores.find(s=>s.id===me.id);
            if(!already) scores.push(me);
            else if(me.score > already.score){ already.score=me.score; already.kills=me.kills; already.level=me.level; }
        }catch(e){}
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
        try{ if(btn.g)btn.g.setVisible(false); }catch(e){}
        try{ if(btn.lbl)btn.lbl.setVisible(false); }catch(e){}
        try{ if(btn.hit){btn.hit.disableInteractive();btn.hit.setVisible(false);} }catch(e){}
    });
}
function _showMobileBtns(S){
    if(!S) return;
    [S._btnFire, S._btnLeft, S._btnRight].forEach(btn=>{
        if(!btn) return;
        try{ if(btn.g)btn.g.setVisible(true); }catch(e){}
        try{ if(btn.lbl)btn.lbl.setVisible(true); }catch(e){}
        try{ if(btn.hit){btn.hit.setInteractive();btn.hit.setVisible(true);} }catch(e){}
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
    window._nt_sfx_vol      = _f("nt_sfx_vol",  0.8);
    window._nt_music_vol    = _f("nt_music_vol", 0.6);
})();

// ── SABİTLER ─────────────────────────────────────────────────
const GROUND_Y    = 453;
const XP_GROUND_Y = 445;
const SPAWN_SAFE_X= 50;
const MAX_ENEMIES = 60;
const NEW_PYRAMID_TYPES = new Set(["inferno","glacier","phantom_tri","volt","obsidian"]); // [PERF] top-level Set — applyDmg hot path'te yeniden oluşturulmuyor
const MAX_WEAPONS = 6;
const MAX_PASSIVES= 6;
const DAY_CYCLE   = 30000;   // yavaş, güzel geçiş

const CHEST_RARITY = {
    COMMON:    {name:"common",   color:0x4488ff,glowColor:0x2255cc,shakeAmp:0.006,rewards:1,label:"chestCommon"},
    RARE:      {name:"rare",     color:0xaa44ff,glowColor:0x7700bb,shakeAmp:0.012,rewards:3,label:"chestRare"},
    LEGENDARY: {name:"legendary",color:0xffcc00,glowColor:0xff8800,shakeAmp:0.022,rewards:5,label:"chestLegendary"},
};

const UPGRADES = {
    damage:    {type:"passive",nameKey:"upDamage",   descKey:"upDamageDesc",   max:5,rarity:"common",color:0xff4455,icon:"icon_damage",   level:0},
    attack:    {type:"passive",nameKey:"upAttack",   descKey:"upAttackDesc",   max:5,rarity:"common",color:0x44aaff,icon:"icon_attack",   level:0},
    size:      {type:"passive",nameKey:"upSize",     descKey:"upSizeDesc",     max:4,rarity:"common",color:0xffaa00,icon:"icon_size",     level:0},
    multi:     {type:"passive",nameKey:"upMulti",    descKey:"upMultiDesc",    max:3,rarity:"rare",  color:0xcc44ff,icon:"icon_multi",    level:0},
    speed:     {type:"passive",nameKey:"upSpeed",    descKey:"upSpeedDesc",    max:4,rarity:"common",color:0x44ff88,icon:"icon_speed",    level:0},
    pierce:    {type:"passive",nameKey:"upPierce",   descKey:"upPierceDesc",   max:3,rarity:"rare",  color:0xaaaaff,icon:"icon_pierce",   level:0},
    crit:      {type:"passive",nameKey:"upCrit",     descKey:"upCritDesc",     max:4,rarity:"rare",  color:0xff66aa,icon:"icon_crit",     level:0},
    knockback: {type:"passive",nameKey:"upKnockback",descKey:"upKnockbackDesc",max:2,rarity:"common",color:0xff8844,icon:"icon_kb",       level:0},
    freeze:    {type:"passive",nameKey:"upFreeze",   descKey:"upFreezeDesc",   max:3,rarity:"rare",  color:0x88ddff,icon:"icon_freeze",   level:0},
    xpboost:   {type:"passive",nameKey:"upXpboost",  descKey:"upXpboostDesc",  max:3,rarity:"rare",  color:0x66ffcc,icon:"icon_xp",       level:0},
    maxhp:     {type:"passive",nameKey:"upMaxhp",    descKey:"upMaxhpDesc",    max:4,rarity:"rare",  color:0xff6666,icon:"icon_hp",       level:0},
    regen:     {type:"passive",nameKey:"upRegen",    descKey:"upRegenDesc",    max:3,rarity:"rare",  color:0x44ff88,icon:"icon_regen",    level:0},
    magnet:    {type:"passive",nameKey:"upMagnet",   descKey:"upMagnetDesc",   max:2,rarity:"rare",  color:0xffff44,icon:"icon_magnet",   level:0},
    heal:      {type:"passive",nameKey:"upHeal",     descKey:"upHealDesc",     max:3,rarity:"rare",  color:0x00ffaa,icon:"icon_heal",     level:0},
    orbit:     {type:"weapon", nameKey:"upOrbit",    descKey:"upOrbitDesc",    max:3,rarity:"rare",  color:0xffffff,icon:"icon_orbit",    level:0},
    explosive: {type:"weapon", nameKey:"upExplosive",descKey:"upExplosiveDesc",max:3,rarity:"rare",  color:0xff8800,icon:"icon_explosive",level:0},
    flame:     {type:"weapon", nameKey:"upFlame",    descKey:"upFlameDesc",    max:4,rarity:"rare",  color:0xff5500,icon:"icon_flame",    level:0},
    lightning: {type:"weapon", nameKey:"upLightning",descKey:"upLightningDesc",max:4,rarity:"rare",  color:0xffff55,icon:"icon_lightning",level:0},
    drone:     {type:"weapon", nameKey:"upDrone",    descKey:"upDroneDesc",    max:3,rarity:"rare",  color:0x00ffff,icon:"icon_drone",    level:0},
    saw:       {type:"weapon", nameKey:"upSaw",      descKey:"upSawDesc",      max:3,rarity:"rare",  color:0xcccccc,icon:"icon_saw",      level:0},
    poison:    {type:"weapon", nameKey:"upPoison",   descKey:"upPoisonDesc",   max:3,rarity:"rare",  color:0x55ff55,icon:"icon_poison",   level:0},
    meteor:    {type:"weapon", nameKey:"upMeteor",   descKey:"upMeteorDesc",   max:3,rarity:"epic",  color:0xffaa33,icon:"icon_meteor",   level:0},
    laser:     {type:"weapon", nameKey:"upLaser",    descKey:"upLaserDesc",    max:3,rarity:"epic",  color:0xff2200,icon:"icon_laser",    level:0},
    thunder:   {type:"weapon", nameKey:"upThunder",  descKey:"upThunderDesc",  max:3,rarity:"rare",  color:0x88ccff,icon:"icon_thunder",  level:0},
};

const EVOLUTIONS = [
    {name:"Tri-Cannon",   icon:"🔱",nameKey:"evoTriCannon",   descKey:"evoTriCannonDesc",   req:["multi","size"],      active:false},
    {name:"Storm Core",   icon:"⚡",nameKey:"evoStormCore",   descKey:"evoStormCoreDesc",   req:["damage","crit"],     active:false},
    {name:"Gravity Well", icon:"🌀",nameKey:"evoGravityWell", descKey:"evoGravityWellDesc", req:["magnet","speed"],    active:false},
    {name:"Overload",     icon:"💥",nameKey:"evoOverload",    descKey:"evoOverloadDesc",    req:["attack","damage"],   active:false},
    {name:"Cryo Field",   icon:"❄️",nameKey:"evoCryoField",   descKey:"evoCryoFieldDesc",   req:["freeze","pierce"],   active:false},
    {name:"Plague Bearer",icon:"☣️",nameKey:"evoPlagueBearer",descKey:"evoPlagueBearer2Desc",req:["poison","explosive"],active:false},
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
    {id:"start_hp",    nameKey:"startHp",    descKey:"startHpDesc",    cost:500,  baseCost:500,  maxLevel:5,level:0,icon:"💪"},
    {id:"start_dmg",   nameKey:"startDmg",   descKey:"startDmgDesc",   cost:700,  baseCost:700,  maxLevel:5,level:0,icon:"⚔️"},
    {id:"start_spd",   nameKey:"startSpd",   descKey:"startSpdDesc",   cost:500,  baseCost:500,  maxLevel:5,level:0,icon:"🏃"},
    {id:"gold_bonus",  nameKey:"goldBonus",  descKey:"goldBonusDesc",  cost:900,  baseCost:900,  maxLevel:5,level:0,icon:"💰"},
    {id:"extra_life",  nameKey:"extraLife",  descKey:"extraLifeDesc",  cost:2500, baseCost:2500, maxLevel:3,level:0,icon:"❤️"},
    {id:"xp_bonus",    nameKey:"xpBonus",    descKey:"xpBonusDesc",    cost:700,  baseCost:700,  maxLevel:5,level:0,icon:"📚"},
    {id:"crit_start",  nameKey:"critStart",  descKey:"critStartDesc",  cost:1500, baseCost:1500, maxLevel:5,level:0,icon:"🦅"},
    {id:"magnet_start",nameKey:"magnetStart",descKey:"magnetStartDesc",cost:2000, baseCost:2000, maxLevel:3,level:0,icon:"🧲"},
]; // [OPT] baseCost: cost her satın almada kalıcı değiştiğinden, baseCost ile localStorage'dan doğru maliyet hesaplanır

let GS;
let PLAYER_GOLD    = parseInt(localStorage.getItem("nt_gold")||"0");
let PLAYER_CRYSTAL = parseInt(localStorage.getItem("nt_crystal")||"0");

// ═══════════════════════════════════════════════════════════════
// ★ KRİSTAL SİSTEMİ — Mor kristal para birimi
// Kazanımı çok zor, diriliş + premium skin için kullanılır
// ═══════════════════════════════════════════════════════════════
const CRYSTAL_SOURCES = {
    boss_kill:        1,   // boss öldürünce 1 kristal
    survive_5min:     2,   // 5 dakika hayatta kalınca 2
    perfect_100:      1,   // tek runda 100 perfect hit
    level_25:         1,   // lv25'e ulaşınca
    weekly_quest:     3,   // haftalık görev ödülü
    daily_streak_7:   2,   // 7 günlük streak bonusu
    achievement_rare: 1,   // nadir başarım
};

const CRYSTAL_COSTS = {
    revive:           3,   // diriliş: 3 kristal
    premium_skin:     10,  // premium skin: 10 kristal
    legendary_skin:   25,  // efsane skin: 25 kristal
};

function addCrystal(amount, source){
    PLAYER_CRYSTAL = Math.max(0, PLAYER_CRYSTAL + amount);
    localStorage.setItem("nt_crystal", PLAYER_CRYSTAL);
    return PLAYER_CRYSTAL;
}

function spendCrystal(amount){
    if(PLAYER_CRYSTAL < amount) return false;
    PLAYER_CRYSTAL -= amount;
    localStorage.setItem("nt_crystal", PLAYER_CRYSTAL);
    return true;
}

// ── pickingUpgrade mutex (boolean → stack counter)
let _upgradeLock = 0;
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
            try{ S.physics.resume(); }catch(e){}
        }
        if(S && S.spawnEvent) S.spawnEvent.paused = false;
    }
}

// ── questDoneCache — localStorage'a her frame yazmayı önler
const _questDoneCache = (() => {
    try { return JSON.parse(localStorage.getItem("nt_quests_done")||"{}"); }
    catch(e){ return {}; }
})();
function saveQuestDoneCache(){
    localStorage.setItem("nt_quests_done", JSON.stringify(_questDoneCache));
}

// ── Buff/Debuff snapshot sistemi — floating point birikmesini önler
function applyTimedBuff(gs, key, multiplier, duration, S){
    const old = gs[key];
    gs[key] = gs[key] * multiplier;
    if(S) S.time.delayedCall(duration, ()=>{ if(GS) GS[key] = old; });
}
function applyTimedAbsoluteBuff(gs, key, newVal, duration, S){
    const old = gs[key];
    gs[key] = newVal;
    if(S) S.time.delayedCall(duration, ()=>{ if(GS) GS[key] = old; });
}

// ═══════════════════════════════════════════════════════════════
// ★ LOGIN REWARD SİSTEMİ
// Her gün giriş yapınca artan ödül
// ═══════════════════════════════════════════════════════════════
const LOGIN_REWARDS = [
    {day:1,  gold:50,  label:"1. GÜN",  icon:"⬡"},
    {day:2,  gold:80,  label:"2. GÜN",  icon:"⬡"},
    {day:3,  gold:120, label:"3. GÜN",  icon:"⬡⬡"},
    {day:4,  gold:160, label:"4. GÜN",  icon:"⬡⬡"},
    {day:5,  gold:250, label:"5. GÜN",  icon:"⬡⬡⬡"},
    {day:6,  gold:350, label:"6. GÜN",  icon:"⬡⬡⬡"},
    {day:7,  gold:500, label:"7. GÜN ✦",icon:"👑"},
];

function checkLoginReward(){
    const today = new Date().toDateString();
    const data  = JSON.parse(localStorage.getItem("nt_login")||"{}");
    if(data.lastDate === today) return null; // bugün zaten alındı

    const yesterday = new Date(Date.now()-86400000).toDateString();
    const streak = (data.lastDate === yesterday) ? (data.streak||0)+1 : 1;
    const dayIdx = Math.min(streak-1, LOGIN_REWARDS.length-1);
    const reward = LOGIN_REWARDS[dayIdx];

    localStorage.setItem("nt_login", JSON.stringify({lastDate:today, streak}));
    PLAYER_GOLD += reward.gold;
    localStorage.setItem("nt_gold", PLAYER_GOLD);
    return {reward, streak, dayIdx};
}

// ═══════════════════════════════════════════════════════════════
// ★ ACHIEVEMENT SİSTEMİ
// ═══════════════════════════════════════════════════════════════
const ACHIEVEMENTS = [
    // Kill başarımları
    {id:"kill_10",    nameKey:"ach_kill_10",    desc:"10 düşman öldür",         descEN:"Kill 10 enemies",       descRU:"Убей 10 врагов",           icon:"☠",  gold:30,   check:(s)=>s.totalKills>=10},
    {id:"kill_100",   nameKey:"ach_kill_100",   desc:"100 düşman öldür",        descEN:"Kill 100 enemies",      descRU:"Убей 100 врагов",          icon:"☠☠", gold:80,   check:(s)=>s.totalKills>=100},
    {id:"kill_1000",  nameKey:"ach_kill_1000",  desc:"1000 düşman öldür",       descEN:"Kill 1000 enemies",     descRU:"Убей 1000 врагов",         icon:"💀", gold:250,  check:(s)=>s.totalKills>=1000},
    {id:"kill_5000",  nameKey:"ach_kill_5000",  desc:"5000 düşman öldür",       descEN:"Kill 5000 enemies",     descRU:"Убей 5000 врагов",         icon:"💀💀",gold:600,  check:(s)=>s.totalKills>=5000},
    // Combo başarımları
    {id:"combo_10",   nameKey:"ach_combo_10",   desc:"10 kombo yap",            descEN:"Reach x10 combo",       descRU:"Достигни x10 комбо",       icon:"⚡", gold:50,   check:(s)=>s.maxCombo>=10},
    {id:"combo_20",   nameKey:"ach_combo_20",   desc:"20 max kombo ulaş",       descEN:"Reach x20 combo",       descRU:"Достигни x20 комбо",       icon:"⚡⚡",gold:150,  check:(s)=>s.maxCombo>=20},
    // Level başarımları
    {id:"level_10",   nameKey:"ach_level_10",   desc:"Tek runda lv10 ulaş",     descEN:"Reach level 10 in a run",descRU:"Достигни ур.10 за раунд", icon:"⭐",gold:60,   check:(s)=>s.maxLevel>=10},
    {id:"level_20",   nameKey:"ach_level_20",   desc:"Tek runda lv20 ulaş",     descEN:"Reach level 20 in a run",descRU:"Достигни ур.20 за раунд", icon:"⭐⭐",gold:200, check:(s)=>s.maxLevel>=20},
    // Skor başarımları
    {id:"score_10k",  nameKey:"ach_score_10k",  desc:"10.000 skor yap",         descEN:"Score 10,000",          descRU:"Набери 10 000 очков",      icon:"🏆", gold:40,   check:(s)=>s.highScore>=10000},
    {id:"score_100k", nameKey:"ach_score_100k", desc:"100.000 skor yap",        descEN:"Score 100,000",         descRU:"Набери 100 000 очков",     icon:"🏆🏆",gold:150, check:(s)=>s.highScore>=100000},
    // Hayatta kalma
    {id:"survive_3m", nameKey:"ach_survive_3m", desc:"3 dakika hayatta kal",    descEN:"Survive 3 minutes",     descRU:"Выживи 3 минуты",          icon:"🛡", gold:80,   check:(s)=>s.maxSurviveMs>=180000},
    {id:"survive_5m", nameKey:"ach_survive_5m", desc:"5 dakika hayatta kal",    descEN:"Survive 5 minutes",     descRU:"Выживи 5 минут",           icon:"🛡🛡",gold:200, check:(s)=>s.maxSurviveMs>=300000},
    // Boss başarımları
    {id:"boss_kill",  nameKey:"ach_boss_kill",  desc:"İlk boss'u öldür",        descEN:"Kill your first boss",  descRU:"Убей первого босса",       icon:"👑", gold:150,  check:(s)=>s.bossKills>=1},
    {id:"boss_5",     nameKey:"ach_boss_5",     desc:"5 boss öldür",            descEN:"Kill 5 bosses",         descRU:"Убей 5 боссов",            icon:"👑👑",gold:400, check:(s)=>s.bossKills>=5},
    // Gizli başarımlar
    {id:"perfect_50", nameKey:"ach_perfect_50", desc:"Gizli: 50 perfect hit",   descEN:"Hidden: 50 perfect hits",descRU:"Скрытое: 50 точных ударов",icon:"✦",gold:100,  check:(s)=>s.perfectHits>=50, hidden:true},
    {id:"run_10",     nameKey:"ach_run_10",     desc:"10 run oyna",             descEN:"Play 10 runs",          descRU:"Сыграй 10 раундов",        icon:"🔄",gold:80,   check:(s)=>s.totalRuns>=10},
];

// Achievement state yönetimi
function getAchievementState(){
    return JSON.parse(localStorage.getItem("nt_achievements")||"{}");
}
function getLifetimeStats(){
    return JSON.parse(localStorage.getItem("nt_lifetime")||"{}");
}
function saveLifetimeStats(s){
    localStorage.setItem("nt_lifetime", JSON.stringify(s));
}

function updateLifetimeStats(gs){
    if(!gs) return;
    const s = getLifetimeStats();
    s.totalKills   = (s.totalKills||0) + (gs.kills||0);
    s.totalRuns    = (s.totalRuns||0) + 1;
    s.maxCombo     = Math.max(s.maxCombo||0, gs.combo||0);
    s.maxLevel     = Math.max(s.maxLevel||0, gs.level||0);
    s.highScore    = Math.max(s.highScore||0, gs.score||0);
    s.maxSurviveMs = Math.max(s.maxSurviveMs||0, gs.t||0);
    s.bossKills    = (s.bossKills||0) + (gs._bossKills||0);
    s.perfectHits  = (s.perfectHits||0) + (gs.questProgress?.perfect||0);
    saveLifetimeStats(s);
    return s;
}

// Yeni achievement'ları kontrol et, yenileri döndür
function checkNewAchievements(stats){
    const state = getAchievementState();
    const newlyUnlocked = [];
    ACHIEVEMENTS.forEach(ach=>{
        if(state[ach.id]) return; // zaten alındı
        if(ach.check(stats)){
            state[ach.id] = {unlocked:true, claimed:false};
            newlyUnlocked.push(ach);
        }
    });
    localStorage.setItem("nt_achievements", JSON.stringify(state));
    return newlyUnlocked;
}

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
        id:"toxic_fire",
        name:"Toksik Ateş", nameEN:"Toxic Fire",
        req:["flame","poison"], reqLv:2,
        desc:"Alev düşmanları zehirler. Alan hasarı +%40.",
        descEN:"Flame poisons enemies. +40% area damage.",
        color:0xff6600, icon:"☣",
        active:false,
        apply:(gs)=>{ gs._synergyToxicFire=true; }
    },
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
        id:"saw_orbit",
        name:"Ölüm Çemberi", nameEN:"Death Circle",
        req:["saw","orbit"], reqLv:1,
        desc:"Testere yörünge bıçaklarıyla senkronize döner. +%25 hasar.",
        descEN:"Saw syncs with orbit blades. +25% damage.",
        color:0xcccccc, icon:"💀",
        active:false,
        apply:(gs)=>{ gs._synergyDeathCircle=true; gs.damage*=1.25; }
    },
    {
        id:"meteor_explosion",
        name:"Meteor Bombası", nameEN:"Meteor Bomb",
        req:["meteor","explosive"], reqLv:1,
        desc:"Meteor çarptığında patlama yaratır.",
        descEN:"Meteor creates an explosion on impact.",
        color:0xff8800, icon:"💥",
        active:false,
        apply:(gs)=>{ gs._synergyMeteorBomb=true; }
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
    {
        id:"hidden_magnet_xp",
        name:"Xp Vakumu", nameEN:"XP Vacuum", nameRU:"Вакуум Опыта",
        req:["magnet","xpboost"], reqLv:2,
        desc:"Gizli: XP manyetik çekim alanı 2x büyür.",
        descEN:"Hidden: XP magnet radius doubles.",
        descRU:"Скрытое: Радиус притяжения опыта x2.",
        color:0x66ffcc, icon:"🌀✨",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyXpVacuum=true; gs.magnetRadius=Math.max(gs.magnetRadius*2,140); }
    },
    {
        id:"hidden_orbit_lightning",
        name:"Ölüm Yıldızı", nameEN:"Death Star", nameRU:"Звезда Смерти",
        req:["orbit","lightning"], reqLv:2,
        desc:"Gizli: Yörünge bıçakları şimşek zinciri tetikler.",
        descEN:"Hidden: Orbit blades trigger chain lightning.",
        descRU:"Скрытое: Орбитальные клинки запускают молнию.",
        color:0xffff44, icon:"⚡💀",
        active:false, hidden:true,
        apply:(gs)=>{ gs._synergyDeathStar=true; }
    },
];

// ═══════════════════════════════════════════════════════════════
// ★ YENİ SİSTEM 2 — RUN İÇİ EVENT VERİLERİ
// ═══════════════════════════════════════════════════════════════
const RUN_EVENTS = [
    {
        id:"blood_pact",
        title:"KAN PAKTI", titleEN:"BLOOD PACT", titleRU:"КРОВАВЫЙ ПАКТ",
        desc:"Max can -8 ve mevcut canın yarısını kaybet. Karşılığında hasar kalıcı +%40.",
        descEN:"Lose 8 max HP and half current HP. But +40% permanent damage.",
        descRU:"Макс. HP -8 и половина текущего HP. Зато урон постоянно +40%.",
        icon:"🩸", color:0xff2244,
        choices:[
            {label:"İmzala",labelEN:"Sign It",labelRU:"Подписать",
             fn:(S)=>{const gs=GS;if(gs.maxHealth>8){gs.maxHealth-=5;gs.health=Math.max(1,Math.floor(gs.health/2));gs.damage*=1.4;showHitTxt(S,180,200,"🩸 KAN PAKTI!","#ff2244",true);}}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"glass_cannon",
        title:"CAM TOP", titleEN:"GLASS CANNON", titleRU:"СТЕКЛЯННАЯ ПУШКА",
        desc:"Max can 1'e düşer. Karşılığında hasar 6x, ateş hızı 2x olur. 25sn.",
        descEN:"Max HP drops to 1. But 6x damage and 2x fire rate for 25s.",
        descRU:"Макс. HP падает до 1. Зато урон x6 и скорость стрельбы x2 на 25с.",
        icon:"🔮", color:0x44aaff,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"Принять",
             fn:(S)=>{const gs=GS;const oldMax=gs.maxHealth;const oldDmg=gs.damage;const oldShoot=gs.shootDelay;
             gs.maxHealth=1;gs.health=1;gs.damage*=4.0;gs.shootDelay=Math.max(80,gs.shootDelay*0.6);gs._glassCannon=true;
             showHitTxt(S,180,200,"💥 CAM TOP!","#44aaff",true);/* flash removed */
             S.time.delayedCall(25000,()=>{if(GS){GS.maxHealth=oldMax;GS.damage=oldDmg;GS.shootDelay=oldShoot;GS._glassCannon=false;GS.health=Math.min(oldMax,Math.max(GS.health,1));}});}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"devil_deal",
        title:"ŞEYTAN ANLAŞMASI", titleEN:"DEVIL'S DEAL", titleRU:"СДЕЛКА С ДЬЯВОЛОМ",
        desc:"Tüm mevcut upgradelerin seviyeleri sıfırlanır. Karşılığında 3 seviye atla ve 2000 altın kazan.",
        descEN:"All current upgrade levels reset to 0. But gain 3 levels and 2000 gold.",
        descRU:"Все улучшения сбрасываются. Зато +3 уровня и 2000 золота.",
        icon:"😈", color:0xff0000,
        choices:[
            {label:"Anlaş",labelEN:"Deal",labelRU:"Сделка",
             fn:(S)=>{const gs=GS;
             Object.keys(UPGRADES).forEach(k=>{UPGRADES[k].level=0;});
             gs.gold=Math.min(gs.gold+2000,9999);
             for(let i=0;i<3;i++) levelUp(S);
             showHitTxt(S,180,200,"😈 ŞEYTAN ANLAŞMASI!","#ff0000",true);}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"cursed_bullets",
        title:"LANETLİ KURŞUNLAR", titleEN:"CURSED BULLETS", titleRU:"ПРОКЛЯТЫЕ ПУЛИ",
        desc:"30sn: mermi 5x hasar ama her vuruşta 1 can kaybedersin. Dikkat: çok düşman varsa ölebilirsin.",
        descEN:"30s: bullets 5x damage but each shot costs 1 HP. Beware: lots of enemies = dead.",
        descRU:"30с: пули наносят x5 урона, но каждый выстрел стоит 1 HP. Осторожно!",
        icon:"💫", color:0xcc44ff,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"Принять",
             fn:(S)=>{const gs=GS;const oldDmg=gs.damage;gs.damage*=3.5;gs._cursedBullets=true;
             showHitTxt(S,180,200,"💫 LANETLİ KURŞUNLAR!","#cc44ff",true);
             S.time.delayedCall(30000,()=>{if(GS){GS.damage=oldDmg;GS._cursedBullets=false;}});}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"god_burst",
        title:"TANRI PATLAMASI", titleEN:"GOD BURST", titleRU:"ВЗРЫВ БОГА",
        desc:"12sn yenilmez + 4x hasar. Sonra 15sn hareket hızı %70 azalır ve ateş edemezsin.",
        descEN:"12s invincible + 4x damage. Then 15s: -70% speed and can't shoot.",
        descRU:"12с неуязвимость + урон x4. Затем 15с: скорость -70% и нельзя стрелять.",
        icon:"⚡", color:0xffcc00,
        choices:[
            {label:"Aktive Et",labelEN:"Activate",labelRU:"Активировать",
             fn:(S)=>{const gs=GS;const oldDmg=gs.damage;const oldSpd=gs.moveSpeed;const oldShoot=gs.shootDelay;
             gs.invincible=true;gs._invT=-999999;gs.damage*=2.5;
             showHitTxt(S,180,200,"⚡ TANRI PATLAMASI!","#ffcc00",true);
             S.cameras.main.zoomTo(1.04,150,"Quad.easeOut");S.time.delayedCall(200,()=>S.cameras.main.zoomTo(1.0,400,"Quad.easeIn"));
             S.time.delayedCall(12000,()=>{
                 if(!GS) return;
                 GS.invincible=false;GS._invT=0;GS.damage=oldDmg;
                 GS.moveSpeed=oldSpd*0.30;GS.shootDelay=99999;
                 showHitTxt(S,180,200,"⚠ FELAKETLİ YAVAŞLAMA","#ff4400",true);
                 S.time.delayedCall(15000,()=>{if(GS){GS.moveSpeed=oldSpd;GS.shootDelay=oldShoot;}});
             });}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"double_or_nothing",
        title:"ÇIFT YA DA HİÇ", titleEN:"DOUBLE OR NOTHING", titleRU:"ВСЁ ИЛИ НИЧЕГО",
        desc:"%50 şans: tüm statlar 2x olur. %50 şans: can 1'e düşer ve 20sn yavaşlarsın.",
        descEN:"50% chance: all stats x2. 50% chance: HP drops to 1 and you slow for 20s.",
        descRU:"50%: все характеристики x2. 50%: HP до 1 и замедление на 20с.",
        icon:"🎲", color:0xffaa00,
        choices:[
            {label:"Zar At",labelEN:"Roll Dice",labelRU:"Бросить",
             fn:(S)=>{const gs=GS;if(Math.random()<0.5){
                 const oldSpd=gs.moveSpeed;gs.damage*=1.5;gs.moveSpeed=Math.min(320,gs.moveSpeed*1.5);gs.maxHealth=Math.round(gs.maxHealth*1.5);gs.health=Math.min(gs.health*1.5,gs.maxHealth);
                 showHitTxt(S,180,200,"🎲 ÇIFT! TÜM STATLAR 1.5X!","#ffcc00",true);
                 /* flash removed */
             } else {
                 const oldSpd=gs.moveSpeed;gs.health=1;gs.moveSpeed=oldSpd*0.35;
                 showHitTxt(S,180,200,"🎲 HİÇ! LANET OLDU!","#ff2244",true);
                 S.cameras.main.shake(200,0.025);/* flash removed */
                 S.time.delayedCall(20000,()=>{if(GS)GS.moveSpeed=oldSpd;});
             }}},
            {label:"Geç",labelEN:"Pass",labelRU:"Пропустить",fn:(S)=>{}}
        ]
    },
    {
        id:"phantom_army",
        title:"HAYALET ORDUSU", titleEN:"PHANTOM ARMY", titleRU:"АРМИЯ ПРИЗРАКОВ",
        desc:"15sn: 4x düşman spawn ve %50 hızlanır. Karşılığında 4x altın ve XP.",
        descEN:"15s: 4x enemy spawn speed +50%. But 4x gold and XP.",
        descRU:"15с: спавн врагов x4 и скорость +50%. Зато золото и XP x4.",
        icon:"👻", color:0x88aacc,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"Принять",
             fn:(S)=>{const gs=GS;const oldDelay=gs.spawnDelay;const oldSpd=gs.pyramidSpeed;const oldGold=gs.goldMult;const oldXp=gs.xpMult;
             gs.spawnDelay=Math.max(150,gs.spawnDelay/4);gs.pyramidSpeed=Math.min(420,gs.pyramidSpeed*1.5);gs.goldMult*=4;gs.xpMult*=4;
             showHitTxt(S,180,200,"👻 HAYALET ORDUSU!","#88aacc",true);
             S.time.delayedCall(15000,()=>{if(GS){GS.spawnDelay=oldDelay;GS.pyramidSpeed=oldSpd;GS.goldMult=oldGold;GS.xpMult=oldXp;}});}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"shadow_realm",
        title:"GÖLGE ÂLEMİ", titleEN:"SHADOW REALM", titleRU:"ТЕНЕВОЙ МИР",
        desc:"25sn: Ekran %85 kararır, düşmanlar görünmez — sadece dikkat ve refleks!",
        descEN:"25s: Screen 85% dark, enemies invisible — only instinct!",
        descRU:"25с: экран темнеет на 85%, враги невидимы — только инстинкт!",
        icon:"🌑", color:0x222244,
        choices:[
            {label:"Gir",labelEN:"Enter",labelRU:"Войти",
             fn:(S)=>{
                showHitTxt(S,180,200,"🌑 KARANLIK!","#8888cc",true);
                const darkOv=S.add.rectangle(180,320,360,640,0x000000,0).setDepth(30);
                S.tweens.add({targets:darkOv,fillAlpha:0.85,duration:500,ease:"Quad.easeIn"});
                const ae=S._activeEnemies||S.pyramids.getMatching("active",true);
                ae.forEach(e=>{if(e&&e.active){e._shadowHidden=true;e.setAlpha(0);}});
                GS._shadowRealm=true;
                S.time.delayedCall(25000,()=>{
                    if(!S||!S.tweens) return;
                    S.tweens.add({targets:darkOv,fillAlpha:0,duration:600,onComplete:()=>{try{darkOv.destroy();}catch(e){}}});
                    if(GS){GS._shadowRealm=false;}
                    S.pyramids.getMatching("active",true).forEach(e=>{if(e){e._shadowHidden=false;e.setAlpha(1);}});
                });}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"crystal_gamble",
        title:"KRİSTAL KUMAR", titleEN:"CRYSTAL GAMBLE", titleRU:"КРИСТАЛЬНЫЙ ГАМБИТ",
        desc:"%40 şans: 2 kristal kazan. %60 şans: mevcut canın tamamını kaybet (1 kalır).",
        descEN:"40% chance: gain 2 crystals. 60% chance: lose all HP (1 remains).",
        descRU:"40%: получить 2 кристалла. 60%: потерять всё HP (останется 1).",
        icon:"💎", color:0xaa44ff,
        choices:[
            {label:"Riske At",labelEN:"Risk It",labelRU:"Рискнуть",
             fn:(S)=>{const gs=GS;if(Math.random()<0.40){
                 addCrystal(2,"crystal_gamble");
                 showHitTxt(S,180,200,"💎 +2 KRİSTAL!","#cc66ff",true);
                 if(S._crystalHudText) S._crystalHudText.setText("💎 "+PLAYER_CRYSTAL);
             } else {
                 gs.health=1;
                 showHitTxt(S,180,200,"💀 CAN 1'E DÜŞTÜ!","#ff2244",true);
                 S.cameras.main.shake(200,0.02);
             }}},
            {label:"Geç",labelEN:"Pass",labelRU:"Пропустить",fn:(S)=>{}}
        ]
    },
    // ── YENİ OLAYLAR ──
    {
        id:"triple_choice",
        title:"ÜÇLÜ TERCİH", titleEN:"TRIPLE CHOICE", titleRU:"ТРОЙНОЙ ВЫБОР",
        desc:"Üç seçeneğin var: +12 can, +%50 hasar veya +1 ekstra mermi. Sadece biri!",
        descEN:"Three options: +12 HP, +50% damage, or +1 extra bullet. Pick ONE.",
        descRU:"Три варианта: +12 HP, +50% урон или +1 пуля. Только один!",
        icon:"🎯", color:0x44ff88,
        choices:[
            {label:"💖 +6 Can",labelEN:"💖 +6 HP",labelRU:"💖 +6 HP",
             fn:(S)=>{const gs=GS;gs.maxHealth+=6;gs.health=Math.min(gs.health+6,gs.maxHealth);showHitTxt(S,180,200,"💖 +6 CAN!","#ff8888",true);}},
            {label:"⚔️ +%50 Hasar",labelEN:"⚔️ +50% DMG",labelRU:"⚔️ +50% урон",
             fn:(S)=>{GS.damage*=1.5;showHitTxt(S,180,200,"⚔️ +%50 HASAR!","#ffcc44",true);}},
            {label:"🔫 +1 Mermi",labelEN:"🔫 +1 Bullet",labelRU:"🔫 +1 пуля",
             fn:(S)=>{if(UPGRADES.multi)UPGRADES.multi.level=Math.min(UPGRADES.multi.maxLevel,(UPGRADES.multi.level||0)+1);showHitTxt(S,180,200,"🔫 +1 MERMİ!","#88aaff",true);}}
        ]
    },
    {
        id:"sacrifice_upgrade",
        title:"FEDAKÂRLİK", titleEN:"SACRIFICE", titleRU:"ЖЕРТВА",
        desc:"En yüksek seviyeli upgradeini sıfırla. Karşılığında o seviye kadar can ve 1500 altın.",
        descEN:"Reset your highest upgrade to 0. Gain that many HP and 1500 gold.",
        descRU:"Сбрось лучшее улучшение до 0. Получи столько HP и 1500 золота.",
        icon:"⚖️", color:0xffaa44,
        choices:[
            {label:"Feda Et",labelEN:"Sacrifice",labelRU:"Пожертвовать",
             fn:(S)=>{const gs=GS;let best=null;let bestLv=0;
             Object.entries(UPGRADES).forEach(([k,u])=>{if((u.level||0)>bestLv){bestLv=u.level;best=k;}});
             if(best&&bestLv>0){UPGRADES[best].level=0;gs.maxHealth+=bestLv*2;gs.health=Math.min(gs.health+bestLv*2,gs.maxHealth);gs.gold=Math.min(gs.gold+1200,9999);
             // Weapon gruplarını anında temizle (donma önlemi)
             if(best==="drone"&&S.droneGroup){S.droneGroup.getChildren().forEach(d=>{d.setActive(false).setVisible(false);});}
             if(best==="saw"&&S.sawGroup){S.sawGroup.getChildren().forEach(sw=>{sw.setActive(false).setVisible(false);if(sw.body)sw.body.setVelocity(0,0);});}
             if(best==="orbit"&&S.orbitGroup){S.orbitGroup.getChildren().forEach(o=>{o.setActive(false).setVisible(false);});}
             showHitTxt(S,180,200,"⚖️ FEDAKÂRLİK! +"+bestLv*2+" CAN","#ffaa44",true);}
             else{showHitTxt(S,180,240,"Aktif upgrade yok!","#ff4444",false);}}},
            {label:"Vazgeç",labelEN:"Cancel",labelRU:"Отмена",fn:(S)=>{}}
        ]
    },
    {
        id:"mirror_world",
        title:"AYNA DÜNYA", titleEN:"MIRROR WORLD", titleRU:"ЗЕРКАЛЬНЫЙ МИР",
        desc:"20sn: Hareket kontrollerin ters döner. Karşılığında bu süre boyunca 3x altın ve XP.",
        descEN:"20s: Movement controls reversed. But 3x gold and XP while active.",
        descRU:"20с: управление инвертировано. Зато золото и XP x3.",
        icon:"🪞", color:0x88ccff,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"Принять",
             fn:(S)=>{const gs=GS;gs._mirrorControls=true;const oldGold=gs.goldMult;const oldXp=gs.xpMult;
             gs.goldMult*=3;gs.xpMult*=3;
             showHitTxt(S,180,200,"🪞 AYNA DÜNYA!","#88ccff",true);
             S.time.delayedCall(20000,()=>{if(GS){GS._mirrorControls=false;GS.goldMult=oldGold;GS.xpMult=oldXp;}});}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"meteor_rain",
        title:"METEOR YAĞMURU", titleEN:"METEOR RAIN", titleRU:"МЕТЕОРИТНЫЙ ДОЖДЬ",
        desc:"10sn: Her saniye rastgele bir düşman yok olur. Ama sen de %60 daha yavaşlarsın.",
        descEN:"10s: One enemy dies each second. But you move 60% slower.",
        descRU:"10с: каждую секунду один враг погибает. Но твоя скорость -60%.",
        icon:"☄️", color:0xff8800,
        choices:[
            {label:"Aktive Et",labelEN:"Activate",labelRU:"Активировать",
             fn:(S)=>{const gs=GS;const oldSpd=gs.moveSpeed;gs.moveSpeed*=0.40;
             showHitTxt(S,180,200,"☄️ METEOR YAĞMURU!","#ff8800",true);
             let mCount=0;
             const mTimer=S.time.addEvent({delay:1000,repeat:9,callback:()=>{
                 const ae=S._activeEnemies&&S._activeEnemies.filter(e=>e&&e.active&&!e.isBoss&&!e.spawnProtected);
                 if(ae&&ae.length>0){const victim=ae[Math.floor(Math.random()*ae.length)];killEnemy(S,victim,true);}
             }});
             S.time.delayedCall(10000,()=>{if(GS)GS.moveSpeed=oldSpd;});}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"soul_harvest",
        title:"RUH HASATI", titleEN:"SOUL HARVEST", titleRU:"СБОР ДУШ",
        desc:"Bir sonraki 20 kill için: her kill = +1 can. Ama bu süre boyunca ateş hızın %40 düşer.",
        descEN:"Next 20 kills: each kill = +1 HP. But fire rate -40% during this time.",
        descRU:"Следующие 20 убийств: каждое = +1 HP. Но скорость стрельбы -40%.",
        icon:"💀", color:0xcc88ff,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"Принять",
             fn:(S)=>{const gs=GS;gs._soulHarvest=20;const oldShoot=gs.shootDelay;
             gs.shootDelay=Math.min(900,gs.shootDelay*1.6);
             showHitTxt(S,180,200,"💀 RUH HASATI!","#cc88ff",true);
             // Reset shootDelay after 20 kills (tracked in killEnemy via gs._soulHarvest)
             S.time.delayedCall(40000,()=>{if(GS&&GS._soulHarvest>0){GS._soulHarvest=0;GS.shootDelay=oldShoot;}});}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"treasure_curse",
        title:"HAZİNE LANETİ", titleEN:"TREASURE CURSE", titleRU:"ПРОКЛЯТОЕ СОКРОВИЩЕ",
        desc:"3000 altın kazan AMMA kalıcı olarak max can -15 ve zırh sıfırlanır.",
        descEN:"Gain 3000 gold BUT permanently lose 15 max HP and all armor.",
        descRU:"Получить 3000 золота, НО навсегда -15 макс. HP и броня сбрасывается.",
        icon:"💰", color:0xffdd00,
        choices:[
            {label:"Al",labelEN:"Take It",labelRU:"Взять",
             fn:(S)=>{const gs=GS;gs.gold=Math.min(gs.gold+3000,9999);gs.maxHealth=Math.max(5,gs.maxHealth-8);gs.health=Math.min(gs.health,gs.maxHealth);gs.armor=0;
             showHitTxt(S,180,200,"💰 3000 ALTIN! LANET!","#ffdd00",true);}},
            {label:"Geç",labelEN:"Pass",labelRU:"Пропустить",fn:(S)=>{}}
        ]
    },
    {
        id:"echo_shot",
        title:"EKO ATIŞ", titleEN:"ECHO SHOT", titleRU:"ЭХО ВЫСТРЕЛ",
        desc:"30sn: Her mermi ikinci kez yansır ve bir düşmana daha çarpar. Ama hasar %30 azalır.",
        descEN:"30s: Each bullet bounces once to hit another enemy. But -30% damage.",
        descRU:"30с: каждая пуля рикошетит и бьёт ещё одного врага. Но урон -30%.",
        icon:"🔄", color:0x44eeff,
        choices:[
            {label:"Aktive Et",labelEN:"Activate",labelRU:"Активировать",
             fn:(S)=>{const gs=GS;const oldDmg=gs.damage;gs.damage*=0.70;gs._echoShot=true;
             showHitTxt(S,180,200,"🔄 EKO ATIŞ!","#44eeff",true);
             S.time.delayedCall(30000,()=>{if(GS){GS.damage=oldDmg;GS._echoShot=false;}});}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"shield_gamble",
        title:"KALKAN KUMARI", titleEN:"SHIELD GAMBLE", titleRU:"ГАМБИТ ЩИТ",
        desc:"%50 şans: 20sn yenilmez ol. %50 şans: sonraki 10sn boyunca hasar alamazsın ama hareket edemezsin.",
        descEN:"50%: invincible 20s. 50%: frozen in place for 10s (no damage taken).",
        descRU:"50%: неуязвимость 20с. 50%: заморожен на 10с (урон не получаешь).",
        icon:"🛡️", color:0x4488ff,
        choices:[
            {label:"Zar At",labelEN:"Roll",labelRU:"Бросить",
             fn:(S)=>{const gs=GS;if(Math.random()<0.5){
                 gs.invincible=true;gs._invT=-999999;
                 showHitTxt(S,180,200,"🛡️ YENİLMEZ 20SN!","#4488ff",true);
                 S.time.delayedCall(20000,()=>{if(GS){GS.invincible=false;GS._invT=0;}});
             }else{
                 const oldSpd=gs.moveSpeed;gs.moveSpeed=0;gs.invincible=true;gs._invT=-999999;
                 showHitTxt(S,180,200,"⛓️ DONDU! 10SN","#ff8844",true);
                 S.time.delayedCall(10000,()=>{if(GS){GS.moveSpeed=oldSpd;GS.invincible=false;GS._invT=0;}});
             }}},
            {label:"Geç",labelEN:"Pass",labelRU:"Пропустить",fn:(S)=>{}}
        ]
    },
    {
        id:"gold_fever",
        title:"ALTIN ATEŞİ", titleEN:"GOLD FEVER", titleRU:"ЗОЛОТАЯ ЛИХОРАДКА",
        desc:"45sn: Her düşman öldürünce çift altın ama ateş edemezsin — sadece düşman çarpmasından ölürler.",
        descEN:"45s: Double gold per kill but you CANNOT shoot — enemies die from collisions only.",
        descRU:"45с: двойное золото за убийство, но НЕЛЬЗЯ стрелять — враги гибнут от столкновений.",
        icon:"🤑", color:0xffcc00,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"Принять",
             fn:(S)=>{const gs=GS;const oldShoot=gs.shootDelay;gs.shootDelay=999999;const oldGold=gs.goldMult;gs.goldMult*=2;
             showHitTxt(S,180,200,"🤑 ALTIN ATEŞİ!","#ffcc00",true);
             S.time.delayedCall(45000,()=>{if(GS){GS.shootDelay=oldShoot;GS.goldMult=oldGold;}});}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"clone_yourself",
        title:"KENDİNİ KLONLA", titleEN:"CLONE YOURSELF", titleRU:"КЛОНИРОВАТЬ СЕБЯ",
        desc:"15sn: İki tane oyuncu olursun (ikincisi otomatik ateş eder). Sonra can yarıya iner.",
        descEN:"15s: A clone of you auto-fires. But HP halves afterward.",
        descRU:"15с: клон автоматически стреляет. Но потом HP делится на 2.",
        icon:"👥", color:0x88ff88,
        choices:[
            {label:"Klonla",labelEN:"Clone",labelRU:"Клонировать",
             fn:(S)=>{const gs=GS;
             // Sahte bir drone oluştur clone gibi
             if(!S._cloneDrone){
                 try{
                     const cd=S.physics.add.image(S.player.x+30,S.player.y,"tex_player_idle");
                     cd.body.setAllowGravity(false);
                     cd.setTint(0x88ff88).setAlpha(0.7).setDepth(11).setScale(0.9);
                     S._cloneDrone=cd;
                     S._cloneTimer=S.time.addEvent({delay:200,repeat:74,callback:()=>{
                         if(!S._cloneDrone||!S._cloneDrone.active) return;
                         // Auto shoot
                         const ae=S._activeEnemies||[];
                         if(ae.length>0){
                             const t=ae[0];
                             const b=S.bullets&&S.bullets.get(cd.x,cd.y,"tex_bullet");
                             if(b){b.setActive(true).setVisible(true).setDepth(14);
                             if(b.body){b.body.setAllowGravity(false);b.setVelocityY(-560);}
                             S.time.delayedCall(900,()=>{if(b&&b.active)b.setActive(false).setVisible(false);});}
                         }
                     }});
                     S.time.delayedCall(15000,()=>{
                         if(S._cloneDrone){try{S._cloneDrone.destroy();}catch(e){}S._cloneDrone=null;}
                         if(S._cloneTimer){S._cloneTimer.remove();S._cloneTimer=null;}
                         if(GS){GS.health=Math.max(1,Math.floor(GS.health/2));}
                         showHitTxt(S,180,200,"👥 KLON BİTTİ! CAN YARIYA","#ff8888",true);
                     });
                     showHitTxt(S,180,200,"👥 KLON AKTİF!","#88ff88",true);
                 }catch(e){showHitTxt(S,180,240,"Klon oluşturulamadı","#ff4444",false);}
             }}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"cursed_upgrade",
        title:"LANETLİ YÜKSELTİ", titleEN:"CURSED UPGRADE", titleRU:"ПРОКЛЯТОЕ УЛУЧШЕНИЕ",
        desc:"Rastgele bir upgradeini MAX seviyeye çıkar. Ama rastgele başka bir upgrade tamamen silinir.",
        descEN:"Random upgrade goes to MAX. But a random other upgrade resets to 0.",
        descRU:"Случайное улучшение — MAX. Но другое случайное улучшение сбрасывается в 0.",
        icon:"🎰", color:0xff44aa,
        choices:[
            {label:"Çek",labelEN:"Pull",labelRU:"Тянуть",
             fn:(S)=>{const keys=Object.keys(UPGRADES);
             const k1=keys[Math.floor(Math.random()*keys.length)];
             UPGRADES[k1].level=UPGRADES[k1].maxLevel;
             let k2=k1;while(k2===k1)k2=keys[Math.floor(Math.random()*keys.length)];
             UPGRADES[k2].level=0;
             showHitTxt(S,180,200,"🎰 MAX: "+k1.toUpperCase()+" / SİFIR: "+k2.toUpperCase(),"#ff44aa",true);}},
            {label:"Geç",labelEN:"Pass",labelRU:"Пропустить",fn:(S)=>{}}
        ]
    },
    {
        id:"time_freeze",
        title:"ZAMAN DONDURUCU", titleEN:"TIME FREEZE", titleRU:"ЗАМОРОЗКА ВРЕМЕНИ",
        desc:"8sn tüm düşmanlar tamamen durur. Sen serbestsin. Karşılığında 8sn sonra spawn hızı 3x artar.",
        descEN:"8s: ALL enemies freeze completely. You're free. Then spawn rate 3x for 8s.",
        descRU:"8с: все враги замирают. Ты свободен. Затем спавн x3 на 8с.",
        icon:"🕰️", color:0x44ccff,
        choices:[
            {label:"Dondur",labelEN:"Freeze",labelRU:"Заморозить",
             fn:(S)=>{const gs=GS;
             const ae=S._activeEnemies||S.pyramids.getMatching("active",true);
             ae.forEach(e=>{if(e&&e.active&&e.body){e._tfVy=e.body.velocity.y;e._tfVx=e.body.velocity.x;e.body.setVelocity(0,0);e._timeFrozen=true;}});
             showHitTxt(S,180,200,"🕰️ ZAMAN DONDU!","#44ccff",true);
             S.time.delayedCall(8000,()=>{
                 const ae2=S._activeEnemies||[];
                 ae2.forEach(e=>{if(e&&e.active&&e._timeFrozen){e.body.setVelocity(e._tfVx||0,e._tfVy||80);e._timeFrozen=false;}});
                 const oldDelay=gs.spawnDelay;gs.spawnDelay=Math.max(200,gs.spawnDelay/3);
                 showHitTxt(S,180,200,"⚡ SPAWN 3X ARTTI!","#ff4400",true);
                 S.time.delayedCall(8000,()=>{if(GS)GS.spawnDelay=oldDelay;});
             });}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"berserker_deal",
        title:"BERSERK ANLAŞMASI", titleEN:"BERSERKER DEAL", titleRU:"СДЕЛКА БЕРСЕРКА",
        desc:"Ateş hızı -%60 kalıcı. Karşılığında hasar kalıcı +%120 ve mermi boyutu +%80.",
        descEN:"Fire rate -60% permanent. But +120% damage and +80% bullet size permanent.",
        descRU:"Скорость стрельбы -60% навсегда. Зато урон +120% и размер пуль +80%.",
        icon:"⚔️", color:0xff4400,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"Принять",
             fn:(S)=>{const gs=GS;gs.shootDelay=Math.min(900,gs.shootDelay*2.0);gs.damage*=1.8;gs.bulletScale=(gs.bulletScale||1)*1.5;
             showHitTxt(S,180,200,"⚔️ BERSERK!","#ff4400",true);}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"crystal_shrine",
        title:"KRİSTAL TAPINAĞI", titleEN:"CRYSTAL SHRINE", titleRU:"ХРУСТАЛЬНЫЙ ХРАМ",
        desc:"3 kristal harca: kalıcı olarak hasar +%30, max can +8, hız +%20.",
        descEN:"Spend 3 crystals: permanent +30% damage, +8 max HP, +20% speed.",
        descRU:"Потрать 3 кристалла: урон +30%, макс. HP +8, скорость +20% навсегда.",
        icon:"💎", color:0xcc44ff,
        choices:[
            {label:"Harca (3💎)",labelEN:"Spend (3💎)",labelRU:"Потратить (3💎)",
             fn:(S)=>{const gs=GS;if(PLAYER_CRYSTAL>=3){spendCrystal(3);
                 gs.damage*=1.3;gs.moveSpeed=Math.min(340,gs.moveSpeed*1.2);gs.maxHealth+=8;gs.health=Math.min(gs.health+6,gs.maxHealth);
                 showHitTxt(S,180,200,"💎 KRİSTAL GÜCÜ!","#cc44ff",true);
                 if(S._crystalHudText) S._crystalHudText.setText("💎 "+PLAYER_CRYSTAL);
             } else {showHitTxt(S,180,240,"Yeterli kristal yok! ("+PLAYER_CRYSTAL+"/3)","#ff4444",false);}}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
    {
        id:"ancient_curse",
        title:"ANTİK LANET", titleEN:"ANCIENT CURSE", titleRU:"ДРЕВНЕЕ ПРОКЛЯТИЕ",
        desc:"Ateş hızı kalıcı -%30. Karşılığında mermi 3.5x hasar ve deler (pierce+2). Kalıcı.",
        descEN:"Fire rate permanent -30%. But bullets deal 3.5x damage and pierce+2. Permanent.",
        descRU:"Скорость стрельбы -30% навсегда. Зато пули x3.5 урона и пробивают +2 врагов.",
        icon:"💀", color:0xaa44ff,
        choices:[
            {label:"Kabul Et",labelEN:"Accept",labelRU:"Принять",
             fn:(S)=>{const gs=GS;gs.shootDelay=Math.min(700,gs.shootDelay*1.3);gs.damage*=2.5;gs.pierceCount=(gs.pierceCount||0)+2;
             showHitTxt(S,180,200,"💀 ANTİK LANET!","#aa44ff",true);}},
            {label:"Reddet",labelEN:"Decline",labelRU:"Отказать",fn:(S)=>{}}
        ]
    },
];

// ═══════════════════════════════════════════════════════════════
// ★ YENİ SİSTEM 3 — RELİK / ARTIFACT VERİLERİ
// ═══════════════════════════════════════════════════════════════
const RELICS = [
    {
        id:"berserker_core",
        name:"Berserker Çekirdeği", nameEN:"Berserker Core",
        desc:"Can azaldıkça hasar artar (max +%80).",
        descEN:"Damage increases as HP drops (max +80%).",
        icon:"💢", color:0xff2244, rarity:"rare",
        tick:(gs)=>{
            const ratio=1-(gs.health/gs.maxHealth);
            gs._relicDmgBonus=1+ratio*0.8;
        }
    },
    {
        id:"time_shard",
        name:"Zaman Kırığı", nameEN:"Time Shard",
        desc:"Her 60 saniyede 3 saniyelik yavaşlatma aktive olur.",
        descEN:"Every 60s activates 3s of time slowdown.",
        icon:"⌛", color:0x88aaff, rarity:"legendary",
        tick:(gs,S)=>{
            if(!gs._timeShardTimer) gs._timeShardTimer=0;
            gs._timeShardTimer+=16;
            if(gs._timeShardTimer>=60000&&!gs._timeSlowActive){
                gs._timeShardTimer=0;
                gs._timeSlowActive=true;
                S.time.timeScale=0.4;
                showHitTxt(S,180,150,"⌛ ZAMAN YAVAŞLIYOR","#88aaff",true);
                S.time.delayedCall(3000,()=>{S.time.timeScale=1;gs._timeSlowActive=false;});
            }
        }
    },
    {
        id:"gold_engine",
        name:"Altın Motor", nameEN:"Gold Engine",
        desc:"Her 10 altın → +%1 hasar (max +%50).",
        descEN:"Every 10 gold → +1% damage (max +50%).",
        icon:"⚙", color:0xffcc00, rarity:"epic",
        tick:(gs)=>{
            const bonus=Math.min(0.5, gs.gold/1000);
            gs._relicGoldBonus=1+bonus;
        }
    },
    {
        id:"phantom_step",
        name:"Hayalet Adım", nameEN:"Phantom Step",
        desc:"Her 5 öldürmede 1 saniyelik yenilmezlik.",
        descEN:"Every 5 kills grants 1s of invincibility.",
        icon:"👻", color:0x8888cc, rarity:"rare",
        tick:(gs)=>{ /* killEnemy'de kontrol edilir */ }
    },
    {
        id:"combo_shield",
        name:"Kombo Kalkanı", nameEN:"Combo Shield",
        desc:"5+ kombo iken hasar almaz.",
        descEN:"No damage taken while combo is 5+.",
        icon:"🛡", color:0x44aaff, rarity:"epic",
        tick:(gs)=>{ /* damagePlayer'da kontrol edilir */ }
    },
    {
        id:"xp_surge",
        name:"XP Dalgası", nameEN:"XP Surge",
        desc:"Her level-up'ta 5 saniye boyunca XP 3x.",
        descEN:"After each level-up, 3x XP for 5s.",
        icon:"📈", color:0x66ffcc, rarity:"rare",
        tick:(gs)=>{ /* levelUp'ta kontrol edilir */ }
    },
];

// ═══════════════════════════════════════════════════════════════
// ★ YENİ SİSTEM 4 — GÖREV VERİLERİ
// ═══════════════════════════════════════════════════════════════
const DAILY_QUESTS = [
    // ═══════════════════════════════════════════════════════════
    // ZOR (difficulty:"hard") — 2 tanesi seçilir — Tek oturumda bitirilebilir ama çaba gerekir
    // ═══════════════════════════════════════════════════════════
    {id:"q_kills_500",  difficulty:"hard",
     text:"500 düşman öldür",textEN:"Kill 500 enemies",textRU:"Убей 500 врагов",          textEN:"Kill 500 enemies",           textRU:"Убей 500 врагов",
     type:"kills",  target:500,  reward:{gold:1200,xpBonus:true}},
    {id:"q_kills_1000", difficulty:"hard",
     text:"1.000 düşman öldür",textEN:"Kill 1,000 enemies",textRU:"Убей 1000 врагов",         textEN:"Kill 1,000 enemies",         textRU:"Убей 1000 врагов",
     type:"kills",  target:1000, reward:{gold:1800,xpBonus:true}},
    {id:"q_combo_100",  difficulty:"hard",
     text:"100x kombo yap",textEN:"Reach x100 combo",textRU:"Достигни комбо x100",             textEN:"Reach x100 combo",           textRU:"Набери комбо x100",
     type:"combo",  target:100,  reward:{gold:1500}},
    {id:"q_survive_20", difficulty:"hard",
     text:"20 dakika hayatta kal",textEN:"Survive 20 minutes",textRU:"Выживи 20 минут",      textEN:"Survive 20 minutes",         textRU:"Продержись 20 минут",
     type:"time",   target:1200, reward:{gold:2000,xpBonus:true}},
    {id:"q_perfect_200",difficulty:"hard",
     text:"200 mükemmel vuruş yap",textEN:"Get 200 perfect hits",textRU:"Сделай 200 точных ударов",     textEN:"Land 200 perfect hits",      textRU:"Нанеси 200 точных ударов",
     type:"perfect",target:200,  reward:{gold:1400}},
    {id:"q_gold_10000", difficulty:"hard",
     text:"10.000 altın topla",textEN:"Collect 10,000 gold",textRU:"Собери 10000 золота",         textEN:"Collect 10,000 gold",        textRU:"Собери 10000 золота",
     type:"goldcol",target:10000,reward:{gold:1600}},
    {id:"q_level_25",   difficulty:"hard",
     text:"Level 25'e ulaş",textEN:"Reach Level 25",textRU:"Достигни уровня 25",            textEN:"Reach level 25",             textRU:"Достигни 25 уровня",
     type:"level",  target:25,   reward:{gold:1700,xpBonus:true}},
    {id:"q_boss_5",     difficulty:"hard",
     text:"5 boss öldür",textEN:"Kill 5 bosses",textRU:"Убей 5 боссов",               textEN:"Slay 5 bosses",              textRU:"Убей 5 боссов",
     type:"boss",   target:5,    reward:{gold:2000,xpBonus:true}},

    // ═══════════════════════════════════════════════════════════
    // ÇOK ZOR (difficulty:"vhard") — 3 tanesi seçilir — Birden fazla oturum gerektirebilir
    // ═══════════════════════════════════════════════════════════
    {id:"q_kills_5000", difficulty:"vhard",
     text:"5.000 düşman öldür",textEN:"Kill 5,000 enemies",textRU:"Убей 5000 врагов",         textEN:"Kill 5,000 enemies",         textRU:"Убей 5000 врагов",
     type:"kills",  target:5000, reward:{gold:4000,xpBonus:true}},
    {id:"q_kills_10000",difficulty:"vhard",
     text:"10.000 düşman öldür",textEN:"Kill 10,000 enemies",textRU:"Убей 10000 врагов",        textEN:"Kill 10,000 enemies",        textRU:"Убей 10000 врагов",
     type:"kills",  target:10000,reward:{gold:6500,xpBonus:true}},
    {id:"q_combo_250",  difficulty:"vhard",
     text:"250x kombo yap",textEN:"Reach x250 combo",textRU:"Достигни комбо x250",             textEN:"Reach x250 combo",           textRU:"Набери комбо x250",
     type:"combo",  target:250,  reward:{gold:5000}},
    {id:"q_survive_35", difficulty:"vhard",
     text:"35 dakika hayatta kal",textEN:"Survive 35 minutes",textRU:"Выживи 35 минут",      textEN:"Survive 35 minutes",         textRU:"Продержись 35 минут",
     type:"time",   target:2100, reward:{gold:5500,xpBonus:true}},
    {id:"q_perfect_500",difficulty:"vhard",
     text:"500 mükemmel vuruş yap",textEN:"Get 500 perfect hits",textRU:"Сделай 500 точных ударов",     textEN:"Land 500 perfect hits",      textRU:"Нанеси 500 точных ударов",
     type:"perfect",target:500,  reward:{gold:4500}},
    {id:"q_gold_25000", difficulty:"vhard",
     text:"25.000 altın topla",textEN:"Collect 25,000 gold",textRU:"Собери 25000 золота",         textEN:"Collect 25,000 gold",        textRU:"Собери 25000 золота",
     type:"goldcol",target:25000,reward:{gold:4000}},
    {id:"q_level_40",   difficulty:"vhard",
     text:"Level 40'a ulaş",textEN:"Reach Level 40",textRU:"Достигни уровня 40",            textEN:"Reach level 40",             textRU:"Достигни 40 уровня",
     type:"level",  target:40,   reward:{gold:5000,xpBonus:true}},
    {id:"q_boss_10",    difficulty:"vhard",
     text:"10 boss öldür",textEN:"Kill 10 bosses",textRU:"Убей 10 боссов",              textEN:"Slay 10 bosses",             textRU:"Убей 10 боссов",
     type:"boss",   target:10,   reward:{gold:6000,xpBonus:true}},

    // ═══════════════════════════════════════════════════════════
    // AŞIRI ZOR (difficulty:"extreme") — 3 tanesi seçilir — Gerçek grind / birden fazla gün
    // ═══════════════════════════════════════════════════════════
    {id:"q_kills_20000",difficulty:"extreme",
     text:"20.000 düşman öldür",textEN:"Kill 20,000 enemies",textRU:"Убей 20000 врагов",        textEN:"Kill 20,000 enemies",        textRU:"Убей 20000 врагов",
     type:"kills",  target:20000,reward:{gold:12000,xpBonus:true}},
    {id:"q_combo_500",  difficulty:"extreme",
     text:"500x kombo yap",textEN:"Reach x500 combo",textRU:"Достигни комбо x500",             textEN:"Reach x500 combo",           textRU:"Набери комбо x500",
     type:"combo",  target:500,  reward:{gold:10000}},
    {id:"q_survive_60", difficulty:"extreme",
     text:"60 dakika hayatta kal",textEN:"Survive 60 minutes",textRU:"Выживи 60 минут",      textEN:"Survive 60 minutes",         textRU:"Продержись 60 минут",
     type:"time",   target:3600, reward:{gold:15000,xpBonus:true}},
    {id:"q_perfect_1000",difficulty:"extreme",
     text:"1.000 mükemmel vuruş yap",textEN:"Get 1,000 perfect hits",textRU:"Сделай 1000 точных ударов",   textEN:"Land 1,000 perfect hits",    textRU:"Нанеси 1000 точных ударов",
     type:"perfect",target:1000, reward:{gold:11000}},
    {id:"q_gold_50000", difficulty:"extreme",
     text:"50.000 altın topla",textEN:"Collect 50,000 gold",textRU:"Собери 50000 золота",         textEN:"Collect 50,000 gold",        textRU:"Собери 50000 золота",
     type:"goldcol",target:50000,reward:{gold:10000}},
    {id:"q_level_60",   difficulty:"extreme",
     text:"Level 60'a ulaş",textEN:"Reach Level 60",textRU:"Достигни уровня 60",            textEN:"Reach level 60",             textRU:"Достигни 60 уровня",
     type:"level",  target:60,   reward:{gold:13000,xpBonus:true}},
    {id:"q_boss_20",    difficulty:"extreme",
     text:"20 boss öldür",textEN:"Kill 20 bosses",textRU:"Убей 20 боссов",              textEN:"Slay 20 bosses",             textRU:"Убей 20 боссов",
     type:"boss",   target:20,   reward:{gold:14000,xpBonus:true}},
];


// ═══════════════════════════════════════════════════════════════
// ★ YENİ SİSTEM 5 — MİNİ BOSS VERİLERİ
// ═══════════════════════════════════════════════════════════════
const MINI_BOSS_POOL = [
    {
        id:"sand_colossus",
        name:"Kum Devi", nameEN:"Sand Colossus",
        hp:120, armor:3, scale:2.8, color:0xffaa44, tint:0xffaa44,
        speed:0.35, reward:{chest:"legendary", xpMult:5}
    },
    {
        id:"shadow_titan",
        name:"Gölge Titan", nameEN:"Shadow Titan",
        hp:90, armor:2, scale:2.2, color:0x4444aa, tint:0x6666ff,
        speed:0.55, reward:{chest:"rare", xpMult:4}
    },
    {
        id:"crystal_lord",
        name:"Kristal Lord", nameEN:"Crystal Lord",
        hp:100, armor:4, scale:2.5, color:0x88ddff, tint:0x88ddff,
        speed:0.40, reward:{chest:"legendary", xpMult:5}
    },
];

// ═══════════════════════════════════════════════════════════════
// EPİLEPSİ SAHNE — sadece bir kere gösterilir
// ═══════════════════════════════════════════════════════════════
class SceneEpilepsy extends Phaser.Scene {
    constructor(){ super({key:"SceneEpilepsy"}); }
    create(){
        const W=360,H=640;
        this.add.rectangle(W/2,H/2,W,H,0x000000,1).setDepth(0);

        // [UI POLISH P1] Epilepsi paneli — daha dengeli layout
        const panelTop=130, panelH=340;
        const pg=this.add.graphics().setDepth(1);
        pg.fillStyle(0x0d0003,0.99); pg.fillRect(20,panelTop,320,panelH);
        pg.lineStyle(2,0xff2244,0.9); pg.strokeRect(20,panelTop,320,panelH);
        pg.lineStyle(1,0x660011,0.35); pg.strokeRect(24,panelTop+4,312,panelH-8);
        pg.fillStyle(0xff2244,0.12); pg.fillRect(20,panelTop,320,44);

        // [UI POLISH P1] Uyarı ikonu — panelin içinde, üst şerit ortasında
        const iconY=panelTop+22;
        const ig=this.add.graphics().setDepth(2);
        // Üçgen — daha küçük, sığıyor
        ig.fillStyle(0xff8800,1);
        ig.fillTriangle(W/2,iconY-14, W/2-18,iconY+8, W/2+18,iconY+8);
        ig.fillStyle(0x0d0003,1);
        ig.fillRect(W/2-2,iconY-10,4,12); // ünlem gövde
        ig.fillRect(W/2-2,iconY+4,4,3);   // ünlem nokta

        // [UI POLISH P1] Başlık — ikon altında, tam ortalı
        this.add.text(W/2,panelTop+58,L("epilepsyTitle"),{
           font:"bold 20px 'Courier New'",color:"#ff3355",
            stroke:"#330011",strokeThickness:5,letterSpacing:3
        }).setOrigin(0.5).setDepth(2);

        // [UI POLISH P1] Ayraç çizgisi
        const divG=this.add.graphics().setDepth(2);
        divG.lineStyle(1,0x440011,0.5);
        divG.lineBetween(40,panelTop+84,W-40,panelTop+84);

        // [UI POLISH P1] Metin — ortalı, yeterli margin
        this.add.text(W/2,panelTop+98,L("epilepsyText"),{
           font:"12px 'Courier New'",color:"#eedddd",
            wordWrap:{width:270},align:"center",lineSpacing:8
        }).setOrigin(0.5,0).setDepth(2);

        // [UI POLISH P1] Buton — panelin altında, net hizalı
        const btnY=panelTop+panelH-56;
        const btnG=this.add.graphics().setDepth(2);
        const drawBtn=hov=>{
            btnG.clear();
            btnG.fillStyle(hov?0xff2244:0x550011,1);
            btnG.fillRoundedRect(70,btnY,220,44,6);
            btnG.lineStyle(2,hov?0xff7788:0xff2244,0.9);
            btnG.strokeRoundedRect(70,btnY,220,44,6);
            btnG.fillStyle(0xffffff,hov?0.10:0.05);
            btnG.fillRoundedRect(70,btnY,220,6,{tl:6,tr:6,bl:0,br:0});
        };
        drawBtn(false);
        this.add.text(W/2,btnY+22,L("epilepsyBtn"),{
           font:"bold 13px 'Courier New'",color:"#ffffff",
            stroke:"#220011",strokeThickness:3
        }).setOrigin(0.5).setDepth(3);

        const hit=this.add.rectangle(W/2,btnY+22,220,44,0xffffff,0.001).setInteractive().setDepth(4);
        hit.on("pointerover",()=>drawBtn(true));
        hit.on("pointerout",()=>drawBtn(false));
        hit.on("pointerdown",()=>{
            localStorage.setItem("nt_epilepsy_ok","1");
            this.cameras.main.fade(350,0,0,0,false,(c,p)=>{if(p>=1)this.scene.start("SceneIntro");});
        });

        // [UI POLISH] Versiyon numarası kaldırıldı — sadece imza kalır
        this.add.text(W/2,H-10,L("footerSignature"),{
            font:"bold 9px 'Courier New'",color:"#331122"
        }).setOrigin(0.5).setDepth(2);
    }
}

// ═══════════════════════════════════════════════════════════════
// INTRO SAHNE — Lore typewriter  +  NOT TODAY title
// ═══════════════════════════════════════════════════════════════
class SceneIntro extends Phaser.Scene {
    constructor(){ super({key:"SceneIntro"}); }
    create(){
        const W=360,H=640;
        this.add.rectangle(W/2,H/2,W,H,0x000000,1).setDepth(0);
        this._skip=false;
        this._part=1; // 1 veya 2

        // ── PART 1 METNİ ──
        const lines1=[
            {t:L("lore1_1"), s:"15px", c:"#bbbbbb"},
            {t:L("lore1_2"), s:"18px", c:"#dddddd"},
            {t:L("lore1_3"), s:"15px", c:"#cccccc"},
            {t:L("lore1_4"), s:"14px", c:"#cccccc"},
            {t:L("lore1_5"), s:"16px", c:"#eeeeee"},
            {t:L("lore1_6"), s:"17px", c:"#ffaa44",bold:true},
            {t:L("lore1_7"), s:"15px", c:"#cccccc"},
            {t:L("lore1_8"), s:"19px", c:"#ffcc00",bold:true},
        ];

        // ── PART 2 METNİ ──
        const lines2=[
            {t:L("lore2_1"), s:"15px", c:"#bbbbbb"},
            {t:L("lore2_2"), s:"15px", c:"#cccccc"},
            {t:L("lore2_3"), s:"15px", c:"#cccccc"},
            {t:L("lore2_4"), s:"15px", c:"#bbbbbb"},
            {t:L("lore2_5"), s:"16px", c:"#ff6644",bold:true},
            {t:L("lore2_6"), s:"16px", c:"#ff8833",bold:true},
            {t:L("lore2_7"), s:"17px", c:"#ff4444",bold:true},
            {t:L("lore2_8"), s:"15px", c:"#cccccc"},
            {t:L("lore2_9"), s:"19px", c:"#ffaa44",bold:true},
            {t:L("lore2_10"),s:"16px", c:"#ffcc00",bold:true},
        ];

        this._loreObjs=[];
        this._runLines(lines1,W,H,()=>{
            if(!this._skip) this._showLoreContinue(1);
        });

        // Skip yazısı
        const sk=this.add.text(W-8,H-10,L("loreSkip"),{font:"bold 10px 'Courier New'",color:"#333333"})
            .setOrigin(1,1).setInteractive().setDepth(5);
        sk.on("pointerover",()=>sk.setColor("#887766"));
        sk.on("pointerout",()=>sk.setColor("#333333"));
        sk.on("pointerdown",()=>this._skipAll());

        this._lines2=lines2;
    }

    _runLines(lines,W,H,onDone){
        // Mevcut lore objelerini temizle
        this._loreObjs.forEach(o=>{try{o.destroy();}catch(e){}});
        this._loreObjs=[];

        let delay=500;
        lines.forEach((line,i)=>{
            const yp=90+i*52;
            const fnt=(line.bold?"bold ":"")+line.s+" 'Courier New'";
            const tx=this.add.text(W/2,yp,"",{
                font:fnt,color:line.c,stroke:"#000000",strokeThickness:4,align:"center",
                wordWrap:{width:320}
            }).setOrigin(0.5).setAlpha(0).setDepth(1);
            this._loreObjs.push(tx);

            this.time.delayedCall(delay,()=>{
                if(this._skip) return;
                tx.setAlpha(1);
                let ci=0;
                const iv=this.time.addEvent({delay:32,loop:true,callback:()=>{
                    if(this._skip){iv.remove();return;}
                    ci++; tx.setText(line.t.substring(0,ci));
                    if(ci>=line.t.length) iv.remove();
                }});
            });
            delay+=line.t.length*32+380;
        });

        this.time.delayedCall(delay+400,()=>{
            if(!this._skip && onDone) onDone();
        });
    }

    _showLoreContinue(part){
        const W=360,H=640;
        this._cGroup=[];

        // Part göstergesi — sabit, en alta
        const partBg=this.add.graphics().setDepth(3);
        partBg.fillStyle(0x000000,0.7); 
        this._cGroup.push(partBg);
        

        const div=this.add.graphics().setDepth(3);
        div.lineStyle(1,0x444444,0.5); div.lineBetween(40,H-78,320,H-78);
        this._cGroup.push(div);

        const label=part===1?L("loreContinue"):L("loreEnter");
        const ct=this.add.text(W/2,H-55,label,{
            font:"bold 16px 'Courier New'",color:"#ff4444",
            stroke:"#000",strokeThickness:4,letterSpacing:2
        }).setOrigin(0.5).setAlpha(0).setDepth(4);
        this._cGroup.push(ct);
        this.tweens.add({targets:ct,alpha:1,duration:400});
        this.tweens.add({targets:ct,alpha:0.45,duration:600,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

        const ha=this.add.rectangle(W/2,H-72,220,34,0xffffff,0.001).setInteractive().setDepth(4);
        this._cGroup.push(ha);

        const onContinue=()=>{
            this._clearCGroup();
            if(part===1){
                // Part 2'ye geç
                this._runLines(this._lines2,W,H,()=>{
                    if(!this._skip) this._showLoreContinue(2);
                });
            } else {
                // Başlık ekranına geç
                this._goTitle();
            }
        };

        ha.on("pointerdown",onContinue);
        this.input.keyboard.once("keydown-SPACE",onContinue);
        this.input.keyboard.once("keydown-ENTER",onContinue);
    }

    _clearCGroup(){
        if(this._cGroup){
            this._cGroup.forEach(o=>{try{o.destroy();}catch(e){}});
            this._cGroup=[];
        }
    }

    _skipAll(){
        if(this._skip) return;
        this._skip=true;
        this._loreObjs.forEach(o=>{try{o.destroy();}catch(e){}});
        this._clearCGroup();
        this._buildTitle(true);
    }

    _goTitle(){
        if(this._skip) return;
        this._skip=true;
        this._loreObjs.forEach(o=>this.tweens.add({targets:o,alpha:0,duration:180}));
        this._clearCGroup();
        this.time.delayedCall(200,()=>this._buildTitle(false));
    }

    _buildTitle(instant){
        const W=360,H=640;
        // [UI POLISH - CİNEMATİK GİRİŞ] NOT TODAY büyük başlık — güçlü sinematik animasyon
        const titleStyle={
            font:"bold 32px 'Press Start 2P'",
            color:"#ffcc00",
            stroke:"#000000",
            strokeThickness:10,
            letterSpacing:4,
        };
        const big=this.add.text(W/2,H/2-60,"",titleStyle).setOrigin(0.5).setAlpha(0).setDepth(3);
        const sub=this.add.text(W/2,H/2+18,"",{
            font:"bold 12px 'Press Start 2P'",color:"#cc8800",
            stroke:"#000",strokeThickness:4,letterSpacing:6
        }).setOrigin(0.5).setAlpha(0).setDepth(3);
        const tag=this.add.text(W/2,H/2+44,L("loreTagline"),{
            font:"8px 'Press Start 2P'",color:"#886644",letterSpacing:1,
            wordWrap:{width:300},align:"center"
        }).setOrigin(0.5).setAlpha(0).setDepth(3);

        // [CİNEMATİK] Dekoratif çizgiler
        const lineG=this.add.graphics().setDepth(3);

        // [CİNEMATİK] Geniş çift glow halkası — başlık arkasında
        const glowCircle=this.add.graphics().setDepth(2);
        glowCircle.fillStyle(0xffcc00,0.06); glowCircle.fillCircle(W/2,H/2-50,130);
        glowCircle.fillStyle(0xff8800,0.03); glowCircle.fillCircle(W/2,H/2-50,180);
        glowCircle.setAlpha(0);

        // [CİNEMATİK] Yatay ışın çizgileri — ekran genişliğinde
        const beamG=this.add.graphics().setDepth(2).setAlpha(0);

        const allTitle=[big,sub,tag,lineG,glowCircle,beamG];
        const full="NOT TODAY";

        const afterAnim=()=>{
            // Glow circle fade-in + sürekli nabız
            this.tweens.add({targets:glowCircle,alpha:1,duration:500});
            this.tweens.add({targets:glowCircle,scaleX:1.2,scaleY:1.2,alpha:0.7,
                duration:2200,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

            // [CİNEMATİK] Yatay ışın çizgisi — sağdan sola süpürür
            beamG.fillStyle(0xffaa00,0.12); beamG.fillRect(0,H/2-68,W,14);
            beamG.fillStyle(0xffffff,0.06); beamG.fillRect(0,H/2-65,W,8);
            this.tweens.add({targets:beamG,alpha:1,duration:220,ease:"Quad.easeOut"});
            this.tweens.add({targets:beamG,alpha:0.5,scaleX:1.06,duration:1600,
                yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

            // Alt çizgiler
            this.time.delayedCall(60,()=>{
                lineG.lineStyle(1.5,0x885500,0.6);
                lineG.lineBetween(W/2-110,H/2-6,W/2+110,H/2-6);
                lineG.lineStyle(1,0x885500,0.3);
                lineG.lineBetween(W/2-70,H/2+36,W/2+70,H/2+36);
            });

            this.tweens.add({targets:sub,alpha:1,y:H/2+18,duration:320,ease:"Back.easeOut"});
            this.time.delayedCall(320,()=>{
                this.tweens.add({targets:tag,alpha:1,duration:400});
                this.tweens.add({targets:lineG,alpha:1,duration:400});
                this.time.delayedCall(500,()=>this._showTitleContinue(allTitle));
            });
        };

        if(instant){
            big.setText(full).setAlpha(1);
            sub.setAlpha(1); tag.setAlpha(1); lineG.setAlpha(1); glowCircle.setAlpha(0.8); beamG.setAlpha(0.5);
            this.time.delayedCall(400,()=>this._showTitleContinue(allTitle));
            return;
        }

        // [CİNEMATİK] Ekranı önce karartan flaş
        const introFlash=this.add.rectangle(W/2,H/2,W,H,0xffffff,0).setDepth(10);
        this.tweens.add({targets:introFlash,fillAlpha:0.18,duration:80,yoyo:true,
            onComplete:()=>introFlash.destroy()});

        // [CİNEMATİK] Başlık önce çok küçük + yukarıdan hızla iner → scale punch
        big.setY(H/2-120).setScale(0.3).setAlpha(0);
        this.tweens.add({targets:big,
            y:H/2-60,alpha:1,scaleX:1.15,scaleY:1.15,
            duration:280,ease:"Back.easeOut",
            onComplete:()=>{
                this.tweens.add({targets:big,scaleX:1,scaleY:1,duration:120,ease:"Quad.easeOut"});
            }
        });

        // [CİNEMATİK] Typewriter efekti + her harf flash
        let ci=0;
        const iv=this.time.addEvent({delay:60,loop:true,callback:()=>{
            ci++; big.setText(full.substring(0,ci));
            if(ci<full.length){
                big.setAlpha(0.75+Math.random()*0.25);
                // Her harfte küçük scale punch
                big.setScale(1.0+Math.random()*0.04);
            }
            if(ci>=full.length){
                iv.remove();
                big.setAlpha(1).setScale(1);
                // [CİNEMATİK] Final glow burst
                const burst=this.add.graphics().setDepth(4);
                burst.fillStyle(0xffcc00,0.25); burst.fillCircle(W/2,H/2-60,80);
                this.tweens.add({targets:burst,scaleX:3,scaleY:3,alpha:0,duration:400,
                    ease:"Quad.easeOut",onComplete:()=>burst.destroy()});
                // 4 köşe kıvılcım
                [[W/2-80,H/2-90],[W/2+80,H/2-90],[W/2-80,H/2-30],[W/2+80,H/2-30]].forEach(([cx,cy])=>{
                    const sp=this.add.graphics().setDepth(4);
                    sp.fillStyle(0xffcc00,0.9); sp.fillRect(-2,-2,4,4);
                    sp.x=cx; sp.y=cy;
                    const ang=Math.atan2(cy-(H/2-60),cx-(W/2));
                    this.tweens.add({targets:sp,
                        x:cx+Math.cos(ang)*30,y:cy+Math.sin(ang)*30,
                        alpha:0,scaleX:0.1,scaleY:0.1,duration:300,
                        ease:"Quad.easeOut",onComplete:()=>sp.destroy()});
                });
                // Sürekli nabız
                this.tweens.add({targets:big,alpha:0.72,duration:1200,yoyo:true,
                    repeat:-1,ease:"Sine.easeInOut"});
                afterAnim();
            }
        }});
    }

    _showTitleContinue(objs){
        const W=360,H=640;
        const ct=this.add.text(W/2,H/2+88,L("continueBtn"),{
            font:"bold 14px 'Courier New'",color:"#ff4444",
            stroke:"#000",strokeThickness:3
        }).setOrigin(0.5).setAlpha(0).setDepth(4);
        this.tweens.add({targets:ct,alpha:1,duration:280});
        this.tweens.add({targets:ct,alpha:0.45,duration:500,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

        const go=()=>{
            [...objs,ct].forEach(o=>this.tweens.add({targets:o,alpha:0,duration:220}));
            this.cameras.main.fade(500,0,0,0,false,(c,p)=>{if(p>=1)this.scene.start("SceneMenu");});
        };
        this.add.rectangle(W/2,H/2+88,200,32,0xffffff,0.001).setInteractive().setDepth(5)
            .on("pointerdown",go);
        this.input.keyboard.once("keydown-SPACE",go);
        this.input.keyboard.once("keydown-ENTER",go);
    }
}
// ═══════════════════════════════════════════════════════════════
// PART B: SceneMenu  —  Ana Menü, Harita Seçim, Mağaza,
//          Koleksiyon, Unlocks, Ayarlar, Kredi
// ═══════════════════════════════════════════════════════════════

class SceneMenu extends Phaser.Scene {
    constructor(){ super({key:"SceneMenu"}); }

    preload(){
        this.load.image("bg_day",   "assets/bg_day.png");
        this.load.image("bg_sunset","assets/bg_sunset.png");
        this.load.image("bg_night", "assets/bg_night.png");
        this.load.image("cloud1",   "assets/cloud1.PNG");
        this.load.image("cloud2",   "assets/cloud2.PNG");
        this.load.image("pyramid",  "assets/pyramid.png");
        this.load.image("intro1",   "assets/intro1.png");
        this.load.spritesheet("pyramid_break",  "assets/pyramid_break.png",  {frameWidth:98, frameHeight:84});
        this.load.spritesheet("pyramid_explode","assets/pyramid_explode.png",{frameWidth:145,frameHeight:115});
        this.load.spritesheet("idle","assets/player_idle.png",{frameWidth:32,frameHeight:32});
        this.load.spritesheet("run", "assets/player_run.png", {frameWidth:31,frameHeight:30});
        // ── YENİ PİRAMİT TİPLERİ ──
    }

    create(){
        const W=360,H=640;
        this._openPanel=null;
        this._menuT=0;
        this._btnBusy=false;
        this._panelTimer=null;

        // Scene shutdown — ghost UI önleme
        this.events.once("shutdown", ()=>{
            try{
                this._closePanel();
                this.tweens.killAll();
                this.time.removeAllEvents();
            }catch(e){}
        });

        // Texture'ları menüde de üret — ikonlar için gerekli
        buildTextures(this);

        // Arkaplan
        this.add.image(W/2,H/2,"bg_sunset").setDisplaySize(W,H).setDepth(-5);
        // Bulutlar
        this._clouds=[];
        for(let i=0;i<4;i++){
            const c=this.add.image(Phaser.Math.Between(-50,W+50),Phaser.Math.Between(20,140),i%2?"cloud1":"cloud2");
            c.setScale(Phaser.Math.FloatBetween(0.09,0.20)).setAlpha(Phaser.Math.FloatBetween(0.35,0.6)).setDepth(-2);
            c.vx=-Phaser.Math.FloatBetween(6,15);
            this._clouds.push(c);
        }

        // Kum
        this._sand=[];
        for(let i=0;i<18;i++){
            const sp=this.add.rectangle(Phaser.Math.Between(0,W),Phaser.Math.Between(200,H-80),
                Phaser.Math.Between(4,10),1,0xddbb88,Phaser.Math.FloatBetween(0.04,0.13)).setDepth(-1);
            this._sand.push({obj:sp,vx:-Phaser.Math.FloatBetween(28,85)});
        }

        // Zemin şeridi kaldırıldı — arkaplan görüntüsü yeterli

        this._buildLogo(W,H);
        this._buildTopBar(W);
        this._buildMainBtns(W,H);

        // ── Profesyonel giriş animasyonu
        // Logo yukarıdan aşağı kayar
        if(this._logoG){
            this._logoG.y=-80;
            this.tweens.add({targets:this._logoG,y:0,duration:700,ease:"Back.easeOut",delay:100});
            if(this._glitterG){
                this._glitterG.y=-80;
                this.tweens.add({targets:this._glitterG,y:0,duration:700,ease:"Back.easeOut",delay:100});
            }
        }
        // Zemin parçacık efekti — altın tozlar
        this.time.addEvent({delay:80,repeat:20,callback:()=>{
            const px=Phaser.Math.Between(60,300);
            const pt=this.add.graphics().setDepth(2).setAlpha(0);
            pt.fillStyle(0xffcc00,0.7); pt.fillRect(0,0,Phaser.Math.Between(2,4),Phaser.Math.Between(2,4));
            pt.x=px; pt.y=H-40;
            this.tweens.add({targets:pt,y:pt.y-Phaser.Math.Between(30,80),alpha:0.8,duration:400,
                yoyo:true,onComplete:()=>pt.destroy()});
        }});

        // ── Alt istatistik — LOGO'NUN HEMEN ALTINDA, büyük ve görünür
        const hs=parseInt(localStorage.getItem("nt_highscore")||"0");
        const bk=parseInt(localStorage.getItem("nt_bestkills")||"0");

        // İki büyük istatistik kutusu
        const s1x=W/2-88, s2x=W/2+12, sY=182, sW=86, sH=44;
        const statG=this.add.graphics().setDepth(4);
        // Kupa kutusu
        statG.fillStyle(0x221800,0.9); statG.fillRect(s1x,sY,sW,sH);
        statG.lineStyle(2,0xffcc00,0.8); statG.strokeRect(s1x,sY,sW,sH);
        statG.fillStyle(0xffcc00,0.12); statG.fillRect(s1x,sY,sW,sH);
        // Kuru kutusu
        statG.fillStyle(0x220008,0.9); statG.fillRect(s2x,sY,sW,sH);
        statG.lineStyle(2,0xff4444,0.8); statG.strokeRect(s2x,sY,sW,sH);
        statG.fillStyle(0xff4444,0.12); statG.fillRect(s2x,sY,sW,sH);

        this.add.text(s1x+sW/2,sY+6,"🏆",{font:"12px 'Courier New'"}).setOrigin(0.5,0).setDepth(5);
        this.add.text(s1x+sW/2,sY+22,hs.toLocaleString(),{
            font:"bold 12px 'Courier New'",color:"#ffdd44",stroke:"#000",strokeThickness:3
        }).setOrigin(0.5,0).setDepth(5);

        this.add.text(s2x+sW/2,sY+6,"☠",{font:"13px 'Courier New'",color:"#ff6655"}).setOrigin(0.5,0).setDepth(5);
        this.add.text(s2x+sW/2,sY+22,bk.toLocaleString(),{
            font:"bold 12px 'Courier New'",color:"#ff7766",stroke:"#000",strokeThickness:3
        }).setOrigin(0.5,0).setDepth(5);

        // Fade in
        this.cameras.main.fadeIn(400,0,0,0);
    }

    // ── PIXEL LOGO ───────────────────────────────────────────
    _buildLogo(W,H){
        // "NOT TODAY" büyük, parlayan pixel title
        const g=this.add.graphics().setDepth(5);
        this._logoG=g;
        this._logoT=0;

        const px=(col,row,ox,oy,sz,col2)=>{
            g.fillStyle(col2||0xffcc00,1);
            g.fillRect(ox+col*sz,oy+row*sz,sz-1,sz-1);
        };
        // Piksel harf tanımları (5x7 grid)
        const L_DEFS={
            N:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,1],[2,2],[3,3],[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6]],
            O:[[1,0],[2,0],[3,0],[0,1],[4,1],[0,2],[4,2],[0,3],[4,3],[0,4],[4,4],[0,5],[4,5],[1,6],[2,6],[3,6]],
            T:[[0,0],[1,0],[2,0],[3,0],[4,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6]],
            D:[[0,0],[1,0],[2,0],[0,1],[3,1],[0,2],[4,2],[0,3],[4,3],[0,4],[4,4],[0,5],[3,5],[0,6],[1,6],[2,6]],
            A:[[1,0],[2,0],[3,0],[0,1],[4,1],[0,2],[4,2],[0,3],[1,3],[2,3],[3,3],[4,3],[0,4],[4,4],[0,5],[4,5],[0,6],[4,6]],
            Y:[[0,0],[4,0],[0,1],[4,1],[1,2],[3,2],[2,3],[2,4],[2,5],[2,6]],
            SP:[],
        };
        const drawWord=(word,startX,startY,sz,col2)=>{
            let cx=0;
            for(const ch of word){
                const def=L_DEFS[ch]||L_DEFS.SP;
                def.forEach(([c,r])=>px(c+cx,r,startX,startY,sz,col2));
                cx+=6;
            }
        };
        const sz=7;
        const w1="NOT",w2="TODAY";
        const x1=W/2-(w1.length*6*sz)/2+sz/2;
        const x2=W/2-(w2.length*6*sz)/2+sz/2;
        const y1=62;
        const y2=y1+7*sz+5;
        // Gölge
        drawWord(w1,x1+2,y1+2,sz,0x111111);
        drawWord(w2,x2+2,y2+2,sz,0x111111);
        // Orta renk
        drawWord(w1,x1+1,y1+1,sz,0x885500);
        drawWord(w2,x2+1,y2+1,sz,0x885500);
        // Ana renk
        drawWord(w1,x1,y1,sz,0xffcc00);
        drawWord(w2,x2,y2,sz,0xffcc00);

        // Parıltı overlay — her update'te bazı pikseller parlasın
        this._glitterG=this.add.graphics().setDepth(6);

        // Parlama tweeni — yazının üzerinde
        this.tweens.add({
            targets:g,
            alpha:0.7,
            duration:900,
            yoyo:true,
            repeat:-1,
            ease:"Sine.easeInOut"
        });

        // Sabit beyaz noktalar — yazı pikselleri üzerinde
        this._glitterG.setDepth(7);
        this._glitterSpots=[
            {x:88,y:75},{x:190,y:68},{x:270,y:110},{x:140,y:120},
        ];
        this._glitterT=0;

        // ★ Login Reward kontrolü — menü açılınca
        this.time.delayedCall(600,()=>{
            const loginResult = checkLoginReward();
            if(loginResult) this._showLoginReward(loginResult);
        });
    }

    // ── TOP BAR ──────────────────────────────────────────────
    _buildTopBar(W){
        const g=this.add.graphics().setDepth(4);
        // Altın kutusu — genişletildi
        g.fillStyle(0x000000,0.7); g.fillRect(W/2-90,3,86,26);
        g.lineStyle(2,0xffcc00,0.75); g.strokeRect(W/2-90,3,86,26);
        // Kristal kutusu
        g.fillStyle(0x000000,0.7); g.fillRect(W/2+4,3,86,26);
        g.lineStyle(2,0xaa44ff,0.75); g.strokeRect(W/2+4,3,86,26);

        this._goldDisp=this.add.text(W/2-47,16,"⬡ "+PLAYER_GOLD,{
            font:"bold 10px 'Courier New'",color:"#ffdd44",stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(5);

        this._crystalDisp=this.add.text(W/2+47,16,"💎 "+PLAYER_CRYSTAL,{
            font:"bold 10px 'Courier New'",color:"#cc66ff",stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(5);

        this.add.rectangle(W/2-47,16,86,26,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(6)
            .on("pointerdown",()=>{ this._closePanel(); this._openShop("gold"); });
        this.add.rectangle(W/2+47,16,86,26,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(6)
            .on("pointerdown",()=>{ this._closePanel(); this._openShop("iap"); });

        // Options
        const og=this.add.graphics().setDepth(4);
        const drawO=hov=>{og.clear();og.fillStyle(hov?0x334455:0x111122,1);og.fillRect(W-72,3,68,26);og.lineStyle(1,hov?0x88aacc:0x334455,0.9);og.strokeRect(W-72,3,68,26);};
        drawO(false);
        this.add.text(W-38,16,L("options"),{font:"bold 9px 'Courier New'",color:"#aabbcc",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(5);
        this.add.rectangle(W-38,16,68,26,0xffffff,0.001).setInteractive().setDepth(6)
            .on("pointerover",()=>drawO(true)).on("pointerout",()=>drawO(false))
            .on("pointerdown",()=>this._openSettings());
    }

    // [UI POLISH] Ana butonlar — hover glow, click pulse, micro-scale, shimmer efekti
    _buildMainBtns(W,H){
        const mkBtn=(x,y,w,h,label,fs,c1,c2,cb)=>{
            const g=this.add.graphics().setDepth(3);
            const shimmerG=this.add.graphics().setDepth(4); // shimmer overlay
            const d=hov=>{
                g.clear();
                // [POLISH] Hover: dış glow halkası
                if(hov){
                    g.fillStyle(c2,0.08); g.fillRoundedRect(x-w/2-6,y-h/2-6,w+12,h+12,6);
                    g.lineStyle(2,c2,0.4); g.strokeRoundedRect(x-w/2-4,y-h/2-4,w+8,h+8,5);
                    g.lineStyle(1,c2,0.2); g.strokeRoundedRect(x-w/2-8,y-h/2-8,w+16,h+16,7);
                }
                // Buton gövdesi
                g.fillStyle(hov?c2:c1,1); g.fillRoundedRect(x-w/2,y-h/2,w,h,5);
                // Üst parlaklık şeridi
                g.fillStyle(0xffffff,hov?0.22:0.14); g.fillRoundedRect(x-w/2+2,y-h/2+2,w-4,h/3,{tl:4,tr:4,bl:0,br:0});
                // Alt gölge şeridi
                g.fillStyle(0x000000,0.25); g.fillRoundedRect(x-w/2,y+h/2-4,w,4,{tl:0,tr:0,bl:5,br:5});
                // Kenarlık
                g.lineStyle(hov?2:1.5,hov?c2:0x888888,hov?0.9:0.5); g.strokeRoundedRect(x-w/2,y-h/2,w,h,5);
                g.lineStyle(1,0xffffff,hov?0.18:0.08); g.strokeRoundedRect(x-w/2+2,y-h/2+2,w-4,h-4,4);
            };
            d(false);

            // [POLISH] Shimmer animasyonu — hover'da sağdan sola süpürür
            const doShimmer=()=>{
                shimmerG.clear();
                shimmerG.fillStyle(0xffffff,0.18);
                shimmerG.fillRect(x-w/2,y-h/2,w/3,h);
                this.tweens.add({targets:{v:0},v:1,duration:320,ease:"Quad.easeInOut",
                    onUpdate:(tw)=>{
                        shimmerG.clear();
                        const prog=tw.getValue();
                        const sx=x-w/2+prog*(w+w/3)-w/3;
                        shimmerG.fillStyle(0xffffff,0.14*(1-Math.abs(prog-0.5)*2));
                        shimmerG.fillRect(sx,y-h/2,w/4,h);
                    },
                    onComplete:()=>shimmerG.clear()
                });
            };

            const txt=this.add.text(x,y,label,{
                font:"bold "+fs+"px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:3
            }).setOrigin(0.5).setDepth(6);
            const hit=this.add.rectangle(x,y,w,h,0xffffff,0.001).setInteractive().setDepth(7);

            hit.on("pointerover",()=>{
                d(true);
                txt.setScale(1.04);
                doShimmer();
            });
            hit.on("pointerout",()=>{
                d(false);
                txt.setScale(1);
                shimmerG.clear();
            });
            hit.on("pointerdown",()=>{
                if(this._btnBusy) return;
                this._btnBusy=true;
                this.time.delayedCall(400,()=>{this._btnBusy=false;});
                // [POLISH] Click: scale-down + renk flash + kıvılcım
                g.clear();
                g.fillStyle(0x000000,0.5); g.fillRoundedRect(x-w/2+3,y-h/2+3,w,h,5);
                g.lineStyle(2,c2,0.7); g.strokeRoundedRect(x-w/2,y-h/2,w,h,5);
                txt.setScale(0.94);
                // 4 köşe kıvılcım
                [[x-w/2+8,y-h/2+8],[x+w/2-8,y-h/2+8],[x-w/2+8,y+h/2-8],[x+w/2-8,y+h/2-8]].forEach(([cx,cy],ci)=>{
                    const sp=this.add.graphics().setDepth(8);
                    sp.fillStyle(c2,0.9); sp.fillRect(-2,-2,4,4);
                    sp.x=cx; sp.y=cy;
                    const ang=Math.atan2(cy-y,cx-x);
                    this.tweens.add({targets:sp,
                        x:cx+Math.cos(ang)*14,y:cy+Math.sin(ang)*14,
                        alpha:0,scaleX:0.1,scaleY:0.1,duration:200,
                        onComplete:()=>sp.destroy()});
                });
                this.time.delayedCall(80,()=>{d(false);txt.setScale(1);cb();});
            });
        };

        // BAŞLA
        mkBtn(W/2,H-238,220,54,"▶ "+L("start"),21,0xaa8800,0xffcc00,()=>{
            /* flash removed */
            this.time.delayedCall(100,()=>this._openMapSelect());
        });
        // MAĞAZA
        mkBtn(W/2,H-172,220,40,L("shop"),16,0x550077,0xaa44ff,()=>this._openShop());
        // [UI YENİ] Koleksiyon & Günlük Görevler & Unlocks — üç satır
        mkBtn(W/2-84,H-122,148,32,L("collection"),11,0x003366,0x2266cc,()=>this._openCollection());
        mkBtn(W/2+84,H-122,148,32,L("unlocks"),   11,0x003322,0x226644,()=>this._openUnlocks());
        // [UI YENİ] Günlük Görevler butonu — altın renkli, dikkat çekici
        mkBtn(W/2,H-80,220,34,L("dailyQuests"),13,0x442200,0xff8800,()=>this._openDailyQuests());
        // Başarımlar + Krediler + Leaderboard
        mkBtn(W/2-60,H-36,110,24,CURRENT_LANG==="ru"?"🏆 ДОСТИЖЕНИЯ":CURRENT_LANG==="en"?"🏆 ACHIEVEMENTS":"🏆 BAŞARIMLAR",9,0x332200,0xffaa00,()=>this._openAchievements());
        mkBtn(W/2+60,H-36,110,24,L("credits"),    9,0x222222,0x444444,()=>this._openCredits());
        // Leaderboard butonu — tam altlarına
        mkBtn(W/2,H-8,220,22,L("leaderboard"),8,0x332200,0xffcc00,()=>this._openLeaderboard());
    }

    // ── HARITA SEÇİM ─────────────────────────────────────────
    _openMapSelect(){
        this._closePanel();
        const W=360,H=640,S=this;
        const objs=[];
        const addO=o=>{objs.push(o);return o;};

        // Karartma — fade ile
        const ov=addO(this.add.rectangle(W/2,H/2,W,H,0x000000,0).setInteractive().setDepth(10)); // input blocker
        this.tweens.add({targets:ov,fillAlpha:0.92,duration:300});

        // Panel
        const pg=addO(this.add.graphics().setDepth(11).setAlpha(0));
        pg.fillStyle(0x04000a,0.98); pg.fillRect(0,0,W,H);
        pg.lineStyle(2,0xffcc00,0.8); pg.strokeRect(8,8,W-16,H-16);
        pg.lineStyle(1,0x554400,0.3); pg.strokeRect(12,12,W-24,H-24);
        this.tweens.add({targets:pg,alpha:1,duration:350,delay:100});

        // Başlık — yukarıdan kayar
        const titleObj=addO(this.add.text(W/2,-40,L("mapsTitle"),{
            font:"bold 20px 'Courier New'",color:"#ffcc00",
            stroke:"#000",strokeThickness:5,letterSpacing:4
        }).setOrigin(0.5,0).setDepth(12));
        this.tweens.add({targets:titleObj,y:18,duration:500,ease:"Back.easeOut",delay:200});

        // Dekoratif çizgi
        const lineG=addO(this.add.graphics().setDepth(12).setAlpha(0));
        lineG.lineStyle(1,0x665500,0.5); lineG.lineBetween(20,48,W-20,48);
        this.tweens.add({targets:lineG,alpha:1,duration:300,delay:400});

        // Haritalar
        const maps=[
            {
                nk:"map1Name",dk:"map1Desc",locked:false,
                accentColor:0xff8800, glowColor:0xffcc44,
                bgColor:0x1a0800,
                icon:"🏜️", difficulty:"★★☆",
                diffColor:"#ffaa44"
            },
            {nk:"map2Name",dk:"map2Desc",locked:true,accentColor:0x4466ff,glowColor:0x88aaff,bgColor:0x000820,icon:"🌑",difficulty:"★★★",diffColor:"#8888ff"},
            {nk:"map3Name",dk:"map3Desc",locked:true,accentColor:0xff3366,glowColor:0xff88aa,bgColor:0x150006,icon:"⚔️",difficulty:"★★★",diffColor:"#ff6688"}
        ];

        maps.forEach((map,mi)=>{
            const cY=58+mi*185;
            const cH=178;
            const delay=300+mi*120;

            // Kart — sağdan kayarak girer
            const cG=addO(this.add.graphics().setDepth(12).setAlpha(0));
            cG.x=60;
            this.tweens.add({targets:cG,alpha:1,x:0,duration:400,ease:"Back.easeOut",delay});

            const drawCard=(hov)=>{
                cG.clear();
                // Ana kart
                cG.fillStyle(map.bgColor,1); cG.fillRect(14,cY,332,cH);
                // Hover efekti
                if(hov&&!map.locked){
                    cG.fillStyle(map.accentColor,0.15); cG.fillRect(14,cY,332,cH);
                    cG.lineStyle(3,map.glowColor,1); cG.strokeRect(14,cY,332,cH);
                } else {
                    cG.lineStyle(2,map.locked?0x222233:map.accentColor,map.locked?0.4:0.85);
                    cG.strokeRect(14,cY,332,cH);
                }
                // Üst şerit
                cG.fillStyle(map.locked?0x111122:map.accentColor,0.25); cG.fillRect(14,cY,332,28);
                // Köşe aksan
                if(!map.locked){
                    cG.fillStyle(map.accentColor,0.6);
                    cG.fillRect(14,cY,4,cH); // sol kenar bar
                }
            };
            drawCard(false);

            // Harita önizleme alanı
            const prevX=18,prevY=cY+6,prevW=126,prevH=cH-16;
            if(!map.locked){
                // intro1 asset — kalite kaybı olmadan en iyi fit
                const _imgKey = mi===0 ? (this.textures.exists("intro1")?"intro1":"bg_day") : "bg_day";
                const prevImg=addO(this.add.image(prevX+prevW/2,prevY+prevH/2,_imgKey).setDepth(13).setAlpha(0));
                prevImg.x+=60;
                // FILL: alanı tamamen kapla, taşan kısım crop ile kesilir
                const scX=prevW/prevImg.width, scY=prevH/prevImg.height;
                const sc2=Math.max(scX,scY);
                prevImg.setScale(sc2);
                // Merkez crop — kalite %100 korunur
                const cropW=prevW/sc2, cropH=prevH/sc2;
                const cropX=(prevImg.width-cropW)/2, cropY=(prevImg.height-cropH)/2;
                prevImg.setCrop(Math.max(0,cropX), Math.max(0,cropY), cropW, cropH);
                this.tweens.add({targets:prevImg,alpha:1,x:prevX+prevW/2,duration:350,ease:"Quad.easeOut",delay:delay+80});

                // Önizleme kenarlığı
                const bordG=addO(this.add.graphics().setDepth(14).setAlpha(0));
                bordG.lineStyle(2,map.accentColor,0.9); bordG.strokeRect(prevX,prevY,prevW,prevH);
                // Köşe süsleri
                bordG.lineStyle(2,map.glowColor,1);
                bordG.lineBetween(prevX,prevY,prevX+12,prevY); bordG.lineBetween(prevX,prevY,prevX,prevY+12);
                bordG.lineBetween(prevX+prevW,prevY,prevX+prevW-12,prevY); bordG.lineBetween(prevX+prevW,prevY,prevX+prevW,prevY+12);
                bordG.lineBetween(prevX,prevY+prevH,prevX+12,prevY+prevH); bordG.lineBetween(prevX,prevY+prevH,prevX,prevY+prevH-12);
                this.tweens.add({targets:bordG,alpha:1,duration:300,delay:delay+150});

                // Piramit partikülleri kaldırıldı

            } else {
                // Kilitli harita — karanlık önizleme + kilit
                const lockG=addO(this.add.graphics().setDepth(13).setAlpha(0));
                lockG.fillStyle(0x080818,0.95); lockG.fillRect(prevX,prevY,prevW,prevH);
                lockG.lineStyle(1,0x333355,0.6); lockG.strokeRect(prevX,prevY,prevW,prevH);
                // Kilit simgesi
                lockG.fillStyle(0x444466,1); lockG.fillRect(prevX+prevW/2-12,prevY+prevH/2-20,24,18);
                lockG.fillStyle(0x333355,1); lockG.fillRect(prevX+prevW/2-15,prevY+prevH/2-2,30,20);
                lockG.lineStyle(2,0x555588,0.8); lockG.strokeRect(prevX+prevW/2-15,prevY+prevH/2-2,30,20);
                this.tweens.add({targets:lockG,alpha:1,duration:300,delay});
            }

            // Sağ panel — harita bilgileri
            const infoX=prevX+prevW+12;
            const infoW=W-infoX-14;

            // Harita adı
            const nameT=addO(this.add.text(infoX,cY+10,L(map.nk),{
                font:"bold 15px 'Courier New'",
                color:map.locked?"#445566":"#ffffff",
                stroke:"#000000",strokeThickness:3
            }).setDepth(14).setAlpha(0));
            this.tweens.add({targets:nameT,alpha:1,duration:300,delay:delay+100});

            // Zorluk
            const diffT=addO(this.add.text(infoX,cY+30,map.difficulty+"  "+map.icon,{
                font:"11px 'Courier New'",
                color:map.locked?"#334455":map.diffColor,
                stroke:"#000",strokeThickness:2
            }).setDepth(14).setAlpha(0));
            this.tweens.add({targets:diffT,alpha:1,duration:300,delay:delay+150});

            // Açıklama
            const descT=addO(this.add.text(infoX,cY+50,L(map.dk),{
                font:"bold 10px 'Courier New'",
                color:map.locked?"#445566":"#ddddee",
                stroke:"#000000",strokeThickness:3,
                wordWrap:{width:infoW}
            }).setDepth(14).setAlpha(0));
            this.tweens.add({targets:descT,alpha:1,duration:300,delay:delay+180});

            if(map.locked){
                // Kilit yazısı
                const lockT=addO(this.add.text(infoX+infoW/2,cY+cH/2,L("comingSoon"),{
                    font:"bold 11px 'Courier New'",color:"#445577",stroke:"#000",strokeThickness:2
                }).setOrigin(0.5).setDepth(14).setAlpha(0));
                this.tweens.add({targets:lockT,alpha:1,duration:300,delay});
            } else {
                // BAŞLA butonu — animasyonlu
                const bX=infoX,bY=cY+cH-38,bW=infoW,bH=32;
                const bG=addO(this.add.graphics().setDepth(13).setAlpha(0));
                const drawBtn=(hov)=>{
                    bG.clear();
                    bG.fillStyle(hov?map.glowColor:map.accentColor,1);
                    bG.fillRect(bX,bY,bW,bH);
                    bG.fillStyle(0xffffff,hov?0.2:0.1); bG.fillRect(bX,bY,bW,4);
                    bG.lineStyle(2,map.glowColor,1); bG.strokeRect(bX,bY,bW,bH);
                };
                drawBtn(false);
                this.tweens.add({targets:bG,alpha:1,duration:300,delay:delay+250});

                const bT=addO(this.add.text(bX+bW/2,bY+bH/2,"▶  "+L("start"),{
                    font:"bold 13px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:3
                }).setOrigin(0.5).setDepth(15).setAlpha(0));
                this.tweens.add({targets:bT,alpha:1,duration:300,delay:delay+280});

                const bHit=addO(this.add.rectangle(bX+bW/2,bY+bH/2,bW,bH,0xffffff,0.001).setInteractive().setDepth(16));
                bHit.on("pointerover",()=>{drawBtn(true);bT.setColor("#000000");});
                bHit.on("pointerout",()=>{drawBtn(false);bT.setColor("#ffffff");});
                bHit.on("pointerdown",()=>{
                    // Başlamadan önce harika geçiş animasyonu
                    /* flash removed */
                    this.cameras.main.shake(60,0.005);
                    // Beyaz parlama sonra fade
                    const wb=this.add.rectangle(W/2,H/2,W,H,0xffffff,0).setDepth(500);
                    this.tweens.add({targets:wb,fillAlpha:1,duration:200,delay:80,onComplete:()=>{
                        objs.flat(4).forEach(o=>{try{o.destroy();}catch(e){}});
                        this._openPanel=null;
                        this.scene.start("SceneGame");
                    }});
                });

                // Hover sırasında kart parlasın
                bHit.on("pointerover",()=>drawCard(true));
                bHit.on("pointerout",()=>drawCard(false));
            }
        });

        // Kapat
        const closeBtn=addO(this.add.graphics().setDepth(12).setAlpha(0));
        const drawClose=(hov)=>{closeBtn.clear();closeBtn.fillStyle(hov?0x661111:0x330000,0.9);closeBtn.fillRect(W/2-60,H-30,120,22);closeBtn.lineStyle(1,hov?0xff4444:0xaa2222,0.9);closeBtn.strokeRect(W/2-60,H-30,120,22);};
        drawClose(false);
        this.tweens.add({targets:closeBtn,alpha:1,duration:300,delay:500});
        const closeTxt=addO(this.add.text(W/2,H-19,"✕  "+L("close"),{font:"bold 11px 'Courier New'",color:"#ff6666",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(13).setAlpha(0));
        this.tweens.add({targets:closeTxt,alpha:1,duration:300,delay:520});
        const closeH=addO(this.add.rectangle(W/2,H-19,120,22,0xffffff,0.001).setInteractive().setDepth(14));
        closeH.on("pointerover",()=>drawClose(true)).on("pointerout",()=>drawClose(false));
        closeH.on("pointerdown",()=>{objs.flat(4).forEach(o=>{try{o.destroy();}catch(e){}});this._openPanel=null;});

        this._openPanel=objs;
    }

    // ── MAĞAZA ───────────────────────────────────────────────
    _openShop(initialTab){
        this._closePanel();
        const W=360,H=640;
        const objs=[];
        // [UI POLISH] Overlay: siyah düz yerine mor gradient efekti
        const ov=this.add.rectangle(W/2,H/2,W,H,0x000000,0).setInteractive().setDepth(10); objs.push(ov); // input blocker
        this.tweens.add({targets:ov,fillAlpha:0.76,duration:280});
        const ov2=this.add.rectangle(W/2,H/2,W,H,0x110022,0).setDepth(10); objs.push(ov2);
        this.tweens.add({targets:ov2,fillAlpha:0.32,duration:300});
        const pg=this.add.graphics().setDepth(11);
        // [UI POLISH P4] Mağaza paneli slide-in animasyonu
        pg.fillStyle(0x08000e,0.98); pg.fillRect(8,8,344,624);
        pg.lineStyle(2,0xaa44ff,0.9); pg.strokeRect(8,8,344,624);
        pg.lineStyle(1,0x441166,0.25); pg.strokeRect(12,12,336,616);
        pg.fillStyle(0xaa44ff,0.06); pg.fillRect(8,8,344,36);
        objs.push(pg);
        // Panel başlık yukarıdan kayar
        const shopTitle=this.add.text(W/2,-20,L("shop"),{font:"bold 17px 'Courier New'",color:"#aa44ff",stroke:"#000",strokeThickness:5,letterSpacing:3}).setOrigin(0.5).setDepth(12);
        this.tweens.add({targets:shopTitle,y:28,duration:380,ease:"Back.easeOut",delay:80});
        objs.push(shopTitle);

        this._shopGold=this.add.text(W/2,48,"💰 "+PLAYER_GOLD,{font:"bold 12px 'Courier New'",color:"#ffdd44",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(12);
        objs.push(this._shopGold);

        // Tab sistemi — yatay kaydırılabilir
        const shopTabs=[
            {k:"upgrades", l:L("shopUpgrades"),          c:0x4488ff},
            {k:"gold",     l:(CURRENT_LANG==="ru"?"💰 КУПИТЬ ЗОЛОТО":CURRENT_LANG==="en"?"💰 BUY GOLD":"💰 ALTIN AL"),c:0xffcc00},
            {k:"iap",      l:(CURRENT_LANG==="ru"?"💎 ГЕМЫ":CURRENT_LANG==="en"?"💎 GEMS":"💎 ELMAS"),c:0xcc44ff},
            {k:"charSkins",l:L("shopCharSkins"),          c:0xff8844},
            {k:"weapSkins",l:L("shopWeaponSkins"),        c:0x44ff88},
        ];
        let activeTab=initialTab||"upgrades";
        const tabG=[],contObjs=[];
        // [FIX] Tab genişliği dinamik — 5 tab ekrana sığsın
        const PANEL_W=344; // 8'den 352'ye kadar
        const TAB_W=Math.floor(PANEL_W/shopTabs.length); // her tab eşit genişlik
        const TABS_START=8;
        let tabScrollX=0;
        const tabMaxScroll=0; // Tüm tablar sığıyor — scroll gerekmez

        const drawTabs=()=>{
            tabG.forEach(o=>{try{o.destroy();}catch(e){}});tabG.length=0;
            shopTabs.forEach((tab,i)=>{
                const rawX=TABS_START+i*TAB_W-tabScrollX;
                if(rawX+TAB_W<8||rawX>352) return; // görünmüyorsa çizme
                const ty=62;
                const tg=this.add.graphics().setDepth(13);
                const ia=activeTab===tab.k;
                tg.fillStyle(ia?tab.c:0x1a1a2e,ia?0.35:0.85); tg.fillRoundedRect(rawX,ty,TAB_W-2,24,4);
                tg.lineStyle(ia?2:1,ia?tab.c:0x333355,ia?0.9:0.5); tg.strokeRoundedRect(rawX,ty,TAB_W-2,24,4);
                if(ia){tg.fillStyle(tab.c,0.12);tg.fillRoundedRect(rawX,ty,TAB_W-2,8,{tl:4,tr:4,bl:0,br:0});}
                tabG.push(tg);
                // [FIX] font 8px + maxWidth ile taşmayı önle
                const tt=this.add.text(rawX+(TAB_W-2)/2,ty+12,tab.l,{
                    font:"bold 8px 'Courier New'",color:ia?"#ffffff":"#667788",
                    stroke:"#000",strokeThickness:2,
                    fixedWidth:TAB_W-6,align:"center"
                }).setOrigin(0.5).setDepth(14);
                tabG.push(tt);
                const th=this.add.rectangle(rawX+(TAB_W-2)/2,ty+12,TAB_W-2,24,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(15);
                tabG.push(th);
                th.on("pointerdown",()=>{activeTab=tab.k;drawTabs();renderCont();});
            });
        };
        // Tab satırını sürükle
        const tabDragZone=this.add.rectangle(W/2,74,W,28,0xffffff,0.001).setInteractive({draggable:true}).setDepth(14);
        objs.push(tabDragZone);
        let _tdStart=0,_tdScroll=0;
        tabDragZone.on("dragstart",(p)=>{_tdStart=p.x;_tdScroll=tabScrollX;});
        tabDragZone.on("drag",(p)=>{tabScrollX=Phaser.Math.Clamp(_tdScroll-( p.x-_tdStart),0,tabMaxScroll);drawTabs();});

        const renderCont=()=>{
            contObjs.forEach(o=>{try{o.destroy();}catch(e){}});contObjs.length=0;
            if(activeTab==="upgrades"){
                this._renderShopUpgrades(contObjs);
            } else if(activeTab==="gold"){
                this._renderGoldShop(contObjs);
            } else if(activeTab==="iap"){
                this._renderIAPContent(contObjs);
            } else {
                const cg=this.add.graphics().setDepth(12);
                cg.fillStyle(0x0a0a18,0.7); cg.fillRect(14,88,332,502);
                cg.lineStyle(1,0x222233,0.5); cg.strokeRect(14,88,332,502);
                contObjs.push(cg);
                contObjs.push(this.add.text(W/2,340,L("cosmingSoonLabel"),{
                    font:"bold 13px 'Courier New'",color:"#444455",align:"center",lineSpacing:8
                }).setOrigin(0.5).setDepth(13));
                // Placeholder kartlar
                const cosItems=[{icon:"👤",name:"Çöl Savaşçısı",cost:3000},{icon:"✨",name:"Premium",cost:6000},{icon:"🌟",name:"Efsane",cost:12000}];
                cosItems.forEach((it,i)=>{
                    const ix=18+i*110,iy=100;
                    const gg=this.add.graphics().setDepth(13);
                    gg.fillStyle(0x1a1a2e,0.9); gg.fillRect(ix,iy,104,150);
                    gg.lineStyle(1,0x333355,0.6); gg.strokeRect(ix,iy,104,150);
                    gg.fillStyle(0x111122,0.7); gg.fillRect(ix,iy,104,150);
                    contObjs.push(gg);
                    contObjs.push(this.add.text(ix+52,iy+50,it.icon,{font:"28px 'Courier New'"}).setOrigin(0.5).setDepth(14));
                    contObjs.push(this.add.text(ix+52,iy+90,it.name,{font:"bold 10px 'Courier New'",color:"#666677",wordWrap:{width:96},align:"center"}).setOrigin(0.5).setDepth(14));
                    contObjs.push(this.add.text(ix+52,iy+116,"💰"+it.cost,{font:"bold 9px 'Courier New'",color:"#554400"}).setOrigin(0.5).setDepth(14));
                    const lock=this.add.graphics().setDepth(14);
                    lock.fillStyle(0x000000,0.5); lock.fillRect(ix,iy,104,150);
                    contObjs.push(lock);
                    contObjs.push(this.add.text(ix+52,iy+75,"🔒",{font:"20px 'Courier New'"}).setOrigin(0.5).setDepth(15));
                });
            }
        };

        drawTabs(); renderCont();
        objs.push(...tabG);

        const closeFn=()=>{
            // Canlı referansları kullan — snapshot değil
            try{this.input.off("wheel");}catch(e){}
            contObjs.forEach(o=>{try{if(o.removeAllListeners)o.removeAllListeners();if(o.destroy)o.destroy();}catch(e){}});
            tabG.forEach(o=>{try{if(o.removeAllListeners)o.removeAllListeners();if(o.destroy)o.destroy();}catch(e){}});
            objs.forEach(o=>{try{if(o.removeAllListeners)o.removeAllListeners();if(o.destroy)o.destroy();}catch(e){}});
            contObjs.length=0; tabG.length=0;
            this._openPanel=null;
        };
        objs.push(...this._closeBtn(W/2,H-16,null,closeFn));
        // _openPanel live closeFn referansı — gerçek destroy closeFn içinde
        this._openPanel={_isShopPanel:true,_closeFn:closeFn,destroy:closeFn,removeAllListeners:()=>{}};
    }

    _renderShopUpgrades(contObjs){
        const W=360, H=640;
        const sv=JSON.parse(localStorage.getItem("nt_shop")||"{}");
        GOLD_UPGRADES.forEach(u=>{
            u.level=sv[u.id]||0;
            u.cost=Math.round(u.baseCost*Math.pow(2.5,u.level));
        });

        const ITEM_H=66, SCROLL_TOP=88, SCROLL_BTM=H-38;
        const VISIBLE_H=SCROLL_BTM-SCROLL_TOP;
        const visibleItems=GOLD_UPGRADES.filter(u=>u.level<u.maxLevel);
        const TOTAL_H=visibleItems.length*ITEM_H+8;
        let scrollY=0;
        const maxScroll=Math.max(0,TOTAL_H-VISIBLE_H);

        // Clip mask — sadece görünürlük için, input'u etkilemez
        const maskGfx=this.add.graphics().setDepth(-1).setVisible(false);
        maskGfx.fillStyle(0xffffff); maskGfx.fillRect(0,SCROLL_TOP,W,VISIBLE_H);
        const scrollMask=maskGfx.createGeometryMask();
        contObjs.push(maskGfx);

        // Tüm item objeleri direkt sahneye — Container yok (Container + input bug'ı)
        const itemObjs=[];
        const applyMask=(o)=>{o.setMask(scrollMask);return o;};

        const buildItems=()=>{
            itemObjs.forEach(o=>{try{o.clearMask();o.destroy();}catch(e){}});
            itemObjs.length=0;

            visibleItems.forEach((up,row)=>{
                const x=14, w=332, h=58;
                const wy=SCROLL_TOP+row*ITEM_H+4-scrollY; // world Y

                const bg=applyMask(this.add.graphics().setDepth(12));
                bg.fillStyle(0x0a0818,0.95); bg.fillRoundedRect(x,wy,w,h,6);
                bg.lineStyle(1.5,0xaa44ff,0.5); bg.strokeRoundedRect(x,wy,w,h,6);
                bg.fillStyle(0xaa44ff,0.07); bg.fillRoundedRect(x,wy,w,14,{tl:6,tr:6,bl:0,br:0});
                itemObjs.push(bg);

                itemObjs.push(applyMask(this.add.text(x+10,wy+6,up.icon+" "+L(up.nameKey),{font:"bold 12px 'Courier New'",color:"#ffffff",stroke:"#000000",strokeThickness:3,wordWrap:{width:160}}).setDepth(13)));
                itemObjs.push(applyMask(this.add.text(x+10,wy+22,L(up.descKey),{font:"bold 9px 'Courier New'",color:"#99aacc",stroke:"#000",strokeThickness:2,wordWrap:{width:200}}).setDepth(13)));

                for(let lv=0;lv<up.maxLevel;lv++){
                    const pg=applyMask(this.add.graphics().setDepth(13));
                    pg.fillStyle(lv<up.level?0xffcc44:0x222233,1);
                    pg.fillRoundedRect(x+10+lv*16,wy+42,13,6,2);
                    itemObjs.push(pg);
                }

                itemObjs.push(applyMask(this.add.text(x+w-10,wy+6,"Lv"+up.level+"/"+up.maxLevel,{font:"bold 10px 'Courier New'",color:"#bb66ff",stroke:"#000",strokeThickness:2}).setOrigin(1,0).setDepth(13)));
                itemObjs.push(applyMask(this.add.text(x+w-10,wy+22,"💰 "+up.cost,{font:"bold 11px 'Courier New'",color:"#ffdd44",stroke:"#000",strokeThickness:2}).setOrigin(1,0).setDepth(13)));

                // Satın al butonu — direkt sahneye, world koordinatlarında
                const BW=60, BH=18;
                const BX=x+w-BW-8, BY=wy+h-BH-6;
                const bG=applyMask(this.add.graphics().setDepth(13));
                const dB=(hov)=>{bG.clear();bG.fillStyle(hov?0xaa44ff:0x330055,hov?1:0.85);bG.fillRoundedRect(BX,BY,BW,BH,4);bG.lineStyle(1.5,0xaa44ff,0.9);bG.strokeRoundedRect(BX,BY,BW,BH,4);};
                dB(false); itemObjs.push(bG);

                const buyT=applyMask(this.add.text(BX+BW/2,BY+BH/2,L("buy"),{font:"bold 9px 'Courier New'",color:"#ffdd44",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(14));
                itemObjs.push(buyT);

                // Hit area — direkt sahneye, yüksek depth ile container sorunu yok
                const bH=applyMask(this.add.rectangle(BX+BW/2,BY+BH/2,BW,BH,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(20));
                bH.on("pointerover",()=>dB(true)); bH.on("pointerout",()=>dB(false));
                bH.on("pointerdown",()=>{
                    if(PLAYER_GOLD>=up.cost){
                        PLAYER_GOLD-=up.cost; up.level=Math.min(up.maxLevel,up.level+1);
                        up.cost=Math.round(up.cost*2.5);
                        localStorage.setItem("nt_gold",PLAYER_GOLD);
                        const s2={};GOLD_UPGRADES.forEach(u2=>s2[u2.id]=u2.level);
                        localStorage.setItem("nt_shop",JSON.stringify(s2));
                        if(this._shopGold) this._shopGold.setText("💰 "+PLAYER_GOLD);
                        contObjs.forEach(o=>{try{o.destroy();}catch(e){}});
                        contObjs.length=0;
                        this._renderShopUpgrades(contObjs);
                    } else { this.cameras.main.shake(30,0.004); }
                });
                itemObjs.push(bH);
            });

            itemObjs.forEach(o=>contObjs.push(o));
        };

        buildItems();

        // Wheel scroll
        const onWheel=(p,gx,gy,dx,dy)=>{
            scrollY=Phaser.Math.Clamp(scrollY+dy*0.5,0,maxScroll);
            buildItems();
        };
        this.input.on("wheel",onWheel);
        contObjs.push({destroy:()=>this.input.off("wheel",onWheel),clearMask:()=>{}});
    }

    _renderGoldShop(contObjs){
        const W=360, H=640;
        const GOLD_PACKS=[
            {gold:500,   price:"$0.99",  bonus:0,   tag:null,      popular:false},
            {gold:1200,  price:"$1.99",  bonus:100, tag:"popular", popular:true},
            {gold:3000,  price:"$3.99",  bonus:300, tag:null,       popular:false},
            {gold:7000,  price:"$7.99",  bonus:1000,tag:"best",     popular:false},
            {gold:18000, price:"$14.99", bonus:3000,tag:null,       popular:false},
        ];
        const SCROLL_TOP=88, SCROLL_BTM=H-38;
        const CARD_H=80, CARD_GAP=4, START_Y=SCROLL_TOP+4;
        const VISIBLE_H=SCROLL_BTM-SCROLL_TOP;
        const TOTAL_H=GOLD_PACKS.length*(CARD_H+CARD_GAP)+8;
        let scrollY=0;
        const maxScroll=Math.max(0,TOTAL_H-VISIBLE_H);

        const maskGfx=this.add.graphics().setDepth(-1).setVisible(false);
        maskGfx.fillStyle(0xffffff); maskGfx.fillRect(0,SCROLL_TOP,W,VISIBLE_H);
        const scrollMask=maskGfx.createGeometryMask();
        contObjs.push(maskGfx);
        const applyMask=o=>{o.setMask(scrollMask);return o;};
        const itemObjs=[];

        const buildItems=()=>{
            itemObjs.forEach(o=>{try{o.clearMask();o.destroy();}catch(e){}});
            itemObjs.length=0;
            GOLD_PACKS.forEach((pack,i)=>{
                const wy=START_Y+i*(CARD_H+CARD_GAP)-scrollY;
                const CX=12, CW=336;
                const tagCol=pack.tag==="best"?0xffcc00:pack.tag==="popular"?0xff8800:0xffaa33;
                const cardBg=applyMask(this.add.graphics().setDepth(12));
                const drawCard=(hov)=>{
                    cardBg.clear();
                    cardBg.fillStyle(0x0a0800,1); cardBg.fillRoundedRect(CX,wy,CW,CARD_H,8);
                    cardBg.fillStyle(tagCol,hov?1:0.75); cardBg.fillRoundedRect(CX,wy,5,CARD_H,{tl:8,tr:0,bl:8,br:0});
                    cardBg.fillStyle(tagCol,hov?0.15:0.06); cardBg.fillRoundedRect(CX,wy,CW,CARD_H,8);
                    cardBg.fillStyle(0xffffff,hov?0.08:0.03); cardBg.fillRoundedRect(CX,wy,CW,12,{tl:8,tr:8,bl:0,br:0});
                    cardBg.lineStyle(hov?2:1,tagCol,hov?0.9:0.5); cardBg.strokeRoundedRect(CX,wy,CW,CARD_H,8);
                };
                drawCard(false); itemObjs.push(cardBg);
                const iconBg=applyMask(this.add.graphics().setDepth(13));
                iconBg.fillStyle(tagCol,0.2); iconBg.fillCircle(CX+38,wy+CARD_H/2,26);
                iconBg.lineStyle(2,tagCol,0.5); iconBg.strokeCircle(CX+38,wy+CARD_H/2,26);
                iconBg.fillStyle(0xffffff,0.10); iconBg.fillCircle(CX+34,wy+CARD_H/2-7,7);
                itemObjs.push(iconBg);
                itemObjs.push(applyMask(this.add.text(CX+38,wy+CARD_H/2,"⬡",{font:"24px 'Courier New'"}).setOrigin(0.5).setDepth(14)));
                const totalGold=pack.gold+pack.bonus;
                const goldStr=totalGold.toLocaleString();
                itemObjs.push(applyMask(this.add.text(CX+72,wy+10,goldStr,{font:"bold 22px 'Courier New'",color:"#ffcc44",stroke:"#000",strokeThickness:4}).setDepth(14)));
                const goldWord=CURRENT_LANG==="ru"?"ЗОЛОТО":CURRENT_LANG==="en"?"GOLD":"ALTIN";
                itemObjs.push(applyMask(this.add.text(CX+72+goldStr.length*13+4,wy+16,goldWord,{font:"bold 10px 'Courier New'",color:"#cc9933",stroke:"#000",strokeThickness:2}).setDepth(14)));
                if(pack.bonus>0){
                    const bonusBg=applyMask(this.add.graphics().setDepth(14));
                    bonusBg.fillStyle(0x00aa44,0.9); bonusBg.fillRoundedRect(CX+72,wy+36,80,16,4);
                    itemObjs.push(bonusBg);
                    const bStr="+"+pack.bonus.toLocaleString()+" BONUS";
                    itemObjs.push(applyMask(this.add.text(CX+112,wy+44,bStr,{font:"bold 8px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:1}).setOrigin(0.5).setDepth(15)));
                }
                if(pack.tag){
                    const tagStr=pack.tag==="best"?(CURRENT_LANG==="ru"?"⭐ ЛУЧШЕЕ":CURRENT_LANG==="en"?"⭐ BEST":"⭐ EN İYİ"):(CURRENT_LANG==="ru"?"🔥 ПОПУЛЯРНО":CURRENT_LANG==="en"?"🔥 POPULAR":"🔥 POPÜLER");
                    const tagBg=applyMask(this.add.graphics().setDepth(14));
                    tagBg.fillStyle(tagCol,0.95); tagBg.fillRoundedRect(CX+CW-88,wy+8,78,18,5);
                    itemObjs.push(tagBg);
                    itemObjs.push(applyMask(this.add.text(CX+CW-49,wy+17,tagStr,{font:"bold 8px 'Courier New'",color:"#000"}).setOrigin(0.5).setDepth(15)));
                }
                const BW=84,BH=34,BX=CX+CW-BW-8,BY=wy+CARD_H-BH-8;
                const buyBg=applyMask(this.add.graphics().setDepth(13));
                const drawBuy=(hov)=>{
                    buyBg.clear();
                    buyBg.fillStyle(hov?tagCol:0x0d0800,1); buyBg.fillRoundedRect(BX,BY,BW,BH,7);
                    buyBg.fillStyle(0xffffff,hov?0.12:0.05); buyBg.fillRoundedRect(BX,BY,BW,8,{tl:7,tr:7,bl:0,br:0});
                    buyBg.lineStyle(2,tagCol,hov?1:0.7); buyBg.strokeRoundedRect(BX,BY,BW,BH,7);
                };
                drawBuy(false); itemObjs.push(buyBg);
                itemObjs.push(applyMask(this.add.text(BX+BW/2,BY+11,pack.price,{font:"bold 12px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:3}).setOrigin(0.5).setDepth(14)));
                const buyStr=CURRENT_LANG==="ru"?"КУПИТЬ":CURRENT_LANG==="en"?"BUY":"SATIN AL";
                itemObjs.push(applyMask(this.add.text(BX+BW/2,BY+25,buyStr,{font:"bold 8px 'Courier New'",color:"#ffcc44",stroke:"#000",strokeThickness:1}).setOrigin(0.5).setDepth(14)));
                const hitArea=applyMask(this.add.rectangle(CX+CW/2,wy+CARD_H/2,CW,CARD_H,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(16));
                hitArea.on("pointerover",()=>{drawCard(true);drawBuy(true);});
                hitArea.on("pointerout",()=>{drawCard(false);drawBuy(false);});
                hitArea.on("pointerdown",()=>{
                    if(window.Telegram?.WebApp?.openInvoice){
                        window.Telegram.WebApp.openInvoice("gold_"+i,(status)=>{
                            if(status==="paid"){PLAYER_GOLD+=totalGold;localStorage.setItem("nt_gold",PLAYER_GOLD);if(this._shopGold)this._shopGold.setText("💰 "+PLAYER_GOLD);if(this._goldDisp)this._goldDisp.setText("⬡ "+PLAYER_GOLD);}
                        });
                    } else {
                        PLAYER_GOLD+=totalGold;localStorage.setItem("nt_gold",PLAYER_GOLD);
                        if(this._shopGold)this._shopGold.setText("💰 "+PLAYER_GOLD);
                        if(this._goldDisp)this._goldDisp.setText("⬡ "+PLAYER_GOLD);
                        showPurchaseEffect(this,BX+BW/2,BY+BH/2,tagCol,totalGold,"⬡");
                    }
                });
                itemObjs.push(hitArea);
            });
            itemObjs.forEach(o=>contObjs.push(o));
        };
        buildItems();
        const scrollZone=this.add.rectangle(W/2,(SCROLL_TOP+SCROLL_BTM)/2,W,VISIBLE_H,0xffffff,0.001).setInteractive({draggable:true}).setDepth(11);
        contObjs.push(scrollZone);
        scrollZone.on("drag",(p,dx,dy)=>{scrollY=Math.max(0,Math.min(maxScroll,scrollY-dy));buildItems();});
        scrollZone.on("wheel",(p,dx,dy)=>{scrollY=Math.max(0,Math.min(maxScroll,scrollY+dy*0.5));buildItems();});
    }

    _renderIAPContent(contObjs){
        const W=360, H=640;
        const SCROLL_TOP=88;
        const addO=o=>{contObjs.push(o);return o;};

        // Başlık
        addO(this.add.text(W/2,SCROLL_TOP+12,CURRENT_LANG==="ru"?"💎 МАГАЗИН ГЕМОВ":CURRENT_LANG==="en"?"💎 GEM STORE":"💎 ELMAS MAĞAZASI",{font:"bold 14px 'Courier New'",color:"#cc44ff",stroke:"#000",strokeThickness:4,letterSpacing:2}).setOrigin(0.5).setDepth(12));

        // Bakiye
        const gemTxt=addO(this.add.text(20,SCROLL_TOP+32,"💎 "+PLAYER_GEMS,{font:"bold 11px 'Courier New'",color:"#cc44ff",stroke:"#000",strokeThickness:2}).setDepth(12));
        const goldTxt=addO(this.add.text(W-20,SCROLL_TOP+32,"💰 "+PLAYER_GOLD,{font:"bold 11px 'Courier New'",color:"#ffdd44",stroke:"#000",strokeThickness:2}).setOrigin(1,0).setDepth(12));

        // Gem→Altın çevir
        const convBg=addO(this.add.graphics().setDepth(12));
        const drawConv=hov=>{convBg.clear();convBg.fillStyle(hov?0x334400:0x1a2200,1);convBg.fillRoundedRect(W/2-55,SCROLL_TOP+46,110,20,4);convBg.lineStyle(1.5,hov?0xaaff44:0x558822,0.8);convBg.strokeRoundedRect(W/2-55,SCROLL_TOP+46,110,20,4);};
        drawConv(false);
        addO(this.add.text(W/2,SCROLL_TOP+56,CURRENT_LANG==="en"?"💎→💰 CONVERT":"💎→💰 ÇEVIR",{font:"bold 8px 'Courier New'",color:"#aaff44",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(13));
        const convHit=addO(this.add.rectangle(W/2,SCROLL_TOP+56,110,20,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(14));
        convHit.on("pointerover",()=>drawConv(true)).on("pointerout",()=>drawConv(false));
        convHit.on("pointerdown",()=>{
            if(PLAYER_GEMS<1){return;}
            const g=PLAYER_GEMS*GOLD_FROM_GEM;
            PLAYER_GOLD+=g;localStorage.setItem("nt_gold",PLAYER_GOLD);
            addGems(-PLAYER_GEMS);
            gemTxt.setText("💎 "+PLAYER_GEMS);
            goldTxt.setText("💰 "+PLAYER_GOLD);
            if(this._shopGold)this._shopGold.setText("💰 "+PLAYER_GOLD);
        });

        // Gem paketleri
        const CARD_H=68, CARD_GAP=2;
        const START_Y=SCROLL_TOP+72;
        GEM_PACKS.forEach((pack,i)=>{
            const cy=START_Y+i*(CARD_H+CARD_GAP);
            const CX=12, CW=336;
            const tagCol=pack.tag==="best"?0xffcc00:pack.tag==="popular"?0xff8800:0xcc44ff;

            const cardBg=addO(this.add.graphics().setDepth(12));
            const drawCard=hov=>{cardBg.clear();cardBg.fillStyle(0x0a0414,1);cardBg.fillRoundedRect(CX,cy,CW,CARD_H,7);cardBg.fillStyle(tagCol,hov?1:0.7);cardBg.fillRoundedRect(CX,cy,4,CARD_H,{tl:7,tr:0,bl:7,br:0});cardBg.fillStyle(tagCol,hov?0.14:0.05);cardBg.fillRoundedRect(CX,cy,CW,CARD_H,7);cardBg.lineStyle(hov?2:1,tagCol,hov?0.9:0.4);cardBg.strokeRoundedRect(CX,cy,CW,CARD_H,7);};
            drawCard(false);

            const totalGems=pack.gems+pack.bonus;
            addO(this.add.text(CX+14,cy+8,"💎 "+totalGems+" "+(CURRENT_LANG==="en"?"GEMS":"ELMAS"),{font:"bold 14px 'Courier New'",color:"#cc44ff",stroke:"#000",strokeThickness:3}).setDepth(13));
            addO(this.add.text(CX+14,cy+28,"= "+(totalGems*GOLD_FROM_GEM).toLocaleString()+" 💰",{font:"8px 'Courier New'",color:"#ffcc44",stroke:"#000",strokeThickness:2}).setDepth(13));
            if(pack.bonus>0) addO(this.add.text(CX+14,cy+44,"+"+pack.bonus+" BONUS",{font:"bold 8px 'Courier New'",color:"#00cc44",stroke:"#000",strokeThickness:1}).setDepth(13));

            const BW=80,BH=44,BX=CX+CW-BW-6,BY=cy+(CARD_H-BH)/2;
            const buyBg=addO(this.add.graphics().setDepth(13));
            const drawBuy=hov=>{buyBg.clear();buyBg.fillStyle(hov?tagCol:0x0d0020,1);buyBg.fillRoundedRect(BX,BY,BW,BH,6);buyBg.lineStyle(2,tagCol,hov?1:0.7);buyBg.strokeRoundedRect(BX,BY,BW,BH,6);};
            drawBuy(false);
            addO(this.add.text(BX+BW/2,BY+14,pack.price,{font:"bold 11px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:3}).setOrigin(0.5).setDepth(14));
            addO(this.add.text(BX+BW/2,BY+30,CURRENT_LANG==="en"?"BUY":"AL",{font:"bold 9px 'Courier New'",color:"#cc88ff",stroke:"#000",strokeThickness:1}).setOrigin(0.5).setDepth(14));

            const hitArea=addO(this.add.rectangle(CX+CW/2,cy+CARD_H/2,CW,CARD_H,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(16));
            hitArea.on("pointerover",()=>{drawCard(true);drawBuy(true);});
            hitArea.on("pointerout",()=>{drawCard(false);drawBuy(false);});
            hitArea.on("pointerdown",()=>{
                if(window.Telegram?.WebApp?.openInvoice){
                    window.Telegram.WebApp.openInvoice("gem_"+i,(status)=>{if(status==="paid"){addGems(pack.gems+pack.bonus);gemTxt.setText("💎 "+PLAYER_GEMS);}});
                } else {
                    addGems(pack.gems+pack.bonus);
                    gemTxt.setText("💎 "+PLAYER_GEMS);
                    showPurchaseEffect(this,CX+CW/2,cy+CARD_H/2,tagCol,pack.gems+pack.bonus,"💎");
                }
            });
        });
    }

    _openCollection(){
        this._closePanel();
        const W=360,H=640;
        const objs=[];
        const ov=this.add.rectangle(W/2,H/2,W,H,0x000000,0.85).setInteractive().setDepth(10); objs.push(ov); // input blocker
        this.tweens.add({targets:ov,fillAlpha:1,duration:280});
        const pg=this.add.graphics().setDepth(11); objs.push(pg);
        pg.fillStyle(0x07000d,1); pg.fillRoundedRect(6,6,348,628,10);
        pg.lineStyle(2.5,0x44aaff,1); pg.strokeRoundedRect(6,6,348,628,10);
        pg.fillStyle(0x44aaff,0.10); pg.fillRoundedRect(6,6,348,40,{tl:10,tr:10,bl:0,br:0});
        const collTitle=this.add.text(W/2,26,L("collectionTitle"),{
            font:"bold 16px 'Courier New'",color:"#44aaff",stroke:"#000000",strokeThickness:5,letterSpacing:3
        }).setOrigin(0.5).setDepth(12); objs.push(collTitle);

        const tabs=[{k:"weapons",l:L("weaponsTab"),c:0xff8844},{k:"enemies",l:L("enemiesTab"),c:0xff4444},{k:"upgrades",l:L("upgradesTab"),c:0x44aaff}];
        let aTab="weapons";
        const tabG=[],contG=[];

        const SCROLL_TOP=80,SCROLL_BTM=H-42,VISIBLE_H=SCROLL_BTM-SCROLL_TOP;

        const drawTabs=()=>{
            tabG.forEach(o=>{try{o.destroy();}catch(e){}});tabG.length=0;
            tabs.forEach((tab,i)=>{
                const tx=12+i*114,ty=46,tw=110,th=28;
                const tg=this.add.graphics().setDepth(13);
                const ia=aTab===tab.k;
                tg.fillStyle(ia?tab.c:0x111122,ia?0.25:0.9);
                tg.fillRoundedRect(tx,ty,tw,th,6);
                tg.lineStyle(ia?2:1,ia?tab.c:0x333366,ia?1:0.5);
                tg.strokeRoundedRect(tx,ty,tw,th,6);
                if(ia){tg.fillStyle(tab.c,0.15);tg.fillRoundedRect(tx,ty,tw,10,{tl:6,tr:6,bl:0,br:0});}
                tabG.push(tg);
                const tt=this.add.text(tx+tw/2,ty+th/2,tab.l,{
                    font:"bold 10px 'Courier New'",color:ia?"#ffffff":"#7788aa",stroke:"#000",strokeThickness:2
                }).setOrigin(0.5).setDepth(14); tabG.push(tt);
                const th2=this.add.rectangle(tx+tw/2,ty+th/2,tw,th,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(15);
                tabG.push(th2);
                th2.on("pointerdown",()=>{aTab=tab.k;drawTabs();renderColl();});
            });
        };

        const renderColl=()=>{
            contG.forEach(o=>{try{o.destroy();}catch(e){}});contG.length=0;
            // Scroll mask
            const maskGfx=this.add.graphics().setDepth(-1).setVisible(false);
            maskGfx.fillStyle(0xffffff); maskGfx.fillRect(6,SCROLL_TOP,348,VISIBLE_H);
            const mask=maskGfx.createGeometryMask();
            contG.push(maskGfx);
            const cont=this.add.container(0,SCROLL_TOP).setDepth(12);
            cont.setMask(mask);
            contG.push(cont);
            const aC=o=>{cont.add(o);contG.push(o);return o;};
            let totalH=0;

            if(aTab==="upgrades"){
                const COLS=4,CW=80,CH=88,GAP=4,OX=10;
                Object.entries(UPGRADES).forEach(([k,u],idx)=>{
                    const col=idx%COLS, row=Math.floor(idx/COLS);
                    const ix=OX+col*(CW+GAP), iy=4+row*(CH+GAP);
                    totalH=iy+CH+GAP;
                    const rc={common:0x4488ff,rare:0xaa44ff,epic:0xff8800}[u.rarity]||0x4488ff;
                    const ig=this.add.graphics().setDepth(12);
                    ig.fillStyle(0x0c0c1e,1); ig.fillRoundedRect(ix,iy,CW,CH,6);
                    ig.lineStyle(2,rc,0.8); ig.strokeRoundedRect(ix,iy,CW,CH,6);
                    ig.fillStyle(rc,0.10); ig.fillRoundedRect(ix,iy,CW,12,{tl:6,tr:6,bl:0,br:0});
                    aC(ig);
                    // Renk çubuğu alt kısım — yazı için yeterli alan
                    const rb=this.add.graphics().setDepth(12);
                    rb.fillStyle(rc,0.7); rb.fillRoundedRect(ix,iy+CH-16,CW,16,{tl:0,tr:0,bl:6,br:6});
                    aC(rb);
                    try{aC(this.add.image(ix+CW/2,iy+26,u.icon).setScale(1.8).setDepth(13));}catch(e){}
                    aC(this.add.text(ix+CW/2,iy+CH-2,L(u.nameKey),{
                        font:"bold 8px 'Courier New'",color:"#ffffff",align:"center",
                        stroke:"#000000",strokeThickness:4,wordWrap:{width:CW-4}
                    }).setOrigin(0.5,1).setDepth(14));
                });
            } else if(aTab==="weapons"){
                const wList=Object.entries(UPGRADES).filter(([k,u])=>u.type==="weapon");
                const COLS=3,CW=108,CH=104,GAP=4,OX=8;
                wList.forEach(([k,u],idx)=>{
                    const col=idx%COLS, row=Math.floor(idx/COLS);
                    const ix=OX+col*(CW+GAP), iy=4+row*(CH+GAP);
                    totalH=iy+CH+GAP;
                    const rc={common:0x4488ff,rare:0xaa44ff,epic:0xff8800}[u.rarity]||0x4488ff;
                    const wg=this.add.graphics().setDepth(12);
                    wg.fillStyle(0x0c0c1e,1); wg.fillRoundedRect(ix,iy,CW,CH,8);
                    wg.lineStyle(2,rc,0.85); wg.strokeRoundedRect(ix,iy,CW,CH,8);
                    wg.fillStyle(rc,0.12); wg.fillRoundedRect(ix,iy,CW,14,{tl:8,tr:8,bl:0,br:0});
                    aC(wg);
                    try{aC(this.add.image(ix+CW/2,iy+40,u.icon).setScale(2.4).setDepth(13));}catch(e){}
                    aC(this.add.text(ix+CW/2,iy+CH-10,L(u.nameKey),{
                        font:"bold 10px 'Courier New'",color:"#ffffff",align:"center",
                        stroke:"#000000",strokeThickness:4,wordWrap:{width:CW-6},
                        fixedWidth:CW-4
                    }).setOrigin(0.5,1).setDepth(13));
                });
            } else {
                // Düşmanlar — dil destekli, yeni tipler dahil
                const lang=L("start")==="BAŞLA"?"TR":L("start")==="START"?"EN":"RU";
                const ENEMY_LIST=[
                    {nameTR:"Normal",    nameEN:"Normal",     nameRU:"Обычный",    col:0xffcc55,
                     descTR:"Temel piramit düşmanı. Standart hız.",
                     descEN:"Basic pyramid enemy. Standard speed.",
                     descRU:"Обычный пирамидальный враг."},
                    {nameTR:"ZigZag",    nameEN:"ZigZag",     nameRU:"ЗигЗаг",     col:0x44ff88,
                     descTR:"Zigzag hareketle iner, nişan almak zordur.",
                     descEN:"Moves in zigzag — hard to aim.",
                     descRU:"Двигается зигзагом — трудно прицелиться."},
                    {nameTR:"Hızlı",     nameEN:"Fast",       nameRU:"Быстрый",    col:0xff4422,
                     descTR:"Çok hızlı iner, refleks gerektirir.",
                     descEN:"Very fast. Requires quick reflexes.",
                     descRU:"Очень быстрый — нужна реакция."},
                    {nameTR:"Tank",      nameEN:"Tank",       nameRU:"Танк",       col:0xaa44ff,
                     descTR:"Yüksek can, zırhlı. Çok atış gerekir.",
                     descEN:"High HP, armored. Needs many hits.",
                     descRU:"Высокое HP, бронированный."},
                    {nameTR:"Kalkan",    nameEN:"Shield",     nameRU:"Щит",        col:0x4488ff,
                     descTR:"Kalkanla korunur, tam ortadan vur.",
                     descEN:"Protected by shield — hit dead center.",
                     descRU:"Защищён щитом — бей прямо в центр."},
                    {nameTR:"Kamikaze",  nameEN:"Kamikaze",   nameRU:"Камикадзе",  col:0xff6600,
                     descTR:"Hızlanarak yaklaşır, saldırgan.",
                     descEN:"Accelerates toward you aggressively.",
                     descRU:"Ускоряется к тебе агрессивно."},
                    {nameTR:"Hayalet",   nameEN:"Ghost",      nameRU:"Призрак",    col:0x88aacc,
                     descTR:"Yarı görünmez, dikkat et.",
                     descEN:"Semi-invisible — stay alert.",
                     descRU:"Полупрозрачный — будь осторожен."},
                    {nameTR:"Yaşlı",     nameEN:"Elder",      nameRU:"Старейшина", col:0xffcc44,
                     descTR:"Güçlü ve dayanıklı yaşlı piramit.",
                     descEN:"Strong and durable ancient pyramid.",
                     descRU:"Сильная древняя пирамида."},
                    {nameTR:"Titan",     nameEN:"Titan",      nameRU:"Титан",      col:0x9900dd,
                     descTR:"Dev boyutlu, çok yüksek can.",
                     descEN:"Gigantic, very high HP.",
                     descRU:"Гигантский, очень высокий HP."},
                    {nameTR:"Colossus",  nameEN:"Colossus",   nameRU:"Колосс",     col:0xff2266,
                     descTR:"En güçlü normal düşman.",
                     descEN:"Strongest standard enemy.",
                     descRU:"Сильнейший обычный враг."},
                    {nameTR:"İyileştirici",nameEN:"Healer",   nameRU:"Целитель",   col:0x00ff88,
                     descTR:"Diğer düşmanları iyileştirir.",
                     descEN:"Heals nearby enemies.",
                     descRU:"Лечит соседних врагов."},
                    {nameTR:"Berserker", nameEN:"Berserker",  nameRU:"Берсерк",    col:0xff0000,
                     descTR:"Hasar aldıkça hızlanır.",
                     descEN:"Speeds up as it takes damage.",
                     descRU:"Ускоряется при получении урона."},
                    {nameTR:"🔥 Ateş Piramidi",nameEN:"🔥 Inferno",nameRU:"🔥 Инферно",col:0xff3300,
                     descTR:"360° dönerek iner. Vurması zor!",
                     descEN:"Spins 360° as it descends. Tricky!",
                     descRU:"Вращается на 360° при падении."},
                    {nameTR:"❄️ Buz Piramidi",nameEN:"❄️ Glacier",nameRU:"❄️ Ледник",col:0x44ccff,
                     descTR:"Yavaş ama çift zırhlı, sağlam.",
                     descEN:"Slow but double-armored and tough.",
                     descRU:"Медленный, но двойная броня."},
                    {nameTR:"👻 Hayalet Üçgen",nameEN:"👻 Phantom Tri",nameRU:"👻 Призрак-Три",col:0xcc44ff,
                     descTR:"Ölünce ikiye bölünür. Dikkat!",
                     descEN:"Splits into 2 shards on death!",
                     descRU:"При смерти делится на 2 части!"},
                    {nameTR:"⚡ Elektrik",nameEN:"⚡ Volt",     nameRU:"⚡ Вольт",   col:0xffee00,
                     descTR:"Zigzag + periyodik hızlanır.",
                     descEN:"Zigzags and periodically surges.",
                     descRU:"Зигзаг + периодическое ускорение."},
                    {nameTR:"🌑 Obsidyen",nameEN:"🌑 Obsidian", nameRU:"🌑 Обсидиан",col:0x6600aa,
                     descTR:"En sert düşman. Hasar yansıtabilir!",
                     descEN:"Toughest enemy. Reflects damage!",
                     descRU:"Сильнейший. Отражает урон!"},
                ];
                ENEMY_LIST.forEach((en,idx)=>{
                    const enName=lang==="TR"?en.nameTR:lang==="EN"?en.nameEN:en.nameRU;
                    const enDesc=lang==="TR"?en.descTR:lang==="EN"?en.descEN:en.descRU;
                    const iy=4+idx*54;
                    totalH=iy+54;
                    const eg=this.add.graphics().setDepth(12);
                    eg.fillStyle(0x0c0a14,1); eg.fillRoundedRect(10,iy,332,48,7);
                    eg.lineStyle(2,en.col,0.75); eg.strokeRoundedRect(10,iy,332,48,7);
                    eg.fillStyle(en.col,0.08); eg.fillRoundedRect(10,iy,332,48,7);
                    eg.fillStyle(en.col,0.7); eg.fillRoundedRect(10,iy,5,48,{tl:7,tr:0,bl:7,br:0});
                    aC(eg);
                    const pg2=this.add.graphics().setDepth(13);
                    pg2.fillStyle(en.col,0.9); pg2.fillTriangle(42,iy+10,54,iy+37,30,iy+37);
                    pg2.fillStyle(en.col,0.45); pg2.fillTriangle(42,iy+15,50,iy+37,34,iy+37);
                    aC(pg2);
                    aC(this.add.text(65,iy+10,enName,{
                        font:"bold 12px 'Courier New'",color:"#ffffff",stroke:"#000000",strokeThickness:4
                    }).setDepth(14));
                    aC(this.add.text(65,iy+27,enDesc,{
                        font:"bold 8px 'Courier New'",color:"#aabbcc",stroke:"#000000",strokeThickness:2,
                        wordWrap:{width:262}
                    }).setDepth(14));
                });
            }

            // Scroll setup
            let scrollY=0;
            const maxScroll=Math.max(0,totalH-VISIBLE_H+8);
            const updateScroll=(dy)=>{
                scrollY=Phaser.Math.Clamp(scrollY+dy,0,maxScroll);
                cont.y=SCROLL_TOP-scrollY;
            };
            const wheelFn=(p,g,dx,dy)=>updateScroll(dy*0.5);
            this.input.on("wheel",wheelFn);
            contG.push({destroy:()=>this.input.off("wheel",wheelFn)});
            let dragStartY=null,dragStartScroll=0;
            const dzones=this.add.rectangle(W/2,(SCROLL_TOP+SCROLL_BTM)/2,W,VISIBLE_H,0xffffff,0.001)
                .setInteractive({draggable:true}).setDepth(11);
            contG.push(dzones);
            dzones.on("dragstart",(p)=>{dragStartY=p.y;dragStartScroll=scrollY;});
            dzones.on("drag",(p)=>{updateScroll(dragStartScroll-(p.y-dragStartY)-scrollY);scrollY=Phaser.Math.Clamp(dragStartScroll-(p.y-dragStartY),0,maxScroll);cont.y=SCROLL_TOP-scrollY;});
        };

        drawTabs(); renderColl();
        objs.push(...tabG);
        const closeFn=()=>{
            contG.forEach(o=>{try{if(typeof o.destroy==="function")o.destroy();}catch(e){}});
            [...objs,...tabG].forEach(o=>{try{o.destroy();}catch(e){}});
            this._openPanel=null;
        };
        objs.push(...this._closeBtn(W/2,H-20,null,closeFn));
        this._openPanel=[...objs,...tabG,...contG];
    }

    // ── UNLOCKS ───────────────────────────────────────────────
    _openUnlocks(){
        this._closePanel();
        const W=360,H=640;
        const objs=[],addO=o=>{objs.push(o);return o;};
        addO(this.add.rectangle(W/2,H/2,W,H,0x000000,0.92).setInteractive().setDepth(10)); // input blocker
        const pg=addO(this.add.graphics().setDepth(11));
        pg.fillStyle(0x030a04,1); pg.fillRoundedRect(6,6,348,628,10);
        pg.lineStyle(2.5,0x44ff88,1); pg.strokeRoundedRect(6,6,348,628,10);
        pg.fillStyle(0x44ff88,0.10); pg.fillRoundedRect(6,6,348,42,{tl:10,tr:10,bl:0,br:0});
        addO(this.add.text(W/2,24,CURRENT_LANG==="ru"?"ОТКРЫТИЯ":CURRENT_LANG==="en"?"UNLOCKS":L("unlocksTitle"),{
            font:"bold 16px 'Courier New'",color:"#44ff88",stroke:"#000000",strokeThickness:5,letterSpacing:3
        }).setOrigin(0.5).setDepth(12));

        let activeUnlockTab="howto";
        const tabObjs=[];
        const contentObjs=[];
        const SCROLL_TOP=80,SCROLL_BTM=H-46,VISIBLE_H=SCROLL_BTM-SCROLL_TOP;

        const drawUTabs=()=>{
            tabObjs.forEach(o=>{try{o.destroy();}catch(e){}});tabObjs.length=0;
            const TDEFS=[
                {k:"howto",l:CURRENT_LANG==="ru"?"📖 NASIL OYNENIR":CURRENT_LANG==="en"?"📖 HOW TO PLAY":"📖 NASIL OYNANIR"},
                {k:"evos", l:CURRENT_LANG==="ru"?"⚡ ЭВОЛЮЦИИ":CURRENT_LANG==="en"?"⚡ EVOLUTIONS":"⚡ EVRİMLER"}
            ];
            TDEFS.forEach((tab,i)=>{
                const tx=12+i*172,ty=47,tw=168,th=28;
                const ia=activeUnlockTab===tab.k;
                const tg=this.add.graphics().setDepth(12); tabObjs.push(tg); objs.push(tg);
                tg.fillStyle(ia?0x44ff88:0x0a150a,ia?0.18:0.9);
                tg.fillRoundedRect(tx,ty,tw,th,6);
                tg.lineStyle(ia?2:1,ia?0x44ff88:0x224422,ia?1:0.5);
                tg.strokeRoundedRect(tx,ty,tw,th,6);
                const tt=this.add.text(tx+tw/2,ty+th/2,tab.l,{
                    font:"bold 10px 'Courier New'",color:ia?"#ffffff":"#558855",stroke:"#000",strokeThickness:2
                }).setOrigin(0.5).setDepth(13); tabObjs.push(tt); objs.push(tt);
                const th2=this.add.rectangle(tx+tw/2,ty+th/2,tw,th,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(14);
                tabObjs.push(th2); objs.push(th2);
                th2.on("pointerdown",()=>{activeUnlockTab=tab.k;drawUTabs();renderUContent();});
            });
        };

        const renderUContent=()=>{
            contentObjs.forEach(o=>{try{if(typeof o.destroy==="function")o.destroy();}catch(e){}});contentObjs.length=0;
            const maskGfx=this.add.graphics().setDepth(-1).setVisible(false);
            maskGfx.fillStyle(0xffffff); maskGfx.fillRect(6,SCROLL_TOP,348,VISIBLE_H);
            const mask=maskGfx.createGeometryMask();
            contentObjs.push(maskGfx);
            const cont=this.add.container(0,SCROLL_TOP).setDepth(12);
            cont.setMask(mask);
            contentObjs.push(cont);
            const aC=o=>{cont.add(o);contentObjs.push(o);return o;};
            let totalH=0;

            if(activeUnlockTab==="howto"){
                const entries=[
                    ["🎯", CURRENT_LANG==="ru"?"ЦЕЛЬ":CURRENT_LANG==="en"?"GOAL":"AMAÇ",               L("howto_goal"),   "#ff5555"],
                    ["⬅➡",CURRENT_LANG==="ru"?"ДВИЖЕНИЕ":CURRENT_LANG==="en"?"MOVEMENT":"HAREKET",     L("howto_move"),   "#44aaff"],
                    ["💥", CURRENT_LANG==="ru"?"ВЫСТРЕЛ":CURRENT_LANG==="en"?"SHOOT":"ATEŞ",            L("howto_shoot"),  "#ffdd44"],
                    ["⭐", CURRENT_LANG==="ru"?"УРОВНИ":CURRENT_LANG==="en"?"LEVELS":"SEVİYE",          L("howto_level"),  "#ffcc44"],
                    ["⚡", CURRENT_LANG==="ru"?"ЭВОЛЮЦИЯ":CURRENT_LANG==="en"?"EVOLUTION":"EVRİM",      L("howto_evo"),    "#44ff88"],
                    ["🌀", CURRENT_LANG==="ru"?"СОБЫТИЯ":CURRENT_LANG==="en"?"EVENTS":"EVENTLER",       L("howto_events"), "#ff8844"],
                    ["🏆", CURRENT_LANG==="ru"?"КОМБО":CURRENT_LANG==="en"?"COMBO":"KOMBO",             L("howto_combo"),  "#ffcc00"],
                    ["❤️", CURRENT_LANG==="ru"?"ЯБЛОКО":CURRENT_LANG==="en"?"APPLE":"ELMA",             L("howto_apple"),  "#ff6688"],
                    ["💎", CURRENT_LANG==="ru"?"КРИСТАЛЛ":CURRENT_LANG==="en"?"CRYSTAL":"KRİSTAL",      L("howto_crystal"),"#cc44ff"],
                    ["🔱", CURRENT_LANG==="ru"?"СИНЕРГИЯ":CURRENT_LANG==="en"?"SYNERGY":"SİNERJİ",      L("howto_synergy"),"#ff8800"],
                ];
                entries.forEach(([icon,title2,desc2,col],i)=>{
                    const iy=i*68+4;
                    totalH=iy+68;
                    const colInt=parseInt(col.replace("#",""),16);
                    const bg=this.add.graphics().setDepth(12);
                    bg.fillStyle(0x060d06,1); bg.fillRoundedRect(8,iy,336,62,8);
                    bg.lineStyle(2,colInt,0.85); bg.strokeRoundedRect(8,iy,336,62,8);
                    bg.fillStyle(colInt,0.07); bg.fillRoundedRect(8,iy,336,62,8);
                    bg.fillStyle(colInt,0.80); bg.fillRoundedRect(8,iy,5,62,{tl:8,tr:0,bl:8,br:0});
                    aC(bg);
                    const ig=this.add.graphics().setDepth(13);
                    ig.fillStyle(colInt,0.25); ig.fillCircle(36,iy+31,20);
                    ig.lineStyle(2,colInt,0.7); ig.strokeCircle(36,iy+31,20);
                    aC(ig);
                    aC(this.add.text(36,iy+31,icon,{font:"15px 'Courier New'"}).setOrigin(0.5).setDepth(14));
                    aC(this.add.text(66,iy+9,title2,{
                        font:"bold 13px 'Courier New'",color:col,stroke:"#000000",strokeThickness:4
                    }).setDepth(14));
                    aC(this.add.text(66,iy+30,desc2,{
                        font:"10px 'Courier New'",color:"#ccddcc",stroke:"#000000",strokeThickness:3,
                        wordWrap:{width:272},lineSpacing:2
                    }).setDepth(14));
                });
            } else {
                const EVO_DEF=[
                    {nk:"evoTriCannon",   col:0xff8800,req:["multi","size"]},
                    {nk:"evoStormCore",   col:0xffff44,req:["damage","crit"]},
                    {nk:"evoGravityWell", col:0x44ffcc,req:["magnet","speed"]},
                    {nk:"evoOverload",    col:0xff44aa,req:["attack","damage"]},
                    {nk:"evoCryoField",   col:0x88ddff,req:["freeze","pierce"]},
                    {nk:"evoPlagueBearer",col:0x44ff44,req:["poison","explosive"]},
                ];
                EVO_DEF.forEach((evo,idx)=>{
                    const isActive=EVOLUTIONS.find(e=>e.nameKey===evo.nk)?.active||false;
                    const col=evo.col;
                    const hexCol="#"+col.toString(16).padStart(6,"0");
                    const iy=idx*92+4;
                    totalH=iy+92;
                    const r1=UPGRADES[evo.req[0]],r2=UPGRADES[evo.req[1]];
                    const card=this.add.graphics().setDepth(12);
                    card.fillStyle(0x050308,1); card.fillRoundedRect(8,iy,336,86,8);
                    card.lineStyle(isActive?2.5:1.5,col,isActive?1:0.45); card.strokeRoundedRect(8,iy,336,86,8);
                    if(isActive){card.fillStyle(col,0.08);card.fillRoundedRect(8,iy,336,86,8);}
                    aC(card);
                    // Gerekli upgrade ikonlarını oyun içindeki gerçek texture ile göster
                    [[r1,14],[r2,78]].forEach(([ru,bx])=>{
                        const rb=this.add.graphics().setDepth(13);
                        rb.fillStyle(ru.color,isActive?0.3:0.10); rb.fillRoundedRect(bx,iy+10,56,58,6);
                        rb.lineStyle(2,ru.color,isActive?0.9:0.35); rb.strokeRoundedRect(bx,iy+10,56,58,6);
                        aC(rb);
                        // Gerçek icon_ texture — emoji değil
                        try{
                            const iconImg=this.add.image(bx+28,iy+33,ru.icon).setOrigin(0.5).setScale(0.85).setDepth(14);
                            aC(iconImg);
                        }catch(e){} // texture yoksa sessizce atla
                        aC(this.add.text(bx+28,iy+56,L(ru.nameKey),{
                            font:"bold 7px 'Courier New'",color:"#"+ru.color.toString(16).padStart(6,"0"),
                            stroke:"#000000",strokeThickness:2,align:"center",wordWrap:{width:54}
                        }).setOrigin(0.5,0).setDepth(14));
                    });
                    aC(this.add.text(74,iy+43,"+",{font:"bold 20px 'Courier New'",color:"#667788",stroke:"#000000",strokeThickness:4}).setOrigin(0.5).setDepth(14));
                    aC(this.add.text(144,iy+43,"→",{font:"bold 18px 'Courier New'",color:"#445566",stroke:"#000000",strokeThickness:3}).setOrigin(0.5).setDepth(14));
                    const eiG=this.add.graphics().setDepth(13);
                    eiG.fillStyle(col,isActive?0.4:0.14); eiG.fillCircle(165,iy+43,26);
                    eiG.lineStyle(isActive?3:1.5,col,isActive?1:0.5); eiG.strokeCircle(165,iy+43,26);
                    aC(eiG);
                    // Evrim merkez ikonu: ilk gereksinim ikonunu büyük göster
                    try{
                        const cImg=this.add.image(165,iy+43,r1.icon).setOrigin(0.5).setScale(1.1).setDepth(15);
                        if(isActive) cImg.setTint(col); else cImg.setAlpha(0.7);
                        aC(cImg);
                    }catch(e){}
                    const evoObj=EVOLUTIONS.find(e=>e.nameKey===evo.nk);
                    aC(this.add.text(200,iy+10,L(evo.nk),{
                        font:"bold 12px 'Courier New'",color:isActive?hexCol:"#558855",
                        stroke:"#000000",strokeThickness:4,wordWrap:{width:130}
                    }).setDepth(14));
                    aC(this.add.text(200,iy+30,L(r1.nameKey)+" + "+L(r2.nameKey),{
                        font:"bold 9px 'Courier New'",color:isActive?"#aaccaa":"#446644",
                        stroke:"#000000",strokeThickness:2,wordWrap:{width:130}
                    }).setDepth(14));
                    if(evoObj) aC(this.add.text(200,iy+50,L(evoObj.descKey),{
                        font:"9px 'Courier New'",color:isActive?"#aaddcc":"#334433",
                        stroke:"#000000",strokeThickness:2,wordWrap:{width:130}
                    }).setDepth(14));
                    const badgeG=this.add.graphics().setDepth(14);
                    if(isActive){badgeG.fillStyle(col,0.9);badgeG.fillRoundedRect(282,iy+10,50,20,4);}
                    else{badgeG.fillStyle(0x111122,0.9);badgeG.fillRoundedRect(282,iy+10,50,20,4);badgeG.lineStyle(1,0x333355,0.7);badgeG.strokeRoundedRect(282,iy+10,50,20,4);}
                    aC(badgeG);
                    aC(this.add.text(307,iy+20,isActive?L("unlocked"):L("comingSoon")||"🔒 COMING SOON",{
                        font:"bold 7px 'Courier New'",color:isActive?"#000000":"#556677",stroke:"#000",strokeThickness:1
                    }).setOrigin(0.5).setDepth(15));
                });
            }
            let scrollY=0;
            const maxScroll=Math.max(0,totalH-VISIBLE_H+10);
            const wFn=(p,g,dx,dy)=>{scrollY=Phaser.Math.Clamp(scrollY+dy*0.5,0,maxScroll);cont.y=SCROLL_TOP-scrollY;};
            this.input.on("wheel",wFn);
            contentObjs.push({destroy:()=>this.input.off("wheel",wFn)});
            let _ds=null,_dss=0;
            const dz=this.add.rectangle(W/2,(SCROLL_TOP+SCROLL_BTM)/2,W,VISIBLE_H,0xffffff,0.001).setInteractive({draggable:true}).setDepth(11);
            contentObjs.push(dz);
            dz.on("dragstart",(p)=>{_ds=p.y;_dss=scrollY;});
            dz.on("drag",(p)=>{scrollY=Phaser.Math.Clamp(_dss-(p.y-(_ds||p.y)),0,maxScroll);cont.y=SCROLL_TOP-scrollY;});
        };
        drawUTabs();
        renderUContent();
        const _unlockCloseFn=()=>{
            contentObjs.forEach(o=>{try{if(typeof o.destroy==="function")o.destroy();}catch(e){}});
            tabObjs.forEach(o=>{try{if(typeof o.destroy==="function")o.destroy();}catch(e){}});
            objs.forEach(o=>{try{if(typeof o.destroy==="function")o.destroy();}catch(e){}});
            this._openPanel=null;
            try{this.input.off("wheel");}catch(e){}
        };
        objs.push(...this._closeBtn(W/2,H-22,null,_unlockCloseFn));
        this._openPanel=[...objs,...tabObjs,...contentObjs];
    }

    // ── AYARLAR ───────────────────────────────────────────────
    _openSettings(){
        this._closePanel();
        const W=360,H=640,S=this;
        const objs=[],addO=o=>{objs.push(o);return o;};
        // ── OYUNU DURDUR — ayarlar açıkken her şey durur ──
        const _wasGameScene = !!(S.physics && S.physics.world);
        if(_wasGameScene){
            try{ S.physics.pause(); }catch(e){}
            if(S.spawnEvent) S.spawnEvent.paused=true;
            try{ S.time.timeScale=0; }catch(e){}
        }

        // Overlay
        addO(S.add.rectangle(W/2,H/2,W,H,0x000000,0.78).setInteractive().setDepth(10)); // input blocker

        const PX=10,PY=8,PW=340,PH=620;
        const HEADER_H=46,FOOTER_H=50;
        const SCROLL_TOP=PY+HEADER_H,SCROLL_BTM=PY+PH-FOOTER_H;
        const VISIBLE_H=SCROLL_BTM-SCROLL_TOP;

        // Panel çerçeve
        const pg=addO(S.add.graphics().setDepth(11));
        pg.fillStyle(0x07000d,0.98); pg.fillRoundedRect(PX,PY,PW,PH,8);
        pg.lineStyle(2,0x4488ff,0.85); pg.strokeRoundedRect(PX,PY,PW,PH,8);
        pg.fillStyle(0x4488ff,0.09); pg.fillRoundedRect(PX,PY,PW,HEADER_H,{tl:8,tr:8,bl:0,br:0});
        pg.fillStyle(0x050010,1); pg.fillRoundedRect(PX,SCROLL_BTM,PW,FOOTER_H,{tl:0,tr:0,bl:8,br:8});
        pg.lineStyle(1,0x224488,0.35); pg.lineBetween(PX+10,SCROLL_BTM,PX+PW-10,SCROLL_BTM);

        const titleStr=CURRENT_LANG==="ru"?"⚙  НАСТРОЙКИ":CURRENT_LANG==="en"?"⚙  SETTINGS":"⚙  AYARLAR";
        addO(S.add.text(W/2,PY+HEADER_H/2,titleStr,{font:"bold 14px 'Courier New'",color:"#4488ff",stroke:"#000",strokeThickness:4}).setOrigin(0.5).setDepth(12));

        // Scroll mask
        const maskGfx=S.add.graphics().setDepth(-1).setVisible(false);
        maskGfx.fillStyle(0xffffff); maskGfx.fillRect(0,SCROLL_TOP,W,VISIBLE_H);
        const scrollMask=maskGfx.createGeometryMask();
        objs.push(maskGfx);

        // Scroll container
        const scrollCont=S.add.container(0,SCROLL_TOP).setDepth(12);
        scrollCont.setMask(scrollMask);
        objs.push(scrollCont);
        // addS: container'a ekler — objs'a EKLEME, container destroy olunca children'ları da destroy eder.
        // objs'a ikinci kez eklemek double-destroy'a yol açar ve Phaser input registry'sini bozar.
        const addS=o=>{scrollCont.add(o);return o;};

        let scrollY=0,maxScrollY=0;
        const setScroll=(v)=>{scrollY=Phaser.Math.Clamp(v,0,maxScrollY);scrollCont.y=SCROLL_TOP-scrollY;};
        S.input.on("wheel",(p,go,dx,dy)=>setScroll(scrollY+dy*0.55));
        // Touch drag on panel (no blocking rectangle)
        let _touchStartY=null,_touchStartScroll=0;
        const onTouchStart=(ptr)=>{
            const py=ptr.y;
            if(py<SCROLL_TOP||py>SCROLL_BTM) return;
            _touchStartY=py; _touchStartScroll=scrollY;
        };
        const onTouchMove=(ptr)=>{
            if(_touchStartY===null) return;
            setScroll(_touchStartScroll-( ptr.y-_touchStartY));
        };
        const onTouchEnd=()=>{_touchStartY=null;};
        S.input.on("pointerdown",onTouchStart);
        S.input.on("pointermove",onTouchMove);
        S.input.on("pointerup",onTouchEnd);
        // clean up on close
        objs.push({destroy:()=>{S.input.off("pointerdown",onTouchStart);S.input.off("pointermove",onTouchMove);S.input.off("pointerup",onTouchEnd);}});

        let cy=4;
        const ROW=36,LBLX=14,CTRLX=PW-14;

        const addSection=(lbl,col=0x4488ff)=>{
            const sg=addS(S.add.graphics().setDepth(12));
            sg.fillStyle(col,0.14); sg.fillRoundedRect(LBLX-2,cy,PW-22,22,3);
            sg.lineStyle(1,col,0.5); sg.strokeRoundedRect(LBLX-2,cy,PW-22,22,3);
            addS(S.add.text(PW/2-10,cy+11,lbl,{font:"bold 9px 'Courier New'",color:"#"+col.toString(16).padStart(6,"0"),stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(13));
            cy+=26;
        };

        const addToggle=(lbl,key,def,onChange)=>{
            // Etiket max 180px ile sınırla — taşmayı önle
            addS(S.add.text(LBLX,cy+14,lbl,{font:"bold 9px 'Courier New'",color:"#ccdde8",stroke:"#000",strokeThickness:2,maxWidth:170}).setOrigin(0,0.5).setDepth(13));
            const raw=localStorage.getItem(key);
            let on=raw===null?def:raw==="1";
            const TW=56,TH=24,TX=CTRLX-TW;
            const onL=CURRENT_LANG==="ru"?"ВКЛ":CURRENT_LANG==="en"?"ON":"AÇIK";
            const offL=CURRENT_LANG==="ru"?"ВЫКЛ":CURRENT_LANG==="en"?"OFF":"KAPALI";
            const tg=addS(S.add.graphics().setDepth(13));
            const knob=addS(S.add.graphics().setDepth(14));
            const capturedCy=cy;
            const draw=()=>{
                tg.clear();
                tg.fillStyle(on?0x1155cc:0x1a1a2e,1); tg.fillRoundedRect(TX,capturedCy,TW,TH,TH/2);
                tg.lineStyle(1.5,on?0x4488ff:0x334455,0.9); tg.strokeRoundedRect(TX,capturedCy,TW,TH,TH/2);
                knob.clear();
                knob.fillStyle(0xffffff,0.95); knob.fillCircle(on?TX+TW-11:TX+11,capturedCy+TH/2,9);
            };
            draw();
            const llbl=addS(S.add.text(on?TX+11:TX+TW-11,capturedCy+TH/2,on?onL:offL,{font:"bold 7px 'Courier New'",color:on?"#1155cc":"#aaaacc"}).setOrigin(0.5).setDepth(15));
            const hitWorldY=SCROLL_TOP+capturedCy+TH/2;
            const hit=addO(S.add.rectangle(TX+TW/2,hitWorldY,TW+8,TH+8,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(50));
            hit.on("pointerdown",()=>{
                const visY=SCROLL_TOP+capturedCy-scrollY;
                if(visY<SCROLL_TOP-TH||visY>SCROLL_BTM) return;
                hit.y=SCROLL_TOP+capturedCy+TH/2-scrollY;
                on=!on; localStorage.setItem(key,on?"1":"0");
                draw();
                llbl.setText(on?onL:offL).setColor(on?"#1155cc":"#aaaacc").setX(on?TX+11:TX+TW-11);
                if(onChange) onChange(on);
            });
            const origCy=capturedCy;
            const scrollSync=()=>{ hit.y=SCROLL_TOP+origCy+TH/2-scrollY; };
            S.input.on("wheel",scrollSync);
            S.input.on("pointermove",scrollSync);
            objs.push({destroy:()=>{S.input.off("wheel",scrollSync);S.input.off("pointermove",scrollSync);}});
            cy+=ROW;
        };

        const addSlider=(lbl,key,def,min,max,onChange)=>{
            addS(S.add.text(LBLX,cy+14,lbl,{font:"bold 9px 'Courier New'",color:"#ccdde8",stroke:"#000",strokeThickness:2,maxWidth:170}).setOrigin(0,0.5).setDepth(13));
            let val=parseFloat(localStorage.getItem(key)||String(def));
            const SLW=130,SLH=10,SLX=CTRLX-SLW-28,SLY=cy+8;
            const sg=addS(S.add.graphics().setDepth(13));
            const vTxt=addS(S.add.text(CTRLX,cy+14,Math.round(val*100)+"%",{font:"bold 9px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:2}).setOrigin(1,0.5).setDepth(14));
            const capturedSLY=SLY;
            const redraw=()=>{
                sg.clear();
                sg.fillStyle(0x0e0e1e,1); sg.fillRoundedRect(SLX,capturedSLY,SLW,SLH,5);
                const fw=Math.max(0,Math.min(SLW,SLW*(val-min)/(max-min)));
                sg.fillStyle(0x4488ff,1); sg.fillRoundedRect(SLX,capturedSLY,fw,SLH,5);
                sg.fillStyle(0xffffff,0.95); sg.fillCircle(SLX+fw,capturedSLY+SLH/2,9);
                sg.lineStyle(2,0x4488ff,0.8); sg.strokeCircle(SLX+fw,capturedSLY+SLH/2,9);
                vTxt.setText(Math.round(val*100)+"%");
            };
            redraw();
            // World-space hit rect
            const hitWorldY=SCROLL_TOP+capturedSLY+SLH/2;
            const hit=addO(S.add.rectangle(SLX+SLW/2,hitWorldY,SLW+24,28,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(50));
            const setV=(ptr)=>{
                const localX=ptr.x-SLX;
                const rx=Phaser.Math.Clamp(localX,0,SLW);
                val=min+(rx/SLW)*(max-min); val=Math.round(val*20)/20;
                localStorage.setItem(key,String(val)); redraw();
                if(onChange) onChange(val);
            };
            hit.on("pointerdown",(ptr)=>{
                const visY=SCROLL_TOP+capturedSLY-scrollY;
                if(visY<SCROLL_TOP-20||visY>SCROLL_BTM) return;
                setV(ptr);
            });
            hit.on("pointermove",(ptr)=>{if(ptr.isDown) setV(ptr);});
            const sliderScrollSync=()=>{hit.y=SCROLL_TOP+capturedSLY+SLH/2-scrollY;};
            S.input.on("wheel",sliderScrollSync);
            S.input.on("pointermove",sliderScrollSync);
            objs.push({destroy:()=>{S.input.off("wheel",sliderScrollSync);S.input.off("pointermove",sliderScrollSync);}});
            cy+=ROW;
        };

        const addSelect=(lbl,key,opts,def,onChange)=>{
            addS(S.add.text(LBLX,cy+14,lbl,{font:"bold 9px 'Courier New'",color:"#ccdde8",stroke:"#000",strokeThickness:2,maxWidth:170}).setOrigin(0,0.5).setDepth(13));
            cy+=20;
            let cur=localStorage.getItem(key)||def;
            const BW=Math.floor((PW-28)/opts.length)-3;
            const capturedCy=cy;
            const bgs=[],lbls=[];
            opts.forEach((opt,i)=>{
                const bx=LBLX+i*(BW+3);
                const bg=addS(S.add.graphics().setDepth(13)); bgs.push(bg);
                const draw=()=>{const a=cur===opt.val;bg.clear();bg.fillStyle(a?0x1155cc:0x111128,1);bg.fillRoundedRect(bx,capturedCy,BW,26,4);bg.lineStyle(1.5,a?0x4488ff:0x333355,a?1:0.5);bg.strokeRoundedRect(bx,capturedCy,BW,26,4);};
                draw(); bg._draw=draw;
                const lbl2=addS(S.add.text(bx+BW/2,capturedCy+13,opt.label,{font:"bold 9px 'Courier New'",color:cur===opt.val?"#ffffff":"#667788",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(14)); lbls.push(lbl2);
                const hitWorldY=SCROLL_TOP+capturedCy+13;
                const hit=addO(S.add.rectangle(bx+BW/2,hitWorldY,BW,30,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(50));
                hit.on("pointerdown",()=>{
                    const visY=SCROLL_TOP+capturedCy-scrollY;
                    if(visY<SCROLL_TOP-30||visY>SCROLL_BTM) return;
                    cur=opt.val; localStorage.setItem(key,cur);
                    bgs.forEach((b,j)=>{b._draw();lbls[j].setColor(opts[j].val===cur?"#ffffff":"#667788");});
                    if(onChange) onChange(cur);
                });
                const selScrollSync=()=>{hit.y=SCROLL_TOP+capturedCy+13-scrollY;};
                S.input.on("wheel",selScrollSync);
                S.input.on("pointermove",selScrollSync);
                objs.push({destroy:()=>{S.input.off("wheel",selScrollSync);S.input.off("pointermove",selScrollSync);}});
            });
            cy+=ROW;
        };

        // ═ DİL ═══════════════════════════════════════════════
        addSection(CURRENT_LANG==="ru"?"── ЯЗЫК ──":CURRENT_LANG==="en"?"── LANGUAGE ──":"── DİL ──",0x4488ff);
        addSelect(CURRENT_LANG==="ru"?"Язык":CURRENT_LANG==="en"?"Language":"Dil","nt_lang",
            [{val:"tr",label:"Türkçe"},{val:"en",label:"English"},{val:"ru",label:"Русский"}],CURRENT_LANG,
            (v)=>{
                // 1. Persist the chosen language immediately
                setLang(v);
                // 2. Remove all scene-level input listeners this settings panel registered.
                //    Use the specific callback references so we only remove OUR listeners,
                //    not any listeners that belong to menu buttons or other systems.
                S.input.off("wheel");
                S.input.off("pointerdown", onTouchStart);
                S.input.off("pointermove", onTouchMove);
                S.input.off("pointerup",   onTouchEnd);
                // 3. Destroy panel objects in safe order:
                //    a) First destroy pseudo-objects (input-off wrappers) — these have no
                //       Phaser scene object and must go before the container.
                //    b) Then destroy the scrollCont container — this cleanly destroys all
                //       its children in one shot (they are NOT in objs, so no double-destroy).
                //    c) Then destroy maskGfx.
                //    d) Then destroy remaining top-level scene objects (overlay, panel bg, etc.)
                //    We iterate objs but skip anything the container already owns.
                objs.forEach(o=>{
                    try{ if(o.removeAllListeners) o.removeAllListeners(); }catch(e){}
                    try{ if(o.destroy) o.destroy(); }catch(e){}
                });
                this._openPanel=null;
                // 4. Re-open settings with the new language — NO scene restart needed.
                //    Restarting the scene leaves Phaser's input plugin in a dirty state
                //    (ghost interactive objects, duplicate listeners) which breaks all clicks.
                //    Simply rebuilding the panel in-place is safe and instant.
                this._openSettings();
            });

        // ═ SES ════════════════════════════════════════════════
        addSection(CURRENT_LANG==="ru"?"── ЗВУК ──":CURRENT_LANG==="en"?"── AUDIO ──":"── SES ──",0x44aaff);
        addSlider(CURRENT_LANG==="ru"?"Громкость SFX":CURRENT_LANG==="en"?"SFX Volume":"SFX Ses","nt_sfx_vol",0.8,0,1,(v)=>{window._nt_sfx_vol=v;});
        addSlider(CURRENT_LANG==="ru"?"Громкость музыки":CURRENT_LANG==="en"?"Music Volume":"Müzik Sesi","nt_music_vol",0.6,0,1,(v)=>{window._nt_music_vol=v;});
        addToggle(CURRENT_LANG==="ru"?"Звуковые эффекты":CURRENT_LANG==="en"?"Sound Effects":"Ses Efektleri","nt_sfx_on",true,(on)=>{window._nt_sfx_on=on;});
        addToggle(CURRENT_LANG==="ru"?"Музыка":CURRENT_LANG==="en"?"Music":"Müzik","nt_music_on",true,(on)=>{window._nt_music_on=on;});

        // ═ GÖRSEL ════════════════════════════════════════════
        addSection(CURRENT_LANG==="ru"?"── ГРАФИКА ──":CURRENT_LANG==="en"?"── VISUAL ──":"── GÖRSEL ──",0x44ff88);
        addToggle(CURRENT_LANG==="ru"?"Тряска экрана":CURRENT_LANG==="en"?"Screen Shake":"Ekran Sarsıntısı","nt_screen_shake",true,(on)=>{window._nt_screen_shake=on;});
        addToggle(CURRENT_LANG==="ru"?"Зум камеры":CURRENT_LANG==="en"?"Camera Zoom":"Kamera Zoom","nt_cam_zoom",true,(on)=>{window._nt_cam_zoom=on;});
        addSelect(CURRENT_LANG==="ru"?"Качество частиц":CURRENT_LANG==="en"?"Particles":"Parçacık Kalitesi","nt_particle_quality",
            [{val:"high",label:CURRENT_LANG==="ru"?"Высокое":CURRENT_LANG==="en"?"High":"Yüksek"},{val:"medium",label:CURRENT_LANG==="ru"?"Среднее":CURRENT_LANG==="en"?"Medium":"Orta"},{val:"low",label:CURRENT_LANG==="ru"?"Низкое":CURRENT_LANG==="en"?"Low":"Düşük"}],
            "high",(v)=>{_perfMode=v==="low"?"low":"high";});
        addToggle(CURRENT_LANG==="ru"?"Эффекты огня":CURRENT_LANG==="en"?"Flame FX":"Alev Efektleri","nt_flame_effects",true,(on)=>{window._nt_flame=on;});
        addToggle(CURRENT_LANG==="ru"?"Тени":CURRENT_LANG==="en"?"Shadows":"Gölgeler","nt_ground_shadows",true,(on)=>{window._nt_shadows=on;});

        // ═ OYUN ══════════════════════════════════════════════
        addSection(CURRENT_LANG==="ru"?"── ГЕЙМПЛЕЙ ──":CURRENT_LANG==="en"?"── GAMEPLAY ──":"── OYUN ──",0xffcc44);
        addToggle(CURRENT_LANG==="ru"?"Туториал":CURRENT_LANG==="en"?"Tutorial":"Perfect Hit Tutorialı","nt_tutorial_off_inv",true,(on)=>{
            localStorage.setItem("nt_tutorial_off",on?"0":"1");
            // Tutorial tekrar açıldığında gösterilmesi için shown flag'i sıfırla
            if(on) localStorage.removeItem("nt_tutorial_shown");
        });
        addSelect(CURRENT_LANG==="ru"?"Сложность":CURRENT_LANG==="en"?"Difficulty":"Zorluk","nt_difficulty",
            [{val:"easy",label:CURRENT_LANG==="ru"?"Легко":CURRENT_LANG==="en"?"Easy":"Kolay"},{val:"normal",label:CURRENT_LANG==="ru"?"Нормально":CURRENT_LANG==="en"?"Normal":"Normal"},{val:"hard",label:CURRENT_LANG==="ru"?"Сложно":CURRENT_LANG==="en"?"Hard":"Zor"}],
            "normal",(v)=>{window._nt_difficulty=v;});
        addToggle(CURRENT_LANG==="ru"?"Авто-пауза":CURRENT_LANG==="en"?"Auto Pause":"Otomatik Duraklat","nt_auto_pause",false,(on)=>{window._nt_auto_pause=on;});
        addToggle(CURRENT_LANG==="ru"?"Уведомления комбо":CURRENT_LANG==="en"?"Combo Notifs":"Combo Bildirimleri","nt_combo_notif",true,(on)=>{window._nt_combo_notif=on;});
        addToggle(CURRENT_LANG==="ru"?"Числа урона":CURRENT_LANG==="en"?"Damage Numbers":"Hasar Sayıları","nt_show_dmg",true,(on)=>{window._nt_dmg_nums=on;});

        // ═ ERİŞİLEBİLİRLİK ═══════════════════════════════════
        addSection(CURRENT_LANG==="ru"?"── ДОСТУПНОСТЬ ──":CURRENT_LANG==="en"?"── ACCESSIBILITY ──":"── ERİŞİLEBİLİRLİK ──",0xff8844);
        addToggle(CURRENT_LANG==="ru"?"Предупр. об эпилепсии":CURRENT_LANG==="en"?"Epilepsy Warning":"Epilepsi Uyarısı","nt_epilepsy_warn",true,(on)=>{});
        addSelect(CURRENT_LANG==="ru"?"Режим дальтоника":CURRENT_LANG==="en"?"Colorblind Mode":"Renk Körü Modu","nt_colorblind",
            [{val:"none",label:CURRENT_LANG==="ru"?"Нет":CURRENT_LANG==="en"?"None":"Yok"},{val:"deuter",label:"Deuteranopia"},{val:"protan",label:"Protanopia"}],
            "none",(v)=>{window._nt_colorblind=v;});

        // ═ HESAP ════════════════════════════════════════════
        cy+=6;
        addSection(CURRENT_LANG==="ru"?"── АККАУНТ ──":CURRENT_LANG==="en"?"── ACCOUNT ──":"── HESAP ──",0xaa44ff);
        const rBg=addS(S.add.graphics().setDepth(13));
        const rLbl=CURRENT_LANG==="ru"?"⚠  Сбросить все данные":CURRENT_LANG==="en"?"⚠  Reset All Data":"⚠  Tüm Verileri Sıfırla";
        const drawR=(h)=>{rBg.clear();rBg.fillStyle(h?0x550000:0x220000,1);rBg.fillRoundedRect(LBLX,cy,PW-28,28,6);rBg.lineStyle(1,h?0xff4444:0x882222,0.9);rBg.strokeRoundedRect(LBLX,cy,PW-28,28,6);};
        drawR(false);
        addS(S.add.text(PW/2-10,cy+14,rLbl,{font:"bold 9px 'Courier New'",color:"#ff6666",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(14));
        const rHit=addS(S.add.rectangle(PW/2-10,cy+14,PW-28,28,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(15));
        rHit.on("pointerover",()=>drawR(true)).on("pointerout",()=>drawR(false));
        rHit.on("pointerdown",()=>{
            const msg=CURRENT_LANG==="ru"?"Все данные будут удалены. Уверен?":CURRENT_LANG==="en"?"All progress will be deleted. Sure?":"Tüm veriler silinecek. Emin misin?";
            if(confirm(msg)){
                ["nt_gold","nt_crystal","nt_gems","nt_shop","nt_achievements","nt_lifetime","nt_highscore","nt_bestkills","nt_bestlv","nt_quests","nt_quests_done","nt_streak","nt_login"].forEach(k=>localStorage.removeItem(k));
                PLAYER_GOLD=0;PLAYER_CRYSTAL=0;PLAYER_GEMS=0;
                S.input.off("wheel"); S.scene.restart();
            }
        });
        cy+=36;

        maxScrollY=Math.max(0,cy-VISIBLE_H+12);

        // ── KAPAT — footer'da, her zaman görünür
        const cBg=addO(S.add.graphics().setDepth(20));
        const cLbl=CURRENT_LANG==="ru"?"✕  ЗАКРЫТЬ":CURRENT_LANG==="en"?"✕  CLOSE":"✕  KAPAT";
        const drawC=(h)=>{cBg.clear();cBg.fillStyle(h?0x881111:0x220000,1);cBg.fillRoundedRect(W/2-72,SCROLL_BTM+9,144,30,7);cBg.lineStyle(2,h?0xff5555:0xaa2222,0.9);cBg.strokeRoundedRect(W/2-72,SCROLL_BTM+9,144,30,7);};
        drawC(false);
        addO(S.add.text(W/2,SCROLL_BTM+24,cLbl,{font:"bold 12px 'Courier New'",color:"#ff7777",stroke:"#000",strokeThickness:3}).setOrigin(0.5).setDepth(21));
        const cHit=addO(S.add.rectangle(W/2,SCROLL_BTM+24,144,30,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(22));
        cHit.on("pointerover",()=>drawC(true)).on("pointerout",()=>drawC(false));
        cHit.on("pointerdown",()=>{
            S.input.off("wheel");
            objs.forEach(o=>{try{if(o.removeAllListeners)o.removeAllListeners();if(o.destroy)o.destroy();}catch(e){}});
            this._openPanel=null;
            // ── OYUNU DEVAM ETTİR ──
            if(_wasGameScene){
                try{ S.time.timeScale=1; }catch(e){}
                try{ S.physics.resume(); }catch(e){}
                if(S.spawnEvent) S.spawnEvent.paused=false;
            }
        });

        this._openPanel=objs;
    }

    // ── GÜNLÜK GÖREVLER ──────────────────────────────────────
    _openDailyQuests(){
        this._closePanel();
        const W=360,H=640;
        const objs=[];

        // Overlay
        const ov=this.add.rectangle(W/2,H/2,W,H,0x000000,0).setInteractive().setDepth(10); objs.push(ov); // input blocker
        this.tweens.add({targets:ov,fillAlpha:0.82,duration:280});
        const ov2=this.add.rectangle(W/2,H/2,W,H,0x110800,0).setDepth(10); objs.push(ov2);
        this.tweens.add({targets:ov2,fillAlpha:0.30,duration:300});

        // Panel arka plan (tam ekran)
        const pg=this.add.graphics().setDepth(11); objs.push(pg);
        pg.fillStyle(0x08000e,0.98); pg.fillRoundedRect(10,8,340,622,8);
        pg.lineStyle(2,0xff8800,0.9); pg.strokeRoundedRect(10,8,340,622,8);
        pg.lineStyle(1,0x552200,0.3); pg.strokeRoundedRect(14,12,332,614,6);
        pg.fillStyle(0xff8800,0.08); pg.fillRoundedRect(10,8,340,54,{tl:8,tr:8,bl:0,br:0});
        pg.setAlpha(0).setScale(0.94);
        this.tweens.add({targets:pg,alpha:1,scaleX:1,scaleY:1,duration:320,ease:"Back.easeOut",delay:40});

        // Başlık
        const ttl=this.add.text(W/2,22,L("dailyQuests"),{
            font:"bold 15px 'Courier New'",color:"#ff8800",
            stroke:"#000",strokeThickness:5,letterSpacing:2
        }).setOrigin(0.5).setDepth(12).setAlpha(0); objs.push(ttl);
        this.tweens.add({targets:ttl,alpha:1,duration:280,delay:180});

        // Streak göstergesi
        const savedStreak=JSON.parse(localStorage.getItem("nt_streak")||"{}");
        const streak=savedStreak.count||1;
        const streakBonus=Math.min(streak-1,4)*15;
        const streakColor=streak>=5?"#ff4400":streak>=3?"#ff8800":"#ffaa44";
        const streakTxt=this.add.text(W/2,40,
            "🔥 "+streak+" "+L("questStreak")+(streakBonus>0?" · +"+streakBonus+"% "+L("questStreakBonus"):""),{
            font:"bold 9px 'Courier New'",color:streakColor,stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(12).setAlpha(0); objs.push(streakTxt);
        this.tweens.add({targets:streakTxt,alpha:1,duration:280,delay:220});
        if(streak>1){
            this.tweens.add({targets:streakTxt,scaleX:1.08,scaleY:1.08,
                duration:700,yoyo:true,repeat:-1,ease:"Sine.easeInOut",delay:400});
        }

        // Geri sayım — sıradaki gün reset
        const _updateCountdown=()=>{
            const now=new Date();
            const midnight=new Date(now); midnight.setHours(24,0,0,0);
            const diff=Math.max(0,midnight-now);
            const hh=String(Math.floor(diff/3600000)).padStart(2,"0");
            const mm=String(Math.floor((diff%3600000)/60000)).padStart(2,"0");
            const ss=String(Math.floor((diff%60000)/1000)).padStart(2,"0");
            return L("questResetIn")+" "+hh+":"+mm+":"+ss;
        };
        const cdTxt=this.add.text(W/2,53,_updateCountdown(),{
            font:"bold 8px 'Courier New'",color:"#665533",stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(12).setAlpha(0); objs.push(cdTxt);
        this.tweens.add({targets:cdTxt,alpha:1,duration:280,delay:240});
        // Her saniye güncelle
        const cdTimer=this.time.addEvent({delay:1000,repeat:-1,
            callback:()=>{ try{ cdTxt.setText(_updateCountdown()); }catch(e){} }
        });
        this._panelTimer=cdTimer;  // _closePanel içinde temizlenir
        objs.push({destroy:()=>{ try{cdTimer.remove();}catch(e){} }});

        // Ayraç
        const divG=this.add.graphics().setDepth(12).setAlpha(0); objs.push(divG);
        divG.lineStyle(1,0x553300,0.6); divG.lineBetween(28,64,332,64);
        this.tweens.add({targets:divG,alpha:1,duration:280,delay:240});

        // ── Görevleri yükle ──────────────────────────────────────
        const savedQ=JSON.parse(localStorage.getItem("nt_quests")||"{}");
        const todayStr=new Date().toDateString();
        let activeQuests=[];

        if(savedQ.date===todayStr && savedQ.quests && savedQ.quests.length>0){
            activeQuests=savedQ.quests.map(id=>DAILY_QUESTS.find(q=>q.id===id)).filter(Boolean)
                .map(q=>({...q,progress:0,done:false}));
        }
        if(activeQuests.length===0){
            // Menüden ilk açılış — üret ve kaydet
            activeQuests=generateDailyQuests();
            localStorage.setItem("nt_quests",JSON.stringify({
                date:todayStr,quests:activeQuests.map(q=>q.id)
            }));
            localStorage.setItem("nt_quests_done",JSON.stringify({_date:todayStr}));
        }

        const doneMap=JSON.parse(localStorage.getItem("nt_quests_done")||"{}");

        // GS.activeQuests ile senkronize et (oyun içi progress)
        const gsQuests=(typeof GS!=="undefined"&&GS!==null&&GS.activeQuests)||[];
        activeQuests.forEach(q=>{
            const live=gsQuests.find(gq=>gq.id===q.id);
            if(live){ q.progress=live.progress||0; q.done=live.done||false; }
            if(doneMap[q.id]) q.done=true;
        });

        // Zorluk renkleri
        const diffColor={hard:0xff8800,vhard:0xff3344,extreme:0xcc00ff};
        const diffColorHex={hard:"#ff8800",vhard:"#ff3344",extreme:"#cc00ff"};
        const typeIcons={kills:"⚔️",combo:"🔥",time:"⏱",perfect:"🎯",goldcol:"💰",level:"⬆️",boss:"💀"};

        // ── SCROLL SİSTEMİ ──
        const CARD_H=82; const CARD_W=318; const CX=21;
        const CARD_GAP=6;
        const HEADER_H=70;
        const SCROLL_TOP=HEADER_H;
        const SCROLL_BTM=H-44;
        const VISIBLE_H=SCROLL_BTM-SCROLL_TOP;
        const TOTAL_H=activeQuests.length*(CARD_H+CARD_GAP);

        // Scroll kırpma maskesi için grafik
        const maskGfx=this.add.graphics().setDepth(-1).setVisible(false);
        maskGfx.fillStyle(0xffffff);
        maskGfx.fillRect(0,SCROLL_TOP,W,VISIBLE_H);
        const scrollMask=maskGfx.createGeometryMask();
        objs.push(maskGfx);

        // Scroll container — tüm kartlar buraya eklenecek
        const scrollCont=this.add.container(0,0).setDepth(12);
        scrollCont.setMask(scrollMask);
        objs.push(scrollCont);

        // Scroll state
        let scrollY=0;
        const maxScroll=Math.max(0,TOTAL_H-VISIBLE_H+8);

        // Scroll ok göstergeleri (içerik taşıyorsa)
        let arrowUp=null, arrowDn=null;
        if(maxScroll>0){
            arrowUp=this.add.text(W-22,SCROLL_TOP+6,"▲",{font:"bold 11px 'Courier New'",color:"#ff8800",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(16).setAlpha(0);
            arrowDn=this.add.text(W-22,SCROLL_BTM-8,"▼",{font:"bold 11px 'Courier New'",color:"#ff8800",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(16);
            objs.push(arrowUp,arrowDn);
            this.tweens.add({targets:arrowDn,alpha:0.4,duration:500,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
        }

        const updateArrows=()=>{
            if(!arrowUp||!arrowDn) return;
            arrowUp.setAlpha(scrollY>2?1:0);
            arrowDn.setAlpha(scrollY<maxScroll-2?1:0);
            if(scrollY>2) this.tweens.add({targets:arrowUp,alpha:0.4,duration:500,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
        };

        // Dokunmatik/mouse sürükleme
        let dragStartY=null, dragScrollStart=0;
        const scrollZone=this.add.rectangle(W/2,(SCROLL_TOP+SCROLL_BTM)/2,W,VISIBLE_H,0xffffff,0.001)
            .setInteractive({draggable:true}).setDepth(11);
        objs.push(scrollZone);
        scrollZone.on("dragstart",(p)=>{dragStartY=p.y;dragScrollStart=scrollY;});
        scrollZone.on("drag",(p,dx,dy)=>{
            scrollY=Phaser.Math.Clamp(dragScrollStart-(p.y-dragStartY),0,maxScroll);
            scrollCont.y=SCROLL_TOP-scrollY;
            updateArrows();
        });
        // Mouse wheel
        this.input.on("wheel",(p,objs2,dx,dy)=>{
            scrollY=Phaser.Math.Clamp(scrollY+dy*0.5,0,maxScroll);
            scrollCont.y=SCROLL_TOP-scrollY;
            updateArrows();
        });
        scrollCont.y=SCROLL_TOP;

        activeQuests.forEach((q,i)=>{
            const isDone=!!q.done;
            const qy=i*(CARD_H+CARD_GAP)+4;   // container içinde relatif koordinat
            const acc=diffColor[q.difficulty]||0xff8800;
            const accHex=diffColorHex[q.difficulty]||"#ff8800";

            // Kart — container'a ekle
            const cardG=this.add.graphics().setDepth(12).setAlpha(0);
            scrollCont.add(cardG);
            objs.push(cardG);
            this.tweens.add({targets:cardG,alpha:1,duration:220,delay:180+i*40});

            const drawCard=(hov)=>{
                cardG.clear();
                cardG.fillStyle(isDone?0x001a0a:0x0d0800,0.97);
                cardG.fillRoundedRect(CX,qy,CARD_W,CARD_H,6);
                cardG.fillStyle(acc,hov?0.10:0.04);
                cardG.fillRoundedRect(CX,qy,CARD_W,CARD_H,6);
                // Sol kenar bar — zorluk rengi
                cardG.fillStyle(acc,isDone?1.0:0.75);
                cardG.fillRoundedRect(CX,qy,4,CARD_H,{tl:6,tr:0,bl:6,br:0});
                // Kenarlık
                cardG.lineStyle(isDone?1.5:1,acc,isDone?0.8:0.4);
                cardG.strokeRoundedRect(CX,qy,CARD_W,CARD_H,6);
            };
            drawCard(false);

            // Görev adı — büyük, net
            const qText=LLang(q,"text","textEN","textRU");
            const qTxt=this.add.text(CX+10,qy+6,qText,{
                font:"bold 11px 'Courier New'",
                color:isDone?"#66ff99":"#ffffff",
                stroke:"#000000",strokeThickness:3,
                wordWrap:{width:CARD_W-90}
            }).setDepth(13).setAlpha(0); scrollCont.add(qTxt); objs.push(qTxt);
            this.tweens.add({targets:qTxt,alpha:1,duration:220,delay:200+i*40});

            // Zorluk + tip badge — sağ üst
            const _diffLabelKey={hard:"questHard",vhard:"questHard2",extreme:"questHard3"}[q.difficulty]||"questHard";
            const diffLabel=L(_diffLabelKey);
            const badgeTxt=this.add.text(CX+CARD_W-8,qy+6,
                (typeIcons[q.type]||"📋")+" "+diffLabel,{
                font:"bold 8px 'Courier New'",color:accHex,stroke:"#000000",strokeThickness:2
            }).setOrigin(1,0).setDepth(13).setAlpha(0); scrollCont.add(badgeTxt); objs.push(badgeTxt);
            this.tweens.add({targets:badgeTxt,alpha:1,duration:220,delay:200+i*40});

            // Ödül satırı — net görünür
            const rewardStr="💰 +"+q.reward.gold+" Altın"+(q.reward.xpBonus?" · 📈 XP Bonus":"");
            const rwTxt=this.add.text(CX+10,qy+24,rewardStr,{
                font:"bold 9px 'Courier New'",color:isDone?"#44ff88":"#ffcc44",
                stroke:"#000000",strokeThickness:2
            }).setDepth(13).setAlpha(0); scrollCont.add(rwTxt); objs.push(rwTxt);
            this.tweens.add({targets:rwTxt,alpha:1,duration:220,delay:210+i*40});

            // Progress bar
            const BAR_W=isDone?CARD_W-20:CARD_W-110; const BAR_X=CX+10; const BAR_Y=qy+40; const BAR_H=8;
            const barBg=this.add.graphics().setDepth(13).setAlpha(0); scrollCont.add(barBg); objs.push(barBg);
            barBg.fillStyle(acc,0.12); barBg.fillRoundedRect(BAR_X,BAR_Y,BAR_W,BAR_H,4);
            barBg.lineStyle(1,acc,0.3); barBg.strokeRoundedRect(BAR_X,BAR_Y,BAR_W,BAR_H,4);
            this.tweens.add({targets:barBg,alpha:1,duration:220,delay:220+i*40});

            // Progress dolgu
            const ratio=Math.min(1,isDone?1:(q.progress/q.target));
            if(ratio>0){
                const barFill=this.add.graphics().setDepth(14).setAlpha(0); scrollCont.add(barFill); objs.push(barFill);
                barFill.fillStyle(acc,0.85);
                barFill.fillRoundedRect(BAR_X,BAR_Y,Math.floor(BAR_W*ratio),BAR_H,4);
                barFill.fillStyle(0xffffff,0.25);
                barFill.fillRoundedRect(BAR_X,BAR_Y,Math.floor(BAR_W*ratio),3,{tl:4,tr:4,bl:0,br:0});
                this.tweens.add({targets:barFill,alpha:1,duration:320,delay:240+i*40});
            }

            // Progress sayısı
            const progressVal=isDone?("✓ "+L("questDone")):(q.progress+" / "+q.target);
            const pTxt=this.add.text(BAR_X,qy+54,progressVal,{
                font:"bold 8px 'Courier New'",
                color:isDone?"#44ff88":"#998855",stroke:"#000000",strokeThickness:2
            }).setDepth(13).setAlpha(0); scrollCont.add(pTxt); objs.push(pTxt);
            this.tweens.add({targets:pTxt,alpha:1,duration:220,delay:230+i*40});

            // Tamamlandıysa — ödül alma / "alındı" durumu
            if(isDone){
                const canClaim=!doneMap[q.id+"_claimed"];
                if(canClaim){
                    const BTN_W=80; const BTN_H=22; const BTN_X=CX+CARD_W-BTN_W-6; const BTN_Y=qy+CARD_H-BTN_H-4;
                    const claimBtnG=this.add.graphics().setDepth(13).setAlpha(0); scrollCont.add(claimBtnG); objs.push(claimBtnG);
                    const drawClaim=(hov)=>{
                        claimBtnG.clear();
                        claimBtnG.fillStyle(hov?0x66ffaa:0x228844,1);
                        claimBtnG.fillRoundedRect(BTN_X,BTN_Y,BTN_W,BTN_H,6);
                        claimBtnG.fillStyle(0xffffff,hov?0.15:0.07);
                        claimBtnG.fillRoundedRect(BTN_X,BTN_Y,BTN_W,8,{tl:6,tr:6,bl:0,br:0});
                        claimBtnG.lineStyle(2,0x66ffaa,hov?1:0.75);
                        claimBtnG.strokeRoundedRect(BTN_X,BTN_Y,BTN_W,BTN_H,6);
                    };
                    drawClaim(false);
                    this.tweens.add({targets:claimBtnG,alpha:1,duration:220,delay:250+i*40});

                    const claimLbl=this.add.text(BTN_X+BTN_W/2,BTN_Y+BTN_H/2,
                        L("questClaim"),{
                        font:"bold 9px 'Courier New'",color:"#ffffff",stroke:"#002200",strokeThickness:3
                    }).setOrigin(0.5).setDepth(14).setAlpha(0); scrollCont.add(claimLbl); objs.push(claimLbl);
                    this.tweens.add({targets:claimLbl,alpha:1,duration:220,delay:260+i*40});

                    const claimHit=this.add.rectangle(BTN_X+BTN_W/2,BTN_Y+BTN_H/2,BTN_W+6,BTN_H+6,0xffffff,0.001)
                        .setInteractive({useHandCursor:true}).setDepth(18); scrollCont.add(claimHit); objs.push(claimHit);
                    claimHit.on("pointerover",()=>drawClaim(true));
                    claimHit.on("pointerout",()=>drawClaim(false));
                    claimHit.on("pointerdown",()=>{
                        doneMap[q.id+"_claimed"]=true;
                        localStorage.setItem("nt_quests_done",JSON.stringify(doneMap));
                        PLAYER_GOLD+=q.reward.gold;
                        localStorage.setItem("nt_gold",PLAYER_GOLD);
                        if(this._goldDisp) this._goldDisp.setText("💰 "+PLAYER_GOLD);
                        // Altın parçacık efekti
                        for(let gi=0;gi<16;gi++){
                            this.time.delayedCall(gi*30,()=>{
                                const gx=BTN_X+Phaser.Math.Between(5,BTN_W-5);
                                const gg=this.add.graphics().setDepth(500);
                                gg.lineStyle(1.5,[0xffcc00,0xffee44,0xffffff][gi%3],0.9);
                                gg.lineBetween(gx,BTN_Y,gx+Phaser.Math.Between(-3,3),BTN_Y-3);
                                this.tweens.add({targets:gg,
                                    y:gg.y-Phaser.Math.Between(35,70),
                                    x:gg.x+Phaser.Math.Between(-20,20),
                                    alpha:0,duration:Phaser.Math.Between(400,750),
                                    ease:"Quad.easeOut",onComplete:()=>gg.destroy()});
                            });
                        }
                        /* flash removed */
                        claimHit.removeAllListeners();
                        this.time.delayedCall(600,()=>{
                            objs.forEach(o=>{try{o.destroy();}catch(e){}});
                            this._openPanel=null;
                            this._openDailyQuests();
                        });
                    });
                } else {
                    const claimedTxt=this.add.text(CX+CARD_W-8,qy+50,L("questClaimed"),{
                        font:"bold 8px 'Courier New'",color:"#44aa66",stroke:"#000",strokeThickness:2
                    }).setOrigin(1,1).setDepth(13).setAlpha(0); scrollCont.add(claimedTxt); objs.push(claimedTxt);
                    this.tweens.add({targets:claimedTxt,alpha:1,duration:220,delay:250+i*40});
                }
                // Pulse animasyonu — tamamlanan kart
                this.tweens.add({targets:cardG,alpha:0.85,duration:900,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
            } else {
                const noteTxt=this.add.text(CX+CARD_W-8,qy+50,L("questInProgress"),{
                    font:"bold 7px 'Courier New'",color:"#554422",stroke:"#000",strokeThickness:2
                }).setOrigin(1,1).setDepth(13).setAlpha(0); scrollCont.add(noteTxt); objs.push(noteTxt);
                this.tweens.add({targets:noteTxt,alpha:1,duration:220,delay:250+i*40});
            }
        });

        // Kapat butonu
        objs.push(...this._closeBtn(W/2,H-10,objs));
        this._openPanel=objs;
    }

    _openLeaderboard(){
        this._closePanel();
        const W=360,H=640,S=this;
        const objs=[];
        const addO=o=>{objs.push(o);return o;};

        // Overlay
        addO(this.add.rectangle(W/2,H/2,W,H,0x000000,0.88).setInteractive().setDepth(10));
        const pg=addO(this.add.graphics().setDepth(11));
        pg.fillStyle(0x03000a,0.99); pg.fillRoundedRect(8,6,344,628,10);
        pg.lineStyle(2,0xffcc00,0.7); pg.strokeRoundedRect(8,6,344,628,10);
        pg.fillStyle(0xffcc00,0.08); pg.fillRoundedRect(8,6,344,36,{tl:10,tr:10,bl:0,br:0});

        addO(this.add.text(W/2,24,L("lbTitle"),{font:"bold 14px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:4}).setOrigin(0.5).setDepth(12));

        // Oyuncu bilgisi — Telegram username
        const myName = _TG_USER.name;
        addO(this.add.text(W/2,44,"👤 "+myName,{font:"bold 9px 'Courier New'",color:"#aabbcc",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(12));

        // Sütun başlıkları
        const hg=addO(this.add.graphics().setDepth(11));
        hg.fillStyle(0xffcc00,0.12); hg.fillRect(10,52,340,16);
        hg.lineStyle(1,0xffcc00,0.3); hg.strokeRect(10,52,340,16);
        addO(this.add.text(22,60,L("lbRank"),{font:"bold 8px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5).setDepth(12));
        addO(this.add.text(68,60,L("lbPlayer"),{font:"bold 8px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5).setDepth(12));
        addO(this.add.text(338,60,L("lbScore"),{font:"bold 8px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:2}).setOrigin(1,0.5).setDepth(12));

        // Loading göstergesi
        const loadTxt=addO(this.add.text(W/2,300,L("lbLoading"),{font:"bold 10px 'Courier New'",color:"#888888",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(12));

        // Kendi en iyi skoru
        const myBest=parseInt(localStorage.getItem("nt_lb_personal_best")||"0");
        const myBestLv=parseInt(localStorage.getItem("nt_bestlv")||"0");
        const myBestKills=parseInt(localStorage.getItem("nt_bestkills")||"0");
        const statG=addO(this.add.graphics().setDepth(11));
        statG.fillStyle(0x223300,0.8); statG.fillRoundedRect(10,590,148,36,6);
        statG.lineStyle(1,0x44aa22,0.6); statG.strokeRoundedRect(10,590,148,36,6);
        addO(this.add.text(84,597,"🏆 "+L("highscore"),{font:"bold 7px 'Courier New'",color:"#88cc44",stroke:"#000",strokeThickness:2}).setOrigin(0.5,0).setDepth(12));
        addO(this.add.text(84,609,myBest.toLocaleString(),{font:"bold 11px 'Courier New'",color:"#aaffaa",stroke:"#000",strokeThickness:3}).setOrigin(0.5,0).setDepth(12));

        const statG2=addO(this.add.graphics().setDepth(11));
        statG2.fillStyle(0x002233,0.8); statG2.fillRoundedRect(164,590,88,36,6);
        statG2.lineStyle(1,0x2266aa,0.6); statG2.strokeRoundedRect(164,590,88,36,6);
        addO(this.add.text(208,597,"Lv "+myBestLv,{font:"bold 9px 'Courier New'",color:"#88aaff",stroke:"#000",strokeThickness:2}).setOrigin(0.5,0).setDepth(12));
        addO(this.add.text(208,609,"☠ "+myBestKills,{font:"bold 9px 'Courier New'",color:"#ff9977",stroke:"#000",strokeThickness:2}).setOrigin(0.5,0).setDepth(12));

        // Kapat butonu
        const closeBg=addO(this.add.graphics().setDepth(11));
        const drawClose=h=>{closeBg.clear();closeBg.fillStyle(h?0x553300:0x221100,1);closeBg.fillRoundedRect(258,590,90,36,6);closeBg.lineStyle(1.5,h?0xffaa44:0xaa5522,0.9);closeBg.strokeRoundedRect(258,590,90,36,6);};
        drawClose(false);
        addO(this.add.text(303,608,L("close"),{font:"bold 9px 'Courier New'",color:"#ffcc88",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(12));
        addO(this.add.rectangle(303,608,90,36,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(13))
            .on("pointerover",()=>drawClose(true)).on("pointerout",()=>drawClose(false))
            .on("pointerdown",()=>{objs.forEach(o=>{try{o.destroy();}catch(e){}});S._openPanel=null;});

        this._openPanel=objs;

        // Skoru async yükle ve listele
        const _myId=_TG_USER.id||0;
        const _renderScores=(scores)=>{
            try{loadTxt.destroy();}catch(e){}
            if(!scores||scores.length===0){
                addO(S.add.text(W/2,300,L("lbEmpty"),{font:"bold 10px 'Courier New'",color:"#666666",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(12));
                return;
            }
            const VISIBLE=22; // Ekranda gösterilecek max satır
            const rowH=24;
            const startY=72;
            scores.slice(0,VISIBLE).forEach((entry,i)=>{
                const ry=startY+i*rowH;
                const isMe=(entry.id&&entry.id===_myId)||(entry.name===myName);
                const rowG=addO(S.add.graphics().setDepth(11));
                if(isMe){ rowG.fillStyle(0x334400,0.7); rowG.fillRect(10,ry,340,rowH-2); }
                else if(i%2===0){ rowG.fillStyle(0x111122,0.4); rowG.fillRect(10,ry,340,rowH-2); }

                // Rank rengi
                const rankCol=i===0?"#ffcc00":i===1?"#cccccc":i===2?"#cc8844":"#556677";
                const rankStr=i===0?"🥇":i===1?"🥈":i===2?"🥉":"#"+(i+1);
                addO(S.add.text(22,ry+rowH/2,rankStr,{font:"bold 8px 'Courier New'",color:rankCol,stroke:"#000",strokeThickness:2}).setOrigin(0,0.5).setDepth(12));

                // İsim (uzunsa kes)
                let nameStr=entry.name||"?";
                if(nameStr.length>16) nameStr=nameStr.substring(0,15)+"…";
                if(isMe) nameStr+=" "+L("lbYou");
                addO(S.add.text(68,ry+rowH/2,nameStr,{font:"bold 8px 'Courier New'",color:isMe?"#aaff66":"#aabbcc",stroke:"#000",strokeThickness:2}).setOrigin(0,0.5).setDepth(12));

                // Skor
                addO(S.add.text(338,ry+rowH/2,(entry.score||0).toLocaleString(),{font:"bold 9px 'Courier New'",color:isMe?"#aaff66":"#ffffff",stroke:"#000",strokeThickness:3}).setOrigin(1,0.5).setDepth(12));

                // Level küçük
                if(entry.level){
                    addO(S.add.text(310,ry+rowH/2,"Lv"+entry.level,{font:"7px 'Courier New'",color:"#666688",stroke:"#000",strokeThickness:1}).setOrigin(1,0.5).setDepth(12));
                }
            });
        };

        // Önce local cache ile hızlıca göster
        const immediate=lbGetMergedScores();
        if(immediate.length>0) _renderScores(immediate);

        // Sonra fetch et, güncelle
        lbFetchScores().then(()=>{
            // Mevcut satırları temizle (loadTxt hariç zaten temizlendi)
            const fresh=lbGetMergedScores();
            if(fresh.length>0){
                // Tüm row objeleri yeniden render etmek yerine mevcut olanı temizleyip yeniden çiz
                // (panel hâlâ açıksa)
                if(S._openPanel===objs) _renderScores(fresh);
            }
        }).catch(()=>{
            try{loadTxt.setText(L("lbError"));}catch(e){}
        });
    }

    _openCredits(){
        this._closePanel();
        const W=360,H=640;
        const objs=[];
        // [UI POLISH] Overlay fade-in, koyu altın-siyah tema
        const ov=this.add.rectangle(W/2,H/2,W,H,0x000000,0).setInteractive().setDepth(10); objs.push(ov); // input blocker
        this.tweens.add({targets:ov,fillAlpha:0.72,duration:280});
        const ov2=this.add.rectangle(W/2,H/2,W,H,0x110800,0).setDepth(10); objs.push(ov2);
        this.tweens.add({targets:ov2,fillAlpha:0.28,duration:300});
        const pg=this.add.graphics().setDepth(11);
        // [UI POLISH P2] Kredi paneli: gri yerine koyu + altın border
        pg.fillStyle(0x080010,0.98); pg.fillRoundedRect(38,218,284,200,8);
        pg.lineStyle(2,0xffcc00,0.6); pg.strokeRoundedRect(38,218,284,200,8);
        pg.fillStyle(0xffcc00,0.08); pg.fillRoundedRect(38,218,284,36,{tl:8,tr:8,bl:0,br:0});
        objs.push(pg);
        // [UI POLISH P6] Kredi başlığı + içerik — koyu temaya uygun renkler
        const credTitle=this.add.text(W/2,238,L("creditsTitle"),{
            font:"bold 14px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:4,letterSpacing:3
        }).setOrigin(0.5).setDepth(12).setAlpha(0);
        this.tweens.add({targets:credTitle,alpha:1,duration:250,delay:150});
        objs.push(credTitle);

        const divG=this.add.graphics().setDepth(12).setAlpha(0);
        divG.lineStyle(1,0xffcc00,0.3); divG.lineBetween(58,258,W-58,258);
        this.tweens.add({targets:divG,alpha:1,duration:200,delay:200});
        objs.push(divG);

        [
            [L("creditsBy"),"bold 8px","#888866",2],
            ["Şahin Beyazgül","bold 16px","#ffffff",3],
            ["","8px","#000000",0],
            ["Not Today","bold 11px","#ffcc44",1],
            ["Phaser 3  /  HTML5","9px","#667755",1]
        ].forEach(([t,f,c,sp],i)=>{
            if(!t) return;
            const yt=270+i*30;
            const cr=this.add.text(W/2,yt,t,{
                font:f+" 'Courier New'",color:c,letterSpacing:sp
            }).setOrigin(0.5).setDepth(12).setAlpha(0);
            this.tweens.add({targets:cr,alpha:1,duration:220,delay:180+i*55});
            objs.push(cr);
        });
        objs.push(...this._closeBtn(W/2,400,objs));
        this._openPanel=objs;
    }

    // ── KAPATMA BUTONU ────────────────────────────────────────
    // [UI POLISH P5] _closeBtn — rounded, animasyonlu, scale efekti
    _closeBtn(x,y,objsToDestroy,customFn){
        const bg=this.add.graphics().setDepth(12);
        const draw=hov=>{
            bg.clear();
            bg.fillStyle(hov?0x881111:0x220000,1);
            bg.fillRoundedRect(x-65,y-14,130,28,6);
            bg.lineStyle(2,hov?0xff5555:0xaa2222,hov?0.9:0.7);
            bg.strokeRoundedRect(x-65,y-14,130,28,6);
            if(hov){bg.fillStyle(0xffffff,0.07);bg.fillRoundedRect(x-63,y-12,126,10,5);}
        };
        draw(false);
        const txt=this.add.text(x,y,"✕  "+L("close"),{
            font:"bold 11px 'Courier New'",color:"#ff7777",stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(13);
        const hit=this.add.rectangle(x,y,130,28,0xffffff,0.001).setInteractive().setDepth(14);
        hit.on("pointerover",()=>{draw(true);txt.setColor("#ffffff");});
        hit.on("pointerout",()=>{draw(false);txt.setColor("#ff7777");});
        hit.on("pointerdown",()=>{
            // [P5] Click micro-scale
            this.tweens.add({targets:[bg,txt],scaleX:0.94,scaleY:0.94,duration:60,yoyo:true,ease:"Quad.easeOut"});
            this.time.delayedCall(80,()=>{
                if(customFn){ customFn(); return; }
                if(objsToDestroy) objsToDestroy.forEach(o=>{try{o.destroy();}catch(e){}});
                this._openPanel=null;
            });
        });
        return [bg,txt,hit];
    }

    _closePanel(){
        if(!this._openPanel) return;
        try{this.input.off("wheel");}catch(e){}
        try{
            const panel=this._openPanel;
            // Yeni format: {_closeFn} objesi
            if(panel&&typeof panel._closeFn==="function"){
                panel._closeFn();
                return;
            }
            // Eski format: array
            const items=panel;
            const flat=Array.isArray(items)?items.flat(Infinity):[items];
            flat.forEach(o=>{
                if(!o) return;
                try{
                    if(typeof o.disableInteractive==="function") o.disableInteractive();
                    if(o.removeAllListeners) o.removeAllListeners();
                    if(this.tweens) this.tweens.killTweensOf(o);
                    if(o.mask){try{o.mask.destroy();}catch(e){}}
                    if(typeof o.destroy==="function") o.destroy();
                }catch(e){}
            });
        }catch(e){}
        this._openPanel=null;
        if(this._panelTimer){
            try{this._panelTimer.remove();}catch(e){}
            this._panelTimer=null;
        }
    }

    // ── LOGIN REWARD POPUP ────────────────────────────────────
    _showLoginReward({reward, streak, dayIdx}){
        const W=360,H=640;
        const objs=[];
        const addO=o=>{objs.push(o);return o;};

        const ov=addO(this.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(800));
        this.tweens.add({targets:ov,fillAlpha:0.75,duration:250});

        const pg=addO(this.add.graphics().setDepth(801));
        pg.fillStyle(0x07030f,0.98); pg.fillRoundedRect(50,160,260,280,12);
        pg.lineStyle(2,0xffcc00,0.9); pg.strokeRoundedRect(50,160,260,280,12);
        pg.fillStyle(0xffcc00,0.12); pg.fillRoundedRect(50,160,260,44,{tl:12,tr:12,bl:0,br:0});

        addO(this.add.text(W/2,182,"🎁 GÜNLÜK ÖDÜL",{font:"bold 13px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:4,letterSpacing:2}).setOrigin(0.5).setDepth(802));
        addO(this.add.text(W/2,206,streak+" GÜN STREAK!",{font:"bold 10px 'Courier New'",color:"#ffaa44",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(802));

        // Reward display — 7 gün göster
        LOGIN_REWARDS.forEach((r,i)=>{
            const col=Math.floor(i/4), row=i%4;
            const bx=70+col*130, by=222+row*38;
            const isToday=i===dayIdx;
            const isPast=i<dayIdx;
            const dg=addO(this.add.graphics().setDepth(802));
            dg.fillStyle(isPast?0x224422:isToday?0xffcc00:0x111122,isPast?0.6:isToday?0.25:0.4);
            dg.fillRoundedRect(bx,by,120,32,5);
            dg.lineStyle(1.5,isPast?0x44aa44:isToday?0xffcc00:0x333355,0.9);
            dg.strokeRoundedRect(bx,by,120,32,5);
            const lCol=isPast?"#44aa44":isToday?"#ffcc00":"#555577";
            addO(this.add.text(bx+60,by+16,`${r.icon} ${r.label}: +${r.gold}⬡`,
                {font:`bold ${isToday?"9":"8"}px 'Courier New'`,color:lCol,stroke:"#000",strokeThickness:2})
                .setOrigin(0.5).setDepth(803));
        });

        // Büyük ödül göster
        const bigR=addO(this.add.text(W/2,376,`+${reward.gold} ⬡`,
            {font:"bold 24px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:5})
            .setOrigin(0.5).setDepth(803).setAlpha(0));
        this.tweens.add({targets:bigR,alpha:1,scaleX:1.2,scaleY:1.2,duration:300,ease:"Back.easeOut"});
        this.tweens.add({targets:bigR,scaleX:1,scaleY:1,duration:200,delay:300});

        // Kapat butonu
        const clG=addO(this.add.graphics().setDepth(802));
        const drawCl=(hov)=>{clG.clear();clG.fillStyle(hov?0xffaa00:0xcc8800,1);clG.fillRoundedRect(W/2-70,404,140,34,7);clG.lineStyle(2,0xffdd44,0.9);clG.strokeRoundedRect(W/2-70,404,140,34,7);};
        drawCl(false);
        addO(this.add.text(W/2,421,"ÖDÜLÜ AL!",{font:"bold 12px 'Courier New'",color:"#fff",stroke:"#000",strokeThickness:3}).setOrigin(0.5).setDepth(803));
        addO(this.add.rectangle(W/2,421,140,34,0xffffff,0.001).setInteractive().setDepth(804))
            .on("pointerover",()=>drawCl(true)).on("pointerout",()=>drawCl(false))
            .on("pointerdown",()=>{
                objs.forEach(o=>{try{if(typeof o.disableInteractive==="function")o.disableInteractive();o.destroy();}catch(e){}});
                this._openPanel=null;
                if(this._goldDisp) this._goldDisp.setText("💰 "+PLAYER_GOLD);
            });
        // [BUG FIX] _openPanel'a kayıt et — diğer panel açılınca temizlenebilsin
        this._openPanel=objs;
    }

    // ── ACHIEVEMENTS PANEL ────────────────────────────────────
    _openAchievements(){
        this._closePanel();
        const W=360,H=640,objs=[];
        const state=getAchievementState();
        const lifeStats=getLifetimeStats();

        const ov=this.add.rectangle(W/2,H/2,W,H,0x000000,0.90).setInteractive().setDepth(10); objs.push(ov); // input blocker
        const pg=this.add.graphics().setDepth(11); objs.push(pg);
        pg.fillStyle(0x070500,1); pg.fillRoundedRect(6,6,348,628,10);
        pg.lineStyle(2.5,0xffcc00,1); pg.strokeRoundedRect(6,6,348,628,10);
        pg.fillStyle(0xffcc00,0.10); pg.fillRoundedRect(6,6,348,42,{tl:10,tr:10,bl:0,br:0});

        objs.push(this.add.text(W/2,24,CURRENT_LANG==="ru"?"🏆 ДОСТИЖЕНИЯ":CURRENT_LANG==="en"?"🏆 ACHIEVEMENTS":"🏆 BAŞARIMLAR",{
            font:"bold 15px 'Courier New'",color:"#ffcc00",stroke:"#000000",strokeThickness:5,letterSpacing:3
        }).setOrigin(0.5).setDepth(12));

        // Toplam kazanılabilir altın
        let totalGold=0;
        ACHIEVEMENTS.forEach(ach=>{const s=state[ach.id];if(s&&s.unlocked&&!s.claimed)totalGold+=ach.gold;});
        if(totalGold>0){
            const tg=this.add.graphics().setDepth(12); objs.push(tg);
            tg.fillStyle(0x332200,1); tg.fillRoundedRect(W/2-80,46,160,22,5);
            tg.lineStyle(1.5,0xffaa00,0.8); tg.strokeRoundedRect(W/2-80,46,160,22,5);
            objs.push(this.add.text(W/2,57,"💰 "+totalGold+" "+(CURRENT_LANG==="ru"?"ДОСТУПНО ЗОЛОТА":CURRENT_LANG==="en"?"GOLD AVAILABLE":"ALINABİLİR ALTIN"),{
                font:"bold 9px 'Courier New'",color:"#ffcc44",stroke:"#000",strokeThickness:2
            }).setOrigin(0.5).setDepth(13));
        }

        const SCROLL_TOP=74,SCROLL_BTM=H-42,VISIBLE_H=SCROLL_BTM-SCROLL_TOP;
        const maskGfx=this.add.graphics().setDepth(-1).setVisible(false);
        maskGfx.fillStyle(0xffffff); maskGfx.fillRect(6,SCROLL_TOP,348,VISIBLE_H);
        const mask=maskGfx.createGeometryMask();
        objs.push(maskGfx);
        const cont=this.add.container(0,SCROLL_TOP).setDepth(12);
        cont.setMask(mask);
        objs.push(cont);
        const ITEM_H=58;
        let scrollY=0;
        const maxScroll=Math.max(0,ACHIEVEMENTS.length*ITEM_H-VISIBLE_H+8);

        ACHIEVEMENTS.forEach((ach,i)=>{
            const s=state[ach.id];
            const unlocked=s&&s.unlocked;
            const claimed=s&&s.claimed;
            const iy=i*ITEM_H+2;
            const eg=this.add.graphics().setDepth(12);
            eg.fillStyle(unlocked?0x1a1200:0x0a0a0e,1);
            eg.fillRoundedRect(10,iy,334,52,7);
            eg.lineStyle(2,unlocked?0xffcc00:0x333355,unlocked?0.85:0.4);
            eg.strokeRoundedRect(10,iy,334,52,7);
            if(unlocked){eg.fillStyle(0xffcc00,0.07);eg.fillRoundedRect(10,iy,334,52,7);}
            // Renk çubuğu
            eg.fillStyle(unlocked?0xffcc00:0x333355,(unlocked?0.8:0.3));
            eg.fillRoundedRect(10,iy,4,52,{tl:7,tr:0,bl:7,br:0});
            cont.add(eg);

            // İkon circle
            const iconG=this.add.graphics().setDepth(13);
            iconG.fillStyle(unlocked?0xffcc00:0x333355,unlocked?0.25:0.12);
            iconG.fillCircle(38,iy+26,18);
            iconG.lineStyle(2,unlocked?0xffcc00:0x445566,unlocked?0.8:0.35);
            iconG.strokeCircle(38,iy+26,18);
            cont.add(iconG);
            const iconT=this.add.text(38,iy+26,ach.icon,{font:"14px 'Courier New'"}).setOrigin(0.5).setDepth(14);
            cont.add(iconT);

            // Ad
            const showName=(ach.hidden&&!unlocked)?(CURRENT_LANG==="ru"?"❓ СКРЫТОЕ ДОСТИЖЕНИЕ":CURRENT_LANG==="en"?"❓ HIDDEN ACHIEVEMENT":"❓ GİZLİ BAŞARIM"):
                (CURRENT_LANG==="ru"?(ach.descRU||ach.desc):CURRENT_LANG==="en"?(ach.descEN||ach.desc):ach.desc);
            const nameT=this.add.text(64,iy+10,showName,{
                font:`bold ${unlocked?"11":"10"}px 'Courier New'`,
                color:unlocked?"#ffdd44":"#556677",
                stroke:"#000000",strokeThickness:unlocked?4:2,
                wordWrap:{width:220}
            }).setDepth(14);
            cont.add(nameT);

            // Altın ödülü
            const goldT=this.add.text(64,iy+32,"💰 +"+ach.gold+" Altın",{
                font:"bold 9px 'Courier New'",color:unlocked?"#ffaa44":"#334455",
                stroke:"#000000",strokeThickness:2
            }).setDepth(14);
            cont.add(goldT);

            if(unlocked&&!claimed){
                // AL butonu
                const cg=this.add.graphics().setDepth(13);
                const drawC=(hov)=>{
                    cg.clear();
                    cg.fillStyle(hov?0x55ee88:0x33aa55,1);
                    cg.fillRoundedRect(256,iy+12,74,30,6);
                    cg.fillStyle(0xffffff,hov?0.12:0.06);
                    cg.fillRoundedRect(256,iy+12,74,10,{tl:6,tr:6,bl:0,br:0});
                    cg.lineStyle(1.5,0x66ffaa,hov?1:0.8);
                    cg.strokeRoundedRect(256,iy+12,74,30,6);
                };
                drawC(false);
                cont.add(cg);
                const ct=this.add.text(293,iy+27,(CURRENT_LANG==="en"?"GET ":CURRENT_LANG==="ru"?"ВЗЯТЬ ":"AL ")+"+"+ach.gold+"⬡",{
                    font:"bold 9px 'Courier New'",color:"#ffffff",stroke:"#000000",strokeThickness:3
                }).setOrigin(0.5).setDepth(14);
                cont.add(ct);
                const ch=this.add.rectangle(293,iy+27,74,30,0xffffff,0.001).setInteractive({useHandCursor:true}).setDepth(15);
                cont.add(ch);
                ch.on("pointerover",()=>drawC(true)).on("pointerout",()=>drawC(false));
                ch.on("pointerdown",()=>{
                    PLAYER_GOLD+=ach.gold; localStorage.setItem("nt_gold",PLAYER_GOLD);
                    const ns={...getAchievementState()};
                    ns[ach.id]={unlocked:true,claimed:true};
                    localStorage.setItem("nt_achievements",JSON.stringify(ns));
                    if(this._goldDisp) this._goldDisp.setText("💰 "+PLAYER_GOLD);
                    // Flash effect
                    for(let gi=0;gi<10;gi++){
                        this.time.delayedCall(gi*25,()=>{
                            const gfx=this.add.graphics().setDepth(600);
                            const _gx=256+Phaser.Math.Between(0,74);
                            const _gy=SCROLL_TOP+iy-scrollY+Phaser.Math.Between(0,30);
                            gfx.lineStyle(1.5,[0xffcc00,0xffee44,0xffffff][gi%3],0.9);
                            gfx.lineBetween(_gx,_gy,_gx+Phaser.Math.Between(-2,2),_gy-3);
                            this.tweens.add({targets:gfx,y:gfx.y-Phaser.Math.Between(20,50),alpha:0,duration:400,ease:"Quad.easeOut",onComplete:()=>gfx.destroy()});
                        });
                    }
                    this.time.delayedCall(300,()=>{
                        objs.forEach(o=>{try{if(typeof o.disableInteractive==="function")o.disableInteractive();if(typeof o.destroy==="function")o.destroy();}catch(e){}});
                        this._openPanel=null;
                        this._openAchievements();
                    });
                });
            } else if(claimed){
                const claimedT=this.add.text(293,iy+27,CURRENT_LANG==="en"?"✓ CLAIMED":CURRENT_LANG==="ru"?"✓ ПОЛУЧЕНО":"✓ ALINDI",{
                    font:"bold 9px 'Courier New'",color:"#44ff88",stroke:"#000000",strokeThickness:2
                }).setOrigin(0.5).setDepth(14);
                cont.add(claimedT);
            } else if(!unlocked){
                // İlerleme göstergesi
                const prog=ach.check(lifeStats);
                if(!prog){
                    const lockT=this.add.text(293,iy+27,"🔒",{
                        font:"12px 'Courier New'"
                    }).setOrigin(0.5).setDepth(14);
                    cont.add(lockT);
                }
            }
        });

        // Scroll
        const wFnA=(p,g,dx,dy)=>{scrollY=Phaser.Math.Clamp(scrollY+dy*0.5,0,maxScroll);cont.y=SCROLL_TOP-scrollY;};
        this.input.on("wheel",wFnA);
        objs.push({destroy:()=>this.input.off("wheel",wFnA)});
        let _adrag=null,_adrags=0;
        const adz=this.add.rectangle(W/2,(SCROLL_TOP+SCROLL_BTM)/2,W,VISIBLE_H,0xffffff,0.001).setInteractive({draggable:true}).setDepth(11);
        objs.push(adz);
        adz.on("dragstart",(p)=>{_adrag=p.y;_adrags=scrollY;});
        adz.on("drag",(p)=>{scrollY=Phaser.Math.Clamp(_adrags-(p.y-(_adrag||p.y)),0,maxScroll);cont.y=SCROLL_TOP-scrollY;});

        objs.push(...this._closeBtn(W/2,H-20,objs));
        this._openPanel=objs;
    }

    // ── UPDATE ────────────────────────────────────────────────
    update(time,delta){
        this._menuT+=delta;
        const dt=delta/1000;
        if(this._goldDisp){try{this._goldDisp.setText("💰 "+PLAYER_GOLD);}catch(e){}}

        // Bulut hareketi
        this._clouds?.forEach(c=>{
            c.x+=c.vx*dt;
            if(c.x<-140){c.x=420;c.y=Phaser.Math.Between(20,140);try{c.setTexture(Math.random()<0.5?"cloud1":"cloud2");}catch(e){}}
        });

        // Kum hareketi
        this._sand?.forEach(sp=>{
            sp.obj.x+=sp.vx*dt;
            if(sp.obj.x<-10) sp.obj.x=375;
        });
        // [UI POLISH P5] Logo glitter — daha dinamik parıltı + nadir büyük spark
        this._glitterT=(this._glitterT||0)+delta;
        if(this._glitterG&&this._glitterSpots){
            this._glitterG.clear();
            this._glitterSpots.forEach((sp,i)=>{
                const freq=0.0018+i*0.0004;
                const a=Math.abs(Math.sin(this._glitterT*freq+(i*1.3)));
                if(a>0.55){
                    // Büyük spark — nadir
                    if(a>0.92&&Math.random()<0.3){
                        this._glitterG.fillStyle(0xffffff,a);
                        this._glitterG.fillRect(sp.x-1,sp.y-1,4,4);
                        this._glitterG.fillStyle(0xffee88,a*0.5);
                        this._glitterG.fillRect(sp.x-2,sp.y-2,6,6);
                    } else {
                        this._glitterG.fillStyle(0xffffff,a);
                        this._glitterG.fillRect(sp.x,sp.y,2,2);
                    }
                }
            });
            // [P5] Rastgele yeni kıvılcım — her ~600ms bir tane
            if(Math.random()<0.025){
                const rx=Phaser.Math.Between(70,290);
                const ry=Phaser.Math.Between(62,145);
                this._glitterG.fillStyle(0xffcc44,0.7);
                this._glitterG.fillRect(rx,ry,1,1);
            }
        }
    } // update() sonu
} // SceneMenu sonu, Enemy Spawn + Tick, Zorluk Dengesi
// ═══════════════════════════════════════════════════════════════

// ── TEXTURE BUILDER ───────────────────────────────────────────
function buildTextures(S){
    // [CRASH FIX] Texture'lar zaten oluşturulduysa tüm GPU işlemlerini atla.
    // buildTextures her sahne create()'inde çağrılıyor (SceneMenu + SceneGame).
    // 70 adet synchronous generateTexture çağrısı ana thread'i 100-200ms blokluyor.
    // "tex_bullet" sentinel olarak kullanılır — varsa hepsi var demektir.
    if(S.textures.exists("tex_bullet")) return;

    const g=S.add.graphics();

   // ── MERMI — ince uzun, parlak ──
    g.fillStyle(0xffffff,1);  g.fillRect(2,0,2,3);
    g.fillStyle(0xeeeedd,1);  g.fillRect(2,3,2,6);
    g.fillStyle(0xaaaaaa,1);  g.fillRect(2,9,2,6);
    g.fillStyle(0x888877,1);  g.fillRect(2,15,2,3);
    g.fillStyle(0xffffee,0.6);g.fillRect(2,0,1,10);
    g.generateTexture("tex_bullet",6,18); g.clear();

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

    // ── SAW ──
    g.fillStyle(0xbbbbbb); g.fillCircle(10,10,10);
    g.fillStyle(0x555555); g.fillCircle(10,10,6);
    g.fillStyle(0x333333); g.fillCircle(10,10,3);
    g.fillStyle(0xeeeeee);
    for(let i=0;i<8;i++){const a=Phaser.Math.DegToRad(i*45);g.fillTriangle(10,10,10+Math.cos(a)*11,10+Math.sin(a)*11,10+Math.cos(a+0.4)*8,10+Math.sin(a+0.4)*8);}
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

    // ── XP KRİSTALLERİ — minik, net pixel, kaliteli ──
    [{k:"xp_blue",  c:[0x0033aa,0x1166dd,0x33aaff,0x88ddff,0xffffff],s:10},
     {k:"xp_green", c:[0x006622,0x119944,0x22cc66,0x66ffaa,0xffffff],s:10},
     {k:"xp_purple",c:[0x440077,0x7722bb,0xaa44ff,0xcc88ff,0xffffff],s:11},
     {k:"xp_red",   c:[0x880000,0xcc2200,0xff4422,0xff8866,0xffffff],s:11},
     {k:"xp_gold",  c:[0x664400,0xaa7700,0xffaa00,0xffdd44,0xffffff],s:12}
    ].forEach(({k,c,s})=>{
        const h=s, m=Math.floor(h/2);
        // Alt oval gölge
        g.fillStyle(0x000000,0.25);
        g.fillEllipse(m, h-0.5, h*0.8, h*0.15);
        // Dış kontur
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
        // Parlaklık — geniş iç highlight
        g.fillStyle(c[3],0.40);
        g.fillTriangle(m,3, m+3,Math.floor(h*0.32), m-2,Math.floor(h*0.32));
        // Üst highlight pikseli — daha belirgin
        g.fillStyle(c[4],1.0);
        g.fillRect(m-1,1,2,1);
        g.fillStyle(c[4],0.65);
        g.fillRect(m-1,2,1,1);
        g.fillRect(m,2,1,1);
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

    // ── ELMA (HEALTH PICKUP) — pixel art, sert kenarlı küçük elma 16x16 ──
    g.fillStyle(0xdd1111,1); g.fillRect(2,6,12,9);       // gövde
    g.fillStyle(0xbb0808,1); g.fillRect(2,6,5,9);         // sol gölge
    g.fillStyle(0xff3333,1); g.fillRect(8,6,3,4);         // parlak bölge
    g.fillStyle(0xffffff,1); g.fillRect(9,7,2,2);         // highlight nokta
    g.fillStyle(0x550000,1); g.fillRect(6,4,4,3);         // üst çukur
    g.fillStyle(0x442200,1); g.fillRect(7,1,2,4);         // sap
    g.fillStyle(0x227700,1); g.fillRect(8,1,4,3);         // yaprak
    g.fillStyle(0x44bb22,1); g.fillRect(9,1,3,2);         // yaprak parlak
    g.fillStyle(0xff5555,0.5); g.fillRect(3,12,10,2);     // alt yansıma
    g.generateTexture("tex_heart",16,16); g.clear();


    // Efekt partikülleri
    g.fillStyle(0x003300);g.fillCircle(3,3,3);g.fillStyle(0x00aa44);g.fillCircle(3,3,2);g.fillStyle(0x66ff88);g.fillCircle(2,2,1);g.generateTexture("tex_poison_p",6,6);g.clear();
    g.fillStyle(0xaa2200);g.fillTriangle(4,8,8,0,0,0);g.fillStyle(0xff6600);g.fillTriangle(4,7,7,1,1,1);g.fillStyle(0xffcc00);g.fillTriangle(4,6,6,2,2,2);g.generateTexture("tex_flame_p",8,8);g.clear();
    g.fillStyle(0x4488ff);g.fillRect(0,0,8,8);g.fillStyle(0x88ccff);g.fillRect(1,1,6,6);g.fillStyle(0xffffff);g.fillRect(2,2,4,4);g.generateTexture("tex_lightning_p",8,8);g.clear();

    buildUpgradeIcons(g);
    g.destroy();
}

function buildUpgradeIcons(g){
    // 32x32 kaliteli pixel art ikonlar
    const sz=32;
    const bg=(col)=>{g.fillStyle(col,1);g.fillRect(0,0,sz,sz);};
    const brd=(col,alpha=0.6)=>{g.lineStyle(2,col,alpha);g.strokeRect(1,1,sz-2,sz-2);};

    const defs={
        // ── GÜÇ (Kılıç) — keskin, metalik
        icon_damage:()=>{
            bg(0x0c0608); brd(0xff4444,0.7);
            // Kılıç gövdesi
            g.fillStyle(0x888877,1); g.fillRect(14,3,4,20);
            // Metalik parlaklık
            g.fillStyle(0xccccaa,1); g.fillRect(15,3,2,18);
            g.fillStyle(0xffffff,0.8); g.fillRect(15,3,1,14);
            // Uç
            g.fillStyle(0xffffff,1); g.fillTriangle(14,3,18,3,16,0);
            g.fillStyle(0xccccaa,1); g.fillTriangle(15,3,17,3,16,1);
            // Guard (koruyucu)
            g.fillStyle(0xaa8833,1); g.fillRect(8,20,16,3);
            g.fillStyle(0xffcc44,1); g.fillRect(9,21,14,1);
            // Kabza
            g.fillStyle(0x553322,1); g.fillRect(13,23,6,7);
            g.fillStyle(0x884433,0.8); g.fillRect(14,24,4,5);
            // Kan damlası efekti
            g.fillStyle(0xff2200,0.8); g.fillCircle(22,8,2); g.fillCircle(20,12,1);
        },
        // ── HIZ ATEŞİ (Ok) — dinamik
        icon_attack:()=>{
            bg(0x06080a); brd(0x44aaff,0.7);
            // Ok gövdesi
            g.fillStyle(0x885522,1); g.fillRect(5,15,18,2);
            g.fillStyle(0xcc8844,1); g.fillRect(5,15,18,1);
            // Ok ucu — metalik
            g.fillStyle(0xddddcc,1); g.fillTriangle(23,10,23,22,30,16);
            g.fillStyle(0xffffff,0.6); g.fillTriangle(24,12,24,16,28,16);
            // Tüyler
            g.fillStyle(0x446688,1); g.fillTriangle(5,15,2,10,8,15);
            g.fillStyle(0x6688aa,1); g.fillTriangle(5,17,2,22,8,17);
            g.fillStyle(0x88aacc,0.7); g.fillTriangle(6,15,4,12,9,15);
            // Hız çizgileri
            g.fillStyle(0x4488ff,0.5); g.fillRect(0,13,6,1); g.fillRect(1,16,5,1); g.fillRect(2,11,4,1);
        },
        // ── BÜYÜK KURŞUN (Mermi) — şişirilmiş
        icon_size:()=>{
            bg(0x0a0800); brd(0xffaa00,0.7);
            // Büyük mermi
            g.fillStyle(0x555544,1); g.fillRect(11,6,10,18);
            g.fillStyle(0x888877,1); g.fillRect(12,6,8,16);
            g.fillStyle(0xaaaaaa,1); g.fillRect(13,7,6,14);
            g.fillStyle(0xffffff,0.7); g.fillRect(13,7,2,12);
            // Uç
            g.fillStyle(0xffcc00,1); g.fillTriangle(11,6,21,6,16,2);
            g.fillStyle(0xffffff,0.5); g.fillTriangle(13,6,16,6,16,3);
            // Şerit
            g.fillStyle(0xff8800,0.9); g.fillRect(11,18,10,3);
            g.fillStyle(0xffcc00,0.6); g.fillRect(11,19,10,1);
            // Glow
            g.fillStyle(0xffaa00,0.15); g.fillCircle(16,14,10);
        },
        // ── ÇOKLU ATIŞ (3 ok) — fan şeklinde
        icon_multi:()=>{
            bg(0x0a0010); brd(0xcc44ff,0.7);
            // Orta ok
            g.fillStyle(0xcc44ff,1); g.fillRect(15,3,2,22); g.fillTriangle(13,5,19,5,16,0);
            // Sol ok — eğimli
            g.fillStyle(0xaa33cc,0.9); g.fillRect(8,8,2,18); g.fillTriangle(6,10,12,10,9,5);
            // Sağ ok
            g.fillStyle(0xaa33cc,0.9); g.fillRect(22,8,2,18); g.fillTriangle(20,10,26,10,23,5);
            // Parlaklık
            g.fillStyle(0xff88ff,0.5); g.fillRect(16,3,1,20); g.fillRect(9,8,1,16); g.fillRect(23,8,1,16);
        },
        // ── ÇEVİKLİK (Şimşek) — hız
        icon_speed:()=>{
            bg(0x001108); brd(0x44ff88,0.7);
            // Büyük şimşek zikzak
            g.fillStyle(0x00aa44,1); g.fillTriangle(20,0,8,16,16,16); g.fillTriangle(16,16,24,16,12,32);
            g.fillStyle(0x44ff88,1); g.fillTriangle(19,1,9,15,15,15); g.fillTriangle(15,17,23,17,13,31);
            g.fillStyle(0xffffff,0.7); g.fillRect(15,4,2,10); g.fillRect(12,18,2,10);
            // Enerji parçacıkları
            g.fillStyle(0x88ffaa,0.8); g.fillCircle(25,6,2); g.fillCircle(6,26,2); g.fillCircle(28,14,1);
        },
        // ── DELİCİ (Sivri ok)
        icon_pierce:()=>{
            bg(0x000820); brd(0xaaaaff,0.7);
            // Uzun ok
            g.fillStyle(0x4444aa,1); g.fillRect(3,14,22,4);
            g.fillStyle(0x8888cc,1); g.fillRect(3,14,22,2);
            g.fillStyle(0xaaaaff,0.8); g.fillRect(3,14,18,1);
            // Sivri uç
            g.fillStyle(0xffffff,1); g.fillTriangle(25,12,25,20,32,16);
            g.fillStyle(0xddddff,0.8); g.fillTriangle(26,13,26,18,30,16);
            // Delik efekti (geçtiğinin kanıtı)
            for(let i=0;i<4;i++){g.fillStyle(0x2244aa,0.6);g.fillCircle(8+i*4,16,1.5);}
        },
        // ── KRİTİK (Nişangah) — crosshair
        icon_crit:()=>{
            bg(0x100008); brd(0xff4488,0.7);
            // Dış halka
            g.lineStyle(2,0xaa1155,1); g.strokeCircle(16,16,12);
            g.lineStyle(2,0xff4488,0.8); g.strokeCircle(16,16,10);
            // İç nokta
            g.fillStyle(0xff2266,1); g.fillCircle(16,16,4);
            g.fillStyle(0xff88aa,1); g.fillCircle(16,16,2);
            g.fillStyle(0xffffff,1); g.fillCircle(15,15,1);
            // Nişangah çizgileri
            g.fillStyle(0xff4488,0.9); g.fillRect(0,15,6,2); g.fillRect(26,15,6,2); g.fillRect(15,0,2,6); g.fillRect(15,26,2,6);
            // Kıvılcım
            g.fillStyle(0xffdd44,0.7); g.fillCircle(22,10,1); g.fillCircle(10,22,1);
        },
        // ── İTME (Rüzgar) — dalga
        icon_kb:()=>{
            bg(0x110500); brd(0xff8844,0.7);
            // Güçlü rüzgar dalgaları — fillRect ile çiz (beginPath/lineTo yerine)
            g.fillStyle(0xff8844,0.8);
            for(let wi=0;wi<4;wi++){
                const wx=4+wi*5;
                for(let wy=6;wy<26;wy+=3){
                    g.fillRect(wx+Math.round(Math.sin((wy-6)*0.5)*3),wy,2,2);
                }
            }
            // Etki noktası
            g.fillStyle(0xffcc44,0.8); g.fillCircle(28,16,4);
            g.fillStyle(0xffffff,0.6); g.fillCircle(27,15,2);
        },
        // ── BUZ (Kristal) — kar tanesi
        icon_freeze:()=>{
            bg(0x001133); brd(0x88ddff,0.7);
            // Kar tanesi çubuğu
            g.fillStyle(0x2266aa,1); g.fillRect(14,2,4,28); g.fillRect(2,14,28,4);
            // Çaprazlar
            g.fillStyle(0x4488cc,0.8);
            for(let a=45;a<180;a+=90){
                const ra=Phaser.Math.DegToRad(a);
                g.fillRect(16+Math.cos(ra)*10-1,16+Math.sin(ra)*10-1,3,3);
                g.fillRect(16-Math.cos(ra)*10-1,16-Math.sin(ra)*10-1,3,3);
            }
            // İç parlaklık
            g.fillStyle(0x88ddff,0.9); g.fillRect(15,2,2,28); g.fillRect(2,15,28,2);
            g.fillStyle(0xffffff,0.9); g.fillCircle(16,16,4);
            g.fillStyle(0xaaeeff,0.7); g.fillCircle(16,16,2);
        },
        // ── AKADEMİSYEN (Kitap) — XP artışı
        icon_xp:()=>{
            bg(0x102218); brd(0x66ffcc,0.7);
            // Kitap gövdesi
            g.fillStyle(0x224433,1); g.fillRect(4,5,24,22);
            g.fillStyle(0x336655,1); g.fillRect(5,6,22,20);
            g.fillStyle(0x224433,1); g.fillRect(4,5,4,22); // sırt
            // Sayfa çizgileri
            g.fillStyle(0x55aa88,0.7); for(let i=0;i<4;i++)g.fillRect(11,10+i*4,14,1);
            // Yıldız / XP sembolü
            g.fillStyle(0xffdd44,1); g.fillTriangle(16,8,14,14,18,14); g.fillTriangle(16,20,14,14,18,14);
            g.fillStyle(0xffffff,0.8); g.fillRect(15,10,2,8);
        },
        // ── DAYANIKLILIK (Kalkan) — güçlü
        icon_hp:()=>{
            bg(0x110000); brd(0xff4444,0.7);
            // Kalkan şekli
            g.fillStyle(0x880000,1); g.fillTriangle(16,2,3,10,3,22); g.fillTriangle(16,2,29,10,29,22);
            g.fillStyle(0x880000,1); g.fillRect(3,10,26,12); g.fillTriangle(3,22,29,22,16,30);
            g.fillStyle(0xcc2222,1); g.fillTriangle(16,4,5,11,5,21); g.fillTriangle(16,4,27,11,27,21);
            g.fillStyle(0xcc2222,1); g.fillRect(5,11,22,10); g.fillTriangle(5,21,27,21,16,28);
            // Haç
            g.fillStyle(0xffffff,0.9); g.fillRect(14,10,4,12); g.fillRect(10,14,12,4);
            // Parlaklık
            g.fillStyle(0xff8888,0.4); g.fillTriangle(16,5,6,12,6,14);
        },
        // ── YENİLENME (Döngü oku)
        icon_regen:()=>{
            bg(0x001108); brd(0x44ff88,0.7);
            // Döngü oku (daire)
            g.lineStyle(4,0x006600,1); g.strokeCircle(16,16,11);
            g.lineStyle(3,0x00dd66,0.9); g.strokeCircle(16,16,10);
            // Üst ok başı
            g.fillStyle(0x00ff88,1); g.fillTriangle(24,7,20,3,20,11);
            // Alt ok başı
            g.fillStyle(0x00ff88,1); g.fillTriangle(8,25,12,29,12,21);
            // Yeşil parlaklık
            g.fillStyle(0x88ffaa,0.6); g.fillCircle(22,10,3); g.fillCircle(10,22,3);
            // Artı işareti
            g.fillStyle(0xffffff,0.9); g.fillRect(15,11,2,10); g.fillRect(11,15,10,2);
        },
        // ── MIKNATIS — U şeklinde güçlü
        icon_magnet:()=>{
            bg(0x110011); brd(0xffff44,0.7);
            // U şekli
            g.fillStyle(0x888888,1); g.fillRect(4,4,8,20); g.fillRect(20,4,8,20); g.fillRect(4,20,24,8);
            g.fillStyle(0xaaaaaa,1); g.fillRect(5,4,6,18); g.fillRect(21,4,6,18); g.fillRect(5,20,22,6);
            // Kırmızı (N) ve Mavi (S) uçlar
            g.fillStyle(0xff2222,1); g.fillRect(4,4,8,8);
            g.fillStyle(0xff6666,1); g.fillRect(5,4,6,6);
            g.fillStyle(0x2222ff,1); g.fillRect(20,4,8,8);
            g.fillStyle(0x6666ff,1); g.fillRect(21,4,6,6);
            // Manyetik alan çizgileri
            g.fillStyle(0xffff44,0.5); g.fillRect(0,14,3,2); g.fillRect(29,14,3,2);
            g.fillStyle(0xffffff,0.7); g.fillRect(6,5,2,1); g.fillRect(22,5,2,1);
        },
        // ── SAĞLIK KİTİ (İksir şişesi)
        icon_heal:()=>{
            bg(0x001108); brd(0x00ffaa,0.7);
            // Şişe
            g.fillStyle(0x224433,1); g.fillRect(11,14,10,15); // alt kısım
            g.fillStyle(0x336655,1); g.fillRect(12,14,8,13);
            // Sıvı
            g.fillStyle(0x00aa55,0.8); g.fillRect(12,18,8,9);
            g.fillStyle(0x00ff88,0.5); g.fillRect(12,18,8,3);
            // Boyun
            g.fillStyle(0x224433,1); g.fillRect(13,8,6,8);
            g.fillStyle(0x336655,1); g.fillRect(14,9,4,6);
            // Kapak
            g.fillStyle(0xffcc00,1); g.fillRect(12,5,8,4);
            g.fillStyle(0xffee44,0.8); g.fillRect(13,5,6,2);
            // Artı
            g.fillStyle(0xffffff,1); g.fillRect(15,19,2,6); g.fillRect(12,21,8,2);
            // Parlaklık
            g.fillStyle(0xffffff,0.5); g.fillRect(13,15,2,8);
        },
        // ── YÖRÜNGE BIÇAK (Orbit)
        icon_orbit:()=>{
            bg(0x000011); brd(0x8888ff,0.7);
            // Yörünge dairesi
            g.lineStyle(2,0x333388,0.9); g.strokeCircle(16,16,12);
            g.lineStyle(1,0x4444aa,0.7); g.strokeCircle(16,16,10);
            // Bıçak konumları (3 farklı yerde)
            const angles=[0,120,240];
            angles.forEach(deg=>{
                const a=Phaser.Math.DegToRad(deg);
                const bx=16+Math.cos(a)*11, by=16+Math.sin(a)*11;
                g.fillStyle(0x8888ff,1); g.fillTriangle(bx,by-4,bx+3,by+2,bx-3,by+2);
                g.fillStyle(0xddeeff,0.8); g.fillTriangle(bx,by-3,bx+2,by+1,bx-2,by+1);
            });
            // Merkez
            g.fillStyle(0x2222aa,1); g.fillCircle(16,16,4);
            g.fillStyle(0x8888ff,0.8); g.fillCircle(16,16,2);
        },
        // ── EL BOMBASI (Explosive)
        icon_explosive:()=>{
            bg(0x111111); brd(0xff8800,0.7);
            // Bomba gövdesi
            g.fillStyle(0x222222,1); g.fillCircle(15,18,11);
            g.fillStyle(0x333333,1); g.fillCircle(14,17,10);
            g.fillStyle(0x444444,0.6); g.fillCircle(12,15,5);
            // Fitil
            g.lineStyle(2,0x885500,1); for(let i=0;i<4;i++){g.fillStyle(0xaa7700,1);g.fillCircle(15+i*2,8-i,1);}
            g.fillStyle(0xffcc00,1); g.fillCircle(23,2,3);
            g.fillStyle(0xffffff,0.8); g.fillCircle(22,1,1);
            // Patlama çizgileri
            g.fillStyle(0xff6600,0.7); for(let i=0;i<6;i++){const a=Phaser.Math.DegToRad(i*60+30);g.fillRect(15+Math.cos(a)*13,18+Math.sin(a)*13,2,2);}
        },
        // ── ALEV AURASI (Ateş)
        icon_flame:()=>{
            bg(0x110000); brd(0xff5500,0.7);
            // Alev şekli — üst üste üçgenler
            g.fillStyle(0x220000,1); g.fillTriangle(16,1,3,28,29,28);
            g.fillStyle(0x881100,1); g.fillTriangle(16,5,5,28,27,28);
            g.fillStyle(0xff3300,1); g.fillTriangle(16,9,7,28,25,28);
            g.fillStyle(0xff7700,1); g.fillTriangle(16,14,10,28,22,28);
            g.fillStyle(0xffcc00,1); g.fillTriangle(16,18,12,28,20,28);
            g.fillStyle(0xffffff,0.8); g.fillTriangle(16,22,14,28,18,28);
            // İç kıvılcımlar
            g.fillStyle(0xffffff,0.6); g.fillCircle(14,24,1); g.fillCircle(18,22,1); g.fillCircle(16,20,1);
        },
        // ── ZİNCİR ŞİMŞEK
        icon_lightning:()=>{
            bg(0x050a00); brd(0xffee00,0.7);
            // Şimşek zikzak - ana
            g.fillStyle(0xffaa00,1); g.fillTriangle(20,1,12,17,18,17); g.fillTriangle(18,15,10,31,16,31);
            g.fillStyle(0xffdd00,1); g.fillTriangle(19,2,13,16,17,16); g.fillTriangle(17,16,11,30,15,30);
            g.fillStyle(0xffffff,0.9); g.fillRect(17,4,2,10); g.fillRect(13,18,2,10);
            // Yan şimşek (zincir)
            g.fillStyle(0xffcc00,0.7); g.fillTriangle(25,8,20,16,24,16);
            g.fillStyle(0xffffff,0.5); g.fillRect(23,9,1,6);
            // Glow
            g.fillStyle(0xffff88,0.25); g.fillCircle(17,16,8);
        },
        // ── MUHARİP DRONE
        icon_drone:()=>{
            bg(0x000811); brd(0x00aaff,0.7);
            // Drone gövdesi
            g.fillStyle(0x001133,1); g.fillRect(6,13,20,7);
            g.fillStyle(0x002255,1); g.fillRect(7,14,18,5);
            g.fillStyle(0x0055aa,1); g.fillRect(10,15,12,3);
            g.fillStyle(0x00aaff,1); g.fillRect(13,16,6,1);
            // Kamera
            g.fillStyle(0x003366,1); g.fillRect(14,11,4,4);
            g.fillStyle(0x00aaff,1); g.fillRect(15,12,2,2);
            g.fillStyle(0x00ffff,0.8); g.fillCircle(16,13,1);
            // Kanatlar
            g.fillStyle(0x001133,1); g.fillRect(0,14,6,3); g.fillRect(26,14,6,3);
            g.fillStyle(0x002244,0.8); g.fillRect(1,14,4,2); g.fillRect(27,14,4,2);
            // Pervane
            g.fillStyle(0x0088ff,0.8); g.fillCircle(4,12,3); g.fillCircle(28,12,3);
            g.fillStyle(0x00ddff,0.6); g.fillRect(2,11,4,2); g.fillRect(26,11,4,2);
            // Atış lazeri
            g.fillStyle(0xff4400,0.9); g.fillRect(14,20,4,6); g.fillStyle(0xff8800,0.7); g.fillRect(15,24,2,8);
        },
        // ── TESTERE
        icon_saw:()=>{
            bg(0x0a0a0a); brd(0xcccccc,0.7);
            // Dış halka — gümüş
            g.fillStyle(0x666666,1); g.fillCircle(16,16,14);
            g.fillStyle(0x888888,1); g.fillCircle(16,16,12);
            // Diş çentikleri — 12 adet
            for(let i=0;i<12;i++){
                const a=Phaser.Math.DegToRad(i*30);
                g.fillStyle(0xdddddd,1);
                g.fillTriangle(16+Math.cos(a)*13,16+Math.sin(a)*13,
                    16+Math.cos(a+0.25)*10,16+Math.sin(a+0.25)*10,
                    16+Math.cos(a-0.25)*10,16+Math.sin(a-0.25)*10);
            }
            // İç merkez
            g.fillStyle(0x444444,1); g.fillCircle(16,16,7);
            g.fillStyle(0x333333,1); g.fillCircle(16,16,5);
            g.fillStyle(0x222222,1); g.fillCircle(16,16,3);
            // Merkez delik
            g.fillStyle(0x555555,1); g.fillCircle(16,16,2);
            g.fillStyle(0x888888,0.5); g.fillCircle(15,15,1);
            // Parlaklık
            g.fillStyle(0xffffff,0.5); g.fillCircle(11,11,2);
        },
        // ── ZEHİR BULUTU (Şişe + Kafatası)
        icon_poison:()=>{
            bg(0x020e02); brd(0x44ff44,0.7);
            // Zehir şişesi
            g.fillStyle(0x112211,1); g.fillRect(12,16,8,14);
            g.fillStyle(0x224422,1); g.fillRect(13,16,6,12);
            // Zehir sıvısı
            g.fillStyle(0x00aa33,0.9); g.fillRect(13,18,6,8);
            g.fillStyle(0x44ff44,0.4); g.fillRect(13,18,6,3);
            // Şişe boynu
            g.fillStyle(0x112211,1); g.fillRect(14,10,4,7);
            // Kafatası sembolü (bulutu simgeler)
            g.fillStyle(0x00ff44,0.8); g.fillCircle(16,8,4);
            g.fillStyle(0x00cc33,1); g.fillRect(13,8,6,4);
            // Kafatası gözleri
            g.fillStyle(0x020e02,1); g.fillCircle(14,7,1); g.fillCircle(18,7,1);
            g.fillStyle(0x020e02,1); g.fillRect(13,10,2,1); g.fillRect(17,10,2,1); g.fillRect(15,10,2,1);
            // Zehir damlası
            g.fillStyle(0x44ff44,0.9); g.fillCircle(22,20,3); g.fillCircle(8,25,2);
        },
        // ── METEOR YAĞMURU
        icon_meteor:()=>{
            bg(0x080400); brd(0xff6600,0.7);
            // Yıldız kayma izleri
            g.fillStyle(0xff4400,0.3); g.fillRect(16,0,3,14); g.fillRect(22,4,2,10); g.fillRect(10,2,2,12);
            // Ana meteor
            g.fillStyle(0x220800,1); g.fillCircle(14,18,10);
            g.fillStyle(0x882200,1); g.fillCircle(12,16,8);
            g.fillStyle(0xcc4400,1); g.fillCircle(10,14,6);
            g.fillStyle(0xff6600,1); g.fillCircle(8,12,4);
            g.fillStyle(0xff9900,1); g.fillCircle(6,10,3);
            g.fillStyle(0xffcc44,1); g.fillCircle(4,8,2);
            g.fillStyle(0xffffff,1); g.fillCircle(3,7,1);
            // Ateş kuyruğu
            g.fillStyle(0xff4400,0.6); g.fillRect(15,16,6,2); g.fillRect(17,14,5,2); g.fillRect(19,12,4,2);
        },
        // ── LAZER
        icon_laser:()=>{
            bg(0x0a0000); brd(0xff0000,0.7);
            // Lazer silahı gövdesi
            g.fillStyle(0x333333,1); g.fillRect(2,12,16,8);
            g.fillStyle(0x555555,1); g.fillRect(3,13,14,6);
            g.fillStyle(0x222222,1); g.fillRect(8,16,6,6);
            // Namlu
            g.fillStyle(0x222222,1); g.fillRect(16,14,4,4);
            g.fillStyle(0xff0000,1); g.fillRect(20,15,12,2);
            // Enerji hücresi
            g.fillStyle(0xff2200,0.8); g.fillCircle(17,16,3);
            g.fillStyle(0xff6600,0.9); g.fillCircle(17,16,2);
            g.fillStyle(0xffcc00,1); g.fillCircle(17,16,1);
            // Lazer ışını glow
            g.fillStyle(0xff2200,0.3); g.fillRect(18,13,14,6);
            g.fillStyle(0xff4400,0.2); g.fillRect(18,12,14,8);
        },
        // ── GÖK GÜRÜLTÜSÜ (Thunder)
        icon_thunder:()=>{
            bg(0x050508); brd(0xffee44,0.7);
            // Bulut
            g.fillStyle(0x445566,1); g.fillCircle(10,10,7); g.fillCircle(16,8,8); g.fillCircle(22,11,6);
            g.fillStyle(0x556677,1); g.fillRect(3,10,26,5);
            g.fillStyle(0x667788,1); g.fillCircle(11,9,5); g.fillCircle(17,7,6); g.fillCircle(22,10,4);
            g.fillStyle(0x778899,0.6); g.fillRect(4,10,24,4);
            // Şimşek
            g.fillStyle(0xffee00,1); g.fillTriangle(18,14,13,24,17,24); g.fillTriangle(17,22,12,32,16,32);
            g.fillStyle(0xffffff,0.9); g.fillRect(16,15,1,8); g.fillRect(14,24,1,7);
            // Glow
            g.fillStyle(0xffff88,0.2); g.fillCircle(16,24,6);
        }
    };
    // [CRASH FIX] buildTextures guard "tex_bullet"'ı kontrol ediyor ama
    // buildUpgradeIcons buildTextures içinden çağrılıyor — guard zaten bu fonksiyona
    // girmemeli. Yine de ikinci sahne geçişinde olası edge-case'e karşı per-key guard.
    const _sc = g.scene;
    for(const [key,fn] of Object.entries(defs)){
        if(_sc && _sc.textures && _sc.textures.exists(key)) continue;
        g.clear(); fn(); g.generateTexture(key,sz,sz);
    }
    g.clear();
}

// ── ENEMY HELPERS ─────────────────────────────────────────────
// [BALANCE] Düşman HP scaling güçlendirildi — piramitler artık daha dayanıklı
function hpFor(base,level,scale){
    // İlk 5 level: yumuşak başlangıç. Sonrası: hızlı ölçekleme
    const extraScale = level > 5 ? 1 + (level - 5) * 0.08 : 1.0;
    return Math.ceil((base + level * scale * 1.35) * extraScale);
}

function resetEF(p){
    p.zigzag=p.kamikaze=p.shield=p.swarm=p.split=p.frozen=false;
    p.elite=p.isBoss=p.ghost=p.groundHit=p.lock=p.spawnProtected=false;
    p.hitByOrbit=false; p.armor=0; p.hitCount=0; p.zigTimer=0; p.type="normal";
    p._breakFrame=-1; p._staggering=false;
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
    if(p._shadowGfx){try{p._shadowGfx.destroy();}catch(e){} p._shadowGfx=null;}
    // Texture'ı sıfırlama — spawnEnemy kendi texture'unu set eder
    try{p.clearTint().setAlpha(1);}catch(e){}
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
    const gs=GS;
    if(S.pyramids.countActive(true)>=MAX_ENEMIES) return;

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
        normal:"pyramid",zigzag:"pyramid",fast:"pyramid",tank:"pyramid",
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
    // Texture set + tint uygula — her tip kendine özgü renk
    try{
        p.setTexture(useTex);
        p.clearTint();
        // Tüm tipler pyramid texture kullandığı için tint ile ayrıştır
        const typeTints={
            normal:    null,          // orijinal renk
            zigzag:    0x44ff88,      // yeşil
            fast:      0xff3300,      // parlak kırmızı
            tank:      0xaa44ff,      // mor
            shield:    0x4488ff,      // mavi
            kamikaze:  0xff6600,      // turuncu
            ghost:     0x88aacc,      // soluk mavi (alpha ayrıca)
            split:     0xffcc00,      // sarı
            swarm:     0xffaa44,      // açık turuncu
            elder:     0xffcc44,      // altın
            spinner:   0xff7700,      // turuncu
            armored:   0x7755ff,      // koyu mor
            bomber:    0xff2200,      // koyu kırmızı
            stealth:   0x88bbaa,      // gri-yeşil
            healer:    0x00ff88,      // yeşil
            magnet:    0xffff44,      // sarı
            mirror:    0xaaaaff,      // açık mor
            berserker: 0xff0000,      // saf kırmızı
            absorber:  0x00aaff,      // cyan
            chain:     0x4488ff,      // mavi
            freezer:   0x88ddff,      // buz mavisi
            leech:     0xcc4488,      // pembe
            titan:     0x9900dd,      // derin mor
            shadow:    0x334455,      // koyu gri
            spiker:    0xffcc00,      // sarı
            vortex:    0x44ffcc,      // turkuaz
            phantom:   0xaaaacc,      // soluk mor
            rusher:    0xff4400,      // turuncu-kırmızı
            splitter:  0xffaa00,      // amber
            toxic:     0x66cc00,      // zehir yeşili
            colossus:  0xff2266,      // neon kırmızı
            // pyramid1/2/3/4 kendi texture'larını kullanır — tint yok
            inferno:       0xff2200,
            glacier:       0x44ccff,
            phantom_tri:   null,
            volt:          0xffee00,
            obsidian:      0x330044,
        };
        const tint=typeTints[type];
        if(tint!=null) p.setTint(tint);
        p.setVisible(true);
        p.setAlpha(1);
    }catch(e){ try{p.setTexture("pyramid");}catch(ex){} }
    // Shadow realm: yeni düşmanlar da görünmez
    if(gs._shadowRealm){ p.setAlpha(0.0); p._shadowHidden=true; }
    const spd=gs.pyramidSpeed;
    p.type=type;

    switch(type){
       case"normal":    p.hp=hpFor(8,gs.level,0.6);   p.setScale(0.88).setVelocityY(spd); break;
        case"zigzag":    p.hp=hpFor(7,gs.level,0.5);   p.zigzag=true;p.setScale(0.82).setVelocityX(Phaser.Math.Between(-80,80)||55).setVelocityY(spd*0.85); break;
        case"fast":      p.hp=hpFor(5,gs.level,0.45);  p.setScale(0.92).setTint(0xff3300).setVelocityY(spd*1.7); break;
        case"tank":      p.hp=hpFor(28,gs.level,1.8);  p.armor=1;p.setScale(1.2).setVelocityY(spd*0.55); break;
        case"shield":    p.hp=hpFor(8,gs.level,0.45);  p.shield=true;p.armor=1;p.setScale(0.95).setVelocityY(spd*0.72); break;
        case"split":     p.hp=hpFor(7,gs.level,0.4);   p.split=true;p.setScale(0.92).setVelocityY(spd*1.0); break;
        case"swarm":     p.hp=1;p.swarm=true;p.setScale(0.82).setVelocityY(spd*1.0); break;
        case"kamikaze":  p.hp=hpFor(4,gs.level,0.25);  p.kamikaze=true;p.setScale(0.88).setVelocityY(spd*0.65); break;
        case"ghost":     p.hp=hpFor(10,gs.level,0.5);  p.ghost=true;p.setScale(0.82).setAlpha(0.42).setVelocityY(spd*1.0); break;
        case"spinner":   p.hp=hpFor(7,gs.level,0.4);   p.spinner=true;p.spinRate=0;p.setScale(0.88).setTint(0xff7700).setVelocityY(spd*0.78); break;
        case"armored":   p.hp=hpFor(14,gs.level,0.7);  p.armor=2;p.armored=true;p.setScale(1.08).setTint(0x7755ff).setVelocityY(spd*0.6); break;
        case"elder":     p.hp=hpFor(30,gs.level,1.2);  p.armor=2;p.elder=true;p.setScale(1.4).setVelocityY(spd*0.45); break;
        case"bomber":    p.hp=hpFor(5,gs.level,0.3);   p.bomber=true;p.setScale(0.9).setVelocityY(spd*0.9); break;
        case"stealth":   p.hp=hpFor(7,gs.level,0.4);   p.stealth=true;p.stealthTimer=0;p.setScale(0.85).setAlpha(0.9).setVelocityY(spd*0.95); break;
        case"healer":    p.hp=hpFor(9,gs.level,0.5);   p.healer=true;p.healTimer=0;p.setScale(0.95).setVelocityY(spd*0.6); break;
        case"magnet":    p.hp=hpFor(7,gs.level,0.4);   p.magnetEnemy=true;p.setScale(0.9).setVelocityY(spd*0.8); break;
        case"mirror":    p.hp=hpFor(7,gs.level,0.4);   p.mirror=true;p.mirrorSpawned=false;p.setScale(0.88).setVelocityY(spd*0.85); break;
        case"berserker": p.hp=hpFor(9,gs.level,0.55);  p.berserker=true;p.setScale(0.9).setVelocityY(spd*0.7); break;
        case"absorber":  p.hp=hpFor(12,gs.level,0.65); p.absorber=true;p.armor=1;p.absorbTimer=0;p.setScale(1.0).setVelocityY(spd*0.65); break;
        case"chain":     p.hp=hpFor(6,gs.level,0.35);  p.chain=true;p.setScale(0.85).setVelocityY(spd*1.1); break;
        case"freezer":   p.hp=hpFor(9,gs.level,0.5);   p.freezerEnemy=true;p.freezeTimer=0;p.setScale(0.95).setVelocityY(spd*0.7); break;
        case"leech":     p.hp=hpFor(7,gs.level,0.4);   p.leech=true;p.setScale(0.88).setVelocityY(spd*0.9); break;
        case"titan":     p.hp=hpFor(45,gs.level,2.0);  p.armor=3;p.titan=true;p.setScale(1.8).setVelocityY(spd*0.35); break;
        case"shadow":    p.hp=hpFor(9,gs.level,0.5);   p.shadow=true;p.shadowSpawned=false;p.setScale(0.88).setVelocityY(spd*1.0); break;
        case"spiker":    p.hp=hpFor(7,gs.level,0.4);   p.spiker=true;p.spikeTimer=0;p.setScale(0.9).setVelocityY(spd*0.85); break;
        case"vortex":    p.hp=hpFor(10,gs.level,0.6);  p.vortex=true;p.setScale(1.05).setVelocityY(spd*0.6); break;
        case"phantom":   p.hp=hpFor(14,gs.level,0.75); p.phantom=true;p.phaseTimer=0;p.setScale(1.0).setAlpha(0.35).setVelocityY(spd*0.8); break;
        case"rusher":    p.hp=hpFor(6,gs.level,0.35);  p.rusher=true;p.rushTimer=0;p.rushing=false;p.setScale(0.82).setVelocityY(spd*0.5); break;
        case"splitter":  p.hp=hpFor(10,gs.level,0.55); p.splitter=true;p.setScale(1.0).setVelocityY(spd*0.9); break;
        case"toxic":     p.hp=hpFor(7,gs.level,0.4);   p.toxic=true;p.toxTimer=0;p.setScale(0.9).setVelocityY(spd*0.85); break;
        case"colossus":  p.hp=hpFor(70,gs.level,2.5);  p.armor=4;p.colossus=true;p.setScale(2.2).setVelocityY(spd*0.25); break;
// ── YENİ PİRAMİT TİPLERİ — pyramid_1/2/3/4 asset, pyramid.png ile aynı boyut ──
        // Scale 0.82–0.95 arası: normal pyramid ile aynı görsel büyüklük
        // ── ÖZEL PİRAMİT TİPLERİ ──
        case"inferno":     p.hp=hpFor(14,gs.level,0.75); p.inferno=true;
            p.setDisplaySize(78,64).setTint(0xff3300).setVelocityY(spd*0.9);
            p._spinRate=2.8; // 360 dönüş hızı
            break;
        case"glacier":     p.hp=hpFor(22,gs.level,1.1);  p.glacier=true; p.armor=2;
            p.setDisplaySize(78,64).setTint(0x44ccff).setVelocityY(spd*0.55);
            break;
        case"phantom_tri": p.hp=hpFor(12,gs.level,0.65); p.phantom_tri=true;
            p.setDisplaySize(78,64).setTint(0xcc44ff).setVelocityY(spd*0.85);
            p._splitDone=false; // bölünme bayrağı
            p.setAlpha(0.72);
            break;
        case"volt":        p.hp=hpFor(10,gs.level,0.55);  p.volt=true;
            p.setDisplaySize(78,64).setTint(0xffee00).setVelocityY(spd*1.1);
            p._voltPhase=0; // zigzag faz
            p._voltAccel=false;
            break;
        case"obsidian":    p.hp=hpFor(45,gs.level,2.0);   p.obsidian=true; p.armor=3;
            p.setDisplaySize(78,64).setTint(0x330044).setVelocityY(spd*0.4);
            p._reflect=true; // hasar yansıtma
            break;
        default:         p.hp=hpFor(6,gs.level,0.35);  p.setScale(0.88).setVelocityY(spd); break;
    }

    if(gs.directorPhase==="chaos"&&Math.random()<0.18){p.hp=Math.ceil(p.hp*1.4);p.elite=true;p.setTint(0xffdd00);p.setScale(p.scaleX*1.1);}
    p.maxHP=p.hp;
    p.spawnProtected=true;
    p.setAlpha(0);
    S.tweens.add({targets:p,alpha:p.ghost?0.42:p.phantom?0.35:p.stealth?0.9:1,duration:320,ease:"Quad.easeOut"});
    S.time.delayedCall(380,()=>{ if(p.active){p.spawnProtected=false;} });
    p.body.enable=true;
    p.body.checkCollision.none=false;
    p.body.checkCollision.up=true;
    p.body.checkCollision.down=true;
    p.body.checkCollision.left=true;
    p.body.checkCollision.right=true;
    // Hafif görsel çeşitlilik — sadece normal pyramid tipleri
    const isNewPyr=p.inferno||p.glacier||p.phantom_tri||p.volt||p.obsidian;
    if(!isNewPyr){
        const scaleVar=0.92+Math.random()*0.14;
        p.setScale(p.scaleX*scaleVar);
    }
    // Elite — yeni piramitlerde setDisplaySize ile orantılı büyüt
    if(p.elite&&isNewPyr) p.setDisplaySize(84,69); // ~%8 büyük, sabit

    // ── HİTBOX — tüm piramitler için sabit 62x50, MERKEZLİ ──
    const bw=isNewPyr?62:Math.max(22,(p.displayWidth>4?p.displayWidth:40)*0.80);
    const bh=isNewPyr?50:Math.max(18,(p.displayHeight>4?p.displayHeight:36)*0.80);
    const _fw=p.width||78; const _fh=p.height||64;
    p.body.setSize(bw,bh).setOffset((_fw-bw)*0.5,(_fh-bh)*0.5);
    p.setCollideWorldBounds(false);
}

function spawnBoss(S){
    const gs=GS; if(gs.bossActive) return;
    const boss=S.pyramids.get(180,-80,"pyramid"); if(!boss) return;
    resetEF(boss);
    boss.hp=boss.maxHP=80+gs.level*8;
    boss.type="boss"; boss.isBoss=true;
    boss.setScale(2.4).setTint(0xff0044).setVelocityY(50).setAlpha(0.7);
    boss.spawnProtected=true; gs.bossActive=true;
    S.time.delayedCall(1400,()=>{if(boss.active){boss.spawnProtected=false;boss.setAlpha(1);}});
}

// ── TICK ENEMIES ─────────────────────────────────────────────
function tickEnemies(S){
    const gs=GS; if(!gs||gs.gameOver) return;
    const dt=S.game.loop.delta;
    S.pyramids.children.iterate(p=>{
        if(!p||!p.active) return;
        if(p.type==="minion"){
            if(!p.body||!p.body.enable) return;
            p.setVelocityY(gs.pyramidSpeed*0.58);
            if(p.x<20||p.x>340) p.body.velocity.x*=-1;
            const pb=p.y+(p.displayHeight||40)*0.5;
            if(pb>=GROUND_Y&&!p.groundHit){
                p.groundHit=true;p.setVelocity(0,0);
                if(p._shadowGfx){try{p._shadowGfx.destroy();}catch(e){}p._shadowGfx=null;}
                try{if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.HapticFeedback){window.Telegram.WebApp.HapticFeedback.impactOccurred("light");}else if(navigator.vibrate){navigator.vibrate(8);}}catch(e){}
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

        if(p.spinner){p.spinRate=(p.spinRate||0)+0.04;p.setAngle(Math.sin(p.spinRate)*22);}

        // Minimum hız
        if(!p.groundHit&&!p.spawnProtected){
            if(p.body.velocity.y<gs.pyramidSpeed*0.4) p.setVelocityY(gs.pyramidSpeed);
            // ── HAFİF SALLANTI — sadece estetik, kenar sürüklenmesi yok ──
            if(p.type!=="kamikaze"&&p.type!=="zigzag"&&p.type!=="titan"&&p.type!=="colossus"&&p.type!=="volt"){
                if(p._windPhase===undefined) p._windPhase=Math.random()*Math.PI*2;
                // Sinüs dalgası — hiç birikmez, her zaman 0 çevresinde sallar
                const sway=Math.sin(gs.t*0.0018+p._windPhase)*8;
                p.body.velocity.x=Phaser.Math.Linear(p.body.velocity.x,sway,0.04);
                // Hafif eğim — sallantıyla uyumlu
                p.angle=Phaser.Math.Linear(p.angle,sway*0.4,0.05);
            }

            // ── DÜŞME EFEKTİ — sadece temiz hız çizgileri ──────────
            p._fallEffT=(p._fallEffT||0)+dt;
            const fallSpd=p.body.velocity.y;

            // KATMAN 1: İnce beyaz hız çizgileri — hız >100 iken, throttled
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
                        ease:"Quad.easeOut",onComplete:()=>{try{_sg.destroy();}catch(e){}}});
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
        if(p.phantom){p.phaseTimer=(p.phaseTimer||0)+dt;if(p.phaseTimer>3000){p.phaseTimer=0;p.body.enable=false;S.time.delayedCall(600,()=>{if(p.active){p.body.enable=true;p.x=Phaser.Math.Between(30,330);}});}}
        if(p.rusher&&!p.rushing){p.rushTimer=(p.rushTimer||0)+dt;if(p.rushTimer>2000){p.rushing=true;p.rushTimer=0;p.setVelocityY(gs.pyramidSpeed*3.2);S.time.delayedCall(380,()=>{if(p.active){p.rushing=false;p.setVelocityY(gs.pyramidSpeed*0.5);}});}}
        if(p.vortex&&!p.spawnProtected){p._vortT=(p._vortT||0)+dt;if(p._vortT>50){p._vortT=0;S.bullets.children.each(b=>{if(!b.active)return;const dx=p.x-b.x,dy=p.y-b.y,d=Math.sqrt(dx*dx+dy*dy);if(d<65&&d>2){b.body.velocity.x+=dx/d*22;b.body.velocity.y+=dy/d*22;}});}}

        // ── YENİ PİRAMİT ÖZEL DAVRANIŞLARI ──────────────────────
        // pyramid3: Kozmik/Rainbow — hue-shift tint döngüsü (performant: her 120ms güncelle)
        // Volt: zigzag + periyodik hızlanma
        if(p.volt&&!p.spawnProtected){
            p._voltPhase=(p._voltPhase||0)+dt*0.004;
            try{p.body.velocity.x=Math.sin(p._voltPhase)*90;}catch(e){}
            if(Math.random()<0.004){try{p.setVelocityY(Math.min((p.body.velocity.y||0)*1.18,GS.pyramidSpeed*1.5));}catch(e){}}
        }
        // Inferno: 360 donerek iner
        if(p.inferno&&!p.spawnProtected){
            p.angle=(p.angle||0)+dt*(p._spinRate||2.8)*(p.elite?1.4:1);
        }
        // Obsidian: nabiz atan karanlik aura
        if(p.obsidian&&!p.spawnProtected&&!p.frozen){
            p._pulseT=(p._pulseT||0)+dt;
            const pulse=0.75+Math.sin(p._pulseT*0.003)*0.2;
            try{if(!p._staggering)p.setAlpha(pulse);}catch(e){}
        }
        // Glacier: buz parcaciği efekti
        if(p.glacier&&!p.spawnProtected&&Math.random()<0.003){
            const fg=S.add.graphics().setDepth(5);
            fg.x=p.x+Phaser.Math.Between(-12,12); fg.y=p.y+Phaser.Math.Between(-8,8);
            fg.lineStyle(1,0x88ddff,0.55); fg.lineBetween(0,0,Phaser.Math.Between(-6,6),Phaser.Math.Between(-6,6));
            S.tweens.add({targets:fg,alpha:0,y:fg.y+10,duration:400,onComplete:()=>fg.destroy()});
        }
        if(p.spiker){p.spikeTimer=(p.spikeTimer||0)+dt;if(p.spikeTimer>2800){p.spikeTimer=0;const spike=S.add.graphics().setDepth(7);spike.fillStyle(0xffcc00,0.9);spike.fillTriangle(p.x,p.y+5,p.x-4,p.y+18,p.x+4,p.y+18);S.tweens.add({targets:spike,y:spike.y+55,alpha:0,duration:750,onComplete:()=>spike.destroy()});}}
        if(p.toxic){p.toxTimer=(p.toxTimer||0)+dt;if(p.toxTimer>1400){p.toxTimer=0;const tox=S.add.circle(p.x,p.y,14,0x66ff00,0.15).setDepth(6);S.tweens.add({targets:tox,scaleX:2.8,scaleY:2.8,alpha:0,duration:900,onComplete:()=>tox.destroy()});const ddx=S.player.x-p.x,ddy=S.player.y-p.y;if(ddx*ddx+ddy*ddy<55*55)damagePlayer(S);}}
        // Chain — yakın düşmanlara şimşek çaktırır
        // [BUG FIX] _activeEnemies null guard tutarlı hale getirildi (healer/freezerEnemy ile aynı pattern)
        if(p.chain&&!p.spawnProtected){p._chainT=(p._chainT||0)+dt;if(p._chainT>1800){p._chainT=0;const _chainList=S._activeEnemies||[];_chainList.forEach(e=>{if(e===p||!e.active)return;const dx=e.x-p.x,dy=e.y-p.y;if(dx*dx+dy*dy<70*70){const lg=S.add.graphics().setDepth(18);lg.lineStyle(1,0x4488ff,0.8);lg.lineBetween(p.x,p.y,e.x,e.y);S.tweens.add({targets:lg,alpha:0,duration:150,onComplete:()=>lg.destroy()});}});}}
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

        // ZEMIN — düzeltildi: p.y merkez, displayHeight güvenilmez olabilir
        const pBase=p.y+(p.displayHeight>0?p.displayHeight*0.5:28);
        if((pBase>=GROUND_Y||p.y>=GROUND_Y-8)&&!p.groundHit){
            p.groundHit=true;
            const halfH=p.displayHeight>0?p.displayHeight*0.5:28;
            p.y=GROUND_Y-halfH;
            p.setVelocity(0,0);
            if(p.body){p.body.velocity.x=0;p.body.velocity.y=0;}
            // Zemine çarpınca patlama animasyonu (Madde 10 ile tutarlı)
            try{
                if(!S.anims.exists("anim_explode")){
                    S.anims.create({key:"anim_explode",frames:S.anims.generateFrameNumbers("pyramid_explode",{start:0,end:4}),frameRate:14,repeat:0});
                }
                if(S.textures.exists("pyramid_explode")){
                    const typeColors={normal:0xffcc55,zigzag:0x44ff88,fast:0xff4422,tank:0xaa44ff,
                        shield:0x4488ff,kamikaze:0xff6600,ghost:0x88aacc,elder:0xffcc44,
                        titan:0x9900dd,colossus:0xff2266,
                        inferno:0xFF3300,glacier:0x44ccff,phantom_tri:0xcc44ff,volt:0xffee00,obsidian:0x6600aa};
                    const isNewP2=p.inferno||p.glacier||p.phantom_tri||p.volt||p.obsidian;
                    const ex=S.add.sprite(p.x,GROUND_Y-10,"pyramid_explode",0).setDepth(22);
                    if(isNewP2){ ex.setDisplaySize(100,82); }
                    else        { ex.setScale((p.scaleX||1)*1.1); }
                    ex.setTint(typeColors[p.type]||0xffcc55);
                    ex.play("anim_explode");
                    ex.once("animationcomplete",()=>{try{ex.destroy();}catch(e){}});
                }
            }catch(e){}
            playerCollisionExplosion(S, p.x, GROUND_Y-10, p.type);
            // [HAPTIC] Piramit yere çarptığında titreşim — Telegram HapticFeedback öncelikli
            try{
                if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.HapticFeedback){
                    window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
                } else if(navigator.vibrate){
                    const _vms=p.obsidian||p.titan||p.colossus?18:p.elder||p.tank?12:8;
                    navigator.vibrate(_vms);
                }
            }catch(e){}
            // [CAMERA SHAKE] Zemine çarptığında ekran sarsılır — büyük düşman daha güçlü
            const _shakeStr=p.obsidian?0.018:p.volt?0.010:p.glacier?0.012:p.inferno?0.013:p.phantom_tri?0.008:p.titan||p.colossus?0.022:p.elder||p.tank?0.012:0.007;
            S.cameras.main.shake(150,_shakeStr);
            damagePlayer(S);
            p._groundKill=true;
            killEnemy(S,p,false);
        }
    });
}

// ── HASAR + BREAK ─────────────────────────────────────────────
function applyDmg(S,enemy,rawDmg,isCrit){
    if(!enemy||!enemy.active||!S) return;
    const gs=GS; if(!gs||gs.gameOver) return;
    if(!enemy.active||enemy.lock) return;
    let dmg=rawDmg, crit=isCrit;
    if(!crit&&Math.random()<gs.critChance){dmg*=gs.critMult;crit=true;}
    // ★ YENİ: Cryo Shatter sinerjisi — donmuş düşmana otomatik kritik
    if(gs._synergyCryoShatter&&enemy.frozen&&!crit){crit=true;dmg*=gs.critMult;}
    // ★ YENİ: Relic damage bonus uygula
    if(gs._relicDmgBonus&&gs._relicDmgBonus>1) dmg*=gs._relicDmgBonus;
    if(gs._relicGoldBonus&&gs._relicGoldBonus>1) dmg*=gs._relicGoldBonus;
    dmg=Math.max(0.5,dmg-enemy.armor);
    // Knockback
    if(gs.knockback>0&&!enemy.frozen&&enemy.body){
        const kbF=gs.knockback*80;
        enemy.body.velocity.y=Math.max(-kbF,enemy.body.velocity.y-kbF);
        enemy.body.velocity.x*=0.6;
    }
    enemy.hp-=dmg;
    showDmgNum(S,enemy.x,enemy.y-10,Math.round(dmg*10)/10,crit);

    // ── MICRO-FREEZE — kritik vuruşta oyun 1 frame durur (gerçek game feel) ──
    // [CRASH FIX] pickingUpgrade kontrolü eklendi: upgrade UI açıkken micro-freeze tetiklenmez.
    // Önceden: lockUpgrade pause yapar, _microFreeze de pause yapar, sonra 35ms'de resume eder
    // → upgrade paneli açıkken fizik yeniden başlıyordu (düşmanlar hareket ediyordu).
    // [CRASH FIX] 600ms cooldown: zincirleme pause/resume kaynaklı donmayı önler.
    const _now=Date.now();
    if(crit&&!gs._microFreeze&&!gs.pickingUpgrade&&(_upgradeLock===0)&&(!gs._lastMicroFreeze||_now-gs._lastMicroFreeze>600)){
        gs._microFreeze=true;
        gs._lastMicroFreeze=_now;
        S.physics.pause();
        S.time.delayedCall(35,()=>{
            // Sadece biz pause ettikse resume et — pickingUpgrade kontrolü
            if(!gs.gameOver&&!gs.pickingUpgrade&&_upgradeLock===0) S.physics.resume();
            gs._microFreeze=false;
        });
    }

    // ── BREAK FRAME ──
    if(!enemy.isBoss&&enemy.type!=="minion"&&enemy.active){
        const r=enemy.hp/enemy.maxHP;
        const isNewPyramid=NEW_PYRAMID_TYPES.has(enemy.type);
        // Yeni tipler pyramid_break kullanır
        const breakTex="pyramid_break";

        // Break geçişinde sabit display boyutu uygula
        // pyramid_break: 98x84/frame → normal pyramid'e setDisplaySize(78,64)
        // pyramid1-4_break: 204x408/frame → setDisplaySize(78,64) ile normalize
        const _applyBreakDisplay=()=>{
            if(isNewPyramid){
                // Yeni piramitler: her break frame'de sabit 78x64 boyut
                enemy.setDisplaySize(78,64);
                if(enemy.body){
                    enemy.body.checkCollision.none=false;
                    const _bfw=enemy.width||98,_bfh=enemy.height||84;
                    enemy.body.setSize(62,50).setOffset((_bfw-62)*0.5,(_bfh-50)*0.5);
                }
            } else {
                if(enemy.body){
                    enemy.body.checkCollision.none=false;
                    const _bfw2=enemy.width||98,_bfh2=enemy.height||84;
                    enemy.body.setSize(62,50).setOffset((_bfw2-62)*0.5,(_bfh2-50)*0.5);
                }
            }
        };

        try{
            if(r<=0.75&&r>0.50&&enemy._breakFrame!==0){
                enemy._breakFrame=0;
                if(S.textures.exists(breakTex)){
                    enemy.setTexture(breakTex,0);
                    _applyBreakDisplay();
                }
            } else if(r<=0.50&&r>0.25&&enemy._breakFrame!==1){
                enemy._breakFrame=1;
                if(S.textures.exists(breakTex)){
                    enemy.setTexture(breakTex,1);
                    _applyBreakDisplay();
                }
                S.cameras.main.shake(10,0.0015);
            } else if(r<=0.25&&r>0&&enemy._breakFrame!==2){
                enemy._breakFrame=2;
                if(S.textures.exists(breakTex)){
                    enemy.setTexture(breakTex,2);
                    _applyBreakDisplay();
                }
                S.cameras.main.shake(14,0.002);
            }
        }catch(e){}
    }
    spawnHitDebris(S,enemy.x,enemy.y-enemy.displayHeight*0.4,enemy.type,crit);

    // ── Hit stagger ──
    if(enemy.active&&enemy.body&&!enemy.frozen&&!enemy._staggering){
        const staggerDir=Math.random()<0.5?1:-1;
        enemy.body.velocity.x+=staggerDir*(crit?14:6)*(1+dmg*0.2);
        enemy._staggering=true;
        S.tweens.add({
            targets:enemy,
            angle:enemy.angle+(staggerDir*(crit?5:2.5)),
            duration:50, yoyo:true, repeat:0, ease:"Sine.easeInOut",
            onComplete:()=>{if(enemy.active){enemy.setAngle(0);enemy._staggering=false;}}
        });
    }

    // ── Hit flash + crit glow ──────────────────────────────────
    try{
        const isNewPyrHit=enemy.inferno||enemy.glacier||enemy.phantom_tri||enemy.volt||enemy.obsidian;
        if(crit){
            // Yeni piramitlerde tint uygulanmaz — kendi renkleri bozulmasın
            if(!isNewPyrHit) enemy.setTint(0xffee00);
            // [PERF] Krit VFX throttle — aynı düşmana 80ms'den sık VFX oluşturma
            const now2=Date.now();
            const lastCritVfx=enemy._lastCritVfx||0;
            if(now2-lastCritVfx>80){
                enemy._lastCritVfx=now2;
                const gr=Math.max(6,Math.min(12,enemy.displayWidth*0.35));
                // Sadece ince halka — büyük dolu circle YOK
                const ring=S.add.graphics().setDepth(22);
                ring.x=enemy.x; ring.y=enemy.y;
                ring.lineStyle(1.5,0xffee00,0.85); ring.strokeCircle(0,0,gr);
                S.tweens.add({targets:ring,scaleX:2.0,scaleY:2.0,alpha:0,duration:160,ease:"Quad.easeOut",onComplete:()=>ring.destroy()});
                // 4 kıvılcım — küçük
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
        } else {
            // Normal hit: yeni piramitlerde tint yok, diğerlerinde beyaz
            if(!isNewPyrHit) enemy.setTint(0xffffff);
        }
        // Tint temizle — yeni piramitlerde gerek yok
        if(!isNewPyrHit){
            S.time.delayedCall(crit?60:30,()=>{
                if(enemy.active&&!enemy.elite&&!enemy.isBoss) enemy.clearTint();
                else if(enemy.active) enemy.setTint(0xffdd00);
            });
        }
    }catch(e){}

    // ── Screen shake — crit güçlü, normal hafif ──
    if(crit){
        S.cameras.main.shake(22,0.003);
        // Crit: ekranda anlık sarı tint (çok hafif)
    } else if(Math.random()<0.20){
        S.cameras.main.shake(8,0.0008);
    }

    // ── Çerçeve duraksama hissi — micro-freeze sadece crit'te zaten var ──
    // Normal vuruşta: hafif düşman "geri çekme" hissi (velocity spike)
    if(!crit && enemy.active && enemy.body && !enemy.frozen){
        const pullDir = (enemy.x > S.player.x) ? 1 : -1;
        enemy.body.velocity.x += pullDir * 8;
    }

    if(enemy.hp<=0) killEnemy(S,enemy,true);
}

// ── ZORLUK DENGESİ — bağımlılık eğrisi ───────────────────────
function updateDifficultyTick(S){
    const gs=GS, min=gs.t/60000, lv=gs.level;

    // ── SPAWN DELAY — Düzeltilmiş kademeli eğri ──────────────────
    // Lv1/0dk: 2400ms (çok rahat başlangıç)
    // Lv5/1dk: ~1600ms
    // Lv10/2dk: ~1100ms
    // Lv15/3dk: ~800ms
    // Lv20+/5dk+: ~550ms minimum
    // Ani spike YOK — tamamen smooth eğri
    const lvFactor  = Math.min(lv * 45, 900);        // level katkısı max 900ms azaltır
    const timeFactor= Math.min(min * 80, 500);        // zaman katkısı max 500ms azaltır
    const baseDelay = Math.max(550, 2400 - lvFactor - timeFactor);

    // Director phase çarpanları — swarm/chaos daha az agresif erken oyunda
    const earlyGame = min < 1.0;
    const pm={
        calm:  1.8,
        wave:  1.0,
        swarm: earlyGame ? 1.2 : 0.72,   // erken oyunda swarm daha yavaş
        rush:  earlyGame ? 1.1 : 0.80,
        chaos: earlyGame ? 1.0 : 0.55,   // erken oyunda chaos yok sayılır
    };
    gs.spawnDelay=Math.max(550, baseDelay*(pm[gs.directorPhase]||1));

    // Can azsa mutlaka nefes aldır
    if(gs.health<=3)  gs.spawnDelay+=700;
    if(gs.health<=1)  gs.spawnDelay+=400;

    // Gece hafif hız artışı — ama erken oyunda değil
    if(gs.timeOfDay==="night"&&!earlyGame) gs.spawnDelay=Math.max(500,gs.spawnDelay*0.90);

    // Chaos seviyesi etkisi — sadece 1. dakikadan sonra
    if(!earlyGame&&gs._chaosLevel>0.4){
        gs.spawnDelay=Math.max(500, gs.spawnDelay*(1-(gs._chaosLevel-0.4)*0.14));
    }

    // Düşman hızı — daha yavaş başlangıç, smooth artış
    // Lv1: 80, Lv5: 105, Lv10: 140, Lv20: 200, max 230
    gs.pyramidSpeed=Math.min(230, 80 + lv*5.8 + min*4);
}

function runDirector(S){
    const gs=GS, min=gs.t/60000, hp=gs.health/gs.maxHealth;
    const phases=["calm","wave","swarm","rush","chaos"];
    // İlk 1 dakika: sadece calm/wave — ani yoğunluk yok
    if(min<1.0){
        gs.directorPhase=Math.random()<0.65?"calm":"wave";
        return;
    }
    const calmW=Math.max(0,2-min*0.7);
    const chaosW=Math.min(3,min*0.5);
    // Can azsa calm ağırlığı artar
    const wts=[hp<0.35?5:calmW, 2, min>1.2?2.5:0.5, min>1.5?2:0.5, chaosW>0?chaosW:0];
    const tot=wts.reduce((a,b)=>a+b,0);
    let r=Math.random()*tot, idx=0;
    for(let i=0;i<wts.length;i++){r-=wts[i];if(r<=0){idx=i;break;}}
    gs.directorPhase=phases[idx];
}
// ═══════════════════════════════════════════════════════════════
// PART D: Gün Döngüsü, Atmosfer, Kayan Yıldız, Sandık, UI, Slotlar
// ═══════════════════════════════════════════════════════════════

// ── GÜN DÖNGÜSÜ ──────────────────────────────────────────────
function updateDayCycle(S,delta){
    const gs=GS;
    gs.dayTimer+=delta;
    const phase=(gs.dayTimer%DAY_CYCLE)/DAY_CYCLE;

    let tDay=0,tSunset=0,tNight=0,tNov=0;
    if(phase<0.33){
        tDay=1; gs.timeOfDay="day";
    } else if(phase<0.66){
        const t=(phase-0.33)/0.33;
        tDay=1-t; tSunset=t;
        gs.timeOfDay=t<0.5?"day":"sunset";
    } else {
        const t=(phase-0.66)/0.34;
        tSunset=1-t; tNight=t; tNov=t*0.28;
        gs.timeOfDay=t<0.5?"sunset":"night";
    }

    // Yumuşak lerp — arkaplan geçişi
    const sp=0.012;
    S.bgDay.setAlpha(   Phaser.Math.Linear(S.bgDay.alpha,   tDay,   sp));
    S.bgSunset.setAlpha(Phaser.Math.Linear(S.bgSunset.alpha,tSunset,sp));
    S.bgNight.setAlpha( Phaser.Math.Linear(S.bgNight.alpha, tNight, sp));
    S.nightOverlay.setAlpha(Phaser.Math.Linear(S.nightOverlay.alpha,tNov,sp));

    // ── YILDIZLAR ──
    const nightAmt=phase>0.56?Math.min(1,(phase-0.56)/0.10):0;
    if(S.nStars){
        S.nStars.forEach(ns=>{
            if(!ns.obj.scene) return;
            if(nightAmt>0){
                // Daha dinamik titreşim — her yıldız farklı frekans
                const baseFreq=ns.spd*(1.2+ns.base*0.8);
                const twinkle=0.4+0.6*Math.abs(Math.sin(gs.t*0.001*baseFreq+(ns.phase||0)));
                const ta=nightAmt*ns.base*twinkle;
                ns.obj.setAlpha(Phaser.Math.Linear(ns.obj.alpha,ta,0.06));
                // Parlak yıldızlar renk kayması: mavi-beyaz arası
                if(ns.base>0.8&&twinkle>0.88){
                    const rc=Math.floor(220+twinkle*35);
                    const gc=Math.floor(220+twinkle*35);
                    const bc=255;
                    try{ns.obj.setFillStyle(Phaser.Display.Color.GetColor(rc,gc,bc));}catch(e){}
                } else if(ns.base>0.6){
                    try{ns.obj.setFillStyle(0xffffff);}catch(e){}
                }
                // Nadir parlama spike
                if(ns.base>0.85&&Math.random()<0.0008){
                    ns.obj.setAlpha(1.0);
                }
            } else {
                ns.obj.setAlpha(ns.obj.alpha>0.01?Phaser.Math.Linear(ns.obj.alpha,0,0.05):0);
            }
        });
    }

    // ── GÜNDÜZ ISI DALGASI — zemin üzerinde hafif shimmer ──
    if(phase<0.35&&nightAmt===0){
        if(!S._heatWaves) S._heatWaves=[];
        gs._heatTimer=(gs._heatTimer||0)+delta;
        if(gs._heatTimer>1800){
            gs._heatTimer=0;
            const hwx=Phaser.Math.Between(30,330);
            const hw=S.add.graphics().setDepth(1);
            hw.fillStyle(0xffffff,0.0);
            hw.lineStyle(1,0xffffee,0.07);
            hw.strokeEllipse(hwx,GROUND_Y-8,Phaser.Math.Between(30,70),4);
            S.tweens.add({targets:hw,y:hw.y-Phaser.Math.Between(20,50),alpha:0,
                scaleX:1.4,duration:Phaser.Math.Between(800,1400),ease:"Quad.easeOut",
                onComplete:()=>hw.destroy()});
        }
    }

    // ── BULUTLAR — arkaplan fazına göre renk değişir ──
    // Gündüz→sunset: portakal/kırmızı; sunset→gece: mor/lacivert
    if(S.clouds){
        S.clouds.forEach(c=>{
            if(!c||!c.scene) return;
            let tr=255,tg=255,tb=255;
            if(phase>=0.28&&phase<0.60){
                // Sunset öncesi: kızarma başlıyor (gündüzden önce hafif)
                const t=Phaser.Math.Clamp((phase-0.28)/0.32,0,1);
                tr=255; tg=Math.round(255-110*t); tb=Math.round(255-160*t);
            } else if(phase>=0.60){
                // Gece: lacivert/mor
                const t=Phaser.Math.Clamp((phase-0.60)/0.38,0,1);
                tr=Math.round(255-190*t); tg=Math.round(145-130*t); tb=Math.round(95+80*t);
            }
            if(!c.curR){c.curR=255;c.curG=255;c.curB=255;}
            c.curR=Math.round(Phaser.Math.Linear(c.curR,tr,0.016));
            c.curG=Math.round(Phaser.Math.Linear(c.curG,tg,0.016));
            c.curB=Math.round(Phaser.Math.Linear(c.curB,tb,0.016));
            try{c.setTint(Phaser.Display.Color.GetColor(c.curR,c.curG,c.curB));}catch(e){}
        });
    }

    // Zemin glow — consistent arkaplan rengiyle
    if(S.groundGlow){
        S.groundGlow.clear();
        if(gs.timeOfDay==="night"){
            S.groundGlow.fillStyle(0x001144,0.18); S.groundGlow.fillRect(0,GROUND_Y-2,360,8);
        } else if(gs.timeOfDay==="sunset"){
            S.groundGlow.fillStyle(0xcc4400,0.10); S.groundGlow.fillRect(0,GROUND_Y-2,360,8);
        } else {
            S.groundGlow.fillStyle(0xddaa44,0.06); S.groundGlow.fillRect(0,GROUND_Y-2,360,8);
        }
    }

    // ── KAYAN YILDIZLAR — sadece gece, belli aralıklar ──
    gs.ssTimer=(gs.ssTimer||0)+delta;
    if(gs.timeOfDay==="night"){
        // Rastgele aralık: 1800–3500ms arası her biri farklı
        if(gs.ssTimer>Phaser.Math.Between(1800,3500)){
            gs.ssTimer=0;
            spawnShootingStar(S);
        }
    }

    // Kayan yıldız tick
    for(let i=S.sStars.length-1;i>=0;i--){
        const st=S.sStars[i];
        st.life-=delta;
        if(!st.obj||!st.obj.scene){S.sStars.splice(i,1);continue;}
        st.obj.x+=st.vx*delta/1000;
        st.obj.y+=st.vy*delta/1000;
        const lr=Math.max(0,st.life/(st.maxLife||2200));
        st.obj.setAlpha(Math.min(1,lr*3));
        st.obj.setRotation(st.angle);
        // İz segmentleri
        if(st.trails){
            const ox=Math.cos(st.angle+Math.PI), oy=Math.sin(st.angle+Math.PI);
            st.trails.forEach((tr,ti)=>{
                if(!tr||!tr.scene) return;
                const dist=8+ti*10;
                tr.x=st.obj.x+ox*dist; tr.y=st.obj.y+oy*dist;
                tr.setRotation(st.angle);
                tr.setAlpha(Math.max(0,(0.8*(1-ti/st.trails.length*0.8))*Math.min(1,lr*3.5)));
            });
        }
        if(st.life<=0||st.obj.x>420||st.obj.y>290){
            try{st.obj.destroy();}catch(e){}
            if(st.trails) st.trails.forEach(tr=>{try{if(tr&&tr.scene)tr.destroy();}catch(e){}});
            S.sStars.splice(i,1);
        }
    }
}

// ── KAYAN YILDIZ — ince uzun, iz ile ──
function spawnShootingStar(S){
    // Farklı başlangıç konumları — gerçekçi
    const x=Phaser.Math.Between(-30,200);
    const y=Phaser.Math.Between(5,65);
    const speed=Phaser.Math.Between(280,430);
    const angle=Phaser.Math.FloatBetween(0.18,0.42);
    const vx=Math.cos(angle)*speed, vy=Math.sin(angle)*speed;

    // Ana yıldız — ince uzun 1×6
    const star=S.add.rectangle(x,y,1,6,0xffffff,1).setDepth(7);
    star.setRotation(angle);
    star.setBlendMode(Phaser.BlendModes.ADD);

    // İz — 10 segment
    const trails=[];
    for(let i=0;i<10;i++){
        const prog=i/10;
        const h=Math.round(5+prog*16);  // 5→21px uzayan iz
        const br=Math.round(240*(1-prog*0.6));
        const col=Phaser.Display.Color.GetColor(Math.min(255,br+20),Math.min(255,br+20),255);
        const t=S.add.rectangle(x,y,1,h,col,0.85*(1-prog*0.78)).setDepth(6);
        t.setRotation(angle);
        t.setBlendMode(Phaser.BlendModes.ADD);
        trails.push(t);
    }
    const life=Math.max(1600,(500/speed)*1000+200);
    S.sStars.push({obj:star,trails,vx,vy,angle,life,maxLife:life});
}

// ── ATMOSFER ─────────────────────────────────────────────────
function tickAtmosphere(S,delta){
    const gs=GS, dt=delta/1000;

    // Bulutlar
    S.clouds.forEach(c=>{
        if(!c||!c.scene||!c.vx) return;
        c.x+=c.vx*dt;
        if(c.x<-145){c.x=435;c.y=Phaser.Math.Between(35,165);try{c.setTexture(Math.random()<0.5?"cloud1":"cloud2");}catch(e){}c.curR=null;}
        if(c.x>435){c.x=-145;c.y=Phaser.Math.Between(35,165);try{c.setTexture(Math.random()<0.5?"cloud1":"cloud2");}catch(e){}c.curR=null;}
    });

    // ── Kum — rüzgar + gust sistemi ──────────────────────────────
    S._sandWind=(S._sandWind||0)+delta;
    const windBase=0.88+Math.sin(S._sandWind*0.00028)*0.52;
    // Periyodik güçlü gust
    const gustPhase=Math.sin(S._sandWind*0.00011);
    const gustMult=gustPhase>0.72?1.0+(gustPhase-0.72)*4.5:1.0;
    const windStr=windBase*gustMult;
    S.sandPtcl.forEach(sp=>{
        sp.wave+=sp.waveSpd*dt;
        sp.obj.x+=sp.vx*windStr*dt;
        sp.obj.y+=Math.sin(sp.wave)*sp.waveAmp*(0.8+gustMult*0.2);
        if(sp.obj.x<-8){sp.obj.x=368;sp.obj.y=Phaser.Math.Between(280,452);}
        if(sp.obj.x>368){sp.obj.x=-8;sp.obj.y=Phaser.Math.Between(280,452);}
    });
    // Gust sırasında ekstra uzun toz şeritleri
    if(gustMult>2.0&&Math.random()<0.25){
        const gp=S.add.rectangle(372,Phaser.Math.Between(310,445),
            Phaser.Math.Between(8,18),1,0xddbb88,0.14).setDepth(2);
        S.tweens.add({targets:gp,x:-12,alpha:0,
            duration:Phaser.Math.Between(500,900),ease:"Quad.easeIn",
            onComplete:()=>gp.destroy()});
    }

    // Toz — önceki tarz ayak izi
    gs.dustTimer=(gs.dustTimer||0)+delta;
    if(gs.dustTimer>80&&Math.abs(S.player.body.velocity.x)>40){
        gs.dustTimer=0; spawnDustPuff(S,S.player.x,GROUND_Y);
    }
    for(let i=S.dustPtcl.length-1;i>=0;i--){
        const d=S.dustPtcl[i];
        if(!d.obj.scene){S.dustPtcl.splice(i,1);continue;}
        d.life-=delta;
        d.obj.x+=d.vx*dt; d.obj.y+=d.vy*dt; d.vy+=0.30;
        d.obj.setAlpha(Math.max(0,d.life/280*0.42));
        if(d.life<=0){try{d.obj.destroy();}catch(e){}S.dustPtcl.splice(i,1);}
    }

    // Tumbleweed
    gs.tumbTimer=(gs.tumbTimer||0)+delta;
    if(gs.tumbTimer>12000){gs.tumbTimer=0;spawnTumbleweed(S);}
    for(let i=S.tumbles.length-1;i>=0;i--){
        const t=S.tumbles[i];
        if(!t.obj.scene){S.tumbles.splice(i,1);continue;}
        t.obj.x+=t.vx*dt;
        t.obj.y=GROUND_Y-7+Math.sin(t.obj.x*0.12)*5;
        t.obj.angle+=t.spin;
        if(t.obj.x<-40||t.obj.x>400){try{t.obj.destroy();}catch(e){}S.tumbles.splice(i,1);}
    }

    // Kuşlar — sadece gündüz
    gs.birdTimer=(gs.birdTimer||0)+delta;
    if(gs.birdTimer>6500&&gs.timeOfDay==="day"){gs.birdTimer=0;spawnBird(S);}
    for(let i=S.birds.length-1;i>=0;i--){
        const b=S.birds[i];
        if(!b.obj.scene){S.birds.splice(i,1);continue;}
        b.obj.x+=b.vx*dt;
        b.wingT+=delta*0.009; b.obj.y+=Math.sin(b.wingT)*0.4;
        if(b.obj.x>450){try{b.obj.destroy();}catch(e){}S.birds.splice(i,1);}
    }
}

function spawnDustPuff(S,x,y){
    const dirX=S.player.body.velocity.x>0?-1:1;
    const speed=Math.abs(S.player.body.velocity.x||0);
    const cnt=Math.min(8,4+Math.floor(speed/80));
    const dustCols=[0xeeddbb,0xddcc99,0xccbb88,0xffffff];
    for(let i=0;i<cnt;i++){
        const sz=Phaser.Math.Between(2,i<3?5:3);
        const d=S.add.graphics().setDepth(4);
        d.x=x+dirX*Phaser.Math.Between(2,12);
        d.y=y-Phaser.Math.Between(0,5);
        const dstAng=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        d.lineStyle(Math.max(1,sz*0.5),dustCols[i%4],Phaser.Math.FloatBetween(0.4,0.8));
        d.lineBetween(0,0,Math.cos(dstAng)*sz,Math.sin(dstAng)*sz);
        S.dustPtcl.push({
            obj:d,
            vx:dirX*Phaser.Math.Between(10,28),
            vy:-Phaser.Math.Between(10,28),
            life:140+i*35
        });
    }
}
function spawnTumbleweed(S){
    const fl=Math.random()<0.5,x=fl?-15:385;
    const g=S.add.graphics().setDepth(3).setPosition(x,GROUND_Y-7);
    g.fillStyle(0x664422);g.fillCircle(0,0,6);g.fillStyle(0xaa7744);g.fillCircle(0,0,3);
    g.lineStyle(1,0x553322,0.7);g.lineBetween(-6,0,6,0);g.lineBetween(0,-6,0,6);g.lineBetween(-4,-4,4,4);g.lineBetween(4,-4,-4,4);
    const sp=Phaser.Math.FloatBetween(55,100);
    S.tumbles.push({obj:g,vx:fl?sp:-sp,spin:fl?5:-5});
}
function spawnBird(S){
    const y=Phaser.Math.Between(75,180);
    const g=S.add.graphics().setDepth(2).setPosition(-20,y);
    g.fillStyle(0x222211,0.65);
    g.fillRect(-5,-2,5,2);g.fillRect(0,-3,5,2);g.fillRect(-2,-4,2,2);
    S.birds.push({obj:g,vx:Phaser.Math.FloatBetween(42,78),wingT:0});
}

// ── SANDIK NADİRLİK ───────────────────────────────────────────
function getChestRarity(gs){
    const time=gs.t/60000, roll=Math.random();
    const legendChance=Math.min(0.08,0.01+gs.level*0.004+time*0.008);
    const rareChance=Math.min(0.35,0.08+gs.level*0.012+time*0.012);
    if(roll<legendChance) return CHEST_RARITY.LEGENDARY;
    if(roll<rareChance)   return CHEST_RARITY.RARE;
    return CHEST_RARITY.COMMON;
}

function spawnChest(S,x,y){
    const gs=GS;
    const rarity=getChestRarity(gs);
    const texKey=rarity===CHEST_RARITY.LEGENDARY?"tex_chest_legendary":rarity===CHEST_RARITY.RARE?"tex_chest_rare":"tex_chest_common";
    const chest=S.add.image(x,y,texKey).setDepth(7).setScale(1.3);
    chest._rarity=rarity;

    let vy=-48,vx=Phaser.Math.Between(-20,20),landed=false;
    const arrow=S.add.graphics().setDepth(8);
    const glow=S.add.graphics().setDepth(6);
    const arrowBob={t:0};

    const tick=S.time.addEvent({delay:16,loop:true,callback:()=>{
        if(!chest.scene){tick.remove();try{arrow.destroy();}catch(e){}try{glow.destroy();}catch(e){}return;}
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
            tick.remove();try{arrow.destroy();}catch(e){}try{glow.destroy();}catch(e){}
            openChestScreen(S,chest,rarity);
        }
    }});
    S.time.delayedCall(22000,()=>{if(chest&&chest.scene){tick.remove();try{arrow.destroy();}catch(e){}try{glow.destroy();}catch(e){}try{chest.destroy();}catch(e){}}});
}

function openChestScreen(S,chest,rarity){
    const cx=chest.x||180;
    try{chest.destroy();}catch(e){}
    const gs=GS;
    if(gs.pickingUpgrade || _upgradeLock > 0) return;
    // [UX FIX] Shake hafifletildi, flash kaldırıldı
    S.cameras.main.shake(rarity.shakeAmp*80, rarity.shakeAmp*0.4);
    // [UX FIX] Fizik + spawn tamamen dondur — mutex ile
    lockUpgrade(gs, S);

    // [V2.3] SANDIK KURALI — Vampire Survivors mantığı
    // SADECE oyuncunun slotundaki upgrade'ler gelir. Can/hasar asla çıkmaz.
    // Slotta hiçbir şey yoksa veya hepsi max ise → küçük altın bonus.

    // Slottaki weapon ve passive'leri bul (level>0, max olmayan)
    const upgradableWeapons = Object.entries(UPGRADES).filter(([k,u])=>
        u.type==="weapon" && u.level>0 && u.level<u.max
    );
    const upgradablePassives = Object.entries(UPGRADES).filter(([k,u])=>
        u.type==="passive" && u.level>0 && u.level<u.max
    );
    const upgradableAll = [...upgradableWeapons, ...upgradablePassives];

    // Her upgrade için bir reward entry oluştur
    const upgradeRewards = upgradableAll.map(([k,u])=>({
        key: k,
        nameKey: u.nameKey,
        icon: u.icon,
        descKey: u.descKey,
        action: ()=>{
            // Upgrade'i bir level artır (soft cap ile)
            switch(k){
                case"damage":   gs.damage=Math.min(999,gs.damage*(1+0.08*(1-Math.min(0.45,(u.level-1)*0.07)))); break;
                case"attack":   gs.shootDelay=Math.max(120,gs.shootDelay*(0.92+Math.min(0.06,(u.level-1)*0.015))); break;
                case"speed":    gs.moveSpeed=Math.min(280,gs.moveSpeed*1.06); break;
                case"crit":     gs.critChance+=0.05; break;
                case"maxhp":    gs.maxHealth+=3;gs.health=Math.min(gs.health+3,gs.maxHealth);gs._healFlash=400; break;
                case"xpboost":  gs.xpMult+=0.08; break;
                case"pierce":   gs.pierceCount++; break;
                case"freeze":   gs.freezeChance+=0.06; break;
                case"knockback":gs.knockback=Math.min(1,gs.knockback+0.3); break;
                case"magnet":   gs.magnetRadius+=40; break;
                default: break; // weapon tier'lar zaten tickWeapons ile scale eder
            }
            // Level artır ama max geçme
            if(u.level<u.max) u.level++;
        }
    }));

    const rewardCount = rarity.rewards;
    let selected = [];

    if(upgradeRewards.length === 0){
        // Slotta upgradeable hiçbir şey yok — sadece altın ver
        gs.gold += Math.round(80 * gs.goldMult * (rarity===CHEST_RARITY.LEGENDARY?3:rarity===CHEST_RARITY.RARE?1.5:1));
        PLAYER_GOLD=gs.gold; localStorage.setItem("nt_gold",PLAYER_GOLD);
    } else {
        // Karıştır ve seç
        const shuffled=[...upgradeRewards].sort(()=>Math.random()-0.5);
        selected = shuffled.slice(0, Math.min(rewardCount, shuffled.length));
    }

    const W=360,H=640;
    const panelH=Math.min(540,82+selected.length*64+90);
    const panelY=Math.max(16,H/2-panelH/2);
    const ui=new UIGroup(S);

    const ov=ui.add(S.add.rectangle(W/2,H/2,W,H,0x000000,0.78).setDepth(200));
    const pg=ui.add(S.add.graphics().setDepth(201));
    pg.fillStyle(0x090912,0.98);pg.fillRect(28,panelY,304,panelH);
    pg.lineStyle(2,rarity.color,0.95);pg.strokeRect(28,panelY,304,panelH);
    pg.lineStyle(1,rarity.glowColor,0.35);pg.strokeRect(32,panelY+4,296,panelH-8);
    pg.fillStyle(rarity.color,0.18);pg.fillRect(28,panelY,304,34);

    const titleTxt=ui.add(S.add.text(W/2,panelY+17,L(rarity.label),{
        font:"bold 13px 'Courier New'",
        color:rarity===CHEST_RARITY.LEGENDARY?"#ffcc00":rarity===CHEST_RARITY.RARE?"#aa44ff":"#4488ff",
        stroke:"#000",strokeThickness:4,letterSpacing:2
    }).setOrigin(0.5).setDepth(202).setAlpha(0));

    const chestTexKey=rarity===CHEST_RARITY.LEGENDARY?"tex_chest_legendary":rarity===CHEST_RARITY.RARE?"tex_chest_rare":"tex_chest_common";
    const chestIco=ui.add(S.add.image(W/2,panelY+68,chestTexKey).setScale(4.0).setDepth(202).setAlpha(0));

    S.tweens.add({targets:[ov,pg,titleTxt],alpha:1,duration:180});
    S.tweens.add({targets:chestIco,alpha:1,duration:200,onComplete:()=>{
        const rep=rarity===CHEST_RARITY.LEGENDARY?16:rarity===CHEST_RARITY.RARE?11:7;
        const shakeAng=rarity===CHEST_RARITY.LEGENDARY?22:13;
        S.tweens.add({targets:chestIco,angle:shakeAng,duration:50,yoyo:true,repeat:rep,ease:"Sine.easeInOut",
        onComplete:()=>{
            // ── AAA SANDIK AÇILIŞ VFX ──
            vfxChestOpen(S,W/2,panelY+68,rarity);

            selected.forEach((reward,ri)=>{
                const ry=panelY+108+ri*64;
                const rg=ui.add(S.add.graphics().setDepth(202));
                rg.fillStyle(0x0e0e1e,0.92);rg.fillRect(36,ry,288,58);
                rg.lineStyle(1,rarity.color,0.55);rg.strokeRect(36,ry,288,58);
                let ico=null;
                const iconKey=reward.icon||"icon_damage";
                try{ico=ui.add(S.add.image(72,ry+29,iconKey).setScale(1.7).setDepth(203).setAlpha(0));}catch(e){}
                // nameKey varsa onu kullan, yoksa key'i L() ile çevir
                const rewardName = reward.nameKey ? L(reward.nameKey) : L(reward.key);
                const rl=ui.add(S.add.text(102,ry+16,rewardName,{font:"bold 13px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:3}).setDepth(203).setAlpha(0));
                // descKey varsa açıklama göster
                const descStr = reward.descKey ? L(reward.descKey) : L("earned");
                const rs=ui.add(S.add.text(102,ry+36,descStr,{font:"bold 10px 'Courier New'",color:"#777799",stroke:"#000",strokeThickness:2,wordWrap:{width:200}}).setDepth(203).setAlpha(0));
                S.time.delayedCall(ri*110,()=>{
                    S.tweens.add({targets:[ico,rl,rs].filter(Boolean),alpha:1,duration:180,ease:"Back.easeOut"});
                    if(ico) S.tweens.add({targets:ico,scaleX:2.1,scaleY:2.1,duration:160,yoyo:true,ease:"Back.easeOut"});
                    reward.action();
                });
            });

            // Slotta hiçbir şey yoktu → altın mesajı göster
            if(selected.length===0){
                const emptyTxt=ui.add(S.add.text(W/2,panelY+130,"⬡ ALTIN BONUS",{
                    font:"bold 14px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:4
                }).setOrigin(0.5).setDepth(203).setAlpha(0));
                S.tweens.add({targets:emptyTxt,alpha:1,duration:220});
            }

            const minG=40+Math.floor(gs.t/60000)*20;
            const maxG=130+Math.floor(gs.t/60000)*45;
            const gBase=Phaser.Math.Between(minG,maxG);
            const gEarned=rarity===CHEST_RARITY.LEGENDARY?gBase*3:rarity===CHEST_RARITY.RARE?Math.round(gBase*1.5):gBase;

            S.time.delayedCall(selected.length*110+200,()=>{
                const gl=ui.add(S.add.text(W/2,panelY+panelH-52,"",{
                    font:"bold 18px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:4
                }).setOrigin(0.5).setDepth(203).setAlpha(0));
                S.tweens.add({targets:gl,alpha:1,duration:130});

                let rainRunning=true;
                const rainInterval=S.time.addEvent({delay:55,loop:true,callback:()=>{
                    if(!rainRunning||!GS||GS.gameOver) return;
                    const rx=Phaser.Math.Between(32,328);
                    const gem=S.add.image(rx,panelY,Phaser.Utils.Array.GetRandom(["xp_blue","xp_blue","xp_green","xp_red","xp_gold"])).setDepth(205).setScale(1.0).setAlpha(0.9);
                    S.tweens.add({targets:gem,y:panelY+panelH*0.65,duration:Phaser.Math.Between(600,1050),ease:"Cubic.easeIn",alpha:0.65,onComplete:()=>{try{gem.destroy();}catch(e){}}});
                }});
                ui.add({destroy:()=>{rainRunning=false;rainInterval.remove();}});

                let cur=0;
                const step=Math.max(1,Math.ceil(gEarned/18));
                const ticker=S.time.addEvent({delay:30,loop:true,callback:()=>{
                    cur=Math.min(gEarned,cur+step);
                    gl.setText("⬡ +"+Math.round(cur));
                    if(cur>=gEarned){ticker.remove();gs.gold+=Math.round(gEarned);}
                }});
                ui.add({destroy:()=>ticker.remove()});

                S.time.delayedCall(3200,()=>{
                    rainRunning=false;
                    ui.fadeAndDestroy(230);
                    S.time.delayedCall(280,()=>{ S.time.timeScale=1.0; unlockUpgrade(gs,S); refreshSlots(S); });
                });

                // [UX] SPACE tuşu ile sandık animasyonunu anında atla
                const _skipKey=S.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
                const _skipFn=()=>{
                    rainRunning=false;
                    _skipKey.off("down",_skipFn);
                    ui.fadeAndDestroy(120);
                    S.time.delayedCall(140,()=>{ S.time.timeScale=1.0; unlockUpgrade(gs,S); refreshSlots(S); });
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

    // [VFX YENİ] Aktif relic aurası — oyuncu etrafında nabızlı halka
    if(gs.activeRelics&&gs.activeRelics.length>0){
        const relicAuraT=t*1.8;
        gs.activeRelics.forEach((id,ri)=>{
            const r=RELICS.find(x=>x.id===id);
            if(!r) return;
            const auraR=24+ri*6;
            const auraAlpha=0.06+Math.sin(relicAuraT+ri*1.5)*0.04;
            S.playerGlow.lineStyle(1,r.color,auraAlpha*3);
            S.playerGlow.strokeCircle(px,py-14,auraR+Math.sin(relicAuraT+ri)*3);
        });
    }

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
    S.xpBarBg=S.add.graphics().setDepth(D+3);
    S.xpBarBg.fillStyle(0x000000,0.7); S.xpBarBg.fillRect(0,0,W,10);
    S.xpBarBg.lineStyle(1,0x1133aa,0.4); S.xpBarBg.lineBetween(0,10,W,10);

    S.xpBarFill=S.add.rectangle(0,5,0,8,0x2277ff,1).setOrigin(0,0.5).setDepth(D+4);
    S.xpBarGlow=S.add.rectangle(0,5,0,14,0x0055ff,0.18).setOrigin(0,0.5).setDepth(D+3);
    S._xpBarShine=S.add.rectangle(0,5,0,2,0xffffff,0.25).setOrigin(0,0.5).setDepth(D+5);

    // ── SKOR — üst orta ──────────────────────────────────────
    S.scoreText=S.add.text(W/2,20,"0",{
        font:"bold 14px 'Courier New'",color:"#ffffff",
        stroke:"#000000",strokeThickness:5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(D+6);

    // ── SAĞ ÜST: Level, Kills, Gold, Crystal — alt alta hizalı ──
    S.levelText=S.add.text(W-8,11,"Lv 1",{
        font:"bold 11px 'Courier New'",color:"#ffdd44",
        stroke:"#000000",strokeThickness:4
    }).setOrigin(1,0).setScrollFactor(0).setDepth(D+5);

    S.killText=S.add.text(W-8,25,"☠ 0",{
        font:"bold 9px 'Courier New'",color:"#ff9977",
        stroke:"#000000",strokeThickness:3
    }).setOrigin(1,0).setScrollFactor(0).setDepth(D+5);

    S.goldText=S.add.text(W-8,38,"⬡ 0",{
        font:"bold 11px 'Courier New'",color:"#ffdd44",
        stroke:"#000000",strokeThickness:4
    }).setOrigin(1,0).setScrollFactor(0).setDepth(D+5);

    S._crystalHudText=S.add.text(W-8,52,"💎 "+PLAYER_CRYSTAL,{
        font:"bold 9px 'Courier New'",color:"#cc66ff",
        stroke:"#000000",strokeThickness:3
    }).setOrigin(1,0).setScrollFactor(0).setDepth(D+5).setVisible(false);

    // ── PAUSE butonu — sağ üst bloğun altında ─────────────────
    const pBg=S.add.graphics().setScrollFactor(0).setDepth(D+5);
    const drawP=hov=>{
        pBg.clear();
        pBg.fillStyle(0x000000,hov?0.8:0.50);
        pBg.fillRoundedRect(W-36,62,28,20,4);
        pBg.lineStyle(1,0x888888,hov?0.9:0.35);
        pBg.strokeRoundedRect(W-36,62,28,20,4);
        pBg.fillStyle(0xffffff,hov?1.0:0.45);
        pBg.fillRect(W-29,66,4,12);
        pBg.fillRect(W-19,66,4,12);
    };
    drawP(false);
    const pH=S.add.rectangle(W-22,72,36,24,0xffffff,0.001).setScrollFactor(0).setInteractive().setDepth(D+6);
    pH.on("pointerover",()=>drawP(true)).on("pointerout",()=>drawP(false));
    pH.on("pointerdown",()=>showPause(S));

    // ── COMBO ─────────────────────────────────────────────────
    S.comboText=S.add.text(W/2,310,"",{
        font:"bold 16px 'Courier New'",color:"#ffdd00",
        stroke:"#110000",strokeThickness:5
    }).setOrigin(0.5).setDepth(D+5);
}

function renderUI(S){
    const gs=GS;
    if(!gs||gs.gameOver) return;
    updateDifficultyTick(S);

    // XP bar — animasyonlu genişleme
    const ratio=Math.min(1,gs.xp/gs.xpToNext);
    const targetW=360*ratio;
    S.xpBarFill.width=Phaser.Math.Linear(S.xpBarFill.width,targetW,0.12);
    S.xpBarGlow.width=S.xpBarFill.width;
    // [UI] Shine efekti — XP bar üst parlaklığı
    if(S._xpBarShine) S._xpBarShine.width=S.xpBarFill.width;
    // Doluluğa göre renk
    const xpColor=ratio>0.8?0x44ffaa:ratio>0.5?0x2277ff:0x1155cc;
    S.xpBarFill.setFillStyle(xpColor);

    S.levelText.setText("Lv "+gs.level);
    S.killText.setText("☠ "+gs.kills);
    if(S.scoreText) S.scoreText.setText(gs.score.toLocaleString());

    // Altın — yavaş sayaç
    if(!S._goldDisplay) S._goldDisplay=0;
    S._goldDisplay=Math.floor(S._goldDisplay+(gs.gold-S._goldDisplay)*0.08);
    S.goldText.setText("⬡ "+S._goldDisplay);
    // Kristal — statik (değişmez sık sık)
    if(S._crystalHudText) S._crystalHudText.setText("💎 "+PLAYER_CRYSTAL);

    // Combo — güçlü görsel
    if(gs.combo>1){
        S.comboText.setText("× "+gs.combo+" COMBO");
        S.comboText.setAlpha(0.85+Math.sin(gs.t*0.025)*0.15);
        S.comboText.setScale(Math.min(1.25,1+gs.combo*0.018));
        S.comboText.setColor(gs.combo>=15?"#ff2244":gs.combo>=10?"#ff6600":gs.combo>=5?"#ffaa00":"#ffdd00");
    } else { S.comboText.setText("").setScale(1); }

    // [UPGRADE VİZÜEL] Slot'ları 500ms'de bir güncelle — level bazlı pulse için
    if(!S._slotRefreshTimer) S._slotRefreshTimer=0;
    S._slotRefreshTimer+=(S.game.loop.delta||16);
    if(S._slotRefreshTimer>500){S._slotRefreshTimer=0;refreshSlots(S);}

    // Quest HUD — oyun içinde artık gösterilmiyor
    // [UI POLISH] Görevler sadece menüde "Günlük Görevler" bölümünde listelenir
    // Oyun içi sürekli yazı kaldırıldı — temiz UI

    // [VFX] Aktif relic göstergesi — sağ üst, nabızlı, şık kart tasarımı
    if(gs.activeRelics&&gs.activeRelics.length>0&&!S._relicHudBuilt){
        S._relicHudBuilt=true;
        const W=360;
        // Eski relic HUD objelerini temizle
        if(S._relicHudObjs){ S._relicHudObjs.forEach(o=>{try{o.destroy();}catch(e){}});}
        S._relicHudObjs=[];
        gs.activeRelics.forEach((id,i)=>{
            const r=RELICS.find(x=>x.id===id);
            if(!r) return;
            const rx=W-4, ry=58+i*22;
            const rb=S.add.graphics().setDepth(52);
            // Gradient kart — relic rengiyle
            rb.fillStyle(0x000000,0.55); rb.fillRoundedRect(rx-48,ry-9,44,18,4);
            rb.fillStyle(r.color,0.15); rb.fillRoundedRect(rx-48,ry-9,44,18,4);
            rb.lineStyle(1.5,r.color,0.8); rb.strokeRoundedRect(rx-48,ry-9,44,18,4);
            rb.fillStyle(r.color,0.6); rb.fillRoundedRect(rx-48,ry-9,3,18,{tl:4,tr:0,bl:4,br:0});
            S._relicHudObjs.push(rb);
            const ricn=S.add.text(rx-36,ry,r.icon,{font:"10px 'Courier New'"})
                .setOrigin(0.5).setDepth(53);
            S._relicHudObjs.push(ricn);
            const rnm=S.add.text(rx-8,ry, LLang(r,"name","nameEN","nameRU").substring(0,6),{
                font:"bold 7px 'Courier New'",
                color: Phaser.Display.Color.IntegerToColor(r.color).rgba,
                stroke:"#000",strokeThickness:2
            }).setOrigin(1,0.5).setDepth(53);
            S._relicHudObjs.push(rnm);
            // Nabız animasyonu
            S.tweens.add({targets:rb, scaleX:1.05, scaleY:1.05,
                duration:900, yoyo:true, repeat:-1, ease:"Sine.easeInOut", delay:i*200});
        });
    }
}

function showPause(S){
    const gs=GS; if(gs.pickingUpgrade||gs.gameOver) return;
    gs.pickingUpgrade=true;
    S.physics.pause();
    S.time.timeScale=0;
    if(S.spawnEvent) S.spawnEvent.paused=true;
    _hideMobileBtns(S);
    const W=360,H=640;
    const pauseObjs=[];

    // Overlay
    const pov=S.add.rectangle(W/2,H/2,W,H,0x000000,0.72).setDepth(500); pauseObjs.push(pov);

    // Ana panel — büyük, kaydırılabilir hissi
    const PX=12,PY=10,PW=336,PH=620;
    const ppg=S.add.graphics().setDepth(501); pauseObjs.push(ppg);
    ppg.fillStyle(0x06000e,0.98); ppg.fillRoundedRect(PX,PY,PW,PH,10);
    ppg.lineStyle(2,0x4488aa,0.6); ppg.strokeRoundedRect(PX,PY,PW,PH,10);
    ppg.fillStyle(0x4488aa,0.10); ppg.fillRoundedRect(PX,PY,PW,34,{tl:10,tr:10,bl:0,br:0});

    // Başlık
    const ptxt=S.add.text(W/2,PY+17,L("paused"),{font:"bold 13px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:3}).setOrigin(0.5).setDepth(502); pauseObjs.push(ptxt);

    let cy=PY+42; // mevcut y pozisyonu

    // ── STATS BÖLÜMÜ ──────────────────────────────────────────
    const addSec=(title,col)=>{
        const sg=S.add.graphics().setDepth(501); pauseObjs.push(sg);
        sg.fillStyle(col,0.12); sg.fillRoundedRect(PX+8,cy,PW-16,18,4);
        sg.lineStyle(1,col,0.5); sg.strokeRoundedRect(PX+8,cy,PW-16,18,4);
        pauseObjs.push(S.add.text(W/2,cy+9,title,{font:"bold 9px 'Courier New'",color:Phaser.Display.Color.IntegerToColor(col).rgba,stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(502));
        cy+=22;
    };
    const addStat=(label,val,col="#aabbcc")=>{
        pauseObjs.push(S.add.text(PX+16,cy,label,{font:"bold 9px 'Courier New'",color:"#667788",stroke:"#000",strokeThickness:2}).setDepth(502));
        pauseObjs.push(S.add.text(PX+PW-16,cy,String(val),{font:"bold 9px 'Courier New'",color:col,stroke:"#000",strokeThickness:2}).setOrigin(1,0).setDepth(502));
        cy+=13;
    };

    addSec(CURRENT_LANG==="ru"?"— СТАТЫ —":CURRENT_LANG==="en"?"— STATS —":"— STATLAR —",0x4488aa);
    addStat(CURRENT_LANG==="ru"?"❤ ХП":CURRENT_LANG==="en"?"❤ HP":"❤ Can",gs.health+" / "+gs.maxHealth,"#ff6666");
    addStat(CURRENT_LANG==="ru"?"⚔ Урон":CURRENT_LANG==="en"?"⚔ Damage":"⚔ Hasar",gs.damage.toFixed(1),"#ffcc44");
    addStat(CURRENT_LANG==="ru"?"🔥 Скорость":CURRENT_LANG==="en"?"🔥 Fire Rate":"🔥 Ateş Hızı",(1000/gs.shootDelay).toFixed(1)+"/sn","#ff8844");
    addStat(CURRENT_LANG==="ru"?"🏃 Скорость дв.":CURRENT_LANG==="en"?"🏃 Speed":"🏃 Hız",gs.moveSpeed.toFixed(0),"#44ff88");
    addStat(CURRENT_LANG==="ru"?"🎯 Крит":CURRENT_LANG==="en"?"🎯 Crit":"🎯 Kritik",Math.round(gs.critChance*100)+"%","#ff44aa");
    addStat(CURRENT_LANG==="ru"?"⭐ Уровень":CURRENT_LANG==="en"?"⭐ Level":"⭐ Seviye","Lv "+gs.level,"#ffdd44");
    cy+=4;

    // ── AKTİF UPGRADE'LER ──────────────────────────────────────
    const activeUps=Object.entries(UPGRADES).filter(([k,u])=>u.level>0&&u.type==="passive");
    if(activeUps.length>0){
        addSec(CURRENT_LANG==="ru"?"— ПАССИВНЫЕ —":CURRENT_LANG==="en"?"— PASSIVES —":"— PASİF GÜÇLER —",0x44ff88);
        activeUps.forEach(([k,u])=>{
            const bar="█".repeat(u.level)+"░".repeat(Math.max(0,u.max-u.level));
            pauseObjs.push(S.add.text(PX+16,cy,L(u.nameKey),{font:"bold 8px 'Courier New'",color:"#aaccaa",stroke:"#000",strokeThickness:2}).setDepth(502));
            pauseObjs.push(S.add.text(PX+PW-16,cy,bar+" "+u.level+"/"+u.max,{font:"8px 'Courier New'",color:"#44aa66",stroke:"#000",strokeThickness:2}).setOrigin(1,0).setDepth(502));
            cy+=12;
        });
        cy+=3;
    }

    // ── AKTİF SİLAHLAR ──────────────────────────────────────
    const activeWeps=Object.entries(UPGRADES).filter(([k,u])=>u.level>0&&u.type==="weapon");
    if(activeWeps.length>0){
        addSec(CURRENT_LANG==="ru"?"— ОРУЖИЕ —":CURRENT_LANG==="en"?"— WEAPONS —":"— SİLAHLAR —",0xffaa44);
        activeWeps.forEach(([k,u])=>{
            const bar="█".repeat(u.level)+"░".repeat(Math.max(0,u.max-u.level));
            pauseObjs.push(S.add.text(PX+16,cy,L(u.nameKey),{font:"bold 8px 'Courier New'",color:"#ffcc88",stroke:"#000",strokeThickness:2}).setDepth(502));
            pauseObjs.push(S.add.text(PX+PW-16,cy,bar+" "+u.level+"/"+u.max,{font:"8px 'Courier New'",color:"#ffaa44",stroke:"#000",strokeThickness:2}).setOrigin(1,0).setDepth(502));
            cy+=12;
        });
        cy+=3;
    }

    // ── AKTİF EVRİMLER ──────────────────────────────────────
    const activeEvos=EVOLUTIONS.filter(e=>e.active);
    if(activeEvos.length>0){
        addSec(CURRENT_LANG==="ru"?"— ЭВОЛЮЦИИ —":CURRENT_LANG==="en"?"— EVOLUTIONS —":"— EVRİMLER —",0xffdd00);
        activeEvos.forEach(evo=>{
            pauseObjs.push(S.add.text(PX+16,cy,"✦ "+L(evo.nameKey),{font:"bold 8px 'Courier New'",color:"#ffee44",stroke:"#000",strokeThickness:2}).setDepth(502));
            cy+=12;
        });
        cy+=3;
    }

    cy=Math.max(cy, PY+PH-90);

    // ── BUTONLAR ──────────────────────────────────────────────
    const mkPBtn=(x,y,w,h,label,c1,c2,fn)=>{
        const g=S.add.graphics().setDepth(501); pauseObjs.push(g);
        const d=hov=>{g.clear();g.fillStyle(hov?c2:c1,1);g.fillRoundedRect(x-w/2,y-h/2,w,h,6);g.lineStyle(1,c2,0.8);g.strokeRoundedRect(x-w/2,y-h/2,w,h,6);};
        d(false);
        const bt=S.add.text(x,y,label,{font:"bold 10px 'Courier New'",color:"#fff",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(502); pauseObjs.push(bt);
        const bh=S.add.rectangle(x,y,w,h,0xffffff,0.001).setInteractive().setDepth(503); pauseObjs.push(bh);
        bh.on("pointerover",()=>d(true)).on("pointerout",()=>d(false)).on("pointerdown",()=>{d(false);fn();});
    };

    const closeAll=()=>{
        pauseObjs.forEach(o=>{try{if(typeof o.disableInteractive==="function")o.disableInteractive();o.destroy();}catch(e){}});
        S.time.timeScale=1.0;
        _upgradeLock=0;
        gs.pickingUpgrade=false;
        S.physics.resume();
        if(S.spawnEvent)S.spawnEvent.paused=false;
        S._openPanel=null; // setter butonları geri açar
    };
    mkPBtn(W/2,PY+PH-58,180,34,"► "+L("resume"),0x224422,0x44aa44,closeAll);
    mkPBtn(W/2,PY+PH-20,140,24,L("mainMenu"),0x1a1a2a,0x444466,()=>{
        closeAll();
        Object.keys(UPGRADES).forEach(k=>UPGRADES[k].level=0);
        EVOLUTIONS.forEach(e=>e.active=false);
        S.scene.start("SceneMenu");
    });
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

    // Silah etiketi
    S.add.text(5,WY-3,"⚔",{font:"bold 7px 'Courier New'",color:"#4488aa",stroke:"#000",strokeThickness:2}).setDepth(D+2);
    for(let i=0;i<MAX_WEAPONS;i++){
        const sx=5+i*(SW+GAP);
        const bg=S.add.graphics().setDepth(D);
        bg.lineStyle(1,0x1a2840,0.35); bg.strokeRoundedRect(sx,WY,SW,SH,2);
        S.weaponSlots.push(bg);
        const ico=S.add.image(sx+SW/2,WY+SH/2,"icon_damage")
            .setScale(0.62).setDepth(D+1).setAlpha(0);
        S.weaponSlotIcons.push(ico);
    }

    // Pasif etiketi
    S.add.text(5,PY-3,"✦",{font:"bold 7px 'Courier New'",color:"#44aa44",stroke:"#000",strokeThickness:2}).setDepth(D+2);
    for(let i=0;i<MAX_PASSIVES;i++){
        const sx=5+i*(SW+GAP);
        const bg=S.add.graphics().setDepth(D);
        bg.lineStyle(1,0x1a3020,0.35); bg.strokeRoundedRect(sx,PY,SW,SH,2);
        S.passiveSlots.push(bg);
        const ico=S.add.image(sx+SW/2,PY+SH/2,"icon_hp")
            .setScale(0.62).setDepth(D+1).setAlpha(0);
        S.passiveSlotIcons.push(ico);
    }
}

function refreshSlots(S){
    const SW=20, SH=20, GAP=3;
    const WY=14, PY=38;
    const rarityC={common:0x4488ff,rare:0xaa44ff,epic:0xff8800,legendary:0xffcc00};
    const weapons=Object.entries(UPGRADES).filter(([k,u])=>u.type==="weapon"&&u.level>0);
    const passives=Object.entries(UPGRADES).filter(([k,u])=>u.type==="passive"&&u.level>0);
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
                ico.setTexture(u.icon).setPosition(sx+SW/2,WY+SH/2-1)
                   .setAlpha(1).setVisible(true).setScale(0.65);
                ico.setTint(lvRatio>=1?0xffee88:0xffffff); // Maxed: altın tint
            }catch(e){}
        } else {
            bg.clear();
            bg.lineStyle(1,0x1a2840,0.35); bg.strokeRoundedRect(sx,WY,SW,SH,2);
            ico.setAlpha(0);
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
                ico.setTexture(u.icon).setPosition(sx+SW/2,PY+SH/2-1)
                   .setAlpha(1).setVisible(true).setScale(0.65);
                ico.setTint(lvRatio>=1?0xffee88:0xffffff);
            }catch(e){}
        } else {
            bg.clear();
            bg.lineStyle(1,0x1a3020,0.35); bg.strokeRoundedRect(sx,PY,SW,SH,2);
            ico.setAlpha(0);
        }
    });
}

// ── HASAR / COMBAT YARDIMCILARI ───────────────────────────────
// [VFX POLISH P1] showDmgNum — küçük ama okunaklı hasar sayıları
// Crit: yıldız kaldırıldı, font küçültüldü (15→11px)
// Normal: üç kademe küçültüldü (14/12/9 → 10/9/7px)
// [PERF] Aktif hasar sayısı limiti — çok fazla text nesnesi oluşmasını önler
let _dmgNumCount = 0;
const MAX_DMG_NUMS = 12;

function showDmgNum(S,x,y,val,isCrit){
    if(!S||!S.add) return;
    // Ayarlar — hasar sayıları kapalıysa gösterme
    if(window._nt_dmg_nums===false) return;
    // [PERF] Limit — çok fazla hasar sayısı oluşturmayı önle
    if(_dmgNumCount>=MAX_DMG_NUMS) return;
    _dmgNumCount++;
    const ox=Phaser.Math.Between(-8,8);
    const oy=Phaser.Math.Between(-3,1);
    if(isCrit){
        // Crit — sade altın renk, küçük punch-in
        const t=S.add.text(x+ox,y+oy,""+val,{
            font:"bold 11px 'Courier New'",color:"#ffe600",
            stroke:"#220000",strokeThickness:4
        }).setOrigin(0.5).setDepth(43).setScale(0.3);
        S.tweens.add({targets:t,scaleX:1.1,scaleY:1.1,duration:50,ease:"Back.easeOut",
            onComplete:()=>{
                S.tweens.add({targets:t,y:y+oy-42,alpha:0,scaleX:0.95,scaleY:0.95,
                    duration:520,ease:"Quad.easeOut",onComplete:()=>{_dmgNumCount=Math.max(0,_dmgNumCount-1);t.destroy();}});
            }
        });
        // Crit halka — iki katman
        const cr=S.add.graphics().setDepth(42);
        cr.x=x+ox; cr.y=y+oy;
        cr.lineStyle(1.5,0xffee00,0.9); cr.strokeCircle(0,0,9);
        cr.lineStyle(0.8,0xffffff,0.5); cr.strokeCircle(0,0,5);
        S.tweens.add({targets:cr,scaleX:2.4,scaleY:2.4,alpha:0,duration:200,ease:"Quad.easeOut",onComplete:()=>cr.destroy()});
    } else {
        // [VFX POLISH P1] Normal — kompakt, 3 kademe, küçük fontlar
        const big=val>=10;
        const med=val>=4;
        const tiny=val<2;
        const color=big?"#ff9944":med?"#ddbb55":tiny?"#666666":"#aaaaaa";
        const fs=big?"bold 10px":med?"bold 9px":"bold 7px";
        const t=S.add.text(x+ox,y+oy,""+val,{
            font:fs+" 'Courier New'",color,
            stroke:"#000000",strokeThickness:big?3:2
        }).setOrigin(0.5).setDepth(40).setAlpha(big?0.95:tiny?0.5:0.80);
        const rise=big?28:med?20:14;
        const dur=big?280:med?220:170;
        S.tweens.add({
            targets:t, y:y+oy-rise, alpha:0,
            duration:dur,
            ease:"Quad.easeOut",onComplete:()=>{_dmgNumCount=Math.max(0,_dmgNumCount-1);t.destroy();}
        });
    }
}
function spawnHitDebris(S,x,y,type,isCrit){
    // [PERF OPT] Parçacık sayıları düşürüldü: crit 8→5, normal 5→3
    const typeC={normal:0xffcc55,zigzag:0x44ff88,fast:0xff4422,tank:0xaa44ff,
        shield:0x4488ff,kamikaze:0xff6600,ghost:0x88aacc,elder:0xffcc44,
        titan:0x9900dd,colossus:0xff2266,healer:0x00ff88,berserker:0xff0000,
        freezer:0x88ddff,toxic:0x66cc00,
        inferno:0xFF3300,glacier:0x44ccff,phantom_tri:0xcc44ff,volt:0xffee00,obsidian:0x6600aa};
    // pyramid3 hit'te de gökkuşağı renk değişimi
    const baseCol=type==="volt"
        ?[0xffee00,0xffffff,0xffcc00][Math.floor(Math.random()*3)]
        :type==="inferno"?[0xff3300,0xff8800,0xffcc44][Math.floor(Math.random()*3)]
        :(typeC[type]||0xddbb88);
    const cnt=isCrit?5:3;

    // Dikdörtgen YOK — sadece ince çizgi parçacıklar
    for(let i=0;i<cnt;i++){
        const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        const sp=Phaser.Math.Between(15,isCrit?70:40);
        const col=i%3===0?baseCol:i%3===1?0xffffff:isCrit?0xffee44:0xddbb88;
        const d=S.add.graphics().setDepth(15);
        d.x=x+Phaser.Math.Between(-3,3);
        d.y=y+Phaser.Math.Between(-3,3);
        d.lineStyle(isCrit?1.5:1, col, 0.85);
        d.lineBetween(0,0,Math.cos(ang)*3,Math.sin(ang)*3);
        S.tweens.add({
            targets:d,
            x:d.x+Math.cos(ang)*sp,
            y:d.y+Math.sin(ang)*sp*0.55,
            scaleX:0.05,scaleY:0.05,alpha:0,
            duration:Phaser.Math.Between(140,isCrit?300:200),
            ease:"Quad.easeOut",onComplete:()=>d.destroy()
        });
    }

    // Kıvılcım — lineBetween, fillRect/rectangle YOK
    const sparkCnt=isCrit?2:1;
    for(let i=0;i<sparkCnt;i++){
        const sang=Phaser.Math.DegToRad(Phaser.Math.Between(-160,-20));
        const ssp=Phaser.Math.Between(18,45);
        const sp2=S.add.graphics().setDepth(16);
        sp2.x=x+Phaser.Math.Between(-2,2); sp2.y=y+Phaser.Math.Between(-2,2);
        sp2.lineStyle(1,isCrit?0xffee44:0xffffaa,0.8);
        sp2.lineBetween(0,-3,0,3);
        S.tweens.add({targets:sp2,
            x:sp2.x+Math.cos(sang)*ssp,y:sp2.y+Math.sin(sang)*ssp*0.5,
            alpha:0,scaleY:0.2,duration:Phaser.Math.Between(90,160),
            ease:"Quad.easeOut",onComplete:()=>sp2.destroy()});
    }

    // Crit: küçük keskin impact — daire yok, sadece ince halka + kıvılcım
    if(isCrit){
        const er=S.add.graphics().setDepth(20);
        er.x=x; er.y=y;
        er.lineStyle(1.2,0xffffff,0.75); er.strokeCircle(0,0,5);
        S.tweens.add({targets:er,scaleX:2.6,scaleY:2.6,alpha:0,duration:140,ease:"Quad.easeOut",onComplete:()=>er.destroy()});
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
function showHitTxt(S,x,y,msg,color,large){
    if(!S||!S.add) return;
    const isPerfect=msg&&(msg.includes("MÜKEMMEL")||msg.includes("TAM")||msg.includes("HArika")||
        msg.includes("PERFECT")||msg.includes("ОТЛИЧНО")||msg.includes("В ЯБЛОЧКО")||msg.includes("ТОЧНЫЙ")||msg.includes("bullseye"));
    const isComboMile=msg&&(msg.includes("KOMBO")||msg.includes("COMBO")||msg.includes("КОМБО")||msg.includes("MAX"));

    let fontSize  = large?"bold 15px 'Courier New'":"bold 11px 'Courier New'";
    let depth     = large?34:22;
    let strokeTh  = large?5:3;
    let tColor    = color||"#ffffff";
    let riseY     = large?42:26;

    if(isPerfect){ fontSize="bold 17px 'Courier New'"; depth=36; tColor="#ffee00"; strokeTh=6; riseY=52; }
    if(isComboMile){ fontSize="bold 15px 'Courier New'"; depth=38; strokeTh=5; }

    const t=S.add.text(x,y,msg,{
        font:fontSize, color:tColor,
        stroke:"#000000", strokeThickness:strokeTh,
        letterSpacing:large?2:0,
    }).setOrigin(0.5).setDepth(depth).setAlpha(0).setScale(0.3,0.3);

    // Bounce-in → Settle → Rise & Fade
    S.tweens.add({targets:t, alpha:1, scaleX:isPerfect?1.3:large?1.18:1.0, scaleY:isPerfect?1.3:large?1.18:1.0, y:y-riseY*0.35,
        duration:75, ease:"Back.easeOut",
        onComplete:()=>{
            S.tweens.add({targets:t, scaleX:isPerfect?1.0:large?1.0:0.95, scaleY:isPerfect?1.0:large?1.0:0.95, y:y-riseY,
                duration:110, ease:"Quad.easeOut",
                onComplete:()=>{
                    S.tweens.add({targets:t, alpha:0, y:y-riseY-20, scaleX:0.7, scaleY:0.7,
                        duration:isPerfect?520:large?380:280,
                        ease:"Quad.easeIn", delay:isPerfect?480:large?220:160,
                        onComplete:()=>{try{t.destroy();}catch(e){}}
                    });
                }
            });
        }
    });

    if(isPerfect){
        // Sadece 4 köşe kıvılcım — dikdörtgen glow YOK
        for(let _ci=0;_ci<4;_ci++){
            const _ca=Phaser.Math.DegToRad(_ci*90+45);
            const _sp=S.add.graphics().setDepth(depth+1);
            _sp.lineStyle(1.5,0xffee00,0.85);
            _sp.lineBetween(0,0,Math.cos(_ca)*5,Math.sin(_ca)*5);
            _sp.x=x+Math.cos(_ca)*22; _sp.y=y+Math.sin(_ca)*12; _sp.angle=_ci*90+45;
            S.tweens.add({targets:_sp, x:_sp.x+Math.cos(_ca)*16, y:_sp.y+Math.sin(_ca)*9,
                alpha:0, scaleY:0.1, duration:180, ease:"Quad.easeOut",
                onComplete:()=>{try{_sp.destroy();}catch(e){}}});
        }
    }
}
// ═══════════════════════════════════════════════════════════════
// PART E: SceneGame (tam oyun), Combat, Weapons, XP,
//          LevelUp, GameOver, Phaser Boot
// ═══════════════════════════════════════════════════════════════

class SceneGame extends Phaser.Scene {
    constructor(){ super({key:"SceneGame"}); }

    preload(){
        this.load.image("bg_day",   "assets/bg_day.png");
        this.load.image("bg_sunset","assets/bg_sunset.png");
        this.load.image("bg_night", "assets/bg_night.png");
        this.load.image("cloud1",   "assets/cloud1.PNG");
        this.load.image("cloud2",   "assets/cloud2.PNG");
        this.load.image("pyramid",  "assets/pyramid.png");
        this.load.image("intro1",   "assets/intro1.png");
        this.load.spritesheet("pyramid_break",  "assets/pyramid_break.png",  {frameWidth:98, frameHeight:84});
        this.load.spritesheet("pyramid_explode","assets/pyramid_explode.png",{frameWidth:145,frameHeight:115});
        this.load.spritesheet("idle","assets/player_idle.png",{frameWidth:32,frameHeight:32});
        this.load.spritesheet("run", "assets/player_run.png", {frameWidth:31,frameHeight:30});
        // ── YENİ PİRAMİT TİPLERİ ──
    }

    create(){
        const W=360,H=640;
        // [UX] Sahne başlangıcında timeScale sıfırla — önceki oyundan kalıntı önle
        this.time.timeScale=1.0;
        // [CRASH FIX] Physics'in önceki oturumdan pause'da kalmasını önle.
        try{ this.physics.resume(); }catch(e){}
        _upgradeLock=0;

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
                if(this.flameRing) try{this.flameRing.destroy();}catch(e){}
                if(this.playerGlow) try{this.playerGlow.destroy();}catch(e){}
                if(this.hpBarGfx) try{this.hpBarGfx.destroy();}catch(e){}
                if(this.xpBarBg) try{this.xpBarBg.destroy();}catch(e){}
                if(this.xpBarFill) try{this.xpBarFill.destroy();}catch(e){}
                if(this.comboText) try{this.comboText.destroy();}catch(e){}
                if(this.scoreText) try{this.scoreText.destroy();}catch(e){}
                // Physics grupları temizle
                if(this.bullets) try{this.bullets.clear(true,true);}catch(e){}
                if(this.xpOrbs) this.xpOrbs=[];
                _debrisCount=0;
                _dmgNumCount=0;
                // [CRASH FIX] Global lock state'i sıfırla — bir sonraki oyun başlangıcında
                // önceki oturumdan kalan _upgradeLock>0 veya _microFreeze=true durumu
                // physics'in pause'da kalmasına neden olabilir.
                _upgradeLock=0;
                _chaosParticleTimer=0;
                GS=null;
            }catch(e){}
        });

        buildTextures(this);

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
        if(!this.anims.exists("anim_idle")) this.anims.create({key:"anim_idle",frames:this.anims.generateFrameNumbers("idle",{start:0,end:3}),frameRate:7,repeat:-1});
        if(!this.anims.exists("anim_run"))  this.anims.create({key:"anim_run", frames:this.anims.generateFrameNumbers("run", {start:0,end:7}),frameRate:16,repeat:-1});
        if(!this.anims.exists("anim_break"))this.anims.create({key:"anim_break",frames:this.anims.generateFrameNumbers("pyramid_break",{start:0,end:2}),frameRate:10,repeat:0});

        // Yeni piramit tipleri pyramid_break animasyonunu kullanir

        // GS başlat
        const sv=JSON.parse(localStorage.getItem("nt_shop")||"{}");
        GOLD_UPGRADES.forEach(u=>{u.level=sv[u.id]||0;});
        Object.keys(UPGRADES).forEach(k=>UPGRADES[k].level=0);
        EVOLUTIONS.forEach(e=>e.active=false);
        SYNERGIES.forEach(s=>s.active=false); // [BUG FIX] Sinerji state'i sıfırla — önceki oyundan kalıntı önleme

        GS={
            health: 18+(GOLD_UPGRADES.find(u=>u.id==="start_hp")?.level||0)*6,
            maxHealth: 18+(GOLD_UPGRADES.find(u=>u.id==="start_hp")?.level||0)*6,
            damage: 1.0*(1+(GOLD_UPGRADES.find(u=>u.id==="start_dmg")?.level||0)*0.15),
            moveSpeed: 230*(1+(GOLD_UPGRADES.find(u=>u.id==="start_spd")?.level||0)*0.10),
            shootDelay:190,
            bulletSpeed:460, bulletScale:1.0, multiShot:1, pierceCount:0,
            critChance:(GOLD_UPGRADES.find(u=>u.id==="crit_start")?.level||0)*0.05,
            critMult:2.0, knockback:0, freezeChance:0,
            xp:0, xpToNext:18, level:1,
            xpMult: 1.0+(GOLD_UPGRADES.find(u=>u.id==="xp_bonus")?.level||0)*0.20,
            magnetRadius:(GOLD_UPGRADES.find(u=>u.id==="magnet_start")?.level||0)*60,
            goldMult: 1.0+(GOLD_UPGRADES.find(u=>u.id==="gold_bonus")?.level||0)*0.25,
            gold:0, kills:0, t:0, score:0,
            pyramidSpeed:80, spawnDelay:2400,
            invincible:false, gameOver:false, pickingUpgrade:false,
            combo:0, comboTimer:0, comboDmgBoost:1.0, comboXpBoost:1.0,
            resonanceDist:45, bossActive:false, _bossKills:0,
            directorPhase:"calm",
            dayTimer:0, timeOfDay:"day",
            dustTimer:0, tumbTimer:0, birdTimer:0, ssTimer:0,
            orbitAngle:0,
            extraLife:(GOLD_UPGRADES.find(u=>u.id==="extra_life")?.level||0)>0,
            usedExtraLife:false,
            _knockbackTimer:0,
            // [OPT] Evolution cache flag'leri — doShoot hot-path'te EVOLUTIONS.find() çağrısından kaçınmak için
            _evoTriCannon:false, _evoStormCore:false, _evoGravityWell:false,
            _evoOverload:false,  _evoCryoField:false,  _evoPlagueBearer:false,
            // ★ YENİ: Sinerji flag'leri
            _synergyToxicFire:false, _synergyCryoShatter:false, _synergyChainStorm:false,
            _synergyDroneShield:false, _synergyDeathCircle:false,
            _synergyMeteorBomb:false, _synergyLaserFocus:false, _synergyWindCure:false,
            _droneHitCount:0,
            // ★ YENİ: Relic sistemleri
            _relicDmgBonus:1, _relicGoldBonus:1,
            _timeShardTimer:0, _timeSlowActive:false,
            activeRelics:[],
            // ★ YENİ: Event sistemi
            _lastEventTime:60000, _eventCooldown:0, _furyMode:false, _furyNoHeal:false,
            _eliteHuntCount:0,
            // ★ YENİ: Kristal sistemi
            _crystalReviveUsed:false,
            // ★ YENİ: Yeni event flag'leri
            _cursedBullets:false, _glassCannon:false, _bulletHellMode:false,
            _voidCurse:false, _necroMode:false, _necroKillCount:0,
            _shadowRealm:false, _berserkerRage:false, _berserkerBase:0,
            _gravityCollapse:false,
            // ★ YENİ: Mini boss sistemi
            miniBossActive:false, _lastMiniBossTime:120000,
            // ★ YENİ: Görev takip
            questProgress:{kills:0,combo:0,time:0,perfect:0,goldcol:0,level:0,boss:0},
            activeQuests:[],
            // ★ GAME FEEL state
            _nearDeathActive:false, _nearDeathDmgBoost:1.0, _nearDeathPulseT:0,
            _lastHitTime:0, _chaosLevel:0, _lastPowerSpikeCombo:0,
            _doubleDmgTaken:false,
            // ★ YENİ: Çöl kum fırtınası sistemi
            _sandStormActive:false, _sandStormTimer:0, _sandStormDuration:0,
            // [VFX] Görsel efekt alanları
            _healFlash:0,           // can alındığında yeşil flash süresi (ms)
            _speedBuffActive:false,  // hız buff aktif (rüzgar efekti için)
            _upgradeGlowTimers:{},   // son alınan upgrade'ler (slot glow için)
        };

        // ── ARKAPLAN ──
        this.bgDay    =this.add.image(W/2,H/2,"bg_day").setDisplaySize(W,H).setDepth(-10);
        this.bgSunset =this.add.image(W/2,H/2,"bg_sunset").setDisplaySize(W,H).setDepth(-9).setAlpha(0);
        this.bgNight  =this.add.image(W/2,H/2,"bg_night").setDisplaySize(W,H).setDepth(-8).setAlpha(0);
        this.nightOverlay=this.add.rectangle(W/2,H/2,W,H,0x000022,0).setDepth(-7);
        this.groundGlow=this.add.graphics().setDepth(3);

        // Bulutlar
        this.clouds=[];
        for(let i=0;i<5;i++){
            const c=this.add.image(Phaser.Math.Between(-50,W+50),Phaser.Math.Between(35,160),i%2?"cloud1":"cloud2");
            c.setScale(Phaser.Math.FloatBetween(0.10,0.22)).setAlpha(Phaser.Math.FloatBetween(0.35,0.65)).setDepth(-2);
            c.vx=-Phaser.Math.FloatBetween(6,16);
            this.clouds.push(c);
        }

        // Yıldızlar — başlangıçta görünmez
        this.nStars=[];
        for(let i=0;i<130;i++){
            const sx=Phaser.Math.Between(2,358),sy=Phaser.Math.Between(4,190);
            const sz=Math.random()<0.18?2:1;
            const br=Phaser.Math.Between(180,255);
            const col=i%5===0?Phaser.Display.Color.GetColor(br,br,Math.min(255,br+40)):i%7===0?Phaser.Display.Color.GetColor(Math.min(255,br+30),br,br):Phaser.Display.Color.GetColor(br,br,br);
            const star=this.add.rectangle(sx,sy,sz,sz,col,0).setDepth(0);
            this.nStars.push({obj:star,base:Phaser.Math.FloatBetween(0.5,1.0),spd:Phaser.Math.FloatBetween(0.6,1.4),phase:Math.random()*Math.PI*2});
        }

        // Kum — 3 katman
        this.sandPtcl=[];
        for(let i=0;i<100;i++){
            const layer=i<40?0:i<70?1:2;
            const spd=[55,100,155][layer];
            const size=Phaser.Math.FloatBetween([3,2,1][layer],[7,5,3][layer]);
            const alpha=[0.22,0.14,0.08][layer];
            const sandC=layer===0?0xeecc88:layer===1?0xddbb66:0xccaa55;
            const obj=this.add.rectangle(Phaser.Math.Between(0,W),Phaser.Math.Between(280,450),size,1,sandC,alpha).setDepth(layer===0?2:layer===1?1:0);
            this.sandPtcl.push({obj,vx:-Phaser.Math.FloatBetween(spd*0.6,spd*1.4),wave:Math.random()*Math.PI*2,waveSpd:Phaser.Math.FloatBetween(0.5,1.5),waveAmp:Phaser.Math.FloatBetween(0.1,0.6)});
        }
        this.dustPtcl=[]; this.tumbles=[]; this.birds=[]; this.sStars=[];

        // Zemin şeridi kaldırıldı

        // ── OYUNCU — tam önceki kodla aynı yere basıyor ──
        this.player=this.physics.add.sprite(W/2,GROUND_Y-32,"idle");
        this.player.setDepth(20).setScale(2.0);
        // [HİTBOX FIX] Önceki 20x26 çok küçüktü — düşmanlar içinden geçiyordu
        // Scale 2.0 ile sprite 64x64 — body 36x44 daha gerçekçi
        this.player.body.setSize(32,38).setOffset(0,2);
        this.player.body.setAllowGravity(false);
        this.player.play("anim_idle");

        this.playerGlow=this.add.graphics().setDepth(19);
        this.hpBarGfx=this.add.graphics().setDepth(21);

        // ── FİZİK GRUPLARI ──
        this.pyramids=this.physics.add.group({classType:Phaser.Physics.Arcade.Image,runChildUpdate:false,maxSize:MAX_ENEMIES+10});
        this.bullets=this.physics.add.group({classType:Phaser.Physics.Arcade.Image,maxSize:120,runChildUpdate:false});
        this.orbitGroup=this.physics.add.group({classType:Phaser.Physics.Arcade.Image,maxSize:6});
        this.sawGroup=this.physics.add.group({classType:Phaser.Physics.Arcade.Image,maxSize:6});
        this.droneGroup=this.physics.add.group({classType:Phaser.Physics.Arcade.Image,maxSize:6});
        this.meteorGroup=this.physics.add.group({maxSize:12});

        // Orbit başlat
        for(let i=0;i<MAX_WEAPONS;i++){
            const ob=this.physics.add.image(0,0,"tex_blade");
            ob.body.setAllowGravity(false).setImmovable(true).setCircle(5);
            ob.setActive(false).setVisible(false).setDepth(12);
            this.orbitGroup.add(ob);
        }

        this.flameRing=this.add.graphics().setDepth(8);
        this.laserGfx =this.add.graphics().setDepth(18);
        this.xpOrbs=[];
        this.weaponSlots=[]; this.passiveSlots=[]; this.weaponSlotIcons=[]; this.passiveSlotIcons=[];

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

        // ── MOBİL KONTROL BUTONLARI ──────────────────────────────
        this._mobileLeft = false;
        this._mobileRight = false;
        this._mobileFire = false;

        // Sadece dokunmatik cihazlarda göster
        const _isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (_isTouchDevice) {
            const W_MB = 360, H_MB = 640;
            const BTN_Y = H_MB - 52;
            const BTN_R = 36;
            const BTN_ALPHA_IDLE = 0.55;

            const _makeMobileBtn = (x, y, label, color, onDown, onUp) => {
                const g = this.add.graphics().setDepth(800).setScrollFactor(0);
                const lbl = this.add.text(x, y, label, {
                    font: "bold 20px 'Courier New'", color: "#ffffff",
                    stroke: "#000000", strokeThickness: 3
                }).setOrigin(0.5).setDepth(801).setScrollFactor(0).setAlpha(BTN_ALPHA_IDLE);

                let _activePtr = null;

                const drawBtn = (pressed) => {
                    g.clear();
                    g.fillStyle(0x333333, pressed ? 0.65 : 0.22);
                    g.fillCircle(x, y, BTN_R);
                    g.lineStyle(2, 0xaaaaaa, pressed ? 0.9 : 0.45);
                    g.strokeCircle(x, y, BTN_R);
                    lbl.setAlpha(pressed ? 1.0 : BTN_ALPHA_IDLE);
                };
                drawBtn(false);

                const hit = this.add.circle(x, y, BTN_R, 0xffffff, 0.001)
                    .setDepth(802).setScrollFactor(0).setInteractive();

                hit.on("pointerdown", (ptr) => { _activePtr = ptr.id; drawBtn(true); onDown(); });
                hit.on("pointerup",   (ptr) => { if(ptr.id===_activePtr){_activePtr=null; drawBtn(false); onUp();} });
                hit.on("pointerout",  (ptr) => { if(ptr.id===_activePtr){_activePtr=null; drawBtn(false); onUp();} });
                return { g, lbl, hit };
            };

            this.input.addPointer(3);

            // ATEŞ BUTONU — sol alt
            this._btnFire = _makeMobileBtn(
                54, BTN_Y, "●", 0x888888,
                () => { this._mobileFire = true; },
                () => { this._mobileFire = false; }
            );
            // SOL BUTON
            this._btnLeft = _makeMobileBtn(
                216, BTN_Y, "◀", 0x888888,
                () => { this._mobileLeft = true; },
                () => { this._mobileLeft = false; }
            );
            // SAĞ BUTON — en az 2*BTN_R boşluk
            this._btnRight = _makeMobileBtn(
                294, BTN_Y, "▶", 0x888888,
                () => { this._mobileRight = true; },
                () => { this._mobileRight = false; }
            );
        }
        // ── MOBİL KONTROL BUTONLARI SONU ─────────────────────────

        // ── ATEŞ — düz, otomatik, garantili ──
        this._shootTimer=0;

        // SPAWN
        this.spawnEvent=this.time.addEvent({delay:GS.spawnDelay,loop:true,callback:()=>{
            if(!GS.gameOver&&!GS.pickingUpgrade){runDirector(this);spawnEnemy(this);}
        }});

        // Run event sistemi — her 60sn bir olay (daha sık, daha heyecanlı)
        this.time.addEvent({delay:60000,loop:true,callback:()=>{
            if(!GS||GS.gameOver||GS.pickingUpgrade) return;
            if(GS._eventCooldown>0) return;
            if(GS.level>=2) triggerRunEvent(this);
        }});
        // Bonus event — level 5+ ise ek 45sn interval
        this.time.addEvent({delay:45000,loop:true,callback:()=>{
            if(!GS||GS.gameOver||GS.pickingUpgrade) return;
            if(GS._eventCooldown>0) return;
            if(GS.level>=5&&Math.random()<0.55) triggerRunEvent(this);
        }});

        // ★ YENİ: Mini boss spawn — her 3 dakikada bir
        this.time.addEvent({delay:180000,loop:true,callback:()=>{
            if(!GS||GS.gameOver||GS.pickingUpgrade||GS.miniBossActive) return;
            spawnMiniBoss(this);
        }});

        // ★ YENİ: Sinerji kontrol — her level-up'tan sonra ve bu event ile de tetiklenir
        this.time.addEvent({delay:5000,loop:true,callback:()=>{
            if(!GS||GS.gameOver) return;
            checkAndApplySynergies(this);
        }});

        // ★ YENİ: Relic tick sistemi — aktif relikleri işle
        this.time.addEvent({delay:500,loop:true,callback:()=>{
            if(!GS||GS.gameOver) return;
            tickRelics(this);
        }});

        // ★ YENİ: Görev başlat — oyun açıldığında 2 görev ata
        initDailyQuests(GS);

        // ★ YENİ: Kum fırtınası sistemi — çöl haritasında 2 dakikada bir
        this.time.addEvent({delay:120000,loop:true,callback:()=>{
            if(!GS||GS.gameOver) return;
            triggerSandStorm(this);
        }});

        // Regen — [BALANCE] 4s→8s (nerf), pause sırasında çalışmaz
        this.time.addEvent({delay:8000,loop:true,callback:()=>{
            if(!GS||GS.gameOver||GS.pickingUpgrade) return;
            if(UPGRADES.regen.level>0&&GS.health<GS.maxHealth) GS.health=Math.min(GS.maxHealth,GS.health+1);
            // Wind Cure sinerjisi
            if(GS._synergyWindCure&&UPGRADES.regen.level>0&&GS.health<GS.maxHealth){
                const moving=Math.abs(this.player?.body?.velocity?.x||0)>30;
                if(moving) GS.health=Math.min(GS.maxHealth,GS.health+1);
            }
        }});

        // Thunder & Meteor
        this.time.addEvent({delay:3200,loop:true,callback:()=>{if(!GS||GS.gameOver||GS.pickingUpgrade)return;if(UPGRADES.thunder.level>0&&!GS._voidCurse)doThunderStrike(this);}});
        this.time.addEvent({delay:6000,loop:true,callback:()=>{if(!GS||GS.gameOver||GS.pickingUpgrade)return;if(UPGRADES.meteor.level>0)spawnMeteor(this);}});

        // ── BULLET ↔ ENEMY ──
      this.physics.add.overlap(this.bullets,this.pyramids,(b,enemy)=>{
            if(!b.active||!enemy.active||enemy.spawnProtected) return;
            // [BUG FIX] Level up / pause ekranında hit olmaz
            if(!GS||GS.pickingUpgrade||GS.gameOver) return;
            // [BUG FIX] Düşman ekrana tamamen girmeden hasar almaz
            if(enemy.y < 0 || enemy.x < -20 || enemy.x > 380) return;
            if(enemy.mirror&&!enemy.mirrorSpawned){enemy.mirrorSpawned=true;spawnMirrorClone(this,enemy);}
            if(enemy.absorber&&enemy.armor>1){showHitTxt(this,enemy.x,enemy.y-8,"BLOK","#888888",false);b.setActive(false).setVisible(false);if(b.body)b.body.enable=false;return;}
            const gs=GS;
            let dmg=gs.damage,isCrit=false;
            // Void curse — pasif güçler devre dışı (sadece base damage)
            if(gs._voidCurse) dmg = 1.0 * (gs._relicDmgBonus||1);
            else if(Math.random()<gs.critChance){dmg*=gs.critMult;isCrit=true;}

            // Cursed bullets — her mermi oyuncuya da hasar verir
            if(gs._cursedBullets && !gs.invincible){
                gs.health = Math.max(1, gs.health - Math.max(1, Math.floor(gs.maxHealth*0.01)));
                if(gs.health<=1 && !gs._crystalReviveUsed && PLAYER_CRYSTAL>=CRYSTAL_COSTS.revive){
                    showCrystalRevivePrompt(S); return;
                }
            }

            // Combo — aynı düşmandan 800ms içinde tekrar combo kazanılmaz
            const now=Date.now();
            const canCombo=!enemy._lastComboTime||(now-enemy._lastComboTime)>800;

            // Hit zone — iki bölge: tam orta (perfect), kenar/normal
            const distCenter=Math.abs(b.x-enemy.x);
            if(distCenter<10){
                // ── PERFECT HIT ──
                dmg*=3.0*gs.comboDmgBoost;
                isCrit=true;
                const perfectMsgs=[L("perfect"),L("centerHit"),L("bullseye"),L("perfect")];
                showHitTxt(this,enemy.x,enemy.y-18,perfectMsgs[Math.floor(Math.random()*perfectMsgs.length)],"#ff4400",true);
                    // ★ Perfect hit görev takibi
                    updateQuestProgress("perfect",1);
                trackPerfectHit(gs);
                if(canCombo){
                    enemy._lastComboTime=now;
                    gs.combo=Math.min(20,gs.combo+2); gs.comboTimer=2200;
                    // ★ Combo quest takibi
                    updateQuestProgress("combo",gs.combo);
                    gs.comboDmgBoost=Math.min(1.6,1+gs.combo*0.03);
                    gs.comboXpBoost=Math.min(2.0,1+gs.combo*0.05);
                    // [VFX] Combo milestone WOW moments
                    const milestones={5:"🔥 x5 KOMBO!",10:"⚡ x10 KOMBO!",15:"💥 x15 KOMBO!",20:"🌟 x20 MAX KOMBO!"};
                    const mileCols={5:"#ff8800",10:"#ff4400",15:"#ff2244",20:"#ffcc00"};
                    if(milestones[gs.combo]){
                        showHitTxt(this,180,260,milestones[gs.combo],mileCols[gs.combo],true);
                        this.cameras.main.shake(40+gs.combo*2,0.004+gs.combo*0.0002);
                        // ── AAA COMBO MİLESTONE VFX ──
                        vfxComboMilestone(this,gs.combo,this.player.x,this.player.y);
                    }
                }
                triggerResonance(this,enemy,0);
                // ── AAA PERFECT HIT VFX ──
                vfxPerfectHit(this,enemy.x,enemy.y,gs.combo);
           } else {
                // ── NORMAL VURUŞ ──
                if(canCombo){
                    enemy._lastComboTime=now;
                    gs.combo=Math.min(20,gs.combo+1); gs.comboTimer=1500;
                    gs.comboDmgBoost=Math.min(1.3,1+gs.combo*0.015);
                }
                // ── AAA NORMAL HIT VFX ──
                vfxNormalHit(this,enemy.x,enemy.y,isCrit);
            }

            applyDmg(this,enemy,dmg,isCrit);
            if(UPGRADES.explosive.level>0&&!enemy.active) doExplosion(this,enemy.x,enemy.y);
            // [BALANCE] Freeze: Lv1=yavaşlatma, Lv2+=gerçek dondurma
            if(gs.freezeChance>0&&Math.random()<gs.freezeChance){
                if(UPGRADES.freeze.level>=2){
                    freezeEnemy(this,enemy);
                } else {
                    // Lv1: sadece slow — hızı %40'a düşür, 1.2 sn
                    if(enemy.body&&!enemy.frozen&&!enemy._slowed){
                        enemy._slowed=true;
                        const origVX=enemy.body.velocity.x, origVY=enemy.body.velocity.y;
                        enemy.body.velocity.set(origVX*0.35, origVY*0.35);
                        enemy.setTint(0xaaddff);
                        this.time.delayedCall(1200,()=>{
                            if(enemy&&enemy.active&&enemy._slowed){
                                enemy._slowed=false;
                                if(enemy.body) enemy.body.velocity.set(origVX, origVY);
                                if(!enemy.frozen) enemy.clearTint();
                            }
                        });
                    }
                }
            }
            b._pierced=(b._pierced||0)+1;
            if(b._pierced>gs.pierceCount){
                b.setActive(false).setVisible(false);
                if(b.body) b.body.enable=false;
            }
        });

        // Orbit + Saw ↔ Enemy
        this.physics.add.overlap(this.orbitGroup,this.pyramids,(orb,enemy)=>{
            if(!orb.active||!enemy.active||enemy.spawnProtected||enemy.hitByOrbit) return;
            if(!GS||GS.pickingUpgrade||GS.gameOver) return;
            enemy.hitByOrbit=true;
            this.time.delayedCall(320,()=>{if(enemy.active)enemy.hitByOrbit=false;});
            applyDmg(this,enemy,GS.damage*0.8,false);
        });
        this.physics.add.overlap(this.sawGroup,this.pyramids,(saw,enemy)=>{
            if(!saw.active||!enemy.active||enemy.spawnProtected||enemy.hitByOrbit) return;
            if(!GS||GS.pickingUpgrade||GS.gameOver) return;
            enemy.hitByOrbit=true;
            this.time.delayedCall(180,()=>{if(enemy.active)enemy.hitByOrbit=false;});
            const sawLv=UPGRADES.saw?.level||1;
            applyDmg(this,enemy,GS.damage*(1.8+sawLv*0.3),false);
        });

        // ── DÜŞMAN — OYUNCU ÇARPIŞMASI ──
        this.physics.add.overlap(this.player,this.pyramids,(player,enemy)=>{
            if(!enemy.active||enemy.spawnProtected||enemy.groundHit) return;
            if(GS.invincible||GS.gameOver||GS.pickingUpgrade) return;
            if(enemy._collideCooldown) return;
            enemy._collideCooldown=true;
            // [TAKILMA FIX] Anında body devre dışı — physics overlap bir sonraki frame'de tekrar tetiklemez
            if(enemy.body){ enemy.body.enable=false; enemy.body.checkCollision.none=true; }
            enemy.setActive(false).setVisible(false);
            // [CAMERA SHAKE] Düşman çarpınca ekran sallanır
            this.cameras.main.shake(120,0.012);
            // pyramid_explode animasyonu tetikle
            try{
                if(!this.anims.exists("anim_explode")){
                    this.anims.create({key:"anim_explode",frames:this.anims.generateFrameNumbers("pyramid_explode",{start:0,end:4}),frameRate:14,repeat:0});
                }
                if(this.textures.exists("pyramid_explode")){
                    const typeColors={normal:0xffcc55,zigzag:0x44ff88,fast:0xff4422,tank:0xaa44ff,
                        shield:0x4488ff,kamikaze:0xff6600,ghost:0x88aacc,elder:0xffcc44,
                        titan:0x9900dd,colossus:0xff2266,
                        inferno:0xFF3300,glacier:0x44ccff,phantom_tri:0xcc44ff,volt:0xffee00,obsidian:0x6600aa};
                    const isNewP3=enemy.inferno||enemy.glacier||enemy.phantom_tri||enemy.volt||enemy.obsidian;
                    const ex=this.add.sprite(enemy.x,enemy.y,"pyramid_explode",0).setDepth(22);
                    if(isNewP3){ ex.setDisplaySize(100,82); }
                    else        { ex.setScale((enemy.scaleX||1)*1.2); }
                    ex.setTint(typeColors[enemy.type]||0xffcc55);
                    ex.play("anim_explode");
                    ex.once("animationcomplete",()=>{try{ex.destroy();}catch(e){}});
                }
            }catch(e){}
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

        this.cameras.main.fadeIn(350,0,0,0);

        // ── PERFECT HIT TUTORIAL — her oyunda göster (ayarlardan kapatılabilir) ──
        const tutDisabled=localStorage.getItem("nt_tutorial_off")==="1";
        if(!tutDisabled){
            this.time.delayedCall(800,()=>{
                if(!GS||GS.gameOver) return;
                showPerfectHitTutorial(this);
            });
        }
    }

    update(time,delta){
        const gs=GS;
        if(!gs||gs.gameOver){
            if(this._mobileLeft!==undefined){this._mobileLeft=false;this._mobileRight=false;this._mobileFire=false;}
            return;
        }
        if(gs.pickingUpgrade){
            if(this._mobileLeft!==undefined){this._mobileLeft=false;this._mobileRight=false;this._mobileFire=false;}
            return;
        }
        if(!this.player||!this.player.active) return;

        // ── AAA VFX TICK ──
        tickVFX(this,delta);

        // 5 dakika hayatta kalma kristal ödülü
        if(gs.t>=300000 && !gs._crystal5minGiven){
            gs._crystal5minGiven=true;
            addCrystal(CRYSTAL_SOURCES.survive_5min,"survive_5min");
            showHitTxt(this,180,300,"💎 +2 KRİSTAL (5 Dakika)!","#cc44ff",true);
            if(this._crystalHudText) this._crystalHudText.setText("💎 "+PLAYER_CRYSTAL);
        }

        // ★ FPS monitor — performans modu güncelle
        updatePerfMode(this.game.loop.actualFps||60);
        // [PERF] Periyodik temizlik — orphan obje birikimini önle
        periodicSceneCleanup(this);

        gs.t+=delta;

        // Spawn delay dinamik güncelle
        if(this.spawnEvent){
            const newDelay=Math.max(400,gs.spawnDelay);
            if(Math.abs(this.spawnEvent.delay-newDelay)>100){
                this.spawnEvent.reset({delay:newDelay,loop:true,callback:()=>{if(!GS.gameOver&&!GS.pickingUpgrade){runDirector(this);spawnEnemy(this);}}});
            }
        }

        // Boss
        if(!gs.bossActive&&gs.level>=8&&gs.t>90000&&Math.random()<0.004) spawnBoss(this);

        // SKOR — Subway Surfers tarzı hızlı artış
        const prevScore=gs.score;
        gs.score+=Math.floor((3+gs.level*0.8+gs.combo*0.3)*(delta/16));
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

        // Combo timer — upgrade seçiminde dondur
        if(gs.combo>0&&!gs.pickingUpgrade){
            gs.comboTimer-=delta;
            if(gs.comboTimer<=0){
                if(gs&&gs.combo>=5) showComboBreak(this, gs.combo);
                gs.combo=0;gs.comboDmgBoost=1.0;gs.comboXpBoost=1.0;
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
        if((this.spaceKey&&this.spaceKey.isDown&&!this._spaceCutOff&&this._shootTimer>=gs.shootDelay)||(this._mobileFire&&this._shootTimer>=gs.shootDelay)){
            this._shootTimer=0;
            doShoot(this);
        }

        // Sistemler
        tickEnemies(this);
        tickBullets(this);
        tickXP(this);
        tickWeapons(this,delta);
        tickAtmosphere(this,delta);
        updateDayCycle(this,delta);
        drawPlayerGlow(this);
        renderUI(this);

        // ★ YENİ: Görev takip güncelle
        tickQuestProgress(this,delta);

        // ★ GAME FEEL: Tüm yeni sistemler
        tickProgressiveChaos(this, delta);
        tickNearDeathPulse(this, delta);
        tickPowerSpikeWords(this, delta);
        tickHiddenSynergy(this);

        // ★ YENİ: Kum fırtınası tick
        if(gs._sandStormActive) tickSandStorm(this,delta);

        // Invincible timer
        if(gs.invincible){gs._invT=(gs._invT||0)+delta;if(gs._invT>350){gs.invincible=false;gs._invT=0;}}

        // Player sınır
        this.player.x=Phaser.Math.Clamp(this.player.x,14,346);
        this.player.y=Phaser.Math.Clamp(this.player.y,60,GROUND_Y-32);
    }
}

// ── PERFECT HIT TUTORIAL ─────────────────────────────────────
function showPerfectHitTutorial(S){
    // İlk düşmanı bekle
    const enemies=S.pyramids.getMatching("active",true);
    const enemy=enemies[0];
    if(!enemy){ S.time.delayedCall(400,()=>showPerfectHitTutorial(S)); return; }

    const W=360,H=640;
    // Oyunu dondur
    S.physics.pause();
    GS.pickingUpgrade=true;

    const items=[];
    const addI=o=>{items.push(o);return o;};

    // ── Arkaplan karartma
    const dim=addI(S.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(200));
    S.tweens.add({targets:dim,fillAlpha:0.72,duration:300});

    // ── Üst başlık paneli
    const hdr=addI(S.add.graphics().setDepth(201));
    hdr.fillStyle(0xff4400,1); hdr.fillRect(0,0,W,52);
    hdr.fillStyle(0xff6622,1); hdr.fillRect(0,0,W,4);
    addI(S.add.text(W/2,14,"⚡ PERFECT HIT",{
        font:"bold 18px 'Courier New'",color:"#ffffff",
        stroke:"#880000",strokeThickness:4,letterSpacing:3
    }).setOrigin(0.5,0).setDepth(202));
    addI(S.add.text(W/2,36,L("tutorialSubtitle"),{
        font:"10px 'Courier New'",color:"#ffddcc"
    }).setOrigin(0.5,0).setDepth(202));

    // ── Merkez görsel alan — düşmanı gösteren diyagram
    const cx=W/2, cy=260;
    // Piramit silüeti (büyütülmüş)
    const pyr=addI(S.add.graphics().setDepth(201));
    pyr.fillStyle(0xcc8800,1);
    pyr.fillTriangle(cx,cy-60, cx-50,cy+30, cx+50,cy+30);
    pyr.fillStyle(0xffaa00,1);
    pyr.fillTriangle(cx,cy-56, cx-46,cy+26, cx,cy+26);
    pyr.fillStyle(0xffcc44,0.4);
    pyr.fillTriangle(cx-10,cy-40, cx+10,cy-40, cx,cy-56);

    // Tam orta çizgi (perfect zone)
    const pz=addI(S.add.graphics().setDepth(203));
    pz.fillStyle(0xff2200,0.3); pz.fillRect(cx-10,cy-62,20,96);
    pz.lineStyle(3,0xff4400,1); pz.lineBetween(cx,cy-65,cx,cy+35);
    // Titreyen ışıltı efekti
    S.tweens.add({targets:pz,alpha:0.4,duration:400,yoyo:true,repeat:-1});

    // Sol taraf — NORMAL zon
    addI(S.add.graphics().setDepth(203)).fillStyle(0x4488ff,0.15).fillRect(cx-50,cy-62,40,96);
    addI(S.add.text(cx-30,cy+42,L("tutorialNormal"),{font:"bold 7px 'Courier New'",color:"#4488ff"}).setOrigin(0.5,0).setDepth(203));
    addI(S.add.text(cx-30,cy+52,L("tutorialNormalDmg"),{font:"bold 9px 'Courier New'",color:"#4488ff"}).setOrigin(0.5,0).setDepth(203));

    // Sağ taraf — NORMAL zon
    addI(S.add.graphics().setDepth(203)).fillStyle(0x4488ff,0.15).fillRect(cx+10,cy-62,40,96);
    addI(S.add.text(cx+30,cy+42,L("tutorialNormal"),{font:"bold 7px 'Courier New'",color:"#4488ff"}).setOrigin(0.5,0).setDepth(203));
    addI(S.add.text(cx+30,cy+52,L("tutorialNormalDmg"),{font:"bold 9px 'Courier New'",color:"#4488ff"}).setOrigin(0.5,0).setDepth(203));

    // Merkez etiket — PERFECT
    const perf=addI(S.add.text(cx,cy-80,L("tutorialPerfectZone"),{
        font:"bold 9px 'Courier New'",color:"#ff4400",
        stroke:"#000",strokeThickness:2
    }).setOrigin(0.5).setDepth(204));
    S.tweens.add({targets:perf,scaleX:1.15,scaleY:1.15,duration:350,yoyo:true,repeat:-1});

    addI(S.add.text(cx,cy+44,L("tutorialPerfectDmg"),{
        font:"bold 10px 'Courier New'",color:"#ff4400",stroke:"#000",strokeThickness:3
    }).setOrigin(0.5,0).setDepth(204));

    // ── Mermi animasyonu — ortadan geçerken flash
    const bul=addI(S.add.graphics().setDepth(205));
    bul.fillStyle(0xffffff,1); bul.fillRect(-2,0,4,12);
    bul.x=cx; bul.y=140;
    S.tweens.add({
        targets:bul, y:cy-20, duration:700, ease:"Linear",
        onUpdate:()=>{
            if(bul.y>cy-30&&bul.y<cy+10){
                // Perfect zone'a girince flash
                pyr.setAlpha(0.5+Math.random()*0.5);
                const fl=S.add.graphics().setDepth(206);
                fl.fillStyle(0xff4400,0.7); fl.fillRect(cx-10,bul.y-4,20,8);
                S.tweens.add({targets:fl,alpha:0,duration:80,onComplete:()=>fl.destroy()});
            }
        },
        onComplete:()=>{
            // Vuruş efekti
            const hit=S.add.graphics().setDepth(206);
            hit.fillStyle(0xff4400,0.9); hit.fillCircle(cx,cy-20,18);
            hit.fillStyle(0xffffff,0.8); hit.fillCircle(cx,cy-20,9);
            addI(hit);
            const htxt=addI(S.add.text(cx,cy-50,L("tutorialPerfectDmg"),{
                font:"bold 14px 'Courier New'",color:"#ffdd00",stroke:"#000",strokeThickness:4
            }).setOrigin(0.5).setDepth(207).setAlpha(0));
            S.tweens.add({targets:htxt,alpha:1,y:htxt.y-20,duration:400});
            S.tweens.add({targets:hit,scaleX:2.5,scaleY:2.5,alpha:0,duration:500,onComplete:()=>hit.destroy()});
        },
        repeat:2, repeatDelay:500
    });

    // ── Alt bilgi kutusu — ozel düsman bölümü dahil
    const info=addI(S.add.graphics().setDepth(201));
    info.fillStyle(0x0a0010,0.97); info.fillRoundedRect(16,390,328,150,8);
    info.lineStyle(2,0xff4400,0.7); info.strokeRoundedRect(16,390,328,150,8);
    info.fillStyle(0xff4400,0.08); info.fillRoundedRect(16,390,328,20,{tl:8,tr:8,bl:0,br:0});
    addI(S.add.text(W/2,400,"— NASIL OYNANIR —",{
        font:"bold 9px 'Courier New'",color:"#ff6633",stroke:"#000",strokeThickness:2,letterSpacing:2
    }).setOrigin(0.5,0).setDepth(202));
    addI(S.add.text(W/2,422,L("tutorialInfo1"),{
        font:"bold 10px 'Courier New'",color:"#ffffff",stroke:"#000000",strokeThickness:3,
        align:"center",wordWrap:{width:300}
    }).setOrigin(0.5,0).setDepth(202));
    addI(S.add.text(W/2,437,L("tutorialInfo2"),{
        font:"9px 'Courier New'",color:"#ffcc88",stroke:"#000",strokeThickness:2,
        align:"center",wordWrap:{width:300}
    }).setOrigin(0.5,0).setDepth(202));
    addI(S.add.text(W/2,450,L("tutorialInfo3"),{
        font:"8px 'Courier New'",color:"#aa8866",stroke:"#000",strokeThickness:2,
        align:"center",wordWrap:{width:300}
    }).setOrigin(0.5,0).setDepth(202));
    // Özel düşman rehberi
    addI(S.add.text(W/2,464,L("tutorialEnemies")||"⚠ SPECIAL ENEMIES",{
        font:"bold 8px 'Courier New'",color:"#ffee88",stroke:"#000",strokeThickness:2
    }).setOrigin(0.5,0).setDepth(202));
    const _tutEK=["tutorialInferno","tutorialGlacier","tutorialPhantomTri","tutorialVolt","tutorialObsidian"];
    const _tutEC=["#ff6644","#44ccff","#cc88ff","#ffee44","#aa66ff"];
    _tutEK.forEach((k,i)=>{
        const ex=i%2===0?W/2-82:W/2+5;
        const ey=476+Math.floor(i/2)*13;
        addI(S.add.text(i===4?W/2:ex,i===4?ey+1:ey,L(k)||k,{
            font:"7px 'Courier New'",color:_tutEC[i],stroke:"#000",strokeThickness:2,
            wordWrap:{width:145},align:i===4?"center":"left"
        }).setOrigin(i===4?0.5:0,0).setDepth(202));
    });

    // ── Devam butonu
    const btnG=addI(S.add.graphics().setDepth(202));
    const drawBtn=hov=>{
        btnG.clear();
        btnG.fillStyle(hov?0xff6622:0xff4400,1); btnG.fillRoundedRect(80,548,200,36,6);
        btnG.lineStyle(2,0xffdd00,hov?1.0:0.7); btnG.strokeRoundedRect(80,548,200,36,6);
        btnG.fillStyle(0xffffff,hov?0.12:0.05); btnG.fillRoundedRect(80,548,200,8,{tl:6,tr:6,bl:0,br:0});
    };
    drawBtn(false);
    addI(S.add.text(W/2,566,L("tutorialOk"),{
        font:"bold 11px 'Courier New'",color:"#ffdd00",stroke:"#000",strokeThickness:3
    }).setOrigin(0.5).setDepth(203));
    const btnH=addI(S.add.rectangle(W/2,566,200,36,0xffffff,0.001).setInteractive().setDepth(204));
    btnH.on("pointerover",()=>drawBtn(true));
    btnH.on("pointerout",()=>drawBtn(false));

    const closeTutorial=()=>{
        items.forEach(o=>{
            try{
                S.tweens.killTweensOf(o);
                S.tweens.add({targets:o,alpha:0,duration:200,onComplete:()=>{try{o.destroy();}catch(e){}}});
            }catch(e){try{o.destroy();}catch(ex){}}
        });
        S.time.delayedCall(220,()=>{
            S.physics.resume();
            GS.pickingUpgrade=false;
        });
    };

    btnH.on("pointerdown",closeTutorial);
    // 8 saniye sonra otomatik kapat
    S.time.delayedCall(8000,()=>{
        if(items[0]&&items[0].alpha>0) closeTutorial();
    });
}

// ── HAREKET ──────────────────────────────────────────────────
function movePlayer(S,delta){
    const gs=GS; if(!gs||gs.gameOver) return;
    if(!S.cursors) return;

    const leftDown  = S.cursors.left.isDown  || (S._altLeft  && S._altLeft.isDown) || !!S._mobileLeft;
    const rightDown = S.cursors.right.isDown || (S._altRight && S._altRight.isDown) || !!S._mobileRight;

    let vx=0;
    const sp=gs.moveSpeed||200;
    // Mirror controls event: yön ters çevrilir
    const _mirror=gs._mirrorControls?-1:1;
    if(leftDown && !rightDown)  vx=-sp*_mirror;
    if(rightDown && !leftDown)  vx=sp*_mirror;
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

    // Y zemine sabit — 3px yukarı alındı
    S.player.y=GROUND_Y-32;
    S.player.body.velocity.y=0;

    // Animasyon
    if(vx!==0){
        if(S.player.anims.currentAnim?.key!=="anim_run") S.player.play("anim_run",true);
        S.player.setFlipX(vx<0);
    } else {
        if(S.player.anims.currentAnim?.key!=="anim_idle") S.player.play("anim_idle",true);
    }
}

// ── ATEŞ — HER ZAMAN DÜZ GİDER ──
function doShoot(S){
    const gs=GS;
    const sp=gs.bulletSpeed||380;
    const vy=-sp;
    const px=S.player.x, py=S.player.y-42;

    // [OPT] EVOLUTIONS.find hot-path'ten kaldırıldı — applyUpgrade'de set edilen GS flag'leri kullanılıyor
    if(gs._evoTriCannon){
        fireBulletRaw(S,px,py,-sp*0.4,vy,0.6);
        fireBulletRaw(S,px,py,0,vy,1.0);
        fireBulletRaw(S,px,py,sp*0.4,vy,0.6);
    } else if(gs.multiShot>=3){
        if(Math.random()<0.20){
            fireBulletRaw(S,px,py,0,vy,1.0);
            fireBulletRaw(S,px,py,0,vy,0.9);
            fireBulletRaw(S,px,py,0,vy,0.8);
        } else {
            const spread=sp*0.28;
            fireBulletRaw(S,px,py,0,vy,1.0);
            fireBulletRaw(S,px,py,-spread,vy*0.85,0.55);
            fireBulletRaw(S,px,py, spread,vy*0.85,0.55);
        }
    } else if(gs.multiShot===2){
        if(Math.random()<0.20){
            fireBulletRaw(S,px,py,0,vy,1.0);
            fireBulletRaw(S,px,py,0,vy,0.9);
        } else {
            const spread=sp*0.16;
            fireBulletRaw(S,px,py,-spread,vy,0.7);
            fireBulletRaw(S,px,py, spread,vy,0.7);
        }
    } else {
        fireBulletRaw(S,px,py,(Math.random()-0.5)*sp*0.03,vy,1.0);
    }

    if(gs._evoOverload&&Math.random()<0.04){
        
        // [OPT] cache kullan + null guard
        const _ovList=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
        for(let _oi=0;_oi<_ovList.length;_oi++){if(Math.random()<0.25)applyDmg(S,_ovList[_oi],GS.damage*0.5,false);}
    }
}

function fireBulletRaw(S,x,y,vx,vy,dmgM){
    const gs=GS;
    const b=S.bullets.get();
    if(!b) return;
    b.setTexture("tex_bullet");
    b.setPosition(x,y);
    b.setActive(true).setVisible(true);
    if(!b.body){ S.bullets.remove(b,true,true); return; }
    b.body.enable=true;
    b.body.reset(x,y);
    b.body.setAllowGravity(false);
    b.body.setBounce(0,0);
    b.body.setMaxVelocity(900,900);
    b.body.setSize(6,16).setOffset(0,1);
    const spread=(Math.random()-0.5)*18;
    const sizeVar=0.9+Math.random()*0.2;
    b.setScale(gs.bulletScale*sizeVar*(dmgM>0.9?1:0.72));
    b.body.setVelocity(vx+spread,vy);
    b._pierced=0; b._age=0;
    b.setDepth(16); b.setAlpha(1);
    b.setRotation(Math.atan2(vy,vx)+Math.PI/2);

    // [WEAPON VİZÜEL] Damage level'e göre mermi rengi değişir
    const dmgLv=UPGRADES.damage?.level||0;
    const atkLv=UPGRADES.attack?.level||0;
    const totalLv=dmgLv+atkLv;
    if(totalLv>=8)      b.setTint(0xff2200); // Kırmızı-turuncu: çok güçlü
    else if(totalLv>=5) b.setTint(0xff8800); // Turuncu: güçlü
    else if(totalLv>=3) b.setTint(0xffcc44); // Sarı: orta
    else                b.clearTint();        // Varsayılan: beyaz

    // Namlu kıvılcımı — sadece yüksek levelde 2 adet, normalde 1
    const muzzleCount = totalLv>=4?2:1;
    for(let i=0;i<muzzleCount;i++){
        const sp=S.add.rectangle(x+Phaser.Math.Between(-2,2),y,1,Phaser.Math.Between(2,5),0xffffaa,0.75).setDepth(17);
        S.tweens.add({targets:sp,y:y-Phaser.Math.Between(3,8),alpha:0,duration:50,onComplete:()=>sp.destroy()});
    }

    // ── Mermi trail — damage seviyesine göre yoğunluk artar
    const trailHue=totalLv>=8?0xff4400:totalLv>=5?0xff8800:totalLv>=3?0xffcc44:0xffffff;
    const trailGlow=totalLv>=8?0xff6622:totalLv>=5?0xffaa44:0xfff5aa;
    const trailRepeat=totalLv>=6?5:4;
    S.time.addEvent({delay:18,repeat:trailRepeat,callback:()=>{
        if(!b.active) return;
        const tr=S.add.rectangle(b.x,b.y,1.5,Phaser.Math.Between(9,16),trailHue,0.60).setDepth(15);
        tr.setRotation(b.rotation);
        S.tweens.add({targets:tr,alpha:0,scaleX:0.15,scaleY:0.1,duration:55,ease:"Quad.easeIn",onComplete:()=>tr.destroy()});
        if(Math.random()<0.60){
            const tr2=S.add.rectangle(b.x,b.y,0.8,Phaser.Math.Between(6,10),0xffffff,0.40).setDepth(16);
            tr2.setRotation(b.rotation);
            S.tweens.add({targets:tr2,alpha:0,scaleY:0.07,duration:40,onComplete:()=>tr2.destroy()});
        }
        if(Math.random()<0.25){
            const trG=S.add.rectangle(b.x,b.y,2.5,Phaser.Math.Between(12,18),trailGlow,0.14).setDepth(13);
            trG.setRotation(b.rotation);
            S.tweens.add({targets:trG,alpha:0,scaleX:0.1,scaleY:0.08,duration:70,ease:"Sine.easeIn",onComplete:()=>trG.destroy()});
        }
        // Kıvılcım — %5 şansla (kaldırıldı neredeyse)
        if(Math.random()<0.05){
            const sp=S.add.rectangle(b.x,b.y,1,2,0xffffff,0.70).setDepth(14);
            const sa=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
            S.tweens.add({targets:sp,
                x:b.x+Math.cos(sa)*Phaser.Math.Between(3,8),
                y:b.y+Math.sin(sa)*Phaser.Math.Between(3,8),
                alpha:0,duration:45,onComplete:()=>sp.destroy()});
        }
    }});

    // Mermi kovanı — siyah, sarı çizgili
    const kx=x+Phaser.Math.Between(-4,4);
    const shell=S.add.graphics().setDepth(14).setPosition(kx,y+4);
    shell.fillStyle(0x222222,1); shell.fillRect(-1,-3,3,7);
    shell.fillStyle(0xffcc00,1); shell.fillRect(0,-2,1,5);
    const svx=(Math.random()-0.5)*55;
    S.tweens.add({targets:shell,x:kx+svx,y:y+Phaser.Math.Between(18,32),
        angle:Phaser.Math.Between(-180,180),alpha:0,duration:380,
        ease:"Quad.easeIn",onComplete:()=>shell.destroy()});
}

// ── BULLETS TICK ─────────────────────────────────────────────
function tickBullets(S){
    S.bullets.children.iterate(b=>{
        if(!b||!b.active||!b.body) return;
        // Sınır dışı
        if(b.x<-80||b.x>440||b.y<-80||b.y>720){
            b.setActive(false).setVisible(false);
            b.body.enable=false;
            return;
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
    gs.orbitAngle=(gs.orbitAngle||0)+0.04;
    const orbs=S.orbitGroup.getChildren(), lv=UPGRADES.orbit.level;
    orbs.forEach((o,i)=>{
        if(i<lv&&!gs._voidCurse){
            o.setActive(true).setVisible(true);
            const a=gs.orbitAngle+i*(Math.PI*2/Math.max(1,lv));
            const r=42+lv*8;
            o.setPosition(S.player.x+Math.cos(a)*r,S.player.y-15+Math.sin(a)*r);
            if(Math.random()<0.12){
                const sp=S.add.graphics().setDepth(13);
                const ang2=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
                const len=Phaser.Math.Between(4,9);
                sp.lineStyle(1,Math.random()<0.5?0xffffff:0x88ccff,0.9);
                sp.lineBetween(o.x,o.y,o.x+Math.cos(ang2)*len,o.y+Math.sin(ang2)*len);
                S.tweens.add({targets:sp,alpha:0,duration:Phaser.Math.Between(60,120),
                    ease:"Quad.easeOut",onComplete:()=>{try{sp.destroy();}catch(e){}}});
            }
            if(Math.random()<0.05){
                const er=S.add.graphics().setDepth(12);
                er.lineStyle(1,0x4488ff,0.7); er.strokeCircle(o.x,o.y,7+Math.random()*4);
                S.tweens.add({targets:er,alpha:0,scaleX:1.8,scaleY:1.8,duration:150,
                    ease:"Quad.easeOut",onComplete:()=>{try{er.destroy();}catch(e){}}});
            }
        }
        else{o.setActive(false).setVisible(false);}
    });
    // [FIX] _voidCurse tüm pasifleri devre dışı bırakır
    if(gs._voidCurse) return;
    if(UPGRADES.flame.level>0){
        drawFlameRing(S);
        gs._lastFlame=(gs._lastFlame||0)+delta;
        if(gs._lastFlame>220){gs._lastFlame=0;doFlameDmg(S);}
    }
    if(UPGRADES.lightning.level>0){gs._lastLightning=(gs._lastLightning||0)+delta;if(gs._lastLightning>1400){gs._lastLightning=0;doLightning(S);}}
    // ★ GIZLI SİNERJİ: Death Star — orbit yörünge tamamlandıkça lightning tetikle
    if(gs._synergyDeathStar && UPGRADES.orbit.level>0){
        gs._deathStarTimer=(gs._deathStarTimer||0)+delta;
        if(gs._deathStarTimer>1800){
            gs._deathStarTimer=0;
            doLightning(S); // orbit + lightning sinerji
        }
    }
    if(UPGRADES.laser.level>0){gs._lastLaser=(gs._lastLaser||0)+delta;if(gs._lastLaser>1600){gs._lastLaser=0;doLaser(S);}}
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
        const cooldown=Math.max(2000,3500-UPGRADES.poison.level*400);
        if(gs._lastPoison>cooldown){
            gs._lastPoison=0;
            spawnPoisonOrb(S);
        }
    }
}
// ── ALEV HALKASI GÖRSEL — her frame çizilir, tutarlı takip ──
function drawFlameRing(S){
    const gs=GS; if(!gs||!S||!S.flameRing||!S.player) return;
    const lv=UPGRADES.flame.level;
    const r=30+lv*14;
    const t=S.game.loop.totalElapsed*0.001;
    S.flameRing.clear();
    const cx=S.player.x, cy=S.player.y-14;
    S.flameRing.fillStyle(0xffffff,0.08+Math.sin(t*8)*0.04);
    S.flameRing.fillCircle(cx,cy,r*0.28);
    S.flameRing.fillStyle(0xffee44,0.12+Math.sin(t*6)*0.04);
    S.flameRing.fillCircle(cx,cy,r*0.40);
    S.flameRing.fillStyle(0xff8800,0.08);
    S.flameRing.fillCircle(cx,cy,r*0.55);
    const SEGMENTS=16;
    const angStep=360/SEGMENTS;
    for(let a=0;a<360;a+=angStep){
        const rad=Phaser.Math.DegToRad(a);
        const flicker1=Math.sin(t*9+a*0.055)*0.14;
        const flicker2=Math.sin(t*13+a*0.09)*0.08;
        const flicker3=Math.sin(t*5+a*0.12)*0.06;
        const wavR=r*(0.80+flicker1+flicker2+flicker3);
        const tongueR=wavR*(1.0+Math.max(0,Math.sin(t*7+a*0.15))*0.35);
        const heatRatio=(tongueR-r*0.70)/(r*0.55);
        const clampedHeat=Math.max(0,Math.min(1,heatRatio));
        let fc, falpha;
        if(clampedHeat>0.7){fc=0xffdd44; falpha=0.85+Math.random()*0.10;}
        else if(clampedHeat>0.35){fc=0xff8800; falpha=0.75+Math.random()*0.12;}
        else{fc=0xff2200; falpha=0.65+Math.random()*0.15;}
        const fx=cx+Math.cos(rad)*tongueR;
        const fy=cy+Math.sin(rad)*tongueR;
        const sz=2.5+lv*0.6+clampedHeat*2.5;
        S.flameRing.fillStyle(fc, falpha);
        S.flameRing.fillCircle(fx,fy,sz);
        if(clampedHeat>0.55){
            S.flameRing.fillStyle(0xffff88,falpha*0.5);
            S.flameRing.fillCircle(fx,fy,sz*0.45);
        }
        const innerR=r*(0.62+Math.sin(t*11+a*0.07)*0.06);
        S.flameRing.fillStyle(0xff5500,0.35+Math.sin(t*7+a*0.1)*0.12);
        S.flameRing.fillCircle(cx+Math.cos(rad)*innerR,cy+Math.sin(rad)*innerR,1.8+lv*0.4);
    }
    if(Math.random()<0.18){
        const fa=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
        const fr=r*Phaser.Math.FloatBetween(0.65,1.05);
        const fp=S.add.graphics().setDepth(9);
        const fc2=[0xff2200,0xff4400,0xff7700,0xff9900,0xffcc44][Math.floor(Math.random()*5)];
        const fs=Phaser.Math.Between(2,5+lv);
        fp.fillStyle(fc2,0.75+Math.random()*0.2);
        fp.fillTriangle(
            cx+Math.cos(fa)*fr, cy+Math.sin(fa)*fr,
            cx+Math.cos(fa)*fr+Math.cos(fa+1.2)*fs, cy+Math.sin(fa)*fr+Math.sin(fa+1.2)*fs,
            cx+Math.cos(fa)*fr+Math.cos(fa-1.2)*fs, cy+Math.sin(fa)*fr+Math.sin(fa-1.2)*fs
        );
        const rise=Phaser.Math.Between(14,32+lv*4);
        const drift=Phaser.Math.Between(-8,8);
        S.tweens.add({targets:fp, y:fp.y-rise, x:fp.x+drift,
            alpha:0, scaleX:0.15, scaleY:0.15,
            duration:Phaser.Math.Between(140,260), ease:"Quad.easeOut",
            onComplete:()=>{ try{fp.destroy();}catch(e){} }
        });
    }
}
function doFlameDmg(S){
    const gs=GS; if(!gs||!S||!S.player) return;
    const lv=UPGRADES.flame.level;
    const r=30+lv*14;
    const cx=S.player.x, cy=S.player.y-14;
    const enemies=S._activeEnemies&&S._activeEnemies.length>0
        ?S._activeEnemies:S.pyramids.getMatching("active",true);
    const r2=r*r;
    for(let _fi=0;_fi<enemies.length;_fi++){
        const p=enemies[_fi];
        if(!p||!p.active||p.spawnProtected) continue;
        const dx=cx-p.x, dy=cy-p.y;
        if(dx*dx+dy*dy<r2){
            applyDmg(S,p,0.3+lv*0.18,false);
            if(GS._synergyToxicFire) applyFlamePoison(S,p);
        }
    }
}
function doFlame(S){ drawFlameRing(S); doFlameDmg(S); }
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
        }).slice(0,2+lv);
    if(!targets.length) return;
    let prev={x:S.player.x,y:S.player.y-28};
    targets.forEach(t=>{
        applyDmg(S,t,gs.damage*(0.9+lv*0.35),false);
        if(gs._synergyChainStorm) applyChainStormToLightning(S,t);
        // [VFX OPT] Glow azaltıldı
        const glow=S.add.graphics().setDepth(19);
        glow.lineStyle(5,0x4488ff,0.10);
        glow.beginPath(); glow.moveTo(prev.x,prev.y);
        glow.lineTo(t.x,t.y-8); glow.strokePath();
        // Zigzag bolt
        const lg=S.add.graphics().setDepth(21);
        const steps=4;
        let cx=prev.x, cy=prev.y;
        const ex=t.x, ey=t.y-8;
        lg.lineStyle(1.5,0xffffff,0.85);
        lg.beginPath(); lg.moveTo(cx,cy);
        for(let s=1;s<=steps;s++){
            const nx=cx+(ex-prev.x)/steps + Phaser.Math.Between(-10,10);
            const ny=cy+(ey-prev.y)/steps + Phaser.Math.Between(-6,6);
            lg.lineTo(nx,ny);
            cx=nx; cy=ny;
        }
        lg.lineTo(ex,ey); lg.strokePath();
        // [VFX OPT] Hit flash — küçük, kısa
        const flash=S.add.graphics().setDepth(22);
        flash.fillStyle(0xaaddff,0.35); flash.fillCircle(t.x,t.y,7);
        S.tweens.add({targets:[lg,glow,flash],alpha:0,duration:140,onComplete:()=>{lg.destroy();glow.destroy();flash.destroy();}});
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

                // Hasar — güçlendirildi: lv1:3x, lv2:4x, lv3:5.5x
                const laserDmgMult=2.0+lv*1.0;
                (S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true)).forEach(e=>{
                    const laserCrit=gs._synergyLaserFocus&&Math.random()<0.6;
                    if(Math.abs(e.x-bx)<24+lv*4) applyDmg(S,e,gs.damage*laserDmgMult,laserCrit||true);
                });

                S.cameras.main.shake(50+lv*10,0.008+lv*0.002);
                // Flaş beyaz — ekran geneli anlık parlaklık
                const screenFlash=S.add.rectangle(180,320,360,640,0xff2200,0).setDepth(24);
                S.tweens.add({targets:screenFlash,fillAlpha:0.08+lv*0.03,duration:60,yoyo:true,onComplete:()=>screenFlash.destroy()});

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
            applyDmg(S,te,gs.damage*(0.7+lv*0.2),false);
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
                S.tweens.add({targets:[tg,imp],alpha:0,duration:140,onComplete:()=>{tg.destroy();imp.destroy();}});
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
        d.angle+=diff*0.07;
    } else { d.angle=d._spinAngle; }
    d.lastShoot=(d.lastShoot||0)+S.game.loop.delta;if(d.lastShoot>680){d.lastShoot=0;if(ae.length>0){const t=ae[Math.floor(Math.random()*ae.length)];const dspd=(GS.bulletSpeed||380)/200;fireBulletRaw(S,d.x,d.y,(t.x-d.x)*dspd,(t.y-d.y)*dspd,0.8);
    // ★ YENİ: Drone Shield sinerjisi — her 8 drone atışında +1 can
    if(gs._synergyDroneShield){gs._droneHitCount=(gs._droneHitCount||0)+1;if(gs._droneHitCount>=8){gs._droneHitCount=0;gs.health=Math.min(gs.maxHealth,gs.health+1);}}
}}});}

// ── XP ────────────────────────────────────────────────────────
function spawnXpOrb(S,x,y,tex,val){
    if(S.xpOrbs.length>120) return;
    const tk=tex||"xp_blue";
    // Pixel kristal — scale 0.95-1.10 arası (doku büyüdü, scale hafif düşürüldü)
    const sc=0.95+Math.random()*0.15;
    const obj=S.add.image(x,y,tk).setDepth(17).setScale(sc);
    // Spawn parıltısı — küçük, hızlı
    const gc=tk.includes("gold")?0xffee44:tk.includes("red")?0xff4422:tk.includes("purple")?0xcc44ff:tk.includes("green")?0x44ff88:0x44aaff;
    const gfx=S.add.graphics().setDepth(18);
    gfx.lineStyle(1,gc,0.8); gfx.strokeCircle(x,y,4);
    S.tweens.add({targets:gfx,scaleX:2,scaleY:2,alpha:0,duration:150,ease:"Quad.easeOut",onComplete:()=>gfx.destroy()});
    S.xpOrbs.push({
        obj,
        vx:Phaser.Math.FloatBetween(-50,50),
        vy:Phaser.Math.FloatBetween(-130,-70),
        val, life:11000, dead:false,
        baseScale:sc,
        bounceCount:0,
        floatT:0,
        floatPhase:Math.random()*Math.PI*2
    });
}
function tickXP(S){
    const gs=GS; if(!gs||gs.gameOver) return;
    const _magnetFromUpgrade = (UPGRADES.magnet?.level||0) * 68;
    const _totalMagnetR = gs.magnetRadius + (gs._magnetUpgradeApplied?0:_magnetFromUpgrade);
    const M=_totalMagnetR>0||gs._evoGravityWell;
    const magR=gs._evoGravityWell?999:Math.max(gs.magnetRadius, _totalMagnetR);
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
            // Hafif rotate — canlı hissi
            o.obj.angle=(o.obj.angle||0)+0.3;
        }

        // [XP] Absorb — dist2 < 60*60 = 3600
        if(dist2<3600){
            gs.xp+=o.val;
            // Collect burst — küçük ışık parçacıkları
            const bx=o.obj.x, by=o.obj.y;
            const tk=o.obj.texture?.key||"";
            const bc=tk.includes("gold")?0xffdd44:tk.includes("red")?0xff5533:tk.includes("purple")?0xcc44ff:tk.includes("green")?0x44ff88:0x88aaff;
            for(let _bi=0;_bi<4;_bi++){
                const _ang=Phaser.Math.DegToRad(_bi*90+Phaser.Math.Between(-20,20));
                const _spd=Phaser.Math.Between(25,55);
                const _bp=S.add.graphics().setDepth(18);
                _bp.x=bx; _bp.y=by;
                _bp.lineStyle(1.5,bc,0.85); _bp.lineBetween(0,0,Math.cos(_ang)*3,Math.sin(_ang)*3);
                S.tweens.add({targets:_bp,
                    x:bx+Math.cos(_ang)*_spd, y:by+Math.sin(_ang)*_spd*0.6,
                    alpha:0,scaleX:0,scaleY:0,duration:Phaser.Math.Between(150,280),
                    ease:"Quad.easeOut",onComplete:()=>_bp.destroy()});
            }
            // Flash — ince halka, dikdörtgen YOK
            const _fl=S.add.graphics().setDepth(18);
            _fl.x=bx; _fl.y=by;
            _fl.lineStyle(1.5,0xffffff,0.7); _fl.strokeCircle(0,0,4);
            S.tweens.add({targets:_fl,alpha:0,scaleX:2.8,scaleY:2.8,duration:110,onComplete:()=>_fl.destroy()});
            try{o.obj.destroy();}catch(e){}
            o.dead=true; hasDead=true;
            while(gs.xp>=gs.xpToNext){gs.xp-=gs.xpToNext;levelUp(S);}
            continue;
        }

        if(o.life<1200){o.obj.setAlpha(o.life/1200);}
        if(o.life<=0){try{o.obj.destroy();}catch(e){}o.dead=true;hasDead=true;}
    }
    // [PERF] Tek seferde temizle — per-iter splice yerine
    if(hasDead) S.xpOrbs=S.xpOrbs.filter(o=>!o.dead);
}

// ── LEVEL UP ─────────────────────────────────────────────────
function levelUp(S){
    const gs=GS;
    // Guard: mutex ile sadece bir kez tetiklenir
    if(gs.pickingUpgrade || _upgradeLock > 0) return;
    lockUpgrade(gs, S);

    gs.level++; gs.xpToNext=Math.round(gs.xpToNext*1.3);
    gs.pyramidSpeed=Math.min(280,100+gs.level*5.5);
    S.time.timeScale=1.0;
    // ── AAA LEVEL UP VFX ──
    vfxLevelUp(S,gs.level);
    // Ekrandaki tüm aktif mermileri durdur
    if(S.bullets) S.bullets.children.each(b=>{if(b.active&&b.body)b.body.setVelocity(0,0);});
    // Düşmanları da dondur
    if(S.pyramids) S.pyramids.children.each(e=>{if(e.active&&e.body)e.body.setVelocity(0,0);});

    showLevelUpUI(S);
    gs.score+=500*gs.level;
    updateQuestProgress("level", gs.level);
    onLevelUpPowerSpike(S);
    // XP Surge relic
    if(gs.activeRelics&&gs.activeRelics.includes("xp_surge")){
        gs._xpBoostTimer=(gs._xpBoostTimer||0)+5000;
        showHitTxt(S,180,160,"📈 XP DALGASI!","#66ffcc",false);
    }
    // Kristal: lv25 milestone
    if(gs.level===25){
        addCrystal(CRYSTAL_SOURCES.level_25,"level_25");
        showHitTxt(S,180,300,"💎 +1 KRİSTAL (Lv25)!","#cc44ff",true);
        if(S._crystalHudText) S._crystalHudText.setText("💎 "+PLAYER_CRYSTAL);
    }
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
function showLevelUpUI(S){
    const gs=GS, W=360, H=640;
    const evo=checkEvolution();
    const pool=evo?[...evo]:[...getUpgradePool()];
    const picks=Phaser.Utils.Array.Shuffle(pool).slice(0,3);
    const ui=new UIGroup(S);

    // Rarity tanımları
    const RARITY={
        common:   {col:0x5588cc,glow:0x3366aa,label:"COMMON",   bg:0x060c18},
        rare:     {col:0xaa44ff,glow:0x7722cc,label:"RARE",     bg:0x0a0618},
        epic:     {col:0xff7700,glow:0xcc5500,label:"EPIC",     bg:0x130800},
        legendary:{col:0xffcc00,glow:0xcc9900,label:"LEGEND",   bg:0x141000},
        evo:      {col:0x44ff88,glow:0x22cc55,label:"EVRİM",    bg:0x061308},
    };

    // ── OVERLAY — daha saydam, oyun arka planı görünür
    const ov=ui.add(S.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(300));
    S.tweens.add({targets:ov,fillAlpha:0.70,duration:180});

    // ── PANEL — rounded corners, modern
    const panelG=ui.add(S.add.graphics().setDepth(301).setAlpha(0));
    const PANEL_X=18, PANEL_Y=64, PANEL_W=324, PANEL_H=516;
    panelG.fillStyle(0x03000a,0.97); panelG.fillRoundedRect(PANEL_X,PANEL_Y,PANEL_W,PANEL_H,10);
    panelG.lineStyle(2,0x4488ff,0.65); panelG.strokeRoundedRect(PANEL_X,PANEL_Y,PANEL_W,PANEL_H,10);
    panelG.lineStyle(1,0x224488,0.25); panelG.strokeRoundedRect(PANEL_X+3,PANEL_Y+3,PANEL_W-6,PANEL_H-6,8);
    // Üst accent bar
    panelG.fillStyle(0x4488ff,0.22); panelG.fillRoundedRect(PANEL_X,PANEL_Y,PANEL_W,4,{tl:10,tr:10,bl:0,br:0});
    S.tweens.add({targets:panelG,alpha:1,duration:200,ease:"Quad.easeOut"});

    // ── BAŞLIK alanı
    const titleG=ui.add(S.add.graphics().setDepth(302).setAlpha(0));
    titleG.fillStyle(0x4488ff,0.07); titleG.fillRoundedRect(PANEL_X,PANEL_Y,PANEL_W,54,{tl:10,tr:10,bl:0,br:0});
    const title=ui.add(S.add.text(W/2,PANEL_Y+12,L("levelUp"),{
        font:"bold 20px 'Courier New'",color:"#88bbff",
        stroke:"#000000",strokeThickness:6,letterSpacing:4
    }).setOrigin(0.5,0).setDepth(303).setAlpha(0));
    const lvTxt=ui.add(S.add.text(W/2,PANEL_Y+34,"— Level "+gs.level+" —",{
        font:"bold 11px 'Courier New'",color:"#336699",
        stroke:"#000",strokeThickness:2,letterSpacing:2
    }).setOrigin(0.5,0).setDepth(303).setAlpha(0));
    const subTxt=ui.add(S.add.text(W/2,PANEL_Y+48,L("pickPower"),{
        font:"bold 9px 'Courier New'",color:"#335577",stroke:"#000",strokeThickness:2
    }).setOrigin(0.5,0).setDepth(303).setAlpha(0));
    S.tweens.add({targets:[titleG,title,lvTxt,subTxt],alpha:1,duration:250,ease:"Quad.easeOut"});

    // ── AMBIENT partiküller — seyrekleştirildi
    let ambOn=true;
    const ambEv=S.time.addEvent({delay:220,loop:true,callback:()=>{
        if(!ambOn) return;
        const ax=Phaser.Math.Between(PANEL_X+8,PANEL_X+PANEL_W-8);
        const ay=Phaser.Math.Between(PANEL_Y+60,PANEL_Y+PANEL_H-10);
        const amb=S.add.graphics().setDepth(301);
        const ac=[0x4488ff,0xaa44ff,0xff7700,0x44ff88,0xffffff];
        amb.fillStyle(ac[Math.floor(Math.random()*ac.length)],0.2+Math.random()*0.25);
        amb.fillRect(0,0,Math.random()<0.5?1:2,Math.random()<0.5?1:2);
        amb.x=ax; amb.y=ay;
        S.tweens.add({targets:amb,y:ay-Phaser.Math.Between(14,36),alpha:0,
            duration:Phaser.Math.Between(900,1700),ease:"Quad.easeOut",
            onComplete:()=>amb.destroy()});
    }});
    ui.add({destroy:()=>{ambOn=false;ambEv.remove();}});

    // ── KARTLAR
    const CARD_H=130;
    const CARD_GAP=8;
    const CARDS_START=PANEL_Y+60;

    picks.forEach((upKey,i)=>{
        const isEvo=upKey.startsWith("evo_");
        const up=isEvo?null:UPGRADES[upKey];
        const rKey=isEvo?"evo":(up?.rarity||"common");
        const R=RARITY[rKey]||RARITY.common;
        const acc=R.col;
        const cardY=CARDS_START+i*(CARD_H+CARD_GAP);
        const CX=PANEL_X+6, CW=PANEL_W-12;

        // ── KART GRAFİĞİ — rounded corners
        const card=ui.add(S.add.graphics().setDepth(302).setAlpha(0));
        let hovered=false;

        const drawCard=(hov)=>{
            hovered=hov;
            card.clear();
            // Arka plan
            card.fillStyle(R.bg,1); card.fillRoundedRect(CX,cardY,CW,CARD_H,7);
            // Rarity overlay
            card.fillStyle(acc,hov?0.22:0.09); card.fillRoundedRect(CX,cardY,CW,CARD_H,7);
            // Sol accent bar — kalın, parlak
            card.fillStyle(acc,hov?1.0:0.7); card.fillRoundedRect(CX,cardY,4,CARD_H,{tl:7,tr:0,bl:7,br:0});
            // Üst gradient şerit
            card.fillStyle(acc,hov?0.45:0.18); card.fillRoundedRect(CX,cardY,CW,3,{tl:7,tr:7,bl:0,br:0});
            // Border
            card.lineStyle(hov?2:1.5,acc,hov?1.0:0.65); card.strokeRoundedRect(CX,cardY,CW,CARD_H,7);
            // Hover inner glow şeridi
            if(hov){
                card.lineStyle(1,acc,0.22); card.strokeRoundedRect(CX+3,cardY+3,CW-6,CARD_H-6,5);
                // Sağ kenar parlaklık
                card.fillStyle(acc,0.06); card.fillRoundedRect(CX+CW-28,cardY+4,24,CARD_H-8,4);
            }
            // İkon kutusu
            card.fillStyle(0x000000,0.40); card.fillRoundedRect(CX+6,cardY+6,46,CARD_H-12,5);
            card.lineStyle(1,acc,hov?0.50:0.25); card.strokeRoundedRect(CX+6,cardY+6,46,CARD_H-12,5);
        };
        drawCard(false);

        // ── İKON
        const evoObj=isEvo?EVOLUTIONS.find(e=>e.nameKey===upKey.replace("evo_","")):null;
        const evoCardIcon=evoObj?.icon||"";
        const iconKey=isEvo?(UPGRADES[evoObj?.req?.[0]]?.icon||"icon_damage"):(up?.icon||"icon_damage");
        let ico=null;
        try{
            ico=ui.add(S.add.image(CX+29,cardY+CARD_H/2,iconKey)
                .setScale(1.85).setDepth(304).setAlpha(0));
        }catch(e){}

        // İkon glow halkası — iki katmanlı
        const icoGlow=ui.add(S.add.graphics().setDepth(303).setAlpha(0));
        icoGlow.x=CX+29; icoGlow.y=cardY+CARD_H/2;
        icoGlow.lineStyle(1.5,acc,0.55); icoGlow.strokeCircle(0,0,19);
        icoGlow.lineStyle(0.7,acc,0.20); icoGlow.strokeCircle(0,0,26);

        // ── METİNLER
        const TEXT_X=CX+58;
        const TEXT_W=CW-65;

        // Rarity badge — rounded
        const rarL=R.label;
        const rarBadge=ui.add(S.add.graphics().setDepth(304).setAlpha(0));
        rarBadge.fillStyle(acc,0.25); rarBadge.fillRoundedRect(TEXT_X,cardY+7,52,13,3);
        rarBadge.lineStyle(0.8,acc,0.7); rarBadge.strokeRoundedRect(TEXT_X,cardY+7,52,13,3);
        const rarTxt=ui.add(S.add.text(TEXT_X+26,cardY+13,rarL,{
            font:"bold 8px 'Courier New'",
            color:Phaser.Display.Color.IntegerToColor(acc).rgba,
            stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(305).setAlpha(0));

        // [UPGRADE VİZÜEL] Mevcut level → bir sonraki level göstergesi
        const nameStr=isEvo?(evoCardIcon+" "+L(upKey)):L(up.nameKey);
        const lvStr=isEvo?"": " Lv"+(up.level+1)+"/"+up.max;
        const nameTxt=ui.add(S.add.text(TEXT_X,cardY+24,nameStr,{
            font:"bold 13px 'Courier New'",color:"#ffffff",
            stroke:"#000000",strokeThickness:4,wordWrap:{width:TEXT_W}
        }).setDepth(305).setAlpha(0));

        // Level string — rarity rengiyle ayrı
        if(!isEvo){
            ui.add(S.add.text(TEXT_X+TEXT_W,cardY+24,lvStr,{
                font:"bold 11px 'Courier New'",
                color:Phaser.Display.Color.IntegerToColor(acc).rgba,
                stroke:"#000",strokeThickness:3
            }).setOrigin(1,0).setDepth(305).setAlpha(0));
        }

        // Açıklama
        const _evo=isEvo?EVOLUTIONS.find(e=>e.nameKey===upKey.replace("evo_","")):null;
        const _evoIcon=_evo?.icon||"";
        const descStr=(_evo?(_evoIcon+" "+L(_evo.descKey)):up?L(up.descKey):"")||"";
        const descTxt=ui.add(S.add.text(TEXT_X,cardY+42,descStr,{
            font:"bold 10px 'Courier New'",color:"#9eafc2",
            stroke:"#000",strokeThickness:2,wordWrap:{width:TEXT_W}
        }).setDepth(305).setAlpha(0));

        // [UPGRADE VİZÜEL] Level pip barı — mevcut doluluk görsel olarak belirgin
        const pipObjs=[];
        if(up){
            const pipY=cardY+CARD_H-16;
            // Pip arka plan track
            const pipBg=ui.add(S.add.graphics().setDepth(304).setAlpha(0));
            pipBg.fillStyle(0x0a0a1e,0.8); pipBg.fillRoundedRect(TEXT_X,pipY-1,up.max*15+2,8,2);
            pipObjs.push(pipBg);
            for(let lv2=0;lv2<up.max;lv2++){
                const pg2=ui.add(S.add.graphics().setDepth(305).setAlpha(0));
                const filled=lv2<up.level;
                const isNext=lv2===up.level; // Seçilecek seviye
                // Dolu pip: parlak rarity rengi, boş: koyu
                // Sonraki pip (kazanılacak): yarı parlak + pulse hissi
                pg2.fillStyle(filled?acc:(isNext?acc:0x1a1a2e), filled?0.9:(isNext?0.40:0.25));
                pg2.fillRoundedRect(TEXT_X+lv2*15,pipY,13,6,2);
                if(filled){
                    pg2.fillStyle(0xffffff,0.35);
                    pg2.fillRoundedRect(TEXT_X+lv2*15,pipY,13,2,1);
                }
                if(isNext){
                    // Kazanılacak pip'e ince border
                    pg2.lineStyle(1,acc,0.6);
                    pg2.strokeRoundedRect(TEXT_X+lv2*15,pipY,13,6,2);
                }
                pipObjs.push(pg2);
            }
        }

        // Tüm kart elemanları
        const cardEls=[card,ico,icoGlow,rarBadge,rarTxt,nameTxt,descTxt,...pipObjs].filter(Boolean);

        // ── STAGGER GİRİŞ — sağdan sola kayarak
        cardEls.forEach(el=>{if(el&&typeof el.setAlpha==="function") el.setAlpha(0);});
        S.time.delayedCall(i*85+55,()=>{
            if(typeof card.setX==="function") card.setX(28);
            S.tweens.add({targets:cardEls,alpha:1,duration:190,ease:"Quad.easeOut"});
            S.tweens.add({targets:card,x:0,duration:210,ease:"Back.easeOut"});
            if(ico){
                ico.setScale(0.4);
                S.tweens.add({targets:ico,scaleX:1.85,scaleY:1.85,duration:220,ease:"Back.easeOut"});
            }
        });

        // ── HOVER
        const hit=ui.add(S.add.rectangle(CX+CW/2,cardY+CARD_H/2,CW,CARD_H,0xffffff,0.001)
            .setInteractive().setDepth(306));

        hit.on("pointerover",()=>{
            drawCard(true);
            if(ico) S.tweens.add({targets:ico,scaleX:2.1,scaleY:2.1,duration:90,ease:"Back.easeOut"});
            icoGlow.setAlpha(1.0);
            S.tweens.add({targets:cardEls,y:"-=3",duration:90,ease:"Quad.easeOut"});
        });
        hit.on("pointerout",()=>{
            drawCard(false);
            if(ico) S.tweens.add({targets:ico,scaleX:1.85,scaleY:1.85,duration:90,ease:"Quad.easeOut"});
            icoGlow.setAlpha(0.5);
            S.tweens.add({targets:cardEls,y:"+=3",duration:90,ease:"Quad.easeOut"});
        });

        // ── SEÇİM — click animasyon güçlendirildi
        hit.on("pointerdown",()=>{
            // Seçim flash — rarity renginde
            const selFlash=S.add.rectangle(CX+CW/2,cardY+CARD_H/2,CW,CARD_H,acc,0.45).setDepth(307);
            S.tweens.add({targets:selFlash,alpha:0,scaleX:1.06,scaleY:1.06,duration:220,
                ease:"Quad.easeOut",onComplete:()=>selFlash.destroy()});
            // İkon zoom-burst
            if(ico) S.tweens.add({targets:ico,scaleX:3.2,scaleY:3.2,alpha:0,duration:200,ease:"Back.easeIn"});
            // 4 köşe kıvılcım
            for(let _ci=0;_ci<4;_ci++){
                const _cx=[CX+8,CX+CW-8,CX+8,CX+CW-8][_ci];
                const _cy=[cardY+8,cardY+8,cardY+CARD_H-8,cardY+CARD_H-8][_ci];
                const sp=S.add.graphics().setDepth(308);
                sp.fillStyle(acc,0.9); sp.fillRect(-2,-2,4,4);
                sp.x=_cx; sp.y=_cy;
                const ang=Phaser.Math.DegToRad([225,315,135,45][_ci]);
                S.tweens.add({targets:sp,
                    x:_cx+Math.cos(ang)*18,y:_cy+Math.sin(ang)*18,
                    alpha:0,scaleX:0.1,scaleY:0.1,duration:200,
                    ease:"Quad.easeOut",onComplete:()=>sp.destroy()});
            }
            // Slot'a uçan ikon
            try{
                const flyIco=S.add.image(CX+29,cardY+CARD_H/2,iconKey).setDepth(310).setScale(1.85);
                const slotX=5+(up?Object.entries(UPGRADES).filter(([k,u2])=>u2.type===(up.type||"weapon")&&u2.level>0).length:0)*23+10;
                const slotY=up?.type==="passive"?47:15;
                S.tweens.add({targets:flyIco,x:slotX,y:slotY,scaleX:0.55,scaleY:0.55,alpha:0,
                    duration:340,ease:"Quad.easeIn",onComplete:()=>flyIco.destroy()});
            }catch(e){}
            
            S.time.delayedCall(115,()=>{
                ambOn=false; ambEv.remove();
                applyUpgrade(S,upKey,isEvo);
                ui.fadeAndDestroy(150);
                S.time.delayedCall(160,()=>{
                    S.time.timeScale=1.0;
                    unlockUpgrade(gs, S);
                    refreshSlots(S);
                });
            });
        });
    });
}
function checkEvolution(){for(const evo of EVOLUTIONS){if(evo.active)continue;if(evo.req.every(r=>UPGRADES[r]&&UPGRADES[r].level>=UPGRADES[r].max)&&Math.random()<0.45)return["evo_"+evo.nameKey];}return null;}
function getUpgradePool(){
    // Her upgrade sadece BİR kez pool'a girer — duplikat yok
    // Fullenmiş upgrade'ler ASLA pool'a girmez
    const pool=[];
    const gs=GS;
    const wC=Object.values(UPGRADES).filter(u=>u.type==="weapon"&&u.level>0).length;
    const pC=Object.values(UPGRADES).filter(u=>u.type==="passive"&&u.level>0).length;

    // ── WEIGHTED RNG — Gizli denge sistemi ──────────────────────
    const hpRatio = gs ? (gs.health / gs.maxHealth) : 1;
    const isWeak  = hpRatio < 0.40;
    const isStrong = gs && gs.level > 12;

    // [BALANCE] Aktif silahlarla sinerji kurabilecek upgradeler tespit et
    const activeWeapons=Object.entries(UPGRADES).filter(([k,u])=>u.type==="weapon"&&u.level>0).map(([k])=>k);
    const synergyKeys=new Set();
    SYNERGIES.forEach(syn=>{
        if(syn.active) return;
        const matches=syn.req.filter(r=>activeWeapons.includes(r));
        if(matches.length>0) syn.req.forEach(r=>synergyKeys.add(r));
    });

    for(const [k,u] of Object.entries(UPGRADES)){
        // Fullenmiş upgrade'i KESİNLİKLE atla
        const maxLv = u.max ?? u.maxLevel ?? 999;
        if((u.level||0) >= maxLv) continue;
        if(u.type==="weapon"&&u.level===0&&wC>=MAX_WEAPONS) continue;
        if(u.type==="passive"&&u.level===0&&pC>=MAX_PASSIVES) continue;

        // Ağırlıklı ekleme
        const isHealType = ["heal","regen","maxhp"].includes(k);
        const isOffensive = ["damage","crit","explosive","meteor","laser"].includes(k);
        const isSynergyMatch = synergyKeys.has(k);
        let weight = 1;
        if(isWeak && isHealType) weight=3;
        else if(isStrong && isOffensive) weight=2;
        // [BALANCE] Sinerji tamamlayıcılarına hafif bonus — build odağı
        if(isSynergyMatch) weight=Math.max(weight,2);
        for(let w=0; w<weight; w++) pool.push(k);
    }
    if(pool.length>0) return pool;
    const fallback=["heal","damage","speed","speed","pierce","crit"].filter(k=>UPGRADES[k]&&(UPGRADES[k].level||0)<(UPGRADES[k].max??UPGRADES[k].maxLevel??999));
    return fallback.length>0?fallback:["heal"];
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
                "evoGravityWell":"_evoGravityWell","evoOverload":"_evoOverload",
                "evoCryoField":"_evoCryoField","evoPlagueBearer":"_evoPlagueBearer"
            };
            if(flagMap[en]) GS[flagMap[en]]=true;
            // ★ YENİ: Güçlü evolution sineması (eski flash kaldırılmadı, üstüne eklendi)
            const evoColorMap={
                evoTriCannon:0xff8800,evoStormCore:0xffff44,evoGravityWell:0x44ffcc,
                evoOverload:0xff44aa,evoCryoField:0x88ddff,evoPlagueBearer:0x44ff44
            };
            const ec=evoColorMap[en]||0xffffff;
            
            S.time.delayedCall(80,()=>showEvolutionCinematic(S,L(evo.nameKey)||evo.name,ec));
        }
        return;
    }
    const up=UPGRADES[key];if(!up)return;
    up.level=Math.min(up.level+1,up.max);
    switch(key){
        case"damage": {
            // [BALANCE] Soft cap: ilk seviyelerde tam, sonra diminishing returns
            const rawMult=1.12;
            const lv=UPGRADES.damage.level;
            const scale=lv<=3?rawMult:rawMult*(1-Math.min(0.45,(lv-3)*0.07));
            gs.damage*=scale;
            // [BALANCE] Hard cap: hasar 999'u geçmesin
            gs.damage=Math.min(999,gs.damage);
            break;
        }
        case"attack": {
            // [BALANCE] Ateş hızı soft cap — 120ms altına düşmesin
            const atkLv=UPGRADES.attack.level;
            const atkMult=atkLv<=4?0.88:(0.88+(atkLv-4)*0.018);
            gs.shootDelay=Math.max(120,gs.shootDelay*Math.min(1,atkMult));
            gs.bulletSpeed=Math.min(520,gs.bulletSpeed+22);
            break;
        }
        case"size":      gs.bulletScale=Math.min(2.2,gs.bulletScale+0.22); break;
        case"multi":     gs.multiShot=Math.min(3,gs.multiShot+1); break;
        case"pierce":    gs.pierceCount++; break;
        case"crit":      gs.critChance+=0.08; break;
        case"knockback": gs.knockback=Math.min(1,gs.knockback+0.5); break;
        case"freeze":    gs.freezeChance+=0.09; break;
        case"xpboost":   gs.xpMult+=0.12; break;
        case"maxhp":     gs.maxHealth+=5;gs.health=Math.min(gs.health+5,gs.maxHealth);
            gs._healFlash=500; // [VFX] Can artışı yeşil flash
            break;
        case"regen":
            gs._healFlash=300; // [VFX] Regen alındı flash
            break;
        case"magnet":
            gs.magnetRadius+=68;
            gs._magnetUpgradeApplied=true; // duplikasyon önleme flag
            break;
        case"heal":      gs.health=Math.min(gs.maxHealth,gs.health+8);
            gs._healFlash=600; // [VFX] Anında can flash
            break;
        case"speed": {
            // [BALANCE] Hız soft cap — 280'i geçmesin
            const spdLv=UPGRADES.speed.level;
            const spdMult=spdLv<=3?1.10:(1.10-(spdLv-3)*0.015);
            gs.moveSpeed=Math.min(280,gs.moveSpeed*Math.max(1.02,spdMult));
            gs._speedBuffActive=true;
            if(S) S.time.delayedCall(3000,()=>{if(!GS._speedSurgeEvent)gs._speedBuffActive=false;});
            break;
        }
        // Weapon upgrades — level artırıldı, tickWeapons otomatik aktive eder
        case"orbit":     break;
        case"explosive": break;
        case"flame":     break;
        case"lightning": break;
        case"drone":     break;
        case"saw":       break;
        case"poison":    break;
        case"meteor":    break;
        case"laser":     break;
        case"thunder":   break;
    }
    // ★ YENİ: Upgrade sonrası sinerji kontrolü tetikle
    checkAndApplySynergies(S);
    // ★ Build title — güçlü kombo varsa göster
    S.time.delayedCall(600,()=>showBuildTitle(S));

    // [VFX] Upgrade alınma oyuncu feedback — rarity rengiyle aura
    if(S&&S.player){
        const upColor=UPGRADES[key]?.color||0x4488ff;
        const plx=S.player.x, ply=S.player.y;
        // Oyuncu etrafında renkli halka patlaması
        for(let ui=0;ui<2;ui++){
            S.time.delayedCall(ui*80,()=>{
                const ur=S.add.graphics().setDepth(25);
                ur.x=plx; ur.y=ply;
                ur.lineStyle(2+ui,upColor,1.0); ur.strokeCircle(0,0,12+ui*10);
                S.tweens.add({targets:ur,scaleX:3.5,scaleY:3.5,alpha:0,
                    duration:350,ease:"Quad.easeOut",onComplete:()=>ur.destroy()});
            });
        }
        // Yukarı yükselen renk teli
        const ut=S.add.text(plx,ply-28,"▲ "+L(UPGRADES[key]?.nameKey||key),{
            font:"bold 8px 'Courier New'",
            color:Phaser.Display.Color.IntegerToColor(upColor).rgba,
            stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(25).setAlpha(0.9);
        S.tweens.add({targets:ut,y:ut.y-22,alpha:0,duration:700,ease:"Quad.easeOut",
            onComplete:()=>ut.destroy()});
    }
}

// ── KILL + XP ────────────────────────────────────────────────
function spawnMirrorClone(S,src){const p=S.pyramids.get(src.x+Phaser.Math.Between(-30,30),src.y-10,"pyramid");if(!p)return;p.setActive(true).setVisible(true);resetEF(p);p.type="minion";p.hp=1;p.maxHP=1;p.setScale(0.5).setVelocityY(GS.pyramidSpeed*0.6);p.spawnProtected=false;p.body.setSize(20,20).setOffset(5,5);p.setAlpha(0.6).setTint(0xaaaaff);}

function killEnemy(S,p,giveXP){
    if(!p||!p.active) return;
    const px=p.x,py=p.y,gs=GS;
    if(!gs) return;

    // ★ YENİ: Mini boss ölüm kontrolü — önce özel davranış
    if(p._isMiniBoss){ handleMiniBossDeath(S,p); }

    // Düşman rengini al
    const typeColors={normal:0xffcc55,zigzag:0x44ff88,fast:0xff4422,tank:0xaa44ff,
        shield:0x4488ff,kamikaze:0xff6600,ghost:0x88aacc,elder:0xffcc44,
        titan:0x9900dd,colossus:0xff2266,healer:0x00ff88,berserker:0xff0000,
        freezer:0x88ddff,toxic:0x66cc00,bomber:0xff3300,
        inferno:0xFF3300,glacier:0x44ccff,phantom_tri:0xcc44ff,volt:0xffee00,obsidian:0x6600aa};
    const deathColor=typeColors[p.type]||0xddbb66;

    // Tip bazlı debris/kum renkleri — yeni piramitler için özel palet
    const debrisColMap={
        pyramid1:[0xFF4500,0xFFD700,0xFF6000,0xFFAA00],
        pyramid2:[0xDAA520,0x8B6914,0xC8960C,0xFFD700],
        pyramid3:[0xFF00FF,0x00FFFF,0xFFD700,0x8B00FF],
        pyramid4:[0x9400D3,0x4B0082,0x6A0DAD,0xCC44FF],
    };
    const sandCols=debrisColMap[p.type]||[0xddaa55,0xcc9944,0xeecc77,0xbbaa66];

    // ── AAA ÖLÜM VFX — büyük/elite düşmanlar için ekstra efekt ──
    if(!p.isBoss&&p.type!=="minion"&&!p._groundKill&&(p.elite||p.titan||p.colossus||p.elder||p.obsidian||p.glacier||p.inferno)){
        vfxEnemyDeath(S,px,py,p.type,p.scaleX||1);
    }

    // ── EXPLODE ANİMASYONU ──
    // _groundKill=true ise zemin çarpması zaten playerCollisionExplosion yaptı — tekrar yapma
    if(!p.isBoss&&p.type!=="minion"&&!p._groundKill){
        try{
            if(!S.anims.exists("anim_explode")){
                S.anims.create({key:"anim_explode",frames:S.anims.generateFrameNumbers("pyramid_explode",{start:0,end:4}),frameRate:14,repeat:0});
            }
            if(S.textures.exists("pyramid_explode")){
                const isNewP=p.inferno||p.glacier||p.phantom_tri||p.volt||p.obsidian;
                const ex=S.add.sprite(px,py,"pyramid_explode",0).setDepth(22);
                // Yeni piramitler setDisplaySize kullandığından scaleX güvenilmez
                // Patlama: pyramid görsel boyutunun ~1.3 katı = 78*1.3≈100px
                if(isNewP){ ex.setDisplaySize(100,82); }
                else       { ex.setScale(p.scaleX*1.15); }
                ex.setTint(deathColor);
                ex.play("anim_explode");
                ex.once("animationcomplete",()=>{try{ex.destroy();}catch(e){}});
            }
            // [FREEZE FIX] Ölüm partikülleri azaltıldı: elite:14→8, titan:18→10, normal:8→5
            const particleCount=p.elite?8:p.titan||p.colossus||p.obsidian?10:5;
            // pyramid3 için gökkuşağı debris paleti
            const rainbowDebris=[0xFF00FF,0x00FFFF,0xFFD700,0x8B00FF,0xFF8C00,0x00FF88];
            for(let i=0;i<particleCount;i++){
                const ang=Phaser.Math.DegToRad(i*(360/particleCount)+Phaser.Math.Between(-15,15));
                const spd=Phaser.Math.Between(40,110)*(p.elite?1.4:1);
                const sz=Phaser.Math.Between(2,p.elite?7:4);
                // Yeni piramitler için tip bazlı debris rengi
                let col;
                if(p.volt) col=i%2===0?0xffee00:0xffffff;
                else if(p.inferno) col=i%2===0?0xff3300:0xff8800;
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

            p.setAlpha(0);
            p.disableBody(true,true);
            if(p._shadowGfx){try{p._shadowGfx.destroy();}catch(e){}p._shadowGfx=null;}
        }catch(e){p.disableBody(true,true);}
    } else {
        // Boss ölümü — EPİK SLOW-MO WOW MOMENT
        if(p.isBoss){
            // Slow-motion patlaması — try/finally ile timeScale her zaman sıfırlanır
            S.time.timeScale=0.18;
            const resetTimeScale=()=>{ try{ if(S&&S.time) S.time.timeScale=1.0; }catch(e){} };
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
                showHitTxt(S,px,py-40,"👑 BOSS ÖLDÜ!","#ffcc00",true);
            });
        }
        p.disableBody(true,true);
        if(p._shadowGfx){try{p._shadowGfx.destroy();}catch(e){}p._shadowGfx=null;}
    }

    if(p.split&&giveXP){for(let i=0;i<2;i++){const sp2=S.pyramids.get(px+Phaser.Math.Between(-20,20),py-5,"pyramid");if(sp2){sp2.setActive(true).setVisible(true);resetEF(sp2);sp2.type="minion";sp2.hp=1;sp2.maxHP=1;sp2.setScale(0.55).setVelocityY(GS.pyramidSpeed*0.65);sp2.spawnProtected=false;sp2.setTint(0xffcc44);sp2.body.setSize(20,20).setOffset(5,5);}}}
    if(p.splitter&&giveXP){for(let i=0;i<3;i++){const ss=S.pyramids.get(px+Phaser.Math.Between(-22,22),py-5,"pyramid");if(ss){ss.setActive(true).setVisible(true);resetEF(ss);ss.type="minion";ss.hp=1;ss.maxHP=1;ss.setScale(0.48).setVelocityY(GS.pyramidSpeed*0.72);ss.spawnProtected=false;ss.setTint(0xff4422);ss.body.setSize(18,18).setOffset(5,5);}}}

    // [BALANCE] Sandık sadece güçlü düşmanlardan düşer — normal düşmandan kaldırıldı
    const isEl=p.elite, isBO=p.isBoss;
    const isStrong=isBO||isEl||p.elder||p.titan||p.colossus||p.armored||p._isMiniBoss||p.obsidian;
    // [BALANCE] Late game'de sandık drop azalır (level arttıkça)
    const lateScale=Math.max(0.4, 1.0-(gs.level*0.025));
    const dc=(isBO?1.0:p._isMiniBoss?0.80:isEl?0.18:p.elder?0.12:p.titan||p.colossus?0.09:p.obsidian?0.08:p.glacier?0.06:p.inferno||p.volt?0.05:p.armored?0.05:0)*lateScale;
    if(isStrong&&Math.random()<dc) spawnChest(S,px,py-10);

    if(p.isBoss){gs.bossActive=false; gs._bossKills=(gs._bossKills||0)+1;
        updateQuestProgress("boss",1);
        // Kristal ödülü — boss öldürmek kristal kazandırır
        addCrystal(CRYSTAL_SOURCES.boss_kill,"boss_kill");
        if(GS) showHitTxt(S,180,280,"💎 +1 KRİSTAL!","#cc44ff",true);
        for(let i=0;i<8;i++)S.time.delayedCall(i*80,()=>{spawnXpOrb(S,px+Phaser.Math.Between(-30,30),py+Phaser.Math.Between(-20,20),"xp_red",Math.round(12+gs.level*1.8));});
    }
    if(!giveXP) return;
    gs.kills++;
    updateQuestProgress("kills",1);

    // Necro mode — her 5. öldürmede düşman yeniden doğar
    if(gs._necroMode && !p.isBoss && !p._isMiniBoss){
        gs._necroKillCount=(gs._necroKillCount||0)+1;
        if(gs._necroKillCount>=5){
            gs._necroKillCount=0;
            S.time.delayedCall(1200,()=>{
                if(!GS||GS.gameOver) return;
                const rev=S.pyramids.get(px+Phaser.Math.Between(-20,20),py-30,"pyramid");
                if(rev){rev.setActive(true).setVisible(true);resetEF(rev);rev.type="normal";rev.hp=2;rev.maxHP=2;
                rev.setScale(0.8).setVelocityY(GS.pyramidSpeed*0.9);rev.spawnProtected=false;
                rev.body.setSize(22,22).setOffset(5,5);rev.setTint(0x884488);}
            });
        }
    }

    // [VFX WOW] Elite/Titan/Colossus öldürme — özel bildirim
    if(p.elite&&!p.isBoss){
        showHitTxt(S,px,py-22,"★ ELİT ÖLDÜRÜLDÜ ★","#ffdd00",true);
        S.cameras.main.shake(45,0.007);
        // Altın yıldız patlaması
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
        showHitTxt(S,px,py-22,"💀 DEV YIKILDI!","#aa44ff",true);
        S.cameras.main.shake(60,0.008);
        
    }

    // ★ YENİ: Phantom Step relic — her 5 öldürmede 1s yenilmezlik
    if(gs.activeRelics&&gs.activeRelics.includes("phantom_step")){
        gs._phantomKillCount=(gs._phantomKillCount||0)+1;
        if(gs._phantomKillCount>=5){gs._phantomKillCount=0;gs.invincible=true;gs._invT=0;S.time.delayedCall(1000,()=>{gs.invincible=false;});}
    }
    // ★ YENİ: Elite Hunt bonusu
    if((p.elite||p.isBoss)&&gs._eliteHuntCount>0){
        gs._eliteHuntCount--;
        showHitTxt(S,px,py-20,"ELİT AV BONUS!","#ffdd44",true);
        const gvBonus=Math.round((p.isBoss?6:p.elite?3:1)*gs.goldMult*2);
        gs.gold+=gvBonus; PLAYER_GOLD+=gvBonus;
    }
    // ★ Mini boss öldürüldüyse görev sayaç
    if(p._isMiniBoss) updateQuestProgress("boss",1);
    // Skor — kill başına
    const killScore=p.isBoss?2000:p.elite?300:p.elder||p.titan||p.colossus?200:p.obsidian?180:p.glacier?110:p.inferno?100:p.volt?90:p.phantom_tri?85:p.tank||p.armored?80:50;
    // Soul harvest: her kill +1 can
    if(GS&&GS._soulHarvest>0){GS._soulHarvest--;GS.health=Math.min(GS.health+1,GS.maxHealth);}
    gs.score+=Math.round(killScore*(1+gs.combo*0.05));
    // ★ GAME FEEL: Milestone kill splash (25, 50, 100, 200...)
    const milestoneKills=[25,50,100,200,500,1000];
    if(milestoneKills.includes(gs.kills)){
        const col = gs.kills>=200?"#ffcc00":gs.kills>=100?"#ff8800":"#44ff88";
        showHitTxt(S, 180, 240, "☠ "+gs.kills+"!", col, true);
        S.cameras.main.shake(60, 0.010);
    }
    // [BALANCE] XP drop ihtimale bağlandı — her düşmandan düşmüyor
    // Boss/elite/güçlü düşman: her zaman XP; normal: %65 şans
    // [BALANCE] XP drop ihtimali — biraz daha az
    const xpDropChance = p.isBoss||p.elite||p.elder||p.titan||p.colossus ? 1.0 :
                         p.obsidian ? 1.0 : p.glacier ? 0.90 : p.inferno ? 0.85 :
                         p.tank||p.armored ? 0.80 : p.volt||p.phantom_tri ? 0.75 : 0.60;
    if(Math.random()<xpDropChance){
        const baseXP=p.swarm?0.5:p.type==="minion"?0.5:p.isBoss?15+gs.level*2:p.titan||p.colossus?10+gs.level:p.elite||p.elder?6+gs.level:p.obsidian?5+gs.level*0.8:p.glacier?3.5+gs.level*0.6:p.inferno||p.volt?3+gs.level*0.5:p.phantom_tri?2.5+gs.level*0.4:p.tank||p.armored||p.absorber?3+gs.level*0.5:1.5;
        const xpVal=Math.round(baseXP*gs.xpMult*gs.comboXpBoost*(gs._xpBoostTimer>0?1.5:1));
        let xpT;
        if(p.isBoss||p.titan||p.colossus) xpT="xp_gold";
        else if(p.elite||p.elder)          xpT="xp_red";
        else if(xpVal>=12)                 xpT="xp_gold";
        else if(xpVal>=8)                  xpT="xp_red";
        else if(xpVal>=5)                  xpT="xp_purple";
        else if(xpVal>=3)                  xpT="xp_green";
        else                               xpT="xp_blue";
        const orbCount=p.isBoss?8:p.elite||p.elder?3:p.tank?2:1;
        const perOrb=Math.ceil(xpVal/Math.max(1,orbCount));
        const isBossXP=!!p.isBoss;
        for(let i=0;i<orbCount;i++){
            const _x=px+Phaser.Math.Between(-18,18);
            const _y=Math.min(py,430)+Phaser.Math.Between(-14,14);
            S.time.delayedCall(i*(isBossXP?80:0),()=>spawnXpOrb(S,_x,_y,xpT,perOrb));
        }
    }

    // [BALANCE] Health drop — nadir, gerçek gravity ile yere düşer
    const healDropChance = p.isBoss?0:p.elite?0.05:p.obsidian?0.04:p.tank||p.armored?0.04:p.glacier||p.inferno?0.03:p.swarm||p.type==="minion"?0:0.02;
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
                try{hDrop.destroy();}catch(e){}
                try{hGlow.destroy();}catch(e){}
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
                S.tweens.add({targets:hDrop,scaleX:2.5,scaleY:2.5,alpha:0,duration:180,ease:"Back.easeIn",onComplete:()=>{try{hDrop.destroy();}catch(e){}}});
                try{hGlow.destroy();}catch(e){}
                return;
            }
            if(hLife<1200){const fa=hLife/1200;hDrop.setAlpha(fa);hGlow.setAlpha(fa);}
        }});
    }

    const gV=Math.max(1,Math.round((p.isBoss?6:p.elite?3:p.elder||p.titan||p.colossus?2:p.obsidian?2:p.glacier||p.inferno?1.5:1)*gs.goldMult));
    gs.gold+=gV; PLAYER_GOLD+=gV;
    // [PERF] localStorage her kill'de değil, sadece oyun sonunda kaydedilir (donma önleme)
    updateQuestProgress("goldcol",gV);
    if(gV>0){const c=S.add.image(px+Phaser.Math.Between(-15,15),py-5,"xp_coin").setDepth(18);S.tweens.add({targets:c,y:c.y-18,alpha:0,duration:520,onComplete:()=>c.destroy()});}
    spawnHitDebris(S,px,py-10,p.type,false);
    // Fiziksel debris — parçalar zemine düşer
    spawnFallingDebris(S,px,py,p.type,p.isBoss||p.titan||p.colossus);
    // [OPT] GS evolution flag'leri kullan — EVOLUTIONS.find'dan kaçın
    if(gs._evoCryoField&&!p.frozen){
        const _cryoList=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
        for(let _ci=0;_ci<_cryoList.length;_ci++){
            const e=_cryoList[_ci];if(e===p||!e||!e.active)continue;
            const dx=e.x-px,dy=e.y-py;if(dx*dx+dy*dy<80*80)freezeEnemy(S,e);
        }
    }
    if(gs._evoPlagueBearer&&p.toxic) spawnPoisonCloud(S,px,py);
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
    // ★ GAME FEEL: Forgiving grace window
    if(graceCheck(S)) return;
    // ★ GAME FEEL: Double damage event — 2x hasar alır
    if(gs._doubleDmgTaken && Math.random()<0.5){
        // %50 şansla ek hasar al — riskli his
        gs.invincible=true; gs._invT=0;
        gs.health = Math.max(1, gs.health-1);
        S.cameras.main.shake(50,0.010);
        tickNearDeath(S);
        if(gs.health<=0 && !(gs.extraLife&&!gs.usedExtraLife)){
            gameOver(S); return;
        }
        gs.invincible=false;
    }
    // ★ YENİ: Combo Shield relic — 5+ komboda hasar alma
    if(gs.activeRelics&&gs.activeRelics.includes("combo_shield")&&gs.combo>=5){
        showHitTxt(S,180,280,"🛡 KOMBO KALKANI","#44aaff",false);
        return;
    }
    // ★ YENİ: Fury Mode'da hasar alma (can iyileşmez ama hasar azaltılmaz)
    gs.invincible=true;gs._invT=0;gs._knockbackTimer=350;
    gs.health--;
    S.cameras.main.shake(14,0.003);
    // ── AAA PLAYER HURT VFX ──
    vfxPlayerHurt(S);
    tickNearDeath(S);
    if(gs.health<=0){
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
    const gs=GS;
    if(gs.gameOver) return;
    // Oyunu dondur (game over değil)
    S.physics.pause();
    if(S.spawnEvent) S.spawnEvent.paused=true;
    const W=360, H=640;

    const ov=S.add.rectangle(W/2,H/2,W,H,0x000000,0.85).setDepth(900);
    const pg=S.add.graphics().setDepth(901);
    const PW=290, PH=220, PX=(W-PW)/2, PY=(H-PH)/2-20;
    pg.fillStyle(0x0a0018,0.98); pg.fillRoundedRect(PX,PY,PW,PH,12);
    pg.lineStyle(2.5,0xcc44ff,0.9); pg.strokeRoundedRect(PX,PY,PW,PH,12);
    pg.fillStyle(0xcc44ff,0.12); pg.fillRoundedRect(PX,PY,PW,5,{tl:12,tr:12,bl:0,br:0});

    const ico=S.add.text(W/2,PY+36,"💎",{font:"28px 'Courier New'"}).setOrigin(0.5).setDepth(902);
    S.add.text(W/2,PY+68,L("goRevivePrompt"),{
        font:"bold 13px 'Courier New'",color:"#cc66ff",stroke:"#000",strokeThickness:4,letterSpacing:2
    }).setOrigin(0.5).setDepth(902);
    S.add.text(W/2,PY+90,"3 💎 kristal harcanacak",{
        font:"bold 9px 'Courier New'",color:"#9955cc",stroke:"#000",strokeThickness:2
    }).setOrigin(0.5).setDepth(902);
    S.add.text(W/2,PY+106,L("goReviveCrystalCost")+" "+PLAYER_CRYSTAL+" 💎",{
        font:"bold 10px 'Courier New'",color:"#cc99ff",stroke:"#000",strokeThickness:2
    }).setOrigin(0.5).setDepth(902);

    // Geri sayım — 8 saniye
    let timeLeft=8;
    const cdTxt=S.add.text(W/2,PY+126,"("+timeLeft+"s)",{
        font:"bold 11px 'Courier New'",color:"#888888",stroke:"#000",strokeThickness:2
    }).setOrigin(0.5).setDepth(902);
    const cdEv=S.time.addEvent({delay:1000,repeat:7,callback:()=>{
        timeLeft--;
        if(cdTxt.active) cdTxt.setText("("+timeLeft+"s)");
        if(timeLeft<=0){
            cleanup();
            gs._crystalReviveUsed=true;
            gameOver(S);
        }
    }});

    const cleanup=()=>{
        try{ov.destroy();pg.destroy();ico.destroy();}catch(e){}
        S.children.list.filter(o=>o&&o._reviveUI).forEach(o=>{try{o.destroy();}catch(e){}});
        cdEv.remove();
    };

    // Evet butonu
    const yBg=S.add.graphics().setDepth(902)._reviveUI=true;
    const drawY=(h)=>{
        if(!yBg||!yBg.active) return;
        yBg.clear();
        yBg.fillStyle(h?0xcc44ff:0x220033,1);
        yBg.fillRoundedRect(PX+16,PY+148,PW-32,36,8);
        yBg.lineStyle(2,0xcc44ff,0.9); yBg.strokeRoundedRect(PX+16,PY+148,PW-32,36,8);
    };
    drawY(false);
    const yTxt=S.add.text(W/2,PY+166,L("goReviveBtn"),{
        font:"bold 12px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:3
    }).setOrigin(0.5).setDepth(903);
    const yHit=S.add.rectangle(W/2,PY+166,PW-32,36,0xffffff,0.001).setInteractive().setDepth(904);
    yHit.on("pointerover",()=>drawY(true));
    yHit.on("pointerout",()=>drawY(false));
    yHit.on("pointerdown",()=>{
        if(!spendCrystal(CRYSTAL_COSTS.revive)){ gameOver(S); return; }
        gs._crystalReviveUsed=true;
        gs.health=Math.ceil(gs.maxHealth*0.5);
        gs._healFlash=1000;
        gs.invincible=true; gs._invT=0;
        cleanup();
        S.physics.resume();
        if(S.spawnEvent) S.spawnEvent.paused=false;
        /* flash removed */
        S.cameras.main.shake(150,0.018);
        showHitTxt(S,180,240,L("crystalRevived"),"#cc44ff",true);
        if(S._crystalHudText) S._crystalHudText.setText("💎 "+PLAYER_CRYSTAL);
        S.time.delayedCall(1000,()=>{ if(GS){ GS.invincible=false; GS._invT=0; }});
    });

    // Hayır butonu
    const nBg=S.add.graphics().setDepth(902);
    const drawN=(h)=>{ nBg.clear(); nBg.fillStyle(h?0x333344:0x111118,1);
        nBg.fillRoundedRect(PX+60,PY+194,PW-120,28,6);
        nBg.lineStyle(1,h?0x666688:0x333344,0.8); nBg.strokeRoundedRect(PX+60,PY+194,PW-120,28,6);};
    drawN(false);
    S.add.text(W/2,PY+208,"Hayır, bitir",{font:"bold 9px 'Courier New'",color:"#555566",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(903);
    const nHit=S.add.rectangle(W/2,PY+208,PW-120,28,0xffffff,0.001).setInteractive().setDepth(904);
    nHit.on("pointerover",()=>drawN(true)); nHit.on("pointerout",()=>drawN(false));
    nHit.on("pointerdown",()=>{ cleanup(); gs._crystalReviveUsed=true; gameOver(S); });

    // Pulse animasyon
    S.tweens.add({targets:ico,scaleX:1.2,scaleY:1.2,duration:600,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
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
        this.items.forEach(o=>{
            if(!o) return;
            try{
                // [UI FIX] İnteraktif nesnelerin input'unu kapatmadan önce devre dışı bırak
                if(typeof o.disableInteractive === "function") o.disableInteractive();
                if(o.scene && this.scene?.tweens){
                    this.scene.tweens.killTweensOf(o);
                }
                if(typeof o.destroy === "function") o.destroy();
            }catch(e){}
        });
        this.items = [];
    }
    fadeAndDestroy(duration=130){
        this.items.forEach(o=>{
            if(!o) return;
            try{
                // [UI FIX] Fade başlamadan interaktifliği kapat — tıklama geçirme sorunu önlenir
                if(typeof o.disableInteractive === "function") o.disableInteractive();
                if(o.scene && typeof o.setAlpha === "function"){
                    this.scene.tweens.killTweensOf(o);
                    this.scene.tweens.add({
                        targets: o, alpha: 0, duration,
                        onComplete: ()=>{ try{ o.destroy(); }catch(e){} }
                    });
                } else if(typeof o.destroy === "function"){
                    o.destroy();
                }
            }catch(e){}
        });
        this.items = [];
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
        font:"bold 30px 'Courier New'",
        color: Phaser.Display.Color.IntegerToColor(syn.color).rgba,
        stroke:"#000000", strokeThickness:8, letterSpacing:4
    }).setOrigin(0.5).setDepth(702).setAlpha(0).setScale(0.2);
    S.tweens.add({ targets:bigTitle, alpha:1, scaleX:1.05, scaleY:1.05,
        duration:200, ease:"Back.easeOut" });
    S.tweens.add({ targets:bigTitle, alpha:0, scaleX:1.4, scaleY:1.4,
        duration:300, ease:"Quad.easeIn", delay:1100,
        onComplete:()=> { try{ bigTitle.destroy(); }catch(e){} } });

    // [VFX] 6. Sinerji adı — başlığın altında
    const synLabel = S.add.text(W/2, H/2+12, syn.icon+" "+label, {
        font:"bold 15px 'Courier New'", color:"#ffffff",
        stroke:"#000", strokeThickness:5, letterSpacing:2
    }).setOrigin(0.5).setDepth(702).setAlpha(0);
    S.tweens.add({ targets:synLabel, alpha:1, y:H/2+8, duration:240,
        ease:"Back.easeOut", delay:100 });
    S.time.delayedCall(1300, ()=>{
        S.tweens.add({ targets:synLabel, alpha:0, y:H/2-10, duration:220,
            onComplete:()=>{ try{ synLabel.destroy(); }catch(e){} } });
    });

    // [VFX] 7. Alt panel — açıklama, sağdan kayar
    const panel = S.add.graphics().setDepth(700);
    panel.fillStyle(0x060010, 0.88); panel.fillRoundedRect(36, 66, 288, 56, 6);
    panel.fillStyle(syn.color, 0.85); panel.fillRoundedRect(36, 66, 3, 56, {tl:6,tr:0,bl:6,br:0});
    panel.lineStyle(1.5, syn.color, 0.75); panel.strokeRoundedRect(36, 66, 288, 56, 6);
    panel.fillStyle(syn.color, 0.10); panel.fillRoundedRect(36, 66, 288, 18, {tl:6,tr:6,bl:0,br:0});

    const descTxt = S.add.text(182, 87, desc, {
        font:"bold 9px 'Courier New'",
        color: Phaser.Display.Color.IntegerToColor(syn.color).rgba,
        stroke:"#000", strokeThickness:2, wordWrap:{width:270}, align:"center"
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
                try{ panel.destroy(); descTxt.destroy(); }catch(e){}
            }});
    });
}

// ── MINI BOSS SİSTEMİ ────────────────────────────────────────
function spawnMiniBoss(S){
    const gs=GS;
    if(gs.miniBossActive||gs.level<4) return; // level 4'ten önce çıkma
    const def=MINI_BOSS_POOL[Phaser.Math.Between(0,MINI_BOSS_POOL.length-1)];
    const useTex="pyramid"; // mevcut texture
    const p=S.pyramids.get(180,-90,useTex);
    if(!p) return;
    p.setActive(true).setVisible(true);
    resetEF(p);

    // Mini boss özellikleri
    p.hp=p.maxHP=Math.round(def.hp+gs.level*4);
    p.armor=def.armor;
    p.type="miniboss";
    p._isMiniBoss=true;
    p.isBoss=false; // mevcut boss sistemiyle çakışmasın
    p.setScale(def.scale).setTint(def.tint).setAlpha(0);
    p.setVelocityY(gs.pyramidSpeed*def.speed);
    p.spawnProtected=true;
    gs.miniBossActive=true;

    // Fade-in + duyuru
    S.tweens.add({targets:p,alpha:1,duration:600,ease:"Quad.easeOut"});
    S.time.delayedCall(700,()=>{if(p.active) p.spawnProtected=false;});

    // Mini boss uyarı banner
    showMiniBossBanner(S, def);

    // Ölüm callback — reward ver
    p._miniBossDef=def;
}

function showMiniBossBanner(S, def){
    const name=LLang(def,"name","nameEN","nameRU");
    const W=360, H=640;

    // [VFX] Mini Boss spawn — hafifletilmiş
    S.cameras.main.shake(120, 0.012);
    S.cameras.main.zoomTo(1.04, 160, "Quad.easeOut");
    S.time.delayedCall(160, ()=> S.cameras.main.zoomTo(1.0, 300, "Quad.easeIn"));

    // 2. Kısa slow-motion — daha hızlı dönüş
    S.time.timeScale = 0.4;
    S.time.delayedCall(400, ()=>{ S.time.timeScale = 1.0; });

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
        font:"bold 10px 'Courier New'", color:"#ff6655",
        stroke:"#000", strokeThickness:3, letterSpacing:4
    }).setOrigin(0.5, 0).setDepth(601).setAlpha(0);

    const nameTxt = S.add.text(W/2, 290, name.toUpperCase(), {
        font:"bold 20px 'Courier New'",
        color: Phaser.Display.Color.IntegerToColor(def.color).rgba,
        stroke:"#000000", strokeThickness:6, letterSpacing:5
    }).setOrigin(0.5, 0).setDepth(601).setAlpha(0);

    // Scale-in + fade-in animasyonu
    bg.setScale(0.7); bg.setAlpha(0);
    S.tweens.add({ targets:bg, scaleX:1, scaleY:1, alpha:1, duration:220, ease:"Back.easeOut" });
    S.time.delayedCall(80, ()=>{
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

    S.time.delayedCall(3200, ()=>{
        S.tweens.add({ targets:[bg, warnTxt, nameTxt], alpha:0, y:"+=12", duration:280,
            onComplete:()=>{
                try{ bg.destroy(); warnTxt.destroy(); nameTxt.destroy(); }catch(e){}
            }});
    });
}

function handleMiniBossDeath(S, p){
    if(!p._isMiniBoss||!p._miniBossDef) return;
    const gs=GS;
    gs.miniBossActive=false;
    const def=p._miniBossDef;

    // Ödüller
    if(def.reward.chest==="legendary"){
        spawnChest(S,p.x,p.y-10);
        spawnChest(S,p.x+30,p.y-10);
    } else {
        spawnChest(S,p.x,p.y-10);
    }

    // XP patlaması
    for(let i=0;i<12;i++){
        S.time.delayedCall(i*60,()=>{
            spawnXpOrb(S,p.x+Phaser.Math.Between(-40,40),p.y+Phaser.Math.Between(-20,20),
                "xp_gold", Math.round((8+gs.level*2)*def.reward.xpMult));
        });
    }

    // ★ YENİ: Relic düşürme şansı
    if(Math.random()<0.5) showRelicOffer(S, p.x, p.y);

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
    if(gs.pickingUpgrade||gs.gameOver) return;
    gs._eventCooldown=45000; // 45sn cooldown
    S.time.delayedCall(45000,()=>{if(gs._eventCooldown>0)gs._eventCooldown=0;});

    // Rastgele event seç
    const ev=RUN_EVENTS[Phaser.Math.Between(0,RUN_EVENTS.length-1)];
    showRunEventUI(S, ev);
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
    const PANEL_H_BASE=ev.choices.length===3?380:340;
    const PANEL_W=310, PANEL_H=PANEL_H_BASE;
    const PANEL_X=(W-PANEL_W)/2, PANEL_Y=(H-PANEL_H)/2-20;
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
        font:"24px 'Courier New'"
    }).setOrigin(0.5).setDepth(803).setAlpha(0));
    // İkon pulse
    S.tweens.add({targets:iconTxt,scaleX:1.15,scaleY:1.15,duration:600,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

    // Başlık
    const title=LLang(ev,"title","titleEN","titleRU");
    const titleTxt=ui.add(S.add.text(W/2,PANEL_Y+74,title,{
        font:"bold 15px 'Courier New'",
        color:Phaser.Display.Color.IntegerToColor(ev.color).rgba,
        stroke:"#000000",strokeThickness:4,
        letterSpacing:3
    }).setOrigin(0.5,0).setDepth(803).setAlpha(0));

    // Ayraç çizgisi
    const divG=ui.add(S.add.graphics().setDepth(802));
    divG.lineStyle(1,ev.color,0.3); divG.lineBetween(PANEL_X+20,PANEL_Y+96,PANEL_X+PANEL_W-20,PANEL_Y+96);

    // Açıklama
    const desc=LLang(ev,"desc","descEN","descRU");
    const descTxt=ui.add(S.add.text(W/2,PANEL_Y+104,desc,{
        font:"bold 10px 'Courier New'",color:"#ccccdd",
        stroke:"#000",strokeThickness:2,
        wordWrap:{width:PANEL_W-40},align:"center",lineSpacing:5
    }).setOrigin(0.5,0).setDepth(803).setAlpha(0));

    // Butonlar — 2 veya 3 seçenek destekli
    const choiceCount=ev.choices.length;
    const BTN_BASE_Y=choiceCount===3?PANEL_Y+PANEL_H-130:PANEL_Y+PANEL_H-94;
    ev.choices.forEach((ch,i)=>{
        const isAccept=i===0;
        const is3=choiceCount===3;
        const BTN_W=is3?220:(isAccept?240:160);
        const BTN_X=W/2-BTN_W/2;
        const BTN_Y=BTN_BASE_Y + i*44;
        const BTN_H=is3?36:(isAccept?42:34);
        const col=i===0?ev.color:i===1?0x4488ff:0x555566;

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
            font:"bold 11px 'Courier New'",
            color:isAccept?"#ffffff":"#888888",
            stroke:"#000",strokeThickness:3
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

    // Diğer elementler fade-in
    S.time.delayedCall(120,()=>{
        S.tweens.add({targets:[iconTxt,titleTxt,descTxt],alpha:1,duration:200,ease:"Quad.easeOut"});
    });

    

    // 20sn otomatik kapan
    S.time.delayedCall(20000,()=>{
        if(gs.pickingUpgrade&&!gs.gameOver){
            ui.fadeAndDestroy(200);
            S.time.delayedCall(220,()=>{ S.time.timeScale=1.0; unlockUpgrade(gs,S); });
        }
    });
}

// ── RELİK SİSTEMİ ────────────────────────────────────────────
// [UI REDESIGN] showRelicOffer — profesyonel kart tasarımı, animasyonlu giriş
function showRelicOffer(S, x, y){
    const gs=GS;
    if(gs.activeRelics&&gs.activeRelics.length>=3) return;
    const owned=gs.activeRelics||[];
    const available=RELICS.filter(r=>!owned.includes(r.id));
    if(!available.length) return;
    if(gs.pickingUpgrade || _upgradeLock > 0) return;
    lockUpgrade(gs, S);
    const shuffled=Phaser.Utils.Array.Shuffle([...available]);
    const picks=shuffled.slice(0,Math.min(2,shuffled.length));
    const W=360,H=640;
    const ui=new UIGroup(S);

    // Dark overlay
    const ov=ui.add(S.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(800));
    S.tweens.add({targets:ov,fillAlpha:0.88,duration:250});

    const PANEL_W=312, PANEL_H=picks.length*148+84;
    const PANEL_X=(W-PANEL_W)/2;
    const PANEL_Y=Math.max(12,(H-PANEL_H)/2-10);

    const pg=ui.add(S.add.graphics().setDepth(801));
    pg.fillStyle(0x060010,0.98); pg.fillRoundedRect(PANEL_X,PANEL_Y,PANEL_W,PANEL_H,10);
    pg.fillStyle(0xffcc00,0.12); pg.fillRoundedRect(PANEL_X,PANEL_Y,PANEL_W,50,{tl:10,tr:10,bl:0,br:0});
    pg.lineStyle(2,0xffcc00,0.85); pg.strokeRoundedRect(PANEL_X,PANEL_Y,PANEL_W,PANEL_H,10);
    pg.lineStyle(1,0xffcc00,0.2); pg.strokeRoundedRect(PANEL_X+3,PANEL_Y+3,PANEL_W-6,PANEL_H-6,8);

    const hdrIco=ui.add(S.add.graphics().setDepth(802));
    hdrIco.fillStyle(0xffcc00,0.2); hdrIco.fillCircle(W/2-60,PANEL_Y+28,18);
    hdrIco.lineStyle(1.5,0xffcc00,0.6); hdrIco.strokeCircle(W/2-60,PANEL_Y+28,18);
    ui.add(S.add.text(W/2-60,PANEL_Y+28,"✦",{font:"16px 'Courier New'",color:"#ffcc00"}).setOrigin(0.5).setDepth(803));
    ui.add(S.add.text(W/2-38,PANEL_Y+20,L("relicTitle"),{
        font:"bold 13px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:4,letterSpacing:3
    }).setOrigin(0,0).setDepth(803));
    ui.add(S.add.text(W/2-38,PANEL_Y+36,L("relicSubtitle"),{
        font:"bold 7px 'Courier New'",color:"#777788",stroke:"#000",strokeThickness:2
    }).setOrigin(0,0).setDepth(803));

    const divG2=ui.add(S.add.graphics().setDepth(802));
    divG2.lineStyle(1,0xffcc00,0.25); divG2.lineBetween(PANEL_X+12,PANEL_Y+52,PANEL_X+PANEL_W-12,PANEL_Y+52);

    picks.forEach((relic,i)=>{
        const ry=PANEL_Y+58+i*148;
        const CARD_W=PANEL_W-16, CARD_H=136;
        const CX=PANEL_X+8;
        const rarityCol=relic.rarity==="legendary"?0xffcc00:relic.rarity==="epic"?0xff8800:0xaa44ff;
        const rarityLabel=relic.rarity==="legendary"?"EFSANE":relic.rarity==="epic"?"EPİK":"NADİR";

        const cardG=ui.add(S.add.graphics().setDepth(802));
        const drawCard=hov=>{
            cardG.clear();
            cardG.fillStyle(0x0a0818,0.97); cardG.fillRoundedRect(CX,ry,CARD_W,CARD_H,7);
            cardG.fillStyle(rarityCol,hov?0.14:0.06); cardG.fillRoundedRect(CX,ry,CARD_W,CARD_H,7);
            cardG.fillStyle(rarityCol,hov?1.0:0.65); cardG.fillRoundedRect(CX,ry,4,CARD_H,{tl:7,tr:0,bl:7,br:0});
            cardG.lineStyle(hov?2:1,rarityCol,hov?0.9:0.5); cardG.strokeRoundedRect(CX,ry,CARD_W,CARD_H,7);
            if(hov){cardG.fillStyle(0xffffff,0.04);cardG.fillRoundedRect(CX+4,ry+2,CARD_W-8,CARD_H/3,5);}
        };
        drawCard(false);

        const icG=ui.add(S.add.graphics().setDepth(803));
        icG.fillStyle(rarityCol,0.18); icG.fillCircle(CX+38,ry+CARD_H/2,28);
        icG.lineStyle(2,rarityCol,0.55); icG.strokeCircle(CX+38,ry+CARD_H/2,28);
        icG.lineStyle(1,rarityCol,0.18); icG.strokeCircle(CX+38,ry+CARD_H/2,34);
        ui.add(S.add.text(CX+38,ry+CARD_H/2,relic.icon,{font:"22px 'Courier New'"}).setOrigin(0.5).setDepth(804));

        const badgeG=ui.add(S.add.graphics().setDepth(803));
        badgeG.fillStyle(rarityCol,0.25); badgeG.fillRoundedRect(CX+76,ry+10,54,14,3);
        badgeG.lineStyle(1,rarityCol,0.6); badgeG.strokeRoundedRect(CX+76,ry+10,54,14,3);
        ui.add(S.add.text(CX+103,ry+17,rarityLabel,{
            font:"bold 7px 'Courier New'",
            color:Phaser.Display.Color.IntegerToColor(rarityCol).rgba,stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(804));

        const rName=LLang(relic,"name","nameEN","nameRU");
        ui.add(S.add.text(CX+76,ry+28,rName,{
            font:"bold 12px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:3
        }).setDepth(804));

        const rDesc=LLang(relic,"desc","descEN","descRU");
        ui.add(S.add.text(CX+76,ry+46,rDesc,{
            font:"bold 9px 'Courier New'",color:"#aaaacc",stroke:"#000",strokeThickness:2,
            wordWrap:{width:CARD_W-90},lineSpacing:3
        }).setDepth(804));

        const BTN_Y2=ry+CARD_H-30;
        const btnG2=ui.add(S.add.graphics().setDepth(803));
        const drawBtn2=hov=>{
            btnG2.clear();
            btnG2.fillStyle(hov?rarityCol:0x110820,1);
            btnG2.fillRoundedRect(CX+CARD_W-96,BTN_Y2,86,22,5);
            btnG2.fillStyle(rarityCol,hov?0.3:0.12);
            btnG2.fillRoundedRect(CX+CARD_W-96,BTN_Y2,86,22,5);
            btnG2.lineStyle(1.5,rarityCol,hov?1:0.7);
            btnG2.strokeRoundedRect(CX+CARD_W-96,BTN_Y2,86,22,5);
        };
        drawBtn2(false);
        ui.add(S.add.text(CX+CARD_W-53,BTN_Y2+11,"✦ AL",{
            font:"bold 10px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(804));

        const hit=ui.add(S.add.rectangle(CX+CARD_W/2,ry+CARD_H/2,CARD_W,CARD_H,0xffffff,0.001).setInteractive().setDepth(805));
        hit.on("pointerover",()=>{drawCard(true);drawBtn2(true);});
        hit.on("pointerout",()=>{drawCard(false);drawBtn2(false);});
        hit.on("pointerdown",()=>{
            if(!gs.activeRelics) gs.activeRelics=[];
            gs.activeRelics.push(relic.id);
            if(relic.apply) relic.apply(gs,S);

            // [VFX WOW] Relic alınma animasyonu — TATMIN EDİCİ
            const W2=360, H2=640;
            // Büyük flash
            
            S.cameras.main.shake(120, 0.018);
            S.cameras.main.zoomTo(1.05, 100, "Quad.easeOut");
            S.time.delayedCall(100, ()=> S.cameras.main.zoomTo(1.0, 250, "Quad.easeIn"));

            // Halka patlaması
            for(let ri=0;ri<3;ri++){
                S.time.delayedCall(ri*60, ()=>{
                    const rr=S.add.graphics().setDepth(810);
                    rr.x=W2/2; rr.y=H2/2;
                    rr.lineStyle(3-ri, rarityCol, 1.0); rr.strokeCircle(0,0,12+ri*10);
                    S.tweens.add({targets:rr, scaleX:14, scaleY:14, alpha:0,
                        duration:500, ease:"Quad.easeOut", onComplete:()=>rr.destroy()});
                });
            }

            // Altın yağmuru parçacıkları
            for(let ri=0;ri<20;ri++){
                S.time.delayedCall(ri*30, ()=>{
                    const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
                    const spd=Phaser.Math.Between(60,140);
                    const rp=S.add.graphics().setDepth(810);
                    rp.x=W2/2; rp.y=H2/2;
                    rp.fillStyle([rarityCol,0xffffff,0xffcc00][ri%3],0.9);
                    rp.fillRect(-2,-3,4,6);
                    S.tweens.add({targets:rp,
                        x:W2/2+Math.cos(ang)*spd, y:H2/2+Math.sin(ang)*spd*0.7,
                        alpha:0, scaleX:0.1, scaleY:0.1,
                        duration:Phaser.Math.Between(300,580), ease:"Quad.easeOut",
                        onComplete:()=>rp.destroy()});
                });
            }

            // "ALINDI!" yazısı — büyük, scale-in
            const gotTxt=S.add.text(W2/2, H2/2-30, "✦ "+rName+" ✦", {
                font:"bold 16px 'Courier New'",
                color: Phaser.Display.Color.IntegerToColor(rarityCol).rgba,
                stroke:"#000", strokeThickness:5, letterSpacing:3
            }).setOrigin(0.5).setDepth(811).setAlpha(0).setScale(0.3);
            S.tweens.add({targets:gotTxt, alpha:1, scaleX:1.1, scaleY:1.1,
                duration:200, ease:"Back.easeOut"});
            S.time.delayedCall(1200, ()=>{
                S.tweens.add({targets:gotTxt, alpha:0, scaleX:1.5, scaleY:1.5,
                    duration:250, ease:"Quad.easeIn",
                    onComplete:()=>{ try{gotTxt.destroy();}catch(e){} }});
            });

            // Relic HUD'unu güncelle
            S._relicHudBuilt = false;

            showHitTxt(S,W2/2,H2/2+30,"ARTİFAKT ALINDI!","#ffcc00",true);
            ui.fadeAndDestroy(200);
            S.time.delayedCall(220,()=>{ S.time.timeScale=1.0; unlockUpgrade(gs,S); });
        });

        cardG.setAlpha(0); icG.setAlpha(0);
        S.time.delayedCall(150+i*100,()=>{
            S.tweens.add({targets:[cardG,icG],alpha:1,duration:200,ease:"Quad.easeOut"});
        });
    });

    const skipY=PANEL_Y+PANEL_H-28;
    const skipBg=ui.add(S.add.graphics().setDepth(802));
    const drawSkip=hov=>{skipBg.clear();skipBg.fillStyle(0x080808,hov?0.95:0.75);skipBg.fillRoundedRect(W/2-46,skipY,92,22,5);skipBg.lineStyle(1,0x444455,hov?0.8:0.35);skipBg.strokeRoundedRect(W/2-46,skipY,92,22,5);};
    drawSkip(false);
    ui.add(S.add.text(W/2,skipY+11,"GEÇ →",{font:"bold 9px 'Courier New'",color:"#555566",stroke:"#000",strokeThickness:2}).setOrigin(0.5).setDepth(803));
    const skipH=ui.add(S.add.rectangle(W/2,skipY+11,92,22,0xffffff,0.001).setInteractive().setDepth(804));
    skipH.on("pointerover",()=>drawSkip(true)).on("pointerout",()=>drawSkip(false));
    skipH.on("pointerdown",()=>{
        ui.fadeAndDestroy(150);
        S.time.delayedCall(160,()=>{ S.time.timeScale=1.0; unlockUpgrade(gs,S); });
    });

    pg.y=30; pg.setAlpha(0);
    S.tweens.add({targets:pg,y:0,alpha:1,duration:280,ease:"Back.easeOut"});
    
}
function tickRelics(S){
    const gs=GS;
    if(!gs.activeRelics||gs.activeRelics.length===0) return;
    gs.activeRelics.forEach(id=>{
        const r=RELICS.find(x=>x.id===id);
        if(r&&r.tick) r.tick(gs,S);
    });
}

// ══════════════════════════════════════════════════════════════
// GÖREV SİSTEMİ v2 — 8 görev / gün, zorluk dengesi, doğru reset
// ══════════════════════════════════════════════════════════════

function generateDailyQuests(){
    const hard    = DAILY_QUESTS.filter(q=>q.difficulty==="hard");
    const vhard   = DAILY_QUESTS.filter(q=>q.difficulty==="vhard");
    const extreme = DAILY_QUESTS.filter(q=>q.difficulty==="extreme");
    const shuffle = arr=>[...arr].sort(()=>Math.random()-0.5);
    const pick=(arr,n)=>shuffle(arr).slice(0,Math.min(n,arr.length));
    return [
        ...pick(hard,   2),
        ...pick(vhard,  3),
        ...pick(extreme,3),
    ].map(q=>({...q, progress:0, done:false}));
}

function resetDailyQuests(gs){
    if(!gs) return;
    const today = new Date().toDateString();
    const quests = generateDailyQuests();
    gs.activeQuests = quests;
    localStorage.setItem("nt_quests", JSON.stringify({
        date: today,
        quests: quests.map(q=>q.id)
    }));
    localStorage.setItem("nt_quests_done", JSON.stringify({_date:today}));
}

function initDailyQuests(gs){
    if(!gs) return;
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem("nt_quests")||"{}");

    // Streak sistemi
    const savedStreak = JSON.parse(localStorage.getItem("nt_streak")||"{}");
    const yesterday   = new Date(Date.now()-86400000).toDateString();
    if(savedStreak.lastDay===yesterday){
        gs._dailyStreak = (savedStreak.count||0)+1;
    } else if(savedStreak.lastDay===today){
        gs._dailyStreak = savedStreak.count||1;
    } else {
        gs._dailyStreak = 1;
    }
    localStorage.setItem("nt_streak", JSON.stringify({lastDay:today, count:gs._dailyStreak}));

    // Yeni gün → 8 yeni görev üret
    if(saved.date!==today){
        resetDailyQuests(gs);
    } else {
        // Aynı gün → kayıtlı görevleri yükle
        const ids = saved.quests||[];
        const doneMap = JSON.parse(localStorage.getItem("nt_quests_done")||"{}");
        gs.activeQuests = ids.map(id=>DAILY_QUESTS.find(q=>q.id===id)).filter(Boolean)
            .map(q=>({...q, progress:0, done:!!doneMap[q.id]}));
        if(gs.activeQuests.length===0) resetDailyQuests(gs);
    }
}

function updateQuestProgress(type, value){
    const gs = GS;
    if(!gs||!gs.questProgress) return;
    switch(type){
        case "kills":   gs.questProgress.kills  = (gs.questProgress.kills||0)+value; break;
        case "perfect": gs.questProgress.perfect = (gs.questProgress.perfect||0)+value; break;
        case "goldcol": gs.questProgress.goldcol = (gs.questProgress.goldcol||0)+value; break;
        case "boss":    gs.questProgress.boss   = (gs.questProgress.boss||0)+value; break;
        case "combo":   gs.questProgress.combo  = Math.max(gs.questProgress.combo||0,value); break;
        case "level":   gs.questProgress.level  = Math.max(gs.questProgress.level||0,value); break;
    }
}

function tickQuestProgress(S, delta){
    const gs=GS;
    if(!gs||!gs.activeQuests||gs.activeQuests.length===0) return;
    // _questDoneCache — in-memory, localStorage'a sadece değişimde yazılır

    gs.activeQuests.forEach(q=>{
        if(q.done||_questDoneCache[q.id]) { q.done=true; return; }

        switch(q.type){
            case"kills":   q.progress=gs.questProgress.kills||0; break;
            case"combo":   q.progress=Math.max(q.progress,gs.combo||0); break;
            case"time":    q.progress=Math.floor((gs.t||0)/1000); break;
            case"perfect": q.progress=gs.questProgress.perfect||0; break;
            case"goldcol": q.progress=gs.questProgress.goldcol||0; break;
            case"level":   q.progress=gs.questProgress.level||0; break;
            case"boss":    q.progress=gs.questProgress.boss||0; break;
        }

        if(!q.done && q.progress>=q.target){
            q.done=true;
            _questDoneCache[q.id]=true;
            saveQuestDoneCache(); // sadece değişimde yaz
            completeQuest(S,q);
        }
    });
}

function completeQuest(S, q){
    const gs=GS;
    // [YENİ] Streak bonusu hesapla
    const streak=gs._dailyStreak||1;
    const streakBonus=Math.min(streak-1,4)*0.15; // her gün +%15, max +%60
    const bonusGold=q.reward.gold?Math.round(q.reward.gold*(1+streakBonus)):0;

    // Ödül ver
    if(bonusGold){
        PLAYER_GOLD+=bonusGold;
        gs.gold+=bonusGold;
        localStorage.setItem("nt_gold",PLAYER_GOLD);
    }
    if(q.reward.xpBonus) gs._xpBoostTimer=(gs._xpBoostTimer||0)+10000;

    // 7 günlük streak'te kristal bonusu
    if(streak>=7 && streak%7===0){
        addCrystal(CRYSTAL_SOURCES.daily_streak_7,"daily_streak_7");
        if(S._crystalHudText) S._crystalHudText.setText("💎 "+PLAYER_CRYSTAL);
    }

    // [YENİ] Tamamlanan görevi localStorage'a kaydet
    const doneMap=JSON.parse(localStorage.getItem("nt_quests_done")||"{}");
    doneMap[q.id]=true;
    localStorage.setItem("nt_quests_done",JSON.stringify(doneMap));

    const text=LLang(q,"text","textEN","textRU");
    const W=360, H=640;

    // [VFX WOW] GÖREV TAMAMLANDI — Bağımlılık yapan hissiyat
    // 1. Kamera efektleri
    
    S.cameras.main.shake(30,0.004);

    // 2. Banner — sağdan hızlı girer
    const banner=S.add.graphics().setDepth(708);
    banner.fillStyle(0x002a1a,0.92); banner.fillRect(0,150,W,80);
    banner.lineStyle(2.5,0x44ff88,0.8); banner.lineBetween(0,150,W,150);
    banner.lineStyle(2.5,0x44ff88,0.8); banner.lineBetween(0,230,W,230);
    banner.fillStyle(0x44ff88,0.07); banner.fillRect(0,150,W,80);
    // Sol accent bar
    banner.fillStyle(0x44ff88,0.7); banner.fillRect(0,150,4,80);
    banner.x=W+10;
    S.tweens.add({targets:banner,x:0,duration:260,ease:"Back.easeOut"});
    S.time.delayedCall(2400,()=>{
        S.tweens.add({targets:banner,x:-W,duration:220,ease:"Quad.easeIn",
            onComplete:()=>banner.destroy()});
    });

    // 3. ✓ İkonu dairesi — büyük scale-in
    const checkCircle=S.add.graphics().setDepth(712);
    checkCircle.x=50; checkCircle.y=190;
    checkCircle.fillStyle(0x44ff88,0.25); checkCircle.fillCircle(0,0,22);
    checkCircle.lineStyle(2.5,0x44ff88,1.0); checkCircle.strokeCircle(0,0,22);
    checkCircle.setAlpha(0).setScale(0.1);
    S.tweens.add({targets:checkCircle,alpha:1,scaleX:1,scaleY:1,duration:260,ease:"Back.easeOut"});
    // Sürekli nabız
    S.time.delayedCall(260,()=>{
        S.tweens.add({targets:checkCircle,scaleX:1.18,scaleY:1.18,
            duration:450,yoyo:true,repeat:3,ease:"Sine.easeInOut"});
    });
    S.time.delayedCall(2400,()=>checkCircle.destroy());

    const checkTxt=S.add.text(50,190,"✓",{
        font:"bold 24px 'Courier New'",color:"#44ff88",
        stroke:"#001100",strokeThickness:5
    }).setOrigin(0.5).setAlpha(0).setDepth(713);
    S.tweens.add({targets:checkTxt,alpha:1,duration:200,delay:120});
    S.time.delayedCall(2400,()=>checkTxt.destroy());

    // 4. GÖREV TAMAMLANDI yazısı — scale punch
    const completeLbl=S.add.text(W/2+15,158,L("questCompleted"),{
        font:"bold 12px 'Courier New'",color:"#44ff88",
        stroke:"#001100",strokeThickness:5,letterSpacing:2
    }).setOrigin(0.5,0).setAlpha(0).setDepth(710).setScale(0.5);
    S.tweens.add({targets:completeLbl,alpha:1,scaleX:1,scaleY:1,
        duration:280,ease:"Back.easeOut"});
    S.time.delayedCall(2400,()=>{
        S.tweens.add({targets:completeLbl,alpha:0,y:completeLbl.y-10,
            duration:200,onComplete:()=>completeLbl.destroy()});
    });

    // 5. Görev ismi
    const questLbl=S.add.text(W/2+15,178,text,{
        font:"bold 10px 'Courier New'",color:"#aaffcc",
        stroke:"#001100",strokeThickness:3,wordWrap:{width:210}
    }).setOrigin(0.5,0).setAlpha(0).setDepth(710);
    S.tweens.add({targets:questLbl,alpha:1,duration:200,delay:100});
    S.time.delayedCall(2400,()=>{
        S.tweens.add({targets:questLbl,alpha:0,duration:200,onComplete:()=>questLbl.destroy()});
    });

    // 6. Altın ödül — animasyonlu
    const goldStr="⬡ +"+bonusGold+(streakBonus>0?" (x"+(1+streakBonus).toFixed(2)+")":"");
    const ql=S.add.text(W/2+15,200,goldStr,{
        font:"bold 13px 'Courier New'",color:"#ffcc00",
        stroke:"#000",strokeThickness:4
    }).setOrigin(0.5,0).setDepth(710).setAlpha(0).setScale(0.7);
    S.tweens.add({targets:ql,alpha:1,scaleX:1,scaleY:1,duration:260,ease:"Back.easeOut",delay:200});
    S.time.delayedCall(2400,()=>{
        S.tweens.add({targets:ql,alpha:0,duration:200,onComplete:()=>ql.destroy()});
    });

    // 7. [YENİ] Streak göstergesi — ateş ikonu ile
    if(streak>1){
        const strkTxt=S.add.text(W/2+15,218,"🔥 "+streak+" "+L("questStreak")+"! +"+( streakBonus*100).toFixed(0)+"% "+L("questStreakBonus"),{
            font:"bold 9px 'Courier New'",color:"#ff8844",
            stroke:"#000",strokeThickness:3
        }).setOrigin(0.5,0).setDepth(710).setAlpha(0);
        S.tweens.add({targets:strkTxt,alpha:1,duration:200,delay:320});
        S.time.delayedCall(2400,()=>{
            S.tweens.add({targets:strkTxt,alpha:0,duration:200,onComplete:()=>strkTxt.destroy()});
        });
    }

    // 8. Yıldız + altın parçacık patlaması
    for(let i=0;i<30;i++){
        S.time.delayedCall(i*18,()=>{
            const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
            const spd=Phaser.Math.Between(50,140);
            const sz=Phaser.Math.Between(3,8);
            const col=[0x44ff88,0xffffff,0xffcc00,0x00ffaa,0x88ffcc][i%5];
            const star=S.add.graphics().setDepth(711);
            star.fillStyle(col,0.9);
            star.fillRect(W/2-sz/2, 190-sz/2, sz, sz);
            S.tweens.add({targets:star,
                x:Math.cos(ang)*spd, y:190+Math.sin(ang)*spd,
                alpha:0, scaleX:0.08, scaleY:0.08,
                duration:Phaser.Math.Between(320,640), ease:"Quad.easeOut",
                onComplete:()=>star.destroy()});
        });
    }

    // 9. Altın coin'ler yukarı çıkar — tatmin edici akma
    for(let i=0;i<12;i++){
        S.time.delayedCall(i*40,()=>{
            const cx=Phaser.Math.Between(20,340);
            const coin=S.add.text(cx,H-60,"⬡",{
                font:"bold "+(8+Math.random()*6)+"px 'Courier New'",
                color:"#ffcc00",stroke:"#000",strokeThickness:2
            }).setDepth(711).setAlpha(0.9);
            S.tweens.add({targets:coin,
                y:coin.y-Phaser.Math.Between(60,140),
                x:coin.x+Phaser.Math.Between(-20,20),
                alpha:0,
                duration:Phaser.Math.Between(600,1000),
                ease:"Quad.easeOut",
                onComplete:()=>coin.destroy()});
        });
    }
}

// [UI POLISH P3] renderQuestHUD — ortalanmış, biraz daha aşağı, görünür barlar
// Eski: qy=548, bar 3px, sol hizalı
// Yeni: qy=518, bar 6px, metin ortalanmış, daha geniş panel
function renderQuestHUD(S){
    const gs=GS;
    if(!gs.activeQuests||gs.activeQuests.length===0) return;

    // İlk kurulumda oluştur — persistent objeler
    if(!S._questHudInited){
        S._questHudInited=true;
        S._questHudBgs=[];
        S._questHudLabels=[];
        S._questHudIcons=[];
        S._questHudBars=[];    // [P3] Ayrı bar graphics nesneleri
        gs.activeQuests.forEach((q,i)=>{
            // [UI POLISH P3] Y konumu: 518 + i*34 (biraz daha aşağı, daha geniş aralık)
            const qy=518+i*34;
            const bgG=S.add.graphics().setDepth(48);
            S._questHudBgs.push(bgG);
            const barG=S.add.graphics().setDepth(49);
            S._questHudBars.push(barG);
            // [UI POLISH P3] İkon ve metin tam ortalanmış (origin 0.5)
            const icn=S.add.text(180,qy-4,"",{
                font:"8px 'Courier New'",color:"#aaaaaa"
            }).setOrigin(0.5).setDepth(50);
            S._questHudIcons.push(icn);
            // [UI POLISH P3] Label orta hizalı
            const lbl=S.add.text(180,qy+6,"",{
                font:"bold 8px 'Courier New'",color:"#dddddd",
                stroke:"#000000",strokeThickness:2,
                align:"center"
            }).setOrigin(0.5,0).setDepth(50);
            S._questHudLabels.push(lbl);
        });
    }

    gs.activeQuests.forEach((q,i)=>{
        const qy=518+i*34;
        const ratio=Math.min(1,q.progress/q.target);
        const col=q.done?0x44ff88:0xffcc44;
        const bg=S._questHudBgs[i];
        const bar=S._questHudBars[i];
        const lbl=S._questHudLabels[i];
        const icn=S._questHudIcons[i];
        if(!bg||!lbl) return;

        // [UI POLISH P3] Arka plan — ince, şeffaf, ortalanmış (x:40..320 → 280px geniş)
        bg.clear();
        bg.fillStyle(0x000000,0.35); bg.fillRoundedRect(40,qy-10,280,22,4);
        bg.fillStyle(col,0.7); bg.fillRoundedRect(40,qy-10,3,22,{tl:4,tr:0,bl:4,br:0}); // sol şerit
        bg.lineStyle(1,col,0.25); bg.strokeRoundedRect(40,qy-10,280,22,4);

        // [UI POLISH P3] Progress bar — 6px kalın, düzgün görünür, GERÇEKTEN DOLAR
        bar.clear();
        bar.fillStyle(col,0.12); bar.fillRoundedRect(43,qy+8,277*1,4,2);      // track (arka)
        if(ratio>0){
            bar.fillStyle(col,q.done?0.9:0.7); bar.fillRoundedRect(43,qy+8,Math.ceil(277*ratio),4,2); // dolgu
            if(!q.done){
                bar.fillStyle(0xffffff,0.3); bar.fillRoundedRect(43,qy+8,Math.ceil(277*ratio),2,1); // shine
            }
        }

        const text=LLang(q,"text","textEN","textRU");
        lbl.setText((q.done?"✓ ":"")+text+"  "+Math.min(q.progress,q.target)+"/"+q.target);
        lbl.setColor(q.done?"#44ff88":"#cccccc");
        if(icn) icn.setText(q.done?"●":"○").setColor(q.done?"#44ff88":"#666666");
    });
}

// ── KUM FIRTINASI SİSTEMİ ────────────────────────────────────
function triggerSandStorm(S){
    const gs=GS;
    gs._sandStormActive=true;
    gs._sandStormDuration=15000;
    gs._sandStormTimer=0;

    // Uyarı
    showHitTxt(S,180,120,"🌪 KUM FIRTINASI!","#ddaa55",true);
    S.cameras.main.shake(60,0.006);

    // Ekran üzerinde kum örtüsü efekti
    if(!S._stormOverlay){
        S._stormOverlay=S.add.rectangle(180,320,360,640,0xddaa55,0).setDepth(500);
    }
    S.tweens.add({targets:S._stormOverlay,fillAlpha:0.08,duration:800});
}

function tickSandStorm(S, delta){
    const gs=GS;
    gs._sandStormTimer+=delta;

    // Fırtına boyunca: rastgele düşman hız artışı ve görüş azalması
    if(gs._sandStormTimer%3000<delta&&!gs.pickingUpgrade){
        // Her 3 saniyede bir tüm düşmanları hafif hızlandır
        const enemies=S._activeEnemies||[];
        enemies.forEach(e=>{
            if(!e||!e.active||!e.body) return;
            e.body.velocity.x+=Phaser.Math.Between(-25,25);
        });
    }

    // 15 saniye sonra biter
    if(gs._sandStormTimer>=gs._sandStormDuration){
        gs._sandStormActive=false;
        if(S._stormOverlay) S.tweens.add({targets:S._stormOverlay,fillAlpha:0,duration:1000});
        showHitTxt(S,180,120,"Kum fırtınası dinildi.","#ddaa55",false);
    }
}

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
        font:"bold 32px 'Courier New'",
        color: Phaser.Display.Color.IntegerToColor(evoColor).rgba,
        stroke:"#000000", strokeThickness:10, letterSpacing:6
    }).setOrigin(0.5).setDepth(607).setAlpha(0).setScale(0.1);

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
        font:"bold 15px 'Courier New'", color:"#ffffff",
        stroke:"#000", strokeThickness:6, letterSpacing:3
    }).setOrigin(0.5).setDepth(607).setAlpha(0);
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
                try{evTxt.destroy();evoLabel.destroy();}catch(e){}
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
function applyFlamePoison(S,enemy){
    if(!GS._synergyToxicFire||!enemy||!enemy.active) return;
    if(Math.random()<0.25){
        // Zehir dot
        S.time.addEvent({delay:400,repeat:4,callback:()=>{
            if(enemy&&enemy.active) applyDmg(S,enemy,0.3,false);
        }});
    }
}

// ★ YENİ: Chain Storm sinerjisi — Lightning crit uygular
function applyChainStormToLightning(S,target){
    if(!GS._synergyChainStorm) return;
    if(target&&target.active) applyDmg(S,target,GS.damage*0.5,true); // force crit
}

// ★ YENİ: Perfect hit'e görev sayacı (doShoot callback'te çağırılır)
function trackPerfectHit(gs){
    gs.questProgress.perfect=(gs.questProgress.perfect||0)+1;
}

// ═══════════════════════════════════════════════════════════════
// ★★★ YENİ SİSTEMLER BLOĞU SONU ★★★
// ═══════════════════════════════════════════════════════════════

function gameOver(S){const gs=GS;if(!gs||gs.gameOver)return;gs.gameOver=true;
    SYNERGIES.forEach(syn=>syn.active=false);
    _upgradeLock=0;
    try{S.physics.resume();}catch(e){}S.physics.pause();S.time.timeScale=1;
    // Mobil butonları gizle
    _hideMobileBtns(S);
    // [PERF FIX] Gold localStorage burada kaydedilir — her kill'de değil
    PLAYER_GOLD=gs.gold;
    localStorage.setItem("nt_gold",PLAYER_GOLD);
    // Leaderboard'a skor gönder
    lbSubmitScore(gs.score||0, gs.kills||0, gs.level||1);
    const lifeStats = updateLifetimeStats(gs);
    const newAchs   = checkNewAchievements(lifeStats);
    const W=360,H=640;

    // ── KAMERA EFEKTİ ──
    S.cameras.main.shake(200,0.018);
    S.cameras.main.zoomTo(1.06,200,"Quad.easeOut");
    S.time.delayedCall(200,()=>S.cameras.main.zoomTo(1.0,600,"Quad.easeIn"));

    // ── KOYU OVERLAY ──
    const ov=S.add.rectangle(W/2,H/2,W,H,0x000000,0).setDepth(900);
    S.tweens.add({targets:ov,fillAlpha:0.92,duration:350});

    // ── ARKA PLAN GRADİENT PANEL ──
    S.time.delayedCall(180,()=>{
        // Kırmızı parçacık yağmuru
        for(let i=0;i<28;i++){
            S.time.delayedCall(i*40,()=>{
                const rx=Phaser.Math.Between(20,340);
                const rp=S.add.graphics().setDepth(901);
                rp.fillStyle(i%3===0?0xff2244:i%3===1?0xff6600:0xffcc00,0.7);
                rp.fillRect(rx,0,Phaser.Math.Between(1,3),Phaser.Math.Between(3,8));
                S.tweens.add({targets:rp,y:H,alpha:0,duration:Phaser.Math.Between(600,1200),ease:"Quad.easeIn",onComplete:()=>rp.destroy()});
            });
        }

        // ── ANA PANEL ──
        const panelG=S.add.graphics().setDepth(902);
        // Panel arka planı — koyu + kırmızı aksan
        panelG.fillStyle(0x050006,0.98); panelG.fillRoundedRect(18,78,324,500,14);
        // Kırmızı dış kenarlık
        panelG.lineStyle(3,0xff2244,1.0); panelG.strokeRoundedRect(18,78,324,500,14);
        // İç ince kenarlık
        panelG.lineStyle(1,0x881122,0.4); panelG.strokeRoundedRect(23,83,314,490,11);
        // Üst başlık şeridi — gradient hissi
        panelG.fillStyle(0xff2244,0.22); panelG.fillRoundedRect(18,78,324,52,{tl:14,tr:14,bl:0,br:0});
        // Sol ve sağ dekoratif çizgi
        panelG.fillStyle(0xff2244,0.6); panelG.fillRect(18,78,4,500);
        panelG.fillStyle(0xff2244,0.6); panelG.fillRect(338,78,4,500);
        // Alt aksan
        panelG.fillStyle(0xff2244,0.15); panelG.fillRoundedRect(18,538,324,40,{tl:0,tr:0,bl:14,br:14});
        panelG.setAlpha(0).setScale(0.88);
        S.tweens.add({targets:panelG,alpha:1,scaleX:1,scaleY:1,duration:380,ease:"Back.easeOut"});

        // ── BAŞLIK: "OYUN BİTTİ" ──
        const goTxt=S.add.text(W/2,105,L("gameOver"),{
            font:"bold 22px 'Courier New'",color:"#ff2244",
            stroke:"#000000",strokeThickness:7,letterSpacing:6
        }).setOrigin(0.5).setDepth(903).setAlpha(0).setScale(0.5);
        S.tweens.add({targets:goTxt,alpha:1,scaleX:1.1,scaleY:1.1,duration:300,ease:"Back.easeOut",delay:80});
        S.tweens.add({targets:goTxt,scaleX:1,scaleY:1,duration:180,delay:380});
        // Başlık titreşimi — nabız efekti
        S.time.delayedCall(600,()=>{
            S.tweens.add({targets:goTxt,alpha:0.75,duration:600,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
        });

        // Dekoratif çizgi
        const divG=S.add.graphics().setDepth(903);
        divG.lineStyle(1,0xff2244,0.4); divG.lineBetween(36,130,324,130);
        divG.lineStyle(1,0xff2244,0.2); divG.lineBetween(52,134,308,134);
        divG.setAlpha(0);
        S.tweens.add({targets:divG,alpha:1,duration:300,delay:200});

        // ── HIGHSCORE KONTROLÜ ──
        const prevHs=parseInt(localStorage.getItem("nt_highscore")||"0");
        const isNewRecord=gs.score>prevHs;
        if(isNewRecord){
            localStorage.setItem("nt_highscore",gs.score);
            const rec=S.add.text(W/2,143,L("goNewRecord"),{
                font:"bold 12px 'Courier New'",color:"#ffcc00",
                stroke:"#000",strokeThickness:4,letterSpacing:3
            }).setOrigin(0.5).setDepth(903).setAlpha(0);
            S.tweens.add({targets:rec,alpha:1,scaleX:1.2,scaleY:1.2,duration:320,ease:"Back.easeOut",delay:300});
            S.tweens.add({targets:rec,scaleX:1,scaleY:1,duration:180,delay:620});
            S.tweens.add({targets:rec,alpha:0.7,duration:400,yoyo:true,repeat:-1,ease:"Sine.easeInOut",delay:800});
        } else if(prevHs>0){
            S.add.text(W/2,143,L("bestRun")+" "+prevHs.toLocaleString(),{
                font:"bold 9px 'Courier New'",color:"#443333",stroke:"#000",strokeThickness:2
            }).setOrigin(0.5).setDepth(903);
        }

        // ── STAT KARTLARI ──
        const stats=[
            {icon:"🏆",label:L("goScore"),value:(isNewRecord?"★ ":"")+gs.score.toLocaleString(),col:0xffcc00,bg:0x221800},
            {icon:"☠",label:L("kills"),value:gs.kills.toString(),col:0xff4444,bg:0x1a0000},
            {icon:"⬡",label:L("gold"),value:gs.gold.toLocaleString(),col:0xffaa00,bg:0x180e00},
            {icon:"⚡",label:"COMBO",value:gs.combo.toString(),col:0x44aaff,bg:0x001830},
        ];
        stats.forEach(({icon,label,value,col,bg},i)=>{
            const sx=i%2===0?30:186, sy=156+Math.floor(i/2)*72;
            const sw=138, sh=60;
            const cg=S.add.graphics().setDepth(903);
            cg.fillStyle(bg,0.95); cg.fillRoundedRect(sx,sy,sw,sh,8);
            cg.lineStyle(2,col,0.7); cg.strokeRoundedRect(sx,sy,sw,sh,8);
            cg.fillStyle(col,0.08); cg.fillRoundedRect(sx,sy,sw,18,{tl:8,tr:8,bl:0,br:0});
            cg.setAlpha(0);
            S.tweens.add({targets:cg,alpha:1,y:"+=6",duration:280,ease:"Back.easeOut",delay:200+i*60});
            S.add.text(sx+sw/2,sy+9,icon+" "+label,{
                font:"bold 8px 'Courier New'",color:Phaser.Display.Color.IntegerToColor(col).rgba,stroke:"#000",strokeThickness:2
            }).setOrigin(0.5,0).setDepth(904).setAlpha(0);
            const vt=S.add.text(sx+sw/2,sy+26,value,{
                font:"bold 18px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:4
            }).setOrigin(0.5,0).setDepth(904).setAlpha(0);
            S.time.delayedCall(200+i*60,()=>{
                S.tweens.add({targets:[cg,vt],alpha:1,duration:220});
                // Stat text tween'lerini de apply et
                S.children.list.filter(o=>o&&o.depth===904&&o.alpha===0).forEach(o=>{
                    S.tweens.add({targets:o,alpha:1,duration:220,delay:10});
                });
            });
        });

        // ── ACHİEVEMENT ──
        let achOffsetY=0;
        if(newAchs.length>0){
            const achY=302;
            const achG=S.add.graphics().setDepth(903);
            achG.fillStyle(0xffcc00,0.10); achG.fillRoundedRect(28,achY,304,22*newAchs.length+14,8);
            achG.lineStyle(1.5,0xffcc00,0.6); achG.strokeRoundedRect(28,achY,304,22*newAchs.length+14,8);
            newAchs.forEach((ach,i)=>{
                S.add.text(W/2,achY+8+i*22,ach.icon+" "+ach.desc+" +"+ach.gold+"⬡",
                    {font:"bold 9px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:2})
                    .setOrigin(0.5,0).setDepth(904);
                PLAYER_GOLD+=ach.gold;
                localStorage.setItem("nt_gold",PLAYER_GOLD);
            });
            achOffsetY=22*newAchs.length+18;
        }

        // Zaman etiketi
        const tSec=Math.floor(gs.t/1000);
        const tStr=Math.floor(tSec/60)+"d "+( tSec%60)+"s";
        S.add.text(W/2,302+achOffsetY,"⏱ "+tStr,{
            font:"bold 9px 'Courier New'",color:"#556677",stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(903);

        // Seviye
        S.add.text(W/2,316+achOffsetY,"⭐ "+L("goLevel")+" "+gs.level,{
            font:"bold 10px 'Courier New'",color:"#ffdd44",stroke:"#000",strokeThickness:2
        }).setOrigin(0.5).setDepth(903);

        // Dekoratif alt çizgi
        const div2=S.add.graphics().setDepth(903);
        div2.lineStyle(1,0xff2244,0.3); div2.lineBetween(36,332+achOffsetY,324,332+achOffsetY);

        const btnBaseY = 352+achOffsetY;

        const mkB=(x,y,w,h,label,c1,c2,fn,depth=903)=>{
            const bg2=S.add.graphics().setDepth(depth);
            const d=hov=>{
                bg2.clear();
                bg2.fillStyle(hov?c2:c1,1);
                bg2.fillRoundedRect(x-w/2,y-h/2,w,h,8);
                bg2.lineStyle(2,c2,hov?1:0.75);
                bg2.strokeRoundedRect(x-w/2,y-h/2,w,h,8);
                bg2.fillStyle(0xffffff,hov?0.12:0.06);
                bg2.fillRoundedRect(x-w/2+2,y-h/2+2,w-4,h/3,{tl:7,tr:7,bl:0,br:0});
            };
            d(false);
            S.add.text(x,y,label,{font:"bold 12px 'Courier New'",color:"#fff",stroke:"#000",strokeThickness:3,
                wordWrap:{width:w-12},align:"center"}).setOrigin(0.5).setDepth(depth+1);
            S.add.rectangle(x,y,w,h,0xffffff,0.001).setInteractive().setDepth(depth+2)
                .on("pointerover",()=>d(true)).on("pointerout",()=>d(false))
                .on("pointerdown",()=>{d(false);fn();});
        };

        const resetFn=()=>{
            Object.keys(UPGRADES).forEach(k=>UPGRADES[k].level=0);
            EVOLUTIONS.forEach(e=>e.active=false);
            SYNERGIES.forEach(s=>s.active=false);
            _debrisCount=0;
        };

        // ── DİRİLİŞ BUTONU — sadece elmasla, usedExtraLife değilse ──
        if(!gs.usedExtraLife){
            const hasDiamonds=PLAYER_GEMS>=5;
            const revBtnCol=hasDiamonds?0x330055:0x1a1a2a;
            const revBtnCol2=hasDiamonds?0x8800dd:0x333344;
            const revLabel=L("goRevive")+"  "+L("goReviveCost");
            mkB(W/2,btnBaseY,220,40,revLabel,revBtnCol,revBtnCol2,()=>{
                if(PLAYER_GEMS<5){
                    S.cameras.main.shake(30,0.006);
                    showHitTxt(S,W/2,btnBaseY-30,L("goInsufficientGems"),"#ff4444",false);
                    return;
                }
                showDiamondReviveScreen(S,ov);
            },904);
            S.add.text(W/2,btnBaseY+24,
                L("goGemsStatus")+" "+PLAYER_GEMS+(hasDiamonds?" ✓":" "+L("goGemsInsufficient")),{
                font:"bold 9px 'Courier New'",
                color:hasDiamonds?"#cc88ff":"#555566",
                stroke:"#000",strokeThickness:2
            }).setOrigin(0.5).setDepth(904);
        }

        const rOffset=gs.usedExtraLife?0:52;
        mkB(W/2,btnBaseY+rOffset,200,38,L("playAgain"),0x771122,0xff2244,()=>{
            resetFn(); S.scene.restart();
        },904);

        mkB(W/2,btnBaseY+rOffset+46,148,28,L("mainMenu"),0x181818,0x444444,()=>{
            resetFn(); S.scene.start("SceneMenu");
        },904);

        mkB(W/2,btnBaseY+rOffset+82,148,26,L("goShare"),0x003366,0x0055cc,()=>{
            shareTelegramScore(gs.score,gs.kills,gs.level);
        },904);
    });
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
    const titleTxt=S.add.text(W/2,218,"💎 DİRİLİŞ",{
        font:"bold 17px 'Courier New'",color:"#cc44ff",
        stroke:"#000000",strokeThickness:5,letterSpacing:4
    }).setOrigin(0.5).setDepth(952).setAlpha(0);
    S.tweens.add({targets:titleTxt,alpha:1,duration:250,delay:100});

    // Alt çizgi dekorasyon
    const deco=S.add.graphics().setDepth(952).setAlpha(0);
    deco.lineStyle(1,0xaa00ff,0.5); deco.lineBetween(58,236,302,236);
    S.tweens.add({targets:deco,alpha:1,duration:200,delay:150});

    // Elmas maliyeti bilgisi
    S.add.text(W/2,252,"5 💎 karşılığında diriliş",{
        font:"bold 10px 'Courier New'",color:"#9966cc",
        stroke:"#000",strokeThickness:2,align:"center"
    }).setOrigin(0.5).setDepth(952);

    S.add.text(W/2,268,"❤ x3 Can  +  5sn Yenilmezlik",{
        font:"bold 9px 'Courier New'",color:"#ff8888",
        stroke:"#000",strokeThickness:2
    }).setOrigin(0.5).setDepth(952);

    // Elmas bakiyesi
    S.add.text(W/2,284,L("goGemsStatus")+" "+PLAYER_GEMS+" 💎",{
        font:"bold 10px 'Courier New'",
        color:PLAYER_GEMS>=5?"#cc99ff":"#ff4444",
        stroke:"#000",strokeThickness:2
    }).setOrigin(0.5).setDepth(952);

    // ── GERİ SAYIM DAİRESİ ──
    let countdown=3;
    const cdCircle=S.add.graphics().setDepth(952);
    const cdTxt=S.add.text(W/2,318,countdown.toString(),{
        font:"bold 28px 'Courier New'",color:"#ffffff",
        stroke:"#000",strokeThickness:6
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
            cdTxt.setText(countdown>0?countdown.toString():"⏰");
            S.tweens.add({targets:cdTxt,scaleX:1.4,scaleY:1.4,duration:100,yoyo:true,ease:"Back.easeOut"});
        }
    }});

    const cleanup=()=>{
        cdTween.stop();
        cdEvt.remove();
        try{panel.destroy();dimOv.destroy();titleTxt.destroy();deco.destroy();cdCircle.destroy();cdTxt.destroy();}catch(e){}
        // Panel'deki tüm objeleri temizle
        S.children.list.filter(o=>o&&o.active&&typeof o.depth==="number"&&o.depth>=950&&o.depth<970)
            .forEach(o=>{try{o.destroy();}catch(e){}});
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
    S.add.text(W/2,376,"✦ DİRİL  (5 💎)",{
        font:"bold 13px 'Courier New'",color:"#ffffff",stroke:"#000",strokeThickness:3
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
    S.add.text(W/2,424,"✕  Bitir",{
        font:"bold 10px 'Courier New'",color:"#888899",stroke:"#000",strokeThickness:2
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
    try{if(panel)panel.destroy();}catch(e){}
    // Diriliş efekti
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
    }catch(e){}
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
            applyDmg(S,e,gs.damage*0.55*(_stormActive?2:1),false);
            triggerResonance(S,e,(depth||0)+1);
        }
    }
}
function doExplosion(S,x,y){
    const gs=GS, lv=UPGRADES.explosive.level, r=44+lv*12;
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
            onComplete:()=>{try{bub.destroy();}catch(e){}}
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
                    const origVY=e.body.velocity.y;
                    e.body.velocity.y=origVY*0.35;
                    e.body.velocity.x*=0.35;
                    e._poisonSlowed=true;
                    // Zehir rengi
                    e.setTint(0x55ff55);
                    S.time.delayedCall(640,()=>{
                        if(e&&e.active&&!e.frozen){e.clearTint();e._poisonSlowed=false;}
                        slowedEnemies.delete(e);
                    });
                }
                if(Math.random()<0.5){
                    const pip=S.add.graphics().setDepth(17);
                    pip.x=e.x; pip.y=e.y-6;
                    pip.fillStyle(0x44ff44,0.8); pip.fillRect(-1.5,-2,3,6);
                    S.tweens.add({targets:pip,y:pip.y-14,alpha:0,duration:300,onComplete:()=>pip.destroy()});
                }
            } else if(e._poisonSlowed){
                // Alan dışına çıktıysa normal hıza dön
                if(e.body){e.body.velocity.y/=0.35;e.body.velocity.x/=0.35;}
                e._poisonSlowed=false;
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
            ptcls.forEach(o=>{try{o.destroy();}catch(e){}});
        }
    });
    S.tweens.add({targets:ptcls,scaleX:1.15,scaleY:1.15,duration:600,ease:"Sine.easeOut",yoyo:true});
}

function spawnPoisonCloud(S,x,y){
    spawnPoisonCloudAt(S,x,y,UPGRADES.poison.level);
}

function drawPoisonAura(S){}
function spawnMeteor(S){
    const gs=GS, lv=UPGRADES.meteor.level;
    // ── AKILLI HEDEFLEME: en çok düşmanın olduğu bölgeyi seç ──
    const enemies=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
    let targetX;
    if(enemies.length===0){
        targetX=Phaser.Math.Between(60,300);
    } else if(enemies.length<=2){
        // Az düşman varsa doğrudan birini hedefle
        targetX=enemies[Phaser.Math.Between(0,enemies.length-1)].x;
    } else {
        // Küme merkezi bul — yoğun bölgeyi hedefle
        let bestX=180, bestScore=0;
        for(let ti=0;ti<enemies.length;ti++){
            const ex=enemies[ti].x;
            let score=0;
            for(let tj=0;tj<enemies.length;tj++){
                const dist=Math.abs(ex-enemies[tj].x);
                if(dist<80) score++;
            }
            if(score>bestScore){bestScore=score;bestX=ex;}
        }
        targetX=bestX+Phaser.Math.Between(-15,15); // hafif rastgelelik
    }
    const startX=Phaser.Math.Clamp(targetX+Phaser.Math.Between(-30,30),20,340);

    // Büyütülmüş boyut
    const meteorSize = 1.15 + lv*0.18;
    const m=S.add.image(startX,-60,"tex_meteor")
        .setScale(meteorSize)
        .setDepth(19)
        .setAngle(Phaser.Math.Between(0,360));
    // Yavaş dönüş
    S.tweens.add({targets:m, angle:m.angle+360, duration:2000, repeat:-1, ease:"Linear"});

    // Kırmızı uyarı gölgesi + halka
    const shadow=S.add.graphics().setDepth(4);
    const warnRing=S.add.graphics().setDepth(5);
    let warnPulse=0;
    const drawShadow=(prog)=>{
        shadow.clear();
        const sw=18+prog*42+lv*8;
        shadow.fillStyle(0x330000, 0.22+prog*0.22);
        shadow.fillEllipse(targetX, GROUND_Y-2, sw*1.5, sw*0.25);
    };
    // Uyarı ikon — "!"
    const warnTxt=S.add.text(targetX,GROUND_Y-22,"⚠",{font:"bold 14px 'Courier New'",color:"#ff4400",stroke:"#000",strokeThickness:3}).setOrigin(0.5).setDepth(6).setAlpha(0);
    S.tweens.add({targets:warnTxt,alpha:1,duration:200});

    const warnEv=S.time.addEvent({delay:60,loop:true,callback:()=>{
        warnPulse=(warnPulse+0.4)%(Math.PI*2);
        warnRing.clear();
        const wr=22+lv*7;
        warnRing.lineStyle(2.5,0xff2200, 0.35+Math.sin(warnPulse)*0.25);
        warnRing.strokeCircle(targetX, GROUND_Y-4, wr+Math.sin(warnPulse)*5);
        warnRing.lineStyle(1,0xff6600, 0.18+Math.sin(warnPulse)*0.12);
        warnRing.strokeCircle(targetX, GROUND_Y-4, wr*1.5);
        // Çapraz nişan çizgileri
        warnRing.lineStyle(1,0xff2200,0.25+Math.sin(warnPulse)*0.15);
        warnRing.lineBetween(targetX-wr-5,GROUND_Y-4,targetX+wr+5,GROUND_Y-4);
        warnRing.lineBetween(targetX,GROUND_Y-4-wr-5,targetX,GROUND_Y-4+wr+5);
    }});
    drawShadow(0);

    // Yavaşlatılmış düşüş — daha dramatik
    let vy=0.5+lv*0.18;
    let done=false;
    const hitCooldown=new Map();

    // Ateş + kor trail — daha kalın ve yoğun
    const trailEv=S.time.addEvent({delay:40,loop:true,callback:()=>{  // [PERF] 18ms→40ms, 5 parçacık→2
        if(done) return;
        for(let i=0;i<2;i++){
            const tr=S.add.graphics().setDepth(17);
            const pw=2+Math.random()*3.5;
            const ph=8+lv*3+Math.random()*10;
            const col=[0xff2200,0xff4400,0xff7700,0xffaa00,0xffcc00][Math.floor(Math.random()*5)];
            tr.fillStyle(col, 0.75+Math.random()*0.25);
            tr.fillRect(-pw/2,-ph/2,pw,ph);
            tr.x=m.x+Phaser.Math.Between(-8,8);
            tr.y=m.y+Phaser.Math.Between(-6,6);
            tr.angle=Phaser.Math.Between(-30,30);
            S.tweens.add({targets:tr,
                y:tr.y+Phaser.Math.Between(14,34),
                x:tr.x+Phaser.Math.Between(-10,10),
                alpha:0, scaleY:0.15,
                duration:220+Math.random()*150,
                ease:"Quad.easeOut",
                onComplete:()=>tr.destroy()});
        }
        // Kıvılcım
        if(Math.random()<0.35){
            const sp=S.add.graphics().setDepth(20);
            sp.fillStyle(0xffee44,1); sp.fillRect(-1,-1,2,5+Math.random()*5);
            sp.x=m.x+Phaser.Math.Between(-10,10);
            sp.y=m.y+Phaser.Math.Between(-10,10);
            const ang=Phaser.Math.DegToRad(Phaser.Math.Between(-175,-5));
            S.tweens.add({targets:sp,
                x:sp.x+Math.cos(ang)*Phaser.Math.Between(10,28),
                y:sp.y+Math.sin(ang)*Phaser.Math.Between(8,24),
                alpha:0, duration:250,
                onComplete:()=>sp.destroy()});
        }
        if(Math.random()<0.15){
            const cr=S.add.graphics().setDepth(16);
            cr.lineStyle(1.5,0xff6600,0.6); cr.strokeCircle(m.x,m.y,6+Math.random()*8);
            S.tweens.add({targets:cr,scaleX:2.5,scaleY:2.5,alpha:0,duration:200,onComplete:()=>cr.destroy()});
        }
    }});

    const ticker=S.time.addEvent({delay:16,loop:true,callback:()=>{
        if(done) return;
        // Daha yavaş ivme
        vy=Math.min(vy+0.08, 4+lv*0.6);
        m.y+=vy;
        // Hedeflemeye doğru hafif kaydırma — öngörülü ama kaçılabilir
        m.x+=(targetX-m.x)*0.010;
        m.x=Phaser.Math.Clamp(m.x,10,350);
        const progress=Math.min(1,(m.y+60)/(GROUND_Y+60));
        drawShadow(progress);
        // Uyarı yazısı boyutu — yaklaştıkça büyür
        if(warnTxt.active) warnTxt.setScale(0.8+progress*0.5);

        // Yol üzerinde hasar
        const now=Date.now();
        const mHitR=(26+lv*10)*meteorSize;
        const mHitR2=mHitR*mHitR;
        const _metList=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
        for(let _mti=0;_mti<_metList.length;_mti++){
            const e=_metList[_mti];
            if(!e||!e.active||e.spawnProtected) continue;
            const dx=e.x-m.x, dy=e.y-m.y;
            if(dx*dx+dy*dy<mHitR2){
                const last=hitCooldown.get(e)||0;
                if(now-last>500){
                    hitCooldown.set(e,now);
                    applyDmg(S,e,gs.damage*(0.6+lv*0.22),false);
                    const hf=S.add.graphics().setDepth(20);
                    hf.x=e.x; hf.y=e.y;
                    hf.fillStyle(0xff6600,0.8); hf.fillCircle(0,0,9);
                    hf.fillStyle(0xffcc00,0.5); hf.fillCircle(0,0,4);
                    S.tweens.add({targets:hf,scaleX:2.5,scaleY:2.5,alpha:0,duration:160,onComplete:()=>hf.destroy()});
                }
            }
        }

        if(m.y>=GROUND_Y-8){
            done=true; trailEv.remove(); ticker.remove(); warnEv.remove();
            try{shadow.destroy();warnRing.destroy();warnTxt.destroy();}catch(e){}
            const mx=m.x; S.tweens.killTweensOf(m); m.destroy();
            doMeteorImpact(S,mx,lv);
        }
    }});

    S.time.delayedCall(12000,()=>{
        if(!done){done=true;trailEv.remove();ticker.remove();warnEv.remove();
        try{shadow.destroy();warnRing.destroy();warnTxt.destroy();}catch(e){}
        try{S.tweens.killTweensOf(m);m.destroy();}catch(e){}}
    });
}

function doMeteorImpact(S,x,lv){
    const gs=GS, r=70+lv*24;

    // ── 0. ANI BEYAZ FLAŞ — en dikkat çekici ──
    /* flash removed */
    S.cameras.main.shake(55,0.010);

    // ── 1. BÜYÜK KOR TOPU — çarpma anı ──
    const coreBall=S.add.graphics().setDepth(28);
    coreBall.x=x; coreBall.y=GROUND_Y-4;
    coreBall.fillStyle(0xffffff,1.0); coreBall.fillCircle(0,0,r*0.22);
    coreBall.fillStyle(0xffcc44,0.9); coreBall.fillCircle(0,0,r*0.35);
    coreBall.fillStyle(0xff6600,0.8); coreBall.fillCircle(0,0,r*0.5);
    coreBall.fillStyle(0xff2200,0.6); coreBall.fillCircle(0,0,r*0.65);
    S.tweens.add({targets:coreBall,scaleX:3.5,scaleY:2.2,alpha:0,duration:350,ease:"Quad.easeOut",onComplete:()=>coreBall.destroy()});

    // ── 2. SHOCKWAVE — 3 katman halka ──
    for(let ri=0;ri<3;ri++){
        S.time.delayedCall(ri*60,()=>{
            const sw=S.add.graphics().setDepth(24-ri);
            sw.x=x; sw.y=GROUND_Y-3;
            const col=ri===0?0xffffff:ri===1?0xddaa55:0xff4400;
            const thick=ri===0?4:ri===1?3:2;
            sw.lineStyle(thick,col,0.9-ri*0.2); sw.strokeEllipse(0,0,12,4);
            S.tweens.add({
                targets:sw,
                scaleX:r*(0.25+ri*0.1), scaleY:r*(0.25+ri*0.1),
                alpha:0, duration:400+ri*100, ease:"Quad.easeOut",
                onComplete:()=>sw.destroy()
            });
        });
    }

    // ── 3. KUM / TOZ / ENKAZ PARÇACIKLARI ──
    const sandColors=[0xddaa55,0xcc9944,0xeecc77,0xbbaa66,0xaa8833,0xff6600,0xff4400];
    for(let i=0;i<36;i++){
        const ang=Phaser.Math.DegToRad(Phaser.Math.Between(-178,-2));
        const spd=Phaser.Math.Between(30,r*1.3);
        const sz=Phaser.Math.Between(2,7);
        const col=sandColors[i%sandColors.length];
        const dp=S.add.graphics().setDepth(21);
        dp.fillStyle(col,0.85+Math.random()*0.15);
        dp.fillRect(-sz/2,-sz/2,sz,sz);
        dp.x=x+Phaser.Math.Between(-8,8);
        dp.y=GROUND_Y-4;
        const ex=dp.x+Math.cos(ang)*spd;
        const ey=GROUND_Y-4+Math.sin(ang)*spd*(0.3+Math.random()*0.3);
        S.tweens.add({
            targets:dp,
            x:ex, y:ey,
            alpha:0,
            angle:Phaser.Math.Between(-120,120),
            scaleX:0.15, scaleY:0.15,
            duration:Phaser.Math.Between(300,650),
            ease:"Quad.easeOut",
            onComplete:()=>dp.destroy()
        });
    }

    // ── 4. ATEŞ TOPU PARÇACIKLARI — yükselen ──
    for(let i=0;i<20;i++){
        S.time.delayedCall(i*20,()=>{
            const ang=Phaser.Math.DegToRad(Phaser.Math.Between(200,340));
            const spd=Phaser.Math.Between(40,r*0.9);
            const fp=S.add.graphics().setDepth(23);
            const col=[0xff2200,0xff5500,0xff8800,0xffcc00,0xffffff][Math.floor(Math.random()*5)];
            fp.fillStyle(col,0.9); fp.fillCircle(0,0,Phaser.Math.Between(3,8));
            fp.x=x+Phaser.Math.Between(-10,10); fp.y=GROUND_Y-6;
            S.tweens.add({targets:fp,
                x:fp.x+Math.cos(ang)*spd,
                y:fp.y+Math.sin(ang)*spd*0.7,
                alpha:0,scaleX:0.1,scaleY:0.1,
                duration:Phaser.Math.Between(350,700),ease:"Quad.easeOut",
                onComplete:()=>fp.destroy()});
        });
    }

    // ── 5. DUMAN BULUTLARI — büyük, yavaş yükselen ──
    for(let i=0;i<5;i++){
        S.time.delayedCall(i*50,()=>{
            const sang=Phaser.Math.DegToRad(200+i*30+Phaser.Math.Between(-15,15));
            const sdist=Phaser.Math.Between(10,30);
            const sm=S.add.graphics().setDepth(18);
            sm.fillStyle(0x332211,0.5+Math.random()*0.2); sm.fillCircle(0,0,Phaser.Math.Between(14,26));
            sm.x=x+Math.cos(sang)*sdist; sm.y=GROUND_Y-6+Math.sin(sang)*sdist*0.3;
            S.tweens.add({targets:sm,
                x:sm.x+Math.cos(sang)*Phaser.Math.Between(20,50),
                y:sm.y-Phaser.Math.Between(25,55),
                scaleX:3.0,scaleY:3.0,alpha:0,
                duration:Phaser.Math.Between(700,1200),ease:"Quad.easeOut",
                onComplete:()=>sm.destroy()});
        });
    }

    // ── 6. ÇATLAK / KRATER ──
    const crack=S.add.graphics().setDepth(4);
    crack.fillStyle(0x110800,0.75);
    crack.fillEllipse(x,GROUND_Y,r*0.65,r*0.10);
    for(let i=0;i<8;i++){
        const ang=Phaser.Math.DegToRad(i*45+Phaser.Math.Between(-15,15));
        const len=Phaser.Math.Between(10,r*0.42);
        crack.lineStyle(2,0x220800,0.6);
        crack.lineBetween(x,GROUND_Y,x+Math.cos(ang)*len,GROUND_Y+Math.sin(ang)*len*0.2);
    }
    S.tweens.add({targets:crack,alpha:0,duration:1800,ease:"Quad.easeIn",onComplete:()=>crack.destroy()});

    // ── 7. ALAN HASARI ──
    const _metEnemies=S._activeEnemies&&S._activeEnemies.length>0?S._activeEnemies:S.pyramids.getMatching("active",true);
    for(let _mi=0;_mi<_metEnemies.length;_mi++){
        const e=_metEnemies[_mi];
        if(!e||!e.active) continue;
        const dx=e.x-x, dy=e.y-(GROUND_Y-4);
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<r){
            const fo=Math.max(0.25,1-(d/r)*0.75);
            applyDmg(S,e, gs.damage*(3.2+lv*1.0)*fo, d<r*0.45);
        }
    }
    // ★ Meteor Bomb sinerjisi
    if(gs._synergyMeteorBomb){
        S.time.delayedCall(80,()=>doExplosion(S,x,GROUND_Y-10));
    }
}
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
        combo20:  { text: L("powerSpike_overload"),    color:"#ffcc00", duration:1400 },
    };
    const m = msgs[type]; if(!m) return;
    const W=360, H=640;
    const txt = S.add.text(W/2, H/2-80, m.text, {
        font:"bold 28px 'Courier New'",
        color:m.color, stroke:"#000000",
        strokeThickness:8, letterSpacing:5
    }).setOrigin(0.5).setAlpha(0).setDepth(650).setScale(0.4);
    S.tweens.add({targets:txt, alpha:1, scaleX:1.1, scaleY:1.1,
        duration:160, ease:"Back.easeOut",
        onComplete:()=>{
            S.tweens.add({targets:txt, scaleX:1.0, scaleY:1.0, duration:80});
            S.time.delayedCall(m.duration-320, ()=>{
                S.tweens.add({targets:txt, alpha:0, y:txt.y-24,
                    duration:280, ease:"Quad.easeIn",
                    onComplete:()=>{ try{txt.destroy();}catch(e){} }});
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
        gs._nearDeathDmgBoost = 1.20;   // +%20 hasar buff
        gs.damage *= gs._nearDeathDmgBoost;
        showHitTxt(S, 180, 200, L("nearDeath_buff"), "#ff2244", true);
    } else if(ratio > 0.20 && gs._nearDeathActive){
        gs._nearDeathActive = false;
        gs.damage /= gs._nearDeathDmgBoost;
        gs._nearDeathDmgBoost = 1.0;
    }
}

function tickNearDeathPulse(S, delta){
    // [VFX] Kırmızı ekran nabzı kaldırıldı — göz yorucu
    // Düşük can bilgisi sadece HP bar'dan okunur
}

// ── 3. COMBO BREAK — çöküş hissi ───────────────────────────────
function showComboBreak(S, lastCombo){
    if(!S||!S.add||lastCombo < 5) return;
    const W=360;
    const intensity = Math.min(lastCombo, 30);
    const txt = S.add.text(W/2, 300, L("comboBreak"), {
        font:"bold 16px 'Courier New'",
        color:"#ff4444", stroke:"#000",strokeThickness:4
    }).setOrigin(0.5).setAlpha(0).setDepth(60).setScale(1.2);
    S.tweens.add({targets:txt, alpha:0.9, scaleX:1.0, scaleY:1.0,
        duration:120, ease:"Quad.easeOut"});
    S.tweens.add({targets:txt, alpha:0, y:txt.y+18, scaleX:0.7, scaleY:0.7,
        duration:500, delay:350, ease:"Quad.easeIn",
        onComplete:()=>{ try{txt.destroy();}catch(e){} }});
    // Küçük kamera sarsıntısı — çöküş hissi
    S.cameras.main.shake(60 + intensity*2, 0.006 + intensity*0.0003);
    // Renk filtresi anlık
    
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
                  min <= 3 ? (min-1)/2*0.35 :
                  min <= 5 ? 0.35 + (min-3)/2*0.4 :
                  Math.min(1.0, 0.75 + (min-5)*0.05);

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
                    ease:"Quad.easeOut", onComplete:()=>{ try{sp.destroy();}catch(e){} }});
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
        font:"bold 14px 'Courier New'",
        color:"#ffffff", stroke:"#000", strokeThickness:5, letterSpacing:3
    }).setOrigin(0.5).setAlpha(0).setDepth(655);
    S.tweens.add({targets:hidLbl, alpha:1, duration:180, ease:"Back.easeOut"});
    S.time.delayedCall(2000, ()=>S.tweens.add({targets:hidLbl, alpha:0, duration:250,
        onComplete:()=>{ try{hidLbl.destroy();}catch(e){} }}));

    // 4. Synergy ismi — büyük, parlayan
    const nameTxt = S.add.text(W/2, H/2-36, label, {
        font:"bold 22px 'Courier New'",
        color: "#"+syn.color.toString(16).padStart(6,"0"),
        stroke:"#000000", strokeThickness:8, letterSpacing:4
    }).setOrigin(0.5).setAlpha(0).setDepth(656).setScale(0.3);
    S.tweens.add({targets:nameTxt, alpha:1, scaleX:1.08, scaleY:1.08,
        duration:200, ease:"Back.easeOut",
        onComplete:()=>S.tweens.add({targets:nameTxt,scaleX:1,scaleY:1,duration:100})});
    S.time.delayedCall(2200, ()=>S.tweens.add({targets:nameTxt, alpha:0, y:nameTxt.y-20,
        duration:300, onComplete:()=>{ try{nameTxt.destroy();}catch(e){} }}));

    // 5. Halka patlaması
    for(let i=0;i<4;i++){
        S.time.delayedCall(i*60, ()=>{
            const r=S.add.graphics().setDepth(654);
            r.x=W/2; r.y=H/2;
            r.lineStyle(3-Math.min(i,2), syn.color, 1.0);
            r.strokeCircle(0, 0, 10+i*18);
            S.tweens.add({targets:r, scaleX:14, scaleY:14, alpha:0,
                duration:550, ease:"Quad.easeOut",
                onComplete:()=>{ try{r.destroy();}catch(e){} }});
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
                onComplete:()=>{ try{sp.destroy();}catch(e){} }});
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
    const typeC={normal:0xffcc55,zigzag:0x44ff88,fast:0xff4422,tank:0xaa44ff,
        shield:0x4488ff,kamikaze:0xff6600,ghost:0x88aacc,elder:0xffcc44,
        titan:0x9900dd,colossus:0xff2266,healer:0x00ff88,berserker:0xff0000,
        inferno:0xFF3300,glacier:0x44ccff,phantom_tri:0xcc44ff,volt:0xffee00,obsidian:0x6600aa};
    const voltCols=[0xffee00,0xffffff,0x88ffff];
    const col=type==="volt"?voltCols[Math.floor(Math.random()*3)]:type==="inferno"?[0xff3300,0xff8800][Math.floor(Math.random()*2)]:(typeC[type]||0xddbb88);
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
                try{db.destroy();}catch(e){}
                _debrisCount=Math.max(0,_debrisCount-1);
            }
        });
    }
}

// ── 2. BUILD TITLE SİSTEMİ ─────────────────────────────────────
function getBuildTitle(){
    const actSyn=SYNERGIES.filter(s=>s.active).map(s=>s.id);
    const hasUpg=k=>UPGRADES[k]&&UPGRADES[k].level>0;

    // Sinerji bazlı isimler (öncelikli)
    if(actSyn.includes("toxic_fire"))      return {tr:"🔥 ZEHİR TANRISI",    en:"🔥 POISON GOD",      ru:"🔥 БОГ ЯДА",       c:0xff6600};
    if(actSyn.includes("chain_storm"))     return {tr:"⚡ ŞİMŞEK CELLADI",   en:"⚡ LIGHTNING REAPER", ru:"⚡ ПОЖНЕЦ МОЛНИЙ", c:0xffff44};
    if(actSyn.includes("saw_orbit"))       return {tr:"💀 ÖLÜM ÇEMBERİ",    en:"💀 DEATH CIRCLE",    ru:"💀 КРУГ СМЕРТИ",   c:0xcccccc};
    if(actSyn.includes("cryo_shatter"))    return {tr:"❄ BEDEN DONDURUCU",  en:"❄ FLESH FREEZER",   ru:"❄ ЗАМОРОЗЧИК",    c:0x88ddff};
    if(actSyn.includes("laser_focus"))     return {tr:"🎯 LAZER USTA",       en:"🎯 LASER MASTER",    ru:"🎯 МАСТЕР ЛАЗЕРА", c:0xff2200};
    if(actSyn.includes("meteor_explosion"))return {tr:"☄ METEOR LORDU",     en:"☄ METEOR LORD",     ru:"☄ ЛОРД МЕТЕОРОВ",  c:0xff8800};
    if(actSyn.some(s=>s.startsWith("hidden"))) return {tr:"✦ GİZEM VALİSİ",en:"✦ MYSTERY HERALD",   ru:"✦ ВЕСТНИК ТАЙНЫ",  c:0xcc44ff};

    // Güçlü upgrade kombinasyonu
    const dmgLv=(UPGRADES.damage?.level||0)+(UPGRADES.crit?.level||0);
    const weaponLv=(UPGRADES.laser?.level||0)+(UPGRADES.lightning?.level||0)+(UPGRADES.meteor?.level||0);
    if(hasUpg("drone")&&hasUpg("lightning"))   return {tr:"🤖 DRONE FIRTINASI",en:"🤖 DRONE STORM",   ru:"🤖 РОЙ ДРОНОВ",   c:0x00ffff};
    if(hasUpg("orbit")&&hasUpg("explosive"))   return {tr:"💥 PATLAYAN ÇARK",  en:"💥 BLAST WHEEL",   ru:"💥 ВЗРЫВНОЕ КОЛЕСО",c:0xff8800};
    if(hasUpg("poison")&&hasUpg("flame"))      return {tr:"☣ TOKSİK EJDER",  en:"☣ TOXIC DRAGON",   ru:"☣ ЯДОВИТЫЙ ДРАКОН",c:0x66ff44};
    if(dmgLv>=6)                               return {tr:"💀 HASAR CANAVARASI",en:"💀 DAMAGE BEAST",  ru:"💀 МОНСТР УРОНА",  c:0xff3344};
    if(weaponLv>=4)                            return {tr:"🌩 SİLAH USTASI",   en:"🌩 WEAPON MASTER", ru:"🌩 МАСТЕР ОРУЖИЯ", c:0x4488ff};

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
        font:"bold 15px 'Courier New'",
        color:"#"+info.c.toString(16).padStart(6,"0"),
        stroke:"#000000",strokeThickness:5,letterSpacing:2,
        wordWrap:{width:220},align:"center"
    }).setOrigin(0.5).setDepth(621).setAlpha(0);

    S.tweens.add({targets:[bg,lbl],alpha:1,duration:280,ease:"Back.easeOut"});
    
    S.cameras.main.zoomTo(1.06,120,"Quad.easeOut");
    S.time.delayedCall(120,()=>S.cameras.main.zoomTo(1.0,300,"Quad.easeIn"));

    S.time.delayedCall(2800,()=>{
        S.tweens.add({targets:[bg,lbl],alpha:0,duration:320,ease:"Quad.easeIn",
            onComplete:()=>{try{bg.destroy();lbl.destroy();}catch(e){}}});
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
    const typeC={normal:0xffcc55,zigzag:0x44ff88,fast:0xff4422,tank:0xaa44ff,
        shield:0x4488ff,kamikaze:0xff6600,ghost:0x88aacc,elder:0xffcc44,
        titan:0x9900dd,colossus:0xff2266,healer:0x00ff88,berserker:0xff0000,
        inferno:0xFF3300,glacier:0x44ccff,phantom_tri:0xcc44ff,volt:0xffee00,obsidian:0x6600aa};
    const col=typeC[type]||0xffaa44;

    // 1. Genişleyen halka — ince, temiz
    const ring=S.add.graphics().setDepth(21);
    ring.x=x; ring.y=y;
    ring.lineStyle(2,col,0.75); ring.strokeCircle(0,0,7);
    S.tweens.add({targets:ring,scaleX:3.0,scaleY:3.0,alpha:0,
        duration:200,ease:"Quad.easeOut",onComplete:()=>{try{ring.destroy();}catch(e){}}});

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
            onComplete:()=>{try{pc.destroy();}catch(e){}}});
    }
    // shake wrapper zaten cap'liyor — olduğu gibi bırak
    S.cameras.main.shake(30,0.004);
}


// ════════════════════════════════════════════════════════════════
// AAA VFX MODULE  —  Not Today v9.0 VFX Engine
// ════════════════════════════════════════════════════════════════

// ── GLOBAL VFX STATE ─────────────────────────────────────────
const _VFX={
    glowOverlay:null, chromR:null, chromB:null, vignette:null,
    comboAura:null, comboRing:null, groundFlash:null,
    _comboRingAngle:0, _chromaticActive:false, _chromaticTimer:0,
    _hurtFlashTimer:0, _glowPulseT:0, _idleT:0, _initialized:false,
};

// ── INIT — SceneGame.create() içinde çağrılır ────────────────
function initVFX(S){
    if(!S||!S.add) return;
    _VFX._initialized=true;
    _VFX.glowOverlay=S.add.graphics().setDepth(200).setAlpha(0);
    _VFX.chromR=S.add.graphics().setDepth(201).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    _VFX.chromB=S.add.graphics().setDepth(201).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    _VFX.vignette=S.add.graphics().setDepth(199).setAlpha(0.28);
    _drawVignette();
    _VFX.comboAura=S.add.graphics().setDepth(14).setAlpha(0);
    _VFX.comboRing=S.add.graphics().setDepth(14).setAlpha(0);
    _VFX.groundFlash=S.add.graphics().setDepth(5).setAlpha(0);
}

function _drawVignette(){
    if(!_VFX.vignette) return;
    const g=_VFX.vignette; g.clear();
    const W=360,H=640,d=72;
    g.fillGradientStyle(0x000000,0x000000,0x000000,0x000000,0.58,0.58,0,0); g.fillRect(0,0,W,d);
    g.fillGradientStyle(0x000000,0x000000,0x000000,0x000000,0,0,0.58,0.58); g.fillRect(0,H-d,W,d);
    g.fillGradientStyle(0x000000,0x000000,0x000000,0x000000,0.46,0,0.46,0); g.fillRect(0,0,d,H);
    g.fillGradientStyle(0x000000,0x000000,0x000000,0x000000,0,0.46,0,0.46); g.fillRect(W-d,0,d,H);
}

// ── TICK — SceneGame.update() içinde çağrılır ────────────────
function tickVFX(S,delta){
    if(!_VFX._initialized||!GS) return;
    const dt=delta/1000;
    _VFX._glowPulseT+=dt; _VFX._idleT+=dt;

    // Chromatic sönümü
    if(_VFX._chromaticActive){
        _VFX._chromaticTimer-=delta;
        if(_VFX._chromaticTimer<=0){
            _VFX._chromaticActive=false;
            if(_VFX.chromR) _VFX.chromR.setAlpha(0);
            if(_VFX.chromB) _VFX.chromB.setAlpha(0);
        } else {
            const p=Math.min(1,_VFX._chromaticTimer/130);
            if(_VFX.chromR) _VFX.chromR.setAlpha(p*0.22);
            if(_VFX.chromB) _VFX.chromB.setAlpha(p*0.18);
        }
    }

    // Hurt vignette flash sönümü
    if(_VFX._hurtFlashTimer>0){
        _VFX._hurtFlashTimer-=delta;
        const p=Math.max(0,_VFX._hurtFlashTimer/350);
        if(_VFX.vignette) _VFX.vignette.setAlpha(0.28+p*0.55);
    } else {
        if(_VFX.vignette) _VFX.vignette.setAlpha(0.28);
    }

    // Combo aurası
    const combo=GS.combo||0;
    if(combo>=3&&S.player&&S.player.active){
        _tickComboAura(S,combo,dt);
    } else {
        if(_VFX.comboAura) _VFX.comboAura.setAlpha(Math.max(0,(_VFX.comboAura.alpha||0)-dt*4));
        if(_VFX.comboRing) _VFX.comboRing.setAlpha(Math.max(0,(_VFX.comboRing.alpha||0)-dt*4));
    }
}

function _tickComboAura(S,combo,dt){
    if(!S.player||!_VFX.comboAura) return;
    const px=S.player.x,py=S.player.y;
    const t=_VFX._glowPulseT;
    const intensity=Math.min(1,combo/15);
    const col=combo>=15?0xffcc00:combo>=9?0xff2244:0xff8800;
    const col2=combo>=15?0xffee88:combo>=9?0xff4466:0xffaa44;
    const aura=_VFX.comboAura;
    aura.clear();
    const r1=26+Math.sin(t*3.2)*4+combo*0.8;
    aura.fillStyle(col,0.06+intensity*0.08); aura.fillCircle(px,py,r1*1.8);
    aura.fillStyle(col2,0.12+intensity*0.08); aura.fillCircle(px,py,r1);
    if(combo>=5){
        const dotCount=Math.min(8,Math.floor(combo/2));
        for(let i=0;i<dotCount;i++){
            const a=t*2.1+i*(Math.PI*2/dotCount);
            const r=r1*(0.6+Math.sin(t*1.8+i)*0.2);
            aura.fillStyle(0xffffff,0.55+Math.sin(t*4+i)*0.3);
            aura.fillRect(px+Math.cos(a)*r-1,py+Math.sin(a)*r*0.55-1,2,2);
        }
    }
    aura.setAlpha(Math.min(1,aura.alpha+dt*5));
    _VFX._comboRingAngle+=dt*(1.5+intensity*2.5);
    const ring=_VFX.comboRing; ring.clear();
    if(combo>=7){
        const segs=Math.min(6,2+Math.floor(combo/4));
        for(let i=0;i<segs;i++){
            const a=_VFX._comboRingAngle+i*(Math.PI*2/segs);
            ring.fillStyle(col,0.85);
            ring.fillRect(px+Math.cos(a)*(r1+6)-1.5,py+Math.sin(a)*(r1+6)*0.55-1.5,3,3);
        }
        ring.lineStyle(1.5,col,0.3+intensity*0.4);
        ring.strokeEllipse(px,py,(r1+6)*2,(r1+6)*1.1);
    }
    ring.setAlpha(Math.min(1,ring.alpha+dt*5));
}

function _triggerChromatic(S,x,y,duration){
    // Chromatic aberration devre dışı — göz yorucu
    // Gelecekte bir ayar ile açılabilir
}

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
            onComplete:()=>{try{rg.destroy();}catch(e){}}});
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
            duration:160+tier*30,ease:"Quad.easeOut",onComplete:()=>{try{ray.destroy();}catch(e){}}});
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
                onComplete:()=>{try{sp.destroy();}catch(e){}}});
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
            onComplete:()=>{try{crack.destroy();}catch(e){}}});

        // Tier 3: minimal text — "✦ PERFECT" sadece
        const gText=S.add.text(ex,ey-8,"✦ PERFECT",{
            font:"bold 10px 'Courier New'",color:"#ffee00",stroke:"#000000",strokeThickness:3,
        }).setOrigin(0.5).setDepth(32).setAlpha(0).setScale(0.5);
        S.tweens.add({targets:gText,alpha:1,scaleX:1.1,scaleY:1.1,y:ey-30,
            duration:200,ease:"Back.easeOut",
            onComplete:()=>{
                S.tweens.add({targets:gText,alpha:0,y:ey-50,duration:300,delay:400,ease:"Quad.easeIn",
                    onComplete:()=>{try{gText.destroy();}catch(e){}}});
            }});
    }
}

// ── NORMAL HIT VFX ───────────────────────────────────────────
function vfxNormalHit(S,ex,ey,isCrit){
    if(!S||!S.add) return;
    if(isCrit){
        // Sadece ince halka + 4 kıvılcım — büyük dolu daire YOK
        const cRing=S.add.graphics().setDepth(24);
        cRing.x=ex; cRing.y=ey;
        cRing.lineStyle(1.8,0xffee00,0.85); cRing.strokeCircle(0,0,6);
        S.tweens.add({targets:cRing,scaleX:2.8,scaleY:2.8,alpha:0,duration:160,ease:"Quad.easeOut",
            onComplete:()=>{try{cRing.destroy();}catch(e){}}});
        for(let i=0;i<4;i++){
            const ang=Phaser.Math.DegToRad(i*90+Phaser.Math.Between(-15,15));
            const spd=Phaser.Math.Between(12,32);
            const dp=S.add.graphics().setDepth(23);
            dp.x=ex; dp.y=ey;
            dp.lineStyle(1.2,i%2?0xffee44:0xffffff,0.85);
            dp.lineBetween(0,0,Math.cos(ang)*4,Math.sin(ang)*4);
            S.tweens.add({targets:dp,
                x:ex+Math.cos(ang)*spd,y:ey+Math.sin(ang)*spd*0.6,
                alpha:0,scaleY:0.1,duration:Phaser.Math.Between(100,160),ease:"Quad.easeOut",
                onComplete:()=>{try{dp.destroy();}catch(e){}}});
        }
    } else {
        // Kum/toz parçacıkları — küçük nokta çizgiler, dikdörtgen YOK
        const dustCols=[0xddbb88,0xccaa66,0xeedd99,0xbb9955];
        for(let i=0;i<5;i++){
            const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
            const spd=Phaser.Math.Between(8,24);
            const dp=S.add.graphics().setDepth(17);
            dp.x=ex; dp.y=ey;
            dp.lineStyle(1,dustCols[i%dustCols.length],0.7);
            dp.lineBetween(0,0,Math.cos(ang)*2,Math.sin(ang)*2);
            S.tweens.add({targets:dp,
                x:ex+Math.cos(ang)*spd,y:ey+Math.sin(ang)*spd*0.5,
                alpha:0,scaleX:0.1,scaleY:0.1,duration:Phaser.Math.Between(100,200),ease:"Quad.easeOut",
                onComplete:()=>{try{dp.destroy();}catch(e){}}});
        }
    }
}

// ── ENEMY DEATH VFX (elite/boss sınıfı düşmanlar) ───────────
function vfxEnemyDeath(S,x,y,type,scale){
    if(!S||!S.add) return;
    const typeColors={normal:0xffcc55,zigzag:0x44ff88,fast:0xff4422,tank:0xaa44ff,
        shield:0x4488ff,kamikaze:0xff6600,ghost:0x88aacc,elder:0xffcc44,
        titan:0x9900dd,colossus:0xff2266,healer:0x00ff88,berserker:0xff0000,
        inferno:0xFF3300,glacier:0x44ccff,phantom_tri:0xcc44ff,volt:0xffee00,obsidian:0x6600aa};
    const col=typeColors[type]||0xffaa44;
    const sz=Math.min(scale||1, 1.8); // cap scale etkisini sınırla

    // Shockwave halkası — sadece ince çizgi, dolu daire YOK
    const ring=S.add.graphics().setDepth(21);
    ring.x=x; ring.y=y;
    ring.lineStyle(2.5,col,0.85); ring.strokeCircle(0,0,8*sz);
    ring.lineStyle(1,0xffffff,0.5); ring.strokeCircle(0,0,5*sz);
    S.tweens.add({targets:ring,scaleX:4+sz,scaleY:4+sz,alpha:0,
        duration:280,ease:"Quad.easeOut",
        onComplete:()=>{try{ring.destroy();}catch(e){}}});

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
            onComplete:()=>{try{pc.destroy();}catch(e){}}});
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
            onComplete:()=>{try{sm.destroy();}catch(e){}}});
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
                duration:380+ri*45,ease:"Quad.easeOut",onComplete:()=>{try{mr.destroy();}catch(e){}}});
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
                onComplete:()=>{try{jet.destroy();}catch(e){}}});
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
                onComplete:()=>{try{ray.destroy();}catch(e){}}});
        }
        const mcTxt=S.add.text(px,py-16,"🌟 MAX KOMBO!",{
            font:"bold 13px 'Courier New'",color:"#ffcc00",stroke:"#000",strokeThickness:5,
        }).setOrigin(0.5).setDepth(36).setAlpha(0).setScale(0.6);
        S.tweens.add({targets:mcTxt,alpha:1,scaleX:1.0,scaleY:1.0,y:py-44,
            duration:260,ease:"Back.easeOut",
            onComplete:()=>{
                S.tweens.add({targets:mcTxt,alpha:0,y:py-68,duration:380,delay:700,ease:"Quad.easeIn",
                    onComplete:()=>{try{mcTxt.destroy();}catch(e){}}});
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
    // Oyuncu etrafı halkalar
    if(S.player){
        const plx=S.player.x,ply=S.player.y;
        for(let ri=0;ri<3;ri++){
            S.time.delayedCall(ri*60,()=>{
                const rg=S.add.graphics().setDepth(598);
                rg.x=plx; rg.y=ply;
                rg.lineStyle(3-ri,0x88ddff,0.7-ri*0.1); rg.strokeCircle(0,0,10+ri*3);
                S.tweens.add({targets:rg,scaleX:8+ri*2,scaleY:8+ri*2,alpha:0,
                    duration:450+ri*70,ease:"Quad.easeOut",onComplete:()=>{try{rg.destroy();}catch(e){}}});
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
                    onComplete:()=>{try{col.destroy();}catch(e){}}});
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
        onComplete:()=>{try{burst.destroy();}catch(e){}}});
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
            onComplete:()=>{try{pc.destroy();}catch(e){}}});
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
                    "✦",{font:"14px 'Courier New'",color:"#ffcc00"}
                ).setDepth(212).setAlpha(0).setScale(0.6);
                S.tweens.add({targets:st,alpha:0.9,scaleX:1.2,scaleY:1.2,
                    y:st.y+Phaser.Math.Between(40,80),duration:Phaser.Math.Between(400,700),ease:"Quad.easeIn",
                    onComplete:()=>{
                        S.tweens.add({targets:st,alpha:0,duration:150,
                            onComplete:()=>{try{st.destroy();}catch(e){}}});
                    }});
            });
        }
    }
}

// ── PLAYER HURT VFX ──────────────────────────────────────────
function vfxPlayerHurt(S){
    if(!S||!S.add) return;
    // Vignette kırmızıya döner (flash YOK)
    _VFX._hurtFlashTimer=320;
    // Chromatic — kısa
    _triggerChromatic(S,180,320,120);
    // Oyuncu etrafında kırmızı halka
    if(S.player){
        const ring=S.add.graphics().setDepth(25);
        ring.x=S.player.x; ring.y=S.player.y;
        ring.lineStyle(3,0xff2222,0.9); ring.strokeCircle(0,0,16);
        S.tweens.add({targets:ring,scaleX:3.0,scaleY:3.0,alpha:0,duration:240,ease:"Quad.easeOut",
            onComplete:()=>{try{ring.destroy();}catch(e){}}});
    }
}

// ── BUTTON JUICE — isteğe bağlı UI polish ────────────────────
function addButtonJuice(S,btn,cb){
    if(!btn||!btn.on) return;
    const oSX=btn.scaleX||1, oSY=btn.scaleY||1;
    btn.on("pointerover",()=>{
        if(!S||!S.tweens) return;
        S.tweens.add({targets:btn,scaleX:oSX*1.08,scaleY:oSY*1.08,duration:80,ease:"Back.easeOut"});
    });
    btn.on("pointerout",()=>{
        if(!S||!S.tweens) return;
        S.tweens.add({targets:btn,scaleX:oSX,scaleY:oSY,duration:120,ease:"Back.easeOut"});
    });
    btn.on("pointerdown",()=>{
        if(!S||!S.tweens) return;
        S.tweens.add({targets:btn,scaleX:oSX*0.88,scaleY:oSY*0.88,duration:55,ease:"Quad.easeOut",
            onComplete:()=>{
                if(!S.tweens) return;
                S.tweens.add({targets:btn,scaleX:oSX*1.12,scaleY:oSY*1.12,duration:90,ease:"Back.easeOut",
                    onComplete:()=>{
                        if(!S.tweens) return;
                        S.tweens.add({targets:btn,scaleX:oSX,scaleY:oSY,duration:80,ease:"Quad.easeOut"});
                        if(cb) cb();
                    }});
            }});
        const bx=btn.x||180,by=btn.y||300;
        for(let i=0;i<6;i++){
            const ang=Phaser.Math.DegToRad(Phaser.Math.Between(0,360));
            const sp=S.add.graphics().setDepth(50);
            sp.fillStyle(0xffffff,0.8); sp.fillRect(-1,-1,2,4);
            sp.x=bx+Phaser.Math.Between(-20,20); sp.y=by+Phaser.Math.Between(-8,8);
            S.tweens.add({targets:sp,x:sp.x+Math.cos(ang)*22,y:sp.y+Math.sin(ang)*12,
                alpha:0,duration:180,ease:"Quad.easeOut",onComplete:()=>{try{sp.destroy();}catch(e){}}});
        }
    });
}

// ════════════════════════════════════════════════════════════════
// PHASER CONFIG + BOOT
// ════════════════════════════════════════════════════════════════
function _startPhaserGame(){
    // ── GLOBAL CSS DÜZELTME ──────────────────────────────────────
    // Telegram WebView ve mobil tarayıcılarda touch-action "auto" olduğunda
    // tarayıcı scroll/swipe hareketleri Phaser'ın pointer event'lerinden önce
    // ele geçirir. Aşağıdaki CSS bunu tamamen engeller.
    const styleTag = document.createElement("style");
    styleTag.textContent = `
        #game-container, #game-container canvas {
            touch-action: none !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
            overscroll-behavior: none !important;
        }
        body, html {
            overscroll-behavior: none !important;
            overflow: hidden !important;
            touch-action: none !important;
        }
    `;
    document.head.appendChild(styleTag);
    // Bu adımlar OLMADAN Telegram'da dokunma koordinatları kayar,
    // Telegram'ın kendi swipe/scroll handler'ı Phaser pointer event'lerini yutar.
    const tgApp = window.Telegram && window.Telegram.WebApp;
    if(tgApp){
        try{ tgApp.ready(); }catch(e){}           // Telegram'a hazır olduğumuzu bildir
        try{ tgApp.expand(); }catch(e){}           // Tam ekrana aç — koordinat kaymasını önler
        try{ tgApp.disableVerticalSwipes(); }catch(e){} // Telegram'ın dikey swipe'ını kapat
        // Arka plan rengini siyah yap — beyaz flash olmasın
        try{ tgApp.setBackgroundColor("#000000"); }catch(e){}
        try{ tgApp.setHeaderColor("#000000"); }catch(e){}
    }

    // ── CANVAS TOUCH-ACTION DÜZELTME ────────────────────────────
    // Phaser canvas'ı oluşturduktan sonra touch-action'ı "none" yap.
    // Tarayıcı/Telegram varsayılan scroll davranışı pointer event'leri
    // kesiyor; "none" tüm dokunmaları Phaser'a iletir.
    const fixCanvasTouchAction = () => {
        const canvas = document.querySelector("#game-container canvas");
        if(canvas){
            canvas.style.touchAction = "none";
            canvas.style.userSelect = "none";
            canvas.style.webkitUserSelect = "none";
            canvas.style.msTouchAction = "none";
        } else {
            // Canvas henüz yoksa kısa süre sonra tekrar dene
            setTimeout(fixCanvasTouchAction, 100);
        }
    };
    setTimeout(fixCanvasTouchAction, 200);

    // Epilepsi uyarısı HER ZAMAN ilk gösterilir
    const config={
        type:Phaser.AUTO, width:360, height:640,
        backgroundColor:"#000000",
        parent:"game-container",
        physics:{default:"arcade",arcade:{gravity:{y:0},debug:false}},
        scene:[SceneEpilepsy,SceneIntro,SceneMenu,SceneGame],
        scale:{
            mode:Phaser.Scale.FIT,
            autoCenter:Phaser.Scale.CENTER_BOTH,
            width:360,
            height:640,
            parent:"game-container",
            expandParent:false,
        },
        render:{antialias:false,antialiasGL:false,pixelArt:true,roundPixels:true},
        input:{
            // Telegram'ın passive event listener'ları ile çakışmayı önle
            activePointers:1,
        },
    };
    const game = new Phaser.Game(config);

    // Phaser canvas oluşturulunca touch-action'ı tekrar garantile
    game.events.once("ready", ()=>{
        fixCanvasTouchAction();
        // Viewport yüksekliği değişirse (Telegram klavye açılması vb.) resize et
        if(tgApp){
            tgApp.onEvent("viewportChanged", ()=>{
                try{ game.scale.refresh(); }catch(e){}
            });
        }
    });
    // SceneEpilepsy otomatik başlar (sahne listesinin ilki)
}
// DOMContentLoaded çoktan geçmişse direkt başlat, geçmemişse bekle
if(document.readyState==="loading"){
    window.addEventListener("DOMContentLoaded", _startPhaserGame);
} else {
    _startPhaserGame();
}
