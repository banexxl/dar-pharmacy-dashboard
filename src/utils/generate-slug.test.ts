import { describe, it, expect } from 'vitest';
import { generateSlug } from './generate-slug';

describe('generateSlug', () => {
     it('converts basic text to lowercase slug', () => {
          expect(generateSlug('Hello World')).toBe('hello-world');
     });

     it('handles Serbian Latin diacritics (č, ć, š, ž, đ)', () => {
          expect(generateSlug('Čišćenje organizma')).toBe('ciscenje-organizma');
          expect(generateSlug('Guščija mast')).toBe('guscija-mast');
          expect(generateSlug('Proizvodi za žene')).toBe('proizvodi-za-zene');
          expect(generateSlug('Đumbir')).toBe('djumbir');
     });

     it('handles Serbian Cyrillic characters', () => {
          expect(generateSlug('Здравље')).toBe('zdravlje');
          expect(generateSlug('Лепота')).toBe('lepota');
     });

     it('replaces spaces with hyphens', () => {
          expect(generateSlug('Vitamin C 1000mg')).toBe('vitamin-c-1000mg');
     });

     it('removes special characters', () => {
          expect(generateSlug('SPF 50+ Pure!')).toBe('spf-50-pure');
          expect(generateSlug('Omega-3 (riblje ulje)')).toBe('omega-3-riblje-ulje');
     });

     it('trims leading and trailing hyphens', () => {
          expect(generateSlug(' Hello ')).toBe('hello');
          expect(generateSlug('--test--')).toBe('test');
     });

     it('collapses multiple hyphens', () => {
          expect(generateSlug('one   two   three')).toBe('one-two-three');
     });

     it('handles empty string', () => {
          expect(generateSlug('')).toBe('');
     });

     it('handles mixed Cyrillic and Latin', () => {
          expect(generateSlug('Витамин D3')).toBe('vitamin-d3');
     });
});
