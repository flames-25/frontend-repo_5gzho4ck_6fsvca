import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Spline from '@splinetool/react-spline'

function interpretAQI(aqi) {
  const v = Number(aqi)
  if (!Number.isFinite(v) || v < 0)
    return makeState('Unknown', '#94a3b8', 'Enter a valid AQI to begin.', '🤔', 'neutral')
  if (v <= 50) return makeState('Good', '#22c55e', 'Air is fresh and clear. Breathe easy.', '😌', 'good')
  if (v <= 100) return makeState('Moderate', '#eab308', 'Air is acceptable, but be mindful outdoors.', '🙂', 'moderate')
  if (v <= 150) return makeState('Unhealthy for Sensitive', '#f59e0b', 'Sensitive groups should reduce outdoor activity.', '😷', 'ufs')
  if (v <= 200) return makeState('Unhealthy', '#ef4444', 'Air is unhealthy. Limit outdoor exposure.', '😟', 'unhealthy')
  if (v <= 300) return makeState('Very Unhealthy', '#a855f7', 'Stay indoors and use air purifiers.', '⚠️', 'very')
  return makeState('Hazardous', '#7f1d1d', 'Critical! Avoid outdoor air at all costs.', '🚨', 'hazard')
}

function makeState(category, color, message, emoji, key) {
  return {
    key,
    category,
    color,
    message,
    emoji,
    glowFrom: tint(color, 1.35),
    glowTo: tint(color, 0.7),
  }
}

