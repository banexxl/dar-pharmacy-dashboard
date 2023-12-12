import React, { useState } from 'react';
import { useFormik } from 'formik';
import { TextField, Typography, Button, Checkbox, FormControlLabel, Box, Input, Card, CardContent, Grid, MenuItem, Stack, Container, IconButton, CardActionArea } from '@mui/material';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { newProductSchema } from './new-product-schema'
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import Swal from 'sweetalert2'
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Image from 'next/image';
import { LoadingButton } from '@mui/lab';
import { getSignedURL } from "../../pages/api/actions"

const initialValues = {
     name: '',
     description: '',
     mainCategory: '',
     midCategory: '',
     subCategory: '',
     availableStock: '',
     ingredients: '',
     instructions: '',
     quantity: '',
     manufacturer: '',
     warning: '',
     imageURL: '',
     price: '',
     newArrival: false,
     bestSeller: false,
     discount: false,
     discountAmount: 0,
};

export const mainCategoryOptions = [
     {
          label: 'Obrisi polje',
          value: '',
     },
     {
          label: 'Apoteka',
          value: 'apoteka',
     },
     {
          label: 'Prirodna kozmetika',
          value: 'prirodna-kozmetika',
     },
     {
          label: 'Bebi prirodna kozmetika',
          value: 'bebi-prirodna-kozmetika',
     },
     {
          label: 'Kolagen',
          value: 'kolagen',
     },
     {
          label: 'Suplementi',
          value: 'suplementi',
     },
     {
          label: 'Ledene Kocke za imunitet',
          value: 'ledene-kocke-za-imunitet',
     },
     {
          label: 'Prirodni imunitet',
          value: 'prirodni-imunitet',
     },

];

export const midCategoryOptions = [
     {
          label: 'Obrisi polje',
          value: '',
     },
     {
          label: 'Alergije',
          value: 'alergije',
     },
     {
          label: 'Anemija',
          value: 'anemija',
     },
     {
          label: 'Bol',
          value: 'bol',
     },
     {
          label: 'Hemoroidi',
          value: 'hemoroidi',
     },
     {
          label: 'Holesterol i trigliceridi',
          value: 'holesterol-i-trigliceridi',
     },
     {
          label: 'Imunitet, prehlada',
          value: 'imunitet-prehlada',
     },
     {
          label: 'Kosa, koža i nokti',
          value: 'kosa-koza-i-nokti',
     },
     {
          label: 'Kosti i zglobovi',
          value: 'kosti-i-zglobovi',
     },
     {
          label: 'Mršavljenje, celulit',
          value: 'mrsavljenje-celulit',
     },
     {
          label: 'Posebna ishrana',
          value: 'posebna-ishrana',
     },
     {
          label: 'Putna apoteka',
          value: 'putna-apoteka',
     },
     {
          label: 'Stomačne tekobe',
          value: 'stomacne-tekobe',
     },
     {
          label: 'Zdravo srce i cirkulacija',
          value: 'zdravo-srce-i-cirkulacija',
     },
     {
          label: 'Vitamini i mineralni',
          value: 'vitamini-i-minerali',
     },
     {
          label: 'Preparati za primenu na koži',
          value: 'preparati-za-primenu-na-kozi',
     },
     {
          label: 'Oči i uši',
          value: 'oci-i-usi',
     },
     {
          label: 'Prva pomoć',
          value: 'prva-pomoc',
     },
     {
          label: 'Energija i umor',
          value: 'energija-i-umor',
     },
     {
          label: 'Sokovi',
          value: 'sokovi',
     },
     {
          label: 'Antioksidansi i detoksikacija',
          value: 'antioksidansi-i-detoksikacija',
     },
     {
          label: 'Biljne kapi, biljna i eterična ulja',
          value: 'biljne-kapi-biljna-i-etericna-ulja',
     },
     {
          label: 'Bubrezi i mokraćni putevi',
          value: 'bubrezi-i-mokracni-putevi',
     },

     {
          label: 'Čajevi',
          value: 'cajevi',
     },
     {
          label: 'Dijabetes i insulinska resistencija',
          value: 'dijabetes-i-insulinska-resistencija',
     },
     {
          label: 'Jetra i žuč',
          value: 'jetra-i-zuc',
     },
     {
          label: 'Kašalj',
          value: 'kasalj',
     },
     {
          label: 'PMS',
          value: 'pms',
     },
     {
          label: 'Menopauza',
          value: 'menopauza',
     },
     {
          label: 'Odvikavanje od alkohola',
          value: 'odvikavanje-od-alkohola',
     },
     {
          label: 'Pamćenje i koncentracija',
          value: 'pamcenje-i-koncentracija',
     },
     {
          label: 'Poremećaj fertiliteta',
          value: 'poremecaj-fertiliteta',
     },
     {
          label: 'Prostata i potencija',
          value: 'prostata-i-potencija',
     },
     {
          label: 'Stres, depresija, nesanica',
          value: 'stres-depresija-nesanica',
     },
     {
          label: 'Dozatori i sekači za lekove',
          value: 'dozatori-i-sekaci-za-lekove',
     },
];

