/* AUTO GENERATED FILE. DO NOT MODIFY */
/* eslint-disable */
export type Maybe<T> = T | null;


/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Forbidden = {
   __typename?: 'Forbidden';
  redirect: Scalars['String'];
};

export enum Location {
  Top = 'TOP',
  Admin = 'ADMIN'
}

export type Me = User | Forbidden;

export type Query = {
   __typename?: 'Query';
  me: Me;
};


export type QueryMeArgs = {
  pathname?: Maybe<Scalars['String']>;
  location?: Maybe<Location>;
};

export type User = {
   __typename?: 'User';
  email: Scalars['String'];
};

export type MeQueryVariables = {};


export type MeQuery = (
  { __typename?: 'Query' }
  & { me: { __typename?: 'User' } | (
    { __typename?: 'Forbidden' }
    & Pick<Forbidden, 'redirect'>
  ) }
);


      export interface IntrospectionResultData {
        __schema: {
          types: {
            kind: string;
            name: string;
            possibleTypes: {
              name: string;
            }[];
          }[];
        };
      }
      const result: IntrospectionResultData = {
  "__schema": {
    "types": [
      {
        "kind": "UNION",
        "name": "Me",
        "possibleTypes": [
          {
            "name": "User"
          },
          {
            "name": "Forbidden"
          }
        ]
      }
    ]
  }
};
      export default result;
    