import React from 'react'
import AnalyticTeamLayout from '@/src/components/dashboard/analyticteam/analyticteamlayout'
import Catalog from '@/src/components/dashboard/analyticteam/catalog/catalog'

export default function AnalyticTeamDashboard() {
  return (
    <AnalyticTeamLayout>
      <Catalog />
    </AnalyticTeamLayout>
  )
}
