import Login from '@/src/components/login/login'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Banco Andino | Login</title>
        <meta
          name="description"
          content="Login Banco Andino, catalogo de data de la empresa"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" href="/favicon.png" type="image/svg+xml" />
      </Head>
      <Login />
    </>
  )
}
