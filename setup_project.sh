#!/bin/bash

mkdir -p assets/css assets/js assets/images
mkdir -p data markdown_posts posts templates

touch index.html projects.html articles.html about.html

touch assets/css/base.css
touch assets/css/layout.css
touch assets/css/components.css

touch assets/js/main.js
touch assets/js/projects.js
touch assets/js/articles.js

touch data/projects.json
touch data/articles.json

touch templates/article_template.html
touch build_blog.py

touch markdown_posts/.gitkeep
touch posts/.gitkeep

echo "Project structure created successfully."
