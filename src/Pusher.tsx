import React, { useState, ReactNode, useEffect, useCallback } from 'react';
import Pusher from 'pusher-js';
import { Button } from '@shopify/polaris';
import { sharedConfig } from './config';

function initializePusher() {
  if (sharedConfig.DEV) {
    Pusher.logToConsole = true;
  }

  return new Pusher(sharedConfig.PUSHER_API_KEY, {
    cluster: sharedConfig.PUSHER_CLUSTER,
    authEndpoint: '/api/pusher/auth',
    forceTLS: true,
    auth: {
      headers: {
        'Shopify-Domain': 'crane-demo.myshopify.com',
      },
    },
  });
}

const initializeChannel = (pusher: Pusher) => () => {
  return pusher.subscribe('private-crane-demo');
};

export interface PusherProviderProps {
  children: ReactNode;
}

function PusherProvider(props: PusherProviderProps) {
  const { children } = props;

  const [pusher] = useState(initializePusher);
  const [channel] = useState(initializeChannel(pusher));

  const handlePusherEvent = useCallback((event: string, data: any) => {
    console.log(event, data);
  }, []);

  useEffect(() => {
    channel.bind_global(handlePusherEvent);

    return () => {
      channel.unsubscribe();
      pusher.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Button
        onClick={() => {
          channel.trigger('client-hello', { world: '123' });
        }}
      >
        Trigger
      </Button>
      {children}
    </>
  );
}

export default PusherProvider;
