source "https://rubygems.org"
ruby "~> 3.1"  # adjust only if your Ruby is different; 3.1–3.3 is fine

# Use GitHub Pages’ pinned dependency set (Jekyll 3.10 + approved plugins)
gem "github-pages", "~> 232", group: :jekyll_plugins

group :development do
  # Needed for `jekyll serve` on newer Ruby
  gem "webrick", "~> 1.8"
  # Windows niceties: faster file watching + timezone data
  gem "wdm", ">= 0.1.0", platforms: [:mingw, :x64_mingw, :mswin]
  gem "tzinfo-data", platforms: [:mingw, :x64_mingw, :mswin, :jruby]
end
