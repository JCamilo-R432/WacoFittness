import { Request, Response } from 'express';
import prisma from '../config/database';

export class SocialController {
  // GET /api/social/feed
  static async getFeed(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { page = 1, limit = 20, category } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (category && category !== 'all') where.category = category;

      const posts = await prisma.socialPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
          likes: { where: { userId }, select: { id: true } },
          _count: { select: { likes: true, comments: true } },
        },
      });

      const enriched = posts.map(p => ({
        ...p,
        likedByMe: p.likes.length > 0,
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        likes: undefined,
        _count: undefined,
      }));

      res.json({ success: true, data: enriched });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // POST /api/social/posts
  static async createPost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { content, imageUrl, category } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({ success: false, error: 'El contenido es requerido' });
      }
      const post = await prisma.socialPost.create({
        data: { userId, content: content.trim(), imageUrl, category: category || 'general' },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      });
      res.status(201).json({ success: true, data: post });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // DELETE /api/social/posts/:id
  static async deletePost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const post = await prisma.socialPost.findUnique({ where: { id } });
      if (!post || post.userId !== userId) {
        return res.status(403).json({ success: false, error: 'No autorizado' });
      }
      await prisma.socialPost.delete({ where: { id } });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // POST /api/social/posts/:id/like
  static async toggleLike(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id: postId } = req.params;

      const existing = await prisma.postLike.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      if (existing) {
        await prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
        const count = await prisma.postLike.count({ where: { postId } });
        await prisma.socialPost.update({ where: { id: postId }, data: { likesCount: count } });
        return res.json({ success: true, liked: false, likesCount: count });
      }

      await prisma.postLike.create({ data: { postId, userId } });
      const count = await prisma.postLike.count({ where: { postId } });
      await prisma.socialPost.update({ where: { id: postId }, data: { likesCount: count } });
      res.json({ success: true, liked: true, likesCount: count });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /api/social/posts/:id/comments
  static async getComments(req: Request, res: Response) {
    try {
      const { id: postId } = req.params;
      const comments = await prisma.postComment.findMany({
        where: { postId },
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      });
      res.json({ success: true, data: comments });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // POST /api/social/posts/:id/comments
  static async addComment(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id: postId } = req.params;
      const { content } = req.body;
      if (!content?.trim()) {
        return res.status(400).json({ success: false, error: 'El comentario es requerido' });
      }
      const comment = await prisma.postComment.create({
        data: { postId, userId, content: content.trim() },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      });
      res.status(201).json({ success: true, data: comment });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // POST /api/social/follow/:targetId
  static async toggleFollow(req: Request, res: Response) {
    try {
      const followerId = (req as any).user.id;
      const { targetId: followingId } = req.params;
      if (followerId === followingId) {
        return res.status(400).json({ success: false, error: 'No puedes seguirte a ti mismo' });
      }

      const existing = await prisma.userFollow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
      });

      if (existing) {
        await prisma.userFollow.delete({ where: { followerId_followingId: { followerId, followingId } } });
        return res.json({ success: true, following: false });
      }

      await prisma.userFollow.create({ data: { followerId, followingId } });
      res.json({ success: true, following: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  // GET /api/social/users/:id/stats
  static async getUserStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const [posts, followers, following] = await Promise.all([
        prisma.socialPost.count({ where: { userId: id } }),
        prisma.userFollow.count({ where: { followingId: id } }),
        prisma.userFollow.count({ where: { followerId: id } }),
      ]);
      res.json({ success: true, data: { posts, followers, following } });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }
}
