import jwt from 'jsonwebtoken';

export const Auth = async (req, res, next) => {
  try {
    
    let token = req.headers.authorization.split(' ')[1]; //when using browser this line
    console.log(token)
      const verifiedUser = jwt.verify(token, "process.env.SECRET");
      console.log("verified user",verifiedUser)
      req.token = token;
      //req.userId = verifiedUser.id

      // to get user data do this 
      // const rootUser = await user
      // .findOne({ _id: verifiedUser.id })
      // .select('-password');


    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: 'Invalid Token' });
  }
};


