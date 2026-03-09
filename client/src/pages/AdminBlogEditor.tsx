import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useUpload } from "@/hooks/use-upload";
import type { BlogPost } from "@shared/schema";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Send, 
  Upload, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Heading2,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles
} from "lucide-react";

const BLOG_SECTIONS = [
  { id: "what-is", title: "What Is [Topic]?", placeholder: "Define the topic and provide context..." },
  { id: "why-happens", title: "Why [Topic] Happens", placeholder: "Explain the physiological or scientific reasons..." },
  { id: "what-miss", title: "What Most People Miss", placeholder: "Share overlooked insights or common misconceptions..." },
  { id: "how-affects", title: "How [Topic] Affects the Body Systemically", placeholder: "Describe the systemic impact using foundational wellness principles..." },
  { id: "what-helps", title: "What Actually Helps", placeholder: "Provide actionable recommendations..." },
  { id: "experts-think", title: "How Experts Think About This", placeholder: "Include expert perspectives and citations..." },
  { id: "faq", title: "Common Questions", placeholder: "Add 5-8 FAQs in Q/A format..." },
];

function MenuBar({ editor }: { editor: any }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-stone-200 bg-stone-50 rounded-t-md">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "bg-stone-200" : ""}
        data-testid="button-bold"
      >
        <Bold className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "bg-stone-200" : ""}
        data-testid="button-italic"
      >
        <Italic className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "bg-stone-200" : ""}
        data-testid="button-heading"
      >
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "bg-stone-200" : ""}
        data-testid="button-bullet-list"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "bg-stone-200" : ""}
        data-testid="button-ordered-list"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "bg-stone-200" : ""}
        data-testid="button-blockquote"
      >
        <Quote className="w-4 h-4" />
      </Button>
    </div>
  );
}

