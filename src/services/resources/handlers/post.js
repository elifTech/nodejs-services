import _ from 'lodash';
import async from 'async';
import mongoose from 'mongoose';
import winston from 'winston';
import httpStatus from 'http-status';
import { getJsonFields, deepPick } from '../helpers';

export default
function postHandler(service, model, fields, schemaFields, req, res, cb) {
  res.set('x-service', 'resources');

  const eventName = `db.${req.params.resource}.insert`;

  async.auto({
    hooks: next => service.runHook(eventName, req, next),
    prepareModel: ['hooks', ({ hooks }, next) => {
      const bodyFields = getJsonFields(req.body);
      const wildcardFields = _.map(_.filter(schemaFields, item => item.indexOf('.*') !== -1), item => item.replace('.*', ''));
      const mixedFields = _.filter(bodyFields, item => !!_.find(wildcardFields, field => item.indexOf(`${field}.`) === 0));
      const updateFields = _.without(_.intersection(schemaFields, bodyFields), '__v').concat(mixedFields);

      let body = deepPick(req.body, updateFields);
      const mixedBody = _.pick(req.body, wildcardFields);

      body._id = mongoose.Types.ObjectId(); // eslint-disable-line new-cap
      body = _.assign(body, mixedBody);
      body = _.pickBy(body, item => item !== null);

      const resource = new model(body); // eslint-disable-line new-cap
      _.each(mixedFields, field => resource.markModified(field));

      next(null, resource); // eslint-disable-line new-cap
    }],
    validate: ['prepareModel', ({ prepareModel }, next) => {
      prepareModel.validate((err) => {
        if (!err) {
          return next();
        }
        const result = {};

        Object.keys(err.errors).forEach(path => (result[path] = err.errors[path].message));

        return res
          .status(httpStatus.UNPROCESSABLE_ENTITY)
          .json(result);
      });
    }],
    save: ['validate', 'prepareModel', ({ prepareModel }, next) => {
      prepareModel.save({ validateBeforeSave: false }, (err, savedItem) => {
        if (err) {
          return next(err);
        }
        return next(null, savedItem);
      });
    }]
  }, (err, { save }) => {
    if (err) {
      return cb(err);
    }

    winston.info(`Resource "${req.params.resource}" created.`, { resourceId: save._id.toString(), collectionName: req.params.resource });

    service.events.emit('events', eventName, { _id: save._id.toString() });

    return res.status(httpStatus.CREATED).json({ _id: save._id });
  });
}
