import React, { useMemo } from 'react';
import {
  Page,
  SkeletonPage,
  Layout,
  Card,
  TextContainer,
  AccountConnection,
} from '@shopify/polaris';
import { Redirect } from '@shopify/app-bridge/actions';
import { createApp } from '@shopify/app-bridge';
import { useMe } from '../graph/useUser';
import { sharedConfig, shop } from '../config';

function IndexRoute() {
  const me = useMe();

  // @todo only show setup when needed
  return <Page title="Crane">todo</Page>;
}

IndexRoute.App = function App() {
  const me = useMe();

  if (!me) {
    return <SkeletonPage title="Setup" />;
  }

  // @todo only show setup when needed
  return (
    <Page title="Setup">
      <Layout>
        <Layout.Section>
          <TextContainer>
            <p>Welcome {me.firstName},</p>
            <p>Let&apos;s get you set up</p>
          </TextContainer>
        </Layout.Section>
        <Layout.Section>
          <AccountConnection
            accountName=""
            connected={false}
            title="Vercel (previously Zeit)"
            action={{
              content: 'Connect',
              onAction: () => {
                const redirectUrl = `https://vercel.com/oauth/authorize?client_id=${sharedConfig.VERCEL_API_KEY}&state=test`;
                const framed = window !== window.top;

                if (!framed) {
                  window.location.href = redirectUrl;
                } else {
                  const app = createApp({
                    shopOrigin: shop(),
                    apiKey: sharedConfig.SHOPIFY_API_KEY,
                    forceRedirect: false,
                  });
                  const r = Redirect.create(app);
                  r.dispatch(Redirect.Action.REMOTE, {
                    url: redirectUrl,
                    // newContext: true,
                  });
                }
              },
            }}
            // details={details}
            // termsOfService={terms}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default IndexRoute;
