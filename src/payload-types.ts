export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageKeys: string[];
  imageUrls: string[];
  productFileUrls: string[];
  productFileKeys: string[];
  status: "APPROVED" | "PENDING" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  userId: string;
  category: string;
}