export const manufacturerOptions = [
     {
          label: 'ALPENKRAUTER',
          value: 'alpenkrauter',
     },
     {
          label: 'Abela Pharm',
          value: 'abela-pharm',
     },
     {
          label: 'Alpen Pharma doo',
          value: 'alpen-pharma-doo',
     },
     {
          label: 'Amer',
          value: 'amer',
     },
     {
          label: 'Bach Flower Remedies',
          value: 'bach-flower-remedies',
     },
     {
          label: 'Bajkal',
          value: 'bajkal',
     },
     {
          label: 'Beopanax d.o.o.',
          value: 'beopanax-doo',
     },
     {
          label: 'Bio Solutions',
          value: 'bio-solutions',
     },
     {
          label: 'Catalysis S.L.',
          value: 'catalysis-sl',
     },
     {
          label: 'Colloid',
          value: 'colloid',
     },
     {
          label: 'Cortex Labs',
          value: 'cortex-labs',
     },
     {
          label: 'DMG',
          value: 'dmg',
     },
     {
          label: 'Dimas',
          value: 'dimas',
     },
     {
          label: 'Dr. Werner Pharma',
          value: 'dr-werner-pharma',
     },
     {
          label: 'Fantastik fungi',
          value: 'fantastik-fungi',
     },
     {
          label: 'Farma Derma',
          value: 'farma-derma',
     },
     {
          label: 'Farmas MN',
          value: 'farmas-mn',
     },
     {
          label: 'GRANUM',
          value: 'granum',
     },
     {
          label: 'Galenika',
          value: 'galenika',
     },
     {
          label: 'Gana kozmetika',
          value: 'gana-kozmetika',
     },
     {
          label: 'Gavez',
          value: 'gavez',
     },
     {
          label: 'Herbalab',
          value: 'herbalab',
     },
     {
          label: 'Himalaya',
          value: 'himalaya',
     },
     {
          label: 'Innventa pharm',
          value: 'innventa-pharm',
     },
     {
          label: 'LAMA',
          value: 'lama',
     },
     {
          label: 'LV-Pharm',
          value: 'lv-pharm',
     },
     {
          label: 'Laboratorie ACM, France',
          value: 'laboratorie-acm-france',
     },
     {
          label: 'Laboratories NATIVE, France',
          value: 'laboratories-native-france',
     },
     {
          label: 'Lander',
          value: 'lander',
     },
     {
          label: 'Magni Food',
          value: 'magni-food',
     },
     {
          label: 'Majana',
          value: 'majana',
     },
     {
          label: 'MaxMedica',
          value: 'maxmedica',
     },
     {
          label: 'Medical Plants',
          value: 'medical-plants',
     },
     {
          label: 'Moj caj',
          value: 'moj-caj',
     },
     {
          label: 'NEMET PALIC',
          value: 'nemet-palic',
     },
     {
          label: 'NTC Pharma',
          value: 'ntc-pharma',
     },
     {
          label: 'Natural Way',
          value: 'natural-way',
     },
     {
          label: 'NaturalWealth',
          value: 'naturalwealth',
     },
     {
          label: 'Now Foods',
          value: 'now-foods',
     },
     {
          label: 'OKP',
          value: 'okp',
     },
     {
          label: 'OlimpSport',
          value: 'olimpsport',
     },
     {
          label: 'Pharma Medica',
          value: 'pharma-medica',
     },
     {
          label: 'PharmaDevelopment',
          value: 'pharmadevelopment',
     },
     {
          label: 'Plantacare',
          value: 'plantacare',
     },
     {
          label: 'Priroda na dar',
          value: 'priroda-na-dar',
     },
     {
          label: 'RHINOSAN',
          value: 'rhinosan',
     },
     {
          label: 'RabenHorst',
          value: 'rabenhorst',
     },
     {
          label: 'Rulek',
          value: 'rulek',
     },
     {
          label: 'Ruska Biljna Apoteka Organic',
          value: 'ruska-biljna-apoteka-organic',
     },
     {
          label: 'Shulke',
          value: 'shulke',
     },
     {
          label: 'Sofija',
          value: 'sofija',
     },
     {
          label: 'VitalGrana',
          value: 'vitalgrana',
     },
     {
          label: 'Weleda',
          value: 'weleda',
     },
     {
          label: 'Zodeks caj',
          value: 'zodeks-caj',
     },
     {
          label: 'Gloria',
          value: 'gloria',
     },
     {
          label: 'Azeta bio',
          value: 'azeta-bio',
     },
     {
          label: 'Gamarde',
          value: 'gamarde',
     },
     {
          label: 'Fitaky',
          value: 'fitaky',
     },
     {
          label: 'Mustela',
          value: 'mustela',
     },
     {
          label: 'Phyto',
          value: 'phyto',
     },
     {
          label: 'Priroda na dar',
          value: 'priroda-na-dar',
     },
     {
          label: 'Eco boom',
          value: 'eco-boom',
     },
     {
          label: 'Weleda',
          value: 'weleda',
     },
     {
          label: 'Herbs honey',
          value: 'herbs-honey',
     },
     {
          label: 'Vedra',
          value: 'vedra',
     },
];

