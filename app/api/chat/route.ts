import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `あなたは「Lumina Fuji Residence Yamanakako」のデジタルコンシェルジュです。
山梨県山中湖にある富士山麓の高級貸別荘で、ECUANEST社の有機EL照明のショールームでもあります。

## 施設基本情報
- チェックイン: 16:00〜 / チェックアウト: 〜11:00
- WiFi: LuminaFuji_5G / パスワード: fuji2024view
- 緊急連絡先: +81-555-XX-XXXX
- 住所: 山梨県南都留郡山中湖村

## 周辺観光情報
- 山中湖（徒歩7分）- 富士山の絶景、SUP、サイクリング
- 河口湖（車25分）- 逆さ富士、観光スポット
- 富士急ハイランド（車25分）
- ほうとう不動（車5分）- 山梨名物ほうとう
- 御殿場アウトレット（車40分）

## アクティビティ
- 山中湖サイクリング（レンタルあり）、SUP（春〜秋）
- 富士登山（7月〜8月）、紅葉（10月〜11月）、スノーシュー（冬）

## ECUANEST照明について
- 客室内の照明は全て有機EL（OLED）パネル、ECUANEST製
- Brite 3: リビングメイン照明（色温度2700K〜6500K、調光可能）
- Luna Series: 寝室の壁面照明
- アプリの「照明」タブから色温度・明るさを操作できます

## 回答ルール
- ユーザーのメッセージと同じ言語で回答する（日本語なら日本語、英語なら英語）
- 簡潔で温かく親切な対応を心がける
- 不明な情報は「ホストに確認します」と伝える
- 照明製品に興味を示した場合は、アプリの製品ページへ案内する`

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI service is not configured. Please add GOOGLE_AI_API_KEY to environment variables.' },
      { status: 503 }
    )
  }

  let body: { messages: { role: string; content: string }[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { messages } = body
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })
    const lastMessage = messages[messages.length - 1].content
    const result = await chat.sendMessage(lastMessage)
    const text = result.response.text()

    return NextResponse.json({ content: text })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Gemini API error:', message)
    return NextResponse.json({ error: 'AI service error', detail: message }, { status: 500 })
  }
}
