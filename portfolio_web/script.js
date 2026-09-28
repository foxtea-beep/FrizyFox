// Default Initial Data
const defaultData = {
  theme: "dark-glass",
  avatar: "images/FrizyFox.PNG",
  name: "FrizyFox",
  handle: "@ItsFoxTea",
  bio: "meow beep boop",
  trackTitle: "N/A",
  trackArtist: "N/A",
  links: [
    { title: "Portfolio & Projects", url: "https://example.com", icon: "fa-solid fa-globe" },
    { title: "GitHub Profile", url: "https://github.com", icon: "fa-brands fa-github" },
    { title: "YouTube Channel", url: "https://youtube.com", icon: "fa-brands fa-youtube" },
    { title: "Spotify Artist", url: "https://spotify.com", icon: "fa-brands fa-spotify" },
    { title: "Instagram", url: "https://instagram.com", icon: "fa-brands fa-instagram" },
    { title: "Twitter / X", url: "https://twitter.com", icon: "fa-brands fa-x-twitter" },
    { title: "Buy Me a Coffee", url: "https://buymeacoffee.com", icon: "fa-solid fa-mug-hot" }
  ]
};

// Current State
let state = JSON.parse(localStorage.getItem('linkTreeState')) || { ...defaultData };

// DOM Elements
const body = document.body;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themePopover = document.getElementById('themePopover');
const themeBtns = document.querySelectorAll('.theme-btn');

const editToggleBtn = document.getElementById('editToggleBtn');
const closeDrawerBtn = document.getElementById('closeDrawerBtn');
const customizerDrawer = document.getElementById('customizerDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');

const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileHandle = document.getElementById('profileHandle');
const profileBio = document.getElementById('profileBio');
const linksList = document.getElementById('linksList');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const footerName = document.getElementById('footerName');

const inputAvatar = document.getElementById('inputAvatar');
const inputName = document.getElementById('inputName');
const inputHandle = document.getElementById('inputHandle');
const inputBio = document.getElementById('inputBio');
const inputTrackTitle = document.getElementById('inputTrackTitle');
const inputTrackArtist = document.getElementById('inputTrackArtist');
const linkInputsContainer = document.getElementById('linkInputsContainer');

const addLinkBtn = document.getElementById('addLinkBtn');
const saveCustomizationBtn = document.getElementById('saveCustomizationBtn');
const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');

const shareBtn = document.getElementById('shareBtn');
const toast = document.getElementById('toast');

const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');

// Available Icon Options for dropdown
const availableIcons = [
  { label: 'Globe / Web', value: 'fa-solid fa-globe' },
  { label: 'GitHub', value: 'fa-brands fa-github' },
  { label: 'YouTube', value: 'fa-brands fa-youtube' },
  { label: 'Spotify', value: 'fa-brands fa-spotify' },
  { label: 'Instagram', value: 'fa-brands fa-instagram' },
  { label: 'Twitter / X', value: 'fa-brands fa-x-twitter' },
  { label: 'LinkedIn', value: 'fa-brands fa-linkedin' },
  { label: 'TikTok', value: 'fa-brands fa-tiktok' },
  { label: 'Discord', value: 'fa-brands fa-discord' },
  { label: 'Coffee / Support', value: 'fa-solid fa-mug-hot' },
  { label: 'Store / Shop', value: 'fa-solid fa-bag-shopping' },
  { label: 'Email', value: 'fa-solid fa-envelope' }
];

// Initialize Application
function init() {
  document.getElementById('year').textContent = new Date().getFullYear();
  renderProfile();
  setupEventListeners();
}

// Render Main Profile Card
function renderProfile() {
  // Apply theme
  body.setAttribute('data-theme', state.theme);
  
  // Highlight active theme popover button
  themeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === state.theme);
  });

  // Render text & images
  profileAvatar.src = state.avatar;
  profileName.textContent = state.name;
  profileHandle.textContent = state.handle;
  profileBio.textContent = state.bio;
  footerName.textContent = state.name;

  trackTitle.textContent = state.trackTitle;
  trackArtist.textContent = state.trackArtist;

  // Render Links Stack
  linksList.innerHTML = state.links.map(link => `
    <a href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer" class="link-card">
      <div class="link-left">
        <i class="${escapeHTML(link.icon)} link-icon"></i>
        <span>${escapeHTML(link.title)}</span>
      </div>
      <i class="fa-solid fa-chevron-right link-arrow"></i>
    </a>
  `).join('');
}

// Populate Inputs in Customizer Drawer
function populateDrawerInputs() {
  inputAvatar.value = state.avatar;
  inputName.value = state.name;
  inputHandle.value = state.handle;
  inputBio.value = state.bio;
  inputTrackTitle.value = state.trackTitle;
  inputTrackArtist.value = state.trackArtist;

  renderLinkEditors();
}

