import nodemailer from 'nodemailer'

function createTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return null
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
}

// ─── OTP メール ───────────────────────────────────────────────────────────────

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
    subject: 'Lumina Fuji — Verification Code / 認証コード / 验证码 / 인증 코드',
    html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0a0a;color:#e4e4e7;border-radius:12px">
  <div style="text-align:center;margin-bottom:24px">
    <p style="font-size:22px;font-weight:300;letter-spacing:2px;margin:0;color:#f5f5f5">Lumina Fuji</p>
    <p style="font-size:10px;letter-spacing:3px;color:#71717a;margin:4px 0 0">RESIDENCE YAMANAKAKO</p>
  </div>
  <div style="background:#1c1c1e;border-radius:10px;padding:28px;text-align:center;margin-bottom:20px">
    <p style="color:#a1a1aa;font-size:13px;margin:0 0 20px">
      🇯🇵 下記のコードをアプリに入力してください（10分以内）<br>
      🇬🇧 Enter the code below in the app (valid 10 min)<br>
      🇨🇳 请在应用中输入以下验证码（10分钟内有效）<br>
      🇰🇷 아래 코드를 앱에 입력해 주세요 (10분 유효)<br>
      🇩🇪 Geben Sie den Code in der App ein (10 Min. gültig)<br>
      🇪🇸 Introduce el código en la app (válido 10 min)<br>
      🇮🇹 Inserisci il codice nell'app (valido 10 min)
    </p>
    <div style="font-size:42px;letter-spacing:14px;font-weight:700;color:#c9a661;padding:16px 0">${otp}</div>
  </div>
  <p style="color:#52525b;font-size:11px;text-align:center;margin:0">
    Lumina Fuji Residence Yamanakako · このメールに心当たりがない場合は無視してください
  </p>
</div>`,
  })
}

// ─── 招待メール (7言語) ────────────────────────────────────────────────────────

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

  const btn = (label: string) =>
    `<a href="${opts.inviteLink}" style="display:inline-block;background:#c9a661;color:#0a0a0a;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;font-size:14px;letter-spacing:0.5px">${label}</a>`

  const divider = `<hr style="border:none;border-top:1px solid #27272a;margin:28px 0">`

  const section = (flag: string, lines: string[], cta: string) => `
<div style="margin-bottom:4px">
  <p style="font-size:12px;color:#a1a1aa;line-height:1.8;margin:0 0 16px">${flag}&nbsp;&nbsp;${lines.join('<br>')}</p>
  <div style="text-align:center">${btn(cta)}</div>
</div>`

  await transporter.sendMail({
    from: `"Lumina Fuji" <${user}>`,
    to: opts.to,
    subject: `Lumina Fuji — ご予約確認 / Booking Confirmation / 预订确认 / 예약 확인`,
    html: `
