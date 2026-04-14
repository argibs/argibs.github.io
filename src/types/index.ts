export interface Project {
  category: string;
  subcategory: string | null;
  title: string;
  description: string;
  image: string;
  fullDescription: string;
}

export interface ChallengeDay {
  day: number;
  title: string;
  description: string;
  image: string;
  fullDescription: string;
}
