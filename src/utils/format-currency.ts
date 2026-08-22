export type Currency =
     | 'RSD'
     | 'EUR'
     | 'USD'
     | 'GBP'
     | 'CHF'
     | 'BAM'
     | 'MKD'
     | 'HRK'
     | 'JPY'
     | 'CNY'
     | 'AUD'
     | 'CAD'
     | 'SEK'
     | 'NOK'
     | 'DKK'
     | 'PLN'
     | 'CZK'
     | 'HUF'
     | 'RON'
     | 'TRY'
     | 'RUB'
     | 'UAH'
     | 'BGN';

export const formatCurrency = (
     value: number,
     currency: Currency,
     locale = 'sr-RS',
): string => {
     return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
     }).format(value);
};