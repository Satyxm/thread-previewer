// Session storage keys
const SESSION_KEYS = {
    PROFILE_NAME: 'threader_profile_name',
    PROFILE_HANDLE: 'threader_profile_handle',
    PROFILE_AVATAR: 'threader_profile_avatar',
    TWEETS: 'threader_tweets'
};

// Default values
const DEFAULT_VALUES = {
    PROFILE_NAME: 'Your Name',
    PROFILE_HANDLE: 'yourhandle',
    PROFILE_AVATAR: ''
};

// Tweet counter
let tweetCounter = 0;

// Function to save data to session storage
function saveToSession(key, value) {
    sessionStorage.setItem(key, value);
}

// Function to get data from session storage
function getFromSession(key, defaultValue) {
    return sessionStorage.getItem(key) || defaultValue;
}

// Function to reset session
function resetSession() {
    sessionStorage.clear();
    resetToDefaults();
    tweetCounter = 0;
    updatePreview();
}

// Function to reset to default values
function resetToDefaults() {
    document.getElementById('profile-name').value = DEFAULT_VALUES.PROFILE_NAME;
    document.getElementById('profile-handle').value = DEFAULT_VALUES.PROFILE_HANDLE;
    const avatarImg = document.getElementById('profile-avatar').querySelector('img');
    if (avatarImg) {
        avatarImg.remove();
    }
    const defaultIcon = document.createElement('i');
    defaultIcon.className = 'fas fa-user';
    document.getElementById('profile-avatar').appendChild(defaultIcon);
}

// Function to handle profile photo upload
function handleProfilePhotoUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarContainer = document.getElementById('profile-avatar');
            const existingImg = avatarContainer.querySelector('img');
            const existingIcon = avatarContainer.querySelector('i');
            
            if (existingImg) {
                existingImg.remove();
            }
            if (existingIcon) {
                existingIcon.remove();
            }
            
            const img = document.createElement('img');
            img.src = e.target.result;
            avatarContainer.appendChild(img);
            
            // Save to session storage
            saveToSession(SESSION_KEYS.PROFILE_AVATAR, e.target.result);
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

// Function to update preview
function updatePreview() {
    const previewContainer = document.getElementById('preview-container');
    const tweetInputs = document.querySelectorAll('.tweet-input');
    
    // Get profile information from session storage or defaults
    const profileName = document.getElementById('profile-name').value || DEFAULT_VALUES.PROFILE_NAME;
    const profileHandle = document.getElementById('profile-handle').value || DEFAULT_VALUES.PROFILE_HANDLE;
    const formattedHandle = profileHandle.startsWith('@') ? profileHandle : `@${profileHandle}`;
    const profileAvatar = document.getElementById('profile-avatar').querySelector('img');
    const avatarSrc = profileAvatar ? profileAvatar.src : '';
    
    // Save current values to session storage
    saveToSession(SESSION_KEYS.PROFILE_NAME, profileName);
    saveToSession(SESSION_KEYS.PROFILE_HANDLE, profileHandle);
    
    previewContainer.innerHTML = '';
    
    tweetInputs.forEach((input, index) => {
        const tweetContainer = input.closest('.tweet-input-container');
        const mediaPreview = tweetContainer.querySelector('.media-preview');
        const hasContent = input.value.trim() !== '';
        const hasMedia = mediaPreview.children.length > 0;
        const hasPoll = tweetContainer.querySelector('.poll-container').style.display !== 'none';
        
        if (!hasContent && !hasMedia && !hasPoll) return;
        
        const tweetElement = document.createElement('div');
        tweetElement.className = 'preview-tweet';
        
        const currentTime = new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric'
        });
        
        let mediaContent = '';
        if (hasMedia) {
            mediaContent = Array.from(mediaPreview.children).map(media => {
                const mediaElement = media.querySelector('img, video');
                return `<div class="tweet-media">${mediaElement.outerHTML}</div>`;
            }).join('');
        }
        
        let pollContent = '';
        if (hasPoll) {
            const pollContainer = tweetContainer.querySelector('.poll-container');
            const pollOptions = Array.from(pollContainer.querySelectorAll('.poll-option'))
                .map(option => option.value || option.placeholder)
                .filter(option => option !== '');
            
            if (pollOptions.length > 0) {
                pollContent = `
                    <div class="tweet-poll">
                        ${pollOptions.map(option => `
                            <div class="poll-option-preview">
                                <span>${option}</span>
                                <div class="poll-bar" style="width: ${Math.random() * 100}%"></div>
                            </div>
                        `).join('')}
                        <div class="poll-duration">
                            ${pollContainer.querySelector('select').value} days left
                        </div>
                    </div>
                `;
            }
        }
        
        tweetElement.innerHTML = `
            <div class="tweet-content">
                <div class="tweet-header">
                    <div class="tweet-avatar">
                        ${avatarSrc ? `<img src="${avatarSrc}" alt="Profile photo">` : ''}
                    </div>
                    <div class="tweet-info">
                        <span class="tweet-name">${profileName}</span>
                        <span class="tweet-handle">${formattedHandle}</span>
                        <span class="tweet-time">· ${currentTime}</span>
                    </div>
                </div>
                <div class="tweet-text">${input.value}</div>
                ${mediaContent}
                ${pollContent}
                <div class="tweet-actions">
                    <div class="tweet-action">
                        <i class="far fa-comment"></i>
                        <span>1</span>
                    </div>
                    <div class="tweet-action">
                        <i class="fas fa-retweet"></i>
                        <span>0</span>
                    </div>
                    <div class="tweet-action">
                        <i class="far fa-heart"></i>
                        <span>0</span>
                    </div>
                    <div class="tweet-action">
                        <i class="far fa-share-square"></i>
                    </div>
                </div>
            </div>
        `;
        
        previewContainer.appendChild(tweetElement);
    });
}

