import React from 'react'
import ExecutiveLayout from '@/src/components/dashboard/executive/executivelayout'
import GovernanceIndicators from '@/src/components/dashboard/executive/indicators/indicators'

export default function IndicatorsPage() {
  return (
    <ExecutiveLayout>
      <GovernanceIndicators />
    </ExecutiveLayout>
  )
}
