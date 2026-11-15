export type SubscriberType = 'customer' | 'vendor';

export interface Subscriber {
  id: string;
  type: SubscriberType;
  name: string;
  businessName: string;
  email: string;
  whatsapp: string;
  area: string;
  interests: string[];
  status: string;
  joinedAt: string;
  subscribed: boolean;
}

export interface SubscriberStats {
  total: number;
  customers: number;
  vendors: number;
  withEmail: number;
  unsubscribed: number;
  reachable: number;
}
