import type { ChangeEvent, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Upload01Icon from '@untitled-ui/icons-react/build/esm/Upload01';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
// import { fileManagerApi } from 'src/api/file-manager';
import { useDialog } from 'src/hooks/use-dialog';
import { useMounted } from 'src/hooks/use-mounted';
// import { useSettings } from 'src/hooks/use-settings';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { ItemSearch } from '@/sections/file-manager/item-search';
import { ItemList } from '@/sections/file-manager/item-list';
import { StorageStats } from '@/sections/file-manager/storage-stats';
import { ItemDrawer } from '@/sections/file-manager/item-drawer';
import { FileUploader } from '@/sections/file-manager/file-uploader';
import { Item } from '@/schemas/file-manager';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import toast from 'react-hot-toast';

type View = 'grid' | 'list';

interface Filters {
  query?: string;
}

type SortDir = 'asc' | 'desc';

interface ItemsSearchState {
  filters: Filters;
  page: number;
  rowsPerPage: number;
  sortBy?: string;
  sortDir?: SortDir;
}

const useItemsSearch = () => {
  const [state, setState] = useState<ItemsSearchState>({
    filters: {
      query: undefined,
    },
    page: 0,
    rowsPerPage: 9,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const handleFiltersChange = useCallback((filters: Filters): void => {
    setState((prevState) => ({
      ...prevState,
      filters,
    }));
  }, []);

  const handleSortChange = useCallback((sortDir: SortDir): void => {
    setState((prevState) => ({
      ...prevState,
      sortDir,
    }));
  }, []);

  const handlePageChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | null, page: number): void => {
      setState((prevState) => ({
        ...prevState,
        page,
      }));
    },
    []
  );

  const handleRowsPerPageChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
    }));
  }, []);

  return {
    handleFiltersChange,
    handleSortChange,
    handlePageChange,
    handleRowsPerPageChange,
    state,
  };
};

interface ItemsStoreState {
  items: Item[];
  itemsCount: number;
}

