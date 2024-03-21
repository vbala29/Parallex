import aio_pika
import asyncio
import json
from pathlib import Path

base_path = Path(__file__).parent
file_path = (base_path / '../config/config.json').resolve()
config = json.load(open(file_path))

_DEFAULT_USER = config["rabbitmq"]["username"]
_DEFAULT_PASS = config["rabbitmq"]["password"]

class AQMPConnection:
    def __init__(self, host):
        self.connection = None
        self.channel = None
        self.queues = {}
        self.loop = asyncio.new_event_loop()
        self.host = host

    async def setupAQMP(self):
        print(f'host: {self.host}')
        self.connection = await aio_pika.connect_robust(f"amqp://{_DEFAULT_USER}:{_DEFAULT_PASS}@{self.host}/")
        self.channel = await self.connection.channel()

    async def initializeQueue(self, queueName):
        self.queues[queueName] = await self.channel.declare_queue(queueName)

    async def cleanUpConnection(self):
        await self.connection.close()