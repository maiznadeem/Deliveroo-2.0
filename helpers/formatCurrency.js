const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatCurrency(amount) {
  return usd.format(Number(amount) || 0);
}
