// walletConnect.js (Updated)
const CONFIG = {
  DEFAULT_CHAIN_ID: '0x1',
  INITIAL_BALANCE: 100,
  LOCAL_STORAGE_KEY: 'xCIS_Users',
  SESSION_STORAGE_KEY: 'xCIS_Connected'
};

// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.getElementById('notification-container').appendChild(notification);
  setTimeout(() => notification.remove(), 5000);
}

// Initialize Wallet Connection
function initWallet() {
  const connectedAddress = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
  if (connectedAddress) updateUI(connectedAddress);
  setupEventListeners();
}

// Update all UI elements
function updateUI(address = null) {
  const userData = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY)) || {};
  
  // Update wallet info
  document.querySelectorAll('.wallet-address').forEach(el => {
    el.textContent = address ? `Connected: ${address}` : 'Disconnected';
  });
  
  document.querySelectorAll('.wallet-balance').forEach(el => {
    el.textContent = address ? `Balance: ${userData[address]?.balance || 0} xCIS` : '';
  });

  // Update staking page balances
  document.querySelectorAll('.xcis-balance').forEach(el => {
    el.textContent = address ? `${userData[address]?.balance || 0} xCIS` : '0 xCIS';
  });
}

// Modified Connect Wallet Function
async function connectWallet() {
  try {
    if (!window.ethereum) {
      showNotification('Web3 wallet not found', 'error');
      return;
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!(await checkNetwork())) return;

    const address = accounts[0];
    let userData = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY)) || {};

    if (!userData[address]) {
      userData[address] = { balance: CONFIG.INITIAL_BALANCE, stakes: [] };
      localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(userData));
      showNotification(`Welcome! ${CONFIG.INITIAL_BALANCE} xCIS granted`, 'success');
    }

    sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, address);
    updateUI(address);
    showNotification('Wallet connected', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Staking Functionality
function stakeCoins(amount, duration) {
  const address = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
  if (!address) {
    showNotification('Connect wallet first', 'error');
    return false;
  }

  const userData = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY)) || {};
  if (userData[address].balance < amount) {
    showNotification('Insufficient balance', 'error');
    return false;
  }

  // Create stake
  const stake = {
    amount: Number(amount),
    duration: Number(duration),
    startDate: new Date().toISOString(),
    apy: calculateAPY(duration)
  };

  userData[address].balance -= amount;
  userData[address].stakes = userData[address].stakes || [];
  userData[address].stakes.push(stake);
  
  localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(userData));
  updateUI(address);
  showNotification(`${amount} xCIS staked for ${duration} days`, 'success');
  return true;
}

function calculateAPY(duration) {
  const apyRates = { 30: 130, 60: 160, 90: 190, 120: 220 };
  return apyRates[duration] || 0;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initWallet();
  loadStakes();
});

// Load existing stakes
function loadStakes() {
  const address = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
  if (!address) return;

  const userData = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY)) || {};
  const stakes = userData[address]?.stakes || [];
  const container = document.getElementById('stakes-container');
  
  if (container) {
    container.innerHTML = stakes.map((stake, index) => `
      <div class="cyber-list-item">
        <div class="cyber-list-content">
          <i class="fas fa-cube"></i>
          <span>${stake.amount} xCIS - ${stake.duration} Days (APY ${stake.apy}%)</span>
        </div>
        <button class="cyber-button small" onclick="claimStake(${index})">
          <span class="cyber-button-text">CLAIM</span>
        </button>
      </div>
    `).join('');
  }
}

// Claim Stake Function
window.claimStake = (index) => {
  const address = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);
  if (!address) return;

  const userData = JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEY)) || {};
  const stake = userData[address].stakes[index];
  
  if (!stake) {
    showNotification('Stake not found', 'error');
    return;
  }

  const reward = stake.amount * (stake.apy / 100) * (stake.duration / 365);
  userData[address].balance += stake.amount + reward;
  userData[address].stakes.splice(index, 1);
  
  localStorage.setItem(CONFIG.LOCAL_STORAGE_KEY, JSON.stringify(userData));
  loadStakes();
  updateUI(address);
  showNotification(`Claimed ${stake.amount + reward} xCIS`, 'success');
};

// Export functions
window.connectWallet = connectWallet;
window.disconnectWallet = () => {
  sessionStorage.removeItem(CONFIG.SESSION_STORAGE_KEY);
  updateUI();
  showNotification('Wallet disconnected', 'info');
};
window.stakeCoins = stakeCoins;
