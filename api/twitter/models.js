// Model: a set of functions to read/write data of a certain GraphQL type by
// using various connectors. Models contain additional business logic, such as permission checks,
// and are usually application-specific.

//pass to context
import * as TwitConnector from './connector'


export default class Twitter {
  constructor(){
    // TODO put twitter keys into a constructor here
    this.name = "testing"
  }
  getTweet(id){
    return TwitConnector.getTweet(id)
  }
  getTweets(queryParams) {
    return TwitConnector.searchFor(queryParams).then(result => {
      return result.map(val => {
        var newobject = {
          id_str:val.id_str,
          // handle array of images in GraphQL schema
          // need to check if this is an actual image...
          imageURLs:val.entities.urls,
          // hashtags: val.entities.hashtags
        }
      return newobject
      })

    })
  }
}
