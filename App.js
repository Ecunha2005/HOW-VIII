import { useEffect, useState } from 'react';
import { AppState, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { carregarColetas, salvarColetas } from './armazenamento';
import { alternarDia, descreverProximaColeta, diasDaSemana } from './coletas';

const tipos = [
  { id: 'comum', nome: 'Lixo comum' },
  { id: 'reciclavel', nome: 'Reciclável' },
];

export default function App() {
  const [coletas, setColetas] = useState({ comum: [], reciclavel: [] });
  const [rascunho, setRascunho] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState('');
  const [erro, setErro] = useState(false);
  const [hoje, setHoje] = useState(new Date());

  async function carregar() {
    setCarregando(true);
    setErro(false);
    try {
      setColetas(await carregarColetas());
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    const intervalo = setInterval(() => setHoje(new Date()), 60000);
    const evento = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') setHoje(new Date());
    });
    return () => {
      clearInterval(intervalo);
      evento.remove();
    };
  }, []);

  async function salvar() {
    setSalvando(true);
    setErroSalvar('');
    try {
      await salvarColetas(rascunho);
      setColetas(rascunho);
      setRascunho(null);
      setHoje(new Date());
    } catch {
      setErroSalvar('Não foi possível salvar. Tente novamente. Seus dias anteriores foram mantidos.');
    } finally {
      setSalvando(false);
    }
  }

  function selecionarDia(tipo, dia) {
    setRascunho((atual) => ({ ...atual, [tipo]: alternarDia(atual[tipo], dia) }));
  }

  const temDias = coletas.comum.length > 0 || coletas.reciclavel.length > 0;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={estilos.tela}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={estilos.conteudo}>
          <Text style={estilos.titulo}>Coleta Fácil BV</Text>
          <Text style={estilos.cidade}>Barra Velha · SC</Text>

          {carregando ? <Text style={estilos.aviso}>Carregando dias de coleta...</Text> : erro ? (
            <View style={estilos.cartao}>
              <Text style={estilos.texto}>Não foi possível carregar os dias salvos.</Text>
              <Pressable accessibilityRole="button" style={estilos.botao} onPress={carregar}>
                <Text style={estilos.textoBotao}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : rascunho ? (
            <>
              <Text style={estilos.subtitulo}>{temDias ? 'Editar dias de coleta' : 'Cadastrar dias de coleta'}</Text>
              <Text style={estilos.aviso}>Marque os dias de coleta da sua rua. Deixe vazio o tipo sem coleta cadastrada.</Text>
              {tipos.map((tipo) => (
                <View key={tipo.id} style={estilos.cartao}>
                  <Text style={estilos.tipo}>{tipo.nome}</Text>
                  {diasDaSemana.map((dia, indice) => {
                    const selecionado = rascunho[tipo.id].includes(indice);
                    return (
                      <Pressable
                        key={dia}
                        accessibilityRole="checkbox"
                        accessibilityLabel={`${tipo.nome}: ${dia}`}
                        accessibilityState={{ checked: selecionado, disabled: salvando }}
                        disabled={salvando}
                        onPress={() => selecionarDia(tipo.id, indice)}
                        style={[estilos.dia, selecionado && estilos.diaSelecionado]}
                      >
                        <Text style={estilos.texto}>{dia}</Text>
                        <Text style={estilos.marca}>{selecionado ? '✓' : '○'}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
              {erroSalvar !== '' && <Text accessibilityRole="alert" style={estilos.erro}>{erroSalvar}</Text>}
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: salvando }} disabled={salvando} style={[estilos.botao, salvando && estilos.desabilitado]} onPress={salvar}>
                <Text style={estilos.textoBotao}>{salvando ? 'Salvando...' : 'Salvar dias'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" disabled={salvando} style={estilos.cancelar} onPress={() => { setRascunho(null); setErroSalvar(''); }}>
                <Text style={estilos.textoCancelar}>Cancelar</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={estilos.subtitulo}>Seus dias de coleta</Text>
              {tipos.map((tipo) => (
                <View key={tipo.id} style={estilos.cartao}>
                  <Text style={estilos.tipo}>{tipo.nome}</Text>
                  <Text style={estilos.texto}>
                    {coletas[tipo.id].length ? coletas[tipo.id].map((dia) => diasDaSemana[dia]).join(' · ') : 'Nenhum dia cadastrado'}
                  </Text>
                  {coletas[tipo.id].length > 0 && (
                    <View style={estilos.proxima}>
                      <Text style={estilos.rotulo}>Próxima coleta</Text>
                      <Text style={estilos.data}>{descreverProximaColeta(coletas[tipo.id], hoje)}</Text>
                    </View>
                  )}
                </View>
              ))}
              {temDias && <Text style={estilos.aviso}>Nos dias cadastrados, a coleta aparece como “Hoje” durante todo o dia.</Text>}
              <Pressable accessibilityRole="button" style={estilos.botao} onPress={() => setRascunho({ comum: [...coletas.comum], reciclavel: [...coletas.reciclavel] })}>
                <Text style={estilos.textoBotao}>{temDias ? 'Editar dias' : 'Cadastrar dias'}</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F4F7F5' },
  conteudo: { padding: 20, paddingBottom: 32, gap: 16, width: '100%', maxWidth: 560, alignSelf: 'center' },
  titulo: { fontSize: 28, fontWeight: '700', color: '#174C36' },
  cidade: { fontSize: 16, color: '#53635B', marginTop: -10 },
  subtitulo: { fontSize: 21, fontWeight: '600', color: '#203B2D', marginTop: 12 },
  cartao: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#DCE5DF', gap: 12 },
  tipo: { fontSize: 20, fontWeight: '600', color: '#203B2D' },
  texto: { fontSize: 16, lineHeight: 24, color: '#283C31', flexShrink: 1 },
  aviso: { fontSize: 14, lineHeight: 21, color: '#53635B' },
  erro: { fontSize: 14, lineHeight: 21, color: '#A12525' },
  proxima: { borderTopWidth: 1, borderColor: '#E3EBE6', paddingTop: 12, gap: 4 },
  rotulo: { fontSize: 14, color: '#53635B' },
  data: { fontSize: 19, fontWeight: '600', color: '#174C36' },
  dia: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DCE5DF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  diaSelecionado: { backgroundColor: '#E5F3EA', borderColor: '#24794E' },
  marca: { fontSize: 22, color: '#174C36' },
  botao: { backgroundColor: '#19613F', minHeight: 50, borderRadius: 10, padding: 14, alignItems: 'center', justifyContent: 'center' },
  textoBotao: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  cancelar: { minHeight: 48, padding: 12, alignItems: 'center', justifyContent: 'center' },
  textoCancelar: { fontSize: 16, color: '#174C36' },
  desabilitado: { opacity: 0.6 },
});
