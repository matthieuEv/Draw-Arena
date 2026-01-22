<?php
declare(strict_types=1);

namespace DrawArena\Models;

/**
 * Énumération des types possibles d'un utilisateur
 */
enum UtilisateurType: string
{
    case PRIVE = 'prive';
    case PUBLIC = 'public';
}
