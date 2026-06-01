/**
 * 触覚フィードバック（Haptic Feedback）。
 * Web の Vibration API を用いて、調光ダイヤルやボタン操作に微細な振動を返し、
 * 高級な物理ダイヤルを回しているかのような感触を生む。
 *
 * 対応端末（主に Android Chrome）でのみ振動し、非対応（iOS Safari 等）では静かに無視される。
 * prefers-reduced-motion を尊重する。
 */

function canVibrate(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  if (typeof navigator.vibrate !== 'function') return false
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  } catch {
    /* matchMedia 非対応環境は素通り */
  }
  return true
}

function vibrate(pattern: number | number[]): void {
  if (!canVibrate()) return
  try {
    navigator.vibrate(pattern)
  } catch {
    /* 失敗しても致命的でないため無視 */
  }
}

/** 調光ダイヤルのディテント（カチ）。スライダーを刻むたびの最小振動。 */
export function hapticTick(): void {
  vibrate(7)
}

/** ボタンタップ。シーン選択や切り替えの確定感。 */
export function hapticTap(): void {
  vibrate(12)
}

/** 完了・成功（送信やチェックアウト等の節目）。 */
export function hapticSuccess(): void {
  vibrate([14, 28, 20])
}

/** 入室の儀式など、特別な瞬間のための深い余韻のあるパターン。 */
export function hapticCeremony(): void {
  vibrate([10, 40, 16, 40, 24])
}
