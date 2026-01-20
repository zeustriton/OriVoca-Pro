// In-memory database layer for Vercel compatibility
// Replaces Prisma/SQLite with in-memory storage that works in serverless environments

// Type definitions based on Prisma schema
export type User = {
  id: string
  email: string | null
  name: string
  age: number
  createdAt: string
  updatedAt: string
}

export type VocationalAssessment = {
  id: string
  userId: string
  currentCareer: string
  currentYear: number
  currentInstitution: string | null
  careerMotivation: string
  personalityAnswers: string
  interestsAnswers: string
  aptitudesAnswers: string
  valuesAnswers: string
  scctSelfEfficacyAnswers: string
  scctOutcomeExpectAnswers: string
  strongInventoryAnswers: string
  workEnvironmentAnswers: string
  careerBarriersAnswers: string
  personalityResults: string
  interestsResults: string
  aptitudesResults: string
  valuesResults: string
  scctResults: string
  strongResults: string
  workEnvironmentResults: string
  careerBarriersResults: string
  careerAnalysis: string
  careerMatch: number
  recommendedCareers: string
  alternativeCareers: string
  testStartTime: string | null
  testEndTime: string | null
  completionScore: number | null
  validityIndicators: string | null
  reliabilityScore: number | null
  status: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

type VocationalAssessmentWithUser = VocationalAssessment & { user: User }

// In-memory data store (works in Vercel serverless)
let users: User[] = []
let assessments: VocationalAssessment[] = []

// User operations
const user = {
  async upsert(args: { where: { email: string }, update: { name: string; age: number }, create: { name: string; email: string; age: number } }) {
    const existing = users.find(u => u.email === args.where.email)

    if (existing) {
      // Update
      Object.assign(existing, args.update, { updatedAt: new Date().toISOString() })
      return existing
    } else {
      // Create
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...args.create,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      users.push(newUser)
      return newUser
    }
  },

  async create(args: { data: { name: string; age: number; email: string } }) {
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...args.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    users.push(newUser)
    return newUser
  },

  async findFirst(args: { where?: { email?: string; id?: string } } = {}) {
    const where = args?.where
    if (!where) {
      return users[0] || null
    }
    if (where.email) {
      return users.find(u => u.email === where.email) || null
    }
    if (where.id) {
      return users.find(u => u.id === where.id) || null
    }
    return users[0] || null
  },

  async findUnique(args: { where: { email?: string; id?: string } }) {
    if (args.where?.email) {
      return users.find(u => u.email === args.where.email) || null
    }
    if (args.where?.id) {
      return users.find(u => u.id === args.where.id) || null
    }
    return null
  },
}

// VocationalAssessment operations
const vocationalAssessment = {
  async create(args: { data: Omit<VocationalAssessment, 'id' | 'createdAt' | 'updatedAt'> }) {
    const newAssessment: VocationalAssessment = {
      id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...args.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    assessments.push(newAssessment)
    return newAssessment
  },

  async update(args: { where: { id: string }, data: Partial<VocationalAssessment> }) {
    const index = assessments.findIndex(a => a.id === args.where.id)
    if (index === -1) {
      throw new Error('Assessment not found')
    }

    Object.assign(assessments[index], args.data, { updatedAt: new Date().toISOString() })
    return assessments[index]
  },

  async findUnique(args: { where: { id: string }, include?: { user: boolean } }): Promise<VocationalAssessment | VocationalAssessmentWithUser | null> {
    const assessment = assessments.find(a => a.id === args.where.id)
    if (!assessment) return null

    if (args.include?.user) {
      const user = users.find(u => u.id === assessment.userId)
      if (!user) return null

      return { ...assessment, user } as VocationalAssessmentWithUser
    }

    return assessment
  },
}

// Export the database client
export const db = {
  user,
  vocationalAssessment,
}
