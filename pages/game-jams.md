---
layout: gamejams
title: "Game Jam Submissions"
date: 2018-11-28T15:15:34+10:00
permalink: "/game-jams/"
---

Outside of our main projects, we also enjoy participating in game jams. Specifically, the [Ludum Dare](https://en.wikipedia.org/wiki/Ludum_Dare) game jam where indie developers from all around the world spend a weekend making a new game from scratch. Each game jam has a different theme that helps inspire and inform game design. In addition to meeting lots of fantastic developers and artists, we get to experiment with new concepts and genres which is instrumental for creating unique games.

We have a Google Sheet that contains an exhaustive (and opinionated) list of game genres that we will eventually complete one day. If that sounds interesting, you can check it out here : [List of Games Sheet](https://docs.google.com/spreadsheets/d/1kBWtAepI7p08q5Mmt4tAY3hPu_s1zj33nycVjqrwA_w/edit?) 

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
