#!/usr/bin/env python
"""
Run H-TECH backend server
Usage: python run_app.py
"""

import sys
import subprocess
import os

def main():
    """Run the backend server with uvicorn"""
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    host = os.getenv("HOST", "0.0.0.0")
    port = os.getenv("PORT", "8000")
    reload_enabled = os.getenv("RELOAD", "true").lower() in {"1", "true", "yes"}
    command = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host",
        host,
        "--port",
        port,
    ]
    if reload_enabled:
        command.append("--reload")
    
    try:
        # Run uvicorn server
        subprocess.run(command, check=True)
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"✗ Error running server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
