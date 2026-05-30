'use client'

import PlacesEditor from '@/components/PlacesEditor'

export default function ManagerPlacesPage() {
  return (
    <div className="py-4">
      <PlacesEditor accentColor="#14b8a6" backHref="/manager/settings" portalLabel="設定" />
    </div>
  )
}
