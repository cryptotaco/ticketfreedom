import React, { Component } from 'react'

import EventFactory from '../build/contracts/EventFactory.json'
import TicketFactory from '../build/contracts/TicketFactory.json'
import getWeb3 from './utils/getWeb3'
var web3 = require('web3')

class Tickets extends Component {
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
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  buyTicket(e,eventId, price) {
    var ticketInstance;
    this.eventFactoryInstance.getEventForId(eventId).then((ev) => {
      var ticketAddress = ev[3];
      this.state.ticketFactoryContract.at(ticketAddress).then((instance) => {
        ticketInstance = instance;
        return ticketInstance.lowestAskingPrice({})
      }).then((results)=>{
        // results[0] - bool, results[2] - uint16 price, results[3] - uint256 id
        // buy ticket- ticket id,  msg value set
        var price = results[1];
        var ticketId = results[2];
        ticketInstance.buyTicket(ticketId, { from: this.state.account, value:  web3.utils.toWei( price, 'ether')})
      });
    });
  }

  // sellTicket(e,eventId, sellprice) {
  //   this.eventFactoryInstance.getEventForId(eventId).then((ev) => {
  //     var ticketAddress = ev[3];
  //     this.state.ticketFactoryContract.at(ticketAddress).then((instance) => {
  //       ticketInstance = instance;
  //       return ticketInstance.lowestAskingPrice({})
  //     }).then((results)=>{
  //       // results[0] - bool, results[2] - uint16 price, results[3] - uint256 id
  //       // buy ticket- ticket id,  msg value set
  //       var price = results[1];
  //       var ticketId = results[2];
  //       ticketInstance.buyTicket(ticketId, { from: this.state.account, value:  web3.utils.toWei( price, 'ether')})
  //     });
  //   });
  // }

  instantiateContract() {
    const contract = require('truffle-contract')
    var eventFactory = contract(EventFactory)
    var ticketFactory = contract(TicketFactory);
    eventFactory.setProvider(this.state.web3.currentProvider);
    ticketFactory.setProvider(this.state.web3.currentProvider);
    var eventFactoryInstance;

    var eventsWithTickets = [];
    var eventsIHaveTicketsTo = [];
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      var eventIdsToEvents = {}
      eventFactory.deployed().then((instance) => {
        eventFactoryInstance = instance

        // Stores a given value, 5 by default.
         return eventFactoryInstance.getEventsWithAvailableTickets.call({from: this.state.account});
      }).then((result) => {
        // result = [ uint[] ids, uint16[] price ] 
        var promises = [];
        for(var i = 0; i < result[0].length; ++i )
        {
          eventIdsToEvents[result[0][i]] = { "event" : {}, "lowestPrice" : result[1][i]};
          promises.push(eventFactoryInstance.getEventForId(result[0][i]));
        }
        return Promise.all(promises);
      }).then((events) => {
        // Update state with the result.
        var eventsWithTickets = [];
        events.forEach((r) => {
          var id = r[4];
          if(eventIdsToEvents[id]) {
            eventsWithTickets.push({
              id: id,
              eventName: r[0],
              eventLocation: r[1],
              eventDate: new Date(r[2].c[0]).toISOString(),
              ticketAddress: r[3],
              lowestPrice: eventIdsToEvents[id].lowestPrice
            });
          }
        });
      }).then(()=> {
        // Get all events for which i currently have tickets 
        return eventFactoryInstance.getMyEvents.call({from: accounts[0]});
      }).then((eventsWithTixIds) => {
        var promises = eventsWithTixIds.map((id) => {
          return eventFactoryInstance.getEventForId(id, { from: accounts[0]});
        });
        return Promise.all(promises);
      }).then((events) => {

        events.forEach((r) => {
          var id = r[4];
          eventsIHaveTicketsTo.append({
                id: id,
                eventName: r[0],
                eventLocation: r[1],
                eventDate: new Date(r[2].c[0]).toISOString(),
                ticketAddress: r[3],
          });
        });
         

      }).then(() => {
        return this.setState({ 
          ticketFactoryContract: ticketFactory, 
          eventFactoryInstance: eventFactoryInstance,
          account: accounts[0],
          availableTickets: eventsWithTickets,
          ownedTickets: eventsIHaveTicketsTo
        });
      });

      });
    
  }

  makeCallback(action,eventId){
    var that=this;
    return ()=>{
      that.handleAction(action,eventId);
    }
  }
  handleAction(action, eventId){
    console.log(action, eventId);
  }

  renderTickets(tickets, action){
    var rows=[];
    for (var i = 0; i < tickets.length; i++) {
      rows.push(
        <tr key={i}>            
          <td>{tickets[i].eventName}</td>
          <td>{tickets[i].eventLocation}</td>
          <td>{new Date(tickets[i].eventDate).toISOString().substr(0,10)}</td>
          <td>
            <button className="pure-button pure-button-primary"
            onClick = {this.makeCallback(action,tickets[i].id)}
            >{action}</button>
          </td>
        </tr>          
      );
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

export default Tickets
