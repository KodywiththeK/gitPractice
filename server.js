var express = require('express')
var cors = require('cors')
const axios = require('axios')
var bodyParser = require('body-parser')

const CLIENT_ID = '315c0c3843f1ae654924'
const CLIENT_SECRET = '51612492fe3ab93b9d023ec13d49c06aa260229b'

var app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/getAccessToken', async function (req, res) {
  try {
    console.log(req.query.code)

    const params = '?client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&code=' + req.query.code

    const response = await axios.post(
      'https://github.com/login/oauth/access_token' + params,
      {},
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )

    const data = response.data
    console.log(data)
    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
})

//get user Data
app.get('/getUserData', async function (req, res) {
  const authHeader = req.get('Authorization')
  let userName = ''
  const userData = await axios
    .get('https://api.github.com/user', {
      headers: {
        Authorization: authHeader,
      },
    })
    .then((response) => {
      return response.data
    })
    .then((data) => {
      console.log(data)
      userName = data.login
      return data
    })

  const contributionData = await axios
    .get(`https://api.github.com/users/${userName}/events`, {
      headers: {
        Authorization: authHeader,
      },
    })
    .then((response) => {
      return response.data
    })

  const responseData = {
    userData: userData,
    contributionData: contributionData,
  }

  console.log(responseData)
  res.json(responseData)
})

app.listen(4000, function () {
  console.log('CORS server running on port 4000')
})
