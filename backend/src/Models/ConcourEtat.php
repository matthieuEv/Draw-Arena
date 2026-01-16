<?php
declare(strict_types=1);

namespace DrawArena\Models;

/**
 * Énumération des états possibles d'un concours
 */
enum ConcourEtat: string
{
    case PAS_COMMENCE = 'pas commence';
    case EN_COURS = 'en cours';
    case ATTENTE = 'attente';
    case RESULTAT = 'resultat';
    case EVALUE = 'evalue';
}
