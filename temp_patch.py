from pathlib import Path
path = Path('src/pages/Quiz.jsx')
text = path.read_text(encoding='utf-8')
old = """  const getAdvice = () => {
    const advice = [];
    const percents = calculatePercentages();

    // Recomendaciones por Riesgo de Inundación
    if (percents.inundacion >= 70) {
      advice.push(\"RIESGO ALTO DE INUNDACIÓN: Tu zona está en peligro crítico. Acciones inmediatas: 1) Contacta a la alcaldía para limpiar alcantarillas, 2) Participa en jornadas comunitarias de destape de rejillas, 3) Documenta los puntos de encharcamiento con fotos geolocalizadas, 4) Crea un grupo de WhatsApp con vecinos para alertas ante lluvia intensa.\");
    } else if (percents.inundacion >= 40) {
      advice.push(\"RIESGO MODERADO DE INUNDACIÓN: Hay vulnerabilidad en tu sector. Medidas: 1) Instala cunetas en tu vivienda, 2) Participa activamente en la limpieza de canales pluviales, 3) Exige mantenimiento de sumideros cada semestre, 4) Crea reservorios caseros para agua de lluvia.\");
    } else {
      advice.push(\"RIESGO BAJO DE INUNDACIÓN: Tu zona tiene buen drenaje. Mantén: 1) Las alcantarillas limpias, 2) Las áreas comunes despejadas, 3) Monitorea cambios climáticos extremos.\");
    }

    // Recomendaciones por Crisis Sanitaria
    if (percents.sanitaria >= 70) {
      advice.push(\"CRISIS SANITARIA GRAVE: Tu familia está en riesgo alto. Acciones urgentes: 1) Hierve y filtra TODA el agua antes de beber, 2) Descarta aljibes y pozo profundos si es posible, 3) Usa mosquiteros y repelente (especialmente en atardeceres), 4) Consulta médico ante cualquier fiebre o síntoma extraño, 5) Denuncia casos de dengue a Salud Pública.\");
    } else if (percents.sanitaria >= 40) {
      advice.push(\"RIESGO SANITARIO MODERADO: Necesitas reforzar medidas preventivas. 1) Mejora el tratamiento del agua en casa (hervir, filtrar o cloro), 2) Elimina recipientes con agua estancada cada semana, 3) Vacuna a tu familia contra dengue si hay campañas, 4) Mantén tu vivienda fumigada.\");
    } else {
      advice.push(\"PROTECCIÓN SANITARIA ADECUADA: Tu gestión es buena. Sigue: 1) Controlando agua estancada, 2) Usando protección anti-mosquitos, 3) Manteniendo higiene básica, 4) Reportando focos de enfermedad.\");
    }

    // Recomendaciones por Déficit Cultura
    if (percents.cultura >= 70) {
      advice.push(\"DÉFICIT GRAVE DE CULTURA AMBIENTAL: Urgente cambio de mentalidad comunitaria. Estrategia: 1) Participa en talleres de educación ambiental (colegio, iglesia, junta), 2) Crea un grupo de recicladores formales con incentivos, 3) Propón multas comunitarias para quien bote basura en vía pública, 4) Lidera campañas de 'Aguachica Limpia' cada mes.\");
    } else if (percents.cultura >= 40) {
      advice.push(\"CULTURA AMBIENTAL EN DESARROLLO: Hay interés pero falta compromiso. Acciones: 1) Separa tus residuos (plástico, papel, orgánico) y encuéntrales destino, 2) Invita a vecinos a ver el documental sobre el Caño El Pital, 3) Crea puntos de acopio en tu cuadra, 4) Conecta con recicladores locales.\");
    } else {
      advice.push(\"BUENA CONCIENCIA AMBIENTAL: Eres ejemplo. Amplifica: 1) Enseña a otros cómo separar residuos, 2) Promueve el reciclaje formal en tu barrio, 3) Documenta mejoras en espacios públicos.\");
    }

    // Recomendaciones específicas por triggers
    if (triggers.has('cano_pital')) {
      advice.push(\"CAÑO EL PITAL EN PELIGRO: Este ecosistema es crítico. Demanda: 1) Denuncia botaderos ilegales a CORPOCESAR, 2) Participa en brigadas de limpieza del caño, 3) Planta árboles nativos en sus orillas, 4) Presiona para que se cierren vertederos informales.\");
    }
    
    if (triggers.has('lotes_baldios')) {
      advice.push(\"LOTES BALDÍOS = BOTADEROS: Estos terrenos son focos infecciosos. Actúa: 1) Identifica propietarios y exígeles cercamiento, 2) Recolecta basura peligrosa (vidrio, metal) juntos, 3) Denuncia a la alcaldía por incumplimiento de normas, 4) Propón proyectos comunitarios (huerta, parque).\");
    }
    
    if (triggers.has('mosquitos')) {
      advice.push(\"PLAGA DE MOSQUITOS: Control inmediato necesario. Medidas: 1) Elimina TODA agua estancada (llantas, macetas, tapas), 2) Pide fumigación barrial al municipio, 3) Usa mosquiteros en ventanas, 4) Aplica larvicida en cunetas si es autorizado, 5) Educa a vecinos sobre focos.\");
    }

    if (triggers.has('reciclaje')) {
      advice.push(\"OPORTUNIDAD DE RECICLAJE: Formaliza tu gestión. Plan: 1) Contacta a asociaciones de recicladores locales, 2) Vende residuos aprovechables (cartón, plástico, metal) en lugar de botarlos, 3) Enseña a tu familia a separar desde la fuente, 4) Crea un centro de acopio barrial.\");
    }

    if (triggers.has('quema')) {
      advice.push(\"QUEMA ILEGAL DE BASURA: Grave problema de salud. Denuncia: 1) Identifica quién quema y reporta a policía ambiental, 2) Toma videos como prueba, 3) Reúnete con vecinos para prohibir quemas, 4) Propón alternativas (composting, enterramiento controlado).\");
    }

    // Si no se disparan triggers muy específicos, dar recomendación personalizada general
    if (advice.length <= 3) {
      const avgScore = (percents.inundacion + percents.sanitaria + percents.cultura) / 3;
      if (avgScore >= 60) {
        advice.push(\"PRÓXIMOS PASOS: Tu zona necesita liderazgo comunitario. Únete a la junta de acción comunal, organiza reuniones vecinales mensuales, y presiona por proyectos de infraestructura (rellenos sanitarios, plantas de tratamiento).\");
      } else {
        advice.push(\"PERSPECTIVA POSITIVA: Muchos problemas son solucionables con organización. Empieza pequeño (tu cuadra), documenta mejoras, y gradualmente expande a tu barrio.\");
      }
    }

    return advice;
  };"""
