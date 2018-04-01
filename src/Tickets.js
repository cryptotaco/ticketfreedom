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
        eventFactoryInstance.GetEventForId().watch((err, res) => {
          console.log("GET EVENT FOR ID");
          console.log(res);
          console.log(err);
        });
        // Stores a given value, 5 by default.
        console.log("here");
         return eventFactoryInstance.getEventsWithAvailableTickets.call({from: this.state.account});
      }).then((result) => {
        // result = [ uint[] ids, uint16[] price ] 
        console.log("hwew");
        var promises = [];
        console.log(result);
        for(var i = 0; i < result.length; ++i )
        { 
  
          var id = parseInt(result[i][0])+1;
          console.log("id");
          console.log(id);
          eventIdsToEvents[id] = { "event" : {}, "lowestPrice" : result[i][1]};
          promises.push(eventFactoryInstance.getEventForId(id));
        }
        return Promise.all(promises);
      }).then((events) => {
        // Update state with the result.
        var eventsWithTickets = [];
        console.log(events);

        events.forEach((r) => {
          var id = parseInt(r[4].c[0].toString());
          console.log(id);
          console.log(eventIdsToEvents);
          console.log(eventIdsToEvents[id]);
          if(eventIdsToEvents.hasOwnProperty(id)) {
            eventsWithTickets.push({
              id: id,
              eventName: r[0],
              eventLocation: r[1],
              eventDate: new Date(r[2].c[0]).toISOString(),
              ticketAddress: r[3],
              lowestPrice: eventIdsToEvents[id].lowestPrice
            });
          }
          console.log(eventsWithTickets);
          this.setState({
            availableTickets: eventsWithTickets
          })
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
        console.log(eventsWithTickets);
        return this.setState({ 
          ticketFactoryContract: ticketFactory, 
          eventFactoryInstance: eventFactoryInstance,
          account: accounts[0],
          ownedTickets: eventsIHaveTicketsTo
        });
      });

      });
    
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

export default Tickets
