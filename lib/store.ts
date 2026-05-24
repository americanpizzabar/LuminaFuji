/**
 * Central shared store — localStorage-backed with cross-tab sync.
 * Single source of truth for guest app, owner dashboard, and manager portal.
 */

export type GuestPhase = 'booked' | 'staying' | 'post'
export type ConsultStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
export type ServiceStatus = 'pending' | 'inProgress' | 'done'
export type MaintenancePriority = 'low' | 'medium' | 'urgent'
export type AnnouncementType = 'welcome' | 'info' | 'reminder' | 'promo'
export type ReportPeriod = 'monthly' | 'quarterly' | 'semi' | 'annual'

export interface GuestInfo {
  name: string
  email: string
  phone?: string
  nationality: string
  flag: string
  checkIn: string
  checkOut: string
  reservationId: string
  platform: 'airbnb' | 'booking.com' | 'direct' | 'other'
  adults: number
  children: number
  specialRequests?: string
  /** デモセッション識別フラグ — ログインページ再訪で自動クリア */
  isDemo?: boolean
}

export interface FacilitySettings {
  wifiName: string
  wifiPassword: string
  checkInTime: string
  checkOutTime: string
  defaultLightingScene: string
  ownerPhone: string
  emergencyPhone: string
  hostWelcomeMessage: string
  hostWelcomeMessageEn: string
}

export interface ServiceRequest {
  id: string
  type: 'towels' | 'amenities' | 'temperature' | 'maintenance' | 'taxi' | 'other'
  label: string
  description: string
  status: ServiceStatus
  priority: 'normal' | 'urgent'
  createdAt: string
  respondedAt?: string
  completedAt?: string
  resolvedAt?: string
  ownerNote?: string
  guestName?: string
  guestId?: string
}

export interface GuestbookPost {
  id: string
  author: string
  country: string
  flag: string
  message: string
  emoji: string
  date: string
  likes: number
  visible: boolean
}

export interface ConsultMessage {
  id: string
  from: 'owner' | 'lead'
  content: string
  createdAt: string
  readByOwner: boolean
}

export interface ConsultRequest {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  profession: string
  projectType: string
  scale: string
  budget: string
  timeline?: string
  contactMethod: 'email' | 'phone' | 'online'
  message: string
  interestedProducts: string[]
  submittedAt: string
  status: ConsultStatus
  ownerNotes?: string
  source: 'lumina_fuji_stay' | 'direct'
  consultMessages?: ConsultMessage[]
}

export interface LightingEvent {
  sceneId: string
  sceneName: string
  timestamp: string
  durationMinutes?: number
}

export interface OwnerMessage {
  id: string
  from: 'owner' | 'guest'
  content: string
  createdAt: string
  readByGuest: boolean
  readByOwner: boolean
}

export interface Announcement {
  id: string
  content: string
  contentEn: string
  type: AnnouncementType
  active: boolean
  createdAt: string
}

export interface NotificationSettings {
  emailEnabled: boolean
  emailAddress: string
  lineNotifyEnabled: boolean
  lineNotifyToken: string
  slackEnabled: boolean
  slackWebhook: string
}

export interface BookingRecord {
  id: string
  guestName: string
  nationality: string
  flag: string
  email: string
  phone?: string
  checkIn: string
  checkOut: string
  platform: string
  adults: number
  children: number
  nights: number
  revenue: number
  status: 'confirmed' | 'staying' | 'completed' | 'cancelled'
  notes?: string
  registeredByManager?: boolean
  specialRequests?: string
}

export interface CleaningTask {
  id: string
  label: string
  area: 'living' | 'bedroom' | 'bathroom' | 'kitchen' | 'entrance' | 'outdoor'
  done: boolean
  doneAt?: string
  doneBy?: string
}

