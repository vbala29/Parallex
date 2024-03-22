#!/usr/bin/env python3

import argparse
import json
import os

parser = argparse.ArgumentParser(description='Cluster configuration script')

parser.add_argument('-i', '--install_dependencies', action='store_true', help='reinstall code, broker, and db dependencies')

args = parser.parse_args()

json_config = "config/config.json"

with open(json_config, 'r') as file:
    data = json.load(file)

def run_script(script, host, scriptArg=None):
    if host == command_server:
        # Debian Linux
        user = "admin"
    else:
        # AMI Linux
        user = "ec2-user"

    os.system(f"scp -i Parallex-prod.pem scripts/{script} {user}@{host}:~")
    if script == "install_command_server.sh":
        os.system(f"scp -i Parallex-prod.pem access_tokens/ipinfo {user}@{host}:~")
    if script == "install_mongodb.sh":
        os.system(f"scp -i Parallex-prod.pem scripts/amzn23-mongo.yum {user}@{host}:~")
    os.system(f"ssh -i Parallex-prod.pem {user}@{host} \"chmod +x {script}\"")
    os.system(f"ssh -i Parallex-prod.pem {user}@{host} \"source {script} {scriptArg}\"")

def install_git_redhat(host):
    if not args.install_dependencies:
        return

    print("Installing git on " + host)
    run_script("install_git_redhat.sh", host)

def install_git_debian(host):
    if not args.install_dependencies:
        return

    print("Installing git on " + host)
    run_script("install_git_debian.sh", host)


def install_conda(host):
    if not args.install_dependencies:
        return

    print("Installing conda on " + host)
    run_script("install_conda.sh", host)


def install_command_server(host):
    if not args.install_dependencies:
        return

    print("Installing command server code on " + host)
    run_script("install_command_server.sh", host)

def install_ui_frontend_backend(host):
    if not args.install_dependencies:
        return

    print("Installing ui frontend/backend code on " + host)
    run_script("install_ui_frontend_backend.sh", host)

def install_mongodb(host):
    if not args.install_dependencies:
        return

    print("Installing mongodb on " + host)
    run_script("install_mongodb.sh", host)

def install_rabbitmq(host):
    if not args.install_dependencies:
        return

    print("Installing rabbitmq on " + host)
    run_script("install_rabbitmq.sh", host)

def run_service(service_name, host, scriptArg=None):
    print(f"*** Running {service_name} on {host} ***")

    if service_name == "command_server":
        install_git_debian(host)
        install_conda(host)
        install_command_server(host)
    if service_name == "web_backend_server":
        install_git_redhat(host)
        install_ui_frontend_backend(host)
        install_mongodb(host)
    if service_name == "rabbitmq_broker":
        # Will be on same machine as command server
        install_rabbitmq(host)

    run_script(f"run_{service_name}.sh", host, scriptArg)
    print("*** ***")

command_server = data["ip_addresses"]['command_server']
rabbitmq_broker = data["ip_addresses"]['rabbitmq_broker']
web_backend_server = data["ip_addresses"]['web_backend_server']

# run_service("rabbitmq_broker", rabbitmq_broker)
run_service("command_server", command_server)
run_service("web_backend_server", web_backend_server)
run_service("web_frontend", web_backend_server)
