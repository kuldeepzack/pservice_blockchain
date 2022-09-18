import React, { Component } from "react";
import {Router,Route,Switch } from "react-router-dom";

import history from '../history';

import MINER from '../user/miner';
import FULLNODE from '../user/fullnode';
import PATIENT from '../user/patient';
import DOCTOR from '../user/doctor';

export default class NODEINFO extends Component{
  render(){
      return (
         <Router history={history}>
          <Switch>
           <Route exact path="/miner" component={MINER} />
           <Route path="/patient" component={PATIENT} />
           <Route path="/full_node" component={FULLNODE} />
           <Route path="/doctor" component={DOCTOR} />
          </Switch>
         </Router>
      )
  }
}