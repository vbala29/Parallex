# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: daemon.proto
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor.FileDescriptor(
  name='daemon.proto',
  package='metrics',
  syntax='proto3',
  serialized_options=None,
  create_key=_descriptor._internal_create_key,
  serialized_pb=b'\n\x0c\x64\x61\x65mon.proto\x12\x07metrics\"e\n\rStaticMetrics\x12\x13\n\x0b\x43PUNumCores\x18\x01 \x01(\x05\x12\x0f\n\x07\x43PUName\x18\x02 \x01(\t\x12\x0e\n\x06MiBRam\x18\x03 \x01(\x02\x12\x10\n\x08\x63lientIP\x18\x04 \x01(\t\x12\x0c\n\x04uuid\x18\x05 \x01(\t\"W\n\x0e\x44ynamicMetrics\x12\x10\n\x08\x43PUUsage\x18\x01 \x01(\x02\x12\x13\n\x0bMiBRamUsage\x18\x02 \x01(\x02\x12\x10\n\x08\x63lientIP\x18\x03 \x01(\t\x12\x0c\n\x04uuid\x18\x04 \x01(\t\"\x07\n\x05\x45mpty2\x89\x01\n\x07Metrics\x12=\n\x11SendStaticMetrics\x12\x16.metrics.StaticMetrics\x1a\x0e.metrics.Empty\"\x00\x12?\n\x12SendDynamicMetrics\x12\x17.metrics.DynamicMetrics\x1a\x0e.metrics.Empty\"\x00\x62\x06proto3'
)




_STATICMETRICS = _descriptor.Descriptor(
  name='StaticMetrics',
  full_name='metrics.StaticMetrics',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='CPUNumCores', full_name='metrics.StaticMetrics.CPUNumCores', index=0,
      number=1, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='CPUName', full_name='metrics.StaticMetrics.CPUName', index=1,
      number=2, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='MiBRam', full_name='metrics.StaticMetrics.MiBRam', index=2,
      number=3, type=2, cpp_type=6, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='clientIP', full_name='metrics.StaticMetrics.clientIP', index=3,
      number=4, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='uuid', full_name='metrics.StaticMetrics.uuid', index=4,
      number=5, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=25,
  serialized_end=126,
)


_DYNAMICMETRICS = _descriptor.Descriptor(
  name='DynamicMetrics',
  full_name='metrics.DynamicMetrics',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='CPUUsage', full_name='metrics.DynamicMetrics.CPUUsage', index=0,
      number=1, type=2, cpp_type=6, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='MiBRamUsage', full_name='metrics.DynamicMetrics.MiBRamUsage', index=1,
      number=2, type=2, cpp_type=6, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='clientIP', full_name='metrics.DynamicMetrics.clientIP', index=2,
      number=3, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='uuid', full_name='metrics.DynamicMetrics.uuid', index=3,
      number=4, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=128,
  serialized_end=215,
)


_EMPTY = _descriptor.Descriptor(
  name='Empty',
  full_name='metrics.Empty',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=217,
  serialized_end=224,
)

DESCRIPTOR.message_types_by_name['StaticMetrics'] = _STATICMETRICS
DESCRIPTOR.message_types_by_name['DynamicMetrics'] = _DYNAMICMETRICS
DESCRIPTOR.message_types_by_name['Empty'] = _EMPTY
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

StaticMetrics = _reflection.GeneratedProtocolMessageType('StaticMetrics', (_message.Message,), {
  'DESCRIPTOR' : _STATICMETRICS,
  '__module__' : 'daemon_pb2'
  # @@protoc_insertion_point(class_scope:metrics.StaticMetrics)
  })
_sym_db.RegisterMessage(StaticMetrics)

DynamicMetrics = _reflection.GeneratedProtocolMessageType('DynamicMetrics', (_message.Message,), {
  'DESCRIPTOR' : _DYNAMICMETRICS,
  '__module__' : 'daemon_pb2'
  # @@protoc_insertion_point(class_scope:metrics.DynamicMetrics)
  })
_sym_db.RegisterMessage(DynamicMetrics)

Empty = _reflection.GeneratedProtocolMessageType('Empty', (_message.Message,), {
  'DESCRIPTOR' : _EMPTY,
  '__module__' : 'daemon_pb2'
  # @@protoc_insertion_point(class_scope:metrics.Empty)
  })
_sym_db.RegisterMessage(Empty)



_METRICS = _descriptor.ServiceDescriptor(
  name='Metrics',
  full_name='metrics.Metrics',
  file=DESCRIPTOR,
  index=0,
  serialized_options=None,
  create_key=_descriptor._internal_create_key,
  serialized_start=227,
  serialized_end=364,
  methods=[
  _descriptor.MethodDescriptor(
    name='SendStaticMetrics',
    full_name='metrics.Metrics.SendStaticMetrics',
    index=0,
    containing_service=None,
    input_type=_STATICMETRICS,
    output_type=_EMPTY,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
  _descriptor.MethodDescriptor(
    name='SendDynamicMetrics',
    full_name='metrics.Metrics.SendDynamicMetrics',
    index=1,
    containing_service=None,
    input_type=_DYNAMICMETRICS,
    output_type=_EMPTY,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
])
_sym_db.RegisterServiceDescriptor(_METRICS)

DESCRIPTOR.services_by_name['Metrics'] = _METRICS

# @@protoc_insertion_point(module_scope)
