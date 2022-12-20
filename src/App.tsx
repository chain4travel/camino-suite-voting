import React from 'react';
import { RouterProvider } from "react-router-dom";
import ReactDOM from 'react-dom';
import router from './routes'

const Root = () => (
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// local development
ReactDOM.render(<Root />, document.getElementById("app"));

// online 
// export default Root;