// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public highScore;
    bool public bountyClaimed;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event HighScoreSet(uint256 score);
    event BountyClaimed(address claimer, uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
        highScore = 0;
        bountyClaimed = false;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;
        require(msg.sender == owner, "You are not the owner of this account");
        balance += _amount;
        assert(balance == _previousBalance + _amount);
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }
        balance -= _withdrawAmount;
        assert(balance == (_previousBalance - _withdrawAmount));
        emit Withdraw(_withdrawAmount);
    }

    function setHighScore(uint256 _score) public {
        require(msg.sender == owner, "You are not the owner of this account");
        require(_score > highScore, "New score must be higher than the current high score");
        highScore = _score;
        emit HighScoreSet(_score);
    }

    function claimBounty() public {
        require(!bountyClaimed, "Bounty already claimed");
        require(msg.sender == owner, "You are not the owner of this account");
        
        uint256 bountyAmount = balance;
        balance = 0;
        bountyClaimed = true;
        owner.transfer(bountyAmount);
        emit BountyClaimed(msg.sender, bountyAmount);
    }
}