export interface MaintenanceItem {
  id: string
  description: string
  area: string
  priority: MaintenancePriority
  status: 'open' | 'scheduled' | 'done'
  reportedAt: string
  reportedBy: 'guest' | 'owner' | 'manager'
  scheduledFor?: string
  doneAt?: string
}

export interface AppStore {
  phase: GuestPhase
  guestInfo: GuestInfo | null
  facilitySettings: FacilitySettings
  notificationSettings: NotificationSettings
  serviceRequests: ServiceRequest[]
  lightingHistory: LightingEvent[]
  guestbookPosts: GuestbookPost[]
  consultRequests: ConsultRequest[]
  messages: OwnerMessage[]
  announcements: Announcement[]
  bookingHistory: BookingRecord[]
  cleaningChecklist: CleaningTask[]
  maintenanceItems: MaintenanceItem[]
}

// ─── Default data ────────────────────────────────────────────────────────────

const DEFAULT_CLEANING_CHECKLIST: CleaningTask[] = [
  { id: 'c1', label: 'リビング掃除機がけ', area: 'living', done: false },
  { id: 'c2', label: 'リビング拭き掃除', area: 'living', done: false },
  { id: 'c3', label: '寝具・リネン交換', area: 'bedroom', done: false },
  { id: 'c4', label: '枕カバー交換', area: 'bedroom', done: false },
  { id: 'c5', label: 'バスルーム洗浄', area: 'bathroom', done: false },
  { id: 'c6', label: 'タオル新品交換', area: 'bathroom', done: false },
  { id: 'c7', label: 'アメニティ補充', area: 'bathroom', done: false },
  { id: 'c8', label: 'キッチン清掃', area: 'kitchen', done: false },
  { id: 'c9', label: '食器洗浄・収納', area: 'kitchen', done: false },
  { id: 'c10', label: 'ゴミ回収', area: 'kitchen', done: false },
  { id: 'c11', label: '玄関清掃', area: 'entrance', done: false },
  { id: 'c12', label: '庭・デッキ清掃', area: 'outdoor', done: false },
]

const DEFAULT_BOOKINGS: BookingRecord[] = [
  { id: 'LF-2026-0510', guestName: 'Yamada Taro', nationality: '日本', flag: '🇯🇵', email: 'yamada@example.com', checkIn: '2026-05-10', checkOut: '2026-05-12', platform: 'Airbnb', adults: 2, children: 0, nights: 2, revenue: 48000, status: 'staying' },
  { id: 'LF-2026-0515', guestName: 'Thomas K.', nationality: 'ドイツ', flag: '🇩🇪', email: 'thomas@example.de', checkIn: '2026-05-15', checkOut: '2026-05-18', platform: 'direct', adults: 2, children: 1, nights: 3, revenue: 75000, status: 'confirmed' },
  { id: 'LF-2026-0520', guestName: '李 偉', nationality: '中国', flag: '🇨🇳', email: 'liwei@example.cn', checkIn: '2026-05-20', checkOut: '2026-05-22', platform: 'Booking.com', adults: 2, children: 0, nights: 2, revenue: 52000, status: 'confirmed' },
  { id: 'LF-2026-0501', guestName: 'Emma L.', nationality: 'イギリス', flag: '🇬🇧', email: 'emma@example.co.uk', checkIn: '2026-05-01', checkOut: '2026-05-03', platform: 'Airbnb', adults: 1, children: 0, nights: 2, revenue: 44000, status: 'completed' },
  { id: 'LF-2026-0425', guestName: '田中 拓也', nationality: '日本', flag: '🇯🇵', email: 'tanaka@architect.jp', checkIn: '2026-04-25', checkOut: '2026-04-27', platform: 'direct', adults: 2, children: 0, nights: 2, revenue: 56000, status: 'completed' },
  { id: 'LF-2026-0418', guestName: 'Sara M.', nationality: 'フランス', flag: '🇫🇷', email: 'sara@design.fr', checkIn: '2026-04-18', checkOut: '2026-04-20', platform: 'Airbnb', adults: 2, children: 0, nights: 2, revenue: 44000, status: 'completed' },
]

