import React from 'react'
import ComplianceLayout from '@/src/components/dashboard/complianceofficer/complianceofficerlayout'
import SecondApproval from '@/src/components/dashboard/complianceofficer/secondapproval/secondapproval'

export default function ComplianceDashboardPage() {
  return (
    <ComplianceLayout>
      <SecondApproval />
    </ComplianceLayout>
  )
}
