import { sns } from '@/pages/api/aws/sns/subscribe';

export async function sendNotification(topicArn: string, messageContent: string) {
     try {
          console.log('process.env.AWS_S3_ACCESS_KEY', process.env.AWS_S3_ACCESS_KEY);
          console.log('process.env.AWS_S3_SECRET_KEY', process.env.AWS_S3_SECRET_KEY);

          const result = await sns
               .publish({
                    TopicArn: topicArn,
                    Message: messageContent,
               })
               .promise();

          console.log('Notification sent successfully:', result);
          return result;
     } catch (error) {
          console.error('Failed to send notification:', error);
          throw error;
     }
}
