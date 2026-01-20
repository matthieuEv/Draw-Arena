var clubInfo = null;
var clubUsers = null;

function getClubInfo(clubId) {
    var data = apiFetch(`/club/${clubId}`);
    return data;
    // return fetch(`/api/club/${clubId}`)
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok ' + response.statusText);
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         return {
    //             id: data.id,
    //             name: data.name,
    //             members: data.members,
    //             createdAt: new Date(data.created_at)
    //         };
    //     })
    //     .catch(error => {
    //         console.error('There was a problem with the fetch operation:', error);
    //     });
}

function getClubUsers(clubId) {
    var data = apiFetch(`/club/${clubId}/users`);
    return data;
    // return fetch(`/api/club/${clubId}/users`)
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error('Network response was not ok ' + response.statusText);
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         return data.users.map(user => ({
    //             id: user.id,
    //             username: user.username,
    //             joinedAt: new Date(user.joined_at)
    //         }));
    //     })
    //     .catch(error => {
    //         console.error('There was a problem with the fetch operation:', error);
    //     });
}

function displayClubInfo() {
    if (clubInfo) {
        const clubInfoDiv = document.getElementById('club-info');
        clubInfoDiv.innerHTML = `
            <h2>${clubInfo.name}</h2>
            <p>Members: ${clubInfo.members}</p>
            <p>Created At: ${clubInfo.createdAt.toDateString()}</p>
        `;
    }
}

function displayClubUsers() {
    if (clubUsers) {
        const clubUsersDiv = document.getElementById('club-users');
        clubUsersDiv.innerHTML = '<h3>Members:</h3>';
        const userList = document.createElement('ul');
        clubUsers.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = `${user.username} (Joined: ${user.joinedAt.toDateString()})`;
            userList.appendChild(listItem);
        });
        clubUsersDiv.appendChild(userList);
    }
}

function loadClubData(clubId) {
    getClubInfo(clubId).then(info => {
        clubInfo = info;
        console.log('Club Info Loaded:', clubInfo);
    });
    getClubUsers(clubId).then(users => {
        clubUsers = users;
        console.log('Club Users Loaded:', clubUsers);
    });
}

// Example usage
loadClubData(1);