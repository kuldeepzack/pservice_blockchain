import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router } from "react-router-dom";

import NODEINFO from './Routes/nodeinfo';
import NODESIGN from './Routes/nodesign';
import NODE from './already/node';

const rootElement = document.getElementById("root");
import './style/app.css';


ReactDOM.render(
  <Router>
      <div className="App">
        <NODE />
        <NODEINFO />
        <NODESIGN />
      </div>
  </Router>,
   rootElement
);