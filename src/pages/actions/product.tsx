import React, { useLayoutEffect } from 'react';
import { useRouter } from 'next/dist/client/router';
import { createApp } from '@shopify/app-bridge';
import Error from 'next/error';
import { Redirect } from '@shopify/app-bridge/actions';
import { sharedConfig } from '../../config';

function ProductAction() {
  const router = useRouter();

  const { id, shop } = router.query;

  useLayoutEffect(() => {
    if (!id || !shop) {
      return;
    }

    const framed = window !== window.top;
    const redirect = new URL(`https://${window.location.hostname}/preview`);

    redirect.searchParams.set('shop', shop as string);
    redirect.searchParams.set('id', id as string);

    if (!framed) {
      window.location.href = redirect.toString();
    } else {
      const app = createApp({
        shopOrigin: shop as string,
        apiKey: sharedConfig.SHOPIFY_API_KEY,
        forceRedirect: false,
      });
      const r = Redirect.create(app);
      r.dispatch(Redirect.Action.REMOTE, {
        url: redirect.toString(),
        // newContext: true,
      });

      // setTimeout(() => {
      //   r.dispatch(Redirect.Action.ADMIN_SECTION, {
      //     section: {
      //       name: Redirect.ResourceType.Product,
      //       resource: {
      //         id: id as string,
      //       },
      //     },
      //   });
      // }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!id || !shop) {
    return <Error statusCode={404} />;
  }

  return <p>Starting preview</p>;
}

export default ProductAction;
