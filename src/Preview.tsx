import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from 'react';
import {
  Frame,
  TopBar,
  Layout,
  FormLayout,
  Card,
  Heading,
  Loading,
} from '@shopify/polaris';
import { useFormik, Form, FormikProvider } from 'formik';
import { TextField, Checkbox } from '@satel/formik-polaris';
import { useDebounce } from 'use-debounce';

import s from './preview.module.css';
import { usePusherChannel } from './Pusher';

function Preview() {
  const topBarMarkup = useMemo(() => {
    return <TopBar />;
  }, []);

  const formik = useFormik({
    initialValues: {},
    onSubmit: console.log,
  });

  const channel = usePusherChannel();
  const [debouncedTitle] = useDebounce(formik.values.title, 500);

  useEffect(() => {
    if (debouncedTitle) {
      channel.trigger('client-product-update', {
        id:
          'Shopify__Product__Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0LzQ1OTk0NjU5Njc3MjU=',
        title: debouncedTitle,
      });
    }
  }, [channel, debouncedTitle]);

  // const [debouncedValues] = useDebounce(formik.values, 500);

  // useEffect(() => {
  //   console.log(debouncedValues);
  // }, [channel, debouncedTitle, debouncedValues]);

  const iframeRef = useRef();
  const [iframeLoading, setIframeLoading] = useState(true);

  const handleIframeLoad = useCallback((event?: any) => {
    console.log('hi!', event);
    setIframeLoading(false);
  }, []);

  return (
    <FormikProvider value={formik}>
      <div className={s.override}>
        <Frame topBar={topBarMarkup}>
          <div className={s.wrapper}>
            <div className={s.form}>
              <Form>
                <Heading>Pants</Heading>
                <br />
                <Layout>
                  <Layout.Section>
                    <Card sectioned>
                      <FormLayout>
                        <TextField
                          name="title"
                          label="Title"
                          placeholder="Short sleeve t-shirt"
                        />
                        <TextField
                          name="description"
                          label="Description"
                          multiline={5}
                        />
                      </FormLayout>
                    </Card>
                    <Card title="Pricing" sectioned>
                      <FormLayout>
                        <FormLayout.Group condensed>
                          <TextField
                            name="price"
                            label="Price"
                            placeholder="0.00"
                            prefix="CA$"
                          />
                          <TextField
                            name="compareAtPrice"
                            label="Compare at price"
                            placeholder="0.00"
                            prefix="CA$"
                          />
                          <Checkbox
                            name="taxable"
                            label="Charge tax on this product"
                          />
                        </FormLayout.Group>
                      </FormLayout>
                    </Card>
                    <Card title="Search engine listing preview" sectioned>
                      <FormLayout>
                        <TextField
                          name="pageTitle"
                          label="Page title"
                          maxLength={70}
                          showCharacterCount
                        />
                        <TextField
                          name="pageDescription"
                          label="Description"
                          multiline={3}
                          maxLength={70}
                          showCharacterCount
                        />
                        <TextField name="handle" label="Handle" />
                      </FormLayout>
                    </Card>
                  </Layout.Section>
                  <Layout.Section oneThird>
                    <Card title="Organization" subdued>
                      <Card.Section>
                        <FormLayout>
                          <TextField
                            name="productType"
                            label="Product type"
                            placeholder="e.g. Shirts"
                          />
                          <TextField
                            name="vendor"
                            label="Vendor"
                            placeholder="e.g. Nike"
                          />
                        </FormLayout>
                      </Card.Section>
                      <Card.Section>
                        <FormLayout>
                          <TextField
                            name="tags"
                            label="Tags"
                            placeholder="Vintage, cotton, summer"
                          />
                        </FormLayout>
                      </Card.Section>
                    </Card>
                  </Layout.Section>
                </Layout>
              </Form>
              <p>test</p>
            </div>
            <div className={s.preview}>
              {iframeLoading && <Loading />}
              <iframe
                title="preview"
                ref={iframeRef}
                src="https://crane-test-8148386536.gtsb.io/"
                width="100%"
                height="100%"
                frameBorder={0}
                onLoad={handleIframeLoad}
                onChange={console.log}
              />
            </div>
          </div>
        </Frame>
      </div>
    </FormikProvider>
  );
}

export default Preview;
