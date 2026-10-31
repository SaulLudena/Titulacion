import React from 'react'
import AnalyticTeamLayout from '@/src/components/dashboard/analyticteam/analyticteamlayout'
import Catalog from '@/src/components/dashboard/analyticteam/catalog/catalog'
import Head from 'next/head'

export default function AnalyticTeamDashboard() {
  return (
    <>
      <Head>
        <title>Banco Andino | Catalogo</title>
        <meta
          name="description"
          content="Login Banco Andino, catalogo de data de la empresa"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
      </Head>
      <AnalyticTeamLayout>
        <Catalog />
      </AnalyticTeamLayout>
    </>
  )
}
