import AsyncStorage from '@react-native-async-storage/async-storage';
import { carregarColetas, salvarColetas } from '../armazenamento';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

test('começa com os dois tipos vazios', async () => {
  expect(await carregarColetas()).toEqual({ comum: [], reciclavel: [] });
});

test('salva e recupera os dias dos dois tipos', async () => {
  const coletas = { comum: [1, 3, 5], reciclavel: [2] };
  await salvarColetas(coletas);
  expect(await carregarColetas()).toEqual(coletas);
});

test('a edição substitui os dias antigos e permite esvaziar um tipo', async () => {
  await salvarColetas({ comum: [1, 3], reciclavel: [2] });
  await salvarColetas({ comum: [5], reciclavel: [] });
  expect(await carregarColetas()).toEqual({ comum: [5], reciclavel: [] });
});

test('informa falha ao carregar', async () => {
  AsyncStorage.getItem.mockRejectedValueOnce(new Error('Falha de leitura'));
  await expect(carregarColetas()).rejects.toThrow('Falha de leitura');
});

test('uma falha de gravação mantém os dados anteriores', async () => {
  const anteriores = { comum: [1], reciclavel: [2] };
  await salvarColetas(anteriores);
  AsyncStorage.setItem.mockRejectedValueOnce(new Error('Falha de gravação'));
  await expect(salvarColetas({ comum: [3], reciclavel: [] })).rejects.toThrow('Falha de gravação');
  expect(await carregarColetas()).toEqual(anteriores);
});
