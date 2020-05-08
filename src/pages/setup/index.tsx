import React from 'react';
import DefaultError from 'next/error';
import Welcome from '../../components/Welcome';

function SetupRoute() {
  return <DefaultError statusCode={404} />;
}

SetupRoute.App = Welcome;

export default SetupRoute;
