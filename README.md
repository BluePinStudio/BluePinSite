# Jekyll Origin Premium Theme

Jekyll Origin is a premium blog theme.

* [Online Documention](https://www.zerostatic.io/docs/jekyll-origin)
* [Live Demo](https://jekyll-origin.netlify.app/)

---

![Jekyll Origin Theme screenshot](https://www.zerostatic.io/theme/jekyll-origin/jekyll-origin-screenshot.png)

## Install

### Install Jekll

Make sure you have Ruby & Jekyll installed - For a step-by-step guide, read Jekyll docs [installation](https://jekyllrb.com/docs/installation/)

### Install Theme

Extract the themes .zip file to your local computer. Navigate to the project root (it contains the README.md)

Run `bundle install` to install gems.

Then run `jekyll serve` or `bundle exec jekyll serve` to start the Jekyll server.

To build the Jekyll site run `bundle exec jekyll build`

## Deploy

### Netlify

We recommend Netlify for hosting Jekyll static sites.  This theme comes with a working `netlify.toml` which will pre-configure your Netlify deployment for Jekyll. The Netlify docs have a great guide to [creating a site with Netlify](https://docs.netlify.com/site-deploys/create-deploys/).

> 💡 If you experience bundle install issues during the Netlify deployment, deleting the Gemfile.lock can sometimes help

### GitHub Pages

This theme works with GitHub Pages. If you are creating a GitHub Pages "Project site" then your site will be in a sub-folder ie `http://username.github.io/repository` You will need to update the `baseurl` in the `_config.yml` for the asset paths to work correctly.

```yaml
# _config.yml
# For GitHub pages the baseurl should be the name of your GitHub repo
# Ensure you use the leading slash; use "/my-repo-name" NOT "my-repo-name"
baseurl: "/my-repo-name"
```

Github Pages does not support automatic category generation. If you are using Github Pages you will need to manually define your categories in the `category` folder. For example create `category/my-category.md` and use the following frontmatter

```yaml
---
category: Extra
---
```


## Tips

💡 Some people report problems using the baseurl (often with GitHub Pages). This guide covers the correct usage:  [Jekyll’s site.url and baseurl](https://mademistakes.com/mastering-jekyll/site-url-baseurl/)

💡 If you experience bundle install issues during the Netlify deployment, deleting the Gemfile.lock can sometimes help

## Credits

This theme uses open-source libraries and assets.

- **Bootstrap 5** https://unsplash.com/license
- **Font Awesome 6 Free:** https://fontawesome.com/
- **Unsplash Images** https://unsplash.com/
