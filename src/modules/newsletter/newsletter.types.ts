export interface NewsletterLogEntry {
  id: string;
  sentAt: string;
  subject: string;
  audience: string;
  recipients: number;
  delivered: number;
  failed: number;
}
