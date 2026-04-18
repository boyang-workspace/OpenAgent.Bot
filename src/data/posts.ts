export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  tags: string[];
  author: string;
  body: string;
  seoTitle?: string;
  seoDescription?: string;
};

export const posts: BlogPost[] = [];
