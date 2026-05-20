import React, { useState, useEffect } from 'react';
import GlassSurface from '../components/GlassSurface';
import './Quiz.css';

// 30 Preguntas estructuradas
const QUESTION_BANK = [
  // Operativas
  { id: 'op1', text: '¿Con qué frecuencia pasa el camión recolector por tu cuadra?', options: [{ text: '3 veces por semana a tiempo', score: 0 }, { text: 'Pasa pero es impuntual', score: 1 }, { text: 'A veces no pasa en semanas', score: 2 }], tags: ['operativas'] },
  { id: 'op2', text: 'Cuando el camión no pasa, ¿qué hace la mayoría de tus vecinos?', options: [{ text: 'Guardan la basura en casa', score: 0 }, { text: 'La dejan en el andén', score: 1 }, { text: 'La tiran a un lote o caño', score: 2, trigger: 'lotes_baldios' }], tags: ['operativas'] },
  { id: 'op3', text: '¿Hay contenedores públicos de basura en tu barrio?', options: [{ text: 'Sí, suficientes y limpios', score: 0 }, { text: 'Hay, pero siempre están llenos', score: 1 }, { text: 'No hay contenedores', score: 2 }], tags: ['operativas'] },
  { id: 'op4', text: '¿Se separan los residuos reciclables en tu hogar?', options: [{ text: 'Siempre separamos plástico/cartón', score: 0 }, { text: 'A veces, cuando nos acordamos', score: 1 }, { text: 'Nunca, todo va en la misma bolsa', score: 2, trigger: 'reciclaje' }], tags: ['operativas'] },
  { id: 'op5', text: '¿Conoces a los recicladores de oficio de tu sector?', options: [{ text: 'Sí, y les entregamos el reciclaje', score: 0 }, { text: 'Los veo pero no interactúo', score: 1 }, { text: 'No conozco a ninguno', score: 2 }], tags: ['operativas'] },
  { id: 'op6', text: '¿Dónde se ubican las basuras de los locales comerciales cercanos?', options: [{ text: 'En depósitos internos', score: 0 }, { text: 'En la vía pública frente al local', score: 1 }, { text: 'En el separador vial o esquina', score: 2 }], tags: ['operativas'] },

  // Climáticas
  { id: 'cl1', text: '¿Qué ocurre con las alcantarillas en tu calle cuando llueve fuerte?', options: [{ text: 'Drenan con normalidad', score: 0 }, { text: 'Se encharca pero fluye lento', score: 1 }, { text: 'Se desbordan e inundan la calle', score: 2, trigger: 'inundaciones' }], tags: ['climaticas'] },
  { id: 'cl2', text: 'Durante los veranos intensos, ¿percibes olores por quema de basuras?', options: [{ text: 'Nunca', score: 0 }, { text: 'Ocasionalmente a lo lejos', score: 1 }, { text: 'Frecuentemente y es asfixiante', score: 2, trigger: 'quema' }], tags: ['climaticas'] },
  { id: 'cl3', text: '¿El calor acelera los malos olores de basuras acumuladas en tu cuadra?', options: [{ text: 'No, porque no hay basura', score: 0 }, { text: 'Sí, un par de días antes del camión', score: 1 }, { text: 'Es un problema constante', score: 2 }], tags: ['climaticas'] },
  { id: 'cl4', text: '¿Has notado un aumento de mosquitos tras días de lluvia intensa?', options: [{ text: 'No, muy normal', score: 0 }, { text: 'Sí, un leve aumento', score: 1 }, { text: 'Demasiados, es una plaga', score: 2, trigger: 'mosquitos' }], tags: ['climaticas'] },
  { id: 'cl5', text: 'Cuando llueve, ¿has visto que los residuos son arrastrados por las corrientes?', options: [{ text: 'Rara vez', score: 0 }, { text: 'Sí, basuras pequeñas', score: 1 }, { text: 'Sí, hasta colchones y muebles', score: 2, trigger: 'taponamiento' }], tags: ['climaticas'] },
  { id: 'cl6', text: '¿Consideras que el clima extremo en Aguachica agrava el problema de residuos?', options: [{ text: 'Poco influye', score: 0 }, { text: 'Agrava los olores', score: 1 }, { text: 'Acelera plagas e inundaciones', score: 2 }], tags: ['climaticas'] },

  // Ambientales
  { id: 'am1', text: '¿Qué estado presenta el tramo del Caño El Pital más cercano a ti?', options: [{ text: 'Limpio y con vegetación', score: 0 }, { text: 'Agua sucia pero fluye', score: 1 }, { text: 'Lleno de basura y estancado', score: 2, trigger: 'cano_pital' }], tags: ['ambientales'] },
  { id: 'am2', text: '¿Qué cantidad de plásticos de un solo uso consumes a la semana?', options: [{ text: 'Evito usarlos', score: 0 }, { text: 'Solo lo indispensable', score: 1 }, { text: 'Gran cantidad diariamente', score: 2 }], tags: ['ambientales'] },
  { id: 'am3', text: '¿Has visto animales silvestres o domésticos comiendo de botaderos ilegales?', options: [{ text: 'Nunca', score: 0 }, { text: 'Alguna vez un perro callejero', score: 1 }, { text: 'Sí, cerdos, perros y aves de carroña', score: 2 }], tags: ['ambientales'] },
  { id: 'am4', text: '¿Existen lotes baldíos (sin construir/cercar) en tu vecindario?', options: [{ text: 'No, todo está construido', score: 0 }, { text: 'Sí, pero limpios', score: 1 }, { text: 'Sí, y los usan de basurero', score: 2, trigger: 'lotes_baldios' }], tags: ['ambientales'] },
  { id: 'am5', text: '¿Con qué frecuencia ves escombros de construcción en vías públicas?', options: [{ text: 'Casi nunca', score: 0 }, { text: 'A veces alguien remodela', score: 1 }, { text: 'Es un paisaje cotidiano', score: 2 }], tags: ['ambientales'] },
  { id: 'am6', text: '¿Cuentas con aljibe o pozo profundo en tu casa?', options: [{ text: 'No, usamos acueducto', score: 0 }, { text: 'Sí, pero solo para trapear', score: 1 }, { text: 'Sí, y es nuestra fuente principal', score: 2, trigger: 'aljibes' }], tags: ['ambientales'] },

  // Sanitarias
  { id: 'sa1', text: '¿Alguien en tu familia ha padecido Dengue, Zika o Chikungunya recientemente?', options: [{ text: 'Nadie', score: 0 }, { text: 'Un familiar lejano', score: 1 }, { text: 'Sí, en mi núcleo familiar', score: 2, trigger: 'enfermedades_vectoriales' }], tags: ['sanitarias'] },
  { id: 'sa2', text: '¿Suelen sufrir problemas gastrointestinales recurrentes en tu casa?', options: [{ text: 'No, rara vez', score: 0 }, { text: 'Ocasionalmente', score: 1 }, { text: 'Sí, muy frecuentemente', score: 2, trigger: 'gastrointestinales' }], tags: ['sanitarias'] },
  { id: 'sa3', text: '¿Cómo manejas los residuos de medicamentos o elementos cortopunzantes?', options: [{ text: 'Puntos rojos de farmacias', score: 0 }, { text: 'En envase cerrado pero a la basura común', score: 1 }, { text: 'A la bolsa de basura junto al resto', score: 2 }], tags: ['sanitarias'] },
  { id: 'sa4', text: 'Durante la quema de basuras cercana, ¿sufres problemas respiratorios?', options: [{ text: 'No hay quemas cerca', score: 0 }, { text: 'Me molesta el olor pero no me enfermo', score: 1 }, { text: 'Sí, desata asma o alergias severas', score: 2 }], tags: ['sanitarias'] },
  { id: 'sa5', text: '¿Qué control de plagas realizan en tu vivienda?', options: [{ text: 'Fumigación regular', score: 0 }, { text: 'Solo insecticidas comerciales a veces', score: 1 }, { text: 'Ninguno, convivimos con plagas', score: 2 }], tags: ['sanitarias'] },
  { id: 'sa6', text: 'Si ves una llanta abandonada con agua lluvia, ¿qué haces?', options: [{ text: 'La vacío o volteo', score: 0 }, { text: 'Llamo a alguien que la retire', score: 1 }, { text: 'La ignoro, no es mía', score: 2, trigger: 'mosquitos' }], tags: ['sanitarias'] },

  // Sociales
  { id: 'so1', text: 'Si un vecino tira basura en la calle, ¿lo corriges?', options: [{ text: 'Sí, hablo con él pacíficamente', score: 0 }, { text: 'Me enoja pero me quedo callado', score: 1 }, { text: 'No me importa, todos lo hacen', score: 2, trigger: 'cultura_baja' }], tags: ['sociales'] },
  { id: 'so2', text: '¿Existen multas (comparendos ambientales) efectivos en tu zona?', options: [{ text: 'Sí, la policía sanciona', score: 0 }, { text: 'He escuchado pero nunca he visto una', score: 1 }, { text: 'Las autoridades son indiferentes', score: 2 }], tags: ['sociales'] },
  { id: 'so3', text: '¿Participarías en una jornada de limpieza de tu cuadra un domingo?', options: [{ text: '¡Por supuesto!', score: 0 }, { text: 'Si pagan o dan algo a cambio', score: 1 }, { text: 'No, para eso pago impuestos', score: 2, trigger: 'cultura_baja' }], tags: ['sociales'] },
  { id: 'so4', text: '¿Has recibido educación sobre separación de basuras en colegios/eventos locales?', options: [{ text: 'Sí, bastante', score: 0 }, { text: 'Muy superficial', score: 1 }, { text: 'Nunca', score: 2 }], tags: ['sociales'] },
  { id: 'so5', text: 'Si pagaras a un carretillero para llevarse escombros, ¿te aseguras dónde los bota?', options: [{ text: 'Sí, le exijo que vaya a un punto autorizado', score: 0 }, { text: 'Asumo que sabe hacer su trabajo', score: 1 }, { text: 'Solo me importa que se los lleve', score: 2, trigger: 'lotes_baldios' }], tags: ['sociales'] },
  { id: 'so6', text: '¿Crees que el problema de las basuras es responsabilidad de...', options: [{ text: 'Todos (ciudadanos, alcaldía, empresas)', score: 0 }, { text: 'La empresa de aseo', score: 1 }, { text: 'Únicamente el alcalde de turno', score: 2 }], tags: ['sociales'] },
];

