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
} from '@shopify/polaris';
import { ViewMinor } from '@shopify/polaris-icons';
import { Redirect, Toast } from '@shopify/app-bridge/actions';
import { Modal } from '@shopify/app-bridge-react';
import { createApp } from '@shopify/app-bridge';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import { formatDistanceToNow } from 'date-fns';
import { useToggle } from '@shopify/react-hooks';
import { useMe } from '../graph/useUser';
import { sharedConfig, shop } from '../config';
import Welcome from '../components/Welcome';

function IndexRoute() {
  const me = useMe();

  // @todo only show setup when needed
  return <Page title="Crane">todo</Page>;
}

// const USER_LINK_VERCEL_MUTATION = gql`
//   mutation UserLinkVercel {
//     userLinkVercel
//   }
// `;

function App() {
  const me = useMe();

  const {
    value: deployNowModalOpen,
    setTrue: handleOpenDeployNowModal,
    setFalse: handleCloseDeployNowModal,
  } = useToggle(false);

  if (!me) {
    return <SkeletonPage title="Crane" />;
  }

  return (
    <Page
      title="Crane"
      primaryAction={{
        content: 'Deploy now',
        onAction: handleOpenDeployNowModal,
      }}
      secondaryActions={[
        {
          external: true,
          url: 'https://google.ca',
          content: 'View your store',
          icon: ViewMinor,
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          <MediaCard
            title="Current deployment"
            description="This is what your customers are seeing"
            primaryAction={{
              external: true,
              url: 'https://google.ca',
              content: 'Preview',
            }}
            popoverActions={[{ content: 'Redeploy', onAction: console.log }]}
          >
            <img
              alt=""
              width="100%"
              height="100%"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              src="https://vercel.com/api/screenshot?deploymentId=dpl_62Kga4Hgwk4TfD6V5cgHPwg9qfES&teamId=team_CdRRPnMWN93vc9SmTZihJFJV"
            />
            <iframe
              src="https://vercel.com/api/screenshot?deploymentId=dpl_62Kga4Hgwk4TfD6V5cgHPwg9qfES&teamId=team_CdRRPnMWN93vc9SmTZihJFJV"
              title="test"
            />
          </MediaCard>
        </Layout.Section>
      </Layout>
      <Modal
        open={deployNowModalOpen}
        onClose={handleCloseDeployNowModal}
        title="Deploy now"
        message="This will redeploy your website. It may take a few minutes depending on your configuration"
        primaryAction={{
          content: 'Deploy',
          onAction: console.log,
        }}
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
