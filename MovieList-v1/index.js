// ***************************************************************************** Parameters
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const MOVIES_PER_PAGE = 12
const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// ***************************************************************************** Function
/*** 切割部分電影資料 ***/
function getMoviesByPage(page) {
  // 判斷要取 搜尋清單 或是 總電影清單
  const targetList = filteredMovies.length ? filteredMovies : movies

  // 計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  // 回傳切割後的新陣列
  return targetList.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

/*** 新增 收藏清單 ***/
function addToFavorite(id) {
  // 比對函式
  function matchIdFromList(movie) {
    return movie.id === id
  }

  // 從 local Storage 取得 收藏清單 資料
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  // 從 電影總清單 取出第 id 筆電影
  const movie = movies.find(matchIdFromList)

  // 錯誤處理 : 重複收藏
  if (list.some(matchIdFromList)) {
    return alert('此電影已經在收藏清單中！')
  }

  // 加入 收藏清單 並 更新 local Storage
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
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

/*** 取得 收藏id清單 ***/
function getFavoriteIdList() {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const idList = []
  list.forEach((movie) => {
    idList.push(movie.id)
  })
  return idList
}

/*** 更新 電影清單 畫面 ***/
function renderMovieList(data) {
  // 取得 收藏id清單
  const favoriteIdList = getFavoriteIdList()
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
      `
    // 判斷顯示 喜歡按鈕 或 加入按鈕
    if (favoriteIdList.some((favoriteId) => favoriteId === item.id)) {
      contentHTML += `<button class="btn btn-favorite" data-id="${item.id}" style="background-color:HotPink"><i class="far fa-heart fa-lg"></i></button>`
    } else {
      contentHTML += `<button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>`
    }

    contentHTML += `
              </div>
            </div>
          </div>
        </div>
      `
  })

  dataPanel.innerHTML = contentHTML
}

/*** 更新 分頁頁數 畫面 ***/
function renderPaginator(amount) {
  // 分頁數若為0, 不顯示分頁
  if (amount === 0) {
    paginator.innerHTML = ""
    return
  }

  // 計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  // 製作分頁
  let contentHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    contentHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = contentHTML
}

// ***************************************************************************** Event Listener
/***  監聽表單 提交 事件 ***/
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 終止元件的預設行為
  event.preventDefault()

  // 取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()

  // 條件篩選
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  // 錯誤處理 : 無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字 : ${keyword} 沒有符合條件的電影!`)
  }

  // 重新更新 分頁 與 電影清單 至畫面
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

/*** 監聽dataPanel 按下 事件 ***/
dataPanel.addEventListener('click', function onPanelClicked(event) {
  const target = event.target

  // 按鈕判斷 : .btn-show-movie, .btn-add-favorite, .btn-favorite
  if (target.matches('.btn-show-movie')) {
    // Modal 顯示
    showMovieModal(Number(target.dataset.id))
  } else if (target.matches('.btn-add-favorite')) {
    // 加到 local Storage 收藏清單
    addToFavorite(Number(target.dataset.id))

    // 刪除 加入按鈕 更改成 收藏按鈕
    const parent = target.parentElement
    target.remove()
    const favoriteBtn = `<button class="btn btn-favorite" data-id="${target.dataset.id}" style="background-color:HotPink"><i class="far fa-heart fa-lg"></i></button>`
    parent.innerHTML += favoriteBtn
  } else if (target.matches('.btn-favorite')) {
    // 從 收藏清單 移除 該筆電影
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movieIndex = list.findIndex((movie) => movie.id === Number(target.dataset.id))
    list.splice(movieIndex, 1)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))

    // 刪除 收藏按鈕 更改成 加入按鈕
    const parent = target.parentElement
    target.remove()
    const addBtn = `<button class="btn btn-info btn-add-favorite" data-id="${target.dataset.id}">+</button>`
    parent.innerHTML += addBtn
  }
})

/*** 監聽分頁 按鈕 事件  ***/
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 錯誤處理 : 如果被點擊的不是 a 標籤 則 跳出函式
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)

  // 暫存當下頁數至 local storage
  localStorage.setItem('homeCurrentPage', JSON.stringify(page))

  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

// 請求資料
axios
  .get(INDEX_URL)
  .then((response) => {
    // ... 為展開運算子
    movies.push(...response.data.results)

    // 初始更新畫面
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
    localStorage.setItem('homeCurrentPage', JSON.stringify(1))
  })
  .catch((err) => console.log(err))