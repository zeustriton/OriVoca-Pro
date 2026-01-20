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

    // Calcular resultados de SCCT Self-Efficacy
    const domains = {
      decision: 0,
      problem_solving: 0,
      resilience: 0,
      adaptability: 0,
      communication: 0,
      teamwork: 0,
      initiative: 0,
      persistence: 0,
    }

    const counts = {
      decision: 0,
      problem_solving: 0,
      resilience: 0,
      adaptability: 0,
      communication: 0,
      teamwork: 0,
      initiative: 0,
      persistence: 0,
    }

    // Sumar respuestas por dominio
    questions.forEach((q: any, index: number) => {
      const answer = answers[index]
      if (answer && domains.hasOwnProperty(q.domain)) {
        domains[q.domain] += answer
        counts[q.domain]++
      }
    })

    // Normalizar a 0-1
    const results: Record<string, number> = {}
    Object.keys(domains).forEach(domain => {
      if (counts[domain] > 0) {
        results[domain] = domains[domain] / (counts[domain] * 5)
      } else {
        results[domain] = 0.5
      }
    })

    // Calcular puntuación general de autoeficacia
    const totalScore = Object.values(results).reduce((sum, val) => sum + val, 0) / Object.keys(results).length

    // Guardar en la base de datos
    const assessment = await db.vocationalAssessment.update({
      where: { id: assessmentId },
      data: {
        scctSelfEfficacyAnswers: JSON.stringify(answers),
        scctResults: JSON.stringify({
          ...results,
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
    console.error('Error saving self-efficacy results:', error)
    return NextResponse.json(
      { error: 'Error al guardar resultados de autoeficacia' },
      { status: 500 }
    )
  }
}
