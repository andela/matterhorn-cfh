/**
 * Module dependencies.
 */
import should from 'should';
import mongoose from 'mongoose';
import User from './../../../app/models/user';

mongoose.connect(
  'mongodb://localhost/crudwithredux',
  { useMongoClient: true, promiseLibrary: global.Promise },
  () => ('Connected to mongodb.'),
);

mongoose.Promise = global.Promise;


// const User = mongoose.model('User');

// Globals
let user;

// The tests
describe('<Unit Test>', () => {
  describe('Model User:', () => {
    user = new User({
      name: 'Full name',
      email: 'test@test.com',
      username: 'user',
      password: 'password'
    });

    describe('Method Save', () => {
      it(
        'should be able to save without problems',
        (done) => {
          user.save()
            .then((saved) => {
              should.exist(saved);
              done();
            });
        }
      );

      it(
        'should be able to show an error when try to save witout name',
        (done) => {
          user.name = '';
          user.save()
            .catch((err) => {
              should.exist(err);
              done();
            });
        }
      );
    });


    after((done) => {
      done();
    });
  });
});
