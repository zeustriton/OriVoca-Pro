import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentId, answers, pairs } = body

    if (!assessmentId || !answers || !pairs) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Analizar respuestas de valores
    // La respuesta 1 indica preferencia por valor1, respuesta 2 por valor2
    const valuePreferences: Record<string, number> = {}

    pairs.forEach((pair: any, index: number) => {
      const answer = answers[index]
      if (answer === 1) {
        // Prefiere valor1
        valuePreferences[pair.value1] = (valuePreferences[pair.value1] || 0) + 1
      } else if (answer === 2) {
        // Prefiere valor2
        valuePreferences[pair.value2] = (valuePreferences[pair.value2] || 0) + 1
      }
    })

    // Normalizar a 0-1 (relativo al total de respuestas)
    const totalResponses = pairs.length
    const results: Record<string, number> = {}
    Object.keys(valuePreferences).forEach(value => {
      results[value] = valuePreferences[value] / totalResponses
    })

    // Guardar en la base de datos
    const assessment = await db.vocationalAssessment.update({
      where: { id: assessmentId },
      data: {
        valuesAnswers: JSON.stringify(answers),
        valuesResults: JSON.stringify(results),
      },
    })

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Error saving values results:', error)
    return NextResponse.json(
      { error: 'Error al guardar resultados de valores' },
      { status: 500 }
    )
  }
}