export const fetchSubCategoryOptions = async (selectedMidCategory) => {

     switch (selectedMidCategory) {
          case 'alergije':
               return [
                    { option: 'kapsule-i-tablete', label: 'Kapsule i tablete' },
                    { option: 'sprejevi-za-nos', label: 'Sprejevi za nos' },
                    { option: 'irigacioni-set', label: 'Irigacioni set' },
                    { option: 'masti-gelovi', label: 'Masti i gelovi' }
               ];
          case 'anemija':
               return [
                    { value: 'folna-kiselina-i-vitamini', label: 'Folna kiselina i vitamini' },
                    { value: 'biljni-preparati', label: 'Biljni preparati' },
                    { value: 'preparati-gvozdja', label: 'Preparati gvožđa' }
               ];
          case 'bol':
               return [
                    { value: 'bol-u-grlu', label: 'Bol u grlu' },
                    { value: 'menstrualni-bolovi', label: 'Menstrualni bolovi' },
                    { value: 'bolovi-u-zglobovima-i-misicima', label: 'Bolovi u zglobovima i mišićima' }
               ];
          case 'hemoroidi':
               return [
                    { value: 'oralni-preparati', label: 'Oralni preparati' },
                    { value: 'lokalna-primena', label: 'Lokalna primena' },
                    { value: 'platforma', label: 'Platforma' }
               ];
          case 'holesterol-i-trigliceridi':
               return [
                    { value: 'omega-masne-kiseline', label: 'Omega masne kiseline' },
                    { value: 'ostalo', label: 'Ostalo' }
               ];
          case 'imunitet-prehlada':
               return [
                    { value: 'deca', label: 'Deca' },
                    { value: 'vitemini-i-minerali', label: 'Vitamini i minerali' },
                    { value: 'sprejevi-za-nos', label: 'Sprejevi za nos' },
                    { value: 'sprejevi-za-grlo', label: 'Sprejevi za grlo' },
                    { value: 'irigacioni-set', label: 'Irigacioni set' },
                    { value: 'masti-gelovi', label: 'Masti i gelovi' },
                    { value: 'biljne-kapi', label: 'Biljne kapi' },
                    { value: 'med-maticni-mlec-i-propolis', label: 'Med, matični mleč i propolis' },
                    { value: 'pastile-za-grlo', label: 'Pastile za grlo' },
                    { value: 'aloja-ehinacea-noni-aronija', label: 'Aloja, ehinacea, noni, aronija' },
                    { value: 'probiotici', label: 'Probiotici' },
                    { value: 'omega-masne-kiseline', label: 'Omega masne kiseline' },
                    { value: 'ostalo', label: 'Ostalo' }
               ];
          case 'kosa-koza-i-nokti':
               return [
                    { value: 'oralni-preparati', label: 'Oralni preparati' },
                    { value: 'lokalna-primena', label: 'Lokalna primena' }
               ];
          case 'kosti-i-zglobovi':
               return [
                    { value: 'oralni-preparati', label: 'Oralni preparati' },
                    { value: 'primena-na-kozi', label: 'Primena na koži' }
               ];
          case 'mrsavljenje-celulit':
               return [
                    { value: 'oralni-preparati', label: 'Oralni preparati' },
                    { value: 'primena-na-kozi', label: 'Primena na koži' }
               ];
          case 'posebna-ishrana':
               return [
                    { value: 'kase', label: 'Kase' },
                    { value: 'sejkovi', label: 'Sejkovi' },
                    { value: 'sportisti', label: 'Sportisti' },
                    { value: 'zasladjivaci', label: 'Zaslađivači' },
                    { value: 'bombone', label: 'Bombone' }
               ];
          case 'putna-apoteka':
               return [
                    { value: 'dehidratacija', label: 'Dehidratacija' },
                    { value: 'dijareja', label: 'Dijareja' },
                    { value: 'mucnina', label: 'Mučnina' },
                    { value: 'auto-apoteka', label: 'Auto-apoteka' }
               ];
          case 'stomacne-tegobe':
               return [
                    { value: 'nadutost-i-gasovi', label: 'Nadutost i gasovi' },
                    { value: 'zatvor', label: 'Zatvor' },
                    { value: 'dijareja', label: 'Dijareja' },
                    { value: 'iritabilni-kolon', label: 'Iritabilni kolon' },
                    { value: 'otezano-varenje-i-gorusica', label: 'Otežano varenje i gorušica' }
               ];
          case 'zdravo-srce-i-cirkulacija':
               return [
                    { value: 'oralni-preparati', label: 'Oralni preparati' },
                    { value: 'primena-na-kozi', label: 'Primena na koži' }
               ];
          case 'vitamini-i-minerali':
               return [
                    { value: 'vitamin-a', label: 'Vitamin A' },
                    { value: 'vitamin-b', label: 'Vitamin B' },
                    { value: 'vitamin-c', label: 'Vitamin C' },
                    { value: 'vitamin-d', label: 'Vitamin D' },
                    { value: 'vitamin-k', label: 'Vitamin K' },
                    { value: 'cink', label: 'Cink' },
                    { value: 'kalijum', label: 'Kalijum' },
                    { value: 'kalcijum', label: 'Kalcijum' },
                    { value: 'hrom', label: 'Hrom' },
                    { value: 'magnezijum', label: 'Magnezijum' },
                    { value: 'selen', label: 'Selen' },
                    { value: 'gvozdje', label: 'Gvožđe' },
                    { value: 'bakar', label: 'Bakar' },
                    { value: 'bor', label: 'Bor' },
                    { value: 'fluor', label: 'Fluor' },
                    { value: 'fosfor', label: 'Fosfor' },
                    { value: 'kompleksi-vitamina-i-minerala', label: 'Kompleksi vitamina i minerala' },
                    { value: 'riblja-ulja', label: 'Riblja ulja' },
                    { value: 'deca', label: 'Deca' },
                    { value: 'sportisiti', label: 'Sportisti' },
                    { value: 'trudnice', label: 'Trudnice' },
                    { value: 'stariji', label: 'Stariji' }
               ];
          case 'preparati-za-primenu-na-kozi':
               return [
                    { value: 'iritacije', label: 'Iritacije' },
                    { value: 'oziljci-i-strije', label: 'Ožiljci i strije' },
                    { value: 'hemoroidi', label: 'Hemoroidi' },
                    { value: 'problemi-sa-cirkulacijom', label: 'Problemi sa cirkulacijom' },
                    { value: 'intimna-nega', label: 'Intimna nega' },
                    { value: 'opekotine', label: 'Opekotine' },
                    { value: 'sportske-povrede', label: 'Sportske povrede' },
                    { value: 'reuma', label: 'Reuma' },
                    { value: 'antiseptici', label: 'Antiseptici' },
                    { value: 'gljivice', label: 'Gljivice' },
                    { value: 'rozacea', label: 'Rozacea' },
                    { value: 'vitiligo', label: 'Vitiligo' },
                    { value: 'boginje', label: 'Boginje' },
                    { value: 'herpes', label: 'Herpes' },
                    { value: 'seboreicni-dermatitis', label: 'Seboreični dermatitis' },
                    { value: 'zuljevi-kurje-oci-bradavice', label: 'Žuljevi, kurje oči, bradavice' },
                    { value: 'ekcem-psorijaza', label: 'Ekcem, psorijaza' },
                    { value: 'suva-atopijska-koza', label: 'Suva, atopijska koža' },
                    { value: 'lokalni-anestetici', label: 'Lokalni anestetici' },
                    { value: 'povrsinske-rane', label: 'Površinske rane' }
               ];
          case 'oci-i-usi':
               return [
                    { value: 'tablete-kapsule-rastvori', label: 'Tablete, kapsule, rastvori' },
                    { value: 'higijena-nega', label: 'Higijena i nega' },
                    { value: 'kapi', label: 'Kapi' },
                    { value: 'masti', label: 'Masti' },
                    { value: 'naocare', label: 'Naočare' },
                    { value: 'tecnosti-i-kutije-za-sociva', label: 'Tečnosti i kutije za sočiva' },
                    { value: 'cepovi-za-usi', label: 'Čepovi za uši' },
                    { value: 'sprejevi', label: 'Sprejevi' }
               ];
          case 'prva-pomoc':
               return [
               ];
          default:
               return [];
     }
};

