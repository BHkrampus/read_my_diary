// SPDX-License-Identifier: GPL-3.0 
pragma solidity ^0.8.7;

//Contract Address = 0x888E8142BB8B14c94b902278248461C302c11d3D

contract ReadMyDiary{

    address public vault;
    address public admin;
    uint256 public diaryId;
    uint256 public userId;
    address[] public users;
    uint256 public writingFee;
    uint256 public _boosterSum;

    constructor() payable{
        admin = msg.sender;
        vault = address(this);
        writingFee = 0.01 * 10 ** 18; // 0.1 Matic is INR 8
    }

    modifier onlyAdmin {
      require(msg.sender == admin);
      _;
   }

    struct Page{
        uint pageNum;
        uint256 diaryId;
        string pageText;
        uint totalReaders;
        uint likes;
        mapping(address=>bool) hasReadPage;
        address[] listOfPageReaders;
        uint256 timestamp;
    }

    struct PageReturn{
        uint256 pageNum;
        uint256 diaryId;
        string pageText;
        uint256 totalReaders;
        uint256 likes;
        address[] listOfPageReaders;
    }

    struct Diary{
        uint256 diaryId;
        string diaryName;
        address author;
        uint256 pageFee;
        uint256 totalPages;
        uint256 totalReaders;
        uint256 totalLikes;
        // mapping(uint256=>Page) page;
        mapping(address=>bool) hasReadDiary;
        address[] listOfDiaryReaders;
        string description;
        uint256 totalNfts;
        uint256 lastEntry;
    }

    struct DiaryReturn{
        uint256 diaryId;
        string diaryName;
        address author;
        uint256 pageFee;
        uint256 totalPages;
        uint256 totalReaders;
        uint256 totalLikes;
        address[] listOfDiaryReaders;
        string description;
        uint256 totalNfts;
        uint256 lastEntry;
    }

    struct Reader{
        address reader;
        uint256 diaryId;
        uint256 pageNum;
    }

    

    struct User{
        address userAddress;
        uint256 userId;
        uint256 totalUserDiaries;
        uint256 totalReadingDiaries;
        bool isUser;
        mapping(uint256=>bool) readingDiaries;
        mapping(uint256=>mapping(uint256=>bool)) diaryToPage;
        mapping(uint256=>uint256) diaryIdToPagesRead;
    }

    mapping(address=>User) public addressToUser;
    mapping(uint256=>Diary) public diaryIdToDiary;
    mapping(address=>uint256) public authorToDiaryId;
    mapping(uint256=>mapping(uint256=>Page)) public diaryIdToPage;
    mapping(uint256=>uint256) public diaryIdToTotalFunds;
    mapping(address=>mapping(uint256=>mapping(uint=>bool))) public userReadPage;
    mapping(address=>mapping(uint256=>bool)) public isEligibleForNft;
    mapping(uint256=>mapping(uint256=>uint256)) private diaryToPageBooster;
    mapping(uint256=>mapping(uint256=>uint256)) private diaryToPageReaders;

    function publishDiary(string memory _diaryName, uint256 _pageFee, string memory _description, uint256 _totalNfts) public {
        uint256 _numOfCharDiaryName = charLength(_diaryName);
        uint256 _numOfCharDesp = charLength(_description);
        require(_numOfCharDiaryName>0&&_numOfCharDiaryName<=30, "Exceeds Character Length of Diary Name");
        require(_numOfCharDesp>0&&_numOfCharDesp<=500, "Exceeds Character Length of Diary description");
        //User entry
        User storage currUser = addressToUser[msg.sender];
        if(currUser.isUser==false){
            currUser.userAddress=msg.sender;
            currUser.userId=userId;
            currUser.totalUserDiaries++;
            currUser.totalReadingDiaries=0;
            currUser.isUser=true;
            users.push(msg.sender);
            userId++;
        }
        else{
            currUser.totalUserDiaries++;
        }
        //User entry
        
        //Diary entry
        Diary storage currDiary = diaryIdToDiary[diaryId];
        address[] memory empty;
        currDiary.diaryId = diaryId;
        currDiary.diaryName = _diaryName;
        currDiary.author = msg.sender;
        currDiary.pageFee = _pageFee;
        currDiary.totalPages = 0;
        currDiary.totalReaders = 0;
        currDiary.totalLikes = 0;
        currDiary.listOfDiaryReaders = empty;
        currDiary.description = _description;
        currDiary.totalNfts = _totalNfts;
        currDiary.lastEntry = block.timestamp;
        //Diary entry

        diaryId++;  //Diary number increments

    }

    function charLength(string memory _string) internal pure returns(uint256 numOfChar) {
        uint256 count = 0;
        uint256 bytesLength = bytes(_string).length;
        for(uint i=0; i<bytesLength; i++)
        {
            if(bytes(_string)[i] != " ") {
                count++;
            }
        }
        return count;
        }

    function writingPage(uint256 _diaryId, string memory _pageText) public payable{
        Diary storage currDiary = diaryIdToDiary[_diaryId];
        uint256 _numOfCharPageText = charLength(_pageText);
        require(currDiary.author == msg.sender, "You're not the author");  //Checks author of Diary
        require(msg.value==writingFee, "Please pay the fee"); //Checks writing Fee
        require(_numOfCharPageText>0 && _numOfCharPageText<=3000, "Exceeds Character Length of Page Text");
        // if(currDiary.totalPages!=0){
        //     require(canWrite(_diaryId)==true, "Please wait to write");
        // }  
        //Time function (cannot write pages until 86400 seconds are passed)
        currDiary.lastEntry = block.timestamp;

        //Page entry
        Page storage currPage = diaryIdToPage[_diaryId][currDiary.totalPages+1];
        address[] memory empty;
        currPage.pageNum = currDiary.totalPages + 1;
        currPage.diaryId = _diaryId;
        currPage.pageText = _pageText;
        currPage.totalReaders = 0;
        currPage.likes = 0;
        currPage.listOfPageReaders = empty;
        currPage.timestamp = block.timestamp;
        //Page entry

        currDiary.totalPages++;  //Diary pages increments
        diaryIdToTotalFunds[_diaryId] += msg.value;  //Funds gets incremented
    }

    function canWrite(uint256 _diaryId) public view returns(bool) {
         bool _canWrite; 
         Diary storage currDiary = diaryIdToDiary[_diaryId];
         if(block.timestamp-currDiary.lastEntry>86400){
             _canWrite = true;
         }
         return _canWrite;
    }

    function readingDiary(uint256 _diaryId, uint _pageNum) public payable{
        //User entry
        User storage currUser = addressToUser[msg.sender];
        if(currUser.isUser==false){
            currUser.userAddress=msg.sender;
            currUser.userId=userId;
            currUser.totalUserDiaries=0;
            currUser.isUser=true;
            currUser.totalReadingDiaries=0;
            users.push(msg.sender);
            userId++;
        }
        //User entry

        Diary storage currDiary = diaryIdToDiary[_diaryId];
        Page storage currPage = diaryIdToPage[_diaryId][_pageNum];
        require(currPage.hasReadPage[msg.sender] == false, "You've already read this page");
        require(_pageNum<=currDiary.totalPages, "The Page doesn't exist");
        require(msg.sender!=currDiary.author, "You are the author");
        require(msg.value==currDiary.pageFee, "Please pay the Page Fee");

        //Checks if user has read diary
        if(currDiary.hasReadDiary[msg.sender] == false) {
            currDiary.totalReaders++;
            currDiary.listOfDiaryReaders.push(payable(msg.sender));
            currUser.totalReadingDiaries++;
            currUser.readingDiaries[_diaryId] = true;
        }
        //Checks if user has read diary

        if(currDiary.totalReaders <= currDiary.totalNfts){
            isEligibleForNft[msg.sender][_diaryId] = true;
        }
        
        currDiary.hasReadDiary[msg.sender] = true;
        currPage.hasReadPage[msg.sender] = true;
        currPage.listOfPageReaders.push(payable(msg.sender));
        currPage.totalReaders++;
        currUser.diaryToPage[_diaryId][_pageNum] = true;
        currUser.diaryIdToPagesRead[_diaryId] +=1;
        diaryIdToTotalFunds[_diaryId] += msg.value;  //Funds gets incremented
        userReadPage[msg.sender][_diaryId][_pageNum] = true;

    }

    function getReadingDiaries(address reader) public view returns(DiaryReturn[] memory) {
        User storage currUser = addressToUser[reader];
        uint256 totalReadingDiaries = currUser.totalReadingDiaries;
        DiaryReturn[] memory readingDiaries = new DiaryReturn[](totalReadingDiaries);
        uint currIndex=0;
        for(uint i=0; i<=diaryId; i++)
        {
            Diary storage currDiary = diaryIdToDiary[i];
            if(currDiary.hasReadDiary[reader]==true)
            {
                readingDiaries[currIndex].diaryId = currDiary.diaryId;
                readingDiaries[currIndex].diaryName = currDiary.diaryName;
                readingDiaries[currIndex].author = currDiary.author;
                readingDiaries[currIndex].pageFee = currDiary.pageFee;
                readingDiaries[currIndex].totalPages = currDiary.totalPages;
                readingDiaries[currIndex].totalReaders = currDiary.totalReaders;
                readingDiaries[currIndex].totalLikes = currDiary.totalLikes;
                readingDiaries[currIndex].listOfDiaryReaders = currDiary.listOfDiaryReaders;
                readingDiaries[currIndex].description = currDiary.description;
                readingDiaries[currIndex].totalNfts = currDiary.totalNfts;
                readingDiaries[currIndex].lastEntry = currDiary.lastEntry;
                currIndex++;
            }
        }
        return readingDiaries;
    }

    function getMyDiaries(address author) public view returns(DiaryReturn[] memory) {
        User storage currUser = addressToUser[author];
        uint256 totalUserDiaries = currUser.totalUserDiaries;
        DiaryReturn[] memory myDiaries = new DiaryReturn[](totalUserDiaries);
        uint currIndex=0;
        for(uint i=0; i<=diaryId; i++)
        {
            Diary storage currDiary = diaryIdToDiary[i];
            if(currDiary.author == author)
            {
                myDiaries[currIndex].diaryId = currDiary.diaryId;
                myDiaries[currIndex].diaryName = currDiary.diaryName;
                myDiaries[currIndex].author = currDiary.author;
                myDiaries[currIndex].pageFee = currDiary.pageFee;
                myDiaries[currIndex].totalPages = currDiary.totalPages;
                myDiaries[currIndex].totalReaders = currDiary.totalReaders;
                myDiaries[currIndex].totalLikes = currDiary.totalLikes;
                myDiaries[currIndex].listOfDiaryReaders = currDiary.listOfDiaryReaders;
                myDiaries[currIndex].description = currDiary.description;
                myDiaries[currIndex].totalNfts = currDiary.totalNfts;
                myDiaries[currIndex].lastEntry = currDiary.lastEntry;
                currIndex++;
            }
        }
        return myDiaries;
    }

    function getDiaryPages(uint256 _diaryId) public view returns(PageReturn[] memory){
         Diary storage currDiary = diaryIdToDiary[_diaryId];
         PageReturn[] memory allPages = new PageReturn[](currDiary.totalPages);
         for(uint i=0; i<currDiary.totalPages; i++)
         {
             allPages[i].pageNum = diaryIdToPage[_diaryId][i+1].pageNum;
             allPages[i].diaryId = diaryIdToPage[_diaryId][i+1].diaryId;
             allPages[i].pageText = diaryIdToPage[_diaryId][i+1].pageText;
             allPages[i].totalReaders = diaryIdToPage[_diaryId][i+1].totalReaders;
             allPages[i].likes = diaryIdToPage[_diaryId][i+1].likes;
             allPages[i].listOfPageReaders = diaryIdToPage[_diaryId][i+1].listOfPageReaders;
         }

         return allPages;
    }

    function getAllDiaries() public view returns(DiaryReturn[] memory) {
        DiaryReturn[] memory allDiaries = new DiaryReturn[](diaryId);
        for(uint i=0; i<diaryId; i++)
        {
            Diary storage currDiary = diaryIdToDiary[i];
            allDiaries[i].diaryId = currDiary.diaryId;
            allDiaries[i].diaryName = currDiary.diaryName;
            allDiaries[i].author = currDiary.author;
            allDiaries[i].pageFee = currDiary.pageFee;
            allDiaries[i].totalPages = currDiary.totalPages;
            allDiaries[i].totalReaders = currDiary.totalReaders;
            allDiaries[i].totalLikes = currDiary.totalLikes;
            allDiaries[i].listOfDiaryReaders = currDiary.listOfDiaryReaders;
            allDiaries[i].description = currDiary.description;
            allDiaries[i].totalNfts = currDiary.totalNfts;
            allDiaries[i].lastEntry = currDiary.lastEntry;
            
        }
        return allDiaries;
    }

    function pageReaders(uint256 _diaryId, uint256 _page) public view returns(uint256){
         Diary storage currDiary = diaryIdToDiary[_diaryId];
         uint256 totalReaders = currDiary.totalReaders;
         uint256 _pageReaders = 0;
         for(uint256 j=0; j<totalReaders; j++){
             if(addressToUser[currDiary.listOfDiaryReaders[j]].diaryIdToPagesRead[_diaryId] == _page){
                 _pageReaders++;
             }
         }
         return _pageReaders;
    }

    function distributionOfFunds(uint256 _diaryId) public payable {
        Diary storage currDiary = diaryIdToDiary[_diaryId];
        require(msg.sender==currDiary.author, "You're not the author");
        uint256 _totalFunds = diaryIdToTotalFunds[_diaryId];
        require(vault.balance>=_totalFunds, "Insufficient funds to distribute");
        uint256 totalReaders = currDiary.totalReaders;
        uint256 readersFunds = _totalFunds/2;
        uint256 _boostingFactor = boostingFactor(_diaryId, _totalFunds);
        
        for(uint256 j=0; j<totalReaders; j++){
            address currReader = currDiary.listOfDiaryReaders[j];
            uint256 page = addressToUser[currReader].diaryIdToPagesRead[_diaryId];
            uint256 funds = (((diaryToPageBooster[_diaryId][page]) * _boostingFactor) * 10 ** 10)  / ((diaryToPageReaders[_diaryId][page]) * (10 ** 10) * (10 ** 20));
            payable(currReader).transfer(funds);
         }
        payable(currDiary.author).transfer(readersFunds); // 50% of total funds
        diaryIdToTotalFunds[_diaryId] = 0;
    }

    function boostingFactor(uint256 _diaryId, uint256 _totalFunds) public returns(uint256){
        Diary storage currDiary = diaryIdToDiary[_diaryId];
        uint256 totalPages = currDiary.totalPages;
        uint256 pageFee = currDiary.pageFee;
        uint256 readersFunds = _totalFunds/2;
        uint256 boosterSum = 0;
        for(uint256 i=1; i<=totalPages; i++){
            uint256 _pageReaders = pageReaders(_diaryId, i);
            diaryToPageReaders[_diaryId][i] = _pageReaders;
            uint256 weightageInTotalFunds = ((i * pageFee) * 100 * 10 ** 10)/_totalFunds; //so that it doesn't come in decimals
            uint256 booster = (weightageInTotalFunds * (readersFunds/100) * _pageReaders * (i * (10 ** 4)/totalPages)) / (10 ** 4);
            diaryToPageBooster[_diaryId][i] = booster;
            boosterSum += booster;
        }
        _boosterSum = boosterSum;
        uint256 _boostingFactor = (readersFunds * 10 ** 20)/boosterSum;
        return _boostingFactor;
    }

    function changeWritingFee(uint _newFee) public onlyAdmin {
        writingFee = _newFee;
    }

    function getBalance() public view returns(uint256) {
        return vault.balance;
    }

    function getBalanceAddress(address user) public view returns(uint256) {
        return user.balance;
    }

}