<div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:24px;background:#0a0a0a;color:#e4e4e7;border-radius:12px">

  <!-- Header -->
  <div style="text-align:center;padding-bottom:24px;border-bottom:1px solid #27272a">
    <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:linear-gradient(135deg,rgba(201,166,97,.2),rgba(180,130,60,.1));border:1px solid rgba(201,166,97,.25);border-radius:12px;margin-bottom:12px">
      <span style="font-size:22px">✦</span>
    </div>
    <p style="font-size:22px;font-weight:300;letter-spacing:2px;margin:0;color:#f5f5f5">Lumina Fuji</p>
    <p style="font-size:10px;letter-spacing:3px;color:#71717a;margin:4px 0 0">RESIDENCE YAMANAKAKO</p>
  </div>

  <!-- Booking info (language-neutral) -->
  <div style="background:#1c1c1e;border-radius:10px;padding:18px 20px;margin:24px 0;display:grid">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="color:#71717a;font-size:11px;padding-bottom:4px">GUEST</td>
        <td style="color:#71717a;font-size:11px;padding-bottom:4px;text-align:right">STAY</td>
      </tr>
      <tr>
        <td style="color:#f5f5f5;font-size:15px;font-weight:500">${opts.guestName}</td>
        <td style="color:#c9a661;font-size:13px;font-weight:600;text-align:right">${opts.checkIn} → ${opts.checkOut}</td>
      </tr>
    </table>
  </div>

  <!-- 日本語 -->
  ${section('🇯🇵', [
    `<strong style="color:#f5f5f5">${opts.guestName} 様</strong>`,
    'この度はLumina Fujiへのご予約をいただき、誠にありがとうございます。',
    '滞在中の照明操作・施設サービスは下記の専用アプリからご利用いただけます。',
    'ご登録のメールアドレスに6桁の認証コードをお送りします。',
  ], '→ アプリにログイン')}

  ${divider}

  <!-- English -->
  ${section('🇬🇧', [
    `<strong style="color:#f5f5f5">Dear ${opts.guestName},</strong>`,
    'Thank you for your reservation at Lumina Fuji.',
    'Control lighting, explore facilities, and manage your stay via our guest app.',
    'A 6-digit verification code will be sent to your email when you log in.',
  ], '→ Open Guest App')}

  ${divider}

  <!-- 中文 -->
  ${section('🇨🇳', [
    `<strong style="color:#f5f5f5">尊敬的 ${opts.guestName} 女士/先生，</strong>`,
    '感谢您预订 Lumina Fuji。',
    '入住期间，您可通过以下专用应用控制照明及使用各项设施服务。',
    '登录时，系统将向您的邮箱发送6位验证码。',
  ], '→ 打开客户端')}

  ${divider}

  <!-- 한국어 -->
  ${section('🇰🇷', [
    `<strong style="color:#f5f5f5">${opts.guestName} 고객님,</strong>`,
    'Lumina Fuji를 예약해 주셔서 감사합니다。',
    '전용 앱을 통해 조명 조작 및 시설 서비스를 이용하실 수 있습니다.',
    '로그인 시 6자리 인증 코드가 이메일로 발송됩니다.',
  ], '→ 앱 열기')}

  ${divider}

  <!-- Deutsch -->
  ${section('🇩🇪', [
    `<strong style="color:#f5f5f5">Liebe/r ${opts.guestName},</strong>`,
    'vielen Dank für Ihre Reservierung im Lumina Fuji.',
    'Steuern Sie die Beleuchtung und nutzen Sie alle Services über unsere Gäste-App.',
    'Beim Login erhalten Sie einen 6-stelligen Bestätigungscode per E-Mail.',
  ], '→ App öffnen')}

  ${divider}

  <!-- Español -->
  ${section('🇪🇸', [
    `<strong style="color:#f5f5f5">Estimado/a ${opts.guestName},</strong>`,
    'Gracias por su reserva en Lumina Fuji.',
    'Controle la iluminación y acceda a los servicios del complejo desde nuestra app.',
    'Al iniciar sesión, recibirá un código de verificación de 6 dígitos por correo.',
  ], '→ Abrir la app')}

  ${divider}

  <!-- Italiano -->
  ${section('🇮🇹', [
    `<strong style="color:#f5f5f5">Gentile ${opts.guestName},</strong>`,
    'Grazie per la sua prenotazione presso Lumina Fuji.',
    'Controlli l\'illuminazione e utilizzi i servizi della struttura tramite la nostra app.',
    'Al momento del login riceverà un codice di verifica a 6 cifre via email.',
  ], '→ Apri l\'app')}

  <!-- Footer -->
  <div style="margin-top:28px;padding-top:20px;border-top:1px solid #27272a;text-align:center">
    <p style="color:#52525b;font-size:11px;line-height:1.6;margin:0">
      Lumina Fuji Residence · 山中湖 Yamanakako, Japan<br>
      Powered by ECUANEST × Lumina Fuji<br>
      <span style="color:#3f3f46">If you did not expect this email, please disregard. / このメールに心当たりのない場合は無視してください。</span>
    </p>
  </div>

</div>`,
  })
}
