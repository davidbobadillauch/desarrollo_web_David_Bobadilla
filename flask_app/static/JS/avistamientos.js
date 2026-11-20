const volunteerInput = document.getElementById("voluntario");
const birdInput = document.getElementById("ave_id");
const placeInput = document.getElementById("lugar");
const dateInput = document.getElementById("fecha_hora");
const descriptionInput = document.getElementById("descripcion");
const filesInput = document.getElementById("archivo");
const form = document.getElementById("form-registro2");
const errorVoluntario = document.getElementById("error-voluntario");
const errorAve = document.getElementById("error-ave");
const errorLugar = document.getElementById("error-lugar");
const errorFecha = document.getElementById("error-fecha");
const errorDescripcion = document.getElementById("error-descripcion");
const errorArchivos = document.getElementById("error-archivo");
const sightingList = document.getElementById("lista-avistamientos");
const totalSightings = document.getElementById("total-avistamientos");

const extensionesImagen = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

const VoluntarioInvalido = (volunteer) => {
  return volunteer === "";
}

const aveInvalido = (bird) => {
  return bird === "";
}

const lugarInvalido = (place) => {
    const haveLetters = /[a-zA-Z]/.test(place);
    const validlength = place.trim().length >= 5;
    return place.trim() === "" || !haveLetters || !validlength;
}

const descripcionInvalida = (description) => {
    const haveLetters = /[a-zA-Z]/.test(description);
    const validlength = description.trim().length >= 4;
    return description.trim() === "" || !haveLetters || !validlength;
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

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const volunteer = volunteerInput.value.trim();
  const bird = birdInput.value.trim();
  const place = placeInput.value;
  const date = dateInput.value.trim();
  const description = descriptionInput.value.trim();
  const files = filesInput.files;
  const volunteerInvalid = VoluntarioInvalido(volunteer);
  const birdInvalid = aveInvalido(bird);
  const placeInvalid = lugarInvalido(place);
  const dateInvalid = fechaInvalida(date);
  const descriptionInvalid = descripcionInvalida(description);
  const filesInvalid = archivosInvalidos(files);

  if (birdInvalid) {
    errorAve.classList.add("visible");
  } else {
    errorAve.classList.remove("visible");
  }

  if (volunteerInvalid) {
    errorVoluntario.classList.add("visible");
  } else {
    errorVoluntario.classList.remove("visible");
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

  if (descriptionInvalid) {
    errorDescripcion.classList.add("visible");
  } else {
    errorDescripcion.classList.remove("visible");
  }

  if (filesInvalid) {
    errorArchivos.classList.add("visible");
  } else {
    errorArchivos.classList.remove("visible");
  }

    if (volunteerInvalid || birdInvalid || placeInvalid || dateInvalid || descriptionInvalid || filesInvalid) {
        return;
  }
  
  const fileName = files[0].name.toLowerCase();

  const registerItem = document.createElement("div");
  registerItem.className = "registro-item";

  const volunteerElement = document.createElement("div");
  volunteerElement.className = "voluntario";
  volunteerElement.textContent = volunteer;

  const birdElement = document.createElement("span");
  birdElement.className = "ave";
  birdElement.textContent = bird;

  const placeElement = document.createElement("span");
  placeElement.className = "lugar";
  placeElement.textContent = place;

  const dateElement = document.createElement("span");
  dateElement.className = "fecha";
  dateElement.textContent = date;

  const descriptionElement = document.createElement("span");
  descriptionElement.className = "descripcion";
  descriptionElement.textContent = description;

  const filesElement = document.createElement("span");
  filesElement.className = "archivo";
  filesElement.textContent = fileName;

  registerItem.append(volunteerElement, document.createTextNode(" "), birdElement, document.createTextNode(" "), placeElement, document.createTextNode(" "), dateElement, document.createTextNode(" "), descriptionElement, document.createTextNode(" "), filesElement);

  form.submit();
});
 










































