import React, { useCallback } from 'react';
import {
  Page,
  SkeletonPage,
  Layout,
  TextContainer,
  AccountConnection,
  Link,
} from '@shopify/polaris';
import { Redirect, Toast } from '@shopify/app-bridge/actions';
import { createApp } from '@shopify/app-bridge';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { useMe } from '../graph/useUser';
import { sharedConfig, shop } from '../config';

function IndexRoute() {
  const me = useMe();

  // @todo only show setup when needed
  return <Page title="Crane">todo</Page>;
}

const USER_LINK_VERCEL_MUTATION = gql`
  mutation UserLinkVercel {
    userLinkVercel
  }
`;

IndexRoute.App = function App() {
  const me = useMe();

  const [mutate, { loading }] = useMutation(USER_LINK_VERCEL_MUTATION);
  const handleLinkVercel = useCallback(() => {
    mutate()
      .then(response => {
        const redirectUrl = response.data?.userLinkVercel;
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
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.warn(e);
        if (window !== window.top) {
          const app = createApp({
            shopOrigin: shop(),
            apiKey: sharedConfig.SHOPIFY_API_KEY,
            forceRedirect: false,
          });
          const toast = Toast.create(app, {
            message: 'Failed to link Vercel',
            isError: true,
            duration: 2000,
          });
          toast.dispatch(Toast.Action.SHOW);
        }
      });
  }, [mutate]);

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
            avatarUrl={me?.vercel?.avatar}
            title="Vercel (previously Zeit)"
            accountName="Vercel (previously Zeit)"
            connected={!!me?.vercel?.id}
            action={{
              content: me?.vercel
                ? 'Reconnect Versel account'
                : 'Connect Versel account',
              onAction: handleLinkVercel,
              ...({ loading } as any),
            }}
            details={
              me?.vercel ? (
                <p>
                  Connected to Vercel as {me.vercel.name}{' '}
                  {formatDistanceToNow(
                    Number.parseInt(me.vercel.updatedAt, 10),
                  )}{' '}
                  ago
                </p>
              ) : (
                <>
                  <p>
                    Vercel is a platform that makes deploying websites easy,
                    universal, and accessible.
                  </p>
                  <p>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link url="https://vercel.com/about" external>
                      Visit the Vercel website to learn more
                    </Link>{' '}
                  </p>
                </>
              )
            }
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default IndexRoute;
