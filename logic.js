// Initialize Lucide Icons
lucide.createIcons();

// -------------------------
// CHART VARIABLE MOVED HERE
// -------------------------
let habitChart = null;

// -------------------------
// MOBILE DETECTION
// -------------------------
const isMobile = window.innerWidth <= 768;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// -------------------------
// MOBILE MENU TOGGLE
// -------------------------
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
    // Prevent body scroll when menu is open
    document.body.style.overflow = menu.classList.contains('hidden') ? '' : 'hidden';
}
document.getElementById('mobile-menu-btn').addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking links
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        const menu = document.getElementById('mobile-menu');
        menu.classList.add('hidden');
        document.body.style.overflow = '';
    });
});

// -------------------------
// THEME LOGIC
// -------------------------
const themeToggleBtn = document.getElementById('theme-toggle');
const mobileThemeToggleBtn = document.getElementById('mobile-theme-toggle');
const html = document.documentElement;

function toggleTheme() {
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
} else {
    html.classList.remove('dark');
}

themeToggleBtn.addEventListener('click', toggleTheme);
if(mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', toggleTheme);

// -------------------------
// CANVAS ANIMATION (Optimized for Mobile)
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    // Reduce particles on mobile for better performance
    const particleCount = isMobile ? 25 : 50;
    const connectionDistance = isMobile ? 100 : 150;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    }
    
    // Debounce resize for better performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resize, 250);
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Slower movement on mobile
            const speed = isMobile ? 0.3 : 0.5;
            this.vx = (Math.random() - 0.5) * speed;
            this.vy = (Math.random() - 0.5) * speed;
            this.size = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            const isDark = document.documentElement.classList.contains('dark');
            ctx.fillStyle = isDark ? `rgba(255, 255, 255, 0.5)` : `rgba(0, 0, 0, 0.2)`;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    }

    let animationFrameId;
    function animate() {
        ctx.clearRect(0, 0, width, height);
        const isDark = document.documentElement.classList.contains('dark');
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            // Reduce connection checks on mobile
            for (let j = i; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${0.1 * (1 - distance/connectionDistance)})` : `rgba(0, 0, 0, ${0.05 * (1 - distance/connectionDistance)})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        animationFrameId = requestAnimationFrame(animate);
    }
    
    resize();
    animate();
    
    // Pause animation when page is not visible (battery saving)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrameId);
        } else {
            animate();
        }
    });
});

/* --- QUOTES LOGIC --- */
const quotes = [
    { text: "The people who are crazy enough to think they can change the world are the ones who do.", author: "Steve Jobs" },
    { text: "When something is important enough, you do it even if the odds are not in your favor.", author: "Elon Musk" },
    { text: "Impatience with actions, patience with results.", author: "Naval Ravikant" },
    { text: "The first principle is that you must not fool yourself and you are the easiest person to fool.", author: "Richard Feynman" },
    { text: "The most successful people I know have a very strong bias for action.", author: "Sam Altman" },
    { text: "It is not the strongest of the species that survives, nor the most intelligent; it is the one most adaptable to change.", author: "Charles Darwin" }
];

let currentQuoteIndex = 0;
const quoteDisplay = document.getElementById('quote-display');
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const quoteProgress = document.getElementById('quote-progress');
const quoteDuration = 8000; // 8 seconds per quote

function rotateQuotes() {
    // 1. Fade out and slide up (Exit)
    quoteDisplay.classList.remove('opacity-100', 'translate-y-0');
    quoteDisplay.classList.add('opacity-0', '-translate-y-8');

    setTimeout(() => {
        // 2. Change Text
        currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
        quoteText.innerText = `"${quotes[currentQuoteIndex].text}"`;
        quoteAuthor.innerText = `${quotes[currentQuoteIndex].author}`;
        
        // 3. Reset position for entry (start from bottom)
        quoteDisplay.classList.remove('transition-all', 'duration-1000');
        quoteDisplay.classList.remove('-translate-y-8');
        quoteDisplay.classList.add('translate-y-8');
        
        // Force Reflow
        void quoteDisplay.offsetWidth;

        // 4. Fade in and slide up (Enter)
        quoteDisplay.classList.add('transition-all', 'duration-1000');
        quoteDisplay.classList.remove('opacity-0', 'translate-y-8');
        quoteDisplay.classList.add('opacity-100', 'translate-y-0');

        // Reset Animation for progress bar
        quoteProgress.style.transition = 'none';
        quoteProgress.style.width = '0%';
        setTimeout(() => {
            quoteProgress.style.transition = `width ${quoteDuration}ms linear`;
            quoteProgress.style.width = '100%';
        }, 50);

    }, 1000); // Wait for fade out
}

