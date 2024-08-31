export type ICustomer = {
     _id: string;
     avatar: string;
     email: string;
     name: string;
     streetAddress: string;
     city: string;
     proviceState?: string;
     country: string;
     phoneNumber: string;
     emailVerified: Date;
     gender: 'male' | 'female'
};