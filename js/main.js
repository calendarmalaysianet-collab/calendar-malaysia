// Malaysia Calendar - Unified JavaScript with Dynamic Year Handling

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
        this.updateNavigationButtons();
        window.calendar = this;
    }

    async loadHolidays() {
        try {
            // Load holidays for the current year
            this.holidays = this.getHolidaysForYear(this.currentYear);
        } catch (error) {
            console.error('Error loading holidays:', error);
            this.holidays = {};
        }
    }

    getHolidaysForYear(year) {
        // Dynamic holiday data based on year
        const holidayData = {
            2024: {
                '2024-01-01': {
                    name: '🎉 New Year\'s Day',
                    type: 'national',
                    description: 'First day of the Gregorian calendar year'
                },
                '2024-02-10': {
                    name: '🐲 Chinese New Year',
                    type: 'national',
                    description: 'First day of the Chinese lunar calendar - Year of the Dragon'
                },
                '2024-02-11': {
                    name: '🐲 Chinese New Year Holiday',
                    type: 'national',
                    description: 'Second day of Chinese New Year celebration'
                },
                '2024-01-25': {
                    name: '🕉️ Thaipusam',
                    type: 'religious',
                    description: 'Hindu festival celebrated by Tamil community'
                },
                '2024-04-10': {
                    name: '🌙 Hari Raya Puasa (Eid al-Fitr)',
                    type: 'religious',
                    description: 'End of Ramadan fasting month'
                },
                '2024-04-11': {
                    name: '🌙 Hari Raya Puasa Holiday',
                    type: 'religious',
                    description: 'Second day of Eid al-Fitr celebration'
                },
                '2024-05-01': {
                    name: '👷 Labour Day',
                    type: 'national',
                    description: 'International Workers\' Day'
                },
                '2024-05-22': {
                    name: '🧘 Wesak Day',
                    type: 'religious',
                    description: 'Buddha\'s birthday celebration'
                },
                '2024-06-03': {
                    name: '👑 Yang di-Pertuan Agong\'s Birthday',
                    type: 'national',
                    description: 'Birthday of the King of Malaysia'
                },
                '2024-06-17': {
                    name: '🐑 Hari Raya Haji (Eid al-Adha)',
                    type: 'religious',
                    description: 'Festival of Sacrifice'
                },
                '2024-07-07': {
                    name: '🌙 Awal Muharram',
                    type: 'religious',
                    description: 'Islamic New Year'
                },
                '2024-08-31': {
                    name: '🇲🇾 National Day (Merdeka Day)',
                    type: 'national',
                    description: 'Malaysia\'s Independence Day'
                },
                '2024-09-16': {
                    name: '🇲🇾 Malaysia Day',
                    type: 'national',
                    description: 'Formation of Malaysia'
                },
                '2024-09-16': {
                    name: '☪️ Maulidur Rasul',
                    type: 'religious',
                    description: 'Prophet Muhammad\'s birthday'
                },
                '2024-10-31': {
                    name: '🪔 Deepavali',
                    type: 'religious',
                    description: 'Hindu festival of lights'
                },
                '2024-12-25': {
                    name: '🎄 Christmas Day',
                    type: 'religious',
                    description: 'Christian celebration of Jesus Christ\'s birth'
                }
            },
            2025: {
                '2025-01-01': {
                    name: '🎉 New Year\'s Day',
                    type: 'national',
                    description: 'First day of the Gregorian calendar year'
                },
                '2025-01-29': {
                    name: '🐍 Chinese New Year',
                    type: 'national',
                    description: 'First day of the Chinese lunar calendar - Year of the Snake'
                },
                '2025-01-30': {
                    name: '🐍 Chinese New Year Holiday',
                    type: 'national',
                    description: 'Second day of Chinese New Year celebration'
                },
                '2025-02-11': {
                    name: '🕉️ Thaipusam',
                    type: 'religious',
                    description: 'Hindu festival celebrated by Tamil community'
                },
                '2025-03-31': {
                    name: '🌙 Hari Raya Puasa (Eid al-Fitr)',
                    type: 'religious',
                    description: 'End of Ramadan fasting month (estimated)'
                },
                '2025-04-01': {
                    name: '🌙 Hari Raya Puasa Holiday',
                    type: 'religious',
                    description: 'Second day of Eid al-Fitr celebration'
                },
                '2025-05-01': {
                    name: '👷 Labour Day',
                    type: 'national',
                    description: 'International Workers\' Day'
                },
                '2025-05-12': {
                    name: '🧘 Wesak Day',
                    type: 'religious',
                    description: 'Buddha\'s birthday celebration'
                },
                '2025-06-02': {
                    name: '👑 Yang di-Pertuan Agong\'s Birthday',
                    type: 'national',
                    description: 'Birthday of the King of Malaysia'
                },
                '2025-06-07': {
                    name: '🐑 Hari Raya Haji (Eid al-Adha)',
                    type: 'religious',
                    description: 'Festival of Sacrifice (estimated)'
                },
                '2025-06-28': {
                    name: '🌙 Awal Muharram',
                    type: 'religious',
                    description: 'Islamic New Year (estimated)'
                },
                '2025-08-31': {
                    name: '🇲🇾 National Day (Merdeka Day)',
                    type: 'national',
                    description: 'Malaysia\'s Independence Day'
                },
                '2025-09-06': {
                    name: '☪️ Maulidur Rasul',
                    type: 'religious',
                    description: 'Prophet Muhammad\'s birthday (estimated)'
                },
                '2025-09-16': {
                    name: '🇲🇾 Malaysia Day',
                    type: 'national',
                    description: 'Formation of Malaysia'
                },
                '2025-10-20': {
                    name: '🪔 Deepavali',
                    type: 'religious',
                    description: 'Hindu festival of lights (estimated)'
                },
                '2025-12-25': {
                    name: '🎄 Christmas Day',
                    type: 'religious',
                    description: 'Christian celebration of Jesus Christ\'s birth'
                }
            },
            2026: {
                '2026-01-01': {
                    name: '🎉 New Year\'s Day',
                    type: 'national',
                    description: 'First day of the Gregorian calendar year'
                },
                '2026-02-17': {
                    name: '🐎 Chinese New Year',
                    type: 'national',
                    description: 'First day of the Chinese lunar calendar - Year of the Horse'
                },
                '2026-02-18': {
                    name: '🐎 Chinese New Year Holiday',
                    type: 'national',
                    description: 'Second day of Chinese New Year celebration'
                },
                '2026-01-31': {
                    name: '🕉️ Thaipusam',
                    type: 'religious',
                    description: 'Hindu festival celebrated by Tamil community'
                },
                '2026-03-20': {
                    name: '🌙 Hari Raya Puasa (Eid al-Fitr)',
                    type: 'religious',
                    description: 'End of Ramadan fasting month (estimated)'
                },
                '2026-03-21': {
                    name: '🌙 Hari Raya Puasa Holiday',
                    type: 'religious',
                    description: 'Second day of Eid al-Fitr celebration'
                },
                '2026-05-01': {
                    name: '👷 Labour Day',
                    type: 'national',
                    description: 'International Workers\' Day'
                },
                '2026-05-31': {
                    name: '🧘 Wesak Day',
                    type: 'religious',
                    description: 'Buddha\'s birthday celebration'
                },
                '2026-06-08': {
                    name: '👑 Yang di-Pertuan Agong\'s Birthday',
                    type: 'national',
                    description: 'Birthday of the King of Malaysia'
                },
                '2026-05-27': {
                    name: '🐑 Hari Raya Haji (Eid al-Adha)',
                    type: 'religious',
                    description: 'Festival of Sacrifice (estimated)'
                },
                '2026-06-17': {
                    name: '🌙 Awal Muharram',
                    type: 'religious',
                    description: 'Islamic New Year (estimated)'
                },
                '2026-08-31': {
                    name: '🇲🇾 National Day (Merdeka Day)',
                    type: 'national',
                    description: 'Malaysia\'s Independence Day'
                },
                '2026-08-26': {
                    name: '☪️ Maulidur Rasul',
                    type: 'religious',
                    description: 'Prophet Muhammad\'s birthday (estimated)'
                },
                '2026-09-16': {
                    name: '🇲🇾 Malaysia Day',
                    type: 'national',
                    description: 'Formation of Malaysia'
                },
                '2026-11-08': {
                    name: '🪔 Deepavali',
                    type: 'religious',
                    description: 'Hindu festival of lights (estimated)'
                },
                '2026-12-25': {
                    name: '🎄 Christmas Day',
                    type: 'religious',
                    description: 'Christian celebration of Jesus Christ\'s birth'
                }
            }
        };

        return holidayData[year] || {};
    }

    async getIslamicDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        
        if (this.islamicDateCache[dateStr]) {
            return this.islamicDateCache[dateStr];
        }

        try {
            if (this.apiConfig.useRealAPI) {
                const response = await fetch(`https://api.aladhan.com/v1/gToH/${dateStr}`);
                if (response.ok) {
                    const data = await response.json();
                    const islamicDate = {
                        day: data.data.hijri.day,
                        month: data.data.hijri.month.number,
                        monthName: data.data.hijri.month.en,
                        year: data.data.hijri.year
                    };
                    this.islamicDateCache[dateStr] = islamicDate;
                    return islamicDate;
                }
            }
        } catch (error) {
            console.warn('Islamic API failed, using fallback calculation');
        }

        // Fallback calculation
        const islamicDate = this.calculateIslamicDate(date);
        this.islamicDateCache[dateStr] = islamicDate;
        return islamicDate;
    }

    calculateIslamicDate(date) {
        // Simplified Islamic date calculation (approximate)
        const islamicEpoch = new Date('622-07-16');
        const daysDiff = Math.floor((date - islamicEpoch) / (1000 * 60 * 60 * 24));
        const islamicYear = Math.floor(daysDiff / 354.37) + 1;
        const dayOfYear = daysDiff % 354;
        const month = Math.floor(dayOfYear / 29.5) + 1;
        const day = Math.floor(dayOfYear % 29.5) + 1;
        
        const monthNames = [
            'Muharram', 'Safar', 'Rabi al-awwal', 'Rabi al-thani', 'Jumada al-awwal',
            'Jumada al-thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal',
            'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
        ];
        
        return {
            day: Math.max(1, Math.min(30, day)),
            month: Math.max(1, Math.min(12, month)),
            monthName: monthNames[Math.max(0, Math.min(11, month - 1))],
            year: islamicYear
        };
    }

    async getChineseDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        
        if (this.chineseDateCache[dateStr]) {
            return this.chineseDateCache[dateStr];
        }

        // Simplified Chinese lunar date calculation based on year
        let chineseNewYear;
        if (this.currentYear === 2024) {
            chineseNewYear = new Date('2024-02-10');
        } else if (this.currentYear === 2025) {
            chineseNewYear = new Date('2025-01-29');
        } else if (this.currentYear === 2026) {
            chineseNewYear = new Date('2026-02-17');
        } else {
            // Default calculation for other years
            chineseNewYear = new Date(`${this.currentYear}-02-01`);
        }
        
        const daysDiff = Math.floor((date - chineseNewYear) / (1000 * 60 * 60 * 24));
        const month = Math.floor(daysDiff / 29.5) + 1;
        const day = (daysDiff % 29) + 1;
        
        const monthNames = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '腊月'];
        
        const chineseDate = {
            day: Math.max(1, Math.min(30, day)),
            month: Math.max(1, Math.min(12, month)),
            monthName: monthNames[Math.max(0, Math.min(11, month - 1))],
            year: this.currentYear
        };
        
        this.chineseDateCache[dateStr] = chineseDate;
        return chineseDate;
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    async renderMonthlyView() {
        const html = await this.generateCalendarHTML();
        document.getElementById('calendarContainer').innerHTML = html;
    }

    async renderYearlyView() {
        let html = '<div class="yearly-grid">';
        
        for (let month = 0; month < 12; month++) {
            html += await this.generateMonthHTML(month);
        }
        
        html += '</div>';
        document.getElementById('calendarContainer').innerHTML = html;
    }

    async generateCalendarHTML() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        let html = '<div class="calendar-grid">';
        
        // Add day headers
        this.dayNames.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Generate calendar days
        const currentDate = new Date(startDate);
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const dateStr = currentDate.toISOString().slice(0, 10);
                const isCurrentMonth = currentDate.getMonth() === this.currentMonth;
                const isToday = this.isToday(currentDate);
                const holidayInfo = this.holidays[dateStr];
                
                let classes = 'calendar-day';
                if (!isCurrentMonth) classes += ' other-month empty-day';
                if (isToday) classes += ' today';
                if (holidayInfo) classes += ' holiday';
                
                html += `<div class="${classes}">`;
                
                if (isCurrentMonth) {
                    // Only show content for current month dates
                    html += `<div class="day-number ${isToday ? 'clickable-today' : ''}" ${isToday ? `onclick="showTodayDetails('${dateStr}')"` : ''}>${currentDate.getDate()}</div>`;
                    
                    // Add Islamic and Chinese dates for current month days
                    const islamicDate = await this.getIslamicDate(currentDate);
                    const chineseDate = await this.getChineseDate(currentDate);
                    
                    if (islamicDate) {
                        html += `<div class="islamic-date clickable-islamic" onclick="showIslamicDateDetails('${dateStr}', '${islamicDate.day} ${islamicDate.monthName} ${islamicDate.year}')">${islamicDate.day} ${islamicDate.monthName.substring(0, 3)}</div>`;
                    }
                    
                    if (chineseDate) {
                        html += `<div class="chinese-date clickable-chinese" onclick="showChineseDateDetails('${dateStr}', '${chineseDate.monthName}${chineseDate.day}')">${chineseDate.monthName}${chineseDate.day}</div>`;
                    }
                    
                    if (holidayInfo) {
                        html += `<div class="holiday-name clickable-holiday" onclick="showHolidayDetails('${dateStr}')">${holidayInfo.name}</div>`;
                    }
                } else {
                    // Empty box for other month dates
                    html += '<div class="empty-content"></div>';
                }
                
                html += '</div>';
                currentDate.setDate(currentDate.getDate() + 1);
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
        
        let html = `<div class="yearly-month">
            <div class="yearly-month-header">${this.monthNames[month]}</div>
            <div class="yearly-calendar-grid">`;
        
        // Add day headers
        this.dayNames.forEach(day => {
            html += `<div class="yearly-day-header">${day.substring(0, 1)}</div>`;
        });
        
        // Generate calendar days
        const currentDate = new Date(startDate);
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const dateStr = currentDate.toISOString().slice(0, 10);
                const isCurrentMonth = currentDate.getMonth() === month;
                const isToday = this.isToday(currentDate);
                const holidayInfo = this.holidays[dateStr];
                
                let classes = 'yearly-day';
                if (!isCurrentMonth) classes += ' other-month empty-day';
                if (isToday) classes += ' today';
                if (holidayInfo) classes += ' holiday';
                
                html += `<div class="${classes}">`;
                
                if (isCurrentMonth) {
                    // Only show content for current month dates
                    html += `<div class="day-number ${isToday ? 'clickable-today' : ''}" ${isToday ? `onclick="showTodayDetails('${dateStr}')"` : ''}>${currentDate.getDate()}</div>`;
                    
                    // Add Islamic and Chinese dates in compact format
                    const islamicDate = await this.getIslamicDate(currentDate);
                    const chineseDate = await this.getChineseDate(currentDate);
                    
                    if (islamicDate) {
                        html += `<div class="islamic-date-yearly clickable-islamic" onclick="showIslamicDateDetails('${dateStr}', '${islamicDate.day} ${islamicDate.monthName} ${islamicDate.year}')">${islamicDate.day} ${islamicDate.monthName.substring(0, 3)}</div>`;
                    }
                    
                    if (chineseDate) {
                        html += `<div class="chinese-date-yearly clickable-chinese" onclick="showChineseDateDetails('${dateStr}', '${chineseDate.monthName}${chineseDate.day}')">${chineseDate.monthName}${chineseDate.day}</div>`;
                    }
                    
                    if (holidayInfo) {
                        html += `<div class="holiday-dot clickable-holiday" onclick="showHolidayDetails('${dateStr}')" title="${holidayInfo.name}">●</div>`;
                    }
                } else {
                    // Empty box for other month dates
                    html += '<div class="empty-content"></div>';
                }
                
                html += '</div>';
                currentDate.setDate(currentDate.getDate() + 1);
            }
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
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    // Create popup content
    const popup = document.createElement('div');
    popup.className = 'popup-content';
    popup.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        text-align: center;
    `;
    
    popup.innerHTML = `
        <h3 style="color: #010066; margin-bottom: 15px;">${title}</h3>
        <p style="white-space: pre-line; margin-bottom: 20px; line-height: 1.5;">${message}</p>
        <button onclick="closePopup()" style="
            background: #cc0001;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        ">Close</button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
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
                    classes += ' other-month-hidden';
                    html += `<div class="${classes}"></div>`;
                } else {
                    if (isToday) classes += ' today';
                    if (holidayInfo) classes += ' holiday';
                    
                    html += `<div class="${classes}" title="${holidayInfo ? (typeof holidayInfo === 'string' ? holidayInfo : holidayInfo.name) : ''}" ${holidayInfo ? `onclick="showHolidayDetails('${dateStr}')" style="cursor: pointer;"` : ''}>`;
                    html += `<div class="yearly-day-number">${currentDate.getDate()}</div>`;
                    
                    // Add Islamic and Chinese dates for current month days
                    const islamicDate = await this.getIslamicDate(currentDate);
                    const chineseDate = await this.getChineseDate(currentDate);
                    
                    if (islamicDate) {
                        html += `<div style="font-size: 0.6rem; color: #28a745; margin-top: 1px;">${islamicDate.day} ${islamicDate.monthName.substring(0, 3)}</div>`;
                    }
                    
                    if (chineseDate) {
                        html += `<div style="font-size: 0.6rem; color: #dc3545; margin-top: 1px;">${chineseDate.monthName}${chineseDate.day}</div>`;
                    }
                    
                    if (holidayInfo) {
                        html += '<div class="yearly-holiday-indicator"></div>';
                    }
                    
                    html += '</div>';
                }
                
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        
        html += '</div></div>';
        return html;
    }

    renderHolidayList() {
        const holidayListContainer = document.getElementById('holidayListContainer');
        const holidayListSection = document.getElementById('holidayListSection');
        
        if (!holidayListContainer || !holidayListSection) return;
        
        let holidaysToShow;
        let titleText;
        
        if (this.currentView === 'monthly') {
            // Show only current month holidays in monthly view
            const currentMonthStart = new Date(this.currentYear, this.currentMonth, 1);
            const currentMonthEnd = new Date(this.currentYear, this.currentMonth + 1, 0);
            
            holidaysToShow = Object.entries(this.holidays).filter(([dateStr]) => {
                const holidayDate = new Date(dateStr);
                return holidayDate >= currentMonthStart && holidayDate <= currentMonthEnd;
            }).sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
            
            titleText = `📅 ${this.monthNames[this.currentMonth]} ${this.currentYear} Holidays`;
        } else {
            // Show all year holidays in yearly view
            holidaysToShow = Object.entries(this.holidays)
                .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
            
            titleText = `📅 Malaysian Public Holidays ${this.currentYear}`;
        }
        
        if (holidaysToShow.length === 0) {
            if (this.currentView === 'monthly') {
                holidayListContainer.innerHTML = `<div class="no-holidays">No holidays in ${this.monthNames[this.currentMonth]} ${this.currentYear}.</div>`;
            } else {
                holidayListContainer.innerHTML = '<div class="no-holidays">No holidays found for this year.</div>';
            }
            holidayListSection.style.display = 'block';
            return;
        }
        
        let html = '';
        holidaysToShow.forEach(([dateStr, holiday]) => {
            const date = new Date(dateStr);
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            html += `
                <div class="holiday-item" onclick="showHolidayDetails('${dateStr}')">
                    <div class="holiday-date">${formattedDate}</div>
                    <div class="holiday-name">${holiday.name}</div>
                    <span class="holiday-type-badge ${holiday.type}">${holiday.type}</span>
                    <div class="holiday-description">${holiday.description}</div>
                </div>
            `;
        });
        
        holidayListContainer.innerHTML = html;
        holidayListSection.style.display = 'block';
        
        // Update holiday list title
        const holidayListTitle = document.querySelector('.holiday-list-title');
        if (holidayListTitle) {
            holidayListTitle.textContent = titleText;
        }
    }

    updateNavigationButtons() {
        // Update month navigation
        const currentMonthElement = document.querySelector('.current-month');
        if (currentMonthElement) {
            currentMonthElement.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
        }
        
        // Update year navigation
        const currentYearElement = document.querySelector('.current-year');
        if (currentYearElement) {
            currentYearElement.textContent = `${this.currentYear} - Full Year`;
        }
        
        // Update view toggle button
        const viewToggleButton = document.querySelector('.view-toggle button');
        if (viewToggleButton) {
            if (this.currentView === 'yearly') {
                viewToggleButton.textContent = '📅 Switch to Monthly View';
            } else {
                viewToggleButton.textContent = '📅 Switch to Yearly View';
            }
        }
        
        // Update month navigation visibility based on view
        const monthNavigation = document.querySelector('.month-navigation');
        const yearNavigation = document.querySelector('.year-navigation');
        
        if (this.currentView === 'monthly') {
            if (monthNavigation) monthNavigation.style.display = 'flex';
            if (yearNavigation) yearNavigation.style.display = 'none';
        } else {
            if (monthNavigation) monthNavigation.style.display = 'none';
            if (yearNavigation) yearNavigation.style.display = 'flex';
        }
    }

    async showHolidayDetails(dateStr) {
        const holiday = this.holidays[dateStr];
        if (!holiday) return;
        
        const date = new Date(dateStr);
        const islamicDate = await this.getIslamicDate(date);
        const chineseDate = await this.getChineseDate(date);
        
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const modalBody = document.getElementById('holidayModalBody');
        modalBody.innerHTML = `
            <div class="holiday-details">
                <h4>${holiday.name}</h4>
                <p class="text-muted">${formattedDate}</p>
                <span class="badge bg-primary">${holiday.type.charAt(0).toUpperCase() + holiday.type.slice(1)} Holiday</span>
                <p class="mt-3">${holiday.description}</p>
                
                <h6 class="mt-4">📅 Calendar Dates</h6>
                <table class="table table-sm">
                    <tr>
                        <td><strong>Gregorian:</strong></td>
                        <td>${date.toLocaleDateString('en-GB')}</td>
                    </tr>
                    <tr>
                        <td><strong>Islamic (Hijri):</strong></td>
                        <td>${islamicDate ? `${islamicDate.day} ${islamicDate.monthName} ${islamicDate.year}` : 'Not available'}</td>
                    </tr>
                    <tr>
                        <td><strong>Chinese Lunar:</strong></td>
                        <td>${chineseDate ? `${chineseDate.monthName}${chineseDate.day}, ${chineseDate.year}` : 'Not available'}</td>
                    </tr>
                </table>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('holidayModal'));
        modal.show();
    }

    // Navigation methods
    previousMonth() {
        if (this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else {
            this.currentMonth--;
        }
        this.refreshCalendar();
    }

    nextMonth() {
        if (this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else {
            this.currentMonth++;
        }
        this.refreshCalendar();
    }

    previousYear() {
        this.currentYear--;
        this.refreshCalendar();
    }

    nextYear() {
        this.currentYear++;
        this.refreshCalendar();
    }

    toggleView() {
        this.currentView = this.currentView === 'monthly' ? 'yearly' : 'monthly';
        this.refreshCalendar();
    }

    async refreshCalendar() {
        await this.loadHolidays();
        
        if (this.currentView === 'yearly') {
            await this.renderYearlyView();
        } else {
            await this.renderMonthlyView();
        }
        
        this.renderHolidayList();
        this.updateNavigationButtons();
    }

    navigateToYear(year) {
        if (year === 2024) {
            window.location.href = '2024.html';
        } else if (year === 2025) {
            window.location.href = '2025.html';
        } else if (year === 2026) {
            window.location.href = '2026.html';
        } else {
            // For other years, update current year and refresh
            this.currentYear = year;
            this.refreshCalendar();
        }
    }
}

// Global functions for navigation (called from HTML)
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

function previousYear() {
    if (window.calendar) {
        window.calendar.previousYear();
    }
}

function nextYear() {
    if (window.calendar) {
        window.calendar.nextYear();
    }
}

function toggleView() {
    if (window.calendar) {
        window.calendar.toggleView();
    }
}

function navigateToYear(year) {
    if (window.calendar) {
        window.calendar.navigateToYear(year);
    }
}

function showHolidayDetails(dateStr) {
    if (window.calendar) {
        window.calendar.showHolidayDetails(dateStr);
    }
}

// Initialize calendar when page loads
document.addEventListener('DOMContentLoaded', function() {
    const calendar = new MalaysiaCalendar();
    calendar.init();
});
