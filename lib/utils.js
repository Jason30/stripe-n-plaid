import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

export const configuration = new Configuration({
  basePath: process.env.NODE_ENV === 'production' ? PlaidEnvironments.production : PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
})
