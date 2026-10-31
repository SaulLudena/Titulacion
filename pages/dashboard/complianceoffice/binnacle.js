import ComplianceOfficerBinnacle from '@/src/components/dashboard/complianceofficer/complianceofficerbinnacle'
import ComplianceLayout from '@/src/components/dashboard/complianceofficer/complianceofficerlayout'
import Head from 'next/head'
import React from 'react'

export default function binnaclePage() {
  return (
    <>
      <Head>
        <title>Banco Andino | Bitácora</title>
        <meta
          name="description"
          content="Login Banco Andino, catalogo de data de la empresa"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
      </Head>
      <ComplianceLayout>
        <ComplianceOfficerBinnacle />
      </ComplianceLayout>
    </>
  )
}
