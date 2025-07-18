let cursos = [];

fetch("cursos.json")
  .then(res => res.json())
  .then(data => {
    cursos = data;
    mostrarMalla();
  });

function mostrarMalla() {
  const malla = document.getElementById("malla");
  if (!malla) return;
  malla.innerHTML = "";

  const progreso = JSON.parse(localStorage.getItem("progreso") || "{}");

  const ciclos = {};
  cursos.forEach(curso => {
    if (!ciclos[curso.ciclo]) ciclos[curso.ciclo] = [];
    ciclos[curso.ciclo].push(curso);
  });

  Object.keys(ciclos)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(ciclo => {
      const columna = document.createElement("div");
      columna.classList.add("ciclo");

      const titulo = document.createElement("h2");
      titulo.textContent = `Ciclo ${ciclo}`;
      columna.appendChild(titulo);

      ciclos[ciclo].forEach(curso => {
        const tipo = curso.condicion?.toLowerCase() || "";
        const esObligatorio = tipo.includes("oblig");
        const esElectivo = tipo.includes("elect");

        const div = document.createElement("div");
        div.className = "curso";
        div.textContent = curso.nombre;
        div.dataset.codigo = curso.codigo;
        div.dataset.requisitos = JSON.stringify(curso.requisitos || []);
        div.dataset.tipo = tipo;

        if (esElectivo) div.classList.add("electivo");
        if (progreso[curso.codigo]) div.classList.add("completado");

        columna.appendChild(div);
      });

      malla.appendChild(columna);
    });

  actualizarCursos();
  agregarEventosCurso();
}

function actualizarCursos() {
  const cursosDOM = document.querySelectorAll(".curso");
  const completados = Array.from(document.querySelectorAll(".curso.completado"))
    .map(el => el.dataset.codigo);

  cursosDOM.forEach(curso => {
    const requisitos = JSON.parse(curso.dataset.requisitos || "[]");
    const habilitado = requisitos.length === 0 || requisitos.every(r => completados.includes(r));

    curso.classList.remove("bloqueado");

    if (!habilitado && !curso.classList.contains("completado")) {
      curso.classList.add("bloqueado");
    }

    // Evita estilos inline, solo usamos clases
    curso.style.backgroundColor = "";
    curso.style.color = "";
    curso.style.textDecoration = curso.classList.contains("completado") ? "line-through" : "none";
  });

  guardarProgreso();
}

function agregarEventosCurso() {
  const cursosDOM = document.querySelectorAll(".curso");
  cursosDOM.forEach(div => {
    div.addEventListener("click", () => {
      if (div.classList.contains("bloqueado")) return;
      div.classList.toggle("completado");
      actualizarCursos();
    });
  });
}

function guardarProgreso() {
  const cursosDOM = document.querySelectorAll(".curso");
  const progreso = {};
  cursosDOM.forEach(curso => {
    if (curso.classList.contains("completado")) {
      progreso[curso.dataset.codigo] = true;
    }
  });
  localStorage.setItem("progreso", JSON.stringify(progreso));
}
