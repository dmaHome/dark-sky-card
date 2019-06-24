// First we need to retrieve the LitElement from the corresponding HA Lovelace class
var LitElement = LitElement || Object.getPrototypeOf(customElements.get("home-assistant-main"));
var html = LitElement.prototype.html;


const summarySensor = "sensor.dark_sky_summary";
const apparentTemperatureSensor = "sensor.dark_sky_apparent_temperature";
const dailySummarySensor = "sensor.dark_sky_daily_summary";
const hourlySummarySensor = "sensor.dark_sky_hourly_summary";
const iconSensor = "sensor.dark_sky_icon";
const sunSensor = "sun.sun";
const temperatureSensor = "sensor.dark_sky_temperature";
const highTemperatureSensor = "sensor.dark_sky_daytime_high_temperature_0d";
const lowTemperatureSensor = "sensor.dark_sky_overnight_low_temperature_0d";
const popSensor = "sensor.dark_sky_precip_probability";
const intensitySensor = "sensor.dark_sky_precip_intensity";
const windSpeedSensor = "sensor.dark_sky_wind_speed";
const windBearingSensor = "sensor.dark_sky_wind_bearing";
const windGustSensor = "sensor.dark_sky_wind_gust";
const visibilitySensor = "sensor.dark_sky_visibility";
const humiditySensor = "sensor.dark_sky_humidity";
const pressureSensor = "sensor.dark_sky_pressure";

const weatherIcons = {
  "clear-day": "day",
  "clear-night": "night",
  "rain": "rainy-5",
  "snow": "snowy-6",
  "sleet": "rainy-6",
  "wind": "cloudy",
  "fog": "cloudy",
  "cloudy": "cloudy",
  "partly-cloudy-day": "cloudy-day-3",
  "partly-cloudy-night": "cloudy-night-3",
  "hail": "rainy-7",
  "thunderstorm": "thunder",
  "tornado": "thunder"
};

const windDirections = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSO",
  "SO",
  "OSO",
  "O",
  "ONO",
  "NO",
  "NNO",
  "N"
];

// This custom card extends the LitElement base class
class DarkSkyCard extends LitElement {

  // We have two properties ... the config and the hass
  static get properties() {
    return {
      _config: {},
      hass: {}
    };
  }


