import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ArrowLeft, Eye } from "lucide-react";
import { Link } from "wouter";
import type { BlogPost, InsertBlogPost } from "@shared/schema";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  featuredImage: string;
  featuredImageAlt: string;
  tags: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  ogImage: string;
  llmSummary: string;
}

const emptyFormData: BlogFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "",
  featuredImage: "",
  featuredImageAlt: "",
  tags: "",
  published: true,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  canonicalUrl: "",
  ogImage: "",
  llmSummary: "",
};

function BlogPostForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialData: BlogFormData;
  onSubmit: (data: InsertBlogPost) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<BlogFormData>(initialData);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug === "" || prev.slug === generateSlug(prev.title) ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    const seoKeywordsArray = formData.seoKeywords
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    
    onSubmit({
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: formData.content,
      author: formData.author,
      featuredImage: formData.featuredImage || null,
      featuredImageAlt: formData.featuredImageAlt || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      published: formData.published,
      seoTitle: formData.seoTitle || null,
      seoDescription: formData.seoDescription || null,
      seoKeywords: seoKeywordsArray.length > 0 ? seoKeywordsArray : null,
      canonicalUrl: formData.canonicalUrl || null,
      ogImage: formData.ogImage || null,
      llmSummary: formData.llmSummary || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          data-testid="input-title"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Enter blog post title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL Slug</Label>
        <Input
          id="slug"
          data-testid="input-slug"
          value={formData.slug}
          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
          placeholder="url-friendly-slug"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author</Label>
        <Input
          id="author"
          data-testid="input-author"
          value={formData.author}
          onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
          placeholder="Author name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          data-testid="input-excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
          placeholder="Brief description of the post"
          rows={2}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content (Markdown)</Label>
        <Textarea
          id="content"
          data-testid="input-content"
          value={formData.content}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          placeholder="Write your blog post content in Markdown..."
          rows={10}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="featuredImage">Featured Image URL (optional)</Label>
        <Input
          id="featuredImage"
          data-testid="input-featured-image"
          value={formData.featuredImage}
          onChange={(e) => setFormData((prev) => ({ ...prev, featuredImage: e.target.value }))}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          data-testid="input-tags"
          value={formData.tags}
          onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
          placeholder="wellness, meditation, health"
        />
      </div>

      <div className="border-t pt-4 mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">SEO Settings</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle">SEO Title</Label>
            <Input
              id="seoTitle"
              data-testid="input-seo-title"
              value={formData.seoTitle}
              onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
              placeholder="Optimized title for search engines (50-60 chars)"
              maxLength={70}
            />
            <p className="text-xs text-muted-foreground">{formData.seoTitle.length}/60 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoDescription">SEO Meta Description</Label>
            <Textarea
              id="seoDescription"
              data-testid="input-seo-description"
              value={formData.seoDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
              placeholder="Brief description for search results (150-160 chars)"
              rows={2}
              maxLength={170}
            />
            <p className="text-xs text-muted-foreground">{formData.seoDescription.length}/160 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seoKeywords">SEO Keywords (comma-separated)</Label>
            <Input
              id="seoKeywords"
              data-testid="input-seo-keywords"
              value={formData.seoKeywords}
              onChange={(e) => setFormData((prev) => ({ ...prev, seoKeywords: e.target.value }))}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="featuredImageAlt">Featured Image Alt Text</Label>
            <Input
              id="featuredImageAlt"
              data-testid="input-featured-image-alt"
              value={formData.featuredImageAlt}
              onChange={(e) => setFormData((prev) => ({ ...prev, featuredImageAlt: e.target.value }))}
              placeholder="Descriptive alt text for the featured image"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ogImage">Open Graph Image URL</Label>
            <Input
              id="ogImage"
              data-testid="input-og-image"
              value={formData.ogImage}
              onChange={(e) => setFormData((prev) => ({ ...prev, ogImage: e.target.value }))}
              placeholder="https://example.com/og-image.jpg (1200x630 recommended)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonicalUrl">Canonical URL (optional)</Label>
            <Input
              id="canonicalUrl"
              data-testid="input-canonical-url"
              value={formData.canonicalUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, canonicalUrl: e.target.value }))}
              placeholder="https://example.com/original-article"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="llmSummary">AI/LLM Summary</Label>
            <Textarea
              id="llmSummary"
              data-testid="input-llm-summary"
              value={formData.llmSummary}
              onChange={(e) => setFormData((prev) => ({ ...prev, llmSummary: e.target.value }))}
              placeholder="Concise summary for AI search engines and LLMs"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">This summary helps AI assistants understand and cite your content</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="published"
          data-testid="switch-published"
          checked={formData.published}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, published: checked }))}
        />
        <Label htmlFor="published">Published</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} data-testid="button-submit">
          {isSubmitting ? "Saving..." : "Save Post"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminBlog() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog-posts"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      const response = await apiRequest("POST", "/api/blog-posts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Blog post created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create post", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBlogPost> }) => {
      const response = await apiRequest("PUT", `/api/blog-posts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      setEditingPost(null);
      toast({ title: "Blog post updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update post", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/blog-posts/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({ title: "Blog post deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete post", description: error.message, variant: "destructive" });
    },
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Not published";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Blog Post Management</h1>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-post">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
              </DialogHeader>
              <BlogPostForm
                initialData={emptyFormData}
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setIsCreateDialogOpen(false)}
                isSubmitting={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No blog posts yet. Create your first post to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {posts?.map((post) => (
              <Card key={post.id} data-testid={`card-post-${post.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-lg truncate">{post.title}</h3>
                        <Badge variant={post.published ? "default" : "secondary"}>
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>By {post.author}</span>
                        <span>{formatDate(post.publishedAt)}</span>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="ghost" size="icon" data-testid={`button-view-${post.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Dialog
                        open={editingPost?.id === post.id}
                        onOpenChange={(open) => !open && setEditingPost(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPost(post)}
                            data-testid={`button-edit-${post.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Blog Post</DialogTitle>
                          </DialogHeader>
                          {editingPost && (
                            <BlogPostForm
                              initialData={{
                                title: editingPost.title,
                                slug: editingPost.slug,
                                excerpt: editingPost.excerpt,
                                content: editingPost.content,
                                author: editingPost.author,
                                featuredImage: editingPost.featuredImage || "",
                                featuredImageAlt: editingPost.featuredImageAlt || "",
                                tags: editingPost.tags?.join(", ") || "",
                                published: editingPost.published ?? true,
                                seoTitle: editingPost.seoTitle || "",
                                seoDescription: editingPost.seoDescription || "",
                                seoKeywords: editingPost.seoKeywords?.join(", ") || "",
                                canonicalUrl: editingPost.canonicalUrl || "",
                                ogImage: editingPost.ogImage || "",
                                llmSummary: editingPost.llmSummary || "",
                              }}
                              onSubmit={(data) => updateMutation.mutate({ id: editingPost.id, data })}
                              onCancel={() => setEditingPost(null)}
                              isSubmitting={updateMutation.isPending}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            data-testid={`button-delete-${post.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{post.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(post.id)}
                              className="bg-destructive text-destructive-foreground"
                              data-testid="button-confirm-delete"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
