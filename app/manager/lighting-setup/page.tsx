'use client'

import LightingSetupWizard from '@/components/LightingSetupWizard'

export default function ManagerLightingSetupPage() {
  return (
    <div className="py-4">
      <LightingSetupWizard
        accentColor="#14b8a6"
        backHref="/manager/settings"
        portalLabel="設定"
      />
    </div>
  )
}
