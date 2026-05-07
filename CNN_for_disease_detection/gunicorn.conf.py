import os

# 1 worker: CNN model is ~400MB RAM — multiple workers would OOM on Render
workers      = 1
worker_class = "sync"

# 5 min timeout covers: TF import (~30s) + model load (~30s) + inference (~10s)
# on a cold Render Standard instance
timeout          = 300
graceful_timeout = 60
keepalive        = 5

bind = f"0.0.0.0:{os.environ.get('PORT', '5000')}"

accesslog = "-"
errorlog  = "-"
loglevel  = "info"

# preload_app=False: with 1 worker this is fine and avoids the master-process
# OOM bug where TF loads in the master before any worker can bind the port.
preload_app = False
