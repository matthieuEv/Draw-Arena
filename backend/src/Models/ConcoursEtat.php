<?php
declare(strict_types=1);

namespace DrawArena\Models;

/**
 * Énumération des états possibles d'un concours
 */
enum ConcoursEtat: string
{
    case PAS_COMMENCE = 'pas_commence';
    case EN_COURS = 'en_cours';
    case ATTENTE = 'attente';
    case RESULTAT = 'resultat';
    case EVALUE = 'evalue';
}
