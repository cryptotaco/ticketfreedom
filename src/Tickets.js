import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'


class Create extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      availableTickets:this.makeFake(),
      ownedTickets: this.makeFake()
    }
  }

  makeFake(){
    var tickets=[];
    for(var i=0;i<5;i++){
      tickets.push({
        eventName : "event "+i,
        eventLocation: "New York",
        eventTicketCount:10,
        eventFaceValue: 100,
        eventDate : new Date().getTime(),
        id:i, 
      });
    }
    return tickets;
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
      // this.instantiateContract()
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
/*
    const contract = require('truffle-contract')
    //const simpleStorage = contract(SimpleStorageContract)
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
    */
  }

  makeCallback(action,ticket){
    var that=this;
    return ()=>{
      that.handleAction(action,ticket);
    }
  }
  handleAction(action, ticket){
    console.log(action, JSON.stringify(ticket));
  }

  makeRow(action, ticket){
    var that = this;
    return (
      <tr key={ticket.id}>            
        <td>{ticket.eventName}</td>
        <td>{ticket.eventLocation}</td>
        <td>{new Date(ticket.eventDate).toISOString().substr(0,10)}</td>
        <td>
        {action === 'Sell' &&
          <input onChange={(e)=>{
            ticket.updatedValue=parseInt(e.target.value,10);
          }} defaultValue= {ticket.eventFaceValue} type="number"/>
        }
        {action === 'Buy' && <span>{ticket.eventFaceValue}</span>}
        </td>
        <td>
          <button className="pure-button pure-button-primary"
          onClick = { ()=>{ that.handleAction(action,ticket) } }
          >{action}</button>
        </td>
      </tr>          
    );
  }

  renderTickets(tickets, action){
    var rows=[];
    for (var i = 0; i < tickets.length; i++) {
      rows.push(this.makeRow(action,tickets[i]));
    }
    return rows;  
  }


  render() {
    var availableRows = this.renderTickets(this.state.availableTickets,'Buy');
    var ownedRows = this.renderTickets(this.state.ownedTickets,'Sell');
  
    return (
      <create>
        <h3>My Tickets</h3>
        <table className="pure-table stretch-table">
          <thead>
            <tr>                          
            <th>Event</th>
            <th>Location</th>
            <th>Date</th>
            <th>Price</th>
            <th>&nbsp;</th>
        </tr>
          </thead>              
          <tbody>
          {ownedRows}
          </tbody>
        </table>
        <p>&nbsp;</p>
        <h3>Available Tickets</h3>
        <table className="pure-table stretch-table">
          <thead>
            <tr>                          
            <th>Event</th>
            <th>Location</th>
            <th>Date</th>
            <th>Price</th>
            <th>&nbsp;</th>
        </tr>
          </thead>              
          <tbody>
          {availableRows}
          </tbody>
        </table>           

      </create>
    );
  } 
}

export default Create
