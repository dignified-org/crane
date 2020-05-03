export const REQUIRED_SCOPES = [
  'write_products',
  'unauthenticated_read_product_listings',
  'unauthenticated_read_product_tags',
  'unauthenticated_write_checkouts',
  'unauthenticated_write_customers',
  'unauthenticated_read_customer_tags',
  'unauthenticated_read_content',
];

export function haveRequiredScopes(
  have: string[],
  need: string[] = REQUIRED_SCOPES,
) {
  return need.every(scope => have.includes(scope));
}

export * from './utils';
