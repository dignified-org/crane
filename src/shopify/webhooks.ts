import gql from 'graphql-tag';
import { ApolloClient } from '@apollo/client';
import { createClient } from './client';

const REQUIRED_TOPICS = [
  'APP_UNINSTALLED',
  'PRODUCTS_CREATE',
  'PRODUCTS_UPDATE',
  'PRODUCTS_DELETE',
];

const WEBHOOK_FRAGMENT = gql`
  fragment WebhookFragment on WebhookSubscription {
    id
    topic
    callbackUrl
    metafieldNamespaces
  }
`;

const WEBHOOKS_QUERY = gql`
  ${WEBHOOK_FRAGMENT}
  query Webhooks {
    webhookSubscriptions(first: 10) {
      edges {
        node {
          ...WebhookFragment
        }
      }
    }
  }
`;

async function loadWebhooks(client: ApolloClient<any>) {
  const result = await client.query({
    query: WEBHOOKS_QUERY,
  });
  return result.data.webhookSubscriptions.edges.map(edge => edge.node);
}

const WEBHOOK_CREATE_MUTATION = gql`
  ${WEBHOOK_FRAGMENT}
  mutation WebhookCreate(
    $topic: WebhookSubscriptionTopic!
    $input: WebhookSubscriptionInput!
  ) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $input) {
      webhookSubscription {
        ...WebhookFragment
      }
    }
  }
`;

async function webhookCreate(
  client: ApolloClient<any>,
  topic: string,
  callbackUrl: string,
) {
  const result = await client.mutate({
    mutation: WEBHOOK_CREATE_MUTATION,
    variables: {
      topic,
      input: {
        callbackUrl,
      },
    },
  });

  return result.data?.webhookSubscriptionCreate?.webhookSubscription;
}

const WEBHOOK_UPDATE_MUTATION = gql`
  ${WEBHOOK_FRAGMENT}
  mutation WebhookUpdate($id: ID!, $input: WebhookSubscriptionInput!) {
    webhookSubscriptionUpdate(id: $id, webhookSubscription: $input) {
      webhookSubscription {
        ...WebhookFragment
      }
    }
  }
`;

async function webhookUpdate(
  client: ApolloClient<any>,
  id: string,
  callbackUrl: string,
) {
  const result = await client.mutate({
    mutation: WEBHOOK_UPDATE_MUTATION,
    variables: {
      id,
      input: {
        callbackUrl,
      },
    },
  });

  return result.data?.webhookSubscriptionUpdate?.webhookSubscription;
}

export async function configureWebhooks(
  shop: string,
  token: string,
  callbackUrl: string,
) {
  // Get a client
  const client = createClient({
    shop,
    token,
  });

  let existingWebhooks: any[] = [];
  try {
    existingWebhooks = await loadWebhooks(client);
  } catch (e) {
    console.warn(e);
  }

  const topicsToCreate = REQUIRED_TOPICS.filter(topic => {
    return !existingWebhooks.find(w => w.topic === topic);
  });
  const webhooksToUpdate = existingWebhooks.filter(webhook => {
    if (webhook.callbackUrl !== callbackUrl) {
      return true;
    }

    return false;
  });

  try {
    const createdWebhooks = await Promise.all(
      topicsToCreate.map(topic => webhookCreate(client, topic, callbackUrl)),
    );
    const updatedWebhooks = await Promise.all(
      webhooksToUpdate.map(webhook =>
        webhookUpdate(client, webhook.id, callbackUrl),
      ),
    );
  } catch (e) {
    console.error(e);
  }
}
