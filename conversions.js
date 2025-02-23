function convertTokens() {
    const amount = document.getElementById('xcisAmount').value;
    const conversionRate = 0.85; // Example conversion rate
    const equivalentCIS = (amount * conversionRate).toFixed(2);
    
    const conversionRateDisplay = document.querySelector('.conversion-rate');
    conversionRateDisplay.textContent = `Converted: ${equivalentCIS} CIS`;
    
    // Update user balance
    const userAddress = wallet.currentUser  ;
    if (userAddress) {
        wallet.userData[userAddress].xCIS -= amount;
        wallet.userData[userAddress].CIS += equivalentCIS;
        wallet.saveData();
        wallet.updateUI();
        showNotification('Conversion successful!', 'success');
    }
}