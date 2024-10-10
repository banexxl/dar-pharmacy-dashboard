import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import XIcon from '@untitled-ui/icons-react/build/esm/X';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import { FileDropzone } from '@/components/file-dropzone';
import toast from 'react-hot-toast';


interface FileUploaderProps {
  onClose?: () => void;
  open?: boolean;
  refresh?: () => void
}

export const FileUploader: FC<FileUploaderProps> = (props) => {
  const { onClose, refresh, open = false } = props;
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    setFiles([]);
  }, [open]);

  const handleDrop = useCallback((newFiles: File[]): void => {
    setFiles((prevFiles) => {
      return [...prevFiles, ...newFiles];
    });
  }, []);

  const handleRemove = useCallback((file: any): void => {
    setFiles((prevFiles) => {
      return prevFiles.filter((_file: any) => _file.path !== file.path);
    });
  }, []);

  const handleRemoveAll = useCallback((): void => {
    setFiles([]);
  }, []);

  // Handle multiple file uploads
  const handleUploadFiles = async (files: File[]) => {
    if (!files || files.length === 0) {
      toast.error('Morate izabrati fajlove za upload!');
      return;
    }

    try {
      // Get the 'putanja' parameter from the URL (current folder path)
      const queryParams = new URLSearchParams(window.location.search);
      const putanja = queryParams.get('putanja'); // Get 'putanja' parameter

      // Loop through each file and upload
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Construct the full file path for AWS
        const fullFilePath = putanja
          ? `${putanja}/${file.name}` // Combine 'putanja' with file name
          : `${file.name}`; // Default case if 'putanja' is not present

        // Read the file content as binary
        const fileContent = await file.arrayBuffer(); // Convert file to binary format

        const response = await fetch('/api/aws/aws-s3-file-storage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name, // File name
            folderPath: fullFilePath, // Full path including folder and file name
            fileContent: Array.from(new Uint8Array(fileContent)), // Send file content as array
            type: 'file', // Specify the type as 'file'
          }),
        });

        if (!response.ok) {
          toast.error(`Greška prilikom dodavanja fajla ${file.name}!`);
          throw new Error(`Greška prilikom dodavanja fajla ${file.name}!`);
        } else {
          toast.success(`Fajl ${file.name} je uspešno dodat!`);
          onClose?.()
          if (refresh) {
            refresh()
          }
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Greška prilikom dodavanja fajlova!');
    } finally {
      // Close the modal after files are uploaded
      onClose
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
    >
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="space-between"
        spacing={3}
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h6">Odabir datoteka</Typography>
        <IconButton
          color="inherit"
          onClick={onClose}
        >
          <SvgIcon>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </Stack>
      <DialogContent>
        <FileDropzone
          accept={{ '*/*': [] }}
          caption="Maksimalna veličina datoteke je 5MB"
          files={files}
          onDrop={handleDrop}
          onRemove={handleRemove}
          onRemoveAll={handleRemoveAll}
          onUpload={() => {
            handleUploadFiles(files);
            onClose
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

FileUploader.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  refresh: PropTypes.func,
};
