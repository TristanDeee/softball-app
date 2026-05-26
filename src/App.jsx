import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, set } from "firebase/database";

// ── Constants ──────────────────────────────────────────────────────────────
const GIRLS = ["Brooke", "Molly O", "Molly K", "Laurel", "Katie", "Taylor"];

const CATEGORIES = ["runs", "hits", "atbats", "catches", "rbis", "homeruns"];
const CAT_LABELS = { runs: "Runs", hits: "Hits", atbats: "At Bats", catches: "Catches", rbis: "RBIs", homeruns: "HRs" };

const COLORS = {
  bg: "#F7F5F2",
  card: "#FFFFFF",
  text: "#111111",
  textSoft: "#5F6368",
  accent: "#C8A46A",
  border: "#E7E2DA",
  hover: "#F1EEE8",
  success: "#2E7D32",
  dark: "#1E1E1E",
};

const DEFAULT_PLAYERS = [
  { id: 1,  name: "Tristan", gender: "male",   runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 2,  name: "Evan",    gender: "male",   runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 3,  name: "Sean",    gender: "male",   runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 4,  name: "Brooke",  gender: "female", runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 5,  name: "Molly O", gender: "female", runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 6,  name: "Molly K", gender: "female", runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 7,  name: "Laurel",  gender: "female", runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 8,  name: "Dan",     gender: "male",   runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 9,  name: "Katie",   gender: "female", runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 10, name: "Moose",   gender: "male",   runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 11, name: "Taylor",  gender: "female", runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 12, name: "Kyle",    gender: "male",   runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 13, name: "Yasser",  gender: "male",   runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
  { id: 14, name: "Victor",  gender: "male",   runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0, hotStreak: false, gamesPlayed: 0 },
];

const DEFAULT_AWARDS = { crazyCatch: "", wildcard: "", mvpWeek: "" };

const DEFAULT_SCHEDULE = [
  { id: 1,  date: "Wed May 21",   diamond: "Diamond 1", result: "", ourScore: "", theirScore: "" },
  { id: 2,  date: "Mon May 26",   diamond: "Diamond 3", result: "", ourScore: "", theirScore: "" },
  { id: 3,  date: "Wed May 28",   diamond: "Diamond 3", result: "", ourScore: "", theirScore: "" },
  { id: 4,  date: "Wed June 4",   diamond: "Diamond 3", result: "", ourScore: "", theirScore: "" },
  { id: 5,  date: "Mon June 16",  diamond: "Diamond 3", result: "", ourScore: "", theirScore: "" },
  { id: 6,  date: "Wed June 18",  diamond: "Diamond 3", result: "", ourScore: "", theirScore: "" },
  { id: 7,  date: "Mon June 30",  diamond: "Diamond 3", result: "", ourScore: "", theirScore: "" },
  { id: 8,  date: "Mon July 7",   diamond: "Diamond 1", result: "", ourScore: "", theirScore: "" },
  { id: 9,  date: "Wed July 9",   diamond: "Diamond 3", result: "", ourScore: "", theirScore: "" },
  { id: 10, date: "Wed July 16",  diamond: "Diamond 1", result: "", ourScore: "", theirScore: "" },
  { id: 11, date: "Mon July 21",  diamond: "Diamond 3", result: "", ourScore: "", theirScore: "" },
  { id: 12, date: "Mon July 28",  diamond: "Diamond 1", result: "", ourScore: "", theirScore: "" },
  { id: 13, date: "Wed July 30",  diamond: "Diamond 3", result: "", ourScore: "", theirScore: "" },
  { id: 14, date: "Wed Aug 6",    diamond: "Diamond 3", result: "", ourScore: "", theirScore: "" },
  { id: 15, date: "Wed Aug 20",   diamond: "Diamond 3", result: "", ourScore: "", theirScore: "" },
  { id: 16, date: "Wed Aug 27",   diamond: "Playoffs",  result: "", ourScore: "", theirScore: "" },
  { id: 17, date: "Sun Aug 31",   diamond: "Playoffs",  result: "", ourScore: "", theirScore: "" },
  { id: 18, date: "Tue Sept 2",   diamond: "Playoffs",  result: "", ourScore: "", theirScore: "" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function getBattingAvg(p) {
  if (!p.atbats || p.atbats === 0) return null;
  return (p.hits / p.atbats).toFixed(3).replace(/^0/, "");
}

function getLineupScore(p) {
  const avg = p.atbats > 0 ? p.hits / p.atbats : 0;
  return avg * 5 + p.homeruns * 4 + p.rbis * 2 + p.runs * 1;
}

function isGirl(name) { return GIRLS.includes(name); }

function PlayerBadge({ name }) {
  const girl = isGirl(name);
  return (
    <div style={{
      width: 30, height: 30, borderRadius: "50%",
      background: girl ? "#FFFFFF" : "#111111",
      border: `2px solid ${girl ? "#E7E2DA" : "#111111"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, color: girl ? "#111111" : "#FFFFFF",
      flexShrink: 0, fontSize: "0.75rem", fontFamily: "inherit",
    }}>
      {name.charAt(0)}
    </div>
  );
}

function Medal({ rank }) {
  if (rank === 1) return <span style={{ fontSize: "1.1rem" }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: "1.1rem" }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: "1.1rem" }}>🥉</span>;
  return <span style={{ color: COLORS.textSoft, fontWeight: 600, fontSize: "0.85rem" }}>#{rank}</span>;
}

function NumInput({ value, onChange }) {
  return (
    <input
      type="number" min="0"
      value={value}
      onFocus={e => e.target.select()}
      onChange={e => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      style={{ ...inputStyle, padding: "7px 10px", textAlign: "center" }}
    />
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function SoftballApp() {
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);
  const [awards, setAwards] = useState(DEFAULT_AWARDS);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [available, setAvailable] = useState(new Set(DEFAULT_PLAYERS.map(p => p.id)));
  const [lineupNote, setLineupNote] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [tab, setTab] = useState("leaderboard");
  const [sortCat, setSortCat] = useState("runs");
  const [lbFilter, setLbFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newPlayer, setNewPlayer] = useState({ name: "", gender: "male", runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [editingAwards, setEditingAwards] = useState(false);
  const [awardsForm, setAwardsForm] = useState({ ...DEFAULT_AWARDS });
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({});

  // ── Firebase sync ──
  useEffect(() => {
    const unsubs = [];

    const listen = (path, setter) => {
      const r = ref(db, path);
      const unsub = onValue(r, snap => {
        if (snap.exists()) setter(snap.val());
        setLoaded(true);
      }, () => setLoaded(true));
      unsubs.push(unsub);
    };

    onValue(ref(db, "players"), snap => {
      if (snap.exists()) {
        const val = snap.val();
        setPlayers(Array.isArray(val) ? val : Object.values(val));
      }
      setLoaded(true);
    });
    onValue(ref(db, "awards"), snap => { if (snap.exists()) setAwards(snap.val()); });
    onValue(ref(db, "schedule"), snap => {
      if (snap.exists()) {
        const val = snap.val();
        setSchedule(Array.isArray(val) ? val : Object.values(val));
      }
    });
    onValue(ref(db, "available"), snap => {
      if (snap.exists()) setAvailable(new Set(snap.val()));
    });
    onValue(ref(db, "lineupNote"), snap => { if (snap.exists()) setLineupNote(snap.val()); });

    return () => unsubs.forEach(u => u && u());
  }, []);

  const savePlayers = (p) => { setPlayers(p); set(ref(db, "players"), p); };
  const saveAwards  = (a) => { setAwards(a);  set(ref(db, "awards"), a); };
  const saveSchedule = (s) => { setSchedule(s); set(ref(db, "schedule"), s); };
  const saveAvailable = (a) => { setAvailable(a); set(ref(db, "available"), [...a]); };
  const saveLineupNote = (n) => { setLineupNote(n); set(ref(db, "lineupNote"), n); };

  // ── Derived ──
  const filteredPlayers = players.filter(p =>
    lbFilter === "male" ? p.gender === "male" :
    lbFilter === "female" ? p.gender === "female" : true
  );
  const sorted = [...filteredPlayers].sort((a, b) => {
    if (sortCat === "avg") {
      return (b.atbats > 0 ? b.hits / b.atbats : 0) - (a.atbats > 0 ? a.hits / a.atbats : 0);
    }
    return b[sortCat] - a[sortCat];
  });

  const availPlayers = players.filter(p => available.has(p.id));
  const males   = [...availPlayers].filter(p => p.gender === "male").sort((a, b) => getLineupScore(b) - getLineupScore(a));
  const females = [...availPlayers].filter(p => p.gender === "female").sort((a, b) => getLineupScore(b) - getLineupScore(a));
  const lineup  = [];
  for (let i = 0; i < Math.max(males.length, females.length); i++) {
    if (males[i])   lineup.push(males[i]);
    if (females[i]) lineup.push(females[i]);
  }
  const sidelined = players.filter(p => !available.has(p.id));

  const maleRunsLeader   = [...players].filter(p => p.gender === "male").sort((a, b) => b.runs - a.runs)[0];
  const femaleRunsLeader = [...players].filter(p => p.gender === "female").sort((a, b) => b.runs - a.runs)[0];
  const attendanceLeader = [...players].sort((a, b) => (b.gamesPlayed || 0) - (a.gamesPlayed || 0))[0];

  const wins   = schedule.filter(g => g.result === "W").length;
  const losses = schedule.filter(g => g.result === "L").length;

  // ── Handlers ──
  function toggleAvailable(id) {
    const n = new Set(available);
    n.has(id) ? n.delete(id) : n.add(id);
    saveAvailable(n);
  }
  function startEdit(player) { setEditingId(player.id); setEditData({ ...player }); }
  function saveEdit() { savePlayers(players.map(p => p.id === editingId ? { ...editData } : p)); setEditingId(null); }
  function deletePlayer(id) { savePlayers(players.filter(p => p.id !== id)); saveAvailable(new Set([...available].filter(x => x !== id))); }
  function addPlayer() {
    if (!newPlayer.name.trim()) return;
    const id = Date.now();
    const p = { ...newPlayer, id, hotStreak: false, gamesPlayed: 0 };
    savePlayers([...players, p]);
    saveAvailable(new Set([...available, id]));
    setNewPlayer({ name: "", gender: "male", runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0 });
    setShowAdd(false);
  }
  function startEditSchedule(game) { setEditingScheduleId(game.id); setScheduleForm({ ...game }); }
  function saveScheduleGame() {
    saveSchedule(schedule.map(g => g.id === editingScheduleId ? { ...scheduleForm } : g));
    setEditingScheduleId(null);
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: "2rem" }}>🥎</div>
        <div style={{ color: COLORS.textSoft, fontSize: "0.9rem", fontFamily: '"Inter", sans-serif' }}>Loading Buchanan Softball...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", sans-serif', color: COLORS.text }}>

      {/* ── HEADER ── */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "24px 24px 18px", textAlign: "center" }}>
        <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>🥎</div>
        <h1 style={{ margin: 0, fontSize: "clamp(1.3rem, 5vw, 1.9rem)", fontWeight: 700, color: COLORS.text, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Buchanan Softball
        </h1>
        <p style={{ margin: "4px 0 0", color: COLORS.textSoft, fontSize: "0.8rem" }}>
          Season Stats · {wins}W – {losses}L
        </p>
      </div>

      {/* ── TABS ── */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, display: "flex", overflowX: "auto" }}>
        {[
          { key: "leaderboard", label: "Board" },
          { key: "lineup",      label: "Lineup" },
          { key: "schedule",    label: "Schedule" },
          { key: "awards",      label: "Awards" },
          { key: "roster",      label: "Roster" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "13px 4px", border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: "0.75rem", fontWeight: tab === t.key ? 600 : 400,
            background: "transparent", whiteSpace: "nowrap", minWidth: 60,
            color: tab === t.key ? COLORS.text : COLORS.textSoft,
            borderBottom: tab === t.key ? `2px solid ${COLORS.text}` : "2px solid transparent",
            transition: "all 0.2s ease",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* ── LEADERBOARD ── */}
        {tab === "leaderboard" && (
          <div>
            {sorted[0] && (
              <div style={{ background: COLORS.dark, borderRadius: 20, padding: "24px 20px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -10, fontSize: "7rem", opacity: 0.06, lineHeight: 1 }}>🥎</div>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: COLORS.accent, marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>
                  Leading in {sortCat === "avg" ? "Batting Avg" : CAT_LABELS[sortCat]}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <PlayerBadge name={sorted[0].name} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#FFF", letterSpacing: "-0.02em" }}>
                      {sorted[0].name} {sorted[0].hotStreak && "🔥"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      {sorted[0].gamesPlayed || 0} games played
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "2.6rem", fontWeight: 700, color: COLORS.accent, lineHeight: 1, letterSpacing: "-0.03em" }}>
                      {sortCat === "avg" ? (getBattingAvg(sorted[0]) || ".000") : sorted[0][sortCat]}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
                      {sortCat === "avg" ? "AVG" : CAT_LABELS[sortCat]}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 3 }}>
                {[["all","All"],["male","Boys"],["female","Girls"]].map(([v,l]) => (
                  <button key={v} onClick={() => setLbFilter(v)} style={{
                    padding: "5px 13px", borderRadius: 20, border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 600,
                    background: lbFilter === v ? COLORS.dark : "transparent",
                    color: lbFilter === v ? "#FFF" : COLORS.textSoft, transition: "all 0.2s",
                  }}>{l}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {[...CATEGORIES, "avg"].map(cat => (
                <button key={cat} onClick={() => setSortCat(cat)} style={{
                  padding: "6px 13px", borderRadius: 20,
                  border: `1px solid ${sortCat === cat ? COLORS.text : COLORS.border}`,
                  background: sortCat === cat ? COLORS.text : COLORS.card,
                  color: sortCat === cat ? "#FFF" : COLORS.textSoft,
                  fontSize: "0.73rem", cursor: "pointer", fontFamily: "inherit",
                  fontWeight: 500, transition: "all 0.2s",
                }}>
                  {cat === "avg" ? "⚡ AVG" : CAT_LABELS[cat]}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sorted.map((player, i) => {
                const avg = getBattingAvg(player);
                const val = sortCat === "avg" ? (avg || ".000") : player[sortCat];
                return (
                  <div key={player.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 14,
                    background: COLORS.card,
                    border: `1px solid ${i === 0 ? COLORS.accent : COLORS.border}`,
                  }}>
                    <div style={{ width: 26, textAlign: "center", flexShrink: 0 }}><Medal rank={i + 1} /></div>
                    <PlayerBadge name={player.name} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "1.05rem", color: COLORS.text }}>
                        {player.name} {player.hotStreak && "🔥"}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: COLORS.textSoft, marginTop: 2 }}>
                        {avg ? `${avg} AVG · ` : ""}{player.hits}H · {player.runs}R · {player.rbis} RBI
                      </div>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: i === 0 ? COLORS.accent : COLORS.text, letterSpacing: "-0.02em" }}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LINEUP ── */}
        {tab === "lineup" && (
          <div>
            <input
              placeholder="Game note (e.g. vs Riverside · June 4)..."
              value={lineupNote}
              onChange={e => saveLineupNote(e.target.value)}
              style={{ ...inputStyle, marginBottom: 20 }}
            />
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 18, marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Who's playing?</div>
                  <div style={{ fontSize: "0.73rem", color: COLORS.textSoft, marginTop: 2 }}>{available.size} of {players.length} in</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => saveAvailable(new Set(players.map(p => p.id)))} style={{ ...pillBtn, background: "#E8F5E9", color: COLORS.success, border: "none" }}>All In</button>
                  <button onClick={() => saveAvailable(new Set())} style={{ ...pillBtn, background: "#FEEBEE", color: "#C0392B", border: "none" }}>All Out</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {players.map(player => {
                  const isIn = available.has(player.id);
                  return (
                    <div key={player.id} onClick={() => toggleAvailable(player.id)} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "9px 12px",
                      borderRadius: 10, cursor: "pointer", userSelect: "none",
                      background: isIn ? "#F0FAF0" : COLORS.bg,
                      border: `1px solid ${isIn ? "#C8E6C9" : COLORS.border}`,
                      transition: "all 0.15s",
                    }}>
                      <div style={{ width: 32, height: 18, borderRadius: 9, position: "relative", flexShrink: 0, background: isIn ? COLORS.success : COLORS.border, transition: "background 0.2s" }}>
                        <div style={{ position: "absolute", top: 2, left: isIn ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#FFF", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                      </div>
                      <PlayerBadge name={player.name} />
                      <div style={{ flex: 1, fontWeight: 500, fontSize: "0.9rem", color: isIn ? COLORS.text : COLORS.textSoft }}>{player.name}</div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 600, color: isIn ? COLORS.success : COLORS.textSoft }}>{isIn ? "IN" : "OUT"}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {lineup.length > 0 ? (
              <div>
                {lineupNote && <div style={{ textAlign: "center", color: COLORS.textSoft, fontSize: "0.82rem", marginBottom: 12 }}>📋 {lineupNote}</div>}
                <div style={{ fontSize: "0.7rem", color: COLORS.textSoft, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
                  Batting Order · {lineup.length} players
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {lineup.map((player, i) => {
                    const avg = getBattingAvg(player);
                    return (
                      <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 14, background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                        <div style={{ width: 22, fontSize: "0.85rem", fontWeight: 700, color: COLORS.textSoft, textAlign: "center", flexShrink: 0 }}>{i + 1}.</div>
                        <PlayerBadge name={player.name} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "1.05rem", color: COLORS.text }}>{player.name} {player.hotStreak && "🔥"}</div>
                          <div style={{ fontSize: "0.72rem", color: COLORS.textSoft, marginTop: 2 }}>{avg ? `${avg} AVG · ` : ""}{player.hits}H · {player.runs}R</div>
                        </div>
                        <div style={{ fontSize: "0.68rem", fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: player.gender === "female" ? "#F0EEF8" : COLORS.bg, color: player.gender === "female" ? "#5B4F8A" : COLORS.textSoft }}>
                          {player.gender === "female" ? "F" : "M"}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {sidelined.length > 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: "0.7rem", color: COLORS.textSoft, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Sitting out</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {sidelined.map(p => (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: COLORS.card, border: `1px solid ${COLORS.border}`, fontSize: "0.8rem", color: COLORS.textSoft }}>
                          {p.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: COLORS.textSoft }}>
                <div style={{ fontSize: "2rem", marginBottom: 10 }}>😬</div>
                <div style={{ fontWeight: 600 }}>No one's available</div>
                <div style={{ fontSize: "0.82rem", marginTop: 4 }}>Toggle some players in above.</div>
              </div>
            )}
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {tab === "schedule" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>Schedule</div>
                <div style={{ fontSize: "0.78rem", color: COLORS.textSoft, marginTop: 2 }}>All games 6:30 PM · Buchanan Park</div>
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: "0.82rem", fontWeight: 600 }}>
                <span style={{ color: COLORS.success }}>{wins}W</span>
                <span style={{ color: COLORS.textSoft }}>–</span>
                <span style={{ color: "#C0392B" }}>{losses}L</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {schedule.map(game => {
                const isPlayoff = game.diamond === "Playoffs";
                return editingScheduleId === game.id ? (
                  <div key={game.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.accent}`, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 12, color: COLORS.text }}>{game.date} · {game.diamond}</div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      {[["W","Win"],["L","Loss"],["","TBD"]].map(([v,l]) => (
                        <button key={v} onClick={() => setScheduleForm(f => ({ ...f, result: v }))} style={{
                          flex: 1, padding: "8px", borderRadius: 10, border: `1px solid ${scheduleForm.result === v ? COLORS.text : COLORS.border}`,
                          background: scheduleForm.result === v ? COLORS.text : COLORS.card,
                          color: scheduleForm.result === v ? "#FFF" : COLORS.textSoft,
                          fontFamily: "inherit", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                        }}>{l}</button>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: "0.65rem", color: COLORS.textSoft, marginBottom: 4 }}>Our Score</div>
                        <NumInput value={scheduleForm.ourScore || 0} onChange={v => setScheduleForm(f => ({ ...f, ourScore: v }))} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.65rem", color: COLORS.textSoft, marginBottom: 4 }}>Their Score</div>
                        <NumInput value={scheduleForm.theirScore || 0} onChange={v => setScheduleForm(f => ({ ...f, theirScore: v }))} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveScheduleGame} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: COLORS.dark, color: "#FFF", fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Save</button>
                      <button onClick={() => setEditingScheduleId(null)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.text, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div key={game.id} onClick={() => startEditSchedule(game)} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "13px 16px",
                    borderRadius: 14, background: COLORS.card,
                    border: `1px solid ${game.result === "W" ? "#C8E6C9" : game.result === "L" ? "#FFCDD2" : COLORS.border}`,
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", color: isPlayoff ? COLORS.accent : COLORS.text }}>
                        {isPlayoff ? "🏆 " : ""}{game.date}
                      </div>
                      <div style={{ fontSize: "0.73rem", color: COLORS.textSoft, marginTop: 2 }}>{game.diamond}</div>
                    </div>
                    {game.result ? (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: game.result === "W" ? COLORS.success : "#C0392B" }}>
                          {game.result === "W" ? "Win" : "Loss"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: COLORS.textSoft }}>{game.ourScore} – {game.theirScore}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.72rem", color: COLORS.textSoft, background: COLORS.bg, padding: "3px 10px", borderRadius: 20 }}>Tap to add</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── AWARDS ── */}
        {tab === "awards" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>Season Awards</div>
                <div style={{ fontSize: "0.78rem", color: COLORS.textSoft, marginTop: 2 }}>Live standings</div>
              </div>
              {!editingAwards ? (
                <button onClick={() => { setAwardsForm({ ...awards }); setEditingAwards(true); }} style={{ ...pillBtn, background: COLORS.dark, color: "#FFF", border: "none" }}>Edit</button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { saveAwards(awardsForm); setEditingAwards(false); }} style={{ ...pillBtn, background: COLORS.dark, color: "#FFF", border: "none" }}>Save</button>
                  <button onClick={() => setEditingAwards(false)} style={{ ...pillBtn, background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>Cancel</button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <AwardCard icon="🏃" label="Most Runs — Boys"   winner={maleRunsLeader?.name}   value={maleRunsLeader ? `${maleRunsLeader.runs} runs` : "—"} auto />
              <AwardCard icon="🏃" label="Most Runs — Girls"  winner={femaleRunsLeader?.name} value={femaleRunsLeader ? `${femaleRunsLeader.runs} runs` : "—"} auto />
              <AwardCard icon="📅" label="Best Attendance"    winner={attendanceLeader?.name}  value={attendanceLeader ? `${attendanceLeader.gamesPlayed || 0} games` : "—"} auto />
              <AwardCard icon="🧤" label="Craziest Catch"     winner={awards.crazyCatch || "—"} editing={editingAwards} editValue={awardsForm.crazyCatch} onEdit={v => setAwardsForm(f => ({ ...f, crazyCatch: v }))} />
              <AwardCard icon="⭐" label="MVP of the Week"    winner={awards.mvpWeek || "—"}   editing={editingAwards} editValue={awardsForm.mvpWeek}    onEdit={v => setAwardsForm(f => ({ ...f, mvpWeek: v }))} />
              <AwardCard icon="🃏" label="Mid Season Wild Card" winner={awards.wildcard || "—"} editing={editingAwards} editValue={awardsForm.wildcard}   onEdit={v => setAwardsForm(f => ({ ...f, wildcard: v }))} />
            </div>
          </div>
        )}

        {/* ── ROSTER ── */}
        {tab === "roster" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>Roster</div>
                <div style={{ fontSize: "0.78rem", color: COLORS.textSoft, marginTop: 2 }}>{players.length} players</div>
              </div>
              <button onClick={() => setShowAdd(!showAdd)} style={{ ...pillBtn, background: COLORS.dark, color: "#FFF", border: "none" }}>
                {showAdd ? "Cancel" : "+ Add"}
              </button>
            </div>

            {showAdd && (
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 18, marginBottom: 18 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>New Player</div>
                <input placeholder="Name" value={newPlayer.name} onChange={e => setNewPlayer(p => ({ ...p, name: e.target.value }))} style={{ ...inputStyle, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {["male","female"].map(g => (
                    <button key={g} onClick={() => setNewPlayer(p => ({ ...p, gender: g }))} style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1px solid ${newPlayer.gender === g ? COLORS.text : COLORS.border}`, background: newPlayer.gender === g ? COLORS.text : COLORS.card, color: newPlayer.gender === g ? "#FFF" : COLORS.textSoft, fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                      {g === "male" ? "Male" : "Female"}
                    </button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {CATEGORIES.map(cat => (
                    <div key={cat}>
                      <div style={{ fontSize: "0.65rem", color: COLORS.textSoft, marginBottom: 4 }}>{CAT_LABELS[cat]}</div>
                      <NumInput value={newPlayer[cat]} onChange={v => setNewPlayer(p => ({ ...p, [cat]: v }))} />
                    </div>
                  ))}
                </div>
                <button onClick={addPlayer} style={{ width: "100%", padding: "11px", borderRadius: 12, border: "none", background: COLORS.dark, color: "#FFF", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}>
                  Add to Roster
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {players.map(player => (
                <div key={player.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "14px 16px" }}>
                  {editingId === player.id ? (
                    <div>
                      <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} style={{ ...inputStyle, marginBottom: 10, fontWeight: 600 }} />
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        {["male","female"].map(g => (
                          <button key={g} onClick={() => setEditData(d => ({ ...d, gender: g }))} style={{ flex: 1, padding: "7px", borderRadius: 10, border: `1px solid ${editData.gender === g ? COLORS.text : COLORS.border}`, background: editData.gender === g ? COLORS.text : COLORS.card, color: editData.gender === g ? "#FFF" : COLORS.textSoft, fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                            {g === "male" ? "Male" : "Female"}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                        {CATEGORIES.map(cat => (
                          <div key={cat}>
                            <div style={{ fontSize: "0.65rem", color: COLORS.textSoft, marginBottom: 4 }}>{CAT_LABELS[cat]}</div>
                            <NumInput value={editData[cat]} onChange={v => setEditData(d => ({ ...d, [cat]: v }))} />
                          </div>
                        ))}
                        <div>
                          <div style={{ fontSize: "0.65rem", color: COLORS.textSoft, marginBottom: 4 }}>Games Played</div>
                          <NumInput value={editData.gamesPlayed || 0} onChange={v => setEditData(d => ({ ...d, gamesPlayed: v }))} />
                        </div>
                      </div>
                      <button onClick={() => setEditData(d => ({ ...d, hotStreak: !d.hotStreak }))} style={{ width: "100%", padding: "8px", borderRadius: 10, border: `1px solid ${editData.hotStreak ? "#FF6B35" : COLORS.border}`, background: editData.hotStreak ? "#FFF0EB" : COLORS.card, color: editData.hotStreak ? "#FF6B35" : COLORS.textSoft, fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", marginBottom: 10 }}>
                        🔥 Hot Streak {editData.hotStreak ? "ON" : "OFF"}
                      </button>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={saveEdit} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: COLORS.dark, color: "#FFF", fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.text, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <PlayerBadge name={player.name} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "1rem", color: COLORS.text }}>{player.name} {player.hotStreak && "🔥"}</div>
                          <div style={{ fontSize: "0.72rem", color: COLORS.textSoft, marginTop: 1 }}>{player.gender === "female" ? "Female" : "Male"} · {player.gamesPlayed || 0} games</div>
                        </div>
                        <button onClick={() => startEdit(player)} style={iconBtnStyle}>✏️</button>
                        <button onClick={() => deletePlayer(player.id)} style={iconBtnStyle}>🗑️</button>
                      </div>
                      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                        {CATEGORIES.map(cat => (
                          <div key={cat} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "1rem", fontWeight: 700, color: COLORS.text }}>{player[cat]}</div>
                            <div style={{ fontSize: "0.62rem", color: COLORS.textSoft }}>{CAT_LABELS[cat]}</div>
                          </div>
                        ))}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "1rem", fontWeight: 700, color: COLORS.accent }}>{getBattingAvg(player) || "—"}</div>
                          <div style={{ fontSize: "0.62rem", color: COLORS.textSoft }}>AVG</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AwardCard({ icon, label, winner, value, auto, editing, editValue, onEdit }) {
  return (
    <div style={{ background: "#FFF", border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.7rem", color: COLORS.textSoft, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {editing && !auto ? (
          <input value={editValue} onChange={e => onEdit(e.target.value)} placeholder="Enter name..." style={{ ...inputStyle, padding: "6px 10px", fontSize: "0.88rem" }} />
        ) : (
          <div style={{ fontWeight: 700, fontSize: "1rem", color: COLORS.text }}>{winner || "—"}</div>
        )}
      </div>
      {value && !editing && <div style={{ fontSize: "0.78rem", fontWeight: 600, color: COLORS.accent, background: "#FDF8F0", padding: "3px 10px", borderRadius: 20 }}>{value}</div>}
      {auto && <div style={{ fontSize: "0.62rem", color: COLORS.textSoft, background: COLORS.bg, padding: "2px 7px", borderRadius: 8, flexShrink: 0 }}>Auto</div>}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 13px", borderRadius: 10,
  border: `1px solid ${COLORS.border}`, background: COLORS.bg,
  color: COLORS.text, fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", sans-serif',
  fontSize: "0.9rem", boxSizing: "border-box", outline: "none",
};
const pillBtn = { padding: "7px 15px", borderRadius: 20, cursor: "pointer", fontFamily: '"Inter", sans-serif', fontSize: "0.78rem", fontWeight: 600 };
const iconBtnStyle = { background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem", padding: "4px 5px", opacity: 0.5 };
