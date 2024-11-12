import { sns } from '@/pages/api/aws/sns/subscribe';

export async function sendNotification(topicArn: string, messageContent: string) {
     try {
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
