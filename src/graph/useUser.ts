import gql from 'graphql-tag';
import { useQuery } from '@apollo/client';

import { MeQuery, MeQueryVariables } from './generated';

const ME_QUERY = gql`
  query Me {
    me {
      firstName
      lastName
      email
    }
  }
`;

export function useMe() {
  const { data } = useQuery<MeQuery, MeQueryVariables>(ME_QUERY);

  return data?.me;
}
