---
layout: basic
title: "Trash Force"
date: 2018-11-28T15:15:34+10:00
permalink: "/trash-force/"
description: "You have been abducted by a group of magical beings who live inside books in order to help them repair their world. Traverse through various thematic worlds battling bosses, solving puzzles, and trying to find a way back home."
image: /assets/images/games/trashforcescreenshot2.webp
---
## <ins>Links</ins>

<div class="social" id="social">
  {% for link in site.data.trashforce_links %}
  <a href="{{ link.url }}" target="blank" title="{{ link.title }}">
    {% if link.icon_image %}
    <img class="social-icon-img" src="{{ link.icon_image | relative_url }}" alt="{{ link.title }}">
    {% else %}
    <i class="{{ link.fa_icon }}"></i>
    {% endif %}
  </a>
  {% endfor %}
</div>

## <ins>The Gist</ins>

- **Release Date:** Q4 2025
- **Retail Price:** To be deteredmined...
- **Platforms:** Desktop Windows, Desktop Linux

The earth has fallen. First to trash, and now to aliens! Blast asteroids, get upgrades, and most importantly, save the world!

## <ins>The Team</ins>

| **Name**         | **Role**                             | **Links**                                                                |
|------------------|--------------------------------------|--------------------------------------------------------------------------|
| Viktor           | Programming & Game Design            | -                                                                        |
| Mike             | Character & Environment Art          | -                                                                        |
| Sean             | UI Art & Additional Art              | -                                                                        |
| Felix            | Music and Sound Effects              | -                                                                        |
{: .table .table-bordered }

![Explory Story Screenshot](/assets/images/games/trashforcescreenshot1.webp)