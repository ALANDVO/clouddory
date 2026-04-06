import { prisma } from "@/lib/prisma";
import BlogManager from "./blog-manager";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    authorName: p.authorName,
    status: p.status,
    tags: p.tags as string[] | null,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  return <BlogManager posts={serialized} />;
}
