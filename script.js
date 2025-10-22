// Function to load JSON data from file
async function loadJSON(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error loading JSON:', error);
        return null;
    }
}

// Function to save JSON data to localStorage
function saveJSON(file, data) {
    const key = file.replace('/', '_').replace('.json', '');
    localStorage.setItem(key, JSON.stringify(data));
}

// Load train database from localStorage if available, else JSON file or default
let trainDatabase = [];
loadJSON('data/trainDatabase.json').then(data => {
    const localData = JSON.parse(localStorage.getItem('data_trainDatabase'));
    if (localData) {
        trainDatabase = localData;
    } else if (data) {
        trainDatabase = data;
    } else {
        trainDatabase = [
            { number: "12345", name: "Express Train", arrival: "10:00", departure: "10:30", updn: "UP", station: "Central Station" },
            { number: "67890", name: "Superfast Express", arrival: "11:00", departure: "11:30", updn: "DN", station: "Central Station" },
            { number: "11111", name: "Local Train", arrival: "12:00", departure: "12:30", updn: "UP", station: "Central Station" }
        ];
    }
});

// Load activities from JSON file or localStorage fallback
let activities = [];
loadJSON('data/activities.json').then(data => {
    if (data) {
        activities = data;
    } else {
        activities = JSON.parse(localStorage.getItem('activities')) || [];
    }
});

// Load users from JSON file or localStorage fallback
let users = [];
loadJSON('data/users.json').then(data => {
    if (data) {
        users = data;
    } else {
        users = JSON.parse(localStorage.getItem('users')) || [{ username: 'admin', password: 'admin' }];
    }
});

// Load admin message from localStorage
let adminMessage = localStorage.getItem('adminMessage') || '';

// Display admin message on login page if exists
if (adminMessage) {
    document.getElementById('adminMessageDisplay').textContent = 'Message from Admin: ' + adminMessage;
    document.getElementById('adminMessageDisplay').style.display = 'block';
} else {
    document.getElementById('adminMessageDisplay').textContent = '';
    document.getElementById('adminMessageDisplay').style.display = 'none';
}

// Save to localStorage (fallback)
function saveDatabase() {
    saveJSON('data/trainDatabase.json', trainDatabase);
}

// Save activities to localStorage (fallback)
function saveActivities() {
    saveJSON('data/activities.json', activities);
}

// Save users to localStorage (fallback)
function saveUsers() {
    saveJSON('data/users.json', users);
}

// Function to check and clear activities if it's a new day (past 12:00 AM)
function checkAndClearActivities() {
    if (activities.length > 0) {
        const lastActivityDate = new Date(activities[0].timestamp).toDateString();
        const currentDate = new Date().toDateString();
        if (currentDate !== lastActivityDate) {
            activities = [];
            saveActivities();
        }
    }
}

// Function to convert number to words (simple implementation for up to 5 digits)
function numberToWords(num) {
    const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    num = parseInt(num);
    if (num === 0) return 'zero';
    let words = '';
    if (num >= 10000) {
        words += units[Math.floor(num / 10000)] + ' ';
        num %= 10000;
    }
    if (num >= 1000) {
        words += units[Math.floor(num / 1000)] + ' thousand ';
        num %= 1000;
    }
    if (num >= 100) {
        words += units[Math.floor(num / 100)] + ' hundred ';
        num %= 100;
    }
    if (num >= 20) {
        words += tens[Math.floor(num / 10)] + ' ';
        num %= 10;
    } else if (num >= 10) {
        words += teens[num - 10] + ' ';
        num = 0;
    }
    if (num > 0) {
        words += units[num] + ' ';
    }
    return words.trim();
}

// Function to get train name from database
function getTrainName(trainNumber) {
    const train = trainDatabase.find(t => t.number === trainNumber);
    return train ? train.name : "Unknown Train";
}

// Function to generate display text for each language (plain numbers)
function generateDisplayText(trainNumber, trainName, platformNumber, lang) {
    const baseText = `Dear Passenger attention please Train number ${trainNumber}, ${trainName}, will arrive shortly on platform number ${platformNumber}`;
    if (lang === 'or') {
        return `ଯାତ୍ରୀମାନେ ଦୟାକରି ଧ୍ୟାନ ଦିଅନ୍ତୁ ଟ୍ରେନ୍ ସଂଖ୍ୟା ${trainNumber}, ${trainName}, ପ୍ଲାଟଫର୍ମ ନମ୍ବର ${platformNumber}ରେ କିଛି ସମୟ ମଧ୍ୟ୍ୟରେ ଆସୁଛି`;
    } else if (lang === 'hi') {
        return `यात्रिगण कृपया ध्यान दीजिए ट्रेन संख्या ${trainNumber}, ${trainName}, प्लेटफॉर्म संख्या ${platformNumber}पर थोड़ी देर बाद आएगी `;
    } else {
        return baseText;
    }
}

