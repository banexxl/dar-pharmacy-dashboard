import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     if (req.method === 'POST') {
          try {
               const accessToken = process.env.GITHUB_TOKEN;
               const username = process.env.GITHUB_USERNAME;
               const repo = process.env.GITHUB_REPO_NAME;
               const branch = 'main';

               // Replace with your logic to create a dummy commit
               const commitMessage = 'Dummy commit created by app';
               const changes = [{ path: 'rebuild-triggered.txt', content: new Date().toDateString() }];

               const createTreeEndpoint = `https://api.github.com/repos/${username}/${repo}/git/trees`;
               const createCommitEndpoint = `https://api.github.com/repos/${username}/${repo}/git/commits`;

               const getTreeResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/git/trees/main`, {
                    method: 'GET',
                    headers: {
                         Authorization: `token ${accessToken}`,
                    },
               });

               const treeData = await getTreeResponse.json();

               const tree = treeData.tree.map((file: any) => ({
                    path: file.path,
                    mode: file.mode,
                    type: file.type,
                    sha: file.sha,
               }));

               changes.forEach((change: any) => {
                    tree.push({
                         path: change.path,
                         mode: '100644',
                         type: 'blob',
                         content: change.content,
                    });
               });

               const createTreeResponse = await fetch(createTreeEndpoint, {
                    method: 'POST',
                    headers: {
                         Authorization: `token ${accessToken}`,
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ tree }),
               });

               const newTreeData = await createTreeResponse.json();

               const createCommitResponse = await fetch(createCommitEndpoint, {
                    method: 'POST',
                    headers: {
                         Authorization: `token ${accessToken}`,
                         'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                         message: commitMessage,
                         tree: newTreeData.sha,
                         parents: [treeData.sha],
                    }),
               });

               if (createCommitResponse.ok) {
                    res.status(200).json({ message: 'Dummy commit triggered successfully' });
               } else {
                    const errorText = await createCommitResponse.text();
                    res.status(500).json({ message: 'Failed to trigger dummy commit', error: errorText });
               }
          } catch (error) {
               res.status(500).json({ message: 'Failed to trigger dummy commit', error: error });
          }
     } else {
          res.status(405).json({ message: 'Method Not Allowed' });
     }
}
