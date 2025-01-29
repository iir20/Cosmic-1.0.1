// walletConnect.js

// UI Elements
const notificationContainer = document.createElement('div');
notificationContainer.id = 'notification-container';
document.body.appendChild(notificationContainer);

// Wallet Configuration
const CONFIG = {
  DEFAULT_CHAIN_ID: '0x1', // Ethereum Mainnet
  INITIAL_BALANCE: 100,
  LOCAL_STORAGE_KEY: 'xCIS_Users',
  SESSION_STORAGE_KEY: 'xCIS_Connected'
};

// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notificationContainer.appendChild(notification);
  
  setTimeout(() => notification.remove(), 5000);
}

// Provider Check
function isWalletAvailable() {
  return typeof window.ethereum !== 'undefined';
}

// Network Management
async function checkNetwork() {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    if (chainId !== CONFIG.DEFAULT_CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CONFIG.DEFAULT_CHAIN_ID }]
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          showNotification('Please add the Ethereum Mainnet to your wallet', 'error');
        }
        throw new Error('Network switch rejected');
      }
    }
    return true;
  } catch (error) {
    console.error('Network check failed:', error);
    showNotification(`Network error: ${error.message}`, 'error');
    return false;
  }
}

// User Data Management
function getUserData() {
  return JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY)) || {};
}

function updateUserData(address, data) {
  const userData = getUserData();
  userData[address] = { ...userData[address], ...data };
  localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(userData));
  return userData[address];
}

// Connection Management
async function connectWallet() {
  if (!isWalletAvailable()) {
    showNotification('Please install a Web3 wallet like MetaMask', 'error');
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!(await checkNetwork())) return;

    const walletAddress = accounts[0];
    const userData = getUserData();

    if (!userData[walletAddress]) {
      updateUserData(walletAddress, { balance: CONFIG.INITIAL_BALANCE });
      showNotification(`Welcome! ${CONFIG.INITIAL_BALANCE} xCIS granted`, 'success');
    }

    sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, walletAddress);
    setupEventListeners();
    updateUI(walletAddress);
    showNotification('Wallet connected successfully', 'success');
  } catch (error) {
    handleConnectionError(error);
  }
}

function disconnectWallet() {
  sessionStorage.removeItem(CONFIG.SESSION_STORAGE_KEY);
  window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
  window.ethereum?.removeListener('chainChanged', handleChainChanged);
  updateUI();
  showNotification('Wallet disconnected', 'info');
}

// Event Handlers
function handleConnectionError(error) {
  console.error('Wallet connection error:', error);
  const message = error.code === 4001 ? 'Connection rejected' : 'Connection failed';
  showNotification(message, 'error');
}

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) disconnectWallet();
  else updateUI(accounts[0]);
}

function handleChainChanged(chainId) {
  if (chainId !== CONFIG.DEFAULT_CHAIN_ID) {
    showNotification('Network changed - please reconnect', 'warning');
    disconnectWallet();
  }
}

function setupEventListeners() {
  window.ethereum?.on('accountsChanged', handleAccountsChanged);
  window.ethereum?.on('chainChanged', handleChainChanged);
}

// UI Updates
function updateUI(address = null) {
  const walletAddressElement = document.getElementById('walletAddress');
  const walletBalanceElement = document.getElementById('walletBalance');
  
  if (address) {
    const { balance } = getUserData()[address] || {};
    walletAddressElement.textContent = `Connected: ${address}`;
    walletBalanceElement.textContent = `Balance: ${balance} xCIS`;
  } else {
    walletAddressElement.textContent = 'Disconnected';
    walletBalanceElement.textContent = '';
  }
}

// Transaction Functions
function stakeCoins(amount) {
  const walletAddress = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
  if (!walletAddress) {
    showNotification('Please connect wallet first', 'error');
    return false;
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    showNotification('Invalid staking amount', 'error');
    return false;
  }

  const userData = getUserData();
  if ((userData[walletAddress]?.balance || 0) < numericAmount) {
    showNotification('Insufficient balance', 'error');
    return false;
  }

  const newBalance = updateUserData(walletAddress, {
    balance: (userData[walletAddress].balance - numericAmount)
  }).balance;

  updateUI(walletAddress);
  showNotification(`Staked ${numericAmount} xCIS. New balance: ${newBalance}`, 'success');
  return true;
}

// Initialize connection on page load
(function init() {
  if (isWalletAvailable()) {
    const connectedAddress = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
    if (connectedAddress) updateUI(connectedAddress);
    setupEventListeners();
  }
})();

// Export public functions
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.stakeCoins = stakeCoins;
