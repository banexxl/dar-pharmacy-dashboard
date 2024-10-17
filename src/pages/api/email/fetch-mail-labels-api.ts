import type { NextApiRequest, NextApiResponse } from 'next';
import Imap from 'imap';

export interface Label {
     id: string;
     color?: string;
     name: string;
     totalCount?: number;
     type: LabelType;
     unreadCount?: number;
     children?: Label[]; // Recursive type for nested labels
}

export type LabelType = 'system' | 'user'; // Define system/user label types

const imapConfig: any = {
     user: process.env.SMTP_USER!,
     password: process.env.SMTP_PASS!,
     host: process.env.SMTP_HOST!,
     port: process.env.IMAP_PORT,
     tls: true,
     authTimeout: 5000,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
     try {
          const imap = new Imap(imapConfig);

          imap.once('ready', () => {
               imap.getBoxes((err, mailboxes) => {
                    if (err) {
                         res.status(500).json({ error: 'Failed to fetch email labels' });
                         return;
                    }

                    // Parse mailboxes and their children into Label[]
                    const labels = parseMailboxes(mailboxes);

                    res.status(200).json(labels);
                    imap.end();
               });
          });

          imap.once('error', (err: any) => {
               res.status(500).json({ error: err.message });
          });

          imap.connect();
     } catch (error) {
          res.status(500).json({ error: 'Failed to fetch email labels' });
     }
}

// Helper function to parse mailboxes recursively
function parseMailboxes(mailboxes: any): Label[] {
     const labels: Label[] = [];

     Object.keys(mailboxes).forEach((mailboxName) => {
          const mailbox = mailboxes[mailboxName];

          const label: Label = {
               id: mailboxName, // Folder name as ID
               name: mailboxName,
               type: mailboxName.toLowerCase() === 'inbox' || mailbox.attribs.includes('\\Sent') ? 'system' : 'user', // Add more conditions as necessary
               children: mailbox.children ? parseMailboxes(mailbox.children) : [], // Recursively parse child mailboxes
          };

          labels.push(label);
     });

     return labels;
}
