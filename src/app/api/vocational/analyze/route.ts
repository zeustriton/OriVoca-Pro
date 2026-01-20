import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { VocationalAssessment } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

// Base de datos de carreras con sus características
const CAREER_DATABASE = [
  {
    name: 'Ingeniería de Sistemas / Computación',
    description: 'Diseño, desarrollo y mantenimiento de software y sistemas informáticos',
    riasec: { I: 0.9, R: 0.7, C: 0.6, E: 0.5, A: 0.4, S: 0.3 },
    aptitudes: { numerical: 0.8, abstract: 0.9, problem_solving: 0.9, verbal: 0.5 },
    personality: { openness: 0.8, conscientiousness: 0.7, neuroticism: 0.3 },
  },
  {
    name: 'Medicina',
    description: 'Diagnóstico, tratamiento y prevención de enfermedades humanas',
    riasec: { I: 0.9, S: 0.9, R: 0.7, A: 0.4, C: 0.5, E: 0.4 },
    aptitudes: { numerical: 0.7, abstract: 0.8, problem_solving: 0.9, verbal: 0.7 },
    personality: { openness: 0.7, conscientiousness: 0.9, neuroticism: 0.4, agreeableness: 0.8 },
  },
  {
    name: 'Derecho',
    description: 'Aplicación y estudio del sistema legal, representación legal y asesoría jurídica',
    riasec: { E: 0.8, S: 0.6, C: 0.7, I: 0.6, A: 0.4, R: 0.3 },
    aptitudes: { numerical: 0.5, abstract: 0.7, problem_solving: 0.8, verbal: 0.95 },
    personality: { openness: 0.6, conscientiousness: 0.8, extraversion: 0.6 },
  },
  {
    name: 'Psicología',
    description: 'Estudio del comportamiento humano y procesos mentales, intervención terapéutica',
    riasec: { S: 0.9, I: 0.8, A: 0.6, E: 0.4, C: 0.5, R: 0.3 },
    aptitudes: { numerical: 0.4, abstract: 0.7, problem_solving: 0.7, verbal: 0.8 },
    personality: { openness: 0.8, agreeableness: 0.9, neuroticism: 0.5 },
  },
  {
    name: 'Arquitectura',
    description: 'Diseño y planificación de edificios y espacios, combinando arte y técnica',
    riasec: { A: 0.9, I: 0.7, R: 0.6, E: 0.5, C: 0.5, S: 0.4 },
    aptitudes: { numerical: 0.7, abstract: 0.95, problem_solving: 0.8, verbal: 0.5 },
    personality: { openness: 0.9, conscientiousness: 0.7, neuroticism: 0.4 },
  },
  {
    name: 'Diseño Gráfico / Artes Visuales',
    description: 'Creación de comunicaciones visuales, branding y contenido multimedia',
    riasec: { A: 0.95, E: 0.6, I: 0.5, S: 0.5, C: 0.4, R: 0.3 },
    aptitudes: { numerical: 0.3, abstract: 0.9, problem_solving: 0.7, verbal: 0.5 },
    personality: { openness: 0.95, neuroticism: 0.5, extraversion: 0.5 },
  },
  {
    name: 'Administración de Empresas',
    description: 'Gestión y dirección de organizaciones, planificación estratégica',
    riasec: { E: 0.9, C: 0.8, S: 0.5, I: 0.5, R: 0.4, A: 0.4 },
    aptitudes: { numerical: 0.8, abstract: 0.7, problem_solving: 0.8, verbal: 0.7 },
    personality: { extraversion: 0.8, conscientiousness: 0.8, neuroticism: 0.3 },
  },
  {
    name: 'Economía',
    description: 'Análisis de sistemas económicos, políticas financieras y mercado',
    riasec: { I: 0.9, C: 0.7, E: 0.6, S: 0.4, R: 0.4, A: 0.3 },
    aptitudes: { numerical: 0.95, abstract: 0.8, problem_solving: 0.8, verbal: 0.6 },
    personality: { openness: 0.7, conscientiousness: 0.8, neuroticism: 0.3 },
  },
  {
    name: 'Contabilidad',
    description: 'Registro, análisis y reporte de información financiera',
    riasec: { C: 0.95, I: 0.5, E: 0.4, S: 0.4, R: 0.4, A: 0.2 },
    aptitudes: { numerical: 0.95, abstract: 0.5, problem_solving: 0.7, verbal: 0.5 },
    personality: { conscientiousness: 0.95, neuroticism: 0.2, openness: 0.4 },
  },
  {
    name: 'Ingeniería Civil',
    description: 'Diseño y construcción de infraestructura: edificios, puentes, caminos',
    riasec: { R: 0.9, I: 0.7, C: 0.6, E: 0.5, S: 0.4, A: 0.3 },
    aptitudes: { numerical: 0.9, abstract: 0.8, problem_solving: 0.9, verbal: 0.4 },
    personality: { conscientiousness: 0.8, neuroticism: 0.3, openness: 0.6 },
  },
  {
    name: 'Biología / Ciencias de la Salud',
    description: 'Estudio de organismos vivos, investigación biológica y aplicaciones médicas',
    riasec: { I: 0.95, R: 0.8, S: 0.6, A: 0.4, C: 0.5, E: 0.3 },
    aptitudes: { numerical: 0.7, abstract: 0.85, problem_solving: 0.8, verbal: 0.6 },
    personality: { openness: 0.8, conscientiousness: 0.8, neuroticism: 0.4 },
  },
  {
    name: 'Periodismo / Comunicación',
    description: 'Investigación, redacción y difusión de noticias y contenido mediático',
    riasec: { A: 0.8, S: 0.7, E: 0.6, I: 0.6, C: 0.4, R: 0.3 },
    aptitudes: { numerical: 0.3, abstract: 0.6, problem_solving: 0.7, verbal: 0.95 },
    personality: { openness: 0.8, extraversion: 0.7, agreeableness: 0.6 },
  },
  {
    name: 'Educación / Docencia',
    description: 'Enseñanza y formación en diferentes niveles educativos y especialidades',
    riasec: { S: 0.95, A: 0.6, I: 0.6, E: 0.5, C: 0.5, R: 0.4 },
    aptitudes: { numerical: 0.5, abstract: 0.6, problem_solving: 0.6, verbal: 0.8 },
    personality: { agreeableness: 0.9, conscientiousness: 0.8, extraversion: 0.7 },
  },
  {
    name: 'Marketing',
    description: 'Promoción de productos y servicios, estrategias de mercado y branding',
    riasec: { E: 0.9, A: 0.8, S: 0.5, I: 0.5, C: 0.5, R: 0.3 },
    aptitudes: { numerical: 0.5, abstract: 0.7, problem_solving: 0.7, verbal: 0.8 },
    personality: { openness: 0.8, extraversion: 0.85, neuroticism: 0.4 },
  },
  {
    name: 'Recursos Humanos',
    description: 'Gestión del talento humano, reclutamiento y desarrollo organizacional',
    riasec: { S: 0.9, E: 0.7, C: 0.7, I: 0.5, A: 0.5, R: 0.3 },
    aptitudes: { numerical: 0.5, abstract: 0.6, problem_solving: 0.7, verbal: 0.85 },
    personality: { agreeableness: 0.9, extraversion: 0.8, conscientiousness: 0.8 },
  },
  {
    name: 'Ingeniería Industrial',
    description: 'Optimización de procesos, gestión de producción y sistemas',
    riasec: { I: 0.8, R: 0.7, E: 0.6, C: 0.7, S: 0.5, A: 0.3 },
    aptitudes: { numerical: 0.9, abstract: 0.8, problem_solving: 0.9, verbal: 0.5 },
    personality: { conscientiousness: 0.85, neuroticism: 0.3, openness: 0.7 },
  },
]

