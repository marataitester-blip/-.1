
export interface TarotCard {
  id: number;
  name: {
    en: string;
    ru: string;
  };
  keyword: {
    en: string;
    ru: string;
  };
  imageUrl: string;
  description: { // Short description for previews
      en: string;
      ru: string;
  };
  longDescription: { // Full, detailed interpretation
      en: string;
      ru: string;
  };
}

export interface Review {
  id: number;
  name: string;
  date: string;
  text: string;
  reply?: {
    text: string;
    date: string;
  };
}

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'lifetime';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'none';

export interface UserProfile {
  userId: string;
  email: string;
  stripeCustomerId?: string;
  subscription: {
    tier: SubscriptionTier;
    status: SubscriptionStatus;
    trialEndsAt?: string; // ISO Date String
    currentPeriodEnd?: string; // ISO Date String
    cancelAtPeriodEnd: boolean;
  };
}
