// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/// @title OdinAccessPass
/// @notice Minimal ERC-721 access pass for gating private Odin deployments.
///         Owner-mintable; non-transferable by default (soulbound).
contract OdinAccessPass is ERC721, Ownable {
    error PassesAreSoulbound();

    string private _baseTokenURI;
    uint256 public nextTokenId = 1;
    bool public transferable;

    event BaseURIChanged(string newBaseURI);
    event TransferableChanged(bool transferable);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        address owner_
    ) ERC721(name_, symbol_) Ownable(owner_) {
        _baseTokenURI = baseURI_;
    }

    function mint(address to) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        _safeMint(to, tokenId);
    }

    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIChanged(newBaseURI);
    }

    function setTransferable(bool value) external onlyOwner {
        transferable = value;
        emit TransferableChanged(value);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address from)
    {
        from = super._update(to, tokenId, auth);
        // allow mint (from == 0) and burn (to == 0); block transfers when soulbound
        if (!transferable && from != address(0) && to != address(0)) {
            revert PassesAreSoulbound();
        }
    }
}
