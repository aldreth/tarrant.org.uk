files_with_images = []

files = Dir.glob("./_posts/*.md")
files.concat ['./about/index.md', './contact/index.md']

files.each do |file|
  file_contents = File.read(file)
  files_with_images.push(file) if file_contents.match(/<img .* src=/) || file_contents.match(/<wpg2>/)
end

File.write("./scripts/files_with_images.txt", files_with_images.join("\n"))
