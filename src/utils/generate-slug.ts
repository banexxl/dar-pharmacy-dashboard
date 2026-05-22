export const generateSlug = (name: string): string => {
     return name
          .toLowerCase()
          .replace(/[абвгдђежзијклљмнњопрстћуфхцчџш]/g, (char) => {
               const map: Record<string, string> = {
                    а: 'a',
                    б: 'b',
                    в: 'v',
                    г: 'g',
                    д: 'd',
                    ђ: 'dj',
                    е: 'e',
                    ж: 'z',
                    з: 'z',
                    и: 'i',
                    ј: 'j',
                    к: 'k',
                    л: 'l',
                    љ: 'lj',
                    м: 'm',
                    н: 'n',
                    њ: 'nj',
                    о: 'o',
                    п: 'p',
                    р: 'r',
                    с: 's',
                    т: 't',
                    ћ: 'c',
                    у: 'u',
                    ф: 'f',
                    х: 'h',
                    ц: 'c',
                    ч: 'c',
                    џ: 'dz',
                    ш: 's'
               };
               return map[char] || char;
          })
          .replace(/č/g, 'c')
          .replace(/ć/g, 'c')
          .replace(/š/g, 's')
          .replace(/ž/g, 'z')
          .replace(/đ/g, 'dj')
          .replace(/\s+/g, '-')
          .normalize('NFD')                          // Normalize Unicode
          .replace(/[\u0300-\u036f]/g, '')           // Remove diacritics
          .replace(/[^a-z0-9]+/g, '-')               // Replace non-alphanum with dashes
          .replace(/^-+|-+$/g, '')                   // Trim leading/trailing dashes
          .replace(/-+/g, '-');                      // Collapse multiple dashes
};
