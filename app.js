// BetSmart App - Main application class
class BetSmartApp {
    async saveDataToFile() {
    const dataToSave = {
        bets: this.bets,
        gameData: this.gameData
    };
    
    // In a real hosted environment, you would need a server-side endpoint to handle this
    // For GitHub Pages, you can't directly save files, but here's the client-side code:
    
    // Create a download link for the user to save the file manually
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToSave, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "bets.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    // Note: For a real implementation, you would need a backend API to save the file
    // This is just a client-side workaround for development
}
    constructor() {
    this.bets = [];
    this.gameData = {};
    this.selectedSport = 'All Sports';
    this.sortBy = 'value';
    this.highValueOnly = false;
    this.ADMIN_PIN = "1009";
    
    // Enhanced path resolution with fallback
    this.DATA_URL = this.resolveDataUrl();
    
    this.init();
}

resolveDataUrl() {
    try {
        if (this.isGitHubPages()) {
            // Manually specify your repo name here:
            return '/aurabetz-1.0/data/bets.json'; 
        }
        return 'data/bets.json';
    } catch (e) {
        console.error('Path resolution error, using fallback', e);
        return 'data/bets.json';
    }
}

isGitHubPages() {
    return window.location.host.includes('github.io');
}
    async saveDataToFile() {
    try {
        // 1. Prepare the data to save
        const dataToSave = {
            bets: this.bets,
            gameData: this.gameData
        };
        
        // 2. Create a download link for the user
        const dataStr = "data:text/json;charset=utf-8," + 
                       encodeURIComponent(JSON.stringify(dataToSave, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "bets.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        console.log("Data prepared for download");
    } catch (error) {
        console.error("Error saving data:", error);
        alert("Error saving data. Check console for details.");
    }
}
getDefaultBets() {
    return [
        {
            id: 1,
            sport: "UFC",
            event: "Jon Jones vs Stipe Miocic",
            time: "2023-11-12T03:00:00Z",
            mainBet: {
                type: "Moneyline",
                pick: "Jon Jones",
                odds: -180,
                probability: 0.75,
                value: 0.25,
                confidence: "High"
            },
            otherBets: [],
            analysis: "Default analysis...",
            aiReasoning: "Default AI reasoning...",
            sportsbooks: [
                { name: "DraftKings", odds: -180 },
                { name: "FanDuel", odds: -175 },
                { name: "BetMGM", odds: -185 }
            ]
        }
    ];
}

getDefaultGameData() {
    return {
        currentDay: 1,
        completedDays: 0,
        startingAmount: 10,
        currentAmount: 10,
        bets: [
            {
                day: 1,
                sport: "UFC",
                event: "Jon Jones vs Stipe Miocic",
                bet: "Jon Jones",
                betType: "Moneyline",
                odds: -180,
                amount: 10,
                potentialProfit: 15,
                completed: false,
                won: null
            }
        ]
    };
}
    init() {
    this.loadData().then(() => {  // Make init wait for loadData
        this.render();
        this.setupEventListeners();
        this.checkDarkMode();
    });
}

    async loadData() {
    try {
        console.log('Attempting to load bets.json...'); // Add this
        const response = await fetch('data/bets.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Loaded data:', data); // Add this
        
        this.bets = data.bets || this.getDefaultBets();
        this.gameData = data.gameData || this.getDefaultGameData();
        
    } catch (error) {
        console.error("Error loading bets.json:", error);
        this.bets = this.getDefaultBets();
        this.gameData = this.getDefaultGameData();

    
    
    } 
    this.render(); // Ensure this is called
}

    render() {
        this.renderBets(this.filterAndSortBets());
    }

    setupEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        }

        // Admin button
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                this.showPinModal();
            });
        }

        // PIN modal events
        const closePinModal = document.getElementById('closePinModal');
        const pinModal = document.getElementById('pinModal');
        const submitPinBtn = document.getElementById('submitPinBtn');

        if (closePinModal && pinModal && submitPinBtn) {
            closePinModal.addEventListener('click', () => this.hidePinModal());
            pinModal.addEventListener('click', (e) => {
                if (e.target === pinModal) {
                    this.hidePinModal();
                }
            });
            submitPinBtn.addEventListener('click', () => this.verifyPin());
            
            // Allow submitting with Enter key
            document.getElementById('pinInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.verifyPin();
                }
            });
        }

        // Sport tabs
        const sportTabs = document.querySelectorAll('.tab');
        sportTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.selectedSport = e.target.getAttribute('data-sport');
                this.updateActiveSportTab();
                this.renderBets(this.filterAndSortBets());
            });
        });

        // Sort dropdown
        const sortOptions = document.getElementById('sortOptions');
        if (sortOptions) {
            sortOptions.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.renderBets(this.filterAndSortBets());
            });
        }

        // High value checkbox
        const highValueOnly = document.getElementById('highValueOnly');
        if (highValueOnly) {
            highValueOnly.addEventListener('change', (e) => {
                this.highValueOnly = e.target.checked;
                this.renderBets(this.filterAndSortBets());
            });
        }

        // Modal events
        const closeModal = document.getElementById('closeModal');
        const detailModal = document.getElementById('detailModal');
        if (closeModal && detailModal) {
            closeModal.addEventListener('click', () => this.hideDetailModal());
            detailModal.addEventListener('click', (e) => {
                if (e.target === detailModal) {
                    this.hideDetailModal();
                }
            });
        }

        // The Game button and modal
        const theGameBtn = document.getElementById('theGameBtn');
        const closeGameModal = document.getElementById('closeGameModal');
        const gameModal = document.getElementById('gameModal');
        
        if (theGameBtn && closeGameModal && gameModal) {
            theGameBtn.addEventListener('click', () => {
                this.showGameModal();
                this.updateGameProgress();
            });
            
            closeGameModal.addEventListener('click', () => this.hideGameModal());
            gameModal.addEventListener('click', (e) => {
                if (e.target === gameModal) {
                    this.hideGameModal();
                }
            });
        }

        // Admin modal events
        const closeAdminModal = document.getElementById('closeAdminModal');
        const adminModal = document.getElementById('adminModal');
        
        if (closeAdminModal && adminModal) {
            closeAdminModal.addEventListener('click', () => this.hideAdminModal());
            adminModal.addEventListener('click', (e) => {
                if (e.target === adminModal) {
                    this.hideAdminModal();
                }
            });
        }

        // Edit bet modal events
        const closeEditBetModal = document.getElementById('closeEditBetModal');
        const editBetModal = document.getElementById('editBetModal');
        
        if (closeEditBetModal && editBetModal) {
            closeEditBetModal.addEventListener('click', () => this.hideEditBetModal());
            editBetModal.addEventListener('click', (e) => {
                if (e.target === editBetModal) {
                    this.hideEditBetModal();
                }
            });
        }

        // Admin buttons
        const addBetBtn = document.getElementById('addBetBtn');
        if (addBetBtn) {
            addBetBtn.addEventListener('click', () => this.showAddBetModal());
        }

        const saveBetBtn = document.getElementById('saveBetBtn');
        if (saveBetBtn) {
            saveBetBtn.addEventListener('click', () => this.saveBet());
        }

        const deleteBetBtn = document.getElementById('deleteBetBtn');
        if (deleteBetBtn) {
            deleteBetBtn.addEventListener('click', () => this.deleteBet());
        }

        // For demo: Add click events to diamonds to simulate progress
        const diamonds = document.querySelectorAll('.diamond');
        diamonds.forEach(diamond => {
            diamond.addEventListener('click', (e) => {
                const day = parseInt(e.currentTarget.getAttribute('data-day'));
                if (day === this.gameData.currentDay) {
                    this.completeCurrentDay(true);
                }
            });
        });
    }

    showPinModal() {
        const pinModal = document.getElementById('pinModal');
        if (pinModal) {
            pinModal.classList.add('active');
            document.getElementById('pinInput').value = '';
            document.getElementById('pinError').style.display = 'none';
            document.getElementById('pinInput').focus();
        }
    }

    hidePinModal() {
        const pinModal = document.getElementById('pinModal');
        if (pinModal) {
            pinModal.classList.remove('active');
        }
    }

    verifyPin() {
        const pinInput = document.getElementById('pinInput');
        const pinError = document.getElementById('pinError');
        
        if (pinInput.value === this.ADMIN_PIN) {
            this.hidePinModal();
            this.showAdminModal();
            this.renderAdminBetsList();
        } else {
            pinError.style.display = 'block';
            pinInput.value = '';
            pinInput.focus();
        }
    }

    showAdminModal() {
        const adminModal = document.getElementById('adminModal');
        if (adminModal) {
            adminModal.classList.add('active');
        }
    }

    hideAdminModal() {
        const adminModal = document.getElementById('adminModal');
        if (adminModal) {
            adminModal.classList.remove('active');
        }
    }

    showEditBetModal(betId) {
        const bet = this.bets.find(b => b.id === betId);
        const isNew = !bet;
        
        const editBetModal = document.getElementById('editBetModal');
        const editBetModalTitle = document.getElementById('editBetModalTitle');
        
        if (editBetModal && editBetModalTitle) {
            editBetModalTitle.textContent = isNew ? 'Add New Bet' : `Edit Bet #${betId}`;
            
            // Fill form with bet data or empty for new bet
            document.getElementById('editBetId').value = betId || '';
            document.getElementById('editSport').value = bet?.sport || 'UFC';
            document.getElementById('editEvent').value = bet?.event || '';
            document.getElementById('editTime').value = bet?.time || '';
            
            // Main bet fields
            document.getElementById('editMainBetType').value = bet?.mainBet?.type || '';
            document.getElementById('editMainBetPick').value = bet?.mainBet?.pick || '';
            document.getElementById('editMainBetOdds').value = bet?.mainBet?.odds || '';
            document.getElementById('editMainBetProbability').value = bet?.mainBet?.probability || '';
            document.getElementById('editMainBetValue').value = bet?.mainBet?.value || '';
            document.getElementById('editMainBetConfidence').value = bet?.mainBet?.confidence || 'High';
            
            // Analysis fields
            document.getElementById('editAnalysis').value = bet?.analysis || '';
            document.getElementById('editAiReasoning').value = bet?.aiReasoning || '';
            
            editBetModal.classList.add('active');
        }
    }

    hideEditBetModal() {
        const editBetModal = document.getElementById('editBetModal');
        if (editBetModal) {
            editBetModal.classList.remove('active');
        }
    }

    showAddBetModal() {
        // Generate a new ID for the bet
        const newId = this.bets.length > 0 ? Math.max(...this.bets.map(b => b.id)) + 1 : 1;
        this.showEditBetModal(newId);
    }

    renderAdminBetsList() {
        const adminBetsList = document.getElementById('adminBetsList');
        if (!adminBetsList) return;
        
        adminBetsList.innerHTML = '';
        
        if (this.bets.length === 0) {
            adminBetsList.innerHTML = '<div class="no-bets">No bets found</div>';
            return;
        }
        
        this.bets.forEach(bet => {
            const betItem = document.createElement('div');
            betItem.className = 'admin-bet-item';
            betItem.innerHTML = `
                <div class="admin-bet-info">
                    <span class="admin-bet-sport">${bet.sport}</span>
                    <h4 class="admin-bet-event">${bet.event}</h4>
                    <span class="admin-bet-time">${this.formatDate(bet.time)}</span>
                </div>
                <div class="admin-bet-actions">
                    <button class="btn btn-primary edit-bet-btn" data-bet-id="${bet.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            `;
            adminBetsList.appendChild(betItem);
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-bet-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const betId = parseInt(e.currentTarget.getAttribute('data-bet-id'));
                this.showEditBetModal(betId);
            });
        });
    }

    saveBet() {
    // 1. Get the bet ID and check if it's a new bet
    const betId = parseInt(document.getElementById('editBetId').value) || 0;
    const isNew = !this.bets.some(b => b.id === betId);
    
    // 2. Collect all the form data
    const betData = {
        id: betId,
        sport: document.getElementById('editSport').value,
        event: document.getElementById('editEvent').value,
        time: document.getElementById('editTime').value,
        mainBet: {
            type: document.getElementById('editMainBetType').value,
            pick: document.getElementById('editMainBetPick').value,
            odds: parseFloat(document.getElementById('editMainBetOdds').value),
            probability: parseFloat(document.getElementById('editMainBetProbability').value),
            value: parseFloat(document.getElementById('editMainBetValue').value),
            confidence: document.getElementById('editMainBetConfidence').value
        },
        otherBets: [], // Can be extended to edit these as well
        analysis: document.getElementById('editAnalysis').value,
        aiReasoning: document.getElementById('editAiReasoning').value,
        sportsbooks: [
            { name: "DraftKings", odds: parseFloat(document.getElementById('editMainBetOdds').value) },
            { name: "FanDuel", odds: parseFloat(document.getElementById('editMainBetOdds').value) + 5 },
            { name: "BetMGM", odds: parseFloat(document.getElementById('editMainBetOdds').value) - 5 }
        ]
    };
    
    // 3. Update the bets array
    if (isNew) {
        this.bets.push(betData);
    } else {
        const index = this.bets.findIndex(b => b.id === betId);
        if (index !== -1) {
            this.bets[index] = betData;
        }
    }
    
    // 4. Close the modal and refresh the UI
    this.hideEditBetModal();
    this.renderAdminBetsList();
    this.renderBets(this.filterAndSortBets());
    
    // 5. NEW: Save to JSON file
    this.saveDataToFile();
    
    // 6. Show success message
    alert(`Bet ${isNew ? 'added' : 'updated'} successfully! Data saved to JSON.`);
}

    deleteBet() {
        const betId = parseInt(document.getElementById('editBetId').value);
        if (!betId) return;
        
        if (confirm('Are you sure you want to delete this bet?')) {
            this.bets = this.bets.filter(b => b.id !== betId);
            this.hideEditBetModal();
            this.renderAdminBetsList();
            this.renderBets(this.filterAndSortBets());
            alert('Bet deleted successfully!');
        }
    }

    filterAndSortBets() {
        let filteredBets = [...this.bets];
        
        // Filter by sport
        if (this.selectedSport !== 'All Sports') {
            filteredBets = filteredBets.filter(bet => bet.sport === this.selectedSport);
        }
        
        // Filter by value
        if (this.highValueOnly) {
            filteredBets = filteredBets.filter(bet => bet.mainBet.value >= 0.20);
        }
        
        // Sort the bets
        switch(this.sortBy) {
            case 'value':
                filteredBets.sort((a, b) => b.mainBet.value - a.mainBet.value);
                break;
            case 'odds':
                filteredBets.sort((a, b) => a.mainBet.odds - b.mainBet.odds);
                break;
            case 'confidence':
                const confidenceMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
                filteredBets.sort((a, b) => confidenceMap[b.mainBet.confidence] - confidenceMap[a.mainBet.confidence]);
                break;
            case 'time':
                filteredBets.sort((a, b) => new Date(a.time) - new Date(b.time));
                break;
        }
        
        return filteredBets;
    }

    renderBets(betsToRender) {
        const container = document.getElementById('betsContainer');
        if (!container) return;
        
        container.innerHTML = '';

        if (betsToRender.length === 0) {
            container.innerHTML = '<div class="no-results">No betting opportunities match your current filters.</div>';
            return;
        }

        betsToRender.forEach(bet => {
            const card = this.createBetCard(bet);
            container.appendChild(card);
        });

        // Add event listeners to the entire bet cards
        document.querySelectorAll('.bet-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const betId = parseInt(card.getAttribute('data-bet-id'));
                this.showDetailModal(betId);
            });
        });
    }

    createBetCard(bet) {
        const valueClass = this.getValueClass(bet.mainBet.value);
        const confidenceBadgeClass = this.getConfidenceBadgeClass(bet.mainBet.confidence);
        
        const card = document.createElement('div');
        card.className = 'bet-card';
        card.setAttribute('data-bet-id', bet.id);
        
        card.innerHTML = `
            <div class="bet-card-content">
                <div class="bet-info-icon">
                    <i class="fas fa-info-circle text-primary"></i>
                </div>
                <div class="bet-header">
                    <span class="bet-sport">${bet.sport}</span>
                    <span class="bet-time">${this.formatDate(bet.time)}</span>
                </div>
                <h3 class="bet-title">${bet.event}</h3>
                <div class="bet-main">
                    <div class="bet-type-row">
                        <span class="bet-type">${bet.mainBet.type}</span>
                        <span class="bet-value ${valueClass}">Value: ${(bet.mainBet.value * 100).toFixed(0)}%</span>
                    </div>
                    <div class="bet-selection-row">
                        <div class="bet-pick-container">
                            <div class="bet-pick">${bet.mainBet.pick}</div>
                            <div class="bet-odds ${valueClass}">${this.formatAmericanOdds(bet.mainBet.odds)}</div>
                        </div>
                        <span class="confidence-badge ${confidenceBadgeClass}">${bet.mainBet.confidence} Confidence</span>
                    </div>
                </div>
                <div class="bet-footer">
                    <span class="best-odds">Best Odds: ${this.formatAmericanOdds(Math.max(...bet.sportsbooks.map(sb => sb.odds)))}</span>
                    <span class="view-analysis">View Analysis</span>
                </div>
            </div>
        `;
        
        return card;
    }

    updateActiveSportTab() {
        const sportTabs = document.querySelectorAll('.tab');
        sportTabs.forEach(tab => {
            const sport = tab.getAttribute('data-sport');
            
            // Remove active class from all tabs
            tab.classList.remove('tab-active');
            tab.classList.add('tab-inactive');
            
            // Add active class to selected tab
            if (sport === this.selectedSport) {
                tab.classList.remove('tab-inactive');
                tab.classList.add('tab-active');
            }
        });
    }

    showDetailModal(betId) {
        const bet = this.bets.find(b => b.id === betId);
        if (!bet) return;

        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        if (!modalTitle || !modalContent) return;
        
        modalTitle.textContent = bet.event;
        
        const sportsBookComparison = bet.sportsbooks.map(sb => 
            `<div class="odds-comparison-row">
                <span>${sb.name}</span>
                <span class="odds-value">${this.formatAmericanOdds(sb.odds)}</span>
            </div>`
        ).join('');

        const otherBetsHtml = bet.otherBets.map(ob => 
            `<div class="other-bet-row">
                <div class="other-bet-info">
                    <span class="other-bet-type">${ob.type}: ${ob.pick}</span>
                    <span class="other-bet-odds">${this.formatAmericanOdds(ob.odds)}</span>
                </div>
                <div class="other-bet-value ${this.getValueClass(ob.value)}">Value: ${(ob.value * 100).toFixed(0)}%</div>
            </div>`
        ).join('');

        const confidenceBadgeClass = this.getConfidenceBadgeClass(bet.mainBet.confidence);

        modalContent.innerHTML = `
            <div class="modal-section">
                <div class="modal-header-row">
                    <div class="bet-meta">
                        <span class="modal-sport">${bet.sport}</span>
                        <span class="modal-time">${this.formatDate(bet.time)}</span>
                    </div>
                    <span class="modal-confidence ${confidenceBadgeClass}">${bet.mainBet.confidence} Confidence</span>
                </div>
                
                <div class="main-bet-highlight">
                    <div class="bet-meta-row">
                        <span class="bet-type-label">${bet.mainBet.type}</span>
                        <span class="value-badge ${this.getValueClass(bet.mainBet.value)}">Value: ${(bet.mainBet.value * 100).toFixed(0)}%</span>
                    </div>
                    <div class="bet-selection-row">
                        <div class="bet-pick">${bet.mainBet.pick}</div>
                        <div class="bet-odds ${this.getValueClass(bet.mainBet.value)}">${this.formatAmericanOdds(bet.mainBet.odds)}</div>
                    </div>
                    <div class="implied-prob">
                        Implied Probability: ${(bet.mainBet.probability * 100).toFixed(0)}%
                    </div>
                </div>
            </div>

            <div class="modal-grid">
                <div class="modal-column">
                    <h3 class="modal-subtitle">Other Opportunities</h3>
                    <div class="other-bets-container">
                        ${otherBetsHtml || '<p class="no-other-bets">No additional bets available</p>'}
                    </div>
                </div>
                
                <div class="modal-column">
                    <h3 class="modal-subtitle">Odds Comparison</h3>
                    <div class="odds-comparison-container">
                        ${sportsBookComparison}
                    </div>
                </div>
            </div>
            
            <div class="modal-section">
                <h3 class="modal-subtitle">Summary</h3>
                <div class="analysis-container">
                    <p>${bet.analysis}</p>
                </div>
            </div>
            
            <div class="modal-section">
                <h3 class="modal-subtitle ai-title">
                    <i class="fas fa-brain text-primary"></i>
                    AI Analysis
                </h3>
                <div class="ai-analysis-container">
                    <p>${bet.aiReasoning}</p>
                </div>
            </div>
        `;
        
        const detailModal = document.getElementById('detailModal');
        if (detailModal) {
            detailModal.classList.add('active');
        }
    }

    hideDetailModal() {
        const detailModal = document.getElementById('detailModal');
        if (detailModal) {
            detailModal.classList.remove('active');
        }
    }

    showGameModal() {
        const gameModal = document.getElementById('gameModal');
        if (gameModal) {
            gameModal.classList.add('active');
        }
    }

    hideGameModal() {
        const gameModal = document.getElementById('gameModal');
        if (gameModal) {
            gameModal.classList.remove('active');
        }
    }

    updateGameProgress() {
        document.querySelectorAll('.diamond').forEach(diamond => {
            const day = parseInt(diamond.getAttribute('data-day'));
            
            // Reset styling
            diamond.style.backgroundColor = '';
            diamond.querySelector('span').style.color = '';
            
            if (day < this.gameData.currentDay) {
                // Completed days
                diamond.style.backgroundColor = 'var(--secondary)';
                diamond.querySelector('span').style.color = 'var(--white)';
            } else if (day === this.gameData.currentDay) {
                // Current day
                diamond.style.backgroundColor = 'var(--primary)';
                diamond.querySelector('span').style.color = 'var(--white)';
            } else {
                // Future days
                diamond.style.backgroundColor = 'var(--gray-200)';
                diamond.querySelector('span').style.color = 'var(--gray-700)';
                
                if (document.body.classList.contains('dark')) {
                    diamond.style.backgroundColor = 'var(--gray-700)';
                    diamond.querySelector('span').style.color = 'var(--gray-300)';
                }
            }
        });
    }

    completeCurrentDay(won = true) {
        const currentBet = this.gameData.bets.find(bet => bet.day === this.gameData.currentDay);
        
        if (currentBet && !currentBet.completed) {
            currentBet.completed = true;
            currentBet.won = won;
            
            if (won) {
                // If won, update current amount
                this.gameData.currentAmount += currentBet.potentialProfit;
                this.gameData.completedDays++;
                
                // Prepare for next day
                this.gameData.currentDay++;
                
                // Light up the diamond
                const diamond = document.querySelector(`.diamond[data-day="${this.gameData.currentDay - 1}"]`);
                if (diamond) {
                    diamond.classList.add('diamond-pulse');
                    setTimeout(() => {
                        diamond.classList.remove('diamond-pulse');
                    }, 1500);
                }
                
                // Add next day's bet if we haven't reached day 9
                if (this.gameData.currentDay <= 9) {
                    this.gameData.bets.push({
                        day: this.gameData.currentDay,
                        sport: ['NHL', 'NBA', 'UFC', 'Soccer', 'Table Tennis'][Math.floor(Math.random() * 5)],
                        event: "Next Game TBD",
                        bet: "TBD",
                        betType: "TBD",
                        odds: +130,
                        amount: this.gameData.currentAmount,
                        potentialProfit: (this.gameData.currentAmount * 1.3).toFixed(2),
                        completed: false,
                        won: null
                    });
                }
            } else {
                // If lost, game is over
                alert("Sorry! You lost today's bet. The Game is over. You can restart from Day 1.");
                this.resetGame();
            }
            
            // Update the UI
            this.updateGameProgress();
        }
    }

    resetGame() {
        this.gameData.currentDay = 1;
        this.gameData.completedDays = 0;
        this.gameData.currentAmount = this.gameData.startingAmount;
        
        // Reset bets
        this.gameData.bets = [{
            day: 1,
            sport: "UFC",
            event: "Jon Jones vs Stipe Miocic",
            bet: "Jon Jones",
            betType: "Moneyline",
            odds: -180,
            amount: 10,
            potentialProfit: 15,
            completed: false,
            won: null
        }];
        
        // Update UI
        this.updateGameProgress();
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark');
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            const moonIcon = darkModeToggle.querySelector('.fa-moon');
            const sunIcon = darkModeToggle.querySelector('.fa-sun');
            
            moonIcon.classList.toggle('hidden');
            sunIcon.classList.toggle('hidden');
        }
    }

    checkDarkMode() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark');
            const darkModeToggle = document.getElementById('darkModeToggle');
            if (darkModeToggle) {
                const moonIcon = darkModeToggle.querySelector('.fa-moon');
                const sunIcon = darkModeToggle.querySelector('.fa-sun');
                
                moonIcon.classList.add('hidden');
                sunIcon.classList.remove('hidden');
            }
        }
        
        // Listen for changes in preferred color scheme
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        });
    }

    formatAmericanOdds(odds) {
        return odds > 0 ? `+${odds}` : odds;
    }

    getValueClass(value) {
        if (value >= 0.25) return "value-high";
        if (value >= 0.15) return "value-medium";
        return "value-low";
    }

    getConfidenceBadgeClass(confidence) {
        switch (confidence) {
            case "High": return "confidence-high";
            case "Medium": return "confidence-medium";
            default: return "confidence-low";
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true
        });
    }
}
// ===== Email Signup Functionality =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize email signup
    const emailInput = document.getElementById('emailInput');
    const submitEmailBtn = document.getElementById('submitEmailBtn');
    
    if (submitEmailBtn) {
        submitEmailBtn.addEventListener('click', submitEmail);
    }
    
    if (emailInput) {
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') submitEmail();
        });
    }
    
    // Show modal on page load
    setTimeout(() => {
        const emailModal = document.getElementById('emailSignupModal');
        if (emailModal) emailModal.style.display = 'block';
    }, 1000);
});

function submitEmail() {
    const email = document.getElementById('emailInput').value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("betSmartEmails") || "[]");
    if (!existing.includes(email)) {
        existing.push(email);
        localStorage.setItem("betSmartEmails", JSON.stringify(existing));
    }
    
    alert('Thank you! Check your email for access.');
    document.getElementById('emailInput').value = '';
    
    // Close modal
    const modal = document.getElementById('emailSignupModal');
    if (modal) modal.style.display = 'none';
}
// Initialize the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new BetSmartApp();
});
