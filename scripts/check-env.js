#!/usr/bin/env node

// 環境変数設定確認ツール
require('dotenv').config({ path: '.env.local' });

console.log('🔧 Central Agent - 環境変数設定確認\n');

// 必須設定の確認
const requiredVars = {
  'ANTHROPIC_API_KEY': process.env.ANTHROPIC_API_KEY
};

// オプション設定の確認
const optionalVars = {
  'TAVILY_API_KEY': process.env.TAVILY_API_KEY,
  'GOOGLE_SEARCH_API_KEY': process.env.GOOGLE_SEARCH_API_KEY,
  'GOOGLE_SEARCH_ENGINE_ID': process.env.GOOGLE_SEARCH_ENGINE_ID
};

console.log('📋 必須設定:');
let hasRequired = true;
for (const [key, value] of Object.entries(requiredVars)) {
  const status = value ? '✅ 設定済み' : '❌ 未設定';
  const preview = value ? `(${value.substring(0, 10)}...)` : '';
  console.log(`  ${key}: ${status} ${preview}`);
  if (!value) hasRequired = false;
}

console.log('\n📋 オプション設定:');
let hasOptional = false;
for (const [key, value] of Object.entries(optionalVars)) {
  const status = value ? '✅ 設定済み' : '⚠️  未設定';
  const preview = value ? `(${value.substring(0, 10)}...)` : '';
  console.log(`  ${key}: ${status} ${preview}`);
  if (value) hasOptional = true;
}

console.log('\n🔍 総合判定:');
if (hasRequired && hasOptional) {
  console.log('✅ 完全設定 - 全機能が利用可能です');
} else if (hasRequired) {
  console.log('⚠️  基本設定 - Claude分析は動作しますが、Web検索はデモデータになります');
} else {
  console.log('❌ 設定不足 - APIキーを設定してください');
}

console.log('\n📖 設定方法:');
console.log('1. プロジェクトルートに .env.local ファイルを作成');
console.log('2. 以下の形式でAPIキーを設定:');
console.log('   ANTHROPIC_API_KEY=sk-ant-api03-...');
console.log('   TAVILY_API_KEY=tvly-...');
console.log('3. 開発サーバーを再起動: pnpm dev');
console.log('\n詳細: env-setup.md を参照してください');

// .env.local ファイルの存在確認
const fs = require('fs');
const path = require('path');
const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  .env.local ファイルが見つかりません');
  console.log('   以下のコマンドで作成してください:');
  console.log('   touch .env.local');
} 