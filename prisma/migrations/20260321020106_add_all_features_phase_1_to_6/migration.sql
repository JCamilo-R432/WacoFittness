-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT[],
    "certifications" TEXT[],
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "sessionRate" DECIMAL(10,2),
    "monthlyRate" DECIMAL(10,2),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "languages" TEXT[],
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "avatarUrl" TEXT,
    "introVideoUrl" TEXT,
    "instagramHandle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconName" TEXT,
    "colorHex" TEXT NOT NULL DEFAULT '#6c63ff',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_classes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "equipmentNeeded" TEXT[],
    "caloriesBurned" INTEGER,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "videoAssetId" TEXT,
    "drmEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "liveUrl" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "replayExpiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "enrollmentCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "lastWatchedAt" TIMESTAMP(3),

    CONSTRAINT "class_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "durationWeeks" INTEGER NOT NULL,
    "workoutsPerWeek" INTEGER NOT NULL,
    "equipmentNeeded" TEXT[],
    "goal" TEXT NOT NULL,
    "targetGender" TEXT NOT NULL DEFAULT 'all',
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "thumbnailUrl" TEXT,
    "previewVideoUrl" TEXT,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "enrollmentCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_weeks" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "theme" TEXT,

    CONSTRAINT "program_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_days" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "isRestDay" BOOLEAN NOT NULL DEFAULT false,
    "durationMin" INTEGER,
    "exercises" JSONB NOT NULL,
    "virtualClassId" TEXT,

    CONSTRAINT "program_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "currentDay" INTEGER NOT NULL DEFAULT 1,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),

    CONSTRAINT "program_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_sessions" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "type" TEXT NOT NULL,
    "meetingUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "coachNotes" TEXT,
    "clientNotes" TEXT,
    "recordingUrl" TEXT,
    "priceCents" INTEGER,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaching_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_photos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "angle" TEXT NOT NULL DEFAULT 'front',
    "takenAt" TIMESTAMP(3) NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "bodyFatPct" DOUBLE PRECISION,
    "notes" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fitness_challenges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "goal" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "isTeam" BOOLEAN NOT NULL DEFAULT false,
    "maxParticipants" INTEGER,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "prizeDescription" TEXT,
    "badgeImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fitness_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fitness_challenge_participants" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "rank" INTEGER,
    "lastCheckin" TIMESTAMP(3),

    CONSTRAINT "fitness_challenge_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "iconName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "on_demand_videos" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructorName" TEXT,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "videoAssetId" TEXT,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "equipmentNeeded" TEXT[],
    "muscleGroups" TEXT[],
    "caloriesBurned" INTEGER,
    "tags" TEXT[],
    "language" TEXT NOT NULL DEFAULT 'es',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "on_demand_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_watch_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "totalSeconds" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "liked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_watch_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainers_userId_key" ON "trainers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "class_categories_name_key" ON "class_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "class_categories_slug_key" ON "class_categories"("slug");

-- CreateIndex
CREATE INDEX "virtual_classes_instructorId_idx" ON "virtual_classes"("instructorId");

-- CreateIndex
CREATE INDEX "virtual_classes_categoryId_idx" ON "virtual_classes"("categoryId");

-- CreateIndex
CREATE INDEX "virtual_classes_difficulty_idx" ON "virtual_classes"("difficulty");

-- CreateIndex
CREATE INDEX "virtual_classes_isLive_scheduledAt_idx" ON "virtual_classes"("isLive", "scheduledAt");

-- CreateIndex
CREATE INDEX "virtual_classes_isActive_isFeatured_idx" ON "virtual_classes"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "class_enrollments_userId_idx" ON "class_enrollments"("userId");

-- CreateIndex
CREATE INDEX "class_enrollments_classId_idx" ON "class_enrollments"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "class_enrollments_userId_classId_key" ON "class_enrollments"("userId", "classId");

-- CreateIndex
CREATE INDEX "class_reviews_classId_idx" ON "class_reviews"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "class_reviews_userId_classId_key" ON "class_reviews"("userId", "classId");

-- CreateIndex
CREATE INDEX "workout_programs_category_idx" ON "workout_programs"("category");

