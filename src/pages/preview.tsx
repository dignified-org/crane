import dynamic from 'next/dynamic';
import React, { useRef, useState } from 'react';
import { Page, Frame } from '@shopify/polaris';
import { sharedConfig } from '../config';

const PusherProvider = dynamic(import('../Pusher'), {
  ssr: false,
});

function PreviewRouter() {
  return (
    <PusherProvider>
      <Frame>
        <Page title="Crane preview">TODO</Page>
      </Frame>
    </PusherProvider>
  );
}

export default PreviewRouter;
