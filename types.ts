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