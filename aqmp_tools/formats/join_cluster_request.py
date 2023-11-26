import json

"""
Message Format: join_cluster_request
TYPE: JSON
keys: type [string], headIP [string]
"""

class join_cluster_request:
    def __init__(self, ip):
        self.ip = ip
    
    def dump(self):
        return json.dumps({
            "type": "join_cluster_request",
            "headIP": self.ip
        })
    
