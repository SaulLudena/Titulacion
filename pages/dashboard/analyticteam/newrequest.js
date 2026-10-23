import React from 'react'
import { useRouter } from 'next/router'
import AnalyticTeamLayout from '@/src/components/dashboard/analyticteam/analyticteamlayout'
import RequestAccessForm from '@/src/components/dashboard/analyticteam/myrequests/newrequest'

export default function NewRequest() {
  const router = useRouter()

  return (
    <AnalyticTeamLayout>
      <RequestAccessForm
        onCancel={() => router.back()}
        onSubmitSuccess={() => {
          alert('¡Solicitud registrada correctamente!')
          router.push('/dashboard/analyticteam/myrequestspage')
        }}
      />
    </AnalyticTeamLayout>
  )
}
