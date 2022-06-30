import React from 'react'
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom'
import PageHome from './pages/PageHome'
import PageOptionCalc from './pages/PageOptionCalc/PageOptionCalc'

const Routes: React.FC = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={PageHome} />
      <Route path="/option_calc" exact component={PageOptionCalc} />
    </Switch>
  </Router>
)

export default Routes
