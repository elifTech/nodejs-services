import mongoose from 'mongoose';
import { uniqueValidationByModel } from '../helpers/validators';

const modelName = 'Account';

const Schema = new mongoose.Schema({
  accountType: { type: String, default: 'system', enum: ['system', 'facebook', 'twitter', 'google', 'linkedin'] },

  // login fields
  username: {
    type: String,
    required: [true, 'Username field required'],
    validate: [{
      isAsync: true,
      validator: (value, cb) => uniqueValidationByModel(mongoose.model(modelName), { username: value }, cb),
      message: '{VALUE} with this {PATH} already exists'
    }, {
      validator: value => /^[a-z].*$/i.test(value),
      message: '{PATH} should start from letter [a-z]'
    }]
  },
  password: {
    type: String,
    required: [true, 'Password field required']
  },
  salt: String,

  // for external auth usage
  extUser: String,
  extToken: String,
  extTokenSecret: String,

  // activation
  activated: { type: Boolean, required: true, default: false },
  activationDate: Date,
  activationToken: String,

  // information
  email: String,
  mobileNumber: {
    type: String,
    match: [/^[1-9][0-9]{9}$/, 'The value of path {PATH} ({VALUE}) is not a valid mobile number.']
  },
  loginDate: Date, // last user login
  activityDate: Date, // last user activity

  // required by ResourceService
  removed: Date,
  createDate: { type: Date, required: true, default: Date.now },
  modifyDate: Date
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
Schema.method({
});

/**
 * Statics
 */
Schema.statics = {};

Schema.index({ username: 1 }, { unique: true });

/**
 * @typedef Account
 */
export default mongoose.model(modelName, Schema);
