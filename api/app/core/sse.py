import queue
import json

# Cola de mensajes (Thread-safe)
msg_queue = queue.Queue()

def announce(status, message, progress=None):
    """
    Envía un evento al Frontend.
    status: 'downloading', 'installing', 'running', 'log', 'error'
    """
    data = {
        "status": status,
        "message": message,
        "progress": progress
    }
    msg_queue.put(data)

def event_stream():
    """Generador infinito para Flask"""
    while True:
        # Bloquea hasta que haya un mensaje nuevo
        message = msg_queue.get()
        yield f"data: {json.dumps(message)}\n\n"