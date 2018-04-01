pragma solidity ^0.4.18;
import "./TicketFactory.sol";

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


    event NewEventCreated(address _creator, string _name, uint _eventDate, string _location, uint _numTickets, uint _faceValue);
    event TicketPurchased(address _buyer, uint _ticketid, string _name, uint _eventid);
    event TicketListedForSale(address _seller, uint _ticketId, uint _askPrice);
    event GetEventForId(uint id);
    event CreatorIds(uint[] _ids);
    
    function EventFactory() public {
    }
 
    function createNewEvent(string _name, string _location, uint _eventDate, uint _numTickets, uint16 _faceValue) public returns (uint) {
        address ticketsAddress = new TicketFactory(msg.sender, _numTickets, _faceValue);
        uint eventId = events.push(Event(msg.sender, ticketsAddress, _name, _location, _eventDate, true));
        creatorToEventIds[msg.sender].push(eventId);
        
        NewEventCreated(msg.sender, _name, _eventDate, _location, _numTickets, _faceValue);
        CreatorIds(creatorToEventIds[msg.sender]);
        return eventId;
    }

    function getEventIds() public view returns (uint[]) {
        return creatorToEventIds[msg.sender];
    }

    function getEventForId(uint _eventId) public view returns (string, string, uint256, address , uint) {
    	GetEventForId(_eventId);
        Event memory ievent = events[_eventId-1];
        
        return (ievent.name, ievent.location, ievent.event_date, ievent.tickets_address, _eventId);
    }

    function getEventsWithAvailableTickets() public view returns (uint[], uint[]) {
        uint[] ids;
        uint[] price;
        for (uint i = 0; i < events.length; i++) {
            //TicketFactory ticketFactory = TicketFactory(events[i].tickets_address);
            bool ticketAvailable = true;
            uint16 lowestAskingPrice;
            uint ticketId;
           // (ticketAvailable, lowestAskingPrice, ticketId) = ticketFactory.lowestAskingPrice();
            if (ticketAvailable) {
                ids.push(i);
                price.push(10);
            }
        }
        return (ids, price);
    }

    function getMyEvents() public view returns (uint[]) {
        uint[] ids;
        for (uint i = 0; i < events.length; i++) {
           // TicketFactory ticketFactory = TicketFactory(events[i].tickets_address);
            //uint ticketBalance = ticketFactory.balanceOf(msg.sender);
            uint ticketBalance = 0;
            if (ticketBalance > 0) {
                ids.push(i+1);
            }
        }
        return ids;
    }

    /*
    function buyTicket(uint _eventId, uint _ticketId ) public {
        Event memory event = events[_eventId];
        Tickets tickets = Tickets(event.tickets_address);
        tickets.buyTicket(_ticketId);
        TicketPurchased(msg.sender, _ticketId, event.name, _eventId);
    }

    function sellTicket(uint _ticketId, uint _askPrice) public {
        Tickets tickets = Tickets(event.tickets_address);
        tickets.sellTicket(_ticketId, _askPrice);
        TicketListedForSale(msg.sender, _ticketId, _askPrice);
    }
    */
}

