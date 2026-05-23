import { useState, useEffect } from "react";

const CATEGORIES = ["runs", "hits", "catches", "rbis", "homeruns"];
const CAT_LABELS = { runs: "Runs", hits: "Hits", catches: "Catches", rbis: "RBIs", homeruns: "HRs" };
const CAT_ICONS = { runs: "🏃", hits: "🥎", catches: "🧤", rbis: "💥", homeruns: "💣" };

const DEFAULT_PLAYERS = [
  { id: 1, name: "Tristan", runs: 4, hits: 7, catches: 3, rbis: 5, homeruns: 1 },
  { id: 2, name: "Jake", runs: 6, hits: 5, catches: 2, rbis: 4, homeruns: 2 },
  { id: 3, name: "Marcus", runs: 3, hits: 8, catches: 5, rbis: 6, homeruns: 0 },
  { id: 4, name: "Devon", runs: 5, hits: 4, catches: 4, rbis: 3, homeruns: 1 },
  { id: 5, name: "Sam", runs: 7, hits: 6, catches: 1, rbis: 7, homeruns: 3 },
  { id: 6, name: "Chris", runs: 2, hits: 3, catches: 6, rbis: 2, homeruns: 0 },
];

function getLineupScore(p) {
  return p.hits * 3 + p.homeruns * 5 + p.rbis * 2 + p.runs * 1;
}

function Medal({ rank }) {
  if (rank === 1) return <span style={{ fontSize: "1.2rem" }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: "1.2rem" }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: "1.2rem" }}>🥉</span>;
  return <span style={{ color: "#8b7355", fontWeight: 700, fontSize: "0.9rem" }}>#{rank}</span>;
}

