export const schema = [`
  type Tweet{
    # ID of the tweet in string format
    id_str: String

    # Array of Hashtags attached to the tweet
    hashtags: [Hashtag]

    # URL of the image attached to the tweet
    imageURLs: [imageURL]
  }
  type Tweets{
    tweets:[Tweet]
  }

  type Hashtag{
    text: String
  }

  type imageURL{
    url: String
  }
`]

export const resolvers = {
  // Tweet:{
  //  use default resolver
  // },
  // Hashtag:{
  // use default resolver
  // },
  RootQuery:{
    tweet(root, id, context) {
      return context.Twitter.getTweet(id, context)
    },
    tweets(root, {searchArgs, count}, context) {
      return context.Twitter.getTweets({searchArgs, count}, context)
    }
  }
}
