// Cosmic Protocol Core Functionality
const Cosmic = {
  // [Include all JavaScript from previous cosmic.js example here]
  // Add additional functions for NFT and staking
  stakeTokens: function(amount, duration) {
    const session = JSON.parse(sessionStorage.getItem(this.config.sessionKey));
    if (!session) return false;
    
    const userData = this.getUserData(session.address);
    if (userData.xCIS < amount) {
      showNotification('Insufficient balance', 'error');
      return false;
    }

    userData.xCIS -= amount;
    userData.stakes.push({
      amount,
      duration,
      start: Date.now(),
      apy: this.calculateAPY(duration)
    });
    
    localStorage.setItem(this.config.localStorageKey, JSON.stringify(userData));
    this.updateUI(session.address);
    return true;
  },

  calculateAPY: function(duration) {
    const rates = {30: 130, 60: 160, 90: 190, 120: 220};
    return rates[duration] || 100;
  }
};

// [Include rest of the cosmic.js implementation from previous example]