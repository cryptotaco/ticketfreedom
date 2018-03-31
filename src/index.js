import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Create from './Create'
import { BrowserRouter } from 'react-router-dom'
import { Switch, Route } from 'react-router-dom'

const Tickets = () => (
  <p> Tickets</p>
)

const Main = () => (
  <main>
    <Switch>
      <Route exact path="/" component={Create} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/create" component={Create} />
    </Switch>
  </main>
)

const MainApp = () => (
  <div>
    <Main />
  </div>
)

ReactDOM.render((
  <BrowserRouter>
    <MainApp />
    
  </BrowserRouter>
), document.getElementById('root')
);
