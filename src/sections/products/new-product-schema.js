import * as yup from 'yup';

export const newProductSchema = () => yup.object().shape({
          name: yup
                    .string()
                    .required('Product name is required'),
          description: yup
                    .string()
                    .required('Product description is required'),
          mainCategory: yup
                    .string(),
          midCategory: yup
                    .string(),
          subCategory: yup
                    .string(),
          availableStock: yup
                    .number()
                    .required('Available stock is required'),
          ingedients: yup
                    .string()
                    .required('Product ingedients is required'),
          instructions: yup
                    .string()
                    .required('Product instructions is required'),
          quantity: yup
                    .string()
                    .required('Product quantity is required'),
          manufacturer: yup
                    .string()
                    .required('Product manufacturer is required'),
          warning: yup
                    .string()
                    .required('Product warning is required'),
          imageURL: yup
                    .string()
                    .required('Product imageURL is required'),
          price: yup
                    .number()
                    .required('Product price is required'),
          newArrival: yup
                    .boolean(),
          bestSeller: yup
                    .boolean(),
          discount: yup
                    .boolean(),
          discountAmmount: yup
                    .number()
});
