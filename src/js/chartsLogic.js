//charts
const ctx1 = document.getElementById('barChart').getContext('2d');
const wordCountChart = new Chart(ctx1, {
    type: 'bar',
    data: {
        labels: ['Positive','Neutral','Negative'],
        datasets: [{
            label: 'vocabulary size:',
            data: [],
            backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(0, 167, 255, 0.2)',
                'rgba(255, 99, 132, 0.2)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(0, 167, 255, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        
        scales: {
            y: {
                ticks:{
                    stepSize:1
                },
                beginAtZero: true
            },
        },
        plugins:{
              subtitle:{
                display: true,
                text: '# of words mapped to each category',
              },
            legend:{
                labels:{boxWidth:0}
            }
        }
    }
});

const ctx = document.getElementById('pieChart').getContext('2d');
const docCountChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Positive','Neutral','Negative'],
        datasets: [{
            data: [],
            backgroundColor: [
                'rgba(75, 192, 192, 0.2)',
                'rgba(0, 167, 255, 0.2)',
                'rgba(255, 99, 132, 0.2)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(0, 167, 255, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: '# of tweets mapped to each category',
          },
          subtitle:{
            display: true,
            text:'total:'
          }
        }
      },
});

function addCharts(){


//get data for charts via sse
function updateCharts(classifierData){
    
    docCountChart.data.datasets[0].data[0] = classifierData.docCount.positive; 
    docCountChart.data.datasets[0].data[1] = classifierData.docCount.neutral;
    docCountChart.data.datasets[0].data[2] = classifierData.docCount.negative;
    wordCountChart.data.datasets[0].data[0] = classifierData.wordCount.positive;
    wordCountChart.data.datasets[0].data[1] = classifierData.wordCount.neutral;
    wordCountChart.data.datasets[0].data[2] = classifierData.wordCount.negative;
    docCountChart.options.plugins.subtitle.text = 'total:'+ classifierData.totalDocuments;
    wordCountChart.data.datasets[0].label = 'vocabulary size:'+classifierData.vocabularySize;
    docCountChart.update();
    wordCountChart.update();
}
const source = new EventSource('/model/statistics');
source.addEventListener('message', message => {
    let classifierData = JSON.parse(message.data);
    updateCharts(classifierData);
});
}
function toggleDarkMode(){
    if(localStorage.getItem('darkMode') === 'true'){
        wordCountChart.options.scales.y.grid.color = 'rgba(255,255,255,0.2)';
        wordCountChart.options.scales.y.grid.borderColor = 'rgba(255,255,255,0.2)';
        wordCountChart.options.scales.x.grid.color = 'rgba(255,255,255,0.2)';
        wordCountChart.options.scales.x.grid.borderColor = 'rgba(255,255,255,0.2)';
        wordCountChart.update();
       }else{
        delete wordCountChart.options.scales.y['grid'];
        delete wordCountChart.options.scales.x['grid'];
        wordCountChart.update();
       }
}

export {addCharts,toggleDarkMode};