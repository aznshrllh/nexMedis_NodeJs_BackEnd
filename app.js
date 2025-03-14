if (process.env.NODE_ENV !== "production") {
  import("dotenv").then(
    (dotenv) => {
      dotenv.config();
    },
    (err) => {
      console.error(err);
    }
  );
}

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
