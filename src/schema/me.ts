import { Context } from './context';
import { MeResolvers, QueryResolvers, Location } from './generated';

export const queryMe: QueryResolvers['me'] = async (parent, args, context) => {
  const { pathname = '/', location = Location.Top } = args;
  const { host, shop, store } = context;

  if (!shop) {
    throw new Error('Invalid shop provided');
  }

  if (!store) {
    const nonce = await jwt.sign(
      {
        shop,
        pathname,
        state: shortid.generate(),
      },
      serverConfig.SHOPIFY_SHARED_SECRET,
      {
        algorithm: 'HS256',
      },
    );

    return {
      __typename: 'Forbidden',
      redirect: generateRedirect({
        apiKey: sharedConfig.SHOPIFY_API_KEY,
        redirect: `https://${host}/api/shopify/callback`,
        shop,
        scopes: [
          'write_products',
          'write_content',
          'read_product_listings',
          'write_customers',
          'write_inventory',
          'write_checkouts',
          'unauthenticated_read_product_listings',
          'unauthenticated_read_product_tags',
          'unauthenticated_write_checkouts',
          'unauthenticated_read_checkouts',
          'unauthenticated_write_customers',
          'unauthenticated_read_customers',
          'unauthenticated_read_customer_tags',
          'unauthenticated_read_content',
        ],
        nonce,
      }),
    };
  }

  return {
    __typename: 'User',
    email: 'me@fake.com',
  };
};

export const Me: MeResolvers = {
  // eslint-disable-next-line no-underscore-dangle
  __resolveType: me => me.__typename,
};
