// BetSmart Admin App - Complete Management System
class BetSmartApp {
    constructor() {
        this.bets = [];
        this.gameData = {};
        this.selectedSport = 'All Sports';
        this.sortBy = 'value';
        this.highValueOnly = false;
        this.ADMIN_PIN = "1009";
        this.DATA_URL = this.resolveDataUrl();
        
        this.init();
    }

    // Improved path resolution
    resolveDataUrl() {
        try {
            // For local development
            if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
                return 'data/bets.json';
            }
            // For GitHub Pages
            if (this.isGitHubPages()) {
                return '/aurabetz-1.0/data/bets.json';
            }
            // Default fallback
            return 'data/bets.json';
        } catch (e) {
            console.error('Path resolution error:', e);
            return 'data/bets.json';
        }
    }

    isGitHubPages() {
        return window.location.host.includes('github.io');
    }

    // Initialize the application
    async init() {
        await this.loadData();
        this.render();
        this.setupEventListeners();
        this.checkDarkMode();
    }

    // Improved data loading with better validation
    async loadData() {
        try {
            console.log('Loading data from:', this.DATA_URL);
            const response = await fetch(this.DATA_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Validate data structure
            if (!data.bets || !Array.isArray(data.bets)) {
                throw new Error("Invalid data structure: bets array missing");
            }
            
            // Improved validation for each bet
            this.bets = data.bets.filter(bet => {
                return typeof bet.id === 'number' &&  // Check ID is a number
                       bet.event && 
                       bet.event.trim() !== "" &&
                       bet.mainBet && 
                       bet.mainBet.pick
            });
            
            // Validate game data
            this.gameData = data.gameData || this.getDefaultGameData();
            
            console.log('Data loaded successfully');
        } catch (error) {
            console.error("Data load failed:", error);
            this.bets = this.getDefaultBets();
            this.gameData = this.getDefaultGameData();
            alert("Warning: Using default data due to load error");
        }
        
        this.render();
    }

    // Default data templates
    getDefaultBets() {
        return [
            {
                id: 1,  // Changed from 0 to 1
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

    // Save data to JSON file
    async saveDataToFile() {
        try {
            const dataToSave = {
                bets: this.bets,
                gameData: this.gameData,
                _metadata: {
                    savedAt: new Date().toISOString(),
                    version: "2.0"
                }
            };
            
            // Validate before saving
            if (!dataToSave.bets || !dataToSave.gameData) {
                throw new Error("Invalid data structure");
            }
            
            const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bets.json';
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            console.log("Data saved successfully");
            return true;
        } catch (error) {
            console.error("Save failed:", error);
            alert(`Save failed: ${error.message}`);
            return false;
        }
    }

    // Create a backup file
    async backupData() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupData = {
                bets: this.bets,
                gameData: this.gameData,
                _backupTime: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(backupData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bets_backup_${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            console.log("Backup created successfully");
            return true;
        } catch (error) {
            console.error("Backup failed:", error);
            alert("Failed to create backup");
            return false;
        }
    }

    // Import data from file
    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate imported data
                if (!data.bets || !Array.isArray(data.bets)) {
                    throw new Error("Invalid file format: bets array missing");
                }
                
                // Improved validation for each bet
                const validBets = data.bets.filter(bet => {
                    return typeof bet.id === 'number' &&  // Check ID is a number
                           bet.event && 
                           bet.event.trim() !== "" &&
                           bet.mainBet && 
                           bet.mainBet.pick
                });
                
                if (validBets.length === 0) {
                    throw new Error("No valid bets found in file");
                }
                
                this.bets = validBets;
                this.gameData = data.gameData || this.getDefaultGameData();
                
                // Reset file input
                event.target.value = '';
                
                this.render();
                alert(`Successfully imported ${validBets.length} bets`);
            } catch (error) {
                console.error("Import failed:", error);
                alert(`Import failed: ${error.message}`);
            }
        };
        
        reader.onerror = () => {
            alert("Error reading file");
        };
        
        reader.readAsText(file);
    }

    // Render the application
    render() {
        this.renderBets(this.filterAndSortBets());
    }

    // Filter and sort bets
    filterAndSortBets() {
        let filteredBets = [...this.bets];
        
        // Filter by sport
        if (this.selectedSport !== 'All Sports') {
            filteredBets = filteredBets.filter(bet => bet.sport === this.selectedSport);
        }
        
        // Filter by value
        if (this.highValueOnly) {
            filteredBets = filteredBets.filter(bet => 
                bet.mainBet.value && bet.mainBet.value >= 0.20
            );
        }
        
        // Sort the bets
        switch(this.sortBy) {
            case 'value':
                filteredBets.sort((a, b) => 
                    (b.mainBet.value || 0) - (a.mainBet.value || 0)
                );
                break;
            case 'odds':
                filteredBets.sort((a, b) => 
                    (a.mainBet.odds || 0) - (b.mainBet.odds || 0)
                );
                break;
            case 'confidence':
                const confidenceMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
                filteredBets.sort((a, b) => 
                    confidenceMap[b.mainBet.confidence || 'Medium'] - 
                    confidenceMap[a.mainBet.confidence || 'Medium']
                );
                break;
            case 'time':
                filteredBets.sort((a, b) => {
                    const dateA = a.time ? new Date(a.time) : new Date(0);
                    const dateB = b.time ? new Date(b.time) : new Date(0);
                    return dateA - dateB;
                });
                break;
        }
        
        return filteredBets;
    }

    // Render bets list
    renderBets(betsToRender) {
        const container = document.getElementById('betsContainer');
        if (!container) return;
        
        container.innerHTML = '';

        if (betsToRender.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    No bets match your current filters.
                </div>
            `;
            return;
        }

        betsToRender.forEach(bet => {
            const card = this.createBetCard(bet);
            container.appendChild(card);
        });

        // Add click handlers to bet cards
        document.querySelectorAll('.bet-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.no-click')) {
                    const betId = parseInt(card.getAttribute('data-bet-id'));
                    this.showDetailModal(betId);
                }
            });
        });
    }

    // Create individual bet card
    createBetCard(bet) {
        const valueClass = this.getValueClass(bet.mainBet.value || 0);
        const confidenceBadgeClass = this.getConfidenceBadgeClass(bet.mainBet.confidence || "Medium");
        
        const card = document.createElement('div');
        card.className = 'bet-card';
        card.setAttribute('data-bet-id', bet.id);
        
        card.innerHTML = `
            <div class="bet-card-content">
                <div class="bet-info-icon">
                    <i class="fas fa-info-circle text-primary"></i>
                </div>
                <div class="bet-header">
                    <span class="bet-sport">${bet.sport || 'Unknown Sport'}</span>
                    <span class="bet-time">${this.formatDate(bet.time)}</span>
                </div>
                <h3 class="bet-title">${bet.event}</h3>
                <div class="bet-main">
                    <div class="bet-type-row">
                        <span class="bet-type">${bet.mainBet.type || 'Unknown'}</span>
                        <span class="bet-value ${valueClass}">
                            Value: ${bet.mainBet.value ? (bet.mainBet.value * 100).toFixed(0) + '%' : 'N/A'}
                        </span>
                    </div>
                    <div class="bet-selection-row">
                        <div class="bet-pick-container">
                            <div class="bet-pick">${bet.mainBet.pick}</div>
                            <div class="bet-odds ${valueClass}">
                                ${this.formatAmericanOdds(bet.mainBet.odds)}
                            </div>
                        </div>
                        <span class="confidence-badge ${confidenceBadgeClass}">
                            ${bet.mainBet.confidence || 'Medium'} Confidence
                        </span>
                    </div>
                </div>
                <div class="bet-footer">
                    <span class="best-odds">
                        Best Odds: ${this.getBestOdds(bet.sportsbooks)}
                    </span>
                    <button class="view-analysis-btn no-click">View Analysis</button>
                </div>
            </div>
        `;
        
        return card;
    }

    // Get best odds from sportsbooks
    getBestOdds(sportsbooks) {
        if (!sportsbooks || sportsbooks.length === 0) return 'N/A';
        const validOdds = sportsbooks.filter(sb => sb.odds !== null && sb.odds !== undefined);
        if (validOdds.length === 0) return 'N/A';
        const bestOdds = Math.max(...validOdds.map(sb => sb.odds));
        return this.formatAmericanOdds(bestOdds);
    }

    // Show bet details modal
    showDetailModal(betId) {
        const bet = this.bets.find(b => b.id === betId);
        if (!bet) return;

        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');
        
        if (!modalTitle || !modalContent) return;
        
        modalTitle.textContent = bet.event;
        
        // Prepare sportsbook comparison
        const sportsBookComparison = bet.sportsbooks && bet.sportsbooks.length > 0
            ? bet.sportsbooks
                .filter(sb => sb.odds !== null && sb.odds !== undefined)
                .map(sb => `
                    <div class="odds-comparison-row">
                        <span>${sb.name || 'Unknown'}</span>
                        <span class="odds-value">${this.formatAmericanOdds(sb.odds)}</span>
                    </div>`
                ).join('')
            : '<p class="no-odds">No odds comparison available</p>';

        // Prepare other bets
        const otherBetsHtml = bet.otherBets && bet.otherBets.length > 0
            ? bet.otherBets
                .filter(ob => ob.pick && ob.type)
                .map(ob => `
                    <div class="other-bet-row">
                        <div class="other-bet-info">
                            <span class="other-bet-type">${ob.type}: ${ob.pick}</span>
                            ${ob.odds ? `
                            <span class="other-bet-odds">
                                ${this.formatAmericanOdds(ob.odds)}
                            </span>` : ''}
                        </div>
                        ${ob.value ? `
                        <div class="other-bet-value ${this.getValueClass(ob.value)}">
                            Value: ${(ob.value * 100).toFixed(0)}%
                        </div>` : ''}
                    </div>`
                ).join('')
            : '<p class="no-other-bets">No additional bets available</p>';

        const confidenceBadgeClass = this.getConfidenceBadgeClass(bet.mainBet.confidence || "Medium");
        const valueClass = this.getValueClass(bet.mainBet.value || 0);

        modalContent.innerHTML = `
            <div class="modal-section">
                <div class="modal-header-row">
                    <div class="bet-meta">
                        <span class="modal-sport">${bet.sport || 'Unknown Sport'}</span>
                        <span class="modal-time">${this.formatDate(bet.time)}</span>
                    </div>
                    <span class="modal-confidence ${confidenceBadgeClass}">
                        ${bet.mainBet.confidence || 'Medium'} Confidence
                    </span>
                </div>
                
                <div class="main-bet-highlight">
                    <div class="bet-meta-row">
                        <span class="bet-type-label">${bet.mainBet.type || 'Unknown'}</span>
                        ${bet.mainBet.value ? `
                        <span class="value-badge ${valueClass}">
                            Value: ${(bet.mainBet.value * 100).toFixed(0)}%
                        </span>` : ''}
                    </div>
                    <div class="bet-selection-row">
                        <div class="bet-pick">${bet.mainBet.pick}</div>
                        ${bet.mainBet.odds ? `
                        <div class="bet-odds ${valueClass}">
                            ${this.formatAmericanOdds(bet.mainBet.odds)}
                        </div>` : ''}
                    </div>
                    ${bet.mainBet.probability ? `
                    <div class="implied-prob">
                        Implied Probability: ${(bet.mainBet.probability * 100).toFixed(0)}%
                    </div>` : ''}
                </div>
            </div>

            <div class="modal-grid">
                <div class="modal-column">
                    <h3 class="modal-subtitle">Other Opportunities</h3>
                    <div class="other-bets-container">
                        ${otherBetsHtml}
                    </div>
                </div>
                
                <div class="modal-column">
                    <h3 class="modal-subtitle">Odds Comparison</h3>
                    <div class="odds-comparison-container">
                        ${sportsBookComparison}
                    </div>
                </div>
            </div>
            
            ${bet.analysis ? `
            <div class="modal-section">
                <h3 class="modal-subtitle">Summary</h3>
                <div class="analysis-container">
                    <p>${bet.analysis}</p>
                </div>
            </div>` : ''}
            
            ${bet.aiReasoning ? `
            <div class="modal-section">
                <h3 class="modal-subtitle ai-title">
                    <i class="fas fa-brain text-primary"></i>
                    AI Analysis
                </h3>
                <div class="ai-analysis-container">
                    <p>${bet.aiReasoning}</p>
                </div>
            </div>` : ''}
        `;
        
        document.getElementById('detailModal').classList.add('active');
    }

    // Hide detail modal
    hideDetailModal() {
        document.getElementById('detailModal').classList.remove('active');
    }

    // Show admin modal
    showAdminModal() {
        document.getElementById('adminModal').classList.add('active');
        this.renderAdminBetsList();
    }

    // Hide admin modal
    hideAdminModal() {
        document.getElementById('adminModal').classList.remove('active');
    }

    // Render admin bets list
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
                    <span class="admin-bet-sport">${bet.sport || 'Unknown'}</span>
                    <h4 class="admin-bet-event">${bet.event || 'No event name'}</h4>
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

    // Show edit bet modal
    showEditBetModal(betId) {
        const bet = this.bets.find(b => b.id === betId);
        const isNew = !bet;
        
        const editBetModal = document.getElementById('editBetModal');
        const editBetModalTitle = document.getElementById('editBetModalTitle');
        
        if (editBetModal && editBetModalTitle) {
            editBetModalTitle.textContent = isNew ? 'Add New Bet' : `Edit Bet #${betId}`;
            
            // Fill form with bet data or empty for new bet
            document.getElementById('editBetId').value = isNew ? '' : betId;
            document.getElementById('editSport').value = bet?.sport || 'UFC';
            document.getElementById('editEvent').value = bet?.event || '';
            document.getElementById('editTime').value = bet?.time || '';
            
            // Main bet fields
            document.getElementById('editMainBetType').value = bet?.mainBet?.type || 'Moneyline';
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

    // Hide edit bet modal
    hideEditBetModal() {
        document.getElementById('editBetModal').classList.remove('active');
    }

    // Save bet (create or update)
    saveBet() {
        try {
            const betIdInput = document.getElementById('editBetId').value;
            const betId = betIdInput === '' ? null : parseInt(betIdInput);
            const isNew = betId === null;
            
            // Generate new ID if creating a new bet
            const newId = isNew ? 
                (this.bets.length > 0 ? Math.max(...this.bets.map(b => b.id)) + 1 : 1) : 
                betId;
            
            // Collect form data
            const betData = {
                id: newId,
                sport: document.getElementById('editSport').value.trim(),
                event: document.getElementById('editEvent').value.trim(),
                time: document.getElementById('editTime').value.trim(),
                mainBet: {
                    type: document.getElementById('editMainBetType').value.trim(),
                    pick: document.getElementById('editMainBetPick').value.trim(),
                    odds: parseFloat(document.getElementById('editMainBetOdds').value) || 0,
                    probability: parseFloat(document.getElementById('editMainBetProbability').value) || 0,
                    value: parseFloat(document.getElementById('editMainBetValue').value) || 0,
                    confidence: document.getElementById('editMainBetConfidence').value
                },
                otherBets: [],
                analysis: document.getElementById('editAnalysis').value.trim(),
                aiReasoning: document.getElementById('editAiReasoning').value.trim(),
                sportsbooks: [
                    { name: "DraftKings", odds: parseFloat(document.getElementById('editMainBetOdds').value) || 0 },
                    { name: "FanDuel", odds: (parseFloat(document.getElementById('editMainBetOdds').value) || 0) + 5 },
                    { name: "BetMGM", odds: (parseFloat(document.getElementById('editMainBetOdds').value) || 0) - 5 }
                ]
            };
            
            // Validate required fields
            if (!betData.event || !betData.mainBet.pick) {
                throw new Error("Event name and main bet pick are required");
            }
            
            // Update or add the bet
            if (isNew) {
                this.bets.push(betData);
            } else {
                const index = this.bets.findIndex(b => b.id === betId);
                if (index !== -1) {
                    this.bets[index] = betData;
                }
            }
            
            // Sort bets by ID
            this.bets.sort((a, b) => a.id - b.id);
            
            this.hideEditBetModal();
            this.renderAdminBetsList();
            this.renderBets(this.filterAndSortBets());
            
            alert(`Bet ${isNew ? 'added' : 'updated'} successfully!`);
            this.saveDataToFile();
        } catch (error) {
            console.error("Error saving bet:", error);
            alert(`Error: ${error.message}`);
        }
    }

    // Delete bet
    deleteBet() {
        const betId = parseInt(document.getElementById('editBetId').value);
        if (!betId) return;
        
        if (confirm('Are you sure you want to delete this bet? This cannot be undone.')) {
            this.bets = this.bets.filter(b => b.id !== betId);
            this.hideEditBetModal();
            this.renderAdminBetsList();
            this.renderBets(this.filterAndSortBets());
            alert('Bet deleted successfully!');
            this.saveDataToFile();
        }
    }

    // Show PIN modal
    showPinModal() {
        document.getElementById('pinModal').classList.add('active');
        document.getElementById('pinInput').value = '';
        document.getElementById('pinError').style.display = 'none';
        document.getElementById('pinInput').focus();
    }

    // Hide PIN modal
    hidePinModal() {
        document.getElementById('pinModal').classList.remove('active');
    }

    // Verify PIN
    verifyPin() {
        const pinInput = document.getElementById('pinInput');
        const pinError = document.getElementById('pinError');
        
        if (pinInput.value === this.ADMIN_PIN) {
            this.hidePinModal();
            this.showAdminModal();
        } else {
            pinError.style.display = 'block';
            pinInput.value = '';
            pinInput.focus();
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Dark mode toggle
        document.getElementById('darkModeToggle')?.addEventListener('click', () => this.toggleDarkMode());
        
        // Admin button
        document.getElementById('adminBtn')?.addEventListener('click', () => this.showPinModal());
        
        // PIN modal events
        document.getElementById('closePinModal')?.addEventListener('click', () => this.hidePinModal());
        document.getElementById('pinModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('pinModal')) {
                this.hidePinModal();
            }
        });
        document.getElementById('submitPinBtn')?.addEventListener('click', () => this.verifyPin());
        document.getElementById('pinInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.verifyPin();
        });
        
        // Sport tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.selectedSport = e.target.getAttribute('data-sport');
                this.updateActiveSportTab();
                this.renderBets(this.filterAndSortBets());
            });
        });
        
        // Sort dropdown
        document.getElementById('sortOptions')?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderBets(this.filterAndSortBets());
        });
        
        // High value checkbox
        document.getElementById('highValueOnly')?.addEventListener('change', (e) => {
            this.highValueOnly = e.target.checked;
            this.renderBets(this.filterAndSortBets());
        });
        
        // Detail modal
        document.getElementById('closeModal')?.addEventListener('click', () => this.hideDetailModal());
        document.getElementById('detailModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('detailModal')) {
                this.hideDetailModal();
            }
        });
        
        // Admin modal
        document.getElementById('closeAdminModal')?.addEventListener('click', () => this.hideAdminModal());
        document.getElementById('adminModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('adminModal')) {
                this.hideAdminModal();
            }
        });
        
        // Edit bet modal
        document.getElementById('closeEditBetModal')?.addEventListener('click', () => this.hideEditBetModal());
        document.getElementById('editBetModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('editBetModal')) {
                this.hideEditBetModal();
            }
        });
        
        // Admin actions
        document.getElementById('addBetBtn')?.addEventListener('click', () => this.showAddBetModal());
        document.getElementById('saveBetBtn')?.addEventListener('click', () => this.saveBet());
        document.getElementById('deleteBetBtn')?.addEventListener('click', () => this.deleteBet());
        document.getElementById('saveToFileBtn')?.addEventListener('click', () => this.saveDataToFile());
        document.getElementById('backupBtn')?.addEventListener('click', () => this.backupData());
        
        // File import
        document.getElementById('jsonFileInput')?.addEventListener('change', (e) => this.handleFileImport(e));
        
        // Game simulation diamonds
        document.querySelectorAll('.diamond').forEach(diamond => {
            diamond.addEventListener('click', (e) => {
                const day = parseInt(e.currentTarget.getAttribute('data-day'));
                if (day === this.gameData.currentDay) {
                    this.completeCurrentDay(true);
                }
            });
        });
    }

    // Show add bet modal
    showAddBetModal() {
        const newId = this.bets.length > 0 ? Math.max(...this.bets.map(b => b.id)) + 1 : 1;
        this.showEditBetModal(newId);
    }

    // Update active sport tab styling
    updateActiveSportTab() {
        document.querySelectorAll('.tab').forEach(tab => {
            const sport = tab.getAttribute('data-sport');
            tab.classList.remove('tab-active');
            tab.classList.add('tab-inactive');
            
            if (sport === this.selectedSport) {
                tab.classList.remove('tab-inactive');
                tab.classList.add('tab-active');
            }
        });
    }

    // Game progress methods
    updateGameProgress() {
        document.querySelectorAll('.diamond').forEach(diamond => {
            const day = parseInt(diamond.getAttribute('data-day'));
            
            diamond.style.backgroundColor = '';
            diamond.querySelector('span').style.color = '';
            
            if (day < this.gameData.currentDay) {
                diamond.style.backgroundColor = 'var(--secondary)';
                diamond.querySelector('span').style.color = 'var(--white)';
            } else if (day === this.gameData.currentDay) {
                diamond.style.backgroundColor = 'var(--primary)';
                diamond.querySelector('span').style.color = 'var(--white)';
            } else {
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
                this.gameData.currentAmount += currentBet.potentialProfit;
                this.gameData.completedDays++;
                this.gameData.currentDay++;
                
                const diamond = document.querySelector(`.diamond[data-day="${this.gameData.currentDay - 1}"]`);
                if (diamond) {
                    diamond.classList.add('diamond-pulse');
                    setTimeout(() => diamond.classList.remove('diamond-pulse'), 1500);
                }
                
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
                alert("Game over! You lost today's bet.");
                this.resetGame();
            }
            
            this.updateGameProgress();
        }
    }

    resetGame() {
        this.gameData.currentDay = 1;
        this.gameData.completedDays = 0;
        this.gameData.currentAmount = this.gameData.startingAmount;
        
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
        
        this.updateGameProgress();
    }

    // UI utility methods
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
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
        });
    }

    formatAmericanOdds(odds) {
        if (odds === null || odds === undefined) return 'N/A';
        return odds > 0 ? `+${odds}` : odds.toString();
    }

    getValueClass(value) {
        if (!value && value !== 0) return "value-low";
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
        if (!dateString) return 'TBD';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return 'TBD';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new BetSmartApp();
    } catch (error) {
        console.error("Failed to initialize BetSmartApp:", error);
        alert("Fatal error initializing application. Please check console for details.");
    }
});
