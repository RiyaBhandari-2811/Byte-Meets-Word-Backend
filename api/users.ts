import { Request, Response } from "express";

module.exports = (req: Request, res: Response) => {
  if (req.method === "GET") {
    res.status(200).json({ name: "John Doe" });
  } else if (req.method === "POST") {
    const { name } = req.body;

    res.status(201).json({ message: "User created with name " + name });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};
