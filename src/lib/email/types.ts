export interface EmailMessage {
  to: string[];
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

export interface BatchResult {
  delivered: number;
  failed: number;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
  sendBatch(messages: EmailMessage[], idempotencyKey: string): Promise<BatchResult>;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}
