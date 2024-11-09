export async function subscribeToSNSTopic(topicArn: string) {

     const response = await fetch('/api/aws/sns/subscribe', {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify({
               topicArn: topicArn,
               protocol: 'https',
               endpoint: 'https://dar-pharmacy-dashboard.vercel.app/api/aws/sns/notify',
          }),
     });

     const data = await response.json();
}
