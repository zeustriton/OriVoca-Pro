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

    // Calcular resultados de Big Five
    const factors = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    }

    const counts = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    }

    // Calcular promedio por factor
    questions.forEach((q: any, index: number) => {
      const answer = answers[index]
      if (answer && factors.hasOwnProperty(q.factor)) {
        factors[q.factor] += answer
        counts[q.factor]++
      }
    })

    // Normalizar a 0-1
    const results: Record<string, number> = {}
    Object.keys(factors).forEach(factor => {
      if (counts[factor] > 0) {
        results[factor] = factors[factor] / (counts[factor] * 5)
      } else {
        results[factor] = 0.5
      }
    })

    // Guardar en la base de datos
    const assessment = await db.vocationalAssessment.update({
      where: { id: assessmentId },
      data: {
        personalityAnswers: JSON.stringify(answers),
        personalityResults: JSON.stringify(results),
      },
    })

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Error saving personality results:', error)
    return NextResponse.json(
      { error: 'Error al guardar resultados de personalidad' },
      { status: 500 }
    )
  }
}
