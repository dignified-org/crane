/* AUTO GENERATED FILE. DO NOT MODIFY */
/* eslint-disable */
import { GraphQLResolveInfo } from 'graphql';
import { Context } from './context';
export type Maybe<T> = T | null;
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };


/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Mutation = {
   __typename?: 'Mutation';
  /** Returns a redirect to authenticate with vercel */
  userLinkVercel: Scalars['String'];
  /** Deploy starter theme to vercel */
  vercelDeployStarter?: Maybe<Scalars['String']>;
};


export type MutationVercelDeployStarterArgs = {
  name: Scalars['String'];
};

export type Query = {
   __typename?: 'Query';
  me: User;
};

export type User = {
   __typename?: 'User';
  id: Scalars['String'];
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type isTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>,
  User: ResolverTypeWrapper<User>,
  String: ResolverTypeWrapper<Scalars['String']>,
  Vercel: ResolverTypeWrapper<Vercel>,
  ID: ResolverTypeWrapper<Scalars['ID']>,
  Mutation: ResolverTypeWrapper<{}>,
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>,
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {},
  User: User,
  String: Scalars['String'],
  Vercel: Vercel,
  ID: Scalars['ID'],
  Mutation: {},
  Boolean: Scalars['Boolean'],
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  userLinkVercel?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  vercelDeployStarter?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationVercelDeployStarterArgs, 'name'>>,
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>,
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  vercel?: Resolver<Maybe<ResolversTypes['Vercel']>, ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type VercelResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Vercel'] = ResolversParentTypes['Vercel']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>,
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  avatar?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>,
  __isTypeOf?: isTypeOfResolverFn<ParentType>,
};

export type Resolvers<ContextType = Context> = {
  Mutation?: MutationResolvers<ContextType>,
  Query?: QueryResolvers<ContextType>,
  User?: UserResolvers<ContextType>,
  Vercel?: VercelResolvers<ContextType>,
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
