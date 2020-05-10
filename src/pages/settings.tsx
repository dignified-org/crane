import React, { useEffect, useState } from 'react';
import DefaultErrorPage from 'next/error';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  Link,
  PageActions,
} from '@shopify/polaris';
import { useFormik, FormikProvider } from 'formik';
import { TextField } from '@satel/formik-polaris';
import { TitleBar } from '@shopify/app-bridge-react';
import { ContextualSaveBar } from '@shopify/app-bridge/actions';
import { useAppBridge } from './_app';

function Settings() {
  return <DefaultErrorPage statusCode={404} />;
}

function AppSettings() {
  const formik = useFormik({
    initialValues: {
      productPreview: '/product/{product.handle}',
      collectionPreview: '/collection/{collection.handle}',
      pagePreview: '/page/{page.handle}',
      articlePreview: '/collection/{article.handle}',
    },
    onSubmit: console.log,
  });

  const app = useAppBridge();
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
    if (formik.dirty) {
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
  }, [formik.dirty, saveBar]);

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

  return (
    <FormikProvider value={formik}>
      <Page title="Settings">
        <TitleBar title="Settings" />
        <Layout>
          <Layout.AnnotatedSection
            title="Preview links"
            description={
              <>
                <p>
                  Where Crane will redirect you when a resource is previewed.
                  This should match how urls are built on your store.
                </p>
                <br />
                <p>
                  These fields support basic liquid syntax. Learn more in our{' '}
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <Link url="#" external>
                    preview links FAQ
                  </Link>
                </p>
              </>
            }
          >
            <Card sectioned>
              <FormLayout>
                <TextField
                  name="productPreview"
                  label="Product preview link"
                  placeholder="/product/{product.handle}"
                />
                <TextField
                  name="collectionPreview"
                  label="Collection preview link"
                  placeholder="/collection/{collection.handle}"
                />
                <TextField
                  name="pagePreview"
                  label="Page preview link"
                  placeholder="/page/{page.handle}"
                />
                <TextField
                  name="articlePreview"
                  label="Article preview link"
                  placeholder="/article/{article.handle}"
                />
              </FormLayout>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.Section>
            <PageActions
              primaryAction={{
                content: 'Save',
                onAction: () => {
                  alert(
                    'Settings are not yet implemented. Interface demonstration',
                  );
                  formik.resetForm();
                },
                disabled: !formik.dirty,
              }}
            />
          </Layout.Section>
        </Layout>
      </Page>
    </FormikProvider>
  );
}

Settings.App = AppSettings;

export default Settings;
