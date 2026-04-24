// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { OdinRegistry } from "../src/OdinRegistry.sol";
import { OdinAccessPass } from "../src/OdinAccessPass.sol";

contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        OdinRegistry registry = new OdinRegistry();
        console2.log("OdinRegistry deployed at:", address(registry));

        bool deployPass = vm.envOr("DEPLOY_ACCESS_PASS", false);
        if (deployPass) {
            OdinAccessPass pass = new OdinAccessPass(
                "Odin Access Pass",
                "ODIN",
                "ipfs://odin-pass/",
                deployer
            );
            console2.log("OdinAccessPass deployed at:", address(pass));
        }

        vm.stopBroadcast();
    }
}
