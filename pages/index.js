import axios from 'axios';
import cheerio  from 'cheerio';
import Select from 'react-select';

import { Bar } from 'react-chartjs-2';
import { useState } from 'react';

import Head from 'next/head';
import Container from '../components/container';
import Header from '../components/header';

import styles from '../styles/home.module.css';

function contarConcursos(nInicial, nFinal, listaConcursos) {
    const numeros = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];
    const vezes = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    const intervalo = listaConcursos.slice(nInicial-1, nFinal); 
    const numerosSorteados = [];

    console.log(`Contando as ocorrências dos números dos concursos no intervalo de ${nInicial} até ${nFinal}`);
    intervalo.forEach( concurso => {
        concurso.forEach( nSorteado => {
            nSorteado = Number(nSorteado);
            numeros.forEach ( (numSorteio, i) => {
                if(numSorteio === nSorteado) {
                    vezes[i] += 1;
                }
            })
        } )
    });

    console.log('Retornando resultados');
    return {
        resultado: vezes
    }

}

function Home(props) {
    const [vezes, setVezes]  = useState([])
    const [nFinal, setnFinal] = useState(0)
    const [nInicial, setnInicial] = useState(0)

    function changeGraphic() {
        if (nFinal === 0 || nInicial === 0) {
            alert('Escolha um intervalo!!!');
            return
        }
        if (nFinal < nInicial) {
            alert('O número final não pode ser maior que o número inicial');
            return
        }
        const { resultado } = contarConcursos(nInicial,nFinal, props.concursos);
        setVezes(resultado)

    }


    //cores do gráfico
    const backgroundColorList = []
    const borderColorList = []
    for (let i = 0; i < 25; i++){
        backgroundColorList.push("rgba(173, 150, 255, 0.7)");
        borderColorList.push("rgb(137, 82, 255)");
    }

    //configurações do gráfico
    const data = {
        labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],
        datasets: [{
            label: "Quantidade sorteada",
            data: vezes,
            backgroundColor: backgroundColorList,
            borderColor: borderColorList,
            borderWidth: 1
        }]
    }

    //opções react-select
    const options = props.numConcursos.map(concurso => {
            return { value: concurso, label: concurso }
    })
    
    const customStyles = {
        option: (provided, state) => ({
          ...provided,
          borderBottom: '1px solid #c3c3c3',
          color: state.isSelected ? 'white' : 'black',
          backgroundColor: state.isSelected ? '#8b2bff' : 'white'
        }),
        control: (provided) => ({
          ...provided,
          borderColor: '#8b2bff',
          placeholder: 'oi'
        })
      }

    return (
        <div>
            <Head>
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
            </Head>
            <Header>Resultados da lotofácil</Header>
            <Container>
                <form className={styles.concursos}>
                    <fieldset value='oi'><legend>Intervalo de concursos</legend>
                        <p>
                            <label for='de'>De: </label>
                            <Select className={styles.select} 
                                styles={customStyles}
                                options={options}
                                placeholder={'Nº...'} 
                                onChange={ valorSelecionado => {
                                    setnInicial(Number(valorSelecionado.value));
                                }}
                                />
                        </p>
                        <p>
                            <label for='ate'>até: </label>  
                            <Select className={styles.select} 
                                styles={customStyles}
                                options={options}
                                placeholder={'Nº...'}
                                onChange={ valorSelecionado => {
                                    setnFinal(Number(valorSelecionado.value));
                                }}
                            />
                        </p>
                    </fieldset>
                </form>
            </Container>
            <div className={styles.btnConfirma}>
                <button onClick={changeGraphic}>Confirmar</button>
            </div>
            <Container>
                <Bar 
                    data={data}
                    width={400}
                    height={400}
                    options={{
                        title: {
                            text: "Números sorteados no intervalo escolhido",
                            display: true,
                            fontSize: 24
                        },
                        maintainAspectRatio: false,
                        responsive: true
                    }}
                />
            </Container>
        </div>
    )
}

export async function getStaticProps() {
    const url = 'https://asloterias.com.br/lista-de-resultados-da-lotofacil';

    console.log(`Pegando dados do site: "${url}`);
    const res = await axios.get(url);
    const data = await res.data;
    const $ = cheerio.load(data);
    const concursos = []
    const numConcursos = []

    console.log('Retirando dos dados a lista de concursos')
    $('strong').each((_idx, concurso) => {
        if (_idx >= 2) {
            numConcursos.push($(concurso).text());
            let dadosConcurso = concurso.next.data;
            concursos.push(dadosConcurso.slice(-44).split(' '));
        }
    })
    concursos.reverse();
    numConcursos.reverse();
    console.log(`Total de concursos: ${concursos.length}`)

    return {
        props: {
            concursos,
            numConcursos
        },
        revalidate: 86400
    }
}

export default Home;