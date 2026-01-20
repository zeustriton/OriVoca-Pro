import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assessmentId, answers, statements } = body

    if (!assessmentId || !answers || !statements) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Calcular resultados RIASEC
    const codes = {
      R: 0, // Realista
      I: 0, // Investigativo
      A: 0, // Artístico
      S: 0, // Social
      E: 0, // Emprendedor
      C: 0, // Convencional
    }

    const counts = {
      R: 0,
      I: 0,
      A: 0,
      S: 0,
      E: 0,
      C: 0,
    }

    // Sumar respuestas por código
    statements.forEach((s: any, index: number) => {
      const answer = answers[index]
      if (answer && codes.hasOwnProperty(s.code)) {
        codes[s.code] += answer
        counts[s.code]++
      }
    })

    // Normalizar a 0-1
    const results: Record<string, number> = {}
    Object.keys(codes).forEach(code => {
      if (counts[code] > 0) {
        results[code] = codes[code] / (counts[code] * 5)
      } else {
        results[code] = 0.33 // Valor medio
      }
    })

    // Guardar en la base de datos
    const assessment = await db.vocationalAssessment.update({
      where: { id: assessmentId },
      data: {
        interestsAnswers: JSON.stringify(answers),
        interestsResults: JSON.stringify(results),
      },
    })

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Error saving interests results:', error)
    return NextResponse.json(
      { error: 'Error al guardar resultados de intereses' },
      { status: 500 }
    )
  }
}
