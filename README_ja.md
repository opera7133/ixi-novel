# ixi Novel

[English](README.md)

Astro製の小説サイトテンプレートです。
Markdownファイルで小説を管理し、タグ検索やテーマ切り替えなどの機能を提供します。

## 特徴

- **Markdown管理**: 小説本文はMarkdownで記述します。改行はそのまま反映されます。
- **検索・フィルタリング**: ID順の並び替え、タグによる絞り込みが可能です。
- **閲覧設定**: 読者は背景色（白・灰・黄・黒）とフォント（ゴシック・明朝）を切り替えられます。
- **あらすじ表示**: Frontmatterまたは本文内の「# あらすじ」セクションを自動的に折りたたみ表示にします。
- **Dropbox同期**: Dropbox上のMarkdownファイルを自動的に取り込むスクリプトが含まれています。

## セットアップ

```bash
bun install
```

## 開発サーバーの起動

```bash
bun run dev
```

## 言語切替

デフォルトは英語表示です。日本語で公開する場合は、`.env`の`LOCALE`を`ja`にしてください。

`.env`:
```
LOCALE=ja
```

## 小説の追加方法

`src/content/novels/` ディレクトリにMarkdownファイル（`.md`）を追加します。

> [!NOTE]
> デフォルトでは`.gitignore`により`src/content/novels`内のMarkdownファイルはGitに管理されません。
> Dropbox同期を使用しない場合は、`.gitignore`から該当行を削除することをおすすめします。

### ファイルフォーマット

ファイルの先頭にFrontmatterを記述してください。

```markdown
---
id: 1
title: 小説のタイトル
tags: ["ファンタジー", "短編"]
r18: false
---

# あらすじ

ここにあらすじを記載します。

# 本文

ここから本文が始まります...
```

- `id`: 一意のID（数値または文字列）。一覧の並び替えに使用されます。
- `title`: 小説のタイトル。
- `tags`: タグの配列（任意）。

> [!NOTE]
> 本文中に `# あらすじ` または `# 概要` という見出しがある場合、自動的に折りたたみ表示に変換されます。

## Dropbox同期の設定

DropboxにあるMarkdownファイルを同期して取り込むことができます。

1. `.env` ファイルを作成し、DropboxのApp IDとApp Secretを設定します。

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

2. Refresh Tokenを取得します。

```bash
bun run get-token
```

3. 同期スクリプトを実行します。

```bash
bun run sync
```

## ライセンス

MIT License
