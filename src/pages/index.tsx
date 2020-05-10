import React, { useCallback } from 'react';
import {
  Page,
  SkeletonPage,
  Layout,
  TextContainer,
  AccountConnection,
  Link,
  DisplayText,
  MediaCard,
  SkeletonBodyText,
  Card,
  TextStyle,
} from '@shopify/polaris';
import { formatDistanceToNow } from 'date-fns';
import { ViewMinor } from '@shopify/polaris-icons';
import { Redirect, Toast } from '@shopify/app-bridge/actions';
import { Modal, TitleBar, Loading } from '@shopify/app-bridge-react';
import { createApp } from '@shopify/app-bridge';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client';

import { useToggle } from '@shopify/react-hooks';
import DefaultError from 'next/error';
import { useMe } from '../graph/useUser';
import { sharedConfig, shop } from '../config';
import Welcome from '../components/Welcome';
import { SiteQuery, SiteQueryVariables } from '../graph/generated';
import { useAppBridge } from './_app';

function IndexRoute() {
  const me = useMe();

  // @todo only show setup when needed
  return <DefaultError statusCode={404} />;
}

const SITE_QUERY = gql`
  query SiteIndex {
    site {
      id
      name
      url
      building
      thumbnail
      deployments {
        id
        createdAt
        building
        error
        url
      }
    }
  }
`;

export function useSite() {
  return useQuery<SiteQuery, SiteQueryVariables>(SITE_QUERY, {
    pollInterval: 3000,
  });
}

const REDEPLOY_MUTATION = gql`
  mutation Redeploy {
    vercelDeploy
  }
`;

function App() {
  const me = useMe();
  const { data, loading } = useSite();
  const [redeploy, { loading: deploying }] = useMutation(REDEPLOY_MUTATION);

  const site = data?.site;
  const app = useAppBridge();

  const {
    value: deployNowModalOpen,
    setTrue: handleOpenDeployNowModal,
    setFalse: handleCloseDeployNowModal,
  } = useToggle(false);

  const handleDeploy = useCallback(() => {
    handleCloseDeployNowModal();
    redeploy()
      .then(() => {
        const toast = Toast.create(app, {
          message: 'Deployment created',
          duration: 2000,
        });
        toast.dispatch(Toast.Action.SHOW);
      })
      .catch(e => {
        console.warn(e);
        const toast = Toast.create(app, {
          message: 'Failed to create deployment',
          isError: true,
          duration: 2000,
        });
        toast.dispatch(Toast.Action.SHOW);
      });
  }, [app, handleCloseDeployNowModal, redeploy]);

  if (!me || !site) {
    return (
      <SkeletonPage title="Crane dashboard">
        <SkeletonBodyText lines={4} />
      </SkeletonPage>
    );
  }

  return (
    <Page
      title="Crane dashboard"
      primaryAction={{
        content: 'Deploy now',
        onAction: handleOpenDeployNowModal,
        loading: deploying,
      }}
      secondaryActions={[
        {
          external: true,
          url: site.url,
          content: 'View your store',
          icon: ViewMinor,
        },
      ]}
    >
      <TitleBar title="" />
      {deploying && <Loading />}
      <Layout>
        <Layout.Section>
          <MediaCard
            title="Current live website"
            description={
              (
                <>
                  <span>
                    This is the website your customers are currently seeing
                  </span>
                  <br />
                  <br />
                  <span>
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link external url={site.url}>
                      {site.url}
                    </Link>
                  </span>
                  <br />
                  <br />
                  <span>
                    {' '}
                    If it has gotten out of date, you can redeploy now, The
                    process may take a few moments to complete.
                  </span>
                </>
              ) as any
            }
            primaryAction={{
              external: true,
              url: site.url,
              content: 'Preview',
            }}
            popoverActions={[{ content: 'Redeploy', onAction: console.log }]}
          >
            <img
              alt=""
              width="100%"
              height="100%"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              src={site?.thumbnail ? site.thumbnail : undefined}
            />
          </MediaCard>
        </Layout.Section>
        <Layout.AnnotatedSection
          title="Deployment history"
          description={
            <>
              <p>Automatically updated every 3 seconds</p>
              <br />
              <p>Your three latest production builds will show here</p>
              <br />
              <p>
                To see more builds see the{' '}
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <Link url="/builds">builds tab</Link>
              </p>
            </>
          }
        >
          {site.deployments.map((d, index) => {
            return (
              <Card
                key={d.id}
                sectioned
                subdued={index !== 0}
                title={`Build ${
                  // eslint-disable-next-line no-nested-ternary
                  !d.error && !d.building
                    ? 'completed'
                    : d.error
                    ? 'completed with errors'
                    : 'started'
                } ${formatDistanceToNow(d.createdAt * 1000)} ago`}
              >
                {d.building && (
                  <>
                    <p>
                      Still building, will automatically deploy once complete
                    </p>
                    <br />
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link url={d.url} external>
                      See in Vercel
                    </Link>
                  </>
                )}
                {d.error && (
                  <>
                    <TextStyle variation="negative">
                      This build has failed due to an error
                    </TextStyle>
                    <br />
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link url={d.url} external>
                      See in Vercel
                    </Link>
                  </>
                )}
                {!d.error && !d.building && (
                  <TextStyle>
                    This build completed and has been deployed
                    <br />
                    <br />
                    It can be{' '}
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link url={d.url} external>
                      previewed here
                    </Link>
                  </TextStyle>
                )}
              </Card>
            );
          })}
        </Layout.AnnotatedSection>
      </Layout>
      <Modal
        open={deployNowModalOpen}
        onClose={handleCloseDeployNowModal}
        title="Deploy now"
        message="This will redeploy your website. It may take a few minutes depending on your configuration"
        primaryAction={{
          content: 'Deploy',
          onAction: handleDeploy,
          disabled: deploying,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleCloseDeployNowModal,
            disabled: deploying,
          },
        ]}
      />
    </Page>
  );
}

