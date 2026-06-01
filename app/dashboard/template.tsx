/**
 * 画面遷移ごとに再マウントされるテンプレート。
 * シアタールームのカーテンが静かに開くような、イージングの効いた立ち上がりを全画面に付与する。
 * （.page-reveal は終了時に transform:none へ戻るため、子要素の position:fixed を壊さない）
 */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-reveal">{children}</div>
}