// Initialize Progress Bar
setTimeout(() => {
     quoteProgress.style.transition = `width ${quoteDuration}ms linear`;
     quoteProgress.style.width = '100%';
}, 100);

setInterval(rotateQuotes, quoteDuration);

/* --- TIME REALITY LOGIC --- */
function updateTimeStats() {
    const now = new Date();
    
    // Clock
    document.getElementById('live-clock').innerText = now.toLocaleTimeString('en-US', { hour12: false });

    // Day Progress
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentMs = now - startOfDay;
    const totalDayMs = 24 * 60 * 60 * 1000;
    const dayPercent = (currentMs / totalDayMs) * 100;
    const dayBar = document.getElementById('day-progress');
    if(dayBar) {
        dayBar.style.width = `${dayPercent}%`;
        document.getElementById('day-percent-text').innerText = `${dayPercent.toFixed(1)}%`;
    }

    // Year Progress
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    const yearPercent = ((now - startOfYear) / (endOfYear - startOfYear)) * 100;
    const yearBar = document.getElementById('year-progress');
    if(yearBar) {
        yearBar.style.width = `${yearPercent}%`;
        document.getElementById('year-percent-text').innerText = `${yearPercent.toFixed(1)}%`;
    }
}
setInterval(updateTimeStats, 1000);
updateTimeStats(); // Init

/* --- TIME QUOTES ROTATION --- */
const timeQuotesList = [
    "Time is the scarcity we ignore. Utilize every moment to build the future.",
    "The trouble is, you think you have time. — Buddha",
    "Lost time is never found again. — Benjamin Franklin",
    "Your time is limited, so don't waste it living someone else's life.",
    "Focus on being productive instead of busy. — Tim Ferriss",
    "You can't make up for lost time. You can only do better in the future.",
    "Either you run the day, or the day runs you. — Jim Rohn"
];

let currentTimeQuoteIndex = 0;
const timeQuoteElement = document.getElementById('time-quote-text');

function rotateTimeQuotes() {
    if(!timeQuoteElement) return;
    timeQuoteElement.style.opacity = 0;
    setTimeout(() => {
        currentTimeQuoteIndex = (currentTimeQuoteIndex + 1) % timeQuotesList.length;
        timeQuoteElement.innerText = `"${timeQuotesList[currentTimeQuoteIndex]}"`;
        timeQuoteElement.style.opacity = 1;
    }, 700); // Wait for fade out
}
setInterval(rotateTimeQuotes, 6000);


/* --- ADVANCED HABIT TRACKER LOGIC --- */
// Default Config in Code
const defaultHabits = [
    { id: 'coding', name: 'Coding (DSA/Dev)', icon: 'code', completed: false },
    { id: 'reading', name: 'Read 30 Mins', icon: 'book-open', completed: false },
    { id: 'building', name: 'Build Project', icon: 'hammer', completed: false },
    { id: 'visualize', name: 'Visualize/Meditation', icon: 'eye', completed: false },
    { id: 'health', name: 'Workout/Health', icon: 'activity', completed: false },
    { id: 'industry', name: 'Industry (Work Hard)', icon: 'briefcase', completed: false }
];

// Init Data from LocalStorage with SMART MERGE
let savedData = JSON.parse(localStorage.getItem('razAppData'));

let appData = {
    habits: defaultHabits,
    history: {}, 
    streak: 0,
    maxStreak: 0,
    lastDate: null
};

if (savedData) {
    // Restore Global Stats
    appData.history = savedData.history || {};
    appData.streak = savedData.streak || 0;
    appData.maxStreak = savedData.maxStreak || 0;
    appData.lastDate = savedData.lastDate || null;

    // Smart Merge Habits: Keep default structure/names, but restore 'completed' status from ID match
    appData.habits = defaultHabits.map(defHabit => {
        const savedHabit = savedData.habits ? savedData.habits.find(h => h.id === defHabit.id) : null;
        return {
            ...defHabit,
            completed: savedHabit ? savedHabit.completed : false
        };
    });
}

