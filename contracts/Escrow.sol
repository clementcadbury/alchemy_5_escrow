// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Escrow {
	address public arbiter;
	address public beneficiary;
	address public depositor;

	bool public isApproved;

	event Approved(uint _balance);
	event EscrowDeployed(address indexed _depositor,address indexed _arbiter,address indexed _beneficiary);

	constructor(address _arbiter, address _beneficiary) payable {
		arbiter = _arbiter;
		beneficiary = _beneficiary;
		depositor = msg.sender;
		emit EscrowDeployed(depositor,arbiter,beneficiary);
	}

	

	function approve() external {
		require(msg.sender == arbiter,'not arbiter');
		uint balance = address(this).balance;
		(bool sent, ) = payable(beneficiary).call{value: balance}("");
 		require(sent, "Failed to send Ether");
		emit Approved(balance);
		isApproved = true;
	}
}
