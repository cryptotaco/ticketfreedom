import React, { Component } from 'react'

import './Header.css'

class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  componentWillMount() {
  }

  render() {
    return (
      <header>
        <div className="nav">
          <div className="nav-header">
            <div className="nav-title">
              Ticket Freedom
            </div>
          </div>
          <div className="nav-btn">
            <label className="nav-check">
              <span></span>
              <span></span>
              <span></span>
            </label>
          </div>
          <input type="checkbox" id="nav-check"/>
          <div className="nav-links">
            <a href="/" >Create</a>
            <a href="/tickets" >Buy</a>
          </div>
        </div>
      </header>      
    );
  }
}

export default Header
