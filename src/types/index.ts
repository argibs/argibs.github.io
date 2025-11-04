export interface Project {
  id: number;
  title: string;
  category: string;
  subcategory?: string;
  description: string;
  fullDescription: string;
  image: string;
  pdfLink?: string;
}

export interface ChallengeDay {
  day: number;
  title: string;
  description: string;
  image: string;
  fullDescription: string;
  date?: string;
}

export interface ModalData {
  title: string;
  category?: string;
  subcategory?: string;
  description: string;
  fullDescription: string;
  image: string;
  pdfLink?: string;
  day?: number;
  date?: string;
}
