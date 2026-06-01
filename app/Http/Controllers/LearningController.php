<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseProgress;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LearningController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $courses = Course::withCount('quizzes')
            ->orderBy('created_at')
            ->get()
            ->map(function ($c) use ($user) {
                $progress = CourseProgress::where('user_id', $user?->id)
                    ->where('course_id', $c->id)
                    ->first();

                $totalQuizzes = $c->quizzes_count;
                $passedQuizzes = QuizAttempt::where('user_id', $user?->id)
                    ->whereIn('quiz_id', $c->quizzes()->pluck('id'))
                    ->where('correct', true)
                    ->count();

                return [
                    'id' => $c->id,
                    'titre' => $c->titre,
                    'description' => $c->description,
                    'categorie' => $c->categorie,
                    'duree_minutes' => $c->duree_minutes,
                    'difficulte' => $c->difficulte,
                    'obligatoire' => $c->obligatoire,
                    'completed' => $progress?->completed ?? false,
                    'score' => $progress?->score ?? 0,
                    'progress' => $totalQuizzes > 0 ? round(($passedQuizzes / $totalQuizzes) * 100) : 0,
                    'total_quizzes' => $totalQuizzes,
                    'passed_quizzes' => $passedQuizzes,
                ];
            });

        $stats = [
            'total' => $courses->count(),
            'completed' => $courses->where('completed', true)->count(),
            'obligatoires' => $courses->where('obligatoire', true)->count(),
            'score_moyen' => round($courses->avg('score') ?? 0),
        ];

        return Inertia::render('Admin/Formations', [
            'cours' => $courses,
            'stats' => $stats,
        ]);
    }

    public function show(Course $course)
    {
        $course->load('quizzes');

        $quizzes = $course->quizzes->map(function ($q) {
            $attempt = QuizAttempt::where('user_id', Auth::id())
                ->where('quiz_id', $q->id)
                ->first();

            return [
                'id' => $q->id,
                'question' => $q->question,
                'options' => $q->options,
                'points' => $q->points,
                'answered' => $attempt !== null,
                'correct' => $attempt?->correct,
                'user_answer' => $attempt?->answer,
            ];
        });

        $progress = CourseProgress::where('user_id', Auth::id())
            ->where('course_id', $course->id)
            ->first();

        return Inertia::render('Admin/FormationDetail', [
            'cours' => [
                'id' => $course->id,
                'titre' => $course->titre,
                'description' => $course->description,
                'categorie' => $course->categorie,
                'duree_minutes' => $course->duree_minutes,
                'contenu' => $course->contenu,
                'completed' => $progress?->completed ?? false,
                'score' => $progress?->score ?? 0,
            ],
            'quizzes' => $quizzes,
        ]);
    }

    public function submitQuiz(Request $request, Quiz $quiz)
    {
        $validated = $request->validate([
            'answer' => 'required|string',
        ]);

        $correct = $quiz->isCorrect($validated['answer']);

        QuizAttempt::create([
            'user_id' => Auth::id(),
            'quiz_id' => $quiz->id,
            'answer' => $validated['answer'],
            'correct' => $correct,
        ]);

        // Vérifier progression du cours
        $course = $quiz->course;
        $totalQuizzes = $course->quizzes()->count();
        $passedQuizzes = QuizAttempt::where('user_id', Auth::id())
            ->whereIn('quiz_id', $course->quizzes()->pluck('id'))
            ->where('correct', true)
            ->count();

        $score = round(($passedQuizzes / $totalQuizzes) * 100);

        CourseProgress::updateOrCreate(
            ['user_id' => Auth::id(), 'course_id' => $course->id],
            [
                'score' => $score,
                'completed' => $score >= 80,
                'completed_at' => $score >= 80 ? now() : null,
            ]
        );

        return back()->with('success', $correct ? 'Bonne réponse !' : 'Mauvaise réponse. Réessayez.');
    }
}
