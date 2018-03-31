var EventFactory = artifacts.require("EventFactory");

contract('EventFactory', function(accounts) {

// (string _name, string _location, uint _eventDate, 
//               uint _numTickets, uint _faceValue)
  it("...should create an event.", function() {
    return EventFactory.deployed().then(function(instance) {
      eventFactoryInstance = instance;
      return eventFactoryInstance.createNewEvent.call("Jon's Event", "Galvanize", 12345678, 50, 25, {from: accounts[0]});
    }).then(function(eventId) {
      console.log("created event");
      console.log("event id: ");
      console.log(eventId.toString());
      assert.equal(eventId, 1, "Failed to create event");
    });
  });

  it("...should create an event and get events for the account.", function() {
    return EventFactory.deployed().then(function(instance) {
      eventFactoryInstance = instance;
      return eventFactoryInstance.createNewEvent.call("Jon's Event 2", "Galvanize", 12345678, 50, 25, {from: accounts[0]});
    }).then(function(eventId) {
      console.log("created event");
      console.log("event id: ");
      console.log(eventId.toString());
      assert.equal(eventId, 1, "Failed to create event");
      return eventFactoryInstance.getEventIds.call({from: accounts[0]});
   }).then(function(eventIds) {
      console.log(eventIds);
      assert.equal(1,2, "FOO");
    });
  });

});

