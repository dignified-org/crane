import gql from 'graphql-tag';

const WEBHOOKS_QUERY = gql`
  query Webhooks {
    webhookSubscriptions(first: 100) {
      edges {
        cursor
        node {
          id
          topic
          callbackUrl
          metafieldNamespaces
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
