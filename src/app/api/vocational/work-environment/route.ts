import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentId, answers, questions } = body

    if (!assessmentId || !answers || !questions) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Calcular resultados de Preferencias de Entorno Laboral (Strong)
    const aspects = {
      size: { small: 0, medium: 0, large: 0 },
      style: { structured: 0, flexible: 0 },
      interaction: { independent: 0, team: 0, client: 0 },
      culture: { competitive: 0, collaborative: 0, innovative: 0, stable: 0 },
    }

    // Analizar respuestas por aspecto
    questions.forEach((q: any, index: number) => {
      const answer = answers[index]

      if (q.aspect === 'size') {
        if (index === 0 && answer) aspects.size.small += answer
        if (index === 1 && answer) aspects.size.medium += answer
        if (index === 2 && answer) aspects.size.large += answer
      }

      if (q.aspect === 'style') {
        if (index === 3 && answer) aspects.style.structured += answer
        if (index === 4 && answer) aspects.style.flexible += answer
      }

      if (q.aspect === 'interaction') {
        if (index === 5 && answer) aspects.interaction.independent += answer
        if (index === 6 && answer) aspects.interaction.team += answer
        if (index === 7 && answer) aspects.interaction.client += answer
      }

      if (q.aspect === 'culture') {
        if (index === 8 && answer) aspects.culture.competitive += answer
        if (index === 9 && answer) aspects.culture.collaborative += answer
        if (index === 10 && answer) aspects.culture.innovative += answer
        if (index === 11 && answer) aspects.culture.stable += answer
      }
    })

    // Normalizar a 0-1 (dividir por máxima posible 5)
    const normalizedResults = {
      size: {
        small: aspects.size.small / 5,
        medium: aspects.size.medium / 5,
        large: aspects.size.large / 5,
      },
      style: {
        structured: aspects.style.structured / 5,
        flexible: aspects.style.flexible / 5,
      },
      interaction: {
        independent: aspects.interaction.independent / 5,
        team: aspects.interaction.team / 5,
        client: aspects.interaction.client / 5,
      },
      culture: {
        competitive: aspects.culture.competitive / 5,
        collaborative: aspects.culture.collaborative / 5,
        innovative: aspects.culture.innovative / 5,
        stable: aspects.culture.stable / 5,
      },
    }

    // Identificar preferencias dominantes
    const dominantSize = Object.entries(normalizedResults.size).sort((a, b) => b[1] - a[1])[0]
    const dominantStyle = Object.entries(normalizedResults.style).sort((a, b) => b[1] - a[1])[0]
    const dominantInteraction = Object.entries(normalizedResults.interaction).sort((a, b) => b[1] - a[1])[0]
    const dominantCulture = Object.entries(normalizedResults.culture).sort((a, b) => b[1] - a[1])[0]

    // Guardar en la base de datos
    const assessment = await db.vocationalAssessment.update({
      where: { id: assessmentId },
      data: {
        workEnvironmentAnswers: JSON.stringify(answers),
        workEnvironmentResults: JSON.stringify({
          ...normalizedResults,
          dominantPreferences: {
            size: dominantSize[0],
            style: dominantStyle[0],
            interaction: dominantInteraction[0],
            culture: dominantCulture[0],
          },
        }),
      },
    })

    return NextResponse.json({
      success: true,
      results: normalizedResults,
      dominantPreferences: {
        size: dominantSize[0],
        style: dominantStyle[0],
        interaction: dominantInteraction[0],
        culture: dominantCulture[0],
      },
    })
  } catch (error) {
    console.error('Error saving work environment results:', error)
    return NextResponse.json(
      { error: 'Error al guardar resultados de entorno laboral' },
      { status: 500 }
    )
  }
}
