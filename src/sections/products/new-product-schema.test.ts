import { describe, it, expect } from 'vitest';
import { newProductSchema, initialValues } from './new-product-schema';

describe('newProductSchema', () => {
     const schema = newProductSchema();

     const validProduct = {
          name: 'Test Proizvod',
          description: 'Opis test proizvoda',
          main_category: 'apoteka',
          mid_category: 'alergije',
          sub_category: 'kapsule-i-tablete',
          available_stock: 10,
          ingredients: 'Vitamin C, Cink',
          instructions: 'Uzimati 1 dnevno',
          quantity: '30',
          quantity_unit: 'kapsula',
          manufacturer_id: 'some-uuid',
          warning: 'Čuvati van domašaja dece',
          price: 1500,
     };

     it('validates a complete product successfully', async () => {
          await expect(schema.validate(validProduct)).resolves.toBeDefined();
     });

     it('requires name', async () => {
          await expect(schema.validate({ ...validProduct, name: '' })).rejects.toThrow('Naziv proizvoda je obavezan');
     });

     it('requires description', async () => {
          await expect(schema.validate({ ...validProduct, description: '' })).rejects.toThrow('Opis proizvoda je obavezan');
     });

     it('requires main_category', async () => {
          await expect(schema.validate({ ...validProduct, main_category: '' })).rejects.toThrow('Glavna kategorija je obavezna');
     });

     it('requires available_stock', async () => {
          await expect(schema.validate({ ...validProduct, available_stock: undefined })).rejects.toThrow();
     });

     it('requires ingredients', async () => {
          await expect(schema.validate({ ...validProduct, ingredients: '' })).rejects.toThrow('Sastojci su obavezni');
     });

     it('requires instructions', async () => {
          await expect(schema.validate({ ...validProduct, instructions: '' })).rejects.toThrow('Instrukcije su obavezne');
     });

     it('requires quantity', async () => {
          await expect(schema.validate({ ...validProduct, quantity: '' })).rejects.toThrow('Količina je obavezna');
     });

     it('requires quantity_unit', async () => {
          await expect(schema.validate({ ...validProduct, quantity_unit: '' })).rejects.toThrow('Jedinica mere je obavezna');
     });

     it('requires manufacturer_id', async () => {
          await expect(schema.validate({ ...validProduct, manufacturer_id: '' })).rejects.toThrow('Proizvođač je obavezan');
     });

     it('requires warning', async () => {
          await expect(schema.validate({ ...validProduct, warning: '' })).rejects.toThrow('Upozorenje je obavezno');
     });

     it('requires price', async () => {
          await expect(schema.validate({ ...validProduct, price: undefined })).rejects.toThrow('Cena je obavezna');
     });

     it('allows optional mid_category', async () => {
          await expect(schema.validate({ ...validProduct, mid_category: '' })).resolves.toBeDefined();
          await expect(schema.validate({ ...validProduct, mid_category: undefined })).resolves.toBeDefined();
     });

     it('allows optional sub_category', async () => {
          await expect(schema.validate({ ...validProduct, sub_category: '' })).resolves.toBeDefined();
          await expect(schema.validate({ ...validProduct, sub_category: undefined })).resolves.toBeDefined();
     });
});

describe('initialValues', () => {
     it('has all required fields with defaults', () => {
          expect(initialValues.name).toBe('');
          expect(initialValues.description).toBe('');
          expect(initialValues.main_category).toBe('');
          expect(initialValues.price).toBe(1);
          expect(initialValues.available_stock).toBe(1);
          expect(initialValues.quantity).toBe(1);
     });

     it('does not include boolean flags (removed from form)', () => {
          expect(initialValues).not.toHaveProperty('is_active');
          expect(initialValues).not.toHaveProperty('discount');
          expect(initialValues).not.toHaveProperty('new_arrival');
          expect(initialValues).not.toHaveProperty('best_seller');
          expect(initialValues).not.toHaveProperty('display_on_home');
          expect(initialValues).not.toHaveProperty('discount_amount');
     });
});
