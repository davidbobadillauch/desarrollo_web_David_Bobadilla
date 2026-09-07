const typeInput = document.getElementById("tipo");
const nameInput = document.getElementById("nombre");
const placeInput = document.getElementById("lugar");
const dateInput = document.getElementById("fecha");
const filesInput = document.getElementById("archivos");
const form = document.getElementById("form-registro2");
const errorTipo = document.getElementById("error-tipo");
const errorNombre = document.getElementById("error-nombre");
const errorLugar = document.getElementById("error-lugar");
const errorFecha = document.getElementById("error-fecha");
const errorArchivos = document.getElementById("error-archivos");
const sightingList = document.getElementById("lista-avistamientos");
const totalSightings = document.getElementById("total-avistamientos");

const btnSig = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");
const filtroTipoSeleccion = document.getElementById("filtro-tipo");
const ordenarSeleccion = document.getElementById("ordenar-por");
const infoPaginacion = document.getElementById("info-pagina");

const extensionesImagen = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
let avistamientos = [];

let paginaActual = 1;
const porPagina = 3;

const tipoInvalido = (tipo) => {
  return tipo === "";
}

const nombreInvalido = (name) => {
    if (name === "") return false;
    const notNumbers = /[0-9]/.test(name);
    return name.trim() === "" || notNumbers;
}

const lugarInvalido = (place) => {
    const haveLetters = /[a-zA-Z]/.test(place);
    const validlength = place.trim().length >= 5;
    return place.trim() === "" || !haveLetters || !validlength;
}

const fechaInvalida = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    const limitDate = new Date("1980-01-01");
    return isNaN(selectedDate.getTime()) || selectedDate > today || selectedDate < limitDate;
}

const archivosInvalidos = (files) => {
    return files.length === 0;
}

function crearElementoAvistamiento(avistamiento) {
    const sightingItem = document.createElement("div");
    sightingItem.className = "avistamiento-item";
 
    const typeElement = document.createElement("span");
    typeElement.className = "tipo";
    typeElement.textContent = avistamiento.type;
 
    const nameElement = document.createElement("span");
    nameElement.className = "nombre";
    nameElement.textContent = avistamiento.name;
 
    const placeElement = document.createElement("span");
    placeElement.className = "lugar";
    placeElement.textContent = avistamiento.place;
 
    const dateElement = document.createElement("span");
    dateElement.className = "fecha";
    dateElement.textContent = avistamiento.date;
 
    let filesElement;
    if (extensionesImagen.some(ext => avistamiento.fileName.endsWith(ext))) {
        filesElement = document.createElement("img");
        filesElement.className = "archivos";
        filesElement.src = avistamiento.fileUrl;
    } else {
        filesElement = document.createElement("video");
        filesElement.className = "archivos";
        filesElement.src = avistamiento.fileUrl;
        filesElement.controls = true;
    }
 
    sightingItem.append(
        typeElement, document.createTextNode(" "),
        nameElement, document.createTextNode(" "),
        placeElement, document.createTextNode(" "),
        dateElement, document.createTextNode(" "),
        filesElement
    );
 
    return sightingItem;
}
function filtrarAvistamientos(lista) {
    const filtro = filtroTipoSeleccion.value;
    if (filtro === "todos") return lista;
    return lista.filter(a => a.type === filtro);
}
 
function ordenarAvistamientos(lista) {
    const criterio = ordenarSeleccion.value;
    const copia = [...lista];
 
    if (criterio === "fecha-desc") {
      return copia.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (criterio === "fecha-asc") {
      return copia.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (criterio === "lugar-asc") {
      return copia.sort((a, b) => a.place.localeCompare(b.place));
    } else if (criterio === "lugar-desc") {
      return copia.sort((a, b) => b.place.localeCompare(a.place));
    } else {
      return copia;
    }
}
 
function renderAvistamientos() {
    let lista = filtrarAvistamientos(avistamientos);
    lista = ordenarAvistamientos(lista);
 
    const totalFiltrado = lista.length;
    let totalPaginas;
    if (totalFiltrado === 0) { 
      totalPaginas = 1;
    }
    else {
      totalPaginas = Math.ceil(totalFiltrado / porPagina);
    }
  
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;
    if (paginaActual < 1) paginaActual = 1;
 
    const inicio = (paginaActual - 1) * porPagina;
    const fin = inicio + porPagina;
    const paginaDeItems = lista.slice(inicio, fin);
 
    sightingList.innerHTML = "";
    paginaDeItems.forEach(a => {
        sightingList.appendChild(crearElementoAvistamiento(a));
    });
 
    totalSightings.textContent = totalFiltrado;
 
    infoPaginacion.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    btnPrev.disabled = paginaActual <= 1;
    btnSig.disabled = paginaActual >= totalPaginas;
}
 

filtroTipoSeleccion.addEventListener("change", () => {
    paginaActual = 1; 
    renderAvistamientos();
});
 
ordenarSeleccion.addEventListener("change", () => {
    renderAvistamientos();
});
 
btnPrev.addEventListener("click", () => {
    if (paginaActual > 1) {
        paginaActual--;
        renderAvistamientos();
    }
});
 
btnSig.addEventListener("click", () => {
    paginaActual++;
    renderAvistamientos();
});

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const type = typeInput.value.trim();
  const name = nameInput.value.trim();
  const place = placeInput.value;
  const date = dateInput.value.trim();
  const files = filesInput.files;
  const typeInvalid = tipoInvalido(type);
  const nameInvalid = nombreInvalido(name);
  const placeInvalid = lugarInvalido(place);
  const dateInvalid = fechaInvalida(date);
  const filesInvalid = archivosInvalidos(files);

  if (typeInvalid) {
    errorTipo.classList.add("visible");
  } else {
    errorTipo.classList.remove("visible");
  }

  if (nameInvalid) {
    errorNombre.classList.add("visible");
  } else {
    errorNombre.classList.remove("visible");
  }

  if (placeInvalid) {
    errorLugar.classList.add("visible");
  } else {
    errorLugar.classList.remove("visible");
  }

  if (dateInvalid) {
    errorFecha.classList.add("visible");
  } else {
    errorFecha.classList.remove("visible");
  }

  if (filesInvalid) {
    errorArchivos.classList.add("visible");
  } else {
    errorArchivos.classList.remove("visible");
  }

    if (nameInvalid || typeInvalid || placeInvalid || dateInvalid || filesInvalid) {
        return;
  }
  
  const fileName = files[0].name.toLowerCase();
  const fileUrl = URL.createObjectURL(files[0]);
  const avistamiento = { type, name, place, date, fileName, fileUrl };
  avistamientos.push(avistamiento);

  paginaActual = 1;
  renderAvistamientos();
  form.reset();
});

renderAvistamientos();  










































