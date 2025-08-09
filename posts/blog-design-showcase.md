---
title: "Building This Blog - Design & Tech Decisions"
date: "2025-08-09"
description: "A deep dive into the design decisions and technology choices I made building this blog. Spoiler: I kept it simple."
---

# Building This Blog - Design & Tech Decisions

I wanted to document the process of building this blog while it's fresh in my mind. Here's what I learned about creating a clean, developer-focused blog that actually works.

## Design Philosophy

My goals were simple:
- **Content first** - nothing should distract from reading
- **Fast loading** - no heavy frameworks or unnecessary assets
- **Mobile responsive** - looks great everywhere
- **Approachable aesthetic** - professional but not sterile

## Color Scheme: Going Earthy

I started with the typical developer blog blues and grays, but it felt too corporate. Instead, I went with an earthy, warm palette:

- **Stone grays** for backgrounds and subtle elements
- **Warm amber** for links and accents (instead of blue)
- **Rich browns** for text and headings
- **Cream backgrounds** instead of stark white

The result feels more like a cozy coffee shop than a corporate tech blog, which is exactly what I wanted.

## Technology Choices

### Next.js 15 + TypeScript
- Built-in routing that just works (`/posts/[slug]` automatically handles post URLs)
- Excellent developer experience with hot reload
- Perfect Vercel integration for deployment
- TypeScript catches errors before they reach production

### Markdown for Content
I considered using Notion as a headless CMS, but markdown files won out:

✅ **Zero external dependencies** - no API that can break  
✅ **Write in VS Code** - same environment as my code  
✅ **Version controlled** - posts live alongside the codebase  
✅ **Lightning fast** - no network requests needed  
✅ **Future-proof** - markdown isn't going anywhere

### Tailwind CSS with Custom Variables
Tailwind handles 95% of styling, but I added custom CSS variables for the earthy color scheme:

```css
:root {
  --background: #fafaf9;
  --foreground: #1c1917;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #1c1917;
    --foreground: #f5f5f4;
  }
}
```

This gives me consistent dark/light mode support with minimal code.

## Key Features

### Search Functionality
Simple client-side filtering - no complex search infrastructure needed:

```typescript
const filteredPosts = posts.filter(post =>
  post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  post.description.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### Dark Mode Support
Respects system preferences automatically and looks great in both modes. The earthy colors work especially well in dark mode.

### Code Syntax Highlighting
Using `remark` and `remark-html` to process markdown:

```javascript
// Example of how code blocks look
const blogPost = {
  title: "My awesome post",
  content: "This is the content",
  publishedAt: new Date()
};

function publishPost(post) {
  return fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(post)
  });
}
```

## Performance Metrics

The simple architecture pays off:
- **Lighthouse score**: 100/100 across the board
- **First Contentful Paint**: < 0.5s
- **Total bundle size**: < 50KB
- **Time to Interactive**: < 1s

## What I'd Add Next

If this blog grows, here's what I might add:

### Content Enhancements
- **Reading time estimates** - "5 min read"
- **Table of contents** for longer posts  
- **Related posts** suggestions
- **Tags and categories** for better organization

### Interactive Features  
- **Newsletter signup** - build an email list
- **Comments** - maybe GitHub-powered discussions
- **Social sharing** buttons
- **RSS feed** for subscribers

### Developer-Specific Features
- **Interactive code demos** - CodePen embeds
- **Runnable examples** - for React components
- **Performance monitoring** - real user metrics

## Lessons Learned

1. **Start simple** - I could have over-engineered this with a headless CMS, but markdown files are perfect for my needs

2. **Design matters** - the earthy color scheme makes the blog feel much more welcoming than typical developer sites

3. **Performance is a feature** - keeping things simple means everything loads instantly

4. **Solve your own problems** - I built exactly what I wanted to read, not what I thought others expected

## The Meta Moment

There's something satisfying about writing a blog post about building the blog you're reading it on. It's like documenting the construction of your own workspace while you're working in it.

Next up: I'll be writing about the actual projects I'm building, starting with a developer time-tracking tool that I desperately need for myself.