import { SNS } from 'aws-sdk';

const sns = new SNS({
     region: 'eu-central-1',
     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
     secretAccessKey: process.env.AWS_S3_SECRET_KEY,
});

export async function sendNotification(recipientId: string, messageContent: string) {
     try {
          const topicArn = `arn:aws:sns:eu-central-1:056076663705:user-notifications-${recipientId}`;
          const notificationMessage = JSON.stringify({
               recipientId,
               message: messageContent,
          });

          const result = await sns
               .publish({
                    TopicArn: topicArn,
                    Message: notificationMessage,
               })
               .promise();

          console.log('Notification sent successfully:', result);
     } catch (error) {
          console.error('Failed to send notification:', error);
     }
}
