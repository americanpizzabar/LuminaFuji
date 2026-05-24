export type LangKey = 'ja' | 'en' | 'zh' | 'ko' | 'de' | 'es' | 'it'

export interface LangStrings {
  label: string
  flag: string
  enterEmail: string
  emailPlaceholder: string
  sendCode: string
  codeSent: string
  codeHint: string
  codePlaceholder: string
  verify: string
  back: string
  resend: string
  resendIn: (n: number) => string
  errorInviteMismatch: string
  errorExpired: string
  errorInvalidCode: string
  errorNotFound: string
  errorGeneric: string
  demoMode: string
  demoSub: string
  demoBooked: string
  demoStaying: string
  demoPost: string
  poweredBy: string
}

export const LANGS: Record<LangKey, LangStrings> = {
  ja: {
    label: '日本語', flag: '🇯🇵',
    enterEmail: 'ご予約時のメールアドレスを入力してください',
    emailPlaceholder: 'your@email.com',
    sendCode: '認証コードを送信',
    codeSent: '認証コードを送信しました',
    codeHint: '6桁のコードをご入力ください',
    codePlaceholder: '000000',
    verify: '認証してログイン',
    back: '戻る',
    resend: 'コードを再送する',
    resendIn: n => `再送まで ${n}秒`,
    errorInviteMismatch: '招待リンクのメールアドレスと一致しません。\n入力内容をご確認ください。',
    errorExpired: 'コードの有効期限が切れています。再送してください。',
    errorInvalidCode: 'コードが正しくありません。もう一度入力してください。',
    errorNotFound: 'ご予約情報が見つかりませんでした。\nホストから招待リンクを受け取り、そのリンクからアクセスしてください。',
    errorGeneric: 'エラーが発生しました。もう一度お試しください。',
    demoMode: 'デモモード', demoSub: '体験フェーズを選んでアプリを試す',
    demoBooked: '予約済', demoStaying: '滞在中', demoPost: '滞在後',
    poweredBy: 'Powered by ECUANEST × Lumina Fuji',
  },
  en: {
    label: 'English', flag: '🇬🇧',
    enterEmail: 'Enter the email address used for your reservation',
    emailPlaceholder: 'your@email.com',
    sendCode: 'Send Verification Code',
    codeSent: 'Verification code sent',
    codeHint: 'Enter the 6-digit code',
    codePlaceholder: '000000',
    verify: 'Verify & Sign In',
    back: 'Back',
    resend: 'Resend code',
    resendIn: n => `Resend in ${n}s`,
    errorInviteMismatch: 'Email does not match your invitation link.\nPlease check your input.',
    errorExpired: 'Code has expired. Please request a new one.',
    errorInvalidCode: 'Incorrect code. Please try again.',
    errorNotFound: 'Reservation not found.\nPlease use the invitation link provided by your host.',
    errorGeneric: 'An error occurred. Please try again.',
    demoMode: 'Demo Mode', demoSub: 'Try the app by selecting a phase',
    demoBooked: 'Booked', demoStaying: 'Staying', demoPost: 'After Stay',
    poweredBy: 'Powered by ECUANEST × Lumina Fuji',
  },
  zh: {
    label: '中文', flag: '🇨🇳',
    enterEmail: '请输入预订时使用的电子邮件地址',
    emailPlaceholder: 'your@email.com',
    sendCode: '发送验证码',
    codeSent: '验证码已发送',
    codeHint: '请输入6位验证码',
    codePlaceholder: '000000',
    verify: '验证并登录',
    back: '返回',
    resend: '重新发送验证码',
    resendIn: n => `${n}秒后重新发送`,
    errorInviteMismatch: '邮箱与邀请链接不符。\n请检查您的输入。',
    errorExpired: '验证码已过期，请重新发送。',
    errorInvalidCode: '验证码不正确，请重新输入。',
    errorNotFound: '未找到预订信息。\n请使用房东发送的邀请链接访问。',
    errorGeneric: '发生错误，请重试。',
    demoMode: '演示模式', demoSub: '选择体验阶段',
    demoBooked: '已预订', demoStaying: '入住中', demoPost: '入住后',
    poweredBy: 'Powered by ECUANEST × Lumina Fuji',
  },
  ko: {
    label: '한국어', flag: '🇰🇷',
    enterEmail: '예약 시 사용한 이메일 주소를 입력해 주세요',
    emailPlaceholder: 'your@email.com',
    sendCode: '인증 코드 발송',
    codeSent: '인증 코드가 발송되었습니다',
    codeHint: '6자리 코드를 입력해 주세요',
    codePlaceholder: '000000',
    verify: '인증 후 로그인',
    back: '돌아가기',
    resend: '코드 재발송',
    resendIn: n => `${n}초 후 재발송`,
    errorInviteMismatch: '초대 링크의 이메일과 일치하지 않습니다.\n입력 내용을 확인해 주세요.',
    errorExpired: '코드가 만료되었습니다. 다시 발송해 주세요.',
    errorInvalidCode: '코드가 올바르지 않습니다. 다시 입력해 주세요.',
    errorNotFound: '예약 정보를 찾을 수 없습니다.\n호스트로부터 초대 링크를 받아 접속해 주세요.',
    errorGeneric: '오류가 발생했습니다. 다시 시도해 주세요.',
    demoMode: '데모 모드', demoSub: '체험 단계를 선택하세요',
    demoBooked: '예약됨', demoStaying: '숙박 중', demoPost: '숙박 후',
    poweredBy: 'Powered by ECUANEST × Lumina Fuji',
  },
  de: {
    label: 'Deutsch', flag: '🇩🇪',
    enterEmail: 'Geben Sie die bei der Buchung verwendete E-Mail-Adresse ein',
    emailPlaceholder: 'ihre@email.com',
    sendCode: 'Bestätigungscode senden',
    codeSent: 'Bestätigungscode wurde gesendet',
    codeHint: 'Geben Sie den 6-stelligen Code ein',
    codePlaceholder: '000000',
    verify: 'Verifizieren & Anmelden',
    back: 'Zurück',
    resend: 'Code erneut senden',
    resendIn: n => `Erneut senden in ${n}s`,
    errorInviteMismatch: 'E-Mail stimmt nicht mit dem Einladungslink überein.\nBitte überprüfen Sie Ihre Eingabe.',
    errorExpired: 'Code ist abgelaufen. Bitte erneut anfordern.',
    errorInvalidCode: 'Falscher Code. Bitte versuchen Sie es erneut.',
    errorNotFound: 'Reservierung nicht gefunden.\nBitte verwenden Sie den Einladungslink Ihres Gastgebers.',
    errorGeneric: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    demoMode: 'Demo-Modus', demoSub: 'App mit einer Phase testen',
    demoBooked: 'Gebucht', demoStaying: 'Im Aufenthalt', demoPost: 'Nach Aufenthalt',
    poweredBy: 'Powered by ECUANEST × Lumina Fuji',
  },
  es: {
    label: 'Español', flag: '🇪🇸',
    enterEmail: 'Ingrese el correo electrónico utilizado para su reserva',
    emailPlaceholder: 'su@correo.com',
    sendCode: 'Enviar código de verificación',
    codeSent: 'Código de verificación enviado',
    codeHint: 'Ingrese el código de 6 dígitos',
    codePlaceholder: '000000',
    verify: 'Verificar e iniciar sesión',
    back: 'Volver',
    resend: 'Reenviar código',
    resendIn: n => `Reenviar en ${n}s`,
    errorInviteMismatch: 'El correo no coincide con el enlace de invitación.\nVerifique su entrada.',
    errorExpired: 'El código ha expirado. Solicite uno nuevo.',
    errorInvalidCode: 'Código incorrecto. Inténtelo de nuevo.',
    errorNotFound: 'Reserva no encontrada.\nUtilice el enlace de invitación de su anfitrión.',
    errorGeneric: 'Ocurrió un error. Por favor, inténtelo de nuevo.',
    demoMode: 'Modo Demo', demoSub: 'Pruebe la app seleccionando una fase',
    demoBooked: 'Reservado', demoStaying: 'Alojado', demoPost: 'Tras la estancia',
    poweredBy: 'Powered by ECUANEST × Lumina Fuji',
  },
  it: {
    label: 'Italiano', flag: '🇮🇹',
    enterEmail: "Inserisci l'indirizzo email usato per la prenotazione",
    emailPlaceholder: 'tua@email.com',
    sendCode: 'Invia codice di verifica',
    codeSent: 'Codice di verifica inviato',
    codeHint: 'Inserisci il codice a 6 cifre',
    codePlaceholder: '000000',
    verify: 'Verifica e accedi',
    back: 'Indietro',
    resend: 'Reinvia codice',
    resendIn: n => `Reinvia tra ${n}s`,
    errorInviteMismatch: "L'email non corrisponde al link di invito.\nVerifica l'inserimento.",
    errorExpired: 'Codice scaduto. Richiedine uno nuovo.',
    errorInvalidCode: 'Codice errato. Riprova.',
    errorNotFound: 'Prenotazione non trovata.\nUtilizza il link di invito del tuo host.',
    errorGeneric: 'Si è verificato un errore. Riprova.',
    demoMode: 'Modalità Demo', demoSub: "Prova l'app selezionando una fase",
    demoBooked: 'Prenotato', demoStaying: 'Soggiorno', demoPost: 'Dopo il soggiorno',
    poweredBy: 'Powered by ECUANEST × Lumina Fuji',
  },
}

export const LANG_ORDER: LangKey[] = ['ja', 'en', 'zh', 'ko', 'de', 'es', 'it']

const BROWSER_LANG_MAP: Record<string, LangKey> = {
  ja: 'ja', en: 'en', zh: 'zh', ko: 'ko', de: 'de', es: 'es', it: 'it',
}

const LANG_STORAGE_KEY = 'lf_lang'

export function detectLang(): LangKey {
  if (typeof window === 'undefined') return 'ja'
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as LangKey | null
    if (saved && LANGS[saved]) return saved
  } catch { /* ignore */ }
  const nav = navigator.language.toLowerCase().slice(0, 2)
  return BROWSER_LANG_MAP[nav] ?? 'en'
}

export function saveLang(lang: LangKey) {
  try { localStorage.setItem(LANG_STORAGE_KEY, lang) } catch { /* ignore */ }
}
