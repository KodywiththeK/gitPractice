import React from 'react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import './App.css'
import { useEffect, useState } from 'react'

const CLIENT_ID = '315c0c3843f1ae654924'

function App() {
  const [rerender, setRerender] = useState(false)
  const [userData, setUserData] = useState({})
  const [contributionData, setContributionData] = useState([])

  useEffect(() => {
    // http://localhost:3000/?code=51393845dc661854cd17
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const codeParams = urlParams.get('code')
    console.log(codeParams)

    if (codeParams && localStorage.getItem('accessToken') === null) {
      async function getAccessToken() {
        await fetch('http://localhost:4000/getAccessToken?code=' + codeParams, {
          method: 'GET',
        })
          .then((response) => {
            return response.json()
          })
          .then((data) => {
            console.log(data)
            if (data.access_token) {
              localStorage.setItem('accessToken', data.access_token)
              setRerender(!rerender)
            }
          })
      }
      getAccessToken()
    }
  }, [])

  async function getUserData() {
    await fetch('http://localhost:4000/getUserData', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
      },
    })
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        console.log(data)
        setUserData(data.userData)
        setContributionData(
          data.contributionData
            .filter((event) => event.type === 'PushEvent')
            .map((event) => ({
              date: event.created_at.substring(0, 10),
              count: event.payload.size,
            }))
        )
      })
      .then(() => {
        console.log(userData)
        console.log(contributionData)
      })
  }

  // calendar Data
  let values = []
  const colorScale = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39']
  // contributionData.forEach((x) => {
  //   if (!values.map((i) => i.date).includes(x)) {
  //     values.push({ date: x, count: 0 })
  //   } else {
  //     let found = values.find((i) => i.date === x)
  //     found.count++
  //   }
  // })

  function loginWithGithub() {
    window.location.assign('https://github.com/login/oauth/authorize?client_id=' + CLIENT_ID)
  }

  return (
    <div className="App">
      <header className="App-header">
        {localStorage.getItem('accessToken') ? (
          <>
            <h1> User has Logged in</h1>
            <button
              onClick={() => {
                localStorage.removeItem('accessToken')
                setRerender(!rerender)
              }}
            >
              Log out
            </button>
            <h3>Get User Data from Github API</h3>
            <button onClick={getUserData}> Get Data</button>
            {Object.keys(userData).length !== 0 ? (
              <>
                <h5>{`ID: ${userData.login}`}</h5>
                <h5>{`NAME: ${userData.name}`}</h5>
                <div>
                  <h4>My Commit Calendar</h4>
                  <CalendarHeatmap values={contributionData} colorScale={colorScale} />
                </div>
              </>
            ) : (
              <>
                <h4>user 정보가 없습니다.</h4>
              </>
            )}
          </>
        ) : (
          <>
            <h3>User is not logged in</h3>
            <button onClick={loginWithGithub}>Login with Github</button>
          </>
        )}
      </header>
    </div>
  )
}

export default App
