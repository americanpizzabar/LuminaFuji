import nodemailer from 'nodemailer'

export async function sendOtpEmail(to: string, otp: string) {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    if (process.env.NODE_ENV === 'production') throw new Error('Email not configured')
    console.log(`[DEV] OTP ${otp} → ${to}`)
    return
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

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
