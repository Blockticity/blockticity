// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Blockticity COA Contract
/// @notice Standard ERC721 token used to mint tamper-evident Certificates of Authenticity
contract BlockticityCOA is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("Blockticity COA", "BTIC") {}

    /// @notice Mint a new COA to a recipient with a metadata URI
    /// @param recipient Wallet address to receive the COA
    /// @param tokenURI URI pointing to the metadata JSON
    function mintTo(address recipient, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }

    /// @notice Returns the next token ID to be minted
    function getCurrentTokenId() public view returns (uint256) {
        return _nextTokenId;
    }
}
