import AsyncStorage from '@react-native-async-storage/async-storage';

const chave = 'coleta-facil-bv:dias';

export async function carregarColetas() {
  const dados = await AsyncStorage.getItem(chave);
  return dados ? JSON.parse(dados) : { comum: [], reciclavel: [] };
}

export async function salvarColetas(coletas) {
  await AsyncStorage.setItem(chave, JSON.stringify(coletas));
}
