# minigame-tcool（日本語版）

短い入力だけでミニゲームを生成し、ブラウザで遊べる Web アプリです。  
生成したゲームコードは ZIP でダウンロードできます。

## 主な機能

- OpenAI API（またはモック）でミニゲームを生成
- 生成結果をその場でプレビュー
- `index.html / style.css / game.js / README.txt` を ZIP 出力
- 生成ゲームに `#KGNINJA` 投稿ボタンを自動付与
- `GITHUB_REPO_URL` を設定すると投稿文にリポジトリ URL を付与

## 技術構成

- フロントエンド: React + TypeScript + Vite (`client/`)
- バックエンド: Node.js + Express + TypeScript (`server/`)
- 共通型: `shared/`

## セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. 環境変数を設定

```bash
cp .env.example .env
```

主な環境変数:

- `OPENAI_API_KEY`: 本番生成に必要
- `OPENAI_MODEL`: 使用モデル（例: `gpt-4.1-mini`）
- `MOCK_MODE`: `1` で API キーなしのモック生成
- `GITHUB_REPO_URL`: 投稿文に含める GitHub URL
- `PORT`: API サーバーポート（既定: `8787`）

3. 開発サーバー起動

```bash
npm run dev
```

- 画面: `http://localhost:5173`
- API: `http://localhost:8787`

## API キーなしで動作確認（推奨）

```bash
MOCK_MODE=1 npm run dev
```

このモードでは `POST /api/generate` が固定サンプルゲームを返します。

## ビルドと実行

```bash
npm run build
npm run start
```

## API

### `POST /api/generate`

入力例:

```json
{
  "genre": "action",
  "difficulty": "easy",
  "theme": "Neon city rooftops",
  "goal": "Collect 20 stars while avoiding hazards"
}
```

### `POST /api/export-zip`

`title`, `description`, `bundle(html/css/js)` を受け取り、ZIP を返します。

## 注意事項

- 生成コードは外部依存を避ける制約で検証しています。
- `#KGNINJA` 投稿ボタンはサーバー側で自動注入されます。
- 投稿文に GitHub URL を含めたい場合は `.env` の `GITHUB_REPO_URL` を設定してください。
