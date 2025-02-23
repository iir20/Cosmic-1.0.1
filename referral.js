class ReferralProgram {
    constructor() {
        this.referrals = {};
        this.init();
    }

    init() {
        document.querySelectorAll('[data-referral]').forEach(btn => {
            btn.addEventListener('click', () => this.generateReferralLink());
        });
    }

    generateReferralLink() {
        const referralCode = this.createReferralCode();
        const referralLink = `${window.location.origin}/?ref=${referralCode}`;
        this.referrals[referralCode] = { referredUsers: [] };
        showNotification(`Your referral link: ${referralLink}`, 'info');
    }

    createReferralCode() {
        return Math.random().toString(36).substring(2, 8);
    }

    trackReferral(referralCode) {
        if (this.referrals[referralCode]) {
            this.referrals[referralCode].referredUsers.push(wallet.currentUser );
            wallet.userData[wallet.currentUser ].xCIS += 50; // Reward for referring
            wallet.saveData();
            showNotification('Referral successful! You earned 50 xCIS!', 'success');
        }
    }
}

const referralProgram = new ReferralProgram();