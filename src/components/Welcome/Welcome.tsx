import React, { useCallback } from 'react';
import {
  SkeletonPage,
  Page,
  Layout,
  DisplayText,
  PageActions,
  Card,
  ChoiceList,
  ChoiceListProps,
} from '@shopify/polaris';
import { useToggle } from '@shopify/react-hooks';
import { Modal } from '@shopify/app-bridge-react';
import { useRouter } from 'next/dist/client/router';
import { useFormik } from 'formik';
import { useMe } from '../../graph/useUser';

const SETUP_MODE_CHOICES: ChoiceListProps['choices'] = [
  {
    label: 'Recommended deployment',
    value: 'recommend',
    helpText: `Let us select for you. This is a great option if you are just testing out Crane. Don't worry, you will have a chance to review and change all the settings later`,
  },
  {
    label: 'Customize deployment',
    value: 'custom',
    helpText: `Fill in this text later`,
  },
];

function Welcome() {
  const me = useMe();

  const router = useRouter();

  const {
    value: skipModalOpen,
    setTrue: handleOpenSkipModal,
    setFalse: handleCloseSkipModal,
  } = useToggle(false);

  const handleExitSetup = useCallback(() => {
    router.replace('/');
  }, [router]);

  const formik = useFormik({
    initialValues: {
      step: '0',
      mode: 'recommend',
      host: 'vercel',
      framework: 'gatsby',
    },
    onSubmit: console.log,
  });

  const handleNextStep = useCallback(() => {
    const url = new URL('/setup', window.location.origin);

    Object.entries(formik.values).forEach(([key, value]: [string, string]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    const nextUrl = `${url.pathname}${url.search}`;

    router.replace(nextUrl, nextUrl, {
      shallow: true,
    });
  }, [formik.values, router]);

  if (!me) {
    return <SkeletonPage />;
  }

  return (
    <Page title="Setup" titleHidden>
      <Layout>
        <Layout.Section>
          <DisplayText size="large">Welcome to Crane</DisplayText>
          <br />
          <DisplayText>Lets get your first deployment setup</DisplayText>
        </Layout.Section>
        <Layout.AnnotatedSection
          title="Setup mode"
          description={
            <>
              <p>
                In order to get started with your new website, we need to make a
                few decisions.
              </p>
              <br />
              <p>
                If you just want to get up and running quickly select
                Recommended setup and we will fast track you to the end.
              </p>
            </>
          }
        >
          <Card sectioned>
            <ChoiceList
              title="Setup mode"
              titleHidden
              choices={SETUP_MODE_CHOICES}
              selected={[formik.values.mode]}
              onChange={([mode]) => {
                formik.setFieldValue('mode', mode);
              }}
            />
          </Card>
        </Layout.AnnotatedSection>
        <Layout.Section>
          <PageActions
            primaryAction={{
              content: 'Next step',
              onAction: handleNextStep,
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
        message="todo"
        onClose={handleCloseSkipModal}
        primaryAction={{ content: 'Exit setup', onAction: handleExitSetup }}
        secondaryActions={[
          { content: 'Cancel', onAction: handleCloseSkipModal },
        ]}
      />
    </Page>
  );
}

export default Welcome;
