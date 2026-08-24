'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
     Box,
     Button,
     Card,
     CardContent,
     CircularProgress,
     Container,
     Grid,
     Input,
     MenuItem,
     Stack,
     Switch,
     TextField,
     Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Swal from 'sweetalert2';
import { generateSlug } from '@/utils/generate-slug';
import { createBlog, updateBlog, type BlogPost, type BlogPayload } from '../actions';

interface BlogFormData {
     title: string;
     slug: string;
     excerpt: string;
     content: string;
     cover_image: string | null;
     author: string;
     category: string;
     reading_time_minutes: number;
     is_published: boolean;
     featured: boolean;
     views_count: number;
     published_at: string | null;
}

const CATEGORIES = [
     { value: 'zdravlje', label: 'Zdravlje' },
     { value: 'lepota', label: 'Lepota' },
     { value: 'ishrana', label: 'Ishrana' },
     { value: 'saveti', label: 'Saveti' },
     { value: 'biljni_preparati', label: 'Biljni preparati' },
     { value: 'aromaterapija', label: 'Aromaterapija' },
     { value: 'vitamini_i_suplementi', label: 'Vitamini i suplementi' },
     { value: 'prirodna_kozmetika', label: 'Prirodna kozmetika' },
];

const EMPTY_BLOG: BlogFormData = {
     title: '',
     slug: '',
     excerpt: '',
     content: '',
     cover_image: null,
     author: '',
     category: CATEGORIES[0].value,
     reading_time_minutes: 1,
     is_published: false,
     featured: false,
     views_count: 0,
     published_at: null,
};

function calculateReadingTime(html: string): number {
     const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
     const wordCount = text.split(' ').filter(Boolean).length;
     const minutes = Math.ceil(wordCount / 200);
     return Math.max(1, minutes);
}

interface BlogFormClientProps {
     id: string;
     initialData?: BlogPost | null;
}

