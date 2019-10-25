module.exports = (req, res, next) => {
    //console.log("path: " + req.url);
    let publicPages = ['/login', '/signin'];
    if (publicPages.indexOf(req.url) >= 0) {
        if (req.session.user_id)
            res.redirect('/');
        else
            next();
    } else {
        if (!req.session.user_id)
            res.redirect('/login');
        else {
            if (req.session.TwoFA)
                if (req.url.includes('/confirm'))
                    next();
                else
                    if (req.url.includes('/logout'))
                        next();
                    else
                        res.redirect('/confirm');
            else
                next();
        }
    }
}