IndexRoute.App = App;

// IndexRoute.App = function App() {
//   const me = useMe();

//   const [mutate, { loading }] = useMutation(USER_LINK_VERCEL_MUTATION);
//   const handleLinkVercel = useCallback(() => {
//     mutate()
//       .then(response => {
//         const redirectUrl = response.data?.userLinkVercel;
//         const framed = window !== window.top;

//         if (!framed) {
//           window.location.href = redirectUrl;
//         } else {
//           const app = createApp({
//             shopOrigin: shop(),
//             apiKey: sharedConfig.SHOPIFY_API_KEY,
//             forceRedirect: false,
//           });
//           const r = Redirect.create(app);
//           r.dispatch(Redirect.Action.REMOTE, {
//             url: redirectUrl,
//             // newContext: true,
//           });
//         }
//       })
//       .catch(e => {
//         // eslint-disable-next-line no-console
//         console.warn(e);
//         if (window !== window.top) {
//           const app = createApp({
//             shopOrigin: shop(),
//             apiKey: sharedConfig.SHOPIFY_API_KEY,
//             forceRedirect: false,
//           });
//           const toast = Toast.create(app, {
//             message: 'Failed to link Vercel',
//             isError: true,
//             duration: 2000,
//           });
//           toast.dispatch(Toast.Action.SHOW);
//         }
//       });
//   }, [mutate]);

//   if (!me) {
//     return <SkeletonPage title="Setup" />;
//   }

//   // @todo only show setup when needed
//   return (
//     <Page title="Setup">
//       <Layout>
//         <Layout.Section>
//           <TextContainer>
//             <p>Welcome {me.firstName},</p>
//             <p>Let&apos;s get you set up</p>
//           </TextContainer>
//         </Layout.Section>
//         <Layout.Section>
//           <AccountConnection
//             avatarUrl={me?.vercel?.avatar}
//             title="Vercel (previously Zeit)"
//             accountName="Vercel (previously Zeit)"
//             connected={!!me?.vercel?.id}
//             action={{
//               content: me?.vercel
//                 ? 'Reconnect Versel account'
//                 : 'Connect Versel account',
//               onAction: handleLinkVercel,
//               ...({ loading } as any),
//             }}
//             details={
//               me?.vercel ? (
//                 <p>
//                   Connected to Vercel as {me.vercel.name}{' '}
//                   {formatDistanceToNow(
//                     Number.parseInt(me.vercel.updatedAt, 10),
//                   )}{' '}
//                   ago
//                 </p>
//               ) : (
//                 <>
//                   <p>
//                     Vercel is a platform that makes deploying websites easy,
//                     universal, and accessible.
//                   </p>
//                   <p>
//                     {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
//                     <Link url="https://vercel.com/about" external>
//                       Visit the Vercel website to learn more
//                     </Link>{' '}
//                   </p>
//                 </>
//               )
//             }
//           />
//         </Layout.Section>
//       </Layout>
//     </Page>
//   );
// };

export default IndexRoute;
