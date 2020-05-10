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

export type Deployment = {
   __typename?: 'Deployment';
  id: Scalars['ID'];
  createdAt: Scalars['Int'];
  building: Scalars['Boolean'];
  error: Scalars['Boolean'];
  url: Scalars['String'];
};

export type Mutation = {
   __typename?: 'Mutation';
  /** Returns a redirect to authenticate with vercel */
  userLinkVercel: Scalars['String'];
  /** Deploy starter theme to vercel */
  vercelDeployStarter?: Maybe<Scalars['String']>;
  vercelDeploy?: Maybe<Scalars['String']>;
};


export type MutationVercelDeployStarterArgs = {
  name: Scalars['String'];
};

export type Query = {
   __typename?: 'Query';
  me: User;
  site?: Maybe<Site>;
};

export type Site = {
   __typename?: 'Site';
  id: Scalars['ID'];
  name: Scalars['String'];
  url: Scalars['String'];
  building: Scalars['Boolean'];
  thumbnail?: Maybe<Scalars['String']>;
  deployments: Array<Deployment>;
};

export type User = {
   __typename?: 'User';
  id: Scalars['ID'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  email: Scalars['String'];
  vercel?: Maybe<Vercel>;
};

export type Vercel = {
   __typename?: 'Vercel';
  id: Scalars['ID'];
  email: Scalars['String'];
  name: Scalars['String'];
  username: Scalars['String'];
  date: Scalars['String'];
  avatar: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type MeQueryVariables = {};


export type MeQuery = (
  { __typename?: 'Query' }
  & { me: (
    { __typename?: 'User' }
    & Pick<User, 'firstName' | 'lastName' | 'email'>
    & { vercel?: Maybe<(
      { __typename?: 'Vercel' }
      & Pick<Vercel, 'id' | 'email' | 'name' | 'username' | 'avatar' | 'updatedAt'>
    )> }
  ), site?: Maybe<(
    { __typename?: 'Site' }
    & Pick<Site, 'id' | 'name' | 'url' | 'building'>
  )> }
);

export type SiteQueryVariables = {};


export type SiteQuery = (
  { __typename?: 'Query' }
  & { site?: Maybe<(
    { __typename?: 'Site' }
    & Pick<Site, 'id' | 'name' | 'url' | 'building' | 'thumbnail'>
    & { deployments: Array<(
      { __typename?: 'Deployment' }
      & Pick<Deployment, 'id' | 'createdAt' | 'building' | 'error' | 'url'>
    )> }
  )> }
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
    "types": []
  }
};
      export default result;
    