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

    const comentarioNombreInvalido = (name) => {
       return name.trim().length < 3 || name.trim().length > 50;
    };

    const comentarioTextoInvalido = (text) => {
        return text.trim().length < 5;
    };
 
    const urlComentarios = (id) => '/api/avistamiento/' + encodeURIComponent(id) + '/comentarios';
 
    function setError(idSpan, mensaje) {
    var span = document.getElementById(idSpan);
    if (span) {
        span.textContent = mensaje;
    }
    }
 
    function cargarComentarios(id) {
        var contenedor = document.getElementById('lista-comentarios-' + id);
 
        fetch(urlComentarios(id))
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('Error HTTP ' + res.status);
                }
                return res.json();
            })
            .then(function (comentarios) {
                contenedor.innerHTML = '';
 
                if (comentarios.length === 0) {
                    var vacio = document.createElement('p');
                    vacio.textContent = 'Aún no hay comentarios.';
                    contenedor.appendChild(vacio);
                    return;
                }
 
                comentarios.forEach(function (c) {
                    var item = document.createElement('div');
                    item.className = 'comentario';
 
                    var cabecera = document.createElement('p');
                    var autor = document.createElement('strong');
                    autor.textContent = c.nombre;
                    var fecha = document.createElement('span');
                    fecha.textContent = ' - ' + new Date(c.fecha).toLocaleString('es-CL');
                    cabecera.appendChild(autor);
                    cabecera.appendChild(fecha);
 
                    var cuerpo = document.createElement('p');
                    cuerpo.textContent = c.texto;
 
                    item.appendChild(cabecera);
                    item.appendChild(cuerpo);
                    contenedor.appendChild(item);
                });
            })
            .catch(function () {
                contenedor.textContent = 'No se pudieron cargar los comentarios.';
            });
    }
 
    function enviarComentario(id) {
        var inputNombre = document.getElementById('nombre-comentarista-' + id);
        var inputTexto = document.getElementById('comentario-' + id);
 
        setError('error-nombre-' + id, '');
        setError('error-comentario-' + id, '');
        setError('mensaje-error-' + id, '');
 
        var hayError = false;
 
        if (comentarioNombreInvalido(inputNombre.value)) {
            setError('error-nombre-' + id, 'El nombre debe tener entre 3 y 50 caracteres.');
            hayError = true;
        }
 
        if (comentarioTextoInvalido(inputTexto.value)) {
            setError('error-comentario-' + id, 'El comentario debe tener al menos 5 caracteres.');
            hayError = true;
        }
 
        if (hayError) {
            return; 
        }
 
        fetch(urlComentarios(id), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: inputNombre.value.trim(),
                comentario: inputTexto.value.trim()
            })
        })
            .then(function (res) {
                return res.json().then(function (datos) {
                    if (!res.ok) {
                        throw new Error(datos.error || 'No se pudo guardar el comentario.');
                    }
                    return datos;
                });
            })
            .then(function () {
                inputNombre.value = '';
                inputTexto.value = '';
                cargarComentarios(id);
            })
            .catch(function (err) {
                setError('mensaje-error-' + id, err.message);
            });
    }
 
    document.querySelectorAll('.contenedor-comentarios-lista').forEach(function (contenedor) {
        cargarComentarios(contenedor.id.replace('lista-comentarios-', ''));
    });
 
    document.querySelectorAll('.btn-comentar').forEach(function (boton) {
        boton.addEventListener('click', function () {
            enviarComentario(boton.getAttribute('data-avistamiento-id'));
        });
    });
});