new = """  const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

  const getAdvice = () => {
    const advice = [];
    const percents = calculatePercentages();

    const floodAdvices = {
      high: [
        \"RIESGO ALTO DE INUNDACIÓN: Tu zona está en peligro crítico. Acciones urgentes: 1) Contacta a la alcaldía para limpiar alcantarillas, 2) Participa en jornadas de destape de rejillas, 3) Mapea puntos de encharcamiento, 4) Crea un grupo de alerta con vecinos.\",
        \"INUNDACIÓN GRAVE: Organiza revisiones comunitarias de drenaje. 1) Exige mantenimiento, 2) Retira escombros de canales, 3) Refuerza cunetas, 4) Comparte datos de lluvia con tu barrio.\",
      ],
      medium: [
        \"RIESGO MODERADO DE INUNDACIÓN: Hay vulnerabilidad en tu sector. 1) Instala cunetas, 2) Participa en limpieza de canales, 3) Exige mantenimiento de sumideros, 4) Construye reservorios domésticos.\",
        \"ATENCIÓN ANTE LLUVIAS: Mejora el drenaje local. 1) Limpia rejillas y cunetas, 2) Evita tirar basura al sistema pluvial, 3) Protege áreas de almacenamiento, 4) Crea un plan conjunto con vecinos.\",
      ],
      low: [
        \"RIESGO BAJO DE INUNDACIÓN: Tu zona tiene buen drenaje. Mantén la limpieza: 1) Conserva las alcantarillas libres, 2) Despeja áreas comunes, 3) Observa cambios climáticos extremos, 4) Comparte buenas prácticas.\",
        \"BUEN DRENAJE: Usa tu ventaja para liderar. 1) Inspira con limpieza de calles, 2) Documenta alcantarillas sanas, 3) Protege zonas de escorrentía, 4) Organiza jornadas de mantenimiento.\",
      ]
    };

    const healthAdvices = {
      high: [
        \"CRISIS SANITARIA GRAVE: Tu familia está en riesgo alto. 1) Hierve y filtra toda el agua, 2) Elimina aljibes peligrosos, 3) Usa mosquiteros, 4) Consulta médico ante síntomas, 5) Denuncia posibles casos de dengue.\",
        \"RIESGO SANITARIO URGENTE: Refuerza la protección inmediata. 1) Trata el agua, 2) Evita criaderos de mosquitos, 3) Usa repelentes, 4) Inspecciona tu casa cada semana.\",
      ],
      medium: [
        \"RIESGO SANITARIO MODERADO: Reforzar medidas preventivas. 1) Mejora el tratamiento del agua, 2) Elimina recipientes con agua estancada, 3) Vacuna si hay campañas, 4) Mantén tu vivienda fumigada.\",
        \"PREVENCIÓN ACTIVA: Evita que el riesgo aumente. 1) Usa cloro o filtros, 2) Vacía agua quieta, 3) Revisa recipientes, 4) Educa a tu familia sobre vectores.\",
      ],
      low: [
        \"PROTECCIÓN SANITARIA ADECUADA: Tu gestión es buena. 1) Controla agua estancada, 2) Usa protección anti-mosquitos, 3) Mantén higiene básica, 4) Reporta focos de riesgo.\",
        \"SALUD BIEN RESGUARDADA: Sigue con lo que funciona. 1) No dejes agua acumulada, 2) Ventila tu hogar, 3) Revisa alimentos y medicinas, 4) Comparte esta cultura familiar.\",
      ]
    };

    const cultureAdvices = {
      high: [
        \"DÉFICIT GRAVE DE CULTURA AMBIENTAL: Cambia la mentalidad comunitaria. 1) Organiza talleres ambientales, 2) Forma un grupo de recicladores, 3) Propón sanciones contra basura, 4) Lidera campañas locales.\",
        \"ALTA DEFICIENCIA CULTURAL: El cambio depende de liderazgo. 1) Crea conciencia en tu cuadra, 2) Fomenta separación de residuos, 3) Comparte información, 4) Incentiva acciones sostenibles.\",
      ],
      medium: [
        \"CULTURA AMBIENTAL EN DESARROLLO: Hay interés pero falta compromiso. 1) Separa residuos, 2) Invita a ver el documental del Caño El Pital, 3) Crea puntos de acopio, 4) Conecta con recicladores.\",
        \"MEJORA DE CULTURA CIUDADANA: Continúa el esfuerzo. 1) Comparte prácticas de reciclaje, 2) Organiza jornadas de limpieza, 3) Promueve el civismo, 4) Busca apoyo institucional.\",
      ],
      low: [
        \"BUENA CONCIENCIA AMBIENTAL: Eres ejemplo. 1) Enseña a otros a separar residuos, 2) Promueve reciclaje formal, 3) Documenta mejoras, 4) Motiva a tu barrio.\",
        \"CULTURA SANA: Mantén espacios limpios. 1) Comparte lo que sabes, 2) Apoya iniciativas locales, 3) Inspira con acciones concretas.\",
      ]
    };

    if (percents.inundacion >= 70) advice.push(randomItem(floodAdvices.high));
    else if (percents.inundacion >= 40) advice.push(randomItem(floodAdvices.medium));
    else advice.push(randomItem(floodAdvices.low));

    if (percents.sanitaria >= 70) advice.push(randomItem(healthAdvices.high));
    else if (percents.sanitaria >= 40) advice.push(randomItem(healthAdvices.medium));
    else advice.push(randomItem(healthAdvices.low));

    if (percents.cultura >= 70) advice.push(randomItem(cultureAdvices.high));
    else if (percents.cultura >= 40) advice.push(randomItem(cultureAdvices.medium));
    else advice.push(randomItem(cultureAdvices.low));

    const triggerOptions = {
      cano_pital: [
        \"CAÑO EL PITAL EN PELIGRO: Demanda acción inmediata. 1) Denuncia botaderos ilegales, 2) Participa en brigadas de limpieza, 3) Planta árboles nativos, 4) Presiona por el cierre de vertederos informales.\",
        \"RIESGO CRÍTICO EN EL CAÑO: Protege este ecosistema. 1) Reporta descargas, 2) Organiza vigilancia comunitaria, 3) Informa a autoridades ambientales, 4) Haz visible el daño con fotos.\",
      ],
      lotes_baldios: [
        \"LOTES BALDÍOS = BOTADEROS: Actúa rápidamente. 1) Identifica propietarios, 2) Recolecta basura peligrosa, 3) Denuncia incumplimientos, 4) Propón huertas comunitarias.\",
        \"TERRENOS ABANDONADOS, RIESGO ALTO: Exige ordenamiento. 1) Señala lotes sucios, 2) Promueve cercado, 3) Solicita limpieza municipal, 4) Busca uso social del espacio.\",
      ],
      mosquitos: [
        \"PLAGA DE MOSQUITOS: Control inmediato. 1) Elimina agua estancada, 2) Pide fumigación, 3) Usa mosquiteros, 4) Aplica larvicida autorizado, 5) Educa a vecinos.\",
        \"RIESGO VECTORIAL ALTO: Reduce criaderos ya. 1) Vacía llantas y recipientes, 2) Mantén cisternas tapadas, 3) Limpia cubetas, 4) Reporta focos al municipio.\",
      ],
      reciclaje: [
        \"OPORTUNIDAD DE RECICLAJE: Formaliza tu gestión. 1) Contacta asociaciones de recicladores, 2) Vende residuos aprovechables, 3) Enseña a tu familia a separar, 4) Crea un centro de acopio.\",
        \"ECONOMÍA CIRCULAR LOCAL: Transforma residuos en recursos. 1) Identifica materiales recuperables, 2) Conecta con recicladores, 3) Difunde buenas prácticas, 4) Motiva a tus vecinos.\",
      ],
      quema: [
        \"QUEMA ILEGAL DE BASURA: Denuncia y evita daños. 1) Identifica responsables, 2) Toma pruebas, 3) Reúnete con vecinos, 4) Propón alternativas de disposición.\",
        \"HUMO TÓXICO EN LA VÍA: Protege tu salud. 1) Reporta la quema, 2) Evita exponerte, 3) Busca compostaje o reuso, 4) Exige orden público.\",
      ]
    };

    triggers.forEach((trigger) => {
      if (triggerOptions[trigger]) {
        advice.push(randomItem(triggerOptions[trigger]));
      }
    });

    if (advice.length <= 3) {
      const general = [
        \"PRÓXIMOS PASOS: Tu zona necesita liderazgo comunitario. Únete a la junta de acción comunal, organiza reuniones vecinales mensuales y presiona por proyectos de infraestructura.\",
        \"PERSPECTIVA POSITIVA: Muchos problemas son solucionables con organización. Empieza pequeño (tu cuadra), documenta mejoras y gradualmente expande a tu barrio.\",
        \"GESTIÓN POSITIVA: Mantén prácticas responsables y busca aliados. Comparte tus avances, motiva a tus vecinos y fortalece la colaboración con instituciones.\",
      ];
      advice.push(randomItem(general));
    }

    return shuffle(advice);
  };"""
if old not in text:
    raise SystemExit('OLD block not found')
path.write_text(text.replace(old, new), encoding='utf-8')
print('updated')
