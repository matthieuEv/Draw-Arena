FROM php:8.2-fpm

RUN apt-get update \
    && apt-get install -y --no-install-recommends libcurl4-openssl-dev git unzip \
    && docker-php-ext-install pdo_mysql curl fileinfo \
    && apt-get purge -y --auto-remove libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/* \
    && echo "cgi.fix_pathinfo=1" >> /usr/local/etc/php/php.ini \
    && echo "upload_max_filesize=8M" >> /usr/local/etc/php/php.ini \
    && echo "post_max_size=8M" >> /usr/local/etc/php/php.ini

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html
EXPOSE 9000

# Copy composer files first for better caching
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy application code
COPY . .
RUN composer dump-autoload --optimize
