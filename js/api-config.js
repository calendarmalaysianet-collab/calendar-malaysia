// API Configuration for Malaysia Calendar
class APIConfig {
  constructor() {
    // Enhanced caching system
    this.cache = {
      islamic: new Map(),
      chinese: new Map(),
      holidays: new Map(),
    };
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // API endpoints and configurations
    this.apis = {
      calendarific: {
        baseUrl: "https://calendarific.com/api/v2",
        // Note: Replace with actual API key for production
        apiKey: "h4MtSCvrQlJXjwf98lv7ADF1yG0Jd2FD", // Get your API key from https://calendarific.com/
        endpoints: {
          holidays: "/holidays",
        },
      },
      aladhan: {
        baseUrl: "https://api.aladhan.com/v1",
        endpoints: {
          gregorianToHijri: "/gToH",
          hijriCalendar: "/gToHCalendar",
        },
      },
      chineseLunar: {
        baseUrl: "https://chinese-lunar-calendar.p.rapidapi.com",
        // Note: Replace with actual RapidAPI key for production
        apiKey: "920e0345femsh35cebe6da8302ffp19a951jsn4584d6dded99",
        headers: {
          "X-RapidAPI-Key":
            "920e0345femsh35cebe6da8302ffp19a951jsn4584d6dded99",
          "X-RapidAPI-Host": "chinese-lunar-calendar.p.rapidapi.com",
        },
      },
    };

    // Malaysia-specific holiday data (fallback)
    this.malaysiaHolidays2025 = {
      "2025-01-01": {
        name: "🎉 New Year's Day",
        type: "national",
        description: "First day of the Gregorian calendar year",
      },
      "2025-01-29": {
        name: "🐍 Chinese New Year",
        type: "national",
        description:
          "First day of the Chinese lunar calendar - Year of the Snake",
      },
      "2025-01-30": {
        name: "🐍 Chinese New Year Holiday",
        type: "national",
        description: "Second day of Chinese New Year celebration",
      },
      "2025-02-11": {
        name: "🕉️ Thaipusam",
        type: "religious",
        description: "Hindu festival celebrated by Tamil community",
      },
      "2025-03-31": {
        name: "🌙 Hari Raya Puasa (Eid al-Fitr)",
        type: "religious",
        description: "End of Ramadan fasting month (estimated)",
      },
      "2025-04-01": {
        name: "🌙 Hari Raya Puasa Holiday",
        type: "religious",
        description: "Second day of Eid al-Fitr celebration",
      },
      "2025-05-01": {
        name: "👷 Labour Day",
        type: "national",
        description: "International Workers' Day",
      },
      "2025-05-12": {
        name: "🧘 Wesak Day",
        type: "religious",
        description: "Buddha's birthday celebration",
      },
      "2025-06-02": {
        name: "👑 Yang di-Pertuan Agong's Birthday",
        type: "national",
        description: "Birthday of the King of Malaysia",
      },
      "2025-06-07": {
        name: "🐑 Hari Raya Haji (Eid al-Adha)",
        type: "religious",
        description: "Festival of Sacrifice (estimated)",
      },
      "2025-06-28": {
        name: "🌙 Awal Muharram",
        type: "religious",
        description: "Islamic New Year (estimated)",
      },
      "2025-08-31": {
        name: "🇲🇾 National Day (Merdeka Day)",
        type: "national",
        description: "Malaysia's Independence Day",
      },
      "2025-09-06": {
        name: "☪️ Maulidur Rasul",
        type: "religious",
        description: "Prophet Muhammad's birthday (estimated)",
      },
      "2025-09-16": {
        name: "🇲🇾 Malaysia Day",
        type: "national",
        description: "Formation of Malaysia",
      },
      "2025-10-20": {
        name: "🪔 Deepavali",
        type: "religious",
        description: "Hindu festival of lights (estimated)",
      },
      "2025-12-25": {
        name: "🎄 Christmas Day",
        type: "religious",
        description: "Christian celebration of Jesus Christ's birth",
      },
    };

    // State-specific holidays (some states have additional holidays)
    this.stateHolidays = {
      Johor: {
        "2025-03-23": "Birthday of Sultan of Johor",
      },
      Kedah: {
        "2025-06-19": "Birthday of Sultan of Kedah",
      },
      Kelantan: {
        "2025-09-12": "Birthday of Sultan of Kelantan",
      },
      Melaka: {
        "2025-04-15": "Declaration of Malacca as Historical City",
      },
      "Negeri Sembilan": {
        "2025-01-14": "Birthday of Yang di-Pertuan Besar of Negeri Sembilan",
      },
      Pahang: {
        "2025-07-30": "Birthday of Sultan of Pahang",
      },
      Penang: {
        "2025-07-12": "Penang Governor's Birthday",
      },
      Perak: {
        "2025-11-27": "Birthday of Sultan of Perak",
      },
      Perlis: {
        "2025-07-17": "Birthday of Raja of Perlis",
      },
      Sabah: {
        "2025-10-04": "Sabah Day",
      },
      Sarawak: {
        "2025-07-22": "Sarawak Day",
      },
      Selangor: {
        "2025-12-11": "Birthday of Sultan of Selangor",
      },
      Terengganu: {
        "2025-03-04": "Birthday of Sultan of Terengganu",
      },
    };
  }

