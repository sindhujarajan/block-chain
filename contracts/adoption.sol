pragma solidity ^0.5.2;

contract Adoption{

 address[16] public adopters;
 string lName;
 string certificateName;
 string issueDate;

 function saveCertificate(string memory _lName,string memory _certName, string memory _issueDate) public {
       
       lName = _lName;
       certificateName = _certName;
       issueDate = _issueDate;
 }

 function getCertificate() public view returns (string memory,string memory,string memory) {
       return (
       lName,
       certificateName,
       issueDate      
       );
   }

   function adopt(uint petId) public returns (uint) {
		require(petId >= 0 && petId <= 15);
		adopters[petId] = msg.sender;
		return petId;
    }

	// Retrieving the adopters
	function getAdopters() public view returns (address[16] memory) {
		return adopters;
	}

}
