import Head from 'next/head'
import Script from 'next/script'
import { useEffect, useState } from 'react'
import { PlaidApi } from 'plaid'
import { configuration } from '../lib/utils'

function Home(props) {
  const { link_token } = props
  const [message, setMessage] = useState('')

  let plaidHandler, email
  useEffect(() => {
    if (!plaidHandler) {
      plaidHandler = Plaid.create({
        token: link_token,
        onSuccess,
        onLoad,
        onExit
      })
    }
    const query = new URLSearchParams(window.location.search)
    email = query.get('email')
    initPlaidWindow()
  }, [])

  const onSuccess = async (public_token, metadata) => {
    // Select Account is disabled: https://dashboard.plaid.com/link/account-select
    const account_id = metadata.accounts[0].id

    const response = await fetch('/api/save_to_stripe', {
      method: 'POST',
      body: JSON.stringify({ public_token, account_id, email })
    })

    if (response.ok) {
      setMessage('Thank you!')
    }
  }

  const onLoad = () => { }

  const onExit = async (err, metadata) => {
    // The user exited the Link flow.
    if (err != null) {
      // The user encountered a Plaid API error
      // prior to exiting.
    }
  }

  const initPlaidWindow = () => {
    if (email) {
      plaidHandler.open()
    }
  }

  return (
    <>
      <Script
        src='https://cdn.plaid.com/link/v2/stable/link-initialize.js'
        strategy='beforeInteractive'
      />
      <Head>
        <title>Plaid + Stripe</title>
        <meta name="description" content="Plaid and Stripe integration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {
          message && <h1>{message}</h1>
        }
      </main>
      <style jsx>{`
        main {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100%;
        }
      `}</style>
      <style global jsx>{`
        html,
        body {
          padding: 0;
          margin: 0;
          background-color: floralwhite;
          color: #3e290c;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans,
            Helvetica Neue, sans-serif;
        }
      `}</style>
    </>
  )
}

export async function getServerSideProps() {
  const client = new PlaidApi(configuration)

  const clientUserId = 'Stripe test'
  try {
    const response = await client.linkTokenCreate({
      user: {
        client_user_id: clientUserId,
      },
      client_name: 'My App',
      products: ['auth'],
      country_codes: ['US'],
      language: 'en',
      webhook: 'https://sample.webhook.com',
    })

    // Pass the result to your client-side app to initialize Link
    const { data } = response

    return { props: { ...data } }
  } catch (e) {
    return { props: {} }
  }
}

export default Home