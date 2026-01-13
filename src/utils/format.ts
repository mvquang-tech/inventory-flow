export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const generateCode = (prefix: string, existingCodes: string[]): string => {
  const numbers = existingCodes
    .filter(code => code.startsWith(prefix))
    .map(code => parseInt(code.replace(prefix, '')) || 0);
  
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const newNumber = (maxNumber + 1).toString().padStart(3, '0');
  
  return `${prefix}${newNumber}`;
};