function ImageUploadButton({ onImageInsert }: { onImageInsert: (url: string) => void }) {
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      const imageUrl = response.objectPath;
      onImageInsert(imageUrl);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="absolute inset-0 opacity-0 cursor-pointer"
        disabled={isUploading}
        data-testid="input-image-upload"
      />
      <Button size="icon" variant="ghost" disabled={isUploading} data-testid="button-insert-image">
        <ImageIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function AdminBlogEditor() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isNew = !id || id === "new";

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

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "Sakred Health Editorial Team",
    tags: [] as string[],
    featuredImage: "",
    featuredImageAlt: "",
    status: "draft",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [] as string[],
    llmSummary: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["/api/admin/blog-posts", id],
    enabled: !isNew && !!id,
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.draftContent || post.content || "",
        author: post.author || "Sakred Health Editorial Team",
        tags: post.tags || [],
        featuredImage: post.featuredImage || "",
        featuredImageAlt: post.featuredImageAlt || "",
        status: post.status || "draft",
        seoTitle: post.seoTitle || "",
        seoDescription: post.seoDescription || "",
        seoKeywords: post.seoKeywords || [],
        llmSummary: post.llmSummary || "",
      });
    }
  }, [post]);

  const { uploadFile, isUploading: isUploadingImage } = useUpload({
    onSuccess: (response) => {
      insertImage(response.objectPath, true);
    },
  });

  const handleEditorDrop = useCallback((event: DragEvent) => {
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        event.preventDefault();
        uploadFile(file);
        return true;
      }
    }
    return false;
  }, [uploadFile]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your blog post... Drag and drop images anywhere!" }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      handleDrop: (view, event) => {
        return handleEditorDrop(event);
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
              const file = items[i].getAsFile();
              if (file) {
                event.preventDefault();
                uploadFile(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && formData.content && editor.getHTML() !== formData.content) {
      editor.commands.setContent(formData.content);
    }
  }, [editor, formData.content]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        draftContent: data.content,
        published: data.status === "published",
      };
      
      if (isNew) {
        const res = await apiRequest("POST", "/api/blog-posts", payload);
        return res.json();
      } else {
        const res = await apiRequest("PUT", `/api/blog-posts/${id}`, payload);
        return res.json();
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog-posts"] });
      toast({ title: "Saved", description: "Blog post saved successfully" });
      if (isNew && result?.id) {
        navigate(`/admin/blog/${result.id}`);
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save blog post", variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        content: formData.content,
        draftContent: formData.content,
        status: "published",
        published: true,
        publishedAt: new Date().toISOString(),
      };
      return apiRequest("PUT", `/api/blog-posts/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog-posts"] });
      toast({ title: "Published", description: "Blog post is now live" });
      setFormData((prev) => ({ ...prev, status: "published" }));
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to publish", variant: "destructive" });
    },
  });

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => {
      const currentSlugMatchesPrevTitle = prev.slug === generateSlug(prev.title);
      const shouldAutoUpdateSlug = !prev.slug || currentSlugMatchesPrevTitle || isNew;
      return {
        ...prev,
        title,
        slug: shouldAutoUpdateSlug ? generateSlug(title) : prev.slug,
      };
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seoKeywords.includes(keywordInput.trim())) {
      setFormData((prev) => ({ ...prev, seoKeywords: [...prev.seoKeywords, keywordInput.trim()] }));
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({ ...prev, seoKeywords: prev.seoKeywords.filter((k) => k !== keyword) }));
  };

  const insertImage = (url: string, promptForAlt = true) => {
    if (editor) {
      let alt = "";
      if (promptForAlt) {
        alt = window.prompt("Enter alt text for the image (for accessibility):", "") || "";
      }
      editor.chain().focus().setImage({ src: url, alt }).run();
    }
  };

  const handleOptimizeSEO = async () => {
    const wordCount = formData.content.split(/\s+/).length;
    const firstParagraph = formData.content.replace(/<[^>]*>/g, "").slice(0, 300);
    
    const autoSeoTitle = formData.title.slice(0, 60);
    const autoSeoDescription = formData.excerpt || firstParagraph.slice(0, 155);
    const autoKeywords = formData.tags.slice(0, 7);
    
    const autoLlmSummary = `${formData.title}. ${formData.excerpt}. Key topics include ${formData.tags.join(", ")}. This article covers foundational wellness approaches for ${formData.title.toLowerCase()}.`;
    
    setFormData((prev) => ({
      ...prev,
      seoTitle: prev.seoTitle || autoSeoTitle,
      seoDescription: prev.seoDescription || autoSeoDescription,
      seoKeywords: prev.seoKeywords.length > 0 ? prev.seoKeywords : autoKeywords,
      llmSummary: prev.llmSummary || autoLlmSummary,
    }));
    
    toast({ title: "SEO Optimized", description: "Auto-generated SEO metadata based on content" });
  };

  if (isLoading && !isNew) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/blog")} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-medium text-stone-900">
                {isNew ? "New Blog Post" : "Edit Blog Post"}
              </h1>
              <Badge variant={formData.status === "published" ? "default" : "secondary"} className="mt-1">
                {formData.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(`/blog/${formData.slug}`, "_blank")}
              disabled={!formData.slug}
              data-testid="button-preview"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant="outline"
              onClick={() => saveMutation.mutate(formData)}
              disabled={saveMutation.isPending}
              data-testid="button-save-draft"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            {!isNew && (
              <Button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending || formData.status === "published"}
                className="bg-[#C5A059] hover:bg-[#B8934E] text-white"
                data-testid="button-publish"
              >
                <Send className="w-4 h-4 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="Enter blog post title..."
                    className="text-xl"
                    data-testid="input-title"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                    data-testid="input-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief summary of the blog post..."
                    rows={3}
                    data-testid="input-excerpt"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Content</span>
                  <ImageUploadButton onImageInsert={insertImage} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-stone-200 rounded-md overflow-hidden relative">
                  <MenuBar editor={editor} />
                  <EditorContent
                    editor={editor}
                    className="prose prose-stone max-w-none p-4 min-h-[400px] focus:outline-none"
                    data-testid="editor-content"
                  />
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                      <div className="flex items-center gap-2 text-stone-600">
                        <Upload className="w-5 h-5 animate-pulse" />
                        <span>Uploading image...</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-2">Tip: Drag and drop images or paste from clipboard</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.featuredImage && (
                  <img
                    src={formData.featuredImage}
                    alt={formData.featuredImageAlt || "Featured"}
                    className="w-full aspect-video object-cover rounded-md"
                  />
                )}
                <Input
                  value={formData.featuredImage}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featuredImage: e.target.value }))}
                  placeholder="Image URL..."
                  data-testid="input-featured-image"
                />
                <Input
                  value={formData.featuredImageAlt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, featuredImageAlt: e.target.value }))}
                  placeholder="Alt text..."
                  data-testid="input-featured-image-alt"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    data-testid="input-tag"
                  />
                  <Button variant="outline" onClick={addTag} data-testid="button-add-tag">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} x
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>SEO Settings</span>
                  <Button variant="outline" size="sm" onClick={handleOptimizeSEO} data-testid="button-optimize-seo">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Auto-Generate
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="SEO optimized title..."
                    data-testid="input-seo-title"
                  />
                  <p className="text-xs text-stone-500 mt-1">{formData.seoTitle.length}/60 characters</p>
                </div>
                <div>
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="SEO meta description..."
                    rows={3}
                    data-testid="input-seo-description"
                  />
                  <p className="text-xs text-stone-500 mt-1">{formData.seoDescription.length}/160 characters</p>
                </div>
                <div>
                  <Label>SEO Keywords</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Add keyword..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                      data-testid="input-keyword"
                    />
                    <Button variant="outline" onClick={addKeyword} data-testid="button-add-keyword">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.seoKeywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => removeKeyword(keyword)}
                      >
                        {keyword} x
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="llmSummary">LLM Summary (for AI search)</Label>
                  <Textarea
                    id="llmSummary"
                    value={formData.llmSummary}
                    onChange={(e) => setFormData((prev) => ({ ...prev, llmSummary: e.target.value }))}
                    placeholder="Summary for AI systems and voice assistants..."
                    rows={4}
                    data-testid="input-llm-summary"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
