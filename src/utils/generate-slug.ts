export const generateSlug = (name: string): string => {
     return name
          .toLowerCase()
          .replace(/č/g, 'c')
          .replace(/ć/g, 'c')
          .replace(/š/g, 's')
          .replace(/ž/g, 'z')
          .replace(/đ/g, 'dj')
          .normalize('NFD')                          // Normalize Unicode
          .replace(/[\u0300-\u036f]/g, '')           // Remove diacritics
          .replace(/[^a-z0-9]+/g, '-')               // Replace non-alphanum with dashes
          .replace(/^-+|-+$/g, '')                   // Trim leading/trailing dashes
          .replace(/-+/g, '-');                      // Collapse multiple dashes
};
