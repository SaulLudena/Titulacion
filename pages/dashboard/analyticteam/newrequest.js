import React from 'react'
import { useRouter } from 'next/router'
import AnalyticTeamLayout from '@/src/components/dashboard/analyticteam/analyticteamlayout'
import RequestAccessForm from '@/src/components/dashboard/analyticteam/myrequests/newrequest'
import Head from 'next/head'

export default function NewRequest() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Banco Andino | Nueva solicitud</title>
        <meta
          name="description"
          content="Login Banco Andino, catalogo de data de la empresa"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
      </Head>
      <AnalyticTeamLayout>
        <RequestAccessForm
          onCancel={() => router.back()}
          onSubmitSuccess={() => {
            alert('¡Solicitud registrada correctamente!')
            router.push('/dashboard/analyticteam/myrequestspage')
          }}
        />
      </AnalyticTeamLayout>
    </>
  )
}