function shuffle(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function Quiz({ setRoute }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState({ inundacion: 0, sanitaria: 0, cultura: 0 });
  const [triggers, setTriggers] = useState(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Fisher-Yates shuffle & take 10
    setQuestions(shuffle(QUESTION_BANK).slice(0, 10));
    setScores({ inundacion: 0, sanitaria: 0, cultura: 0 });
    setTriggers(new Set());
    setCurrentIndex(0);
    setIsFinished(false);
  }, []);

  const handleAnswer = (option, question) => {
    if (animating) return;
    
    // Sumar puntaje según categoría
    const scoreVal = option.score;
    const cat = question.tags[0];
    
    let deltaInun = 0; let deltaSan = 0; let deltaCul = 0;
    if (cat === 'climaticas' || cat === 'operativas') deltaInun += scoreVal;
    if (cat === 'sanitarias' || cat === 'ambientales') deltaSan += scoreVal;
    if (cat === 'sociales' || cat === 'operativas') deltaCul += scoreVal;

    setScores(prev => ({
      inundacion: prev.inundacion + deltaInun,
      sanitaria: prev.sanitaria + deltaSan,
      cultura: prev.cultura + deltaCul
    }));

    if (option.trigger) {
      setTriggers(prev => new Set(prev).add(option.trigger));
    }

    setAnimating(true);
    setTimeout(() => {
      if (currentIndex < 9) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
      setAnimating(false);
    }, 400); // fade duration
  };

  const calculatePercentages = () => {
    // Con 10 preguntas aleatorias, el máximo realista por rubro es ~6-7 puntos
    // Se normaliza a 100% cuando se alcanza ese máximo
    const normalize = (val) => Math.min(100, Math.round((val / 6) * 100));
    return {
      inundacion: normalize(scores.inundacion),
      sanitaria: normalize(scores.sanitaria),
      cultura: normalize(scores.cultura)
    };
  };

  const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

  const getAdvice = () => {
    const advice = [];
    const percents = calculatePercentages();

    const floodAdvices = {
      high: [
        "RIESGO ALTO DE INUNDACIÓN: Tu zona está en peligro crítico. Acciones urgentes: 1. Contacta a la alcaldía para limpiar alcantarillas, 2. Participa en jornadas de destape de rejillas, 3. Mapea puntos de encharcamiento, 4. Crea un grupo de alerta con vecinos.",
        "INUNDACIÓN GRAVE: Organiza revisiones comunitarias de drenaje. 1. Exige mantenimiento, 2. Retira escombros de canales, 3. Refuerza cunetas, 4. Comparte datos de lluvia con tu barrio.",
      ],
      medium: [
        "RIESGO MODERADO DE INUNDACIÓN: Hay vulnerabilidad en tu sector. 1. Instala cunetas, 2. Participa en limpieza de canales, 3. Exige mantenimiento de sumideros, 4. Construye reservorios domésticos.",
        "ATENCIÓN ANTE LLUVIAS: Mejora el drenaje local. 1. Limpia rejillas y cunetas, 2. Evita tirar basura al sistema pluvial, 3. Protege áreas de almacenamiento, 4. Crea un plan conjunto con vecinos.",
      ],
      low: [
        "RIESGO BAJO DE INUNDACIÓN: Tu zona tiene buen drenaje. Mantén la limpieza: 1. Conserva las alcantarillas libres, 2. Despeja áreas comunes, 3. Observa cambios climáticos extremos, 4. Comparte buenas prácticas.",
        "BUEN DRENAJE: Usa tu ventaja para liderar. 1. Inspira con limpieza de calles, 2. Documenta alcantarillas sanas, 3. Protege zonas de escorrentía, 4. Organiza jornadas de mantenimiento.",
      ]
    };

    const healthAdvices = {
      high: [
        "CRISIS SANITARIA GRAVE: Tu familia está en riesgo alto. 1. Hierve y filtra toda el agua, 2. Elimina aljibes peligrosos, 3. Usa mosquiteros, 4. Consulta médico ante síntomas, 5. Denuncia posibles casos de dengue.",
        "RIESGO SANITARIO URGENTE: Refuerza la protección inmediata. 1. Trata el agua, 2. Evita criaderos de mosquitos, 3. Usa repelentes, 4. Inspecciona tu casa cada semana.",
      ],
      medium: [
        "RIESGO SANITARIO MODERADO: Reforzar medidas preventivas. 1. Mejora el tratamiento del agua, 2. Elimina recipientes con agua estancada, 3. Vacuna si hay campañas, 4. Mantén tu vivienda fumigada.",
        "PREVENCIÓN ACTIVA: Evita que el riesgo aumente. 1. Usa cloro o filtros, 2. Vacía agua quieta, 3. Revisa recipientes, 4. Educa a tu familia sobre vectores.",
      ],
      low: [
        "PROTECCIÓN SANITARIA ADECUADA: Tu gestión es buena. 1. Controla agua estancada, 2. Usa protección anti-mosquitos, 3. Mantén higiene básica, 4. Reporta focos de riesgo.",
        "SALUD BIEN RESGUARDADA: Sigue con lo que funciona. 1. No dejes agua acumulada, 2. Ventila tu hogar, 3. Revisa alimentos y medicinas, 4. Comparte esta cultura familiar.",
      ]
    };

    const cultureAdvices = {
      high: [
        "DÉFICIT GRAVE DE CULTURA AMBIENTAL: Cambia la mentalidad comunitaria. 1. Organiza talleres ambientales, 2. Forma un grupo de recicladores, 3. Propón sanciones contra basura, 4. Lidera campañas locales.",
        "ALTA DEFICIENCIA CULTURAL: El cambio depende de liderazgo. 1. Crea conciencia en tu cuadra, 2. Fomenta separación de residuos, 3. Comparte información, 4. Incentiva acciones sostenibles.",
      ],
      medium: [
        "CULTURA AMBIENTAL EN DESARROLLO: Hay interés pero falta compromiso. 1. Separa residuos, 2. Invita a ver el documental del Caño El Pital, 3. Crea puntos de acopio, 4. Conecta con recicladores.",
        "MEJORA DE CULTURA CIUDADANA: Continúa el esfuerzo. 1. Comparte prácticas de reciclaje, 2. Organiza jornadas de limpieza, 3. Promueve el civismo, 4. Busca apoyo institucional.",
      ],
      low: [
        "BUENA CONCIENCIA AMBIENTAL: Eres ejemplo. 1. Enseña a otros a separar residuos, 2. Promueve reciclaje formal, 3. Documenta mejoras, 4. Motiva a tu barrio.",
        "CULTURA SANA: Mantén espacios limpios. 1. Comparte lo que sabes, 2. Apoya iniciativas locales, 3. Inspira con acciones concretas.",
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
        "CAÑO EL PITAL EN PELIGRO: Demanda acción inmediata. 1. Denuncia botaderos ilegales, 2. Participa en brigadas de limpieza, 3. Planta árboles nativos, 4. Presiona por el cierre de vertederos informales.",
        "RIESGO CRÍTICO EN EL CAÑO: Protege este ecosistema. 1. Reporta descargas, 2. Organiza vigilancia comunitaria, 3. Informa a autoridades ambientales, 4. Haz visible el daño con fotos.",
      ],
      lotes_baldios: [
        "LOTES BALDÍOS = BOTADEROS: Actúa rápidamente. 1. Identifica propietarios, 2. Recolecta basura peligrosa, 3. Denuncia incumplimientos, 4. Propón huertas comunitarias.",
        "TERRENOS ABANDONADOS, RIESGO ALTO: Exige ordenamiento. 1. Señala lotes sucios, 2. Promueve cercado, 3. Solicita limpieza municipal, 4. Busca uso social del espacio.",
      ],
      mosquitos: [
        "PLAGA DE MOSQUITOS: Control inmediato. 1. Elimina agua estancada, 2. Pide fumigación, 3. Usa mosquiteros, 4. Aplica larvicida autorizado, 5. Educa a vecinos.",
        "RIESGO VECTORIAL ALTO: Reduce criaderos ya. 1. Vacía llantas y recipientes, 2. Mantén cisternas tapadas, 3. Limpia cubetas, 4. Reporta focos al municipio.",
      ],
      reciclaje: [
        "OPORTUNIDAD DE RECICLAJE: Formaliza tu gestión. 1. Contacta asociaciones de recicladores, 2. Vende residuos aprovechables, 3. Enseña a tu familia a separar, 4. Crea un centro de acopio.",
        "ECONOMÍA CIRCULAR LOCAL: Transforma residuos en recursos. 1. Identifica materiales recuperables, 2. Conecta con recicladores, 3. Difunde buenas prácticas, 4. Motiva a tus vecinos.",
      ],
      quema: [
        "QUEMA ILEGAL DE BASURA: Denuncia y evita daños. 1. Identifica responsables, 2. Toma pruebas, 3. Reúnete con vecinos, 4. Propón alternativas de disposición.",
        "HUMO TÓXICO EN LA VÍA: Protege tu salud. 1. Reporta la quema, 2. Evita exponerte, 3. Busca compostaje o reuso, 4. Exige orden público.",
      ]
    };

    triggers.forEach((trigger) => {
      if (triggerOptions[trigger]) {
        advice.push(randomItem(triggerOptions[trigger]));
      }
    });

    if (advice.length <= 3) {
      const general = [
        "PRÓXIMOS PASOS: Tu zona necesita liderazgo comunitario. Únete a la junta de acción comunal, organiza reuniones vecinales mensuales y presiona por proyectos de infraestructura.",
        "PERSPECTIVA POSITIVA: Muchos problemas son solucionables con organización. Empieza pequeño (tu cuadra), documenta mejoras y gradualmente expande a tu barrio.",
        "GESTIÓN POSITIVA: Mantén prácticas responsables y busca aliados. Comparte tus avances, motiva a tus vecinos y fortalece la colaboración con instituciones.",
      ];
      advice.push(randomItem(general));
    }

    return shuffle(advice);
  };

  if (questions.length === 0) return <div>Cargando...</div>;

  const currentQ = questions[currentIndex];
  const percents = calculatePercentages();
  const tips = getAdvice();

  return (
    <div className="quiz-wrapper">
      {!isFinished ? (
        <div className="quiz-container">
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${((currentIndex + 1) / 10) * 100}%` }}></div>
          </div>
          <p className="quiz-counter">Pregunta {currentIndex + 1} de 10</p>
          
          <div className={`quiz-card ${animating ? 'fade-out' : 'fade-in'}`}>
            <h2 className="quiz-question">{currentQ.text}</h2>
            <div className="quiz-options">
              {currentQ.options.map((opt, i) => (
                <button 
                  key={i} 
                  className="quiz-btn" 
                  onClick={() => handleAnswer(opt, currentQ)}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="quiz-results">
          <h2 className="results-title">Diagnóstico Ambiental <span className="text-cyan">Comunitario</span></h2>
          
          <div className="dashboard-columns">
            <div className="dash-col-wrapper">
              <span className="col-percent">{percents.inundacion}%</span>
              <GlassSurface
                width={90}
                height={320}
                borderRadius={56}
                className="dash-col-glass dash-inundacion"
                opacity={0.85}
                brightness={70}
                mixBlendMode="screen"
                displace={0.6}
                distortionScale={-120}
                redOffset={0}
                greenOffset={10}
                blueOffset={20}
                saturation={1.2}
                backgroundOpacity={0.18}
              >
                <div className="dash-col-fill fill-inundacion" style={{ height: `${percents.inundacion}%` }} />
              </GlassSurface>
              <p className="col-label">Riesgo Inundación</p>
            </div>
            
            <div className="dash-col-wrapper">
              <span className="col-percent">{percents.sanitaria}%</span>
              <GlassSurface
                width={90}
                height={320}
                borderRadius={56}
                className="dash-col-glass dash-sanitaria"
                opacity={0.85}
                brightness={70}
                mixBlendMode="screen"
                displace={0.6}
                distortionScale={-120}
                redOffset={0}
                greenOffset={10}
                blueOffset={20}
                saturation={1.2}
                backgroundOpacity={0.18}
              >
                <div className="dash-col-fill fill-sanitaria" style={{ height: `${percents.sanitaria}%` }} />
              </GlassSurface>
              <p className="col-label">Crisis Sanitaria</p>
            </div>

            <div className="dash-col-wrapper">
              <span className="col-percent">{percents.cultura}%</span>
              <GlassSurface
                width={90}
                height={320}
                borderRadius={56}
                className="dash-col-glass dash-cultura"
                opacity={0.85}
                brightness={70}
                mixBlendMode="screen"
                displace={0.6}
                distortionScale={-120}
                redOffset={0}
                greenOffset={10}
                blueOffset={20}
                saturation={1.2}
                backgroundOpacity={0.18}
              >
                <div className="dash-col-fill fill-cultura" style={{ height: `${percents.cultura}%` }} />
              </GlassSurface>
              <p className="col-label">Déficit Cultura</p>
            </div>
          </div>

          <div className="advice-section glass-text-box">
            <h3>Recomendaciones del diagnóstico</h3>
            <div className="advice-list">
              {tips.map((tip, i) => <p key={i} className="advice-item">{tip}</p>)}
            </div>
          </div>

          <div className="quiz-actions">
            <button className="nav-btn cyber-hover" onClick={() => {
              setQuestions(shuffle(QUESTION_BANK).slice(0, 10));
              setScores({ inundacion: 0, sanitaria: 0, cultura: 0 });
              setTriggers(new Set());
              setCurrentIndex(0);
              setIsFinished(false);
            }}>Reiniciar Diagnóstico</button>
            <button className="nav-btn cyber-hover" onClick={() => setRoute('home')}>Volver al Inicio</button>
          </div>

          <div className="author-card">
            <p className="author-card-label">Autores</p>
            <p>Jesue Emanuel Grimaldo León</p>
            <p>Gustavo Alberto Rizo Nieto</p>
          </div>
        </div>
      )}
    </div>
  );
}