function calculateCareerMatch(
  userProfile: any,
  careerProfile: any
): number {
  let totalScore = 0
  let weightSum = 0

  // Intereses RIASEC - peso 0.25
  if (userProfile.interests && careerProfile.riasec) {
    Object.keys(careerProfile.riasec).forEach(code => {
      const diff = Math.abs(
        (userProfile.interests[code] || 0.5) - careerProfile.riasec[code]
      )
      totalScore += (1 - diff) * 0.25
      weightSum += 0.25
    })
  }

  // Aptitudes - peso 0.25
  if (userProfile.aptitudes && careerProfile.aptitudes) {
    Object.keys(careerProfile.aptitudes).forEach(cat => {
      const userScore = userProfile.aptitudes[cat] || 0.5
      const careerScore = careerProfile.aptitudes[cat]
      const diff = Math.abs(userScore - careerScore)
      totalScore += (1 - diff) * 0.25
      weightSum += 0.25
    })
  }

  // Personalidad - peso 0.2
  if (userProfile.personality && careerProfile.personality) {
    Object.keys(careerProfile.personality).forEach(factor => {
      const userScore = userProfile.personality[factor] || 0.5
      const careerScore = careerProfile.personality[factor]
      const diff = Math.abs(userScore - careerScore)
      totalScore += (1 - diff) * 0.2
      weightSum += 0.2
    })
  }

  // Autoeficacia SCCT - peso 0.15
  if (userProfile.scctSelfEfficacy) {
    const userSelfEfficacy = userProfile.scctSelfEfficacy.totalScore || 0.5
    const careerRequiredEfficacy = careerProfile.requiredSelfEfficacy || 0.7
    const diff = Math.abs(userSelfEfficacy - careerRequiredEfficacy)
    totalScore += (1 - diff) * 0.15
    weightSum += 0.15
  }

  // Preferencias de Entorno (Strong) - peso 0.1
  if (userProfile.workEnvironment && careerProfile.workEnvironment) {
    const userEnvPref = userProfile.workEnvironment.dominantPreferences
    const careerEnv = careerProfile.workEnvironment || {}
    let envMatch = 0.5

    if (userEnvPref.size && careerEnv.size) {
      envMatch += careerEnv.size === userEnvPref.size ? 0.5 : 0
    }
    if (userEnvPref.style && careerEnv.style) {
      envMatch += careerEnv.style === userEnvPref.style ? 0.3 : 0
    }
    if (userEnvPref.interaction && careerEnv.interaction) {
      envMatch += careerEnv.interaction === userEnvPref.interaction ? 0.2 : 0
    }

    totalScore += envMatch * 0.1
    weightSum += 0.1
  }

  return weightSum > 0 ? (totalScore / weightSum) * 100 : 50
}

