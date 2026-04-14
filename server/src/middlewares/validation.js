import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      message: 'Erreur de validation',
      errors: errors.array(),
    });
  };
};

// Validations pour l'authentification
export const validateRegister = validate([
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
]);

export const validateLogin = validate([
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
]);

// Validations pour les clients
export const validateClient = validate([
  body('full_name').trim().notEmpty().withMessage('Le nom complet est requis'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email invalide'),
  body('phone').optional({ checkFalsy: true }).isString(),
  body('address').optional({ checkFalsy: true }).isString(),
]);

// Validation pour les mises à jour de clients (champs optionnels)
export const validateClientUpdate = validate([
  body('full_name').optional({ checkFalsy: true }).trim(),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email invalide'),
  body('phone').optional({ checkFalsy: true }).isString(),
  body('address').optional({ checkFalsy: true }).isString(),
]);

// Validations pour les services
export const validateService = validate([
  body('code').trim().notEmpty().withMessage('Le code est requis'),
  body('label').trim().notEmpty().withMessage('Le libellé est requis'),
  body('monthly_price').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
]);

// Validations pour les abonnements
export const validateSubscription = validate([
  body('client_id').isUUID().withMessage('ID client invalide'),
  body('service_id').isUUID().withMessage('ID service invalide'),
  body('status_id').isUUID().withMessage('ID statut invalide'),
  body('agent_id').optional({ checkFalsy: true, nullable: true }).isUUID().withMessage('ID agent invalide'),
  body('line_number').optional({ checkFalsy: true }).isString(),
  body('subscription_date').optional({ checkFalsy: true }).isISO8601().withMessage('Date invalide'),
  body('installation_date').optional({ checkFalsy: true }).isISO8601().withMessage('Date invalide'),
]);
