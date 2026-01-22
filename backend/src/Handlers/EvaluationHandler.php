<?php
declare(strict_types=1);

namespace DrawArena\Handlers;

use DrawArena\Core\Request;
use DrawArena\Core\Response;
use DrawArena\Models\Evaluation;

class EvaluationHandler
{
    public function getAllEvaluation(Request $request, Response $response): void
    {
        $limit = (int) $request->getQuery('limit', 100);
        $index = (int) $request->getQuery('index', 0);
        $year = (int) $request->getQuery('year', 0);

        if ($year !== 0) {
            $evaluations = Evaluation::getAllByYear($year, $limit, $index);
            $response->success(['evaluations' => $evaluations])->send();
        } else {
            $evaluations = Evaluation::getAll($limit, $index);
            $response->success(['evaluations' => $evaluations])->send();
        }
    }
}
