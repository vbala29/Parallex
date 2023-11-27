from aqmp_tools.AQMPConnection import AQMPConnection


class AQMPConsumerConnection(AQMPConnection):
    async def receive_messages(self, queueName, callback):
        while True:
            await self.queues[queueName].consume(callback)
