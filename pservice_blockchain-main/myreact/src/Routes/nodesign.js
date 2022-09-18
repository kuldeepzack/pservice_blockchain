import React, { Component } from "react";
import {Router,Route,Switch } from "react-router-dom";

import IN from "../sign/In.js";
import UP from "../sign/Up.js";
import history from '../history';



export default class NODESIGN extends Component{
  render(){
      return (
         <Router history={history}>
          <Switch>
           <Route exact path="/signUp" component={UP} />
           <Route path="/signIn" component={IN} />
          </Switch>
         </Router>
      )
  }
}