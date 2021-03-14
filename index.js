const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const MOVIES_PER_PAGE = 12
const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

// 切割部分電影資料
function getMoviesByPage(page) {
  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  //回傳切割後的新陣列
  return movies.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 終止元件的預設行為
  event.preventDefault()

  // 取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  console.log(keyword)
  // 錯誤處理：輸入無效字串
  if (!keyword.length) {
    return alert('請輸入有效字串')
  }

  // 儲存符合篩選標準的電影
  let filterMovies = []

  // 條件篩選
  filterMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  // 錯誤處理 : 無符合條件的結果
  if (filterMovies.length === 0) {
    return alert(`您輸入的關鍵字 : ${keyword} 沒有符合條件的電影!`)
  }

  // 重新更新至畫面
  renderMovieList(filterMovies)
})

// 新增喜歡清單
function addToFavorite(id) {
  function matchIdFromList(movie) {
    return movie.id === id
  }
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(matchIdFromList)

  if (list.some(matchIdFromList)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
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

// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

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
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
      `
  })

  dataPanel.innerHTML = contentHTML
}

// 更新頁數畫面
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  //製作 template 
  let contentHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    contentHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  //放回 HTML
  paginator.innerHTML = contentHTML
}

// 請求資料
axios
  .get(INDEX_URL)
  .then((response) => {
    // ... 為展開運算子
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(3))
  })
  .catch((err) => console.log(err))