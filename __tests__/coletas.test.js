import { alternarDia, descreverProximaColeta, proximaColeta } from '../coletas';

test('adiciona um dia sem alterar a lista original', () => {
  const dias = [5];
  expect(alternarDia(dias, 1)).toEqual([1, 5]);
  expect(dias).toEqual([5]);
});

test('remove um dia já selecionado', () => {
  expect(alternarDia([1, 3, 5], 3)).toEqual([1, 5]);
});

test('permite deixar um tipo sem dias cadastrados', () => {
  expect(alternarDia([1], 1)).toEqual([]);
});

test('não há próxima coleta quando a lista está vazia', () => {
  expect(proximaColeta([])).toBeNull();
  expect(descreverProximaColeta([])).toBe('Nenhum dia cadastrado');
});

test('considera a coleta de hoje mesmo no fim do dia', () => {
  const hoje = new Date(2026, 9, 26, 23, 59);
  expect(proximaColeta([1, 3], hoje)).toEqual(hoje);
  expect(descreverProximaColeta([1, 3], hoje)).toBe('Hoje, 26/10');
});

test('encontra o dia mais próximo mesmo com uma lista fora de ordem', () => {
  const hoje = new Date(2026, 9, 26, 12);
  expect(proximaColeta([5, 3], hoje)).toEqual(new Date(2026, 9, 28, 12));
  expect(descreverProximaColeta([5, 3], hoje)).toBe('Quarta-feira, 28/10');
});

test('passa de sábado para domingo', () => {
  expect(proximaColeta([0], new Date(2026, 9, 24))).toEqual(new Date(2026, 9, 25));
});

test('avança para a semana seguinte e muda de mês', () => {
  expect(proximaColeta([1], new Date(2026, 9, 27))).toEqual(new Date(2026, 10, 2));
});

test('calcula a próxima coleta na virada do ano sem alterar hoje', () => {
  const hoje = new Date(2026, 11, 31);
  expect(proximaColeta([5], hoje)).toEqual(new Date(2027, 0, 1));
  expect(hoje).toEqual(new Date(2026, 11, 31));
});