// Function to generate speech text for each language (SSML for Azure, words for Web Speech)
function generateSpeechText(trainNumber, trainName, platformNumber, lang, useSSML = true) {
    const trainNum = useSSML ? `<say-as interpret-as="cardinal">${trainNumber}</say-as>` : numberToWords(trainNumber);
    const platformNum = useSSML ? `<say-as interpret-as="cardinal">${platformNumber}</say-as>` : numberToWords(platformNumber);
    const baseText = `Dear Passenger attention please Train number ${trainNum}, ${trainName}, will arrive shortly on platform number ${platformNum}`;
    if (lang === 'or') {
        return `ଯାତ୍ରୀମାନେ ଦୟାକରି ଧ୍ୟାନ ଦିଅନ୍ତୁ ଟ୍ରେନ୍ ସଂଖ୍ୟା ${trainNum}, ${trainName}, ପ୍ଲାଟଫର୍ମ ନମ୍ବର ${platformNum}ରେ କିଛି ସମୟ ମଧ୍ୟ୍ୟରେ ଆସୁଛି`;
    } else if (lang === 'hi') {
        return `यात्रिगण कृपया ध्यान दीजिए ट्रेन संख्या ${trainNum}, ${trainName}, प्लेटफॉर्म संख्या ${platformNum}पर थोड़ी देर बाद आएगी `;
    } else {
        return baseText;
    }
}

