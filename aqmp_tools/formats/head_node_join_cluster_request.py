import json
"""
Message Format: head_node_join_cluster_request
TYPE: JSON
keys: type [string]
"""

class head_node_join_cluster_request():
    type = "head_node_join_cluster_request"

    def __init__(self, infoDict):
        self.fields = infoDict

    @staticmethod
    def loadFromJson(infoDict):
        return head_node_join_cluster_request(infoDict)

    @staticmethod
    def createNewRequest():
        return head_node_join_cluster_request(
            json.dumps({"type": head_node_join_cluster_request.type}))

    @staticmethod
    def getTypeStr():
        return head_node_join_cluster_request.type

    def dumps(self):
        return json.dumps(self.fields)