function tint(hex, factor = 1) {
  try {
    const h = hex.startsWith('#') ? hex.slice(1) : hex
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    const bigint = parseInt(full, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    const t = (v) => Math.max(0, Math.min(255, Math.round(v * factor)))
    return `rgb(${t(r)}, ${t(g)}, ${t(b)})`
  } catch {
    return hex
  }
}

function formatTimestamp(date) {
  return date.toLocaleString(undefined, {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    year: 'numeric', month: 'short', day: '2-digit'
  })
}

export default function App() {
  const [aqiInput, setAqiInput] = useState('')
  const [aqi, setAqi] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [lastRead, setLastRead] = useState(null)

  const state = useMemo(() => interpretAQI(aqi ?? aqiInput), [aqi, aqiInput])

  const onScan = () => {
    const v = Number(aqiInput)
    if (!Number.isFinite(v) || v < 0) {
      setAqi(null)
      setLastRead(new Date())
      // brief scan pulse anyway
      setScanning(true)
      setTimeout(() => setScanning(false), 1600)
      return
    }
    setScanning(true)
    setTimeout(() => {
      setAqi(v)
      setLastRead(new Date())
      setScanning(false)
    }, 1200)
  }

  const tips = [
    'Switch to public transport today.',
    'Plant a tree; clean the air.',
    'Avoid idling your car engine.',
    'Use energy-efficient appliances.',
    'Carry a reusable mask on high AQI days.'
  ]

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#070815] text-white">
      {/* Background Spline hero */}
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        {/* subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,24,40,0.2),rgba(7,8,21,0.9))]" />
      </div>

      {/* Decorative scanning lines and particles */}
      <div className={`pointer-events-none absolute inset-0 mix-blend-screen ${scanning ? 'opacity-60' : 'opacity-20'} transition-opacity duration-700`}>
        <div className="absolute inset-0 bg-scan" />
        <Particles active={true} color={state.color} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 sm:px-10 py-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-[0_0_30px_rgba(99,102,241,0.6)]" />
            <div className="text-xl sm:text-2xl font-semibold tracking-wide">
              AeroSense <span className="opacity-70 text-sm sm:text-base">— The Air Quality Guardian</span>
            </div>
          </div>
          <div className="text-xs sm:text-sm opacity-70">Ready for 2030</div>
        </header>

        {/* Main panel */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 sm:gap-10 px-6 sm:px-10 pb-12 items-stretch">
          {/* Left: Avatar + readout */}
          <section className="relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden">
            {/* glow ring */}
            <div className="pointer-events-none absolute -inset-24 bg-[conic-gradient(from_90deg_at_50%_50%,_rgba(59,130,246,0.15),_rgba(168,85,247,0.15),_rgba(59,130,246,0.15))] blur-3xl" />

            <div className="relative p-6 sm:p-10 flex flex-col lg:flex-row gap-8 items-center">
              <AeroAvatar color={state.color} glowFrom={state.glowFrom} glowTo={state.glowTo} mood={state.emoji} scanning={scanning} />

              <div className="flex-1 w-full">
                <div className="text-3xl sm:text-4xl font-semibold tracking-wide flex items-center gap-3">
                  <span style={{ color: state.color }}>{state.category}</span>
                  <AnimatePresence>
                    {scanning && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10">
                        scanning…
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-2 text-sm sm:text-base opacity-80">{state.message}</div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <MetricCard label="AQI" value={Number.isFinite(Number(aqi)) ? Number(aqi) : '—'} color={state.color} />
                  <MetricCard label="Category" value={state.category} />
                  <MetricCard label="Last Reading" value={lastRead ? formatTimestamp(lastRead) : '—'} />
                </div>
              </div>
            </div>
          </section>

          {/* Right: Input panel + tips */}
          <section className="space-y-6">
            {/* Input */}
            <div className="relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 sm:p-8 overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{
                background: `radial-gradient(1200px_400px_at_20%_-20%, ${state.glowFrom}20, transparent 60%), radial-gradient(800px_300px_at_120%_120%, ${state.glowTo}25, transparent 60%)`
              }} />
              <div className="relative">
                <div className="text-lg font-medium mb-4">Enter AQI</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="rounded-xl bg-white/5 border border-white/10 focus-within:border-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),_0_0_0_8px_rgba(99,102,241,0.04)] transition-colors">
                      <input
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={aqiInput}
                        onChange={(e) => setAqiInput(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g., 87"
                        className="w-full bg-transparent outline-none px-4 py-3 text-xl tracking-wider placeholder-white/40"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onScan}
                    className="relative px-5 py-3 rounded-xl font-semibold tracking-wide bg-gradient-to-br from-cyan-500 to-fuchsia-500 text-white shadow-[0_10px_30px_rgba(168,85,247,0.35)] border border-white/10"
                  >
                    <span className="relative z-10">Scan Air Quality</span>
                    <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                  </motion.button>
                </div>
                <div className="mt-3 text-xs opacity-70">Aero will analyze and display the environment mood.</div>
              </div>
            </div>

            {/* Tips */}
            <div className="relative rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 sm:p-8">
              <div className="text-lg font-medium mb-4">Daily Eco Tips</div>
              <ul className="space-y-3">
                {tips.map((t, i) => (
                  <li key={i} className="group flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors">
                    <span className="mt-0.5 h-2 w-2 rounded-full" style={{ background: state.color }} />
                    <span className="flex-1 opacity-90 group-hover:opacity-100">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="px-6 sm:px-10 pb-8 text-xs opacity-60">© {new Date().getFullYear()} AeroSense — Futuristic air insights.</footer>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
      <div className="text-[11px] uppercase tracking-widest opacity-60">{label}</div>
      <div className="mt-1 text-xl font-semibold" style={color ? { color } : undefined}>{String(value)}</div>
    </div>
  )
}

function AeroAvatar({ color, glowFrom, glowTo, mood, scanning }) {
  return (
    <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px]">
      {/* glow halo */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(closest-side, ${glowFrom}, transparent 70%)`
        }}
        animate={{ opacity: scanning ? [0.6, 1, 0.6] : 0.7 }}
        transition={{ duration: 2.2, repeat: scanning ? Infinity : 0 }}
      />

      {/* core orb */}
      <motion.div
        className="absolute inset-6 sm:inset-8 rounded-full shadow-2xl border border-white/10 backdrop-blur-xl"
        style={{
          background: `radial-gradient(circle_at_30%_30%, ${glowFrom}, ${glowTo})`,
          boxShadow: `0 0 50px ${glowFrom}55, inset 0 0 40px ${glowTo}33`
        }}
        animate={{
          y: scanning ? [0, -6, 0] : [0, -4, 0],
          rotate: scanning ? [0, 3, 0, -3, 0] : [0, 1.5, 0, -1.5, 0]
        }}
        transition={{ duration: scanning ? 1.4 : 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* facial hint */}
      <div className="absolute inset-0 flex items-center justify-center text-5xl select-none" style={{ color }}>
        <span className="drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">{mood}</span>
      </div>

      {/* ring scanner */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            key="ring"
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: color }}
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 1.05, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function Particles({ active, color }) {
  const dots = Array.from({ length: 24 })
  return (
    <div className="absolute inset-0">
      {dots.map((_, i) => (
        <span
          key={i}
          className="absolute block rounded-full particle"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53) % 100}%`,
            background: color,
            opacity: active ? 0.5 : 0.2,
            animationDelay: `${(i % 12) * 0.25}s`
          }}
        />
      ))}
    </div>
  )
}
