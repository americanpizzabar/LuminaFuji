'use client'

/**
 * 委託サービス範囲（ServiceScope）の表示部品。
 * - ScopeChip: セクション見出し等に添える小さな担当表示
 * - ScopeNotice: 非担当ポータルでセクション/ページ本体を置き換える静かな案内
 */

/** 担当を示す小さなチップ。owner=オーナー直営（zinc）/ manager=管理会社委託中（amber） */
export function ScopeChip({ party }: { party: 'owner' | 'manager' }) {
  const isManager = party === 'manager'
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md flex-shrink-0"
      style={
        isManager
          ? { background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#d4a94e' }
          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa' }
      }
    >
      {isManager ? '管理会社委託中' : 'オーナー直営'}
    </span>
  )
}

/**
 * 非担当の業務セクションを置き換える案内。
 * 「この業務は誰が担当しているか」を静かに伝え、作業環境から視覚ノイズを取り除く。
 */
export default function ScopeNotice({
  duty, handledBy, accent = 'teal',
}: {
  /** 業務名（例: 'ゲストリクエスト対応'） */
  duty: string
  /** 現在の担当 */
  handledBy: 'owner' | 'manager'
  accent?: 'blue' | 'teal'
}) {
  const accentColor = accent === 'blue' ? '#3b82f6' : '#14b8a6'
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
      <div
        className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center text-base"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {handledBy === 'owner' ? '🏠' : '🤝'}
      </div>
      <p className="text-sm text-zinc-300 font-medium">
        {duty}は{handledBy === 'owner' ? 'オーナー直営' : '管理会社に委託中'}です
      </p>
      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
        {handledBy === 'owner'
          ? 'この業務はオーナーが直接対応しています。委託範囲はオーナー設定で変更できます。'
          : 'この業務は管理会社が対応しています。'}
      </p>
      <div className="w-8 h-0.5 rounded-full mx-auto mt-4" style={{ background: `${accentColor}40` }} />
    </div>
  )
}
