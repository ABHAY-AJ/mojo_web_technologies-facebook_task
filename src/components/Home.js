import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css';

function Home() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageInsights, setPageInsights] = useState({});
  const appId = "832338718493341";

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
    const pageId = event.target.value;
    if (pageId) {
      setSelectedPage(pageId);
      fetchPageInsights(pageId);
    } else {
      setSelectedPage(null);
      setPageInsights({});
    }
  };

  const fetchPageInsights = (pageId) => {
    if (!pageId) return;
  
    const since = Math.floor(new Date().getTime() / 1000) - 86400 * 30; // 30 days ago
    const until = Math.floor(new Date().getTime() / 1000); // now
    const metricString = "page_fans,page_engaged_users,page_impressions,page_actions_post_reactions_total"; // Replace with desired metrics
  
    window.FB.api(
      `/${pageId}/insights?metric=${metricString}&since=${since}&until=${until}&period=day`, // Adjust period if needed
      (response) => {
        if (response && response.data) {
          const insights = {};
          response.data.forEach((item) => {
            insights[item.name] = item.values;
          });
          setPageInsights(insights);
        } else {
          console.error('No data returned from Facebook API:', response);
          setPageInsights({});
        }
      }
    );
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
                <h4>Total Followers/Fans</h4>
                <p>{pageInsights.page_fans ? pageInsights.page_fans[0].value : 'N/A'}</p>
              </div>
              <div className="insight">
                <h4>Total Engagement</h4>
                <p>{pageInsights.page_engaged_users ? pageInsights.page_engaged_users[0].value : 'N/A'}</p>
              </div>
              <div className="insight">
                <h4>Total Impressions</h4>
                <p>{pageInsights.page_impressions ? pageInsights.page_impressions[0].value : 'N/A'}</p>
              </div>
              <div className="insight">
                <h4>Total Reactions</h4>
                <p>{pageInsights.page_actions_post_reactions_total ? pageInsights.page_actions_post_reactions_total[0].value : 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
