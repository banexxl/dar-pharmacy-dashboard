import * as yup from 'yup';
import { ProductDraft } from '../../schemas/product';

export const newProductSchema = () => yup.object().shape({
     name: yup
          .string()
          .required('Product name is required'),
     description: yup
          .string()
          .required('Product description is required'),
     main_category: yup
          .string()
          .required('Main category is required'),
     mid_category: yup
          .string(),
     sub_category: yup
          .string(),
     available_stock: yup
          .number()
          .required('Available stock is required'),
     ingredients: yup
          .string()
          .required('Product ingedients is required'),
     instructions: yup
          .string()
          .required('Product instructions is required'),
     quantity: yup
          .string()
          .required('Product quantity is required'),
     quantity_unit: yup
          .string()
          .required('Product quantity unit is required'),
     manufacturer: yup
          .string()
          .required('Product manufacturer is required'),
     warning: yup
          .string()
          .required('Product warning is required'),
     // imageURL: yup
     //           .string()
     //           .required('Product imageURL is required'),
     price: yup
          .number()
          .required('Product price is required'),
     newArrival: yup
          .boolean(),
     isActive: yup
          .boolean(),
     bestSeller: yup
          .boolean(),
     discount: yup
          .boolean(),
     discountAmmount: yup
          .number(),
     displayOnHome: yup
          .boolean()
});

export const initialValues: ProductDraft = {
     name: '',
     description: '',
     main_category: '',
     mid_category: '',
     sub_category: '',
     available_stock: 0,
     ingredients: '',
     instructions: '',
     quantity: 0,
     manufacturer_id: '',
     manufacturer_url: '',
     warning: '',
     image_url: '',
     price: 0,
     new_arrival: false,
     best_seller: false,
     discount: false,
     is_active: true,
     display_on_home: false,
     discount_amount: 0,
     quantity_unit: ''
};

export const mainCategoryOptions = [
     {
          label: 'Obriši polje',
          value: '',
     },
     {
          label: 'Apoteka',
          value: 'apoteka',
     },
     {
          label: 'Bebi pelene',
          value: 'bebi-pelene',
     },
     {
          label: 'Bebi prirodna kozmetika',
          value: 'bebi-prirodna-kozmetika',
     },
     {
          label: 'Biljne tinkture',
          value: 'biljne-tinkture',
     },
     {
          label: 'Čišćenje organizma',
          value: 'ciscenje-organizma',
     },
     {
          label: 'Domaci prirodni melemi',
          value: 'domaci-prirodni-melemi',
     },
     {
          label: 'Guščija mast',
          value: 'guscija-mast',
     },
     {
          label: 'Homeopatija',
          value: 'homeopatija',
     },
     {
          label: 'Imunitet za decu',
          value: 'imunitet-za-decu',
     },
     {
          label: 'Kolagen',
          value: 'kolagen',
     },
     {
          label: 'Ledene Kocke za imunitet',
          value: 'ledene-kocke-za-imunitet',
     },
     {
          label: 'Mast od Jazavca',
          value: 'mast-od-jazavca',
     },
     {
          label: 'Prirodna kozmetika',
          value: 'prirodna-kozmetika',
     },
     {
          label: 'Prirodni imunitet',
          value: 'prirodni-imunitet',
     },
     {
          label: 'Proizvodi za žene',
          value: 'proizvodi-za-zene',
     },
     {
          label: 'Ruska apoteka',
          value: 'ruska-apoteka',
     },
     {
          label: 'Suplemania',
          value: 'suplemania',
     },
     {
          label: 'Ulja za masažu',
          value: 'ulja-za-masazu',
     },
     {
          label: 'Zao prirodna šminka',
          value: 'zao-prirodna-sminka',
     },
];

export const midCategoryOptions = [
     {
          label: 'Obriši polje',
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

export type QuantityUnit =
     'briketa' | 'flastera' |
     'g' | 'kapsula' |
     'kesica' | 'komad' |
     'komada' | 'kompresa' |
     'ledenih kocki' | 'mg' |
     'ml' | 'tableta'

export const quantityUnitOptions = [
     {
          label: 'Obriši polje',
          value: '',
     },
     {
          label: 'briketa',
          value: 'briketa',
     },
     {
          label: 'flastera',
          value: 'flastera',
     },
     {
          label: 'g',
          value: 'g',
     },
     {
          label: 'kapsula',
          value: 'kapsula',
     },
     {
          label: 'kesica',
          value: 'kesica',
     },
     {
          label: 'komad',
          value: 'komad',
     },
     {
          label: 'komada',
          value: 'komada',
     },
     {
          label: 'kompresa',
          value: 'kompresa',
     },
     {
          label: 'ledenih kocki',
          value: 'ledenih kocki',
     },
     {
          label: 'mg',
          value: 'mg',
     },
     {
          label: 'ml',
          value: 'ml',
     },
     {
          label: 'tableta',
          value: 'tableta',
     },
]

