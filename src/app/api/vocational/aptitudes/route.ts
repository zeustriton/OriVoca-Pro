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

    // Calcular resultados de aptitudes
    const categories = {
      verbal: 0,
      numerical: 0,
      abstract: 0,
      problem_solving: 0,
    }

    const counts = {
      verbal: 0,
      numerical: 0,
      abstract: 0,
      problem_solving: 0,
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

    // Guardar en la base de datos
    const assessment = await db.vocationalAssessment.update({
      where: { id: assessmentId },
      data: {
        aptitudesAnswers: JSON.stringify(answers),
        aptitudesResults: JSON.stringify(results),
      },
    })

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Error saving aptitudes results:', error)
    return NextResponse.json(
      { error: 'Error al guardar resultados de aptitudes' },
      { status: 500 }
    )
  }
}
