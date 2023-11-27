USER=test
PASS=test
sudo rabbitmqctl add_user $USER $PASS
sudo rabbitmqctl set_user_tags $USER administrator
sudo rabbitmqctl set_permissions -p / $USER ".*" ".*" ".*"
