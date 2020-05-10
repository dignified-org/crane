import React from 'react';
import DefaultError from 'next/error';
import { Page } from '@shopify/polaris';
import { TitleBar } from '@shopify/app-bridge-react';

function Builds() {
  return <DefaultError statusCode={404} />;
}

function AppBuilds() {
  return (
    <Page title="Builds">
      <TitleBar title="Builds" />
    </Page>
  );
}

Builds.App = AppBuilds;

export default Builds;