// Initialize the first tweet input
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data from session storage
    const savedName = getFromSession(SESSION_KEYS.PROFILE_NAME, DEFAULT_VALUES.PROFILE_NAME);
    const savedHandle = getFromSession(SESSION_KEYS.PROFILE_HANDLE, DEFAULT_VALUES.PROFILE_HANDLE);
    const savedAvatar = getFromSession(SESSION_KEYS.PROFILE_AVATAR, '');
    
    // Set saved values
    document.getElementById('profile-name').value = savedName;
    document.getElementById('profile-handle').value = savedHandle;
    
    if (savedAvatar) {
        const avatarContainer = document.getElementById('profile-avatar');
        const existingIcon = avatarContainer.querySelector('i');
        if (existingIcon) {
            existingIcon.remove();
        }
        const img = document.createElement('img');
        img.src = savedAvatar;
        avatarContainer.appendChild(img);
    }
    
    // Setup event listeners
    setupTweetInput(document.querySelector('.tweet-input'));
    setupProgressRing();
    updatePreview();
    
    // Setup profile handle input
    const handleInput = document.getElementById('profile-handle');
    handleInput.addEventListener('input', (e) => {
        let value = e.target.value;
        // Remove @ if user types it
        if (value.startsWith('@')) {
            value = value.substring(1);
        }
        e.target.value = value;
        updatePreview();
    });
    
    // Setup reset button
    document.querySelector('.reset-session').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
            resetSession();
        }
    });
});

function setupProgressRing() {
    const circles = document.querySelectorAll('.progress-ring__circle');
    circles.forEach(circle => {
        const radius = circle.r.baseVal.value;
        circle.style.strokeDasharray = `${radius * 2 * Math.PI} ${radius * 2 * Math.PI}`;
        circle.style.strokeDashoffset = radius * 2 * Math.PI;
    });
}

function updateProgressRing(remaining, textarea) {
    const circle = textarea.closest('.tweet-input-container').querySelector('.progress-ring__circle');
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (remaining / 280) * circumference;
    circle.style.strokeDashoffset = offset;

    // Update color based on remaining characters
    circle.classList.remove('progress-ring__circle--warning', 'progress-ring__circle--danger');
    if (remaining < 20) {
        circle.classList.add('progress-ring__circle--danger');
    } else if (remaining < 50) {
        circle.classList.add('progress-ring__circle--warning');
    }
}

