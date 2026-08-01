/**
 * Blog bylines. A named human author is the strongest E-E-A-T signal available
 * for health and finance content — posts render a visible byline with headshot
 * and emit a schema.org Person rather than the Organization default.
 *
 * Posts reference an author by key in frontmatter: `author: gerard`.
 */
export interface Author {
  key: string;
  name: string;
  /** Optional credential/role shown after the name and used as jobTitle. */
  title?: string;
  image: string;
}

const IMAGE_BASE =
  "https://dupymdjsuvirkwadanjt.supabase.co/storage/v1/object/public/blogauthorimages";

export const AUTHORS: Record<string, Author> = {
  gerard: {
    key: "gerard",
    name: "Gerard Cavaleri",
    image: `${IMAGE_BASE}/gerard.jpeg`,
  },
  jace: {
    key: "jace",
    name: "Jace Russell",
    image: `${IMAGE_BASE}/jace.jpeg`,
  },
  michael: {
    key: "michael",
    name: "Michael Cavaleri",
    image: `${IMAGE_BASE}/michael.jpeg`,
  },
};

/** Resolve a frontmatter author value (key or full name) to an Author. */
export function resolveAuthor(value?: string): Author | undefined {
  if (!value) return undefined;
  const k = value.trim().toLowerCase();
  if (AUTHORS[k]) return AUTHORS[k];
  return Object.values(AUTHORS).find((a) => a.name.toLowerCase() === k);
}
