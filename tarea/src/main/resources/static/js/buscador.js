document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const statusContainer = document.getElementById("status-container");
  const tableWrapper = document.getElementById("table-wrapper");
  const resultsTbody = document.getElementById("results-tbody");
  const resultsCount = document.getElementById("results-count");

  const modalEvaluar = document.getElementById("modal-evaluar");
  const modalDescription = document.getElementById("modal-description");
  const ratingButtons = document.querySelectorAll(".rating-btn");
  const btnCancelarModal = document.getElementById("btn-cancelar-modal");
  const btnConfirmarModal = document.getElementById("btn-confirmar-modal");
  const toastNotification = document.getElementById("toast-notification");

  let debounceTimer = null;
  let currentAvistamientoId = null;
  let selectedRating = null;

  function escapeHTML(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function resaltarTexto(texto, termino) {
    if (!texto) return "";
    const textoSeguro = escapeHTML(texto);
    if (!termino || termino.trim() === "") return textoSeguro;

    const regex = new RegExp(`(${termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return textoSeguro.replace(regex, '<mark class="highlight">$1</mark>');
  }

  function mostrarEstado(mensaje, esError = false) {
    tableWrapper.style.display = "none";
    statusContainer.style.display = "block";
    statusContainer.textContent = mensaje;
    statusContainer.className = esError ? "status-message error" : "status-message";
    resultsCount.textContent = "";
  }

  function renderizarResultados(avistamientos, termino) {
    if (!avistamientos || avistamientos.length === 0) {
      mostrarEstado("No se encontraron avistamientos que coincidan con la búsqueda.");
      return;
    }

    resultsTbody.innerHTML = "";
    statusContainer.style.display = "none";
    tableWrapper.style.display = "block";
    resultsCount.textContent = `${avistamientos.length} resultado(s) encontrado(s)`;

    avistamientos.forEach((item) => {
      const tr = document.createElement("tr");
      tr.id = `row-avistamiento-${item.id}`;
      const esSinNota = item.notaPromedio === "-";
      const badgeClase = esSinNota ? "badge-nota sin-nota" : "badge-nota";

      tr.innerHTML = `
        <td>${resaltarTexto(item.nombreVoluntario, termino)}</td>
        <td>${escapeHTML(item.diaAvistamiento)}</td>
        <td><strong>${resaltarTexto(item.nombreAve, termino)}</strong></td>
        <td>${resaltarTexto(item.nombreComuna, termino)}</td>
        <td>
          <span id="promedio-${item.id}" class="${badgeClase}">${escapeHTML(item.notaPromedio)}</span>
        </td>
        <td>
          <button type="button" class="btn-evaluar" data-id="${item.id}" data-ave="${escapeHTML(item.nombreAve)}" data-voluntario="${escapeHTML(item.nombreVoluntario)}">
            Evaluar
          </button>
        </td>
      `;

      resultsTbody.appendChild(tr);
    });

    document.querySelectorAll(".btn-evaluar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"), 10);
        const ave = btn.getAttribute("data-ave");
        const voluntario = btn.getAttribute("data-voluntario");
        abrirModalEvaluacion(id, ave, voluntario);
      });
    });
  }

  function buscarAvistamientos(termino) {
    if (!termino || termino.trim().length === 0) {
      mostrarEstado("Comience a escribir en el buscador para ver los avistamientos.");
      return;
    }

    mostrarEstado("Buscando avistamientos...");

    fetch(`/api/avistamientos?q=${encodeURIComponent(termino.trim())}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error en el servidor (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        renderizarResultados(data, termino.trim());
      })
      .catch((error) => {
        console.error("Error al buscar avistamientos:", error);
        mostrarEstado("Ocurrió un error al realizar la búsqueda. Por favor intente nuevamente.", true);
      });
  }

  searchInput.addEventListener("input", (e) => {
    const termino = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      buscarAvistamientos(termino);
    }, 300);
  });

  function abrirModalEvaluacion(id, ave, voluntario) {
    currentAvistamientoId = id;
    selectedRating = null;

    modalDescription.textContent = `Seleccione una nota del 1 al 7 para el avistamiento de "${ave}" registrado por "${voluntario}":`;

    ratingButtons.forEach((b) => b.classList.remove("selected"));
    btnConfirmarModal.disabled = true;

    modalEvaluar.classList.add("active");
  }

  function cerrarModalEvaluacion() {
    modalEvaluar.classList.remove("active");
    currentAvistamientoId = null;
    selectedRating = null;
  }

  ratingButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      ratingButtons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedRating = parseInt(btn.getAttribute("data-value"), 10);
      btnConfirmarModal.disabled = false;
    });
  });

  btnCancelarModal.addEventListener("click", cerrarModalEvaluacion);

  modalEvaluar.addEventListener("click", (e) => {
    if (e.target === modalEvaluar) {
      cerrarModalEvaluacion();
    }
  });

  btnConfirmarModal.addEventListener("click", () => {
    if (!currentAvistamientoId) return;
    if (!Number.isInteger(selectedRating) || selectedRating < 1 || selectedRating > 7) {
      alert("La nota seleccionada debe ser un número entero entre 1 y 7.");
      return;
    }

    btnConfirmarModal.disabled = true;
    btnConfirmarModal.textContent = "Guardando...";

    fetch(`/api/avistamientos/${currentAvistamientoId}/nota`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ nota: selectedRating })
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errData) => {
            throw new Error(errData.error || `Error ${response.status}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        const badgePromedio = document.getElementById(`promedio-${data.avistamientoId}`);
        if (badgePromedio) {
          badgePromedio.textContent = data.nuevaNotaPromedio;
          badgePromedio.className = "badge-nota";
        }

        cerrarModalEvaluacion();
      })
      .catch((error) => {
        console.error("Error al registrar la nota:", error);
        alert(`No se pudo guardar la nota: ${error.message}`);
      })
      .finally(() => {
        btnConfirmarModal.textContent = "Guardar Nota";
        btnConfirmarModal.disabled = false;
      });
  });

});
