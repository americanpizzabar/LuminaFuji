'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Globe, Bell, Shield, ExternalLink, CheckCircle2 } from 'lucide-react'

export default function OwnerSettingsPage() {
  const [saved, setSaved] = useState('')
  const [wifiName, setWifiName] = useState('LuminaFuji_5G')
  const [wifiPass, setWifiPass] = useState('fuji2024view')
  const [checkIn, setCheckIn] = useState('16:00')
  const [checkOut, setCheckOut] = useState('11:00')
  const [defaultScene, setDefaultScene] = useState('evening')
  const [lang, setLang] = useState(['ja', 'en'])

  const save = (section: string) => {
    setSaved(section)
    setTimeout(() => setSaved(''), 2500)
  }

  const toggleLang = (code: string) => {
    setLang((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="mb-5">
        <h1 className="text-xl font-medium text-zinc-100">設定</h1>
        <p className="text-sm text-zinc-500 mt-0.5">施設情報・アプリの設定</p>
      </div>

      {/* Facility Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-zinc-200 mb-4 flex items-center gap-2">
          <Shield size={14} className="text-blue-400" />
          施設情報
        </h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">チェックイン</label>
              <input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">チェックアウト</label>
              <input
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Wi-Fi ネットワーク名</label>
            <input
              type="text"
              value={wifiName}
              onChange={(e) => setWifiName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Wi-Fi パスワード</label>
            <input
              type="text"
              value={wifiPass}
              onChange={(e) => setWifiPass(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button
            onClick={() => save('facility')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-sm font-medium transition-all"
          >
            {saved === 'facility' ? <><CheckCircle2 size={14} /> 保存しました</> : '保存する'}
          </button>
        </div>
      </div>

      {/* Lighting Default */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-zinc-200 mb-4 flex items-center gap-2">
          <Lightbulb size={14} className="text-gold-400" />
          照明デフォルト設定
        </h2>
        <div>
          <label className="text-xs text-zinc-500 mb-2 block">チェックイン時のデフォルトシーン</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'dawn', label: '夜明け', emoji: '🌅' },
              { value: 'morning', label: '朝', emoji: '☀️' },
              { value: 'evening', label: 'くつろぎ', emoji: '🕯️' },
              { value: 'reading', label: '読書', emoji: '📖' },
              { value: 'sleep', label: '就寝', emoji: '🌙' },
              { value: 'day', label: '昼', emoji: '🌤' },
            ].map(({ value, label, emoji }) => (
              <button
                key={value}
                onClick={() => setDefaultScene(value)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-xs transition-all ${
                  defaultScene === value
                    ? 'border-gold-500/40 bg-gold-500/10 text-gold-300'
                    : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                }`}
              >
                <span>{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => save('lighting')}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2.5 text-sm font-medium transition-all mt-3"
        >
          {saved === 'lighting' ? <><CheckCircle2 size={14} /> 保存しました</> : '保存する'}
        </button>
      </div>

      {/* Language */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-zinc-200 mb-4 flex items-center gap-2">
          <Globe size={14} className="text-purple-400" />
          多言語対応
        </h2>
        <p className="text-xs text-zinc-500 mb-3">AIコンシェルジュが対応する言語</p>
        <div className="flex flex-wrap gap-2">
          {[
            { code: 'ja', label: '日本語', flag: '🇯🇵' },
            { code: 'en', label: 'English', flag: '🇺🇸' },
            { code: 'zh', label: '中文', flag: '🇨🇳' },
            { code: 'ko', label: '한국어', flag: '🇰🇷' },
            { code: 'fr', label: 'Français', flag: '🇫🇷' },
            { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
          ].map(({ code, label, flag }) => (
            <button
              key={code}
              onClick={() => toggleLang(code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                lang.includes(code)
                  ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                  : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
              }`}
            >
              <span>{flag}</span>
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          ※ Gemini は自動的にユーザーの言語を検出して回答します
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-zinc-200 mb-4 flex items-center gap-2">
          <Bell size={14} className="text-emerald-400" />
          通知設定
        </h2>
        <div className="space-y-3">
          {[
            { label: '新しい相談リクエスト', desc: 'フォーム送信時にメール通知', enabled: true },
            { label: 'ゲストのチェックイン', desc: 'フェーズ変更時に通知', enabled: true },
            { label: '新しい寄せ書き投稿', desc: '投稿があった際に通知', enabled: false },
          ].map(({ label, desc, enabled }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-300">{label}</p>
                <p className="text-xs text-zinc-600">{desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full transition-all ${enabled ? 'bg-blue-500' : 'bg-zinc-700'} relative flex-shrink-0`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ECUANEST Link */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-zinc-200 mb-3">ECUANEST 連携</h2>
        <div className="space-y-2">
          <a
            href="https://ecuanest.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-zinc-700 rounded-xl hover:border-zinc-600 transition-all"
          >
            <span className="text-sm text-zinc-300">ECUANEST 公式サイト</span>
            <ExternalLink size={13} className="text-zinc-500" />
          </a>
          <a
            href="https://ecuanest.com/partner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-zinc-700 rounded-xl hover:border-zinc-600 transition-all"
          >
            <span className="text-sm text-zinc-300">パートナーポータル</span>
            <ExternalLink size={13} className="text-zinc-500" />
          </a>
        </div>
      </div>
    </motion.div>
  )
}