export const AddProductForm = ({ onSubmitSuccess, onSubmitFail }) => {

     const router = useRouter();
     const [selectedFile, setSelectedFile] = useState(null);
     const [fileURL, setFileURL] = useState(null)
     const [loading, setLoading] = useState(false)
     const [subCategoryOptions, setSubCategoryOptions] = useState([]);
     const [isSubCategoryEnabled, setIsSubCategoryEnabled] = useState(false);

     const computeSHA256 = async (file) => {
          console.log(file);
          const buffer = await file.arrayBuffer()
          const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
          return hashHex
     }

     const handleSubmit = async (values) => {

          try {
               const responseValues = await fetch('/api/product-api', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json',
                         'Access-Control-Allow-Origin': '*',
                         'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' // Set the content type to JSON
                    },
                    body: JSON.stringify(values),
               });

               if (responseValues.ok) {

                    onSubmitSuccess();

                    Swal.fire({
                         icon: 'success',
                         title: 'Success',
                         text: 'Product added!',
                    })
                    router.push('/products')
               } else {
                    onSubmitFail()
                    const errorData = await response.json(); // Parse the error response
                    console.error(errorData);
                    Swal.fire({
                         icon: 'error',
                         title: 'Oops...',
                         text: 'Something went wrong!',
                    })
               }

          } catch (err) {
               console.error(err);
               Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong!',
               })
          }
     }

     const handleMidCategoryChange = async (event) => {
          const selectedMidCategory = event.target.value;

          // Fetch subcategory options based on the selected midCategory
          const subCategories = await fetchSubCategoryOptions(selectedMidCategory);

          setSubCategoryOptions(subCategories);

          // Enable/disable subCategory field based on midCategory selection
          setIsSubCategoryEnabled(!!selectedMidCategory);

     };

     const handleFileUpload = async (file) => {
          console.log(file);
          const signedURLResult = await getSignedURL({
               fileSize: file.size,
               fileType: file.type,
               checksum: await computeSHA256(file),
          })
          if (signedURLResult.failure !== undefined) {
               throw new Error(signedURLResult.failure)
          }
          const { url } = signedURLResult.success
          await fetch(url, {
               method: "PUT",
               headers: {
                    "Content-Type": file.type,
               },
               body: file,
          }).then((response) => {
               console.log(response)
               setLoading(false)
          })

          const fileUrl = url.split("?")[0]
          return fileUrl
     }

     const handleFileRemove = () => {
          setSelectedFile(null); // Remove the selected file
     };

     const handleFileChange = (e) => {
          const file = e.target.files?.[0] ?? null
          setSelectedFile(file)
          if (fileURL) {
               URL.revokeObjectURL(fileURL)
          }
          if (file) {
               const url = URL.createObjectURL(file)
               setFileURL(url)
          } else {
               setFileURL(null)
          }
     };

     return (
          <Box>
               <Formik
                    initialValues={initialValues}
                    onSubmit={(values) => {
                         handleSubmit(values)
                    }}
                    validationSchema={newProductSchema()}>
                    {
                         (formik) => (
                              <Form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                   {/* <Typography>
                                                                                {`${ JSON.stringify(formik.errors) }`}
                                                                      </Typography> */}
                                   <TextField
                                        label="Naziv"
                                        name="name"
                                        value={formik.values.name}
                                        onChange={formik.handleChange}
                                        error={formik.touched.name && !!formik.errors.name}
                                        helperText={formik.touched.name && formik.errors.name}
                                   />
                                   <TextField
                                        label="Opis"
                                        name="description"
                                        multiline
                                        rows={4}
                                        value={formik.values.description}
                                        onChange={formik.handleChange}
                                        error={formik.touched.description && !!formik.errors.description}
                                        helperText={formik.touched.description && formik.errors.description}
                                   />

                                   <TextField
                                        fullWidth
                                        label="Glavna kategorija"
                                        name="mainCategory"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.mainCategory && !!formik.errors.mainCategory}
                                        helperText={formik.touched.mainCategory && formik.errors.mainCategory}
                                        value={formik.values.mainCategory}
                                   >
                                        {mainCategoryOptions.map((option) => (
                                             <MenuItem
                                                  key={option.value}
                                                  value={option.value}
                                             >
                                                  {option.label}
                                             </MenuItem>
                                        ))}
                                   </TextField>

                                   <TextField
                                        fullWidth
                                        label="Mid kategorija"
                                        name="midCategory"
                                        onBlur={formik.handleBlur}
                                        onChange={(event) => {
                                             formik.handleChange(event); // Update formik values
                                             handleMidCategoryChange(event); // Call custom function to handle midCategory change
                                        }}
                                        select
                                        error={formik.touched.midCategory && !!formik.errors.midCategory}
                                        helperText={formik.touched.midCategory && formik.errors.midCategory}
                                        value={formik.values.midCategory}
                                   >
                                        {midCategoryOptions.map((option) => (
                                             <MenuItem key={option.value} value={option.value}>
                                                  {option.label}
                                             </MenuItem>
                                        ))}
                                   </TextField>

                                   <TextField
                                        fullWidth
                                        label="Sub kategorija"
                                        name="subCategory"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.subCategory && !!formik.errors.subCategory}
                                        helperText={formik.touched.subCategory && formik.errors.subCategory}
                                        value={formik.values.subCategory}
                                        disabled={!isSubCategoryEnabled}
                                   >
                                        {subCategoryOptions ?
                                             subCategoryOptions.map((option) =>
                                             (
                                                  <MenuItem key={option.value} value={option.value}>
                                                       {option.label}
                                                  </MenuItem>
                                             ))
                                             :
                                             <MenuItem key={'no-category'}>
                                                  Nema sub kategorije
                                             </MenuItem>
                                        }
                                   </TextField>

                                   <TextField
                                        label="Na stanju komada"
                                        name="availableStock"
                                        value={formik.values.availableStock}
                                        onChange={formik.handleChange}
                                        error={formik.touched.availableStock && !!formik.errors.availableStock}
                                        helperText={formik.touched.availableStock && formik.errors.availableStock}
                                   />

                                   <TextField
                                        label="Sastojci"
                                        name="ingredients"
                                        value={formik.values.ingredients}
                                        onChange={formik.handleChange}
                                        error={formik.touched.ingredients && !!formik.errors.ingredients}
                                        helperText={formik.touched.ingredients && formik.errors.ingredients}
                                   />

                                   <TextField
                                        label="Instrukcije"
                                        name="instructions"
                                        value={formik.values.instructions}
                                        onChange={formik.handleChange}
                                        error={formik.touched.instructions && !!formik.errors.instructions}
                                        helperText={formik.touched.instructions && formik.errors.instructions}
                                   />

                                   <TextField
                                        label="Kolicina"
                                        name="quantity"
                                        value={formik.values.quantity}
                                        onChange={formik.handleChange}
                                        error={formik.touched.quantity && !!formik.errors.quantity}
                                        helperText={formik.touched.quantity && formik.errors.quantity}
                                   />

                                   <TextField
                                        fullWidth
                                        label="Proizvodjac"
                                        name="manufacturer"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.manufacturer && !!formik.errors.manufacturer}
                                        helperText={formik.touched.manufacturer && formik.errors.manufacturer}
                                        value={formik.values.manufacturer}
                                   >
                                        {manufacturerOptions.map((option) => (
                                             <MenuItem
                                                  key={option.value}
                                                  value={option.value}
                                             >
                                                  {option.label}
                                             </MenuItem>
                                        ))}
                                   </TextField>

                                   <TextField
                                        label="Upozorenje"
                                        name="warning"
                                        value={formik.values.warning}
                                        onChange={formik.handleChange}
                                        error={formik.touched.warning && !!formik.errors.warning}
                                        helperText={formik.touched.warning && formik.errors.warning}
                                   />

                                   <Card>
                                        <CardContent>
                                             <Box
                                                  sx={{
                                                       display: 'flex',
                                                       flexDirection: 'column',
                                                       alignItems: 'center',
                                                       gap: '10px'
                                                  }}
                                             >
                                                  {selectedFile ? (
                                                       <Image
                                                            src={fileURL}
                                                            alt='Uploaded Image'
                                                            width={300}
                                                            height={300}
                                                            style={{
                                                                 borderRadius: '10px',
                                                                 cursor: 'pointer'
                                                            }}
                                                            onClick={handleFileRemove}
                                                       />
                                                  ) : (
                                                       <InsertPhotoIcon
                                                            color='primary'
                                                            sx={{ width: '300px', height: '300px' }}
                                                       />
                                                  )}
                                                  <Button
                                                       component="label"
                                                       variant="contained"
                                                       startIcon={<AttachFileIcon />}
                                                       sx={{
                                                            maxWidth: '150px'
                                                       }}
                                                       disabled={selectedFile}
                                                  >
                                                       Izaberi sliku
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
                                                            onChange={handleFileChange}
                                                       />
                                                  </Button>
                                                  {
                                                       selectedFile ?
                                                            <LoadingButton
                                                                 loading={loading}
                                                                 loadingIndicator={<CircularProgress />}
                                                                 component="label"
                                                                 variant="contained"
                                                                 startIcon={<CloudUploadIcon />}
                                                                 sx={{
                                                                      width: '250px',
                                                                      height: '60px'
                                                                 }}
                                                                 onClick={() => handleFileUpload(selectedFile)}
                                                            >
                                                                 Upload slike
                                                            </LoadingButton>
                                                            : null
                                                  }
                                             </Box>
                                        </CardContent>
                                   </Card>
                                   <TextField
                                        label="Cena"
                                        name="price"
                                        value={formik.values.price}
                                        onChange={formik.handleChange}
                                        error={formik.touched.price && !!formik.errors.price}
                                        helperText={formik.touched.price && formik.errors.price}
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="newArrival"
                                                  checked={formik.values.newArrival}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        label="Novi proizvod"
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="bestSeller"
                                                  checked={formik.values.bestSeller}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        label="Najprodavaniji"
                                   />

                                   <FormControlLabel
                                        control={
                                             <Checkbox
                                                  name="discount"
                                                  checked={formik.values.discount}
                                                  onChange={formik.handleChange}
                                             />
                                        }
                                        label="Popust"
                                   />

                                   <TextField
                                        label="Iznos popusta"
                                        name="discountAmount"
                                        value={formik.values.discountAmount}
                                        onChange={formik.handleChange}
                                   />

                                   <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                        <Button
                                             variant="contained"
                                             color="primary"
                                             onClick={() => onSubmitFail()}
                                        >
                                             Odustani
                                        </Button>
                                        <Button type="submit"
                                             variant="contained"
                                             color="primary"
                                             disabled={Object.keys(formik.errors).length != 0}
                                        >
                                             Dodaj proizvod
                                        </Button>
                                   </Box>
                              </Form>
                         )
                    }
               </Formik >
          </Box >
     );
};