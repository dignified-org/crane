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
} from '@shopify/polaris';
import { Modal } from '@shopify/app-bridge-react';
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
    setFalse: handleCloseConfirmModal,
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

  const formik = useFormik({
    initialValues: {
      name: `${shop().replace('.myshopify.com', '')}`,
    },
    onSubmit: console.log,
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
    if (formik.dirty && me?.vercel) {
      saveBar.set({
        saveAction: {
          disabled: false,
        },
        discardAction: {
          disabled: false,
        },
      });
    } else {
      saveBar.dispatch(ContextualSaveBar.Action.HIDE);
    }
  }, [formik.dirty, me, saveBar]);

  useEffect(() => {
    return saveBar.subscribe(ContextualSaveBar.Action.SAVE, () => {
      alert('Settings are not yet implemented. Interface demonstration');
      formik.resetForm();
    });
  }, [formik, formik.dirty, saveBar]);

  useEffect(() => {
    return saveBar.subscribe(ContextualSaveBar.Action.DISCARD, () => {
      formik.resetForm();
    });
  }, [formik, formik.dirty, saveBar]);

  if (!me) {
    return (
      <SkeletonPage title="Crane setup">
        <SkeletonBodyText lines={4} />
      </SkeletonPage>
    );
  }

  return (
    <FormikProvider value={formik}>
      <Page title="Crane setup">
        <Layout>
          <Layout.Section>
            <Card title={`Welcome to Crane, ${me.firstName}!`} sectioned>
              <p>todo</p>
            </Card>
          </Layout.Section>
          <Layout.AnnotatedSection title="Step 1">
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
                ...({ loading } as any),
              }}
              details={
                me?.vercel ? (
                  <p>
                    Connected to Vercel as {me.vercel.name}{' '}
                    {formatDistanceToNow(
                      Number.parseInt(me.vercel.updatedAt, 10),
                    )}{' '}
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
          <Layout.AnnotatedSection title="Step 2">
            <Card sectioned>
              <FormLayout>
                <TextField
                  name="name"
                  label="Name of Vercel deployment"
                  disabled={formik.isSubmitting || !me?.vercel}
                  helpText={!me?.vercel && 'Please complete step 1'}
                />
              </FormLayout>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Summary">
            <Card sectioned>todo</Card>
          </Layout.AnnotatedSection>
          <Layout.Section>
            <PageActions
              primaryAction={{
                content: 'Deploy website',
                onAction: handleOpenConfirmModal,
                disabled: !formik.dirty || !me?.vercel,
              }}
              secondaryActions={[
                {
                  content: 'Exit setup',
                  onAction: handleOpenSkipModal,
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
          title="Please confirm your selection"
          message={`
        # Test \n\n\\n\\\n\\\\n

        - 1
        1. Hello
        
        `}
          onClose={handleCloseConfirmModal}
          primaryAction={{
            content: 'Deploy',
            onAction: handleExitSetup,
          }}
          secondaryActions={[
            { content: 'Cancel', onAction: handleCloseConfirmModal },
          ]}
        />
      </Page>
    </FormikProvider>
  );
}

SetupRoute.App = AppSetup;

export default SetupRoute;
