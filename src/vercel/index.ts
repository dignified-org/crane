import fetch from 'isomorphic-unfetch';
import jwt from 'jsonwebtoken';
import { sharedConfig } from '../config';
import { serverConfig } from '../config/server';

export const VERCEL_API = 'https://api.vercel.com';

export async function issueNonce(userId: string, shop: string) {
  const body = {
    userId,
    shop,
  };
  return await jwt.sign(body, serverConfig.VERCEL_SHARED_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1m',
  });
}

export async function validateNonce(state: string) {
  try {
    return (await jwt.verify(state, serverConfig.VERCEL_SHARED_SECRET, {
      algorithms: ['HS256'],
    })) as { userId: string; shop: string };
  } catch (e) {
    return null;
  }
}

export async function generateAuthRedirect(userId: string, shop: string) {
  const nonce = await issueNonce(userId, shop);
  return `https://vercel.com/oauth/authorize?client_id=${sharedConfig.VERCEL_API_KEY}&state=${nonce}`;
}

export interface VercelUser {
  id: string;
  email: string;
  name: string;
  username: string;
  date: string;
  avatar: string;
}

export async function findUser(token: string) {
  const response = await fetch(`${VERCEL_API}/www/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  const { user } = await response.json();

  return {
    ...user,
    id: user.uid,
    avatar: `https://zeit.co/api/www/avatar/${user.avatar}?s=60`,
  } as VercelUser;
}

export async function createProject(token: string, name: string) {
  const response = await fetch(`${VERCEL_API}/v1/projects`, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  const project = await response.json();

  return project as VercelProject;
}

export interface VercelSecret {
  uid: string;
  name: string;
  userId: string;
}

export async function createSecret(token: string, name: string, value: string) {
  const response = await fetch(`${VERCEL_API}/v3/now/secrets`, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      value,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  const secret = await response.json();

  return secret as VercelSecret;
}

export interface VercelEnv {
  key: string;
  value: string;
}

export async function createEnv(
  token: string,
  projectId: string,
  key: string,
  secretId: string,
) {
  const response = await fetch(`${VERCEL_API}/v4/projects/${projectId}/env`, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      value: secretId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  const env = await response.json();

  return env as VercelSecret;
}

export async function deployFromRepo(token: string, projectName: string) {
  const body = {
    name: projectName,
    target: 'production',
    source: {
      type: 'github',
      projectId: 'dignified-org%2fgatsby-starter-crane',
      fullName: 'dignified-org/gatsby-starter-crane',
      ref: 'master',
      subdir: '',
    },
    projectSettings: {
      framework: 'gatsby',
      devCommand: null,
      buildCommand:
        'GATSBY_EXPERIMENTAL_PAGE_BUILD_ON_DATA_CHANGES=true yarn build',
      outputDirectory: null,
    },
  };

  const response = await fetch('https://now-git-deployer.zeit.sh', {
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  const env = await response.json();

  return env as { url: string };
}

export async function githubVerify(token: string) {
  const response = await fetch(
    `https://api.vercel.com/v1/integrations/github/verify`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  const r = await response.json();

  return r as {
    id: string;
    login: string;
  };
}

export async function createRepo(
  token: string,
  projectName: string,
  githubInstallationId: string,
) {
  const body = {
    name: projectName,
    installationId: githubInstallationId,
    private: true,
  };

  const response = await fetch(
    'https://api.vercel.com/v1/integrations/github-create-repo',
    {
      method: 'post',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  const r = await response.json();

  return r as any;
}

export async function pushStarterToRepo(
  token: string,
  projectName: string,
  githubUser: string,
) {
  const body = {
    name: 'gatsby',
    template: 'dignified-org/gatsby-starter-crane',
    target: `${githubUser}/${projectName}`,
  };

  const response = await fetch(
    'https://api.vercel.com/v1/integrations/github-push-repo',
    {
      method: 'post',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  const r = await response.json();

  return r as any;
}

export async function linkProjectToRepo(
  token: string,
  projectId: string,
  githubRepo: string,
) {
  const body = {
    type: 'github',
    repo: githubRepo,
  };

  const response = await fetch(
    `https://api.vercel.com/v4/projects/${projectId}/link`,
    {
      method: 'post',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  const r = await response.json();

  return r as any;
}

export interface VercelDeployment {
  id: string;
  readyState: string;
  createdAt: number;
  target: 'production' | string;
  url: string;
}

export interface VercelProject {
  accountId: string;
  alias: { domain: string; target: 'PRODUCTION' | string }[];
  createdAt: number;
  id: string;
  name: string;
  link: { deployHooks: { url: string }[] };
  latestDeployments: VercelDeployment[];
  targets: {
    production: {
      readyState: 'READY' | string;
    };
  };
}

export async function getProject(token: string, projectId: string) {
  const projectResponse = await fetch(
    `https://api.vercel.com/v2/projects/${projectId}?latestDeployments=3`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );

  if (!projectResponse.ok) {
    throw new Error('Failed to fetch');
  }

  const r = await projectResponse.json(); // Empty response

  return r as VercelProject;
}

export async function createDeployHook(token: string, projectId: string) {
  const body = {
    ref: 'master',
    name: 'Crane',
  };

  const response = await fetch(
    `https://api.vercel.com/v2/projects/${projectId}/deploy-hooks`,
    {
      method: 'post',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch');
  }

  await response.json(); // Empty response

  const { link } = await getProject(token, projectId); // Empty response

  return link.deployHooks[0].url as string;
}
