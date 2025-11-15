document.addEventListener('DOMContentLoaded', () => {
  const articleBody = document.querySelector('.rte, .article-content, .blog-post-content');
  if (!articleBody) return;

  let html = articleBody.innerHTML;

  // Replace [image]...[/image]
  html = html.replace(/\[image\](.*?)\[\/image\]/g, (match, url) => {
    return `<img src="${url.trim()}" class="article-image" alt="Article image">`;
  });

  // Replace [audio]...[/audio]
  html = html.replace(/\[audio\](.*?)\[\/audio\]/g, (match, url) => {
    return `
      <audio controls class="article-audio">
        <source src="${url.trim()}" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>`;
  });

  // Replace [video]...[/video]
  html = html.replace(/\[video\](.*?)\[\/video\]/g, (match, url) => {
    return `
      <div class="article-video">
        <iframe src="${url.trim()}" frameborder="0" allowfullscreen></iframe>
      </div>`;
  });

  articleBody.innerHTML = html;
});
document.addEventListener('DOMContentLoaded', () => {
  const articleBody = document.querySelector('.rte, .article-content, .blog-post-content');
  if (!articleBody) return;

  let html = articleBody.innerHTML;

  // Replace [image]...[/image]
  html = html.replace(/\[image\](.*?)\[\/image\]/g, (match, url) => {
    return `<img src="${url.trim()}" class="article-image" alt="Article image">`;
  });

  // Replace [audio]...[/audio]
  html = html.replace(/\[audio\](.*?)\[\/audio\]/g, (match, url) => {
    return `
      <audio controls class="article-audio">
        <source src="${url.trim()}" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>`;
  });

  // Replace [video]...[/video]
  html = html.replace(/\[video\](.*?)\[\/video\]/g, (match, url) => {
    return `
      <div class="article-video">
        <iframe src="${url.trim()}" frameborder="0" allowfullscreen></iframe>
      </div>`;
  });

  articleBody.innerHTML = html;
});