export default function SoftballApp() {
  const [players, setPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem("softball_players");
      return saved ? JSON.parse(saved) : DEFAULT_PLAYERS;
    } catch { return DEFAULT_PLAYERS; }
  });

  // availability is a Set of player IDs who are IN for this game (persisted separately)
  const [available, setAvailable] = useState(() => {
    try {
      const saved = localStorage.getItem("softball_available");
      if (saved) return new Set(JSON.parse(saved));
    } catch {}
    return new Set(DEFAULT_PLAYERS.map(p => p.id));
  });

  const [tab, setTab] = useState("leaderboard");
  const [sortCat, setSortCat] = useState("runs");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newPlayer, setNewPlayer] = useState({ name: "", runs: 0, hits: 0, catches: 0, rbis: 0, homeruns: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [lineupNote, setLineupNote] = useState(() => {
    try { return localStorage.getItem("softball_note") || ""; } catch { return ""; }
  });

  useEffect(() => {
    try { localStorage.setItem("softball_players", JSON.stringify(players)); } catch {}
  }, [players]);

  useEffect(() => {
    try { localStorage.setItem("softball_available", JSON.stringify([...available])); } catch {}
  }, [available]);

  useEffect(() => {
    try { localStorage.setItem("softball_note", lineupNote); } catch {}
  }, [lineupNote]);

  // When a new player is added, default them to available
  function addPlayer() {
    if (!newPlayer.name.trim()) return;
    const id = Date.now();
    setPlayers(ps => [...ps, { ...newPlayer, id }]);
    setAvailable(prev => new Set([...prev, id]));
    setNewPlayer({ name: "", runs: 0, hits: 0, catches: 0, rbis: 0, homeruns: 0 });
    setShowAdd(false);
  }

  function toggleAvailable(id) {
    setAvailable(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function setAllAvailable(val) {
    setAvailable(val ? new Set(players.map(p => p.id)) : new Set());
  }

  const sorted = [...players].sort((a, b) => b[sortCat] - a[sortCat]);
  const lineup = [...players]
    .filter(p => available.has(p.id))
    .sort((a, b) => getLineupScore(b) - getLineupScore(a));
  const sidelined = [...players].filter(p => !available.has(p.id));

  function startEdit(player) {
    setEditingId(player.id);
    setEditData({ ...player });
  }

  function saveEdit() {
    setPlayers(ps => ps.map(p => p.id === editingId ? { ...editData, id: p.id } : p));
    setEditingId(null);
  }

  function deletePlayer(id) {
    setPlayers(ps => ps.filter(p => p.id !== id));
    setAvailable(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  function resetAll() {
    if (window.confirm("Reset to sample data?")) {
      setPlayers(DEFAULT_PLAYERS);
      setAvailable(new Set(DEFAULT_PLAYERS.map(p => p.id)));
    }
  }

  const topPlayer = sorted[0];
  const availCount = available.size;
  const totalCount = players.length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      fontFamily: "'Georgia', serif",
      color: "#f0e6d3",
      padding: "0 0 60px 0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #c8a96e 0%, #e8d5a3 50%, #c8a96e 100%)",
        padding: "28px 24px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: "2.4rem", marginBottom: "4px" }}>🥎</div>
          <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 5vw, 2.4rem)", fontWeight: 900, color: "#1a1a2e", letterSpacing: "0.05em", textTransform: "uppercase", textShadow: "0 1px 0 rgba(255,255,255,0.3)" }}>
            Rec League Stats
          </h1>
          <p style={{ margin: "4px 0 0", color: "#3d2b0e", fontSize: "0.85rem", letterSpacing: "0.1em" }}>SEASON LEADERBOARD</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(200,169,110,0.2)" }}>
        {["leaderboard", "lineup", "roster"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "14px 8px", border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: "0.8rem", letterSpacing: "0.12em",
            textTransform: "uppercase", fontWeight: 700, transition: "all 0.2s",
            background: tab === t ? "rgba(200,169,110,0.15)" : "transparent",
            color: tab === t ? "#c8a96e" : "#8b7a6b",
            borderBottom: tab === t ? "2px solid #c8a96e" : "2px solid transparent",
          }}>
            {t === "leaderboard" ? "🏆 Board" : t === "lineup" ? "📋 Lineup" : "👥 Roster"}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 0" }}>

        {/* ── LEADERBOARD ── */}
        {tab === "leaderboard" && (
          <div>
            {topPlayer && (
              <div style={{
                background: "linear-gradient(135deg, rgba(200,169,110,0.15), rgba(200,169,110,0.05))",
                border: "1px solid rgba(200,169,110,0.4)", borderRadius: "16px",
                padding: "20px", marginBottom: "24px", textAlign: "center", position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: -20, right: -20, fontSize: "8rem", opacity: 0.05, lineHeight: 1 }}>🥇</div>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "#c8a96e", marginBottom: "6px", textTransform: "uppercase" }}>
                  Leading in {CAT_LABELS[sortCat]}
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "#f0e6d3" }}>{topPlayer.name}</div>
                <div style={{ fontSize: "3rem", fontWeight: 900, color: "#c8a96e", lineHeight: 1.1 }}>{topPlayer[sortCat]}</div>
                <div style={{ fontSize: "0.75rem", color: "#8b7a6b", marginTop: "4px" }}>{CAT_ICONS[sortCat]} {CAT_LABELS[sortCat]} this season</div>
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#8b7a6b", marginBottom: "8px", textTransform: "uppercase" }}>Sort by stat</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSortCat(cat)} style={{
                    padding: "6px 14px", borderRadius: "20px", border: "1px solid",
                    borderColor: sortCat === cat ? "#c8a96e" : "rgba(200,169,110,0.2)",
                    background: sortCat === cat ? "rgba(200,169,110,0.2)" : "transparent",
                    color: sortCat === cat ? "#c8a96e" : "#8b7a6b",
                    fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit",
                    fontWeight: sortCat === cat ? 700 : 400, transition: "all 0.15s",
                  }}>
                    {CAT_ICONS[cat]} {CAT_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sorted.map((player, i) => (
                <div key={player.id} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px", borderRadius: "12px",
                  background: i === 0 ? "linear-gradient(90deg, rgba(200,169,110,0.2), rgba(200,169,110,0.05))" : "rgba(255,255,255,0.04)",
                  border: i === 0 ? "1px solid rgba(200,169,110,0.3)" : "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ width: 32, textAlign: "center" }}><Medal rank={i + 1} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: i === 0 ? "#f0e6d3" : "#c4b49a" }}>{player.name}</div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                      {CATEGORIES.map(cat => (
                        <span key={cat} style={{ fontSize: "0.7rem", color: cat === sortCat ? "#c8a96e" : "#6b5d4f", fontWeight: cat === sortCat ? 700 : 400 }}>
                          {CAT_ICONS[cat]}{player[cat]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: i === 0 ? "#c8a96e" : "#6b5d4f", minWidth: 40, textAlign: "right" }}>
                    {player[sortCat]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LINEUP ── */}
        {tab === "lineup" && (
          <div>
            {/* Game note */}
            <input
              placeholder="Game note (e.g. vs Thundercats · May 21)..."
              value={lineupNote}
              onChange={e => setLineupNote(e.target.value)}
              style={{ ...inputStyle, marginBottom: "16px" }}
            />

            {/* Availability section */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(200,169,110,0.15)",
              borderRadius: "14px",
              padding: "16px",
              marginBottom: "20px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#c8a96e", fontWeight: 700 }}>
                    Who's playing?
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6b5d4f", marginTop: "2px" }}>
                    {availCount} of {totalCount} available
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => setAllAvailable(true)} style={{ ...smallBtn, borderColor: "rgba(100,200,100,0.3)", color: "#7db87d" }}>All In</button>
                  <button onClick={() => setAllAvailable(false)} style={{ ...smallBtn, borderColor: "rgba(200,100,100,0.3)", color: "#b87d7d" }}>All Out</button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {players.map(player => {
                  const isIn = available.has(player.id);
                  return (
                    <div key={player.id} onClick={() => toggleAvailable(player.id)} style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 14px", borderRadius: "10px", cursor: "pointer",
                      background: isIn ? "rgba(100,180,100,0.08)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isIn ? "rgba(100,180,100,0.25)" : "rgba(255,255,255,0.05)"}`,
                      transition: "all 0.15s",
                      userSelect: "none",
                    }}>
                      {/* Toggle pill */}
                      <div style={{
                        width: 36, height: 20, borderRadius: 10, position: "relative", flexShrink: 0,
                        background: isIn ? "#4caf50" : "rgba(255,255,255,0.1)",
                        transition: "background 0.2s",
                      }}>
                        <div style={{
                          position: "absolute", top: 3, left: isIn ? 19 : 3,
                          width: 14, height: 14, borderRadius: "50%",
                          background: isIn ? "#fff" : "rgba(255,255,255,0.4)",
                          transition: "left 0.2s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                        }} />
                      </div>
                      <div style={{ flex: 1, fontWeight: 600, fontSize: "0.92rem", color: isIn ? "#d4f0d4" : "#6b5d4f" }}>
                        {player.name}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: isIn ? "#4caf50" : "#6b5d4f", fontWeight: 700, letterSpacing: "0.08em" }}>
                        {isIn ? "IN" : "OUT"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Generated Lineup */}
            {lineup.length > 0 ? (
              <div>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#8b7a6b", marginBottom: "10px", textTransform: "uppercase" }}>
                  Batting Order · {lineup.length} players
                </div>
                {lineupNote && (
                  <div style={{ textAlign: "center", color: "#c8a96e", fontSize: "0.82rem", marginBottom: "12px", letterSpacing: "0.04em" }}>
                    📋 {lineupNote}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {lineup.map((player, i) => {
                    const score = getLineupScore(player);
                    const maxScore = getLineupScore(lineup[0]);
                    const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
                    return (
                      <div key={player.id} style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        padding: "14px 16px", borderRadius: "12px",
                        background: "rgba(255,255,255,0.04)",
                        border: i === 0 ? "1px solid rgba(200,169,110,0.25)" : "1px solid rgba(255,255,255,0.06)",
                        position: "relative", overflow: "hidden",
                      }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "rgba(200,169,110,0.06)", transition: "width 0.5s ease" }} />
                        <div style={{
                          position: "relative", width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                          background: i === 0 ? "#c8a96e" : "rgba(200,169,110,0.15)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: 900,
                          color: i === 0 ? "#1a1a2e" : "#c8a96e",
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, position: "relative" }}>
                          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f0e6d3" }}>{player.name}</div>
                          <div style={{ fontSize: "0.72rem", color: "#6b5d4f", marginTop: "2px" }}>
                            {player.hits} H · {player.homeruns} HR · {player.rbis} RBI · {player.runs} R
                          </div>
                        </div>
                        <div style={{ position: "relative", textAlign: "right" }}>
                          <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#c8a96e" }}>{score}</div>
                          <div style={{ fontSize: "0.65rem", color: "#6b5d4f", letterSpacing: "0.1em" }}>SCORE</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sidelined */}
                {sidelined.length > 0 && (
                  <div style={{ marginTop: "20px" }}>
                    <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#6b5d4f", marginBottom: "8px", textTransform: "uppercase" }}>
                      Sitting out ({sidelined.length})
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {sidelined.map(p => (
                        <div key={p.id} style={{
                          padding: "5px 12px", borderRadius: "20px",
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          fontSize: "0.8rem", color: "#6b5d4f",
                        }}>
                          {p.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                color: "#6b5d4f", fontSize: "0.9rem",
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>😬</div>
                No one's available for this game!<br />
                <span style={{ fontSize: "0.8rem" }}>Toggle some players in above.</span>
              </div>
            )}
          </div>
        )}

        {/* ── ROSTER ── */}
        {tab === "roster" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "0.75rem", color: "#8b7a6b", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {players.length} Players
              </div>
              <button onClick={() => setShowAdd(!showAdd)} style={{
                padding: "8px 16px", borderRadius: "8px",
                border: "1px solid #c8a96e", background: "rgba(200,169,110,0.1)",
                color: "#c8a96e", fontSize: "0.8rem", cursor: "pointer",
                fontFamily: "inherit", fontWeight: 700,
              }}>
                {showAdd ? "✕ Cancel" : "+ Add Player"}
              </button>
            </div>

            {showAdd && (
              <div style={{ background: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.3)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                <div style={{ fontSize: "0.75rem", color: "#c8a96e", marginBottom: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>New Player</div>
                <input placeholder="Name" value={newPlayer.name} onChange={e => setNewPlayer(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "8px" }}>
                  {CATEGORIES.map(cat => (
                    <div key={cat}>
                      <div style={{ fontSize: "0.65rem", color: "#8b7a6b", marginBottom: "3px" }}>{CAT_ICONS[cat]} {CAT_LABELS[cat]}</div>
                      <input type="number" min="0" value={newPlayer[cat]} onChange={e => setNewPlayer(p => ({ ...p, [cat]: Number(e.target.value) }))} style={{ ...inputStyle, padding: "6px 10px" }} />
                    </div>
                  ))}
                </div>
                <button onClick={addPlayer} style={{ marginTop: "12px", width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "#c8a96e", color: "#1a1a2e", fontWeight: 900, fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.05em" }}>
                  ADD TO ROSTER
                </button>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {players.map(player => (
                <div key={player.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "14px 16px" }}>
                  {editingId === player.id ? (
                    <div>
                      <input value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} style={{ ...inputStyle, marginBottom: "8px", fontWeight: 700 }} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        {CATEGORIES.map(cat => (
                          <div key={cat}>
                            <div style={{ fontSize: "0.65rem", color: "#8b7a6b", marginBottom: "3px" }}>{CAT_ICONS[cat]} {CAT_LABELS[cat]}</div>
                            <input type="number" min="0" value={editData[cat]} onChange={e => setEditData(d => ({ ...d, [cat]: Number(e.target.value) }))} style={{ ...inputStyle, padding: "6px 10px" }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                        <button onClick={saveEdit} style={{ ...btnStyle, background: "#c8a96e", color: "#1a1a2e", flex: 1 }}>Save</button>
                        <button onClick={() => setEditingId(null)} style={{ ...btnStyle, flex: 1 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f0e6d3" }}>{player.name}</div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => startEdit(player)} style={iconBtn}>✏️</button>
                          <button onClick={() => deletePlayer(player.id)} style={iconBtn}>🗑️</button>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {CATEGORIES.map(cat => (
                          <div key={cat} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "0.65rem", color: "#6b5d4f" }}>{CAT_ICONS[cat]}</div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#c8a96e" }}>{player[cat]}</div>
                            <div style={{ fontSize: "0.6rem", color: "#6b5d4f", letterSpacing: "0.05em" }}>{CAT_LABELS[cat]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button onClick={resetAll} style={{ marginTop: "20px", width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,100,100,0.2)", background: "rgba(255,100,100,0.05)", color: "rgba(255,120,120,0.6)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.05em" }}>
              Reset to Sample Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: "8px",
  border: "1px solid rgba(200,169,110,0.2)", background: "rgba(0,0,0,0.3)",
  color: "#f0e6d3", fontFamily: "inherit", fontSize: "0.9rem",
  boxSizing: "border-box", outline: "none",
};

const btnStyle = {
  padding: "8px 14px", borderRadius: "8px",
  border: "1px solid rgba(200,169,110,0.3)", background: "transparent",
  color: "#c8a96e", fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit",
};

const smallBtn = {
  padding: "5px 10px", borderRadius: "6px", border: "1px solid",
  background: "transparent", fontSize: "0.72rem", cursor: "pointer",
  fontFamily: "inherit", fontWeight: 700,
};

const iconBtn = {
  background: "none", border: "none", cursor: "pointer",
  fontSize: "0.9rem", padding: "2px 4px", opacity: 0.6,
};
