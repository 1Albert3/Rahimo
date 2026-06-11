<?php
namespace App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Admin\AdminLearningController as AdminBase;
use App\Http\Controllers\LearningController as DriverBase;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Quiz;
use App\Models\Certificate;
use Illuminate\Http\Request;

class LearningController extends Controller
{
    protected AdminBase $admin;
    protected DriverBase $driver;

    public function __construct() {
        $this->admin  = app(AdminBase::class);
        $this->driver = app(DriverBase::class);
    }

    private function j($r) { return (request()->expectsJson() && method_exists($r, 'getData')) ? response()->json($r->getData()) : $r; }
    private function ok($msg, $code = 200) { return request()->expectsJson() ? response()->json(['message' => $msg], $code) : back()->with('success', $msg); }

    // Admin CRUD
    public function coursesIndex()             { return $this->j($this->admin->coursesIndex()); }
    public function coursesStore(Request $r)   { $this->admin->coursesStore($r); return $this->ok('Cours créé.', 201); }
    public function coursesUpdate(Request $r, Course $course) { $this->admin->coursesUpdate($r, $course); return $this->ok('Cours mis à jour.'); }
    public function coursesDestroy(Course $course)            { $this->admin->coursesDestroy($course);   return $this->ok('Cours supprimé.'); }
    public function quizzesIndex(Course $course)              { return $this->j($this->admin->quizzesIndex($course)); }
    public function quizzesStore(Request $r, Course $course)  { $this->admin->quizzesStore($r, $course); return $this->ok('Quiz créé.', 201); }
    public function quizzesUpdate(Request $r, Course $course, Quiz $quiz) { $this->admin->quizzesUpdate($r, $course, $quiz); return $this->ok('Quiz mis à jour.'); }
    public function quizzesDestroy(Course $course, Quiz $quiz)            { $this->admin->quizzesDestroy($course, $quiz);   return $this->ok('Quiz supprimé.'); }
    public function certificatesIndex()              { return $this->j($this->admin->certificatesIndex()); }
    public function certificatesIssue(Request $r)    { $this->admin->certificatesIssue($r); return $this->ok('Certificat émis.', 201); }
    public function certificatesGeneratePdf(Certificate $certificate) { return $this->admin->certificatesGeneratePdf($certificate); }

    // Driver
    public function myCoursesIndex()             { return $this->j($this->driver->index()); }
    public function myCourseShow(Course $course) { return $this->j($this->driver->show($course)); }
    public function submitQuiz(Request $r, Quiz $quiz) { return $this->driver->submitQuiz($r, $quiz); }
}
