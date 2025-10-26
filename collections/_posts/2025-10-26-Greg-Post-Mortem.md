---
layout: post
title: Greg Post Mortem
description: Post Mortem for my Ludum Dare 58 entry, "Greg gathers ghosts because that's what he loves the most"
date: 2025-10-26 07:00:00 -0400
categories: [Jam Post Mortem]
tags: [Greg gathers ghosts because that's what he loves the most, ludum dare, gamejam]
thumbnail: /assets/images/posts/greg.png
image: /assets/images/posts/greg.png
published : true
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

<span style="background: linear-gradient(90deg, #0de076ff, #30deebff); -webkit-background-clip: text; color: transparent;">**Comment from Axel (Art)**:</span> I don't often personally work in teams, so having clear division of labor was nice. Being able to safely rely on other people to focus on the design, music, and programming allowed more focus on the art side which was needed.

<span style="background: linear-gradient(90deg, #0de076ff, #30deebff); -webkit-background-clip: text; color: transparent;">**Comment from Keely (Greg)**:</span> Aesthetic, music and vibe of the game turned out great. I liked the initial ideation - the base mechanics of the game felt like a neat spin on bullet hell that I hadn't seen before.

<span style="background: linear-gradient(90deg, #0de076ff, #30deebff); -webkit-background-clip: text; color: transparent;">**Comment from Manisha (Music)**:</span> I’m starting to get a better feel for the kind of sound I want after seeing the art and asking about the gameplay pacing to get an idea about the tempo. From there, I’ve been getting good at laying down a solid foundation to build on. I also feel like my workflow is improving, I’m getting faster at testing out ideas and knowing what fits or doesn’t fit the vibe. I’m also starting to trust my ear more instead of second-guessing every choice.

<figure style="text-align: center;">
<img src="/assets/images/posts/gregearly2.png" alt="Greg on Newgrounds">
</figure>

## Challenges
Coming off the back of making [Ship Happens](https://bluepinstudio.itch.io/ship-happens) in 10 days, I wanted to include the same level of functionality to the game such as achievements, multiple game modes, and more narrative. Turns out 3 days isn't enough time to do 10 days of work. 

I found myself telling people "I don't know if I want to do 3 day jams anymore" because how limited the time frame is. I want to include a bunch of stuff, but I simply cannot :(

<span style="background: linear-gradient(90deg, #0de076ff, #30deebff); -webkit-background-clip: text; color: transparent;">**Comment from Axel (Art)**:</span> I'm not an artist in any sense of the word, mostly do programming, so it was definitely a different track of mind. Think I'm pretty slow at it, and generally not super happy with most of the output. I also unfortunately just didn't have as much time as I would have liked to dedicate towards the jam, and am thankful for others largely supporting most the project.

<span style="background: linear-gradient(90deg, #0de076ff, #30deebff); -webkit-background-clip: text; color: transparent;">**Comment from Keely (Greg)**:</span> I just wasn't really all that available to help with stuff. For previous jams we had a little more coordination/in person collaboration which is what I like about game jams.

<span style="background: linear-gradient(90deg, #0de076ff, #30deebff); -webkit-background-clip: text; color: transparent;">**Comment from Manisha (Music)**:</span> I wasn’t free all weekend and had a massive headache on the last day but I pushed through! Sadly, I couldn’t find the right sounds until just a couple hours before the deadline. Luckily, my sister had some free time and jumped in to help. She actually came up with the second half of the melody line, so props to her for saving me while I was half-dead. After that, I cleaned things up, added a spooky ambience in the background and called it a wrap. It ended up being a bit more chaotic than I’d like, and I really wanted to stream the process, but overall I’m happy with how it turned out. I also didn’t really contribute to the gameplay or brainstorming side of things, so I had a bit of FOMO and didn't feel the team aspect as much as usual, which was totally my choice but I hope no one minded! The team handled that part super well and it all came together nicely in the end.

<figure style="text-align: center;">
<img src="/assets/images/posts/gregui.png" alt="Greg on Newgrounds">
</figure>

## The Final Product
The final product turned out great! I don't really have much to add. It was a great use of minimal assets and the team worked well together. 

<span style="background: linear-gradient(90deg, #0de076ff, #30deebff); -webkit-background-clip: text; color: transparent;">**Comment from Axel (Art)**:</span> It was really interesting seeing other peoples design ideas, and I think it added a lot of flavor to something that if I had made myself would be quite stale. I think the rest of the team did a really great job, and although I'm not super happy with my art in general, think the overall product is pretty fun!

<span style="background: linear-gradient(90deg, #0de076ff, #30deebff); -webkit-background-clip: text; color: transparent;">**Comment from Keely (Greg)**:</span> It was a good scope. There's some neat ideas in there. Some aspects could use some nudging in terms of the challenge/feedback but overall it turned out pretty well. Also, Greg is cool. I'm glad I got the chance to help bring him and his ghost fetish into the world.

<span style="background: linear-gradient(90deg, #0de076ff, #30deebff); -webkit-background-clip: text; color: transparent;">**Comment from Manisha (Music)**:</span> Pretty happy! It’s upbeat and fits the gameplay well, though it could’ve been less repetitive. That’s something I’ll work on next time. Still, seeing the positive feedback has made it all worth it!



## Reception
**Final Game**: After two weeks of people playing the game we got our scores! We had 42 people leave ratings, and lots of comments as well. Here's a link to the scores and feedback! <https://ldjam.com/events/ludum-dare/58/greg-gathers-ghosts-because-thats-what-he-loves-the-most>. 

We also managed to score some pretty cool accolades from Newgrounds! We were the second best game of the day when we uploaded it AND got on the front page! Verrry cool. There is also a contest happening right now on Newgrounds for halloween. There are prizes but we're not in it for the money and fame. Only keely is...


**There were 1365 other entries**

| **Criteria**    | **Rank**| **Percentile** |
|Overall       | 169th |  Top 16% | 
|Fun           | 85th |  Top 8% |
|Innovation    | 225th |  Top 21% |
|Theme         | 425th |  Top 40% |
|Graphics      | 197th |  Top 18% |
|Audio         | 152nd |  Top 14% | 
|Humor         | 277th |  Top 25% | 
|Mood          | 524th |  Top 48% | 
{: .table .table-sm }

<figure style="text-align: center;">
<img src="/assets/images/posts/gregnewgrounds.png" alt="Greg on Newgrounds">
</figure>   


## Links

- If you want to give the game a try, head over here! <https://bluepinstudio.itch.io/greg-gathers-ghosts-because-thats-what-he-loves-the-most>
- Check out **Axel's** stuff here : <https://axelmakesstuff.itch.io/>
- Check out **Keely's** stuff here : <https://steampowered.com/app/2267230>
- Check out **Manisha's** stuff here : <https://www.wannibestudios.com/>




## Comments & Reactions

{% include discus.html %}
{% include subscribe.html %}