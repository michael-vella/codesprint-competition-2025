import datetime

class MockWhatsAppServer:
    def __init__(self):
        self.username = None
        self.password = None

    def init(self, username, password):
        self.username = username
        self.password = password

    def send_message(self, message):
        timestamp = datetime.datetime.now().isoformat()
        with open("data/whatsapp_messages.txt", "a") as f:
            f.write(f"[{timestamp}] {message}\n")
        return f"Message sent: {message}"