'use client'

import PlacesEditor from '@/components/PlacesEditor'

export default function OwnerPlacesPage() {
  return (
    <div className="py-4">
      <PlacesEditor accentColor="#3b82f6" backHref="/owner/settings" portalLabel="設定" />
    </div>
  )
}