const DEFAULT_GUESTBOOK: GuestbookPost[] = [
  { id: 'gb1', author: 'Sakura M.', country: '東京, 日本', flag: '🇯🇵', message: '照明が本当に素晴らしかった。くつろぎモードで映画を見ながら過ごす夜が最高でした。また絶対来ます！', emoji: '✨', date: '2026-05-08', likes: 12, visible: true },
  { id: 'gb2', author: 'Thomas K.', country: 'Munich, Germany', flag: '🇩🇪', message: 'The ECUANEST lighting is incredible. Never experienced organic EL panels before. The "Dawn" scene in the morning was magical with Mount Fuji in the background.', emoji: '🌅', date: '2026-05-05', likes: 18, visible: true },
  { id: 'gb3', author: '李 偉', country: '上海, 中国', flag: '🇨🇳', message: '灯光设计太美了！有机EL照明让整个空间充满了温暖的光芒。窗外的富士山和室内的灯光相互呼应，令人难忘。', emoji: '🏔️', date: '2026-05-02', likes: 9, visible: true },
  { id: 'gb4', author: 'Emma L.', country: 'London, UK', flag: '🇬🇧', message: 'What a hidden gem! The lighting transformed throughout the day automatically. Felt like living inside a piece of art. The consultation with ECUANEST is already booked!', emoji: '💡', date: '2026-04-28', likes: 24, visible: true },
  { id: 'gb5', author: '田中 拓也', country: '大阪, 日本', flag: '🇯🇵', message: '建築家として訪問しました。この照明の均一な面発光と演色性には感動しました。自分のプロジェクトに導入を検討中です。', emoji: '🏗️', date: '2026-04-22', likes: 31, visible: true },
]

const DEFAULT_CONSULT_REQUESTS: ConsultRequest[] = [
  { id: 'cr1', name: '田中 拓也', email: 'tanaka@architect.co.jp', phone: '090-1234-5678', company: '田中建築設計事務所', profession: '建築家・設計士', projectType: '商業施設', scale: '500〜2000m²', budget: '500〜1000万円', contactMethod: 'online', message: '美術館の照明リニューアルプロジェクトを検討中。均一な面発光と高演色性が必須条件です。', interestedProducts: ['brite-3', 'nexus-module'], submittedAt: '2026-05-10 14:32', status: 'new', source: 'lumina_fuji_stay' },
  { id: 'cr2', name: 'Emma L.', email: 'emma@design.co.uk', company: 'Emma L. Design Studio', profession: 'インテリアデザイナー', projectType: 'ホテル・旅館', scale: '100〜500m²', budget: '100〜500万円', contactMethod: 'email', message: 'Boutique hotel renovation in Tokyo. Interested in Brite 3 and Luna Series for guest rooms.', interestedProducts: ['brite-3', 'luna-series'], submittedAt: '2026-05-08 09:15', status: 'contacted', ownerNotes: '5/9 メール返信済み。要件詳細を確認中。', source: 'lumina_fuji_stay' },
  { id: 'cr3', name: '山本 健一', email: 'yamamoto@home.jp', phone: '03-5555-XXXX', profession: 'デベロッパー・施主', projectType: '住宅', scale: '〜100m²', budget: '未定', contactMethod: 'phone', message: '自宅リノベに合わせて全室に有機EL照明を導入したい。', interestedProducts: ['luna-series', 'aria-strip'], submittedAt: '2026-05-06 17:45', status: 'quoted', ownerNotes: '見積もり送付済み ¥2.8M。検討中。', source: 'lumina_fuji_stay' },
  { id: 'cr4', name: 'Sara M.', email: 'sara@gallery.fr', company: 'Galerie Lumière', profession: 'インテリアデザイナー', projectType: '美術館・ギャラリー', scale: '100〜500m²', budget: '500〜1000万円', contactMethod: 'online', message: 'Gallery lighting for contemporary art. UV-free and flicker-free is essential.', interestedProducts: ['brite-3'], submittedAt: '2026-05-05 11:20', status: 'new', source: 'lumina_fuji_stay' },
  { id: 'cr5', name: '鈴木 美咲', email: 'suzuki@interior.jp', profession: 'インテリアデザイナー', projectType: 'オフィス', scale: '100〜500m²', budget: '100〜500万円', contactMethod: 'email', message: 'クリエイティブオフィスの照明設計。集中とリラックスを切り替えられる照明が必要。', interestedProducts: ['brite-3', 'aria-strip'], submittedAt: '2026-05-03 15:00', status: 'won', ownerNotes: '受注確定。工事：6月予定。', source: 'lumina_fuji_stay' },
]

