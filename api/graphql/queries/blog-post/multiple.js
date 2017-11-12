// not in use

import {GraphQLList} from 'graphql';

import blogPostType from '../../types/blog-post';
import getProjection from '../../get-projection';
import modelPost from '../../../models/post';

export default {
  type: new GraphQLList(blogPostType),
  args: {},
  resolve (root, params, options) {
    const projection = getProjection(options.fieldASTs[0]);
    return modelPost
      .find()
      .select(projection)
      .exec();
  }
};
