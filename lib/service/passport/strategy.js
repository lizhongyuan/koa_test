

async function localStratetyStrategy(username, password, done) {
  let user;
  try {
    user = await Dao.User.getByLogin(username);
    if (user === null || user === undefined) {
      return done(null, false, { code: 401, error: '没有查找到该用户' });
    }
  } catch (err) {
    return done(err);
  }
  
  try {
    const isValid = Util.Password.validatePassword(username, password, user.pwd);
    if (isValid) {
      return done(null, user);
    } else {
      return done(null, false, { code: 403, error: '密码错误' });
    }
  } catch (err) {
    return done(err);
  }
  
  /*
  mdb.user.getByLogin username, (err, user) ->
  return done(err) if (err)
    return return done(null, false, { code: 401, error: '没有查找到该用户' }) if not user
  
  util_password = require('./myutil/password.coffee')
  if util_password.validatePassword(username, password, user.pwd)
    done(null, user)
  else
    done(null, false, { code: 403, error: '密码错误' })
  */
}


async function getBearerStratety(accessToken, done) {
  
  let token;
  try {
    token = Dao.Accesstoken.findOne({ primaryToken: accessToken });
    if ( !token || !token.user) {
      return done(null, false, {errorCode: 401, message: "Invalid token." });
    }
    if (token.isExpired()) {
      return done(null, false, {errorCode: 401, message: "Expired token."});
    }
  } catch (err) {
    return done(err);
  }
  
  const info = {
    scope: '*', // 数据库查找范围
    token: token.primaryToken
  };

  done(null, user, info);
}


function serializeUser (user, done) {
  done(null, user.login);
}


async function deserializeUser (login, done) {
  let user;
  try {
    user = await Dao.User.getByLogin(login);
  } catch (err) {
    return done(err);
  }
}


module.exports = {
  localStratetyStrateg,
  getBearerStratety,
  serializeUser,
  deserializeUser,
}