export async function subscribeToSNSTopic() {
     const response = await fetch('/api/aws/sns/subscribe', {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify({
               topicArn: process.env.AWS_SNS_TOPIC_ARN!,
               protocol: 'https',
               endpoint: '/api/aws/sns/notify', // Adjust with your endpoint
          }),
     });

     const data = await response.json();
     console.log(data);
}
