---
layout: base
permalink: /search.html
title: Search
---


<div class="region wrapper flow prose">
  <h1 class="gradient-text">Search</h1>
  <search id="search">
    <form role="search" action="https://duckduckgo.com" method="GET" id="form--search">
      <label for="search-for" class="hidden">Search for</label>
      <input id="search-for" type="search" name="q" placeholder="Search">
      <input type="hidden" name="sites" value="tarrant.org.uk">
      <button type="submit" class="button">Search</button>
    </form>
  </search>
</div>

<link href="/pagefind/pagefind-ui.css" rel="stylesheet">
<script src="/pagefind/pagefind-ui.js"></script>
<script>
  // window.addEventListener('DOMContentLoaded', (event) => {
  //   new PagefindUI({
  //     element: "search#search", 
  //     showSubResults: true,
  //     highlightParam: "highlight",
  //     autofocus: true
  //   });
  //   document.querySelector('form#form--search').classList.add('hidden')
  // });
</script>