'use client'

import LightingSetupWizard from '@/components/LightingSetupWizard'

export default function OwnerLightingSetupPage() {
  return (
    <div className="py-4">
      <LightingSetupWizard
        accentColor="#3b82f6"
        backHref="/owner/settings"
        portalLabel="設定"
      />
    </div>
  )
}