const useItemsStore = (searchState: ItemsSearchState) => {
  const isMounted = useMounted();
  const [state, setState] = useState<ItemsStoreState>({
    items: [],
    itemsCount: 0,
  });

  const handleItemsGet = useCallback(async () => {
    try {
      const response = await fetch('/api/aws/aws-s3-file-storage');
      const s3Data = await response.json();
      console.log('useItemsStore -> s3Data', s3Data);

      if (isMounted()) {
        // Separate folders and files
        const folders = s3Data.folders;
        const files = s3Data.items;

        // Directly slice the items based on pagination
        setState({
          items: [...folders, ...files].slice(
            searchState.page * searchState.rowsPerPage,
            (searchState.page + 1) * searchState.rowsPerPage
          ),
          itemsCount: [...folders, ...files].length,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [searchState, isMounted]);


  useEffect(() => {
    handleItemsGet();
  }, [handleItemsGet]);

  const handleDelete = useCallback((itemId: string): void => {
    setState((prevState) => {
      return {
        ...prevState,
        items: prevState.items.filter((item) => item.id !== itemId),
      };
    });
  }, []);

  const handleFavorite = useCallback((itemId: string, value: boolean): void => {
    setState((prevState) => {
      return {
        ...prevState,
        items: prevState.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              isFavorite: value,
            };
          }

          return item;
        }),
      };
    });
  }, []);

  return {
    handleDelete,
    handleFavorite,
    ...state,
  };
};

const useCurrentItem = (items: Item[], itemId?: string): Item | undefined => {
  return useMemo((): Item | undefined => {
    if (!itemId) {
      return undefined;
    }

    return items.find((item) => item.id === itemId);
  }, [items, itemId]);
};

const Page = () => {
  // const settings = useSettings();
  const itemsSearch = useItemsSearch();
  const itemsStore = useItemsStore(itemsSearch.state);
  console.log('Page -> itemsStore', itemsStore);

  const [view, setView] = useState<View>('grid');
  const uploadDialog = useDialog();
  const detailsDialog = useDialog();
  const currentItem = useCurrentItem(itemsStore.items, detailsDialog.data);
  const [openCreateFileModal, setOpenCreateFileModal] = useState(false);
  const [folderName, setFolderName] = useState('');

  // Handle opening the modal
  const handleOpenCreateFileModal = () => {
    setOpenCreateFileModal(true);
  };

  // Handle closing the modal
  const handleCloseCreateFileModal = () => {
    setOpenCreateFileModal(false);
    setFolderName(''); // Reset the field when closing
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!folderName) {
      toast.error('Naziv foldera je obavezan!');
      return;
    }

    try {
      // Get the current URL path
      const currentPath = window.location.pathname;

      // Extract the folder structure after '/dashboard/datoteke'
      const rootPath = '/dashboard/datoteke';
      const folderStructure = currentPath.startsWith(rootPath)
        ? currentPath.replace(rootPath, '').trim() // Remove the root path and trim any spaces
        : '';

      // Construct the full folder path for AWS
      const fullFolderPath = folderStructure
        ? `${folderStructure}/${folderName}` // Add the folder name to the existing structure
        : folderName; // If there's no folder structure, just use the folder name

      const response = await fetch('/api/aws/aws-s3-file-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: fullFolderPath }), // Send the full folder path
      });
      if (!response.ok) {
        toast.error('Greška prilikom kreiranja foldera!');
        throw new Error('Greška prilikom kreiranja foldera!');
      } else if (response.ok) {
        toast.success('Folder uspešno kreiran!');
      }
    } catch (error) {
      toast.error('Greška prilikom kreiranja foldera!');
    } finally {
      handleCloseCreateFileModal(); // Close modal after submission
    }
  };


  const handleDelete = useCallback(
    (itemId: string): void => {
      // This can be triggered from multiple places, ensure drawer is closed.
      detailsDialog.handleClose();
      itemsStore.handleDelete(itemId);
    },
    [detailsDialog, itemsStore]
  );

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container
        // maxWidth={settings.stretch ? false : 'xl'}
        >
          <Grid
            container
            spacing={{
              xs: 3,
              lg: 4,
            }}
          >
            <Grid xs={12}>
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={4}
              >
                <div>
                  <Typography variant="h4">File Manager</Typography>
                </div>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={2}
                >
                  <Button
                    onClick={uploadDialog.handleOpen}
                    startIcon={
                      <SvgIcon>
                        <Upload01Icon />
                      </SvgIcon>
                    }
                    variant="contained"
                  >
                    Učitaj datoteku
                  </Button>
                  <Button
                    onClick={handleOpenCreateFileModal}
                    startIcon={
                      <SvgIcon>
                        <CreateNewFolderIcon />
                      </SvgIcon>
                    }
                    variant="contained"
                  >
                    Novi folder
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid
              xs={12}
              md={8}
            >
              <Stack
                spacing={{
                  xs: 3,
                  lg: 4,
                }}
              >
                <ItemSearch
                  onFiltersChange={itemsSearch.handleFiltersChange}
                  onSortChange={itemsSearch.handleSortChange}
                  onViewChange={setView}
                  sortBy={itemsSearch.state.sortBy}
                  sortDir={itemsSearch.state.sortDir}
                  view={view}
                />
                <ItemList
                  count={itemsStore.itemsCount}
                  items={itemsStore.items}
                  onDelete={handleDelete}
                  onFavorite={itemsStore.handleFavorite}
                  onOpen={detailsDialog.handleOpen}
                  onPageChange={itemsSearch.handlePageChange}
                  onRowsPerPageChange={itemsSearch.handleRowsPerPageChange}
                  page={itemsSearch.state.page}
                  rowsPerPage={itemsSearch.state.rowsPerPage}
                  view={view}
                />
              </Stack>
            </Grid>
            <Grid
              xs={12}
              md={4}
            >
              <StorageStats />
            </Grid>
          </Grid>
        </Container>
      </Box>
      <ItemDrawer
        item={currentItem}
        onClose={detailsDialog.handleClose}
        onDelete={handleDelete}
        onFavorite={itemsStore.handleFavorite}
        open={detailsDialog.open}
      />
      <FileUploader
        onClose={uploadDialog.handleClose}
        open={uploadDialog.open}
      />
      <Dialog open={openCreateFileModal} onClose={handleCloseCreateFileModal} sx={{ height: '300px' }}>
        <DialogTitle>Dodavanje datoteke</DialogTitle>
        <DialogContent>
          <TextField
            label="Naziv datoteke"
            fullWidth
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)} // Update state on input change
            autoFocus
            sx={{ mt: '5px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateFileModal} color="primary">
            Odustani
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Page.getLayout = (page: any) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

