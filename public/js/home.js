$(document).ready(() => {
  $.get("/api/posts", results => {
    console.log(results);
    outputPosts(results, $(".postsContainer"))
  })
})

function outputPosts(results, container) {
  container.html("");
  results.forEach(result => {
    const html = createPostHtml(result);
    container.append(html);
  })
  if (results.length == 0) {
    container.append("<span class='noResults>Nichts zu berichten</span>");
  }
}