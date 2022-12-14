const Trade = require('../models/trade');
// Check if user is a Guest
exports.isGuest=(req,res,next)=>{
    if(!req.session.user){
        return next();
    } else {
        req.flash('error','You are logged in already');
        return res.redirect('/users/profile');
    }
};

// Check if user is logged in
exports.isLoggedIn=(req,res,next)=>{
    if(req.session.user){
        return next();
    } else {
        req.flash('error','You need to login first');
        return res.redirect('/users/login');
    }
};

//check if user is the author of the trade
exports.isCreatedBy = (req,res,next)=> {
    let id = req.params.id;
    Trade.findById(id)
    .then(trade=> {
        if(trade)
        {
            if(trade.createdBy == req.session.user){
                return next();
            } else {
                req.flash('error','Unauthorized to access the resource');
                return res.redirect('/');
            }
        }
    })
    .catch(err=>next(err));
}; 