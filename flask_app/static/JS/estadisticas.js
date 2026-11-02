document.addEventListener('DOMContentLoaded', () => {
    cargarGraficoAvistamientosPorDia();
    cargarGraficoAvistamientosPorAve();
    cargarGraficoVoluntariosPorComuna();
});

function cargarGraficoAvistamientosPorDia() {
    fetch('/api/stats/avistamientos-por-dia')
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener avistamientos por día');
            return response.json();
        })
        .then(data => {
            const categorias = data.map(item => item.dia);
            const valores = data.map(item => Number(item.total));

            Highcharts.chart('chartAvistamientosPorDia', {
                chart: { type: 'line' },
                title: { text: null },
                xAxis: { categories: categorias, title: { text: 'Día' } },
                yAxis: { title: { text: 'Cantidad de Avistamientos' }, allowDecimals: false },
                series: [{
                    name: 'Avistamientos',
                    data: valores,
                    color: '#2ecc71'
                }],
                credits: { enabled: false }
            });
        })
        .catch(error => console.error('Error:', error));
}

function cargarGraficoAvistamientosPorAve() {
    fetch('/api/stats/avistamientos-por-ave')
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener avistamientos por ave');
            return response.json();
        })
        .then(data => {
            const seriesData = data.map(item => ({
                name: item.tipo_ave,
                y: Number(item.total)
            }));

            Highcharts.chart('chartAvistamientosPorAve', {
                chart: { type: 'pie' },
                title: { text: null },
                tooltip: { pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)' },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y}' }
                    }
                },
                series: [{
                    name: 'Avistamientos',
                    data: seriesData
                }],
                credits: { enabled: false }
            });
        })
        .catch(error => console.error('Error:', error));
}

function cargarGraficoVoluntariosPorComuna() {
    fetch('/api/stats/voluntarios-por-comuna')
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener voluntarios por comuna');
            return response.json();
        })
        .then(data => {
            const categorias = data.map(item => item.comuna);
            const valores = data.map(item => Number(item.total));

            Highcharts.chart('chartVoluntariosPorComuna', {
                chart: { type: 'column' }, 
                title: { text: null },
                xAxis: { categories: categorias, title: { text: 'Comuna' } },
                yAxis: { title: { text: 'Total de Voluntarios' }, allowDecimals: false },
                series: [{
                    name: 'Voluntarios',
                    data: valores,
                    color: '#3498db'
                }],
                credits: { enabled: false }
            });
        })
        .catch(error => console.error('Error:', error));
}