const DEFAULT_MESSAGES: OwnerMessage[] = [
  { id: 'msg1', from: 'owner', content: 'Yamada様、ご到着おめでとうございます！照明はアプリから自由にお楽しみください。何かご不明な点がありましたらお気軽にどうぞ。', createdAt: '2026-05-10 16:05', readByGuest: true, readByOwner: true },
]

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann1', content: '今夜、晴天の場合は富士山の星空観測に絶好のチャンスです🌟', contentEn: 'Tonight is a great chance to stargaze with Mount Fuji visible on clear skies 🌟', type: 'info', active: true, createdAt: '2026-05-10 18:00' },
]

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailEnabled: false,
  emailAddress: '',
  lineNotifyEnabled: false,
  lineNotifyToken: '',
  slackEnabled: false,
  slackWebhook: '',
}

export const DEFAULT_FACILITY_SETTINGS: FacilitySettings = {
  wifiName: 'LuminaFuji_5G',
  wifiPassword: 'fuji2024view',
  checkInTime: '16:00',
  checkOutTime: '11:00',
  defaultLightingScene: 'evening',
  ownerPhone: '+81-555-XX-XXXX',
  emergencyPhone: '119',
  hostWelcomeMessage: 'Lumina Fuji へようこそ。富士山麓の光の旅をお楽しみください。',
  hostWelcomeMessageEn: 'Welcome to Lumina Fuji. Enjoy your journey of light at the foot of Mount Fuji.',
}

export const DEFAULT_GUEST_INFO: GuestInfo = {
  name: 'Yamada Taro',
  email: 'guest@example.com',
  nationality: '日本',
  flag: '🇯🇵',
  checkIn: '2026-05-10',
  checkOut: '2026-05-12',
  reservationId: 'LF-2026-0510',
  platform: 'airbnb',
  adults: 2,
  children: 0,
}

const DEFAULT_STORE: AppStore = {
  phase: 'staying',
  guestInfo: DEFAULT_GUEST_INFO,
  facilitySettings: DEFAULT_FACILITY_SETTINGS,
  notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
  serviceRequests: [],
  lightingHistory: [],
  guestbookPosts: DEFAULT_GUESTBOOK,
  consultRequests: DEFAULT_CONSULT_REQUESTS,
  messages: DEFAULT_MESSAGES,
  announcements: DEFAULT_ANNOUNCEMENTS,
  bookingHistory: DEFAULT_BOOKINGS,
  cleaningChecklist: DEFAULT_CLEANING_CHECKLIST,
  maintenanceItems: [],
}

// ─── Storage operations ───────────────────────────────────────────────────────

const STORE_KEY = 'lf_store_v3'

export function getStore(): AppStore {
  if (typeof window === 'undefined') return DEFAULT_STORE
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) {
      const store = DEFAULT_STORE
      localStorage.setItem(STORE_KEY, JSON.stringify(store))
      return store
    }
    return { ...DEFAULT_STORE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STORE
  }
}

