const {body} = require('express-validator');
const {validationResult} = require('express-validator');

exports.validateId = (req,res,next) => {
    let id = req.params.id;
    if(id.match(/^[0-9a-fA-F]{24}$/)) {
        return next();
    } else { 
        let err = new Error('Invalid trade id');
        err.status = 400;
        return next(err);
    }
};

exports.validateSignUp = [
    body('firstName','First Name cannot be empty').notEmpty().trim().escape(),
    body('lastName','Last Name cannot be empty').notEmpty().trim().escape(),
    body('email','Email must be valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password','Password must be atleast 8 characters and atmost 64 characters').isLength({min:8, max:64})
];
    
exports.validateLogIn = [
    body('email','Email must be valid email address').isEmail().trim().escape().normalizeEmail(),
    body('password','Password must be atleast 8 characters and atmost 64 characters').isLength({min:8, max:64})
];


exports.validateTrade = [
    body('title', 'Title must be 3 or more characters').isLength({min:3}).trim().escape(),
    body('Details', 'Details must be 10 or more characters').isLength({min:10}).trim().escape(),
    body('category', 'category must be 3 or more characters').isLength({min:3}).trim().escape(),
    body('status', 'status cannot be empty').notEmpty().trim().escape(),
    body('image', 'Image URL cannot be empty').notEmpty().trim(),
];

exports.validateResult = (req,res,next) => {
    let errors = validationResult(req);
    if(!errors.isEmpty()){
        errors.array().forEach(error=> {
            req.flash('error', error.msg);
        });
        return res.redirect('back');
    } else {
        return next();
    }
}

