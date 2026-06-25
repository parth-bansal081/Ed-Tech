import os

def load_env():
    # Find .env in root directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Go up from processing/services to root
    env_path = os.path.abspath(os.path.join(current_dir, "..", "..", ".env"))
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip()
                    # Strip surrounding quotes if present
                    if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                        val = val[1:-1]
                    # Set it in os.environ if not already present
                    if key not in os.environ:
                        if key == "REDIS_URL" and os.name == "nt":
                            val = val.replace("://redis:", "://127.0.0.1:")
                        os.environ[key] = val
                    else:
                        # Keep existing values but print for debugging
                        pass
    else:
        print(f"[env_loader] Warning: .env not found at {env_path}")

# Run immediately upon import
load_env()
