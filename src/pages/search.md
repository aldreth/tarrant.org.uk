---
layout: base
permalink: /search.html
title: Search
---


<div class="region wrapper flow prose">
  <h1 class="gradient-text">Search</h1>
  <div id="search"></div>
</div>

<link href="/pagefind/pagefind-ui.css" rel="stylesheet">
<script src="/pagefind/pagefind-ui.js"></script>
<script>
    window.addEventListener('DOMContentLoaded', (event) => {
        new PagefindUI({
            element: "#search", 
            showSubResults: true,
            highlightParam: "highlight"
        });
    });
</script>