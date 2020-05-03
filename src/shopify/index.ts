export const REQUIRED_SCOPES = ['write_products'];

export function haveRequiredScopes(
  have: string[],
  need: string[] = REQUIRED_SCOPES,
) {
  return need.every(scope => have.includes(scope));
}

export * from './utils';
