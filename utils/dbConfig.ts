import { connect } from "mongoose";

// const url: string = "mongodb://127.0.0.1:27017/cashDB";

const url: string =
  "mongodb+srv://brighterdayscodelab:brighterdayscodelab@cluster0.dmr8kfs.mongodb.net/AJCash?retryWrites=true&w=majority";

export const dbConfig = async () => {
  await connect(url)
    .then(() => {
      console.log("db Connected 🚀🚀");
    })
    .catch((err) => console.error(err));
};