// Function to play a custom sound before announcements
function playBeep() {
    const audio = new Audio('sound/beep.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// Global variables to hold audio objects for stopping (no longer needed for speech synthesis)

// Azure Speech Service configuration (replace with your actual key and region)
const azureSubscriptionKey = 'YOUR_AZURE_SUBSCRIPTION_KEY'; // Replace with your Azure subscription key
const azureRegion = 'YOUR_AZURE_REGION'; // e.g., 'eastus'

// Function to speak the announcement using Microsoft Azure Speech Service with fallback to Web Speech API
function speakAnnouncement(trainNumber, trainName, platformNumber, lang, callback) {
    // Generate text based on lang
    let text = generateSpeechText(trainNumber, trainName, platformNumber, lang, true);
    let languageCode = lang === 'od' ? 'od-IN' : lang === 'hi' ? 'hi-IN' : 'en-US'; // Azure supports Odia, Hindi, English
    let voiceName = lang === 'od' ? 'or-IN-SubhasiniRUS' : lang === 'hi' ? 'hi-IN-Kalpana' : 'en-US-ZiraRUS'; // Female voices

    // SSML for Azure TTS
    const ssml = `<speak version='1.0' xml:lang='${languageCode}'>
        <voice xml:lang='${languageCode}' xml:gender='Female' name='${voiceName}'>
            ${text}
        </voice>
    </speak>`;

    // Azure TTS API endpoint
    const apiUrl = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': azureSubscriptionKey,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        },
        body: ssml
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Azure TTS API error: ${response.status}`);
        }
        return response.blob();
    })
    .then(blob => {
        const audio = new Audio(URL.createObjectURL(blob));
        audio.volume = 1.0;
        audio.onended = () => {
            if (callback) callback();
        };
        audio.onerror = (e) => {
            console.log('Audio play error:', e);
            // Fallback to Web Speech API
            fallbackToWebSpeech(trainNumber, trainName, platformNumber, lang, callback);
        };
        audio.play().catch(e => {
            console.log('Audio play failed:', e);
            // Fallback to Web Speech API
            fallbackToWebSpeech(trainNumber, trainName, platformNumber, lang, callback);
        });
    })
    .catch(error => {
        console.log('Azure TTS request failed:', error);
        // Fallback to Web Speech API
        fallbackToWebSpeech(trainNumber, trainName, platformNumber, lang, callback);
    });
}

// Fallback function using Web Speech API
function fallbackToWebSpeech(trainNumber, trainName, platformNumber, lang, callback) {
    if ('speechSynthesis' in window) {
        // For Odia, use English text since Odia not supported
        let text = lang === 'or' ? generateSpeechText(trainNumber, trainName, platformNumber, 'en', false) : generateSpeechText(trainNumber, trainName, platformNumber, lang, false);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'or' ? 'en-US' : lang === 'hi' ? 'hi-IN' : 'en-US';
        utterance.volume = 1.0;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Select female voice
        const setVoice = () => {
            const voices = speechSynthesis.getVoices();
            let selectedVoice = voices.find(voice => voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('susan') || voice.name.toLowerCase().includes('karen') || voice.name.toLowerCase().includes('samantha') || voice.name.toLowerCase().includes('victoria'));
            if (!selectedVoice) {
                selectedVoice = voices.find(voice => voice.lang.startsWith(utterance.lang.split('-')[0]));
            }
            if (!selectedVoice) {
                selectedVoice = voices[0];
            }
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            speechSynthesis.speak(utterance);
        };

        if (speechSynthesis.getVoices().length > 0) {
            setVoice();
        } else {
            speechSynthesis.onvoiceschanged = setVoice;
        }

        utterance.onend = () => {
            if (callback) callback();
        };

        utterance.onerror = (e) => {
            console.log('Speech synthesis error:', e);
            if (callback) callback();
        };
    } else {
        console.log('Speech synthesis not supported');
        if (callback) callback();
    }
}

// Handle form submission for announcement
document.getElementById('announcementForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const trainNumber = document.getElementById('trainNumber').value.trim();
    const platformNumber = document.getElementById('platformNumber').value.trim();

    // Validate train number
    const trainName = getTrainName(trainNumber);
    if (trainName === "Unknown Train") {
        alert('Invalid train number. Please enter a valid train number from the database.');
        return;
    }

    // Store activity
    const user = users.find(u => u.username === currentUser);
    const userStation = user ? user.stationName || 'Central Station' : 'Central Station';
    const train = trainDatabase.find(t => t.number === trainNumber);
    const status = train ? train.updn : "Unknown";
    const activity = {
        serialNo: activities.length + 1,
        timestamp: new Date().toISOString(),
        trainNo: trainNumber,
        trainName: trainName,
        platformNumber: platformNumber,
        status: status,
        station: userStation,
        announcedBy: currentUser
    };
    activities.push(activity);
    saveActivities();

    document.getElementById('page1').classList.remove('active');
    document.getElementById('page2').classList.add('active');

    document.getElementById('odiaScript').textContent = generateDisplayText(trainNumber, trainName, platformNumber, 'or');
    document.getElementById('hindiScript').textContent = generateDisplayText(trainNumber, trainName, platformNumber, 'hi');
    document.getElementById('englishScript').textContent = generateDisplayText(trainNumber, trainName, platformNumber, 'en');


    setTimeout(() => {
        playBeep();
        setTimeout(() => {
            speakAnnouncement(trainNumber, trainName, platformNumber, 'or', () => {
                speakAnnouncement(trainNumber, trainName, platformNumber, 'hi', () => {
                    speakAnnouncement(trainNumber, trainName, platformNumber, 'en');
                });
            });
        }, 300);
    }, 500);
});

// Handle back button from page2
document.getElementById('backButton').addEventListener('click', function() {
    document.getElementById('page2').classList.remove('active');
    document.getElementById('page1').classList.add('active');
    speechSynthesis.cancel();
});

// Handle sidebar buttons
document.getElementById('announceBtn').addEventListener('click', function() {
    document.getElementById('page1').classList.add('active');
    document.getElementById('page2').classList.remove('active');
    document.getElementById('page3').classList.remove('active');
    document.getElementById('page4').classList.remove('active');
    document.getElementById('page5').classList.remove('active');
    document.getElementById('announcementForm').style.display = 'block';
});

document.getElementById('trainInfoBtn').addEventListener('click', function() {
    if (currentUser === 'admin') {
        showUserSelectionModalForTrain();
    } else {
        document.getElementById('page1').classList.remove('active');
        document.getElementById('page3').classList.add('active');
        document.getElementById('page2').classList.remove('active');
        document.getElementById('page4').classList.remove('active');
        document.getElementById('page5').classList.remove('active');
        const user = users.find(u => u.username === currentUser);
        const stationName = user ? user.stationName || currentUser : currentUser;
        document.querySelector('#page3 h1').textContent = `Train Time Table for ${stationName}`;
        renderTrainTable();
    }
});

document.getElementById('activityBtn').addEventListener('click', function() {
    if (currentUser === 'admin') {
        showUserSelectionModalForActivity();
    } else {
        checkAndClearActivities(); // Clear if new day
        document.getElementById('page1').classList.remove('active');
        document.getElementById('page4').classList.add('active');
        document.getElementById('page2').classList.remove('active');
        document.getElementById('page3').classList.remove('active');
        document.getElementById('page5').classList.remove('active');
        const user = users.find(u => u.username === currentUser);
        const stationName = user ? user.stationName || currentUser : currentUser;
        document.getElementById('activityHeader').textContent = `Train Announcement Today at ${stationName} `;
        renderActivityTable();
    }
});

document.getElementById('createUserBtn').addEventListener('click', function() {
    document.getElementById('page1').classList.remove('active');
    document.getElementById('page5').classList.add('active');
    document.getElementById('page2').classList.remove('active');
    document.getElementById('page3').classList.remove('active');
    document.getElementById('page4').classList.remove('active');
    document.getElementById('page6').classList.remove('active');
    renderUserTable();
});

document.getElementById('adminMessageBtn').addEventListener('click', function() {
    if (currentUser === 'admin') {
        document.getElementById('page1').classList.remove('active');
        document.getElementById('page6').classList.add('active');
        document.getElementById('page2').classList.remove('active');
        document.getElementById('page3').classList.remove('active');
        document.getElementById('page4').classList.remove('active');
        document.getElementById('page5').classList.remove('active');
    } else {
        alert('Only admin can send admin messages.');
    }
});

let downloadType = '';

document.getElementById('downloadBtn').addEventListener('click', function() {
    if (currentUser === 'admin') {
        // Toggle sub-buttons visibility
        const trainBtn = document.getElementById('downloadTrainBtn');
        const activitiesBtn = document.getElementById('downloadActivitiesBtn');
        const usersBtn = document.getElementById('downloadUsersBtn');
        const isHidden = trainBtn.style.display === 'none';
        trainBtn.style.display = isHidden ? 'block' : 'none';
        activitiesBtn.style.display = isHidden ? 'block' : 'none';
        usersBtn.style.display = isHidden ? 'block' : 'none';
    } else {
        alert('Only admin can download the database.');
    }
});

document.getElementById('downloadTrainBtn').addEventListener('click', function() {
    if (currentUser === 'admin') {
        downloadType = 'train';
        showUserSelectionModal();
    } else {
        alert('Only admin can download the database.');
    }
});

document.getElementById('downloadActivitiesBtn').addEventListener('click', function() {
    if (currentUser === 'admin') {
        downloadType = 'activities';
        showUserSelectionModal();
    } else {
        alert('Only admin can download the database.');
    }
});

document.getElementById('downloadUsersBtn').addEventListener('click', function() {
    if (currentUser === 'admin') {
        downloadUsersDatabase();
    } else {
        alert('Only admin can download the database.');
    }
});

document.getElementById('closeUserSelection').addEventListener('click', function() {
    document.getElementById('userSelectionModal').style.display = 'none';
});

// Handle back button from page4
document.getElementById('backToMainFromActivityButton').addEventListener('click', function() {
    document.getElementById('page4').classList.remove('active');
    document.getElementById('page1').classList.add('active');
});

// Handle back button from page5
document.getElementById('backToMainFromUserButton').addEventListener('click', function() {
    document.getElementById('page5').classList.remove('active');
    document.getElementById('page1').classList.add('active');
});

// Handle back button from page6
document.getElementById('backToMainFromAdminMessageButton').addEventListener('click', function() {
    document.getElementById('page6').classList.remove('active');
    document.getElementById('page1').classList.add('active');
});

// Handle admin message form submission
document.getElementById('adminMessageForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const message = document.getElementById('newAdminMessage').value.trim();
    if (message) {
        // Save to localStorage
        localStorage.setItem('adminMessage', message);
        adminMessage = message;
        // Update the display on page1 for admin users
        document.getElementById('adminMessageDisplay').textContent = 'Message from Admin: ' + message;
        document.getElementById('adminMessageDisplay').style.display = 'block';
        alert('Admin message sent successfully!');
        // Clear the form
        document.getElementById('newAdminMessage').value = '';
    } else {
        alert('Please enter a message.');
    }
});

// Render the train table on page3
function renderTrainTable() {
    const tbody = document.getElementById('trainTimeTableBody');
    tbody.innerHTML = '';
    const user = users.find(u => u.username === currentUser);
    const userStation = user ? user.stationName : 'Central Station';
    const filteredTrains = trainDatabase.filter(train => train.station === userStation);
    filteredTrains.forEach((train, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${train.number}</td>
            <td class="train-name">${train.name}</td>
            <td class="train-arrival">${train.arrival}</td>
            <td class="train-departure">${train.departure}</td>
            <td class="train-updn">${train.updn}</td>
            <td>
                <button class="edit-btn" data-train="${train.number}" title="Edit">✏️</button>
                <button class="delete-btn" data-train="${train.number}" title="Delete">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Attach event listeners for edit and delete
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

// Handle edit button
function handleEdit(e) {
    const trainNumber = e.target.dataset.train;
    const row = e.target.closest('tr');
    const nameCell = row.querySelector('.train-name');
    const arrivalCell = row.querySelector('.train-arrival');
    const departureCell = row.querySelector('.train-departure');
    const updnCell = row.querySelector('.train-updn');

    const currentName = nameCell.textContent;
    const currentArrival = arrivalCell.textContent;
    const currentDeparture = departureCell.textContent;
    const currentUpdn = updnCell.textContent;

    nameCell.innerHTML = `<input type="text" class="edit-input" value="${currentName}">`;
    arrivalCell.innerHTML = `<input type="time" class="edit-input" value="${currentArrival}">`;
    departureCell.innerHTML = `<input type="time" class="edit-input" value="${currentDeparture}">`;
    updnCell.innerHTML = `<input type="text" class="edit-input" value="${currentUpdn}">`;

    const inputs = row.querySelectorAll('.edit-input');
    inputs[0].focus(); // Focus on name input

    e.target.textContent = '💾';
    e.target.classList.add('save-btn');
    e.target.classList.remove('edit-btn');
    e.target.removeEventListener('click', handleEdit);
    e.target.addEventListener('click', () => handleSave(trainNumber, inputs, e.target, row));
}

// Handle save after edit
function handleSave(trainNumber, inputs, btn, row) {
    const newName = inputs[0].value.trim();
    const newArrival = inputs[1].value.trim();
    const newDeparture = inputs[2].value.trim();
    const newUpdn = inputs[3].value.trim();

    if (!newName || !newArrival || !newDeparture || !newUpdn) {
        alert('All fields are required.');
        return;
    }

    const trainIndex = trainDatabase.findIndex(t => t.number === trainNumber);
    if (trainIndex !== -1) {
        trainDatabase[trainIndex].name = newName;
        trainDatabase[trainIndex].arrival = newArrival;
        trainDatabase[trainIndex].departure = newDeparture;
        trainDatabase[trainIndex].updn = newUpdn;
        // Keep the station the same
        saveDatabase();
        renderTrainTable();
    }
}

// Handle delete button
function handleDelete(e) {
    const trainNumber = e.target.dataset.train;
    if (confirm(`Delete train ${trainNumber}?`)) {
        const trainIndex = trainDatabase.findIndex(t => t.number === trainNumber);
        if (trainIndex !== -1) {
            trainDatabase.splice(trainIndex, 1);
            saveDatabase();
            renderTrainTable();
        }
    }
}

// Handle add train form
document.getElementById('addTrainForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const newTrainNumber = document.getElementById('newTrainNumber').value.trim();
    const newTrainName = document.getElementById('newTrainName').value.trim();
    const newTrainArrival = document.getElementById('newTrainArrival').value.trim();
    const newTrainDeparture = document.getElementById('newTrainDeparture').value.trim();
    const newTrainupdn = document.getElementById('newTrainupdn').value.trim();

    if (!newTrainNumber || !newTrainName || !newTrainArrival || !newTrainDeparture || !newTrainupdn) {
        alert('All fields are required.');
        return;
    }
    const existingTrain = trainDatabase.find(t => t.number === newTrainNumber);
    if (existingTrain) {
        alert('Train number already exists.');
        return;
    }

    const user = users.find(u => u.username === currentUser);
    const userStation = user ? user.stationName : 'Central Station';

    const newTrain = {
        number: newTrainNumber,
        name: newTrainName,
        arrival: newTrainArrival,
        departure: newTrainDeparture,
        updn: newTrainupdn,
        station: userStation
    };
    trainDatabase.push(newTrain);
    saveDatabase();
    renderTrainTable();
    document.getElementById('addTrainForm').reset();
});

// Render the activity table on page4
function renderActivityTable() {
    const tbody = document.getElementById('activityTableBody');
    tbody.innerHTML = '';
    activities.forEach(activity => {
        const time = new Date(activity.timestamp).toLocaleString();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${activity.serialNo}</td>
            <td>${time}</td>
            <td>${activity.trainNo}</td>
            <td>${activity.trainName}</td>
            <td>${activity.platformNumber}</td>
            <td>${activity.status}</td>
        `;
        tbody.appendChild(row);
    });
}

