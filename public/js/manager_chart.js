var myHeaders = new Headers();

var myInit = { 
  method: "GET",
  headers: myHeaders,
};

var myRequest = new Request("https://backend-livid-iota.vercel.app/api/estatisticas/chart", myInit);


const ctx = document.getElementById('myChart');
let month = ['Atual']; 

let reports = [
    {
        label: 'Nº de Zonas de Baixo risco',
        data: [0],
        borderWidth: 1,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)'
    },
    {
        label: 'Nº de Zonas de Médio risco',
        data: [0],
        borderWidth: 1,
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)'
    },
    {
        label: 'Nº de Zonas de Alto risco',
        data: [0],
        borderWidth: 1,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)'
    }
];

const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: month,
        datasets: reports
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        },
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Distribuição de Zonas por Nível de Risco'
            }
        }
    }
});


function updateChartData() {
    fetch(myRequest)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
            }
            return response.json();
        })
        .then(function (data) {
           
            const baixoRisco = data.statistics.reportLowCount || 0;
            const medioRisco = data.statistics.reportMediumCount || 0;
            const altoRisco = data.statistics.reportHighCount || 0;

            console.log(baixoRisco,medioRisco,altoRisco);
            myChart.data.datasets[0].data = [baixoRisco];
            myChart.data.datasets[1].data = [medioRisco];
            myChart.data.datasets[2].data = [altoRisco];
            myChart.update();
        })
        .catch(function (error) {
            console.log("There was a problem with the fetch operation:", error);
        });
}


updateChartData();

document.getElementById('refreshChart').addEventListener('click', updateChartData);


setInterval(updateChartData, 30000);