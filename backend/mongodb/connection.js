import mongoose from "mongoose";

const mongoDBConnect = () => {
  try {
    console.log(process.env.PROD_URL)
    mongoose.connect(process.env.PROD_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB - Connected at " + process.env.PROD_URL);
  } catch (error) {
    console.log(process.env.PROD_URL)
    console.log("Error - MongoDB Connection " + error);
  }
};
export default mongoDBConnect;
