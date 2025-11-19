source "https://rubygems.org"

# Let GitHub Pages control Jekyll + plugins
gem "github-pages", group: :jekyll_plugins

group :development do
  # Needed for `jekyll serve` on newer Ruby
  gem "webrick", "~> 1.8"

  # Windows niceties: faster file watching + timezone data
  gem "wdm", ">= 0.1.0", platforms: [:mingw, :x64_mingw, :mswin]
  gem "tzinfo-data", platforms: [:mingw, :x64_mingw, :mswin, :jruby]
end
