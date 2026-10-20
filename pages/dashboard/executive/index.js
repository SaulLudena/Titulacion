import React from 'react'
import ExecutiveLayout from '@/src/components/dashboard/executive/executivelayout'
import Pendingapprove from '@/src/components/dashboard/executive/pendingapprove/pendingapprove'

export default function ExecutiveDashboard() {
  return (
    <ExecutiveLayout>
      <Pendingapprove />
    </ExecutiveLayout>
  )
}
