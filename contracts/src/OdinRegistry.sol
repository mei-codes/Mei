// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title OdinRegistry
/// @notice Append-only registry of Odin agent manifests. Anyone can publish.
///         Only the original publisher can deprecate their own entry. There is
///         no admin, no pause, and no upgrade path — entries are permanent.
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
    error UriTooLong();
    error UnknownEntry(uint256 id);
    error NotPublisher(uint256 id, address caller);
    error AlreadyDeprecated(uint256 id);

    uint256 public constant MAX_URI_BYTES = 512;

    uint256 public totalEntries;
    mapping(uint256 => Entry) private _entries;

    event Published(uint256 indexed id, address indexed publisher, bytes32 contentHash);
    event Deprecated(uint256 indexed id, address indexed publisher);

    /// @notice Publish a new manifest entry.
    /// @param name        non-empty agent name
    /// @param version     non-empty semver-like version
    /// @param contentHash non-zero hash of the off-chain manifest
    /// @param uri         optional pointer (≤ 512 bytes) — ipfs://, https://, etc.
    /// @return id         the assigned entry id, starting at 1
    function publish(
        string calldata name,
        string calldata version,
        bytes32 contentHash,
        string calldata uri
    ) external returns (uint256 id) {
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(version).length == 0) revert EmptyVersion();
        if (contentHash == bytes32(0)) revert ZeroContentHash();
        if (bytes(uri).length > MAX_URI_BYTES) revert UriTooLong();

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

    /// @notice Mark an entry deprecated. Callable only by the original publisher.
    function deprecate(uint256 id) external {
        Entry storage e = _entries[id];
        if (e.createdAt == 0) revert UnknownEntry(id);
        if (e.publisher != msg.sender) revert NotPublisher(id, msg.sender);
        if (e.deprecatedAt != 0) revert AlreadyDeprecated(id);

        e.deprecatedAt = uint64(block.timestamp);
        emit Deprecated(id, msg.sender);
    }

    /// @notice Read an entry by id. Reverts on unknown id.
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

    /// @notice Returns whether an entry exists and is still active.
    function isActive(uint256 id) external view returns (bool) {
        Entry storage e = _entries[id];
        return e.createdAt != 0 && e.deprecatedAt == 0;
    }
}
