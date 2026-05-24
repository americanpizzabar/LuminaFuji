import nodemailer from 'nodemailer'

function createTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return null
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

export async function sendOtpEmail(to: string, otp: string) {
  const user = process.env.GMAIL_USER
  const transporter = createTransporter()

  if (!transporter || !user) {
    if (process.env.NODE_ENV === 'production') throw new Error('Email not configured')
    console.log(`[DEV] OTP ${otp} → ${to}`)
    return
  }

  await transporter.sendMail({
    from: `"Lumina Fuji" <${user}>`,
    to,
    subject: 'Lumina Fuji ログイン認証コード',
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#1a1a1a;margin-bottom:16px">ログイン認証コード</h2>
      <p style="color:#444;margin-bottom:24px">下記の6桁コードをアプリに入力してください（10分以内）:</p>
      <div style="font-size:36px;letter-spacing:12px;font-weight:bold;background:#f5f5f5;padding:20px;text-align:center;border-radius:8px;color:#1a1a1a">${otp}</div>
      <p style="color:#888;font-size:12px;margin-top:24px">このメールに心当たりがない場合は無視してください。<br>Lumina Fuji Residence Yamanakako</p>
    </div>`,
  })
}

export async function sendInviteEmail(opts: {
  to: string
  guestName: string
  checkIn: string
  checkOut: string
  inviteLink: string
}) {
  const user = process.env.GMAIL_USER
  const transporter = createTransporter()

  if (!transporter || !user) {
    if (process.env.NODE_ENV === 'production') throw new Error('Email not configured')
    console.log(`[DEV] Invite → ${opts.to}: ${opts.inviteLink}`)
    return
  }

  await transporter.sendMail({
    from: `"Lumina Fuji" <${user}>`,
    to: opts.to,
    subject: 'Lumina Fuji ご予約のご確認 / Booking Confirmation',
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a1a">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="font-weight:300;letter-spacing:1px;margin:0 0 4px">Lumina Fuji</h1>
        <p style="color:#888;font-size:11px;letter-spacing:2px;margin:0">RESIDENCE YAMANAKAKO</p>
      </div>
      <p style="color:#444;line-height:1.7">${opts.guestName} 様</p>
      <p style="color:#444;line-height:1.7">この度はLumina Fujiへのご予約をいただき、誠にありがとうございます。<br>滞在期間中の照明・各種サービスは下記の専用アプリよりご利用いただけます。</p>
      <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:0 0 4px;font-size:12px;color:#888">ご予約期間</p>
        <p style="margin:0;font-size:15px;font-weight:500">${opts.checkIn} 〜 ${opts.checkOut}</p>
      </div>
      <div style="text-align:center;margin:32px 0">
        <a href="${opts.inviteLink}" style="display:inline-block;background:#c9a661;color:#1a1a1a;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;letter-spacing:1px">→ アプリにログイン</a>
      </div>
      <p style="color:#666;font-size:12px;line-height:1.6">このリンクをタップするとアプリが開きます。ご登録のメールアドレス宛に6桁の認証コードを送信しますので、画面の指示に従ってログインしてください。</p>
      <p style="color:#888;font-size:11px;margin-top:32px;border-top:1px solid #eee;padding-top:16px">Lumina Fuji Residence Yamanakako<br>If you did not expect this email, please disregard.</p>
    </div>`,
  })
}
