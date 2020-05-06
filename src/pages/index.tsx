import React, { useMemo } from 'react';
import {
  Page,
  SkeletonPage,
  Layout,
  Card,
  TextContainer,
} from '@shopify/polaris';
import { useMe } from '../graph/useUser';

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
      <Layout sectioned>
        <TextContainer>
          <p>Welcome {me.firstName},</p>
          <p>Let&apos;s get you set up</p>
        </TextContainer>
        <Card title="Provider">todo</Card>
      </Layout>
    </Page>
  );
};

export default IndexRoute;