// Utility: Get Date String YYYY-MM-DD
const getTodayStr = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d - offset)).toISOString().slice(0, 10);
    return localISOTime;
};
const todayStr = getTodayStr();

// Display Date
document.getElementById('today-date').innerText = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Logic: Check for new day
if (appData.lastDate !== todayStr) {
    // New Day Logic
    if (appData.lastDate) {
        // Check if streak is broken (missed yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const offset = yesterday.getTimezoneOffset() * 60000;
        const yesterdayStr = (new Date(yesterday - offset)).toISOString().slice(0, 10);
        
        // If last login was not yesterday, or yesterday count was 0, break streak
        if (appData.lastDate !== yesterdayStr || (appData.history[yesterdayStr] || 0) === 0) {
            appData.streak = 0;
        }
    }
    
    // Reset daily habits
    appData.habits = appData.habits.map(h => ({ ...h, completed: false }));
    appData.lastDate = todayStr;
    saveData();
}

function saveData() {
    localStorage.setItem('razAppData', JSON.stringify(appData));
    renderUI();
}

function toggleHabit(id) {
    const habit = appData.habits.find(h => h.id === id);
    habit.completed = !habit.completed;
    
    // Update History Count
    const completedCount = appData.habits.filter(h => h.completed).length;
    appData.history[todayStr] = completedCount;
    
    // Update Streak logic
    if (completedCount > 0 && appData.streak === 0) {
         const yesterday = new Date();
         yesterday.setDate(yesterday.getDate() - 1);
         const offset = yesterday.getTimezoneOffset() * 60000;
         const yesterdayStr = (new Date(yesterday - offset)).toISOString().slice(0, 10);
         
         if ((appData.history[yesterdayStr] || 0) > 0) {
             // Streak calculation handles this
         } else {
             // New streak
         }
    }
    
    // Recalculate streak properly based on history
    calculateStreak();
    
    // Visual feedback for completion
    if (habit.completed && isTouchDevice) {
        // Create a subtle haptic feedback effect
        if (navigator.vibrate) {
            navigator.vibrate(50); // Vibrate for 50ms on mobile
        }
    }
    
    saveData();
}

function calculateStreak() {
    let currentStreak = 0;
    let checkDate = new Date();
    
    while (true) {
        const offset = checkDate.getTimezoneOffset() * 60000;
        const dateStr = (new Date(checkDate - offset)).toISOString().slice(0, 10);
        
        if ((appData.history[dateStr] || 0) > 0) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            if (dateStr === todayStr && (appData.history[dateStr] || 0) === 0) {
                checkDate.setDate(checkDate.getDate() - 1);
                continue; 
            }
            break;
        }
    }
    appData.streak = currentStreak;
    if(appData.streak > appData.maxStreak) appData.maxStreak = appData.streak;
}

function resetData() {
    if(confirm("Reset all history and streaks?")) {
        localStorage.removeItem('razAppData');
        location.reload();
    }
}

function renderUI() {
    // 1. Render Habits List
    const listContainer = document.getElementById('habits-list-container');
    listContainer.innerHTML = '';
    
    appData.habits.forEach(h => {
        const btnClass = h.completed 
            ? 'bg-red-600 border-red-600 text-white' 
            : 'bg-white/5 border-red-900/30 text-gray-400 hover:border-red-500';
        
        const html = `
            <div class="flex items-center justify-between p-3 md:p-4 rounded-lg md:rounded-xl border border-red-900/20 bg-black/20 hover:bg-red-900/10 transition-all cursor-pointer group active:scale-[0.98] touch-manipulation" onclick="toggleHabit('${h.id}')">
                <div class="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                    <div class="p-1.5 md:p-2 rounded-lg bg-black/40 text-gray-500 group-hover:text-red-500 transition-colors flex-shrink-0">
                        <i data-lucide="${h.icon}" class="w-4 h-4 md:w-6 md:h-6"></i>
                    </div>
                    <span class="font-medium text-xs md:text-base text-gray-300 ${h.completed ? 'line-through opacity-50' : ''} truncate">${h.name}</span>
                </div>
                <div class="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${btnClass}">
                    ${h.completed ? '<i data-lucide="check" class="w-4 h-4 md:w-5 md:h-5"></i>' : ''}
                </div>
            </div>
        `;
        listContainer.innerHTML += html;
    });

    // 2. Update Stats
    document.getElementById('current-streak').innerText = appData.streak;
    document.getElementById('max-streak').innerText = appData.maxStreak;
    document.getElementById('total-active-days').innerText = Object.keys(appData.history).filter(k => appData.history[k] > 0).length;

    // 3. Render Heatmap (Simulated for 365 days)
    renderHeatmap();
    
    lucide.createIcons();
}

