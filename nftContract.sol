// SPDX-License-Identifier: GPL-3.0 
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ReadMyDiaryNFT is ERC721URIStorage { 
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct ReadMyDiaryNFTSource {
        address reader;
        uint256 diaryId;
        string metadataUri;
    }
    mapping (uint256 => ReadMyDiaryNFTSource) public idToReadMyDiaryNFTSource;
    
    mapping (uint256 => mapping(address => bool)) public nftMinted;

    constructor () ERC721("ReadMyDiary","RMD"){}
    
    function createToken(string memory metadataUri, uint256 _diaryId) public returns (uint) {
        require(nftMinted[_diaryId][msg.sender] = false, "You've already minted NFT");
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, metadataUri);
        idToReadMyDiaryNFTSource[newItemId] = ReadMyDiaryNFTSource( msg.sender, _diaryId, metadataUri);
        nftMinted[_diaryId][msg.sender] = true;
        return newItemId;
    }

    function tokenSource(uint256 _tokenId)
        public
        view
        returns (
            address reader,
            uint256 _diaryid,
            string memory metadataUri)
        {
          ReadMyDiaryNFTSource memory readMyDiaryNFTSource = idToReadMyDiaryNFTSource[_tokenId];
          return (readMyDiaryNFTSource.reader, readMyDiaryNFTSource.diaryId, readMyDiaryNFTSource.metadataUri);
        }

        
    function getNftMinted (uint256 _diaryId, address reader) public view returns(bool){
        return nftMinted[_diaryId][reader];
    }
}