// Render the user table on page5
function renderUserTable() {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username}</td>
            <td>${user.password}</td>
            <td>${user.stationName || ''}</td>
            <td>
                <button class="edit-user-btn" data-user="${user.username}" title="Edit">✏️</button>
                <button class="delete-user-btn" data-user="${user.username}" title="Delete">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Attach event listeners for edit and delete
    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', handleUserEdit);
    });
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', handleUserDelete);
    });
}

// Handle edit user button
function handleUserEdit(e) {
    const username = e.target.dataset.user;
    const row = e.target.closest('tr');
    const usernameCell = row.cells[1];
    const passwordCell = row.cells[2];
    const stationNameCell = row.cells[3];

    const currentUsername = usernameCell.textContent;
    const currentPassword = passwordCell.textContent;
    const currentStationName = stationNameCell.textContent;

    usernameCell.innerHTML = `<input type="text" class="edit-input" value="${currentUsername}">`;
    passwordCell.innerHTML = `<input type="password" class="edit-input" value="${currentPassword}">`;
    stationNameCell.innerHTML = `<input type="text" class="edit-input" value="${currentStationName}">`;

    const inputs = row.querySelectorAll('.edit-input');
    inputs[0].focus();

    e.target.textContent = '💾';
    e.target.classList.add('save-btn');
    e.target.classList.remove('edit-user-btn');
    e.target.removeEventListener('click', handleUserEdit);
    e.target.addEventListener('click', () => handleUserSave(username, inputs, e.target, row));
}

