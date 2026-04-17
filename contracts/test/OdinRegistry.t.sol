// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { OdinRegistry } from "../src/OdinRegistry.sol";

contract OdinRegistryTest is Test {
    OdinRegistry internal registry;
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    bytes32 internal constant HASH_ONE = keccak256("manifest-1");
    bytes32 internal constant HASH_TWO = keccak256("manifest-2");

    function setUp() public {
        registry = new OdinRegistry();
    }

    function test_publishAssignsIncrementingIds() public {
        vm.prank(alice);
        uint256 id1 = registry.publish("odin-core", "0.1.0", HASH_ONE, "ipfs://a");

        vm.prank(bob);
        uint256 id2 = registry.publish("odin-tools", "0.2.0", HASH_TWO, "ipfs://b");

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertEq(registry.totalEntries(), 2);
    }

    function test_publishStoresFieldsAndEmits() public {
        vm.expectEmit(true, true, false, true);
        emit OdinRegistry.Published(1, alice, HASH_ONE);

        vm.prank(alice);
        uint256 id = registry.publish("odin", "0.1.0", HASH_ONE, "ipfs://x");

        (
            address publisher,
            string memory name,
            ,
            bytes32 contentHash,
            ,
            uint64 createdAt,
            uint64 deprecatedAt
        ) = registry.entries(id);

        assertEq(publisher, alice);
        assertEq(name, "odin");
        assertEq(contentHash, HASH_ONE);
        assertGt(createdAt, 0);
        assertEq(deprecatedAt, 0);
    }

    function test_deprecateMarksEntry() public {
        vm.prank(alice);
        uint256 id = registry.publish("odin", "0.1.0", HASH_ONE, "");

        vm.expectEmit(true, true, false, true);
        emit OdinRegistry.Deprecated(id, alice);

        vm.prank(alice);
        registry.deprecate(id);

        (, , , , , , uint64 deprecatedAt) = registry.entries(id);
        assertGt(deprecatedAt, 0);
    }
}
