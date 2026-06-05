/* ==========================================================================
   LIFE DASHBOARD - CORE ENGINE (VANILLA JS)
   ========================================================================== */

// --- LOCAL STORAGE KEYS ---
const THEME_KEY = 'life_dashboard_theme';
const NAME_KEY = 'life_dashboard_name';
const TASKS_KEY = 'life_dashboard_tasks';
const LINKS_KEY = 'life_dashboard_links';
const TIMER_MINS_KEY = 'life_dashboard_timer_mins';

// --- DEFAULTS ---
const DEFAULT_NAME = 'Ahmad';
const DEFAULT_TIMER_MINS = 25;
const DEFAULT_TASKS = [
    { id: 'task-1', text: 'Membaca buku 15 menit', completed: false, dateCreated: Date.now() - 3600000 },
    { id: 'task-2', text: 'Stretching & Olahraga ringan', completed: true, dateCreated: Date.now() - 7200000 }
];
const DEFAULT_LINKS = [
    { id: 'link-1', name: 'Google', url: 'https://google.com' },
    { id: 'link-2', name: 'Gmail', url: 'https://mail.google.com' },
    { id: 'link-3', name: 'GitHub', url: 'https://github.com' },
    { id: 'link-4', name: 'YouTube', url: 'https://youtube.com' }
];

// --- APP STATE ---
let state = {
    theme: 'dark',
    username: DEFAULT_NAME,
    timerMinutes: DEFAULT_TIMER_MINS,
    tasks: [],
    links: [],
    timer: {
        timeLeft: DEFAULT_TIMER_MINS * 60,
        totalSeconds: DEFAULT_TIMER_MINS * 60,
        isRunning: false,
        intervalId: null
    }
};

// ==========================================================================
//   APPLICATION INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initGreeting();
    initClock();
    initTimer();
    initTasks();
    initLinks();
    
    // Add animations to load
    document.querySelectorAll('.glass-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s, background-color var(--transition-normal), border var(--transition-normal)`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);
    });
});

// ==========================================================================
//   TOAST NOTIFICATION MODULE
// ==========================================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else if (type === 'warning') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3500);
}

// ==========================================================================
//   THEME MODULE (Light/Dark Mode Challenge)
// ==========================================================================
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem(THEME_KEY);
    
    if (savedTheme) {
        state.theme = savedTheme;
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        state.theme = prefersDark ? 'dark' : 'light';
    }

    applyTheme(false);

    toggleBtn.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(true);
    });
}

function applyTheme(showFeedback = true) {
    const body = document.body;
    if (state.theme === 'dark') {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        localStorage.setItem(THEME_KEY, 'dark');
        if (showFeedback) showToast('🌙 Mode gelap diaktifkan!', 'info');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        localStorage.setItem(THEME_KEY, 'light');
        if (showFeedback) showToast('☀️ Mode terang diaktifkan!', 'info');
    }
}

// ==========================================================================
//   CLOCK & GREETING MODULE (Custom Name Greeting Challenge)
// ==========================================================================
function initClock() {
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');

    function updateTime() {
        const now = new Date();
        
        let hrs = now.getHours().toString().padStart(2, '0');
        let mins = now.getMinutes().toString().padStart(2, '0');
        let secs = now.getSeconds().toString().padStart(2, '0');
        clockEl.textContent = `${hrs}:${mins}:${secs}`;
        
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('id-ID', options);
        
        updateGreetingMessage(now.getHours());
    }

    updateTime();
    setInterval(updateTime, 1000);
}

function initGreeting() {
    const nameEl = document.getElementById('username');
    const savedName = localStorage.getItem(NAME_KEY);
    
    if (savedName) {
        state.username = savedName;
    }
    
    nameEl.textContent = state.username;

    nameEl.addEventListener('blur', () => {
        saveNameChange(nameEl.textContent);
    });

    nameEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nameEl.blur();
        }
    });
}

function updateGreetingMessage(hour) {
    const greetingEl = document.getElementById('greeting-text');
    let greetingStr = '';

    if (hour >= 4 && hour < 11) {
        greetingStr = 'Selamat Pagi';
    } else if (hour >= 11 && hour < 15) {
        greetingStr = 'Selamat Siang';
    } else if (hour >= 15 && hour < 18.5) {
        greetingStr = 'Selamat Sore';
    } else {
        greetingStr = 'Selamat Malam';
    }

    if (greetingEl.textContent !== greetingStr) {
        greetingEl.textContent = greetingStr;
    }
}

function saveNameChange(newName) {
    const cleanName = newName.trim().substring(0, 25) || DEFAULT_NAME;
    const nameEl = document.getElementById('username');
    
    if (cleanName !== state.username) {
        state.username = cleanName;
        localStorage.setItem(NAME_KEY, cleanName);
        showToast(`Profil nama diperbarui menjadi "${cleanName}"!`, 'success');
    }
    nameEl.textContent = cleanName;
}

