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

// 切割部分電影資料
function getMoviesByPage(page) {
  // 判斷要取搜尋清單 或是 總電影清單
  const targetList = filteredMovies.length ? filteredMovies : movies

  //計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  //回傳切割後的新陣列
  return targetList.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 監聽表單提交事件
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

  // 重新更新至畫面
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
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

// favorite Button


// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  const target = event.target
  if (target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (target.matches('.btn-add-favorite')) {
    // 加到 local Storage 收藏清單
    addToFavorite(Number(target.dataset.id))

    // 更改成 收藏按鈕
    const parent = target.parentElement
    target.remove()
    const favoriteBtn = `<button class="btn btn-add-favorite" data-id="${target.dataset.id}" style="background-color:HotPink"><i class="far fa-heart fa-lg"></i></button>`
    parent.innerHTML += favoriteBtn
  }
})

function getFavoriteIdList() {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const idList = []
  list.forEach((movie) => {
    idList.push(movie.id)
  })
  return idList
}

// 放資料進網頁
function renderMovieList(data) {
  const favoriteIdList = getFavoriteIdList()
  console.log(favoriteIdList)
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

// 更新分頁頁數畫面
function renderPaginator(amount) {
  // 分頁數若為0, 不顯示分頁
  if (amount === 0) {
    paginator.innerHTML = ""
    return
  }

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

// 分頁事件監聽
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤 則 跳出函式
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
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
    localStorage.setItem('homeCurrentPage', JSON.stringify(1))
  })
  .catch((err) => console.log(err))