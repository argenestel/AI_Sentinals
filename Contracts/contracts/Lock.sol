// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CardNFT is ERC721URIStorage {
    uint256 private _nextTokenId;
    address private owner;

    constructor() ERC721("SentinalsNFT", "SENT") {
        _nextTokenId = 1;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not Owner");
        _;
    }

    mapping(uint256 => CardAttributes) public cardAttributes;

    struct CardAttributes {
        uint256 attack;
        uint256 defence;
        uint256 energy;
        string imageUrl;
        string description;
    }

    event CardMinted(uint256 indexed tokenId, address owner, CardAttributes attributes);

    function mintCard(
        address recipient,
        string memory tokenURI,
        uint256 attack,
        uint256 defence,
        uint256 energy,
        string memory imageUrl,
        string memory description
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        cardAttributes[tokenId] = CardAttributes(attack, defence, energy, imageUrl, description);

        emit CardMinted(tokenId, recipient, cardAttributes[tokenId]);

        return tokenId;
    }

    function getCardAttributes(uint256 tokenId) public view returns (CardAttributes memory) {
        return cardAttributes[tokenId];
    }

    function updateCardAttributes(
        uint256 tokenId,
        uint256 attack,
        uint256 defence,
        uint256 energy,
        string memory imageUrl,
        string memory description
    ) public onlyOwner {
        CardAttributes storage card = cardAttributes[tokenId];
        card.attack = attack;
        card.defence = defence;
        card.energy = energy;
        card.imageUrl = imageUrl;
        card.description = description;

        emit CardMinted(tokenId, ownerOf(tokenId), card);
    }
}
