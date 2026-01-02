# ixi Novel

[日本語](README_ja.md)

A novel site template built with Astro.
It manages novels using Markdown files and provides features like tag search and theme switching.

## Features

- **Markdown Management**: Write novel content in Markdown. Line breaks are preserved.
- **Search & Filtering**: Sort by ID and filter by tags.
- **Viewing Settings**: Readers can switch background colors (White, Gray, Yellow, Black) and fonts (Gothic, Mincho).
- **Synopsis Display**: Automatically collapses the section starting with `# あらすじ` (Synopsis) in the body text.
- **Dropbox Sync**: Includes a script to automatically fetch Markdown files from Dropbox.

## Setup

```bash
bun install
```

## Start Development Server

```bash
bun run dev
```

## How to Add Novels

Add Markdown files (`.md`) to the `src/content/novels/` directory.

> [!NOTE]
> By default, Markdown files in `src/content/novels` are ignored by Git via `.gitignore`.
> If you do not use Dropbox sync, it is recommended to remove the corresponding line from `.gitignore`.

### File Format

Please write Frontmatter at the beginning of the file.

```markdown
---
id: 1
title: Novel Title
tags: ["Fantasy", "Short Story"]
r18: false
---

# Synopsis

Write the synopsis here.

# Body

The story begins here...
```

- `id`: Unique ID (number or string). Used for sorting the list.
- `title`: Title of the novel.
- `tags`: Array of tags (optional).

> [!NOTE]
> If there is a heading `#Synopsis` or `# Summary` in the body text, it will be automatically converted to a collapsible display.

## Dropbox Sync Settings

You can sync and import Markdown files from Dropbox.

1. Create a `.env` file and set your Dropbox App ID and App Secret.

```bash
cp .env.example .env
```

`.env`:
```
DROPBOX_CLIENT_ID=your_dropbox_client_id
DROPBOX_CLIENT_SECRET=your_dropbox_client_secret
DROPBOX_REDIRECT_URI=http://localhost:8080/callback
DROPBOX_FOLDER_PATH=/novels
```

2. Get Refresh Token.

```bash
bun run get-token
```

3. Run the sync script.

```bash
bun run sync
```

## License

MIT License
