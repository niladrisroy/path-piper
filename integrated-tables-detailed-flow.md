
# PathPiper Integrated Tables - Detailed Flow with Pages and Operations

This diagram shows the exact flow of how integrated tables are used across the platform, including specific pages and operations.

```mermaid
flowchart TD
    %% Authentication Flow
    A[User Authentication] --> A1[Supabase Auth]
    A1 --> A2[auth-service.ts registerStudent]
    A2 --> A3[prisma.profile.create]
    A3 --> A4[prisma.studentProfile.create]
    
    A1 --> A5[auth-service.ts registerMentor]
    A5 --> A6[prisma.profile.create]
    A6 --> A7[prisma.mentorProfile.create]
    
    A1 --> A8[auth-service.ts registerInstitution]
    A8 --> A9[prisma.profile.create]
    A9 --> A10[prisma.institutionProfile.create]
    
    %% Profile Management Flow
    B[Profile Pages] --> B1["/student/profile/edit"]
    B1 --> B2[ProfileEditForm Component]
    B2 --> B3[personal-info-form.tsx]
    B3 --> B4["/api/profile/personal-info"]
    B4 --> B5[prisma.profile.update + prisma.studentProfile.update]
    
    B2 --> B6[social-contact-form.tsx]
    B6 --> B7["/api/profile/social-contact"]
    B7 --> B8[prisma.socialLink.upsert/deleteMany]
    
    %% Education History Flow
    C[Education Management] --> C1[education-history-form.tsx]
    C1 --> C2["/api/education POST/PUT/DELETE"]
    C2 --> C3[prisma.studentEducationHistory operations]
    C3 --> C4[prisma.institutionType.findMany for dropdowns]
    
    %% Institution Types Flow
    D[Institution Management] --> D1["/api/institution-types GET"]
    D1 --> D2[prisma.institutionType.findMany with categories]
    D2 --> D3[Used in education forms for dropdowns]
    D3 --> D4[getPlaceholdersForType function]
    
    %% Skills & Interests Flow
    E[Skills Management] --> E1[skills-abilities-form.tsx]
    E1 --> E2["/api/skills GET"]
    E2 --> E3[prisma.skill.findMany grouped by category]
    E3 --> E4["/api/user/skills POST/DELETE"]
    E4 --> E5[prisma.userSkill.create/delete operations]
    
    F[Interests Management] --> F1[interests-passions-form.tsx]
    F1 --> F2["/api/interests GET"]
    F2 --> F3[prisma.interest.findMany with categories]
    F3 --> F4["/api/user/interests POST/DELETE"]
    F4 --> F5[prisma.userInterest.create/delete operations]
    
    %% Goals Flow
    G[Goals Management] --> G1[goals-aspirations-form.tsx]
    G1 --> G2["/api/goals POST/PUT/DELETE"]
    G2 --> G3[prisma.careerGoal CRUD operations]
    
    %% Profile Viewing Flow
    H[Profile Display] --> H1["/student/profile/[handle]"]
    H1 --> H2["/api/student/profile/[id] GET"]
    H2 --> H3[Complex Prisma Query with includes]
    H3 --> H4[prisma.studentProfile.findUnique with nested includes]
    H4 --> H5[Includes: profile, educationHistory, userInterests, userSkills, socialLinks, careerGoals]
    
    %% Status Monitoring
    I[System Status] --> I1["/status page"]
    I1 --> I2["/api/status GET"]
    I2 --> I3[prisma.profile.count for health check]
    
    %% Mood Board Flow
    J[Mood Board] --> J1[mood-board-media-form.tsx]
    J1 --> J2[prisma.moodBoard operations]
    
    %% Detailed Operation Breakdowns
    K[Detailed Operations] --> K1[Profile Operations]
    K1 --> K1a[getUserProfile: findUnique with student/mentor/institution includes]
    K1 --> K1b[updateUserProfile: update with filtered data]
    K1 --> K1c[updateStudentProfile: update with enum casting]
    
    K --> K2[Social Links Operations]
    K2 --> K2a[getUserSocialLinks: findMany by userId]
    K2 --> K2b[updateUserSocialLinks: deleteMany + createMany batch]
    K2 --> K2c[upsertSocialLink: upsert with userId_platform unique constraint]
    
    K --> K3[Education Operations]
    K3 --> K3a[Create: prisma.studentEducationHistory.create with institutionType relation]
    K3 --> K3b[Update: prisma.studentEducationHistory.update by id]
    K3 --> K3c[Delete: prisma.studentEducationHistory.delete by id]
    K3 --> K3d[List: findMany with institutionType and category includes]
    
    K --> K4[Skills Operations]
    K4 --> K4a[Get Available: prisma.skill.findMany grouped by category]
    K4 --> K4b[Get User Skills: prisma.userSkill.findMany with skill includes]
    K4 --> K4c[Add Skill: prisma.userSkill.create with proficiency]
    K4 --> K4d[Remove Skill: prisma.userSkill.delete by userId_skillId]
    
    K --> K5[Interest Operations]
    K5 --> K5a[Get Available: prisma.interest.findMany with category includes]
    K5 --> K5b[Get User Interests: prisma.userInterest.findMany with interest includes]
    K5 --> K5c[Add Interest: prisma.userInterest.create]
    K5 --> K5d[Remove Interest: prisma.userInterest.delete by userId_interestId]
    
    K --> K6[Goal Operations]
    K6 --> K6a[Create Goal: prisma.careerGoal.create with userId]
    K6 --> K6b[Update Goal: prisma.careerGoal.update by id]
    K6 --> K6c[Delete Goal: prisma.careerGoal.delete by id]
    K6 --> K6d[List Goals: findMany ordered by createdAt desc]
    
    %% Data Flow Integration
    L[Data Integration Points] --> L1[Registration Flow]
    L1 --> L1a[Supabase creates auth user]
    L1a --> L1b[Prisma creates profile with same UUID]
    L1b --> L1c[Prisma creates role-specific profile]
    
    L --> L2[Profile Edit Flow]
    L2 --> L2a[Forms collect data]
    L2a --> L2b[API endpoints validate and process]
    L2b --> L2c[Prisma updates multiple related tables]
    
    L --> L3[Profile View Flow]
    L3 --> L3a[Single API call fetches all related data]
    L3a --> L3b[Complex includes join multiple tables]
    L3b --> L3c[Formatted response with nested relationships]
    
    %% Error Handling & Transactions
    M[Error Handling] --> M1[try-catch blocks in API routes]
    M1 --> M2[Prisma error handling]
    M2 --> M3[Rollback on transaction failures]
    
    %% Security & Access Control
    N[Security Layer] --> N1[Supabase Auth token verification]
    N1 --> N2[User ID matching for profile access]
    N2 --> N3[Prisma queries filtered by userId]
    
    %% Styling
    classDef authFlow fill:#e1f5fe
    classDef profileFlow fill:#f3e5f5
    classDef dataFlow fill:#e8f5e8
    classDef operationFlow fill:#fff3e0
    classDef securityFlow fill:#ffebee
    
    class A,A1,A2,A3,A4,A5,A6,A7,A8,A9,A10 authFlow
    class B,B1,B2,B3,B4,B5,B6,B7,B8,H,H1,H2,H3,H4,H5 profileFlow
    class C,C1,C2,C3,C4,D,D1,D2,D3,D4,E,E1,E2,E3,E4,E5,F,F1,F2,F3,F4,F5,G,G1,G2,G3,J,J1,J2 dataFlow
    class K,K1,K1a,K1b,K1c,K2,K2a,K2b,K2c,K3,K3a,K3b,K3c,K3d,K4,K4a,K4b,K4c,K4d,K5,K5a,K5b,K5c,K5d,K6,K6a,K6b,K6c,K6d operationFlow
    class N,N1,N2,N3,M,M1,M2,M3 securityFlow
```

## Key Integration Points

### 1. **Authentication to Profile Creation**
- `auth-service.ts` → Supabase Auth → Prisma Profile Creation
- Same UUID used across Supabase and Prisma
- Role-specific profile creation (student/mentor/institution)

### 2. **Profile Edit Form Integration**
- `ProfileEditForm` → Multiple sub-forms → Specific API endpoints → Prisma operations
- Real-time updates across multiple tables
- Form state management with immediate persistence

### 3. **Education History Management**
- `education-history-form.tsx` → Institution type lookups → Education record CRUD
- Complex relationships with institution types and categories
- Dynamic placeholder text based on institution types

### 4. **Skills & Interests System**
- Age-appropriate content filtering
- Many-to-many relationships through junction tables
- Category-based organization

### 5. **Profile Viewing Optimization**
- Single API call with complex includes
- Nested relationship fetching
- Formatted response structure

### 6. **Data Consistency & Security**
- User ID validation at every API endpoint
- Prisma transactions for multi-table operations
- Error handling with rollback capabilities

This flow shows how Prisma serves as the central data layer, handling complex relationships and ensuring data consistency across the entire PathPiper platform.