// Render Dynamic Link Inputs in Drawer
function renderLinkEditors() {
  linkInputsContainer.innerHTML = '';
  state.links.forEach((link, index) => {
    const card = document.createElement('div');
    card.className = 'link-input-card';
    card.innerHTML = `
      <div class="link-input-card-header">
        <span class="drag-handle"><i class="fa-solid fa-bars"></i> Link #${index + 1}</span>
        <button type="button" class="btn-remove-link" onclick="removeLink(${index})">
          <i class="fa-solid fa-trash"></i> Remove
        </button>
      </div>
      <input type="text" class="form-input link-title-input" value="${escapeHTML(link.title)}" placeholder="Title (e.g. My Portfolio)" data-index="${index}">
      <input type="text" class="form-input link-url-input" value="${escapeHTML(link.url)}" placeholder="URL (https://...)" data-index="${index}">
      <select class="form-input link-icon-select" data-index="${index}">
        ${availableIcons.map(icon => `
          <option value="${icon.value}" ${icon.value === link.icon ? 'selected' : ''}>${icon.label}</option>
        `).join('')}
      </select>
    `;
    linkInputsContainer.appendChild(card);
  });
}

// Add New Link Handler
function addLink() {
  state.links.push({
    title: "New Link",
    url: "https://example.com",
    icon: "fa-solid fa-globe"
  });
  renderLinkEditors();
}

// Remove Link Handler
window.removeLink = function(index) {
  state.links.splice(index, 1);
  renderLinkEditors();
};

// Event Listeners
function setupEventListeners() {
  // Theme Popover Toggle
  themeToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    themePopover.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!themePopover.contains(e.target) && e.target !== themeToggleBtn) {
      themePopover.classList.remove('active');
    }
  });

  // Switch Theme
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTheme = btn.getAttribute('data-theme');
      state.theme = selectedTheme;
      body.setAttribute('data-theme', selectedTheme);
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      saveState();
      themePopover.classList.remove('active');
      showToast("Theme updated!");
    });
  });

  // Customizer Drawer Open/Close
  editToggleBtn.addEventListener('click', () => {
    populateDrawerInputs();
    customizerDrawer.classList.add('active');
    drawerOverlay.classList.add('active');
  });

  const closeDrawer = () => {
    customizerDrawer.classList.remove('active');
    drawerOverlay.classList.remove('active');
  };

  closeDrawerBtn.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);

  // Add Link Button
  addLinkBtn.addEventListener('click', addLink);

  // Save Customizations
  saveCustomizationBtn.addEventListener('click', () => {
    state.avatar = inputAvatar.value.trim() || defaultData.avatar;
    state.name = inputName.value.trim() || defaultData.name;
    state.handle = inputHandle.value.trim() || defaultData.handle;
    state.bio = inputBio.value.trim();
    state.trackTitle = inputTrackTitle.value.trim() || defaultData.trackTitle;
    state.trackArtist = inputTrackArtist.value.trim() || defaultData.trackArtist;

    // Collect Dynamic Links
    const linkCards = linkInputsContainer.querySelectorAll('.link-input-card');
    const updatedLinks = [];

    linkCards.forEach(card => {
      const title = card.querySelector('.link-title-input').value.trim();
      const url = card.querySelector('.link-url-input').value.trim();
      const icon = card.querySelector('.link-icon-select').value;
      if (title && url) {
        updatedLinks.push({ title, url, icon });
      }
    });

    state.links = updatedLinks;
    saveState();
    renderProfile();
    closeDrawer();
    showToast("Profile changes saved!");
  });

  // Reset Defaults
  resetDefaultsBtn.addEventListener('click', () => {
    if (confirm("Reset profile back to default settings?")) {
      state = JSON.parse(JSON.stringify(defaultData));
      saveState();
      renderProfile();
      populateDrawerInputs();
      showToast("Reset to defaults!");
    }
  });

  // Share Button
  shareBtn.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({
        title: state.name,
        text: `Check out ${state.name}'s profile links!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("Profile URL copied to clipboard!");
    }
  });

  // Audio Player Toggle
  let isPlaying = false;
  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      audioPlayer.pause();
      playIcon.className = "fa-solid fa-play";
    } else {
      audioPlayer.play().then(() => {
        playIcon.className = "fa-solid fa-pause";
      }).catch(() => {
        showToast("Audio playback interrupted");
      });
    }
    isPlaying = !isPlaying;
  });

  audioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    playIcon.className = "fa-solid fa-play";
  });
}

// Utility: Save State to LocalStorage
function saveState() {
  localStorage.setItem('linkTreeState', JSON.stringify(state));
}

// Utility: Show Toast Message
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('active');
  setTimeout(() => {
    toast.classList.remove('active');
  }, 2500);
}

// Utility: HTML Sanitizer
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Run Application
document.addEventListener('DOMContentLoaded', init);