const BlogFormClient = ({ id, initialData }: BlogFormClientProps) => {
     const router = useRouter();
     const isNew = id === 'new';

     const [blog, setBlog] = useState<BlogFormData>(() => {
          if (initialData) {
               return {
                    title: initialData.title,
                    slug: initialData.slug,
                    excerpt: initialData.excerpt,
                    content: initialData.content,
                    cover_image: initialData.cover_image,
                    author: initialData.author,
                    category: initialData.category,
                    reading_time_minutes: initialData.reading_time_minutes,
                    is_published: initialData.is_published,
                    featured: initialData.featured,
                    views_count: initialData.views_count,
                    published_at: initialData.published_at,
               };
          }
          return EMPTY_BLOG;
     });

     const [saving, setSaving] = useState(false);
     const [imageUploading, setImageUploading] = useState(false);
     const [slugManuallyEdited, setSlugManuallyEdited] = useState(!isNew);
     const editorRef = useRef<HTMLDivElement>(null);
     const editorInstanceRef = useRef<any>(null);

     // Initialize EditorJS
     useEffect(() => {
          let mounted = true;

          (async () => {
               const EditorJS = (await import('@editorjs/editorjs')).default;

               if (!mounted || !editorRef.current) return;

               let initialData: any = undefined;
               if (blog.content) {
                    initialData = {
                         blocks: [{ type: 'paragraph', data: { text: blog.content } }],
                    };
               }

               editorInstanceRef.current = new EditorJS({
                    holder: editorRef.current,
                    placeholder: 'Počni da pišeš blog post...',
                    data: initialData,
                    onChange: async () => {
                         try {
                              const output = await editorInstanceRef.current.save();
                              const html = (output.blocks || [])
                                   .map((b: any) => {
                                        if (b.type === 'paragraph') return `<p>${b.data?.text || ''}</p>`;
                                        if (b.type === 'header') return `<h${b.data?.level || 2}>${b.data?.text || ''}</h${b.data?.level || 2}>`;
                                        if (b.type === 'list') {
                                             const tag = b.data?.style === 'ordered' ? 'ol' : 'ul';
                                             const items = (b.data?.items || []).map((item: string) => `<li>${item}</li>`).join('');
                                             return `<${tag}>${items}</${tag}>`;
                                        }
                                        return `<p>${b.data?.text || ''}</p>`;
                                   })
                                   .join('\n');

                              const readingTime = calculateReadingTime(html);
                              setBlog((prev) => ({ ...prev, content: html, reading_time_minutes: readingTime }));
                         } catch (err) {
                              // noop
                         }
                    },
               });
          })();

          return () => {
               mounted = false;
               if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === 'function') {
                    editorInstanceRef.current.destroy();
                    editorInstanceRef.current = null;
               }
          };
     }, []);

     const handleTitleChange = (value: string) => {
          setBlog((prev) => {
               const updated: BlogFormData = { ...prev, title: value };
               if (!slugManuallyEdited) {
                    updated.slug = generateSlug(value);
               }
               return updated;
          });
     };

     const handleSlugChange = (value: string) => {
          setSlugManuallyEdited(true);
          setBlog((prev) => ({ ...prev, slug: generateSlug(value) }));
     };

     // Image upload to AWS S3
     const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];
          if (!file) return;

          setImageUploading(true);

          try {
               const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';

               const reader = new FileReader();
               reader.readAsDataURL(file);
               reader.onloadend = async () => {
                    const base64Data = reader.result as string;

                    const response = await fetch('/api/aws/blog-image-storage', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                              file: base64Data,
                              extension: fileExt,
                              fileName: file.name,
                         }),
                    });

                    if (!response.ok) {
                         const errData = await response.json();
                         Swal.fire({ icon: 'error', title: 'Greška', text: errData.error || 'Upload slike nije uspeo.' });
                         setImageUploading(false);
                         return;
                    }

                    const result = await response.json();
                    setBlog((prev) => ({ ...prev, cover_image: result.imageUrl }));
                    Swal.fire({ icon: 'success', title: 'OK', text: 'Slika učitana uspešno!' });
                    setImageUploading(false);
               };
          } catch (err) {
               Swal.fire({ icon: 'error', title: 'Greška', text: 'Upload slike nije uspeo.' });
               setImageUploading(false);
          }
     };

     const handleSave = async (publish: boolean) => {
          if (!blog.title.trim()) {
               Swal.fire({ icon: 'warning', title: 'Upozorenje', text: 'Naslov je obavezan.' });
               return;
          }
          if (!blog.slug.trim()) {
               Swal.fire({ icon: 'warning', title: 'Upozorenje', text: 'Slug je obavezan.' });
               return;
          }
          if (!blog.excerpt.trim()) {
               Swal.fire({ icon: 'warning', title: 'Upozorenje', text: 'Kratak opis je obavezan.' });
               return;
          }
          if (!blog.content.trim()) {
               Swal.fire({ icon: 'warning', title: 'Upozorenje', text: 'Sadržaj je obavezan.' });
               return;
          }
          if (!blog.author.trim()) {
               Swal.fire({ icon: 'warning', title: 'Upozorenje', text: 'Autor je obavezan.' });
               return;
          }

          setSaving(true);

          const payload: BlogPayload = {
               title: blog.title.trim(),
               slug: blog.slug.trim(),
               excerpt: blog.excerpt.trim(),
               content: blog.content,
               cover_image: blog.cover_image,
               author: blog.author.trim(),
               category: blog.category,
               reading_time_minutes: blog.reading_time_minutes,
               is_published: publish,
               featured: blog.featured,
          };

          // Set published_at when publishing for the first time
          if (publish && !blog.published_at) {
               payload.published_at = new Date().toISOString();
          }

          let result;

          if (isNew) {
               result = await createBlog(payload);
          } else {
               result = await updateBlog(id, payload);
          }

          if (result.success) {
               Swal.fire({
                    icon: 'success',
                    title: 'OK',
                    text: isNew
                         ? (publish ? 'Blog post objavljen!' : 'Draft sačuvan!')
                         : 'Blog post sačuvan!',
               });
               router.push('/blog');
          } else {
               Swal.fire({ icon: 'error', title: 'Greška', text: result.error || 'Čuvanje nije uspelo.' });
               setSaving(false);
          }
     };

     return (
          <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
               <Container maxWidth="lg">
                    <Stack spacing={3}>
                         <Stack direction="row" alignItems="center" spacing={2}>
                              <Button
                                   startIcon={<ArrowBackIcon />}
                                   onClick={() => router.push('/blog')}
                                   color="inherit"
                              >
                                   Nazad
                              </Button>
                              <Typography variant="h4">
                                   {isNew ? 'Novi blog post' : 'Izmeni blog post'}
                              </Typography>
                         </Stack>

                         <Card>
                              <CardContent>
                                   <Grid container spacing={3}>
                                        {/* Title */}
                                        <Grid size={{ xs: 12, md: 8 }}>
                                             <TextField
                                                  fullWidth
                                                  label="Naslov"
                                                  value={blog.title}
                                                  onChange={(e) => handleTitleChange(e.target.value)}
                                                  disabled={saving}
                                                  required
                                             />
                                        </Grid>

                                        {/* Slug */}
                                        <Grid size={{ xs: 12, md: 4 }}>
                                             <TextField
                                                  fullWidth
                                                  label="Slug"
                                                  value={blog.slug}
                                                  onChange={(e) => handleSlugChange(e.target.value)}
                                                  disabled
                                                  required
                                                  helperText="Auto-generiše se iz naslova"
                                             />
                                        </Grid>

                                        {/* Excerpt */}
                                        <Grid size={{ xs: 12 }}>
                                             <TextField
                                                  fullWidth
                                                  label="Kratak opis (excerpt)"
                                                  value={blog.excerpt}
                                                  onChange={(e) => setBlog((prev) => ({ ...prev, excerpt: e.target.value }))}
                                                  disabled={saving}
                                                  required
                                                  multiline
                                                  rows={2}
                                                  helperText={`${blog.excerpt.length}/200 karaktera`}
                                                  inputProps={{ maxLength: 200 }}
                                             />
                                        </Grid>

                                        {/* Author */}
                                        <Grid size={{ xs: 12, md: 4 }}>
                                             <TextField
                                                  fullWidth
                                                  label="Autor"
                                                  value={blog.author}
                                                  onChange={(e) => setBlog((prev) => ({ ...prev, author: e.target.value }))}
                                                  disabled={saving}
                                                  required
                                             />
                                        </Grid>

                                        {/* Category */}
                                        <Grid size={{ xs: 12, md: 4 }}>
                                             <TextField
                                                  fullWidth
                                                  label="Kategorija"
                                                  select
                                                  value={blog.category}
                                                  onChange={(e) => setBlog((prev) => ({ ...prev, category: e.target.value }))}
                                                  disabled={saving}
                                                  required
                                             >
                                                  {CATEGORIES.map((cat) => (
                                                       <MenuItem key={cat.value} value={cat.value}>
                                                            {cat.label}
                                                       </MenuItem>
                                                  ))}
                                             </TextField>
                                        </Grid>

                                        {/* Reading Time */}
                                        <Grid size={{ xs: 12, md: 4 }}>
                                             <TextField
                                                  fullWidth
                                                  label="Vreme čitanja (min)"
                                                  type="number"
                                                  value={blog.reading_time_minutes}
                                                  onChange={(e) =>
                                                       setBlog((prev) => ({
                                                            ...prev,
                                                            reading_time_minutes: Math.max(1, parseInt(e.target.value, 10) || 1),
                                                       }))
                                                  }
                                                  disabled={saving}
                                                  helperText="Auto-izračunato iz sadržaja"
                                             />
                                        </Grid>

                                        {/* Switches */}
                                        <Grid size={{ xs: 12 }}>
                                             <Stack direction="row" spacing={4} alignItems="center">
                                                  <Stack direction="row" alignItems="center" spacing={1}>
                                                       <Switch
                                                            checked={blog.is_published}
                                                            onChange={(e) =>
                                                                 setBlog((prev) => ({ ...prev, is_published: e.target.checked }))
                                                            }
                                                            disabled={saving}
                                                       />
                                                       <Typography variant="body2">Objavljeno</Typography>
                                                  </Stack>
                                                  <Stack direction="row" alignItems="center" spacing={1}>
                                                       <Switch
                                                            checked={blog.featured}
                                                            onChange={(e) =>
                                                                 setBlog((prev) => ({ ...prev, featured: e.target.checked }))
                                                            }
                                                            disabled={saving}
                                                       />
                                                       <Typography variant="body2">Istaknuto</Typography>
                                                  </Stack>
                                                  {!isNew && (
                                                       <Typography variant="body2" color="text.secondary">
                                                            Pregledi: {blog.views_count}
                                                       </Typography>
                                                  )}
                                             </Stack>
                                        </Grid>

                                        {/* Cover Image */}
                                        <Grid size={{ xs: 12 }}>
                                             <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                  Cover slika
                                             </Typography>
                                             <Stack direction="row" spacing={2} alignItems="center">
                                                  <Button
                                                       component="label"
                                                       variant="outlined"
                                                       startIcon={imageUploading ? <CircularProgress size={18} /> : <CloudUploadIcon />}
                                                       disabled={saving || imageUploading}
                                                  >
                                                       {imageUploading ? 'Učitavanje...' : 'Učitaj sliku'}
                                                       <Input
                                                            type="file"
                                                            inputProps={{ accept: 'image/*' }}
                                                            sx={{
                                                                 clip: 'rect(0 0 0 0)',
                                                                 clipPath: 'inset(50%)',
                                                                 height: 1,
                                                                 overflow: 'hidden',
                                                                 position: 'absolute',
                                                                 bottom: 0,
                                                                 left: 0,
                                                                 whiteSpace: 'nowrap',
                                                                 width: 1,
                                                            }}
                                                            onChange={handleImageUpload}
                                                       />
                                                  </Button>
                                                  {blog.cover_image && (
                                                       <Button
                                                            color="error"
                                                            size="small"
                                                            onClick={() => setBlog((prev) => ({ ...prev, cover_image: null }))}
                                                       >
                                                            Ukloni
                                                       </Button>
                                                  )}
                                             </Stack>
                                             {blog.cover_image && (
                                                  <Box
                                                       sx={{
                                                            mt: 2,
                                                            width: '100%',
                                                            maxWidth: 400,
                                                            height: 200,
                                                            borderRadius: 1,
                                                            overflow: 'hidden',
                                                            border: '1px solid',
                                                            borderColor: 'divider',
                                                            backgroundImage: `url(${blog.cover_image})`,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                       }}
                                                  />
                                             )}
                                        </Grid>

                                        {/* Content Editor */}
                                        <Grid size={{ xs: 12 }}>
                                             <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                  Sadržaj
                                             </Typography>

                                             {/* Markdown Instructions */}
                                             <Accordion sx={{ mb: 2 }}>
                                                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                       <Typography variant="body2" fontWeight={600}>
                                                            Uputstvo za pisanje sadržaja (Markdown)
                                                       </Typography>
                                                  </AccordionSummary>
                                                  <AccordionDetails>
                                                       <Stack spacing={1.5}>
                                                            <Typography variant="body2" fontWeight={600}>Naslovi</Typography>
                                                            <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                                                                 # Glavni naslov (koristi samo jednom)<br />
                                                                 ## Naslov sekcije<br />
                                                                 ### Podnaslov
                                                            </Typography>

                                                            <Typography variant="body2" fontWeight={600}>Paragrafi</Typography>
                                                            <Typography variant="body2">
                                                                 Piši slobodan tekst. Za novi paragraf, ostavi jedan prazan red između.
                                                            </Typography>

                                                            <Typography variant="body2" fontWeight={600}>Podebljano i kurziv</Typography>
                                                            <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                                                                 **podebljano** — za isticanje ili nazive proizvoda<br />
                                                                 *kurziv* — za blaže naglašavanje
                                                            </Typography>

                                                            <Typography variant="body2" fontWeight={600}>Liste sa tačkama</Typography>
                                                            <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                                                                 - Prva stavka<br />
                                                                 - Druga stavka<br />
                                                                 - Treća stavka
                                                            </Typography>

                                                            <Typography variant="body2" fontWeight={600}>Numerisane liste</Typography>
                                                            <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                                                                 1. Prvi korak<br />
                                                                 2. Drugi korak<br />
                                                                 3. Treći korak
                                                            </Typography>

                                                            <Typography variant="body2" fontWeight={600}>Citati</Typography>
                                                            <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                                                                 {'> Ovo je citat ili istaknuta informacija.'}
                                                            </Typography>

                                                            <Typography variant="body2" fontWeight={600}>Linkovi</Typography>
                                                            <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                                                                 [tekst linka](https://primer.com)
                                                            </Typography>

                                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                                 Napomena: Uvek ostavi prazan red pre i posle liste ili citata.
                                                            </Typography>
                                                       </Stack>
                                                  </AccordionDetails>
                                             </Accordion>

                                             <Box
                                                  ref={editorRef}
                                                  sx={{
                                                       border: '1px solid',
                                                       borderColor: 'divider',
                                                       borderRadius: 1,
                                                       p: 2,
                                                       minHeight: 300,
                                                       '& .ce-block__content': {
                                                            maxWidth: '100%',
                                                       },
                                                  }}
                                             />
                                        </Grid>

                                        {/* Action Buttons */}
                                        <Grid size={{ xs: 12 }}>
                                             <Stack direction="row" spacing={2} justifyContent="flex-end">
                                                  <Button
                                                       variant="outlined"
                                                       onClick={() => handleSave(false)}
                                                       disabled={saving}
                                                  >
                                                       {saving ? 'Čuvanje...' : 'Sačuvaj kao draft'}
                                                  </Button>
                                                  <Button
                                                       variant="contained"
                                                       onClick={() => handleSave(true)}
                                                       disabled={saving}
                                                  >
                                                       {saving ? 'Čuvanje...' : 'Objavi'}
                                                  </Button>
                                             </Stack>
                                        </Grid>
                                   </Grid>
                              </CardContent>
                         </Card>
                    </Stack>
               </Container>
          </Box>
     );
};

export default BlogFormClient;
