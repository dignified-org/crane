import React, { useState } from 'react';
import { AppProps } from 'next/app';

import { AppProvider } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/styles.css';

import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';

import { ApolloProvider } from '@apollo/client';

import Link from '../Link';
import BrowserOnly from '../BrowserOnly';

import { shop as loadShop, token as loadToken, sharedConfig } from '../config';
import { generateAuthRedirect, AccessMode } from '../shopify/auth';
import { client } from '../graph';
import { issueNonce, Location } from '../shopify/nonce';

import { sentry } from '../sentry';
import { REQUIRED_SCOPES } from '../shopify/scopes';

sentry();

export function redirectToLogin(shop: string) {
  const framed = window !== window.top;

  const url = new URL(window.location.href);
  const location =
    url.searchParams.get('app') ?? framed ? Location.Admin : Location.Top;

  const redirect = generateAuthRedirect({
    shop,
    mode: AccessMode.Online,
    nonce: issueNonce(
      {
        location,
        mode: AccessMode.Online,
        pathname: window.location.pathname,
        search: window.location.search,
        shop,
      },
      sharedConfig.SHOPIFY_API_KEY,
    ),
    redirect: `https://${window.location.hostname}/api/shopify/login`,
    scopes: REQUIRED_SCOPES,
    apiKey: sharedConfig.SHOPIFY_API_KEY,
  });

  if (!framed) {
    window.location.href = redirect;
  } else {
    const app = createApp({
      shopOrigin: shop,
      apiKey: sharedConfig.SHOPIFY_API_KEY,
      forceRedirect: false,
    });
    Redirect.create(app).dispatch(
      Redirect.Action.ADMIN_PATH,
      redirect.replace(`https://${shop}/admin`, ''),
    );
  }
}

function mountApp() {
  if (typeof window === 'undefined') {
    return false;
  }

  const shop = loadShop();
  const token = loadToken();

  const framed = window !== window.top;
  const url = new URL(window.location.href);

  if (shop && (!token || (!framed && url.searchParams.get('app')))) {
    redirectToLogin(shop);
    return false;
  }

  return true;
}

function App({ Component, pageProps }: AppProps) {
  const [mounted] = useState(mountApp);

  if (!mounted) {
    return null;
  }

  const framed = window !== window.top;
  const url = new URL(window.location.href);

  const app = framed || !!url.searchParams.get('app');

  let C: any = Component;
  if (app && C.App) {
    C = C.App;
  }

  return (
    <BrowserOnly>
      <ApolloProvider client={client}>
        <AppProvider i18n={en} linkComponent={Link}>
          <C {...pageProps} />
        </AppProvider>
      </ApolloProvider>
    </BrowserOnly>
  );
}

export default App;
