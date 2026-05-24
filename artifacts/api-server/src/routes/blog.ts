import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, blogArticlesTable } from "@workspace/db";
import {
  GetBlogArticlesResponse,
  GetBlogArticleBySlugParams,
  GetBlogArticleBySlugResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/blog", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(blogArticlesTable)
    .orderBy(blogArticlesTable.publishedAt);

  res.json(GetBlogArticlesResponse.parse(rows.map(serializeArticle)));
});

router.get("/blog/:slug", async (req, res): Promise<void> => {
  const params = GetBlogArticleBySlugParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(blogArticlesTable)
    .where(eq(blogArticlesTable.slug, params.data.slug));

  if (!row) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(GetBlogArticleBySlugResponse.parse(serializeArticle(row)));
});

function serializeArticle(row: typeof blogArticlesTable.$inferSelect) {
  return {
    ...row,
    tags: row.tags ?? [],
    imageUrl: row.imageUrl ?? null,
    publishedAt: row.publishedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export default router;
