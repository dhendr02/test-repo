document.addEventListener('DOMContentLoaded', function() {
    // Initialize search form handler
    const searchForm = document.getElementById('teamSearchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    
    feather.replace();
});

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function getTeamLogoPath(teamName, teamData) {
    // First check if we have a logo_url in the team data
    if (teamData && teamData.logo_url) {
        return teamData.logo_url;
    }
    
   
    const simpleName = teamName.split(' ')[0].toLowerCase();
    return `/assets/teams/${simpleName}.svg`;
}

async function handleSearch(e) {
    e.preventDefault();
    const searchInput = document.getElementById('teamSearchInput');
    const resultsContainer = document.getElementById('resultsContainer');
    
    try {
        if (!searchInput.value.trim()) {
            showError('Please enter a team name to search');
            return;
        }

        const searchTerm = searchInput.value.trim();
        const response = await fetch(`/api_handler.php?team=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Received team data:", data);
        
        if (data.error) {
            showError(data.error);
            return;
        }
        
        if (!data.team) {
            showError('No team found matching your search criteria');
            return;
        }
        
        displayResults(data);
    } catch (error) {
        showError(error.message || 'An unexpected error occurred while searching. Please try again.');
    }
}

function displayResults(data) {
    const resultsContainer = document.getElementById('resultsContainer');
    const team = data.team;
    
    if (!team) {
        resultsContainer.innerHTML = '<div class="alert alert-info">No results found</div>';
        return;
    }

    console.log("Displaying team:", team.name);
    const teamLogoPath = getTeamLogoPath(team.name, team);

    resultsContainer.innerHTML = `
        <div class="card mb-4">
            <div class="card-body">
                <div class="d-flex align-items-center mb-4">
                    <div class="team-icon bg-light rounded-circle p-3 me-3">
                        <img src="${teamLogoPath}" alt="${team.name} logo" width="32" height="32" 
                             onerror="this.onerror=null; this.src='/assets/teams/template.svg';">
                    </div>
                    <div class="flex-grow-1">
                        <h2 class="mb-2">${team.name}</h2>
                        <div class="d-flex gap-2">
                            <div class="text-center px-3 py-2 bg-light rounded">
                                <div class="small text-muted">Current Ranking</div>
                                <div class="fw-bold">#${team.current_ranking}</div>
                            </div>
                            <div class="text-center px-3 py-2 bg-light rounded">
                                <div class="small text-muted">Season Record</div>
                                <div class="fw-bold">${team.season_record}</div>
                            </div>
                            <div class="text-center px-3 py-2 bg-light rounded">
                                <div class="small text-muted">Conference</div>
                                <div class="fw-bold">${team.conference}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card-body border-top">
                <h3 class="h4 mb-3">Upcoming Matchups</h3>
                <div class="table-responsive">
                    ${displayUpcomingMatchups(data.upcoming, data)}
                </div>
            </div>

            <div class="card-body border-top">
                <h3 class="h4 mb-3">Historical Matchups</h3>
                <div class="table-responsive">
                    ${displayHistoricalMatchups(data.historical, data)}
                </div>
            </div>
        </div>
    `;
}

function displayUpcomingMatchups(matchups, data) {
    if (!matchups || matchups.length === 0) {
        return '<p class="text-muted">No upcoming matchups scheduled</p>';
    }

    return `
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr>
                    <th class="text-nowrap">Date</th>
                    <th>Opponent</th>
                    <th class="text-end">Spread</th>
                    <th class="text-end">Moneyline</th>
                    <th class="text-end">Over/Under</th>
                </tr>
            </thead>
            <tbody>
                ${matchups.map(game => {
                    const opponentData = {
                        name: game.opponent,
                        logo_url: game.opponent_logo_url
                    };
                    return `
                    <tr>
                        <td class="text-nowrap">${formatDate(game.game_date)}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="team-icon-sm bg-light rounded-circle p-2 me-2">
                                    <img src="${getTeamLogoPath(game.opponent, opponentData)}" 
                                         alt="${game.opponent} logo" 
                                         width="16" height="16" 
                                         onerror="this.onerror=null; this.src='/assets/teams/template.svg';">
                                </div>
                                ${game.opponent}
                            </div>
                        </td>
                        <td class="text-end ${parseFloat(game.spread) > 0 ? 'text-success' : 'text-danger'}">${game.spread}</td>
                        <td class="text-end">${game.moneyline}</td>
                        <td class="text-end">${game.over_under}</td>
                    </tr>
                `}).join('')}
            </tbody>
        </table>
    `;
}

function displayHistoricalMatchups(matchups, data) {
    if (!matchups || matchups.length === 0) {
        return '<p class="text-muted">No historical matchups available</p>';
    }

    return `
        <table class="table table-hover align-middle">
            <thead class="table-light">
                <tr>
                    <th class="text-nowrap">Date</th>
                    <th>Opponent</th>
                    <th class="text-center">Result</th>
                    <th class="text-end">Score</th>
                    <th class="text-end">Spread</th>
                </tr>
            </thead>
            <tbody>
                ${matchups.map(game => {
                    const opponentData = {
                        name: game.opponent,
                        logo_url: game.opponent_logo_url
                    };
                    return `
                    <tr>
                        <td class="text-nowrap">${formatDate(game.game_date)}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="team-icon-sm bg-light rounded-circle p-2 me-2">
                                    <img src="${getTeamLogoPath(game.opponent, opponentData)}" 
                                         alt="${game.opponent} logo" 
                                         width="16" height="16" 
                                         onerror="this.onerror=null; this.src='/assets/teams/template.svg';">
                                </div>
                                ${game.opponent}
                            </div>
                        </td>
                        <td class="text-center">
                            <span class="badge ${game.result === 'W' ? 'bg-success' : 'bg-danger'}">${game.result}</span>
                        </td>
                        <td class="text-end fw-bold">${game.score}</td>
                        <td class="text-end ${parseFloat(game.spread) > 0 ? 'text-success' : 'text-danger'}">${game.spread}</td>
                    </tr>
                `}).join('')}
            </tbody>
        </table>
    `;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.getElementById('resultsContainer') || document.querySelector('main');
    container.insertBefore(errorDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
