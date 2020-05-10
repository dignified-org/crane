import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';

import {
  MeQuery,
  MeQueryVariables,
  SiteQuery,
  SiteQueryVariables,
} from './generated';

const ME_QUERY = gql`
  query Me {
    me {
      firstName
      lastName
      email
      vercel {
        id
        email
        name
        username
        avatar
        updatedAt
      }
    }
    site {
      id
      name
      url
      building
    }
  }
`;

export function useMe() {
  const { data } = useQuery<MeQuery, MeQueryVariables>(ME_QUERY);

  return data?.me;
}

const SITE_QUERY = gql`
  query Site {
    site {
      id
      name
      url
      building
      thumbnail
      deployments {
        id
        createdAt
        building
        error
        url
      }
    }
  }
`;

export function useSite() {
  const { data, loading } = useQuery<SiteQuery, SiteQueryVariables>(SITE_QUERY);

  return [data?.site, loading] as [typeof data.site, boolean];
}
