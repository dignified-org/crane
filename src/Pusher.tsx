import React, {
  useState,
  ReactNode,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from 'react';
import Pusher, { Channel } from 'pusher-js';
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

export const PusherContext = createContext<Channel>(null);

export function usePusherChannel() {
  const c = useContext(PusherContext);

  if (!c) {
    throw new Error('todo');
  }

  return c;
}

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
    <PusherContext.Provider value={channel}>{children}</PusherContext.Provider>
  );
}

export default PusherProvider;
