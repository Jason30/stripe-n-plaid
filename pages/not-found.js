import Head from 'next/head'

function NotFound() {
  return (
    <>
      <Head>
        <title>Plaid + Stripe</title>
        <meta name="description" content="Plaid and Stripe integration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {
          <h1>ID is not valid or is not specified!</h1>
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

export default NotFound