import React, { ReactNode } from 'react';
import dynamic from 'next/dynamic';

export interface BrowserOnlyProps {
  children: ReactNode;
}

function BrowserOnlyInternal(props: BrowserOnlyProps) {
  const { children } = props;
  return <>{children}</>;
}

export default dynamic(() => Promise.resolve(BrowserOnlyInternal), {
  ssr: false,
});
