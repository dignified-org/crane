import React from 'react';
import NextLink from 'next/link';
import { LinkProps } from '@shopify/polaris';

// Dynamic links are formed like so for polaris to be happy
// /path/[id:123]/foo/[bar:baz]
// which becomes
// href="/path/[id]/foo/[bar]"
// as="/path/123/foo/baz"
const pattern = new RegExp('\\[(.+):(.+)]', 'g');
function extractDynamicRoutes(url: string): { href: string; as?: string } {
  let match = pattern.exec(url);

  if (!match) {
    return {
      href: url,
    };
  }

  let href = url;
  let asUrl = url;

  while (match !== null) {
    const [token, dynamic, literal] = match;
    href = href.replace(token, `[${dynamic}]`);
    asUrl = asUrl.replace(token, literal);
    match = pattern.exec(url);
  }

  return {
    href,
    as: asUrl,
  };
}

/**
 * Link component that converts from @shopify/polaris to next/link
 */
function Link(props: LinkProps) {
  const { url, external, children, ...rest } = props;

  const target = external ? '_blank' : undefined;
  const rel = external ? 'noopener noreferrer' : undefined;

  if (external) {
    return (
      <a {...rest} target={target} rel={rel} href={url}>
        {children}
      </a>
    );
  }

  const nextProps = extractDynamicRoutes(url || '');
  return (
    <NextLink {...nextProps}>
      <a {...rest} target={target} rel={rel}>
        {children}
      </a>
    </NextLink>
  );
}

export default Link;
