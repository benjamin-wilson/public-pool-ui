// Catalog of the PrimeNG themes shipped under src/assets/layout/styles/theme.
// `primary` and `surface` are read from each theme's own stylesheet so the
// swatches in the picker show the real colours rather than an approximation.

export type ThemeMode = 'dark' | 'light';

export interface ThemeOption {
    /** Directory name under assets/layout/styles/theme. */
    name: string;
    label: string;
    family: string;
    mode: ThemeMode;
    /** --primary-color */
    primary: string;
    /** --surface-ground */
    surface: string;
    /** --text-color, used so a swatch label sits legibly on its own surface. */
    text: string;
}

export const THEMES: ThemeOption[] = [
    { name: 'lara-dark-blue', label: 'Blue', family: 'Lara', mode: 'dark', primary: '#93C5FD', surface: '#040d19', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'lara-dark-indigo', label: 'Indigo', family: 'Lara', mode: 'dark', primary: '#A5B4FC', surface: '#040d19', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'lara-dark-purple', label: 'Purple', family: 'Lara', mode: 'dark', primary: '#C4B5FD', surface: '#040d19', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'lara-dark-teal', label: 'Teal', family: 'Lara', mode: 'dark', primary: '#5EEAD4', surface: '#040d19', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'lara-light-blue', label: 'Blue', family: 'Lara', mode: 'light', primary: '#3B82F6', surface: '#eff3f8', text: '#495057' },
    { name: 'lara-light-indigo', label: 'Indigo', family: 'Lara', mode: 'light', primary: '#6366F1', surface: '#eff3f8', text: '#495057' },
    { name: 'lara-light-purple', label: 'Purple', family: 'Lara', mode: 'light', primary: '#8B5CF6', surface: '#eff3f8', text: '#495057' },
    { name: 'lara-light-teal', label: 'Teal', family: 'Lara', mode: 'light', primary: '#14B8A6', surface: '#eff3f8', text: '#495057' },
    { name: 'vela-orange', label: 'Amber', family: 'Vela', mode: 'dark', primary: '#FFD54F', surface: '#17212f', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'vela-blue', label: 'Blue', family: 'Vela', mode: 'dark', primary: '#64B5F6', surface: '#17212f', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'vela-green', label: 'Green', family: 'Vela', mode: 'dark', primary: '#81C784', surface: '#17212f', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'vela-purple', label: 'Purple', family: 'Vela', mode: 'dark', primary: '#BA68C8', surface: '#17212f', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'arya-orange', label: 'Amber', family: 'Arya', mode: 'dark', primary: '#FFD54F', surface: '#121212', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'arya-blue', label: 'Blue', family: 'Arya', mode: 'dark', primary: '#64B5F6', surface: '#121212', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'arya-green', label: 'Green', family: 'Arya', mode: 'dark', primary: '#81C784', surface: '#121212', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'arya-purple', label: 'Purple', family: 'Arya', mode: 'dark', primary: '#BA68C8', surface: '#121212', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'saga-orange', label: 'Amber', family: 'Saga', mode: 'light', primary: '#FFC107', surface: '#f8f9fa', text: '#495057' },
    { name: 'saga-blue', label: 'Blue', family: 'Saga', mode: 'light', primary: '#2196F3', surface: '#f8f9fa', text: '#495057' },
    { name: 'saga-green', label: 'Green', family: 'Saga', mode: 'light', primary: '#4CAF50', surface: '#f8f9fa', text: '#495057' },
    { name: 'saga-purple', label: 'Purple', family: 'Saga', mode: 'light', primary: '#9C27B0', surface: '#f8f9fa', text: '#495057' },
    { name: 'md-dark-deeppurple', label: 'Deep Purple', family: 'Material', mode: 'dark', primary: '#CE93D8', surface: '#121212', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'md-dark-indigo', label: 'Indigo', family: 'Material', mode: 'dark', primary: '#9FA8DA', surface: '#121212', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'md-light-deeppurple', label: 'Deep Purple', family: 'Material', mode: 'light', primary: '#673AB7', surface: '#fafafa', text: 'rgba(0, 0, 0, 0.87)' },
    { name: 'md-light-indigo', label: 'Indigo', family: 'Material', mode: 'light', primary: '#3F51B5', surface: '#fafafa', text: 'rgba(0, 0, 0, 0.87)' },
    { name: 'mdc-dark-deeppurple', label: 'Deep Purple', family: 'Material Compact', mode: 'dark', primary: '#CE93D8', surface: '#121212', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'mdc-dark-indigo', label: 'Indigo', family: 'Material Compact', mode: 'dark', primary: '#9FA8DA', surface: '#121212', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'mdc-light-deeppurple', label: 'Deep Purple', family: 'Material Compact', mode: 'light', primary: '#673AB7', surface: '#fafafa', text: 'rgba(0, 0, 0, 0.87)' },
    { name: 'mdc-light-indigo', label: 'Indigo', family: 'Material Compact', mode: 'light', primary: '#3F51B5', surface: '#fafafa', text: 'rgba(0, 0, 0, 0.87)' },
    { name: 'bootstrap4-dark-blue', label: 'Blue', family: 'Bootstrap', mode: 'dark', primary: '#8dd0ff', surface: '#20262e', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'bootstrap4-dark-purple', label: 'Purple', family: 'Bootstrap', mode: 'dark', primary: '#c298d8', surface: '#20262e', text: 'rgba(255, 255, 255, 0.87)' },
    { name: 'bootstrap4-light-blue', label: 'Blue', family: 'Bootstrap', mode: 'light', primary: '#007bff', surface: '#efefef', text: '#212529' },
    { name: 'bootstrap4-light-purple', label: 'Purple', family: 'Bootstrap', mode: 'light', primary: '#883cae', surface: '#efefef', text: '#212529' },
    { name: 'tailwind-light', label: 'Light', family: 'Tailwind', mode: 'light', primary: '#4F46E5', surface: '#FAFAFA', text: '#3f3f46' },
    { name: 'fluent-light', label: 'Light', family: 'Fluent', mode: 'light', primary: '#0078d4', surface: '#faf9f8', text: '#323130' },
];

export const THEME_FAMILIES: string[] = [
    'Lara',
    'Vela',
    'Arya',
    'Saga',
    'Material',
    'Material Compact',
    'Bootstrap',
    'Tailwind',
    'Fluent',
];

/** The theme index.html ships with; keep the two in step. */
export const DEFAULT_THEME = 'vela-blue';
