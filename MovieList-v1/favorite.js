// ***************************************************************************** Parameters
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))  // 收藏清單
const MOVIES_PER_PAGE = 12
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('#paginator')

// ***************************************************************************** Function
/*** 切割部分電影資料 ***/
function getMoviesByPage(page) {

  // 計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  // 回傳切割後的新陣列
  return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

/*** 更新 分頁頁數 畫面 ***/
function renderPaginator(amount) {
  // 分頁數若為0, 不顯示分頁
  if (amount === 0) {
    paginator.innerHTML = ""
    return
  }

  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  //製作分頁 
  let contentHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    contentHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = contentHTML
}

/*** 更新 電影清單 畫面 ***/
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

/***  Modal 顯示 ***/
function showMovieModal(id) {
  // 比對函式
  function matchIdFromList(movie) {
    return movie.id === id
  }

  // Modal DOM 元素
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // 從 電影總清單 取出第 id 筆電影
  const targetMovie = movies.find(matchIdFromList)

  // 設定 顯示資訊
  modalTitle.innerText = targetMovie.title
  modalDate.innerText = 'Release date: ' + targetMovie.release_date
  modalDescription.innerText = targetMovie.description
  modalImage.innerHTML = `<img src="${POSTER_URL + targetMovie.image}" alt="movie-poster" class="img-fluid">`
}

/***  刪除 收藏清單 ***/
function removeFromFavorite(id) {
  // 錯誤保護 : 若電影清單為空 則 跳出函式
  if (!movies) return

  // 透過 id 找到要刪除的電影 index
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  // 錯誤保護 : 若找不到符合電影 則 跳出函式
  if (movieIndex === -1) return

  // 刪除該筆電影
  movies.splice(movieIndex, 1)

  // 存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  // 確認刪除停留頁面
  const currentPage = JSON.parse(localStorage.getItem('favoriteCurrentPage'))
  const totalPage = Math.ceil(movies.length / MOVIES_PER_PAGE)
  let page = currentPage
  if (totalPage < currentPage) {
    page = totalPage
    localStorage.setItem('favoriteCurrentPage', JSON.stringify(page))
  }

  //更新頁面
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(page))
}

// ***************************************************************************** Event Listener
/*** 監聽分頁 按鈕 事件  ***/
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 錯誤處理 : 如果被點擊的不是 a 標籤 則 跳出函式
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)

  // 暫存當下頁數至 local storage
  localStorage.setItem('favoriteCurrentPage', JSON.stringify(page))

  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

/*** 監聽dataPanel 按下 事件 ***/
dataPanel.addEventListener('click', function onPanelClicked(event) {
  const target = event.target

  // 按鈕判斷 : .btn-show-movie, .btn-remove-favorite
  if (event.target.matches('.btn-show-movie')) {
    // Modal 顯示
    showMovieModal(Number(target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    // 刪除 收藏清單
    removeFromFavorite(Number(target.dataset.id))
  }
})

// 初始更新畫面
renderPaginator(movies.length)
renderMovieList(getMoviesByPage(1))
localStorage.setItem('favoriteCurrentPage', JSON.stringify(1))