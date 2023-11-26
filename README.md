# Parallex
<img width="278" alt="Screenshot 2023-09-30 at 3 33 47 PM" src="https://github.com/vbala29/Parallex/assets/56012430/2b17fc5a-a84a-425a-9cd8-29fc8216f0de">

# How to Use
**Set up your python environment and install required dependencies**
```
conda env create -f environment.yml
conda activate parallex
```

**Using RabbitMQ for local testing**

*Mac*
```
brew install rabbitmq
brew services start rabbitmq
brew services stop rabbitmq
brew services restart rabbitmq
```

Enable command line inspection
```
rabbitmq-plugins enable rabbitmq_management
```

Command line inspection
```
rabbitmqctl list_queues
rabbitmqadmin get queue=<name> count=<int>
```

*Windows*
```
TBD
```


**Set up ipinfo API access authorization**
1. Create account at https://ipinfo.io/signup
2. Go to token tab on left, and copy the token.
3. Go to repository and create a folder called "access_tokens" in root directory.
4. Then create a file called "ipinfo" and paste this access token from step 2 into the file.

**Build Required Files/Protos**
Run build.sh from Parallex/ directory

**Run Command Node**
Run start_command_node.sh from command directory

**Run Provider Daemon**
Run run_daemon.sh from provider directory


# Miscellaneous
**What to do to update requirements for this project**

```conda env export > environment.yml```

**Format Style of Files**

Run from a dir with Python files to format all Python files according to google style guide

```yapf --in-place --recursive --style="{based_on_style: google}" *.py```


# Tools Used

**Ray.io** For job definition and paralellization https://www.ray.io

**gRPC** For node communication https://grpc.io

**ident.me** For public IP address https://api.ident.me

**psutil** For system metrics https://psutil.readthedocs.io/en/latest/#

**ipinfo** For IP geolocation https://ipinfo.io

