import React, { Component } from 'react'
import EventFactory from '../build/contracts/EventFactory.json'
import getWeb3 from './utils/getWeb3'

const DEFAULT_FORM_STATE = {
  eventName : "",
  eventLocation: "New York",
  eventTicketCount:10,
  eventFaceValue: 100,
  eventDate : new Date().getTime(),
}

class Create extends Component {
  constructor(props) {
    super(props)
    this.createEvent = this.createEvent.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleCountChange = this.handleCountChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);

    this.state = DEFAULT_FORM_STATE;
    this.state.storageValue = 0;
    this.state.web3= null;
    this.state.events = [];

  }


  createEvent() {
    console.log(this.state.eventName);
    var eventFactoryInstance = this.state.instance;
    eventFactoryInstance.createNewEvent(
        this.state.eventName,
        this.state.eventLocation, 
        this.state.eventDate,
        this.state.eventTicketCount,
        this.state.eventFaceValue,
        { from: this.state.account }
    ).then((result) => {
        console.log(result);
        var l = result.logs[0].args;
        var rows = this.state.events;

        rows.push({
            name : l._name,
            location: l._location,
            date: new Date(l._eventDate.c[0]).toISOString()        
        });
        this.setState({
            events: rows
        })
    });
  }

  handleDateChange(e) {
   
    var d = Date.parse(e.target.value);
    var e = new Date().getTime();
    console.log(d, e);
    if( d > e) {
        this.setState({
            eventDate: d
        });
    }
  }
  handleLocationChange(e) {
    this.setState({ eventLocation: e.target.value });
    console.log(this.state);
  }

  handleNameChange(e) {
    this.setState({ eventName: e.target.value });
  }

  handleCountChange(e) {
    this.setState({ eventTicketCount: parseInt(e.target.value) });
  }

  handleFaceChange(e) {
    this.setState({ eventFaceValue: parseInt(e.target.value) });
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantite contract once web3 provided.
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
    const eventFactory = contract(EventFactory)
    eventFactory.setProvider(this.state.web3.currentProvider)
    var eventFactoryInstance;


    this.state.web3.eth.getAccounts((error, accounts) => {
      eventFactory.deployed().then((instance) => {
        eventFactoryInstance = instance
        eventFactoryInstance.NewEventCreated().watch((err, response) => {
            console.log(response);
            console.log(err);
        });
        // Stores a given value, 5 by default.
        return eventFactoryInstance.getEventIds.call({from: accounts[0]});
      }).then((result) => {
        var promises = [];
        result.forEach((r)=>{
            var p = eventFactoryInstance.getEventForId(parseInt(r.c[0].toString()));
            promises.push(p);
        });

        return Promise.all(promises);

      }).then((results) => {
        // Update state with the result.
        console.log(results);

        return this.setState({ 
            account: accounts[0],
            instance: eventFactoryInstance,
            events: results.map((r) => { 
            return {
                name : r[0],
                location: r[1],                
                date: new Date(r[2].c[0]).toISOString(),
                ticketAddress : r[3]
            };
        }) })
      })
    })
  }

  render() {
    var rows = [];

    for (var i = 0; i < this.state.events.length; i++) {
        rows.push(
          <tr key={i}>
            <td>{i+1}</td>
            <td>{this.state.events[i].name}</td>
            <td>{this.state.events[i].location}</td>
            <td>{new Date(this.state.events[i].date).toISOString().substr(0,10)}</td>
            <td>
              <button className="pure-button pure-button-primary">Edit</button>
            </td>
          </tr>          
        );
    }    
    return (
      <create>
        
        <form className="pure-form pure-form-stacked" id="create_form">
            <fieldset>
              <legend>Create Event</legend>
              <div className="pure-g">
                <div className="pure-u-5-5">
                  <label data-for="event_name">Event Name</label>
                  <input id="event_name"              
                    onChange={this.handleNameChange}  className="pure-u-24-24" type="text"/>
                </div>
                <div className="pure-u-3-5">
                  <label data-for="event_location">Event Location</label>
                  <input id="event_location"  
                  defaultValue={this.state.eventLocation}
                  onChange={this.handleLocationChange} className="pure-u-23-24" type="text"/>
                </div>
                <div className="pure-u-2-5">
                  <label data-for="event_date">Date</label>
                  <input id="event_date"  onChange={this.handleDateChange} 
                    defaultValue={new Date(this.state.eventDate).toISOString().substr(0,10)}
                  className="pure-u-24-24" type="date"/>
                </div>
                
                <div className="pure-u-2-5">
                  <label data-for="event_num_tix">Tickets</label>
                  <input id="event_num_tix"  className="pure-u-23-24" 
                  defaultValue={this.state.eventTicketCount}
                  type="number"/>
                </div>


                <div className="pure-u-2-5">
                  <label data-for="event_face_value">Face Value</label>
                  <input id="event_face_value"  className="pure-u-23-24" 
                  defaultValue={this.state.eventFaceValue}
                  type="number"/>
                </div>

                <div className="pure-u-1-5">
                  <label data-for="submit">&nbsp;</label>
                  <button id="submit" type="button" className="pure-button pure-button-primary pure-u-23-24" onClick={this.createEvent}>Create</button>
                </div>
              </div>
            </fieldset>
          </form>

          <table className="pure-table stretch-table">
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Event</th>
                <th>Location</th>
                <th>Date</th>
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