export function saveStore(store: AppStore): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
  window.dispatchEvent(new StorageEvent('storage', { key: STORE_KEY, newValue: JSON.stringify(store) }))
}

export function updateStore(partial: Partial<AppStore>): AppStore {
  const current = getStore()
  const next = { ...current, ...partial }
  saveStore(next)
  return next
}

// ─── Domain operations ────────────────────────────────────────────────────────

export function setPhase(phase: GuestPhase): void {
  updateStore({ phase })
}

export function setGuestInfo(info: GuestInfo): void {
  updateStore({ guestInfo: info })
}

export function clearGuestInfo(): void {
  updateStore({ guestInfo: null })
}

export function setFacilitySettings(settings: FacilitySettings): void {
  updateStore({ facilitySettings: settings })
}

// Service requests
export function addServiceRequest(req: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>): ServiceRequest {
  const newReq: ServiceRequest = { ...req, id: `sr-${Date.now()}`, createdAt: new Date().toISOString(), status: 'pending' }
  const store = getStore()
  updateStore({ serviceRequests: [newReq, ...store.serviceRequests] })
  return newReq
}

export function updateServiceRequest(id: string, updates: Partial<ServiceRequest>): void {
  const store = getStore()
  updateStore({ serviceRequests: store.serviceRequests.map(r => r.id === id ? { ...r, ...updates } : r) })
}

// Guestbook
export function addGuestbookPost(post: Omit<GuestbookPost, 'id' | 'likes' | 'visible'>): GuestbookPost {
  const newPost: GuestbookPost = { ...post, id: `gb-${Date.now()}`, likes: 0, visible: true }
  const store = getStore()
  updateStore({ guestbookPosts: [newPost, ...store.guestbookPosts] })
  return newPost
}

export function likeGuestbookPost(id: string): void {
  const store = getStore()
  updateStore({ guestbookPosts: store.guestbookPosts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p) })
}

export function updateGuestbookPost(id: string, updates: Partial<GuestbookPost>): void {
  const store = getStore()
  updateStore({ guestbookPosts: store.guestbookPosts.map(p => p.id === id ? { ...p, ...updates } : p) })
}

export function deleteGuestbookPost(id: string): void {
  const store = getStore()
  updateStore({ guestbookPosts: store.guestbookPosts.filter(p => p.id !== id) })
}

// Consult requests
export function addConsultRequest(req: Omit<ConsultRequest, 'id' | 'submittedAt' | 'status' | 'source'>): ConsultRequest {
  const newReq: ConsultRequest = { ...req, id: `cr-${Date.now()}`, submittedAt: new Date().toLocaleString('ja-JP'), status: 'new', source: 'lumina_fuji_stay' }
  const store = getStore()
  updateStore({ consultRequests: [newReq, ...store.consultRequests] })
  return newReq
}

export function updateConsultRequest(id: string, updates: Partial<ConsultRequest>): void {
  const store = getStore()
  updateStore({ consultRequests: store.consultRequests.map(r => r.id === id ? { ...r, ...updates } : r) })
}

// Lighting history
export function recordLightingEvent(event: Omit<LightingEvent, 'timestamp'>): void {
  const store = getStore()
  const events = [{ ...event, timestamp: new Date().toISOString() }, ...store.lightingHistory].slice(0, 200)
  updateStore({ lightingHistory: events })
}

// Messages
export function sendMessage(from: 'owner' | 'guest', content: string): OwnerMessage {
  const msg: OwnerMessage = { id: `msg-${Date.now()}`, from, content, createdAt: new Date().toLocaleString('ja-JP'), readByGuest: from === 'guest', readByOwner: from === 'owner' }
  const store = getStore()
  updateStore({ messages: [...store.messages, msg] })
  return msg
}

export function markMessagesRead(by: 'guest' | 'owner'): void {
  const store = getStore()
  updateStore({ messages: store.messages.map(m => by === 'guest' ? { ...m, readByGuest: true } : { ...m, readByOwner: true }) })
}

