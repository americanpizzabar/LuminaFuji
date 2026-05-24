import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

interface GuestContext {
  name?: string
  checkIn?: string
  checkOut?: string
  adults?: number
  children?: number
  nationality?: string
}

interface FacilityContext {
  checkInTime?: string
  checkOutTime?: string
  wifiName?: string
  wifiPassword?: string
}

function formatJpDate(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const m = d.getMonth() + 1
  const day = d.getDate()
  const wd = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  return `${m}月${day}日(${wd})`
}

function buildSystemPrompt(guest: GuestContext | null, facility: FacilityContext, _lang?: string): string {
  // 施設の入退館時刻 (フォールバック付き)
  const ciTime = facility.checkInTime || '16:00'
  const coTime = facility.checkOutTime || '11:00'
  const wifi = facility.wifiName || 'LuminaFuji_5G'
  const wifiPw = facility.wifiPassword || 'fuji2024view'

  // ゲスト固有セクション
  let guestSection = ''
  if (guest && guest.checkIn && guest.checkOut) {
    const guestName = guest.name || 'ゲスト'
    const ciDate = formatJpDate(guest.checkIn)
    const coDate = formatJpDate(guest.checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const ci = new Date(guest.checkIn)
    const co = new Date(guest.checkOut)
    let stayStatus = ''
    if (today < ci) {
      const days = Math.ceil((ci.getTime() - today.getTime()) / 86400000)
      stayStatus = `滞在前 (チェックインまであと${days}日)`
    } else if (today >= ci && today < co) {
      stayStatus = '現在滞在中'
    } else {
      stayStatus = '滞在後'
    }
    guestSection = `
## 現在対応中のゲスト情報 (この情報を参照して個別に回答すること)
- ゲスト名: ${guestName} 様
- 国籍: ${guest.nationality || '不明'}
- チェックイン: ${ciDate} ${ciTime}〜
- チェックアウト: ${coDate} 〜${coTime}
- 人数: 大人${guest.adults ?? '?'}名${guest.children ? ` / 子供${guest.children}名` : ''}
- ステータス: ${stayStatus}
`
  }

  return `あなたは「Lumina Fuji Residence Yamanakako」のデジタルコンシェルジュです。
山梨県山中湖にある富士山麓の高級貸別荘で、ECUANEST社の有機EL照明のショールームでもあります。
${guestSection}
## 施設基本情報
- WiFi: ${wifi} / パスワード: ${wifiPw}
- 緊急連絡先: +81-555-XX-XXXX
- 住所: 山梨県南都留郡山中湖村
- 施設の標準チェックイン時刻: ${ciTime}〜 / 標準チェックアウト時刻: 〜${coTime}

## 周辺観光情報
- 山中湖 (徒歩7分) - 富士山の絶景、SUP、サイクリング
- 河口湖 (車25分) - 逆さ富士、観光スポット
- 富士急ハイランド (車25分)
- ほうとう不動 (車5分) - 山梨名物ほうとう
- 御殿場アウトレット (車40分)

## アクティビティ
- 山中湖サイクリング (レンタルあり)、SUP (春〜秋)
- 富士登山 (7月〜8月)、紅葉 (10月〜11月)、スノーシュー (冬)

## ECUANEST照明について
- 客室内の照明は全て有機EL (OLED) パネル、ECUANEST製
- Brite 3: リビングメイン照明 (色温度2700K〜6500K、調光可能)
- Luna Series: 寝室の壁面照明
- アプリの「照明」タブから色温度・明るさを操作できます

## 回答ルール
- 必ずユーザーのメッセージと同じ言語で回答する
  (日本語/English/中文/한국어/Deutsch/Español/Italiano に対応)
- チェックイン/チェックアウト時間を聞かれたら、上記「現在対応中のゲスト情報」の
  具体的な日付と時刻を答える (例: 「${guest?.name || 'お客様'}のチェックアウトは
  ${formatJpDate(guest?.checkOut)} 午前${coTime.split(':')[0]}時までとなっております」)
- ゲスト情報がない場合のみ、施設の標準時刻を案内する
- 簡潔で温かく親切な対応を心がける (3-4文程度)
- 不明な情報は「ホストに確認します」と伝える
- 照明製品に興味を示した場合は、アプリの製品ページへ案内する`
}

// 試行順: 各モデルは別のクォータを持つため、429時も次を試す
const MODEL_CANDIDATES = [
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
]

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI service is not configured. Please add GOOGLE_AI_API_KEY to environment variables.' },
      { status: 503 }
    )
  }

  let body: {
    messages: { role: string; content: string }[]
    guest?: GuestContext | null
    facility?: FacilityContext
    lang?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { messages, guest, facility, lang } = body
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
  }

  const systemPrompt = buildSystemPrompt(guest ?? null, facility ?? {}, lang)

  const genAI = new GoogleGenerativeAI(apiKey)

  // Gemini requires history to start with a 'user' role.
  const historyRaw = messages.slice(0, -1)
  const firstUserIdx = historyRaw.findIndex(m => m.role === 'user')
  const history = (firstUserIdx === -1 ? [] : historyRaw.slice(firstUserIdx)).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))
  const lastMessage = messages[messages.length - 1].content

  const attempts: { model: string; error: string }[] = []
  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      })
      const chat = model.startChat({ history })
      const result = await chat.sendMessage(lastMessage)
      const text = result.response.text()
      return NextResponse.json({ content: text, model: modelName })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.warn(`[chat] ${modelName} → ${message}`)
      attempts.push({ model: modelName, error: message })
      if (/401|403|api[_ ]?key|permission|invalid api key/i.test(message)) {
        break
      }
    }
  }

  const detail = attempts.map(a => `${a.model}: ${a.error}`).join(' | ')
  const allQuotaExhausted = attempts.length > 0 && attempts.every(a => /429|quota|rate limit|too many requests/i.test(a.error))
  console.error('[chat] All model candidates exhausted:', detail)

  if (allQuotaExhausted) {
    return NextResponse.json(
      { error: 'QUOTA_EXCEEDED', detail, attempts },
      { status: 429 }
    )
  }
  return NextResponse.json(
    { error: 'AI service error', detail, attempts },
    { status: 500 }
  )
}
