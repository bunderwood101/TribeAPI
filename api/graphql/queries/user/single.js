import {
  GraphQLList,
  GraphQLID,
  GraphQLNonNull
} from 'graphql';
import {Types} from 'mongoose';

import userType from '../../types/user';
import getProjection from '../../get-projection';
import modelUser from '../../../models/user';

export default {
  type: userType,
  args: {
    id: {
      name: '_id',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve (root, params, options) {
    const projection = getProjection(options.fieldASTs[0]);
    return modelUser
      .findById(params.id)
      .select(projection)
      // .exclude('password')
      .exec();
  }
};
