// Provides tweet URL's for front-end to render using Twiter for websites oEmbed
// see https://dev.twitter.com/web/embedded-tweets
import _ from 'lodash'
import Twit from 'twit'


// Destructuring assignment syntax
const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = process.env

// Twit throws a runtime error if you try to create a client
// without API keys, so we do it lazily
let twitterClient = undefined
const getTwitterClient = () => {
  if (!twitterClient) {
    twitterClient = new Twit ({
      consumer_key : TWITTER_CONSUMER_KEY,
      consumer_secret : TWITTER_CONSUMER_SECRET,
      app_only_auth : true
    })
  }
  return twitterClient
}

export const getTweet = (id) => __getPromise('statuses/show', id);
export const searchFor = (queryParams) => __getPromise("search/tweets", {q:queryParams.searchArgs, count:queryParams.count}, 'statuses');

const __getPromise = (endpoint, parameters, resultPath = null) => {
  
  return new Promise((resolve, reject) => {

    getTwitterClient().get(
      endpoint,
      parameters,
      (error, result) => {

        if (error) {
          reject(error);
        }
        else {
          resolve( resultPath !== null ? _.get(result, resultPath) : result );
        }
      }
    )
  });
};
