export async function subscribeToSNSTopic(topicArn: string) {
     const endpoint = process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000/api/aws/sns/notify'
          : 'https://dar-pharmacy-dashboard.vercel.app/api/aws/sns/notify';

     const response = await fetch('/api/aws/sns/subscribe', {
          method: 'POST',
          headers: {
               'Content-Type': 'application/json',
          },
          body: JSON.stringify({
               topicArn: topicArn,
               protocol: process.env.NODE_ENV === 'development' ? 'http' : 'https',
               endpoint: endpoint,
          }),
     });

     const data = await response.json();
}