function generateCareerRecommendations(
  userProfile: any,
  currentCareer: string
): any[] {
  const recommendations = CAREER_DATABASE.map(career => {
    const match = calculateCareerMatch(userProfile, career)
    return {
      ...career,
      match: Math.round(match),
    }
  })

  // Ordenar por match descendente
  recommendations.sort((a, b) => b.match - a.match)

  // Filtrar la carrera actual
  const filtered = recommendations.filter(
    c => !c.name.toLowerCase().includes(currentCareer.toLowerCase())
  )

  return filtered
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentId } = body

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Falta el ID de evaluación' },
        { status: 400 }
      )
    }

    // Obtener la evaluación de la base de datos
    const assessment = await db.vocationalAssessment.findUnique({
      where: { id: assessmentId },
      include: { user: true },
    }) as VocationalAssessment & { user: any } | null

    if (!assessment) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      )
    }

    // Parsear resultados
    const userProfile = {
      personality: JSON.parse(assessment.personalityResults || '{}'),
      interests: JSON.parse(assessment.interestsResults || '{}'),
      aptitudes: JSON.parse(assessment.aptitudesResults || '{}'),
      values: JSON.parse(assessment.valuesResults || '{}'),
      scctSelfEfficacy: assessment.scctResults ? JSON.parse(assessment.scctResults) : null,
      workEnvironment: assessment.workEnvironmentResults ? JSON.parse(assessment.workEnvironmentResults) : null,
      careerBarriers: assessment.careerBarriersResults ? JSON.parse(assessment.careerBarriersResults) : null,
    }

    // Calcular match con carrera actual
    const currentCareerCareer = CAREER_DATABASE.find(
      c => c.name.toLowerCase().includes(assessment.currentCareer.toLowerCase()) ||
           assessment.currentCareer.toLowerCase().includes(c.name.toLowerCase())
    )

    let careerMatch = 50
    if (currentCareerCareer) {
      careerMatch = Math.round(calculateCareerMatch(userProfile, currentCareerCareer))
    }

    // Generar recomendaciones
    const recommendations = generateCareerRecommendations(
      userProfile,
      assessment.currentCareer
    )

    // Preparar datos para analisis con LLM - usando concatenacion de strings v2
    const systemPrompt =
      'Eres un experto en orientacion vocacional y psicologia laboral con mas de 20 anos de experiencia.\n' +
      'Tu objetivo es proporcionar un analisis vocacional profundo, empatico y practico para jovenes universitarios de 18 anos que tienen dudas sobre su carrera.\n' +
      '\n' +
      'MODELOS PSICOMETRICOS UTILIZADOS:\n' +
      '1. Big Five (OCEAN) - Personalidad\n' +
      '2. RIASEC de Holland - Intereses vocacionales\n' +
      '3. Strong Inventory - Preferencias de entorno laboral\n' +
      '4. SCCT (Social Cognitive Career Theory) - Autoeficacia y expectativas de resultados\n' +
      '5. Evaluacion de barreras percibidas y estrategias de afrontamiento\n' +
      '\n' +
      'INSTRUCCIONES:\n' +
      '1. Analiza el perfil completo del estudiante\n' +
      '2. Evalua la coincidencia con su carrera actual de forma honesta pero constructiva\n' +
      '3. Considera autoeficacia, expectativas, preferencias de entorno y barreras\n' +
      '4. Proporciona insights practicos y accionables\n' +
      '5. Usa un tono profesional pero accesible\n' +
      '6. Estructura tu respuesta en secciones claras\n' +
      '7. Se especifico y evita generalidades\n' +
      '\n' +
      'IMPORTANTE: Tu respuesta debe ser TEXTO PLANO, sin formato HTML ni Markdown. Usa solo texto simple con saltos de linea.\n' +
      '\n' +
      'DATOS DEL ESTUDIANTE:\n' +
      `- Nombre: ${assessment.user.name}\n` +
      `- Edad: ${assessment.user.age}\n` +
      `- Carrera actual: ${assessment.currentCareer}\n` +
      `- Ano: ${assessment.currentYear}\n` +
      `- Institucion: ${assessment.currentInstitution || 'No especificada'}\n` +
      `- Motivacion para elegir la carrera: "${assessment.careerMotivation}"\n` +
      '\n' +
      'RESULTADOS DE LAS PRUEBAS PSICOMETRICAS:\n' +
      '\n' +
      '1. PERFIL DE PERSONALIDAD (Big Five - OCEAN):\n' +
      `${JSON.stringify(userProfile.personality, null, 2)}\n` +
      '\n' +
      '2. INTERESES VOCACIONALES (RIASEC de Holland):\n' +
      `${JSON.stringify(userProfile.interests, null, 2)}\n` +
      '\n' +
      '3. APTITUDES COGNITIVAS:\n' +
      `${JSON.stringify(userProfile.aptitudes, null, 2)}\n` +
      '\n' +
      '4. VALORES Y MOTIVACIONES LABORALES:\n' +
      `${JSON.stringify(userProfile.values, null, 2)}\n` +
      '\n' +
      '5. AUTOEFICACIA CARRERAS (SCCT):\n' +
      `${JSON.stringify(userProfile.scctSelfEfficacy, null, 2)}\n` +
      '\n' +
      '6. EXPECTATIVAS DE RESULTADOS (SCCT):\n' +
      `${userProfile.scctSelfEfficacy?.outcomeExpectations ? JSON.stringify(userProfile.scctSelfEfficacy.outcomeExpectations, null, 2) : '{}'}\n` +
      '\n' +
      '7. PREFERENCIAS DE ENTORNO (Strong):\n' +
      `${JSON.stringify(userProfile.workEnvironment, null, 2)}\n` +
      '\n' +
      '8. BARRERAS PERCIBIDAS:\n' +
      `${JSON.stringify(userProfile.careerBarriers, null, 2)}\n` +
      '\n' +
      `COINCIDENCIA CALCULADA CON CARRERA ACTUAL: ${careerMatch}%\n` +
      '\n' +
      'CARRERAS RECOMENDADAS (ordenadas por coincidencia):\n' +
      `${recommendations.slice(0, 5).map((r, i) => `${i + 1}. ${r.name} (${r.match}% coincidencia): ${r.description}`).join('\n')}\n` +
      '\n' +
      'Por favor genera tu analisis completo en texto plano con saltos de linea simples. Estructura tu respuesta en las siguientes secciones claramente identificadas:\n' +
      '\n' +
      'ANALISIS DE CARRERA ACTUAL:\n' +
      '[Analisis detallado de como encaja el estudiante en su carrera actual]\n' +
      '\n' +
      'PERFIL DEL ESTUDIANTE:\n' +
      '[Analisis integrado de personalidad, intereses, aptitudes y valores]\n' +
      '\n' +
      'ANALISIS DE AUTOEFICACIA:\n' +
      '[Evaluacion de la confianza en habilidades profesionales]\n' +
      '\n' +
      'ANALISIS DE EXPECTATIVAS:\n' +
      '[Evaluacion de la realidad de las expectativas profesionales]\n' +
      '\n' +
      'PREFERENCIAS DE ENTORNO:\n' +
      '[Analisis del entorno laboral ideal segun preferencias]\n' +
      '\n' +
      'BARRERAS Y ESTRATEGIAS:\n' +
      '[Identificacion de barreras principales y recomendaciones de afrontamiento]\n' +
      '\n' +
      'RECOMENDACIONES:\n' +
      '[Listado de 3-5 recomendaciones especificas y practicas]\n' +
      '\n' +
      'CONCLUSION:\n' +
      '[Un mensaje de cierre motivador y realista]'

    // Usar el mismo prompt para usuario (simplificado)
    const userPrompt = systemPrompt

    // Llamar al LLM con mejor manejo de errores
    let aiAnalysis = 'Error: No se pudo generar el analisis'
    try {
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        thinking: { type: 'disabled' },
      })

      if (completion && completion.choices && completion.choices[0] && completion.choices[0].message) {
        const rawContent = completion.choices[0].message.content
        
        // Validar que sea texto plano y no HTML
        if (typeof rawContent === 'string') {
          // Limpiar cualquier etiqueta HTML o Markdown
          aiAnalysis = rawContent
            .replace(/<[^>]*>/g, '') // Remover etiquetas HTML
            .replace(/<[^>]*$/g, '')  // Remover etiquetas HTML incompletas
            .replace(/\\[.*?\\]/g, '') // Remover formato Markdown
            .replace(/\\*.?\\]/g, '') // Remover formato Markdown
            .replace(/\\n\\n/g, '\n') // Limpiar saltos dobles
            .trim()
        } else {
          aiAnalysis = 'Error: La respuesta del modelo no es texto válido'
        }
      } else {
        aiAnalysis = 'Error: No se recibió respuesta válida del modelo'
      }
    } catch (error) {
      console.error('Error calling LLM:', error)
      aiAnalysis = 'Error: Problema al generar el analisis con IA. Por favor intenta nuevamente.'
    }

    // Extraer analisis de carrera actual
    const lines = aiAnalysis.split('\n')
    let careerAnalysisText = aiAnalysis
    let currentAnalysisFound = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes('ANALISIS DE CARRERA ACTUAL:') || 
          line.includes('PERFIL DEL ESTUDIANTE:')) {
        currentAnalysisFound = true
        continue
      }
      
      if (currentAnalysisFound && i > 0 && !line.includes(':') && line.trim().length > 0) {
        careerAnalysisText = line
        break
      }
    }

    // Actualizar la evaluacion con los resultados
    const updatedAssessment = await db.vocationalAssessment.update({
      where: { id: assessmentId },
      data: {
        careerAnalysis: aiAnalysis,
        careerMatch,
        recommendedCareers: JSON.stringify(recommendations.slice(0, 6)),
        alternativeCareers: JSON.stringify(recommendations.slice(0, 10)),
        status: 'completed',
        completedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      currentCareer: assessment.currentCareer,
      careerMatch,
      personalityResults: userProfile.personality,
      interestsResults: userProfile.interests,
      aptitudesResults: userProfile.aptitudes,
      valuesResults: userProfile.values,
      scctResults: userProfile.scctSelfEfficacy,
      workEnvironmentResults: userProfile.workEnvironment,
      careerBarriersResults: userProfile.careerBarriers,
      recommendedCareers: recommendations.slice(0, 6),
      analysis: {
        careerAnalysis: careerAnalysisText,
        fullAnalysis: aiAnalysis,
      },
    })
  } catch (error) {
    console.error('Error analyzing assessment:', error)
    return NextResponse.json(
      { 
        error: 'Error al analizar la evaluacion: ' + (error as Error).message,
        status: 500 
      },
      { status: 500 }
    )
  }
}
