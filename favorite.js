const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))  //收藏清單

const dataPanel = document.querySelector('#data-panel')

// 放資料進網頁
function renderMovieList(data) {
  let contentHTML = ``

  data.forEach((item) => {
    contentHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                  data-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
              </div>
            </div>
          </div>
        </div>
      `
  })

  dataPanel.innerHTML = contentHTML
}

// Modal 顯示
function showMovieModal(id) {
  function matchIdFromList(movie) {
    return movie.id === id
  }
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  const targetMovie = movies.find(matchIdFromList)
  modalTitle.innerText = targetMovie.title
  modalDate.innerText = 'Release date: ' + targetMovie.release_date
  modalDescription.innerText = targetMovie.description
  modalImage.innerHTML = `<img src="${POSTER_URL + targetMovie.image}" alt="movie-poster" class="img-fluid">`
}

// 刪除 喜歡清單
function removeFromFavorite(id) {
  // 錯誤保護 : 若電影清單為空 則 跳出函式
  if (!movies) return

  // 透過 id 找到要刪除的電影 index
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  // 錯誤保護 : 若找不到符合電影 則 跳出函式
  if (movieIndex === -1) return

  // 刪除該筆電影
  movies.splice(movieIndex, 1)

  //存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  //更新頁面
  renderMovieList(movies)
}

// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)