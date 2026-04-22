// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import { OdinAccessPass } from "../src/OdinAccessPass.sol";

contract OdinAccessPassTest is Test {
    OdinAccessPass internal pass;
    address internal owner = address(0xC0FFEE);
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    function setUp() public {
        pass = new OdinAccessPass("Odin Pass", "ODIN", "ipfs://meta/", owner);
    }

    function test_ownerCanMint() public {
        vm.prank(owner);
        uint256 id = pass.mint(alice);
        assertEq(id, 1);
        assertEq(pass.ownerOf(id), alice);
    }

    function test_nonOwnerCannotMint() public {
        vm.expectRevert();
        vm.prank(alice);
        pass.mint(bob);
    }

    function test_soulboundByDefault() public {
        vm.prank(owner);
        uint256 id = pass.mint(alice);

        vm.expectRevert(OdinAccessPass.PassesAreSoulbound.selector);
        vm.prank(alice);
        pass.transferFrom(alice, bob, id);
    }

    function test_transferableWhenEnabled() public {
        vm.prank(owner);
        pass.setTransferable(true);

        vm.prank(owner);
        uint256 id = pass.mint(alice);

        vm.prank(alice);
        pass.transferFrom(alice, bob, id);
        assertEq(pass.ownerOf(id), bob);
    }

    function test_setBaseURI() public {
        vm.prank(owner);
        pass.mint(alice);

        vm.prank(owner);
        pass.setBaseURI("ipfs://newmeta/");

        assertEq(pass.tokenURI(1), "ipfs://newmeta/1");
    }
}