function setupTweetInput(textarea) {
    textarea.addEventListener('input', (e) => {
        const maxLength = 280;
        const currentLength = e.target.value.length;
        
        if (currentLength > maxLength) {
            e.target.value = e.target.value.substring(0, maxLength);
        }
        
        updatePreview();
    });
}

function handleImageUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaPreview = input.closest('.tweet-input-container').querySelector('.media-preview');
            const mediaElement = document.createElement('div');
            mediaElement.className = 'media-item';
            mediaElement.innerHTML = `
                <img src="${e.target.result}" alt="Uploaded image">
                <button class="remove-media" onclick="removeMedia(this)">
                    <i class="fas fa-times"></i>
                </button>
            `;
            mediaPreview.appendChild(mediaElement);
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

function handleGifUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const mediaPreview = input.closest('.tweet-input-container').querySelector('.media-preview');
            const mediaElement = document.createElement('div');
            mediaElement.className = 'media-item';
            
            if (file.type.startsWith('image/gif')) {
                mediaElement.innerHTML = `
                    <img src="${e.target.result}" alt="Uploaded GIF">
                    <button class="remove-media" onclick="removeMedia(this)">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            } else {
                mediaElement.innerHTML = `
                    <video src="${e.target.result}" controls>
                        Your browser does not support the video tag.
                    </video>
                    <button class="remove-media" onclick="removeMedia(this)">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
            
            mediaPreview.appendChild(mediaElement);
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

function removeMedia(button) {
    button.closest('.media-item').remove();
    updatePreview();
}

function togglePoll(button) {
    const pollContainer = button.closest('.tweet-input-container').querySelector('.poll-container');
    pollContainer.style.display = pollContainer.style.display === 'none' ? 'block' : 'none';
    updatePreview();
}

function addNewTweet() {
    const tweetsContainer = document.getElementById('tweets-container');
    const newTweetContainer = document.createElement('div');
    newTweetContainer.className = 'tweet-input-container';
    tweetCounter++;
    
    if (tweetCounter > 25) {
        alert('Maximum 25 tweets allowed in a thread!');
        tweetCounter--;
        return;
    }
    
    newTweetContainer.innerHTML = `
        <div class="tweet-input-wrapper">
            <textarea class="tweet-input" placeholder="Continue your thread... (${tweetCounter}/25)" maxlength="280"></textarea>
            <div class="media-preview"></div>
            <div class="poll-container" style="display: none;">
                <div class="poll-options">
                    <input type="text" class="poll-option" placeholder="Option 1">
                    <input type="text" class="poll-option" placeholder="Option 2">
                    <input type="text" class="poll-option" placeholder="Option 3">
                    <input type="text" class="poll-option" placeholder="Option 4">
                </div>
                <div class="poll-duration">
                    <select>
                        <option value="1">1 day</option>
                        <option value="3">3 days</option>
                        <option value="7">7 days</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="tweet-actions">
            <div class="media-actions">
                <label class="media-btn">
                    <i class="far fa-image"></i>
                    <input type="file" accept="image/*" onchange="handleImageUpload(this)">
                </label>
                <label class="media-btn">
                    <i class="far fa-file-video"></i>
                    <input type="file" accept="video/*,image/gif" onchange="handleGifUpload(this)">
                </label>
                <button class="media-btn" onclick="togglePoll(this)">
                    <i class="fas fa-chart-bar"></i>
                </button>
            </div>
            <div class="tweet-buttons">
                <button class="delete-tweet-btn" onclick="deleteTweet(this)">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="add-tweet-btn" onclick="addNewTweet()">
                    <i class="fas fa-plus"></i> Add Post
                </button>
            </div>
        </div>
    `;
    
    tweetsContainer.appendChild(newTweetContainer);
    setupTweetInput(newTweetContainer.querySelector('.tweet-input'));
    updatePreview();
}

function deleteTweet(button) {
    const tweetContainer = button.closest('.tweet-input-container');
    const tweetsContainer = document.getElementById('tweets-container');
    const isFirstTweet = tweetContainer === tweetsContainer.firstElementChild;
    
    if (!isFirstTweet) {
        tweetContainer.remove();
        updatePreview();
    }
} 