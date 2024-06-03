const API_KEY = '44190966-0aa6bbea47325323a5628291c'; // Cheia API furnizată
const BASE_URL = 'https://pixabay.com/api/';
let currentPage = 1;
let currentQuery = '';
const perPage = 40;

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
let lightbox;

searchForm.addEventListener('submit', onSearch);
loadMoreButton.addEventListener('click', loadMoreImages);

function onSearch(event) {
  event.preventDefault();
  currentQuery = event.currentTarget.elements.searchQuery.value.trim();
  if (currentQuery === '') {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }
  currentPage = 1;
  gallery.innerHTML = '';
  loadMoreButton.style.display = 'none';
  fetchImages(currentQuery, currentPage);
}

function fetchImages(query, page) {
  const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(
    query
  )}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  console.log('Fetching images with URL:', url); // Adaugă acest log

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Received data:', data); // Adaugă acest log

      if (data.hits.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      renderImages(data.hits);
      if (!lightbox) {
        lightbox = new SimpleLightbox('.gallery a', {
          captionsData: 'alt',
          captionDelay: 250,
        });
      } else {
        lightbox.refresh();
      }
      if (data.totalHits > perPage * currentPage) {
        loadMoreButton.style.display = 'block';
      }
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    })
    .catch(error => {
      console.error('Error fetching images:', error);
      Notiflix.Notify.failure(
        'An error occurred while fetching images. Please try again.'
      );
    });
}

function renderImages(images) {
  const markup = images
    .map(image => {
      return `
      <div class="photo-card">
        <a href="${image.largeImageURL}">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes</b>: ${image.likes}</p>
          <p class="info-item"><b>Views</b>: ${image.views}</p>
          <p class="info-item"><b>Comments</b>: ${image.comments}</p>
          <p class="info-item"><b>Downloads</b>: ${image.downloads}</p>
        </div>
      </div>
    `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

function loadMoreImages() {
  currentPage += 1;
  fetchImages(currentQuery, currentPage);
  setTimeout(() => {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }, 500);
}
