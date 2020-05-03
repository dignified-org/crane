import React from 'react';
import { Page } from '@shopify/polaris';
import { useMe } from '../graph/useUser';

function IndexRoute() {
  const me = useMe();

  console.log(me);

  return <Page title="Crane">TODO</Page>;
}

export default IndexRoute;
