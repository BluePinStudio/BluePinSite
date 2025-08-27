---
layout: post
title: Ship Happens Post Mortem
description: Post Mortem for my Wanna Jam game jam entry, "Ship Happens"
date: 2025-08-25 07:00:00 -0400
categories: [Jam Post Mortem]
tags: [ship happens, post mortem, gamejam]
thumbnail: /assets/images/posts/shiphappens.png
image: /assets/images/posts/shiphappens.png
published : true
---

## Introduction

During the [Do You Wanna Jam 2025](https://itch.io/jam/do-you-wanna-jam-2025) jam, we created **Ship Happens**. The theme was **Patch it Up!**, and we had 9 days to complete the game. The team consisted of Myself (Viktor) for programming, Liamtonic on game design, Rujum for 3d art, Tarudesu for 2d art, and Calvin Jee for audio.

How did I find these peeps? Liamtonic & Rujum we're both people I met through friends on twitch. Tarudesu was brought by Rujum to the mix, and Calvin is the audio lad on Falling Thingies, I've worked with him on a previous game jam / steam game.


## Timeline

- **Day 1:** The planning stage! We met in a voice call with all five of us as soon as the game jam started. Liam presented us with three potential options for which game to make after contemplating the theme for a bit. 
  - Pirate game warioware (mini game assortment) 
  - play a game and find bugs
  - leaf leep (mario party minigame)
  - It wasn't long before we decided to pursue the Warioware and get to work! Making the game with a bunch of bugs that you find and perhaps fix, would've been nice but it would involve making a compelling game and then building the whole bug finding/solving system on top of it. It was too an ask!

<figure style="text-align: center;">
<img src="/assets/images/posts/rats.png" alt="Ship Happens Rat Mini-game">
</figure>   

- **Day 2-8:** I don't want to log everything we did across all the days but suffice to say we spent a lot of time working and adding files to the google drive. I'll lots of in-progress screenshots above and below! The workflow involved uploading assets into a google drive and communicating async through discord. Before we started the game we decided on using 3D assets rasterized to png sprite sheets or individual pngs. So a lot of work was also spent on optimizing the file size and reducing the frame count for the spritesheets.

- **Final Day:** Total time we spent making the game across those 9 days was: 15hrs for game design, 70hrs for programming, 100hrs for 3D art, 20hrs for 2D art, 20hrs for audio. **Which gives us a grand total of 225hrs plus or minus 10 hours.** A lot of time spent playtesting and chatting about the game wasn't



## What Went Well

We managed to get prototypes of all the mini-games up and running on day 2 which allowed all of us to base all future work on those. This was super valuable to me because I could being iterating on things like menus and particles without worrying about the gameplay being incomplete. The fruits of that labor can be seen in the final product which is my first game jam entry that has achievements!

Also, I should mention that this is the first time trying to implement 3D assets in one of my games. Of course we had to 'fake' it by using rasterized 3D models as pngs but I think it was still wildly successful!

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Liamtonic  (Game Design)**:</span> Teamwork and collaboration went very well. Everyone had super valuable input and ideas whilst making the game. Even when we had some (albeit minor) disagreements, we talked through it and all came to a consensus. Each member had their role to play and did excellent work. I was quite impressed so much was accomplished in such a short time. Coming into this from the perspective of someone never involved in game development before, it was incredibly fun.

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Rujum  (3D Artist)**:</span> Rendering - as a 3d artist that makes almost exclusively assets for real-time rendering engines(Unity), I was afraid my lack of technical know how in 3ds Max's Arnold rendering engine would prove to be a hindrance. However, it did not, there were a few hiccups along the way (for example: pitch black outputs), but these were trivial.

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Tarudesu  (2D Artist)**:</span> One of the strongest points for me was the collaboration between me and Rujum on the art. At first I made a really basic UI design, but after seeing the 3D assets I got inspired to change it so it matches the art style, and that really tied the whole game together.
Another strong point was Viktor’s willingness to take on all of my design related notes. I was a bit worried at first about being annoying with feedback - in the past I’ve worked with developers who weren’t so open to it. Viktor listened and implemented everything I asked.

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Calvin (Audio)**:</span> Collaboration and decision-making. Well-scoped and divided allowing for smooth execution.



<figure style="text-align: center;">
<img src="/assets/images/posts/pirate.png" alt="Ship Happens Pirate Mini-game">
</figure>   

## Challenges

The main challenges for me was optimizing the game as much as possible. At its largest it was 120MB, and this was before all the assets were in. Turns out exporting hundreds of 1080p frames of an animation takes up a ton of space. We made a lot of progress there, I think we ended up shipping the game at 110MB (whereas it would've been near 150MB). 

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Liamtonic  (Game Design)**:</span> I'm not a programmer or artist, so my challenges were a lot less serious/much smaller than the others I'm sure. A lot of dialogue and the naming of things fell to me. There were a few things I struggled coming up with names for (including the title of the game!). Another aspect was writing the dialogue. I wanted to throw in a lot of pirate speak without going super overboard. It was about finding the right balance between feeling like you're speaking with a pirate and being intelligible. I didn't want it to just feel like you're speaking with a normal guy in a pirate outfit.

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Rujum  (3D Artist)**:</span> 
- Artstyle -  I am ok with the selected art style, but I dont like my results. I should have spent more time on character design and have every asset be made with the same design choice in mind. a good example is the Shark asset. it corresponds well with the Pirate assets. but not the Anchor asset. that one gets a 0\10 from me.

- Rig - Unfortunately I was very rusty in that department and spent too much time making a rig that was later harder to animate with. Also i had to redo the character rig twice because of a technical mess up.

- Landscape - I tried cutting corners with this one, had to redo it a couple of time before realizing how easier it would be if i made it somewhat procedurally using 3ds max's modifier stack wisely. Doing it that way proved beneficial when you asked me to Redo the river curve.

- Walk the plank game -  Since there was no prior mockup, or hashing out of this mini game, i strugled with the scene placement and finding a good angle to tell the story as well as introduce players to the game mechanic, this is in contrast with the Raise sail game which was great. I mismanaged this mini-games' scene resulting in a bloated art asset.

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Tarudesu  (2D Artist)**:</span> At the beginning of the jam I didn’t fully grasp the vision of the game. It seemed like everyone else got it so I went with it, hoping to catch up later. Some of the mini-games didn’t have an established concept and only developed as the jam progressed, so it wasn’t very clear what assets are needed.
I had a very limited time to work on the assets due to work/personal life, so I often worked under pressure and had to rush things. Because of that my workflow wasn’t as organized as I’d like, and honestly my folders were a complete mess.

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Calvin (Audio)**:</span> Would have liked more time to playtest late-stage game and provide feedback and fixes. Had some different ideas about audio implementation but too late to get them in (which songs would play in given contexts).

<figure style="text-align: center;">
<img src="/assets/images/posts/obstacles.png" alt="Ship Happens Obstacles Mini-game">
</figure>   


## The Final Product

Ship Happens ended up becoming one of my favorite game jam submissions to-date. The team was wholesome and very hard working and creative. The game is full of fun art, sounds and mini-games. I'm writing this before I know the final scores and outcome as far as reception but if you asked me, we smashed it out of the park! I recommend everyone reading this to give it a try :)

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Liamtonic  (Game Design)**:</span> I am incredibly happy with the outcome. The team did a phenomenal job! My only real goals were to have complete product by the end, and have it be fun. We accomplished both! It was my first ever experience working on a game like this, and I couldn't be more honored to be a part of the journey. Seeing the progress from beginning to end was incredibly rewarding and satisfying.

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Rujum  (3D Artist)**:</span> As I said, i have a hard time looking at my own assets and not being critical, but overall im happy with it. wish i could do it faster. At the brain storming stage i had reservations about the game design, i was not that enthused with the idea. I personally like games that have a unique twist on them, but after playing the game i feel that even though its not groundbreaking game design a solid experience with a good smooth flow - is quite the achievement especially in the context of a gamejam.

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Tarudesu  (2D Artist)**:</span> I think that the game turned out pretty great. Despite the challenges and time pressure we managed to create something solid and fun, with a clear visual language.

<span style="background: linear-gradient(90deg, #0d81a6, #54bdea); -webkit-background-clip: text; color: transparent;">**Comment from Calvin (Audio)**:</span> Extremely satisfied.


<figure style="text-align: center;">
<img src="/assets/images/posts/title.png" alt="Ship Happens Title Screen">
</figure>   

## Reception

**Final Game**: After a week of people playing the game we got our scores! We had 23 people leave ratings, and lots of comments as well. Here's a link to the scores and feedback! <https://itch.io/jam/do-you-wanna-jam-2025/rate/3799754>. The scores we got are fantastic! Hopefully when we deploy the game to Newgrounds with some fixes people like it just as much :)



**Overall, we scored 3rd out of 69 entries (which is top 4%)**

| **Criteria**    | **Rank**| **Percentile** |
|Overall         | 3rd  |  Top 4% | 
|Fun/Gameplay    | 2nd  |  Top 3% |
|Art/Graphics    | 4th  |  Top 6% |
|Audio           | 2nd  |  Top 3% |
|Originality     | 2nd  |  Top 3% |
|Theme           | 32nd  |  Top 46% | 
{: .table .table-sm }


## Links

- If you want to give the game a try, head over here! <https://bluepinstudio.itch.io/ship-happens>
- Check out **Liamtonic's** stuff here : <https://www.youtube.com/@liamtonic>
- Check out **Rujum's** stuff here : <https://rujum.itch.io/>
- Check out **Tarudesu's** stuff here : <https://tarudesu.itch.io/>
- Check out **Calvin Jee's** stuff here : <https://cjee246.itch.io/>


Or you can watch Manisha, the host of the jam, play the game.
<iframe width="560" height="315" src="https://www.youtube.com/embed/lj0qf_BI-sw?si=-8Tftdij67qGRqOn&amp;start=4711" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Comments & Reactions

{% include discus.html %}
{% include subscribe.html %}