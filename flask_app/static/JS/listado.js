document.addEventListener('DOMContentLoaded', function () {
    var filtroTipo = document.getElementById('filtro-tipo');
    var ordenarPor = document.getElementById('ordenar-por');
    var urlParams = new URLSearchParams(window.location.search);
    var tipoActual = urlParams.get('tipo');
    var ordenActual = urlParams.get('orden');

    if (!tipoActual) {
        tipoActual = 'todos';
    }

    if (!ordenActual) {
        ordenActual = 'fecha-desc';
    }

    if (filtroTipo) {
        filtroTipo.value = tipoActual;
    }

    if (ordenarPor) {
        ordenarPor.value = ordenActual;
    }

    function actualizarListado() {
        var nuevoTipo = 'todos';
        var nuevoOrden = 'fecha-desc';

        if (filtroTipo) {
            nuevoTipo = filtroTipo.value;
        }

        if (ordenarPor) {
            nuevoOrden = ordenarPor.value;
        }

        var urlTarget = '/listado_avistamiento?tipo=' + encodeURIComponent(nuevoTipo) + '&orden=' + encodeURIComponent(nuevoOrden) + '&page=1';
        window.location.href = urlTarget;
    }

    if (filtroTipo) {
        filtroTipo.addEventListener('change', actualizarListado);
    }

    if (ordenarPor) {
        ordenarPor.addEventListener('change', actualizarListado);
    }
});