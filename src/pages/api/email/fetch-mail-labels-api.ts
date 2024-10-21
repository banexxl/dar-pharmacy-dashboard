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
               imap.getBoxes(async (err, mailboxes) => {
                    if (err) {
                         res.status(500).json({ error: 'Failed to fetch email labels' });
                         imap.end();
                         return;
                    }

                    // Parse mailboxes and get unread count for each
                    const labels = await parseMailboxesWithUnread(imap, mailboxes);

                    res.status(200).json(labels);
                    imap.end();
               });
          });

          imap.once('error', (err: any) => {
               res.status(500).json({ error: err.message });
               imap.end();
          });

          imap.connect();
     } catch (error) {
          res.status(500).json({ error: 'Failed to fetch email labels' });
     }
}

// Helper function to parse mailboxes recursively and fetch unread counts
async function parseMailboxesWithUnread(imap: any, mailboxes: any): Promise<Label[]> {
     const labels: Label[] = [];

     for (const mailboxName of Object.keys(mailboxes)) {
          const mailbox = mailboxes[mailboxName];

          // Prefix the mailbox name with 'INBOX.' if it's not the INBOX itself
          const prefixedMailboxName = mailboxName.toUpperCase() === 'INBOX' ? 'INBOX' : `INBOX.${mailboxName}`;

          // Fetch unread count using imap.status for the mailbox
          const { totalCount, unreadCount } = await getMailboxStatus(imap, prefixedMailboxName);

          const label: Label = {
               id: prefixedMailboxName, // Folder name as ID
               name: mailboxName,
               type: mailboxName.toLowerCase() === 'inbox' || mailbox.attribs.includes('\\Sent') ? 'system' : 'user',
               totalCount,
               unreadCount,
               children: mailbox.children ? await parseMailboxesWithUnread(imap, mailbox.children) : [], // Recursively parse child mailboxes
          };

          labels.push(label);
     }

     return labels;
}

// Helper function to get the total and unread message count for a mailbox
function getMailboxStatus(imap: any, mailboxName: string): Promise<{ totalCount: number, unreadCount: number }> {
     return new Promise((resolve, reject) => {
          imap.status(mailboxName, (err: any, mailboxStatus: any) => {
               if (err) {
                    return reject(err);
               }

               const totalCount = mailboxStatus.messages.total || 0;
               const unreadCount = mailboxStatus.messages.unseen || 0;
               resolve({ totalCount, unreadCount });
          });
     });
}