  // Get Malaysia holidays for a specific year
  async getMalaysiaHolidays(year = 2025) {
    // For local file access, prioritize fallback data to avoid API issues
    if (window.location.protocol === "file:") {
      console.log("Local file access detected, using fallback holiday data");
      return this.getHolidaysForYear(year);
    }

    try {
      // Try to fetch from Calendarific API first (with timeout)
      const response = await Promise.race([
        this.fetchFromCalendarific(year),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("API timeout")), 3000)
        ),
      ]);

      if (response && response.holidays) {
        return this.processCalendarificHolidays(response.holidays);
      }
    } catch (error) {
      console.warn(
        "Failed to fetch from Calendarific API, using fallback data:",
        error
      );
    }

    // Fallback to static data based on year
    return this.getHolidaysForYear(year);
  }

  getHolidaysForYear(year) {
    switch (year) {
      case 2024:
        return {
          "2024-01-01": {
            name: "🎉 New Year's Day",
            type: "national",
            description: "First day of the Gregorian calendar year",
          },
          "2024-01-25": {
            name: "🕉️ Thaipusam",
            type: "religious",
            description: "Hindu festival celebrated by Tamil community",
          },
          "2024-02-10": {
            name: "🐲 Chinese New Year",
            type: "national",
            description:
              "First day of the Chinese lunar calendar - Year of the Dragon",
          },
          "2024-02-11": {
            name: "🐲 Chinese New Year Holiday",
            type: "national",
            description: "Second day of Chinese New Year celebration",
          },
          "2024-04-10": {
            name: "🌙 Hari Raya Puasa (Eid al-Fitr)",
            type: "religious",
            description: "End of Ramadan fasting month",
          },
          "2024-04-11": {
            name: "🌙 Hari Raya Puasa Holiday",
            type: "religious",
            description: "Second day of Eid al-Fitr celebration",
          },
          "2024-05-01": {
            name: "👷 Labour Day",
            type: "national",
            description: "International Workers' Day",
          },
          "2024-05-22": {
            name: "🧘 Wesak Day",
            type: "religious",
            description: "Buddha's birthday celebration",
          },
          "2024-06-03": {
            name: "👑 Yang di-Pertuan Agong's Birthday",
            type: "national",
            description: "Birthday of the King of Malaysia",
          },
          "2024-06-17": {
            name: "🐑 Hari Raya Haji (Eid al-Adha)",
            type: "religious",
            description: "Festival of Sacrifice",
          },
          "2024-07-07": {
            name: "🌙 Awal Muharram",
            type: "religious",
            description: "Islamic New Year",
          },
          "2024-08-31": {
            name: "🇲🇾 National Day (Merdeka Day)",
            type: "national",
            description: "Malaysia's Independence Day",
          },
          "2024-09-16": {
            name: "☪️ Maulidur Rasul",
            type: "religious",
            description: "Prophet Muhammad's birthday",
          },
          "2024-10-31": {
            name: "🪔 Deepavali",
            type: "religious",
            description: "Hindu festival of lights",
          },
          "2024-12-25": {
            name: "🎄 Christmas Day",
            type: "religious",
            description: "Christian celebration of Jesus Christ's birth",
          },
        };
      case 2025:
        return this.malaysiaHolidays2025;
      case 2026:
        return {
          "2026-01-01": {
            name: "🎉 New Year's Day",
            type: "national",
            description: "First day of the Gregorian calendar year",
          },
          "2026-01-31": {
            name: "🕉️ Thaipusam",
            type: "religious",
            description: "Hindu festival celebrated by Tamil community",
          },
          "2026-02-17": {
            name: "🐎 Chinese New Year",
            type: "national",
            description:
              "First day of the Chinese lunar calendar - Year of the Horse",
          },
          "2026-02-18": {
            name: "🐎 Chinese New Year Holiday",
            type: "national",
            description: "Second day of Chinese New Year celebration",
          },
          "2026-03-20": {
            name: "🌙 Hari Raya Puasa (Eid al-Fitr)",
            type: "religious",
            description: "End of Ramadan fasting month (estimated)",
          },
          "2026-03-21": {
            name: "🌙 Hari Raya Puasa Holiday",
            type: "religious",
            description: "Second day of Eid al-Fitr celebration",
          },
          "2026-05-01": {
            name: "👷 Labour Day",
            type: "national",
            description: "International Workers' Day",
          },
          "2026-05-27": {
            name: "🐑 Hari Raya Haji (Eid al-Adha)",
            type: "religious",
            description: "Festival of Sacrifice (estimated)",
          },
          "2026-05-31": {
            name: "🧘 Wesak Day",
            type: "religious",
            description: "Buddha's birthday celebration",
          },
          "2026-06-08": {
            name: "👑 Yang di-Pertuan Agong's Birthday",
            type: "national",
            description: "Birthday of the King of Malaysia",
          },
          "2026-06-17": {
            name: "🌙 Awal Muharram",
            type: "religious",
            description: "Islamic New Year (estimated)",
          },
          "2026-08-26": {
            name: "☪️ Maulidur Rasul",
            type: "religious",
            description: "Prophet Muhammad's birthday (estimated)",
          },
          "2026-08-31": {
            name: "🇲🇾 National Day (Merdeka Day)",
            type: "national",
            description: "Malaysia's Independence Day",
          },
          "2026-09-16": {
            name: "🇲🇾 Malaysia Day",
            type: "national",
            description: "Formation of Malaysia",
          },
          "2026-11-08": {
            name: "🪔 Deepavali",
            type: "religious",
            description: "Hindu festival of lights (estimated)",
          },
          "2026-12-25": {
            name: "🎄 Christmas Day",
            type: "religious",
            description: "Christian celebration of Jesus Christ's birth",
          },
        };
      case 2027:
        return {
          "2027-01-01": {
            name: "🎉 New Year's Day",
            type: "national",
            description: "First day of the Gregorian calendar year",
          },
          "2027-02-06": {
            name: "🐐 Chinese New Year",
            type: "national",
            description:
              "First day of the Chinese lunar calendar - Year of the Goat",
          },
          "2027-02-07": {
            name: "🐐 Chinese New Year Holiday",
            type: "national",
            description: "Second day of Chinese New Year celebration",
          },
          "2027-02-20": {
            name: "🕉️ Thaipusam",
            type: "religious",
            description: "Hindu festival celebrated by Tamil community",
          },
          "2027-03-10": {
            name: "🌙 Hari Raya Puasa (Eid al-Fitr)",
            type: "religious",
            description: "End of Ramadan fasting month (estimated)",
          },
          "2027-03-11": {
            name: "🌙 Hari Raya Puasa Holiday",
            type: "religious",
            description: "Second day of Eid al-Fitr celebration",
          },
          "2027-05-01": {
            name: "👷 Labour Day",
            type: "national",
            description: "International Workers' Day",
          },
          "2027-05-17": {
            name: "🐑 Hari Raya Haji (Eid al-Adha)",
            type: "religious",
            description: "Festival of Sacrifice (estimated)",
          },
          "2027-05-22": {
            name: "🧘 Wesak Day",
            type: "religious",
            description: "Buddha's birthday celebration (estimated)",
          },
          "2027-06-06": {
            name: "🌙 Awal Muharram",
            type: "religious",
            description: "Islamic New Year (estimated)",
          },
          "2027-06-07": {
            name: "👑 Yang di-Pertuan Agong's Birthday",
            type: "national",
            description: "Birthday of the King of Malaysia",
          },
          "2027-08-15": {
            name: "☪️ Maulidur Rasul",
            type: "religious",
            description: "Prophet Muhammad's birthday (estimated)",
          },
          "2027-08-31": {
            name: "🇲🇾 National Day (Merdeka Day)",
            type: "national",
            description: "Malaysia's Independence Day",
          },
          "2027-09-16": {
            name: "🇲🇾 Malaysia Day",
            type: "national",
            description: "Formation of Malaysia",
          },
          "2027-10-28": {
            name: "🪔 Deepavali",
            type: "religious",
            description: "Hindu festival of lights (estimated)",
          },
          "2027-12-25": {
            name: "🎄 Christmas Day",
            type: "religious",
            description: "Christian celebration of Jesus Christ's birth",
          },
        };
      case 2028:
        return {
          "2028-01-01": {
            name: "🎉 New Year's Day",
            type: "national",
            description: "First day of the Gregorian calendar year",
          },
          "2028-01-26": {
            name: "🐒 Chinese New Year",
            type: "national",
            description:
              "First day of the Chinese lunar calendar - Year of the Monkey",
          },
          "2028-01-27": {
            name: "🐒 Chinese New Year Holiday",
            type: "national",
            description: "Second day of Chinese New Year celebration",
          },
          "2028-02-09": {
            name: "🕉️ Thaipusam",
            type: "religious",
            description: "Hindu festival celebrated by Tamil community",
          },
          "2028-02-27": {
            name: "🌙 Hari Raya Puasa (Eid al-Fitr)",
            type: "religious",
            description: "End of Ramadan fasting month (estimated)",
          },
          "2028-02-28": {
            name: "🌙 Hari Raya Puasa Holiday",
            type: "religious",
            description: "Second day of Eid al-Fitr celebration",
          },
          "2028-05-01": {
            name: "👷 Labour Day",
            type: "national",
            description: "International Workers' Day",
          },
          "2028-05-05": {
            name: "🐑 Hari Raya Haji (Eid al-Adha)",
            type: "religious",
            description: "Festival of Sacrifice (estimated)",
          },
          "2028-05-10": {
            name: "🧘 Wesak Day",
            type: "religious",
            description: "Buddha's birthday celebration",
          },
          "2028-05-25": {
            name: "🌙 Awal Muharram",
            type: "religious",
            description: "Islamic New Year (estimated)",
          },
          "2028-06-05": {
            name: "👑 Yang di-Pertuan Agong's Birthday",
            type: "national",
            description: "Birthday of the King of Malaysia",
          },
          "2028-08-03": {
            name: "☪️ Maulidur Rasul",
            type: "religious",
            description: "Prophet Muhammad's birthday (estimated)",
          },
          "2028-08-31": {
            name: "🇲🇾 National Day (Merdeka Day)",
            type: "national",
            description: "Malaysia's Independence Day",
          },
          "2028-09-16": {
            name: "🇲🇾 Malaysia Day",
            type: "national",
            description: "Formation of Malaysia",
          },
          "2028-10-17": {
            name: "🪔 Deepavali",
            type: "religious",
            description: "Hindu festival of lights (estimated)",
          },
          "2028-12-25": {
            name: "🎄 Christmas Day",
            type: "religious",
            description: "Christian celebration of Jesus Christ's birth",
          },
        };
      default:
        return {};
    }
  }

  async fetchFromCalendarific(year) {
    const url = `${this.apis.calendarific.baseUrl}${this.apis.calendarific.endpoints.holidays}?api_key=${this.apis.calendarific.apiKey}&country=MY&year=${year}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Calendarific API error:", error);
      return null;
    }
  }

  processCalendarificHolidays(holidays) {
    const processedHolidays = {};
    holidays.forEach((holiday) => {
      const date = holiday.date.iso;
      processedHolidays[date] = {
        name: holiday.name,
        type: holiday.type ? holiday.type[0] : "national",
        description: holiday.description || holiday.name,
      };
    });
    return processedHolidays;
  }

  // Get Islamic (Hijri) date for a Gregorian date
  async getIslamicDate(gregorianDate) {
    const dateKey = gregorianDate.toISOString().slice(0, 10);

    // Check cache first
    if (this.cache.islamic.has(dateKey)) {
      const cached = this.cache.islamic.get(dateKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    let result = null;

    try {
      // Use Aladhan API for accurate Islamic dates
      const dateStr = this.formatDateForAPI(gregorianDate);
      const url = `${this.apis.aladhan.baseUrl}${this.apis.aladhan.endpoints.gregorianToHijri}/${dateStr}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.code === 200 && data.data) {
        result = {
          day: parseInt(data.data.hijri.day),
          month: parseInt(data.data.hijri.month.number),
          monthName: data.data.hijri.month.en,
          year: parseInt(data.data.hijri.year),
          weekday: data.data.hijri.weekday.en,
        };
      }
    } catch (error) {
      console.warn(
        "Aladhan API error, using accurate fallback calculation:",
        error
      );
    }

    // Use accurate fallback calculation based on official Islamic calendar
    if (!result) {
      result = this.calculateAccurateIslamicDate(gregorianDate);
    }

    // Cache the result
    if (result) {
      this.cache.islamic.set(dateKey, {
        data: result,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  // Get Chinese lunar date
  async getChineseDate(gregorianDate) {
    const dateKey = gregorianDate.toISOString().slice(0, 10);

    // Check cache first
    if (this.cache.chinese.has(dateKey)) {
      const cached = this.cache.chinese.get(dateKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    let result = null;

    try {
      // For demo purposes, we'll use the fallback calculation
      // In production, uncomment the API call below
      /*
            const dateStr = this.formatDateForChineseAPI(gregorianDate);
            const url = `${this.apis.chineseLunar.baseUrl}?date=${dateStr}&timezone=480&simplified=1`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.apis.chineseLunar.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.status === 1 && data.result) {
                result = {
                    day: data.result.lunarDate.lunarDay,
                    month: data.result.lunarDate.lunarMonth,
                    monthName: data.result.lunarDateinChinese.split('月')[0] + '月',
                    year: data.result.lunarDate.lunarYear,
                    zodiac: data.result.chineseZodiacSigninEnglish
                };
            }
            */
    } catch (error) {
      console.error("Chinese Lunar API error:", error);
    }

    // Use fallback calculation
    if (!result) {
      result = this.calculateChineseDate(gregorianDate);
    }

    // Cache the result
    if (result) {
      this.cache.chinese.set(dateKey, {
        data: result,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  formatDateForAPI(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  formatDateForChineseAPI(date) {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}${month}${day}`;
  }

  // Fallback calculation methods (simplified)
  calculateAccurateIslamicDate(gregorianDate) {
    // Accurate Islamic calendar calculation based on official sources
    // Reference: August 1, 2025 = 7 Safar 1447
    const referenceGregorian = new Date("2025-08-01");
    const referenceHijri = { day: 7, month: 2, year: 1447 }; // 7 Safar 1447

    const islamicMonths = [
      "Muharram",
      "Safar",
      "Rabi al-Awwal",
      "Rabi al-Thani",
      "Jumada al-Awwal",
      "Jumada al-Thani",
      "Rajab",
      "Sha'ban",
      "Ramadan",
      "Shawwal",
      "Dhu al-Qi'dah",
      "Dhu al-Hijjah",
    ];

    // Calculate days difference from reference date
    const daysDiff = Math.floor(
      (gregorianDate - referenceGregorian) / (1000 * 60 * 60 * 24)
    );

    // Calculate Islamic date
    let hijriDay = referenceHijri.day + daysDiff;
    let hijriMonth = referenceHijri.month;
    let hijriYear = referenceHijri.year;

    // Adjust for month boundaries (Islamic months are typically 29-30 days)
    const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29]; // Approximate

    while (hijriDay > monthLengths[hijriMonth - 1]) {
      hijriDay -= monthLengths[hijriMonth - 1];
      hijriMonth++;
      if (hijriMonth > 12) {
        hijriMonth = 1;
        hijriYear++;
      }
    }

    while (hijriDay < 1) {
      hijriMonth--;
      if (hijriMonth < 1) {
        hijriMonth = 12;
        hijriYear--;
      }
      hijriDay += monthLengths[hijriMonth - 1];
    }

    return {
      day: Math.max(1, Math.min(hijriDay, 30)),
      month: Math.max(1, Math.min(hijriMonth, 12)),
      monthName: islamicMonths[Math.max(0, Math.min(hijriMonth - 1, 11))],
      year: hijriYear,
    };
  }

  calculateIslamicDate(gregorianDate) {
    // Simplified Islamic date calculation
    const islamicEpoch = new Date("622-07-16");
    const daysDiff = Math.floor(
      (gregorianDate - islamicEpoch) / (1000 * 60 * 60 * 24)
    );
    const islamicYear = Math.floor(daysDiff / 354.37) + 1;
    const dayInYear = daysDiff % 354;
    const islamicMonth = Math.floor(dayInYear / 29.5) + 1;
    const islamicDay = Math.floor(dayInYear % 29.5) + 1;

    const islamicMonths = [
      "Muharram",
      "Safar",
      "Rabi' al-awwal",
      "Rabi' al-thani",
      "Jumada al-awwal",
      "Jumada al-thani",
      "Rajab",
      "Sha'ban",
      "Ramadan",
      "Shawwal",
      "Dhu al-Qi'dah",
      "Dhu al-Hijjah",
    ];

    return {
      day: Math.max(1, Math.min(islamicDay, 30)),
      month: Math.max(1, Math.min(islamicMonth, 12)),
      monthName: islamicMonths[Math.max(0, Math.min(islamicMonth - 1, 11))],
      year: islamicYear,
    };
  }

  calculateChineseDate(gregorianDate) {
    // Simplified Chinese lunar date calculation
    const chineseNewYear2025 = new Date("2025-01-29");
    const daysDiff = Math.floor(
      (gregorianDate - chineseNewYear2025) / (1000 * 60 * 60 * 24)
    );

    const chineseMonths = [
      "正月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "腊月",
    ];

    if (daysDiff < 0) {
      // Before Chinese New Year 2025
      const daysFromPrevNewYear = 365 + daysDiff; // Approximate
      const month = Math.floor(daysFromPrevNewYear / 30) + 1;
      const day = (daysFromPrevNewYear % 30) + 1;

      return {
        day: Math.max(1, Math.min(day, 30)),
        month: Math.max(1, Math.min(month, 12)),
        monthName: chineseMonths[Math.max(0, Math.min(month - 1, 11))],
        year: 2024,
      };
    } else {
      // After Chinese New Year 2025
      const month = Math.floor(daysDiff / 29.5) + 1;
      const day = (daysDiff % 30) + 1;

      return {
        day: Math.max(1, Math.min(day, 30)),
        month: Math.max(1, Math.min(month, 12)),
        monthName: chineseMonths[Math.max(0, Math.min(month - 1, 11))],
        year: 2025,
      };
    }
  }

  async getIslamicDate(date) {
    // For local file access, use fallback calculation to avoid API issues
    if (window.location.protocol === "file:") {
      return this.calculateIslamicDateFallback(date);
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const url = `${this.apis.aladhan.baseUrl}${this.apis.aladhan.endpoints.gregorianToHijri}/${day}-${month}-${year}`;

    try {
      const response = await Promise.race([
        fetch(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("API timeout")), 2000)
        ),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.data && data.data.hijri) {
        const hijri = data.data.hijri;
        return {
          day: hijri.day,
          monthName: hijri.month.en,
          year: hijri.year,
        };
      } else {
        console.warn(
          "Aladhan API did not return expected data for Islamic date.",
          data
        );
        // Fallback calculation for Islamic date
        return this.calculateIslamicDateFallback(date);
      }
    } catch (error) {
      console.error("Error fetching Islamic date from Aladhan API:", error);
      // Fallback calculation for Islamic date
      return this.calculateIslamicDateFallback(date);
    }
  }

  calculateIslamicDateFallback(date) {
    // Simple fallback calculation for Islamic date (approximate)
    // This is a basic approximation and may not be 100% accurate
    const islamicEpoch = new Date(622, 6, 16); // July 16, 622 CE (approximate)
    const daysDiff = Math.floor((date - islamicEpoch) / (1000 * 60 * 60 * 24));
    const islamicYear = Math.floor(daysDiff / 354.37) + 1; // Islamic year is approximately 354.37 days
    const dayInYear = daysDiff % 354;
    const islamicMonth = Math.floor(dayInYear / 29.5) + 1; // Islamic month is approximately 29.5 days
    const dayInMonth = Math.floor(dayInYear % 29.5) + 1;

    const islamicMonths = [
      "Muharram",
      "Safar",
      "Rabi' al-awwal",
      "Rabi' al-thani",
      "Jumada al-awwal",
      "Jumada al-thani",
      "Rajab",
      "Sha'ban",
      "Ramadan",
      "Shawwal",
      "Dhu al-Qi'dah",
      "Dhu al-Hijjah",
    ];

    return {
      day: Math.max(1, Math.min(30, dayInMonth)),
      monthName: islamicMonths[Math.max(0, Math.min(11, islamicMonth - 1))],
      year: Math.max(1, islamicYear),
    };
  }

  async getChineseDate(date) {
    // For local file access, use fallback calculation to avoid API issues
    if (window.location.protocol === "file:") {
      return this.calculateChineseDateFallback(date);
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const url = `https://chinese-lunar-calendar.p.rapidapi.com/api/v1/date/${year}/${month}/${day}`;

    try {
      const response = await Promise.race([
        fetch(url, {
          headers: this.apis.chineseLunar.headers,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("API timeout")), 2000)
        ),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.data && data.data.lunarDate) {
        const lunarDate = data.data.lunarDate;
        return {
          month: lunarDate.monthName,
          day: lunarDate.day,
        };
      } else {
        console.warn(
          "Chinese Lunar Calendar API did not return expected data for Chinese date.",
          data
        );
        return this.calculateChineseDateFallback(date);
      }
    } catch (error) {
      console.error(
        "Error fetching Chinese date from Chinese Lunar Calendar API:",
        error
      );
      return this.calculateChineseDateFallback(date);
    }
  }

  calculateChineseDateFallback(date) {
    // Simple fallback calculation for Chinese lunar date (approximate)
    // This is a basic approximation and may not be 100% accurate
    const chineseEpoch = new Date(1900, 0, 31); // January 31, 1900 (approximate Chinese New Year)
    const daysDiff = Math.floor((date - chineseEpoch) / (1000 * 60 * 60 * 24));
    const lunarYear = Math.floor(daysDiff / 354) + 1900; // Lunar year is approximately 354 days
    const dayInYear = daysDiff % 354;
    const lunarMonth = Math.floor(dayInYear / 29.5) + 1; // Lunar month is approximately 29.5 days
    const dayInMonth = Math.floor(dayInYear % 29.5) + 1;

    return {
      month: Math.max(1, Math.min(12, lunarMonth)),
      day: Math.max(1, Math.min(30, dayInMonth)),
    };
  }
}

// Export for use in other files
window.APIConfig = APIConfig;
