import * as yup from 'yup';
import { ProductDraft } from '../../schemas/product';

export const newProductSchema = () => yup.object().shape({
     name: yup
          .string()
          .required('Naziv proizvoda je obavezan'),
     description: yup
          .string()
          .required('Opis proizvoda je obavezan'),
     main_category: yup
          .string()
          .required('Glavna kategorija je obavezna'),
     mid_category: yup
          .string(),
     sub_category: yup
          .string(),
     available_stock: yup
          .number()
          .required('Stanje na lageru je obavezno'),
     ingredients: yup
          .string()
          .required('Sastojci su obavezni'),
     instructions: yup
          .string()
          .required('Instrukcije su obavezne'),
     quantity: yup
          .string()
          .required('Količina je obavezna'),
     quantity_unit: yup
          .string()
          .required('Jedinica mere je obavezna'),
     manufacturer_id: yup
          .string()
          .required('Proizvođač je obavezan'),
     warning: yup
          .string()
          .required('Upozorenje je obavezno'),
     price: yup
          .number()
          .required('Cena je obavezna'),
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
     available_stock: 1,
     ingredients: '',
     instructions: '',
     quantity: 1,
     manufacturer_id: '',
     manufacturer_url: '',
     warning: '',
     image_url: '',
     price: 1,
     new_arrival: false,
     best_seller: false,
     discount: false,
     is_active: true,
     display_on_home: false,
     discount_amount: 0,
     quantity_unit: ''
};

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

