---
layout: post
title: Trash Force Post Mortem
description: Post Mortem for my Yogscast Jingle Jam Game Jam entry, "Trash Force"
date: 2024-12-20 01:00:00 -0400
categories: [Jam Post Mortem]
tags: [trash force, post mortem, game jam]
thumbnail: /assets/images/posts/trashforce.png
image: /assets/images/posts/trashforce.png
published : true
---

## Introduction

During the [Yogscast Jingle Jam](https://itch.io/jam/jinglegamejam2024) game jam, we created **Trash Force**. The theme was **Everything has a Cost**, and we had 7 days comsplete the game. The team consisted of Myself (Viktor), Mike (Strollart), PixelPigeon and RedCocoa.



## Timeline

### Pre-Jam
Getting the team set up in google drive, getting hyped and getting ready to brainstorm. Despite knowing the theme in advance due to Yogscast sharing it to us early, we wanted to wait until the jam starts to brainstorm the game designs. This way we can start creating assets and prototypes without accidentally working prior to the jam starting.

### The first half...
Noon on a Sunday, we got on a call and begin pitching ideas. We pitched everything from Plants vs Zombies to Chicken Invaders, to Asteroids, to retro driving and racing games. We started working through all the technical details of the game such as the resolution, art styles, and things we specifically wanted to avoid. By the time the night came around, we managed to narrow it down to an Asteroids-like with tons of upgrades that cost money. 

![Trash Force Screenshot 1](/assets/images/posts/tf1.png){: width="972" height="589" }
_First bespoke piece of artwork done towards the final product_

Over the next few days we spent a lot of time getting the basics down. A functional web build using asteroids-like mechanics, some mockups for HUDs and menus.

![Trash Force Screenshot 3](/assets/images/posts/tf3.png){: width="972" height="589" }
_Working on the menus_

We spent a bunch of time battling with Itch outages and revising all of the HUD/Menu assets.

Right at the end of the first half, we have a near-final version of the title screen and some fantastic animations for the hands. Look at them go! This was the day one of our artists, PixelPigeon, started feeling sick. That spooked the heck out of me! Losing an artist halfway through the process would've caused us to cut down the scope dramatically.

![Trash Force Screenshot 4](/assets/images/posts/tf1.gif){: width="972" height="589" }
_The laptop is mostly done!_

### The second half...
Onwards, we started refining the game systems. We had so many google docs for potential upgrades. Some of the upgrades that didn't make the cut are :
- **Backshot upgrade**	
    - When player shoots, shoots an additional bullet behind them simutaniously. Does not consume any additional ammo 
- **Hardhead upgrade**	
    - Player now damages asteroids when they bump into them (but still takes damage)
- **Stickers upgrade**	
    - Adds a sticker to your laptop (permanant)
- **Fez (hat) upgrade**	
    - Gives your possum a pretty hat
- **Gassy upgrade**	
    - Eat trash to gain a small amount of fuel
- **Beans**	
    - Drops a fart cloud every X seconds that breaks trash.  dissapears after awhile
- **Space Roombas**	
    - 2 Roombas circle around the player hitting trashteroids and cleaning small trash should have health


There wasn't much crunch in the final days or hours of the jam. Everything came in steadily until... One day before we had to submit the game we realised that our intro cutscene was dead silent. I put the battle music overtop the cutscene and it sound good at all (go figure). I messaged RedCocoa that I was going to sleep but we have no audio in the cutscene. He spent the next few hours manually creating a musical score for the entire 1+ minute cutscene. When i woke up in the morning the final piece of the puzzle was done, and all that was remaining are last minute tweaks to the upgrades, interfaces, adding an option menu, etc.


### Post-Jam:
Unlike most jams I participate in, there was nothing left to do in the post-jam. What I mean by that is, most jams have a rating period where participants rate eachothers game. This jam didn't have that. Which means the only official business left was wait for the Yogscast Stream where they played the top games and announced the winners...

## What Went Well
Everything! All aspects of the game jam turned out great. The pipeline for delivering and implementing assets was smooth and we hardly needed any revisions on graphics or audio.

- **Comment from Mike (Artist)**: We created a concept that was a modern twist on an oldschool classic. I came in with this being an experiment of what we could do with a small idea, and it went really well
- **Comment from PixelPigeon (Artist)**: We had a good amount of time to work on this project and the team was able come together on the vision quite quickly. The programmers experience in game jams was definitely helpful.
- **Comment from RedCocoa (Musician)**: I found a general theme for the music incredibly fast. This usually takes a few approaches but this time the first thing I tried almost always ended up being what we used. This is true for both music tracks and almost all sound effects. Additionally, I usually somewhat rely on samples when creating sound effects but this time I set myself the personal challenge to use them very little, instead making almost all sounds from synthesizers or edited vocal recordings which worked incredibly well in the game context.

![Trash Force Screenshot 2](/assets/images/posts/tf2.png){: width="972" height="589" }
_Early screenshot before we finalized the UI_

## Challenges
The challenges in organizing and creating this project weren't super atypical. It's more of the same stuff you could expect from any game jam. Honestly, it was probably less challenging than most of the jams that I do because I had the pleasure of working with such talented people, and such a long time to make the game. There were a few moments where I was scared people would disappear, like when PixelPigeon told me he was sick, or when RedCocoa didn't submit anything for the first few days. It all worked out in the end, and my fears never materialized into reality.

- **Comment from Mike (Artist)**: Main challenge was just staying on top of documents. We were a new team for each other so everyone had a slightly different way of communicating.
- **Comment from PixelPigeon (Artist)**: I got friggin COVID midway through and it sucked.
- **Comment from RedCocoa (Musician)**: Unfortunately I had a personal emergency happening right at the beginning of the game jam so I was unable to really contribute anything to the game until Wednesday. This means that most of the game design was already done at this point and I had a full spreadsheet of sound descriptions to work through. I would have liked to be more involved in the early stages of the game but personal emergencies seldom take your game jam schedule into account.


## The Final Product
140+ Hours later, the team sat down and finally relaxed. I can't say if thats the case for the rest of the team, but it was the most amount of time I've ever spent on a game jam submission. I was programming, refining, playtesting for probably 50-60hrs in the span of those 7 days. The effort on all of our parts paid off! This is the most well rounded and polished game I have ever made for a game jam. One small commentary I can make about the final product that I didn't like was how much negative sentiment there was about the "authentically asteroids" movement system we implemented. I would've thought that mimicking the movement that was present in Asteroids is exactly what the doctor ordered, but the players said otherwise. All well!

- **Comment from Mike (Artist)**: Felt great about the outcome. We were only a few submissions shy of not even being seen on the livestream, and had that happened we would not have even won an award or had such great soundbites about what we made. Was very worth it in the end
- **Comment from PixelPigeon (Artist)**: Hey I just wanted to make a cool game with a team quickly and we did.
- **Comment from RedCocoa (Musician)**: I am unbelievably proud of this game already. It looks, sounds and plays incredibly and the potential it has with a few updates, more polishing and more content is something I would love to explore further. I am very satisfied with my contribution but there is no part of this game that doesn't play, look, sound or feel incredibly polished. I'm excited to see where we can take this in the future.



## Reception
![Ribbon Yogscast Gave Us](/assets/images/posts/JingleGameJamRosette3.png){: width="200" height="200" }
_Ribbon Yogscast Gave Us!_

**Final Game**: We had 150 people leave try it out and leave lots of comments as well. This jam didn't have a rating period where fellow jammers played our game so there were no scores. HOWEVER! We did get our game featured on the Yogscast stream where Lewis, Pedguin and Jennifer played our game and loved it!

They loved it so much that they awarded us Best Visual Design out of all games they reviewed. Therefore, in our eyes, we won the jam! At least we tied for first place with 6 other games. :)


Have a look at the judge's reaction to our game!
<iframe width="700" height="400" src="https://www.youtube.com/embed/FZmgG4E4SsU?si=vidNBeH7H0OYc3PQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


## Links

- **If you want to give the game a try, head over here!** <https://bluepinstudio.itch.io/trashforce>
- Check out **Mike**'s stuff here : <https://www.strollart.com/>
- Check out **PixelPigeon**'s stuff here : <https://bsky.app/profile/thepixelpigeon.bsky.social>
- Check out **RedCocoa**'s stuff here : <https://initialposition.net>


## Comments & Reactions

{% include discus.html %}
{% include subscribe.html %}