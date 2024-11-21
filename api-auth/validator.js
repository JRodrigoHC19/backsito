const { body } = require('express-validator');
const { isEmailRegisted } = require('./database/querys');

const sets_in = {
    roles: ['cliente', 'empresa'],
    sex: ['male', 'female', 'other']
}

// Valida nuevo usuario
const SignUpCheck = function () {
    return [
        body('username')
            .trim()
            .notEmpty()
                .withMessage('Username is required')
            .isLength({ min: 3, max: 20 })
                .withMessage('Username must be between 3 and 20 characters')
        ,
        body('email')
            .trim()
            .notEmpty()
                .withMessage('Email is required')
            .isEmail()
                .withMessage('Invalid email')
            .custom( async(value) => {
                const isRegistered = await isEmailRegisted(value);
                if (isRegistered) { throw new Error('Email already registered') }
                return true;
            })
                .withMessage('Email is already registered')
        ,
        body('password')
            .trim()
            .notEmpty()
                .withMessage('Password is required')
            .isLength({ min: 6 })
                .withMessage('Password must be at least 6 characters long')
        ,
        body('role')
            .isIn(sets_in.roles)
                .withMessage('Invalid role')
        ,
        body('country')
            .optional()
            .isString()
                .withMessage('Country must be a string')
        ,
        body('date_of_birth')
            .optional()
            .isISO8601()
                .withMessage('Date of birth must be a valid date')
        ,
        body('sex')
            .optional()
            .isIn(sets_in.sex)
                .withMessage('Sex must be one of the following: male, female, other')
        ,
        body('url_web')
            .optional()
            .isURL()
                .withMessage('URL must be a valid URL')
    ];
};

// Validad el logeo con credenciales
const SignInCheck = function () {
    return [
        body('email')
            .trim()
            .notEmpty()
                .withMessage('Email is required')
            .isEmail()
                .withMessage('Invalid email')
        ,
        body('password')
            .trim()
            .notEmpty()
                .withMessage('Password is required')
    ]
}

module.exports = {
    SignUpCheck,
    SignInCheck
};