// Handle save after user edit
function handleUserSave(oldUsername, inputs, btn, row) {
    const newUsername = inputs[0].value.trim();
    const newPassword = inputs[1].value.trim();
    const newStationName = inputs[2].value.trim();

    if (!newUsername || !newPassword) {
        alert('All fields are required.');
        return;
    }

    const userIndex = users.findIndex(u => u.username === oldUsername);
    if (userIndex !== -1) {
        users[userIndex].username = newUsername;
        users[userIndex].password = newPassword;
        users[userIndex].stationName = newStationName;
        saveUsers();
        renderUserTable();
    }
}

// Handle delete user button
function handleUserDelete(e) {
    const username = e.target.dataset.user;
    if (confirm(`Delete user ${username}?`)) {
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex !== -1) {
            users.splice(userIndex, 1);
            saveUsers();
            renderUserTable();
        }
    }
}

// Handle add user form
document.getElementById('addUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const newUsername = document.getElementById('newUsername').value.trim();
    const newUserPassword = document.getElementById('newUserPassword').value.trim();
    const newStationName = document.getElementById('newStationName').value.trim();

    if (!newUsername || !newUserPassword) {
        alert('All fields are required.');
        return;
    }
    const existingUser = users.find(u => u.username === newUsername);
    if (existingUser) {
        alert('Username already exists.');
        return;
    }

    const newUser = {
        username: newUsername,
        password: newUserPassword,
        stationName: newStationName
    };
    users.push(newUser);
    saveUsers();
    renderUserTable();
    document.getElementById('addUserForm').reset();
});

