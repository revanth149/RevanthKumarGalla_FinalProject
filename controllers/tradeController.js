const model = require('../models/trade');
const Watch = require('../models/watch');
const Trading = require('../models/trading');

exports.index = (req,res,next)=>{
    model.find()
    .then(trades=>res.render('./trade/index', {trades}))
    .catch(err=>next(err)); 
};

exports.new = (req, res)=>{
    res.render('./trade/new');
};

exports.create = (req, res, next)=>{
    //res.send('Created a new trade');
    let trade = new model(req.body);
    trade.createdBy = req.session.user;
    trade.save()
    .then(trade=>{req.flash('success', 'A new trade has been successfully created');
    res.redirect('/trades')})
    .catch(err=>{
        if(err.name === 'ValidationError'){
            err.status= 400;
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};


exports.show = (req, res, next)=>{
    let id = req.params.id;
    // if(!id.match(/^[0-9a-fA-F]{24}$/)) {
    //     let err = new Error('Invalid trade id');
    //     err.status=400;
    //     return next(err);
    // }
    model.findById(id).populate('createdBy','firstName lastName')
    .then(trade=>{
        if(trade) {
            let onWatch = false;
            let user = req.session.user;
            if(user)
            {   
                Watch.findOne({ WatchedBy: user, trade: id })
                .then(item => {
                    onWatch = item ? true : false
                    return res.render('./trade/show', {trade,onWatch});
                })
                .catch(err => next(err));
            } else {
                return res.render('./trade/show', {trade,onWatch});
            }
            
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }   
    })
    .catch(err=>next(err));
};

exports.edit = (req, res, next)=>{
    let id = req.params.id;
    // if(!id.match(/^[0-9a-fA-F]{24}$/)) {
    //     let err = new Error('Invalid trade id');
    //     err.status=400;
    // .then(trade=>{req.flash('success', 'A new trade has successfully created');
    // res.redirect('/trades')})
    //     return next(err);
    // }
    model.findById(id)
    .then(trade=>{
        if(trade) {
            res.render('./trade/edit', {trade});
            
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
            err.status = 404;
            next(err);
        }   
    })
    .catch(err=>next(err));
};

exports.update = (req, res, next)=>{
    let trade = req.body;
    let id = req.params.id;

    // if(!id.match(/^[0-9a-fA-F]{24}$/)) {
    //     let err = new Error('Invalid trade id');
    //     err.status=400;
    //     return next(err);
    // }
    model.findByIdAndUpdate(id, trade, {useFindAndModify: false, runValidators: true})
    .then(trade=> {
        if(trade) {
            req.flash('success', 'This trade has been updated successfully');
            res.redirect('/trades/'+id);
        } else {
            let err = new Error('Cannot find a trade with id ' + id);
                err.status = 404;
                next(err);

        }
    })
    .catch(err=>{
        if(err.name === 'ValidationError'){
            err.status= 400;
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

exports.delete = (req, res, next)=>{
    let id = req.params.id;

    
    // if(!id.match(/^[0-9a-fA-F]{24}$/)) {
    //     let err = new Error('Invalid trade id');
    //     err.status=400;
    //     return next(err);
    // }

    model.findByIdAndDelete(id, {useFindAndModify: false})
    .then(trade => {
        if(trade) {
        req.flash('success', 'Trade has been successfully deleted');
        res.redirect('/trades');
    } else {
        let err = new Error('Cannot find a trade with id ' + id);
        err.status = 404;
        next(err);
    }
})
    .catch(err=>next(err));
};

exports.makeoffer = (req, res, next) => {
    let trading = new Trading(req.body);
    trading.status = 0
    console.log(req.body);
    trading.save()
    .then(() => {
        Promise.all([model.findOneAndUpdate({_id: req.body.trade}, {status:"Offer Pending"}), 
            model.findOneAndUpdate({_id: req.body.offer},{status:"Offer Pending"}) ])
            .then(result => {
                req.flash('success', 'Trade offered successfully.')
                res.redirect('/users/profile')
            })
            .catch(err=>next(err))
    })
    .catch(err => {
        if (err.name === 'MongoServerError') {
            err.status = 400;
            req.flash('error', 'There is some problem in making trade offer.')
            res.redirect(`/trades/${req.body.trade}`) 
        }
        next(err);
    });
};

exports.accept = (req, res, next) => {
    let tradeId = req.params.id;
    Trading.findOneAndUpdate({_id: tradeId}, {status: true})
    .then(result =>{
        if (result) {
            Promise.all([model.findOneAndUpdate({_id: result.trade}, {status: "Traded"}), 
                model.findOneAndUpdate({_id: result.offer}, {status: "Traded"})])
            req.flash('success', 'Trade accepted')
            res.redirect('/users/profile');
        } else {
            req.flash('error', 'Failed to accept the trade')
        }
    })
    .catch(err=>next(err))
}

exports.cancel = (req, res, next) => {
    tradingId = req.params.id;
    Trading.findOneAndDelete({ _id:  tradingId})
    .then(result =>{
        if (result) {
            Promise.all([model.findOneAndUpdate({_id: result.trade}, {status:"Available"}), 
                model.findOneAndUpdate({_id: result.offer}, {status:"Available"})])
            req.flash('success', 'Trade offer has been cancelled successfully')
            res.redirect('/users/profile');
        } else {
            req.flash('error', 'Failed to cancel the trade')
        }
    })
    .catch(err=>next(err))
}