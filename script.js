// Default Initial Data
const defaultData = {
  theme: "midnight-purple",
  avatar: "image/main/FrizyFox.PNG",
  name: "FrizyFox",
  handle: "@ItsFoxTea",
  bio: "meow beep boop",
  links: [
    { title: "Instagram", url: "https://instagram.com/itsfoxtea", icon: "fa-brands fa-instagram" },
    { title: "Twitter", url: "https://x.com/ItsFoxTea", icon: "fa-brands fa-twitter" },
    { title: "TikTok", url: "https://tiktok.com/@itsfoxtea", icon: "fa-brands fa-tiktok" },
    { title: "not working button ", url: "https://foxtea-beep.github.io/FrizyFox_OLD/", icon: "fa-solid fa-xmark" }
  ]
};

// Local variable to store current live comments from Firebase
let comments = [];

// NEW (forces browser to use defaultData)
let state = { ...defaultData };

// Pagination state
let currentPage = 1;
const COMMENTS_PER_PAGE = 5;

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
const footerName = document.getElementById('footerName');

const inputAvatar = document.getElementById('inputAvatar');
const inputName = document.getElementById('inputName');
const inputHandle = document.getElementById('inputHandle');
const inputBio = document.getElementById('inputBio');
const linkInputsContainer = document.getElementById('linkInputsContainer');

const addLinkBtn = document.getElementById('addLinkBtn');
const saveCustomizationBtn = document.getElementById('saveCustomizationBtn');
const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');

const shareBtn = document.getElementById('shareBtn');
const toast = document.getElementById('toast');

const authorCounter = document.getElementById('authorCounter');
const textCounter = document.getElementById('textCounter');

const commentForm = document.getElementById('commentForm');
const commentAuthor = document.getElementById('commentAuthor');
const commentText = document.getElementById('commentText');
const commentsList = document.getElementById('commentsList');
const commentCount = document.getElementById('commentCount');

const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageIndicator = document.getElementById('pageIndicator');

// Initialize Application
function init() {
  document.getElementById('year').textContent = new Date().getFullYear();
  renderProfile();
  setupEventListeners();
  initFirebaseComments();
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

// Event Listeners
function setupEventListeners() {
  // Theme Popover Toggle
  if (themeToggleBtn && themePopover) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themePopover.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!themePopover.contains(e.target) && e.target !== themeToggleBtn) {
        themePopover.classList.remove('active');
      }
    });
  }

  // Pagination Button Click Listeners
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderComments();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(comments.length / COMMENTS_PER_PAGE);
      if (currentPage < totalPages) {
        currentPage++;
        renderComments();
      }
    });
  }

  // Toggle Gallery & Links View (with heading toggle)
  const galleryToggleBtn = document.getElementById('galleryToggleBtn');
  const galleryCard = document.getElementById('galleryCard');
  const linksList = document.getElementById('linksList');
  const sectionHeading = document.getElementById('sectionHeading');

  if (galleryToggleBtn && galleryCard && linksList) {
    galleryToggleBtn.addEventListener('click', () => {
      const isGalleryVisible = galleryCard.style.display !== 'none';

      if (isGalleryVisible) {
        // Switch to Links View
        galleryCard.style.display = 'none';
        linksList.style.display = 'flex';
        if (sectionHeading) sectionHeading.style.display = 'block';
        galleryToggleBtn.querySelector('i').className = 'fa-solid fa-images';
      } else {
        // Switch to Gallery View
        galleryCard.style.display = 'flex';
        linksList.style.display = 'none';
        if (sectionHeading) sectionHeading.style.display = 'none';
        galleryToggleBtn.querySelector('i').className = 'fa-solid fa-list';
        showToast("Switched to Gallery View");
      }
    });
  }

  // Real-time character counter setup
  function setupCharCounter(inputEl, counterEl) {
    if (!inputEl || !counterEl) return;
    inputEl.addEventListener('input', () => {
      const currentLength = Array.from(inputEl.value).length;
      counterEl.textContent = `${currentLength}/50`;
      
      if (currentLength >= 50) {
        counterEl.classList.add('limit-reached');
      } else {
        counterEl.classList.remove('limit-reached');
      }
    });
  }

  setupCharCounter(commentAuthor, authorCounter);
  setupCharCounter(commentText, textCounter);

  // Single Comment Form Submission Handler with Specific Name Restrictions
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const author = commentAuthor.value.trim();
      const text = commentText.value.trim();

      // Name Rule: Only letters, numbers, underscores (_), hyphens (-), and spaces
      const authorRegex = /^[\p{L}\p{N}\s_-]*$/u;

      // Comment Text Rule: Letters, numbers, allowed punctuation (. , ? ! " '), whitespace, and emojis
      const textRegex = /^[\p{L}\p{N}\s.,?!'"]*$/u;

      if (!author || !text) {
        showToast("Please fill in both fields.");
        return;
      }

      if (Array.from(author).length > 50 || Array.from(text).length > 50) {
        showToast("Maximum 50 characters allowed!");
        return;
      }

      // Check author/name restriction
      if (!authorRegex.test(author)) {
        showToast("Name can only contain letters, numbers, and special characters (_ and -).");
        return;
      }

      // Check comment message restriction
      if (!textRegex.test(text)) {
        showToast("Comment text can only contain letters, numbers, emojis & punctuation (. , ? ! \" ').");
        return;
      }

      try {
        const { collection, addDoc, serverTimestamp } = window.firebaseFS;
        await addDoc(collection(window.db, "comments"), {
          author: author,
          text: text,
          createdAt: serverTimestamp()
        });

        // Clear all form input fields
        commentAuthor.value = '';
        commentText.value = '';

        // Reset character counters
        if (authorCounter) {
          authorCounter.textContent = '0/50';
          authorCounter.classList.remove('limit-reached');
        }
        if (textCounter) {
          textCounter.textContent = '0/50';
          textCounter.classList.remove('limit-reached');
        }

        currentPage = 1;
        showToast("Comment posted!");
      } catch (err) {
        console.error("Error adding comment to Firebase: ", err);
        showToast("Failed to post comment.");
      }
    });
  }
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

