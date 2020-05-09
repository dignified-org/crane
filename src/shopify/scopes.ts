export const REQUIRED_SCOPES = [
  'read_products',
  'read_product_listings',
  'write_resource_feedbacks',
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
