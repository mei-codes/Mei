// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title OdinRegistry
/// @notice Append-only registry of Odin agent manifests.
contract OdinRegistry {
    struct Entry {
        address publisher;
        string name;
        string version;
        bytes32 contentHash;
        string uri;
        uint64 createdAt;
        uint64 deprecatedAt;
    }

    error EmptyName();
    error EmptyVersion();
    error ZeroContentHash();
    error UnknownEntry(uint256 id);
    error NotPublisher(uint256 id, address caller);

    uint256 public totalEntries;
    mapping(uint256 => Entry) private _entries;

    event Published(uint256 indexed id, address indexed publisher, bytes32 contentHash);
    event Deprecated(uint256 indexed id, address indexed publisher);

    function publish(
        string calldata name,
        string calldata version,
        bytes32 contentHash,
        string calldata uri
    ) external returns (uint256 id) {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(version).length == 0) revert EmptyVersion();
        if (contentHash == bytes32(0)) revert ZeroContentHash();

        unchecked {
            id = ++totalEntries;
        }

        _entries[id] = Entry({
            publisher: msg.sender,
            name: name,
            version: version,
            contentHash: contentHash,
            uri: uri,
            createdAt: uint64(block.timestamp),
            deprecatedAt: 0
        });

        emit Published(id, msg.sender, contentHash);
    }

    function deprecate(uint256 id) external {
        Entry storage e = _entries[id];
        if (e.createdAt == 0) revert UnknownEntry(id);
        if (e.publisher != msg.sender) revert NotPublisher(id, msg.sender);
        e.deprecatedAt = uint64(block.timestamp);
        emit Deprecated(id, msg.sender);
    }

    function entries(uint256 id)
        external
        view
        returns (
            address publisher,
            string memory name,
            string memory version,
            bytes32 contentHash,
            string memory uri,
            uint64 createdAt,
            uint64 deprecatedAt
        )
    {
        Entry storage e = _entries[id];
        if (e.createdAt == 0) revert UnknownEntry(id);
        return (
            e.publisher,
            e.name,
            e.version,
            e.contentHash,
            e.uri,
            e.createdAt,
            e.deprecatedAt
        );
    }
}