// ==========================================================================
//   POMODORO FOCUS TIMER (Change Pomodoro Time Challenge)
// ==========================================================================
function initTimer() {
    const stateLabelEl = document.getElementById('timer-state-label');
    const startBtn = document.getElementById('timer-start-btn');
    const stopBtn = document.getElementById('timer-stop-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    
    const settingsBtn = document.getElementById('timer-settings-btn');
    const settingsDrawer = document.getElementById('timer-settings');
    const inputMinutes = document.getElementById('timer-minutes');
    const saveSettingsBtn = document.getElementById('save-timer-settings');
    const presetBtns = document.querySelectorAll('.preset-btn');
    
    const savedTimerMins = localStorage.getItem(TIMER_MINS_KEY);
    if (savedTimerMins) {
        state.timerMinutes = parseInt(savedTimerMins, 10);
        inputMinutes.value = state.timerMinutes;
    }
    
    resetTimerState();

    settingsBtn.addEventListener('click', () => {
        settingsDrawer.classList.toggle('open');
    });

    saveSettingsBtn.addEventListener('click', () => {
        const val = parseInt(inputMinutes.value, 10);
        if (isNaN(val) || val < 1 || val > 180) {
            showToast('⚠️ Masukkan angka durasi fokus antara 1 hingga 180 menit!', 'warning');
            return;
        }
        
        state.timerMinutes = val;
        localStorage.setItem(TIMER_MINS_KEY, val);
        
        presetBtns.forEach(btn => {
            if (parseInt(btn.dataset.time, 10) === val) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        resetTimerState();
        settingsDrawer.classList.remove('open');
        showToast(`⏰ Durasi fokus diubah menjadi ${val} menit!`, 'success');
    });

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const val = parseInt(btn.dataset.time, 10);
            inputMinutes.value = val;
            state.timerMinutes = val;
            localStorage.setItem(TIMER_MINS_KEY, val);
            
            resetTimerState();
            settingsDrawer.classList.remove('open');
            showToast(`⏰ Mode preset ${val} menit diaktifkan!`, 'success');
        });
    });

    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimerState);

    function startTimer() {
        if (state.timer.isRunning) return;
        
        state.timer.isRunning = true;
        stateLabelEl.textContent = 'Fokus Berjalan...';
        stateLabelEl.style.color = 'var(--accent-magenta)';
        
        startBtn.disabled = true;
        stopBtn.disabled = false;
        
        initAudioContext();
        
        state.timer.intervalId = setInterval(() => {
            state.timer.timeLeft--;
            updateTimerDisplay();
            
            if (state.timer.timeLeft <= 0) {
                timerFinished();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!state.timer.isRunning) return;
        
        state.timer.isRunning = false;
        stateLabelEl.textContent = 'Fokus Dijeda';
        stateLabelEl.style.color = 'var(--accent-warning)';
        
        startBtn.disabled = false;
        stopBtn.disabled = true;
        
        clearInterval(state.timer.intervalId);
    }
}

function resetTimerState() {
    const startBtn = document.getElementById('timer-start-btn');
    const stopBtn = document.getElementById('timer-stop-btn');
    const stateLabelEl = document.getElementById('timer-state-label');
    
    state.timer.isRunning = false;
    clearInterval(state.timer.intervalId);
    
    state.timer.totalSeconds = state.timerMinutes * 60;
    state.timer.timeLeft = state.timer.totalSeconds;
    
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    if (stateLabelEl) {
        stateLabelEl.textContent = 'Siap Fokus?';
        stateLabelEl.style.color = 'var(--text-secondary)';
    }
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const displayEl = document.getElementById('timer-display');
    if (!displayEl) return;
    
    let mins = Math.floor(state.timer.timeLeft / 60);
    let secs = state.timer.timeLeft % 60;
    displayEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    const ringFill = document.querySelector('.progress-ring-fill');
    if (ringFill) {
        const radius = ringFill.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        
        ringFill.style.strokeDasharray = `${circumference} ${circumference}`;
        
        const progress = state.timer.timeLeft / state.timer.totalSeconds;
        const offset = circumference * (1 - progress);
        ringFill.style.strokeDashoffset = offset;
    }
}

let audioCtx = null;
function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTimerAlertSound() {
    initAudioContext();
    if (!audioCtx) return;
    
    let osc1 = audioCtx.createOscillator();
    let gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.type = 'sine';
    osc1.frequency.value = 880;
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.45);
    
    setTimeout(() => {
        let osc2 = audioCtx.createOscillator();
        let gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.value = 1100;
        gain2.gain.setValueAtTime(0.35, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc2.start(audioCtx.currentTime);
        osc2.stop(audioCtx.currentTime + 0.65);
    }, 400);
}

function timerFinished() {
    resetTimerState();
    playTimerAlertSound();
    showToast('🎉 Waktu fokus selesai! Istirahatlah sejenak selama 5 menit.', 'success');
}

// ==========================================================================
//   TO-DO LIST MODULE (Sort & Prevent Duplicate Challenges)
// ==========================================================================
function initTasks() {
    const form = document.getElementById('todo-form');
    const input = document.getElementById('todo-input');
    const sortSelect = document.getElementById('todo-sort');
    
    const storedTasks = localStorage.getItem(TASKS_KEY);
    if (storedTasks) {
        try {
            state.tasks = JSON.parse(storedTasks);
        } catch (e) {
            state.tasks = DEFAULT_TASKS;
        }
    } else {
        state.tasks = DEFAULT_TASKS;
        saveTasksToLocalStorage();
    }
    
    renderTasks();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        
        const isDuplicate = state.tasks.some(
            t => t.text.toLowerCase().replace(/\s+/g, '') === text.toLowerCase().replace(/\s+/g, '')
        );
        
        if (isDuplicate) {
            showToast('⚠️ Tugas ini sudah ada dalam daftar tugas Anda!', 'warning');
            input.focus();
            return;
        }
        
        const newTask = {
            id: `task-${Date.now()}`,
            text: text,
            completed: false,
            dateCreated: Date.now()
        };
        
        state.tasks.push(newTask);
        saveTasksToLocalStorage();
        renderTasks();
        
        input.value = '';
        showToast('✅ Tugas berhasil ditambahkan!', 'success');
    });

    sortSelect.addEventListener('change', renderTasks);
}

