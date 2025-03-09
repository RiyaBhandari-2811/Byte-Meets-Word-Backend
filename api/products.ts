import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let products = ["apple", "banana"];

  if (req.method === "GET") {
    res.status(200).json({ products });
  } else if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { name } = body;

    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    products.push(name);
    res.status(201).json({ message: "Product added!", products });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