// Global variable for current user
let currentUser = null;

// Login functionality
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Check against users array
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = username;
        document.getElementById('welcomeMessage').textContent = `Welcome to ${user.stationName || username}`;
        document.getElementById('sidebarHeader').textContent = `${user.stationName || username}`;
        
        document.getElementById('page0').classList.remove('active');
        document.getElementById('page1').classList.add('active');
        document.querySelector('.sidebar').style.display = 'block';
        document.getElementById('hamburger').style.display = 'block';
        document.body.classList.add('sidebar-open');

        // Show admin message for all users if exists
        if (adminMessage) {
            document.getElementById('adminMessageDisplay').textContent = 'Message from Admin: ' + adminMessage;
            document.getElementById('adminMessageDisplay').style.display = 'block';
        }

        // Hide Create User, Download, and Admin Message buttons for non-admin users
        if (currentUser !== 'admin') {
            document.getElementById('createUserBtn').style.display = 'none';
            document.getElementById('downloadBtn').style.display = 'none';
            document.getElementById('downloadTrainBtn').style.display = 'none';
            document.getElementById('downloadActivitiesBtn').style.display = 'none';
            document.getElementById('downloadUsersBtn').style.display = 'none';
            document.getElementById('adminMessageBtn').style.display = 'none';
        } else {
            document.getElementById('createUserBtn').style.display = 'block';
            document.getElementById('downloadBtn').style.display = 'block';
            document.getElementById('downloadTrainBtn').style.display = 'none'; // Hide sub-buttons initially
            document.getElementById('downloadActivitiesBtn').style.display = 'none'; // Hide sub-buttons initially
            document.getElementById('downloadUsersBtn').style.display = 'none'; // Hide sub-buttons initially
            document.getElementById('adminMessageBtn').style.display = 'block';
        }
    } else {
        alert('Invalid username or password.');
    }
});

// Logout functionality
document.getElementById('logoutButton').addEventListener('click', function() {
    // Hide all pages
    document.getElementById('page0').classList.add('active');
    document.getElementById('page1').classList.remove('active');
    document.getElementById('page2').classList.remove('active');
    document.getElementById('page3').classList.remove('active');
    document.getElementById('page4').classList.remove('active');
    document.getElementById('page5').classList.remove('active');
    document.getElementById('page6').classList.remove('active');
    document.querySelector('.sidebar').style.display = 'none';
    document.getElementById('hamburger').style.display = 'none';
    document.body.classList.remove('sidebar-open');
    currentUser = null;
    speechSynthesis.cancel();

    // Show admin message on login page after logout if exists
    if (adminMessage) {
        document.getElementById('adminMessageDisplay').textContent = 'Message from Admin: ' + adminMessage;
        document.getElementById('adminMessageDisplay').style.display = 'block';
    } else {
        document.getElementById('adminMessageDisplay').textContent = '';
        document.getElementById('adminMessageDisplay').style.display = 'none';
    }

    // Show logout success message and clear login fields
    alert('Logout successful!');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});

// Hamburger menu toggle
document.getElementById('hamburger').addEventListener('click', function() {
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;
    if (sidebar.style.display === 'block') {
        sidebar.style.display = 'none';
        body.classList.remove('sidebar-open');
    } else {
        sidebar.style.display = 'block';
        body.classList.add('sidebar-open');
    }
});

// Auto-hide sidebar when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.sidebar');
    const hamburger = document.getElementById('hamburger');
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    if (sidebar.style.display === 'block' && !sidebar.contains(event.target) && !hamburger.contains(event.target) && !Array.from(sidebarBtns).some(btn => btn.contains(event.target))) {
        sidebar.style.display = 'none';
        document.body.classList.remove('sidebar-open');
    }
});

// Function to update current date and time
function updateDateTime() {
    const now = new Date();
    const dateTimeString = now.toLocaleString();
    document.getElementById('currentDateTime').textContent = `Current Date and Time: ${dateTimeString}`;
}

// Update date and time every second
setInterval(updateDateTime, 1000);

// Function to download database as Excel file
function downloadDatabase() {
    const workbook = XLSX.utils.book_new();

    // Add train database sheet
    const trainSheet = XLSX.utils.json_to_sheet(trainDatabase);
    XLSX.utils.book_append_sheet(workbook, trainSheet, 'Train Database');

    // Add activities sheet
    const activitySheet = XLSX.utils.json_to_sheet(activities);
    XLSX.utils.book_append_sheet(workbook, activitySheet, 'Activities');

    // Add users sheet
    const userSheet = XLSX.utils.json_to_sheet(users);
    XLSX.utils.book_append_sheet(workbook, userSheet, 'Users');

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, 'train_station_database.xlsx');
}

