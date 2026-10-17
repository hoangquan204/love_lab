import { useEffect, useMemo, useState } from "react";

/* ─────────────────────────────────────────────
   HASH & CALC UTILITIES
───────────────────────────────────────────── */
function normalize(name) {
  return name.trim().toLowerCase().normalize("NFC").replace(/\s+/g, " ");
}

function fnv1a(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seedRand(seed) {
  let s = seed;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 0xffffffff;
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcAll(a, b) {
  const pair = [normalize(a), normalize(b)].sort().join("?");
  const base = fnv1a(pair);
  const rng = seedRand(base);
  const overall = Math.floor(40 + rng() * 61);
  const tinh_cach = Math.floor(38 + rng() * 63);
  const so_thich = Math.floor(35 + rng() * 65);
  const tan_so = Math.floor(42 + rng() * 59);
  const duyen = Math.floor(50 + rng() * 51);
  return { overall, tinh_cach, so_thich, tan_so, duyen };
}

function getLabel(p) {
  if (p >= 90) return "Thiên sinh một đôi";
  if (p >= 80) return "Rất hợp nhau";
  if (p >= 70) return "Khá ăn ý";
  if (p >= 60) return "Có duyên gặp gỡ";
  return "Cần vun đắp thêm";
}

function getColor(p) {
  if (p >= 85) return "#f5c842";
  if (p >= 70) return "#ff6b9d";
  if (p >= 55) return "#a78bfa";
  return "#60a5fa";
}

function getOverallMessage(p) {
  if (p >= 90) return ["💫 Định mệnh của nhau!", "Hai bạn sinh ra là để dành cho nhau. Không phải ngẫu nhiên mà hai tâm hồn lại tìm đến nhau đâu nhé."];
  if (p >= 80) return ["💕 Rất hợp nhau!", "Hãy nắm tay thật chặt và cùng nhau viết tiếp câu chuyện tình yêu tuyệt vời này."];
  if (p >= 70) return ["🌸 Khá ăn ý đấy!", "Thêm chút thấu hiểu mỗi ngày sẽ càng gắn kết hơn."];
  if (p >= 60) return ["🌷 Có duyên gặp gỡ!", "Trái tim biết tìm đến nhau là điều hiếm có. Hãy trân trọng nhé."];
  return ["🌱 Cần vun đắp!", "Tình yêu cần được vun đắp mỗi ngày. Với sự kiên nhẫn và thấu hiểu, mọi thứ đều có thể."];
}

const METRICS = [
  {
    key: "tinh_cach",
    icon: "✨",
    label: "Tính cách",
    desc: (p) =>
      p >= 80
        ? "Hai bạn bổ sung hoàn hảo cho nhau, tạo nên sự cân bằng tuyệt vời."
        : p >= 65
          ? "Có nhiều điểm tương đồng, đôi khi bổ trợ cho nhau rất tốt."
          : "Khác biệt nhưng biết đâu đó lại là điều thú vị để khám phá nhau!",
  },
  {
    key: "so_thich",
    icon: "🎯",
    label: "Sở thích",
    desc: (p) =>
      p >= 80
        ? "Cùng đam mê, cùng thích — có cả trăm chủ đề để trò chuyện mãi không chán!"
        : p >= 65
          ? "Có những sở thích chung thú vị, dễ tìm điểm vui chung."
          : "Sở thích khác nhau nhưng đó là cơ hội để khám phá thế giới của nhau!",
  },
  {
    key: "tan_so",
    icon: "💫",
    label: "Tần số rung động",
    desc: (p) =>
      p >= 80
        ? "Năng lượng của hai bạn cộng hưởng hoàn toàn — gặp nhau là thấy an tâm!"
        : p >= 65
          ? "Hai nguồn năng lượng khá hài hoà, dễ cảm nhận sự đồng điệu."
          : "Năng lượng khác nhau, nhưng đôi khi sự tương phản lại tạo ra tia lửa!",
  },
  {
    key: "duyen",
    icon: "🔮",
    label: "Duyên phận",
    desc: (p) =>
      p >= 85
        ? "Có lẽ ở kiếp trước hai bạn đã hứa hẹn sẽ tìm đến nhau kiếp này!"
        : p >= 70
          ? "Duyên phận sắp xếp để hai bạn gặp nhau — đừng để duyên trôi qua nhé!"
          : "Duyên kỳ ngộ, gặp nhau cũng là một điều kỳ diệu!",
  },
];

/* ─────────────────────────────────────────────
   ANIMATED COUNTER HOOK
───────────────────────────────────────────── */
function useCounter(target, active, duration = 2000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) { setVal(0); return; }
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return val;
}

/* ─────────────────────────────────────────────
   FLOATING HEARTS BACKGROUND
───────────────────────────────────────────── */
function FloatingHearts() {
  const items = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        left: Math.random() * 100,
        size: 10 + Math.random() * 22,
        duration: 8 + Math.random() * 12,
        delay: -Math.random() * 20,
        opacity: 0.12 + Math.random() * 0.28,
        emoji: Math.random() > 0.3 ? "♥" : Math.random() > 0.5 ? "✦" : "✿",
      })),
    []
  );
  return (
    <div className="bg-hearts" aria-hidden="true">
      {items.map((h, i) => (
        <span
          key={i}
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}px`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
            opacity: h.opacity,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SPARKLES
───────────────────────────────────────────── */
function Sparkles({ count = 20 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 3 + Math.random() * 6,
        d: 2 + Math.random() * 4,
        delay: Math.random() * 3,
      })),
    [count]
  );
  return (
    <div className="sparkles-wrap" aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          className="sparkle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            animationDuration: `${p.d}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   BIG HEART
───────────────────────────────────────────── */
const HEART_PATH =
  "M100 170 C20 110 0 70 0 45 C0 20 20 0 50 0 C75 0 92 15 100 30 C108 15 125 0 150 0 C180 0 200 20 200 45 C200 70 180 110 100 170 Z";

function BigHeart({ value }) {
  const liquidY = 175 - (175 * value) / 100;
  const bursts = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
        const dist = 130 + Math.random() * 100;
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist - 20,
          size: 12 + Math.random() * 20,
          delay: Math.random() * 0.5,
        };
      }),
    []
  );

  return (
    <div className="heart-stage">
      <span className="ring ring-1" />
      <span className="ring ring-2" />
      <span className="ring ring-3" />
      {bursts.map((b, i) => (
        <span
          key={i}
          className="burst"
          style={{
            "--dx": `${b.dx}px`,
            "--dy": `${b.dy}px`,
            fontSize: `${b.size}px`,
            animationDelay: `${b.delay}s`,
          }}
        >
          ♥
        </span>
      ))}
      <div className="heart-beat">
        <svg className="heart-svg" viewBox="-6 -6 212 188" aria-hidden="true">
          <defs>
            <clipPath id="heartClip"><path d={HEART_PATH} /></clipPath>
            <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f09ab8" />
              <stop offset="100%" stopColor="#b84060" />
            </linearGradient>
            <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff5f7" stopOpacity="0.97" />
              <stop offset="100%" stopColor="#f5c0d0" stopOpacity="0.75" />
            </linearGradient>
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="7" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path d={HEART_PATH} fill="url(#glass)" filter="url(#glow)" />
          <g clipPath="url(#heartClip)">
            <g style={{ transform: `translateY(${liquidY}px)` }}>
              <g className="wave wave-back">
                <path d="M0 8 Q25 -2 50 8 T100 8 T150 8 T200 8 T250 8 T300 8 V220 H0 Z" fill="#f0a8c0" opacity="0.5" />
              </g>
              <g className="wave wave-front">
                <path d="M0 8 Q25 -2 50 8 T100 8 T150 8 T200 8 T250 8 T300 8 V220 H0 Z" fill="url(#liquid)" />
              </g>
            </g>
          </g>
          <path d="M30 28 C38 14 56 10 66 16" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" opacity="0.85" />
          <path d={HEART_PATH} fill="none" stroke="#fff" strokeWidth="3" opacity="0.8" />
        </svg>
        <div className="percent" aria-live="polite">
          {Math.round(value)}<small>%</small>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CIRCULAR PROGRESS BAR
───────────────────────────────────────────── */
function CircleBar({ value, color, icon, label, delay = 0 }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="circle-bar" style={{ animationDelay: `${delay}s` }}>
      <svg viewBox="0 0 90 90" className="circle-svg">
        <circle cx="45" cy="45" r={r} className="circle-track" />
        <circle
          cx="45" cy="45" r={r}
          className="circle-fill"
          style={{ strokeDasharray: circ, strokeDashoffset: offset, stroke: color }}
        />
      </svg>
      <div className="circle-inner">
        <span className="circle-icon">{icon}</span>
        <span className="circle-val" style={{ color }}>{value}%</span>
      </div>
      <p className="circle-label">{label}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   METRIC CARD
───────────────────────────────────────────── */
function MetricCard({ metric, value, delay = 0 }) {
  const color = getColor(value);
  const label = getLabel(value);
  const desc = metric.desc(value);
  return (
    <div className="metric-card" style={{ animationDelay: `${delay}s` }}>
      <div className="metric-header">
        <span className="metric-icon">{metric.icon}</span>
        <div className="metric-title-wrap">
          <h3 className="metric-title">{metric.label}</h3>
          <span className="metric-tag" style={{ background: color + "33", color }}>{label}</span>
        </div>
        <span className="metric-pct" style={{ color }}>{value}%</span>
      </div>
      <div className="linear-track">
        <div className="linear-fill" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }} />
      </div>
      <p className="metric-desc">{desc}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING SCREEN
───────────────────────────────────────────── */
function LoadingScreen({ nameA, nameB, progress }) {
  const steps = [
    "Đang quét dữ liệu tâm hồn...",
    "Phân tích tần số rung động...",
    "Tính toán duyên phận...",
    "Đo độ hoà hợp tính cách...",
    "Tổng hợp kết quả...",
  ];
  const stepIdx = Math.min(Math.floor(progress / 20), steps.length - 1);
  return (
    <div className="loading-screen">
      <Sparkles count={25} />
      <div className="loading-orb">
        <div className="orb-ring orb-ring-1" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-ring orb-ring-3" />
        <div className="orb-core">
          <span className="orb-heart">💖</span>
        </div>
      </div>
      <p className="loading-names">
        <strong>{nameA}</strong> <span className="heart-sep">♥</span> <strong>{nameB}</strong>
      </p>
      <p className="loading-step">{steps[stepIdx]}</p>
      <div className="loading-bar-wrap">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="loading-pct">{Math.round(progress)}%</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCREEN 1 – FORM
───────────────────────────────────────────── */
function FormScreen({ onSubmit }) {
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const ok = n1.trim() && n2.trim();
  function handleSubmit(e) {
    e.preventDefault();
    if (!ok) return;
    onSubmit(n1.trim(), n2.trim());
  }
  return (
    <div className="form-screen">
      <Sparkles count={18} />
      <div className="form-hero">
        <div className="form-emoji-ring">
          <span>💝</span>
        </div>
        <h1 className="form-title">Kiểm tra độ hoà hợp</h1>
        <p className="form-sub">Nhập tên hai người để khám phá mức độ tương hợp ✨</p>
      </div>
      <form className="card" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">
            <span className="field-dot" style={{ background: "#e8779a" }} />
            Tên người thứ nhất
          </span>
          <input
            id="name1"
            value={n1}
            onChange={(e) => setN1(e.target.value)}
            placeholder="Ví dụ: Minh"
            maxLength={30}
            autoComplete="off"
          />
        </label>
        <div className="between" aria-hidden="true">
          <i />
          <b className="between-heart">♥</b>
          <i />
        </div>
        <label className="field">
          <span className="field-label">
            <span className="field-dot" style={{ background: "#d4849f" }} />
            Tên người thứ hai
          </span>
          <input
            id="name2"
            value={n2}
            onChange={(e) => setN2(e.target.value)}
            placeholder="Ví dụ: Lan"
            maxLength={30}
            autoComplete="off"
          />
        </label>
        <button className="btn btn-main" type="submit" disabled={!ok} id="submit-btn">
          <span>Xem độ phù hợp</span>
          <span className="btn-icon">💫</span>
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCREEN 3 – RESULT (overall)
───────────────────────────────────────────── */
function ResultScreen({ couple, scores, onDetail, onReset }) {
  const shown = useCounter(scores.overall, true, 2600);
  const done = shown >= scores.overall;
  const [title, msg] = getOverallMessage(scores.overall);
  return (
    <div className="result-screen">
      <Sparkles count={22} />
      <p className="couple-names">
        {couple.a} <span className="couple-heart">♥</span> {couple.b}
      </p>
      <BigHeart value={shown} />
      <div className={`overall-label ${done ? "show" : ""}`}>
        <span className="overall-emoji">{title.split(" ")[0]}</span>
        <span className="overall-text">{title.slice(title.indexOf(" ") + 1)}</span>
      </div>
      <p className={`message ${done ? "show" : ""}`}>{msg}</p>
      <div className={`result-actions ${done ? "show" : ""}`}>
        <button className="btn btn-detail" id="detail-btn" onClick={onDetail}>
          <span>Xem chi tiết</span> <span>✨</span>
        </button>
        <button className="btn btn-ghost" id="reset-btn" onClick={onReset}>
          Thử cặp khác
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCREEN 4 – DETAIL
───────────────────────────────────────────── */
function DetailScreen({ couple, scores, onReset }) {
  const [tab, setTab] = useState("overview");
  return (
    <div className="detail-screen">
      <Sparkles count={14} />
      <div className="detail-header">
        <p className="couple-names small">
          {couple.a} <span className="couple-heart">♥</span> {couple.b}
        </p>
        <div className="detail-tabs">
          <button className={`tab-btn ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
            Tổng quan
          </button>
          <button className={`tab-btn ${tab === "detail" ? "active" : ""}`} onClick={() => setTab("detail")}>
            Chi tiết
          </button>
        </div>
      </div>

      {tab === "overview" && (
        <div className="overview-grid">
          {METRICS.map((m, i) => (
            <CircleBar
              key={m.key}
              value={scores[m.key]}
              color={getColor(scores[m.key])}
              icon={m.icon}
              label={m.label}
              delay={i * 0.1}
            />
          ))}
        </div>
      )}

      {tab === "detail" && (
        <div className="metrics-list">
          {METRICS.map((m, i) => (
            <MetricCard key={m.key} metric={m} value={scores[m.key]} delay={i * 0.08} />
          ))}
        </div>
      )}

      <div className="detail-footer">
        <div className="destiny-card">
          <span className="destiny-icon">🔮</span>
          <div>
            <p className="destiny-title">Lời tiên tri</p>
            <p className="destiny-msg">
              {scores.duyen >= 85
                ? "Hai bạn có duyên trời định — hãy nắm chắc lấy nhau!"
                : scores.duyen >= 70
                  ? "Duyên phận sắp xếp, hãy trao nhau cơ hội!"
                  : "Gặp được nhau đã là kỳ diệu — hãy trân trọng!"}
            </p>
          </div>
        </div>
        <button className="btn btn-ghost" id="reset-detail-btn" onClick={onReset}>
          Thử cặp tên khác 🔄
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   WHEEL SCREEN — VÒNG XOAY TÌNH YÊU
───────────────────────────────────────────── */
const WHEEL_ITEMS = [
  { label: "Nhắn tin\ntrước đi!", color: "#e8779a", emoji: "💌" },
  { label: "Crush đang\nnhớ bạn", color: "#f5c0ce", emoji: "💕" },
  { label: "Tỏ tình\nthôi!", color: "#b84060", emoji: "🌹" },
  { label: "Duyên số\nđang đến", color: "#f0c87a", emoji: "🔮" },
  { label: "Nghỉ ngơi\ntình cảm", color: "#d4849f", emoji: "💆" },
  { label: "Tình yêu\nbất ngờ", color: "#e8779a", emoji: "💫" },
  { label: "Hẹn hò\nhôm nay!", color: "#f5c0ce", emoji: "🌸" },
  { label: "Người ấy\nyêu bạn!", color: "#b84060", emoji: "❤️" },
];

function WheelSVG({ rotation }) {
  const N = WHEEL_ITEMS.length;
  const cx = 150, cy = 150, r = 140;
  const sliceAngle = (2 * Math.PI) / N;

  const slices = WHEEL_ITEMS.map((item, i) => {
    const startAngle = i * sliceAngle - Math.PI / 2;
    const endAngle = startAngle + sliceAngle;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const midAngle = startAngle + sliceAngle / 2;
    const tx = cx + r * 0.62 * Math.cos(midAngle);
    const ty = cy + r * 0.62 * Math.sin(midAngle);
    const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`;
    return { d, fill: item.color, tx, ty, midAngle, emoji: item.emoji };
  });

  return (
    <svg
      viewBox="0 0 300 300"
      className="wheel-svg"
      style={{ transform: `rotate(${rotation}deg)`, transition: "transform 4s cubic-bezier(0.17,0.67,0.12,1.0)" }}
    >
      <defs>
        <filter id="wshadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(80,0,30,0.35)" />
        </filter>
      </defs>
      {slices.map((s, i) => (
        <g key={i}>
          <path d={s.d} fill={s.fill} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
          <text
            x={s.tx}
            y={s.ty}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${(s.midAngle * 180) / Math.PI + 90}, ${s.tx}, ${s.ty})`}
            fontSize="18"
          >
            {s.emoji}
          </text>
        </g>
      ))}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth="4" opacity="0.6" />
      <circle cx={cx} cy={cy} r={r - 2} fill="none" stroke="rgba(240,200,122,0.7)" strokeWidth="3" />
      {slices.map((_, i) => {
        const a = i * sliceAngle - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)}
            stroke="rgba(240,200,122,0.5)" strokeWidth="1.5"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={22} fill="#fff" stroke="rgba(240,200,122,0.9)" strokeWidth="3" filter="url(#wshadow)" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="18">🌹</text>
    </svg>
  );
}

function WheelScreen() {
  // rotation tích luỹ (không reset về 0) để vòng quay luôn xoay tiếp theo chiều kim đồng hồ
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  function spin() {
    if (spinning) return;
    setResult(null);
    setSpinning(true);
    const next = rotation + 1440 + Math.floor(Math.random() * 1440); // 4–8 vòng
    setRotation(next);
  }

  // Tính kết quả sau khi animation kết thúc (có cleanup khi unmount)
  useEffect(() => {
    if (!spinning) return;
    const id = setTimeout(() => {
      const N = WHEEL_ITEMS.length;
      const sliceDeg = 360 / N;
      // Ô 0 bắt đầu ngay tại mũi tên (đỉnh) và chạy theo chiều kim đồng hồ.
      // Khi bánh xe xoay R độ, phần nằm dưới mũi tên là (360 - R mod 360).
      const normalised = ((rotation % 360) + 360) % 360;
      const idx = Math.floor(((360 - normalised) % 360) / sliceDeg) % N;
      setResult(WHEEL_ITEMS[idx]);
      setSpinning(false);
    }, 4200);
    return () => clearTimeout(id);
  }, [spinning, rotation]);

  return (
    <div className="wheel-screen">
      <Sparkles count={14} />
      <div className="wheel-hero">
        <h2 className="wheel-title">🌹 Vòng xoay tình yêu</h2>
        <p className="wheel-sub">Quay để nhận thông điệp tình yêu hôm nay!</p>
      </div>

      <div className="wheel-wrap">
        <div className="wheel-pointer">▼</div>
        <WheelSVG rotation={rotation} />
      </div>

      {result && !spinning && (
        <div className="wheel-result">
          <span className="wheel-result-emoji">{result.emoji}</span>
          <p className="wheel-result-text">{result.label.replace("\n", " ")}</p>
        </div>
      )}

      <button
        className={`btn ${spinning ? "btn-spinning" : "btn-spin"}`}
        onClick={spin}
        disabled={spinning}
        id="spin-btn"
      >
        {spinning ? "Đang quay..." : "✨ QUAY NGAY"}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TAROT SCREEN — RÚT TAROT TÌNH YÊU
───────────────────────────────────────────── */
const TAROT_CARDS = [
  {
    name: "Đôi Tình Nhân", emoji: "💑",
    color: "#e8779a",
    msg: "Tình yêu đang nở rộ. Hai tâm hồn sắp gặp nhau trong sự hòa hợp tuyệt vời — hãy mở lòng đón nhận.",
    keyword: "Kết nối · Hòa hợp · Tình yêu",
  },
  {
    name: "Ngôi Sao Hy Vọng", emoji: "⭐",
    color: "#f0c87a",
    msg: "Hy vọng đang tỏa sáng trên con đường tình yêu của bạn. Hãy tin vào bản thân và tin vào duyên phận.",
    keyword: "Hy vọng · Ánh sáng · Niềm tin",
  },
  {
    name: "Ánh Trăng Bí Ẩn", emoji: "🌙",
    color: "#d4849f",
    msg: "Có điều gì đó chưa được nói ra. Hãy lắng nghe trái tim — đôi khi im lặng cũng là một ngôn ngữ tình yêu.",
    keyword: "Bí ẩn · Trực giác · Cảm xúc",
  },
  {
    name: "Mặt Trời Rạng Rỡ", emoji: "☀️",
    color: "#f5c842",
    msg: "Thời gian hạnh phúc đang đến! Tình yêu sẽ mang lại niềm vui và năng lượng tích cực cho bạn.",
    keyword: "Hạnh phúc · Năng lượng · Thành công",
  },
  {
    name: "Trái Tim Chân Thành", emoji: "💝",
    color: "#e8779a",
    msg: "Tình yêu chân thành luôn được đền đáp. Hãy dũng cảm thể hiện cảm xúc — người ấy đang chờ đợi điều đó.",
    keyword: "Chân thành · Dũng cảm · Yêu thương",
  },
  {
    name: "Bông Hồng Tình Yêu", emoji: "🌹",
    color: "#b84060",
    msg: "Tình yêu như bông hồng — đẹp nhưng cần được chăm sóc. Hãy vun đắp mỗi ngày để tình yêu nở rộ mãi.",
    keyword: "Lãng mạn · Vun đắp · Bền lâu",
  },
];

function TarotCard({ card, idx, picked, onPick }) {
  const isMe = picked === idx;
  const revealed = picked !== null && isMe;
  return (
    <div
      className={`tarot-card-wrap ${picked !== null && !isMe ? "faded" : ""} ${isMe ? "chosen" : ""}`}
      onClick={() => picked === null && onPick(idx)}
      style={{ animationDelay: `${idx * 0.07}s` }}
    >
      <div className={`tarot-card ${revealed ? "flipped" : ""}`}>
        <div className="tarot-face tarot-back">
          <span className="tarot-back-icon">🤞</span>
        </div>
        <div
          className="tarot-face tarot-front"
          style={{ background: `linear-gradient(135deg, ${card.color}33, ${card.color}88)`, borderColor: card.color }}
        >
          <span className="tarot-emoji">{card.emoji}</span>
          <p className="tarot-name">{card.name}</p>
        </div>
      </div>
    </div>
  );
}

function TarotScreen() {
  const [picked, setPicked] = useState(null);
  const [shuffled, setShuffled] = useState(() => shuffle(TAROT_CARDS).slice(0, 5));

  function reset() {
    setPicked(null);
    setShuffled(shuffle(TAROT_CARDS).slice(0, 5));
  }

  const card = picked !== null ? shuffled[picked] : null;

  return (
    <div className="tarot-screen">
      <Sparkles count={16} />
      <div className="tarot-hero">
        <h2 className="tarot-title">🤞 Rút tarot tình yêu</h2>
        <p className="tarot-sub">
          {picked === null ? "Chạm vào một lá bài để khám phá thông điệp tình yêu" : ""}
        </p>
      </div>

      <div className="tarot-cards">
        {shuffled.map((c, i) => (
          <TarotCard key={c.name} card={c} idx={i} picked={picked} onPick={setPicked} />
        ))}
      </div>

      {card && (
        <div className="tarot-reading" style={{ borderColor: card.color + "60" }}>
          <div className="tarot-reading-header" style={{ color: card.color }}>
            <span className="tarot-reading-emoji">{card.emoji}</span>
            <span className="tarot-reading-name">{card.name}</span>
          </div>
          <p className="tarot-reading-keyword" style={{ background: card.color + "22", color: card.color }}>
            {card.keyword}
          </p>
          <p className="tarot-reading-msg">{card.msg}</p>
          <button className="btn btn-tarot-reset" onClick={reset} id="tarot-reset-btn">
            🔀 Rút lại
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   APP ROOT  (chỉ còn MỘT export default)
───────────────────────────────────────────── */
export default function App() {
  const [stage, setStage] = useState("form");
  const [activeTab] = useState("love");
  const [couple, setCouple] = useState({ a: "", b: "" });
  const [scores, setScores] = useState(null);
  const [progress, setProgress] = useState(0);

  function handleForm(a, b) {
    setCouple({ a, b });
    setScores(calcAll(a, b));
    setProgress(0);
    setStage("loading");
  }

  function reset() {
    setStage("form");
    setProgress(0);
  }


  useEffect(() => {
    if (stage !== "loading") return;
    let p = 0;
    let doneTimer;
    const id = setInterval(() => {
      p += 1.2 + Math.random() * 1.4;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(id);
        doneTimer = setTimeout(() => setStage("result"), 300);
      }
    }, 45);
    // cleanup cả timeout để không nhảy sang "result" sau khi người dùng đã đổi tab/reset
    return () => {
      clearInterval(id);
      clearTimeout(doneTimer);
    };
  }, [stage]);

  return (
    <div className="page">
      <FloatingHearts />
      <header className="brand">
        <span className="brand-logo">💖</span>
        <span className="brand-name">My Love</span>
      </header>
      <main className="main">
        {activeTab === "love" && stage === "form" && <FormScreen onSubmit={handleForm} />}
        {activeTab === "love" && stage === "loading" && (
          <LoadingScreen nameA={couple.a} nameB={couple.b} progress={progress} />
        )}
        {activeTab === "love" && stage === "result" && (
          <ResultScreen couple={couple} scores={scores} onDetail={() => setStage("detail")} onReset={reset} />
        )}
        {activeTab === "love" && stage === "detail" && (
          <DetailScreen couple={couple} scores={scores} onReset={reset} />
        )}

        {activeTab === "wheel" && <WheelScreen />}
        {activeTab === "tarot" && <TarotScreen />}
      </main>
    </div>
  );
}
