// Funciones de fecha simplificadas sin dependencias externas
// Manejo directo de zona horaria GMT-6 (Centroamérica)

const GMT_OFFSET = -6; // Guatemala está en GMT-6

// Función para obtener fecha actual en Guatemala
export const getCurrentDateGT = (): Date => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const guatemalaTime = new Date(utc + (GMT_OFFSET * 3600000));
  return guatemalaTime;
};

// Función para parsear fecha como local (sin conversión UTC)
export const parseLocalDate = (dateString: string): Date => {
  // Parsear como fecha local sin conversión UTC
  const parts = dateString.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Mes es 0-indexed
  const day = parseInt(parts[2]);
  
  return new Date(year, month, day);
};

// Función para calcular días transcurridos
export const calculateDaysElapsed = (startDate: string): number => {
  if (!startDate) return 0;
  
  const start = parseLocalDate(startDate);
  const today = getCurrentDateGT();
  
  // Normalizar a medianoche
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

// Función para calcular días restantes
export const calculateDaysRemaining = (endDate: string): number => {
  if (!endDate) return 0;
  
  const end = parseLocalDate(endDate);
  const today = getCurrentDateGT();
  
  // Normalizar fechas
  end.setHours(23, 59, 59, 999); // Final del día de vencimiento
  today.setHours(0, 0, 0, 0); // Inicio del día actual
  
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Función para formatear fecha para mostrar (DD/MM/YYYY)
export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = parseLocalDate(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Función para calcular duración total entre fechas
export const calculateTotalDuration = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays + 1); // +1 para incluir ambos días
};

// Función para obtener alerta de días
export const getDaysAlert = (endDate: string): 'normal' | 'warning' | 'danger' => {
  const daysRemaining = calculateDaysRemaining(endDate);
  if (daysRemaining < 0) return 'danger'; // Vencido
  if (daysRemaining <= 7) return 'warning'; // Próximo a vencer
  return 'normal';
};

// Función para obtener fecha actual en formato YYYY-MM-DD
export const getCurrentDate = (): string => {
  const today = getCurrentDateGT();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Función para validar formato de fecha
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = parseLocalDate(dateString);
  return !isNaN(date.getTime());
};

// Función para comparar fechas - CORREGIDA
export const isDateBefore = (date1: string, date2: string): boolean => {
  const d1 = parseLocalDate(date1);
  const d2 = parseLocalDate(date2);
  return d1.getTime() < d2.getTime();
};

export const isDateAfter = (date1: string, date2: string): boolean => {
  const d1 = parseLocalDate(date1);
  const d2 = parseLocalDate(date2);
  return d1.getTime() > d2.getTime();
};

// FUNCIÓN CORREGIDA - isDateBetween usando Date nativo
export const isDateBetween = (date: string, startDate: string, endDate: string): boolean => {
  const target = parseLocalDate(date);
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  
  const targetTime = target.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();
  
  return targetTime >= startTime && targetTime <= endTime;
};

// Debug function
export const debugDateCalculations = (startDate: string, endDate: string) => {
  console.log('=== DEBUG DATE CALCULATIONS (Guatemala GMT-6) ===');
  console.log('Input startDate:', startDate);
  console.log('Input endDate:', endDate);
  
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const today = getCurrentDateGT();
  
  console.log('Parsed start:', start.toDateString());
  console.log('Parsed end:', end.toDateString());
  console.log('Today (Guatemala):', today.toDateString());
  
  const daysElapsed = calculateDaysElapsed(startDate);
  const daysRemaining = calculateDaysRemaining(endDate);
  const totalDuration = calculateTotalDuration(startDate, endDate);
  
  console.log('Days elapsed:', daysElapsed);
  console.log('Days remaining:', daysRemaining);
  console.log('Total duration:', totalDuration);
  console.log('===============================================');
  
  return {
    daysElapsed,
    daysRemaining,
    totalDuration
  };
};