'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Wifi, Phone, Clock, Lightbulb, Globe,
  Bell, ExternalLink, CheckCircle2, Eye, EyeOff,
  Megaphone, Lock, Save, Zap, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/lib/useStore'
import { getStore, setFacilitySettings, setAnnouncement } from '@/lib/store'
import type { FacilitySettings, AnnouncementType } from '@/lib/store'

const SCENE_OPTIONS = [
  { value: 'dawn',    label: '夜明け',   emoji: '🌅' },
  { value: 'morning', label: '朝',       emoji: '☀️' },
  { value: 'day',     label: '昼',       emoji: '🌤' },
  { value: 'evening', label: 'くつろぎ', emoji: '🕯️' },
  { value: 'reading', label: '読書',     emoji: '📖' },
  { value: 'sleep',   label: '就寝',     emoji: '🌙' },
]

const ANNOUNCEMENT_TYPES: { value: AnnouncementType; label: string; color: string }[] = [
  { value: 'welcome',  label: 'ようこそ',   color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  { value: 'info',     label: 'お知らせ',   color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' },
  { value: 'reminder', label: 'リマインダー', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  { value: 'promo',    label: 'プロモ',     color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' },
]

const LANGUAGE_OPTIONS = [
  { code: 'ja', label: '日本語',  flag: '🇯🇵' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文',    flag: '🇨🇳' },
  { code: 'ko', label: '한국어',  flag: '🇰🇷' },
  { code: 'fr', label: 'Français',flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

type ToastType = 'facility' | 'announcement' | 'pin' | null

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-4 py-3 rounded-2xl shadow-xl whitespace-nowrap"
        >
          <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  addon,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  addon?: React.ReactNode
}) {
  return (
    <div>
      <label className="text-xs text-zinc-500 mb-1 block">{label}</label>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all pr-10"
        />
        {addon && <div className="absolute right-3">{addon}</div>}
      </div>
    </div>
  )
}

export default function OwnerSettingsPage() {
  const [store, update] = useStore()
  const [toast, setToast] = useState<ToastType>(null)

  // Facility settings state — mirror from store
  const fs = store.facilitySettings
  const [wifiName, setWifiName] = useState(fs.wifiName)
  const [wifiPassword, setWifiPassword] = useState(fs.wifiPassword)
  const [checkInTime, setCheckInTime] = useState(fs.checkInTime)
  const [checkOutTime, setCheckOutTime] = useState(fs.checkOutTime)
  const [defaultScene, setDefaultScene] = useState(fs.defaultLightingScene)
  const [ownerPhone, setOwnerPhone] = useState(fs.ownerPhone)
  const [emergencyPhone, setEmergencyPhone] = useState(fs.emergencyPhone)
  const [hostMsgJa, setHostMsgJa] = useState(fs.hostWelcomeMessage)
  const [hostMsgEn, setHostMsgEn] = useState(fs.hostWelcomeMessageEn)
  const [showPassword, setShowPassword] = useState(false)

  // Announcement state
  const activeAnn = store.announcements.find(a => a.active) ?? null
  const [annContent, setAnnContent] = useState('')
  const [annContentEn, setAnnContentEn] = useState('')
  const [annType, setAnnType] = useState<AnnouncementType>('info')

  // PIN state
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [showPin, setShowPin] = useState(false)

  // Language state (decorative)
  const [enabledLangs, setEnabledLangs] = useState(['ja', 'en'])

  // Sync facility settings if store updates externally
  useEffect(() => {
    setWifiName(store.facilitySettings.wifiName)
    setWifiPassword(store.facilitySettings.wifiPassword)
    setCheckInTime(store.facilitySettings.checkInTime)
    setCheckOutTime(store.facilitySettings.checkOutTime)
    setDefaultScene(store.facilitySettings.defaultLightingScene)
    setOwnerPhone(store.facilitySettings.ownerPhone)
    setEmergencyPhone(store.facilitySettings.emergencyPhone)
    setHostMsgJa(store.facilitySettings.hostWelcomeMessage)
    setHostMsgEn(store.facilitySettings.hostWelcomeMessageEn)
  }, [store.facilitySettings])

  const showToast = (type: ToastType) => {
    setToast(type)
    setTimeout(() => setToast(null), 2500)
  }

  const saveFacilitySettings = () => {
    const newSettings: FacilitySettings = {
      wifiName,
      wifiPassword,
      checkInTime,
      checkOutTime,
      defaultLightingScene: defaultScene,
      ownerPhone,
      emergencyPhone,
      hostWelcomeMessage: hostMsgJa,
      hostWelcomeMessageEn: hostMsgEn,
    }
    setFacilitySettings(newSettings)
    update({ facilitySettings: newSettings })
    showToast('facility')
  }

  const saveAnnouncement = () => {
    if (!annContent.trim()) return
    setAnnouncement({
      content: annContent.trim(),
      contentEn: annContentEn.trim(),
      type: annType,
      active: true,
    })
    update({ announcements: getStore().announcements })
    setAnnContent('')
    setAnnContentEn('')
    showToast('announcement')
  }

  const savePin = () => {
    setPinError('')
    const storedPin = localStorage.getItem('NEXT_PUBLIC_OWNER_PIN') ?? (process.env.NEXT_PUBLIC_OWNER_PIN ?? '1234')
    if (currentPin !== storedPin) {
      setPinError('現在のPINが正しくありません')
      return
    }
    if (newPin.length < 4) {
      setPinError('新しいPINは4桁以上で入力してください')
      return
    }
    if (newPin !== confirmPin) {
      setPinError('新しいPINと確認PINが一致しません')
      return
    }
    localStorage.setItem('NEXT_PUBLIC_OWNER_PIN', newPin)
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
    showToast('pin')
  }

  const toggleLang = (code: string) => {
    setEnabledLangs(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    )
  }

  const toastMessages: Record<NonNullable<ToastType>, string> = {
    facility: '施設設定を保存しました',
    announcement: 'お知らせを設定しました',
    pin: 'PINコードを変更しました',
  }

  return (
    <>
      <Toast message={toast ? toastMessages[toast] : ''} visible={toast !== null} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-5 pb-4"
      >
        {/* Header */}
        <div>
          <h1 className="text-xl font-medium text-zinc-100">設定</h1>
          <p className="text-sm text-zinc-500 mt-0.5">施設情報・アプリの設定</p>
        </div>

        {/* ── FACILITY SETTINGS ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-4 flex items-center gap-2">
            <Shield size={14} className="text-blue-400" />
            施設基本情報
          </h2>
          <div className="space-y-3.5">
            {/* Check-in/out times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block flex items-center gap-1">
                  <Clock size={10} /> チェックイン
                </label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={e => setCheckInTime(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block flex items-center gap-1">
                  <Clock size={10} /> チェックアウト
                </label>
                <input
                  type="time"
                  value={checkOutTime}
                  onChange={e => setCheckOutTime(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* WiFi */}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block flex items-center gap-1">
                <Wifi size={10} /> Wi-Fi ネットワーク名
              </label>
              <input
                type="text"
                value={wifiName}
                onChange={e => setWifiName(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Wi-Fi パスワード</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={wifiPassword}
                  onChange={e => setWifiPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Phones */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block flex items-center gap-1">
                  <Phone size={10} /> ホスト電話
                </label>
                <input
                  type="tel"
                  value={ownerPhone}
                  onChange={e => setOwnerPhone(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block flex items-center gap-1">
                  <Bell size={10} /> 緊急連絡先
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            {/* Host welcome messages */}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">ホストメッセージ（日本語）</label>
              <textarea
                rows={2}
                value={hostMsgJa}
                onChange={e => setHostMsgJa(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">ホストメッセージ（英語）</label>
              <textarea
                rows={2}
                value={hostMsgEn}
                onChange={e => setHostMsgEn(e.target.value)}
                placeholder="Host welcome message in English"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              />
            </div>

            {/* Default lighting scene */}
            <div>
              <label className="text-xs text-zinc-500 mb-2 block flex items-center gap-1">
                <Lightbulb size={10} /> チェックイン時のデフォルト照明シーン
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SCENE_OPTIONS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDefaultScene(value)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs transition-all ${
                      defaultScene === value
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    <span className="text-base">{emoji}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={saveFacilitySettings}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-sm font-medium transition-all active:scale-98"
            >
              <Save size={14} /> 施設設定を保存
            </button>
          </div>
        </div>

        {/* ── ANNOUNCEMENT ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-4 flex items-center gap-2">
            <Megaphone size={14} className="text-emerald-400" />
            お知らせ設定
          </h2>

          {/* Current announcement */}
          {activeAnn && (
            <div className="mb-4 p-3 bg-zinc-800/50 border border-zinc-700 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-emerald-400">現在のお知らせ</span>
                <span className="text-[10px] text-zinc-600 ml-auto">
                  {ANNOUNCEMENT_TYPES.find(t => t.value === activeAnn.type)?.label}
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{activeAnn.content}</p>
              {activeAnn.contentEn && (
                <p className="text-xs text-zinc-500 leading-relaxed mt-1">{activeAnn.contentEn}</p>
              )}
            </div>
          )}

          <div className="space-y-3">
            {/* Announcement type */}
            <div>
              <label className="text-xs text-zinc-500 mb-2 block">種別</label>
              <div className="flex flex-wrap gap-2">
                {ANNOUNCEMENT_TYPES.map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setAnnType(value)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      annType === value ? color : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">内容（日本語）</label>
              <textarea
                rows={2}
                value={annContent}
                onChange={e => setAnnContent(e.target.value)}
                placeholder="ゲストへのお知らせ内容..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 mb-1 block">内容（英語）</label>
              <textarea
                rows={2}
                value={annContentEn}
                onChange={e => setAnnContentEn(e.target.value)}
                placeholder="Announcement in English (optional)..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
              />
            </div>

            <button
              onClick={saveAnnouncement}
              disabled={!annContent.trim()}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Megaphone size={14} /> お知らせを設定する
            </button>
          </div>
        </div>

        {/* ── PIN CHANGE ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-4 flex items-center gap-2">
            <Lock size={14} className="text-amber-400" />
            PINコード変更
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">現在のPIN</label>
              <div className="relative flex items-center">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={currentPin}
                  onChange={e => setCurrentPin(e.target.value)}
                  placeholder="現在のPINを入力"
                  maxLength={8}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 pr-10 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                >
                  {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">新しいPIN</label>
              <input
                type={showPin ? 'text' : 'password'}
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                placeholder="4〜8桁"
                maxLength={8}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">新しいPIN（確認）</label>
              <input
                type={showPin ? 'text' : 'password'}
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value)}
                placeholder="もう一度入力"
                maxLength={8}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            {pinError && (
              <p className="text-xs text-red-400">{pinError}</p>
            )}
            <button
              onClick={savePin}
              disabled={!currentPin || !newPin || !confirmPin}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl py-3 text-sm font-medium transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Lock size={14} /> PINコードを変更する
            </button>
            <p className="text-[10px] text-zinc-600 text-center">
              PINはブラウザの localStorage に保存されます（NEXT_PUBLIC_OWNER_PIN）
            </p>
          </div>
        </div>

        {/* ── LANGUAGE SETTINGS ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-4 flex items-center gap-2">
            <Globe size={14} className="text-purple-400" />
            多言語対応
          </h2>
          <p className="text-xs text-zinc-500 mb-3">AIコンシェルジュが対応する言語</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {LANGUAGE_OPTIONS.map(({ code, label, flag }) => (
              <button
                key={code}
                type="button"
                onClick={() => toggleLang(code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                  enabledLangs.includes(code)
                    ? 'border-purple-500/40 bg-purple-500/10 text-purple-300'
                    : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'
                }`}
              >
                <span>{flag}</span>
                {label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-zinc-600">
            ※ Gemini は自動的にユーザーの言語を検出して回答します
          </p>
        </div>

        {/* ── LIGHTING HARDWARE SETUP ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-1 flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            照明ハードウェア設定
          </h2>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            Zigbee2MQTT または DALI-2 ゲートウェイへの接続設定と動作確認ができます。
            ウィザードに従うだけで設定が完了します。
          </p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: '📡', label: 'Zigbee2MQTT', sub: '無線接続' },
              { icon: '⚡', label: 'DALI-2', sub: '有線制御' },
              { icon: '🔗', label: '接続テスト', sub: 'リアルタイム' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{icon}</div>
                <p className="text-[11px] font-medium text-zinc-300">{label}</p>
                <p className="text-[10px] text-zinc-600">{sub}</p>
              </div>
            ))}
          </div>
          <Link href="/owner/lighting-setup">
            <button className="w-full flex items-center justify-center gap-2 bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/18 text-blue-400 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98]">
              照明設定ウィザードを開く <ArrowRight size={14} />
            </button>
          </Link>
        </div>

        {/* ── ECUANEST LINKS ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-zinc-200 mb-3">ECUANEST 連携</h2>
          <div className="space-y-2">
            <a
              href="https://ecuanest.co.jp/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border border-zinc-700 rounded-xl hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
            >
              <span className="text-sm text-zinc-300">ECUANEST 公式サイト</span>
              <ExternalLink size={13} className="text-zinc-500" />
            </a>
            <a
              href="https://ecuanest.co.jp/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 border border-zinc-700 rounded-xl hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
            >
              <span className="text-sm text-zinc-300">パートナーポータル</span>
              <ExternalLink size={13} className="text-zinc-500" />
            </a>
          </div>
        </div>
      </motion.div>
    </>
  )
}
