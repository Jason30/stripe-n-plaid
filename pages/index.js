import Head from 'next/head'
import { useCallback, useEffect, useState } from 'react'
import { PlaidApi } from 'plaid'
import { usePlaidLink } from 'react-plaid-link'
import { configuration, validateEmail } from '../lib/utils'

function Home(props) {
  const { link_token } = props
  const [message, setMessage] = useState('')
  let email

  const onSuccess = useCallback(async (public_token, metadata) => {
    // Select Account is disabled: https://dashboard.plaid.com/link/account-select
    const account_id = metadata.accounts[0].id

    const response = await fetch('/api/save_to_stripe', {
      method: 'POST',
      body: JSON.stringify({ public_token, account_id, email })
    })
    if (response.ok) {
      setMessage('Thank you!')
    }
  })

  const config = {
    token: link_token,
    onSuccess
  }

  const { open, ready, error } = usePlaidLink(config)

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    email = query.get('email')
    if (!ready) {
      return
    }
    init()
  }, [ready, open])

  const init = () => {
    if (!email) {
      setMessage('No valid email is found!')
    } else if (!validateEmail(email)) {
      setMessage(email + 'is not a valid email address!')
    } else {
      open()
    }
  }

  return (
    <>
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
      client_name: 'Habitat Logistics',
      products: ['auth'],
      country_codes: ['US'],
      language: 'en'
    })

    // Pass the result to your client-side app to initialize Link
    const { data } = response

    return { props: { ...data } }
  } catch (e) {
    return { props: {} }
  }
}

export default Home