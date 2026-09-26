// 철학자 아바타 — 실제 초상화(퍼블릭 도메인) + 발화 시 입·머리 움직임 + 브라우저 음성(Web Speech API, 무료) + 대화창.
// 원형: philo-agent frontend/src/components/Avatar.jsx · useSpeech.js · PersonaPanel.jsx(유휴 명언).
// 목소리는 브라우저 합성음이다(실제 인물의 목소리가 아님).
(function () {
  // ---------- 얼굴: 초상화 ----------
  // 데카르트: Frans Hals, 「René Descartes」(1649경) — Wikimedia Commons, Public domain
  // 스피노자: 작자 미상, 「Baruch de Spinoza」(1665경) — Wikimedia Commons, Public domain
  // w·h = 그림 크기(px), view = 얼굴을 중심으로 자르는 영역(x y 너비 높이), mouth = 입 위치(그림 좌표)
  const FACES = {
    descartes: { img: "descartes.jpg", w: 500, h: 679, view: [118, 88, 270, 270], mouth: { cx: 262, cy: 281, rx: 17, ry: 4 },
                 voice: { pitch: 0.95, rate: 1.0 }, credit: "Frans Hals, 1649경" },
    spinoza:   { img: "spinoza.jpg",   w: 500, h: 581, view: [96, 56, 262, 262],  mouth: { cx: 234, cy: 214, rx: 15, ry: 3.6 },
                 voice: { pitch: 0.9, rate: 0.93 }, credit: "작자 미상, 1665경" },
  };

  function svg(id, base) {
    const f = FACES[id];
    if (!f) return `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="var(--av-bg)"/></svg>`;
    const [x, y, w, h] = f.view, m = f.mouth, cid = `clip-${id}`;
    return `<svg viewBox="${x} ${y} ${w} ${h}" role="img" aria-label="${id} 초상">
      <defs><clipPath id="${cid}"><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2}"/></clipPath></defs>
      <g clip-path="url(#${cid})">
        <g class="av-head">
          <image href="${base}${f.img}" x="0" y="0" width="${f.w}" height="${f.h}"/>
          <g class="av-mouth"><ellipse cx="${m.cx}" cy="${m.cy}" rx="${m.rx}" ry="${m.ry}" fill="#2a0f0b" opacity=".0"/></g>
        </g>
      </g>
      <circle class="av-ring" cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2 - 2}" fill="none" stroke="var(--accent)" stroke-width="4" opacity="0"/>
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
    // opts: { api(path, init), askable: bool, name(id), quotesFor(id)→[...], section()→key|null, portraitBase }
    let pid = null, history = [], voiceOn = false, speaking = false, busy = false, last = Date.now(), quotes = [];
    root.innerHTML = `
      <div class="av-stage"><div class="av-face" id="avFace"></div>
        <div class="av-bubble" id="avBubble" hidden></div></div>
      <div class="av-head"><b id="avName"></b><span class="av-era" id="avEra"></span>
        <button class="mini" id="avVoice" title="목소리 켜기/끄기">🔈 목소리 끔</button></div>
      <div class="av-log" id="avLog"></div>
      <form class="av-form" id="avForm"><input id="avQ" maxlength="500" autocomplete="off"><button class="btn">묻기</button></form>
      <p class="av-note"><span id="avCredit"></span><br>목소리는 브라우저 합성음이고, 답변은 수업 슬라이드에 근거합니다.</p>`;
    const $ = (s) => root.querySelector(s);

    function setSpeaking(on) { speaking = on; $("#avFace").classList.toggle("speaking", on); }
    function say(text) {
      if (!voiceOn || !synth || !text) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(speakable(text));
      const v = pickVoice(); if (v) u.voice = v;
      u.lang = "ko-KR"; const p = (FACES[pid] || { voice: { pitch: 1, rate: 1 } }).voice; u.pitch = p.pitch; u.rate = p.rate;
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
      ask(text) { $("#avQ").value = text; $("#avForm").requestSubmit(); },
      prefill(text) { $("#avQ").value = text; $("#avQ").focus(); },
      setPhilosopher(id, era) {
        if (id === pid) return;
        pid = id; history = []; touch(); if (synth) synth.cancel(); setSpeaking(false);
        $("#avFace").innerHTML = svg(id, opts.portraitBase || "");
        $("#avCredit").textContent = FACES[id] ? `초상: ${FACES[id].credit} · 퍼블릭 도메인(Wikimedia Commons)` : "";
        $("#avName").textContent = opts.name(id); $("#avEra").textContent = era || "";
        $("#avLog").innerHTML = `<div class="av-msg sys">${esc(opts.name(id))}에게 이 절의 내용을 물어보세요.${opts.askable ? "" : " (공개 사이트: 대화 서버 연결 전)"}</div>`;
        $("#avQ").placeholder = `${opts.name(id)}에게 질문하기`;
        quotes = []; Promise.resolve(opts.quotesFor(id)).then((q) => { if (pid === id) quotes = q || []; });
      },
    };
  };
})();
