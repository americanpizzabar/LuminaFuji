'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Wrench, Sparkles, Copy, Check, ExternalLink,
  ChevronDown, ArrowLeft, Wifi, Key, Globe,
  Lightbulb, MessageCircle, Map, BookOpen, Camera,
  Bell, BarChart2, CalendarDays, ClipboardList,
  Users, Star, Settings
} from 'lucide-react'
import Link from 'next/link'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="ml-2 text-zinc-600 hover:text-zinc-300 transition-colors"
      title="コピー"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  )
}

function PortalCard({
  href, icon, color, bg, border, title, sub, pin, pinLabel,
}: {
  href: string; icon: React.ReactNode; color: string; bg: string; border: string
  title: string; sub: string; pin?: string; pinLabel?: string
}) {
  const [origin, setOrigin] = useState('')
  useEffect(() => { setOrigin(window.location.origin) }, [])
  const url = origin ? `${origin}${href}` : href

  return (
    <div className={`rounded-2xl border ${border} ${bg} p-5`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-base font-semibold ${color}`}>{title}</p>
          <p className="text-xs text-zinc-500 mt-0.5 mb-2">{sub}</p>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
            <code className="text-xs text-zinc-300 truncate flex-1">{url}</code>
            <CopyButton text={url} />
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-300 transition-colors">
              <ExternalLink size={12} />
            </a>
          </div>
          {pin && (
            <div className="mt-2 flex items-center gap-2">
              <Key size={12} className="text-zinc-600 flex-shrink-0" />
              <span className="text-xs text-zinc-500">{pinLabel}:</span>
              <code className="text-xs font-bold text-zinc-200 tracking-widest">{pin}</code>
              <CopyButton text={pin} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({
  id, title, emoji, children,
}: {
  id: string; title: string; emoji: string; children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <section id={id} className="mb-8">
      <button
        className="w-full flex items-center gap-3 mb-4 text-left group"
        onClick={() => setOpen(!open)}
      >
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-lg font-semibold text-zinc-100 flex-1">{title}</h2>
        <ChevronDown
          size={18}
          className={`text-zinc-500 transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open && <div>{children}</div>}
    </section>
  )
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-800/60 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-200">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function EnvRow({ name, desc, example }: { name: string; desc: string; example: string }) {
  return (
    <div className="py-3 border-b border-zinc-800/60 last:border-0">
      <div className="flex items-center gap-2 mb-1">
        <code className="text-xs font-bold text-gold-400">{name}</code>
        <CopyButton text={name} />
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
      <div className="mt-1.5 flex items-center gap-2 bg-zinc-900 rounded-lg px-2 py-1">
        <span className="text-[11px] text-zinc-600">例:</span>
        <code className="text-[11px] text-zinc-400">{example}</code>
      </div>
    </div>
  )
}

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-10 pb-20">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
              <ArrowLeft size={18} className="text-zinc-300" />
            </Link>
            <div>
              <p className="text-xs text-zinc-500 tracking-widest uppercase">Lumina Fuji Residence</p>
              <h1 className="text-xl font-semibold text-zinc-100">ユーザーマニュアル</h1>
            </div>
          </div>

          {/* Summary Banner */}
          <div className="card p-5 mb-8 border-gold-500/20 bg-gradient-to-br from-amber-950/30 to-zinc-900">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gold-400 text-lg">✦</span>
              <span className="text-sm font-semibold text-gold-300">このアプリについて</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Lumina Fuji Residence Webアプリは、<strong className="text-zinc-200">ゲスト・管理会社・オーナー</strong>の3者が連携する民泊運営プラットフォームです。
              ゲストは施設を快適に利用でき、管理会社は清掃・業務を効率化し、オーナーは収益・データをリアルタイムで把握できます。
            </p>
          </div>

          {/* TOC */}
          <div className="card p-4 mb-8">
            <p className="text-xs text-zinc-500 mb-3 uppercase tracking-widest">目次</p>
            <div className="space-y-1.5">
              {[
                { href: '#access', label: 'アクセスリンク一覧', emoji: '🔗' },
                { href: '#guest', label: 'ゲスト用アプリ', emoji: '🏠' },
                { href: '#manager', label: '管理会社用アプリ', emoji: '🔧' },
                { href: '#owner', label: 'オーナー用アプリ', emoji: '🛡️' },
                { href: '#lighting', label: '照明（Zigbee）設定', emoji: '💡' },
                { href: '#env', label: '環境変数・設定', emoji: '⚙️' },
                { href: '#faq', label: 'よくある質問', emoji: '❓' },
              ].map(({ href, label, emoji }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center gap-2 text-sm text-zinc-400 hover:text-gold-400 transition-colors py-1"
                >
                  <span className="text-base">{emoji}</span>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── ACCESS LINKS ── */}
        <Section id="access" title="アクセスリンク一覧" emoji="🔗">
          <div className="space-y-3">
            <PortalCard
              href="/login"
              icon={<Sparkles size={22} className="text-gold-400" />}
              color="text-gold-300"
              bg="bg-amber-950/20"
              border="border-gold-500/20"
              title="ゲスト用アプリ"
              sub="お客様向け · Magic Link ログイン"
              pinLabel="デモモードでそのまま体験可"
            />
            <PortalCard
              href="/manager"
              icon={<Wrench size={22} className="text-teal-400" />}
              color="text-teal-300"
              bg="bg-teal-950/20"
              border="border-teal-500/20"
              title="管理会社用アプリ"
              sub="清掃・業務管理 · PIN認証"
              pin="5678"
              pinLabel="管理者PINコード（デモ）"
            />
            <PortalCard
              href="/owner"
              icon={<Shield size={22} className="text-blue-400" />}
              color="text-blue-300"
              bg="bg-blue-950/20"
              border="border-blue-500/20"
              title="オーナー用アプリ"
              sub="収益・ゲスト管理 · PIN認証"
              pin="1234"
              pinLabel="オーナーPINコード（デモ）"
            />
          </div>
          <div className="mt-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500">
              💡 <strong className="text-zinc-400">ブックマーク推奨:</strong> 各URLをスマートフォンのホーム画面に追加するとPWAとして使用できます。
            </p>
          </div>
        </Section>

        {/* ── GUEST ── */}
        <Section id="guest" title="ゲスト用アプリ" emoji="🏠">
          {/* Login */}
          <div className="card p-5 mb-4">
            <p className="text-sm font-semibold text-zinc-200 mb-1">ログイン方法</p>
            <p className="text-xs text-zinc-500 mb-3">
              <code className="text-gold-400">/login</code> にアクセスし、予約時のメールアドレスまたは電話番号を入力するとマジックリンクが届きます。
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg">
                <span className="text-lg">📧</span>
                <div>
                  <p className="text-xs font-medium text-zinc-300">メールアドレスでログイン</p>
                  <p className="text-[11px] text-zinc-600">予約時のメールにリンクを送信</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg">
                <span className="text-lg">📱</span>
                <div>
                  <p className="text-xs font-medium text-zinc-300">SMS（電話番号）でログイン</p>
                  <p className="text-[11px] text-zinc-600">登録電話番号にSMSリンクを送信</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-lg border border-gold-500/20">
                <span className="text-lg">✨</span>
                <div>
                  <p className="text-xs font-medium text-gold-400">デモモード（ログイン不要）</p>
                  <p className="text-[11px] text-zinc-500">「予約済」「滞在中」「滞在後」のいずれかを選択してすぐ体験</p>
                </div>
              </div>
            </div>
          </div>

          {/* Phases */}
          <div className="card p-5 mb-4">
            <p className="text-sm font-semibold text-zinc-200 mb-3">3つのフェーズ</p>
            <div className="space-y-2">
              {[
                { emoji: '📅', phase: '予約済 (Booked)', desc: 'チェックインまでのカウントダウン、WiFiパスワード、施設ガイド、照明のプレビュー' },
                { emoji: '🏠', phase: '滞在中 (Staying)', desc: 'リアルタイム照明コントロール、サービスリクエスト、AIコンシェルジュ、周辺スポット' },
                { emoji: '✨', phase: '滞在後 (Post Stay)', desc: 'パーソナライズされた照明提案、寄せ書き、ECUANEST製品の購入・相談' },
              ].map(({ emoji, phase, desc }) => (
                <div key={phase} className="flex gap-3 p-2">
                  <span className="text-xl flex-shrink-0">{emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">{phase}</p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="card overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-zinc-800">
              <p className="text-sm font-semibold text-zinc-200">主な機能</p>
            </div>
            <div className="px-5">
              <FeatureRow icon={<Lightbulb size={15} />} title="照明コントロール" desc="OLEDWorks Brite 3（電球色 3000K 固定）の明るさ・シーン・エリアを調整。7種のムードプリセット（夜明け〜就寝）収録。OLEDは調光すると自然に暖色化します。滞在中はZigbeeで実機と自動連携。" />
              <FeatureRow icon={<Bell size={15} />} title="サービスリクエスト" desc="タオル・アメニティ補充、温度調整、修理、タクシー手配など6種類。急ぎフラグ付き。ホストに即時通知。" />
              <FeatureRow icon={<MessageCircle size={15} />} title="AIコンシェルジュ" desc="Google Gemini 搭載のAIチャット。施設情報・周辺案内・照明操作方法など多言語対応（日英中韓仏）。" />
              <FeatureRow icon={<BookOpen size={15} />} title="施設ガイド" desc="チェックイン/アウト時刻、WiFi情報、アメニティ、照明の使い方、ルール、緊急連絡先をアコーディオン表示。" />
              <FeatureRow icon={<Map size={15} />} title="周辺マップ" desc="山中湖エリアの8スポット（グルメ・自然・体験・ショップ）をカテゴリ別に表示。評価・距離・Google Mapsリンク付き。" />
              <FeatureRow icon={<Lightbulb size={15} />} title="ECUANEST 製品" desc="施設で使用中の有機EL照明製品の詳細（仕様・価格・用途）を確認。公式サイトへの購入リンク付き。" />
              <FeatureRow icon={<Camera size={15} />} title="デジタル寄せ書き" desc="滞在の思い出メッセージを投稿。絵文字・いいね機能付き。オーナーが承認後に公開。" />
              <FeatureRow icon={<Star size={15} />} title="照明コンサルティング" desc="ECUANEST の無料相談を4ステップフォームで申し込み。職業・プロジェクト種別・予算・連絡先を入力。" />
              <FeatureRow icon={<Globe size={15} />} title="多言語対応" desc="右上の地球儀ボタンから日本語・English・中文・한국어・Français を即時切り替え。" />
            </div>
          </div>

          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500">
              💡 <strong className="text-zinc-400">PWAとして使用:</strong> Safariの「共有」→「ホーム画面に追加」でアイコンが作成されます。フルスクリーンのネイティブアプリ感覚で使えます。
            </p>
          </div>
        </Section>

        {/* ── MANAGER ── */}
        <Section id="manager" title="管理会社用アプリ" emoji="🔧">
          <div className="card p-4 mb-4 border-teal-500/20 bg-teal-950/10">
            <div className="flex items-center gap-3">
              <Wrench size={18} className="text-teal-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-teal-300">アクセス方法</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  <code className="text-teal-400">/manager</code> にアクセス → PINコード <code className="text-white font-bold">5678</code> を入力
                </p>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-zinc-800">
              <p className="text-sm font-semibold text-zinc-200">機能一覧</p>
            </div>
            <div className="px-5">
              <FeatureRow
                icon={<BarChart2 size={15} />}
                title="ダッシュボード (/manager/dashboard)"
                desc="今日の清掃予定・本日のチェックイン/アウト・未対応のゲストリクエスト・稼働状況を一覧表示。"
              />
              <FeatureRow
                icon={<CalendarDays size={15} />}
                title="予約カレンダー (/manager/calendar)"
                desc="月次カレンダービューで予約の入り具合を確認。チェックイン/アウト日、稼働率、収益の月次集計。"
              />
              <FeatureRow
                icon={<ClipboardList size={15} />}
                title="タスク管理 (/manager/tasks)"
                desc="清掃チェックリスト（エリア別）とメンテナンス案件を管理。完了/進行中/未対応のステータス管理。"
              />
              <FeatureRow
                icon={<BarChart2 size={15} />}
                title="レポート (/manager/reports)"
                desc="稼働率・収益・プラットフォーム別売上・清掃実績・メンテナンス完了状況をグラフで可視化。"
              />
            </div>
          </div>

          <div className="card p-4 mb-4">
            <p className="text-sm font-semibold text-zinc-200 mb-3">業務フロー</p>
            <ol className="space-y-2">
              {[
                'チェックアウト確認（カレンダー）',
                '清掃タスクをエリア別にチェック（タスク管理）',
                'ゲストからのリクエストを確認・対応（ダッシュボード）',
                'メンテナンス案件をスケジュール（タスク管理）',
                '月次レポートでオーナーに報告（レポート）',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-xs text-zinc-400">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500">
              🔒 PINコードは <code className="text-zinc-400">NEXT_PUBLIC_MANAGER_PIN</code> 環境変数で変更できます（本番環境では必ず変更してください）。
            </p>
          </div>
        </Section>

        {/* ── OWNER ── */}
        <Section id="owner" title="オーナー用アプリ" emoji="🛡️">
          <div className="card p-4 mb-4 border-blue-500/20 bg-blue-950/10">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-300">アクセス方法</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  <code className="text-blue-400">/owner</code> にアクセス → PINコード <code className="text-white font-bold">1234</code> を入力
                </p>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-zinc-800">
              <p className="text-sm font-semibold text-zinc-200">機能一覧</p>
            </div>
            <div className="px-5">
              <FeatureRow
                icon={<BarChart2 size={15} />}
                title="ダッシュボード (/owner/dashboard)"
                desc="今月の収益・稼働率・未対応タスク・照明使用状況をリアルタイム表示。管理会社へのメッセージ送信機能付き。"
              />
              <FeatureRow
                icon={<Users size={15} />}
                title="ゲスト管理 (/owner/guests)"
                desc="過去・現在・今後の予約ゲスト一覧。詳細情報（チェックイン/アウト・国籍・連絡先）の確認とメッセージ送信。"
              />
              <FeatureRow
                icon={<Star size={15} />}
                title="コンサル管理 (/owner/consults)"
                desc="ゲストから送られた照明コンサルティング申し込みを一覧で確認。ステータス管理・詳細確認。"
              />
              <FeatureRow
                icon={<Camera size={15} />}
                title="寄せ書き管理 (/owner/guestbook)"
                desc="ゲストの投稿を承認/非表示に設定。公開メッセージの管理とオーナーコメントの追加。"
              />
              <FeatureRow
                icon={<BarChart2 size={15} />}
                title="アナリティクス (/owner/analytics)"
                desc="月次収益グラフ・プラットフォーム別売上（Airbnb/Booking/直接）・照明シーン利用統計・製品興味度。"
              />
              <FeatureRow
                icon={<Settings size={15} />}
                title="設定 (/owner/settings)"
                desc="WiFi名/パスワード、チェックイン/アウト時刻、オーナー電話番号、PINコード変更、ホストメッセージ、アナウンスを設定。"
              />
            </div>
          </div>

          <div className="card p-4 mb-4">
            <p className="text-sm font-semibold text-zinc-200 mb-3">最初にやること（初期設定）</p>
            <ol className="space-y-2">
              {[
                '設定ページでWiFi名・パスワードを入力',
                'チェックイン/アウト時刻を設定',
                'オーナー電話番号を登録',
                'PINコードをデフォルト(1234)から変更（環境変数で）',
                'ホストウェルカムメッセージを作成',
                'アナウンスバナーで特別なお知らせを掲載（任意）',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-xs text-zinc-400">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500">
              🔒 PINコードは <code className="text-zinc-400">NEXT_PUBLIC_OWNER_PIN</code> 環境変数で変更できます（本番環境では必ず変更してください）。
            </p>
          </div>
        </Section>

        {/* ── LIGHTING / ZIGBEE ── */}
        <Section id="lighting" title="照明（Zigbee）設定" emoji="💡">
          {/* Intro */}
          <div className="card p-5 mb-4 border-gold-500/20 bg-gradient-to-br from-amber-950/20 to-zinc-900">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-gold-400" />
              <span className="text-sm font-semibold text-gold-300">OLEDWorks Brite 3 ＋ Zigbee2MQTT</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              照明は <strong className="text-zinc-200">OLEDWorks Brite 3（電球色 3000K 固定）</strong> を使用します。色温度は変わらないため、
              アプリが制御するのは <strong className="text-zinc-200">点灯/消灯</strong> と <strong className="text-zinc-200">明るさ</strong> のみです。
              OLED は光を絞るほど自然に暖かみが増します（dim-to-warm）。
              ゲストには接続作業をさせず、<strong className="text-gold-400">ご滞在中のみ自動でZigbee連携</strong>し操作できる状態にします。
            </p>
          </div>

          {/* Architecture */}
          <div className="card p-5 mb-4">
            <p className="text-sm font-semibold text-zinc-200 mb-3">仕組み（データの流れ）</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-x-auto">
              <pre className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre">{`アプリ (滞在中のみ)
   │ HTTPS
   ▼
Next.js API  /api/lighting/zigbee
   │ MQTT publish
   │ zigbee2mqtt/<名前>/set
   │ {"state":"ON","brightness":178}
   ▼
MQTTブローカー (Mosquitto)
   ▼
Zigbee2MQTT  ──Zigbee──▶  調光モジュール
   ▼
OLEDWorks Brite 3 パネル`}</pre>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
              Zigbee2MQTT に汎用RESTは無いため、制御は <strong className="text-zinc-400">MQTT</strong> で行います。
              アプリは <code className="text-gold-400">zigbee2mqtt/&lt;friendly_name&gt;/set</code> に publish します。
            </p>
          </div>

          {/* Hardware */}
          <div className="card overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-zinc-800">
              <p className="text-sm font-semibold text-zinc-200">必要な機材</p>
            </div>
            <div className="px-5">
              <FeatureRow icon={<span className="text-xs">1</span>} title="常時稼働サーバー" desc="Raspberry Pi 4 (4GB+) またはミニPC。Zigbee2MQTT と Mosquitto を常時稼働させます。" />
              <FeatureRow icon={<span className="text-xs">2</span>} title="Zigbeeコーディネーター" desc="Sonoff Zigbee 3.0 USB Dongle Plus / ConBee II などのUSBドングル。" />
              <FeatureRow icon={<span className="text-xs">3</span>} title="Zigbee調光モジュール" desc="OLEDドライバの調光方式に合わせる（0-10V / 位相制御 / PWM）。Brite 3 を調光できる信号を出力します。" />
              <FeatureRow icon={<span className="text-xs">4</span>} title="調光対応ドライバ" desc="Brite 3 の定格に合う調光対応の定電流/定電圧ドライバ。" />
            </div>
            <div className="px-5 pb-4">
              <div className="mt-2 p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl">
                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                  ⚠️ OLEDパネルの配線・ドライバ選定・100V結線は<strong className="text-amber-200">必ず電気工事士などの有資格者</strong>が行ってください。
                </p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="card p-5 mb-4">
            <p className="text-sm font-semibold text-zinc-200 mb-3">設定手順</p>
            <ol className="space-y-2.5">
              {[
                'サーバーに Mosquitto（MQTTブローカー）を導入し、ユーザー名/パスワード認証を有効化',
                'Zigbee2MQTT を導入し、configuration.yaml に MQTT接続情報とコーディネーターのポートを設定',
                'systemd で Mosquitto・Zigbee2MQTT を自動起動に登録',
                'Web UI（:8080）で Permit join を一時ON → 調光モジュールをペアリング → 完了後OFFに戻す',
                '各デバイスの friendly_name を lumina_living / lumina_bedroom などに命名',
                '全灯グループ lumina_all を作成し4ゾーンを追加（反応が速くなる・推奨）',
                'mosquitto_pub で直接 publish し、照明が点灯/調光することをテスト',
                'アプリの環境変数（下記）を設定して Redeploy',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-xs text-zinc-400 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Test command */}
          <div className="card p-5 mb-4">
            <p className="text-sm font-semibold text-zinc-200 mb-2">動作テスト（MQTT直叩き）</p>
            <p className="text-xs text-zinc-500 mb-3">サーバー上で実行し、照明が反応すればZigbee側は完了です。</p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-start gap-2">
              <code className="text-[11px] text-zinc-300 leading-relaxed flex-1 break-all">{`mosquitto_pub -h localhost -u lumina -P *** -t 'zigbee2mqtt/lumina_all/set' -m '{"state":"ON","brightness":178,"transition":1}'`}</code>
              <CopyButton text={`mosquitto_pub -h localhost -u lumina -P *** -t 'zigbee2mqtt/lumina_all/set' -m '{"state":"ON","brightness":178,"transition":1}'`} />
            </div>
          </div>

          {/* Env vars for zigbee */}
          <div className="card overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-zinc-800">
              <p className="text-sm font-semibold text-zinc-200">照明用の環境変数</p>
            </div>
            <div className="px-5">
              <EnvRow name="ZIGBEE_MQTT_URL" desc="MQTTブローカーのURL。未設定の場合はシミュレーションモード（UIは反応するが実機には送信しない）で動作します。" example="mqtt://192.168.1.50:1883" />
              <EnvRow name="ZIGBEE_MQTT_USERNAME" desc="MQTTブローカーの認証ユーザー名。" example="lumina" />
              <EnvRow name="ZIGBEE_MQTT_PASSWORD" desc="MQTTブローカーの認証パスワード。" example="********" />
              <EnvRow name="ZIGBEE_BASE_TOPIC" desc="Zigbee2MQTTのベーストピック。既定は zigbee2mqtt。" example="zigbee2mqtt" />
              <EnvRow name="ZIGBEE_DEVICES" desc="ゾーン→friendly_nameのJSONマップ。allは全灯グループ名を指定。" example={`{"all":"lumina_all","living":"lumina_living",...}`} />
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="card p-5 mb-4">
            <p className="text-sm font-semibold text-zinc-200 mb-3">トラブルシューティング</p>
            <div className="space-y-2.5">
              {[
                { s: 'バッジが「シミュレーション」のまま', a: 'ZIGBEE_MQTT_URL未設定、またはブローカー未到達。mosquitto_sub で疎通確認。' },
                { s: '「接続中」から進まない', a: 'ファイアウォール / 認証情報 / URLのスキーム（mqtt://）を確認。' },
                { s: '操作しても照明が反応しない', a: 'friendly_name と ZIGBEE_DEVICES の綴りが一致しているか。直叩きで切り分け。' },
                { s: '明るさが粗い・ちらつく', a: 'OLEDドライバの調光方式とZigbee調光器の出力方式（0-10V/PWM/位相）が一致しているか確認。' },
              ].map(({ s, a }) => (
                <div key={s} className="flex items-start gap-3 py-1">
                  <span className="text-red-400/80 text-xs mt-0.5 flex-shrink-0">●</span>
                  <div>
                    <p className="text-xs font-medium text-zinc-300">{s}</p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">{a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <p className="text-xs text-zinc-500 leading-relaxed">
              📘 詳細な手順は <code className="text-gold-400">docs/ZIGBEE_SETUP.md</code> を参照してください。
              ネットワーク構成（クラウド配信時のトンネル方式）やセキュリティの注意点も記載しています。
            </p>
          </div>
        </Section>

        {/* ── ENV ── */}
        <Section id="env" title="環境変数・設定" emoji="⚙️">
          <div className="card p-4 mb-4 border-amber-500/20 bg-amber-950/10">
            <p className="text-xs text-amber-300 font-semibold mb-1">⚠️ セキュリティ注意</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              環境変数は <code className="text-amber-400">.env.local</code> ファイルに記述し、<strong className="text-zinc-400">絶対にGitHubにコミットしない</strong>でください。
              本番環境はVercelダッシュボード → Settings → Environment Variables から設定します。
            </p>
          </div>

          <div className="card overflow-hidden mb-4">
            <div className="px-5 py-4 border-b border-zinc-800">
              <p className="text-sm font-semibold text-zinc-200">設定が必要な環境変数</p>
            </div>
            <div className="px-5">
              <EnvRow
                name="GOOGLE_AI_API_KEY"
                desc="AIコンシェルジュ（チャット機能）に必要。Google AI Studio で無料取得可能。設定しない場合、チャットはエラーメッセージを表示します。"
                example="AIza..."
              />
              <EnvRow
                name="NEXT_PUBLIC_OWNER_PIN"
                desc="オーナーログインPINコード。デフォルトは '1234'。本番環境では必ず変更してください。"
                example="9271"
              />
              <EnvRow
                name="NEXT_PUBLIC_MANAGER_PIN"
                desc="管理会社ログインPINコード。デフォルトは '5678'。本番環境では必ず変更してください。"
                example="3849"
              />
              <EnvRow
                name="NEXT_PUBLIC_DEMO_MODE"
                desc="'true' に設定するとデモモードのバナーやデモログインボタンを表示。本番では 'false' または未設定を推奨。"
                example="false"
              />
            </div>
          </div>

          <div className="card p-4">
            <p className="text-sm font-semibold text-zinc-200 mb-3">Vercel での設定手順</p>
            <ol className="space-y-2">
              {[
                'Vercel ダッシュボードを開く',
                'プロジェクトを選択 → Settings タブ',
                '「Environment Variables」をクリック',
                '変数名と値を入力して「Save」',
                'Deployments → 最新のデプロイを「Redeploy」',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-xs text-zinc-400">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        {/* ── FAQ ── */}
        <Section id="faq" title="よくある質問" emoji="❓">
          <div className="space-y-3">
            {[
              {
                q: 'ゲストにどのようにアプリを案内すればいい？',
                a: 'チェックイン確定後、予約メールにアプリのURLを記載してください。ゲストはメールアドレスを入力するだけで自動的にログインできます（マジックリンク認証）。QRコードを施設内に掲示するのも効果的です。',
              },
              {
                q: 'チャットが「エラー」と表示される',
                a: 'GOOGLE_AI_API_KEY が設定されていません。Google AI Studio (ai.google.dev) で無料のAPIキーを取得し、Vercelの環境変数に設定してください。設定後にRedeploy が必要です。',
              },
              {
                q: 'ゲストのリクエストはどこで確認する？',
                a: '管理会社ポータルのダッシュボード (/manager/dashboard) でリアルタイムに確認できます。オーナーポータルのゲスト管理画面でも確認可能です。',
              },
              {
                q: 'WiFiパスワードを変更した',
                a: 'オーナーポータルの設定 (/owner/settings) からWiFi名とパスワードを更新してください。施設ガイドとホーム画面に即時反映されます。',
              },
              {
                q: '言語を切り替えるには？',
                a: 'ゲストアプリの画面右上にある地球儀アイコンをタップしてください。日本語・English・中文・한국어・Français の5言語に対応しています。',
              },
              {
                q: 'スマートフォンのホーム画面に追加するには？',
                a: 'iOS (Safari): 共有ボタン→「ホーム画面に追加」 / Android (Chrome): メニュー→「ホーム画面に追加」。アイコンが作成され、フルスクリーンのアプリとして起動します。',
              },
              {
                q: '本番環境でPINコードを変更したい',
                a: 'Vercelの環境変数 NEXT_PUBLIC_OWNER_PIN (オーナー) と NEXT_PUBLIC_MANAGER_PIN (管理会社) に新しいPINを設定してRedeploy してください。',
              },
              {
                q: '照明が動かない / 「シミュレーション」と表示される',
                a: 'ZIGBEE_MQTT_URL が未設定か、MQTTブローカーに到達できていません。照明（Zigbee）設定セクションの手順に従い、サーバーで mosquitto_pub の直叩きテストが通るか確認してから、アプリの環境変数を設定してRedeployしてください。なお実際の操作は「滞在中」フェーズのみ有効です。',
              },
              {
                q: '照明の色（色温度）を変えられないのはなぜ？',
                a: '照明に採用している OLEDWorks Brite 3 は色温度が電球色 3000K に固定された有機ELパネルのため、調色機能はありません。OLEDの特性として、明るさを絞ると自然に暖かな色合いへ変化します（dim-to-warm）。',
              },
              {
                q: 'データはどこに保存されている？',
                a: '現在はブラウザの localStorage に保存されています（デモ版）。本番運用でデータを永続化するには、Supabase や Firebase などのデータベースとの連携が必要です。',
              },
            ].map(({ q, a }) => (
              <FaqItem key={q} question={q} answer={a} />
            ))}
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-600">Lumina Fuji Residence · Powered by ECUANEST</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-gold-400 transition-colors">ゲスト画面</Link>
            <Link href="/manager" className="text-xs text-zinc-500 hover:text-teal-400 transition-colors">管理会社</Link>
            <Link href="/owner" className="text-xs text-zinc-500 hover:text-blue-400 transition-colors">オーナー</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-start gap-3 p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-xs font-bold text-gold-500 mt-0.5 flex-shrink-0">Q.</span>
        <p className="text-sm text-zinc-200 flex-1">{question}</p>
        <ChevronDown
          size={15}
          className={`text-zinc-500 flex-shrink-0 mt-0.5 transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-zinc-800">
          <div className="flex items-start gap-3 pt-3">
            <span className="text-xs font-bold text-teal-500 mt-0.5 flex-shrink-0">A.</span>
            <p className="text-xs text-zinc-400 leading-relaxed">{answer}</p>
          </div>
        </div>
      )}
    </div>
  )
}
