const baseAlumnosCEYFA = [
  // Alumno 1 ➡️ Usuario: 12345678 | Contraseña CamelCase: MateoSilva
  { 
    cedula: "12345678", 
    clave: "MateoSilva", 
    nombre: "Mateo Silva", 
    cuotaPaga: true,
    agendadas: 3, 
    restantes: 2,
    plan: "Básico",
    frecuencia: "1 vez por semana",
    clasesMes: "4 - 5 clases al mes",
    clasesHistorial: [
      { fecha: "2026-08-04", estado: "agendada" },
      { fecha: "2026-08-11", estado: "suspendida" },
      { fecha: "2026-08-18", estado: "agendada" }
    ]
  },

  // Alumno 2 ➡️ Usuario: 87654321 | Contraseña CamelCase: NicolasPerez
  { 
    cedula: "87654321", 
    clave: "NicolasPerez", 
    nombre: "Nicolás Pérez", 
    cuotaPaga: true,
    agendadas: 5, 
    restantes: 7,
    plan: "Competencia",
    frecuencia: "3 veces por semana",
    clasesMes: "12 - 13 clases al mes",
    clasesHistorial: [
      { fecha: "2026-08-03", estado: "agendada" },
      { fecha: "2026-08-10", estado: "suspendida" },
      { fecha: "2026-08-17", estado: "agendada" }
    ]
  }
];