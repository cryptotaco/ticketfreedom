import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import Create from './Create'
import Tickets from './Tickets'
import Header from './Header'
import { BrowserRouter } from 'react-router-dom'
import { Switch, Route } from 'react-router-dom'


const Main = () => (
  <main className="contents">
    <Switch>
      <Route exact path="/" component={Create} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/create" component={Create} />
    </Switch>
  </main>
)

const MainApp = () => (
  <div>
    <Header />
    <Main />
  </div>
)

ReactDOM.render((
  <BrowserRouter>
    <MainApp />
    
  </BrowserRouter>
), document.getElementById('root')
);