// Announcements
export function setAnnouncement(ann: Omit<Announcement, 'id' | 'createdAt'>): void {
  const newAnn: Announcement = { ...ann, id: `ann-${Date.now()}`, createdAt: new Date().toISOString() }
  const store = getStore()
  updateStore({ announcements: [newAnn, ...store.announcements.filter(a => !a.active || a.id !== newAnn.id)] })
}

export function dismissAnnouncement(id: string): void {
  const store = getStore()
  updateStore({ announcements: store.announcements.map(a => a.id === id ? { ...a, active: false } : a) })
}

// Cleaning
export function updateCleaningTask(id: string, done: boolean): void {
  const store = getStore()
  updateStore({ cleaningChecklist: store.cleaningChecklist.map(t => t.id === id ? { ...t, done, doneAt: done ? new Date().toISOString() : undefined } : t) })
}

export function resetCleaningChecklist(): void {
  updateStore({ cleaningChecklist: DEFAULT_CLEANING_CHECKLIST })
}

// Maintenance
export function addMaintenanceItem(item: Omit<MaintenanceItem, 'id' | 'reportedAt' | 'status'>): MaintenanceItem {
  const newItem: MaintenanceItem = { ...item, id: `mt-${Date.now()}`, reportedAt: new Date().toISOString(), status: 'open' }
  const store = getStore()
  updateStore({ maintenanceItems: [newItem, ...store.maintenanceItems] })
  return newItem
}

export function updateMaintenanceItem(id: string, updates: Partial<MaintenanceItem>): void {
  const store = getStore()
  updateStore({ maintenanceItems: store.maintenanceItems.map(m => m.id === id ? { ...m, ...updates } : m) })
}

// Analytics helpers
export function getLightingAnalytics(store: AppStore) {
  const sceneCounts: Record<string, number> = {}
  store.lightingHistory.forEach(e => { sceneCounts[e.sceneName] = (sceneCounts[e.sceneName] || 0) + 1 })
  const topScene = Object.entries(sceneCounts).sort(([, a], [, b]) => b - a)[0]
  return { sceneCounts, topScene: topScene ? { name: topScene[0], count: topScene[1] } : null, totalEvents: store.lightingHistory.length }
}

export function getRevenueStats(store: AppStore) {
  const completed = store.bookingHistory.filter(b => b.status === 'completed' || b.status === 'staying')
  const totalRevenue = completed.reduce((sum, b) => sum + b.revenue, 0)
  const totalNights = completed.reduce((sum, b) => sum + b.nights, 0)
  const avgPerNight = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0
  return { totalRevenue, totalNights, avgPerNight, bookingCount: completed.length }
}

export function getUnreadCounts(store: AppStore) {
  const unreadMessages = store.messages.filter(m => m.from === 'guest' && !m.readByOwner).length
  const newConsults = store.consultRequests.filter(c => c.status === 'new').length
  const pendingRequests = store.serviceRequests.filter(r => r.status === 'pending').length
  return { unreadMessages, newConsults, pendingRequests, total: unreadMessages + newConsults + pendingRequests }
}

// Service request time tracking
export function respondToServiceRequest(id: string, note?: string): void {
  updateStore({
    serviceRequests: getStore().serviceRequests.map(r =>
      r.id === id ? { ...r, status: 'inProgress' as ServiceStatus, respondedAt: new Date().toISOString(), ownerNote: note ?? r.ownerNote } : r
    )
  })
}

export function completeServiceRequest(id: string, note?: string): void {
  updateStore({
    serviceRequests: getStore().serviceRequests.map(r =>
      r.id === id ? { ...r, status: 'done' as ServiceStatus, completedAt: new Date().toISOString(), resolvedAt: new Date().toISOString(), ownerNote: note ?? r.ownerNote } : r
    )
  })
}

