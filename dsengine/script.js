const RESULTS_PER_PAGE = 5;
let currentPage = 1;
let currentQuery = '';
let allData = [];
let filteredData = [];

const input = document.getElementById('searchInput');
const resultsContainer = document.getElementById('results');
const loadingIndicator = document.getElementById('loading');

function fetchData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          title: "Google",
          url: "https://www.google.com",
          description: "The world's most popular search engine",
          tags: ["search", "internet", "web"]
        },
        {
          title: "YouTube",
          url: "https://www.youtube.com",
          description: "Video sharing and streaming platform",
          tags: ["video", "stream", "media"]
        },
        {
          title: "Wikipedia",
          url: "https://www.wikipedia.org",
          description: "Free encyclopedia that anyone can edit",
          tags: ["encyclopedia", "knowledge", "free"]
        },
        {
          title: "GitHub",
          url: "https://github.com",
          description: "Platform for hosting and collaborating on code",
          tags: ["code", "repository", "git"]
        },
        {
          title: "Stack Overflow",
          url: "https://stackoverflow.com",
          description: "Community-driven Q&A for programmers",
          tags: ["programming", "questions", "answers", "code"]
        },
        {
          title: "Mozilla Developer Network",
          url: "https://developer.mozilla.org",
          description: "Resources for developers, by developers",
          tags: ["developer", "web", "resources", "code"]
        },
        {
          title: "FreeCodeCamp",
          url: "https://www.freecodecamp.org",
          description: "Learn to code for free with tutorials and projects",
          tags: ["learn", "coding", "free"]
        },
        {
          title: "Hacker News",
          url: "https://news.ycombinator.com",
          description: "Tech and startup news aggregator",
          tags: ["tech", "startups", "news"]
        },
        {
          title: "Reddit",
          url: "https://www.reddit.com",
          description: "Social news aggregation and discussion platform",
          tags: ["social", "news", "community"]
        },
        // Add more data for infinite scroll demo
        {
          title: "Twitter",
          url: "https://twitter.com",
          description: "Microblogging and social networking service",
          tags: ["social", "microblogging", "tweets"]
        },
        {
          title: "LinkedIn",
          url: "https://linkedin.com",
          description: "Professional networking and career development",
          tags: ["career", "network", "professional"]
        },
        {
          title: "Amazon",
          url: "https://amazon.com",
          description: "E-commerce and cloud computing giant",
          tags: ["shopping", "cloud", "retail"]
        },
        {
          title: "Netflix",
          url: "https://netflix.com",
          description: "Subscription-based streaming service for movies and TV shows",
          tags: ["streaming", "movies", "entertainment"]
        },
        {
          title: "Spotify",
          url: "https://spotify.com",
          description: "Music streaming platform with millions of tracks",
          tags: ["music", "streaming", "audio"]
        },
        {
          title: "Medium",
          url: "https://medium.com",
          description: "Online publishing platform for articles and stories",
          tags: ["writing", "articles", "blogging"]
        }
      ]);
    }, 1);
  });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(escapeRegExp(query), 'gi');
  return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i-1).toLowerCase() === a.charAt(j-1).toLowerCase()) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1,
          matrix[i][j-1] + 1,
          matrix[i-1][j-1] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
function rankItem(item, query) {
  const fields = [item.title, item.description, ...item.tags];
  let minDistance = Infinity;
  let containsExact = false;
  const q = query.toLowerCase();
  for (const field of fields) {
    const f = field.toLowerCase();
    if (f.includes(q)) {
      containsExact = true;
      minDistance = 0;
      break;
    }
    const dist = levenshteinDistance(f, q);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  let score = minDistance + (containsExact ? 0 : 3);
  return score;
}
function renderPage(page) {
  const start = (page - 1) * RESULTS_PER_PAGE;
  const end = start + RESULTS_PER_PAGE;
  const pageItems = filteredData.slice(start, end);
  pageItems.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.url;
    a.target = '_blank';
    a.innerHTML = highlightMatch(item.title, currentQuery);
    li.appendChild(a);
    const desc = document.createElement('p');
    desc.innerHTML = highlightMatch(item.description, currentQuery);
    li.appendChild(desc);
    resultsContainer.appendChild(li);
  });
}
function clearResults() {
  resultsContainer.innerHTML = '';
}
function searchAndRender(query) {
  currentQuery = query.trim();
  currentPage = 1;
  clearResults();
  if (currentQuery === '') {
    resultsContainer.innerHTML = '<li class="no-results">Type something to search...</li>';
    return;
  }

  // Filter and rank
  filteredData = allData
    .map(item => ({ item, score: rankItem(item, currentQuery) }))
    .filter(x => x.score < 10) // Threshold for fuzzy match
    .sort((a, b) => a.score - b.score)
    .map(x => x.item);

  if (filteredData.length === 0) {
    resultsContainer.innerHTML = '<li class="no-results">No results found</li>';
    return;
  }

  renderPage(currentPage);
}

// Infinite scroll handler
function onScroll() {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
    // Near bottom, load next page if available
    if (currentQuery === '' || filteredData.length === 0) return;

    const maxPage = Math.ceil(filteredData.length / RESULTS_PER_PAGE);
    if (currentPage < maxPage) {
      loadingIndicator.style.display = 'block';
      setTimeout(() => {
        currentPage++;
        renderPage(currentPage);
        loadingIndicator.style.display = 'none';
      }, 400); // simulate load delay
    }
  }
}

// Initialization: fetch data then enable search
async function init() {
  loadingIndicator.style.display = 'block';
  allData = await fetchData();
  loadingIndicator.style.display = 'none';
  resultsContainer.innerHTML = '<li class="no-results">Type something to search...</li>';
}

// Debounce to reduce search calls while typing
let debounceTimeout = null;
input.addEventListener('input', e => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    searchAndRender(e.target.value);
  }, 300);
});

window.addEventListener('scroll', onScroll);

init();

