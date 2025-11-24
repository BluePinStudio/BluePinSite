---
layout: gamejams
title: "Game Jam Submissions"
date: 2018-11-28T15:15:34+10:00
permalink: "/game-jams/"
---

Outside of our main projects, we also enjoy participating in game jams. Specifically, the [Ludum Dare](https://en.wikipedia.org/wiki/Ludum_Dare) game jam where indie developers from all around the world spend a weekend making a new game from scratch. Each game jam has a different theme that helps inspire and inform game design. In addition to meeting lots of fantastic developers and artists, we get to experiment with new concepts and genres which is instrumental for creating unique games.

We have a Google Sheet that contains an exhaustive (and opinionated) list of game genres that we will eventually complete one day. If that sounds interesting, you can check it out here : [List of Games Sheet](https://docs.google.com/spreadsheets/d/1kBWtAepI7p08q5Mmt4tAY3hPu_s1zj33nycVjqrwA_w/edit?) 

<h3>Game Jam Pace Over Time</h3>

<div id="jam-pace-timeline" class="jam-pace-timeline" aria-label="Game jam monthly activity timeline"></div>

<script>
(function () {
  const data = [
    {% for jam in site.data.jams %}
      {% if jam.date_iso %}
        {
          date: "{{ jam.date_iso }}",
          title: "{{ jam.title | escape }}",
          jam: "{{ jam.jam | escape }}"
        }{% unless forloop.last %},{% endunless %}
      {% endif %}
    {% endfor %}
  ];

  if (!data.length) return;

  // Parse YYYY-MM-DD as a LOCAL date (no timezone shenanigans)
  const parseDate = (iso) => {
    const parts = iso.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10); // 1-12
    const d = parseInt(parts[2], 10);
    return new Date(y, m - 1, d); // JS months are 0-based
  };

  const jamDates = data.map(d => parseDate(d.date));
  let minDate = new Date(Math.min.apply(null, jamDates));
  let maxDate = new Date(Math.max.apply(null, jamDates));

  // Normalize to first of month
  minDate.setDate(1);
  maxDate.setDate(1);

  // Map YYYY-MM -> [jams...]
  const jamsByMonth = {};
  data.forEach(d => {
    const dt = parseDate(d.date);
    const key = dt.getFullYear() + "-" + String(dt.getMonth() + 1).padStart(2, "0");
    if (!jamsByMonth[key]) jamsByMonth[key] = [];
    jamsByMonth[key].push(d);
  });

  const slider = document.getElementById("jam-pace-timeline");
  if (!slider) return;

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const cursor = new Date(minDate);
  while (cursor <= maxDate) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth(); // 0-based
    const key = y + "-" + String(m + 1).padStart(2, "0");

    const hasJam = !!jamsByMonth[key];
    const jams = jamsByMonth[key] || [];

    const monthBox = document.createElement("div");
    monthBox.className = "jam-pace-month" + (hasJam ? " jam-pace-month--jam" : " jam-pace-month--empty");

    // Tooltip with full info
    if (hasJam) {
      const titles = jams.map(j => j.title + " (" + j.jam + ")").join(" • ");
      monthBox.title = monthNames[m] + " " + y + ": " + titles;
    } else {
      monthBox.title = monthNames[m] + " " + y + ": no game jams";
    }

    // Visible content: just month/year, and jam count if > 0
    const count = jams.length;

    monthBox.innerHTML = `
      <div class="jam-pace-month-label">
        <span class="jam-pace-month-name">${monthNames[m]}</span>
        <span class="jam-pace-year">${String(y).slice(2)}</span>
      </div>
      <div class="jam-pace-month-count">${hasJam ? "×" + count : ""}</div>
    `;

    slider.appendChild(monthBox);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // --- Drag-to-scroll behaviour ---
  let isDown = false;
  let startX;
  let scrollLeft;

  slider.addEventListener('mousedown', e => {
    isDown = true;
    slider.classList.add('active', 'dragging');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('active', 'dragging');
  });

  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active', 'dragging');
  });

  slider.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX);
    slider.scrollLeft = scrollLeft - walk;
  });
})();
</script>

### List of Submissions

<table class="table table-bordered jam-history-table">
  <thead>
    <tr>
      <th>#</th>
      <th>Date</th>
      <th>Jam</th>
      <th>Placement</th>
      <th>Entries</th>
      <th>Title</th>
      <th>Genre</th>
    </tr>
  </thead>
  <tbody>
    {% for jam in site.data.jams %}
    <tr>
      <td>{{ forloop.index }}</td>
      <td>{{ jam.date }}</td>
      <td>{{ jam.jam }}</td>
      <td>
        {% if jam.winner %}
          <span class="jam-winner">WINNER!</span>
        {% elsif jam.placement %}
          {{ jam.placement }} <small>({{ jam.percent }}%)</small>
        {% else %}
          N/A
        {% endif %}
      </td>
      <td>{{ jam.entries | default: "N/A" }}</td>
      <td>
        <a href="{{ jam.url }}">{{ jam.title }}</a>
        {% if jam.postmortem_url %}
          <br>
          <a href="{{ jam.postmortem_url }}" class="postmortem-link">View Postmortem →</a>
        {% endif %}
      </td>
      <td>{{ jam.genre }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>
