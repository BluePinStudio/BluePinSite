---
layout: home
permalink: "/"
title: "Blue Pin Studio"
description: "Blue Pin Studio is a Toronto, Canada based indie developer specializing in 2D games. They collaborate with global talent to produce titles including Explory Story, Charles, the Bee, Pixel Fixel, and Eggnog Incorporated. Their dedication to innovation, community events, and active game jam participation sets them apart in the indie scene."
image: "/assets/images/Vinny.gif"
show_social_media_in_title: true
meta_title: Blue Pin Studio
meta_description: "Blue Pin Studio is a Toronto, Canada based indie developer specializing in 2D games. They collaborate with global talent to produce titles including Explory Story, Charles, the Bee, Pixel Fixel, and Eggnog Incorporated. Their dedication to innovation, community events, and active game jam participation sets them apart in the indie scene."


posts:
  heading: ""
  limit: 3
  sort: date # date | weight
  view_more_button_text: "More Posts"
  view_more_button_link: /blog
  columns: 3 # 1 | 2 | 3 | 4
  show_authors: true
  show_categories: true
---

<div class="section">
  <div class="container">
    <div class="row">
      <div class="col-12 col-lg-8">
        {% include framework/title.html
          title=page.title
          description=page.description
          image=page.image
        %}
      </div>
    </div>
  </div>
</div>

<div class="section pt-0">
  <div class="container">
    <div class="row">
      {% for category in site.categories %}
        <div class="col-12 col-md-8 mb-2">
          <h3>
            {% include framework/category-link.html category_name=category.first show_count=true %}
          </h3>
        </div>
      {% endfor %}
    </div>
  </div>
</div>