import { CronJob } from 'cron';
import sendFeedback from './sendFeedback';

export const sendFeedbackJob = () =>
  new CronJob({
    cronTime: '* * * * * *',
    onTick: sendFeedback,
    timeZone: 'Africa/Lagos',
    start: true
  });

if (require.main === module) {
  sendFeedbackJob();
}
export default {

};
