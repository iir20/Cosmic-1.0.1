// walletConnect.js

// Function to check if a crypto wallet is available
function isWalletAvailable() {
    return typeof window.ethereum !== 'undefined';
}

// Function to connect to the user's wallet
async function connectWallet() {
    if (!isWalletAvailable()) {
        alert('MetaMask or another crypto wallet is not installed. Please install it to continue.');
        return;
    }

    try {
        // Request wallet connection
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];

        // Check local storage for existing data
        let userData = JSON.parse(localStorage.getItem('xCIS_Users')) || {};
        
        if (!userData[walletAddress]) {
            // If user is new, grant 100 xCIS coins
            userData[walletAddress] = { balance: 100 };
            alert(`Welcome! You have been granted 100 xCIS coins.`);
        } else {
            alert(`Welcome back! Your balance is ${userData[walletAddress].balance} xCIS coins.`);
        }

        // Save user data to local storage
        localStorage.setItem('xCIS_Users', JSON.stringify(userData));

        // Display wallet address and balance
        document.getElementById('walletAddress').textContent = `Connected: ${walletAddress}`;
        document.getElementById('walletBalance').textContent = `Balance: ${userData[walletAddress].balance} xCIS coins`;
    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

// Function to get user balance
function getUserBalance(walletAddress) {
    const userData = JSON.parse(localStorage.getItem('xCIS_Users')) || {};
    return userData[walletAddress]?.balance || 0;
}

// Function to stake coins
function stakeCoins(walletAddress, amount) {
    let userData = JSON.parse(localStorage.getItem('xCIS_Users')) || {};
    
    if (!userData[walletAddress] || userData[walletAddress].balance < amount) {
        alert('Insufficient balance to stake.');
        return false;
    }

    // Deduct staked amount from balance
    userData[walletAddress].balance -= amount;
    localStorage.setItem('xCIS_Users', JSON.stringify(userData));

    alert(`Successfully staked ${amount} xCIS coins. Remaining balance: ${userData[walletAddress].balance} xCIS coins.`);
    return true;
}

// Export functions for use in the HTML
window.connectWallet = connectWallet;
window.stakeCoins = stakeCoins;
