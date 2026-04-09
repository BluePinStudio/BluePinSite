#!/usr/bin/env ruby
# Generates tag pages from post frontmatter before Jekyll build.
# Each unique tag gets a page at pages/tag/{slug}.md

require 'yaml'
require 'date'
require 'fileutils'

script_dir = File.dirname(File.expand_path(__FILE__))
posts_dir = File.join(script_dir, 'collections', '_posts')
tag_dir = File.join(script_dir, 'pages', 'tag')

# Collect all unique tags from posts (case-insensitive dedup, keeps first-seen casing)
tag_map = {}
Dir.glob(File.join(posts_dir, '*.md')).each do |post|
  content = File.read(post, encoding: 'utf-8')
  match = content.match(/\A---\s*\n(.*?\n?)---\s*\n/m)
  next unless match
  begin
    frontmatter = YAML.safe_load(match[1], permitted_classes: [Date, Time])
  rescue => e
    next
  end
  next unless frontmatter && frontmatter['tags']
  Array(frontmatter['tags']).each do |tag|
    tag = tag.to_s.strip
    next if tag.empty?
    key = tag.downcase
    tag_map[key] ||= tag
  end
end

tags = tag_map.values

# Generate tag pages
FileUtils.mkdir_p(tag_dir)
tags.each do |tag|
  slug = tag.downcase.strip.gsub(/[^\w\s-]/, '').gsub(/[\s_]+/, '-').gsub(/-+/, '-')
  filename = File.join(tag_dir, "#{slug}.md")
  File.write(filename, "---\nlayout: tag\ntitle: \"Tag: #{tag}\"\ntag: #{tag}\npermalink: /tag/#{slug}/\n---\n")
end

puts "Generated #{tags.length} tag pages in pages/tag/"
