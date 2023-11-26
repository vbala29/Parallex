from aqmp_tools.AQMPConnection import AQMPConnection


class AQMPConsumerConnection(AQMPConnection):
    def __init__(self):
        super().__init__()

    async def receive_messages(self, queueName, callback):
        while True:
            await self.queues[queueName].consume(callback)
