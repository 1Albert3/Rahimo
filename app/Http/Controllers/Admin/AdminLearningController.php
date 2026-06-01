<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\CourseProgress;
use App\Models\Quiz;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminLearningController extends Controller
{
    // ─── Courses ────────────────────────────────────────────

    public function coursesIndex()
    {
        $courses = Course::withCount('quizzes')
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(fn ($c) => [
                'id' => $c->id,
                'titre' => $c->titre,
                'categorie' => $c->categorie,
                'difficulte' => $c->difficulte,
                'duree_minutes' => $c->duree_minutes,
                'obligatoire' => $c->obligatoire,
                'published' => $c->published,
                'quizzes_count' => $c->quizzes_count,
                'video_url' => $c->video_url,
                'created_at' => $c->created_at->format('Y-m-d'),
            ]);

        $stats = [
            'total' => Course::count(),
            'publies' => Course::where('published', true)->count(),
            'obligatoires' => Course::where('obligatoire', true)->count(),
            'certificats_delivres' => Certificate::count(),
        ];

        return Inertia::render('Admin/Formations/Index', compact('courses', 'stats'));
    }

    public function coursesCreate()
    {
        return Inertia::render('Admin/Formations/Form', [
            'course' => null,
            'categories' => [
                Course::CATEGORIE_SECURITE,
                Course::CATEGORIE_REGLEMENT,
                Course::CATEGORIE_CONDUITE,
                Course::CATEGORIE_SERVICE,
            ],
            'difficultes' => [
                Course::DIFFICULTE_DEBUTANT,
                Course::DIFFICULTE_INTERMEDIAIRE,
                Course::DIFFICULTE_AVANCE,
            ],
        ]);
    }

    public function coursesStore(Request $request)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'categorie' => 'required|in:' . implode(',', [
                Course::CATEGORIE_SECURITE,
                Course::CATEGORIE_REGLEMENT,
                Course::CATEGORIE_CONDUITE,
                Course::CATEGORIE_SERVICE,
            ]),
            'difficulte' => 'required|in:' . implode(',', [
                Course::DIFFICULTE_DEBUTANT,
                Course::DIFFICULTE_INTERMEDIAIRE,
                Course::DIFFICULTE_AVANCE,
            ]),
            'duree_minutes' => 'required|integer|min:1',
            'obligatoire' => 'boolean',
            'published' => 'boolean',
            'contenu' => 'nullable|string',
            'video_url' => 'nullable|url|max:500',
            'document_url' => 'nullable|url|max:500',
            'image_url' => 'nullable|url|max:500',
        ]);

        $validated['obligatoire'] ??= false;
        $validated['published'] ??= true;

        Course::create($validated);

        return redirect()->route('admin.formations.cours')->with('success', 'Formation créée.');
    }

    public function coursesEdit(Course $course)
    {
        $course->loadCount('quizzes');
        return Inertia::render('Admin/Formations/Form', [
            'course' => [
                'id' => $course->id,
                'titre' => $course->titre,
                'description' => $course->description,
                'categorie' => $course->categorie,
                'difficulte' => $course->difficulte,
                'duree_minutes' => $course->duree_minutes,
                'obligatoire' => $course->obligatoire,
                'published' => $course->published,
                'contenu' => $course->contenu,
                'video_url' => $course->video_url,
                'document_url' => $course->document_url,
                'image_url' => $course->image_url,
                'quizzes_count' => $course->quizzes_count,
            ],
            'categories' => [
                Course::CATEGORIE_SECURITE,
                Course::CATEGORIE_REGLEMENT,
                Course::CATEGORIE_CONDUITE,
                Course::CATEGORIE_SERVICE,
            ],
            'difficultes' => [
                Course::DIFFICULTE_DEBUTANT,
                Course::DIFFICULTE_INTERMEDIAIRE,
                Course::DIFFICULTE_AVANCE,
            ],
        ]);
    }

    public function coursesUpdate(Request $request, Course $course)
    {
        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'categorie' => 'required|in:securite,reglement,conduite,service',
            'difficulte' => 'required|in:debutant,intermediaire,avance',
            'duree_minutes' => 'required|integer|min:1',
            'obligatoire' => 'boolean',
            'published' => 'boolean',
            'contenu' => 'nullable|string',
            'video_url' => 'nullable|url|max:500',
            'document_url' => 'nullable|url|max:500',
            'image_url' => 'nullable|url|max:500',
        ]);

        $course->update($validated);

        return redirect()->route('admin.formations.cours')->with('success', 'Formation mise à jour.');
    }

    public function coursesDestroy(Course $course)
    {
        $course->delete();
        return redirect()->route('admin.formations.cours')->with('success', 'Formation supprimée.');
    }

    // ─── Quizzes ────────────────────────────────────────────

    public function quizzesIndex(Course $course)
    {
        $quizzes = $course->quizzes()->orderBy('id')->get()->map(fn ($q) => [
            'id' => $q->id,
            'question' => $q->question,
            'options' => $q->options,
            'correct_answer' => $q->correct_answer,
            'points' => $q->points,
        ]);

        return Inertia::render('Admin/Formations/Quizzes', [
            'course' => ['id' => $course->id, 'titre' => $course->titre],
            'quizzes' => $quizzes,
        ]);
    }

    public function quizzesStore(Request $request, Course $course)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'options' => 'required|array|min:2',
            'options.*' => 'required|string',
            'correct_answer' => 'required|string',
            'points' => 'required|integer|min:1',
        ]);

        $course->quizzes()->create($validated);

        return back()->with('success', 'Question ajoutée.');
    }

    public function quizzesUpdate(Request $request, Course $course, Quiz $quiz)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'options' => 'required|array|min:2',
            'options.*' => 'required|string',
            'correct_answer' => 'required|string',
            'points' => 'required|integer|min:1',
        ]);

        $quiz->update($validated);

        return back()->with('success', 'Question mise à jour.');
    }

    public function quizzesDestroy(Course $course, Quiz $quiz)
    {
        $quiz->delete();
        return back()->with('success', 'Question supprimée.');
    }

    // ─── Certificats ────────────────────────────────────────

    public function certificatesIndex()
    {
        $certificates = Certificate::with('user', 'course')
            ->latest()
            ->paginate(30)
            ->through(fn ($c) => [
                'id' => $c->id,
                'employe' => $c->user?->name,
                'formation' => $c->course?->titre,
                'numero' => $c->certificate_number,
                'score' => $c->score,
                'emis_le' => $c->issued_at?->format('Y-m-d'),
                'expire_le' => $c->expires_at?->format('Y-m-d'),
                'pdf_url' => $c->pdf_path ? asset('storage/' . $c->pdf_path) : null,
            ]);

        return Inertia::render('Admin/Formations/Certificats', compact('certificates'));
    }

    public function certificatesIssue(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_id' => 'required|exists:courses,id',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $course = Course::findOrFail($validated['course_id']);

        $progress = CourseProgress::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (!$progress || !$progress->completed) {
            return back()->with('error', 'L\'employé n\'a pas terminé la formation.');
        }

        $cert = Certificate::firstOrCreate(
            ['user_id' => $user->id, 'course_id' => $course->id],
            [
                'certificate_number' => Certificate::generateNumber(),
                'score' => $progress->score,
                'issued_at' => now(),
                'expires_at' => now()->addYear(),
            ]
        );

        $cert->generatePdf();

        return back()->with('success', 'Certificat délivré.');
    }

    public function certificatesGeneratePdf(Certificate $certificate)
    {
        if (!$certificate->pdf_path) {
            $certificate->generatePdf();
        }

        return response()->download(storage_path('app/public/' . $certificate->pdf_path));
    }
}
