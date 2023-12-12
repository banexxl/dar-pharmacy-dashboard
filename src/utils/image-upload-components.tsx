import { generateComponents } from "@uploadthing/react";

import type { OurFileRouter } from "../pages/api/upload-image-api";

export const { UploadButton, UploadDropzone, Uploader } =
     generateComponents<OurFileRouter>();