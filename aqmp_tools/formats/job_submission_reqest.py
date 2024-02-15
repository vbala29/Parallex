import json

"""
Message Format: job_submission
TYPE: JSON
keys: type [string]
"""

class job_submission:
    def __init__(self, job_name, head_node_url):
        self.job_name = job_name
        self.head_node_url = head_node_url

    def dumps(self):
        return json.dumps({"job_name" : self.job_name,
                            "head_node_url" : self.head_node_url})