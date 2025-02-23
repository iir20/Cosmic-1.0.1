class CosmicWallet {
    constructor() {
        this.userData = JSON.parse(localStorage.getItem('cosmicUser  ')) || {};
        this.nftImages = Array.from({length: 50}, (_, i) => `images/nft${i+1}.png`);
        this.stakingRate = 0.8; // xCIS per hour per NFT
        this.init();
        setInterval(() => this.updateStakingRewards(), 1000);
    }

    init() {
        document.querySelectorAll('[data-wallet]').forEach(btn => {
            btn.addEventListener('click', () => this.connectWallet());
        });
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        if (this.currentUser  ) this.loadNFTs();
    }

    async connectWallet() {
        try {
            if (!window.ethereum) throw new Error('No crypto wallet found');
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            this.currentUser   = accounts[0];
            if (!this.userData[this.currentUser  ]) this.createNewUser  ();
            this.loadNFTs();
            this.updateUI();
            this.showNotification('Wallet connected successfully!', 'success');
        } catch (error) {
            this.showError(error.message);
        }
    }

    createNewUser  () {
        this.userData[this.currentUser  ] = {
            xCIS: 1000,
            CIS: 0,
            stakedNFTs: [],
            ownedNFTs: Array.from({length: 50}, (_, i) => i)
        };
        this.saveData();
    }

    loadNFTs() {
        const nftGrid = document.getElementById('nftGrid');
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'block'; // Show loading spinner
        nftGrid.innerHTML = ''; // Clear previous NFTs

        // Simulate fetching NFTs with a timeout
        setTimeout(() => {
            nftGrid.innerHTML = this.userData[this.currentUser  ].ownedNFTs.map(i => `
                <div class="nft-item cyber-card ${this.isStaked(i) ? 'staked' : ''}">
                    <img src="${this.nftImages[i]}" class="nft-image">
                    <div class="nft-info">
                        <h3 class="glitch-text" data-text="ARTIFACT #${i+1}">ARTIFACT #${i+1}</h3>
                        <div class="staking-controls">
                            <div class="earnings-display" data-nft="${i}">EARNED: 0 xCIS</div>
                            <button class="cyber-stake-btn" onclick="wallet.toggleStake(${i})">
                                ${this.isStaked(i) ? 'UNSTAKE' : 'STAKE'}
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            loadingSpinner.style.display = 'none'; // Hide loading spinner
        }, 2000); // Simulate a 2-second loading time
    }

    toggleStake(nftId) {
        const stakedNFTs = this.userData[this.currentUser  ].stakedNFTs;
        const index = stakedNFTs.findIndex(nft => nft.id === nftId);
        
        if (index === -1) {
            stakedNFTs.push({ id: nftId, stakedAt: Date.now(), lastClaimed: Date.now() });
            this.showNotification(`NFT #${nftId + 1} staked successfully!`, 'success');
        } else {
            this.claimRewards(nftId);
            stakedNFTs.splice(index, 1);
            this.showNotification(`NFT #${nftId + 1} unstaked successfully!`, 'success');
        }
        this.saveData();
        this.loadNFTs();
    }

    claimRewards(nftId) {
        const earnings = this.calculateEarnings(nftId);
        this.userData[this.currentUser  ].xCIS += earnings;
        this.updateStakedNFT(nftId);
        this.updateUI();
    }

    calculateEarnings(nftId) {
        const nft = this.userData[this.currentUser  ].stakedNFTs.find(n => n.id === nftId);
        if (!nft) return 0;
        const hoursStaked = (Date.now() - nft.lastClaimed) / 3.6e6;
        return +(hoursStaked * this.stakingRate).toFixed(2);
    }

    updateStakedNFT(nftId) {
        this.userData[this.currentUser  ].stakedNFTs = this.userData[this.currentUser  ].stakedNFTs.map(nft => {
            if (nft.id === nftId) nft.lastClaimed = Date.now();
            return nft;
        });
        this.saveData();
    }

    updateStakingRewards() {
        this.userData[this.currentUser  ]?.stakedNFTs?.forEach(nft => {
            const display = document.querySelector(`[data-nft="${nft.id}"]`);
            if (display) display.textContent = `EARNED: ${this.calculateEarnings(nft.id)} xCIS`;
        });
    }

    isStaked(nftId) {
        return this.userData[this.currentUser  ]?.stakedNFTs?.some(n => n.id === nftId);
    }

    updateUI() {
        document.querySelectorAll('[data-balance]').forEach(el => {
            el.textContent = `${el.dataset.balance}: ${this.userData[this.currentUser  ][el.dataset.balance]}`;
        });
    }

    saveData() {
        localStorage.setItem('cosmicUser  ', JSON.stringify(this.userData));
    }

    showError(message) {
        const errorBox = document.createElement('div');
        errorBox.className = 'cyber-error';
        errorBox.innerHTML = `<span class="glitch-text" data-text="${message}">${message}</span>`;
        document.body.appendChild(errorBox);
        setTimeout(() => errorBox.remove(), 5000);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'cyber') {
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        } else {
            document.documentElement.setAttribute('data-theme', 'cyber');
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        }
    }
}

const wallet = new CosmicWallet();