import { NextApiRequest, NextApiResponse } from 'next';
import safeCompare from 'safe-compare';
import { createHmac } from 'crypto';
import { serverConfig } from '../../../config/server';

export enum WebhookHeader {
  AccessToken = 'X-Shopify-Access-Token',
  Hmac = 'X-Shopify-Hmac-Sha256',
  Topic = 'X-Shopify-Topic',
  Domain = 'X-Shopify-Shop-Domain',
}

export type Topic =
  | 'APP_UNINSTALLED'
  | 'APP_SUBSCRIPTIONS_UPDATE'
  | 'APP_PURCHASES_ONE_TIME_UPDATE'
  | 'CARTS_CREATE'
  | 'CARTS_UPDATE'
  | 'CHECKOUTS_CREATE'
  | 'CHECKOUTS_DELETE'
  | 'CHECKOUTS_UPDATE'
  | 'COLLECTION_LISTINGS_ADD'
  | 'COLLECTION_LISTINGS_REMOVE'
  | 'COLLECTION_LISTINGS_UPDATE'
  | 'COLLECTIONS_CREATE'
  | 'COLLECTIONS_DELETE'
  | 'COLLECTIONS_UPDATE'
  | 'CUSTOMER_GROUPS_CREATE'
  | 'CUSTOMER_GROUPS_DELETE'
  | 'CUSTOMER_GROUPS_UPDATE'
  | 'CUSTOMERS_CREATE'
  | 'CUSTOMERS_DELETE'
  | 'CUSTOMERS_DISABLE'
  | 'CUSTOMERS_ENABLE'
  | 'CUSTOMERS_UPDATE'
  | 'DRAFT_ORDERS_CREATE'
  | 'DRAFT_ORDERS_DELETE'
  | 'DRAFT_ORDERS_UPDATE'
  | 'FULFILLMENT_EVENTS_CREATE'
  | 'FULFILLMENT_EVENTS_DELETE'
  | 'FULFILLMENTS_CREATE'
  | 'FULFILLMENTS_UPDATE'
  | 'ORDER_TRANSACTIONS_CREATE'
  | 'ORDERS_CANCELLED'
  | 'ORDERS_CREATE'
  | 'ORDERS_DELETE'
  | 'ORDERS_FULFILLED'
  | 'ORDERS_PAID'
  | 'ORDERS_PARTIALLY_FULFILLED'
  | 'ORDERS_UPDATED'
  | 'PRODUCT_LISTINGS_ADD'
  | 'PRODUCT_LISTINGS_REMOVE'
  | 'PRODUCT_LISTINGS_UPDATE'
  | 'PRODUCTS_CREATE'
  | 'PRODUCTS_DELETE'
  | 'PRODUCTS_UPDATE'
  | 'REFUNDS_CREATE'
  | 'SHOP_UPDATE'
  | 'THEMES_CREATE'
  | 'THEMES_DELETE'
  | 'THEMES_PUBLISH'
  | 'THEMES_UPDATE'
  | 'INVENTORY_LEVELS_CONNECT'
  | 'INVENTORY_LEVELS_UPDATE'
  | 'INVENTORY_LEVELS_DISCONNECT'
  | 'INVENTORY_ITEMS_CREATE'
  | 'INVENTORY_ITEMS_UPDATE'
  | 'INVENTORY_ITEMS_DELETE'
  | 'LOCATIONS_CREATE'
  | 'LOCATIONS_UPDATE'
  | 'LOCATIONS_DELETE';

// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

function goAwayArray(header?: string | string[]) {
  if (Array.isArray(header)) {
    return undefined;
  }
  return header;
}

function validHeader(header?: string | string[]) {
  return header && !Array.isArray(header);
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  // Validate webhook
  // https://github.com/Shopify/quilt/blob/master/packages/koa-shopify-webhooks/src/receive.ts
  const hmac = goAwayArray(req?.headers[WebhookHeader.Hmac]);
  const topic = goAwayArray(req?.headers[WebhookHeader.Topic]);
  const domain = goAwayArray(req?.headers[WebhookHeader.Domain]);

  if (!validHeader(hmac) || !validHeader(topic) || !validHeader(domain)) {
    return res.status(403).send('Forbidden');
  }

  const rawBody = req.body;

  const generatedHash = createHmac('sha256', serverConfig.SHOPIFY_SHARED_SECRET)
    .update(rawBody, 'utf8')
    .digest('base64');

  if (!safeCompare(generatedHash, hmac)) {
    return res.status(403).send('Forbidden');
  }

  // JSON parse is safe, since HMAC is valid
  const body = JSON.parse(rawBody);

  console.log(body);

  res.status(200).send('ok');
};
