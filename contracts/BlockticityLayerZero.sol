// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";

/// @title Cross-chain COA Contract
/// @notice Extends ERC721 to support LayerZero cross-chain messaging
contract BlockticityLayerZero is ERC721URIStorage, Ownable, NonblockingLzApp {
    uint256 private _nextTokenId;

    constructor(address _lzEndpoint) ERC721("Blockticity COA", "BTIC") NonblockingLzApp(_lzEndpoint) {}

    function mintTo(address recipient, string memory tokenURI) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }

    function sendMetadata(
        uint16 _dstChainId,
        bytes calldata _destination,
        string calldata metadataURI
    ) external onlyOwner {
        _lzSend(
            _dstChainId,
            abi.encode(metadataURI),
            payable(msg.sender),
            address(0),
            bytes(""),
            300000
        );
    }

    function _nonblockingLzReceive(
        uint16,
        bytes memory,
        uint64,
        bytes memory payload
    ) internal override {
        string memory receivedURI = abi.decode(payload, (string));
        // Handle logic for received metadata here
    }

    function getCurrentTokenId() public view returns (uint256) {
        return _nextTokenId;
    }
}
