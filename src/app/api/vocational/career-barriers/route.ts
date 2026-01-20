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

    // Calcular resultados de Barreras Percibidas (SCCT)
    const barriers = {
      economic: 0,
      social: 0,
      personal: 0,
    }

    const coping = {
      proactive: 0,
      support_seeking: 0,
      adjustment: 0,
    }

    const counts = {
      economic: 0,
      social: 0,
      personal: 0,
      proactive: 0,
      support_seeking: 0,
      adjustment: 0,
    }

    // Sumar respuestas por tipo
    questions.forEach((q: any, index: number) => {
      const answer = answers[index]
      if (!answer) return

      if (q.type === 'economic') {
        barriers.economic += answer
        counts.economic++
      }
      if (q.type === 'social') {
        barriers.social += answer
        counts.social++
      }
      if (q.type === 'personal') {
        barriers.personal += answer
        counts.personal++
      }
      if (q.type === 'coping') {
        if (index === 7 && answer) {
          coping.proactive += answer
          counts.proactive++
        }
        if (index === 8 && answer) {
          coping.support_seeking += answer
          counts.support_seeking++
        }
        if (index === 9 && answer) {
          coping.adjustment += answer
          counts.adjustment++
        }
        if (index === 10 && answer) {
          coping.adjustment += answer
          counts.adjustment++
        }
      }
    })

    // Normalizar barreras (0-1)
    const barrierScores: Record<string, number> = {}
    Object.keys(barriers).forEach(type => {
      if (counts[type] > 0) {
        barrierScores[type] = barriers[type] / (counts[type] * 5)
      } else {
        barrierScores[type] = 0.5
      }
    })

    // Normalizar estrategias de afrontamiento (0-1)
    const copingScores: Record<string, number> = {}
    Object.keys(coping).forEach(strategy => {
      if (counts[strategy] > 0) {
        copingScores[strategy] = coping[strategy] / (counts[strategy] * 5)
      } else {
        copingScores[strategy] = 0.5
      }
    })

    // Calcular índices
    const totalBarrierLevel = Object.values(barrierScores).reduce((sum, val) => sum + val, 0) / Object.keys(barrierScores).length
    const totalCopingLevel = Object.values(copingScores).reduce((sum, val) => sum + val, 0) / Object.keys(copingScores).length

    // Identificar barrera principal
    const primaryBarrier = Object.entries(barrierScores).sort((a, b) => b[1] - a[1])[0]

    // Identificar estrategia de afrontamiento más fuerte
    const strongestCoping = Object.entries(copingScores).sort((a, b) => b[1] - a[1])[0]

    // Guardar en la base de datos
    const assessment = await db.vocationalAssessment.update({
      where: { id: assessmentId },
      data: {
        careerBarriersAnswers: JSON.stringify(answers),
        careerBarriersResults: JSON.stringify({
          barriers: barrierScores,
          coping: copingScores,
          indices: {
            totalBarrierLevel,
            totalCopingLevel,
            resilienceIndex: totalCopingLevel / (totalBarrierLevel + 0.01),
          },
          primaryBarrier: primaryBarrier[0],
          strongestCoping: strongestCoping[0],
        }),
      },
    })

    return NextResponse.json({
      success: true,
      barriers: barrierScores,
      coping: copingScores,
      indices: {
        totalBarrierLevel,
        totalCopingLevel,
        resilienceIndex: totalCopingLevel / (totalBarrierLevel + 0.01),
      },
      primaryBarrier: primaryBarrier[0],
      strongestCoping: strongestCoping[0],
    })
  } catch (error) {
    console.error('Error saving career barriers results:', error)
    return NextResponse.json(
      { error: 'Error al guardar resultados de barreras profesionales' },
      { status: 500 }
    )
  }
}
