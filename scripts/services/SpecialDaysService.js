(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.SpecialDaysService = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = createSpecialDaysService;
  exports.getKey = getKey;

  /**
   * Returns a special days wrapper service
   * 
   * @param {{byYears: Object.<string, SpecialDaysYear>, byMonths: Object.<string, SpecialDaysMonth>} specialDays
   * @returns {{isSpecialDay:function,getSpecialDay:function, getAll:function, getRaw:function}}
   */

  /**
   * @typedef {Object} SpecialDayType
   * @property {!string} availableLangs - languages stack
   * @property {!Object.<string, string>} text - texts by language
   * @property {!number} [1] length - how many days it continues
   * @example
   * ...
    	availableLangs: "en,tr",
        "text": {
        	"*": "New Year",
        	"tr": "Yeni Yil"
        }
    ...
   * 
   * @typedef {string} SpecialDayType~calendarType
   * @value '*' All calendars
   * @value 'hijri' Hijri calendar 
   * @value 'gregorian' Gregorian calendar 
   */

  /**
   * @typedef {Object.<SpecialDayType~calendarType, SpecialDayType>} SpecialDay~SpecialDayType
   * @example 
   * ...
    	"gregorian": {
      	availableLangs: "en,tr",
      	"text": {
      		"*": "New Year",
      		"tr": "Yeni Yil"
      	}
      },
      length: 2
    ...
   * 
   * 
   * @typedef {Array.<SpecialDay>} SpecialDays~SpecialDayType
   * @typedef {Object.<string, SpecialDays>} SpecialDaysMonth~SpecialDayType
   * @typedef {Object.<string, Array.<SpecialDaysMonth>>} SpecialDaysYear~SpecialDayType
   */

  /*day-0": [],
  */
  /**
   * @exports createSpecialDaysService
   *
   */
  function createSpecialDaysService(specialDays) {
    var specialDaysBundle = denormalizeSpecialDays(specialDays);

    // console.log(JSON.stringify(specialDaysBundle));

    return Object.freeze({
      isSpecialDay: function isSpecialDay(_ref) {
        var _ref$year = _ref.year,
            year = _ref$year === undefined ? "" : _ref$year,
            month = _ref.month,
            day = _ref.day,
            calendar = _ref.calendar,
            lang = _ref.lang;

        var keyByYear = getKey(year, month, day, calendar);
        var keyByMonth = getKey("", month, day, calendar);
        var keyByYearandAllCalendars = getKey(year, month, day, "*");
        var keyByMonthandAllCalendars = getKey("", month, day, "*");

        var selectedDays = specialDaysBundle[keyByYear] || specialDaysBundle[keyByMonth] || specialDaysBundle[keyByYearandAllCalendars] || specialDaysBundle[keyByMonthandAllCalendars] || [];

        var selectedDay = selectedDays.find(function (aday) {
          return !aday.langs.some(function (ln) {
            return ln === "~" + lang;
          }) || aday.langs.some(function (ln) {
            return ln === "*";
          }) || aday.langs.some(function (ln) {
            return ln === lang;
          });
        });

        return selectedDay && selectedDay.langs.some(function (ln) {
          return ln !== "~" + lang;
        }) && selectedDay.langs.some(function (ln) {
          return ln === "*";
        }) && selectedDay.langs.some(function (ln) {
          return ln === lang;
        });
      },
      getSpecialDay: function getSpecialDay(_ref2) {
        var _ref2$year = _ref2.year,
            year = _ref2$year === undefined ? "" : _ref2$year,
            month = _ref2.month,
            day = _ref2.day,
            calendar = _ref2.calendar,
            lang = _ref2.lang;

        var keyByYear = getKey(year, month, day, calendar);
        var keyByMonth = getKey("", month, day, calendar);
        var keyByYearandAllCalendars = getKey(year, month, day, "*");
        var keyByMonthandAllCalendars = getKey("", month, day, "*");

        var selectedDays = specialDaysBundle[keyByYear] || specialDaysBundle[keyByMonth] || specialDaysBundle[keyByYearandAllCalendars] || specialDaysBundle[keyByMonthandAllCalendars] || [];

        var selectedDay = selectedDays.find(function (aday) {
          return !aday.langs.some(function (ln) {
            return ln === "~" + lang;
          }) || aday.langs.some(function (ln) {
            return ln === "*";
          }) || aday.langs.some(function (ln) {
            return ln === lang;
          });
        });

        return selectedDay ? {
          getText: function getText() {
            return selectedDay.text[lang] || selectedDay.text["*"];
          }
        } : false;
      },
      getAll: function getAll() {
        return specialDaysBundle;
      },
      getRaw: function getRaw() {
        return specialDays;
      }
    });
  }

  function getKey(year, month, day, calendar) {
    return year ? "m-" + year + "-" + month + "-" + day + "-" + calendar : "m-" + month + "-" + day + "-" + calendar;
  }

  /**
   * 
   * @private
   * 
   * @returns {Object}
   */
  function denormalizeSpecialDays(specialDays) {
    var byYears = specialDays["byYears"] || [];
    var byMonths = specialDays["byMonths"] || [];
    var acc = {};

    byYears.forEach(function (year) {
      year.months.forEach(function (month) {
        month.days.forEach(function (day) {
          var newday = {};
          newday.day = day.day;

          Object.keys(day.calendars).forEach(function (calendar) {
            var key = "m-" + year.year + "-" + month.month + "-" + day.day + "-" + calendar;
            acc[key] = acc[key] || [];
            newday.text = Object.assign({}, day.calendars[calendar].text);
            newday.langs = day.calendars[calendar].availableLangs.split(",");
            acc[key].push(newday);

            for (var i = 0; i < day.length - 1; i++) {
              var _key = "m-" + year.year + "-" + month.month + "-" + (day.day + i) + "-" + calendar;
              acc[_key] = acc[_key] || [];

              acc[_key].push(newday);
            }
          });
        });
      });
    });

    byMonths.forEach(function (month) {
      month.days.forEach(function (day) {
        var newday = {};
        newday.day = day.day;

        Object.keys(day.calendars).forEach(function (calendar) {
          var key = "m-" + month.month + "-" + day.day + "-" + calendar;
          acc[key] = acc[key] || [];
          acc[key].push(newday);
          newday.text = Object.assign({}, day.calendars[calendar].text);
          newday.langs = day.calendars[calendar].availableLangs.split(",");

          for (var i = 1; i < day.length; i++) {
            var _key2 = "m-" + month.month + "-" + (day.day + i) + "-" + calendar;

            acc[_key2] = acc[_key2] || [];
            acc[_key2].push(newday);
          }
        });
      });
    });

    return acc;
  }
});