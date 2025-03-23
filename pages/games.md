---
layout: basic
title: "Commercial Games"
date: 2018-11-28T15:15:34+10:00
permalink: "/games/"
description: "Here is a directory of all the Blue Pin Studio commercial games!"
---
<style>
.game-collage {
    display: flex;
    flex-wrap: wrap;
    gap: 0; /* No gaps between images */
    justify-content: center;
}

.game-collage a {
    width: 33.33%; /* Ensures 3 images per row */
}

.game-collage img {
    width: 100%; /* Makes images fill their container */
    aspect-ratio: 460 / 215; /* Maintains correct aspect ratio */
    object-fit: cover; /* Ensures the images fill the space without stretching */
    display: block; /* Removes bottom spacing */
}

@media (max-width: 900px) { /* Adjust layout for smaller screens */
    .game-collage a {
        width: 50%; /* 2 images per row */
    }
}

@media (max-width: 600px) {
    .game-collage a {
        width: 100%; /* 1 image per row */
    }
}
</style>

<div class="game-collage">
    <a href="/trash-force/"><img src="/assets/images/games/trashforce.jpg" alt="Trash Force"></a>
    <a href="/explory-story/"><img src="/assets/images/games/exploryheader.jpg" alt="Explory Story"></a>
    <a href="/charles-the-bee/"><img src="/assets/images/games/charlesheader.jpg" alt="Charles the Bee"></a>
    <a href="/pixel-fixel/"><img src="/assets/images/games/pixelheader.jpg" alt="Pixel Fixel"></a>
    <a href="/eggnog-inc/"><img src="/assets/images/games/eggnogheader.jpg" alt="Eggnog Incorporated"></a>
</div>
