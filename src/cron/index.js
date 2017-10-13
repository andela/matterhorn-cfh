import { CronJob } from 'cron';
import sendFeedback from './sendFeedback';

export const sendFeedbackJob = () =>
  new CronJob({
    cronTime: '00 00 08 * * *',
    onTick: sendFeedback,
    timeZone: 'Africa/Lagos',
    start: true
  });

sendFeedbackJob();

export default {};
