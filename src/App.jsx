import { useState, useEffect } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const GIRLS = ["Brooke", "Molly O", "Molly K", "Laurel", "Katie", "Taylor"];
const BOYS = ["Tristan", "Evan", "Sean", "Dan", "Kyle", "Yasser", "Victor", "Moose"];

const CATEGORIES = ["runs", "hits", "atbats", "catches", "rbis", "homeruns"];
const CAT_LABELS = { runs: "Runs", hits: "Hits", atbats: "At Bats", catches: "Catches", rbis: "RBIs", homeruns: "HRs" };
const CAT_ICONS = { runs: "🏃", hits: "🥎", atbats: "⚾", catches: "🧤", rbis: "💥", homeruns: "💣" };

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

const DEFAULT_AWARDS = {
  crazyCatch: "",
  wildcard: "",
  mvpWeek: "",
  attendance: "",
};

// ── Helpers ────────────────────────────────────────────────────────────────
function getBattingAvg(p) {
  if (!p.atbats || p.atbats === 0) return null;
  return (p.hits / p.atbats).toFixed(3).replace(/^0/, "");
}

function getLineupScore(p) {
  const avg = p.atbats > 0 ? p.hits / p.atbats : 0;
  return avg * 5 + p.homeruns * 4 + p.rbis * 2 + p.runs * 1;
}

function isGirl(name) {
  return GIRLS.includes(name);
}

