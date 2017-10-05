/**
 * Module dependencies.
 */
import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
const Notification = mongoose.model('Notification');
/* eslint-disable no-underscore-dangle */

export const addNotification = (req, res) => {
  const { friendList, message, link } = req.body;
  const userId = req.decoded.user;
  const list = friendList.map(id => ({
    to: id,
    from: userId,
    message,
    link,
    read: 0
  }));

  Notification.create(list)
    .then(() => {
      res.status(200).send({
        message: 'Notification has been sent'
      });
    })
    .catch(() => {
      res.status(500).send({
        message: 'Internal Server Error'
      });
    });
};

export const loadNotification = (req, res) => {
  const userId = req.decoded.user;

  Notification.find({
    to: userId,
    read: 0
  })
    .then((data) => {
      res.status(200).send({
        notifications: data,
        message: 'Notifications loaded successfully'
      });
    })
    .catch(() => {
      res.status(500).send({
        message: 'Internal Server Error'
      });
    });
};

export const readNotification = (req, res) => {
  const { id } = req.params;
  Notification.findOneAndUpdate(
    {
      _id: id
    },
    { $set: { read: 1 } }
  )
    .then(() => {
      res.status(200).send({
        message: 'Notification read successfully'
      });
    })
    .catch(() => {
      res.status(500).send({
        message: 'Internal Server Error'
      });
    });
};
