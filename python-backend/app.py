#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PowerPoint生成 Flask APIサーバー
Next.js フロントエンドからのリクエストを受けてPowerPointファイルを生成
"""

import os
import json
import traceback
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pptx_generator import PowerPointGenerator
import tempfile
import shutil

# Flask アプリケーション初期化
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # Next.js フロントエンドからのアクセスを許可

# 設定
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
TEMPLATE_PATH = "../public/Central_Analysis.pptx"

# グローバル変数
generated_files = {}  # 生成されたファイルの一時保存

@app.route('/health', methods=['GET'])
def health_check():
    """
    ヘルスチェックエンドポイント
    サーバーの動作状況とテンプレートファイルの存在確認
    """
    try:
        template_exists = os.path.exists(TEMPLATE_PATH)
        return jsonify({
            "status": "healthy",
            "message": "PowerPoint生成APIサーバーが正常に動作しています",
            "template_available": template_exists,
            "template_path": TEMPLATE_PATH
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"ヘルスチェックエラー: {str(e)}"
        }), 500

@app.route('/generate-powerpoint', methods=['POST'])
def generate_powerpoint():
    """
    PowerPoint生成エンドポイント
    
    Expected JSON payload:
    {
        "company_name": "企業名",
        "analysis_data": {
            "slide1": {"企業名": "..."},
            "slide3": {"企業概要": "...", "競合比較": "...", "重要課題": "..."},
            "slide4": {...},
            "slide5": {...},
            "slide6": {...},
            "slide7": {...}
        }
    }
    
    Returns:
        JSON with file_id for download
    """
    try:
        print("🎯 PowerPoint生成リクエスト受信")
        
        # リクエストデータの検証
        if not request.is_json:
            return jsonify({
                "error": "Content-Type must be application/json"
            }), 400
        
        data = request.get_json()
        if not data:
            return jsonify({
                "error": "JSON データが空です"
            }), 400
        
        # 必須フィールドの確認
        company_name = data.get('company_name')
        analysis_data = data.get('analysis_data')
        
        if not company_name:
            return jsonify({
                "error": "company_name が必要です"
            }), 400
        
        if not analysis_data:
            return jsonify({
                "error": "analysis_data が必要です"
            }), 400
        
        print(f"📊 企業名: {company_name}")
        print(f"📋 分析データ: {len(analysis_data)} スライド")
        
        # デバッグ: 受信したデータを詳細にログ出力
        print(f"🔍 === 受信データ詳細分析 ===")
        print(f"📋 analysis_data type: {type(analysis_data)}")
        print(f"📋 analysis_data keys: {list(analysis_data.keys()) if isinstance(analysis_data, dict) else 'Not a dict'}")
        
        if isinstance(analysis_data, dict):
            for key, value in analysis_data.items():
                if isinstance(value, dict):
                    print(f"  {key}: {list(value.keys())}")
                    for sub_key, sub_value in value.items():
                        print(f"    {sub_key}: {str(sub_value)[:150]}{'...' if len(str(sub_value)) > 150 else ''}")
                else:
                    print(f"  {key}: {type(value)} - {str(value)[:150]}{'...' if len(str(value)) > 150 else ''}")
        else:
            print(f"📋 analysis_data content: {str(analysis_data)[:300]}{'...' if len(str(analysis_data)) > 300 else ''}")
        print(f"🔍 === デバッグ終了 ===\n")
        
        # PowerPoint生成
        generator = PowerPointGenerator(TEMPLATE_PATH)
        
        try:
            output_path = generator.generate_presentation(analysis_data, company_name)
            
            # ファイルIDを生成（一時的な識別子）
            import uuid
            file_id = str(uuid.uuid4())
            
            # 生成されたファイルを記録
            generated_files[file_id] = {
                "path": output_path,
                "company_name": company_name,
                "generator": generator  # クリーンアップ用
            }
            
            print(f"✅ PowerPoint生成完了: {file_id}")
            
            return jsonify({
                "success": True,
                "message": "PowerPointファイルが正常に生成されました",
                "file_id": file_id,
                "company_name": company_name,
                "download_url": f"/download/{file_id}"
            }), 200
            
        except Exception as e:
            generator.cleanup()
            raise e
        
    except Exception as e:
        print(f"❌ PowerPoint生成エラー: {str(e)}")
        print(f"📝 エラートレース: {traceback.format_exc()}")
        
        return jsonify({
            "error": f"PowerPoint生成に失敗しました: {str(e)}",
            "traceback": traceback.format_exc() if app.debug else None
        }), 500

@app.route('/download/<file_id>', methods=['GET'])
def download_file(file_id):
    """
    生成されたPowerPointファイルのダウンロード
    
    Args:
        file_id (str): generate_powerpointで返されたファイルID
    """
    try:
        # ファイルIDの確認
        if file_id not in generated_files:
            return jsonify({
                "error": "ファイルが見つかりません。ファイルIDを確認してください。"
            }), 404
        
        file_info = generated_files[file_id]
        file_path = file_info["path"]
        company_name = file_info["company_name"]
        
        # ファイル存在確認
        if not os.path.exists(file_path):
            return jsonify({
                "error": "ファイルが見つかりません。"
            }), 404
        
        print(f"📥 ファイルダウンロード開始: {company_name}")
        
        # ダウンロード用のファイル名を作成
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        download_filename = f"企業分析_{company_name}_{timestamp}.pptx"
        
        # ファイルを送信
        response = send_file(
            file_path,
            as_attachment=True,
            download_name=download_filename,
            mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )
        
        print(f"✅ ダウンロード完了: {download_filename}")
        return response
        
    except Exception as e:
        print(f"❌ ダウンロードエラー: {str(e)}")
        return jsonify({
            "error": f"ダウンロードに失敗しました: {str(e)}"
        }), 500

@app.route('/cleanup/<file_id>', methods=['DELETE'])
def cleanup_file(file_id):
    """
    生成されたファイルのクリーンアップ
    
    Args:
        file_id (str): クリーンアップ対象のファイルID
    """
    try:
        if file_id not in generated_files:
            return jsonify({
                "error": "ファイルが見つかりません"
            }), 404
        
        file_info = generated_files[file_id]
        generator = file_info["generator"]
        
        # ファイルとディレクトリをクリーンアップ
        generator.cleanup()
        
        # メモリからも削除
        del generated_files[file_id]
        
        print(f"🧹 ファイルクリーンアップ完了: {file_id}")
        
        return jsonify({
            "success": True,
            "message": "ファイルが正常にクリーンアップされました"
        }), 200
        
    except Exception as e:
        print(f"❌ クリーンアップエラー: {str(e)}")
        return jsonify({
            "error": f"クリーンアップに失敗しました: {str(e)}"
        }), 500

@app.route('/list-files', methods=['GET'])
def list_generated_files():
    """
    生成されたファイル一覧を取得（デバッグ用）
    """
    try:
        files_info = []
        for file_id, info in generated_files.items():
            files_info.append({
                "file_id": file_id,
                "company_name": info["company_name"],
                "file_exists": os.path.exists(info["path"])
            })
        
        return jsonify({
            "generated_files": files_info,
            "total_count": len(files_info)
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": f"ファイル一覧取得エラー: {str(e)}"
        }), 500

@app.errorhandler(413)
def too_large(e):
    """ファイルサイズ制限エラー"""
    return jsonify({
        "error": "ファイルサイズが大きすぎます（最大50MB）"
    }), 413

@app.errorhandler(404)
def not_found(e):
    """404エラー"""
    return jsonify({
        "error": "エンドポイントが見つかりません"
    }), 404

@app.errorhandler(500)
def internal_error(e):
    """500エラー"""
    return jsonify({
        "error": "内部サーバーエラーが発生しました"
    }), 500

def cleanup_all_files():
    """アプリケーション終了時の全ファイルクリーンアップ"""
    print("🧹 アプリケーション終了：全ファイルクリーンアップ中...")
    for file_id, info in generated_files.items():
        try:
            generator = info["generator"]
            generator.cleanup()
        except Exception as e:
            print(f"⚠️ クリーンアップエラー {file_id}: {str(e)}")
    generated_files.clear()
    print("✅ 全ファイルクリーンアップ完了")

# アプリケーション終了時のクリーンアップ設定
import atexit
atexit.register(cleanup_all_files)

if __name__ == '__main__':
    print("🚀 PowerPoint生成APIサーバー起動中...")
    print(f"📄 テンプレートファイル: {TEMPLATE_PATH}")
    print(f"🌐 CORS許可オリジン: http://localhost:3000")
    print("📡 利用可能エンドポイント:")
    print("  GET  /health - ヘルスチェック")
    print("  POST /generate-powerpoint - PowerPoint生成")
    print("  GET  /download/<file_id> - ファイルダウンロード")
    print("  DELETE /cleanup/<file_id> - ファイルクリーンアップ")
    print("  GET  /list-files - 生成ファイル一覧")
    
    # デバッグモードで起動（本番では False に変更）
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    ) 