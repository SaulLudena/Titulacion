import ExecutiveLayout from '@/src/components/dashboard/executive/executivelayout' // tu import actual

import { useRouter } from 'next/router'
import DetailCertify from '@/src/components/dashboard/executive/certifydataset/detailcertify'

export default function CertifyFormPage() {
  const { query, isReady } = useRouter()

  return (
    <ExecutiveLayout>
      {isReady && <DetailCertify id={query.id} />}
    </ExecutiveLayout>
  )
}
