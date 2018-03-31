pragma solidity ^0.4.18;
// import "./Tickets.sol";

contract EventFactory {

	struct Event {
		address creator;
		address tickets_address;
		string name;
		string location;
		uint256 event_date;
		bool is_active;
	}

	mapping(address=>uint[]) creatorToEventIds;
	Event[] public events;


	event NewEventCreated(address creator, string name, uint eventDate, string location, uint numTickets, uint faceValue);
	event TicketPurchased(address buyer, uint ticketid, string name, uint eventid);
	event CreatorIds(uint[] ids, address creator, uint totalEvents);
	function EventFactory() public {
	}

	function createNewEvent(string _name, string _location, uint _eventDate, 
							uint _numTickets, uint _faceValue) public returns (uint) {
		// address ticketsAddress = new Tickets(_numTickets, _faceValue);
		uint eventId = events.push(Event(msg.sender, 0, _name, _location, _eventDate, true));
		creatorToEventIds[msg.sender].push(eventId);
		
		NewEventCreated(msg.sender, _name, _eventDate, _location, _numTickets, _faceValue);
		CreatorIds(creatorToEventIds[msg.sender], msg.sender, events.length);
		return eventId;
	}

	function getEventIds() public view returns (uint[]) {
		return creatorToEventIds[msg.sender];
	}

	function getEventForId(uint _eventId) public view returns ( string name, string location, uint256 eventDate, address tokenAddress ) {
		Event memory ievent = events[_eventId-1];
		return ( ievent.name, ievent.location, ievent.event_date, ievent.tickets_address);
	}

	function buyTicket(uint _eventId, uint ticketId ) {
		Event memory ievent = events[_eventId];
		//Tickets tf = Tickets(event.token_factory_address);
		// Try to buy the ticket - is it for sale? 
		//tf.buyTicket(msg.sender, ticketId);
		TicketPurchased(msg.sender, ticketId, ievent.name, _eventId);
	}
}

