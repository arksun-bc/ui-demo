import React from "react";
import { Route, BrowserRouter as Router, Switch, Link } from "react-router-dom";
import PageHome from "./pages/PageHome";
import PageOptionCalc from "./pages/PageOptionCalc";

const Routes: React.FC = () => (
  <Router>
    {/* <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/option_calc">Option Calc</Link>
        </li>
      </ul>
    </nav> */}

    <Switch>
      <Route path="/" exact component={PageHome} />
      <Route path="/option_calc" exact component={PageOptionCalc} />
    </Switch>
  </Router>
);

export default Routes;
