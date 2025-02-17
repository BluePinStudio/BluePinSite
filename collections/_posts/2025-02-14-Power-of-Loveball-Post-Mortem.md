---
layout: post
title: Power of Loveball Post Mortem
description: Post Mortem for my BIGMODE Game Jam entry, "Power of Loveball"
date: 2025-02-17T00:00:00Z
categories: [Jam Post Mortem]
tags: [loveball, post mortem, game jam]
thumbnail: /assets/images/posts/loveball.png
image: /assets/images/posts/loveball.png
published : true
---

## Introduction

During the [Bigmode Game Jam 2025](https://itch.io/jam/bigmode-game-jam-2025) game jam, we created **Power of Loveball**. The theme was **Power**, and we had 9 days complete the game. The team consisted of Myself (Viktor), Pijinguy, Fasla and Princess Sylvysprit.


## Timeline

### Pre-Jam
Before the jam started I was happily working on my other projects without any plan to join the jam. This jam was also run last year when I chose to not participate as well. I had no particular reason to do the jam then and now...

### Jam Begins...
On January 24th, the jam began and I was still blissfully unaware that I would be joining it. Everything changed when, 2 days into the jam, Pijinguy (someone I previously did a jam with) came into the public voice chat I was hanging out in and said "my programmer quit my game jam team."

I immediately volunteered because I interpreted it as a sign! I was half interest and half disinterested in doing the jam, but this provided me with the right setup to do it. Pijinguy already had a team in place, and a game designed, all I had to do is show up and program it!

I wouldn't of offered if I knew what was coming next...

### The Development
Maybe the previous statement was too dramatic. But I will say the development of this game was the least pleasant out of all 16 game jams I've done so far. Not by much I suppose, but definitely last place. I was dedicated to doing my best for my boy Pijinguy so I shifted around my schedule to enable me to work 40~ hours on this game in the remaining 7 days. The development started by reading the Game Design Document, which already knocked me out of my seat before I've even begun working. The plan was to make TWO games in one. A visual novel where you battle love interests and a 2d platformer where you shoot balls at enemies.

Then, I found out that the musician will not be making any of the sound effects and will not be available until the final days of the jam. Which spooked me further... I went straight to work, whipping up a prototype in lightning speed. Me and Pijin began iterating while Pijin communicated to Fasla to get the character art sorted. Day by day, both sections of the game and the supporting systems got made, revised, remade, and polished. Sylvysprit came through in the final days with the music and we were able to make some adjustments to some of the scenes to match the music better.

Ultimately every teammate ended up contributing a solid amount of effort towards completing the game. Sylvysprit mentioned in an interview after that she spent roughly 8 hours working on the game. Myself and Pijin probably spent approximately 40 hours each and I have no clue how much time Fasla spent, but probably alot because she managed to deliver 5 HD character portraits.

<figure style="width: 100%; margin: 0; text-align: center;">
  <img src="/assets/images/posts/loveball2.png" alt="Image description" style="width: 100%; height: auto;">
  <figcaption>Early prototype for the first platformer level. Praise be!</figcaption>
</figure>

## What Went Well
All things considered; starting the programming 2 days late, making two separate game modes, starting the music 5 days late, we managed to deliver a game that I doubt many other teams could surpass given the same constraints. All elements of the game are above mediocre quality and pretty cohesive. There are lots of little quality of life stuff in the game design such as text effects for the visual novel, a fancy title screen with reactive character, sound options, player anonymous telemetry and more. Many devs don't end up having time to add little stuff like that...

- <span style="background: linear-gradient(90deg, #FFD12C, #ff7bb5); -webkit-background-clip: text; color: transparent;">**Comment from Pijinguy (Artist + Game Design)**:</span> every single person on the team was super talented, and delivered amazingly. so grateful for that. i finally felt my improvement in various aspects when working on this project. and the game is actually fun for me and people seem to like it. so, awesome!
- <span style="background: linear-gradient(90deg, #FFD12C, #ff7bb5); -webkit-background-clip: text; color: transparent;">**Comment from Princess Sylvysprit (Soundtrack)**:</span> The planning stages, in my opinion, tasks were dedicated clearly to everyone efficiently and quickly, and communication about when i'd be ready to start working (which was much later than the rest) did not cause any issues, i believe that was mainly thanks to my public reputation and portifolio showing my experience with composing under short time restraints, i'm glad the team trusted me with this
- <span style="background: linear-gradient(90deg, #FFD12C, #ff7bb5); -webkit-background-clip: text; color: transparent;">**Comment from Fasla (Artist)**:</span>  No comment

<figure style="width: 100%; margin: 0; text-align: center;">
  <img src="/assets/images/posts/green.gif" alt="Image description" style="width: 100%; height: auto;">
  <figcaption>Early prototype for the shield guys in act 3!</figcaption>
</figure>


## Challenges
Without going into too much detail, the challenges I had was working with our musician Sylvysprit. Her music was fantastic but I think our personalities or mannerisms got in the way of a cohesive and effortless collaboration. Combining that with the stress of putting in so many hours, having to do multiple roles (programming and sfx), joining late, and a huge scope, is what made this the most stressful game jam I've ever done. We even had a debacle about timestamps. The music Sylvysprit provided did not loop if you play the music normally, she instructed us to find at which EXACT millisecond timestamp the song could be looped at and for me to program the loop points from there. I thought that was strange for me to go digging through the audio file looking for timestamps, luckily Pijin came to the rescue. He went searching for the timestamps while I programmed the loop point functionality.

- <span style="background: linear-gradient(90deg, #FFD12C, #ff7bb5); -webkit-background-clip: text; color: transparent;">**Comment from Pijinguy (Artist + Game Design)**:</span> writing the dialogue was a huge challenge. this is the first time i write anything that's not for school, and i kept cringing at myself. but it turned out fine... i think. letting the first programmer leave the project due to lack of motivation was a bit worrying at first, but viktor came to the rescue fast! there was tensions in the team which does impact morale, but it did not end up imapcting the resulting product, which is what is important in such a small amount of time for dev.
- <span style="background: linear-gradient(90deg, #FFD12C, #ff7bb5); -webkit-background-clip: text; color: transparent;">**Comment from Princess Sylvysprit (Soundtrack)**:</span>  Slight miscommunications about programming loop points in the music, but in my opinion it was worth it, because we were one of the few game submissions at the gamejam that actually had bothered to polish this part of the game (correct music looping), which i believe is a small but important part about making the game feel more polished and professional
- <span style="background: linear-gradient(90deg, #FFD12C, #ff7bb5); -webkit-background-clip: text; color: transparent;">**Comment from Fasla (Artist)**:</span> No comment

## The Final Product
Like I mentioned earlier, all things considering the game is good. At some point in the development process I asked Pijin, as the designer, if we could remove either the visual novel or platformer section so we could dedicate more time towards the remaining game mode. He declined, and arguably probably ended up giving us a higher overall score due to the "originality" of mixing two games like this. It's not the first time i merged two different game modes, but it may be the last! Rizz++ to us all!

- <span style="background: linear-gradient(90deg, #FFD12C, #ff7bb5); -webkit-background-clip: text; color: transparent;">**Comment from Pijinguy (Artist + Game Design)**:</span> quite great! i knew i would enjoy this game, and i do. but i was worried others wouldn't but seemingly, early reviews are stating that the game is good, and fun. so satisfying to see. i love this game. no regrets.
- <span style="background: linear-gradient(90deg, #FFD12C, #ff7bb5); -webkit-background-clip: text; color: transparent;">**Comment from Princess Sylvysprit (Soundtrack)**:</span> Honestly i think the gameplay combinations are a bit of a mess, and i saw a lot of great suggestions in the comments on the game page; for example the addition of collectible elements to unlock more dialogue in the VN segments, i think that was a missed opportunity in hindsight It was a weird game genre combination from the get go, i don't think there's much demand for a game like this if we look at the bigger picture, but it was a fun experiment for sure I also think that the flow of the platforming sections is a bit "stop and go", which i personally don't like in platformers, but changing that would require scrapping the entire main gameplay mechanic of controlling the ball with the mouse, and i think it would've been a waste to restart, so we continued with the ideas we planned out, and made the idea as polished as possible, i think that was probably our greatest strength as a team; the idea might have been kind of doomed from the start to be a bit of a mess, but i do firmly believed everyone in the team did everything to the best of their ability to deliver an overall very polished experience, i believe we've succeeded in that, it's a flawed but fun game.
- <span style="background: linear-gradient(90deg, #FFD12C, #ff7bb5); -webkit-background-clip: text; color: transparent;">**Comment from Fasla (Artist)**:</span> No comment


<figure style="width: 100%; margin: 0; text-align: center;">
  <img src="/assets/images/posts/loveball.gif" alt="Image description" style="width: 100%; height: auto;">
  <figcaption>Finalized attack and death visuals</figcaption>
</figure>

## Reception

**Final Game**: We had 208 people try it out and leave lots of comments as well. If you average the score we got in each category, you end up with a ranking of 150th. That puts us in the top 18% out of 834 games. Unfortunately we didn't end up getting any awards or a feature on Dunkey's stream. The competition was tough! So many great games. This game scores 8th out of all the ranked game jams i've done, which is a decent outcome. Due to the aforementioned player telemetry, we were also able to gather anonymous statistics about how players play the game. We found that roughly 50% of people who complete Level 1 end up completing the game. I would say thats a big win too!

| **Criteria**    | **Rank**| **Percentile** |
|Originality  | 70th     |Top 8%  | 
|Presentation | 101st    |Top 12% |
|Fun          | 153rd    |Top 18% |
|Theme        | 277th    |Top 33% |
{: .table .table-bordered }


## Links

- [**If you want to give the game a try, head over here!**](https://bluepinstudio.itch.io/power-of-loveball)
- Check out **Pijinguy**'s stuff here : <https://x.com/Blast_A_Finn>
- Check out **Princess Sylvysprit**'s stuff here : <https://www.youtube.com/@Sylvysprit>
- Check out **Fasla**'s stuff here : no link provided


## Comments & Reactions

{% include discus.html %}
{% include subscribe.html %}