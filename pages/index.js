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
    const frequencia = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    const intervalo = listaConcursos.slice(nInicial-1, nFinal);

    console.log(`Contando as ocorrências dos números dos concursos no intervalo de ${nInicial} até ${nFinal}`);
    intervalo.forEach( concurso => {
        concurso.forEach( nSorteado => {
            nSorteado = Number(nSorteado);
            numeros.forEach ( (numSorteio, i) => {
                if(numSorteio === nSorteado) {
                    frequencia[i] += 1;
                }
            })
        } )
    });

    console.log('Retornando resultados');
    return {
        resultado: frequencia
    }

}

function Home(props) {
    const { concursos, numConcursos } = props;
    const [frequencia, setFrequencia]  = useState([])
    const [nFinal, setnFinal] = useState(0)
    const [nInicial, setnInicial] = useState(0)
    const [intervaloValido, setIntervaloValido] = useState(true)

    function changeGraphic() {
        if (nFinal < nInicial || (nFinal === 0 || nInicial === 0)) {
            setIntervaloValido(false)
        }else {
            setIntervaloValido(true)
        }
        const { resultado } = contarConcursos(nInicial,nFinal, concursos);
        setFrequencia(resultado)

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
            label: "Frquência do número",
            data: frequencia,
            backgroundColor: backgroundColorList,
            borderColor: borderColorList,
            borderWidth: 1
        }]
    }

    const optionGrafico = {
            title: {
                text: "Números sorteados no intervalo escolhido",
                display: true,
                fontSize: 24
            },
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        fontSize: 18,
                        fontColor: '#8b2bff',
                        callback: function(value, index, values) {
                            let num = Number(value);
                            if (num % 1 === 0) {
                                return `${num} ${(num === 1)?"vez":"vezes"}`;
                            }
                        }
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontSize: 16,
                        fontColor: '#7a1aee'
                    }
                }]
            },
            tooltips:{
                mode: 'index',
                callbacks: {
                    label: function(tooltipItem, data) {
                        console.log(tooltipItem)
                        console.log(data)
                        return ` Sorteado ${data.datasets[0].data[tooltipItem.index]} vezes`
                    }
                }
            }
    }

    //opções react-select
    const optionsRSelect = numConcursos.map(concurso => {
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
                <title>LotoData</title>
                <meta name="description" content="Neste site é possivel encontrar alguns dados sobre os concursos da lotofácil" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
            </Head>
            <Header>Resultados da lotofácil</Header>
            <Container>
                <form className={styles.concursos}>
                    <fieldset><legend>Intervalo de concursos</legend>
                        <p>
                            <label>De: 
                            <Select className={styles.select} 
                                styles={customStyles}
                                options={optionsRSelect}
                                placeholder={'Nº...'} 
                                onChange={ valorSelecionado => {
                                    setnInicial(Number(valorSelecionado.value));
                                }}
                                />
                            </label>
                        </p>
                        <p>
                            <label>até:   
                            <Select className={styles.select} 
                                styles={customStyles}
                                options={optionsRSelect}
                                placeholder={'Nº...'}
                                onChange={ valorSelecionado => {
                                    setnFinal(Number(valorSelecionado.value));
                                }}
                            />
                            </label>
                        </p>
                    </fieldset>
                    {intervaloValido?<></>:<p>Selecione um intervalo válido!</p>}
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
                    options={optionGrafico}
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