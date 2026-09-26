// 철학자 아바타 — 초상화를 닮게 양식화한 SVG + 브라우저 음성(Web Speech API, 무료) + 대화창.
// 원형: philo-agent frontend/src/components/Avatar.jsx · useSpeech.js · PersonaPanel.jsx(유휴 명언).
// 실제 인물의 얼굴·목소리가 아니라 수업용 '연극적 매개'다.
(function () {
  // ---------- 얼굴 ----------
  // 데카르트: 프란스 할스 초상(1649) — 어깨까지 내려오는 짙은 갈색 머리(가운데 가르마), 가는 콧수염,
  //           아랫입술 밑 작은 수염, 무거운 눈꺼풀, 긴 코, 검은 옷에 흰 네모 깃.
  // 스피노자: 1665년경 초상 — 짙은 곱슬머리가 어깨까지, 가는 콧수염, 크고 검은 아몬드형 눈,
  //           둥근 눈썹, 갸름한 얼굴, 검은 옷에 흰 깃.
  const FACES = {
    descartes: {
      skin: "#e8c3a0", shade: "#d4a882", hair: "#3b2a1e", hairHi: "#56402e", coat: "#1f1d1c", collar: "#f3f1ea",
      brow: "M64 88 Q76 81 90 86 M110 86 Q124 81 136 88", eyeRy: 3.2, lid: true, curls: false,
      moustache: "M84 128 Q92 123 100 126 Q108 123 116 128 Q108 126 100 129 Q92 126 84 128 Z",
      tuft: "M96 140 Q100 147 104 140 Z", faceRx: 34, faceRy: 44, voice: { pitch: 0.95, rate: 1.0 },
    },
    spinoza: {
      skin: "#e6c09a", shade: "#cfa47c", hair: "#1d1612", hairHi: "#33261d", coat: "#181716", collar: "#f5f3ee",
      brow: "M63 86 Q76 76 90 84 M110 84 Q124 76 137 86", eyeRy: 4.6, lid: false, curls: true,
      moustache: "M86 127 Q93 124 99 126 M101 126 Q107 124 114 127", tuft: "",
      faceRx: 32, faceRy: 43, voice: { pitch: 0.9, rate: 0.93 },
    },
  };
  const DEFAULT = { ...FACES.descartes, hair: "#777", hairHi: "#999", moustache: "", tuft: "" };

  function curlsPath(side) { // 스피노자 곱슬머리: 원을 겹쳐 머리 테두리를 만든다
    const pts = side === "L" ? [[62, 70], [54, 92], [50, 116], [52, 140], [58, 162], [66, 180]]
                             : [[138, 70], [146, 92], [150, 116], [148, 140], [142, 162], [134, 180]];
    return pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${15 - i * 0.6}"/>`).join("");
  }

  function svg(id) {
    const f = FACES[id] || DEFAULT;
    const hairBack = f.curls
      ? `<g fill="${f.hair}"><ellipse cx="100" cy="92" rx="52" ry="50"/>${curlsPath("L")}${curlsPath("R")}</g>
         <g fill="${f.hairHi}" opacity=".55">${[[70, 60], [88, 50], [112, 50], [130, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9"/>`).join("")}</g>`
      : `<path d="M52 170 Q40 120 50 84 Q58 46 100 42 Q142 46 150 84 Q160 120 148 170 Q138 150 134 110 L66 110 Q62 150 52 170 Z" fill="${f.hair}"/>
         <path d="M58 150 Q54 120 60 96 M142 150 Q146 120 140 96" stroke="${f.hairHi}" stroke-width="3" fill="none" opacity=".7"/>`;
    const fringe = f.curls
      ? `<path d="M70 82 Q78 58 100 56 Q122 58 130 82 Q118 70 100 70 Q82 70 70 82 Z" fill="${f.hair}"/>`
      : `<path d="M66 92 Q70 58 100 54 Q130 58 134 92 Q122 68 100 64 Q80 66 66 92 Z" fill="${f.hair}"/>
         <path d="M100 55 L100 66" stroke="${f.hairHi}" stroke-width="2"/>`;
    const eye = (cx) => `<ellipse cx="${cx}" cy="98" rx="7.5" ry="${f.eyeRy + 1.6}" fill="#fbf7f2"/>
      <circle cx="${cx}" cy="98.5" r="${f.eyeRy}" fill="#2b1f18"/><circle cx="${cx + 1.3}" cy="97" r="1.1" fill="#fff"/>
      ${f.lid ? `<path d="M${cx - 8} 96 Q${cx} 91 ${cx + 8} 96" stroke="${f.shade}" stroke-width="3" fill="none"/>` : ""}`;
    return `<svg viewBox="0 0 200 220" role="img" aria-label="${id}">
      <circle cx="100" cy="110" r="100" fill="var(--av-bg)"/>
      ${hairBack}
      <path d="M28 220 Q36 176 100 170 Q164 176 172 220 Z" fill="${f.coat}"/>
      <path d="M72 172 L128 172 L136 196 L100 204 L64 196 Z" fill="${f.collar}"/>
      <path d="M100 176 L100 203" stroke="#d8d4ca" stroke-width="1.2"/>
      <rect x="90" y="140" width="20" height="26" fill="${f.shade}"/>
      <ellipse cx="100" cy="106" rx="${f.faceRx}" ry="${f.faceRy}" fill="${f.skin}"/>
      <ellipse cx="${100 - f.faceRx + 2}" cy="104" rx="4" ry="8" fill="${f.shade}"/>
      <ellipse cx="${100 + f.faceRx - 2}" cy="104" rx="4" ry="8" fill="${f.shade}"/>
      ${fringe}
      <path d="${f.brow}" stroke="#2a1d15" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      <g class="av-eyes">${eye(80)}${eye(120)}</g>
      <path d="M100 100 L95 120 Q100 124 105 120" stroke="${f.shade}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M86 138 Q100 132 114 138" stroke="#b07a60" stroke-width="1.4" fill="none" opacity=".4"/>
      <g class="av-mouth"><ellipse cx="100" cy="134" rx="9" ry="3" fill="#7b3a33"/></g>
      ${f.moustache ? `<path d="${f.moustache}" fill="${f.hair}" stroke="${f.hair}" stroke-width="1.4" stroke-linecap="round"/>` : ""}
      ${f.tuft ? `<path d="${f.tuft}" fill="${f.hair}"/>` : ""}
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

  window.PhiloAvatar = function mount(root, opts) {
    // opts: { api(path, init), askable: bool, name(id), quotesFor(id)→[...], section()→key|null }
    let pid = null, history = [], voiceOn = false, speaking = false, busy = false, last = Date.now(), quotes = [];
    root.innerHTML = `
      <div class="av-stage"><div class="av-face" id="avFace"></div>
        <div class="av-bubble" id="avBubble" hidden></div></div>
      <div class="av-head"><b id="avName"></b><span class="av-era" id="avEra"></span>
        <button class="mini" id="avVoice" title="목소리 켜기/끄기">🔈 목소리 끔</button></div>
      <div class="av-log" id="avLog"></div>
      <form class="av-form" id="avForm"><input id="avQ" maxlength="500" autocomplete="off"><button class="btn">묻기</button></form>
      <p class="av-note">철학자 모습·목소리는 수업용으로 꾸민 것입니다. 답변은 수업 슬라이드에 근거합니다.</p>`;
    const $ = (s) => root.querySelector(s);

    function setSpeaking(on) { speaking = on; $("#avFace").classList.toggle("speaking", on); }
    function say(text) {
      if (!voiceOn || !synth || !text) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(speakable(text));
      const v = pickVoice(); if (v) u.voice = v;
      u.lang = "ko-KR"; const p = (FACES[pid] || DEFAULT).voice; u.pitch = p.pitch; u.rate = p.rate;
      u.onstart = () => setSpeaking(true); u.onend = u.onerror = () => setSpeaking(false);
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
      busy = true; const wait = add("…", "bot"); setSpeaking(true);
      try {
        const res = await opts.api("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q, philosopher: pid, mode: "persona", history, section: opts.section() }) });
        const r = await res.json(); if (!res.ok) throw new Error(r.detail || res.status);
        let h = r.notice ? `<div class="notice">${esc(r.notice)}</div>` : "";
        h += esc(r.answer).replace(/\n/g, "<br>");
        if (r.beyond) h += `<div class="beyond"><b>수업 범위 밖 보충</b>${esc(r.beyond)}</div>`;
        if (r.question_back) h += `<div class="qb">${esc(r.question_back)}</div>`;
        if (r.sources?.length) h += `<div class="src">근거: ${r.sources.map((s) => `${s.week}주 ${esc(s.locator)}`).join(" · ")}</div>`;
        wait.innerHTML = h;
        history.push({ role: "user", content: q }, { role: "assistant", content: [r.answer, r.question_back].filter(Boolean).join("\n") });
        history = history.slice(-10);
        setSpeaking(false); say([r.notice, r.answer, r.question_back].filter(Boolean).join(" "));
      } catch (err) { wait.innerHTML = `<div class="notice">오류: ${esc(err.message)}</div>`; setSpeaking(false); }
      busy = false; touch();
    };

    // 유휴 시 수업 슬라이드에 인용된 그 철학자의 문장을 말한다
    setInterval(() => {
      if (!pid || busy || speaking || !quotes.length || Date.now() - last < IDLE_MS) return;
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      bubble(q); say(q); last = Date.now() - IDLE_MS / 2;
    }, 4000);

    return {
      setPhilosopher(id, era) {
        if (id === pid) return;
        pid = id; history = []; touch(); if (synth) synth.cancel(); setSpeaking(false);
        $("#avFace").innerHTML = svg(id);
        $("#avName").textContent = opts.name(id); $("#avEra").textContent = era || "";
        $("#avLog").innerHTML = `<div class="av-msg sys">${esc(opts.name(id))}에게 이 절의 내용을 물어보세요.${opts.askable ? "" : " (공개 사이트: 대화 서버 연결 전)"}</div>`;
        $("#avQ").placeholder = `${opts.name(id)}에게 질문하기`;
        quotes = []; Promise.resolve(opts.quotesFor(id)).then((q) => { if (pid === id) quotes = q || []; });
      },
    };
  };
})();
