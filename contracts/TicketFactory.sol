pragma solidity ^0.4.19;
import "zeppelin-solidity/contracts/token/ERC721/ERC721Basic.sol";

contract TicketFactory is ERC721Basic {
    //Has inherited Events Transfer, Approval, and ApprovalForAll
    address venueWalletAddress;
    uint numberOfTickets;
    uint16 startingValue;
    function TicketFactory(address _venueWalletAddress, uint _numberOfTickets, uint16 _startingValue) public {
        venueWalletAddress = _venueWalletAddress;
        numberOfTickets = _numberOfTickets;
        startingValue = _startingValue;
        populateTickets();
    }
    struct TicketOwner {
        address ownerAddress;
        uint16  askPrice;
        bool    forSale;
    }
    // Mapping from token ID to owner
    mapping (uint256 => TicketOwner) internal ticketIdToTicketOwner;

    
    function balanceOf(address _owner) public view returns (uint256 _balance) {
        _balance = 0;
        for (uint ticketId = 0; ticketId < numberOfTickets; ticketId++) {
            if (ticketIdToTicketOwner[ticketId].ownerAddress == _owner) {
                _balance++;
            }
        }
        return _balance;
    }

    function ownerOf(uint256 _tokenId) public view returns (address _owner) {
        return ticketIdToTicketOwner[_tokenId].ownerAddress;
    }

    function exists(uint256 _tokenId) public view returns (bool) {
        address owner = ticketIdToTicketOwner[_tokenId].ownerAddress;
        return owner != address(0);
    }

    function lowestAskingPrice() public view returns (uint16, uint256) {
        uint256 id = 0;
        uint16 minPrice = ticketIdToTicketOwner[id].askPrice;
        for (uint ticketId = 1; ticketId < numberOfTickets; ticketId++) {
            if (ticketIdToTicketOwner[ticketId].askPrice < minPrice) {
                id = ticketId;
                minPrice = ticketIdToTicketOwner[ticketId].askPrice;
            }
        }
        return (minPrice, id);  
    }

    //NOOPS
    function approve(address _to, uint256 _tokenId) public {

    }
    function getApproved(uint256 _tokenId) public view returns (address _operator) {

    }
    function setApprovalForAll(address _operator, bool _approved) public {

    }
    function isApprovedForAll(address _owner, address _operator) public view returns (bool) {

    }
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) public {

    }  
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes _data) public {

    }
    function transferFrom(address _from, address _to, uint256 _ticketId) public {
        
    }
    //NOOPS
    
    function buyTicket(uint _ticketId) external payable {
        require(msg.value >= ticketIdToTicketOwner[_ticketId].askPrice);
        address _ownerAddress = ticketIdToTicketOwner[_ticketId].ownerAddress;
        _ownerAddress.transfer(msg.value);
        //askPrice will remain the same
        ticketIdToTicketOwner[_ticketId].ownerAddress = msg.sender;
        ticketIdToTicketOwner[_ticketId].forSale = false;

    }

    function sellTicket(uint _ticketId, uint16 _askPrice) external {
        require(msg.sender == ticketIdToTicketOwner[_ticketId].ownerAddress);
        require(_askPrice <= startingValue);
        ticketIdToTicketOwner[_ticketId].askPrice = _askPrice;
        ticketIdToTicketOwner[_ticketId].forSale = true;
    }

    function populateTickets() internal {
        for (uint ticketId = 0; ticketId < numberOfTickets; ticketId++) {
            ticketIdToTicketOwner[ticketId] = TicketOwner(venueWalletAddress, startingValue, true);
        }
    }   
}


