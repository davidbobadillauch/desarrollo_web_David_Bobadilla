const nameInput = document.getElementById("nombre");
const numberInput = document.getElementById("numero");
const emailInput = document.getElementById("correo")
const regionInput = document.getElementById("region_id");
const communeInput = document.getElementById("comuna_id");
const errorNombre = document.getElementById("error-nombre");
const errorNumero = document.getElementById("error-numero");
const errorCorreo = document.getElementById("error-correo")
const errorRegion = document.getElementById("error-región");
const errorComuna = document.getElementById("error-comuna");
const form = document.getElementById("form-registro");

const nombreInvalido = (name) => {  
  return name.trim().length < 4;
}

const numeroInvalido = (number) => {
    const validlength = number.trim().length === 8;
    const validFormat = /^[0-9]+$/.test(number);
    return !validlength || !validFormat;
}

const correoInvalido = (email) => {
    let lengthInvalid = email.length < 15;
    let re = /^[\w.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    let formatValid = re.test(email);
    return lengthInvalid || !formatValid;
}
const regionInvalida = (region) => {
  return region === "";
}

const comunaInvalida = (comuna) => {
  return comuna === "";
}
regionInput.addEventListener('change', function() {
  const region = this.value;

  communeInput.innerHTML = '<option value="">-- Seleccione --</option>';

  if (region) {
    fetch('/get_comunas/' + region)
      .then(response => response.text())
      .then(html => {
        communeInput.innerHTML = html;
      })
      .catch(error => console.error('Error al cargar comunas:', error));
  }
});

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const number = numberInput.value.trim();
  const email = emailInput.value;
  const region = regionInput.value;
  const commune = communeInput.value.trim();
  const nameInvalid = nombreInvalido(name);
  const numberInvalid = numeroInvalido(number);
  const emailInvalid = correoInvalido(email);
  const regionInvalid = regionInvalida(region);
  const comunaInvalid = comunaInvalida(commune);

  if (nameInvalid) {
    errorNombre.classList.add("visible");
  } else {
    errorNombre.classList.remove("visible");
  }

  if (numberInvalid) {
    errorNumero.classList.add("visible");
  } else {
    errorNumero.classList.remove("visible");
  }

   if (emailInvalid) {
    errorCorreo.classList.add("visible");
  } else {
    errorCorreo.classList.remove("visible");
  }
 
  if (regionInvalid) {
    errorRegion.classList.add("visible");
  } else {
    errorRegion.classList.remove("visible");
  }

  if (comunaInvalid) {
    errorComuna.classList.add("visible");
  } else {
    errorComuna.classList.remove("visible");
  }

    if (nameInvalid || numberInvalid || emailInvalid || regionInvalid || comunaInvalid) {
        return;
  }
  
  const registerItem = document.createElement("div");
  registerItem.className = "registro-item";

  const nameElement = document.createElement("span");
  nameElement.className = "nombre";
  nameElement.textContent = name;

  const numberElement = document.createElement("span");
  numberElement.className = "numero";
  numberElement.textContent = number;

  const emailElement = document.createElement("span");
  emailElement.className = "correo";
  emailElement.textContent = email;

  const regionElement = document.createElement("span");
  regionElement.className = "region";
  regionElement.textContent = region;

  const communeElement = document.createElement("span");
  communeElement.className = "comuna";
  communeElement.textContent = commune;

  registerItem.append(nameElement, document.createTextNode(" "), numberElement, document.createTextNode(" "), emailElement, document.createTextNode(" "), regionElement, document.createTextNode(" "), communeElement);
  
  form.submit();

  alert("Registro exitoso!")
});

