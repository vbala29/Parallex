# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: daemon.proto
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0c\x64\x61\x65mon.proto\x12\x07metrics\"e\n\rStaticMetrics\x12\x13\n\x0b\x43PUNumCores\x18\x01 \x01(\x05\x12\x0f\n\x07\x43PUName\x18\x02 \x01(\t\x12\x0e\n\x06MiBRam\x18\x03 \x01(\x02\x12\x10\n\x08\x63lientIP\x18\x04 \x01(\t\x12\x0c\n\x04uuid\x18\x05 \x01(\t\"W\n\x0e\x44ynamicMetrics\x12\x10\n\x08\x43PUUsage\x18\x01 \x01(\x02\x12\x13\n\x0bMiBRamUsage\x18\x02 \x01(\x02\x12\x10\n\x08\x63lientIP\x18\x03 \x01(\t\x12\x0c\n\x04uuid\x18\x04 \x01(\t\"\x07\n\x05\x45mpty2\x89\x01\n\x07Metrics\x12=\n\x11SendStaticMetrics\x12\x16.metrics.StaticMetrics\x1a\x0e.metrics.Empty\"\x00\x12?\n\x12SendDynamicMetrics\x12\x17.metrics.DynamicMetrics\x1a\x0e.metrics.Empty\"\x00\x62\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'daemon_pb2', _globals)
if _descriptor._USE_C_DESCRIPTORS == False:
  DESCRIPTOR._options = None
  _globals['_STATICMETRICS']._serialized_start=25
  _globals['_STATICMETRICS']._serialized_end=126
  _globals['_DYNAMICMETRICS']._serialized_start=128
  _globals['_DYNAMICMETRICS']._serialized_end=215
  _globals['_EMPTY']._serialized_start=217
  _globals['_EMPTY']._serialized_end=224
  _globals['_METRICS']._serialized_start=227
  _globals['_METRICS']._serialized_end=364
# @@protoc_insertion_point(module_scope)
