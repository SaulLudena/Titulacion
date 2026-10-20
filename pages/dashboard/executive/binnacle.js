import React from 'react'
import ExecutiveLayout from '@/src/components/dashboard/executive/executivelayout'
import AuditLog from '@/src/components/dashboard/executive/binnacle/binnacle'

export default function AuditLogPage() {
  return (
    <ExecutiveLayout>
      <AuditLog />
    </ExecutiveLayout>
  )
}
