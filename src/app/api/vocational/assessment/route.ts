import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      age,
      email,
      currentCareer,
      currentYear,
      currentInstitution,
      careerMotivation,
    } = body

    // Validar datos requeridos
    if (!name || !age || !currentCareer || !currentYear || !careerMotivation) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      )
    }

    // Crear o obtener usuario
    let user
    if (email) {
      user = await db.user.upsert({
        where: { email },
        update: { name, age: parseInt(age) },
        create: {
          name,
          email,
          age: parseInt(age),
        },
      })
    } else {
      // Si no hay email, crear usuario temporal
      user = await db.user.create({
        data: {
          name,
          age: parseInt(age),
          email: `${name.toLowerCase().replace(/\s/g, '')}-${Date.now()}@temp.local`,
        },
      })
    }

    // Crear evaluación vocacional
    const assessment = await db.vocationalAssessment.create({
      data: {
        userId: user.id,
        currentCareer,
        currentYear: parseInt(currentYear),
        currentInstitution: currentInstitution || null,
        careerMotivation,
        personalityAnswers: '{}',
        interestsAnswers: '{}',
        aptitudesAnswers: '{}',
        valuesAnswers: '{}',
        scctSelfEfficacyAnswers: '{}',
        scctOutcomeExpectAnswers: '{}',
        strongInventoryAnswers: '{}',
        workEnvironmentAnswers: '{}',
        careerBarriersAnswers: '{}',
        personalityResults: '{}',
        interestsResults: '{}',
        aptitudesResults: '{}',
        valuesResults: '{}',
        scctResults: '{}',
        strongResults: '{}',
        workEnvironmentResults: '{}',
        careerBarriersResults: '{}',
        careerAnalysis: '',
        careerMatch: 0,
        recommendedCareers: '{}',
        alternativeCareers: '{}',
        testStartTime: null,
        testEndTime: null,
        completionScore: null,
        validityIndicators: null,
        reliabilityScore: null,
        status: 'in_progress',
        completedAt: null,
      },
    })

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      userId: user.id,
    })
  } catch (error) {
    console.error('Error creating assessment:', error)
    return NextResponse.json(
      { error: 'Error al crear la evaluación' },
      { status: 500 }
    )
  }
}
