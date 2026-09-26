// 철학자 아바타 — 초상화를 보고 그린 사실적 일러스트(SVG) + 눈 깜빡임·입 움직임 + 브라우저 음성(Web Speech API, 무료) + 대화창.
// 원형: philo-agent frontend/src/components/Avatar.jsx · useSpeech.js · PersonaPanel.jsx(유휴 명언).
// 참고 초상: 데카르트 = Frans Hals(1649경), 스피노자 = 작자 미상(1665경). 목소리는 브라우저 합성음이다.
(function () {
  // ---------- 얼굴 ----------
  // 좌표계 200×240. 눈 y≈104, 코끝 y≈138, 입 y≈155, 턱 y≈180.
  // 스피노자 곱슬머리 — 옆으로 풍성하게 흘러내리는 불규칙한 작은 곱슬(규칙적인 가발 모양이 되지 않게 흔든다)
  function spinozaCurls() {
    const out = [], rnd = (i) => (Math.sin(i * 12.9898) * 43758.5453) % 1;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 16; i++) {
        const t = i / 15, j = Math.abs(rnd(i + (side > 0 ? 50 : 0)));
        const x = 100 + side * (44 + 16 * Math.sin(t * Math.PI * 0.9) + j * 6);
        out.push([x, 78 + t * 128 + j * 4, 7 + j * 4]);
        if (i % 2 === 0) out.push([x - side * (9 + j * 3), 90 + t * 110, 6 + j * 3]);
      }
    }
    for (let k = 0; k < 7; k++) { // 정수리는 매끈하게, 관자놀이 쪽에만 작은 곱슬
      const a = Math.PI * (1.15 + k * 0.1), j = Math.abs(rnd(k + 99));
      out.push([100 + Math.cos(a) * 52, 80 + Math.sin(a) * 46 + (k > 1 && k < 5 ? 6 : 0), 6 + j * 3]);
    }
    return out;
  }

  const FACES = {
    // 데카르트 — 넓은 얼굴, 가운데 가르마의 어깨까지 오는 물결 머리, 무거운 눈꺼풀, 긴 코와 둥근 코끝,
    // 불그스름한 뺨, 아래로 처진 가는 콧수염, 아랫입술 밑 작은 수염, 흰 네모 깃, 검은 망토. 살짝 비꼬는 듯한 입매.
    descartes: {
      skin: ["#f0cfb0", "#dfae88", "#b98463"], cheek: "#d8806a", hair: ["#2a1c14", "#4a3322", "#6b4c33"], eye: "#3b2a1f",
      face: "M64 96 C64 68 80 56 100 56 C122 56 138 68 138 96 C139 124 134 150 123 166 C115 178 106 183 100 183 C92 183 84 178 77 167 C66 151 63 124 64 96 Z",
      hairBack: "M40 196 C26 158 30 116 38 86 C46 50 70 32 100 32 C132 32 158 50 164 86 C172 116 174 160 160 200 C150 210 138 204 136 188 C142 160 140 130 136 112 L66 112 C62 132 60 162 66 190 C60 206 48 206 40 196 Z",
      hairFront: ["M100 38 C82 38 66 50 60 72 C57 86 60 102 63 112 C66 92 74 76 88 64 C95 58 99 50 100 42 Z",
                  "M100 42 C101 50 105 58 112 64 C126 76 134 92 137 112 C140 102 143 86 140 72 C134 50 118 38 100 38 Z"],
      waves: ["M46 120 C38 132 48 144 40 158 C34 170 46 180 42 192", "M56 104 C48 118 58 132 50 146 C44 160 56 172 52 186", "M64 116 C58 130 66 142 60 156",
              "M156 120 C164 132 154 144 162 158 C168 170 156 180 160 192", "M146 104 C154 118 144 132 152 146 C158 160 146 172 150 186", "M138 116 C144 130 136 142 142 156",
              "M70 60 C80 50 92 46 100 44", "M130 60 C120 50 108 46 100 44", "M76 58 C84 52 94 48 100 46"],
      brows: ["M71 93 C78 87 88 86 95 90", "M105 90 C112 86 122 87 129 93"], browW: 4.2,
      eyes: { lx: 84, rx: 116, y: 105, rw: 8.5, rh: 3.8, iris: 3.6, heavy: true },
      nose: "M97 100 C95 113 93 126 91 133 C88 139 93 144 100 144 C107 144 112 139 109 133 C107 126 105 113 103 100",
      nostrils: [[94, 140], [106, 140]], noseTip: [100, 137, 6],
      moustache: "M85 151 C89 146 95 145 100 147.5 C105 145 111 146 115 151 C111 149 105 149.5 100 151 C95 149.5 89 149 85 151 Z",
      moustacheEnds: ["M85.5 150.5 C84 152 83.5 154 84 156", "M114.5 150.5 C116 152 116.5 154 116 156"],
      lips: { y: 155, w: 11, upper: "#9a4b3e", lower: "#b86a58" }, smirk: 1.2,
      tuft: "M96.5 162 C97.5 169 102.5 169 103.5 162 C101.5 163.5 98.5 163.5 96.5 162 Z",
      lines: ["M80 72 C92 69 108 69 120 72", "M83 78 C93 76 107 76 117 78", "M74 115 C77 119 81 121 86 121", "M126 115 C123 119 119 121 114 121", "M75 112 C78 114 81 115 84 115", "M125 112 C122 114 119 115 116 115", "M88 144 C85 148 84 152 85 157", "M112 144 C115 148 116 152 115 157"],
      collar: "M66 186 L134 186 L148 214 L100 223 L52 214 Z", collarLine: "M100 188 L100 222",
      coat: "M12 240 C18 206 42 190 68 186 L132 186 C158 190 182 206 188 240 Z",
      voice: { pitch: 0.95, rate: 1.0 },
    },
    // 스피노자 — 갸름한 달걀형 얼굴, 풍성한 검은 곱슬머리(어깨까지), 높고 둥근 눈썹, 크고 검은 아몬드형 눈,
    // 곧고 긴 코, 연필처럼 가는 콧수염, 붉고 도톰한 입술, 창백한 올리브빛 피부, 넓게 떨어지는 흰 깃, 검은 옷.
    spinoza: {
      skin: ["#f3dcc2", "#e2bb98", "#bf9470"], cheek: "#e0a08c", hair: ["#140f0c", "#271c16", "#3d2d22"], eye: "#1c1410",
      face: "M69 98 C69 71 82 56 100 56 C118 56 131 71 131 98 C132 126 127 150 119 164 C113 174 106 179 100 179 C94 179 87 174 81 164 C73 150 68 126 69 98 Z",
      hairBack: "M34 200 C22 160 26 112 36 82 C46 46 72 28 100 28 C128 28 154 46 164 82 C174 112 178 160 166 200 C154 214 136 208 134 190 C138 160 136 128 132 110 L68 110 C64 128 62 160 66 190 C64 208 46 214 34 200 Z",
      curls: spinozaCurls(),
      hairFront: ["M100 44 C84 44 72 52 66 66 C62 76 62 88 64 100 C68 84 76 72 88 66 C94 62 98 56 100 50 Z",
                  "M100 50 C102 56 106 62 112 66 C124 72 132 84 136 100 C138 88 138 76 134 66 C128 52 116 44 100 44 Z"],
      waves: ["M44 110 C40 124 46 136 42 150", "M40 158 C44 170 40 182 46 192", "M156 110 C160 124 154 136 158 150", "M160 158 C156 170 160 182 154 192"],
      brows: ["M74 93 C80 85 89 84 95 89", "M105 89 C111 84 120 85 126 93"], browW: 3,
      eyes: { lx: 85, rx: 115, y: 104, rw: 9.4, rh: 4.8, iris: 4.5, heavy: true },
      nose: "M98 98 C97 112 95 124 94 132 C92 138 96 142 100 142 C104 142 108 138 106 132 C105 124 103 112 102 98",
      nostrils: [[95, 139], [105, 139]], noseTip: [100, 136, 5],
      moustache: "M88 148 C93 145.5 97 146 100 147.2 C103 146 107 145.5 112 148",
      moustacheEnds: [],
      lips: { y: 154, w: 10, upper: "#a84a44", lower: "#c86a60" }, smirk: 0.4,
      tuft: "",
      lines: ["M77 114 C80 117 83 118 86 118", "M123 114 C120 117 117 118 114 118"],
      collar: "M80 180 L120 180 L136 214 L100 222 L64 214 Z", collarLine: "M100 182 L100 221",
      coat: "M14 240 C20 208 44 192 72 184 L128 184 C156 192 180 208 186 240 Z",
      voice: { pitch: 0.9, rate: 0.93 },
    },
  };

  function svg(id) {
    const f = FACES[id];
    if (!f) return `<svg viewBox="0 0 200 240"><circle cx="100" cy="120" r="100" fill="var(--av-bg)"/></svg>`;
    const [s1, s2, s3] = f.skin, [h1, h2, h3] = f.hair, E = f.eyes, L = f.lips, g = (n) => `${id}-${n}`;
    const eye = (cx) => `
      <ellipse cx="${cx}" cy="${E.y + 1.2}" rx="${E.rw + 2.5}" ry="${E.rh + 3}" fill="${s3}" opacity=".22"/>
      <ellipse cx="${cx}" cy="${E.y}" rx="${E.rw}" ry="${E.rh}" fill="#f7efe6"/>
      <circle cx="${cx + 0.6}" cy="${E.y + 0.3}" r="${E.iris}" fill="url(#${g("iris")})"/>
      <circle cx="${cx + 0.6}" cy="${E.y + 0.3}" r="${E.iris * 0.45}" fill="#0b0806"/>
      <circle cx="${cx + 1.9}" cy="${E.y - 1.2}" r="${E.iris * 0.28}" fill="#fff" opacity=".9"/>
      <path d="M${cx - E.rw - 1} ${E.y + 0.5} C${cx - E.rw / 2} ${E.y - E.rh - (E.heavy ? 1.2 : 2.2)} ${cx + E.rw / 2} ${E.y - E.rh - (E.heavy ? 1.2 : 2.2)} ${cx + E.rw + 1} ${E.y + 0.5}"
        stroke="#1f1510" stroke-width="${E.heavy ? 2.4 : 1.9}" fill="none" stroke-linecap="round"/>
      ${E.heavy ? `<path d="M${cx - E.rw} ${E.y - 1} C${cx - E.rw / 2} ${E.y - E.rh - 1} ${cx + E.rw / 2} ${E.y - E.rh - 1} ${cx + E.rw} ${E.y - 1} L${cx + E.rw} ${E.y - E.rh - 3} L${cx - E.rw} ${E.y - E.rh - 3} Z" fill="${s2}"/>` : ""}
      <path d="M${cx - E.rw + 1} ${E.y - E.rh - 4} C${cx - E.rw / 3} ${E.y - E.rh - 7} ${cx + E.rw / 3} ${E.y - E.rh - 7} ${cx + E.rw - 1} ${E.y - E.rh - 4}" stroke="${s3}" stroke-width="1" fill="none" opacity=".6"/>
      <path d="M${cx - E.rw + 1} ${E.y + E.rh + 1.5} C${cx - 2} ${E.y + E.rh + 4} ${cx + 2} ${E.y + E.rh + 4} ${cx + E.rw - 1} ${E.y + E.rh + 1.5}" stroke="${s3}" stroke-width="1" fill="none" opacity=".55"/>`;
    const lid = (cx) => `<ellipse cx="${cx}" cy="${E.y}" rx="${E.rw + 1.5}" ry="${E.rh + 1.5}" fill="${s2}"/>`;
    const hw = L.w, y = L.y, sm = f.smirk;
    return `<svg viewBox="0 0 200 240" role="img" aria-label="${id}">
      <defs>
        <radialGradient id="${g("skin")}" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="${s1}"/><stop offset=".7" stop-color="${s2}"/><stop offset="1" stop-color="${s3}"/></radialGradient>
        <linearGradient id="${g("hair")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${h2}"/><stop offset=".55" stop-color="${h1}"/><stop offset="1" stop-color="${h2}"/></linearGradient>
        <radialGradient id="${g("iris")}"><stop offset="0" stop-color="${f.eye}"/><stop offset="1" stop-color="#120c09"/></radialGradient>
        <radialGradient id="${g("cheek")}"><stop offset="0" stop-color="${f.cheek}" stop-opacity=".45"/><stop offset="1" stop-color="${f.cheek}" stop-opacity="0"/></radialGradient>
        <linearGradient id="${g("coat")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2926"/><stop offset="1" stop-color="#0f0e0d"/></linearGradient>
        <linearGradient id="${g("collar")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf9f4"/><stop offset="1" stop-color="#d9d4c8"/></linearGradient>
        <clipPath id="${g("clip")}"><circle cx="100" cy="120" r="100"/></clipPath>
      </defs>
      <g clip-path="url(#${g("clip")})">
      <rect width="200" height="240" fill="var(--av-bg)"/>
      <g class="av-head">
        <path d="${f.hairBack}" fill="url(#${g("hair")})"/>
        ${(f.curls || []).map(([x, yy, r]) => `<circle cx="${x}" cy="${yy}" r="${r}" fill="${h1}"/><path d="M${x - r * .6} ${yy} a${r * .6} ${r * .6} 0 1 1 ${r * .9} ${r * .4}" stroke="${h3}" stroke-width="1.6" fill="none" opacity=".55"/>`).join("")}
        <path d="${f.coat}" fill="url(#${g("coat")})"/>
        <path d="M86 160 L114 160 L116 188 L84 188 Z" fill="${s3}"/>
        <path d="M86 170 C95 176 105 176 114 170 L114 186 L86 186 Z" fill="#000" opacity=".18"/>
        <path d="${f.collar}" fill="url(#${g("collar")})"/>
        <path d="${f.collarLine}" stroke="#c9c3b6" stroke-width="1.1"/>
        <path d="${f.face}" fill="url(#${g("skin")})"/>
        <path d="${f.face}" fill="none" stroke="${s3}" stroke-width="1.2" opacity=".5"/>
        <ellipse cx="78" cy="130" rx="15" ry="11" fill="url(#${g("cheek")})"/>
        <ellipse cx="122" cy="130" rx="15" ry="11" fill="url(#${g("cheek")})"/>
        <path d="M68 128 C72 150 84 170 100 176 C88 168 78 150 74 130 Z" fill="${s3}" opacity=".18"/>
        ${f.hairFront.map((d) => `<path d="${d}" fill="url(#${g("hair")})"/>`).join("")}
        ${f.waves.map((d) => `<path d="${d}" stroke="${h3}" stroke-width="1.8" fill="none" opacity=".6" stroke-linecap="round"/>`).join("")}
        ${f.lines.map((d) => `<path d="${d}" stroke="${s3}" stroke-width="1" fill="none" opacity=".45" stroke-linecap="round"/>`).join("")}
        ${f.brows.map((d) => `<path d="${d}" stroke="${h1}" stroke-width="${f.browW}" fill="none" stroke-linecap="round"/>`).join("")}
        <g class="av-eyes">${eye(E.lx)}${eye(E.rx)}</g>
        <g class="av-lids">${lid(E.lx)}${lid(E.rx)}</g>
        <path d="${f.nose}" fill="${s3}" opacity=".28"/>
        <path d="M${f.noseTip[0] - 3} 104 C${f.noseTip[0] - 3.5} 116 ${f.noseTip[0] - 4} 126 ${f.noseTip[0] - 5} 132" stroke="${s1}" stroke-width="2.2" fill="none" opacity=".7" stroke-linecap="round"/>
        <circle cx="${f.noseTip[0]}" cy="${f.noseTip[1]}" r="${f.noseTip[2]}" fill="${s2}" opacity=".7"/>
        <circle cx="${f.noseTip[0] - 1.5}" cy="${f.noseTip[1] - 1.5}" r="${f.noseTip[2] * .4}" fill="${s1}" opacity=".8"/>
        ${f.nostrils.map(([x, yy]) => `<ellipse cx="${x}" cy="${yy}" rx="2.2" ry="1.3" fill="#3a221a" opacity=".7"/>`).join("")}
        <path d="M97 144 C98 147 102 147 103 144" stroke="${s3}" stroke-width="1" fill="none" opacity=".5"/>
        <g class="av-mouth">
          <ellipse class="av-open" cx="100" cy="${y + 1}" rx="${hw - 2}" ry="0.6" fill="#2a0c09"/>
          <ellipse class="av-teeth" cx="100" cy="${y + 0.6}" rx="${hw - 4.5}" ry="1.3" fill="#e3d6c3" opacity="0"/>
          <path d="M${100 - hw} ${y} C${100 - hw / 2} ${y - 2.6} ${100 + hw / 2} ${y - 2.6 - sm} ${100 + hw} ${y - sm} C${100 + hw / 2} ${y + 0.6} ${100 - hw / 2} ${y + 0.6} ${100 - hw} ${y} Z" fill="${L.upper}"/>
          <g class="av-jaw">
            <path d="M${100 - hw + 1.5} ${y + 0.8} C${100 - hw / 2} ${y + 5.2} ${100 + hw / 2} ${y + 5.2} ${100 + hw - 1.5} ${y + 0.8 - sm / 2} C${100 + hw / 2} ${y + 1.8} ${100 - hw / 2} ${y + 1.8} ${100 - hw + 1.5} ${y + 0.8} Z" fill="${L.lower}"/>
            <path d="M${100 - hw / 2} ${y + 3} C${100 - 2} ${y + 3.8} ${100 + 2} ${y + 3.8} ${100 + hw / 2} ${y + 3}" stroke="#fff" stroke-width=".8" opacity=".25" fill="none"/>
            ${f.tuft ? `<path d="${f.tuft}" fill="${h1}"/>` : ""}
          </g>
        </g>
        ${f.moustache.endsWith("Z") ? `<path d="${f.moustache}" fill="${h1}"/>` : `<path d="${f.moustache}" stroke="${h1}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`}
        ${f.moustacheEnds.map((d) => `<path d="${d}" stroke="${h1}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`).join("")}
      </g>
      </g>
      <circle class="av-ring" cx="100" cy="120" r="98" fill="none" stroke="var(--accent)" stroke-width="3" opacity="0"/>
    </svg>`;
  }

  // ---------- 목소리 ----------
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  let voices = [];
  const loadVoices = () => { voices = synth ? synth.getVoices() : []; };
  if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
  function pickVoice() {
    const ko = voices.filter((v) => (v.lang || "").toLowerCase().startsWith("ko"));
    // 남성 음성 우선(Windows 'InJoon', Google/기타 'male' 표기) → 없으면 아무 한국어 음성
    return ko.find((v) => /injoon|male|남성|minsang|hyunsu/i.test(v.name)) || ko[0] || null;
  }
  function speakable(t) {
    return String(t || "").replace(/[「」『』“”"]/g, "").replace(/\([^)]*\)/g, "").replace(/※/g, "").slice(0, 900);
  }

  // ---------- 패널 ----------
  const IDLE_MS = 25000;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // 수업 입장 코드(공개 사이트 대화용) — 한 번 물어 이 브라우저에 기억한다
  function classCode(reset) {
    let c = "";
    try { c = reset ? "" : localStorage.getItem("philo-class-code") || ""; } catch (e) { /* 저장소를 못 쓰면 매번 묻는다 */ }
    if (!c) {
      c = (window.prompt("수업 시간에 안내받은 입장 코드를 입력하세요") || "").trim();
      try { localStorage.setItem("philo-class-code", c); } catch (e) { /* 무시 */ }
    }
    return c;
  }

  window.PhiloAvatar = function mount(root, opts) {
    // opts: { api(path, init), askable: bool, name(id), quotesFor(id)→[...], section()→key|null, portraitBase }
    let pid = null, history = [], voiceOn = false, speaking = false, busy = false, last = Date.now(), quotes = [];
    root.innerHTML = `
      <div class="av-stage"><div class="av-face" id="avFace"></div>
        <div class="av-bubble" id="avBubble" hidden></div></div>
      <div class="av-head"><b id="avName"></b><span class="av-era" id="avEra"></span>
        <button class="mini" id="avVoice" title="목소리 켜기/끄기">🔈 목소리 끔</button></div>
      <div class="av-log" id="avLog"></div>
      <form class="av-form" id="avForm"><input id="avQ" maxlength="500" autocomplete="off"><button class="btn">묻기</button></form>
      <span id="avCredit" hidden></span>`;
    const $ = (s) => root.querySelector(s);

    // ---------- 입 움직임: 음절처럼 불규칙하게 열고 부드럽게 닫는다 ----------
    let mouthO = 0, mouthT = 0, nextSyl = 0, raf = 0;
    function mouthLoop(ts) {
      const face = $("#avFace"), open = face.querySelector(".av-open"), jaw = face.querySelector(".av-jaw"), teeth = face.querySelector(".av-teeth");
      if (speaking) {
        if (ts > nextSyl) { // 다음 음절: 90~190ms마다 0.25~1.0, 가끔 짧게 다문다
          mouthT = Math.random() < 0.14 ? 0.05 : 0.25 + Math.random() * 0.75;
          nextSyl = ts + 90 + Math.random() * 100;
        }
      } else mouthT = 0;
      mouthO += (mouthT - mouthO) * (mouthT > mouthO ? 0.45 : 0.28);
      if (open) {
        const o = mouthO;
        open.setAttribute("ry", (0.5 + o * 2.3).toFixed(2)); // 입안은 윗입술 아래 ~ 내려간 아랫입술 위까지만
        open.setAttribute("cy", (Number(open.dataset.cy ||= open.getAttribute("cy")) - 0.4 + o * 1.7).toFixed(2));
        teeth.setAttribute("opacity", Math.max(0, o * 1.1 - 0.35).toFixed(2));
        jaw.setAttribute("transform", `translate(0 ${(o * 3.4).toFixed(2)})`);
      }
      raf = (speaking || mouthO > 0.01) ? requestAnimationFrame(mouthLoop) : 0;
    }
    function setSpeaking(on) {
      speaking = on; $("#avFace").classList.toggle("speaking", on);
      if (on && !raf) raf = requestAnimationFrame(mouthLoop);
    }
    function pulse() { mouthT = 0.8 + Math.random() * 0.2; nextSyl = performance.now() + 120; } // 낱말 경계
    function thinking(on) { $("#avFace").classList.toggle("thinking", on); }
    function say(text) {
      if (!voiceOn || !synth || !text) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(speakable(text));
      const v = pickVoice(); if (v) u.voice = v;
      u.lang = "ko-KR"; const p = (FACES[pid] || { voice: { pitch: 1, rate: 1 } }).voice; u.pitch = p.pitch; u.rate = p.rate;
      u.onstart = () => setSpeaking(true); u.onend = u.onerror = () => setSpeaking(false);
      u.onboundary = (e) => { if (e.name === "word") pulse(); };
      synth.speak(u);
    }
    function bubble(text) { const b = $("#avBubble"); b.hidden = !text; b.textContent = text || ""; }
    function add(html, cls) { const d = document.createElement("div"); d.className = "av-msg " + cls; d.innerHTML = html; $("#avLog").append(d); d.scrollIntoView({ block: "end" }); return d; }
    function touch() { last = Date.now(); bubble(""); }

    $("#avVoice").onclick = () => {
      voiceOn = !voiceOn; $("#avVoice").textContent = voiceOn ? "🔊 목소리 켬" : "🔈 목소리 끔";
      $("#avVoice").classList.toggle("on", voiceOn);
      if (!synth && voiceOn) add("이 브라우저는 음성 합성을 지원하지 않습니다.", "sys");
      if (!voiceOn && synth) { synth.cancel(); setSpeaking(false); }
      else say(`안녕하세요, ${opts.name(pid)}입니다.`);
    };
    $("#avForm").onsubmit = async (e) => {
      e.preventDefault(); const q = $("#avQ").value.trim(); if (!q || busy) return;
      touch(); $("#avQ").value = ""; add(esc(q), "me");
      if (!opts.askable) { add("공개 사이트에서는 아직 대화 서버가 연결되지 않았습니다. 수업 중에 연결되면 질문할 수 있습니다.", "sys"); return; }
      busy = true; const wait = add("…", "bot"); thinking(true);
      try {
        const send = () => opts.api("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, philosopher: pid, mode: "persona", history, section: opts.section(), code: classCode() }) });
        let res = await send();
        if (res.status === 401) { classCode(true); res = await send(); } // 입장 코드가 틀리면 한 번 다시 묻는다
        const r = await res.json(); if (!res.ok) throw new Error(r.detail || res.status);
        let h = r.notice ? `<div class="notice">${esc(r.notice)}</div>` : "";
        h += esc(r.answer).replace(/\n/g, "<br>");
        if (r.beyond) h += `<div class="beyond"><b>수업 범위 밖 보충</b>${esc(r.beyond)}</div>`;
        if (r.question_back) h += `<div class="qb">${esc(r.question_back)}</div>`;
        if (r.sources?.length) h += `<div class="src">근거: ${r.sources.map((s) => `${s.week}주 ${esc(s.locator)}`).join(" · ")}</div>`;
        wait.innerHTML = h;
        history.push({ role: "user", content: q }, { role: "assistant", content: [r.answer, r.question_back].filter(Boolean).join("\n") });
        history = history.slice(-10);
        thinking(false); say([r.notice, r.answer, r.question_back].filter(Boolean).join(" "));
      } catch (err) { wait.innerHTML = `<div class="notice">오류: ${esc(err.message)}</div>`; thinking(false); }
      busy = false; touch();
    };

    // 유휴 시 수업 슬라이드에 인용된 그 철학자의 문장을 말한다
    setInterval(() => {
      if (!pid || busy || speaking || !quotes.length || Date.now() - last < IDLE_MS) return;
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      bubble(q); say(q); last = Date.now() - IDLE_MS / 2;
    }, 4000);

    return {
      ask(text) { $("#avQ").value = text; $("#avForm").requestSubmit(); },
      prefill(text) { $("#avQ").value = text; $("#avQ").focus(); },
      setPhilosopher(id, era) {
        if (id === pid) return;
        pid = id; history = []; touch(); if (synth) synth.cancel(); setSpeaking(false);
        $("#avFace").innerHTML = svg(id);
        $("#avCredit").textContent = FACES[id] ? `참고 초상: ${id === "descartes" ? "Frans Hals, 1649경" : "작자 미상, 1665경"} — 초상을 보고 그린 그림` : "";
        $("#avName").textContent = opts.name(id); $("#avEra").textContent = era || "";
        $("#avLog").innerHTML = `<div class="av-msg sys">${esc(opts.name(id))}에게 이 절의 내용을 물어보세요.${opts.askable ? "" : " (공개 사이트: 대화 서버 연결 전)"}</div>`;
        $("#avQ").placeholder = `${opts.name(id)}에게 질문하기`;
        quotes = []; Promise.resolve(opts.quotesFor(id)).then((q) => { if (pid === id) quotes = q || []; });
      },
    };
  };
})();
