import React, { useState } from 'react';
import { useFormik } from 'formik';
import { TextField, Typography, Button, Checkbox, FormControlLabel, Box, Input, Card, CardContent, Grid, MenuItem, Stack, Container, IconButton, CardActionArea } from '@mui/material';
import { Form, Formik, FormikErrors, FormikTouched } from 'formik';
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { newProductSchema } from './new-product-schema'
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import Image from 'next/image';

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
          label: 'Kosa, koža i nokti',
          value: 'kosa-koza-nokti',
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

export const subCategoryOptions = [
     {
          label: 'Obrisi polje',
          value: '',
     },
     {
          label: 'Kapsule i tablete',
          value: 'kapsule-i-tablete',
     },
     {
          label: 'Sprejevi za nos',
          value: 'sprejevi-za-nos',
     },
     {
          label: 'Masti, gelovi',
          value: 'masti-gelovi',
     },
     {
          label: 'Irigacioni set',
          value: 'irigacioni-set',
     },
     {
          label: 'Folna kiselina i vitamini',
          value: 'folna-kiselina-i-vitamini',
     },
     {
          label: 'Biljni preparati',
          value: 'biljni-preparati',
     },
     {
          label: 'Preparati gvožđa',
          value: 'preparati-gvozdja',
     },
     {
          label: 'Bol u grlu',
          value: 'bol-u-grlu',
     },
     {
          label: 'Menstrualni bolovi',
          value: 'menstrualni-bolovi',
     },
     {
          label: 'Bolovi u zglobovima i mišićima',
          value: 'bolovi-u-zglobovima-i-misicima',
     },
     {
          label: 'Oralni preparati',
          value: 'oralni-preparati',
     },
     {
          label: 'Lokalna primena',
          value: 'lokalna-primena',
     },
     {
          label: 'Platforma',
          value: 'platforma',
     },
     {
          label: 'omega-masne-kiseline',
          value: 'Omega masne kiseline',
     },
     {
          label: 'Ostalo',
          value: 'ostalo',
     },
     {
          label: 'Deca',
          value: 'deca',
     },
     {
          label: 'Vitamini i minerali',
          value: 'vitamini-i-minerali',
     },
     {
          label: 'Sprejevi za nos',
          value: 'sprejevi-za-nos',
     },
     {
          label: 'Sprejevi za grlo',
          value: 'sprejevi-za-grlo',
     },
     {
          label: 'Irigacioni set',
          value: 'irigacioni-set',
     },
     {
          label: 'Masti, gelovi',
          value: 'masti-gelovi',
     },
     {
          label: 'Biljne kapi',
          value: 'biljne-kapi',
     },
     {
          label: 'Med, matični mleč i propolis',
          value: 'med-maticni-mlec-i-propolis',
     },
     {
          label: 'Pastile za grlo',
          value: 'pastile-za-grlo',
     },
     {
          label: 'Aloja, ehinacea, noni, aronija',
          value: 'aloja-ehinacea-noni-aronija',
     },
     {
          label: 'Probiotici',
          value: 'probiotici',
     },
     {
          label: 'Omega masne kiseline',
          value: 'omega-masne-kiseline',
     },
     {
          label: 'Primena na koži',
          value: 'primena-na-kozi',
     },
     {
          label: 'Kaše',
          value: 'kase',
     },
     {
          label: 'Šejkovi',
          value: 'sejkovi',
     },
     {
          label: 'Zaslađivači',
          value: 'zasladjivaci',
     },
     {
          label: 'Sportisti',
          value: 'sportisti',
     },
     {
          label: 'Bombone',
          value: 'bombone',
     },
     {
          label: 'Dehidratacija',
          value: 'dehidratacija',
     },
     {
          label: 'Dijareja',
          value: 'dijareja',
     },
     {
          label: 'Mučnina',
          value: 'mucnina',
     },
     {
          label: 'Auto apoteka',
          value: 'auto-apoteka',
     },
     {
          label: 'Nadutost i gasovi',
          value: 'nadutost-i-gasovi',
     },
     {
          label: 'Zatvor',
          value: 'zatvor',
     },
     {
          label: 'Dijareja',
          value: 'dijareja',
     },
     {
          label: 'Otezano varenje i gorusica',
          value: 'otezano-varenje-i-gorusica',
     },
     {
          label: 'Vitamin A',
          value: 'vitamin-a',
     },
     {
          label: 'Vitamin B',
          value: 'vitamin-b',
     },
     {
          label: 'Vitamin C',
          value: 'vitamin-c',
     },
     {
          label: 'Vitamin D',
          value: 'vitamin-d',
     },
     {
          label: 'Vitamin K',
          value: 'vitamin-k',
     },
     {
          label: 'Cink',
          value: 'cink',
     },
     {
          label: 'Kalijum',
          value: 'kalijum',
     },
     {
          label: 'Kalcijum',
          value: 'kalcijum',
     },
     {
          label: 'Hrom',
          value: 'hrom',
     },
     {
          label: 'Magnezijum',
          value: 'magnezijum',
     },
     {
          label: 'Selen',
          value: 'selen',
     },
     {
          label: 'Gvožđe',
          value: 'gvozdje',
     },
     {
          label: 'Bakar',
          value: 'bakar',
     },
     {
          label: 'Bor',
          value: 'bor',
     },
     {
          label: 'Fluor',
          value: 'fluor',
     },
     {
          label: 'Fosfor',
          value: 'fosfor',
     },
     {
          label: 'Kompleksi vitamina i minerala',
          value: 'kompleksi-vitamina-i-minerala',
     },
     {
          label: 'Riblja ulja',
          value: 'riblja-ulja',
     },
     {
          label: 'Trudnice',
          value: 'trudnice',
     },
     {
          label: 'Stariji',
          value: 'stariji',
     },
     {
          label: 'Iritacije',
          value: 'iritacije',
     },
     {
          label: 'Ožiljci i strije',
          value: 'oziljci-i-strije',
     },
     {
          label: 'hemoroidi',
          value: 'Hemoroidi',
     },
     {
          label: 'Problemi sa cirkulacijom',
          value: 'problemi-sa-cirkulacijom',
     },
     {
          label: 'Intimna nega',
          value: 'intimna-nega',
     },

     {
          label: 'Opekotine',
          value: 'opekotine',
     },
     {
          label: 'Sportske povrede',
          value: 'sportske-povrede',
     },
     {
          label: 'Reuma',
          value: 'reuma',
     },
     {
          label: 'Antiseptici',
          value: 'antiseptici',
     },
     {
          label: 'Gljivice',
          value: 'gljivice',
     },
     {
          label: 'Vitiligo',
          value: 'vitiligo',
     },
     {
          label: 'Boginje',
          value: 'boginje',
     },
     {
          label: 'Herpes',
          value: 'herpes',
     },
     {
          label: 'Seboreični dermatitis',
          value: 'seboreicni-dermatitis',
     },
     {
          label: 'Žuljevi, kurje oči, bradavice',
          value: 'zuljevi-kurje-oci-bradavice',
     },
     {
          label: ' Ekcem, psorijaza',
          value: 'ekcem-psorijaza',
     },
     {
          label: 'Suva, atopijska koža',
          value: 'suva-atopijska-koza',
     },
     {
          label: 'Lokalni anestetici',
          value: 'lokalni-anestetici',
     },
     {
          label: 'Površinske rane',
          value: 'povrsinske-rane',
     },
     {
          label: 'Tablete, kapsule, rastvori',
          value: 'tablete-kapsule-rastvori',
     },
     {
          label: ' Higijena, nega',
          value: 'higijena-nega',
     },
     {
          label: 'Kapi',
          value: 'kapi',
     },
     {
          label: 'Čepovi za uši',
          value: 'cepovi-za-usi',
     },
     {
          label: 'Sprejevi',
          value: 'sprejevi',
     },
     {
          label: 'Antiseptici',
          value: 'antiseptici',
     },
     {
          label: 'Flasteri',
          value: 'flasteri',
     },
     {
          label: 'Zavojni materijal',
          value: 'zavojni-materijal',
     },
];

