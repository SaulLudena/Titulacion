import React from 'react'
import ComplianceLayout from '@/src/components/dashboard/complianceofficer/complianceofficerlayout'
import SecondApproval from '@/src/components/dashboard/complianceofficer/secondapproval/secondapproval'
import Head from 'next/head'

export default function ComplianceDashboardPage() {
  return (
    <>
      <Head>
        <title>Banco Andino | Segunda aprobación</title>
        <meta
          name="description"
          content="Login Banco Andino, catalogo de data de la empresa"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
      </Head>
      <ComplianceLayout>
        <SecondApproval />
      </ComplianceLayout>
    </>
  )
}
