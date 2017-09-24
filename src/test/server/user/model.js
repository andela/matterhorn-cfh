/**
 * Module dependencies.
 */
import should from 'should';
import mongoose from 'mongoose';
import chai from 'chai';

import app from '../../../server';

const User = mongoose.model('User');

// Globals
let user;

// The tests
describe('<Unit Test>', () => {
  describe('Model User:', () => {
    before((done) => {
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password'
      });

      done();
    });

    describe('Method Save', () => {
      it(
        'should be able to save whithout problems',
        done => user.save((err) => {
          should.not.exist(err);
          done();
        })
      );

      it(
        'should be able to show an error when try to save witout name',
        (done) => {
          user.name = '';
          return user.save((err) => {
            should.exist(err);
            done();
          });
        }
      );
    });

    describe('POST /api/auth/signin', () => {
      it('it responds with 401 status code if bad username or password', (done) => {
        chai
          .request(app)
          .post('/api/auth/signin')
          .set('Accept', 'application/x-www-form-urlencoded')
          .send({
            email: 'chujggggg@yahoo.com',
            password: 'hkjkljklklk'
          })
          .end((err, res) => {
            expect(401);
            done();
          });
      });
    });


    after((done) => {
      done();
    });
  });
});
