import Head from 'next/head'
import { useEffect, useState } from 'react'
import { PlaidApi } from 'plaid'
import { usePlaidLink } from 'react-plaid-link'
import Stripe from 'stripe'
import { configuration } from '../lib/utils'

function Home(props) {
  const { link_token, id } = props
  const [message, setMessage] = useState('')
  const onSuccess = async (public_token, metadata) => {
    // Select Account is disabled: https://dashboard.plaid.com/link/account-select
    const account_id = metadata.accounts[0].id

    const response = await fetch('/api/save_to_stripe', {
      method: 'POST',
      body: JSON.stringify({ id, public_token, account_id })
    })
    if (response.ok) {
      setMessage('Thank you!')
    }
  }

  const config = {
    token: link_token,
    onSuccess
  }

  const { open, ready } = usePlaidLink(config)

  useEffect(() => {
    if (!ready) {
      return
    }
    open()
  }, [ready, open])

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

export async function getServerSideProps({ res, query }) {
  const client = new PlaidApi(configuration)
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

  const clientUserId = 'Stripe'
  try {
    if (!query.id) {
      res.statusCode = 307
      res.setHeader('Location', `/not-found`)
      return { props: {} }
    }

    const customer = await stripe.customers.retrieve(query.id)

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

    return { props: { ...data, id: customer.id } }
  } catch (e) {
    if (e.code === 'resource_missing') {
      res.statusCode = 307
      res.setHeader('Location', `/not-found`)
    }
    return { props: {} }
  }
}

export default Home