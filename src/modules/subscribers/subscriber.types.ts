export type SubscriberType = 'customer' | 'vendor';

export type SubscriberStatus = 'REGISTERED' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface VendorDetails {
  category: string;
  otherCategory: string;
  delivers: string;
  operatingModel: string;
  operatingLocations: string[];
  address: string;
  businessDescription: string;
  fulfilmentOptions: string[];
  socialMediaLink: string;
  additionalComments: string;
}

export interface Subscriber {
  id: string;
  type: SubscriberType;
  name: string;
  businessName: string;
  email: string;
  whatsapp: string;
  area: string;
  student: string;
  interests: string[];
  status: SubscriberStatus;
  adminNotes: string;
  joinedAt: string;
  reviewedAt: string;
  subscribed: boolean;
  vendor: VendorDetails | null;
}

export interface SubscriberStats {
  total: number;
  customers: number;
  vendors: number;
  withEmail: number;
  unsubscribed: number;
  reachable: number;
}
