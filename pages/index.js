import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showPinPad, setShowPinPad] = useState(false);
  const [pin, setPin] = useState("");
  const [actionType, setActionType] = useState(""); // "deposit" or "withdraw"
  const [amount, setAmount] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected:", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = () => {
    setActionType("deposit");
    setShowPinPad(true);
  };

  const withdraw = () => {
    setActionType("withdraw");
    setShowPinPad(true);
  };

  const handlePinButtonClick = (number) => {
    setPin((prevPin) => prevPin + number);
  };

  const handlePinSubmit = () => {
    if (pin === "1234") {
      if (actionType === "deposit") {
        performDeposit();
      } else if (actionType === "withdraw") {
        performWithdraw();
      }
    } else {
      alert("Incorrect PIN. Please try again.");
    }
    setShowPinPad(false);
    setPin("");
  };

  const performDeposit = async () => {
    if (atm) {
      let tx = await atm.deposit(amount);
      await tx.wait();
      getBalance();
    }
  };

  const performWithdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(amount);
      await tx.wait();
      getBalance();
    }
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p style={{ color: "white" }}>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return (
        <button style={{ color: "white" }} onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p style={{ color: "white" }}>Your Account: {account}</p>
        <p style={{ color: "white" }}>Your Balance: {balance}</p>
        <button
          style={{
            backgroundColor: actionType === "deposit" ? "green" : "red",
            color: "white",
          }}
          onClick={deposit}
        >
          Deposit
        </button>
        <button
          style={{
            backgroundColor: actionType === "withdraw" ? "red" : "green",
            color: "white",
          }}
          onClick={withdraw}
        >
          Withdraw
        </button>
        {showPinPad && (
          <div>
            <p style={{ color: "white" }}>Please enter the PIN:</p>
            <div>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <button
                  key={number}
                  style={{
                    backgroundColor:
                      actionType === "deposit" ? "green" : "red",
                    color: "white",
                  }}
                  onClick={() => handlePinButtonClick(number)}
                >
                  {number}
                </button>
              ))}
            </div>
            <button style={{ color: "white" }} onClick={handlePinSubmit}>
              Submit
            </button>
          </div>
        )}
        {showPinPad && (
          <div>
            <p style={{ color: "white" }}>Enter amount:</p>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container" style={{ backgroundColor: "brown" }}>
      <header>
        <h1 style={{ color: "white" }}>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