-- CreateIndex
CREATE INDEX "workout_programs_difficulty_idx" ON "workout_programs"("difficulty");

-- CreateIndex
CREATE INDEX "workout_programs_goal_idx" ON "workout_programs"("goal");

-- CreateIndex
CREATE INDEX "workout_programs_isActive_isFeatured_idx" ON "workout_programs"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "program_weeks_programId_idx" ON "program_weeks"("programId");

-- CreateIndex
CREATE INDEX "program_days_weekId_idx" ON "program_days"("weekId");

-- CreateIndex
CREATE INDEX "program_enrollments_userId_idx" ON "program_enrollments"("userId");

-- CreateIndex
CREATE INDEX "program_enrollments_programId_idx" ON "program_enrollments"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "program_enrollments_userId_programId_key" ON "program_enrollments"("userId", "programId");

-- CreateIndex
CREATE INDEX "coaching_sessions_coachId_idx" ON "coaching_sessions"("coachId");

-- CreateIndex
CREATE INDEX "coaching_sessions_userId_idx" ON "coaching_sessions"("userId");

-- CreateIndex
CREATE INDEX "coaching_sessions_scheduledAt_idx" ON "coaching_sessions"("scheduledAt");

-- CreateIndex
CREATE INDEX "coaching_sessions_status_idx" ON "coaching_sessions"("status");

-- CreateIndex
CREATE INDEX "progress_photos_userId_takenAt_idx" ON "progress_photos"("userId", "takenAt");

-- CreateIndex
CREATE INDEX "fitness_challenges_startDate_endDate_idx" ON "fitness_challenges"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "fitness_challenges_isActive_isPublic_idx" ON "fitness_challenges"("isActive", "isPublic");

-- CreateIndex
CREATE INDEX "fitness_challenge_participants_challengeId_idx" ON "fitness_challenge_participants"("challengeId");

-- CreateIndex
CREATE INDEX "fitness_challenge_participants_userId_idx" ON "fitness_challenge_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "fitness_challenge_participants_challengeId_userId_key" ON "fitness_challenge_participants"("challengeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "video_categories_name_key" ON "video_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "video_categories_slug_key" ON "video_categories"("slug");

-- CreateIndex
CREATE INDEX "on_demand_videos_categoryId_idx" ON "on_demand_videos"("categoryId");

-- CreateIndex
CREATE INDEX "on_demand_videos_difficulty_idx" ON "on_demand_videos"("difficulty");

-- CreateIndex
CREATE INDEX "on_demand_videos_isActive_isFeatured_idx" ON "on_demand_videos"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX "user_watch_history_userId_idx" ON "user_watch_history"("userId");

-- CreateIndex
CREATE INDEX "user_watch_history_videoId_idx" ON "user_watch_history"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "user_watch_history_userId_videoId_key" ON "user_watch_history"("userId", "videoId");

-- AddForeignKey
ALTER TABLE "trainers" ADD CONSTRAINT "trainers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_classes" ADD CONSTRAINT "virtual_classes_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_classes" ADD CONSTRAINT "virtual_classes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "class_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_enrollments" ADD CONSTRAINT "class_enrollments_classId_fkey" FOREIGN KEY ("classId") REFERENCES "virtual_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_reviews" ADD CONSTRAINT "class_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_reviews" ADD CONSTRAINT "class_reviews_classId_fkey" FOREIGN KEY ("classId") REFERENCES "virtual_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_weeks" ADD CONSTRAINT "program_weeks_programId_fkey" FOREIGN KEY ("programId") REFERENCES "workout_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_days" ADD CONSTRAINT "program_days_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "program_weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_enrollments" ADD CONSTRAINT "program_enrollments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "workout_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "trainers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fitness_challenge_participants" ADD CONSTRAINT "fitness_challenge_participants_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "fitness_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fitness_challenge_participants" ADD CONSTRAINT "fitness_challenge_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "on_demand_videos" ADD CONSTRAINT "on_demand_videos_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "video_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_watch_history" ADD CONSTRAINT "user_watch_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_watch_history" ADD CONSTRAINT "user_watch_history_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "on_demand_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
