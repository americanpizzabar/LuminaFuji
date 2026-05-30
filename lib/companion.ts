/**
 * 同伴者（コンパニオン）招待の共有ペイロード。
 * 代表者が滞在中に発行する参加リンクに埋め込まれる最小限の予約情報。
 * バックエンドDBを持たないため、必要な情報はリンク自体に内包する。
 */
export interface CompanionPayload {
  rid: string   // reservationId
  ci: string    // checkIn  (YYYY-MM-DD)
  co: string    // checkOut (YYYY-MM-DD)
  hn?: string   // 施設/ホスト名
  rep?: string  // 代表者名
  ar?: string   // arrivedAt (ISO) — 設定されていれば同伴者も滞在中フェーズになる
  flag?: string // 代表者の国旗
  nat?: string  // 国籍
}

export function encodeCompanion(p: CompanionPayload): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(p)))
  } catch {
    return ''
  }
}

export function decodeCompanion(raw: string): CompanionPayload | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(raw))) as CompanionPayload
    if (!parsed?.rid || !parsed?.ci || !parsed?.co) return null
    return parsed
  } catch {
    return null
  }
}

export function buildCompanionUrl(origin: string, p: CompanionPayload): string {
  return `${origin}/join?c=${encodeURIComponent(encodeCompanion(p))}`
}
