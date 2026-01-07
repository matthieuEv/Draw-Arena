#!/bin/bash
# Configure nginx for proper routing

cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 8080;
    listen [::]:8080;
    root /home/site/wwwroot;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
EOF

service nginx reload
