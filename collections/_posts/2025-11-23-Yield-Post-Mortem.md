---
layout: post
title: Yield Post Mortem
description: Post Mortem for my Alakajam 22 entry, "The Yield"
date: 2025-11-23 07:00:00 -0400
categories: [Jam Post Mortem]
tags: [The Yield, alakajam, gamejam]
thumbnail: /assets/images/posts/yield.png
image: /assets/images/posts/yield.png
published : true
---

## Introduction

During the [Alakajam 22](https://alakajam.com/) game jam, I created **The Yield**. The theme was **Under the Surface**, and I had 2 days complete the game. This time I decided to do my first ever solo-jam. I didn't enlist anyone to help. Spooooky. Let's see how it worked out...


## Timeline

### Friday Day 0 - Theme Announced
The theme was announced at 2pm my local time on a Friday. Unfortunately for me, I was at work and had a lot of crunching to do on day-job stuff. As soon as I got home, I booted up my [Twitch stream](https://www.twitch.tv/bluepinstudio) and started working on the game. I got a lot of the bones done within the 7hr stream. The game idea I landed on was making a digging game similar to the old flash game Motherload.

Below is a screenshot of how the tile generation and upgrade data looks like. Quick and dirty json data. The image on the right is determining the probability tables for different ores. I had 8 different tables like that depending on the height, the one you're seeing there is the one at the absolute bottom tier of tiles.

<figure style="text-align: center;">
<img src="/assets/images/posts/yieldupgrades.png" alt="An image showing all the data structure of the upgrades and mining levels in The Yield">
</figure>

### Saturday Day 1
Saturday morning came along and before I could work on the game I had 3 important tasks. Do laundry and then meetup some friends for fun activities and dinner.

My dinner plans were over, so it was time to head home, take a small nap and begin working on the game. The only problem? I woke up from the nap on Sunday morning!


### Sunday Day 2
Here we are on Sunday morning and I have to go to work again! Darn it...

Fast forward to coming home after work, I boot up the Twitch Stream again and get back to work. Determined to finish everything I still needed to do. Upgrades screen, progression, saving and loading, scene transitions, sound effects, etc.

Welp. I didn't manage to get all of it done, but I did get all these fancy gems in, spawning at different depths and a working upgrade system.

<figure style="text-align: center;">
<img src="/assets/images/posts/yieldgems.gif" alt="An image showing all the different tiles in The Yield">
</figure>

It was time to submit and I still didn't have solid scene transitions and there were a few bugs and no sound effects. What did I do instead of submitting? I pushed submission back 1 day so I can still participate in the 72hr category. This means my jam submission won't get any ratings. C'est la vie (forgive me for my french).

### Bonus! Monday Day 3
I had an extra day! Woweee. The problem? I also had to go to work on that day too. At least I had extra time. I ensured the level transitions, upgrading, running out of fuel, the hazards and everything was working properly and pressed submit. 

I also squeezed in secret button commands that let the user cycle between different color palettes. I grabbed the color palettes according to old technology. 16 colors each. Here's a gif of me cycling between them...

<figure style="text-align: center;">
<img src="/assets/images/posts/yieldpalettes.gif" alt="An image showing all the different color palettes in the game such as C64 or Macintosh.">
</figure>


## What Went Well
Considering I worked on this game for maybe 20hrs total. Entirely by myself. I think it's a really great outcome. It has something like 20 minutes of gameplay as you mine deeper and deeper, seeing new gems, getting new upgrades, etc.


## Challenges
The biggest challenge was the time crunch. I had so much going on that weekend and I was all alone on the game. I couldn't lean on other people for help for art or audio. The final game jam submission basically had no audio except for a few voice lines I recorded for the upgrades screen.

If it wasn't for making a game and a post-mortem being on my monthly goals for November, I might've just said "fuck it" and not submitted anything. We'll see, based on what it ends up becoming, if that would've been better.


<figure style="text-align: center;">
<img src="/assets/images/posts/yielddigging.gif" alt="Gameplay of digging in The Yield">
</figure>

## The Final Product
All that being said, I think the final product is solid. I would rate it a 7/10 game jam submission.


## Reception
Because the game was submitted to the extra category of a pretty small game jam event, I got basically no reception. However I showed it to a handful of gamedev pals and go their take on it. I will take their advice and spend maybe 20hrs on it in the next few weeks to make a solid post-jam version.

The post-jam version will be posted to Newgrounds in December so stay tuned for that!


## Links

- If you want to give the game a try, head over here! <https://bluepinstudio.itch.io/the-yield>


## Comments & Reactions

{% include discus.html %}
{% include subscribe.html %}