// Booking records (manager registration)
export function addBookingRecord(record: Omit<BookingRecord, 'id'>): BookingRecord {
  const newRecord: BookingRecord = { ...record, id: `LF-${Date.now()}` }
  const store = getStore()
  updateStore({ bookingHistory: [newRecord, ...store.bookingHistory] })
  return newRecord
}

export function updateBookingRecord(id: string, updates: Partial<BookingRecord>): void {
  const store = getStore()
  const updatedHistory = store.bookingHistory.map(b => b.id === id ? { ...b, ...updates } : b)

  // guestInfo 同期: ログイン中のゲストの予約日程等が変更された場合、guestInfo も追従させる
  let guestInfo = store.guestInfo
  if (guestInfo && guestInfo.reservationId === id) {
    guestInfo = {
      ...guestInfo,
      ...(updates.checkIn       !== undefined && { checkIn: updates.checkIn }),
      ...(updates.checkOut      !== undefined && { checkOut: updates.checkOut }),
      ...(updates.guestName     !== undefined && { name: updates.guestName }),
      ...(updates.email         !== undefined && { email: updates.email }),
      ...(updates.phone         !== undefined && { phone: updates.phone }),
      ...(updates.adults        !== undefined && { adults: updates.adults }),
      ...(updates.children      !== undefined && { children: updates.children }),
      ...(updates.specialRequests !== undefined && { specialRequests: updates.specialRequests }),
    }
  }

  updateStore({ bookingHistory: updatedHistory, guestInfo })
}

export function deleteBookingRecord(id: string): void {
  const store = getStore()
  updateStore({ bookingHistory: store.bookingHistory.filter(b => b.id !== id) })
}

// Notification settings
export function setNotificationSettings(settings: NotificationSettings): void {
  updateStore({ notificationSettings: settings })
}

// Consult messaging
export function addConsultMessage(consultId: string, from: 'owner' | 'lead', content: string): void {
  const store = getStore()
  const msg: ConsultMessage = {
    id: `cm-${Date.now()}`,
    from, content,
    createdAt: new Date().toLocaleString('ja-JP'),
    readByOwner: from === 'owner',
  }
  updateStore({
    consultRequests: store.consultRequests.map(r =>
      r.id === consultId ? { ...r, consultMessages: [...(r.consultMessages ?? []), msg] } : r
    )
  })
}

// Time elapsed helper
export function timeElapsed(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '1分以内'
  if (mins < 60) return `${mins}分前`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}時間前`
  const days = Math.floor(hrs / 24)
  return `${days}日前`
}

export function durationLabel(start: string, end: string): string {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `${hrs}時間${rem}分` : `${hrs}時間`
}

// Extended revenue stats with period filter
export function getRevenueStatsByPeriod(store: AppStore, period: ReportPeriod) {
  const now = new Date()
  const cutoff = new Date()
  if (period === 'monthly')   cutoff.setMonth(now.getMonth() - 1)
  if (period === 'quarterly') cutoff.setMonth(now.getMonth() - 3)
  if (period === 'semi')      cutoff.setMonth(now.getMonth() - 6)
  if (period === 'annual')    cutoff.setFullYear(now.getFullYear() - 1)

  const bookings = store.bookingHistory.filter(b => {
    const d = new Date(b.checkIn)
    return d >= cutoff && d <= now && (b.status === 'completed' || b.status === 'staying')
  })
  const totalRevenue = bookings.reduce((s, b) => s + b.revenue, 0)
  const totalNights = bookings.reduce((s, b) => s + b.nights, 0)
  const avgPerNight = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0
  const platforms: Record<string, number> = {}
  bookings.forEach(b => { platforms[b.platform] = (platforms[b.platform] ?? 0) + b.revenue })
  return { totalRevenue, totalNights, avgPerNight, bookingCount: bookings.length, platforms, bookings }
}
