const model = require('../models/user');
const Trade = require('../models/trade');
const Watch = require('../models/watch');
const Trading = require('../models/trading');
exports.new = (req, res)=>{
        return res.render('./user/new');
  
};

exports.create = (req, res, next)=>{
    //res.send('Created a new trade');
    let user = new model(req.body);//create a new trade document
    if(user.email)
        user.email = user.email.toLowerCase();
    user.save()//insert the document to the database
    .then(user=> {
        req.flash('success','Account created successfully');
        res.redirect('/users/login');
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('back');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used');  
            return res.redirect('back');
        }
        
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {

    res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    if(email)
        email=email.toLowerCase();
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in,'+user.firstName);
                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    Promise.all([
        model.findById(id), 
        Trade.find({createdBy: id}), 
        Watch.find({WatchedBy: id}).populate('trade'),
        Trading.find({tradeOwner: id, status: false}).populate('trade').populate('tradeOwner', 'firstName lastName').populate('offer').populate('offerBy', 'firstName lastName'),
        Trading.find({offerBy: id, status: false}).populate('trade').populate('tradeOwner', 'firstName lastName').populate('offer').populate('offerBy', 'firstName lastName'),
    ])
    .then(results=>{
        const [user,trades,watchlist, offersReceived, offersGiven] = results;
        res.render('./user/profile', {user,trades,watchlist,offersReceived, offersGiven });
    })
    .catch(err=>next(err));
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };

 exports.watch = (req, res,next) => {
    let userId = req.session.user;
    let tradeId = req.params.id;
    Watch.findOne({ onWatchedBy: userId, trade: tradeId })
    .then(result=>{
        if(!result) {
            let watch = new Watch({ WatchedBy: userId, trade: tradeId });
            watch.save()
            .then((entry) => {
                req.flash('success', 'Trade added to watchlist')
                res.redirect(`/users/profile`);
            })
            .catch(err => {
                req.flash('error', 'Failed to add trade to watchlist')
                next(err);
            });
        } else {
            req.flash('success', 'Trade has been already added to watchlist')
            res.redirect(`/trades/${tradeId}`);
        }
    })
    .catch(err => {
        if (err.name === 'ValidationError') {
            err.status = 400;
            req.flash('error', err.message)
            res.redirect('back') 
        }
        next(err);
    });
}

exports.unwatch = (req, res) => {
    let userId = req.session.user;
    let tradeId = req.params.id;
    Watch.findOneAndDelete({ WatchedBy: userId, trade: tradeId })
    .then(result=> {
        req.flash('success', 'Trade removed from watchlist')
        res.redirect('back');
    })
    .catch(err => {
        if (err.name === 'ValidationError') {
            err.status = 400;
            req.flash('error', err.message)
            res.redirect('back') 
        }
    })
}

exports.tradingOffer = (req, res,next) => {
    let offerBy = req.session.user;
    let tradeID = req.params.id;
    let tradeOwner = null;
    Trade.findById(tradeID)
    .then(trade => {
        tradeOwner = trade.createdBy;
    })

    if(offerBy) {
        Promise.all([model.findById(offerBy), Trade.find({createdBy: offerBy})])
        .then(results=> {
            const [user, trades] = results;
        res.render('./trade/tradeOffer', {tradeID, tradeOwner, offerBy, trades,user})
    })
}
}