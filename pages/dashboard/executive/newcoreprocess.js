import React from 'react'
import ExecutiveLayout from '@/src/components/dashboard/executive/executivelayout'
import NewCoreProcess from '@/src/components/dashboard/executive/newcoreprocess/newcoreprocess'
import Head from 'next/head'

export default function NewProcessPage() {
  return (
    <>
      <Head>
        <title>Banco Andino | Nuevo proceso core</title>
        <meta
          name="description"
          content="Login Banco Andino, catalogo de data de la empresa"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
      </Head>
      <ExecutiveLayout>
        <NewCoreProcess />
      </ExecutiveLayout>
    </>
  )
}
