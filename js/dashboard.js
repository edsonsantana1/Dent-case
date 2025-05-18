window.addEventListener('DOMContentLoaded', function () {
    const faixaEtariaData = {
     labels: ['0–17', '18–30', '31–45', '46–60', '60+'],
     datasets: [{
       label: 'Número de vítimas',
       data: [5, 20, 15, 8, 12],
       backgroundColor: '#700C0C'  // vinho escuro
     }]
   };
   
   const generoTipoData = {
     labels: ['Acidente', 'Morte'],
     datasets: [
       {
         label: 'Masculino',
         data: [18, 10],
         backgroundColor: '#B34B4B'  // vermelho médio
       },
       {
         label: 'Feminino',
         data: [12, 8],
         backgroundColor: '#BB8686'  // rosa queimado
       }
     ]
   };
   
   const bairroData = {
     labels: ['Centro', 'Zona Sul', 'Zona Norte', 'Zona Oeste'],
     datasets: [{
       label: 'Número de casos',
       data: [
         { x: 1, y: 15 },
         { x: 2, y: 10 },
         { x: 3, y: 8 },
         { x: 4, y: 12 }
       ],
       pointBackgroundColor: ['#700C0C', '#BB8686', '#B34B4B', '#5F5555'],
       pointBorderColor: ['#5F5555', '#700C0C', '#BB8686', '#B34B4B'],
       pointBorderWidth: 2
     }]
   };
   
   const faixaRegiaoData = {
     labels: ['0–17', '18–30', '31–45', '46–60', '60+'],
     datasets: [
       {
         label: 'Cabeça',
         data: [2, 8, 5, 3, 4],
         backgroundColor: '#B34B4B'
       },
       {
         label: 'Mandíbula',
         data: [1, 6, 4, 2, 3],
         backgroundColor: '#5F5555'
       },
       {
         label: 'Dentes',
         data: [2, 5, 6, 3, 2],
         backgroundColor: '#BB8686'
       }
     ]
   };
   
   const identificacaoData = {
     labels: ['Identificadas', 'Não identificadas'],
     datasets: [{
       label: 'Vítimas',
       data: [40, 12],
       backgroundColor: ['#700C0C', '#F2E1D3']
     }]
   };
   
   
     new Chart(document.getElementById('faixaEtariaChart'), {
       type: 'bar',
       data: faixaEtariaData,
       options: {
         responsive: true,
         scales: { y: { beginAtZero: true } }
       }
     });
   
     new Chart(document.getElementById('generoTipoChart'), {
       type: 'bar',
       data: generoTipoData,
       options: {
         responsive: true,
         scales: { y: { beginAtZero: true } }
       }
     });
   
     new Chart(document.getElementById('bairroChart'), {
       type: 'scatter',
       data: bairroData,
       options: {
         responsive: true,
         scales: {
           x: {
             title: { display: true, text: 'Bairros' },
             ticks: {
               callback: function(value) {
                 const bairros = ['Centro', 'Zona Sul', 'Zona Norte', 'Zona Oeste'];
                 return bairros[value - 1] || value;
               }
             }
           },
           y: {
             title: { display: true, text: 'Número de Casos' }
           }
         }
       }
     });
   
     new Chart(document.getElementById('faixaRegiaoChart'), {
       type: 'bar',
       data: faixaRegiaoData,
       options: {
         responsive: true,
         scales: { y: { beginAtZero: true } }
       }
     });
   
     new Chart(document.getElementById('identificacaoChart'), {
       type: 'doughnut',
       data: identificacaoData,
       options: {
         responsive: true
       }
     });
   });
   