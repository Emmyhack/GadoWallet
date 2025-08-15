import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      wallet: 'Wallet',
      inheritance: 'Inheritance',
      batchTransfer: 'Batch Transfer',
      activity: 'Activity',
      claimAssets: 'Claim Assets',
      statistics: 'Statistics',
      sendReceive: 'Send/Receive',
      transactions: 'Transactions',
      receive: 'Receive',
      signMessage: 'Sign Msg'
    }
  },
  es: {
    translation: {
      wallet: 'Billetera',
      inheritance: 'Herencia',
      batchTransfer: 'Transferencia en Lote',
      activity: 'Actividad',
      claimAssets: 'Reclamar Activos',
      statistics: 'Estadísticas',
      sendReceive: 'Enviar/Recibir',
      transactions: 'Transacciones',
      receive: 'Recibir',
      signMessage: 'Firmar Mensaje'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;