'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ChevronDown, Wifi, Coffee, Clock, Phone, Info } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/useLanguage'
import { useStore } from '@/lib/useStore'

interface GuideSection {
  id: string
  icon: React.ReactNode
  titleKey: string
  items: { labelKey: string; valueKey: string; dynamic?: boolean }[]
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: 'basics', icon: <Clock size={16} />, titleKey: 'guide.sections.basics',
    items: [
      { labelKey: 'guide.items.checkin', valueKey: 'guide.items.checkinVal' },
      { labelKey: 'guide.items.checkout', valueKey: 'guide.items.checkoutVal' },
      { labelKey: 'guide.items.extension', valueKey: 'guide.items.extensionVal' },
      { labelKey: 'guide.items.selfCheckin', valueKey: 'guide.items.selfCheckinVal' },
    ],
  },
  {
    id: 'wifi', icon: <Wifi size={16} />, titleKey: 'guide.sections.wifi',
    items: [
      { labelKey: 'guide.items.networkName', valueKey: '__wifiName__', dynamic: true },
      { labelKey: 'guide.items.password', valueKey: '__wifiPassword__', dynamic: true },
      { labelKey: 'guide.items.speed', valueKey: 'guide.items.speedVal' },
      { labelKey: 'guide.items.devices', valueKey: 'guide.items.devicesVal' },
    ],
  },
  {
    id: 'amenities', icon: <Coffee size={16} />, titleKey: 'guide.sections.amenities',
    items: [
      { labelKey: 'guide.items.kitchen', valueKey: 'guide.items.kitchenVal' },
      { labelKey: 'guide.items.bathroom', valueKey: 'guide.items.bathroomVal' },
      { labelKey: 'guide.items.bedding', valueKey: 'guide.items.beddingVal' },
      { labelKey: 'guide.items.laundry', valueKey: 'guide.items.laundryVal' },
      { labelKey: 'guide.items.ac', valueKey: 'guide.items.acVal' },
      { labelKey: 'guide.items.parking', valueKey: 'guide.items.parkingVal' },
      { labelKey: 'guide.items.bbq', valueKey: 'guide.items.bbqVal' },
      { labelKey: 'guide.items.pets', valueKey: 'guide.items.petsVal' },
    ],
  },
  {
    id: 'lighting', icon: <span className="text-sm">✦</span>, titleKey: 'guide.sections.lighting',
    items: [
      { labelKey: 'guide.items.operation', valueKey: 'guide.items.operationVal' },
      { labelKey: 'guide.items.coverage', valueKey: 'guide.items.coverageVal' },
      { labelKey: 'guide.items.presets', valueKey: 'guide.items.presetsVal' },
      { labelKey: 'guide.items.colorTemp', valueKey: 'guide.items.colorTempVal' },
      { labelKey: 'guide.items.caution', valueKey: 'guide.items.cautionVal' },
    ],
  },
  {
    id: 'rules', icon: <Info size={16} />, titleKey: 'guide.sections.rules',
    items: [
      { labelKey: 'guide.items.noSmoking', valueKey: 'guide.items.noSmokingVal' },
      { labelKey: 'guide.items.noise', valueKey: 'guide.items.noiseVal' },
      { labelKey: 'guide.items.trash', valueKey: 'guide.items.trashVal' },
      { labelKey: 'guide.items.fire', valueKey: 'guide.items.fireVal' },
      { labelKey: 'guide.items.extraGuests', valueKey: 'guide.items.extraGuestsVal' },
    ],
  },
  {
    id: 'contact', icon: <Phone size={16} />, titleKey: 'guide.sections.contact',
    items: [
      { labelKey: 'guide.items.host', valueKey: '__ownerPhone__', dynamic: true },
      { labelKey: 'guide.items.police', valueKey: 'guide.items.policeVal' },
      { labelKey: 'guide.items.ambulance', valueKey: 'guide.items.ambulanceVal' },
      { labelKey: 'guide.items.hospital', valueKey: 'guide.items.hospitalVal' },
    ],
  },
]

function AccordionItem({ section, t, dynamicValues }: { section: GuideSection; t: (k: string) => string; dynamicValues: Record<string, string> }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="card overflow-hidden mb-3">
      <button className="w-full flex items-center gap-3 px-5 py-4 text-left" onClick={() => setOpen(!open)}>
        <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-gold-400 flex-shrink-0">
          {section.icon}
        </div>
        <span className="flex-1 text-sm font-medium text-zinc-200">{t(section.titleKey)}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-zinc-300" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-zinc-800">
              <div className="divide-y divide-zinc-800/50">
                {section.items.map(({ labelKey, valueKey, dynamic }) => (
                  <div key={labelKey} className="flex gap-3 py-3">
                    <span className="text-xs text-zinc-300 flex-shrink-0 w-24 leading-relaxed">{t(labelKey)}</span>
                    <span className="text-xs text-zinc-300 leading-relaxed">
                      {dynamic ? (dynamicValues[valueKey] ?? '') : t(valueKey)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function GuidePage() {
  const { t } = useLanguage()
  const [store] = useStore()
  const dynamicValues: Record<string, string> = {
    '__wifiName__': store.facilitySettings.wifiName,
    '__wifiPassword__': store.facilitySettings.wifiPassword,
    '__ownerPhone__': store.facilitySettings.ownerPhone,
  }

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all">
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div>
          <h1 className="text-lg font-medium text-zinc-100">{t('guide.title')}</h1>
          <p className="text-xs text-zinc-300">{t('guide.subtitle')}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="card p-4 mb-6 flex items-center gap-3 border-gold-500/20 bg-gradient-to-r from-amber-950/20 to-zinc-900">
          <span className="text-2xl">🏔️</span>
          <div>
            <p className="text-sm font-medium text-zinc-200">Lumina Fuji Residence</p>
            <p className="text-xs text-zinc-300">{t('guide.location')}</p>
          </div>
        </div>

        <div>
          {GUIDE_SECTIONS.map((section) => (
            <AccordionItem key={section.id} section={section} t={t} dynamicValues={dynamicValues} />
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-zinc-400">{t('guide.footer')}</p>
          <Link href="/dashboard/chat" className="text-xs text-gold-400 hover:text-gold-300 mt-1 inline-block">
            {t('guide.footerLink')}
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
