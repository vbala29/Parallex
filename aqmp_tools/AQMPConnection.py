import aio_pika
import asyncio

class AQMPConnection():
    def __init__(self):
        self.connection = None
        self.channel = None
        self.queues = {}
        self.loop = asyncio.new_event_loop()

    async def setupAQMP(self):
        self.connection = await aio_pika.connect_robust("amqp://guest:guest@localhost/")
        self.channel = await self.connection.channel()
    
    async def initializeQueue(self, queueName):
        self.queues[queueName] = await self.channel.declare_queue(queueName)

    async def cleanUpConnection(self):
        await self.connection.close()