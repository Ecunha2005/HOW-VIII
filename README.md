# HOW VIII - Coleta Fácil BV

Aplicativo para cadastrar, consultar e editar os dias de coleta de lixo comum e reciclável em Barra Velha (SC).

Feito em JavaScript com React Native e Expo. Os dados ficam salvos localmente com AsyncStorage. O cadastro é manual, sem integração com a prefeitura.

## Executar

É necessário Node.js 22.13 ou superior.

```bash
npm ci
npm run web
```

No Windows, também é possível abrir pelo arquivo `ABRIR-NO-PC.cmd`. Para usar no celular com Expo Go, execute `npm start`.

## Testes

```bash
npm test
```

## APK Android

Com uma conta Expo:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform android --profile preview
```