function PlayerBadge({ name, size = "sm" }) {
  const girl = isGirl(name);
  const sz = size === "lg" ? { width: 36, height: 36, fontSize: "0.85rem" } : { width: 28, height: 28, fontSize: "0.72rem" };
  return (
    <div style={{
      ...sz,
      borderRadius: "50%",
      background: girl ? "#FFFFFF" : "#111111",
      border: `2px solid ${girl ? "#E7E2DA" : "#111111"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700,
      color: girl ? "#111111" : "#FFFFFF",
      flexShrink: 0,
      fontFamily: "inherit",
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

// ── Main App ───────────────────────────────────────────────────────────────
export default function SoftballApp() {
  const [players, setPlayers] = useState(() => {
    try { const s = localStorage.getItem("bs_players"); return s ? JSON.parse(s) : DEFAULT_PLAYERS; } catch { return DEFAULT_PLAYERS; }
  });
  const [awards, setAwards] = useState(() => {
    try { const s = localStorage.getItem("bs_awards"); return s ? JSON.parse(s) : DEFAULT_AWARDS; } catch { return DEFAULT_AWARDS; }
  });
  const [available, setAvailable] = useState(() => {
    try { const s = localStorage.getItem("bs_available"); if (s) return new Set(JSON.parse(s)); } catch {}
    return new Set(DEFAULT_PLAYERS.map(p => p.id));
  });
  const [tab, setTab] = useState("leaderboard");
  const [sortCat, setSortCat] = useState("runs");
  const [lbFilter, setLbFilter] = useState("all"); // all | male | female
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newPlayer, setNewPlayer] = useState({ name: "", gender: "male", runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [lineupNote, setLineupNote] = useState(() => { try { return localStorage.getItem("bs_note") || ""; } catch { return ""; } });
  const [editingAwards, setEditingAwards] = useState(false);
  const [awardsForm, setAwardsForm] = useState({ ...DEFAULT_AWARDS });

  useEffect(() => { try { localStorage.setItem("bs_players", JSON.stringify(players)); } catch {} }, [players]);
  useEffect(() => { try { localStorage.setItem("bs_awards", JSON.stringify(awards)); } catch {} }, [awards]);
  useEffect(() => { try { localStorage.setItem("bs_available", JSON.stringify([...available])); } catch {} }, [available]);
  useEffect(() => { try { localStorage.setItem("bs_note", lineupNote); } catch {} }, [lineupNote]);

  // Filtered & sorted players for leaderboard
  const filteredPlayers = players.filter(p => {
    if (lbFilter === "male") return p.gender === "male";
    if (lbFilter === "female") return p.gender === "female";
    return true;
  });
  const sorted = [...filteredPlayers].sort((a, b) => {
    if (sortCat === "avg") {
      const aAvg = a.atbats > 0 ? a.hits / a.atbats : 0;
      const bAvg = b.atbats > 0 ? b.hits / b.atbats : 0;
      return bAvg - aAvg;
    }
    return b[sortCat] - a[sortCat];
  });

  // Lineup logic: balance M/F, weight by score
  const availPlayers = players.filter(p => available.has(p.id));
  const males = [...availPlayers].filter(p => p.gender === "male").sort((a, b) => getLineupScore(b) - getLineupScore(a));
  const females = [...availPlayers].filter(p => p.gender === "female").sort((a, b) => getLineupScore(b) - getLineupScore(a));
  const lineup = [];
  const maxLen = Math.max(males.length, females.length);
  for (let i = 0; i < maxLen; i++) {
    if (males[i]) lineup.push(males[i]);
    if (females[i]) lineup.push(females[i]);
  }
  const sidelined = players.filter(p => !available.has(p.id));

  function toggleAvailable(id) {
    setAvailable(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function setAllAvailable(val) {
    setAvailable(val ? new Set(players.map(p => p.id)) : new Set());
  }
  function startEdit(player) { setEditingId(player.id); setEditData({ ...player }); }
  function saveEdit() { setPlayers(ps => ps.map(p => p.id === editingId ? { ...editData, id: p.id } : p)); setEditingId(null); }
  function deletePlayer(id) { setPlayers(ps => ps.filter(p => p.id !== id)); setAvailable(prev => { const n = new Set(prev); n.delete(id); return n; }); }
  function addPlayer() {
    if (!newPlayer.name.trim()) return;
    const id = Date.now();
    setPlayers(ps => [...ps, { ...newPlayer, id, hotStreak: false, gamesPlayed: 0 }]);
    setAvailable(prev => new Set([...prev, id]));
    setNewPlayer({ name: "", gender: "male", runs: 0, hits: 0, atbats: 0, catches: 0, rbis: 0, homeruns: 0 });
    setShowAdd(false);
  }
  function saveAwards() { setAwards({ ...awardsForm }); setEditingAwards(false); }

  const topPlayer = sorted[0];
  const maleRunsLeader = [...players].filter(p => p.gender === "male").sort((a, b) => b.runs - a.runs)[0];
  const femaleRunsLeader = [...players].filter(p => p.gender === "female").sort((a, b) => b.runs - a.runs)[0];
  const attendanceLeader = [...players].sort((a, b) => (b.gamesPlayed || 0) - (a.gamesPlayed || 0))[0];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", sans-serif', color: COLORS.text }}>

      {/* ── HEADER ── */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, padding: "24px 24px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>🥎</div>
        <h1 style={{ margin: 0, fontSize: "clamp(1.4rem, 5vw, 2rem)", fontWeight: 700, color: COLORS.text, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Buchanan Softball
        </h1>
        <p style={{ margin: "4px 0 0", color: COLORS.textSoft, fontSize: "0.82rem", letterSpacing: "0.04em" }}>Season Stats</p>
      </div>

      {/* ── TABS ── */}
      <div style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, display: "flex" }}>
        {[
          { key: "leaderboard", label: "Leaderboard" },
          { key: "lineup", label: "Lineup" },
          { key: "awards", label: "Awards" },
          { key: "roster", label: "Roster" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "14px 4px", border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: "0.75rem", fontWeight: tab === t.key ? 600 : 400,
            background: "transparent",
            color: tab === t.key ? COLORS.text : COLORS.textSoft,
            borderBottom: tab === t.key ? `2px solid ${COLORS.text}` : "2px solid transparent",
            transition: "all 0.2s ease",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px 60px" }}>

        {/* ── LEADERBOARD ── */}
        {tab === "leaderboard" && (
          <div>
            {/* Hero card */}
            {topPlayer && (
              <div style={{ background: COLORS.dark, borderRadius: 20, padding: "28px 24px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -30, right: -20, fontSize: "8rem", opacity: 0.06, lineHeight: 1 }}>🥎</div>
                <div style={{ fontSize: "0.72rem", letterSpacing: "0.12em", color: COLORS.accent, marginBottom: 8, textTransform: "uppercase", fontWeight: 600 }}>
                  Leading in {sortCat === "avg" ? "Batting Avg" : CAT_LABELS[sortCat]}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <PlayerBadge name={topPlayer.name} size="lg" />
                  <div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                      {topPlayer.name} {topPlayer.hotStreak && "🔥"}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", marginTop: 3 }}>
                      {topPlayer.gamesPlayed || 0} games played
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", textAlign: "right" }}>
                    <div style={{ fontSize: "2.8rem", fontWeight: 700, color: COLORS.accent, lineHeight: 1, letterSpacing: "-0.03em" }}>
                      {sortCat === "avg" ? (getBattingAvg(topPlayer) || ".000") : topPlayer[sortCat]}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
                      {sortCat === "avg" ? "AVG" : CAT_LABELS[sortCat]}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 3, gap: 2 }}>
                {[["all", "All"], ["male", "Boys"], ["female", "Girls"]].map(([v, l]) => (
                  <button key={v} onClick={() => setLbFilter(v)} style={{
                    padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 600,
                    background: lbFilter === v ? COLORS.dark : "transparent",
                    color: lbFilter === v ? "#FFFFFF" : COLORS.textSoft,
                    transition: "all 0.2s",
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Stat pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {[...CATEGORIES, "avg"].map(cat => (
                <button key={cat} onClick={() => setSortCat(cat)} style={{
                  padding: "6px 14px", borderRadius: 20,
                  border: `1px solid ${sortCat === cat ? COLORS.text : COLORS.border}`,
                  background: sortCat === cat ? COLORS.text : COLORS.card,
                  color: sortCat === cat ? "#FFFFFF" : COLORS.textSoft,
                  fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit",
                  fontWeight: 500, transition: "all 0.2s",
                }}>
                  {cat === "avg" ? "⚡ AVG" : `${CAT_ICONS[cat]} ${CAT_LABELS[cat]}`}
                </button>
              ))}
            </div>

            {/* Player rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sorted.map((player, i) => {
                const avg = getBattingAvg(player);
                const val = sortCat === "avg" ? (avg || ".000") : player[sortCat];
                return (
                  <div key={player.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px 18px", borderRadius: 16,
                    background: COLORS.card,
                    border: `1px solid ${i === 0 ? COLORS.accent : COLORS.border}`,
                    transition: "all 0.2s",
                  }}>
                    <div style={{ width: 28, textAlign: "center", flexShrink: 0 }}><Medal rank={i + 1} /></div>
                    <PlayerBadge name={player.name} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "1.05rem", color: COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
                        {player.name} {player.hotStreak && <span title="Hot streak">🔥</span>}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: COLORS.textSoft, marginTop: 3 }}>
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
              onChange={e => setLineupNote(e.target.value)}
              style={{ ...inputStyle, marginBottom: 20 }}
            />

            {/* Availability */}
            <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 20, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem", color: COLORS.text }}>Who's playing?</div>
                  <div style={{ fontSize: "0.75rem", color: COLORS.textSoft, marginTop: 2 }}>{available.size} of {players.length} available</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setAllAvailable(true)} style={{ ...pillBtn, background: "#E8F5E9", color: COLORS.success, border: "none" }}>All In</button>
                  <button onClick={() => setAllAvailable(false)} style={{ ...pillBtn, background: "#FEEBEE", color: "#C0392B", border: "none" }}>All Out</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {players.map(player => {
                  const isIn = available.has(player.id);
                  return (
                    <div key={player.id} onClick={() => toggleAvailable(player.id)} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                      background: isIn ? "#F0FAF0" : COLORS.bg,
                      border: `1px solid ${isIn ? "#C8E6C9" : COLORS.border}`,
                      transition: "all 0.15s", userSelect: "none",
                    }}>
                      <div style={{
                        width: 34, height: 20, borderRadius: 10, position: "relative", flexShrink: 0,
                        background: isIn ? COLORS.success : COLORS.border,
                        transition: "background 0.2s",
                      }}>
                        <div style={{
                          position: "absolute", top: 3, left: isIn ? 17 : 3,
                          width: 14, height: 14, borderRadius: "50%",
                          background: "#FFFFFF",
                          transition: "left 0.2s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }} />
                      </div>
                      <PlayerBadge name={player.name} />
                      <div style={{ flex: 1, fontWeight: 500, fontSize: "0.9rem", color: isIn ? COLORS.text : COLORS.textSoft }}>{player.name}</div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 600, color: isIn ? COLORS.success : COLORS.textSoft }}>{isIn ? "IN" : "OUT"}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Generated lineup */}
            {lineup.length > 0 ? (
              <div>
                {lineupNote && (
                  <div style={{ textAlign: "center", color: COLORS.textSoft, fontSize: "0.82rem", marginBottom: 14 }}>📋 {lineupNote}</div>
                )}
                <div style={{ fontSize: "0.72rem", letterSpacing: "0.1em", color: COLORS.textSoft, marginBottom: 10, textTransform: "uppercase", fontWeight: 600 }}>
                  Batting Order · {lineup.length} players
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {lineup.map((player, i) => {
                    const avg = getBattingAvg(player);
                    return (
                      <div key={player.id} style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 18px", borderRadius: 16,
                        background: COLORS.card,
                        border: `1px solid ${COLORS.border}`,
                      }}>
                        <div style={{
                          width: 26, flexShrink: 0,
                          fontSize: "0.85rem", fontWeight: 700,
                          color: COLORS.textSoft,
                          textAlign: "center",
                        }}>{i + 1}.</div>
                        <PlayerBadge name={player.name} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "1.05rem", color: COLORS.text }}>{player.name} {player.hotStreak && "🔥"}</div>
                          <div style={{ fontSize: "0.72rem", color: COLORS.textSoft, marginTop: 2 }}>
                            {avg ? `${avg} AVG · ` : ""}{player.hits}H · {player.runs}R
                          </div>
                        </div>
                        <div style={{ fontSize: "0.7rem", fontWeight: 600, color: player.gender === "female" ? "#5B4F8A" : COLORS.textSoft, background: player.gender === "female" ? "#F0EEF8" : COLORS.bg, padding: "3px 10px", borderRadius: 20 }}>
                          {player.gender === "female" ? "F" : "M"}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {sidelined.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: "0.72rem", color: COLORS.textSoft, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Sitting out</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {sidelined.map(p => (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: COLORS.card, border: `1px solid ${COLORS.border}`, fontSize: "0.8rem", color: COLORS.textSoft }}>
                          <PlayerBadge name={p.name} size="xs" />
                          {p.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "48px 20px", color: COLORS.textSoft }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>😬</div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>No one's available</div>
                <div style={{ fontSize: "0.82rem" }}>Toggle some players in above.</div>
              </div>
            )}
          </div>
        )}

        {/* ── AWARDS ── */}
        {tab === "awards" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>Season Awards</div>
                <div style={{ fontSize: "0.8rem", color: COLORS.textSoft, marginTop: 2 }}>Live season standings</div>
              </div>
              {!editingAwards ? (
                <button onClick={() => { setAwardsForm({ ...awards }); setEditingAwards(true); }} style={{ ...pillBtn, background: COLORS.dark, color: "#FFFFFF", border: "none" }}>Edit</button>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveAwards} style={{ ...pillBtn, background: COLORS.dark, color: "#FFFFFF", border: "none" }}>Save</button>
                  <button onClick={() => setEditingAwards(false)} style={{ ...pillBtn, background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}` }}>Cancel</button>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Auto: Most Runs Male */}
              <AwardCard
                icon="🏃"
                label="Most Runs — Boys"
                winner={maleRunsLeader?.name}
                value={maleRunsLeader ? `${maleRunsLeader.runs} runs` : "—"}
                auto
              />

              {/* Auto: Most Runs Female */}
              <AwardCard
                icon="🏃"
                label="Most Runs — Girls"
                winner={femaleRunsLeader?.name}
                value={femaleRunsLeader ? `${femaleRunsLeader.runs} runs` : "—"}
                auto
              />

              {/* Auto: Best Attendance */}
              <AwardCard
                icon="📅"
                label="Best Attendance"
                winner={attendanceLeader?.name}
                value={attendanceLeader ? `${attendanceLeader.gamesPlayed || 0} games` : "—"}
                auto
              />

              {/* Manual: Craziest Catch */}
              <AwardCard
                icon="🧤"
                label="Craziest Catch"
                winner={awards.crazyCatch || "—"}
                editing={editingAwards}
                editValue={awardsForm.crazyCatch}
                onEdit={v => setAwardsForm(f => ({ ...f, crazyCatch: v }))}
              />

              {/* Manual: MVP of the Week */}
              <AwardCard
                icon="⭐"
                label="MVP of the Week"
                winner={awards.mvpWeek || "—"}
                editing={editingAwards}
                editValue={awardsForm.mvpWeek}
                onEdit={v => setAwardsForm(f => ({ ...f, mvpWeek: v }))}
              />

              {/* Manual: Mid Season Wild Card */}
              <AwardCard
                icon="🃏"
                label="Mid Season Wild Card"
                winner={awards.wildcard || "—"}
                editing={editingAwards}
                editValue={awardsForm.wildcard}
                onEdit={v => setAwardsForm(f => ({ ...f, wildcard: v }))}
              />

            </div>
          </div>
        )}

        {/* ── ROSTER ── */}
        {tab === "roster" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "-0.02em" }}>Roster</div>
                <div style={{ fontSize: "0.8rem", color: COLORS.textSoft, marginTop: 2 }}>{players.length} players</div>
              </div>
              <button onClick={() => setShowAdd(!showAdd)} style={{ ...pillBtn, background: COLORS.dark, color: "#FFFFFF", border: "none" }}>
                {showAdd ? "Cancel" : "+ Add"}
              </button>
            </div>

            {showAdd && (
              <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 20, marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 14 }}>New Player</div>
                <input placeholder="Name" value={newPlayer.name} onChange={e => setNewPlayer(p => ({ ...p, name: e.target.value }))} style={{ ...inputStyle, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  {["male", "female"].map(g => (
                    <button key={g} onClick={() => setNewPlayer(p => ({ ...p, gender: g }))} style={{
                      flex: 1, padding: "8px", borderRadius: 10, border: `1px solid ${newPlayer.gender === g ? COLORS.text : COLORS.border}`,
                      background: newPlayer.gender === g ? COLORS.text : COLORS.card,
                      color: newPlayer.gender === g ? "#FFFFFF" : COLORS.textSoft,
                      fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                    }}>{g === "male" ? "Male (Black)" : "Female (White)"}</button>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {CATEGORIES.map(cat => (
                    <div key={cat}>
                      <div style={{ fontSize: "0.65rem", color: COLORS.textSoft, marginBottom: 4 }}>{CAT_LABELS[cat]}</div>
                      <input type="number" min="0" value={newPlayer[cat]} onChange={e => setNewPlayer(p => ({ ...p, [cat]: Number(e.target.value) }))} style={{ ...inputStyle, padding: "7px 10px" }} />
                    </div>
                  ))}
                </div>
                <button onClick={addPlayer} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: COLORS.dark, color: "#FFFFFF", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}>
                  Add to Roster
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {players.map(player => (
                <div key={player.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "16px 18px" }}>
                  {editingId === player.id ? (
                    <div>
                      <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} style={{ ...inputStyle, marginBottom: 10, fontWeight: 600 }} />
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        {["male", "female"].map(g => (
                          <button key={g} onClick={() => setEditData(d => ({ ...d, gender: g }))} style={{
                            flex: 1, padding: "7px", borderRadius: 10, border: `1px solid ${editData.gender === g ? COLORS.text : COLORS.border}`,
                            background: editData.gender === g ? COLORS.text : COLORS.card,
                            color: editData.gender === g ? "#FFFFFF" : COLORS.textSoft,
                            fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                          }}>{g === "male" ? "Male" : "Female"}</button>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                        {CATEGORIES.map(cat => (
                          <div key={cat}>
                            <div style={{ fontSize: "0.65rem", color: COLORS.textSoft, marginBottom: 4 }}>{CAT_LABELS[cat]}</div>
                            <input type="number" min="0" value={editData[cat]} onChange={e => setEditData(d => ({ ...d, [cat]: Number(e.target.value) }))} style={{ ...inputStyle, padding: "7px 10px" }} />
                          </div>
                        ))}
                        <div>
                          <div style={{ fontSize: "0.65rem", color: COLORS.textSoft, marginBottom: 4 }}>Games Played</div>
                          <input type="number" min="0" value={editData.gamesPlayed || 0} onChange={e => setEditData(d => ({ ...d, gamesPlayed: Number(e.target.value) }))} style={{ ...inputStyle, padding: "7px 10px" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <button onClick={() => setEditData(d => ({ ...d, hotStreak: !d.hotStreak }))} style={{
                          flex: 1, padding: "8px", borderRadius: 10, border: `1px solid ${editData.hotStreak ? "#FF6B35" : COLORS.border}`,
                          background: editData.hotStreak ? "#FFF0EB" : COLORS.card,
                          color: editData.hotStreak ? "#FF6B35" : COLORS.textSoft,
                          fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                        }}>🔥 Hot Streak {editData.hotStreak ? "ON" : "OFF"}</button>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={saveEdit} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: COLORS.dark, color: "#FFFFFF", fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.text, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <PlayerBadge name={player.name} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: "0.95rem", color: COLORS.text }}>{player.name} {player.hotStreak && "🔥"}</div>
                          <div style={{ fontSize: "0.72rem", color: COLORS.textSoft, marginTop: 1 }}>
                            {player.gender === "female" ? "Female" : "Male"} · {player.gamesPlayed || 0} games
                          </div>
                        </div>
                        <button onClick={() => startEdit(player)} style={iconBtnStyle}>✏️</button>
                        <button onClick={() => deletePlayer(player.id)} style={iconBtnStyle}>🗑️</button>
                      </div>
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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

// ── Award Card Component ───────────────────────────────────────────────────
function AwardCard({ icon, label, winner, value, auto, editing, editValue, onEdit }) {
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: "1.6rem", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.72rem", color: COLORS.textSoft, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 4 }}>{label}</div>
        {editing && !auto ? (
          <input
            value={editValue}
            onChange={e => onEdit(e.target.value)}
            placeholder="Enter name..."
            style={{ ...inputStyle, padding: "7px 12px", fontSize: "0.9rem" }}
          />
        ) : (
          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: COLORS.text, letterSpacing: "-0.01em" }}>
            {winner || "—"}
          </div>
        )}
      </div>
      {value && !editing && (
        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: COLORS.accent, background: "#FDF8F0", padding: "4px 12px", borderRadius: 20 }}>{value}</div>
      )}
      {auto && (
        <div style={{ fontSize: "0.65rem", color: COLORS.textSoft, background: COLORS.bg, padding: "3px 8px", borderRadius: 10, flexShrink: 0 }}>Auto</div>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: `1px solid ${COLORS.border}`, background: COLORS.bg,
  color: COLORS.text, fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", sans-serif',
  fontSize: "0.9rem", boxSizing: "border-box", outline: "none",
};

const pillBtn = {
  padding: "7px 16px", borderRadius: 20, cursor: "pointer",
  fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", sans-serif',
  fontSize: "0.78rem", fontWeight: 600,
};

const iconBtnStyle = {
  background: "none", border: "none", cursor: "pointer",
  fontSize: "0.9rem", padding: "4px 6px", opacity: 0.5,
};
