import React from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import login from './pages/login'


function App() {
  

  return (
    <Router>
      <Switch>
        <Route exact path='/' component={Home}/>
        <Route path='/login' component={login}/>

      </Switch>
    </Router>
  )
}

export default App
