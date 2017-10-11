import sendgrid from 'sendgrid';
import mongoose from 'mongoose';
import moment from 'moment';
import db from '../config/db';

db();

const helper = sendgrid.mail;
const sg = sendgrid(process.env.SENDGRID_API_KEY);
const User = mongoose.model('User');

export default () =>
  User
    .find({}, (err, users) => {
      if (users) {
        return users.map((user) => {
          const today = moment();
          const lastLoginDate = moment(user.last_login);
          const difference = lastLoginDate.diff(today, 'days');
          if (difference >= 7) {
            const { email } = user;
            const fromEmail = new helper.Email('matterhorn-cfh@andela.com');
            const toEmail = new helper.Email(email);
            const subject = `Hi ${user.name}, please fill this survey to help improve CFH`;
            const html = `
          <h3>Hi ${user.name}</h3>
          <p>We appreciate your interest in playing the Cards for Humanity games.</p>
          <p>Please fill this survey to help improve CFH. We appreciate your response and your answers will be anonymous.</p>
          <br />
          <p><a href="https://goo.gl/forms/Ru1Y37LlAsQ0aW3s2">Follow this link to fill the form</a></p>
          <p>Warm regards,</p>
          <p>Copyright &copy; 2017</p>
          `;
            const content = new helper.Content('text/html', html);
            const mail = new helper.Mail(fromEmail, subject, toEmail, content);
            const request = sg.emptyRequest({
              method: 'POST',
              path: '/v3/mail/send',
              body: mail.toJSON()
            });

            sg.API(request, () => {
            });
          }
          return true;
        });
      }
    });
