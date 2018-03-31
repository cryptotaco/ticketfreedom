import React, { Component } from 'react'
import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'


class Create extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      tickets: [
        { title:'Making your first DApp with MetaMask & Truffle',},
        { title:'Making your first DApp with MetaMask & Truffle',},
        { title:'Making your first DApp with MetaMask & Truffle',},
        { title:'Making your first DApp with MetaMask & Truffle',},
      ]
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const simpleStorage = contract(SimpleStorageContract)
    simpleStorage.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var simpleStorageInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      simpleStorage.deployed().then((instance) => {
        simpleStorageInstance = instance

        // Stores a given value, 5 by default.
        return simpleStorageInstance.set(5, {from: accounts[0]})
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return simpleStorageInstance.get.call(accounts[0])
      }).then((result) => {
        // Update state with the result.
        return this.setState({ storageValue: result.c[0] })
      })
    })
  }

  render() {
    var rows = [];
    for (var i = 0; i < this.state.tickets.length; i++) {
        rows.push(
          <tr key={i}>            
            <td>{this.state.tickets[i].title}</td>
            <td>
              <button className="pure-button pure-button-primary">Buy</button>
            </td>
          </tr>          
        );
    }    
    return (
      <create>
        <table className="pure-table stretch-table">
          <thead>
            <tr>              
              <th>My Tickets</th>
              <th>&nbsp;</th>
            </tr>
          </thead>              
          <tbody>
          {rows}
          </tbody>
        </table>          
      </create>
    );
  } 
}

export default Create
