import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css';

function Home() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageInfo, setPageInfo] = useState({});
  const [pageInsights, setPageInsights] = useState({});
  const appId = "471365855733301";
  const pageAccessToken = "EAAGstGpj5jUBOxZAqfGaALsZAqMqK6YsocTdVUL8lWoJQZBkHlmm4NXhpCVM6l5qeqbI07WVMC9DPRSWCZBxmsuZCXwMc6sBJwLF8I3ZAPtSYZANNpzPZCVv8eulRJE2UKare7kJf4ujjKdue87KvmOfVtG4INauDuhaK8TBxli6t0BEHMLqQwzgqHCZC6ryKmqJCwHGWvTsZD"; // Replace with your actual token

  useEffect(() => {
    if (appId) {
      const loadFbSdk = () => {
        window.fbAsyncInit = function () {
          if (window.FB) {
            window.FB.init({
              appId: appId,
              cookie: true,
              xfbml: true,
              version: 'v20.0',
            });

            window.FB.AppEvents.logPageView();
          }
        };

        if (!document.getElementById('facebook-jssdk')) {
          const js = document.createElement('script');
          js.id = 'facebook-jssdk';
          js.src = 'https://connect.facebook.net/en_US/sdk.js';
          document.body.appendChild(js);
        }
      };

      loadFbSdk();
    }
  }, [appId]);

  const checkLoginState = () => {
    window.FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        window.FB.api('/me', { fields: 'name,picture' }, (userData) => {
          setUser(userData);
          fetchPages();
        });
      }
    });
  };

  const fetchPages = () => {
    window.FB.api('/me/accounts', (response) => {
      setPages(response.data);
    });
  };

  const handleLogin = () => {
    if (window.FB) {
      window.FB.login(checkLoginState, { scope: 'public_profile,pages_show_list' });
    } else {
      console.error('Facebook SDK not loaded yet.');
    }
  };

  const handlePageSelection = (event) => {
    console.log("ppppppppppp",event)
    const pageId = event.target.value;
    if (pageId) {
      setSelectedPage(pageId);
      fetchPageInfo(pageId);
      fetchPageInsights(pageId);
    } else {
      setSelectedPage(null);
      setPageInfo({});
      setPageInsights({});
    }
  };

  const fetchPageInfo = (pageId) => {
    if (!pageId) return;

    axios.get(`https://graph.facebook.com/${pageId}`, {
      params: {
        access_token: pageAccessToken,
        fields: 'id,name,fan_count,followers_count'
      }
    })
    .then(response => {
      if (response.data) {
        setPageInfo(response.data);
      } else {
        console.error('No data returned from Facebook API:', response);
        setPageInfo({});
      }
    })
    .catch(error => {
      console.error('Error fetching page info:', error);
    });
  };

  const fetchPageInsights = (pageId) => {
    if (!pageId) return;

    const since = '2023-07-01'; 
    const until = '2024-07-31';
    const metrics = 'page_engaged_users,page_impressions';
    const period = 'day,week';

    axios.get(`https://graph.facebook.com/${pageId}/insights`, {
      params: {
        access_token: pageAccessToken,
        metric: metrics,
        since: since,
        until: until,
        period: period
      }
    })
    .then(response => {
      if (response.data && response.data.data) {
        const insights = {};
        response.data.data.forEach((item) => {
          insights[item.name] = item.values;
        });
        setPageInsights(insights);
        
      } else {
        console.error('No data returned from Facebook API:', response);
        setPageInsights({});
      }
    })
    .catch(error => {
      console.error('Error fetching page insights:', error);
    });
  };

  return (
    <div className="Home">
      <h1>Facebook Page Insights</h1>
      {!user && <button className="login-btn" onClick={handleLogin}>Login with Facebook</button>}
      {user && (
        <div className="user-info">
          <h2>Welcome, {user.name}</h2>
          <img className="profile-pic" src={user.picture.data.url} alt="Profile" />
          <div className="page-selection">
            <h3>Select a Page</h3>
            <select onChange={handlePageSelection}>
              <option value="">Select a page</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>
          </div>
         
          {selectedPage && (
            <div className="page-insights">
              <h3>Page Insights</h3>
              <div className="insight">
              <h4>Page ID</h4>
              <p>{pageInfo.id}</p>
              <h4>Page Name</h4>
                <p>{pageInfo.name}</p>
                <h4>Fans Likes</h4>
                <p>{pageInfo.fan_count}</p>
                <h4>Total Followers</h4>
                <p>{pageInfo.followers_count}</p>
                <h4>Total Engagement</h4>
                <p>{pageInsights.page_engaged_users ? pageInsights.page_engaged_users[0].value : 'N/A'}</p>
              </div>
              <div className="insight">
                <h4>Total Impressions</h4>
                <p>{pageInsights.page_impressions ? pageInsights.page_impressions[0].value : 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
