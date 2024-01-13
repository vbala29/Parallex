sh -c "sleep 1; echo parallex" | script /dev/null -qc 'su -c "usermod -aG sudo parallexprovider" - root' | tail -n +2

