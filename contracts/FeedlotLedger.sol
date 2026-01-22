// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract FeedlotLedger is AccessControl {
    bytes32 public constant FEEDLOT_ROLE     = keccak256("FEEDLOT_ROLE");
    bytes32 public constant SCALE_ROLE       = keccak256("SCALE_ROLE");
    bytes32 public constant VET_ROLE         = keccak256("VET_ROLE");
    bytes32 public constant NUTRITION_ROLE   = keccak256("NUTRITION_ROLE");
    bytes32 public constant TRUCK_ROLE       = keccak256("TRUCK_ROLE");
    bytes32 public constant PACKER_ROLE      = keccak256("PACKER_ROLE");

    uint256 public nextEventId = 1;

    event LedgerEvent(
        uint256 indexed eventId,
        string indexed tag,
        string eventType,
        uint64 timestamp,
        address indexed submittedBy,
        string payloadJson,
        bytes32 docHash
    );

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function _requiredRoleFor(string memory eventType) internal pure returns (bytes32) {
        bytes32 h = keccak256(bytes(eventType));

        if (h == keccak256("ANIMAL_REGISTERED")) return FEEDLOT_ROLE;
        if (h == keccak256("ARRIVAL_RECORDED")) return FEEDLOT_ROLE;
        if (h == keccak256("PEN_MOVED")) return FEEDLOT_ROLE;
        if (h == keccak256("SHIP_OUT")) return FEEDLOT_ROLE;

        if (h == keccak256("WEIGH_IN")) return SCALE_ROLE;
        if (h == keccak256("WEIGH_OUT")) return SCALE_ROLE;
        if (h == keccak256("WEIGH_VOIDED")) return SCALE_ROLE;

        if (h == keccak256("TREATMENT_ADMINISTERED")) return VET_ROLE;
        if (h == keccak256("TREATMENT_VOIDED")) return VET_ROLE;

        if (h == keccak256("RATION_DEFINED")) return NUTRITION_ROLE;
        if (h == keccak256("RATION_ASSIGNED")) return NUTRITION_ROLE;
        if (h == keccak256("FEED_DELIVERED")) return NUTRITION_ROLE;

        if (h == keccak256("PICKUP_RECORDED")) return TRUCK_ROLE;
        if (h == keccak256("DELIVERY_RECORDED")) return TRUCK_ROLE;

        if (h == keccak256("RECEIVED_AT_PACKER")) return PACKER_ROLE;

        revert("Unknown eventType (not allowed)");
    }

    function logEvent(
        string calldata tag,
        string calldata eventType,
        string calldata payloadJson,
        bytes32 docHash
    ) external returns (uint256 eventId) {
        bytes32 role = _requiredRoleFor(eventType);
        require(hasRole(role, msg.sender), "Not authorized for this eventType");

        eventId = nextEventId++;
        emit LedgerEvent(
            eventId,
            tag,
            eventType,
            uint64(block.timestamp),
            msg.sender,
            payloadJson,
            docHash
        );
    }

    function grantRoles(address account, bytes32[] calldata roles) external onlyRole(DEFAULT_ADMIN_ROLE) {
        for (uint256 i = 0; i < roles.length; i++) {
            _grantRole(roles[i], account);
        }
    }
}