function renderHeatmap() {
    const container = document.getElementById('heatmap-container');
    container.innerHTML = '';
    const tooltip = document.getElementById('heatmap-tooltip');

    // Generate last 365 days
    const today = new Date();
    const yearAgo = new Date();
    yearAgo.setDate(today.getDate() - 364);

    // Calculate offset to align start date correctly (0=Sunday)
    const startDay = yearAgo.getDay(); 
    
    // Add empty cells for alignment
    for(let i=0; i<startDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'heatmap-cell bg-transparent';
        container.appendChild(emptyCell);
    }

    for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const offset = d.getTimezoneOffset() * 60000;
        const dateStr = (new Date(d - offset)).toISOString().slice(0, 10);
        
        const count = appData.history[dateStr] || 0;
        const dateReadable = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
        
        // Color Logic (Maroon Theme)
        let colorClass = 'bg-white/5'; // 0
        if (count === 1 || count === 2) colorClass = 'bg-red-900/40';
        if (count === 3 || count === 4) colorClass = 'bg-red-700/60';
        if (count >= 5) colorClass = 'bg-red-600';

        const cell = document.createElement('div');
        cell.className = `heatmap-cell ${colorClass}`;
        
        // Tooltip events - works for both desktop and mobile
        const showTooltip = (e) => {
            const rect = cell.getBoundingClientRect();
            let left = rect.left + window.scrollX - 40;
            if(left < 10) left = 10;
            if(left + 120 > window.innerWidth) left = window.innerWidth - 130;
            
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${rect.top + window.scrollY - 35}px`;
            tooltip.innerHTML = `${dateReadable}<br/><span class="text-red-300 font-bold">${count} tasks</span>`;
            tooltip.style.opacity = 1;
        };
        
        const hideTooltip = () => {
            tooltip.style.opacity = 0;
        };
        
        // Desktop hover
        if (!isTouchDevice) {
            cell.addEventListener('mouseenter', showTooltip);
            cell.addEventListener('mouseleave', hideTooltip);
        }
        
        // Mobile touch with better handling
        let touchTimeout;
        cell.addEventListener('touchstart', (e) => {
            e.preventDefault();
            showTooltip(e);
            touchTimeout = setTimeout(hideTooltip, 2000); // Auto-hide after 2s
        }, { passive: false });
        
        cell.addEventListener('touchend', () => {
            clearTimeout(touchTimeout);
            setTimeout(hideTooltip, 1500);
        });

        container.appendChild(cell);
    }
    
    // AUTO SCROLL TO END (Latest Date) with smooth behavior
    requestAnimationFrame(() => {
        container.scrollTo({
            left: container.scrollWidth,
            behavior: isMobile ? 'auto' : 'smooth'
        });
    });
}

// Init
renderUI();

// -------------------------
// PERFORMANCE OPTIMIZATIONS
// -------------------------

// Smooth scroll polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Lazy load images when they come into viewport
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                }
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Reduce animations on low-end devices
const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
if (isLowEndDevice || isMobile) {
    document.documentElement.classList.add('reduce-motion');
}

// Optimize scroll performance
let ticking = false;
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(() => {
            // Add scroll-based optimizations here if needed
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true });

// Network information API - reduce quality on slow connections
if ('connection' in navigator) {
    const connection = navigator.connection;
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Reduce animation complexity
        const canvas = document.getElementById('neural-canvas');
        if (canvas) canvas.style.display = 'none';
    }
}

// Preload critical resources
const preloadLink = document.createElement('link');
preloadLink.rel = 'preload';
preloadLink.as = 'style';
preloadLink.href = 'style.css';
document.head.appendChild(preloadLink);

// Console info
console.log('%c🚀 Raz Notes Loaded Successfully!', 'color: #3b82f6; font-size: 16px; font-weight: bold;');
console.log('%cMobile Optimized: ' + (isMobile ? '✅' : '❌'), 'color: #10b981; font-size: 12px;');
console.log('%cTouch Device: ' + (isTouchDevice ? '✅' : '❌'), 'color: #10b981; font-size: 12px;');