const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    console.log(response)
    console.log(response.data)
    console.log(response.data.results)
  })
  .catch((err) => console.log(err))