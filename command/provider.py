import time

class Provider():

    def __init__(self, ip, uuid):
        self.ip = ip
        self.last_seen = time.time()
        self.static_metrics = {}
        self.dynamic_metrics = {}
        self.uuid = uuid

    def update_static_metrics(self, static_metrics):
        self.static_metrics = static_metrics
        self.last_seen = time.time()

    def update_dynamic_metrics(self, dynamic_metrics):
        self.dynamic_metrics = dynamic_metrics
        self.last_seen = time.time()

    def parse_location(self, location):
        split = location.split(",")
        self.lat = split[0]
        self.lon = split[1]

    def __str__(self):
        return "Provider uuid: {}, ip: {}, lat: {}, lon: {}".format(
            self.uuid, self.ip, self.lat, self.lon)

    def __repr__(self):
        return "Provider uuid: {}, ip: {}, lat: {}, lon: {}".format(
            self.uuid, self.ip, self.lat, self.lon)

class ProviderCandidate():

    def __init__(self, provider, distance, ramCountAvailable,
                 cpuCountAvailable):
        self.provider = provider
        self.distance = distance
        self.ramCountAvailable = ramCountAvailable
        self.cpuCountAvailable = cpuCountAvailable

    def __lt__(self, other):
        if self.cpuCountAvailable < other.cpuCountAvailable:
            return True
        elif self.cpuCountAvailable == other.cpuCountAvailable:
            if self.ramCountAvailable < other.ramCountAvailable:
                return True
            elif self.ramCountAvailable == other.ramCountAvailable:
                if self.distance < other.distance:
                    return True
                else:
                    return False
            else:
                return False
        else:
            return False

    def __eq__(self, other):
        if self.cpuCountAvailable == other.cpuCountAvailable and self.ramCountAvailable == other.ramCountAvailable and self.distance == other.distance:
            return True
        else:
            return False
