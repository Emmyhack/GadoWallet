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
      sol: 'SOL',
      token: 'Token',
      heirWalletAddress: "Heir's Wallet Address",
      invalidWalletAddress: 'Invalid wallet address',
      tokenMintAddress: 'Token Mint Address',
      invalidTokenMint: 'Invalid token mint address',
      amountLabel: 'Amount',
      invalidAmount: 'Invalid amount',
      processingTransfer: 'Processing...',
      addHeir: 'Add Heir',
      designateHeirs: 'Designate heirs for your assets'
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
      sol: 'SOL',
      token: 'Token',
      heirWalletAddress: 'Dirección del heredero',
      invalidWalletAddress: 'Dirección de billetera inválida',
      tokenMintAddress: 'Dirección de token mint',
      invalidTokenMint: 'Token mint inválido',
      amountLabel: 'Cantidad',
      invalidAmount: 'Cantidad inválida',
      processingTransfer: 'Procesando...',
      addHeir: 'Agregar heredero',
      designateHeirs: 'Designar herederos para tus activos'
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
      sol: 'SOL',
      token: 'Tókẹ̀n',
      heirWalletAddress: 'Adirẹsi Apamọwọ Ọmọjogún',
      invalidWalletAddress: 'Adirẹsi apamọwọ kò bófin mu',
      tokenMintAddress: 'Adirẹsi Mint Tókẹ̀n',
      invalidTokenMint: 'Adirẹsi mint kò bófin mu',
      amountLabel: 'Oye',
      invalidAmount: 'Oye kò bófin mu',
      processingTransfer: 'Ìlò ńlọ...',
      addHeir: 'Ṣafikun Ọmọjogún',
      designateHeirs: 'Yan àwọn ọmọjogún fún àwọn ohun-ini rẹ'
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
      sol: 'SOL',
      token: 'Token',
      heirWalletAddress: 'Adireshin walat na magaji',
      invalidWalletAddress: 'Adireshin walat ba daidai ba',
      tokenMintAddress: 'Adireshin token mint',
      invalidTokenMint: 'Token mint ba daidai ba',
      amountLabel: 'Adadi',
      invalidAmount: 'Adadi ba daidai ba',
      processingTransfer: 'Ana sarrafawa...',
      addHeir: 'Ƙara magaji',
      designateHeirs: 'Zaɓi magada don kadarorinka'
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
      sol: 'SOL',
      token: 'Jeton',
      heirWalletAddress: "Adresse du portefeuille de l'héritier",
      invalidWalletAddress: 'Adresse invalide',
      tokenMintAddress: 'Adresse de mint du jeton',
      invalidTokenMint: 'Mint invalide',
      amountLabel: 'Montant',
      invalidAmount: 'Montant invalide',
      processingTransfer: 'Traitement...',
      addHeir: 'Ajouter un héritier',
      designateHeirs: 'Désigner des héritiers pour vos actifs'
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
      sol: 'SOL',
      token: '代币',
      heirWalletAddress: '继承人钱包地址',
      invalidWalletAddress: '无效的钱包地址',
      tokenMintAddress: '代币铸造地址',
      invalidTokenMint: '无效的铸造地址',
      amountLabel: '数量',
      invalidAmount: '数量无效',
      processingTransfer: '处理中...',
      addHeir: '添加继承人',
      designateHeirs: '为资产指定继承人'
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