function renderComments() {
  const totalComments = comments.length;
  commentCount.textContent = totalComments;

  if (totalComments === 0) {
    commentsList.innerHTML = `<div class="no-comments">No comments yet. Be the first to say hi!</div>`;
    if (pageIndicator) pageIndicator.textContent = "Page 1 of 1";
    if (prevPageBtn) prevPageBtn.disabled = true;
    if (nextPageBtn) nextPageBtn.disabled = true;
    return;
  }

  const totalPages = Math.ceil(totalComments / COMMENTS_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  // Calculate slice range for current page
  const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE;
  const endIndex = startIndex + COMMENTS_PER_PAGE;
  const pageComments = comments.slice(startIndex, endIndex);

  commentsList.innerHTML = pageComments.map(c => `
    <div class="comment-item">
      <div class="comment-header">
        <div class="comment-author-info">
          <div class="comment-avatar">${escapeHTML(c.author.charAt(0).toUpperCase())}</div>
          <span class="comment-author-name">${escapeHTML(c.author)}</span>
        </div>
        <span class="comment-time">${escapeHTML(c.time)}</span>
      </div>
      <div class="comment-body">${escapeHTML(c.text)}</div>
    </div>
  `).join('');

  // Update pagination button states & page indicator
  if (pageIndicator) pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
  if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
  if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
}

// Real-time listener for Firebase Firestore comments
function initFirebaseComments() {
  if (!window.db) {
    setTimeout(initFirebaseComments, 100);
    return;
  }

  const { collection, query, orderBy, onSnapshot } = window.firebaseFS;
  const q = query(collection(window.db, "comments"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    if (snapshot.metadata.hasPendingWrites) {
      return;
    }

    comments = snapshot.docs.map(doc => {
      const data = doc.data();
      let formattedTime = "Recently";
      if (data.createdAt) {
        const date = data.createdAt.toDate();
        formattedTime = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return {
        id: doc.id,
        author: data.author || "Anonymous",
        text: data.text || "",
        time: formattedTime
      };
    });
    
    renderComments();
  }, (error) => {
    console.error("Firebase error reading comments:", error);
  });
}

// Run Application
document.addEventListener('DOMContentLoaded', init);
