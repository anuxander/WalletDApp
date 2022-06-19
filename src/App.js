import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/SharedWallet.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isSharedWalletOwner, setIsSharedWalletOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", sharedWalletName: "" });
  const [sharedWalletOwnerAddress, setSharedWalletOwnerAddress] = useState(null);
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [totalBalance, setTotalBalance] = useState(null);
  const [currentSharedWalletName, setCurrentSharedWalletName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = '0x23027A1cb13413Ff4faeC36C5728A4E82aD61e8F';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our sharedWallet.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getSharedWalletName = async () => {
    try {
      if (window.ethereum) {

        //read data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const sharedWalletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let sharedWalletName = await sharedWalletContract.walletName();
        sharedWalletName = utils.parseBytes32String(sharedWalletName);
        setCurrentSharedWalletName(sharedWalletName.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our sharedWallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const setSharedWalletNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const sharedWalletContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await sharedWalletContract.setwalletName(utils.formatBytes32String(inputValue.sharedWalletName));
        console.log("Setting Shared Wallet Name...");
        await txn.wait();
        console.log("Shared Wallet Name Changed", txn.hash);
        getSharedWalletName();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getSharedWalletOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const sharedWalletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = await sharedWalletContract.walletOwner();
        setSharedWalletOwnerAddress(owner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsSharedWalletOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const totalBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const sharedWalletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await sharedWalletContract.totalBalance();
        setTotalBalance(utils.formatEther(balance));
        console.log("Retrieved total balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const customerBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const sharedWalletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await sharedWalletContract.getCustomerBalance();
        setCustomerTotalBalance(utils.formatEther(balance));
        console.log("Retrieved customer balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const sharedWalletContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await sharedWalletContract.depositMoney({ value: ethers.utils.parseEther(inputValue.deposit) });
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);

        totalBalanceHandler();
        customerBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const sharedWalletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let myAddress = await signer.getAddress()
        console.log("provider signer...", myAddress);

        const txn = await sharedWalletContract.withDrawMoney(myAddress, ethers.utils.parseEther(inputValue.withdraw));
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        totalBalanceHandler();
        customerBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getSharedWalletName();
    getSharedWalletOwnerHandler();
    totalBalanceHandler();
    customerBalanceHandler()
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Shared Wallet Contract Project</span> 💰</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentSharedWalletName === "" && isSharedWalletOwner ?
            <p>"Setup the name of your shared wallet." </p> :
            <p className="text-3xl font-bold">{currentSharedWalletName}</p>
          }
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ETH"
              value={inputValue.deposit}
            />
            <button
              className="btn-purple"
              onClick={deposityMoneyHandler}>Deposit Money In ETH</button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={inputValue.withdraw}
            />
            <button
              className="btn-purple"
              onClick={withDrawMoneyHandler}>
              Withdraw Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Shared Wallet Total Balance: </span>{totalBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Customer Balance: </span>{customerTotalBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Shared Wallet Owner Address: </span>{sharedWalletOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{customerAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isSharedWalletOwner && (
          <section className="shared-wallet-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Shared Wallet Admin Panel</h2>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="sharedWalletName"
                  placeholder="Enter a Name for Your Shared Wallet"
                  value={inputValue.sharedWalletName}
                />
                <button
                  className="btn-grey"
                  onClick={setSharedWalletNameHandler}>
                  Set Shared Wallet Name
                </button>
              </form>
            </div>
          </section>
        )
      }
    </main>
  );
}
export default App;
