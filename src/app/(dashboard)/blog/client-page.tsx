'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
     Box,
     Button,
     Card,
     Chip,
     Container,
     IconButton,
     InputAdornment,
     MenuItem,
     OutlinedInput,
     Select,
     Stack,
     SvgIcon,
     Table,
     TableBody,
     TableCell,
     TableHead,
     TablePagination,
     TableRow,
     Typography,
} from '@mui/material';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Swal from 'sweetalert2';
import { deleteBlog, toggleBlogPublish, toggleBlogFeatured, type BlogPost } from './actions';

const CATEGORIES = [
     'Zdravlje',
     'Lepota',
     'Ishrana',
     'Saveti',
     'Biljni preparati',
     'Aromaterapija',
     'Vitamini i suplementi',
     'Prirodna kozmetika',
];

interface BlogClientPageProps {
     initialBlogs: BlogPost[];
}

const BlogClientPage = ({ initialBlogs }: BlogClientPageProps) => {
     const router = useRouter();
     const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);
     const [searchQuery, setSearchQuery] = useState('');
     const [categoryFilter, setCategoryFilter] = useState('');
     const [publishedFilter, setPublishedFilter] = useState<string>('');
     const [page, setPage] = useState(0);
     const [rowsPerPage, setRowsPerPage] = useState(10);

     const filteredBlogs = useMemo(() => {
          return blogs.filter((blog) => {
               if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    if (
                         !blog.title.toLowerCase().includes(query) &&
                         !blog.author.toLowerCase().includes(query)
                    ) {
                         return false;
                    }
               }
               if (categoryFilter && blog.category !== categoryFilter) {
                    return false;
               }
               if (publishedFilter === 'published' && !blog.is_published) {
                    return false;
               }
               if (publishedFilter === 'draft' && blog.is_published) {
                    return false;
               }
               return true;
          });
     }, [blogs, searchQuery, categoryFilter, publishedFilter]);

     const visibleBlogs = useMemo(() => {
          return filteredBlogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
     }, [filteredBlogs, page, rowsPerPage]);

     const handleTogglePublish = async (blog: BlogPost) => {
          const result = await toggleBlogPublish(blog.id, blog.is_published, blog.published_at);

          if (result.success && result.data) {
               setBlogs((prev) =>
                    prev.map((b) => (b.id === blog.id ? result.data : b))
               );
          } else {
               Swal.fire({ icon: 'error', title: 'Greška', text: result.error || 'Promena statusa nije uspela.' });
          }
     };

     const handleToggleFeatured = async (blog: BlogPost) => {
          const result = await toggleBlogFeatured(blog.id, blog.featured);

          if (result.success && result.data) {
               setBlogs((prev) =>
                    prev.map((b) => (b.id === blog.id ? result.data : b))
               );
          } else {
               Swal.fire({ icon: 'error', title: 'Greška', text: result.error || 'Promena nije uspela.' });
          }
     };

     const handleDelete = async (blog: BlogPost) => {
          const confirmation = await Swal.fire({
               title: 'Da li ste sigurni?',
               text: `Blog "${blog.title}" će biti trajno obrisan.`,
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#d33',
               cancelButtonColor: '#3085d6',
               confirmButtonText: 'Da, obriši!',
               cancelButtonText: 'Odustani',
          });

          if (!confirmation.isConfirmed) return;

          const result = await deleteBlog(blog.id);

          if (result.success) {
               setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
               Swal.fire({ icon: 'success', title: 'Obrisano', text: 'Blog post je obrisan.' });
          } else {
               Swal.fire({ icon: 'error', title: 'Greška', text: result.error || 'Brisanje nije uspelo.' });
          }
     };

     const formatDate = (dateStr: string | null) => {
          if (!dateStr) return '—';
          return new Date(dateStr).toLocaleDateString('sr-RS', {
               day: '2-digit',
               month: '2-digit',
               year: 'numeric',
          });
     };

     return (
          <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
               <Container maxWidth="xl">
                    <Stack spacing={3}>
                         <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="h4">Blog</Typography>
                              <Button
                                   startIcon={
                                        <SvgIcon fontSize="small">
                                             <PlusIcon />
                                        </SvgIcon>
                                   }
                                   variant="contained"
                                   onClick={() => router.push('/blog/new')}
                              >
                                   Novi post
                              </Button>
                         </Stack>

                         <Card sx={{ p: 2 }}>
                              <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                                   <OutlinedInput
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Pretraži po naslovu ili autoru..."
                                        startAdornment={
                                             <InputAdornment position="start">
                                                  <SvgIcon color="action" fontSize="small">
                                                       <MagnifyingGlassIcon />
                                                  </SvgIcon>
                                             </InputAdornment>
                                        }
                                        endAdornment={
                                             searchQuery ? (
                                                  <InputAdornment position="end">
                                                       <IconButton onClick={() => setSearchQuery('')} size="small">
                                                            <ClearIcon fontSize="small" />
                                                       </IconButton>
                                                  </InputAdornment>
                                             ) : null
                                        }
                                        sx={{ maxWidth: 350 }}
                                   />
                                   <Select
                                        displayEmpty
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        sx={{ minWidth: 180 }}
                                   >
                                        <MenuItem value="">Sve kategorije</MenuItem>
                                        {CATEGORIES.map((cat) => (
                                             <MenuItem key={cat} value={cat}>
                                                  {cat}
                                             </MenuItem>
                                        ))}
                                   </Select>
                                   <Select
                                        displayEmpty
                                        value={publishedFilter}
                                        onChange={(e) => setPublishedFilter(e.target.value)}
                                        sx={{ minWidth: 160 }}
                                   >
                                        <MenuItem value="">Svi statusi</MenuItem>
                                        <MenuItem value="published">Objavljeno</MenuItem>
                                        <MenuItem value="draft">Priprema</MenuItem>
                                   </Select>
                              </Stack>
                         </Card>

                         <Card>
                              <Box sx={{ overflowX: 'auto' }}>
                                   <Table sx={{ minWidth: 900 }}>
                                        <TableHead>
                                             <TableRow>
                                                  <TableCell>Naslov</TableCell>
                                                  <TableCell>Kategorija</TableCell>
                                                  <TableCell>Autor</TableCell>
                                                  <TableCell>Status</TableCell>
                                                  <TableCell>Istaknuto</TableCell>
                                                  <TableCell>Pregledi</TableCell>
                                                  <TableCell>Datum</TableCell>
                                                  <TableCell align="right">Akcije</TableCell>
                                             </TableRow>
                                        </TableHead>
                                        <TableBody>
                                             {visibleBlogs.length > 0 ? (
                                                  visibleBlogs.map((blog) => (
                                                       <TableRow hover key={blog.id}>
                                                            <TableCell>
                                                                 <Typography variant="subtitle2" noWrap sx={{ maxWidth: 250 }}>
                                                                      {blog.title}
                                                                 </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                 <Chip label={blog.category} size="small" variant="outlined" />
                                                            </TableCell>
                                                            <TableCell>{blog.author}</TableCell>
                                                            <TableCell>
                                                                 <Chip
                                                                      label={blog.is_published ? 'Objavljeno' : 'Priprema'}
                                                                      size="small"
                                                                      color={blog.is_published ? 'success' : 'default'}
                                                                 />
                                                            </TableCell>
                                                            <TableCell>
                                                                 <IconButton
                                                                      size="small"
                                                                      onClick={() => handleToggleFeatured(blog)}
                                                                      color={blog.featured ? 'warning' : 'default'}
                                                                 >
                                                                      {blog.featured ? <StarIcon /> : <StarBorderIcon />}
                                                                 </IconButton>
                                                            </TableCell>
                                                            <TableCell>{blog.views_count}</TableCell>
                                                            <TableCell>{formatDate(blog.published_at)}</TableCell>
                                                            <TableCell align="right">
                                                                 <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                                      <IconButton
                                                                           size="small"
                                                                           onClick={() => handleTogglePublish(blog)}
                                                                           title={blog.is_published ? 'Sakrij' : 'Objavi'}
                                                                      >
                                                                           {blog.is_published ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                                                      </IconButton>
                                                                      <IconButton
                                                                           size="small"
                                                                           onClick={() => router.push(`/blog/${blog.id}`)}
                                                                           title="Izmeni"
                                                                      >
                                                                           <EditIcon fontSize="small" />
                                                                      </IconButton>
                                                                      <IconButton
                                                                           size="small"
                                                                           color="error"
                                                                           onClick={() => handleDelete(blog)}
                                                                           title="Obriši"
                                                                      >
                                                                           <DeleteIcon fontSize="small" />
                                                                      </IconButton>
                                                                 </Stack>
                                                            </TableCell>
                                                       </TableRow>
                                                  ))
                                             ) : (
                                                  <TableRow>
                                                       <TableCell colSpan={8} align="center">
                                                            Nema blog postova.
                                                       </TableCell>
                                                  </TableRow>
                                             )}
                                        </TableBody>
                                   </Table>
                              </Box>
                              <TablePagination
                                   component="div"
                                   count={filteredBlogs.length}
                                   page={page}
                                   onPageChange={(_, newPage) => setPage(newPage)}
                                   rowsPerPage={rowsPerPage}
                                   onRowsPerPageChange={(e) => {
                                        setRowsPerPage(parseInt(e.target.value, 10));
                                        setPage(0);
                                   }}
                                   rowsPerPageOptions={[5, 10, 25]}
                                   labelRowsPerPage="Redova po stranici:"
                              />
                         </Card>
                    </Stack>
               </Container>
          </Box>
     );
};

export default BlogClientPage;
