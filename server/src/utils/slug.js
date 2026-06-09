// src/utils/slug.js
/**
 * Generate a clean URL-friendly slug
 */
export const generateSlug = (text) => {
  if (!text || typeof text !== 'string') {
    return `product-${Date.now()}`;
  }

  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')           // spaces to dashes
    .replace(/[^\w\-]+/g, '')       // remove special chars
    .replace(/\-\-+/g, '-')         // multiple dashes to single
    .replace(/^-+/, '')             // trim leading dashes
    .replace(/-+$/, '');            // trim trailing dashes
};

/**
 * Generate unique slug (recommended for products)
 */
export const generateUniqueSlug = (name) => {
  const base = generateSlug(name);
  return `${base}-${Date.now()}`;
};