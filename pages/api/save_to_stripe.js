import { PlaidApi } from 'plaid'
import { configuration } from '../../lib/utils'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  // Terminate early for non-post requests
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed')
  }

  const { public_token, account_id, email } = JSON.parse(req.body)
  if (!public_token || !account_id || !email) {
    res.status(402).send('You must provide valie token, accountId and email')
  }

  const client = new PlaidApi(configuration)

  try {
    // Exchange the public_token from Plaid Link for an access token.
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token
    });

    const access_token = tokenResponse.data.access_token;

    // Generate a bank account token
    const request = {
      access_token,
      account_id
    };
    const stripeTokenResponse = await client.processorStripeBankAccountTokenCreate(request)
    const bankAccountToken = stripeTokenResponse.data.stripe_bank_account_token

    // Try finding existing customer by email address
    let customerList = await stripe.customers.list({
      email,
      limit: 1
    })

    if (customerList.data.length === 0) {
      // If non found create one
      await stripe.customers.create({
        email,
        source: bankAccountToken
      })
    } else {
      await stripe.customers.update(
        customerList.data[0]?.id,
        {
          source: bankAccountToken
        }
      )
    }

    res.status(200).send('success')
  } catch (error) {
    res.status(402).send(error)
  }

}
