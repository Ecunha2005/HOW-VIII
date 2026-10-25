export const diasDaSemana = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado',
];

export function alternarDia(dias, dia) {
  return dias.includes(dia)
    ? dias.filter((item) => item !== dia)
    : [...dias, dia].sort((a, b) => a - b);
}

export function proximaColeta(dias, hoje = new Date()) {
  if (dias.length === 0) return null;

  const intervalo = Math.min(...dias.map((dia) => (dia - hoje.getDay() + 7) % 7));
  const data = new Date(hoje);
  data.setDate(data.getDate() + intervalo);
  return data;
}

export function descreverProximaColeta(dias, hoje = new Date()) {
  const data = proximaColeta(dias, hoje);
  if (!data) return 'Nenhum dia cadastrado';

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const nome = data.getDay() === hoje.getDay() ? 'Hoje' : diasDaSemana[data.getDay()];
  return `${nome}, ${dia}/${mes}`;
}
