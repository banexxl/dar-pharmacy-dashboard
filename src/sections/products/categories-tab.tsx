'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
     Box,
     Button,
     Card,
     Dialog,
     DialogContent,
     DialogTitle,
     Divider,
     IconButton,
     Stack,
     TextField,
     Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';

// ─── Types ──────────────────────────────────────────────────────────────────────
type CategoryLevel = 'main' | 'mid' | 'sub';

interface MainCategory {
     id: string;
     label: string;
     value: string;
     created_at: string;
}

interface MidCategory {
     id: string;
     label: string;
     value: string;
     main_category_id: string;
     created_at: string;
}

interface SubCategory {
     id: string;
     label: string;
     value: string;
     mid_category_id: string;
     created_at: string;
}

// ─── Component ──────────────────────────────────────────────────────────────────
export const CategoriesTab = () => {
     const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
     const [midCategories, setMidCategories] = useState<MidCategory[]>([]);
     const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

     const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
     const [selectedMidId, setSelectedMidId] = useState<string | null>(null);

     const [loading, setLoading] = useState(true);

     // Dialog state
     const [dialogOpen, setDialogOpen] = useState(false);
     const [dialogLevel, setDialogLevel] = useState<CategoryLevel>('main');
     const [dialogLabel, setDialogLabel] = useState('');
     const [editingId, setEditingId] = useState<string | null>(null);

     // ── Fetch all categories ────────────────────────────────────────────────────
     const fetchCategories = useCallback(async () => {
          try {
               setLoading(true);
               const res = await fetch('/api/categories');
               if (!res.ok) throw new Error();
               const json = await res.json();
               setMainCategories(json.data.main ?? []);
               setMidCategories(json.data.mid ?? []);
               setSubCategories(json.data.sub ?? []);
          } catch {
               Swal.fire({ icon: 'error', title: 'Greška', text: 'Učitavanje kategorija nije uspelo.' });
          } finally {
               setLoading(false);
          }
     }, []);

     useEffect(() => {
          fetchCategories();
     }, [fetchCategories]);

     // ── Filtered mid / sub based on selection ───────────────────────────────────
     const filteredMid = useMemo(() => {
          if (!selectedMainId) return [];
          return midCategories.filter((m) => m.main_category_id === selectedMainId);
     }, [midCategories, selectedMainId]);

     const filteredSub = useMemo(() => {
          if (!selectedMidId) return [];
          return subCategories.filter((s) => s.mid_category_id === selectedMidId);
     }, [subCategories, selectedMidId]);

     // ── Open dialog ─────────────────────────────────────────────────────────────
     const openCreateDialog = (level: CategoryLevel) => {
          setDialogLevel(level);
          setDialogLabel('');
          setEditingId(null);
          setDialogOpen(true);
     };

     const openEditDialog = (level: CategoryLevel, id: string, currentLabel: string) => {
          setDialogLevel(level);
          setDialogLabel(currentLabel);
          setEditingId(id);
          setDialogOpen(true);
     };

     // ── Save (create or update) ─────────────────────────────────────────────────
     const handleSave = async () => {
          if (!dialogLabel.trim()) {
               Swal.fire({ icon: 'warning', title: 'Unesite naziv', text: 'Naziv kategorije je obavezan.' });
               return;
          }

          const isEdit = Boolean(editingId);
          const body: Record<string, unknown> = {
               level: dialogLevel,
               label: dialogLabel.trim(),
          };

          if (isEdit) {
               body.id = editingId;
          } else {
               if (dialogLevel === 'mid') body.main_category_id = selectedMainId;
               if (dialogLevel === 'sub') body.mid_category_id = selectedMidId;
          }

          try {
               const res = await fetch('/api/categories', {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
               });

               if (!res.ok) throw new Error();
               const json = await res.json();
               const item = json.data;

               if (dialogLevel === 'main') {
                    setMainCategories((prev) =>
                         isEdit ? prev.map((c) => (c.id === item.id ? item : c)) : [...prev, item]
                    );
               } else if (dialogLevel === 'mid') {
                    setMidCategories((prev) =>
                         isEdit ? prev.map((c) => (c.id === item.id ? item : c)) : [...prev, item]
                    );
               } else {
                    setSubCategories((prev) =>
                         isEdit ? prev.map((c) => (c.id === item.id ? item : c)) : [...prev, item]
                    );
               }

               setDialogOpen(false);
               Swal.fire({ icon: 'success', title: 'OK', text: isEdit ? 'Kategorija ažurirana.' : 'Kategorija dodata.' });
          } catch {
               Swal.fire({ icon: 'error', title: 'Greška', text: 'Operacija nije uspela.' });
          }
     };

     // ── Delete ──────────────────────────────────────────────────────────────────
     const handleDelete = async (level: CategoryLevel, id: string) => {
          const result = await Swal.fire({
               title: 'Da li ste sigurni?',
               text: level !== 'sub' ? 'Brisanje će obrisati i sve podkategorije.' : 'Brisanje je trajno.',
               icon: 'warning',
               showCancelButton: true,
               confirmButtonText: 'Da, obriši',
               cancelButtonText: 'Odustani',
          });

          if (!result.isConfirmed) return;

          try {
               const res = await fetch('/api/categories', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ level, id }),
               });

               if (!res.ok) throw new Error();

               if (level === 'main') {
                    setMainCategories((prev) => prev.filter((c) => c.id !== id));
                    const removedMidIds = midCategories.filter((m) => m.main_category_id === id).map((m) => m.id);
                    setMidCategories((prev) => prev.filter((m) => m.main_category_id !== id));
                    setSubCategories((prev) => prev.filter((s) => !removedMidIds.includes(s.mid_category_id)));
                    if (selectedMainId === id) {
                         setSelectedMainId(null);
                         setSelectedMidId(null);
                    }
               } else if (level === 'mid') {
                    setMidCategories((prev) => prev.filter((c) => c.id !== id));
                    setSubCategories((prev) => prev.filter((s) => s.mid_category_id !== id));
                    if (selectedMidId === id) {
                         setSelectedMidId(null);
                    }
               } else {
                    setSubCategories((prev) => prev.filter((c) => c.id !== id));
               }

               Swal.fire({ icon: 'success', title: 'OK', text: 'Kategorija obrisana.' });
          } catch {
               Swal.fire({ icon: 'error', title: 'Greška', text: 'Brisanje nije uspelo.' });
          }
     };

     // ── Render ──────────────────────────────────────────────────────────────────
     if (loading) {
          return (
               <Card sx={{ p: 3 }}>
                    <Typography>Učitavanje kategorija...</Typography>
               </Card>
          );
     }

     const selectedMainLabel = mainCategories.find((c) => c.id === selectedMainId)?.label;
     const selectedMidLabel = midCategories.find((c) => c.id === selectedMidId)?.label;

     const levelLabel = dialogLevel === 'main' ? 'glavnu' : dialogLevel === 'mid' ? 'srednju' : 'pod';

     return (
          <>
               <Box
                    sx={{
                         display: 'grid',
                         gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                         gap: 2,
                    }}
               >
                    {/* ─── Column 1: Main Categories ─────────────────────────── */}
                    <Card sx={{ p: 2, height: 'fit-content' }}>
                         <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                   <Typography variant="h6">Glavne kategorije</Typography>
                                   <Button variant="contained" size="small" onClick={() => openCreateDialog('main')}>
                                        Dodaj
                                   </Button>
                              </Stack>
                              <Divider />
                              <Stack spacing={1}>
                                   {mainCategories.length === 0 && (
                                        <Typography variant="body2" color="text.secondary">
                                             Nema kategorija.
                                        </Typography>
                                   )}
                                   {mainCategories.map((cat) => (
                                        <Box
                                             key={cat.id}
                                             onClick={() => {
                                                  setSelectedMainId(cat.id);
                                                  setSelectedMidId(null);
                                             }}
                                             sx={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'space-between',
                                                  border: '1px solid',
                                                  borderColor: selectedMainId === cat.id ? 'primary.main' : 'divider',
                                                  backgroundColor: selectedMainId === cat.id ? 'primary.50' : 'transparent',
                                                  borderRadius: 1,
                                                  px: 1.5,
                                                  py: 1,
                                                  cursor: 'pointer',
                                                  transition: 'all 0.15s',
                                                  '&:hover': {
                                                       borderColor: 'primary.main',
                                                  },
                                             }}
                                        >
                                             <Box>
                                                  <Typography variant="subtitle2">{cat.label}</Typography>
                                                  <Typography variant="caption" color="text.secondary">
                                                       {cat.value}
                                                  </Typography>
                                             </Box>
                                             <Stack direction="row" spacing={0.5}>
                                                  <IconButton
                                                       size="small"
                                                       onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditDialog('main', cat.id, cat.label);
                                                       }}
                                                  >
                                                       <EditIcon fontSize="small" />
                                                  </IconButton>
                                                  <IconButton
                                                       size="small"
                                                       color="error"
                                                       onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete('main', cat.id);
                                                       }}
                                                  >
                                                       <DeleteIcon fontSize="small" />
                                                  </IconButton>
                                             </Stack>
                                        </Box>
                                   ))}
                              </Stack>
                         </Stack>
                    </Card>

                    {/* ─── Column 2: Mid Categories ──────────────────────────── */}
                    <Card sx={{ p: 2, height: 'fit-content', opacity: selectedMainId ? 1 : 0.4 }}>
                         <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                   <Box>
                                        <Typography variant="h6">Srednje kategorije</Typography>
                                        {selectedMainLabel && (
                                             <Typography variant="caption" color="text.secondary">
                                                  za: {selectedMainLabel}
                                             </Typography>
                                        )}
                                   </Box>
                                   <Button
                                        variant="contained"
                                        size="small"
                                        disabled={!selectedMainId}
                                        onClick={() => openCreateDialog('mid')}
                                   >
                                        Dodaj
                                   </Button>
                              </Stack>
                              <Divider />
                              {!selectedMainId ? (
                                   <Typography variant="body2" color="text.secondary">
                                        Izaberite glavnu kategoriju.
                                   </Typography>
                              ) : filteredMid.length === 0 ? (
                                   <Typography variant="body2" color="text.secondary">
                                        Nema srednjih kategorija.
                                   </Typography>
                              ) : (
                                   <Stack spacing={1}>
                                        {filteredMid.map((cat) => (
                                             <Box
                                                  key={cat.id}
                                                  onClick={() => setSelectedMidId(cat.id)}
                                                  sx={{
                                                       display: 'flex',
                                                       alignItems: 'center',
                                                       justifyContent: 'space-between',
                                                       border: '1px solid',
                                                       borderColor: selectedMidId === cat.id ? 'primary.main' : 'divider',
                                                       backgroundColor: selectedMidId === cat.id ? 'primary.50' : 'transparent',
                                                       borderRadius: 1,
                                                       px: 1.5,
                                                       py: 1,
                                                       cursor: 'pointer',
                                                       transition: 'all 0.15s',
                                                       '&:hover': {
                                                            borderColor: 'primary.main',
                                                       },
                                                  }}
                                             >
                                                  <Box>
                                                       <Typography variant="subtitle2">{cat.label}</Typography>
                                                       <Typography variant="caption" color="text.secondary">
                                                            {cat.value}
                                                       </Typography>
                                                  </Box>
                                                  <Stack direction="row" spacing={0.5}>
                                                       <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 openEditDialog('mid', cat.id, cat.label);
                                                            }}
                                                       >
                                                            <EditIcon fontSize="small" />
                                                       </IconButton>
                                                       <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 handleDelete('mid', cat.id);
                                                            }}
                                                       >
                                                            <DeleteIcon fontSize="small" />
                                                       </IconButton>
                                                  </Stack>
                                             </Box>
                                        ))}
                                   </Stack>
                              )}
                         </Stack>
                    </Card>

                    {/* ─── Column 3: Sub Categories ──────────────────────────── */}
                    <Card sx={{ p: 2, height: 'fit-content', opacity: selectedMidId ? 1 : 0.4 }}>
                         <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                   <Box>
                                        <Typography variant="h6">Podkategorije</Typography>
                                        {selectedMidLabel && (
                                             <Typography variant="caption" color="text.secondary">
                                                  za: {selectedMidLabel}
                                             </Typography>
                                        )}
                                   </Box>
                                   <Button
                                        variant="contained"
                                        size="small"
                                        disabled={!selectedMidId}
                                        onClick={() => openCreateDialog('sub')}
                                   >
                                        Dodaj
                                   </Button>
                              </Stack>
                              <Divider />
                              {!selectedMidId ? (
                                   <Typography variant="body2" color="text.secondary">
                                        Izaberite srednju kategoriju.
                                   </Typography>
                              ) : filteredSub.length === 0 ? (
                                   <Typography variant="body2" color="text.secondary">
                                        Nema podkategorija.
                                   </Typography>
                              ) : (
                                   <Stack spacing={1}>
                                        {filteredSub.map((cat) => (
                                             <Box
                                                  key={cat.id}
                                                  sx={{
                                                       display: 'flex',
                                                       alignItems: 'center',
                                                       justifyContent: 'space-between',
                                                       border: '1px solid',
                                                       borderColor: 'divider',
                                                       borderRadius: 1,
                                                       px: 1.5,
                                                       py: 1,
                                                  }}
                                             >
                                                  <Box>
                                                       <Typography variant="subtitle2">{cat.label}</Typography>
                                                       <Typography variant="caption" color="text.secondary">
                                                            {cat.value}
                                                       </Typography>
                                                  </Box>
                                                  <Stack direction="row" spacing={0.5}>
                                                       <IconButton
                                                            size="small"
                                                            onClick={() => openEditDialog('sub', cat.id, cat.label)}
                                                       >
                                                            <EditIcon fontSize="small" />
                                                       </IconButton>
                                                       <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete('sub', cat.id)}
                                                       >
                                                            <DeleteIcon fontSize="small" />
                                                       </IconButton>
                                                  </Stack>
                                             </Box>
                                        ))}
                                   </Stack>
                              )}
                         </Stack>
                    </Card>
               </Box>

               {/* ─── Create / Edit Dialog ────────────────────────────────────────── */}
               <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>
                         {editingId ? `Izmeni ${levelLabel} kategoriju` : `Dodaj ${levelLabel} kategoriju`}
                    </DialogTitle>
                    <DialogContent dividers>
                         <Stack spacing={2} sx={{ mt: 1, minWidth: 320 }}>
                              <TextField
                                   label="Naziv"
                                   value={dialogLabel}
                                   onChange={(e) => setDialogLabel(e.target.value)}
                                   fullWidth
                                   autoFocus
                              />
                              <Stack direction="row" spacing={2} justifyContent="flex-end">
                                   <Button color="inherit" onClick={() => setDialogOpen(false)}>
                                        Odustani
                                   </Button>
                                   <Button variant="contained" onClick={handleSave}>
                                        {editingId ? 'Sačuvaj' : 'Dodaj'}
                                   </Button>
                              </Stack>
                         </Stack>
                    </DialogContent>
               </Dialog>
          </>
     );
};
