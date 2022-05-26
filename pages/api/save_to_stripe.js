import { PlaidApi } from 'plaid'
import { configuration } from '../../lib/utils'
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  // Terminate early for non-post requests
  if (req.method !== 'POST') {
    res.status(405).end('Method Not Allowed')
  }

  const { public_token, account_id, id } = JSON.parse(req.body)
  if (!public_token || !account_id || !id) {
    res.status(402).send('You must provide valie token, accountId and id')
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

    await stripe.customers.update(
      id,
      {
        source: bankAccountToken
      }
    )

    res.status(200).send('success')
  } catch (error) {
    res.status(402).send(error)
  }

}
