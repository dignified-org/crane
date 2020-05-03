import dynamic from 'next/dynamic';
import React from 'react';
import Preview from '../Preview';

const PusherProvider = dynamic(import('../Pusher'), {
  ssr: false,
});

function PreviewRouter() {
  return (
    <PusherProvider>
      <Preview />
    </PusherProvider>
  );
}

export default PreviewRouter;
