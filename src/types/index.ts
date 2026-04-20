export interface Project {
  category: string;
  subcategory: string | null;
  title: string;
  description: string;
  image: string;
  fullDescription: string;
}

export interface CodingProject {
  title: string;
  description: string;
  tags: string[];
  date: string;
  notebook: string;
}

export interface WebGISHighlight {
  text: string;
  linkLabel?: string;
  linkUrl?: string;
}

export interface WebGISProject {
  title: string;
  description: string;
  highlights: WebGISHighlight[];
  tags: string[];
  date: string;
}

export interface ChallengeDay {
  day: number;
  title: string;
  description: string;
  image: string;
  fullDescription: string;
}
