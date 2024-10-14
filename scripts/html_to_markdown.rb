require 'kramdown'

files = Dir.glob("./_posts/*.md")
files.concat ['./about/index.md', './contact/index.md']

files.each do |file|
  file_contents = File.read(file)

  matches = file_contents.match(/\A---(.|\n)*?---/)
  yaml = matches[0]

  html = file_contents.gsub(/\A---(.|\n)*?---/, '')

  md = Kramdown::Document.new(html, html_to_native: true).to_kramdown

  doc = yaml + + "\n\n" + md

  File.write(file, doc)
end
