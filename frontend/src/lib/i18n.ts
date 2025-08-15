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
      signMessage: 'Sign Msg',
      connectWallet: 'Connect Wallet',
      exploreFeatures: 'Explore Features',
      whyGada: 'Why Gada',
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
      signMessage: 'Firmar Mensaje',
      connectWallet: 'Conectar Billetera',
      exploreFeatures: 'Explorar Funciones',
      whyGada: 'Por qué Gada',
    }
  },
  yo: {
    translation: {
      wallet: 'Apamọwọ',
      inheritance: 'Ìjogún',
      batchTransfer: 'Ìfiránṣẹ̀ Pọ̀',
      activity: 'Ìṣe',
      claimAssets: 'Gba Ọ̀rò',
      statistics: 'Ìṣirò',
      sendReceive: 'Firanṣẹ/Ìgbọ̀wọ́',
      transactions: 'Ìdúnádúrà',
      receive: 'Ìgbọ̀wọ́',
      signMessage: 'Fọwọ́ sí Ìrántí',
      connectWallet: 'So Apamọwọ pọ̀',
      exploreFeatures: 'Ṣàwárí Àwọn Ẹ̀rọ',
      whyGada: 'Kí nìdí Gada',
    }
  },
  ha: {
    translation: {
      wallet: 'Aljihun dijital',
      inheritance: 'Gādon dukiya',
      batchTransfer: 'Canja wurin taro',
      activity: 'Ayyuka',
      claimAssets: 'Neman dukiya',
      statistics: 'Kididdiga',
      sendReceive: 'Aika/Karɓa',
      transactions: 'Mu’amaloli',
      receive: 'Karɓa',
      signMessage: 'Sa hannu saƙo',
      connectWallet: 'Haɗa Aljihun',
      exploreFeatures: 'Bincika Fasali',
      whyGada: 'Dalilin Gada',
    }
  },
  fr: {
    translation: {
      wallet: 'Portefeuille',
      inheritance: 'Héritage',
      batchTransfer: 'Transfert groupé',
      activity: 'Activité',
      claimAssets: 'Réclamer des actifs',
      statistics: 'Statistiques',
      sendReceive: 'Envoyer/Recevoir',
      transactions: 'Transactions',
      receive: 'Recevoir',
      signMessage: 'Signer un message',
      connectWallet: 'Connecter le portefeuille',
      exploreFeatures: 'Découvrir les fonctionnalités',
      whyGada: 'Pourquoi Gada',
    }
  },
  zh: {
    translation: {
      wallet: '钱包',
      inheritance: '继承',
      batchTransfer: '批量转账',
      activity: '活动',
      claimAssets: '领取资产',
      statistics: '统计',
      sendReceive: '发送/接收',
      transactions: '交易',
      receive: '接收',
      signMessage: '签名消息',
      connectWallet: '连接钱包',
      exploreFeatures: '探索功能',
      whyGada: '为什么选择 Gada',
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