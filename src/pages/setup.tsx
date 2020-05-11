import React, { useCallback, useState, useEffect } from 'react';
import DefaultError from 'next/error';
import {
  Page,
  Layout,
  Card,
  SkeletonPage,
  SkeletonBodyText,
  PageActions,
  AccountConnection,
  Link,
  FormLayout,
  List,
  TextStyle,
} from '@shopify/polaris';
import { Modal, Loading } from '@shopify/app-bridge-react';
import { useRouter } from 'next/dist/client/router';
import { useToggle } from '@shopify/react-hooks';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import {
  Redirect,
  Toast,
  ContextualSaveBar,
} from '@shopify/app-bridge/actions';
import { formatDistanceToNow } from 'date-fns';
import { useFormik, FormikProvider } from 'formik';
import { TextField } from '@satel/formik-polaris';
import { object, string } from 'yup';
import { useAppBridge } from './_app';
import { useMe } from '../graph/useUser';
import { shop } from '../config';

function SetupRoute() {
  return <DefaultError statusCode={404} />;
}

const USER_LINK_VERCEL_MUTATION = gql`
  mutation UserLinkVercel {
    userLinkVercel
  }
`;

const VERCEL_DEPLOY_STARTER = gql`
  mutation DeployStarter($name: String!) {
    vercelDeployStarter(name: $name)
  }
`;

