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

    // Calcular resultados de Expectativas de Resultados
    const categories = {
      financial: 0,
      satisfaction: 0,
      balance: 0,
      growth: 0,
      recognition: 0,
      autonomy: 0,
    }

    const counts = {
      financial: 0,
      satisfaction: 0,
      balance: 0,
      growth: 0,
      recognition: 0,
      autonomy: 0,
    }

    // Sumar respuestas por categoría
    questions.forEach((q: any, index: number) => {
      const answer = answers[index]
      if (answer && categories.hasOwnProperty(q.category)) {
        categories[q.category] += answer
        counts[q.category]++
      }
    })

    // Normalizar a 0-1
    const results: Record<string, number> = {}
    Object.keys(categories).forEach(category => {
      if (counts[category] > 0) {
        results[category] = categories[category] / (counts[category] * 5)
      } else {
        results[category] = 0.5
      }
    })

    // Calcular índice de expectativas realistas
    const totalScore = Object.values(results).reduce((sum, val) => sum + val, 0) / Object.keys(results).length

    // Guardar en la base de datos
    const assessment = await db.vocationalAssessment.update({
      where: { id: assessmentId },
      data: {
        scctOutcomeExpectAnswers: JSON.stringify(answers),
        scctResults: JSON.stringify({
          outcomeExpectations: results,
          totalScore,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      results,
      totalScore,
    })
  } catch (error) {
    console.error('Error saving outcome expectations results:', error)
    return NextResponse.json(
      { error: 'Error al guardar resultados de expectativas' },
      { status: 500 }
    )
  }
}
