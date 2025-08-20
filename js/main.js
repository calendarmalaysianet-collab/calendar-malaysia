class MalaysiaCalendar {
    constructor() {
        this.currentYear = this.getYearFromURL() || new Date().getFullYear();
        this.currentMonth = new Date().getMonth();
        this.currentView = this.getViewFromURL() || 'monthly';
        this.holidays = {};
        this.islamicDateCache = {};
        this.chineseDateCache = {};
        this.dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.apiConfig = new APIConfig();
    }

    getYearFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const yearParam = urlParams.get('year');
        if (yearParam) {
            return parseInt(yearParam);
        }
        
        // Check if we're on a year-specific page (e.g., 2024.html)
        const path = window.location.pathname;
        const yearMatch = path.match(/(\d{4})\.html$/);
        if (yearMatch) {
            return parseInt(yearMatch[1]);
        }
        
        return null;
    }

    getViewFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('view') || 'monthly';
    }

    async init() {
        await this.loadHolidays();
        
        if (this.currentView === 'yearly') {
            await this.renderYearlyView();
        } else {
            await this.renderMonthlyView();
        }
        
        this.renderHolidayList();
    }

    async loadHolidays() {
        this.holidays = await this.apiConfig.getMalaysiaHolidays(this.currentYear);
    }

    async getIslamicDate(date) {
        const dateStr = date.toISOString().slice(0, 10);
        if (this.islamicDateCache[dateStr]) {
            return this.islamicDateCache[dateStr];
        }
        
        const islamicDate = await this.apiConfig.getIslamicDate(date);
        this.islamicDateCache[dateStr] = islamicDate;
        return islamicDate;
    }

    async getChineseDate(date) {
        const dateStr = date.toISOString().slice(0, 10);
        if (this.chineseDateCache[dateStr]) {
            return this.chineseDateCache[dateStr];
        }
        
        const chineseDate = await this.apiConfig.getChineseDate(date);
        this.chineseDateCache[dateStr] = chineseDate;
        return chineseDate;
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    async renderMonthlyView() {
        const html = await this.generateCalendarHTML();
        document.getElementById('calendar-container').innerHTML = html;
        this.updateNavigation();
    }

    async renderYearlyView() {
        // Generate all months in parallel for better performance
        const monthPromises = [];
        for (let month = 0; month < 12; month++) {
            monthPromises.push(this.generateMonthHTML(month));
        }
        
        const monthHTMLs = await Promise.all(monthPromises);
        
        let html = '<div class="yearly-grid">';
        monthHTMLs.forEach(monthHTML => {
            html += monthHTML;
        });
        html += '</div>';
        
        document.getElementById('calendar-container').innerHTML = html;
        this.updateNavigation();
    }

    updateNavigation() {
        const monthYearElement = document.getElementById('current-month-year');
        if (monthYearElement) {
            if (this.currentView === 'yearly') {
                monthYearElement.textContent = this.currentYear.toString();
            } else {
                monthYearElement.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
            }
        }
        
        // Update main heading with dynamic year
        const mainHeading = document.querySelector('h1');
        if (mainHeading) {
            mainHeading.textContent = `🇲🇾 Malaysia Calendar ${this.currentYear}`;
        }
        
        // Update navigation button text based on view
        const prevButton = document.getElementById('prev-month');
        const nextButton = document.getElementById('next-month');
        const toggleButton = document.getElementById('view-toggle');
        
        if (prevButton && nextButton) {
            if (this.currentView === 'yearly') {
                prevButton.textContent = '← Previous Year';
                nextButton.textContent = 'Next Year →';
            } else {
                prevButton.textContent = '← Previous Month';
                nextButton.textContent = 'Next Month →';
            }
        }
        
        if (toggleButton) {
            toggleButton.textContent = this.currentView === 'monthly' ? '📅 Switch to Yearly View' : '📅 Switch to Monthly View';
        }
    }

    async generateCalendarHTML() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Pre-load all dates for the month to reduce API calls
        const monthDates = [];
        const currentDate = new Date(startDate);
        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            if (currentDate.getMonth() === this.currentMonth) {
                monthDates.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Batch load Islamic and Chinese dates
        const islamicPromises = monthDates.map(date => this.getIslamicDate(date));
        const chinesePromises = monthDates.map(date => this.getChineseDate(date));
        
        const [islamicDates, chineseDates] = await Promise.all([
            Promise.all(islamicPromises),
            Promise.all(chinesePromises)
        ]);
        
        let html = '<div class="calendar-grid">';
        
        // Add day headers
        this.dayNames.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Generate calendar days
        const renderDate = new Date(startDate);
        let monthDateIndex = 0;
        
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const dateStr = renderDate.toISOString().slice(0, 10);
                const isCurrentMonth = renderDate.getMonth() === this.currentMonth;
                const isToday = this.isToday(renderDate);
                const holidayInfo = this.holidays[dateStr];
                
                let classes = 'calendar-day';
                if (!isCurrentMonth) classes += ' other-month empty-day';
                if (isToday) classes += ' today';
                if (holidayInfo) classes += ' holiday';
                
                html += `<div class="${classes}">`;
                
                if (isCurrentMonth) {
                    // Only show content for current month dates
                    html += `<div class="day-number ${isToday ? 'clickable-today' : ''}" ${isToday ? `onclick="showTodayDetails('${dateStr}')"` : ''}>${renderDate.getDate()}</div>`;
                    
                    // Use pre-loaded dates
                    const islamicDate = islamicDates[monthDateIndex];
                    const chineseDate = chineseDates[monthDateIndex];
                    monthDateIndex++;
                    
                    if (islamicDate) {
                        html += `<div class="islamic-date clickable-islamic" onclick="showIslamicDateDetails('${dateStr}', '${islamicDate.day} ${islamicDate.monthName} ${islamicDate.year}')">${islamicDate.day} ${islamicDate.monthName.substring(0, 3)}</div>`;
                    }
                    
                    if (chineseDate) {
                        html += `<div class="chinese-date clickable-chinese" onclick="showChineseDateDetails('${dateStr}', '${chineseDate.month}月${chineseDate.day}日')">${chineseDate.month}月${chineseDate.day}</div>`;
                    }
                    
                    if (holidayInfo) {
                        html += `<div class="holiday-name clickable-holiday" onclick="showHolidayDetails('${dateStr}')">${holidayInfo.name}</div>`;
                    }
                } else {
                    // Empty box for other month dates
                    html += '<div class="empty-content"></div>';
                }
                
                html += '</div>';
                renderDate.setDate(renderDate.getDate() + 1);
            }
        }
        
        html += '</div>';
        return html;
    }

    async generateMonthHTML(month) {
        const firstDay = new Date(this.currentYear, month, 1);
        const lastDay = new Date(this.currentYear, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Pre-load all dates for the month to reduce API calls
        const monthDates = [];
        const currentDate = new Date(startDate);
        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            if (currentDate.getMonth() === month) {
                monthDates.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Batch load Islamic and Chinese dates for better performance
        const islamicPromises = monthDates.map(date => this.getIslamicDate(date));
        const chinesePromises = monthDates.map(date => this.getChineseDate(date));
        
        const [islamicDates, chineseDates] = await Promise.all([
            Promise.all(islamicPromises),
            Promise.all(chinesePromises)
        ]);
        
        let html = `<div class="yearly-month">
            <div class="yearly-month-header">${this.monthNames[month]}</div>
            <div class="yearly-calendar-grid">`;
        
        // Add day headers
        this.dayNames.forEach(day => {
            html += `<div class="yearly-day-header">${day.substring(0, 1)}</div>`;
        });
        
        // Generate calendar days
        const renderDate = new Date(startDate);
        let monthDateIndex = 0;
        
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const dateStr = renderDate.toISOString().slice(0, 10);
                const isCurrentMonth = renderDate.getMonth() === month;
                const isToday = this.isToday(renderDate);
                const holidayInfo = this.holidays[dateStr];
                
                let classes = 'yearly-day';
                if (!isCurrentMonth) classes += ' other-month empty-day';
                if (isToday) classes += ' today';
                if (holidayInfo) classes += ' holiday';
                
                html += `<div class="${classes}">`;
                
                if (isCurrentMonth) {
                    // Only show content for current month dates
                    html += `<div class="day-number ${isToday ? 'clickable-today' : ''}" ${isToday ? `onclick="showTodayDetails('${dateStr}')"` : ''}>${renderDate.getDate()}</div>`;
                    
                    // Use pre-loaded dates
                    const islamicDate = islamicDates[monthDateIndex];
                    const chineseDate = chineseDates[monthDateIndex];
                    monthDateIndex++;
                    
                    if (islamicDate) {
                        html += `<div class="islamic-date-yearly clickable-islamic" onclick="showIslamicDateDetails('${dateStr}', '${islamicDate.day} ${islamicDate.monthName} ${islamicDate.year}')">${islamicDate.day} ${islamicDate.monthName.substring(0, 3)}</div>`;
                    }
                    
                    if (chineseDate) {
                        html += `<div class="chinese-date-yearly clickable-chinese" onclick="showChineseDateDetails('${dateStr}', '${chineseDate.month}月${chineseDate.day}日')">${chineseDate.month}月${chineseDate.day}</div>`;
                    }
                    
                    if (holidayInfo) {
                        html += `<div class="holiday-dot clickable-holiday" onclick="showHolidayDetails('${dateStr}')" title="${holidayInfo.name}">●</div>`;
                    }
                } else {
                    // Empty box for other month dates
                    html += '<div class="empty-content"></div>';
                }
                
                html += '</div>';
                renderDate.setDate(renderDate.getDate() + 1);
            }
        }
        
        html += '</div></div>';
        return html;
    }

    renderHolidayList() {
        const container = document.getElementById('holiday-list-container');
        if (!container) return;
        
        let holidays = [];
        
        if (this.currentView === 'yearly') {
            // Show all holidays for the year
            holidays = Object.entries(this.holidays).map(([date, holiday]) => ({
                date,
                ...holiday
            })).sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            // Show only current month's holidays
            holidays = Object.entries(this.holidays)
                .filter(([date]) => {
                    const holidayDate = new Date(date);
                    return holidayDate.getMonth() === this.currentMonth && holidayDate.getFullYear() === this.currentYear;
                })
                .map(([date, holiday]) => ({
                    date,
                    ...holiday
                }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        
        let html = `<div class="holiday-list">
            <h3>📅 ${this.currentView === 'yearly' ? this.currentYear : this.monthNames[this.currentMonth] + ' ' + this.currentYear} Holidays</h3>`;
        
        if (holidays.length === 0) {
            html += `<p class="no-holidays">No holidays in ${this.currentView === 'yearly' ? this.currentYear : this.monthNames[this.currentMonth] + ' ' + this.currentYear}.</p>`;
        } else {
            html += '<div class="holiday-items">';
            holidays.forEach(holiday => {
                const date = new Date(holiday.date);
                const formattedDate = date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                html += `
                    <div class="holiday-item" onclick="showHolidayDetails('${holiday.date}')">
                        <div class="holiday-date">${formattedDate}</div>
                        <div class="holiday-name">${holiday.name}</div>
                        <div class="holiday-type">${holiday.type}</div>
                        <div class="holiday-description">${holiday.description}</div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    previousMonth() {
        if (this.currentView === 'yearly') {
            this.currentYear--;
            this.init();
        } else {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.init();
        }
    }

    nextMonth() {
        if (this.currentView === 'yearly') {
            this.currentYear++;
            this.init();
        } else {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.init();
        }
    }

    toggleView() {
        this.currentView = this.currentView === 'monthly' ? 'yearly' : 'monthly';
        this.init();
    }
}

// Global popup functions
function showTodayDetails(dateStr) {
    const date = new Date(dateStr);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    // Check if today has a holiday
    const calendar = window.calendar || new MalaysiaCalendar();
    const holiday = calendar.holidays[dateStr];
    
    let message = `📅 Today is ${formattedDate}`;
    if (holiday) {
        message += `\n\n🎉 Holiday: ${holiday.name}\n${holiday.description}`;
    } else {
        message += `\n\n📝 Today is no Holiday`;
    }
    
    showPopup('Today\'s Information', message);
}

function showIslamicDateDetails(dateStr, islamicDateStr) {
    showPopup('Islamic Date', `🌙 ${islamicDateStr}`);
}

function showChineseDateDetails(dateStr, chineseDateStr) {
    showPopup('Chinese Date', `🏮 ${chineseDateStr}`);
}

function showHolidayDetails(dateStr) {
    const calendar = window.calendar || new MalaysiaCalendar();
    const holiday = calendar.holidays[dateStr];
    
    if (holiday) {
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        let message = `🎉 ${holiday.name}\n\n📅 Date: ${formattedDate}\n🏷️ Type: ${holiday.type}\n📝 Description: ${holiday.description}`;
        showPopup('Holiday Details', message);
    } else {
        showPopup('Holiday Information', '📝 Today is no Holiday');
    }
}

function showPopup(title, message) {
    // Remove any existing popup
    closePopup();
    
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    // Create popup content
    const popup = document.createElement('div');
    popup.className = 'popup-content';
    
    popup.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
        <button onclick="closePopup()">Close</button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closePopup();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePopup();
        }
    });
}

function closePopup() {
    const overlay = document.querySelector('.popup-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Global navigation functions
function previousMonth() {
    if (window.calendar) {
        window.calendar.previousMonth();
    }
}

function nextMonth() {
    if (window.calendar) {
        window.calendar.nextMonth();
    }
}

function toggleView() {
    if (window.calendar) {
        window.calendar.toggleView();
    }
}

function navigateYear(direction) {
    if (window.calendar) {
        window.calendar.currentYear += direction;
        window.calendar.init();
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.calendar = new MalaysiaCalendar();
    window.calendar.init();
});