  // This render routine defines the dark-sky card template
  render() {

    if (!this._config || !this.hass) {
      return html``;
    }


    var windBearing = windBearingSensor in this.hass.states ?
                      isNaN(this.hass.states[windBearingSensor].state) ?
                      this.hass.states[windBearingSensor].state :
                      windDirections[(Math.round((this.hass.states[windBearingSensor].state / 360) * 16))] : 0;

    var intensity = intensitySensor in this.hass.states
      ? html`
        <span id="intensity-text"> - ${this.hass.states[intensitySensor].state}</span>
        <span class="unit"> ${this.getUnit('intensity')}</span>`
      : ``;


    // Build HTML
    return html`
      <style>
      ${this.renderStyle()}
      </style>
      <ha-card class = "card">  
        <span class="icon bigger"
              id="icon-bigger"
              style="background: none, url(${
                this.getWeatherIcon(
                  this.hass.states[iconSensor].state.toLowerCase()
                )}) no-repeat; background-size: contain;">
        ${this.hass.states[iconSensor].state}
        </span>
        <span class="temp"
              id="temperature-text">
        ${Math.round(this.hass.states[temperatureSensor].state)}
        </span>
        <span class="tempc">${this.getUnit('temperature')}</span>
        ${summarySensor in this.hass.states
          ? html`<span class="currentText" id="current-text">${this.hass.states[summarySensor].state}</span>`
          : ""
        }
        ${apparentTemperatureSensor in this.hass.states
          ? html`<span class="apparent">${this.localeText.feelsLike}
              <span id="apparent-text">
              ${Math.round(this.hass.states[apparentTemperatureSensor].state)}
              </span> ${this.getUnit("temperature")}</span>`
          : ""
        }
        ${hourlySummarySensor in this.hass.states
          ?  html`<br><span class="currentSummary"
                            id="hourly-summary-text">
                      ${this.hass.states[hourlySummarySensor].state}
                      </span></br>`
          : ""
        }
        ${this._config.show_separator ? html`<hr class=line>` : ""}
        <span>
          <ul class="variations">
            <li>
              ${highTemperatureSensor in this.hass.states
                ? html`<li>
                       <span class="ha-icon">
                         <ha-icon icon="mdi:thermometer"></ha-icon>
                       </span>${this.localeText.maxToday}
                       <span id="daytime-high-text">
                       ${Math.round(this.hass.states[highTemperatureSensor].state)}
                       </span>
                       <span> ${this.getUnit('temperature')}</span></li>`
                : ""
              }
              ${popSensor in this.hass.states
                ? html`<li>
                       <span class="ha-icon">
                         <ha-icon icon="mdi:weather-rainy"></ha-icon>
                       </span>
                       <span id="pop-text">
                       ${Math.round(this.hass.states[popSensor].state)}
                       </span> %
                       <span id="pop-intensity-text">${intensity}</span></li>`
                : ""
              }
              ${windSpeedSensor in this.hass.states
                ? html`<li>
                       <span class="ha-icon">
                         <ha-icon icon="mdi:weather-windy"></ha-icon>
                       </span>
                       <span id="wind-speed-text">
                       ${Math.round(this.hass.states[windSpeedSensor].state*3.6)}
                       </span>
                       <span class="unit"> ${this.getUnit('length')}/h</span>
                       <span id="wind-bearing-text"> (${windBearing})</span>
                       <span class="wind-beaufort" id="wind-beaufort-text"> - Force ${this.beaufortWind.force}</span></li>`
                : ""
              }
              ${visibilitySensor in this.hass.states
                ? html`<li>
                       <span class="ha-icon">
                         <ha-icon icon="mdi:weather-fog"></ha-icon>
                       </span>
                       <span id="visibility-text">${this.hass.states[visibilitySensor].state}</span>
                       <span class="unit"> ${this.getUnit('length')}</span></li>`
                : ""
              }
              ${sunSensor in this.hass.states
                ? this.sunSet.next
                : ""
              }
            </li>
            <li>
              ${lowTemperatureSensor in this.hass.states
                ? html`<li>
                       <span class="ha-icon">
                         <ha-icon icon="mdi:thermometer"></ha-icon>
                       </span>${this.localeText.minToday} <span id="overnight-low-text">
                       ${Math.round(this.hass.states[lowTemperatureSensor].state)}</span>
                       <span> ${this.getUnit('temperature')}</span></li>`
                : ""
              }
              ${humiditySensor in this.hass.states
                ? html`<li>
                       <span class="ha-icon">
                         <ha-icon icon="mdi:water-percent"></ha-icon>
                       </span>
                       <span id="humidity-text">${this.hass.states[humiditySensor].state}</span>
                       <span class="unit"> %</span></li>`
                : ""
              }
              ${windGustSensor in this.hass.states
                ? html`<li>
                       <span class="ha-icon">
                         <ha-icon icon="mdi:weather-windy"></ha-icon>
                       </span>${this.localeText.windMore} <span id="wind-gust-text">
                       ${Math.round(this.hass.states[windGustSensor].state*3.6)}
                       </span>
                       <span class="unit"> ${this.getUnit('length')}/h</span></li>`
                : ""
              }
              ${pressureSensor in this.hass.states
                ? html`<li>
                       <span class="ha-icon">
                         <ha-icon icon="mdi:gauge"></ha-icon>
                       </span>
                       <span id="pressure-text">
                       ${this.hass.states[pressureSensor].state}
                       </span>
                       <span class="unit"> ${this.getUnit('air_pressure')}</span></li>`
                : ""
              }
              ${sunSensor in this.hass.states
                ? this.sunSet.following
                : ""
              }
             </li>
          </ul>
        </span>
            <div class="forecast clear">
              ${this.forecast.map(daily => html`
                <div class="day fcasttooltip">
                  <span class="dayname" id="fcast-dayName-${daily.dayIndex}">${(daily.date).toLocaleDateString(this._config.locale,{weekday: 'short'})}</span>
                  <br><i class="icon" id="fcast-icon-${daily.dayIndex}" style="background: none, url(${
                    this.getWeatherIcon(
                      this.hass.states[daily.condition].state.toLowerCase()
                    )}) no-repeat; background-size: contain;"></i>
                   <br><span class="lowTemp" id="fcast-low-${daily.dayIndex}">
                   ${Math.round(this.hass.states[daily.templow].state)}
                   </span> / <span class="highTemp" id="fcast-high-${daily.dayIndex}">
                   ${Math.round(this.hass.states[daily.temphigh].state)}${this.getUnit("temperature")}
                   </span>
                  <br><span class="pop" id="fcast-pop-${daily.dayIndex}">${Math.round(this.hass.states[daily.pop].state)} %</span>
                  <div class="fcasttooltiptext" id="fcast-summary-${daily.dayIndex}">
                  ${ this._config.tooltips
                     ? this.hass.states[daily.summary].state
                     : ""
                  }
                  </div>
                </div>`)}
              </div>
        ${dailySummarySensor in this.hass.states
          ? html`<br>
                 <span class="unit" id="daily-summary-text">
                 ${this.hass.states[dailySummarySensor].state}
                 </span></br>`
                : ""
              }
      </ha-card>
    `;
  }


  // Handle some basic localization here
  get localeText() {
    switch (this._config.locale) {
      case "fr" :
        return {
	      feelsLike: "Ressenti:",
          maxToday: "Max. du jour:",
          minToday: "Min. du jour:",
          windMore: "Rafales à",
        }
      default :
        return {
          feelsLike: "Feels like",
          maxToday: "Today's High",
          minToday: "Today's Low",
          windMore: "Wind gust",
        }
    }
  }


  // Retrieve the correct icon according to the current condition and the day/night period
  getWeatherIcon(condition) {

    return `/local/icons/weather_icons/${
      this._config.static_icons
        ? "static"
        : "animated"}/${weatherIcons[condition]}.svg`;

  }


  // Gather forecast information before display.
  // Forecast are for the next 5 fays
  get forecast() {
    var forecastDate1 = new Date();
    forecastDate1.setDate(forecastDate1.getDate()+1);
    var forecastDate2 = new Date();
    forecastDate2.setDate(forecastDate2.getDate()+2);
    var forecastDate3 = new Date();
    forecastDate3.setDate(forecastDate3.getDate()+3);
    var forecastDate4 = new Date();
    forecastDate4.setDate(forecastDate4.getDate()+4);
    var forecastDate5 = new Date();
    forecastDate5.setDate(forecastDate5.getDate()+5);
    

    const forecast1 = { date: forecastDate1,
                        dayIndex: '1',
  	                    condition: "sensor.dark_sky_icon_1d",
  					    temphigh: "sensor.dark_sky_daytime_high_temperature_1d",
  						templow:  "sensor.dark_sky_overnight_low_temperature_1d",
  						pop: "sensor.dark_sky_precip_probability_1d",
  						summary: "sensor.dark_sky_summary_1d", };
    const forecast2 = { date: forecastDate2,
                        dayIndex: '2',
  	                    condition: "sensor.dark_sky_icon_2d",
  					    temphigh: "sensor.dark_sky_daytime_high_temperature_2d",
  						templow:  "sensor.dark_sky_overnight_low_temperature_2d",
  						pop: "sensor.dark_sky_precip_probability_2d",
  						summary: "sensor.dark_sky_summary_2d", };
    const forecast3 = { date: forecastDate3,
                        dayIndex: '3',
  	                    condition: "sensor.dark_sky_icon_3d",
  					    temphigh: "sensor.dark_sky_daytime_high_temperature_3d",
  						templow:  "sensor.dark_sky_overnight_low_temperature_3d",
  						pop: "sensor.dark_sky_precip_probability_3d",
  						summary: "sensor.dark_sky_summary_3d", };
    const forecast4 = { date: forecastDate4,
                        dayIndex: '4',
  	                    condition: "sensor.dark_sky_icon_4d",
  					    temphigh: "sensor.dark_sky_daytime_high_temperature_4d",
  						templow:  "sensor.dark_sky_overnight_low_temperature_4d",
  						pop: "sensor.dark_sky_precip_probability_4d",
  						summary: "sensor.dark_sky_summary_4d", };
    const forecast5 = { date: forecastDate5,
                        dayIndex: '5',
  	                    condition: "sensor.dark_sky_icon_5d",
  					    temphigh: "sensor.dark_sky_daytime_high_temperature_5d",
  						templow:  "sensor.dark_sky_overnight_low_temperature_5d",
  						pop: "sensor.dark_sky_precip_probability_5d",
  						summary: "sensor.dark_sky_summary_5d", };

    return [forecast1, forecast2, forecast3, forecast4, forecast5];
  }


  // This routine returns the information about the rise and set of the sun
  get sunSet() {
    var nextSunSet ;
    var nextSunRise;

    if (this._config.time_format) {
      nextSunSet = new Date(this.hass.states[sunSensor].attributes.next_setting).toLocaleTimeString(this._config.locale,
        {hour: '2-digit', minute:'2-digit',hour12: this.is12Hour});
      nextSunRise = new Date(this.hass.states[sunSensor].attributes.next_rising).toLocaleTimeString(this._config.locale,
        {hour: '2-digit', minute:'2-digit', hour12: this.is12Hour});
    }
    else {
      nextSunSet = new Date(this.hass.states[sunSensor].attributes.next_setting).toLocaleTimeString(this._config.locale,
        {hour: '2-digit', minute:'2-digit'});
      nextSunRise = new Date(this.hass.states[sunSensor].attributes.next_rising).toLocaleTimeString(this._config.locale,
        {hour: '2-digit', minute:'2-digit'});
    }
    var nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 1);
    if (this.hass.states[sunSensor].state == "above_horizon" ) {
      nextSunRise = nextDate.toLocaleDateString(this._config.locale,{weekday: 'short'}) + " " + nextSunRise;
      return {
      'next': html`<li><span class="ha-icon"><ha-icon icon="mdi:weather-sunset-down"></ha-icon></span><span id="sun-next-text">${nextSunSet}</span></li>`,
      'following': html`<li><span class="ha-icon"><ha-icon icon="mdi:weather-sunset-up"></ha-icon></span><span id="sun-following-text">${nextSunRise}</span></li>`,
      'nextText': nextSunSet,
      'followingText': nextSunRise,
      };
    } else {
      if (new Date().getDate() != new Date(this.hass.states[sunSensor].attributes.next_rising).getDate()) {
        nextSunRise = nextDate.toLocaleDateString(this._config.locale,{weekday: 'short'}) + " " + nextSunRise;
        nextSunSet = nextDate.toLocaleDateString(this._config.locale,{weekday: 'short'}) + " " + nextSunSet;
      } 
      return {
      'next': html`<li><span class="ha-icon"><ha-icon icon="mdi:weather-sunset-up"></ha-icon></span><span id="sun-next-text">${nextSunRise}</span></li>`,
      'following': html`<li><span class="ha-icon"><ha-icon icon="mdi:weather-sunset-down"></ha-icon></span><span id="sun-following-text">${nextSunSet}</span></li>`,
      'nextText': nextSunRise,
      'followingText': nextSunSet,
      };
    }
  }


  // Return the beaufort wind force on the beaufort scale and the corresponding color
  get beaufortWind() {

    switch (this.hass.states[windSpeedSensor].attributes.unit_of_measurement) {
      case 'mph':
        if (this.hass.states[windSpeedSensor].state >= 73) {
          return {
            'color': '#D5102D',
            'force': 12
          };
        }
        if (this.hass.states[windSpeedSensor].state >= 64) {
          return {
            'color': '#ED2912',
            'force': 11
          };
        }
        if (this.hass.states[windSpeedSensor].state >= 55) {
          return {
            'color': '#ED6312',
            'force': 10
          };
        }
        if (this.hass.states[windSpeedSensor].state >= 47) {
          return {
            'color': '#ED8F12',
            'force': 9
          };
        }
        if (this.hass.states[windSpeedSensor].state >= 39) {
          return {
            'color': '#EDC212',
            'force': 8
          };
        }
        if (this.hass.states[windSpeedSensor].state >= 31) {
          return {
            'color': '#DAED12',
            'force': 7
          };
        }
        if (this.hass.states[windSpeedSensor].state >= 25) {
          return {
            'color': '#A4ED12',
            'force': 6
          };
        }
        if (this.hass.states[windSpeedSensor].state >= 18) {
          return {
            'color': '#73ED12',
            'force': 5
          };
        }
        if (this.hass.states[windSpeedSensor].state >= 13) {
          return {
            'color': '#6FF46F',
            'force': 4
          };
        }
        if (this.hass.states[windSpeedSensor].state >= 8) {
          return {
            'color': '#96F7B4',
            'force': 3
          };
        }
        if (this.hass.states[windSpeedSensor].state >=3) {
          return {
            'color': '#96F7DC',
            'force': 2
          };
        }
        if (this.hass.states[windSpeedSensor].state >= 1) {
          return {
            'color': '#AEF1F9',
            'force': 1
          };
        }

      default: // Assume m/s
        if ((this.hass.states[windSpeedSensor].state * 3.6) >= 118) {
          return {
            'color': '#D5102D',
            'force': 12
          };
        }
        if ((this.hass.states[windSpeedSensor].state * 3.6) >= 103) {
          return {
            'color': '#ED2912',
            'force': 11
          };
        }
        if ((this.hass.states[windSpeedSensor].state * 3.6) >= 89) {
          return {
            'color': '#ED6312',
            'force': 10
          };
        }
        if ((this.hass.states[windSpeedSensor].state * 3.6) >= 75) {
          return {
            'color': '#ED8F12',
            'force': 9
          };
        }
        if ((this.hass.states[windSpeedSensor].state * 3.6) >= 62) {
          return {
            'color': '#EDC212',
            'force': 8
          };
        }
        if ((this.hass.states[windSpeedSensor].state * 3.6) >= 50) {
          return {
            'color': '#DAED12',
            'force': 7
          };
        }
        if ((this.hass.states[windSpeedSensor].state * 3.6) >= 39) {
          return {
            'color': '#A4ED12',
            'force': 6
          };
        }
        if ((this.hass.states[windSpeedSensor].state * 3.6) >= 29) {
          return {
            'color': '#73ED12',
            'force': 5
          };
        }
        if ((this.hass.states[windSpeedSensor].state * 3.6) >= 20) {
          return {
            'color': '#6FF46F',
            'force': 4
          };
        }
        if ((this.hass.states[windSpeedSensor].state * 3.6) >= 12) {
          return {
            'color': '#96F7B4',
            'force': 3
          };
        }
        if ((this.hass.states[windSpeedSensor].state * 3.6) >=6) {
          return {
            'color': '#96F7DC',
            'force': 2
          };
        }
        if ((this.hass.states[windSpeedSensor].state * 3.6) >= 1) {
          return {
            'color': '#AEF1F9',
            'force': 1
          };
        }
    }

    return {
      'color' : '#FFFFFF',
      'force' : 0
    };
  }


  // returns true if 12 hour clock or false if 24
  get is12Hour() {
    var hourFormat= this._config.time_format ? this._config.time_format : 12
    switch (hourFormat) {
      case 24:
        return false;
      default:
        return true;
    }
  }


  // Computes and returns the CSS part of the card
  renderStyle() {
  
    // Get config flags or set defaults if not configured
    var tooltipBGColor = this._config.tooltip_bg_color || "rgb( 75,155,239)";
    var tooltipFGColor = this._config.tooltip_fg_color || "#fff";
    var tooltipBorderColor = this._config.tooltip_border_color || "rgb(255,161,0)";
    var tooltipBorderWidth = this._config.tooltip_border_width || "1";
    var tooltipCaretSize = this._config.tooltip_caret_size || "5";
    var tooltipWidth = this._config.tooltip_width || "110";
    var tooltipLeftOffset = this._config.tooltip_left_offset || "-12";
    var tooltipVisible = this._config.tooltips ? "visible" : "hidden";
    var tempTopMargin = this._config.temp_top_margin || "-0.3em";
    var tempFontWeight = this._config.temp_font_weight || "300";
    var tempFontSize = this._config.temp_font_size || "4em";
    var tempRightPos = this._config.temp_right_pos || "0.85em";
    var tempUOMTopMargin = this._config.temp_uom_top_margin || "-9px";
    var tempUOMRightMargin = this._config.temp_uom_right_margin || "7px";
    var apparentTopMargin = this._config.apparent_top_margin || "45px";
    var apparentRightPos =  this._config.apparent_right_pos || "1em";
    var apparentRightMargin = this._config.apparent_right_margin || "1em";
    var currentTextTopMargin = this._config.current_text_top_margin || "39px";
    var currentTextLeftPos = this._config.current_text_left_pos || "5em";
    var currentTextFontSize = this._config.current_text_font_size || "1.5em";
    var currentSummaryTopMargin = this._config.current_summary_top_margin || "60px";
    var largeIconTopMargin = this._config.large_icon_top_margin || "-3.5em";
    var largeIconLeftPos = this._config.large_icon_left_pos || "0em";
    var currentDataTopMargin = this._config.current_data_top_margin ? this._config.current_data_top_margin : this._config.show_separator ? "1em" : "7em";
    var separatorTopMargin = this._config.separator_top_margin || "6em";
  
    return html`
        .clear {
        clear: both;
      }

      .card {
        margin: auto;
        padding-top: 2em;
        padding-bottom: 1em;
        padding-left: 1em;
        padding-right: 1em;
        position: relative;
      }

      .ha-icon {
        height: 18px;
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }

      .line {
        margin-top: ${separatorTopMargin};
        margin-left: 1em;
        margin-right: 1em;
      }
      
      .temp {
        font-weight: ${tempFontWeight};
        font-size: ${tempFontSize};
        color: var(--primary-text-color);
        position: absolute;
        right: ${tempRightPos};
        margin-top: ${tempTopMargin};
      }

      .tempc {
        font-weight: ${tempFontWeight};
        font-size: 1.5em;
        vertical-align: super;
        color: var(--primary-text-color);
        position: absolute;
        right: 1em;
        margin-top: ${tempUOMTopMargin};
        margin-right: ${tempUOMRightMargin};
      }

      .apparent {
        color: var(--primary-text-color);
        position: absolute;
        right: ${apparentRightPos};
        margin-top: ${apparentTopMargin};
        margin-right: ${apparentRightMargin};
      }

      .currentText {
        font-size: ${currentTextFontSize};
        color: var(--secondary-text-color);
        position: absolute;
        left: ${currentTextLeftPos};
        margin-top: ${currentTextTopMargin};
      }
      
      .currentSummary {
        color: var(--primary-text-color);
        position: absolute;
        margin-top: ${currentSummaryTopMargin};
        text-align: center;
        width: 100%;
      }
      
      .pop {
        font-weight: 400;
        color: var(--primary-text-color);
      }

      .variations {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        font-weight: 300;
        color: var(--primary-text-color);
        list-style: none;
        padding: 0.2em;
        margin-top: ${currentDataTopMargin};
      }

      .unit {
        font-size: 0.8em;
      }

      .forecast {
        width: 100%;
        margin: 0 auto;
        height: 9em;
      }

      .day {
        display: block;
        width: 20%;
        float: left;
        text-align: center;
        color: var(--primary-text-color);
        border-right: .1em solid #d9d9d9;
        line-height: 1.5;
        box-sizing: border-box;
        margin-top: 1em;
      }

      .dayname {
        text-transform: uppercase;
      }

      .forecast .day:first-child {
        margin-left: 20;
      }

      .forecast .day:nth-last-child(1) {
        border-right: none;
        margin-right: 0;
      }

      .highTemp {
        font-weight: bold;
      }

      .lowTemp {
        color: var(--secondary-text-color);
      }

      .wind-beaufort {
        background-color: ${this.beaufortWind.color};
        padding: 5px;
        font-weight: 900;
      }

      .icon.bigger {
        width: 10em;
        height: 10em;
        margin-top: ${largeIconTopMargin};
        position: absolute;
        left: ${largeIconLeftPos};
      }

      .icon {
        width: 50px;
        height: 50px;
        margin-right: 5px;
        display: inline-block;
        vertical-align: middle;
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
        text-indent: -9999px;
      }

      .weather {
        font-weight: 300;
        font-size: 1.5em;
        color: var(--primary-text-color);
        text-align: left;
        position: absolute;
        top: -0.5em;
        left: 6em;
        word-wrap: break-word;
        width: 30%;
      }
  
      .fcasttooltip {
        position: relative;
        display: inline-block;
      }

      .fcasttooltip .fcasttooltiptext {
        visibility: hidden;
        width: ${tooltipWidth}px;
        background-color: ${tooltipBGColor};
        color: ${tooltipFGColor};
        text-align: center; 
        border-radius: 6px;
        border-style: solid;
        border-color: ${tooltipBorderColor};
        border-width: ${tooltipBorderWidth}px;
        padding: 5px 0;

        /* Position the tooltip */
        position: absolute;
        z-index: 1;
        bottom: 50%;
        left: 0%; 
        margin-left: ${tooltipLeftOffset}px;
      }

      .fcasttooltip .fcasttooltiptext:after {
        content: "";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -${tooltipCaretSize}px;
        border-width: ${tooltipCaretSize}px;
        border-style: solid;
        border-color: ${tooltipBorderColor} transparent transparent transparent;
      }

      .fcasttooltip:hover .fcasttooltiptext {
        visibility: ${tooltipVisible};
      }
      `
}


  // Retrieves the measure unit for different case
  getUnit(measure) {
    
    const lengthUnit = this.hass.config.unit_system.length;
    
    switch (measure) {
      case 'air_pressure':
        return lengthUnit === 'km' ? 'hPa' : 'mbar';
      case 'length':
        return lengthUnit;
      case 'precipitation':
        return lengthUnit === 'km' ? 'mm' : 'in';
      case 'intensity':
        return lengthUnit === 'km' ? 'mm/h' : 'in/h'
      default:
        return this.hass.config.unit_system[measure] || '';
    }
  }


  // We store the configuration.
  // This routine is called whenever the configuration changes
  setConfig(config) {
    this._config = config;
  }


  // This routine checks if there is a need to update and re-render
  // the card
  shouldUpdate(changedProps) {

    if (changedProps.has("_config")) {
      return true;
    }

    const oldHass = changedProps.get("hass");
    if (oldHass) {
      return (
        oldHass.states[summarySensor] !== this.hass.states[summarySensor] ||
        oldHass.states[apparentTemperatureSensor] !== this.hass.states[apparentTemperatureSensor] ||
        oldHass.states[dailySummarySensor] !== this.hass.states[dailySummarySensor] ||
        oldHass.states[hourlySummarySensor] !== this.hass.states[hourlySummarySensor] ||
        oldHass.states[iconSensor] !== this.hass.states[iconSensor] ||
        oldHass.states[temperatureSensor] !== this.hass.states[temperatureSensor] ||
        oldHass.states[highTemperatureSensor] !== this.hass.states[highTemperatureSensor] ||
        oldHass.states[lowTemperatureSensor] !== this.hass.states[lowTemperatureSensor] ||
        oldHass.states[popSensor] !== this.hass.states[popSensor] ||
        oldHass.states[intensitySensor] !== this.hass.states[intensitySensor] ||
        oldHass.states[windSpeedSensor] !== this.hass.states[windSpeedSensor] ||
        oldHass.states[windBearingSensor] !== this.hass.states[windBearingSensor] ||
        oldHass.states[windGustSensor] !== this.hass.states[windGustSensor] ||
        oldHass.states[visibilitySensor] !== this.hass.states[visibilitySensor] ||
        oldHass.states[humiditySensor] !== this.hass.states[humiditySensor] ||
        oldHass.states[pressureSensor] !== this.hass.states[pressureSensor] ||
        oldHass.states["sensor.dark_sky_icon_1d"] !== this.hass.states["sensor.dark_sky_icon_1d"] ||
        oldHass.states["sensor.dark_sky_daytime_high_temperature_1d"] !== this.hass.states["sensor.dark_sky_daytime_high_temperature_1d"] ||
        oldHass.states["sensor.dark_sky_overnight_low_temperature_1d"] !== this.hass.states["sensor.dark_sky_overnight_low_temperature_1d"] ||
        oldHass.states["sensor.dark_sky_precip_probability_1d"] !== this.hass.states["sensor.dark_sky_precip_probability_1d"] ||
        oldHass.states["sensor.dark_sky_summary_1d"] !== this.hass.states["sensor.dark_sky_summary_d"] ||
        oldHass.states["sensor.dark_sky_icon_2d"] !== this.hass.states["sensor.dark_sky_icon_2d"] ||
        oldHass.states["sensor.dark_sky_daytime_high_temperature_2d"] !== this.hass.states["sensor.dark_sky_daytime_high_temperature_2d"] ||
        oldHass.states["sensor.dark_sky_overnight_low_temperature_2d"] !== this.hass.states["sensor.dark_sky_overnight_low_temperature_2d"] ||
        oldHass.states["sensor.dark_sky_precip_probability_2d"] !== this.hass.states["sensor.dark_sky_precip_probability_2d"] ||
        oldHass.states["sensor.dark_sky_summary_2d"] !== this.hass.states["sensor.dark_sky_summary_2d"] ||
        oldHass.states["sensor.dark_sky_icon_3d"] !== this.hass.states["sensor.dark_sky_icon_3d"] ||
        oldHass.states["sensor.dark_sky_daytime_high_temperature_3d"] !== this.hass.states["sensor.dark_sky_daytime_high_temperature_3d"] ||
        oldHass.states["sensor.dark_sky_overnight_low_temperature_3d"] !== this.hass.states["sensor.dark_sky_overnight_low_temperature_3d"] ||
        oldHass.states["sensor.dark_sky_precip_probability_3d"] !== this.hass.states["sensor.dark_sky_precip_probability_3d"] ||
        oldHass.states["sensor.dark_sky_summary_3d"] !== this.hass.states["sensor.dark_sky_summary_3d"] ||
        oldHass.states["sensor.dark_sky_icon_4d"] !== this.hass.states["sensor.dark_sky_icon_4d"] ||
        oldHass.states["sensor.dark_sky_daytime_high_temperature_4d"] !== this.hass.states["sensor.dark_sky_daytime_high_temperature_4d"] ||
        oldHass.states["sensor.dark_sky_overnight_low_temperature_4d"] !== this.hass.states["sensor.dark_sky_overnight_low_temperature_4d"] ||
        oldHass.states["sensor.dark_sky_precip_probability_4d"] !== this.hass.states["sensor.dark_sky_precip_probability_4d"] ||
        oldHass.states["sensor.dark_sky_summary_4d"] !== this.hass.states["sensor.dark_sky_summary_4d"] ||
        oldHass.states["sensor.dark_sky_icon_5d"] !== this.hass.states["sensor.dark_sky_icon_5d"] ||
        oldHass.states["sensor.dark_sky_daytime_high_temperature_5d"] !== this.hass.states["sensor.dark_sky_daytime_high_temperature_5d"] ||
        oldHass.states["sensor.dark_sky_overnight_low_temperature_5d"] !== this.hass.states["sensor.dark_sky_overnight_low_temperature_5d"] ||
        oldHass.states["sensor.dark_sky_precip_probability_5d"] !== this.hass.states["sensor.dark_sky_precip_probability_5d"] ||
        oldHass.states["sensor.dark_sky_summary_5d"] !== this.hass.states["sensor.dark_sky_summary_5d"] ||
        oldHass.states[sunSensor] !== this.hass.states[sunSensor]
      );
    }

    return true;
  }


  // Sets the card size to 150 pixels
  getCardSize() {
    return 3
  }
  
}

// Time to register our card to the browser
customElements.define('dark-sky-card', DarkSkyCard);


