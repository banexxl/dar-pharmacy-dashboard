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
     InputAdornment,
     MenuItem,
     Stack,
     TextField,
     Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
     const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

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

     const isMidSelectDisabled = !selectedMainId || filteredMid.length === 0;
     const isSubSelectDisabled = !selectedMidId || filteredSub.length === 0;

     // ── Cascading select handlers ───────────────────────────────────────────────
     const handleMainSelectChange = (event: any) => {
          const value = event.target.value || null;
          setSelectedMainId(value);
          setSelectedMidId(null);
          setSelectedSubId(null);
     };

     const handleMidSelectChange = (event: any) => {
          const value = event.target.value || null;
          setSelectedMidId(value);
          setSelectedSubId(null);
     };

     const handleSubSelectChange = (event: any) => {
          const value = event.target.value || null;
          setSelectedSubId(value);
     };

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
                         setSelectedSubId(null);
                    }
               } else if (level === 'mid') {
                    setMidCategories((prev) => prev.filter((c) => c.id !== id));
                    setSubCategories((prev) => prev.filter((s) => s.mid_category_id !== id));
                    if (selectedMidId === id) {
                         setSelectedMidId(null);
                         setSelectedSubId(null);
                    }
               } else {
                    setSubCategories((prev) => prev.filter((c) => c.id !== id));
                    if (selectedSubId === id) {
                         setSelectedSubId(null);
                    }
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

     const levelLabel = dialogLevel === 'main' ? 'glavnu' : dialogLevel === 'mid' ? 'srednju' : 'pod';

     return (
          <>
               <Card sx={{ p: 2 }}>
                    <Stack spacing={2}>
                         {/* ─── Main category ─────────────────────────────────────── */}
                         <TextField
                              select
                              fullWidth
                              label="Glavna kategorija"
                              value={selectedMainId ?? ''}
                              onChange={handleMainSelectChange}
                              size="small"
                              helperText={mainCategories.length === 0 ? 'Nema kategorija.' : ' '}
                              slotProps={{
                                   select: {
                                        renderValue: (value: unknown) => mainCategories.find((c) => c.id === value)?.label ?? '',
                                   },
                                   input: {
                                        endAdornment: (
                                             <InputAdornment position="end" sx={{ mr: 2 }}>
                                                  <IconButton
                                                       size="small"
                                                       color="primary"
                                                       onClick={(e) => {
                                                            e.stopPropagation();
                                                            openCreateDialog('main');
                                                       }}
                                                       onMouseDown={(e) => e.stopPropagation()}
                                                       title="Dodaj glavnu kategoriju"
                                                  >
                                                       <AddIcon fontSize="small" />
                                                  </IconButton>
                                             </InputAdornment>
                                        ),
                                   },
                              }}
                         >
                                   <MenuItem value="">
                                        <em>Izaberite...</em>
                                   </MenuItem>
                                   {mainCategories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                                                  <Typography variant="body2" noWrap>{cat.label}</Typography>
                                                  <Stack direction="row" spacing={0.5} flexShrink={0}>
                                                       <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 openEditDialog('main', cat.id, cat.label);
                                                            }}
                                                            title="Izmeni"
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
                                                            title="Obriši"
                                                       >
                                                            <DeleteIcon fontSize="small" />
                                                       </IconButton>
                                                  </Stack>
                                             </Box>
                                        </MenuItem>
                                   ))}
                         </TextField>

                         <Divider />

                         {/* ─── Mid category ───────────────────────────────────────── */}
                         <TextField
                              select
                              fullWidth
                              label="Srednja kategorija"
                              value={selectedMidId ?? ''}
                              onChange={handleMidSelectChange}
                              disabled={isMidSelectDisabled}
                              size="small"
                              helperText={!selectedMainId ? 'Izaberite glavnu kategoriju.' : filteredMid.length === 0 ? 'Nema srednjih kategorija.' : ' '}
                              slotProps={{
                                   select: {
                                        renderValue: (value: unknown) => filteredMid.find((c) => c.id === value)?.label ?? '',
                                   },
                                   input: {
                                        endAdornment: (
                                             <InputAdornment position="end" sx={{ mr: 2 }}>
                                                  <IconButton
                                                       size="small"
                                                       color="primary"
                                                       disabled={!selectedMainId}
                                                       onClick={(e) => {
                                                            e.stopPropagation();
                                                            openCreateDialog('mid');
                                                       }}
                                                       onMouseDown={(e) => e.stopPropagation()}
                                                       title="Dodaj srednju kategoriju"
                                                  >
                                                       <AddIcon fontSize="small" />
                                                  </IconButton>
                                             </InputAdornment>
                                        ),
                                   },
                              }}
                         >
                                   <MenuItem value="">
                                        <em>Izaberite...</em>
                                   </MenuItem>
                                   {filteredMid.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                                                  <Typography variant="body2" noWrap>{cat.label}</Typography>
                                                  <Stack direction="row" spacing={0.5} flexShrink={0}>
                                                       <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 openEditDialog('mid', cat.id, cat.label);
                                                            }}
                                                            title="Izmeni"
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
                                                            title="Obriši"
                                                       >
                                                            <DeleteIcon fontSize="small" />
                                                       </IconButton>
                                                  </Stack>
                                             </Box>
                                        </MenuItem>
                                   ))}
                         </TextField>

                         <Divider />

                         {/* ─── Sub category ───────────────────────────────────────── */}
                         <TextField
                              select
                              fullWidth
                              label="Podkategorija"
                              value={selectedSubId ?? ''}
                              onChange={handleSubSelectChange}
                              disabled={isSubSelectDisabled}
                              size="small"
                              helperText={!selectedMidId ? 'Izaberite srednju kategoriju.' : filteredSub.length === 0 ? 'Nema podkategorija.' : ' '}
                              slotProps={{
                                   select: {
                                        renderValue: (value: unknown) => filteredSub.find((c) => c.id === value)?.label ?? '',
                                   },
                                   input: {
                                        endAdornment: (
                                             <InputAdornment position="end" sx={{ mr: 2 }}>
                                                  <IconButton
                                                       size="small"
                                                       color="primary"
                                                       disabled={!selectedMidId}
                                                       onClick={(e) => {
                                                            e.stopPropagation();
                                                            openCreateDialog('sub');
                                                       }}
                                                       onMouseDown={(e) => e.stopPropagation()}
                                                       title="Dodaj podkategoriju"
                                                  >
                                                       <AddIcon fontSize="small" />
                                                  </IconButton>
                                             </InputAdornment>
                                        ),
                                   },
                              }}
                         >
                                   <MenuItem value="">
                                        <em>Izaberite...</em>
                                   </MenuItem>
                                   {filteredSub.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                                                  <Typography variant="body2" noWrap>{cat.label}</Typography>
                                                  <Stack direction="row" spacing={0.5} flexShrink={0}>
                                                       <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 openEditDialog('sub', cat.id, cat.label);
                                                            }}
                                                            title="Izmeni"
                                                       >
                                                            <EditIcon fontSize="small" />
                                                       </IconButton>
                                                       <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 handleDelete('sub', cat.id);
                                                            }}
                                                            title="Obriši"
                                                       >
                                                            <DeleteIcon fontSize="small" />
                                                       </IconButton>
                                                  </Stack>
                                             </Box>
                                        </MenuItem>
                                   ))}
                         </TextField>
                    </Stack>
               </Card>

               {/* ─── Create / Edit Dialog ────────────────────────────────────────── */}
               <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    fullWidth
                    PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, m: { xs: 2, sm: 3 } } }}
               >
                    <DialogTitle>
                         {editingId ? `Izmeni ${levelLabel} kategoriju` : `Dodaj ${levelLabel} kategoriju`}
                    </DialogTitle>
                    <DialogContent dividers>
                         <Stack spacing={2} sx={{ mt: 1 }}>
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
