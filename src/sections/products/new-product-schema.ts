import * as yup from 'yup';
import { IProduct } from './products-table';

export const newProductSchema = () => yup.object().shape({
     name: yup
          .string()
          .required('Product name is required'),
     description: yup
          .string()
          .required('Product description is required'),
     mainCategory: yup
          .string()
          .required('Main category is required'),
     midCategory: yup
          .string(),
     subCategory: yup
          .string(),
     availableStock: yup
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
     quantityUnit: yup
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
          .number()
});

export const initialValues: IProduct = {
     name: '',
     description: '',
     mainCategory: '',
     midCategory: '',
     subCategory: '',
     availableStock: 0,
     ingredients: '',
     instructions: '',
     quantity: 0,
     manufacturer: '',
     manufacturerURL: '',
     warning: '',
     imageURL: '',
     price: '',
     newArrival: false,
     bestSeller: false,
     discount: false,
     isActive: true,
     discountAmount: 0,
     quantityUnit: ''
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

export const manufacturerOptions = [
     {
          label: 'Abela Pharm',
          value: 'abela-pharm',
     },
     {
          label: 'Alpen Pharma doo',
          value: 'alpen-pharma-doo',
     },
     {
          label: 'Alpenkrauter',
          value: 'alpenkrauter',
     },
     {
          label: 'Amer',
          value: 'amer',
     },
     {
          label: 'Aronica',
          value: 'aronica',
     },
     {
          label: 'Azeta bio',
          value: 'azeta-bio',
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
          label: 'Bioguard',
          value: 'bioguard',
     },
     {
          label: 'Bioteo',
          value: 'bioteo',
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
          label: 'Dimas',
          value: 'dimas',
     },
     {
          label: 'DMG',
          value: 'dmg',
     },
     {
          label: 'Dr. Werner Pharma',
          value: 'dr-werner-pharma',
     },
     {
          label: 'Eco boom',
          value: 'eco-boom',
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
          label: 'Fitaky',
          value: 'fitaky',
     },
     {
          label: 'For Natural',
          value: 'for-natural',
     },
     {
          label: 'Galenika',
          value: 'galenika',
     },
     {
          label: 'Gamarde',
          value: 'gamarde',
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
          label: 'Gloria',
          value: 'gloria',
     },
     {
          label: 'Granum',
          value: 'granum',
     },
     {
          label: 'Hedera Vita',
          value: 'hedera-vita',
     },
     {
          label: 'Health & more',
          value: 'health-and-more',
     },
     {
          label: 'Herbalab',
          value: 'herbalab',
     },
     {
          label: 'Herbs honey',
          value: 'herbs-honey',
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
          label: 'LV-Pharm',
          value: 'lv-pharm',
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
          label: 'Meli Plants',
          value: 'meli-plants',
     },
     {
          label: 'Moj caj',
          value: 'moj-caj',
     },
     {
          label: 'Mustela',
          value: 'mustela',
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
          label: 'Nemet Palic',
          value: 'nemet-palic',
     },
     {
          label: 'Now Foods',
          value: 'now-foods',
     },
     {
          label: 'NTC Pharma',
          value: 'ntc-pharma',
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
          label: 'Pharmaceuticals',
          value: 'pharmaceuticals',
     },
     {
          label: 'Phyto',
          value: 'phyto',
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
          label: 'Pure Hristina Lazarević',
          value: 'pure-hristina-lazarevic',
     },
     {
          label: 'RabenHorst',
          value: 'rabenhorst',
     },
     {
          label: 'Rhinosan',
          value: 'rhinosan',
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
          label: 'Salus',
          value: 'salus',
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
          label: 'Suplemania',
          value: 'suplemania',
     },
     {
          label: 'Todoxin',
          value: 'todoxin',
     },
     {
          label: 'Vedra',
          value: 'vedra',
     },
     {
          label: 'VitalGrana',
          value: 'vitalgrana',
     },
     {
          label: 'Viviscal',
          value: 'viviscal',
     },
     {
          label: 'Weleda',
          value: 'weleda',
     },
     {
          label: 'Zao prirodna šminka',
          value: 'zao-prirodna-sminka',
     },
     {
          label: 'Zodeks caj',
          value: 'zodeks-caj',
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

