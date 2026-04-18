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
            string memory version,
            bytes32 contentHash,
            string memory uri,
            uint64 createdAt,
            uint64 deprecatedAt
        ) = registry.entries(id);

        assertEq(publisher, alice);
        assertEq(name, "odin");
        assertEq(version, "0.1.0");
        assertEq(contentHash, HASH_ONE);
        assertEq(uri, "ipfs://x");
        assertGt(createdAt, 0);
        assertEq(deprecatedAt, 0);
    }

    function test_publishRejectsEmptyName() public {
        vm.expectRevert(OdinRegistry.EmptyName.selector);
        registry.publish("", "0.1.0", HASH_ONE, "");
    }

    function test_publishRejectsEmptyVersion() public {
        vm.expectRevert(OdinRegistry.EmptyVersion.selector);
        registry.publish("odin", "", HASH_ONE, "");
    }

    function test_publishRejectsZeroHash() public {
        vm.expectRevert(OdinRegistry.ZeroContentHash.selector);
        registry.publish("odin", "0.1.0", bytes32(0), "");
    }

    function test_publishRejectsLongUri() public {
        bytes memory long = new bytes(513);
        vm.expectRevert(OdinRegistry.UriTooLong.selector);
        registry.publish("odin", "0.1.0", HASH_ONE, string(long));
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
        assertEq(registry.isActive(id), false);
    }

    function test_deprecateRejectsNonPublisher() public {
        vm.prank(alice);
        uint256 id = registry.publish("odin", "0.1.0", HASH_ONE, "");

        vm.expectRevert(
            abi.encodeWithSelector(OdinRegistry.NotPublisher.selector, id, bob)
        );
        vm.prank(bob);
        registry.deprecate(id);
    }

    function test_deprecateRejectsUnknown() public {
        vm.expectRevert(abi.encodeWithSelector(OdinRegistry.UnknownEntry.selector, 99));
        registry.deprecate(99);
    }

    function test_deprecateRejectsTwice() public {
        vm.startPrank(alice);
        uint256 id = registry.publish("odin", "0.1.0", HASH_ONE, "");
        registry.deprecate(id);
        vm.expectRevert(
            abi.encodeWithSelector(OdinRegistry.AlreadyDeprecated.selector, id)
        );
        registry.deprecate(id);
        vm.stopPrank();
    }

    function test_entriesRevertsOnUnknown() public {
        vm.expectRevert(abi.encodeWithSelector(OdinRegistry.UnknownEntry.selector, 1));
        registry.entries(1);
    }
}
