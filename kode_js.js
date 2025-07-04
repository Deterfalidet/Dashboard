// === 1. Klokkefunksjon ===
function startKlokke(containerId = "klokke-container") {
    const klokkeEl = document.getElementById(containerId);
    if (!klokkeEl) return;

    function oppdaterTid() {
        const nå = new Date();
        const tidStr = nå.toLocaleTimeString("no-NO", {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        klokkeEl.innerHTML = `<h1>${tidStr}</h1>`;
    }

    oppdaterTid();
    setInterval(oppdaterTid, 1000);
}

// === 2. Ukesvær-funksjon ===
function hentUkesVær(apiKey, lat = "63.4305", lon = "10.3951", containerId = "vær-container") {
    const værEl = document.getElementById(containerId);
    if (!værEl || !apiKey) return;

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=no&appid=${apiKey}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`API-feil: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // Filtrer for tidspunkt rundt kl. 12:00
            const dagsvarsler = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5);

            let html = `<h2>📅 5-dagers værvarsel</h2><ul class="vær-liste">`;

            dagsvarsler.forEach((item) => {
                const dato = new Date(item.dt * 1000).toLocaleDateString("no-NO", {
                    weekday: 'short', day: 'numeric', month: 'short'
                });
                const temp = item.main.temp.toFixed(1);
                const beskrivelse = item.weather[0].description;
                const ikon = item.weather[0].icon;
                const vind = item.wind.speed.toFixed(1);

                const varsling = (item.wind.speed > 10 || item.weather[0].main === "Thunderstorm")
                    ? "⚠️ Varselet vær!" : "";

                html += `
                    <li>
                        <img src="https://openweathermap.org/img/wn/${ikon}@2x.png" alt="${beskrivelse}">
                        <strong>${dato}</strong>: ${beskrivelse}, ${temp}°C, Vind: ${vind} m/s ${varsling}
                    </li>`;
            });

            html += `</ul>`;
            værEl.innerHTML = html;
        })
        .catch(err => {
            værEl.innerHTML = `<p>Kunne ikke hente værdata.</p>`;
            console.error("Værdata-feil:", err);
        });
}

// === 2. Værfunksjon ===
function hentVær(apiKey, by = "Trondheim", containerId = "vær-container") {
    const værEl = document.getElementById(containerId);
    if (!værEl || !apiKey) return;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${by}&appid=${apiKey}&units=metric&lang=no`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const temp = data.main.temp.toFixed(1);
            const beskrivelse = data.weather[0].description;
            const ikon = data.weather[0].icon;
            const bildeUrl = `https://openweathermap.org/img/wn/${ikon}@2x.png`;

            værEl.innerHTML = `
                <h2>🌤 Vær i ${by}</h2>
                <img src="${bildeUrl}" alt="${beskrivelse}">
                <p>${beskrivelse}, ${temp}°C</p>
            `;
        })
        .catch(err => {
            værEl.innerHTML = `<p>Kunne ikke hente værdata.</p>`;
            console.error("Værfeil:", err);
        });
}


function visOffentligKalender(apiKey, calendarId, containerId = "kalender-container") {
    const nå = new Date();
    const nesteMåned = new Date();
    nesteMåned.setMonth(nå.getMonth() + 1);

    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${nå.toISOString()}&timeMax=${nesteMåned.toISOString()}&singleEvents=true&orderBy=startTime&key=${apiKey}`;

    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data.items || data.items.length === 0) {
                container.innerHTML = "<h2>📅 Kalender</h2><p>Ingen hendelser funnet.</p>";
                return;
            }

            let html = "<h2>📅 Kommende hendelser</h2><ul class='kalender-liste'>";
            data.items.forEach(event => {
                const start = event.start.dateTime || event.start.date;
                const dato = new Date(start).toLocaleString("no-NO", {
                    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                });
                html += `<li><strong>${dato}</strong>: ${event.summary}</li>`;
            });
            html += "</ul>";
            container.innerHTML = html;
        })
        .catch(err => {
            container.innerHTML = "<p>Feil ved henting av kalender.</p>";
            console.error("Google Kalender-feil:", err);
        });
}



// === 3. Start begge når siden lastes ===
document.addEventListener("DOMContentLoaded", function () {
    startKlokke();

    const apiKey = "8318e8a2cd525591ab9493b60f23aa9a"; // Din API-nøkkel
    hentVær(apiKey, "Trondheim", "vær-i-dag"); // Dagens vær
    hentUkesVær(apiKey, "63.4305", "10.3951", "ukes-vær"); // 5-dagersvarsel

    const googleApiKey = "AIzaSyBaZk5VJsNIwmr5OH8s6zP-2vrE7DRzPRk"; // ← ← VIKTIG!
    const kalenderId = "357c29bd23ea85b4d51fc7fb9d585e9b049960160f44d73f304d02d6deaf22e4@group.calendar.google.com";
    visOffentligKalender(googleApiKey, kalenderId);

    
});
document.addEventListener('DOMContentLoaded', function () {
      const calendarEl = document.getElementById('calendar');

      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'nb',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        googleCalendarApiKey: 'AIzaSyBaZk5VJsNIwmr5OH8s6zP-2vrE7DRzPRk',
        events: {
          googleCalendarId: 'f7d380c183c036eff343a0cc3848d113e13e289e5ab37e4a347a7a9480024a02@group.calendar.google.com'
        },
        height: 600
      });

      calendar.render();
    });
        document.addEventListener('DOMContentLoaded', function () {
      const calendarEl = document.getElementById('calendar');

      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'nb',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        googleCalendarApiKey: 'AIzaSyBaZk5VJsNIwmr5OH8s6zP-2vrE7DRzPRk',
        events: {
          googleCalendarId: 'f7d380c183c036eff343a0cc3848d113e13e289e5ab37e4a347a7a9480024a02@group.calendar.google.com'
        },
        height: 600
      });

      calendar.render();
    });