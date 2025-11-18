---
layout: post
title: Yield Post Mortem
description: Post Mortem for my Alakajam 22 entry, "The Yield"
date: 2025-11-25 07:00:00 -0400
categories: [Jam Post Mortem]
tags: [The Yield, ludum dare, gamejam]
thumbnail: /assets/images/posts/greg.png
image: /assets/images/posts/greg.png
published : false
---

## Introduction

During the [Ludum Dare 58](https://ldjam.com/) game jam, we created **Greg gathers ghosts because that's what he loves the most**. The theme was **Collector**, and we had 3 days complete the game. The team consisted of Myself (Viktor), Manisha, Keely and Axel. 

This is the same team responsible for bringing you the infamous [RAMpage](https://bluepinstudio.itch.io/rampage) and [Antz vs Plantz](https://bluepinstudio.itch.io/antz-vs-plantz). With an added bonus of Mr. Axel! Long time orbiter, first time collaborator.


## Timeline

### Day 1
Before we started I told the team that I would really like an idle clicker game like Cookie Clicker. Once the theme was announced, Keely and I got into a call to start brainstorming the game design and the idea of making an idle clicker game lasted about 5 minutes. You know what they say about the best laid plans! 

We knew we wanted to have a million objects on the screen, but it didn't take the form of a clicker game, it took the form of a bullet hell quite quickly. The first day was about getting the core mechanics down so we had basically just a bunch of circles flying around, here's a screenshot of what that looked liked.

<figure style="text-align: center;">
<img src="/assets/images/posts/gregearly.png" alt="Greg on Newgrounds">
</figure>

### Day 2
 Since we already had out direction established, everyone went to work making assets. Keely was tasked to make an iconic character (like the tree guys in Antz vs Plantz or the skull guy in RAMpage), Axel set off drawing ghosts and Manisha started working on a music track.

 I began creating a bunch of behaviors and variables to toggle/set those behaviors for the ghosts. For example v_delay determines the time between ghost waves, v_speed determines their speed, v_amount determines how many spawn, v_straight determines if the ghosts fly straight or curve (curve angle determined by v_turnstrength) and so on...

 This allows us to have many levels by simply setting those variables in different ways. Additionally, the runtime could randomize the variables on its own to create whatever patterns.

<figure style="text-align: center;">
<img src="/assets/images/posts/gregvariables.png" alt="Greg Variables">
</figure>

### Day 3
 As per usual, the final day is crunch mode. We intended to have an endless mode where the runtime would re-generate a new pattern every 20s but we had to scrap it for time.

 A lot of time goes into making sure the game flows properly from loss and win conditions to npc dialogue to functioning menus and so on... I would estimate 75% of the work of the game jam submission had nothing to do with working on gameplay. 

<figure style="text-align: center;">
<img src="/assets/images/posts/gregghosts.png" alt="Greg on Newgrounds">
</figure>

## What Went Well
The strength of this project was able to get so much variety in gameplay without having to manually create a bunch of content. The entire game is basically 3 pngs and a few audio files. On a per-file basis I can't imagine a more efficient game. 

Efficiencies aside, the game is also quite fun and hypnotizing. During development I found myself just staring at the ghosts spawning, perhaps it could be a cool music visualizer or screensaver or something.

<figure style="text-align: center;">
<img src="/assets/images/posts/gregearly2.png" alt="Greg on Newgrounds">
</figure>

## Challenges
Coming off the back of making [Ship Happens](https://bluepinstudio.itch.io/ship-happens) in 10 days, I wanted to include the same level of functionality to the game such as achievements, multiple game modes, and more narrative. Turns out 3 days isn't enough time to do 10 days of work. 

I found myself telling people "I don't know if I want to do 3 day jams anymore" because how limited the time frame is. I want to include a bunch of stuff, but I simply cannot :(


<figure style="text-align: center;">
<img src="/assets/images/posts/gregui.png" alt="Greg on Newgrounds">
</figure>

## The Final Product
The final product turned out great! I don't really have much to add. It was a great use of minimal assets and the team worked well together. 


## Reception
**Final Game**: After two weeks of people playing the game we got our scores! We had 42 people leave ratings, and lots of comments as well. Here's a link to the scores and feedback! <https://ldjam.com/events/ludum-dare/58/greg-gathers-ghosts-because-thats-what-he-loves-the-most>. 

We also managed to score some pretty cool accolades from Newgrounds! We were the second best game of the day when we uploaded it AND got on the front page! Verrry cool. There is also a contest happening right now on Newgrounds for halloween. There are prizes but we're not in it for the money and fame. Only keely is...


## Links

- If you want to give the game a try, head over here! <https://bluepinstudio.itch.io/greg-gathers-ghosts-because-thats-what-he-loves-the-most>


## Comments & Reactions

{% include discus.html %}
{% include subscribe.html %}