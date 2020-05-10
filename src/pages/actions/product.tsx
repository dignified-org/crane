import React, { useEffect } from 'react';
import { useRouter } from 'next/dist/client/router';
import DefaultError from 'next/error';
import { Redirect } from '@shopify/app-bridge/actions';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';
import {
  Spinner,
  Stack,
  DisplayText,
  EmptyState,
  Link,
} from '@shopify/polaris';
import { ResourceType } from '@shopify/app-bridge/actions/Navigation/Redirect';
import { useAppBridge } from '../_app';
import { useSite } from '../../graph/useUser';

function ProductAction() {
  return <DefaultError statusCode={404} />;
}

const PREVIEW_QUERY = gql`
  query PreviewProduct($id: ID!) {
    product(id: $id) {
      id
      legacyResourceId
      storefrontId
      handle
      title
      published: publishedOnCurrentPublication
    }
  }
`;

function AppProduct() {
  const router = useRouter();

  const { id } = router.query;

  const { data } = useQuery(PREVIEW_QUERY, {
    variables: {
      id: `gid://shopify/Product/${id}`,
    },
  });
  const [site, loading] = useSite();

  const product = data?.product;

  const appBridge = useAppBridge();
  useEffect(() => {
    if (product?.published && site?.url) {
      Redirect.create(appBridge).dispatch(Redirect.Action.REMOTE, {
        url: `${site.url}/product/${product.handle}`,
        newContext: true,
      });

      setTimeout(() => {
        Redirect.create(appBridge).dispatch(Redirect.Action.ADMIN_SECTION, {
          name: ResourceType.Product,
          resource: {
            id: product.legacyResourceId,
          },
        });
      }, 5);
    }
  }, [appBridge, product, site]);

  if (!product || product?.published || !site || loading) {
    return (
      <div
        style={{
          display: 'grid',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          alignItems: 'center',
          justifyItems: 'center',
        }}
      >
        <Stack alignment="center">
          <DisplayText size="large">Starting preview</DisplayText>
          <Spinner />
        </Stack>
      </div>
    );
  }

  return (
    <EmptyState
      heading="Product is not available on Crane sales channel"
      image="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
      action={{
        content: `Back to product`,
        onAction: () => {
          Redirect.create(appBridge).dispatch(Redirect.Action.ADMIN_SECTION, {
            name: ResourceType.Product,
            resource: {
              id: product.legacyResourceId,
            },
          });
        },
      }}
      secondaryAction={{ content: 'back to dashboard', url: '/' }}
    >
      <p>
        {product.title} has not been published to the Crane sales channel and
        cannot be previewed at this time.
      </p>
      <br />
      <p>
        Hi there app submissions team - I did plan to implement this but things
        fell through with Gatsby preview. Their api is not quite ready yet but
        hopefully by the time Crane sees public usage there is an unpublished
        preview option.{' '}
      </p>
      <br />
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <Link
        url="https://www.loom.com/share/8acf8d579d394b20b4c0b0a9dea24e0b"
        external
      >
        A video of my early Gatsby preview prototype - this would open for
        unpublished products
      </Link>
    </EmptyState>
  );
}

ProductAction.App = AppProduct;

export default ProductAction;
