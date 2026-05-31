"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import styles from "./invite.module.css";

/* ───────────────────────────────────────────────────────────────────────
   CONFIG — everything you'd want to tweak lives here.
   ─────────────────────────────────────────────────────────────────────── */
const SENDER = "Mark";
const TO_EMAIL = "markyu0615@gmail.com";

const CUISINES = [
  "Sushi 🍣",
  "Ramen 🍜",
  "Italian 🍝",
  "Korean BBQ 🥩",
  "Hotpot 🍲",
  "Tacos 🌮",
  "Dim sum 🥟",
  "Dessert first 🍰",
  "You decide 🎲",
];

const NO_LINES = [
  "No",
  "wait, really?",
  "are you sure?",
  "100% sure??",
  "think it over…",
  "last chance 🥺",
  "ok the button left.",
];

const LOADER_LINES = [
  "$ ./ask-her-out.sh --target=you",
  "› npm install butterflies@latest ✓",
  "› resolving dependencies: [you] [me] [snacks]",
  "› compiling feelings… 100%",
  "› running tests … 1 passed (you're the one)",
  "› deploying question to production ✓",
];

const HEART_GLYPHS = ["💕", "💖", "🌸", "✨", "💗", "🩷", "🌹", "🧁"];

/* ─────────────────────────────────────────────────────────────────────── */

type Phase = "loading" | "ask" | "form" | "success" | "declined";
const STEPS = ["when", "plan", "where", "notes", "review"] as const;
type Step = (typeof STEPS)[number];
type Piece = { id: number; glyph: string; style: CSSProperties };

function useMediaFlag(query: string) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);
  return on;
}

