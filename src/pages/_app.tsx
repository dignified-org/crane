import React, { useState } from 'react';
import { AppProps } from 'next/app';

import { AppProvider } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/styles.css';

import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';

import Link from '../Link';
import BrowserOnly from '../BrowserOnly';

import { shop as loadShop, token as loadToken, sharedConfig } from '../config';
import { generateAuthRedirect, AccessMode } from '../shopify/auth';
import { Location } from '../shopify/nonce';

function mountApp() {
  if (typeof window === 'undefined') {
    return false;
  }

  const shop = loadShop();
  const token = loadToken();

  const framed = window !== window.top;

  if (shop && !token) {
    const redirect = generateAuthRedirect({
      shop,
      mode: AccessMode.Online,
      nonce: 'todo',
      redirect: `https://${window.location.hostname}/api/shopify/login`,
      scopes: ['write_products'],
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
      console.log(redirect);
      Redirect.create(app).dispatch(
        Redirect.Action.ADMIN_PATH,
        redirect.replace(`https://${shop}/admin`, ''),
      );
    }

    return false;
  }

  return true;
}

function App({ Component, pageProps }: AppProps) {
  const [mounted] = useState(mountApp);

  if (!mounted) {
    return null;
  }

  return (
    <BrowserOnly>
      <AppProvider i18n={en} linkComponent={Link}>
        <Component {...pageProps} />
      </AppProvider>
    </BrowserOnly>
  );
}

export default App;
