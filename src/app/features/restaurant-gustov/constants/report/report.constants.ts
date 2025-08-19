export const REPORT_TYPES = {
  DETAILED: {
    value: 'detailed',
    label: 'Reporte Detallado',
    description: 'Lista completa de ventas con todos los detalles'
  },
  SUMMARY: {
    value: 'summary',
    label: 'Resumen de Ventas',
    description: 'Métricas y totales de ventas'
  },
  ANALYTICAL: {
    value: 'analytical',
    label: 'Análisis',
    description: 'Gráficos y análisis de tendencias'
  }
} as const;

export const CHART_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#F9C80E', '#FF8E53',
  '#5B6CFF', '#9D50BB', '#6AECC2', '#FF9A8B', '#7B68EE',
  '#6AEC9C', '#FF5252', '#FF79C6', '#D6BCFA', '#90CDF4'
];

export const DEFAULT_MEAL_PERIOD_COLOR = '#CCCCCC';