// Function to download only train database
function downloadTrainDatabase() {
    let data = trainDatabase;
    let filename = 'train_database.xlsx';
    if (currentUser === 'admin') {
        const username = prompt('Enter username to download train database for:');
        if (username) {
            const user = users.find(u => u.username === username);
            if (user) {
                const station = user.stationName || 'Central Station';
                data = trainDatabase.filter(t => t.station === station);
                filename = `train_database_${username}.xlsx`;
            } else {
                alert('User not found.');
                return;
            }
        } else {
            return;
        }
    } else {
        const user = users.find(u => u.username === currentUser);
        const userStation = user ? user.stationName : 'Central Station';
        data = trainDatabase.filter(t => t.station === userStation);
    }
    const workbook = XLSX.utils.book_new();
    const trainSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, trainSheet, 'Train Database');
    XLSX.writeFile(workbook, filename);
}

// Function to download only activities database
function downloadActivitiesDatabase() {
    const workbook = XLSX.utils.book_new();
    const activitySheet = XLSX.utils.json_to_sheet(activities);
    XLSX.utils.book_append_sheet(workbook, activitySheet, 'Activities');
    XLSX.writeFile(workbook, 'activities_database.xlsx');
}

function showUserSelectionModal() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const btn = document.createElement('button');
        btn.textContent = user.username + ' (' + (user.stationName || 'Central Station') + ')';
        btn.addEventListener('click', () => {
            downloadForUser(user.username, downloadType);
            document.getElementById('userSelectionModal').style.display = 'none';
        });
        userList.appendChild(btn);
    });
    document.getElementById('userSelectionModal').style.display = 'block';
}

function showUserSelectionModalForTrain() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const btn = document.createElement('button');
        btn.textContent = user.username + ' (' + (user.stationName || 'Central Station') + ')';
        btn.addEventListener('click', () => {
            viewTrainTableForUser(user.username);
            document.getElementById('userSelectionModal').style.display = 'none';
        });
        userList.appendChild(btn);
    });
    document.getElementById('userSelectionModal').style.display = 'block';
}

function showUserSelectionModalForActivity() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const btn = document.createElement('button');
        btn.textContent = user.username + ' (' + (user.stationName || 'Central Station') + ')';
        btn.addEventListener('click', () => {
            viewActivityTableForUser(user.username);
            document.getElementById('userSelectionModal').style.display = 'none';
        });
        userList.appendChild(btn);
    });
    document.getElementById('userSelectionModal').style.display = 'block';
}

function viewTrainTableForUser(username) {
    document.getElementById('page1').classList.remove('active');
    document.getElementById('page3').classList.add('active');
    document.getElementById('page2').classList.remove('active');
    document.getElementById('page4').classList.remove('active');
    document.getElementById('page5').classList.remove('active');
    const user = users.find(u => u.username === username);
    const stationName = user ? user.stationName || username : username;
    document.querySelector('#page3 h1').textContent = `Train Time Table for ${stationName}`;
    renderTrainTableForUser(username);
}

function viewActivityTableForUser(username) {
    document.getElementById('page1').classList.remove('active');
    document.getElementById('page4').classList.add('active');
    document.getElementById('page2').classList.remove('active');
    document.getElementById('page3').classList.remove('active');
    document.getElementById('page5').classList.remove('active');
    const user = users.find(u => u.username === username);
    const stationName = username === 'admin' ? 'All Stations' : (user ? user.stationName || username : username);
    document.getElementById('activityHeader').textContent = `Train Announcement Today at ${stationName} `;
    renderActivityTableForUser(username);
}

