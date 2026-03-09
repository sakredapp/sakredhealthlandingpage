import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BlogPost } from "@shared/schema";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  FileText,
  ArrowLeft,
  Upload,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
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

export default function AdminBlogList() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let robotsTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!robotsTag) {
      robotsTag = document.createElement("meta");
      robotsTag.name = "robots";
      document.head.appendChild(robotsTag);
    }
    const originalContent = robotsTag.content;
    robotsTag.content = "noindex, nofollow";
    
    return () => {
      if (originalContent) {
        robotsTag.content = originalContent;
      } else {
        robotsTag.remove();
      }
    };
  }, []);

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/admin/blog-posts"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/blog-posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({ title: "Deleted", description: "Blog post deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete blog post", variant: "destructive" });
    },
  });

  const bulkSeoMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/blog-posts/generate-all-seo");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({ title: "SEO Generated", description: data.message || "SEO updated for all posts" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate SEO", variant: "destructive" });
    },
  });

  const filteredPosts = posts?.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const draftPosts = filteredPosts?.filter((post) => post.status === "draft" || !post.published);
  const publishedPosts = filteredPosts?.filter((post) => post.status === "published" && post.published);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} data-testid="button-back-home">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-stone-900">Blog Content Manager</h1>
              <p className="text-sm text-stone-500">Create, edit, and publish blog posts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => bulkSeoMutation.mutate()}
              disabled={bulkSeoMutation.isPending}
              data-testid="button-bulk-seo"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {bulkSeoMutation.isPending ? "Generating..." : "Generate All SEO"}
            </Button>
            <Button
              onClick={() => navigate("/admin/blog/new")}
              className="bg-[#C5A059] hover:bg-[#B8934E] text-white"
              data-testid="button-new-post"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by title or tag..."
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-stone-500">Loading posts...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {draftPosts && draftPosts.length > 0 && (
              <section>
                <h2 className="text-lg font-medium text-stone-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Drafts ({draftPosts.length})
                </h2>
                <div className="grid gap-4">
                  {draftPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onEdit={() => navigate(`/admin/blog/${post.id}`)}
                      onDelete={() => deleteMutation.mutate(post.id)}
                      onPreview={() => window.open(`/blog/${post.slug}`, "_blank")}
                    />
                  ))}
                </div>
              </section>
            )}

            {publishedPosts && publishedPosts.length > 0 && (
              <section>
                <h2 className="text-lg font-medium text-stone-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-500" />
                  Published ({publishedPosts.length})
                </h2>
                <div className="grid gap-4">
                  {publishedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onEdit={() => navigate(`/admin/blog/${post.id}`)}
                      onDelete={() => deleteMutation.mutate(post.id)}
                      onPreview={() => window.open(`/blog/${post.slug}`, "_blank")}
                    />
                  ))}
                </div>
              </section>
            )}

            {(!filteredPosts || filteredPosts.length === 0) && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-700 mb-2">No blog posts yet</h3>
                <p className="text-stone-500 mb-6">Create your first blog post to get started</p>
                <Button
                  onClick={() => navigate("/admin/blog/new")}
                  className="bg-[#C5A059] hover:bg-[#B8934E] text-white"
                  data-testid="button-create-first"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function PostCard({
  post,
  onEdit,
  onDelete,
  onPreview,
}: {
  post: BlogPost;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-stone-900 truncate">{post.title}</h3>
              <Badge
                variant={post.published ? "default" : "secondary"}
                className={post.published ? "bg-green-100 text-green-700" : ""}
              >
                {post.published ? "Published" : "Draft"}
              </Badge>
            </div>
            <p className="text-sm text-stone-500 line-clamp-2 mb-2">{post.excerpt}</p>
            <div className="flex flex-wrap gap-2">
              {post.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {(post.tags?.length || 0) > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{(post.tags?.length || 0) - 3} more
                </Badge>
              )}
            </div>
            {post.publishedAt && (
              <p className="text-xs text-stone-400 mt-2">
                Published: {new Date(post.publishedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onPreview} data-testid={`button-preview-${post.id}`}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit} data-testid={`button-edit-${post.id}`}>
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" data-testid={`button-delete-${post.id}`}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{post.title}". This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