function saveTasksToLocalStorage() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(state.tasks));
}

function renderTasks() {
    const listEl = document.getElementById('todo-list');
    const counterEl = document.getElementById('task-counter');
    const sortVal = document.getElementById('todo-sort').value;
    
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    const remainingCount = state.tasks.filter(t => !t.completed).length;
    counterEl.textContent = `${remainingCount} tersisa`;
    
    if (state.tasks.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-purple-light"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                <p>Tidak ada tugas hari ini. Bagus sekali!</p>
            </div>
        `;
        return;
    }

    let sortedTasks = [...state.tasks];
    
    if (sortVal === 'alphabetical') {
        sortedTasks.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortVal === 'dateCreated') {
        sortedTasks.sort((a, b) => b.dateCreated - a.dateCreated);
    } else if (sortVal === 'status') {
        sortedTasks.sort((a, b) => {
            if (a.completed === b.completed) return b.dateCreated - a.dateCreated;
            return a.completed ? 1 : -1;
        });
    }

    sortedTasks.forEach(task => {
        const item = document.createElement('li');
        item.className = 'todo-item';
        item.dataset.id = task.id;
        if (task.completed) item.classList.add('completed');
        
        item.innerHTML = `
            <div class="todo-checkbox-wrapper">
                <input type="checkbox" id="check-${task.id}" class="todo-checkbox" ${task.completed ? 'checked' : ''}>
                <label for="check-${task.id}" class="checkmark">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </label>
            </div>
            
            <div class="todo-text-wrapper">
                <span class="todo-text">${escapeHtml(task.text)}</span>
            </div>
            
            <div class="todo-actions">
                <button class="icon-btn-small btn-edit" title="Edit Tugas" aria-label="Edit Tugas">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                <button class="icon-btn-small btn-delete" title="Hapus Tugas" aria-label="Hapus Tugas">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
            </div>
        `;
        
        const checkbox = item.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));
        
        const deleteBtn = item.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        const editBtn = item.querySelector('.btn-edit');
        editBtn.addEventListener('click', () => startEditingTask(item, task.id));
        
        listEl.appendChild(item);
    });
}

function toggleTaskCompletion(id) {
    state.tasks = state.tasks.map(t => {
        if (t.id === id) {
            const nextVal = !t.completed;
            if (nextVal) showToast('💪 Kerja bagus! Satu tugas terselesaikan.', 'success');
            return { ...t, completed: nextVal };
        }
        return t;
    });
    
    saveTasksToLocalStorage();
    renderTasks();
}

function deleteTask(id) {
    const itemEl = document.querySelector(`.todo-item[data-id="${id}"]`);
    
    if (itemEl) {
        itemEl.style.transform = 'scale(0.9)';
        itemEl.style.opacity = '0';
        itemEl.style.transition = 'all 0.2s ease';
        
        setTimeout(() => {
            state.tasks = state.tasks.filter(t => t.id !== id);
            saveTasksToLocalStorage();
            renderTasks();
            showToast('🗑️ Tugas dihapus dari daftar.', 'info');
        }, 200);
    }
}

function startEditingTask(itemEl, id) {
    const textWrapper = itemEl.querySelector('.todo-text-wrapper');
    const textSpan = textWrapper.querySelector('.todo-text');
    const oldVal = textSpan.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'todo-edit-input';
    input.value = oldVal;
    input.maxLength = 80;
    
    textWrapper.innerHTML = '';
    textWrapper.appendChild(input);
    input.focus();
    
    function saveEdit() {
        const newVal = input.value.trim();
        
        if (!newVal || newVal === oldVal) {
            restoreOriginal();
            return;
        }
        
        const isDuplicate = state.tasks.some(
            t => t.id !== id && t.text.toLowerCase().replace(/\s+/g, '') === newVal.toLowerCase().replace(/\s+/g, '')
        );
        
        if (isDuplicate) {
            showToast('⚠️ Gagal edit! Deskripsi tugas ini sudah ada di daftar.', 'warning');
            restoreOriginal();
            return;
        }
        
        state.tasks = state.tasks.map(t => {
            if (t.id === id) {
                return { ...t, text: newVal };
            }
            return t;
        });
        
        saveTasksToLocalStorage();
        renderTasks();
        showToast('✏️ Deskripsi tugas berhasil diubah.', 'success');
    }

    function restoreOriginal() {
        textWrapper.innerHTML = `<span class="todo-text">${escapeHtml(oldVal)}</span>`;
        renderTasks();
    }

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            input.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            restoreOriginal();
        }
    });
}

// ==========================================================================
//   QUICK LINKS MODULE
// ==========================================================================
function initLinks() {
    const toggleBtn = document.getElementById('add-link-toggle');
    const formContainer = document.getElementById('link-form-container');
    const form = document.getElementById('link-form');
    const cancelBtn = document.getElementById('cancel-link-btn');
    
    const storedLinks = localStorage.getItem(LINKS_KEY);
    if (storedLinks) {
        try {
            state.links = JSON.parse(storedLinks);
        } catch (e) {
            state.links = DEFAULT_LINKS;
        }
    } else {
        state.links = DEFAULT_LINKS;
        saveLinksToLocalStorage();
    }
    
    renderLinks();

    toggleBtn.addEventListener('click', () => {
        formContainer.classList.toggle('open');
        if (formContainer.classList.contains('open')) {
            document.getElementById('link-name').focus();
        }
    });

    cancelBtn.addEventListener('click', () => {
        formContainer.classList.remove('open');
        form.reset();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('link-name').value.trim();
        let url = document.getElementById('link-url').value.trim();
        
        if (!name || !url) return;
        
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
        
        const newLink = {
            id: `link-${Date.now()}`,
            name: name,
            url: url
        };
        
        state.links.push(newLink);
        saveLinksToLocalStorage();
        renderLinks();
        
        formContainer.classList.remove('open');
        form.reset();
        showToast('🔗 Tautan baru ditambahkan!', 'success');
    });
}

function saveLinksToLocalStorage() {
    localStorage.setItem(LINKS_KEY, JSON.stringify(state.links));
}

function renderLinks() {
    const gridEl = document.getElementById('links-grid');
    if (!gridEl) return;
    
    gridEl.innerHTML = '';
    
    if (state.links.length === 0) {
        gridEl.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; padding: 20px 0;">
                <p>Belum ada tautan cepat. Klik "+" untuk menambah!</p>
            </div>
        `;
        return;
    }
    
    state.links.forEach(link => {
        const domain = getDomain(link.url);
        const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'link-item';
        a.title = `${link.name} (${link.url})`;
        
        a.innerHTML = `
            <img class="link-favicon" src="${faviconUrl}" alt="" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'16\\' height=\\'16\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%238b5cf6\\' stroke-width=\\'2.5\\'><path d=\\'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\\'/><path d=\\'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\\'/></svg>'">
            <span class="link-title">${escapeHtml(link.name)}</span>
            <button class="link-delete-btn" aria-label="Hapus tautan" title="Hapus Tautan">&times;</button>
        `;
        
        const delBtn = a.querySelector('.link-delete-btn');
        delBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteLink(link.id);
        });
        
        gridEl.appendChild(a);
    });
}

function deleteLink(id) {
    state.links = state.links.filter(l => l.id !== id);
    saveLinksToLocalStorage();
    renderLinks();
    showToast('🗑️ Tautan dihapus.', 'info');
}

// ==========================================================================
//   UTILITY HELPER FUNCTIONS
// ==========================================================================
function getDomain(urlStr) {
    try {
        const url = new URL(urlStr);
        return url.hostname;
    } catch (e) {
        return urlStr.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
