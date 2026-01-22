<?php
declare(strict_types=1);

namespace DrawArena\Utils;

use DrawArena\Models\UtilisateurType;

class Validator
{
    private array $errors = [];

    public function validate(array $data, array $rules): bool
    {
        $this->errors = [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $rules_list = is_string($fieldRules) ? explode('|', $fieldRules) : $fieldRules;

            foreach ($rules_list as $rule) {
                $this->applyRule($field, $value, $rule);
            }
        }

        return empty($this->errors);
    }

    private function applyRule(string $field, mixed $value, string $rule): void
    {
        if (strpos($rule, ':') !== false) {
            [$ruleName, $param] = explode(':', $rule, 2);
        } else {
            $ruleName = $rule;
            $param = null;
        }

        match ($ruleName) {
            'required' => $this->validateRequired($field, $value),
            'email' => $this->validateEmail($field, $value),
            'min' => $this->validateMin($field, $value, (int)$param),
            'max' => $this->validateMax($field, $value, (int)$param),
            'string' => $this->validateString($field, $value),
            'numeric' => $this->validateNumeric($field, $value),
            'typeCompte' => $this->validateTypeCompte($field, $value),
            default => null,
        };
    }

    private function validateRequired(string $field, mixed $value): void
    {
        if (empty($value)) {
            $this->addError($field, "{$field} is required");
        }
    }

    private function validateEmail(string $field, mixed $value): void
    {
        if ($value !== null && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, "{$field} must be a valid email");
        }
    }

    private function validateMin(string $field, mixed $value, int $min): void
    {
        if ($value !== null && strlen((string)$value) < $min) {
            $this->addError($field, "{$field} must be at least {$min} characters");
        }
    }

    private function validateMax(string $field, mixed $value, int $max): void
    {
        if ($value !== null && strlen((string)$value) > $max) {
            $this->addError($field, "{$field} must not exceed {$max} characters");
        }
    }

    private function validateString(string $field, mixed $value): void
    {
        if ($value !== null && !is_string($value)) {
            $this->addError($field, "{$field} must be a string");
        }
    }

    private function validateNumeric(string $field, mixed $value): void
    {
        if ($value !== null && !is_numeric($value)) {
            $this->addError($field, "{$field} must be numeric");
        }
    }

    private function validateTypeCompte(string $field, mixed $value): void
    {
        if ($value !== null) {
            $validValues = array_map(fn($case) => $case->value, UtilisateurType::cases());
            if (!in_array($value, $validValues, true)) {
                $this->addError($field, "{$field} must be a valid typeCompte");
            }
        }
    }

    private function addError(string $field, string $message): void
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