const manufacturerOptions = [
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

// const handleFileUpload = async (file) => {
//           return new Promise(async (resolve, reject) => {
//                     try {
//                               const formData = new FormData();
//                               formData.append('file', file);

//                               const response = await fetch('/api/image-api', {
//                                         method: 'POST',
//                                         body: formData,
//                               });

//                               if (!response.ok) {
//                                         throw new Error('Failed to upload file');
//                               }

//                               const data = await response.json();
//                               resolve(data);
//                     } catch (error) {
//                               reject(error);
//                     }
//           });
// };

export const AddProductForm = ({ onSubmitSuccess, onSubmitFail }) => {

     const router = useRouter();
     const [selectedFile, setSelectedFile] = useState(null);
     const [selectedImage, setSelectedImage] = useState(null);
     const [uploadState, setUploadState] = useState("initial");



     const handleResetClick = (event) => {
          setSelectedImage(null);
          setUploadState("initial");
     };

     const handleSubmit = async (values) => {

          try {

               // if (selectedFile) {
               //           handleFileUpload(selectedFile)
               //                     .then((data) => {
               //                               console.log('File uploaded successfully:', data);
               //                     })
               //                     .catch((error) => {
               //                               console.error('Error uploading file:', error);
               //                     });
               // }

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

     const handleImageChange = (event) => {

     };

     const handleFileRemove = () => {
          setSelectedImage(null);
     }

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
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.midCategory && !!formik.errors.midCategory}
                                        helperText={formik.touched.midCategory && formik.errors.midCategory}
                                        value={formik.values.midCategory}
                                   >
                                        {midCategoryOptions.map((option) => (
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
                                        label="Sub kategorija"
                                        name="subCategory"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        select
                                        error={formik.touched.subCategory && !!formik.errors.subCategory}
                                        helperText={formik.touched.subCategory && formik.errors.subCategory}
                                        value={formik.values.subCategory}
                                   >
                                        {subCategoryOptions.map((option) => (
                                             <MenuItem
                                                  key={option.value}
                                                  value={option.value}
                                             >
                                                  {option.label}
                                             </MenuItem>
                                        ))}
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

                                   {/* <Container maxWidth="md"
                                                                                sx={{ mt: 1, borderRadius: '5px', height: '300px', border: '1px solid red' }}>
                                                                                <Stack >
                                                                                          <IconButton
                                                                                                    onClick={handleResetClick}
                                                                                                    color="primary"
                                                                                                    aria-label="upload picture"
                                                                                                    component="label"
                                                                                                    display="flex"

                                                                                          >
                                                                                                    <input hidden={true}
                                                                                                              accept="image/*"
                                                                                                              type="file"
                                                                                                              onChange={({ target }) => {
                                                                                                                        const file = target.files[0]
                                                                                                                        setSelectedImage(URL.createObjectURL(file))
                                                                                                                        setSelectedFile(file)
                                                                                                              }}
                                                                                                    />
                                                                                                    {
                                                                                                              selectedImage ?
                                                                                                                        <CardActionArea
                                                                                                                                  sx={{ border: '1px solid green', width: 'auto' }}>
                                                                                                                                  <Image
                                                                                                                                            src={selectedImage}
                                                                                                                                            width={150}
                                                                                                                                            height={200}
                                                                                                                                            alt="LOGO" />
                                                                                                                        </CardActionArea>
                                                                                                                        :
                                                                                                                        <PhotoCamera />
                                                                                                    }

                                                                                          </IconButton>

                                                                                </Stack>

                                                                      </Container> */}
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

                                                  {
                                                       selectedImage ?
                                                            <Image src={selectedImage}
                                                                 alt='sds'
                                                                 width={300}
                                                                 height={300}
                                                                 style={{
                                                                      borderRadius: '10px',
                                                                      cursor: 'pointer'
                                                                 }}
                                                                 onClick={() => handleFileRemove()}
                                                            />
                                                            :
                                                            <InsertPhotoIcon
                                                                 color='primary'
                                                                 sx={{ width: '300px', height: '300px' }}
                                                            />
                                                  }

                                                  <Button component="label"
                                                       variant="contained"
                                                       startIcon={<CloudUploadIcon />}
                                                       sx={{
                                                            maxWidth: '150px'
                                                       }}

                                                  >
                                                       Ucitaj sliku
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
                                                            onInput={(e) => {
                                                                 const file = e.target.files[0]; // Get the first selected file
                                                                 if (file) {
                                                                      const reader = new FileReader();
                                                                      reader.onload = (e) => {
                                                                           setSelectedImage(e.target.result);
                                                                           formik.setFieldValue('imageURL', e.target.result)
                                                                      };

                                                                      reader.readAsDataURL(file);
                                                                 }
                                                            }
                                                            }
                                                       />
                                                  </Button>

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