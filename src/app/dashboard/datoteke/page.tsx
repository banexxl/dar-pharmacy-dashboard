import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3 } from '@/utils/aws/aws-s3';
import ClientPage from './client-page';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let totalBucketSize = 0;
  let continuationToken: string | undefined;

  try {
    do {
      const data = await s3.send(new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        ContinuationToken: continuationToken,
      }));
      totalBucketSize += (data.Contents || []).reduce((sum, item) => sum + (item.Size || 0), 0);
      continuationToken = data.IsTruncated ? data.NextContinuationToken : undefined;
    } while (continuationToken);
  } catch {
    totalBucketSize = 0;
  }

  return <ClientPage totalBucketSize={totalBucketSize} />;
}
