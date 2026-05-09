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
    
    try:
        # Run uvicorn server
        subprocess.run(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "app.main:app",
                "--reload",
                "--host",
                "0.0.0.0",
                "--port",
                "8000",
            ],
            check=True,
        )
    except KeyboardInterrupt:
        print("\n✓ Server stopped")
        sys.exit(0)
    except subprocess.CalledProcessError as e:
        print(f"✗ Error running server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