export function DateInvite() {
  const reduced = useMediaFlag("(prefers-reduced-motion: reduce)");
  const finePointer = useMediaFlag("(pointer: fine)");

  const [phase, setPhase] = useState<Phase>("loading");
  const [step, setStep] = useState<Step>("when");

  // form state
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:30");
  const [isDinner, setIsDinner] = useState(true);
  const [activity, setActivity] = useState("Coffee ☕");
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [pickLocation, setPickLocation] = useState(false);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // runaway "No"
  const [dodges, setDodges] = useState(0);
  const [noStyle, setNoStyle] = useState<CSSProperties>({});

  // loader → ask
  useEffect(() => {
    if (phase !== "loading") return;
    const t = setTimeout(() => setPhase("ask"), reduced ? 400 : 2600);
    return () => clearTimeout(t);
  }, [phase, reduced]);

  const stepIndex = STEPS.indexOf(step);

  /* runaway behaviour */
  const canDodge = finePointer && !reduced && dodges < NO_LINES.length - 1;
  const handleNo = useCallback(() => {
    if (canDodge) {
      const pad = 90;
      const x = pad + Math.random() * (window.innerWidth - pad * 2);
      const y = pad + Math.random() * (window.innerHeight - pad * 2);
      setNoStyle({
        left: `${x}px`,
        top: `${y}px`,
        ["--no-scale" as string]: `${Math.max(0.55, 1 - dodges * 0.08)}`,
      });
      setDodges((d) => d + 1);
    } else {
      setPhase("declined");
    }
  }, [canDodge, dodges]);

  const yesScale = useMemo(() => 1 + Math.min(dodges, 6) * 0.07, [dodges]);

  /* derived */
  const prettyWhen = useMemo(() => {
    if (!date) return "to be scheduled";
    try {
      const d = new Date(`${date}T${time || "19:30"}`);
      return d.toLocaleString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return `${date} ${time}`;
    }
  }, [date, time]);

  const plan = isDinner
    ? `Dinner${cuisines.length ? ` — ${cuisines.join(", ")}` : ""}`
    : activity;
  const place = pickLocation
    ? location || "her pick (TBD)"
    : `${SENDER}'s surprise ✨`;

  const canDeploy = date.length > 0;

  /* ICS + mailto */
  const buildIcs = useCallback(() => {
    const start = new Date(`${date}T${time || "19:30"}`);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    const fmt = (d: Date) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(
        d.getHours(),
      )}${pad(d.getMinutes())}00`;
    const desc = [
      `Plan: ${plan}`,
      `Where: ${place}`,
      notes ? `Notes: ${notes}` : "",
      "",
      "status: 200 OK · heart rate: elevated 💗",
    ]
      .filter(Boolean)
      .join("\\n");
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//m4rkyu//date-invite//EN",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@m4rkyu.com`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:Date with ${SENDER} 💕`,
      `LOCATION:${place.replace(/,/g, "\\,")}`,
      `DESCRIPTION:${desc}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
  }, [date, time, plan, place, notes]);

  const downloadIcs = useCallback(() => {
    const blob = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `date-with-${SENDER.toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildIcs]);

  const mailtoHref = useMemo(() => {
    const subject = `IT'S A YES 💕 — let's lock in our date`;
    const body = [
      `Hi ${SENDER},`,
      "",
      "Deploying my answer: YES. Here's the config:",
      "",
      `• When:  ${prettyWhen}`,
      `• Plan:  ${plan}`,
      `• Where: ${place}`,
      notes ? `• Notes: ${notes}` : "",
      "",
      "merge when ready 🤍",
    ]
      .filter(Boolean)
      .join("\n");
    return `mailto:${TO_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }, [prettyWhen, plan, place, notes]);

  /* Decorative pieces use a deterministic sine-hash (not Math.random) so they
     compute purely in render and stay hydration-stable. */
  const confetti = useMemo<Piece[]>(() => {
    if (reduced || phase !== "success") return [];
    return Array.from({ length: 42 }, (_, i) => ({
      id: i,
      glyph: HEART_GLYPHS[i % HEART_GLYPHS.length],
      style: {
        left: `${seeded(i, 1) * 100}%`,
        animationDelay: `${seeded(i, 2) * 1.2}s`,
        ["--cf-dur" as string]: `${2 + seeded(i, 3) * 2.2}s`,
        fontSize: `${0.9 + seeded(i, 4) * 1.4}rem`,
      } as CSSProperties,
    }));
  }, [reduced, phase]);

  const hearts = useMemo<Piece[]>(() => {
    if (reduced) return [];
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      glyph: HEART_GLYPHS[i % HEART_GLYPHS.length],
      style: {
        left: `${seeded(i, 5) * 100}%`,
        animationDuration: `${10 + seeded(i, 6) * 12}s`,
        animationDelay: `${seeded(i, 7) * 10}s`,
      } as CSSProperties,
    }));
  }, [reduced]);

  const goNext = () =>
    setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)]);
  const goBack = () => setStep(STEPS[Math.max(stepIndex - 1, 0)]);

  return (
    <div className={styles.root}>
      <div className={styles.mesh} aria-hidden="true" />
      <div className={styles.hearts} aria-hidden="true">
        {hearts.map((h) => (
          <span key={h.id} className={styles.heart} style={h.style}>
            {h.glyph}
          </span>
        ))}
      </div>
      <div className={styles.grain} aria-hidden="true" />

      {confetti.length > 0 && (
        <div className={styles.confettiLayer} aria-hidden="true">
          {confetti.map((c) => (
            <span key={c.id} className={styles.confetti} style={c.style}>
              {c.glyph}
            </span>
          ))}
        </div>
      )}

      <main className={styles.stage}>
        {/* ── LOADING ─────────────────────────────────────────────── */}
        {phase === "loading" && (
          <div className={`${styles.card} ${styles.loader} ${styles.stepWrap}`}>
            <span className={styles.eyebrow}>{"// booting…"}</span>
            <div className={styles.loaderLines} role="status">
              {LOADER_LINES.map((line, i) => (
                <div
                  key={line}
                  className={styles.loaderLine}
                  style={{ animationDelay: `${i * 0.35}s` }}
                >
                  {line}
                </div>
              ))}
            </div>
            <div className={styles.bar} aria-hidden="true">
              <span className={styles.barFill} />
            </div>
          </div>
        )}

        {/* ── ASK ─────────────────────────────────────────────────── */}
        {phase === "ask" && (
          <div className={`${styles.shell} ${styles.shellSolo}`}>
            <div className={`${styles.card} ${styles.stepWrap}`}>
              <span className={styles.eyebrow}>
                {'// commit a8c037b — "the most important PR of my life"'}
              </span>
              <h1 className={styles.title}>
                Will you go out{" "}
                <span className={styles.titleGrad}>with me?</span>
              </h1>
              <p className={styles.lead}>
                I ran the numbers across every timeline. You&apos;re,
                statistically, the best thing that&apos;s happened to my uptime.
                One small <code>yes</code> and I ship the whole evening. 🍰
              </p>

              <div className={styles.row}>
                <button
                  type="button"
                  className={styles.btnYes}
                  style={{ ["--yes-scale" as string]: `${yesScale}` }}
                  onClick={() => setPhase("form")}
                >
                  Yes 💕
                </button>

                <button
                  type="button"
                  className={`${styles.btnNo} ${
                    Object.keys(noStyle).length ? styles.btnNoLoose : ""
                  }`}
                  style={noStyle}
                  onMouseEnter={canDodge ? handleNo : undefined}
                  onClick={handleNo}
                >
                  {NO_LINES[Math.min(dodges, NO_LINES.length - 1)]}
                </button>
              </div>

              {dodges > 1 && (
                <p
                  style={{
                    marginTop: "1rem",
                    fontFamily: "var(--font-space-mono), monospace",
                    fontSize: "0.74rem",
                    color: "var(--raspberry)",
                    opacity: 0.7,
                  }}
                >
                  ⚠️ TypeError: cannot reject undefined feelings.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── FORM ────────────────────────────────────────────────── */}
        {phase === "form" && (
          <div className={styles.shell}>
            <div className={styles.card}>
              <div className={styles.progress} aria-hidden="true">
                {STEPS.map((s, i) => (
                  <span
                    key={s}
                    className={`${styles.pip} ${
                      i < stepIndex
                        ? styles.pipDone
                        : i === stepIndex
                          ? styles.pipNow
                          : ""
                    }`}
                  >
                    <span className={styles.pipFill} />
                  </span>
                ))}
              </div>

              <div key={step} className={styles.stepWrap}>
                {step === "when" && (
                  <>
                    <h2 className={styles.stepHead}>When works for you?</h2>
                    <p className={styles.stepNote}>
                      {"// scheduling event on the only calendar that matters"}
                    </p>
                    <div className={styles.fieldGrid}>
                      <label className={styles.field}>
                        <span className={styles.label}>Date</span>
                        <input
                          type="date"
                          name="date"
                          className={styles.input}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </label>
                      <label className={styles.field}>
                        <span className={styles.label}>Time</span>
                        <input
                          type="time"
                          name="time"
                          className={styles.input}
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                        />
                      </label>
                    </div>
                  </>
                )}

                {step === "plan" && (
                  <>
                    <h2 className={styles.stepHead}>What are we doing?</h2>
                    <p className={styles.stepNote}>
                      {"// selecting the runtime environment"}
                    </p>
                    <div className={styles.segmented} role="tablist">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={isDinner}
                        className={`${styles.segBtn} ${isDinner ? styles.segActive : ""}`}
                        onClick={() => setIsDinner(true)}
                      >
                        Dinner 🍽️
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={!isDinner}
                        className={`${styles.segBtn} ${!isDinner ? styles.segActive : ""}`}
                        onClick={() => setIsDinner(false)}
                      >
                        Something else ✨
                      </button>
                    </div>

                    {isDinner ? (
                      <div style={{ marginTop: "1.3rem" }}>
                        <span className={styles.label}>
                          Cravings (pick any)
                        </span>
                        <div
                          className={styles.chips}
                          style={{ marginTop: "0.55rem" }}
                        >
                          {CUISINES.map((c) => {
                            const active = cuisines.includes(c);
                            return (
                              <button
                                key={c}
                                type="button"
                                aria-pressed={active}
                                className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                                onClick={() =>
                                  setCuisines((prev) =>
                                    prev.includes(c)
                                      ? prev.filter((x) => x !== c)
                                      : [...prev, c],
                                  )
                                }
                              >
                                {c}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <label
                        className={`${styles.field} ${styles.full}`}
                        style={{ marginTop: "1.3rem" }}
                      >
                        <span className={styles.label}>
                          What sounds fun? ☕🎬🌙
                        </span>
                        <input
                          name="activity"
                          className={styles.input}
                          value={activity}
                          onChange={(e) => setActivity(e.target.value)}
                          placeholder="coffee, a walk, a movie, arcade…"
                        />
                      </label>
                    )}
                  </>
                )}

                {step === "where" && (
                  <>
                    <h2 className={styles.stepHead}>Where to?</h2>
                    <p className={styles.stepNote}>
                      {"// location is optional — surprise mode available"}
                    </p>
                    <div className={styles.segmented} role="tablist">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={!pickLocation}
                        className={`${styles.segBtn} ${!pickLocation ? styles.segActive : ""}`}
                        onClick={() => setPickLocation(false)}
                      >
                        Surprise me ✨
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={pickLocation}
                        className={`${styles.segBtn} ${pickLocation ? styles.segActive : ""}`}
                        onClick={() => setPickLocation(true)}
                      >
                        I&apos;ll pick 📍
                      </button>
                    </div>
                    {pickLocation && (
                      <label
                        className={`${styles.field} ${styles.full}`}
                        style={{ marginTop: "1.3rem" }}
                      >
                        <span className={styles.label}>Your spot</span>
                        <input
                          name="location"
                          className={styles.input}
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="that little place you love…"
                        />
                      </label>
                    )}
                  </>
                )}

                {step === "notes" && (
                  <>
                    <h2 className={styles.stepHead}>Any special requests?</h2>
                    <p className={styles.stepNote}>
                      {"// allergies, dress code, demands, secret wishes"}
                    </p>
                    <label className={`${styles.field} ${styles.full}`}>
                      <span className={styles.label}>Notes</span>
                      <textarea
                        name="notes"
                        className={styles.textarea}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="be specific — I will absolutely over-prepare."
                      />
                    </label>
                  </>
                )}

                {step === "review" && (
                  <>
                    <h2 className={styles.stepHead}>Ready to deploy? 🚀</h2>
                    <p className={styles.stepNote}>
                      {"// review the config, then ship it"}
                    </p>
                    <p className={styles.lead} style={{ marginBottom: "0.5rem" }}>
                      Everything checks out on my end. Hit deploy and I&apos;ll get
                      the confirmation instantly.
                    </p>
                  </>
                )}
              </div>

              {/* nav */}
              <div className={styles.row}>
                {stepIndex > 0 && (
                  <button
                    type="button"
                    className={styles.btnGhost}
                    onClick={goBack}
                  >
                    ← back
                  </button>
                )}
                {step !== "review" ? (
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={goNext}
                    disabled={step === "when" && !date}
                  >
                    {step === "when" && !date ? "pick a date first 🗓️" : "next →"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => setPhase("success")}
                    disabled={!canDeploy}
                  >
                    Deploy this date 🚀
                  </button>
                )}
              </div>
            </div>

            {/* live config preview */}
            <ConfigConsole
              when={date ? prettyWhen : null}
              plan={plan}
              place={place}
              notes={notes}
              status={step === "review" ? "READY" : "PENDING"}
            />
          </div>
        )}

        {/* ── SUCCESS ─────────────────────────────────────────────── */}
        {phase === "success" && (
          <div className={`${styles.shell} ${styles.shellSolo}`}>
            <div
              className={`${styles.card} ${styles.successCard} ${styles.stepWrap}`}
            >
              <div className={styles.bigHeart}>💖</div>
              <span className={styles.eyebrow}>
                ✓ deployment successful · build #1 of forever
              </span>
              <h1 className={styles.title} style={{ marginTop: "0.8rem" }}>
                It&apos;s a <span className={styles.titleGrad}>date.</span>
              </h1>
              <p className={styles.lead} style={{ margin: "0 auto 0.4rem" }}>
                {prettyWhen} · {plan} · {place}
              </p>
              <p className={styles.stepNote} style={{ marginBottom: "1.4rem" }}>
                {'// git commit -m "us" — push the confirmation so I know it\'s real'}
              </p>
              <div
                className={styles.row}
                style={{ justifyContent: "center", marginTop: 0 }}
              >
                <a className={styles.btnPrimary} href={mailtoHref}>
                  Send it to {SENDER} 💌
                </a>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={downloadIcs}
                >
                  Add to calendar 🗓️
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DECLINED (respectful exit) ──────────────────────────── */}
        {phase === "declined" && (
          <div className={`${styles.shell} ${styles.shellSolo}`}>
            <div className={`${styles.card} ${styles.stepWrap}`}>
              <span className={styles.eyebrow}>{"// graceful shutdown 💛"}</span>
              <h1 className={styles.title}>No pressure at all.</h1>
              <p className={styles.lead}>
                Caught and handled — no hard feelings, promise. The offer is
                idempotent: it stays valid, and you can re-run it anytime you
                like. Either way, you made my day by opening this. 🤍
              </p>
              <div className={styles.row}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => {
                    setDodges(0);
                    setNoStyle({});
                    setPhase("ask");
                  }}
                >
                  actually… let me reconsider 💕
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */

function ConfigConsole({
  when,
  plan,
  place,
  notes,
  status,
}: {
  when: string | null;
  plan: string;
  place: string;
  notes: string;
  status: string;
}) {
  return (
    <aside className={styles.console} aria-hidden="true">
      <div className={styles.consoleBar}>
        <span className={`${styles.dot} ${styles.dot1}`} />
        <span className={`${styles.dot} ${styles.dot2}`} />
        <span className={`${styles.dot} ${styles.dot3}`} />
        <span className={styles.consoleTitle}>date.config.json</span>
      </div>
      <div>
        <span className={styles.jsonPunc}>{"{"}</span>
        <Line k="attendee" v="the cutest user 🩷" />
        <Line k="when" v={when ?? "…"} pending={!when} />
        <Line k="plan" v={plan} />
        <Line k="location" v={place} />
        <Line k="notes" v={notes || "—"} />
        <div style={{ paddingLeft: "1.2rem" }}>
          <span className={styles.jsonKey}>&quot;status&quot;</span>
          <span className={styles.jsonPunc}>: </span>
          <span className={styles.jsonPending}>&quot;{status}&quot;</span>
          <span className={styles.cursor}>&nbsp;</span>
        </div>
        <span className={styles.jsonPunc}>{"}"}</span>
      </div>
    </aside>
  );
}

function Line({ k, v, pending }: { k: string; v: string; pending?: boolean }) {
  return (
    <div style={{ paddingLeft: "1.2rem" }}>
      <span className={styles.jsonKey}>&quot;{k}&quot;</span>
      <span className={styles.jsonPunc}>: </span>
      <span className={pending ? styles.jsonPending : styles.jsonStr}>
        &quot;{v}&quot;
      </span>
      <span className={styles.jsonPunc}>,</span>
    </div>
  );
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Deterministic 0..1 pseudo-random from an index + salt. Previously
// used Math.sin for the hash, but Math.sin precision drifts *just*
// enough between Node's libm and V8 in the browser to fail React 19's
// stricter hydration check (server emits "11.1516%", client computes
// "11.15161470734165%"). An integer-only hash is bit-exact across all
// V8 platforms, so server and client agree on every digit.
function seeded(i: number, salt: number) {
  let h = ((i + 1) * 2654435761) ^ ((salt + 1) * 40503);
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h = h ^ (h >>> 16);
  return (h >>> 0) / 4294967296;
}