function renderTrainTableForUser(username) {
    const tbody = document.getElementById('trainTimeTableBody');
    tbody.innerHTML = '';
    const user = users.find(u => u.username === username);
    const userStation = user ? user.stationName : 'Central Station';
    const filteredTrains = trainDatabase.filter(train => train.station === userStation);
    filteredTrains.forEach((train, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${train.number}</td>
            <td class="train-name">${train.name}</td>
            <td class="train-arrival">${train.arrival}</td>
            <td class="train-departure">${train.departure}</td>
            <td class="train-updn">${train.updn}</td>
            <td>
                <button class="edit-btn" data-train="${train.number}" title="Edit">✏️</button>
                <button class="delete-btn" data-train="${train.number}" title="Delete">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Attach event listeners for edit and delete
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEdit);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

function renderActivityTableForUser(username) {
    const tbody = document.getElementById('activityTableBody');
    tbody.innerHTML = '';
    let filteredActivities;
    if (username === 'admin') {
        // Admin sees only activities announced by admin
        filteredActivities = activities.filter(activity => activity.announcedBy === 'admin');
    } else {
        const user = users.find(u => u.username === username);
        const userStation = user ? user.stationName : 'Central Station';
        filteredActivities = activities.filter(activity => activity.station === userStation);
    }
    filteredActivities.forEach(activity => {
        const time = new Date(activity.timestamp).toLocaleString();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${activity.serialNo}</td>
            <td>${time}</td>
            <td>${activity.trainNo}</td>
            <td>${activity.trainName}</td>
            <td>${activity.platformNumber}</td>
            <td>${activity.status}</td>
        `;
        tbody.appendChild(row);
    });
}

function downloadForUser(username, type) {
    if (type === 'train') {
        downloadTrainDatabaseForUser(username);
    } else if (type === 'activities') {
        downloadActivitiesDatabaseForUser(username);
    }
}

function downloadTrainDatabaseForUser(username) {
    const user = users.find(u => u.username === username);
    if (user) {
        const station = user.stationName || 'Central Station';
        const data = trainDatabase.filter(t => t.station === station);
        const filename = `train_database_${username}.xlsx`;
        const workbook = XLSX.utils.book_new();
        const trainSheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, trainSheet, 'Train Database');
        XLSX.writeFile(workbook, filename);
    } else {
        alert('User not found.');
    }
}

function downloadActivitiesDatabaseForUser(username) {
    const user = users.find(u => u.username === username);
    if (user) {
        const station = user.stationName || 'Central Station';
        const data = activities.filter(a => a.station === station);
        const filename = `activities_database_${username}.xlsx`;
        const workbook = XLSX.utils.book_new();
        const activitySheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, activitySheet, 'Activities');
        XLSX.writeFile(workbook, filename);
    } else {
        alert('User not found.');
    }
}

// Function to download only users database
function downloadUsersDatabase() {
    const workbook = XLSX.utils.book_new();
    const userSheet = XLSX.utils.json_to_sheet(users);
    XLSX.utils.book_append_sheet(workbook, userSheet, 'Users');
    XLSX.writeFile(workbook, 'users_database.xlsx');
}

// Handle file input change to display file name
document.getElementById('excelFileInput').addEventListener('change', function() {
    const file = this.files[0];
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    if (file) {
        fileNameDisplay.textContent = file.name;
    } else {
        fileNameDisplay.textContent = 'No file chosen';
    }
});

// Handle Excel upload button
document.getElementById('uploadExcelBtn').addEventListener('click', function() {
    const fileInput = document.getElementById('excelFileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select an Excel file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Assume first row is headers, skip it
        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        // Preview the data in modal
        const previewDiv = document.getElementById('excelPreview');
        previewDiv.innerHTML = '<table border="1"><thead><tr>';
        headers.forEach(header => {
            previewDiv.innerHTML += `<th>${header}</th>`;
        });
        previewDiv.innerHTML += '</tr></thead><tbody>';
        rows.forEach(row => {
            previewDiv.innerHTML += '<tr>';
            row.forEach(cell => {
                previewDiv.innerHTML += `<td>${cell}</td>`;
            });
            previewDiv.innerHTML += '</tr>';
        });
        previewDiv.innerHTML += '</tbody></table>';

        // Store data for confirmation
        window.pendingExcelData = rows.map(row => ({
            number: row[0] ? row[0].toString() : '',
            name: row[1] ? row[1].toString() : '',
            arrival: row[2] ? row[2].toString() : '',
            departure: row[3] ? row[3].toString() : '',
            updn: row[4] ? row[4].toString() : ''
        }));

        document.getElementById('excelUploadModal').style.display = 'block';
    };
    reader.readAsArrayBuffer(file);
});

// Handle confirm upload
document.getElementById('confirmUploadBtn').addEventListener('click', function() {
    if (window.pendingExcelData) {
        const user = users.find(u => u.username === currentUser);
        const userStation = user ? user.stationName : 'Central Station';

        window.pendingExcelData.forEach(train => {
            if (train.number && train.name && train.arrival && train.departure && train.updn) {
                const existingTrain = trainDatabase.find(t => t.number === train.number);
                if (!existingTrain) {
                    train.station = userStation;
                    trainDatabase.push(train);
                }
            }
        });
        saveDatabase();
        renderTrainTable();
        alert('Trains uploaded successfully!');
        document.getElementById('excelUploadModal').style.display = 'none';
        document.getElementById('excelFileInput').value = '';
        window.pendingExcelData = null;
    }
});

// Handle cancel upload
document.getElementById('cancelUploadBtn').addEventListener('click', function() {
    document.getElementById('excelUploadModal').style.display = 'none';
    document.getElementById('excelFileInput').value = '';
    window.pendingExcelData = null;
});

// Handle download sample Excel file
document.getElementById('downloadSampleBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const workbook = XLSX.utils.book_new();
    const sampleData = [
        ['Train Number', 'Train Name', 'Train arrival', 'Train departure', 'UP/DN'],
        ['12345', 'Express Train', '10:00', '10:30', 'UP'],
        ['67890', 'Superfast Express', '11:00', '11:30', 'DN'],
        ['11111', 'Local Train', '12:00', '12:30', 'UP']
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample Train Data');
    XLSX.writeFile(workbook, 'sample_train_data.xlsx');
});

// Initialize: Check for clearing on page load
checkAndClearActivities();
