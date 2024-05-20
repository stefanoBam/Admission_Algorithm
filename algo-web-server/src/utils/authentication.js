// Valides user type matches params, otherwise returns 404 and redirects to
// home if logged in and login if not logged in
const checkAuthenticationWithUserType = (paramUserTypes, cb) => {
  return (req, res, ...params) => {
    if (
      req.session.authenticated &&
      paramUserTypes.some((paramUserType) =>
        req.session.user.userTypes.some(
          (dbUserType) => dbUserType === paramUserType
        )
      )
    ) {
      cb(req, res, ...params);
    } else if (req.session.authenticated) {
      res.status(404).render("pages/landing/home");
    } else {
      res.status(404).render("pages/landing/login");
    }
  };
};

// Checks if user is authenticaed, otherwise redirect to login
const checkAuthentication = (cb) => {
  return (req, res, ...params) => {
    if (req.session.authenticated) {
      cb(req, res, ...params);
    } else {
      res.status(404).render("pages/landing/login");
    }
  };
};

module.exports = {
  checkAuthentication,
  checkAuthenticationWithUserType,
};
