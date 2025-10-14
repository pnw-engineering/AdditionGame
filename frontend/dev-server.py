#!/usr/bin/env python3
"""
Simple development server for frontend files with no-cache headers
"""

import http.server
import os
import socketserver

# Change to the directory where this script is located (frontend directory)
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


PORT = 8001

print(f"🚀 Starting development server on http://localhost:{PORT}")
print(f"📁 Serving from: {script_dir}")
print("✨ All files served with no-cache headers")
print("Press Ctrl+C to stop\n")

with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n✅ Server stopped")
