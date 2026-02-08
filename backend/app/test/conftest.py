import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # backend/app
sys.path.insert(0, str(ROOT))