function AppSetup() {
  const me = useMe();

  const router = useRouter();

  const {
    value: skipModalOpen,
    setTrue: handleOpenSkipModal,
    setFalse: handleCloseSkipModal,
  } = useToggle(false);

  const {
    value: confirmModalOpen,
    setTrue: handleOpenConfirmModal,
    setFalse: setConfirmClosed,
  } = useToggle(false);

  const handleExitSetup = useCallback(() => {
    alert('This is not yet supported. Please compete the setup');
  }, []);

  const app = useAppBridge();

  const [mutate, { loading }] = useMutation(USER_LINK_VERCEL_MUTATION);
  const handleLinkVercel = useCallback(() => {
    mutate()
      .then(response => {
        const redirectUrl = response.data?.userLinkVercel;
        Redirect.create(app).dispatch(Redirect.Action.REMOTE, {
          url: redirectUrl,
          // newContext: true,
        });
      })
      .catch(e => {
        // eslint-disable-next-line no-console
        console.warn(e);
        if (window !== window.top) {
          const toast = Toast.create(app, {
            message: 'Failed to link Vercel',
            isError: true,
            duration: 2000,
          });
          toast.dispatch(Toast.Action.SHOW);
        }
      });
  }, [app, mutate]);

  const [deployStarter, { loading: deploying }] = useMutation(
    VERCEL_DEPLOY_STARTER,
  );

  const handleCloseConfirmModal = useCallback(() => {
    if (!deploying) {
      setConfirmClosed();
    }
  }, [deploying, setConfirmClosed]);

  const handleDeployStarter = useCallback(
    (variables, helpers) => {
      setConfirmClosed();
      deployStarter({
        variables,
      })
        .then(() => {
          const toast = Toast.create(app, {
            message: 'Website deployed',
            duration: 2000,
          });
          toast.dispatch(Toast.Action.SHOW);
          return router.replace('/');
        })
        .catch(e => {
          // eslint-disable-next-line no-console
          console.warn(e);
          const toast = Toast.create(app, {
            message: 'Deployment failed',
            isError: true,
            duration: 2000,
          });
          toast.dispatch(Toast.Action.SHOW);
          helpers.setSubmitting(false);
        });
    },
    [app, deployStarter, router, setConfirmClosed],
  );

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: object({
      name: string()
        .label('Name')
        .min(4)
        .trim()
        .required(),
    }),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: handleDeployStarter,
  });

  const [saveBar] = useState(() => {
    const bar = ContextualSaveBar.create(app, {
      saveAction: {
        disabled: true,
        loading: false,
      },
      discardAction: {
        disabled: true,
        loading: false,
        discardConfirmationModal: true,
      },
    });
    bar.dispatch(ContextualSaveBar.Action.HIDE);
    return bar;
  });

  useEffect(() => {
    if ((formik.dirty && me?.vercel) || deploying) {
      saveBar.set({
        saveAction: {
          disabled: false,
          loading: deploying,
        },
        discardAction: {
          disabled: deploying,
        },
      });
    } else {
      saveBar.dispatch(ContextualSaveBar.Action.HIDE);
    }
  }, [deploying, formik.dirty, me, saveBar]);

  useEffect(() => {
    return saveBar.subscribe(ContextualSaveBar.Action.SAVE, () => {
      handleOpenConfirmModal();
    });
  }, [formik, formik.dirty, handleOpenConfirmModal, saveBar]);

  useEffect(() => {
    return saveBar.subscribe(ContextualSaveBar.Action.DISCARD, () => {
      formik.resetForm();
    });
  }, [formik, formik.dirty, saveBar]);

  useEffect(
    () => () => {
      saveBar.dispatch(ContextualSaveBar.Action.HIDE);
    },
    [saveBar],
  );

  if (!me) {
    return (
      <SkeletonPage title="Crane setup">
        <SkeletonBodyText lines={4} />
      </SkeletonPage>
    );
  }

  return (
    <FormikProvider value={formik}>
      {deploying && <Loading />}
      <Page title="Crane setup">
        <Layout>
          <Layout.Section>
            <Card title={`Welcome to Crane, ${me.firstName}!`} sectioned>
              <p>
                We need a couple of things from you to get your website
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                deployed. Don't worry, all our hosting platforms have a free
                forever plan.
              </p>
            </Card>
          </Layout.Section>
          <Layout.AnnotatedSection
            title="Step 1"
            description="Vercel are the ones who host your website. Crane needs access so it can automatically trigger new builds and perform other actions on your behalf"
          >
            <AccountConnection
              avatarUrl={me?.vercel?.avatar}
              title="Vercel (previously Zeit)"
              accountName="Vercel (previously Zeit)"
              connected={!!me?.vercel?.id}
              action={{
                content: me?.vercel
                  ? 'Reconnect Vercel account'
                  : 'Connect Vercel account',
                onAction: handleLinkVercel,
                disabled: deploying,
                ...({ loading } as any),
              }}
              details={
                me?.vercel ? (
                  <p>
                    Connected as {me.vercel.name}{' '}
                    <span
                      title={new Date(
                        Number.parseInt(me.vercel.updatedAt, 10),
                      ).toLocaleString()}
                    >
                      {formatDistanceToNow(
                        Number.parseInt(me.vercel.updatedAt, 10),
                      )}
                    </span>{' '}
                    ago
                  </p>
                ) : (
                  <>
                    <p>
                      Vercel is a platform that makes deploying websites easy,
                      universal, and accessible.
                    </p>
                    <p>
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <Link url="https://vercel.com/about" external>
                        Visit the Vercel website to learn more
                      </Link>{' '}
                    </p>
                  </>
                )
              }
            />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title="Step 2"
            description="Give your project a name"
          >
            <Card sectioned>
              <FormLayout>
                <TextField
                  name="name"
                  label="Name of Vercel deployment"
                  disabled={formik.isSubmitting || !me?.vercel || deploying}
                  placeholder={`${shop().replace('.myshopify.com', '')}`}
                  helpText={!me?.vercel && 'Please complete step 1'}
                />
              </FormLayout>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title="Summary"
            description={
              <>
                <p>
                  Here are all of the steps Crane is about to take on your
                  behalf.
                </p>
                <br />
                <p>
                  If you are not comfortable with that, you can exit setup and
                  configure Crane manually
                </p>
              </>
            }
          >
            <Card sectioned title="Setup will">
              <List type="number">
                <List.Item>
                  <TextStyle variation="strong">
                    Create a private repository called{' '}
                    {formik.values.name || shop().replace('.myshopify.com', '')}{' '}
                    on your Github account
                  </TextStyle>
                </List.Item>
                <List.Item>
                  <TextStyle variation="strong">
                    Populate the repo with our{' '}
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <Link
                      url="https://github.com/dignified-org/gatsby-starter-crane"
                      external
                    >
                      Shopify starter
                    </Link>
                  </TextStyle>
                </List.Item>
                <List.Item>
                  <TextStyle variation="strong">
                    Create a Vercel project called{' '}
                    {formik.values.name || shop().replace('.myshopify.com', '')}{' '}
                    and link it the repo
                  </TextStyle>
                </List.Item>
                <List.Item>
                  <TextStyle variation="strong">
                    Create the first deployment. Please note the first
                    deployment may take longer, depending on the number of
                    product you have.
                  </TextStyle>
                </List.Item>
              </List>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.Section>
            <PageActions
              primaryAction={{
                content: 'Deploy website',
                onAction: handleOpenConfirmModal,
                disabled: !formik.dirty || !me?.vercel,
                loading: deploying,
              }}
              secondaryActions={[
                {
                  content: 'Exit setup',
                  onAction: handleOpenSkipModal,
                  disabled: deploying,
                },
              ]}
            />
          </Layout.Section>
        </Layout>
        <Modal
          open={skipModalOpen}
          title="Are you sure you want to exit setup?"
          message="This is not yet supported unfortunately"
          onClose={handleCloseSkipModal}
          primaryAction={{ content: 'Exit setup', onAction: handleExitSetup }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: handleCloseSkipModal,
              destructive: true,
            },
          ]}
        />
        <Modal
          open={confirmModalOpen}
          title="Are you sure you are ready to deploy?"
          message="Make sure you have reviewed everything in the summary!"
          onClose={handleCloseConfirmModal}
          primaryAction={{
            content: 'Deploy',
            onAction: () => {
              formik.submitForm();
            },
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: handleCloseConfirmModal,
            },
          ]}
        />
      </Page>
    </FormikProvider>
  );
}

SetupRoute.App = AppSetup;

export default SetupRoute;
