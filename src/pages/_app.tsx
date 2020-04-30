import React, { useState, useEffect } from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { AppProvider } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/styles.css';

import gql from 'graphql-tag';
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';

import Link from '../Link';
import BrowserOnly from '../BrowserOnly';

import { shop as loadShop, sharedConfig } from '../config';
import { client } from '../graph';
import { sentry } from '../sentry';

const { captureException } = sentry();

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // ignore SSR for now
    if (typeof window === 'undefined') {
      return;
    }

    const shop = loadShop();

    // Detect iFrame
    const framed = window !== window.top;

    if (!framed && !shop) {
      router.replace('/install');
      return;
    }

    if (framed && !shop) {
      // Should never happen since shopify
      // adds the shop query paremeter
      throw new Error(`Failed to identify Shopify store while framed`);
    }

    let cancelled = false;

    client
      .query({
        query: gql`
          query Me {
            me {
              ... on Forbidden {
                redirect
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .then(result => {
        if (cancelled) {
          return;
        }

        if (result.data.me.redirect) {
          if (!framed) {
            window.location.href = result.data.me.redirect;
            return;
          }
          const appBridge = createApp({
            forceRedirect: false,
            shopOrigin: shop,
            apiKey: sharedConfig.SHOPIFY_API_KEY,
          });

          Redirect.create(appBridge).dispatch(
            Redirect.Action.REMOTE,
            result.data.me.redirect,
          );
        } else {
          setMounted(true);
        }
      })
      .catch(e => {
        if (cancelled) {
          return;
        }
        captureException(e, { shop });
      });

    return () => {
      cancelled = true;
    };
    // We only ever want to mount once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
