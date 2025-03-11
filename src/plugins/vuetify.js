import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#4A4E69',
          secondary: '#9A8C98',
          background: '#F2E9E4',
          surface: '#FFFFFF',
          'surface-variant': '#C9ADA7',
          'on-surface-variant': '#22223B',
          error: '#B00020',
          info: '#4A4E69',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#9A8C98',
          secondary: '#4A4E69',
          background: '#22223B',
          surface: '#2A2A44',
          'surface-variant': '#4A4E69',
          'on-surface-variant': '#C9ADA7',
          error: '#CF6679',
          info: '#9A8C98',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    },
  },
});
