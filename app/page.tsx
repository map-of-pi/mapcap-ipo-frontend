"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  ArrowLeft, Home, HelpCircle, RefreshCw,
  TrendingUp, Users, Coins, ArrowDownCircle, ArrowUpCircle
} from "lucide-react";
import Image from "next/image";
import SpotPriceChart from "@/components/SpotPriceChart";
import { PiAuthButton } from "@/components/PiAuthButton";
import { PiPayButton }  from "@/components/PiPayButton";
import SplashScreen from "@/components/SplashScreen";
import { api } from "@/services/ipoApi";
import { IpoStats, PioneerStats } from "@/types";

interface PricePoint { day: number; price: number; }

function seedRand(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function generateFallbackHistory(): PricePoint[] {
  const r = seedRand(42);
  const pts: PricePoint[] = [];
  let w = 80000 + r() * 20000;
  for (let day = 1; day <= 28; day++) {
    w += 8000 + r() * 12000 - (r() < 0.15 ? r() * 3000 : 0);
    pts.push({ day, price: +(2181818 / w).toFixed(4) });
  }
  return pts;
}
const FALLBACK_HISTORY = generateFallbackHistory();

const DEMO_DAY   = 14;
const IPO_MAPCAP = 2_181_818;

function fmt(n: number, dec = 2) {
  return n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function spotPrice(totalPi: number): number {
  return +(IPO_MAPCAP / Math.max(totalPi, 0.0001)).toFixed(4);
}

export default function MapCapIPOApp() {
  // ── Splash / auth state ──────────────────────────────────────────────
  const [showSplash,  setShowSplash]  = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [pioneerUid,  setPioneerUid]  = useState<string | null>(null);
  const [username,    setUsername]    = useState<string | null>(null);

  // ── Server state ─────────────────────────────────────────────────────
  const [ipoStats,     setIpoStats]    = useState<IpoStats | null>(null);
  const [pioneerStats, setPioneerStats] = useState<PioneerStats | null>(null);

  // ── Stale-closure-safe refs ──────────────────────────────────────────
  const myPiRef    = useRef(0);
  const totalPiRef = useRef(0);

  // ── Display state ────────────────────────────────────────────────────
  const [myPi,       setMyPiState]   = useState(0);
  const [totalPi,    setTotalPiState] = useState(0);
  const [investors,  setInvestors]   = useState(0);
  const [currentDay, setCurrentDay]  = useState(DEMO_DAY);

  const setMyPi    = (v: number) => { myPiRef.current = v;    setMyPiState(v); };
  const setTotalPi = (v: number) => { totalPiRef.current = v; setTotalPiState(v); };

  // ── Chart ────────────────────────────────────────────────────────────
  const [chartData, setChartData] = useState<PricePoint[]>(
    () => FALLBACK_HISTORY.slice(0, DEMO_DAY - 1)
  );

  // ── UI state ─────────────────────────────────────────────────────────
  const [piInput,  setPiInput]  = useState("1.0");
  const [pctInput, setPctInput] = useState("50.0");
  const [toast,    setToast]    = useState({ msg: "", show: false });
  const [spinning, setSpinning] = useState(false);

  // ── Toast ─────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  }, []);

  // ── Chart helpers ────────────────────────────────────────────────────
  const appendChartPoint = useCallback((newTotalPi: number) => {
    setChartData(prev => {
      const lastDay = prev.length ? prev[prev.length - 1].day : currentDay - 1;
      const nextDay = Math.min(+(lastDay + 0.35).toFixed(2), 27.95);
      return [...prev, { day: nextDay, price: spotPrice(newTotalPi) }];
    });
  }, [currentDay]);

  const refreshLastChartPoint = useCallback((newTotalPi: number) => {
    setChartData(prev => {
      if (!prev.length) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], price: spotPrice(newTotalPi) };
      return updated;
    });
  }, []);

  // ── Load public IPO stats on mount ───────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const stats = await api.getStats();
        setIpoStats(stats);
        setTotalPi(stats.totalPiInPool);
        setInvestors(stats.totalInvestors);
        setCurrentDay(stats.currentDay);
        if (stats.spotPriceHistory.length > 0) {
          setChartData(stats.spotPriceHistory.map(p => ({ day: p.day, price: p.price })));
        } else {
          setChartData(FALLBACK_HISTORY.slice(0, stats.currentDay - 1));
        }
      } catch {
        // Backend unreachable — fallback data stays
      }
    })();
  }, []);

  // ── Pi auth success — called by both SplashScreen and inline button ──
  const handlePiAuth = useCallback(async (token: string, uid: string, uname: string) => {
    setAccessToken(token);
    setPioneerUid(uid);
    setUsername(uname);

    try {
      const me = await api.getMe(token);
      setPioneerStats(me);
      setMyPi(me.piBalance);
      showToast(`Welcome, ${me.username || uname} ✓`);
    } catch {
      showToast(`Connected as ${uname}`);
    }

    // Dismiss splash after successful auth
    setShowSplash(false);
  }, [showToast]);

  // ── Invest (called by PiPayButton's onPaymentComplete) ───────────────
  const handleInvest = useCallback(async () => {
    const amt = parseFloat(piInput);
    if (isNaN(amt) || amt < 1) { showToast("Minimum investment is 1 π"); return; }
    if (!accessToken)           { showToast("Connect your Pi wallet first"); return; }

    try {
      const res       = await api.invest(accessToken, amt);
      const newTotalPi = +(totalPiRef.current + amt).toFixed(4);

      setMyPi(res.piBalance);
      setTotalPi(newTotalPi);
      appendChartPoint(newTotalPi);
      showToast(`Invested ${fmt(amt)} π ✓`);

      api.getStats().then(s => {
        setTotalPi(s.totalPiInPool);
        setInvestors(s.totalInvestors);
      }).catch(() => {});
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Invest failed");
    }
  }, [piInput, accessToken, appendChartPoint, showToast]);

  // ── Withdraw ─────────────────────────────────────────────────────────
  const handleWithdraw = useCallback(async () => {
    const pct = parseFloat(pctInput);
    if (isNaN(pct) || pct <= 0 || pct > 100) { showToast("Enter a % between 1–100"); return; }
    if (myPiRef.current <= 0)                 { showToast("No π balance to withdraw"); return; }
    if (!accessToken)                         { showToast("Connect your Pi wallet first"); return; }

    try {
      const res        = await api.withdraw(accessToken, pct);
      const newMyPi    = res.newPiBalance;
      const newTotalPi = +(totalPiRef.current - res.amountReturned).toFixed(4);

      setMyPi(Math.max(0, newMyPi));
      setTotalPi(Math.max(0, newTotalPi));
      appendChartPoint(Math.max(0, newTotalPi));
      showToast(`Withdrawn ${fmt(res.amountReturned)} π ✓`);

      api.getStats().then(s => {
        setTotalPi(s.totalPiInPool);
        setInvestors(s.totalInvestors);
      }).catch(() => {});
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Withdraw failed");
    }
  }, [pctInput, accessToken, appendChartPoint, showToast]);

  // ── Refresh ──────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    setSpinning(true);
    try {
      const [stats, me] = await Promise.all([
        api.getStats(),
        accessToken ? api.getMe(accessToken) : Promise.resolve(null),
      ]);

      setIpoStats(stats);
      setTotalPi(stats.totalPiInPool);
      setInvestors(stats.totalInvestors);
      setCurrentDay(stats.currentDay);

      if (me) { setPioneerStats(me); setMyPi(me.piBalance); }

      refreshLastChartPoint(stats.totalPiInPool);
      showToast("Data refreshed");
    } catch {
      showToast("Refresh failed — check connection");
    } finally {
      setSpinning(false);
    }
  }, [accessToken, refreshLastChartPoint, showToast]);

  // ── Derived values ────────────────────────────────────────────────────
  const progressPct = Math.round((currentDay / 28) * 100);
  const latestSpot  = chartData.length ? chartData[chartData.length - 1].price : null;
  const capitalGain = +(myPi * 1.2).toFixed(4);
  const pctNum      = parseFloat(pctInput || "0");
  const withdrawAmt = +(myPiRef.current * (isNaN(pctNum) ? 0 : pctNum / 100)).toFixed(4);
  const piAmt       = parseFloat(piInput) || 0;

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="phone-shell">

      {/* ── SPLASH SCREEN ── */}
      {showSplash && (
        <SplashScreen
          onAuthSuccess={handlePiAuth}
          showToast={showToast}
        />
      )}

      {/* ── MAIN APP (rendered behind splash; visible after auth) ── */}
      <nav className="navbar">
        <div className="navbar-title-row">
          <Image
            src="/token-logo.png"
            alt="MapCap"
            width={24} height={24}
            className="navbar-logo"
          />
          <span className="navbar-title">MapCapIPO</span>
        </div>
        <div className="navbar-icons">
          <button className="nav-btn inactive" aria-label="Back">
            <ArrowLeft size={19} strokeWidth={2.2}/>
          </button>
          <button className="nav-btn inactive" aria-label="Home">
            <Home size={19} strokeWidth={2.2}/>
          </button>
          {/* Re-auth button in place of static token icon */}
          <PiAuthButton
            onAuthSuccess={handlePiAuth}
            showToast={showToast}
            className="nav-token-btn"
          >
            <Image src="/token-logo.png" alt="π" width={28} height={28} style={{ borderRadius:"50%" }}/>
          </PiAuthButton>
          <button className="nav-btn active" aria-label="Help"
            onClick={() => window.open("https://chatwithmac.com", "_blank")}>
            <HelpCircle size={19} strokeWidth={2.2}/>
          </button>
          <button className="nav-btn active" aria-label="Refresh" onClick={handleRefresh}>
            <RefreshCw size={19} strokeWidth={2.2}
              style={{ animation: spinning ? "spin 0.8s linear infinite" : "none" }}/>
          </button>
        </div>
      </nav>

      {/* Phase strip */}
      <div className="phase-strip">
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div className="day-dot"/>
          <span className="phase-text">IPO PHASE · DAY {currentDay} OF 28</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span className="phase-text">{progressPct}%</span>
          <div className="phase-bar-wrap">
            <div className="phase-bar-fill" style={{ width:`${progressPct}%` }}/>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="screen-body">

        {/* Chart */}
        <section className="chart-section fade-up">
          <div className="chart-label">MapCap Spot-price</div>
          <SpotPriceChart data={chartData} currentDay={currentDay}/>
        </section>

        {/* Stats */}
        <section className="stats-section fade-up delay-1">
          <div className="stats-title">MapCapIPO Statistics</div>
          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-label">Total investors<br/>to date</div>
              <div className="stat-value green">{investors.toLocaleString()}</div>
              <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:4 }}>
                <Users size={11} color="var(--text-muted)"/>
                <span style={{ fontSize:10, color:"var(--text-muted)" }}>unique pioneers</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Total π invested<br/>to date</div>
              <div className="stat-value green">
                {fmt(totalPi, 0)}<span className="stat-unit">π</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:4 }}>
                <Coins size={11} color="var(--text-muted)"/>
                <span style={{ fontSize:10, color:"var(--text-muted)" }}>in escrow</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Your π invested<br/>to date</div>
              <div className="stat-value green">
                {fmt(myPi)}<span className="stat-unit">π</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:4 }}>
                <ArrowDownCircle size={11} color="var(--text-muted)"/>
                <span style={{ fontSize:10, color:"var(--text-muted)" }}>your balance</span>
              </div>
            </div>

            <div className="stat-card gold-accent">
              <div className="stat-label">Your capital<br/>gain to date</div>
              <div className="stat-value gain">
                {fmt(capitalGain)}<span className="stat-unit">π</span>
              </div>
              <div className="gain-pill">
                <TrendingUp size={10}/>&nbsp;+20% on LP open
              </div>
            </div>
          </div>

          {latestSpot !== null && (
            <div style={{
              marginTop:10, background:"var(--white)",
              border:"1px solid var(--border)", borderRadius:10,
              padding:"9px 13px", display:"flex",
              alignItems:"center", justifyContent:"space-between"
            }}>
              <span style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                Current spot-price
              </span>
              <span style={{ fontFamily:"'Crimson Pro',serif", fontSize:18, fontWeight:600, color:"var(--green)" }}>
                {latestSpot.toFixed(4)}&thinsp;<span style={{ fontSize:13, fontStyle:"italic" }}>π / MapCap</span>
              </span>
            </div>
          )}

          {/* Auth status */}
          <div style={{
            marginTop:8, fontSize:10,
            color: accessToken ? "#1A6B35" : "var(--text-muted)",
            display:"flex", alignItems:"center", gap:5
          }}>
            <div style={{
              width:7, height:7, borderRadius:"50%",
              background: accessToken ? "#2D7A52" : "#C8DCC8",
              flexShrink: 0,
            }}/>
            {accessToken
              ? `${username ?? pioneerUid?.slice(0,8)} · connected`
              : "Not connected — tap the token icon to authenticate"}
          </div>
        </section>

        {/* Actions */}
        <section className="actions-section fade-up delay-2">

          {/* Invest row — uses PiPayButton (payment only, auth already done) */}
          <div>
            <div className="action-row-label">Invest pi</div>
            <div className="action-row">
              <div className="input-wrap">
                <input type="number" className="pi-input"
                  value={piInput} min="1" step="0.5"
                  onChange={e => setPiInput(e.target.value)}
                  onFocus={e => e.target.select()}/>
                <span className="input-suffix">π</span>
              </div>
              <PiPayButton
                paymentData={{ amount: piAmt, memo: "MapCapIPO investment", metadata: { type: "invest" } }}
                accessToken={accessToken}
                onPaymentComplete={handleInvest}
                onError={err => showToast(err.message)}
                showToast={showToast}
                className="action-btn"
              >
                <ArrowDownCircle size={16} strokeWidth={2}/>
                Invest pi
              </PiPayButton>
            </div>
          </div>

          {/* Withdraw row — plain button, no Pi payment needed */}
          <div>
            <div className="action-row-label">Withdraw balance</div>
            <div className="action-row">
              <div className="input-wrap">
                <input type="number" className="pi-input"
                  value={pctInput} min="0.01" max="100" step="5"
                  onChange={e => setPctInput(e.target.value)}
                  onFocus={e => e.target.select()}/>
                <span className="input-suffix">%</span>
              </div>
              <button className="action-btn withdraw" onClick={handleWithdraw}>
                <ArrowUpCircle size={16} strokeWidth={2}/>
                Withdraw pi
              </button>
            </div>
            {myPi > 0 && withdrawAmt > 0 && (
              <div style={{ marginTop:6, fontSize:11, color:"var(--text-muted)", paddingLeft:2 }}>
                ≈ {fmt(withdrawAmt)} π returned (gas deducted)
              </div>
            )}
          </div>

          {/* Fine print */}
          <div style={{
            marginTop:"auto", padding:"10px 0 0",
            borderTop:"1px solid var(--border)",
            fontSize:10, color:"var(--text-muted)", lineHeight:1.7
          }}>
            Invest: Pi U2A transfer · You pay gas.<br/>
            Withdraw: EscrowPi A2UaaS · Gas deducted from amount.<br/>
            IPO phase ends {ipoStats
              ? new Date(ipoStats.ipoEndDate).toLocaleDateString(undefined, { day:"numeric", month:"long", year:"numeric" })
              : "28 March 2026"} (UTC).
          </div>
        </section>
      </div>

      {/* Toast */}
      <div className={`toast${toast.show ? " show" : ""}`}>{toast.msg}</div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}