import React, {
  useState,
  useMemo,
  createContext,
  ReactNode,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { AppProps } from 'next/app';

import { AppProvider, SkeletonPage, SkeletonBodyText } from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/styles.css';

import createApp, { ClientApplication } from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';
import {
  Context as ShopifyAppBridgeContext,
  RoutePropagator,
  Loading,
  useClientRouting,
} from '@shopify/app-bridge-react';

import { ApolloProvider } from '@apollo/client';

import DefaultError from 'next/error';
import { useRouter } from 'next/dist/client/router';
import Link from '../Link';
import BrowserOnly from '../BrowserOnly';

import { shop as loadShop, token as loadToken, sharedConfig } from '../config';
import { generateAuthRedirect, AccessMode } from '../shopify/auth';
import { client } from '../graph';
import { issueNonce, Location } from '../shopify/nonce';

import { sentry } from '../sentry';
import { REQUIRED_SCOPES } from '../shopify/scopes';
import { useSite } from '../graph/useUser';

sentry();

function initializeAppBridge() {
  return createApp({
    shopOrigin: loadShop(),
    apiKey: sharedConfig.SHOPIFY_API_KEY,
    forceRedirect: false,
  });
}

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
    const app = initializeAppBridge();
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

function RouteChangeLoading() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleRouteChangeStart = useCallback(() => {
    setLoading(true);
  }, [setLoading]);

  const handleRouteChangeComplete = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  const [newRoute, setNewRoute] = useState();

  useClientRouting({ replace: setNewRoute as any });

  useEffect(() => {
    if (newRoute) {
      router.replace(newRoute, newRoute);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRoute]);

  useEffect(() => {
    // Undefined on the server
    if (!router) {
      return;
    }

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [handleRouteChangeComplete, handleRouteChangeStart, router]);

  return loading ? <Loading /> : null;
}

const AppBridgeContext = createContext<ClientApplication<any>>(null);

export function useAppBridge() {
  const appBridge = useContext(AppBridgeContext);

  if (!appBridge) {
    throw new Error('Must be within app bridge provider');
  }

  return appBridge;
}

interface AppBridgeProviderProps {
  children: ReactNode;
}

function AppBridgeProvider(props: AppBridgeProviderProps) {
  const { children } = props;

  const router = useRouter();
  const [appBridge] = useState(initializeAppBridge);

  // Force redirect to setup if not setup
  // const [site, loading] = useSite();
  // if (!site && !loading && router.pathname !== '/setup') {
  //   router.replace('/setup');
  // }

  return (
    <AppBridgeContext.Provider value={appBridge}>
      <ShopifyAppBridgeContext.Provider value={appBridge}>
        <>
          <RoutePropagator location={`${router.asPath}`} />
          <RouteChangeLoading />
          {children}
        </>
      </ShopifyAppBridgeContext.Provider>
    </AppBridgeContext.Provider>
  );
}

function App({ Component, pageProps }: AppProps) {
  const [mounted] = useState(mountApp);

  const markup = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const app = window !== window.top;

    if (app) {
      const C: any = Component;

      if (!C.App) {
        return <DefaultError statusCode={404} />;
      }

      if (!mounted) {
        return (
          <SkeletonPage>
            <SkeletonBodyText lines={4} />
          </SkeletonPage>
        );
      }

      return (
        <AppBridgeProvider>
          <C.App {...pageProps} />
        </AppBridgeProvider>
      );
    }

    if (!mounted) {
      return null;
    }

    return <Component {...pageProps} />;
  }, [Component, mounted, pageProps]);

  return (
    <BrowserOnly>
      <ApolloProvider client={client}>
        <AppProvider i18n={en} linkComponent={Link}>
          {markup}
        </AppProvider>
      </ApolloProvider>
    </BrowserOnly>
  );
}

export default App;
